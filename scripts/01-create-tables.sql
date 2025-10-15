-- Events table: stores pickleball events/sessions
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  court_count INTEGER NOT NULL DEFAULT 1,
  team_size INTEGER NOT NULL DEFAULT 2, -- 1=solo(1v1), 2=doubles(2v2), 3=triplets(3v3), 4=quads(4v4)
  rotation_type TEXT NOT NULL DEFAULT '2-stay-4-off', -- '2-stay-4-off', 'winners-stay', 'rotate-all'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'ended'
  created_at TIMESTAMP DEFAULT NOW (),
  updated_at TIMESTAMP DEFAULT NOW ()
);

-- Users table: stores player information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  skill_level TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'pro'
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW ()
);

-- Queue entries: players waiting to play
CREATE TABLE IF NOT EXISTS queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  event_id UUID REFERENCES events (id) ON DELETE CASCADE,
  user_id UUID REFERENCES users (id) ON DELETE CASCADE,
  group_id UUID, -- for duo/triple/quad groups
  group_size INTEGER DEFAULT 1, -- 1=solo, 2=duo, 3=triple, 4=quad
  position INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'playing', 'completed'
  joined_at TIMESTAMP DEFAULT NOW (),
  UNIQUE (event_id, user_id)
);

-- Court assignments: current games in progress
CREATE TABLE IF NOT EXISTS court_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  event_id UUID REFERENCES events (id) ON DELETE CASCADE,
  court_number INTEGER NOT NULL,
  player1_id UUID REFERENCES users (id),
  player2_id UUID REFERENCES users (id),
  player3_id UUID REFERENCES users (id),
  player4_id UUID REFERENCES users (id),
  player5_id UUID REFERENCES users (id),
  player6_id UUID REFERENCES users (id),
  player7_id UUID REFERENCES users (id),
  player8_id UUID REFERENCES users (id),
  started_at TIMESTAMP DEFAULT NOW (),
  ended_at TIMESTAMP,
  UNIQUE (event_id, court_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_queue_entries_event ON queue_entries (event_id);

CREATE INDEX IF NOT EXISTS idx_queue_entries_status ON queue_entries (status);

CREATE INDEX IF NOT EXISTS idx_court_assignments_event ON court_assignments (event_id);

CREATE INDEX IF NOT EXISTS idx_events_status ON events (status);
