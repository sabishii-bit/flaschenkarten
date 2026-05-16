import { Hono } from 'hono'
import { z } from 'zod/v4'
import Anthropic from '@anthropic-ai/sdk'
import type { ApiResponse } from '@flaschenkarten/shared'

const app = new Hono()

const RequestSchema = z.object({
  prompt:    z.string().min(1).max(1000),
  cardCount: z.number().int().min(1).max(50).default(10),
})

const GeneratedDeckSchema = z.object({
  title:       z.string(),
  description: z.string(),
  cards:       z.array(z.object({ front: z.string(), back: z.string() })),
})

type GeneratedDeck = z.infer<typeof GeneratedDeckSchema>

const SYSTEM_PROMPT = `You are a flashcard deck generator. Given a topic or prompt and a card count, output ONLY a valid JSON object — no markdown, no explanation — in exactly this shape:
{
  "title": "<concise deck title, max 120 chars>",
  "description": "<one or two sentence description, max 500 chars>",
  "cards": [
    { "front": "<question or term>", "back": "<answer or definition>" }
  ]
}
Generate exactly the number of cards requested. Make cards clear, concise and educational.`

export const generateRoutes = app

app.post('/generate', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    const response: ApiResponse<never> = { data: undefined as never, error: 'Invalid request body' }
    return c.json(response, 400)
  }

  const { prompt, cardCount } = parsed.data
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    const response: ApiResponse<never> = { data: undefined as never, error: 'Anthropic API key not configured' }
    return c.json(response, 500)
  }

  const anthropic = new Anthropic({ apiKey })

  let raw: string
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Topic: ${prompt}\nCard count: ${cardCount}` },
      ],
    })
    const block = message.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
    raw = block.text
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'LLM request failed'
    const response: ApiResponse<never> = { data: undefined as never, error: `Generation failed: ${msg}` }
    return c.json(response, 500)
  }

  let deck: GeneratedDeck
  try {
    const json = JSON.parse(raw)
    const result = GeneratedDeckSchema.safeParse(json)
    if (!result.success) throw new Error('Response did not match expected shape')
    deck = result.data
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Parse error'
    const response: ApiResponse<never> = { data: undefined as never, error: `Failed to parse generated deck: ${msg}` }
    return c.json(response, 500)
  }

  const response: ApiResponse<GeneratedDeck> = { data: deck }
  return c.json(response)
})
