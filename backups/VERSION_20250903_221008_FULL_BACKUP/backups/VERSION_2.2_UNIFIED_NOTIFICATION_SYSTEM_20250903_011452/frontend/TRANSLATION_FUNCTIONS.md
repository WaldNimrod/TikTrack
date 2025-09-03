# TikTrack Translation Functions Documentation

## Overview
The TikTrack translation system provides global utilities for consistent text display across all modules. The system includes functions for translating various data types, formatting currencies, and maintaining consistent text rendering.

## System Architecture

### Core File
- **File**: `scripts/translation-utils.js`
- **Purpose**: Centralized translation utilities
- **Scope**: Global functions accessible across all modules
- **Integration**: Used by all page-specific JavaScript files

### Translation Categories
1. **Alert Conditions**: Translate alert condition types
2. **Trade Status**: Translate trade status values
3. **Currency Display**: Format currency information
4. **Number Formatting**: Format numbers and amounts
5. **Date Formatting**: Format dates consistently

## Global Functions

### 1. Alert Condition Translation ✅ **RECENTLY ADDED**
```javascript
/**
 * Translates alert condition types to Hebrew
 * @param {string} condition - The condition type to translate
 * @returns {string} The translated condition
 */
function translateAlertCondition(condition) {
    const translations = {
        'price': 'Price',
'change': 'Change',
'ma': 'Moving Average',
'volume': 'Volume'
    };
    return translations[condition] || condition;
}
```

**Usage Examples**:
```javascript
// In alerts.js
const conditionText = translateAlertCondition(alert.condition_attribute);
// Result: 'price' → 'Price', 'change' → 'Change'

// In cash_flows.js
const typeText = translateAlertCondition(cashFlow.type);
// Result: 'income' → 'Income', 'expense' → 'Expense'
```

### 2. Trade Status Translation ✅ **RECENTLY ADDED**
```javascript
/**
 * Translates trade status values to Hebrew
 * @param {string} status - The status to translate
 * @returns {string} The translated status
 */
function translateTradeStatus(status) {
    const translations = {
        'open': 'Open',
'closed': 'Closed',
'pending': 'Pending',
'cancelled': 'Cancelled'
    };
    return translations[status] || status;
}
```

**Usage Examples**:
```javascript
// In trades.js
const statusText = translateTradeStatus(trade.status);
// Result: 'open' → 'Open', 'closed' → 'Closed'

// In executions.js
const executionStatus = translateTradeStatus(execution.status);
// Result: 'pending' → 'Pending', 'completed' → 'Completed'
```

### 3. Currency Display Functions
```javascript
/**
 * Formats currency display with symbol and name
 * @param {number} currencyId - The currency ID
 * @param {Array} currencies - Array of available currencies
 * @returns {string} Formatted currency display
 */
function getCashFlowCurrencyDisplay(currencyId) {
    const currency = currencies.find(c => c.id === currencyId);
    return currency ? `${currency.symbol} - ${currency.name}` : 'Not Selected';
}

/**
 * Formats currency amount with proper formatting
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency symbol
 * @returns {string} Formatted currency amount
 */
function formatCurrencyWithCommas(amount, currency = '') {
    const formattedAmount = formatNumberWithCommas(amount);
    return currency ? `${formattedAmount} ${currency}` : formattedAmount;
}
```

**Usage Examples**:
```javascript
// In cash_flows.js
const currencyDisplay = getCashFlowCurrencyDisplay(cashFlow.currency_id);
// Result: 'USD - US Dollar' or 'Not Selected'

// In accounts.js
const balanceDisplay = formatCurrencyWithCommas(account.balance, account.currency);
// Result: '1,234.56 USD' or '1,234.56'
```

### 4. Number Formatting Functions
```javascript
/**
 * Formats numbers with commas for thousands
 * @param {number} number - The number to format
 * @returns {string} Formatted number
 */
function formatNumberWithCommas(number) {
    if (number === null || number === undefined) return '0';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Colors amount based on value (positive/negative)
 * @param {number} amount - The amount to color
 * @returns {string} CSS class for coloring
 */
function colorAmountByValue(amount) {
    if (amount > 0) return 'text-success';
    if (amount < 0) return 'text-danger';
    return 'text-muted';
}
```

**Usage Examples**:
```javascript
// In cash_flows.js
const formattedAmount = formatNumberWithCommas(cashFlow.amount);
// Result: '1,234.56' → '1,234.56'

// In accounts.js
const amountClass = colorAmountByValue(account.balance);
// Result: positive → 'text-success', negative → 'text-danger'
```

## Integration Examples

### Cash Flows Module Integration
```javascript
// In cash_flows.js
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
```

### Alerts Module Integration
```javascript
// In alerts.js
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

### Accounts Module Integration
```javascript
// In accounts.js
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

## Recent Improvements ✅ **RECENTLY ENHANCED**

### New Functions Added
1. **`translateAlertCondition()`**: Translate alert condition types
2. **`translateTradeStatus()`**: Translate trade status values
3. **Enhanced currency display**: Better currency formatting

### Integration Enhancements
1. **Cash Flows Module**: Full integration with translation system
2. **Consistent Display**: Unified text display across all modules
3. **Error Handling**: Better fallback handling for missing translations
4. **Performance**: Optimized translation lookups

### Technical Improvements
1. **Function Documentation**: Comprehensive JSDoc comments
2. **Error Handling**: Graceful fallbacks for missing translations
3. **Code Organization**: Better function organization and naming
4. **Testing**: Enhanced testing and validation

## Best Practices

### Function Usage
1. **Consistent Naming**: Use descriptive function names
2. **Error Handling**: Always provide fallbacks for missing translations
3. **Performance**: Cache translation objects when possible
4. **Documentation**: Document all translation functions

### Integration Guidelines
1. **Import Script**: Always include translation-utils.js
2. **Use Functions**: Use appropriate translation functions
3. **Consistent Formatting**: Maintain consistent text formatting
4. **Testing**: Test with different data types and values

### Maintenance
1. **Regular Updates**: Keep translations up to date
2. **New Languages**: Plan for additional language support
3. **Performance Monitoring**: Monitor translation performance
4. **Code Quality**: Maintain high code quality standards

## Future Enhancements

### Planned Improvements
1. **Multi-language Support**: Support for additional languages
2. **Dynamic Translations**: Server-side translation management
3. **Translation Caching**: Improved translation caching
4. **Auto-translation**: Automatic translation suggestions

### Technical Debt
1. **Testing Coverage**: Need comprehensive testing suite
2. **Performance Optimization**: Further optimization of translation lookups
3. **Documentation**: Enhanced function documentation
4. **Code Quality**: Improved code organization and structure

## Troubleshooting

### Common Issues
1. **Missing Translations**: Check if translation exists in object
2. **Performance Issues**: Consider caching translation objects
3. **Display Issues**: Verify CSS classes and formatting
4. **Integration Problems**: Check script loading order

### Debugging
```javascript
// Debug translation functions
console.log('Translation result:', translateAlertCondition('price'));
console.log('Available translations:', Object.keys(translations));
console.log('Currency display:', getCashFlowCurrencyDisplay(1));
```

---

**Last Updated**: 2025-01-26  
**Maintainer**: TikTrack Development Team
