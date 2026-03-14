
# KNOWN_BUGS_REGISTER_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** KNOWN_BUGS_REGISTER  
**version:** 1.0.0  
**owner:** Team 170 (canonical maintenance); Team 190 is validation intake authority  
**date:** 2026-03-03  
**historical_record:** true  
**last_updated:** 2026-03-13 (KB-2026-03-13-25 CLOSED; KB-017 CLOSED; KB-018 CLOSED; KB-015 CLOSED; KB-016 CLOSED; KB-08 count→153)  
**status:** ACTIVE  
**purpose:** Single canonical register for validated known bugs that are accepted into a batched remediation cycle or marked as immediate blockers.

---

## Boundary

This document is the **single canonical registry** for known bugs that were validated as real defects and require controlled remediation tracking.

This register does **not** replace:
- WSM for live operational state
- Program Registry / WP Registry for scope ownership
- Gate validation artifacts for gate decisions

This register exists to:
1. prevent known defects from being lost across active development cycles,
2. batch non-urgent fixes into controlled remediation rounds every few days,
3. keep one stable source for bug status, ownership, and evidence references.

---

## Operating Rule

### Intake rule

A bug may enter this register only if:
1. it was validated as a real defect by Team 190 or by a responsible validation authority, and
2. it has a concrete code reference and an owning implementation squad.

### Closure rule

A bug may be marked `CLOSED` only when:
1. the owning squad completed the fix,
2. Team 10 integrated the fix into the active work package or remediation cycle, and
3. the relevant validation path confirmed closure (Team 90 / Team 190 / architectural authority as applicable).

### Remediation cadence

Default handling:
1. `BLOCKING` bugs enter the **active immediate remediation cycle**.
2. `NON_BLOCKING` bugs remain in this register and are grouped into a **batched remediation round every few days**.

This cadence is an operational batching rule, not a gate override.

---

## Schema

| Field | Description |
|---|---|
| bug_id | Canonical bug record identifier |
| date_added | Date bug was accepted into register |
| domain | TIKTRACK \| AGENTS_OS \| SHARED |
| scope_id | Program / WP / subsystem reference |
| severity | BLOCKING \| HIGH \| MEDIUM \| LOW |
| status | OPEN \| IN_REMEDIATION \| READY_FOR_RECHECK \| MITIGATED_NO_FIX_EXISTS \| CLOSED |
| owner_team | Implementation owner |
| orchestrator | Team 10 or owning orchestrator |
| summary | Short defect statement |
| evidence_path | Primary code or artifact evidence |
| remediation_mode | IMMEDIATE \| BATCHED |
| target_cycle | Current remediation round or note |

---

## Known Bugs

