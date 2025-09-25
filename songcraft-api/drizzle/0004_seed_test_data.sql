-- Seed test data for project-level permission system
-- This script creates sample data to test the new permission system

-- Insert test organizations
INSERT INTO orgs (id, name, status) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Test Publishing Co', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Independent Music', 'active');

-- Insert test users
INSERT INTO users (id, clerk_id, email) VALUES 
('550e8400-e29b-41d4-a716-446655440010', 'user_test_garth', 'garth@example.com'),
('550e8400-e29b-41d4-a716-446655440011', 'user_test_marcus', 'marcus@example.com'),
('550e8400-e29b-41d4-a716-446655440012', 'user_test_elena', 'elena@example.com'),
('550e8400-e29b-41d4-a716-446655440013', 'user_test_alex', 'alex@example.com'),
('550e8400-e29b-41d4-a716-446655440014', 'user_test_sarah', 'sarah@example.com');

-- Insert test accounts
INSERT INTO accounts (id, org_id, owner_user_id, name, plan, status) VALUES 
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 'Garth''s Personal Workspace', 'Pro', 'active'),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440014', 'Publishing Account', 'Enterprise', 'active'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440013', 'Alex''s Learning Account', 'Free', 'active');

-- Insert memberships
INSERT INTO memberships (id, user_id, account_id, role) VALUES 
-- Garth's account
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440020', 'owner'),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440020', 'member'),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440020', 'member'),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440020', 'member'),

-- Publishing account
('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440021', 'owner'),

-- Alex's account
('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440022', 'owner');

-- Insert projects
INSERT INTO projects (id, account_id, name, description, created_by) VALUES 
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440020', 'Summer 2024 Album', 'Main album project for summer release', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440020', 'Solo Work', 'Personal solo projects', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440021', 'Artist A''s Album', 'Publishing project for Artist A', '550e8400-e29b-41d4-a716-446655440014'),
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440022', 'Learning Projects', 'Alex''s learning and practice projects', '550e8400-e29b-41d4-a716-446655440013');

-- Insert project permissions
INSERT INTO project_permissions (id, project_id, user_id, permission_level, granted_by) VALUES 
-- Summer 2024 Album permissions
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440011', 'read_write', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440012', 'read_notes', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440013', 'read', '550e8400-e29b-41d4-a716-446655440010'),

-- Solo Work permissions
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440011', 'read_notes', '550e8400-e29b-41d4-a716-446655440010'),

-- Artist A's Album permissions
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440010', 'read_write', '550e8400-e29b-41d4-a716-446655440014');

-- Insert sessions
INSERT INTO sessions (id, project_id, name, description, session_type, status, scheduled_start, created_by) VALUES 
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440040', 'Writing Session - Track 1', 'Initial writing session for first track', 'writing', 'scheduled', '2024-02-01 14:00:00+00', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440040', 'Feedback Session', 'Review and feedback session', 'feedback', 'scheduled', '2024-02-02 10:00:00+00', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440040', 'Recording Session', 'Record final versions', 'recording', 'scheduled', '2024-02-03 16:00:00+00', '550e8400-e29b-41d4-a716-446655440010');

-- Insert session participants
INSERT INTO session_participants (id, session_id, user_id, status) VALUES 
-- Writing Session participants
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440010', 'accepted'),
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440011', 'accepted'),

-- Feedback Session participants
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440010', 'accepted'),
('550e8400-e29b-41d4-a716-446655440073', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440012', 'invited'),

-- Recording Session participants
('550e8400-e29b-41d4-a716-446655440074', '550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440010', 'accepted'),
('550e8400-e29b-41d4-a716-446655440075', '550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440011', 'accepted');

-- Insert test songs
INSERT INTO songs (id, short_id, owner_clerk_id, title, artist, account_id, project_id) VALUES 
('550e8400-e29b-41d4-a716-446655440080', 'song001', 'user_test_garth', 'Summer Nights', 'Garth', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440040'),
('550e8400-e29b-41d4-a716-446655440081', 'song002', 'user_test_garth', 'City Lights', 'Garth', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440040'),
('550e8400-e29b-41d4-a716-446655440082', 'song003', 'user_test_garth', 'Solo Piece', 'Garth', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440041'),
('550e8400-e29b-41d4-a716-446655440083', 'song004', 'user_test_alex', 'Learning Song', 'Alex', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440043');

-- Insert song authors
INSERT INTO song_authors (id, song_id, user_id, role) VALUES 
('550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440010', 'writer'),
('550e8400-e29b-41d4-a716-446655440091', '550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440011', 'co-writer'),
('550e8400-e29b-41d4-a716-446655440092', '550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440010', 'writer'),
('550e8400-e29b-41d4-a716-446655440093', '550e8400-e29b-41d4-a716-446655440082', '550e8400-e29b-41d4-a716-446655440010', 'writer'),
('550e8400-e29b-41d4-a716-446655440094', '550e8400-e29b-41d4-a716-446655440083', '550e8400-e29b-41d4-a716-446655440013', 'writer');
