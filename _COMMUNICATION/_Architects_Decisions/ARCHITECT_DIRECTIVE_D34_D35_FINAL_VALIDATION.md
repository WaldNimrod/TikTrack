---
id: ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION
owner: Chief Architect (Team 00)
status: LOCKED - MANDATORY
decision_type: DIRECTIVE
context: Final E2E Validation — D34 (Alerts) + D35 (Notes)
sv: 1.0.0
doc_schema_version: 1.0
effective_date: 2026-02-26
last_updated: 2026-02-26
supersedes: N/A
related:
  - _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_MB3A_ALERTS_QA_REPORT.md
  - _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_MB3A_NOTES_QA_REPORT.md
  - tests/alerts-mb3a-e2e.test.js
  - tests/notes-mb3a-e2e.test.js
  - scripts/run-alerts-d34-qa-api.sh
  - scripts/run-notes-d35-qa-api.sh
---
**project_domain:** TIKTRACK

# ARCHITECT DIRECTIVE — D34 + D35 FINAL VALIDATION (Full E2E + CRUD Complete)

---

## 1) Context

D34 (Alerts / alerts.html) and D35 (Notes / notes.html) are the last implemented TikTrack pages.
Gate-A QA was completed by Team 50 on 2026-02-16. Gate-A validated the implementation phase — it is
**not** a final production-readiness validation.

The following critical gaps were identified in Gate-A coverage:

**D34 (Alerts) — gaps:**
- CREATE alert — UI form E2E: not tested ("Phase 2 בתכנון" per Team 50 recommendation §7)
- EDIT/UPDATE alert — UI form E2E: not tested
- DELETE alert — UI E2E (confirmation → removal from list): not tested
- `is_active` toggle — UI behavior verification: not tested
- Price threshold precision (NUMERIC 20,8 compliance): not tested

**D35 (Notes) — gaps:**
- DELETE note — UI E2E (Selenium): marked "optional" and not executed
- Full CRUD round-trip via UI (Create → Read → Update → Delete): incomplete
- XSS sanitization E2E (UI-rendered output verification): tested at API only

Before D34 and D35 can be declared production-ready, full coverage must be completed.

---

## 2) Decision

**Full Final Validation (FFV) is mandatory for D34 and D35.**

Team 50 must execute complete E2E automation covering all CRUD operations, all
business logic, and all precision requirements. Gate-A evidence remains valid — only
the identified gaps must be closed. No re-running of already-passing tests is required.

---

## 3) Scope

**In scope:**
- D34 (alerts.html): CREATE, EDIT, DELETE UI E2E; is_active toggle; price threshold precision
- D35 (notes.html): DELETE E2E; full CRUD round-trip; XSS sanitization E2E (UI output)
- Both pages: confirmation that previously passing tests still pass on current codebase state
- Automated execution via existing test infrastructure (Selenium + bash scripts)
- SOP-013 Seal closure for each page upon completion

**Out of scope:**
- Re-running all Gate-A tests that already passed (100%)
- Any new feature development
- Regression testing of other pages

---

## 4) Binding Rules (MUST / MUST NOT)

### D34 (Alerts) — MANDATORY additions to test suite

1. MUST add E2E test: POST alert via UI form → confirm row appears in table
2. MUST add E2E test: PATCH alert via UI edit form → confirm updated values in table
3. MUST add E2E test: DELETE alert via UI → confirm row removed from table (soft delete)
4. MUST add E2E test: `is_active` toggle via UI → verify API state change (PATCH PASS)
5. MUST add API test: price threshold value stored with correct precision (NUMERIC 20,8 — set a value with 8 decimal places, GET back and verify no rounding)
6. MUST NOT skip any of the above as "Phase 2" or "optional"

### D35 (Notes) — MANDATORY additions to test suite

1. MUST add E2E test: DELETE note via UI (confirmation dialog → confirm → row removed from table)
2. MUST add E2E test: Full CRUD round-trip — Create → Read (verify content) → Update (verify updated content) → Delete (verify removed)
3. MUST add E2E test: XSS — create note with `<script>alert('xss')</script>` content → load page → verify no script executes (DOM inspection of rendered text node)
4. MUST NOT mark DELETE E2E as optional for any future pages

### Both pages

5. MUST re-run ALL existing Gate-A scripts against current codebase (confirm no regression since 2026-02-16 fixes)
6. MUST produce updated QA reports replacing Gate-A reports (same format, updated date and results)
7. MUST attach SOP-013 Seal per page upon PASS

---

## 5) Operational Impact by Team

- **Team 10 (gateway):** Receive this directive → activate Team 50 per standard QA workflow. Issue QA request for D34 and D35 (can run in parallel).
- **Team 50 (QA executor):** Primary executor. Extend existing test files (`tests/alerts-mb3a-e2e.test.js`, `tests/notes-mb3a-e2e.test.js`). Run full suite. Produce updated reports.
- **Team 20 (backend):** On standby. If Team 50 finds any API failures, Team 20 receives fix request via Team 10.
- **Team 30 (frontend):** On standby. If Team 50 finds any UI failures, Team 30 receives fix request via Team 10.
- **Team 90 (validation):** Final GATE validation sign-off after Team 50 PASS (per standard gate flow).
- **Team 70 (documentation):** Update page documentation upon final PASS.

---

## 6) Validation Gate

- **Gate owner:** Team 90
- **Required evidence per page:**
  - Updated QA report (Team 50 format, updated date, covering all gaps above)
  - SOP-013 Seal for each page
  - Test file evidence (updated test scripts with new test cases)
- **PASS criteria:**
  - D34: All CRUD operations 100% E2E PASS; is_active toggle PASS; precision test PASS; zero regressions
  - D35: All CRUD operations 100% E2E PASS (including DELETE); XSS E2E PASS; zero regressions
- **BLOCK conditions:**
  - Any gap from §4 still marked "optional" or deferred
  - Any existing Gate-A test now failing
  - Missing SOP-013 Seal

---

## 7) Execution Order

1. Team 10 activates Team 50 for D34 and D35 (parallel activation permitted)
2. Team 50 extends test files and runs full suite
3. Team 50 issues updated QA reports + SOP-013 Seal
4. Team 90 validates → signs off
5. Team 70 updates documentation

---

## 8) References

- Gate-A Alerts: `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_MB3A_ALERTS_QA_REPORT.md`
- Gate-A Notes: `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_MB3A_NOTES_QA_REPORT.md`
- Alerts E2E: `tests/alerts-mb3a-e2e.test.js`
- Notes E2E: `tests/notes-mb3a-e2e.test.js`
- Alerts API script: `scripts/run-alerts-d34-qa-api.sh`
- Notes API script: `scripts/run-notes-d35-qa-api.sh`
- SOP-013: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md`
- QA Format Standard: `_COMMUNICATION/team_50/TEAM_50_QA_REPORT_FORMAT_STANDARD.md`

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION | LOCKED | 2026-02-26**
