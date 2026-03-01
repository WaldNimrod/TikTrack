# Nimrod -> Team 90 | GATE_7 Human Feedback Draft — S002-P003-WP002
**project_domain:** TIKTRACK

**id:** NIMROD_GATE7_S002_P003_WP002_FEEDBACK_DRAFT
**from:** Nimrod (Human Approver)
**to:** Team 90 (GATE_7 owner)
**cc:** Team 10, Team 100, Team 00, Team 190
**date:** 2026-03-01
**status:** REVIEW_CLOSED — FINAL_REJECTION_READY
**gate_id:** GATE_7
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
| gate_id | GATE_7 |
| phase_owner | Team 90 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | TIKTRACK |

---

## 1) Document purpose

This is the active working draft for Nimrod's GATE_7 human review.

It is intentionally prepared as a running feedback document because:

1. Human review is still in progress.
2. A blocking issue has already been identified.
3. Additional findings may still be added before final submission.

Final canonical decision target on submission:

`_COMMUNICATION/_Architects_Decisions/NIMROD_GATE7_S002_P003_WP002_DECISION.md`

---

## 2) Current decision state

**Current signal:** `BLOCK`  
**Final state:** pending completion of additional browser review

At this stage, the package must not progress to `GATE_8`.

Reason: at least one material blocker has already been confirmed in the relationship between:

- D22 (`tickers`)
- D33 (`user_tickers` / "הטיקרים שלי")
- market-data validation requirements

---

## 3) Confirmed blocking findings

### 1. Blocking finding — invalid split between system tickers and "My Tickers"

- **Area:** D22 / D33 / backend creation flow
- **Action reviewed:** business/logic model behind ticker creation and user association
- **Expected model:**
  - `market_data.tickers` is the single system catalog.
  - `user_data.user_tickers` is a user-to-ticker link layer only.
  - There must be exactly one canonical process for creating a new system ticker.
  - That canonical creation process must include market-data availability validation.
  - When a user adds a ticker through "הטיקרים שלי":
    - if ticker already exists in the system -> link only
    - if ticker does not exist -> invoke the same canonical system ticker creation flow, then link
- **Actual state identified:**
  - `POST /tickers` creates a system ticker directly without enforcing market-data validation.
  - `POST /me/tickers` contains a separate creation path with its own live-data-check behavior.
  - This creates two different creation paths for the same system entity.
  - In the current environment, live-data validation can also be bypassed by `SKIP_LIVE_DATA_CHECK=true`, which further weakens the consistency of the rule.
- **Why this is a blocker:**
  - The user-facing model and the backend ownership model diverge.
  - "My Tickers" is behaving as a semi-independent creation path instead of a pure linkage layer.
  - There is no single source of truth for ticker creation rules.
  - This is a structural logic issue, not a cosmetic UI issue.
- **Classification:** `חוסם`

---

## 4) Required remediation for finding #1

The following updates are required in order to close this blocker:

1. **Unify ticker creation into one canonical backend flow**
   - There must be one canonical service path for creating a system ticker.
   - All system ticker creation must route through that one path.

2. **Make D22 use the same canonical creation flow**
   - `D22 / POST /tickers` must no longer create a system ticker through a separate lightweight path.
   - It must enforce the same market-data validation requirements as the canonical creation flow.

3. **Convert `/me/tickers` into lookup + link (with canonical fallback)**
   - `POST /me/tickers` should first check whether the ticker already exists in `market_data.tickers`.
   - If found: create only the `user_tickers` link.
   - If not found: invoke the canonical system ticker creation flow, then create the link.

4. **Remove duplicate business rules from split services**
   - Business logic for ticker creation must not remain duplicated across separate service implementations.
   - Team 20 must consolidate creation behavior and validation rules into one authoritative path.

5. **Lock market-data validation as part of system ticker creation**
   - Market-data validation must be part of the canonical ticker creation rule.
   - Any bypass mechanism (such as dev-only skip flags) must be documented as non-canonical and must not weaken the production/business rule.

6. **Update SSOT / contracts / work procedures**
   - The documentation must explicitly state:
     - "הטיקרים שלי" is not an independent ticker-creation domain.
     - It is a personalization/link layer on top of the system ticker catalog.
     - System ticker creation is single-path and market-data validated.

7. **Re-test after remediation**
   - Re-validation must include both:
     - D22 creation path
     - "הטיקרים שלי" add path
   - Expected behavior after fix:
     - one rule set
     - one validation standard
     - no behavioral drift between UI entry points

---

## 5) Additional confirmed findings from ongoing browser review

### 2. Blocking finding — add-button and modal behavior are not system-consistent

