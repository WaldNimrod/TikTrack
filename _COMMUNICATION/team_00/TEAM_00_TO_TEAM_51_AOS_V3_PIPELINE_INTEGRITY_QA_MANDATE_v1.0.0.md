---
**project_domain:** AGENTS_OS
**id:** TEAM_00_TO_TEAM_51_AOS_V3_PIPELINE_INTEGRITY_QA_MANDATE_v1.0.0
date: 2026-04-02
historical_record: true
**from:** Team 00 (System Designer / Principal)
**to:** Team 51 (AOS QA Agent)
**cc:** Team 100, Team 61, Team 11
**date:** 2026-03-29
**status:** ACTIVE — execute immediately, before test flight continuation
**priority:** CRITICAL — pipeline 100% integrity required before S003-P005 flight proceeds---

# Team 51 — AOS v3 Pipeline Integrity QA Mandate
## Extended E2E Browser Sweep + Pattern Audit

---

## CONTEXT — WHY THIS MANDATE EXISTS

During S003-P005 test flight preparation (2026-03-29) we discovered multiple systemic issues
in the AOS v3 UI/API layer. The most critical:

1. **Domain ID/slug mismatch** — the pipeline page sends `domain_id=tiktrack` (slug), but
   `runs.domain_id` stores ULIDs (`01JK8AOSV3DOMAIN00000002`). Every `/api/state` call
   returned IDLE even with an active run. Fixed in `repository.py:resolve_domain_id()`.

2. **Portfolio ↔ Pipeline inconsistency** — portfolio showed ACTIVE packages; pipeline showed
   IDLE for both domains simultaneously. Root cause: different data paths, same underlying bug.

3. **WP status data integrity** — seeded WPs had wrong statuses (`S001-P002` seeded ACTIVE
   instead of COMPLETE). Test artifact WPs from pytest left in ACTIVE state in production DB.

4. **Start Run button not wired** — clicking triggered confirm dialog but no API call was made.
   Silent failure with no error feedback to user.

These bugs share a pattern: **UI-to-API contract mismatches** where external inputs (slugs,
display values) are passed directly to DB queries expecting internal IDs (ULIDs). Before
continuing the test flight, Team 51 must audit the full system for this and similar patterns.

---

## MANDATORY CONTEXT READS (before starting)

| # | Document | Purpose |
|---|---|---|
| 1 | `agents_os_v3/modules/state/repository.py` | `resolve_domain_id()` fix — understand the pattern |
| 2 | `agents_os_v3/modules/management/portfolio.py` | Portfolio API — domain_slug join pattern |
| 3 | `agents_os_v3/modules/management/api.py` | All API endpoints and their parameter contracts |
| 4 | `agents_os_v3/ui/app.js` | UI domain selector, filter logic, all API calls |
| 5 | `agents_os_v3/ui/index.html` | Pipeline page structure and domain buttons |
| 6 | `agents_os_v3/ui/portfolio.html` | Portfolio page structure and domain filter |
| 7 | `agents_os_v3/ui/history.html` | History page structure |

**Server:** `http://127.0.0.1:8090/`
**DB:** `AOS_V3_DB` — connection string in `agents_os_v3/.env`
**Actor header:** always include `X-Actor-Team-Id: team_00` in API calls

---

## SCOPE — 5 TEST SUITES

---

### SUITE A — Domain Resolution: Full System Audit

This is the highest priority suite. The slug/ULID mismatch was found in `repository.py` and
`use_cases.py`. Team 51 must determine if the same pattern exists elsewhere.

**A-1. API endpoint audit — every endpoint that accepts `domain_id`:**

For each endpoint below, test with BOTH slug AND ULID. Both must return identical results.

