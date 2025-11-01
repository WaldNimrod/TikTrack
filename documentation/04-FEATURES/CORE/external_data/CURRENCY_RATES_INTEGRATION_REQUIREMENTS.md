# Currency Rates Integration Requirements
# דרישות אינטגרציה לשערי מטבע

**תאריך יצירה:** 1 בנובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** 📋 דרישות למפתח  
**מטרה:** הגדרת ממשק אחיד לאינטגרציה עם מערכת שערי מטבע חיצונית

---

## 📋 סקירה כללית

מסמך זה מגדיר את הדרישות והממשק הנדרשים להרחבת מערכת הנתונים החיצוניים של TikTrack כך שתכלול תמיכה בשערי מטבע בזמן אמת. המערכת צריכה לספק שערי המרה עדכניים בין מטבעות שונים עבור מערכת תנועות חשבון (Account Activity).

### מטרה עיקרית
מערכת תנועות חשבון צריכה להציג יתרות בכמה מטבעות ולהמיר אותן למטבע הבסיס של החשבון. לשם כך נדרש ממשק API אחיד לשערי מטבע עדכניים.

---

## 🔌 API Endpoints נדרשים

### 1. `GET /api/currency-rates/latest`
מחזיר שערי המרה עדכניים לכל המטבעות הזמינים במערכת.

**Request:**
```http
GET /api/currency-rates/latest HTTP/1.1
Host: localhost:8080
```

**Response Structure:**
```json
{
  "success": true,
  "base_currency": "USD",
  "rates": {
    "ILS": 3.65,
    "EUR": 0.85,
    "GBP": 0.73,
    "JPY": 110.50
  },
  "last_updated": "2025-11-01T12:00:00Z",
  "source": "yahoo_finance|ecb|manual|other",
  "cache_ttl_seconds": 300
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to fetch currency rates",
  "message": "External API timeout",
  "fallback_used": true,
  "fallback_rates": {
    "ILS": 3.60,
    "EUR": 0.84
  }
}
```

### 2. `GET /api/currency-rates/historical`
מחזיר שערי המרה היסטוריים לתאריך מסוים.

**Request:**
```http
GET /api/currency-rates/historical?date=2025-01-15 HTTP/1.1
Host: localhost:8080
```

**Query Parameters:**
- `date` (required): תאריך בפורמט `YYYY-MM-DD`
- `base_currency` (optional): מטבע בסיס (default: USD)

**Response Structure:**
```json
{
  "success": true,
  "date": "2025-01-15",
  "base_currency": "USD",
  "rates": {
    "ILS": 3.62,
    "EUR": 0.83,
    "GBP": 0.72
  },
  "source": "yahoo_finance",
  "historical": true
}
```

### 3. `GET /api/currency-rates/convert`
המרה מהירה של סכום בין שני מטבעות.

**Request:**
```http
GET /api/currency-rates/convert?from=ILS&to=USD&amount=1000 HTTP/1.1
Host: localhost:8080
```

**Query Parameters:**
- `from` (required): סמל מטבע מקור (ILS, USD, EUR, etc.)
- `to` (required): סמל מטבע יעד
- `amount` (required): סכום להמרה (מספר)
- `date` (optional): תאריך להמרה היסטורית (default: היום)

**Response Structure:**
```json
{
  "success": true,
  "from": {
    "currency": "ILS",
    "amount": 1000.00
  },
  "to": {
    "currency": "USD",
    "amount": 273.97
  },
  "rate": 3.65,
  "conversion_date": "2025-11-01T12:00:00Z",
  "source": "yahoo_finance"
}
```

---

## 💾 Cache Policy

### Backend Cache
- **TTL:** 300 שניות (5 דקות)
- **Layer:** Backend Cache (כפי שמגדירה `UnifiedCacheManager`)
- **Key Pattern:** `currency-rates:latest`, `currency-rates:historical:{date}`, `currency-rates:convert:{from}:{to}`
- **Invalidation:** אוטומטית כל 5 דקות או בעת עדכון ידני

### Cache Strategy במערכת תנועות חשבון
```javascript
// Policy בקובץ unified-cache-manager.js
'currency-rates-data': {
  layer: 'backend',
  ttl: 300000, // 5 דקות
  dependencies: [],
  invalidateOn: []
}
```

---

## 🔄 Error Handling

### Fallback Strategy
במקרה של כשל ב-API חיצוני או timeout:

1. **שגיאת חיבור:** שימוש בשער אחרון ידוע מהטבלת `currencies` (field `usd_rate`)
2. **שגיאת נתונים:** שימוש בערך ברירת מחדל מהבסיס נתונים
3. **שגיאת עיבוד:** החזרת שגיאה מפורטת עם קוד שגיאה

### Error Codes
```python
CURRENCY_RATES_ERROR_CODES = {
    'API_TIMEOUT': 'External API timeout',
    'API_UNAVAILABLE': 'External API unavailable',
    'INVALID_CURRENCY': 'Invalid currency symbol',
    'HISTORICAL_NOT_FOUND': 'Historical rate not found for date',
    'CONVERSION_FAILED': 'Currency conversion failed'
}
```

---

## 🏗️ Integration Points

### 1. Backend Service
**קובץ חדש:** `Backend/services/external_data/currency_rates_adapter.py`

