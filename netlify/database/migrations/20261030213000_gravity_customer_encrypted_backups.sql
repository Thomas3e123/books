-- Gravity encrypted account backups: additive tables only.
-- Identity id is established server-side by @netlify/identity, NEVER from request JSON.
-- The only uploaded content is client-encrypted AES-GCM envelope.
CREATE TABLE IF NOT EXISTS gravity_customer_backup_snapshots (
  identity_user_id TEXT NOT NULL,
  tool VARCHAR(16) NOT NULL CHECK (tool IN ('shift','inventory')),
  revision INTEGER NOT NULL CHECK (revision > 0),
  envelope JSONB NOT NULL,
  envelope_bytes INTEGER NOT NULL CHECK (envelope_bytes > 0 AND envelope_bytes <= 900000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (identity_user_id, tool, revision)
);
CREATE INDEX IF NOT EXISTS gravity_customer_backup_latest_idx
ON gravity_customer_backup_snapshots(identity_user_id, tool, revision DESC);
