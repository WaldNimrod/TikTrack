# Event Handler System - Technical Documentation

## Overview

The Event Handler System (`event-handler-manager.js`) is a centralized event management system for TikTrack that prevents duplicate event listeners and provides comprehensive debugging and monitoring capabilities. The system has been enhanced in v2.0.0 with advanced debugging tools, performance monitoring, and detailed logging.

**Version:** 2.0.0  
**Last Updated:** 2025-01-27  
**File Location:** `trading-ui/scripts/event-handler-manager.js`

## Architecture

### Core Components

1. **Event Registry** - Detailed metadata about each registered listener
2. **Event Tracking** - History of event executions (last 100 events)
3. **Performance Monitoring** - Execution time tracking and slow handler detection
4. **Error Collection** - Detailed error information with full context
5. **Debug API** - Comprehensive debugging tools accessible via `window.EventHandlerManager.debug.*`

### Event Delegation

The system uses global event delegation for common events:

- **Click** (capture phase) - Main click handler
- **Change** - Form field changes
- **Input** - Input events for validation/search
- **Blur** - Field blur events for validation

All delegated handlers are wrapped with performance tracking and logging.

## Features

### 1. Event Listener Management

- **Deduplication** - Prevents duplicate event listener registrations
- **Metadata Tracking** - Tracks source, timestamp, stack trace, and performance data
- **Lifecycle Management** - Proper cleanup and removal of listeners

### 2. Performance Monitoring

- **Execution Time Tracking** - Measures execution time for each handler
- **Slow Handler Detection** - Identifies handlers exceeding performance threshold (100ms)
- **Performance Statistics** - Aggregated statistics per handler
- **Memory Leak Detection** - Tracks handlers that aren't properly cleaned up

### 3. Debugging Tools

- **Event History** - Last 100 events with full context
- **Error Reporting** - Detailed error information with stack traces
- **Statistics** - Comprehensive event statistics
- **Handler Information** - Detailed information about each handler
- **Event Simulation** - Simulate events for testing

### 4. Logging Integration

- **Logger Service Integration** - All logs go through `window.Logger`
- **Log Levels** - DEBUG, INFO, WARN, ERROR with appropriate verbosity
- **Context Building** - Rich context information for each log entry
- **Stack Traces** - Optional stack trace collection in DEBUG mode

## API Reference

### Global Access

The system is available globally as `window.EventHandlerManager`.

```javascript
// Access the manager
const manager = window.EventHandlerManager;

// Access debug API
const debug = window.EventHandlerManager.debug;
```

### Main Methods

#### `init()`

Initialize the event handler system. Called automatically when DOM is ready.

```javascript
window.EventHandlerManager.init();
```

#### `addEventListener(eventName, handler, options)`

Add an event listener with deduplication and tracking.

**Parameters:**

- `eventName` (string) - Event name (e.g., 'click', 'change')
- `handler` (Function) - Event handler function
- `options` (Object, optional) - Event options (e.g., { capture: true })

**Returns:** `boolean` - True if listener was added, false if duplicate

**Example:**

```javascript
const added = window.EventHandlerManager.addEventListener('click', handleClick, { capture: true });
```

#### `removeEventListener(eventName, handler)`

Remove a previously registered event listener.

**Parameters:**

- `eventName` (string) - Event name
- `handler` (Function) - Event handler function (must be same reference)

**Returns:** `boolean` - True if listener was removed, false if not found

**Example:**

```javascript
const removed = window.EventHandlerManager.removeEventListener('click', handleClick);
```

#### `cleanup()`

Clean up all event listeners and reset the system.

**Example:**

```javascript
window.EventHandlerManager.cleanup();
```

### Debug API

All debugging tools are accessible via `window.EventHandlerManager.debug.*`.

#### `debug.getListeners()`

Get all listeners with detailed information.

**Returns:** `Array` - Array of listener objects with full metadata

**Example:**

```javascript
const listeners = window.EventHandlerManager.debug.getListeners();
console.log('Total listeners:', listeners.length);
console.log('First listener:', listeners[0]);
```

