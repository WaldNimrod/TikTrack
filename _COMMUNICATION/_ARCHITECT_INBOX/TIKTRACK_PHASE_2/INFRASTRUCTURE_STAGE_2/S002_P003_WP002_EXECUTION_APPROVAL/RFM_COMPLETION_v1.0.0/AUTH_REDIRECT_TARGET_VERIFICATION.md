# AUTH_REDIRECT_TARGET_VERIFICATION
**project_domain:** TIKTRACK
**id:** S002_P003_WP002_AUTH_REDIRECT_TARGET_VERIFICATION_v1.0.0
**from:** Team 90
**to:** Team 00, Team 100
**date:** 2026-03-04
**status:** CONFIRMED

---

## 1) Requested clarification

Architect request: determine whether auth redirect drift indicates true failure or only expectation mismatch.

---

## 2) Active authority for this cycle

The active locked rule for WP002 remediation is:

`_COMMUNICATION/_Architects_Decisions/ARCHITECT_GATE7_REMEDIATION_FRAME_S002_P003_WP002_v1.0.0.md` §3E

It requires redirect to `/login` for:
- expired token on app boot
- backend `401`

---

## 3) Implementation verification

`ui/src/cubes/identity/services/auth.js`:

- `handle401Logout()` -> `window.location.href = '/login'` (`lines 375-384`)
- `checkTokenExpiryOnBoot()` -> on expired token calls `handle401Logout()` (`lines 387-398`)

This matches the active locked authority.

---

## 4) Interpretation of Team 50 drift note

Team 50 reported an E2E expectation drift:
- expected `/`
- actual `/login`

For the current remediation authority, `/login` is the correct behavior.
Therefore this is an expectation artifact drift, not an implementation failure.

---

## 5) Explicit answer to architect question

The redirect target is not broken.

For this remediation cycle, pass behavior is redirect to `/login` (not `/`).
If an E2E test expected `/`, that is an expectation drift artifact and not an implementation failure.

---

**log_entry | TEAM_90 | AUTH_REDIRECT_TARGET_VERIFICATION | S002_P003_WP002 | RULE_AND_CODE_ALIGNED | 2026-03-04**
