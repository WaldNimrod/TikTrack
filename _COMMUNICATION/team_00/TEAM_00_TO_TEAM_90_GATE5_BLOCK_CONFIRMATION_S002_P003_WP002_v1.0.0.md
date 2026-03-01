# Team 00 → Team 90 | GATE_5 Block Confirmation + Error Contract Clarification — S002-P003-WP002

**id:** TEAM_00_TO_TEAM_90_GATE5_BLOCK_CONFIRMATION_S002_P003_WP002
**from:** Team 00 (Chief Architect — Nimrod)
**to:** Team 90 (External Validation Unit)
**cc:** Team 10 (Execution Orchestrator), Team 50 (QA/FAV)
**date:** 2026-03-01
**status:** ISSUED
**gate_id:** GATE_5 (rollback cycle)
**work_package_id:** S002-P003-WP002
**in_response_to:** TEAM_90_TO_TEAM_10_S002_P003_WP002_GATE5_BLOCKING_REPORT

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | TIKTRACK_ROADMAP_LOCKED |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP002 |
| task_id | N/A |
| gate_id | GATE_5 (rollback cycle) |
| phase_owner | Team 90 (validation) / Team 10 (remediation owner) |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | TIKTRACK |

---

## §1 — Block Confirmation

**Team 00 confirms: Team 90's GATE_5 block is VALID.**

Both findings (BF-G5R-001, BF-G5R-002) are architecturally correct. The rollback-cycle error contract implementation does not satisfy the GF-G6-003 remediation mandate. Team 50's implementation contains specific errors that must be fixed before GATE_5 re-validation proceeds.

This document:
1. Formally confirms each finding
2. Issues precise corrections required
3. Provides critical technical clarifications about expected HTTP response codes
4. Addresses the non-blocking observation (ND-G5R-001)

---

## §2 — BF-G5R-001 (D34): CONFIRMED VALID ✅

**Team 90's finding:** Two implementation errors in `scripts/run-alerts-d34-fav-api.sh` error contract section:
- Test 11.4 targets wrong endpoint (`/api/v1/me/tickers` instead of `/api/v1/alerts`)
- Test 11.2 tests UUID path validation (`GET /alerts/not-a-uuid`) — does not constitute "invalid input body" body validation test

**Team 00 confirms both sub-findings are correct.**

### Corrections required for D34:

| # | Test | Required | Implementation error | Correction |
|---|------|----------|----------------------|-----------|
| 11.2 | POST with invalid `condition_value` type | ✅ Required per GF-G6-003 | Currently: GET /alerts/not-a-uuid (UUID path validation) | Replace with: POST /api/v1/alerts with `condition_value: "abc"` (string instead of number) → expect **422** |
| 11.4 | POST with malformed JSON body | ✅ Required per GF-G6-003 | Currently: POST /api/v1/me/tickers (wrong endpoint entirely) | Replace with: POST /api/v1/alerts with malformed JSON → expect **422 or 400** (see §4 — FastAPI nuance) |

**Note on UUID test (11.2 current):** The UUID path-validation test (`GET /alerts/not-a-uuid`) is a valid error contract test in its own right and may be **RETAINED** in the script. However, it does **not** substitute for the required body validation test. Team 50 should add the correct test as a new numbered entry; the UUID test becomes an additional test in the set.

**Post-correction, D34 error contract section must include ≥5 tests:**
1. Missing required field (POST `{}`) → 422 ✅ (11.1 — already correct)
2. Invalid `condition_value` type (POST with string value) → 422 ✅ (corrected 11.2)
3. Unauthorized GET (no token) → 401 ✅ (11.3 — already correct)
4. Malformed JSON body to `/api/v1/alerts` → 422 or 400 ✅ (corrected 11.4)
5. UUID path validation (GET /alerts/not-a-uuid) → 422 ✅ (retained, renumbered if needed)

---

## §3 — BF-G5R-002 (D35): CONFIRMED VALID ✅

**Team 90's finding:** `tests/notes-d35-fav-e2e.test.js` implements UUID route check (`GET /notes/not-a-uuid → 422`) instead of the required "invalid content-type" test. The GF-G6-003 mandate required testing that the server rejects requests with a wrong Content-Type header.

**Team 00 confirms: finding is correct.** The UUID test does not satisfy the content-type requirement.

### Correction required for D35:

| Test | Required | Implementation error | Correction |
|------|----------|----------------------|-----------|
| POST /notes with wrong Content-Type | ✅ Required per GF-G6-003 | Currently: GET /notes/not-a-uuid | Add: POST /api/v1/notes (or equivalent endpoint) with `Content-Type: text/plain` and a plain-text body → expect **415, 422, or 400** (any 4xx — see §4) |

**Note on UUID test (current D35_NEG_422_INVALID_UUID):** As with D34, this UUID path-validation test is a **valid additional error contract test** and should be **RETAINED**. Team 50 should add the content-type test as a new entry alongside it.

**Post-correction, D35 error contract section must include ≥4 tests:**
1. Missing required field (POST `{}`) → 422 ✅ (D35_NEG_422_CREATE_INVALID — already correct)
2. UUID path validation (GET /notes/not-a-uuid) → 422 ✅ (retained)
3. Unauthorized GET (no token) → 401 ✅ (D35_NEG_401_UNAUTHORIZED — already correct)
4. Invalid Content-Type (POST with Content-Type: text/plain) → 415 or 422 or 400 ✅ (new — required)

---

