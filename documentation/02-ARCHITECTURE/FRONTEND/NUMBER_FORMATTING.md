# Global Number Formatting System - TikTrack

## 📋 Overview

This document describes the comprehensive global number and currency formatting system implemented in TikTrack, providing consistent number display across all pages with proper formatting and color coding.

## 🎯 System Features

### ✅ **Core Functions**
- **`formatNumberWithCommas()`** - Format numbers with commas every 3 digits
- **`formatCurrencyWithCommas()`** - Format currency with commas and currency symbol
- **`colorAmountByValue()`** - Color amounts based on positive/negative values
- **Backward Compatibility** - Maintains existing function names
- **Global Integration** - Available across all pages

### 🔧 **Technical Features**
- **Consistent Formatting**: Same format across all pages
- **Currency Support**: Multiple currency symbols and formats
- **Color Coding**: Green for positive, red for negative values
- **Performance Optimized**: Efficient formatting algorithms
- **Mobile Responsive**: Works on all screen sizes

## 🏗️ Architecture

### File Location
```
trading-ui/scripts/
├── data-utils.js              # Main formatting functions
├── translation-utils.js       # Currency symbol mapping
└── [page-specific].js         # Page-specific implementations
```

### Function Structure

#### `formatNumberWithCommas(number)`
```javascript
/**
 * Format number with commas every 3 digits
 * @param {number} number - The number to format
 * @returns {string} Formatted number string
 */
function formatNumberWithCommas(number) {
    if (number === null || number === undefined) return '';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
```

#### `formatCurrencyWithCommas(amount, currency = 'USD')`
```javascript
/**
 * Format currency with commas and currency symbol
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
function formatCurrencyWithCommas(amount, currency = 'USD') {
    if (amount === null || amount === undefined) return '';
    
    const formattedNumber = formatNumberWithCommas(amount);
    const currencySymbol = getCurrencySymbol(currency);
    
    return `${currencySymbol}${formattedNumber}`;
}
```

#### `colorAmountByValue(amount, element)`
```javascript
/**
 * Color amount based on positive/negative value
 * @param {number} amount - The amount to color
 * @param {HTMLElement} element - The element to color
 */
function colorAmountByValue(amount, element) {
    if (amount === null || amount === undefined) return;
    
    if (amount > 0) {
        element.style.color = '#28a745'; // Green for positive
    } else if (amount < 0) {
        element.style.color = '#dc3545'; // Red for negative
    } else {
        element.style.color = '#6c757d'; // Gray for zero
    }
}
```

## 📊 Implementation Examples

### Basic Number Formatting
```javascript
// Format regular numbers
const number = 1234567;
const formatted = formatNumberWithCommas(number);
// Result: "1,234,567"

// Format decimal numbers
const decimal = 1234.56;
const formattedDecimal = formatNumberWithCommas(decimal);
// Result: "1,234.56"
```

### Currency Formatting
```javascript
// Format USD currency
const amount = 1234567.89;
const formattedUSD = formatCurrencyWithCommas(amount, 'USD');
// Result: "$1,234,567.89"

// Format ILS currency
const formattedILS = formatCurrencyWithCommas(amount, 'ILS');
// Result: "₪1,234,567.89"

// Format EUR currency
const formattedEUR = formatCurrencyWithCommas(amount, 'EUR');
// Result: "€1,234,567.89"
```

### Color Coding
```javascript
// Color positive amount
const positiveAmount = 1000;
const element = document.getElementById('amount-display');
colorAmountByValue(positiveAmount, element);
// Result: Green color

// Color negative amount
const negativeAmount = -500;
colorAmountByValue(negativeAmount, element);
// Result: Red color

// Color zero amount
const zeroAmount = 0;
colorAmountByValue(zeroAmount, element);
// Result: Gray color
```

## 🎨 Currency Symbols

### Supported Currencies
```javascript
const currencySymbols = {
    'USD': '$',
    'ILS': '₪',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'INR': '₹'
};
```

### Currency Symbol Function
```javascript
/**
 * Get currency symbol by currency code
 * @param {string} currencyCode - The currency code
 * @returns {string} Currency symbol
 */
function getCurrencySymbol(currencyCode) {
    const symbols = {
        'USD': '$',
        'ILS': '₪',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CAD': 'C$',
        'AUD': 'A$',
        'CHF': 'CHF',
        'CNY': '¥',
        'INR': '₹'
    };
    
    return symbols[currencyCode] || '$';
}
```

