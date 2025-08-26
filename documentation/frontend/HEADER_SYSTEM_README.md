# TikTrack Header System Documentation

## Overview
The TikTrack header system provides a consistent navigation and user interface across all pages. The system includes a centralized warning system, translation utilities, unified filter system, and responsive design components.

## System Components

### 1. Header Navigation
- **Main Menu**: Primary navigation menu with page links
- **Settings Dropdown**: Secondary navigation and system settings
- **Responsive Design**: Mobile-friendly navigation
- **Active State Management**: Current page highlighting

### 2. Unified Filter System ✅ **NEW COMPREHENSIVE SYSTEM**
- **Purpose**: Centralized filtering system for all data tables across the application
- **File**: `scripts/simple-filter.js`
- **Architecture**: Single filter instance manages all filter types across all pages
- **Features**:
  - **Multi-Type Filtering**: Status, Type, Account, Date Range, and Search filters
  - **Preference-Based Defaults**: Loads default filters from user preferences
  - **Real-Time Updates**: Instant filtering with visual feedback
  - **Cross-Page Consistency**: Same filter behavior across all pages
  - **Persistent State**: Maintains filter state during navigation
  - **Hebrew Translation**: Automatic conversion of English preferences to Hebrew display
  - **Button State Management**: Visual indication of active filters
  - **Error Handling**: Graceful fallback when preferences unavailable

### 3. Warning System ✅ **RECENTLY ENHANCED**
- **Purpose**: Centralized modal system for confirmations and warnings
- **File**: `scripts/warning-system.js`
- **Features**:
  - Delete confirmations with customizable messages
  - Validation warnings with field-specific guidance
  - Linked item warnings for data integrity
  - Consistent UI across all modules
  - Global callback management for actions
- **Recent Improvements**:
  - Enhanced global callback management
  - Improved modal responsiveness
  - Better error handling and user feedback
  - Consistent styling across all modules
  - Integration with Cash Flows module

### 4. Translation System ✅ **RECENTLY ENHANCED**
- **Purpose**: Global translation utilities for consistent text display
- **File**: `scripts/translation-utils.js`
- **Features**:
  - Alert condition translation
  - Trade status translation
  - Currency display formatting
  - Consistent text rendering across modules
- **Recent Additions**:
  - `translateAlertCondition()` function
  - `translateTradeStatus()` function
  - Enhanced currency display utilities

## File Structure

### Core Files
```
trading-ui/
├── scripts/
│   ├── header-system.js      # Header navigation and menu management
│   ├── simple-filter.js      # Unified filter system (NEW)
│   ├── warning-system.js     # Centralized warning modal system
│   ├── translation-utils.js  # Global translation utilities
│   └── main.js              # General utilities and functions
├── styles/
│   ├── header-system.css     # Header and navigation styles
│   └── styles.css           # Global styles and page themes
├── config/
│   └── preferences.json     # Default filter preferences
└── images/
    └── icons/               # Navigation icons and images
```

### Page Integration
- **HTML Structure**: Consistent header structure across all pages
- **JavaScript Loading**: Standardized script loading order
- **CSS Integration**: Unified styling approach
- **Responsive Design**: Mobile-first responsive design

## Unified Filter System Architecture

### Core Class: SimpleFilter
```javascript
class SimpleFilter {
    constructor() {
        this.currentFilters = {
            status: [],
            type: [],
            account: [],
            date: [],
            search: ''
        };
    }
}
```

### Initialization Process
```javascript
// 1. Wait for DOM elements
waitForElements() {
    const headerElement = document.getElementById('unified-header');
    if (!headerElement) {
        setTimeout(() => this.waitForElements(), 100);
        return;
    }
    // Check for filter menus and items
    this.setupEventListeners();
}

// 2. Load default preferences
async initializeDefaultFilters() {
    const response = await fetch('/api/v1/preferences/');
    const preferences = await response.json();
    const userPrefs = preferences.user || preferences.defaults;
    
    this.currentFilters = {
        status: this.convertStatusPreference(userPrefs.defaultStatusFilter),
        type: this.convertTypePreference(userPrefs.defaultTypeFilter),
        account: this.convertAccountPreference(userPrefs.defaultAccountFilter),
        date: this.convertDatePreference(userPrefs.defaultDateRangeFilter),
        search: userPrefs.defaultSearchFilter || ''
    };
}
```

