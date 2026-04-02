---
id: TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.3
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 190 (Reviewer), Team 00 (Gate Approver)
date: 2026-03-28
stage: SPEC_STAGE_7
supersedes: TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.2
correction_cycle: 3
ssot_basis:
  - TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
  - TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md
  - TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md
  - TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md
  - TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md
  - TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md
status: RESUBMITTED_FOR_REVIEW
reviewer: team_190
gate_approver: team_00
architectural_decisions_carried: AD-S5-01, AD-S5-02, AD-S5-05, AD-S6-01, AD-S6-02, AD-S6-03, AD-S6-04, AD-S6-05, AD-S6-07
team_190_review_round1: TEAM_190_AOS_V3_EVENT_OBSERVABILITY_SPEC_REVIEW_v1.0.0.md
team_190_review_round2: TEAM_190_AOS_V3_EVENT_OBSERVABILITY_SPEC_REVIEW_v1.0.1.md
team_00_gate_review: correction_cycle_2
findings_addressed_cc1: F-01, F-02, F-03, F-04, F-05
findings_addressed_cc2: G-01---

# AOS v3 — Event & Observability Spec (Stage 7) — v1.0.2

## Remediation History

### Round 1 (v1.0.0 → v1.0.1) — Team 190 CONDITIONAL_PASS → PASS

| Finding | Severity | Section | Fix Applied |
|---|---|---|---|
| **F-01** | MAJOR | §6.2 | Added `ROUTING_MISCONFIGURATION` to Routing Spec error codes. Source: Routing Spec v1.0.1 EC-01. |
| **F-02** | MAJOR | §2.2 | Fixed ROUTING_FAILED payload: renamed `failure_reason` → `reason` (per Stage 5 canonical INSERT); added optional `role_id` key (present in B.2 per Routing Spec TC-13). |
| **F-03** | MAJOR | §4.4 | Fixed GetCurrentState SQL: added `a.domain_id = r.domain_id` domain scoping; added `LEFT JOIN pipeline_roles`; added explicit `CASE WHEN r.status = 'PAUSED' THEN NULL` for actor columns (AD-S5-02 enforcement at SQL level). |
| **F-04** | MINOR | §3.2 | Harmonized error codes: `limit` out-of-range → `INVALID_LIMIT`; `event_type` unknown → `INVALID_EVENT_TYPE`. `INVALID_HISTORY_PARAMS` retained for generic param errors (offset, order). |
| **F-05** | MINOR | §6.1 | Removed UC-08 from `ROUTING_UNRESOLVED` mapping. UC-08 uses `ROUTING_RESOLUTION_FAILED` (separate code). `ROUTING_UNRESOLVED` now mapped to UC-01 only. |

### Round 2 (v1.0.1 → v1.0.2) — Team 00 Gate Review

| Finding | Severity | Section | Fix Applied |
|---|---|---|---|
| **G-01** | MINOR | §6 | Corrected error code total count: 34 → **39** (v1.0.1); then 39 → **38** (v1.0.3: NOT_PRINCIPAL merged into INSUFFICIENT_AUTHORITY per AUTHORITY_MODEL v1.0.0 §8). |

---

## SSOT Alignment Corrections

The activation prompt drafts contained field names and UC mappings that **diverge** from canonical SSOT. The following corrections were applied per Iron Rule #1 ("SSOT first"):

| Draft Term | SSOT Correction | Source |
|---|---|---|
| `events.created_at` | **`occurred_at`** — DDL column name | DDL v1.0.1 §2 `events` |
| `events.payload` (JSONB) | **`payload_json`** (TEXT) — DDL type | DDL v1.0.1 §2 `events` |
| `events.correlation_id` | **Does not exist** in DDL. Correlation via `payload_json` only. | DDL v1.0.1 §2 `events` |
| `events.run_id` nullable | **NOT NULL** in DDL. All events require a run_id. | DDL v1.0.1 §2 `events` |
| Missing DDL columns | DDL has `sequence_no`, `domain_id`, `work_package_id`, `actor_type`, `verdict`, `reason`, `prev_hash`, `event_hash` — all required in schema. | DDL v1.0.1 §2 `events` |
| "UC-05: GetCurrentState" | **UC-13** = GetCurrentState (UC-05 = FailGate Advisory in UC Catalog v1.0.3) | UC Catalog v1.0.3 |
| "UC-06: GetHistory" | **UC-14** = GetHistory (UC-06 = HumanApprove in UC Catalog v1.0.3) | UC Catalog v1.0.3 |
| "UC-12: UpdateTemplate" | **UC-12** = PrincipalOverride (template/policy admin = OQ-S3-02, not a cataloged UC) | UC Catalog v1.0.3 |
| "UC-13: UpdatePolicy" | **UC-13** = GetCurrentState (same OQ-S3-02 note) | UC Catalog v1.0.3 |
| "UC-14: ResetRun" | **UC-14** = GetHistory (ABORTED deferred to v3.1; no ResetRun UC) | UC Catalog v1.0.3 |
| "UC-08: ExecuteAgent" | **UC-08** = ResumeRun (no ExecuteAgent UC in v1.0.3) | UC Catalog v1.0.3 |

---

## §1 — Event Type Registry

### 1.1 Standard Events

Derived from State Machine Spec v1.0.2 `Event Emitted` column. **14 standard event types.**

| event_type | SM Ref | Trigger UC | State Transition | Actor | actor_type | verdict | Retention |
|---|---|---|---|---|---|---|---|
| `RUN_INITIATED` | T01 | UC-01 | NOT_STARTED → IN_PROGRESS | pipeline_engine | `system` | — | permanent |
| `PHASE_PASSED` | T02 | UC-02 | IN_PROGRESS → IN_PROGRESS (non-final) | current_team | `agent` | `PASS` | permanent |
| `RUN_COMPLETED` | T03 | UC-03 | IN_PROGRESS → COMPLETE (final gate) | current_team | `agent` | `PASS` | permanent |
| `GATE_FAILED_BLOCKING` | T04 | UC-04 | IN_PROGRESS → CORRECTION | current_team | `agent` | `FAIL` | permanent |
| `GATE_FAILED_ADVISORY` | T05 | UC-05 | IN_PROGRESS → IN_PROGRESS (no state change) | current_team | `agent` | `ADVISORY_FAIL` | permanent |
| `GATE_APPROVED` | T06 | UC-06 | IN_PROGRESS → IN_PROGRESS (HITL advance) | team_00 | `human` | `APPROVED` | permanent |
| `RUN_PAUSED` | T07 | UC-07 | IN_PROGRESS → PAUSED | team_00 | `human` | — | permanent |
| `RUN_RESUMED` | T08 | UC-08 | PAUSED → IN_PROGRESS (no assignment change) | team_00 | `human` | — | permanent |
| `RUN_RESUMED_WITH_NEW_ASSIGNMENT` | T08/EC-10 | UC-08 | PAUSED → IN_PROGRESS (assignment changed during pause) | team_00 | `human` | — | permanent |
| `CORRECTION_RESUBMITTED` | T09 | UC-09 | CORRECTION → IN_PROGRESS (under max cycles) | current_team | `agent` | — | permanent |
| `CORRECTION_ESCALATED` | T10 | UC-10 | CORRECTION → CORRECTION (max cycles reached; blocked) | current_team | `agent` | — | permanent |
| `CORRECTION_RESOLVED` | T11 | UC-11 | CORRECTION → IN_PROGRESS (pass from correction) | current_team | `agent` | `PASS` | permanent |
| `PRINCIPAL_OVERRIDE` | T12 | UC-12 | ANY non-terminal → per action (A10A–A10E) | team_00 | `human` | per action | permanent |
| `TEAM_ASSIGNMENT_CHANGED` | §9/EC-05 | manual | No run state transition (assignment-level) | team_00 | `human` | — | permanent |

