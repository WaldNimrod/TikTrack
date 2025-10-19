# Color Scheme System Extensions - מערכת צבעים דינמית מורחבת

## 🚨 חשוב למפתחים - טעינת העדפות הצבעים

**⚠️ לפני שימוש במערכת הצבעים הדינמית, יש לוודא שהעדפות הצבעים נטענות!**

### הבעיה הנפוצה
המערכת לא תמצא צבעי ישויות אם העדפות הצבעים לא נטענות לעמוד. זה קורה כי:
- עמודים טוענים רק העדפות ספציפיות (למשל: pagination, notifications)
- העדפות הצבעים לא נטענות אוטומטית
- המערכת לא מוצאת את הצבעים במטמון

### הפתרון
יש להוסיף את העדפות הצבעים לרשימת ההעדפות שנטענות בעמוד:

```javascript
// דוגמה מ-cash_flows.js
const preferences = await window.getPreferencesByNames([
  // העדפות בסיסיות
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

### איך לבדוק שהצבעים נטענים
1. פתח את Developer Tools (F12)
2. רענן את הדף
3. בדוק בקונסולה שיש הודעה: `🎨 Retrieved preferences from UnifiedCacheManager: (30+) [...]`
4. וודא שיש צבעי ישויות ברשימה (entityCashFlowColor, entityTradeColor, וכו')

## Overview - סקירה כללית

המערכת המורחבת מאפשרת טעינת צבעי ישויות מהעדפות המשתמש במקום שימוש בצבעים קבועים.

The extended system allows loading entity colors from user preferences instead of using fixed colors.

## New Functions - פונקציות חדשות

### `getEntityColorFromPreferences(entityType, variant)`

טוענת צבע ישות ספציפי מהעדפות המשתמש.

**Parameters:**
- `entityType` (string) - סוג הישות (למשל: 'cash_flow', 'trade', 'alert')
- `variant` (string) - הוריאנט: 'primary', 'light', 'dark' (ברירת מחדל: 'primary')

**Returns:** Promise<string> - קוד הצבע או null

**Example:**
```javascript
// קבלת הצבע הראשי של תזרים מזומנים
const primaryColor = await window.getEntityColorFromPreferences('cash_flow', 'primary');

// קבלת הצבע הכהה של תזרים מזומנים
const darkColor = await window.getEntityColorFromPreferences('cash_flow', 'dark');

// קבלת הצבע הבהיר של תזרים מזומנים
const lightColor = await window.getEntityColorFromPreferences('cash_flow', 'light');
```

### `getAllEntityColorVariantsFromPreferences(entityType)`

טוענת את כל הוריאנטים של צבע ישות מהעדפות המשתמש.

**Parameters:**
- `entityType` (string) - סוג הישות

**Returns:** Promise<Object> - אובייקט עם כל הוריאנטים

**Example:**
```javascript
const allVariants = await window.getAllEntityColorVariantsFromPreferences('cash_flow');
console.log(allVariants);
// Output: {
//   primary: '#d4a574',
//   light: '#f4e6d4',
//   dark: '#a67c52'
// }
```

## Entity Types Mapping - מיפוי סוגי ישויות

| Entity Type | Primary Preference | Light Preference | Dark Preference |
|-------------|-------------------|------------------|-----------------|
| `cash_flow` | `entityCashFlowColor` | `entityCashFlowColorLight` | `entityCashFlowColorDark` |
| `trade` | `entityTradeColor` | `entityTradeColorLight` | `entityTradeColorDark` |
| `trade_plan` | `entityTradePlanColor` | `entityTradePlanColorLight` | `entityTradePlanColorDark` |
| `execution` | `entityExecutionColor` | `entityExecutionColorLight` | `entityExecutionColorDark` |
| `account` | `entityTradingAccountColor` | `entityTradingAccountColorLight` | `entityTradingAccountColorDark` |
| `ticker` | `entityTickerColor` | `entityTickerColorLight` | `entityTickerColorDark` |
| `alert` | `entityAlertColor` | `entityAlertColorLight` | `entityAlertColorDark` |
| `note` | `entityNoteColor` | `entityNoteColorLight` | `entityNoteColorDark` |

## Automatic Page Color Detection - זיהוי אוטומטי של צבע העמוד

המערכת מזהה אוטומטית את סוג הישות של העמוד הנוכחי ומגדירה את `--current-entity-color` בהתאם.

**Page Class Mapping:**
- `cash-flows-page` → `cash_flow`
- `trades-page` → `trade`
- `tickers-page` → `ticker`
- `alerts-page` → `alert`
- `notes-page` → `note`
- `constraints-page` → `constraint`
- `designs-page` → `design`
- `preferences-page` → `preference`
- `executions-page` → `execution`
- `trade-plans-page` → `trade_plan`
- `trading-accounts-page` → `account`
- `research-page` → `research`

## Usage Examples - דוגמאות שימוש

### 1. קבלת צבע ישות ספציפי

```javascript
// קבלת הצבע הראשי של תזרים מזומנים
const color = await window.getEntityColorFromPreferences('cash_flow', 'primary');
if (color) {
  document.documentElement.style.setProperty('--current-entity-color', color);
}
```

### 2. קבלת כל הוריאנטים

```javascript
// קבלת כל הוריאנטים של תזרים מזומנים
const variants = await window.getAllEntityColorVariantsFromPreferences('cash_flow');

