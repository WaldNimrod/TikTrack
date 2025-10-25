# Page Documentation - TikTrack

## Overview
תיעוד מפורט לכל 29 העמודים במערכת TikTrack.

## 📋 Page Categories

### User Pages (Priority 1) - 13 עמודים
עמודים מרכזיים למשתמשים:

1. **[Index Page](index-page.md)** - דשבורד ראשי
2. **[Trades Page](trades-page.md)** - ניהול עסקאות
3. **[Trade Plans Page](trade-plans-page.md)** - תכניות מסחר
4. **[Executions Page](executions-page.md)** - ביצועי עסקאות
5. **[Alerts Page](alerts-page.md)** - מערכת התראות
6. **[Tickers Page](tickers-page.md)** - ניהול טיקרים
7. **[Trading Accounts Page](trading-accounts-page.md)** - חשבונות מסחר
8. **[Cash Flows Page](cash-flows-page.md)** - תזרימי מזומן
9. **[Notes Page](notes-page.md)** - מערכת הערות
10. **[Research Page](research-page.md)** - מחקר וניתוח
11. **[Preferences Page](preferences-page.md)** - הגדרות מערכת
12. **[DB Display Page](db-display-page.md)** - תצוגת בסיס נתונים
13. **[DB Extra Data Page](db-extradata-page.md)** - נתונים נוספים

### Technical Pages (Priority 2) - 16 עמודים
עמודים טכניים לפיתוח וניהול:

1. **[Constraints Page](constraints-page.md)** - אילוצי מערכת
2. **[Background Tasks Page](background-tasks-page.md)** - משימות רקע
3. **[Server Monitor Page](server-monitor-page.md)** - ניטור שרת
4. **[System Management Page](system-management-page.md)** - ניהול מערכת
5. **[Cache Test Page](cache-test-page.md)** - בדיקת מטמון
6. **[Linter Monitor Page](linter-monitor-page.md)** - ניטור לינטר
7. **[Notifications Center Page](notifications-center-page.md)** - מרכז התראות
8. **[Page Scripts Matrix Page](page-scripts-matrix-page.md)** - מטריצת סקריפטים
9. **[CSS Management Page](css-management-page.md)** - ניהול CSS
10. **[Dynamic Colors Display Page](dynamic-colors-display-page.md)** - תצוגת צבעים
11. **[Designs Page](designs-page.md)** - עיצובים
12. **[External Data Dashboard Page](external-data-dashboard-page.md)** - דשבורד נתונים חיצוניים
13. **[Chart Management Page](chart-management-page.md)** - ניהול גרפים
14. **[Entity Details Page](entity-details-page.md)** - פרטי ישויות
15. **[Linked Items Page](linked-items-page.md)** - פריטים מקושרים
16. **[Testing Page](testing-page.md)** - בדיקות מערכת

## 📊 Page Documentation Structure

### Standard Documentation Format
כל עמוד מתועד בפורמט אחיד:

```markdown
# [Page Name] - Documentation

## Overview
תיאור כללי של העמוד ותכונותיו

## Page Information
- File: [filename]
- URL: [url]
- Type: [User/Technical]
- Last Updated: [date]

## Features
רשימת תכונות העמוד

## Required Systems
רשימת מערכות נדרשות

## JavaScript Files
רשימת קבצי JavaScript

## API Endpoints
רשימת API endpoints

## Page Structure
מבנה HTML

## JavaScript Implementation
קוד JavaScript

## Event Handlers
מטפלי אירועים

## Performance Considerations
שיקולי ביצועים

## Error Handling
טיפול בשגיאות

## Dependencies
תלויות

## Testing
בדיקות

## Troubleshooting
פתרון בעיות

## Best Practices
שיטות עבודה מומלצות
```

## 🎯 Quick Reference

### Core Systems (חבילת בסיס)
כל עמוד כולל את המערכות הבאות:
- **Unified App Initializer** - אתחול עמוד
- **Notification System** - התראות משתמש
- **Logger Service** - לוגים וניטור
- **Unified Cache Manager** - מטמון נתונים
- **Header System** - ניווט ופילטרים

