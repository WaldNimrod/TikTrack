## Overview

This document describes the CSS architecture for the TikTrack frontend, focusing on the new unified header system and filter components.

## New Header System Architecture

### Unified Header System (`header-system.js` + `header-system.css`)

The new header system is completely independent and does not rely on the old `app-header`. It creates a new `unified-header` element with its own menu and filters.

#### Key Features:
- **Independent Operation**: Works without the old app-header
- **Unified Design**: Consistent styling across all pages
- **Smart Filters**: Adaptive filtering system that works with any table
- **Responsive Design**: Mobile-friendly layout
- **State Persistence**: Saves filter states and UI preferences

#### Components:

##### 1. Header Structure
```html
<div id="unified-header">
  <div class="header-top">
    <!-- Navigation Menu -->
    <div class="header-nav">...</div>
    
    <!-- Logo Section -->
    <div class="logo-section">...</div>
    
    <!-- Filter Toggle Button -->
    <div class="filter-toggle-section">...</div>
  </div>
  
  <!-- Filter Area -->
  <div class="header-filters">
    <div class="filters-container">
      <!-- Status Filter -->
      <!-- Type Filter -->
      <!-- Account Filter -->
      <!-- Date Range Filter -->
      <!-- Search Filter -->
      <!-- Reset Button -->
      <!-- Clear Button -->
    </div>
  </div>
</div>
```

##### 2. Navigation Menu
- **Home**: Dashboard link
- **Planning**: Trade planning section
- **Trades**: Trade tracking section
- **Research**: Market research section
- **Settings Dropdown**: 
  - Accounts management
  - Notes
  - Alerts
  - Preferences
  - Database management
  - Cash flows
  - Currencies
  - Tickers
  - Executions
  - Trade plans

##### 3. Filter System
The filter system includes:

###### Status Filter
- Options: Open, Closed, Canceled
- Multi-select capability
- Visual indicators for selected items

###### Type Filter
- Options: Swing, Investment, Passive
- Multi-select capability
- Dynamic text updates

###### Account Filter
- Dynamically loaded from database
- Multi-select capability
- Real-time updates
- **Uniform styling** with other filters

###### Date Range Filter
- Options: Today, Yesterday, This Week, Last Week, Last Month, 3 Months, MTD, YTD, 30 Days, 60 Days, 90 Days, Year, Previous Year, All Time
- Single-select (exclusive)
- Date calculation logic

###### Search Filter
- Real-time text search
- Clear button functionality
- Searches across all table columns

###### Reset Button (↻)
- Clears all active filters
- Resets search input
- Updates UI state
- **Animation**: 180° rotation

###### Clear Button (×)
- Closes all open filter menus
- Resets active button states
- **Animation**: Scale effect

#### CSS Architecture

##### 1. Base Styles (`header-system.css`)
```css
#unified-header {
  background: var(--apple-bg-elevated);
  border-bottom: 1px solid var(--apple-border-light);
  box-shadow: var(--apple-shadow-light);
  position: sticky;
  top: 0;
  z-index: 1000;
}
```

##### 2. Filter Styles
```css
#unified-header .filter-menu {
  position: absolute !important;
  top: 100% !important;
  right: 0 !important;
  background: white !important;
  border: 1px solid #e8e8e8 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  min-width: 180px !important;
  z-index: 10001 !important;
  display: none;
  margin-top: 5px;
  padding: 0.5rem 0;
}

#unified-header .filter-menu.show {
  display: block !important;
}
```

##### 3. Filter Item Styles
```css
#statusFilterMenu .status-filter-item {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0.4rem 1rem !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  font-size: 0.9rem !important;
  border-bottom: 1px solid #f0f0f0 !important;
  background: white !important;
  color: #333 !important;
}

#statusFilterMenu .status-filter-item.selected {
  background-color: rgba(40, 167, 69, 0.08) !important;
  color: #28a745 !important;
  border: none !important;
  font-weight: 500 !important;
  box-shadow: 0 1px 3px rgba(40, 167, 69, 0.2) !important;
}
```

##### 4. Account Filter Specific Styles
```css
#accountFilterMenu .account-filter-item {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0.4rem 1rem !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  font-size: 0.9rem !important;
  border-bottom: 1px solid #f0f0f0 !important;
  background: white !important;
  color: #333 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif !important;
}
```

##### 5. Action Button Styles
```css
/* Reset Button */
#unified-header .reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: #28a745;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

#unified-header .reset-btn:hover {
  background: #218838;
  transform: rotate(180deg);
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
}

/* Clear Button */
#unified-header .clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: #ff9c05;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

#unified-header .clear-btn:hover {
  background: #e68900;
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(255, 156, 5, 0.3);
}

/* Filter Toggle Button */
#unified-header .filter-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: white;
  border: none;
  border-radius: 50%;
  color: #ff9c05;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -100px;
  z-index: 1001;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

#unified-header .filter-toggle-btn:hover {
  background: #f8f9fa;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateX(-50%) scale(1.05);
}
```

##### 2. Navigation Styles
```css
#unified-header .tiktrack-nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: #333333;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 600;
}

#unified-header .tiktrack-nav-link:hover {
  background: var(--apple-bg-secondary);
  color: #333333;
}

#unified-header .tiktrack-nav-link.active {
  background: #28a745;
  color: white;
  font-weight: 700;
}

#unified-header .nav-text {
  font-weight: 600;
  color: #333333;
}

#unified-header .tiktrack-nav-link.active .nav-text {
  color: white;
  font-weight: 700;
}

#unified-header .tiktrack-dropdown-item {
  display: block;
  padding: 0.5rem 1rem;
  color: #333333;
  text-decoration: none;
  transition: background-color 0.2s ease;
  font-weight: 500;
}

#unified-header .tiktrack-dropdown-item:hover {
  background: var(--apple-bg-secondary);
  color: #333333;
}

#unified-header .tiktrack-dropdown-item.active {
  background: #28a745;
  color: white;
  font-weight: 600;
}
```

