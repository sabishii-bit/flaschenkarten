ALTER TABLE "decks" ADD COLUMN "requires_answer" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "flash_cards" ADD COLUMN "accepted_answers" text[] DEFAULT '{}' NOT NULL;