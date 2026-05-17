import { db } from '../db/index.js'
import { serverLogs } from '../db/schema.js'

export type LogEvent =
  | 'new_visitor'
  | 'deck_created'
  | 'deck_deleted'
  | 'deck_generated'
  | 'vote_cast'
  | 'favorite_added'
  | 'favorite_removed'
  | 'admin_login'
  | 'ban_issued'
  | 'ban_removed'

export async function log(
  event:     LogEvent,
  visitorId: string | null,
  ip:        string | null,
  details?:  Record<string, unknown>,
): Promise<void> {
  try {
    await db.insert(serverLogs).values({
      event,
      visitorId,
      ip,
      details: details ? JSON.stringify(details) : null,
    })
  } catch {
    // Never let logging errors break the request
  }
}
