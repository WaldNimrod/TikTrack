# Database Changes - August 2025

## General Overview

This document describes the changes made to TikTrack's database structure during August 2025.

## Main Changes

### 1. Removing `opened_at` field from `trades` table

#### Before Change:
```sql
CREATE TABLE trades (
    id INTEGER PRIMARY KEY,
    trade_plan_id INTEGER,
    ticker_id INTEGER,
    account_id INTEGER,
    type TEXT,
    status TEXT,
    opened_at DATETIME,  -- removed field
    closed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### After Change:
```sql
CREATE TABLE trades (
    id INTEGER PRIMARY KEY,
    trade_plan_id INTEGER,
    ticker_id INTEGER,
    account_id INTEGER,
    type TEXT,
    status TEXT,
    closed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Reasons for Change:
- **Confusion**: The `opened_at` field created confusion with `created_at`
- **Consistency**: `created_at` provides the required information
- **Simplicity**: Fewer fields to maintain

### 2. Limiting `type` field values in `trades` table

#### Allowed Values:
- `swing` - Short-term trades
- `invest` - Long-term investments  
- `pasive` - Passive investments

#### Removed Values:
- `long` - Replaced with `swing`
- `short` - Replaced with `invest`

#### Reasons for Change:
- **Clarity**: Clearer names
- **Consistency**: Three well-defined types
- **Maintenance**: Fewer values to maintain

### 3. Updating `status` field values in `trades` table

#### Allowed Values:
- `open` - Open trade
- `closed` - Closed trade
- `cancelled` - Cancelled trade

#### Change:
- `cancelled` → `cancelled` (spelling fix)

## Migration Files

### Created Files:
1. `remove_opened_at_column.py` - Remove `opened_at` column
2. `update_trade_dates.py` - Update existing dates
3. `update_status_values.py` - Update status values

### Updated Files:
1. `models/trade.py` - Update trade model
2. `services/trade_service.py` - Update trade service
3. `routes/api/trades.py` - Update trades API

## Code Impact

### Updated Frontend Files:
1. `trading-ui/tracking.html` - Update trade forms
2. `trading-ui/database.html` - Update trade forms
3. `trading-ui/scripts/trades.js` - Update trade functions

### Main Code Changes:
- Replace `opened_at` with `created_at` everywhere
- Update Hebrew-English translations for trade types
- Update Hebrew-English translations for statuses
- Update form structure

## Ticker Validation

### 4. Adding Validation to `tickers` Table

#### General Overview
We added a comprehensive validation system to the tickers table in the system. The system includes Backend and Frontend validation,
symbol duplication checking, and error prevention during addition and editing.

#### ולידציות שהוספו:

**Backend (Python/SQLAlchemy):**
- **סימבול**: שדה חובה, מקסימום 10 תווים, רק אותיות ומספרים באנגלית
- **שם**: מקסימום 100 תווים
- **סוג**: ערכים מותרים: `stock`, `etf`, `crypto`, `forex`, `commodity`
- **מטבע**: בדיוק 3 תווים (למשל: USD, ILS, EUR)
- **הערות**: מקסימום 500 תווים
- **ייחודיות**: סימבול חייב להיות ייחודי במערכת

**Frontend (JavaScript):**
- ולידציה זהה בצד הלקוח לפני שליחה לשרת
- בדיקת כפילות סימבול בזמן אמת
- הצגת שגיאות ואזהרות למשתמש

#### פונקציות ולידציה שהוספו:

**Backend:**
```python
TickerService.validate_ticker_data(ticker_data)
TickerService.check_symbol_exists(db, symbol, exclude_id=None)
```

**Frontend:**
```javascript
validateTickerData(tickerData)
checkSymbolExists(symbol, existingTickers, excludeId)
```

#### קבצים שעודכנו:
1. `Backend/services/ticker_service.py` - הוספת ולידציה
2. `Backend/models/ticker.py` - אימות ייחודיות סימבול
3. `trading-ui/scripts/tickers.js` - הוספת ולידציה צד לקוח

#### Constants Added:
```python
# Backend Constants
VALID_TICKER_TYPES = ['stock', 'etf', 'crypto', 'forex', 'commodity']
MAX_SYMBOL_LENGTH = 10
MAX_NAME_LENGTH = 100
MAX_REMARKS_LENGTH = 500
CURRENCY_LENGTH = 3
```

#### Usage Examples:

**Backend:**
```python
# Data validation
data = {'symbol': 'AAPL', 'name': 'Apple Inc.', 'type': 'stock'}
validation = TickerService.validate_ticker_data(data)
if not validation['is_valid']:
    print(f"Errors: {validation['errors']}")

# Duplication check
exists = TickerService.check_symbol_exists(db, 'AAPL')

# Creating new ticker
ticker = Ticker(
    symbol="AAPL",
    name="Apple Inc.",
    type="stock",
    currency="USD",
    remarks="American technology company"
)

# Using new functions
print(ticker.display_name)  # "AAPL - Apple Inc."
print(ticker.is_active())   # True/False
print(ticker.get_linked_items_count())  # {'trades': 5, 'trade_plans': 2, ...}
```

**Frontend:**
```javascript
// Data validation
const tickerData = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    currency: 'USD'
};
const validation = validateTickerData(tickerData);
if (!validation.isValid) {
    console.log('Errors:', validation.errors);
}

// Duplication check
const exists = checkSymbolExists('AAPL', tickersList);

// Saving new ticker
await saveTicker();

// Updating existing ticker
await updateTickerFromModal();
```

#### Updated Model Structure:

```python
class Ticker(BaseModel):
    """
    מודל טיקר - מייצג מניה, ETF, מטבע קריפטו או כל נכס פיננסי אחר
    
    Attributes:
        symbol (str): סימבול הטיקר - חייב להיות ייחודי, מקסימום 10 תווים
        name (str): שם החברה או הנכס - מקסימום 100 תווים
        type (str): סוג הנכס - stock, etf, crypto, forex, commodity
        remarks (str): הערות נוספות - מקסימום 500 תווים
        currency (str): מטבע הנכס - בדיוק 3 תווים
        active_trades (bool): האם יש טריידים פעילים
        
    Methods:
        display_name: שם תצוגה בפורמט "SYMBOL - Name"
        is_active: בדיקה האם הטיקר פעיל
        get_linked_items_count: ספירת פריטים מקושרים
    """
```

#### ולידציות שהוספו:

**Backend (Python/SQLAlchemy):**
- **סימבול**: שדה חובה, מקסימום 10 תווים, רק אותיות ומספרים באנגלית
- **שם**: מקסימום 100 תווים
- **סוג**: ערכים מותרים: `stock`, `etf`, `crypto`, `forex`, `commodity`
- **מטבע**: בדיוק 3 תווים (למשל: USD, ILS, EUR)
- **הערות**: מקסימום 500 תווים
- **ייחודיות**: סימבול חייב להיות ייחודי במערכת

**Frontend (JavaScript):**
- ולידציה זהה בצד הלקוח לפני שליחה לשרת
- בדיקת כפילות סימבול בזמן אמת
- הצגת שגיאות ואזהרות למשתמש

#### פונקציות ולידציה שהוספו:

**Backend:**
```python
TickerService.validate_ticker_data(ticker_data)
TickerService.check_symbol_exists(db, symbol, exclude_id=None)
```

**Frontend:**
```javascript
validateTickerData(tickerData)
checkSymbolExists(symbol, existingTickers, excludeId)
```

#### קבצים שעודכנו:
1. `Backend/services/ticker_service.py` - הוספת ולידציה
2. `Backend/models/ticker.py` - אימות ייחודיות סימבול
3. `trading-ui/scripts/tickers.js` - הוספת ולידציה צד לקוח

## Operating Instructions

### Updating Existing Database:
```bash
cd Backend
python3 remove_opened_at_column.py
python3 update_trade_dates.py
python3 update_status_values.py
```

### Integrity Check:
```bash
python3 debug_data.py
```

## Backups

### Automatic Backup:
- Automatic backup created before each change
- Location: `backups/YYYYMMDD_HHMMSS/`
- Includes: Complete database + change log

### Recovery:
```bash
# Recovery from backup
cp backups/YYYYMMDD_HHMMSS/simpleTrade_new.db db/
```

## Tests

### Tests Performed:
- [x] Loading trades list
- [x] Editing existing trade
- [x] Adding new trade
- [x] Cancelling trade
- [x] Deleting trade
- [x] Filters by type
- [x] Filters by status
- [x] Date display

### Additional Tests:
- [x] Compatibility with trade plans
- [x] Compatibility with accounts
- [x] Compatibility with tickers
- [x] Compatibility with notes

## 4. Trade Types Consolidation - 19.08.2025

### Goal
Consolidating all trade types to three fixed and standardized values in the system.

### Identified Problem
There was much inconsistency in trade types in the system:

#### In JavaScript Files:
- `swing`, `invest`, `pasive`
- `swing`, `investment`, `passive`

#### In Models:
- **Trades**: `buy` (default)
- **Trade Plans**: `long` (default)

#### In Hebrew Translation:
- `סווינג`, `השקעה`, `פאסיבי`

### Solution
Consolidating all values to three fixed values:

| English Value | Hebrew Value | Description |
|-------------|------------|-------|
| `swing` | סווינג | Short-term trades |
| `investment` | השקעה | Long-term investments |
| `passive` | פאסיבי | Passive investments |

### Changes Made

#### Model Updates:
- **`Backend/models/trade.py`**: Changed default from `buy` to `swing`
- **`Backend/models/trade_plan.py`**: Changed default from `long` to `swing`

#### HTML File Updates:
- **`trading-ui/database.html`**: Updated `value` from `invest`/`pasive` to `investment`/`passive`
- **`trading-ui/tracking.html`**: Updated `value` from `invest`/`pasive` to `investment`/`passive`

#### JavaScript File Updates:
- **`trading-ui/scripts/trades.js`**: 
  - Updated value mapping
  - Added backward compatibility (`invest` -> `investment`, `pasive` -> `passive`)
  - Updated validation

### Backward Compatibility
The system supports old values and converts them automatically:

| Old Value | New Value |
|---------|---------|
| `buy` | `swing` |
| `long` | `swing` |
| `invest` | `investment` |
| `pasive` | `passive` |

### Data Migration
- **Migration Script**: `update_trade_types.py` (removed after use)
- **Automatic Backup**: Created before changes
- **Results**:
  - 10 trade records updated from `buy` to `swing`
  - 3 trade_plans records updated from `long` to `swing`

### Tests Performed
- [x] Unit tests - Pass successfully
- [x] Database check - All values valid
- [x] Server check - Working normally
- [x] Migration check - Completed successfully

## 5. Adding Side Field - 19.08.2025

### Goal
Adding `side` field to trades and trade plans to distinguish between Long and Short.

### Solution
Adding `side` field with two possible values:
- `Long` - Long position (default)
- `Short` - Short position

### Changes Made

#### Model Updates:
- **`Backend/models/trade.py`**: Added `side` field with default `Long`
- **`Backend/models/trade_plan.py`**: Added `side` field with default `Long`

#### Database Updates:
- **Added side column** to `trades` table
- **Added side column** to `trade_plans` table
- **Automatic backup** before changes

#### HTML File Updates:
- **`trading-ui/tracking.html`**: Added side field to edit and add trade modals
- **`trading-ui/database.html`**: Added side field to trade plan edit modal

#### JavaScript File Updates:
- **`trading-ui/scripts/trades.js`**: Updated save and edit functions
- **`trading-ui/scripts/grid-table.js`**: Updated data collection from modals

### Data Migration
- **Migration Script**: `add_side_column.py` (removed after use)
- **Automatic Backup**: Created before changes
- **Results**:
  - Side column added to trades table
  - Side column added to trade_plans table
  - All records received default value `Long`

### Tests Performed
- [x] Unit tests - 6 tests pass, 1 skip
- [x] Database check - Side columns added successfully
- [x] Server check - API working normally
- [x] Model check - Trade and TradePlan with side field

### New/Updated Files
- **New Files**: None
- **Updated Files**:
  - `Backend/models/trade.py`
  - `Backend/models/trade_plan.py`
  - `trading-ui/tracking.html`
  - `trading-ui/database.html`
  - `trading-ui/scripts/trades.js`
  - `trading-ui/scripts/grid-table.js`
  - `Backend/testing_suite/unit_tests/test_models.py`

## Summary

The changes made improved:
- **Structure Clarity**: Less confusion between fields
- **Data Consistency**: Well-defined values
- **Maintainability**: Cleaner code
- **User Experience**: Clearer interface
- **System Validity**: Consolidating trade types to one standard
- **Trading Flexibility**: Support for Long and Short

All changes were made with full backup and recovery support if needed.

## 6. Filter System Improvement - 20.08.2025

### Goal
Improving the filter system with precise date filter fixes.

### Identified Problems
1. **"Week" filter didn't work correctly** - Showed data from 1970 instead of 7 days ago
2. **Date filter inconsistency** - Some filters didn't work according to correct definitions
3. **Missing "This Week" filter** - No filter for calendar week (Sunday to today)

### Solution

#### Date Filter Improvements:
- **"This Week" filter**: Shows data from the start of the current calendar week (Sunday) to today
- **"Week" filter**: Shows data from 7 days ago to today
- **"MTD" filter**: Shows data from the start of the current calendar month to today
- **"30 Days" filter**: Shows data from 30 days ago to today
- **"60 Days" filter**: Shows data from 60 days ago to today
- **"90 Days" filter**: Shows data from 90 days ago to today
- **"Year" filter**: Shows data from 365 days ago to today
- **"YTD" filter**: Shows data from the start of the current calendar year to today
- **"Previous Year" filter**: Shows data from the start of the previous calendar year to the end

### Changes Made

#### JavaScript File Updates:
- **`trading-ui/scripts/grid-filters.js`**:
  - Improved `getDateRange` function with precise logic for all date filters
  - Double support for "Week" and "This Week" filters with different logic
  - Fixed bug in "Week" filter that showed data from 1970

- **`trading-ui/scripts/app-header.js`**:
  - Added "This Week" filter to the filter menu
  - Updated filter order in the menu

#### Improved Functions:
```javascript
// Improved function for calculating date ranges
getDateRange(dateRange)

// Support for "Week" and "This Week" filters
case 'Week': // Calendar week - from the start of the last Sunday to today
case 'This Week':  // 7 days ago - from 7 days ago to today
```

### Tests Performed
- [x] Filter "This Week" - Works correctly with calendar week
- [x] Filter "Week" - Works correctly with 7 days ago
- [x] All date filters - Work according to definitions
- [x] Backward compatibility - Older filters work as expected

### Updated Files
- ✅ `trading-ui/scripts/app-header.js` - Added filter "This Week" to menu
- ✅ `trading-ui/scripts/grid-filters.js` - Improved `getDateRange` function with precise logic

### Results
- **Filter Accuracy**: All date filters work according to correct definitions
- **Support for Two Week Types**: Calendar week and 7 days ago
- **Bug Fixes**: Filter "Week" works correctly
- **Enhanced User Experience**: More precise filter options

## Summary

The changes made improved:
- **Structure Clarity**: Less confusion between fields
- **Data Consistency**: Well-defined values
- **Maintainability**: Cleaner code
- **User Experience**: Clearer interface
- **System Validity**: Consolidating trade types to one standard
- **Trading Flexibility**: Support for Long and Short
- **Filter Accuracy**: Precise date filters with support for two week types
- **Bug Fixes**: Filter "Week" works correctly
- **Centralized Currency System**: Normalized data with a separate currency table
- **Currency Flexibility**: Easy to add new currencies and update rates
- **Advanced Cash Flows**: Support for currencies, data sources, and exchange rates
- **Full CRUD for Currencies**: Convenient graphical interface for currency management

### Current System State (21.08.2025):
- ✅ **Centralized Currency System**: Separate table with full API
- ✅ **Advanced Cash Flows**: Full support for currencies and data sources
- ✅ **Full CRUD for Currencies**: Graphical interface for currency management
- ✅ **Full Integration**: All components are connected and working

All changes were made with full backup and recovery support if needed.

## 7. Centralized Currency System - 21.08.2025

### Goal
Creating a centralized currency system with a separate table for currencies instead of currency fields scattered across tables.

### Identified Problems
1. **Data Dispersal**: Currencies are stored as text in different tables
2. **Inconsistency**: No currency normalization
3. **Complexity in Maintenance**: Updating currency rates requires code changes
4. **Lack of Flexibility**: Difficult to add new currencies

### Solution

#### Creating a Currency Table:
```sql
CREATE TABLE currencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    usd_rate DECIMAL(10,6) NOT NULL DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Updating Existing Tables:
1. **`accounts` table**:
   - Added `currency_id` (INTEGER, ForeignKey)
   - Removed `currency` (VARCHAR)
   - Added relationship to `currencies` table

2. **`tickers` table**:
   - Added `currency_id` (INTEGER, ForeignKey)
   - Removed `currency` (VARCHAR)
   - Added relationship to `currencies` table

3. **`cash_flows` table**:
   - Already updated to work with `currency_id`

### Changes Made

#### New Migration Files:
- **`Backend/migrations/create_currencies_table.py`**: Create currency table
- **`Backend/migrations/update_accounts_currency.py`**: Update account table
- **`Backend/migrations/update_tickers_currency.py`**: Update ticker table
- **`add_currencies.py`**: Add primary currencies

#### New Models/Updated:
- **`Backend/models/currency.py`**: New currency model
- **`Backend/models/account.py`**: Update to work with `currency_id`
- **`Backend/models/ticker.py`**: Update to work with `currency_id`
- **`Backend/models/__init__.py`**: Added Currency model

#### New Services/Updated:
- **`Backend/services/currency_service.py`**: New currency service
- **`Backend/services/ticker_service.py`**: Update to work with `currency_id`
- **`Backend/services/__init__.py`**: Added CurrencyService

#### New API Routes:
- **`Backend/routes/api/currencies.py`**: New currency API
- **`Backend/app.py`**: Register new blueprint

#### Frontend Updated:
- **`trading-ui/scripts/accounts.js`**: Update to work with new currency system
- **`trading-ui/scripts/tickers.js`**: Update to work with new currency system
- **`trading-ui/accounts.html`**: Update forms
- **`trading-ui/tickers.html`**: Update forms

#### Documentation:
- **`CURRENCY_MIGRATION_DOCUMENTATION.md`**: Detailed documentation of the migration

### Primary Currencies Added:
1. **USD** - American Dollar (Rate: 1.000000)
2. **EUR** - Euro (Rate: 0.850000)
3. **ILS** - Israeli Shekel (Rate: 3.650000)

### Benefits of the New System:
1. **Normalized Data**: Currencies stored in a separate table
2. **Flexibility**: Easy to add new currencies
3. **Consistency**: All tables use the same currency system
4. **Maintainability**: Update currency rate in one place
5. **Compatibility**: Support for new currencies without code changes

### Tests Performed
- [x] Create currency table
- [x] Add primary currencies
- [x] Migrate account data
- [x] Migrate ticker data
- [x] API endpoint checks
- [x] Frontend checks
- [x] Backward compatibility

### New/Updated Files

#### Created:
- `Backend/models/currency.py`
- `Backend/services/currency_service.py`
- `Backend/routes/api/currencies.py`
- `Backend/migrations/create_currencies_table.py`
- `Backend/migrations/update_accounts_currency.py`
- `Backend/migrations/update_tickers_currency.py`
- `add_currencies.py`
- `CURRENCY_MIGRATION_DOCUMENTATION.md`

#### Updated:
- `Backend/models/account.py`
- `Backend/models/ticker.py`
- `Backend/models/__init__.py`
- `Backend/services/__init__.py`
- `Backend/services/ticker_service.py`
- `Backend/models/swagger_models.py`
- `Backend/app.py`
- `trading-ui/scripts/accounts.js`
- `trading-ui/scripts/tickers.js`
- `trading-ui/accounts.html`
- `trading-ui/tickers.html`

### Results
- **Centralized Currency System**: Separate table for currencies
- **Normalized Data**: Well-structured data
- **Full API**: Endpoints for currencies
- **Frontend Updated**: Support for new system
- **Backward Compatibility**: System continues to work with existing data

## 8. Enhanced Cash Flow System - 21.08.2025

### Goal
Adding new fields to `cash_flows` table for support of the centralized currency system and data sources.

### New Fields Added

#### 1. Action Currency (`currency_id`)
- **Type**: INTEGER, ForeignKey to `currencies` table
- **Purpose**: Link to the centralized currency system
- **Default**: USD currency ID (USD)

#### 2. Action USD Rate (`usd_rate`)
- **Type**: DECIMAL(10,6)
- **Purpose**: Store the currency rate against USD on the action date
- **Default**: 1.000000 (currently hardcoded)
- **Note**: Exchange rate updates will be added in the future

#### 3. Data Source (`source`)
- **Type**: VARCHAR(20)
- **Possible Values**:
  - `manual` - Manual entry (default)
  - `file_import` - Import from file
  - `direct_import` - Direct import from broker
- **Note**: Currently only `manual` is supported, others will be added in the future

#### 4. External ID (`external_id`)
- **Type**: VARCHAR(100)
- **Purpose**: Store the record ID from the broker (for future imports)
- **Default**: '0' (for manual entries)

### Changes Made

#### Model Update:
- **`Backend/models/cash_flow.py`**: 
  - Added new fields
  - Added relationship to `currencies` table

#### API Update:
- **`Backend/routes/api/cash_flows.py`**:
  - Updated GET functions to include currency data
  - Updated POST/PUT functions to support new fields
  - Used `joinedload` for currency data loading

#### Frontend Update:
- **`trading-ui/cash_flows.html`**:
  - Updated table headers
  - Added new fields to add and edit modals
  - Added information notes for users
  
- **`trading-ui/scripts/cash_flows.js`**:
  - Updated save and update functions
  - Added currency loading to dropdown
  - Updated table rendering

#### Menu Update:
- **`trading-ui/scripts/app-header.js`**: Added link to cash flows page

#### Migration Scripts:
- **`update_cash_flows_table.py`**: Added new fields to existing table
- **`add_cash_flows.py`**: Updated data script for example

### Tests Performed
- [x] Added fields to table
- [x] Updated existing data with default values
- [x] API endpoint checks
- [x] Frontend checks
- [x] Currency loading checks
- [x] Save and update checks

## 9. Full CRUD for Currencies - 21.08.2025

### Goal
Creating a full CRUD interface for currencies as part of the planned list.

### What Was Done

#### Creating Currency Page:
- **`trading-ui/currencies.html`**:
  - Full HTML page for currencies
  - Table with headers: ID, Symbol, Name, USD Rate, Created, Actions
  - Add, Edit, Delete models
  - Summarize data for currencies
  - Information notes about currencies

#### Creating JavaScript for Currencies:
- **`trading-ui/scripts/currencies.js`**:
  - Full CRUD functions (Create, Read, Update, Delete)
  - Data loading from API
  - Dynamic table rendering
  - Update statistics
  - Data validation

#### Added Items:
- **`Backend/app.py`**: Added `/currencies` and `/currencies.html`

#### Added Link in Menu:
- **`trading-ui/scripts/app-header.js`**: Added link after "Database"

### Page Features
- **Display Currencies**: Dynamic table with all currencies
- **Add Currency**: Model with symbol, name, and USD rate
- **Edit Currency**: Model for editing existing currency details
- **Delete Currency**: Confirmation of deletion with warning
- **Statistics**: Total currencies, base currency, max and min rates

### Tests Performed
- [x] Currency page loading
- [x] Displaying currency list
- [x] Adding new currency
- [x] Editing existing currency
- [x] Deleting currency
- [x] Updating statistics
- [x] Data validation

### New Files
- `trading-ui/currencies.html`
- `trading-ui/scripts/currencies.js`

### Updated Files
- `Backend/app.py`
- `trading-ui/scripts/app-header.js`

### Results
- **Full CRUD for Currencies**: All operations available
- **User-friendly Interface**: Well-designed and easy-to-use page
- **Full Integration**: Connected to existing system
- **Menu Support**: Accessible from main menu