### Preference Conversion System
```javascript
// Convert English preferences to Hebrew display values
convertStatusPreference(preference) {
    switch (preference) {
        case 'open': return ['פתוח'];
        case 'closed': return ['סגור'];
        case 'cancelled': return ['מבוטל'];
        case 'all': default: return [];
    }
}

convertTypePreference(preference) {
    switch (preference) {
        case 'swing': return ['סווינג'];
        case 'investment': return ['השקעה'];
        case 'passive': return ['פסיבי'];
        case 'all': default: return [];
    }
}

convertDatePreference(preference) {
    switch (preference) {
        case 'this_week': return ['השבוע'];
        case 'mtd': return ['MTD'];
        case '30_days': return ['30 יום'];
        case 'all': default: return [];
    }
}
```

### Filter Application Process
```javascript
applyFilters() {
    // Apply filters to all tables on the page
    const tables = ['tradesTable', 'alertsTable', 'accountsTable', 'tickersTable'];
    
    tables.forEach(tableId => {
        const table = document.getElementById(tableId);
        if (table) {
            this.filterTable(table, tableId);
        }
    });
}

filterTable(table, tableId) {
    const rows = table.querySelectorAll('tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        let shouldShow = true;
        
        // Status filter
        if (this.currentFilters.status.length > 0) {
            const rowStatus = this.extractStatusFromRow(row, tableId);
            if (!this.currentFilters.status.includes(rowStatus)) {
                shouldShow = false;
            }
        }
        
        // Type filter
        if (shouldShow && this.currentFilters.type.length > 0) {
            const rowType = this.extractTypeFromRow(row, tableId);
            if (!this.currentFilters.type.includes(rowType)) {
                shouldShow = false;
            }
        }
        
        // Search filter
        if (shouldShow && this.currentFilters.search) {
            const searchText = this.currentFilters.search.toLowerCase();
            const rowText = row.textContent.toLowerCase();
            if (!rowText.includes(searchText)) {
                shouldShow = false;
            }
        }
        
        row.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleCount++;
    });
}
```

### Display Update System
```javascript
updateStatusDisplay() {
    const statusDisplay = document.getElementById('selectedStatus');
    if (!statusDisplay) return;
    
    if (this.currentFilters.status.length === 0) {
        statusDisplay.textContent = 'הכול';
    } else {
        statusDisplay.textContent = this.currentFilters.status.join(', ');
    }
}

updateButtonSelections() {
    // Update visual state of filter buttons
    this.updateStatusButtonSelections();
    this.updateTypeButtonSelections();
    this.updateAccountButtonSelections();
    this.updateDateButtonSelections();
}
```

### Default Preferences Configuration
```json
{
  "defaults": {
    "defaultStatusFilter": "open",
    "defaultTypeFilter": "swing", 
    "defaultAccountFilter": "all",
    "defaultDateRangeFilter": "this_week",
    "defaultSearchFilter": ""
  }
}
```

## Filter System Integration

### HTML Structure Requirements
```html
<!-- Unified Header with Filter Menus -->
<div id="unified-header">
    <!-- Status Filter Menu -->
    <div id="statusFilterMenu">
        <div class="status-filter-item" data-value="הכול">הכול</div>
        <div class="status-filter-item" data-value="פתוח">פתוח</div>
        <div class="status-filter-item" data-value="סגור">סגור</div>
        <div class="status-filter-item" data-value="מבוטל">מבוטל</div>
    </div>
    
    <!-- Type Filter Menu -->
    <div id="typeFilterMenu">
        <div class="type-filter-item" data-value="הכול">הכול</div>
        <div class="type-filter-item" data-value="סווינג">סווינג</div>
        <div class="type-filter-item" data-value="השקעה">השקעה</div>
        <div class="type-filter-item" data-value="פסיבי">פסיבי</div>
    </div>
    
    <!-- Account Filter Menu -->
    <div id="accountFilterMenu">
        <div class="account-filter-item" data-value="הכול">הכול</div>
        <!-- Dynamic account items -->
    </div>
    
    <!-- Date Range Filter Menu -->
    <div id="dateRangeFilterMenu">
        <div class="date-range-filter-item" data-value="כל זמן">כל זמן</div>
        <div class="date-range-filter-item" data-value="השבוע">השבוע</div>
        <div class="date-range-filter-item" data-value="MTD">MTD</div>
        <div class="date-range-filter-item" data-value="30 יום">30 יום</div>
    </div>
</div>

<!-- Filter Display Elements -->
<div id="selectedStatus">הכול</div>
<div id="selectedType">הכול</div>
<div id="selectedAccount">הכול</div>
<div id="selectedDateRange">כל זמן</div>
```

