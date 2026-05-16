CREATE TABLE "deck_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"deck_id" text NOT NULL,
	"voter_ip" text NOT NULL,
	"vote" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deck_votes_deck_id_voter_ip_unique" UNIQUE("deck_id","voter_ip")
);
--> statement-breakpoint
ALTER TABLE "deck_votes" ADD CONSTRAINT "deck_votes_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;