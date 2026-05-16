import { z } from 'zod'
import { FlashCardSchema } from './flashcard.js'

export const DeckSchema = z.object({
  id:          z.uuid(),
  authorId:    z.string().nullable().default(null),
  title:       z.string().min(1).max(120),
  description: z.string().max(500).default(''),
  isPublic:      z.boolean().default(true),
  requiresAnswer: z.boolean().default(false),
  hashtags:      z.array(z.string().min(1)).min(0).max(20).default([]),
  createdAt:     z.iso.datetime(),
  updatedAt:   z.iso.datetime(),
})

export type Deck = z.infer<typeof DeckSchema>

export const DeckWithCardsSchema = DeckSchema.extend({
  cards: z.array(FlashCardSchema),
})

export type DeckWithCards = z.infer<typeof DeckWithCardsSchema>

export const CreateDeckSchema = DeckSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateDeck = z.infer<typeof CreateDeckSchema>

export const UpdateDeckSchema = CreateDeckSchema.partial()

export type UpdateDeck = z.infer<typeof UpdateDeckSchema>
