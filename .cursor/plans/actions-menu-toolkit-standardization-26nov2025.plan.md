# תוכנית סטנדרטיזציה - Actions Menu Toolkit

## מטרה

מימוש התהליך המוגדר במסמך העבודה המרכזי (`documentation/frontend/UI_STANDARDIZATION_WORK_DOCUMENT.md`) עבור מערכת מספר 14 - **Actions Menu Toolkit**.

## מערכת Actions Menu Toolkit

**קבצים מרכזיים:**
- `trading-ui/scripts/modules/actions-menu-system.js` - הקובץ המרכזי (823 שורות)

**Package:** `modules` package (מוגדר ב-`package-manifest.js`)

**מטרה:** מערכת מרכזית ליצירת תפריטי פעולה דינמיים לשורות טבלה.

**תכונות מרכזיות:**
- `window.createActionsMenu(buttons)` - יצירת תפריט פעולות
- Pure CSS hover (ללא JavaScript delays)
- Auto-positioning (RTL aware)
- Material Design
- תמיכה ב-2-5 כפתורים דינמית

**API:**
```javascript
window.createActionsMenu([
  { type: 'VIEW', onclick: `viewItem(${id})`, title: 'צפה' },
  { type: 'EDIT', onclick: `editItem(${id})`, title: 'ערוך' },
  { type: 'DELETE', onclick: `deleteItem(${id})`, title: 'מחק' }
]);
```

## שלב 1: לימוד מעמיק של המערכת

### 1.1 קריאת דוקומנטציה

**קבצים לקריאה:**
- `trading-ui/scripts/modules/actions-menu-system.js` - הקובץ המרכזי (823 שורות)
- `trading-ui/scripts/init-system/package-manifest.js` - הגדרת package
- `documentation/02-ARCHITECTURE/FRONTEND/ACTIONS_MENU_SYSTEM.md` - דוקומנטציה (אם קיים)

