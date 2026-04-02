---
id: TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.2
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 190 (Reviewer), Team 00 (Gate Approver)
date: 2026-03-26
stage: SPEC_STAGE_3
entity_root: Run
status: SUBMITTED_FOR_REVIEW
ssot_basis: TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
state_machine_basis: TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.1.md
supersedes: TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.1.md
revision_basis: TEAM_190_AOS_V3_USE_CASE_CATALOG_REVIEW_v1.0.1.md---

# AOS v3 — Use Case Catalog (Stage 3) — v1.0.2

## Changelog v1.0.0 → v1.0.1

| Finding | Severity | Fix Applied |
|---|---|---|
| F-01 | MAJOR | UC-13/UC-14: הוגדר §0 — Query Operations (QO-01, QO-02); UC-13/14 מפנים ל-QO ולא ל-T# (read-only, אין state transition) |
| F-02 | MAJOR | תיקון שמות שדות לאורך כל המסמך לפי Entity Dictionary v2.0.2: `work_package_id`; `process_variant`; `events.actor_team_id`; `events.payload_json`; `events.occurred_at`; `teams.id` (לא team_code) |
| F-03 | MINOR | UC-14 + UC-03: error flows הומרו לטבלה מלאה עם HTTP status לכל קוד |
| F-04 | MINOR | UC-13/UC-14: נוסף section מפורש של Postconditions עם DB-verifiable queries |

## Changelog v1.0.1 → v1.0.2

| Finding | Severity | Fix Applied |
|---|---|---|
| NF-01 | LOW | Normalized all bind-parameter aliases to canonical naming: `:wp_id` → `:work_package_id` (UC-01 postcondition); `:wp` → `:work_package_id` (UC-02 precondition G02); `actor_id` → `actor_team_id` (UC-14 QO-02 SQL JOIN alias) |

---

## §0 — Query Operations (Non-Transitional)

Use Cases המבצעים קריאה בלבד אינם state-machine transitions. הם מוגדרים כ-**Query Operations (QO)** ומקושרים כ-`QO-XX` ולא כ-`T-XX`.

| QO | Name | תיאור |
|---|---|---|
| **QO-01** | `StateQuery` | קריאת מצב ריצה נוכחי — ללא שינוי state |
| **QO-02** | `HistoryQuery` | קריאת היסטוריית Events — ללא שינוי state |

**כלל:** QO לא עוברות דרך state machine; לא נכתב אירוע; לא מתעדכן `pipeline_state.json`.

---

## UC-01: InitiateRun

**State Machine Reference:** T01 (NOT_STARTED → IN_PROGRESS)
**Actor:** `pipeline_engine` (triggered by CLI / scheduler / dashboard)

**Preconditions:**
1. (G01) `NOT EXISTS (SELECT 1 FROM runs WHERE domain_id=:domain_id AND status='IN_PROGRESS')`
2. (G01) `work_package_id` מאומת מול registry / program SSOT (לוגי — אין FK ל-programs)
3. (G01) `domain_id ∈ domains WHERE is_active=1`

**Input:**
| Parameter | Type | Required | Dict Field |
|---|---|---|---|
| `work_package_id` | TEXT | YES | `runs.work_package_id` |
| `domain_id` | TEXT | YES | `runs.domain_id` → `domains.id` |
| `process_variant` | TEXT | NO | `runs.process_variant`; default = `domains.default_variant` |

**Main Flow:**
1. pipeline_engine validates preconditions G01 (3 checks)
2. pipeline_engine resolves routing: `routing_rules` → `role_id` → `assignments` → `team_id` for GATE_0
3. (A01) pipeline_engine executes:
   - `INSERT INTO runs (id=ulid(), work_package_id, domain_id, process_variant, status='IN_PROGRESS', current_gate_id='GATE_0', current_phase_id=first_phase_id, correction_cycle_count=0, paused_routing_snapshot_json=NULL, execution_mode='MANUAL', started_at=now(), last_updated=now())`
   - `INSERT INTO assignments (id=ulid(), work_package_id, domain_id, role_id, team_id, assigned_at=now(), assigned_by=team_00_id, status='ACTIVE')`
   - `UPDATE pipeline_state.json: {domain_id: {run_id, work_package_id, status, current_gate_id, current_phase_id, actor_team_id}}`
4. pipeline_engine emits: `INSERT INTO events (id=ulid(), run_id, sequence_no=1, event_type='RUN_INITIATED', domain_id, work_package_id, gate_id='GATE_0', actor_team_id=pipeline_engine_id, actor_type='system', payload_json={work_package_id, domain_id, process_variant, current_gate_id, current_phase_id}, occurred_at=now(), event_hash=sha256(...))`
5. System returns: `{run_id, current_gate_id, current_phase_id, actor_team_id, prompt_preview, next_command}`

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `DOMAIN_ALREADY_ACTIVE` | G01 check 1 fails | 409 | מחזיר: existing run_id + current status |
| `UNKNOWN_WP` | G01 check 2 fails | 400 | work_package_id לא קיים ב-registry |
| `DOMAIN_INACTIVE` | G01 check 3 fails (is_active=0) | 400 | domain לא פעיל |
| `ROUTING_UNRESOLVED` | No routing_rule matches | 500 | escalate to team_00 |

