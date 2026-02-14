# ============================================
# Makefile - TikTrack Phoenix v2
# Team 60 (DevOps & Platform)
# ============================================

.PHONY: db-backup db-test-clean db-test-fill db-backup-then-fill db-test-report help

# Database connection (from .env)
DATABASE_URL ?= $(shell grep DATABASE_URL api/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'")

# Convert asyncpg URL to psycopg2 format
DB_URL := $(shell echo $(DATABASE_URL) | sed 's/postgresql+asyncpg:\/\//postgresql:\/\//')

# ============================================
# Database Backup (before seed — mandatory)
# ============================================

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

## History Backfill — 250d OHLCV for tickers with < 200 rows (Indicators ATR/MA/CCI)
sync-history-backfill:
	@echo "🔄 History backfill — 250d OHLCV"
	@python3 scripts/sync_ticker_prices_history_backfill.py
	@echo "✅ History backfill complete."

## Ensure QA ticker 250d — לפחות טיקר אחד עם 250+ שורות (TEAM_10_SMART_HISTORY_FILL_QA_URGENT_FIXES)
ensure-qa-ticker-250d:
	@python3 scripts/ensure_qa_ticker_250d.py

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

## Help
help:
	@echo "Available targets:"
	@echo "  make db-backup           - Full DB backup + verify (run before seed)"
	@echo "  make db-backup-then-fill - Backup, verify, then seed test data (recommended)"
	@echo "  make db-test-clean       - Delete all test data (is_test_data = true)"
	@echo "  make db-test-fill        - Seed test data only (no backup)"
	@echo "  make db-test-report     - Report users + record counts (base vs test)"
	@echo "  make db-base-seed       - Seed base dataset for test_user"
	@echo "  make db-admin-minimal   - Reduce TikTrackAdmin base to minimal"
	@echo "  make seed-tickers       - Seed market_data.tickers (required before sync)"
	@echo "  make sync-eod           - EOD sync exchange_rates + history (Alpha→Yahoo)"
	@echo "  make sync-ticker-prices - EOD sync ticker_prices (Yahoo→Alpha; runs seed-tickers)"
	@echo "  make sync-intraday      - Intraday sync ticker_prices_intraday (Active tickers)"
	@echo "  make sync-history-backfill - History backfill 250d OHLCV (tickers with < 250 rows)"
	@echo "  make ensure-qa-ticker-250d - Ensure at least one ticker has 250+ rows (QA seed)"
	@echo "  make cleanup-market-data - Cleanup market data (Intraday 30d, Daily 250d, FX history 250d)"
	@echo "  make migrate-p3-018    - Create exchange_rates_history table"
	@echo "  make migrate-p3-019    - market_cap NUMERIC(24,4) for mega caps"
	@echo "  make ensure-ticker-prices-partitions - Create 2025–2027 partitions"
	@echo "  make test-suite-a      - Suite A: Contract & Schema (Smoke)"
	@echo "  make test-suite-b      - Suite B: Cache-First + Failover (Smoke, REPLAY)"
	@echo "  make test-external-data-smoke - Suites A+B+D (PR smoke)"
	@echo "  make test-suite-d      - Suite D: Retention & Cleanup (Smoke/Nightly)"
	@echo "  make test-suite-e      - Suite E: UI Staleness Clock + Tooltip (Nightly)"
	@echo ""
	@echo "Database operations preserve base data and schema structure."
