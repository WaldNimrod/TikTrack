# TikTrack JavaScript Organization Documentation

## Overview
The TikTrack JavaScript system is organized with a modular architecture that promotes code reusability, maintainability, and consistency across all modules. The system includes global utilities, page-specific modules, and centralized systems for common functionality.

## Architecture Overview

### File Structure
```
trading-ui/scripts/
├── main.js                    # General utilities and functions
├── warning-system.js          # Centralized warning modal system
├── translation-utils.js       # Global translation utilities
├── header-system.js          # Header navigation and menu management
├── simple-filter.js          # Unified filtering system
├── table-mappings.js         # Table column mappings
├── accounts.js               # Accounts page functionality
├── alerts.js                 # Alerts page functionality
├── cash_flows.js             # Cash flows page functionality ✅ RECENTLY COMPLETED
├── notes.js                  # Notes page functionality
├── executions.js             # Executions page functionality
├── tickers.js                # Tickers page functionality
├── trades.js                 # Trades page functionality
├── planning.js               # Planning page functionality
├── database.js               # Database display functionality
├── db-extradata.js           # Extra data management
├── constraints.js            # Constraints management
├── designs.js                # Designs page functionality
├── research.js               # Research page functionality
├── preferences.js            # Preferences management

```

### Module Categories

#### 1. Global Systems ✅ **RECENTLY ENHANCED**
- **`main.js`**: General utilities, number formatting, global functions
- **`warning-system.js`**: Centralized modal system for confirmations and warnings
- **`translation-utils.js`**: Global translation utilities for consistent text display
- **`header-system.js`**: Header navigation and menu management
- **`simple-filter.js`**: Unified filtering system across all pages

#### 2. Page-Specific Modules
- **CRUD Modules**: `accounts.js`, `alerts.js`, `cash_flows.js`, `notes.js`
- **Trading Modules**: `executions.js`, `tickers.js`, `trades.js`, `planning.js`
- **System Modules**: `database.js`, `db-extradata.js`, `constraints.js`
- **Utility Modules**: `designs.js`, `research.js`, `preferences.js`

#### 3. Support Modules
- **`table-mappings.js`**: Column mappings for table rendering
- **`styles.css`**: Global styles and page-specific themes

## Global Systems

### 1. Warning System ✅ **RECENTLY ENHANCED**
```javascript
// File: warning-system.js
// Purpose: Centralized modal system for confirmations and warnings

// Show delete warning
window.showDeleteWarning = function(message, onConfirm) {
    showWarning({
        title: 'Delete Confirmation',
        message: message,
        type: 'delete',
        onConfirm: onConfirm
    });
};

// Show linked items warning
window.showLinkedItemsWarning = function(message, linkedItems, onConfirm) {
    // Implementation for linked items warning
};

// Show validation warning
window.showValidationWarning = function(message, fieldName) {
    // Implementation for validation warning
};
```

**Features**:
- Centralized modal management
- Global callback management
- Consistent UI across all modules
- Enhanced error handling and user feedback
- Integration with all page modules

### 2. Translation System ✅ **RECENTLY ENHANCED**
```javascript
// File: translation-utils.js
// Purpose: Global translation utilities for consistent text display

// Alert condition translation
function translateAlertCondition(condition) {
    const translations = {
        'price': 'Price',
'change': 'Change',
        'ma': 'Moving Average',
'volume': 'Volume'
    };
    return translations[condition] || condition;
}

// Trade status translation
function translateTradeStatus(status) {
    const translations = {
        'open': 'Open',
'closed': 'Closed',
'pending': 'Pending',
'cancelled': 'Cancelled'
    };
    return translations[status] || status;
}

// Currency display formatting
function getCashFlowCurrencyDisplay(currencyId) {
    const currency = currencies.find(c => c.id === currencyId);
    return currency ? `${currency.symbol} - ${currency.name}` : 'Not Selected';
}
```

**Features**:
- Consistent text translation across all modules
- Currency display formatting
- Number formatting utilities
- Error handling with fallbacks