**Postconditions:**
- `SELECT status FROM runs WHERE id=:run_id` → `'IN_PROGRESS'`
- `SELECT COUNT(*) FROM assignments WHERE work_package_id=:work_package_id AND status='ACTIVE'` → ≥1
- `SELECT event_type FROM events WHERE run_id=:run_id ORDER BY sequence_no DESC LIMIT 1` → `'RUN_INITIATED'`

**Side Effects:**
- `pipeline_state.json` written

---

## UC-02: AdvanceGate

**State Machine Reference:** T02 (IN_PROGRESS → IN_PROGRESS, non-final phase)
**Actor:** `current_team` (resolved via Assignment)

**Preconditions:**
1. (G02) `runs.status = 'IN_PROGRESS'`
2. (G02) `:actor_team_id` = `assignments.team_id WHERE work_package_id=:work_package_id AND role_id=routing_rule.role_id AND status='ACTIVE'`
3. `current_phase_id` is NOT the final phase

**Input:**
| Parameter | Type | Required | Dict Field |
|---|---|---|---|
| `run_id` | TEXT | YES | `runs.id` |
| `actor_team_id` | TEXT | YES | `teams.id` |
| `verdict` | TEXT | YES | `"pass"` |
| `notes` | TEXT | NO | → `events.payload_json` |

**Main Flow:**
1. pipeline_engine validates G02 (actor identity + status)
2. Resolves next gate/phase from routing_rules sequence
3. (A02) `UPDATE runs SET current_gate_id=:next_gate_id, current_phase_id=:next_phase_id, last_updated=now() WHERE id=:run_id`; `UPDATE pipeline_state.json`
4. Emits: `INSERT INTO events (event_type='PHASE_PASSED', run_id, actor_team_id, actor_type='agent', gate_id=:from_gate, phase_id=:from_phase, domain_id, work_package_id, payload_json={from_gate_id, from_phase_id, to_gate_id, to_phase_id, notes}, occurred_at=now(), ...)`
5. Returns: `{run_id, current_gate_id, current_phase_id, next_actor_team_id, next_prompt}`

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `WRONG_ACTOR` | G02 actor check fails | 403 | `:actor_team_id` אינו הצוות הנוכחי |
| `INVALID_STATE` | `runs.status ≠ 'IN_PROGRESS'` | 409 | מחזיר current status |
| `PHASE_ALREADY_ADVANCED` | pass() פעמיים על אותו phase (EC-01) | 409 | idempotent — מחזיר current state |
| `PHASE_SEQUENCE_ERROR` | next phase לא נמצא | 500 | escalate to team_00 |

**Postconditions:**
- `SELECT current_gate_id, current_phase_id FROM runs WHERE id=:run_id` → ערכים עדכניים
- `SELECT event_type FROM events WHERE run_id=:run_id ORDER BY sequence_no DESC LIMIT 1` → `'PHASE_PASSED'`

**Side Effects:** `pipeline_state.json` updated

---

## UC-03: CompleteRun

**State Machine Reference:** T03 (IN_PROGRESS → COMPLETE, final phase)
**Actor:** `current_team`

**Preconditions:**
1. (G02) actor identity + IN_PROGRESS status
2. `current_phase_id` IS the final phase of the pipeline

**Input:** (identical to UC-02)

**Main Flow:**
1. pipeline_engine validates G02 + confirms `is_final_phase=TRUE`
2. (A03) `UPDATE runs SET status='COMPLETE', completed_at=now(), paused_routing_snapshot_json=NULL, last_updated=now() WHERE id=:run_id`; `UPDATE pipeline_state.json`
3. Emits: `INSERT INTO events (event_type='RUN_COMPLETED', run_id, actor_team_id, actor_type='agent', domain_id, work_package_id, payload_json={work_package_id, domain_id}, occurred_at=now(), ...)`
4. Returns: `{run_id, status='COMPLETE', completed_at}`

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `WRONG_ACTOR` | G02 fails | 403 | |
| `INVALID_STATE` | `runs.status ≠ 'IN_PROGRESS'` | 409 | |
| `NOT_FINAL_PHASE` | phase sequence disagrees on finality | 409 | routing/sequence error |

**Postconditions:**
- `SELECT status, completed_at FROM runs WHERE id=:run_id` → `'COMPLETE'`, non-null
- `SELECT paused_routing_snapshot_json FROM runs WHERE id=:run_id` → `NULL`

**Side Effects:** `pipeline_state.json` terminal marker written; domain slot released

---

