# Changelog - TikTrack

## [2.7] - 2025-08-24

### 🔧 **Trades Page Technical Fixes**
- **API Preferences Route**: Fixed routing mismatch from `/api/preferences` to `/api/v1/preferences`
- **Missing Modal**: Added `linkedItemsModal` HTML structure to trades.html
- **Sorting Function Loading**: Resolved timing issue by removing inline `onclick` attributes and implementing event listeners in JavaScript
- **Global Functions**: Added missing global function exports: `viewAccountDetails`, `deleteTradeRecord`
- **Table Structure**: Fixed table layout by adding notes column and removing P&L column

### 🐛 **Bug Fixes**
- **Sorting Timing Issue**: Fixed `sortTable` function not available during HTML parsing
- **Modal Missing**: Added complete `linkedItemsModal` structure for linked items viewing
- **API Route Mismatch**: Corrected preferences API endpoint routing
- **Function Export**: Added missing global function exports for account details and trade deletion

### 🔧 **Technical Changes**
- **HTML Updates**: Replaced all `onclick` attributes with `data-sort-column` attributes in trades.html
- **JavaScript Enhancement**: Added `setupSortEventListeners()` function in trades.js
- **API Route Fix**: Updated preferences blueprint to use correct URL prefix
- **Modal Addition**: Added complete linked items modal HTML structure

### 📁 **Files Modified**
- `trading-ui/trades.html` - Fixed sorting buttons and added modal
- `trading-ui/scripts/trades.js` - Added event listeners and global functions
- `Backend/routes/api/preferences.py` - Fixed API routing
- `MODULE_TESTING_CHECKLIST.md` - Updated testing status

---

## [2.6] - 2025-08-22

### 🆕 **New Extra Data Tables Page**
- **New Page:** Created `db_extradata.html` for additional data tables
- **Page Structure:** Cloned from designs page with custom modifications
- **Database Styles:** Added link to database page styles for consistent design
- **Custom Content:** Updated table structure for extra data management
- **JavaScript:** Created `db_extradata.js` with page-specific functions
- **Server Route:** Added `/db_extradata` route to backend

### 🔧 **Technical Changes**
- **File Creation:** `trading-ui/db_extradata.html` - New extra data page
- **File Creation:** `trading-ui/scripts/db_extradata.js` - Page-specific JavaScript
- **Route Addition:** `Backend/routes/pages.py` - New route for extra data page
- **Style Integration:** Added database.css link for consistent styling

### 📁 **New Files**
- `trading-ui/db_extradata.html` - Extra data tables page
- `trading-ui/scripts/db_extradata.js` - Extra data page JavaScript

### 🎯 **Page Features**
- **Table Management:** Display and manage additional data tables
- **Status Tracking:** Active/inactive table status
- **Record Counting:** Track number of records per table
- **Consistent Design:** Uses database page styling for uniformity

---

## [2.5] - 2025-08-22

### 🏗️ **Page Restructuring - Trade Plans**
- **Page Rename:** Changed `trades.html` to `trade_plans.html` to better reflect content
- **Menu Update:** Changed "מעקב" to "תכנון" in main menu to match actual page content
- **Route Update:** Updated server route from `/trades` to `/trade_plans`
- **Menu Cleanup:** Removed "תוכניות מסחר" from settings dropdown menu (duplicate)
- **Title Update:** Changed page title from "מעקב טריידים" to "תכנון"

### 🔧 **Technical Changes**
- **File Rename:** `trading-ui/trades.html` → `trading-ui/trade_plans.html`
- **Route Update:** `Backend/routes/pages.py` - Added `/trade_plans` route, updated `/tracking` redirect
- **Menu System:** Updated `header-system.js` and `menu.js` with new page names and titles
- **JavaScript Updates:** Updated all references from `trades` to `trade_plans` in navigation functions
- **Link Updates:** Fixed all internal links in `executions.js` and `tickers.js` to point to new route

