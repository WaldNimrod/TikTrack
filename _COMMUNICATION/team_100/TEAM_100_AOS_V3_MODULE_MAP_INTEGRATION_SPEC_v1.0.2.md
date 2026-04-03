---
id: TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.2
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 190 (Reviewer), Team 00 (Gate Approver)
date: 2026-03-28
stage: SPEC_STAGE_8
supersedes: TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1
correction_cycle: 2
ssot_basis:
  - TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
  - TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md
  - TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md
  - TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md
  - TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md
  - TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md
  - TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.2.md
status: SUBMITTED_FOR_REVIEW
reviewer: team_190
gate_approver: team_00
architectural_decisions_carried: AD-S5-01, AD-S5-02, AD-S5-03, AD-S5-05, AD-S6-01, AD-S6-02, AD-S6-03, AD-S6-04, AD-S6-05, AD-S6-06, AD-S6-07, AD-S7-01
oq_closures: OQ-S3-02, OQ-S3-03, OQ-S3-04, OQ-S3-05, OQ-S7-01
ddl_errata_status: DDL-ERRATA-01 pending (DDL v1.0.1 = SSOT at time of writing)
note: FINAL SPEC STAGE — gate approval unlocks BUILD
remediation_summary: |
  CC1 fixes F-01 (UC-09/10 shared endpoint semantics) and F-02 (UC-04/05 shared endpoint semantics).
  Root cause: UC Catalog defines inter-UC routing signals (MAX_CYCLES_REACHED, INSUFFICIENT_AUTHORITY)
  as error codes within individual UCs. Stage 8 shared endpoints internalize this branching — these
  signals become internal branch decisions, not API-level errors. §3.12 and §4.3 corrected to reflect
  unified endpoint semantics. §3.5 machine.py raises unchanged (internal exceptions caught by use_cases.py).

---

# AOS v3 — Module Map + Integration Spec (Stage 8) — v1.0.1

---

## §1 — Directory Structure

```
agents_os_v3/
├── definition.yaml                         # Stage 1 | SSOT seed data: gates, phases, teams, domains, routing_rules, policies
├── seed.py                                 # Stage 1 | Imports definition.yaml → DB initialization; D-03 validation
├── modules/
│   ├── definitions/                        # Stage 1 | Entities, queries, constants
│   │   ├── __init__.py
│   │   ├── models.py                       # Stage 1 | Dataclasses: Run, RunStatus, Team, Gate, Phase, Domain, PipelineRole,
│   │   │                                   #            RoutingRule, Assignment, GateRoleAuthority, Event, Template, Policy,
│   │   │                                   #            AssembledPrompt (VO), ResolvedRouting, SnapshotSchema
│   │   ├── constants.py                    # Stage 1 | Enums: RunStatus, ActorType, EventType, ProcessVariant, ScopeType,
│   │   │                                   #            ExecutionMode, AssignmentStatus, OverrideAction
│   │   └── queries.py                      # Stage 1 | Read-only DB queries: get_gate, get_phase, get_team, get_domain,
│   │                                       #            get_pipeline_role, list_gates, list_phases_for_gate, is_final_phase
│   ├── state/                              # Stage 2 | State machine transitions, run lifecycle
│   │   ├── __init__.py
│   │   ├── machine.py                      # Stage 2 | Transition handlers: T01–T12 + A01–A10E (AD-S7-01: atomic TX)
│   │   ├── repository.py                   # Stage 2 | runs table CRUD: create_run, update_run_status, get_run, get_active_run
│   │   │                                   #            + pipeline_state.json projection write
│   │   └── models.py                       # Stage 2 | Run response models, snapshot models, state projection types
│   ├── routing/                            # Stage 5 | Actor resolution
│   │   ├── __init__.py
│   │   └── resolver.py                     # Stage 5 | resolve_actor(): sentinel + standard resolution (AD-S5-01/02/05)
│   ├── prompting/                          # Stage 6 | 4-layer prompt assembly
│   │   ├── __init__.py
│   │   ├── builder.py                      # Stage 6 | assemble_prompt() (AD-S6-01/02/03/07)
│   │   ├── cache.py                        # Stage 6 | L2/L4 version-keyed cache (AD-S6-01)
│   │   └── templates.py                    # Stage 6 | Templates table queries: get_active_template, update_template (DDL-ERRATA-01)
│   ├── audit/                              # Stage 7 | Event ledger
│   │   ├── __init__.py
│   │   └── ledger.py                       # Stage 7 | append_event(), query_events() (AD-S7-01)
│   ├── policy/                             # Stage 6 | Policy resolution
│   │   ├── __init__.py
│   │   └── settings.py                     # Stage 6 | get_policy_value(), get_governance_version(), list_policies, update_policy
│   ├── management/                         # Stage 3 | UC-01..UC-14 + admin CRUD (OQ-S3-02)
│   │   ├── __init__.py
│   │   ├── use_cases.py                    # Stage 3 | UC-01..UC-14 implementations
│   │   └── api.py                          # Stage 8 | HTTP layer (FastAPI): /api/* endpoints
│   └── governance/                         # §ו.6   | WP artifact + archive management
│       ├── __init__.py
│       ├── artifact_index.py               # §ו.6   | CRUD for wp_artifact_index table
│       └── archive.py                      # §ו.6   | Archive manifest generation; Team 191 integration
├── cli/
│   └── pipeline_run.sh                     # Stage 8 | v3 CLI wrapper: start run, check status, advance gate
└── ui/
    ├── index.html                          # Stage 8 | Pipeline View (/)
    ├── history.html                        # Stage 8 | History View (/history)
    ├── config.html                         # Stage 8 | Configuration (/config)
    ├── app.js                              # Stage 8 | API client: reads /api/state → renders; NO business logic
    └── style.css                           # Stage 8 | Styles
```

**Governance module note:** `governance/` module implements `wp_artifact_index` CRUD per Spec Process Plan §ו.5 addendum. The `archive.py` generates archive manifests for Team 191 cleanup operations.

**definition.yaml note:** This is the canonical seed data source. `seed.py` reads it and populates all reference tables (teams, domains, gates, phases, pipeline_roles, routing_rules, gate_role_authorities, policies). D-03 validation (`team_00` existence) runs at boot.

**DDL-ERRATA-01 note:** DDL v1.0.1 is the SSOT at time of writing. `templates.py` enforces the `is_active=1` uniqueness invariant at the application layer until the partial unique index is applied by Team 111.

---

## §2 — UC Implementation Map

| UC | Name | SM Ref | Module | Function | Delegates To | Notes |
|---|---|---|---|---|---|---|
| **UC-01** | InitiateRun | T01 | management/use_cases.py | `initiate_run(work_package_id, domain_id, process_variant, execution_mode)` | routing/resolver.py, state/repository.py, audit/ledger.py | Atomic TX: INSERT run + resolve routing + create assignment + append RUN_INITIATED event |
| **UC-02** | AdvanceGate | T02 | management/use_cases.py | `advance_gate(run_id, actor_team_id, notes)` | state/machine.py, state/repository.py, audit/ledger.py | Status=IN_PROGRESS, non-final phase → PHASE_PASSED |
| **UC-03** | CompleteRun | T03 | management/use_cases.py | `advance_gate(run_id, actor_team_id, notes)` | state/machine.py, state/repository.py, audit/ledger.py | Same entry point as UC-02; internal branch when `is_final_phase=TRUE` → RUN_COMPLETED |
| **UC-04** | FailGate (Blocking) | T04 | management/use_cases.py | `fail_gate(run_id, actor_team_id, reason, findings)` | state/machine.py, state/repository.py, audit/ledger.py | G03 check = TRUE → CORRECTION + GATE_FAILED_BLOCKING |
| **UC-05** | FailGate (Advisory) | T05 | management/use_cases.py | `fail_gate(run_id, actor_team_id, reason, findings)` | state/machine.py, audit/ledger.py | G03 check = FALSE → no state change + GATE_FAILED_ADVISORY |
| **UC-06** | HumanApprove | T06 | management/use_cases.py | `approve_gate(run_id, actor_team_id, approval_notes)` | state/machine.py, state/repository.py, audit/ledger.py | G04: is_human_gate=1 AND actor=team_00 → GATE_APPROVED |
| **UC-07** | PauseRun | T07 | management/use_cases.py | `pause_run(run_id, actor_team_id, pause_reason)` | state/machine.py, state/repository.py, audit/ledger.py | Atomic TX: snapshot write + status=PAUSED + RUN_PAUSED |
| **UC-08** | ResumeRun | T08 | management/use_cases.py | `resume_run(run_id, actor_team_id, resume_notes)` | state/machine.py, state/repository.py, routing/resolver.py, audit/ledger.py | Branch A (snapshot) or B (live re-resolve) |
| **UC-09** | CorrectionResubmit | T09 | management/use_cases.py | `resubmit_correction(run_id, actor_team_id, resubmission_notes, artifacts)` | state/machine.py, state/repository.py, audit/ledger.py | G07 check (under max) → IN_PROGRESS + CORRECTION_RESUBMITTED |
| **UC-10** | CorrectionEscalate | T10 | management/use_cases.py | `resubmit_correction(run_id, actor_team_id, resubmission_notes, artifacts)` | state/machine.py, audit/ledger.py | Same entry point as UC-09; G08 check (max reached) → CORRECTION_ESCALATED |
| **UC-11** | CorrectionResolve | T11 | management/use_cases.py | `advance_gate(run_id, actor_team_id, notes)` | state/machine.py, state/repository.py, audit/ledger.py | Same entry point as UC-02; internal branch when status=CORRECTION + verdict=pass → CORRECTION_RESOLVED |
| **UC-12** | PrincipalOverride | T12 | management/use_cases.py | `principal_override(run_id, actor_team_id, action, reason, snapshot)` | state/machine.py, state/repository.py, audit/ledger.py | A10A–A10E per action; actor=team_00 only (G09) |
| **UC-13** | GetCurrentState | QO-01 | management/use_cases.py | `get_current_state(run_id, domain_id)` | state/repository.py | Read-only; no events, no state change |
| **UC-14** | GetHistory | QO-02 | management/use_cases.py | `get_history(run_id, domain_id, gate_id, event_type, actor_team_id, limit, offset, order)` | audit/ledger.py | Read-only; delegates to query_events() |

