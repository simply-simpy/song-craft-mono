import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const lyricVersions = pgTable("lyric_versions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	songId: uuid("song_id").notNull(),
	versionName: varchar("version_name", { length: 40 }).default('draft').notNull(),
	contentMd: text("content_md").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const songs = pgTable("songs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	ownerClerkId: varchar("owner_clerk_id", { length: 191 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	bpm: integer(),
	key: varchar({ length: 12 }),
	tags: jsonb().default([]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clerkId: varchar("clerk_id", { length: 191 }).notNull(),
	email: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_clerk_id_unique").on(table.clerkId),
]);
