---
id: ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD
owner: Chief Architect (Team 00)
status: LOCKED - MANDATORY
decision_type: DIRECTIVE
context: TikTrack QA Protocol Standard — Max Automation, Min Token Cost, Reusable Scripts, Structured Bug Reporting
sv: 1.0.0
doc_schema_version: 1.0
effective_date: 2026-02-26
last_updated: 2026-02-26
supersedes: N/A
related:
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_FAV_PROTOCOL.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_TEST_INFRASTRUCTURE.md
  - _COMMUNICATION/team_50/TEAM_50_QA_REPORT_FORMAT_STANDARD.md
---
**project_domain:** TIKTRACK

# ARCHITECT DIRECTIVE — QA PROTOCOL STANDARD (MAX AUTOMATION, MIN TOKEN COST)

---

## 1) Context

The TikTrack QA process currently relies heavily on LLM involvement for each test run — writing,
executing, and interpreting results inline. This creates unnecessary token cost and makes QA
dependent on LLM context availability rather than being a stable, repeatable infrastructure asset.

Goal: Define a QA architecture where scripts are written once, run autonomously without LLM
involvement, and produce structured output that allows LLMs to produce accurate reports with
minimal re-reading of test execution details.

Design objectives (in priority order):
1. **High quality** — Complete coverage; no gaps; deterministic results
2. **Max automation** — Scripts self-execute without LLM supervision
3. **Min token cost** — LLM reads structured summary, not raw execution logs
4. **Fixed environment** — Consistent config via env vars; no per-session setup drift
5. **Precise reusable docs** — Scripts and reports valid for future sessions without modification
6. **Detailed bug info** — When failure occurs: enough information for fix team to act without LLM

---

## 2) Decision

All TikTrack QA (API and E2E) MUST follow this protocol from S002-P003 forward.
Team 50 is the primary executor. Team 10 activates Team 50 per standard workflow.

---

## 3) Scope

**In scope:**
- All API test scripts (bash/curl)
- All E2E test scripts (node/Selenium)
- Bug report format when tests fail
- QA report format (extends existing Team 50 format standard)
- Token cost optimization rules for LLM involvement

**Out of scope:**
- Load/performance testing
- Security penetration testing
- Agents_OS domain QA (separate process)

---

## 4) Binding Rules (MUST / MUST NOT)

### A. Script Architecture

1. MUST maintain two script types per page:
   - **API script:** `scripts/run-{page_id}-{page_slug}-qa-api.sh` — bash/curl, no dependencies beyond curl and jq
   - **E2E script:** `tests/{page_slug}-{page_id}-e2e.test.js` — node/Selenium, uses `selenium-config.js`

2. MUST use environment variables for all configuration. No hardcoded values in scripts:
   ```bash
   BACKEND_URL="${BACKEND_URL:-http://localhost:8082/api/v1}"
   FRONTEND_URL="${FRONTEND_URL:-http://localhost:8080}"
   ADMIN_USER="${ADMIN_USER:-TikTrackAdmin}"
   ADMIN_PASS="${ADMIN_PASS:-4181}"
   ```

3. MUST produce machine-readable results. API scripts: JSON summary to stdout.
   E2E scripts: structured result object logged to stdout.

4. MUST use exit codes: 0 = all PASS, 1 = one or more FAIL, 2 = environment/setup ERROR.

5. MUST NOT require manual steps during execution (no prompts, no interactive input).

6. MUST be idempotent: script can run multiple times against the same environment
   without leaving data artifacts that break subsequent runs (clean up created test data).

### B. Token Cost Optimization

7. MUST structure script output so that the final summary block contains all information
   needed for a QA report — without re-reading individual test logs.
   Required summary structure:
   ```json
   {
     "page": "D34-alerts",
     "run_date": "2026-02-26",
     "environment": { "backend": "http://localhost:8082", "frontend": "http://localhost:8080" },
     "results": {
       "ADMIN_LOGIN": "PASS",
       "POST_create": "PASS",
       "GET_list": "PASS",
       "PATCH_update": "PASS",
       "DELETE_soft": "PASS",
       "GET_after_delete_404": "PASS"
     },
     "total": { "pass": 12, "fail": 0, "skip": 0, "error": 0 },
     "status": "PASS",
     "failures": []
   }
   ```

8. LLM involvement is authorized at only two stages:
   a. **Script authoring** — writing new test scripts (one-time per page)
   b. **Failure triage** — when `failures` array is non-empty, LLM reads failure objects
      and produces fix request (see §4.D bug report format)

   LLMs MUST NOT re-execute scripts or re-read full execution logs when producing reports.
   Reports are generated from the JSON summary only.

9. MUST NOT require LLM to interpret raw curl output or Selenium trace logs.
   All interpretation logic belongs in the script itself.

### C. Test Case Structure