#### `debug.getEventHistory(count)`

Get event history (last N events).

**Parameters:**

- `count` (number, optional) - Number of events to return (default: 50)

**Returns:** `Array` - Array of recent event entries (most recent first)

**Example:**

```javascript
const recentEvents = window.EventHandlerManager.debug.getEventHistory(20);
recentEvents.forEach(event => {
    console.log(`${event.eventType}: ${event.handlerKey} - ${event.executionTime}ms`);
});
```

#### `debug.getStatistics()`

Get comprehensive statistics.

**Returns:** `Object` - Statistics object with all metrics

**Example:**

```javascript
const stats = window.EventHandlerManager.debug.getStatistics();
console.log('Total events:', stats.totalEvents);
console.log('Events by type:', stats.eventsByType);
console.log('Slow handlers:', stats.slowHandlers);
```

**Statistics Object Structure:**

```javascript
{
    totalEvents: number,
    eventsByType: { [eventType]: count },
    eventsByHandler: { [handlerKey]: count },
    errorsByType: { [eventType]: errorCount },
    performanceByHandler: {
        [handlerKey]: {
            total: number,
            count: number,
            avg: number,
            min: number,
            max: number
        }
    },
    slowHandlers: Array<{
        handlerKey: string,
        executionTime: number,
        threshold: number,
        timestamp: number,
        element: string
    }>,
    totalListeners: number,
    totalErrors: number,
    debugMode: boolean,
    performanceTracking: boolean
}
```

#### `debug.getHandlerInfo(handlerKey)`

Get detailed information about a specific handler.

**Parameters:**

- `handlerKey` (string) - Handler key (format: "eventName:handlerName")

**Returns:** `Object|null` - Handler information or null if not found

**Example:**

```javascript
const info = window.EventHandlerManager.debug.getHandlerInfo('click:handleClick');
if (info) {
    console.log('Call count:', info.callCount);
    console.log('Average execution time:', info.performance.avg);
    console.log('Last called:', new Date(info.lastCalled));
}
```

#### `debug.findListenersForElement(selector)`

Find all listeners for a specific element.

**Parameters:**

- `selector` (string) - CSS selector for the element

**Returns:** `Array` - Array of matching listeners

**Example:**

```javascript
const listeners = window.EventHandlerManager.debug.findListenersForElement('#myButton');
```

#### `debug.findListenersForEvent(eventName)`

Find all listeners for a specific event type.

**Parameters:**

- `eventName` (string) - Event name (click, change, etc.)

**Returns:** `Array` - Array of listeners for this event

**Example:**

```javascript
const clickListeners = window.EventHandlerManager.debug.findListenersForEvent('click');
```

#### `debug.simulateEvent(eventName, elementSelector, eventData)`

Simulate an event on an element.

**Parameters:**

- `eventName` (string) - Event name to simulate
- `elementSelector` (string) - CSS selector for target element
- `eventData` (Object, optional) - Additional event data

**Returns:** `boolean` - True if event was dispatched

**Example:**

```javascript
window.EventHandlerManager.debug.simulateEvent('click', '#myButton', { button: 0 });
```

#### `debug.enableVerboseLogging()`

Enable verbose logging mode.

**Example:**

```javascript
window.EventHandlerManager.debug.enableVerboseLogging();
```

#### `debug.disableVerboseLogging()`

Disable verbose logging mode.

**Example:**

```javascript
window.EventHandlerManager.debug.disableVerboseLogging();
```

#### `debug.getErrorReport()`

Get error report with all errors and context.

**Returns:** `Object` - Error report object

**Example:**

```javascript
const errorReport = window.EventHandlerManager.debug.getErrorReport();
console.log('Total errors:', errorReport.total);
console.log('Recent errors:', errorReport.recentErrors);
```

**Error Report Structure:**

