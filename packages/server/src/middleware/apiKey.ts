import type { MiddlewareHandler } from 'hono'
import type { ApiResponse } from '@flaschenkarten/shared'

export const apiKey: MiddlewareHandler = async (c, next) => {
  const expected = process.env.API_KEY
  if (!expected) return next()

  const provided = c.req.header('X-Api-Key')
  if (provided !== expected) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Unauthorized' },
      401,
    )
  }

  return next()
}
