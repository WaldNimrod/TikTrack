# Info Summary System - מערכת סיכום נתונים מאוחדת

## סקירה כללית

מערכת Info Summary System היא מערכת מאוחדת לניהול וצגת סטטיסטיקות סיכום בכל עמודי המשתמש ב-TikTrack. המערכת מחליפה את הלוגיקה הכפולה והמפוזרת שהייתה קיימת בכל עמוד בנפרד.

> **עדכון 2025-11-12 (Option A):** כל מחשבון וסיכום משתמשים כעת בנתונים הקנוניים מתוך `TableDataRegistry`. המשמעות היא שכל פילטר (Header, פילטרי ישות, מודולי פרטים) משפיע אוטומטית על הסטטיסטיקות. כדי לאפשר זאת יש להגדיר לכל עמוד `tableType` תואם בקובץ `info-summary-configs.js`, והמערכת תבצע resolve של הנתונים דרך `UnifiedTableSystem.filter.apply` והמאזינים של ה-Registry.

## ארכיטקטורה

### קבצי ליבה

1. **`info-summary-system.js`** - המערכת הליבה
   - מחלקת `InfoSummarySystem` עם מחשבונים מובנים
   - פונקציות עיצוב (formatters) מובנות
   - פונקציית `calculateAndRender()` הראשית

2. **`info-summary-configs.js`** - תצורות עמודים
   - הגדרות ספציפיות לכל עמוד
   - מחשבונים ופרמטרים לכל סטטיסטיקה
   - תמיכה בסטטיסטיקות משניות (sub-stats)

### מחשבונים מובנים

#### מחשבוני ספירה
- `count` - ספירת רשומות כוללת
- `countByStatus` - ספירה לפי סטטוס
- `countByField` - ספירה לפי שדה וערך
- `countByConditions` - ספירה לפי תנאים מרובים

#### מחשבוני מספרים
- `sumField` - סכום שדה מספרי
- `avgField` - ממוצע שדה מספרי
- `minField` / `maxField` - מינימום/מקסימום

#### מעצבים מובנים
- `currency` - עיצוב מטבע ($X.XX)
- `number` - עיצוב מספר עם עשרוניים
- `percentage` - עיצוב אחוזים
- `integer` - עיצוב מספר שלם
- `custom` - מעצב מותאם אישית

## תצורת עמודים

### דוגמה - עמוד טריידים

```javascript
trades: {
  containerId: 'summaryStats',
  tableType: 'trades',
  stats: [
    {
      id: 'totalTrades',
      label: 'סה"כ טריידים',
      calculator: 'count'
    },
    {
      id: 'openTrades',
      label: 'טריידים פתוחים',
      calculator: 'countByStatus',
      params: { status: 'open' }
    },
    {
      id: 'closedTrades',
      label: 'טריידים סגורים',
      calculator: 'countByStatus',
      params: { status: 'closed' }
    },
    {
      id: 'totalPL',
      label: 'P/L',
      calculator: 'sumField',
      params: { field: 'profit_loss' },
      formatter: 'currency'
    }
  ]
}
```

### דוגמה - עמוד עסקעות (עם סטטיסטיקות משניות)

```javascript
executions: {
  containerId: 'summaryStats',
  tableType: 'executions',
  stats: [
    {
      id: 'totalExecutions',
      label: 'סה"כ עסקעות',
      calculator: 'count',
      subStats: [
        {
          id: 'totalBuyExecutions',
          calculator: 'countByField',
          params: { field: 'action', value: 'buy' },
          className: 'buy-color'
        },
        {
          id: 'totalSellExecutions',
          calculator: 'countByField',
          params: { field: 'action', value: 'sell' },
          className: 'sell-color'
        }
      ]
    }
  ]
}
```

## שילוב בעמודים

### 1. עדכון קובץ JavaScript

```javascript
function updateTradesTable(tradesData, skipSectionRestore = false) {
  // ... קוד קיים לטבלה ...
  
  // עדכון סטטיסטיקות סיכום - מערכת מאוחדת
  if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
    const config = window.INFO_SUMMARY_CONFIGS.trades;
    window.InfoSummarySystem.calculateAndRender(tradesData, config);
  } else {
    // Fallback לקוד הישן
    // ... קוד fallback ...
  }
}
```

### 2. עדכון קובץ HTML

```html
<!-- ===== INFO SUMMARY SYSTEM ===== -->
<!-- מערכת סיכום נתונים מאוחדת -->
<script src="scripts/info-summary-system.js?v=05b6de6f_20251025_005449"></script>
<script src="scripts/info-summary-configs.js?v=05b6de6f_20251025_005449"></script>
```

### 3. עדכון מערכת האיתחול

#### עדכון `page-initialization-configs.js`
```javascript
'trades': {
  // ... הגדרות קיימות ...
  packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-details', 'info-summary', 'init-system'],
  // ... שאר ההגדרות ...
}
```

#### עדכון `package-manifest.js`
```javascript
'info-summary': {
  id: 'info-summary',
  name: 'Info Summary Package',
  description: 'מערכת סיכום נתונים מאוחדת לכל העמודים',
  version: '1.0.0',
  critical: false,
  loadOrder: 18,
  dependencies: ['base', 'services'],
  scripts: [
    {
      file: 'info-summary-system.js',
      globalCheck: 'window.InfoSummarySystem',
      description: 'מערכת סיכום נתונים ליבה',
      required: true,
      loadOrder: 1
    },
    {
      file: 'info-summary-configs.js',
      globalCheck: 'window.INFO_SUMMARY_CONFIGS',
      description: 'תצורות עמודים לסיכום נתונים',
      required: true,
      loadOrder: 2
    }
  ],
  estimatedSize: '~25KB',
  initTime: '~15ms'
}
```

