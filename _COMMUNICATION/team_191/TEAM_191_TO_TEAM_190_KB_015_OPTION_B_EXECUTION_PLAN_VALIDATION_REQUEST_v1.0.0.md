# Team 191 -> Team 190 | KB-015 Option B Execution Plan Validation Request

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_191_TO_TEAM_190_KB_015_OPTION_B_EXECUTION_PLAN_VALIDATION_REQUEST_v1.0.0  
**from:** Team 191 (Git Governance Operations)  
**to:** Team 190 (Constitutional Validation)  
**cc:** Team 10, Team 00  
**date:** 2026-03-13  
**status:** VALIDATION_REQUEST  
**scope:** KB-015 Branch Protection (GitHub branch protection via API/CLI automation only)  
**in_response_to:** TEAM_10_TO_TEAM_191_KB_015_BRANCH_PROTECTION_MANDATE_v1.0.0

---

## 1) Decision Lock (Approved by requester)

1. Option A (manual settings) is skipped.
2. Execution lane is **Option B only**: scripted/API-based branch protection implementation.
3. No execution before Team 190 validation verdict.

---

## 2) Objective

Close KB-015 by enforcing merge blocking on `main` (and `develop` if exists) using required status checks:

- `Backend Tests & Security`
- `Frontend Build & Lint`

with branch up-to-date enforcement (`strict=true`).

---

## 3) Boundaries (Team 191 non-authority lock)

1. No constitutional verdict override.
2. No business logic/code semantic edits.
3. No policy-semantic override without Team 190/Team 00 ruling.
4. Scope is GitHub repository governance settings only.

---

## 4) Option B Technical Work Plan

### Phase 0: Preconditions

1. Obtain admin-capable token for repo settings (`GITHUB_TOKEN_ADMIN`).
2. Confirm repo target: `WaldNimrod/TikTrack`.
3. Confirm API reachability to `api.github.com`.

### Phase 1: Baseline Read (non-destructive)

1. Read current protection state for `main`.
2. Detect whether `develop` branch exists remotely.
3. Capture baseline JSON evidence under `_COMMUNICATION/team_191/evidence/kb_015/`.

### Phase 2: Apply Protection (authoritative write)

1. Apply/update `main` protection with:
   - `required_status_checks.strict=true`
   - `required_status_checks.contexts=["Backend Tests & Security","Frontend Build & Lint"]`
2. If `develop` exists, apply same rule set to `develop`.

### Phase 3: Post-Apply Verification

1. Re-read branch protection JSON for each protected branch.
2. Verify exact required contexts and strict mode.
3. Produce PASS/FAIL matrix.

### Phase 4: MoV Closure Test

1. Open controlled failing PR (intentional CI fail).
2. Verify merge is blocked by required checks.
3. Fix PR to green CI and confirm merge unblocks.

---

## 5) Canonical API Command Set (for execution after validation)

```bash
# Required env
export GH_OWNER="WaldNimrod"
export GH_REPO="TikTrack"
export GH_API="https://api.github.com"
export GITHUB_TOKEN_ADMIN="<admin_token>"

# Baseline read: main
curl -sS -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN_ADMIN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "${GH_API}/repos/${GH_OWNER}/${GH_REPO}/branches/main/protection"

# Apply: main
curl -sS -X PUT -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN_ADMIN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "${GH_API}/repos/${GH_OWNER}/${GH_REPO}/branches/main/protection" \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["Backend Tests & Security", "Frontend Build & Lint"]
    },
    "enforce_admins": false,
    "required_pull_request_reviews": null,
    "restrictions": null
  }'

# Optional apply: develop (only if branch exists)
curl -sS -X PUT -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN_ADMIN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "${GH_API}/repos/${GH_OWNER}/${GH_REPO}/branches/develop/protection" \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["Backend Tests & Security", "Frontend Build & Lint"]
    },
    "enforce_admins": false,
    "required_pull_request_reviews": null,
    "restrictions": null
  }'
```

---

## 6) Comparison Parameters (for Team 190 validation focus)

| Parameter | Option B Result |
|---|---|
| Scope coverage | Full mandate coverage (`main` + conditional `develop`) |
| Repeatability | High (script/API deterministic) |
| Auditability | High (JSON request/response evidence) |
| Misconfiguration risk | Lower than manual after script lock |
| Privilege dependency | Requires repo admin token/access |
| Rollback readiness | Immediate (re-apply updated payload) |

---

## 7) Risks & Mitigations

1. **Risk:** wrong status-check names.  
   **Mitigation:** lock to exact CI job names from `.github/workflows/ci.yml`.
2. **Risk:** `develop` not existing remotely.  
   **Mitigation:** conditional apply only when branch exists.
3. **Risk:** insufficient token permissions.  
   **Mitigation:** preflight read call; if 403 -> route to repo owner with exact permission requirement.
4. **Risk:** API payload incompatibility.  
   **Mitigation:** use GitHub API version header and verify response JSON before MoV.

---

## 8) Validation Request Contract (Team 190)

Requested verdict:

1. `PASS` -> Team 191 executes Option B immediately.
2. `BLOCK` -> Team 190 returns exact blocker list and required amendments.

Validation criteria requested from Team 190:

1. Plan complies with Team 191 authority boundaries.
2. Plan fully satisfies Team 10 mandate for KB-015.
3. MoV is sufficient for KB closure.
4. Evidence package schema is acceptable for Team 10 register update.

---

## 9) Planned Output After Execution (post-validation)

1. `overall_result`
2. `action_taken`
3. `checks_verified`
4. `remaining_blockers`
5. `owner_next_action`

plus evidence paths and command transcript.

---

**log_entry | TEAM_191 | KB_015 | OPTION_B_ONLY_PLAN_SUBMITTED_TO_TEAM_190_FOR_VALIDATION | 2026-03-13**
