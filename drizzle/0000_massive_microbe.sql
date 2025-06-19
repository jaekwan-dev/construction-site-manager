CREATE TABLE "katia_companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" text NOT NULL,
	"company_name" text NOT NULL,
	"representative" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
