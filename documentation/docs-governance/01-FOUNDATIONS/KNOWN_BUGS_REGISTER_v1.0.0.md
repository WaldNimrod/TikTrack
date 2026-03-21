
# KNOWN_BUGS_REGISTER_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** KNOWN_BUGS_REGISTER  
**version:** 1.0.0  
**owner:** Team 170 (canonical maintenance); Team 190 is validation intake authority  
**date:** 2026-03-03  
**last_updated:** 2026-03-21 (KB-2026-03-21-70 INTAKE — GATE_8 nomenclature drift in Team 100 S003 closure docs; prev: KB-57..69)  
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
| KB-2026-03-19-26 | 2026-03-19 | AGENTS_OS | S003-P011-WP001 | MEDIUM | CLOSED | Team 61 | Team 11 | Pipeline correction-cycle prompt not generated at GATE_N when `remediation_cycle_count > 0`; shows full creation template instead of targeted fix prompt; `pass` command accepts input without capturing active BLOCK_FOR_FIX findings in state | `agents_os_v2/orchestrator/pipeline.py` (gate prompt generators + fail/pass command handlers) | BATCHED | CLOSED 2026-03-20 — S003-P011-WP002; `pipeline.py` overhaul; **CERT_10** witness; evidence `test_certification.py` 19/19 PASS; closure_authority Team 170 |
| KB-2026-03-19-27 | 2026-03-19 | AGENTS_OS | S003-P011-WP001 | MEDIUM | CLOSED | Team 61 | Team 11 | GATE_2 pipeline skips Phase 2.2 (Work Plan by Team 11) and Phase 2.2v (Team 90 review) — routes directly to Phase 2.3 (Team 100 architectural sign-off) using old pre-GATE_SEQUENCE_CANON flow. `WAITING_GATE2_APPROVAL` still present in routing (should be removed per WP001 scope). | `agents_os_v2/orchestrator/pipeline.py` (GATE_META + GATE_2 routing logic + `WAITING_GATE2_APPROVAL` removal) | BATCHED | CLOSED 2026-03-20 — S003-P011-WP002; `_DOMAIN_PHASE_ROUTING` + phase model; **CERT_14** witness; evidence `test_certification.py` 19/19 PASS; closure_authority Team 170 |
| KB-2026-03-19-28 | 2026-03-19 | AGENTS_OS | S003-P011-WP001 | LOW | CLOSED | Team 170 | Team 11 | Team 90 Phase 2.2v verdict uses `route_recommendation: doc` on a PASS verdict — `route_recommendation` is an FCP field only meaningful on BLOCK_FOR_FIX; on PASS it has no canonical meaning and should be absent/null. Team 90 used "doc" to mean "forward to next phase" (not an FCP classification). Process protocol gap in Team 90 prompt template for validation phases. | `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_11_S003_P011_WP001_PHASE22V_VALIDATION_RESPONSE_v1.0.0.md:14` | BATCHED | CLOSED 2026-03-20 — S003-P011-WP002; FCP / verdict handling + D-05 template; **CERT_15** + D-05; evidence `test_certification.py` 19/19 PASS; closure_authority Team 170 |
| KB-2026-03-19-29 | 2026-03-19 | AGENTS_OS | S003-P011-WP001 | MEDIUM | CLOSED | Team 61 | Team 11 | G3_PLAN, G3_5, G3_6_MANDATES gates all route to `team_10 / orchestrator` for AOS domain — should route to `team_11 / cursor` per TRACK_FOCUSED variant. GATE_META entries are hardcoded to team_10 with no domain/variant-aware lookup. Root cause: pipeline.py predates team_engine_config.json and TRACK_FOCUSED routing logic. | `agents_os_v2/orchestrator/pipeline.py` — G3_PLAN, G3_5, G3_6_MANDATES GATE_META team assignments. | BATCHED | CLOSED 2026-03-20 — S003-P011-WP002; `_DOMAIN_PHASE_ROUTING`; **CERT_01 / CERT_03** witness; evidence `test_certification.py` 19/19 PASS; closure_authority Team 170 |
| KB-2026-03-19-30 | 2026-03-19 | AGENTS_OS | S003-P011-WP001 | MEDIUM | CLOSED | Team 61 | Team 11 | G3_REMEDIATION gate exists in GATE_SEQUENCE and GATE_META but has no prompt generator — pipeline.py returns "Unknown gate: G3_REMEDIATION" when attempting to generate its prompt. Gate is a legacy pass-through for multi-team BLOCK_FOR_FIX remediation cycles; in the 5-gate model this is handled by FCP mechanism and G3_REMEDIATION should be removed from the sequence entirely. | `agents_os_v2/orchestrator/pipeline.py` — G3_REMEDIATION in GATE_SEQUENCE (line 41) + GATE_META (line 74) + prompt generator missing. | BATCHED | CLOSED 2026-03-20 — S003-P011-WP002; 5-gate sequence + FCP; **CERT_15** witness; evidence `test_certification.py` 19/19 PASS; closure_authority Team 170 |
| KB-2026-03-19-31 | 2026-03-19 | AGENTS_OS | S003-P011-WP001 | MEDIUM | CLOSED | Team 61 | Team 11 | CURSOR_IMPLEMENTATION gate routes to `teams_20_30` (TikTrack implementation teams) for AOS domain — should route to `team_61` (AOS implementation). Part of the same GATE_META hardcoding pattern as KB-29. Dashboard mandate surfacing also missing — mandates file is not surfaced to the implementation team through any automated channel; must be delivered manually. | `agents_os_v2/orchestrator/pipeline.py` line 80: `CURSOR_IMPLEMENTATION: {"owner": "teams_20_30"}` — no domain/variant routing. | BATCHED | CLOSED 2026-03-20 — S003-P011-WP002; `_DOMAIN_PHASE_ROUTING`; **CERT_04** witness; evidence `test_certification.py` 19/19 PASS; closure_authority Team 170 |

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

### KB-2026-03-19-27 — GATE_2 skips Work Plan phases (2.2 + 2.2v) in new 5-gate model

- **Discovered during:** S003-P011-WP001 GATE_2 activation (2026-03-19)
- **Symptom:** Pipeline at GATE_2 routes directly to Phase 2.3 (Team 100 architectural intent review / `WAITING_GATE2_APPROVAL`), skipping Phase 2.2 (Team 11 Work Plan production) and Phase 2.2v (Team 90 Work Plan review). New 5-gate canonical order requires Work Plan to exist before architectural sign-off.
- **Secondary symptom:** `WAITING_GATE2_APPROVAL` still present in routing (must be replaced by `gate_state="HUMAN_PENDING"` per GATE_SEQUENCE_CANON §8 migration table).
- **Root cause:** `GATE_META["GATE_2"]` in `pipeline.py` was not updated to reflect new phase sequence. Old model: `GATE_2 → immediate architectural approval`. New model: `GATE_2 Phase 2.2 → Team 11 Work Plan → Phase 2.2v Team 90 review → Phase 2.3 Team 100 sign-off`.
- **Workaround applied 2026-03-19:** Manual bypass — Team 00 issues manual Work Plan prompt to Team 11 (Phase 2.2), then manual Team 90 review prompt (Phase 2.2v), then manual Team 100 architectural sign-off prompt (Phase 2.3). Pipeline state advanced manually after each phase.
- **Fix required (Team 61, WP001 GATE_3):**
  1. `GATE_META["GATE_2"]`: add Phase 2.2 (Team 11, work plan) and Phase 2.2v (Team 90, review) before Phase 2.3 (Team 100 sign-off)
  2. Phase routing logic: `current_phase` field drives which sub-prompt is generated at GATE_2
  3. Remove `WAITING_GATE2_APPROVAL` from all routing paths; replace with `gate_state="HUMAN_PENDING"` where Team 00 sign-off is required
  4. TRACK_FOCUSED variant routing: Phase 2.2 → Team 11 (not Team 10)
