ALTER TABLE "songs" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "songs_project_id_idx" ON "songs" USING btree ("project_id");