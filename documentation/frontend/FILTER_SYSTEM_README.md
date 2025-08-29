# TikTrack Filter System Documentation

## Overview
The TikTrack Filter System is a unified, client-side filtering solution that provides advanced filtering capabilities across all data tables in the application. It has been completely rewritten to provide a more robust, maintainable, and user-friendly filtering experience.

## Version History
- **Version 2.0** (August 29, 2025) - **CURRENT** - Complete system alignment and stabilization
- **Version 4.2** (January 2025) - Accounts page filter implementation completed
- **Version 4.1** (August 28, 2025) - Enhanced date filtering and notifications support
- **Version 4.0** (August 28, 2025) - Complete rewrite with unified filtering
- **Version 3.x** (August 2025) - Legacy system (removed)

## Key Changes in Version 4.2 (January 2025)

### ✅ Accounts Page Filter Implementation Completed
- **Account filter**: Filter by specific account names
- **Free text search**: Search across name, currency, notes, and status fields
- **Filter reset**: Clear all filters functionality
- **Responsive table layout**: Proper column width distribution (100% total)
- **Action buttons**: Edit, delete, and linked items buttons
- **Summary statistics**: Real-time display of account counts and totals
- **Top section toggle**: Show/hide summary section with state persistence
- **State persistence**: Filter and display states saved to localStorage

### 🎯 Enhanced Date Filtering (Version 4.1)
- **Fixed "All Time" positioning**: Now appears FIRST in the date filter list
- **Corrected date range calculations**: All date ranges now calculate correctly
- **Notifications table support**: Date filter now works on notifications table
- **Improved date logic**: Enhanced handling of all date range options

### 🗑️ Removed Components
- `simple-filter.js` - Completely removed from the system
- `filter-system.js` - Moved to backup directory
- Old filter initialization functions
- Separate filter application functions

### ✨ New Architecture

#### 1. Unified Filter Function
```javascript
function applyTableFilter(filterType, selectedValues)
```
- **Single function** handles all filter types
- **Universal application** across all tables
- **Smart column detection** by header text
- **Dynamic container support** for all visible tables

#### 2. Filter Configuration System
```javascript
function getFilterConfig(filterType)
```
- **Centralized configuration** for all filter types
- **Flexible column matching** by keywords
- **Known container support** for specific tables
- **Extensible design** for new filter types

#### 3. Enhanced Date Filtering
```javascript
function isDateInRange(dateString, dateRange)
```
- **Smart date range calculations**
- **Hebrew display support**
- **Multiple date range options**
- **Robust error handling**

## Filter Types

### 1. Status Filter
- **Column**: `Status`
- **Values**: `Open`, `Closed`, `Cancelled`, `Active`, `Inactive`, `Pending`
- **Multi-select**: ✅ Supported
- **Tables**: Trades, Alerts, Executions, Test

### 2. Type Filter
- **Column**: `Type`
- **Values**: `Investment`, `Swing`, `Passive`, `Buy`, `Sell`
- **Multi-select**: ✅ Supported
- **Tables**: Trades, Designs, Test

### 3. Account Filter
- **Column**: `Account`
- **Values**: Dynamic from server
- **Multi-select**: ✅ Supported
- **Caching**: localStorage for performance
- **Tables**: Trades, Alerts, Executions, Test, Notifications

### 4. Date Filter (ENHANCED)
- **Column**: `Date` (first date column)
- **Values**: Various date ranges
- **Single-select**: Only one range at a time
- **Tables**: All tables with date columns (including notifications)
- **"All Time"**: Now appears FIRST in the list

### 5. Search Filter
- **Scope**: All columns except `Actions`
- **Case-insensitive**: ✅
- **Real-time**: ✅
- **Multi-term**: ✅
- **Tables**: All tables

## Date Range Options (ENHANCED)

| Option | Description | Range Calculation |
|--------|-------------|-------------------|
| **All Time** | All records | No filtering (FIRST in list) |
| **This Week** | Current calendar week | Start of week to today |
| **Week** | Last 7 days | 7 days ago to today |
| **MTD** | Month to date | Start of month to today |
| **YTD** | Year to date | Start of year to today |
| **Year** | Last 365 days | 365 days ago to today |
| **30 Days** | Last 30 days | 30 days ago to today |
| **60 Days** | Last 60 days | 60 days ago to today |

## 🛠️ Implementation Guide for New Pages

### Step 1: Define Page-Specific Filter Functions

```javascript
// In your page's JavaScript
let allData = [];
let filteredData = [];

// Setup filter functions
function setupFilterFunctions() {
  // Account filter (if applicable)
  window.filterByAccount = function(accountNames) {
    if (accountNames.includes('All')) {
      filteredData = [...allData];
    } else {
      filteredData = allData.filter(item => 
        accountNames.includes(item.account_name)
      );
    }
    updateTable(filteredData);
  };
  
  // Search filter
  window.searchData = function(searchTerm) {
    if (!searchTerm.trim()) {
      filteredData = [...allData];
    } else {
      const term = searchTerm.toLowerCase();
      filteredData = allData.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(term)
        )
      );
    }
    updateTable(filteredData);
  };
  
  // Reset filters
  window.resetFilters = function() {
    filteredData = [...allData];
    updateTable(filteredData);
  };
}
```

