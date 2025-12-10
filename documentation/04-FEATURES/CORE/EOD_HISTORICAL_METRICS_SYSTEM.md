# שמירת חישובים היסטוריים יומיים - EOD Historical Metrics System

## סקירה כללית

מערכת EOD Historical Metrics (נתוני סגירה היסטוריים) מיועדת לשמירת חישובים מורכבים בתדירות יומית, כדי למנוע חישובים חוזרים ולשפר ביצועים ואמינות הנתונים.

## מטרות המערכת

- **שיפור ביצועים**: מניעת חישובים כפולים של נתונים מורכבים
- **אמינות נתונים**: מקור אמת יחיד לנתונים היסטוריים
- **ולידציה**: זיהוי פערים וסתירות בנתונים
- **אינטגרציה מלאה**: שימוש בכל העמודים ההיסטוריים

## מדדים לשימור יומי

### פורטפוליו (EOD)
- `nav_total` - שווי תיק כולל
- `nav_base_currency` - שווי תיק במטבע בסיס
- `cash_total` - יתרות מזומן כולל
- `positions_count_open/closed` - ספירת פוזיציות
- `exposure_long/short` - חשיפות פוזיציות

### P&L יומי ומצטבר
- `unrealized_pl_amount/percent` - רווח/הפסד לא מומש
- `realized_pl_amount` - רווח/הפסד מומש
- `realized_pl_to_date` - רווח/הפסד מצטבר
- `pnl_daily_change_amount/percent` - שינוי יומי
- `fees_today/taxes_today/dividends_today` - עמלות/מסים/דיבידנדים

### ביצועים
- `twr_daily/mtd/ytd` - Time-Weighted Return
- `mwr_daily` - Money-Weighted Return (אם זמין)
- `max_drawdown_to_date` - מקסימום שונא

### יתרות ותזרימים
- `cash_balances_by_currency` - יתרות מזומן לפי מטבע
- `inflows/outflows/dividends/fees/taxes/fx_adjustments` - תזרימי מזומן יומיים
- `net_flow` - תזרים נטו

### בקרת איכות נתונים
- `data_quality_status` - סטטוס איכות (valid/stale/needs_recompute)
- `missing_quotes_count` - מספר quotes חסרים
- `stale_quotes_count` - מספר quotes לא עדכניים
- `validation_errors` - פירוט שגיאות ולידציה

## מודל נתונים

### טבלאות מרכזיות

#### daily_portfolio_metrics
```sql
CREATE TABLE daily_portfolio_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    account_id INTEGER, -- nullable לצבירה כוללת
    date_utc DATE NOT NULL,
    nav_total DECIMAL(20,8),
    nav_base_currency DECIMAL(20,8),
    cash_total DECIMAL(20,8),
    positions_count_open INTEGER,
    positions_count_closed INTEGER,
    exposure_long DECIMAL(20,8),
    exposure_short DECIMAL(20,8),
    unrealized_pl_amount DECIMAL(20,8),
    unrealized_pl_percent DECIMAL(10,4),
    realized_pl_amount DECIMAL(20,8),
    realized_pl_to_date DECIMAL(20,8),
    pnl_daily_change_amount DECIMAL(20,8),
    pnl_daily_change_percent DECIMAL(10,4),
    twr_daily DECIMAL(10,6),
    twr_mtd DECIMAL(10,6),
    twr_ytd DECIMAL(10,6),
    max_drawdown_to_date DECIMAL(10,4),
    data_quality_status VARCHAR(20) DEFAULT 'valid',
    validation_errors JSONB,
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, account_id, date_utc)
);
```

#### daily_ticker_positions
```sql
CREATE TABLE daily_ticker_positions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    account_id INTEGER,
    ticker_id INTEGER NOT NULL,
    date_utc DATE NOT NULL,
    quantity DECIMAL(20,8),
    avg_cost DECIMAL(20,8),
    market_value DECIMAL(20,8),
    unrealized_pl_amount DECIMAL(20,8),
    unrealized_pl_percent DECIMAL(10,4),
    realized_pl_today DECIMAL(20,8),
    close_price DECIMAL(20,8),
    price_source VARCHAR(50),
    currency VARCHAR(3),
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, account_id, ticker_id, date_utc)
);
```

#### daily_cash_flows_agg
```sql
CREATE TABLE daily_cash_flows_agg (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    account_id INTEGER,
    date_utc DATE NOT NULL,
    inflow DECIMAL(20,8) DEFAULT 0,
    outflow DECIMAL(20,8) DEFAULT 0,
    dividends DECIMAL(20,8) DEFAULT 0,
    fees DECIMAL(20,8) DEFAULT 0,
    taxes DECIMAL(20,8) DEFAULT 0,
    fx_adjustments DECIMAL(20,8) DEFAULT 0,
    net_flow DECIMAL(20,8),
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, account_id, date_utc)
);
```

#### eod_job_runs
```sql
CREATE TABLE eod_job_runs (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'running',
    scope JSONB, -- {user_id, date_range, accounts}
    errors JSONB,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
```

## ארכיטקטורה

### שכבת שירותים (Backend)

#### EODMetricsService
- `calculate_daily_portfolio_metrics(user_id, account_id, date)` - חישוב מדדי פורטפוליו
- `calculate_daily_positions(user_id, account_id, date)` - חישוב פוזיציות טיקר
- `calculate_daily_cash_flows(user_id, account_id, date)` - צבירה תזרימי מזומן
- `validate_metrics(metrics)` - ולידציה פנימית
- `save_metrics(metrics, validation_result)` - שמירה עם סטטוס ולידציה

