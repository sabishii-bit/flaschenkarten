import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { ApiResponse } from '@flaschenkarten/shared'
import { deckRoutes } from './routes/decks.js'
import { voteRoutes } from './routes/votes.js'
import { favoriteRoutes } from './routes/favorites.js'
import { generateRoutes } from './routes/generate.js'
import { ipBan } from './middleware/ipBan.js'
import { apiKey } from './middleware/apiKey.js'
import { visitorId } from './middleware/visitorId.js'

const app = new Hono()
const PORT = Number(process.env.PORT ?? 3000)

app.use(cors({
  origin:       process.env.CORS_ORIGIN ?? '*',
  allowHeaders: ['Content-Type', 'X-Api-Key'],
  credentials:  true,
}))
app.use(apiKey)
app.use(ipBan)
app.use(visitorId)

app.get('/api/health', (c) => {
  const response: ApiResponse<{ status: string }> = {
    data: { status: 'ok' },
  }
  return c.json(response)
})

app.route('/api/decks', deckRoutes)
app.route('/api/decks', voteRoutes)
app.route('/api/favorites', favoriteRoutes)
app.route('/api/decks', favoriteRoutes)
app.route('/api', generateRoutes)

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
