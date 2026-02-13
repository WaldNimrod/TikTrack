# Team 10 → Team 30: בקשת Evidence — אודיט Batch 1+2

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-12  
**מקור:** TEAM_90_BATCH_1_2_DECISION_AUDIT_REPORT.md (סריקת מרגל Batch 1+2)

---

## 1. הקשר

Team 90 ביצע אודיט החלטות Batch 1+2. נדרש Evidence ממוקד מכל צוות. להלן הדרישות ל-Team 30.

---

## 2. דרישות Evidence

### 2.1 Responsive Option D — טבלאות D16/D18/D21

**דרישה:**  
הוכחה**כל** הטבלאות הרלוונטיות (D16, D18, D21) מיושמות עם **Sticky Start/End + Fluid** לפי ה-SSOT.

**SSOT:** `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md` (Option D).

**פרטים נדרשים:**
- רשימה מפורשת: **לכל טבלה** (D16 חשבונות מסחר / Account Activity, D18 עמלות, D21 Cash Flows / המרות מטבע) — ציון קבצי **HTML** (או JSX) + קבצי **CSS** + **selectors** (מחלקות/ids) שמממשים Sticky + Fluid.
- אימות שכל הטבלאות האלו משתמשות ב-classes הרלוונטיות (למשל `col-broker`, `col-trade`, `col-date` לפי `ui/src/styles/phoenix-components.css`) ואין טבלה שנותרה בלי יישום Option D.

**תוצר:** מסמך קצר (טבלה או רשימה) — טבלה → קובץ HTML/דף → קובץ CSS → selectors.

---

### 2.2 Header Persistence (Login → Home)

**דרישה:**  
הוכחה שה-**Header** לא נעלם לאחר מעבר Login → Home (בעיה היסטורית שצוינה באודיט).

**פרטים נדרשים:**
- תיאור קצר או צעדים: Login → ניווט ל-Home — האם ה-Header נטען ומוצג תמיד.
- אם בוצעה בדיקה (ידנית או E2E) — לצרף נתיב ל-Evidence או תיאור התוצאה.

**תוצר:** אישור קצר + נתיב Evidence (אם קיים) או ציון "נבדק — עובר/נכשל" עם פרטים.

---

### 2.3 D18 Fees UI — trading_account_id בלבד (אין Broker)

**דרישה:**  
אישור ש-D18 (עמלות ברוקרים) משתמש ב-**trading_account_id** בלבד ליצירה/עריכה (אין בורר Broker בשכבת UI ל־fee).

**הערה:** ידוע ש-`brokersFeesForm.js` ו-API משתמשים ב-trading_account_id; נדרש **אישור פורמלי קצר** (משפט או שניים) או הפניה לקובץ/שורות רלוונטיות.

**תוצר:** משפט אישור + אופציונלי ציון קובץ/שורות.

---

## 3. תאריך יעד ותוצר

- **תאריך יעד:** לפי תיאום עם Team 10.  
- **תוצר:** מסמך אחד ב-`_COMMUNICATION/team_30/` (או עדכון ל-Team 10) המכסה: (1) טבלת Option D לכל D16/D18/D21, (2) Header persistence, (3) D18 trading_account_id.

---

**log_entry | TEAM_10 | BATCH_1_2_EVIDENCE_REQUEST | TEAM_30 | 2026-02-12**
