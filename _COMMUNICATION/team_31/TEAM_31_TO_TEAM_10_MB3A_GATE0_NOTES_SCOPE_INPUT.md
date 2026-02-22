# Team 31 → Team 10: MB3A Gate-0 Notes — מידע לעמוד הערות (D35)
**project_domain:** TIKTRACK

**from:** Team 31 (Blueprint)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-16  
**re:** TEAM_10_MB3A_NOTES_ALERTS_CONTEXT_AND_ACTIVATION_PROMPTS — Gate-0 Notes (D35)  
**משימה:** נעילת סקופ/SSOT ל-D35; תיאום ליצירת TEAM_10_MB3A_NOTES_SCOPE_LOCK.md ועדכון SSOT + Page Tracker

---

## 1. אישור הפעלה

Team 31 מאשרים הפעלה ל-**Gate-0 Notes (MB3A)**. סדר ביצוע: Notes ראשון, Alerts רק אחרי סגירת Notes.

---

## 2. מיקום ותוצרים קיימים (D35 — עמוד הערות)

| פריט | מיקום / ערך |
|------|-------------|
| **מזהה SSOT** | D35 |
| **Route** | notes |
| **תיאור** | הערות |
| **תפריט** | נתונים → הערות |
| **קובץ Blueprint** | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/notes_BLUEPRINT.html` |
| **אינדקס סאנדבוקס** | `sandbox_v2/index.html` — שורה "הערות (notes) - Blueprint" | סטטוס: ✅ הושלם ואושר |

---

## 3. תוכן הבלופרינט (סקופ ויזואלי/מבנה)

- **מבנה עמוד:** `page-wrapper` > `page-container` > `main` > `tt-container` > `tt-section` (LEGO).
- **סקשנים:** (1) סיכום/אינפו (סה"כ הערות, פעילות, חדשות, מוצמדות, תגיות, טיקרים, טריידים); (2) ניהול הערות — טבלה + סינונים.
- **טבלה:** עמודות — תוכן (תצוגה מקוצרת), קשור ל־(ישות/טיפוס), תאריך, פעולות (תפריט פעולות אופקי RTL).
- **סינונים:** כפתורי פילטר לפי טיפוס (חשבונות, טריידים, תוכניות, טיקרים וכו').
- **כפתור הוספה:** הוספת הערה (מיקום בכותרת הסקשן).
- **סגנונות:** קישור ל־`phoenix-base.css`, `phoenix-components.css`, `phoenix-header.css`, `D15_DASHBOARD_STYLES.css`; שימוש ב־`phoenix-table`, badges, pagination.
- **אינטראקציה:** `data-action` / `data-filter-type` וכו' — ללא סקריפטים inline (Clean Slate); לוגיקה חיצונית בידי Team 30.

**הערה:** בבלופרינט הנוכחי ייתכן שימוש ב־inline styles בכפתורי סינון; במסירה ל-Build (31→30/40) יש להעביר לכתות CSS בהתאם ל־TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.

---

## 4. גבול סקופ — D35 Lock (Rich Text + Attachments)

- **משימת-על D35_RICH_TEXT_ATTACHMENTS_LOCK** (עורך Rich Text, עד 3 קבצים/הערה, 1MB/קובץ, MIME magic-bytes, סניטיזציה בשרת) — **אינה חלק מהבלופרינט**.
- הבלופרינט מספק **מבנה עמוד וטבלת רשימת הערות** (תצוגה, סינון, פעולות).  
- **עורך Rich Text והעלאת קבצים** — באחריות Team 30/20/60 לפי TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md §5 ומנדטי D35; תאום עם 31 רק אם נדרש עדכון מבנה/סקופ ב-Blueprint.

---

## 5. המלצה לעדכון SSOT / Page Tracker (Gate-0)

| מסמך | עדכון מוצע |
|------|------------|
| **TT2_PAGES_SSOT_MASTER_LIST.md** | בסעיף 2.5 נתונים (Data): D35 — **בלופרינט?** מ־"✅ נדרש" ל־**"✅ קיים"**; **אפיון** מ־"**נדרש אפיון**" ל־**"קיים (Blueprint מסופק; D35 Lock — Rich Text/Attachments — במנדטים 20/30/60)"**. |
| **TT2_OFFICIAL_PAGE_TRACKER.md** | D35 — סטטוס: להגדיר בהתאם למדיניות (למשל 2. UNDER_DESIGN או 3. IN PROGRESS) עד סגירת Build + Gate-A; צוות אחראי Blueprint: 31; מימוש: 30/40. |

---

## 6. תיאום עם Team 10

- **תוצר Gate-0 מצד 31:** מסמך זה — מידע לסקופ ו-SSOT.
- **תוצר מצופה מ-Team 10:** יצירת `TEAM_10_MB3A_NOTES_SCOPE_LOCK.md` (בתיאום עם תוכן זה); עדכון `documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md` ו־Page Tracker לפי נוהל.
- **סגירה:** רק עם Seal (SOP-013) כפי שמפורט בתוכנית.

---

## 7. הפניות

| מסמך | נתיב |
|------|------|
| תוכנית עבודה | _COMMUNICATION/team_10/TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md |
| פרומט הפעלה Gate-0 | _COMMUNICATION/team_10/TEAM_10_MB3A_NOTES_ALERTS_CONTEXT_AND_ACTIVATION_PROMPTS.md |
| דרישות מסירת Blueprint | documentation/05-PROCEDURES/TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.md |
| SSOT עמודים | documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md |
| אינדקס סאנדבוקס | _COMMUNICATION/team_31/team_31_staging/sandbox_v2/index.html |

---

**log_entry | TEAM_31 | TO_TEAM_10 | MB3A_GATE0_NOTES_SCOPE_INPUT | 2026-02-16**
