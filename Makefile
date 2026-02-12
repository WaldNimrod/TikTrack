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

## Backup DB, verify backup, then seed test data (recommended flow).
db-backup-then-fill: db-backup
	@echo "🌱 Seeding test data (backup already verified)..."
	@python3 scripts/seed_test_data.py
	@echo "✅ Test data seeded successfully."

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
	@echo ""
	@echo "Database operations preserve base data and schema structure."