- **Area:** cross-entity UI pattern (`D22`, `D34`, `D35`, and entity details flows)
- **Action reviewed:** add-button presentation, wording, detail-view behavior, and modal design consistency
- **Expected:**
  - Add buttons must be visually and behaviorally consistent across entity pages.
  - Hebrew wording must be neutral and exact, for example: `הוספת טיקר` and not `הוסף טיקר`.
  - "פרטים" must always open a full entity details module, including related linked elements, not a browser `alert()` and not a partial placeholder.
  - Entity modals must follow the established design baseline already demonstrated in the trading-account flow (layout, entity color use, button hierarchy, field spacing, visual structure).
- **Actual:**
  - In `D22` the add affordance is currently icon-only, which is not sufficiently explicit or consistent.
  - Detail actions are not uniformly implemented as full structured detail modules across entities.
  - Opened modals are not visually aligned to the established modal design standard.
- **Why this is a blocker:**
  - The system presents entity actions in inconsistent ways, reducing predictability.
  - The user cannot rely on a stable interaction model across core entities.
  - "Details" is a core platform behavior; if it is inconsistent, entity workflows are incomplete.
- **Classification:** `חוסם`

### 3. Blocking finding — "My Tickers" action model is incomplete

- **Area:** D33 / `user_tickers`
- **Action reviewed:** action menu capabilities and add-flow clarity
- **Expected:**
  - The action menu for "הטיקרים שלי" must include edit when the entity supports user-level metadata and interaction.
  - The add flow must actively help the user understand whether the ticker already exists in the system and what the system is doing.
  - The modal should validate the entered symbol, check existence, and update the modal state accordingly before final add.
- **Actual:**
  - The `user_tickers` actions currently omit edit.
  - The add flow does not make the existence check explicit to the user and does not transparently update the modal based on lookup result.
- **Why this is a blocker:**
  - The UX hides critical system state from the user.
  - The flow is ambiguous exactly in the place where the creation/link distinction matters most.
  - This reinforces the architectural drift already found in finding #1.
- **Classification:** `חוסם`

### 4. Blocking finding — "My Tickers" missing required user-facing fields and actions

- **Area:** D33 / `user_tickers`
- **Action reviewed:** user-level ticker management capabilities
- **Expected:**
  - A user should be able to add a note to a ticker in "הטיקרים שלי" when the list represents tracked items.
  - If `user_tickers` has (or should have) user-level state, the UI must expose a proper status field using the fixed system status set.
  - The wording for cancel actions should be `ביטול`, not `לבטל`, in the modal button language standard.
- **Actual:**
  - No note action is exposed for "הטיקרים שלי".
  - A clear user-level status control is not exposed here in the way the reviewer expects from the system model.
  - Wording uses `לבטל`, which is inconsistent with the required copy standard.
- **Why this is a blocker:**
  - The entity is presented as functionally thinner than expected for a tracked personal list.
  - Missing user-layer metadata/actions reduces usability and weakens the purpose of the list.
  - Wording inconsistency contributes to UI drift relative to the product language standard.
- **Classification:** `חוסם`

### 5. Blocking finding — alert and note linkage model is incomplete

- **Area:** D34 / D35
- **Action reviewed:** linking an alert/note to another entity
- **Expected:**
  - Choosing only a link type is not sufficient.
  - The user must ultimately link the record to a specific concrete entity instance (specific trading account, specific ticker, specific trade, etc.).
  - Without a concrete target record, the object has no operational meaning.
- **Actual:**
  - The current forms allow choosing only the linked entity type, without forcing resolution to a specific target record.
- **Why this is a blocker:**
  - A note or alert without a concrete linked record is semantically incomplete.
  - It becomes unclear what the note refers to or what condition an alert is actually attached to.
  - This breaks both user meaning and testability of the feature.
- **Classification:** `חוסם`

### 6. Blocking finding — alert condition model is under-specified in the UI

- **Area:** D34 / alerts
- **Action reviewed:** alert creation/edit condition definition
- **Expected:**
  - The alert UI must support a real logical condition builder.
  - Selecting an alert dimension (for example "price") is not enough.
  - The user must define at minimum:
    - target metric/field
    - operator
    - threshold/value
  - The overall interaction should be understandable and practical, not just a technical placeholder.
- **Actual:**
  - The current form exposes alert type selection but does not provide a complete condition-definition experience.
- **Why this is a blocker:**
  - An alert without a usable condition model is not operationally meaningful.
  - Users cannot define when and why the alert should trigger.
  - The feature is structurally incomplete as a business behavior.
- **Classification:** `חוסם`

### 7. Blocking finding — alert lifecycle/status model is too shallow

