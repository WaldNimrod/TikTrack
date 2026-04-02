---
id: TEAM_101_AOS_V3_ENTITY_DICTIONARY_GEMINI_v1.0.0
from: Team 101
to: Team 190 (review), Team 100 (review), Team 00
date: 2026-03-25
status: SUBMITTED_FOR_REVIEW
stage: SPEC_STAGE_1
engine: gemini
---

# AOS v3 — Entity Dictionary

This document provides the foundational data model for Agents_OS v3. It defines the core entities, their fields, relationships, and invariants. This specification serves as the single source of truth for all subsequent design stages.

## Summary of Architectural Decisions

All initial open questions from the mandate have been resolved as follows:

1.  **`Run` vs `Execution`:** The term `Run` was chosen as the aggregate root. It better represents an end-to-end lifecycle, whereas "Execution" could be misconstrued as a single, transient action.
2.  **`current_phase` on `Run`:** The `current_phase_id` will be a field directly on the `Run` entity. This is a strategic denormalization for performance, avoiding costly event log queries for a very common piece of state.
3.  **`correction_cycle_count` on `Run`:** This will be an explicit integer field on the `Run` entity. Like `current_phase`, this is a key piece of the aggregate's state and deriving it on-the-fly is inefficient.
4.  **`RoutingRule.priority`:** This will be an explicit integer field. An explicit priority is unambiguous and simpler to query and manage than a derived value based on rule specificity.
5.  **`Template.domain_id`:** The `domain_id` on the `Template` entity will be nullable. This allows for both global templates (where `domain_id` is `NULL`) and domain-specific overrides, providing maximum flexibility.
6.  **`Policy` Granularity:** Policies will have nullable `domain_id` and `gate_id` foreign keys. This supports global, domain-wide, and gate-specific policies, enabling a powerful, layered configuration.
7.  **`Event.actor_type`:** This will be a TEXT field with an enumerated set of values: `HUMAN`, `AGENT`, `SYSTEM`. The `SYSTEM` type is more encompassing than 'scheduler' and covers all non-human, non-agent automated actions (e.g., the Governance Engine).

## OPEN_QUESTIONS

There are no open questions at the conclusion of this specification stage. All initial architectural questions have been resolved.

---

## Entity: Domain
**Description:** A top-level container for a project, isolating its runs, teams, and policies.
**Storage:** DB
**Table name:** `domains`
**Aggregate root:** no

### Fields
| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|---|---|---|---|---|---|---|
| id | TEXT | no | | PK, ULID | System-generated unique identifier. | `01H8X...` |
| name | TEXT | no | | UNIQUE | Human-readable, unique name for the domain. | `agents_os` |
| description | TEXT | yes | | | A brief description of the domain's purpose. | `The OS for AI agents.` |
| created_at | DATETIME | no | `CURRENT_TIMESTAMP` | | Timestamp of creation. | `2026-03-25...` |
| updated_at | DATETIME | no | `CURRENT_TIMESTAMP` | | Timestamp of last update. | `2026-03-25...` |

### Invariants
1. A `Domain`'s `name` must be unique across the system.

### Relationships
- `has_many :runs`
- `has_many :teams`
- `has_many :policies`
- `has_many :templates`

### Notes
- A `Program` is assigned to exactly one domain (per `04_GATE_MODEL_PROTOCOL_v2.3.0.md`).

---

## Entity: Team
**Description:** Represents a functional unit (human or agent) responsible for specific tasks.
**Storage:** DB
**Table name:** `teams`
**Aggregate root:** no

