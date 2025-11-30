# Event Handler Manager - Debugging Guide for Developers

## 📋 Overview

This guide provides practical instructions for developers on how to debug event-related issues using the Event Handler Manager system. The system provides comprehensive debugging tools that can help you quickly identify and resolve event handling problems.

**Related Documentation:**
- [Event Handler System - Technical Documentation](../../02-ARCHITECTURE/FRONTEND/EVENT_HANDLER_SYSTEM.md)
- [Logger Service](../../02-ARCHITECTURE/FRONTEND/LOGGER_SERVICE.md)

---

## 🔍 Quick Start

### Accessing Debug Tools

All debugging tools are available via `window.EventHandlerManager.debug.*`:

```javascript
// Get the debug API
const debug = window.EventHandlerManager.debug;

// Check system status
const stats = debug.getStatistics();
console.log('System status:', stats);
```

### Enabling Verbose Logging

For detailed debugging, enable verbose logging:

```javascript
window.EventHandlerManager.debug.enableVerboseLogging();
```

This will enable:
- Detailed event logging
- Performance tracking
- Stack trace collection

**Note:** Verbose logging can impact performance - disable when done debugging.

---

## 🎯 Common Debugging Scenarios

### 1. Event Not Firing

**Problem:** A click handler or event handler is not executing.

**Solution Steps:**

1. **Check if the event is being captured:**
   ```javascript
   // Get recent event history
   const history = window.EventHandlerManager.debug.getEventHistory(50);
   console.log('Recent events:', history);
   
   // Filter for specific event type
   const clickEvents = history.filter(e => e.eventType === 'click');
   console.log('Click events:', clickEvents);
   ```

2. **Check if element has listeners:**
   ```javascript
   // Find listeners for a specific element
   const listeners = window.EventHandlerManager.debug.findListenersForElement('#myButton');
   console.log('Listeners for #myButton:', listeners);
   ```

3. **Check for errors:**
   ```javascript
   // Get error report
   const errors = window.EventHandlerManager.debug.getErrorReport();
   console.log('Recent errors:', errors.recentErrors);
   
   // Filter errors related to your element
   const relevantErrors = errors.errors.filter(e => 
       e.element && e.element.includes('myButton')
   );
   console.log('Relevant errors:', relevantErrors);
   ```

4. **Enable verbose logging and test:**
   ```javascript
   window.EventHandlerManager.debug.enableVerboseLogging();
   // Now click the button and check console for detailed logs
   ```

5. **Check event delegation:**
   ```javascript
   // Check if event is handled by delegation
   const stats = window.EventHandlerManager.debug.getStatistics();
   console.log('Events by type:', stats.eventsByType);
   ```

### 2. Handler Executing Multiple Times

**Problem:** Event handler is firing multiple times for a single action.

**Solution Steps:**

1. **Check for duplicate listeners:**
   ```javascript
   // Get all listeners
   const listeners = window.EventHandlerManager.debug.getListeners();
   
   // Find duplicates
   const clickListeners = listeners.filter(l => l.eventName === 'click');
   const duplicates = clickListeners.filter((l, index, arr) => 
       arr.findIndex(li => li.handlerName === l.handlerName) !== index
   );
   console.log('Duplicate listeners:', duplicates);
   ```

2. **Check event history for multiple executions:**
   ```javascript
   const history = window.EventHandlerManager.debug.getEventHistory(100);
   const recentClicks = history.filter(e => 
       e.eventType === 'click' && 
       e.element && e.element.includes('myButton')
   );
   console.log('Recent clicks on button:', recentClicks);
   ```

3. **Check if event is bubbling:**
   ```javascript
   // Enable verbose logging to see event propagation
   window.EventHandlerManager.debug.enableVerboseLogging();
   // Click button and check console for event propagation details
   ```

### 3. Slow Performance / Lag

**Problem:** Event handlers are causing performance issues.

**Solution Steps:**

1. **Identify slow handlers:**
   ```javascript
   const stats = window.EventHandlerManager.debug.getStatistics();
   console.log('Slow handlers:', stats.slowHandlers);
   ```

2. **Get detailed performance data:**
   ```javascript
   // Check performance for specific handler
   const handlerInfo = window.EventHandlerManager.debug.getHandlerInfo('click:myHandler');
   if (handlerInfo && handlerInfo.performance) {
       console.log('Average execution time:', handlerInfo.performance.avg, 'ms');
       console.log('Min/Max:', handlerInfo.performance.min, '/', handlerInfo.performance.max, 'ms');
       console.log('Total calls:', handlerInfo.performance.count);
   }
   ```

