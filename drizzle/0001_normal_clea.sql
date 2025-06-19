CREATE TABLE "traffic_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" text NOT NULL,
	"project_name" text NOT NULL,
	"year" text NOT NULL,
	"business_owner" text NOT NULL,
	"assessment_agency" text NOT NULL,
	"approval_authority" text NOT NULL,
	"location" text NOT NULL,
	"status" text NOT NULL,
	"project_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
