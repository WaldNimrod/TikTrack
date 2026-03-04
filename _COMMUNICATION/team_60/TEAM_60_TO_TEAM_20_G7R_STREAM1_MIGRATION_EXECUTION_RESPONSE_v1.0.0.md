# TEAM 60 -> TEAM 20 | G7R Stream 1 Migration Execution Response

**project_domain:** TIKTRACK  
**id:** TEAM_60_TO_TEAM_20_G7R_STREAM1_MIGRATION_EXECUTION_RESPONSE_v1.0.0  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 20 (Backend)  
**cc:** Team 10  
**date:** 2026-03-03  
**historical_record:** true  
**status:** BLOCK  
**reference:** S002_P003_WP002_G7R_BATCH1_STREAM1_FOUNDATIONS  
**in_response_to:** TEAM_20_TO_TEAM_60_G7R_STREAM1_MIGRATION_REQUEST_v1.0.0  

---

## 1) overall_status

BLOCK

## 2) execution summary

1. DB backup completed successfully before migration.
2. Migration execution failed with exit code 3.
3. Immediate blocker reported with exact logs and evidence.

## 3) blocker details (exact)

Migration file:

- `scripts/migrations/g7r_stream1_alerts_notes_datetime_linkage.sql`

Exact failure:

- `ERROR:  check constraint "alerts_target_type_check" of relation "alerts" is violated by some row`
- `MIGRATION_EXIT 3`

Observed data state causing failure:

- `target_type|count`
- `general|2`
- `ticker|16`

Root cause:

- Script currently drops `alerts_target_type_check` and attempts to add a new constraint that disallows `general` **before** the data correction step (`UPDATE ... WHERE target_type='general'`), so existing `general` rows violate the new constraint at add-constraint time.

## 4) post-failure safety action by Team 60

To avoid runtime integrity drift after partial execution, Team 60 restored a safe guardrail:

1. Re-added `alerts_target_type_check` with existing allowlist including `general`.
2. Re-asserted `target_type` as `NOT NULL`.

Safety restore result:

- `SAFETY_RESTORE_EXIT 0`
- `alerts_target_type_check|CHECK (... 'ticker','trade','trade_plan','account','general' ...)`

## 5) requested validation checks status

| Check | Result |
| --- | --- |
| `target_datetime` exists in `user_data.alerts` | PASS |
| `parent_datetime` exists in `user_data.notes` | PASS |
| `target_type IS NULL` rows allowed check | INFO (currently 0 rows) |
| `target_type='general'` rows count | BLOCK (2 rows still exist by design in restored safe state) |
| `trigger_status` includes `rearmed` | BLOCK (not applied due migration stop) |
| `notes parent_type` includes `datetime` | BLOCK (not applied due migration stop) |

## 6) canonical evidence paths

Base:

- `_COMMUNICATION/team_60/evidence/g7r_stream1_migration/`

Files:

- `check_00_db_backup.log`
- `check_01_migration_apply.log`
- `check_01_migration_exit_code.log`
- `check_02_failure_diagnostics.log`
- `check_03_post_state_checks.log`
- `check_04_safety_restore.log`
- `check_05_post_restore_state.log`

## 7) precise remediation target (Team 20)

Update migration ordering to avoid self-violation:

1. Add columns (`target_datetime`, `parent_datetime`) as is.
2. Drop old `alerts_target_type_check`.
3. Perform data correction first (`general -> NULL` and `target_id -> NULL`) while `target_type` is nullable.
4. Add new `alerts_target_type_check` with allowlist including `datetime` and `NULL`.
5. Continue with `trigger_status` (`rearmed`) and notes `parent_type` (`datetime`) constraints.

---

log_entry | TEAM_60 | G7R_STREAM1_MIGRATION_EXECUTION | BLOCK | 2026-03-03
