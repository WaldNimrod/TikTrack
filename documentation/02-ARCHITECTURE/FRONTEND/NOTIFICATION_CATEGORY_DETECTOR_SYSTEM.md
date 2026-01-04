# Notification Category Detector System

## Overview

מערכת זיהוי קטגוריות התראות אוטומטית לפי סוג האירוע והקשר.

## File

- `trading-ui/scripts/notification-category-detector.js`

## Features

- זיהוי אוטומטי של סוג ההתראה
- התאמת איקונים וצבעים
- קביעת משך תצוגה
- ניתוב להיסטוריה מתאימה

## Detection Logic

```javascript
// זיהוי לפי סוג פעולה
const category = window.NotificationCategoryDetector.detect({
  action: 'save',
  entity: 'trade',
  result: 'success'
});
// מחזיר: { type: 'success', icon: 'check', duration: 3000 }
```

## Categories

- **success** - פעולות שהצליחו (ירוק, V)
- **error** - שגיאות (אדום, X)
- **warning** - אזהרות (כתום, !)
- **info** - מידע כללי (כחול, i)

## Status

✅ **ACTIVE** - Integrated with notification system