**Rules verified:**
- All UC-01..UC-14 mapped — zero gaps
- Each UC maps to exactly one module (`management/use_cases.py`)
- UC-02/UC-03/UC-11 share `advance_gate()` entry point — internal branching by run status + phase finality
- UC-04/UC-05 share `fail_gate()` entry point — internal branching by G03
- UC-09/UC-10 share `resubmit_correction()` entry point — internal branching by G07/G08

---

## §3 — Module Interface Contracts

### §3.0 Dependency Graph (Acyclic — Iron Rule #5)

```
management/  → state/ + routing/ + prompting/ + audit/ + policy/ + definitions/
state/       → audit/ + definitions/
routing/     → definitions/
prompting/   → definitions/ + policy/
audit/       → definitions/
policy/      → definitions/
governance/  → definitions/
definitions/ → (no internal deps)
```

**Verification:** No cycles. `definitions/` is the leaf. All dependency arrows point toward `definitions/`. `management/` is the top-level orchestrator.

---

### §3.1 definitions/models.py

```python
@dataclass
class Run:
    id: str
    work_package_id: str
    domain_id: str
    process_variant: str
    current_gate_id: str
    current_phase_id: str | None
    status: str                              # RunStatus enum value
    paused_at: str | None                    # ISO-8601 | None
    paused_routing_snapshot_json: str | None  # JSON string | None
    execution_mode: str                      # ExecutionMode enum value
    correction_cycle_count: int
    spec_brief: str | None
    gates_completed_json: str                # JSON array string
    gates_failed_json: str                   # JSON array string
    lod200_author_team: str | None           # FK → teams.id; sentinel (AD-S5-05)
    state_payload_json: str | None
    started_at: str                          # ISO-8601
    last_updated: str                        # ISO-8601
    completed_at: str | None                 # ISO-8601 | None

@dataclass
class Team:
    id: str
    label: str
    name: str
    engine: str
    domain_scope: str
    in_gate_process: int
    group: str
    profession: str
    operating_mode: str
    roster_version: str | None
    created_at: str

@dataclass
class Gate:
    id: str
    sequence_order: int
    name: str
    is_human_gate: int
    description: str | None

@dataclass
class Phase:
    id: str
    gate_id: str
    sequence_order: int
    name: str
    allow_auto: int
    display_in_ui: int

@dataclass
class Domain:
    id: str
    slug: str
    display_name: str
    default_variant: str
    doc_team_id: str | None
    is_active: int
    created_at: str

@dataclass
class PipelineRole:
    id: str
    name: str
    display_name: str
    description: str | None
    can_block_gate: int
    is_seeded: int
    created_at: str

@dataclass
class RoutingRule:
    id: str
    gate_id: str
    phase_id: str | None
    domain_id: str | None
    variant: str | None
    role_id: str
    priority: int
    resolve_from_state_key: str | None
    created_at: str

@dataclass
class Assignment:
    id: str
    work_package_id: str
    domain_id: str
    role_id: str
    team_id: str
    assigned_at: str
    assigned_by: str
    status: str
    superseded_by: str | None
    notes: str | None
    created_at: str

@dataclass
class GateRoleAuthority:
    id: str
    gate_id: str
    phase_id: str | None
    domain_id: str | None
    role_id: str
    may_block_verdict: int
    created_at: str

@dataclass
class EventRecord:
    id: str
    run_id: str
    sequence_no: int
    event_type: str
    gate_id: str | None
    phase_id: str | None
    domain_id: str
    work_package_id: str
    actor_team_id: str | None
    actor_type: str
    verdict: str | None
    reason: str | None
    payload_json: str | None
    occurred_at: str
    prev_hash: str | None
    event_hash: str

@dataclass
class ResolvedRouting:
    team_id: str
    role_id: str | None
    rule_id: str
    assignment_id: str | None
    resolution_method: str     # 'SENTINEL_LEGACY' | 'ASSIGNMENT'

@dataclass
class AssembledPrompt:
    layer1_identity: str
    layer2_governance: str
    layer3_state: str
    layer4_task: str
    assembled_at: str
    content_hash: str
    token_estimate: int | None
```

---

### §3.2 definitions/constants.py

```python
class RunStatus:
    NOT_STARTED = 'NOT_STARTED'
    IN_PROGRESS = 'IN_PROGRESS'
    CORRECTION  = 'CORRECTION'
    PAUSED      = 'PAUSED'
    COMPLETE    = 'COMPLETE'

class ActorType:
    HUMAN     = 'human'
    AGENT     = 'agent'
    SCHEDULER = 'scheduler'
    SYSTEM    = 'system'

class EventType:
    RUN_INITIATED                    = 'RUN_INITIATED'
    PHASE_PASSED                     = 'PHASE_PASSED'
    RUN_COMPLETED                    = 'RUN_COMPLETED'
    GATE_FAILED_BLOCKING             = 'GATE_FAILED_BLOCKING'
    GATE_FAILED_ADVISORY             = 'GATE_FAILED_ADVISORY'
    GATE_APPROVED                    = 'GATE_APPROVED'
    RUN_PAUSED                       = 'RUN_PAUSED'
    RUN_RESUMED                      = 'RUN_RESUMED'
    RUN_RESUMED_WITH_NEW_ASSIGNMENT  = 'RUN_RESUMED_WITH_NEW_ASSIGNMENT'
    CORRECTION_RESUBMITTED           = 'CORRECTION_RESUBMITTED'
    CORRECTION_ESCALATED             = 'CORRECTION_ESCALATED'
    CORRECTION_RESOLVED              = 'CORRECTION_RESOLVED'
    PRINCIPAL_OVERRIDE               = 'PRINCIPAL_OVERRIDE'
    TEAM_ASSIGNMENT_CHANGED          = 'TEAM_ASSIGNMENT_CHANGED'
    ROUTING_FAILED                   = 'ROUTING_FAILED'

    ALL = { ... }  # set of all 15 values for validation

class ProcessVariant:
    TRACK_FULL    = 'TRACK_FULL'
    TRACK_FOCUSED = 'TRACK_FOCUSED'
    TRACK_FAST    = 'TRACK_FAST'

class ExecutionMode:
    MANUAL    = 'MANUAL'
    DASHBOARD = 'DASHBOARD'
    AUTOMATIC = 'AUTOMATIC'

class AssignmentStatus:
    ACTIVE     = 'ACTIVE'
    SUPERSEDED = 'SUPERSEDED'

class OverrideAction:
    FORCE_PASS       = 'FORCE_PASS'
    FORCE_FAIL       = 'FORCE_FAIL'
    FORCE_PAUSE      = 'FORCE_PAUSE'
    FORCE_RESUME     = 'FORCE_RESUME'
    FORCE_CORRECTION = 'FORCE_CORRECTION'

    ALL = { ... }  # set of all 5 values

class ScopeType:
    GLOBAL = 'GLOBAL'
    DOMAIN = 'DOMAIN'
    GATE   = 'GATE'
    PHASE  = 'PHASE'
```

---

### §3.3 definitions/queries.py

```python
def get_gate(gate_id: str) -> Gate | None
def get_phase(phase_id: str) -> Phase | None
def get_team(team_id: str) -> Team | None
def get_domain(domain_id: str) -> Domain | None
def get_pipeline_role(role_id: str) -> PipelineRole | None
def list_gates() -> list[Gate]
def list_phases_for_gate(gate_id: str) -> list[Phase]
def is_final_phase(gate_id: str, phase_id: str) -> bool
def get_next_gate_phase(gate_id: str, phase_id: str) -> tuple[str, str | None]
def get_gate_role_authority(gate_id: str, phase_id: str | None,
                           domain_id: str | None, role_id: str) -> GateRoleAuthority | None
```

