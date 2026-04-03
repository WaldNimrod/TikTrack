---
id: TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 190 (Reviewer), Team 00 (Gate Approver)
date: 2026-03-26
stage: SPEC_STAGE_3
entity_root: Run
status: SUBMITTED_FOR_REVIEW
ssot_basis: TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
state_machine_basis: TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.1.md
mandate: TEAM_00_AOS_V3_SPEC_PROCESS_PLAN_v1.0.0.md §ג.3---

# AOS v3 — Use Case Catalog (Stage 3)

**הגדרה:** Stage 3 מגדיר את ה-HOW — כיצד מעברי המצב מ-Stage 2 מתממשים כ-API calls, תזרימי משתמש, ופעולות מערכת. כל UC מקושר למעבר ב-State Machine.

**OQ-04 (Stage 2) נסגר ב-UC-08** — JSON schema של `paused_routing_snapshot_json` נעול בסעיף זה.

---

## UC-01: InitiateRun

**State Machine Reference:** T01 (NOT_STARTED → IN_PROGRESS)
**Actor:** `pipeline_engine` (triggered by CLI / scheduler / dashboard)

**Preconditions:**
1. (G01) `NOT EXISTS (SELECT 1 FROM runs WHERE domain_id=:domain_id AND status='IN_PROGRESS')`
2. (G01) `wp_id ∈ wp_registry` — Work Package קיים ורשום
3. (G01) `domain_id ∈ domains` — domain ידוע ב-DB

**Input:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `wp_id` | TEXT | YES | מזהה Work Package מה-registry |
| `domain_id` | TEXT | YES | `tiktrack` \| `agents_os` |
| `variant` | TEXT | NO | `TRACK_FULL` \| `TRACK_FOCUSED` \| `TRACK_FAST`; default = domain canonical |

**Main Flow:**
1. pipeline_engine validates preconditions G01 (3 checks)
2. pipeline_engine resolves routing: `routing_rules.resolve(gate=GATE_0, domain_id, variant)` → `team_id`
3. (A01) pipeline_engine executes:
   - `INSERT INTO runs (id=ulid(), wp_id, domain_id, variant, status='IN_PROGRESS', current_gate_id='GATE_0', current_phase_id=first_phase, correction_cycle_count=0, paused_routing_snapshot_json=NULL, created_at=now())`
   - `INSERT INTO assignments (id=ulid(), run_id, role_id, team_id, wp_id, status='ACTIVE', assigned_at=now(), assigned_by=team_00_db_id)`
   - `UPDATE pipeline_state.json: {domain_id: {run_id, status, current_gate_id, current_phase_id, actor_team_id}}`
4. pipeline_engine emits: `INSERT INTO events (event_type='RUN_INITIATED', run_id, actor_id=pipeline_engine_db_id, payload={wp_id, domain_id, variant, first_gate, first_phase})`
5. System returns: run_id, current_gate_id, current_phase_id, actor_team_id, prompt_preview, next_command

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `DOMAIN_ALREADY_ACTIVE` | G01 check 1 fails — IN_PROGRESS exists | 409 | מחזיר: existing run_id + current state |
| `UNKNOWN_WP` | G01 check 2 fails | 400 | wp_id לא קיים ב-registry |
| `UNKNOWN_DOMAIN` | G01 check 3 fails | 400 | domain_id לא קיים |
| `ROUTING_UNRESOLVED` | No routing_rule matches gate/domain/variant | 500 | escalate to team_00 |

**Postconditions:**
- `SELECT status FROM runs WHERE id=:run_id` → `'IN_PROGRESS'`
- `SELECT COUNT(*) FROM assignments WHERE run_id=:run_id AND status='ACTIVE'` → ≥1
- `SELECT event_type FROM events WHERE run_id=:run_id ORDER BY created_at DESC LIMIT 1` → `'RUN_INITIATED'`
- `pipeline_state.json[domain_id].status` = `'IN_PROGRESS'`

**Side Effects:**
- `pipeline_state.json` written
- Prompt generated for current_team (GATE_0 output)

---

## UC-02: AdvanceGate

**State Machine Reference:** T02 (IN_PROGRESS → IN_PROGRESS, non-final phase)
**Actor:** `current_team` (resolved via Assignment)

**Preconditions:**
1. (G02) `run.status = 'IN_PROGRESS'`
2. (G02) `:actor_team_id = Assignment.team_id WHERE run_id=:run_id AND role_id=routing_rule.role_id AND status='ACTIVE'`
3. `current_phase` is NOT the final phase of the pipeline

