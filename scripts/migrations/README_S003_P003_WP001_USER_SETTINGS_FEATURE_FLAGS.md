# S003-P003-WP001 — `user_data.users.settings` + `admin_data.feature_flags`

**Canonical migration file (repo):** `scripts/migrations/s003_p003_wp001_user_settings_feature_flags.sql`

## What it does

1. `CREATE SCHEMA IF NOT EXISTS admin_data`
2. `ALTER TABLE user_data.users ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb`
3. `CREATE TABLE IF NOT EXISTS admin_data.feature_flags` (+ FK to `user_data.users`)
4. Seed three feature-flag rows (LLD)
5. **`GRANT`** for runtime DB user **`TikTrackDbAdmin`**: `USAGE` on `admin_data`, `SELECT/INSERT/UPDATE` on `feature_flags`  
   - Required for `GET /api/v1/admin/feature-flags` (otherwise PostgreSQL returns *permission denied* → HTTP 500)

## Apply

**Role / privileges:** Run as a database role that can `CREATE` in `admin_data` (typically the **`postgres`** superuser or the DB owner).  
The app runtime user `TikTrackDbAdmin` **cannot** create the table; the script ends with `GRANT` so that user can read/write `feature_flags` after objects exist.

```bash
# Example (adjust user/host to your environment):
psql "postgresql://postgres:YOUR_PASSWORD@localhost:5432/TikTrack-phoenix-db" \
  -v ON_ERROR_STOP=1 -f scripts/migrations/s003_p003_wp001_user_settings_feature_flags.sql
```

If `api/.env` points only at `TikTrackDbAdmin`, use a superuser URL for this one command, then keep using the app user for normal operation.

## Order with QA seed

`scripts/seed_qa_test_user.py` runs this migration **before** `seed_qa_test_user.sql` so a fresh DB has `settings` + grants before the ORM touches users.

## ORM mapping

- `api/models/identity.py` — `User.settings`
- `api/models/feature_flags.py` — `FeatureFlag`
