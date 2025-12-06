# Missing Data Checker - בודק נתונים חסרים

**תאריך:** 2025-12-07  
**גרסה:** 1.0.0  
**מיקום:** `Backend/services/external_data/missing_data_checker.py`

---

## סקירה כללית

`MissingDataChecker` היא מערכת שמזהה בדיוק מה חסר לכל טיקר לפני טעינה. המערכת בודקת:
- Quotes נוכחיים (current quotes)
- נתונים היסטוריים (historical data)
- אינדיקטורים טכניים (technical indicators)

המערכת משתמשת ב-`DataRefreshPolicy` כדי לקבוע אם נתונים עדכניים או לא.

---

## תכונות עיקריות

- **זיהוי מדויק** - מזהה בדיוק מה חסר (לא רק "חסר נתונים")
- **בדיקת עדכניות** - בודקת אם נתונים עדכניים לפי `DataRefreshPolicy`
- **המלצות עם עדיפויות** - מספקת המלצות עם עדיפויות (high/medium/low)
- **Batch checking** - תמיכה בבדיקה של מספר טיקרים בבת אחת

---

## API Reference

### Constructor

```python
from services.external_data.missing_data_checker import MissingDataChecker

checker = MissingDataChecker(db_session)
```

### Methods

#### `check_missing_data(ticker_id: int) -> Dict[str, Any]`

בודקת מה חסר לטיקר בודד.

**Parameters:**
- `ticker_id` (int) - מזהה הטיקר

**Returns:** `Dict[str, Any]` - מילון עם פרטים על מה חסר:

```python
{
    'ticker_id': 1424,
    'symbol': 'AAPL',
    'name': 'Apple Inc.',
    'status': 'needs_refresh',  # 'ok', 'needs_refresh', 'incomplete', 'not_found'
    'has_any_missing': True,
    'missing_fields': ['current_price'],  # שדות חסרים
    'missing_calculations': ['ma_20', 'ma_150'],  # חישובים חסרים
    'should_refresh_quote': True,
    'should_refresh_historical': False,
    'should_refresh_indicators': ['ma_20', 'ma_150'],
    'data_freshness': {
        'last_quote_fetch': '2025-12-07T10:30:00Z',
        'last_quote_asof': '2025-12-07T10:30:00Z',
        'historical_count': 150
    },
    'recommendations': [
        {
            'reason': 'missing_current_quote',
            'message': 'חסר מחיר נוכחי',
            'priority': 'high'
        },
        {
            'reason': 'missing_ma_20',
            'message': 'חסר חישוב: ma_20',
            'priority': 'low'
        }
    ]
}
```

**Example:**
```python
missing_data = checker.check_missing_data(ticker_id)

if missing_data['has_any_missing']:
    print(f"Missing: {missing_data['missing_fields']}")
    print(f"Recommendations: {missing_data['recommendations']}")
```

#### `check_missing_data_batch(ticker_ids: List[int]) -> Dict[int, Dict[str, Any]]`

בודקת מה חסר למספר טיקרים בבת אחת.

**Parameters:**
- `ticker_ids` (List[int]) - רשימת מזההי טיקרים

**Returns:** `Dict[int, Dict[str, Any]]` - מילון של תוצאות (ticker_id -> result)

**Example:**
```python
ticker_ids = [1424, 1425, 1426]
results = checker.check_missing_data_batch(ticker_ids)

for ticker_id, result in results.items():
    if result['has_any_missing']:
        print(f"Ticker {ticker_id}: {result['missing_fields']}")
```

#### `get_data_freshness(ticker_id: int) -> Dict[str, Any]`

מחזירה סיכום של עדכניות הנתונים לטיקר.

**Parameters:**
- `ticker_id` (int) - מזהה הטיקר

**Returns:** `Dict[str, Any]` - מילון עם פרטי עדכניות:

```python
{
    'last_quote_fetch': '2025-12-07T10:30:00Z',
    'last_quote_asof': '2025-12-07T10:30:00Z',
    'historical_count': 150,
    'last_volatility_30_calc': '2025-12-07T10:30:00Z',
    'last_ma_20_calc': '2025-12-07T10:30:00Z',
    'last_ma_150_calc': '2025-12-07T10:30:00Z',
    'last_week52_calc': '2025-12-07T10:30:00Z'
}
```

**Example:**
```python
freshness = checker.get_data_freshness(ticker_id)
print(f"Last quote: {freshness['last_quote_fetch']}")
print(f"Historical quotes: {freshness['historical_count']}")
```

#### `should_refresh_quote_for_ticker(ticker_id: int) -> bool`