Dependencies: None (leaf module).

---

### §3.4 routing/resolver.py

#### resolve_actor(gate_id, phase_id, domain_id, variant, work_package_id, run) → ResolvedRouting

```
Params:
  - gate_id: str — FK → gates.id
  - phase_id: str | None — FK → phases.id; None for phaseless gates
  - domain_id: str — FK → domains.id
  - variant: str — TRACK_FULL | TRACK_FOCUSED | TRACK_FAST (from runs.process_variant)
  - work_package_id: str — WP identifier for assignment lookup
  - run: Run — full run object for sentinel column read

Returns:
  ResolvedRouting(team_id, role_id, rule_id, assignment_id, resolution_method)

Raises:
  RoutingUnresolvedError — no rule matched (B.1) or no active assignment (B.2)
  RoutingMisconfigurationError — boot validation failure (EC-01)

Precondition:
  run.status ∈ {IN_PROGRESS, CORRECTION}
  assert run.status in (RunStatus.IN_PROGRESS, RunStatus.CORRECTION)

Iron Rules:
  - NEVER called if run.status == PAUSED (AD-S5-02); enforced by assert
  - Sentinel detection: runs.lod200_author_team IS NOT NULL (AD-S5-05)
  - process_variant MUST be included in rule matching context (AD-S5-01)
  - routing_rules.variant maps from runs.process_variant

SQL used:
  - SENTINEL_RESOLUTION_SQL (Routing Spec §1.4)
  - CANONICAL_ROLE_RESOLUTION_SQL (Routing Spec §1.5)
  - TEAM_RESOLUTION_SQL (Routing Spec §1.6)
```

Dependencies: `definitions/models.py`, `definitions/constants.py`

---

### §3.5 state/machine.py

Implements all state transitions (T01–T12) from SM Spec v1.0.2. Each transition is an atomic DB transaction (AD-S7-01).

#### execute_transition(run, transition_type, actor_team_id, ...) → TransitionResult

```
Params:
  - run: Run — current run state (must be loaded fresh within TX)
  - transition_type: str — maps to T01–T12
  - actor_team_id: str — team performing the action
  - (additional params per transition type: verdict, reason, findings, action, notes, snapshot)

Returns:
  TransitionResult(
    run_id: str,
    new_status: str,
    event_id: str,
    event_type: str,
    current_gate_id: str,
    current_phase_id: str | None,
  )

Raises:
  InvalidStateError — run status does not permit requested transition
  WrongActorError — actor is not the current assigned team
  InsufficientAuthorityError — role lacks blocking authority (G03 fails)
  NotPrincipalError — operation requires team_00
  MaxCyclesReachedError — correction cycles exhausted (G08)
  SnapshotValidationError — pause snapshot failed validation
  SnapshotWriteError — DB failure writing snapshot
  AuditLedgerError — event INSERT failed (full rollback per AD-S7-01)

Iron Rules:
  - AD-S7-01: UPDATE runs + INSERT events in SAME transaction
  - AD-S5-02: resolve_actor() NOT called for PAUSED runs
  - SM Iron Rule 3: PAUSED snapshot write in ATOMIC transaction
  - SM Iron Rule 9: correction_cycle_count never reset
```

#### Internal handlers (private, called by execute_transition):

```
_handle_initiate(run, domain_id, work_package_id, process_variant, execution_mode) → TransitionResult
_handle_advance(run, actor_team_id, notes) → TransitionResult
_handle_fail(run, actor_team_id, reason, findings) → TransitionResult
_handle_approve(run, actor_team_id, approval_notes) → TransitionResult
_handle_pause(run, actor_team_id, pause_reason) → TransitionResult
_handle_resume(run, actor_team_id, resume_notes) → TransitionResult
_handle_resubmit(run, actor_team_id, notes, artifacts) → TransitionResult
_handle_override(run, actor_team_id, action, reason, snapshot) → TransitionResult
```

Dependencies: `audit/ledger.py`, `definitions/models.py`, `definitions/constants.py`, `definitions/queries.py`

---

### §3.6 state/repository.py

```python
def create_run(
    id: str,
    work_package_id: str,
    domain_id: str,
    process_variant: str,
    current_gate_id: str,
    current_phase_id: str | None,
    execution_mode: str,
) -> Run

def get_run(run_id: str) -> Run | None

def get_active_run(domain_id: str) -> Run | None
    # status IN ('IN_PROGRESS', 'CORRECTION', 'PAUSED')

def update_run_status(
    run_id: str,
    status: str,
    current_gate_id: str | None = None,
    current_phase_id: str | None = None,
    paused_at: str | None = None,
    paused_routing_snapshot_json: str | None = None,
    correction_cycle_count: int | None = None,
    completed_at: str | None = None,
) -> Run

def get_current_state_sql(run_id: str | None, domain_id: str | None) -> dict
    # Executes Stage 7 §4.4 canonical SQL; returns assembled response

def write_pipeline_state_projection(domain_id: str, run: Run) -> None
    # Writes pipeline_state.json projection (SM Iron Rule 10)
```

Dependencies: `definitions/models.py`, `definitions/constants.py`

---

### §3.7 audit/ledger.py

#### append_event(...) → str

```
Signature:
  append_event(
    run_id:          str,
    event_type:      str,
    gate_id:         str | None,
    phase_id:        str | None,
    domain_id:       str,
    work_package_id: str,
    actor_team_id:   str | None,
    actor_type:      str,
    verdict:         str | None = None,
    reason:          str | None = None,
    payload_json:    str | None = None,
  ) -> str    # returns event.id (ULID)

Internal computation:
  - id           = ulid()
  - sequence_no  = MAX(sequence_no) + 1 for run_id
  - occurred_at  = now() UTC
  - prev_hash    = last event_hash for run_id (NULL for first)
  - event_hash   = sha256(id || run_id || sequence_no || event_type || occurred_at || COALESCE(payload_json, ''))

Preconditions:
  1. event_type ∈ EventType.ALL (§1 registry)
  2. run_id exists in runs table
  3. actor_type ∈ {human, agent, scheduler, system}

Raises:
  UnknownEventTypeError — event_type not in registry → UNKNOWN_EVENT_TYPE
  RunNotFoundError — run_id not found → RUN_NOT_FOUND
  AuditLedgerError — DB write failure → AUDIT_LEDGER_ERROR

Iron Rules:
  - Append-only: no UPDATE or DELETE (Stage 7 §8.4)
  - Hash chain integrity: prev_hash links to prior event_hash
  - Monotonic sequence_no per run_id
```

#### query_events(...) → list[EventRecord]

```
Signature:
  query_events(
    run_id:         str | None = None,
    event_type:     str | None = None,
    gate_id:        str | None = None,
    domain_id:      str | None = None,
    actor_team_id:  str | None = None,
    limit:          int = 50,
    offset:         int = 0,
    order:          str = 'desc',
  ) -> tuple[list[EventRecord], int]    # (events, total_count)

Raises:
  InvalidEventTypeError — event_type not in registry → INVALID_EVENT_TYPE
  InvalidLimitError — limit outside [1, 200] → INVALID_LIMIT
  InvalidHistoryParamsError — offset < 0 or invalid order → INVALID_HISTORY_PARAMS

SQL: Stage 7 §5.4 canonical query
```

Dependencies: `definitions/models.py`, `definitions/constants.py`

---

### §3.8 prompting/builder.py

#### assemble_prompt(...) → AssembledPrompt

```
Signature:
  assemble_prompt(
    run_id:           str,
    team_id:          str,
    gate_id:          str,
    phase_id:         str | None,
    domain_id:        str,
    process_variant:  str,
  ) -> AssembledPrompt

Precondition (AD-S5-02):
  run.status ∈ {IN_PROGRESS, CORRECTION}

Raises:
  InvalidRunStatusError — run.status not in {IN_PROGRESS, CORRECTION} → INVALID_RUN_STATUS
  TemplateNotFoundError — no active template for context → TEMPLATE_NOT_FOUND
  GovernanceNotFoundError — no governance file for team_id → GOVERNANCE_NOT_FOUND
  TemplateRenderError — unknown {{placeholder}} → TEMPLATE_RENDER_ERROR

Iron Rules:
  - L1 + L3: NEVER cached (AD-S6-01)
  - L2: cached per team_id + governance_version
  - L4: cached per gate_id + phase_id + domain_id + version
  - Unknown placeholder = hard failure (AD-S6-02)
  - Token budget = advisory warning only (AD-S6-07)
```

Dependencies: `definitions/models.py`, `prompting/cache.py`, `prompting/templates.py`, `policy/settings.py`

---

### §3.9 prompting/cache.py

