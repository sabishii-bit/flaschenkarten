import type { Context } from 'hono'
import { getConnInfo } from '@hono/node-server/conninfo'

/**
 * Extract the real client IP from the request.
 * Prefers X-Forwarded-For (set by reverse proxies / Cloudflare)
 * and falls back to the raw TCP connection address.
 */
export function getIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for')
  if (forwarded) {
    // X-Forwarded-For may be a comma-separated list; leftmost is the originating client
    return forwarded.split(',')[0].trim()
  }

  const info = getConnInfo(c)
  return info.remote.address ?? 'unknown'
}
