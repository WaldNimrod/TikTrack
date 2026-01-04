# Logger Service API Reference

## Overview

שירות Logger מאוחד לכל הלוגים בפרויקט TikTrack.

## Methods

### Core Logging Methods

```javascript
// לוג מידע
window.Logger.info(message, context);

// לוג אזהרה
window.Logger.warn(message, context);

// לוג שגיאה
window.Logger.error(message, context);

// לוג שגיאה קריטית
window.Logger.critical(message, context);

// לוג debug (מוסר בפרודקשן)
window.Logger.debug(message, context);
```

### Specialized Methods

```javascript
// לוג פעולת משתמש
window.Logger.userAction(action, details);

// לוג קריאת API
window.Logger.apiCall(endpoint, method, response);

// לוג פעולת cache
window.Logger.cacheOperation(operation, key, result);

// לוג ביצועים
window.Logger.performance(operation, duration, details);
```

## Context Object Structure

```javascript
const context = {
  page: window.location.pathname,
  userId: currentUser?.id,
  sessionId: getSessionId(),
  action: "save_trade",
  entityId: tradeId,
  timestamp: new Date().toISOString(),
  additionalData: { ... }
};
```

## Log Levels

- `DEBUG` - מידע פיתוח (מוסר בפרודקשן)
- `INFO` - אירועים חשובים
- `WARN` - אזהרות
- `ERROR` - שגיאות
- `CRITICAL` - שגיאות קריטיות

## Status

✅ **ACTIVE** - Required for all logging activities
