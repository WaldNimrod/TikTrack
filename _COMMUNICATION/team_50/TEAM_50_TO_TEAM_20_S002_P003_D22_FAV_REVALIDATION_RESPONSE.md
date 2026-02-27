# Team 50 → Team 20 | אימות מחדש D22 FAV (S002-P003-WP002)

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_20_S002_P003_D22_FAV_REVALIDATION_RESPONSE  
**in_response_to:** TEAM_20_TO_TEAM_50_S002_P003_D22_API_REMEDIATION_RESPONSE  
**from:** Team 50 (QA / FAV)  
**to:** Team 20 (Backend Implementation)  
**cc:** Team 10  
**date:** 2026-01-31  
**status:** PARTIAL_PASS — filter תוקן; POST עדיין 500  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  

---

## 1) מטרה

דיווח תוצאות אימות מחדש לאחר תיקוני Team 20 (REMEDIATION_RESPONSE §4). **אתחול:** הופעל `scripts/fix-env-after-restart.sh` — כל 6 השלבים, כולל **[3/6] P3-020 migration** (DO, CREATE TABLE, CREATE INDEX…); לאחר מכן עצירה/הפעלת Backend ו־`scripts/run-tickers-d22-qa-api.sh` מול Backend פעיל.

---

## 2) תוצאות ריצה

| שלב | תוצאה | הערה |
|-----|--------|------|
| Admin Login | ✅ 200 | |
| GET /tickers/summary | ✅ 200 | |
| GET /tickers | ✅ 200 | |
| GET /tickers?ticker_type=STOCK | ✅ **200** | **תיקון תקף** — לא עוד 500 |
| GET /tickers?is_active=true | ✅ 200 | |
| GET /tickers?search=A | ✅ 200 | |
| POST /tickers | ❌ **500** | עדיין נכשל — לא 201, לא id |

**סיכום:** 6/7 עברו. POST /tickers מחזיר 500.

---

## 3) מידע מפורט לתיקון (per TEAM_50_QA_FAILURE_REPORTING_SOP_v1.0.0)

### 3.1 בקשת HTTP מדויקת

| שדה | ערך |
|-----|------|
| **Method** | POST |
| **URL** | `http://127.0.0.1:8082/api/v1/tickers` (או BASE + `/api/v1/tickers`) |
| **Headers** | `Content-Type: application/json`, `Authorization: Bearer <token>` (token מ־POST /api/v1/auth/login — TikTrackAdmin / 4181) |
| **Body** | `{"symbol":"QA_D22_DEBUG_TEST","ticker_type":"STOCK","is_active":false}` |

### 3.2 תשובת השרת המלאה

| שדה | ערך |
|-----|------|
| **HTTP status** | 500 |
| **Response headers** | `content-type: application/json` |
| **Response body** | `{"detail":"Failed to create ticker","error_code":"SERVER_ERROR"}` |

### 3.3 הקשר ריצה

- **אתחול:** `scripts/fix-env-after-restart.sh` — כל 6 השלבים; [3/6] P3-020 migration הורצה בהצלחה (פלט: "P3-020 migration complete").
- **Backend:** `/health` → 200, `/health/detailed` → 200 לפני ריצת הבדיקה.
- **סקריפט בדיקה:** `scripts/run-tickers-d22-qa-api.sh`.

### 3.4 שחזור (Repro)

1. `bash scripts/fix-env-after-restart.sh`
2. `bash scripts/run-tickers-d22-qa-api.sh`  
   — או קריאה ידנית: Login → POST /tickers עם body לעיל.

### 3.5 השגת השגיאה המדויקת (לצורך תיקון אופטימלי) — **הוטמע (אפשרות 3)**

בוצעה התאמה ב־`api/routers/tickers.py`: כאשר `DEBUG=true` ב־`api/.env`, תגובת 500 כוללת גם את סוג השגיאה והטקסט (עד 200 תווים), למשל:  
`Failed to create ticker: ProgrammingError: (asyncpg.exceptions.UndefinedColumnError) ...`

**אופן שימוש:**
1. להוסיף ל־`api/.env`: `DEBUG=true`
2. להפעיל מחדש את ה־Backend (`scripts/fix-env-after-restart.sh` או `scripts/start-backend.sh`)
3. להריץ `scripts/run-tickers-d22-qa-api.sh` או POST ידני
4. לקרוא את שדה `detail` בתגובה — שם יופיעו סוג השגיאה והמסר

**אזהרה:** לא להשאיר `DEBUG=true` בסביבת production — עלול לחשוף מידע פנימי.

---

## 3.6 שגיאה מדויקת (הופקה עם DEBUG=true — ריצת QA מלאה)

**תשובת 500 עם detail מלא (לאחר הרצה עם DEBUG=true):**

```
Failed to create ticker: NoReferencedTableError: Foreign key associated with column 'tickers.exchange_id' could not find table 'market_data.exchanges' with which to generate a foreign key to target column 'id'
```

**משמעות:** הטבלה `market_data.exchanges` חסרה או לא נוצרה. עמודת `tickers.exchange_id` מפנה ל־`market_data.exchanges.id`. נדרש migration/תיקון סכמה (למשל migration ל־reference tables — p3_021 או מקביל) כדי ליצור את הטבלה לפני ש־POST /tickers יעבוד.

---

## 4) פעולה מצופה

1. **Team 60** (אחראי מיגרציות): השגיאה המדויקת (§3.6) — חסרה טבלה `market_data.exchanges`. דרישה רשמית: `TEAM_20_TO_TEAM_60_S002_P003_D22_P3_021_MIGRATION_REQUEST.md`. נדרש להריץ **`make migrate-p3-021`** (market_data reference tables — exchanges, sectors, industries, market_cap_groups). אופציונלי: שילוב ב־`fix-env-after-restart.sh` (לאחר p3_020).
2. **Team 50:** יבצע ריצת FAV חוזרת (אתחול + `scripts/run-tickers-d22-qa-api.sh`) לאחר הרצת המיגרציה וידווח שוב.

---

## 5) רפרנסים

- _COMMUNICATION/team_20/TEAM_20_TO_TEAM_60_S002_P003_D22_P3_021_MIGRATION_REQUEST.md
- _COMMUNICATION/team_20/TEAM_20_TO_TEAM_50_S002_P003_D22_API_REMEDIATION_RESPONSE.md
- _COMMUNICATION/team_50/TEAM_50_TO_TEAM_20_S002_P003_API_CONTRACT_REQUEST.md
- _COMMUNICATION/team_50/TEAM_50_QA_FAILURE_REPORTING_SOP_v1.0.0.md (נוהל דיווח תקלות עם מידע מפורט)
- `scripts/run-tickers-d22-qa-api.sh`

---

**log_entry | TEAM_50 | TO_TEAM_20 | S002_P003_D22_FAV_REVALIDATION | PARTIAL_PASS | 2026-01-31**
