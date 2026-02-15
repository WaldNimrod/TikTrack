# Team 20 → Team 10: אישור דרישת תיקון QA — בץ 2.5

**מאת:** Team 20 (Backend & DB)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAMS_20_60_BATCH_2_5_QA_FIX_DEMAND.md

---

## 1. הכרה בדרישה

Team 20 מכיר בדרישת התיקון — Backend חייב להיות נגיש על 8082; Login עם TikTrackAdmin/4181 חייב להצליח.

---

## 2. תלות בתשתית (Team 60)

**חוסם:** Backend לא יכול לעבוד ללא **חיבור DB תקין**.  
כאשר DB נכשל — Login מחזיר 500 (`Database connection failed`).

**דרישה מ-Team 60:**
1. PostgreSQL רץ ונגיש
2. `api/.env` — `DATABASE_URL` תקין
3. אימות: `psql $DATABASE_URL -c "SELECT 1;"` מצליח

**הודעת תאום נשלחה:** `_COMMUNICATION/team_60/TEAM_20_TO_TEAM_60_BATCH_2_5_QA_INFRASTRUCTURE_COORDINATION.md`

---

## 3. פעולות Team 20 (לאחר תיקון DB)

| משימה | סטטוס |
|-------|--------|
| הרצת Backend על 8082 | `scripts/start-backend.sh` |
| אימות /health | צפוי: `{"status":"ok"}` |
| אימות Login (TikTrackAdmin/4181) | צפוי: 200 + JWT |
| הודעה ל-Team 10 | לאחר אימות עצמאי |

---

## 4. Login Request — תיקון שדה

**הערה:** הקריאה המתועדת משתמשת ב-`username_or_email` (snake_case). Frontend שולח `usernameOrEmail` (camelCase) — מומר דרך `reactToApi`. אם יש חוסר התאמה, יש לבדוק transformers.

**בדיקה ידנית:**
```bash
curl -s -X POST http://127.0.0.1:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"TikTrackAdmin","password":"4181"}'
```

---

## 5. סיכום

- **Team 20:** מוכן להריץ Backend ולוודא אימות — **תלוי ב-Team 60** (חיבור DB).
- **Team 60:** תאום נדרש — פתרון חסימת תשתית (DB).

---

**Team 20 (Backend)**  
**log_entry | TEAM_20 | BATCH_2_5_QA_FIX_ACK | TO_TEAM_10 | 2026-02-13**
