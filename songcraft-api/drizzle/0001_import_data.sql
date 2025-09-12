-- SongScribe: multi-tenant bootstrap + ownership history + RLS guardrails
-- Safe to apply to your current DB shape (songs, users, lyric_versions).

-----------------------------
-- 0) Extensions
-----------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-----------------------------
-- 1) Helper: current tenant GUC
-----------------------------
CREATE OR REPLACE FUNCTION app_current_account_id()
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE v uuid;
BEGIN
  BEGIN
    v := current_setting('app.account_id')::uuid;
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'app.account_id is not set; caller must set tenant context'
      USING ERRCODE = '28000';
  END;
  RETURN v;
END; $$;

-----------------------------
-- 2) Core tenancy tables
-----------------------------
-- Plural table names to match your existing style.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='orgs') THEN
    CREATE TABLE public.orgs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      status text NOT NULL DEFAULT 'active',
      created_at timestamptz NOT NULL DEFAULT now()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='accounts') THEN
    CREATE TABLE public.accounts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE RESTRICT,
      -- owner_user_id just helps our backfill; keep it nullable
      owner_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
      name text NOT NULL,
      plan text NOT NULL DEFAULT 'Free',
      status text NOT NULL DEFAULT 'active',
      is_default boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS accounts_org_idx ON public.accounts(org_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='memberships') THEN
    CREATE TABLE public.memberships (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
      role text NOT NULL,  -- owner manager collaborator viewer
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (user_id, account_id)
    );
    CREATE INDEX IF NOT EXISTS memberships_account_idx ON public.memberships(account_id);
    CREATE INDEX IF NOT EXISTS memberships_user_idx ON public.memberships(user_id);
  END IF;
END$$;

-----------------------------
-- 3) Song ownership/transfer helpers
-----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='song_authors') THEN
    CREATE TABLE public.song_authors (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
      role text NOT NULL DEFAULT 'writer',
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (song_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS song_authors_song_idx ON public.song_authors(song_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='song_account_links') THEN
    CREATE TABLE public.song_account_links (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
      account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
      is_current boolean NOT NULL DEFAULT true,
      reason text,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT song_account_links_one_current UNIQUE (song_id, is_current)
    );
    CREATE INDEX IF NOT EXISTS song_account_links_song_idx ON public.song_account_links(song_id);
    CREATE INDEX IF NOT EXISTS song_account_links_account_idx ON public.song_account_links(account_id);
  END IF;
END$$;

-----------------------------
-- 4) Add account_id to existing tables
-----------------------------
-- songs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='songs' AND column_name='account_id'
  ) THEN
    ALTER TABLE public.songs ADD COLUMN account_id uuid;
  END IF;
END$$;

-- lyric_versions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='lyric_versions' AND column_name='account_id'
  ) THEN
    ALTER TABLE public.lyric_versions ADD COLUMN account_id uuid;
  END IF;
END$$;

-----------------------------
-- 5) Backfill from your current data
--   • users is empty today; create users from distinct songs.owner_clerk_id
--   • create a personal org + default account per user
--   • link songs to those accounts
--   • add song_authors and song_account_links
-----------------------------

-- 5a) Create users from songs.owner_clerk_id (if missing)
INSERT INTO public.users(id, clerk_id, email, created_at)
SELECT gen_random_uuid(), s.owner_clerk_id, NULL, now()
FROM public.songs s
LEFT JOIN public.users u ON u.clerk_id = s.owner_clerk_id
WHERE u.id IS NULL
GROUP BY s.owner_clerk_id;

-- 5b) Create a personal org per user (if missing)
WITH u AS (
  SELECT id AS user_id, clerk_id FROM public.users
)
INSERT INTO public.orgs(id, name, status, created_at)
SELECT gen_random_uuid(), 'Personal · '||u.clerk_id, 'active', now()
FROM u
LEFT JOIN LATERAL (
  SELECT 1 FROM public.orgs o WHERE o.name = 'Personal · '||u.clerk_id
) exists ON TRUE
WHERE exists IS NULL;

-- 5c) Create a default account per user under that org (if missing)
WITH u AS (
  SELECT u.id AS user_id, u.clerk_id, o.id AS org_id
  FROM public.users u
  JOIN public.orgs o ON o.name = 'Personal · '||u.clerk_id
)
INSERT INTO public.accounts(id, org_id, owner_user_id, name, plan, status, is_default, created_at)
SELECT gen_random_uuid(), u.org_id, u.user_id, 'Default', 'Free', 'active', true, now()
FROM u
LEFT JOIN LATERAL (
  SELECT 1 FROM public.accounts a WHERE a.org_id = u.org_id AND a.is_default = true
) exists ON TRUE
WHERE exists IS NULL;