```python
class CurrencyRatesAdapter:
    """
    Adapter for currency exchange rates integration
    Similar structure to YahooFinanceAdapter
    """
    
    def __init__(self, db_session: Session, provider_id: int = 1):
        self.db_session = db_session
        self.provider_id = provider_id
        # Similar initialization as YahooFinanceAdapter
        
    def get_latest_rates(self) -> Dict[str, float]:
        """Get latest exchange rates for all currencies"""
        pass
        
    def get_historical_rate(self, date: date, from_currency: str, to_currency: str) -> float:
        """Get historical exchange rate for specific date"""
        pass
        
    def convert(self, amount: float, from_currency: str, to_currency: str, date: Optional[date] = None) -> float:
        """Convert amount between currencies"""
        pass
```

### 2. API Routes
**קובץ חדש:** `Backend/routes/api/currency_rates.py`

```python
currency_rates_bp = Blueprint('currency_rates', __name__, url_prefix='/api/currency-rates')

@currency_rates_bp.route('/latest', methods=['GET'])
def get_latest_rates():
    """Get latest currency exchange rates"""
    pass

@currency_rates_bp.route('/historical', methods=['GET'])
def get_historical_rates():
    """Get historical currency exchange rates"""
    pass

@currency_rates_bp.route('/convert', methods=['GET'])
def convert_currency():
    """Convert amount between currencies"""
    pass
```

### 3. Integration עם CurrencyService הקיים
**עדכון:** `Backend/services/currency_service.py`

שימוש ב-`CurrencyService` הקיים לשליפת מטבעות מהבסיס נתונים:
```python
from services.currency_service import CurrencyService

# Get all currencies
currencies = CurrencyService.get_all(db_session)

# Use existing currency validation
CurrencyService.validate_symbol(currency_symbol)
```

---

## 📊 Data Models

### Exchange Rate Data Structure
```python
@dataclass
class CurrencyRate:
    """Structured currency rate data"""
    from_currency: str  # USD, ILS, EUR, etc.
    to_currency: str    # USD (base currency)
    rate: float         # Exchange rate (to_currency / from_currency)
    asof_utc: datetime  # Timestamp when rate was obtained
    source: str         # 'yahoo_finance', 'ecb', 'manual', etc.
    historical: bool    # True if this is historical data
    date: Optional[date] = None  # For historical rates
```

### Database Integration
שימוש בטבלת `currencies` הקיימת:
- `currencies.usd_rate` - שער המרה ל-USD
- שדה זה ישמש כ-fallback בעת כשל API

---

## 🔗 Usage in Account Activity System

### קריאה מ-Account Activity Service
**קובץ:** `Backend/services/account_activity_service.py`

```python
from routes.api.currency_rates import convert_currency  # או דרך service

def convert_to_base_currency(amount: float, from_currency_id: int, to_currency_id: int) -> float:
    """
    Convert amount from one currency to another using exchange rates API
    """
    # 1. Get currency symbols from IDs
    from_currency = get_currency_symbol(from_currency_id)
    to_currency = get_currency_symbol(to_currency_id)
    
    # 2. Call conversion API
    response = requests.get(
        f'/api/currency-rates/convert',
        params={
            'from': from_currency,
            'to': to_currency,
            'amount': amount
        }
    )
    
    # 3. Return converted amount
    return response.json()['to']['amount']
```

---

## 🎯 Requirements Summary

### ✅ נדרש מהמפתח:

1. **יצירת Adapter חדש:**
   - `Backend/services/external_data/currency_rates_adapter.py`
   - מבנה דומה ל-`YahooFinanceAdapter`
   - תמיכה ב-rate limiting, caching, error handling

2. **יצירת API Routes:**
   - `Backend/routes/api/currency_rates.py`
   - 3 endpoints: `/latest`, `/historical`, `/convert`
   - אינטגרציה עם `UnifiedCacheManager`

3. **אינטגרציה עם מערכת קיימת:**
   - שימוש ב-`CurrencyService` לשליפת מטבעות
   - אינטגרציה עם טבלת `currencies` כ-fallback
   - רישום Blueprint ב-`Backend/routes/api/__init__.py`

4. **Error Handling:**
   - Fallback לשערים מהטבלת `currencies` במקרה כשל
   - שגיאות ברורות ומפורטות
   - לוגים לניפוי באגים

5. **Testing:**
   - בדיקת כל 3 ה-endpoints
   - בדיקת fallback בעת כשל API
   - בדיקת cache invalidation

---

## 📝 Notes for Developer

### חשוב לזכור:
1. **מטבע בסיס תמיד USD** - כל ההמרות דרך USD
2. **Rate Formula:** `to_amount = from_amount * (to_rate / from_rate)`
3. **Cache חשוב** - שערי מטבע משתנים לעיתים קרובות, אבל לא כל שנייה
4. **Fallback תמיד זמין** - תמיד יש ערך מ-`currencies.usd_rate`

### דוגמת שימוש במערכת תנועות חשבון:
```python
# במערכת Account Activity
account_base_currency = "USD"

# יתרה ב-ILS
ils_balance = 5000.00

# המרה ל-USD
usd_balance = convert_currency(
    amount=ils_balance,
    from_currency="ILS",
    to_currency="USD"
)

# התוצאה תהיה: 5000 / 3.65 = ~1369.86 USD
```

---

## 🔄 Future Enhancements

### שלב 2 (לא דחוף):
- תמיכה בשערים היסטוריים מרובים
- גרפים של תנודות שער מטבע
- התראות על שינויי שער משמעותיים
- אינטגרציה עם מספר ספקי נתונים (Yahoo Finance, ECB, etc.)

---

**מפתח אחראי:** TikTrack Development Team  
**קישור למערכת תנועות חשבון:** `documentation/04-FEATURES/ACCOUNTS/ACCOUNT_ACTIVITY_SYSTEM.md` (לאחר יצירה)