### JavaScript Integration
```javascript
// Initialize filter system
document.addEventListener('DOMContentLoaded', async () => {
    window.simpleFilter = new SimpleFilter();
    await window.simpleFilter.init();
});

// Global filter functions for header system
window.resetAllFilters = async () => {
    if (window.simpleFilter) {
        await window.simpleFilter.resetFilters();
    }
};

window.clearAllFilters = () => {
    if (window.simpleFilter) {
        window.simpleFilter.clearFilters();
    }
};
```

### Event Handling
```javascript
setupEventListeners() {
    // Status filter events
    const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
    statusItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const status = item.getAttribute('data-value');
            item.classList.toggle('selected');
            
            if (item.classList.contains('selected')) {
                if (!this.currentFilters.status.includes(status)) {
                    this.currentFilters.status.push(status);
                }
            } else {
                this.currentFilters.status = this.currentFilters.status.filter(s => s !== status);
            }
            
            this.updateStatusDisplay();
            this.applyFilters();
        });
    });
    
    // Similar setup for type, account, and date filters
}
```

## Filter System Features

### 1. Multi-Table Support
- **Automatic Detection**: Automatically finds and filters all tables on the page
- **Table-Specific Logic**: Different filtering logic for different table types
- **Performance Optimized**: Efficient filtering with minimal DOM manipulation

### 2. Preference Management
- **Server Integration**: Loads preferences from `/api/v1/preferences/`
- **Fallback Handling**: Graceful fallback when server unavailable
- **User-Specific**: Supports user-specific preferences
- **Default Values**: Comprehensive default value system

### 3. Visual Feedback
- **Button States**: Visual indication of selected filter options
- **Display Updates**: Real-time updates of filter display text
- **Count Indicators**: Shows number of visible records
- **Loading States**: Visual feedback during preference loading

### 4. Error Handling
- **Network Errors**: Handles API failures gracefully
- **Missing Elements**: Continues working when elements not found
- **Invalid Data**: Handles malformed preference data
- **Console Logging**: Comprehensive logging for debugging

### 5. Performance Optimizations
- **Debounced Search**: Prevents excessive filtering during typing
- **Efficient DOM Queries**: Optimized element selection
- **Minimal Re-renders**: Only updates necessary elements
- **Memory Management**: Proper cleanup of event listeners

## Integration Examples

### Trades Page Integration
```javascript
// Trades page specific filtering
function filterTradesData(selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm) {
    console.log('🔄 Filtering trades data:', {
        statuses: selectedStatuses,
        types: selectedTypes,
        accounts: selectedAccounts,
        dateRange: selectedDateRange,
        search: searchTerm
    });
    
    // Apply filters to trades data
    const filteredTrades = tradesData.filter(trade => {
        // Status filter
        if (selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
            const statusDisplay = translateTradeStatus(trade.status);
            if (!selectedStatuses.includes(statusDisplay)) {
                return false;
            }
        }
        
        // Type filter
        if (selectedTypes.length > 0 && !selectedTypes.includes('all')) {
            const typeDisplay = translateTradeType(trade.type);
            if (!selectedTypes.includes(typeDisplay)) {
                return false;
            }
        }
        
        // Account filter
        if (selectedAccounts.length > 0 && !selectedAccounts.includes('all')) {
            if (!selectedAccounts.includes(trade.account_name)) {
                return false;
            }
        }
        
        // Search filter
        if (searchTerm) {
            const searchText = searchTerm.toLowerCase();
            const tradeText = `${trade.ticker} ${trade.status} ${trade.type} ${trade.account_name}`.toLowerCase();
            if (!tradeText.includes(searchText)) {
                return false;
            }
        }
        
        return true;
    });
    
    updateTradesTable(filteredTrades);
}
```

