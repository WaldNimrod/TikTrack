# דוח QA מפורט — ולידציה CRUD לאחר איתחול שרת

**מאת:** Team 50 (QA & Fidelity)  
**תאריך:** 2026-02-10  
**הקשר:** איתחול Backend עם סקריפטים, הרצת בדיקות, לכידת שגיאת שרת מלאה — דוח לתיקון ברור ומדויק.

---

## 1. מה בוצע

1. **איתחול שרת:** הרצת `scripts/stop-backend.sh` ואחריו `scripts/start-backend.sh` (ברקע).
2. **המתנה ל-health:** `curl http://localhost:8082/health` עד 200.
3. **הרצת בדיקה:** `node tests/phase1-completion-b-validation.test.js`.
4. **לכידת כשלים:** כל תגובה לא-תקינה (למשל 500) נשמרה ב־`phase1-completion-b-raw-failures.json` (כולל גוף תגובה מלא).
5. **לוג שרת:** נבדק לוג ה-Backend — מופיעה שם השגיאה המדויקת מ-PostgreSQL/SQLAlchemy.

---

## 2. תוצאות סיכום

| בדיקה | תוצאה |
|--------|--------|
| Login | ✅ 200 |
| D16 trading_accounts (תצוגה) | ✅ 3 רשומות |
| D18 brokers_fees (תצוגה) | ✅ 6 רשומות |
| D21 cash_flows (תצוגה) | ✅ 11 רשומות |
| **POST /api/v1/brokers_fees** | ❌ **500 Internal Server Error** |
| PUT/DELETE brokers_fees | לא בוצעו (תלויים ב-POST) |
| POST /api/v1/cash_flows | ✅ 201 |
| PUT /api/v1/cash_flows/{id} | ✅ 200 |
| DELETE /api/v1/cash_flows/{id} | ✅ 204 |

---

## 3. השגיאה המדויקת (מלוג השרת)

### 3.1 הודעת השגיאה

```
asyncpg.exceptions.DatatypeMismatchError: column "commission_type" is of type user_data.commission_type but expression is of type character varying
HINT: You will need to rewrite or cast the expression.
```

### 3.2 SQL שמופעל

```sql
INSERT INTO user_data.brokers_fees (id, user_id, broker, commission_type, commission_value, minimum, deleted_at)
VALUES ($1::UUID, $2::UUID, $3::VARCHAR, $4::VARCHAR, $5::VARCHAR, $6::NUMERIC(20, 6), $7::TIMESTAMP WITH TIME ZONE)
RETURNING ...
```

**פרמטרים:**  
`(UUID, UUID, 'QA Test Broker', 'FLAT', '2.00', Decimal('2'), None)`

**הנקודה:** העמודה `commission_type` ב-DB מוגדרת כ־**user_data.commission_type** (ENUM של PostgreSQL), ואילו SQLAlchemy שולח **$4::VARCHAR** — לכן PostgreSQL מחזיר DatatypeMismatchError.

### 3.3 מקור השגיאה בקוד

| קובץ | שורה | תיאור |
|------|------|--------|
| `api/routers/brokers_fees.py` | 223 | קריאה ל־service.create_broker_fee |
| `api/services/brokers_fees_service.py` | 215 | `await db.commit()` — הכשל בזמן ה-INSERT |
| `api/models/brokers_fees.py` | 65–67 | `commission_type: Mapped[str] = mapped_column(String(20), ...)` — המודל מגדיר String, ה-DB מצפה ל-ENUM |

### 3.4 סיבת הכשל

- **טבלה בפועל:** נוצרה עם `scripts/create_d18_brokers_fees_table.sql`, שבו:
  - `CREATE TYPE user_data.commission_type AS ENUM ('TIERED', 'FLAT');`
  - `commission_type user_data.commission_type NOT NULL`
- **מודל ORM:** משתמש ב־`String(20)` (לפי תיקון Team 20 מול DDL אחר).
- **תוצאה:** ה-INSERT שולח VARCHAR, ה-DB מצפה ל־user_data.commission_type — אי-התאמת טיפוס.

---

## 4. שחזור מדויק (Reproduction)

### 4.1 דרישות מקדימות

- Backend רץ על פורט 8082 (לאחר `scripts/start-backend.sh`).
- משתמש QA קיים (לאחר `python3 scripts/seed_qa_test_user.py`).

### 4.2 פקודות להרצה (Copy-Paste)

```bash
# 1. קבלת token
TOKEN=$(curl -s -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"TikTrackAdmin","password":"4181"}' \
  | jq -r '.access_token')

# 2. שליחת POST ליצירת broker fee (זה נכשל עם 500)
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:8082/api/v1/brokers_fees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"broker":"QA Test Broker","commission_type":"FLAT","commission_value":"2.00","minimum":2}'
```

