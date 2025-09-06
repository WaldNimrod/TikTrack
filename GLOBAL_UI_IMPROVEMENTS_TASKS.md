# משימות שיפור ממשק משתמש כלליות - TikTrack

## 📅 תאריך יצירה
4 בינואר 2025

## 🎯 מטרת המסמך
מסמך זה מרכז את כל השינויים הכלליים שעשינו בעמוד הטיקרים, כדי שנוכל ליישם אותם במסודר בכל העמודים במערכת.

## 📋 תוכן עניינים
1. [שינויים בטבלאות](#שינויים-בטבלאות)
2. [שינויים ב-RTL](#שינויים-ב-rtl)
3. [שינויים בצבעים](#שינויים-בצבעים)
4. [שינויים במיון](#שינויים-במיון)
5. [שינויים בעיצוב](#שינויים-בעיצוב)
6. [רשימת משימות ליישום](#רשימת-משימות-ליישום)

---

## 🔧 שינויים בטבלאות

### 1. רוחב טבלאות - 100% תמיד
**קובץ:** `trading-ui/styles/table.css`

```css
/* הגדרות גלובליות לטבלאות */
table {
    table-layout: auto !important;
    width: 100% !important;
    min-width: 100% !important;
}

table, .table, .data-table {
    width: 100% !important;
    min-width: 100% !important;
    table-layout: auto !important;
}

table td, .table td, .data-table td {
    width: auto !important;
    min-width: 0 !important;
}

/* עדכון ספציפי לכל טבלה */
#tickersTable, #tradesTable, #trade_plansTable, #notesTable, #alertsTable, .trade-plans-table {
    table-layout: auto !important;
    width: 100% !important;
    min-width: 100% !important;
}
```

### 2. יישור מרכז לכל הכותרות
**קובץ:** `trading-ui/styles/table.css`

```css
table th, .table th, .data-table th {
    text-align: center !important;
}
```

### 3. יישור מספרים ואייקונים
**קובץ:** `trading-ui/styles/table.css`

```css
/* יישור מרכז למספרים ואייקונים */
#tickersTable td:nth-child(3), /* Has Trades */
#tickersTable td:nth-child(4), /* Current Price */
#tickersTable td:nth-child(5), /* Change % */
#tickersTable td:nth-child(9)  /* Updated */
{
    text-align: center !important;
    direction: ltr !important;
}
```

---

## 🌐 שינויים ב-RTL

### 1. סגנונות RTL לטבלאות
**קובץ:** `trading-ui/styles/table.css`

```css
/* RTL ספציפי לטבלת טיקרים */
#tickersTable {
    direction: rtl !important;
    text-align: right !important;
}

#tickersTable th {
    text-align: center !important;
}
```

### 2. סגנונות RTL למודלים
**קובץ:** `trading-ui/styles/styles.css`

```css
/* RTL למודלים */
.modal-header {
    direction: rtl !important;
    text-align: right !important;
}

.modal-body {
    direction: rtl !important;
    text-align: right !important;
}

.modal-footer {
    direction: rtl !important;
    text-align: right !important;
}
```

### 3. סגנונות RTL למודלים מקושרים
**קובץ:** `trading-ui/styles/linked-items.css`

```css
.linked-items-container {
    direction: rtl !important;
    text-align: right !important;
}

.linked-item-row {
    direction: rtl !important;
    text-align: right !important;
}

.linked-item-title {
    direction: rtl !important;
    text-align: right !important;
}

.linked-item-description {
    direction: rtl !important;
    text-align: right !important;
}

.linked-item-actions {
    justify-content: flex-start;
}
```

---

## 🎨 שינויים בצבעים

### 1. CSS Variables עם ערכי ברירת מחדל
**קובץ:** `trading-ui/styles/styles.css`

```css
:root {
    /* Entity Colors with Default Values */
    --entity-ticker-color: #019193;
    --entity-ticker-bg: #01919399;
    --entity-ticker-border: #019193;
    
    --entity-account-color: #1b0b75;
    --entity-account-bg: #1b0b7599;
    --entity-account-border: #1b0b75;
    
    --entity-preference-color: #adb5bd;
    --entity-preference-bg: #adb5bd99;
    --entity-preference-border: #adb5bd;
    
    --entity-trade-color: #28a745;
    --entity-trade-bg: #28a74599;
    --entity-trade-border: #28a745;
    
    --entity-alert-color: #ff9c05;
    --entity-alert-bg: #ff9c0599;
    --entity-alert-border: #ff9c05;
    
    --entity-cash-flow-color: #20c997;
    --entity-cash-flow-bg: #20c99799;
    --entity-cash-flow-border: #20c997;
    
    --entity-note-color: #6f42c1;
    --entity-note-bg: #6f42c199;
    --entity-note-border: #6f42c1;
    
    --entity-trade-plan-color: #0056b3;
    --entity-trade-plan-bg: #0056b399;
    --entity-trade-plan-border: #0056b3;
    
    --entity-execution-color: #17a2b8;
    --entity-execution-bg: #17a2b899;
    --entity-execution-border: #17a2b8;
}
```

### 2. סגנונות כותרות עם CSS Variables
**קובץ:** `trading-ui/styles/styles.css`

```css
/* Entity Header Styles with CSS Variables */
.entity-ticker-main-header {
    background-color: var(--entity-ticker-bg);
    border-left: 4px solid var(--entity-ticker-border);
}

.entity-ticker-sub-header {
    background-color: var(--entity-ticker-bg);
    border-left: 3px solid var(--entity-ticker-border);
}

/* תמיכה בפורמט plural (עם 's') לתאימות */
.entity-tickers-main-header {
    background-color: var(--entity-ticker-bg);
    border-left: 4px solid var(--entity-ticker-border);
}

.entity-tickers-sub-header {
    background-color: var(--entity-ticker-bg);
    border-left: 3px solid var(--entity-ticker-border);
}

.entity-account-main-header {
    background-color: var(--entity-account-bg);
    border-left: 4px solid var(--entity-account-border);
}

.entity-account-sub-header {
    background-color: var(--entity-account-bg);
    border-left: 3px solid var(--entity-account-border);
}

.entity-preference-main-header {
    background-color: var(--entity-preference-bg);
    border-left: 4px solid var(--entity-preference-border);
}

.entity-preference-sub-header {
    background-color: var(--entity-preference-bg);
    border-left: 3px solid var(--entity-preference-border);
}

.entity-trade-main-header {
    background-color: var(--entity-trade-bg);
    border-left: 4px solid var(--entity-trade-border);
}

.entity-trade-sub-header {
    background-color: var(--entity-trade-bg);
    border-left: 3px solid var(--entity-trade-border);
}

.entity-alert-main-header {
    background-color: var(--entity-alert-bg);
    border-left: 4px solid var(--entity-alert-border);
}

.entity-alert-sub-header {
    background-color: var(--entity-alert-bg);
    border-left: 3px solid var(--entity-alert-border);
}

.entity-cash-flow-main-header {
    background-color: var(--entity-cash-flow-bg);
    border-left: 4px solid var(--entity-cash-flow-border);
}

.entity-cash-flow-sub-header {
    background-color: var(--entity-cash-flow-bg);
    border-left: 3px solid var(--entity-cash-flow-border);
}

.entity-note-main-header {
    background-color: var(--entity-note-bg);
    border-left: 4px solid var(--entity-note-border);
}

.entity-note-sub-header {
    background-color: var(--entity-note-bg);
    border-left: 3px solid var(--entity-note-border);
}

.entity-trade-plan-main-header {
    background-color: var(--entity-trade-plan-bg);
    border-left: 4px solid var(--entity-trade-plan-border);
}

.entity-trade-plan-sub-header {
    background-color: var(--entity-trade-plan-bg);
    border-left: 3px solid var(--entity-trade-plan-border);
}

.entity-execution-main-header {
    background-color: var(--entity-execution-bg);
    border-left: 4px solid var(--entity-execution-border);
}

.entity-execution-sub-header {
    background-color: var(--entity-execution-bg);
    border-left: 3px solid var(--entity-execution-border);
}
```

### 3. תיקון בעיית Race Condition בצבעי כותרות
**בעיה:** שתי פונקציות יצרו מחלקות שונות לאותה כותרת:
- `color-scheme-system.js` יצרה `entity-tickers-main-header` (עם 's')
- `preferences-v2.js` יצרה `entity-ticker-main-header` (בלי 's')

**תיקון:** `trading-ui/scripts/color-scheme-system.js`

```javascript
// לפני התיקון:
const type = entityType.replace('-page', '').replace('cash-flows', 'cash_flow');
// tickers-page → tickers (עם 's')

// אחרי התיקון:
let type = entityType.replace('-page', '');
// תיקון שמות ישויות לפורמט יחיד
if (type === 'tickers') type = 'ticker';
else if (type === 'trades') type = 'trade';
else if (type === 'accounts') type = 'account';
else if (type === 'alerts') type = 'alert';
else if (type === 'cash-flows') type = 'cash-flow';
else if (type === 'notes') type = 'note';
else if (type === 'trade-plans') type = 'trade-plan';
else if (type === 'executions') type = 'execution';
// tickers-page → ticker (בלי 's')
```

**תוצאה:** עכשיו תמיד תקבל רק `entity-ticker-main-header` ולא יהיה race condition!

### 4. מערכת צבעים דינמית
**קובץ:** `trading-ui/scripts/color-scheme-system.js`

```javascript
// פונקציה לטעינת צבעי ישויות מהעדפות
function loadEntityColorsFromPreferences(preferences) {
    if (preferences.entityColors) {
        ENTITY_COLORS = preferences.entityColors;
        // חישוב צבעי רקע וגבולות
        ENTITY_BACKGROUND_COLORS = {};
        ENTITY_BORDER_COLORS = {};
        ENTITY_TEXT_COLORS = {};
        
        Object.keys(ENTITY_COLORS).forEach(entityType => {
            const color = ENTITY_COLORS[entityType];
            ENTITY_BACKGROUND_COLORS[entityType] = color + '99'; // שקיפות
            ENTITY_BORDER_COLORS[entityType] = color;
            ENTITY_TEXT_COLORS[entityType] = color;
        });
        
        // יצירת CSS דינמי
        generateAndApplyEntityCSS();
    }
}

// פונקציה ליצירת CSS דינמי
function generateAndApplyEntityCSS() {
    try {
        const newCSS = generateEntityCSS();
        let styleElement = document.getElementById('dynamic-entity-colors');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'dynamic-entity-colors';
            document.head.appendChild(styleElement);
        }
        styleElement.textContent = newCSS;
        console.log('✅ CSS דינמי נוצר והוחל על הדף');
    } catch (error) {
        console.error('❌ שגיאה ביצירת CSS דינמי:', error);
    }
}
```

---

## 🔄 שינויים במיון

### 1. מערכת מיון גלובלית
**קובץ:** `trading-ui/scripts/tables.js`

```javascript
// פונקציה לסידור ברירת מחדל
window.applyDefaultSort = function (tableType, data, updateFunction) {
    const sortState = window.getSortState(tableType);
    if (!sortState || sortState.columnIndex === null || sortState.columnIndex === undefined) {
        window.sortTableData(0, data, tableType, updateFunction);
    }
};

// פונקציה לסידור מותאם אישית
function getCustomSortValue(a, b, columnIndex, tableType, aValue, bValue) {
    if (tableType === 'tickers') {
        if (columnIndex === 1) { // Status
            const statusOrder = { 'open': 1, 'closed': 2, 'cancelled': 3 };
            return (statusOrder[aValue] || 999) - (statusOrder[bValue] || 999);
        }
        if (columnIndex === 2) { // Active trades
            const aHasTrades = aValue === true || aValue === 1 || aValue === 'true' || aValue === '1';
            const bHasTrades = bValue === true || bValue === 1 || bValue === 'true' || bValue === '1';
            if (aHasTrades && !bHasTrades) return -1;
            if (!aHasTrades && bHasTrades) return 1;
            return 0;
        }
        if (columnIndex === 4) { // Change percent
            const aNum = parseFloat(aValue) || 0;
            const bNum = parseFloat(bValue) || 0;
            if (aNum > 0 && bNum < 0) return -1;
            if (aNum < 0 && bNum > 0) return 1;
            return aNum - bNum;
        }
    }
    return null;
}
```

### 2. עדכון מפת עמודות
**קובץ:** `trading-ui/scripts/table-mappings.js`

```javascript
// עדכון מפת עמודות לטיקרים
'tickers': [
    'symbol', 'status', 'active_trades', 'current_price', 'change_percent', 'type', 'name', 'remarks', 'yahoo_updated_at',
],
```

---

## 🎨 שינויים בעיצוב

### 1. פונקציה לחישוב משך זמן
**קובץ:** `trading-ui/scripts/tickers.js` (להעתיק לכל עמוד)

```javascript
function getTimeDuration(dateString) {
    if (!dateString) return '00:00:00';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
```

### 2. עיצוב עמודת "יש טריידים" עם אייקונים
**קובץ:** `trading-ui/scripts/tickers.js` (להתאים לכל עמוד)

```javascript
// עמודת Has Trades עם אייקונים
const hasTradesIcon = ticker.active_trades ? 
    '<span class="btn btn-sm btn-success">✓</span>' : 
    '<span class="btn btn-sm btn-danger">✗</span>';
```

### 3. עיצוב מספרים עם 2 ספרות אחרי הנקודה
**קובץ:** `trading-ui/scripts/tickers.js` (להתאים לכל עמוד)

```javascript
// עיצוב מחיר עם 2 ספרות אחרי הנקודה
const formattedPrice = parseFloat(ticker.current_price).toFixed(2);

// עיצוב שינוי אחוז עם 2 ספרות אחרי הנקודה
const formattedChange = parseFloat(ticker.change_percent).toFixed(2);
```

---

## 📝 רשימת משימות ליישום

### עמוד 1: עמוד טריידים (trades.html)
- [ ] **עדכון HTML** - הוספת עמודת "עודכן" אחרי עמודת הערות
- [ ] **עדכון CSS** - הוספת רוחב עמודות חדש
- [ ] **עדכון JavaScript** - הוספת פונקציית `getTimeDuration`
- [ ] **עדכון מיון** - הוספת סידור מותאם אישית
- [ ] **עדכון RTL** - הוספת סגנונות RTL
- [ ] **עדכון צבעים** - הוספת מחלקות כותרות
- [ ] **תיקון Race Condition** - תיקון בעיית מחלקות כפולות

### עמוד 2: עמוד חשבונות (accounts.html)
- [ ] **עדכון HTML** - הוספת עמודת "עודכן" אחרי עמודת הערות
- [ ] **עדכון CSS** - הוספת רוחב עמודות חדש
- [ ] **עדכון JavaScript** - הוספת פונקציית `getTimeDuration`
- [ ] **עדכון מיון** - הוספת סידור מותאם אישית
- [ ] **עדכון RTL** - הוספת סגנונות RTL
- [ ] **עדכון צבעים** - הוספת מחלקות כותרות
- [ ] **תיקון Race Condition** - תיקון בעיית מחלקות כפולות

### עמוד 3: עמוד התראות (alerts.html)
- [ ] **עדכון HTML** - הוספת עמודת "עודכן" אחרי עמודת הערות
- [ ] **עדכון CSS** - הוספת רוחב עמודות חדש
- [ ] **עדכון JavaScript** - הוספת פונקציית `getTimeDuration`
- [ ] **עדכון מיון** - הוספת סידור מותאם אישית
- [ ] **עדכון RTL** - הוספת סגנונות RTL
- [ ] **עדכון צבעים** - הוספת מחלקות כותרות
- [ ] **תיקון Race Condition** - תיקון בעיית מחלקות כפולות

### עמוד 4: עמוד תזרים מזומנים (cash-flows.html)
- [ ] **עדכון HTML** - הוספת עמודת "עודכן" אחרי עמודת הערות
- [ ] **עדכון CSS** - הוספת רוחב עמודות חדש
- [ ] **עדכון JavaScript** - הוספת פונקציית `getTimeDuration`
- [ ] **עדכון מיון** - הוספת סידור מותאם אישית
- [ ] **עדכון RTL** - הוספת סגנונות RTL
- [ ] **עדכון צבעים** - הוספת מחלקות כותרות
- [ ] **תיקון Race Condition** - תיקון בעיית מחלקות כפולות

### עמוד 5: עמוד הערות (notes.html)
- [ ] **עדכון HTML** - הוספת עמודת "עודכן" אחרי עמודת הערות
- [ ] **עדכון CSS** - הוספת רוחב עמודות חדש
- [ ] **עדכון JavaScript** - הוספת פונקציית `getTimeDuration`
- [ ] **עדכון מיון** - הוספת סידור מותאם אישית
- [ ] **עדכון RTL** - הוספת סגנונות RTL
- [ ] **עדכון צבעים** - הוספת מחלקות כותרות
- [ ] **תיקון Race Condition** - תיקון בעיית מחלקות כפולות

### עמוד 6: עמוד תכנון טריידים (trade-plans.html)
- [ ] **עדכון HTML** - הוספת עמודת "עודכן" אחרי עמודת הערות
- [ ] **עדכון CSS** - הוספת רוחב עמודות חדש
- [ ] **עדכון JavaScript** - הוספת פונקציית `getTimeDuration`
- [ ] **עדכון מיון** - הוספת סידור מותאם אישית
- [ ] **עדכון RTL** - הוספת סגנונות RTL
- [ ] **עדכון צבעים** - הוספת מחלקות כותרות
- [ ] **תיקון Race Condition** - תיקון בעיית מחלקות כפולות

### עמוד 7: עמוד ביצועים (executions.html)
- [ ] **עדכון HTML** - הוספת עמודת "עודכן" אחרי עמודת הערות
- [ ] **עדכון CSS** - הוספת רוחב עמודות חדש
- [ ] **עדכון JavaScript** - הוספת פונקציית `getTimeDuration`
- [ ] **עדכון מיון** - הוספת סידור מותאם אישית
- [ ] **עדכון RTL** - הוספת סגנונות RTL
- [ ] **עדכון צבעים** - הוספת מחלקות כותרות
- [ ] **תיקון Race Condition** - תיקון בעיית מחלקות כפולות

---

## 🔧 קבצים לעדכון

### קבצי CSS
- `trading-ui/styles/table.css` - עדכון רוחב טבלאות ויישור
- `trading-ui/styles/styles.css` - הוספת CSS Variables וסגנונות כותרות
- `trading-ui/styles/linked-items.css` - עדכון RTL למודלים מקושרים

### קבצי JavaScript
- `trading-ui/scripts/tables.js` - עדכון מערכת מיון גלובלית
- `trading-ui/scripts/table-mappings.js` - עדכון מפת עמודות
- `trading-ui/scripts/color-scheme-system.js` - עדכון מערכת צבעים + תיקון race condition
- `trading-ui/scripts/preferences-v2.js` - עדכון מערכת העדפות

### קבצי HTML (לכל עמוד)
- הוספת עמודת "עודכן" אחרי עמודת הערות
- עדכון מחלקות כותרות
- הוספת סגנונות RTL

---

## 📊 סיכום

**סה"כ עמודים לעדכון:** 7 עמודים
**סה"כ משימות:** 42 משימות (6 משימות × 7 עמודים)
**קבצים לעדכון:** 8 קבצים

**עדיפות:**
1. **גבוהה** - עמוד טריידים, עמוד חשבונות
2. **בינונית** - עמוד התראות, עמוד תזרים מזומנים
3. **נמוכה** - עמוד הערות, עמוד תכנון טריידים, עמוד ביצועים

---

**סוף המסמך**

*מסמך זה עודכן לאחרונה ב-4 בינואר 2025*
