# TikTrack Header System Documentation

## Overview
The TikTrack Header System is a comprehensive navigation and filtering solution that provides a unified interface across all pages of the application. It includes advanced filtering capabilities, responsive navigation, and seamless integration with the backend API.

## File Location
- **Main File**: `trading-ui/scripts/header-system.js`
- **Version**: 4.1 (August 28, 2025)
- **Status**: **COMPLETE REWRITE** - Removed old filter system, implemented new unified filtering with enhanced date filtering

## System Components

### 1. Navigation System
- **Main Navigation**: Primary navigation menu with dropdown support
- **Active State Management**: Automatic highlighting of current page
- **Responsive Design**: Mobile-friendly navigation interface
- **Dropdown Menus**: Multi-level navigation support

### 2. Unified Filter System (NEW)
- **Multi-Select Filters**: Status and Type filters support multiple selections
- **Dynamic Account Loading**: Accounts loaded from server with caching
- **Advanced Date Filtering**: Smart date range calculations with Hebrew display
- **Universal Search**: Search across all columns except actions
- **Filter Reset/Clear**: Reset to preferences or clear all filters
- **Fixed Width UI**: Prevents layout shifts during filter operations
- **Enhanced Date Logic**: Fixed date range calculations and "כל זמן" positioning

### 3. Filter Display Management
- **Real-time Updates**: Filter display updates automatically
- **Button State Management**: Visual indication of active filters
- **Comprehensive Logging**: Detailed logging for debugging and monitoring
- **Stable UI**: Fixed widths prevent layout jumps

### 4. Integration Components
- **API Integration**: Seamless connection with backend services
- **Preference System**: User-specific filter preferences from server
- **State Management**: Persistent filter and navigation states
- **LocalStorage Caching**: Account data caching for performance

## File Structure
```
trading-ui/
├── scripts/
│   ├── header-system.js          # Main header system (COMPLETELY REWRITTEN)
│   └── console-cleanup.js        # Console management
├── styles/
│   ├── header-system.css         # Header styling (UPDATED)
│   ├── apple-theme.css           # Base theme
│   └── styles.css                # General styles (UPDATED)
└── config/
    └── preferences.json          # Default preferences
```

## Key Features

### 1. Advanced Filter System (NEW ARCHITECTURE)
- **Universal Table Filtering**: Single `applyTableFilter()` function works on all tables
- **Smart Column Detection**: Automatically detects relevant columns by header text
- **Multi-Container Support**: Filters apply to all visible table containers including notifications
- **Dynamic Filter Application**: Filters adapt to table structure automatically
- **Comprehensive Logging**: Detailed logs for debugging and monitoring

### 2. Enhanced User Experience
- **Intuitive Interface**: Easy-to-use filter controls
- **Visual Feedback**: Clear indication of active filters
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Keyboard navigation and screen reader support
- **Stable Layout**: Fixed widths prevent UI jumps

### 3. Performance Optimizations
- **Efficient DOM Queries**: Optimized element selection
- **Debounced Search**: Reduced processing during typing
- **Smart Updates**: Only updates necessary elements
- **Memory Management**: Efficient resource usage
- **Account Caching**: LocalStorage for account data

### 4. Robust Error Handling
- **Network Resilience**: Handles API failures gracefully
- **Missing Element Protection**: Continues working with missing elements
- **Fallback Mechanisms**: Provides alternatives when primary features fail
- **Comprehensive Logging**: Detailed error reporting

## Core Methods

### Navigation Management

#### `setActiveMenuItem(currentPath)`
Sets the active navigation item based on current page:
```javascript
setActiveMenuItem(currentPath) {
    // Remove existing active classes
    // Find and highlight current page
    // Handle dropdown items
    // Update visual state
}
```

#### `updateNavigationState()`
Updates navigation state based on current page:
```javascript
updateNavigationState() {
    const currentPath = window.location.pathname;
    this.setActiveMenuItem(currentPath);
    this.saveNavigationState();
}
```

### Filter System (NEW)

#### `applyTableFilter(filterType, selectedValues)`
Universal filter function that works on all tables:
```javascript
function applyTableFilter(filterType, selectedValues) {
    // Get filter configuration
    const filterConfig = getFilterConfig(filterType);
    
    // Get all visible containers
    const visibleContainers = getAllVisibleContainers();
    
    // Apply filter to each relevant table
    for (const containerId of visibleContainers) {
        if (checkIfTableHasColumn(containerId, filterConfig)) {
            applyFilterToTable(containerId, filterConfig, selectedValues);
        } else {
            showAllRecordsInTable(containerId);
        }
    }
}
```

