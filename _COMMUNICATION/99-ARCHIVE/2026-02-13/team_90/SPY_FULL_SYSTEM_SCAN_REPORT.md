# 🕵️ SPY Full System Scan (All Pages & Files)

**Team:** 90 (The Spy)  
**Date:** 2026-02-05  
**Scope:** Full repo scan of pages + documentation + core code paths  
**Mandate Context:** Phase 2.0 readiness + Governance integrity  

---

## 📌 Executive Summary
System scan completed across documentation, UI pages, and core code. **Key risk is documentation governance drift**, not code security. The Trading Accounts hardened-transformer fix is **verified PASS**, but **SSOT violations and duplicate/active indexes remain in documentation**, plus **routes.json version drift** in multiple SSOT docs. Also found **inline JS in `ui/test-auth-guard.html`**, violating the hybrid scripts policy if shipped.

**Status:** **Conditional Pass** for code; **Documentation Integrity: FAIL** until cleanup tasks complete.

---

## ✅ Verified Compliant (Green)
- **Trading Accounts hardened transformers:** `tradingAccountsDataLoader.js` imports centralized `apiToReact` and uses it for all API responses; token preview logging removed.  
  Evidence: `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js:17,72,117,147,188`
- **No inline scripts in HTML views:** No `<script>` without `src` found in `ui/src/views/*.html`.
- **No local `apiToReact` definitions in UI:** Only centralized transformers remain.
- **No D16 tags in `ui/src`:** Scan clean.
- **routes.json version is 1.1.2** (confirmed in `ui/public/routes.json`).

---

## 🔴 Critical/High Findings

### H1) **Deprecated/SSOT Indexes still active in Documentation**
**Issue:** `documentation/90_ARCHITECTS_DOCUMENTATION/` still contains active indexes and trackers that conflict with Phase 1.7 “single index” mandate. These are *not* marked deprecated and were not archived.

**Evidence:**
- `documentation/90_ARCHITECTS_DOCUMENTATION/PHOENIX_ARCHITECT_MASTER_INDEX.md:1-8` (active index, not deprecated)
- `documentation/90_ARCHITECTS_DOCUMENTATION/OFFICIAL_PAGE_TRACKER.md:1-9` (duplicate page tracker)

**Impact:** Conflicting SSOT, architectural drift risk, and inconsistent decision sources.

---

### H2) **SSOT Docs still contain markdown links to _COMMUNICATION**
**Issue:** Direct markdown links to `_COMMUNICATION` are present in SSOT docs, violating the “SSOT must live in documentation only” rule.

**Evidence:**
- `documentation/04-DESIGN_UX_UI/TT2_RESPONSIVE_FLUID_DESIGN.md:238-241`  
  (three markdown links to `_COMMUNICATION/...`)

**Impact:** Breaks SSOT integrity and allows side-channel updates through comms files.

---

### H3) **routes.json version drift in SSOT docs (v1.1.1 vs v1.1.2)**
**Issue:** Multiple SSOT documents still reference **v1.1.1**, while actual `routes.json` is **v1.1.2**.

**Evidence:**
- `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md:31,36`
- `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md:24`
- `documentation/01-ARCHITECTURE/TT2_UI_INTEGRATION_PATTERN.md:18,25`

**Impact:** Inconsistent architectural reference baseline; incorrect version references in SSOT.

---

### H4) **Metadata compliance gaps across SSOT directories**
**Issue:** 110 documentation files (outside archives/reports) lack required metadata fields (`id`, `owner`, `status`, `supersedes`).

**Impact:** Governance breakdown; SSOT docs become indistinguishable from drafts.

---

## 🟠 Medium Findings

### M1) **Port policy drift in governance doc**
**Issue:** Team 60 definition doc lists `8080 Backend, 3000 Frontend` (outdated).

**Evidence:**
- `documentation/10-POLICIES/TT2_TEAM_60_DEFINITION.md:61`

**Impact:** Training confusion; contradicts current port unification standard (8080 frontend, 8082 backend).

---

### M2) **Inline script in test HTML (policy violation if shipped)**
**Issue:** `ui/test-auth-guard.html` includes inline JS and inline `onclick`. Hybrid policy forbids inline scripts.

**Evidence:**
- `ui/test-auth-guard.html:87+` (inline `<script>` with token/localStorage handling)

**Impact:** Governance breach if included in production builds. Even if test-only, it should be isolated or moved.

---

## ✅ Recommendations (Actionable)

### Team 10 (Documentation Governance)
1. **Archive or mark deprecated:**
   - Move `documentation/90_ARCHITECTS_DOCUMENTATION/PHOENIX_ARCHITECT_MASTER_INDEX.md` and `OFFICIAL_PAGE_TRACKER.md` to `documentation/99-ARCHIVE/deprecated_indexes_phase_1.7/`, or mark clearly as DEPRECATED with metadata.
