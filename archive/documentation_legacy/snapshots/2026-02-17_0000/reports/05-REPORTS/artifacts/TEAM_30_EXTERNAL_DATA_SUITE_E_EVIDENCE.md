# Evidence — Team 30: External Data Suite E (Staleness Clock + Tooltip)

**id:** `TEAM_30_EXTERNAL_DATA_SUITE_E_EVIDENCE`  
**מקור:** TEAM_10_TO_TEAM_30_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE, TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE  
**תאריך:** 2026-02-13  
**עדכון:** 2026-02-13 — סיום מנדט מלא

---

## תוצרים

| פריט | נתיב |
|------|------|
| E2E Test | `tests/external-data-suite-e-staleness-clock.e2e.test.js` |
| npm script | `tests/package.json` → `test:external-data-suite-e` → קובץ לעיל |
| Nightly | `scripts/run-nightly-external-data.sh` — מריץ Suite E עם A–D |
| Report | `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_COMPLETE.md` |

---

## בדיקות (E1–E4)

| בדיקה | דרישה | סטטוס |
|-------|--------|--------|
| E1 | staleness=ok → שעון ניטרלי + tooltip | PASS |
| E2 | staleness=warning → צבע אזהרה + tooltip | PASS |
| E3 | staleness=na → צבע alert + tooltip | PASS |
| E4 | No banner — אין באנר | PASS |

(מקביל ל־suiteE_ok, suiteE_warning, suiteE_na, suiteE_noBanner — class `staleness-clock--ok|warning|na`, tooltip, אין eod-warning-banner.)

---

## הרצה

```bash
cd tests && npm run test:external-data-suite-e
# תוצאה: 5/5 PASS (כולל Login)
```

---

**log_entry | TEAM_30 | EVIDENCE | EXTERNAL_DATA_SUITE_E | 2026-02-13**
