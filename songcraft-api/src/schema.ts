import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { Song, User } from "@songcraft/shared";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: varchar("clerk_id", { length: 191 }).notNull(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  // Test field to demonstrate migration workflow
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const songs = pgTable("songs", {
  id: uuid("id").defaultRandom().primaryKey(),
  shortId: varchar("short_id", { length: 50 }).notNull().unique(),
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
  accountId: uuid("account_id"), // Add the missing account_id column
});

export const lyricVersions = pgTable("lyric_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  shortId: varchar("short_id", { length: 50 }).notNull().unique(),
  songId: uuid("song_id")
    .notNull()
    .references(() => songs.id),
  versionName: varchar("version_name", { length: 40 })
    .default("draft")
    .notNull(),
  contentMd: text("content_md").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Add missing tables that exist in your database
export const orgs = pgTable("orgs", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => orgs.id),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("Free"),
  status: text("status").notNull().default("active"),
  isDefault: boolean("is_default").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const memberships = pgTable("memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: varchar("role", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const songAccountLinks = pgTable("song_account_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  songId: uuid("song_id")
    .notNull()
    .references(() => songs.id),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const songAuthors = pgTable("song_authors", {
  id: uuid("id").defaultRandom().primaryKey(),
  songId: uuid("song_id")
    .notNull()
    .references(() => songs.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: varchar("role", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
