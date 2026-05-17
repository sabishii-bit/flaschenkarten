import type { Context, MiddlewareHandler } from 'hono'
import { verifyJwt } from '../lib/jwt.js'
import type { ApiResponse } from '@flaschenkarten/shared'

export function isAdmin(c: Context): boolean {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  const secret = process.env.JWT_SECRET
  if (!secret) return false
  try {
    verifyJwt(authHeader.slice(7), secret)
    return true
  } catch {
    return false
  }
}

export const requireAdmin: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Unauthorized' },
      401,
    )
  }

  const token  = authHeader.slice(7)
  const secret = process.env.JWT_SECRET
  if (!secret) {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Server misconfiguration' },
      500,
    )
  }

  try {
    verifyJwt(token, secret)
  } catch {
    return c.json<ApiResponse<never>>(
      { data: undefined as never, error: 'Unauthorized' },
      401,
    )
  }

  return next()
}