### 3. Number Formatting System
```javascript
// File: main.js
// Purpose: Global number and currency formatting

function formatNumberWithCommas(number) {
    if (number === null || number === undefined) return '0';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatCurrencyWithCommas(amount, currency = '') {
    const formattedAmount = formatNumberWithCommas(amount);
    return currency ? `${formattedAmount} ${currency}` : formattedAmount;
}

function colorAmountByValue(amount) {
    if (amount > 0) return 'text-success';
    if (amount < 0) return 'text-danger';
    return 'text-muted';
}
```

## Page-Specific Modules

### 1. Cash Flows Module ✅ **RECENTLY COMPLETED**
```javascript
// File: cash_flows.js
// Purpose: Complete cash flow management functionality

// Load cash flows from server
async function loadCashFlows() {
    try {
        const response = await fetch('/api/v1/cash_flows/');
        const cashFlows = await response.json();
        renderCashFlowsTable(cashFlows);
    } catch (error) {
        console.error('Error loading cash flows:', error);
        window.showErrorNotification('Error loading cash flows');
    }
}

// Render cash flows table
function renderCashFlowsTable(cashFlows) {
    const tbody = document.getElementById('cashFlowsTableBody');
    tbody.innerHTML = '';
    
    cashFlows.forEach(cashFlow => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cashFlow.account_name}</td>
            <td>${translateAlertCondition(cashFlow.type)}</td>
            <td class="${colorAmountByValue(cashFlow.amount)}">
                ${formatCurrencyWithCommas(cashFlow.amount)}
            </td>
            <td>${cashFlow.date}</td>
            <td>${getCashFlowCurrencyDisplay(cashFlow.currency_id)}</td>
            <td>${cashFlow.description}</td>
        `;
        tbody.appendChild(row);
    });
}

// Show delete warning with centralized system
function showDeleteCashFlowModal(id) {
    window.showDeleteWarning(
        'Are you sure you want to delete this cash flow?',
        () => confirmDeleteCashFlow(id)
    );
}
```

**Features**:
- Full CRUD operations
- Account linking with validation
- Currency support with proper defaults
- Date handling with SQLite compatibility
- Type validation (income, expense, fee, tax, interest)
- Source tracking (manual, automatic)
- Centralized warning system integration
- Proper form validation and error handling

### 2. Accounts Module
```javascript
// File: accounts.js
// Purpose: Account management functionality

// Load accounts from server
async function loadAccounts() {
    try {
        const response = await fetch('/api/v1/accounts/');
        const accounts = await response.json();
        renderAccountsTable(accounts);
    } catch (error) {
        console.error('Error loading accounts:', error);
        window.showErrorNotification('Error loading accounts');
    }
}

// Render accounts table
function renderAccountsTable(accounts) {
    const tbody = document.getElementById('accountsTableBody');
    tbody.innerHTML = '';
    
    accounts.forEach(account => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${account.name}</td>
            <td class="${colorAmountByValue(account.balance)}">
                ${formatCurrencyWithCommas(account.balance, account.currency)}
            </td>
            <td>${translateTradeStatus(account.status)}</td>
        `;
        tbody.appendChild(row);
    });
}
```

### 3. Alerts Module
```javascript
// File: alerts.js
// Purpose: Alert management functionality

// Load alerts from server
async function loadAlerts() {
    try {
        const response = await fetch('/api/v1/alerts/');
        const alerts = await response.json();
        renderAlertsTable(alerts);
    } catch (error) {
        console.error('Error loading alerts:', error);
        window.showErrorNotification('Error loading alerts');
    }
}

// Render alerts table
function renderAlertsTable(alerts) {
    const tbody = document.getElementById('alertsTableBody');
    tbody.innerHTML = '';
    
    alerts.forEach(alert => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${alert.account_name}</td>
            <td>${translateAlertCondition(alert.condition_attribute)}</td>
            <td>${translateTradeStatus(alert.status)}</td>
            <td>${alert.message}</td>
        `;
        tbody.appendChild(row);
    });
}
```

## Code Organization Principles

### 1. Function Naming Conventions
```javascript
// Page-specific functions: [pageName][Action]
function loadCashFlows() { /* ... */ }
function renderCashFlowsTable() { /* ... */ }
function showAddCashFlowModal() { /* ... */ }

