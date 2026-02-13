# Evidence — Team 30: External Data Suite E (Staleness Clock + Tooltip)

**id:** `TEAM_30_EXTERNAL_DATA_SUITE_E_EVIDENCE`  
**מקור:** TEAM_10_TO_TEAM_30_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE, TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE  
**תאריך:** 2026-02-13  
**עדכון:** 2026-01-31 — השלמת מימוש לאחר חזרת סביבה

---

## תוצרים

| פריט | נתיב |
|------|------|
| E2E Test | `tests/external-data-suite-e-staleness-clock.test.js` |
| npm script | `tests/package.json` → `test:external-data-suite-e` |
| Report | `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_COMPLETE.md` |

---

## בדיקות (4 קריטריונים)

1. **suiteE_ok** — `staleness=ok` → class `staleness-clock--ok`, tooltip "נתונים מעודכנים"
2. **suiteE_warning** — `staleness=warning` → class `staleness-clock--warning`, tooltip עם "15 דקות"
3. **suiteE_na** — `staleness=na` → class `staleness-clock--na`, tooltip עם "EOD" / "סוף יום"
4. **suiteE_noBanner** — אין באנר גלוי (eod-warning-banner לא קיים או מוסתר)

---

## הרצה

```bash
cd tests && npm run test:external-data-suite-e
```

---

**log_entry | TEAM_30 | EVIDENCE | EXTERNAL_DATA_SUITE_E | 2026-02-13**
