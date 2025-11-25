# מדריך מפתחים: חישוב שינויי מחיר מפתיחת המסחר

## 📋 סקירה כללית

מדריך זה מסביר כיצד להשתמש ולהרחיב את מערכת חישוב שינויי מחיר מפתיחת המסחר במערכת TikTrack.

**גרסה**: 1.0  
**תאריך עדכון**: 25 בנובמבר 2025  
**מחבר**: TikTrack Development Team

---

## 🎯 מה זה?

מערכת זו מוסיפה חישוב והצגה של שינויי מחיר מפתיחת המסחר (09:30 ET) בנוסף לשינוי היומי הקיים (ביחס ליום הקודם).

**דוגמה:**
- מחיר פתיחה: $100.00
- מחיר נוכחי: $105.50
- שינוי מפתיחה: +$5.50 (+5.50%)
- שינוי יומי: +$2.50 (+2.42%) ← ביחס ליום הקודם

---

## 🏗️ ארכיטקטורה

### 2.1 מבנה הנתונים

#### MarketDataQuote Model

```python
class MarketDataQuote(BaseModel):
    # שדות קיימים
    price = Column(Float, nullable=False)                    # מחיר נוכחי
    change_pct_day = Column(Float, nullable=True)             # שינוי % יומי
    change_amount_day = Column(Float, nullable=True)           # שינוי כספי יומי
    
    # שדות חדשים (מ-25 בנובמבר 2025)
    open_price = Column(Float, nullable=True)                      # מחיר פתיחה יומי
    change_pct_from_open = Column(Float, nullable=True)             # שינוי % מפתיחה
    change_amount_from_open = Column(Float, nullable=True)           # שינוי כספי מפתיחה
```

#### QuoteData Dataclass

```python
@dataclass
class QuoteData:
    symbol: str
    price: float
    change_pct_day: Optional[float] = None
    change_amount_day: Optional[float] = None
    
    # שדות חדשים
    open_price: Optional[float] = None
    change_pct_from_open: Optional[float] = None
    change_amount_from_open: Optional[float] = None
```

### 2.2 זרימת הנתונים

```
Yahoo Finance API
    ↓
YahooFinanceAdapter._parse_quote_response()
    ↓ (מחלץ regularMarketOpen)
    QuoteData (עם open_price, change_pct_from_open, change_amount_from_open)
    ↓
YahooFinanceAdapter._cache_quote_by_ticker()
    ↓
MarketDataQuote (בסיס הנתונים)
    ↓
TickerService.get_all() / get_by_id()
    ↓ (מוסיף שדות ל-ticker object)
    API Response (/api/tickers)
    ↓
Frontend (tickers.js, field-renderer-service.js)
```

---

## 💻 שימוש ב-Backend

### 3.1 קבלת נתונים מ-MarketDataQuote

```python
from models.external_data import MarketDataQuote
from sqlalchemy.orm import Session

def get_ticker_market_data(db: Session, ticker_id: int):
    """קבלת נתוני שוק כולל שינוי מפתיחה"""
    quote = db.query(MarketDataQuote).filter(
        MarketDataQuote.ticker_id == ticker_id
    ).order_by(MarketDataQuote.fetched_at.desc()).first()
    
    if quote:
        return {
            'price': quote.price,
            'change_pct_day': quote.change_pct_day,
            'change_amount_day': quote.change_amount_day,
            # שדות חדשים
            'open_price': quote.open_price,
            'change_pct_from_open': quote.change_pct_from_open,
            'change_amount_from_open': quote.change_amount_from_open
        }
    return None
```

### 3.2 שימוש ב-TickerService

```python
from services.ticker_service import TickerService

# TickerService מוסיף אוטומטית את השדות החדשים
tickers = TickerService.get_all(db)

for ticker in tickers:
    if hasattr(ticker, 'open_price') and ticker.open_price:
        print(f"{ticker.symbol}: מחיר פתיחה ${ticker.open_price}")
        print(f"  שינוי מפתיחה: {ticker.change_from_open_percent}%")
```

### 3.3 API Response Format

**GET /api/tickers**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "symbol": "AAPL",
      "current_price": 105.50,
      "change_percent": 2.42,
      "change_amount": 2.50,
      "open_price": 100.00,
      "change_from_open": 5.50,
      "change_from_open_percent": 5.50
    }
  ]
}
```

---

## 🎨 שימוש ב-Frontend

### 4.1 טבלת טיקרים

הקוד ב-`trading-ui/scripts/tickers.js` מציג אוטומטית את שינוי מפתיחה:

```javascript
// שורות 2049-2065
const changeFromOpenValue = toFiniteNumber(ticker.change_from_open);
const changeFromOpenPercentValue = toFiniteNumber(ticker.change_from_open_percent);

