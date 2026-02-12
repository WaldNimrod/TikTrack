# 🗺️ Field Map LOD 400: עמלות ברוקרים (Brokers Fees)

**id:** `WP_20_09_FIELD_MAP_BROKERS_FEES`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🟡 **IN PROGRESS**  
**supersedes:** None (Master document)  
**last_updated:** 2026-01-31  
**version:** v1.0

**סשן:** S20.09 | **משימה:** Phase 2.1 - Brokers Fees (D18) | **סטנדרט:** Singular Naming (G-10)

---

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `UUID (PK)` - PostgreSQL UUID Primary Key
- **External ULIDs:** `VARCHAR(26)` - ULID string for API exposure
- **User Association:** `user_id UUID (FK)` - Links to `user_data.users`

---

## 2. סכימת מסד נתונים (Brokers Fees Schema)

**הערה:** טבלת DB נוצרה על ידי Team 60. `commission_value` עודכן ל-`NUMERIC(20, 6)` (מיגרציה הושלמה 2026-02-10).

### שדות מוצעים (לפי הבלופרינט והמנדט):

| שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `id` | `UUID (PK)` | `ULID` | מזהה ייחודי (UUID פנימי, ULID חיצוני) |
| `user_id` | `UUID (FK)` | `ULID` | קישור למשתמש (REFERENCES user_data.users) |
| `broker` | `VARCHAR(100)` | `String` | שם הברוקר (למשל: "Interactive Brokers", "IBKR") |
| `commission_type` | `VARCHAR(20)` | `String` | סוג עמלה: `TIERED` או `FLAT` |
| `commission_value` | `NUMERIC(20, 6)` | `Decimal` | ערך העמלה (מספרי, >= 0) |
| `minimum` | `NUMERIC(20, 6)` | `Decimal` | מינימום לפעולה (USD) |
| `created_at` | `TIMESTAMPTZ` | `DateTime` | תאריך יצירה |
| `updated_at` | `TIMESTAMPTZ` | `DateTime` | תאריך עדכון אחרון |
| `deleted_at` | `TIMESTAMPTZ` | `DateTime` | תאריך מחיקה (Soft Delete) |

### ENUM מוצע (אם נדרש):

```sql
CREATE TYPE user_data.commission_type AS ENUM ('TIERED', 'FLAT');
```

---

## 3. חוזה JSON (API Contract)

### Response Example (GET /api/v1/brokers_fees):

```json
{
  "brokers_fees": [
    {
      "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "broker": "Interactive Brokers",
      "commission_type": "TIERED",
      "commission_value": 0.0035,
      "minimum": 0.35
    },
    {
      "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "broker": "TD Ameritrade",
      "commission_type": "FLAT",
      "commission_value": 0.00,
      "minimum": 0.00
    }
  ],
  "total": 2
}
```

### Response Example (GET /api/v1/brokers_fees/{id}):

```json
{
  "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "broker": "Interactive Brokers",
  "commission_type": "TIERED",
  "commission_value": "0.0035 $ / Share",
  "minimum": 0.35,
  "created_at": "2026-01-31T10:00:00Z",
  "updated_at": "2026-01-31T10:00:00Z"
}
```

### Request Example (POST /api/v1/brokers_fees):

```json
{
  "broker": "Interactive Brokers",
  "commission_type": "TIERED",
  "commission_value": "0.0035 $ / Share",
  "minimum": 0.35
}
```

### Request Example (PUT /api/v1/brokers_fees/{id}):

```json
{
  "broker": "Interactive Brokers",
  "commission_type": "FLAT",
  "commission_value": "$0.00",
  "minimum": 0.00
}
```

---

## 4. Query Parameters (GET /api/v1/brokers_fees)

| פרמטר | טיפוס | חובה | תיאור |
| :--- | :--- | :--- | :--- |
| `broker` | `string` | לא | סינון לפי שם ברוקר |
| `commission_type` | `string` | לא | סינון לפי סוג עמלה (`TIERED`/`FLAT`) |
| `search` | `string` | לא | חיפוש חופשי (בשדות broker, commission_value) |