## UC-04: FailGate (Blocking)

**State Machine Reference:** T04 (IN_PROGRESS → CORRECTION)
**Actor:** `current_team`

**Preconditions:**
1. (G02) actor identity + IN_PROGRESS status
2. (G03) `pipeline_roles.can_block_gate=1` for actor's role_id
3. (G03) `EXISTS (SELECT 1 FROM gate_role_authorities WHERE gate_id=:current_gate_id AND (phase_id=:current_phase_id OR phase_id IS NULL) AND (domain_id=:domain_id OR domain_id IS NULL) AND role_id=:role_id AND may_block_verdict=1)`

**Input:**
| Parameter | Type | Required | Dict Field |
|---|---|---|---|
| `run_id` | TEXT | YES | `runs.id` |
| `actor_team_id` | TEXT | YES | `teams.id` |
| `verdict` | TEXT | YES | `"fail"` |
| `reason` | TEXT | YES | → `events.reason` |
| `findings` | JSON | NO | → `events.payload_json.findings` |

**Main Flow:**
1. pipeline_engine validates G02 + G03 (dual check)
2. (A04) `UPDATE runs SET status='CORRECTION', correction_cycle_count=correction_cycle_count+1, last_updated=now() WHERE id=:run_id`; `UPDATE pipeline_state.json`
3. Emits: `INSERT INTO events (event_type='GATE_FAILED_BLOCKING', run_id, actor_team_id, actor_type='agent', gate_id, phase_id, domain_id, work_package_id, verdict='FAIL', reason, payload_json={findings, cycle_number=correction_cycle_count}, occurred_at=now(), ...)`
4. Returns: `{run_id, status='CORRECTION', correction_cycle_count}`

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `WRONG_ACTOR` | G02 fails | 403 | |
| `INSUFFICIENT_AUTHORITY` | G03 fails — no GRA row | 403 | non-blocking path → UC-05 |
| `INVALID_STATE` | `runs.status ≠ 'IN_PROGRESS'` | 409 | |
| `MISSING_REASON` | reason field empty | 400 | חובה ב-blocking |

**Postconditions:**
- `SELECT status, correction_cycle_count FROM runs WHERE id=:run_id` → `'CORRECTION'`, incremented
- `SELECT event_type FROM events WHERE run_id=:run_id ORDER BY sequence_no DESC LIMIT 1` → `'GATE_FAILED_BLOCKING'`

**Side Effects:** `pipeline_state.json` updated

---

## UC-05: FailGate (Advisory / Non-Blocking)

**State Machine Reference:** T05 (IN_PROGRESS → IN_PROGRESS)
**Actor:** `current_team`

**Preconditions:**
1. (G02) actor identity + IN_PROGRESS status
2. NOT (G03) — no `gate_role_authorities` row for this (gate, phase, domain, role) combination

**Input:** (same as UC-04)

**Main Flow:**
1. pipeline_engine validates G02; G03 check FAILS → advisory path
2. (A05) ללא שינוי ב-`runs` table; `UPDATE pipeline_state.json` (advisory flag)
3. Emits: `INSERT INTO events (event_type='GATE_FAILED_ADVISORY', run_id, actor_team_id, actor_type='agent', gate_id, phase_id, domain_id, work_package_id, verdict='FAIL', reason, payload_json={findings, advisory=true}, occurred_at=now(), ...)`
4. Returns: `{run_id, status='IN_PROGRESS', advisory_logged=true, warning_message}`

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `WRONG_ACTOR` | G02 fails | 403 | |
| `UNEXPECTED_BLOCKING` | G03 passes — wrong path | 409 | should have gone to UC-04 |

**Postconditions:**
- `SELECT status FROM runs WHERE id=:run_id` → `'IN_PROGRESS'` (unchanged)
- `SELECT event_type FROM events WHERE run_id=:run_id ORDER BY sequence_no DESC LIMIT 1` → `'GATE_FAILED_ADVISORY'`

**Side Effects:** `pipeline_state.json` advisory flag

---

## UC-06: HumanApprove

**State Machine Reference:** T06 (IN_PROGRESS → IN_PROGRESS, HITL gate)
**Actor:** `team_00` (Principal only — D-03)

**Preconditions:**
1. (G04) `gates.is_human_gate=1 WHERE id=:current_gate_id`
2. (G04) `:actor_team_id = teams.id WHERE teams.id='team_00'` (D-03 validation)
3. `runs.status = 'IN_PROGRESS'`

**Input:**
| Parameter | Type | Required | Dict Field |
|---|---|---|---|
| `run_id` | TEXT | YES | `runs.id` |
| `actor_team_id` | TEXT | YES | `teams.id` = `'team_00'` |
| `verdict` | TEXT | YES | `"approve"` |
| `approval_notes` | TEXT | NO | → `events.payload_json` |