### Fields
| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|---|---|---|---|---|---|---|
| id | TEXT | no | | PK, ULID | System-generated unique identifier. | `01H8X...` |
| team_id_str | TEXT | no | | UNIQUE | The canonical string identifier (e.g., "team_101"). | `team_101` |
| name | TEXT | no | | | The human-readable name of the team. | `IDE Architecture Authority` |
| default_engine | TEXT | yes | | | The default AI engine for this team (e.g., "Cursor"). | `Cursor Composer` |
| domain_id | TEXT | yes | | FK to `domains.id` | The default domain this team operates in. | `01H8X...` (agents_os) |
| created_at | DATETIME | no | `CURRENT_TIMESTAMP` | | Timestamp of creation. | `2026-03-25...` |

### Invariants
1. `team_id_str` must be unique and should align with `TEAMS_ROSTER_v1.0.0.json`.

### Relationships
- `belongs_to :domain` (optional, for default assignment)

---

## Entity: Gate
**Description:** A major, sequential checkpoint in a Run's lifecycle.
**Storage:** DB
**Table name:** `gates`
**Aggregate root:** no

### Fields
| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|---|---|---|---|---|---|---|
| id | TEXT | no | | PK, ULID | System-generated unique identifier. | `01H8X...` |
| gate_id_str | TEXT | no | | UNIQUE | The canonical string identifier (e.g., "GATE_1"). | `GATE_1` |
| name | TEXT | no | | | Human-readable name of the gate. | `SPEC_LOCK (LOD 400)` |
| sequence_order | INTEGER | no | | UNIQUE | Defines the position in the pipeline. | `1` |

### Invariants
1. `gate_id_str` must be unique.
2. `sequence_order` must be unique and sequential.

### Relationships
- `has_many :phases`

### Notes
- The active model is a 5-gate pipeline (GATE_0 to GATE_5). GATE_6, GATE_7, GATE_8 are legacy constructs and not part of the v3 runtime pipeline, per `ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md`.

---

## Entity: Phase
**Description:** A distinct sub-step within a Gate.
**Storage:** DB
**Table name:** `phases`
**Aggregate root:** no

### Fields
| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|---|---|---|---|---|---|---|
| id | TEXT | no | | PK, ULID | System-generated unique identifier. | `01H8X...` |
| gate_id | TEXT | no | | FK to `gates.id` | The parent Gate. | `01H8X...` (GATE_2) |
| phase_id_str | TEXT | no | | | The canonical string identifier (e.g., "2.2"). | `2.2` |
| name | TEXT | no | | | Human-readable name of the phase. | `Work Plan Production` |
| sequence_order | INTEGER | no | | | Defines the order within the parent Gate. | `3` |

### Invariants
1. `phase_id_str` must be unique within the scope of its parent `gate_id`.

### Relationships
- `belongs_to :gate`

### Notes
- GATE_2 has a canonical 5-phase sequence (2.1, 2.1v, 2.2, 2.2v, 2.3) per `AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`.

---

## Entity: RoutingRule
**Description:** A rule that determines the responsible team for a task based on run context.
**Storage:** DB
**Table name:** `routing_rules`
**Aggregate root:** no

### Fields
| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|---|---|---|---|---|---|---|
| id | TEXT | no | | PK, ULID | System-generated unique identifier. | `01H8X...` |
| team_id | TEXT | no | | FK to `teams.id` | The team to assign if the rule matches. | `01H8X...` (team_170) |
| domain_id | TEXT | yes | | FK to `domains.id` | Matches a specific domain. | `01H8X...` (agents_os) |
| gate_id | TEXT | yes | | FK to `gates.id` | Matches a specific gate. | `01H8X...` (GATE_1) |
| phase_id | TEXT | yes | | FK to `phases.id` | Matches a specific phase. | `01H8X...` (1.1) |
| process_variant | TEXT | yes | | | Matches a specific process variant. | `TRACK_FOCUSED` |
| finding_type | TEXT | yes | | | Matches a specific finding type from a failure. | `code_fix_single` |
| priority | INTEGER | no | `0` | | Higher numbers are evaluated first. | `100` |

### Invariants
1. A rule must have at least one matching criterion (`domain_id`, `gate_id`, etc.).

