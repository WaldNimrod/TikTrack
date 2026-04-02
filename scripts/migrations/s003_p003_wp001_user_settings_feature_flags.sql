-- S003-P003-WP001 — D39 settings column + D40 feature_flags (LLD §3.2)
-- Apply: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/migrations/s003_p003_wp001_user_settings_feature_flags.sql

CREATE SCHEMA IF NOT EXISTS admin_data;

ALTER TABLE user_data.users
ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS admin_data.feature_flags (
    key VARCHAR(100) PRIMARY KEY,
    value_bool BOOLEAN,
    value_text VARCHAR(500),
    description TEXT,
    updated_by UUID REFERENCES user_data.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO admin_data.feature_flags (key, value_bool, description) VALUES
  ('maintenance_mode', false, 'Put system into read-only maintenance mode'),
  ('smtp_enabled', false, 'Enable outbound email notifications'),
  ('new_user_registration_enabled', true, 'Allow new user self-registration')
ON CONFLICT (key) DO NOTHING;

-- Runtime app user (see TT2_DATABASE_CREDENTIALS / g7_M005b) — without this, GET /admin/feature-flags → 500 (permission denied)
GRANT USAGE ON SCHEMA admin_data TO "TikTrackDbAdmin";
GRANT SELECT, INSERT, UPDATE ON admin_data.feature_flags TO "TikTrackDbAdmin";
