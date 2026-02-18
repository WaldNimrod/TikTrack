# Team 70 | Documentation Migration Completeness Matrix

**id:** TEAM_70_DOC_MIGRATION_COMPLETENESS_MATRIX  
**owner:** Team 70 (Knowledge Librarian)  
**to:** Team 90 (Validation), Team 10 (Gateway)  
**date:** 2026-02-17  
**context:** TEAM_90_TO_TEAM_70_CUTOVER_EXECUTION_BLOCK_AND_CORRECTIONS | Model B  
**status:** SUBMITTED — file-level, Model B target paths

---

## 1) Exact Inventory Reconciliation

| Source Folder | File Count | Target |
|---------------|------------|--------|
| documentation/00-MANAGEMENT | 15 | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT |
| documentation/01-ARCHITECTURE | 74 | documentation/docs-system/01-ARCHITECTURE |
| documentation/02-DEVELOPMENT | 15 | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT |
| documentation/03-PRODUCT_&_BUSINESS | 1 | documentation/docs-system/08-PRODUCT |
| documentation/04-DESIGN_UX_UI | 11 | documentation/docs-system/07-DESIGN |
| documentation/05-PROCEDURES | 23 | documentation/docs-governance/02-PROCEDURES |
| documentation/05-REPORTS | 148 | 74 ACTIVE→documentation/reports/05-REPORTS; 74 ARCHIVED→archive |
| documentation/06-ENGINEERING | 12 | documentation/docs-system/02-SERVER |
| documentation/07-CONTRACTS | 7 | documentation/docs-governance/06-CONTRACTS |
| documentation/07-POLICIES | 1 | archive/documentation_legacy/snapshots/2026-02-17_0000/07-POLICIES |
| documentation/08-REPORTS | 138 | 6 ACTIVE→documentation/reports/08-REPORTS; 132 ARCHIVED→archive |
| documentation/docs-governance/00-FOUNDATIONS | 2 | documentation/docs-governance/00-FOUNDATIONS |
| documentation/09-GOVERNANCE | 19 | documentation/docs-governance/09-GOVERNANCE |
| documentation/docs-governance/99-archive | 1 | documentation/docs-governance/99-archive |
| documentation/10-POLICIES | 14 | documentation/docs-governance/01-POLICIES |
| documentation/90_ARCHITECTS_DOCUMENTATION | 52 | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION |
| documentation/99-ARCHIVE | 14 | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE |
| documentation/ (root OPENAPI_SPEC_V2.yaml) | 1 | archive/documentation_legacy/snapshots/2026-02-17_0000 |
| **GRAND TOTAL** | **548** | — |

---

## 2) File-Level Matrix (source_file | target_file | status | owner | notes)