| bug_id | date_added | domain | scope_id | severity | status | owner_team | orchestrator | summary | evidence_path | remediation_mode | target_cycle |
|---|---|---|---|---|---|---|---|---|---|---|---|
| KB-2026-03-03-01 | 2026-03-03 | TIKTRACK | S002-P003-WP002 | BLOCKING | CLOSED | Team 20 | Team 10 | `sync_intraday` may insert duplicate rows for the same ticker because fallback executes inside provider loop | `api/background/jobs/sync_intraday.py:114` | IMMEDIATE | Closed in current rollback cycle (Team 190 validated 2026-03-03) |
| KB-2026-03-03-02 | 2026-03-03 | TIKTRACK | S002-P003-WP002 | BLOCKING | CLOSED | Team 30 | Team 10 | Alerts edit form allows changing `target_type` / `alert_type` although API update contract does not persist them | `ui/src/views/data/alerts/alertsForm.js:77` | IMMEDIATE | Closed in current rollback cycle (Team 190 validated 2026-03-03) |
| KB-2026-03-03-03 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | HIGH | IN_REMEDIATION | Team 170 | Team 10 | KB-001: DDL partial UNIQUE syntax invalid for PostgreSQL table creation | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-001` | IMMEDIATE | S002-P003-WP002 Cloud-Agent Immediate Lane (CA-IMM-01) |
| KB-2026-03-03-04 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | HIGH | IN_REMEDIATION | Team 170 | Team 10 | KB-002: Missing `user_refresh_tokens` and `revoked_tokens` in DDL vs ORM contract | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-002` | IMMEDIATE | S002-P003-WP002 Cloud-Agent Immediate Lane (CA-IMM-01) |
| KB-2026-03-03-05 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | MEDIUM | IN_REMEDIATION | Team 170 | Team 10 | KB-003: DDL table name drift (`brokers_fees` vs `trading_account_fees`) | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-003` | IMMEDIATE | S002-P003-WP002 Cloud-Agent Immediate Lane (CA-IMM-01) |
| KB-2026-03-03-06 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | MEDIUM | CLOSED | Team 20 | Team 10 | KB-004: Suite A exchange-rates contract issue resolved; DDL authority remains `conversion_rate` in production schema | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-004` | BATCHED | Closed in Batch-1 remediation (Team 20 fix confirmed) |
| KB-2026-03-03-07 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | MEDIUM | CLOSED | Team 20 | Team 10 | KB-005: Suite A precision drift on `ticker_prices.market_cap` resolved (NUMERIC(24,4) ratified) | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-005` | BATCHED | Closed in Batch-1 remediation (Team 20 fix confirmed) |
| KB-2026-03-03-08 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | MEDIUM | OPEN | Team 20 | Team 10 | KB-006: mypy scan reports 153 type errors across backend modules (42 files) | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-006` | BATCHED | Cloud-Agent Batched Remediation Round (CA-BAT-01) |
| KB-2026-03-03-09 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | HIGH | CLOSED | Team 20 | Team 10 | KB-007: Missing await finding resolved; coroutine path confirmed valid | `api/integrations/market_data/cache_first_service.py:57` | IMMEDIATE | Closed in Batch-1 remediation (Team 20 validation confirmed) |
| KB-2026-03-03-10 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | LOW | CLOSED | Team 30 | Team 10 | KB-008: JSX lint finding resolved; ESLint run clean | `ui/src/components/HomePage.jsx:456` | BATCHED | Closed in Batch-1 remediation (Team 30 validation confirmed) |
| KB-2026-03-03-11 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | MEDIUM | CLOSED | Team 30 | Team 10 | KB-009: Parse error finding resolved; async usage confirmed valid | `ui/scripts/visual-diff.js:260` | BATCHED | Closed in Batch-1 remediation (Team 30 validation confirmed) |
| KB-2026-03-03-12 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | HIGH | MITIGATED_NO_FIX_EXISTS | Team 20 | Team 10 | KB-010: `ecdsa` CVE-2024-23342 mitigated; full fix requires future PyJWT migration task | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-010` | IMMEDIATE | Mitigated in current cycle; structural fix deferred to S003 security hardening |
| KB-2026-03-03-13 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | MEDIUM | CLOSED | Team 20 | Team 10 | KB-011: `pip` CVEs closed after pip 26.0.1 confirmation | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-011` | BATCHED | Closed in Batch-1 remediation (Team 20 validation confirmed) |
| KB-2026-03-03-14 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | HIGH | CLOSED | Team 30 | Team 10 | KB-012: `minimatch` vulnerability set remediated; 0 HIGH+ confirmed | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-012` | IMMEDIATE | Closed in Batch-1 remediation (Team 30 security rerun) |
| KB-2026-03-03-15 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | HIGH | CLOSED | Team 30 | Team 10 | KB-013: `rollup` path-traversal vulnerability remediated; 0 HIGH+ confirmed | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-013` | IMMEDIATE | Closed in Batch-1 remediation (Team 30 security rerun) |
| KB-2026-03-03-16 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | HIGH | CLOSED | Team 30 | Team 10 | KB-014: ESLint baseline confirmed on mainline (`ui/.eslintrc.cjs`) | `ui/.eslintrc.cjs` | BATCHED | Closed in Batch-1 remediation (Team 30 confirmation) |
| KB-2026-03-03-17 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | CRITICAL | CLOSED | Team 191 | Team 10 | KB-015: No CI/CD PR quality gate pipeline | `_COMMUNICATION/team_190/CLOUD_AGENT_VALIDATION_REPORT_2026-03-03.md#KB-015` | IMMEDIATE | Closed 2026-03-13: repository ruleset active on main; required checks enforced; PR #73 merged |
| KB-2026-03-03-18 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | HIGH | CLOSED | Team 60 | Team 10 | KB-016: Pre-commit enforcement model missing (Husky/pre-commit) | `_COMMUNICATION/team_190/CLOUD_AGENT_VALIDATION_REPORT_2026-03-03.md#KB-016` | IMMEDIATE | Closed 2026-03-13: `.pre-commit-config.yaml` with 4 blocking hooks (unit tests, bandit, detect-secrets, frontend build); `make install-pre-commit` |
| KB-2026-03-03-19 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | MEDIUM | CLOSED | Team 60 | Team 10 | KB-017: Code formatter policy not enforced (Black/Prettier) | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-017` | BATCHED | Closed 2026-03-13: Black+Prettier enforced; Team 190 validation PASS |
| KB-2026-03-03-20 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | LOW | CLOSED | Team 20 | Team 10 | KB-018: `structlog` listed but unused in backend runtime | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-018` | BATCHED | Closed 2026-03-13: structlog removed from api/requirements.txt (Team 20 completion PASS) |
| KB-2026-03-03-21 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | MEDIUM | OPEN | Team 20 | Team 10 | KB-019: `system_settings` accessed via raw SQL without ORM model | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-019` | BATCHED | Cloud-Agent Batched Remediation Round (CA-BAT-01) |
| KB-2026-03-03-22 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | HIGH | OPEN | Team 20 | Team 10 | KB-020: Backend unit-test coverage gap (14/18 services untested) | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-020` | IMMEDIATE | S002-P003-WP002 Cloud-Agent Immediate Lane (CA-IMM-01) |
| KB-2026-03-03-23 | 2026-03-03 | SHARED | CLOUD_AGENT_SCAN | MEDIUM | OPEN | Team 20 | Team 10 | KB-021: Pydantic V2 deprecation lineage (`class Config` -> `ConfigDict`) must remain tracked | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md#KB-021` | BATCHED | Cloud-Agent Batched Remediation Round (CA-BAT-01) |
| KB-2026-03-12-24 | 2026-03-12 | TIKTRACK | S002-P002-WP003 | BLOCKING | CLOSED | Team 30 | Team 10 | D40 Background Jobs history toggle throws runtime `ReferenceError` (`items is not defined`) due to scope leak outside `try`/`catch` | `ui/src/views/management/systemManagement/systemManagementBackgroundJobsInit.js:149` | IMMEDIATE | Closed 2026-03-13 after Team 190 final validation (Team 190 replacing Team 90 for this cycle) |
| KB-2026-03-13-25 | 2026-03-13 | AGENTS_OS | S001-P002-WP001 | BLOCKING | CLOSED | Team 170 | Team 10 | Hebrew UI mandate for `PIPELINE_DASHBOARD.html` was implemented with out-of-scope edits outside Help Modal (global theme, header actions, gate/progress logic) | `PIPELINE_DASHBOARD.html:10` | IMMEDIATE | Closed 2026-03-13 after Team 170 remediation + Team 190 revalidation PASS |

