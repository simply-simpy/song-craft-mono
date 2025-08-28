import {
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	integer,
	jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	clerkId: varchar("clerk_id", { length: 191 }).notNull().unique(),
	email: varchar("email", { length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const songs = pgTable("songs", {
	id: uuid("id").defaultRandom().primaryKey(),
	ownerClerkId: varchar("owner_clerk_id", { length: 191 }).notNull(),
	title: varchar("title", { length: 200 }).notNull(),
	bpm: integer("bpm"),
	key: varchar("key", { length: 12 }),
	tags: jsonb("tags").$type<string[]>().default([]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const lyricVersions = pgTable("lyric_versions", {
	id: uuid("id").defaultRandom().primaryKey(),
	songId: uuid("song_id").notNull(),
	versionName: varchar("version_name", { length: 40 })
		.default("draft")
		.notNull(),
	contentMd: text("content_md").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});
