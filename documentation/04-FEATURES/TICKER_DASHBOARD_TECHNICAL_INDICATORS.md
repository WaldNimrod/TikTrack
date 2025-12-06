# חישובים טכניים בדשבורד טיקר - תיעוד מפורט

**תאריך עדכון:** דצמבר 2025  
**גרסה:** 2.0.0  
**מטרה:** תיעוד מקיף של כל החישובים הטכניים בדשבורד הטיקר

---

## 📊 סקירה כללית

דשבורד הטיקר מציג מספר חישובים טכניים המבוססים על נתונים היסטוריים:

1. **ATR (Average True Range)** - מדד תנודתיות
2. **Volatility (תנודתיות)** - תנודתיות מחירים
3. **MA 20 (Moving Average 20)** - ממוצע נע 20 ימים
4. **MA 150 (Moving Average 150)** - ממוצע נע 150 ימים
5. **52W Range** - טווח מחירים ל-52 שבועות

---

## 🔄 Pre-calculation של חישובים

### מנגנון

לאחר טעינת נתונים היסטוריים, המערכת מבצעת **pre-calculation** של כל החישובים הטכניים:

**מיקום בקוד:**
- `Backend/routes/external_data/quotes.py` - פונקציה `refresh_ticker_quote()`
- `Backend/services/external_data/technical_indicators_calculator.py` - חישוב החישובים

**תהליך:**

1. **טעינת נתונים היסטוריים:**
   ```python
   historical_count = adapter.fetch_and_save_historical_quotes(ticker, days_back=150)
   ```

2. **Pre-calculation של כל החישובים:**
   - Volatility (אם יש 30+ quotes)
   - MA 20 (אם יש 20+ quotes)
   - MA 150 (אם יש 120+ quotes)
   - 52W Range (אם יש 10+ quotes)

3. **שמירה ב-cache:**
   ```python
   advanced_cache_service.set(cache_key, result, ttl=3600)  # 1 hour
   ```

### יתרונות

- ✅ החישובים זמינים מיד בקריאה הבאה ל-`get_entity_details`
- ✅ שיפור ביצועים - חישובים מתבצעים פעם אחת ונשמרים ב-cache
- ✅ חישובים מתבצעים גם אם cache disabled (אבל לא נשמרים)

---

## 📈 ATR (Average True Range)

### חישוב

**מקור:** `ATRCalculator.calculate_atr_from_database()`

**דרישות:**
- Quotes עם `high_price`, `low_price`, `close_price`
- מינימום 14 quotes (לחישוב ATR 14)

**תהליך:**
1. טעינת quotes היסטוריים עם OHLC
2. חישוב True Range לכל quote
3. חישוב ממוצע של True Ranges

**מיקום בקוד:**
- `Backend/services/external_data/atr_calculator.py`
- `Backend/services/entity_details_service.py` - שילוב ב-EntityDetailsService

---

## 📊 Volatility (תנודתיות)

### חישוב

**מקור:** `TechnicalIndicatorsCalculator.calculate_volatility()`

**דרישות:**
- Quotes עם `close_price` (לא null)
- מינימום 31 quotes (30+1 לחישוב returns)

**תהליך:**
1. טעינת quotes מ-30 הימים האחרונים
2. חישוב log returns: `log(close_price[i] / close_price[i-1])`
3. חישוב standard deviation של log returns
4. המרה לאחוזים: `volatility * 100`

**נוסחה:**
```
log_returns = [log(close[i] / close[i-1]) for i in range(1, len(quotes))]
mean_return = sum(log_returns) / len(log_returns)
variance = sum((r - mean_return)^2 for r in log_returns) / len(log_returns)
volatility = sqrt(variance) * 100
```

**מיקום בקוד:**
- `Backend/services/external_data/technical_indicators_calculator.py` - `calculate_volatility()`
- `Backend/services/entity_details_service.py` - שילוב ב-EntityDetailsService

---

## 📈 MA 20 (Moving Average 20)

### חישוב

**מקור:** `TechnicalIndicatorsCalculator.calculate_sma(period=20)`

**דרישות:**
- Quotes עם `close_price` (לא null)
- מינימום 20 quotes עם `close_price`

**תהליך:**
1. טעינת quotes מ-20 הימים האחרונים
2. חישוב ממוצע של 20 המחירים האחרונים

**נוסחה:**
```
sma_20 = sum(close_prices[-20:]) / 20
```

