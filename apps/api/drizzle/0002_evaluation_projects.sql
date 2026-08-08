CREATE TYPE "public"."discipline" AS ENUM('matematica', 'stiinte', 'limba_romana', 'limba_engleza', 'istorie', 'geografie', 'arte_vizuale', 'alta');--> statement-breakpoint
CREATE TABLE "evaluation_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"discipline" "discipline",
	"grade" "grade_level",
	"archived" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp with time zone,
	"document" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evaluation_projects" ADD CONSTRAINT "evaluation_projects_owner_id_teachers_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "evaluation_projects_owner_updated_idx" ON "evaluation_projects" USING btree ("owner_id","updated_at","id");--> statement-breakpoint
CREATE INDEX "evaluation_projects_owner_archived_idx" ON "evaluation_projects" USING btree ("owner_id","archived","updated_at");