# Cache Sync Specification

## Overview

מפרט טכני לסנכרון Cache בין שכבות שונות במערכת.

## Sync Requirements

### Cache Layers

1. **Memory** - סנכרון מיידי
2. **localStorage** - סנכרון בין tabs
3. **IndexedDB** - סנכרון עם backend
4. **Backend** - מקור האמת

### Sync Triggers

- **User Actions** - עדכון מיידי
- **Timer** - סנכרון תקופתי
- **Network Events** - חיבור/ניתוק
- **Storage Events** - שינויים ב-localStorage

## API

```javascript
// סנכרון ידני
await window.CacheSync.syncAll();

// סנכרון שכבה ספציפית
await window.CacheSync.syncLayer('memory', 'localStorage');

// האזנה לאירועי סנכרון
window.CacheSync.on('sync_completed', (result) => {
  console.log('Sync completed:', result);
});
```

## Conflict Resolution

- **Last Write Wins** - הכתיבה האחרונה מנצחת
- **Version Vectors** - וקטורי גרסאות למניעת conflicts
- **Manual Resolution** - פתרון ידני במקרי קיצון

## Status

✅ **SPECIFIED** - Ready for implementation