### דוגמאות:

```
GET /api/v1/brokers_fees?broker=Interactive%20Brokers
GET /api/v1/brokers_fees?commission_type=TIERED
GET /api/v1/brokers_fees?search=IBKR
```

---

## 5. מיפוי DB → API Response

| שדה DB | שדה API | טרנספורמציה |
| :--- | :--- | :--- |
| `id` | `id` | המרת UUID → ULID string |
| `user_id` | (מוסתר) | לא נחשף ב-API Response |
| `broker` | `broker` | ישירות |
| `commission_type` | `commission_type` | ישירות (ENUM → String) |
| `commission_value` | `commission_value` | ישירות |
| `minimum` | `minimum` | NUMERIC → Decimal |
| `created_at` | `created_at` | TIMESTAMPTZ → ISO 8601 DateTime |
| `updated_at` | `updated_at` | TIMESTAMPTZ → ISO 8601 DateTime |
| `deleted_at` | (מוסתר) | לא נחשף (Soft Delete) |

---

## 6. ולידציה (Validation Rules)

### שדות חובה:
- `broker` - חובה, מקסימום 100 תווים
- `commission_type` - חובה, חייב להיות `TIERED` או `FLAT`
- `commission_value` - חובה, מקסימום 255 תווים
- `minimum` - חובה, חייב להיות >= 0

### ולידציה נוספת:
- `broker` - לא יכול להיות ריק
- `commission_type` - חייב להיות אחד מהערכים המורשים
- `minimum` - חייב להיות מספר חיובי או אפס

---

## 7. אינדקסים מוצעים

```sql
-- אינדקס למשתמש (לשאילתות לפי user_id)
CREATE INDEX idx_brokers_fees_user_id ON user_data.brokers_fees(user_id);

-- אינדקס לברוקר (לסינון וחיפוש)
CREATE INDEX idx_brokers_fees_broker ON user_data.brokers_fees(broker);

-- אינדקס לסוג עמלה (לסינון)
CREATE INDEX idx_brokers_fees_commission_type ON user_data.brokers_fees(commission_type);

-- אינדקס למחיקה (Soft Delete)
CREATE INDEX idx_brokers_fees_deleted_at ON user_data.brokers_fees(deleted_at) WHERE deleted_at IS NULL;
```

---

## 8. הערות חשובות

### Singular Naming (חובה):
- ✅ שמות שדות ב-Singular: `broker`, `commission_type`, `commission_value`, `minimum`
- ❌ אין שימוש ב-Plural: `brokers`, `commissions`, `values`, `minimums`

### אבטחה:
- כל ה-endpoints דורשים Authentication (JWT Token)
- משתמש יכול לראות/לערוך רק את העמלות שלו (`user_id` filtering)
- אין חשיפת `user_id` ב-API Response

### Soft Delete:
- מחיקה היא Soft Delete (`deleted_at` IS NOT NULL)
- רשומות שנמחקו לא מוצגות ב-API Response
- ניתן לשחזר רשומות שנמחקו (אם נדרש)

---

## 9. תלותיות (Dependencies)

### טבלאות נדרשות:
- ✅ `user_data.users` - קיימת (לצורך FK `user_id`)

### פעולות נדרשות מ-Team 60:
- 🔴 **יצירת טבלת `user_data.brokers_fees`** - נדרש DDL
- 🔴 **הרשאות DB** - GRANT SELECT, INSERT, UPDATE, DELETE למשתמש האפליקציה

---

**Team 20 (Backend Implementation)**  
**תאריך:** 2026-01-31  
**סטטוס:** 🟡 **IN PROGRESS - AWAITING DB TABLE CREATION**

**log_entry | [Team 20] | D18 | FIELD_MAP_CREATED | YELLOW | 2026-01-31**
