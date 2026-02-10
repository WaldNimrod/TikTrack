# Team 50 → צוותים: דוח Gate B — משוב מפורט לבעיות הנותרות

**id:** `TEAM_50_GATE_B_REMAINING_ISSUES_FEEDBACK`  
**date:** 2026-02-07  
**context:** ריצה `test:phase2-e2e-rerun-failed` — 2 כישלונות (D18, D21). מטרת המשוב: לאפשר תיקון אופטימלי ומדויק.

---

## 1. סיכום ריצה

| מדד | ערך |
|-----|-----|
| סה"כ בדיקות (rerun-failed) | 4 |
| עברו | 2 (D16, Security_TokenLeakage) |
| נכשלו | 2 (D18, D21) |
| Pass Rate | 50% |

### מה עבר

- **D16 Trading Accounts** — 0 SEVERE
- **Security_TokenLeakage** — אין דליפת JWT

### מה נכשל

- **D18 Brokers Fees** — 2 SEVERE
- **D21 Cash Flows** — 2 SEVERE

---

## 2. משוב מלא — D18 Brokers Fees (Team 20 + Team 30)

### הקשר הבדיקה

- **בדיקה:** D18 — Brokers Fees.
- **מה בודקים:** טעינת הדף ללא שגיאות SEVERE ב־Console.
- **תוצאה:** נכשל — 2 SEVERE.

### הודעות השגיאה המלאות (מהארטיפקט)

```
severeMessages:
1. http://localhost:8080/api/v1/brokers_fees/summary - Failed to load resource: the server responded with a status of 400 (Bad Request)

2. http://localhost:8080/api/v1/brokers_fees/summary?date_range=%5Bobject+Object%5D&search= - Failed to load resource: the server responded with a status of 400 (Bad Request)
```

### ניתוח

- **קריאה 1:** `GET /api/v1/brokers_fees/summary` — ללא פרמטרים → 400.
- **קריאה 2:** `GET /api/v1/brokers_fees/summary?date_range=[object+Object]&search=` — עם פרמטרים.

`date_range=%5Bobject+Object%5D` = `date_range=[object Object]` — העברת אובייקט JavaScript ישירות ל־URL בלי סיריאליזציה.

### מקור הקריאות

- **קובץ:** `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js`
- **פונקציה:** `fetchBrokersFeesSummary(filters)`
- **שורה ~100:** `sharedServices.get('/brokers_fees/summary', summaryFilters)`
- **פילטרים:** נשלחים מ־loadBrokersFeesData(filters) — filters מגיעים מה־Filter Bridge / DataStage.

### מה לתקן

| צוות | בעיה | תיקון |
|------|------|--------|
| **Team 30** | `date_range` נשלח כאובייקט → `[object Object]` | לוודא ש־`date_range` נשלח כמחרוזת (למשל `date_from`, `date_to`) או לא נשלח אם לא תקין. לא להעביר אובייקט ישירות ל־query params. |
| **Team 20** | 400 גם לקריאה ללא פרמטרים | ה־endpoint צריך להחזיר 200 גם ל־`GET /brokers_fees/summary` בלי פרמטרים, או עם פרמטרים ריקים/לא תקניים. |

---

## 3. משוב מלא — D21 Cash Flows (Team 20 + Team 30)

### הקשר הבדיקה

- **בדיקה:** D21 — Cash Flows.
- **מה בודקים:** טעינת הדף ללא שגיאות SEVERE ב־Console.
- **תוצאה:** נכשל — 2 SEVERE.

### הודעות השגיאה המלאות (מהארטיפקט)

```
severeMessages:
1. http://localhost:8080/api/v1/cash_flows/currency_conversions?page=1&page_size=25 - Failed to load resource: the server responded with a status of 400 (Bad Request)

2. http://localhost:8080/api/v1/cash_flows/currency_conversions?date_range=%5Bobject+Object%5D&search= - Failed to load resource: the server responded with a status of 400 (Bad Request)
```

### ניתוח

- **קריאה 1:** `GET /api/v1/cash_flows/currency_conversions?page=1&page_size=25` — pagination תקין → 400.
- **קריאה 2:** `GET /api/v1/cash_flows/currency_conversions?date_range=[object+Object]&search=` — אותה בעיית `date_range=[object Object]`.