### 1.2 Error Events

Error events are emitted for observability when system errors occur during pipeline execution. They do **not** cause state transitions — the run remains in its current state.

| event_type | Trigger | Source Stage | Actor | actor_type | verdict | Retention |
|---|---|---|---|---|---|---|
| `ROUTING_FAILED` | `resolve_actor()` finds no matching rule (B.1) or no active assignment (B.2) | Stage 5 | system | `system` | — | permanent |

**Note on prompt assembly errors:** `TEMPLATE_NOT_FOUND`, `TEMPLATE_RENDER_ERROR`, `GOVERNANCE_NOT_FOUND`, and `INVALID_RUN_STATUS` are **error codes** (§6) that halt prompt assembly. They are **not** emitted as event types to the `events` table. Prompt assembly errors are raised as exceptions to the calling pipeline_engine, which handles logging and escalation. If future observability requirements demand event emission for these errors, a Stage 8 amendment would add them.

### 1.3 System Events (No run_id)

**None.** DDL v1.0.1 defines `events.run_id` as `TEXT NOT NULL` — every event must be associated with a run. System-level registration events (e.g., domain registration, team registration) are NOT modeled in the events table. If needed, they would require a separate audit mechanism (deferred to Stage 8 / OQ-S3-02).

### 1.4 OQ-S7-01 — Admin Management Events (Deferred to Stage 8)

Per Stage 6 §11 forward dependency: admin management event types are NOT defined in this registry.

| Candidate event_type | Status | Reason |
|---|---|---|
| `TEMPLATE_UPDATED` | DEFERRED | OQ-S3-02 scope — template admin UC not cataloged |
| `POLICY_UPDATED` | DEFERRED | OQ-S3-02 scope — policy admin UC not cataloged |
| `GOVERNANCE_VERSION_BUMPED` | DEFERRED | OQ-S3-02 scope — governance admin not cataloged |

**OQ-S7-01:** Admin management event types (TEMPLATE_UPDATED, POLICY_UPDATED, GOVERNANCE_VERSION_BUMPED) are deferred to Stage 8 pending OQ-S3-02 closure. Stage 7 §1 covers UC-01 through UC-14 main-flow events only.

### 1.5 Explicitly Excluded

| Candidate | Why Excluded | AD Reference |
|---|---|---|
| `TOKEN_BUDGET_EXCEEDED` | AD-S6-07: token budget = advisory only. No event, no error code. Spec amendment required to add. | AD-S6-07 §10 |

**Total event types: 15** (14 standard + 1 error).

---

## §2 — Event Schema

### 2.1 Base Schema (all events)

Derived from DDL v1.0.1 `events` table. **All field names match DDL exactly.**

| Field | Type | Nullable | Source | Business Rule |
|---|---|---|---|---|
| `id` | TEXT | NO | `ulid()` | PK; auto-generated; globally unique |
| `run_id` | TEXT | NO | caller | FK → `runs.id` ON DELETE RESTRICT; every event belongs to a run |
| `sequence_no` | INTEGER | NO | `append_event()` | Monotonically increasing per `run_id`; UNIQUE with `(run_id, sequence_no)` |
| `event_type` | TEXT | NO | caller | Must be in Event Type Registry §1; validated by `append_event()` |
| `gate_id` | TEXT | YES | caller | FK → `gates.id`; NULL for pre-gate events or system events |
| `phase_id` | TEXT | YES | caller | Composite FK `(gate_id, phase_id)` → `phases`; NULL if gate is phaseless |
| `domain_id` | TEXT | NO | caller | FK → `domains.id`; denormalized from `runs.domain_id` for query performance |
| `work_package_id` | TEXT | NO | caller | Denormalized from `runs.work_package_id` |
| `actor_team_id` | TEXT | YES | caller | FK → `teams.id`; NULL for automated system events with no team actor |
| `actor_type` | TEXT | NO | caller | `human` \| `agent` \| `scheduler` \| `system` (Entity Dict §Event) |
| `verdict` | TEXT | YES | caller | `PASS` \| `FAIL` \| `ADVISORY_FAIL` \| `APPROVED` \| per action; NULL if not applicable |
| `reason` | TEXT | YES | caller | Free text; max length = application-enforced; used for failures, overrides, escalations |
| `payload_json` | TEXT | YES | caller | JSON string with event-specific data (see §2.2); NULL for simple transitions |
| `occurred_at` | TIMESTAMPTZ | NO | caller (`now()`) | UTC; set by caller at emission time (DDL has no DEFAULT) |
| `prev_hash` | TEXT | YES | `append_event()` | Hash of previous event for this `run_id`; NULL for first event of a run |
| `event_hash` | TEXT | NO | `append_event()` | SHA-256 hash of event content; UNIQUE constraint (`uq_events_event_hash`) |

**Indexes (DDL v1.0.1 §4):**
- `pk_events` — PRIMARY KEY on `id`
- `uq_events_event_hash` — UNIQUE on `event_hash`
- `uq_evt_run_seq` — UNIQUE on `(run_id, sequence_no)`
- `idx_events_run_seq` — INDEX on `(run_id, sequence_no)`

### 2.2 Payload Schemas (per event_type)

#### RUN_INITIATED
```json
{
  "process_variant": "string — TRACK_FULL | TRACK_FOCUSED | TRACK_FAST",
  "initial_gate_id": "string — first gate of the run (= gate_id on event)",
  "initial_phase_id": "string | null — first phase",
  "initial_actor_team_id": "string | null — resolved team at GATE_0; null if ROUTING_FAILED"
}
```

#### PHASE_PASSED
```json
{
  "from_gate_id": "string — gate before advance",
  "from_phase_id": "string | null — phase before advance",
  "to_gate_id": "string — gate after advance",
  "to_phase_id": "string | null — phase after advance"
}
```