**Main Flow:**
1. pipeline_engine validates G04 (is_human_gate=1 AND actor=team_00 per D-03)
2. (A02) `UPDATE runs SET current_gate_id=:next_gate_id, current_phase_id=:next_phase_id, last_updated=now() WHERE id=:run_id`; `UPDATE pipeline_state.json`
3. Emits: `INSERT INTO events (event_type='GATE_APPROVED', run_id, actor_team_id='team_00', actor_type='human', gate_id, phase_id, domain_id, work_package_id, verdict='PASS', payload_json={approval_notes}, occurred_at=now(), ...)`
4. Returns: `{run_id, current_gate_id, current_phase_id, next_actor_team_id}`

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `NOT_HITL_GATE` | `gates.is_human_gate=0` | 400 | שגיאת routing |
| `NOT_PRINCIPAL` | `actor_team_id ≠ team_00` (D-03) | 403 | HITL requires Principal only |
| `INVALID_STATE` | `runs.status ≠ 'IN_PROGRESS'` | 409 | |

**Postconditions:**
- `SELECT current_gate_id FROM runs WHERE id=:run_id` → advanced
- `SELECT event_type FROM events WHERE run_id ORDER BY sequence_no DESC LIMIT 1` → `'GATE_APPROVED'`

---

## UC-07: PauseRun

**State Machine Reference:** T07 (IN_PROGRESS → PAUSED)
**Actor:** `team_00` (D-03)

**Preconditions:**
1. (G05) `runs.status = 'IN_PROGRESS' WHERE id=:run_id`
2. (G05) `:actor_team_id = teams.id WHERE teams.id='team_00'` (D-03)

**Input:**
| Parameter | Type | Required | Dict Field |
|---|---|---|---|
| `run_id` | TEXT | YES | `runs.id` |
| `actor_team_id` | TEXT | YES | `teams.id` = `'team_00'` |
| `pause_reason` | TEXT | YES | → `events.reason` |

**Main Flow:**
1. pipeline_engine validates G05
2. pipeline_engine computes snapshot:
   ```json
   {
     "captured_at": "<now() ISO-8601>",
     "gate_id": "<runs.current_gate_id>",
     "phase_id": "<runs.current_phase_id>",
     "assignments": {
       "<pipeline_roles.id>": {
         "assignment_id": "<assignments.id>",
         "team_id": "<teams.id>"
       }
     }
   }
   ```
   snapshot validated against JSON Schema (UC-08 §OQ-04) before write.
3. (A06) ATOMIC TRANSACTION:
   - `UPDATE runs SET status='PAUSED', paused_at=now(), paused_routing_snapshot_json=:snapshot, last_updated=now() WHERE id=:run_id`
   - `INSERT INTO events (event_type='RUN_PAUSED', run_id, actor_team_id='team_00', actor_type='human', gate_id=current_gate_id, phase_id=current_phase_id, domain_id, work_package_id, reason=:pause_reason, payload_json={snapshot_captured_at}, occurred_at=now(), ...)`
   - If transaction fails: **full rollback** — run remains IN_PROGRESS
   - `UPDATE pipeline_state.json` (after commit)
4. Returns: `{run_id, status='PAUSED', paused_at, snapshot_gate_id, snapshot_phase_id}`

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `INVALID_STATE_TRANSITION` | G05 fails — `runs.status ≠ 'IN_PROGRESS'` (EC-02) | 409 | `"Run is already PAUSED or not IN_PROGRESS"` |
| `NOT_PRINCIPAL` | G05 actor fails | 403 | |
| `SNAPSHOT_VALIDATION_FAILED` | snapshot fails JSON Schema validation | 422 | |
| `SNAPSHOT_WRITE_FAILED` | DB transaction fails | 500 | Full rollback |

**Postconditions:**
- `SELECT status, paused_at FROM runs WHERE id=:run_id` → `'PAUSED'`, non-null
- `SELECT paused_routing_snapshot_json FROM runs WHERE id=:run_id` → non-null JSON
- `SELECT event_type FROM events WHERE run_id ORDER BY sequence_no DESC LIMIT 1` → `'RUN_PAUSED'`

---

## UC-08: ResumeRun *(closes OQ-04)*

**State Machine Reference:** T08 (PAUSED → IN_PROGRESS)
**Actor:** `team_00` (D-03)

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

**Preconditions:**
1. (G06) `runs.paused_routing_snapshot_json IS NOT NULL WHERE id=:run_id`
2. (G06) `:actor_team_id = teams.id WHERE teams.id='team_00'` (D-03)
3. `runs.status = 'PAUSED'`

**Input:**
| Parameter | Type | Required | Dict Field |
|---|---|---|---|
| `run_id` | TEXT | YES | `runs.id` |
| `actor_team_id` | TEXT | YES | `teams.id` = `'team_00'` |
| `resume_notes` | TEXT | NO | → `events.payload_json` |

