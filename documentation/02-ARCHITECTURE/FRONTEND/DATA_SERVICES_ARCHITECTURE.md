# Data Services Architecture

## Overview

שירותי נתונים מאוחדים לכל ישות: trades-data.js, executions-data.js, cash-flows-data.js, notes-data.js, trading-accounts-data.js, data-import-data.js, research-data.js, preferences-data.js, alerts-data.js, tickers-data.js.

כל Data Service מכיל Business Logic API wrappers.

## Architecture

### Service Structure

```
data-service/
├── trades-data.js
├── executions-data.js
├── cash-flows-data.js
├── notes-data.js
├── trading-accounts-data.js
├── data-import-data.js
├── research-data.js
├── preferences-data.js
├── alerts-data.js
└── tickers-data.js
```

### Core Features

#### Business Logic API Wrappers

כל Data Service מכיל wrappers ל-Business Logic API:

- **Trade** (6 wrappers): calculateStopPrice, calculateTargetPrice, etc.
- **Execution** (3 wrappers): calculateExecutionValues, etc.
- **Alert** (2 wrappers): validateAlert, validateConditionValue
- **Statistics** (4 wrappers): calculateStatisticsViaAPI, etc.

#### Tickers Service Special Features

```javascript
// משתמש ב-/api/tickers/my
const tickers = await TickersData.getMyTickers();

// מחזיר שדות מותאמים: name_custom, type_custom, user_ticker_status
const customizedTickers = await TickersData.getCustomizedTickers();
```

## API Pattern

```javascript
class TradesData {
  // CRUD operations
  static async getAll() { /* ... */ }
  static async getById(id) { /* ... */ }
  static async create(data) { /* ... */ }
  static async update(id, data) { /* ... */ }
  static async delete(id) { /* ... */ }

  // Business logic wrappers
  static async calculateStopPrice(tradeData) { /* ... */ }
  static async calculateTargetPrice(tradeData) { /* ... */ }
  static async validateTrade(tradeData) { /* ... */ }
}
```

## Cache Integration

כל Data Service משתמש ב-CacheTTLGuard למטמון אוטומטי:

- Memory cache למהירות
- localStorage לpersistence
- IndexedDB לנתונים מורכבים

## Status

✅ **ACTIVE** - 10 entity services with full CRUD and business logic
