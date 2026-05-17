import { Hono } from 'hono'
import { z } from 'zod/v4'
import Anthropic from '@anthropic-ai/sdk'
import type { ApiResponse } from '@flaschenkarten/shared'

const app = new Hono()

const RequestSchema = z.object({
  prompt:    z.string().min(1).max(1000),
  cardCount: z.number().int().min(1).max(50).optional(),
})

const GeneratedDeckSchema = z.object({
  title:          z.string(),
  description:    z.string(),
  requiresAnswer: z.boolean(),
  hashtags:       z.array(z.string()).min(3).max(20),
  cards:          z.array(z.object({
    front:           z.string(),
    back:            z.string(),
    acceptedAnswers: z.array(z.string()),
  })).min(1).max(50),
})

type GeneratedDeck = z.infer<typeof GeneratedDeckSchema>

const DECK_TOOL: Anthropic.Tool = {
  name:        'create_deck',
  description: 'Output the generated flashcard deck as structured data.',
  input_schema: {
    type: 'object',
    properties: {
      title: {
        type:        'string',
        description: 'Concise deck title, max 120 characters.',
      },
      description: {
        type:        'string',
        description: 'One or two sentence description of the deck, max 500 characters.',
      },
      requiresAnswer: {
        type:        'boolean',
        description: 'True if the topic naturally suits typed-answer testing (vocabulary, definitions, formulas, translations). False for conceptual or open-ended topics.',
      },
      hashtags: {
        type:        'array',
        items:       { type: 'string' },
        description: '3 to 20 lowercase hashtags relevant to the topic, each starting with #, containing only letters, digits, or underscores.',
      },
      cards: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            front:           { type: 'string', description: 'Question or term shown on the front of the card.' },
            back:            { type: 'string', description: 'Primary answer or definition shown on the back.' },
            acceptedAnswers: {
              type:        'array',
              items:       { type: 'string' },
              description: 'Non-empty array with the primary answer and any genuine alternatives (synonyms, abbreviations, alternate spellings). Do not pad with near-duplicates.',
            },
          },
          required: ['front', 'back', 'acceptedAnswers'],
        },
        description: 'The flashcards in the deck.',
      },
    },
    required: ['title', 'description', 'requiresAnswer', 'hashtags', 'cards'],
  },
}

const SYSTEM_PROMPT = `You are a flashcard deck generator. The user provides a topic and optionally a card count.

Rules:
- If a card count is specified, generate exactly that many cards (max 50).
- If no card count is given, decide the ideal number yourself — enough to cover the topic well, up to 50 cards.
- Cards must be clear, concise and educational.
- If "requiresAnswer" is true, keep answers short and unambiguous so they can be typed accurately.
- "acceptedAnswers" must always contain at least the primary answer from "back". Add extras only for genuinely valid alternatives.
- Hashtags must be 3–20 lowercase tags starting with '#', letters/digits/underscores only.

You MUST call the create_deck tool with your response. Do not write any text outside the tool call.`

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

  const userMessage = cardCount
    ? `Topic: ${prompt}\nCard count: ${cardCount}`
    : `Topic: ${prompt}`

  let rawInput: unknown
  try {
    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 8192,
      system:     SYSTEM_PROMPT,
      tools:      [DECK_TOOL],
      tool_choice: { type: 'tool', name: 'create_deck' },
      messages:   [{ role: 'user', content: userMessage }],
    })

    const toolUse = message.content.find(b => b.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') throw new Error('No tool call in response')
    rawInput = toolUse.input
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'LLM request failed'
    const response: ApiResponse<never> = { data: undefined as never, error: `Generation failed: ${msg}` }
    return c.json(response, 500)
  }

  let deck: GeneratedDeck
  try {
    const result = GeneratedDeckSchema.safeParse(rawInput)
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