**תוצאה צפויה:** HTTP 500 וגוף:

```json
{"detail":"Failed to create broker fee","error_code":"SERVER_ERROR"}
```

### 4.3 אופציה: הרצת סקריפט הבדיקה

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
bash scripts/stop-backend.sh
bash scripts/start-backend.sh &
# להמתין כמה שניות עד ש־/health מחזיר 200
node tests/phase1-completion-b-validation.test.js
```

ארטיפקטים:

- `documentation/05-REPORTS/artifacts_SESSION_01/phase1-completion-b-validation-results.json`
- `documentation/05-REPORTS/artifacts_SESSION_01/phase1-completion-b-raw-failures.json`

---

## 5. תיקון מומלץ (ללא ניחוש)

**אחריות:** Team 20 (Backend) / Team 60 (DB) — יש להתאים את ה-ORM למצב ה-DB בפועל.

### אופציה א' — התאמת ה-ORM ל-ENUM הקיים (מומלץ)

ה-DB כבר משתמש ב־`user_data.commission_type` ENUM. יש להחזיר במודל שימוש ב-Enum עם `create_type=False` כדי שלא ליצור טיפוס חדש.

**קובץ:** `api/models/brokers_fees.py`

1. להגדיר את ה-Enum של PostgreSQL (בלי ליצור טיפוס):

```python
from sqlalchemy import Enum
# אחרי הייבוא הקיימים
commission_type_enum = Enum('TIERED', 'FLAT', name='commission_type', schema='user_data', create_type=False)
```

2. להחליף את העמודה:

**לפני:**

```python
commission_type: Mapped[str] = mapped_column(
    String(20),
    nullable=False
)
```

**אחרי:**

```python
commission_type: Mapped[str] = mapped_column(
    commission_type_enum,
    nullable=False
)
```

3. להסיר את ה-CheckConstraint על `commission_type` מ־`__table_args__` (ה-ENUM כבר מגביל את הערכים), או להשאיר אם רוצים הגנה כפולה.

4. לוודא שב־`api/services/brokers_fees_service.py` נשאר שימוש במחרוזות `'TIERED'`/`'FLAT'` (ללא שינוי לוגיקה).

### אופציה ב' — שינוי ה-DB ל-VARCHAR (פחות מומלץ)

אם בוחרים ליישר את ה-DB ל־DDL המרכזי (VARCHAR):

- להריץ מיגרציה: `ALTER TABLE user_data.brokers_fees ALTER COLUMN commission_type TYPE VARCHAR(20) USING commission_type::text;`
- לוודא שאין תלויות אחרות ב־`user_data.commission_type`.

במקרה כזה המודל הנוכחי (String(20)) יכול להישאר.

---

## 6. ארטיפקטים

| קובץ | תיאור |
|------|--------|
| `phase1-completion-b-validation-results.json` | תוצאות הבדיקה (לוגין, תצוגה, CRUD). |
| `phase1-completion-b-raw-failures.json` | לכל קריאה שנכשלה: URL, method, גוףשה, סטטוס, כותרות, גוף תגובה מלא. |
| לוג שרת (תצוגת טרמינל של `start-backend.sh`) | מכיל את ה־traceback המלא ואת הודעת asyncpg. |

---

## 7. סיכום לצוותים

- **Team 20:** הכשל הוא אי-התאמה בין טיפוס העמודה ב-DB (`user_data.commission_type` ENUM) לבין המודל (String). יש לבחור אופציה א' או ב' למעלה וליישר בהתאם.
- **Team 60:** אם ה-DB נוצר מ־`scripts/create_d18_brokers_fees_table.sql` — העמודה היא ENUM; אם מ־DDL מרכזי עם VARCHAR — יש לוודא שכל הסביבות יישרו לאותו DDL.
- **Team 50:** לאחר תיקון — להריץ שוב `node tests/phase1-completion-b-validation.test.js` (לאחר איתחול שרת בסקריפטים) ולאמת ש־POST brokers_fees מחזיר 201.

---

## 8. אימות לאחר תיקון (Post-fix verification)

**תיקון שבוצע:** התאמת המודל ל-ENUM הקיים ב-DB — `api/models/brokers_fees.py`: שימוש ב־`Enum(..., schema='user_data', create_type=False)` במקום `String(20)`.

**הרצה חוזרת:** `node tests/phase1-completion-b-validation.test.js`

**תוצאה:** ✅ **PASSED** — כל הבדיקות עברו (כולל POST brokers_fees 201, PUT, DELETE).

---

**Team 50 (QA & Fidelity)**  
**log_entry | CRUD_VALIDATION_DETAILED_REPORT | 2026-02-10**
