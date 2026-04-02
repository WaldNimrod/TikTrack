---
id: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_A_CURRENT_STATE_DATA_INVENTORY_v1.0.0
historical_record: true
from: Team 190
to: Team 100
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-22
status: ATTACHED_TO_IDEA_052
idea_id: IDEA-052
type: ANNEX
subject: Current-state data inventory for AOS control plane---

# Annex A — Current State Data Inventory

## A.1 Core control-plane artifacts

| Data area | Current source | Format | Current writer | Current readers | Notes |
|---|---|---|---|---|---|
| Runtime state (AOS) | `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` | JSON | Orchestrator (`state.py`) | Dashboard/monitor/scripts | Domain-specific state file |
| Runtime state (TikTrack) | `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` | JSON | Orchestrator (`state.py`) | Dashboard/monitor/scripts | Domain-specific state file |
| Event ledger | `_COMMUNICATION/agents_os/logs/pipeline_events.jsonl` | JSONL | `log_events.py` | Dashboard/monitor/audit scripts | Append-only, unsigned |
| State projection | `_COMMUNICATION/agents_os/STATE_VIEW.json` | JSON | `pipeline.py::_write_state_view` | Dashboard | Derived view |
| Routing projection | `_COMMUNICATION/agents_os/phase_routing.json` | JSON | `pipeline.py::_write_state_view` | UI config/read model | Derived from internal table |
| Team runtime overrides | `_COMMUNICATION/agents_os/team_engine_config.json` | JSON | API route (`PUT /api/config/team-engine`) | UI + orchestrator | Mutable user-facing config |
| Idea pipeline | `_COMMUNICATION/PHOENIX_IDEA_LOG.json` | JSON | `idea_submit.sh` / manual update | roadmap/dashboard/scripts | Open/in_exec/decided lifecycle |
| WSM operational state | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` | Markdown | `wsm_writer.py` + manual governance operations | observers, humans, docs | Mixed runtime + narrative history |
| Program registry | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` | Markdown | governance process | Pipeline pre-check + humans | Canonical governance catalog |
| WP registry | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md` | Markdown | governance process | Pipeline pre-check + humans | Canonical governance catalog |
| Team roster | `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json` | JSON | governance process | Teams UI + humans | Canonical team metadata source |

## A.2 Snapshot of active runtime context

| Domain | WP | Gate | Phase | Variant |
|---|---|---|---|---|
| agents_os | `S003-P011-WP099` | `GATE_3` | `3.1` | `TRACK_FOCUSED` |
| tiktrack | `S003-P013-WP001` | `GATE_2` | `2.2` | `TRACK_FOCUSED` |

## A.3 Key operational risks from current inventory

1. Split operational truth between JSON state and Markdown governance state.
2. Event ledger integrity is weak against tampering assumptions.
3. Team/runtime configuration consistency depends on cross-file discipline.

---

**log_entry | TEAM_190 | IDEA_052_ANNEX_A | DATA_INVENTORY_COMPLETE | v1.0.0 | 2026-03-22**
