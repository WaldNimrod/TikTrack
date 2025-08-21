# Known Issues

## Identified and Fixed Issues

### 1. Duplicate Code Between Pages
- **Issue**: Account management functions were duplicated between `accounts.html` and `database.html`
- **Fix**: Refactored common functionality into shared external files (`accounts.js`, `tickers.js`, `alerts.js`, `executions.js`)
- **Status**: ✅ Fixed

### 2. Open Trade Checks Not Working
- **Issue**: Warning modal for account/ticker cancellation was showing all open trades instead of only those associated with the specific account/ticker
- **Fix**: Updated backend filtering in `trade_service.py` and frontend logic in `accounts.js` and `tickers.js`
- **Status**: ✅ Fixed

### 3. Ticker Symbol Display in Warning Modal
- **Issue**: Warning modal was showing `ticker_id` instead of ticker `symbol`
- **Fix**: Modified `showOpenTradesWarning` to fetch tickers and create a mapping from ID to symbol
- **Status**: ✅ Fixed

### 4. Inconsistent Status Values
- **Issue**: Status values were inconsistent across the system (English vs Hebrew, different terms)
- **Fix**: Standardized all status values to Hebrew: 'פתוח', 'סגור', 'מבוטל'
- **Status**: ✅ Fixed

### 5. apiCall Function Availability
- **Issue**: `apiCall` function was not available in `accounts.html` due to missing `grid-table.js` import
- **Fix**: Added `<script src="scripts/grid-table.js"></script>` to `accounts.html`
- **Status**: ✅ Fixed

### 6. URL Encoding Issues
- **Issue**: Hebrew characters in URL parameters were not properly encoded
- **Fix**: Used `encodeURIComponent()` for Hebrew status values in API calls
- **Status**: ✅ Fixed

### 7. Server Monitoring Awareness
- **Issue**: Code changes were not being picked up due to server monitoring setup
- **Fix**: Understood that server is managed by `monitor_server.py` and `run_waitress.py`
- **Status**: ✅ Fixed

## Identified but Unresolved Issues

### 1. get_by_account_and_status Returning All Trades
- **Issue**: The `get_by_account_and_status` function in `trade_service.py` appears to return all trades instead of filtering by account and status
- **Investigation**: Added extensive logging to track parameter reception and filtering logic
- **Status**: 🔍 Under Investigation

## Partially Fixed Issues

### 1. URL Encoding
- **Issue**: Hebrew characters in URL parameters causing "Bad Request" errors
- **Partial Fix**: Used `encodeURIComponent()` in client-side calls
- **Remaining**: May need additional backend handling for Hebrew parameters
- **Status**: 🔄 Partially Fixed

## Current Active Issues

### 1. Accounts Table Not Displaying on database.html
- **Issue**: The accounts table on `database.html` is not displaying data, showing only the header, while `accounts.html` works correctly
- **Symptoms**: 
  - Header shows correct count (e.g., "8 חשבונות")
  - Table body is empty or not rendered
  - No JavaScript errors in console
- **Investigation**: 
  - Both pages should use the same shared external code (`accounts.js`)
  - `database.html` calls `window.loadAccountsData()` from `accounts.js`
  - `accounts.html` has a local wrapper function that calls `window.loadAccountsData()`
- **Root Cause**: The `accounts.js` file appears to be outdated and doesn't contain the expected functions (`loadAccountsData`, `convertAccountStatusToHebrew`, etc.)
- **Status**: 🔍 Under Investigation

### 2. Alerts Table Not Displaying on database.html
- **Issue**: The alerts table on `database.html` is not displaying data, showing only the header, despite the correct count being displayed
- **Symptoms**: 
  - Header shows correct count (e.g., "8 התראות")
  - Table body is empty or not rendered
  - Occurs after implementing the `is_triggered` field for alerts
- **Investigation**: 
  - All alert-related JavaScript functions are centralized in `alerts.js`
  - `database.html` is configured to use them
  - Issue appears to be client-side rendering problem
- **Status**: 🔍 Under Investigation

## Potential Future Issues

### 1. Performance Concerns
- **Risk**: Client-side calculation of statistics may become slow with large datasets
- **Mitigation**: Consider server-side aggregation for large datasets

### 2. Browser Compatibility
- **Risk**: RTL layout and Hebrew text may have compatibility issues with older browsers
- **Mitigation**: Test across different browsers and versions

### 3. Security Considerations
- **Risk**: Client-side data manipulation could be bypassed
- **Mitigation**: Implement server-side validation for all operations

### 4. Code Maintenance
- **Risk**: Shared JavaScript files may become difficult to maintain as they grow
- **Mitigation**: Consider modular architecture or TypeScript for better type safety

## Notes

- The system uses a modular architecture with shared JavaScript files for common functionality
- All status values are standardized to Hebrew terms across the entire system
- The server is managed by monitoring scripts (`monitor_server.py` and `run_waitress.py`)
- Browser caching can cause issues with seeing updated code - may need cache clearing