- **Evidence:** `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md` §2 (GATE_2 phase table) | `agents_os_v2/orchestrator/pipeline.py` (GATE_META + routing)

### KB-2026-03-19-26 — Pipeline correction-cycle prompt missing

- **Discovered during:** S003-P011-WP001 GATE_1 remediation cycle (2026-03-19)
- **Symptom:** `./pipeline_run.sh --domain agents_os` shows full LLD400 creation prompt when pipeline is at GATE_1 FAIL with `remediation_cycle_count > 0`. Targeted correction prompt (showing `last_blocking_findings`) not rendered.
- **Secondary symptom:** `pass` command accepted while active BLOCK_FOR_FIX was outstanding; blocking findings from Team 190 not written to state.
- **Root cause:** Gate prompt generators lack correction-cycle detection (`last_blocking_gate == current_gate AND remediation_cycle_count > 0` → correction mode banner + injected findings). `fail` command does not write reason to `last_blocking_findings` / `last_blocking_gate`.
- **Workaround applied 2026-03-19:** Manual bypass — pipeline state updated manually; Team 190 produced canonical correction prompt `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_S003_P011_WP001_G1_CORRECTION_PROMPT_v1.0.0.md`; Team 170 corrected to LLD400 v1.0.1; Team 190 validated PASS.
- **Fix required (Team 61, WP001 GATE_3):**
  1. All gate prompt generators: check `state.last_blocking_gate == current_gate AND remediation_cycle_count > 0` → render correction banner + inject `last_blocking_findings`
  2. `fail` command: write reason to `last_blocking_findings` + `last_blocking_gate = current_gate` before state save
  3. `pass` command: block advance if active BLOCK_FOR_FIX outstanding (no `last_blocking_findings` cleared)
- **Evidence:** `_COMMUNICATION/team_190/TEAM_190_S003_P011_WP001_GATE_1_VERDICT_v1.0.0.md` | `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_S003_P011_WP001_G1_CORRECTION_PROMPT_v1.0.0.md`

### WP002 closure batch — KB-2026-03-19-26 .. KB-2026-03-19-31 (2026-03-20)

- **status:** CLOSED (all six records)
- **closed_by:** S003-P011-WP002 — `pipeline.py` full overhaul — `_DOMAIN_PHASE_ROUTING`, prompt generators, FCP routing
- **evidence:** `agents_os_v2/tests/test_certification.py` — **19/19 PASS** (2026-03-20)
- **closure_authority:** Team 170 (register owner), 2026-03-20
- **routing_note:** Team 11 → Team 170 register update (WP002 QA handoff alignment)

