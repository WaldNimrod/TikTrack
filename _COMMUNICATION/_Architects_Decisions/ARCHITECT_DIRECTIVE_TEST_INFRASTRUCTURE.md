---
id: ARCHITECT_DIRECTIVE_TEST_INFRASTRUCTURE
owner: Chief Architect (Team 00)
status: LOCKED - MANDATORY
decision_type: DIRECTIVE
context: TikTrack Test Infrastructure — Environment Contract, DB Backups, Dedicated Test Users, Base Data
sv: 1.0.0
doc_schema_version: 1.0
effective_date: 2026-02-26
last_updated: 2026-02-26
supersedes: N/A
related:
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD.md
  - tests/selenium-config.js
  - scripts/db_test_clean.py
---
**project_domain:** TIKTRACK

# ARCHITECT DIRECTIVE — TEST INFRASTRUCTURE (ENVIRONMENT CONTRACT + DB SAFETY + TEST USERS)

---

## 1) Context

Three infrastructure gaps create risk in the current QA process:

1. **Environment drift:** Test scripts assume specific ports and credentials but these are sometimes
   changed between sessions, causing false failures and wasted debugging effort.

2. **DB safety:** Test runs that create/modify data on the development database can corrupt base data
   or leave artifacts that break subsequent tests. No DB backup procedure exists before test runs.

3. **Test user isolation:** All current tests use TikTrackAdmin (the main admin account).
   This creates coupling between test runs and production admin state, and prevents testing
   role-based access control scenarios.

---

## 2) Decision

A formal test infrastructure contract is established, defining:
- Fixed environment configuration
- Mandatory DB backup before any write-capable test run
- Dedicated test users (separate from main admin)
- Base data setup script for test dependencies

---

## 3) Scope

**In scope:**
- All TikTrack QA environments (development, local CI)
- API test scripts and E2E test scripts
- DB backup procedure for all write-capable test runs

**Out of scope:**
- Production environment (this directive covers dev/test only)
- Agents_OS domain testing
- CI/CD pipeline configuration (separate infrastructure team scope)

---

## 4) Binding Rules (MUST / MUST NOT)

### A. Environment Contract (Fixed Configuration)

1. MUST use the following as canonical test environment defaults:
   ```
   BACKEND_URL=http://localhost:8082/api/v1
   FRONTEND_URL=http://localhost:8080
   ADMIN_USER=TikTrackAdmin
   ADMIN_PASS=4181
   TEST_ADMIN_USER=TikTrackTest_Admin
   TEST_ADMIN_PASS=TestAdmin_4181
   TEST_USER=TikTrackTest_User
   TEST_USER_PASS=TestUser_4181
   DB_NAME=tiktrack
   DB_BACKUP_DIR=scripts/backups/
   ```

2. MUST document any deviation from these defaults in the test run's QA report.

3. MUST NOT run E2E tests against any environment where backend or frontend is not responding.
   Scripts MUST include a health check at start:
   ```bash
   # Health check
   HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" 2>/dev/null || echo "000")
   if [ "$HEALTH" != "200" ]; then
     echo '{"status":"ERROR","error":"Backend not responding"}'; exit 2
   fi
   ```

### B. DB Backup Mandate

4. MUST perform a DB backup before any test run that creates, modifies, or deletes data.
   Backup command:
   ```bash
   pg_dump tiktrack > scripts/backups/pre_test_$(date +%Y%m%d_%H%M%S).sql
   ```

5. MUST store backup in `scripts/backups/` with timestamp filename format:
   `pre_test_{YYYYMMDD}_{HHMMSS}.sql`

6. MUST log the backup filename in the test run's JSON summary output:
   ```json
   "db_backup": "scripts/backups/pre_test_20260226_143021.sql"
   ```

7. Read-only test runs (GET-only, no POST/PATCH/DELETE) are exempt from backup requirement.

8. MUST NOT run write-capable tests without first confirming backup completed successfully
   (non-zero file size check).

9. MUST retain backups for minimum 7 days. Backups older than 30 days MAY be deleted.

### C. Dedicated Test Users

