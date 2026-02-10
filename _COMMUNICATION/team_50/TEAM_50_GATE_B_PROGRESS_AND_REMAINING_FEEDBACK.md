# Team 50 → צוותים: דוח התקדמות ומשוב לבעיות הנותרות

**id:** `TEAM_50_GATE_B_PROGRESS_AND_REMAINING_FEEDBACK`  
**date:** 2026-02-08  
**context:** ריצה לאחר תגובת הצוותים לדוח הקודם — סיכום התקדמות ומשוב מפורט.

---

## 1. סיכום התקדמות

### תוצאות ריצה (rerun-failed)

| בדיקה | סטטוס |
|-------|--------|
| D16 Trading Accounts | ✅ PASS |
| D18 Brokers Fees | ❌ FAIL |
| D21 Cash Flows | ❌ FAIL |
| Security_TokenLeakage | ✅ PASS |

**Pass Rate:** 50% (2/4)

---

## 2. התקדמות שבוצעה

### Team 30 — תיקון date_range הושלם

**לפני:**  
```
brokers_fees/summary?date_range=[object+Object]&search= → 400
currency_conversions?date_range=[object+Object]&search= → 400
```

**עכשיו:**  
```
brokers_fees/summary?search= → 400
currency_conversions?search= → 400
```

הפרמטר `date_range=[object Object]` לא נשלח יותר. התיקון ב־Filter Bridge / סיריאליזציה עובד.

---

## 3. בעיות שנותרו — Team 20 בלבד

הכשלים הנותרים קשורים ל־Backend APIs שמחזירים 400.

---

## 4. משוב מפורט — D18 (Team 20)

### הודעות השגיאה המלאות (מהארטיפקט)

```
severeMessages:
1. http://localhost:8080/api/v1/brokers_fees/summary - Failed to load resource: the server responded with a status of 400 (Bad Request)

2. http://localhost:8080/api/v1/brokers_fees/summary?search= - Failed to load resource: the server responded with a status of 400 (Bad Request)
```

### ניתוח

| קריאה | פרמטרים | סטטוס |
|------|----------|--------|
| 1 | ללא פרמטרים | 400 |
| 2 | `search=` (ריק) | 400 |

שתי הקריאות מחזירות 400 — גם בלי פרמטרים וגם עם `search` ריק.

### Endpoint

`GET /api/v1/brokers_fees/summary`

### מה לתקן

- **התנהגות נדרשת:** להחזיר 200 עבור:
  - קריאה ללא פרמטרים
  - קריאה עם `search=` (ערך ריק)
- **קבצים משוערים:** Router/Service של brokers_fees ב־Backend.

---

## 5. משוב מפורט — D21 (Team 20)

### הודעות השגיאה המלאות (מהארטיפקט)

```
severeMessages:
1. http://localhost:8080/api/v1/cash_flows/currency_conversions?page=1&page_size=25 - Failed to load resource: the server responded with a status of 400 (Bad Request)

2. http://localhost:8080/api/v1/cash_flows/currency_conversions?search= - Failed to load resource: the server responded with a status of 400 (Bad Request)
```

### ניתוח

| קריאה | פרמטרים | סטטוס |
|------|----------|--------|
| 1 | `page=1`, `page_size=25` | 400 |
| 2 | `search=` (ריק) | 400 |

### Endpoint

`GET /api/v1/cash_flows/currency_conversions`

### מה לתקן

- **התנהגות נדרשת:** להחזיר 200 עבור:
  - `page=1`, `page_size=25`
  - `search=` (ערך ריק)
- **קבצים משוערים:** Router/Service של cash_flows / currency_conversions ב־Backend.

---

## 6. טבלת תיקונים — Team 20

| Endpoint | פרמטרים שנבדקו | סטטוס נוכחי | תיקון נדרש |
|----------|-----------------|-------------|------------|
| `GET /api/v1/brokers_fees/summary` | none | 400 | להחזיר 200 |
| `GET /api/v1/brokers_fees/summary` | search= | 400 | להחזיר 200 |
| `GET /api/v1/cash_flows/currency_conversions` | page=1, page_size=25 | 400 | להחזיר 200 |
| `GET /api/v1/cash_flows/currency_conversions` | search= | 400 | להחזיר 200 |

---

## 7. נתונים מלאים מהארטיפקטים

### D18

```json
{
  "test": "D18_BrokersFees",
  "errors": 2,
  "errorsExcludingFavicon": 2,
  "severeMessages": [
    "http://localhost:8080/api/v1/brokers_fees/summary - Failed to load resource: the server responded with a status of 400 (Bad Request)",
    "http://localhost:8080/api/v1/brokers_fees/summary?search= - Failed to load resource: the server responded with a status of 400 (Bad Request)"
  ]
}
```

### D21

```json
{
  "test": "D21_CashFlows",
  "errors": 2,
  "errorsExcludingFavicon": 2,
  "severeMessages": [
    "http://localhost:8080/api/v1/cash_flows/currency_conversions?page=1&page_size=25 - Failed to load resource: the server responded with a status of 400 (Bad Request)",
    "http://localhost:8080/api/v1/cash_flows/currency_conversions?search= - Failed to load resource: the server responded with a status of 400 (Bad Request)"
  ]
}
```

---

## 8. ארטיפקטים

`documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/console_logs.json`

---

## 9. סיכום

| צוות | סטטוס | פעולה |
|------|--------|--------|
| **Team 30** | ✅ תיקון date_range הושלם | אין פעולה נוספת |
| **Team 20** | ❌ 2 endpoints מחזירים 400 | תיקון brokers_fees/summary ו־cash_flows/currency_conversions |
| **Team 50** | — | ריצה חוזרת לאחר תיקוני Team 20 |

---

**Team 50 (QA & Fidelity)**  
**log_entry | GATE_B | PROGRESS_AND_REMAINING_FEEDBACK | 2026-02-08**
