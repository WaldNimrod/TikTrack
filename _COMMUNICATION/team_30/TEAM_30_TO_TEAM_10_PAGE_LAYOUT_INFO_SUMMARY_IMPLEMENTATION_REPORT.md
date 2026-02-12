# Team 30 → Team 10: דוח יישום — Page Layout, Info Summary, Expand/Collapse All

**מאת:** Team 30 (Frontend)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-01-31  
**נושא:** יישום רוחבי — Page Layout, Info Summary, Section Toggle | בקשה לעדכון תיעוד ו-SSOT

---

## 1. סיכום ביצוע

בוצעו 3 עדכוני סטנדרט עיצובי/מבני החלים על כל העמודים במערכת:

| # | עדכון | תיאור | קבצים שנגעו |
|---|-------|-------|-------------|
| 1 | **Info Summary — שורה שנייה** | שורה שנייה עם אותו פיזור ועיצוב כמו הראשונה — עטיפה ב-`info-summary__content`, `gap: var(--spacing-lg)` | phoenix-components.css, trading_accounts.html, cash_flows.html, HomePage.jsx |
| 2 | **יישור עמוד כשקונטיינרים סגורים** | תוכן נשאר צמוד לחלק העליון (לא ממורכז לאמצע) כאשר כל הסקציות סגורות | phoenix-base.css |
| 3 | **Expand/Collapse All** | בעמודים עם **למעלה מ-3** `tt-section` — כפתור בסקציה הראשונה לפתיחה/סגירה של כל האזורים | sectionToggleHandler.js, trading_accounts.html |

---

## 2. פרטי יישום טכניים

### 2.1 Info Summary — מבנה חובה

**סטנדרט:**
- שורה ראשונה: תוכן בתוך `<div class="info-summary__content">` + כפתור toggle בסוף
- שורה שנייה (אם קיימת): תוכן בתוך `<div class="info-summary__content">` — אותו gap ו-flex כראשונה

**CSS (phoenix-components.css):**
- `.info-summary__row--second` — `gap: var(--spacing-lg)`
- `.info-summary__row--second .info-summary__content` — flex, justify-content center, gap זהה

**Reference:** `documentation/09-GOVERNANCE/standards/D16_MODULE_REFERENCE_SSOT.md` סעיף 7

### 2.2 Page Alignment

**שינוי:** `body .page-wrapper .page-container main`  
`justify-content: center` → `justify-content: flex-start`

**קובץ:** `ui/src/styles/phoenix-base.css` (קרוב לשורה 542)

### 2.3 Expand/Collapse All

**תנאי:** עמוד עם **יותר מ-3** אלמנטים `tt-section` בתוך `tt-container`

**יישום:** בסקציה הראשונה — החלפת כפתור `js-section-toggle` בכפתור `js-expand-collapse-all`:
- אייקון: שני פסים אופקיים + שני חצים (למעלה/למטה)
- aria-label: "הצג/הסתר את כל האזורים"
- לוגיקה: `sectionToggleHandler.js` — פונקציות `toggleAllSections`, `initExpandCollapseAll`

**עמודים שבהם מיושם:** `trading_accounts.html` (5 סקציות)

---

## 3. בקשה מפורטת לצוות 10 — עדכון תיעוד

### 3.1 עדכון SSOT — D16_MODULE_REFERENCE_SSOT.md

**מיקום:** `documentation/09-GOVERNANCE/standards/D16_MODULE_REFERENCE_SSOT.md`

**סעיף 7 — סגנונות כלליים (Base Template):** להוסיף/לעדכן את השורות הבאות:

| נושא | סטנדרט | קובץ |
|------|--------|------|
| יישור עמוד | `main` — `justify-content: flex-start` (תוכן צמוד למעלה כש-sections סגורים) | phoenix-base.css |
| סיכום מידע — שורה ראשונה | תוכן ב-`info-summary__content`; כפתור בסוף | phoenix-components.css, HTML |
| סיכום מידע — שורה שנייה | אותו מבנה: `info-summary__content`, `gap: var(--spacing-lg)` | phoenix-components.css, HTML |
| Expand/Collapse All | עמוד עם >3 tt-section: כפתור `js-expand-collapse-all` בסקציה הראשונה | sectionToggleHandler.js, HTML |