---

## Evidence References

### KB-2026-03-03-01

- `api/background/jobs/sync_intraday.py:114`
- `api/background/jobs/sync_intraday.py:137`
- `scripts/sync_ticker_prices_intraday.py:110`
- `scripts/sync_ticker_prices_intraday.py:135`
- Team 190 blocking remediation routing:
  - `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_S002_P003_WP002_BLOCKING_BUG_REMEDIATION_PROMPT_v1.0.0.md`
- Closure validation:
  - `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_S002_P003_WP002_BLOCKING_BUGS_CLOSURE_VALIDATION_RESULT_v1.0.0.md`

### KB-2026-03-03-02

- `ui/src/views/data/alerts/alertsForm.js:77`
- `ui/src/views/data/alerts/alertsForm.js:153`
- `api/schemas/alerts.py:38`
- Team 190 blocking remediation routing:
  - `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_S002_P003_WP002_BLOCKING_BUG_REMEDIATION_PROMPT_v1.0.0.md`
- Closure validation:
  - `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_S002_P003_WP002_BLOCKING_BUGS_CLOSURE_VALIDATION_RESULT_v1.0.0.md`

### Cloud Agent intake set (KB-2026-03-03-03 .. KB-2026-03-03-23)

- Intake authority request:
  - `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_CLOUD_AGENT_KNOWN_BUGS_CANONICAL_INTAKE_REQUEST_v1.0.0.md`
- Intake scope and mapping source:
  - `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md`
  - `_COMMUNICATION/team_190/CLOUD_AGENT_VALIDATION_REPORT_2026-03-03.md`
  - `_COMMUNICATION/team_170/TEAM_170_TO_TEAM_10_CLOUD_AGENT_KB_CANONICAL_INTAKE_ACTIVATION_v1.0.0.md`
  - `_COMMUNICATION/team_170/TEAM_170_TO_TEAM_10_CLOUD_AGENT_KB_CANONICAL_INTAKE_ACTIVATION_v1.0.1.md`
  - `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_170_KB_ROUTING_CORRECTION_v1.0.0.md`
