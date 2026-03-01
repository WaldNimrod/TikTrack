# TEAM_90_S002_P003_WP002_PRE_REMEDIATION_IMPACT_MAP
**project_domain:** TIKTRACK

**id:** TEAM_90_S002_P003_WP002_PRE_REMEDIATION_IMPACT_MAP  
**from:** Team 90 (External Validation Unit)  
**to:** Nimrod, Team 00, Team 100  
**cc:** Team 10  
**date:** 2026-03-01  
**status:** PRE_REMEDIATION_ANALYSIS_READY  
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

## 1) Purpose

This document defines the preparatory analysis phase inserted after `GATE_7 REJECT` and before any remediation is handed to Team 10.

Reason:

The identified gaps are deep enough that direct execution would create rework risk, scope drift, and likely secondary contradictions.

Therefore the required order is now:

1. Team 90 maps impact and remediation domains.
2. Decision questions are raised to Nimrod / architecture authority.
3. An architect-approved remediation frame is locked.
4. Only then Team 10 receives an execution package.

---

## 2) Change domains requiring structured preparation

### Domain A — Ticker catalog vs "My Tickers" architecture

**What changed:**  
The reviewer identified a structural mismatch between:

- `market_data.tickers`
- `user_data.user_tickers`
- D22 system ticker creation
- D33/"My Tickers" add flow

**Why it is high impact:**  
This is not a local UI defect. It changes ownership of creation logic, validation rules, and user flow semantics.

**Required target:**  
One canonical system-ticker creation path + one user-link path.

**Implementation options:**

1. **Option A — central shared service (recommended)**
   - Create a canonical backend create-system-ticker flow used by both D22 and `/me/tickers`.
   - `/me/tickers` becomes lookup -> link or create-via-canonical -> link.
   - **Pros:** cleanest long-term rule, least drift.
   - **Cons:** touches multiple code paths and requires careful service refactor.

2. **Option B — keep two endpoints, unify by delegation**
   - Keep current endpoints, but make both call the same internal canonical function.
   - **Pros:** less route churn.
   - **Cons:** still leaves UX semantics split at the API surface.

3. **Option C — freeze D22 creation and force all new ticker creation through user flow**
   - D22 becomes browse/edit/admin-only for existing system tickers.
   - New ticker creation happens only via the user-facing add flow.
   - **Pros:** strongest business-rule separation.
   - **Cons:** changes D22 behavior materially; likely larger product decision.

**Recommended:** Option A.

---

### Domain B — Cross-entity interaction standardization

**What changed:**  
The reviewer raised cross-cutting issues in:

- add buttons
- details modules
- modal visual standards
- action button discoverability
- copy consistency

**Why it is high impact:**  
This is a system-wide interaction pattern issue, not a single-page bug.

**Implementation options:**

1. **Option A — full standardization inside this remediation cycle**
   - Apply button/modal/action standards now to all affected entities in the package.
   - **Pros:** closes drift immediately.
   - **Cons:** expands remediation scope significantly.

2. **Option B — mandatory fixes for touched entities only (recommended)**
   - Enforce the standard on D22/D34/D35 and any shared component they use.
   - Record the wider standard as follow-up for remaining entities.
   - **Pros:** contains scope while fixing the current user-facing breakage.
   - **Cons:** does not fully clear global UI debt.

3. **Option C — standards doc only now, visual implementation later**
   - **Pros:** fast.
   - **Cons:** not acceptable after a GATE_7 rejection on actual UX.

**Recommended:** Option B.

---

### Domain C — Alerts semantic model

**What changed:**  
The reviewer identified that D34 is under-modeled in three core areas:

1. concrete linked target
2. real condition builder
3. operational lifecycle states

**Why it is high impact:**  
This is product semantics. A shallow implementation of the wrong model should not be sent to Team 10 for blind patching.

**Implementation options:**

1. **Option A — lock minimal operational model before code (recommended)**
   - Define minimum linked target rule.
   - Define minimum condition schema.
   - Define minimum lifecycle state set.
   - Then implement.
   - **Pros:** prevents building the wrong behavior.
   - **Cons:** requires an explicit decision pass first.

2. **Option B — implement only obvious bugs, defer semantic model**
   - **Pros:** faster locally.
   - **Cons:** almost guarantees another rejection.

**Recommended:** Option A.

---

### Domain D — Notes semantic alignment

**What changed:**  
The reviewer explicitly determined that notes must inherit the structurally overlapping fixes from alerts where the data model overlaps.

Key examples:

- linked target must be a specific record
- `general` is not accepted as a valid semantic target
- editable raw entity identifier is not acceptable in edit mode
- attachments must be proven with a real persisted record

**Implementation options:**

1. **Option A — mirror D34 structural corrections into D35 now (recommended)**
   - **Pros:** prevents parallel drift.
   - **Cons:** increases implementation scope modestly.

2. **Option B — keep D35 mostly as-is and revisit later**
   - **Pros:** smaller immediate scope.
   - **Cons:** explicitly conflicts with the reviewer decision.

**Recommended:** Option A.

---

### Domain E — Validation and acceptance model

**What changed:**  
The reviewer added a stronger expectation:

- CRUD must be verified against all meaningful fields
- attachments need real proof, not only UI affordances
- action meanings must be explicit

**Why it is high impact:**  
It changes how the next validation package must be prepared.

**Implementation options:**

1. **Option A — strengthen re-test criteria now (recommended)**
   - Update QA/remediation package to prove field-level persistence and real attachment behavior.
   - **Pros:** aligns test evidence with the rejection basis.
   - **Cons:** requires tighter execution planning.

2. **Option B — keep prior test scope and add narrative only**
   - **Pros:** cheaper.
   - **Cons:** not credible after the current review.

**Recommended:** Option A.

---

## 3) Proposed remediation framing (before Team 10 execution)

Team 90 recommends splitting the future remediation package into three controlled sub-streams:

1. **Stream 1 — Canonical data-flow corrections**
   - ticker creation unification
   - user_tickers link semantics
   - notes/alerts concrete linkage

2. **Stream 2 — Product semantic lock**
   - alert condition builder minimum model
   - alert lifecycle statuses
   - notes target constraints

3. **Stream 3 — UX/system consistency**
   - add-button standard
   - details modules
   - tooltips
   - modal design baseline
   - text/copy consistency

This creates a usable execution frame instead of a flat list of mixed changes.

---

## 4) Output required before Team 10 activation

Before Team 10 is reactivated, the following should exist:

1. Decision answers for the open questions.
2. Architect confirmation for the semantic model where needed.
3. A scoped remediation package grouped by stream.
4. Clear inclusion/exclusion boundaries for this cycle.

Without these, Team 10 would be executing unresolved design questions instead of a stable mandate.

---

**log_entry | TEAM_90 | S002_P003_WP002 | PRE_REMEDIATION_IMPACT_MAP_READY | 2026-03-01**