### 📁 **File Changes**
- **Renamed:** `trading-ui/trades.html` → `trading-ui/trade_plans.html`
- **Updated:** `Backend/routes/pages.py` - New route structure
- **Updated:** `trading-ui/scripts/header-system.js` - Menu structure and navigation
- **Updated:** `trading-ui/scripts/menu.js` - Menu items and active state handling
- **Updated:** `trading-ui/scripts/main.js` - Page name detection and routing
- **Updated:** `trading-ui/scripts/trades.js` - Title update logic
- **Updated:** `trading-ui/scripts/executions.js` - Navigation links
- **Updated:** `trading-ui/scripts/tickers.js` - Navigation links

### 🎯 **User Experience Improvements**
- **Clearer Navigation:** Menu now accurately reflects page content (תכנון vs מעקב)
- **Reduced Confusion:** Removed duplicate menu item from settings dropdown
- **Consistent Naming:** Page name now matches actual functionality (trade plans)

### 🐛 **Bug Fixes**
- **Currency Page Data Loading:** Fixed currency page not displaying data by adding sample currencies
- **Error Handling:** Improved error messages in currency page with detailed logging
- **Navigation Consistency:** Fixed all internal links to use correct page routes

---

## [2.4] - 2025-08-21

### 🏦 **Central Currency System**
- **Separate Currency Table:** Creating a central table for currencies with data normalization
- **Full Currency API:** CRUD operations with complete endpoints
- **Data Migration:** Updating `accounts` and `tickers` tables to work with `currency_id`
- **Multi-Currency Support:** USD, EUR, ILS with option to add new currencies
- **Dynamic Exchange Rates:** Update rates in one place

### 🔧 **Technical Changes**
- **New Currency Model:** `Backend/models/currency.py` with symbol, name, usd_rate fields
- **CurrencyService:** New service for currency management with full validation
- **API Routes:** New endpoints for currencies in `Backend/routes/api/currencies.py`
- **Migration:** Migration files for creating table and updating existing data
- **Frontend Updates:** Update accounts and tickers pages to work with new currency system

### 📁 **New Files**
- `Backend/models/currency.py` - Currency model
- `Backend/services/currency_service.py` - Currency service
- `Backend/routes/api/currencies.py` - Currency API
- `Backend/migrations/create_currencies_table.py` - Create currencies table
- `Backend/migrations/update_accounts_currency.py` - Accounts migration
- `Backend/migrations/update_tickers_currency.py` - Tickers migration
- `add_currencies.py` - Add initial currencies
- `CURRENCY_MIGRATION_DOCUMENTATION.md` - Detailed documentation

### 📝 **Documentation**
- **Migration Documentation:** `CURRENCY_MIGRATION_DOCUMENTATION.md` with detailed instructions
- **Database Changes Update:** Added migration section to `DATABASE_CHANGES_AUGUST_2025.md`
- **README Update:** Documentation of new system in main README
- **API Documentation:** Updated Swagger models for currencies

### 🎯 **Advantages of the New System**
- **Data Normalization:** Proper data structure with separate currency table
- **Flexibility:** Easy to add new currencies and update rates
- **Consistency:** All tables use the same currency system
- **Maintenance:** Update currency rate in one place
- **Backward Compatibility:** System continues to work with existing data

---

## [2.3] - 2025-08-18

### 🏗️ **Architectural Changes**
- **JavaScript File Unification:** Merging `grid-table.js` and `grid-data.js` into `main.js`
- **Clear Rule Definition:** General functions in `main.js`, specific functions in dedicated files
- **Architecture Improvement:** Reorganization of file structure with detailed documentation

### 📁 **File Changes**
- **Created:** `trading-ui/scripts/main.js` - Main general file containing all shared functionality
- **Backup:** `backups/20250818_js_unification/` - Full backup of old files
- **Deleted:** `grid-table.js`, `grid-data.js`, `grid-init.js` - Old files deleted after unification
- **Updated:** All pages to load `main.js` instead of old files