**מיקום בקוד:**
- `Backend/services/external_data/technical_indicators_calculator.py` - `calculate_sma()`
- `Backend/services/entity_details_service.py` - שילוב ב-EntityDetailsService

---

## 📈 MA 150 (Moving Average 150)

### חישוב

**מקור:** `TechnicalIndicatorsCalculator.calculate_sma(period=150)`

**דרישות:**
- Quotes עם `close_price` (לא null)
- **מינימום 120 quotes עם `close_price` (80% מ-150)** - **עודכן דצמבר 2025**

**תהליך:**
1. טעינת quotes מ-150 הימים האחרונים (או כל מה שיש)
2. אם יש פחות מ-150 quotes אבל יותר מ-120 - משתמשים בכל מה שיש
3. חישוב ממוצע של המחירים הזמינים

**נוסחה:**
```
available_quotes = min(len(quotes), 150)
recent_closes = [q.close_price for q in quotes[-available_quotes:]]
sma_150 = sum(recent_closes) / len(recent_closes)
```

**הערה חשובה:**
המערכת מאפשרת חישוב MA 150 גם עם פחות מ-150 quotes (מינימום 120) כדי להתחשב בסופי שבוע וחגים שבהם השוק סגור. זה מבטיח שהחישוב יעבוד גם עם נתונים חלקיים.

**מיקום בקוד:**
- `Backend/services/external_data/technical_indicators_calculator.py` - `calculate_sma()` עם לוגיקה של 80%
- `Backend/services/entity_details_service.py` - שילוב ב-EntityDetailsService

---

## 📊 52W Range

### חישוב

**מקור:** `Week52Calculator.calculate_52w_range()`

**דרישות:**
- Quotes עם `high_price`, `low_price` (לא null)
- מינימום 10 quotes (לחישוב אמין)
- נתונים מ-52 השבועות האחרונים (365 ימים)

**תהליך:**
1. טעינת quotes מ-365 הימים האחרונים
2. חישוב `high_52w` = max(high_price)
3. חישוב `low_52w` = min(low_price)

**נוסחה:**
```
high_52w = max(q.high_price for q in quotes)
low_52w = min(q.low_price for q in quotes)
```

**מיקום בקוד:**
- `Backend/services/external_data/week52_calculator.py` - `calculate_52w_range()`
- `Backend/services/entity_details_service.py` - שילוב ב-EntityDetailsService

---

## 🔄 Cache Management

### מנגנון Cache

כל החישובים נשמרים ב-cache למשך שעה (3600 שניות):

```python
cache_key = f"ticker_{ticker_id}_{indicator_name}"
advanced_cache_service.set(cache_key, result, ttl=3600)
```

### Cache Keys

- `ticker_{id}_volatility_30` - Volatility
- `ticker_{id}_ma_20` - MA 20
- `ticker_{id}_ma_150` - MA 150
- `ticker_{id}_week52` - 52W Range

### Invalidation

Cache מתנקה אוטומטית:
- לאחר טעינת נתונים היסטוריים חדשים
- לאחר refresh של quote
- לאחר שעה (TTL)

---

## 🎯 Frontend Integration

### תצוגה

כל החישובים מוצגים ב-KPI Cards:

```javascript
// ATR + Volatility
{ label: 'ATR', value: atrVolatilityHtml, dir: '', helpKey: 'atr' }

// 52W High
{ label: '52W גבוהה', value: week52HighHtml, dir: 'ltr', helpKey: 'week52_range' }

// 52W Low
{ label: '52W נמוכה', value: week52LowHtml, dir: 'ltr', helpKey: 'week52_range' }

// MA 20 + MA 150
{ label: 'יחס לממוצע', value: maHtml, dir: '', helpKey: null }
```

### FieldRendererService

החישובים מוצגים באמצעות `FieldRendererService`:

- `renderATR(atr, atrPercent)` - ATR עם traffic light
- `renderAmount(price, currency, decimals)` - מחירים
- `renderNumericValue(value, unit, showSign)` - אחוזים

---

## 🔄 Retry Mechanism

### מנגנון

המערכת מבצעת **retry mechanism** עם עד 10 ניסיונות (עם השהיה של 5 שניות בין ניסיונות) כדי להבטיח שכל הנתונים נטענו:

1. טעינת נתונים היסטוריים
2. בדיקת נתונים חסרים
3. אם יש נתונים חסרים - המתנה וניסיון חוזר
4. חזרה על התהליך עד שכל הנתונים זמינים או עד 10 ניסיונות

**מיקום בקוד:**
- `trading-ui/scripts/ticker-dashboard.js` - פונקציה `fetchDataFromProvider()`

---

## 📊 Progress Overlay

### מנגנון

המערכת מציגה **progress overlay** עם 4 שלבים בעת טעינת נתונים:

1. **שלב 1:** טוען מחיר נוכחי
2. **שלב 2:** טוען נתונים היסטוריים
3. **שלב 3:** מעבד ומאמת נתונים
4. **שלב 4:** מסיים טעינה

**תכונות:**
- הצגת אחוז התקדמות דינמי
- הודעות עדכון לכל שלב
- סגירה אוטומטית בסיום

**מיקום בקוד:**
- `trading-ui/scripts/services/unified-progress-manager.js` - שירות Progress Manager
- `trading-ui/scripts/ticker-dashboard.js` - שימוש ב-`UnifiedProgressManager`

---

## 📝 סיכום

**כל החישובים הטכניים:**
1. ✅ ATR - מחושב מיד עם 14+ quotes
2. ✅ Volatility - מחושב מיד עם 31+ quotes
3. ✅ MA 20 - מחושב מיד עם 20+ quotes
4. ✅ MA 150 - מחושב מיד עם 120+ quotes (80% מ-150)
5. ✅ 52W Range - מחושב מיד עם 10+ quotes

**שיפורים חדשים (דצמבר 2025):**
- ✅ Pre-calculation של חישובים טכניים
- ✅ MA 150 מחושב גם עם 80% מהנתונים (120 quotes במקום 150)
- ✅ Progress overlay עם 4 שלבים
- ✅ Retry mechanism עם עד 10 ניסיונות
- ✅ שיפור חוויית משתמש עם הודעות עדכון

---

## 🔄 אינטגרציה עם דשבורד טיקרים

**תאריך עדכון:** דצמבר 2025

**מימוש חדש:**
דשבורד טיקרים (`tickers.html`) עכשיו כולל אינטגרציה מלאה עם מערכת הנתונים החיצוניים וחישובים טכניים:

### תכונות חדשות:

1. **העשרת נתונים עם חישובים טכניים:**
   - `enrichTickersWithFullData()` - מעשירה טיקרים עם נתונים מלאים מ-`EntityDetailsAPI`
   - כוללת כל החישובים הטכניים (ATR, Volatility, MA 20/150, 52W)
   - משתמשת ב-cache לשיפור ביצועים

2. **שמירת חישובים טכניים:**
   - חישובים טכניים נשמרים ב-`UnifiedCacheManager` עם TTL של שעה
   - Cache key: `ticker-full-{tickerId}`
   - זמינים מיד בטעינת הדף הבאה

3. **בדיקת שלמות חישובים:**
   - `checkTickerDataCompleteness()` - בודקת את שלמות החישובים הטכניים
   - מחזירה מידע על חישובים חסרים ואחוז שלמות

### שימוש:

```javascript
// העשרת טיקרים עם חישובים טכניים
const enrichedTickers = await enrichTickersWithFullData(tickers, {
  showProgress: true,
  forceRefresh: false
});

// בדיקת שלמות חישובים
const completeness = checkTickerDataCompleteness(ticker);
// completeness.hasATR, completeness.hasVolatility, completeness.hasMA20, etc.
```

### מיקום בקוד:

- `trading-ui/scripts/tickers.js` - `enrichTickersWithFullData()`, `checkTickerDataCompleteness()`
- `trading-ui/scripts/ticker-dashboard.js` - `checkMissingData()` (גרסה מקורית)

---

## 🔗 קישורים רלוונטיים

- [דרישות נתונים לדשבורד טיקר](TICKER_DASHBOARD_DATA_REQUIREMENTS.md)
- [אינטגרציה עם מערכת נתונים חיצוניים](TICKERS_DASHBOARD_EXTERNAL_DATA_INTEGRATION.md)
- [תוכנית שיפורים לדשבורד טיקר](../03-DEVELOPMENT/PLANS/TICKER_DASHBOARD_IMPROVEMENTS_PLAN.md)
- [דוח בדיקות דשבורד טיקר](../05-REPORTS/TICKER_DASHBOARD_TEST_REPORT.md)