**Main Flow:**
1. pipeline_engine validates G06
2. Check for `TEAM_ASSIGNMENT_CHANGED` post-pause:
   ```sql
   SELECT COUNT(*) FROM events
   WHERE run_id=:run_id
     AND event_type='TEAM_ASSIGNMENT_CHANGED'
     AND occurred_at > (SELECT paused_at FROM runs WHERE id=:run_id)
   ```
3. **Branch A — No TEAM_ASSIGNMENT_CHANGED:**
   - routing from `paused_routing_snapshot_json.assignments[role_id].team_id`
   - (A07) `UPDATE runs SET status='IN_PROGRESS', paused_at=NULL, last_updated=now() WHERE id=:run_id` (gate_id, phase_id unchanged)
   - Emits: `event_type='RUN_RESUMED'`
4. **Branch B — TEAM_ASSIGNMENT_CHANGED exists:**
   - Re-resolve routing from current `assignments` table
   - (A07) `UPDATE runs SET status='IN_PROGRESS', paused_at=NULL, last_updated=now() WHERE id=:run_id`
   - Emits: `event_type='RUN_RESUMED_WITH_NEW_ASSIGNMENT'`
5. Events: `INSERT INTO events (event_type, run_id, actor_team_id='team_00', actor_type='human', gate_id=current_gate_id, phase_id=current_phase_id, domain_id, work_package_id, payload_json={resume_notes, branch_used, actor_team_id}, occurred_at=now(), ...)`
6. `UPDATE pipeline_state.json`
7. Returns: `{run_id, status='IN_PROGRESS', current_gate_id, current_phase_id, actor_team_id, branch_used}`

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `SNAPSHOT_MISSING` | G06 check 1 fails (EC-03) | 409 | דרוש FORCE_RESUME מ-UC-12 עם snapshot ידני |
| `NOT_PRINCIPAL` | G06 check 2 fails | 403 | |
| `INVALID_STATE` | `runs.status ≠ 'PAUSED'` | 409 | |
| `ROUTING_RESOLUTION_FAILED` | Branch B re-resolve fails | 500 | escalate to team_00 |

**Postconditions:**
- `SELECT status, paused_at FROM runs WHERE id=:run_id` → `'IN_PROGRESS'`, NULL
- `SELECT current_gate_id, current_phase_id FROM runs WHERE id=:run_id` → same as at pause time

---

## UC-09: CorrectionResubmit

**State Machine Reference:** T09 (CORRECTION → IN_PROGRESS, cycle < max)
**Actor:** `current_team`

**Preconditions:**
1. `runs.status = 'CORRECTION'`
2. (G07) `runs.correction_cycle_count < (SELECT CAST(value AS INTEGER) FROM policies WHERE key='max_correction_cycles')`
3. (G02) actor identity valid

**Input:**
| Parameter | Type | Required | Dict Field |
|---|---|---|---|
| `run_id` | TEXT | YES | `runs.id` |
| `actor_team_id` | TEXT | YES | `teams.id` |
| `resubmission_notes` | TEXT | YES | → `events.reason` |
| `artifacts` | JSON | NO | → `events.payload_json.artifacts` |

**Main Flow:**
1. Validates: status=CORRECTION, G07, G02
2. (A08) `UPDATE runs SET status='IN_PROGRESS', last_updated=now() WHERE id=:run_id` (gate_id, phase_id unchanged; `correction_cycle_count` NOT reset)
3. `UPDATE pipeline_state.json`
4. Emits: `INSERT INTO events (event_type='CORRECTION_RESUBMITTED', run_id, actor_team_id, actor_type='agent', gate_id, phase_id, domain_id, work_package_id, reason=:resubmission_notes, payload_json={artifacts, cycle_number=correction_cycle_count}, occurred_at=now(), ...)`
5. Returns: `{run_id, status='IN_PROGRESS', current_gate_id, current_phase_id, correction_cycle_count, reviewer_team_id}`

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `MAX_CYCLES_REACHED` | G07 fails → escalate to UC-10 | 409 | |
| `INVALID_STATE` | `runs.status ≠ 'CORRECTION'` | 409 | |
| `WRONG_ACTOR` | G02 fails | 403 | |
| `MISSING_NOTES` | `resubmission_notes` empty | 400 | |

**Postconditions:**
- `SELECT status FROM runs WHERE id=:run_id` → `'IN_PROGRESS'`
- `SELECT current_gate_id, current_phase_id FROM runs WHERE id=:run_id` → unchanged
- `SELECT correction_cycle_count FROM runs WHERE id=:run_id` → same value (not reset)

---

## UC-10: CorrectionEscalate

**State Machine Reference:** T10 (CORRECTION → CORRECTION, cycle ≥ max)
**Actor:** `current_team`

**Preconditions:**
1. `runs.status = 'CORRECTION'`
2. (G08) `runs.correction_cycle_count >= (SELECT CAST(value AS INTEGER) FROM policies WHERE key='max_correction_cycles')`

