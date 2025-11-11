# מערכת הכפתורים המרוכזת - TikTrack

## סקירה כללית

מערכת הכפתורים המרוכזת של TikTrack מספקת פתרון אחיד ויעיל לניהול כל כפתורי הפעולה במערכת. המערכת כוללת שתי שכבות:

1. **מערכת בסיסית** - `scripts/button-icons.js` - כפתורים בודדים
2. **מערכת מתקדמת** - `scripts/button-system-init.js` - כפתורי פעולות לטבלאות דינמיות

המערכת מבטיחה עקביות, תחזוקה קלה וביצועים טובים.

### ⚠️ **סטנדרט Event Handling - `data-onclick` בלבד**

**מתאריך 2025-01-27, כל הכפתורים במערכת חייבים להשתמש ב-`data-onclick` במקום `onclick` רגיל.**

מערכת הכפתורים יוצרת אוטומטית כפתורים עם `data-onclick`. לפרטים מלאים: `documentation/02-ARCHITECTURE/FRONTEND/EVENT_HANDLING_STANDARD.md`

## ארכיטקטורה

### מערכת בסיסית - כפתורים בודדים
- **מיקום**: `trading-ui/scripts/button-icons.js`
- **תפקיד**: ניהול מרכזי של כפתורים בודדים
- **טעינה**: נטען בכל העמודים לפני הסקריפטים הספציפיים

### מערכת מתקדמת - כפתורי פעולות לטבלאות
- **מיקום**: `trading-ui/scripts/ui-utils.js`
- **תפקיד**: ניהול כפתורי פעולות לטבלאות דינמיות
- **פונקציות**: `generateActionButtons`, `loadTableActionButtons`

### מערכת איקונים מרכזית
```javascript
const BUTTON_ICONS = {
    EDIT: '✏️',
    DELETE: '🗑️',
    CANCEL: '❌',
    LINK: '🔗',
    ADD: '➕',
    SAVE: '💾',
    // ... ועוד
};
```

### מערכת טקסטים לנגישות
```javascript
const BUTTON_TEXTS = {
    EDIT: 'ערוך',
    DELETE: 'מחק',
    CANCEL: 'ביטול',
    LINK: 'קישור',
    // ... ועוד
};
```

## פונקציות מרכזיות

### 1. `createEditButton(onClick, additionalClasses)`
**תפקיד**: יצירת כפתור עריכה
**פרמטרים**:
- `onClick` (string): הקריאה לפונקציה
- `additionalClasses` (string, optional): מחלקות CSS נוספות

**דוגמה**:
```javascript
${createEditButton(`editTradeRecord('${trade.id}')`)}
```

### 2. `createDeleteButton(onClick, additionalClasses)`
**תפקיד**: יצירת כפתור מחיקה
**פרמטרים**:
- `onClick` (string): הקריאה לפונקציה
- `additionalClasses` (string, optional): מחלקות CSS נוספות

**דוגמה**:
```javascript
${createDeleteButton(`deleteTradeRecord('${trade.id}')`)}
```

### 3. `createCancelButton(itemType, itemId, status, size, additionalClasses)`
**תפקיד**: יצירת כפתור ביטול/הפעלה מחדש
**פרמטרים**:
- `itemType` (string): סוג הפריט ('trade', 'trade_plan', etc.)
- `itemId` (number): מזהה הפריט
- `status` (string): סטטוס הפריט ('open', 'cancelled', etc.)
- `size` (string, optional): גודל הכפתור ('sm', 'lg', etc.)
- `additionalClasses` (string, optional): מחלקות CSS נוספות

**דוגמה**:
```javascript
${createCancelButton('trade', trade.id, trade.status, 'sm')}
```

### 4. `createLinkButton(onClick, additionalClasses)`
**תפקיד**: יצירת כפתור קישור
**פרמטרים**:
- `onClick` (string): הקריאה לפונקציה
- `additionalClasses` (string, optional): מחלקות CSS נוספות

