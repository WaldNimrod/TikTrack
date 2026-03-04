# TEAM 60 -> TEAM 20 | G7R Stream 1 Migration Rerun Response

**project_domain:** TIKTRACK  
**id:** TEAM_60_TO_TEAM_20_G7R_STREAM1_MIGRATION_RERUN_RESPONSE_v1.0.0  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 20 (Backend)  
**cc:** Team 10  
**date:** 2026-03-03  
**status:** BLOCK  
**reference:** S002_P003_WP002_G7R_BATCH1_STREAM1_FOUNDATIONS  
**in_response_to:** TEAM_20_TO_TEAM_60_G7R_STREAM1_MIGRATION_FIX_RESPONSE_v1.0.0  

---

## 1) overall_status

BLOCK

## 2) rerun outcome

1. Pre-state confirmed (alerts had `general` rows).
2. Backup completed successfully.
3. Rerun executed updated migration file and advanced further than previous run.
4. Migration still failed (new blocker in notes constraint phase).

## 3) exact blocker (rerun)

From migration rerun:

- `MIGRATION_RERUN_EXIT 3`
- `UPDATE 2` (alerts correction applied successfully)
- `ERROR:  check constraint "notes_parent_type_check" of relation "notes" is violated by some row`

## 4) diagnostics (new blocker root cause)

From `user_data.notes` distribution:

- `parent_type|count`
- `general|23`
- `ticker|4`
- `account|1`

Root cause:

- New `notes_parent_type_check` allowlist in migration excludes `general`.
- Existing data contains `parent_type='general'` rows, so constraint add fails.

## 5) current post-rerun state summary

| Item | State |
| --- | --- |
| `alerts.target_datetime` column | EXISTS |
| `notes.parent_datetime` column | EXISTS |
| `alerts target_type general -> NULL` correction | APPLIED (`UPDATE 2`) |
| `alerts_target_type_check` (new, includes datetime and NULL) | EXISTS |
| `alerts_trigger_status_check` includes `rearmed` | NOT APPLIED (migration stopped before step 8) |
| `notes_parent_type_check` with `datetime` (and without `general`) | NOT APPLIED (failed at add-constraint) |

## 6) canonical evidence paths

Base:

- `_COMMUNICATION/team_60/evidence/g7r_stream1_migration_rerun_fix/`

Files:

- `check_00_pre_state.log`
- `check_01_db_backup.log`
- `check_02_migration_rerun.log`
- `check_03_validation_checks.log`
- `check_04_notes_parent_type_diagnostics.log`

## 7) precise remediation target (Team 20)

Add notes data-migration step before adding strict `notes_parent_type_check`:

1. While old notes constraint is dropped, convert legacy rows:
   - `UPDATE user_data.notes SET parent_type='datetime' WHERE parent_type='general' AND parent_datetime IS NOT NULL;`
   - define expected mapping for `general` rows without `parent_datetime` (business decision needed: `datetime` with inferred value, or another allowed parent_type).
2. Only then add new `notes_parent_type_check` including intended allowlist.
3. Keep migration idempotent for reruns.

---

log_entry | TEAM_60 | G7R_STREAM1_MIGRATION_RERUN | BLOCK | 2026-03-03
