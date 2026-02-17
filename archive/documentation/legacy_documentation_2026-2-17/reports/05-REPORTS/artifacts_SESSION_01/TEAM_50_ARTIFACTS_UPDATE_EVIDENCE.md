# Team 50: E2E Artifacts Update — Evidence

**id:** `TEAM_50_ARTIFACTS_UPDATE_EVIDENCE`  
**date:** 2026-01-31  
**context:** עדכון ארטיפקטים E2E לפי דוח ביקורת — שמירת SEVERE מלאים

---

## דרישה (מהביקורת)

> "ב-phase2-e2e-selenium.test.js להוסיף ל-artifacts: errors: errors.map(e=>e.message) או לשמור את כל הלוגים/SEVERE, לא רק slice(0,20)"

---

## שינויים שבוצעו

**קובץ:** `tests/phase2-e2e-selenium.test.js`

| שדה חדש | תיאור |
|---------|--------|
| `severeMessages` | `allErrors.map(e => e.message)` — כל ה-SEVERE (כולל favicon) |
| `errorsExcludingFaviconMessages` | `errors.map(e => e.message)` — השגיאות שגורמות ל-FAIL |

שדות אלה נוספו ב־3 מקומות:
- D16_TradingAccounts
- D18_BrokersFees
- D21_CashFlows

---

## מבנה artifact מעודכן

```json
{
  "test": "D18_BrokersFees",
  "errors": 4,
  "errorsExcludingFavicon": 4,
  "warnings": 3,
  "severeMessages": ["http://localhost:8080/api/v1/brokers_fees/summary - Failed to load resource: 400 (Bad Request)", "..."],
  "errorsExcludingFaviconMessages": ["http://localhost:8080/api/v1/brokers_fees/summary - Failed to load resource: 400 (Bad Request)"],
  "logs": [/* עד 20 לוגים */]
}
```

---

## תוצאה

- מקור כשל (SEVERE) מופיע במלואו ב־`console_logs.json`
- אין צורך לחפש בשורות 21+ — השגיאות נשמרות במפורש

---

**Team 50 (QA & Fidelity)**  
**log_entry | GATE_B | ARTIFACTS_UPDATE | 2026-01-31**