| bug_id | CERT / witness (closure) |
|--------|---------------------------|
| KB-2026-03-19-26 | CERT_10 — correction-cycle banner |
| KB-2026-03-19-27 | CERT_14 — GATE_2 phases 2.2 / 2.2v (vs skip) |
| KB-2026-03-19-28 | CERT_15 (generator contract) + D-05 Team 90 verdict template |
| KB-2026-03-19-29 | CERT_01 / CERT_03 — TRACK_FOCUSED vs hardcoded `team_10` on G3\* |
| KB-2026-03-19-30 | CERT_15 — legacy `G3_REMEDIATION` removed from 5-gate progression |
| KB-2026-03-19-31 | CERT_04 — AOS implementation routes to `team_61` (not `teams_20_30`) |

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
**log_entry | TEAM_00 | KNOWN_BUGS_REGISTER | KB_2026_03_19_26_INTAKE | PIPELINE_CORRECTION_CYCLE_PROMPT_MISSING | AGENTS_OS | S003_P011_WP001 | MEDIUM | BATCHED | WORKAROUND_APPLIED | 2026-03-19**
**log_entry | TEAM_00 | KNOWN_BUGS_REGISTER | KB_2026_03_19_27_INTAKE | GATE_2_SKIPS_PHASE_2.2_AND_2.2v | WAITING_GATE2_APPROVAL_STALE | AGENTS_OS | S003_P011_WP001 | MEDIUM | BATCHED | WORKAROUND_MANUAL_BYPASS | 2026-03-19**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_19_28_INTAKE | TEAM_90_ROUTE_RECOMMENDATION_DOC_ON_PASS_VERDICT | PROTOCOL_GAP | LOW | BATCHED | 2026-03-19**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_19_29_INTAKE | AOS_G3_ROUTING_HARDCODED_TEAM_10_IGNORES_TRACK_FOCUSED | MEDIUM | BATCHED | WORKAROUND_MANUAL_PROMPT_TEAM_11 | 2026-03-19**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_19_30_INTAKE | G3_REMEDIATION_NO_PROMPT_GENERATOR | MEDIUM | BATCHED | WORKAROUND_FORCE_PASS | 2026-03-19**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_19_31_INTAKE | CURSOR_IMPLEMENTATION_ROUTES_TO_TEAMS_20_30_NOT_TEAM_61_AOS | MANDATE_DASHBOARD_MISSING | MEDIUM | BATCHED | WORKAROUND_MANUAL_DELIVERY | 2026-03-19**
**log_entry | TEAM_170 | KNOWN_BUGS_REGISTER | KB_2026_03_19_26_TO_31_CLOSED_WP002_PIPELINE_OVERHAUL | TEST_CERTIFICATION_19_19_PASS | 2026-03-20**
| KB-2026-03-20-32 | 2026-03-20 | AGENTS_OS | S003-P011-WP002 | HIGH | **CLOSED** | Team 61 | Team 11 | `FAIL_ROUTING` table uses old gate IDs as routing targets — invalid after 5-gate model. All routing targets must use GATE_1..GATE_5. | `agents_os_v2/orchestrator/pipeline.py` — FAIL_ROUTING dict | CLOSED | **CLOSED 2026-03-21** — Team 61 rewrite to canonical GATE_1..GATE_5 only. Evidence: test_cert_11b_gate4_fail_doc_routes_to_gate3_canonical, DRY_12. Authority: TEAM_61_S003_P011_WP002_GATE_5_KB_FIXES_v1.0.0 |
| KB-2026-03-20-33 | 2026-03-20 | AGENTS_OS | S003-P011-WP002 | HIGH | **CLOSED** | Team 61 | Team 11 | `migrate_state.py` exists but auto-migration is NOT called from `PipelineState.load()`. Active TikTrack WP (S002-P002-WP001) has `current_gate="G3_6_MANDATES"` — an old ID with no supported routing. Stranded until migration runs. | `agents_os_v2/orchestrator/state.py` — `load()` method missing `_auto_migrate()` call; `migrate_state.py` not integrated | CLOSED | **CLOSED 2026-03-21** — Team 170 code verification confirms migration IS called via Pydantic `model_validate` + `_run_migration` validator in `state.py`. CERT_13/14 both PASS. Runtime confirmation via SMOKE_02. Authority: TEAM_100_S003_P011_WP002_GATE_5_PHASE_5.1_ACCEPTANCE_v1.0.0 §2.1 |
| KB-2026-03-20-34 | 2026-03-20 | AGENTS_OS | S003-P011-WP002 | HIGH | **CLOSED** | Team 61 | Team 11 | GATE_5 prompt generator — was "Dev Validation / Team 90"; now Documentation Closure for Team 170/70. | `agents_os_v2/orchestrator/pipeline.py` — _generate_gate_5_prompt | CLOSED | **CLOSED 2026-03-21** — Team 61 fix: Documentation Closure title + domain routing. Evidence: test_cert_08, test_cert_09, DRY_07, DRY_11. Authority: TEAM_61_S003_P011_WP002_GATE_5_KB_FIXES_v1.0.0 |
| KB-2026-03-20-35 | 2026-03-20 | AGENTS_OS | S003-P011-WP002 | MEDIUM | **CLOSED** | Team 61 | Team 11 | `GATE_MANDATE_FILES` maps to key `"G3_6_MANDATES"` — old ID. Dashboard Team Mandates panel reads this key and misses mandates when pipeline is at `GATE_3 / current_phase="3.1"`. | `agents_os_v2/orchestrator/pipeline.py` — GATE_MANDATE_FILES + Dashboard JS mandate panel key lookup | CLOSED | **CLOSED 2026-03-21** — Team 170 confirmed: dashboard JS (line 275) reads the same `G3_6_MANDATES` key that `GATE_MANDATE_FILES` uses. Both sides are consistent — mandates display correctly at GATE_3/3.1. Not a functional defect. Canonical key rename deferred to WP003. Authority: TEAM_100_S003_P011_WP002_GATE_5_PHASE_5.1_ACCEPTANCE_v1.0.0 §2.2 |
| KB-2026-03-20-36 | 2026-03-20 | AGENTS_OS | S003-P011-WP002 | MEDIUM | OPEN | Team 61 | Team 11 | `pass` command has no gate identifier parameter — silent wrong-gate advance risk. If `--force` or ambiguous state causes wrong gate to be active, `pass` advances without validation. Per IDEA-050: `./pipeline_run.sh pass GATE_N` should abort if current_gate != GATE_N. | `pipeline_run.sh` — pass subcommand; `pipeline.py` — advance logic | BATCHED | S003-P011-WP002 scope |
| KB-2026-03-20-37 | 2026-03-20 | AGENTS_OS | S003-P011-WP002 | MEDIUM | OPEN | Team 61 | Team 11 | Dashboard `flags.waiting_human_approval` checks `state.current_gate in ("WAITING_GATE2_APPROVAL", "GATE_7")` — old gate IDs. In 5-gate model, human pending is indicated by `gate_state=="HUMAN_PENDING"`. Flag displays incorrectly for Phase 4.3 and GATE_2 Phase 2.3 human steps. | `agents_os_v2/orchestrator/pipeline.py` `_write_state_view()` line 247 | BATCHED | S003-P011-WP002 scope |
| KB-2026-03-20-38 | 2026-03-20 | AGENTS_OS | S003-P011-WP002 | MEDIUM | **CLOSED** | Team 61 | Team 11 | No end-to-end dry-run test coverage — DRY_RUN_01..15 were missing. | `agents_os_v2/tests/test_dry_run.py` | CLOSED | **CLOSED 2026-03-21** — Team 61 delivered test_dry_run.py with 15 tests DRY_01..DRY_15. Evidence: pytest 15/15 passed. Authority: TEAM_61_S003_P011_WP002_GATE_5_KB_FIXES_v1.0.0 |
| KB-2026-03-20-39 | 2026-03-20 | AGENTS_OS | S003-P011-WP002 | LOW | OPEN | Team 61 | Team 11 | `GATE_ALIASES` dict maps each old gate ID to ITSELF (identity map) — e.g. `"G3_PLAN": "G3_PLAN"`. This provides zero backward-compat value. Should map old IDs → new canonical GATE IDs per GATE_SEQUENCE_CANON §8 migration table. | `agents_os_v2/orchestrator/pipeline.py` lines 44–50 | BATCHED | S003-P011-WP002 scope |

**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_20_32_INTAKE | FAIL_ROUTING_OLD_GATE_IDS_AS_TARGETS | HIGH | BATCHED | 2026-03-20**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_20_33_INTAKE | AUTO_MIGRATION_NOT_CALLED_ON_LOAD_TIKTRACK_WP_STRANDED | HIGH | BATCHED | 2026-03-20**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_20_33_CLOSED | PYDANTIC_MODEL_VALIDATOR_CONFIRMS_MIGRATION_ON_LOAD | CERT_13_14_PASS | SMOKE_02_CONFIRMATION | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_20_35_CLOSED | DASHBOARD_CONSISTENT_BOTH_SIDES_G3_6_MANDATES_KEY | FUNCTIONAL_NOT_DEFECT | DEFERRED_WP003 | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_20_34_INTAKE | GATE5_PROMPT_WRONG_CONTENT_SHOWS_OLD_DEV_VALIDATION | HIGH | BATCHED | 2026-03-20**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_20_35_INTAKE | GATE_MANDATE_FILES_OLD_KEY_G3_6_MANDATES | MEDIUM | BATCHED | 2026-03-20**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_20_36_INTAKE | PASS_NO_GATE_IDENTIFIER_SILENT_WRONG_GATE_RISK | MEDIUM | BATCHED | IDEA_050 | 2026-03-20**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_20_37_INTAKE | DASHBOARD_FLAGS_WAITING_HUMAN_APPROVAL_OLD_GATE_IDS | MEDIUM | BATCHED | 2026-03-20**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_20_38_INTAKE | NO_DRY_RUN_TEST_COVERAGE_PIPELINE_SHIPPED_UNTESTED | MEDIUM | BATCHED | 2026-03-20**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_20_39_INTAKE | GATE_ALIASES_IDENTITY_MAP_USELESS | LOW | BATCHED | 2026-03-20**
**log_entry | TEAM_170 | KNOWN_BUGS_REGISTER | KB_32_34_38_CLOSED | GATE5_KB_FIX_BATCH | TEAM_61_DELIVERY | TEAM_51_CORROBORATION | 2026-03-21**