### Step 2: Connect to Global Filter System

```javascript
// In header-system.js, add calls to your functions
function applyAccountFilter() {
  const selectedAccounts = getSelectedAccounts();
  
  // Call page-specific function
  if (window.filterByAccount) {
    window.filterByAccount(selectedAccounts);
  }
}

function applySearchFilter(searchTerm) {
  if (window.searchData) {
    window.searchData(searchTerm);
  }
}

function clearAllFilters() {
  if (window.resetFilters) {
    window.resetFilters();
  }
}
```

### Step 3: Table Layout with Responsive Design

```css
/* Responsive table with fixed column widths */
#yourTable {
  width: 100% !important;
  table-layout: fixed !important;
}

/* Column width distribution (must total 100%) */
#yourTable th:nth-child(1) { width: 20%; } /* Name */
#yourTable th:nth-child(2) { width: 10%; } /* Type */
#yourTable th:nth-child(3) { width: 15%; } /* Amount */
#yourTable th:nth-child(4) { width: 15%; } /* Date */
#yourTable th:nth-child(5) { width: 20%; } /* Notes */
#yourTable th:nth-child(6) { width: 20%; } /* Actions */

/* Action buttons styling */
#yourTable td:last-child .btn {
  width: 32px !important;
  height: 32px !important;
  margin: 0 3px !important;
  font-size: 0.8rem !important;
}
```

### Step 4: State Persistence

```javascript
// Save filter state
function saveFilterState() {
  const state = {
    searchTerm: document.getElementById('searchInput')?.value || '',
    selectedFilters: getSelectedFilters()
  };
  localStorage.setItem('yourPage_filter_state', JSON.stringify(state));
}

// Restore filter state
function restoreFilterState() {
  const saved = localStorage.getItem('yourPage_filter_state');
  if (saved) {
    const state = JSON.parse(saved);
    applyFilterState(state);
  }
}
```

### Step 5: Summary Statistics (Optional)

```javascript
function updateSummaryStats(data) {
  const totalCount = data.length;
  const activeCount = data.filter(item => item.status === 'active').length;
  const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);
  
  document.getElementById('totalCount').textContent = totalCount;
  document.getElementById('activeCount').textContent = activeCount;
  document.getElementById('totalValue').textContent = `₪${totalValue.toLocaleString()}`;
}
```

## 📋 Checklist for New Page Implementation

- [ ] Define page-specific filter functions
- [ ] Connect to global filter system in header-system.js
- [ ] Implement responsive table layout with proper column widths
- [ ] Add action buttons with proper styling
- [ ] Implement state persistence (localStorage)
- [ ] Add summary statistics (if applicable)
- [ ] Test all filter combinations
- [ ] Verify responsive design on mobile
- [ ] Test state restoration on page reload
| **90 Days** | Last 90 days | 90 days ago to today |
| **Previous Week** | Previous week | Previous calendar week |
| **Previous Month** | Previous month | Previous calendar month |
| **Previous Year** | Previous year | Previous calendar year |

## Integration Guide

### 1. HTML Structure
```html
<!-- Table container with specific ID -->
<div id="tradesContainer" class="table-responsive">
    <table>
        <thead>
            <tr>
                <th>Status</th>  <!-- Status filter column -->
<th>Type</th>     <!-- Type filter column -->
<th>Account</th>   <!-- Account filter column -->
<th>Date</th>   <!-- Date filter column -->
<th>Actions</th>  <!-- Excluded from search -->
            </tr>
        </thead>
        <tbody>
            <!-- Table rows with data attributes -->
            <tr>
                <td data-status="Open">Open</td>
<td data-investment-type="Swing">Swing</td>
                <td data-account="Trading Account 1">Trading Account 1</td>
                <td data-created-at="2025-08-28">2025-08-28</td>
                <td>Actions</td>
            </tr>
        </tbody>
    </table>
</div>
```

### 2. Required CSS
```css
/* Fixed widths to prevent layout shifts */
.filter-toggle {
    width: 140px;
    justify-content: space-between;
}

.selected-value {
    min-width: 80px;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.reset-btn, .clear-btn {
    min-width: 30px;
}
```

### 3. JavaScript Integration
```javascript
// No additional JavaScript needed!
// The header system automatically initializes filters
document.addEventListener('DOMContentLoaded', function() {
    const headerSystem = new HeaderSystem();
    headerSystem.init();
});
```

## API Reference

### Core Functions

#### `applyTableFilter(filterType, selectedValues)`
Universal filter application function.

**Parameters:**
- `filterType` (string): 'status', 'type', 'account', 'date', 'search'
- `selectedValues` (array): Array of selected values

**Example:**
```javascript
// Apply status filter
applyTableFilter('status', ['Open', 'Closed']);

// Apply date filter
applyTableFilter('date', ['This Week']);

// Apply search filter
applyTableFilter('search', ['AAPL', 'Apple']);
```

#### `getFilterConfig(filterType)`
Returns configuration for a specific filter type.