#### `getFilterConfig(filterType)`
Returns filter configuration for different filter types:
```javascript
function getFilterConfig(filterType) {
    const configs = {
        'status': {
            columnName: 'סטטוס',
            containerIdKeywords: ['status', 'סטטוס'],
            knownContainers: ['tradesContainer', 'designsContainer', 'alertsContainer', 'executionsContainer', 'testContainer'],
            cellValues: ['פתוח', 'סגור', 'מבוטל', 'פעיל', 'לא פעיל', 'ממתין'],
            dataField: 'status'
        },
        'type': {
            columnName: 'טיפוס',
            containerIdKeywords: ['type', 'סוג', 'טיפוס'],
            knownContainers: ['tradesContainer', 'designsContainer', 'testContainer'],
            cellValues: ['השקעה', 'סווינג', 'פסיבי', 'קנייה', 'מכירה'],
            dataField: 'investment-type'
        },
        'account': {
            columnName: 'חשבון',
            containerIdKeywords: ['account', 'חשבון'],
            knownContainers: ['tradesContainer', 'alertsContainer', 'executionsContainer', 'testContainer', 'notificationsContainer'],
            cellValues: [], // Dynamic from server
            dataField: 'account'
        },
        'date': {
            columnName: 'תאריך',
            containerIdKeywords: ['date', 'תאריך'],
            knownContainers: ['tradesContainer', 'alertsContainer', 'executionsContainer', 'testContainer', 'notificationsContainer'],
            cellValues: [], // Dates are dynamic
            dataField: 'created-at',
            isFirstOccurrence: true
        },
        'search': {
            columnName: 'search',
            containerIdKeywords: ['search', 'חיפוש'],
            knownContainers: ['tradesContainer', 'alertsContainer', 'executionsContainer', 'testContainer', 'notificationsContainer'],
            cellValues: [],
            dataField: 'search',
            searchAllColumns: true,
            excludeColumns: ['פעולות']
        }
    };
    return configs[filterType];
}
```

#### `isDateInRange(dateString, dateRange)`
Checks if a date falls within the specified range:
```javascript
function isDateInRange(dateString, dateRange) {
    // Converts date string to Date object
    // Calculates range based on dateRange type
    // Returns true if date is within range
    // Handles: היום, אתמול, השבוע, שבוע, MTD, YTD, שנה, etc.
}
```

#### `selectDateRangeOption(dateRange)`
Handles date range selection with Hebrew display:
```javascript
function selectDateRangeOption(dateRange) {
    // Updates display text with calculated date ranges
    // Handles special cases like "כל זמן"
    // Applies filter to all relevant tables
    // Updates visual selection state
}
```

#### `resetFiltersToDefaults()`
Resets filters to user preferences from server:
```javascript
async function resetFiltersToDefaults(defaultStatus, defaultType, defaultAccount, defaultDateRange, defaultSearch) {
    // Fetches preferences from server
    // Translates English values to Hebrew
    // Applies defaults to all filters
    // Updates display text
}
```

## Integration Guide

### 1. Basic Integration
Add the header system to any HTML page:

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="styles/header-system.css">
    <link rel="stylesheet" href="styles/styles.css">
</head>
<body>
    <!-- Header will be injected here -->
    
    <!-- Your page content -->
    <div class="container">
        <div id="tradesContainer" class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>סטטוס</th>
                        <th>סוג</th>
                        <th>חשבון</th>
                        <th>תאריך</th>
                        <!-- other headers -->
                    </tr>
                </thead>
                <tbody>
                    <!-- table rows -->
                </tbody>
            </table>
        </div>
    </div>
    
    <script src="scripts/header-system.js"></script>
    <script>
        // Initialize header system
        document.addEventListener('DOMContentLoaded', function() {
            const headerSystem = new HeaderSystem();
            headerSystem.init();
        });
    </script>
</body>
</html>
```

### 2. Table Structure Requirements

#### Container Naming Convention
Tables must be wrapped in containers with specific IDs:
```html
<div id="[entityName]Container" class="table-responsive">
    <table>
        <!-- table content -->
    </table>
