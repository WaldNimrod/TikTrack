# ============================================
# Makefile - TikTrack Phoenix v2
# Team 60 (DevOps & Platform)
# ============================================

.PHONY: db-backup db-test-clean db-test-fill db-backup-then-fill db-test-report help portfolio-pre-push-guard install-pre-push-hook bootstrap-quality-tools verify-quality-tools install-pre-commit run-pre-commit-all

# Database connection (from .env)
DATABASE_URL ?= $(shell grep DATABASE_URL api/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'")

# Convert asyncpg URL to psycopg2 format
DB_URL := $(shell echo $(DATABASE_URL) | sed 's/postgresql+asyncpg:\/\//postgresql:\/\//')

# ============================================
# Database Backup (before seed — mandatory)
# ============================================

## Validate WSM/registry/snapshot consistency before push when outgoing commits touch portfolio authority files.
portfolio-pre-push-guard:
	@bash scripts/portfolio/guard_wsm_registry_sync_before_push.sh

## Install the versioned pre-push hook locally for this clone.
install-pre-push-hook:
	@mkdir -p .git/hooks
	@cp scripts/git-hooks/pre-push .git/hooks/pre-push
	@chmod +x .git/hooks/pre-push
	@echo "✅ Installed local pre-push hook."

## Install reproducible quality toolchain (bandit, pip-audit, detect-secrets, mypy) in api/venv.
bootstrap-quality-tools:
	@bash scripts/bootstrap-quality-tools.sh

## Verify quality tools are available in api/venv.
verify-quality-tools:
	@bash -lc '. api/venv/bin/activate && bandit --version && pip-audit --version && detect-secrets --version && mypy --version'

## Install pre-commit hooks for this clone.
install-pre-commit:
	@bash -lc '. api/venv/bin/activate && pre-commit install'
	@echo "✅ Installed pre-commit hooks."

## Run pre-commit hooks across entire repository.
run-pre-commit-all:
	@bash -lc '. api/venv/bin/activate && pre-commit run --all-files'

## Full DB backup + verify (run before seed). Exit 0 only if backup created and verified.
db-backup:
	@echo "💾 Creating full database backup..."
	@python3 scripts/create_full_backup.py
	@echo "✅ Backup created and verified. Safe to run seed."

# ============================================
# Database Test Operations
# ============================================

## Clean test data (is_test_data = true) from database
db-test-clean:
	@echo "🧹 Cleaning test data from database..."
	@python3 scripts/db_test_clean.py
	@echo "✅ Database cleaned successfully. Test data removed."
	@echo "✅ Base data preserved. Database is sterile."

## Fill database with test data (is_test_data = true). Prefer: make db-backup-then-fill.
db-test-fill:
	@echo "🌱 Filling database with test data..."
	@python3 scripts/seed_test_data.py
	@echo "✅ Test data seeded successfully."

## Report users and record counts (base vs test data)
db-test-report:
	@python3 scripts/db_test_data_report.py

## Seed base dataset for test_user (is_test_data=false, minimal representative)
db-base-seed:
	@python3 scripts/seed_base_test_user.py

## Reduce TikTrackAdmin base data to minimal (מנהל ראשי)
db-admin-minimal:
	@python3 scripts/reduce_admin_base_to_minimal.py

## Remove superfluous users (keeps TikTrackAdmin, nimrod_wald, test_user)
db-remove-superfluous-users:
	@python3 scripts/db_remove_superfluous_users.py

## Backup DB, verify backup, then seed test data (recommended flow).
db-backup-then-fill: db-backup
	@echo "🌱 Seeding test data (backup already verified)..."
	@python3 scripts/seed_test_data.py
	@echo "✅ Test data seeded successfully."

## P3-020: user_data.user_tickers + market_data.tickers.status (User Tickers)
migrate-p3-020:
	@echo "🔄 P3-020 — user_tickers + tickers.status"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/p3_020_user_tickers_and_ticker_status.sql
	@echo "✅ P3-020 migration complete."

## P3-021: market_data reference tables (exchanges, sectors, industries, market_cap_groups)
migrate-p3-021:
	@echo "🔄 P3-021 — market_data reference tables (unblock POST /me/tickers)"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/p3_021_market_data_reference_tables.sql
	@echo "✅ P3-021 migration complete."

## MD-SETTINGS: market_data.system_settings (Gate-A; PATCH /settings/market-data)
migrate-md-settings:
	@echo "🔄 MD-SETTINGS — market_data.system_settings"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/md_system_settings.sql
	@echo "✅ MD-SETTINGS migration complete."

## Verify market_data.system_settings exists (uses api/.env DATABASE_URL)
verify-md-settings:
	@python3 scripts/verify_md_system_settings.py

## Seed 2 demo notes for TikTrackAdmin (חשבון מסחר + AAPL; אחת עם קובץ)
seed-admin-notes-demo:
	@echo "🌱 Seeding admin demo notes..."
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/seed_admin_notes_demo.sql
	@echo "✅ Admin demo notes seeded."

## D34 Alerts — user_data.alerts (MB3A עמוד התראות)
migrate-d34-alerts:
	@echo "🔄 D34 — user_data.alerts"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/d34_alerts.sql
	@echo "✅ D34 alerts migration complete."

## D35 Notes — user_data.note_attachments (MB3A, D35_RICH_TEXT_ATTACHMENTS_LOCK)
migrate-d35-notes:
	@echo "🔄 D35 — user_data.note_attachments"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/d35_note_attachments.sql
	@echo "✅ D35 note_attachments migration complete."

## G7 S002-P003-WP002 Phase A — M-001..M-007 (ARCHITECT_DIRECTIVE_G7_REMEDIATION)
migrate-g7-M001:
	@echo "🔄 G7 M-001 — user_tickers status, notes"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/g7_M001_user_tickers_status_notes.sql
	@echo "✅ G7 M-001 complete."

migrate-g7-M002:
	@echo "🔄 G7 M-002 — alerts trigger_status"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/g7_M002_alerts_trigger_status.sql
	@echo "✅ G7 M-002 complete."

migrate-g7-M003:
	@echo "🔄 G7 M-003 — notifications table"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/g7_M003_notifications.sql
	@echo "✅ G7 M-003 complete."

migrate-g7-M004:
	@echo "🔄 G7 M-004 — admin_data schema"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/g7_M004_admin_data_schema.sql
	@echo "✅ G7 M-004 complete."

migrate-g7-M005:
	@echo "🔄 G7 M-005 — job_run_log"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/g7_M005_job_run_log.sql
	@echo "✅ G7 M-005 complete."

migrate-g7-M005b-extended:
	@echo "🔄 G7 M-005b — job_run_log extended schema"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db -v ON_ERROR_STOP=1 < scripts/migrations/g7_M005b_job_run_log_extended.sql
	@echo "✅ G7 M-005b complete."

## G7 Phase A (PHASE_A_ACTIVATION order: M-001..M-004, M-005b, M-006, M-007)
migrate-g7-phase-a:
	@echo "🔄 G7 Phase A — migrations (ON_ERROR_STOP=1)"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db -v ON_ERROR_STOP=1 < scripts/migrations/g7_M001_user_tickers_status_notes.sql
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db -v ON_ERROR_STOP=1 < scripts/migrations/g7_M002_alerts_trigger_status.sql
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db -v ON_ERROR_STOP=1 < scripts/migrations/g7_M003_notifications.sql
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db -v ON_ERROR_STOP=1 < scripts/migrations/g7_M004_admin_data_schema.sql
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db -v ON_ERROR_STOP=1 < scripts/migrations/g7_M005b_job_run_log_extended.sql
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db -v ON_ERROR_STOP=1 < scripts/migrations/g7_M006_tickers_status_verify.sql
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db -v ON_ERROR_STOP=1 < scripts/migrations/g7_M007_alerts_data_migration.sql
	@echo "✅ G7 Phase A complete."

migrate-g7-M005b:
	@echo "🔄 G7 M-005b — grant TikTrackDbAdmin on admin_data"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/g7_M005b_grant_admin_data.sql
	@echo "✅ G7 M-005b complete."

migrate-g7-M006:
	@echo "🔄 G7 M-006 — tickers status verify"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/g7_M006_tickers_status_verify.sql
	@echo "✅ G7 M-006 complete."

migrate-g7-M007:
	@echo "🔄 G7 M-007 — alerts data migration"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/g7_M007_alerts_data_migration.sql
	@echo "✅ G7 M-007 complete."

migrate-g7-all: migrate-g7-M001 migrate-g7-M002 migrate-g7-M003 migrate-g7-M004 migrate-g7-M005 migrate-g7-M006 migrate-g7-M007
	@echo "✅ G7 Phase A migrations M-001..M-007 complete."

## G7 Phase A rollback (reverse order: M007..M001; M006 optional)
rollback-g7-all:
	@echo "🔄 G7 Rollback M-007..M-001"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/g7_M007_rollback.sql
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/g7_M005_rollback.sql
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/g7_M004_rollback.sql
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/g7_M003_rollback.sql
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/g7_M002_rollback.sql
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/g7_M001_rollback.sql
	@echo "✅ G7 Phase A rollback complete."

## P3-019: market_cap NUMERIC(24,4) for mega caps (>1T overflow fix)
migrate-p3-019:
	@echo "🔄 P3-019 — market_cap precision (24,4)"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/p3_019_market_cap_precision_mega_caps.sql
	@echo "✅ P3-019 migration complete."

## Ensure ticker_prices partitions (2025–2027)
ensure-ticker-prices-partitions:
	@echo "🔄 Ensuring ticker_prices partitions"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/ensure_ticker_prices_partitions.sql
	@echo "✅ Partitions ensured."

## P3-018: exchange_rates_history (Option A — approved)
migrate-p3-018:
	@echo "🔄 P3-018 — exchange_rates_history"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/p3_018_exchange_rates_history.sql
	@echo "✅ P3-018 migration complete."

## P3-013: Add market_cap to ticker_prices (run as table owner tiktrack)
migrate-p3-013:
	@echo "🔄 P3-013 — add market_cap to ticker_prices"
	@docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/p3_013_add_market_cap_to_ticker_prices.sql
	@echo "✅ P3-013 migration complete."

## EOD Sync — exchange_rates (P3-011; Alpha→Yahoo)
sync-eod:
	@echo "🔄 EOD sync — exchange_rates"
	@python3 scripts/sync_exchange_rates_eod.py
	@echo "✅ EOD sync complete."

## Seed market_data.tickers (AAPL, MSFT, TSLA, …) — required before sync
seed-tickers:
	@echo "🔄 Seeding market_data.tickers"
	@python3 scripts/seed_market_data_tickers.py
	@echo "✅ Tickers seeded."

## EOD Sync — ticker_prices (Gate B; Yahoo→Alpha) — uses tickers from market_data.tickers
sync-ticker-prices:
	@echo "🔄 EOD sync — ticker_prices"
	@python3 scripts/sync_ticker_prices_eod.py
	@echo "✅ Ticker prices EOD sync complete."

## Intraday Sync — ticker_prices_intraday (Active tickers; Yahoo→Alpha)
sync-intraday:
	@echo "🔄 Intraday sync — ticker_prices_intraday"
	@python3 scripts/sync_ticker_prices_intraday.py
	@echo "✅ Intraday sync complete."

## History Backfill — 250d OHLCV for tickers with < 250 rows (Indicators ATR/MA/CCI, SSOT)
sync-history-backfill:
	@echo "🔄 History backfill — 250d OHLCV"
	@python3 scripts/sync_ticker_prices_history_backfill.py
	@echo "✅ History backfill complete."

## Ensure QA ticker 250d — לפחות טיקר אחד עם 250+ שורות (TEAM_10_SMART_HISTORY_FILL_QA_URGENT_FIXES)
ensure-qa-ticker-250d:
	@python3 scripts/ensure_qa_ticker_250d.py

## Yahoo heartbeat — אות חיים (הכי פשוט: יום אחד מהספק). proof of connection
yahoo-heartbeat:
	@python3 scripts/yahoo_heartbeat.py

## Yahoo 250d — אימות מלא (סקופ, דיוק, השלמות)
verify-yahoo-250d:
	@python3 scripts/verify_yahoo_250d.py

## Check market_data counts (tickers, ticker_prices, exchange_rates) — Team 10/50
check-market-data-counts:
	@python3 scripts/check_market_data_counts.py

## Cleanup — market data (P3-017)
cleanup-market-data:
	@echo "🔄 Cleanup — market data"
	@python3 scripts/cleanup_market_data.py
	@echo "✅ Cleanup complete."

## Suite A: Contract & Schema (Smoke) — Automated Testing Mandate
test-suite-a:
	@echo "🔄 Suite A — Contract & Schema"
	@python3 tests/external_data_suite_a_contract_schema.py
	@echo "✅ Suite A complete."

## Suite B: Cache-First + Failover (Smoke) — mode=REPLAY, zero HTTP
test-suite-b:
	@echo "🔄 Suite B — Cache-First + Failover"
	@python3 -m pytest tests/test_external_data_cache_failover_pytest.py -v
	@echo "✅ Suite B complete."

## Smoke: Suites A + B + D (PR/commit — REPLAY, no external calls)
test-external-data-smoke: test-suite-a test-suite-b test-suite-d
	@echo "✅ External Data Smoke complete."

## Suite D: Retention & Cleanup — Smoke/Nightly test (Automated Testing Mandate)
test-suite-d:
	@echo "🔄 Suite D — Retention & Cleanup"
	@python3 tests/test_retention_cleanup_suite_d.py
	@echo "✅ Suite D complete."

## Suite E: UI (Clock + Tooltip) — Nightly test (Team 30; requires frontend 8080 + backend 8082)
test-suite-e:
	@echo "🔄 Suite E — UI Staleness Clock + Tooltip"
	@cd tests && npm run test:external-data-suite-e
	@echo "✅ Suite E complete."

## D33 Parallel Create — G7R Batch5 integration test (requires api/.env, DB)
test-d33-parallel:
	@bash scripts/run-d33-parallel-create-test.sh

## Help
help:
	@echo "Available targets:"
	@echo "  make db-backup           - Full DB backup + verify (run before seed)"
	@echo "  make db-backup-then-fill - Backup, verify, then seed test data (recommended)"
	@echo "  make db-test-clean       - Delete all test data (is_test_data = true)"
	@echo "  make db-test-fill        - Seed test data only (no backup)"
	@echo "  make db-test-report     - Report users + record counts (base vs test)"
	@echo "  make bootstrap-quality-tools - Install quality tools in api/venv (bandit, pip-audit, detect-secrets, mypy)"
	@echo "  make verify-quality-tools - Verify quality tools are available in api/venv"
	@echo "  make install-pre-commit - Install pre-commit hooks in .git/hooks"
	@echo "  make run-pre-commit-all - Run pre-commit hooks for all files"
	@echo "  make db-base-seed       - Seed base dataset for test_user"
	@echo "  make db-admin-minimal   - Reduce TikTrackAdmin base to minimal"
	@echo "  make seed-tickers       - Seed market_data.tickers (required before sync)"
	@echo "  make sync-eod           - EOD sync exchange_rates + history (Alpha→Yahoo)"
	@echo "  make sync-ticker-prices - EOD sync ticker_prices (Yahoo→Alpha; runs seed-tickers)"
	@echo "  make sync-intraday      - Intraday sync ticker_prices_intraday (Active tickers)"
	@echo "  make sync-history-backfill - History backfill 250d OHLCV (tickers with < 250 rows)"
	@echo "  make ensure-qa-ticker-250d - Ensure at least one ticker has 250+ rows (QA seed)"
	@echo "  make yahoo-heartbeat       - Yahoo connection heartbeat (1 row from provider)"
	@echo "  make verify-yahoo-250d     - Yahoo 250d full verification (scope, accuracy, completeness)"
	@echo "  make cleanup-market-data - Cleanup market data (Intraday 30d, Daily 250d, FX history 250d)"
	@echo "  make migrate-p3-018    - Create exchange_rates_history table"
	@echo "  make migrate-p3-019    - market_cap NUMERIC(24,4) for mega caps"
	@echo "  make migrate-p3-020    - user_tickers + tickers.status (User Tickers)"
	@echo "  make migrate-p3-021    - market_data reference tables (exchanges, sectors; unblock POST /me/tickers)"
	@echo "  make ensure-ticker-prices-partitions - Create 2025–2027 partitions"
	@echo "  make test-suite-a      - Suite A: Contract & Schema (Smoke)"
	@echo "  make test-suite-b      - Suite B: Cache-First + Failover (Smoke, REPLAY)"
	@echo "  make test-external-data-smoke - Suites A+B+D (PR smoke)"
	@echo "  make test-suite-d      - Suite D: Retention & Cleanup (Smoke/Nightly)"
	@echo "  make test-suite-e      - Suite E: UI Staleness Clock + Tooltip (Nightly)"
	@echo "  make test-d33-parallel - D33 Parallel Create (G7R Batch5; needs api/.env, DB)"
	@echo ""
	@echo "Database operations preserve base data and schema structure."
