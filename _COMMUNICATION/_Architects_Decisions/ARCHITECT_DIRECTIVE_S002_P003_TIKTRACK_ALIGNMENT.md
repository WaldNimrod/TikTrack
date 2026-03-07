---
id: ARCHITECT_DIRECTIVE_S002_P003_TIKTRACK_ALIGNMENT
owner: Chief Architect (Team 00)
status: LOCKED - MANDATORY
decision_type: DIRECTIVE
context: S002-P003 — TikTrack Alignment Work Package (D22 + D34 + D35)
sv: 1.0.0
doc_schema_version: 1.0
effective_date: 2026-02-26
last_updated: 2026-02-26
supersedes: N/A
related:
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION.md
  - documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md
  - documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md
  - api/routers/tickers.py
  - ui/src/views/management/tickers/
---
**project_domain:** TIKTRACK

# ARCHITECT DIRECTIVE — S002-P003 TIKTRACK ALIGNMENT (D22 + D34 + D35)

---

## 1) Context

Following completion of S001 (TikTrack initial implementation) and activation of S002 (Agents_OS Validation Engine),
a review of the TikTrack domain has identified three implemented pages requiring alignment before new page
development (S003+) may begin.

### D22 (ניהול טיקרים / tickers.html) — Investigation findings (2026-02-26)

Direct codebase investigation confirmed D22 is substantially implemented:

**Backend (api/routers/tickers.py) — CONFIRMED:**
- Full CRUD: GET /tickers (list + filter/search/sort/pagination), GET /tickers/summary,
  GET /tickers/{id}, POST /tickers, PUT /tickers/{id}, DELETE /tickers/{id} (soft-delete)
- Data Integrity: GET /tickers/{id}/data-integrity → EOD prices, Intraday prices,
  250d history, Indicators (ATR14, MA20/50/150/200, CCI20, MarketCap), gaps_summary
- Backfill: POST /tickers/{id}/history-backfill (mode=gap_fill | force_reload, Admin-only)
- All endpoints: require_admin_role enforced; maskedLog compliant

**Frontend (ui/src/views/management/tickers/) — CONFIRMED:**
- Summary panel: total/active tickers count
- Tickers table: 7 columns (symbol, price, daily_change_pct, company_name, type, status, actions)
  with client-side sort + pagination; Add/Edit/Delete via tooltip menu + modal
- CRUD modal: symbol (readonly in edit), company_name, ticker_type (7 types: STOCK/ETF/OPTION/FUTURE/FOREX/CRYPTO/INDEX), status (4-state: pending/active/inactive/cancelled)
- Data Integrity panel: dropdown → GET data-integrity → EOD/Intraday/History cards +
  Indicators + auto-backfill banner + force-reload (Admin-only, data complete only)

**D22 — Identified Gaps:**

| # | Gap | Type | Priority |
|---|-----|------|----------|
| 1 | No E2E test file for D22 (admin tickers management) | QA MISSING | CRITICAL |
| 2 | No API test script (`scripts/run-tickers-d22-qa-api.sh`) | QA MISSING | CRITICAL |
| 3 | No filter/search UI — backend supports filter params but frontend loads all tickers unconditionally | FEATURE GAP | HIGH |
| 4 | Client-side sort/pagination only — backend server-side params unused | FEATURE GAP | MEDIUM |

Note: `user-tickers-qa.e2e.test.js` tests D33 (user_tickers), NOT D22. D22 has zero test coverage.

### D34 (התראות / alerts.html)
Gate-A complete (API 12/12, E2E 10/10). Gaps identified in ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION.md.
All gaps are mandatory per that directive.

### D35 (הערות / notes.html)
Gate-A complete (API 10/10, E2E 12/12). Gaps identified in ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION.md.
All gaps are mandatory per that directive.

### D23 (דשבורד נתונים / data_dashboard)
Explicitly deferred per Chief Architect decision (2026-02-26). D23 is not part of S002-P003.
Target stage: TBD (S003 or beyond). No action required at this time.

---

## 2) Decision

**S002-P003: TikTrack Alignment** is activated as a formal program within Stage S002.
This program covers D22, D34, and D35 only.

All three pages must reach full production-readiness (FAV PASS + SOP-013 Seal) before
any S003 page development activates.

---

## 3) Scope

**In scope:**
- D22 (tickers.html): Filter/search UI gap + full E2E test + API test script + QA report + Seal
- D34 (alerts.html): All items from ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION.md
- D35 (notes.html): All items from ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION.md
- All three pages: Regression of all existing Gate-A tests + updated QA reports + SOP-013 Seal

**Out of scope:**
- D23 (deferred — excluded, must not be added)
- New page development (S003+)
- Backend changes unless required to fix a failing test
- Features beyond identified gaps above

---

## 4) Binding Rules (MUST / MUST NOT)

### D22 — Mandatory deliverables

