# דוח יישום כפתורים - עמוד תזרימי מזומנים

## 📋 סקירה כללית

דוח זה מתעד את כל הכפתורים שיושמו בעמוד תזרימי מזומנים (`cash_flows.html`), כולל הגדרותיהם, תכונותיהם והעדכונים שנדרשו במערכת הטעינה.

---

## 🎯 סוגי כפתורים שיושמו

### 1. כפתורי פעולות ראשיים (Header Actions)

#### כפתור העתקת לוג
```html
<button data-button-type="COPY" 
        data-variant="full" 
        data-onclick="copyDetailedLog()" 
        data-text="העתק לוג מפורט" 
        title="העתק לוג מפורט">
</button>
```
- **סוג**: COPY
- **וריאנט**: full
- **פונקציה**: העתקת לוג מפורט לקליפבורד
- **מיקום**: חלק עליון של העמוד

#### כפתור הצגה/הסתרה (חלק עליון)
```html
<button data-button-type="TOGGLE" 
        data-variant="small" 
        data-onclick="toggleSection('top')" 
        data-text="הצג/הסתר">
</button>
```
- **סוג**: TOGGLE
- **וריאנט**: small
- **פונקציה**: הצגה/הסתרה של חלק עליון
- **מיקום**: חלק עליון של העמוד

#### כפתור הוספת תזרים
```html
<button data-button-type="ADD" 
        data-entity-type="cash_flow" 
        data-variant="full" 
        data-onclick="showAddModal()" 
        data-text="הוסף תזרים מזומנים" 
        title="הוסף תזרים מזומנים חדש">
</button>
```
- **סוג**: ADD
- **וריאנט**: full
- **ישות**: cash_flow
- **פונקציה**: פתיחת מודל הוספת תזרים
- **מיקום**: מעל הטבלה

#### כפתור הצגה/הסתרה (טבלה)
```html
<button data-button-type="TOGGLE" 
        data-variant="small" 
        data-onclick="toggleSection('main')" 
        data-text="הצג/הסתר">
</button>
```
- **סוג**: TOGGLE
- **וריאנט**: small
- **פונקציה**: הצגה/הסתרה של הטבלה הראשית
- **מיקום**: מעל הטבלה

### 2. כפתורי מיון (Sortable Headers)

#### כפתורי מיון עמודות
```html
<!-- דוגמה לעמודת חשבון -->
<button class="btn btn-link sortable-header" 
        onclick="if (typeof window.sortTable === 'function') { window.sortTable(0); }" 
        style="border: none; background: none; padding: 0; margin: 0; width: 100%; text-align: center; color: inherit; text-decoration: none;">
    חשבון <span class="sort-icon">↕</span>
</button>
```

**עמודות עם מיון:**
1. **חשבון** - `window.sortTable(0)`
2. **סוג** - `window.sortTable(1)`
3. **סכום** - `window.sortTable(2)`
4. **תאריך** - `window.sortTable(3)`
5. **תיאור** - `window.sortTable(4)`
6. **מקור** - `window.sortTable(5)`

- **סוג**: sortable-header
- **איקון**: ↕
- **פונקציה**: מיון הטבלה לפי עמודה
- **מיקום**: כותרות הטבלה

### 3. ActionsMenuSystem - תפריט פעולות נפתח

#### כפתור טריגר התפריט
```javascript
// נוצר דינמית ב-JavaScript
${window.createActionsMenu ? window.createActionsMenu([
  { type: 'LINK', onclick: `window.showLinkedItemsModal && window.showLinkedItemsModal([], 'cash_flow', ${cashFlow.id})`, text: 'צפה בפריטים מקושרים', title: 'צפה בפריטים מקושרים' },
  { type: 'EDIT', onclick: `showEditCashFlowModal(${cashFlow.id})`, text: 'ערוך תזרים', title: 'ערוך תזרים' },
  { type: 'DELETE', onclick: `deleteCashFlow(${cashFlow.id})`, text: 'מחק תזרים', title: 'מחק תזרים' }
]) : fallbackButtons}
```

