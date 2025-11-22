# TikTrack Production Files List

**Generated:** 2025-01-16  
**Purpose:** Comprehensive list of files required for production environment  
**Total Active Files:** 141

## Summary by Category

| Category | Count | Status |
|----------|-------|--------|
| config | 5 | ✅ Required |
| routes | 52 | ✅ Required |
| services | 52 | ✅ Required |
| models | 22 | ✅ Required |
| utils | 9 | ✅ Required |
| scripts | 2 | ✅ Required (backup + create_prod_db) |
| other | 1 | ✅ Required (app.py) |

## Additional Files Required for Production

### Core Files:
- ✅ `Backend/app.py` - Main server file
- ✅ `Backend/requirements.txt` - Python dependencies
- ✅ `start_production.sh` - **NEW** - Production startup script

### Config Files:
- ✅ `Backend/config/preferences_defaults.json` - Default preferences

### Database:
- ✅ `Backend/db/tiktrack.db` - **NEW** - Production database
- ❌ `Backend/db/tiktrack.db` - Development only

### Logs:
- ✅ `Backend/logs-production/` - **NEW** - Production logs directory
- ❌ `Backend/logs/` - Development only

### Scripts:
- ✅ `Backend/scripts/backup_database.py` - Database backup utility
- ✅ `Backend/scripts/create_production_db.py` - **NEW** - Production DB creation script

## Files by Category

### CONFIG

- `config/__init__.py`
- `config/database.py`
- `config/logging.py`
- `config/openapi.py`
- `config/settings.py`

### ROUTES

- `routes/__init__.py`
- `routes/api/__init__.py`
- `routes/api/account_activity.py`
- `routes/api/alerts.py`
- `routes/api/background_tasks.py`
- `routes/api/base_entity.py`
- `routes/api/base_entity_decorators.py`
- `routes/api/base_entity_utils.py`
- `routes/api/cache_changes.py`
- `routes/api/cache_management.py`
- `routes/api/cache_sync.py`
- `routes/api/cash_flows.py`
- `routes/api/constraints.py`
- `routes/api/css_management.py`
- `routes/api/currencies.py`
- `routes/api/database_schema.py`
- `routes/api/entity_details.py`
- `routes/api/executions.py`
- `routes/api/external_data_providers.py`
- `routes/api/file_scanner.py`
- `routes/api/linked_items.py`
- `routes/api/note_relation_types.py`
- `routes/api/notes.py`
- `routes/api/plan_conditions.py`
- `routes/api/plan_conditions_list.py`
- `routes/api/positions.py`
- `routes/api/preference_groups.py`
- `routes/api/preferences.py`
- `routes/api/quality_check.py`
- `routes/api/query_optimization.py`
- `routes/api/quotes_last.py`
- `routes/api/quotes_v1.py`
- `routes/api/server_logs.py`
- `routes/api/server_management.py`
- `routes/api/system_overview.py`
- `routes/api/system_setting_groups.py`
- `routes/api/system_settings.py`
- `routes/api/tickers.py`
- `routes/api/trade_conditions.py`
- `routes/api/trade_plans.py`
- `routes/api/trades.py`
- `routes/api/trading_accounts.py`
- `routes/api/trading_methods.py`
- `routes/api/user_data_import.py`
- `routes/api/user_data_import_reports.py`
- `routes/api/user_preferences_list.py`
- `routes/api/users.py`
- `routes/api/wal_management.py`
- `routes/external_data/__init__.py`
- `routes/external_data/quotes.py`
- `routes/external_data/status.py`
- `routes/pages.py`

### SERVICES

- `services/__init__.py`
- `services/account_activity_service.py`
- `services/advanced_cache_service.py`
- `services/alert_automation_service.py`
- `services/alert_expiry_task.py`
- `services/alert_service.py`
- `services/background_tasks.py`
- `services/backup_service.py`
- `services/cache_changes_tracker.py`
- `services/cache_service.py`
- `services/cash_flow_service.py`
- `services/condition_evaluation_service.py`
- `services/condition_evaluation_task.py`
- `services/condition_evaluator.py`
- `services/conditions_validation_service.py`
- `services/constraint_service.py`
- `services/currency_service.py`
- `services/data_refresh_scheduler.py`
- `services/database_optimizer.py`
- `services/entity_details_service.py`
- `services/external_data/__init__.py`
- `services/external_data/cache_manager.py`
- `services/external_data/data_normalizer.py`
- `services/external_data/policy_provider.py`
- `services/external_data/yahoo_finance_adapter.py`
- `services/health_service.py`
- `services/import_sessions_cleanup_task.py`
- `services/metrics_collector.py`
- `services/position_calculator_service.py`
- `services/position_portfolio_service.py`
- `services/preferences_service.py`
- `services/query_optimizer.py`
- `services/realtime_notifications.py`
- `services/smart_query_optimizer.py`
- `services/system_settings_service.py`
- `services/ticker_service.py`
- `services/trade_plan_service.py`
- `services/trade_service.py`
- `services/trading_account_service.py`
- `services/user_data_import/__init__.py`
- `services/user_data_import/connector_registry.py`
- `services/user_data_import/duplicate_detection_service.py`
- `services/user_data_import/file_storage_service.py`
- `services/user_data_import/import_orchestrator.py`
- `services/user_data_import/import_processor.py`
- `services/user_data_import/normalization_service.py`
- `services/user_data_import/report_generator.py`
- `services/user_data_import/session_manager.py`
- `services/user_data_import/validation_service.py`
- `services/user_service.py`
- `services/validation_service.py`
- `services/wal_background_service.py`