1. MUST add filter/search UI to tickers table:
   - Ticker type filter (buttons or dropdown) using backend `ticker_type` param
   - Active/inactive status filter using backend `is_active` param
   - Pattern: follow D34 alerts filter bar or equivalent UX per Team 30 judgment
2. MUST create `scripts/run-tickers-d22-qa-api.sh` covering:
   - Admin Login → 200
   - GET /tickers/summary → 200
   - GET /tickers → 200 (list)
   - POST /tickers → 201 (create)
   - GET /tickers/{id} → 200
   - PUT /tickers/{id} → 200 (update)
   - DELETE /tickers/{id} → 204 (soft-delete)
   - GET /tickers/{id} after delete → 404
   - GET /tickers?ticker_type=STOCK → 200 (filter)
   - GET /tickers?is_active=true → 200 (filter)
   - GET /tickers/{id}/data-integrity → 200
   - GET /tickers/{fake_uuid} → 404
3. MUST create `tests/tickers-d22-e2e.test.js` covering:
   - Page load + summary panel (total/active counts visible)
   - LEGO structure + menu path (ניהול → ניהול טיקרים)
   - Filter bar: ticker_type filter functions (table updates)
   - CREATE ticker via UI form → confirm row appears in table
   - EDIT ticker via UI form → confirm updated values in table
   - DELETE ticker via UI → confirm row removed from table
   - Data integrity panel: select ticker → integrity data displays
4. MUST produce D22 QA report (Team 50 format) upon PASS
5. MUST attach SOP-013 Seal upon PASS
6. MUST NOT add features beyond the identified gaps in §1

### D34 + D35

7. MUST execute all requirements from ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION.md
8. MUST NOT defer or mark any item from that directive as "optional"

### All three pages

9. MUST re-run all existing Gate-A scripts against current codebase (no regressions)
10. MUST produce updated QA reports in Team 50 format with updated date and results
11. MUST NOT proceed to S003 activation until all three pages have SOP-013 Seal

---

## 5) Operational Impact by Team

- **Team 10 (gateway):** Activate Team 30 for D22 filter/search UI (parallel with Team 50 test prep);
  activate Team 50 for D22/D34/D35 QA; coordinate sequencing.
- **Team 20 (backend):** On standby. Receive fix requests if API tests fail.
- **Team 30 (frontend):** Implement D22 filter/search UI (rule 1 above). Report completion to Team 10.
- **Team 50 (QA executor):** Create D22 test scripts + extend D34/D35 per existing directive.
  Run all suites. Produce all QA reports.
- **Team 90 (validation):** Gate sign-off per page upon PASS evidence receipt.
- **Team 70 (documentation):** Update D22/D34/D35 page docs upon final PASS.

---

## 6) Validation Gate

- **Gate owner:** Team 90
- **Required evidence per page:**
  - Updated QA report (Team 50 format, updated date, full results)
  - SOP-013 Seal
  - Test script evidence (API script + E2E test file)
- **PASS criteria:**
  - D22: API 100% PASS + E2E 100% PASS (all CRUD + filter + data integrity) + filter UI functional + zero regressions
  - D34: Per ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION.md PASS criteria
  - D35: Per ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION.md PASS criteria
- **BLOCK conditions:**
  - Any page without SOP-013 Seal
  - Any existing Gate-A test now failing (regression = BLOCK)
  - D22 filter UI not implemented before Team 50 E2E test run
  - D23 added to scope (deferred — must not appear)

---

## 7) Execution Order

1. Team 10 activates Team 30 for D22 filter/search UI
2. Team 10 activates Team 50 for D22 test script creation (parallel with step 1)
3. Team 30 completes D22 filter UI → notifies Team 50
4. Team 50 runs full D22 suite (after filter UI complete); runs D34 + D35 suites (parallel with D22)
5. Team 50 issues QA reports + SOP-013 Seals per page
6. Team 90 validates each page → signs off
7. Team 70 updates documentation
8. After all three pages PASS + Sealed: S002-P003 complete → S003 activation permitted

---

## 8) References

- D22 backend: `api/routers/tickers.py`
- D22 frontend: `ui/src/views/management/tickers/tickersTableInit.js`
- D22 form: `ui/src/views/management/tickers/tickersForm.js`
- D22 data integrity: `ui/src/views/management/tickers/tickersDataIntegrityInit.js`
- D34/D35 validation directive: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION.md`
- Gate-A D34 report: `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_MB3A_ALERTS_QA_REPORT.md`
- Gate-A D35 report: `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_MB3A_NOTES_QA_REPORT.md`
- QA Format Standard: `_COMMUNICATION/team_50/TEAM_50_QA_REPORT_FORMAT_STANDARD.md`
- Pages SSOT: `documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md`
- Program Registry: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_S002_P003_TIKTRACK_ALIGNMENT | LOCKED | 2026-02-26**