- Pydantic warning lineage coverage:
  - Canonical mapping: `KB-021` -> `KB-2026-03-03-23`
  - Scope source: `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_CLOUD_AGENT_KNOWN_BUGS_CANONICAL_INTAKE_REQUEST_v1.0.0.md` section 4

### KB-2026-03-12-24

- Scanner evidence summary:
  - commit window since `2026-03-11T08:56:34Z`
  - introduced in commit `4f13dce03`
- Code evidence:
  - declaration in `try`: `ui/src/views/management/systemManagement/systemManagementBackgroundJobsInit.js:149`
  - out-of-scope use after `catch`: `ui/src/views/management/systemManagement/systemManagementBackgroundJobsInit.js:169`
- Current validation state:
  - runtime bug confirmed at code level by Team 190
  - Team 30 fix delivered (`let items = []` hoist + scoped assignment inside `try`)
  - Team 50 targeted QA PASS delivered
- Team 190 final validation PASS (Team 190 replacing Team 90 for this cycle)
- bug status closed on `2026-03-13`

### KB-2026-03-13-25

- Intake source:
  - `_COMMUNICATION/team_170/TEAM_170_PIPELINE_DASHBOARD_HEBREW_UI_v1.0.0.md`
  - `_COMMUNICATION/team_170/TEAM_170_PIPELINE_DASHBOARD_HEBREW_UI_MANDATE_v1.0.0.md`
- Mandate constraints (violated):
  - `_COMMUNICATION/team_170/TEAM_170_PIPELINE_DASHBOARD_HEBREW_UI_MANDATE_v1.0.0.md:194`
  - `_COMMUNICATION/team_170/TEAM_170_PIPELINE_DASHBOARD_HEBREW_UI_MANDATE_v1.0.0.md:195`
  - `_COMMUNICATION/team_170/TEAM_170_PIPELINE_DASHBOARD_HEBREW_UI_MANDATE_v1.0.0.md:197`
- Out-of-scope implementation evidence:
  - `PIPELINE_DASHBOARD.html:10` (global theme token replacement)
  - `PIPELINE_DASHBOARD.html:467` (new header roadmap button outside help modal)
  - `PIPELINE_DASHBOARD.html:898` (new progress-check copy map helpers)
  - `PIPELINE_DASHBOARD.html:1032` (new quick action/fail builder logic)
  - `PIPELINE_DASHBOARD.html:1454` (progress diagnostics flow changes)
- Validation state:
  - Team 190 constitutional result (initial) = `BLOCK_FOR_FIX`
  - Team 170 remediation submitted:
    - `_COMMUNICATION/team_170/TEAM_170_PIPELINE_DASHBOARD_HEBREW_UI_REMEDIATION_v1.0.0.md`
  - Team 190 revalidation result (final) = `PASS`
    - `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_TEAM_100_PIPELINE_DASHBOARD_HEBREW_UI_REVALIDATION_RESULT_v1.0.1.md`
  - Closure condition met: out-of-scope edits reverted; mandate-limited EN/HE Help Modal implementation preserved.

### KB-2026-03-03-17 (KB-015) — Closure evidence

- **status:** CLOSED (2026-03-13)
- **action_taken:** KB-015 merge-gate enforcement completed via GitHub Repository Ruleset (required_status_checks + strict policy); PR #73 merged to main
- **checks_verified:** Required checks for protected main active and satisfied for merge
- **evidence:** https://github.com/WaldNimrod/TikTrack/pull/73
- **merge_commit_sha:** 909fa058179fdaa1f439efd7532bcf795653d968
- **mandate:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_191_KB_015_BRANCH_PROTECTION_MANDATE_v1.0.0.md`
- **execution_report:** `_COMMUNICATION/team_191/TEAM_191_TO_TEAM_10_TEAM_190_KB_015_OPTION_B_EXECUTION_REPORT_v1.0.2.md`
- **ruleset_evidence:** `_COMMUNICATION/team_191/evidence/kb_015/ruleset.main.full.json`, `_COMMUNICATION/team_191/evidence/kb_015/rules.apply.main.json`
- **compatibility_note:** Branch protection endpoint returned 404 in this repo mode; enforcement verified through active repository ruleset API.

### KB-2026-03-03-18 (KB-016) — Closure evidence

- `.pre-commit-config.yaml` — 4 hooks חוסמים: phoenix-unit-tests, phoenix-bandit-security, phoenix-detect-secrets, phoenix-frontend-build
- `Makefile`: `install-pre-commit`, `run-pre-commit-all`
- `docs/CONTRIBUTING.md`: הוראות `pre-commit install`
- ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE §6: ADOPT

### KB-2026-03-03-19 (KB-017) — Closure evidence

- **status:** CLOSED (2026-03-13)
- **action_taken:** Black + Prettier added; pre-commit hooks phoenix-black, phoenix-prettier; format run applied
- **validation:** Team 190 PASS — `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_KB_017_VALIDATION_RESULT_v1.0.0.md`
- **checks:** black api/ --check PASS; prettier --check PASS; pytest 35 passed; vite build PASS

### KB-2026-03-03-20 (KB-018) — Closure evidence

- **status:** CLOSED (2026-03-13)
- **action_taken:** structlog removed from api/requirements.txt
- **deliverable:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_KB_018_STRUCTLOG_REMOVAL_COMPLETION_v1.0.0.md`
- **checks:** pip install PASS; pytest 35 passed; API import PASS

