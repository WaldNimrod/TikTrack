# ✅ Team 10 → Team 20: הכרה בתיקון + מקור דוגמאות 422

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend)  
**תאריך:** 2026-01-30  
**סטטוס:** 📋 **הכרה + הנחיה**  
**מקור החלטות:** `TEAM_10_DECISIONS_401_422_COORDINATION.md`

---

## 1. הכרה בתיקון brokers_fees/summary

**Team 10 מכיר** בדוח `TEAM_20_TO_TEAM_10_BLOCKING_FIX_COMPLETE.md`:

- **GET /api/v1/brokers_fees/summary** — תוקן ואומת ב־6 תרחישים (200 OK עם/בלי פרמטרים, פרמטרים ריקים, broker_id, page/page_size, פרמטר לא מוכר).  
- Route order ו־Query(default=None), נורמליזציה של empty strings, broker_id כ־include_in_schema=False — מאומתים.  
- **התיקון מאומת ומוכן לבדיקה חוזרת.**  
- Team 50 תבצע אימות מחדש של Gate A (כולל השפעה על SEVERE) לפי הנחיית Team 10.

---

## 2. 401 Unauthorized — אין פעולה נדרשת מ־Team 20

תיקון ה־401 בוצע **בפרונט** (Team 30) — DataStage + Shared_Services. Team 20 לא נדרש לתיקון. אימות מחדש יבוצע על ידי Team 50.

---

## 3. דוגמאות 422 (Register) — מקור ה־request body

**החלטת Team 10 — מי מספק דוגמאות:**

| מקור | תיאור |
|------|--------|
| **Team 50 (ראשי)** | בזמן בדיקה — כש־422 מופיע, יתעדו request body מ־Network tab וימסרו ל־Team 10/20. |
| **Team 30 (משלים)** | תיעוד במסמך של פורמט ה־payload שהפרונטאנד שולח ב־Register + Handoff ל־Team 20 עם קישור. |
| **Team 20 (אופציונלי)** | להוסיף logging ב־Backend כדי לתעד את ה־request הנכנס כש־422 חוזר — לנוחות עתידית; **לא חוסם**. |

**מסקנה:** דוגמאות ה־request body יסופקו על ידי Team 50 (בזמן בדיקה) ו/או Team 30 (תיעוד payload). Team 20 יכול להמתין למסמך/לכידה, או להוסיף לוגינג בצד שרת כ־fallback.

---

## 4. תאום — Handoff מ־Team 30

Team 10 הנחה את Team 30 לשלוח **Handoff** ל־Team 20:
- עדכון שתיקון 401 בוצע (פרונט).  
- Team 30 מספק תיעוד של register payload — קישור למסמך.

לאחר קבלת Handoff ותיעוד ה־payload — ניתן לטפל ב־422 בהתאם (ולידציה, שדות חובה, וכו').

---

## 5. סיכום

- **brokers_fees/summary:** מאומת; מוכן לבדיקה חוזרת.  
- **401:** לא נדרש תיקון מ־Team 20; אימות מחדש ב־Team 50.  
- **422:** דוגמאות request body יסופקו על ידי Team 50 (לכידה) ו/או Team 30 (תיעוד); אופציונלי — לוגינג ב־Backend.

---

**Team 10 (The Gateway)**  
**log_entry | ACKNOWLEDGMENT_422_SOURCE | TO_TEAM_20 | 2026-01-30**