**Input:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `run_id` | TEXT | YES | מזהה ה-Run |
| `actor_team_id` | TEXT | YES | מזהה הצוות המבצע |
| `verdict` | TEXT | YES | `"pass"` |
| `notes` | TEXT | NO | הערות לpass (נשמרות ב-Event payload) |

**Main Flow:**
1. pipeline_engine validates G02 (actor identity + status)
2. pipeline_engine resolves next gate/phase from routing_rules/phase sequence
3. (A02) pipeline_engine executes:
   - `UPDATE runs SET current_gate_id=:next_gate, current_phase_id=:next_phase WHERE id=:run_id`
   - `UPDATE pipeline_state.json`
4. pipeline_engine emits: `INSERT INTO events (event_type='PHASE_PASSED', run_id, actor_id=:actor_team_db_id, payload={from_gate, from_phase, to_gate, to_phase, notes})`
5. System returns: run_id, new current_gate_id, new current_phase_id, next_actor_team_id, next_prompt

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `WRONG_ACTOR` | G02 actor check fails | 403 | `:actor_team_id` אינו הצוות הנוכחי per Assignment |
| `INVALID_STATE` | `run.status ≠ 'IN_PROGRESS'` | 409 | מחזיר current status |
| `PHASE_ALREADY_ADVANCED` | pass() נקרא פעמיים על אותו phase (EC-01) | 409 | idempotent — מחזיר current state |
| `PHASE_SEQUENCE_ERROR` | next phase לא נמצא בsequence | 500 | escalate to team_00 |

**Postconditions:**
- `SELECT current_gate_id, current_phase_id FROM runs WHERE id=:run_id` → ערכים עדכניים
- `SELECT event_type FROM events WHERE run_id=:run_id ORDER BY created_at DESC LIMIT 1` → `'PHASE_PASSED'`

**Side Effects:**
- `pipeline_state.json` updated
- Prompt generated for next_actor_team_id

---

## UC-03: CompleteRun

**State Machine Reference:** T03 (IN_PROGRESS → COMPLETE, final phase)
**Actor:** `current_team`

**Preconditions:**
1. (G02) actor identity + IN_PROGRESS status
2. `current_phase` IS the final phase of the pipeline

**Input:** (identical to UC-02)

**Main Flow:**
1. pipeline_engine validates G02 + confirms `is_final_phase=TRUE`
2. (A03) pipeline_engine executes:
   - `UPDATE runs SET status='COMPLETE', completed_at=now(), paused_routing_snapshot_json=NULL WHERE id=:run_id`
   - `UPDATE pipeline_state.json: {domain_id: {run_id, status='COMPLETE', completed_at}}`
3. pipeline_engine emits: `INSERT INTO events (event_type='RUN_COMPLETED', run_id, actor_id, payload={wp_id, domain_id, total_phases_completed})`
4. System returns: run_id, status='COMPLETE', completed_at, summary

**Error Flows:** (same as UC-02 + `NOT_FINAL_PHASE` if routing disagrees on finality)

**Postconditions:**
- `SELECT status, completed_at FROM runs WHERE id=:run_id` → `'COMPLETE'`, non-null timestamp
- `SELECT paused_routing_snapshot_json FROM runs WHERE id=:run_id` → `NULL`
- No further transitions possible (terminal state)

**Side Effects:**
- `pipeline_state.json` written with terminal marker
- Domain slot released (new `initiate()` now possible for this domain)

---

## UC-04: FailGate (Blocking)

**State Machine Reference:** T04 (IN_PROGRESS → CORRECTION)
**Actor:** `current_team`

**Preconditions:**
1. (G02) actor identity + IN_PROGRESS status
2. (G03) `pipeline_roles.can_block_gate=1` for actor's role
3. (G03) `EXISTS (SELECT 1 FROM gate_role_authorities WHERE gate_id=:gate AND (phase_id=:phase OR phase_id IS NULL) AND (domain_id=:domain OR domain_id IS NULL) AND role_id=:role AND may_block_verdict=1)`

**Input:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `run_id` | TEXT | YES | מזהה ה-Run |
| `actor_team_id` | TEXT | YES | מזהה הצוות המבצע |
| `verdict` | TEXT | YES | `"fail"` |
| `reason` | TEXT | YES | תיאור הכשל (חובה ב-blocking fail) |
| `findings` | JSON | NO | רשימת ממצאים מובנית `[{code, severity, description}]` |