#### RUN_COMPLETED
```json
{
  "final_gate_id": "string — last gate passed",
  "total_correction_cycles": "integer — total correction_cycle_count at completion",
  "completed_at": "ISO-8601 — runs.completed_at value"
}
```

#### GATE_FAILED_BLOCKING
```json
{
  "correction_cycle": "integer — correction_cycle_count AFTER this failure (post-increment)"
}
```
**Note:** `reason` is in the base `reason` column, not payload.

#### GATE_FAILED_ADVISORY
```json
null
```
**Note:** Advisory failure = WARN log only; no state change. `reason` in base `reason` column if provided. Minimal payload.

#### GATE_APPROVED
```json
null
```
**Note:** HITL approval by team_00. `verdict` = `APPROVED` in base column. Gate/phase advancement handled by same logic as PHASE_PASSED.

#### RUN_PAUSED
```json
{
  "paused_at": "ISO-8601 — runs.paused_at value",
  "snapshot_written": "boolean — true if paused_routing_snapshot_json populated"
}
```

#### RUN_RESUMED
```json
{
  "branch": "A — snapshot used (no TEAM_ASSIGNMENT_CHANGED)",
  "resume_notes": "string | null"
}
```

#### RUN_RESUMED_WITH_NEW_ASSIGNMENT
```json
{
  "branch": "B — live assignment used (TEAM_ASSIGNMENT_CHANGED detected)",
  "old_assignment_team_id": "string — team from snapshot",
  "new_assignment_team_id": "string — team from live resolution",
  "assignment_changed_event_id": "string — id of TEAM_ASSIGNMENT_CHANGED event"
}
```

#### CORRECTION_RESUBMITTED
```json
{
  "correction_cycle": "integer — current correction_cycle_count",
  "resubmit_notes": "string | null"
}
```

#### CORRECTION_ESCALATED
```json
{
  "correction_cycle": "integer — current count",
  "max_correction_cycles": "integer — policy max value",
  "escalation_target": "team_00"
}
```

#### CORRECTION_RESOLVED
```json
{
  "correction_cycle": "integer — correction_cycle_count (not reset; audit)"
}
```

#### PRINCIPAL_OVERRIDE
```json
{
  "action": "FORCE_PASS | FORCE_FAIL | FORCE_PAUSE | FORCE_RESUME | FORCE_CORRECTION",
  "from_state": "string — run.status before override",
  "to_state": "string — run.status after override"
}
```
**Note:** `reason` is REQUIRED in base `reason` column (UC-12 MISSING_REASON error if absent).

#### TEAM_ASSIGNMENT_CHANGED
```json
{
  "old_assignment_id": "string — superseded assignment id",
  "new_assignment_id": "string — new active assignment id",
  "approved_by": "string — team_id (typically team_00)",
  "reason_code": "string — justification code"
}
```
**Note:** Entity Dict §Event inv. 4 mandates this event for every active assignment change after GATE_0.

#### ROUTING_FAILED
```json
{
  "resolution_stage": "B.1 | B.2",
  "variant": "string — process_variant at failure",
  "reason": "NO_MATCHING_RULE | NO_ACTIVE_ASSIGNMENT",
  "role_id": "string | null — resolved role_id; present in B.2 (NO_ACTIVE_ASSIGNMENT); null in B.1"
}
```
**Note:** `reason` base column = same value as payload `reason` key. Payload key name aligns with Stage 5 canonical INSERT (Routing Spec v1.0.1 §3 `ROUTING_FAILED` event). `role_id` is present when resolution reached stage B.2 (role resolved but no assignment found). Error code `ROUTING_UNRESOLVED` raised to caller.

### 2.3 run_id NOT NULL — Design Justification

DDL v1.0.1 defines `events.run_id TEXT NOT NULL` with FK → `runs.id`. All events require an associated run. System-level events without a run context are not supported in the current schema.

**Consequence:** §1.3 confirms no system events exist. If future requirements need run-independent events (OQ-S3-02 admin operations), a schema amendment (nullable run_id or a separate audit table) would be required in Stage 8.

---

## §3 — Audit Ledger Contract

### 3.1 append_event()

```
Signature:
  append_event(
    run_id:          str,              ← NOT NULL; FK → runs.id
    event_type:      str,              ← must be in §1 Event Type Registry
    gate_id:         str | None,
    phase_id:        str | None,
    domain_id:       str,              ← NOT NULL; denormalized from run
    work_package_id: str,              ← NOT NULL; denormalized from run
    actor_team_id:   str | None,
    actor_type:      str,              ← human | agent | scheduler | system
    verdict:         str | None,
    reason:          str | None,
    payload_json:    str | None,       ← JSON string
  ) -> str                             ← returns event.id (ulid)

Internal computation (not caller-provided):
  - id           = ulid()
  - sequence_no  = (SELECT COALESCE(MAX(sequence_no), 0) + 1
                    FROM events WHERE run_id = :run_id)
  - occurred_at  = now() (UTC)
  - prev_hash    = (SELECT event_hash FROM events
                    WHERE run_id = :run_id
                    ORDER BY sequence_no DESC LIMIT 1)
                   — NULL for first event of a run
  - event_hash   = sha256(id || run_id || sequence_no || event_type
                          || occurred_at || COALESCE(payload_json, ''))

Preconditions:
  1. event_type ∈ Event Type Registry §1
  2. run_id exists in runs table
  3. actor_type ∈ {'human', 'agent', 'scheduler', 'system'}
  4. If gate_id provided → gate must exist in gates table
  5. If phase_id provided → (gate_id, phase_id) must exist in phases table

Postconditions:
  1. One row appended to events table (INSERT only, never UPDATE)
  2. occurred_at = UTC timestamp at emission time
  3. sequence_no = contiguous, monotonically increasing per run_id
  4. event_hash = unique; prev_hash chains to prior event
  5. Returns event.id

Guarantees:
  - Append-only: no UPDATE or DELETE ever issued on events table (§8.4 Iron Rule)
  - Non-blocking on callers: caller does not wait for downstream consumers
  - Monotonic ordering: events for a given run_id ordered by (sequence_no ASC, occurred_at ASC)
  - Hash chain integrity: prev_hash links to prior event's event_hash for a given run_id

Error behavior:
  - event_type not in §1 → raise UnknownEventTypeError(event_type)
  - run_id not found → raise RunNotFoundError(run_id)
  - DB write failure → raise AuditLedgerError(reason); caller handles rollback/retry
  - Duplicate event_hash (hash collision) → raise AuditLedgerError("hash_collision")
```

### 3.2 query_events()

