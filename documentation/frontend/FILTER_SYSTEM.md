# Unified Filter System Documentation - TikTrack

## 📋 Overview

This document describes the comprehensive unified filtering system implemented in TikTrack, providing advanced filtering capabilities across all pages with consistent behavior and user experience.

## 🎯 System Features

### ✅ **Core Features**
- **"All" Option**: Available in all filters (status, type, accounts, dates)
- **Reset and Clear Buttons**: Properly working with account reloading
- **Local Filtering**: Available on all pages (executions, tickers, cash flows)
- **User System**: Default user "nimrod" with multi-user support
- **Preferences API**: Fixed 500 errors and updated JSON structure
- **Field Mapping**: Fixed translation issues in filters

### 🔧 **Technical Features**
- **Filter Persistence**: Filters maintain state across page navigation
- **Dynamic Loading**: Filters update based on available data
- **Performance Optimization**: Efficient filtering algorithms
- **Error Handling**: Graceful handling of filter errors
- **Mobile Responsive**: Works on all screen sizes

## 🏗️ Architecture

### File Structure
```
trading-ui/scripts/
├── filter-system.js           # Advanced filter system
├── simple-filter.js           # Basic filter functionality
├── header-system.js           # Filter integration in header
└── [page-specific].js         # Page-specific filter implementations
```

## 🎯 Table Identification System

### Overview
The TikTrack system uses different table identification methods depending on the page type and structure. This system ensures that filtering, sorting, and other table operations work correctly across all pages.

### Table Identification Methods

#### 1. **CSS Class-Based Identification (Specific Pages)**
Used in dedicated pages like `tickers.html`, `accounts.html`, `trades.html`, etc.

**Structure:**
```html
<div class="content-section tickers-page">
  <table class="table" id="tickersTable" data-table-type="tickers">
    <!-- table content -->
  </table>
</div>
```

**How it works:**
- Container has CSS class like `content-section tickers-page`
- Page-specific JavaScript files (e.g., `tickers.js`) contain local `sortTable(columnIndex)` functions
- Functions know which table they're working with because they're in page-specific files
- Example: `tickers.js` contains `sortTable(columnIndex)` that works with `tickersData`

**Implementation:**
```javascript
// In tickers.js
function sortTable(columnIndex) {
    window.sortTableData(
        columnIndex,
        window.tickersData || [],
        'tickers',
        updateTickersTable
    );
}
```

#### 2. **Data Attribute-Based Identification (Database Display Page)**
Used in the unified database display page (`db_display.html`) that shows all tables.

**Structure:**
```html
<table class="table" id="tradePlansTable" data-table-type="trade_plans">
  <!-- table content -->
</table>
<table class="table" id="tradesTable" data-table-type="trades">
  <!-- table content -->
</table>
```

**How it works:**
- Each table has a `data-table-type` attribute
- Global `sortTable(columnIndex, tableId)` function in `database.js`
- Function reads `data-table-type` to determine table type and data source
- Works with multiple tables on the same page

**Implementation:**
```javascript
// In database.js
function sortTable(columnIndex, tableId) {
    const table = document.getElementById(tableId);
    const tableType = table.getAttribute('data-table-type');
    
    let data = [];
    let updateFunction = null;
    
    switch (tableType) {
        case 'trade_plans':
            data = allData.tradePlans || [];
            updateFunction = updateTradePlansTable;
            break;
        case 'trades':
            data = allData.trades || [];
            updateFunction = updateTradesTable;
            break;
        // ... other cases
    }
    
    window.sortTableData(columnIndex, data, tableType, updateFunction);
}
```

### Filter System Integration

#### Specific Pages Filtering
```javascript
// In simple-filter.js
applyFiltersToTradePlansTable() {
    const table = document.getElementById('designsTable');
    // Works with specific table structure
}

applyFiltersToAlertsTable() {
    const table = document.getElementById('alertsTable');
    // Works with specific table structure
}
```

#### Database Display Page Filtering
```javascript
// In simple-filter.js
applyFiltersToDatabaseDisplayTables() {
    const tableIds = [
        'tradePlansTable',
        'tradesTable',
        'accountsTable',
        'tickersTable',
        'executionsTable',
        'cashFlowsTable',
        'alertsTable',
        'notesTable'
    ];
    
    tableIds.forEach(tableId => {
        this.applyFiltersToDatabaseTable(tableId);
    });
}

applyFiltersToDatabaseTable(tableId) {
    const table = document.getElementById(tableId);
    const tableType = table.getAttribute('data-table-type');
    
    // Apply filters based on table type and structure
    switch (tableType) {
        case 'trade_plans':
            // Filter trade plans specific fields
            break;
        case 'trades':
            // Filter trades specific fields
            break;
        // ... other cases
    }
}
```

### Table Mapping System

