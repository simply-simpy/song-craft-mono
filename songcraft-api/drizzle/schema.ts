import { pgTable, unique, uuid, varchar, timestamp, index, pgPolicy, integer, jsonb, text, foreignKey, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clerkId: varchar("clerk_id", { length: 191 }).notNull(),
	email: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_clerk_id_unique").on(table.clerkId),
]);

export const songs = pgTable("songs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	shortId: varchar("short_id", { length: 50 }).notNull(),
	ownerClerkId: varchar("owner_clerk_id", { length: 191 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	artist: varchar({ length: 200 }),
	bpm: integer(),
	key: varchar({ length: 12 }),
	tags: jsonb().default([]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	lyrics: text(),
	midiData: text("midi_data"),
	collaborators: jsonb().default([]).notNull(),
	accountId: uuid("account_id"),
}, (table) => [
	index("songs_account_created_idx").using("btree", table.accountId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("songs_title_trgm_idx").using("gin", table.title.asc().nullsLast().op("gin_trgm_ops")),
	unique("songs_short_id_key").on(table.shortId),
	pgPolicy("songs_write", { as: "permissive", for: "all", to: ["public"], using: sql`(account_id = app_current_account_id())`, withCheck: sql`(account_id = app_current_account_id())`  }),
	pgPolicy("songs_read", { as: "permissive", for: "select", to: ["public"] }),
]);

export const lyricVersions = pgTable("lyric_versions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	shortId: varchar("short_id", { length: 50 }).notNull(),
	songId: uuid("song_id").notNull(),
	versionName: varchar("version_name", { length: 40 }).default('draft').notNull(),
	contentMd: text("content_md").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	accountId: uuid("account_id"),
}, (table) => [
	index("lyric_versions_song_created_idx").using("btree", table.songId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.songId],
			foreignColumns: [songs.id],
			name: "lyric_versions_song_id_fkey"
		}).onDelete("cascade"),
	unique("lyric_versions_short_id_key").on(table.shortId),
	pgPolicy("lyric_versions_write", { as: "permissive", for: "all", to: ["public"], using: sql`(account_id = app_current_account_id())`, withCheck: sql`(account_id = app_current_account_id())`  }),
	pgPolicy("lyric_versions_read", { as: "permissive", for: "select", to: ["public"] }),
]);

export const orgs = pgTable("orgs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	status: text().default('active').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orgId: uuid("org_id").notNull(),
	ownerUserId: uuid("owner_user_id"),
	name: text().notNull(),
	plan: text().default('Free').notNull(),
	status: text().default('active').notNull(),
	isDefault: boolean("is_default").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("accounts_org_idx").using("btree", table.orgId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "accounts_org_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.ownerUserId],
			foreignColumns: [users.id],
			name: "accounts_owner_user_id_fkey"
		}).onDelete("set null"),
]);

export const memberships = pgTable("memberships", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	accountId: uuid("account_id").notNull(),
	role: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("memberships_account_idx").using("btree", table.accountId.asc().nullsLast().op("uuid_ops")),
	index("memberships_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "memberships_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "memberships_account_id_fkey"
		}).onDelete("cascade"),
	unique("memberships_user_id_account_id_key").on(table.userId, table.accountId),
]);

export const songAuthors = pgTable("song_authors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	songId: uuid("song_id").notNull(),
	userId: uuid("user_id").notNull(),
	role: text().default('writer').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("song_authors_song_idx").using("btree", table.songId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.songId],
			foreignColumns: [songs.id],
			name: "song_authors_song_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "song_authors_user_id_fkey"
		}).onDelete("restrict"),
	unique("song_authors_song_id_user_id_key").on(table.songId, table.userId),
	pgPolicy("song_authors_rw", { as: "permissive", for: "all", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM songs s
  WHERE ((s.id = song_authors.song_id) AND (s.account_id = app_current_account_id()))))`, withCheck: sql`(EXISTS ( SELECT 1
   FROM songs s
  WHERE ((s.id = song_authors.song_id) AND (s.account_id = app_current_account_id()))))`  }),
]);

export const songAccountLinks = pgTable("song_account_links", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	songId: uuid("song_id").notNull(),
	accountId: uuid("account_id").notNull(),
	isCurrent: boolean("is_current").default(true).notNull(),
	reason: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("song_account_links_account_idx").using("btree", table.accountId.asc().nullsLast().op("uuid_ops")),
	index("song_account_links_song_idx").using("btree", table.songId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.songId],
			foreignColumns: [songs.id],
			name: "song_account_links_song_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "song_account_links_account_id_fkey"
		}).onDelete("restrict"),
	unique("song_account_links_one_current").on(table.songId, table.isCurrent),
	pgPolicy("song_account_links_rw", { as: "permissive", for: "all", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM songs s
  WHERE ((s.id = song_account_links.song_id) AND (s.account_id = app_current_account_id()))))`, withCheck: sql`(EXISTS ( SELECT 1
   FROM songs s
  WHERE ((s.id = song_account_links.song_id) AND (s.account_id = app_current_account_id()))))`  }),
]);