### 3.2 יצירת/עדכון מסמך Page Layout SSOT (אופציונלי)

**אם נדרש:** מסמך נפרד  
`documentation/09-GOVERNANCE/standards/PAGE_LAYOUT_AND_SECTIONS_SSOT.md`  
או הרחבה של `ARCHITECT_MODULE_MENU_STYLING_SSOT.md` — לפי שיקול דעתכם.

### 3.3 עדכון Index / Master

**בדיקה:** האם `documentation/00-MANAGEMENT/` או `D15_SYSTEM_INDEX.md` דורשים הפניה למסמך החדש/מעודכן.

### 3.4 נהלי עבודה — Checklist לעמודים חדשים

**בוצע:** נוצר `TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE.md` ב-`05-PROCEDURES`.  
**בקשה:** לרשום ב-D15_SYSTEM_INDEX / 00_MASTER_INDEX.  
**המלצה נוספת:** checklist מקוצר ב-`02-DEVELOPMENT` אם נדרש גרסה מקוצרת:
- [ ] Info summary — שתי שורות עם `info-summary__content`
- [ ] אם >3 tt-section — כפתור expand-collapse-all בסקציה הראשונה

---

## 4. רפרנסים לקבצים רלוונטיים

| קובץ | תפקיד |
|------|--------|
| `ui/src/styles/phoenix-base.css` | justify-content: flex-start ל-main |
| `ui/src/styles/phoenix-components.css` | info-summary__row, info-summary__content |
| `ui/src/components/core/sectionToggleHandler.js` | toggle יחיד + expand-collapse-all |
| `ui/src/views/financial/tradingAccounts/trading_accounts.html` | 5 sections, expand-collapse-all, info-summary |
| `ui/src/views/financial/cashFlows/cash_flows.html` | 3 sections, info-summary |
| `ui/src/views/financial/brokersFees/brokers_fees.html` | 2 sections, info-summary (שורה ראשונה בלבד) |
| `ui/src/components/HomePage.jsx` | info-summary (React) |
| `documentation/09-GOVERNANCE/standards/D16_MODULE_REFERENCE_SSOT.md` | SSOT — סעיף 7 להרחבה |

---

## 5. סיכום עמודים — סטטוס יישום

| עמוד | info-summary__content שורה 1 | info-summary__content שורה 2 | Expand/Collapse All |
|------|------------------------------|------------------------------|---------------------|
| trading_accounts.html | ✅ | ✅ | ✅ (5 sections) |
| cash_flows.html | ✅ | ✅ | — (3 sections) |
| brokers_fees.html | ✅ | — (אין שורה 2) | — (2 sections) |
| HomePage.jsx | ✅ | ✅ | — (3 sections) |

---

## 6. נוהל QA פנימי — Team 30

נוצר נוהל אבטחת איכות פנימי לשמירה על הסטנדרטים:

| מסמך | מיקום |
|------|--------|
| TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE | `documentation/05-PROCEDURES/TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE.md` |

הנוהל כולל Checklist לעמודים, מודולים וטבלאות — חובה לפני PR/הגשה. מומלץ לרשום ב-Index.

---

## 7. פעולה נדרשת מצוות 10

1. **לעדכן** את `D16_MODULE_REFERENCE_SSOT.md` בסעיף 7 כמתואר לעיל  
2. **להחליט** אם נדרש מסמך Page Layout SSOT נפרד  
3. **לעדכן** Index/Master בהתאם  
4. **להוסיף** Checklist לעמודים חדשים (אופציונלי)

---

**סטטוס:** ✅ יישום הושלם | ⏳ ממתין לעדכון תיעוד

**log_entry | [Team 30] | PAGE_LAYOUT_INFO_SUMMARY_IMPLEMENTATION | DELIVERED | 2026-01-31**
