# Cache Implementation Guide

## Overview

מדריך יישום Cache עם 4 שכבות: memory, localStorage, IndexedDB, backend.

## Architecture

### Cache Layers (Priority Order)

1. **Memory Cache** - מהיר, נעלם ברענון
2. **localStorage** - קבוע בדפדפן, עד מחיקה
3. **IndexedDB** - נתונים מורכבים, קבוע
4. **Backend API** - מקור הנתונים

### Cache TTL (Time To Live)

כל entry מכיל:

- `timestamp` - זמן יצירה
- `ttl` - זמן חיים בשניות
- `data` - הנתונים עצמם

## API

```javascript
// שמירת נתונים עם TTL
await window.Cache.set('user_trades', tradesData, 300); // 5 דקות

// קריאת נתונים עם fallback
const data = await window.Cache.get('user_trades', async () => {
  return await api.getTrades();
});

// ניקוי cache
await window.Cache.clear(); // כל השכבות
await window.Cache.clearLayer('memory'); // שכבה ספציפית
```

## Cache Keys

- `user_{entity}` - נתוני משתמש
- `static_{type}` - נתונים סטטיים
- `computed_{calculation}` - חישובים

## Status

✅ **ACTIVE** - Used across all data services