10. MUST create and maintain two dedicated test users:
    - **TikTrackTest_Admin** — admin role, used for admin-only endpoint testing
    - **TikTrackTest_User** — regular user role, used for role-based access control testing

11. MUST NOT use TikTrackAdmin (main admin) as the primary test user in new test scripts
    written from S002-P003 forward. TikTrackAdmin may be used only for:
    a. Legacy scripts already using it (existing Gate-A scripts are grandfathered)
    b. Scenarios that specifically require the canonical admin account identity

12. Test user setup MUST be performed by a one-time setup script:
    `scripts/setup-test-users.sh` (Team 50 or Team 20 to create if not yet existing)

13. MUST document test user setup as a prerequisite in all QA reports produced from S002-P003 forward.

### D. Base Data Setup

14. MUST maintain a base data setup script: `scripts/setup-base-test-data.sh` that ensures
    minimum required test data exists before test runs:
    - At least 2 active tickers (e.g., AAPL, TSLA) for tickers-dependent tests
    - At least 1 active trading account for account-dependent tests
    - Test user assignments (test_admin added to relevant accounts if needed)

15. MUST run base data setup as a pre-flight step if the test script requires reference data.
    Pre-flight check format in scripts:
    ```bash
    # Pre-flight: verify base data
    TICKER_COUNT=$(curl -s -H "Authorization: Bearer $TOKEN" "$BACKEND_URL/tickers/summary" | jq '.total_tickers // 0')
    if [ "$TICKER_COUNT" -lt 1 ]; then
      echo '{"status":"ERROR","error":"No tickers in DB — run scripts/setup-base-test-data.sh first"}'; exit 2
    fi
    ```

16. MUST NOT rely on production data for test assertions (e.g., asserting a specific known
    ticker exists or has specific values). Tests MUST create their own test data or assert
    on structure/existence only.

### E. Cleanup

17. MUST clean up all test data created during a run at the end of the script.
    Use `data-test=true` or a naming convention (e.g., prefix `_TEST_`) to identify test records.

18. IF a test run fails mid-way and cleanup does not execute, the next run MUST handle
    pre-existing test data gracefully (skip creation if record already exists, or delete and recreate).

---

## 5) Operational Impact by Team

- **Team 50 (QA executor):** Primary owner of test infrastructure compliance.
  Creates test users, base data setup script, backup procedure.
  Runs backup before every write-capable test run.

- **Team 20 (backend):** Creates `TikTrackTest_Admin` and `TikTrackTest_User` accounts
  if not already existing (one-time setup). Provides schema info for backup procedure if needed.

- **Team 10 (gateway):** Verifies infrastructure prerequisites are met before activating Team 50.
  Receives QA reports that include `db_backup` field confirmation.

- **Team 90 (validation):** Verifies backup field present in QA report JSON before sign-off.

---

## 6) Validation Gate

- **Gate owner:** Team 90
- **Required evidence:**
  - QA report JSON includes `db_backup` field with valid filename
  - Test scripts use env vars (not hardcoded credentials)
  - Test scripts reference TikTrackTest_Admin or TikTrackTest_User (not TikTrackAdmin) for new tests
- **PASS criteria:**
  - DB backup performed and confirmed before write-capable run
  - Test users exist and were used as primary test credentials
  - All test data cleaned up at end of run
- **BLOCK conditions:**
  - Write-capable test run without DB backup
  - Hardcoded credentials in scripts
  - TikTrackAdmin used as primary test user in new scripts (S002-P003+)

---

## 8) References

- QA Protocol Standard: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD.md`
- Existing backup examples: `scripts/backups/` (existing backup files)
- Existing cleanup script: `scripts/db_test_clean.py`
- Selenium config: `tests/selenium-config.js` (TEST_USERS reference)
- Existing scripts using TikTrackAdmin: `scripts/run-alerts-d34-qa-api.sh`, `scripts/run-notes-d35-qa-api.sh`
  (grandfathered — these use TikTrackAdmin; new scripts from S002-P003+ must use test users)

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_TEST_INFRASTRUCTURE | LOCKED | 2026-02-26**
