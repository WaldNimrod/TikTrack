# Notification System Architecture

## Overview

שכבת התראות אחידה לכל סוגי ההתראות: Success, Error, Info, Warning, Details.

## File

- `trading-ui/scripts/notification-system.js`

## Features

- התראות מובנות עם איקונים
- תמיכה ב-RTL
- אנימציות כניסה/יציאה
- סגירה אוטומטית או ידנית
- היסטוריית התראות

## API

```javascript
// הצגת התראת הצלחה
window.NotificationSystem.showSuccess('הפעולה הושלמה בהצלחה');

// הצגת שגיאה
window.NotificationSystem.showError('אירעה שגיאה', errorDetails);

// התראת מידע
window.NotificationSystem.showInfo('מידע חשוב');

// אזהרה
window.NotificationSystem.showWarning('שים לב');

// התראה מפורטת
window.NotificationSystem.showDetails('כותרת', 'תוכן מפורט', 'success');
```

## Integration

המערכת משולבת עם כל רכיבי ה-CRUD:

- שמירת נתונים
- מחיקת פריטים
- שגיאות API
- הודעות אישור

## Status

✅ **ACTIVE** - Used across all pages and operations
