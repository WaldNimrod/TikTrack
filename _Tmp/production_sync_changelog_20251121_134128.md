# Production Sync Changelog

**Generated:** 2025-11-21 13:41:28
**Branch:** new-db-uopgrde

## Summary

- **Modified:** 1 files
- **Added:** 34 files
- **Deleted:** 0 files
- **Untracked:** 15 files

## Critical Changes

### Config Changes
- `scripts/production-update/config/allowed_files.json`
- `scripts/production-update/config/steps_config.json`

### DB Schema Changes
- `scripts/production-update/lib/verify_schema.py`

### Server Changes
- No server changes

## Recent Commits

- 7b05dee2 Sync UI to production - update CSS and header files
- 44bc4385 Update server startup script with PostgreSQL support and add backup script
- 4571fbf1 Fix modal-manager-v2 and table-mappings - prevent double loading
- ff7692ab Update server PID file
- c470ddad Update various files to match local changes
- f8345c80 Fix date import in alert_service.py
- d1ba5f38 Update _validate_expiry_date to accept date objects
- 2718f563 Fix expiry_date handling using centralized date normalization
- 714b52ad Fix date normalization to preserve condition fields
- f04dd5d8 Add testAlertPayload function to test what's sent to backend

## All Changes

### Modified Files
- `DS_Store`

### Added Files
- `scripts/production-update/COMMIT_INSTRUCTIONS.md`
- `scripts/production-update/PROTECTION_GUIDE.md`
- `scripts/production-update/README.md`
- `scripts/production-update/config/allowed_files.json`
- `scripts/production-update/config/steps_config.json`
- `scripts/production-update/lib/bump_version.py`
- `scripts/production-update/lib/cleanup_documentation.py`
- `scripts/production-update/lib/cleanup_production_backups.sh`
- `scripts/production-update/lib/create_db_backup.py`
- `scripts/production-update/lib/git_stage_release.py`
- `scripts/production-update/lib/post_update_validation.py`
- `scripts/production-update/lib/run_release_checklist.py`
- `scripts/production-update/lib/sync_to_production.py`
- `scripts/production-update/lib/sync_ui_to_production.py`
- `scripts/production-update/lib/verify_production.sh`
- `scripts/production-update/lib/verify_production_isolation.sh`
- `scripts/production-update/lib/verify_schema.py`
- `scripts/production-update/master.py`
- `scripts/production-update/steps/01_collect_changes.py`
- `scripts/production-update/steps/02_merge_main.py`
- ... and 14 more