## §4 — Technical Clarification: FastAPI HTTP Response Codes

**This is a mandatory clarification to Team 50 before implementation.**

Team 50 must be aware of the following FastAPI-specific behavior, which affects the exact response codes to assert:

### 4.1 — Malformed JSON body

**FastAPI behavior:** When a request body contains malformed JSON (e.g., `{invalid json`), FastAPI returns **422 Unprocessable Entity** — NOT 400 Bad Request.

This is different from some other frameworks (Flask, Express) where malformed JSON returns 400. FastAPI's Pydantic validation layer intercepts at the parse stage and emits 422.

**Assertion in D34 test 11.4:** Accept **422 OR 400** (either is valid, but expect 422 from this FastAPI server). Script assertion should be:
```bash
if [ "$STATUS" -eq 422 ] || [ "$STATUS" -eq 400 ]; then
  # PASS
fi
```

### 4.2 — Invalid Content-Type

**FastAPI behavior:** When a JSON endpoint receives a request with `Content-Type: text/plain`, FastAPI typically returns **422 Unprocessable Entity** (body parse failure) or **415 Unsupported Media Type** depending on how the endpoint is defined.

**Assertion in D35 content-type test:** Accept **any 4xx response** (415, 422, or 400). The assertion should verify status ≥ 400 AND < 500. Do not assert a specific code — any 4xx confirms the server rejects the wrong content type.

```javascript
// D35: Content-Type rejection test
expect(response.status).toBeGreaterThanOrEqual(400);
expect(response.status).toBeLessThan(500);
```

### 4.3 — Summary of expected codes by test

| Test | Assert | Notes |
|------|--------|-------|
| POST with invalid `condition_value` type | **422** | Pydantic type validation |
| POST with malformed JSON | **422 or 400** | FastAPI returns 422; accept both |
| GET without auth | **401** | Auth middleware |
| POST with missing required field | **422** | Pydantic required field |
| GET /:id with non-UUID | **422** | FastAPI path param validation |
| POST with wrong Content-Type | **415, 422, or 400** | Any 4xx acceptable |

---

## §5 — ND-G5R-001 (Team 60 Evidence Path Drift): Non-Blocking Concurrence

**Team 90's observation:** Team 60 evidence references contain path drift — file paths cited in evidence headers do not exactly match the canonical artifact paths in LLD400.

**Team 00 concurs with Team 90's non-blocking classification.**

Team 60's path drift is a documentation quality issue. The underlying artifacts are present and functionally verified. This does not require a code change or a new gate cycle.

**Required action (Team 10):** In the next documentation update, instruct Team 60 to align evidence headers with exact canonical LLD400 paths. This can be handled in the resubmission package.

---

## §6 — Summary: What Team 50 Must Do

Team 10 is the owner of this remediation. The following is the complete correction list for Team 50:

| # | Action | File | Correction |
|---|--------|------|-----------|
| 1 | Fix D34 test 11.2 | `scripts/run-alerts-d34-fav-api.sh` | Replace UUID path test with: POST /alerts with `condition_value: "abc"` → assert 422 |
| 2 | Fix D34 test 11.4 | `scripts/run-alerts-d34-fav-api.sh` | Replace wrong-endpoint test with: POST /api/v1/alerts with malformed JSON → assert 422 OR 400 |
| 3 | Retain D34 UUID test | `scripts/run-alerts-d34-fav-api.sh` | Keep GET /alerts/not-a-uuid test — valid test, renumber if needed |
| 4 | Add D35 content-type test | `tests/notes-d35-fav-e2e.test.js` | Add: POST /notes with Content-Type: text/plain → assert any 4xx (≥400, <500) |
| 5 | Retain D35 UUID test | `tests/notes-d35-fav-e2e.test.js` | Keep D35_NEG_422_INVALID_UUID — valid test |
| 6 | Re-run full D34 error contract section | `scripts/run-alerts-d34-fav-api.sh` | Confirm all tests PASS with corrected assertions |
| 7 | Re-run full D35 E2E | `tests/notes-d35-fav-e2e.test.js` | Confirm all tests PASS including new content-type test |
| 8 | Re-issue SOP-013 Seals for D34-FAV and D35-FAV | In follow-up FAV report | Required per GF-G6-002 (unresolved from GATE_6 decision) |
| 9 | Document D22 E2E runtime result | In follow-up FAV report | Required per GF-G6-001 (unresolved from GATE_6 decision) |

**After all corrections and re-runs:** Team 10 triggers GATE_4 QA re-verification → Team 90 GATE_5 re-validation → GATE_6 resubmission (8-artifact package per `ARCHITECT_DIRECTIVE_GATE6_PROCEDURE_v1.0.0.md`).

---

## §7 — Gate Sequence Reminder

Current WSM state: GATE_3 (per CODE_CHANGE_REQUIRED rollback from GATE_6 decision).

Re-entry path:
```
Team 50 implements corrections
  → Team 10: GATE_4 QA re-verification
    → Team 90: GATE_5 re-validation
      → Team 90: GATE_6 resubmission (8-artifact package)
        → Team 00: GATE_6 review
```

No gate shortcuts. Each gate must PASS before proceeding to the next.

---

**log_entry | TEAM_00 | GATE5_BLOCK_CONFIRMATION | S002_P003_WP002 | BF-G5R-001_CONFIRMED | BF-G5R-002_CONFIRMED | ND-G5R-001_NON_BLOCKING | FASAPI_CLARIFICATION_ISSUED | 2026-03-01**
