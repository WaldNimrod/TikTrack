# Historical Data Service - Architecture Documentation
# Historical Data Service - תיעוד ארכיטקטורה

**תאריך יצירה:** 7 דצמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ תיעוד מלא  
**מטרה:** תיעוד מקיף של Historical Data Service במערכת TikTrack

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה](#ארכיטקטורה)
3. [Business Logic Service](#business-logic-service)
4. [API Endpoints](#api-endpoints)
5. [Cache Strategy](#cache-strategy)
6. [אינטגרציה עם מערכות קיימות](#אינטגרציה-עם-מערכות-קיימות)
7. [דוגמאות שימוש](#דוגמאות-שימוש)

---

## 🎯 סקירה כללית

Historical Data Service הוא שירות מרכזי לחישוב וטיפול בנתונים היסטוריים במערכת TikTrack. השירות מספק:

- **חישוב מצב תיק היסטורי** - snapshot של תיק בנקודות זמן שונות
- **אגרגציה של היסטוריית טריידים** - ניתוח וסיכום טריידים
- **יומן מסחר** - איסוף וסיכום של הערות, טריידים וביצועים

### עקרונות מרכזיים:

1. **חישובים בזמן אמת** - אין שמירת נתונים כפולים, כל החישובים מתבצעים בזמן אמת
2. **מטמון אופטימלי** - שימוש במערכת המטמון המאוחדת (4 שכבות) לביצועים
3. **שימוש חוזר** - שימוש ב-Services קיימים (TradeBusinessService, StatisticsBusinessService, וכו')
4. **תשתית scalable** - תכנון לתמיכה בעתיד בנתונים היסטוריים נוספים

---

## 🏗️ ארכיטקטורה

### מבנה כללי:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Pages                           │
│  - trade-history-page.html                                 │
│  - portfolio-state-page.html                               │
│  - trading-journal-page.html                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend Data Services                         │
│  - TradeHistoryData                                         │
│  - PortfolioStateData                                       │
│  - TradingJournalData                                       │
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
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         HistoricalDataBusinessService                       │
│  - calculate_portfolio_state_at_date()                      │
│  - aggregate_trade_history()                                │
│  - aggregate_journal_entries()                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Existing Business Services                          │
│  - TradeBusinessService                                     │
│  - StatisticsBusinessService                                │
│  - PositionPortfolioService                                 │
│  - NoteBusinessService                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏢 Business Logic Service

### HistoricalDataBusinessService

**מיקום:** `Backend/services/business_logic/historical_data_business_service.py`

**תפקיד:** חישובים וולידציות עבור נתונים היסטוריים

**יורש מ:** `BaseBusinessService`

**table_name:** `None` (שירות חישוב, לא ישות DB)

### פונקציות עיקריות:

#### Portfolio State Calculations

1. **`calculate_portfolio_state_at_date()`**
   - חישוב מצב תיק בתאריך מסוים
   - כולל: positions, market values, P/L calculations
   - משתמש ב-`PositionPortfolioService` ו-`ExternalDataService`

2. **`calculate_portfolio_performance_range()`**
   - חישוב ביצועי תיק בטווח תאריכים
   - השוואה בין מצב התחלה למצב סיום

3. **`calculate_portfolio_snapshot_series()`**
   - חישוב סדרת snapshots לתאריכים מרובים
   - משמש לגרפים וטבלאות

#### Trade History Calculations

1. **`aggregate_trade_history()`**
   - אגרגציה של היסטוריית טריידים עם פילטרים
   - תמיכה ב-grouping (period, ticker, account)

2. **`calculate_trade_statistics()`**
   - חישוב סטטיסטיקות טריידים
   - כולל: total P/L, win rate, average P/L

3. **`calculate_trade_timeline(trade_id, user_id, include_durations=True)`**
   - חישוב ציר זמן מלא של טרייד
   - כולל: כל האובייקטים המקושרים (Trade, Trade Plan, Execution, Note, Alert, Cash Flow, Alert Activation)
   - חישוב לכל נקודת זמן:
     - `positionSize` - גודל פוזיציה מצטבר
     - `positionValue` - שווי פוזיציה (גודל × מחיר נוכחי)
     - `averagePrice` - מחיר ממוצע משוקלל
     - `realizedPL` - רווח/הפסד מוכר מצטבר
     - `unrealizedPL` - רווח/הפסד לא מוכר (באמצעות `_get_market_price_at_date`)
     - `totalPL` - סה"כ רווח/הפסד
   - חישוב משך זמן בין כל שתי רשומות
   - החזרת מבנה נתונים מלא עם metadata
   - **תאריכים:** מחזיר `datetime` objects (DateNormalizationService ממיר ל-DateEnvelope)

4. **`calculate_trade_chart_data(trade_id, user_id, days_before=7, days_after=7)`**
   - חישוב נתוני גרף לטרייד
   - כולל: מחירי שוק היסטוריים (7 ימים לפני + טווח הטרייד + 7 ימים אחרי)
   - חישוב נתונים לכל יום:
     - מחיר נכס (מחירי סגירה יומיים)
     - גודל פוזיציה
     - שווי פוזיציה
     - מחיר ממוצע לפוזיציה
     - רווח/הפסד מוכר
     - רווח/הפסד לא מוכר
   - החזרת נתונים בפורמט TradingView Lightweight Charts
   - **תאריכים:** מחזיר `datetime` objects (DateNormalizationService ממיר ל-DateEnvelope)

5. **`calculate_trade_statistics_detailed(trade_id, user_id)`**
   - חישוב סטטיסטיקות מפורטות לטרייד
   - כולל: `durationDays`, `planningWaitDays`, `totalPL`, `totalPLPercent`, `executionCount`, `averageExecutionPrice`, ועוד
   - משתמש ב-`calculate_trade_timeline()` לקבלת נתונים

6. **`calculate_trade_full_analysis()` - לא קיים כ-Business Service function**
   - ה-endpoint `/full-analysis` קורא לכל הפונקציות בנפרד ומאחד אותן
   - מיועד לעמוד trade-history בלבד (אופטימיזציה לטעינה אחת)
   - הנתונים מאוחדים ב-API endpoint ולא ב-Business Service

7. **`_get_market_price_at_date(db, ticker_id, target_date)`**
   - Helper function לקבלת מחיר שוק בתאריך מסוים
   - משתמש ב-`MarketDataQuote` עם provider 'yahoo_finance'
   - מחזיר את המחיר הקרוב ביותר לפני או בתאריך המטרה
   - משמש לחישוב unrealized P/L

8. **`calculate_plan_vs_execution_analysis()`**
   - ניתוח תוכניות vs ביצועים
   - השוואה בין trade plans לביצועים בפועל

#### Trading Journal Calculations

1. **`aggregate_journal_entries()`** ✅ **מימוש מלא - 07.12.2025**
   - איסוף הערות, טריידים, ביצועים, התראות, תזרימי מזומן, תוכניות
   - סינון לפי date range ו-entity types
   - מיון לפי תאריך (newest first)
   - פורמט אחיד לכל הישויות
   - **מימוש:** איסוף מכל ה-Models (Trade, Execution, Note, Alert, CashFlow, TradePlan)
   - **תאריך עדכון:** 07.12.2025

2. **`calculate_journal_statistics()`** ✅ **מימוש מלא - 07.12.2025**
   - חישוב סטטיסטיקות יומן
   - ספירה לפי סוג entity (6 סוגים: trade, execution, note, alert, cash_flow, trade_plan)
   - תמיכה בפילטרים לפי entity type
   - **מימוש:** ספירה מ-6 סוגי ישויות עם func.count()
   - **תאריך עדכון:** 07.12.2025

3. **`calculate_activity_stats()`** ✅ **מימוש מלא - 08.12.2025**
   - חישוב סטטיסטיקות פעילות לטווח תאריכים
   - תמיכה בשני מצבי תצוגה: יומי (daily) ושבועי (weekly)
   - ספירת ביצועים (executions) ורשומות תכנון (trade_plan, trade created, note, alert)
   - תמיכה בפילטרים לפי entity type ו-ticker symbol
   - **מימוש:** אגרגציה של journal entries לפי תקופה (יום/שבוע)
   - **תאריך עדכון:** 08.12.2025

4. **`validate_journal_entry()`**
   - ולידציה של ערך יומן

### Validation

**`validate()`** - ולידציה של פרמטרים:
- user_id (required, positive integer)
- account_id (optional, positive integer)
- start_date / end_date (required, valid date range, max 365 days)
- date (optional, for single date queries)

**סדר ולידציה:**
1. Database Constraints (ValidationService) - אם יש table
2. Business Rules Registry - min/max, allowed_values
3. Complex Business Rules - date ranges, user authorization

---

## 🔌 API Endpoints

### Trade History API

**Blueprint:** `Backend/routes/api/trade_history.py`

**Endpoints:**

#### כללי (נפרד - רלוונטי לממשקים אחרים):

1. **`GET /api/trade-history/{trade_id}/timeline`**
   - ציר זמן של טרייד ספציפי
   - Query params: `include_durations` (boolean, default: true)
   - Response: `{ timeline: [...], metadata: {...} }`
   - Cache: IndexedDB, 2 ימים (172800s)
   - Dependencies: `trades`, `executions`, `trade-plans`, `notes`, `alerts`, `cash-flows`

2. **`GET /api/trade-history/{trade_id}/chart-data`**
   - נתוני גרף לטרייד
   - Query params: `days_before` (int, default: 7), `days_after` (int, default: 7)
   - Response: `{ market_prices: [...], position_data: [...], pl_data: [...] }`
   - Cache: IndexedDB, 2 ימים (172800s)
   - Dependencies: `trades`, `executions`, `market_data_quotes`

3. **`GET /api/trade-history/{trade_id}/statistics`**
   - סטטיסטיקות מפורטות לטרייד
   - Response: `{ statistics: {...}, metadata: {...} }`
   - Cache: Backend, 5 דקות (300s) - dev / 10 דקות (600s) - prod
   - Dependencies: `trades`, `executions`

#### מאוחד (ספציפי - רק לעמוד trade-history):

4. **`GET /api/trade-history/{trade_id}/full-analysis`**
   - ניתוח מלא לטרייד (timeline + chart + statistics)
   - Query params: `days_before` (int, default: 7), `days_after` (int, default: 7), `include_durations` (boolean, default: true)
   - Response: `{ timeline: [...], chart_data: {...}, statistics: {...}, metadata: {...} }`
   - Cache: IndexedDB, 2 ימים (172800s)
   - Dependencies: כל ה-dependencies של ה-endpoints הנפרדים

#### כללי (כללי - רלוונטי לממשקים אחרים):

5. **`GET /api/trade-history/`**
   - רשימת טריידים עם פילטרים
   - Query params: `account_id`, `ticker_id`, `start_date`, `end_date`, `status`, `investment_type`, `group_by`
   - Response: `{ trades: [...], count: number }`

6. **`GET /api/trade-history/statistics`**
   - סטטיסטיקות טריידים (כללי)
   - Query params: `account_id`, `ticker_id`, `start_date`, `end_date`, `status`, `period`
   - Response: `{ total_trades, total_pl, win_rate, average_pl, ... }`

7. **`GET /api/trade-history/plan-vs-execution`**
   - ניתוח תוכניות vs ביצועים
   - Query params: `start_date`, `end_date`
   - Response: `{ analysis: [...] }`

8. **`GET /api/trade-history/aggregated`**
   - אגרגציה של טריידים
   - Query params: `group_by` (period/ticker/account), `account_id`, `ticker_id`, `start_date`, `end_date`
   - Response: `{ grouped: {...}, trades: [...], count: number }`

### Portfolio State API

**Blueprint:** `Backend/routes/api/portfolio_state.py`

**Endpoints:**

1. **`GET /api/portfolio-state/snapshot`**
   - Snapshot של תיק בתאריך מסוים
   - Query params: `date` (required), `account_id` (optional), `include_closed` (optional)
   - Response: `{ positions: [...], total_value, total_pl, total_pl_percent, snapshot_date, ... }`

2. **`GET /api/portfolio-state/series`**
   - סדרת snapshots לטווח תאריכים
   - Query params: `start_date`, `end_date`, `interval` (day/week/month), `account_id` (optional)
   - Response: `{ snapshots: [...], count: number }`

3. **`GET /api/portfolio-state/performance`**
   - ביצועי תיק בטווח תאריכים
   - Query params: `start_date`, `end_date`, `account_id` (optional)
   - Response: `{ start_state: {...}, end_state: {...}, performance: {...} }`

4. **`GET /api/portfolio-state/comparison`**
   - השוואה בין שני תאריכים
   - Query params: `date1`, `date2`, `account_id` (optional)
   - Response: `{ comparison: {...} }`

### Trading Journal API

**Blueprint:** `Backend/routes/api/trading_journal.py`

**Endpoints:**

1. **`GET /api/trading-journal/entries`**
   - רשימת ערכי יומן לטווח תאריכים
   - Query params: `start_date`, `end_date`, `entity_type` (optional), `entity_id` (optional), `ticker_symbol` (optional) ✅ **עודכן 08.12.2025**
   - Response: `{ entries: [...], count: number }`

2. **`GET /api/trading-journal/statistics`**
   - סטטיסטיקות יומן
   - Query params: `start_date`, `end_date`, `entity_type` (optional)
   - Response: `{ total_entries, by_type: {...} }`

3. **`GET /api/trading-journal/calendar`**
   - נתוני לוח שנה לחודש מסוים
   - Query params: `month` (1-12), `year`, `entity_type` (optional)
   - Response: `{ entries_by_day: {...} }`

4. **`GET /api/trading-journal/by-entity`**
   - ערכי יומן לפי entity
   - Query params: `entity_type`, `entity_id`
   - Response: `{ entries: [...], count: number }`

5. **`GET /api/trading-journal/activity-stats`** ✅ **חדש - 08.12.2025**
   - סטטיסטיקות פעילות לטווח תאריכים
   - Query params: `start_date`, `end_date`, `view_mode` (daily/weekly, default: daily), `entity_type` (optional), `ticker_symbol` (optional)
   - Response: `{ stats: [{ period, executions_count, planning_count }], view_mode, is_valid }`
   - **תאריך עדכון:** 08.12.2025
   - **שימוש:** גרף פעילות בעמוד trading-journal

### Decorators משותפים

כל ה-endpoints משתמשים ב-decorators הבאים:

- `@handle_database_session()` - ניהול database session
- `@cache_with_invalidation()` - מטמון עם invalidation
- `@rate_limit_endpoint()` - הגבלת קצב
- `@validate_request()` - ולידציה של request

---

## 💾 Cache Strategy

### Frontend Cache (UnifiedCacheManager)

**Trade History:**
- Cache key: `trade-history-data:{filtersHash}`
- TTL: 5 minutes (300,000ms)
- Layers: backend cache
- Dependencies: `trades`, `executions`, `trade-plans`

**Portfolio State:**
- Cache key: `portfolio-state-snapshot:{accountId}:{date}`
- TTL: 10 minutes (600,000ms)
- Layers: backend cache
- Dependencies: `executions`, `market_data_quotes`, `trades`

**Trading Journal:**
- Cache key: `trading-journal-entries:{filtersHash}`
- TTL: 3 minutes (180,000ms)
- Layers: backend cache
- Dependencies: `notes`, `trades`, `executions`

### Backend Cache

- שימוש ב-`CacheService` ל-backend caching
- Cache invalidation אוטומטית דרך `CacheSyncManager`
- TTLs זהים ל-Frontend

### Cache Invalidation

**Triggers:**
- יצירת/עדכון/מחיקת Trade → invalidate trade-history cache
- יצירת/עדכון/מחיקת Execution → invalidate portfolio-state cache
- יצירת/עדכון/מחיקת Note → invalidate trading-journal cache

---

## 🔗 אינטגרציה עם מערכות קיימות

### 1. Validation Service

**שימוש:**
- `validate_with_constraints()` - בדיקת database constraints
- `BusinessRulesRegistry` - בדיקת business rules
- Custom validation logic - בדיקת date ranges, user authorization

### 2. External Data Service

**שימוש:**
- `ExternalDataService` / `MarketDataQuote` - מחירי שוק היסטוריים
- משמש ל-`calculate_portfolio_state_at_date()` לחישוב market values

### 3. Date Normalization Service

**שימוש:**
- `DateNormalizationService` - נרמול תאריכים
- המרה ל/מ-DateEnvelope representation
- טיפול ב-timezones

### 4. Existing Business Services

**שימוש חוזר:**
- `TradeBusinessService` - חישובי P/L, אחוזים
- `StatisticsBusinessService` - חישובים סטטיסטיים
- `PositionPortfolioService` - חישוב פוזיציות
- `NoteBusinessService` - ולידציה של הערות

### 5. Cache System

**שימוש:**
- `UnifiedCacheManager` (Frontend) - 4 שכבות מטמון
- `CacheService` (Backend) - backend caching
- `CacheSyncManager` - סנכרון בין Frontend ל-Backend

### 6. Authorization

**שימוש:**
- `user_id` verification בכל endpoint
- בדיקת הרשאות דרך `get_current_user_id()`

---

## 📝 דוגמאות שימוש

### Backend - Portfolio State

```python
from services.business_logic.historical_data_business_service import HistoricalDataBusinessService
from datetime import datetime, timezone

service = HistoricalDataBusinessService(db_session=session)

# Calculate portfolio state at specific date
state = service.calculate_portfolio_state_at_date(
    user_id=1,
    account_id=2,
    target_date=datetime(2025, 1, 15, tzinfo=timezone.utc),
    include_closed=False
)

# Calculate performance over date range
performance = service.calculate_portfolio_performance_range(
    user_id=1,
    account_id=2,
    start_date=datetime(2025, 1, 1, tzinfo=timezone.utc),
    end_date=datetime(2025, 1, 31, tzinfo=timezone.utc)
)
```

### Frontend - Trade History

```javascript
// Load trade history with filters
const data = await window.TradeHistoryData.loadTradeHistory({
  account_id: 1,
  start_date: '2025-01-01',
  end_date: '2025-01-31',
  status: 'closed'
});

// Load statistics
const stats = await window.TradeHistoryData.loadStatistics({
  account_id: 1,
  start_date: '2025-01-01',
  end_date: '2025-01-31'
});

// Load plan vs execution analysis
const analysis = await window.TradeHistoryData.loadPlanVsExecution({
  start_date: '2025-01-01',
  end_date: '2025-01-31'
});
```

### Frontend - Portfolio State

```javascript
// Load snapshot at specific date
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

// Load performance
const performance = await window.PortfolioStateData.loadPerformance(
  1, // account_id
  {
    start_date: '2025-01-01',
    end_date: '2025-01-31'
  }
);
```

### Frontend - Trading Journal

```javascript
// Load journal entries
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

// Load statistics
const stats = await window.TradingJournalData.loadStatistics(
  {
    start_date: '2025-01-01',
    end_date: '2025-01-31'
  }
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

### 2. תמיד לטפל בשגיאות

```javascript
try {
  const data = await window.TradeHistoryData.loadTradeHistory(filters);
  // Use data
} catch (error) {
  window.Logger?.error('Error loading trade history', { error });
  window.NotificationSystem?.showError('שגיאה', 'שגיאה בטעינת היסטוריית טריידים');
}
```

### 3. שימוש ב-Cache

- Data Services מטפלים במטמון אוטומטית
- אין צורך לבדוק cache ידנית
- להשתמש ב-`force: true` רק כשצריך נתונים טריים

### 4. Date Normalization

- תמיד להשתמש ב-`DateNormalizationService` לנרמול תאריכים
- להמיר תאריכים ל-timezone-aware לפני שליחה ל-API

---

## 📚 קבצים רלוונטיים

### Backend
- `Backend/services/business_logic/historical_data_business_service.py` - Business Logic Service
- `Backend/routes/api/trade_history.py` - Trade History API
- `Backend/routes/api/portfolio_state.py` - Portfolio State API
- `Backend/routes/api/trading_journal.py` - Trading Journal API
- `Backend/tests/services/business_logic/test_historical_data_business_service.py` - Unit Tests

### Frontend
- `trading-ui/scripts/services/trade-history-data.js` - Trade History Data Service
- `trading-ui/scripts/services/portfolio-state-data.js` - Portfolio State Data Service
- `trading-ui/scripts/services/trading-journal-data.js` - Trading Journal Data Service
- `trading-ui/scripts/trade-history-page.js` - Trade History Page
- `trading-ui/scripts/portfolio-state-page.js` - Portfolio State Page
- `trading-ui/scripts/trading-journal-page.js` - Trading Journal Page

### Documentation
- `documentation/03-DEVELOPMENT/PLANS/HISTORICAL_PAGES_FULL_IMPLEMENTATION_PLAN.md` - Implementation Plan
- `documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md` - Business Logic Layer Documentation

---

## ✅ סטטוס

- ✅ Business Logic Service - מוכן
- ✅ API Endpoints - מוכן (placeholder implementations)
- ✅ Frontend Data Services - מוכן
- ✅ Cache Integration - מוכן
- ✅ Page Integration - מוכן
- ✅ Unit Tests - מוכן
- ⏳ Integration Tests - pending
- ⏳ Full Implementation - pending (placeholder functions need implementation)

---

**תאריך עדכון אחרון:** 7 דצמבר 2025


