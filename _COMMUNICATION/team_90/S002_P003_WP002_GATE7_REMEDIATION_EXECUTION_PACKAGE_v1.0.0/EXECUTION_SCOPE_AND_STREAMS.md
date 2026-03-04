# EXECUTION SCOPE AND STREAMS
**project_domain:** TIKTRACK
**id:** S002_P003_WP002_GATE7_REMEDIATION_EXECUTION_SCOPE_AND_STREAMS_v1.0.0
**from:** Team 90
**to:** Team 10
**date:** 2026-03-04
**status:** LOCKED
**work_package_id:** S002-P003-WP002

---

## Stream 1 — Canonical data-flow alignment

1. Unify system ticker creation into one canonical backend path.
2. Convert D33 to lookup + link, with create-via-canonical fallback only.
3. Remove legacy `general` linkage from alerts and migrate existing rows to `NULL`.
4. Add datetime linkage fields:
   - `alerts.target_datetime`
   - `notes.parent_datetime`
5. Add `rearmed` to accepted alert trigger-status values.

---

## Stream 2 — Semantic model completion

1. Enforce condition-builder validation: all three fields set together, or all empty.
2. Render formatted condition display in alerts table and alert details modal.
3. Render linked entity as icon + resolved entity name (not raw type / raw ID).
4. Apply D34 linkage rules to D35:
   - `datetime` target supported
   - linkage fields consistent
   - linkage type cannot be changed on edit
5. Confirm `is_active=false` renders as cancelled, while `rearmed` renders distinctly.

---

## Stream 3 — UX / system consistency

1. Standardize add buttons across D22, D33, D34, D35:
   - icon + Hebrew label
2. Add tooltips for all action controls and entity-type filters.
3. Normalize copy:
   - `ביטול`
   - `שמור`
   - `ערוך`
   - `מחק`
4. Complete alert details modal per architect-required field list.
5. Complete note details modal per architect-required field list.
6. Make linkage fields read-only in edit mode (may clear to `NULL`, may not switch type).

---

## Stream 4 — Auth / session behavior alignment

1. On app boot, detect expired JWT and force logout immediately.
2. Preserve only `usernameOrEmail` for login repopulation.
3. Allow silent refresh only in the 5-minute window before expiry.
4. On backend `401`, clear auth state and redirect immediately with no refresh attempt.
5. Do not render logged-in UI state when the access token is already expired.

---

## Non-blocking deferred item

The global top-filter cross-page unification is explicitly deferred outside this remediation cycle and must not delay the current execution package.

---

**log_entry | TEAM_90 | EXECUTION_SCOPE_AND_STREAMS | S002_P003_WP002 | LOCKED | 2026-03-04**
