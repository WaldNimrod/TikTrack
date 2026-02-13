# Evidence Log — External Data Automated Testing

**id:** `TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG`  
**מקור:** TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE §10  
**מנדט:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE  
**תאריך:** 2026-01-31

---

## סוויטות ויישום

| סוויטה | צוות | קובץ / Evidence | סטטוס |
|--------|------|-----------------|--------|
| **A** Contract & Schema | 20 | tests/external_data_suite_a_contract_schema.py | ✅ |
| **B** Cache-First + Failover | 20 | tests/test_external_data_cache_failover_pytest.py | ✅ |
| **C** Cadence & Status | 20 | tests/external_data_suite_c_cadence.py | ✅ |
| **D** Retention & Cleanup | 60 | tests/test_retention_cleanup_suite_d.py | ✅ |
| **E** UI (Clock + Tooltip) | 30 | tests/external-data-suite-e-staleness-clock.e2e.test.js | ✅ |

---

## Suite E — Evidence (Team 30)

**מנדט:** TEAM_10_TO_TEAM_30_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE

| בדיקה | תיאור | סטטוס |
|-------|--------|--------|
| E1 | staleness=ok → שעון ניטרלי + tooltip | PASS |
| E2 | staleness=warning → צבע אזהרה + tooltip | PASS |
| E3 | staleness=na → צבע alert + tooltip | PASS |
| E4 | No banner — אין באנר | PASS |

**הרצה:** `cd tests && npm run test:external-data-suite-e`  
**ריצת אימות:** 2026-01-31 — 5/5 PASS (Login + E1–E4)

**תנאי מקדימים:**
- Frontend: http://127.0.0.1:8080
- Backend: http://127.0.0.1:8082
- משתמש QA: TikTrackAdmin / 4181

---

## אינטגרציה CI

| הרצה | סקריפט | סוויטות |
|------|--------|----------|
| **Nightly (Full)** | scripts/run-nightly-external-data.sh | A, B, C, D, E |
| **Smoke (PR)** | scripts/run-smoke-external-data.sh | A, B, D |

---

## ריצת אימות מלאה (2026-01-31)

**Nightly (A–E):** ✅ PASS  
**Smoke (A, B, D):** ✅ PASS  

- A: 10/10 checks
- B: 6/6 pytest
- C: cadence_tables
- D: retention evidence OK
- E: 5/5 (Login + E1–E4)

**פקודות:**  
`bash scripts/run-nightly-external-data.sh`  
`bash scripts/run-smoke-external-data.sh`

---

## מוכנות לולידציה Team 90 — ⚠️ NOT READY (מכשולים)

**דוח Team 90:** _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_VALIDATION_REVIEW.md  
**פעולות Team 10:** _COMMUNICATION/team_10/TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_VALIDATION_BLOCKERS_ACK_AND_ACTIONS.md

מכשולים: (1) Evidence לא עדכני — הרצה מחדש Smoke+Nightly + עדכון Evidence [50]. (2) כפילות Suite E — קובץ קנוני .e2e.test.js, ארכוב כפיל [30+10]. (3) Suite C — Evidence ל־ticker_prices_intraday [20/60]. אחרי תיקון → ולידציה חוזרת → GATE_B_READY.

---

**log_entry | TEAM_10 | EVIDENCE_LOG | EXTERNAL_DATA_AUTOMATED_TESTING | 2026-01-31**  
**log_entry | TEAM_30 | SUITE_E | IMPLEMENTATION_VERIFIED | 2026-01-31**  
**log_entry | TEAM_50 | FULL_RUN_VERIFIED | SMOKE_AND_NIGHTLY_PASS | 2026-01-31**
