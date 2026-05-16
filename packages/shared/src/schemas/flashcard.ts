import { z } from 'zod'

export const FlashCardSchema = z.object({
  id:        z.uuid(),
  deckId:    z.uuid(),
  front:           z.string().min(1),
  back:            z.string().min(1),
  position:        z.number().int().nonnegative(),
  acceptedAnswers: z.array(z.string()).default([]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type FlashCard = z.infer<typeof FlashCardSchema>

export const CreateFlashCardSchema = FlashCardSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateFlashCard = z.infer<typeof CreateFlashCardSchema>

export const UpdateFlashCardSchema = FlashCardSchema
  .omit({ id: true, deckId: true, createdAt: true, updatedAt: true })
  .partial()

export type UpdateFlashCard = z.infer<typeof UpdateFlashCardSchema>
