CREATE TABLE IF NOT EXISTS gravity_testing_testers (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Gravity Tester',
  email TEXT,
  interests JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(24) NOT NULL DEFAULT 'new',
  helpful_level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_tester_message_at TIMESTAMPTZ,
  last_manager_message_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS gravity_testing_testers_status_idx ON gravity_testing_testers(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS gravity_testing_messages (
  id TEXT PRIMARY KEY,
  tester_id TEXT NOT NULL REFERENCES gravity_testing_testers(id) ON DELETE CASCADE,
  sender VARCHAR(16) NOT NULL,
  kind VARCHAR(24) NOT NULL DEFAULT 'other',
  body TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  screenshot_data TEXT,
  read_by_manager BOOLEAN NOT NULL DEFAULT FALSE,
  read_by_tester BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gravity_testing_messages_tester_created_idx ON gravity_testing_messages(tester_id, created_at ASC);
CREATE INDEX IF NOT EXISTS gravity_testing_messages_manager_unread_idx ON gravity_testing_messages(read_by_manager, created_at DESC);