```javascript
{
    total: number,
    errors: Array<{
        timestamp: number,
        eventType: string,
        handlerKey: string,
        error: {
            message: string,
            name: string,
            stack: string
        },
        element: string,
        context: Object
    }>,
    errorsByType: { [eventType]: count },
    recentErrors: Array<ErrorObject> // Last 10 errors
}
```

#### `debug.clearHistory()`

Clear event history.

**Example:**

```javascript
window.EventHandlerManager.debug.clearHistory();
```

#### `debug.clearStatistics()`

Clear all statistics.

**Example:**

```javascript
window.EventHandlerManager.debug.clearStatistics();
```

## Event Patterns

### data-onclick

The primary method for handling button clicks in TikTrack.

```html
<button data-onclick="openModal('account')">Open Account Modal</button>
```

### data-onchange

Similar to data-onclick but for change events.

```html
<select data-onchange="handleStatusChange(this.value)">
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
</select>
```

### data-action

Generic action handler for CRUD operations.

```html
<button data-action="add" data-entity-type="account">Add Account</button>
<button data-action="edit" data-entity-type="account" data-entity-id="123">Edit</button>
<button data-action="delete" data-entity-type="account" data-entity-id="123">Delete</button>
```

### data-modal-trigger

Trigger modal dialogs.

```html
<button data-modal-trigger="add" data-entity-type="account">Add Account</button>
```

### TOGGLE Buttons

Auto-wired to nearest section container.

```html
<button data-button-type="TOGGLE">Toggle Section</button>
```

## Debug Mode

Debug mode is automatically enabled when:

- Running on localhost (127.0.0.1, 0.0.0.0)
- URL contains `debug=true` or `dev=true`
- Port is 8080 (development)

In debug mode:

- Performance tracking is enabled
- Stack traces are collected
- Verbose logging is available
- All debugging tools are accessible

## Performance Considerations

1. **Event History** - Limited to last 100 events (circular buffer)
2. **Error Collection** - Limited to last 50 errors
3. **Performance Tracking** - Only enabled in DEBUG mode by default
4. **Stack Traces** - Only collected in DEBUG mode (expensive operation)
5. **Verbose Logging** - Can be enabled/disabled via debug API

## Troubleshooting

### Event Not Firing

1. Check if listener is registered:

   ```javascript
   const listeners = window.EventHandlerManager.debug.getListeners();
   console.log(listeners);
   ```

2. Check event history:

   ```javascript
   const history = window.EventHandlerManager.debug.getEventHistory();
   console.log(history);
   ```

3. Check for errors:

   ```javascript
   const errors = window.EventHandlerManager.debug.getErrorReport();
   console.log(errors.recentErrors);
   ```

### Slow Performance

1. Check for slow handlers:

   ```javascript
   const stats = window.EventHandlerManager.debug.getStatistics();
   console.log('Slow handlers:', stats.slowHandlers);
   ```

2. Check handler performance:

   ```javascript
   const info = window.EventHandlerManager.debug.getHandlerInfo('click:myHandler');
   console.log('Average execution time:', info.performance.avg);
   ```

### Duplicate Event Listeners

The system automatically prevents duplicates. Check if listener already exists:

```javascript
const listeners = window.EventHandlerManager.debug.getListeners();
const existing = listeners.find(l => l.handlerName === 'myHandler');
if (existing) {
    console.log('Listener already exists:', existing);
}
```

## Related Documentation

- [Event Handler Debugging Guide](../../03-DEVELOPMENT/GUIDES/EVENT_HANDLER_DEBUGGING_GUIDE.md)
- [General Systems List](../../frontend/GENERAL_SYSTEMS_LIST.md)
- [Logger Service](../../02-ARCHITECTURE/FRONTEND/LOGGER_SERVICE.md)
- [Button System](../../frontend/button-system.md)

## Version History

### v2.0.0 (2025-01-27)

- Added advanced debugging and monitoring capabilities
- Integrated with Logger Service
- Added performance tracking
- Added comprehensive Debug API
- Enhanced error reporting
- Added event history and statistics

### v1.0.0 (2025-01-26)

- Initial release
- Basic event delegation
- Duplicate listener prevention