// Global functions: [action][Entity]
function formatNumberWithCommas() { /* ... */ }
function translateAlertCondition() { /* ... */ }
function showDeleteWarning() { /* ... */ }
```

### 2. Error Handling
```javascript
// Consistent error handling pattern
async function apiCall() {
    try {
        const response = await fetch('/api/endpoint/');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        window.showErrorNotification('Error in operation');
        throw error;
    }
}
```

### 3. Event Handling
```javascript
// Consistent event handling pattern
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page
    loadData();
    setupEventListeners();
});

function setupEventListeners() {
    // Add event listeners
    document.getElementById('addButton').addEventListener('click', showAddModal);
    document.getElementById('refreshButton').addEventListener('click', loadData);
}
```

## Integration Patterns

### 1. Global System Integration
```javascript
// Import global systems
// warning-system.js, translation-utils.js, main.js

// Use global functions
window.showDeleteWarning(message, callback);
translateAlertCondition(condition);
formatCurrencyWithCommas(amount, currency);
```

### 2. API Integration
```javascript
// Consistent API pattern
const API_BASE = '/api/v1/';

async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    const response = await fetch(url, config);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
}
```

### 3. UI Integration
```javascript
// Consistent UI pattern
function renderTable(data, tableId, renderRow) {
    const tbody = document.getElementById(tableId);
    tbody.innerHTML = '';
    
    data.forEach(item => {
        const row = renderRow(item);
        tbody.appendChild(row);
    });
}
```

## Recent Improvements ✅ **RECENTLY ENHANCED**

### System Enhancements
1. **Warning System**: Centralized modal system for confirmations
2. **Translation System**: Global translation utilities
3. **Page Styling**: Consistent gradient backgrounds
4. **Error Handling**: Improved error messages and logging

### Cash Flows Module
1. **Currency Integration**: Proper currency_id handling with defaults
2. **Date Compatibility**: SQLite-compatible date handling
3. **Type Validation**: Enhanced type constraint management
4. **Source Tracking**: Manual/automatic source differentiation
5. **Form Validation**: Comprehensive client and server validation

### Technical Improvements
1. **Performance**: Optimized modal rendering and event handling
2. **Accessibility**: Improved keyboard navigation and screen reader support
3. **Mobile Support**: Enhanced mobile responsiveness
4. **Code Quality**: Improved code organization and documentation

## Best Practices

### 1. Code Organization
- **Modular Design**: Keep modules self-contained
- **Global Utilities**: Use shared functions for common operations
- **Consistent Naming**: Follow established naming conventions
- **Error Handling**: Implement comprehensive error handling
- **Documentation**: Comment complex logic and functions

### 2. Performance
- **Lazy Loading**: Load data on demand
- **Event Delegation**: Use efficient event handling
- **DOM Manipulation**: Optimize DOM updates
- **Memory Management**: Proper cleanup and disposal

### 3. Maintainability
- **Clear Structure**: Organize code logically
- **Consistent Patterns**: Use established patterns
- **Documentation**: Document all functions and modules
- **Testing**: Test thoroughly before deployment

## Future Enhancements

### Planned Improvements
1. **Advanced Filtering**: Implement complex filtering capabilities
2. **Sorting System**: Add column sorting functionality
3. **Real-time Updates**: Implement WebSocket connections
4. **Offline Support**: Add offline functionality
5. **Progressive Web App**: PWA capabilities

### Technical Debt
1. **Testing Coverage**: Need comprehensive testing suite
2. **Performance Monitoring**: Implement performance monitoring
3. **Code Quality**: Add code quality tools
4. **Documentation**: Enhance technical documentation

---

**Last Updated**: 2025-01-26  
**Maintainer**: TikTrack Development Team
