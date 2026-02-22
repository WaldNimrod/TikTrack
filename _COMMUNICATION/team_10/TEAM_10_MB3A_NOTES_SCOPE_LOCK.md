# MB3A Notes — Scope Lock (Gate-0)
**project_domain:** TIKTRACK

**id:** TEAM_10_MB3A_NOTES_SCOPE_LOCK  
**owner:** Team 10 (The Gateway)  
**date:** 2026-02-16  
**מקור:** TEAM_31_TO_TEAM_10_MB3A_GATE0_NOTES_SCOPE_INPUT.md; TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md (תוצרי Gate-0 מחייבים)

---

## 1. מזהה ו-SSOT

| פריט | ערך |
|------|-----|
| **מזהה SSOT** | D35 |
| **Route** | notes |
| **תיאור** | הערות |
| **תפריט** | נתונים → הערות |

---

## 2. Blueprint (נעול)

| פריט | ערך |
|------|-----|
| **קובץ Blueprint** | _COMMUNICATION/team_31/team_31_staging/sandbox_v2/notes_BLUEPRINT.html |
| **אינדקס סאנדבוקס** | sandbox_v2/index.html — "הערות (notes) - Blueprint"; סטטוס: הושלם ואושר |

---

## 3. סקופ (נעול)

- **מבנה:** LEGO — page-wrapper → page-container → main → tt-container → tt-section.
- **סקשנים:** (1) סיכום/אינפו; (2) ניהול הערות — טבלה + סינונים.
- **טבלה:** תוכן (תצוגה מקוצרת), קשור ל־(ישות/טיפוס), תאריך, פעולות.
- **סינונים:** כפתורי פילטר לפי טיפוס; כפתור הוספה.
- **סגנונות:** phoenix-base, phoenix-components, phoenix-header, D15_DASHBOARD; data-action ללא inline scripts. במסירה — כפתורי סינון: מעבר מ-inline styles ל-classes (TT2_BLUEPRINT_HANDOFF_REQUIREMENTS).

---

## 4. גבול D35 Lock (משימת-על)

Rich Text + Attachments (עד 3 קבצים, 1MB, MIME magic-bytes, סניטיזציה שרת) — **לא חלק מהבלופרינט**; באחריות 20/30/60 לפי מנדטי D35.  
SSOT: DDL, OpenAPI Addendum, RICH_TEXT_SANITIZATION_POLICY.

---

## 5. יישור SSOT / Page Tracker

- **TT2_PAGES_SSOT_MASTER_LIST.md:** D35 — בלופרינט ✅ קיים; אפיון קיים (Blueprint מסופק; D35 Lock במנדטים 20/30/60).
- **TT2_OFFICIAL_PAGE_TRACKER.md:** D35 רשום; סטטוס עד Gate-B/Gate-KP.

---

**סגירה:** Gate-0 Notes ננעל עם מסמך זה ועדכון SSOT + Page Tracker. שינוי סקופ — רק באישור G-Lead.  
**log_entry | TEAM_10 | MB3A_NOTES_SCOPE_LOCK | GATE_0_CLOSED | 2026-02-16**