### Alerts Page Integration
```javascript
// Alerts page specific filtering
function filterAlertsData(selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm) {
    console.log('🔄 Filtering alerts data:', {
        statuses: selectedStatuses,
        types: selectedTypes,
        accounts: selectedAccounts,
        dateRange: selectedDateRange,
        search: searchTerm
    });
    
    // Apply filters to alerts data
    const filteredAlerts = alertsData.filter(alert => {
        // Status filter
        if (selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
            const statusDisplay = translateAlertStatus(alert.status);
            if (!selectedStatuses.includes(statusDisplay)) {
                return false;
            }
        }
        
        // Type filter
        if (selectedTypes.length > 0 && !selectedTypes.includes('all')) {
            const typeDisplay = translateAlertType(alert.type);
            if (!selectedTypes.includes(typeDisplay)) {
                return false;
            }
        }
        
        // Search filter
        if (searchTerm) {
            const searchText = searchTerm.toLowerCase();
            const alertText = `${alert.ticker} ${alert.condition} ${alert.status}`.toLowerCase();
            if (!alertText.includes(searchText)) {
                return false;
            }
        }
        
        return true;
    });
    
    updateAlertsTable(filteredAlerts);
}
```

## Warning System Architecture

### Modal Management
```javascript
// Show warning modal
window.showWarning({
    title: 'Delete Confirmation',
    message: 'Are you sure you want to delete this item?',
    type: 'delete',
    onConfirm: function() {
        // Confirmation action
    },
    onCancel: function() {
        // Cancellation action
    }
});
```

### Global Callback Management
- **Callback Storage**: Global storage for confirmation/cancellation callbacks
- **Event Handling**: Consistent event handling across all modals
- **Error Recovery**: Graceful error handling for failed operations
- **User Feedback**: Clear feedback for user actions

### Integration Examples

#### Cash Flows Module
```javascript
// Delete cash flow with warning
function showDeleteCashFlowModal(id) {
    window.showDeleteWarning(
        'האם אתה בטוח שברצונך למחוק את תזרים המזומנים הזה?',
        () => confirmDeleteCashFlow(id)
    );
}
```

#### Accounts Module
```javascript
// Delete account with linked items warning
function showDeleteAccountModal(id, linkedItems) {
    if (linkedItems.length > 0) {
        window.showLinkedItemsWarning(
            'לא ניתן למחוק חשבון עם פריטים מקושרים',
            linkedItems,
            () => deleteAccount(id)
        );
    } else {
        window.showDeleteWarning(
            'האם אתה בטוח שברצונך למחוק את החשבון הזה?',
            () => deleteAccount(id)
        );
    }
}
```

## Translation System Architecture

### Global Functions
```javascript
// Alert condition translation
function translateAlertCondition(condition) {
    const translations = {
        'price': 'מחיר',
        'change': 'שינוי',
        'ma': 'ממוצע נע',
        'volume': 'נפח'
    };
    return translations[condition] || condition;
}

// Trade status translation
function translateTradeStatus(status) {
    const translations = {
        'open': 'פתוח',
        'closed': 'סגור',
        'pending': 'ממתין'
    };
    return translations[status] || status;
}
```

### Currency Display
```javascript
// Currency formatting with translation
function getCashFlowCurrencyDisplay(currencyId) {
    const currency = currencies.find(c => c.id === currencyId);
    return currency ? `${currency.symbol} - ${currency.name}` : 'לא נבחר';
}
```

## Styling System

### Page-Specific Themes ✅ **RECENTLY ENHANCED**
- **Color Schemes**: Each page has its own color theme
- **Gradient Backgrounds**: Consistent header styling
- **Component Styling**: Themed buttons, forms, and tables
- **Visual Hierarchy**: Clear information architecture

