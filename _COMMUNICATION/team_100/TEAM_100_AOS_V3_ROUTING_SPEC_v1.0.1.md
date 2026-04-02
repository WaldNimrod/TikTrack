---
id: TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 190 (Reviewer), Team 00 (Gate Approver)
date: 2026-03-26
stage: SPEC_STAGE_5
ssot_basis: TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
ddl_basis: TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md
uc_basis: TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md
sm_basis: TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md
supersedes: TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md
team_190_review: TEAM_190_AOS_V3_ROUTING_SPEC_REVIEW_v1.0.0.md
team_190_verdict_prior: CONDITIONAL_PASS
status: SUBMITTED_FOR_REVIEW
reviewer: team_190
gate_approver: team_00---

# AOS v3 — Routing Spec (Stage 5) — v1.0.1

## Remediation (Team 190 CONDITIONAL_PASS v1.0.0)

| Finding | Severity | Fix Applied |
|---|---|---|
| **F-01** | MAJOR | Sentinel query now includes full context matching (`domain_id`, `variant`, `phase_id`) with specificity-ordered `LIMIT 1`. §1.3 pseudocode, §2.2 mechanism, §2.4 integrity constraint — all updated. |
| **F-02** | MAJOR | Removed `_resolve_from_snapshot()` from resolver. `resolve_actor()` precondition: `run.status ∈ {'IN_PROGRESS', 'CORRECTION'}`. PAUSED routing handled exclusively by UC-08 contract (§4.3 rewritten). |
| **F-03** | MAJOR | TC-12 redesigned: uses `GATE_6` (no rules in fixture) → deterministic `ROUTING_UNRESOLVED` at B.1. TC-13 redesigned: uses `S003-P006-WP001` (no assignment) → deterministic `ROUTING_UNRESOLVED` at B.2. No hedging. |
| **F-04** | MINOR | Sentinel lifecycle: removed "automatic clear on FORCE_RESUME". Sentinel column persists on `runs` unless explicitly cleared by `team_00` via separate FORCE action or manual DB update. |

---

## SSOT Alignment Corrections

The activation prompt's algorithm drafts contained field names that **diverge** from the Entity Dictionary v2.0.2 and DDL v1.0.1. The following corrections were applied per Iron Rule #2 ("Zero deviation from SSOT"):

| Draft Term | SSOT Correction | Source |
|---|---|---|
| `routing_rules.is_sentinel` | **Does not exist.** Sentinel detection = `resolve_from_state_key IS NOT NULL` | DDL §2 `routing_rules` |
| `routing_rules.team_id` | **Does not exist.** Column is `role_id` (FK → `pipeline_roles`). Team resolved via `assignments` table. | Dict §RoutingRule, DDL §2 |
| `routing_rules.status` | **Does not exist.** All present rows participate in routing; no ACTIVE/INACTIVE filter. | DDL §2 |
| `routing_rules.process_variant` | DDL column name is **`variant`** (not `process_variant`) | DDL §2 |
| `resolve_from_state_field` | Correct name is **`resolve_from_state_key`** (DEPRECATED per L1) | Dict §RoutingRule |

**Two-stage resolution model:** Since `routing_rules` points to `role_id` (not `team_id`), routing in v3 is a two-stage process:
1. **Rule Resolution:** `routing_rules` → `role_id` (which pipeline role handles this context?)
2. **Team Resolution:** `assignments` → `team_id` (which team fills that role for this WP?)

The legacy sentinel path (`resolve_from_state_key`) bypasses stage 2 by returning a `team_id` directly from a `runs` column — this is the DEPRECATED path subject to L1 cutover.

---

## §1 — Priority Resolution Algorithm

### 1.1 Two-Stage Resolution Model

```
┌──────────────────────────────────────────────────────────┐
│ resolve_actor(context) → team_id                         │
│                                                          │
│  Precondition: run.status ∈ {IN_PROGRESS, CORRECTION}    │
│  (PAUSED runs do NOT call resolver — see §4.3)           │
│                                                          │
│  Stage A ─ Legacy Sentinel (DEPRECATED)                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Context-scoped sentinel match:                      │  │
│  │   resolve_from_state_key IS NOT NULL                │  │
│  │   + gate/phase/domain/variant specificity match     │  │
│  │   AND runs[key] IS NOT NULL                         │  │
│  │   → return runs[key] as team_id (bypass Stage B)    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Stage B ─ Standard Resolution (v3 primary)              │
│  ┌────────────────────────────────────────────────────┐  │
│  │ B.1: routing_rules → role_id                        │  │
│  │      (specificity-ordered match, priority DESC)      │  │
│  │ B.2: assignments → team_id                          │  │
│  │      (work_package_id + role_id + ACTIVE)            │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  No match → ROUTING_UNRESOLVED (fail closed)             │
└──────────────────────────────────────────────────────────┘
```

**Precondition (F-02 fix):** `resolve_actor()` is called **only** when `run.status ∈ {'IN_PROGRESS', 'CORRECTION'}`. When `run.status = 'PAUSED'`, routing is handled exclusively by UC-08 (ResumeRun) using the `paused_routing_snapshot_json` — the resolver is **not** invoked. See §4.3 for the PAUSED routing contract.

**Stage A** exists only for backward compatibility during development. Per L1 cutover (Dict §RoutingRule), all `resolve_from_state_key` values must be NULL before PROD deploy with tag `aos-v3.0.0`. In production, Stage A is effectively dead code — the SQL filter `resolve_from_state_key IS NOT NULL` returns zero rows.

**Stage B** is the canonical v3 resolution path. Every production routing query resolves through this path.

### 1.2 Priority Chain

The resolver evaluates in the following order. **First match wins.**

