# Error Handling Usage Guide

## Overview

This guide explains how to properly implement error handling in TikTrack using try-catch blocks, Logger, and Notifications.

## Quick Reference

### Basic Pattern

```javascript
function myFunction() {
    try {
        // Your code here
    } catch (error) {
        window.Logger.error('Error message', error, { page: "page-name" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('User-friendly message', error.message);
        }
    }
}
```

## When to Use Error Handling

### ✅ Always Use try-catch For

1. **API Calls**
   - Fetch requests
   - CRUD operations
   - External service calls

2. **Data Processing**
   - Parsing JSON
   - Data validation
   - Complex calculations

3. **DOM Operations**
   - Element queries
   - Event handlers
   - UI updates

4. **Async Operations**
   - Promises
   - Async/await
   - Timeouts

### ❌ Optional Use For

1. **Simple getters/setters**
2. **Pure utility functions with no side effects**
3. **Functions that only throw errors (already handled)**

## Examples

### Example 1: API Call

```javascript
async function loadData() {
    try {
        const response = await fetch('/api/trades');
        const data = await response.json();
        return data;
    } catch (error) {
        window.Logger.error('Failed to load trades data', error, { page: "trades" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בטעינת נתונים', 'לא ניתן לטעון את נתוני הטריידים');
        }
        return null;
    }
}
```

### Example 2: Form Validation

```javascript
function validateForm() {
    try {
        const formData = getFormData();
        
        if (!formData.ticker) {
            throw new Error('Ticker is required');
        }
        
        if (!formData.amount || formData.amount <= 0) {
            throw new Error('Amount must be positive');
        }
        
        return true;
    } catch (error) {
        window.Logger.error('Form validation failed', error, { page: "trades" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בוולידציה', error.message);
        }
        return false;
    }
}
```

### Example 3: DOM Manipulation

```javascript
function updateTable() {
    try {
        const table = document.getElementById('trades-table');
        if (!table) {
            throw new Error('Table element not found');
        }
        
        // Update table content
        table.innerHTML = generateTableHTML();
        
    } catch (error) {
        window.Logger.error('Failed to update table', error, { page: "trades" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בעדכון טבלה', 'לא ניתן לעדכן את הטבלה');
        }
    }
}
```

### Example 4: Async Operation with User Feedback

```javascript
async function saveData(data) {
    try {
        // Show loading indicator
        showLoading();
        
        const response = await fetch('/api/trades', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Hide loading indicator
        hideLoading();
        
        // Show success message
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('הנתונים נשמרו בהצלחה');
        }
        
        return result;
        
    } catch (error) {
        hideLoading(); // Always hide loading indicator
        window.Logger.error('Failed to save data', error, { page: "trades" });
        
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בשמירה', 'לא ניתן לשמור את הנתונים');
        }
        
        return null;
    }
}
```

## Best Practices

### 1. Always Use Logger

```javascript
catch (error) {
    // ✅ Good - Logs error with context
    window.Logger.error('Operation failed', error, { page: "page-name" });
    
    // ❌ Bad - No logging
    console.error(error);
}
```

### 2. Show User-Friendly Notifications

```javascript
catch (error) {
    // ✅ Good - User-friendly message
    window.showErrorNotification('שגיאה בטעינה', 'לא ניתן לטעון את הנתונים');
    
    // ❌ Bad - Technical error message
    window.showErrorNotification('Error', error.message);
}
```

### 3. Return Appropriate Values

```javascript
function getData() {
    try {
        return fetchData();
    } catch (error) {
        window.Logger.error('Failed to get data', error);
        return null; // ✅ Return null for failures
    }
}
```

### 4. Handle Specific Error Types

```javascript
try {
    // Some operation
} catch (error) {
    if (error.name === 'NetworkError') {
        window.showErrorNotification('בעיית רשת', 'בדוק את החיבור לאינטרנט');
    } else if (error.name === 'ValidationError') {
        window.showErrorNotification('שגיאת תקינות', error.message);
    } else {
        window.showErrorNotification('שגיאה', 'אירעה שגיאה בלתי צפויה');
    }
    
    window.Logger.error('Operation failed', error, { page: "page-name" });
}
```

## Checklist for New Functions

When creating a new function, ask yourself:

- [ ] Does this function perform network operations? → Add try-catch
- [ ] Does this function manipulate the DOM? → Add try-catch
- [ ] Does this function process user input? → Add try-catch
- [ ] Does this function access localStorage/IndexedDB? → Add try-catch
- [ ] Does this function call other functions that might fail? → Add try-catch
- [ ] Have I added Logger.error() in the catch block?
- [ ] Have I added a user-friendly notification?
- [ ] Have I returned an appropriate value on error?

## Common Patterns

### Pattern 1: Try-Catch with Return Value

```javascript
function safeOperation() {
    try {
        return performOperation();
    } catch (error) {
        window.Logger.error('Operation failed', error, { page: "page-name" });
        return null; // or appropriate default value
    }
}
```

### Pattern 2: Try-Catch with Boolean Result

```javascript
function validateAndExecute() {
    try {
        validateInput();
        executeOperation();
        return true;
    } catch (error) {
        window.Logger.error('Validation/execution failed', error, { page: "page-name" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', error.message);
        }
        return false;
    }
}
```

### Pattern 3: Try-Catch with Async/Await

```javascript
async function asyncOperation() {
    try {
        const result = await someAsyncCall();
        return result;
    } catch (error) {
        window.Logger.error('Async operation failed', error, { page: "page-name" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'הפעולה נכשלה');
        }
        return null;
    }
}
```

## Resources

- [Logger Service Documentation](../03-API_REFERENCE/logger-service.md)
- [Notification System Documentation](../03-API_REFERENCE/notification-system.md)
- [Error Handling Coverage Monitor](../../../scripts/monitors/error-handling-monitor.js)
