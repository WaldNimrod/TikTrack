# TEAM_90_S002_P003_WP002_PRE_REMEDIATION_IMPACT_MAP_v1.1.0
**project_domain:** TIKTRACK

**id:** TEAM_90_S002_P003_WP002_PRE_REMEDIATION_IMPACT_MAP_v1.1.0  
**from:** Team 90 (External Validation Unit)  
**to:** Nimrod, Team 00, Team 100  
**cc:** Team 10  
**date:** 2026-03-03  
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

Required order:

1. Team 90 maps impact and remediation domains.
2. Decision questions are raised to Nimrod / architecture authority.
3. An architect-approved remediation frame is locked.
4. Only then Team 10 receives an execution package.

---

## 2) Change domains requiring structured preparation

### Domain A — Ticker catalog vs "My Tickers" architecture

Current model is split incorrectly between system ticker creation and user-layer add flow.

**Required target:** one canonical system-ticker creation path + one user-link path.

**Recommended implementation:** one shared backend create-system-ticker flow used by both D22 and `/me/tickers`, with `/me/tickers` behaving as lookup -> link, or create-via-canonical -> link.

### Domain B — Cross-entity interaction standardization

The review exposed system-wide inconsistency in add buttons, action menus, details modules, modal behavior, and copy.

**Required target:** full consistency across current active entities before expansion.

### Domain C — Alerts semantic model

D34 remains under-modeled in core business semantics:
1. linked target must be concrete
2. condition builder must be real
3. lifecycle/state model must be operational

**Required target:** semantic lock before code.

### Domain D — Notes semantic alignment

D35 must inherit all structurally overlapping corrections from D34 where the data model overlaps.

**Required target:** same linkage rules, same validation expectations, same proof standard for meaningful CRUD.

### Domain E — Validation and acceptance model

The next remediation cycle must prove:
- CRUD across all meaningful fields
- real attachments on persisted notes
- explicit button meaning (tooltips, discoverability)
- persistence behavior, not only visible UI controls

### Domain F — Authentication / session expiry semantics

The current implementation stores `access_token` in `localStorage` and may appear authenticated until the first protected request exposes expiry and triggers refresh/failure handling.

**Why this is high impact:**
- Human UX expectation is different from current technical behavior.
- Security and session semantics are part of product behavior, not just implementation detail.
- This affects login flow, auth guard behavior, token refresh strategy, logout semantics, and remembered identity UX.

**Required target:**
After access-token expiry (24h), the user is considered effectively logged out and is returned to the login screen. The system may remember the username only; it must not silently preserve an apparently valid active session in the UI.

**Implementation options:**

1. **Option A — strict UX logout on access-token expiry (recommended)**
   - On expired access token, clear active auth state immediately.
   - Redirect to login.
   - Preserve only `usernameOrEmail` (if remember-me is enabled).
   - Do not silently keep user on protected screens as "still logged in".
   - **Pros:** matches product expectation exactly; removes ambiguous half-authenticated state.
   - **Cons:** changes current refresh behavior and may require coordinated frontend/backend adjustment.

2. **Option B — keep silent refresh as primary behavior**
   - Preserve current flow: expired access token only discovered on protected request; refresh attempts to recover session.
   - **Pros:** fewer code changes.
   - **Cons:** explicitly conflicts with current desired UX.

3. **Option C — keep silent refresh but force immediate auth-state verification on app load**
   - UI checks token freshness on boot and kicks to login if expired.
   - Background refresh may still exist behind the scenes in some paths.
   - **Pros:** reduces misleading UI state.
   - **Cons:** still more complex and less explicit than Option A.

**Recommended:** Option A.

---

## 3) Proposed remediation framing (before Team 10 execution)

Team 90 recommends four controlled sub-streams:

1. **Stream 1 — Canonical data-flow corrections**
   - ticker creation unification
   - user_tickers link semantics
   - notes/alerts concrete linkage

2. **Stream 2 — Product semantic lock**
   - alert condition builder
   - alert lifecycle statuses
   - notes target constraints

3. **Stream 3 — UX/system consistency**
   - add-button standard
   - details modules
   - tooltips
   - modal design baseline
   - copy consistency

4. **Stream 4 — Auth/session behavior alignment**
   - token expiry handling
   - remembered username behavior
   - auth-guard redirect rule
   - explicit logged-out state after expiry

---

## 4) Output required before Team 10 activation

Before Team 10 is reactivated, the following should exist:

1. Decision answers for the open questions.
2. Architect confirmation for the semantic model where needed.
3. A scoped remediation package grouped by stream.
4. Clear inclusion/exclusion boundaries for this cycle.
5. Explicit auth/session behavior lock for expiry and remembered username.

Without these, Team 10 would be executing unresolved design questions instead of a stable mandate.

---

**log_entry | TEAM_90 | S002_P003_WP002 | PRE_REMEDIATION_IMPACT_MAP_READY_v1_1_0 | 2026-03-03**
