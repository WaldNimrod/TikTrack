# Table Sorting System - TikTrack
# מערכת מיון טבלאות מאוחדת

**תאריך עדכון:** 20 נובמבר 2025  
**גרסה:** 2.1.0  
**סטטוס:** ✅ פעיל ומתועד  
**מטרה:** מערכת מיון מרכזית עם תמיכה בסידור ברירת מחדל ושמירת מצב

**עדכון אחרון:** הוספת מיון ברירת מחדל אוטומטי לכל הטבלאות - תאריך desc (החדש ראשון)

---

## 📋 סקירה כללית

מערכת המיון המאוחדת של TikTrack מספקת פתרון מרכזי, אחיד ואמין למיון כל הטבלאות במערכת. המערכת משתמשת ב-UnifiedCacheManager בלבד לשמירת מצב ומאפשרת הגדרת סידור ברירת מחדל לכל טבלה.

### תכונות עיקריות:
- **רישום מרכזי** - כל טבלה נרשמת פעם אחת ב-UnifiedTableSystem
- **סידור אחיד** - כל הטבלאות משתמשות באותו מנגנון מיון
- **סידור הפוך** - לחיצה שנייה על עמודה הופכת את כיוון הסידור
- **סידור ברירת מחדל** - הגדרה פשוטה בקוד הרישום
- **שמירת מצב** - מצב סידור נשמר ב-localStorage דרך UnifiedCacheManager
- **הודעות אזהרה** - אם טבלה לא רשומה, מוצגת הודעת אזהרה

---

## 🏗️ ארכיטקטורה

### רכיבים מרכזיים:

#### 1. UnifiedTableSystem
**קובץ:** `trading-ui/scripts/unified-table-system.js`

מערכת מרכזית לניהול טבלאות הכוללת:
- **TableRegistry** - רישום טבלאות
- **TableSorter** - סידור טבלאות
- **TableStateManager** - ניהול מצב (משתמש ב-UnifiedCacheManager בלבד)

#### 2. TableSorter
**קלאס:** `TableSorter`

**פונקציות מרכזיות:**
- `sort(tableType, columnIndex)` - סידור טבלה לפי עמודה
- `sortByChain(tableType, sortChain)` - סידור לפי שרשרת מיון (תאריך, סטטוס, טיקר)
- `applyDefaultSort(tableType)` - החלת סידור ברירת מחדל אם אין מצב שמור
- `getSortState(tableType)` - קבלת מצב סידור
- `saveSortState(tableType, columnIndex, direction)` - שמירת מצב סידור

#### 3. buildCanonDefaultSortChain
**קובץ:** `trading-ui/scripts/table-mappings.js`  
**פונקציה:** `buildCanonDefaultSortChain(tableType)`