</div>
```

**Supported Container IDs:**
- `tradesContainer` - Trades table
- `alertsContainer` - Alerts table
- `executionsContainer` - Executions table
- `testContainer` - Test table
- `notificationsContainer` - Notifications table (NEW - supports date filtering)
- `designsContainer` - Trade designs table

#### Column Header Requirements
Filters work by matching column headers:

**Status Filter:**
- Header: `סטטוס`
- Values: `פתוח`, `סגור`, `מבוטל`, `פעיל`, `לא פעיל`, `ממתין`

**Type Filter:**
- Header: `סוג` or `טיפוס`
- Values: `השקעה`, `סווינג`, `פסיבי`, `קנייה`, `מכירה`

**Account Filter:**
- Header: `חשבון`
- Values: Dynamic from server (e.g., "Trading Account 1", "Investment Account")

**Date Filter:**
- Header: `תאריך`
- Values: Date strings in format "YYYY-MM-DD"

**Search Filter:**
- Searches all columns except `פעולות` (actions)

### 3. Filter Behavior

#### Multi-Select Filters
Status and Type filters support multiple selections:
- Click to select/deselect items
- "הכול" is automatically deselected when specific items are chosen
- "הכול" is re-selected when no specific items remain

#### Date Filter Options (ENHANCED)
- **כל זמן** - Shows all records (FIRST in list)
- **השבוע** - From start of calendar week to today
- **שבוע** - Last 7 days
- **MTD** - From start of calendar month to today
- **YTD** - From start of calendar year to today
- **שנה** - Last 365 days
- **30 יום**, **60 יום**, **90 יום** - Last X days
- **שבוע קודם**, **חודש קודם**, **שנה קודמת** - Previous periods

#### Account Filter
- Loads accounts dynamically from server
- Caches accounts in localStorage for performance
- Supports default account selection from preferences
- Matches by account ID or name

#### Search Filter
- Searches all columns except actions
- Case-insensitive search
- Supports multiple search terms
- Real-time filtering as you type

### 4. Filter Reset and Clear

#### Reset Button (↻)
- Resets all filters to user preferences from server
- Fetches defaults from `/api/v1/preferences/`
- Translates English values to Hebrew
- Updates all filter displays

#### Clear Button (×)
- Clears all active filters
- Shows all records in all tables
- Resets filter displays to default text

### 5. Debugging and Logging

The system provides comprehensive logging:

```javascript
// Enable debug logging
console.log('🔍 Filter debug info:', {
    selectedStatuses: window.selectedStatusesForFilter,
    selectedTypes: window.selectedTypesForFilter,
    selectedAccounts: window.selectedAccountsForFilter,
    selectedDateRange: window.selectedDateRangeForFilter,
    searchText: window.searchTextForFilter
});
```

**Log Levels:**
- `🔄` - Function calls and operations
- `✅` - Successful operations
- `⚠️` - Warnings and fallbacks
- `❌` - Errors and failures
- `🔍` - Debug information

## Configuration

### Preferences Integration
The system integrates with the backend preferences system:

```json
{
    "user": {
        "defaultStatusFilter": "open",
        "defaultTypeFilter": "investment",
        "defaultAccountFilter": "1",
        "defaultDateRangeFilter": "this_month",
        "defaultSearchFilter": ""
    }
}
```

### CSS Customization
Key CSS classes for customization:

```css
/* Filter toggle buttons */
.filter-toggle {
    width: 140px;
    justify-content: space-between;
}

/* Selected value display */
.selected-value {
    min-width: 80px;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Action buttons */
.reset-btn, .clear-btn {
    min-width: 30px;
}

/* Filter toggle button */
.filter-toggle-btn {
    min-width: 32px;
}
```

## Migration from Old System

### Removed Components
- `simple-filter.js` - Completely removed
- `filter-system.js` - Moved to backup
- Old filter functions - Replaced with unified system

### Breaking Changes
- Filter initialization changed from `initFilterSystem()` to automatic initialization
- Filter application changed from specific functions to `applyTableFilter()`
- Account filter now uses server data instead of static options

### Migration Steps
1. Remove references to old filter files
2. Update table container IDs to match new convention
3. Ensure column headers match expected text
4. Update any custom filter logic to use new API

## Troubleshooting

### Common Issues

#### Filters Not Working
1. Check container ID matches supported list
2. Verify column headers match expected text
3. Check browser console for error messages
4. Ensure header-system.js is loaded

#### Date Filter Issues (FIXED)
1. Verify date format is "YYYY-MM-DD"
2. Check if date column is first date column in table
3. Ensure notificationsContainer is included for notifications table
4. "כל זמן" now appears FIRST in the list
5. Date range calculations are now correct

#### Account Filter Issues
1. Check server returns account data
2. Verify account names match between server and table
3. Check localStorage for cached account data

#### Multi-Select Not Working
1. Check if "הכול" item exists in filter menu
2. Verify click handlers are properly attached
3. Check console for JavaScript errors

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
window.applyTableFilter('status', ['פתוח']);
```

## Version History

### Version 4.1 (August 28, 2025) - CURRENT
- **ENHANCED DATE FILTERING**: Fixed date range calculations and "כל זמן" positioning
- **NOTIFICATIONS SUPPORT**: Added notificationsContainer to date filter
- **IMPROVED LOGIC**: Enhanced date range logic for all options
- **UI STABILITY**: Fixed width elements prevent layout shifts

### Version 4.0 (August 28, 2025)
- **COMPLETE REWRITE** of filter system
- Removed old `simple-filter.js` and `filter-system.js`
- Implemented unified `applyTableFilter()` function
- Added multi-select support for Status and Type filters
- Enhanced date filtering with Hebrew display
- Added account caching with localStorage
- Fixed UI layout stability with fixed widths
- Added comprehensive logging and debugging
- Updated integration guide and documentation

### Version 3.1 (August 26, 2025)
- Enhanced filter system integration
- Improved error handling
- Added comprehensive logging

### Version 3.0 (August 25, 2025)
- Initial unified header system
- Basic filter integration
- Navigation improvements

## Support

For issues or questions:
1. Check browser console for error messages
2. Review this documentation
3. Check filter configuration matches requirements
4. Verify table structure follows conventions