#### RecomputeService
- `recompute_user_date_range(user_id, start_date, end_date)` - חישוב מחדש לטווח תאריכים
- `recompute_account_date_range(account_id, start_date, end_date)` - חישוב מחדש לחשבון ספציפי
- `queue_recompute_job(job_data)` - הוספה לתור batch
- `get_recompute_status(job_id)` - סטטוס job

### שכבת API

#### GET /api/eod/metrics/portfolio
- פרמטרים: user_id, account_id?, date_from, date_to, include_positions=true/false
- תשובה: array של daily_portfolio_metrics + positions אם requested

#### GET /api/eod/metrics/positions
- פרמטרים: user_id, account_id?, ticker_id?, date_from, date_to
- תשובה: array של daily_ticker_positions

#### GET /api/eod/metrics/cash-flows
- פרמטרים: user_id, account_id?, date_from, date_to
- תשובה: array של daily_cash_flows_agg

#### POST /api/eod/recompute
- body: {user_id, account_ids?, date_from, date_to}
- תשובה: {job_id, status: 'queued'}

#### GET /api/eod/recompute/{job_id}
- תשובה: {status, progress_percent?, errors?, duration_seconds}

### שכבת Frontend

#### EODMetricsDataService
```javascript
// trading-ui/scripts/services/eod-metrics-data.js
class EODMetricsDataService {
    async getPortfolioMetrics(userId, filters = {}) {
        return await CacheTTLGuard.get(
            `eod_portfolio_${userId}_${filters.account_id || 'all'}_${filters.date_from}_${filters.date_to}`,
            () => this._fetchPortfolioMetrics(userId, filters),
            { ttl: 3600000 } // 1 hour
        );
    }
}
```

#### EOD Validation & Notification Service
```javascript
// trading-ui/scripts/services/eod-validation-service.js
class EODValidationService {
    validatePortfolioMetrics(metrics) {
        // NAV consistency validation
        const navCalculated = (metrics.market_value_total || 0) + (metrics.cash_total || 0);
        // ... validation logic
    }
}
```

#### EOD Integration Helper
```javascript
// trading-ui/scripts/services/eod-integration-helper.js
window.EODIntegrationHelper = {
    // Core integration
    integrateEODMetrics(containerId, type, userId, filters, successCallback, fallbackFn),

    // Specific loaders with fallback
    loadEODPortfolioMetrics(userId, filters, fallbackFn),
    loadEODPositions(userId, filters, fallbackFn),
    loadEODCashFlows(userId, filters, fallbackFn),

    // Error handling & validation
    handleEODError(error, context),
    validateEODData(data, type),
    suggestEODRecompute(type, filters)
};
```

### אינטגרציה בעמודים

#### דשבורד טיקר (ticker-dashboard.html)
- נשאר מקור המנגנון החסרים/Retry
- משתמש ב-EODMetricsDataService להצגה
- מציע "רענון כללי" לכל העמודים

#### יומן מסחר (trading-journal.html)
- KPI יומי/גרף פעילות מה-EOD שמור
- כפתור רענון מפעיל RecomputeService
- fallback ל-Recompute אם חסרים

#### דף הבית (index.html)
- KPI עליונים + widgets → EOD שמור
- כפתור רענון → Recompute

#### עמודי מוקאפ
- trade-history-page.html: EOD per date/תיק
- portfolio-state-page.html: חתכי NAV/פוזיציות/יתרות EOD

### ולידציה ו-Runtime Calculations

#### הפרדה ברורה
- **EOD (שמור)**: NAV, P&L מצטבר, ביצועים, יתרות סגירה, פוזיציות סגירה
- **Runtime (חי)**: אינטראדיי, סימולציות, Stop/Target, סכום↔כמות↔מחיר

#### ולידציה
```javascript
// ב-EODMetricsService.validate()
const navCalculated = positions.reduce((sum, pos) => sum + pos.market_value, 0) + cashTotal;
if (Math.abs(navStored - navCalculated) > tolerance) {
    validation_errors.push({
        field: 'nav_consistency',
        expected: navCalculated,
        actual: navStored,
        difference: navStored - navCalculated
    });
}
```

### תהליכי EOD

#### יום סגירה אוטומטי
1. איסוף quotes סגירה מ-external data
2. חישוב פוזיציות (market_value, unrealized_pl)
3. צבירת תזרימי מזומן
4. חישוב NAV ו-benchmarks
5. ולידציה פנימית
6. שמירה עם data_quality_status
7. invalidation של cache TTL

#### Recompute ידני/אוטומטי
1. זיהוי חסרים/פערים
2. הוספה ל-queue batch
3. עיבוד ברקע עם progress tracking
4. עדכון UI עם NotificationSystem
5. invalidation של cache

### בדיקות

#### יחידה (Backend)
- חישובי NAV/P&L/performances
- המרות FX
- ולידציה פערים
- כתיבה/קריאה לטבלאות EOD

#### אינטגרציה (Backend)
- זרימת EOD מלאה על נתוני אמת
- טיפול בשגיאות quotes חסרים
- Recompute queue/batch

#### חוזה API
- מבני תשובה EOD
- סטטוסי ולידציה
- Recompute

#### Frontend
- Info Summary/Statistics Calculator מול EOD
- Page State Manager לפילטרי תאריך/חשבון/טיקר
- CacheTTLGuard + CacheSyncManager

#### Selenium
- לאחר מימוש: `python3 scripts/test_pages_console_errors.py`