10. Every test case in a script MUST be self-documented with:
    ```bash
    # TC-01: POST /alerts → 201 (create new alert)
    # Precondition: Admin logged in, valid JWT in $TOKEN
    # Action: POST with valid alert payload
    # Expected: HTTP 201, body contains alert ID
    ```

11. MUST test positive cases (expected success) AND negative cases (expected failure codes).
    For every endpoint: at least one success test AND one error test (404, 422, or applicable 4xx).

12. MUST include cleanup: any test data created during the run MUST be deleted at script end.
    Exception: if deletion is itself a test step (the deletion IS the test case).

### D. Bug Report Format

13. When a test fails, the `failures` array MUST contain one object per failure in this format:
    ```json
    {
      "test_id": "TC-03",
      "test_name": "DELETE alert via UI → row removed from table",
      "step": "Click delete button → confirm dialog → confirm → wait 1s",
      "expected": "Row with data-alert-id='{id}' not present in DOM",
      "actual": "Row still present after 3s wait",
      "http_status": null,
      "api_response": null,
      "error_detail": "Element still found: By.css('[data-alert-id=\"abc\"]')",
      "affected_file_hint": "ui/src/views/data/alerts/alertsTableInit.js — handleDelete()",
      "fix_team": "Team 30",
      "priority": "CRITICAL"
    }
    ```
    For API failures:
    ```json
    {
      "test_id": "TC-08",
      "test_name": "PATCH /alerts/{id} → 200",
      "step": "curl -X PATCH /api/v1/alerts/{id} with valid payload",
      "expected": "HTTP 200, body.is_active = false",
      "actual": "HTTP 500, body: Internal Server Error",
      "http_status": 500,
      "api_response": "{\"detail\": \"column 'is_active' of relation 'alerts' does not exist\"}",
      "error_detail": "DB schema mismatch — migration may not have run",
      "affected_file_hint": "api/routers/alerts.py or migration scripts/",
      "fix_team": "Team 20",
      "priority": "CRITICAL"
    }
    ```

14. MUST set `fix_team` based on failure type:
    - HTTP 4xx/5xx on API endpoint → Team 20
    - UI element not found / wrong behavior → Team 30
    - DB migration issue → Team 20
    - Test infrastructure failure → Team 50 self-fix

15. MUST set `priority`:
    - CRITICAL: CRUD operation broken, data corruption, auth failure
    - HIGH: Business logic wrong, precision failure, error contract violated
    - MEDIUM: UI display issue, wrong label, pagination mismatch
    - LOW: Style/cosmetic issue

### E. QA Report Standards

16. QA reports produced by Team 50 MUST follow Team 50 QA Report Format Standard.
17. Reports MUST include: run_date, environment used, script hashes or version, all failure objects.
18. MUST NOT produce QA report until all scripts for the page have run and produced JSON summaries.
19. MUST include a "regression" section confirming Gate-A scripts re-ran and passed.

---

## 5) Operational Impact by Team

- **Team 10 (gateway):** Activate Team 50 with page_id + page_slug. Receive QA report.
  Forward failure objects to appropriate fix team with priority.
- **Team 50 (QA executor):** Primary owner of all scripts. Runs scripts; reads JSON summary;
  produces reports. Does NOT manually debug failures — bug report format provides fix team with
  all necessary information.
- **Team 20 / Team 30:** Receive structured failure objects. No LLM re-run needed — fix the
  identified issue, notify Team 10 for re-run.
- **Team 00:** Establishes this protocol; reviews scripts for new page types only.

---

## 6) Validation Gate

- **Gate owner:** Team 90
- **Required evidence:**
  - Script files: `scripts/run-{id}-qa-api.sh` + `tests/{slug}-{id}-e2e.test.js`
  - JSON summary output from last run (PASS status)
  - QA report in Team 50 format
- **PASS criteria:**
  - Scripts exist and are runnable (exit 0)
  - JSON summary: `status: PASS`, `failures: []`
  - QA report signed by Team 50
- **BLOCK conditions:**
  - Scripts contain hardcoded credentials or URLs (violates env var rule)
  - Scripts require manual interaction during run
  - Failure objects missing required fields (fix team cannot act)

---

## 8) References

- Test Infrastructure: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_TEST_INFRASTRUCTURE.md`
- FAV Protocol: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_FAV_PROTOCOL.md`
- Existing QA scripts (patterns): `scripts/run-alerts-d34-qa-api.sh`, `scripts/run-notes-d35-qa-api.sh`
- Existing E2E patterns: `tests/alerts-mb3a-e2e.test.js`, `tests/notes-mb3a-e2e.test.js`
- Team 50 QA Format: `_COMMUNICATION/team_50/TEAM_50_QA_REPORT_FORMAT_STANDARD.md`
- Selenium config: `tests/selenium-config.js`

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD | LOCKED | 2026-02-26**