### Table Pages
עמודים עם טבלאות כוללים:
- **Table System** - ניהול טבלאות
- **Field Renderer** - תצוגת נתונים
- **Button System** - כפתורי פעולה

### Chart Pages
עמודים עם גרפים כוללים:
- **Chart Management** - ניהול גרפים
- **Chart Utils** - כלי גרפים
- **Trades Adapter** - מתאם נתונים

## 📈 Performance Guidelines

### Data Loading
```javascript
// Always check cache first
const cachedData = window.UnifiedCacheManager?.get('page-data');
if (cachedData) {
    return cachedData;
}

// Load from server
const data = await fetch('/api/data');
await window.UnifiedCacheManager?.set('page-data', data, { ttl: 300 });
```

### Error Handling
```javascript
try {
    // Your code
} catch (error) {
    Logger.error('Operation failed', { error: error.message });
    showErrorNotification('שגיאה בפעולה');
}
```

### Performance Monitoring
```javascript
// Monitor long tasks
const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
        if (entry.duration > 100) {
            Logger.warn('Slow operation', { duration: entry.duration });
        }
    });
});
```

## 🔧 Common Patterns

### Page Initialization
```javascript
class PageName {
    constructor() {
        this.init();
    }
    
    async init() {
        try {
            // 1. Setup systems
            this.setupSystems();
            
            // 2. Load data
            await this.loadData();
            
            // 3. Setup UI
            this.setupUI();
            
            // 4. Setup events
            this.setupEventListeners();
            
            showSuccessNotification('עמוד נטען בהצלחה');
            
        } catch (error) {
            Logger.error('Page initialization failed', { error: error.message });
            showErrorNotification('שגיאה בטעינת העמוד');
        }
    }
}
```

### Data Loading
```javascript
async loadData() {
    // Check cache first
    const cachedData = window.UnifiedCacheManager?.get('data-key');
    if (cachedData) return cachedData;
    
    // Load from server
    const response = await fetch('/api/data');
    const data = await response.json();
    
    // Cache the data
    await window.UnifiedCacheManager?.set('data-key', data, { ttl: 300 });
    
    return data;
}
```

### Table Setup
```javascript
setupTable() {
    loadTableData('table-id', data, {
        sortable: true,
        filterable: true,
        pagination: true
    });
    
    generateTableActions('table-id', actions);
}
```

## 📋 Testing Checklist

### Unit Tests
- [ ] Data loading functions
- [ ] UI setup functions
- [ ] Event handlers
- [ ] Error handling

### Integration Tests
- [ ] System initialization
- [ ] Cache management
- [ ] API integration
- [ ] Performance monitoring

### E2E Tests
- [ ] Page loading
- [ ] User interactions
- [ ] Data operations
- [ ] Error scenarios

## 🚨 Troubleshooting Guide

### Common Issues

1. **Page not loading**
   - Check if required systems are loaded
   - Verify API endpoints
   - Check console for errors

2. **Data not displaying**
   - Check data format
   - Verify table setup
   - Check field renderer

3. **Actions not working**
   - Check button system
   - Verify event handlers
   - Check permissions

4. **Performance issues**
   - Monitor long tasks
   - Check data size
   - Optimize queries

### Debug Commands
```javascript
// Check system status
console.log('Systems loaded:', {
    cache: !!window.UnifiedCacheManager,
    logger: !!window.Logger,
    notifications: !!window.showNotification
});

// Check cache status
const stats = window.UnifiedCacheManager?.getCacheStats();
console.log('Cache stats:', stats);

// Check performance
const metrics = performance.getEntriesByType('measure');
console.log('Performance metrics:', metrics);
```

## 📚 Additional Resources

- [API Reference](../03-API_REFERENCE/README.md) - Complete API documentation
- [Usage Examples](../04-USAGE_EXAMPLES/README.md) - Usage examples and patterns
- [System Architecture](../02-ARCHITECTURE/README.md) - System architecture overview

## 🆕 Last Updated
January 24, 2025

## 📝 Contributing
When updating page documentation:
1. Follow the standard format
2. Include all required sections
3. Add performance considerations
4. Document dependencies
5. Include troubleshooting tips
6. Test all examples