**נושאים לבדיקה:**
- API של Actions Menu Toolkit: `window.createActionsMenu()`
- סוגי כפתורים נתמכים (VIEW, EDIT, DELETE, CANCEL, LINK, וכו')
- תמיכה ב-RTL
- Auto-positioning
- Keyboard navigation

### 1.2 הבנת הארכיטקטורה

**תלויות:**
- `window.createActionsMenu` - פונקציה גלובלית
- `window.actionsMenuSystem` - instance של ActionsMenuSystem
- `window.BUTTON_ICONS` - איקונים לכפתורים
- Button System - `data-onclick`, `data-button-type`

**שימושים נוכחיים:**
- עמודים עם טבלאות - שימוש ב-`createActionsMenu()`
- פונקציות מקומיות - `generateActionButtons()` ב-`ui-utils.js`

### 1.3 זיהוי דפוסי שימוש נפוצים

**דפוסים לזיהוי:**
1. שימוש ב-`window.createActionsMenu()` - כבר משתמש במערכת
2. פונקציות מקומיות `generateActionButtons()` - צריך להחליף
3. יצירת HTML ידנית של תפריטי פעולות - צריך להחליף
4. שימוש ב-`actions-menu-wrapper` ישיר - צריך להחליף

### 1.4 זיהוי מקרים קצה

**מקרים קצה לבדיקה:**
- עמודים ללא טעינת `actions-menu-system.js`
- עמודים עם פונקציות מקומיות `generateActionButtons()`
- עמודים עם יצירת HTML ידנית של תפריטי פעולות
- עמודים עם שימוש ב-`actions-menu-wrapper` ישיר

## שלב 2: סריקת כלל העמודים והכנת דוח סטיות

### 2.1 יצירת סקריפט סריקה

**קובץ:** `trading-ui/scripts/check-actions-menu-usage.js`

**לוגיקת סריקה:**
1. **זיהוי שימושים ב-Actions Menu Toolkit (חיובי):**
   - חיפוש `window.createActionsMenu`
   - חיפוש `createActionsMenu(`
   - חיפוש `actions-menu-system.js` ב-package-manifest

2. **זיהוי פונקציות מקומיות:**
   - פונקציות `generateActionButtons` מקומיות
   - פונקציות `createActionsMenu` מקומיות
   - פונקציות `createActionButtons` מקומיות

3. **זיהוי יצירת HTML ידנית:**
   - יצירת HTML עם `actions-menu-wrapper` ישיר
   - יצירת HTML עם `actions-trigger` ישיר
   - יצירת HTML עם `actions-menu-popup` ישיר

4. **זיהוי טעינת actions-menu-system.js:**
   - בדיקה אם `actions-menu-system.js` נטען דרך package-manifest.js
   - בדיקה אם `modules` package נטען

### 2.2 סריקת 36 העמודים

**עמודים לסריקה:**
- 11 עמודים מרכזיים: `index.html`, `trades.html`, `trade_plans.html`, `alerts.html`, `tickers.html`, `trading_accounts.html`, `executions.html`, `cash_flows.html`, `notes.html`, `research.html`, `preferences.html`
- 12 עמודים טכניים: `db_display.html`, `db_extradata.html`, `constraints.html`, `background-tasks.html`, `server-monitor.html`, `system-management.html`, `cache-test.html`, `notifications-center.html`, `css-management.html`, `dynamic-colors-display.html`, `designs.html`, `tradingview-test-page.html`
- 2 עמודים משניים: `external-data-dashboard.html`, `chart-management.html`
- 11 עמודי מוקאפ: `portfolio-state-page.html`, `trade-history-page.html`, `price-history-page.html`, `comparative-analysis-page.html`, `trading-journal-page.html`, `strategy-analysis-page.html`, `economic-calendar-page.html`, `history-widget.html`, `emotional-tracking-widget.html`, `date-comparison-modal.html`, `tradingview-test-page.html` (מוקאפ)

**עמודים רלוונטיים במיוחד:**
- כל עמוד עם טבלאות - שימוש ב-`createActionsMenu()`
- `trades.html`, `trade_plans.html`, `alerts.html`, `tickers.html`, `trading_accounts.html`, `executions.html`, `cash_flows.html`, `notes.html` - עמודים עם טבלאות

### 2.3 יצירת דוח סטיות

**קובץ:** `documentation/05-REPORTS/ACTIONS_MENU_TOOLKIT_DEVIATIONS_REPORT.md`

**פורמט הדוח:**
- סיכום כללי: מספר עמודים, מספר סטיות, סוגי סטיות
- רשימה מפורטת לכל עמוד:
  - שם העמוד
  - קובץ HTML
  - קובץ JS
  - סטטוס: משתמש במערכת / לא משתמש
  - רשימת סטיות:
    - שורה
    - סוג (פונקציה מקומית / HTML ידני / טעינה חסרה)
    - חומרה (גבוהה / בינונית / נמוכה)
    - קוד
    - תיאור

## שלב 3: תיקון רוחבי לכל העמודים

### 3.1 תיקון פונקציות מקומיות

**קבצים לתיקון (לפי סריקה):**

**עדיפות גבוהה:**
- קבצים עם פונקציות `generateActionButtons` מקומיות
- קבצים עם פונקציות `createActionsMenu` מקומיות

**תיקונים נדרשים:**
- החלפת פונקציות מקומיות ב-`window.createActionsMenu()`
- וידוא שכל הכפתורים משתמשים בפורמט הנכון

### 3.2 החלפת יצירת HTML ידנית

**תיקונים נדרשים:**
1. **החלפת HTML ידני:**
   - חיפוש יצירת HTML עם `actions-menu-wrapper` ישיר
   - החלפה ב-`window.createActionsMenu()`

2. **וידוא פורמט נכון:**
   - כל כפתור צריך `type`, `onclick`, `title`
   - וידוא שימוש ב-`data-onclick` (לא `onclick` ישיר)

### 3.3 וידוא טעינת המערכת

**בדיקות:**
- וידוא ש-`actions-menu-system.js` נטען דרך `modules` package
- בדיקה דרך `package-manifest.js` - האם המערכת נטענת דרך modules package

**תיקונים נדרשים:**
- וידוא ש-`modules` package נטען בכל עמוד רלוונטי
- בדיקה שהמערכת נטענת לפני השימוש

### 3.4 כללי קוד

**חובה לעמוד:**
1. **ארכיטקטורה מדויקת:**
   - שימוש רק ב-`window.createActionsMenu()`
   - אין פונקציות מקומיות ליצירת תפריטי פעולות
   - אין יצירת HTML ידנית של תפריטי פעולות

2. **אינטגרציה מלאה:**
   - תמיד לבדוק זמינות: `if (window.createActionsMenu)`
   - Fallback ל-console.error אם המערכת לא זמינה

3. **הערות מסודרות:**
   - JSDoc לכל פונקציה ששונתה
   - הערות בעברית ברורות

4. **אין קיצורי דרך:**
   - כל פונקציה מקומית צריכה להיות מוחלפת
   - אין השארת קוד ישן

## שלב 4: בדיקות פר עמוד

### 4.1 רשימת עמודים לבדיקה

**עמודים מרכזיים (11):**
1. `index.html` - דשבורד
2. `trades.html` - טריידים
3. `trade_plans.html` - תכניות מסחר
4. `alerts.html` - התראות
5. `tickers.html` - טיקרים
6. `trading_accounts.html` - חשבונות מסחר
7. `executions.html` - ביצועים
8. `cash_flows.html` - תזרימי מזומן
9. `notes.html` - הערות
10. `research.html` - מחקר
11. `preferences.html` - העדפות

### 4.2 בדיקות לכל עמוד

**לכל עמוד, לבדוק:**

1. **טעינת המערכת:**
   - פתיחת העמוד בדפדפן
   - בדיקה בקונסולה: `typeof window.createActionsMenu`
   - בדיקה: `typeof window.actionsMenuSystem`
   - וידוא שאין שגיאות טעינה

2. **תפריטי פעולות:**
   - לחיצה על כפתור "פעולות" בטבלה
   - בדיקה שהתפריט נפתח נכון
   - בדיקה שהכפתורים עובדים (View, Edit, Delete, וכו')
   - בדיקת RTL positioning

3. **Keyboard navigation:**
   - בדיקת Escape לסגירה
   - בדיקת Tab navigation

### 4.3 תרחישי בדיקה ספציפיים

**תרחיש 1: תפריט פעולות בטבלה**
1. פתיחת עמוד עם טבלה (trades, alerts, וכו')
2. לחיצה על כפתור "פעולות" בשורה
3. וידוא שהתפריט נפתח
4. בדיקת הצגת כפתורי פעולות
5. בדיקת לחיצה על כפתורים

**תרחיש 2: RTL positioning**
1. פתיחת עמוד עם טבלה
2. לחיצה על כפתור "פעולות" בשורה
3. בדיקת מיקום התפריט (RTL aware)

**תרחיש 3: Keyboard navigation**
1. פתיחת עמוד עם טבלה
2. לחיצה על כפתור "פעולות" בשורה
3. בדיקת Escape לסגירה
4. בדיקת Tab navigation

## שלב 5: עדכון מסמך העבודה המרכזי

### 5.1 עדכון מטריצת השלמת תיקונים

**קובץ:** `documentation/frontend/UI_STANDARDIZATION_WORK_DOCUMENT.md`

**פעולות:**
- עדכון סטטוס Actions Menu Toolkit ל-"מושלם" או "בתהליך"
- עדכון אחוזי ביצוע לכל עמוד
- סימון עמודים שנבדקו בדפדפן

### 5.2 יצירת דוח סיכום

**קובץ:** `documentation/05-REPORTS/ACTIONS_MENU_TOOLKIT_STANDARDIZATION_REPORT.md`

**תוכן:**
- סיכום כללי: מספר עמודים, מספר סטיות, מספר תיקונים
- רשימת תיקונים מפורטת לכל עמוד
- רשימת בעיות שנותרו (אם יש)

## קבצים רלוונטיים

### מערכת Actions Menu Toolkit:
- `trading-ui/scripts/modules/actions-menu-system.js` - הקובץ המרכזי

### קבצים שצריך לבדוק ולתקן:
- קבצים עם פונקציות מקומיות `generateActionButtons()`
- קבצים עם יצירת HTML ידנית של תפריטי פעולות

### דוקומנטציה:
- `documentation/frontend/UI_STANDARDIZATION_WORK_DOCUMENT.md` - מסמך העבודה המרכזי
- `documentation/05-REPORTS/ACTIONS_MENU_TOOLKIT_DEVIATIONS_REPORT.md` - דוח סטיות (ייווצר)
- `documentation/05-REPORTS/ACTIONS_MENU_TOOLKIT_STANDARDIZATION_REPORT.md` - דוח סטנדרטיזציה (ייווצר)
- `documentation/05-REPORTS/ACTIONS_MENU_TOOLKIT_TESTING_REPORT.md` - דוח בדיקות (ייווצר)

### דוחות שייווצרו:
- `documentation/05-REPORTS/ACTIONS_MENU_TOOLKIT_DEVIATIONS_REPORT.md` - דוח סטיות
- `documentation/05-REPORTS/ACTIONS_MENU_TOOLKIT_STANDARDIZATION_REPORT.md` - דוח סטנדרטיזציה
- `documentation/05-REPORTS/ACTIONS_MENU_TOOLKIT_TESTING_REPORT.md` - דוח בדיקות

## קריטריוני הצלחה

- [ ] 0 פונקציות מקומיות ליצירת תפריטי פעולות (כל הפונקציות משתמשות ב-Actions Menu Toolkit)
- [ ] 0 יצירת HTML ידנית של תפריטי פעולות (כל ה-HTML דרך createActionsMenu)
- [ ] כל העמודים נבדקו בדפדפן
- [ ] דוח בדיקות מלא נוצר
- [ ] המטריצה במסמך העבודה מעודכנת