**Input:** (same as UC-09)

**Main Flow:**
1. Validates: status=CORRECTION, G08
2. (A09) ללא שינוי ב-`runs` table — status stays CORRECTION, run is BLOCKED
3. `UPDATE pipeline_state.json: {escalated=true}`
4. Emits: `INSERT INTO events (event_type='CORRECTION_ESCALATED', run_id, actor_team_id, actor_type='agent', gate_id, phase_id, domain_id, work_package_id, payload_json={cycle_number=correction_cycle_count, max_cycles, escalation_reason=resubmission_notes}, occurred_at=now(), ...)`
5. Returns: `{run_id, status='CORRECTION', correction_cycle_count, max_cycles, requires_principal=true}`

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `CYCLES_NOT_EXHAUSTED` | G08 fails — should go to UC-09 | 409 | routing error |
| `INVALID_STATE` | `runs.status ≠ 'CORRECTION'` | 409 | |

**Postconditions:**
- `SELECT status FROM runs WHERE id=:run_id` → `'CORRECTION'` (unchanged)
- `SELECT event_type FROM events WHERE run_id ORDER BY sequence_no DESC LIMIT 1` → `'CORRECTION_ESCALATED'`
- Run BLOCKED — only UC-12 can unblock

---

## UC-11: CorrectionResolve

**State Machine Reference:** T11 (CORRECTION → IN_PROGRESS)
**Actor:** `current_team` (reviewer role)

**Preconditions:**
1. `runs.status = 'CORRECTION'`
2. (G02) actor identity valid (reviewer team per routing)

**Input:**
| Parameter | Type | Required | Dict Field |
|---|---|---|---|
| `run_id` | TEXT | YES | `runs.id` |
| `actor_team_id` | TEXT | YES | `teams.id` |
| `verdict` | TEXT | YES | `"pass"` |
| `resolution_notes` | TEXT | YES | → `events.reason` |

**Main Flow:**
1. Validates: status=CORRECTION, G02 (reviewer actor)
2. (A02) `UPDATE runs SET status='IN_PROGRESS', current_gate_id=:next_gate_id, current_phase_id=:next_phase_id, last_updated=now() WHERE id=:run_id` (`correction_cycle_count` NOT reset)
3. `UPDATE pipeline_state.json`
4. Emits: `INSERT INTO events (event_type='CORRECTION_RESOLVED', run_id, actor_team_id, actor_type='agent', gate_id, phase_id, domain_id, work_package_id, verdict='PASS', reason=:resolution_notes, payload_json={correction_cycle_count}, occurred_at=now(), ...)`
5. Returns: `{run_id, status='IN_PROGRESS', current_gate_id, current_phase_id, next_actor_team_id}`

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `WRONG_ACTOR` | G02 fails | 403 | |
| `INVALID_STATE` | `runs.status ≠ 'CORRECTION'` | 409 | |

**Postconditions:**
- `SELECT status FROM runs WHERE id=:run_id` → `'IN_PROGRESS'`
- `SELECT correction_cycle_count FROM runs WHERE id=:run_id` → preserved (same value)

---

## UC-12: PrincipalOverride

**State Machine Reference:** T12, Actions A10A–A10E
**Actor:** `team_00` ONLY (D-03)

**Preconditions:**
1. (G09) `:actor_team_id = teams.id WHERE teams.id='team_00'` (D-03)
2. (G09) `action ∈ {FORCE_PASS, FORCE_FAIL, FORCE_PAUSE, FORCE_RESUME, FORCE_CORRECTION}`
3. `runs.status ∉ {'COMPLETE'}` — non-terminal

**Input:**
| Parameter | Type | Required | Dict Field |
|---|---|---|---|
| `run_id` | TEXT | YES | `runs.id` |
| `actor_team_id` | TEXT | YES | `teams.id` = `'team_00'` |
| `action` | TEXT | YES | FORCE_PASS \| FORCE_FAIL \| FORCE_PAUSE \| FORCE_RESUME \| FORCE_CORRECTION |
| `reason` | TEXT | YES | → `events.reason` (חובה — audit trail) |
| `snapshot` | JSON | COND | חובה ב-FORCE_PAUSE; אופציונלי ב-FORCE_RESUME |

**Main Flow per action:**

**A10A — FORCE_PASS:**
- Non-final: `UPDATE runs SET status='IN_PROGRESS', current_gate_id=next, current_phase_id=next, last_updated=now() WHERE id=:run_id`
- Final: `UPDATE runs SET status='COMPLETE', completed_at=now(), paused_routing_snapshot_json=NULL, last_updated=now() WHERE id=:run_id`

**A10B — FORCE_FAIL:**
- `UPDATE runs SET status='CORRECTION', correction_cycle_count=correction_cycle_count+1, last_updated=now() WHERE id=:run_id`

