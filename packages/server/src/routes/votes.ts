import { Hono } from 'hono'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { deckVotes, decks } from '../db/schema.js'
import { getVisitorId } from '../lib/getVisitorId.js'
import { getIp } from '../lib/getIp.js'
import { log } from '../lib/logger.js'
import type { ApiResponse } from '@flaschenkarten/shared'

export interface VoteSummary {
  likes:    number
  dislikes: number
  myVote:   'like' | 'dislike' | null
}

export const voteRoutes = new Hono()

// GET /api/decks/:id/votes
voteRoutes.get('/:id/votes', async (c) => {
  const deckId  = c.req.param('id')
  const voterIp = getVisitorId(c)

  const [deck] = await db.select({ id: decks.id }).from(decks).where(eq(decks.id, deckId))
  if (!deck) {
    return c.json<ApiResponse<never>>({ data: undefined as never, error: 'Deck not found' }, 404)
  }

  const counts = await db
    .select({ vote: deckVotes.vote, count: sql<number>`count(*)::int` })
    .from(deckVotes)
    .where(eq(deckVotes.deckId, deckId))
    .groupBy(deckVotes.vote)

  const [existing] = await db
    .select({ vote: deckVotes.vote })
    .from(deckVotes)
    .where(and(eq(deckVotes.deckId, deckId), eq(deckVotes.voterIp, voterIp)))

  const summary: VoteSummary = {
    likes:    counts.find(r => r.vote === 'like')?.count    ?? 0,
    dislikes: counts.find(r => r.vote === 'dislike')?.count ?? 0,
    myVote:   (existing?.vote ?? null) as VoteSummary['myVote'],
  }

  return c.json<ApiResponse<VoteSummary>>({ data: summary })
})

// POST /api/decks/:id/votes  { vote: 'like' | 'dislike' }
// Sending the same vote again toggles it off (removes it)
voteRoutes.post('/:id/votes', async (c) => {
  const deckId  = c.req.param('id')
  const voterIp = getVisitorId(c)
  const { vote } = await c.req.json<{ vote: 'like' | 'dislike' }>()

  if (vote !== 'like' && vote !== 'dislike') {
    return c.json<ApiResponse<never>>({ data: undefined as never, error: 'Invalid vote' }, 400)
  }

  const [existing] = await db
    .select()
    .from(deckVotes)
    .where(and(eq(deckVotes.deckId, deckId), eq(deckVotes.voterIp, voterIp)))

  if (existing) {
    if (existing.vote === vote) {
      // Same vote — toggle off
      await db.delete(deckVotes).where(eq(deckVotes.id, existing.id))
    } else {
      // Switch vote
      await db.update(deckVotes).set({ vote }).where(eq(deckVotes.id, existing.id))
      log('vote_cast', voterIp, getIp(c), { deckId, vote })
    }
  } else {
    await db.insert(deckVotes).values({ deckId, voterIp, vote })
    log('vote_cast', voterIp, getIp(c), { deckId, vote })
  }

  // Return fresh counts
  const counts = await db
    .select({ vote: deckVotes.vote, count: sql<number>`count(*)::int` })
    .from(deckVotes)
    .where(eq(deckVotes.deckId, deckId))
    .groupBy(deckVotes.vote)

  const [updated] = await db
    .select({ vote: deckVotes.vote })
    .from(deckVotes)
    .where(and(eq(deckVotes.deckId, deckId), eq(deckVotes.voterIp, voterIp)))

  const summary: VoteSummary = {
    likes:    counts.find(r => r.vote === 'like')?.count    ?? 0,
    dislikes: counts.find(r => r.vote === 'dislike')?.count ?? 0,
    myVote:   (updated?.vote ?? null) as VoteSummary['myVote'],
  }

  return c.json<ApiResponse<VoteSummary>>({ data: summary })
})
