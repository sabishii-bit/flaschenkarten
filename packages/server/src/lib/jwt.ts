import { createHmac, timingSafeEqual } from 'node:crypto'

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

const HEADER = b64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))

export function signJwt(payload: Record<string, unknown>, secret: string): string {
  const body = b64url(Buffer.from(JSON.stringify(payload)))
  const sig  = b64url(createHmac('sha256', secret).update(`${HEADER}.${body}`).digest())
  return `${HEADER}.${body}.${sig}`
}

export function verifyJwt(token: string, secret: string): Record<string, unknown> {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Malformed token')
  const [header, payload, sig] = parts

  const expected = b64url(createHmac('sha256', secret).update(`${header}.${payload}`).digest())
  const a = Buffer.from(sig,      'ascii')
  const b = Buffer.from(expected, 'ascii')
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error('Invalid signature')

  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  if (typeof data.exp === 'number' && data.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired')
  }
  return data
}
