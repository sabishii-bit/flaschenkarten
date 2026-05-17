import type { MiddlewareHandler } from 'hono'
import { eq, or } from 'drizzle-orm'
import { getCookie } from 'hono/cookie'
import { db } from '../db/index.js'
import { bannedIps } from '../db/schema.js'
import { getIp } from '../lib/getIp.js'

export const ipBan: MiddlewareHandler = async (c, next) => {
  const ip       = getIp(c)
  const cookieId = getCookie(c, 'fk_vid') ?? null

  try {
    const conditions = cookieId
      ? or(eq(bannedIps.ip, ip), eq(bannedIps.cookieId, cookieId))
      : eq(bannedIps.ip, ip)

    const [banned] = await db
      .select()
      .from(bannedIps)
      .where(conditions)
      .limit(1)

    if (banned) {
      return c.json({ error: 'Forbidden' }, 403)
    }
  } catch {
    // DB unavailable — skip ban check (fail-open)
  }

  await next()
}
