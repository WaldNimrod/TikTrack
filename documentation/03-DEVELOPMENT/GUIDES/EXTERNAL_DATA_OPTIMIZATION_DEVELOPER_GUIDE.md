# מדריך מפתח - אופטימיזציה של טעינת נתונים חיצוניים

**תאריך:** 2025-12-07  
**גרסה:** 1.0.0  
**מטרה:** מדריך מקיף למפתחים עתידיים על איך המערכת עובדת ואיך להשתמש בה

---

## תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה](#ארכיטקטורה)
3. [מערכות מרכזיות](#מערכות-מרכזיות)
4. [שימוש במערכת](#שימוש-במערכת)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## סקירה כללית

מערכת האופטימיזציה של טעינת נתונים חיצוניים מבטיחה שהמערכת:

- **טוענת רק נתונים חסרים** (לא את כל הנתונים)
- **משתמשת בגודל קבוצות אופטימלי** (25 טיקרים)
- **טוענת נתונים היסטוריים פעם ביום** (אחרי סגירת השוק)
- **מחשבת אינדיקטורים אוטומטית** (אחרי טעינת נתונים היסטוריים)

---

## ארכיטקטורה

### תזרים נתונים

```
Frontend Request
    ↓
Backend API Endpoint
    ↓
MissingDataChecker.check_missing_data()
    ↓
DataRefreshPolicy.should_refresh_*()
    ↓
YahooFinanceAdapter (only missing data)
    ↓
Database + Cache
```

### רכיבים מרכזיים

1. **MissingDataChecker** - מזהה מה חסר
2. **DataRefreshPolicy** - קובע תדירויות רענון
3. **DataRefreshScheduler** - רענון אוטומטי ברקע
4. **YahooFinanceAdapter** - טעינת נתונים מספקים

---

## מערכות מרכזיות

### 1. MissingDataChecker

**מיקום:** `Backend/services/external_data/missing_data_checker.py`

**תפקיד:** מזהה בדיוק מה חסר לכל טיקר.

**שימוש:**

```python
from services.external_data.missing_data_checker import MissingDataChecker

checker = MissingDataChecker(db_session)
missing_data = checker.check_missing_data(ticker_id)

if missing_data['should_refresh_quote']:
    # Load quote
    pass

if missing_data['should_refresh_historical']:
    # Load historical data
    pass
```

**תיעוד מלא:** [Missing Data Checker](../../04-FEATURES/EXTERNAL_DATA/MISSING_DATA_CHECKER.md)

### 2. DataRefreshPolicy

**מיקום:** `Backend/services/external_data/data_refresh_policy.py`

**תפקיד:** מגדיר תדירויות רענון שונות לסוגי נתונים.

**שימוש:**

```python
from services.external_data.data_refresh_policy import DataRefreshPolicy

policy = DataRefreshPolicy(db_session)

if policy.should_refresh_quote(ticker_id, last_refresh, ticker.status, has_active):
    # Refresh quote
    pass
```

**תיעוד מלא:** [Data Refresh Policy](../../04-FEATURES/EXTERNAL_DATA/DATA_REFRESH_POLICY.md)

### 3. DataRefreshScheduler

**מיקום:** `Backend/services/data_refresh_scheduler.py`

**תפקיד:** רענון אוטומטי של נתונים ברקע.

**תכונות:**

- רענון quotes נוכחיים (בהתאם ל-DataRefreshPolicy)
- טעינת נתונים היסטוריים פעם ביום (אחרי 5 PM NY time)
- חישוב אינדיקטורים אוטומטי (אחרי טעינת נתונים היסטוריים)
- גודל קבוצות אופטימלי (25 טיקרים)
- לוגיקה דינמית להקטנת גודל קבוצה במקרה של שגיאות

**שימוש:**

```python
from services.data_refresh_scheduler import DataRefreshScheduler

scheduler = DataRefreshScheduler(db_session)
scheduler.start()  # Start automatic refresh
```

### 4. YahooFinanceAdapter

**מיקום:** `Backend/services/external_data/yahoo_finance_adapter.py`

**תפקיד:** טעינת נתונים מ-Yahoo Finance.

**תכונות:**

- גודל קבוצות אופטימלי (25 טיקרים)
- Rate limiting
- Retry logic
- Caching

---

## שימוש במערכת

### 1. טעינת נתונים חסרים לטיקר בודד

**Frontend:**

```javascript
// Use MissingDataChecker API first
const missingData = await fetch('/api/external-data/status/tickers/missing-data');
const tickersWithMissing = await missingData.json();

// Then refresh only missing data
if (tickersWithMissing.data.recommendations.find(r => r.ticker_id === tickerId)) {
    await window.ExternalDataService.refreshTickerData(tickerId, {
        forceRefresh: false,  // Let backend decide
        includeHistorical: undefined,  // Let backend decide
        daysBack: undefined  // Let backend decide
    });
}
```

**Backend:**

```python
# Endpoint: POST /api/external-data/quotes/{ticker_id}/refresh
from services.external_data.missing_data_checker import MissingDataChecker

checker = MissingDataChecker(db_session)
missing_data = checker.check_missing_data(ticker_id)

# Load only missing data
if missing_data['should_refresh_quote']:
    # Load quote
    pass

if missing_data['should_refresh_historical']:
    # Load historical data
    pass

if missing_data['should_refresh_indicators']:
    # Calculate indicators
    pass
```

### 2. טעינת נתונים חסרים לכל הטיקרים

**Frontend:**

```javascript
// Get list of tickers with missing data
const missingData = await fetch('/api/external-data/status/tickers/missing-data');
const tickers = await missingData.json();

// Refresh each ticker (backend will only load missing data)
for (const ticker of tickers.data.recommendations) {
    await window.ExternalDataService.refreshTickerData(ticker.ticker_id, {
        forceRefresh: false
    });
}
```

**Backend:**

```python
# Endpoint: POST /api/external-data/refresh/all
from services.external_data.missing_data_checker import MissingDataChecker

checker = MissingDataChecker(db_session)

for ticker in open_tickers:
    missing_data = checker.check_missing_data(ticker.id)
    
    if missing_data['should_refresh_quote']:
        # Load only quote (not historical, not indicators)
        pass
```

### 3. טעינת נתונים מלאה (כל הנתונים)

**Frontend:**

```javascript
// Load full data (current + historical + indicators)
await window.ExternalDataService.refreshTickerData(tickerId, {
    forceRefresh: true,
    includeHistorical: true,
    daysBack: 150
});
```

**Backend:**

```python
# Endpoint: POST /api/external-data/refresh/full
# This endpoint still uses MissingDataChecker to optimize
# but loads all data types if requested
```

---

## Best Practices

### 1. תמיד לבדוק מה חסר לפני טעינה

✅ **נכון:**

```python
# Check what's missing first
missing_data = checker.check_missing_data(ticker_id)

if missing_data['should_refresh_quote']:
    # Load quote
    pass
```

❌ **לא נכון:**

```python
# Always load everything - לא יעיל!
# Load quote, historical, indicators - always
```

### 2. שימוש ב-DataRefreshPolicy

✅ **נכון:**

```python
# Use policy to determine refresh frequency
if policy.should_refresh_quote(ticker_id, last_refresh, ticker.status, has_active):
    # Refresh quote
    pass
```

❌ **לא נכון:**

```python
# Always refresh without checking policy
# Refresh quote - always
```

### 3. גודל קבוצות אופטימלי

✅ **נכון:**

```python
# Use optimal batch size (25)
batch_size = 25
for i in range(0, len(tickers), batch_size):
    batch = tickers[i:i + batch_size]
    # Process batch
    pass
```

❌ **לא נכון:**

```python
# Too small or too large batches
batch_size = 5  # Too small - inefficient
batch_size = 100  # Too large - may cause errors
```

### 4. לוגיקה דינמית להקטנת גודל קבוצה

✅ **נכון:**

```python
# Dynamic batch size adjustment
if failure_rate > 0.5:
    batch_size = max(min_batch_size, batch_size // 2)
```

---

## Troubleshooting

### בעיה: המערכת טוענת את כל הנתונים גם אם רק חלק חסר

**פתרון:**

- ודא ש-`MissingDataChecker` משמש לפני טעינה
- ודא ש-`forceRefresh: false` ב-Frontend
- בדוק את ה-endpoint ב-Backend - האם הוא משתמש ב-`MissingDataChecker`?

### בעיה: Rate limiting (429 errors)

**פתרון:**

- זה נורמלי בבדיקות אוטומטיות מהירות
- Rate limiting הוא מנגנון הגנה חשוב
- אין צורך בשינוי

### בעיה: נתונים היסטוריים לא נטענים

**פתרון:**

- בדוק אם Scheduler רץ (`/api/external-data/status/scheduler/monitoring`)
- בדוק אם זה אחרי 5 PM NY time (נתונים היסטוריים נטענים פעם ביום)
- בדוק את ה-logs של Scheduler

### בעיה: אינדיקטורים לא מחושבים

**פתרון:**

- ודא שיש מספיק נתונים היסטוריים (150 quotes ל-MA 150)
- בדוק את ה-logs של `_calculate_technical_indicators()`
- ודא ש-`TechnicalIndicatorsCalculator` ו-`Week52Calculator` עובדים

---

## Related Documentation

- [Data Refresh Policy](../../04-FEATURES/EXTERNAL_DATA/DATA_REFRESH_POLICY.md)
- [Missing Data Checker](../../04-FEATURES/EXTERNAL_DATA/MISSING_DATA_CHECKER.md)
- [External Data Service System](../../02-ARCHITECTURE/FRONTEND/EXTERNAL_DATA_SERVICE_SYSTEM.md)
- [External Data System Analysis Report](../../05-REPORTS/EXTERNAL_DATA_SYSTEM_ANALYSIS_REPORT.md)

---

## Support

לשאלות או בעיות, פנה לצוות הפיתוח או פתח issue ב-repository.

