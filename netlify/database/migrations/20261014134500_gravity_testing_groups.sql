CREATE TABLE IF NOT EXISTS gravity_testing_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  purpose TEXT,
  created_by_tester_id TEXT REFERENCES gravity_testing_testers(id) ON DELETE SET NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'open',
  join_code VARCHAR(24) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gravity_testing_groups_status_idx ON gravity_testing_groups(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS gravity_testing_group_members (
  group_id TEXT NOT NULL REFERENCES gravity_testing_groups(id) ON DELETE CASCADE,
  tester_id TEXT NOT NULL REFERENCES gravity_testing_testers(id) ON DELETE CASCADE,
  role VARCHAR(24) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, tester_id)
);

CREATE TABLE IF NOT EXISTS gravity_testing_group_messages (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES gravity_testing_groups(id) ON DELETE CASCADE,
  tester_id TEXT REFERENCES gravity_testing_testers(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  body TEXT NOT NULL,
  kind VARCHAR(24) NOT NULL DEFAULT 'message',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gravity_testing_group_messages_group_created_idx ON gravity_testing_group_messages(group_id, created_at ASC);