```
Signature:
  query_events(
    run_id:         str | None = None,
    event_type:     str | None = None,
    gate_id:        str | None = None,
    domain_id:      str | None = None,
    actor_team_id:  str | None = None,
    limit:          int = 50,           ← default 50, max 200 (Iron Rule)
    offset:         int = 0,
    order:          "asc" | "desc" = "desc"
  ) -> list[EventRecord]

Rules:
  - All filters AND-combined
  - limit must be in range [1, 200]; values outside raise INVALID_LIMIT
  - offset must be >= 0; negative raises INVALID_HISTORY_PARAMS
  - order applies to occurred_at (then sequence_no as tiebreaker)
  - Returns empty list if no matches (never raises on empty result)
  - event_type filter validated against §1 registry; unknown → INVALID_EVENT_TYPE

SQL contract (canonical):
  SELECT e.*
  FROM events e
  WHERE
    (:run_id IS NULL OR e.run_id = :run_id)
    AND (:event_type IS NULL OR e.event_type = :event_type)
    AND (:gate_id IS NULL OR e.gate_id = :gate_id)
    AND (:domain_id IS NULL OR e.domain_id = :domain_id)
    AND (:actor_team_id IS NULL OR e.actor_team_id = :actor_team_id)
  ORDER BY e.occurred_at {ASC|DESC}, e.sequence_no {ASC|DESC}
  LIMIT :limit OFFSET :offset
```

**Note:** `domain_id` is denormalized on the events table (DDL v1.0.1). No JOIN with `runs` is required for domain filtering — this is a direct column filter.

---

## §4 — State Observability (UC-13: GetCurrentState)

Derived from UC Catalog v1.0.3 §UC-13 (QO-01 StateQuery). Read-only query — no state transition, no event emitted.

### 4.1 Request

```
GET /api/state?run_id=<run_id>
GET /api/state?domain_id=<domain_id>
```

One of `run_id` or `domain_id` is required. If `domain_id` is provided without `run_id`, resolves to the active run (`status IN ('IN_PROGRESS', 'CORRECTION', 'PAUSED')`) for that domain.

### 4.2 Response Schema

```json
{
  "run_id":                "string | null",
  "work_package_id":       "string | null",
  "domain_id":             "string",
  "process_variant":       "string | null",
  "status":                "NOT_STARTED | IN_PROGRESS | CORRECTION | PAUSED | COMPLETE | IDLE",
  "current_gate_id":       "string | null",
  "current_phase_id":      "string | null",
  "correction_cycle_count": "integer",
  "paused_at":             "ISO-8601 | null",
  "completed_at":          "ISO-8601 | null",
  "started_at":            "ISO-8601 | null",
  "last_updated":          "ISO-8601 | null",
  "actor": {
    "team_id":  "string",
    "label":    "string",
    "engine":   "string"
  },
  "sentinel": {
    "active":        "boolean",
    "override_team": "string | null"
  },
  "execution_mode":        "MANUAL | DASHBOARD | AUTOMATIC | null"
}
```

### 4.3 Assembly Logic

| Field | Source | Assembly Rule |
|---|---|---|
| `run_id` | `runs.id` | Direct; null if IDLE |
| `work_package_id` | `runs.work_package_id` | Direct; null if IDLE |
| `domain_id` | input parameter | Always present |
| `process_variant` | `runs.process_variant` | Direct (AD-S5-01); null if IDLE |
| `status` | `runs.status` | Direct; `IDLE` if no active run for domain |
| `current_gate_id` | `runs.current_gate_id` | Direct; null if IDLE |
| `current_phase_id` | `runs.current_phase_id` | Direct; null if IDLE |
| `correction_cycle_count` | `runs.correction_cycle_count` | Direct; 0 if IDLE |
| `paused_at` | `runs.paused_at` | Direct; null if not PAUSED or IDLE |
| `completed_at` | `runs.completed_at` | Direct; null if not COMPLETE or IDLE |
| `started_at` | `runs.started_at` | Direct; null if IDLE |
| `last_updated` | `runs.last_updated` | Direct; null if IDLE |
| `actor` | routing resolver → `assignments` → `teams` | `{team_id, label, engine}` from resolved team; **null if PAUSED** (AD-S5-02: routing not called for PAUSED) or IDLE |
| `sentinel` | `runs.lod200_author_team` | AD-S5-05: `{active: true, override_team: <value>}` if non-null; `{active: false, override_team: null}` if null; entire field = null if IDLE |
| `execution_mode` | `runs.execution_mode` | Direct; null if IDLE |

### 4.4 SQL (canonical)

```sql
-- GetCurrentState by domain_id
-- Aligned with UC Catalog v1.0.3 §UC-13 query shape
SELECT
  r.id AS run_id,
  r.work_package_id,
  r.domain_id,
  r.process_variant,
  r.status,
  r.current_gate_id,
  r.current_phase_id,
  r.correction_cycle_count,
  r.paused_at,
  r.completed_at,
  r.started_at,
  r.last_updated,
  r.lod200_author_team,
  r.execution_mode,
  CASE WHEN r.status = 'PAUSED' THEN NULL ELSE t.id END    AS actor_team_id,
  CASE WHEN r.status = 'PAUSED' THEN NULL ELSE t.label END AS actor_label,
  CASE WHEN r.status = 'PAUSED' THEN NULL ELSE t.engine END AS actor_engine
FROM runs r
LEFT JOIN assignments a
  ON a.work_package_id = r.work_package_id
  AND a.domain_id = r.domain_id
  AND a.status = 'ACTIVE'
LEFT JOIN pipeline_roles pr
  ON pr.id = a.role_id
LEFT JOIN teams t
  ON t.id = a.team_id
WHERE r.domain_id = :domain_id
  AND r.status IN ('IN_PROGRESS', 'CORRECTION', 'PAUSED')
ORDER BY r.started_at DESC
LIMIT 1;
```

**AD-S5-02 enforcement:** `CASE WHEN r.status = 'PAUSED' THEN NULL` ensures `actor` columns are NULL at the SQL level for PAUSED runs. Routing (`resolve_actor()`) is not called for PAUSED runs — the SQL enforces this contract directly rather than relying on application-layer nullification.

**Note:** If no row returned → `status = IDLE`, all run fields null.

### 4.5 No-Run Case (status = IDLE)

When no active run for `domain_id`:
- `run_id`, `work_package_id`, `current_gate_id`, `current_phase_id`, `actor`, `process_variant`, `sentinel`, `paused_at`, `completed_at`, `started_at`, `last_updated`, `execution_mode` = null
- `status` = `IDLE`
- `correction_cycle_count` = 0

### 4.6 Error Behavior

| Condition | Error Code | HTTP | Response |
|---|---|---|---|
| `run_id` provided but not found | `RUN_NOT_FOUND` | 404 | `{"error": "RUN_NOT_FOUND", "run_id": "<value>"}` |
| No active run for domain | `NO_ACTIVE_RUN` | 200 | IDLE response (§4.5) — not an error |
| Neither `run_id` nor `domain_id` provided | `INVALID_HISTORY_PARAMS` | 400 | `{"error": "INVALID_HISTORY_PARAMS", "message": "run_id or domain_id required"}` |

