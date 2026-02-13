# Team 20 → Team 30: API D18 עמלות לפי חשבון — מוכן

**מאת:** Team 20 (Backend)  
**אל:** Team 30 (Frontend)  
**תאריך:** 2026-02-12  
**הקשר:** סיכום סבב ADR-015, בקשה לציר זמנים  
**סטטוס:** ✅ **API מוכן — ניתן להתחיל D18**

---

## 1. תשובה לבקשה

> "האם יש ציר זמנים להשלמת API לעמלות לפי חשבון (trading_account_id) עבור D18?"

**API הושלם.** אין ציר זמנים — ניתן להתחיל עבודה על D18 כעת.

---

## 2. חוזה API — D18 (Brokers Fees)

### Endpoints

| Method | Path | תיאור |
|--------|------|--------|
| GET | `/api/v1/brokers_fees` | רשימת עמלות — סינון לפי `trading_account_id`, `broker` (via account) |
| GET | `/api/v1/brokers_fees/summary` | סיכום — סינון לפי `trading_account_id`, `broker` |
| GET | `/api/v1/brokers_fees/{id}` | עמלה בודדת |
| POST | `/api/v1/brokers_fees` | יצירה — **trading_account_id חובה** |
| PUT | `/api/v1/brokers_fees/{id}` | עדכון — trading_account_id אופציונלי |
| DELETE | `/api/v1/brokers_fees/{id}` | מחיקה (soft) |

### Query Params — GET list + summary

| Param | סוג | תיאור |
|-------|-----|--------|
| `trading_account_id` | string (ULID) | סינון לפי חשבון מסחר |
| `broker` | string | סינון לפי שם ברוקר (via join ל־account) |
| `commission_type` | string | TIERED / FLAT |
| `search` | string | חיפוש (account name, broker, commission) |

### Request — POST (Create)

```json
{
  "trading_account_id": "01ARZ3NDEKTSV4RRFFQ69G5FB",
  "commission_type": "TIERED",
  "commission_value": 0.0035,
  "minimum": 0.35
}
```

**חובה:** `trading_account_id` — אין `broker`. העמלה משויכת לחשבון מסחר.

### Request — PUT (Update)

```json
{
  "trading_account_id": "01ARZ3NDEKTSV4RRFFQ69G5FB",
  "commission_type": "FLAT",
  "commission_value": 1.0,
  "minimum": 0
}
```

כל השדות אופציונליים.

### Response — Single / List item

```json
{
  "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "trading_account_id": "01ARZ3NDEKTSV4RRFFQ69G5FB",
  "account_name": "IBKR Main",
  "commission_type": "TIERED",
  "commission_value": 0.0035,
  "minimum": 0.35,
  "created_at": "2026-01-31T10:00:00Z",
  "updated_at": "2026-01-31T10:00:00Z"
}
```

- **account_name** — שם החשבון (לצורך UI, מגיע מ־join)
- **trading_account_id** — ULID של החשבון

---

## 3. תלות במיגרציה (Team 60)

ה־API פעיל אך **דורש מיגרציה** בסביבה:

- סקריפט: `scripts/migrations/adr_015_brokers_fees_trading_account_id.sql`
- Team 60 מריץ לפי `TEAM_20_TO_TEAM_60_ADR_015_MIGRATION_SCRIPT_DELIVERY.md`

**לפיתוח מקומי:** אם ה־DB כבר עבר מיגרציה — ה־API פועל. אם לא — יש להריץ את הסקריפט לפני בדיקות.

---

## 4. לוגיקת D18 (המלצה)

1. **בחירת חשבון** — Select מ־`GET /api/v1/trading_accounts`
2. **טעינת עמלות** — `GET /api/v1/brokers_fees?trading_account_id={selected}`
3. **יצירת עמלה** — POST עם `trading_account_id` של החשבון הנבחר
4. **הצעת מילוי (אופציונלי)** — `default_fees` מ־`GET /api/v1/reference/brokers` לפי ברוקר החשבון

---

## 5. רפרנסים

- דוח השלמה: `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_ADR_015_COMPLETION_REPORT.md`
- סכמות: `api/schemas/brokers_fees.py`

---

**Team 20 (Backend)**  
**log_entry | ADR_015 | D18_API_READY | TO_TEAM_30 | 2026-02-12**
