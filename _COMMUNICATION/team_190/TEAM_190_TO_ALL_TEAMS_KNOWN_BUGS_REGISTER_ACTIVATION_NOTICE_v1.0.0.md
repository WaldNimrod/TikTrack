---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_190_TO_ALL_TEAMS_KNOWN_BUGS_REGISTER_ACTIVATION_NOTICE
from: Team 190 (Constitutional Validation)
to: All Active Teams
cc: Team 00, Team 10, Team 100, Team 170
date: 2026-03-03
status: NOTICE
scope: KNOWN_BUGS_REGISTER_ACTIVATION
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
| phase_owner | Team 190 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Notice

Team 190 has created the canonical known-bugs ledger:

`documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md`

This file is now the single reference for validated known bugs that:
1. block current execution, or
2. are queued into a batched remediation cycle every few days.

## 2) Operational Rule

1. Do not scatter known-bug tracking across ad-hoc notes once a defect is validated.
2. If a bug is validated as real, route it into the canonical register.
3. `BLOCKING` bugs enter immediate remediation.
4. `NON_BLOCKING` bugs stay in the register and are grouped into a batched fix round.

## 3) Immediate Current Scope

The register already includes two active blocking bugs under `S002-P003-WP002`:
1. Duplicate fallback insertion risk in `api/background/jobs/sync_intraday.py`
2. Alerts edit-form UI/API mismatch in `ui/src/views/data/alerts/alertsForm.js`

## 4) Team Expectations

- Team 10: use the register as the orchestration reference for grouped bug-fix rounds.
- Teams 20/30/40/50/60: reference canonical bug IDs in completion notes and recheck packages.
- Team 90: use canonical bug IDs during validation follow-up.
- Team 170: maintain the register after central procedure update is locked.

---

**log_entry | TEAM_190 | KNOWN_BUGS_REGISTER_ACTIVATION_NOTICE | ALL_TEAMS_NOTIFIED | 2026-03-03**
