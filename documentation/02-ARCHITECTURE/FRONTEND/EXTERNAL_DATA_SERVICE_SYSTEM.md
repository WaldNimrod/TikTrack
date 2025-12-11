# External Data Service System - מערכת נתונים חיצוניים

**תאריך:** 5 בדצמבר 2025  
**גרסה:** 2.0.0  
**עדכון אחרון:** 5 בדצמבר 2025

---

## סקירה כללית

`ExternalDataService` היא מערכת כללית לניהול נתונים חיצוניים במערכת TikTrack. המערכת מספקת ממשק אחיד לשליפת נתוני שוק מספקים חיצוניים (Yahoo Finance, Alpha Vantage, וכו').

### ארכיטקטורה

```
Frontend (ExternalDataService) 
  → Backend API 
    → DataNormalizer 
      → Provider Adapters (YahooFinanceAdapter, etc.)
```

---

## תכונות עיקריות

- **Provider-agnostic API** - ממשק אחיד ללא תלות בספק ספציפי
- **Automatic data normalization** - נרמול אוטומטי דרך ה-backend
- **Built-in caching** - מטמון מובנה עם TTL
- **Error handling** - טיפול בשגיאות עם retry logic
- **Rate limiting** - הגבלת קצב בקשות
- **Support for single and batch operations** - תמיכה בפעולות יחיד ו-batch
- **Real-time data updates** - עדכוני נתונים בזמן אמת
- **Timezone handling** - טיפול ב-timezone (UTC storage, local display)

---

## API Reference

### Constructor

```javascript
const service = new ExternalDataService();
// או שימוש ב-instance הגלובלי
window.ExternalDataService
```

### Methods

#### `getQuote(symbol, options)`

מביא quote לטיקר בודד.

**Parameters:**

- `symbol` (string) - סמל הטיקר (למשל 'AAPL')
- `options` (Object, optional) - אופציות נוספות
  - `forceRefresh` (boolean) - האם לכפות רענון גם אם יש נתונים עדכניים

**Returns:** `Promise<Object>` - נתוני quote מנורמלים

**Example:**

```javascript
const quote = await window.ExternalDataService.getQuote('AAPL', { forceRefresh: true });
console.log(quote.price, quote.change_pct_day);
```

---

#### `getQuotes(symbols, options)`

מביא quotes למספר טיקרים (batch operation).

**Parameters:**

- `symbols` (Array<string>) - מערך של סמלי טיקרים
- `options` (Object, optional) - אופציות נוספות
  - `maxBatchSize` (number) - גודל מקסימלי של batch (ברירת מחדל: 25)

**Returns:** `Promise<Array<Object>>` - מערך של quotes מנורמלים

**Example:**

```javascript
const quotes = await window.ExternalDataService.getQuotes(['AAPL', 'MSFT', 'GOOGL']);
quotes.forEach(quote => console.log(quote.symbol, quote.price));
```

---

#### `refreshTickerData(tickerId, options)` ⭐ **חדש**

מרענן נתונים לטיקר בודד כולל quote נוכחי, נתונים היסטוריים, וחישובים טכניים.

**Parameters:**

- `tickerId` (number) - מזהה הטיקר
- `options` (Object, optional) - אופציות נוספות
  - `forceRefresh` (boolean, default: true) - האם לכפות רענון גם אם יש נתונים עדכניים
  - `includeHistorical` (boolean, default: true) - האם לכלול נתונים היסטוריים
  - `daysBack` (number, default: 150) - מספר ימים של נתונים היסטוריים

**Returns:** `Promise<Object>` - נתוני טיקר מעודכנים כולל:

- Quote נוכחי
- נתונים היסטוריים (150 ימים)
- חישובים טכניים (ATR, MA20, MA150, Volatility, 52W)

**Example:**

```javascript
const tickerData = await window.ExternalDataService.refreshTickerData(1424, {
  forceRefresh: true,
  includeHistorical: true,
  daysBack: 150
});
console.log(tickerData.price, tickerData.historical_quotes_count);
```

**Backend Endpoint:**

- `POST /api/external-data/quotes/{tickerId}/refresh`

**מה הפונקציה עושה:**

1. מרענן quote נוכחי מהספק החיצוני
2. מוריד נתונים היסטוריים (150 ימים)
3. מחשב חישובים טכניים (ATR, MA20, MA150, Volatility, 52W)
4. שומר הכל ב-DB וב-cache

---

#### `refreshTickersData(tickersData, buttonId)`

מרענן נתונים למספר טיקרים (batch operation).

**Parameters:**

- `tickersData` (Array<Object>) - מערך של נתוני טיקרים
- `buttonId` (string|null, optional) - מזהה כפתור לעדכון UI

**Returns:** `Promise<Object>` - אובייקט עם נתונים מעודכנים (symbol -> data)

**Example:**

```javascript
const tickers = [{ symbol: 'AAPL' }, { symbol: 'MSFT' }];
const updatedData = await window.ExternalDataService.refreshTickersData(tickers, 'refreshBtn');
```

---

#### `refreshTickersDataSilently(tickersData)`

מרענן נתונים למספר טיקרים ללא עדכון UI.

**Parameters:**

- `tickersData` (Array<Object>) - מערך של נתוני טיקרים

**Returns:** `Promise<Object|null>` - אובייקט עם נתונים מעודכנים או null

**Example:**

```javascript
const tickers = [{ symbol: 'AAPL' }, { symbol: 'MSFT' }];
const updatedData = await window.ExternalDataService.refreshTickersDataSilently(tickers);
```

---

#### `getSystemStatus()`

מביא סטטוס של המערכת.

**Returns:** `Promise<Object>` - סטטוס המערכת

**Example:**

```javascript
const status = await window.ExternalDataService.getSystemStatus();
console.log(status.providers, status.cache);
```

---

#### `clearCache(symbols)`

מנקה מטמון.

**Parameters:**

- `symbols` (Array<string>|null) - סמלי טיקרים לניקוי, או null לניקוי כל המטמון

**Example:**

```javascript
// נקה מטמון לטיקר ספציפי
window.ExternalDataService.clearCache(['AAPL']);

// נקה את כל המטמון
window.ExternalDataService.clearCache();
```

---

#### `getCacheStats()`

מביא סטטיסטיקות של המטמון.

**Returns:** `Object` - סטטיסטיקות מטמון

**Example:**

```javascript
const stats = window.ExternalDataService.getCacheStats();
console.log(stats.totalEntries, stats.validEntries);
```

---

## שימוש בדשבורד טיקרים

הדשבורד משתמש במערכת הכללית בלבד, ללא קוד מקומי:

```javascript
// בדשבורד - refresh ticker עם historical data
const tickerData = await window.ExternalDataService.refreshTickerData(tickerId, {
  forceRefresh: true,
  includeHistorical: true,
  daysBack: 150
});
```

---

## Backend Endpoints

### Quotes

- `GET /api/external-data/quotes/{tickerId}` - קבלת quote לטיקר
- `GET /api/external-data/quotes/batch?ticker_ids=1,2,3` - קבלת quotes למספר טיקרים
- `POST /api/external-data/quotes/{tickerId}/refresh` - רענון quote + historical + indicators
- `GET /api/external-data/quotes/{tickerId}/history` - היסטוריה (לא מיושם עדיין)

### Yahoo Finance

- `GET /api/external-data/yahoo/quote/{symbol}` - quote ישיר מ-Yahoo Finance

### System Status

- `GET /api/external-data/status` - סטטוס המערכת
- `GET /api/external-data/providers` - רשימת ספקים
- `GET /api/external-data/status/scheduler/monitoring` - ניטור Scheduler עם התראות וסטטיסטיקות
- `GET /api/external-data/status/tickers/missing-data` - זיהוי טיקרים עם נתונים חסרים
- `GET /api/external-data/status/scheduler/history` - היסטוריית רענונים (alias ל-`/group-refresh-history`)
- `GET /api/external-data/status/group-refresh-history?limit=50` - היסטוריית רענונים קבוצתיים
- `POST /api/external-data/status/scheduler/start` - הפעלת Scheduler ידנית
- `POST /api/external-data/status/scheduler/stop` - עצירת Scheduler ידנית

### Data Refresh

- `POST /api/external-data/refresh/all` - רענון כל הטיקרים (quotes נוכחיים בלבד)
- `POST /api/external-data/refresh/full` - טעינת נתונים מלאה (quotes + היסטוריים + חישובים טכניים)

---

## Cache System

המערכת משתמשת במטמון מובנה עם TTL של 60 שניות (ברירת מחדל).

### Cache Keys

- Quotes: `/quotes/symbol/{symbol}?{params}`
- System status: `/status`

### Cache Invalidation

המטמון מתבטל אוטומטית אחרי TTL, או ניתן לנקות ידנית עם `clearCache()`.

---

## Error Handling

המערכת כוללת retry logic אוטומטי:

- **maxRetries**: 3 ניסיונות (ברירת מחדל)
- **retryDelay**: 1 שנייה בין ניסיונות (ברירת מחדל)
- **Rate limiting**: 100 בקשות לדקה (ברירת מחדל)

---

## Rate Limiting

המערכת כוללת rate limiting מובנה:

- **maxRequestsPerWindow**: 100 בקשות
- **requestWindow**: 60 שניות

אם מוגבל, המערכת תזרוק שגיאה: `Rate limit exceeded. Please wait before making more requests.`

---

## Data Format

### Normalized Quote Format

```javascript
{
  symbol: 'AAPL',
  price: 150.25,
  change_pct_day: 1.5,
  change_amount_day: 2.25,
  volume: 50000000,
  currency: 'USD',
  asof_utc: '2025-12-05T10:30:00Z',
  source: 'yahoo_finance',
  quality_score: 1.0,
  provider_count: 1,
  is_aggregated: false
}
```

---

## Best Practices

### 1. שימוש במערכת הכללית

✅ **נכון:**

```javascript
// שימוש במערכת הכללית
await window.ExternalDataService.refreshTickerData(tickerId);
```

❌ **לא נכון:**

```javascript
// קריאה ישירה ל-API - לא להשתמש!
await fetch(`/api/external-data/quotes/${tickerId}/refresh`, { method: 'POST' });
```

### 2. Cache Management

✅ **נכון:**

```javascript
// נקה מטמון לפני refresh
window.ExternalDataService.clearCache(['AAPL']);
await window.ExternalDataService.getQuote('AAPL', { forceRefresh: true });
```

### 3. Error Handling

✅ **נכון:**

```javascript
try {
  const quote = await window.ExternalDataService.getQuote('AAPL');
} catch (error) {
  console.error('Failed to fetch quote:', error.message);
  // Handle error appropriately
}
```

### 4. Batch Operations

✅ **נכון:**

```javascript
// השתמש ב-batch operations לטיקרים מרובים
const quotes = await window.ExternalDataService.getQuotes(['AAPL', 'MSFT', 'GOOGL']);
```

❌ **לא נכון:**

```javascript
// לא לעשות loop עם getQuote
for (const symbol of symbols) {
  await window.ExternalDataService.getQuote(symbol); // לא יעיל!
}
```

---

## Integration Examples

### דשבורד טיקרים

```javascript
// Refresh ticker עם historical data
async function refreshTickerData(tickerId, tickerSymbol) {
  try {
    const result = await window.ExternalDataService.refreshTickerData(tickerId, {
      forceRefresh: true,
      includeHistorical: true,
      daysBack: 150
    });
    
    // הנתונים כוללים:
    // - quote נוכחי
    // - נתונים היסטוריים (150 ימים)
    // - חישובים טכניים (ATR, MA20, MA150, Volatility, 52W)
    
    return result;
  } catch (error) {
    console.error('Failed to refresh ticker data:', error);
    throw error;
  }
}
```

### Watch List

```javascript
// Refresh כל הטיקרים ב-watch list
async function refreshWatchListTickers(tickers) {
  const symbols = tickers.map(t => t.symbol);
  const quotes = await window.ExternalDataService.getQuotes(symbols);
  return quotes;
}
```

---

## Changelog

### Version 2.1.0 (2025-12-07)

- ✅ **אופטימיזציה:** טעינה רק של נתונים חסרים (לא את כל הנתונים)
- ✅ **אופטימיזציה:** שימוש ב-`MissingDataChecker` לפני טעינה
- ✅ **אופטימיזציה:** גודל קבוצות אופטימלי (25 טיקרים)
- ✅ **שיפור:** הודעות הצלחה/שגיאה מפורטות עם פרטי רענון
- ✅ **תיעוד:** הוספת תיעוד מלא על `DataRefreshPolicy` ו-`MissingDataChecker`

### Version 2.0.0 (2025-12-05)

- ✅ **הוספה:** `refreshTickerData()` - פונקציה ל-refresh ticker בודד עם historical data
- ✅ **שיפור:** אינטגרציה מלאה בדשבורד טיקרים
- ✅ **תיקון:** הסרת קוד מקומי מקביל בדשבורד

### Version 1.0.0 (2025-01-27)

- יצירה ראשונית של המערכת
- `getQuote()`, `getQuotes()`, `refreshTickersData()`
- Cache system ו-rate limiting

---

## Related Documentation

- [External Data Optimization Developer Guide](../03-DEVELOPMENT/GUIDES/EXTERNAL_DATA_OPTIMIZATION_DEVELOPER_GUIDE.md) ⭐ **חדש - מדריך מפתח מקיף**
- [Data Refresh Policy](../04-FEATURES/EXTERNAL_DATA/DATA_REFRESH_POLICY.md) ⭐ **חדש**
- [Missing Data Checker](../04-FEATURES/EXTERNAL_DATA/MISSING_DATA_CHECKER.md) ⭐ **חדש**
- [External Data System Analysis Report](../05-REPORTS/EXTERNAL_DATA_SYSTEM_ANALYSIS_REPORT.md)
- [External Data Optimization Test Results](../05-REPORTS/EXTERNAL_DATA_OPTIMIZATION_TEST_RESULTS.md) ⭐ **חדש**
- [Ticker Dashboard External Data Analysis](../05-REPORTS/TICKER_DASHBOARD_EXTERNAL_DATA_ANALYSIS.md)
- [Backend: Data Normalizer](../../../Backend/services/external_data/data_normalizer.py)
- [Backend: Quotes API](../../../Backend/routes/external_data/quotes.py)

---

## Support

לשאלות או בעיות, פנה לצוות הפיתוח או פתח issue ב-repository.