if (changeFromOpenValue !== null && changeFromOpenPercentValue !== null) {
    const changeFromOpenColor = changeFromOpenValue >= 0 ? 'text-success' : 'text-danger';
    const changeFromOpenIcon = changeFromOpenValue >= 0 ? '↗' : '↘';
    changeFromOpenHtml = `<br><small class="${changeFromOpenColor}">${changeFromOpenIcon} מפתיחה: ${changeFromOpenValue >= 0 ? '+' : ''}${changeFromOpenValue.toFixed(2)} (${changeFromOpenPercentValue >= 0 ? '+' : ''}${changeFromOpenPercentValue.toFixed(2)}%)</small>`;
}
```

### 4.2 FieldRendererService

השימוש ב-`FieldRendererService.renderTickerInfo()` מציג אוטומטית את שינוי מפתיחה:

```javascript
// trading-ui/scripts/services/field-renderer-service.js
const tickerData = {
    symbol: 'AAPL',
    price: 105.50,
    change_percent: 2.42,
    change_amount: 2.50,
    // שדות חדשים
    open_price: 100.00,
    change_from_open: 5.50,
    change_from_open_percent: 5.50
};

FieldRendererService.renderTickerInfo(tickerData, 'compact');
```

### 4.3 מודולי הוספה/עריכה

המודולים הבאים משתמשים ב-`FieldRendererService.renderTickerInfo()`:
- `trade_plans.js` - `updateEditTickerInfo()`
- `trades.js` - `updateEditTradePriceFromTicker()`
- `executions.js` - `displayExecutionTickerInfo()`

---

## 🔧 הרחבה והתאמה אישית

### 5.1 הוספת חישוב מותאם

אם אתה צריך חישוב מותאם, תוכל להוסיף פונקציה חדשה:

```python
def calculate_custom_change_from_open(current_price: float, open_price: float) -> dict:
    """חישוב מותאם של שינוי מפתיחה"""
    if not open_price or open_price <= 0:
        return None
    
    change_amount = current_price - open_price
    change_percent = (change_amount / open_price) * 100
    
    return {
        'change_amount': change_amount,
        'change_percent': change_percent,
        'is_positive': change_amount >= 0
    }
```

### 5.2 הוספת תצוגה מותאמת ב-Frontend

```javascript
function renderCustomChangeFromOpen(ticker) {
    if (!ticker.change_from_open || !ticker.change_from_open_percent) {
        return '<span class="text-muted">אין נתונים</span>';
    }
    
    const isPositive = ticker.change_from_open >= 0;
    const color = isPositive ? 'text-success' : 'text-danger';
    const icon = isPositive ? '↗' : '↘';
    
    return `
        <div class="${color}">
            ${icon} מפתיחה: 
            ${isPositive ? '+' : ''}${ticker.change_from_open.toFixed(2)} 
            (${isPositive ? '+' : ''}${ticker.change_from_open_percent.toFixed(2)}%)
        </div>
    `;
}
```

---

## ⚠️ נקודות חשובות

### 6.1 טיפול בנתונים חסרים

**חשוב**: השדות החדשים הם `nullable=True` - תמיד לבדוק אם קיימים:

```python
# ✅ נכון
if quote.open_price is not None:
    # עיבוד נתונים

# ❌ שגוי
change = current_price - quote.open_price  # יכול להיות None!
```

```javascript
// ✅ נכון
if (ticker.change_from_open !== null && ticker.change_from_open !== undefined) {
    // הצגת נתונים
}

// ❌ שגוי
const display = ticker.change_from_open.toFixed(2);  // יכול להיות null!
```

### 6.2 זמן ושעון ניו יורק

**חשוב**: מחיר פתיחה נקבע ב-09:30 ET ונשאר קבוע לאורך כל יום המסחר.

- **09:30 ET**: מחיר פתיחה מתעדכן
- **09:30-16:00 ET**: מחיר פתיחה נשאר קבוע, שינוי מפתיחה מתעדכן
- **אחרי 16:00 ET**: מחיר פתיחה נשאר של היום, שינוי מפתיחה = שינוי מפתיחה של היום
- **לפני 09:30 ET**: אין מחיר פתיחה עדיין (None)

### 6.3 Cache Invalidation

הנתונים מתעדכנים אוטומטית בכל fetch מ-Yahoo Finance. אם יש בעיה עם נתונים ישנים:

```python
# ניקוי cache של ticker ספציפי
from services.advanced_cache_service import invalidate_cache