**תכונות ActionsMenuSystem:**
- **כפתור טריגר**: איקון ⚙️ עם רקע לבן ומסגרת בצבע ישות
- **תפריט נפתח**: 3 כפתורי פעולה בצורה אופקית
- **כפתורי פעולה**:
  - 🔗 **LINK**: צפה בפריטים מקושרים
  - ✏️ **EDIT**: ערוך תזרים
  - 🗑️ **DELETE**: מחק תזרים
- **מיקום**: עמודת פעולות בטבלה (כל שורה)

### 4. כפתורי מודלים (Modal Buttons)

#### כפתור סגירה - מודל הוספה
```html
<button data-button-type="CLOSE" 
        data-entity-type="cash_flow" 
        data-size="large" 
        data-variant="small" 
        data-onclick="data-bs-dismiss='modal'" 
        data-text="" 
        title="סגור מודל" 
        aria-label="סגור">
</button>
```

#### כפתורי מודל הוספה
```html
<!-- כפתור ביטול -->
<button data-button-type="CANCEL" 
        data-onclick="data-bs-dismiss='modal'" 
        data-text="ביטול" 
        title="ביטול">
</button>

<!-- כפתור שמירה -->
<button data-button-type="SAVE" 
        data-entity-type="cash_flow" 
        data-onclick="saveForm()" 
        data-text="שמור" 
        title="שמור תזרים מזומנים">
</button>
```

#### כפתורי מודל עריכה
```html
<!-- כפתור סגירה -->
<button data-button-type="CLOSE" 
        data-entity-type="cash_flow" 
        data-size="large" 
        data-variant="small" 
        data-onclick="data-bs-dismiss='modal'" 
        data-text="" 
        title="סגור מודל" 
        aria-label="סגור">
</button>

<!-- כפתורי ביטול ושמירה (זהים למודל הוספה) -->
<button data-button-type="CANCEL" ...></button>
<button data-button-type="SAVE" ...></button>
```

---

## 🔧 הגדרות מערכת הכפתורים המרכזית

### משתני CSS דינמיים
```css
/* כפתור הטריגר של ActionsMenuSystem */
.actions-menu-wrapper .actions-trigger {
  background: white !important;
  border: 1px solid var(--current-entity-color, #26baac) !important;
  color: var(--current-entity-color, #26baac) !important;
}

.actions-menu-wrapper .actions-trigger:hover {
  background: var(--current-entity-color, #26baac) !important;
  border-color: var(--current-entity-color, #26baac) !important;
  color: white !important;
}

/* התפריט הנפתח */
.actions-menu-popup {
  background: white;
  border: 1px solid var(--current-entity-color, #26baac);
}
```

### איקונים ותכונות
- **ADD**: ➕ הוספה
- **TOGGLE**: ▼ הצגה/הסתרה
- **COPY**: 📋 העתקה
- **SORT**: ↕ מיון
- **CLOSE**: ✖️ סגירה
- **CANCEL**: ❌ ביטול
- **SAVE**: ✅ שמירה
- **LINK**: 🔗 קישור
- **EDIT**: ✏️ עריכה
- **DELETE**: 🗑️ מחיקה
- **MENU**: ⚙️ תפריט

---

## 📦 עדכונים שנדרשו במערכת הטעינה

### 1. הוספת העדפות צבעים
```javascript
// ב-cash_flows.js - הוספת 30+ העדפות צבעים
const preferences = await window.getPreferencesByNames([
  // העדפות בסיסיות...
  'pagination_size_cash_flows',
  'auto_refresh_interval',
  'default_currency',
  'show_currency_conversion',
  'date_format',
  'number_format',
  'cash_flows_display_mode',
  
  // ✅ חובה: צבעי ישויות
  'entityCashFlowColor',
  'entityCashFlowColorLight',
  'entityCashFlowColorDark',
  'entityTradeColor',
  'entityTradeColorLight',
  'entityTradeColorDark',
  'entityTickerColor',
  'entityTickerColorLight',
  'entityTickerColorDark',
  'entityAlertColor',
  'entityAlertColorLight',
  'entityAlertColorDark',
  'entityNoteColor',
  'entityNoteColorLight',
  'entityNoteColorDark',
  'entityExecutionColor',
  'entityExecutionColorLight',
  'entityExecutionColorDark',
  'entityTradePlanColor',
  'entityTradePlanColorLight',
  'entityTradePlanColorDark',
  'entityTradingAccountColor',
  'entityTradingAccountColorLight',
  'entityTradingAccountColorDark'
]);
```

