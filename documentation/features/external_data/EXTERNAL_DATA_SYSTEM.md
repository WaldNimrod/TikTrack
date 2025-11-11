# External Data Integration System - Documentation

## 📋 **Overview**

The external data integration system allows receiving current information about stock prices, currencies, and commodities from various external sources. The system is built in a modular way and allows easy addition of additional providers.

---

## 🏗️ **Layer Separation & Architecture Principles**

### **Critical Layer Separation**

**IMPORTANT**: Clear separation between system layers is critical for proper architecture and future scalability.

#### **Data Layer (Models)**
- **Purpose**: Data structure definition only
- **Account Model**: Represents trading account at broker (Interactive Brokers, eToro, etc.)
- **No Business Logic**: Only technical structure and relationships
- **No Validation**: No business rules or broker-specific validation

#### **Business Logic Layer (Services)**
- **AccountService**: Technical validation only (field existence, database constraints)
- **ValidationService**: Database constraint validation only
- **No Broker Validation**: No connection to external broker systems

#### **External Integration Layer (Future - Stage 2)**
- **BrokerValidationService**: Validate accounts against real broker data
- **AccountSyncService**: Sync with actual broker accounts
- **Real-time Validation**: Live broker connection for account verification

### **Account vs User Clarification**

#### **Account (Trading Account)**
- **Definition**: Trading account at a specific broker
- **Purpose**: Financial trading and portfolio management
- **Ownership**: Belongs to a User in the system
- **Validation**: Technical validation only in current stage

#### **User (System User)**
- **Definition**: Person using the TikTrack system
- **Purpose**: System access and account management
- **Current State**: Single default user (nimrod, ID: 1)
- **Future**: Multiple users with authentication

#### **Relationship**
```
User (nimrod) 
  ├── Account 1 (Interactive Brokers)
  ├── Account 2 (eToro) 
  └── Account 3 (Binance)
```

### **Current vs Future Validation**

#### **Stage 1 (Current) - Technical Validation Only**
- ✅ **Field Validation**: Ensure fields exist in Account model
- ✅ **Database Constraints**: NOT NULL, UNIQUE, FOREIGN KEY
- ✅ **Data Type Validation**: Correct data types and formats
- ❌ **No Broker Validation**: No external system connection
- ❌ **No Business Rules**: No trading-specific validation

#### **Stage 2 (Future) - Full Broker Integration**
- ✅ **Technical Validation**: All Stage 1 validations
- ✅ **Broker Validation**: Verify account exists at broker
- ✅ **Real-time Sync**: Live data from broker systems
- ✅ **Business Rules**: Trading-specific validation rules
- ✅ **Account Verification**: Confirm account ownership and status

---

## 🏗️ **Architecture**

### **System Structure**
```
External Data Integration
├── Server Components (Backend)
│   ├── Models (external_data.py) ✅
│   ├── Services (7 modular services) ✅
│   │   ├── yahoo_finance_adapter.py (864 lines)
│   │   ├── cache_manager.py
│   │   ├── data_normalizer.py
│   │   ├── advanced_cache_service.py
│   │   ├── smart_query_optimizer.py
│   │   ├── metrics_collector.py
│   │   └── health_service.py
│   ├── Providers (Yahoo Finance) ✅
│   └── API Routes (4 blueprints) ✅
│       ├── quotes.py
│       ├── status.py
│       ├── cache_management.py
│       └── query_optimization.py
└── Client Components (Frontend)
    ├── Pages (2 main interfaces) ✅
    │   ├── system-test-center.html
    │   └── external-data-dashboard.html
    ├── Scripts (4 JS files) ✅
    │   ├── system-test-center.js
    │   ├── external-data-dashboard.js
    │   └── header-system.js integration
    └── Styles (responsive CSS) ✅
```

### **Data Flow (Current Implementation)**
1. **User Interface** → Requests ticker data from unified API endpoint ✅
2. **Tickers API** → `/api/tickers/` returns tickers with integrated market data ✅
3. **TickerService** → Joins tickers with latest market data quotes ✅
4. **MarketDataQuote** → Latest price data from external providers ✅
5. **Yahoo Finance Adapter** → Calculates daily change when not provided by Yahoo ✅
6. **Unified Response** → Single API call returns complete ticker + market data ✅
7. **UI Display** → Renders all data with proper formatting and RTL support ✅

**Note**: This unified approach provides better performance and user experience compared to separate API endpoints.

**Daily Change Calculation**: When Yahoo Finance doesn't provide `regularMarketChange` or `regularMarketChangePercent`, the adapter automatically calculates them using `regularMarketPrice` and `chartPreviousClose` to ensure consistent data availability.