```python
def get(key: str) -> str | None
def set(key: str, value: str, ttl: int | None = None) -> None
def invalidate(key: str) -> None
```

L2 key format: `l2:{team_id}:{governance_version}`
L4 key format: `l4:{gate_id}:{phase_id}:{domain_id}:{version}`

Iron Rule: No TTL-based invalidation. Cache invalidation is version-based only (AD-S6-01).

Dependencies: `definitions/constants.py`

---

### §3.10 prompting/templates.py

```python
def get_active_template(gate_id: str, phase_id: str | None, domain_id: str | None) -> Template | None
    # SQL: Stage 6 §2.3 TEMPLATE_LOOKUP_SQL
    # Uses IS NOT DISTINCT FROM for nullable columns (AD-S6-06)
    # Specificity: phase+domain > phase-only > domain-only > gate-default (AD-S6-03)
    # DDL-ERRATA-01: application-layer uniqueness enforcement until partial index applied

def create_template(gate_id: str, phase_id: str | None, domain_id: str | None,
                    name: str, body_markdown: str) -> Template
    # Admin operation (OQ-S3-02 → AD-S8-01); team_00 only

def update_template(template_id: str, body_markdown: str) -> Template
    # Bumps version + 1; uses IS NOT DISTINCT FROM (AD-S6-06)
    # SQL: Stage 6 §3.2 cache invalidation sequence

def list_templates(gate_id: str | None = None, is_active: int = 1) -> list[Template]
```

Dependencies: `definitions/models.py`

---

### §3.11 policy/settings.py

```python
def get_policy_value(policy_key: str, default: Any = None) -> Any
    # Stage 6 §6.2 resolution logic
    # Returns parsed JSON value/max key or full object (AD-S6-05)

def get_governance_version(team_id: str) -> int
    # Stage 6 §3.3; default = 1 if no policy row

def list_policies(scope_type: str | None = None) -> list[Policy]

def update_policy(policy_id: str, policy_value_json: str) -> Policy
    # Admin operation (OQ-S3-02 → AD-S8-01); team_00 only
```

Dependencies: `definitions/models.py`

---

### §3.12 management/use_cases.py

All 14 UC implementations. Each function validates preconditions, delegates to domain modules, and returns a typed result.

```python
def initiate_run(
    work_package_id: str,
    domain_id: str,
    process_variant: str | None = None,
    execution_mode: str = 'MANUAL',
) -> InitiateRunResult
    # Validates G01; resolves routing; creates run + assignment; appends RUN_INITIATED
    # Returns: {run_id, current_gate_id, current_phase_id, actor_team_id}
    # Errors: DOMAIN_ALREADY_ACTIVE (409), UNKNOWN_WP (400), DOMAIN_INACTIVE (400), ROUTING_UNRESOLVED (500)

def advance_gate(
    run_id: str,
    actor_team_id: str,
    notes: str | None = None,
) -> AdvanceGateResult
    # Handles UC-02 (IN_PROGRESS, non-final), UC-03 (IN_PROGRESS, final), UC-11 (CORRECTION, pass)
    # Validates G02; determines finality; delegates to state/machine.py
    # Returns: {run_id, new_status, current_gate_id, current_phase_id}
    # Errors: WRONG_ACTOR (403), INVALID_STATE (409), PHASE_ALREADY_ADVANCED (409), PHASE_SEQUENCE_ERROR (500)

def fail_gate(
    run_id: str,
    actor_team_id: str,
    reason: str,
    findings: dict | None = None,
) -> FailGateResult
    # Handles UC-04 (blocking) and UC-05 (advisory) — branching on G03
    # Validates G02 + G03; delegates to state/machine.py
    # Returns: {run_id, blocking: bool, new_status, correction_cycle_count}
    # Errors: WRONG_ACTOR (403), INVALID_STATE (409), MISSING_REASON (400)
    #
    # Shared endpoint semantic: when G03 fails (no blocking authority),
    # machine.py raises InsufficientAuthorityError internally.
    # fail_gate() catches this and branches to UC-05 advisory path —
    # returns HTTP 200 success with blocking=false and event_type=GATE_FAILED_ADVISORY.
    # INSUFFICIENT_AUTHORITY is NOT an API-level error on this endpoint;
    # it is an internal branch signal from machine.py to use_cases.py.

def approve_gate(
    run_id: str,
    actor_team_id: str,
    approval_notes: str | None = None,
) -> ApproveGateResult
    # UC-06; validates G04 (is_human_gate=1 AND actor=team_00)
    # Returns: {run_id, current_gate_id, current_phase_id}
    # Errors: NOT_HITL_GATE (400), INSUFFICIENT_AUTHORITY (403), INVALID_STATE (409)

def pause_run(
    run_id: str,
    actor_team_id: str,
    pause_reason: str,
) -> PauseRunResult
    # UC-07; validates G05; atomic snapshot write
    # Returns: {run_id, paused_at, snapshot_gate_id, snapshot_phase_id}
    # Errors: INVALID_STATE_TRANSITION (409), INSUFFICIENT_AUTHORITY (403),
    #         SNAPSHOT_VALIDATION_FAILED (422), SNAPSHOT_WRITE_FAILED (500)

def resume_run(
    run_id: str,
    actor_team_id: str,
    resume_notes: str | None = None,
) -> ResumeRunResult
    # UC-08; validates G06; Branch A (snapshot) or B (live re-resolve)
    # Returns: {run_id, current_gate_id, current_phase_id, actor_team_id, branch_used}
    # Errors: SNAPSHOT_MISSING (409), INSUFFICIENT_AUTHORITY (403), INVALID_STATE (409),
    #         ROUTING_RESOLUTION_FAILED (500)

def resubmit_correction(
    run_id: str,
    actor_team_id: str,
    resubmission_notes: str,
    artifacts: dict | None = None,
) -> ResubmitResult
    # Handles UC-09 (under max) and UC-10 (escalate) — branching on G07/G08
    # Returns: {run_id, new_status, correction_cycle_count, escalated: bool}
    # Errors: INVALID_STATE (409), WRONG_ACTOR (403), MISSING_NOTES (400)
    #
    # Shared endpoint semantic: when G07 fails (max cycles reached),
    # machine.py raises MaxCyclesReachedError internally.
    # resubmit_correction() catches this and branches to UC-10 escalation path —
    # returns HTTP 200 success with escalated=true and event_type=CORRECTION_ESCALATED.
    # MAX_CYCLES_REACHED is NOT an API-level error on this endpoint;
    # it is an internal branch signal from machine.py to use_cases.py.

def principal_override(
    run_id: str,
    actor_team_id: str,
    action: str,
    reason: str,
    snapshot: dict | None = None,
) -> OverrideResult
    # UC-12; validates G09 (actor=team_00, action in valid set)
    # Dispatches to A10A–A10E per action
    # Returns: {run_id, from_status, to_status, action}
    # Errors: INSUFFICIENT_AUTHORITY (403), INVALID_ACTION (400), TERMINAL_STATE (409),
    #         MISSING_REASON (400), SNAPSHOT_REQUIRED (400)

def get_current_state(
    run_id: str | None = None,
    domain_id: str | None = None,
) -> StateResponse
    # UC-13 (QO-01); read-only
    # Returns: Stage 7 §4.2 response schema
    # Errors: RUN_NOT_FOUND (404), INVALID_HISTORY_PARAMS (400)

def get_history(
    run_id: str | None = None,
    domain_id: str | None = None,
    gate_id: str | None = None,
    event_type: str | None = None,
    actor_team_id: str | None = None,
    limit: int = 50,
    offset: int = 0,
    order: str = 'desc',
) -> HistoryResponse
    # UC-14 (QO-02); read-only
    # Returns: Stage 7 §5.3 response schema
    # Errors: INVALID_EVENT_TYPE (400), INVALID_LIMIT (400), INVALID_HISTORY_PARAMS (400)
```

Dependencies: `state/machine.py`, `state/repository.py`, `routing/resolver.py`, `prompting/builder.py`, `audit/ledger.py`, `policy/settings.py`, `definitions/queries.py`, `definitions/models.py`, `definitions/constants.py`

---

### §3.13 management/api.py

FastAPI HTTP layer. Thin routing — all business logic in `use_cases.py`. Actor authentication via API key (AD-S8-03).

