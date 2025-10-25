# Usage Examples & Best Practices

## Overview
דוגמאות שימוש מעשיות ותבניות נפוצות למערכות TikTrack.

## 📚 Available Examples

### 1. Common Patterns
**File:** `common-patterns.md`  
**Content:** תבניות נפוצות לפיתוח עמודים  
**Includes:**
- Page initialization patterns
- Data loading patterns
- Table management patterns
- Form handling patterns
- Error handling patterns
- Performance optimization patterns
- Cache management patterns

### 2. System Integration Examples
**File:** `system-integration-examples.md`  
**Content:** דוגמאות אינטגרציה מלאה בין מערכות  
**Includes:**
- Complete Trades page example
- Add Trade form example
- Dashboard with charts example
- Best practices for system integration

## 🎯 Quick Start Guide

### Basic Page Setup
```javascript
// 1. Wait for DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

async function initializePage() {
    try {
        // 2. Load data
        const data = await loadPageData();
        
        // 3. Render UI
        renderPage(data);
        
        // 4. Setup systems
        setupPageSystems();
        
        // 5. Show success
        showSuccessNotification('עמוד נטען בהצלחה');
        
    } catch (error) {
        Logger.error('Page initialization failed', { error: error.message });
        showErrorNotification('שגיאה בטעינת העמוד');
    }
}
```

### Data Loading with Cache
```javascript
async function loadPageData() {
    // 1. Check cache first
    const cachedData = window.UnifiedCacheManager?.get('page-data');
    if (cachedData) {
        return cachedData;
    }
    
    // 2. Load from server
    const response = await fetch('/api/data');
    const data = await response.json();
    
    // 3. Cache the data
    await window.UnifiedCacheManager?.set('page-data', data, { ttl: 300 });
    
    return data;
}
```

### Table Setup
```javascript
function setupTable(tableId, data, actions) {
    // 1. Load table data
    loadTableData(tableId, data, {
        sortable: true,
        filterable: true,
        pagination: true
    });
    
    // 2. Add action buttons
    generateTableActions(tableId, actions);
    
    // 3. Setup event listeners
    setupTableEventListeners(tableId);
}
```

## 🔧 System Integration Patterns

### 1. Notification System
```javascript
// Success notification
showSuccessNotification('נתונים נשמרו בהצלחה');

// Error notification
showErrorNotification('שגיאה בטעינת הנתונים');

// Warning notification
showWarningNotification('אנא מלא את כל השדות');

// Info notification
showInfoNotification('טעינת נתונים...');
```

### 2. Cache Management
```javascript
// Save to cache
await window.UnifiedCacheManager?.set('key', data, { ttl: 300 });

// Get from cache
const data = window.UnifiedCacheManager?.get('key');

// Clear cache
await window.UnifiedCacheManager?.delete('key');
```

### 3. Logger Service
```javascript
// Different log levels
Logger.debug('Debug information');
Logger.info('User action completed');
Logger.warn('Potential issue detected');
Logger.error('Operation failed');
Logger.critical('System error');
```

### 4. Field Renderer
```javascript
// Render different field types
const statusHtml = FieldRendererService.renderStatus('open', 'trade');
const sideHtml = FieldRendererService.renderSide('Long');
const currencyHtml = FieldRendererService.renderCurrency(1);
const sharesHtml = FieldRendererService.renderShares(100);
```

## 📋 Best Practices Checklist

### ✅ Do's
- Always use try-catch for async operations
- Log errors with context information
- Use caching for performance
- Show user-friendly notifications
- Handle network errors gracefully
- Use performance monitoring
- Implement auto-save for forms
- Use lazy loading for large content

### ❌ Don'ts
- Don't ignore errors silently
- Don't show technical error messages to users
- Don't block UI during long operations
- Don't forget to clean up event listeners
- Don't use synchronous operations for data loading
- Don't cache sensitive data
- Don't forget to handle offline scenarios
- Don't use console.log in production

## 🚨 Common Issues & Solutions

### Issue: Page not loading
**Solution:**
```javascript
// Check if systems are loaded
if (!window.UnifiedCacheManager) {
    Logger.error('Cache manager not loaded');
    showErrorNotification('מערכת לא מוכנה. אנא רענן את העמוד.');
    return;
}
```

### Issue: Data not saving
**Solution:**
```javascript
// Check network and retry
try {
    await saveData(data);
} catch (error) {
    if (error.name === 'NetworkError') {
        await retryWithBackoff(() => saveData(data), 3);
    }
}
```

### Issue: Performance problems
**Solution:**
```javascript
// Use performance monitoring
const startTime = performance.now();
await heavyOperation();
const duration = performance.now() - startTime;

if (duration > 1000) {
    Logger.warn('Slow operation detected', { duration });
}
```

## 📊 Performance Guidelines

### Memory Management
- Use appropriate cache TTL values
- Clear unused data from memory
- Monitor memory usage in production
- Use lazy loading for large datasets

### Network Optimization
- Implement request batching
- Use compression for large payloads
- Cache frequently accessed data
- Handle offline scenarios

### UI Responsiveness
- Use loading indicators for long operations
- Implement virtual scrolling for large tables
- Use debouncing for search inputs
- Avoid blocking the main thread

## 🔍 Debugging Tips

### 1. Enable Debug Logging
```javascript
// Set logger to debug level
Logger.setLevel(Logger.LogLevel.DEBUG);

// Monitor specific operations
Logger.startTimer('data-loading');
await loadData();
Logger.endTimer('data-loading');
```

### 2. Performance Monitoring
```javascript
// Monitor long tasks
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
            if (entry.duration > 50) {
                Logger.warn('Long task detected', {
                    name: entry.name,
                    duration: entry.duration
                });
            }
        });
    });
    
    observer.observe({ entryTypes: ['longtask'] });
}
```

### 3. Cache Debugging
```javascript
// Check cache statistics
const stats = window.UnifiedCacheManager?.getCacheStats();
console.log('Cache stats:', stats);

// Export cache data
const cacheData = window.UnifiedCacheManager?.exportCache();
console.log('Cache data:', cacheData);
```

## 📖 Additional Resources

- [API Reference](../03-API_REFERENCE/README.md) - Complete API documentation
- [System Architecture](../02-ARCHITECTURE/README.md) - System architecture overview
- [Troubleshooting Guide](../05-TROUBLESHOOTING/README.md) - Common issues and solutions

## 🆕 Last Updated
January 24, 2025

## 📝 Contributing
When adding new examples:
1. Follow the established patterns
2. Include error handling
3. Add performance considerations
4. Document any dependencies
5. Test the examples thoroughly