- **Area:** D34 / alerts
- **Action reviewed:** status semantics and operational states
- **Expected:**
  - Alerts need lifecycle states richer than `active / inactive`.
  - The reviewer expects the status model to distinguish cases such as:
    - user-cancelled
    - triggered and unread
    - triggered and read / completed
    - re-armed / reactivated
  - If current SSOT is incomplete, this requires architectural clarification before implementation.
- **Actual:**
  - The current alert model appears materially simpler than the lifecycle expected by the reviewer.
- **Why this is a blocker:**
  - Alert semantics directly affect meaning, filtering, and user trust.
  - Without a proper lifecycle model, "triggered" alerts cannot be managed correctly.
- **Classification:** `חוסם`

### 8. Blocking finding — alerts internal filter behavior is not functioning correctly

- **Area:** D34 / alerts
- **Action reviewed:** internal page filter buttons
- **Expected:**
  - Internal filter controls must work.
  - The first "all alerts" control must reliably show the full set.
- **Actual:**
  - The filter is visually present, but the reviewer reports that it does not work correctly.
  - The first filter button does not behave as the canonical "show all" state.
- **Why this is a blocker:**
  - Filtering is a core list-management action for alerts.
  - A non-functional filter undermines both usability and confidence in list state.
- **Classification:** `חוסם`

### 9. Blocking finding — alert edit does not persist the linked-object update

- **Area:** D34 / alerts
- **Action reviewed:** edit an existing alert and change its linkage
- **Expected:**
  - Editing an alert and changing the linked target should persist and be reflected after save.
- **Actual:**
  - The reviewer changed the linkage during edit and the update did not actually persist.
- **Why this is a blocker:**
  - This is a direct save/update failure in a core entity workflow.
  - It makes the edit flow unreliable and confirms that the linkage model is not fully implemented.
- **Classification:** `חוסם`

### 10. Architectural clarification required — alert UX and status model may need pre-development consultation

- **Area:** D34 / alerts / product semantics
- **Action reviewed:** comparison of current behavior versus expected operational semantics
- **Expected:**
  - If the current specification does not yet fully lock:
    - specific-entity linkage,
    - condition-builder structure,
    - full alert lifecycle statuses,
    then these must be clarified before implementation continues.
- **Actual:**
  - The reviewer identifies a likely gap between implemented UI and the intended product meaning.
- **Why it matters:**
  - This can lead to implementing the wrong model cleanly instead of the right model correctly.
  - It should be escalated for architectural clarification if the current SSOT is incomplete.
- **Classification:** `חוסם`

### 11. Blocking finding — D35 must inherit D34 structural corrections where the data model overlaps

- **Area:** D35 / notes
- **Action reviewed:** scope treatment after reviewing D34 and deciding not to continue full deep review of notes page right now
- **Expected:**
  - Any structural issue already identified in D34 that also applies to D35 must be treated as a required correction for notes as well.
  - Shared concepts such as concrete linkage, CRUD completeness, detail behavior, and entity-consistent UI rules must be aligned across both entities.
- **Actual:**
  - The reviewer is intentionally stopping deeper notes-page review for now, but the overlap in structure makes it clear that multiple D34 findings are also relevant to D35.
- **Why this is a blocker:**
  - Deferring the mirrored fixes to D35 would preserve cross-entity drift.
  - The product model would remain inconsistent between alerts and notes.
- **Classification:** `חוסם`

### 12. Blocking finding — CRUD coverage is incomplete and must include all meaningful fields

- **Area:** D34 / D35 / entity forms
- **Action reviewed:** practical review of create/edit flows
- **Expected:**
  - CRUD validation must cover all meaningful fields in each entity, not only a subset.
  - If a field is exposed in create or edit, it must be verified for persistence and correct update behavior.
- **Actual:**
  - Current behavior indicates that important fields (for example linked-object semantics) are not reliably covered by actual working CRUD behavior.
- **Why this is a blocker:**
  - Partial CRUD creates false confidence: the record may save, but not fully.
  - Incomplete persistence means the entity workflow is not actually complete.
- **Classification:** `חוסם`

### 13. Blocking finding — action-menu buttons require explicit tooltips across all pages

- **Area:** all action menus / all entity pages
- **Action reviewed:** discoverability of row-action buttons
- **Expected:**
  - Every action-menu button must have a clear tooltip describing exactly what it does.
  - Icon-only actions without explicit meaning are not acceptable.
- **Actual:**
  - The reviewer reports unclear actions, including the envelope button in alerts, whose purpose is not self-evident and not clearly tied to a defined action.
- **Why this is a blocker:**
  - Users cannot reliably infer destructive or state-changing actions from icons alone.
  - Core action menus become ambiguous and error-prone.
