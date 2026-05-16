import type { Context } from 'hono'
import { getIp } from './getIp.js'

export function getVisitorId(c: Context): string {
  return (c.get('visitorId') as string | undefined) ?? getIp(c)
}