| Endpoint | Test slug | Test ULID |
|---|---|---|
| `GET /api/state?domain_id=X` | `tiktrack`, `agents_os` | `01JK8AOSV3DOMAIN00000002`, `01JK8AOSV3DOMAIN00000001` |
| `GET /api/runs?domain_id=X` (if exists) | same | same |
| `GET /api/work-packages?domain_id=X` (if exists) | same | same |
| `GET /api/history?domain_id=X` (if exists) | same | same |
| `POST /api/runs` body `domain_id` field | slug | ULID |
| Any other endpoint accepting domain_id | same | same |

**Expected:** slug and ULID return identical response body (status, run_id, counts).
**FAIL condition:** any endpoint returns different results for slug vs ULID.

**A-2. UI domain filter — sidebar panel on ALL pages:**

Test pages: Pipeline (`/`), Portfolio (`/v3/portfolio.html`), History (`/v3/history.html`),
Configuration (`/v3/config.html`), System Map (`/v3/flow.html`), Teams (`/v3/teams.html`).

For each page with a domain selector:
- What value does the selector send to the API? (inspect network tab)
- Is it slug or ULID?
- After switching domain, does the displayed data actually filter to the correct domain?
- Does the URL/localStorage reflect the correct domain?

**A-3. Cross-page domain consistency:**

With S003-P005 run active (tiktrack domain, IN_PROGRESS):
1. Pipeline page → TikTrack domain: must show IN_PROGRESS with run_id and WP details
2. Portfolio → Active Runs tab → All domains: must show S003-P005 run
3. Portfolio → Active Runs tab → filter "tiktrack": must show same run, not disappear
4. History page: must show events for the active run
5. Switch each page to "Agents OS" domain: must show IDLE (no active run)

Record: what each page shows, what API call it makes, what the response is.

**A-4. Code scan — search for direct domain_id queries without resolver:**

Search `agents_os_v3/modules/` for any `WHERE domain_id = %s` or `WHERE domain_id =` that
does NOT call `resolve_domain_id` first. List every occurrence with file path and line number.

---

### SUITE B — Pipeline Page E2E: Active Run Display

**B-1. Active run metadata display:**

With S003-P005 run active, open Pipeline page → select TikTrack domain. Verify ALL fields:
- `run_id` — populated, not "—"
- `work_package_id` — shows "S003-P005"
- `domain_id` — populated
- `process_variant` — populated
- `current_gate_id` — shows "GATE_0"
- `current_phase_id` — populated
- `correction_cycle_count` — shows "0"
- `started_at` — shows timestamp
- `last_updated` — populated
- Actor section — populated
- Sentinel section — populated
- Gate map — GATE_0 highlighted
- Run log — shows INITIATE event

**B-2. IDLE state display:**

Switch to Agents OS domain (no active run). Verify:
- Empty state element shows ("No active run")
- All metadata fields show "—" or empty
- No stale data from previous domain bleeds through
- Activate form appears (work package dropdown)

**B-3. Domain switch while run active:**

With tiktrack run active:
1. Start on TikTrack domain — see run
2. Switch to Agents OS — see IDLE
3. Switch back to TikTrack — see same run again (no reload required)
4. Verify no ghost data from Agents OS remains

---

### SUITE C — Portfolio Page E2E: All Tabs

**C-1. Active Runs tab:**

With S003-P005 run active:
- Row shows: run_id (suffix), domain pill, work_package label **AND** wp_id (as sub-line), program, status badge, gate pill, corrections, started_at, actor
- wp_id sub-line: verify it shows full ID (not "—")
- Domain filter "tiktrack": only tiktrack runs visible
- Domain filter "agents_os": empty table
- Domain filter "All domains": all runs visible

**C-2. Work Packages tab:**

- Grouped by milestone (S001, S002, S003, S004, S005, S006, Other)
- S001-P002: status COMPLETE → button shows "View History"
- S002-P002, S002-P003, S003-P003: status COMPLETE → "View History"
- S003-P005: status ACTIVE (run in progress) → button shows "View Run" (disabled) OR "Start Run" disabled because domain has active run
- All other TikTrack programs: status PLANNED
- No pytest artifact WPs visible with status ACTIVE
- "Other / No Milestone" section: contains bootstrap WP + closed pytest WPs (COMPLETE)
- Domain filter "tiktrack": only tiktrack WPs visible (all milestone groups)
- Domain filter "agents_os": only AOS WPs visible (bootstrap in Other group)