**Main Flow:**
1. pipeline_engine validates G02 + G03 (dual check)
2. (A04) pipeline_engine executes:
   - `UPDATE runs SET status='CORRECTION', correction_cycle_count=correction_cycle_count+1 WHERE id=:run_id`
   - `UPDATE pipeline_state.json`
3. pipeline_engine emits: `INSERT INTO events (event_type='GATE_FAILED_BLOCKING', run_id, actor_id, payload={gate_id, phase_id, reason, findings, cycle_number=correction_cycle_count})`
4. System returns: run_id, status='CORRECTION', correction_cycle_count, correction_instructions

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `WRONG_ACTOR` | G02 fails | 403 | |
| `INSUFFICIENT_AUTHORITY` | G03 fails — no GRA row | 403 | מופנה ל-UC-05 (advisory) |
| `INVALID_STATE` | run.status ≠ IN_PROGRESS | 409 | |
| `MISSING_REASON` | reason field empty | 400 | חובה ב-blocking |

**Postconditions:**
- `SELECT status, correction_cycle_count FROM runs WHERE id=:run_id` → `'CORRECTION'`, incremented
- `SELECT event_type FROM events WHERE run_id ORDER BY created_at DESC LIMIT 1` → `'GATE_FAILED_BLOCKING'`

**Side Effects:**
- Current team receives correction mandate (prompt for correction cycle)
- `pipeline_state.json` updated

---

## UC-05: FailGate (Advisory / Non-Blocking)

**State Machine Reference:** T05 (IN_PROGRESS → IN_PROGRESS)
**Actor:** `current_team`

**Preconditions:**
1. (G02) actor identity + IN_PROGRESS status
2. NOT (G03) — role does NOT have gate_role_authorities row (advisory only)

**Input:** (same as UC-04)

**Main Flow:**
1. pipeline_engine validates G02; G03 check FAILS → advisory path
2. (A05) pipeline_engine executes:
   - **ללא שינוי ב-runs table** — run stays IN_PROGRESS
   - `UPDATE pipeline_state.json` (advisory flag only)
3. pipeline_engine emits: `INSERT INTO events (event_type='GATE_FAILED_ADVISORY', run_id, actor_id, payload={gate_id, phase_id, reason, findings, advisory=true})`
4. System returns: run_id, status='IN_PROGRESS' (unchanged), advisory_logged=true, warning_message

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `WRONG_ACTOR` | G02 fails | 403 | |
| `UNEXPECTED_BLOCKING` | G03 passes — should have gone to UC-04 | 409 | pipeline routing error |

**Postconditions:**
- `SELECT status FROM runs WHERE id=:run_id` → `'IN_PROGRESS'` (unchanged)
- `SELECT event_type FROM events WHERE run_id ORDER BY created_at DESC LIMIT 1` → `'GATE_FAILED_ADVISORY'`

**Side Effects:**
- `pipeline_state.json` advisory flag written
- Pipeline continues — next actor notified of advisory finding

---

## UC-06: HumanApprove

**State Machine Reference:** T06 (IN_PROGRESS → IN_PROGRESS, HITL gate)
**Actor:** `team_00` (Principal — Nimrod only)

**Preconditions:**
1. (G04) `gates.is_human_gate=1 WHERE id=:current_gate_id`
2. (G04) `:actor = 'team_00'` — verified against D-03 DB row
3. `run.status = 'IN_PROGRESS'`

**Input:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `run_id` | TEXT | YES | מזהה ה-Run |
| `actor_team_id` | TEXT | YES | חייב להיות team_00 DB id (D-03) |
| `verdict` | TEXT | YES | `"approve"` |
| `approval_notes` | TEXT | NO | נימוק לאישור (מומלץ) |

**Main Flow:**
1. pipeline_engine validates G04 (is_human_gate=1 AND actor=team_00 per D-03)
2. (A02) pipeline_engine executes:
   - `UPDATE runs SET current_gate_id=:next_gate, current_phase_id=:next_phase WHERE id=:run_id`
   - `UPDATE pipeline_state.json`
3. pipeline_engine emits: `INSERT INTO events (event_type='GATE_APPROVED', run_id, actor_id=team_00_db_id, payload={gate_id, phase_id, approval_notes})`
4. System returns: run_id, new current_gate_id, new current_phase_id, next_actor

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `NOT_HITL_GATE` | G04 check 1 fails — not a human gate | 400 | שגיאת routing |
| `NOT_PRINCIPAL` | G04 check 2 fails — actor ≠ team_00 | 403 | HITL requires Principal only |
| `INVALID_STATE` | run.status ≠ IN_PROGRESS | 409 | |

