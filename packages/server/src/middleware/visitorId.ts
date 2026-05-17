import type { MiddlewareHandler } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { getIp } from '../lib/getIp.js'
import { log } from '../lib/logger.js'

export const visitorId: MiddlewareHandler = async (c, next) => {
  let id = getCookie(c, 'fk_vid')
  const isNew = !id
  if (!id) {
    id = crypto.randomUUID()
    setCookie(c, 'fk_vid', id, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge:   60 * 60 * 24 * 365,
      path:     '/',
    })
  }
  c.set('visitorId', id)
  await next()
  if (isNew) {
    log('new_visitor', id, getIp(c))
  }
}