### Relationships
- `belongs_to :team`
- `belongs_to :domain` (optional)
- `belongs_to :gate` (optional)
- `belongs_to :phase` (optional)

---

## Entity: Run
**Description:** The aggregate root representing a single, end-to-end execution of a work package through the pipeline.
**Storage:** DB
**Table name:** `runs`
**Aggregate root:** yes

### Fields
| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|---|---|---|---|---|---|---|
| id | TEXT | no | | PK, ULID | System-generated unique identifier. | `01H8X...` |
| work_package_id | TEXT | no | | | The human-readable WP identifier. | `S003-P012-WP001` |
| domain_id | TEXT | no | | FK to `domains.id` | The domain this run belongs to. | `01H8X...` (agents_os) |
| current_gate_id | TEXT | no | | FK to `gates.id` | The gate currently being processed. | `01H8X...` (GATE_1) |
| current_phase_id | TEXT | no | | FK to `phases.id` | The phase currently being processed. | `01H8X...` (1.1) |
| status | TEXT | no | `'IN_PROGRESS'` | CHECK | The overall status of the run. | `IN_PROGRESS` |
| spec_brief | TEXT | yes | | | The initial specification brief. | `Build a governance engine...` |
| process_variant | TEXT | no | `'TRACK_FULL'` | CHECK | The process track for this run. | `TRACK_FOCUSED` |
| correction_cycle_count | INTEGER | no | `0` | | Number of times this run has failed and re-entered a gate. | `1` |
| created_at | DATETIME | no | `CURRENT_TIMESTAMP` | | Timestamp of creation. | `2026-03-25...` |
| updated_at | DATETIME | no | `CURRENT_TIMESTAMP` | | Timestamp of last state change. | `2026-03-25...` |

### Invariants
1. `status` must be one of: `IN_PROGRESS`, `COMPLETED`, `FAILED`, `ON_HOLD`. Transitions are governed by the Stage 2 State Machine spec.
2. `current_gate_id` must be one of the active gates (`GATE_0`..`GATE_5`) defined in the canonical gate model.
3. `work_package_id` must conform to `S{NNN}-P{NNN}-WP{NNN}` format per `04_GATE_MODEL_PROTOCOL_v2.3.0.md`.

### Relationships
- `belongs_to :domain`
- `has_many :events`

---

## Entity: Event
**Description:** An immutable record of a state change or significant action that occurred during a Run.
**Storage:** DB
**Table name:** `events`
**Aggregate root:** no

### Fields
| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|---|---|---|---|---|---|---|
| id | TEXT | no | | PK, ULID | System-generated unique identifier. | `01H8X...` |
| run_id | TEXT | no | | FK to `runs.id` | The parent Run for this event. | `01H8X...` |
| timestamp | DATETIME | no | `CURRENT_TIMESTAMP` | | The exact time the event occurred. | `2026-03-25...` |
| event_type | TEXT | no | | | The canonical type of the event. | `GATE_PASSED` |
| actor_type | TEXT | no | | CHECK | The type of actor that initiated the event. | `AGENT` |
| actor_id | TEXT | no | | | Identifier for the actor. | `team_190` |
| payload | TEXT | yes | | JSON | Structured data specific to the event type. | `{"from_gate": "GATE_1", "to_gate": "GATE_2"}` |
| metadata | TEXT | yes | | JSON | Additional context, like engine used or token count. | `{"token_count": 1024}` |

### Invariants
1. An `Event` is immutable. It cannot be updated or deleted after creation.
2. `actor_type` must be one of: `HUMAN`, `AGENT`, `SYSTEM`.
3. `event_type` should conform to the Event Taxonomy (see notes).

### Relationships
- `belongs_to :run`

