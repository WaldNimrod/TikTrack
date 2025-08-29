# External Data Integration System - Documentation

## 📋 **מבט כללי**

מערכת האינטגרציה לנתונים חיצוניים מאפשרת לקבל מידע עדכני על מחירי מניות, מטבעות וסחורות ממקורות חיצוניים שונים. המערכת בנויה בצורה מודולרית ומאפשרת הוספת providers נוספים בקלות.

---

## 🏗️ **ארכיטקטורה**

### **מבנה המערכת**
```
External Data Integration
├── Server Components (Backend)
│   ├── Models (מודלים)
│   ├── Services (שירותים)
│   ├── Providers (ספקי מידע)
│   └── API Routes (נקודות קצה)
└── Client Components (Frontend)
    ├── Pages (דפים)
    ├── Scripts (סקריפטים)
    └── Styles (עיצובים)
```

### **זרימת נתונים**
1. **Scheduler** → מפעיל רענון אוטומטי
2. **Provider** → אוסף נתונים ממקור חיצוני
3. **Normalizer** → מנרמל נתונים לפורמט אחיד
4. **Service** → שומר ומעבד נתונים
5. **API** → מספק נתונים לממשק המשתמש
6. **UI** → מציג נתונים למשתמש

---

## 🗄️ **מודלים (Models)**

### **Quote Model**
```python
class Quote(Base):
    __tablename__ = 'quotes_last'
    
    # Fields
    id = Column(Integer, primary_key=True)
    ticker_id = Column(Integer, ForeignKey('tickers.id'))
    price = Column(Numeric(10, 4))
    change_amount = Column(Numeric(10, 4))
    change_percent = Column(Numeric(5, 2))
    volume = Column(Integer)
    high_24h = Column(Numeric(10, 4))
    low_24h = Column(Numeric(10, 4))
    open_price = Column(Numeric(10, 4))
    previous_close = Column(Numeric(10, 4))
    provider = Column(String(50))
    asof_utc = Column(DateTime)
    fetched_at = Column(DateTime)
```

### **MarketPreferences Model**
```python
class MarketPreferences(Base):
    __tablename__ = 'user_preferences'
    
    # Fields
    user_id = Column(Integer, primary_key=True)
    timezone = Column(String(64))
    refresh_overrides_json = Column(Text)
    updated_at = Column(DateTime)
```

### **Ticker Model**
```python
class Ticker(Base):
    __tablename__ = 'tickers'
    
    # Fields
    id = Column(Integer, primary_key=True)
    symbol = Column(String(10), unique=True)
    name = Column(String(100))
    status = Column(String(20))
    active_trades = Column(Integer)
```

---

## 🔧 **שירותים (Services)**

### **MarketDataService**
השירות המרכזי לניהול נתוני שוק:

#### **פונקציות עיקריות:**
- `get_ticker_price(ticker_id)` - קבלת מחיר לטיקר ספציפי
- `update_ticker_price(ticker_id, quote_data)` - עדכון מחיר
- `refresh_all_prices()` - רענון כל המחירים
- `get_user_preferences(user_id)` - קבלת העדפות משתמש
- `update_user_preferences(user_id, preferences)` - עדכון העדפות

#### **שימוש:**
```python
service = MarketDataService(db_session)
price = service.get_ticker_price(1)
service.refresh_all_prices()
```

---

## 🔌 **ספקי מידע (Providers)**

### **Yahoo Finance Provider**
ספק המידע הראשי למערכת:

#### **תכונות:**
- תמיכה במניות, מטבעות וסחורות
- נתונים בזמן אמת
- היסטוריה של מחירים
- מידע על volume ו-high/low

#### **שימוש:**
```python
adapter = YahooFinanceAdapter()
quote = adapter.fetch_quote_data('AAPL')
batch_quotes = adapter.fetch_batch_quotes(['AAPL', 'GOOGL', 'MSFT'])
```

#### **פורמט נתונים:**
```json
{
    "symbol": "AAPL",
    "price": 150.25,
    "change_amount": 2.50,
    "change_percent": 1.69,
    "volume": 50000000,
    "high_24h": 152.00,
    "low_24h": 148.75,
    "open_price": 149.50,
    "previous_close": 147.75,
    "asof_utc": "2024-01-15T15:30:00Z",
    "provider": "yahoo_finance"
}
```

### **Providers עתידיים:**
- **Interactive Brokers (IBKR)** - לחשבונות מסחר
- **Alpha Vantage** - נתונים מתקדמים
- **Polygon.io** - נתונים בזמן אמת
- **IEX Cloud** - נתונים פיננסיים

---

## 🌐 **API Endpoints**

### **Market Data API**
```
GET /api/v1/market-data/status
GET /api/v1/market-data/refresh
GET /api/v1/market-data/providers
GET /api/v1/market-data/logs
```

### **Quotes API**
```
GET /api/v1/quotes/{ticker_id}
GET /api/v1/quotes/batch
GET /api/v1/quotes/{ticker_id}/history
POST /api/v1/quotes/{ticker_id}/refresh
```

