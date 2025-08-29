# TikTrack - External Data Integration Specification v1.2

## 📋 תוכן עניינים
1. [מבנה כללי](#מבנה-כללי)
2. [טבלאות בסיס הנתונים](#טבלאות-בסיס-הנתונים)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [API Endpoints](#api-endpoints)
6. [תהליכי פיתוח](#תהליכי-פיתוח)
7. [שלבי ביצוע](#שלבי-ביצוע)
8. [Roadmap](#roadmap)
9. [טבלת השוואה - שלב א' vs שלב ב'](#טבלת-השוואה)

---

## 🏗️ מבנה כללי

### ארכיטקטורת המערכת
```
External Providers → Provider Adapters → Normalizer → Ingest API → Database
                                                           ↓
                                                        Cache + Configuration
```

### עקרונות פיתוח
- **שמות מדויקים וייחודיים** לכל פונקציה וקובץ
- **הפרדה מוחלטת** של JavaScript מעמודי HTML
- **CSS חיצוני בלבד** - אין inline styles
- **שימוש בסגנונות קיימים** - לא יצירת סגנונות חדשים
- **גיבוי מלא** לפני כל שינוי בבסיס הנתונים
- **מיגרציה מסודרת** לאחר שינויים בבסיס הנתונים

---

## 🗄️ טבלאות בסיס הנתונים

### 1. quotes_last - מחירים אחרונים (מורחב)
**תפקיד**: אחסון המחיר האחרון לכל טיקר
**מיקום**: `Backend/db/simpleTrade_new.db`

```sql
CREATE TABLE quotes_last (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker_id INTEGER NOT NULL,
    price DECIMAL(10,4) NOT NULL,
    change_amount DECIMAL(10,4),
    change_percent DECIMAL(5,2),
    volume BIGINT,
    high_24h DECIMAL(10,4),
    low_24h DECIMAL(10,4),
    open_price DECIMAL(10,4),
    previous_close DECIMAL(10,4),
    provider VARCHAR(50) NOT NULL,
    asof_utc TIMESTAMP,                    -- זמן UTC של הנתון
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticker_id) REFERENCES tickers(id)
);
```

### 2. market_data_preferences - הגדרות רענון וזמן
**תפקיד**: הגדרות משתמש לרענון נתונים ואזור זמן
**מיקום**: `Backend/db/simpleTrade_new.db`

```sql
CREATE TABLE market_data_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    refresh_mode VARCHAR(20) DEFAULT 'auto',           -- auto, manual, custom
    refresh_interval_minutes INTEGER DEFAULT 5,        -- מרווח רענון בדקות
    user_timezone VARCHAR(50) DEFAULT 'Asia/Jerusalem', -- אזור זמן משתמש
    enabled_tickers TEXT,                              -- JSON array של ticker IDs
    enabled_providers TEXT,                            -- JSON array של providers
    display_local_time BOOLEAN DEFAULT TRUE,           -- הצגת זמן מקומי
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. intraday_slots - נתונים תוך-יומיים
**תפקיד**: אחסון נתונים היסטוריים תוך-יומיים
**מיקום**: `Backend/db/simpleTrade_new.db`

```sql
CREATE TABLE intraday_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker_id INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    price DECIMAL(10,4) NOT NULL,
    volume BIGINT,
    provider VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticker_id) REFERENCES tickers(id)
);
```

### 4. provider_configs - הגדרות ספקים
**תפקיד**: ניהול הגדרות לכל ספק נתונים
**מיקום**: `Backend/db/simpleTrade_new.db`

```sql
CREATE TABLE provider_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_name VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    rate_limit_per_hour INTEGER DEFAULT 2000,
    timeout_seconds INTEGER DEFAULT 30,
    retry_attempts INTEGER DEFAULT 3,
    cache_ttl_seconds INTEGER DEFAULT 300,
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    base_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. market_data_logs - לוגים ומעקב
**תפקיד**: מעקב אחר פעולות וטיפול בשגיאות
**מיקום**: `Backend/db/simpleTrade_new.db`

```sql
CREATE TABLE market_data_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_name VARCHAR(50) NOT NULL,
    ticker_id INTEGER,
    operation_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    response_time_ms INTEGER,
    error_message TEXT,
    request_data TEXT,
    response_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticker_id) REFERENCES tickers(id)
);
```

### 6. v_ticker_active_trade - View לטיקרים עם מסחר פעיל
**תפקיד**: View משולב לטיקרים עם מסחר פעיל
**מיקום**: `Backend/db/simpleTrade_new.db`

```sql
CREATE VIEW v_ticker_active_trade AS
SELECT 
    t.id as ticker_id,
    t.symbol,
    t.name,
    t.status,
    q.price as current_price,
    q.change_percent,
    q.asof_utc,
    q.fetched_at,
    q.provider,
    CASE 
        WHEN t.status = 'active' THEN 1 
        ELSE 0 
    END as is_active_trade
FROM tickers t
LEFT JOIN quotes_last q ON t.id = q.ticker_id
WHERE t.status IN ('active', 'watch');
```

---

## 🔧 Backend Architecture

### מבנה תיקיות
```
Backend/
├── models/
│   ├── quote.py                    # מודל מחירים
│   ├── market_data.py             # מודל נתוני שוק
│   ├── provider_config.py         # הגדרות ספקים
│   └── market_preferences.py      # הגדרות משתמש
├── services/
│   ├── market_data/
│   │   ├── yahoo_finance_adapter.py
│   │   ├── market_data_normalizer.py
│   │   ├── quote_cache_service.py
│   │   ├── rate_limiter_service.py
│   │   ├── error_handler_service.py
│   │   ├── refresh_policy_service.py
│   │   └── timezone_service.py
│   └── market_data_service.py     # שירות מרכזי
├── routes/api/
│   ├── market_data.py             # API נתוני שוק
│   ├── quotes.py                  # API מחירים
│   ├── providers.py               # API ספקים
│   └── preferences.py             # API העדפות
└── config/
    └── market_data_config.py      # הגדרות נתוני שוק
```

### מודלים חדשים

#### 1. MarketPreferences Model
**מיקום**: `Backend/models/market_preferences.py`
**תפקיד**: ניהול העדפות משתמש לנתוני שוק

**פונקציות עיקריות**:
- `get_user_preferences(user_id)`: קבלת העדפות משתמש
- `update_refresh_settings(user_id, mode, interval)`: עדכון הגדרות רענון
- `update_timezone_settings(user_id, timezone)`: עדכון הגדרות זמן
- `get_default_preferences()`: העדפות ברירת מחדל

#### 2. RefreshPolicyService
**מיקום**: `Backend/services/market_data/refresh_policy_service.py`
**תפקיד**: ניהול מדיניות רענון גמישה

**פונקציות עיקריות**:
- `should_refresh_ticker(ticker_id, user_preferences)`: בדיקה אם צריך לרענן
- `get_refresh_interval(user_preferences)`: קבלת מרווח רענון
- `is_manual_mode(user_preferences)`: בדיקה אם מצב ידני
- `get_next_refresh_time(ticker_id, interval)`: זמן רענון הבא

#### 3. TimezoneService
**מיקום**: `Backend/services/market_data/timezone_service.py`
**תפקיד**: המרת זמנים לשעון מקומי

**פונקציות עיקריות**:
- `convert_utc_to_local(utc_timestamp, user_timezone)`: המרת UTC למקומי
- `format_local_time(utc_timestamp, user_timezone)`: פורמט זמן מקומי
- `get_supported_timezones()`: רשימת אזורי זמן נתמכים
- `validate_timezone(timezone)`: וולידציה של אזור זמן

---

## 🎨 Frontend Architecture

### מבנה תיקיות
```
trading-ui/
├── scripts/
│   ├── market-data/
│   │   ├── yahoo-finance-adapter.js
│   │   ├── market-data-normalizer.js
│   │   ├── quote-cache-service.js
│   │   ├── rate-limiter-service.js
│   │   ├── error-handler-service.js
│   │   ├── refresh-policy-service.js
│   │   └── timezone-service.js
│   ├── market-data-service.js     # שירות מרכזי
│   ├── market-data-ui.js          # פונקציות UI
│   └── preferences-ui.js          # ממשק העדפות
├── styles/
│   ├── market-data.css            # סגנונות נתוני שוק
│   ├── ticker-quotes.css          # סגנונות מחירים
│   └── preferences.css            # סגנונות העדפות
└── pages/
    ├── tickers.html               # דף טיקרים מורחב
    ├── preferences.html           # דף העדפות מורחב
    └── market-dashboard.html      # דף dashboard חדש
```

### שירותים חדשים

#### 1. RefreshPolicyService
**מיקום**: `trading-ui/scripts/market-data/refresh-policy-service.js`
**תפקיד**: ניהול מדיניות רענון בצד הלקוח

**פונקציות עיקריות**:
- `shouldRefreshTicker(tickerId, userPreferences)`: בדיקה אם צריך לרענן
- `getRefreshInterval(userPreferences)`: קבלת מרווח רענון
- `isManualMode(userPreferences)`: בדיקה אם מצב ידני
- `getNextRefreshTime(tickerId, interval)`: זמן רענון הבא

#### 2. TimezoneService
**מיקום**: `trading-ui/scripts/market-data/timezone-service.js`
**תפקיד**: המרת זמנים לשעון מקומי

**פונקציות עיקריות**:
- `convertUtcToLocal(utcTimestamp, userTimezone)`: המרת UTC למקומי
- `formatLocalTime(utcTimestamp, userTimezone)`: פורמט זמן מקומי
- `getSupportedTimezones()`: רשימת אזורי זמן נתמכים
- `validateTimezone(timezone)`: וולידציה של אזור זמן

#### 3. PreferencesUI
**מיקום**: `trading-ui/scripts/preferences-ui.js`
**תפקיד**: ממשק העדפות נתוני שוק

**פונקציות עיקריות**:
- `initMarketDataPreferences()`: אתחול הגדרות נתוני שוק
- `updateRefreshMode(mode)`: עדכון מצב רענון
- `updateRefreshInterval(interval)`: עדכון מרווח רענון
- `updateTimezone(timezone)`: עדכון אזור זמן
- `savePreferences()`: שמירת העדפות
- `loadPreferences()`: טעינת העדפות

---

## 🔌 API Endpoints

### Preferences API
**Base URL**: `/api/v1/preferences`

#### GET /market-data
**תפקיד**: קבלת העדפות נתוני שוק של משתמש
**Response**:
```json
{
  "status": "success",
  "data": {
    "refresh_mode": "auto",
    "refresh_interval_minutes": 5,
    "user_timezone": "Asia/Jerusalem",
    "enabled_tickers": [1, 2, 3],
    "enabled_providers": ["yahoo_finance"],
    "display_local_time": true
  }
}
```

#### PUT /market-data
**תפקיד**: עדכון העדפות נתוני שוק
**Request**:
```json
{
  "refresh_mode": "custom",
  "refresh_interval_minutes": 10,
  "user_timezone": "America/New_York",
  "enabled_tickers": [1, 2, 3, 4],
  "enabled_providers": ["yahoo_finance"],
  "display_local_time": true
}
```

### Quotes API - מורחב
**Base URL**: `/api/v1/quotes`

#### GET /{ticker_id}
**תפקיד**: מחיר לטיקר עם זמן מקומי
**Response**:
```json
{
  "status": "success",
  "data": {
    "ticker_id": 1,
    "symbol": "AAPL",
    "price": 150.25,
    "change_amount": 2.50,
    "change_percent": 1.69,
    "volume": 1500000,
    "high_24h": 152.00,
    "low_24h": 148.50,
    "provider": "yahoo_finance",
    "asof_utc": "2025-01-15T15:45:00Z",
    "asof_local": "2025-01-15T17:45:00 IST",
    "fetched_at": "2025-01-15T15:45:05Z",
    "fetched_at_local": "2025-01-15T17:45:05 IST",
    "refresh_interval": 5,
    "next_refresh": "2025-01-15T17:50:00 IST"
  }
}
```

---

## 🔄 תהליכי פיתוח

### 1. תהליך שינוי בסיס הנתונים
1. **גיבוי מלא** של בסיס הנתונים הנוכחי
2. **תיעוד הגיבוי** עם timestamp ושם קובץ
3. **בדיקת תקינות הגיבוי**
4. **יצירת קובץ מיגרציה** עם timestamp ושם תיאורי
5. **תיעוד השינויים** בקובץ המיגרציה
6. **בדיקת המיגרציה** בסביבת פיתוח
7. **ביצוע המיגרציה** בסביבת ייצור
8. **עדכון שכבות המערכת** (Models, Services, API, Frontend)

### 2. תהליך הוספת פונקציה חדשה
1. **הגדרת הפונקציה** עם שם מדויק וייחודי
2. **תיעוד הפונקציה** - תפקיד, פרמטרים, ערך החזרה
3. **מיקום הפונקציה** בקובץ המתאים לפי הקשר
4. **בדיקת הפונקציה** בסביבת פיתוח
5. **אינטגרציה** עם המערכת הקיימת
6. **בדיקות** ווולידציה

### 3. תהליך הוספת סגנון חדש
1. **בדיקה** אם קיים סגנון דומה
2. **שימוש בסגנונות קיימים** אם אפשר
3. **יצירת class חדש** רק אם הכרחי
4. **הוספה לקובץ CSS המתאים**
5. **תיעוד הסגנון** והשימוש בו
6. **בדיקה** בכל הדפדפנים הרלוונטיים

---

## 📋 שלבי ביצוע

### שלב א' - תשתית בסיסית עם גמישות מלאה (שבוע 1-4)

#### שבוע 1: תשתית בסיסית
**משימות**:
- [ ] גיבוי מלא של בסיס הנתונים הנוכחי
- [ ] יצירת מיגרציה לטבלאות החדשות
- [ ] ביצוע מיגרציה בסביבת פיתוח
- [ ] יצירת מודלים חדשים (Quote, MarketData, ProviderConfig, MarketPreferences)
- [ ] Market Data Service בסיסי
- [ ] API endpoints בסיסיים

**קבצים ליצירה**:
- `Backend/models/quote.py`
- `Backend/models/market_data.py`
- `Backend/models/provider_config.py`
- `Backend/models/market_preferences.py`
- `Backend/services/market_data_service.py`
- `Backend/routes/api/market_data.py`
- `Backend/routes/api/quotes.py`
- `Backend/routes/api/providers.py`
- `Backend/routes/api/preferences.py`

#### שבוע 2: Refresh Policy + Timezone
**משימות**:
- [ ] RefreshPolicyService
- [ ] TimezoneService
- [ ] Preferences UI
- [ ] אינטגרציה עם מערכת העדפות קיימת

**קבצים ליצירה**:
- `Backend/services/market_data/refresh_policy_service.py`
- `Backend/services/market_data/timezone_service.py`
- `trading-ui/scripts/market-data/refresh-policy-service.js`
- `trading-ui/scripts/market-data/timezone-service.js`
- `trading-ui/scripts/preferences-ui.js`

#### שבוע 3: Yahoo Finance Integration
**משימות**:
- [ ] Yahoo Finance Adapter
- [ ] Normalizer Service
- [ ] Cache System
- [ ] Rate Limiting
- [ ] Error Handling

**קבצים ליצירה**:
- `Backend/services/market_data/yahoo_finance_adapter.py`
- `Backend/services/market_data/market_data_normalizer.py`
- `Backend/services/market_data/quote_cache_service.py`
- `Backend/services/market_data/rate_limiter_service.py`
- `Backend/services/market_data/error_handler_service.py`

#### שבוע 4: UI Integration
**משימות**:
- [ ] הרחבת דף הטיקרים
- [ ] הרחבת דף העדפות
- [ ] Dashboard חדש
- [ ] בדיקות ווולידציה

**קבצים לעדכון**:
- `trading-ui/tickers.html`
- `trading-ui/preferences.html`
- `trading-ui/scripts/tickers.js`
- `trading-ui/styles/ticker-quotes.css`
- `trading-ui/styles/preferences.css`

---

## 📊 טבלת השוואה - שלב א' vs שלב ב'

| רכיב | שלב א' (גרסה 1.2) | שלב ב' (גרסה 2.2) |
|------|-------------------|-------------------|
| **ספקים** | Yahoo Finance בלבד | Yahoo + IBKR + fallback |
| **Database** | +2 שדות (asof_utc, fetched_at) + preferences | +intraday_slots +advanced indexes |
| **Cache** | Basic TTL (60s) | Redis + adaptive TTL |
| **Refresh Policy** | **גמיש + ממשק העדפות** | מדיניות מורכבת לפי status |
| **Timezone** | **המרה לשעון מקומי** | Multiple exchanges + calendars |
| **API** | 4 endpoints בסיסיים | 8+ endpoints מתקדמים |
| **Error Handling** | Basic fallback | Circuit breakers + retry logic |
| **Monitoring** | Basic logs | Advanced metrics + dashboards |
| **Batching** | קבוצות של 10-20 | קבוצות של 25-50 + staggering |
| **Configuration** | שילוב במערכת העדפות | מערכת ניהול מתקדמת |

---

## 🚀 Roadmap

### גרסה 2.1 - חיבור נתונים חיצוניים (Q1 2026)
**תכונות**:
- ✅ תשתית בסיסית
- ✅ Yahoo Finance Integration
- ✅ UI Integration בסיסית
- ✅ Configuration Management
- ✅ Rate Limiting ו-Error Handling
- ✅ Cache System
- ✅ **Refresh Policy גמיש**
- ✅ **Timezone Support מלא**

### גרסה 2.2 - פיצ'רים מתקדמים (Q2 2026)
**תכונות**:
- מערכת התראות חכמה
- ביצועים ו-Scaling
- מערכת Monitoring מתקדמת
- UI מתקדם יותר
- IBKR Integration
- Advanced Refresh Policies

### גרסה 2.3 - הרחבות (Q3 2026)
**תכונות**:
- ספקים נוספים
- Analytics מתקדמים
- Mobile App
- Advanced Trading Calendar

---

## ⚠️ סיכונים ומיתוגים

### סיכונים נמוכים
- Yahoo Finance - יציב ומוכר
- ארכיטקטורה - מודולרית ומוכחת
- שילוב עם המערכת - חלק וטבעי

### סיכונים בינוניים
- Rate Limiting - צריך תכנון קפדני
- ביצועים - עם הרבה טיקרים
- תחזוקה - תלות בספקים חיצוניים

### סיכונים גבוהים
- שינויים ב-API של Yahoo Finance
- חסימה של IP או חשבון
- אובדן נתונים במקרה של כשל

---

## 🎯 יתרונות המערכת

### למשתמשים
- מחירים מדויקים בזמן אמת
- פחות עבודה ידנית בעדכון מחירים
- מידע מקיף על כל טיקר
- התראות חכמות על שינויים משמעותיים
- **גמישות מלאה בהגדרות רענון**
- **זמנים בשעון מקומי**

### למערכת
- ארכיטקטורה מודולרית - קל להוסיף ספקים חדשים
- ביצועים גבוהים עם cache system
- אמינות גבוהה עם error handling
- סקלביליות - תמיכה במספר רב של טיקרים
- **שילוב טבעי עם מערכת העדפות קיימת**

---

## 📝 סיכום

מסמך זה מפרט את כל ההיבטים של מודול חיבור נתונים חיצוניים בגרסה 1.2:
- **מבנה מפורט** של טבלאות בסיס הנתונים
- **ארכיטקטורה מלאה** של Backend ו-Frontend
- **פונקציות מפורטות** עם שמות מדויקים ומיקומים
- **API Endpoints** מלאים עם דוגמאות
- **תהליכי פיתוח** מסודרים
- **שלבי ביצוע** ברורים
- **Roadmap** מפורט
- **Refresh Policy גמיש** עם ממשק העדפות
- **Timezone Support מלא** עם המרה לשעון מקומי

המסמך מוכן לביצוע ומציג פתרון מעשי, מודולרי וסקלבילי תוך שמירה על עקרונות הפיתוח של המערכת!

---

**מסמך זה נוצר ב**: 15 בינואר 2026  
**גרסה**: 1.2  
**מחבר**: TikTrack Development Team  
**שינויים עיקריים**: הוספת Refresh Policy גמיש ו-Timezone Support מלא