**C-3. Start Run flow:**

With NO active tiktrack run:
1. Find S003-P004 (PLANNED) — Start Run button enabled
2. Click Start Run → confirm dialog appears
3. Confirm → POST /api/runs fires (verify in network tab)
4. Response 201 → page refreshes → Active Runs tab shows new run
5. Work Packages tab → S003-P004 now shows ACTIVE / "View Run"
6. Pipeline page TikTrack → shows the new run

Then stop the run (via Stop Run on pipeline page or API) and verify:
7. Active Runs tab empties
8. Work Packages tab → S003-P004 returns to appropriate status

**C-4. Completed Runs tab:**

- Shows historically completed runs
- Each row shows: run_id, domain, work_package (label + ID sub-line), gate completed, corrections, started_at, completed_at

**C-5. Ideas Pipeline tab:**

- Shows all 20 seeded ideas
- 13 tiktrack ideas (status: NEW) + 7 AOS ideas (status: DEFERRED)
- Domain filter works correctly
- AOS ideas show [V2_LEGACY] prefix visible in decision_notes (click Edit to verify)

---

### SUITE D — Cross-Interface Consistency Matrix

This suite verifies that all 3 views of the same data agree at all times.

**D-1. Consistency check — run states:**

State: S003-P005 run IN_PROGRESS at GATE_0

| Interface | Expected | Actual | PASS/FAIL |
|---|---|---|---|
| `GET /api/state?domain_id=tiktrack` | `status: IN_PROGRESS, work_package_id: S003-P005` | | |
| `GET /api/state?domain_id=01JK8AOSV3DOMAIN00000002` | same as above | | |
| `GET /api/runs?status=IN_PROGRESS,CORRECTION,PAUSED` | 1 run, tiktrack domain | | |
| Pipeline page (TikTrack domain) | IN_PROGRESS, GATE_0, S003-P005 | | |
| Portfolio Active Runs tab | 1 row, S003-P005, IN_PROGRESS | | |
| Portfolio Work Packages tab | S003-P005 row shows ACTIVE | | |
| History page | events for active run visible | | |

**D-2. Consistency check — after run completes:**

(Advance run through GATE_0 PASS or stop it)

| Interface | Expected | Actual | PASS/FAIL |
|---|---|---|---|
| `GET /api/state?domain_id=tiktrack` | `status: IDLE` | | |
| Pipeline page (TikTrack domain) | IDLE empty state | | |
| Portfolio Active Runs tab | 0 rows (tiktrack) | | |
| Portfolio Completed Runs tab | +1 run | | |
| Portfolio Work Packages tab | S003-P005 status updated | | |

**D-3. Consistency check — domain filter consistency:**

For every page with a domain filter sidebar: switching between "All domains", "TikTrack",
"Agents OS" must produce consistent counts. Total(All) = Count(TikTrack) + Count(AOS).
Verify this arithmetic holds on: Active Runs, Completed Runs, Work Packages, Ideas Pipeline.

---

### SUITE E — Pattern Hunt: Similar Bugs Elsewhere

Search for the same class of bug in broader scope.

**E-1. ID vs slug in all DB queries:**

Scan all Python files in `agents_os_v3/modules/` for:
- `WHERE.*= %s` queries on foreign key columns (domain_id, team_id, role_id, etc.)
- Any parameter that could arrive as a human-readable name/slug rather than ULID
- Queries that skip `resolve_domain_id` or equivalent resolver

**E-2. API parameter validation:**

