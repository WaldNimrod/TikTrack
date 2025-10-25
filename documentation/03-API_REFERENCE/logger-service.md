# Logger Service - API Reference

## Overview
שירות לוגים מתקדם עם אינטגרציה לשרת, batching, שמירה מקומית וניטור ביצועים.

## Core Logging Functions

### `Logger.debug(message, data)`
הצגת הודעת דיבג

**Parameters:**
- `message` (string) - הודעת הלוג
- `data` (object, optional) - נתונים נוספים

**Returns:** `void`

**Example:**
```javascript
// Basic debug log
Logger.debug('User clicked button', { buttonId: 'edit-btn' });

// Debug with data
Logger.debug('API call started', { endpoint: '/api/trades', method: 'GET' });
```

### `Logger.info(message, data)`
הצגת הודעת מידע

**Parameters:**
- `message` (string) - הודעת הלוג
- `data` (object, optional) - נתונים נוספים

**Returns:** `void`

**Example:**
```javascript
// Basic info log
Logger.info('User logged in successfully');

// Info with data
Logger.info('Data loaded', { count: 150, source: 'database' });
```

### `Logger.warn(message, data)`
הצגת הודעת אזהרה

**Parameters:**
- `message` (string) - הודעת הלוג
- `data` (object, optional) - נתונים נוספים

**Returns:** `void`

**Example:**
```javascript
// Basic warning
Logger.warn('Cache miss detected');

// Warning with data
Logger.warn('Slow API response', { duration: 5000, endpoint: '/api/data' });
```

### `Logger.error(message, data)`
הצגת הודעת שגיאה

**Parameters:**
- `message` (string) - הודעת הלוג
- `data` (object, optional) - נתונים נוספים

**Returns:** `void`

**Example:**
```javascript
// Basic error
Logger.error('Failed to load data');

// Error with data
Logger.error('API call failed', { 
    endpoint: '/api/trades', 
    status: 500, 
    error: errorMessage 
});
```

### `Logger.critical(message, data)`
הצגת הודעת קריטית

**Parameters:**
- `message` (string) - הודעת הלוג
- `data` (object, optional) - נתונים נוספים

**Returns:** `void`

**Example:**
```javascript
// Critical error
Logger.critical('System failure detected');

// Critical with data
Logger.critical('Database connection lost', { 
    database: 'main', 
    error: 'Connection timeout' 
});
```

## Log Level Management

### `Logger.setLevel(level)`
הגדרת רמת לוג

**Parameters:**
- `level` (number) - רמת לוג (0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=CRITICAL)

**Returns:** `void`

**Example:**
```javascript
// Set to debug level (show all logs)
Logger.setLevel(Logger.LogLevel.DEBUG);

// Set to error level (show only errors and critical)
Logger.setLevel(Logger.LogLevel.ERROR);
```

### `Logger.getLevel()`
קבלת רמת לוג נוכחית

**Returns:** `number` - רמת לוג נוכחית

**Example:**
```javascript
const currentLevel = Logger.getLevel();
console.log('Current log level:', currentLevel);
```

## Performance Monitoring

### `Logger.startTimer(name)`
התחלת טיימר ביצועים

**Parameters:**
- `name` (string) - שם הטיימר

**Returns:** `void`

**Example:**
```javascript
// Start performance timer
Logger.startTimer('data-loading');

// ... do work ...

// End timer (automatically logged)
Logger.endTimer('data-loading');
```

### `Logger.endTimer(name)`
סיום טיימר ביצועים

**Parameters:**
- `name` (string) - שם הטיימר

**Returns:** `void`

**Example:**
```javascript
// End performance timer
Logger.endTimer('data-loading');
// Automatically logs: "Performance: data-loading took 150ms"
```

### `Logger.measurePerformance(name, fn)`
מדידת ביצועים של פונקציה

**Parameters:**
- `name` (string) - שם המדידה
- `fn` (function) - פונקציה למדידה

**Returns:** `any` - תוצאת הפונקציה

**Example:**
```javascript
// Measure function performance
const result = Logger.measurePerformance('data-processing', () => {
    return processData(largeDataset);
});
```

## Log Management

### `Logger.flush()`
שליחת כל הלוגים הממתינים לשרת

**Returns:** `Promise<void>`

**Example:**
```javascript
// Force flush all pending logs
await Logger.flush();
```

### `Logger.clear()`
מחיקת כל הלוגים המקומיים

**Returns:** `void`