---

## §5 — History Queries (UC-14: GetHistory)

Derived from UC Catalog v1.0.3 §UC-14 (QO-02 HistoryQuery). Read-only query — no state transition, no event emitted.

### 5.1 Request

```
GET /api/history
```

### 5.2 Query Parameters

| Param | Type | Required | Default | Max | Validation |
|---|---|---|---|---|---|
| `run_id` | string | NO | null | — | Must be valid ULID if provided |
| `domain_id` | string | NO | null | — | Must exist in `domains` table if provided |
| `gate_id` | string | NO | null | — | Must exist in `gates` table if provided |
| `event_type` | string | NO | null | — | Must be in §1 registry if provided; else `INVALID_EVENT_TYPE` |
| `actor_team_id` | string | NO | null | — | Must exist in `teams` table if provided |
| `limit` | integer | NO | 50 | 200 | Clamped to [1, 200]; values < 1 or > 200 → `INVALID_LIMIT` |
| `offset` | integer | NO | 0 | — | Must be ≥ 0; negative → `INVALID_HISTORY_PARAMS` |
| `order` | "asc" \| "desc" | NO | "desc" | — | Reject if neither → `INVALID_HISTORY_PARAMS` |

### 5.3 Response Schema

```json
{
  "total":  "integer — count of all matching rows before pagination",
  "limit":  "integer — effective limit applied",
  "offset": "integer — effective offset applied",
  "events": [
    {
      "id":              "string — event ULID",
      "run_id":          "string",
      "sequence_no":     "integer",
      "event_type":      "string",
      "gate_id":         "string | null",
      "phase_id":        "string | null",
      "domain_id":       "string",
      "work_package_id": "string",
      "actor": {
        "team_id": "string | null",
        "label":   "string | null",
        "type":    "string — human | agent | scheduler | system"
      },
      "verdict":         "string | null",
      "reason":          "string | null",
      "payload_json":    "object | null — parsed JSON",
      "occurred_at":     "ISO-8601 UTC"
    }
  ]
}
```

### 5.4 SQL Contract (canonical)

```sql
-- Data query
SELECT
  e.id, e.run_id, e.sequence_no, e.event_type,
  e.gate_id, e.phase_id, e.domain_id, e.work_package_id,
  e.actor_team_id, e.actor_type, e.verdict, e.reason,
  e.payload_json, e.occurred_at,
  t.label AS actor_label
FROM events e
LEFT JOIN teams t ON t.id = e.actor_team_id
WHERE
  (:run_id IS NULL OR e.run_id = :run_id)
  AND (:domain_id IS NULL OR e.domain_id = :domain_id)
  AND (:gate_id IS NULL OR e.gate_id = :gate_id)
  AND (:event_type IS NULL OR e.event_type = :event_type)
  AND (:actor_team_id IS NULL OR e.actor_team_id = :actor_team_id)
ORDER BY e.occurred_at DESC, e.sequence_no DESC
LIMIT :limit OFFSET :offset;

-- Count query (separate)
SELECT COUNT(*) AS total
FROM events e
WHERE [same WHERE clause as above];
```

### 5.5 Pagination Contract

- `total` = COUNT(*) of all matching rows (regardless of limit/offset)
- `events` = rows in range [offset, offset+limit)
- If offset ≥ total: return `events: []`, `total: N`
- `total` is always the full count for the given filter parameters

### 5.6 Error Behavior

| Condition | Error Code | HTTP | Response |
|---|---|---|---|
| Unknown `event_type` filter | `INVALID_EVENT_TYPE` | 400 | `{"error": "INVALID_EVENT_TYPE", "event_type": "<value>"}` |
| `limit` < 1 or > 200 | `INVALID_LIMIT` | 400 | `{"error": "INVALID_LIMIT", "limit": <value>, "max": 200}` |
| `offset` < 0 | `INVALID_HISTORY_PARAMS` | 400 | `{"error": "INVALID_HISTORY_PARAMS", "message": "offset must be >= 0"}` |
| No results | `NO_RESULTS` | 200 | `{"total": 0, "limit": N, "offset": M, "events": []}` — not an error |

---

## §6 — Error Code Registry

Canonical, exhaustive list of all error codes in AOS v3. **Stage 7 closes this list.**

### 6.1 UC Catalog Error Codes (UC-01 through UC-14)

| Error Code | UC(s) | HTTP | Category | Description | Retry? |
|---|---|---|---|---|---|
| `DOMAIN_ALREADY_ACTIVE` | UC-01 | 409 | APPLICATION | Active run already exists for domain_id; returns existing run_id + status | No |
| `UNKNOWN_WP` | UC-01 | 400 | VALIDATION | work_package_id not found in registry | No |
| `DOMAIN_INACTIVE` | UC-01 | 400 | VALIDATION | domain is not active (`is_active=0`) | No |
| `ROUTING_UNRESOLVED` | UC-01 | 500 | SYSTEM | No routing rule matched or no active assignment; auto-escalates to team_00 | No |
| `WRONG_ACTOR` | UC-02/03/04/05/09/11 | 403 | APPLICATION | Requesting team is not current actor for this run | No |
| `INVALID_STATE` | UC-02/03/04/06/08/09/10/11 | 409 | APPLICATION | Run status does not permit requested operation | No |
| `PHASE_ALREADY_ADVANCED` | UC-02 | 409 | APPLICATION | Idempotent — phase already advanced; returns current state | No |
| `PHASE_SEQUENCE_ERROR` | UC-02 | 500 | SYSTEM | Phase ordering inconsistency; escalate to team_00 | No |
| `NOT_FINAL_PHASE` | UC-03 | 409 | APPLICATION | CompleteRun called but phase is not final; routing/sequence error | No |
| `INSUFFICIENT_AUTHORITY` | UC-04/06/07/08/12 | 403 | APPLICATION | Caller lacks required authority tier for this operation — role-based (UC-04: no `gate_role_authorities` row; non-blocking path → UC-05) or principal-level (UC-06/07/08/12: operation requires Tier 1 authority per AUTHORITY_MODEL v1.0.0 §3). Prior code `NOT_PRINCIPAL` merged per directive §8. | No |
| `MISSING_REASON` | UC-04, UC-12 | 400 | VALIDATION | Reason text required for blocking fail or principal override | No |
| `UNEXPECTED_BLOCKING` | UC-05 | 409 | APPLICATION | Advisory fail received blocking authority unexpectedly; routing to UC-04 | No |
| `NOT_HITL_GATE` | UC-06 | 400 | VALIDATION | HumanApprove called on non-HITL gate (`is_human_gate=0`) | No |
| `INVALID_STATE_TRANSITION` | UC-07 | 409 | APPLICATION | Run is already PAUSED or not IN_PROGRESS | No |
| `SNAPSHOT_VALIDATION_FAILED` | UC-07 | 422 | VALIDATION | Pause snapshot content failed validation | No |
| `SNAPSHOT_WRITE_FAILED` | UC-07 | 500 | SYSTEM | DB failure writing pause snapshot; full rollback | Yes |
| `SNAPSHOT_MISSING` | UC-08 | 409 | APPLICATION | Resume requires snapshot but `paused_routing_snapshot_json` is NULL; use UC-12 FORCE_RESUME | No |
| `ROUTING_RESOLUTION_FAILED` | UC-08 | 500 | SYSTEM | Live routing re-resolution failed during resume; escalate to team_00 | No |
| `MAX_CYCLES_REACHED` | UC-09 | 409 | APPLICATION | Correction cycle count >= max_correction_cycles policy; escalation required | No |
| `MISSING_NOTES` | UC-09 | 400 | VALIDATION | Resubmit notes required for correction cycle audit | No |
| `CYCLES_NOT_EXHAUSTED` | UC-10 | 409 | APPLICATION | Escalation requested but max cycles not yet reached; routing error | No |
| `INVALID_ACTION` | UC-12 | 400 | VALIDATION | Principal override action not in {FORCE_PASS, FORCE_FAIL, FORCE_PAUSE, FORCE_RESUME, FORCE_CORRECTION} | No |
| `TERMINAL_STATE` | UC-12 | 409 | APPLICATION | Override attempted on COMPLETE run (terminal state) | No |
| `SNAPSHOT_REQUIRED` | UC-12 | 400 | VALIDATION | FORCE_RESUME requires manual snapshot provision | No |
| `RUN_NOT_FOUND` | UC-13 | 404 | APPLICATION | run_id does not exist in runs table | No |
| `NO_ACTIVE_RUN` | UC-13 | 200 | RESPONSE | No active run for domain; returns IDLE state (§4.5) — not an error | — |
| `INVALID_EVENT_TYPE` | UC-14 | 400 | VALIDATION | event_type filter value not in §1 registry | No |
| `INVALID_LIMIT` | UC-14 | 400 | VALIDATION | limit value outside [1, 200] range | No |
| `NO_RESULTS` | UC-14 | 200 | RESPONSE | Query returned 0 matching events; returns empty list — not an error | — |

