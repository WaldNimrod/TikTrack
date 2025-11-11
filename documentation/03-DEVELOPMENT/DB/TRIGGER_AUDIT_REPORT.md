# Trigger Conflict Audit – November 2025

## 1. Objective
- Validate all active SQLite triggers to confirm they do not conflict or produce unintended side-effects.
- Align documentation with the consolidated ticker status trigger family.
- Establish automated and manual regression coverage for ongoing maintenance.

## 2. Trigger Inventory Snapshot
- **Source of Truth:** `Backend/scripts/create_clean_database.py` (`create_triggers`) plus migration `migration_20251013_120000_entity_relation_types_bridge.json`.
- **Active triggers (canonical schema):**
  - `protect_base_currency_update`, `protect_base_currency_delete`
  - `protect_last_account_delete`
  - `trigger_trade_plan_insert_ticker_status`, `trigger_trade_plan_update_ticker_status`, `trigger_trade_plan_delete_ticker_status`
  - `trigger_trade_insert_ticker_status`, `trigger_trade_update_ticker_status`, `trigger_trade_delete_ticker_status`
  - `trg_entity_relation_types_insert`, `trg_entity_relation_types_update`, `trg_entity_relation_types_delete`
- **Observation:** older trigger names (`trigger_*_active_trades`) are no longer created. Documentation and diagnostics should reference the `_ticker_status` variants.

## 3. Behavioural Summary
- **Ticker lifecycle:** Trade and trade_plan triggers operate in pairs to keep `tickers.status` and `tickers.active_trades` aligned. They include a guard that skips updates when the ticker status is `cancelled`.
- **Protection triggers:** Currency ID 1 (base currency) cannot be modified or deleted; the last remaining account cannot be deleted.
- **Bridge triggers:** View `entity_relation_types` redirects CRUD into `note_relation_types`, preventing FK regressions during the naming consolidation.

## 4. Conflict & Risk Review
- No recursive trigger chains detected; all triggers run `AFTER` and only mutate the parent ticker.
- `tickers.active_trades` relies solely on these triggers. Any manual write to the table must respect that invariant.
- `open_plans` documentation is outdated; the column is not created in the canonical schema. TODO entry already tracks the required decision.
- Protection triggers intentionally raise `ABORT`; automation must catch the resulting `sqlite3.IntegrityError`.

## 5. Automated Coverage
- Added regression suite `Backend/tests/test_db_trigger_conflicts.py`.
  - Builds schema via `create_clean_database` to mirror production.
  - Exercises trade_plan/trade lifecycle, cancellation safeguards, protection triggers, and bridge triggers.
  - Executed with `python3 -m pytest Backend/tests/test_db_trigger_conflicts.py`.
- Future integration: hook this test into the `qa-automation` workflow once pipeline runtime budget is approved.

## 6. Manual Validation Toolkit
- SQL worksheet `Backend/tools/db_trigger_validation.sql` (transactional, rolls back automatically).
- Steps included:
  - Inventory snapshot
  - Trade plan / trade lifecycle walkthrough
  - Cancelled ticker guard verification
  - Bridge trigger write redirection
  - Manual instructions for protection triggers (requires observing raised errors).
- Execute via: `sqlite3 Backend/db/simpleTrade_new.db < Backend/tools/db_trigger_validation.sql`.

## 7. Documentation Updates
- `documentation/04-FEATURES/CORE/constraints/active_trades_field.md` now references the unified ticker status trigger family and the new automated test suite.
- Central audit record stored in this file (`documentation/03-DEVELOPMENT/DB/TRIGGER_AUDIT_REPORT.md`).
- `FUTURE_TASKS_MASTER_LIST.md` entry “בדיקת טריגרים קיימים למניעת התנגשויות” should now be marked as completed once the team approves this report.

## 8. Open Follow-Ups
- Decide whether to reintroduce `open_plans` as a computed field or formally retire it (requires product confirmation).
- Extend automated coverage to run against migrated databases from backups to ensure legacy data passes the same trigger invariants.
- Add pipeline step to parse trigger inventory and alert on drift from canonical definitions.