יוצרת שרשרת מיון ברירת מחדל אוטומטית:
1. מחפשת עמודת תאריך (created_at, date, updated_at, וכו') → desc
2. מחפשת עמודת סטטוס → asc
3. מחפשת עמודת טיקר → asc
4. אם אין כלום → fallback לעמודה ראשונה asc

#### 3. PageStateManager
**קובץ:** `trading-ui/scripts/page-state-manager.js`

מנהל מצב מרכזי לכל עמודי המערכת:
- שמירה/טעינה של מצב מלא: filters, sort, sections, entityFilters
- שימוש רק ב-UnifiedCacheManager
- מפתחות cache: `pageState_${pageName}`

#### 4. TableSortValueAdapter (חדש)
**קובץ:** `trading-ui/scripts/services/table-sort-value-adapter.js`

שכבת ביניים שמתרגמת ערכי עמודות (DateEnvelope, ISO strings, מספרים, טקסטים) ל־sort key אחיד:
- `type: 'dateEnvelope'` → שימוש ב־`epochMs` מה־Envelope.
- `type: 'date'` → fallback עבור מחרוזות ISO/legacy.
- ניתן להרחיב לטיפוסים נוספים (למשל `numeric-string`, `boolean`).

ה־Adapter הוא החוליה המחברת בין מסמך DATE_ENVELOPE_BLUEPRINT לבין UnifiedTableSystem: כל שינוי בפורמט התאריכים נעשה במקום אחד.

**זרימת Envelope → Sort Key:**
1. השירות בצד השרת עוטף כל תאריך ב־`DateEnvelope` (`utc`, `epochMs`, `local`, `display`).
2. `table-mappings.js` מגדיר עבור העמודה `sortType: 'dateEnvelope'` ומעביר את האובייקט ל־Adapter.
3. `getSortValue()` מחלץ את `epochMs` (או fallback מוגדר) ומחזיר מספר יחיד להשוואה.
4. `TableSorter` משתמש במספר בלבד ומעדכן את הטבלה בלי לבצע `Date.parse` או המרות לוקליות.
5. כאשר טבלה עדיין צורכת מחרוזות ISO, אפשר להגדיר `sortType: 'date'` עד להשלמת המיגרציה.

---

## 🔧 API Documentation

### רישום טבלה

כל טבלה חייבת להירשם ב-UnifiedTableSystem עם הקונפיגורציה הבאה:

```javascript
window.register[TabelName]Tables = function() {
    if (!window.UnifiedTableSystem) {
        window.Logger?.warn('⚠️ UnifiedTableSystem not available', { page: "[page]" });
        return;
    }

    const getColumns = (tableType) => {
        return window.TABLE_COLUMN_MAPPINGS?.[tableType] || [];
    };

    window.UnifiedTableSystem.registry.register('[tableType]', {
        dataGetter: () => {
            return window.[tableType]Data || [];
        },
        updateFunction: (data) => {
            if (typeof window.update[TableType]Table === 'function') {
                window.update[TableType]Table(data);
            }
        },
        tableSelector: '#[tableId]',
        columns: getColumns('[tableType]'),
        sortable: true,
        filterable: true,
        // Default sort: תאריך desc (החדש ראשון) או עמודה ראשונה asc אם אין תאריך
        defaultSort: { columnIndex: 1, direction: 'desc', key: 'created_at' }
    });
};
```

### קריאה לרישום

הרישום צריך להתבצע אחרי טעינת הנתונים:

```javascript
async function load[TableName]Data() {
    // ... טעינת נתונים ...
    
    // עדכון הטבלה
    update[TableName]Table(data);
    
    // Register table with UnifiedTableSystem after data is loaded
    if (typeof window.register[TableName]Tables === 'function') {
        window.register[TableName]Tables();
    }
}
```

### סידור ברירת מחדל

סידור ברירת מחדל מוגדר בקונפיגורציית הרישום:

```javascript
// טבלה עם תאריך - מיון לפי תאריך desc (החדש ראשון)
defaultSort: { columnIndex: 6, direction: 'desc', key: 'created_at' }

// טבלה ללא תאריך - מיון לפי עמודה ראשונה asc
defaultSort: { columnIndex: 0, direction: 'asc', key: 'ticker_symbol' }
```

**אם לא מוגדר `defaultSort` מפורש:**
- המערכת תנסה לקבל מיון ברירת מחדל אוטומטי מ-`buildCanonDefaultSortChain`
- הפונקציה מחפשת תאריך → desc, ואז סטטוס → asc, ואז טיקר → asc
- אם אין כלום → fallback לעמודה ראשונה asc

**המערכת תבדוק אם יש מצב שמור:**
- אם יש מצב שמור - תשתמש בו
- אם אין מצב שמור - תפעיל את סידור ברירת המחדל (מפורש או אוטומטי)

### שמירת מצב סידור

המצב נשמר אוטומטית דרך UnifiedCacheManager:

```javascript
// שמירה אוטומטית בעת סידור
await window.saveSortState(tableType, columnIndex, direction);

// טעינה אוטומטית בטעינת עמוד
const sortState = await window.getSortState(tableType);
```

**מפתחות cache:**
- `sortState_${tableType}` - מצב כללי לטבלה
- `sortState_${tableType}_col_${columnIndex}` - מצב ספציפי לעמודה

### הגדרת sortType במיפויי הטבלאות

ב`table-mappings.js` לכל עמודה ניתן להגדיר `sortType`. דוגמאות:

```javascript
TABLE_COLUMN_MAPPINGS['trade_suggestions'] = [
  { key: 'trade_envelope', sortType: 'dateEnvelope' },
  { key: 'score', sortType: 'number' },
  // ...
];
```

אם שדה מחזיר `DateEnvelope`, ה־Adapter ידאג למיון תקין גם כשקיימות העדפות timezone שונות.

---

## 📝 רשימת טבלאות רשומות

כל הטבלאות המרכזיות רשומות במערכת:

| טבלה | tableType | קובץ רישום | defaultSort |
|------|-----------|------------|-------------|
| טריידים | `trades` | `trades.js` | created_at (10), desc |
| תכנונים | `trade_plans` | `trade_plans.js` | created_at (1), desc |
| ביצועים | `executions` | `executions.js` | date (8), desc |
| תזרימי מזומן | `cash_flows` | `cash_flows.js` | date (4), desc |
| התראות | `alerts` | `alerts.js` | created_at (6), desc |
| הערות | `notes` | `notes.js` | created_at (2), desc |
| טיקרים | `tickers` | `tickers.js` | updated_at (8), desc |
| חשבונות מסחר | `trading_accounts` | `trading_accounts.js` | updated_at (6), desc |
| פעילות חשבון | `account_activity` | `trading_accounts.js` | date (0), desc |
| פוזיציות | `positions` | `trading_accounts.js` | ticker_symbol (0), asc |
| פורטפוליו | `portfolio` | `trading_accounts.js` | ticker_symbol (1), asc |
| פריטים מקושרים | `linked_items` | `entity-details-renderer.js` | created_at (4), desc |
| ביצועי פוזיציה | `position_executions` | `entity-details-renderer.js` | date (0), desc |
| המלצות שיוך | `trade_suggestions` | `executions.js` | trade_created_at (5), desc |
| קטגוריות תגיות | `tag_categories` | `tag-management-page.js` | updated_at (3), desc |
| תגיות | `tags` | `tag-management-page.js` | last_used_at (4), desc |
| לוח שימוש תגיות | `tag_usage_leaderboard` | `tag-management-page.js` | tag_name (0), asc |
| היסטוריית ייבוא | `import_history` | `data_import.js` | created_at (8), desc |

---

## ⚠️ הודעות אזהרה

אם טבלה לא רשומה במערכת והמשתמש מנסה למיין:

1. **הודעת אזהרה** מוצגת למשתמש דרך `showWarningNotification`
2. **רישום בלוג** דרך `window.Logger.warn`
3. **החזרת מערך ריק** - לא מתבצע סידור

**דוגמה:**
```javascript
// בטבלה לא רשומה
const warningMessage = `הטבלה "${tableType}" לא רשומה במערכת המיון המאוחדת. נא לרשום את הטבלה ב-UnifiedTableSystem.`;
window.showWarningNotification('טבלה לא רשומה', warningMessage, 6000, 'system');
```

---

## 🔄 אינטגרציה עם UnifiedCacheManager

**כל פעולות המטמון חייבת להתבצע רק דרך UnifiedCacheManager!**

### שמירת מצב סידור:
```javascript
await window.UnifiedCacheManager.save(`sortState_${tableType}`, sortState, {
    layer: 'localStorage',
    ttl: null, // persistent
    syncToBackend: false
});
```

### טעינת מצב סידור:
```javascript
const sortState = await window.UnifiedCacheManager.get(`sortState_${tableType}`, {
    layer: 'localStorage'
});
```

---

## 🚀 שימוש

### סידור טבלה ידני:
```javascript
// דרך UnifiedTableSystem
window.UnifiedTableSystem.sorter.sort('trades', 0);

// דרך wrapper (משתמש ב-UnifiedTableSystem אוטומטית)
window.sortTable('trades', 0);
```

### שחזור מצב סידור:
```javascript
// שחזור מצב שמור או סידור ברירת מחדל
await window.restoreAnyTableSort('trades', data, updateTradesTable);
```

### החלת סידור ברירת מחדל:
```javascript
// רק אם אין מצב שמור
await window.applyDefaultSort('trades', data, updateTradesTable);
```

---

## 📚 קבצים קשורים

- `trading-ui/scripts/unified-table-system.js` - מערכת הטבלאות המאוחדת
- `trading-ui/scripts/tables.js` - פונקציות סידור גלובליות
- `trading-ui/scripts/page-state-manager.js` - מנהל מצב עמודים
- `trading-ui/scripts/unified-cache-manager.js` - מערכת המטמון המאוחדת
- `trading-ui/scripts/table-mappings.js` - מיפוי עמודות

---

## 🔍 בדיקות

### בדיקת רישום טבלה:
```javascript
if (window.UnifiedTableSystem.registry.isRegistered('trades')) {
    console.log('✅ טבלת trades רשומה');
}
```

### בדיקת מצב סידור:
```javascript
const sortState = await window.getSortState('trades');
console.log('מצב סידור:', sortState);
```

---

## 📝 הערות חשובות

1. **אין fallback** - אם טבלה לא רשומה, מוצגת הודעת אזהרה ולא מתבצע סידור
2. **שימוש רק ב-UnifiedCacheManager** - כל פעולות המטמון דרך UnifiedCacheManager בלבד
3. **סידור ברירת מחדל** - מוגדר בקונפיגורציית הרישום, מופעל רק אם אין מצב שמור
4. **שמירת מצב אוטומטית** - מצב סידור נשמר אוטומטית בעת סידור

---

---

## 🆕 עדכון נובמבר 2025

### מיון ברירת מחדל אוטומטי

כל הטבלאות במערכת עכשיו ממוינות כברירת מחדל:
- **טבלאות עם תאריך:** מיון לפי תאריך desc (החדש ראשון)
- **טבלאות ללא תאריך:** מיון לפי עמודה ראשונה asc

**שרשרת מיון אוטומטית:**
1. תאריך desc (חובה אם קיים)
2. סטטוס asc (אם קיים)
3. טיקר asc (אם קיים)
4. fallback לעמודה ראשונה asc

**תיקונים שבוצעו:**
- שיפור `_normalizeDefaultSort` לקריאה ל-`getDefaultSortChain` גם אם `defaultSortConfig` הוא `undefined`
- שיפור `applyDefaultSort` לניסיון לקבל `defaultSort` דינמית אם לא נמצא בקונפיגורציה
- הוספת `defaultSort` מפורש לכל 17 הטבלאות במערכת

**קבצים שעודכנו:**
- `trading-ui/scripts/unified-table-system.js` - תיקון לוגיקת מיון ברירת מחדל
- כל קבצי הרישום של הטבלאות - הוספת `defaultSort` מפורש

**דוח מפורט:** `reports/table-sorting-audit/FINAL_REPORT.md`

---

**מחבר:** TikTrack Development Team  
**גרסה:** 2.1.0  
**תאריך עדכון:** 20 נובמבר 2025

