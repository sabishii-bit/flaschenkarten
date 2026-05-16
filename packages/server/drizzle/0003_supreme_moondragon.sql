CREATE TABLE "deck_favorites" (
	"id" text PRIMARY KEY NOT NULL,
	"deck_id" text NOT NULL,
	"user_ip" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deck_favorites_deck_id_user_ip_unique" UNIQUE("deck_id","user_ip")
);
--> statement-breakpoint
ALTER TABLE "deck_favorites" ADD CONSTRAINT "deck_favorites_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;