---

## Maintenance Note

Canonical process entry point (active):

`documentation/docs-governance/04-PROCEDURES/KNOWN_BUGS_REMEDIATION_GOVERNANCE_PROCEDURE_v1.0.0.md`

Operational maintenance model:
1. Team 190 validates and routes defects into canonical intake.
2. Team 170 maintains register consistency and governance integrity.
3. Team 10 orchestrates immediate and batched remediation rounds using canonical `bug_id`.
4. Team 90/Team 190 consume canonical `bug_id` in follow-up validation.

---

**log_entry | TEAM_190 | KNOWN_BUGS_REGISTER | v1.0.0_CREATED | 2026-03-03**
**log_entry | TEAM_170 | KNOWN_BUGS_REGISTER | CENTRAL_GOVERNANCE_PROCEDURE_LINKED_AND_MAINTENANCE_MODEL_ACTIVATED | 2026-03-03**
**log_entry | TEAM_190 | KNOWN_BUGS_REGISTER | KB_2026_03_03_01_AND_02_CLOSED_AFTER_REVALIDATION | 2026-03-03**
**log_entry | TEAM_170 | KNOWN_BUGS_REGISTER | CLOUD_AGENT_KB_001_TO_021_CANONICAL_INTAKE_COMPLETED_EXCLUDING_CLOSED_01_02 | 2026-03-03**
**log_entry | TEAM_170 | KNOWN_BUGS_REGISTER | KB_ROUTING_AND_STATUS_CORRECTION_APPLIED_PER_TEAM_00_DIRECTIVE | 2026-03-03**
**log_entry | TEAM_190 | KNOWN_BUGS_REGISTER | KB_2026_03_12_24_INTAKE_AND_URGENT_CYCLE_ACTIVATED | 2026-03-12**
**log_entry | TEAM_190 | KNOWN_BUGS_REGISTER | KB_2026_03_12_24_CLOSED_AFTER_FINAL_VALIDATION | TEAM_190_REPLACES_TEAM_90_FOR_THIS_CYCLE | 2026-03-13**
**log_entry | TEAM_10 | KNOWN_BUGS_REGISTER | KB_016_CLOSED_PRECOMMIT_EXISTS_KBCount_153_MoV_KB015_ADDED | 2026-03-13**
**log_entry | TEAM_10 | KNOWN_BUGS_REGISTER | KB_015_CLOSED_TEAM_191_BRANCH_PROTECTION_PR73_MERGED | 2026-03-13**
**log_entry | TEAM_190 | KNOWN_BUGS_REGISTER | KB_015_DOC_DEDRIFT_BRANCH_PROTECTION_TO_RULESET_ENFORCEMENT | 2026-03-13**
**log_entry | TEAM_10 | KNOWN_BUGS_REGISTER | KB_018_CLOSED_TEAM_20_STRUCTLOG_REMOVAL_PASS | 2026-03-13**
**log_entry | TEAM_10 | KNOWN_BUGS_REGISTER | KB_017_CLOSED_TEAM_60_FORMATTER_TEAM_190_VALIDATION_PASS | 2026-03-13**
**log_entry | TEAM_190 | KNOWN_BUGS_REGISTER | KB_2026_03_13_25_INTAKE_PIPELINE_DASHBOARD_HEBREW_UI_SCOPE_DRIFT | BLOCK_FOR_FIX | 2026-03-13**
**log_entry | TEAM_190 | KNOWN_BUGS_REGISTER | KB_2026_03_13_25_CLOSED_AFTER_TEAM170_REMEDIATION_AND_REVALIDATION_PASS | 2026-03-13**