| source_file | target_file | status | owner | notes |
|-------------|-------------|--------|-------|-------|
| documentation/00-MANAGEMENT/00_ARCHITECT_HANDOVER_v252.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/00_ARCHITECT_HANDOVER_v252.md | ARCHIVED | Team 70 | |
| documentation/00-MANAGEMENT/00_AUDIT_MANUAL.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/00_AUDIT_MANUAL.md | ARCHIVED | Team 70 | |
| documentation/00-MANAGEMENT/00_FORTRESS_SOP_v252.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/00_FORTRESS_SOP_v252.md | ARCHIVED | Team 70 | |
| documentation/00-MANAGEMENT/00_GOVERNANCE_SOP_v252.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/00_GOVERNANCE_SOP_v252.md | ARCHIVED | Team 70 | |
| documentation/00-MANAGEMENT/00_MASTER_INDEX.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/00_LEGACY_INDEX_SNAPSHOT_2026-02-17.md | ARCHIVED | Team 70 | Renamed from 00_MASTER_INDEX |
| documentation/00-MANAGEMENT/00_PHOENIX_WILL.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/00_PHOENIX_WILL.md | ARCHIVED | Team 70 | |
| documentation/00-MANAGEMENT/01_System_Blueprint.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/01_System_Blueprint.md | ARCHIVED | Team 70 | |
| documentation/00-MANAGEMENT/02_API_Connectivity.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/02_API_Connectivity.md | ARCHIVED | Team 70 | |
| documentation/00-MANAGEMENT/03_Product_Capabilities.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/03_Product_Capabilities.md | ARCHIVED | Team 70 | |
| documentation/00-MANAGEMENT/04_Operations_Strategy.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/04_Operations_Strategy.md | ARCHIVED | Team 70 | |
| documentation/00-MANAGEMENT/05_Setup_Infrastructure.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/05_Setup_Infrastructure.md | ARCHIVED | Team 70 | |
| documentation/00-MANAGEMENT/ADR_010_PHASE_2_UNIFIED_CLOSURE_MANDATE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/ADR_010_PHASE_2_UNIFIED_CLOSURE_MANDATE.md | ARCHIVED | Team 70 | |
| documentation/00-MANAGEMENT/PHOENIX_ORGANIZATIONAL_STRUCTURE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/PHOENIX_ORGANIZATIONAL_STRUCTURE.md | ARCHIVED | Team 70 | |
| documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_TASK_SPEC_SUPPLEMENT_REQUEST.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_TASK_SPEC_SUPPLEMENT_REQUEST.md | ARCHIVED | Team 70 | |
| documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_WORK_PLAN.md | archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_WORK_PLAN.md | ARCHIVED | Team 70 | |
| documentation/01-ARCHITECTURE/CASH_FLOW_PARSER_SPEC.md | documentation/docs-system/01-ARCHITECTURE/CASH_FLOW_PARSER_SPEC.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/DNA_COLOR_PALETTE_DOCUMENTATION.md | documentation/docs-system/01-ARCHITECTURE/DNA_COLOR_PALETTE_DOCUMENTATION.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md | documentation/docs-system/01-ARCHITECTURE/FOREX_MARKET_SPEC.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/FRONTEND/COMPONENTS/TT2_HEADER_SPEC_LOD400.md | documentation/docs-system/01-ARCHITECTURE/FRONTEND/COMPONENTS/TT2_HEADER_SPEC_LOD400.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/PENDING_LOGIC_ALERTS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/PENDING_LOGIC_ALERTS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/TT2_TRADING_CALENDAR_LOGIC.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/TT2_TRADING_CALENDAR_LOGIC.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_07_C_ADMIN_DUPLICATE_EMAIL_PHONE_POLICY.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_07_C_ADMIN_DUPLICATE_EMAIL_PHONE_POLICY.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_07_C_DDL_CORE_SCHEMA.sql | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_07_C_DDL_CORE_SCHEMA.sql | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_ENCRYPTED_CREDENTIALS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_ENCRYPTED_CREDENTIALS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_TRADING_ACCOUNTS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_TRADING_ACCOUNTS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_TRADING_ACCOUNTS_BALANCES.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_TRADING_ACCOUNTS_BALANCES.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_USERS_PROFILES.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_USERS_PROFILES.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_ENCRYPTED_CREDENTIALS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_ENCRYPTED_CREDENTIALS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_EXCHANGE_RATES.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_EXCHANGE_RATES.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_MARKET_CALENDARS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_MARKET_CALENDARS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_TRADING_ACCOUNTS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_TRADING_ACCOUNTS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_USERS_PROFILES.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_USERS_PROFILES.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_CASH_FLOWS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_CASH_FLOWS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS_BALANCES.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS_BALANCES.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_08_FIELD_MAP_CASH_FLOWS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_08_FIELD_MAP_CASH_FLOWS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_08_FIELD_MAP_TRADING_ACCOUNTS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_08_FIELD_MAP_TRADING_ACCOUNTS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_08_FIELD_MAP_TRADING_ACCOUNTS_BALANCES.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_08_FIELD_MAP_TRADING_ACCOUNTS_BALANCES.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_EXECUTIONS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_EXECUTIONS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_PLAYBOOKS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_PLAYBOOKS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_TICKERS_MAPPINGS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_TICKERS_MAPPINGS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_TRADES.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_TRADES.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_EXECUTIONS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_EXECUTIONS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_PLAYBOOKS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_PLAYBOOKS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TRADES.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TRADES.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_BACKGROUND_TASKS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_BACKGROUND_TASKS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_DESIGN_STUDIO_TOKENS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_DESIGN_STUDIO_TOKENS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_PULSE_LOGS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_PULSE_LOGS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_SYSTEM_SETTINGS.md | documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_SYSTEM_SETTINGS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md | documentation/docs-system/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md | documentation/docs-system/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md | documentation/docs-system/01-ARCHITECTURE/MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/PHOENIX_AUTH_INTEGRATION.md | documentation/docs-system/01-ARCHITECTURE/PHOENIX_AUTH_INTEGRATION.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/PHOENIX_NAVIGATION_STRATEGY.md | documentation/docs-system/01-ARCHITECTURE/PHOENIX_NAVIGATION_STRATEGY.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/PHOENIX_REACT_HTML_BOUNDARIES.md | documentation/docs-system/01-ARCHITECTURE/PHOENIX_REACT_HTML_BOUNDARIES.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/PHX_DB_SCHEMA_SIGN_OFF.md | documentation/docs-system/01-ARCHITECTURE/PHX_DB_SCHEMA_SIGN_OFF.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md | documentation/docs-system/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/SERVERS_SCRIPTS_SSOT.md | documentation/docs-system/01-ARCHITECTURE/SERVERS_SCRIPTS_SSOT.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md | documentation/docs-system/01-ARCHITECTURE/TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_BACKEND_CUBE_INVENTORY.md | documentation/docs-system/01-ARCHITECTURE/TT2_BACKEND_CUBE_INVENTORY.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_BACKEND_LEGO_SPEC.md | documentation/docs-system/01-ARCHITECTURE/TT2_BACKEND_LEGO_SPEC.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_BATCH_PROGRESS_TRACKER.md | documentation/docs-system/01-ARCHITECTURE/TT2_BATCH_PROGRESS_TRACKER.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_CSS_LOAD_VERIFICATION_SPEC.md | documentation/docs-system/01-ARCHITECTURE/TT2_CSS_LOAD_VERIFICATION_SPEC.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_DATABASE_CREDENTIALS.md | documentation/docs-system/01-ARCHITECTURE/TT2_DATABASE_CREDENTIALS.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_DECISION_PROFILE_ROUTE.md | documentation/docs-system/01-ARCHITECTURE/TT2_DECISION_PROFILE_ROUTE.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_EFR_HARDENED_TRANSFORMERS_LOCK.md | documentation/docs-system/01-ARCHITECTURE/TT2_EFR_HARDENED_TRANSFORMERS_LOCK.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_EFR_LOGIC_MAP.md | documentation/docs-system/01-ARCHITECTURE/TT2_EFR_LOGIC_MAP.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_FULL_40_PAGE_LIST.md | documentation/docs-system/01-ARCHITECTURE/TT2_FULL_40_PAGE_LIST.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_HEADER_BLUEPRINT.md | documentation/docs-system/01-ARCHITECTURE/TT2_HEADER_BLUEPRINT.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_INFRASTRUCTURE_GUIDE.md | documentation/docs-system/01-ARCHITECTURE/TT2_INFRASTRUCTURE_GUIDE.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md | documentation/docs-system/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_MASTER_PALETTE_SPEC.md | documentation/docs-system/01-ARCHITECTURE/TT2_MASTER_PALETTE_SPEC.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_MONOREPO_STRUCTURE.md | documentation/docs-system/01-ARCHITECTURE/TT2_MONOREPO_STRUCTURE.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md | documentation/docs-system/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md | documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md | documentation/docs-system/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_PHASE_2_ALL_TEAMS_MANDATE.md | documentation/docs-system/01-ARCHITECTURE/TT2_PHASE_2_ALL_TEAMS_MANDATE.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md | documentation/docs-system/01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md | documentation/docs-system/01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_SSOT_REGISTRY.md | documentation/docs-system/01-ARCHITECTURE/TT2_SSOT_REGISTRY.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_TABLES_REACT_FRAMEWORK.md | documentation/docs-system/01-ARCHITECTURE/TT2_TABLES_REACT_FRAMEWORK.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md | documentation/docs-system/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/TT2_UI_INTEGRATION_PATTERN.md | documentation/docs-system/01-ARCHITECTURE/TT2_UI_INTEGRATION_PATTERN.md | ACTIVE | Team 70 | |
| documentation/01-ARCHITECTURE/YAHOO_FINANCE_DATA_AND_REQUEST_LOGIC.md | documentation/docs-system/01-ARCHITECTURE/YAHOO_FINANCE_DATA_AND_REQUEST_LOGIC.md | ACTIVE | Team 70 | |
| documentation/02-DEVELOPMENT/PAGE_LAYOUT_CHECKLIST_NEW_PAGES.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/PAGE_LAYOUT_CHECKLIST_NEW_PAGES.md | ARCHIVED | Team 70 | |
| documentation/02-DEVELOPMENT/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md | ARCHIVED | Team 70 | |
| documentation/02-DEVELOPMENT/TEAM_10_LEGO_ARCHITECTURE_VALIDATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/TEAM_10_LEGO_ARCHITECTURE_VALIDATION.md | ARCHIVED | Team 70 | |
| documentation/02-DEVELOPMENT/TT2_JS_DEVELOPER_GUIDE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/TT2_JS_DEVELOPER_GUIDE.md | ARCHIVED | Team 70 | |
| documentation/02-DEVELOPMENT/TT2_STATUS_VALUES_CODE_MAP.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/TT2_STATUS_VALUES_CODE_MAP.md | ARCHIVED | Team 70 | |
| documentation/02-DEVELOPMENT/TT2_VALIDATION_DEVELOPER_GUIDE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/TT2_VALIDATION_DEVELOPER_GUIDE.md | ARCHIVED | Team 70 | |
| documentation/02-DEVELOPMENT/WP_10_01_D05_TICKERS_MOCKUP.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/WP_10_01_D05_TICKERS_MOCKUP.md | ARCHIVED | Team 70 | |
| documentation/02-DEVELOPMENT/WP_10_02_BATCH_A_UI_SPEC.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/WP_10_02_BATCH_A_UI_SPEC.md | ARCHIVED | Team 70 | |
| documentation/02-DEVELOPMENT/WP_10_02_D05_LIVING_MOCKUP.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/WP_10_02_D05_LIVING_MOCKUP.md | ARCHIVED | Team 70 | |
| documentation/02-DEVELOPMENT/WP_10_02_D15_LOGIN_POC_SPEC.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/WP_10_02_D15_LOGIN_POC_SPEC.md | ARCHIVED | Team 70 | |
| documentation/02-DEVELOPMENT/WP_20_01_BACKEND_FOUNDATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/WP_20_01_BACKEND_FOUNDATION.md | ARCHIVED | Team 70 | |
| documentation/02-DEVELOPMENT/WP_20_01_D05_LOGIC_SCHEMA.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/WP_20_01_D05_LOGIC_SCHEMA.md | ARCHIVED | Team 70 | |
| documentation/02-DEVELOPMENT/WP_20_02_IDENTITY_AND_ACCESS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/WP_20_02_IDENTITY_AND_ACCESS.md | ARCHIVED | Team 70 | |
| documentation/02-DEVELOPMENT/WP_20_03_BATCH_A_LOGIC_SPEC.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/WP_20_03_BATCH_A_LOGIC_SPEC.md | ARCHIVED | Team 70 | |
| documentation/02-DEVELOPMENT/WP_20_04_BATCH_A_REDESIGN_DIRECTIVE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/WP_20_04_BATCH_A_REDESIGN_DIRECTIVE.md | ARCHIVED | Team 70 | |
| documentation/03-PRODUCT_&_BUSINESS/LEGACY_TO_PHOENIX_MAPPING_V2.5.md | documentation/docs-system/08-PRODUCT/LEGACY_TO_PHOENIX_MAPPING_V2.5.md | ACTIVE | Team 70 | |
| documentation/04-DESIGN_UX_UI/CONTAINER_HEADER_STRUCTURE_GUIDELINES.md | documentation/docs-system/07-DESIGN/CONTAINER_HEADER_STRUCTURE_GUIDELINES.md | ACTIVE | Team 70 | |
| documentation/04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md | documentation/docs-system/07-DESIGN/CSS_CLASSES_INDEX.md | ACTIVE | Team 70 | |
| documentation/04-DESIGN_UX_UI/CSS_LOADING_ORDER.md | documentation/docs-system/07-DESIGN/CSS_LOADING_ORDER.md | ACTIVE | Team 70 | |
| documentation/04-DESIGN_UX_UI/DASHBOARD_WIDGETS_GUIDE.md | documentation/docs-system/07-DESIGN/DASHBOARD_WIDGETS_GUIDE.md | ACTIVE | Team 70 | |
| documentation/04-DESIGN_UX_UI/DATA_DASHBOARD_SPEC.md | documentation/docs-system/07-DESIGN/DATA_DASHBOARD_SPEC.md | ACTIVE | Team 70 | |
| documentation/04-DESIGN_UX_UI/DNA_BUTTON_SYSTEM.md | documentation/docs-system/07-DESIGN/DNA_BUTTON_SYSTEM.md | ACTIVE | Team 70 | |
| documentation/04-DESIGN_UX_UI/DNA_PALETTE_SSOT.md | documentation/docs-system/07-DESIGN/DNA_PALETTE_SSOT.md | ACTIVE | Team 70 | |
| documentation/04-DESIGN_UX_UI/GIN_004_UI_ALIGNMENT_SPEC.md | documentation/docs-system/07-DESIGN/GIN_004_UI_ALIGNMENT_SPEC.md | ACTIVE | Team 70 | |
| documentation/04-DESIGN_UX_UI/SYSTEM_WIDE_DESIGN_PATTERNS.md | documentation/docs-system/07-DESIGN/SYSTEM_WIDE_DESIGN_PATTERNS.md | ACTIVE | Team 70 | |
| documentation/04-DESIGN_UX_UI/TT2_RESPONSIVE_FLUID_DESIGN.md | documentation/docs-system/07-DESIGN/TT2_RESPONSIVE_FLUID_DESIGN.md | ACTIVE | Team 70 | |
| documentation/04-DESIGN_UX_UI/UNIFIED_HEADER_SPECIFICATION.md | documentation/docs-system/07-DESIGN/UNIFIED_HEADER_SPECIFICATION.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/ARCHITECT_DATA_MANAGEMENT_SOP_011.md | documentation/docs-governance/02-PROCEDURES/ARCHITECT_DATA_MANAGEMENT_SOP_011.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TEAM_20_TRADING_ACCOUNT_FEES_MIGRATION_PLAN.md | documentation/docs-governance/02-PROCEDURES/TEAM_20_TRADING_ACCOUNT_FEES_MIGRATION_PLAN.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE.md | documentation/docs-governance/02-PROCEDURES/TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TEAM_50_BROWSER_TEST_SCENARIOS.md | documentation/docs-governance/02-PROCEDURES/TEAM_50_BROWSER_TEST_SCENARIOS.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_ACTION_AUDIT_PROTOCOL.md | documentation/docs-governance/02-PROCEDURES/TT2_ACTION_AUDIT_PROTOCOL.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_ARCHITECT_DECISION_TEMPLATE_PROCEDURE.md | documentation/docs-governance/02-PROCEDURES/TT2_ARCHITECT_DECISION_TEMPLATE_PROCEDURE.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.md | documentation/docs-governance/02-PROCEDURES/TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_BLUEPRINT_INTEGRATION_WORKFLOW.md | documentation/docs-governance/02-PROCEDURES/TT2_BLUEPRINT_INTEGRATION_WORKFLOW.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_CUBE_DEFINITION_TEMPLATE.md | documentation/docs-governance/02-PROCEDURES/TT2_CUBE_DEFINITION_TEMPLATE.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md | documentation/docs-governance/02-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_OUTPUT_INTEGRATION_PROTOCOL.md | documentation/docs-governance/02-PROCEDURES/TT2_OUTPUT_INTEGRATION_PROTOCOL.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_QA_SEED_USER_PROCEDURE.md | documentation/docs-governance/02-PROCEDURES/TT2_QA_SEED_USER_PROCEDURE.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md | documentation/docs-governance/02-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_RTL_DEVELOPMENT_CHARTER.md | documentation/docs-governance/02-PROCEDURES/TT2_RTL_DEVELOPMENT_CHARTER.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_SESSION_TRANSITION_PROTOCOL.md | documentation/docs-governance/02-PROCEDURES/TT2_SESSION_TRANSITION_PROTOCOL.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_SLA_TEAMS_30_40.md | documentation/docs-governance/02-PROCEDURES/TT2_SLA_TEAMS_30_40.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_TEAM_10_WORK_PLAN.md | documentation/docs-governance/02-PROCEDURES/TT2_TEAM_10_WORK_PLAN.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_TEAM_20_ONBOARDING.md | documentation/docs-governance/02-PROCEDURES/TT2_TEAM_20_ONBOARDING.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_TEAM_50_DEFECT_REPORTING_PROCEDURE.md | documentation/docs-governance/02-PROCEDURES/TT2_TEAM_50_DEFECT_REPORTING_PROCEDURE.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_TEAM_MANAGEMENT_TEMPLATES.md | documentation/docs-governance/02-PROCEDURES/TT2_TEAM_MANAGEMENT_TEMPLATES.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_TEST_DATA_REFRESH_PROCEDURE.md | documentation/docs-governance/02-PROCEDURES/TT2_TEST_DATA_REFRESH_PROCEDURE.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_UI_DIGGING_PROCEDURE.md | documentation/docs-governance/02-PROCEDURES/TT2_UI_DIGGING_PROCEDURE.md | ACTIVE | Team 70 | |
| documentation/05-PROCEDURES/TT2_VERSIONING_PROCEDURE.md | documentation/docs-governance/02-PROCEDURES/TT2_VERSIONING_PROCEDURE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/GATE_B_STATUS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/GATE_B_STATUS.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/CASH_FLOW_TYPES_SSOT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/CASH_FLOW_TYPES_SSOT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/MISSION_90_02_LEGACY_YAHOO_INVESTIGATION_REPORT.md | documentation/reports/05-REPORTS/artifacts/MISSION_90_02_LEGACY_YAHOO_INVESTIGATION_REPORT.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/SPEC_BASE_TEST_USER_DATASET.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/SPEC_BASE_TEST_USER_DATASET.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_ADR_015_BROKER_REFERENCE_EVIDENCE_LOG.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_10_ADR_015_BROKER_REFERENCE_EVIDENCE_LOG.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_D35_RICH_TEXT_ATTACHMENTS_LOCK_EVIDENCE_LOG.md | documentation/reports/05-REPORTS/artifacts/TEAM_10_D35_RICH_TEXT_ATTACHMENTS_LOCK_EVIDENCE_LOG.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_EXTERNAL_DATA_SSOT_EVIDENCE_LOG.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_10_EXTERNAL_DATA_SSOT_EVIDENCE_LOG.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_GATE_A_KICKOFF_EVIDENCE_LOG.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_10_GATE_A_KICKOFF_EVIDENCE_LOG.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_GATE_B_EVIDENCE_LOG.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_10_GATE_B_EVIDENCE_LOG.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_GOVERNANCE_V2_102_ADOPTION_EVIDENCE_LOG.md | documentation/reports/05-REPORTS/artifacts/TEAM_10_GOVERNANCE_V2_102_ADOPTION_EVIDENCE_LOG.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_MARKET_DATA_SETTINGS_UI_GATE_A_EVIDENCE.md | documentation/reports/05-REPORTS/artifacts/TEAM_10_MARKET_DATA_SETTINGS_UI_GATE_A_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_MB3A_ALERTS_GATE_KP_AND_SEAL.md | documentation/reports/05-REPORTS/artifacts/TEAM_10_MB3A_ALERTS_GATE_KP_AND_SEAL.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_MB3A_NOTES_GATE_KP_AND_SEAL.md | documentation/reports/05-REPORTS/artifacts/TEAM_10_MB3A_NOTES_GATE_KP_AND_SEAL.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_MD_SETTINGS_GATE_KP_AND_SEAL.md | documentation/reports/05-REPORTS/artifacts/TEAM_10_MD_SETTINGS_GATE_KP_AND_SEAL.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_P3_004_ADR_022_POL_015_EVIDENCE_LOG.md | documentation/reports/05-REPORTS/artifacts/TEAM_10_P3_004_ADR_022_POL_015_EVIDENCE_LOG.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_SMART_HISTORY_FILL_SSOT_EVIDENCE_LOG.md | documentation/reports/05-REPORTS/artifacts/TEAM_10_SMART_HISTORY_FILL_SSOT_EVIDENCE_LOG.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_SOP_013_FULL_IMPLEMENTATION_EVIDENCE.md | documentation/reports/05-REPORTS/artifacts/TEAM_10_SOP_013_FULL_IMPLEMENTATION_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_10_STAGE1_1_001_1_003_1_004_PRE_GATE_B_EVIDENCE_LOG.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_10_STAGE1_1_001_1_003_1_004_PRE_GATE_B_EVIDENCE_LOG.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_60_TICKER_PRICES_INTRADAY_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_20_60_TICKER_PRICES_INTRADAY_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_ALPHA_VANTAGE_API_KEY_DOCUMENTATION_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_20_ALPHA_VANTAGE_API_KEY_DOCUMENTATION_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_ALPHA_VANTAGE_API_KEY_GUIDELINES.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_20_ALPHA_VANTAGE_API_KEY_GUIDELINES.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_D35_NOTES_ATTACHMENTS_IMPLEMENTATION_EVIDENCE.md | documentation/reports/05-REPORTS/artifacts/TEAM_20_D35_NOTES_ATTACHMENTS_IMPLEMENTATION_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_20_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_EXTERNAL_DATA_IMPLEMENTATION_SUMMARY_FOR_TEAM_10.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_20_EXTERNAL_DATA_IMPLEMENTATION_SUMMARY_FOR_TEAM_10.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_EXTERNAL_DATA_P3_008_015_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_20_EXTERNAL_DATA_P3_008_015_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_MARKET_DATA_SETTINGS_UI_IMPLEMENTATION_EVIDENCE.md | documentation/reports/05-REPORTS/artifacts/TEAM_20_MARKET_DATA_SETTINGS_UI_IMPLEMENTATION_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_MARKET_STATUS_PROVIDER_RESEARCH.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_20_MARKET_STATUS_PROVIDER_RESEARCH.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_PROVIDERS_8_TESTS_EVIDENCE.md | documentation/reports/05-REPORTS/artifacts/TEAM_20_PROVIDERS_8_TESTS_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_PROVIDERS_FULL_COVERAGE_EVIDENCE.md | documentation/reports/05-REPORTS/artifacts/TEAM_20_PROVIDERS_FULL_COVERAGE_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_RATELIMIT_SCALING_LOCK_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_20_RATELIMIT_SCALING_LOCK_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_USER_TICKERS_500_TO_422_VERIFICATION_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_20_USER_TICKERS_500_TO_422_VERIFICATION_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_USER_TICKERS_CRYPTO_CORRECTIVE_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_20_USER_TICKERS_CRYPTO_CORRECTIVE_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_USER_TICKERS_IMPLEMENTATION_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_20_USER_TICKERS_IMPLEMENTATION_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_USER_TICKERS_PRE_QA_CHECKLIST.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_20_USER_TICKERS_PRE_QA_CHECKLIST.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_20_YAHOO_GOLD_STANDARD_IMPLEMENTATION_REPORT.md | documentation/reports/05-REPORTS/artifacts/TEAM_20_YAHOO_GOLD_STANDARD_IMPLEMENTATION_REPORT.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_30_BATCH_2_5_EVIDENCE_LOG.md | documentation/reports/05-REPORTS/artifacts/TEAM_30_BATCH_2_5_EVIDENCE_LOG.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_30_BROKER_LIST_SOURCE_AND_STATUS_ACTIONS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_30_BROKER_LIST_SOURCE_AND_STATUS_ACTIONS.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_30_EXTERNAL_DATA_SUITE_E_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_30_EXTERNAL_DATA_SUITE_E_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_30_FILENAME_QUALITY_FIXES_EVIDENCE_LOG.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_30_FILENAME_QUALITY_FIXES_EVIDENCE_LOG.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_30_P3_001_P3_002_EVIDENCE_LOG.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_30_P3_001_P3_002_EVIDENCE_LOG.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_30_USER_TICKERS_CODE_VERIFICATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_30_USER_TICKERS_CODE_VERIFICATION.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_30_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_30_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_30_USER_TICKERS_IMPLEMENTATION_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_30_USER_TICKERS_IMPLEMENTATION_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_50_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_50_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_50_EXTERNAL_DATA_CI_SCHEDULE.md | documentation/reports/05-REPORTS/artifacts/TEAM_50_EXTERNAL_DATA_CI_SCHEDULE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_50_MB3A_NOTES_QA_CHECKLIST_E2E.md | documentation/reports/05-REPORTS/artifacts/TEAM_50_MB3A_NOTES_QA_CHECKLIST_E2E.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_50_SMART_HISTORY_FILL_QA_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_50_SMART_HISTORY_FILL_QA_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_50_STALENESS_CLOCK_UNIFIED_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_50_STALENESS_CLOCK_UNIFIED_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_50_TESTING_PROCESSES_SUMMARY_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_50_TESTING_PROCESSES_SUMMARY_REPORT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_GAPS_EVIDENCE.md | documentation/reports/05-REPORTS/artifacts/TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_GAPS_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_QA_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_QA_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_50_USER_TICKERS_QA_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_50_USER_TICKERS_QA_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_50_USER_TICKERS_SANITY_CHECKLIST.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_50_USER_TICKERS_SANITY_CHECKLIST.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_60_CLEANUP_EVIDENCE_LOG.md | documentation/reports/05-REPORTS/artifacts/TEAM_60_CLEANUP_EVIDENCE_LOG.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_60_CRON_SCHEDULE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts/TEAM_60_CRON_SCHEDULE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_60_D35_NOTE_ATTACHMENTS_EVIDENCE.md | documentation/reports/05-REPORTS/artifacts/TEAM_60_D35_NOTE_ATTACHMENTS_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_60_P3_021_MIGRATION_EVIDENCE.md | documentation/reports/05-REPORTS/artifacts/TEAM_60_P3_021_MIGRATION_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/TEAM_60_USER_TICKERS_MIGRATION_EVIDENCE.md | documentation/reports/05-REPORTS/artifacts/TEAM_60_USER_TICKERS_MIGRATION_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts/USER_TICKERS_QA_DB_CHECKLIST.md | documentation/reports/05-REPORTS/artifacts/USER_TICKERS_QA_DB_CHECKLIST.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/DATA_INTEGRITY_STANDARD_CLASSES_AUDIT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/DATA_INTEGRITY_STANDARD_CLASSES_AUDIT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/PAGES_ENTITY_COLOR_MAPPING.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/PAGES_ENTITY_COLOR_MAPPING.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/PAGES_UNCLEAR_ENTITY_LIST.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/PAGES_UNCLEAR_ENTITY_LIST.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/PHASE_1_READINESS_ASSESSMENT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/PHASE_1_READINESS_ASSESSMENT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/PHASE_1_TEAMS_REQUIRED.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/PHASE_1_TEAMS_REQUIRED.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/SESSION_01_PROGRESS_LOG.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/SESSION_01_PROGRESS_LOG.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_10_GATE_B_GREEN_DOCUMENTATION_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_10_GATE_B_GREEN_DOCUMENTATION_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_10_PHASE_2_CLOSURE_PLAN_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_10_PHASE_2_CLOSURE_PLAN_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_10_PROCESS_FORMALIZATION_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_10_PROCESS_FORMALIZATION_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_10_REVIEW_TEAM_20_PHASE_1.1_1.2.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_REVIEW_TEAM_20_PHASE_1.1_1.2.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_10_SLA_30_40_IMPLEMENTATION_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_10_SLA_30_40_IMPLEMENTATION_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_ADR_015_COMPLETION_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_20_ADR_015_COMPLETION_REPORT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_BATCH_1_CLOSURE_COMPLIANCE_REPORT.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_20_BATCH_1_CLOSURE_COMPLIANCE_REPORT.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_TO_TEAM_10_SESSION_COMPLETION_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_20_TO_TEAM_10_SESSION_COMPLETION_REPORT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_USER_PROFILE_GAPS_ANALYSIS.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_20_USER_PROFILE_GAPS_ANALYSIS.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_VALIDATION_ERROR_CODE_IMPLEMENTATION.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_20_VALIDATION_ERROR_CODE_IMPLEMENTATION.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_ADR_015_D16_GOVERNANCE_MESSAGE_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_30_ADR_015_D16_GOVERNANCE_MESSAGE_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_ADR_015_D18_FEES_PER_ACCOUNT_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_30_ADR_015_D18_FEES_PER_ACCOUNT_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_ADR_015_INITIAL_VERIFICATION_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_30_ADR_015_INITIAL_VERIFICATION_REPORT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_HOMEPAGE_401_FIX_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_30_HOMEPAGE_401_FIX_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_MB3A_ALERTS_INTEGRATION_COMPLETION_REPORT.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_30_MB3A_ALERTS_INTEGRATION_COMPLETION_REPORT.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_MB3A_NOTES_IMPLEMENTATION_SUMMARY_REPORT.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_30_MB3A_NOTES_IMPLEMENTATION_SUMMARY_REPORT.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_NOTES_PAGE_DESIGN_DATA_COMPATIBILITY_REPORT.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_30_NOTES_PAGE_DESIGN_DATA_COMPATIBILITY_REPORT.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_NOTES_PAGE_IMPLEMENTATION_EVIDENCE.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_30_NOTES_PAGE_IMPLEMENTATION_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_NOTES_PAGINATION_SORT_FIX_EVIDENCE.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_30_NOTES_PAGINATION_SORT_FIX_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_RICH_TEXT_EDITOR_ENGLISH_ALIGN_HEADINGS_EVIDENCE.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_30_RICH_TEXT_EDITOR_ENGLISH_ALIGN_HEADINGS_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_RICH_TEXT_EDITOR_UNIFIED_EVIDENCE.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_30_RICH_TEXT_EDITOR_UNIFIED_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_RICH_TEXT_T30_2_TO_T30_5_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_30_RICH_TEXT_T30_2_TO_T30_5_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_TASK_3_BROKER_SELECT_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_30_TASK_3_BROKER_SELECT_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_31_TICKERS_BLUEPRINT_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_31_TICKERS_BLUEPRINT_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_40_READINESS_DECLARATION.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_40_READINESS_DECLARATION.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_ARTIFACTS_UPDATE_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_ARTIFACTS_UPDATE_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_AUTH_UNIFIED_OPTION_B_VERIFICATION_FINAL.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_AUTH_UNIFIED_OPTION_B_VERIFICATION_FINAL.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_AUTH_UNIFIED_STATUS_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_AUTH_UNIFIED_STATUS_REPORT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_CRUD_VALIDATION_DETAILED_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_CRUD_VALIDATION_DETAILED_REPORT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_CRUD_VALIDATION_REPORT_REF.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_CRUD_VALIDATION_REPORT_REF.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_FINAL_VERIFICATION_AND_SUMMARY_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_FINAL_VERIFICATION_AND_SUMMARY_REPORT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_GATE_A_QA_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_GATE_A_QA_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_GATE_A_SEVERE_ANALYSIS_AND_DECISION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_GATE_A_SEVERE_ANALYSIS_AND_DECISION.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_GATE_B_RE_RUN_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_GATE_B_RE_RUN_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_HOMEPAGE_API_ANALYSIS_AND_FIX_REQUEST.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_HOMEPAGE_API_ANALYSIS_AND_FIX_REQUEST.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_HOMEPAGE_FIX_VERIFICATION_AND_PHASE2_ISSUE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_HOMEPAGE_FIX_VERIFICATION_AND_PHASE2_ISSUE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1_COMPLETION_B_VALIDATION_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1_COMPLETION_B_VALIDATION_REPORT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1_QA_REPORT_GATE_A_PASSED.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1_QA_REPORT_GATE_A_PASSED.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_POST_FIXES_VERIFICATION_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_POST_FIXES_VERIFICATION_REPORT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_T50_1_COMPLETION_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_T50_1_COMPLETION_REPORT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TO_TEAM_10_422_REQUEST_BODY_CAPTURE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_TO_TEAM_10_422_REQUEST_BODY_CAPTURE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TO_TEAM_10_GATE_A_REVERIFICATION_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_TO_TEAM_10_GATE_A_REVERIFICATION_REPORT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TO_TEAM_10_REVERIFICATION_COMPLETE_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_TO_TEAM_10_REVERIFICATION_COMPLETE_REPORT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_VALIDATION_REPORT_P2_COMPLETE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/TEAM_50_VALIDATION_REPORT_P2_COMPLETE.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_FINAL_SUCCESS.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_FINAL_SUCCESS.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_FINAL_VERIFICATION.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_FINAL_VERIFICATION.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_SUCCESS.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_SUCCESS.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_VERIFICATION.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_VERIFICATION.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_60_INFRASTRUCTURE_SETUP_PROGRESS.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_60_INFRASTRUCTURE_SETUP_PROGRESS.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_60_PORT_ISSUE_RESOLUTION.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_60_PORT_ISSUE_RESOLUTION.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/TEAM_60_SQLALCHEMY_VERIFICATION.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_60_SQLALCHEMY_VERIFICATION.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/USER_TICKER_PAGE_READINESS_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/USER_TICKER_PAGE_READINESS_REPORT.md | ARCHIVED | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/gate-a-artifacts/GATE_A_QA_REPORT.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/gate-a-artifacts/GATE_A_QA_REPORT.md | ACTIVE | Team 70 | |
| documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/TEAM_50_GATE_B_SIGNED_QA_REPORT.md | documentation/reports/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/TEAM_50_GATE_B_SIGNED_QA_REPORT.md | ACTIVE | Team 70 | |
| documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md | documentation/docs-system/02-SERVER/ADR_015_GOVERNANCE_MESSAGE_SSOT.md | ACTIVE | Team 70 | |
| documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_ADMIN_DUPLICATE_EMAIL_PHONE.sql | documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.5_ADMIN_DUPLICATE_EMAIL_PHONE.sql | ACTIVE | Team 70 | |
| documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql | documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql | ACTIVE | Team 70 | |
| documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_MARKET_DATA_SYSTEM_SETTINGS_DDL.sql | documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.5_MARKET_DATA_SYSTEM_SETTINGS_DDL.sql | ACTIVE | Team 70 | |
| documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_NOTES_ATTACHMENTS_DDL.sql | documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.5_NOTES_ATTACHMENTS_DDL.sql | ACTIVE | Team 70 | |
| documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_REFRESH_TOKENS_ADDITION.sql | documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.5_REFRESH_TOKENS_ADDITION.sql | ACTIVE | Team 70 | |
| documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_USER_API_KEYS_TABLE.sql | documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.5_USER_API_KEYS_TABLE.sql | ACTIVE | Team 70 | |
| documentation/06-ENGINEERING/WP_20_11_DDL_MASTER_V2.5.2.sql | documentation/docs-system/02-SERVER/WP_20_11_DDL_MASTER_V2.5.2.sql | ACTIVE | Team 70 | |
| documentation/06-ENGINEERING/auth_handover/AUTH_DEVELOPER_HANDOVER.md | documentation/docs-system/02-SERVER/auth_handover/AUTH_DEVELOPER_HANDOVER.md | ACTIVE | Team 70 | |
| documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml | documentation/docs-governance/06-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml | ACTIVE | Team 70 | |
| documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2_MARKET_DATA_SETTINGS_ADDENDUM.yaml | documentation/docs-governance/06-CONTRACTS/OPENAPI_SPEC_V2.5.2_MARKET_DATA_SETTINGS_ADDENDUM.yaml | ACTIVE | Team 70 | |
| documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM.yaml | documentation/docs-governance/06-CONTRACTS/OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM.yaml | ACTIVE | Team 70 | |
| documentation/07-CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml | documentation/docs-governance/06-CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml | ACTIVE | Team 70 | |
| documentation/07-CONTRACTS/SSOT_1_2_1_SUMMARY_AND_CONVERSIONS_ENDPOINTS.md | documentation/docs-governance/06-CONTRACTS/SSOT_1_2_1_SUMMARY_AND_CONVERSIONS_ENDPOINTS.md | ACTIVE | Team 70 | |
| documentation/07-CONTRACTS/SSOT_AUTH_CONTRACT.md | documentation/docs-governance/06-CONTRACTS/SSOT_AUTH_CONTRACT.md | ACTIVE | Team 70 | |
| documentation/07-POLICIES/TT2_GOVERNANCE_V2_102_SOP_013_CLOSURE_GATE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/07-POLICIES/TT2_GOVERNANCE_V2_102_SOP_013_CLOSURE_GATE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/MASTER_SESSION_LEDGER.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/MASTER_SESSION_LEDGER.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/PHX_INITIAL_DEPLOY_LOG.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/PHX_INITIAL_DEPLOY_LOG.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/PHX_SYNC_LOG.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/PHX_SYNC_LOG.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/S04_CLOSURE_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/S04_CLOSURE_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/S05_OPENING_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/S05_OPENING_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/SESSION_03_CLOSURE_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/SESSION_03_CLOSURE_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/SESSION_04_CLOSURE_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/SESSION_04_CLOSURE_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/SESSION_04_OPENING_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/SESSION_04_OPENING_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/SESSION_05_OPENING_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/SESSION_05_OPENING_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/TEAM_ACTIVITY_LEDGER.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/TEAM_ACTIVITY_LEDGER.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/TT2_PHASE_2_RELEASE_SUMMARY.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/TT2_PHASE_2_RELEASE_SUMMARY.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/TT2_WORKSPACE_AUDIT_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/TT2_WORKSPACE_AUDIT_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/PHASE_1_ACTIVATION_ORDER.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/PHASE_1_ACTIVATION_ORDER.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/PHASE_1_READINESS_ASSESSMENT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/PHASE_1_READINESS_ASSESSMENT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/PHASE_1_READINESS_DECLARATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/PHASE_1_READINESS_DECLARATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/PHASE_1_TASK_BREAKDOWN.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/PHASE_1_TASK_BREAKDOWN.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/PHASE_1_TEAMS_REQUIRED.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/PHASE_1_TEAMS_REQUIRED.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/SESSION_01_PROGRESS_LOG.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/SESSION_01_PROGRESS_LOG.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_10_BLUEPRINT_INTEGRATION_ANALYSIS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_10_BLUEPRINT_INTEGRATION_ANALYSIS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_10_JS_STANDARDS_REVIEW_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_10_JS_STANDARDS_REVIEW_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_10_PHASE_1_COMPLETE_REVIEW.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_10_PHASE_1_COMPLETE_REVIEW.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_10_QA_APPROVAL_PHASE_1.4.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_10_QA_APPROVAL_PHASE_1.4.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_10_REVIEW_TEAM_20_PHASE_1.1_1.2.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_10_REVIEW_TEAM_20_PHASE_1.1_1.2.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_10_SESSION_01_EXECUTION_INSTRUCTIONS_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_10_SESSION_01_EXECUTION_INSTRUCTIONS_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_500_ERROR_DEBUGGING_ENHANCEMENTS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_500_ERROR_DEBUGGING_ENHANCEMENTS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_ADMIN_LOGIN_DATETIME_FIX.md | documentation/reports/08-REPORTS/artifacts_SESSION_01/TEAM_20_ADMIN_LOGIN_DATETIME_FIX.md | ACTIVE | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_ADMIN_ROLE_UPDATE.md | documentation/reports/08-REPORTS/artifacts_SESSION_01/TEAM_20_ADMIN_ROLE_UPDATE.md | ACTIVE | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_BACKEND_OPERATIONAL_ACKNOWLEDGMENT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_BACKEND_OPERATIONAL_ACKNOWLEDGMENT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_BACKEND_REVIEW_CHECKPOINT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_BACKEND_REVIEW_CHECKPOINT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_BACKEND_REVIEW_SUMMARY.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_BACKEND_REVIEW_SUMMARY.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_BASE_USERS_CONFIGURATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_BASE_USERS_CONFIGURATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_CLARIFICATION_REQUEST.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_CLARIFICATION_REQUEST.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_CLARIFICATION_RESPONSE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_CLARIFICATION_RESPONSE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_CORS_AND_500_ERROR_FIX_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_CORS_AND_500_ERROR_FIX_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_DEV_OPS_FIX_RESPONSE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_DEV_OPS_FIX_RESPONSE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_EOD_REPORT_2026-01-31.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_EOD_REPORT_2026-01-31.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_FINAL_STATUS_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_FINAL_STATUS_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_FINAL_SUMMARY.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_FINAL_SUMMARY.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_LOGIN_ISSUE_FIX.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_LOGIN_ISSUE_FIX.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_METADATA_FIX_RESPONSE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_METADATA_FIX_RESPONSE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_PASSLIB_BCRYPT_COMPATIBILITY_ISSUE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_PASSLIB_BCRYPT_COMPATIBILITY_ISSUE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_PASSLIB_BCRYPT_IMPLEMENTATION_COMPLETE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_PASSLIB_BCRYPT_IMPLEMENTATION_COMPLETE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_PASSWORD_CHANGE_IMPLEMENTATION_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_PASSWORD_CHANGE_IMPLEMENTATION_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_PASSWORD_CHANGE_PROPOSAL.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_PASSWORD_CHANGE_PROPOSAL.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_PHASE_1.3_QA_ACKNOWLEDGMENT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_PHASE_1.3_QA_ACKNOWLEDGMENT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_PHASE_1_PRE_QA_COMPLETION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_PHASE_1_PRE_QA_COMPLETION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_PROGRESS_UPDATE_2026-01-31.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_PROGRESS_UPDATE_2026-01-31.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_QA_CHECKPOINT_ANALYSIS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_QA_CHECKPOINT_ANALYSIS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_QA_FEEDBACK_RESPONSE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_QA_FEEDBACK_RESPONSE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_QUESTION_2_REMAINING_CLARIFICATIONS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_QUESTION_2_REMAINING_CLARIFICATIONS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_READINESS_DECLARATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_READINESS_DECLARATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_REGISTRATION_ENDPOINT_FIX_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_REGISTRATION_ENDPOINT_FIX_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_REVIEW_RESPONSE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_REVIEW_RESPONSE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_TABLE_ARGS_FIX_RESPONSE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_TABLE_ARGS_FIX_RESPONSE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.1_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.1_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.2_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.2_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.3_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.3_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.4_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.4_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.5_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.5_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.6_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.6_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.7_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.7_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.8_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.8_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_UNIQUECONSTRAINT_FIX_RESPONSE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_UNIQUECONSTRAINT_FIX_RESPONSE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_USERS_ME_ENDPOINT_FIX.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_USERS_ME_ENDPOINT_FIX.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_20_USERUPDATE_FIX_RESPONSE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_20_USERUPDATE_FIX_RESPONSE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_30_INTEGRATION_READY.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_30_INTEGRATION_READY.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_30_PROGRESS_REPORT_PHASE_1.3.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_30_PROGRESS_REPORT_PHASE_1.3.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_30_QA_FEEDBACK_RESPONSE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_30_QA_FEEDBACK_RESPONSE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_30_QA_TESTING_PACKAGE_PHASE_1.3.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_30_QA_TESTING_PACKAGE_PHASE_1.3.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_30_READINESS_DECLARATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_30_READINESS_DECLARATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_30_READINESS_DECLARATION_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_30_READINESS_DECLARATION_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_40_CSS_HIERARCHY_AUDIT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_40_CSS_HIERARCHY_AUDIT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_40_READINESS_DECLARATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_40_READINESS_DECLARATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_40_TASK_2.3_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_40_TASK_2.3_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_40_TASK_2.4_EVIDENCE.md | documentation/reports/08-REPORTS/artifacts_SESSION_01/TEAM_40_TASK_2.4_EVIDENCE.md | ACTIVE | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_40_TASK_40.1.1_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_40_TASK_40.1.1_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_ALL_PAGES_COMPREHENSIVE_QA_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_ALL_PAGES_COMPREHENSIVE_QA_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_ALL_PAGES_RE_QA_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_ALL_PAGES_RE_QA_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_AUDIT_TRAIL_COMPLIANCE_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_AUDIT_TRAIL_COMPLIANCE_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_CSS_REFACTOR_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_CSS_REFACTOR_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_D16_ACCTS_VIEW_QA_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_D16_ACCTS_VIEW_QA_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_D16_ACCTS_VIEW_RE_QA_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_D16_ACCTS_VIEW_RE_QA_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_D16_ACCTS_VIEW_RUNTIME_TEST_REPORT.md | documentation/reports/08-REPORTS/artifacts_SESSION_01/TEAM_50_D16_ACCTS_VIEW_RUNTIME_TEST_REPORT.md | ACTIVE | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_FORMAT_ADOPTION_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_FORMAT_ADOPTION_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_G_BRIDGE_VALIDATION_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_G_BRIDGE_VALIDATION_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_HOMEPAGE_FINAL_QA_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_HOMEPAGE_FINAL_QA_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_HOMEPAGE_RE_QA_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_HOMEPAGE_RE_QA_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_INFRASTRUCTURE_VERIFICATION_AND_TESTING.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_INFRASTRUCTURE_VERIFICATION_AND_TESTING.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_ISSUES_BY_TEAM_PHASE_1.3.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_ISSUES_BY_TEAM_PHASE_1.3.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_LOGIN_CORS_AND_ERROR_HANDLING_ISSUES.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_LOGIN_CORS_AND_ERROR_HANDLING_ISSUES.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_LOGIN_CREDENTIALS_VERIFICATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_LOGIN_CREDENTIALS_VERIFICATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_LOGIN_FIXES_VERIFICATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_LOGIN_FIXES_VERIFICATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_LOGIN_FIX_VERIFICATION_COMPLETE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_LOGIN_FIX_VERIFICATION_COMPLETE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_LOGIN_RE_TEST_RESULTS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_LOGIN_RE_TEST_RESULTS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_PASSLIB_BCRYPT_FIX_VERIFICATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_PASSLIB_BCRYPT_FIX_VERIFICATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_PASSLIB_BCRYPT_QA_RESULTS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_PASSLIB_BCRYPT_QA_RESULTS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_PASSWORD_CHANGE_EYE_ICON_VERIFICATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_PASSWORD_CHANGE_EYE_ICON_VERIFICATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_PASSWORD_CHANGE_QA_RESULTS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_PASSWORD_CHANGE_QA_RESULTS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_PASSWORD_CHANGE_RUNTIME_TEST_RESULTS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_PASSWORD_CHANGE_RUNTIME_TEST_RESULTS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.3_FRONTEND_QA_RESULTS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.3_FRONTEND_QA_RESULTS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.3_QA_COMPLETE_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.3_QA_COMPLETE_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.3_QA_COMPLETE_WITH_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.3_QA_COMPLETE_WITH_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.3_RUNTIME_QA_RESULTS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.3_RUNTIME_QA_RESULTS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.4_QA_RESULTS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.4_QA_RESULTS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.5_INTEGRATION_TESTING_PLAN.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.5_INTEGRATION_TESTING_PLAN.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.5_INTEGRATION_TESTING_RESULTS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.5_INTEGRATION_TESTING_RESULTS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_PRODUCT_AUDIT_QA_REPORT.md | documentation/reports/08-REPORTS/artifacts_SESSION_01/TEAM_50_PRODUCT_AUDIT_QA_REPORT.md | ACTIVE | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_PRODUCT_AUDIT_QA_REPORT_FINAL.md | documentation/reports/08-REPORTS/artifacts_SESSION_01/TEAM_50_PRODUCT_AUDIT_QA_REPORT_FINAL.md | ACTIVE | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_QA_FEEDBACK_FINAL_APPROVAL.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_QA_FEEDBACK_FINAL_APPROVAL.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_QA_FEEDBACK_VERIFICATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_QA_FEEDBACK_VERIFICATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_REGISTRATION_FIX_VERIFICATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_REGISTRATION_FIX_VERIFICATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_REVOKED_TOKENS_TABLE_VERIFICATION_COMPLETE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_REVOKED_TOKENS_TABLE_VERIFICATION_COMPLETE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.1.1_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.1.1_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.1.2_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.1.2_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.1.3_MANUAL_ENDPOINT_TESTING.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.1.3_MANUAL_ENDPOINT_TESTING.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.1.4_SECURITY_TESTING.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.1.4_SECURITY_TESTING.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.1.5_COMPLIANCE_VERIFICATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.1.5_COMPLIANCE_VERIFICATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.1_AUTHENTICATION_FLOW_INTEGRATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.1_AUTHENTICATION_FLOW_INTEGRATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.2_USER_MANAGEMENT_FLOW_INTEGRATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.2_USER_MANAGEMENT_FLOW_INTEGRATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.3_API_KEYS_FLOW_INTEGRATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.3_API_KEYS_FLOW_INTEGRATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.4_ERROR_HANDLING_SECURITY_INTEGRATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.4_ERROR_HANDLING_SECURITY_INTEGRATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_USERS_ME_ENDPOINT_RE_TEST.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_USERS_ME_ENDPOINT_RE_TEST.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_VALIDATION_COMPREHENSIVE_TESTING.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_50_VALIDATION_COMPREHENSIVE_TESTING.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_FINAL_SUCCESS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_FINAL_SUCCESS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_FINAL_VERIFICATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_FINAL_VERIFICATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_SUCCESS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_SUCCESS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_VERIFICATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_60_BACKEND_STARTUP_VERIFICATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_60_INFRASTRUCTURE_SETUP_PROGRESS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_60_INFRASTRUCTURE_SETUP_PROGRESS.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_60_PHASE_1.3_COMPLETE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_60_PHASE_1.3_COMPLETE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_60_PORT_ISSUE_RESOLUTION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_60_PORT_ISSUE_RESOLUTION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_60_SERVER_STARTUP_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_60_SERVER_STARTUP_REPORT.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_60_SQLALCHEMY_VERIFICATION.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_60_SQLALCHEMY_VERIFICATION.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_60_TASK_60.1.1_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_60_TASK_60.1.1_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_60_TASK_60.1.2_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_60_TASK_60.1.2_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_60_TASK_60.1.3_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_60_TASK_60.1.3_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/08-REPORTS/artifacts_SESSION_01/TEAM_60_TASK_60.1.4_EVIDENCE.md | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/TEAM_60_TASK_60.1.4_EVIDENCE.md | ARCHIVED | Team 70 | |
| documentation/09-GOVERNANCE/ARCHITECT_MODULE_MENU_STYLING_SSOT.md | documentation/docs-governance/09-GOVERNANCE/ARCHITECT_MODULE_MENU_STYLING_SSOT.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md | documentation/docs-governance/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/GIN_003_COMPLIANCE_REPORT.md | documentation/docs-governance/09-GOVERNANCE/GIN_003_COMPLIANCE_REPORT.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/PHOENIX_REORG_AUDIT_LOG_v3.3.md | documentation/docs-governance/09-GOVERNANCE/PHOENIX_REORG_AUDIT_LOG_v3.3.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/PHOENIX_REORG_AUDIT_LOG_v3.4.md | documentation/docs-governance/09-GOVERNANCE/PHOENIX_REORG_AUDIT_LOG_v3.4.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/PHOENIX_SANITY_REPORT_V1_TEAM_B.md | documentation/docs-governance/09-GOVERNANCE/PHOENIX_SANITY_REPORT_V1_TEAM_B.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md | documentation/docs-governance/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md | documentation/docs-governance/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md | documentation/docs-governance/09-GOVERNANCE/TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/gins/GIN_2026_008_TECHNICAL_CLARIFICATIONS.md | documentation/docs-governance/09-GOVERNANCE/gins/GIN_2026_008_TECHNICAL_CLARIFICATIONS.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/standards/ARCHITECT_POLICY_HYBRID_SCRIPTS.md | documentation/docs-governance/09-GOVERNANCE/standards/ARCHITECT_POLICY_HYBRID_SCRIPTS.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md | documentation/docs-governance/09-GOVERNANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/standards/D16_MODULE_REFERENCE_SSOT.md | documentation/docs-governance/09-GOVERNANCE/standards/D16_MODULE_REFERENCE_SSOT.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/standards/PAGE_LAYOUT_AND_SECTIONS_SSOT.md | documentation/docs-governance/09-GOVERNANCE/standards/PAGE_LAYOUT_AND_SECTIONS_SSOT.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md | documentation/docs-governance/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/standards/TEAM_50_QA_REPORT_TEMPLATE.md | documentation/docs-governance/09-GOVERNANCE/standards/TEAM_50_QA_REPORT_TEMPLATE.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/standards/TEAM_50_QA_TEST_INDEX.md | documentation/docs-governance/09-GOVERNANCE/standards/TEAM_50_QA_TEST_INDEX.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md | documentation/docs-governance/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md | ACTIVE | Team 70 | |
| documentation/09-GOVERNANCE/standards/TT2_DESIGN_FIDELITY_FIX_PROTOCOL.md | documentation/docs-governance/09-GOVERNANCE/standards/TT2_DESIGN_FIDELITY_FIX_PROTOCOL.md | ACTIVE | Team 70 | |
| documentation/10-POLICIES/TT2_ARCHITECT_ROLE_DEFINITION.md | documentation/docs-governance/01-POLICIES/TT2_ARCHITECT_ROLE_DEFINITION.md | ACTIVE | Team 70 | |
| documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md | documentation/docs-governance/01-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md | ACTIVE | Team 70 | |
| documentation/10-POLICIES/TT2_FORM_VALIDATION_FRAMEWORK.md | documentation/docs-governance/01-POLICIES/TT2_FORM_VALIDATION_FRAMEWORK.md | ACTIVE | Team 70 | |
| documentation/10-POLICIES/TT2_GREENFIELD_MANIFESTO.md | documentation/docs-governance/01-POLICIES/TT2_GREENFIELD_MANIFESTO.md | ACTIVE | Team 70 | |
| documentation/10-POLICIES/TT2_IMMUTABLE_LEDGER_POLICY.md | documentation/docs-governance/01-POLICIES/TT2_IMMUTABLE_LEDGER_POLICY.md | ACTIVE | Team 70 | |
| documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md | documentation/docs-governance/01-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md | ACTIVE | Team 70 | |
| documentation/10-POLICIES/TT2_JUNIOR_ARCHITECT_CONTRACT.md | documentation/docs-governance/01-POLICIES/TT2_JUNIOR_ARCHITECT_CONTRACT.md | ACTIVE | Team 70 | |
| documentation/10-POLICIES/TT2_MAINTENANCE_LIFECYCLE.md | documentation/docs-governance/01-POLICIES/TT2_MAINTENANCE_LIFECYCLE.md | ACTIVE | Team 70 | |
| documentation/10-POLICIES/TT2_MASTER_WORKSPACE_MAP.md | documentation/docs-governance/01-POLICIES/TT2_MASTER_WORKSPACE_MAP.md | ACTIVE | Team 70 | |
| documentation/10-POLICIES/TT2_TEAM_60_DEFINITION.md | documentation/docs-governance/01-POLICIES/TT2_TEAM_60_DEFINITION.md | ACTIVE | Team 70 | |
| documentation/10-POLICIES/TT2_TEAM_OPERATIONS_CHARTER.md | documentation/docs-governance/01-POLICIES/TT2_TEAM_OPERATIONS_CHARTER.md | ACTIVE | Team 70 | |
| documentation/10-POLICIES/TT2_VERSIONING_POLICY.md | documentation/docs-governance/01-POLICIES/TT2_VERSIONING_POLICY.md | ACTIVE | Team 70 | |
| documentation/10-POLICIES/TT2_VERSION_MATRIX.md | documentation/docs-governance/01-POLICIES/TT2_VERSION_MATRIX.md | ACTIVE | Team 70 | |
| documentation/10-POLICIES/TT2_WORKSPACE_MIGRATION_MANIFEST.md | documentation/docs-governance/01-POLICIES/TT2_WORKSPACE_MIGRATION_MANIFEST.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/00_MASTER_INDEX.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/00_MASTER_INDEX.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_DATA_MANAGEMENT_SOP_011.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_DATA_MANAGEMENT_SOP_011.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_PHASE_2_GAP_ANALYSIS_REPORT.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_PHASE_2_GAP_ANALYSIS_REPORT.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_SANITIZATION_POLICY.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_SANITIZATION_POLICY.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_SANITIZATION_SPEC.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_SANITIZATION_SPEC.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/BATCH_2_5_COMPLETIONS_MANDATE.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/BATCH_2_5_COMPLETIONS_MANDATE.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/CSS_EXCELLENCE_PROTOCOL.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/CSS_EXCELLENCE_PROTOCOL.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/DEPRECATION_NOTICE.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/DEPRECATION_NOTICE.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/OFFICIAL_PAGE_TRACKER.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/OFFICIAL_PAGE_TRACKER.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_ARCHITECTURE_AND_RUNTIME_FLOWS.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_ARCHITECTURE_AND_RUNTIME_FLOWS.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_CURRENT_STATE_AND_GAPS.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_CURRENT_STATE_AND_GAPS.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_DOMAIN_MODEL_AND_ENTITIES.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_DOMAIN_MODEL_AND_ENTITIES.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_GOVERNANCE_AND_QUALITY_GATES.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_GOVERNANCE_AND_QUALITY_GATES.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_ROADMAP_NEXT_STEPS.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_ROADMAP_NEXT_STEPS.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_SECURITY_AND_AUTH_MODEL.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_SECURITY_AND_AUTH_MODEL.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_SYSTEM_OVERVIEW.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_SYSTEM_OVERVIEW.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_UI_SYSTEMS_AND_DESIGN.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_UI_SYSTEMS_AND_DESIGN.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_WORK_OPERATING_MODEL.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_WORK_OPERATING_MODEL.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/PHASE_2_CLOSURE_DECISION_MATRIX.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/PHASE_2_CLOSURE_DECISION_MATRIX.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/PHOENIX_ARCHITECT_MASTER_INDEX.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/PHOENIX_ARCHITECT_MASTER_INDEX.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/PHOENIX_ORGANIZATIONAL_STRUCTURE.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/PHOENIX_ORGANIZATIONAL_STRUCTURE.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/TT2_GOVERNANCE_AND_AI_COMMUNICATION_PROTOCOL.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/TT2_GOVERNANCE_AND_AI_COMMUNICATION_PROTOCOL.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/TT2_PAGE_TEMPLATE_CONTRACT.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/TT2_PAGE_TEMPLATE_CONTRACT.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/TT2_PAGE_TEMPLATE_CONTRACT_v1.1.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/TT2_PAGE_TEMPLATE_CONTRACT_v1.1.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/TT2_RTL_DEVELOPMENT_CHARTER.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/TT2_RTL_DEVELOPMENT_CHARTER.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/TT2_SLA_TEAMS_30_40_OFFICIAL.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/TT2_SLA_TEAMS_30_40_OFFICIAL.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/TT2_TASK_GOVERNANCE_PROTOCOL.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/TT2_TASK_GOVERNANCE_PROTOCOL.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/TT2_VERSIONING_POLICY.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/TT2_VERSIONING_POLICY.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/TT2_VERSION_MATRIX.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/TT2_VERSION_MATRIX.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/TT2_VERSION_MATRIX_v1.0.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/TT2_VERSION_MATRIX_v1.0.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/00_FINAL_ARCHITECT_REPORT_BATCH_1.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/00_FINAL_ARCHITECT_REPORT_BATCH_1.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/01_TECHNICAL/API_DOCUMENTATION_ENHANCED.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/01_TECHNICAL/API_DOCUMENTATION_ENHANCED.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/01_TECHNICAL/ARCHITECTURE_OVERVIEW.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/01_TECHNICAL/ARCHITECTURE_OVERVIEW.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/01_TECHNICAL/CSS_DNA_SURGICAL_AUDIT.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/01_TECHNICAL/CSS_DNA_SURGICAL_AUDIT.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/01_TECHNICAL_SNAPSHOT_INDEX.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/01_TECHNICAL_SNAPSHOT_INDEX.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/02_CSS_DNA_VALIDATION_REPORT.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/02_CSS_DNA_VALIDATION_REPORT.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/02_PRODUCT/LOD_400_FIDELITY_STANDARDS.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/02_PRODUCT/LOD_400_FIDELITY_STANDARDS.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/02_PRODUCT/USER_EXPERIENCE_DOCUMENTATION.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/02_PRODUCT/USER_EXPERIENCE_DOCUMENTATION.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/03_MARKETING/BRANDING_BOOK_V2.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/03_MARKETING/BRANDING_BOOK_V2.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/03_MARKETING/PRODUCT_POSITIONING.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/03_MARKETING/PRODUCT_POSITIONING.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/03_PRODUCT_AND_MARKETING_STRATEGY.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/03_PRODUCT_AND_MARKETING_STRATEGY.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/ARCHITECT_BATCH_1_GRAND_FINALE.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/ARCHITECT_BATCH_1_GRAND_FINALE.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/ARCHITECT_CSS_SURGICAL_AUDIT.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/ARCHITECT_CSS_SURGICAL_AUDIT.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/EXTERNAL_AUDIT_EXECUTIVE_SUMMARY.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/EXTERNAL_AUDIT_EXECUTIVE_SUMMARY.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/LOD_400_FIDELITY_STANDARDS_FINAL.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/LOD_400_FIDELITY_STANDARDS_FINAL.md | ACTIVE | Team 70 | |
| documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/PHOENIX_EXTERNAL_AUDIT_EXECUTIVE_SUMMARY.md | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/PHOENIX_EXTERNAL_AUDIT_EXECUTIVE_SUMMARY.md | ACTIVE | Team 70 | |
| documentation/99-ARCHIVE/GIN_003_COMPLIANCE_REPORT.md | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE/GIN_003_COMPLIANCE_REPORT.md | ARCHIVED | Team 70 | |
| documentation/99-ARCHIVE/GIN_004_UI_ALIGNMENT_SPEC.md | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE/GIN_004_UI_ALIGNMENT_SPEC.md | ARCHIVED | Team 70 | |
| documentation/99-ARCHIVE/LEGACY_TO_PHOENIX_MAPPING_V2.5.md | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE/LEGACY_TO_PHOENIX_MAPPING_V2.5.md | ARCHIVED | Team 70 | |
| documentation/99-ARCHIVE/OLD_LOGIC_ATTEMPTS/WP_20_03_ENTITY_MONEY_FX.md | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE/OLD_LOGIC_ATTEMPTS/WP_20_03_ENTITY_MONEY_FX.md | ARCHIVED | Team 70 | |
| documentation/99-ARCHIVE/OLD_LOGIC_ATTEMPTS/WP_20_03_ENTITY_TIME_MARKET.md | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE/OLD_LOGIC_ATTEMPTS/WP_20_03_ENTITY_TIME_MARKET.md | ARCHIVED | Team 70 | |
| documentation/99-ARCHIVE/OLD_LOGIC_ATTEMPTS/WP_20_04_ENTITY_EXCHANGE_RATES.md | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE/OLD_LOGIC_ATTEMPTS/WP_20_04_ENTITY_EXCHANGE_RATES.md | ARCHIVED | Team 70 | |
| documentation/99-ARCHIVE/OLD_LOGIC_ATTEMPTS/WP_20_04_ENTITY_TIME_MARKETS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE/OLD_LOGIC_ATTEMPTS/WP_20_04_ENTITY_TIME_MARKETS.md | ARCHIVED | Team 70 | |
| documentation/99-ARCHIVE/OLD_LOGIC_ATTEMPTS/WP_20_04_ENTITY_TRADING_ACCOUNTS.md | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE/OLD_LOGIC_ATTEMPTS/WP_20_04_ENTITY_TRADING_ACCOUNTS.md | ARCHIVED | Team 70 | |
| documentation/99-ARCHIVE/PHOENIX_SANITY_REPORT_V1_TEAM_B.md | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE/PHOENIX_SANITY_REPORT_V1_TEAM_B.md | ARCHIVED | Team 70 | |
| documentation/99-ARCHIVE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql | ARCHIVED | Team 70 | |
| documentation/99-ARCHIVE/deprecated_indexes_phase_1.7/D15_SYSTEM_INDEX.md | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE/deprecated_indexes_phase_1.7/D15_SYSTEM_INDEX.md | ARCHIVED | Team 70 | |
| documentation/99-ARCHIVE/deprecated_indexes_phase_1.7/PHOENIX_ARCHITECT_MASTER_INDEX.md | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE/deprecated_indexes_phase_1.7/PHOENIX_ARCHITECT_MASTER_INDEX.md | ARCHIVED | Team 70 | |
| documentation/99-ARCHIVE/deprecated_indexes_phase_1.7/README.md | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE/deprecated_indexes_phase_1.7/README.md | ARCHIVED | Team 70 | |
| documentation/99-ARCHIVE/deprecated_indexes_phase_1.7/TT2_MASTER_DOCUMENTATION_INDEX.md | archive/documentation_legacy/snapshots/2026-02-17_0000/99-ARCHIVE/deprecated_indexes_phase_1.7/TT2_MASTER_DOCUMENTATION_INDEX.md | ARCHIVED | Team 70 | |
| documentation/01-ARCHITECTURE/FRONTEND/EXAMPLES/D15_LOGIN_EXAMPLE.html | documentation/docs-system/01-ARCHITECTURE/FRONTEND/EXAMPLES/D15_LOGIN_EXAMPLE.html | ACTIVE | Team 70 | V3 |
| documentation/01-ARCHITECTURE/FRONTEND/EXAMPLES/D15_PROF_EXAMPLE.html | documentation/docs-system/01-ARCHITECTURE/FRONTEND/EXAMPLES/D15_PROF_EXAMPLE.html | ACTIVE | Team 70 | V3 |
| documentation/01-ARCHITECTURE/FRONTEND/WP_10_02_BATCH_A_FIELDS.json | documentation/docs-system/01-ARCHITECTURE/FRONTEND/WP_10_02_BATCH_A_FIELDS.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts/MD_SETTINGS_403_EVIDENCE_20260215_220242.log | documentation/reports/05-REPORTS/artifacts/MD_SETTINGS_403_EVIDENCE_20260215_220242.log | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts/TEAM_50_MB3A_ALERTS_E2E_RESULTS.json | documentation/reports/05-REPORTS/artifacts/TEAM_50_MB3A_ALERTS_E2E_RESULTS.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts/TEAM_50_MB3A_NOTES_E2E_RESULTS.json | documentation/reports/05-REPORTS/artifacts/TEAM_50_MB3A_NOTES_E2E_RESULTS.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts/TEAM_60_CLEANUP_EVIDENCE.json | documentation/reports/05-REPORTS/artifacts/TEAM_60_CLEANUP_EVIDENCE.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts/external-data-live-ui/tickers-2026-02-13T23-18-51.png | documentation/reports/05-REPORTS/artifacts/external-data-live-ui/tickers-2026-02-13T23-18-51.png | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts/external-data-live-ui/trading_accounts-2026-02-13T23-18-51.png | documentation/reports/05-REPORTS/artifacts/external-data-live-ui/trading_accounts-2026-02-13T23-18-51.png | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/SESSION_01_START_LOG.txt | documentation/reports/05-REPORTS/artifacts_SESSION_01/SESSION_01_START_LOG.txt | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/adr015-gate-a-artifacts/ADR015_GATE_A_RESULTS.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/adr015-gate-a-artifacts/ADR015_GATE_A_RESULTS.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/batch-2-5-qa-artifacts/BATCH_25_CONSOLE.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/batch-2-5-qa-artifacts/BATCH_25_CONSOLE.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/batch-2-5-qa-artifacts/BATCH_25_RESULTS.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/batch-2-5-qa-artifacts/BATCH_25_RESULTS.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/batch-2-5-qa-artifacts/BATCH_25_SEVERE.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/batch-2-5-qa-artifacts/BATCH_25_SEVERE.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/batch-2-5-qa-artifacts/BATCH_2_5_QA_RESULTS.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/batch-2-5-qa-artifacts/BATCH_2_5_QA_RESULTS.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/central-status-artifacts/CENTRAL_STATUS_RESULTS.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/central-status-artifacts/CENTRAL_STATUS_RESULTS.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/currency-conversion-artifacts/CURRENCY_CONVERSION_E2E_RESULTS.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/currency-conversion-artifacts/CURRENCY_CONVERSION_E2E_RESULTS.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/flow-type-ssot-artifacts/FLOW_TYPE_SSOT_E2E_RESULTS.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/flow-type-ssot-artifacts/FLOW_TYPE_SSOT_E2E_RESULTS.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/gate-a-artifacts/GATE_A_CONSOLE_LOGS.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/gate-a-artifacts/GATE_A_CONSOLE_LOGS.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/gate-b-artifacts/GATE_B_E2E_RESULTS.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/gate-b-artifacts/GATE_B_E2E_RESULTS.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/option-d-responsive-artifacts/OPTION_D_RESPONSIVE_RESULTS.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/option-d-responsive-artifacts/OPTION_D_RESPONSIVE_RESULTS.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/phase1-completion-b-raw-failures.json | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/phase1-completion-b-raw-failures.json | ARCHIVED | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/phase1-completion-b-validation-results.json | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/phase1-completion-b-validation-results.json | ARCHIVED | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/D16_TradingAccounts_screenshot.png | documentation/reports/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/D16_TradingAccounts_screenshot.png | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/D18_BrokersFees_screenshot.png | documentation/reports/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/D18_BrokersFees_screenshot.png | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/D21_CashFlows_screenshot.png | documentation/reports/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/D21_CashFlows_screenshot.png | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/console_logs.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/console_logs.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/errors.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/errors.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/network_logs.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/network_logs.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/test_summary.json | documentation/reports/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/test_summary.json | ACTIVE | Team 70 | V3 |
| documentation/05-REPORTS/artifacts_SESSION_01/phase2-runtime-results.json | archive/documentation_legacy/snapshots/2026-02-17_0000/05-REPORTS/artifacts_SESSION_01/phase2-runtime-results.json | ARCHIVED | Team 70 | V3 |
| documentation/06-ENGINEERING/auth_handover/D15_LOGIN.html | documentation/docs-system/02-SERVER/auth_handover/D15_LOGIN.html | ACTIVE | Team 70 | V3 |
| documentation/06-ENGINEERING/auth_handover/D15_REGISTER.html | documentation/docs-system/02-SERVER/auth_handover/D15_REGISTER.html | ACTIVE | Team 70 | V3 |
| documentation/06-ENGINEERING/auth_handover/D15_RESET_PWD.html | documentation/docs-system/02-SERVER/auth_handover/D15_RESET_PWD.html | ACTIVE | Team 70 | V3 |
| documentation/07-CONTRACTS/TEAM_20_DATA_MODELS.py | documentation/docs-governance/06-CONTRACTS/TEAM_20_DATA_MODELS.py | ACTIVE | Team 70 | V3 |
| documentation/docs-governance/00-FOUNDATIONS/00_DOCUMENTATION_STANDARDS_INDEX.md | documentation/docs-governance/00-FOUNDATIONS/00_DOCUMENTATION_STANDARDS_INDEX.md | ACTIVE | Team 70 | Model B native |
| documentation/docs-governance/00-FOUNDATIONS/ADR_TEMPLATE_CANONICAL.md | documentation/docs-governance/00-FOUNDATIONS/ADR_TEMPLATE_CANONICAL.md | ACTIVE | Team 70 | Model B native |
| documentation/docs-governance/99-archive/history/MASTER_INDEX_COMMUNICATION_HISTORY.md | documentation/docs-governance/99-archive/history/MASTER_INDEX_COMMUNICATION_HISTORY.md | ACTIVE | Team 70 | Model B native |
| documentation/08-REPORTS/artifacts/VERIFICATION_CERTIFICATE.json | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts/VERIFICATION_CERTIFICATE.json | ARCHIVED | Team 70 | V3 |
| documentation/08-REPORTS/artifacts_SESSION_01/SESSION_01_START_LOG.txt | archive/documentation_legacy/snapshots/2026-02-17_0000/08-REPORTS/artifacts_SESSION_01/SESSION_01_START_LOG.txt | ARCHIVED | Team 70 | V3 |
| documentation/90_ARCHITECTS_DOCUMENTATION/Blueprints/phoenix_js_core_implementation.js | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/Blueprints/phoenix_js_core_implementation.js | ACTIVE | Team 70 | V3 |
| documentation/OPENAPI_SPEC_V2.yaml | archive/documentation_legacy/snapshots/2026-02-17_0000/OPENAPI_SPEC_V2.yaml | ARCHIVED | Team 70 | |

---

**log_entry | TEAM_70 | DOC_MIGRATION_COMPLETENESS_MATRIX_V3_SUBMITTED | 545_FILES | 2026-02-17**
