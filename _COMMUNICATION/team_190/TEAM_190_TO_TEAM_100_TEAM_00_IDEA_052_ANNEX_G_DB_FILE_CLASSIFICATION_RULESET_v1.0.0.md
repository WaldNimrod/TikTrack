---
id: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_G_DB_FILE_CLASSIFICATION_RULESET_v1.0.0
historical_record: true
from: Team 190
to: Team 100
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-22
status: ATTACHED_TO_IDEA_052
idea_id: IDEA-052
type: ANNEX
subject: Deterministic DB-vs-FILE classification rules and mapping example---

# Annex G — Deterministic DB vs FILE Classification Ruleset

## G.1 Decision goal

Provide a simple deterministic rule set:
- If data is part of AOS system behavior/entities/processes -> `DB`
- If data is team work artifact/communication/prompt/spec package -> `FILE`

## G.2 Mandatory classification parameters (minimal set)

| Parameter | Enum | Meaning |
|---|---|---|
| `behavioral_scope` | `AOS_SYSTEM` / `WORK_ARTIFACT` | Does this define runtime behavior/entities/processes of AOS? |
| `writer_class` | `MANAGEMENT_UI` / `AOS_SYSTEM_TEAM` / `EXTERNAL_AGENTS` | Who writes/changes this data? |
| `artifact_type` | `STATE` / `CONFIG` / `ROUTING` / `REGISTRY_OP` / `PROMPT` / `COMMUNICATION` / `REPORT` / `PLAN` / `SPEC_DOC` | Technical role of item |
| `runtime_dependency` | `true` / `false` | Is runtime operation dependent on this value? |

## G.3 Deterministic rules (execution order)

1. If `behavioral_scope=AOS_SYSTEM` -> `canonical_medium=DB`.
2. Else if `writer_class in {MANAGEMENT_UI, AOS_SYSTEM_TEAM}` and `runtime_dependency=true` -> `canonical_medium=DB`.
3. Else if `behavioral_scope=WORK_ARTIFACT` -> `canonical_medium=FILE`.
4. Else if `writer_class=EXTERNAL_AGENTS` or `artifact_type in {PROMPT, COMMUNICATION, REPORT, PLAN, SPEC_DOC}` -> `canonical_medium=FILE`.
5. Else -> `canonical_medium=REVIEW_REQUIRED` (blocked until resolved).

## G.4 Operational enforcement

1. No dual-canonicality per item (`DB` xor `FILE`).
2. `DB` items may have human-readable file mirrors, but mirror is non-canonical.
3. `FILE` work artifacts are never mutated via runtime control-plane API.
4. Any `REVIEW_REQUIRED` item blocks lock approval.

## G.5 Mapping example (initial AOS sample)

| data_id | behavioral_scope | writer_class | artifact_type | runtime_dependency | canonical_medium | rationale |
|---|---|---|---|---|---|---|
| `pipeline_state.current_gate` | AOS_SYSTEM | AOS_SYSTEM_TEAM | STATE | true | DB | runtime gate transition state |
| `pipeline_state.current_phase` | AOS_SYSTEM | AOS_SYSTEM_TEAM | STATE | true | DB | runtime phase orchestration |
| `pipeline_state.process_variant` | AOS_SYSTEM | MANAGEMENT_UI | CONFIG | true | DB | behavior-affecting control input |
| `team_engine_config` | AOS_SYSTEM | MANAGEMENT_UI | CONFIG | true | DB | management-controlled system configuration |
| `phase_routing` | AOS_SYSTEM | AOS_SYSTEM_TEAM | ROUTING | true | DB | execution routing source |
| `PHOENIX_PROGRAM_REGISTRY (operational fields)` | AOS_SYSTEM | AOS_SYSTEM_TEAM | REGISTRY_OP | true | DB | operational registry state |
| `TEAM_61_TO_TEAM_90_...REVIEW_PROMPT...md` | WORK_ARTIFACT | EXTERNAL_AGENTS | PROMPT | false | FILE | team communication artifact |
| `TEAM_50_...QA_REPORT...md` | WORK_ARTIFACT | EXTERNAL_AGENTS | REPORT | false | FILE | evidence/report artifact |
| `LOD200/LLD400 package docs` | WORK_ARTIFACT | EXTERNAL_AGENTS | SPEC_DOC | false | FILE | spec documents, not runtime state |

## G.6 Output schema for catalog entries

Each catalog record must store:
`data_id`, `behavioral_scope`, `writer_class`, `artifact_type`, `runtime_dependency`, `canonical_medium`, `rationale`, `owner_team`, `review_status`.

---

**log_entry | TEAM_190 | IDEA_052_ANNEX_G | DB_FILE_CLASSIFICATION_RULESET_DEFINED | v1.0.0 | 2026-03-22**