### Notes
- **Event Taxonomy:** Per `ANNEX_D_AUDIT_MODEL_AND_EVENT_TAXONOMY`, `event_type` examples include: `RUN_STARTED`, `GATE_PASSED`, `GATE_FAILED`, `ARTIFACT_STORED`, `HUMAN_APPROVAL_RECEIVED`, `CORRECTION_CYCLE_STARTED`.
- **Actor IDs:** For `AGENT`, `actor_id` is a team ID (e.g., `team_190`). For `HUMAN`, it is a user ID (e.g., `nimrod`). For `SYSTEM`, it is a process name (e.g., `governance_engine`).
- **Payload Examples:**
  - `GATE_FAILED`: `{"gate_id": "GATE_2", "reason": "Spec incomplete", "finding_type": "FCP-2_spec", "route_to_gate": "GATE_2", "route_to_phase": "2.1v"}`
  - `ARTIFACT_STORED`: `{"gate_id": "GATE_1", "phase_id": "1.1", "artifact_type": "LLD400", "path": "_COMMUNICATION/team_170/..."}`

---

## Entity: Template
**Description:** A reusable blueprint for generating prompts or other artifacts.
**Storage:** DB
**Table name:** `templates`
**Aggregate root:** no

### Fields
| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|---|---|---|---|---|---|---|
| id | TEXT | no | | PK, ULID | System-generated unique identifier. | `01H8X...` |
| name | TEXT | no | | UNIQUE | A unique, human-readable name for the template. | `GATE_1_VALIDATION` |
| template_type | TEXT | no | `'PROMPT'` | CHECK | The type of artifact this template generates. | `PROMPT` |
| content | TEXT | no | | | The template body, likely using a templating language. | `Validate this LLD400: {{content}}` |
| domain_id | TEXT | yes | | FK to `domains.id` | If set, this template is specific to a domain. | `01H8X...` (agents_os) |

### Invariants
1. `name` must be unique.

### Relationships
- `belongs_to :domain` (optional)

---

## Entity: Policy
**Description:** A set of configurable rules governing resource usage, such as token limits or caching behavior.
**Storage:** DB
**Table name:** `policies`
**Aggregate root:** no

### Fields
| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|---|---|---|---|---|---|---|
| id | TEXT | no | | PK, ULID | System-generated unique identifier. | `01H8X...` |
| name | TEXT | no | | | A unique name for the policy. | `GATE_1_TOKEN_LIMIT` |
| policy_type | TEXT | no | | CHECK | The type of policy. | `TOKEN_LIMIT` |
| rules | TEXT | no | | JSON | The specific rules for this policy. | `{"max_tokens": 4096}` |
| domain_id | TEXT | yes | | FK to `domains.id` | Scopes the policy to a domain. | `01H8X...` (agents_os) |
| gate_id | TEXT | yes | | FK to `gates.id` | Scopes the policy to a gate. | `01H8X...` (GATE_1) |

### Invariants
1. `name` must be unique.

### Relationships
- `belongs_to :domain` (optional)
- `belongs_to :gate` (optional)

---

## Entity: Prompt
**Description:** A value object representing the fully-constructed text passed to an LLM.
**Storage:** Value Object
**Table name:** N/A
**Aggregate root:** no

### Fields
| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|---|---|---|---|---|---|---|
| identity_layer | TEXT | no | | | The part of the prompt defining the agent's role. | `You are Team 190...` |
| governance_layer | TEXT | no | | | The part defining system rules and constraints. | `Iron Rule: maskedLog...` |
| state_layer | TEXT | no | | | The part providing context from the current Run. | `The current gate is GATE_1...` |
| task_layer | TEXT | no | | | The specific instruction for the current task. | `Validate the following file...` |
| full_text | TEXT | no | | | The final, concatenated prompt text. | `You are Team 190...` |

### Invariants
1. A `Prompt` is immutable once constructed for a specific task.
2. It must be constructed from the four distinct layers in the correct order, per `AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`.

### Relationships
- N/A (transient value object)

---

**log_entry | TEAM_101 | ENTITY_DICTIONARY_SUBMITTED | v1.0.0 | 2026-03-25**