| Level | Stage | Condition | Result |
|---|---|---|---|
| **1 — Sentinel** | A (DEPRECATED) | Context-scoped: `resolve_from_state_key IS NOT NULL` + context match + `runs[key] IS NOT NULL` | Return `runs[key]` as team_id directly |
| **2 — Exact** | B.1 | `domain_id=:d AND variant=:v AND phase_id=:p` | `role_id` → Stage B.2 |
| **3 — Domain+Phase** | B.1 | `domain_id=:d AND variant IS NULL AND phase_id=:p` | `role_id` → Stage B.2 |
| **4 — Domain** | B.1 | `domain_id=:d AND variant IS NULL AND phase_id IS NULL` | `role_id` → Stage B.2 |
| **5 — Variant** | B.1 | `domain_id IS NULL AND variant=:v` | `role_id` → Stage B.2 |
| **6 — Default** | B.1 | `domain_id IS NULL AND variant IS NULL AND phase_id IS NULL` | Gate-default `role_id` → Stage B.2 |
| **❌ NO_MATCH** | — | No rule matches at any level | `ROUTING_UNRESOLVED` → escalate |

**Note:** Level 0 (PAUSED) removed from resolver priority chain (F-02 fix). PAUSED routing is a separate contract (§4.3), not a resolver level.

**Note on Levels 2–6:** These are collapsed into a single SQL query (§1.4) with specificity-based ordering. The level numbers are logical; the SQL resolves all in one pass using `ORDER BY` on nullability + priority.

### 1.3 Complete Pseudocode

```python
@dataclass
class ResolvedRouting:
    team_id: str
    role_id: str | None        # NULL when sentinel bypasses Assignment
    rule_id: str
    assignment_id: str | None  # NULL when sentinel bypasses Assignment
    resolution_method: str     # 'SENTINEL_LEGACY' | 'ASSIGNMENT'


def resolve_actor(
    gate_id: str,
    phase_id: str | None,
    domain_id: str,
    variant: str,
    work_package_id: str,
    run: Run,
) -> ResolvedRouting:
    """
    Returns resolved routing for the given pipeline context.
    Raises: RoutingUnresolved if no match found.

    Precondition: run.status IN ('IN_PROGRESS', 'CORRECTION').
    PAUSED runs MUST NOT call this function — see §4.3.

    Column mapping:
      routing_rules.variant ↔ runs.process_variant
      routing_rules.role_id → assignments.role_id → assignments.team_id
    """
    assert run.status in ('IN_PROGRESS', 'CORRECTION'), \
        f"resolve_actor() called on non-active run (status={run.status})"

    # ── Level 1: Legacy sentinel (DEPRECATED — L1 cutover) ─
    # F-01 fix: sentinel query now matches full routing context
    sentinel = db.query(SENTINEL_RESOLUTION_SQL, {
        'gate_id': gate_id,
        'phase_id': phase_id,
        'domain_id': domain_id,
        'variant': variant,
    })

    if sentinel:
        key = sentinel.resolve_from_state_key
        value = getattr(run, key, None)  # reads runs.<key> column
        if value is not None:
            log.warn(
                "DEPRECATED: legacy sentinel path used",
                rule_id=sentinel.id, state_key=key, resolved_team=value,
            )
            return ResolvedRouting(
                team_id=value,
                role_id=None,
                rule_id=sentinel.id,
                assignment_id=None,
                resolution_method='SENTINEL_LEGACY',
            )

    # ── Levels 2–6: Standard resolution ────────────────────
    # B.1 — Role resolution (single SQL, specificity-ordered)
    matched = db.query(CANONICAL_ROLE_RESOLUTION_SQL, {
        'gate_id': gate_id,
        'phase_id': phase_id,
        'domain_id': domain_id,
        'variant': variant,     # ← maps from runs.process_variant
    })

    if not matched:
        _emit_routing_failed_event(
            gate_id, phase_id, domain_id, variant,
            reason='NO_MATCHING_RULE',
            resolution_stage='B.1',
        )
        raise RoutingUnresolved(gate_id, phase_id, domain_id, variant)

    resolved_role_id = matched.role_id
    resolved_rule_id = matched.rule_id

    # B.2 — Team resolution (Assignment lookup)
    assignment = db.query("""
        SELECT id, team_id
        FROM assignments
        WHERE work_package_id = :work_package_id
          AND role_id = :role_id
          AND status = 'ACTIVE'
    """, work_package_id=work_package_id, role_id=resolved_role_id)

    if not assignment:
        _emit_routing_failed_event(
            gate_id, phase_id, domain_id, variant,
            reason='NO_ACTIVE_ASSIGNMENT',
            resolution_stage='B.2',
            detail=f'role_id={resolved_role_id}',
        )
        raise RoutingUnresolved(
            gate_id, phase_id, domain_id, variant,
            detail=f'Rule matched (rule_id={resolved_rule_id}), '
                   f'but no ACTIVE assignment for role_id={resolved_role_id} '
                   f'and work_package_id={work_package_id}',
        )

    return ResolvedRouting(
        team_id=assignment.team_id,
        role_id=resolved_role_id,
        rule_id=resolved_rule_id,
        assignment_id=assignment.id,
        resolution_method='ASSIGNMENT',
    )
```

### 1.4 Canonical SQL — Sentinel Resolution (Level 1 — DEPRECATED)

**F-01 fix:** Sentinel query now matches the **full routing context** (`gate_id`, `phase_id`, `domain_id`, `variant`) with the same specificity ordering as standard resolution. Returns at most one sentinel rule (the most specific match).

```sql
-- SENTINEL_RESOLUTION_SQL
-- Input: :gate_id, :phase_id, :domain_id, :variant
-- Output: id, resolve_from_state_key (rank=1 row, or empty)
-- DB: PostgreSQL 16+ (DDL v1.0.1)

SELECT
  rr.id,
  rr.resolve_from_state_key
FROM routing_rules rr
WHERE rr.gate_id                    = :gate_id
  AND rr.resolve_from_state_key IS NOT NULL
  AND (rr.phase_id  = :phase_id  OR rr.phase_id  IS NULL)
  AND (rr.domain_id = :domain_id OR rr.domain_id IS NULL)
  AND (rr.variant   = :variant   OR rr.variant   IS NULL)
ORDER BY
  (rr.domain_id IS NOT NULL)  DESC,
  (rr.variant   IS NOT NULL)  DESC,
  (rr.phase_id  IS NOT NULL)  DESC,
  rr.priority                 DESC,
  rr.id                       ASC
LIMIT 1;
```