**Postconditions:**
- `SELECT current_gate_id FROM runs WHERE id=:run_id` → advanced to next gate
- `SELECT event_type FROM events WHERE run_id ORDER BY created_at DESC LIMIT 1` → `'GATE_APPROVED'`

**Side Effects:**
- `pipeline_state.json` updated
- Next team receives mandate

---

## UC-07: PauseRun

**State Machine Reference:** T07 (IN_PROGRESS → PAUSED)
**Actor:** `team_00` (Principal only)

**Preconditions:**
1. (G05) `runs.status = 'IN_PROGRESS' WHERE id=:run_id`
2. (G05) `:actor = 'team_00'` (D-03)

**Input:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `run_id` | TEXT | YES | מזהה ה-Run |
| `actor_team_id` | TEXT | YES | חייב = team_00 DB id |
| `pause_reason` | TEXT | YES | נימוק השהייה |

**Main Flow:**
1. pipeline_engine validates G05 (status=IN_PROGRESS AND actor=team_00)
2. pipeline_engine computes snapshot from current state:
   ```json
   {
     "captured_at": "<now()>",
     "gate_id": "<current_gate_id>",
     "phase_id": "<current_phase_id>",
     "assignments": {
       "<role_id>": {"assignment_id": "<ulid>", "team_id": "<team_id>"}
     }
   }
   ```
3. (A06) pipeline_engine executes in **single ATOMIC transaction**:
   - `UPDATE runs SET status='PAUSED', paused_at=now(), paused_routing_snapshot_json=:snapshot WHERE id=:run_id`
   - `INSERT INTO events (event_type='RUN_PAUSED', run_id, actor_id=team_00_db_id, payload={pause_reason, snapshot_captured_at})`
   - If transaction fails: **full rollback** — no partial state
   - `UPDATE pipeline_state.json` (after commit)
4. System returns: run_id, status='PAUSED', paused_at, snapshot_captured_at

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `INVALID_STATE_TRANSITION` | G05 check 1 fails — already PAUSED (EC-02) | 409 | `"Run is already PAUSED"` |
| `NOT_PRINCIPAL` | G05 check 2 fails | 403 | |
| `SNAPSHOT_WRITE_FAILED` | DB transaction fails | 500 | Full rollback; run remains IN_PROGRESS |

**Postconditions:**
- `SELECT status, paused_at, paused_routing_snapshot_json FROM runs WHERE id=:run_id` → `'PAUSED'`, non-null paused_at, non-null snapshot JSON
- `SELECT event_type FROM events WHERE run_id ORDER BY created_at DESC LIMIT 1` → `'RUN_PAUSED'`

**Side Effects:**
- `pipeline_state.json` updated
- Current team notified: run is paused — no further action required

---

## UC-08: ResumeRun *(closes OQ-04)*

**State Machine Reference:** T08 (PAUSED → IN_PROGRESS)
**Actor:** `team_00` (Principal only)