## עמודים נתמכים

המערכת תומכת ב-8 עמודי משתמש:

1. **trades** - מעקב טריידים
2. **executions** - היסטוריית עסקאות
3. **trade_plans** - תכנוני השקעות
4. **cash_flows** - תזרימי מזומנים
5. **alerts** - התראות עסקיות
6. **notes** - הערות
7. **tickers** - טיקרים
8. **trading_accounts** - חשבונות מסחר

## יתרונות המערכת

### 1. איחוד קוד
- **לפני**: לוגיקה כפולה ב-8+ עמודים
- **אחרי**: מערכת אחת מרכזית

### 2. תחזוקה קלה
- שינוי במחשבון משפיע על כל העמודים
- הוספת מעצב חדש זמין לכל העמודים
- תיקון באג אחד מתקן את כל המערכת

### 3. עקביות
- אותו עיצוב בכל העמודים
- אותה לוגיקה לחישובים
- אותה התנהגות עם פילטרים

### 4. ביצועים
- חישובים מבוססי נתונים (לא DOM)
- עדכון אוטומטי עם פילטרים
- Fallback לקוד הישן אם המערכת לא זמינה

## פתרון בעיות

### המערכת לא נטענת
1. בדוק שהסקריפטים נטענים בסדר הנכון
2. בדוק שהחבילה מוגדרת ב-`package-manifest.js`
3. בדוק שהעמוד מוגדר ב-`page-initialization-configs.js`

### סטטיסטיקות לא מתעדכנות
1. בדוק שהפונקציה קוראת ל-`InfoSummarySystem.calculateAndRender()`
2. בדוק שהתצורה קיימת ב-`INFO_SUMMARY_CONFIGS`
3. בדוק שהנתונים מועברים נכון

### עיצוב לא נכון
1. בדוק שהמעצב מוגדר נכון בתצורה
2. בדוק שהמעצב קיים ב-`formatters`
3. בדוק שהפרמטרים מועברים נכון

## הרחבה למערכת

### הוספת מחשבון חדש

```javascript
// ב-info-summary-system.js
initializeCalculators() {
  return {
    // ... מחשבונים קיימים ...
    
    // מחשבון חדש
    customCalculator: (data, params) => {
      // לוגיקה מותאמת אישית
      return result;
    }
  };
}
```

### הוספת מעצב חדש

```javascript
// ב-info-summary-system.js
initializeFormatters() {
  return {
    // ... מעצבים קיימים ...
    
    // מעצב חדש
    customFormatter: (value, params) => {
      // לוגיקת עיצוב מותאמת אישית
      return formattedValue;
    }
  };
}
```

### הוספת עמוד חדש

1. הוסף תצורה ל-`info-summary-configs.js`
2. עדכן את `page-initialization-configs.js`
3. הוסף את הסקריפטים ל-HTML
4. עדכן את הפונקציה ב-JavaScript

## בדיקות

### בדיקות אוטומטיות
- המערכת נטענת בהצלחה
- התצורות מוגדרות נכון
- המחשבונים מחזירים תוצאות נכונות

### בדיקות ידניות
- סטטיסטיקות מתעדכנות עם פילטרים
- עיצוב נכון בכל העמודים
- Fallback עובד כשהמערכת לא זמינה

## סיכום

מערכת Info Summary System מספקת פתרון מאוחד ויעיל לניהול סטטיסטיקות סיכום בכל עמודי TikTrack. המערכת מבטיחה עקביות, תחזוקה קלה וביצועים טובים, תוך שמירה על תאימות לאחור עם הקוד הקיים.

## Canonical Data Resolution (2025-11)

החל מגרסה 4.0 פונקציית `calculateAndRender()` משתמשת ב-`TableDataRegistry` כמקור ראשון לנתונים:

1. אם קיים `config.tableType` והטבלה רשומה ב-Registry → נטען את `getFilteredData(tableType)`.
2. אם אין נתונים מסוננים אך יש נתונים מלאים (`getFullData`) → אלו ישמשו לחישוב סטטיסטיקות.
3. אם ה-Registry אינו זמין (למשל בתסריט בדיקות) → נעשה שימוש במערך שהועבר לפונקציה (fallback).

> 💡 **טיפ למפתחים:** כאשר יוצרים קונפיגורציה חדשה ב-`info-summary-configs.js`, חובה להוסיף `tableType` תואם לסוג הנתונים ב-`UnifiedTableSystem`. הדבר מבטיח שהסטטיסטיקות יגיבו לפילטרים, פאג'ינציה ומצבי עמוד.

### Developer Checklist

- [ ] הטבלה נרשמה ב-`UnifiedTableSystem.registry` (כולל `dataGetter` מעודכן).
- [ ] `TableDataRegistry.setFullData` נקרא לאחר טעינת הנתונים הראשונית.
- [ ] `config.tableType` תואם לשם שבו הטבלה רשומה (לדוגמה `'trading_accounts'`).
- [ ] אם נדרשת פעולה נוספת בעת שינוי פילטרים (כמו עדכון כרטיסיות בדשבורד), מומלץ להשתמש ב-`TableDataRegistry.subscribe(tableType, callback)`.
