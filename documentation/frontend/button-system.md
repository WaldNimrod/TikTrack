# מערכת הכפתורים המרוכזת - TikTrack

## סקירה כללית

מערכת הכפתורים המרוכזת של TikTrack מספקת פתרון אחיד ויעיל לניהול כל כפתורי הפעולה במערכת. המערכת כוללת:

1. **מערכת בסיסית** - `scripts/button-icons.js` - כפתורים בודדים
2. **מערכת מתקדמת** - `scripts/button-system-init.js` - כפתורי פעולות לטבלאות דינמיות
3. **מערכת וריאציות** - תמיכה בשלוש וריאציות תצוגה
4. **מערכת צבעים דינמית** - משתני CSS להתאמה אישית

המערכת מבטיחה עקביות, תחזוקה קלה וביצועים טובים.

## תכונות חדשות

### משתני צבע דינמיים
כל כפתור משתמש במשתנה CSS דינמי שניתן להתאים אישית:
- `--color-action-edit` - צבע כפתור עריכה
- `--color-action-delete` - צבע כפתור מחיקה
- `--color-action-add` - צבע כפתור הוספה
- `--color-action-save` - צבע כפתור שמירה
- ועוד...

### וריאציות תצוגה
כל כפתור תומך בשלוש וריאציות:
- **קטן** - רק איקון
- **רגיל** - רק טקסט
- **מלא** - איקון + טקסט

## ארכיטקטורה

### מערכת בסיסית - כפתורים בודדים
- **מיקום**: `trading-ui/scripts/button-icons.js`
- **תפקיד**: ניהול מרכזי של כפתורים בודדים
- **טעינה**: נטען בכל העמודים לפני הסקריפטים הספציפיים

### מערכת מתקדמת - כפתורי פעולות לטבלאות
- **מיקום**: `trading-ui/scripts/button-system-init.js`
- **תפקיד**: ניהול כפתורי פעולות לטבלאות דינמיות
- **פונקציות**: `AdvancedButtonSystem`, `initializeButtons`

### מערכת משתני צבע
- **מיקום**: `trading-ui/styles-new/01-settings/_color-variables.css`
- **תפקיד**: הגדרת משתני CSS דינמיים לכל סוג כפתור
- **תכונות**: התאמה אישית של צבעים, גודל, ופדינג

## שימוש במערכת החדשה

### יצירת כפתור בסיסי
```html
<button data-button-type="EDIT" data-onclick="editRecord()"></button>
```

### יצירת כפתור עם וריאציה ספציפית
```html
<!-- וריאציה קטנה - רק איקון -->
<button data-button-type="EDIT" data-variant="small" data-onclick="editRecord()"></button>

<!-- וריאציה רגילה - רק טקסט -->
<button data-button-type="EDIT" data-variant="normal" data-onclick="editRecord()"></button>

<!-- וריאציה מלאה - איקון + טקסט (ברירת מחדל) -->
<button data-button-type="EDIT" data-variant="full" data-onclick="editRecord()"></button>
```

### יצירת כפתור עם מחלקות נוספות
```html
<button data-button-type="EDIT" data-classes="btn-sm btn-outline" data-onclick="editRecord()"></button>
```

### יצירת כפתור עם תכונות נוספות
```html
<button data-button-type="EDIT" data-attributes="data-bs-toggle='modal' data-bs-target='#editModal'" data-onclick="editRecord()"></button>
```

## משתני צבע דינמיים

כל כפתור משתמש במשתנה CSS דינמי שניתן להתאים אישית:

```css
:root {
    /* כפתורי פעולה */
    --color-action-edit: #6c757d;      /* אפור לעריכה */
    --color-action-delete: #dc3545;    /* אדום למחיקה */
    --color-action-add: #28a745;       /* ירוק להוספה */
    --color-action-save: #28a745;      /* ירוק לשמירה */
    --color-action-cancel: #6c757d;    /* אפור לביטול */
    --color-action-link: #17a2b8;      /* כחול לקישור */
    --color-action-close: #6c757d;     /* אפור לסגירה */
    --color-action-refresh: #6c757d;   /* אפור לרענון */
    --color-action-export: #007bff;    /* כחול לייצוא */
    --color-action-import: #28a745;    /* ירוק לייבוא */
    --color-action-search: #17a2b8;    /* כחול לחיפוש */
    --color-action-filter: #6c757d;    /* אפור לסינון */
    --color-action-sort: #6c757d;      /* אפור למיון */
    --color-action-toggle: #ffc107;    /* צהוב להחלפה */
    --color-action-copy: #6c757d;      /* אפור להעתקה */
    --color-action-reactivate: #28a745; /* ירוק להפעלה מחדש */
}
```

### התאמה אישית של צבעים
```css
/* התאמה אישית למשתמש */
:root {
    --color-action-edit: #your-custom-color;
    --color-action-delete: #your-custom-color;
    /* ... */
}
```

## עמוד הדוגמאות

### עמוד עיצובים - `designs.html`
עמוד הדוגמאות מספק:
- **טבלה מפורטת** עם כל הכפתורים הזמינים
- **דוגמאות פעילות** לכל כפתור
- **קוד לשילוב** - HTML ישן וחדש
- **וריאציות תצוגה** - קטן, רגיל, מלא
- **משתני צבע** לכל כפתור
- **לוג מפורט** לאבחון בעיות

### גישה לעמוד
```
http://127.0.0.1:8080/designs
```

### תכונות העמוד
- **חיפוש כפתורים** - פילטר מהיר
- **סטטיסטיקות** - מספר כפתורים לפי קטגוריה
- **העתקת קוד** - העתקה מהירה לקליפבורד
- **דוגמאות וריאציות** - הצגת כל הוריאציות

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
