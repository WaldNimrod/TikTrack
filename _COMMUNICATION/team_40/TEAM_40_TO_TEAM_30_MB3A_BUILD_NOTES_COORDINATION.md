# Team 40 → Team 30: תאום Build Notes (MB3A, D35)
**project_domain:** TIKTRACK

**from:** Team 40 (UI Assets & Design)  
**to:** Team 30 (UI Integration)  
**date:** 2026-02-15  
**re:** MB3A Build Notes — עמוד הערות (notes.html, D35)  
**מקור:** [TEAM_10_TO_TEAM_30_40_MB3A_NOTES_PROMPTS_UPDATED.md](../team_10/TEAM_10_TO_TEAM_30_40_MB3A_NOTES_PROMPTS_UPDATED.md), [TEAM_10_MB3A_NOTES_ALERTS_CONTEXT_AND_ACTIVATION_PROMPTS.md](../team_10/TEAM_10_MB3A_NOTES_ALERTS_CONTEXT_AND_ACTIVATION_PROMPTS.md)

---

## 1. אישור קלט והפעלה

Team 40 מאשרים קבלת הפרומט המעודכן ל-**Build Notes** (קלט Gate-0 מ-Team 31). קראנו את:

- `_COMMUNICATION/team_31/TEAM_31_TO_TEAM_10_MB3A_GATE0_NOTES_SCOPE_INPUT.md`
- Blueprint: `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/notes_BLUEPRINT.html`

מבנה עבודה: **Notes ראשון; Alerts רק אחרי סגירת Gate-KP Notes.**

---

## 2. חלוקת אחריות (SLA 30/40)

| צוות | אחריות |
|------|--------|
| **Team 30** | אינטגרציה UI — מימוש לפי Blueprint, עורך Rich Text, העלאת קבצים, חסימות UI (סוג/גודל/מכסה 3). תאום עם 31 ו-20. לוגיקה ו־data-action. |
| **Team 40** | UI Assets וסטיילינג — CSS, classes, עקביות ל־phoenix-base/components/header/D15_DASHBOARD. **ללא** לוגיקה או API. |

גבול D35 Lock (Rich Text + Attachments): באחריות 20/30/60; אנחנו מתאימים איתכם על מראה וסטיילינג בלבד.

---

## 3. נקודות תאום

### 3.1 כפתורי סינון (Filter buttons)

לפי Gate-0 ו־TT2_BLUEPRINT_HANDOFF_REQUIREMENTS: בבלופרינט ייתכן inline styles בכפתורי סינון; **במסירה יש להעביר ל-classes**.

- **Team 40:** נספק/נגדיר **כיתות CSS** לכפתורי הסינון (במסגרת phoenix-components או קובץ ייעודי לעמוד) ונעדכן אתכם בשם הכיתות.
- **Team 30:** החלפת inline styles ב-markup ל־classes שאנחנו מספקים.

נעדכן אתכם ברגע שיהיו כיתות מוכנות (או נסכם מול הבלופרינט אם כבר קיימות כיתות מתאימות).

### 3.2 מקורות סטייל

נשתמש ב־`phoenix-base.css`, `phoenix-components.css`, `phoenix-header.css`, `D15_DASHBOARD_STYLES.css` כפי שמפורט בבלופרינט. כל תוספת לעמוד הערות — classes בלבד, ללא inline.

### 3.3 סנכרון

- עובדים מאותו Blueprint ואותו Scope Lock (לאחר ש־Team 10 יפרסם TEAM_10_MB3A_NOTES_SCOPE_LOCK.md).
- סגירה: **רק עם Seal (SOP-013)** — כל צוות מסגיר את חלקו ב-Seal נפרד לפי נוהל.

---

## 4. סיכום

אנחנו מוכנים ל-Build Notes מצד סטיילינג ו-Assets. מתאמים איתכם: כיתות לכפתורי סינון, ומראה עקבי ל־D35. לכל שאלה או צורך בכיתות נוספות — כאן או בתגובה למסמך זה.

**log_entry | TEAM_40 | TO_30 | MB3A_BUILD_NOTES_COORDINATION | 2026-02-15**
