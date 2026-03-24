---
id: TEAM_100_FOLDER_INDEX_v1.0.0
date: 2026-03-24
owner: Team 00 (System Designer)
status: ACTIVE — entry point for incoming Team 100 sessions
---

# Team 100 Folder Index

**Start here.** This index is the canonical entry point to `_COMMUNICATION/team_100/`.

---

## Active Files (read these)

| File | Purpose | Priority |
|------|---------|----------|
| **This file** | Folder orientation | READ FIRST |
| `DUAL_GATE_6_PROTOCOL_TEMPLATE_v1.0.0.md` | Protocol template for GATE_6 dual-domain reviews | HIGH |
| `TEAM_100_S003_P013_WP001_GATE_2_VERDICT_v1.0.0.md` | Most recent GATE_2 verdict (S003-P013) | REFERENCE |
| `monitor/` | Active monitoring artifacts | AS NEEDED |

---

## Key Documents Elsewhere (always read before activating)

| Document | Path | Purpose |
|----------|------|---------|
| **Handoff Report** | `_COMMUNICATION/team_00/TEAM_00_HANDOFF_REPORT_S003_P016_CLOSURE_S003_P004_READINESS_v1.0.0.md` | Current state + S003-P004 readiness — READ FIRST |
| **S003-P004 Runbook** | `_COMMUNICATION/team_00/S003_P004_ACTIVATION_RUNBOOK_v1.0.0.md` | Step-by-step activation for next WP |
| **WSM** | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` | Policy (no COS — runtime state is in pipeline_state_*.json) |
| **Gate lifecycle** | `documentation/docs-governance/01-FOUNDATIONS/GATE_LIFECYCLE_DESCRIPTION_AND_OWNERS_v1.1.0.md` | Gate model + Team 100 authority at GATE_2/GATE_6 |
| **P016 Directive** | `_COMMUNICATION/team_00/TEAM_00_ARCHITECT_DIRECTIVE_PIPELINE_GIT_ISOLATION_v1.0.0.md` | COS extraction architectural record |
| **Pipeline state (TikTrack)** | `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` | Runtime SSOT — current gate/WP/stage |
| **Pipeline state (AOS)** | `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` | Runtime SSOT — AOS domain |

---

## Archived Files (do not use — moved to 99-ARCHIVE)

All files from S002, S003-P001 through S003-P012, old WP/BN1/DM era, and legacy bundles were moved to:

```
_COMMUNICATION/99-ARCHIVE/2026-03-24_TEAM100_CLEANUP/
```

These are preserved as historical record only. They contain no active mandates or decisions
relevant to S003-P004 or later work.

---

## Team 100 Identity

| Field | Value |
|-------|-------|
| Role | Chief System Architect (delegated by Team 00 / Nimrod) |
| Engine | Claude Code |
| Gate authority | GATE_2 (Intent gate) + GATE_6 (Reality gate) — both delegated |
| Domain architects | Team 101 (AOS), Team 102 (TikTrack, registration only as of S003-P013) |
| Writes to | `_COMMUNICATION/team_100/` |
| Runtime state source | `pipeline_state_tiktrack.json` / `pipeline_state_agentsos.json` (NOT WSM) |
| Active program | S003-P004 — User Tickers (D33, TikTrack) |

---

## Current Open Mandates (assigned from Team 00)

| ID | Description | Assigned to | Status |
|----|-------------|-------------|--------|
| M1 | Portfolio sync: remove `_pick` heuristic, iterate domains independently | Team 191 | Open |
| M2 | Consolidate portfolio proxy to `wsm_runtime_proxy.py` | Team 10 | Open |
| M3 | Fix `build_portfolio_snapshot.py` header (still references COS) | Team 191 | Open |
| M4 | KB84 integration test: add fixture with active WP + GATE_3 | Team 101 | Open |

---

**log_entry | TEAM_00 | TEAM_100_FOLDER_INDEX | CREATED | 2026-03-24**
