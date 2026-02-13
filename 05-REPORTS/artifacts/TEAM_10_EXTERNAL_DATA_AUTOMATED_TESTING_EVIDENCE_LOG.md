# Team 10 — External Data Automated Testing — Evidence Log

**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE  
**תוכנית עבודה:** TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE §10  
**תאריך:** 2026-02-13

---

## 1. סטטוס

| פריט | סטטוס | הערות |
|------|--------|--------|
| הנחיה רשמית בממשל | ✅ | 00_GOVERNANCE_SOP_v252 — נוספה הפניה להנחיה. |
| שילוב בתוכנית העבודה | ✅ | מנדט §10. |
| מנדטים לצוותים 20/30/50/60 | ✅ | TEAM_10_TO_TEAM_xx_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE. |
| CI wiring | ✅ | scripts/run-smoke-external-data.sh, scripts/run-nightly-external-data.sh (Team 50). |
| לוח CI (schedule) | ✅ | TEAM_50_EXTERNAL_DATA_CI_SCHEDULE.md — Smoke (A,B,D) על PR; Nightly (A–E) full. |
| Evidence — Nightly run | ✅ | 2026-01-31: Smoke PASS, Nightly A–E PASS (10/10 A, 6/6 B, C, D, 5/5 E). |
| Evidence — Team 50 | ✅ | סקריפטי Smoke/Nightly, דיווח, Evidence logs, CI Schedule. דוח: TEAM_50_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_STATUS_REPORT.md. |
| Evidence — Jobs (60) | ✅ | Team 60 הושלם. JSON: documentation/05-REPORTS/artifacts/TEAM_60_CLEANUP_EVIDENCE.json; בדיקה: tests/test_retention_cleanup_suite_d.py, make test-suite-d. |
| Evidence — Team 20 (Replay, A, B) | ✅ | Replay Mode (Alpha+Yahoo); cache_first_service mode/fixtures_dir; Suite A: tests/external_data_suite_a_contract_schema.py; Suite B: tests/test_external_data_cache_failover_pytest.py (6 tests). make test-external-data-smoke — PASS. |
| Evidence — Team 30 (Suite E) | ✅ | tests/external-data-suite-e-staleness-clock.e2e.test.js; E1–E4 PASS (5/5 כולל Login); npm run test:external-data-suite-e; Nightly: scripts/run-nightly-external-data.sh. Smoke: לא כוללת E (לפי הנחיה). |

---

## 2. לוח CI

- **Smoke (PR/Commit):** `bash scripts/run-smoke-external-data.sh` — סוויטות A, B, D.  
- **Nightly (Full):** `bash scripts/run-nightly-external-data.sh` — סוויטות A–E (דורש Backend 8082, Frontend 8080).  
- **מסמך:** documentation/05-REPORTS/artifacts/TEAM_50_EXTERNAL_DATA_CI_SCHEDULE.md

---

## 3. מוכנות לולידציה Team 90

| קריטריון (הנחיית Team 90) | סטטוס |
|----------------------------|--------|
| Full suite passes in nightly run | ✅ A–E PASS (2026-01-31) |
| Smoke suite passes on PR | ✅ A, B, D PASS |
| No external network calls when mode=REPLAY | ✅ (סוויטות A, B עם REPLAY) |
| Evidence logs attached for jobs + nightly run | ✅ TEAM_10 + TEAM_50 + TEAM_60 evidence |

**צוותים:** 20 (Replay, A, B) ✅ | 30 (Suite E) ✅ | 50 (Smoke/Nightly, reporting, CI) ✅ | 60 (Suite D, job evidence) ✅  

**הערכת Team 10:** מימוש ההנחיה הושלם; Evidence ו-CI Schedule מפורסמים. **מוכנים לולידציה של Team 90** — בהמתנה לבקרת Spy (Team 90) לפי Acceptance Criteria בהנחיה.

---

## 4. קישורים

- הנחיית אדריכל: `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE.md`
- מנדטים: `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_{20,30,50,60}_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE.md`
- Team 20 סיום: `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_COMPLETE.md`
- Team 20 Evidence: `documentation/05-REPORTS/artifacts/TEAM_20_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE.md`
- Team 10 ACK ל-20: `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_EXTERNAL_DATA_AUTOMATED_TESTING_ACK.md`
- Team 30 סיום: `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_COMPLETE.md`
- Team 30 Evidence: `documentation/05-REPORTS/artifacts/TEAM_30_EXTERNAL_DATA_SUITE_E_EVIDENCE.md`
- Team 10 ACK ל-30: `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_EXTERNAL_DATA_AUTOMATED_TESTING_ACK.md`
- Team 50 דוח סטטוס: `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_STATUS_REPORT.md`
- Team 50 Evidence: `documentation/05-REPORTS/artifacts/TEAM_50_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG.md`
- Team 50 CI Schedule: `documentation/05-REPORTS/artifacts/TEAM_50_EXTERNAL_DATA_CI_SCHEDULE.md`
- Team 10 ACK ל-50: `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_EXTERNAL_DATA_AUTOMATED_TESTING_ACK.md`
- Team 60 סיום: `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_AUTOMATED_TESTING_MANDATE_COMPLETE.md`
- Team 10 ACK ל-60: `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_60_EXTERNAL_DATA_AUTOMATED_TESTING_ACK.md`

---

**log_entry | TEAM_10 | EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG | 2026-02-13**