-- 5d) Set songs.account_id to the owner's default account
UPDATE public.songs s
SET account_id = a.id
FROM public.users u
JOIN public.orgs o ON o.name = 'Personal · '||u.clerk_id
JOIN public.accounts a ON a.org_id = o.id AND a.is_default = true
WHERE u.clerk_id = s.owner_clerk_id
  AND (s.account_id IS NULL OR s.account_id <> a.id);

-- 5e) Backfill lyric_versions.account_id from its song
UPDATE public.lyric_versions lv
SET account_id = s.account_id
FROM public.songs s
WHERE lv.song_id = s.id
  AND (lv.account_id IS NULL OR lv.account_id <> s.account_id);

-- 5f) Add owner as song_author (writer)
INSERT INTO public.song_authors (id, song_id, user_id, role, created_at)
SELECT gen_random_uuid(), s.id, u.id, 'writer', now()
FROM public.songs s
JOIN public.users u ON u.clerk_id = s.owner_clerk_id
LEFT JOIN public.song_authors sa ON sa.song_id = s.id AND sa.user_id = u.id
WHERE sa.id IS NULL;

-- 5g) Seed song_account_links with current location
INSERT INTO public.song_account_links (id, song_id, account_id, is_current, reason, created_at)
SELECT gen_random_uuid(), s.id, s.account_id, true, 'initial backfill', now()
FROM public.songs s
LEFT JOIN public.song_account_links l ON l.song_id = s.id AND l.is_current = true
WHERE s.account_id IS NOT NULL AND l.id IS NULL;

-- 5h) Ensure memberships for owners
INSERT INTO public.memberships(id, user_id, account_id, role, created_at)
SELECT gen_random_uuid(), u.id, a.id, 'owner', now()
FROM public.users u
JOIN public.orgs o ON o.name = 'Personal · '||u.clerk_id
JOIN public.accounts a ON a.org_id = o.id AND a.is_default = true
LEFT JOIN public.memberships m ON m.user_id = u.id AND m.account_id = a.id
WHERE m.id IS NULL;

-----------------------------
-- 6) Guardrails: RLS for tenant scoping
-----------------------------
-- Enable RLS on tenant-scoped tables
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyric_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_account_links ENABLE ROW LEVEL SECURITY;

-- Policies: account_id must match app_current_account_id()
DO $$
BEGIN
  -- songs
  BEGIN
    CREATE POLICY songs_read ON public.songs FOR SELECT
      USING (account_id = app_current_account_id());
  EXCEPTION WHEN duplicate_object THEN END;
  BEGIN
    CREATE POLICY songs_write ON public.songs FOR ALL
      USING (account_id = app_current_account_id())
      WITH CHECK (account_id = app_current_account_id());
  EXCEPTION WHEN duplicate_object THEN END;

  -- lyric_versions
  BEGIN
    CREATE POLICY lyric_versions_read ON public.lyric_versions FOR SELECT
      USING (account_id = app_current_account_id());
  EXCEPTION WHEN duplicate_object THEN END;
  BEGIN
    CREATE POLICY lyric_versions_write ON public.lyric_versions FOR ALL
      USING (account_id = app_current_account_id())
      WITH CHECK (account_id = app_current_account_id());
  EXCEPTION WHEN duplicate_object THEN END;

  -- song_authors (scope by the song’s account)
  BEGIN
    CREATE POLICY song_authors_rw ON public.song_authors FOR ALL
      USING (
        EXISTS (SELECT 1 FROM public.songs s
                WHERE s.id = song_id AND s.account_id = app_current_account_id())
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.songs s
                WHERE s.id = song_id AND s.account_id = app_current_account_id())
      );
  EXCEPTION WHEN duplicate_object THEN END;

  -- song_account_links
  BEGIN
    CREATE POLICY song_account_links_rw ON public.song_account_links FOR ALL
      USING (
        EXISTS (SELECT 1 FROM public.songs s
                WHERE s.id = song_id AND s.account_id = app_current_account_id())
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.songs s
                WHERE s.id = song_id AND s.account_id = app_current_account_id())
      );
  EXCEPTION WHEN duplicate_object THEN END;
END$$;

-----------------------------
-- 7) Small QoL: updated_at trigger + helpful indexes
-----------------------------
-- Keep songs.updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_songs_updated_at ON public.songs;
CREATE TRIGGER trg_songs_updated_at
BEFORE UPDATE ON public.songs
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Useful indexes
CREATE INDEX IF NOT EXISTS songs_account_created_idx
  ON public.songs(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lyric_versions_song_created_idx
  ON public.lyric_versions(song_id, created_at DESC);
CREATE INDEX IF NOT EXISTS songs_title_trgm_idx
  ON public.songs USING GIN (title gin_trgm_ops);