#### JavaScript Architecture

##### 1. HeaderSystem Class
```javascript
class HeaderSystem {
  constructor() {
    this.isInitialized = false;
    this.filterSystem = null;
  }

  init() {
    this.createHeader();
    this.initFilterSystem();
    this.loadAccountsForFilter();
    this.setupEventListeners();
  }
}
```

##### 2. SimpleFilter Class
```javascript
class SimpleFilter {
  constructor() {
    this.currentFilters = {
      status: [],
      type: [],
      account: [],
      search: ''
    };
  }

  updateFilter(filterType, value) {
    // Update filter logic
  }

  applyFilters() {
    // Apply filters to tables
  }
}
```

##### 3. Global Functions
```javascript
// Filter toggle functions
window.toggleStatusFilter = function() { ... }
window.toggleTypeFilter = function() { ... }
window.toggleAccountFilter = function() { ... }
window.toggleDateRangeFilter = function() { ... }

// Filter selection functions
window.selectStatusOption = function(status) { ... }
window.selectTypeOption = function(type) { ... }
window.selectAccountOption = function(account) { ... }
window.selectDateRangeOption = function(dateRange) { ... }

// Filter close functions
window.closeStatusFilter = function() { ... }
window.closeTypeFilter = function() { ... }
window.closeAccountFilter = function() { ... }
window.closeDateRangeFilter = function() { ... }

// Action button functions
window.resetAllFilters = function() { ... }
window.clearAllFilters = function() { ... }
```

#### State Management

##### 1. Local Storage
- `headerState`: Header collapse state
- `filtersSectionOpen`: Filter section visibility
- `filterStates`: Individual filter selections

##### 2. Filter State Structure
```javascript
{
  status: ['Open', 'Closed'],
  type: ['Swing', 'Investment'],
  account: ['Main Account'],
  dateRange: ['This Week'],
  search: 'AAPL'
}
```

#### Responsive Design

##### Mobile Breakpoints
```css
@media (max-width: 768px) {
  #unified-header .header-filters {
    padding: 1rem;
  }

  #unified-header .filters-container {
    flex-direction: column;
    align-items: stretch;
  }

  #unified-header .filter-group {
    width: 100%;
  }
}
```

#### Integration Points

##### 1. Table Integration
The filter system automatically detects and filters tables with IDs:
- `tradesTable`
- `testTable`
- Excludes: `notificationsTable`

##### 2. Account Integration
```javascript
window.updateAccountFilterMenu = function(accounts) {
  if (window.headerSystem) {
    window.headerSystem.updateAccountFilter(accounts);
  }
};
```

#### Testing

##### Test Page: `test-header-only.html`
- Standalone testing environment
- No dependency on old app-header
- Debug information display
- Multiple test tables
- Real-time status monitoring

#### Usage Instructions

##### 1. Basic Implementation
```html
<!-- Include CSS -->
<link rel="stylesheet" href="styles/header-system.css">

<!-- Include JavaScript -->
<script src="scripts/header-system.js"></script>

<!-- Automatic initialization -->
<script>
document.addEventListener('DOMContentLoaded', () => {
  if (window.headerSystem && !window.headerSystem.isInitialized) {
    window.headerSystem.init();
  }
});
</script>
```

##### 2. Custom Filter Integration
```javascript
// Update account filter with real data
window.updateAccountFilterMenu([
  { id: 1, name: 'Main Account' },
  { id: 2, name: 'Secondary Account' }
]);
```

##### 3. Filter Event Handling
```javascript
// Listen for filter changes
if (window.filterSystem) {
  window.filterSystem.updateFilter('status', ['Open']);
}
```

#### Performance Considerations

##### 1. CSS Optimization
- Specific selectors to avoid conflicts
- Minimal use of `!important`
- Efficient positioning and layout

##### 2. JavaScript Optimization
- Event delegation for dynamic elements
- Debounced search input
- Efficient DOM queries

##### 3. Memory Management
- Proper cleanup of event listeners
- State persistence optimization
- Garbage collection friendly

#### Browser Compatibility

##### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

##### CSS Features Used
- CSS Grid and Flexbox
- CSS Custom Properties (variables)
- CSS Transitions and Transforms
- CSS Position: sticky

#### Future Enhancements

##### Planned Features
1. **Advanced Date Picker**: Custom date range selection
2. **Filter Presets**: Save and load filter combinations
3. **Export Filtered Data**: Export filtered results
4. **Keyboard Navigation**: Full keyboard accessibility
5. **Filter Analytics**: Usage statistics and insights

##### Technical Improvements
1. **Web Components**: Convert to custom elements
2. **TypeScript**: Add type safety
3. **State Management**: Implement Redux-like pattern
4. **Testing Framework**: Add comprehensive unit tests
5. **Performance Monitoring**: Add performance metrics

## Conclusion

The new header system provides a modern, responsive, and feature-rich interface for the TikTrack application. It maintains backward compatibility while offering enhanced functionality and improved user experience.

The modular architecture allows for easy maintenance and future enhancements, while the comprehensive documentation ensures smooth development and deployment processes.
