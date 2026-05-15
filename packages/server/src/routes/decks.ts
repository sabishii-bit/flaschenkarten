import { Hono } from 'hono'
import { z } from 'zod'
import { and, eq, lt, asc, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { decks, flashCards } from '../db/schema.js'
import { getIp } from '../lib/getIp.js'
import type { ApiResponse, Deck, DeckWithCards } from '@flaschenkarten/shared'

const CreateDeckBodySchema = z.object({
  title:       z.string().min(1).max(120),
  description: z.string().max(500).default(''),
  isPublic:    z.boolean().default(true),
  cards:       z.array(z.object({
    front: z.string().min(1),
    back:  z.string().min(1),
  })).min(1),
})

export const deckRoutes = new Hono()

const PAGE_SIZE = 12

// GET /api/decks — paginated public decks, cursor = createdAt of last seen item
deckRoutes.get('/', async (c) => {
  const cursor = c.req.query('cursor')   // ISO datetime string, optional
  const limit  = Math.min(Number(c.req.query('limit') ?? PAGE_SIZE), 50)

  const conditions = cursor
    ? and(eq(decks.isPublic, true), lt(decks.createdAt, new Date(cursor)))
    : eq(decks.isPublic, true)

  // Fetch one extra to know if a next page exists
  const rows = await db
    .select()
    .from(decks)
    .where(conditions)
    .orderBy(desc(decks.createdAt))
    .limit(limit + 1)

  const hasMore   = rows.length > limit
  const items     = hasMore ? rows.slice(0, limit) : rows
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null

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

  const { title, description, isPublic, cards: cardEntries } = parsed.data

  const deck = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(decks)
      .values({ title, description, isPublic, authorId })
      .returning()

    await tx.insert(flashCards).values(
      cardEntries.map((card, position) => ({
        deckId: created.id,
        front:  card.front,
        back:   card.back,
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

  const { title, description, isPublic, cards: cardEntries } = parsed.data

  const deck = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(decks)
      .set({ title, description, isPublic })
      .where(eq(decks.id, id))
      .returning()

    await tx.delete(flashCards).where(eq(flashCards.deckId, id))

    await tx.insert(flashCards).values(
      cardEntries.map((card, position) => ({
        deckId: id,
        front:  card.front,
        back:   card.back,
        position,
      })),
    )

    return updated
  })

  return c.json<ApiResponse<Deck>>({ data: deck as Deck })
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
