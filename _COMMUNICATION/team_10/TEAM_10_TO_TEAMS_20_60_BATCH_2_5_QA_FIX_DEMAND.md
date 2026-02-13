# Team 10 → Teams 20 + 60: דרישת תיקון — בץ 2.5 QA לפני בדיקה חוזרת

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend & DB), Team 60 (DevOps & Platform)  
**תאריך:** 2026-02-13  
**נושא:** 🔴 דרישת תיקון — Backend/תשתית לפני הגשה לבדיקה חוזרת בץ 2.5 (ADR-017)

**מקור:** TEAM_50_TO_TEAM_10_BATCH_2_5_ADR017_QA_REPORT.md; BATCH_2_5_COMPLETIONS_MANDATE.md §3

---

## 1. רקע

Team 50 הריץ בדיקות QA לבץ 2.5 (Redirect + User Icon, ADR-017). **2 קריטריונים נכשלו / דולגו** עקב חוסר זמינות Backend:

| קריטריון | סטטוס | סיבה |
|----------|-------|------|
| User Icon — Success (מחובר) | **SKIP** | Login נכשל — חיבור ל-Backend (8082) נכשל |
| 0 SEVERE בקונסול | **FAIL** | 4 SEVERE: auth/login Failed to load; audit ERROR (תוצאה של כישלון התחברות) |

---

## 2. מידע מפורט — ממצאי QA

### 2.1 Endpoint שנכשל

| פריט | ערך |
|------|-----|
| **URL** | `http://127.0.0.1:8080/api/v1/auth/login` (Proxy → Backend 8082) |
| **שגיאה** | Failed to load resource: the server responded with a status of (connection refused / timeout) |
| **השפעה** | Login נכשל → User Icon Success לא נבדק; Audit ERROR → SEVERE בקונסול |

### 2.2 בדיקת תקינות נדרשת

```bash
# Before re-submission to QA, verify:
curl -s http://127.0.0.1:8082/health
# Expected: {"status":"ok"}

curl -s -X POST http://127.0.0.1:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"TikTrackAdmin","password":"4181"}'
# Expected: 200 + JWT token
```

### 2.3 הגדרות SSOT

| הגדרה | ערך |
|------|-----|
| Frontend | 127.0.0.1:8080 |
| Backend | 127.0.0.1:8082 |
| Proxy | Vite: /api → localhost:8082 |
| Test User | TikTrackAdmin / 4181 (QA seed) |

---

## 3. חלוקת אחריות — Teams 20 + 60

### 3.1 Team 20 (Backend & DB)

| משימה | תוצר מצופה |
|-------|-------------|
| **הרצת Backend יציב** על פורט 8082 | `uvicorn api.main:app --host 0.0.0.0 --port 8082` — תגובת /health תקינה |
| **אימות endpoint Login** | POST /api/v1/auth/login מחזיר 200 עם JWT עבור TikTrackAdmin/4181 |
| **מסד נתונים** | חיבור DB פעיל — אין 500 Database connection failed |
| **תיעוד** | הודעה ל-Team 10 + Team 60 — Backend מוכן לבדיקה |

### 3.2 Team 60 (DevOps & Platform)

| משימה | תוצר מצופה |
|-------|-------------|
| **תשתית הרצה** | סקריפט/הוראות להפעלת Backend (למשל `scripts/start-backend.sh`, `make backend`) |
| **וידוא פורט 8082** | אין חסימה; `lsof -i :8082` מציג תהליך Backend |
| **תיאום עם Team 20** | טיפול בחסימות DB / סביבה — דיווח ל-Team 10 |

---

## 4. דרישה

**לפני הגשה לבדיקה חוזרת (Team 50):**

1. **Team 20:** להבטיח ש-Backend רץ ונגיש על 8082; Login עובד עם TikTrackAdmin/4181.
2. **Team 60:** להבטיח תשתית הרצה ותיעוד; טיפול בחסימות פורטים/DB אם יש.
3. **תיאום:** Team 20 ו-60 — להודיע ל-Team 10 כאשר המערכת מוכנה לבדיקה חוזרת.
4. **אימות עצמאי:** כל צוות מריץ `curl http://127.0.0.1:8082/health` ומקבל `{"status":"ok"}` לפני הודעה.

---

## 5. הפניות

| מסמך | נתיב |
|------|------|
| דוח QA בץ 2.5 | _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_BATCH_2_5_ADR017_QA_REPORT.md |
| מנדט בץ 2.5 | _COMMUNICATION/team_10/BATCH_2_5_COMPLETIONS_MANDATE.md |
| בדיקת QA | tests/batch-2-5-adr017-qa-e2e.test.js — `npm run test:batch-2-5-adr017` |

---

## 6. צעד הבא

לאחר תיקון — Team 10 ימסור ל-Team 50 קונטקסט להרצת בדיקה חוזרת. קריטריון הצלחה: **PASS מלא, 0 SEVERE, דוח QA מאומת.**

---

**Team 10 (The Gateway)**  
**log_entry | TEAM_10 | BATCH_2_5_QA_FIX_DEMAND | TO_TEAMS_20_60 | 2026-02-13**
