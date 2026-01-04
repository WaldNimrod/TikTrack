# LocalStorage Events System

## Overview

מערכת אירועים ל-localStorage לשיתוף נתונים בין tabs/windows.

## File

- `trading-ui/scripts/localstorage-events.js`

## Features

- אירועים בין tabs שונים
- סנכרון מצב משתמש
- עדכוני נתונים בזמן אמת
- מניעת conflicts

## API

```javascript
// האזנה לאירועים
window.LocalStorageEvents.on('user_settings_changed', (data) => {
  console.log('Settings updated:', data);
});

// שליחת אירוע לכל ה-tabs
window.LocalStorageEvents.emit('trade_updated', {
  tradeId: 123,
  action: 'modified'
});

// הסרת האזנה
window.LocalStorageEvents.off('user_settings_changed');
```

## Event Types

- `user_settings_changed` - שינוי הגדרות משתמש
- `trade_updated` - עדכון עסקה
- `data_refreshed` - רענון נתונים
- `session_expired` - תפוגת session

## Implementation

משתמש ב-StorageEvent API של הדפדפן:

- `storage` event על window
- localStorage כערוץ תקשורת
- JSON serialization/deserialization

## Status

✅ **ACTIVE** - Used for multi-tab synchronization
