# Team 10 → Team 90: משימות יישום (PROMPTS + SOP-012)

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**מקור:** `TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md`, PROMPTS FOR THE FIELD  
**סטטוס:** 📋 מנדט סריקה

---

## סיכום

האדריכלית אישרה את המלצותיכם לגבי Rich-Text והסגנונות ב־**SOP-012**. מנדט השדה שלכם: **סריקה** כדי לוודא עמידה במפרט ואיסורים.

---

## משימות (מנדט סריקה)

| מזהה | משימה | תיאור מפורט | מקור |
|------|------|-------------|------|
| **T90.1** | סריקה — אין Inline Style ב־Editor | לוודא שאף מפתח **לא משתמש ב־Inline Style** (למשל `style="..."`) **בתוך** ה־Rich-Text Editor. המותר: רק מחלקות CSS (בפרט `.phx-rt--*`). | PROMPTS, SOP-012 |
| **T90.2** | סריקה — סניטיזציה בשרת | לוודא ש־**סניטיזציה** מיושמת **בשרת** (Python) לפני שמירת תוכן Rich-Text ל-DB. חוק: רק קלאסים `phx-rt--*` מאושרים. | PROMPTS, SOP-012 §2 |

---

## דיווח

לאחר הסריקה — דוח קצר או עדכון ל־Team 10: ממצאים (אם יש חריגות), ואישור שהאיסורים נאכפים או שתוכנית תיקון הוגדרה.

---

## הפניות

- **מטריצה:** `_COMMUNICATION/team_10/TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md`
- **תשובת אדריכלית + PROMPTS:** `TEAM_10_ARCHITECT_OFFICIAL_RESPONSE_AND_PROMPTS.md`
- **SOP-012:** `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md`

---

**Team 10 (The Gateway)**