### 2. עדכון package-manifest.js

#### הוספת button-icons.js לחבילת base
```javascript
{
  file: 'button-icons.js',
  globalCheck: 'window.BUTTON_ICONS',
  description: 'מערכת איקונים וכפתורים',
  required: true
}
```

#### הוספת color-scheme-system.js לחבילת base
```javascript
{
  file: 'color-scheme-system.js',
  globalCheck: 'window.loadDynamicColors',
  description: 'מערכת צבעים דינמית',
  required: true
}
```

#### הוספת actions-menu-system.js לחבילת crud
```javascript
{
  file: 'modules/actions-menu-system.js',
  globalCheck: 'window.createActionsMenu',
  description: 'מערכת תפריט פעולות נפתח',
  required: false
}
```

### 3. עדכון color-scheme-system.js

#### הוספת מיפוי עמודים לישויות
```javascript
const PAGE_ENTITY_MAP = {
  'cash-flows-page': 'cash_flow',
  // ... שאר העמודים
};
```

#### הוספת פונקציות לטעינת צבעים מהעדפות
```javascript
async function getEntityColorFromPreferences(entityType, variant = 'primary')
async function getAllEntityColorVariantsFromPreferences(entityType)
async function setCurrentEntityColorFromPage()
```

---

## 🎨 צבעים דינמיים

### משתני CSS שמוגדרים אוטומטית
- `--current-entity-color`: הצבע הראשי של הישות הנוכחית
- `--entity-cash-flow-color`: צבע תזרימי מזומנים ראשי
- `--entity-cash-flow-color-light`: צבע תזרימי מזומנים בהיר
- `--entity-cash-flow-color-dark`: צבע תזרימי מזומנים כהה

### איך זה עובד
1. המערכת מזהה את ה-class של העמוד (`cash-flows-page`)
2. ממפה אותו לישות (`cash_flow`)
3. טוען את הצבעים מהעדפות המשתמש
4. מגדיר את משתני ה-CSS
5. הכפתורים משתמשים בצבעים האלה

---

## 📊 סיכום סטטיסטיקות

### כמות כפתורים
- **כפתורי פעולות ראשיים**: 4
- **כפתורי מיון**: 6
- **כפתורי ActionsMenuSystem**: 3 לכל שורה (נוצרים דינמית)
- **כפתורי מודלים**: 6 (2 מודלים × 3 כפתורים)
- **סה"כ כפתורים סטטיים**: 16
- **כפתורים דינמיים**: 3 × מספר השורות

### סוגי כפתורים
- **ADD**: 1
- **TOGGLE**: 2
- **COPY**: 1
- **SORT**: 6
- **CLOSE**: 2
- **CANCEL**: 2
- **SAVE**: 2
- **LINK**: דינמי
- **EDIT**: דינמי
- **DELETE**: דינמי

### וריאנטים
- **full**: 2 (ADD, COPY)
- **small**: 4 (TOGGLE × 2, CLOSE × 2)
- **sortable**: 6 (כפתורי מיון)
- **actions-menu**: דינמי

---

## 🚀 תוצאות

### לפני היישום
- כפתורים סטטיים בלבד
- צבעים קבועים
- אין תפריט פעולות נפתח
- מיון בסיסי

### אחרי היישום
- ✅ מערכת כפתורים מרכזית מלאה
- ✅ צבעים דינמיים מהעדפות המשתמש
- ✅ ActionsMenuSystem מתקדם
- ✅ מיון מתקדם עם איקונים
- ✅ תמיכה מלאה ב-RTL
- ✅ אינטגרציה עם מערכת הצבעים הדינמית

---

**תאריך יצירה**: 20 ינואר 2025  
**מחבר**: TikTrack Development Team  
**גרסה**: 1.0
