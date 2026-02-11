# Team 10 → Team 50: משימות יישום (ADR-013 + SOP-012)

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**מקור:** `TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md`  
**סטטוס:** 📋 מנדט ביצוע

---

## סיכום

צוות 50 אחראי על QA. להלן משימות האימות/בדיקה הרלוונטיות לתשובת האדריכלית (ADR-013, SOP-012).

---

## משימות

| מזהה | משימה | תיאור מפורט | מקור |
|------|------|-------------|------|
| **T50.1** | שער ב' / Regression | במסגרת **שער ב'** (או regression): לוודא — (א) רשימת ברוקרים נטענת מ־**API** (GET /api/v1/reference/brokers) בטפסים; (ב) **Rich-Text** ללא שימוש ב־Inline Style בתוך ה־Editor; (ג) **סניטיזציה** פועלת (FE + BE). | ADR-013, SOP-012 |
| **T50.2** | Design System (Type D) | לוודא ש־**/admin/design-system** נגיש **רק** למשתמש עם תפקיד מנהל; אורח או משתמש ללא role מתאים מופנה (redirect/403). | ADR-013 §1 (טיפוס D) |

---

## קריטריוני השלמה

- **T50.1:** תיעוד/צ'קליסט או תרחישי E2E שמכסים broker list מ־API, Rich-Text styles בלבד (לא inline), וסניטיזציה.  
- **T50.2:** תרחיש בדיקה: גישה עם מנהל → דף נטען; גישה כ־אורח/לא־מנהל → הפניה.

---

## הפניות

- **מטריצה:** `_COMMUNICATION/team_10/TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md`
- **ADR-013:** `_COMMUNICATION/team_10/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`
- **תוכנית שערים:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md`, נהלי Team 50

---

**Team 10 (The Gateway)**