**A10C — FORCE_PAUSE:**
- ATOMIC: `UPDATE runs SET status='PAUSED', paused_at=now(), paused_routing_snapshot_json=:snapshot, last_updated=now() WHERE id=:run_id`

**A10D — FORCE_RESUME:**
- `UPDATE runs SET status='IN_PROGRESS', paused_at=NULL, last_updated=now() WHERE id=:run_id`; routing from snapshot (same as A07)

**A10E — FORCE_CORRECTION:**
- `UPDATE runs SET status='CORRECTION', last_updated=now() WHERE id=:run_id`; `correction_cycle_count` NOT incremented

**All actions conclude with:**
- `INSERT INTO events (event_type='PRINCIPAL_OVERRIDE', run_id, actor_team_id='team_00', actor_type='human', gate_id, phase_id, domain_id, work_package_id, reason=:reason, payload_json={action, from_status, to_status, reason}, occurred_at=now(), ...)`
- `UPDATE pipeline_state.json`

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `NOT_PRINCIPAL` | G09 actor fails | 403 | |
| `INVALID_ACTION` | action ∉ allowed set | 400 | |
| `TERMINAL_STATE` | `runs.status = 'COMPLETE'` | 409 | |
| `MISSING_REASON` | reason empty | 400 | חובה — audit |
| `SNAPSHOT_REQUIRED` | FORCE_PAUSE without snapshot | 400 | |

**Postconditions:** vary by action per A10A-E above.

---

## UC-13: GetCurrentState

**Query Operation Reference:** QO-01 (StateQuery — read-only, no state transition)
**Actor:** Any

**Preconditions:**
- Run exists: `SELECT 1 FROM runs WHERE id=:run_id` OR domain has active run

**Input:**
| Parameter | Type | Required | Dict Field |
|---|---|---|---|
| `run_id` | TEXT | COND | `runs.id` |
| `domain_id` | TEXT | COND | `runs.domain_id` — alternative to run_id |

**Main Flow:**
1. Resolve: by `runs.id` OR by `domain_id WHERE status IN ('IN_PROGRESS','CORRECTION','PAUSED')`
2. Query:
   ```sql
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
     t.id AS actor_team_id,
     t.label AS actor_team_label,
     t.engine AS actor_engine
   FROM runs r
   LEFT JOIN assignments a ON a.work_package_id=r.work_package_id
     AND a.domain_id=r.domain_id
     AND a.status='ACTIVE'
   LEFT JOIN pipeline_roles pr ON pr.id=a.role_id
   LEFT JOIN teams t ON t.id=a.team_id
   WHERE r.id=:run_id
   ```
3. Returns state response (see §Response Schema below)

**Response Schema:**
```json
{
  "run_id": "string (runs.id)",
  "work_package_id": "string (runs.work_package_id)",
  "domain_id": "string (runs.domain_id)",
  "process_variant": "string (runs.process_variant)",
  "status": "NOT_STARTED|IN_PROGRESS|CORRECTION|PAUSED|COMPLETE",
  "current_gate_id": "string|null (runs.current_gate_id)",
  "current_phase_id": "string|null (runs.current_phase_id)",
  "correction_cycle_count": "integer (runs.correction_cycle_count)",
  "paused_at": "ISO-8601|null (runs.paused_at)",
  "completed_at": "ISO-8601|null (runs.completed_at)",
  "started_at": "ISO-8601 (runs.started_at)",
  "last_updated": "ISO-8601 (runs.last_updated)",
  "actor": {
    "team_id": "string (teams.id format: team_XX)",
    "label": "string (teams.label)",
    "engine": "string (teams.engine)"
  }
}
```

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `RUN_NOT_FOUND` | `runs.id` invalid | 404 | |
| `NO_ACTIVE_RUN` | domain query returns empty | 200 | empty object `{}` |

**Postconditions:**
- `SELECT COUNT(*) FROM runs WHERE id=:run_id` → `1` (run exists, unchanged)
- `SELECT status FROM runs WHERE id=:run_id` → same value as before query (no state change)
- ללא שינוי ב-events table
- ללא שינוי ב-pipeline_state.json

**Side Effects:** None.

---

## UC-14: GetHistory

**Query Operation Reference:** QO-02 (HistoryQuery — read-only, no state transition)
**Actor:** Any

**Input:**
| Parameter | Type | Required | Dict Field |
|---|---|---|---|
| `run_id` | TEXT | NO | `events.run_id` |
| `domain_id` | TEXT | NO | `events.domain_id` |
| `gate_id` | TEXT | NO | `events.gate_id` |
| `event_type` | TEXT | NO | `events.event_type` |
| `limit` | INTEGER | NO | default=50, max=200 |
| `offset` | INTEGER | NO | default=0 |

