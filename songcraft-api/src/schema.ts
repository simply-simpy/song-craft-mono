import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  index,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { Song, User } from "@songcraft/shared";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkId: varchar("clerk_id", { length: 191 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull(), // Make email required
    globalRole: varchar("global_role", { length: 50 })
      .default("user")
      .notNull(),
    accountIds: uuid("account_ids").array().default([]).notNull(), // Array of account IDs for fast access
    primaryAccountId: uuid("primary_account_id").references(() => accounts.id), // Primary account for default context
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // Test field to demonstrate migration workflow
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (table) => {
    return {
      clerkIdIdx: index("users_clerk_id_idx").on(table.clerkId),
      globalRoleIdx: index("users_global_role_idx")
        .on(table.globalRole)
        .where(sql`global_role != 'user'`), // Only index non-default roles
      accountIdsIdx: index("users_account_ids_idx").using(
        "gin",
        table.accountIds
      ), // GIN index for array operations
      primaryAccountIdIdx: index("users_primary_account_id_idx").on(
        table.primaryAccountId
      ),
      globalRoleCheck: check(
        "users_global_role_check",
        sql`global_role IN ('user', 'support', 'admin', 'super_admin')`
      ),
    };
  }
);

export const songs = pgTable(
  "songs",
  {
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
    collaborators: jsonb("collaborators")
      .$type<string[]>()
      .default([])
      .notNull(),
    accountId: uuid("account_id"), // Optional - handled by RLS policies
  },
  (table) => {
    return {
      ownerClerkIdIdx: index("songs_owner_clerk_id_idx").on(table.ownerClerkId),
      accountCreatedIdx: index("songs_account_created_desc_idx").on(
        table.accountId,
        table.createdAt.desc()
      ),
      updatedAtIdx: index("songs_updated_at_idx").on(table.updatedAt.desc()),
    };
  }
);

export const lyricVersions = pgTable(
  "lyric_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    shortId: varchar("short_id", { length: 50 }).notNull().unique(),
    songId: uuid("song_id")
      .notNull()
      .references(() => songs.id),
    versionName: varchar("version_name", { length: 40 })
      .default("draft")
      .notNull(),
    contentMd: text("content_md").notNull(),
    accountId: uuid("account_id"), // Optional - handled by RLS policies
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      accountIdx: index("lyric_versions_account_idx").on(table.accountId),
      songCreatedIdx: index("lyric_versions_song_created_idx").on(
        table.songId,
        table.createdAt.desc()
      ),
    };
  }
);

// Organizations - now primarily for billing and management
export const orgs = pgTable("orgs", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  billingEmail: varchar("billing_email", { length: 255 }),
  billingAddress: text("billing_address"),
  billingPhone: varchar("billing_phone", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Accounts - now the top-level entity for collaboration
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Legacy field - kept for backward compatibility, will be deprecated
    orgId: uuid("org_id").references(() => orgs.id),
    // New primary relationship - accounts can exist without an org
    parentOrgId: uuid("parent_org_id").references(() => orgs.id),
    ownerUserId: uuid("owner_user_id").references(() => users.id),
    name: text("name").notNull(),
    description: text("description"),
    plan: text("plan").notNull().default("Free"),
    status: text("status").notNull().default("active"),
    billingEmail: varchar("billing_email", { length: 255 }),
    settings: jsonb("settings").default({}).notNull(),
    isDefault: boolean("is_default").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      // Legacy index - kept for backward compatibility
      orgIdx: index("accounts_org_idx").on(table.orgId),
      // New primary indexes for account-centric structure
      parentOrgIdx: index("accounts_parent_org_idx").on(table.parentOrgId),
      billingEmailIdx: index("accounts_billing_email_idx").on(
        table.billingEmail
      ),
      activeIdx: index("accounts_active_idx")
        .on(table.parentOrgId)
        .where(sql`status = 'active'`),
      planCheck: check(
        "accounts_plan_check",
        sql`plan IN ('Free', 'Pro', 'Team', 'Enterprise')`
      ),
      statusCheck: check(
        "accounts_status_check",
        sql`status IN ('active', 'suspended', 'cancelled')`
      ),
    };
  }
);

export const memberships = pgTable(
  "memberships",
  {
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
  },
  (table) => {
    return {
      accountIdx: index("memberships_account_idx").on(table.accountId),
      userIdx: index("memberships_user_idx").on(table.userId),
      userRoleIdx: index("memberships_user_role_idx").on(
        table.userId,
        table.role
      ),
      roleCheck: check(
        "memberships_role_check",
        sql`role IN ('owner', 'admin', 'member', 'viewer')`
      ),
    };
  }
);

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
