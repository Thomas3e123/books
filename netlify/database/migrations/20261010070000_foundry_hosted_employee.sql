CREATE TABLE IF NOT EXISTS gravity_foundry_workspaces (
  id TEXT PRIMARY KEY,
  code VARCHAR(16) NOT NULL UNIQUE,
  restaurant_name TEXT NOT NULL,
  manager_key_hash TEXT NOT NULL UNIQUE,
  employee_pin_salt TEXT NOT NULL,
  employee_pin_hash TEXT NOT NULL,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gravity_foundry_sessions (
  token_hash TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES gravity_foundry_workspaces(id) ON DELETE CASCADE,
  role VARCHAR(16) NOT NULL DEFAULT 'staff',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gravity_foundry_sessions_workspace_idx ON gravity_foundry_sessions(workspace_id, expires_at);

CREATE TABLE IF NOT EXISTS gravity_foundry_activity (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES gravity_foundry_workspaces(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gravity_foundry_activity_workspace_created_idx ON gravity_foundry_activity(workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS gravity_foundry_messages (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES gravity_foundry_workspaces(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gravity_foundry_messages_workspace_created_idx ON gravity_foundry_messages(workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS gravity_foundry_training (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES gravity_foundry_workspaces(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gravity_foundry_training_workspace_created_idx ON gravity_foundry_training(workspace_id, created_at DESC);
