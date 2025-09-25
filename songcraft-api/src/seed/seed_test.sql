SELECT name, id FROM accounts ORDER BY name;

SET app.account_id = '<id of AcctA>';
SELECT title, account_id FROM songs ORDER BY title;
-- Expect only "Song in A"
SET app.account_id = '<id of AcctB>';
SELECT title, account_id FROM songs ORDER BY title;
-- Expect only "Song in B"
SET app.account_id = '<id of AcctA>';
INSERT INTO songs (id, title, created_at, updated_at, account_id)
VALUES (gen_random_uuid(), 'Cross Tenant Bad', now(), now(), '<id of AcctB>');
-- Should error due to WITH CHECK policy