**Behavioral guarantee:** A sentinel rule scoped to `domain_id='dom_tiktrack'` will **never** override routing for `domain_id='dom_agents_os'`. Context fields (`domain_id`, `variant`, `phase_id`) are matched with the same OR-NULL fallback semantics as standard resolution — a sentinel with `domain_id IS NULL` is a gate-wide sentinel, while one with `domain_id='dom_tiktrack'` is domain-scoped.

### 1.5 Canonical SQL — Role Resolution (Levels 2–6)

Single query covering all standard specificity levels. Sentinel rules excluded by `resolve_from_state_key IS NULL` filter.

```sql
-- CANONICAL_ROLE_RESOLUTION_SQL
-- Input: :gate_id, :phase_id, :domain_id, :variant
-- Output: role_id, rule_id (rank=1 row)
-- DB: PostgreSQL 16+ (DDL v1.0.1)

WITH ranked AS (
  SELECT
    rr.role_id,
    rr.id                     AS rule_id,
    ROW_NUMBER() OVER (
      ORDER BY
        (rr.domain_id IS NOT NULL)  DESC,   -- domain-specific > domain-agnostic
        (rr.variant   IS NOT NULL)  DESC,   -- variant-specific > variant-agnostic
        (rr.phase_id  IS NOT NULL)  DESC,   -- phase-specific > gate-wide
        rr.priority                 DESC,   -- higher priority wins
        rr.id                       ASC     -- ULID tie-breaker: earlier rule wins
    ) AS rank
  FROM routing_rules rr
  WHERE rr.gate_id                 = :gate_id
    AND rr.resolve_from_state_key IS NULL       -- exclude DEPRECATED sentinels
    AND (rr.phase_id  = :phase_id  OR rr.phase_id  IS NULL)
    AND (rr.domain_id = :domain_id OR rr.domain_id IS NULL)
    AND (rr.variant   = :variant   OR rr.variant   IS NULL)
)
SELECT role_id, rule_id
FROM ranked
WHERE rank = 1;
```

**Column notes:**
- `:variant` parameter maps from `runs.process_variant` (run context) to `routing_rules.variant` (rule filter).
- `rr.resolve_from_state_key IS NULL` ensures sentinel rows are excluded from standard matching.
- `rr.id ASC` as final sort guarantees determinism when priority is equal (ULID = time-ordered; earlier rule wins).

### 1.6 Canonical SQL — Team Resolution (Stage B.2)

```sql
-- TEAM_RESOLUTION_SQL
-- Input: :work_package_id, :role_id (from §1.5 result)
-- Output: team_id, assignment_id

SELECT id AS assignment_id, team_id
FROM assignments
WHERE work_package_id = :work_package_id
  AND role_id         = :role_id
  AND status          = 'ACTIVE';

-- Invariant (Dict §Assignment inv. 1): at most ONE ACTIVE assignment per
-- (work_package_id, role_id) — enforced by partial unique index
-- idx_assignments_active_wp_role (DDL §4).
```

---

## §2 — Legacy Sentinel Handling (DEPRECATED)

### 2.1 Definition

A **sentinel** is a `routing_rules` row where:
- `resolve_from_state_key IS NOT NULL`
- The value of `resolve_from_state_key` is the **name of a column** on the `runs` table (e.g., `lod200_author_team`)
- The sentinel is **context-scoped** — it respects `gate_id`, `phase_id`, `domain_id`, and `variant` matching with the same OR-NULL fallback semantics as standard rules (§1.4)
- When `runs[resolve_from_state_key] IS NOT NULL` AND the sentinel matches the current context, the sentinel is **active** and its value overrides standard routing

**This mechanism is DEPRECATED.** Per L1 cutover (Dict §RoutingRule Invariant 4), all `resolve_from_state_key` values must be `NULL` before PROD deploy with tag `aos-v3.0.0`.

### 2.2 Mechanism (step-by-step)

1. `resolve_actor()` queries the **most specific** sentinel for the current context via `SENTINEL_RESOLUTION_SQL` (§1.4) — matching `gate_id`, `phase_id`, `domain_id`, `variant` with specificity ordering
2. If a matching sentinel is found: reads `runs.<resolve_from_state_key>` (the column named by the key)
3. If the column value is NOT NULL → return that value as `team_id` — **context-scoped override**
4. If no matching sentinel, or the column value IS NULL → sentinel bypassed; continue to standard resolution (§1.5)
5. All standard routing_rules matching (§1.5) **excludes** sentinel rows via `resolve_from_state_key IS NULL` filter

**Scope guarantee (F-01 fix):** A sentinel rule with `domain_id='dom_tiktrack'` will only match routing contexts where `domain_id='dom_tiktrack'`. A sentinel with `domain_id IS NULL` matches any domain (gate-wide sentinel). This prevents cross-context override behavior.

**Known sentinel-capable columns on `runs` (DDL v1.0.1):**

| Column | Type | Description |
|---|---|---|
| `lod200_author_team` | TEXT, FK → `teams.id` | DEPRECATED — legacy LOD200 author team reference |

Adding new sentinel targets requires DDL amendment (new column on `runs` with FK → `teams.id`).

### 2.3 Lifecycle

