# Team 10 → Team 20: משימות יישום (ADR-013 + SOP-012)

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**מקור:** `TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md`  
**סטטוס:** 📋 מנדט ביצוע

---

## סיכום

צוות 20 אחראי על Backend. להלן משימות היישום הרלוונטיות מתשובת האדריכלית (ADR-013, SOP-012).

---

## משימות

| מזהה | משימה | תיאור מפורט | מקור |
|------|------|-------------|------|
| **T20.1** | GET /api/v1/reference/brokers | Endpoint פעיל — **הושלם**. נשאר ברשימה לאימות ותיעוד. | ADR-013 |
| **T20.2** | סניטיזציה בשרת (Rich-Text) | ליישם **סניטייזר ב־Python** לכל תוכן Rich-Text לפני שמירה ל-DB. **חוק:** רק תגיות/תכונות מאושרות; **רק קלאסים שמתחילים ב־`phx-rt--`** מאושרים. תיאום עם Team 30 (DOMPurify בצד לקוח). | SOP-012 §2 |
| **T20.3** | אימות BE לשדות HTML | **אימות רשמי:** לאשר שה־HTML המסונן **נשמר במלואו** ל-DB **ולא נחתך** (אורך, encoding, שמירת תגיות/קלאסים מאושרים). | SOP-012 §2 |
| **T20.4** | (עתידי) user_tier / required_tier | כשהמוצר ידרוש — לתמוך בשדות **user_tier** ו־**required_tier** ב־JWT ו־contract. | ADR-013 §3 |

---

## קריטריוני השלמה

- **T20.2:**  
  - סניטייזר רץ על כל שדה rich-text שנשמר (למשל description/notes).  
  - רק קלאסים `phx-rt--*` נשמרים; שאר תגיות/סגנונות מוסרים או מנורמלים.  
  - תיעוד קצר (או הערה ב־API) על מדיניות הסניטיזציה.
- **T20.3:**  
  - וידוא ששדות ה־HTML (לאחר סניטיזציה) נשמרים **במלואם** — ללא חיתוך (length/DB column), ללא שיבוש encoding.  
  - תיעוד או בדיקה שמאשרת round-trip: שמירה → קריאה → תצוגה זהה.

---

## הפניות

- **מטריצה:** `_COMMUNICATION/team_10/TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md`
- **SOP-012 מלא:** `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md`
- **Allowlist FE (תאימות BE):** `_COMMUNICATION/team_10/SOP_012_DOMPURIFY_ALLOWLIST.md` — תגיות/attributes מותרים; יישור רק ב-class.
- **ADR-013:** `_COMMUNICATION/team_10/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`

---

**Team 10 (The Gateway)**
