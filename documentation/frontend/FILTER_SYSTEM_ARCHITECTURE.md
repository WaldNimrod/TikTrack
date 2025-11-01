# Filter System Architecture - Current State
# =========================================

## Overview
This document captures the current state of the filter system before refactoring.

## Current Requirements (from user specifications)
1. **Status Filter**: Only 3 values - `Open`, `Closed`, `Cancelled`
2. **Type Filter**: Only 3 values - `Investment`, `Swing`, `Passive` (works against `investment_type` column)
3. **Account Filter**: Only display accounts in `open` status
4. **Supported Pages**: Trades, Trade Plans, Tickers, Accounts, Cash Flows, Notes
5. **Date Filter**: Standard date ranges with Hebrew translations
6. **Search Filter**: Global search across all columns except Actions

## User Specifications (דיוקים)
### Filter Values
- **Status Filter**: Exactly 3 values like all system statuses: `Open`, `Closed`, `Cancelled`
- **Type Filter**: Exactly 3 values like all system types: `Investment`, `Swing`, `Passive` - works against `investment_type` column (translated to "סוג" or "סוג השקעה")
- **Account Filter**: Display only accounts in `open` status

### Supported Pages
Add support for pages: Trades, Trade Plans, Tickers, Accounts, Cash Flows, Notes

### Container Corrections
- `notificationsContainer` - system notifications table - does not exist, only `alerts` exists

### Future Enhancements
After all these tables work correctly, implement filters for auxiliary tables and database pages so they affect all tables on the page simultaneously.

## Current Architecture Issues
1. **Complexity**: Too many functions and configurations
2. **Inconsistency**: Mixed Hebrew/English column names
3. **Over-engineering**: Multiple filter systems that don't work together
4. **Maintenance**: Hard to understand and modify

## REFACTORING COMPLETED - August 31, 2025
### Functions Removed
- `getFilterConfig()` - Complex configuration object
- `checkIfTableHasColumn()` - Overly complex column detection
- `applyTableFilter()` - Complex filter application logic
- `getAllVisibleContainers()` - Complex container detection
- Multiple filter-specific functions that were redundant

### New Architecture Implemented
1. **Simple Filter Object**: One configuration per filter type
2. **Direct Column Mapping**: Map filter types directly to column names
3. **Unified Application**: Single function to apply filters
4. **Clear Container List**: Fixed list of supported containers
5. **English-Only Logic**: All internal logic in English, UI translation only

### New Functions Created
- `applyFilter(filterType, selectedValue)` - Main filter application function
- `getVisibleContainers()` - Simple container detection
- `shouldApplyFilterToContainer(containerId, filterType)` - Container filter logic
- `applyFilterToContainer(containerId, filterType, selectedValue)` - Container-specific filtering
- `checkRowFilter(row, filterType, selectedValue)` - Row-level filter logic
- `getColumnIndex(row, filterType)` - Column detection
- `checkSearchFilter(row, searchTerm)` - Search functionality
- `checkDateFilter(cellValue, dateRange)` - Date filtering (TODO)

### Constants Defined
```javascript
const SUPPORTED_CONTAINERS = [
  'tradesContainer',
  'trade_plansContainer',  // Note: underscore in actual implementation
  'accountsContainer',
  'alertsContainer',
  'cashFlowsContainer',
  'executionsContainer',
  'notesContainer',
  'tickersContainer'
];

const FILTER_COLUMNS = {
  'status': 'Status',
  'type': 'Investment Type',
  'account': 'Account',
  'date': 'Date',
  'search': null // Special case - searches all columns
};

const TYPE_FILTER_TABLES = ['tradesContainer', 'trade_plansContainer'];
```

## Supported Tables
- `tradesContainer`
- `trade_plansContainer` - **Note:** Uses underscore (not camelCase)
- `accountsContainer`
- `alertsContainer`
- `cashFlowsContainer`
- `executionsContainer`
- `notesContainer`
- `tickersContainer`

## Implementation Status (Updated: January 2025)
- ✅ All 8 containers are supported
- ✅ Multiple tables per page supported
- ✅ Automatic detection of additional containers
- ✅ Graceful handling when table fields are missing (shows all rows)

## Filter Types
1. **status** → `Status` column
2. **type** → `Investment Type` column (trades, trade plans only)
3. **account** → `Account` column
4. **date** → `Date` column
5. **search** → All columns except Actions

## Date Range Options
- All Time (כל זמן)
- Today (היום)
- Yesterday (אתמול)
- This Week (השבוע)
- Last Week (שבוע קודם)
- This Month (החודש)
- Last Month (חודש קודם)
- This Year (השנה)
- Last Year (שנה קודמת)

## Next Steps
1. Test the new filter system on all supported pages
2. Implement date range filtering logic
3. Add support for auxiliary tables and database pages
4. Update filter documentation to reflect new architecture
