# Historical Data Services - Frontend Architecture Documentation

# Historical Data Services - תיעוד ארכיטקטורה Frontend

**תאריך יצירה:** 7 דצמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ תיעוד מלא  
**מטרה:** תיעוד מקיף של Historical Data Services ב-Frontend במערכת TikTrack

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה](#ארכיטקטורה)
3. [Data Services](#data-services)
4. [Cache Integration](#cache-integration)
5. [Error Handling](#error-handling)
6. [אינטגרציה עם עמודים](#אינטגרציה-עם-עמודים)
7. [דוגמאות שימוש](#דוגמאות-שימוש)

---

## 🎯 סקירה כללית

Historical Data Services הם 3 שירותי נתונים ב-Frontend המספקים גישה לנתונים היסטוריים:

- **TradeHistoryData** - היסטוריית טריידים
- **PortfolioStateData** - מצב תיק היסטורי
- **TradingJournalData** - יומן מסחר

### עקרונות מרכזיים

1. **Cache-first strategy** - שימוש ב-UnifiedCacheManager (4 שכבות)
2. **Error handling אחיד** - שימוש ב-NotificationSystem ו-Logger Service
3. **Data normalization** - נרמול נתונים לפני החזרה
4. **TTL management** - ניהול TTL אוטומטי דרך CacheTTLGuard

---

## 🏗️ ארכיטקטורה

### מבנה כללי

```
┌─────────────────────────────────────────────────────────────┐
│                    Page Scripts                             │
│  - trade-history-page.js                                   │
│  - portfolio-state-page.js                                 │
│  - trading-journal-page.js                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Historical Data Services                      │
│  - TradeHistoryData                                        │
│  - PortfolioStateData                                      │
│  - TradingJournalData                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              UnifiedCacheManager (4 Layers)                 │
│  - Memory Cache                                             │
│  - localStorage                                             │
│  - IndexedDB                                                │
│  - Backend Cache                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API Endpoints                          │
│  - /api/trade-history/*                                    │
│  - /api/portfolio-state/*                                   │
│  - /api/trading-journal/*                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Data Services

### TradeHistoryData

**מיקום:** `trading-ui/scripts/services/trade_history-data.js`

**תפקיד:** טעינת היסטוריית טריידים עם פילטרים

**פונקציות:**

1. **`loadTradeHistory(filters, options)`**
   - טעינת היסטוריית טריידים
   - Cache key: `trade-history-data:{filtersHash}`
   - TTL: 5 minutes

2. **`loadTradeTimeline(tradeId, options)`**
   - טעינת ציר זמן של טרייד ספציפי
   - כולל: כל האובייקטים המקושרים, חישובי פוזיציה, P/L
   - Cache key: `trade-history-timeline-{trade_id}`
   - TTL: IndexedDB, 2 ימים (prod) / 1 יום (dev)
   - Dependencies: `trades`, `executions`, `trade-plans`, `notes`, `alerts`, `cash-flows`

3. **`loadTradeChartData(tradeId, options)`**
   - טעינת נתוני גרף לטרייד
   - כולל: מחירי שוק היסטוריים, נתוני פוזיציה, נתוני P/L
   - Cache key: `trade-history-chart-data-{trade_id}`
   - TTL: IndexedDB, 2 ימים (prod) / 1 יום (dev)
   - Dependencies: `trades`, `executions`, `market_data_quotes`

4. **`loadTradeStatistics(tradeId, options)`**
   - טעינת סטטיסטיקות מפורטות לטרייד
   - Cache key: `trade-history-statistics-{trade_id}`
   - TTL: Backend, 5 דקות (dev) / 10 דקות (prod)
   - Dependencies: `trades`, `executions`

5. **`loadTradeFullAnalysis(tradeId, options)`**
   - טעינת ניתוח מלא לטרייד (timeline + chart + statistics)
   - מיועד לעמוד trade-history בלבד
   - Cache key: `trade-history-full-analysis-{trade_id}`
   - TTL: IndexedDB, 2 ימים
   - Dependencies: כל ה-dependencies של ה-endpoints הנפרדים

6. **`loadStatistics(filters, options)`**
   - טעינת סטטיסטיקות טריידים (כללי)
   - Cache key: `trade-history-statistics:{filtersHash}`
   - TTL: 5 minutes

7. **`loadAggregated(groupBy, filters, options)`**
   - טעינת אגרגציה של טריידים
   - Cache key: `trade-history-aggregated:{filtersHash}`
   - TTL: 5 minutes

4. **`loadPlanVsExecution(dateRange, options)`**
   - טעינת ניתוח תוכניות vs ביצועים
   - Cache key: `trade-history-plan-vs-execution:{startDate}:{endDate}`
   - TTL: 5 minutes

5. **`invalidateCache()`**
   - ביטול מטמון של כל נתוני trade history

### PortfolioStateData

**מיקום:** `trading-ui/scripts/services/portfolio_state-data.js`

**תפקיד:** טעינת מצב תיק היסטורי

**פונקציות:**

1. **`loadSnapshot(accountId, date, options)`**
   - טעינת snapshot של תיק בתאריך מסוים
   - Cache key: `portfolio-state-snapshot:{accountId}:{date}`
   - TTL: 10 minutes

2. **`loadSeries(accountId, startDate, endDate, options)`**
   - טעינת סדרת snapshots לטווח תאריכים
   - Cache key: `portfolio-state-series:{accountId}:{startDate}:{endDate}:{interval}`
   - TTL: 10 minutes

3. **`loadPerformance(accountId, dateRange, options)`**
   - טעינת ביצועי תיק בטווח תאריכים
   - Cache key: `portfolio-state-performance:{accountId}:{startDate}:{endDate}`
   - TTL: 10 minutes

4. **`loadComparison(accountId, date1, date2, options)`**
   - טעינת השוואה בין שני תאריכים
   - Cache key: `portfolio-state-comparison:{accountId}:{date1}:{date2}`
   - TTL: 10 minutes

5. **`invalidateCache()`**
   - ביטול מטמון של כל נתוני portfolio state

### TradingJournalData

**מיקום:** `trading-ui/scripts/services/trading_journal-data.js`

**תפקיד:** טעינת יומן מסחר

**פונקציות:**

1. **`loadEntries(dateRange, filters, options)`**
   - טעינת ערכי יומן לטווח תאריכים
   - Cache key: `trading-journal-entries:{filtersHash}`
   - TTL: 3 minutes

2. **`loadStatistics(dateRange, options)`**
   - טעינת סטטיסטיקות יומן
   - Cache key: `trading-journal-statistics:{filtersHash}`
   - TTL: 3 minutes

3. **`loadCalendarData(month, year, options)`**
   - טעינת נתוני לוח שנה לחודש מסוים
   - Cache key: `trading-journal-calendar:{year}:{month}:{entityType}`
   - TTL: 3 minutes

4. **`loadByEntity(entityType, entityId, options)`**
   - טעינת ערכי יומן לפי entity
   - Cache key: `trading-journal-by-entity:{entityType}:{entityId}`
   - TTL: 3 minutes

5. **`invalidateCache()`**
   - ביטול מטמון של כל נתוני trading journal

---

## 💾 Cache Integration

### UnifiedCacheManager Configuration

**Trade History:**

```javascript
'trade-history-data': { 
  layer: 'backend', 
  ttl: 300000, // 5 minutes
  compress: false, 
  dependencies: ['trades', 'executions', 'trade-plans'] 
},
'trade-history-statistics-*': { 
  layer: 'backend', 
  ttl: 300000, 
  compress: false 
}
```

**Portfolio State:**

```javascript
'portfolio-state-snapshot-*': { 
  layer: 'backend', 
  ttl: 600000, // 10 minutes
  compress: false, 
  dependencies: ['executions', 'market_data_quotes', 'trades'] 
},
'portfolio-state-series-*': { 
  layer: 'backend', 
  ttl: 600000, 
  compress: false 
}
```

**Trading Journal:**

```javascript
'trading-journal-*': { 
  layer: 'backend', 
  ttl: 180000, // 3 minutes
  compress: false, 
  dependencies: ['notes', 'trades', 'executions'] 
}
```

### CacheTTLGuard Configuration

```javascript
'trade-history-data': { ttl: 300000 }, // 5 minutes
'portfolio-state-data': { ttl: 600000 }, // 10 minutes
'trading-journal-data': { ttl: 180000 } // 3 minutes
```

### Cache Dependencies

**Trade History:**

- תלוי ב: `trades`, `executions`, `trade-plans`
- Invalidation: כאשר נוצרים/מתעדכנים/נמחקים טריידים, ביצועים או תוכניות

**Portfolio State:**

- תלוי ב: `executions`, `market_data_quotes`, `trades`
- Invalidation: כאשר נוצרים/מתעדכנים/נמחקים ביצועים, מחירי שוק או טריידים

**Trading Journal:**

- תלוי ב: `notes`, `trades`, `executions`
- Invalidation: כאשר נוצרים/מתעדכנים/נמחקים הערות, טריידים או ביצועים

---

## ⚠️ Error Handling

### תבנית אחידה

```javascript
try {
  const data = await window.TradeHistoryData.loadTradeHistory(filters);
  // Use data
} catch (error) {
  // Error already handled by Data Service
  // - Logger.error() called
  // - NotificationSystem.showError() called
  // Just handle UI state if needed
}
```

### Error Handling ב-Data Services

1. **Logger Service** - כל שגיאה נרשמת ב-Logger
2. **NotificationSystem** - הודעת שגיאה למשתמש
3. **Error propagation** - שגיאות מועברות ל-caller

---

## 🔗 אינטגרציה עם עמודים

### trade-history-page.js

**שימוש:**

```javascript
// Load trade history
const data = await window.TradeHistoryData.loadTradeHistory(filters);

// Load statistics
const stats = await window.TradeHistoryData.loadStatistics(filters);

// Load plan vs execution
const analysis = await window.TradeHistoryData.loadPlanVsExecution(dateRange);
```

### portfolio-state-page.js

**שימוש:**

```javascript
// Load snapshot
const snapshot = await window.PortfolioStateData.loadSnapshot(accountId, date);

// Load series for charts
const series = await window.PortfolioStateData.loadSeries(accountId, startDate, endDate);
```

### trading-journal-page.js

**שימוש:**

```javascript
// Load entries
const entries = await window.TradingJournalData.loadEntries(dateRange, filters);

// Load calendar data (via CalendarDataLoader)
const calendar = await window.TradingJournalData.loadCalendarData(month, year);
```

---

## 📝 דוגמאות שימוש

### Trade History

```javascript
// Basic usage
const data = await window.TradeHistoryData.loadTradeHistory({
  account_id: 1,
  start_date: '2025-01-01',
  end_date: '2025-01-31'
});

// With force reload
const freshData = await window.TradeHistoryData.loadTradeHistory(
  { account_id: 1 },
  { force: true }
);

// Load statistics
const stats = await window.TradeHistoryData.loadStatistics({
  account_id: 1,
  start_date: '2025-01-01',
  end_date: '2025-01-31'
});
```

### Portfolio State

```javascript
// Load snapshot
const snapshot = await window.PortfolioStateData.loadSnapshot(
  1, // account_id
  '2025-01-15', // date
  { include_closed: false }
);

// Load series for charts
const series = await window.PortfolioStateData.loadSeries(
  1, // account_id
  '2025-01-01', // start_date
  '2025-01-31', // end_date
  { interval: 'day' }
);
```

### Trading Journal

```javascript
// Load entries
const entries = await window.TradingJournalData.loadEntries(
  {
    start_date: '2025-01-01',
    end_date: '2025-01-31'
  },
  { entity_type: 'all' }
);

// Load calendar data
const calendar = await window.TradingJournalData.loadCalendarData(
  1, // month (1-12)
  2025, // year
  { entity_type: 'all' }
);
```

---

## 🔍 Best Practices

### 1. תמיד להשתמש ב-Data Services

❌ **לא נכון:**

```javascript
// Direct API call
const response = await fetch('/api/trade-history/');
```

✅ **נכון:**

```javascript
// Use Data Service
const data = await window.TradeHistoryData.loadTradeHistory(filters);
```

### 2. שימוש ב-Cache

- Data Services מטפלים במטמון אוטומטית
- אין צורך לבדוק cache ידנית
- להשתמש ב-`force: true` רק כשצריך נתונים טריים

### 3. Error Handling

- Data Services מטפלים בשגיאות אוטומטית
- רק לטפל ב-UI state אם נדרש

### 4. Cache Invalidation

- להשתמש ב-`invalidateCache()` רק כשצריך
- Cache invalidation אוטומטית דרך CacheSyncManager

---

## 📚 קבצים רלוונטיים

### Frontend

- `trading-ui/scripts/services/trade_history-data.js` - Trade History Data Service
- `trading-ui/scripts/services/portfolio_state-data.js` - Portfolio State Data Service
- `trading-ui/scripts/services/trading_journal-data.js` - Trading Journal Data Service
- `trading-ui/scripts/unified-cache-manager.js` - Unified Cache Manager
- `trading-ui/scripts/cache-ttl-guard.js` - Cache TTL Guard

### Documentation

- `documentation/02-ARCHITECTURE/BACKEND/HISTORICAL_DATA_SERVICE.md` - Backend Documentation
- `documentation/03-DEVELOPMENT/PLANS/HISTORICAL_PAGES_FULL_IMPLEMENTATION_PLAN.md` - Implementation Plan

---

## ✅ סטטוס

- ✅ TradeHistoryData - מוכן
- ✅ PortfolioStateData - מוכן
- ✅ TradingJournalData - מוכן
- ✅ trading-journal-page.js - מימוש מלא (07.12.2025)
  - טעינת נתונים אמיתיים מהבקאנד
  - רינדור דינמי של רשומות
  - פילטרים לפי entity type
  - אינטגרציה עם מערכות כלליות
- ✅ Cache Integration - מוכן
- ✅ Page Integration - מוכן
- ⏳ Full Implementation - pending (placeholder functions need implementation)

---

**תאריך עדכון אחרון:** 7 דצמבר 2025


