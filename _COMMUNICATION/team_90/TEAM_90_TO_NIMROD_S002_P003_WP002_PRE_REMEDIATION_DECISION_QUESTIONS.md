# Team 90 -> Nimrod | Pre-Remediation Decision Questions — S002-P003-WP002
**project_domain:** TIKTRACK

**id:** TEAM_90_TO_NIMROD_S002_P003_WP002_PRE_REMEDIATION_DECISION_QUESTIONS  
**from:** Team 90 (External Validation Unit)  
**to:** Nimrod, Team 00, Team 100  
**cc:** Team 10  
**date:** 2026-03-01  
**status:** DECISION_INPUT_REQUIRED  
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

These are the decisions that should be locked before Team 10 receives a remediation execution mandate.

They are grouped to reduce ambiguity and prevent another mixed-scope correction cycle.

---

## 2) Questions requiring decision

### Q1 — Canonical owner of system ticker creation

**Question:**  
Which model is now canonical for creating a new system ticker?

**Options:**

1. **A (recommended):** One canonical backend create-system-ticker flow, used by both D22 and `/me/tickers`.
2. **B:** D22 keeps a separate route, but both routes delegate to the same internal service.
3. **C:** D22 stops creating new system tickers; only the user-facing add flow may create new ones.

**Why this must be locked:**  
This is the core architectural contradiction behind the current rejection.

---

### Q2 — Scope of the current remediation regarding D33 / "My Tickers"

**Question:**  
Should the current remediation cycle include behavioral changes in D33 itself, even though the rejection emerged during S002-P003 review?

**Options:**

1. **A (recommended):** Yes, include the D33 behaviors that are directly coupled to the rejected flow (lookup, link, add UX, edit capability, note/status semantics if required).
2. **B:** Only lock backend canonical behavior now; defer most D33 UI work to its formal package later.
3. **C:** Defer D33 entirely and only fix D22/D34/D35 now.

**Why this must be locked:**  
The reviewer’s findings directly touch the user_tickers experience; deferring too much may preserve the contradiction.

---

### Q3 — Valid linked target model for notes and alerts

**Question:**  
Must D34 and D35 require linkage to a specific concrete record?

**Options:**

1. **A (recommended):** Yes. Link type alone is insufficient; a specific entity record is mandatory.
2. **B:** Specific record is mandatory for alerts, but optional for notes.
3. **C:** Keep current type-only linkage temporarily and document it as partial.

**Why this must be locked:**  
This changes form structure, data contract, and persistence rules.

---

### Q4 — "General" linkage state

**Question:**  
Is `general` still a valid semantic target for notes and/or alerts?

**Options:**

1. **A (recommended):** No. Remove `general` as a valid business target.
2. **B:** Keep `general` for notes only.
3. **C:** Keep `general` for both, but formally document why it is meaningful.

**Why this must be locked:**  
The current reviewer decision rejects unanchored records as meaningless in this model.

---

### Q5 — Minimum D34 alert condition-builder model

**Question:**  
What is the minimum canonical condition structure required for D34?

**Options:**

1. **A (recommended):** field + operator + value (minimum viable operational rule)
2. **B:** field + operator + value + optional trigger mode / recurrence mode
3. **C:** temporary minimal placeholder only, full builder later

**Why this must be locked:**  
Without this, Team 10 would implement a UI without a stable semantic contract.

---

### Q6 — Minimum D34 alert lifecycle/status model

**Question:**  
What alert states are required in the current correction cycle?

**Options:**

1. **A (recommended minimum):**
   - active
   - cancelled
   - triggered_unread
   - triggered_read_closed
   - rearmed
2. **B:** keep only active/inactive now, defer richer states
3. **C:** lock a larger lifecycle immediately, beyond the minimum above

**Why this must be locked:**  
State semantics affect filters, list behavior, persistence, and trigger handling.

---

### Q7 — Cross-entity UI consistency scope

**Question:**  
How much of the cross-entity design consistency should be included in this cycle?

**Options:**

1. **A (recommended):** enforce on D22/D34/D35 and any shared components they directly use
2. **B:** enforce globally across all entity pages now
3. **C:** document standard now, implement later

**Why this must be locked:**  
This determines whether the remediation remains bounded or becomes a broad UI refactor.

---

### Q8 — Attachments proof standard for D35 re-test

**Question:**  
What proof level is required to accept notes attachments on re-test?

**Options:**

1. **A (recommended):** at least one real persisted note with an actual attached file, plus successful remove flow
2. **B:** UI behavior proof only
3. **C:** API proof only

**Why this must be locked:**  
The reviewer explicitly rejected assumption-based acceptance here.

---

## 3) Recommended immediate next step

Team 90 recommends:

1. Answer these questions first.
2. Lock the decisions in one architect-approved pre-remediation frame.
3. Only then issue the execution package to Team 10.

This is the cleanest way to avoid another mixed remediation loop.

---

**log_entry | TEAM_90 | S002_P003_WP002 | PRE_REMEDIATION_DECISION_QUESTIONS_ISSUED | 2026-03-01**
