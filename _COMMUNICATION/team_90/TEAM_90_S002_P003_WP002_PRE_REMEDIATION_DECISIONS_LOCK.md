# TEAM_90_S002_P003_WP002_PRE_REMEDIATION_DECISIONS_LOCK
**project_domain:** TIKTRACK

**id:** TEAM_90_S002_P003_WP002_PRE_REMEDIATION_DECISIONS_LOCK  
**from:** Team 90 (External Validation Unit)  
**to:** Team 00, Team 100  
**cc:** Team 10  
**date:** 2026-03-01  
**status:** LOCKED_PENDING_ARCHITECT_PACKAGE  
**gate_id:** POST_G7_REJECTION_PREP  
**work_package_id:** S002-P003-WP002  

---

## Mandatory identity header

| Field | Value |
|---|---|
| roadmap_id | TIKTRACK_ROADMAP_LOCKED |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP002 |
| task_id | N/A |
| gate_id | POST_G7_REJECTION_PREP |
| phase_owner | Team 90 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | TIKTRACK |

---

## 1) Scope lock for the remediation preparation phase

The remediation-preparation scope is now explicitly locked as:

1. **All existing active entities and pages in the current system must be aligned to full consistency before expansion continues.**
2. The immediate focus remains on the last reviewed package entities:
   - D22 (`tickers`)
   - D34 (`alerts`)
   - D35 (`notes`)
3. However, the corrective program is **not limited** to those three entities if the same structural issue exists elsewhere.
4. No "tail items" are deferred by default. The expectation is full baseline alignment before adding new entities.

This means the upcoming remediation frame must be written as a **foundation alignment package**, not a narrow patch package.

---

## 2) Locked decisions

### Decision 1 — Canonical owner of system ticker creation

| Item | Locked value |
|---|---|
| Selected option | **A** |
| Decision | One canonical backend create-system-ticker flow, used by both D22 and `/me/tickers`. |

**Context:**  
Current implementation splits system ticker creation across two different backend paths.

**Why locked this way:**  
The platform requires one business rule, one validation standard, and one source of truth for system ticker creation.

**Implementation impact:**  
D22 and `/me/tickers` must converge on one canonical creation path.

---

### Decision 2 — Scope of current remediation regarding D33 / "My Tickers"

| Item | Locked value |
|---|---|
| Selected option | **A** |
| Decision | Include D33/"My Tickers" in the current correction cycle wherever it is coupled to the identified gaps. |

**Context:**  
The rejection exposed direct coupling between D22 and D33 behavior.

**Why locked this way:**  
The system will not proceed while current entities remain partially broken. Baseline must be corrected to full operational consistency before new entities are added.

**Implementation impact:**  
This is a broader remediation frame. The package must be written as a full alignment program for current entities, not a narrow tactical fix.

---

### Decision 3 — Valid linkage model for notes and alerts

| Item | Locked value |
|---|---|
| Selected option | **A with extension** |
| Decision | Every alert/note must link to either: (a) a specific concrete record, or (b) a specific timestamp (date + time). |

**Context:**  
Type-only linkage is semantically insufficient. You also want future journal-style support.

**Why locked this way:**  
This preserves concrete meaning today while allowing future journal/trading-log alignment.

**Implementation impact:**  
D34/D35 data model and forms must support:

1. specific entity record linkage, or
2. specific timestamp linkage (including hour/minute / full datetime precision)

This must be modeled explicitly, not as a free-form hack.

---

### Decision 4 — `general` linkage state

| Item | Locked value |
|---|---|
| Selected option | **A** |
| Decision | `general` is not a valid linkage target and must be removed. |

**Context:**  
Unanchored "general" records are not valid in the system model.

**Why locked this way:**  
All alerts/notes must have a precise operational anchor.

**Implementation impact:**  
`general` must be removed from forms, contracts, and persistence semantics unless explicitly reintroduced by future architect decision.

---

### Decision 5 — Minimum D34 alert condition-builder model

| Item | Locked value |
|---|---|
| Selected option | **B** |
| Decision | Implement the richer condition model now, not a minimal placeholder. |

