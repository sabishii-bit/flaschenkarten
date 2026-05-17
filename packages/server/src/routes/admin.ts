import { Hono } from 'hono'
import { z } from 'zod'
import { signJwt } from '../lib/jwt.js'
import { desc, eq, and, gte, lt, or, ilike, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { serverLogs, bannedIps } from '../db/schema.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { log } from '../lib/logger.js'
import { getIp } from '../lib/getIp.js'
import type { ApiResponse } from '@flaschenkarten/shared'

const LoginBodySchema = z.object({
  password: z.string().min(1),
})

export const adminRoutes = new Hono()

adminRoutes.post('/login', async (c) => {
  const secret   = process.env.JWT_SECRET
  const expected = process.env.ADMIN_PASSWORD

  if (!secret || !expected) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Server misconfiguration' },
      500,
    )
  }

  const parsed = LoginBodySchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Invalid request body' },
      400,
    )
  }

  if (parsed.data.password !== expected) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Invalid password' },
      401,
    )
  }

  const token = signJwt(
    {
      sub: 'admin',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    },
    secret,
  )

  log('admin_login', null, getIp(c))
  return c.json<ApiResponse<{ token: string }>>({ data: { token } })
})

export type ServerLog = {
  id: string
  event: string
  visitorId: string | null
  ip: string | null
  details: string | null
  createdAt: string
}

const LOG_RETENTION_DAYS = 60

export async function purgeOldLogs() {
  const cutoff = new Date(Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000)
  await db.delete(serverLogs).where(lt(serverLogs.createdAt, cutoff))
}

// Reverse map so "Deck Created" → "deck_created", "Vote Cast" → "vote_cast", etc.
const LABEL_TO_EVENT: Record<string, string> = {
  'new visitor':      'new_visitor',
  'deck created':     'deck_created',
  'deck deleted':     'deck_deleted',
  'deck generated':   'deck_generated',
  'vote cast':        'vote_cast',
  'favorited':        'favorite_added',
  'unfavorited':      'favorite_removed',
  'admin login':      'admin_login',
  'ban issued':       'ban_issued',
  'ban removed':      'ban_removed',
}

adminRoutes.get('/logs', requireAdmin, async (c) => {
  const limit  = Math.min(Number(c.req.query('limit') ?? 100), 500)
  const offset = Number(c.req.query('offset') ?? 0)
  const q      = c.req.query('q')?.trim() ?? ''
  const cutoff = new Date(Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000)

  const recencyFilter = gte(serverLogs.createdAt, cutoff)

  // Split into tokens and AND them — each token must match at least one column.
  // For event matching, also try with spaces replaced by underscores so
  // "deck created" matches "deck_created", and do a full-label reverse lookup
  // so "Deck Created" or "Vote Cast" resolve to the exact event key.
  const tokens = q ? q.split(/\s+/).filter(Boolean) : []
  const tokenFilters = tokens.map(token => {
    const eventKey = LABEL_TO_EVENT[token.toLowerCase()]
    return or(
      ilike(serverLogs.event,     `%${token.replace(/\s+/g, '_')}%`),
      ilike(serverLogs.ip,        `%${token}%`),
      ilike(serverLogs.visitorId, `%${token}%`),
      sql`to_char(${serverLogs.createdAt}, 'FMMM/FMDD/YYYY HH12:MI:SS AM') ILIKE ${`%${token}%`}`,
      ...(eventKey ? [eq(serverLogs.event, eventKey)] : []),
    )
  })

  const rows = await db
    .select()
    .from(serverLogs)
    .where(tokenFilters.length ? and(recencyFilter, ...tokenFilters) : recencyFilter)
    .orderBy(desc(serverLogs.createdAt))
    .limit(limit)
    .offset(offset)

  const logs: ServerLog[] = rows.map(r => ({
    id:        r.id,
    event:     r.event,
    visitorId: r.visitorId,
    ip:        r.ip,
    details:   r.details,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  }))

  return c.json<ApiResponse<ServerLog[]>>({ data: logs })
})

// ── Bans ─────────────────────────────────────────────────────────────────────

export type BannedEntry = {
  ip:        string
  cookieId:  string | null
  reason:    string
  createdAt: string
}

const BanBodySchema = z.object({
  ip:     z.string().min(1),
  reason: z.string().default(''),
})

adminRoutes.get('/bans', requireAdmin, async (c) => {
  const rows = await db
    .select()
    .from(bannedIps)
    .orderBy(desc(bannedIps.createdAt))

  const bans: BannedEntry[] = rows.map(r => ({
    ip:        r.ip,
    cookieId:  r.cookieId,
    reason:    r.reason,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  }))

  return c.json<ApiResponse<BannedEntry[]>>({ data: bans })
})

adminRoutes.post('/bans', requireAdmin, async (c) => {
  const parsed = BanBodySchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Invalid request body' },
      400,
    )
  }

  const { ip, reason } = parsed.data

  if (ip === getIp(c)) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Cannot ban yourself' },
      400,
    )
  }

  // Find cookie UUID from the most recent new_visitor log for this IP
  const [logEntry] = await db
    .select({ visitorId: serverLogs.visitorId })
    .from(serverLogs)
    .where(and(eq(serverLogs.ip, ip), eq(serverLogs.event, 'new_visitor')))
    .orderBy(desc(serverLogs.createdAt))
    .limit(1)

  const cookieId = logEntry?.visitorId ?? null

  await db
    .insert(bannedIps)
    .values({ ip, cookieId, reason })
    .onConflictDoUpdate({
      target: bannedIps.ip,
      set:    { cookieId, reason, createdAt: new Date() },
    })

  log('ban_issued', null, getIp(c), { bannedIp: ip, cookieId, reason })

  return c.json<ApiResponse<{ ip: string; cookieId: string | null }>>({
    data: { ip, cookieId },
  })
})

adminRoutes.delete('/bans/:ip', requireAdmin, async (c) => {
  const ip = c.req.param('ip')

  await db.delete(bannedIps).where(eq(bannedIps.ip, ip))

  log('ban_removed', null, getIp(c), { unbannedIp: ip })

  return c.json<ApiResponse<{ ip: string }>>({ data: { ip } })
})