#### Table Column Mappings (`table-mappings.js`)
Centralized mapping system for table columns across all pages.

**Purpose:**
- Defines column structure for each table type
- Used by sorting and filtering functions
- Ensures consistency across different page types

**Structure:**
```javascript
const TABLE_COLUMN_MAPPINGS = {
    'trades': [
        'ticker_symbol',   // 0 - טיקר
        'status',          // 1 - סטטוס
        'investment_type', // 2 - סוג
        'side',            // 3 - צד
        'total_pl',        // 4 - רווח/הפסד
        'created_at',      // 5 - נוצר ב
        'closed_at',       // 6 - נסגר ב
        'account_name',    // 7 - חשבון
        'notes',           // 8 - הערות
        'actions'          // 9 - פעולות
    ],
    // ... other tables
};
```

**Usage:**
```javascript
function getColumnValue(item, columnIndex, tableType) {
    const columns = TABLE_COLUMN_MAPPINGS[tableType] || [];
    const fieldName = columns[columnIndex];
    return item[fieldName] || '';
}
```

### Key Differences Between Page Types

| Aspect | Specific Pages | Database Display Page |
|--------|----------------|----------------------|
| **Container Class** | `content-section [page]-page` | `content-section db-display-page` |
| **Table Identification** | CSS class + page-specific JS | `data-table-type` attribute |
| **Sort Function** | `sortTable(columnIndex)` | `sortTable(columnIndex, tableId)` |
| **Data Source** | Page-specific data (e.g., `tickersData`) | Global `allData` object |
| **Filter Implementation** | Page-specific filter functions | Generic database table filters |
| **Table Count** | Single table per page | Multiple tables per page |

### Best Practices

#### 1. **Consistent Naming**
- Use consistent table IDs across all pages
- Follow naming convention: `[tableName]Table`
- Use consistent `data-table-type` values

#### 2. **Error Handling**
```javascript
function sortTable(columnIndex, tableId) {
    const table = document.getElementById(tableId);
    if (!table) {
        console.error('❌ Table not found:', tableId);
        return;
    }
    
    const tableType = table.getAttribute('data-table-type');
    if (!tableType) {
        console.error('❌ Table type not found for table:', tableId);
        return;
    }
    // ... continue with sorting
}
```

#### 3. **Performance Optimization**
- Cache table references when possible
- Use efficient DOM queries
- Minimize redundant table type lookups

#### 4. **Maintainability**
- Keep table mappings centralized in `table-mappings.js`
- Use consistent data structures across pages
- Document table type values and their meanings

### Filter Types

#### 1. **Status Filters**
- **Purpose**: Filter by item status
- **Options**: All, Active, Completed, Canceled
- **Implementation**: Dropdown with "All" option
- **Persistence**: Saved per page

#### 2. **Type Filters**
- **Purpose**: Filter by item type
- **Options**: All, Buy, Sell, Dividend, etc.
- **Implementation**: Dropdown with "All" option
- **Persistence**: Saved per page

#### 3. **Account Filters**
- **Purpose**: Filter by account
- **Options**: All accounts + specific accounts
- **Implementation**: Dropdown with account loading
- **Persistence**: Saved per page

#### 4. **Date Filters**
- **Purpose**: Filter by date range
- **Options**: All dates, specific ranges
- **Implementation**: Date picker with "All" option
- **Persistence**: Saved per page

#### 5. **Text Search**
- **Purpose**: Search within text fields
- **Options**: Real-time search
- **Implementation**: Input field with debouncing
- **Persistence**: Not saved (temporary)

## 🔧 Implementation Details

### Filter System Functions

#### `initializeFilters()`
```javascript
// Initialize all filters on page load
function initializeFilters() {
    loadStatusFilter();
    loadTypeFilter();
    loadAccountFilter();
    loadDateFilter();
    setupFilterEvents();
}
```

#### `loadStatusFilter()`
```javascript
// Load status filter with "All" option
function loadStatusFilter() {
    const statuses = ['All', 'Active', 'Completed', 'Canceled'];
    populateFilter('status-filter', statuses);
}
```

#### `loadAccountFilter()`
```javascript
// Load account filter with API integration
async function loadAccountFilter() {
    try {
        const accounts = await fetchAccounts();
        const options = ['All', ...accounts.map(acc => acc.name)];
        populateFilter('account-filter', options);
    } catch (error) {
        console.error('Error loading accounts:', error);
    }
}
```

#### `applyFilters()`
```javascript
// Apply all active filters
function applyFilters() {
    const filters = getActiveFilters();
    const filteredData = filterData(currentData, filters);
    displayFilteredData(filteredData);
    saveFilterState();
}
```

#### `resetFilters()`
```javascript
// Reset all filters to default state
function resetFilters() {
    clearAllFilters();
    loadDefaultData();
    clearFilterState();
}
```