### MODELS

- `models/__init__.py`
- `models/alert.py`
- `models/base.py`
- `models/cache_change_log.py`
- `models/cash_flow.py`
- `models/currency.py`
- `models/execution.py`
- `models/external_data.py`
- `models/import_session.py`
- `models/note.py`
- `models/note_relation_type.py`
- `models/plan_condition.py`
- `models/preferences.py`
- `models/swagger_models.py`
- `models/system_settings.py`
- `models/ticker.py`
- `models/trade.py`
- `models/trade_condition.py`
- `models/trade_plan.py`
- `models/trading_account.py`
- `models/trading_method.py`
- `models/user.py`

### UTILS

- `utils/__init__.py`
- `utils/error_handlers.py`
- `utils/performance_monitor.py`
- `utils/rate_limiter.py`
- `utils/response_optimizer.py`
- `utils/safe_schema_migration.py`
- `utils/server_lock_manager.py`
- `utils/type_checker.py`
- `utils/wal_manager.py`

### OTHER

- `app.py` - Main server file

---

## Files NOT Required for Production

### Tests:
- ❌ `Backend/tests/` - All test files (28 files)
- ❌ `Backend/test_*.py` - Test files in root (3 files)

### Migrations:
- ❌ `Backend/migrations/` - All migration files (62 files)
- ⚠️ **Note:** Migrations should be run manually before DB transfer if needed

### Development Scripts:
- ❌ `Backend/scripts/add_*.py` - Data addition scripts
- ❌ `Backend/scripts/migrate_*.py` - Migration scripts
- ❌ `Backend/scripts/test_*.py` - Test scripts
- ❌ `Backend/scripts/create_clean_database.py` - Development only
- ❌ `Backend/scripts/fix_*.py` - Fix scripts
- ❌ `Backend/scripts/update_*.py` - Update scripts
- ❌ `Backend/scripts/analyze_*.py` - Analysis scripts
- ❌ `Backend/scripts/remove_*.py` - Removal scripts
- ❌ `Backend/scripts/simple_*.py` - Simple scripts
- ❌ `Backend/scripts/cleanup_*.py` - Cleanup scripts
- ❌ `Backend/scripts/deploy.sh` - Docker deployment (not needed)

### Old/Backup Files:
- ❌ `Backend/app.py.backup_*` - Backup files
- ❌ `Backend/*.backup` - All backup files
- ❌ `Backend/ARCHITECTURE_DOCUMENTATION*.html` - Old documentation
- ❌ `Backend/create_fresh_database.py` - Development only

### Other Files:
- ❌ `Backend/Makefile` - Not needed
- ❌ `Backend/Dockerfile` - Not needed (unless using Docker)
- ❌ `Backend/docker-compose.yml` - Not needed (unless using Docker)
- ❌ `Backend/nginx.conf` - Not needed (unless using nginx)
- ❌ `Backend/alembic.ini` - Not needed (unless using Alembic)
- ❌ `Backend/activate_yahoo_finance.py` - Not needed
- ❌ `Backend/add_*.py` - Temporary files
- ❌ `Backend/check_*.py` - Check files
- ❌ `Backend/find_*.py` - Find files
- ❌ `Backend/fix_*.py` - Fix files

---

## Production Environment Structure

```
TikTrackApp/
├── Backend/
│   ├── app.py                          ✅ Main server
│   ├── requirements.txt                ✅ Dependencies
│   ├── config/                         ✅ All 5 files
│   ├── routes/                         ✅ All 52 files
│   ├── services/                       ✅ All 52 files
│   ├── models/                         ✅ All 22 files
│   ├── utils/                          ✅ All 9 files
│   ├── scripts/
│   │   ├── backup_database.py          ✅ Backup utility
│   │   └── create_production_db.py    ✅ NEW - DB creation
│   ├── db/
│   │   └── tiktrack.db              ✅ NEW - Production DB
│   └── logs-production/                ✅ NEW - Production logs
├── start_production.sh                 ✅ NEW - Production startup
└── PRODUCTION_FILES_LIST.md            📄 This file
```

---

## Verification Checklist

- [ ] All 141 active files are present
- [ ] `requirements.txt` is up to date
- [ ] `start_production.sh` is created
- [ ] `Backend/config/settings.prod.py` is created
- [ ] `Backend/db/tiktrack.db` is created
- [ ] `Backend/logs-production/` directory exists
- [ ] No test files in production
- [ ] No migration files in production
- [ ] No development scripts in production

