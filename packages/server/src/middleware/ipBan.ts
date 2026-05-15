import type { MiddlewareHandler } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { bannedIps } from '../db/schema.js'
import { getIp } from '../lib/getIp.js'

export const ipBan: MiddlewareHandler = async (c, next) => {
  const ip = getIp(c)

  const [banned] = await db
    .select()
    .from(bannedIps)
    .where(eq(bannedIps.ip, ip))
    .limit(1)

  if (banned) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  await next()
}