### **דוגמאות תגובה:**
```json
{
    "success": true,
    "data": {
        "ticker_id": 1,
        "symbol": "AAPL",
        "price": 150.25,
        "change_percent": 1.69,
        "volume": 50000000,
        "last_updated": "2024-01-15T15:30:00Z"
    }
}
```

---

## ⚙️ **הגדרות והעדפות**

### **Refresh Policy**
מדיניות רענון הנתונים:

#### **קטגוריות רענון:**
- **High Priority** - כל דקה (טיקרים עם מסחר פעיל)
- **Medium Priority** - כל 5 דקות (טיקרים נפוצים)
- **Low Priority** - כל 15 דקות (טיקרים נדירים)
- **Manual** - רק לפי בקשה

#### **הגדרות משתמש:**
```json
{
    "timezone": "Asia/Jerusalem",
    "refresh_overrides": {
        "AAPL": "high",
        "GOOGL": "medium",
        "TSLA": "manual"
    }
}
```

### **Timezone Support**
- **Scheduler**: פועל בשעון ניו יורק (NY)
- **UI**: מציג בשעון מקומי לפי העדפות משתמש
- **תמיכה**: UTC, Asia/Jerusalem, America/New_York, Europe/London

---

## 🔄 **מערכת רענון אוטומטי**

### **Scheduler**
מערכת הרענון האוטומטי:

#### **לוגיקה:**
1. בדיקת שעות מסחר (NY time)
2. זיהוי טיקרים לפי עדיפות
3. רענון נתונים מ-providers
4. שמירה לבסיס הנתונים
5. עדכון UI בזמן אמת

#### **תזמון:**
- **שעות מסחר**: 9:30-16:00 NY time
- **רענון**: לפי מדיניות המשתמש
- **שבתות/חגים**: אין רענון

---

## 📊 **ממשק משתמש**

### **דף Quotes**
דף הצגת מחירים:

#### **תכונות:**
- טבלת מחירים עם פילטרים
- תצוגת שינויים (צבעים)
- תצוגת volume ו-high/low
- רענון ידני
- הגדרות העדפות

#### **פילטרים:**
- חיפוש לפי סמל
- סינון לפי סטטוס
- סינון לפי שינוי מחיר
- סינון לפי volume

---

## 🧪 **בדיקות ותיקוף**

### **בדיקות יחידה**
- בדיקות מודלים
- בדיקות שירותים
- בדיקות providers
- בדיקות API

### **בדיקות אינטגרציה**
- בדיקת זרימת נתונים
- בדיקת רענון אוטומטי
- בדיקת UI
- בדיקת ביצועים

### **בדיקות error handling**
- בדיקת חיבור ל-provider
- בדיקת נתונים לא תקינים
- בדיקת timeout
- בדיקת rate limiting

---

## 📈 **ביצועים ואופטימיזציה**

### **Cache System**
- **TTL קצר**: 30 שניות למחירים
- **TTL בינוני**: 5 דקות לנתונים סטטיים
- **TTL ארוך**: שעה להיסטוריה

### **Rate Limiting**
- **Yahoo Finance**: 100 requests/minute
- **Batch processing**: עד 50 טיקרים בבת אחת
- **Error backoff**: exponential retry

### **Database Optimization**
- **Indexes**: על ticker_id, asof_utc, provider
- **Partitioning**: לפי תאריך (עתידי)
- **Cleanup**: מחיקת נתונים ישנים

---

## 🔐 **אבטחה**

### **Stage-1 (בסיסי)**
- Validation של נתונים
- Error handling
- Logging בסיסי

### **Stage-2 (מתקדם)**
- הצפנת נתונים רגישים
- API key management
- Rate limiting מתקדם
- Audit logging

---

## 📝 **לוגים וניטור**

### **Log Levels**
- **DEBUG**: פרטים טכניים
- **INFO**: פעולות רגילות
- **WARNING**: בעיות לא קריטיות
- **ERROR**: שגיאות קריטיות

### **Metrics**
- מספר בקשות ל-provider
- זמן תגובה
- אחוז הצלחה
- שימוש במשאבים

---

## 🚀 **פיתוח עתידי**

### **Stage-2 Features**
- מערכת התראות חכמה
- Charts וגרפים
- Technical indicators
- Real-time streaming
- Mobile app

### **Providers נוספים**
- Interactive Brokers
- Alpha Vantage
- Polygon.io
- IEX Cloud

### **Advanced Features**
- Machine learning predictions
- Portfolio tracking
- Risk management
- Automated trading signals

---

## 📚 **משאבים נוספים**

- [Development Tasks](./DEVELOPMENT_TASKS.md)
- [API Documentation](../api/README.md)
- [Database Schema](../database/README.md)
- [Frontend Components](../frontend/README.md)

---

## 🤝 **תמיכה ופיתוח**

לשאלות ובעיות:
1. בדוק את הלוגים
2. בדוק את התיעוד
3. פנה לצוות הפיתוח
4. פתח issue ב-GitHub