## 📄 Page Integration

### Table Display Integration
```javascript
// Format table cell with number
function formatTableCell(cell, value, type = 'number') {
    if (type === 'currency') {
        cell.textContent = formatCurrencyWithCommas(value);
        colorAmountByValue(value, cell);
    } else if (type === 'number') {
        cell.textContent = formatNumberWithCommas(value);
    }
}
```

### Form Input Integration
```javascript
// Format input value on display
function formatInputValue(input, value, type = 'number') {
    if (type === 'currency') {
        input.value = formatCurrencyWithCommas(value);
    } else if (type === 'number') {
        input.value = formatNumberWithCommas(value);
    }
}
```

### Summary Display Integration
```javascript
// Format summary statistics
function formatSummaryStats(stats) {
    const totalElement = document.getElementById('total-amount');
    const formattedTotal = formatCurrencyWithCommas(stats.total);
    totalElement.textContent = formattedTotal;
    colorAmountByValue(stats.total, totalElement);
}
```

## 🔄 Backward Compatibility

### Legacy Function Support
```javascript
// Maintain backward compatibility
function formatNumber(number) {
    return formatNumberWithCommas(number);
}

function formatCurrency(amount, currency) {
    return formatCurrencyWithCommas(amount, currency);
}

function colorAmount(amount, element) {
    return colorAmountByValue(amount, element);
}
```

### Migration Guide
```javascript
// Old way (still supported)
const formatted = formatNumber(1234567);

// New way (recommended)
const formatted = formatNumberWithCommas(1234567);
```

## 🚀 Performance Optimization

### Optimization Techniques
1. **Caching**: Currency symbols cached for better performance
2. **Efficient Algorithms**: Optimized formatting algorithms
3. **Minimal DOM Manipulation**: Efficient color coding
4. **Memory Management**: Proper cleanup of event listeners

### Performance Best Practices
```javascript
// Cache currency symbols
const currencySymbolsCache = new Map();

function getCurrencySymbolOptimized(currencyCode) {
    if (currencySymbolsCache.has(currencyCode)) {
        return currencySymbolsCache.get(currencyCode);
    }
    
    const symbol = getCurrencySymbol(currencyCode);
    currencySymbolsCache.set(currencyCode, symbol);
    return symbol;
}
```

## 🧪 Testing

### Formatting Test Cases
```javascript
// Test number formatting
test('formatNumberWithCommas formats correctly', () => {
    expect(formatNumberWithCommas(1234567)).toBe('1,234,567');
    expect(formatNumberWithCommas(1234.56)).toBe('1,234.56');
    expect(formatNumberWithCommas(0)).toBe('0');
    expect(formatNumberWithCommas(null)).toBe('');
});

// Test currency formatting
test('formatCurrencyWithCommas formats correctly', () => {
    expect(formatCurrencyWithCommas(1234567, 'USD')).toBe('$1,234,567');
    expect(formatCurrencyWithCommas(1234567, 'ILS')).toBe('₪1,234,567');
});

// Test color coding
test('colorAmountByValue colors correctly', () => {
    const element = document.createElement('div');
    
    colorAmountByValue(1000, element);
    expect(element.style.color).toBe('#28a745');
    
    colorAmountByValue(-500, element);
    expect(element.style.color).toBe('#dc3545');
    
    colorAmountByValue(0, element);
    expect(element.style.color).toBe('#6c757d');
});
```

## 🔧 Troubleshooting

### Common Issues

#### Numbers Not Formatting
1. Check if function is properly imported
2. Verify number type (should be number, not string)
3. Check for null/undefined values
4. Verify function call syntax

#### Currency Symbols Not Displaying
1. Check currency code spelling
2. Verify currency symbol mapping
3. Check for encoding issues
4. Verify font support for symbols

#### Color Coding Not Working
1. Check if element exists in DOM
2. Verify element reference is correct
3. Check for CSS conflicts
4. Verify color values are correct

## 📚 Related Documentation

- [JavaScript Architecture](JAVASCRIPT_ARCHITECTURE.md)
- [Translation System](TRANSLATION_FUNCTIONS.md)
- [Data Utilities](../backend/README.md)
- [CSS Variables](../css/CSS_VARIABLES.md)

---

**Last Updated**: August 26, 2025  
**Version**: 2.8.0  
**Maintained By**: TikTrack Development Team