בודקת אם צריך לרענן quote נוכחי (convenience method).

**Parameters:**
- `ticker_id` (int) - מזהה הטיקר

**Returns:** `bool` - `True` אם צריך לרענן

**Example:**
```python
if checker.should_refresh_quote_for_ticker(ticker_id):
    # Refresh quote
    pass
```

#### `should_refresh_historical_for_ticker(ticker_id: int) -> bool`

בודקת אם צריך לרענן נתונים היסטוריים (convenience method).

**Parameters:**
- `ticker_id` (int) - מזהה הטיקר

**Returns:** `bool` - `True` אם צריך לרענן

**Example:**
```python
if checker.should_refresh_historical_for_ticker(ticker_id):
    # Refresh historical data
    pass
```

#### `should_refresh_indicators_for_ticker(ticker_id: int) -> List[str]`

בודקת אילו אינדיקטורים צריך לרענן (convenience method).

**Parameters:**
- `ticker_id` (int) - מזהה הטיקר

**Returns:** `List[str]` - רשימת אינדיקטורים שצריך לרענן

**Example:**
```python
indicators_to_refresh = checker.should_refresh_indicators_for_ticker(ticker_id)
if 'ma_20' in indicators_to_refresh:
    # Refresh MA 20
    pass
```

---

## שימוש ב-Endpoints

### `/api/external-data/status/tickers/missing-data`

Endpoint שמשתמש ב-`MissingDataChecker` כדי לזהות טיקרים עם נתונים חסרים.

**Response:**
```json
{
  "status": "success",
  "data": {
    "recommendations": [
      {
        "ticker_id": 1424,
        "symbol": "AAPL",
        "message": "חסר מחיר נוכחי",
        "priority": "high",
        "reason": "missing_current_quote"
      },
      {
        "ticker_id": 1425,
        "symbol": "MSFT",
        "message": "חסרים נתונים היסטוריים (75/150)",
        "priority": "medium",
        "reason": "insufficient_historical_data"
      }
    ]
  }
}
```

---

## שימוש ב-Refresh Endpoints

`MissingDataChecker` משמש ב-endpoints הבאים כדי לטעון רק נתונים חסרים:

### 1. `/api/external-data/quotes/{ticker_id}/refresh`

```python
# Backend uses MissingDataChecker to determine what to load
missing_data = checker.check_missing_data(ticker_id)

if missing_data['should_refresh_quote']:
    # Load current quote
    pass

if missing_data['should_refresh_historical']:
    # Load historical data
    pass

if missing_data['should_refresh_indicators']:
    # Calculate indicators
    pass
```

### 2. `/api/external-data/refresh/all`

```python
# Check missing data for all tickers
for ticker in open_tickers:
    missing_data = checker.check_missing_data(ticker.id)
    if missing_data['should_refresh_quote']:
        # Load only missing quote
        pass
```

### 3. `/api/external-data/refresh/full`

```python
# Check missing data and load only what's needed
for ticker in open_tickers:
    missing_data = checker.check_missing_data(ticker.id)
    # Load only missing data (quote, historical, indicators)
    pass
```

---

## Best Practices

### 1. בדיקה לפני טעינה

✅ **נכון:**
```python
# Check what's missing before loading
missing_data = checker.check_missing_data(ticker_id)

if missing_data['should_refresh_quote']:
    # Load quote
    pass

if missing_data['should_refresh_historical']:
    # Load historical
    pass
```

❌ **לא נכון:**
```python
# Always load everything - לא יעיל!
# Load quote, historical, indicators - always
```

### 2. שימוש ב-Recommendations

✅ **נכון:**
```python
# Use recommendations to prioritize
missing_data = checker.check_missing_data(ticker_id)

for rec in missing_data['recommendations']:
    if rec['priority'] == 'high':
        # Handle high priority first
        pass
```

### 3. Batch Checking

✅ **נכון:**
```python
# Check multiple tickers at once
ticker_ids = [1424, 1425, 1426]
results = checker.check_missing_data_batch(ticker_ids)

for ticker_id, result in results.items():
    if result['has_any_missing']:
        # Handle missing data
        pass
```

---

## Related Documentation

- [Data Refresh Policy](./DATA_REFRESH_POLICY.md) - מדיניות רענון נתונים
- [External Data System](./EXTERNAL_DATA_SYSTEM.md) - מערכת נתונים חיצוניים
- [Data Refresh Scheduler](../../../Backend/services/data_refresh_scheduler.py) - Scheduler אוטומטי

---

## Support

לשאלות או בעיות, פנה לצוות הפיתוח או פתח issue ב-repository.

