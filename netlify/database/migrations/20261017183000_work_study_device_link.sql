CREATE TABLE IF NOT EXISTS gravity_work_study_links (
  id TEXT PRIMARY KEY,
  study_id TEXT NOT NULL,
  pair_code VARCHAR(12) NOT NULL UNIQUE,
  owner_token_hash TEXT NOT NULL UNIQUE,
  device_token_hash TEXT UNIQUE,
  snapshot JSONB NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (revision > 0),
  CHECK (status IN ('open','ended'))
);

CREATE INDEX IF NOT EXISTS gravity_work_study_links_code_idx
  ON gravity_work_study_links(pair_code, expires_at);
CREATE INDEX IF NOT EXISTS gravity_work_study_links_study_idx
  ON gravity_work_study_links(study_id, updated_at DESC);
