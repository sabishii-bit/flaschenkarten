CREATE TABLE "server_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"event" text NOT NULL,
	"visitor_id" text,
	"ip" text,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "banned_ips" ADD COLUMN "cookie_id" text;