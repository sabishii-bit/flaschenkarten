import { Hono } from 'hono'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { deckFavorites, decks } from '../db/schema.js'
import { getIp } from '../lib/getIp.js'
import type { ApiResponse, Deck } from '@flaschenkarten/shared'

export const favoriteRoutes = new Hono()

// GET /api/decks/:id/favorite — is this deck favorited by the caller?
favoriteRoutes.get('/:id/favorite', async (c) => {
  const deckId = c.req.param('id')
  const userIp = getIp(c)

  const [row] = await db
    .select()
    .from(deckFavorites)
    .where(and(eq(deckFavorites.deckId, deckId), eq(deckFavorites.userIp, userIp)))

  return c.json<ApiResponse<{ favorited: boolean }>>({ data: { favorited: !!row } })
})

// POST /api/decks/:id/favorite — toggle favorite
favoriteRoutes.post('/:id/favorite', async (c) => {
  const deckId = c.req.param('id')
  const userIp = getIp(c)

  const [existing] = await db
    .select()
    .from(deckFavorites)
    .where(and(eq(deckFavorites.deckId, deckId), eq(deckFavorites.userIp, userIp)))

  if (existing) {
    await db.delete(deckFavorites).where(eq(deckFavorites.id, existing.id))
    return c.json<ApiResponse<{ favorited: boolean }>>({ data: { favorited: false } })
  }

  await db.insert(deckFavorites).values({ deckId, userIp })
  return c.json<ApiResponse<{ favorited: boolean }>>({ data: { favorited: true } })
})

// GET /api/favorites — list all favorited decks for the caller
favoriteRoutes.get('/', async (c) => {
  const userIp = getIp(c)

  const rows = await db
    .select({ deck: decks })
    .from(deckFavorites)
    .innerJoin(decks, eq(deckFavorites.deckId, decks.id))
    .where(eq(deckFavorites.userIp, userIp))
    .orderBy(deckFavorites.createdAt)

  return c.json<ApiResponse<Deck[]>>({ data: rows.map(r => r.deck) as Deck[] })
})