2. **Remove SSOT → _COMMUNICATION links:**
   - Replace markdown links in `TT2_RESPONSIVE_FLUID_DESIGN.md` with textual notes or copy key decisions into documentation.
3. **Update SSOT versions:**
   - Replace all references to `routes.json v1.1.1` with `v1.1.2` in SSOT docs listed above.
4. **Metadata remediation:**
   - Apply metadata blocks to all 110 files in Appendix A (or explicitly mark non‑SSOT and move to reports/archives).

### Team 30 (Frontend Execution)
1. **Inline script policy enforcement:**
   - Move `ui/test-auth-guard.html` inline JS to an external file or relocate the file to a test-only folder excluded from production builds.

### Team 50 (QA/Compliance)
1. **Update QA standards references:**
   - Re-validate that any QA docs referencing `_COMMUNICATION` are clearly marked as non‑SSOT or moved to reports.

---

## 📎 Appendix A — Files Missing Metadata (id/owner/status/supersedes)
Total: **110** files (reports/archive excluded).

```
documentation/00-MANAGEMENT/00_ARCHITECT_HANDOVER_v252.md
documentation/00-MANAGEMENT/00_AUDIT_MANUAL.md
documentation/00-MANAGEMENT/00_FORTRESS_SOP_v252.md
documentation/00-MANAGEMENT/00_GOVERNANCE_SOP_v252.md
documentation/00-MANAGEMENT/00_PHOENIX_WILL.md
documentation/00-MANAGEMENT/01_System_Blueprint.md
documentation/00-MANAGEMENT/02_API_Connectivity.md
documentation/00-MANAGEMENT/03_Product_Capabilities.md
documentation/00-MANAGEMENT/04_Operations_Strategy.md
documentation/00-MANAGEMENT/05_Setup_Infrastructure.md
documentation/01-ARCHITECTURE/FRONTEND/COMPONENTS/TT2_HEADER_SPEC_LOD400.md
documentation/01-ARCHITECTURE/LOGIC/PENDING_LOGIC_ALERTS.md
documentation/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md
documentation/01-ARCHITECTURE/LOGIC/TT2_TRADING_CALENDAR_LOGIC.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_07_C_ADMIN_DUPLICATE_EMAIL_PHONE_POLICY.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_ENCRYPTED_CREDENTIALS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_TRADING_ACCOUNTS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_TRADING_ACCOUNTS_BALANCES.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_USERS_PROFILES.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_ENCRYPTED_CREDENTIALS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_EXCHANGE_RATES.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_MARKET_CALENDARS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_TRADING_ACCOUNTS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_USERS_PROFILES.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_CASH_FLOWS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS_BALANCES.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_08_FIELD_MAP_CASH_FLOWS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_08_FIELD_MAP_TRADING_ACCOUNTS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_08_FIELD_MAP_TRADING_ACCOUNTS_BALANCES.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_EXECUTIONS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_PLAYBOOKS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_TICKERS_MAPPINGS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_TRADES.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_EXECUTIONS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_PLAYBOOKS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TRADES.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_BACKGROUND_TASKS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_DESIGN_STUDIO_TOKENS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_PULSE_LOGS.md
documentation/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_SYSTEM_SETTINGS.md
documentation/01-ARCHITECTURE/PHOENIX_AUTH_INTEGRATION.md
documentation/01-ARCHITECTURE/PHOENIX_NAVIGATION_STRATEGY.md
documentation/01-ARCHITECTURE/PHOENIX_REACT_HTML_BOUNDARIES.md
documentation/01-ARCHITECTURE/PHX_DB_SCHEMA_SIGN_OFF.md
documentation/01-ARCHITECTURE/TT2_BATCH_PROGRESS_TRACKER.md
documentation/01-ARCHITECTURE/TT2_FULL_40_PAGE_LIST.md
documentation/01-ARCHITECTURE/TT2_HEADER_BLUEPRINT.md
documentation/01-ARCHITECTURE/TT2_MASTER_PALETTE_SPEC.md
documentation/01-ARCHITECTURE/TT2_MONOREPO_STRUCTURE.md
documentation/02-DEVELOPMENT/TT2_JS_DEVELOPER_GUIDE.md
documentation/02-DEVELOPMENT/WP_10_01_D05_TICKERS_MOCKUP.md
documentation/02-DEVELOPMENT/WP_10_02_BATCH_A_UI_SPEC.md
documentation/02-DEVELOPMENT/WP_10_02_D05_LIVING_MOCKUP.md
documentation/02-DEVELOPMENT/WP_10_02_D15_LOGIN_POC_SPEC.md
documentation/02-DEVELOPMENT/WP_20_01_BACKEND_FOUNDATION.md
documentation/02-DEVELOPMENT/WP_20_01_D05_LOGIC_SCHEMA.md
documentation/02-DEVELOPMENT/WP_20_02_IDENTITY_AND_ACCESS.md
documentation/02-DEVELOPMENT/WP_20_03_BATCH_A_LOGIC_SPEC.md
documentation/02-DEVELOPMENT/WP_20_04_BATCH_A_REDESIGN_DIRECTIVE.md
documentation/03-PRODUCT_&_BUSINESS/LEGACY_TO_PHOENIX_MAPPING_V2.5.md
documentation/04-DESIGN_UX_UI/GIN_004_UI_ALIGNMENT_SPEC.md
documentation/05-PROCEDURES/TEAM_50_BROWSER_TEST_SCENARIOS.md
documentation/05-PROCEDURES/TT2_ACTION_AUDIT_PROTOCOL.md
documentation/05-PROCEDURES/TT2_CUBE_DEFINITION_TEMPLATE.md
documentation/05-PROCEDURES/TT2_OUTPUT_INTEGRATION_PROTOCOL.md
documentation/05-PROCEDURES/TT2_RTL_DEVELOPMENT_CHARTER.md
documentation/05-PROCEDURES/TT2_SESSION_TRANSITION_PROTOCOL.md
documentation/05-PROCEDURES/TT2_TEAM_10_WORK_PLAN.md
documentation/05-PROCEDURES/TT2_TEAM_20_ONBOARDING.md
documentation/05-PROCEDURES/TT2_TEAM_MANAGEMENT_TEMPLATES.md
documentation/05-PROCEDURES/TT2_UI_DIGGING_PROCEDURE.md
documentation/06-ENGINEERING/auth_handover/AUTH_DEVELOPER_HANDOVER.md
documentation/09-GOVERNANCE/GIN_003_COMPLIANCE_REPORT.md
documentation/09-GOVERNANCE/PHOENIX_REORG_AUDIT_LOG_v3.3.md
documentation/09-GOVERNANCE/PHOENIX_REORG_AUDIT_LOG_v3.4.md
documentation/09-GOVERNANCE/PHOENIX_SANITY_REPORT_V1_TEAM_B.md
documentation/09-GOVERNANCE/gins/GIN_2026_008_TECHNICAL_CLARIFICATIONS.md
documentation/10-POLICIES/TT2_ARCHITECT_ROLE_DEFINITION.md
documentation/10-POLICIES/TT2_GREENFIELD_MANIFESTO.md
documentation/10-POLICIES/TT2_IMMUTABLE_LEDGER_POLICY.md
documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md
documentation/10-POLICIES/TT2_JUNIOR_ARCHITECT_CONTRACT.md
documentation/10-POLICIES/TT2_MAINTENANCE_LIFECYCLE.md
documentation/10-POLICIES/TT2_MASTER_WORKSPACE_MAP.md
documentation/10-POLICIES/TT2_TEAM_60_DEFINITION.md
documentation/10-POLICIES/TT2_TEAM_OPERATIONS_CHARTER.md
documentation/10-POLICIES/TT2_WORKSPACE_MIGRATION_MANIFEST.md
documentation/90_ARCHITECTS_DOCUMENTATION/CSS_EXCELLENCE_PROTOCOL.md
documentation/90_ARCHITECTS_DOCUMENTATION/OFFICIAL_PAGE_TRACKER.md
documentation/90_ARCHITECTS_DOCUMENTATION/PHOENIX_ARCHITECT_MASTER_INDEX.md
documentation/90_ARCHITECTS_DOCUMENTATION/PHOENIX_ORGANIZATIONAL_STRUCTURE.md
documentation/90_ARCHITECTS_DOCUMENTATION/TT2_RTL_DEVELOPMENT_CHARTER.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/00_FINAL_ARCHITECT_REPORT_BATCH_1.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/01_TECHNICAL/API_DOCUMENTATION_ENHANCED.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/01_TECHNICAL/ARCHITECTURE_OVERVIEW.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/01_TECHNICAL/CSS_DNA_SURGICAL_AUDIT.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/01_TECHNICAL_SNAPSHOT_INDEX.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/02_CSS_DNA_VALIDATION_REPORT.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/02_PRODUCT/LOD_400_FIDELITY_STANDARDS.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/02_PRODUCT/USER_EXPERIENCE_DOCUMENTATION.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/03_MARKETING/BRANDING_BOOK_V2.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/03_MARKETING/PRODUCT_POSITIONING.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/03_PRODUCT_AND_MARKETING_STRATEGY.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/ARCHITECT_BATCH_1_GRAND_FINALE.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/ARCHITECT_CSS_SURGICAL_AUDIT.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/EXTERNAL_AUDIT_EXECUTIVE_SUMMARY.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/LOD_400_FIDELITY_STANDARDS_FINAL.md
documentation/90_ARCHITECTS_DOCUMENTATION/סיכום בץ 1/PHOENIX_EXTERNAL_AUDIT_EXECUTIVE_SUMMARY.md
```

---

**log_entry | [Team 90] | FULL_SYSTEM_SCAN | SUMMARY_COMPLETE | YELLOW | 2026-02-05**