**Example:**
```javascript
// Clear all local logs
Logger.clear();
```

### `Logger.getLogs(level)`
קבלת לוגים לפי רמה

**Parameters:**
- `level` (string, optional) - רמת לוג ספציפית

**Returns:** `array` - רשימת לוגים

**Example:**
```javascript
// Get all logs
const allLogs = Logger.getLogs();

// Get only error logs
const errorLogs = Logger.getLogs('error');
```

### `Logger.exportLogs(format)`
ייצוא לוגים לפורמט

**Parameters:**
- `format` (string) - פורמט ייצוא ('json', 'csv', 'txt')

**Returns:** `string` - לוגים בפורמט המבוקש

**Example:**
```javascript
// Export logs as JSON
const jsonLogs = Logger.exportLogs('json');

// Export logs as CSV
const csvLogs = Logger.exportLogs('csv');
```

## Server Integration

### `Logger.sendToServer(logs)`
שליחת לוגים לשרת

**Parameters:**
- `logs` (array) - רשימת לוגים

**Returns:** `Promise<boolean>` - true אם נשלח בהצלחה

**Example:**
```javascript
// Send specific logs to server
const success = await Logger.sendToServer([log1, log2, log3]);
```

### `Logger.setServerEndpoint(endpoint)`
הגדרת endpoint לשרת

**Parameters:**
- `endpoint` (string) - URL של השרת

**Returns:** `void`

**Example:**
```javascript
// Set server endpoint
Logger.setServerEndpoint('/api/logs');
```

## Configuration

### `Logger.setConfig(config)`
הגדרת תצורת הלוגר

**Parameters:**
- `config` (object) - תצורת הלוגר
  - `batchSize` (number) - גודל אצווה
  - `batchTimeout` (number) - timeout לאצווה
  - `maxRetries` (number) - מקסימום ניסיונות
  - `retryDelay` (number) - עיכוב בין ניסיונות

**Returns:** `void`

**Example:**
```javascript
// Configure logger
Logger.setConfig({
    batchSize: 20,
    batchTimeout: 3000,
    maxRetries: 5,
    retryDelay: 2000
});
```

## Usage Examples

### Basic Logging
```javascript
// Different log levels
Logger.debug('Debug information');
Logger.info('User action completed');
Logger.warn('Potential issue detected');
Logger.error('Operation failed');
Logger.critical('System error');
```

### Performance Monitoring
```javascript
// Measure function performance
const result = Logger.measurePerformance('data-processing', () => {
    return processLargeDataset(data);
});

// Manual timing
Logger.startTimer('api-call');
await fetchData();
Logger.endTimer('api-call');
```

### Error Handling
```javascript
try {
    const data = await fetchData();
    Logger.info('Data fetched successfully', { count: data.length });
} catch (error) {
    Logger.error('Failed to fetch data', { 
        error: error.message,
        stack: error.stack 
    });
}
```

### Batch Logging
```javascript
// Multiple logs will be batched automatically
Logger.info('User started process');
Logger.info('Data validation passed');
Logger.info('Processing started');
// All three logs will be sent together
```

## Best Practices

1. **Use appropriate log levels:**
   ```javascript
   // Good - appropriate levels
   Logger.debug('Variable value', { value: x });
   Logger.info('User action', { action: 'login' });
   Logger.error('API failed', { endpoint: '/api/data' });
   ```

2. **Include relevant data:**
   ```javascript
   // Good - with context
   Logger.error('Database query failed', {
       query: 'SELECT * FROM trades',
       error: error.message,
       userId: currentUser.id
   });
   ```

3. **Use performance monitoring:**
   ```javascript
   // Good - measure performance
   const result = Logger.measurePerformance('data-processing', () => {
       return processData(data);
   });
   ```

4. **Handle errors gracefully:**
   ```javascript
   try {
       // Your code
   } catch (error) {
       Logger.error('Operation failed', {
           operation: 'data-loading',
           error: error.message,
           stack: error.stack
       });
   }
   ```

## Dependencies
- Unified Cache Manager (for local storage)
- Notification System (for error notifications)
- Server API (for log transmission)

## File Location
`trading-ui/scripts/logger-service.js`

## Version
2.0.0 (Last updated: January 2025)

## Features
- 5 log levels (DEBUG, INFO, WARN, ERROR, CRITICAL)
- Automatic batching and server transmission
- Performance monitoring and timing
- Local storage with export capabilities
- Error handling and retry logic
- Integration with unified cache system
