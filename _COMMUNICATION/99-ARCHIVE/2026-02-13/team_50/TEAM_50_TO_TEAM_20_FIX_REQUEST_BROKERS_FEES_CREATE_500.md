# דרישת תיקון — Team 50 → Team 20: POST brokers_fees מחזיר 500

**אל:** Team 20 (Backend)  
**מאת:** Team 50 (QA)  
**תאריך:** 2026-02-10  
**חומרה:** Critical (חסימת CRUD D18)

---

## 1. השגיאה המדויקת

**מלוג השרת (ללא ניחוש):**

```
asyncpg.exceptions.DatatypeMismatchError: column "commission_type" is of type user_data.commission_type but expression is of type character varying
HINT: You will need to rewrite or cast the expression.
```

**תגובת API:** `500 Internal Server Error`  
**גוף תגובה:** `{"detail":"Failed to create broker fee","error_code":"SERVER_ERROR"}`

---

## 2. סיבת הכשל (במשפט)

העמודה `commission_type` ב-DB היא טיפוס **user_data.commission_type** (ENUM); המודל ב-ORM מגדיר **String(20)** — SQLAlchemy שולח VARCHAR ב-INSERT ולכן PostgreSQL מחזיר DatatypeMismatchError.

---

## 3. מיקום בקוד

| קובץ | שורה | תיאור |
|------|------|--------|
| `api/models/brokers_fees.py` | 65–67 | `commission_type: Mapped[str] = mapped_column(String(20), ...)` — כאן נדרש שינוי. |
| `api/services/brokers_fees_service.py` | 215 | הכשל קורה ב-`await db.commit()` (ה-INSERT). |
| `api/routers/brokers_fees.py` | 223 | קריאה ל-create_broker_fee. |

**מקור ה-DB:** הטבלה נוצרה עם `scripts/create_d18_brokers_fees_table.sql` — שם מופיע `user_data.commission_type AS ENUM ('TIERED', 'FLAT')` ו־`commission_type user_data.commission_type NOT NULL`.

---

## 4. שחזור (Reproduction)

```bash
TOKEN=$(curl -s -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"TikTrackAdmin","password":"4181"}' | jq -r '.access_token')

curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:8082/api/v1/brokers_fees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"broker":"QA Test Broker","commission_type":"FLAT","commission_value":"2.00","minimum":2}'
```

**תוצאה צפויה לפני תיקון:** HTTP 500.

---

## 5. תיקון נדרש (מדויק)

**קובץ:** `api/models/brokers_fees.py`

**שלב 1 — ייבוא ויצירת Enum (אחרי הייבואים הקיימים):**

```python
from sqlalchemy import Enum
# ...
commission_type_enum = Enum('TIERED', 'FLAT', name='commission_type', schema='user_data', create_type=False)
```

**שלב 2 — החלפת העמודה:**

**לפני:**  
`commission_type: Mapped[str] = mapped_column(String(20), nullable=False)`

**אחרי:**  
`commission_type: Mapped[str] = mapped_column(commission_type_enum, nullable=False)`

**שלב 3 — ב־`__table_args__`:** להסיר את ה-CheckConstraint על `commission_type` (ה-ENUM כבר מגביל ערכים).

---

## 6. אימות אחרי תיקון

- להפעיל מחדש Backend (`scripts/stop-backend.sh` → `scripts/start-backend.sh`).
- להריץ: `node tests/phase1-completion-b-validation.test.js`
- **מצופה:** כל הבדיקות עוברות, כולל "CRUD brokers_fees: create ✅".

או ידנית: אותו curl מ־סעיף 4 — מצופה **201 Created** וגוף תגובה עם `id`, `broker`, `commission_type`, `minimum` וכו'.

---

**Team 50 (QA & Fidelity)**  
**log_entry | TO_TEAM_20_FIX_REQUEST | BROKERS_FEES_CREATE_500 | 2026-02-10**