3. **Check overall statistics:**
   ```javascript
   const stats = window.EventHandlerManager.debug.getStatistics();
   console.log('Performance by handler:', stats.performanceByHandler);
   
   // Sort by average execution time
   const sorted = Object.entries(stats.performanceByHandler)
       .sort((a, b) => b[1].avg - a[1].avg);
   console.log('Slowest handlers:', sorted.slice(0, 10));
   ```

4. **Check event frequency:**
   ```javascript
   const stats = window.EventHandlerManager.debug.getStatistics();
   console.log('Events by type:', stats.eventsByType);
   console.log('Total events:', stats.totalEvents);
   ```

### 4. Error in Event Handler

**Problem:** Event handler is throwing an error.

**Solution Steps:**

1. **Get error report:**
   ```javascript
   const errorReport = window.EventHandlerManager.debug.getErrorReport();
   console.log('Total errors:', errorReport.total);
   console.log('Recent errors:', errorReport.recentErrors);
   ```

2. **Check specific error details:**
   ```javascript
   const errors = errorReport.recentErrors;
   errors.forEach(error => {
       console.log('Error:', error.error.message);
       console.log('Handler:', error.handlerKey);
       console.log('Element:', error.element);
       console.log('Stack:', error.error.stack);
       console.log('Context:', error.context);
   });
   ```

3. **Filter errors by handler:**
   ```javascript
   const myHandlerErrors = errorReport.errors.filter(e => 
       e.handlerKey.includes('myHandler')
   );
   console.log('Errors in myHandler:', myHandlerErrors);
   ```

4. **Enable verbose logging to catch errors in real-time:**
   ```javascript
   window.EventHandlerManager.debug.enableVerboseLogging();
   // Errors will now be logged with full context
   ```

### 5. Event Not Propagating Correctly

**Problem:** Event is being stopped or not bubbling correctly.

**Solution Steps:**

1. **Check event history for propagation issues:**
   ```javascript
   const history = window.EventHandlerManager.debug.getEventHistory(50);
   const relatedEvents = history.filter(e => 
       e.element && e.element.includes('myContainer')
   );
   console.log('Events in container:', relatedEvents);
   ```

2. **Use verbose logging to see event flow:**
   ```javascript
   window.EventHandlerManager.debug.enableVerboseLogging();
   // Events will now be logged with full DOM hierarchy information
   ```

3. **Simulate event to test:**
   ```javascript
   // Simulate click event
   window.EventHandlerManager.debug.simulateEvent('click', '#myButton');
   
   // Check if it appears in history
   const history = window.EventHandlerManager.debug.getEventHistory(10);
   console.log('After simulation:', history[0]);
   ```

---

## 📊 Reading Logs

### Understanding Log Levels

The system uses different log levels:

- **DEBUG** - Detailed information for debugging (only in verbose mode)
- **INFO** - General information about events
- **WARN** - Warnings about potential issues
- **ERROR** - Errors that occurred during event handling

### Log Format

All logs follow this format:

```
[LEVEL] [EventHandlerManager] Message
```

With additional context object:

```javascript
{
    component: 'handleDelegatedClick',
    eventName: 'click',
    element: '#myButton',
    handler: 'handleClick',
    page: 'trades',
    timestamp: 1234567890,
    // ... additional context
}
```

### Finding Information in Logs

1. **Search by component:**
   ```javascript
   // Filter logs by component name
   // In browser console, search for: "component: 'handleDelegatedClick'"
   ```

2. **Search by element:**
   ```javascript
   // Filter logs by element selector
   // In browser console, search for: "element: '#myButton'"
   ```

3. **Search by handler:**
   ```javascript
   // Filter logs by handler name
   // In browser console, search for: "handler: 'handleClick'"
   ```

---

## 🛠️ Using Debug API

### Getting All Listeners

```javascript
const listeners = window.EventHandlerManager.debug.getListeners();
listeners.forEach(listener => {
    console.log(`Event: ${listener.eventName}, Handler: ${listener.handlerName}`);
    console.log(`Calls: ${listener.callCount}, Errors: ${listener.errorCount}`);
    console.log(`Avg time: ${listener.avgExecutionTime}ms`);
});
```

### Monitoring Events in Real-Time

```javascript
// Enable verbose logging
window.EventHandlerManager.debug.enableVerboseLogging();

// Set up periodic checks
setInterval(() => {
    const stats = window.EventHandlerManager.debug.getStatistics();
    console.log('Events since start:', stats.totalEvents);
    console.log('Errors:', stats.totalErrors);
    
    if (stats.slowHandlers.length > 0) {
        console.warn('Slow handlers detected:', stats.slowHandlers);
    }
}, 5000); // Check every 5 seconds
```

