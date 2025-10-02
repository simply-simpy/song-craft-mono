CREATE TABLE "account_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"setting_key" varchar(255) NOT NULL,
	"setting_value" jsonb NOT NULL,
	"inherited_from" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_settings_unique" UNIQUE("account_id","setting_key")
);
--> statement-breakpoint
CREATE TABLE "org_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"setting_key" varchar(255) NOT NULL,
	"setting_value" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "org_settings_unique" UNIQUE("org_id","setting_key")
);
--> statement-breakpoint
CREATE TABLE "project_account_associations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"association_type" varchar(50) DEFAULT 'billing' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_account_associations_unique" UNIQUE("project_id","account_id"),
	CONSTRAINT "project_account_associations_type_check" CHECK (association_type IN ('billing', 'context', 'rights', 'primary'))
);
--> statement-breakpoint
CREATE TABLE "project_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"setting_key" varchar(255) NOT NULL,
	"setting_value" jsonb NOT NULL,
	"inherited_from" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_settings_unique" UNIQUE("project_id","setting_key")
);
--> statement-breakpoint
CREATE TABLE "session_song_associations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"song_id" uuid NOT NULL,
	"association_type" varchar(50) DEFAULT 'primary' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_song_associations_unique" UNIQUE("session_id","song_id"),
	CONSTRAINT "session_song_associations_type_check" CHECK (association_type IN ('primary', 'secondary', 'reference'))
);
--> statement-breakpoint
CREATE TABLE "song_project_associations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"song_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"association_type" varchar(50) DEFAULT 'primary' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "song_project_associations_unique" UNIQUE("song_id","project_id"),
	CONSTRAINT "song_project_associations_type_check" CHECK (association_type IN ('primary', 'secondary', 'compilation', 'reference'))
);
--> statement-breakpoint
CREATE TABLE "song_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"song_id" uuid NOT NULL,
	"setting_key" varchar(255) NOT NULL,
	"setting_value" jsonb NOT NULL,
	"inherited_from" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "song_settings_unique" UNIQUE("song_id","setting_key")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"setting_key" varchar(255) NOT NULL,
	"setting_value" jsonb NOT NULL,
	"scope" varchar(50),
	"scope_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_unique" UNIQUE("user_id","setting_key","scope","scope_id")
);
--> statement-breakpoint
ALTER TABLE "song_account_links" DROP CONSTRAINT "song_account_links_song_id_songs_id_fk";
--> statement-breakpoint
ALTER TABLE "song_account_links" DROP CONSTRAINT "song_account_links_account_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "song_authors" DROP CONSTRAINT "song_authors_song_id_songs_id_fk";
--> statement-breakpoint
ALTER TABLE "song_authors" DROP CONSTRAINT "song_authors_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "song_account_links" ADD COLUMN "association_type" varchar(50) DEFAULT 'billing' NOT NULL;--> statement-breakpoint
ALTER TABLE "song_account_links" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "song_authors" ADD COLUMN "split_percentage" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "song_authors" ADD COLUMN "territory_rights" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "song_authors" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account_settings" ADD CONSTRAINT "account_settings_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_settings" ADD CONSTRAINT "org_settings_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_account_associations" ADD CONSTRAINT "project_account_associations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_account_associations" ADD CONSTRAINT "project_account_associations_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_settings" ADD CONSTRAINT "project_settings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_song_associations" ADD CONSTRAINT "session_song_associations_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_song_associations" ADD CONSTRAINT "session_song_associations_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_project_associations" ADD CONSTRAINT "song_project_associations_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_project_associations" ADD CONSTRAINT "song_project_associations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_settings" ADD CONSTRAINT "song_settings_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_settings_account_idx" ON "account_settings" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "account_settings_key_idx" ON "account_settings" USING btree ("setting_key");--> statement-breakpoint
CREATE INDEX "account_settings_inherited_idx" ON "account_settings" USING btree ("inherited_from");--> statement-breakpoint
CREATE INDEX "org_settings_org_idx" ON "org_settings" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "org_settings_key_idx" ON "org_settings" USING btree ("setting_key");--> statement-breakpoint
CREATE INDEX "project_account_associations_project_idx" ON "project_account_associations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_account_associations_account_idx" ON "project_account_associations" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "project_account_associations_type_idx" ON "project_account_associations" USING btree ("association_type");--> statement-breakpoint
CREATE INDEX "project_settings_project_idx" ON "project_settings" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_settings_key_idx" ON "project_settings" USING btree ("setting_key");--> statement-breakpoint
CREATE INDEX "project_settings_inherited_idx" ON "project_settings" USING btree ("inherited_from");--> statement-breakpoint
CREATE INDEX "session_song_associations_session_idx" ON "session_song_associations" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_song_associations_song_idx" ON "session_song_associations" USING btree ("song_id");--> statement-breakpoint
CREATE INDEX "session_song_associations_type_idx" ON "session_song_associations" USING btree ("association_type");--> statement-breakpoint
CREATE INDEX "song_project_associations_song_idx" ON "song_project_associations" USING btree ("song_id");--> statement-breakpoint
CREATE INDEX "song_project_associations_project_idx" ON "song_project_associations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "song_project_associations_type_idx" ON "song_project_associations" USING btree ("association_type");--> statement-breakpoint
CREATE INDEX "song_settings_song_idx" ON "song_settings" USING btree ("song_id");--> statement-breakpoint
CREATE INDEX "song_settings_key_idx" ON "song_settings" USING btree ("setting_key");--> statement-breakpoint
CREATE INDEX "song_settings_inherited_idx" ON "song_settings" USING btree ("inherited_from");--> statement-breakpoint
CREATE INDEX "user_settings_user_idx" ON "user_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_settings_key_idx" ON "user_settings" USING btree ("setting_key");--> statement-breakpoint
CREATE INDEX "user_settings_scope_idx" ON "user_settings" USING btree ("scope","scope_id");--> statement-breakpoint
ALTER TABLE "song_account_links" ADD CONSTRAINT "song_account_links_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_account_links" ADD CONSTRAINT "song_account_links_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_authors" ADD CONSTRAINT "song_authors_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_authors" ADD CONSTRAINT "song_authors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "song_account_links_song_idx" ON "song_account_links" USING btree ("song_id");--> statement-breakpoint
CREATE INDEX "song_account_links_account_idx" ON "song_account_links" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "song_account_links_type_idx" ON "song_account_links" USING btree ("association_type");--> statement-breakpoint
CREATE INDEX "song_authors_song_idx" ON "song_authors" USING btree ("song_id");--> statement-breakpoint
CREATE INDEX "song_authors_user_idx" ON "song_authors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "song_authors_split_idx" ON "song_authors" USING btree ("split_percentage");--> statement-breakpoint
ALTER TABLE "song_account_links" ADD CONSTRAINT "song_account_links_unique" UNIQUE("song_id","account_id");--> statement-breakpoint
ALTER TABLE "song_authors" ADD CONSTRAINT "song_authors_unique" UNIQUE("song_id","user_id");--> statement-breakpoint
ALTER TABLE "song_account_links" ADD CONSTRAINT "song_account_links_type_check" CHECK (association_type IN ('billing', 'context', 'rights', 'primary'));