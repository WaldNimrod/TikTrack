# TikTrack Changelog

## Version 2.3.0 - August 24, 2025

### 🔧 Bug Fixes

#### Sorting System Fixes
- **Fixed infinite recursion in sorting functions** across all table pages
  - `trade_plans.js`: Changed `window.sortTable` to `window.sortTableData`
  - `notes.js`: Changed `window.sortTable` to `window.sortTableData`
  - `alerts.js`: Changed `window.sortTable` to `window.sortTableData`
  - `tickers.js`: Changed `window.sortTable` to `window.sortTableData`
  - `cash_flows.js`: Changed `window.sortTable` to `window.sortTableData`
  - `executions.js`: Changed `window.sortTable` to `window.sortTableData`
  - `accounts.js`: Corrected `window.sortTableData` parameters

#### Table Structure Fixes
- **Fixed trades table structure inconsistency**
  - Updated HTML colspan from 10 to 11 columns
  - Fixed column order to match data rendering
  - Corrected table headers to include account_name column
  - Updated table-mappings.js to reflect 11-column structure

#### UI/UX Improvements
- **Fixed sort icon highlighting**
  - Only the sort arrow is now highlighted (not entire header background)
  - Consistent sorting indicators across all tables
  - Proper active sort state styling

### ✨ New Features

#### Linked Items Modal System
- **Complete linked items functionality** across all tables
  - Added "Show Linked Details" button to all table rows
  - 3-column grid layout for better data presentation
  - Dynamic modal headers based on item type (e.g., "מה קשור לטרייד: AAPL")
  - Concise item information display to reduce scrolling
  - Background click to close functionality for all modals

#### Table-Specific Wrapper Functions
- **Created dedicated wrapper functions** for each table type:
  - `viewLinkedItemsForTrade(id)` - For trades table
  - `viewLinkedItemsForAccount(id)` - For accounts table
  - `viewLinkedItemsForTicker(id)` - For tickers table
  - `viewLinkedItemsForAlert(id)` - For alerts table
  - `viewLinkedItemsForCashFlow(id)` - For cash flows table
  - `viewLinkedItemsForNote(id)` - For notes table
  - `viewLinkedItemsForTradePlan(id)` - For trade plans table
  - `viewLinkedItemsForExecution(id)` - For executions table

### 🏗️ Architecture Improvements

#### Modular Code Organization
- **Centralized linked items functionality** in `linked-items.js`
- **Updated table mappings** in `table-mappings.js` for consistency
- **Enhanced CSS styling** in `table.css` for new modal layout
- **Improved documentation** across all modified files

#### Global Sorting System
- **Standardized sorting function signature**: `window.sortTableData(columnIndex, data, tableType, updateFunction)`
- **Consistent error handling** across all table pages
- **Proper integration** with global sorting system

### 📚 Documentation Updates

#### Updated Files with Comprehensive Documentation
- `tables.js` - Added sorting fixes documentation
- `linked-items.js` - Added linked items feature documentation
- `table-mappings.js` - Added table structure fixes documentation
- `trades.js` - Added table structure and sorting improvements
- `trade_plans.js` - Added sorting fix and linked items integration
- `table.css` - Added new CSS classes documentation
- `trades.html` - Added table structure fixes documentation

### 🔄 Technical Details

#### Function Signature Standardization
```javascript
// Correct function signature for all tables
window.sortTableData(columnIndex, data, tableType, updateFunction)

// Example usage
window.sortTableData(0, tradesData, 'trades', updateTradesTable)
```

#### Table Column Structure (Trades)
1. account_name (0) - חשבון
2. ticker_symbol (1) - טיקר
3. trade_plan_id (2) - תוכנית
4. status (3) - סטטוס
5. investment_type (4) - סוג
6. side (5) - צד
7. created_at (6) - נוצר ב
8. closed_at (7) - נסגר ב
9. total_pl (8) - רווח/הפסד
10. notes (9) - הערות
11. actions (10) - פעולות

### 🐛 Issues Resolved
- RangeError: Maximum call stack size exceeded on planning page
- Table headers not matching data columns
- Sorting not working on multiple pages
- Inconsistent sort icon highlighting
- Missing linked items functionality

### 📋 Testing Checklist
- [x] Sorting works on all table pages
- [x] No infinite recursion errors
- [x] Table headers match data columns
- [x] "Show Linked Details" button works on all tables
- [x] Modal displays correctly with 3-column layout
- [x] Sort icons highlight correctly (only arrow)
- [x] Background click closes modals

### 🔗 Dependencies
- All table pages now depend on `linked-items.js`
- Updated script loading order in HTML files
- Enhanced CSS dependencies for new modal styles

---

## Previous Versions

### Version 2.2.0 - August 23, 2025
- Initial modular architecture implementation
- Header system improvements
- Basic table functionality

### Version 2.1.0 - August 22, 2025
- Database structure improvements
- API endpoint enhancements
- Basic CRUD operations

### Version 2.0.0 - August 21, 2025
- Major refactoring and modularization
- New file structure implementation
- Enhanced error handling
