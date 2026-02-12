# Team 20 → Team 60: חוסם — Database Connection Failed

**מאת:** Team 20 (Backend)  
**אל:** Team 60 (DevOps & Platform)  
**תאריך:** 2026-02-13  
**נושא:** 🔴 **BLOCKER** — חיבור למסד הנתונים נכשל — Login מחזיר 500  
**עדיפות:** P0 — חוסם שימוש באפליקציה

---

## 1. תסמינים

- **Endpoint:** `POST /api/v1/auth/login`  
- **תגובה:** HTTP 500  
- **Body:** `{"detail": "Database connection failed", "error_code": "DATABASE_ERROR"}`  
- **השפעה:** Login, Register וכל endpoint הצורך DB — לא פועלים.

---

## 2. אבחון (Team 20)

- Backend רץ על port 8082 — תקין.
- Config טוען `api/.env` (תוקן ב־`api/core/config.py` — `load_dotenv`).
- שגיאת DB מוחזרת מה־login handler (בדיקת `SELECT 1` ב־`auth.py` נכשלת).

**מסקנה:** חיבור ל־PostgreSQL נכשל. אחריות תשתית — **Team 60**.

---

## 3. משימות נדרשות (Team 60)

1. **לוודא ש־PostgreSQL רץ** על localhost:5432 (או ה־host/port הרלוונטי).
2. **לוודא ש־`api/.env`** מכיל `DATABASE_URL` תקין (user, password, host, port, database).
3. **לאמת חיבור** — `psql $DATABASE_URL -c "SELECT 1;"` מצליח.
4. **להפעיל מחדש את ה־Backend** לאחר תיקון.
5. **לדווח** ל־Team 10 / Team 20 — חיבור DB מאומת.

---

## 4. קבצים רלוונטיים

| קובץ | תיאור |
|------|-------|
| `api/.env` | DATABASE_URL, JWT_SECRET_KEY |
| `api/core/config.py` | טוען api/.env via load_dotenv |
| `api/core/database.py` | create_async_engine(postgresql+asyncpg) |
| `scripts/start-backend.sh` | מריץ uvicorn מ־project root |

---

## 5. הפניות

- **Team 20 Infrastructure Issues:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_INFRASTRUCTURE_ISSUES.md`  
- **Team 60 DB Credentials:** `_COMMUNICATION/team_60/Bach1_2026_2_2/TEAM_60_TO_TEAM_10_DATABASE_CREDENTIALS_SET.md`  
- **TT2 Database Credentials SSOT:** `documentation/01-ARCHITECTURE/TT2_DATABASE_CREDENTIALS.md`

---

**Team 20 (Backend)**  
**log_entry | TEAM_20 | TO_TEAM_60_DATABASE_CONNECTION_BLOCKER | 2026-02-13**
