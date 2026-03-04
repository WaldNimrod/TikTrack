# NIMROD_GATE7_S002_P003_WP002_DECISION_v1.2.1

**project_domain:** TIKTRACK  
**id:** NIMROD_GATE7_S002_P003_WP002_DECISION_v1.2.1  
**from:** Nimrod (Human Approver)  
**to:** Team 90 (GATE_7 owner)  
**cc:** Team 10, Team 100, Team 00, Team 190  
**date:** 2026-03-03  
**status:** LOCKED — REJECTED  
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

## 1) Decision

**Decision:** `REJECT`  
**Human response token:** `פסילה`

`S002-P003-WP002` does not pass `GATE_7` in the current review cycle.

---

## 2) Route classification

**rejection_route:** `CODE_CHANGE_REQUIRED`  
**pre_execution_requirement:** `PRE_REMEDIATION_ALIGNMENT_REQUIRED`

The work package requires substantive code / UX / behavior corrections.  
Due to the breadth of the findings, Team 90 must perform structured pre-remediation framing before direct execution handoff to Team 10.

No transition to `GATE_8` is permitted in this cycle.

---

## 3) Blocking findings (normalized)

1. **Auth persistence semantics are not explicitly aligned to expected human flow.**  
   After server restart, the UI still treated the session as authenticated without requiring fresh login. Current implementation persists `access_token` in browser `localStorage`, and the backend uses a refresh-token flow. This behavior must be explicitly validated against product/security expectations and, if needed, corrected.

2. **Notes linking model is invalid in current data and UI.**  
   Existing notes are linked to `general`, which is not a valid entity target in the current model. Notes must link only to a specific record or to a specific date+time.

3. **Linked-entity rendering is incomplete in notes (and same principle applies to alerts).**  
   The `linked_to` column must render the linked entity name and entity icon, not raw identifiers. The table cell should open the linked object's details modal.

4. **Linked-object consistency in edit mode is broken.**  
   Changing link type must immediately reset the linked object selection. Otherwise, invalid cross-entity combinations are created (for example, a ticker object under a trading-account link type). This applies to notes and alerts.

5. **Action affordances are not self-explanatory enough.**  
   Tooltips are missing on action menus and entity-type filters. Table action triggers must expose clear tooltips everywhere.

6. **Form wording is inconsistent.**  
   `לבטל` must be normalized to `ביטול` across forms.

7. **Details modal implementation is below the project blueprint standard.**  
   Details views do not yet reflect the locked blueprint pattern: richer information layout, parent/child linked elements, and consistent entity styling. If implementation details are missing from the repo, architectural clarification is required before build.

8. **Notes attachments were not fully proven in the intended human flow.**  
   Real attachment CRUD must be proven through the UI on real records, not only assumed by form presence.

9. **Alerts domain still has core UX / semantics gaps.**  
   In addition to the shared linked-entity issues above:
   - details modals do not implement entity color clearly
   - the green envelope action icon is unclear and lacks a working tooltip / purpose contract
   - status values should render as badges per system style
   - invalid alerts must not be allowed without a valid condition definition

10. **Ticker-management domain still has active-state semantic gaps.**  
    A newly created ticker with no market data must not be allowed in active state.

11. **"My Tickers" add flow is not clear enough.**  
    The add flow should default to existing ticker selection via dropdown, with a separate explicit action for adding a new ticker to the system. Triggering new ticker creation must require market-data validation and a clear warning/confirmation path if market data is unavailable.

12. **"My Tickers" and system ticker activation rules are inconsistent.**  
    A new ticker without market data must not be allowed in active state here either.

---

## 4) Deferred carryover (not for current blocking scope)

1. **Global top filter alignment** is a real gap, but it is not required for the current immediate remediation slice.  
   It must be added to the project completion gaps / carryover list and routed for architectural scheduling in the correct future slot.

---

## 5) Next required action

1. Team 90 records the rejection canonically.
2. Team 90 updates WSM to `GATE_7 REJECT` state.
3. Team 90 opens pre-remediation alignment framing (impact map + execution options) before any direct Team 10 execution handoff.
4. Only after that framing is locked should Team 10 receive an execution remediation package.

---

## 6) Responsible next owner

**next_responsible_team:** `Team 90`

---

**log_entry | NIMROD | GATE_7 | S002_P003_WP002 | REJECT | CODE_CHANGE_REQUIRED | PRE_REMEDIATION_ALIGNMENT_REQUIRED | 2026-03-03**