### OQ-04 CLOSED — Canonical JSON Schema for `paused_routing_snapshot_json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "type": "object",
  "required": ["captured_at", "gate_id", "phase_id", "assignments"],
  "properties": {
    "captured_at": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 UTC timestamp when snapshot was taken"
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
      "description": "Map of role_id → assignment record at time of pause",
      "additionalProperties": {
        "type": "object",
        "required": ["assignment_id", "team_id"],
        "properties": {
          "assignment_id": {"type": "string", "description": "assignments.id (ULID)"},
          "team_id": {"type": "string", "description": "teams.team_code"}
        }
      }
    }
  }
}
```

**Validation rule:** Before writing snapshot in UC-07, pipeline_engine validates JSON against this schema. Invalid snapshot → transaction aborted.

**Preconditions:**
1. (G06) `runs.paused_routing_snapshot_json IS NOT NULL WHERE id=:run_id`
2. (G06) `:actor = 'team_00'` (D-03)
3. `runs.status = 'PAUSED'`

**Input:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `run_id` | TEXT | YES | |
| `actor_team_id` | TEXT | YES | חייב = team_00 DB id |
| `resume_notes` | TEXT | NO | |

**Main Flow:**
1. pipeline_engine validates G06 (snapshot NOT NULL AND actor=team_00)
2. pipeline_engine checks for `TEAM_ASSIGNMENT_CHANGED` event:
   ```sql
   SELECT COUNT(*) FROM events
   WHERE run_id=:run_id
     AND event_type='TEAM_ASSIGNMENT_CHANGED'
     AND created_at > (SELECT paused_at FROM runs WHERE id=:run_id)
   ```
3. **Branch A — No TEAM_ASSIGNMENT_CHANGED:**
   - Restore routing from snapshot: `paused_routing_snapshot_json.assignments[role_id].team_id`
   - (A07) `UPDATE runs SET status='IN_PROGRESS', paused_at=NULL WHERE id=:run_id` (gate_id, phase_id unchanged)
   - Emit: `RUN_RESUMED`
4. **Branch B — TEAM_ASSIGNMENT_CHANGED exists:**
   - Re-resolve routing from current `assignments` table (fresh resolution)
   - (A07) `UPDATE runs SET status='IN_PROGRESS', paused_at=NULL WHERE id=:run_id`
   - Emit: `RUN_RESUMED_WITH_NEW_ASSIGNMENT`
5. `UPDATE pipeline_state.json`
6. System returns: run_id, status='IN_PROGRESS', current_gate_id (restored), current_phase_id (restored), actor_team_id, branch_used

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `SNAPSHOT_MISSING` | G06 check 1 fails — snapshot NULL (EC-03) | 409 | דרוש Principal intervention — use UC-12 FORCE_RESUME with manual snapshot |
| `NOT_PRINCIPAL` | G06 check 2 fails | 403 | |
| `INVALID_STATE` | run.status ≠ PAUSED | 409 | |
| `ROUTING_RESOLUTION_FAILED` | Branch B — re-resolve fails | 500 | escalate to team_00 |

**Postconditions:**
- `SELECT status, paused_at FROM runs WHERE id=:run_id` → `'IN_PROGRESS'`, NULL
- `SELECT current_gate_id, current_phase_id FROM runs WHERE id=:run_id` → same as at pause (no reset)
- `SELECT event_type FROM events WHERE run_id ORDER BY created_at DESC LIMIT 1` → `'RUN_RESUMED'` or `'RUN_RESUMED_WITH_NEW_ASSIGNMENT'`

**Side Effects:**
- `pipeline_state.json` updated
- Current team receives mandate to continue

---

## UC-09: CorrectionResubmit

**State Machine Reference:** T09 (CORRECTION → IN_PROGRESS, cycle < max)
**Actor:** `current_team`

**Preconditions:**
1. `run.status = 'CORRECTION'`
2. (G07) `runs.correction_cycle_count < (SELECT value FROM policies WHERE key='max_correction_cycles')`
3. (G02) actor identity valid

**Input:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `run_id` | TEXT | YES | |
| `actor_team_id` | TEXT | YES | |
| `resubmission_notes` | TEXT | YES | תיאור התיקונים שבוצעו |
| `artifacts` | JSON | NO | רשימת קבצים שתוקנו |

**Main Flow:**
1. pipeline_engine validates: status=CORRECTION, G07, G02
2. (A08) pipeline_engine executes:
   - `UPDATE runs SET status='IN_PROGRESS' WHERE id=:run_id` (gate_id, phase_id unchanged — same gate/phase)
   - `correction_cycle_count` **לא מאופס** — נשמר ל-audit trail
   - `UPDATE pipeline_state.json`
3. pipeline_engine emits: `INSERT INTO events (event_type='CORRECTION_RESUBMITTED', run_id, actor_id, payload={resubmission_notes, artifacts, cycle_number=correction_cycle_count})`
4. System returns: run_id, status='IN_PROGRESS', same gate/phase, reviewer_team_id

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `MAX_CYCLES_REACHED` | G07 fails — cycle ≥ max → escalate to UC-10 | 409 | |
| `INVALID_STATE` | run.status ≠ CORRECTION | 409 | |
| `WRONG_ACTOR` | G02 fails | 403 | |
| `MISSING_NOTES` | resubmission_notes empty | 400 | חובה בresubmission |

**Postconditions:**
- `SELECT status FROM runs WHERE id=:run_id` → `'IN_PROGRESS'`
- `SELECT current_gate_id, current_phase_id FROM runs WHERE id=:run_id` → unchanged (same gate/phase)
- `SELECT correction_cycle_count FROM runs WHERE id=:run_id` → same value (not reset)

**Side Effects:**
- Reviewer team notified to re-evaluate
- `pipeline_state.json` updated

---

## UC-10: CorrectionEscalate

**State Machine Reference:** T10 (CORRECTION → CORRECTION, cycle ≥ max)
**Actor:** `current_team`

**Preconditions:**
1. `run.status = 'CORRECTION'`
2. (G08) `runs.correction_cycle_count >= (SELECT value FROM policies WHERE key='max_correction_cycles')`

**Input:** (same as UC-09)

**Main Flow:**
1. pipeline_engine validates: status=CORRECTION, G08
2. (A09) pipeline_engine executes:
   - **ללא שינוי ב-runs table** — status stays CORRECTION, run is BLOCKED
   - `UPDATE pipeline_state.json: {escalated=true, blocked_at=now()}`
3. pipeline_engine emits: `INSERT INTO events (event_type='CORRECTION_ESCALATED', run_id, actor_id, payload={cycle_number=correction_cycle_count, max_cycles, escalation_reason})`
4. System returns: run_id, status='CORRECTION' (blocked), cycle_count, max_cycles, requires_principal=true
5. **Alert dispatched to team_00** (notification mechanism — Stage 6 / Prompt Arch)

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `CYCLES_NOT_EXHAUSTED` | G08 fails — should go to UC-09 | 409 | routing error |
| `INVALID_STATE` | run.status ≠ CORRECTION | 409 | |

**Postconditions:**
- `SELECT status FROM runs WHERE id=:run_id` → `'CORRECTION'` (unchanged)
- `SELECT event_type FROM events WHERE run_id ORDER BY created_at DESC LIMIT 1` → `'CORRECTION_ESCALATED'`
- Run is effectively **BLOCKED** — only UC-12 (PrincipalOverride) can unblock

**Side Effects:**
- `pipeline_state.json: {escalated=true}`
- Principal (team_00) notified

---

## UC-11: CorrectionResolve

**State Machine Reference:** T11 (CORRECTION → IN_PROGRESS via pass())
**Actor:** `current_team` (reviewer role)

**Preconditions:**
1. `run.status = 'CORRECTION'`
2. (G02) actor identity valid (reviewer team per routing)
3. Reviewer evaluates resubmission and determines it passes

**Input:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `run_id` | TEXT | YES | |
| `actor_team_id` | TEXT | YES | reviewer team |
| `verdict` | TEXT | YES | `"pass"` |
| `resolution_notes` | TEXT | YES | נימוק המעבר מ-CORRECTION לIN_PROGRESS |

**Main Flow:**
1. pipeline_engine validates: status=CORRECTION, G02 (reviewer actor)
2. (A02) pipeline_engine executes:
   - `UPDATE runs SET status='IN_PROGRESS', current_gate_id=:next_gate, current_phase_id=:next_phase WHERE id=:run_id`
   - `correction_cycle_count` **נשמר** (לא מאופס — audit trail integrity)
   - `UPDATE pipeline_state.json`
3. pipeline_engine emits: `INSERT INTO events (event_type='CORRECTION_RESOLVED', run_id, actor_id, payload={resolution_notes, correction_cycle_count, gate_id, phase_id})`
4. System returns: run_id, status='IN_PROGRESS', new gate/phase, next_actor

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `WRONG_ACTOR` | G02 fails | 403 | רק reviewer מוסמך |
| `INVALID_STATE` | run.status ≠ CORRECTION | 409 | |

**Postconditions:**
- `SELECT status FROM runs WHERE id=:run_id` → `'IN_PROGRESS'`
- `SELECT correction_cycle_count FROM runs WHERE id=:run_id` → preserved (same value)
- Phase advanced beyond the gate that failed

**Side Effects:**
- `pipeline_state.json` updated
- Next team receives mandate

---

## UC-12: PrincipalOverride

**State Machine Reference:** T12 (ANY non-terminal → per action), Actions A10A–A10E
**Actor:** `team_00` ONLY

**Preconditions:**
1. (G09) `:actor = 'team_00'` (D-03 validation)
2. (G09) `action ∈ {FORCE_PASS, FORCE_FAIL, FORCE_PAUSE, FORCE_RESUME, FORCE_CORRECTION}`
3. `run.status` ∉ `{COMPLETE}` — non-terminal state

**Input:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `run_id` | TEXT | YES | |
| `actor_team_id` | TEXT | YES | team_00 DB id |
| `action` | TEXT | YES | FORCE_PASS \| FORCE_FAIL \| FORCE_PAUSE \| FORCE_RESUME \| FORCE_CORRECTION |
| `reason` | TEXT | YES | חובה — audit trail |
| `snapshot` | JSON | COND | חובה ב-FORCE_PAUSE וב-FORCE_RESUME (אם snapshot חסר) |

**Main Flow per action:**

**FORCE_PASS (A10A):**
- If non-final: `UPDATE runs SET status='IN_PROGRESS', current_gate_id=next, current_phase_id=next WHERE id=:run_id`
- If final: `UPDATE runs SET status='COMPLETE', completed_at=now(), paused_routing_snapshot_json=NULL WHERE id=:run_id`
- Emit: `PRINCIPAL_OVERRIDE` with `{action:'FORCE_PASS', from_state, reason}`

**FORCE_FAIL (A10B):**
- `UPDATE runs SET status='CORRECTION', correction_cycle_count=correction_cycle_count+1 WHERE id=:run_id`
- Emit: `PRINCIPAL_OVERRIDE` with `{action:'FORCE_FAIL', reason}`

**FORCE_PAUSE (A10C):**
- Atomic TX: `UPDATE runs SET status='PAUSED', paused_at=now(), paused_routing_snapshot_json=:snapshot WHERE id=:run_id`
- Emit: `PRINCIPAL_OVERRIDE` with `{action:'FORCE_PAUSE', reason}`

**FORCE_RESUME (A10D):**
- `UPDATE runs SET status='IN_PROGRESS', paused_at=NULL WHERE id=:run_id`
- Routing from snapshot (same as UC-08 A07)
- Emit: `PRINCIPAL_OVERRIDE` with `{action:'FORCE_RESUME', reason}`

**FORCE_CORRECTION (A10E):**
- `UPDATE runs SET status='CORRECTION' WHERE id=:run_id`
- `correction_cycle_count` **NOT incremented** (override, not natural fail)
- Emit: `PRINCIPAL_OVERRIDE` with `{action:'FORCE_CORRECTION', reason}`

**All actions conclude with:**
- `UPDATE pipeline_state.json`
- `INSERT INTO events (event_type='PRINCIPAL_OVERRIDE', actor_id=team_00_db_id, payload={action, from_state, to_state, reason, timestamp})`

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `NOT_PRINCIPAL` | G09 fails | 403 | override requires team_00 only |
| `INVALID_ACTION` | action ∉ allowed set | 400 | |
| `TERMINAL_STATE` | run.status = COMPLETE | 409 | no transitions from terminal |
| `MISSING_REASON` | reason empty | 400 | audit trail required |
| `SNAPSHOT_REQUIRED` | FORCE_PAUSE without snapshot | 400 | |

**Postconditions:** (vary by action — per A10A-E above)

**Side Effects:**
- All principal overrides permanently recorded in events table
- `pipeline_state.json` updated

---

## UC-13: GetCurrentState

**State Machine Reference:** Read-only — no transition
**Actor:** Any (no auth required for internal calls; external = team_00 or pipeline_engine)

**Preconditions:**
- Run exists: `SELECT 1 FROM runs WHERE id=:run_id`

**Input:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `run_id` | TEXT | COND | אם ידוע |
| `domain_id` | TEXT | COND | חלופה ל-run_id — מחזיר את ה-active run לdomain |

**Main Flow:**
1. Resolve run: by `run_id` OR by `domain_id` WHERE `status IN ('IN_PROGRESS','CORRECTION','PAUSED')`
2. Query:
   ```sql
   SELECT r.*, t.team_code, t.label as team_label, t.engine
   FROM runs r
   JOIN assignments a ON a.run_id=r.id AND a.status='ACTIVE'
   JOIN teams t ON t.id=a.team_id
   WHERE r.id=:run_id
   ```
3. Return full state object (see §Response Schema below)

**Response Schema:**
```json
{
  "run_id": "string",
  "wp_id": "string",
  "domain_id": "string",
  "status": "NOT_STARTED|IN_PROGRESS|CORRECTION|PAUSED|COMPLETE",
  "current_gate_id": "string|null",
  "current_phase_id": "string|null",
  "actor": {"team_id": "string", "label": "string", "engine": "string"},
  "correction_cycle_count": "integer",
  "paused_at": "datetime|null",
  "completed_at": "datetime|null",
  "created_at": "datetime",
  "pipeline_state_sync": "boolean"
}
```

**Error Flows:**
| Code | Trigger | HTTP |
|---|---|---|
| `RUN_NOT_FOUND` | run_id invalid | 404 |
| `NO_ACTIVE_RUN` | domain_id query returns empty | 200 (empty) |

---

## UC-14: GetHistory

**State Machine Reference:** Read-only — audit log query
**Actor:** Any

**Input:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `run_id` | TEXT | NO | filter by run |
| `domain_id` | TEXT | NO | filter by domain |
| `gate_id` | TEXT | NO | filter by gate |
| `event_type` | TEXT | NO | filter by event type |
| `limit` | INTEGER | NO | default=50, max=200 |
| `offset` | INTEGER | NO | pagination |

**Main Flow:**
```sql
SELECT e.*, t.team_code, t.label
FROM events e
JOIN teams t ON t.id=e.actor_id
WHERE (:run_id IS NULL OR e.run_id=:run_id)
  AND (:gate_id IS NULL OR JSON_EXTRACT(e.payload,'$.gate_id')=:gate_id)
  AND (:event_type IS NULL OR e.event_type=:event_type)