### **Future Data Flow (Live Data)**
1. **Scheduler** → Triggers automatic refresh (to be implemented)
2. **Yahoo Finance API** → Real data collection (ready to activate)
3. **Database Storage** → Persistent data storage (tables ready)
4. **Real-time Updates** → WebSocket notifications (future stage)

---

## 🗄️ **Models**

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

## 🔧 **Services**

### **MarketDataService**
The central service for managing market data:

#### **Main Functions:**
- `get_ticker_price(ticker_id)` - Get price for specific ticker
- `update_ticker_price(ticker_id, quote_data)` - Update price
- `refresh_all_prices()` - Refresh all prices
- `get_user_preferences(user_id)` - Get user preferences
- `update_user_preferences(user_id, preferences)` - Update preferences

#### **Usage:**
```python
service = MarketDataService(db_session)
price = service.get_ticker_price(1)
service.refresh_all_prices()
```

---

## 🔌 **Data Providers**

### **Yahoo Finance Provider**
The main data provider for the system:

#### **Features:**
- Support for stocks, currencies, and commodities
- Real-time data
- Price history
- Volume and high/low information

#### **Usage:**
```python
adapter = YahooFinanceAdapter()
quote = adapter.fetch_quote_data('AAPL')
batch_quotes = adapter.fetch_batch_quotes(['AAPL', 'GOOGL', 'MSFT'])
```

#### **Data Format:**
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

#### **Daily Change Calculation Logic:**

**Scenario 1 - Yahoo provides change data directly:**
```
regularMarketChange: 2.50
regularMarketChangePercent: 1.69
→ Use values directly from Yahoo Finance
```

**Scenario 2 - Yahoo doesn't provide change data (current situation):**
```
regularMarketPrice: 150.25
chartPreviousClose: 147.75
→ change_amount = 150.25 - 147.75 = 2.50
→ change_percent = (2.50 / 147.75) * 100 = 1.69%
```

**Implementation Location:**
- File: `Backend/services/external_data/yahoo_finance_adapter.py`
- Function: `_parse_quote_response()`
- Logic: Fallback calculation when Yahoo fields are missing

### **Future Providers:**
- **Interactive Brokers (IBKR)** - For trading accounts
- **Alpha Vantage** - Advanced data
- **Polygon.io** - Real-time data
- **IEX Cloud** - Financial data

---

## 🌐 **API Endpoints**

### **Primary API - Unified Tickers with Market Data**
```
GET /api/tickers/
```
**Description**: Returns all tickers with integrated market data (price, change, volume) in a single response.