### Tracking Specific Handler

```javascript
// Get handler info before action
const before = window.EventHandlerManager.debug.getHandlerInfo('click:myHandler');

// Perform action (click button, etc.)

// Get handler info after action
const after = window.EventHandlerManager.debug.getHandlerInfo('click:myHandler');

// Compare
console.log('Calls increased by:', after.callCount - before.callCount);
console.log('Execution time changed:', after.performance.avg - before.performance.avg);
```

### Exporting Debug Data

```javascript
// Export all debug data for analysis
const debugData = {
    statistics: window.EventHandlerManager.debug.getStatistics(),
    eventHistory: window.EventHandlerManager.debug.getEventHistory(100),
    errorReport: window.EventHandlerManager.debug.getErrorReport(),
    listeners: window.EventHandlerManager.debug.getListeners()
};

// Save to file or send to server
console.log(JSON.stringify(debugData, null, 2));
```

---

## 🐛 Troubleshooting Tips

### 1. Check System State

Always start by checking the system state:

```javascript
const stats = window.EventHandlerManager.debug.getStatistics();
console.log('Debug mode:', stats.debugMode);
console.log('Performance tracking:', stats.performanceTracking);
console.log('Total listeners:', stats.totalListeners);
```

### 2. Clear Old Data

If you're debugging and want fresh data:

```javascript
// Clear history
window.EventHandlerManager.debug.clearHistory();

// Clear statistics
window.EventHandlerManager.debug.clearStatistics();

// Now perform your test and check results
```

### 3. Compare Before/After

When testing a fix:

```javascript
// Before
const before = {
    errors: window.EventHandlerManager.debug.getErrorReport().total,
    listeners: window.EventHandlerManager.debug.getListeners().length,
    stats: window.EventHandlerManager.debug.getStatistics()
};

// Make changes / test

// After
const after = {
    errors: window.EventHandlerManager.debug.getErrorReport().total,
    listeners: window.EventHandlerManager.debug.getListeners().length,
    stats: window.EventHandlerManager.debug.getStatistics()
};

// Compare
console.log('Errors:', before.errors, '→', after.errors);
console.log('Listeners:', before.listeners, '→', after.listeners);
```

### 4. Use Browser DevTools

Combine debug API with browser DevTools:

1. Set breakpoints in event handlers
2. Use `window.EventHandlerManager.debug.*` in console
3. Check Network tab for related API calls
4. Use Performance profiler for detailed timing

---

## 📝 Best Practices

### 1. Enable Verbose Logging Only When Needed

```javascript
// Enable when debugging
window.EventHandlerManager.debug.enableVerboseLogging();

// ... do your debugging ...

// Disable when done
window.EventHandlerManager.debug.disableVerboseLogging();
```

### 2. Clear Data Between Tests

```javascript
// Before each test
window.EventHandlerManager.debug.clearHistory();
window.EventHandlerManager.debug.clearStatistics();
```

### 3. Export Data for Offline Analysis

```javascript
// When debugging complex issues
const debugData = {
    timestamp: Date.now(),
    statistics: window.EventHandlerManager.debug.getStatistics(),
    eventHistory: window.EventHandlerManager.debug.getEventHistory(200),
    errorReport: window.EventHandlerManager.debug.getErrorReport()
};

// Save or send to server for analysis
```

### 4. Monitor Performance Regularly

```javascript
// Set up periodic monitoring in development
if (window.location.hostname === 'localhost') {
    setInterval(() => {
        const stats = window.EventHandlerManager.debug.getStatistics();
        if (stats.slowHandlers.length > 0) {
            console.warn('⚠️ Slow handlers detected:', stats.slowHandlers);
        }
    }, 30000); // Every 30 seconds
}
```

---

## 🔗 Related Resources

- [Event Handler System - Technical Documentation](../../02-ARCHITECTURE/FRONTEND/EVENT_HANDLER_SYSTEM.md)
- [Logger Service Documentation](../../02-ARCHITECTURE/FRONTEND/LOGGER_SERVICE.md)
- [General Systems List](../../frontend/GENERAL_SYSTEMS_LIST.md)

---

## 💡 Tips from Experience

1. **Always check error report first** - Most issues are revealed in errors
2. **Use verbose logging sparingly** - It can be overwhelming
3. **Clear data between tests** - Avoid confusion from old data
4. **Export data for complex issues** - Analyze offline with full context
5. **Monitor slow handlers** - Performance issues are easier to fix early

---

**Last Updated:** 2025-01-27  
**Version:** 2.0.0