| Event | Who | Mechanism |
|---|---|---|
| **Set** | `team_00` only | FORCE action (UC-12 A10*) modifying the sentinel target column on `runs` |
| **Clear** | `team_00` only | Explicit FORCE action setting the column to NULL, or manual DB update. **Not** automatic — sentinel column persists through state transitions unless explicitly cleared. |
| **Snapshot** | pipeline_engine | `ForcePause` (T07) — sentinel column value is an independent `runs` field; not part of `paused_routing_snapshot_json`. The snapshot captures the resolved *Assignment* state, not sentinel state. |
| **Post-Resume** | — | Sentinel column on `runs` persists unchanged after RESUME. If sentinel was active before PAUSE, it remains active after RESUME (unless `team_00` cleared it during the PAUSE period). |

### 2.4 Integrity Constraint

**Requirement:** No two sentinel rules may reference the **same** `gate_id` + `resolve_from_state_key` combination **within the same context scope**. This prevents ambiguous override resolution.

**Recommended partial unique index** (not in DDL v1.0.1 — amendment recommended):

```sql
CREATE UNIQUE INDEX uq_rr_sentinel_context
  ON routing_rules (
    gate_id,
    COALESCE(phase_id, ''),
    COALESCE(domain_id, ''),
    COALESCE(variant, ''),
    resolve_from_state_key
  )
  WHERE resolve_from_state_key IS NOT NULL;
```

**Enforcement:** Application layer MUST validate uniqueness on INSERT/UPDATE of routing_rules where `resolve_from_state_key IS NOT NULL`. Boot validation SHOULD check for duplicates.

### 2.5 Cutover Timeline (L1)

Per Dict §RoutingRule Lock L1:

| Phase | Enforcement |
|---|---|
| **Development** | `resolve_from_state_key IS NOT NULL` → WARN in log only. Convention: new INSERTs should use NULL. |
| **Stage 2 (SM validators)** | Validator must confirm no routing depends exclusively on a legacy state key; every active `role_id` must have Assignment coverage. |
| **PROD deploy (`aos-v3.0.0` tag)** | `SELECT COUNT(*) FROM routing_rules WHERE resolve_from_state_key IS NOT NULL` must return 0. Seed/CI/deploy **fails** otherwise. |
| **Post-PROD** | Optional CHECK constraint: `CHECK (resolve_from_state_key IS NULL)` applied via migration. |

---

## §3 — Fallback Chain

Complete fallback chain including all resolution stages:

| Level | Stage | Condition | Result |
|---|---|---|---|
| 1 — Sentinel | A (DEPRECATED) | Context-scoped: `resolve_from_state_key IS NOT NULL` + context match + `runs[key] IS NOT NULL` | Override → `runs[key]` as team_id |
| 2 — Exact | B.1 | `domain_id + variant + gate_id + phase_id` all match | `role_id` → Assignment → `team_id` |
| 3 — Domain+Phase | B.1 | `domain_id + gate_id + phase_id` match, `variant IS NULL` | `role_id` → Assignment → `team_id` |
| 4 — Domain | B.1 | `domain_id + gate_id` match, `variant IS NULL + phase_id IS NULL` | `role_id` → Assignment → `team_id` |
| 5 — Variant | B.1 | `variant + gate_id` match, `domain_id IS NULL` | `role_id` → Assignment → `team_id` |
| 6 — Default | B.1 | `gate_id` only, `domain_id IS NULL + variant IS NULL + phase_id IS NULL` | Gate-default `role_id` → Assignment → `team_id` |
| ❌ NO_MATCH (rule) | B.1 | No routing_rule matches at any level | `ROUTING_UNRESOLVED` |
| ❌ NO_MATCH (assignment) | B.2 | Rule matched but no ACTIVE assignment for resolved `role_id` | `ROUTING_UNRESOLVED` |

**PAUSED runs** do not appear in this chain. Routing for PAUSED runs is handled by UC-08 (§4.3), not by the resolver.

### ROUTING_UNRESOLVED Behavior

- `runs.status` does **NOT** change (remains `IN_PROGRESS` or `CORRECTION`)
- Event emitted:
  ```sql
  INSERT INTO events (
    id, run_id, sequence_no, event_type, gate_id, phase_id,
    domain_id, work_package_id, actor_team_id, actor_type,
    reason, payload_json, occurred_at, event_hash
  ) VALUES (
    :ulid, :run_id, :next_seq, 'ROUTING_FAILED', :gate_id, :phase_id,
    :domain_id, :work_package_id, NULL, 'system',
    'NO_MATCHING_RULE',
    :json('{"variant": ":variant", "reason": ":reason", "resolution_stage": ":stage"}'),
    NOW(), :hash
  );
  ```
  Where `:reason` is `'NO_MATCHING_RULE'` (B.1 failure) or `'NO_ACTIVE_ASSIGNMENT'` (B.2 failure), and `:stage` is `'B.1'` or `'B.2'`.
- HTTP response: **500** (system misconfiguration — not a user error)
- Error code: `ROUTING_UNRESOLVED`
- Alert: system log; `team_00` notification required (pipeline cannot proceed without manual intervention)
- Recovery: `team_00` must either:
  - Add missing `routing_rules` row for the unmatched context (B.1 failure), **or**
  - Add missing `assignments` row for the matched `role_id` (B.2 failure), **or**
  - Use UC-12 `FORCE_PASS` / `FORCE_CORRECTION` to bypass

---

## §4 — paused_routing_snapshot_json Schema

Locked at UC-08 (State Machine Spec T07 / A10C). Cited here as reference for routing during PAUSED state.

