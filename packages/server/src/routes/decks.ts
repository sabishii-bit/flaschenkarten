import { Hono } from 'hono'
import { z } from 'zod'
import { eq, asc, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { decks, flashCards } from '../db/schema.js'
import { getIp } from '../lib/getIp.js'
import type { ApiResponse, Deck, DeckWithCards } from '@flaschenkarten/shared'

const CreateDeckBodySchema = z.object({
  title:          z.string().min(1).max(120),
  description:    z.string().max(500).default(''),
  isPublic:       z.boolean().default(true),
  requiresAnswer: z.boolean().default(false),
  hashtags:       z.array(z.string().min(1)).min(0).max(20).default([]),
  cards:          z.array(z.object({
    front:           z.string().min(1),
    back:            z.string().min(1),
    acceptedAnswers: z.array(z.string()).default([]),
  })).min(1),
})

export const deckRoutes = new Hono()

const PAGE_SIZE = 12

// GET /api/decks — paginated public decks, ranked by engagement score
// score = (likes × 2) + (favorites × 3) - (dislikes × 1)
// cursor = "${score}~${id}" (opaque, keyset pagination)
deckRoutes.get('/', async (c) => {
  const cursor = c.req.query('cursor')
  const limit  = Math.min(Number(c.req.query('limit') ?? PAGE_SIZE), 50)

  let lastScore: number | null = null
  let lastId: string | null    = null
  if (cursor) {
    const sep = cursor.indexOf('~')
    lastScore = Number(cursor.slice(0, sep))
    lastId    = cursor.slice(sep + 1)
  }

  const cursorClause = lastScore !== null && lastId !== null
    ? sql`AND (score < ${lastScore} OR (score = ${lastScore} AND id < ${lastId}))`
    : sql``

  type ScoredRow = {
    id: string; author_id: string | null; title: string; description: string
    is_public: boolean; requires_answer: boolean; hashtags: string[]
    created_at: Date; updated_at: Date; score: number
  }

  const rows = (await db.execute(sql`
    WITH scored AS (
      SELECT
        d.id, d.author_id, d.title, d.description, d.is_public, d.requires_answer,
        d.hashtags, d.created_at, d.updated_at,
        COALESCE((
          SELECT SUM(CASE WHEN vote = 'like' THEN 2 ELSE -1 END)
          FROM deck_votes WHERE deck_id = d.id
        ), 0) +
        COALESCE((
          SELECT COUNT(*) * 3
          FROM deck_favorites WHERE deck_id = d.id
        ), 0) AS score
      FROM decks d
      WHERE d.is_public = true
    )
    SELECT * FROM scored
    WHERE true ${cursorClause}
    ORDER BY score DESC, id DESC
    LIMIT ${limit + 1}
  `)) as ScoredRow[]

  const hasMore    = rows.length > limit
  const page       = hasMore ? rows.slice(0, limit) : rows
  const nextCursor = hasMore
    ? `${page[page.length - 1].score}~${page[page.length - 1].id}`
    : null

  const items = page.map(({ score: _s, author_id, is_public, requires_answer, created_at, updated_at, ...rest }) => ({
    ...rest,
    authorId:       author_id,
    isPublic:       is_public,
    requiresAnswer: requires_answer,
    createdAt:      created_at instanceof Date ? created_at.toISOString() : created_at,
    updatedAt:      updated_at instanceof Date ? updated_at.toISOString() : updated_at,
  }))

  return c.json<ApiResponse<{ decks: Deck[]; nextCursor: string | null }>>({
    data: { decks: items as Deck[], nextCursor },
  })
})

// POST /api/decks — create a deck with cards
deckRoutes.post('/', async (c) => {
  const authorId = getIp(c)

  const parsed = CreateDeckBodySchema.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Invalid request body' },
      400,
    )
  }

  const { title, description, isPublic, requiresAnswer, hashtags, cards: cardEntries } = parsed.data

  const deck = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(decks)
      .values({ title, description, isPublic, requiresAnswer, hashtags, authorId })
      .returning()

    await tx.insert(flashCards).values(
      cardEntries.map((card, position) => ({
        deckId:          created.id,
        front:           card.front,
        back:            card.back,
        acceptedAnswers: card.acceptedAnswers,
        position,
      })),
    )

    return created
  })

  return c.json<ApiResponse<Deck>>({ data: deck as Deck }, 201)
})

// GET /api/decks/mine — list decks belonging to the requesting user
deckRoutes.get('/mine', async (c) => {
  const authorId = getIp(c)

  const rows = await db
    .select()
    .from(decks)
    .where(eq(decks.authorId, authorId))

  return c.json<ApiResponse<Deck[]>>({ data: rows as Deck[] })
})

// PUT /api/decks/:id — replace deck metadata and all cards (owner only)
deckRoutes.put('/:id', async (c) => {
  const id       = c.req.param('id')
  const authorId = getIp(c)

  const [existing] = await db.select().from(decks).where(eq(decks.id, id))
  if (!existing) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Deck not found' },
      404,
    )
  }
  if (existing.authorId !== authorId) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Forbidden' },
      403,
    )
  }

  const parsed = CreateDeckBodySchema.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Invalid request body' },
      400,
    )
  }

  const { title, description, isPublic, requiresAnswer, hashtags, cards: cardEntries } = parsed.data

  const deck = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(decks)
      .set({ title, description, isPublic, requiresAnswer, hashtags })
      .where(eq(decks.id, id))
      .returning()

    await tx.delete(flashCards).where(eq(flashCards.deckId, id))

    await tx.insert(flashCards).values(
      cardEntries.map((card, position) => ({
        deckId:          id,
        front:           card.front,
        back:            card.back,
        acceptedAnswers: card.acceptedAnswers,
        position,
      })),
    )

    return updated
  })

  return c.json<ApiResponse<Deck>>({ data: deck as Deck })
})

// DELETE /api/decks/:id — delete a deck (owner only)
deckRoutes.delete('/:id', async (c) => {
  const id       = c.req.param('id')
  const authorId = getIp(c)

  const [existing] = await db.select().from(decks).where(eq(decks.id, id))
  if (!existing) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Deck not found' },
      404,
    )
  }
  if (existing.authorId !== authorId) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Forbidden' },
      403,
    )
  }

  await db.delete(decks).where(eq(decks.id, id))

  return c.json<ApiResponse<{ id: string }>>({ data: { id } })
})

// GET /api/decks/:id — get a single deck with its cards
deckRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')

  const [deck] = await db.select().from(decks).where(eq(decks.id, id))
  if (!deck) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Deck not found' },
      404,
    )
  }

  const cards = await db
    .select()
    .from(flashCards)
    .where(eq(flashCards.deckId, id))
    .orderBy(asc(flashCards.position))

  return c.json<ApiResponse<DeckWithCards>>({
    data: { ...deck, cards } as DeckWithCards,
  })
})
