# Team 10 → Team 40: משימות יישום (ADR-013 + SOP-012)

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**מקור:** `TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md`  
**סטטוס:** 📋 מנדט ביצוע

---

## סיכום

צוות 40 אחראי על Presentational ו־DNA. להלן משימות היישום הרלוונטיות מתשובת האדריכלית (ADR-013, SOP-012).

---

## משימות

| מזהה | משימה | תיאור מפורט | מקור |
|------|------|-------------|------|
| **T40.1** | SSOT כפתורים (.phx-btn) | DNA_BUTTON_SYSTEM — **הושלם**. נשאר ברשימה לאימות. | ADR-013 |
| **T40.2** | מחלקות Rich-Text ב-DNA | להגדיר ב־CSS (DNA) את ארבע המחלקות: **`.phx-rt--success`**, **`.phx-rt--warning`**, **`.phx-rt--danger`**, **`.phx-rt--highlight`** — צבעים/משתנים מהפלטה הרשמית. | SOP-012 §1 |
| **T40.3** | Design System Page — חלק תצוגה | העמוד הוא **React Type D** וכולל **טבלת Rich-Text Styles** כחלק מהעמוד (לפי SOP-012). לתת רכיב/טבלה להצגת **מילון הסגנונות** (Rich Text + כפתורים). תיאום עם Team 30 — הם מממשים את הדף ואת ה־Guard; צוות 40 מספק את המחלקות והטבלה/רכיב התצוגה. | SOP-012 §3 |

---

## קריטריוני השלמה

- **T40.2:** ארבע המחלקות מוגדרות ב־DNA (קובץ/קבצי CSS מרכזיים); צבעים תואמים לפלטה.  
- **T40.3:** רכיב/טבלה זמין ל־Team 30 להטמעה בדף Design System; מילון הסגנונות מוצג באופן עקבי.

---

## הפניות

- **מטריצה:** `_COMMUNICATION/team_10/TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md`
- **SOP-012:** `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md`
- **ADR-013:** `_COMMUNICATION/team_10/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`

---

**Team 10 (The Gateway)**
