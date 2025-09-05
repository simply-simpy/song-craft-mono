-- Migration to implement UUID primary keys with separate short_id columns
-- This approach follows best practices for database design

-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing tables (this will delete all data)
DROP TABLE IF EXISTS "lyric_versions";
DROP TABLE IF EXISTS "songs";
DROP TABLE IF EXISTS "users";

-- Create new tables with updated schema
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(191) NOT NULL,
	"email" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);

CREATE TABLE "songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"short_id" varchar(50) UNIQUE NOT NULL,
	"owner_clerk_id" varchar(191) NOT NULL,
	"title" varchar(200) NOT NULL,
	"artist" varchar(200),
	"bpm" integer,
	"key" varchar(12),
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"lyrics" text,
	"midi_data" text,
	"collaborators" jsonb DEFAULT '[]'::jsonb NOT NULL
);

CREATE TABLE "lyric_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"short_id" varchar(50) UNIQUE NOT NULL,
	"song_id" uuid NOT NULL REFERENCES "songs"("id") ON DELETE CASCADE,
	"version_name" varchar(40) DEFAULT 'draft' NOT NULL,
	"content_md" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
