# Team 30 | אישור קלט — MB3A Build Notes (D35)

**from:** Team 30 (Frontend)  
**date:** 2026-02-15  
**re:** פרומט מעודכן מ-Team 10 + תאום Team 40

---

## 1. אישור הפעלה

Team 30 מאשרים קבלת:
- **פרומט מעודכן:** [TEAM_10_TO_TEAM_30_40_MB3A_NOTES_PROMPTS_UPDATED.md](../team_10/TEAM_10_TO_TEAM_30_40_MB3A_NOTES_PROMPTS_UPDATED.md)
- **קלט Gate-0:** [TEAM_31_TO_TEAM_10_MB3A_GATE0_NOTES_SCOPE_INPUT.md](../team_31/TEAM_31_TO_TEAM_10_MB3A_GATE0_NOTES_SCOPE_INPUT.md)
- **תאום Team 40:** [TEAM_40_TO_TEAM_30_MB3A_BUILD_NOTES_COORDINATION.md](../team_40/TEAM_40_TO_TEAM_30_MB3A_BUILD_NOTES_COORDINATION.md)
- **Blueprint:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/notes_BLUEPRINT.html`

סדר ביצוע: **Notes ראשון; Alerts רק אחרי סגירת Gate-KP Notes.**

---

## 2. חלוקת אחריות (SLA 30/40 — מאושר)

| צוות | אחריות |
|------|--------|
| **Team 30** | אינטגרציה UI, עורך Rich Text, העלאת קבצים, חסימות UI (סוג/גודל/מכסה 3), לוגיקה, `data-action`. תאום עם 31, 20, 40. |
| **Team 40** | סטיילינג ו-Assets — CSS, classes, עקביות ל-phoenix-base/components/header/D15_DASHBOARD. |

---

## 3. נקודות תאום

### 3.1 כפתורי סינון
- **Team 40:** מספקים כיתות CSS לכפתורי הסינון.
- **Team 30:** מחליף inline styles ב-markup בכיתות ש־40 מספקים (לפי TT2_BLUEPRINT_HANDOFF_REQUIREMENTS).
- נעדכן markup כשהכיתות מוכנות.

### 3.2 מקורות סטייל
phoenix-base.css, phoenix-components.css, phoenix-header.css, D15_DASHBOARD_STYLES.css.

### 3.3 D35 Lock (Rich Text + Attachments)
- עורך Rich Text, העלאת קבצים (עד 3, 1MB, MIME, סניטיזציה).
- מנדט: [TEAM_10_TO_TEAM_30_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md](../team_10/TEAM_10_TO_TEAM_30_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md)
- תאום עם Team 20 (API), Team 60 (DB/אחסון).

---

## 4. סקופ מימוש

| פריט | תיאור |
|------|--------|
| **מבנה** | LEGO — page-wrapper → tt-container → tt-section |
| **סקשנים** | (1) סיכום — סה"כ הערות, פעילות, חדשות, מוצמדות, תגיות, טיקרים, טריידים; (2) ניהול הערות — טבלה + סינונים |
| **טבלה** | תוכן (תצוגה מקוצרת), קשור ל־, תאריך, פעולות |
| **סינונים** | כפתורי פילטר לפי טיפוס (חשבונות, טריידים, תוכניות, טיקרים וכו') |
| **כפתור הוספה** | בכותרת הסקשן |
| **data-action** | ללא inline scripts — לוגיקה חיצונית |

---

## 5. תלויות

| צוות | תלות |
|------|------|
| **31** | Blueprint סופי; מסירה ל-30 |
| **20** | API notes + note_attachments; GET/PATCH; ולידציות MIME/גודל/מכסה |
| **60** | Migration; אחסון קבצים |
| **40** | כיתות לכפתורי סינון; סטיילינג |

---

## 6. סגירה

סגירה: **רק עם Seal (SOP-013)** — לפי נוהל.

**log_entry | TEAM_30 | MB3A_BUILD_NOTES_ACK | 2026-02-15**