### CSS Architecture
```css
/* Page-specific styling */
.cash-flows-page .section-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

/* Warning system styling */
.warning-modal {
    z-index: 1050;
    backdrop-filter: blur(5px);
}

.warning-modal .modal-content {
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

/* Filter system styling */
.filter-menu {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 0.5rem;
}

.filter-item {
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.filter-item:hover {
    background-color: #f8f9fa;
}

.filter-item.selected {
    background-color: #007bff;
    color: white;
}
```

## Responsive Design

### Mobile Navigation
- **Hamburger Menu**: Collapsible navigation for mobile devices
- **Touch-Friendly**: Large touch targets for mobile interaction
- **Adaptive Layout**: Responsive grid system
- **Performance**: Optimized for mobile performance

### Desktop Navigation
- **Full Menu**: Complete navigation menu for desktop
- **Hover Effects**: Interactive hover states
- **Keyboard Navigation**: Full keyboard accessibility
- **High Resolution**: Optimized for high-DPI displays

## Integration Guidelines

### Adding New Pages
1. **HTML Structure**: Use consistent header structure
2. **Script Loading**: Include required JavaScript files
3. **CSS Classes**: Apply page-specific CSS classes
4. **Navigation**: Add page to navigation menu
5. **Testing**: Test across different devices and browsers

### Filter System Integration
1. **Include Script**: Add `simple-filter.js` to page
2. **HTML Structure**: Ensure filter menus and display elements exist
3. **Table Integration**: Add table IDs for automatic filtering
4. **Event Handling**: Set up filter event listeners
5. **Testing**: Test all filter combinations and edge cases

### Warning System Integration
1. **Import Script**: Include warning-system.js
2. **Define Callbacks**: Create confirmation/cancellation callbacks
3. **Show Warnings**: Use appropriate warning functions
4. **Handle Responses**: Process user responses appropriately
5. **Error Handling**: Implement proper error handling

### Translation Integration
1. **Import Script**: Include translation-utils.js
2. **Use Functions**: Call appropriate translation functions
3. **Consistent Formatting**: Use consistent text formatting
4. **Fallback Handling**: Provide fallbacks for missing translations
5. **Testing**: Test with different languages and text lengths

## Recent Improvements

### System Enhancements
1. **Unified Filter System**: Comprehensive filtering across all pages
2. **Warning System**: Centralized modal system for confirmations
3. **Translation System**: Global translation utilities
4. **Page Styling**: Consistent gradient backgrounds
5. **Error Handling**: Improved error messages and logging

### Filter System Features
1. **Preference-Based Defaults**: Loads user preferences for default filters
2. **Hebrew Translation**: Automatic conversion of English preferences
3. **Multi-Table Support**: Filters all tables on the page automatically
4. **Real-Time Updates**: Instant filtering with visual feedback
5. **Error Recovery**: Graceful handling of missing elements and data

### Cash Flows Module Integration
1. **Delete Confirmations**: Integrated warning system for deletions
2. **Form Validation**: Enhanced validation with warning system
3. **Error Display**: Improved error message display
4. **User Feedback**: Better user feedback for actions

### Technical Improvements
1. **Performance**: Optimized modal rendering and event handling
2. **Accessibility**: Improved keyboard navigation and screen reader support
3. **Mobile Support**: Enhanced mobile responsiveness
4. **Code Quality**: Improved code organization and documentation

## Future Enhancements

### Planned Improvements
1. **Advanced Filtering**: More sophisticated filter types and combinations
2. **Filter Persistence**: Save filter state across sessions
3. **Animation System**: Smooth transitions and animations
4. **Theme System**: Dynamic theme switching
5. **Accessibility**: Enhanced accessibility features

### Technical Debt
1. **Testing Coverage**: Need comprehensive testing suite
2. **Performance Monitoring**: Implement performance monitoring
3. **Code Quality**: Add code quality tools
4. **Documentation**: Enhance technical documentation

---

**Last Updated**: 2025-01-26  
**Maintainer**: TikTrack Development Team  
**Version**: 3.0 (Unified Filter System)
