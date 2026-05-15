import { Hono } from 'hono'
import { z } from 'zod'
import { eq, asc } from 'drizzle-orm'
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
