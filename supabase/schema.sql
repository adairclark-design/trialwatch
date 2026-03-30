-- Run this in Supabase SQL editor to create all tables
-- Go to: supabase.com → Your Project → SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Alert profiles: one per center/investigator saved search
CREATE TABLE IF NOT EXISTS alert_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  conditions TEXT[] NOT NULL DEFAULT '{}',
  statuses TEXT[] NOT NULL DEFAULT '{RECRUITING,NOT_YET_RECRUITING}',
  country TEXT NOT NULL DEFAULT 'United States',
  phases TEXT[] DEFAULT NULL,
  sponsor_types TEXT[] DEFAULT NULL,
  email TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'weekly',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NULL
);

-- Trial snapshots: track which trials were seen for each profile
CREATE TABLE IF NOT EXISTS trial_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES alert_profiles(id) ON DELETE CASCADE,
  nct_id TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  status_at_snapshot TEXT NOT NULL,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, nct_id)
);

-- Digest log: audit trail of all emails sent
CREATE TABLE IF NOT EXISTS digest_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES alert_profiles(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  new_trials_count INTEGER NOT NULL DEFAULT 0,
  changed_trials_count INTEGER NOT NULL DEFAULT 0,
  email_sent_to TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alert_profiles_user_id ON alert_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_profiles_active ON alert_profiles(active);
CREATE INDEX IF NOT EXISTS idx_trial_snapshots_profile_id ON trial_snapshots(profile_id);
CREATE INDEX IF NOT EXISTS idx_trial_snapshots_nct_id ON trial_snapshots(nct_id);

-- Row Level Security: users can only see their own profiles
ALTER TABLE alert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profiles"
  ON alert_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own snapshots"
  ON trial_snapshots FOR SELECT
  USING (profile_id IN (SELECT id FROM alert_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own digest log"
  ON digest_log FOR SELECT
  USING (profile_id IN (SELECT id FROM alert_profiles WHERE user_id = auth.uid()));

-- Service role bypass (needed for cron job)
CREATE POLICY "Service role can manage all snapshots"
  ON trial_snapshots FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all digest logs"
  ON digest_log FOR ALL
  USING (auth.role() = 'service_role');