### 🔧 **Development Improvements**
- **Improved Documentation:** Added detailed documentation about file structure in `README.md`
- **Development Rules:** Defined clear rules for function distribution between files
- **Code Organization:** Functions organized by categories with detailed documentation

### 🐛 **Bug Fixes**
- **Fix Close/Open Functions:** Improved functionality of section buttons
- **Fix Data Loading:** Performance improvement in loading data from database
- **Fix Filters:** Fixed issues in table filtering

### 📚 **Documentation**
- **README Update:** Detailed documentation about new file architecture
- **Development Instructions:** Added clear guidelines for future development
- **Rules Documentation:** Documentation of rules for function distribution between files

---

## [2.2] - 2025-08-17

### 🐛 **Bug Fixes**
- **Fix joinedload Error:** Fixed `'Session' object has no attribute 'joinedload'` error on server
- **Fix Filters on Tracking Page:** Fixed search filter that caused filtering of all trades
- **Fix Fields in Tracking Table:** Fixed `opened_at` field to `created_at` and fixed `ticker_symbol`
- **Fix JavaScript Errors:** Fixed `trade.trade_plan_id.toLowerCase is not a function` error

### 🎨 **UI Improvements**
- **Fix Close/Open Buttons:** Improved functionality of section buttons on database page
- **Button Styling:** Improved styling of "Add" buttons on database page
- **Remove Refresh Buttons:** Removed unnecessary "Refresh" buttons from tables

### ⚡ **Optimization**
- **Improve Data Loading:** Added detailed logs for diagnosing loading issues
- **Performance Improvement:** Optimization of data loading from database

### 📝 **Documentation**
- **CHANGELOG Update:** Detailed documentation of all changes
- **Bug Documentation:** Documentation of identified and resolved issues

---

## [2.1] - 2025-08-16

### 🆕 **New Features**
- **Advanced Alert System:** Full lifecycle with statuses and activation modes
- **Double Confirmation System:** Second warning window for deleting accounts with linked object verification
- **Comprehensive Testing System:** Organization of all tests in dedicated directory with professional structure

### 🏗️ **Architecture Improvements**
- **Modular Architecture:** Well-organized and documented code with separate functions for each table
- **Built-in API:** RESTful routes with versioning
- **Error Management:** Advanced error handling

### 🐛 **Bug Fixes**
- **Fix Plan List:** Resolved issue loading trade plans in forms
- **Fix Data Saving:** Resolved saving issues when editing trades
- **Fix Data Display:** Display account and ticker names instead of IDs

### 📚 **Documentation**
- **Organized Documentation Structure:** Organization of documentation in separate files by topics
- **API Documentation:** Built-in Swagger UI
- **System Documentation:** Detailed documentation for all systems

---

## [2.0] - 2025-08-15

### 🎉 **Version 2.0 Release**
- **Advanced Investment Management System:** Complete system for managing trading accounts, trade planning and tracking
- **Modern User Interface:** Apple-inspired design with styled buttons
- **Modular Architecture:** Well-organized and documented code

### 🆕 **Main Features**
- **Account Management:** Create, edit and cancel trading accounts
- **Open Trades Check:** Prevent cancellation/deletion of accounts with active trades
- **Trade Planning:** Create and edit trade plans
- **Trade Tracking:** Track active and closed trades
- **Alerts:** Alert system for prices and conditions
- **Notes:** Note system with links to system elements
- **Statistics:** Dashboard with general statistics

### 🏗️ **Architecture**
- **SQLAlchemy Models:** Built-in database management
- **Service Layer:** Separate business logic
- **Built-in API:** RESTful routes with versioning
- **Frontend Architecture:** Separate JS file for each table

### 📊 **Database**
- **SQLite:** Light and fast database
- **Complete Tables:** All tables required for complete system
- **Consistent Statuses:** Use of English in database

---

## [1.0] - 2025-08-01

### 🎉 **First Release**
- **Basic System:** First version of investment management system
- **Basic Functionality:** Account and trade management
- **Simple User Interface:** Basic interface for system management

---

**© 2025 TikTrack - All Rights Reserved**
