# Team 20 → Team 60: הודעת תאום — תשתית QA בץ 2.5

**מאת:** Team 20 (Backend & DB)  
**אל:** Team 60 (DevOps & Platform)  
**תאריך:** 2026-02-13  
**נושא:** 🔴 **תאום חובה** — חסימת תשתית חוסמת שיחרור גרסה (בץ 2.5 QA)  
**מקור:** TEAM_10_TO_TEAMS_20_60_BATCH_2_5_QA_FIX_DEMAND.md

---

## 1. רקע

Team 50 הריץ QA לבץ 2.5 — **נכשל** עקב Backend לא נגיש / Login 500.  
Team 10 דרש: Team 20 + 60 להבטיח Backend רץ, Login עובד.

---

## 2. חוסם — Database Connection

**תסמין:** `POST /api/v1/auth/login` → HTTP 500  
**תגובה:** `{"detail": "Database connection failed", "error_code": "DATABASE_ERROR"}`

**סיבה:** חיבור ל-PostgreSQL נכשל. **אחריות תשתית — Team 60.**

---

## 3. משימות נדרשות (Team 60)

| # | משימה | קריטריון הצלחה |
|---|-------|-----------------|
| 1 | PostgreSQL רץ | `pg_isready -h localhost -p 5432` → accepting connections |
| 2 | `api/.env` תקין | `DATABASE_URL` תואם ל-DB; `JWT_SECRET_KEY` (מינימום 64 תווים) |
| 3 | אימות חיבור | `psql $DATABASE_URL -c "SELECT 1;"` מצליח |
| 4 | הוראות הרצה | `scripts/start-backend.sh` — תיעוד/עדכון אם נדרש |
| 5 | הודעה ל-Team 10 | דיווח — תשתית מוכנה; Backend יכול לרוץ |

---

## 4. תלות

**Team 20 לא יכול:**
- להריץ Backend יציב — ללא חיבור DB
- לאמת Login — ללא DB

**לאחר תיקון DB ע"י Team 60:** Team 20 יבצע אימות Backend + Login ויודיע ל-Team 10.

---

## 5. קבצים רלוונטיים

| קובץ | תיאור |
|------|-------|
| `api/.env` | DATABASE_URL, JWT_SECRET_KEY |
| `api/core/config.py` | טוען api/.env via load_dotenv |
| `scripts/start-backend.sh` | הרצת Backend |

---

## 6. הפניות

- **דרישת Team 10:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAMS_20_60_BATCH_2_5_QA_FIX_DEMAND.md`
- **אישור Team 20:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_BATCH_2_5_QA_FIX_ACKNOWLEDGMENT.md`
- **Database Blocker (ארכיון):** `_COMMUNICATION/99-ARCHIVE/2026-02-13/team_60/TEAM_20_TO_TEAM_60_DATABASE_CONNECTION_BLOCKER.md`

---

**Team 20 (Backend)**  
**log_entry | TEAM_20 | TO_TEAM_60 | BATCH_2_5_QA_INFRASTRUCTURE_COORDINATION | 2026-02-13**