**דוגמה**:
```javascript
${createLinkButton(`viewLinkedItemsForTrade(${trade.id})`)}
```

### 5. `createDeleteButtonByType(itemType, itemId, size, additionalClasses)`
**תפקיד**: יצירת כפתור מחיקה עם itemType (גיבוי)
**פרמטרים**:
- `itemType` (string): סוג הפריט
- `itemId` (number): מזהה הפריט
- `size` (string, optional): גודל הכפתור
- `additionalClasses` (string, optional): מחלקות CSS נוספות

### 6. `createFilterButtonHelper(container, onClick, text, options)`
**תפקיד**: יצירת כפתורי פילטר (chips / quick filters) בהתאם למערכת החדשה  
**פרמטרים מרכזיים**:
- `container` (HTMLElement): אלמנט היעד להזרקת הכפתור
- `onClick` (string): הערך שיוזן לתוך `data-onclick`
- `text` (string): הטקסט שיוצג בכפתור
- `options` (object, optional):
  - `title` (string): טקסט נגישות (ברירת מחדל = הטקסט)
  - `additionalClasses` (string): מחלקות CSS משותפות (למשל `btn-outline-primary filter-icon-btn`)
  - `additionalAttributes` (string): אטריביוטים מותאמים אישית (למשל `data-type="account"`)
  - `variant` (string): `small` לאייקון בלבד, `normal` לטקסט בלבד, `full` לטקסט + אייקון
  - `icon` (string): איקון חלופי (אם לא סופק – המערכת משתמשת באיקון ברירת המחדל של FILTER)

```javascript
createFilterButtonHelper(
    filtersContainer,
    "filterAlertsByRelatedObjectType('account')",
    'חשבונות',
    {
        title: 'סינון לפי חשבון מסחר',
        additionalClasses: 'btn-outline-primary filter-icon-btn',
        additionalAttributes: 'data-type=\"account\"',
        variant: 'full',
        icon: '🏦'
    }
);
```

## מערכת מתקדמת - כפתורי פעולות לטבלאות

### 1. `generateActionButtons(entityId, entityType, status, ...functions, ...showFlags)`
**תפקיד**: יצירת כפתורי פעולות מלאים לשורה בודדת
**פרמטרים**:
- `entityId` (number): מזהה הישות
- `entityType` (string): סוג הישות ('ticker', 'trade', etc.)
- `status` (string): סטטוס הישות ('פתוח', 'סגור', etc.)
- `detailsFunction` (string): שם פונקציה לפרטים
- `linkedFunction` (string): שם פונקציה לקישור
- `editFunction` (string): שם פונקציה לעריכה
- `cancelFunction` (string): שם פונקציה לביטול
- `restoreFunction` (string): שם פונקציה לשיחזור
- `deleteFunction` (string): שם פונקציה למחיקה
- `showDetails` (boolean): הצג כפתור פרטים
- `showLinked` (boolean): הצג כפתור קישור
- `showEdit` (boolean): הצג כפתור עריכה
- `showCancel` (boolean): הצג כפתור ביטול/שיחזור
- `showDelete` (boolean): הצג כפתור מחיקה

**דוגמה**:
```javascript
const buttonsHtml = generateActionButtons(
    1, 'ticker', 'פתוח',
    'viewTickerDetails', 'viewLinkedItems', 'editTicker', 'cancelTicker', 'restoreTicker', 'deleteTicker',
    true, true, true, true, true
);
```

### 2. `loadTableActionButtons(tableId, entityType, config)`
**תפקיד**: טעינת כפתורי פעולות לכל הטבלה בבת אחת
**פרמטרים**:
- `tableId` (string): מזהה הטבלה
- `entityType` (string): סוג הישות
- `config` (object): הגדרות הכפתורים

