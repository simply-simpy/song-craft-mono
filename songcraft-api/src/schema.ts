import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { Song, User } from "@songcraft/shared";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: varchar("clerk_id", { length: 191 }).notNull(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const songs = pgTable("songs", {
  id: uuid("id").defaultRandom().primaryKey(), // Keep UUID as primary key
  shortId: varchar("short_id", { length: 50 }).notNull().unique(), // Add short ID column
  ownerClerkId: varchar("owner_clerk_id", { length: 191 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  artist: varchar("artist", { length: 200 }),
  bpm: integer("bpm"),
  key: varchar("key", { length: 12 }),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lyrics: text("lyrics"),
  midiData: text("midi_data"),
  collaborators: jsonb("collaborators").$type<string[]>().default([]).notNull(),
});

export const lyricVersions = pgTable("lyric_versions", {
  id: uuid("id").defaultRandom().primaryKey(), // Keep UUID as primary key
  shortId: varchar("short_id", { length: 50 }).notNull().unique(), // Add short ID column
  songId: uuid("song_id").notNull().references(() => songs.id), // Reference songs.id (UUID)
  versionName: varchar("version_name", { length: 40 })
    .default("draft")
    .notNull(),
  contentMd: text("content_md").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