```python
@app.post("/api/runs")
async def create_run(body: CreateRunRequest) -> JSONResponse:
    # Delegates to use_cases.initiate_run()

@app.post("/api/runs/{run_id}/advance")
async def advance(run_id: str, body: AdvanceRequest) -> JSONResponse:
    # Delegates to use_cases.advance_gate()

@app.post("/api/runs/{run_id}/fail")
async def fail(run_id: str, body: FailRequest) -> JSONResponse:
    # Delegates to use_cases.fail_gate()

@app.post("/api/runs/{run_id}/approve")
async def approve(run_id: str, body: ApproveRequest) -> JSONResponse:
    # Delegates to use_cases.approve_gate()

@app.post("/api/runs/{run_id}/pause")
async def pause(run_id: str, body: PauseRequest) -> JSONResponse:
    # Delegates to use_cases.pause_run()

@app.post("/api/runs/{run_id}/resume")
async def resume(run_id: str, body: ResumeRequest) -> JSONResponse:
    # Delegates to use_cases.resume_run()

@app.post("/api/runs/{run_id}/resubmit")
async def resubmit(run_id: str, body: ResubmitRequest) -> JSONResponse:
    # Delegates to use_cases.resubmit_correction()

@app.post("/api/runs/{run_id}/override")
async def override(run_id: str, body: OverrideRequest) -> JSONResponse:
    # Delegates to use_cases.principal_override()

@app.get("/api/state")
async def state(run_id: str = None, domain_id: str = None) -> JSONResponse:
    # Delegates to use_cases.get_current_state()

@app.get("/api/history")
async def history(run_id: str = None, domain_id: str = None, gate_id: str = None,
                  event_type: str = None, actor_team_id: str = None,
                  limit: int = 50, offset: int = 0, order: str = 'desc') -> JSONResponse:
    # Delegates to use_cases.get_history()

# ── Admin CRUD (OQ-S3-02 → AD-S8-01: ADMINISTRATIVE_ONLY, team_00 auth) ──

@app.get("/api/routing-rules")
async def list_routing_rules(gate_id: str = None) -> JSONResponse

@app.post("/api/routing-rules")
async def create_routing_rule(body: CreateRoutingRuleRequest) -> JSONResponse

@app.put("/api/routing-rules/{rule_id}")
async def update_routing_rule(rule_id: str, body: UpdateRoutingRuleRequest) -> JSONResponse
    # VARIANT_IMMUTABLE check on variant field change

@app.get("/api/templates")
async def list_templates(gate_id: str = None, is_active: int = 1) -> JSONResponse

@app.post("/api/templates")
async def create_template(body: CreateTemplateRequest) -> JSONResponse

@app.put("/api/templates/{template_id}")
async def update_template(template_id: str, body: UpdateTemplateRequest) -> JSONResponse

@app.get("/api/policy")
async def list_policies(scope_type: str = None) -> JSONResponse

@app.put("/api/policy/{policy_key}")
async def update_policy(policy_key: str, body: UpdatePolicyRequest) -> JSONResponse
```

Dependencies: `management/use_cases.py`, `prompting/templates.py`, `policy/settings.py`, `routing/resolver.py (for admin read)`, `definitions/models.py`

---

### §3.14 governance/artifact_index.py

```python
def get_artifact(artifact_id: str) -> WpArtifactIndex | None
def list_artifacts(wp_id: str, status: str | None = None) -> list[WpArtifactIndex]
def create_artifact(wp_id: str, path: str, type: str, status: str,
                    stage: str | None, created_by: str | None, purpose: str | None) -> WpArtifactIndex
def update_artifact_status(artifact_id: str, status: str) -> WpArtifactIndex
```

Dependencies: `definitions/models.py`

### §3.15 governance/archive.py

```python
def generate_archive_manifest(wp_id: str) -> dict
    # Returns list of artifacts with status=ARCHIVE_PENDING for Team 191 cleanup
```

Dependencies: `governance/artifact_index.py`

---

## §4 — API Endpoint Contracts

All error codes are from Stage 7 §6 Error Code Registry (39 codes). No invented codes.

### §4.1 POST /api/runs — InitiateRun (UC-01)

**Request:**
```json
{
  "work_package_id": "string — required",
  "domain_id":       "string — required; FK → domains.id",
  "process_variant": "string | null — optional; default = domains.default_variant",
  "execution_mode":  "string | null — optional; default = MANUAL; ∈ {MANUAL, DASHBOARD, AUTOMATIC}"
}
```

