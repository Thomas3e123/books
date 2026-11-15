CREATE TABLE gravity_pilot_participants (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  restaurant_type TEXT NOT NULL DEFAULT '',
  issue_area TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enrolled',
  qualifying_contribution BOOLEAN NOT NULL DEFAULT FALSE,
  final_version_awarded BOOLEAN NOT NULL DEFAULT FALSE,
  lifetime_library_awarded BOOLEAN NOT NULL DEFAULT FALSE,
  manager_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX gravity_pilot_participants_status_updated_idx ON gravity_pilot_participants(status, updated_at DESC);
CREATE INDEX gravity_pilot_participants_email_idx ON gravity_pilot_participants(LOWER(email));

CREATE TABLE gravity_pilot_plans (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL UNIQUE REFERENCES gravity_pilot_participants(id) ON DELETE CASCADE,
  issue_area TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  system_owner TEXT NOT NULL,
  baseline_measure TEXT NOT NULL,
  baseline_source TEXT NOT NULL DEFAULT '',
  baseline_recorded BOOLEAN NOT NULL DEFAULT FALSE,
  selected_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  pace_days INTEGER NOT NULL CHECK (pace_days IN (30, 60)),
  start_date DATE NOT NULL,
  first_review_date DATE NOT NULL,
  midpoint_date DATE NOT NULL,
  target_end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX gravity_pilot_plans_participant_idx ON gravity_pilot_plans(participant_id);

CREATE TABLE gravity_pilot_entries (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL REFERENCES gravity_pilot_participants(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('weekly_checkin','midpoint_review','final_review','issue_report','feedback')),
  title TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX gravity_pilot_entries_participant_created_idx ON gravity_pilot_entries(participant_id, created_at DESC);

CREATE TABLE gravity_pilot_messages (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL REFERENCES gravity_pilot_participants(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('participant','manager')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_by_manager BOOLEAN NOT NULL DEFAULT FALSE,
  read_by_participant BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX gravity_pilot_messages_participant_created_idx ON gravity_pilot_messages(participant_id, created_at ASC);

CREATE TABLE gravity_pilot_manager_attempts (
  ip_hash TEXT PRIMARY KEY,
  failed_count INTEGER NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_until TIMESTAMPTZ
);
