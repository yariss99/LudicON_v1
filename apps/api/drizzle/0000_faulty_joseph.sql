CREATE TYPE "public"."actor" AS ENUM('teacher', 'ai', 'system');--> statement-breakpoint
CREATE TYPE "public"."asset_kind" AS ENUM('lesson_plan', 'worksheet', 'assessment', 'story', 'game', 'presentation', 'rubric', 'homework', 'observation_sheet', 'note');--> statement-breakpoint
CREATE TYPE "public"."completion_state" AS ENUM('empty', 'partial', 'complete');--> statement-breakpoint
CREATE TYPE "public"."grade_level" AS ENUM('pregatitoare', 'clasa_1', 'clasa_2', 'clasa_3', 'clasa_4', 'clasa_5', 'clasa_6', 'clasa_7', 'clasa_8');--> statement-breakpoint
CREATE TYPE "public"."lesson_section" AS ENUM('general', 'competencies', 'objectives', 'sequence', 'activities', 'resources', 'assessment', 'reflection', 'publication');--> statement-breakpoint
CREATE TYPE "public"."lifecycle_status" AS ENUM('draft', 'needs_review', 'ready', 'published', 'archived', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."project_color" AS ENUM('blue', 'emerald', 'amber', 'slate', 'rose', 'teal');--> statement-breakpoint
CREATE TYPE "public"."project_state" AS ENUM('discovery', 'design', 'approved', 'materials_ready', 'published');--> statement-breakpoint
CREATE TABLE "collection_items" (
	"collection_id" uuid NOT NULL,
	"resource_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collection_items_collection_id_resource_id_pk" PRIMARY KEY("collection_id","resource_id")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"actor" "actor" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"lesson_plan_id" uuid,
	"kind" "asset_kind" NOT NULL,
	"status" "lifecycle_status" DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"grade" text NOT NULL,
	"body" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"validation" jsonb,
	"created_by" "actor" DEFAULT 'teacher' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"grade" text NOT NULL,
	"duration_minutes" integer DEFAULT 45 NOT NULL,
	"completion" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"score" jsonb,
	"validation" jsonb,
	"status" "lifecycle_status" DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"approved_at" timestamp with time zone,
	"approved_by" text,
	"approval_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pedagogical_blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_plan_id" uuid NOT NULL,
	"section" "lesson_section" NOT NULL,
	"title" text NOT NULL,
	"purpose" text DEFAULT '' NOT NULL,
	"estimated_minutes" integer,
	"objectives" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"competencies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"strategy" text DEFAULT '' NOT NULL,
	"resources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"status" "lifecycle_status" DEFAULT 'draft' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"organization_id" text,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"subject" text NOT NULL,
	"grade" "grade_level" NOT NULL,
	"color" "project_color" DEFAULT 'blue' NOT NULL,
	"state" "project_state" DEFAULT 'discovery' NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"project_id" uuid,
	"document_id" uuid,
	"kind" "asset_kind" NOT NULL,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"grade" text DEFAULT '' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "lifecycle_status" DEFAULT 'draft' NOT NULL,
	"opened_at" timestamp with time zone,
	"reuse_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text,
	"email" text,
	"display_name" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_owner_id_teachers_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_lesson_plan_id_lesson_plans_id_fk" FOREIGN KEY ("lesson_plan_id") REFERENCES "public"."lesson_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_approved_by_teachers_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedagogical_blocks" ADD CONSTRAINT "pedagogical_blocks_lesson_plan_id_lesson_plans_id_fk" FOREIGN KEY ("lesson_plan_id") REFERENCES "public"."lesson_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_teachers_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_owner_id_teachers_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collection_items_collection_position_idx" ON "collection_items" USING btree ("collection_id","position");--> statement-breakpoint
CREATE INDEX "collections_owner_id_idx" ON "collections" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "document_versions_document_version_key" ON "document_versions" USING btree ("document_id","version");--> statement-breakpoint
CREATE INDEX "document_versions_project_id_idx" ON "document_versions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "documents_project_updated_idx" ON "documents" USING btree ("project_id","updated_at","id");--> statement-breakpoint
CREATE INDEX "documents_project_kind_idx" ON "documents" USING btree ("project_id","kind");--> statement-breakpoint
CREATE INDEX "documents_lesson_plan_id_idx" ON "documents" USING btree ("lesson_plan_id");--> statement-breakpoint
CREATE INDEX "documents_status_idx" ON "documents" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_plans_project_id_key" ON "lesson_plans" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "lesson_plans_approved_at_idx" ON "lesson_plans" USING btree ("approved_at");--> statement-breakpoint
CREATE INDEX "pedagogical_blocks_plan_section_idx" ON "pedagogical_blocks" USING btree ("lesson_plan_id","section","order_index");--> statement-breakpoint
CREATE INDEX "projects_owner_updated_idx" ON "projects" USING btree ("owner_id","updated_at","id");--> statement-breakpoint
CREATE INDEX "projects_owner_state_idx" ON "projects" USING btree ("owner_id","state");--> statement-breakpoint
CREATE INDEX "projects_organization_id_idx" ON "projects" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "resources_owner_updated_idx" ON "resources" USING btree ("owner_id","updated_at","id");--> statement-breakpoint
CREATE INDEX "resources_owner_kind_idx" ON "resources" USING btree ("owner_id","kind");--> statement-breakpoint
CREATE INDEX "resources_project_id_idx" ON "resources" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "resources_title_idx" ON "resources" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX "teachers_email_key" ON "teachers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "teachers_organization_id_idx" ON "teachers" USING btree ("organization_id");