**דוגמה**:
```javascript
loadTableActionButtons('tickersTable', 'ticker', {
    showDetails: true,
    showLinked: true,
    showEdit: true,
    showCancel: true,
    showDelete: true
});
```

**דוגמה עם הגדרות מותאמות**:
```javascript
loadTableActionButtons('tradesTable', 'trade', {
    showDetails: false,  // ללא כפתור פרטים
    showLinked: true,
    showEdit: true,
    showCancel: true,
    showDelete: true
});
```

## שימוש בעמודים

### עמוד טריידים (`trades.js`)
```javascript
<td class="actions-cell">
    <div class="d-flex gap-1 justify-content-center align-items-center">
        ${createLinkButton(`viewLinkedItemsForTrade(${trade.id})`)}
        ${createEditButton(`editTradeRecord('${trade.id}')`)}
        ${createCancelButton('trade', trade.id, trade.status, 'sm')}
        ${createDeleteButton(`deleteTradeRecord('${trade.id}')`)}
    </div>
</td>
```

### עמוד תזרימי מזומנים (`cash_flows.js`)
```javascript
<td class="actions-cell">
    ${createLinkButton(`window.showLinkedItemsModal && window.showLinkedItemsModal([], 'cash_flow', ${cashFlow.id})`)}
    ${createEditButton(`showEditCashFlowModal(${cashFlow.id})`)}
    ${createDeleteButton(`deleteCashFlow(${cashFlow.id})`)}
</td>
```

### עמוד תכנון טריידים (`trade_plans.js`)
```javascript
<td class="actions-cell">
    ${createEditButton(`window.openEditTradePlanModal(${design.id})`)}
    ${createCancelButton('trade_plan', design.id, design.status, 'sm')}
    ${createDeleteButton(`window.openDeleteTradePlanModal(${design.id})`)}
</td>
```

### עמוד מסד נתונים (`database.js`)
```javascript
let actionsHtml = `
    ${createEditButton(`editRecord('${tableType}', ${item.id})`)}
    ${createDeleteButton(`deleteRecord('${tableType}', ${item.id})`)}
`;

if (item.status) {
    actionsHtml += createCancelButton(tableType, item.id, item.status, 'sm');
}
```

## דפוסי שימוש מומלצים

### כותרות מיון (`SORT`)
- השתמשו ב-`data-button-type="SORT"` עם `data-variant="full"` כדי להציג את טקסט העמודה לצד האיקון `↕️`.
- `data-icon` ניתן להחלפה במקרה שרוצים אייקון אחר.
- דוגמה:
  ```html
  <button
    data-button-type="SORT"
    data-variant="full"
    data-icon="↕️"
    data-text="שם החשבון"
    data-classes="btn-link sortable-header"
    data-onclick="window.sortTable('trading_accounts', 0)"></button>
  ```

### כפתורי הצג/הסתר (`TOGGLE`)
- ברירת המחדל: `data-variant="small"` להצגת איקון בלבד.
- תמיד לספק `title` / `data-tooltip` עבור נגישות.
- ניתן להשתמש ב-`createToggleButtonHelper` לשימוש חוזר.

### כפתורי פילטר (`FILTER` / `SECONDARY`)
- לפילטרים טקסטואליים: `data-variant="normal"` + `data-text`.
- לפילטרים עם איקון: `data-variant="full"` + `data-icon`.
- `createFilterButtonHelper` מספק API אחיד לסינונים (כולל options עבור classes, attributes ו-title).

### פעולות CRUD קטנות
- כפתורי שורה (לינק, עריכה, מחיקה, אישור/דחייה) מומלץ להגדיר עם `data-variant="small"` כדי לקבל איקון בלבד.
- כפתורי טפסים/פעולות עיקריות (שמור, ייצוא, בדיקה) מומלץ להגדיר עם `data-variant="full"` כדי לשלב טקסט ואיקון.

## הרחבת API גלובלי

