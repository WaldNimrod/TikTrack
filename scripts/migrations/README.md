# Database migrations — index (Team 60 / operators)

**project_domain:** TIKTRACK

Canonical SQL files live under `scripts/migrations/`. Apply with **`psql`** as a role that can `CREATE` schemas/tables (typically **`postgres`** or DB owner), **not** only as `TikTrackDbAdmin` unless objects already exist and you only need GRANTs.

## S003-P003-WP001 — user settings + feature flags

| Item | Path |
|------|------|
| **SQL** | `s003_p003_wp001_user_settings_feature_flags.sql` |
| **Apply / GRANT / order with seed** | `README_S003_P003_WP001_USER_SETTINGS_FEATURE_FLAGS.md` |

**One-liner (adjust URL):**

```bash
psql "$SUPERUSER_DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f scripts/migrations/s003_p003_wp001_user_settings_feature_flags.sql
```

After apply, `GET /api/v1/admin/feature-flags` with `TikTrackAdmin` JWT should return **200** (see Team 20 completion doc).

## Other migration READMEs

- `README_ADR_015_MIGRATION.md`
- `README_CURRENCY_CONVERSION_FLOW_TYPE.md`
- `README_D16_ACCOUNT_NUMBER_UNIQUE.md`
- `README_TRADING_ACCOUNT_FEES_MIGRATION.md`

## CI note

`.github/workflows/ci.yml` runs **pytest** with a dummy `DATABASE_URL`; it does **not** execute these SQL files against a live Postgres. **Rollout** (dev/staging/production) is an operator step after merge, per this folder’s READMEs.

---

**log_entry | TEAM_60 | migrations/README | INDEX | 2026-03-22**