- **Classification:** `חוסם`

### 14. Blocking finding — "general" is not a valid linked entity for notes

- **Area:** D35 / notes linkage model
- **Action reviewed:** linked-entity options in note creation/edit
- **Expected:**
  - A note must be linked to a valid meaningful entity in the system.
  - `general` is not accepted by the reviewer as a legitimate entity target in the system model.
- **Actual:**
  - The notes flow still permits a `general` linkage state.
- **Why this is a blocker:**
  - It allows semantically unanchored notes that are not tied to a real system record.
  - This conflicts with the reviewer-defined product meaning for notes.
- **Classification:** `חוסם`

### 15. Blocking finding — attachment behavior was not actually proven end-to-end

- **Area:** D35 / notes attachments
- **Action reviewed:** actual runtime verification of file attachment behavior
- **Expected:**
  - At least one real note record with an actual attachment should exist during validation.
  - Attachment add/remove/display should be proven through a real persisted record, not only assumed by UI affordances.
- **Actual:**
  - No actual record with an attached file was present in the reviewer test flow.
  - Therefore attachment behavior was not truly verified in practice.
- **Why this is a blocker:**
  - A critical feature (attachments) remains unproven in real usage.
  - UI claims alone are insufficient for acceptance.
- **Classification:** `חוסם`

### 16. Blocking finding — linked entity identifier must not be user-editable in note edit flow

- **Area:** D35 / notes edit form
- **Action reviewed:** note edit behavior for linked entity fields
- **Expected:**
  - Once the note is linked, the entity identifier should be presented as informational context (label/read-only), not as a free-edit field for the user.
- **Actual:**
  - The note edit flow exposes the entity identifier as an editable input.
- **Why this is a blocker:**
  - It invites invalid or inconsistent reassignment through raw identifier editing.
  - This is not an acceptable UX or data-integrity pattern for linked entities.
- **Classification:** `חוסם`

---

## 6) Required remediation summary (cumulative)

In addition to the ticker-flow remediation in section 4, the following updates are now required:

1. Standardize add buttons across entities:
   - explicit labeled action
   - neutral Hebrew phrasing (`הוספת ...`)
   - no icon-only primary add action for these core entity pages
2. Standardize all "details" actions to open full detail modules for entities, including linked elements.
3. Align modal design system-wide to the trading-account baseline:
   - entity color usage
   - button wording
   - field order
   - spacing/layout
4. Expand `user_tickers` into a complete user-layer interaction surface:
   - explicit lookup feedback
   - edit action
   - user note capability
   - status model exposure or formal spec clarification
5. Redesign D34/D35 linkage so the user selects a specific linked record, not only a linked type.
6. Implement a real D34 alert condition builder with field + operator + value.
7. Revisit the D34 alert lifecycle/state model and lock it in SSOT if not already sufficiently defined.
8. Fix D34 internal filtering so "all" is the true canonical full-set state.
9. Fix D34 edit persistence so linkage and edited fields are actually saved.
10. Apply all structurally overlapping D34 fixes to D35 where the same entity-model issue exists.
11. Verify CRUD behavior against all meaningful exposed fields, not only headline fields.
12. Add explicit tooltips to all action-menu buttons across all pages.
13. Remove `general` as a valid semantic linked-entity option for notes unless re-approved architecturally.
14. Re-run D35 attachment validation with at least one real persisted attached-file record.
15. Convert linked entity identifiers in note edit flow from editable inputs to informational read-only presentation where appropriate.
16. Perform architectural review before further implementation where the semantic model is not yet fully locked.

---

## 7) Running reviewer notes

- Human review was performed in browser/UI mode only.
- Review is now closed for this cycle.
- Additional future findings, if any, should be treated as part of the remediation/retest loop, not this review cycle.
- Because multiple blockers are confirmed, the final operational outcome for this cycle is rejection.

---

## 8) Final decision block

**Final decision:** `פסילה`

**Locked operational outcome:**

1. Team 90 must normalize this review into a canonical GATE_7 decision artifact.
2. Team 90 must classify the rejection route.
3. Team 90 must update WSM and route the work package accordingly.
4. `GATE_8` must not be activated for this work package in the current cycle.

---

**log_entry | TEAM_90 | S002_P003_WP002 | GATE_7_FEEDBACK_DRAFT_PREPARED | BLOCK_SIGNAL_ACTIVE | 2026-03-01**
**log_entry | TEAM_90 | S002_P003_WP002 | GATE_7_FEEDBACK_DRAFT_FINALIZED | FINAL_REJECTION_READY | 2026-03-01**
