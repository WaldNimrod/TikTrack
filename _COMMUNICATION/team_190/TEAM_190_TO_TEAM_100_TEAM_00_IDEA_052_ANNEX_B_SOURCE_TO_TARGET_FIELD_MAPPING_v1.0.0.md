---
id: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_B_SOURCE_TO_TARGET_FIELD_MAPPING_v1.0.0
historical_record: true
from: Team 190
to: Team 100
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-22
status: ATTACHED_TO_IDEA_052
idea_id: IDEA-052
type: ANNEX
subject: Source-to-target field mapping for DB-first migration---

# Annex B — Source-to-Target Field Mapping

## B.1 Runtime state mapping

| Source file.field | Target table.field | Rule |
|---|---|---|
| `pipeline_state_*.json.project_domain` | `pipeline_state.domain_id` | map via domains table |
| `work_package_id` | `pipeline_state.work_package_id` | FK to work_packages |
| `stage_id` | `pipeline_state.stage_id` | denormalize + derive from WP |
| `current_gate` | `pipeline_state.current_gate` | canonical enum |
| `current_phase` | `pipeline_state.current_phase` | nullable text |
| `process_variant` | `pipeline_state.process_variant` | canonical enum |
| `gate_state` | `pipeline_state.gate_state` | nullable enum |
| `gates_completed[]` | `pipeline_state.gates_completed_json` OR child table | choose in LLD400 |
| `gates_failed[]` | `pipeline_state.gates_failed_json` OR child table | choose in LLD400 |
| `last_blocking_findings` | `pipeline_state.last_blocking_findings` | text |
| `last_blocking_gate` | `pipeline_state.last_blocking_gate` | nullable gate enum |
| `remediation_cycle_count` | `pipeline_state.remediation_cycle_count` | integer |
| `finding_type` | `pipeline_state.finding_type` | nullable enum |
| `fcp_level` | `pipeline_state.fcp_level` | nullable enum |
| `return_target_team` | `pipeline_state.return_target_team` | nullable team FK |
| `lod200_author_team` | `pipeline_state.lod200_author_team` | nullable team FK |
| `last_updated` | `pipeline_state.updated_at` | UTC timestamp |

## B.2 Event mapping

| Source JSONL field | Target table.field |
|---|---|
| `timestamp` | `pipeline_events.occurred_at` |
| `pipe_run_id` | `pipeline_events.pipe_run_id` |
| `event_type` | `pipeline_events.event_type` |
| `domain` | `pipeline_events.domain_id` |
| `work_package_id` | `pipeline_events.work_package_id` |
| `gate` | `pipeline_events.gate_id` |
| `agent_team` | `pipeline_events.actor_team_id` |
| `severity` | `pipeline_events.severity` |
| `description` | `pipeline_events.description` |
| `metadata` | `pipeline_events.metadata_json` |
| (new) n/a | `pipeline_events.prev_hash` |
| (new) n/a | `pipeline_events.event_hash` |
| (new) n/a | `pipeline_events.signature` |

## B.3 Governance mapping (proposed)

| Governance source | Target table | Canonicality note |
|---|---|---|
| Program registry markdown | `programs` | operational canonical in DB, markdown as publication view |
| WP registry markdown | `work_packages` | operational canonical in DB, markdown as publication view |
| WSM runtime block | `wsm_runtime_projection` or direct from state | runtime canonical in DB |

---

**log_entry | TEAM_190 | IDEA_052_ANNEX_B | FIELD_MAPPING_COMPLETE | v1.0.0 | 2026-03-22**