**Response Example:**
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "symbol": "AAPL",
            "name": "Apple Inc.",
            "status": "open",
            "current_price": 150.25,
            "change_percent": 1.69,
            "change_amount": 2.50,
            "volume": 50000000,
            "yahoo_updated_at": "2024-01-15T15:30:00Z",
            "data_source": "yahoo_finance"
        }
    ],
    "message": "Tickers retrieved successfully",
    "version": "1.0"
}
```

### **Secondary APIs - Direct Market Data Access**
```
GET /api/external-data/quotes/{ticker_id}    # Direct quote access
GET /api/market-data/status               # System status
GET /api/market-data/refresh              # Manual refresh
POST /api/quotes/{ticker_id}/refresh      # Refresh specific ticker
```

**Note**: The unified `/api/tickers/` endpoint is the recommended approach for better performance.

#### External Data Status Endpoint (Backend/routes/external_data/status.py)
- **Endpoint**: `GET /api/external-data/status/`
- **Purpose**: Aggregated health, cache and provider metrics for the dashboard and system management page.
- **Structured Timestamps**: All time fields now return a payload of the form:
  ```json
  {
    "utc": "2025-11-10T23:48:30.527206Z",
    "local": "2025-11-11T01:48:30.527206+02:00",
    "epochMs": 1762818510527,
    "timezone": "Asia/Jerusalem",
    "display": "11/11/2025 01:48"
  }
  ```
- **Cache Metrics**: Response includes `cache.ttl_seconds` and `cache.ttl_minutes` that mirror the values loaded by `CacheManager.ttl_settings` from user preferences.
- **Provider Details**: Each entry in `providers.details` contains structured timestamps (`last_successful_request`, `metrics_timestamp`) alongside rate-limit counters and recent success rates.
- **Consumers**: `external-data-dashboard.js` and `system-management/sections/sm-section-external-data.js` rely on this structure and never fall back to dummy data.
- **Maintenance Endpoints**:
  - `POST /api/external-data/status/cache/clear` – resets historical quotes (`market_data_quotes`, `intraday_data_slots`, `data_refresh_logs`, `quotes_last`) and clears the in-memory `AdvancedCacheService`.
  - `POST /api/external-data/status/logs/clear` – truncates server log files under `logs/` and wipes `DataRefreshLog` records so only fresh activity appears after a reset.

---

## ⚙️ **Settings and Preferences**

### **Refresh Policy**
Data refresh policy:

#### **Refresh Categories:**
- **High Priority** - Every minute (tickers with active trading)
- **Medium Priority** - Every 5 minutes (common tickers)
- **Low Priority** - Every 15 minutes (rare tickers)
- **Manual** - Only on request

#### **User Settings:**
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
- **Scheduler**: Operates on New York time (NY)
- **UI**: Displays in local time according to user preferences
- **Support**: UTC, Asia/Jerusalem, America/New_York, Europe/London

---

## 🔄 **Automatic Refresh System**

### **Scheduler**
The automatic refresh system:

#### **Logic:**
1. Check trading hours (NY time)
2. Identify tickers by priority
3. Refresh data from providers
4. Save to database
5. Update UI in real-time

#### **Timing:**
- **Trading Hours**: 9:30-16:00 NY time
- **Refresh**: According to user policy
- **Weekends/Holidays**: No refresh

---

## 📊 **User Interface**

### **Quotes Page**
Price display page:

#### **Features:**
- Price table with filters
- Change display (colors)
- Volume and high/low display
- Manual refresh
- Preference settings

#### **Filters:**
- Search by symbol
- Filter by status
- Filter by price change
- Filter by volume

### **External Data Dashboard (Frontend/scripts/external-data-dashboard.js)**
- **Charts**: Delegates all graph rendering to the global `ChartSystem`/`ChartLoader` modules and keeps fallbacks only for legacy compatibility.
- **Logging**: Retrieves records through `UnifiedLogManager.getLogData('externalDataLog')` and formats exports via the Unified Log system instead of direct fetches.
- **Status Integration**: Consumes the structured timestamps and cache metrics returned by `GET /api/external-data/status/`, surfacing TTL values and provider health without placeholders.

---

## 🧪 **Testing and Validation**

### **Unit Tests**
- Model tests
- Service tests
- Provider tests
- API tests

### **Integration Tests**
- Data flow testing
- Automatic refresh testing
- UI testing
- Performance testing

### **Error Handling Tests**
- Provider connection testing
- Invalid data testing
- Timeout testing
- Rate limiting testing

---

## 📈 **Performance and Optimization**

### **Cache System**
- **Dynamic TTL**: Derived from `UserService.get_user_preferences(1)['cacheTTL']`.
- **Hot Layer**: `ttl_seconds.hot` (`ttl_minutes.hot`) equals the user-defined cache TTL (default 60 seconds).
- **Warm Layer**: `ttl_seconds.warm` doubles the hot TTL to provide a secondary buffer.
- **Monitoring**: `CacheManager.get_cache_stats()` exposes hit-rate, stale counts, average ages and TTL data to the status endpoint for frontend display.

### **Rate Limiting**
- **Yahoo Finance**: 100 requests/minute
- **Batch processing**: Up to 50 tickers at once
- **Error backoff**: exponential retry

### **Database Optimization**
- **Indexes**: On ticker_id, asof_utc, provider
- **Partitioning**: By date (future)
- **Cleanup**: Delete old data

---

## 🔐 **Security**

### **Stage-1 (Basic)**
- Data validation
- Error handling
- Basic logging

### **Stage-2 (Advanced)**
- Encrypting sensitive data
- API key management
- Advanced rate limiting
- Audit logging

---

## 📝 **Logs and Monitoring**

### **Log Levels**
- **DEBUG**: Technical details
- **INFO**: Regular operations
- **WARNING**: Non-critical issues
- **ERROR**: Critical errors

### **Metrics**
- Number of provider requests
- Response time
- Success rate
- Resource usage

---

## 🚀 **Future Development**

### **Stage-2 Features**
- Smart alert system
- Charts and graphs
- Technical indicators
- Real-time streaming
- Mobile app

### **Additional Providers**
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

## 📚 **Additional Resources**

- [Development Tasks](./DEVELOPMENT_TASKS.md)
- [API Documentation](../api/README.md)
- [Database Schema](../database/README.md)
- [Frontend Components](../frontend/README.md)

---

## 🤝 **Support and Development**

For questions and issues:
1. Check the logs
2. Check the documentation
3. Contact the development team
4. Open an issue on GitHub

