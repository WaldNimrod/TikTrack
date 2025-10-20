# מדריך מפתחים - צבעים דינמיים וצבעי ישויות

## 🎯 סקירה כללית

המערכת מאפשרת שימוש בצבעים דינמיים שמתבססים על העדפות המשתמש. כל עמוד יכול לקבל צבעים שונים לפי סוג הישות שלו.

## 🚨 חשוב - טעינת העדפות הצבעים

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

## 🎨 משתני CSS דינמיים

המערכת מגדירה משתני CSS דינמיים שזמינים בכל העמוד:

### משתנה ראשי
- `--current-entity-color` - הצבע הראשי של הישות הנוכחית (נקבע אוטומטית לפי העמוד)

### משתני ישות ספציפיים
לכל ישות יש שלושה משתנים:
- `--entity-{entityType}-color` - הצבע הראשי
- `--entity-{entityType}-color-light` - הוריאנט הבהיר  
- `--entity-{entityType}-color-dark` - הוריאנט הכהה

**דוגמאות:**
```css
/* תזרימי מזומנים */
--entity-cash-flow-color: #d4a574
--entity-cash-flow-color-light: #f5e1d0
--entity-cash-flow-color-dark: #a67c52

/* טריידים */
--entity-trade-color: #26baac
--entity-trade-color-light: #7dd3c7
--entity-trade-color-dark: #1e8e7e
```

### שימוש ב-CSS
```css
/* כפתור עם צבע ישות נוכחי */
.my-button {
  background-color: var(--current-entity-color, #26baac);
  border: 1px solid var(--current-entity-color, #26baac);
}

/* רקע בהיר של ישות ספציפית */
.light-background {
  background-color: var(--entity-cash-flow-color-light, rgba(212, 165, 116, 0.1));
}

/* טקסט כהה של ישות ספציפית */
.dark-text {
  color: var(--entity-trade-color-dark, #1e8e7e);
}
```

## 🔧 איך להוסיף צבעי ישויות לעמוד חדש

### שלב 1: הוסף העדפות צבעים
```javascript
const preferences = await window.getPreferencesByNames([
  // העדפות בסיסיות...
  
  // ✅ חובה: צבעי ישויות
  'entityCashFlowColor',
  'entityCashFlowColorLight',
  'entityCashFlowColorDark',
  // ... שאר הצבעים
]);
```

### שלב 2: הגדר class של העמוד
```html
<body class="my-entity-page">
```

### שלב 3: הוסף מיפוי ב-PAGE_ENTITY_MAP
```javascript
// ב-color-scheme-system.js
const PAGE_ENTITY_MAP = {
  'my-entity-page': 'my_entity',
  // ...
};
```

### שלב 4: השתמש במשתני CSS
```css
.my-component {
  background-color: var(--current-entity-color, #26baac);
  border-color: var(--entity-my-entity-color-dark, #1e8e7e);
}
```

## 🎯 דוגמה מעשית - ActionsMenuSystem

```css
/* כפתור הטריגר עם צבע ישות נוכחי */
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

## 🔍 איך לבדוק שהמערכת עובדת

### בדיקה 1: משתני CSS
```javascript
// בדוק בקונסולה
const computedStyle = getComputedStyle(document.documentElement);
console.log('Current entity color:', computedStyle.getPropertyValue('--current-entity-color'));
console.log('Cash flow light:', computedStyle.getPropertyValue('--entity-cash-flow-color-light'));
console.log('Cash flow dark:', computedStyle.getPropertyValue('--entity-cash-flow-color-dark'));
```

### בדיקה 2: פונקציות JavaScript
```javascript
// בדוק שהפונקציות זמינות
console.log('getEntityColorFromPreferences:', typeof window.getEntityColorFromPreferences);
console.log('getAllEntityColorVariantsFromPreferences:', typeof window.getAllEntityColorVariantsFromPreferences);

// בדוק צבע ספציפי
const color = await window.getEntityColorFromPreferences('cash_flow', 'primary');
console.log('Cash flow primary color:', color);
```

### בדיקה 3: בדיקת העדפות
```javascript
// בדוק שהעדפות נטענו
const preferences = await window.UnifiedCacheManager.get('user-preferences');
console.log('Loaded preferences:', Object.keys(preferences).filter(k => k.includes('entity') && k.includes('Color')));
```

## 📚 מיפוי עמודים לישויות

| עמוד | Class | Entity Type | משתני CSS |
|------|-------|-------------|------------|
| Cash Flows | `cash-flows-page` | `cash_flow` | `--entity-cash-flow-color*` |
| Trades | `trades-page` | `trade` | `--entity-trade-color*` |
| Tickers | `tickers-page` | `ticker` | `--entity-ticker-color*` |
| Alerts | `alerts-page` | `alert` | `--entity-alert-color*` |
| Notes | `notes-page` | `note` | `--entity-note-color*` |
| Executions | `executions-page` | `execution` | `--entity-execution-color*` |
| Trade Plans | `trade-plans-page` | `trade_plan` | `--entity-trade-plan-color*` |
| Trading Accounts | `trading-accounts-page` | `account` | `--entity-trading-account-color*` |

## 🚀 סיכום

המערכת מאפשרת:
- ✅ צבעים דינמיים לפי העדפות המשתמש
- ✅ שלושה וריאנטים לכל ישות (ראשי, בהיר, כהה)
- ✅ הגדרה אוטומטית של `--current-entity-color`
- ✅ תמיכה בכל עמודי המשתמש
- ✅ אינטגרציה עם ActionsMenuSystem

**חשוב:** תמיד וודא שהעדפות הצבעים נטענות בעמוד לפני השימוש במערכת!

---

**גרסה:** 1.0  
**תאריך:** 20 ינואר 2025  
**מחבר:** TikTrack Development Team