### מקור הקריאות

- **קובץ:** `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js`
- **פונקציה:** `fetchCurrencyConversions(filters)` — קריאות עם filters ו־pagination.

### מה לתקן

| צוות | בעיה | תיקון |
|------|------|--------|
| **Team 30** | `date_range` נשלח כאובייקט | כפי ב־D18 — לא להעביר `date_range` כאובייקט ל־query params. |
| **Team 20** | 400 ל־`currency_conversions?page=1&page_size=25` | ה־endpoint צריך לקבל `page` ו־`page_size` ולהחזיר 200. לוודא validation ו־schema. |

---

## 4. נתונים מלאים מהארטיפקטים

### D18 — מבנה מלא

```json
{
  "test": "D18_BrokersFees",
  "errors": 2,
  "errorsExcludingFavicon": 2,
  "warnings": 4,
  "severeMessages": [
    "http://localhost:8080/api/v1/brokers_fees/summary - Failed to load resource: the server responded with a status of 400 (Bad Request)",
    "http://localhost:8080/api/v1/brokers_fees/summary?date_range=%5Bobject+Object%5D&search= - Failed to load resource: the server responded with a status of 400 (Bad Request)"
  ],
  "errorsExcludingFaviconMessages": [
    "http://localhost:8080/api/v1/brokers_fees/summary - Failed to load resource: the server responded with a status of 400 (Bad Request)",
    "http://localhost:8080/api/v1/brokers_fees/summary?date_range=%5Bobject+Object%5D&search= - Failed to load resource: the server responded with a status of 400 (Bad Request)"
  ]
}
```

### D21 — מבנה מלא

```json
{
  "test": "D21_CashFlows",
  "errors": 2,
  "errorsExcludingFavicon": 2,
  "warnings": 4,
  "severeMessages": [
    "http://localhost:8080/api/v1/cash_flows/currency_conversions?page=1&page_size=25 - Failed to load resource: the server responded with a status of 400 (Bad Request)",
    "http://localhost:8080/api/v1/cash_flows/currency_conversions?date_range=%5Bobject+Object%5D&search= - Failed to load resource: the server responded with a status of 400 (Bad Request)"
  ],
  "errorsExcludingFaviconMessages": [
    "http://localhost:8080/api/v1/cash_flows/currency_conversions?page=1&page_size=25 - Failed to load resource: the server responded with a status of 400 (Bad Request)",
    "http://localhost:8080/api/v1/cash_flows/currency_conversions?date_range=%5Bobject+Object%5D&search= - Failed to load resource: the server responded with a status of 400 (Bad Request)"
  ]
}
```

---

## 5. סיכום תיקונים נדרשים

| Endpoint | צוות | תיאור קצר |
|----------|------|-----------|
| `GET /api/v1/brokers_fees/summary` | **Team 20** | להחזיר 200 גם בלי פרמטרים |
| `GET /api/v1/brokers_fees/summary` (עם date_range=[object Object]) | **Team 30** | לא להעביר date_range כאובייקט; **Team 20** | להיות resilient (למשל 400 עם הודעת validation ברורה או להתעלם מפרמטר לא תקני) |
| `GET /api/v1/cash_flows/currency_conversions?page=1&page_size=25` | **Team 20** | לתמוך ב־page, page_size ולהחזיר 200 |
| `GET /api/v1/cash_flows/currency_conversions` (עם date_range=[object Object]) | **Team 30** | כפי ב־brokers_fees; **Team 20** | resilience |

---

## 6. מיקום ארטיפקטים

```
documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/
  - console_logs.json   (כל severeMessages, errorsExcludingFaviconMessages)
  - test_summary.json
  - D18_BrokersFees_screenshot.png
  - D21_CashFlows_screenshot.png
```

---

## 7. תהליך המשך

1. **Team 20** — תיקון endpoints (brokers_fees/summary, cash_flows/currency_conversions).
2. **Team 30** — תיקון העברת `date_range` (לא כאובייקט ל־URL).
3. **Team 50** — ריצת `npm run test:phase2-e2e-rerun-failed` לאחר התיקונים; אם הכל עובר — סבב מלא.

---

**Team 50 (QA & Fidelity)**  
**log_entry | GATE_B | REMAINING_ISSUES_FEEDBACK | 2026-02-07**
