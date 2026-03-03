# KNOWN_BUGS_REGISTER_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** KNOWN_BUGS_REGISTER  
**version:** 1.0.0  
**owner:** Team 190 (validation intake); canonical procedure to be maintained by Team 170 once adopted  
**date:** 2026-03-03  
**last_updated:** 2026-03-03  
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
| status | OPEN \| IN_REMEDIATION \| READY_FOR_RECHECK \| CLOSED |
| owner_team | Implementation owner |
| orchestrator | Team 10 or owning orchestrator |
| summary | Short defect statement |
| evidence_path | Primary code or artifact evidence |
| remediation_mode | IMMEDIATE \| BATCHED |
| target_cycle | Current remediation round or note |

---

## Active Known Bugs

| bug_id | date_added | domain | scope_id | severity | status | owner_team | orchestrator | summary | evidence_path | remediation_mode | target_cycle |
|---|---|---|---|---|---|---|---|---|---|---|---|
| KB-2026-03-03-01 | 2026-03-03 | TIKTRACK | S002-P003-WP002 | BLOCKING | OPEN | Team 20 | Team 10 | `sync_intraday` may insert duplicate rows for the same ticker because fallback executes inside provider loop | `api/background/jobs/sync_intraday.py:114` | IMMEDIATE | Current rollback cycle |
| KB-2026-03-03-02 | 2026-03-03 | TIKTRACK | S002-P003-WP002 | BLOCKING | OPEN | Team 30 | Team 10 | Alerts edit form allows changing `target_type` / `alert_type` although API update contract does not persist them | `ui/src/views/data/alerts/alertsForm.js:77` | IMMEDIATE | Current rollback cycle |

---

## Evidence References

### KB-2026-03-03-01

- `api/background/jobs/sync_intraday.py:114`
- `api/background/jobs/sync_intraday.py:137`
- `scripts/sync_ticker_prices_intraday.py:110`
- `scripts/sync_ticker_prices_intraday.py:135`
- Team 190 blocking remediation routing:
  - `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_S002_P003_WP002_BLOCKING_BUG_REMEDIATION_PROMPT_v1.0.0.md`

### KB-2026-03-03-02

- `ui/src/views/data/alerts/alertsForm.js:77`
- `ui/src/views/data/alerts/alertsForm.js:153`
- `api/schemas/alerts.py:38`
- Team 190 blocking remediation routing:
  - `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_S002_P003_WP002_BLOCKING_BUG_REMEDIATION_PROMPT_v1.0.0.md`

---

## Maintenance Note

The canonical process for this register must be added by Team 170 to the central governance procedure set.

Until that procedure update is completed:
1. Team 190 may add validated bugs here,
2. Team 10 must use this register as the reference for batched remediation rounds,
3. Team 170 must preserve this file as the canonical bug ledger.

---

**log_entry | TEAM_190 | KNOWN_BUGS_REGISTER | v1.0.0_CREATED | 2026-03-03**
