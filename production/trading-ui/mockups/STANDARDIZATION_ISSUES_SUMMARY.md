# סיכום בעיות סטנדרטיזציה - עמודי מוקאפ

# Standardization Issues Summary - Mockups Pages

**תאריך:** 29.11.2025  
**סה"כ עמודים:** 12

---

## סיכום כללי

### מצב נוכחי

- ✅ **מבנה HTML:** האלמנטים קיימים (background-wrapper, unified-header, page-body, main-content)
- ✅ **Header System:** עובד נכון (12/12)
- ✅ **ITCSS:** master.css ו-header-styles.css נטענים נכון (12/12)
- ⚠️ **Inline Styles:** 70 inline styles שנוצרים דינמית על ידי JavaScript
- ⚠️ **Style Tags:** 1 style tag של TradingView (third-party, ניתן להתעלם)
- ⚠️ **Console Errors:** 3 עמודים עם שגיאות קונסולה
- ⚠️ **Button System:** לא כל העמודים משתמשים ב-data-onclick

---

## בעיות שזוהו

### 1. Inline Styles שנוצרים דינמית (70)

**מקורות ידועים:**

- `comparative-analysis-page.js` - שורה 46: `style="background-color: ${color};"`
- `watch-lists-page.js` - שורות 687, 695: `el.style.backgroundColor`, `el.style.color`
- Dropdowns ו-menus שנוצרים דינמית
- JavaScript דינמי אחר

**תכנית תיקון:**

1. החלפת inline styles ב-CSS classes עם CSS variables
2. שימוש ב-data attributes + CSS classes במקום `.style.`
3. יצירת CSS classes דינמיות באמצעות CSS variables

---

### 2. שגיאות קונסולה (3 עמודים)

**comparative-analysis-page:**

- `Error saving preference comparative-analysis-comparison-params`
- `Error saving preference comparative-analysis-filters`
- **סטטוס:** כבר תוקן ב-`comparative-analysis-page.js` (שיפור error handling)

**economic-calendar-page:**

- `Failed to load resource: 404 (NOT FOUND)`
- **סטטוס:** צריך לבדוק מה המשאב החסר

**strategy-analysis-page:**

- `Failed to load resource: 404 (NOT FOUND)`
- **סטטוס:** צריך לבדוק מה המשאב החסר

---

### 3. Button System - לא כולם משתמשים ב-data-onclick

**סטטוס:** רוב הכפתורים משתמשים ב-data-onclick, אבל יש כמה שעדיין משתמשים ב-onclick ישיר.

**תכנית תיקון:**

1. איתור כל הכפתורים עם `onclick=""`
2. החלפה ל-`data-onclick=""`

---

### 4. Style Tags של Third-Party

**TradingView style tag:**

- זה נוצר על ידי הספרייה החיצונית TradingView
- **פעולה:** התעלמות בבדיקה (לא ניתן לתקן)

---

## סדר עדיפויות לתיקון

### עדיפות 1 - קריטי

1. ✅ תיקון שגיאות קונסולה (כבר תוקן חלקית)
2. ⚠️ איתור ותיקון משאבים חסרים (404 errors)

### עדיפות 2 - חשוב

3. ⚠️ תיקון inline styles שנוצרים על ידי JavaScript שלנו
4. ⚠️ החלפת onclick ב-data-onclick

### עדיפות 3 - שיפור

5. ⚠️ שיפור בדיקת סטנדרטיזציה (הסקריפט לא מזהה נכון את מבנה HTML)

---

## קבצים לתיקון

### JavaScript

- `trading-ui/scripts/comparative-analysis-page.js` - שורה 46 (inline style)
- `trading-ui/scripts/watch-lists-page.js` - שורות 687, 695 (inline styles)

### HTML

- `trading-ui/mockups/daily-snapshots/economic-calendar-page.html` - משאב חסר
- `trading-ui/mockups/daily-snapshots/strategy-analysis-page.html` - משאב חסר

### CSS

- `trading-ui/styles-new/06-components/_mockups-common.css` - להוסיף classes דינמיות

---

## הערות חשובות

1. **Inline styles שנוצרים על ידי JavaScript דינמי** (כמו dropdowns) נחשבים חלק מהפונקציונליות הרגילה וניתן להתעלם מהם בבדיקה.

2. **Style tags של third-party libraries** (כמו TradingView) לא ניתן לתקן - יש להתעלם מהם בבדיקה.

3. **מבנה HTML** - האלמנטים קיימים, הבעיה היא שהסקריפט לא מזהה אותם נכון (צריך לשפר את הסקריפט).

---

## סטטוס תיקון

- [ ] תיקון שגיאות קונסולה
- [ ] תיקון משאבים חסרים (404)
- [ ] תיקון inline styles ב-JavaScript שלנו
- [ ] החלפת onclick ב-data-onclick
- [ ] שיפור סקריפט בדיקה

