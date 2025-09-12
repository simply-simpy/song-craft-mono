-- Seed: two tenants, two users, two accounts, two songs
-- Idempotent: safe to re-run

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Users
INSERT INTO users (id, clerk_id, email, created_at)
VALUES
    (gen_random_uuid(), 'clerk_user_A', 'a@example.com', now()),
    (gen_random_uuid(), 'clerk_user_B', 'b@example.com', now())
ON CONFLICT (clerk_id) DO NOTHING;

-- Orgs
INSERT INTO orgs (id, name)
VALUES
    (gen_random_uuid(), 'OrgA'),
    (gen_random_uuid(), 'OrgB')
ON CONFLICT (name) DO NOTHING;

-- Accounts (one per org)
WITH o AS (
    SELECT name, id FROM orgs WHERE name IN ('OrgA','OrgB')
), u AS (
    SELECT clerk_id, id FROM users WHERE clerk_id IN ('clerk_user_A','clerk_user_B')
)
INSERT INTO accounts (id, org_id, owner_user_id, name, plan, status, is_default, created_at)
SELECT gen_random_uuid(), (SELECT id FROM o WHERE name='OrgA'),
       (SELECT id FROM u WHERE clerk_id='clerk_user_A'),
       'AcctA', 'Free', 'active', true, now()
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM o WHERE name='OrgB'),
       (SELECT id FROM u WHERE clerk_id='clerk_user_B'),
       'AcctB', 'Free', 'active', true, now()
ON CONFLICT (org_id, name) DO NOTHING;   -- <— updated


-- 4) Memberships
WITH a AS (SELECT name, id FROM accounts WHERE name IN ('AcctA','AcctB')),
     u AS (SELECT clerk_id, id FROM users WHERE clerk_id IN ('clerk_user_A','clerk_user_B'))
INSERT INTO memberships (id, user_id, account_id, role, created_at)
SELECT gen_random_uuid(),
       (SELECT id FROM u WHERE clerk_id = 'clerk_user_A'),
       (SELECT id FROM a WHERE name = 'AcctA'),
       'owner', now()
UNION ALL
SELECT gen_random_uuid(),
       (SELECT id FROM u WHERE clerk_id = 'clerk_user_B'),
       (SELECT id FROM a WHERE name = 'AcctB'),
       'owner', now()
ON CONFLICT DO NOTHING;

-- 5) Songs (force non-null account_id) — idempotent without constraints
WITH a AS (SELECT name, id FROM accounts)
INSERT INTO songs (id, title, created_at, updated_at, account_id, owner_clerk_id, tags, collaborators)
SELECT gen_random_uuid(), 'Song in A', now(), now(),
       (SELECT id FROM a WHERE name='AcctA'),
       'clerk_user_A', '{}'::jsonb, '[]'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM songs s
    WHERE s.title = 'Song in A'
      AND s.account_id = (SELECT id FROM a WHERE name='AcctA')
)
UNION ALL
SELECT gen_random_uuid(), 'Song in B', now(), now(),
       (SELECT id FROM a WHERE name='AcctB'),
       'clerk_user_B', '{}'::jsonb, '[]'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM songs s
    WHERE s.title = 'Song in B'
      AND s.account_id = (SELECT id FROM a WHERE name='AcctB')
);


-- 6) Backfill lyric_versions.account_id from songs
UPDATE lyric_versions lv
SET account_id = s.account_id
FROM songs s
WHERE lv.song_id = s.id
  AND (lv.account_id IS NULL OR lv.account_id <> s.account_id);

-- 7) Song authors
WITH u AS (SELECT clerk_id, id FROM users),
     s AS (SELECT title, id FROM songs)
INSERT INTO song_authors (id, song_id, user_id, role, created_at)
SELECT gen_random_uuid(),
       (SELECT id FROM s WHERE title='Song in A'),
       (SELECT id FROM u WHERE clerk_id='clerk_user_A'),
       'writer', now()
UNION ALL
SELECT gen_random_uuid(),
       (SELECT id FROM s WHERE title='Song in B'),
       (SELECT id FROM u WHERE clerk_id='clerk_user_B'),
       'writer', now()
ON CONFLICT DO NOTHING;

-- 8) Song account link history
INSERT INTO song_account_links (id, song_id, account_id, is_current, reason, created_at)
SELECT gen_random_uuid(), s.id, s.account_id, true, 'seed', now()
FROM songs s
         LEFT JOIN song_account_links l ON l.song_id = s.id AND l.is_current = true
WHERE s.account_id IS NOT NULL AND l.id IS NULL;
