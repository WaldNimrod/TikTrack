# Team 90 -> Nimrod | Pre-Remediation Decision Questions — S002-P003-WP002 (v1.1.0)
**project_domain:** TIKTRACK

**id:** TEAM_90_TO_NIMROD_S002_P003_WP002_PRE_REMEDIATION_DECISION_QUESTIONS_v1.1.0  
**from:** Team 90 (External Validation Unit)  
**to:** Nimrod, Team 00, Team 100  
**cc:** Team 10  
**date:** 2026-03-03  
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

---

## 2) Questions requiring decision

### Q1 — Canonical owner of system ticker creation
**Recommended:** One canonical backend create-system-ticker flow, used by both D22 and `/me/tickers`.

### Q2 — Scope of the current remediation regarding D33 / "My Tickers"
**Recommended:** Include D33 wherever it is directly coupled to the rejected flow.

### Q3 — Valid linked target model for notes and alerts
**Recommended:** Every alert/note must link to either a specific concrete record or a specific datetime (date + time).

### Q4 — `general` linkage state
**Recommended:** Remove `general` as a valid business target.

### Q5 — D34 alert condition-builder model
**Recommended:** Lock the richer model now (not a placeholder), with TradingView-style benchmark used as the comparison baseline.

### Q6 — D34 alert lifecycle/status baseline
**Recommended minimum:** `active`, `cancelled`, `triggered_unread`, `triggered_read_closed`, `rearmed`.

### Q7 — Cross-entity UI consistency scope
**Recommended:** Enforce the standard across current existing entity pages now.

### Q8 — Attachments proof standard for D35
**Recommended:** At least one real persisted note with an actual attached file, plus successful remove flow.

### Q9 — Auth/session expiry behavior

**Question:** What is the canonical UX behavior when the 24-hour access token expires?

**Options:**

1. **A (recommended):** The user is considered logged out immediately when the access token expires. Clear active auth state, return to login, preserve only `usernameOrEmail` (if remember-me is enabled).
2. **B:** Keep the current silent-refresh-first behavior and only surface logout if refresh fails on first protected request.
3. **C:** Force immediate token-validity check on app boot but still allow silent refresh in the background.

**Why this must be locked:**  
The current behavior creates a misleading "still logged in" UI state that does not match the intended user experience.

### Q10 — Remembered identity scope on login screen

**Question:** What exactly may be remembered after forced re-login due to token expiry?

**Options:**

1. **A (recommended):** Remember only `usernameOrEmail`.
2. **B:** Remember full last login form state.
3. **C:** Remember nothing.

**Why this must be locked:**  
This affects local storage policy, UX expectations, and auth implementation boundaries.

---

## 3) Recommended immediate next step

1. Lock these decisions.
2. Approve one architect-grade remediation frame.
3. Only then issue the execution package to Team 10.

---

**log_entry | TEAM_90 | S002_P003_WP002 | PRE_REMEDIATION_DECISION_QUESTIONS_ISSUED_v1_1_0 | 2026-03-03**
