# נוהל עבודה פנימי — Team 30 (Frontend Standards)

**id:** `TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE`  
**owner:** Team 30 (Frontend)  
**status:** 🔒 **MANDATORY — Internal QA**  
**תאריך יצירה:** 2026-01-31  
**מבוסס על:** D16_MODULE_REFERENCE_SSOT, ARCHITECT_MODULE_MENU_STYLING_SSOT

---

## 1. מטרה

נוהל זה מגדיר **בדיקות חובה** לכל עמוד/רכיב חדש או מתוחזק, לשמירה על **סטנדרטים מדויקים ואחידות** בכל המערכת. הבדיקות מבוצעות **לפני** העברת העבודה ל-Team 10/50.

---

## 1.1 כללים מחייבים — ללא יוצא מן הכלל

**חובה לוודא מול נוהל זה כל ביצוע וכל ממשק — קיים או חדש.**

| # | כלל | תיאור |
|---|-----|--------|
| **R1** | **רספונסיביות טבלאות** | כל טבלה חייבת לעמוד בדרישות הרספונסיביות: `phoenix-table-wrapper` עם `overflow-x: auto`, עמודות עם `clamp()` לפי TT2_RESPONSIVE_FLUID_DESIGN, Option D (Sticky). ראה ARCHITECT_TABLE_RESPONSIVITY_DECISIONS. |
| **R2** | **רספונסיביות ממשק** | **כל** הממשקים ללא יוצא מהכלל חייבים להיות רספונסיביים — layout, טיפוגרפיה, ריווח. |
| **R3** | **עמודת פעולות — בלי כותרת** | לעמודת פעולות (`col-actions`) **אף פעם** אין כותרת גלויה. שימוש ב-`<span class="phoenix-table__header-text sr-only">פעולות</span>` או דומה (טקסט ל-screen readers בלבד). כלל קבוע לכל העמודים — מקטין רוחב נדרש. |

---

## 1.5 כלל ברזל — עדיפות מחלקות CSS (חובה)

בכל עמוד או ממשק:

| עדיפות | פעולה | תיאור |
|--------|-------|--------|
| **1** | מחלקות ברירת מחדל או ללא מחלקה | אלמנטים סטנדרטיים (input, select, button, form-group) — ללא class או עם class בסיסי. העיצוב מ־phoenix-base / element selectors |
| **2** | מחלקה קיימת | נדרש סגנון שונה — **תחילה** לחפש מחלקה קיימת בשימוש בממשקים אחרים (index-section__*, phoenix-table-*, form-group וכו') |
| **3** | מחלקה חדשה — רק במידת הצורך | רק כשיש **הבדל מהותי** ואין מחלקה מתאימה — ליצור מחלקה חדשה. **לבדוק תמיד** ב־CSS_CLASSES_INDEX ובקוד לפני יצירה |

**דוגמאות:**  
✅ עדיפות 1: `<select class="index-section__header-filter-select">` (מחלקה קיימת); `<input>` ללא מחלקה.  
✅ עדיפות 2: `<div class="form-group">` (קיים במודולים).  
❌ מיותר: מחלקה חדשה כשקיימת מתאימה (למשל `index-section__header-filter-select` במקום `data-integrity-select`).

**מקור:** _COMMUNICATION/team_30/TEAM_30_CSS_CLASS_PRIORITY_IRON_RULE_PROPOSAL.md (קידום Team 10).

---

## 2. Checklist — עמודים עם page-wrapper + tt-container

### 2.1 Page Layout

| # | בדיקה | סטנדרט | רפרנס |
|---|-------|--------|--------|
| 1 | מבנה עמוד | `page-wrapper > page-container > main` | phoenix-base.css |
| 2 | יישור תוכן | `main` משתמש ב-`justify-content: flex-start` — תוכן צמוד למעלה גם כשכל הסקציות סגורות | phoenix-base.css L~542 |

### 2.2 Info Summary (אם קיים)

| # | בדיקה | סטנדרט | רפרנס |
|---|-------|--------|--------|
| 3 | שורה ראשונה | תוכן עטוף ב-`info-summary__content`; כפתור toggle בסוף השורה | phoenix-components.css |
| 4 | שורה שנייה | תוכן עטוף ב-`info-summary__content`; אותו gap (`--spacing-lg`) כמו שורה ראשונה | phoenix-components.css |
| 5 | מבנה HTML/JSX | אין span/div ישירים תחת `info-summary__row` — תמיד דרך `info-summary__content` | D16 SSOT §7 |

### 2.3 Section Toggle

| # | בדיקה | סטנדרט | רפרנס |
|---|-------|--------|--------|
| 6 | עמוד עם ≤3 tt-section | כל סקציה עם כפתור `js-section-toggle` רגיל | sectionToggleHandler.js |
| 7 | עמוד עם >3 tt-section | סקציה ראשונה עם כפתור `js-expand-collapse-all` (מחליף toggle); סקציות אחרות עם toggle רגיל | sectionToggleHandler.js, trading_accounts.html |

### 2.4 Section Structure (tt-section)

| # | בדיקה | סטנדרט | רפרנס |
|---|-------|--------|--------|
| 8 | כותרת | `index-section__header` עם title, meta, actions | phoenix-components.css |
| 9 | גוף | `index-section__body` עם `tt-section-row` | phoenix-components.css |

---

## 3. Checklist — מודולים (Modals / D16-like)

| # | בדיקה | סטנדרט | רפרנס |
|---|-------|--------|--------|
| 10 | שדות טופס | padding 8px 16px; focus בצבע brand | D16 SSOT §2.1 |
| 11 | כפתורי שמירה/ביטול | Save: רקע לבן, border+text בצבע; Hover: היפוך | D16 SSOT §2.2 |
| 12 | טקסט שמירה | "שמירה" (לא "שמור") | D16 SSOT §2.3 |
| 13 | פריסת טופס | `.form-row` דו-עמודתי, gap 21px | D16 SSOT §2.4 |
| 14 | כוכבית ולידציה | צבע `--color-error-red` | D16 SSOT §2.5 |
| 15 | RTL | Cancel לפני Save ב-DOM | D16 SSOT §2.6 |

---

## 4. Checklist — טבלאות וכרטיסים

| # | בדיקה | סטנדרט | רפרנס |
|---|-------|--------|--------|
| 16 | עמודת פעולות | **ללא כותרת גלויה** — רק `<span class="phoenix-table__header-text sr-only">פעולות</span>` | R3, phoenix-components.css L1721 |
| 17 | רספונסיביות טבלה | עטיפה ב-`phoenix-table-wrapper`, overflow-x: auto, עמודות fluid | R1, TT2_RESPONSIVE_FLUID_DESIGN |
| 18 | תאריך | פורמט DD/MM/YY | tableFormatters.js |
| 19 | גופן תאים | `font-size-sm` | phoenix-components.css |
| 20 | כפתור הוספה | padding 0 12px | phoenix-components.css |

---

## 5. תדירות ביצוע

| מצב | תדירות |
|-----|--------|
| עמוד/רכיב חדש | **חובה** לפני PR/הגשה |
| עדכון עמוד קיים | **חובה** אם נגע ב-info-summary, sections, layout |
| סבב תקופתי | מומלץ — סריקה של כל העמודים הרלוונטיים (לפי TT2_OFFICIAL_PAGE_TRACKER) |

---

## 6. תיעוד ותיקיות

- **Evidence:** כל סבב QA — רישום ב-`05-REPORTS/artifacts/` או ב-`_COMMUNICATION/team_30/`
- **אי-התאמות:** דיווח ל-Team 10 עם רפרנס ל-checklist
- **עדכון נוהל:** שינויים ב-checklist — רק דרך עדכון SSOT (D16, ARCHITECT) ואישור Team 10

---

## 7. רפרנסים

| מסמך | מיקום |
|------|--------|
| TT2_RESPONSIVE_FLUID_DESIGN | documentation/04-DESIGN_UX_UI/ |
| ARCHITECT_TABLE_RESPONSIVITY_DECISIONS | documentation/09-GOVERNANCE/ |
| D16_MODULE_REFERENCE_SSOT | documentation/09-GOVERNANCE/standards/ |
| ARCHITECT_MODULE_MENU_STYLING_SSOT | documentation/09-GOVERNANCE/ |
| phoenix-base.css | ui/src/styles/ |
| phoenix-components.css | ui/src/styles/ |
| sectionToggleHandler.js | ui/src/components/core/ |
| TEAM_30_TO_TEAM_10_PAGE_LAYOUT_INFO_SUMMARY_IMPLEMENTATION_REPORT | _COMMUNICATION/team_30/ |

---

**log_entry | [Team 30] | QA_PROCEDURE | CREATED | 2026-01-31**