invalidate_cache('ticker', ticker_id)
```

---

## 🧪 בדיקות

### 7.1 בדיקת Backend

```python
# בדיקת קבלת נתונים
quote = db.query(MarketDataQuote).filter(
    MarketDataQuote.ticker_id == 1
).order_by(MarketDataQuote.fetched_at.desc()).first()

assert quote.open_price is not None, "open_price should be set"
assert quote.change_pct_from_open is not None, "change_pct_from_open should be set"
assert quote.change_amount_from_open is not None, "change_amount_from_open should be set"
```

### 7.2 בדיקת Frontend

```javascript
// בדיקת הצגת נתונים
const ticker = {
    symbol: 'AAPL',
    change_from_open: 5.50,
    change_from_open_percent: 5.50
};

const html = FieldRendererService.renderTickerInfo(ticker, 'compact');
assert(html.includes('מפתיחה'), 'Should display change from open');
```

---

## 📚 קבצים רלוונטיים

### Backend
- `Backend/models/external_data.py` - MarketDataQuote model
- `Backend/services/external_data/yahoo_finance_adapter.py` - חילוץ נתונים מ-Yahoo Finance
- `Backend/services/external_data/data_normalizer.py` - נרמול נתונים
- `Backend/services/ticker_service.py` - הוספת שדות ל-ticker objects
- `Backend/routes/api/tickers.py` - API endpoints
- `Backend/migrations/add_open_price_fields_to_market_data_quote.py` - Migration script

### Frontend
- `trading-ui/scripts/tickers.js` - טבלת טיקרים
- `trading-ui/scripts/services/field-renderer-service.js` - רכיב תצוגה
- `trading-ui/scripts/entity-details-renderer.js` - מודול פרטי טיקר
- `trading-ui/scripts/trade_plans.js` - מודול תוכניות
- `trading-ui/scripts/trades.js` - מודול טריידים
- `trading-ui/scripts/executions.js` - מודול ביצועים

### תיעוד
- `documentation/02-ARCHITECTURE/BACKEND/PRICE_CHANGE_FROM_OPEN_ANALYSIS.md` - ניתוח מפורט
- `documentation/03-DEVELOPMENT/GUIDES/PRICE_CHANGE_FROM_OPEN_DEVELOPER_GUIDE.md` - מדריך זה

---

## 🐛 פתרון בעיות

### בעיה: נתונים לא מוצגים

**סיבות אפשריות:**
1. עדיין לא בוצע fetch חדש מ-Yahoo Finance
2. Yahoo Finance לא החזיר `regularMarketOpen`
3. Cache ישן

**פתרון:**
```python
# בדיקת נתונים בבסיס הנתונים
quote = db.query(MarketDataQuote).filter(
    MarketDataQuote.ticker_id == ticker_id
).order_by(MarketDataQuote.fetched_at.desc()).first()

if quote and quote.open_price is None:
    # צריך לבצע fetch חדש
    from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
    adapter = YahooFinanceAdapter()
    adapter.fetch_quote_for_ticker(db, ticker_id)
```

### בעיה: חישוב שגוי

**בדיקה:**
```python
# וידוא שהחישוב נכון
open_price = 100.00
current_price = 105.50

change_amount = current_price - open_price  # 5.50
change_percent = (change_amount / open_price) * 100  # 5.50%

assert abs(change_amount - quote.change_amount_from_open) < 0.01
assert abs(change_percent - quote.change_pct_from_open) < 0.01
```

---

## 📝 היסטוריית שינויים

### גרסה 1.0 (25 בנובמבר 2025)
- ✅ הוספת שדות חדשים ל-MarketDataQuote
- ✅ עדכון Yahoo Finance Adapter
- ✅ עדכון Frontend להצגת שינוי מפתיחה
- ✅ יצירת מדריך מפתחים

---

## 🤝 תמיכה

לשאלות או בעיות, פנה ל:
- **תיעוד ארכיטקטוני**: `documentation/02-ARCHITECTURE/BACKEND/PRICE_CHANGE_FROM_OPEN_ANALYSIS.md`
- **צוות פיתוח**: TikTrack Development Team

