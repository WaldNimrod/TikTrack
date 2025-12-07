# Data Refresh Policy - מדיניות רענון נתונים

**תאריך:** 2025-12-07  
**גרסה:** 1.0.0  
**מיקום:** `Backend/services/external_data/data_refresh_policy.py`

---

## סקירה כללית

`DataRefreshPolicy` היא מערכת שמגדירה תדירויות רענון שונות לסוגי נתונים שונים, בהתאם לחשיבות הנתון ולמידת השינוי שלו. המערכת מבטיחה שהמערכת לא תטען נתונים מיותרים ותשמור על אופטימיזציה של בקשות לספקי נתונים.

---

## תדירויות רענון

### 1. Current Quote (מחיר נוכחי)

**תדירות:**
- **Active trades, market hours:** 5 דקות
- **Active trades, off hours:** 60 דקות
- **Open tickers, market hours:** 15 דקות
- **Open tickers, off hours:** 60 דקות
- **Closed tickers:** 24 שעות
- **Cancelled tickers:** 7 ימים

**הסבר:** המחיר הנוכחי משתנה במהירות במהלך שעות השוק, ולכן נדרש רענון תכוף יותר לטיקרים עם trades פעילים.

### 2. Historical Data (נתונים היסטוריים)

**תדירות:** פעם ביום (אחרי סגירת השוק - אחרי 5 PM NY time)

**הסבר:** נתונים היסטוריים לא משתנים, ולכן אין צורך לטעון אותם יותר מפעם ביום.

### 3. Technical Indicators (אינדיקטורים טכניים)

**תדירות:** פעם ביום (אחרי סגירת השוק)

**אינדיקטורים:**
- **ATR (Average True Range):** תלוי בנתונים היסטוריים
- **Volatility (30-day):** תלוי בנתונים היסטוריים
- **MA 20 (Moving Average 20):** תלוי בנתונים היסטוריים
- **MA 150 (Moving Average 150):** תלוי בנתונים היסטוריים
- **52W Range:** תלוי בנתונים היסטוריים

**הסבר:** אינדיקטורים טכניים מחושבים על בסיס נתונים היסטוריים, ולכן אין צורך לחשב אותם יותר מפעם ביום.

### 4. Market Cap (שווי שוק)

**תדירות:** פעם ביום

**הסבר:** שווי שוק משתנה לאט, ולכן אין צורך לטעון אותו יותר מפעם ביום.

---

## API Reference

### Constructor

```python
from services.external_data.data_refresh_policy import DataRefreshPolicy

policy = DataRefreshPolicy(db_session)
```

### Methods

#### `is_market_hours(now_utc=None) -> bool`

בודקת אם השעה הנוכחית היא בשעות השוק (NYSE: 9:30 AM - 4:00 PM ET, ימי חול).

**Parameters:**
- `now_utc` (datetime, optional) - זמן לבדיקה (ברירת מחדל: עכשיו)

**Returns:** `bool` - `True` אם בשעות השוק

**Example:**
```python
if policy.is_market_hours():
    # Market is open
    pass
```

#### `has_active_trades(ticker_id: int) -> bool`

בודקת אם לטיקר יש trades פעילים.

**Parameters:**
- `ticker_id` (int) - מזהה הטיקר

**Returns:** `bool` - `True` אם יש trades פעילים

**Example:**
```python
if policy.has_active_trades(ticker_id):
    # Ticker has active trades
    pass
```

#### `get_refresh_priority(ticker_id: int) -> int`

מחזירה עדיפות רענון לטיקר (מספר גבוה יותר = עדיפות גבוהה יותר).

**Parameters:**
- `ticker_id` (int) - מזהה הטיקר

**Returns:** `int` - עדיפות רענון:
- **100:** טיקרים עם trades פעילים
- **50:** טיקרים פתוחים ללא trades פעילים
- **10:** טיקרים סגורים/מבוטלים

**Example:**
```python
priority = policy.get_refresh_priority(ticker_id)
if priority >= 50:
    # High priority ticker
    pass
```

#### `should_refresh_quote(ticker_id: int, last_refresh_time: Optional[datetime], ticker_status: str, has_active_trades: bool, now_utc: Optional[datetime] = None) -> bool`

בודקת אם צריך לרענן quote נוכחי.

**Parameters:**
- `ticker_id` (int) - מזהה הטיקר
- `last_refresh_time` (datetime, optional) - זמן רענון אחרון
- `ticker_status` (str) - סטטוס הטיקר ('open', 'closed', 'cancelled')
- `has_active_trades` (bool) - האם יש trades פעילים
- `now_utc` (datetime, optional) - זמן לבדיקה (ברירת מחדל: עכשיו)

