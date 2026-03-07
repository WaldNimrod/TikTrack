---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_190_TO_TEAM_10_TEAM_00_TEAM_100_CLOUD_AGENT_SCAN_OPEN_ITEMS_REMEDIATION_PROMPT
from: Team 190 (Constitutional Validation)
to: Team 10 (Execution Orchestrator)
cc: Team 00, Team 100, Team 170, Team 20, Team 30, Team 50, Team 60, Team 90
date: 2026-03-03
status: ACTION_REQUIRED
gate_id: GOVERNANCE_PROGRAM
scope: CLOUD_AGENT_QUALITY_SCAN_OPEN_ITEMS
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | SHARED |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Purpose

This prompt converts the still-open findings from the Cursor Cloud Agent quality scan into one governed remediation program.

## 2) Intake Basis

Source reports:

1. `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md`
2. `_COMMUNICATION/team_190/CLOUD_AGENT_VALIDATION_REPORT_2026-03-03.md`
3. `_COMMUNICATION/team_00/CLOUD_AGENT_RECURRING_PROCESSES_PROPOSAL_2026-03-03.md`

Merged tooling and test assets:

1. `AGENTS.md`
2. `ui/.eslintrc.cjs`
3. `api/mypy.ini`
4. `tests/unit/test_auth_service.py`
5. `tests/unit/test_cash_flows_service.py`
6. `tests/unit/test_trading_accounts_service.py`

## 3) What Is Already Closed

Do **not** reopen the two currently closed known-bug records:

1. `KB-2026-03-03-01` — `sync_intraday` duplicate fallback bug
2. `KB-2026-03-03-02` — alerts edit-mode UI/API mismatch

These are already closed in:

`documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md`

## 4) Open Remediation Scope From Cloud Agent Scan

### Track A — Canonical bug intake (Team 170 + Team 190)

Register the remaining scan findings into the canonical known-bugs process.

Initial intake set:

- `KB-001`
- `KB-002`
- `KB-003`
- `KB-004`
- `KB-005`
- `KB-006`
- `KB-007`
- `KB-008`
- `KB-009`
- `KB-010`
- `KB-011`
- `KB-012`
- `KB-013`
- `KB-014`
- `KB-015`
- `KB-016`
- `KB-017`
- `KB-018`
- `KB-019`
- `KB-020`
- `KB-021`

For each item, Team 170 + Team 190 must ensure:

1. canonical bug ID record exists,
2. owner team is assigned,
3. severity is confirmed,
4. remediation mode is set (`IMMEDIATE` / `BATCHED`),
5. target cycle is declared.

### Track B — Team 190 validation of merged tooling

Team 190 must validate:

1. `ui/.eslintrc.cjs` against frontend standards and current lint-enforcement policy
2. `tests/unit/test_auth_service.py` against testing standards
3. `tests/unit/test_cash_flows_service.py` against testing standards
4. `tests/unit/test_trading_accounts_service.py` against testing standards

Output required:

- `PASS`
- `PASS_WITH_ACTIONS`
- or `BLOCK`

per item group, with findings if needed.

### Track C — Immediate critical/high routing (Team 10 orchestration)

Team 10 must open an immediate remediation lane for the highest-priority items:

1. `KB-001`
2. `KB-002`
3. `KB-007`
4. `KB-010`
5. `KB-012`
6. `KB-013`
7. `KB-015`
8. `KB-016`
9. `KB-020`

### Track D — Architecture / governance decisions (Team 00 + Team 100)

Architectural lock is required for:

1. DDL reconciliation (`KB-001`, `KB-002`, `KB-003`)
2. CI/CD PR pipeline (`KB-015`)
3. Test Suite A drift (`KB-004`, `KB-005`)
4. dependency remediation policy (`KB-010`, `KB-011`, `KB-012`, `KB-013`)
5. pre-commit enforcement model (`KB-016`)
6. recurring quality processes proposal adoption (from `CLOUD_AGENT_RECURRING_PROCESSES_PROPOSAL_2026-03-03.md`)

## 5) Ownership Routing

| Item Class | Primary Owner | Supporting Teams |
|---|---|---|
| Canonical bug intake | Team 170 | Team 190 |
| Test / lint validation | Team 190 | Team 30 |
| Backend / schema / DDL | Team 20 | Team 10 |
| Frontend lint / UI issues | Team 30 | Team 10 |
| CI/CD / hooks / dependency tooling | Team 60 | Team 10 |
| QA reruns | Team 50 | Team 90 |
| Architectural ratification | Team 00 / Team 100 | Team 170 / Team 190 |

## 6) Required Deliverables

1. Team 170:
   - canonical KB intake update for the remaining Cloud Agent findings
2. Team 190:
   - validation result for unit tests + ESLint config
3. Team 10:
   - orchestration package for immediate critical/high items
4. Team 00 / Team 100:
   - architectural decision package for process / DDL / CI / dependency items

## 7) Final Rule

No Cloud Agent finding becomes `CLOSED` by merge alone.

Closure requires all three:

1. canonical registration,
2. owning-team remediation,
3. relevant validation confirmation.

---

**log_entry | TEAM_190 | CLOUD_AGENT_SCAN_OPEN_ITEMS_REMEDIATION_PROMPT | ACTION_REQUIRED | 2026-03-03**