### 6.2 Routing Spec Error Codes

| Error Code | Source | HTTP | Category | Description | Retry? |
|---|---|---|---|---|---|
| `ROUTING_UNRESOLVED` | Stage 5 §3 | 500 | SYSTEM | (see UC-01 above — same code) | No |
| `VARIANT_IMMUTABLE` | Stage 5 §EC-03 | 409 | APPLICATION | Attempt to change `runs.process_variant` after initiation | No |
| `ROUTING_MISCONFIGURATION` | Stage 5 §EC-01 | — | SYSTEM | Duplicate sentinel rules for same routing context + `resolve_from_state_key`. Rejected at boot validation (§2.4 uniqueness constraint `uq_rr_sentinel_context`). If reached at runtime: specificity ordering + `id ASC` deterministic pick; WARN logged. Not API-exposed — boot/config error. | No |

### 6.3 Prompt Architecture Error Codes

| Error Code | Source | HTTP | Category | Description | Retry? |
|---|---|---|---|---|---|
| `TEMPLATE_NOT_FOUND` | Stage 6 EC-01 | 500 | SYSTEM | No active template for (gate_id, phase_id, domain_id); configuration error; alerts team_00 | No |
| `TEMPLATE_RENDER_ERROR` | Stage 6 EC-07/AD-S6-02 | 500 | SYSTEM | Template contains unknown `{{placeholder}}`; hard failure, not silent substitution | No |
| `GOVERNANCE_NOT_FOUND` | Stage 6 EC-02 | 500 | SYSTEM | No governance file for team_id; configuration error; alerts team_00 | No |
| `INVALID_RUN_STATUS` | Stage 6 EC-07/§7 | 500 | SYSTEM | `assemble_prompt()` called for COMPLETE/NOT_STARTED/PAUSED run; internal error | No |

### 6.4 Stage 7 Error Codes (New)

| Error Code | Source | HTTP | Category | Description | Retry? |
|---|---|---|---|---|---|
| `UNKNOWN_EVENT_TYPE` | §3.1 append_event() | — | SYSTEM | event_type not in §1 registry; internal error — never exposed to API | No |
| `AUDIT_LEDGER_ERROR` | §3.1 append_event() | 500 | SYSTEM | DB failure during event INSERT; caller handles rollback/retry | Yes |
| `INVALID_HISTORY_PARAMS` | §3.2/§5 | 400 | VALIDATION | Invalid combination or value of history query parameters | No |

### 6.5 Explicitly Excluded

| Candidate Code | Why Excluded | Reference |
|---|---|---|
| `TOKEN_BUDGET_EXCEEDED` | AD-S6-07: token budget = advisory only. `_check_token_budget()` logs warning only. No error code exists. Spec amendment required to add. | AD-S6-07 |

**Total unique error codes: 38** (29 from UC Catalog [NOT_PRINCIPAL merged into INSUFFICIENT_AUTHORITY per AUTHORITY_MODEL v1.0.0 §8] + 2 from Routing [VARIANT_IMMUTABLE + ROUTING_MISCONFIGURATION; ROUTING_UNRESOLVED counted in UC] + 4 from Prompt Arch [TEMPLATE_NOT_FOUND, TEMPLATE_RENDER_ERROR, GOVERNANCE_NOT_FOUND, INVALID_RUN_STATUS] + 3 from Stage 7 [UNKNOWN_EVENT_TYPE, AUDIT_LEDGER_ERROR, INVALID_HISTORY_PARAMS]).

---

## §7 — Correlation Model

### 7.1 Correlation Mechanism

DDL v1.0.1 does **not** define a `correlation_id` column on the `events` table. Cross-event correlation uses two mechanisms:

**Primary:** `run_id` + `sequence_no` — every event within a run is sequenced. The `(run_id, sequence_no)` pair provides deterministic ordering and grouping.

**Secondary:** `payload_json` — event-specific correlation data is stored in the payload. Example: `RUN_RESUMED_WITH_NEW_ASSIGNMENT` carries `assignment_changed_event_id` referencing the `TEAM_ASSIGNMENT_CHANGED` event that triggered the branch.

**Hash chain:** `prev_hash` / `event_hash` — provides tamper-evident sequencing. Each event's `prev_hash` points to the prior event's `event_hash` for the same `run_id`, forming a verifiable chain.

### 7.2 Run History Reconstruction

Given `run_id`, a complete run timeline is assembled:

```sql
SELECT * FROM events
WHERE run_id = :run_id
ORDER BY sequence_no ASC;
```