ORDER BY e.created_at DESC
LIMIT :limit OFFSET :offset
```

**Response Schema:**
```json
{
  "total": "integer",
  "events": [
    {
      "id": "string",
      "event_type": "string",
      "run_id": "string",
      "actor": {"team_code": "string", "label": "string"},
      "payload": "object",
      "created_at": "datetime"
    }
  ]
}
```

**Error Flows:** `INVALID_FILTER` (unknown event_type value)

---

## Summary Table

| UC | Name | T# | Actor | From State | To State | Error Codes |
|---|---|---|---|---|---|---|
| UC-01 | InitiateRun | T01 | pipeline_engine | NOT_STARTED | IN_PROGRESS | DOMAIN_ALREADY_ACTIVE, UNKNOWN_WP, UNKNOWN_DOMAIN, ROUTING_UNRESOLVED |
| UC-02 | AdvanceGate | T02 | current_team | IN_PROGRESS | IN_PROGRESS | WRONG_ACTOR, INVALID_STATE, PHASE_ALREADY_ADVANCED |
| UC-03 | CompleteRun | T03 | current_team | IN_PROGRESS | COMPLETE | WRONG_ACTOR, INVALID_STATE |
| UC-04 | FailGate (blocking) | T04 | current_team | IN_PROGRESS | CORRECTION | WRONG_ACTOR, INSUFFICIENT_AUTHORITY, MISSING_REASON |
| UC-05 | FailGate (advisory) | T05 | current_team | IN_PROGRESS | IN_PROGRESS | WRONG_ACTOR, UNEXPECTED_BLOCKING |
| UC-06 | HumanApprove | T06 | team_00 | IN_PROGRESS | IN_PROGRESS | NOT_HITL_GATE, NOT_PRINCIPAL |
| UC-07 | PauseRun | T07 | team_00 | IN_PROGRESS | PAUSED | INVALID_STATE_TRANSITION, NOT_PRINCIPAL, SNAPSHOT_WRITE_FAILED |
| UC-08 | ResumeRun | T08 | team_00 | PAUSED | IN_PROGRESS | SNAPSHOT_MISSING, NOT_PRINCIPAL, ROUTING_RESOLUTION_FAILED |
| UC-09 | CorrectionResubmit | T09 | current_team | CORRECTION | IN_PROGRESS | MAX_CYCLES_REACHED, INVALID_STATE, MISSING_NOTES |
| UC-10 | CorrectionEscalate | T10 | current_team | CORRECTION | CORRECTION | CYCLES_NOT_EXHAUSTED |
| UC-11 | CorrectionResolve | T11 | current_team | CORRECTION | IN_PROGRESS | WRONG_ACTOR, INVALID_STATE |
| UC-12 | PrincipalOverride | T12 | team_00 | ANY | per action | NOT_PRINCIPAL, TERMINAL_STATE, MISSING_REASON |
| UC-13 | GetCurrentState | — | any | — | — | RUN_NOT_FOUND, NO_ACTIVE_RUN |
| UC-14 | GetHistory | — | any | — | — | INVALID_FILTER |

---

## Open Questions — Stage 3 (לשלבים הבאים)

| OQ | נושא | שלב |
|---|---|---|
| OQ-S3-01 | `GeneratePrompt` UC — תלוי Stage 6 (Prompt Architecture); stub בלבד | Stage 6 |
| OQ-S3-02 | `ManageRouting` / `ManageTeam` / `ManageDomain` UCs — תלויים Stage 5+8 | Stage 5/8 |
| OQ-S3-03 | Authentication mechanism — מי מאמת את `actor_team_id`? API key? session? | Stage 8 (API Spec) |
| OQ-S3-04 | `GATE_FAILED_ADVISORY` display ב-dashboard (OQ-05 מStage 2) — תלוי Stage 8 (UI Contract) | Stage 8 |
| OQ-S3-05 | Alert/notification mechanism לteam_00 ב-UC-10 (CorrectionEscalate) — channel ופורמט | Stage 6 |

---

**log_entry | TEAM_100 | USE_CASE_CATALOG | v1.0.0 | SUBMITTED_FOR_REVIEW | 2026-03-26**
