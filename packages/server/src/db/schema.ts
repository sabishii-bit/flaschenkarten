import { pgTable, text, boolean, integer, timestamp, unique } from 'drizzle-orm/pg-core'

export const bannedIps = pgTable('banned_ips', {
  ip:        text('ip').primaryKey(),
  reason:    text('reason').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

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

export const deckVotes = pgTable('deck_votes', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  deckId:    text('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  voterIp:   text('voter_ip').notNull(),
  vote:      text('vote', { enum: ['like', 'dislike'] }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [unique().on(t.deckId, t.voterIp)])

export const deckFavorites = pgTable('deck_favorites', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  deckId:    text('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  userIp:    text('user_ip').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [unique().on(t.deckId, t.userIp)])

export const flashCards = pgTable('flash_cards', {
  id:       text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  deckId:   text('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  front:    text('front').notNull(),
  back:     text('back').notNull(),
  position: integer('position').notNull().default(0),
  ...timestamps,
})