**Returns:**
```javascript
{
    columnName: 'Status',
containerIdKeywords: ['status', 'Status'],
    knownContainers: ['tradesContainer', 'alertsContainer'],
    cellValues: ['Open', 'Closed', 'Cancelled'],
    dataField: 'status'
}
```

#### `isDateInRange(dateString, dateRange)`
Checks if a date falls within the specified range.

**Parameters:**
- `dateString` (string): Date in "YYYY-MM-DD" format
- `dateRange` (string): Date range option

**Returns:** boolean

#### `getAllVisibleContainers()`
Returns array of all visible table container IDs.

**Returns:** string[]

#### `showAllRecordsInTable(containerId)`
Shows all records in a specific table.

**Parameters:**
- `containerId` (string): Container ID to show all records

## Filter Behavior

### Multi-Select Logic
For Status and Type filters:
1. Click to select/deselect items
2. "All" is automatically deselected when specific items are chosen
3. "All" is re-selected when no specific items remain
4. Multiple items can be selected simultaneously

### Filter Reset Logic
1. **Reset Button (↻)**: Fetches user preferences from server and applies them
2. **Clear Button (×)**: Clears all active filters and shows all records
3. **Preference Integration**: Uses `/api/v1/preferences/` endpoint

### Account Filter Logic
1. **Dynamic Loading**: Accounts loaded from `/api/v1/accounts/`
2. **Caching**: Accounts cached in localStorage for performance
3. **Default Selection**: Uses user preferences for default account
4. **ID Matching**: Matches by account ID from preferences

### Date Filter Logic (ENHANCED)
1. **"All Time" First**: Appears first in the list for easy access
2. **Smart Calculations**: All date ranges calculate correctly
3. **Notifications Support**: Works on notifications table
4. **Hebrew Display**: Shows date ranges in Hebrew format

## Debugging

### Console Logging
The system provides comprehensive logging with emoji indicators:

- `🔄` - Function calls and operations
- `✅` - Successful operations
- `⚠️` - Warnings and fallbacks
- `❌` - Errors and failures
- `🔍` - Debug information

### Debug Commands
```javascript
// Check filter states
console.log('Filter states:', {
    status: window.selectedStatusesForFilter,
    type: window.selectedTypesForFilter,
    account: window.selectedAccountsForFilter,
    date: window.selectedDateRangeForFilter,
    search: window.searchTextForFilter
});

// Check visible containers
console.log('Visible containers:', window.getAllVisibleContainers());

// Test filter application
window.applyTableFilter('status', ['Open']);

// Check filter configuration
console.log('Status filter config:', window.getFilterConfig('status'));
```

## Troubleshooting

### Common Issues

#### Filters Not Working
1. **Check container ID**: Must match supported list
2. **Verify column headers**: Must match expected text exactly
3. **Check console errors**: Look for JavaScript errors
4. **Ensure file loading**: Verify header-system.js is loaded

#### Date Filter Issues (FIXED)
1. **Date format**: Must be "YYYY-MM-DD"
2. **Column position**: Date column must be first date column
3. **Container inclusion**: Ensure notificationsContainer is included
4. **"All Time" position**: Now appears FIRST in the list
5. **Date calculations**: All ranges now calculate correctly

#### Account Filter Issues
1. **Server response**: Check if `/api/v1/accounts/` returns data
2. **Name matching**: Verify account names match between server and table
3. **LocalStorage**: Check for cached account data

#### Multi-Select Issues
1. **"All" item**: Ensure it exists in filter menu
2. **Click handlers**: Verify they're properly attached
3. **JavaScript errors**: Check console for errors

### Performance Tips
1. **Use container IDs**: Specific IDs improve performance
2. **Limit table size**: Large tables may impact performance
3. **Cache accounts**: localStorage caching improves account filter performance
4. **Debounced search**: Search is automatically debounced

## Migration from Version 3.x

### Breaking Changes
1. **File removal**: `simple-filter.js` and `filter-system.js` removed
2. **Function changes**: Old filter functions replaced with `applyTableFilter()`
3. **Initialization**: Automatic initialization, no manual setup required
4. **Account handling**: Now uses server data instead of static options

### Migration Steps
1. **Remove old files**: Delete references to old filter files
2. **Update container IDs**: Ensure they match new convention
3. **Verify headers**: Check column headers match expected text
4. **Test functionality**: Verify all filters work correctly

## Future Enhancements

### Planned Features
1. **Filter persistence**: Save filter state across sessions
2. **Filter templates**: Predefined filter configurations
3. **Advanced combinations**: More sophisticated filter logic
4. **Export/import**: Filter settings export/import
5. **Analytics**: Filter usage tracking

### Technical Improvements
1. **Performance**: Optimize filtering algorithms
2. **Memory**: Reduce memory usage for large datasets
3. **Accessibility**: Improve keyboard navigation
4. **Mobile**: Enhance mobile filter experience
5. **Testing**: Add comprehensive test suite

---

**Last Updated**: August 28, 2025  
**Version**: 4.1 (Enhanced Date Filtering)  
**Maintainer**: TikTrack Development Team
