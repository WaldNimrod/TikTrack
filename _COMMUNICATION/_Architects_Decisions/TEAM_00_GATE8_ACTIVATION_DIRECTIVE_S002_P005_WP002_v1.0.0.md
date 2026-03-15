---
project_domain: AGENTS_OS
id: TEAM_00_GATE8_ACTIVATION_DIRECTIVE_S002_P005_WP002_v1.0.0
from: Team 00 (Chief Architect)
to: Team 170 (GATE_8 executor — AGENTS_OS)
cc: Team 90, Team 10, Team 61, Team 51, Team 100, Team 190
date: 2026-03-10
status: ACTION_REQUIRED
gate_id: GATE_8
work_package_id: S002-P005-WP002
trigger: GATE_7 PASS (Team 51 delegated verification); TEAM_00_TO_TEAM_90_S002_P005_WP002_GATE7_PASS_AND_GATE8_ACTIVATION_TRIGGER_v1.0.0
authority: Chief Architect override for immediate GATE_8 execution; Team 90 retains validation authority.
---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP002 |
| gate_id | GATE_8 |
| phase_owner | Team 90 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | AGENTS_OS |

---

## §1) Scope and objective

Execute **GATE_8 DOCUMENTATION_CLOSURE (AS_MADE_LOCK)** for `S002-P005-WP002` (Pipeline Governance — PASS_WITH_ACTION micro-cycle).

Objective: produce deterministic closure package, archive one-off evidence, and submit canonical validation request to Team 90.

---

## §2) Mandatory deliverables (all required)

Create and submit under `_COMMUNICATION/team_170/`:

1. `TEAM_170_S002_P005_WP002_AS_MADE_REPORT.md`
2. `TEAM_170_S002_P005_WP002_DEVELOPER_GUIDES_UPDATE_REPORT.md`
3. `TEAM_170_S002_P005_WP002_COMMUNICATION_CLEANUP_REPORT.md`
4. `TEAM_170_S002_P005_WP002_ARCHIVE_REPORT.md`
5. `TEAM_170_S002_P005_WP002_CANONICAL_EVIDENCE_CLOSURE_CHECK.md`

Each artifact must include full identity header and explicit evidence-by-path.

---

## §3) Archive execution (required)

Create stage archive root:

`_COMMUNICATION/99-ARCHIVE/<execution-date>/S002_P005_WP002/`

Required archive content:
- `ARCHIVE_MANIFEST.md`
- Closure references for one-off evidence from `team_10`, `team_51`, `team_61`, `team_90`, plus any cycle-specific additions

Do not archive canonical structural/governance sources that must remain active.

---

## §4) Knowledge promotion requirements (WP002 scope)

In `DEVELOPER_GUIDES_UPDATE_REPORT` include, at minimum:
- As-built behavior summary for Pipeline Governance (Help Modal 4 tabs, Three Modes, Domain Switch, context banner)
- Runtime/ops notes for pipeline_run.sh, pipeline.py, PIPELINE_DASHBOARD.html
- Canonical pointers to AGENTS_OS_V2_OPERATING_PROCEDURES, gate rules, team role mapping
- Known caveats carried to future cycles (if any), with clear non-blocking status

---

## §5) Submission back to Team 90 (required)

After completing §2–§4, issue:

`_COMMUNICATION/team_170/TEAM_170_TO_TEAM_90_S002_P005_WP002_GATE8_VALIDATION_REQUEST.md`

The request must include:
- links to all five deliverables,
- archive root + manifest path,
- declaration that no mandatory lifecycle evidence is missing.

---

## §6) PASS criteria (Team 90 validation)

Team 90 will issue GATE_8 PASS only if:
1. all five deliverables exist and are internally consistent,
2. archive structure is complete and deterministic,
3. no mandatory lifecycle evidence is missing,
4. cleanup/keep decisions are explicit and justified,
5. closure package is canonically routable.

---

## §7) Evidence chain (input)

| # | Artifact | Path |
|---|----------|------|
| 1 | GATE_7 browser verification | `_COMMUNICATION/team_51/TEAM_51_S002_P005_WP002_GATE7_BROWSER_VERIFICATION_v1.0.0.md` |
| 2 | GATE_7 trigger | `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_90_S002_P005_WP002_GATE7_PASS_AND_GATE8_ACTIVATION_TRIGGER_v1.0.0.md` |
| 3 | Design backlog | `_COMMUNICATION/team_100/TEAM_100_PASS_WITH_ACTION_PIPELINE_GOVERNANCE_BACKLOG_v1.0.0.md` |

---

**log_entry | TEAM_00 | GATE8_ACTIVATION_DIRECTIVE | S002_P005_WP002 | ISSUED_TO_TEAM_170 | 2026-03-10**
