# Team 60 → Team 20: תיאום — תיקון חסם QA בץ 2.5 (Backend 8082)

**מאת:** Team 60 (DevOps & Platform)  
**אל:** Team 20 (Backend & DB)  
**תאריך:** 2026-02-13  
**נושא:** תיאום — תשתית מוכנה; נדרש הפעלת Backend  
**מקור:** TEAM_10_TO_TEAMS_20_60_BATCH_2_5_QA_FIX_DEMAND.md

---

## 1. רקע

Team 50 דיווח על כישלון בדיקות QA בץ 2.5 — **חיבור ל-Backend (8082) נכשל**.  
דרישה: להבטיח Backend רץ ונגיש לפני בדיקה חוזרת.

---

## 2. סטטוס תשתית (Team 60)

| רכיב | סטטוס | פרטים |
|------|--------|-------|
| **PostgreSQL** | ✅ **RUNNING** | `tiktrack-postgres-dev` — Up, healthy |
| **Database** | ✅ **READY** | TikTrack-phoenix-db, חיבור מאומת |
| **סקריפט הרצה** | ✅ **קיים** | `scripts/start-backend.sh` |
| **פורט 8082** | ❌ **אין LISTEN** | Backend אינו רץ כרגע |

**מסקנה:** תשתית DB מוכנה. **נדרש הפעלת Backend על ידי Team 20.**

---

## 3. פעולה נדרשת — Team 20

### 3.1 הפעלת Backend

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
./scripts/start-backend.sh
```

**או:**
```bash
cd api && source venv/bin/activate
uvicorn api.main:app --host 0.0.0.0 --port 8082
```

### 3.2 אימות לפני הודעה ל-Team 10

```bash
# 1. Health check
curl -s http://127.0.0.1:8082/health
# Expected: {"status":"ok"}

# 2. Login (snake_case)
curl -s -X POST http://127.0.0.1:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"TikTrackAdmin","password":"4181"}'
# Expected: 200 + JWT token
```

### 3.3 משתמש בדיקה (QA seed)

| שדה | ערך |
|-----|-----|
| Username | TikTrackAdmin |
| Password | 4181 |

**הערה:** אם המשתמש לא קיים — להריץ `python3 scripts/seed_qa_test_user.py` (תלות ב-DB פעיל).

---

## 4. תיאום — לאחר הפעלה

**Team 20 — לדווח ל-Team 10 + Team 60 כאשר:**
- ✅ `curl http://127.0.0.1:8082/health` מחזיר `{"status":"ok"}`
- ✅ Login עם TikTrackAdmin/4181 מחזיר 200 + JWT

**אז:** Team 10 ימסור ל-Team 50 קונטקסט להרצת בדיקה חוזרת.

---

## 5. הפניות

| מסמך | נתיב |
|------|------|
| דרישת תיקון | _COMMUNICATION/team_10/TEAM_10_TO_TEAMS_20_60_BATCH_2_5_QA_FIX_DEMAND.md |
| דוח QA | _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_BATCH_2_5_ADR017_QA_REPORT.md |
| סקריפט הרצה | scripts/start-backend.sh |

---

**Team 60 (DevOps & Platform)**  
**log_entry | TEAM_60 | TO_TEAM_20 | QA_FIX_COORDINATION | 2026-02-13**
