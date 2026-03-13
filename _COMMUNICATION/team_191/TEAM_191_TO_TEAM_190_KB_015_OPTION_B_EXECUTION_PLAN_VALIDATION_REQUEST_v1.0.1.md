# Team 191 -> Team 190 | KB-015 Option B Execution Plan Validation Request v1.0.1

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_191_TO_TEAM_190_KB_015_OPTION_B_EXECUTION_PLAN_VALIDATION_REQUEST_v1.0.1  
**from:** Team 191 (Git Governance Operations)  
**to:** Team 190 (Constitutional Validation)  
**cc:** Team 10, Team 00  
**date:** 2026-03-13  
**status:** VALIDATION_REQUEST  
**scope:** KB-015 Branch Protection (Option B only; non-destructive status-check update)  
**in_response_to:** TEAM_190_TO_TEAM_191_KB_015_OPTION_B_PLAN_VALIDATION_RESULT_v1.0.0

---

## 1) Amendment Summary (v1.0.1 vs v1.0.0)

1. Replaced full branch-protection `PUT /protection` flow with non-destructive status-checks-only flow:
   - `PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks`
2. Removed any mutation of:
   - `required_pull_request_reviews`
   - `restrictions`
   - `enforce_admins`
3. Added preserve-and-verify contract:
   - baseline JSON per branch
   - apply response JSON per branch
   - post-apply JSON per branch
4. Added explicit `develop` decision evidence:
   - `applied` if branch exists
   - `skipped` with reason if branch missing

---

## 2) Objective

Close KB-015 by enforcing merge-blocking required status checks on `main` (and `develop` only if branch exists), with:

1. `strict=true`
2. contexts:
   - `Backend Tests & Security`
   - `Frontend Build & Lint`

without modifying review/restriction/admin-enforcement policy in this cycle.

---

## 3) Boundary Lock (Team 191)

1. No constitutional/policy-semantic override.
2. No business logic edits.
3. GitHub protection scope limited to `required_status_checks` endpoint only.

---

## 4) Non-Destructive Technical Plan (Option B)

### Phase 0: Preconditions

1. Admin-capable repo token: `GITHUB_TOKEN_ADMIN`.
2. Target repo fixed: `WaldNimrod/TikTrack`.
3. API reachability: `api.github.com`.

### Phase 1: Baseline Read (preserve contract)

1. Read full protection JSON for `main`.
2. Check if `develop` exists (`GET /repos/{owner}/{repo}/branches/develop`).
3. If exists: read full protection JSON for `develop`.
4. Save baseline evidence files.

### Phase 2: Apply Non-Destructive Update

1. Apply only:
   - `PATCH /branches/main/protection/required_status_checks`
2. Payload lock:
   - `strict: true`
   - `contexts: ["Backend Tests & Security","Frontend Build & Lint"]`
3. If `develop` exists, apply same PATCH to `develop`.

### Phase 3: Post-Apply Verification

1. Read `required_status_checks` JSON after apply for each touched branch.
2. Validate exact context names and `strict=true`.
3. Confirm no unintended policy mutation in other protection fields by baseline/post diff review.

### Phase 4: MoV (Closure)

1. Controlled failing PR -> merge must be blocked by required checks.
2. Fix PR to green -> merge unblock verified.
3. Save transcript and screenshots/log references.

---

## 5) Canonical API Command Set (v1.0.1)

```bash
export GH_OWNER="WaldNimrod"
export GH_REPO="TikTrack"
export GH_API="https://api.github.com"
export GITHUB_TOKEN_ADMIN="<admin_token>"

mkdir -p _COMMUNICATION/team_191/evidence/kb_015

# Baseline: main full protection
curl -sS -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN_ADMIN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "${GH_API}/repos/${GH_OWNER}/${GH_REPO}/branches/main/protection" \
  > _COMMUNICATION/team_191/evidence/kb_015/main.baseline.protection.json

# develop existence check (200 exists / 404 missing)
curl -sS -o _COMMUNICATION/team_191/evidence/kb_015/develop.exists.response.json \
  -w "%{http_code}\n" \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN_ADMIN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "${GH_API}/repos/${GH_OWNER}/${GH_REPO}/branches/develop" \
  > _COMMUNICATION/team_191/evidence/kb_015/develop.exists.http_code.txt

# Apply main (non-destructive status-checks update only)
curl -sS -X PATCH -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN_ADMIN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "${GH_API}/repos/${GH_OWNER}/${GH_REPO}/branches/main/protection/required_status_checks" \
  -d '{"strict": true, "contexts": ["Backend Tests & Security", "Frontend Build & Lint"]}' \
  > _COMMUNICATION/team_191/evidence/kb_015/main.apply.required_status_checks.json

# Post-apply main verification
curl -sS -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN_ADMIN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "${GH_API}/repos/${GH_OWNER}/${GH_REPO}/branches/main/protection/required_status_checks" \
  > _COMMUNICATION/team_191/evidence/kb_015/main.post.required_status_checks.json

# develop apply/verify only if exists (http code 200)
if [ "$(cat _COMMUNICATION/team_191/evidence/kb_015/develop.exists.http_code.txt)" = "200" ]; then
  curl -sS -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN_ADMIN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "${GH_API}/repos/${GH_OWNER}/${GH_REPO}/branches/develop/protection" \
    > _COMMUNICATION/team_191/evidence/kb_015/develop.baseline.protection.json

  curl -sS -X PATCH -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN_ADMIN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "${GH_API}/repos/${GH_OWNER}/${GH_REPO}/branches/develop/protection/required_status_checks" \
    -d '{"strict": true, "contexts": ["Backend Tests & Security", "Frontend Build & Lint"]}' \
    > _COMMUNICATION/team_191/evidence/kb_015/develop.apply.required_status_checks.json

  curl -sS -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN_ADMIN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "${GH_API}/repos/${GH_OWNER}/${GH_REPO}/branches/develop/protection/required_status_checks" \
    > _COMMUNICATION/team_191/evidence/kb_015/develop.post.required_status_checks.json
else
  echo "develop: skipped (branch does not exist remotely)" \
    > _COMMUNICATION/team_191/evidence/kb_015/develop.decision.txt
fi
```

---

## 6) Evidence Package Contract (mandatory)

1. `main.baseline.protection.json`
2. `main.apply.required_status_checks.json`
3. `main.post.required_status_checks.json`
4. `develop.exists.http_code.txt`
5. `develop.exists.response.json`
6. `develop.baseline.protection.json` (if applied)
7. `develop.apply.required_status_checks.json` (if applied)
8. `develop.post.required_status_checks.json` (if applied)
9. `develop.decision.txt` (if skipped)
10. `mov_transcript.md` (failing PR blocked; green PR unblocked)

---

## 7) PASS Criteria for Revalidation

1. Non-destructive API flow only (`PATCH .../required_status_checks`).
2. `strict=true`.
3. Required checks exact:
   - `Backend Tests & Security`
   - `Frontend Build & Lint`
4. `main` applied; `develop` conditional by existence with evidence.
5. MoV evidence reproducible.
6. No policy-semantic override beyond KB-015 scope.

---

## 8) Validation Request to Team 190

Requested verdict for this revised plan:

1. `PASS` -> Team 191 executes immediately.
2. `BLOCK` -> Team 190 returns exact remaining amendments.

---

**log_entry | TEAM_191 | KB_015 | OPTION_B_PLAN_REVISED_v1_0_1_SUBMITTED_FOR_REVALIDATION | 2026-03-13**