- `window.addDynamicButton(container, type, onClick, classes = '', attributes = '', text = '', id = '', variant = 'normal', icon = '')`
- `window.updateButton(buttonId, type, onClick, classes = '', attributes = '', text = '', variant = 'normal', icon = '')`

הפרמטרים החדשים (`variant`, `icon`) מאפשרים לנהל את תצוגת הכפתור מתוך קוד JS (כולל איקון מותאם, וריאציה של טקסט/איקון ובחירת מחלקות CSS תומכות).

## יתרונות המערכת

### 1. ריכוז מלא
- כל הפונקציונליות במקום אחד
- אין כפילויות קוד
- ניהול מרכזי של שינויים

### 2. עקביות
- אותו סגנון בכל העמודים
- איקונים אחידים
- התנהגות עקבית

### 3. תחזוקה קלה
- שינוי אחד משפיע על הכל
- עדכון מרכזי של איקונים וטקסטים
- הוספת פונקציות חדשות בקלות

### 4. בדיקת קיום
- פונקציות בודקות אם הפונקציות קיימות
- מניעת שגיאות JavaScript
- גיבוי אוטומטי

### 5. ביצועים טובים
- טעינה מהירה
- עדכונים יעילים
- זיכרון מנוהל היטב

## תמיכה בסוגי פריטים

### פריטים נתמכים ב-`createCancelButton`:
- `trade` - טריידים
- `trade_plan` - תכנוני טריידים
- `ticker` - טיקרים
- `alert` - התראות
- `account` - חשבונות
- `cash_flow` - תזרימי מזומנים
- `execution` - עסקאות

### פריטים נתמכים ב-`createDeleteButtonByType`:
- כל הפריטים הנ"ל
- פונקציות אוטומטיות לפי itemType

## בדיקת קיום פונקציות

כל הפונקציות בודקות אם הפונקציות קיימות לפני הקריאה:

```javascript
// דוגמה מ-createCancelButton
onclick = `onclick="window.cancelTradeRecord && window.cancelTradeRecord(${itemId})"`;
```

זה מבטיח:
- אין שגיאות JavaScript
- גיבוי אוטומטי
- תאימות עם פונקציות עתידיות

## הוספת פונקציות חדשות

### שלב 1: הוספת איקון וטקסט
```javascript
const BUTTON_ICONS = {
    // ... קיים
    NEW_BUTTON: '🆕'
};

const BUTTON_TEXTS = {
    // ... קיים
    NEW_BUTTON: 'כפתור חדש'
};
```

### שלב 2: הוספת פונקציה
```javascript
function createNewButton(onClick, additionalClasses = '') {
    return createButton('NEW_BUTTON', onClick, additionalClasses);
}
```

### שלב 3: ייצוא גלובלי
```javascript
window.createNewButton = createNewButton;
```

### שלב 4: שימוש בעמודים
```javascript
${createNewButton(`newFunction(${item.id})`)}
```

## פתרון בעיות

### בעיה: כפתור לא עובד
**פתרון**:
1. בדוק שהפונקציה קיימת ב-`window`
2. בדוק שהקריאה לפונקציה נכונה
3. בדוק שהפונקציה נטענת אחרי `button-icons.js`

### בעיה: כפתור לא מופיע
**פתרון**:
1. בדוק שהפונקציה נקראת נכון
2. בדוק שאין שגיאות JavaScript
3. בדוק שהאלמנט קיים ב-DOM

### בעיה: סגנון לא נכון
**פתרון**:
1. בדוק את `getButtonClass` ב-`button-icons.js`
2. בדוק את המחלקות CSS
3. בדוק את הפרמטר `additionalClasses`

## סיכום

מערכת הכפתורים המרוכזת של TikTrack מספקת פתרון יעיל, עקבי וקל לתחזוקה לניהול כל כפתורי הפעולה במערכת. המערכת מבטיחה עקביות, ביצועים טובים ותחזוקה קלה.