**Returns:** `bool` - `True` אם צריך לרענן

**Example:**
```python
if policy.should_refresh_quote(ticker_id, last_refresh, ticker.status, has_active):
    # Need to refresh quote
    pass
```

#### `should_refresh_historical(ticker_id: int, last_refresh_time: Optional[datetime], now_utc: Optional[datetime] = None) -> bool`

בודקת אם צריך לרענן נתונים היסטוריים.

**Parameters:**
- `ticker_id` (int) - מזהה הטיקר
- `last_refresh_time` (datetime, optional) - זמן רענון אחרון
- `now_utc` (datetime, optional) - זמן לבדיקה (ברירת מחדל: עכשיו)

**Returns:** `bool` - `True` אם צריך לרענן (אחרי 5 PM NY time, פעם ביום)

**Example:**
```python
if policy.should_refresh_historical(ticker_id, last_historical_refresh):
    # Need to refresh historical data
    pass
```

#### `should_refresh_indicator(ticker_id: int, indicator_type: str, last_refresh_time: Optional[datetime], now_utc: Optional[datetime] = None) -> bool`

בודקת אם צריך לרענן אינדיקטור טכני.

**Parameters:**
- `ticker_id` (int) - מזהה הטיקר
- `indicator_type` (str) - סוג האינדיקטור ('volatility_30', 'ma_20', 'ma_150', 'week52', 'atr')
- `last_refresh_time` (datetime, optional) - זמן רענון אחרון
- `now_utc` (datetime, optional) - זמן לבדיקה (ברירת מחדל: עכשיו)

**Returns:** `bool` - `True` אם צריך לרענן (אחרי 5 PM NY time, פעם ביום)

**Example:**
```python
if policy.should_refresh_indicator(ticker_id, 'ma_20', last_ma20_refresh):
    # Need to refresh MA 20
    pass
```

---

## שימוש ב-DataRefreshScheduler

`DataRefreshScheduler` משתמש ב-`DataRefreshPolicy` כדי להחליט מה לטעון:

```python
from services.external_data.data_refresh_policy import DataRefreshPolicy

policy = DataRefreshPolicy(db_session)

# Check if should refresh quote
if policy.should_refresh_quote(ticker_id, last_refresh, ticker.status, has_active):
    # Refresh quote
    pass

# Check if should refresh historical data (once per day after market close)
if policy.should_refresh_historical(ticker_id, last_historical_refresh):
    # Refresh historical data
    pass
```

---

## הגדרת תדירויות מותאמות אישית

ניתן לשנות תדירויות רענון על ידי עדכון `policy_config` ב-`DataRefreshPolicy.__init__()`:

```python
self.policy_config = {
    'quote_active_market_hours': 5 * 60,      # 5 דקות
    'quote_active_off_hours': 60 * 60,         # 60 דקות
    'quote_open_market_hours': 15 * 60,       # 15 דקות
    'quote_open_off_hours': 60 * 60,          # 60 דקות
    'quote_closed': 24 * 60 * 60,            # 24 שעות
    'quote_cancelled': 7 * 24 * 60 * 60,     # 7 ימים
    
    'historical_data': 24 * 60 * 60,         # 24 שעות
    'indicators': 24 * 60 * 60,              # 24 שעות
    'market_cap': 24 * 60 * 60,              # 24 שעות
}
```

---

## Best Practices

### 1. שימוש ב-Policy לפני טעינה

✅ **נכון:**
```python
# Check policy before loading
if policy.should_refresh_quote(ticker_id, last_refresh, ticker.status, has_active):
    # Load quote
    pass
```

❌ **לא נכון:**
```python
# Always load without checking
# Load quote - לא יעיל!
```

### 2. שימוש ב-Priority למיון

✅ **נכון:**
```python
# Sort tickers by priority
tickers.sort(key=lambda t: policy.get_refresh_priority(t.id), reverse=True)
```

### 3. בדיקת שעות שוק

✅ **נכון:**
```python
# Check market hours before deciding refresh frequency
if policy.is_market_hours():
    # Use market hours frequency
    pass
else:
    # Use off-hours frequency
    pass
```

---

## Related Documentation

- [Missing Data Checker](./MISSING_DATA_CHECKER.md) - זיהוי נתונים חסרים
- [Data Refresh Scheduler](../../../Backend/services/data_refresh_scheduler.py) - Scheduler אוטומטי
- [External Data System](./EXTERNAL_DATA_SYSTEM.md) - מערכת נתונים חיצוניים

---

## Support

לשאלות או בעיות, פנה לצוות הפיתוח או פתח issue ב-repository.