### 4.1 Schema (UC-08 canonical — JSON Schema draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "type": "object",
  "required": ["captured_at", "gate_id", "phase_id", "assignments"],
  "properties": {
    "captured_at": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 UTC — maps to occurred_at of RUN_PAUSED event"
    },
    "gate_id": {
      "type": "string",
      "description": "gates.id at time of pause"
    },
    "phase_id": {
      "type": "string",
      "description": "phases.id at time of pause"
    },
    "assignments": {
      "type": "object",
      "description": "Map of pipeline_roles.id → assignment record at time of pause",
      "additionalProperties": {
        "type": "object",
        "required": ["assignment_id", "team_id"],
        "properties": {
          "assignment_id": {
            "type": "string",
            "description": "assignments.id (ULID)"
          },
          "team_id": {
            "type": "string",
            "description": "teams.id (format: team_XX)"
          }
        }
      }
    }
  },
  "additionalProperties": false
}
```

### 4.2 Example

```json
{
  "captured_at": "2026-03-26T14:00:00Z",
  "gate_id": "GATE_2",
  "phase_id": "2.3",
  "assignments": {
    "01JROLEORCH00000001": {
      "assignment_id": "01JASG00000000001",
      "team_id": "team_10"
    },
    "01JROLEIMPL00000001": {
      "assignment_id": "01JASG00000000002",
      "team_id": "team_20"
    }
  }
}
```

### 4.3 Routing During PAUSED State and Resume Contract (F-02 fix)

**Iron Rule:** `resolve_actor()` is **NOT** called when `run.status = 'PAUSED'`. Routing for PAUSED runs is handled exclusively by UC-08 (ResumeRun).

**Rationale (F-02 closure):** During PAUSE, routing_rules may change (new rules added, priorities modified). The snapshot captures the **complete assignment state** at pause time. Re-resolving `role_id` from live routing_rules would introduce drift between the snapshot's assignment map and the current routing configuration — violating the SM Spec Iron Rule 4 ("Resume = exact restore").

**UC-08 ResumeRun routing contract:**

| Branch | Condition | Routing Source | Mechanism |
|---|---|---|---|
| **A — Standard Resume** | No `TEAM_ASSIGNMENT_CHANGED` event after `paused_at` | **Snapshot directly** | UC-08 reads `paused_routing_snapshot_json`. All `assignments[role_id].team_id` entries are the authoritative team mappings. No routing_rules resolution occurs. After transition to `IN_PROGRESS`, subsequent routing calls to `resolve_actor()` use live routing_rules + live assignments (which are unchanged per Dict §Assignment Invariant 5). |
| **B — Reassigned Resume** | `TEAM_ASSIGNMENT_CHANGED` event exists after `paused_at` | **Live resolution** | UC-08 transitions run to `IN_PROGRESS`, then calls `resolve_actor()` normally (§1.3). Live routing_rules + live assignments are used. The snapshot is discarded. |

**Detection query** (UC-08 Branch B):
```sql
SELECT COUNT(*) FROM events
WHERE run_id = :run_id
  AND event_type = 'TEAM_ASSIGNMENT_CHANGED'
  AND occurred_at > (SELECT paused_at FROM runs WHERE id = :run_id);
