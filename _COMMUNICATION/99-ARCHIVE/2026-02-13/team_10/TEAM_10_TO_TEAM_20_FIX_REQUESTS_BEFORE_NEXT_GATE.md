# 🔴 Team 10 → Team 20: דרישת תיקון לפני מעבר לשער הבא (BLOCKING)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend / API)  
**תאריך:** 2026-01-30  
**סטטוס:** 🚫 **חוסם — אין מעבר לשער הבא לפני השלמת התיקון**  
**מקור מדיניות:** `TEAM_10_BLOCKING_POLICY_NO_GATE_TRANSITION_UNTIL_FIXES.md`

---

## 1. מטרת ההודעה

חובה לתקן **את כל הבעיות שזוהו** לפני מימוש מעבר לשער הבא. להלן דרישת התיקון הרלוונטית ל־Team 20 והפניה למסמך המפורט.

---

## 2. תיקון נדרש: GET /api/v1/brokers_fees/summary — 400 Bad Request

**מקור מלא:** `_COMMUNICATION/team_50/TEAM_50_GATE_B_DETAILED_ERROR_REPORT_AND_VERIFICATION_GUIDE.md` — סעיף 2.2.

**בעיה:**  
- **Endpoint:** `GET /api/v1/brokers_fees/summary`  
- **סטטוס:** 400 Bad Request  
- **השפעה:** בדף D18 (Brokers Fees) נגרם SEVERE ב־Console; בדיקות Gate B נכשלות.

**סיבת הכשל (ממצא):**  
- ה־endpoint מחזיר 400 כאשר פרמטרים חסרים או ריקים.  
- הקליינט קורא עם query params אופציונליים (למשל `broker_id`, `date_from`, `date_to`); כשהם חסרים או ריקים — השרת מחזיר 400.

**מאיפה מגיעה הקריאה:**  
- **קובץ:** `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js` (בערך שורה 100).  
- **קוד:** `sharedServices.get('/brokers_fees/summary', summaryFilters)` — GET עם query params אופציונליים.

**תיקון נדרש:**  
1. **קבצים רלוונטיים:** Router/Service של `brokers_fees` ב־Backend (למשל `api/routers/brokers_fees.py` או מקום דומה).  
2. לוודא ש־**summary**:
   - מקבל **פרמטרים אופציונליים בלבד**;
   - מחזיר **200** גם כשאין פרמטרים או שהם ריקים (תגובה תקפה, למשל רשימה ריקה או aggregate ברירת מחדל).

**אימות:**  
- קריאה: `GET /api/v1/brokers_fees/summary` (ללא query params או עם params ריקים) — תגובה **200 OK**.  
- טעינת דף D18 — ללא SEVERE מ־API; הרצת Gate B — הבדיקה עוברת.

---

## 3. דיווח השלמה

לאחר ביצוע התיקון — דיווח ל־Team 10 ב־`_COMMUNICATION/team_20/` (מסמך השלמה עם קובץ/שינוי ותוצאת אימות). Team 50 תריץ בדיקות מחדש לפי הנהלים.

---

**Team 10 (The Gateway)**  
**log_entry | FIX_REQUESTS_BEFORE_NEXT_GATE | TO_TEAM_20 | BLOCKING | 2026-01-30**
