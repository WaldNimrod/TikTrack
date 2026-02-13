# Team 10 → כל הצוותים: התנעת יישום תשובת האדריכלית (ADR-013 + SOP-012)

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**סטטוס:** 📋 הודעת התנעה — משימות יישום מחולקות לצוותים

---

## 1. הקשר

תשובת האדריכלית הרשמית (ADR-013, SOP-012) ופקודות השדה (PROMPTS FOR THE FIELD) פורטו ל־**משימות יישום קונקרטיות** וחולקו לצוותים. יש לבצע את המשימות לפי המנדטים הנפרדים לכל צוות.

---

## 2. מסמך מרכזי — מטריצת משימות

**מיקום:** `_COMMUNICATION/team_10/TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md`

- מכיל את **כל** משימות היישום לפי צוות (10, 20, 30, 40, 50, 90).
- מזהה משימות (T10.x, T20.x, …), מקור (ADR-013 / SOP-012 / PROMPTS), וסטטוס (הושלם / פעיל / עתידי).

---

## 3. מסמכי מנדט לכל צוות

| צוות | מסמך מנדט | תוכן עיקרי |
|------|-----------|-------------|
| **Team 10** | `TEAM_10_OWN_ARCHITECT_IMPLEMENTATION_TASKS.md` | MAPPING_REQUIRED, אי־אישור קוד ללא מיפוי, הפצה, Evidence Log |
| **Team 20** | `TEAM_10_TO_TEAM_20_ARCHITECT_IMPLEMENTATION_TASKS.md` | סניטיזציה בשרת (Python, רק phx-rt--*); Brokers API הושלם; עתיד user_tier |
| **Team 30** | `TEAM_10_TO_TEAM_30_ARCHITECT_IMPLEMENTATION_TASKS.md` | Broker Select, TipTap, כפתור Styles, DOMPurify, דף Design System (Type D), A/B/C/D |
| **Team 40** | `TEAM_10_TO_TEAM_40_ARCHITECT_IMPLEMENTATION_TASKS.md` | מחלקות .phx-rt--* ב-DNA; רכיב/טבלה לדף Design System; .phx-btn הושלם |
| **Team 50** | `TEAM_10_TO_TEAM_50_ARCHITECT_IMPLEMENTATION_TASKS.md` | שער ב' / Regression — API, Rich-Text, סניטיזציה; אימות Type D (/admin/design-system) |
| **Team 90** | `TEAM_10_TO_TEAM_90_ARCHITECT_IMPLEMENTATION_TASKS.md` | סריקה: אין Inline Style ב־Editor; סניטיזציה בשרת |

---

## 4. פעולה נדרשת מכל צוות

1. **לקרוא** את המסמך המנדט הייעודי שלכם (לעיל).
2. **לבצע** את המשימות המפורטות במסמך; משימות שכבר הושלמו — להשאיר בתיעוד.
3. **לדווח** השלמה/חריגות לפי הנהלים הרגילים (דוחות ל־Team 10 ו/או Team 90 כפי שנקבע).

---

## 5. תיקוני דיוק לפני הפצה (בוצעו)

- **Allowlist מפורש ל-DOMPurify:** קובץ `SOP_012_DOMPURIFY_ALLOWLIST.md` — תגיות מותרות, attributes מותרים, יישור רק ב-class (אין `style`).
- **אימות BE לשדות HTML:** משימה **T20.3** — לאשר ש־HTML המסונן נשמר במלואו ל-DB ולא נחתך.
- **Design System Page:** ברור במטריצה ובמנדטים — העמוד React Type D; כולל **טבלת Rich-Text Styles** כחלק מהעמוד (SOP-012).

---

## 6. הפניות

- **תשובת אדריכלית + מיקום מקומי:** `TEAM_10_ARCHITECT_OFFICIAL_RESPONSE_AND_PROMPTS.md`
- **Allowlist DOMPurify:** `SOP_012_DOMPURIFY_ALLOWLIST.md`
- **ADR-013:** `ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`
- **SOP-012:** `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md`
- **תוכנית עבודה:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md`

---

**Team 10 (The Gateway)**  
**log_entry | ARCHITECT_IMPLEMENTATION_KICKOFF | 2026-02-10**
