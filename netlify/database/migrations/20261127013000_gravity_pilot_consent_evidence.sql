ALTER TABLE gravity_pilot_participants
  ADD COLUMN IF NOT EXISTS consent_version TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS consent_accepted_at TIMESTAMPTZ;
