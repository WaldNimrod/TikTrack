# 📢 Team 10 → צוותים 20 ו־30: מנדט MAPPING_MODE — מיפוי ברוקרים

**מאת:** Team 10 (The Gateway)  
**אל:** צוות 20 (Backend), צוות 30 (Frontend)  
**תאריך:** 2026-02-10  
**סטטוס:** 🔒 **חובה — שלב חסימתי לפני קידוד**  
**הקשר:** Pre‑coding Mapping (מנדט אדריכלי); ADR‑013

---

## 1. מטרה

לפני תחילת קידוד — נדרשת **מסירה משותפת** של מיפוי שדות ברוקרים, כהכנה ל־API העתידי ול־Select דינמי בטפסים (D16, D18).

---

## 2. המשימה

| פריט | תוכן |
|------|------|
| **משימה** | להפיק **מיפוי שדות ברוקרים (Singular)** — תואם ל־API **GET /api/v1/reference/brokers** (ADR‑013) ו־לשדות Select בטפסים D16 (Trading Accounts), D18 (Brokers Fees). |
| **מסירה** | קובץ **`DATA_MAP_FINAL.json`** |
| **מקום הגשה** | `_COMMUNICATION/team_20/DATA_MAP_FINAL.json` (צוות 10 יאחד ל־SSOT אם יוגשו שני קבצים) |
| **תוכן מצופה** | מיפוי בשם JSON: רשימת ברוקרים/ערכים תקפים לשדה `broker`; תאימות לחוזה ה־API; שדות בטפסים D16/D18 שמוזנים ממקור זה. שמות ב־Singular אם רלוונטי. |

---

## 3. חלוקת אחריות (המלצה)

- **צוות 20:** חוזה ה־API (GET /api/v1/reference/brokers), סכמת התגובה, שמות שדות.
- **צוות 30:** מיפוי השדות ב־UI (אילו טפסים/שדות מוזנים מהרשימה).

ניתן להגיש **קובץ אחד משותף** או שני קבצים — Team 10 יאחד ל־SSOT.

---

## 4. רפרנסים

- **תוכנית עבודה:** `_COMMUNICATION/team_10/TEAM_10_VISUAL_GAPS_WORK_PLAN.md` (משימה 1, שלב 2).
- **החלטת אדריכל (ADR‑013):** Broker List = **GET /api/v1/reference/brokers** — `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`.
- **מנדט מיפוי:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PRE_CODING_MAPPING_MANDATE.md`.
- **חלוקת משימות מלאה:** `_COMMUNICATION/team_10/TEAM_10_MAPPING_MODE_TASK_DISTRIBUTION.md`.

---

## 5. לאחר המסירה

- Team 10 יבדוק שלמות ויכלול את הקובץ באישור המיפוי (נמרוד).
- **רק לאחר אישור ויזואלי** — יתאפשר קידוד (מימוש API בצוות 20, חיבור Select בטפסים בצוות 30).

---

**Team 10 (The Gateway)**  
**log_entry | MAPPING_MODE_MANDATE_20_30 | ISSUED | 2026-02-10**