### TT Test Flight batch — KB-2026-03-21-40 .. KB-2026-03-21-49 (2026-03-21)

- **source:** S003-P003-WP001 test flight (GATE_3 Phase 3.2 bypass mode)
- **authority:** TEAM_100 architectural authority + Nimrod direct observation
- **status:** OPEN (all ten records) — routed to WP003 or Team 61 dashboard fix cycle

| bug_id | date | domain | wp | severity | status | owner | coordinator | description | code_location | remediation_status | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| KB-2026-03-21-40 | 2026-03-21 | SHARED | S003-P003-WP001 | MEDIUM | OPEN | Team 170 | Team 11 | `_COMMUNICATION/agents_os/` holds state files for BOTH domains (agents_os + tiktrack). tiktrack state at `agents_os/pipeline_state_tiktrack.json` — non-intuitive; causes governance confusion (Team 100 created state at wrong path `_COMMUNICATION/tiktrack/` during test flight). Needs README or path restructure. | `agents_os_v2/config.py` — DOMAIN_STATE_FILES; `_COMMUNICATION/agents_os/` | BATCHED | WP003 scope — documentation + optional path restructure |
| KB-2026-03-21-41 | 2026-03-21 | SHARED | S003-P003-WP001 | LOW | OPEN | Team 61 | Team 11 | `MandateStep(phase=1, phase=2)` internal numbering within a single gate conflicts with canonical GATE_3 Phase 3.1/3.2 naming. Teams receive "Phase 1 / Phase 2" labels inside GATE_3/3.2 mandate and are confused about whether these are sub-phases of 3.2 or canonical 3.1/3.2. | `agents_os_v2/orchestrator/pipeline.py` — MandateStep class + GATE_3 step builders | BATCHED | WP003 scope — rename to `sub_phase` or `execution_order` |
| KB-2026-03-21-42 | 2026-03-21 | TIKTRACK | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 11 | `_DOMAIN_PHASE_ROUTING` GATE_3/3.2 for tiktrack routes to `"teams_20_30_40"` — missing Team 60 (DevOps). Team 60 is a required participant in TRACK_FULL GATE_3 implementation (CI/CD pipeline, environment setup). Confirmed missing from `_resolve_phase_owner()` expansion and MandateStep generation. | `agents_os_v2/orchestrator/pipeline.py` — `_DOMAIN_PHASE_ROUTING["GATE_3"]["3.2"]` + `teams_20_30_40` expansion | BLOCKING_WP003 | Must fix before TRACK_FULL is considered production-ready |
| KB-2026-03-21-43 | 2026-03-21 | TIKTRACK | S003-P003-WP001 | MEDIUM | OPEN | Team 61 | Team 11 | Dashboard Feature Spec card shows "No spec loaded" even when `spec_path` is correctly set in `pipeline_state_tiktrack.json`. Card reads a different field or fails to fetch/render the spec content. | `agents_os/ui/js/` — dashboard spec loader; `pipeline_state_tiktrack.json` `spec_path` field | BATCHED | Dashboard UI fix — spec content not fetched from file |
| KB-2026-03-21-44 | 2026-03-21 | TIKTRACK | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 11 | TikTrack domain renders in light mode. Multiple UI elements use hardcoded dark-background text colors: `current-step-banner` header text is white-on-white (unreadable). Card titles and step labels invisible. Dashboard is effectively unusable in TikTrack domain. | `agents_os/ui/css/` — color variables; `.current-step-banner`, `.card-header`, step-label classes; no domain-aware theming | IMMEDIATE | Affects usability of test flight monitoring — high priority fix |
| KB-2026-03-21-45 | 2026-03-21 | SHARED | S003-P003-WP001 | LOW | OPEN | Team 100 | Team 11 | Gate Context card renders but shows no data. Purpose of this card is unclear — it may be displaying empty `gate_context` field from state (which is never populated) or it may have become a stale UI element. Needs architectural evaluation: populate or remove. | `agents_os/ui/js/` — gate-context card renderer | BATCHED | Evaluate before WP003 UI sprint — may be removed |
| KB-2026-03-21-46 | 2026-03-21 | SHARED | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 11 | Quick Commands panel in Dashboard exposes `pass`, `fail`, `approve` buttons without sufficient safety checks. No confirmation dialog, no gate-context display before action, no prevention of double-execution. A single misclick permanently advances pipeline state. Per test flight observation: panel is dangerous and not sufficiently idiot-proof for operator use. | `agents_os/ui/js/` — quick-commands panel; `pipeline_run.sh` pass/fail/approve handlers | IMMEDIATE | Requires confirmation dialog + current-gate display before action; consider KB-36 gate-param guard as companion fix |
| KB-2026-03-21-47 | 2026-03-21 | SHARED | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 11 | Expected Output Files card is empty across all phases. This card is now implementable: canonical file naming conventions are established (e.g. `TEAM_20_S003_P003_WP001_GATE_3_*_v1.0.0.md`). Card should: (1) show expected files per current phase/team, (2) check existence of each file, (3) provide direct link to existing files. Acts as a progress log linked to actual artifacts. | `agents_os/ui/js/` — expected-outputs renderer; requires file-existence check against `_COMMUNICATION/` tree | BATCHED | High value — acts as real-time progress tracker per WP |
| KB-2026-03-21-48 | 2026-03-21 | SHARED | S003-P003-WP001 | MEDIUM | OPEN | Team 61 | Team 11 | Event Log shows one-line entries with no drill-down. Full log entry content (multi-line details, timestamps, gate context) is not accessible. No copy button per entry. For test flight monitoring: critical events need to be inspectable without raw file access. Consider: expandable rows or side panel; copy-to-clipboard per entry. | `agents_os/ui/js/` — event-log renderer; `_COMMUNICATION/agents_os/` log files | BATCHED | Consider adding dev-flag-aware log verbosity: when `flags.dev_mode=true`, show extended log entries |
| KB-2026-03-21-49 | 2026-03-21 | SHARED | S003-P003-WP001 | MEDIUM | OPEN | Team 51 | Team 11 | Governance/Identity injection in Dashboard pages suspected non-functional during test flight. Specific behavior: WSM identity header, active WP display, and canonical routing section appear to not load or render stale data. Requires dedicated Team 51 browser QA session across all 3 dashboard pages (main, roadmap, pipeline). | `agents_os/ui/js/` — identity-injection module; WSM reader; dashboard pages | BATCHED | Team 51 to produce QA report: `TEAM_51_DASHBOARD_IDENTITY_INJECTION_QA_v1.0.0.md` |