**Properties:**
- Every state transition has **exactly one** event in the table
- `sequence_no` provides deterministic ordering even if `occurred_at` has collisions (same millisecond)
- The event sequence is **sufficient to reconstruct run state** without reading the `runs` table — each event captures the transition that occurred
- Hash chain (`prev_hash` → `event_hash`) provides integrity verification

**Reconstruction algorithm (conceptual):**
1. Start: `status = NOT_STARTED`
2. For each event in `sequence_no ASC` order: apply the state transition defined by `event_type`
3. End: current run status = result of applying all transitions

### 7.3 Cross-Run Correlation

No event_types exist without a `run_id` (DDL constraint: `run_id NOT NULL`). All events are scoped to a run.

Cross-run analysis is achieved via `domain_id` filtering:
```sql
SELECT * FROM events
WHERE domain_id = :domain_id
ORDER BY occurred_at ASC, sequence_no ASC;
```

This returns all events across all runs for a domain, enabling timeline analysis across run boundaries.

---

## §8 — Consistency Guarantees

### 8.1 State Transition vs Events Table (AD-S7-01)

**Policy: Option A — Atomic transaction.**

State transition and event emission occur within the **same database transaction**. If the event INSERT fails, the state transition is rolled back.

```
BEGIN TRANSACTION
  1. UPDATE runs SET status = :new_status, ...
  2. INSERT INTO events (...) VALUES (...)
  3. UPDATE pipeline_state.json (or equivalent projection)
COMMIT
```

If step 2 fails → entire transaction rolls back. `runs.status` remains unchanged. `AuditLedgerError` is raised to the caller.

**AD-S7-01: State transitions and event emissions are atomic.** No run state change can exist without its corresponding event. This is an Iron Rule. Violation = system integrity failure.

**Consequence:** `pipeline_state.json` (referenced in SM Spec as projection) is updated in the same transaction. If the projection update fails, the entire transaction rolls back. The events table is the authoritative audit log; `pipeline_state.json` is a denormalized projection.

### 8.2 Idempotency

- The same logical event **can** be appended twice on retry (at-least-once delivery)
- `id` is always a new ULID — duplicates are distinguishable by id
- `event_hash` is UNIQUE — if the **exact same content** produces the same hash, the second INSERT fails (hash collision = `AuditLedgerError`)
- **Policy: At-least-once delivery with hash-based dedup.** If a retry produces different content (e.g., different `occurred_at`), it generates a new `event_hash` and succeeds as a new event. Callers should use payload correlation data to identify and ignore logical duplicates if needed.
- `PHASE_ALREADY_ADVANCED` (UC-02) handles idempotent advance attempts at the UC level — no duplicate event emitted.

### 8.3 Ordering Guarantee

- Events for a given `run_id` are ordered by `sequence_no ASC` — guaranteed by the monotonic counter in `append_event()`
- `occurred_at` provides a secondary timestamp ordering; within the same millisecond, `sequence_no` is the tiebreaker
- **Concurrency model:** AOS v3 enforces **at most one IN_PROGRESS run per domain_id** (DDL CHECK + Entity Dict §Run inv. 1). This means at most one active writer per domain — eliminating race conditions between concurrent state transitions on the same run
- Multiple `PAUSED` runs per domain are allowed but do not emit events (PAUSED runs are inert — AD-S5-02)
- `TEAM_ASSIGNMENT_CHANGED` events can be emitted on PAUSED runs (the only exception to the "no activity on PAUSED runs" rule — SM Spec §9/EC-05)

### 8.4 Append-Only Statement (Formal)

> **The events table is append-only. No UPDATE or DELETE statement is ever issued against this table by any AOS v3 component. This is an Iron Rule. Violation = system integrity failure.**

Implementation consequences:
- No soft-delete mechanism exists or will be added
- Retention = permanent for all event types (§1 `Retention` column)
- Hash chain integrity (`prev_hash` / `event_hash`) depends on append-only guarantee
- Data corrections are achieved by appending a new corrective event (e.g., `PRINCIPAL_OVERRIDE`), never by modifying an existing event

---

## §9 — Test Cases

| TC | Name | Inputs | Expected Output | Error Code |
|---|---|---|---|---|
| **TC-01** | GetHistory — no filters, default ordering | `GET /api/history` | 200; `events` ordered by `occurred_at DESC`; `total` = total event count; `limit` = 50 | — |
| **TC-02** | GetHistory — domain_id filter | `domain_id=dom_tiktrack` | 200; only events where `e.domain_id = dom_tiktrack`; `total` = count of matching | — |
| **TC-03** | GetHistory — limit clamped | `limit=500` | 400; `INVALID_LIMIT`; message: limit must be ≤ 200 | `INVALID_LIMIT` |
| **TC-04** | GetHistory — unknown event_type filter | `event_type=NOT_REAL` | 400; `INVALID_EVENT_TYPE` | `INVALID_EVENT_TYPE` |
| **TC-05** | GetCurrentState — no active run | `domain_id` with no active run | 200; `status=IDLE`; `run_id=null`; all run fields null; `correction_cycle_count=0` | — |
| **TC-06** | GetCurrentState — PAUSED with sentinel | Run PAUSED + `lod200_author_team=team_30` | 200; `status=PAUSED`; `sentinel={active:true, override_team:team_30}`; **`actor=null`** (AD-S5-02) | — |
| **TC-07** | append_event — unknown event_type | `event_type=INVENTED` | `UnknownEventTypeError` raised; no row inserted | `UNKNOWN_EVENT_TYPE` |
| **TC-08** | GetHistory — pagination | `limit=10, offset=10`; DB has 25 matching events | 200; `events` = items [10..19]; `total=25`; `limit=10`; `offset=10` | — |
| **TC-09** | GetCurrentState — sentinel null | Run IN_PROGRESS + `lod200_author_team=NULL` | 200; `sentinel={active:false, override_team:null}`; `actor` = resolved team | — |
| **TC-10** | append_event — run not found | `run_id=nonexistent_ulid` | `RunNotFoundError` raised; no row inserted | `RUN_NOT_FOUND` |
| **TC-11** | append_event — hash chain integrity | Append 3 events to new run | event_1: `prev_hash=null`; event_2: `prev_hash=event_1.event_hash`; event_3: `prev_hash=event_2.event_hash`; all `sequence_no` contiguous (1, 2, 3) | — |
| **TC-12** | GetCurrentState — CORRECTION state | Run in CORRECTION; `correction_cycle_count=2` | 200; `status=CORRECTION`; `correction_cycle_count=2`; `actor` = current team | — |

---

## §10 — Edge Cases

