-- Seed Data for LJ University Event Management

-- 1. Create Users (Note: In a real Supabase app, these would be in auth.users too, 
-- but we'll populate our public.users table for the mock experience)
-- Using hardcoded UUIDs for consistency in seeding

INSERT INTO users (id, email, full_name, role)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@lj.edu', 'Admin Superuser', 'admin'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'rajesh.k@tcs.com', 'Dr. Rajesh Kumar', 'mentor'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'sarah.chen@google.com', 'Sarah Chen', 'mentor'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'arjun.m@student.lj.edu', 'Arjun Mehta', 'student')
ON CONFLICT (email) DO NOTHING;

-- 2. Create Mentor Profiles
INSERT INTO mentor_profiles (user_id, company, domain, experience, bank_name, acc_no, ifsc, branch)
VALUES 
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'TCS Research', 'AI/ML', '12+ Years', 'HDFC Bank', 'XXXX 5092', 'HDFC0001234', 'Ahmedabad'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Google India', 'Full Stack', '8+ Years', 'ICICI Bank', 'XXXX 8821', 'ICIC0005678', 'Gandhinagar')
ON CONFLICT (user_id) DO NOTHING;

-- 3. Create Event
INSERT INTO events (id, name, description, event_date, status, created_by)
VALUES 
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Innovate LJ 2026', 'Annual tech innovation competition.', CURRENT_DATE + INTERVAL '30 days', 'active', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

-- 4. Create Evaluation Criteria
INSERT INTO evaluation_criteria (id, event_id, criteria_name, max_score, weight, display_order)
VALUES 
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'UI/UX Design', 10, 25, 1),
  ('11eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Technical Complexity', 10, 35, 2),
  ('22eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Innovation', 10, 40, 3)
ON CONFLICT (id) DO NOTHING;

-- 5. Create Teams
INSERT INTO teams (id, event_id, team_name, domain, stall_no, school_name)
VALUES 
  ('33eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Bio-Sync Pro', 'Healthcare', 'B-12', 'School of Engineering'),
  ('44eebc99-9c0b-4ef8-bb6d-6bb9bd380b00', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Eco-Track', 'Sustainability', 'C-05', 'School of Applied Sciences')
ON CONFLICT (id) DO NOTHING;

-- 6. Assign Judges to Teams
INSERT INTO team_judges (team_id, judge_id, status)
VALUES 
  ('33eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'in_progress'),
  ('44eebc99-9c0b-4ef8-bb6d-6bb9bd380b00', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'pending')
ON CONFLICT (team_id, judge_id) DO NOTHING;

-- 7. Add team members
INSERT INTO team_members (team_id, user_id, role)
VALUES 
  ('33eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'lead')
ON CONFLICT (team_id, user_id) DO NOTHING;