**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_40_INTAKE | TIKTRACK_STATE_PATH_NON_INTUITIVE | MEDIUM | BATCHED | TT_TEST_FLIGHT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_41_INTAKE | MANDATE_STEP_PHASE_NUMBERING_CONFLICT | LOW | BATCHED | TT_TEST_FLIGHT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_42_INTAKE | TRACK_FULL_GATE3_MISSING_TEAM_60_DEVOPS | HIGH | BLOCKING_WP003 | TT_TEST_FLIGHT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_43_INTAKE | DASHBOARD_FEATURE_SPEC_NOT_LOADED | MEDIUM | BATCHED | TT_TEST_FLIGHT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_44_INTAKE | TIKTRACK_LIGHT_MODE_WHITE_TEXT_UNREADABLE | HIGH | IMMEDIATE | TT_TEST_FLIGHT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_45_INTAKE | GATE_CONTEXT_CARD_EMPTY_PURPOSE_UNCLEAR | LOW | BATCHED | TT_TEST_FLIGHT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_46_INTAKE | QUICK_COMMANDS_NOT_IDIOT_PROOF_DANGEROUS | HIGH | IMMEDIATE | TT_TEST_FLIGHT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_47_INTAKE | EXPECTED_OUTPUT_FILES_EMPTY_NOW_IMPLEMENTABLE | HIGH | BATCHED | TT_TEST_FLIGHT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_48_INTAKE | EVENT_LOG_NO_DRILLDOWN_NO_COPY | MEDIUM | BATCHED | TT_TEST_FLIGHT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_49_INTAKE | DASHBOARD_IDENTITY_INJECTION_SUSPECTED_NON_FUNCTIONAL | MEDIUM | BATCHED | TEAM_51_QA_REQUIRED | 2026-03-21**

### TT Test Flight batch — KB-2026-03-21-50 .. KB-2026-03-21-53 (2026-03-21)

- **source:** S003-P003-WP001 test flight — GATE_3→GATE_4 transition observation
- **authority:** TEAM_100 architectural authority + Nimrod direct observation (TF-09 / TF-10)
- **status:** OPEN — all four records

| bug_id | date | domain | wp | severity | status | owner | coordinator | description | code_location | remediation_status | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| KB-2026-03-21-50 | 2026-03-21 | SHARED | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 11 | Pipeline mandate generation does not cross-reference the canonical team roster (`ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0.md`). When generating mandates for `teams_20_30_40`, the pipeline does not validate that each team's role is appropriate for the gate/phase. During test flight, Team 40 received an "Integration & E2E" mandate (wrong role — actual: UI Assets & Design). Iron Rule §5.2 explicitly states "Team 40 = UI assets only, never QA." No automated guard caught this. Root cause: TF-09. | `agents_os_v2/orchestrator/pipeline.py` — `_generate_cursor_prompts()`; `GATE_META`; no roster lookup anywhere in mandate generation path | BATCHED | WP003 scope — add roster validation layer to mandate generation; mandate template must include role description from roster |
| KB-2026-03-21-51 | 2026-03-21 | TIKTRACK | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 11 | GATE_4 prompt generated by pipeline is completely generic — 25 lines only, no WP-specific content. References "new feature" and "new page" (placeholder text). Contains no mention of D39/D40/D41, no reference to Team 40's FINDINGS_LIST, no specific test scenarios. The prompt is useless for actual QA work and requires manual mandate to be produced every time. Pipeline prompt generation for GATE_4 is not connected to WP scope. | `agents_os_v2/orchestrator/pipeline.py` — `_generate_gate4_prompt()` (or equivalent); `tiktrack_GATE_4_prompt.md` at 25 lines total | IMMEDIATE | GATE_4 prompt must inject: WP spec brief, Team 40 advisory findings, LOD200 AC list, specific D39/D40/D41 test targets |
| KB-2026-03-21-52 | 2026-03-21 | TIKTRACK | S003-P003-WP001 | MEDIUM | OPEN | Team 61 | Team 11 | `GATE_META["GATE_4"]["owner"]` is hardcoded as `"team_51"` (AOS QA). For TikTrack TRACK_FULL, GATE_4 QA owner should be `"team_50"`. The `status` command displays `owner: team_51` for TikTrack — incorrect and misleading. `_DOMAIN_PHASE_ROUTING` has no tiktrack-specific override for GATE_4. Result: `status` shows wrong team; operator routes to wrong team. | `agents_os_v2/orchestrator/pipeline.py` — `GATE_META["GATE_4"]["owner"] = "team_51"`; `_DOMAIN_PHASE_ROUTING["GATE_4"]` missing tiktrack entries | BATCHED | Add tiktrack domain override to GATE_4 routing: `{"TRACK_FULL": "team_50", "tiktrack": "team_50", "default": "team_51"}` |
| KB-2026-03-21-53 | 2026-03-21 | TIKTRACK | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 11 | GATE_3 Phase 3.3 (in-gate QA) has no tiktrack-specific routing. `_DOMAIN_PHASE_ROUTING["GATE_3"]["3.3"] = {"default": "team_51"}` — defaults to AOS QA team. For TikTrack TRACK_FULL, phase 3.3 should route to `team_50`. During test flight, `pass` from 3.2 advanced directly to GATE_4 — phase 3.3 was never executed with Team 50. TikTrack GATE_3 QA (Team 50) was fully skipped. Root cause: TF-10. | `agents_os_v2/orchestrator/pipeline.py` — `_DOMAIN_PHASE_ROUTING["GATE_3"]["3.3"]` missing tiktrack/TRACK_FULL entries | BLOCKING_WP003 | Fix: add `"tiktrack": "team_50", "TRACK_FULL": "team_50"` to GATE_3/3.3 routing. Team 50 must execute GATE_3/3.3 before GATE_4 in production. |

**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_50_INTAKE | MANDATE_GENERATION_NO_ROSTER_CROSSREF | HIGH | BATCHED | TF-09_ROOT | WP003 | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_51_INTAKE | GATE4_PROMPT_GENERIC_NO_WP_CONTENT | HIGH | IMMEDIATE | TT_TEST_FLIGHT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_52_INTAKE | GATE_META_GATE4_OWNER_TEAM51_TIKTRACK_SHOULD_BE_TEAM50 | MEDIUM | BATCHED | TT_TEST_FLIGHT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_53_INTAKE | GATE3_PHASE33_NO_TIKTRACK_ROUTING_TEAM50_SKIPPED | HIGH | BLOCKING_WP003 | TF-10_ROOT | 2026-03-21**

### TT Test Flight batch — KB-2026-03-21-54 .. KB-2026-03-21-56 (2026-03-21)

- **source:** S003-P003-WP001 test flight — GATE_4 QA report submission + fail command UX (TF-11)
- **authority:** TEAM_100 + Nimrod direct observation

