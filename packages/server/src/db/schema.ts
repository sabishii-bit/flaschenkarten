import { pgTable, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core'

const timestamps = {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}

export const decks = pgTable('decks', {
  id:          text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  authorId:    text('author_id'),
  title:       text('title').notNull(),
  description: text('description').notNull().default(''),
  isPublic:    boolean('is_public').notNull().default(true),
  ...timestamps,
})

export const flashCards = pgTable('flash_cards', {
  id:       text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  deckId:   text('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  front:    text('front').notNull(),
  back:     text('back').notNull(),
  position: integer('position').notNull().default(0),
  ...timestamps,
})
