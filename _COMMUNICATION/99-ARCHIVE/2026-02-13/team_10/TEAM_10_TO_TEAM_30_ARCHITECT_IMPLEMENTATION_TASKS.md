# Team 10 → Team 30: משימות יישום (ADR-013 + SOP-012)

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**מקור:** `TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md`  
**סטטוס:** 📋 מנדט ביצוע

---

## סיכום

צוות 30 אחראי על Bridge, Containers ו־FE Logic. להלן משימות היישום מתשובת האדריכלית (ADR-013, SOP-012) והתוכנית המאוחדת.

---

## משימות

| מזהה | משימה | תיאור מפורט | מקור |
|------|------|-------------|------|
| **T30.1** | Broker Select | שימוש ב־**GET /api/v1/reference/brokers** בטפסים D16, D18, D21 — dynamic select; value/label לפי DATA_MAP_FINAL. | ADR-013, משימה 1 בתוכנית |
| **T30.2** | Rich-Text Editor (TipTap) | להחליף textarea ב־**TipTap** (Starter Kit + Link + TextStyle + Attributes) בשדות description/notes. | ADR-013, SOP-012 |
| **T30.3** | כפתור "סגנון" (Styles) | להזריק רק מחלקות DNA: `.phx-rt--success`, `.phx-rt--warning`, `.phx-rt--danger`, `.phx-rt--highlight`. **אסור Inline Style** בתוך ה־Editor. | SOP-012 §1, PROMPTS (Team 90 סריקה) |
| **T30.4** | סניטיזציה FE | שימוש ב־**DOMPurify** עם **Allowlist מפורש** — תגיות מותרות, attributes מותרים, יישור רק ב-class (אין `style`). **חובה:** רשימה ב־`SOP_012_DOMPURIFY_ALLOWLIST.md`. | SOP-012 §2 |
| **T30.5** | דף Design System (Type D) | העמוד הוא **React Type D**; **כולל טבלת Rich-Text Styles** כחלק מהעמוד (מילון הסגנונות לפי SOP-012). Guard לפי JWT role. תיאום עם Team 40 (מחלקות/טבלה). | SOP-012 §3, ADR-013 |
| **T30.6** | מודל A/B/C/D (אם טרם הושלם) | Redirect C→Home, Type B שני containers, User Icon success/warning — לפי Work Plan §4. | ADR-013 §1 |

---

## קריטריוני השלמה

- **T30.2:** TipTap מותקן ומופעל בשדות description/notes במודולים הרלוונטיים.  
- **T30.3:** כפתור Styles מוסיף רק את ארבע המחלקות; אין `style="..."` בתוכן.  
- **T30.4:** DOMPurify רץ על פלט ה־Editor; Allowlist לפי `SOP_012_DOMPURIFY_ALLOWLIST.md` (תגיות, attributes, יישור רק ב-class).
- **T30.5:** העמוד React Type D; רק משתמש עם role מתאים רואה את הדף; **טבלת Rich-Text Styles** מוצגת כחלק מהעמוד (מילון הסגנונות per SOP-012).

---

## הפניות

- **מטריצה:** `_COMMUNICATION/team_10/TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md`
- **SOP-012:** `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md`
- **Allowlist מפורש ל-DOMPurify:** `_COMMUNICATION/team_10/SOP_012_DOMPURIFY_ALLOWLIST.md`
- **ADR-013:** `_COMMUNICATION/team_10/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`
- **תוכנית עבודה:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md`

---

**Team 10 (The Gateway)**