For each endpoint that accepts ID-type parameters (`domain_id`, `run_id`, `wp_id`, `team_id`):
- What happens when you send an invalid value (e.g., `domain_id=INVALID`)?
- Is the error message clear and structured (not 500 Internal Server Error)?
- Is there a resolver/validator, or does the raw value go directly to SQL?

**E-3. WP status lifecycle integrity:**

Query DB directly: are there any work_packages where `status = 'ACTIVE'` but no corresponding
`runs` row with `status IN ('IN_PROGRESS', 'CORRECTION', 'PAUSED')` for that WP?

```sql
SELECT w.id, w.label, w.status, w.linked_run_id
FROM work_packages w
WHERE w.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM runs r
    WHERE r.work_package_id = w.id
      AND r.status IN ('IN_PROGRESS', 'CORRECTION', 'PAUSED')
  );
```

Expected: 0 rows. Any result = orphaned ACTIVE WP = data integrity bug.

**E-4. Silent failures in UI:**

Test each action button in the UI (Start Run, Stop Run, Advance, Fail, Pause, Resume, Approve,
Override). For each:
- Does the button show a loading state while the API call is in flight?
- If the API returns an error, does the user see a clear error message (toast, alert)?
- Or does it fail silently (no feedback)?

List all buttons that fail silently on API error.

---

## DELIVERABLE — QA REPORT FORMAT

Return as: `TEAM_51_AOS_V3_PIPELINE_INTEGRITY_QA_REPORT_v1.0.0.md`
Place in: `_COMMUNICATION/team_00/`

### Required sections:

```
## SUMMARY
- Total checks: N
- PASS: N
- FAIL: N
- WARN: N (works but fragile / incomplete)
- BLOCKER count: N (must fix before flight continues)

## SUITE A — Domain Resolution Results
[Table: endpoint × (slug|ULID) × result × PASS/FAIL]
[List: any SQL queries found without resolver]

## SUITE B — Pipeline Page Results
[Checklist with PASS/FAIL per field]
[Screenshots or DOM evidence for each state]

## SUITE C — Portfolio Page Results
[Tab-by-tab checklist]
[Specific values observed vs expected]

## SUITE D — Cross-Interface Matrix
[Completed consistency matrix tables]
[Timestamp: when state was checked]

## SUITE E — Pattern Hunt Results
[List of similar bugs found with: file, line, description, severity]
[WP orphan query result]
[Silent failure inventory]

## BLOCKERS (must fix before flight)
[Ordered list: BLK-001, BLK-002... each with file/line/description/proposed fix]

## WARNINGS (should fix soon)
[Ordered list: WARN-001... each with description/risk]

## RECOMMENDED FIX ORDER
[Prioritized list for rapid fix cycle]
```

---

## ACCEPTANCE CRITERIA FOR THIS MANDATE

This mandate is COMPLETE when:

| # | Criterion |
|---|---|
| AC-1 | All 5 suites executed and documented |
| AC-2 | Domain resolution tested with BOTH slug AND ULID on every endpoint |
| AC-3 | Cross-interface consistency matrix fully populated |
| AC-4 | Pattern hunt completed — all similar bugs enumerated |
| AC-5 | BLOCKER list returned with file + line + proposed fix for each |
| AC-6 | No "I couldn't check X" without documented reason |

---

## IRON RULES FOR THIS QA SESSION

1. **Real browser, real server** — all UI checks must be done against `http://127.0.0.1:8090/` with server running. No mock mode.
2. **Network evidence** — for any API check, record the exact URL sent and response received.
3. **DB evidence** — for data integrity checks, run the SQL and include output.
4. **No assumptions** — if a check passes visually but you didn't verify the API call, mark it WARN not PASS.
5. **Fail loudly** — a silent failure is worse than a visible error. Mark silent failures as BLOCKER.

---

**log_entry | TEAM_00 | MANDATE_ISSUED | TEAM_51_AOS_V3_PIPELINE_INTEGRITY_QA | 2026-03-29**