**Response 201:**
```json
{
  "run_id":            "string (ULID)",
  "current_gate_id":   "string",
  "current_phase_id":  "string | null",
  "actor_team_id":     "string",
  "status":            "IN_PROGRESS",
  "process_variant":   "string"
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `DOMAIN_ALREADY_ACTIVE` | 409 | G01 check 1 fails — active run exists for domain |
| `UNKNOWN_WP` | 400 | G01 check 2 fails — work_package_id not in registry |
| `DOMAIN_INACTIVE` | 400 | G01 check 3 fails — domain is_active=0 |
| `ROUTING_UNRESOLVED` | 500 | No routing rule matched or no active assignment |

---

### §4.2 POST /api/runs/{run_id}/advance — AdvanceGate (UC-02/03/11)

**Request:**
```json
{
  "actor_team_id": "string — required; teams.id",
  "notes":         "string | null — optional"
}
```

**Response 200:**
```json
{
  "run_id":           "string",
  "status":           "IN_PROGRESS | COMPLETE",
  "current_gate_id":  "string | null",
  "current_phase_id": "string | null",
  "event_type":       "PHASE_PASSED | RUN_COMPLETED | CORRECTION_RESOLVED",
  "completed_at":     "ISO-8601 | null"
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `WRONG_ACTOR` | 403 | G02 actor check fails |
| `INVALID_STATE` | 409 | run.status not in {IN_PROGRESS, CORRECTION} |
| `PHASE_ALREADY_ADVANCED` | 409 | Idempotent — phase already advanced |
| `PHASE_SEQUENCE_ERROR` | 500 | Next phase not found — escalate team_00 |

---

### §4.3 POST /api/runs/{run_id}/fail — FailGate (UC-04/05)

**Request:**
```json
{
  "actor_team_id": "string — required",
  "reason":        "string — required",
  "findings":      "object | null — optional; structured findings"
}
```

**Response 200:**
```json
{
  "run_id":                 "string",
  "blocking":               "boolean — true = UC-04, false = UC-05",
  "status":                 "CORRECTION | IN_PROGRESS",
  "correction_cycle_count": "integer",
  "event_type":             "GATE_FAILED_BLOCKING | GATE_FAILED_ADVISORY"
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `WRONG_ACTOR` | 403 | G02 fails |
| `INVALID_STATE` | 409 | run.status ≠ IN_PROGRESS |
| `MISSING_REASON` | 400 | reason empty |

**Shared endpoint semantic:** When G03 fails (no `gate_role_authorities` row → actor lacks blocking authority), the endpoint does NOT return `INSUFFICIENT_AUTHORITY` (403). Instead, it internally branches to the UC-05 advisory path and returns HTTP 200 success with `blocking: false`, `status: IN_PROGRESS`, and `event_type: GATE_FAILED_ADVISORY`. The G03 check result determines which *success* path — UC-04 (blocking) or UC-05 (advisory) — not whether to error. See UC Catalog v1.0.3 UC-04 error table: `INSUFFICIENT_AUTHORITY | G03 fails → non-blocking path → UC-05` — this is an inter-UC routing signal internalized by the shared endpoint.

---

### §4.4 POST /api/runs/{run_id}/approve — HumanApprove (UC-06)

**Request:**
```json
{
  "actor_team_id":   "string — required; must be team_00",
  "approval_notes":  "string | null — optional"
}
```

**Response 200:**
```json
{
  "run_id":           "string",
  "current_gate_id":  "string",
  "current_phase_id": "string | null",
  "event_type":       "GATE_APPROVED"
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `NOT_HITL_GATE` | 400 | gates.is_human_gate=0 |
| `INSUFFICIENT_AUTHORITY` | 403 | actor_team_id ≠ team_00 (Tier 1 — AUTHORITY_MODEL v1.0.0 §3) |
| `INVALID_STATE` | 409 | run.status ≠ IN_PROGRESS |

---

### §4.5 POST /api/runs/{run_id}/pause — PauseRun (UC-07)

**Request:**
```json
{
  "actor_team_id": "string — required; must be team_00",
  "pause_reason":  "string — required"
}
```

**Response 200:**
```json
{
  "run_id":            "string",
  "status":            "PAUSED",
  "paused_at":         "ISO-8601",
  "snapshot_gate_id":  "string",
  "snapshot_phase_id": "string | null"
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `INVALID_STATE_TRANSITION` | 409 | G05 fails — not IN_PROGRESS |
| `INSUFFICIENT_AUTHORITY` | 403 | actor ≠ team_00 (Tier 1 — AUTHORITY_MODEL v1.0.0 §3) |
| `SNAPSHOT_VALIDATION_FAILED` | 422 | Snapshot JSON Schema validation failed |
| `SNAPSHOT_WRITE_FAILED` | 500 | DB TX failure; full rollback |

---

### §4.6 POST /api/runs/{run_id}/resume — ResumeRun (UC-08)

**Request:**
```json
{
  "actor_team_id": "string — required; must be team_00",
  "resume_notes":  "string | null — optional"
}
```

**Response 200:**
```json
{
  "run_id":           "string",
  "status":           "IN_PROGRESS",
  "current_gate_id":  "string",
  "current_phase_id": "string | null",
  "actor_team_id":    "string",
  "branch_used":      "A | B",
  "event_type":       "RUN_RESUMED | RUN_RESUMED_WITH_NEW_ASSIGNMENT"
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `SNAPSHOT_MISSING` | 409 | paused_routing_snapshot_json IS NULL |
| `INSUFFICIENT_AUTHORITY` | 403 | actor ≠ team_00 (Tier 1 — AUTHORITY_MODEL v1.0.0 §3) |
| `INVALID_STATE` | 409 | run.status ≠ PAUSED |
| `ROUTING_RESOLUTION_FAILED` | 500 | Branch B re-resolve fails |

---

### §4.7 POST /api/runs/{run_id}/resubmit — CorrectionResubmit/Escalate (UC-09/10)

**Request:**
```json
{
  "actor_team_id":      "string — required",
  "resubmission_notes": "string — required",
  "artifacts":          "object | null — optional"
}
```

**Response 200:**
```json
{
  "run_id":                 "string",
  "status":                 "IN_PROGRESS | CORRECTION",
  "correction_cycle_count": "integer",
  "escalated":              "boolean — true = UC-10",
  "event_type":             "CORRECTION_RESUBMITTED | CORRECTION_ESCALATED"
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `INVALID_STATE` | 409 | run.status ≠ CORRECTION |
| `WRONG_ACTOR` | 403 | G02 fails |
| `MISSING_NOTES` | 400 | resubmission_notes empty |

**Note:** `MAX_CYCLES_REACHED` is not an API-level error on this endpoint. When G07 fails (G08 is true = max cycles reached), the endpoint internally branches to the UC-10 escalation path and returns HTTP 200 success with `escalated: true` and `event_type: CORRECTION_ESCALATED`. The G07/G08 check result determines which *success* path — UC-09 (resubmit) or UC-10 (escalate) — not whether to error. See UC Catalog v1.0.3 UC-09 error table: `MAX_CYCLES_REACHED | G07 fails → escalate to UC-10` — this is an inter-UC routing signal internalized by the shared endpoint.

---

### §4.8 POST /api/runs/{run_id}/override — PrincipalOverride (UC-12)

**Request:**
```json
{
  "actor_team_id": "string — required; must be team_00",
  "action":        "string — required; ∈ {FORCE_PASS, FORCE_FAIL, FORCE_PAUSE, FORCE_RESUME, FORCE_CORRECTION}",
  "reason":        "string — required (audit trail)",
  "snapshot":      "object | null — required for FORCE_PAUSE; optional for FORCE_RESUME"
}
```

**Response 200:**
```json
{
  "run_id":      "string",
  "from_status": "string",
  "to_status":   "string",
  "action":      "string",
  "event_type":  "PRINCIPAL_OVERRIDE"
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `INSUFFICIENT_AUTHORITY` | 403 | actor ≠ team_00 (Tier 1 — AUTHORITY_MODEL v1.0.0 §3) |
| `INVALID_ACTION` | 400 | action not in valid set |
| `TERMINAL_STATE` | 409 | run.status = COMPLETE |
| `MISSING_REASON` | 400 | reason empty |
| `SNAPSHOT_REQUIRED` | 400 | FORCE_PAUSE without snapshot |

---

### §4.9 GET /api/state — GetCurrentState (UC-13)

**Query params:**
- `run_id`: string (ULID) — optional
- `domain_id`: string — optional
- One of `run_id` or `domain_id` required.

**Response 200:**
```json
{
  "run_id":                 "string | null",
  "work_package_id":        "string | null",
  "domain_id":              "string",
  "process_variant":        "string | null",
  "status":                 "NOT_STARTED | IN_PROGRESS | CORRECTION | PAUSED | COMPLETE | IDLE",
  "current_gate_id":        "string | null",
  "current_phase_id":       "string | null",
  "correction_cycle_count": "integer",
  "paused_at":              "ISO-8601 | null",
  "completed_at":           "ISO-8601 | null",
  "started_at":             "ISO-8601 | null",
  "last_updated":           "ISO-8601 | null",
  "actor":                  {"team_id": "string", "label": "string", "engine": "string"} | null,
  "sentinel":               {"active": "boolean", "override_team": "string | null"} | null,
  "execution_mode":         "MANUAL | DASHBOARD | AUTOMATIC | null"
}
```

**Exact match:** Response schema = Stage 7 §4.2.

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `RUN_NOT_FOUND` | 404 | run_id not found |
| `INVALID_HISTORY_PARAMS` | 400 | Neither run_id nor domain_id provided |

**Note:** `NO_ACTIVE_RUN` returns HTTP 200 with `status: IDLE` — not an error.

---

### §4.10 GET /api/history — GetHistory (UC-14)

**Query params:**
- `run_id`: string — optional
- `domain_id`: string — optional
- `gate_id`: string — optional
- `event_type`: string — optional; must be in §1 registry
- `actor_team_id`: string — optional
- `limit`: integer — optional; default=50, max=200
- `offset`: integer — optional; default=0
- `order`: "asc" | "desc" — optional; default="desc"

**Response 200:**
```json
{
  "total":  "integer",
  "limit":  "integer",
  "offset": "integer",
  "events": [
    {
      "id":              "string",
      "run_id":          "string",
      "sequence_no":     "integer",
      "event_type":      "string",
      "gate_id":         "string | null",
      "phase_id":        "string | null",
      "domain_id":       "string",
      "work_package_id": "string",
      "actor":           {"team_id": "string | null", "label": "string | null", "type": "string"},
      "verdict":         "string | null",
      "reason":          "string | null",
      "payload_json":    "object | null",
      "occurred_at":     "ISO-8601"
    }
  ]
}
```

**Exact match:** Response schema = Stage 7 §5.3.

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `INVALID_EVENT_TYPE` | 400 | event_type not in §1 registry |
| `INVALID_LIMIT` | 400 | limit < 1 or > 200 |
| `INVALID_HISTORY_PARAMS` | 400 | offset < 0 or invalid order |

**Note:** `NO_RESULTS` returns HTTP 200 with `events: []` — not an error.

---

### §4.11 Admin CRUD Endpoints (OQ-S3-02 → AD-S8-01)

All admin endpoints require `team_00` authentication (AD-S8-03). No formal UC. No event emission (AD-S8-02).

#### GET /api/routing-rules

**Query params:** `gate_id` (optional filter)

**Response 200:** `{"routing_rules": [RoutingRule, ...]}`

#### POST /api/routing-rules

**Request:**
```json
{
  "gate_id":   "string — required",
  "phase_id":  "string | null",
  "domain_id": "string | null",
  "variant":   "string | null",
  "role_id":   "string — required",
  "priority":  "integer — default 100"
}
```
**Response 201:** Created routing rule object.

#### PUT /api/routing-rules/{rule_id}

**Request:** Partial update fields. `variant` field change check: if `variant` differs from existing AND the rule is referenced by an active run → `VARIANT_IMMUTABLE` (409).

#### GET /api/templates

**Query params:** `gate_id` (optional), `is_active` (optional, default=1)

**Response 200:** `{"templates": [Template, ...]}`

#### POST /api/templates

**Request:**
```json
{
  "gate_id":       "string — required",
  "phase_id":      "string | null",
  "domain_id":     "string | null",
  "name":          "string — required",
  "body_markdown": "string — required"
}
```
**Response 201:** Created template (version=1, is_active=1).

#### PUT /api/templates/{template_id}

**Request:** `{"body_markdown": "string"}` — triggers version bump + L4 cache invalidation (Stage 6 §3.2 sequence).

#### GET /api/policy

**Query params:** `scope_type` (optional filter)

**Response 200:** `{"policies": [Policy, ...]}`

#### PUT /api/policy/{policy_key}

**Request:** `{"policy_value_json": "string — JSON"}` — updates highest-priority row for key.

---

## §5 — OQ Closures

### §5.1 OQ-S3-02 — Admin Management UCs

**Decision: ADMINISTRATIVE_ONLY**

**Rationale:** Template management, policy updates, routing rule CRUD, and governance version bumps are **configuration operations** performed exclusively by `team_00`. They operate outside the pipeline run lifecycle:
- No state machine transition (T01–T12) is triggered.
- No `run_id` is associated (events.run_id is NOT NULL in DDL — cannot emit standard events).
- No routing resolution is required.
- No prompt assembly occurs.

Formalizing these as UCs (UC-15+) would require schema amendments (nullable `run_id` or a separate audit table) that break the event ledger contract (Stage 7 §8.4 append-only with mandatory `run_id`). The complexity cost exceeds the governance benefit for v3.0.

**Implementation:**
- API endpoints: §4.11 (GET/POST/PUT for routing-rules, templates, policy)
- Access control: `team_00` only, enforced at API layer via API key authentication (AD-S8-03)
- Audit: Standard HTTP access logs; database `updated_at` columns provide change timestamps
- No event emission to `events` table (AD-S8-02)

**AD-S8-01:** Admin management operations (routing rule CRUD, template CRUD, policy updates, governance version bumps) are ADMINISTRATIVE_ONLY — not formal UCs. Access restricted to `team_00`. No event emission. Spec amendment required to formalize as UCs.

---

### §5.2 OQ-S7-01 — Admin Management Event Types

**Decision: NO_EVENTS**

**Rationale:** Consistent with OQ-S3-02 closure (ADMINISTRATIVE_ONLY). The `events` table requires `run_id NOT NULL` (DDL v1.0.1). Admin operations have no associated run. Emitting events would require schema changes (nullable `run_id` or a separate audit table) that violate the current DDL contract and event ledger integrity model.

**Consequence:**
- `TEMPLATE_UPDATED`, `POLICY_UPDATED`, `GOVERNANCE_VERSION_BUMPED` are **never emitted** as event_types to the `events` table.
- The Event Type Registry (Stage 7 §1) remains at 15 types — 14 standard + 1 error.
- Audit trail for admin operations relies on: HTTP access logs, `updated_at` timestamps, and optional application-level structured logging.
- If future observability requirements demand formal admin event tracking, a schema amendment (separate `admin_audit_log` table or nullable `run_id`) + spec amendment would be required.

**AD-S8-02:** `TEMPLATE_UPDATED`, `POLICY_UPDATED`, `GOVERNANCE_VERSION_BUMPED` events will never be emitted to the `events` table. The Event Type Registry is closed at 15 types. Spec amendment required to change.

---

### §5.3 OQ-S3-03 — Authentication Mechanism

**Decision: API Key per Team**

**Mechanism:**
- Each team has a unique API key stored in `definition.yaml` (not in DB — configuration secret).
- API requests include header: `X-API-Key: <key>`
- API layer resolves key → `team_id`; validates that the resolved `team_id` matches the `actor_team_id` in the request body.
- `team_00` key required for admin endpoints (§4.11) and principal-only operations (UC-06/07/08/12).

**Scope:** v3.0 only. More sophisticated auth (OAuth, JWT) deferred to v3.1+.

**AD-S8-03:** Actor authentication in v3.0 uses API key per team with `X-API-Key` header. API layer validates key → team_id mapping. No session management, no JWT. Upgrade path deferred to v3.1.

---

### §5.4 OQ-S3-04 — GATE_FAILED_ADVISORY Display

**Decision: Displayed in History View**

`GATE_FAILED_ADVISORY` events appear in:
- **History View** (`/history`): as standard event rows with `event_type` filter support.
- **Pipeline View** (`/`): NOT shown in the main status panel (advisory has no state impact). Optionally shown in a "recent events" sidebar widget if implemented.

**AD-S8-04:** `GATE_FAILED_ADVISORY` is displayed in the History View as a standard event. It is NOT shown as a status-affecting indicator in the Pipeline View — advisory failures do not change run state.

---

### §5.5 OQ-S3-05 — Alert/Notification for Escalation (UC-10)

**Decision: Event-based; no separate notification system in v3.0**

When `CORRECTION_ESCALATED` is emitted (UC-10), the pipeline engine logs a `WARN` with `escalation_target: team_00`. The Pipeline View (`/`) displays the run status with `escalated: true` indicator.

No push notification, email, or external alerting system is implemented in v3.0. `team_00` monitors via the dashboard (Pipeline View) or by polling `GET /api/state`.

**AD-S8-05:** Escalation notification in v3.0 is passive — event emission + dashboard display + log.warn. No push/email/webhook alerting. External alerting integration deferred to v3.1.

---

## §6 — UI Pages Contract

| Page | URL | Data Source | User Actions |
|---|---|---|---|
| **Pipeline View** | `/` | `GET /api/state?domain_id=<d>` | Copy prompt, PASS (`/advance`), FAIL (`/fail`), APPROVE (`/approve`), PAUSE, RESUME, OVERRIDE |
| **History View** | `/history` | `GET /api/history` | Filter by domain/gate/event_type/actor; paginate |
| **Configuration** | `/config` | `GET /api/routing-rules`, `GET /api/templates`, `GET /api/policy` | View routing rules, manage templates, view/edit policy (team_00 only) |

### §6.1 Pipeline View (`/`)

**Data:** Calls `GET /api/state?domain_id=<selected>` on load and on interval (polling).

**Display:**
- Run status badge (IN_PROGRESS / CORRECTION / PAUSED / COMPLETE / IDLE)
- Current gate + phase
- Current actor (team_id + label + engine); **null display for PAUSED** (AD-S5-02)
- Sentinel indicator: active/inactive + override_team (AD-S5-05)
- Correction cycle count
- Execution mode
- `escalated: true` warning when `CORRECTION_ESCALATED` is latest event (OQ-S3-05 / AD-S8-05)

**Actions:** All actions call the corresponding `/api/runs/{run_id}/*` endpoint. `app.js` handles form submission and response rendering. **No business logic in `app.js`** — all validation server-side.

### §6.2 History View (`/history`)

**Data:** Calls `GET /api/history` with filter parameters.

**Display:**
- Event timeline (table or list) with: occurred_at, event_type, gate/phase, actor, verdict, reason
- `GATE_FAILED_ADVISORY` shown as standard events (AD-S8-04)
- Pagination controls (limit/offset)
- Filter controls: domain_id, gate_id, event_type dropdown (15 types), actor_team_id

### §6.3 Configuration (`/config`)

**Data:** Calls admin endpoints (§4.11).

**Display:**
- Routing rules table (read-only for non-team_00)
- Templates list with body_markdown preview; edit button (team_00 only)
- Policy list with current values

**Access:** Read access for all authenticated users; write access for `team_00` only (AD-S8-01, AD-S8-03).

**Iron Rule:** UI = reads API only. Zero business logic in `app.js`.

---

## §7 — Integration Test Cases

| TC | Name | Input | Expected Output | UC/AD | Notes |
|---|---|---|---|---|---|
| **TC-01** | Full run happy path | `POST /api/runs` (tiktrack, TRACK_FULL) → `/advance` × N → final phase | Status=COMPLETE; events: RUN_INITIATED + N × PHASE_PASSED + RUN_COMPLETED; all events in ledger with contiguous sequence_no | UC-01/02/03, AD-S7-01 | Verifies atomic TX + event chain |
| **TC-02** | Blocking fail + correction + resolve | Initiate → advance to GATE_2 → `/fail` (blocking, reason) → `/resubmit` → `/advance` (pass from CORRECTION) | Status sequence: IN_PROGRESS → CORRECTION → IN_PROGRESS → next phase; events: GATE_FAILED_BLOCKING + CORRECTION_RESUBMITTED + CORRECTION_RESOLVED; correction_cycle_count=1 (not reset) | UC-04/09/11, SM IR-9 | Verifies G03 dual-check + cycle count preservation |
| **TC-03** | Advisory fail (non-blocking) | Initiate → `/fail` with role lacking gate_role_authorities row | Status stays IN_PROGRESS; event: GATE_FAILED_ADVISORY; `blocking: false` in response | UC-05 | Verifies G03 fallback to advisory |
| **TC-04** | HITL gate approval | Initiate → advance to HITL gate (is_human_gate=1) → `/approve` (actor=team_00) | Gate advanced; event: GATE_APPROVED; actor_type=human | UC-06 | Verifies G04 + D-03 |
| **TC-05** | Pause + resume (Branch A — no reassignment) | Initiate → advance → `/pause` → `/resume` | PAUSED → IN_PROGRESS; snapshot written + cleared; events: RUN_PAUSED + RUN_RESUMED; gate/phase unchanged after resume | UC-07/08, AD-S5-02, SM IR-3/4 | Verifies atomic snapshot + exact restore |
| **TC-06** | PAUSED actor=null in GetCurrentState | After pause: `GET /api/state?domain_id=X` | `actor: null`; `sentinel` present; `status: PAUSED` | UC-13, AD-S5-02 | Verifies SQL CASE enforcement |
| **TC-07** | Sentinel bypass in routing | Set `runs.lod200_author_team=team_30` → trigger routing | Routing returns `team_30` via SENTINEL_LEGACY; WARN logged; no assignment lookup | AD-S5-05, Routing §1.3 | Verifies sentinel detection |
| **TC-08** | ROUTING_UNRESOLVED (no matching rule) | Initiate run at gate with no routing_rules | 500; `ROUTING_UNRESOLVED`; event: ROUTING_FAILED with resolution_stage=B.1 | UC-01 | Verifies fail-closed behavior |
| **TC-09** | Atomic TX rollback (AD-S7-01) | Simulate DB failure on event INSERT after runs UPDATE | runs.status unchanged (rollback); no event in ledger; `AUDIT_LEDGER_ERROR` | AD-S7-01 | Verifies TX atomicity |
| **TC-10** | Principal override — FORCE_PASS from CORRECTION | Run in CORRECTION → `/override` (FORCE_PASS, actor=team_00, reason) | Status: CORRECTION → IN_PROGRESS (or COMPLETE if final); event: PRINCIPAL_OVERRIDE with action=FORCE_PASS | UC-12, A10A | Verifies G09 + A10A |
| **TC-11** | Admin template update (OQ-S3-02) | `PUT /api/templates/{id}` with new body_markdown (actor=team_00) | Template version bumped; L4 cache invalidated; no event emitted to events table | AD-S8-01/02 | Verifies admin CRUD + no event |
| **TC-12** | Max correction cycles → escalation | Initiate → fail × (max_correction_cycles) → resubmit after max | CORRECTION_ESCALATED event; status stays CORRECTION; `escalated: true` | UC-09/10, G07/G08 | Verifies cycle counting + escalation |
| **TC-13** | GetHistory pagination + filter | 25 events in DB → `GET /api/history?limit=10&offset=10&event_type=PHASE_PASSED` | `total` = count of PHASE_PASSED events; `events` = items [10..19] of filtered set | UC-14 | Verifies pagination contract |
| **TC-14** | Wrong actor rejected | Actor ≠ current assignment team attempts `/advance` | 403; `WRONG_ACTOR` | UC-02, G02 | Verifies actor validation |

**Coverage verification:**
- [x] Happy path (TC-01)
- [x] Error paths: ROUTING_UNRESOLVED (TC-08), WRONG_ACTOR (TC-14)
- [x] Atomic TX rollback (TC-09) — AD-S7-01
- [x] PAUSED actor=null (TC-06) — AD-S5-02
- [x] Sentinel bypass (TC-07) — AD-S5-05
- [x] OQ-S3-02 admin operation (TC-11)
- [x] Correction flow: fail → resubmit → resolve (TC-02)
- [x] Max cycles escalation (TC-12)
- [x] Advisory fail (TC-03)
- [x] HITL approval (TC-04)
- [x] Pause/resume (TC-05)
- [x] Principal override (TC-10)
- [x] Pagination (TC-13)
- [x] All 14 TCs deterministic — no "should" or "may"

---

## §8 — Architectural Decisions Registry (Stage 8)

| AD ID | Decision | Locked In | Rationale |
|---|---|---|---|
| **AD-S8-01** | Admin management operations (routing rule CRUD, template CRUD, policy updates, governance version bumps) are **ADMINISTRATIVE_ONLY** — not formal UCs. Access restricted to `team_00`. No event emission. Spec amendment required to formalize as UCs. | §5.1 | Admin operations lack a `run_id` (events.run_id NOT NULL). Formalizing as UCs would require schema amendment. Complexity cost exceeds governance benefit for v3.0. |
| **AD-S8-02** | `TEMPLATE_UPDATED`, `POLICY_UPDATED`, `GOVERNANCE_VERSION_BUMPED` events will **never** be emitted to the `events` table. Event Type Registry closed at 15 types. Spec amendment required to change. | §5.2 | Consistent with AD-S8-01. `events.run_id` NOT NULL prevents admin event emission without schema change. |
| **AD-S8-03** | Actor authentication in v3.0 uses **API key per team** with `X-API-Key` header. API layer validates key → team_id mapping. No session management, no JWT. | §5.3 | Lightweight auth for v3.0 local/dev deployment. Upgrade path (OAuth/JWT) deferred to v3.1. |
| **AD-S8-04** | `GATE_FAILED_ADVISORY` displayed in History View as standard event. NOT shown as status-affecting indicator in Pipeline View. | §5.4 | Advisory failures don't change run state (T05). Dashboard should not confuse advisory with blocking. |
| **AD-S8-05** | Escalation notification in v3.0 is **passive** — event emission + dashboard display + log.warn. No push/email/webhook alerting. | §5.5 | External alerting adds infrastructure complexity. v3.0 targets single-operator (team_00) who monitors via dashboard. |

### Carried Forward ADs (verified compliance)

| AD | Requirement | Stage 8 Location | Status |
|---|---|---|---|
| AD-S5-01 | `process_variant` in resolver + API response | §3.4 resolver param, §4.9 response | ✅ |
| AD-S5-02 | `resolve_actor()` not called for PAUSED; `actor=null` | §3.4 precondition, §3.5 boundary, §4.9 response | ✅ |
| AD-S5-03 | UC-08 Branch A: snapshot read, no routing query | §3.12 resume_run, §4.6 | ✅ |
| AD-S5-05 | Sentinel `lod200_author_team` exposed in `/api/state` | §4.9 sentinel field, §6.1 display | ✅ |
| AD-S6-01 | L1+L3 never cached | §3.8 builder.py precondition, §3.9 cache | ✅ |
| AD-S6-02 | Unknown placeholder = hard failure | §3.8 TemplateRenderError | ✅ |
| AD-S6-03 | Template specificity chain | §3.10 get_active_template SQL | ✅ |
| AD-S6-04 | `prompts` table = audit/PFS only | Not referenced as mandatory in any UC | ✅ |
| AD-S6-05 | Policy resolver returns full JSON object | §3.11 get_policy_value | ✅ |
| AD-S6-06 | Template SQL uses IS NOT DISTINCT FROM | §3.10 SQL note | ✅ |
| AD-S6-07 | Token budget = advisory only | §3.8 warning-only note | ✅ |
| AD-S7-01 | State transition + event emission = atomic TX | §3.5 machine.py, TC-09 | ✅ |

---

## §9 — DDL-ERRATA-01 Status

| Item | Status |
|---|---|
| **Target** | `CREATE UNIQUE INDEX uq_templates_active_scope ON templates(gate_id, phase_id, domain_id) WHERE is_active = 1;` |
| **SSOT at time of writing** | DDL v1.0.1 — index does NOT exist |
| **Mandate** | `TEAM_100_TO_TEAM_111_DDL_ERRATA_PARTIAL_INDEX_MANDATE_v1.0.0.md` — active |
| **Mitigation** | `prompting/templates.py` enforces application-layer uniqueness check before INSERT/UPDATE |
| **Impact on Stage 8** | `templates.py` interface contract (§3.10) explicitly notes DDL-ERRATA-01 |
| **If DDL v1.0.2 is published** | Update SSOT reference; `templates.py` application-layer check becomes defense-in-depth |

---

## Pre-submission Checklist

**Module Map (§1):**
- [x] Every file in tree defined with purpose + SSOT stage
- [x] `governance/` module includes `artifact_index.py` + `archive.py` (§ו.6 addendum)
- [x] `definition.yaml` defined as SSOT for seed data

**UC Mapping (§2):**
- [x] All UC-01..UC-14 present in map — zero gaps
- [x] OQ-S3-02 resolved as ADMINISTRATIVE_ONLY — no UC-15+
- [x] Each UC maps to exactly one module

**Interface Contracts (§3):**
- [x] All public functions in 9 modules: full signature, types, raises, dependencies
- [x] Dependency graph defined and acyclic (§3.0)
- [x] AD-S5-02 PAUSED boundary in `resolve_actor()` (§3.4) and `machine.py` (§3.5)
- [x] AD-S7-01 atomic TX in `machine.py` (§3.5)

**API Spec (§4):**
- [x] All endpoints: method, path, request schema, response schema
- [x] All error codes from §6 Stage 7 only (39 codes) — no invented codes
- [x] `/api/state` response = exact match of Stage 7 §4.2 (§4.9)
- [x] `/api/history` response = exact match of Stage 7 §5.3 (§4.10)

**OQ Closures (§5):**
- [x] OQ-S3-02: ADMINISTRATIVE_ONLY — locked as AD-S8-01
- [x] OQ-S7-01: NO_EVENTS — locked as AD-S8-02
- [x] OQ-S3-03: API key auth — locked as AD-S8-03
- [x] OQ-S3-04: Advisory in History View — locked as AD-S8-04
- [x] OQ-S3-05: Passive alerting — locked as AD-S8-05

**Integration Tests (§7):**
- [x] 14 test cases (> minimum 12)
- [x] Coverage: atomic TX (TC-09), PAUSED actor=null (TC-06), sentinel bypass (TC-07), OQ-S3-02 admin (TC-11)
- [x] All TCs deterministic — no "should" or "may"

**DDL-ERRATA-01 (§9):**
- [x] Explicit note that DDL v1.0.1 = SSOT until errata complete
- [x] `templates.py` interface contract notes application-layer uniqueness enforcement

---

**log_entry | TEAM_100 | STAGE8_MODULE_MAP_INTEGRATION_SPEC | v1.0.1 | CC1_REMEDIATION | F-01_F-02_CLOSED | 2026-03-26**
**log_entry | TEAM_100 | STAGE8_MODULE_MAP_INTEGRATION_SPEC | v1.0.2 | CC2_AUTHORITY_MODEL | NOT_PRINCIPAL_REPLACED_x8 | 2026-03-28**
