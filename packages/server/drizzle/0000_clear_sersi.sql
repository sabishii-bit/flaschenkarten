CREATE TABLE "decks" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flash_cards" (
	"id" text PRIMARY KEY NOT NULL,
	"deck_id" text NOT NULL,
	"front" text NOT NULL,
	"back" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "flash_cards" ADD CONSTRAINT "flash_cards_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;