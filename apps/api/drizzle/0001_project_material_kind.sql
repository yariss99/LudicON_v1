ALTER TABLE "resources" DROP CONSTRAINT "resources_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "intended_kind" "asset_kind" DEFAULT 'lesson_plan' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "planned_materials" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;