| bug_id | date | domain | wp | severity | status | owner | coordinator | description | code_location | remediation_status | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| KB-2026-03-21-54 | 2026-03-21 | SHARED | S003-P003-WP001 | MEDIUM | OPEN | Team 61 | Team 11 | Dashboard / pipeline system has no automatic detection that a team submitted a QA report artifact. After Team 50 submitted to `_COMMUNICATION/team_50/`, there was no auto-signal, no confirmation, no state update. Operator must manually poll the directory or wait for the team to report verbally. Slow discovery. | `agents_os/ui/js/` — no file-watch/artifact-detection logic; `_COMMUNICATION/agents_os/` no submission hook | BATCHED | Future: Expected Output Files card (KB-47) + webhook/file-watch when new artifact appears under team folder |
| KB-2026-03-21-55 | 2026-03-21 | SHARED | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 11 | No bridge between QA report file and `fail` command string. `./pipeline_run.sh --domain D fail "STRING"` requires a compact one-line string. QA report (137 lines) does not auto-produce this string. System cannot derive the fail string from a report filename. Operator must manually compose the string. Observed: Nimrod tried to get the system to extract the fail string from the filename — failed. Root cause: TF-11. | `pipeline_run.sh` — `fail` subcommand has no `--from-report` option; no report parsing in `pipeline.py` | IMMEDIATE | Fix: add `./pipeline_run.sh --domain D fail --from-report PATH` — reads `last_blocking_findings` section from report file and uses as fail string |
| KB-2026-03-21-56 | 2026-03-21 | SHARED | S003-P003-WP001 | MEDIUM | OPEN | Team 61 | Team 11 | Mandate template for QA teams does not require a "fail command ready string" as a mandatory output field. Team 50 produced a correct verdict and summary but did not produce a format-ready fail string for the `pipeline_run.sh fail` command. Mandate §9 said to "run fail with summary" but did not specify the exact format or require the team to pre-build it. Process gap causes operator manual work on every FAIL outcome. | `_COMMUNICATION/team_50/TEAM_50_S003_P003_WP001_GATE4_QA_v1.0.0.md` §9; QA mandate template | BATCHED | Fix: add mandatory §X to all QA mandates: "FAIL_CMD: [one-line summary]" field that can be directly pasted into `pipeline_run.sh fail` |

**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_54_INTAKE | NO_ARTIFACT_DETECTION_SYSTEM | MEDIUM | BATCHED | TF-11_ROOT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_55_INTAKE | NO_FROM_REPORT_FLAG_IN_FAIL_COMMAND | HIGH | IMMEDIATE | TF-11_ROOT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_56_INTAKE | QA_MANDATE_MISSING_FAIL_CMD_FIELD | MEDIUM | BATCHED | TF-11_ROOT | 2026-03-21**

### TT Test Flight batch — KB-2026-03-21-57 .. KB-2026-03-21-58 (2026-03-21)

- **source:** S003-P003-WP001 test flight — terminal session: `pipeline_run.sh fail` execution failure + first-run state fallback (TF-12)
- **authority:** TEAM_100 + Nimrod direct terminal observation

| bug_id | date | domain | wp | severity | status | owner | coordinator | description | code_location | remediation_status | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| KB-2026-03-21-57 | 2026-03-21 | SHARED | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 11 | `./pipeline_run.sh fail "reason"` fails with `⛔ FAIL PREFLIGHT — finding_type is required` when `--finding_type` flag is omitted. The flag is mandatory but is not documented anywhere: not in any generated gate prompt, not in any QA mandate template, not in `AGENTS_OS_V2_OPERATING_PROCEDURES`, not in the GATE_4 mandate's §9 trigger section. All existing mandate templates that include fail command examples (`./pipeline_run.sh --domain D fail "reason"`) are syntactically incorrect — they will fail at runtime. Valid values: `PWA\|doc\|wording\|canonical_deviation\|code_fix_single\|code_fix_multi\|architectural\|scope_change\|unclear`. Correct form: `./pipeline_run.sh --domain tiktrack fail --finding_type code_fix_multi "reason"`. Observed at: TF-12 terminal session 2026-03-21. | `pipeline_run.sh` — `fail` subcommand preflight validation requires `--finding_type`; all mandate templates and generated prompts that include fail examples; `AGENTS_OS_V2_OPERATING_PROCEDURES` | IMMEDIATE | Fix: (1) add `--finding_type` to all mandate templates and generated prompts that reference `fail` command; (2) add type to TF-05 command table in operating procedures; (3) consider making `--finding_type` optional with a prompt/default for non-CLI environments |
| KB-2026-03-21-58 | 2026-03-21 | SHARED | S003-P003-WP001 | MEDIUM | OPEN | Team 61 | Team 11 | First invocation of `./pipeline_run.sh --domain tiktrack` in a session reads `pipeline_state.json` (generic agents_os fallback, contained S002-P002 data) instead of `pipeline_state_tiktrack.json`. On second invocation, correctly reads tiktrack state. Root cause suspected: either (a) session-level caching where first call resolves domain before `--domain tiktrack` flag is processed, or (b) `DOMAIN_STATE_FILES` lookup fails on first call due to initialization order and falls back to default. Additional symptom: first run output included INFO log text (`INFO:root:Migrating...`) embedded in the generated prompt filename — suggesting stdout/stderr mixing during initial state resolution. Observed at: TF-12 terminal session 2026-03-21. | `pipeline_run.sh` — domain argument processing order; `agents_os_v2/config.py` — `DOMAIN_STATE_FILES`; `agents_os_v2/orchestrator/state.py` — load() initialization sequence | BATCHED | Requires reproduction in clean session; add debug logging to confirm whether first call hits fallback; potential fix: explicit `--domain` parse before any state load |

**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_57_INTAKE | FAIL_CMD_FINDING_TYPE_REQUIRED_UNDOCUMENTED_EVERYWHERE | HIGH | IMMEDIATE | TF-12_ROOT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_58_INTAKE | FIRST_RUN_READS_WRONG_STATE_FILE_FALLBACK_TO_GENERIC | MEDIUM | BATCHED | TF-12_ROOT | 2026-03-21**

### TT Test Flight batch — KB-2026-03-21-59 .. KB-2026-03-21-64 (2026-03-21)

- **source:** S003-P003-WP001 test flight — GATE_4 correction cycle + Team 50 QA observations (TF-13..17)
- **authority:** TEAM_100 + Nimrod direct observation
- **status:** OPEN — all six records