**Context:**  
Alerts must be flexible, advanced, and genuinely useful. Minimal field+operator+value is not sufficient for the target product quality.

**Why locked this way:**  
The target is a powerful alert system, with usability and speed, supporting conditions such as price, moving averages, volume, and similar market conditions.

**Implementation impact:**  
The architect package must define a richer alert condition framework now, including:

1. target metric / source
2. operator
3. comparison value or threshold
4. room for advanced conditions / trigger modes

**Explicit benchmark instruction:**  
The architect package must include a structured benchmark against TradingView alert capabilities and aim to support at least a comparable practical baseline.

---

### Decision 6 — Minimum D34 alert lifecycle/status model

| Item | Locked value |
|---|---|
| Selected option | **A (with optional expansion if justified)** |
| Decision | Use the richer operational lifecycle baseline, and expand only if a clear user-value case exists. |

**Context:**  
Binary active/inactive is not enough for operational alerts.

**Locked baseline set:**  

1. `active`
2. `cancelled`
3. `triggered_unread`
4. `triggered_read_closed`
5. `rearmed`

**Implementation impact:**  
The architect package should validate whether additional states are required, but this baseline is now the minimum acceptable lifecycle model.

---

### Decision 7 — Scope of cross-entity UI consistency

| Item | Locked value |
|---|---|
| Selected option | **B** |
| Decision | Enforce the design/system consistency standard globally across existing entity pages now. |

**Context:**  
UI inconsistency is not accepted as local debt anymore.

**Why locked this way:**  
The system has a highly uniform page structure. The templates and standards must be fully aligned before more pages are added, otherwise drift will compound.

**Implementation impact:**  
This is no longer just a D22/D34/D35 cleanup. The remediation frame must define:

1. the standard
2. the shared components
3. the pages/entities that must be brought into alignment now

---

### Decision 8 — Proof standard for D35 attachments re-test

| Item | Locked value |
|---|---|
| Selected option | **A** |
| Decision | At least one real persisted note with an actual attached file must be proven, including add and remove behavior. |

**Context:**  
UI-only affordance is not enough.

**Why locked this way:**  
This matches the test discipline already required by the project.

**Implementation impact:**  
Future validation packages must include real attachment evidence, not only visible controls.

---

### Decision 9 — Scope of D34-to-D35 structural alignment

| Item | Locked value |
|---|---|
| Selected option | **Full alignment** |
| Decision | All structurally overlapping fixes identified in D34 must also be applied across existing pages/entities where relevant, including D35. |

**Context:**  
The reviewer clarified that the goal is full alignment across current entities before expansion.

**Why locked this way:**  
No partial cleanup. No deferred structural drift.

**Implementation impact:**  
The remediation package must be framed as a broad baseline-alignment package across all relevant current entities, with explicit emphasis on D22/D34/D35.

---

### Decision 10 — Order of execution vs architectural lock

| Item | Locked value |
|---|---|
| Selected option | **A** |
| Decision | Lock the semantic model with the architect first, through a formal submission package, before Team 10 execution begins. |

**Context:**  
Several changes are semantic/product-architectural, not just implementation details.

**Why locked this way:**  
Execution without semantic lock would create more rework and likely another rejection loop.

**Implementation impact:**  
Team 90 must now prepare a structured architect submission package before any execution handoff to Team 10.

---

## 3) Immediate consequences

1. Team 10 remains on hold for execution.
2. Team 90 must convert these locked decisions into:
   - an architect-grade remediation framing package
   - a comparison/options package where needed
   - an explicit scope model for the corrective cycle
3. Only after architect approval may Team 10 receive the remediation execution package.

---

## 4) Next deliverable required from Team 90

Next required output:

**Architect submission package for pre-remediation lock**, including:

1. scope framing
2. decision lock summary
3. open semantic definitions to finalize
4. recommended implementation streams
5. where required, external benchmark support (notably alert-system capabilities)

---

**log_entry | TEAM_90 | S002_P003_WP002 | PRE_REMEDIATION_DECISIONS_LOCKED | 2026-03-01**