**Main Flow:**
1. Validate filters (event_type ∈ defined ENUM if provided)
2. Query:
   ```sql
   SELECT
     e.id,
     e.run_id,
     e.sequence_no,
     e.event_type,
     e.gate_id,
     e.phase_id,
     e.domain_id,
     e.work_package_id,
     e.actor_team_id,
     e.actor_type,
     e.verdict,
     e.reason,
     e.payload_json,
     e.occurred_at,
     t.id AS actor_team_id,
     t.label AS actor_label
   FROM events e
   LEFT JOIN teams t ON t.id=e.actor_team_id
   WHERE (:run_id IS NULL OR e.run_id=:run_id)
     AND (:domain_id IS NULL OR e.domain_id=:domain_id)
     AND (:gate_id IS NULL OR e.gate_id=:gate_id)
     AND (:event_type IS NULL OR e.event_type=:event_type)
   ORDER BY e.occurred_at DESC, e.sequence_no DESC
   LIMIT :limit OFFSET :offset
   ```
3. Returns paginated event list

**Response Schema:**
```json
{
  "total": "integer",
  "limit": "integer",
  "offset": "integer",
  "events": [
    {
      "id": "string (events.id)",
      "run_id": "string (events.run_id)",
      "sequence_no": "integer (events.sequence_no)",
      "event_type": "string (events.event_type)",
      "gate_id": "string|null (events.gate_id)",
      "phase_id": "string|null (events.phase_id)",
      "domain_id": "string (events.domain_id)",
      "work_package_id": "string (events.work_package_id)",
      "actor": {
        "team_id": "string|null (teams.id format: team_XX)",
        "label": "string|null (teams.label)",
        "type": "string (events.actor_type)"
      },
      "verdict": "string|null (events.verdict)",
      "reason": "string|null (events.reason)",
      "payload_json": "object|null (events.payload_json)",
      "occurred_at": "ISO-8601 (events.occurred_at)"
    }
  ]
}
```

**Error Flows:**
| Code | Trigger | HTTP | Description |
|---|---|---|---|
| `INVALID_EVENT_TYPE` | `event_type` filter not in defined ENUM | 400 | |
| `INVALID_LIMIT` | `limit > 200` | 400 | |
| `NO_RESULTS` | Query returns empty | 200 | `{total: 0, events: []}` |

**Postconditions:**
- ללא שינוי בשום שורת DB — read-only operation
- `SELECT COUNT(*) FROM events WHERE run_id=:run_id` → same value before and after query
- ללא שינוי ב-pipeline_state.json
- ללא שינוי ב-runs table

**Side Effects:** None.

---

## Summary Table

| UC | Name | T# / QO# | Actor | From State | To State |
|---|---|---|---|---|---|
| UC-01 | InitiateRun | T01 | pipeline_engine | NOT_STARTED | IN_PROGRESS |
| UC-02 | AdvanceGate | T02 | current_team | IN_PROGRESS | IN_PROGRESS |
| UC-03 | CompleteRun | T03 | current_team | IN_PROGRESS | COMPLETE |
| UC-04 | FailGate (blocking) | T04 | current_team | IN_PROGRESS | CORRECTION |
| UC-05 | FailGate (advisory) | T05 | current_team | IN_PROGRESS | IN_PROGRESS |
| UC-06 | HumanApprove | T06 | team_00 | IN_PROGRESS | IN_PROGRESS |
| UC-07 | PauseRun | T07 | team_00 | IN_PROGRESS | PAUSED |
| UC-08 | ResumeRun | T08 | team_00 | PAUSED | IN_PROGRESS |
| UC-09 | CorrectionResubmit | T09 | current_team | CORRECTION | IN_PROGRESS |
| UC-10 | CorrectionEscalate | T10 | current_team | CORRECTION | CORRECTION |
| UC-11 | CorrectionResolve | T11 | current_team | CORRECTION | IN_PROGRESS |
| UC-12 | PrincipalOverride | T12 / A10A-E | team_00 | ANY non-terminal | per action |
| UC-13 | GetCurrentState | **QO-01** | any | — | — (read-only) |
| UC-14 | GetHistory | **QO-02** | any | — | — (read-only) |

---

## Open Questions (לשלבים הבאים)

| OQ | נושא | שלב |
|---|---|---|
| OQ-S3-01 | `GeneratePrompt` UC — תלוי Stage 6 | Stage 6 |
| OQ-S3-02 | `ManageRouting` / `ManageTeam` / `ManageDomain` UCs — תלויים Stage 5+8 | Stage 5/8 |
| OQ-S3-03 | Authentication mechanism לאימות `actor_team_id` — API key? session? | Stage 8 (API Spec) |
| OQ-S3-04 | `GATE_FAILED_ADVISORY` display ב-dashboard | Stage 8 |
| OQ-S3-05 | Alert/notification mechanism לteam_00 ב-UC-10 | Stage 6 |

---

**log_entry | TEAM_100 | USE_CASE_CATALOG | v1.0.2 | SUBMITTED_FOR_REVIEW | 2026-03-26**