### Filter State Management

#### Save Filter State
```javascript
// Save current filter state
function saveFilterState() {
    const state = {
        status: getSelectedStatus(),
        type: getSelectedType(),
        account: getSelectedAccount(),
        dateRange: getSelectedDateRange(),
        page: currentPage
    };
    localStorage.setItem(`filterState_${currentPage}`, JSON.stringify(state));
}
```

#### Load Filter State
```javascript
// Load saved filter state
function loadFilterState() {
    const saved = localStorage.getItem(`filterState_${currentPage}`);
    if (saved) {
        const state = JSON.parse(saved);
        applySavedFilters(state);
    }
}
```

## 📊 Filter Configuration

### Page-Specific Configurations

#### Executions Page
```javascript
const executionFilters = {
    status: ['All', 'Active', 'Completed', 'Canceled'],
    type: ['All', 'Buy', 'Sell', 'Dividend'],
    account: 'dynamic', // Loaded from API
    dateRange: 'dynamic', // Date picker
    searchFields: ['ticker', 'notes']
};
```

#### Tickers Page
```javascript
const tickerFilters = {
    type: ['All', 'Stock', 'ETF', 'Crypto', 'Forex'],
    currency: 'dynamic', // Loaded from API
    activeTrades: ['All', 'Yes', 'No'],
    searchFields: ['symbol', 'name']
};
```

#### Cash Flows Page
```javascript
const cashFlowFilters = {
    type: ['All', 'Income', 'Expense'],
    account: 'dynamic', // Loaded from API
    dateRange: 'dynamic', // Date picker
    searchFields: ['description', 'notes']
};
```

## 🎨 User Interface

### Filter Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Status ▼] [Type ▼] [Account ▼] [Date Range ▼] [Search] │
│ [Reset] [Clear]                                         │
└─────────────────────────────────────────────────────────┘
```

### Filter Styling
- **Consistent Design**: Matches overall application theme
- **Responsive Layout**: Adapts to screen size
- **Clear Visual Hierarchy**: Easy to understand and use
- **Accessibility**: Keyboard navigation and screen reader support

## 🔄 Integration with Other Systems

### Header System Integration
```javascript
// Filter system integrated into header
function initializeHeaderFilters() {
    const filterContainer = document.getElementById('header-filters');
    if (filterContainer) {
        setupFilterSystem(filterContainer);
    }
}
```

### Preferences System Integration
```javascript
// Load user preferences for filters
async function loadFilterPreferences() {
    const preferences = await getUserPreferences();
    applyFilterPreferences(preferences);
}
```

### Data System Integration
```javascript
// Filter system works with data loading
function loadDataWithFilters() {
    const filters = getActiveFilters();
    loadData(filters).then(data => {
        displayData(data);
    });
}
```

## 🚀 Performance Optimization

### Filter Optimization Techniques
1. **Debouncing**: Search input debounced to reduce API calls
2. **Caching**: Filter results cached for better performance
3. **Lazy Loading**: Filters load only when needed
4. **Efficient Algorithms**: Optimized filtering algorithms

### Memory Management
```javascript
// Clean up filter resources
function cleanupFilters() {
    clearFilterCache();
    removeEventListeners();
    clearTimeouts();
}
```

## 🧪 Testing

### Filter Testing Checklist
- [ ] All filter types work correctly
- [ ] "All" option shows all data
- [ ] Reset button clears all filters
- [ ] Filter state persists across navigation
- [ ] Performance is acceptable with large datasets
- [ ] Mobile responsiveness works
- [ ] Error handling works correctly

### Test Scenarios
1. **Basic Filtering**: Apply single filter
2. **Multiple Filters**: Apply combination of filters
3. **Filter Reset**: Reset all filters
4. **State Persistence**: Navigate between pages
5. **Error Scenarios**: Handle API errors
6. **Performance**: Test with large datasets

## 🔧 Troubleshooting

### Common Issues

#### Filters Not Working
1. Check if filter elements exist in DOM
2. Verify filter initialization is called
3. Check for JavaScript errors in console
4. Verify API endpoints are working

#### Filter State Not Persisting
1. Check localStorage permissions
2. Verify filter state saving/loading functions
3. Check for JSON parsing errors
4. Verify page identification is correct

#### Performance Issues
1. Check for unnecessary API calls
2. Verify debouncing is working
3. Check for memory leaks
4. Optimize filtering algorithms

## 📚 Related Documentation

- [JavaScript Architecture](JAVASCRIPT_ARCHITECTURE.md)
- [Header System](HEADER_SYSTEM_README.md)
- [Preferences System](../features/preferences/README.md)
- [Backend API](../../backend/README.md)

---

**Last Updated**: August 26, 2025  
**Version**: 2.8.0  
**Maintained By**: TikTrack Development Team