// שימוש בכל הוריאנטים
if (variants.primary) {
  document.documentElement.style.setProperty('--entity-primary', variants.primary);
}
if (variants.light) {
  document.documentElement.style.setProperty('--entity-light', variants.light);
}
if (variants.dark) {
  document.documentElement.style.setProperty('--entity-dark', variants.dark);
}
```

### 3. שימוש ב-ActionsMenuSystem

```javascript
// הכפתור יקבל אוטומטית את הצבע הנכון מהעדפות
// The button will automatically get the correct color from preferences
.actions-menu-wrapper .actions-trigger {
  background: var(--current-entity-color, #26baac) !important;
  border: 1px solid var(--current-entity-color, #26baac) !important;
}
```

## Integration with ActionsMenuSystem - אינטגרציה עם ActionsMenuSystem

המערכת משולבת עם `ActionsMenuSystem` כדי שכפתורי התפריט יקבלו אוטומטית את הצבע הנכון של הישות.

**CSS Variables:**
- `--current-entity-color` - הצבע הראשי של הישות הנוכחית
- `--entity-{type}-color` - צבע ישות ספציפי
- `--entity-{type}-color-light` - צבע בהיר של ישות ספציפית
- `--entity-{type}-color-dark` - צבע כהה של ישות ספציפית

## Error Handling - טיפול בשגיאות

המערכת כוללת טיפול מקיף בשגיאות:

1. **Preferences Loading Failed** - אם טעינת העדפות נכשלת
2. **Entity Type Not Found** - אם סוג הישות לא נמצא
3. **Color Not Found** - אם הצבע לא נמצא בהעדפות
4. **Fallback to Default** - חזרה לצבע ברירת מחדל

## Performance Considerations - שיקולי ביצועים

1. **Caching** - העדפות נטענות פעם אחת ונשמרות במטמון
2. **Async Loading** - טעינה אסינכרונית כדי לא לחסום את ה-UI
3. **Fallback Values** - ערכי ברירת מחדל במקרה של כשל

## Future Enhancements - שיפורים עתידיים

1. **Real-time Updates** - עדכון בזמן אמת של צבעים
2. **Theme Support** - תמיכה במספר תמות
3. **Color Validation** - ולידציה של קודי צבעים
4. **Performance Monitoring** - ניטורความ ביצועים

---

**Created:** January 2025  
**Updated:** January 2025  
**Version:** 1.0.0
