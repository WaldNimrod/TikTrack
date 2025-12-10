# מיפוי חישובים קיימים - אינטגרציית EOD Historical Metrics

## תוצר שלב 1.1 - מיפוי חישובים קיימים בכל עמוד

### מטרה
לזהות איפה כל עמוד מחשב נתונים היסטוריים כרגע, כדי להחליף בחישובים מ-EOD APIs.

---

## עמוד 1: Ticker Dashboard (`ticker-dashboard.js`)

### חישובים קיימים:
- **KPIs (renderKPICards())**: מחשב price, change, volume, ATR, 52W High/Low, MA20/150
- **נתונים**: משתמש ב-tickerData ישיר (current_price, daily_change, volume, etc.)
- **מיקום**: שורות 1288-1700 בקירוב

### חישובים שצריך להחליף ב-EOD:
- Price change calculations
- Volume metrics
- Technical indicators (ATR, 52W, MA)
- Performance metrics

---

## עמוד 2: Trading Journal (`trading-journal-page.js`)

### חישובים קיימים:
- **Calendar display**: מציג entries לפי תאריכים
- **Activity metrics**: ספירת entries ביום/חודש
- **Navigation**: month/year navigation

### חישובים שצריך להוסיף EOD:
- Daily portfolio snapshots
- Monthly aggregations
- Activity charts with EOD data
- Performance summaries

---

## עמוד 3: Dashboard/Home (`index.html` + `dashboard-data.js`)

### חישובים קיימים:
- **Portfolio summary**: trades, alerts, accounts, cash flows
- **Dashboard data**: loadDashboardData() function
- **Caching**: UnifiedCacheManager

### חישובים שצריך להוסיף EOD:
- Portfolio performance summary (NAV, P&L, returns)
- Historical trends
- Account balances over time

---

## עמוד 4: Trading Accounts (`trading-accounts-data.js`)

### חישובים קיימים:
- **Account data loading**: fetchTradingAccountsFromApi()
- **CRUD operations**: create/update/delete accounts
- **Caching**: saveAccountsCache()

### חישובים שצריך להוסיף EOD:
- Account-level portfolio metrics
- Account performance over time
- Balance tracking

---

## עמוד 5: Cash Flows (`cash_flows.js`)

### חישובים קיימים:
- **Page summary stats**: updatePageSummaryStats()
- **Balance calculations**: calculateBalance()
- **Cash flow aggregations**: manual calculations

### חישובים שכבר משתמשים ב-EOD (חלקי):
- כבר יש שימוש ב-EOD APIs
- צריך להרחיב לשימוש מלא

---

## סיכום מיפוי

### מצב נוכחי:
- **ticker-dashboard.js**: מחשב KPIs ישירות - צריך החלפה מלאה
- **trading-journal-page.js**: מציג calendar - צריך הוספת EOD snapshots
- **dashboard-data.js**: טוען dashboard data - צריך הוספת portfolio metrics
- **trading-accounts-data.js**: CRUD accounts - צריך הוספת account metrics
- **cash_flows.js**: משתמש חלקי ב-EOD - צריך הרחבה

### דרישות EOD APIs:

1. **getPortfolioMetrics(userId, filters)** - מדדי פורטפוליו
2. **getPositions(userId, filters)** - פוזיציות יומיות
3. **getCashFlows(userId, filters)** - תזרימי מזומנים

### תבנית אינטגרציה אחידה:

נוצר `EODIntegrationHelper` (`trading-ui/scripts/services/eod-integration-helper.js`) עם:

**פונקציות עיקריות:**
- `integrateEODMetrics()` - אינטגרציה מלאה עם loading states
- `loadEODDataWithFallback()` - טעינת נתונים עם fallback mechanism
- `handleEODError()` - טיפול אחיד בשגיאות
- `validateEODData()` - ולידציה של נתונים
- `suggestEODRecompute()` - הצעה לחישוב מחדש

**תבנית שימוש:**

```javascript
// אינטגרציה מלאה עם loading states
await EODIntegrationHelper.integrateEODMetrics(
    'container-id',
    'portfolio',
    userId,
    filters,
    (result) => {
        // Process successful data
        console.log('EOD Data:', result.data);
        console.log('Source:', result.source); // 'eod', 'cache', or 'fallback'
    },
    async () => {
        // Fallback function
        return await loadDirectCalculations();
    }
);
```

---

## שלב הבא: שלב 1.2 - הגדרת תבנית סטנדרטית

צור `EODIntegrationHelper` עם:
- Error handling אחיד
- Fallback mechanism
- Loading states
- Cache management
