CREATE TABLE "banned_ips" (
	"ip" text PRIMARY KEY NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
