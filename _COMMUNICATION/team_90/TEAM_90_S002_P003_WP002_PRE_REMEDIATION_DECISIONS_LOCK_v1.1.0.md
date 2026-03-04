# TEAM_90_S002_P003_WP002_PRE_REMEDIATION_DECISIONS_LOCK_v1.1.0
**project_domain:** TIKTRACK

**id:** TEAM_90_S002_P003_WP002_PRE_REMEDIATION_DECISIONS_LOCK_v1.1.0  
**from:** Team 90 (External Validation Unit)  
**to:** Team 00, Team 100  
**cc:** Team 10  
**date:** 2026-03-03  
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

## 1) Scope lock

The remediation-preparation scope is a **foundation alignment package** across current active entities before expansion continues.
Primary emphasis: D22, D33, D34, D35.
No deferred structural tails by default.

---

## 2) Locked decisions

1. One canonical backend path for system ticker creation.
2. D33 is included in the current correction cycle where coupled.
3. Notes/alerts must link to either a specific record or a specific datetime (date + time).
4. `general` is not a valid linked target.
5. Alerts require a rich condition model now, with TradingView-style benchmark as architect review input.
6. Alert lifecycle uses the richer operational baseline set, expandable only if justified.
7. UI consistency alignment applies across current existing entities now.
8. Attachments require real persisted proof in re-test.
9. No deferred structural tails; baseline must be aligned before expansion.
10. Architect lock is required before Team 10 execution begins.
11. **Auth/session precision (new lock):** once the 24-hour access token expires, the user is considered effectively logged out. The application must return the user to the login screen, clear active auth state, and preserve only `usernameOrEmail` for convenience.
12. **Remembered identity scope:** only `usernameOrEmail` may be remembered locally; no silent preservation of an apparently active authenticated state after token expiry.

---

## 3) Immediate consequences

1. Team 10 remains on hold for direct execution.
2. Team 90 must submit an updated architect package reflecting the auth/session lock.
3. Only after architect approval may Team 10 receive the structured execution remediation package.

---

**log_entry | TEAM_90 | S002_P003_WP002 | PRE_REMEDIATION_DECISIONS_LOCK_v1_1_0 | 2026-03-03**
