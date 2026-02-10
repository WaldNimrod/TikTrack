# 📡 Team 10 → Team 20: תיקון Brokers Fees Create (POST 500)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend)  
**תאריך:** 2026-02-10  
**נושא:** תקלה — `POST /api/v1/brokers_fees` מחזיר 500; נדרש תיקון

---

## 1. הקשר

בדיקת ולידציה של השלמה ב' (צוות 50) אימתה תצוגת נתונים ב-D16, D18, D21. בבדיקת **פעולות CRUD ב-API** — **הוספת עמלת ברוקר (POST) נכשלה עם 500.**

---

## 2. פרטי התקלה

| פריט | ערך |
|------|------|
| **Endpoint** | `POST /api/v1/brokers_fees` |
| **סטטוס תגובה** | **500 Internal Server Error** |
| **Response body** | `{"detail":"Failed to create broker fee","error_code":"SERVER_ERROR"}` |
| **Request body (דוגמה)** | `{"broker":"QA Test Broker","commission_type":"FLAT","commission_value":"2.00","minimum":2}` |
| **קבצים רלוונטיים** | `api/routers/brokers_fees.py` (create_broker_fee), `api/services/brokers_fees_service.py` (create_broker_fee), `api/models/brokers_fees.py` |

---

## 3. השערת צוות 50 (לאבחון)

- המודל `BrokerFee` משתמש ב-`String(20)` ל-`commission_type`.
- במסד הנתונים ייתכן **ENUM** (`user_data.commission_type`) — הכנסת מחרוזת או ערך לא תואם עלולה לגרום לכשל.
- **המלצה:** לבדוק לוג שרת בעת ה-POST; לוודא התאמה בין טיפוס עמודה ב-DB (ENUM vs VARCHAR) ולוודא שה-service מעביר ערכים תואמים ל-ENUM.

---

## 4. תוצר מצופה

- **POST /api/v1/brokers_fees** מחזיר **201 Created** עם גוף תגובה תקין (כולל מזהה הרשומה).
- עדכון (PUT) ומחיקה (DELETE) — לוודא שאינן נפגעות לאחר התיקון.

---

## 5. רפרנסים

- דוח מפורט: `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1_COMPLETION_B_VALIDATION_REPORT.md` (סעיף 3.1).
- ממצאים ותיעוד: `_COMMUNICATION/team_10/TEAM_10_PHASE_1_COMPLETION_B_FINDINGS_AND_FOLLOWUP.md`.

---

**log_entry | [Team 10] | TO_TEAM_20 | BROKERS_FEES_CREATE_500_FIX | SENT | 2026-02-10**