| EC | Scenario | Handling | AD/Reference |
|---|---|---|---|
| **EC-01** | DB write for event fails AFTER state transition in same TX | **AD-S7-01:** Atomic transaction. Event INSERT failure rolls back entire TX including `runs` UPDATE. No orphaned state transitions. `AuditLedgerError` raised to caller. | AD-S7-01 (§8.1) |
| **EC-02** | GetHistory with `run_id` and `domain_id` that don't match | Apply both filters (AND-combined); if the run's domain ≠ provided domain_id → returns empty `events: []`, `total: 0`. No error — legitimate empty result. | §5.4 |
| **EC-03** | GetHistory returns 0 results | 200 with `events: []`, `total: 0` — never 404. Empty result is not an error. | §5.6 `NO_RESULTS` |
| **EC-04** | Two events for same `run_id` at identical `occurred_at` | Ordering within same millisecond resolved by `sequence_no` (monotonic integer). `sequence_no` is always unique per run. | §3.1 |
| **EC-05** | New event_type introduced in future (OQ-S3-02 / OQ-S7-01) | §1 Event Type Registry is additive — new types added by spec amendment. `query_events()` with unknown `event_type` filter → `INVALID_EVENT_TYPE` (validated against current registry). Old events with old types remain queryable. | §1.4 |
| **EC-06** | PAUSED run — GetCurrentState actor field | `actor = null`. AD-S5-02: routing (`resolve_actor()`) is not called for PAUSED runs. Actor resolution only for IN_PROGRESS and CORRECTION. | AD-S5-02 |
| **EC-07** | `event_hash` collision (two different events produce same hash) | Extremely unlikely with SHA-256. If it occurs: `UNIQUE` constraint on `event_hash` rejects the INSERT → `AuditLedgerError("hash_collision")`. Caller retries (different `occurred_at` → different hash). | §3.1 |
| **EC-08** | GetCurrentState during CORRECTION | Returns `status=CORRECTION`, `correction_cycle_count=N`, `actor` = current team (routing active in CORRECTION — AD-S5-02 allows). | AD-S5-02 |

---

## §11 — OQ-S7-01 Declaration

**OQ-S7-01:** Admin management event types (TEMPLATE_UPDATED, POLICY_UPDATED, GOVERNANCE_VERSION_BUMPED) are deferred to Stage 8 pending OQ-S3-02 closure. Stage 7 §1 Event Type Registry covers UC-01 through UC-14 main-flow events only. Admin management events will be defined when OQ-S3-02 assigns formal UC identities to template and policy management operations.

**Forward dependency:** OQ-S7-01 closes when OQ-S3-02 closes in Stage 8.

---

## Architectural Decisions — Stage 7

| AD ID | Decision | Locked In | Rationale |
|---|---|---|---|
| **AD-S7-01** | State transitions and event emissions are **atomic** (same DB transaction). Event INSERT failure rolls back state change. No orphaned state transitions. | §8.1 | Prevents inconsistency between `runs` table and `events` table. Pipeline state is always reconstructible from events. |

---

## Pre-submission Checklist

**Event Type Registry (§1):**
- [x] Every non-null `Event Emitted` in SM Spec v1.0.2 transition table = entry in §1.1 (14 standard events)
- [x] ROUTING_FAILED error event from Routing Spec = §1.2 (1 error event)
- [x] OQ-S7-01 deferred events declared in §1.4
- [x] TOKEN_BUDGET_EXCEEDED explicitly excluded (AD-S6-07)
- [x] Total = 15 event types

**Event Schema (§2):**
- [x] All field names match DDL v1.0.1 exactly
- [x] `occurred_at` (not `created_at`); `payload_json` TEXT (not JSONB)
- [x] `run_id` NOT NULL documented and justified (§2.3)
- [x] `correlation_id` absence documented (§7.1)
- [x] Payload schema defined for every event_type in §1

**Audit Ledger (§3):**
- [x] `append_event()` signature includes all DDL columns
- [x] `sequence_no` auto-computed (monotonic per run)
- [x] Hash chain (`prev_hash` → `event_hash`) documented
- [x] Error behavior for all failure modes
- [x] `query_events()` with typed parameters and max limit = 200

**UC Coverage (§4, §5):**
- [x] UC-13 (GetCurrentState) — canonical UC number (not UC-05)
- [x] UC-14 (GetHistory) — canonical UC number (not UC-06)
- [x] `process_variant` in GetCurrentState (AD-S5-01)
- [x] `sentinel` in GetCurrentState (AD-S5-05)
- [x] `actor = null` when PAUSED (AD-S5-02)
- [x] Pagination contract for GetHistory (§5.5)
- [x] `domain_id` filter uses denormalized column (no JOIN needed)

**Error Code Registry (§6):**
- [x] All UC-01..UC-14 error flows included
- [x] Routing Spec error codes included (ROUTING_UNRESOLVED + VARIANT_IMMUTABLE + ROUTING_MISCONFIGURATION)
- [x] Prompt Arch error codes included (TEMPLATE_NOT_FOUND, TEMPLATE_RENDER_ERROR, GOVERNANCE_NOT_FOUND, INVALID_RUN_STATUS)
- [x] Stage 7 new codes included (UNKNOWN_EVENT_TYPE, AUDIT_LEDGER_ERROR, INVALID_HISTORY_PARAMS)
- [x] TOKEN_BUDGET_EXCEEDED excluded (AD-S6-07)
- [x] Total = 39 unique codes (30 UC + 2 Routing + 4 Prompt Arch + 3 Stage 7)

**Consistency (§8):**
- [x] §8.1 policy decided: Option A (atomic transaction) — AD-S7-01
- [x] §8.4 append-only formal statement present
- [x] Idempotency policy defined (§8.2)
- [x] Ordering guarantee documented (§8.3)

**AD Compliance:**
- [x] AD-S5-01: `process_variant` in §4.2 GetCurrentState + §2.2 payload where relevant
- [x] AD-S5-02: actor=null for PAUSED in §4.3; prompt assembly events only for IN_PROGRESS/CORRECTION
- [x] AD-S5-05: sentinel exposed in §4.2 as awareness metadata
- [x] AD-S6-02: `TEMPLATE_RENDER_ERROR` in §6.3
- [x] AD-S6-04: prompts table = audit/PFS only — not referenced as events source
- [x] AD-S6-07: TOKEN_BUDGET_EXCEEDED absent from §1 and §6 (§1.5, §6.5)

**Test Cases + Edge Cases:**
- [x] 12 test cases (target 10-12)
- [x] 8 edge cases (target 6-8)
- [x] All deterministic, no hedging

---

**log_entry | TEAM_100 | AOS_V3_EVENT_OBSERVABILITY_SPEC | v1.0.1 | RESUBMITTED_CORRECTION_CYCLE_1 | 2026-03-26**
**log_entry | TEAM_100 | AOS_V3_EVENT_OBSERVABILITY_SPEC | v1.0.3 | CC3_AUTHORITY_MODEL | NOT_PRINCIPAL_MERGED_INTO_INSUFFICIENT_AUTHORITY | 2026-03-28**
