# External Data Integration - Server Side

תיקייה זו מכילה את כל הקבצים של צד השרת למערכת External Data Integration של TikTrack.

## 📁 מבנה התיקייה

```
external_data_integration_server/
├── models/                    # מודלים חדשים
│   ├── quote.py              # מודל מחירים
│   ├── market_preferences.py # מודל העדפות משתמש
│   └── __init__.py
├── services/                 # שירותים קבועים
│   ├── market_data_service.py   # שירות מרכזי
│   └── data_refresh_scheduler.py # Data Refresh Scheduler עם שעון NY
├── providers/                # קונקטורים לספקים
│   ├── yahoo_finance/        # Yahoo Finance (פעיל)
│   │   ├── yahoo_finance_adapter.py
│   │   ├── __init__.py
│   │   └── README.md
│   ├── ibkr/                 # Interactive Brokers (עתידי)
│   │   └── README.md
│   ├── alpha_vantage/        # Alpha Vantage (עתידי)
│   │   └── README.md
│   └── __init__.py
├── api_routes/               # API Routes
│   ├── market_data_api.py    # Market Data API
│   └── quotes_api.py         # Quotes API
├── config/                   # הגדרות
├── database_migrations/      # מיגרציות
├── testing/                  # בדיקות
└── documentation/            # דוקומנטציה
```

## 🚀 מצב הפיתוח

### ✅ **הושלם (Stage-1)**
- [x] מודלים חדשים (Base, Ticker, Quote, MarketPreferences)
- [x] Yahoo Finance Provider (בתיקייה נפרדת)
- [x] Market Data Service (שירות מרכזי קבוע)
- [x] API Routes (Market Data, Quotes)
- [x] הפרדה ברורה בין providers לשירותים קבועים
- [x] תיקון כל הטעויות שזוהו
- [x] הוספת validation מתקדם
- [x] קובץ requirements.txt

### 🔄 **בפיתוח (Stage-1)**
- [ ] אינטגרציה עם המערכת הקיימת
- [ ] בדיקות יחידה
- [ ] מיגרציות בסיס הנתונים

### 📋 **עתידי (Stage-2)**
- [ ] IBKR Provider
- [ ] Alpha Vantage Provider
- [ ] Advanced error handling
- [ ] Security features
- [ ] Advanced monitoring
- [ ] Multi-level caching

## 🔧 שימוש

### התקנת Dependencies
```bash
pip install -r external_data_integration_server/requirements.txt
```

### אינטגרציה עם המערכת הקיימת
```python
# הוספה ל-Backend/app.py
from external_data_integration_server.api_routes.market_data_api import market_data_bp
from external_data_integration_server.api_routes.quotes_api import quotes_bp

app.register_blueprint(market_data_bp)
app.register_blueprint(quotes_bp)

# שימוש בשירות המרכזי
from external_data_integration_server.services.market_data_service import MarketDataService
market_data_service = MarketDataService(db_session)
```

### הרצת בדיקות
```bash
# בדיקות יחידה (עתידי)
python -m pytest external_data_integration_server/testing/

# בדיקות אינטגרציה (עתידי)
python external_data_integration_server/testing/integration_tests.py
```

## 📊 API Endpoints

### Market Data API
- `GET /api/v1/market-data/status` - סטטוס מערכת
- `POST /api/v1/market-data/refresh` - רענון ידני
- `GET /api/v1/market-data/providers` - רשימת ספקים
- `GET /api/v1/market-data/logs` - לוגים

### Quotes API
- `GET /api/v1/quotes/{ticker_id}` - מחיר לטיקר
- `GET /api/v1/quotes/batch` - מחירים למספר טיקרים
- `GET /api/v1/quotes/{ticker_id}/history` - היסטוריית מחירים
- `POST /api/v1/quotes/{ticker_id}/refresh` - רענון מחיר

## ⚠️ הערות חשובות

1. **לא לגעת במערכת הקיימת** - כל הקבצים נמצאים בתיקייה נפרדת
2. **הפרדה ברורה** - providers נפרדים משירותים קבועים
3. **בדיקות לפני אינטגרציה** - יש להריץ בדיקות מקיפות לפני שילוב
4. **גיבוי בסיס הנתונים** - חובה לפני כל שינוי בבסיס הנתונים
5. **מיגרציות מסודרות** - יש להשתמש במערכת המיגרציות הקיימת

## 📝 תיעוד נוסף

- [מסמך האפיון המלא](../EXTERNAL_DATA_INTEGRATION_SPECIFICATION_v1.3.1.md)
- [מדריך פיתוח](documentation/DEVELOPMENT_GUIDE.md) (עתידי)
- [מדריך בדיקות](documentation/TESTING_GUIDE.md) (עתידי)

---

**גרסה:** 1.3.1  
**תאריך:** 2025-08-28  
**סטטוס:** Stage-1 Development  
**צד:** Server Side