```

If `COUNT > 0` → Branch B (live resolution after transition to IN_PROGRESS).

**Post-resume cleanup:** `paused_routing_snapshot_json` is set to NULL and `paused_at` is set to NULL (Dict §Run Invariant 9).

---

## §5 — process_variant Immutability

### 5.1 Iron Rule

`runs.process_variant` is set at `InitiateRun` (UC-01 T01 A01) and **cannot be changed** for the lifetime of the run.

### 5.2 Enforcement

- **Application layer:** UC-01 sets `process_variant` (default from `domains.default_variant` if not provided). No endpoint or UC modifies it.
- **DDL:** `runs.process_variant TEXT NOT NULL` — value is always present.
- **UC-12 (PrincipalOverride):** None of A10A–A10E modify `process_variant`. FORCE actions change status, gate, phase, and cycle count — never variant.
- **Routing dependency:** `routing_rules.variant` matches against `runs.process_variant`. Changing the variant mid-run would invalidate all previous routing decisions.

### 5.3 Error Code

| Scenario | Error Code | HTTP | Description |
|---|---|---|---|
| Attempt to modify `process_variant` on an existing run | `VARIANT_IMMUTABLE` | 409 | `"process_variant is locked at run initiation and cannot be modified"` |

---

## §6 — Test Cases

### 6.0 Test Fixture

**Routing Rules** (sample seed for test evaluation):

| Rule ID | gate_id | phase_id | domain_id | variant | role_id | priority | resolve_from_state_key |
|---|---|---|---|---|---|---|---|
| rr_01 | GATE_2 | 2.1 | dom_tiktrack | TRACK_FULL | ROLE_ORCH | 500 | NULL |
| rr_02 | GATE_2 | 2.1 | dom_agents_os | TRACK_FOCUSED | ROLE_ORCH | 500 | NULL |
| rr_03 | GATE_4 | 4.3 | dom_tiktrack | TRACK_FULL | ROLE_GATE_APPROVER | 500 | NULL |
| rr_04 | GATE_2 | NULL | dom_tiktrack | NULL | ROLE_ORCH | 200 | NULL |
| rr_05 | GATE_2 | NULL | NULL | TRACK_FULL | ROLE_ORCH | 100 | NULL |
| rr_06 | GATE_2 | NULL | NULL | NULL | ROLE_ORCH | 50 | NULL |
| rr_07 | GATE_3 | 3.1 | dom_agents_os | TRACK_FOCUSED | ROLE_QA | 500 | NULL |
| rr_08 | GATE_1 | 1.1 | dom_tiktrack | TRACK_FULL | ROLE_DOC | 500 | NULL |
| rr_09 | GATE_5 | 5.1 | dom_tiktrack | TRACK_FULL | ROLE_CLOSER | 500 | NULL |
| rr_10 | GATE_2 | NULL | dom_tiktrack | TRACK_FULL | ROLE_IMPL | 300 | lod200_author_team |

**Assignments** (WP: S003-P004-WP001 / tiktrack):

| Asg ID | work_package_id | domain_id | role_id | team_id | status |
|---|---|---|---|---|---|
| asg_01 | S003-P004-WP001 | dom_tiktrack | ROLE_ORCH | team_10 | ACTIVE |
| asg_02 | S003-P004-WP001 | dom_tiktrack | ROLE_IMPL | team_20 | ACTIVE |
| asg_03 | S003-P004-WP001 | dom_tiktrack | ROLE_GATE_APPROVER | team_00 | ACTIVE |
| asg_04 | S003-P004-WP001 | dom_tiktrack | ROLE_DOC | team_170 | ACTIVE |
| asg_05 | S003-P004-WP001 | dom_tiktrack | ROLE_CLOSER | team_70 | ACTIVE |

**Assignments** (WP: S003-P005-WP001 / agents_os):

| Asg ID | work_package_id | domain_id | role_id | team_id | status |
|---|---|---|---|---|---|
| asg_06 | S003-P005-WP001 | dom_agents_os | ROLE_ORCH | team_11 | ACTIVE |
| asg_07 | S003-P005-WP001 | dom_agents_os | ROLE_QA | team_190 | ACTIVE |

**No assignments exist for WP `S003-P006-WP001`** (used by TC-13 to test B.2 failure).

**Run State** (for sentinel tests):

| Scenario | runs.lod200_author_team |
|---|---|
| Sentinel active | `team_30` |
| Sentinel inactive | `NULL` |

---

### TC-01 — Exact match (tiktrack, TRACK_FULL)

| Parameter | Value |
|---|---|
| gate_id | GATE_2 |
| phase_id | 2.1 |
| domain_id | dom_tiktrack |
| variant (from runs.process_variant) | TRACK_FULL |
| work_package_id | S003-P004-WP001 |
| Sentinel active? | ❌ (lod200_author_team = NULL) |

**Sentinel SQL (§1.4):** `:gate_id='GATE_2', :phase_id='2.1', :domain_id='dom_tiktrack', :variant='TRACK_FULL'` → rr_10 matches context (domain=tiktrack, variant=TRACK_FULL) but `runs.lod200_author_team IS NULL` → sentinel bypassed.

**Role SQL (§1.5):** `:gate_id='GATE_2', :phase_id='2.1', :domain_id='dom_tiktrack', :variant='TRACK_FULL'`

**Matching rules:** rr_01 (exact: domain+variant+phase), rr_04 (domain-only), rr_05 (variant-only), rr_06 (default). rr_10 excluded (sentinel).

**Rank=1:** rr_01 — `domain_id IS NOT NULL (1), variant IS NOT NULL (1), phase_id IS NOT NULL (1), priority=500`

**Role:** ROLE_ORCH → **Assignment:** asg_01 → **team_id: `team_10`** ✅

---

### TC-02 — Exact match (agents_os, TRACK_FOCUSED)

| Parameter | Value |
|---|---|
| gate_id | GATE_2 |
| phase_id | 2.1 |
| domain_id | dom_agents_os |
| variant | TRACK_FOCUSED |
| work_package_id | S003-P005-WP001 |
| Sentinel active? | ❌ |

**Sentinel SQL:** rr_10 has `domain_id='dom_tiktrack'` ≠ `'dom_agents_os'` → no sentinel match for this context.

**Role SQL params:** `:gate_id='GATE_2', :phase_id='2.1', :domain_id='dom_agents_os', :variant='TRACK_FOCUSED'`

**Rank=1:** rr_02 (exact) — `domain(1), variant(1), phase(1), priority=500`

**Role:** ROLE_ORCH → **Assignment:** asg_06 → **team_id: `team_11`** ✅

---

### TC-03 — Sentinel override (DEPRECATED path, context-scoped)

| Parameter | Value |
|---|---|
| gate_id | GATE_2 |
| phase_id | 2.3 |
| domain_id | dom_tiktrack |
| variant | TRACK_FULL |
| work_package_id | S003-P004-WP001 |
| Sentinel active? | ✅ (lod200_author_team = `team_30`) |

**Sentinel SQL (§1.4):** `:gate_id='GATE_2', :phase_id='2.3', :domain_id='dom_tiktrack', :variant='TRACK_FULL'` → rr_10 matches (gate=GATE_2, phase=NULL [matches any], domain=tiktrack, variant=TRACK_FULL). `resolve_from_state_key='lod200_author_team'`. `runs.lod200_author_team = 'team_30'` (NOT NULL) → sentinel active.

**Result:** `team_id = team_30` (bypasses Assignment) — `resolution_method='SENTINEL_LEGACY'` ✅

**WARN logged:** `"DEPRECATED: legacy sentinel path used, rule_id=rr_10, state_key=lod200_author_team, resolved_team=team_30"`

---

### TC-04 — Human approval gate (GATE_4)

| Parameter | Value |
|---|---|
| gate_id | GATE_4 |
| phase_id | 4.3 |
| domain_id | dom_tiktrack |
| variant | TRACK_FULL |
| work_package_id | S003-P004-WP001 |
| Sentinel active? | ❌ |

**Sentinel SQL:** No sentinel rules for GATE_4 in fixture.

**Role SQL params:** `:gate_id='GATE_4', :phase_id='4.3', :domain_id='dom_tiktrack', :variant='TRACK_FULL'`

**Rank=1:** rr_03 (exact)

**Role:** ROLE_GATE_APPROVER → **Assignment:** asg_03 → **team_id: `team_00`** ✅ (human approval gate — D-03)

---

### TC-05 — Sentinel present but field NULL (bypassed)

| Parameter | Value |
|---|---|
| gate_id | GATE_2 |
| phase_id | 2.1 |
| domain_id | dom_tiktrack |
| variant | TRACK_FULL |
| work_package_id | S003-P004-WP001 |
| Sentinel active? | ❌ (lod200_author_team = NULL → sentinel inactive) |

**Sentinel SQL:** rr_10 matches context → `resolve_from_state_key='lod200_author_team'` → `runs.lod200_author_team IS NULL` → sentinel bypassed.

**Role SQL:** Standard resolution.

**Rank=1:** rr_01 (exact) — same as TC-01.

**Role:** ROLE_ORCH → **Assignment:** asg_01 → **team_id: `team_10`** ✅

---

### TC-06 — Domain-only fallback (no phase match)

| Parameter | Value |
|---|---|
| gate_id | GATE_2 |
| phase_id | 2.4 |
| domain_id | dom_tiktrack |
| variant | TRACK_FULL |
| work_package_id | S003-P004-WP001 |
| Sentinel active? | ❌ |

**Role SQL params:** `:gate_id='GATE_2', :phase_id='2.4', :domain_id='dom_tiktrack', :variant='TRACK_FULL'`

**Matching rules:** No rule has `phase_id='2.4'`. But: rr_04 (`phase_id IS NULL`, domain=dom_tiktrack, variant=NULL), rr_05 (`phase_id IS NULL`, domain=NULL, variant=TRACK_FULL), rr_06 (default).

**Rank=1:** rr_04 — `domain(1), variant(0), phase(0), priority=200` beats rr_05 `domain(0), variant(1), phase(0), priority=100`

**Role:** ROLE_ORCH → **Assignment:** asg_01 → **team_id: `team_10`** ✅ (domain fallback)

---

### TC-07 — Variant-only match (domain=NULL routing rule)

| Parameter | Value |
|---|---|
| gate_id | GATE_2 |
| phase_id | 2.1 |
| domain_id | dom_agents_os |
| variant | TRACK_FULL |
| work_package_id | S003-P005-WP001 |
| Sentinel active? | ❌ |

**Role SQL params:** `:gate_id='GATE_2', :phase_id='2.1', :domain_id='dom_agents_os', :variant='TRACK_FULL'`

**Matching rules:** rr_02 has variant=TRACK_FOCUSED ≠ TRACK_FULL → no exact. rr_05 (domain=NULL, variant=TRACK_FULL) → matches. rr_06 (default) → matches.

**Rank=1:** rr_05 — `domain(0), variant(1), phase(0), priority=100`

**Role:** ROLE_ORCH → **Assignment:** asg_06 (ROLE_ORCH for agents_os WP) → **team_id: `team_11`** ✅

---

### TC-08 — Default (gate-level only)

| Parameter | Value |
|---|---|
| gate_id | GATE_2 |
| phase_id | 2.1 |
| domain_id | dom_agents_os |
| variant | TRACK_NEW |
| work_package_id | S003-P005-WP001 |
| Sentinel active? | ❌ |

**Role SQL params:** `:gate_id='GATE_2', :phase_id='2.1', :domain_id='dom_agents_os', :variant='TRACK_NEW'`

**Matching rules:** No domain=dom_agents_os rule at GATE_2 with variant=TRACK_NEW. rr_06 (default: domain=NULL, variant=NULL, phase=NULL) → matches.

**Rank=1:** rr_06 — `domain(0), variant(0), phase(0), priority=50`

**Role:** ROLE_ORCH → **Assignment:** asg_06 (ROLE_ORCH for agents_os WP) → **team_id: `team_11`** ✅ (gate-default fallback)

---

### TC-09 — QA review phase (agents_os)

| Parameter | Value |
|---|---|
| gate_id | GATE_3 |
| phase_id | 3.1 |
| domain_id | dom_agents_os |
| variant | TRACK_FOCUSED |
| work_package_id | S003-P005-WP001 |
| Sentinel active? | ❌ |

**Role SQL params:** `:gate_id='GATE_3', :phase_id='3.1', :domain_id='dom_agents_os', :variant='TRACK_FOCUSED'`

**Rank=1:** rr_07 (exact)

**Role:** ROLE_QA → **Assignment:** asg_07 → **team_id: `team_190`** ✅

---

### TC-10 — Documentation gate (GATE_1)

| Parameter | Value |
|---|---|
| gate_id | GATE_1 |
| phase_id | 1.1 |
| domain_id | dom_tiktrack |
| variant | TRACK_FULL |
| work_package_id | S003-P004-WP001 |
| Sentinel active? | ❌ |

**Role SQL params:** `:gate_id='GATE_1', :phase_id='1.1', :domain_id='dom_tiktrack', :variant='TRACK_FULL'`

**Rank=1:** rr_08 (exact)

**Role:** ROLE_DOC → **Assignment:** asg_04 → **team_id: `team_170`** ✅

---

### TC-11 — Domain close (GATE_5)

| Parameter | Value |
|---|---|
| gate_id | GATE_5 |
| phase_id | 5.1 |
| domain_id | dom_tiktrack |
| variant | TRACK_FULL |
| work_package_id | S003-P004-WP001 |
| Sentinel active? | ❌ |

**Role SQL params:** `:gate_id='GATE_5', :phase_id='5.1', :domain_id='dom_tiktrack', :variant='TRACK_FULL'`

**Rank=1:** rr_09 (exact)

**Role:** ROLE_CLOSER → **Assignment:** asg_05 → **team_id: `team_70`** ✅

---

### TC-12 — ROUTING_UNRESOLVED at B.1 (no rule matches)

| Parameter | Value |
|---|---|
| gate_id | **GATE_6** |
| phase_id | 6.1 |
| domain_id | dom_tiktrack |
| variant | TRACK_FULL |
| work_package_id | S003-P004-WP001 |
| Sentinel active? | ❌ |

**Sentinel SQL:** No sentinel rules for GATE_6 in fixture → no match.

**Role SQL params:** `:gate_id='GATE_6', :phase_id='6.1', :domain_id='dom_tiktrack', :variant='TRACK_FULL'`

**Matching rules:** **None.** No routing_rules exist for `gate_id='GATE_6'` in the fixture.

**Result:** `ROUTING_UNRESOLVED` at resolution stage **B.1**. Event emitted: `event_type='ROUTING_FAILED'`, `reason='NO_MATCHING_RULE'`, `payload_json={"variant":"TRACK_FULL","reason":"NO_MATCHING_RULE","resolution_stage":"B.1"}`. HTTP **500**. ✅

---

### TC-13 — ROUTING_UNRESOLVED at B.2 (no assignment for resolved role)

| Parameter | Value |
|---|---|
| gate_id | GATE_2 |
| phase_id | 2.1 |
| domain_id | dom_tiktrack |
| variant | TRACK_FULL |
| work_package_id | **S003-P006-WP001** |
| Sentinel active? | ❌ |

**Role SQL params:** `:gate_id='GATE_2', :phase_id='2.1', :domain_id='dom_tiktrack', :variant='TRACK_FULL'`

**Rank=1:** rr_01 (exact) → **role_id: ROLE_ORCH**

**Assignment SQL:** `work_package_id='S003-P006-WP001', role_id=ROLE_ORCH, status='ACTIVE'` → **No matching assignment.** Fixture declares no assignments for WP `S003-P006-WP001`.

**Result:** `ROUTING_UNRESOLVED` at resolution stage **B.2**. Event emitted: `event_type='ROUTING_FAILED'`, `reason='NO_ACTIVE_ASSIGNMENT'`, `payload_json={"variant":"TRACK_FULL","reason":"NO_ACTIVE_ASSIGNMENT","resolution_stage":"B.2","role_id":"ROLE_ORCH"}`. HTTP **500**. ✅

---

## §7 — Edge Cases

| # | Scenario | Expected Behavior | Justification |
|---|---|---|---|
| **EC-01** | Two sentinel rules for the same context + `resolve_from_state_key` | `ROUTING_MISCONFIGURATION` — rejected at boot validation (§2.4 uniqueness constraint). If reached at runtime: specificity ordering + `id ASC` guarantees deterministic pick; WARN logged for misconfiguration. | Uniqueness partial index `uq_rr_sentinel_context` prevents this at DB level. |
| **EC-02** | `phase_id IS NULL` in `routing_rules` | Rule matches **any** phase within the gate (coarser rule). Specificity ordering puts `phase_id IS NOT NULL` above `phase_id IS NULL`. | SQL: `(rr.phase_id IS NOT NULL) DESC` in ORDER BY. |
| **EC-03** | `runs.process_variant` modification attempted mid-run | `VARIANT_IMMUTABLE` (409) — application layer rejects. No UC or A10 action modifies this field. | §5 — process_variant immutability Iron Rule. |
| **EC-04** | `routing_rules` row removed (hard deleted) mid-run | Standard resolution will not find the deleted rule. If no other rule matches, falls through to lower-specificity rules or default. If no match at all, `ROUTING_UNRESOLVED`. **Recommendation:** Avoid hard deletes during active runs; defer rule changes to between runs or use UC-12 override. | DDL has no soft-delete mechanism on `routing_rules`. Management of routing rules is deferred to UC-09 (ManageRouting) — OQ-S3-02. |
| **EC-05** | PAUSE → RESUME with legacy sentinel active | Snapshot captures the resolved *Assignment* state at pause time (team_id per role_id). Sentinel column (`lod200_author_team`) on `runs` persists independently — it is **not** part of `paused_routing_snapshot_json`. On resume (Branch A): snapshot team_id is used. After resume, subsequent `resolve_actor()` calls evaluate sentinel normally. | §4.3 — snapshot stores Assignment state; sentinel column is a separate `runs` field. §2.3 — sentinel column persists through state transitions. |
| **EC-06** | No ACTIVE assignment for resolved `role_id` | `ROUTING_UNRESOLVED` — event emitted with `reason='NO_ACTIVE_ASSIGNMENT'`, `resolution_stage='B.2'`, HTTP 500. Pipeline cannot proceed; `team_00` must create an Assignment via GATE_0 process or UC-12 override. | §1.3 Stage B.2 — fail closed when no Assignment exists. TC-13 tests this. |
| **EC-07** | Two concurrent IN_PROGRESS runs for the same domain | Prevented by UC-01 G01 check 1 (`DOMAIN_ALREADY_ACTIVE` — 409). Partial unique index `idx_runs_one_in_progress_per_domain` enforces at DB level. | Dict §Run Invariant 1; DDL §4. |
| **EC-08** | Equal `priority` on two routing rules at the same specificity level | `rr.id ASC` serves as deterministic tie-breaker. Since `id` is ULID (time-ordered), the **earlier-created** rule wins. | §1.4, §1.5 — final ORDER BY clause: `rr.id ASC`. |

---

## Pre-submission Checklist

- [x] Every field name matches Entity Dictionary v2.0.2 exactly
- [x] Every column name matches DDL v1.0.1 exactly
- [x] Sentinel SQL (§1.4) includes full context matching (F-01 fix verified)
- [x] `resolve_actor()` precondition excludes PAUSED runs (F-02 fix verified)
- [x] UC-08 resume contract documented without routing_rules re-resolution (F-02 fix verified)
- [x] TC-12 deterministic: GATE_6, no rules → ROUTING_UNRESOLVED at B.1 (F-03 fix verified)
- [x] TC-13 deterministic: S003-P006-WP001, no assignments → ROUTING_UNRESOLVED at B.2 (F-03 fix verified)
- [x] Sentinel lifecycle: no auto-clear on FORCE_RESUME; persists unless explicitly cleared (F-04 fix verified)
- [x] `paused_routing_snapshot_json` schema matches UC-08 lock
- [x] 13 test cases — each with deterministic SQL params + single expected result
- [x] 8 edge cases — each with behavior + justification
- [x] `ROUTING_UNRESOLVED` — event INSERT with resolution_stage + error code + HTTP status
- [x] Sentinel uniqueness constraint with full context scope (§2.4 updated)
- [x] `process_variant` immutability Iron Rule with error code `VARIANT_IMMUTABLE`

---

**log_entry | TEAM_100 | AOS_V3_ROUTING_SPEC | v1.0.0 | SUBMITTED_FOR_REVIEW | 2026-03-26**
**log_entry | TEAM_100 | AOS_V3_ROUTING_SPEC | v1.0.1 | TEAM190_REMEDIATION_F01_F04 | RESUBMITTED | 2026-03-26**
