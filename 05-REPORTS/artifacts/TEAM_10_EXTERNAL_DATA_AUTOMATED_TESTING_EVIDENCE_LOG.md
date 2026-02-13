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

## 3. מוכנות לולידציה Team 90 — ⚠️ NOT READY (מכשולים)

**דוח Team 90:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_VALIDATION_REVIEW.md`  
**תוכנית פעולה Team 10:** `_COMMUNICATION/team_10/TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_VALIDATION_BLOCKERS_ACK_AND_ACTIONS.md`

### מכשולים (חייבים תיקון לפני GATE_B_READY)

| # | מכשול | תיקון | בעלים |
|---|--------|--------|--------|
| 1 | Evidence לא עדכני — לוגים 2026-01-31, קבצים 2026-02-14 | הרצה מחדש Smoke + Nightly; עדכון Evidence בתאריכים ובתוצאות | ⏳ **נדרש** — להריץ ולהעדכן (Team 50). |
| 2 | כפילות Suite E — `.e2e.test.js` ו־`.test.js` | קובץ קנוני אחד (`.e2e.test.js`); עדכון references; ארכוב/הסרת כפיל | ✅ בוצע — כפיל ב־99-ARCHIVE/tests/; Nightly משתמש ב־.e2e.test.js. |
| 3 | Suite C דורשת `market_data.ticker_prices_intraday` | Evidence שהטבלה קיימת ב-DB (DDL/בדיקה) | ✅ Evidence: TEAM_20_60_TICKER_PRICES_INTRADAY_EVIDENCE.md + p3_016. אם DB לא הריץ migration — Team 20/60 להריץ. |

**אחרי תיקון:** Team 90 תבצע ולידציה חוזרת; אם נקי — GATE_B_READY.

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
- דוח ולידציה Team 90: `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_VALIDATION_REVIEW.md`
- תוכנית פעולה (מכשולים): `_COMMUNICATION/team_10/TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_VALIDATION_BLOCKERS_ACK_AND_ACTIONS.md`
- צ'קליסט מול Team 90: `05-REPORTS/artifacts/TEAM_10_EXTERNAL_DATA_VALIDATION_CHECKLIST_FOR_TEAM_90.md`
- Evidence intraday: `documentation/05-REPORTS/artifacts/TEAM_20_60_TICKER_PRICES_INTRADAY_EVIDENCE.md`

---

**log_entry | TEAM_10 | EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG | 2026-02-13**