| bug_id | date | domain | wp | severity | status | owner | coordinator | description | code_location | remediation_status | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| KB-2026-03-21-59 | 2026-03-21 | TIKTRACK | S003-P003-WP001 | MEDIUM | OPEN | Team 61 | Team 11 | Dashboard displays "working with Team 11" after pipeline returns from a correction cycle in TikTrack domain. Team 11 = AOS Gateway only. For TikTrack, correction cycle routing should return to Team 10 (Gateway) or Team 50 (QA). Root cause: GATE_META and `_DOMAIN_PHASE_ROUTING` have no tiktrack-specific override for correction cycle flow. Broader issue: logging and routing for all process variants (TRACK_FULL / TRACK_FOCUSED / TRACK_FAST) across all flow states (gate, correction cycle, re-QA, pass, fail) is not defined — causing dashboard inconsistencies throughout. | `agents_os_v2/orchestrator/pipeline.py` — correction cycle routing; GATE_META; `_DOMAIN_PHASE_ROUTING` correction cycle entries missing tiktrack | BATCHED | Requires full audit of all variant×state routing; add tiktrack correction cycle routing table to pipeline.py |
| KB-2026-03-21-60 | 2026-03-21 | SHARED | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 11 | Correction cycle prompt generated by pipeline is not in canonical mandate format. Contains findings in readable form but missing: Identity Header (roadmap_id/stage_id/work_package_id/gate_id), per-finding Acceptance Criteria, expected output artifact definitions, reference to validating team. Result: implementation team (Teams 20/30) does not understand exact scope → partial/incorrect response. Root cause: TF-14. | `agents_os_v2/orchestrator/pipeline.py` — correction cycle prompt generator; CORRECTION_CYCLE_BANNER; no canonical mandate template applied | IMMEDIATE | Fix: apply canonical mandate format to all correction cycle prompts; must include Identity Header + per-finding AC + expected artifacts + validating team reference |
| KB-2026-03-21-61 | 2026-03-21 | SHARED | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 11 | No structured sequential correction protocol after GATE_4_FAIL in TRACK_FULL. Current system sends all findings simultaneously — no per-finding verification, no ordered execution. Nimrod's proposed protocol: QA team (50/51) sends one correction at a time → verifies fix → proceeds to next. Maintains structured 2-team conversation model throughout correction phase. Root architectural cause: Team 10 was intentionally removed as orchestrator of implementation phase (WP002 design decision) — leaving no coordination mechanism between QA team and multiple implementation teams during correction cycle. | `agents_os_v2/orchestrator/pipeline.py` — correction cycle flow; no per-finding step generator; no verification loop | WP003 | Design item for WP003: sequential correction protocol; QA team as correction orchestrator; per-fix verification step |
| KB-2026-03-21-62 | 2026-03-21 | SHARED | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 11 | Teams do not receive org structure / team roster in their prompts. When a team must make a routing decision (e.g. after test failure: which team to notify? which team to route findings to?) — it has no awareness of available teams, their roles, or the canonical routing. This causes incorrect routing decisions, incorrect escalations, and teams requesting Nimrod to make decisions they should make autonomously. Additionally: in multi-phase gates, each team must receive the completion report of the prior phase — otherwise inter-team coordination is impossible (e.g. Team 30 needs Team 20's API schema to implement frontend correctly). Both are injection-timing problems: roster and prior-phase report must be included in mandate at generation time. | `agents_os_v2/orchestrator/pipeline.py` — mandate generation; no roster injection; no prior-phase completion report injection | IMMEDIATE | Fix: (1) inject relevant roster excerpt into all mandates at decision points; (2) inject prior-phase completion report path into each mandate where cross-phase dependency exists |
| KB-2026-03-21-63 | 2026-03-21 | SHARED | S003-P003-WP001 | MEDIUM | OPEN | Team 61 | Team 11 | Cursor (LLM engine for Teams 10/20/30/40/50/60/70) does not reliably return correctly formatted dates. Pipeline validation that checks date format on report fields (date, last_updated, date_closed, etc.) may reject a valid report due to date format failure alone. Iron Rule (Nimrod, 2026-03-21): date validation MUST NOT block — log warning and continue. Never fail a gate for date format alone. | Pipeline validation layer; any schema validation that enforces date format on team-submitted reports | BATCHED | Fix: make all date field validations non-blocking; add WARNING log on format error; never raise/reject on date format alone |
| KB-2026-03-21-64 | 2026-03-21 | SHARED | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 11 | During QA phases, teams (particularly Team 50) frequently request Nimrod to run terminal commands (npm, curl, pytest, server start) or perform manual browser tests. The HITL (human-in-the-loop) boundary is defined only for GATE_2 Phase 2.3 (human approval) and GATE_7 (UX sign-off). In all other gates: teams must operate fully autonomously — start server, run scripts, execute all tooling independently. This boundary is not stated clearly in mandate templates. Teams default to requesting human assistance when blocked. | All QA mandate templates (TEAM_50_*, TEAM_51_*); mandate generation in `pipeline.py` — §setup and §execution sections | IMMEDIATE | Fix: add mandatory section to all QA mandates: "Human-in-the-loop: Nimrod is NOT available for commands or testing in this gate. You must independently start the server, run all scripts, and execute all validation tooling. Only GATE_2 Phase 2.3 and GATE_7 require Nimrod interaction." |

**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_59_INTAKE | DASHBOARD_TEAM11_CORRECTION_CYCLE_TIKTRACK_ROUTING_GAP | MEDIUM | BATCHED | TF-13_ROOT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_60_INTAKE | CORRECTION_CYCLE_PROMPT_NOT_CANONICAL_FORMAT | HIGH | IMMEDIATE | TF-14A_ROOT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_61_INTAKE | NO_SEQUENTIAL_CORRECTION_PROTOCOL_TEAM10_REMOVED_AS_ORCHESTRATOR | HIGH | WP003 | TF-14B_ROOT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_62_INTAKE | TEAMS_NOT_ORG_AWARE_ROSTER_NOT_INJECTED_NO_INTERPHASE_HANDOFF | HIGH | IMMEDIATE | TF-14C_ROOT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_63_INTAKE | DATE_VALIDATION_MUST_NOT_BLOCK_CURSOR_DATE_FORMAT_UNRELIABLE | MEDIUM | BATCHED | TF-16_ROOT | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_64_INTAKE | HITL_BOUNDARY_UNCLEAR_TEAMS_REQUEST_NIMROD_TERMINAL | HIGH | IMMEDIATE | TF-17_ROOT | 2026-03-21**

### TT Test Flight batch — KB-2026-03-21-65 .. KB-2026-03-21-69 (2026-03-21)

- **source:** S003-P003-WP001 test flight — Team 50 architectural analysis (TF-18)
- **document:** `TEAM_50_TO_TEAM_00_AGENTS_OS_PIPELINE_UI_SYNC_QA_CONTROL_ANALYSIS_v1.0.0.md`
- **authority:** TEAM_50 gap analysis + TEAM_100 architectural authority
- **status:** OPEN — all five records; ARCHITECT_DECISION_REQUIRED on KB-65

| bug_id | date | domain | wp | severity | status | owner | coordinator | description | code_location | remediation_status | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| KB-2026-03-21-65 | 2026-03-21 | SHARED | S003-P003-WP001 | CRITICAL | OPEN | Team 61 | Team 51 | Three sources of truth exist in parallel — `pipeline_state_*.json` (current_gate/stage_id), WSM (active_stage), STATE_SNAPSHOT (governance view) — with no automated cross-validation that fails CI. Dashboard shows UI warning (AD-V2-05) on drift, but this is a browser display only — not a CI FAIL. No `pytest` or `--check` script exits non-zero when drift exists. Team 50 cannot close quality on CI alone. Root cause (Gap G4.1): no binding contract between the three truth sources. **ARCHITECT_DECISION_REQUIRED:** must define (a) canonical priority order when sources conflict, (b) whether drift = CI block or warning-only, (c) who owns enforcement. | `agents_os_v2/validators/wsm_alignment.py` — validation exists but not wired to CI exit; `agents_os/ui/js/pipeline-dashboard.js` — AD-V2-05 warning; no CI script exists that checks all three sources | IMMEDIATE | R3 from Team 50 §5: implement `--check` CI script: WSM ↔ pipeline_state ↔ STATE_SNAPSHOT; exit 1 on drift. Unblocks Team 50 QA closure without browser. |
| KB-2026-03-21-66 | 2026-03-21 | SHARED | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 51 | Gate mapping logic is duplicated between JavaScript (`pipeline-config.js` — `LEGACY_GATE_TO_CANONICAL` table) and Python (`agents_os_v2` — migration logic and gate transitions). No shared test or single-source contract ensures the two stay consistent. A change in Python gate IDs or a UI update on the JS side proceeds without regression detection. This is the root cause of the observed symptom "dashboard shows something different from actual runtime state." Evidence: `LEGACY_GATE_TO_CANONICAL` in JS maps e.g. "GATE_6" → "GATE_4", "GATE_8" → "GATE_5" — these must exactly match Python migration table. Root cause (Gap G4.2). | `agents_os/ui/js/pipeline-config.js` — `LEGACY_GATE_TO_CANONICAL`; `agents_os_v2/orchestrator/pipeline.py` — GATE_ALIASES; no shared test | IMMEDIATE | R2 from Team 50 §5: establish single SSOT for gate mapping (YAML/JSON in repo) → export/generate both Python dict and JS const from single file; add regression test |
| KB-2026-03-21-67 | 2026-03-21 | SHARED | S003-P003-WP001 | HIGH | OPEN | Team 61 | Team 51 | No test coverage for `agents_os/ui/` in `agents_os_v2/tests/`. `grep` on `agents_os_v2/tests/` finds no references to `pipeline-dashboard`, `pipeline-config`, or UI JS files. `test_integration.py` tests only `PipelineState` Python object and parser — not fetch paths, not visual/logical output that the operator sees. UI regressions (fetch URL changes, field name renames, JS logic changes) are entirely undetected by pytest. Root cause (Gap G4.3). | `agents_os_v2/tests/test_integration.py` — no UI reference; `agents_os/ui/js/` — zero test coverage | IMMEDIATE | R1 + R6 from Team 50 §5: (1) JSON schema contract for state fields the UI reads (current_gate, stage_id, project_domain, gate_state, pending_actions) — pytest validates schema on every PR; (2) lightweight Node/Playwright test for UI logic after R1-R4 established |
| KB-2026-03-21-68 | 2026-03-21 | SHARED | S003-P003-WP001 | MEDIUM | OPEN | Team 61 | Team 51 | `pipeline_events.jsonl` (audit log) has no event↔state contract. No automated rules define: "after a `pass` event, `current_gate` must advance"; "after a `store` event, `gate_state` must update"; "minimum required event sequence per gate". Team 50 cannot verify process correctness without manual log inspection. Root cause (Gap G4.4). | `_COMMUNICATION/agents_os/logs/pipeline_events.jsonl`; no schema or contract file exists | BATCHED | R5 from Team 50 §5: define minimal event schema (event_type enum, required fields per type); add contract test that validates event sequence against state transitions |
| KB-2026-03-21-69 | 2026-03-21 | SHARED | S003-P003-WP001 | MEDIUM | OPEN | Team 61 | Team 51 | Two parallel implementations of `state_reader` exist: (1) `agents_os/observers/state_reader.py` with tests in `agents_os/tests/test_state_reader.py` (legacy schema); (2) `agents_os_v2/observers/state_reader.py` (current). If both write to `STATE_SNAPSHOT.json`, there is no canonical rule for which one is CI authority. Drift between environments is undetectable. Root cause (Gap G4.5). | `agents_os/observers/state_reader.py`; `agents_os_v2/observers/state_reader.py`; `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json` | BATCHED | Define and document canonical authority: `agents_os_v2/observers/state_reader.py` is the SSOT; deprecate/remove `agents_os/observers/state_reader.py` or mark it explicitly as legacy-only; update CI to run only v2 |

**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_65_INTAKE | THREE_SOT_NO_CI_VALIDATION_DRIFT_UNDETECTED | CRITICAL | IMMEDIATE | ARCHITECT_DECISION_REQUIRED | TF-18_G4.1 | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_66_INTAKE | GATE_MAPPING_DUPLICATED_JS_PYTHON_NO_SHARED_TEST | HIGH | IMMEDIATE | TF-18_G4.2 | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_67_INTAKE | NO_UI_TEST_COVERAGE_IN_PYTEST_SUITE | HIGH | IMMEDIATE | TF-18_G4.3 | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_68_INTAKE | EVENT_LOG_NO_EVENT_STATE_CONTRACT | MEDIUM | BATCHED | TF-18_G4.4 | 2026-03-21**
**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_69_INTAKE | DUAL_STATE_READER_IMPLEMENTATIONS_DRIFT_RISK | MEDIUM | BATCHED | TF-18_G4.5 | 2026-03-21**

---

### S003-P012 Governance Correction — KB-2026-03-21-70 (2026-03-21)

- **source:** Team 100 self-correction — GATE_8 nomenclature used in S003 closure documents
- **authority:** Team 100 (direct issue + direct fix)
- **status:** FIXED (same session — no handoff required)

| bug_id | date | domain | wp | severity | status | owner | coordinator | description | code_location | remediation_status | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| KB-2026-03-21-70 | 2026-03-21 | SHARED | S003-P012-WP002/WP003 | MEDIUM | FIXED | Team 100 | Team 00 | Team 100 issued WP002 and WP003 lifecycle closure documents using "GATE_8 FULL PASS" as the closure label. S003-P012 is a 5-gate-model program — its lifecycle gate is GATE_5, not GATE_8. GATE_8 = old 8-gate model label valid only for S002 programs. This creates nomenclature drift in governance documents and `pipeline_state_agentsos.json` `phase8_content` field values, and risks propagating the old gate model into S003 documentation. Root cause: Team 100 applied the historically familiar "GATE_8 FULL PASS" label without checking gate-model applicability for S003. | `_COMMUNICATION/team_100/TEAM_100_S003_P012_WP002_GATE8_FULL_PASS_v1.0.0.md`; `_COMMUNICATION/team_100/TEAM_100_S003_P012_WP003_GATE8_FULL_PASS_v1.0.0.md`; `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` (phase8_content); `_COMMUNICATION/agents_os/pipeline_state.json` (phase8_content + override_reason) | FIXED 2026-03-21 | Fix applied: all four locations corrected from "GATE_8 FULL PASS" → "GATE_5 FULL PASS". Filenames retained (reference integrity) with `filename_note` field added to frontmatter. Prevention: S003+ closure documents must use GATE_5 as lifecycle closure label. |

**log_entry | TEAM_100 | KNOWN_BUGS_REGISTER | KB_2026_03_21_70_INTAKE | GATE_8_NOMENCLATURE_DRIFT_IN_S003_CLOSURE_DOCS | MEDIUM | FIXED | 2026-03-21**
