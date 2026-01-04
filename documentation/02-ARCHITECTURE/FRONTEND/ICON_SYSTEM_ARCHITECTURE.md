# Icon System Architecture

## Overview

מערכת ניהול איקונים מרכזית עם 17 איקוני ישויות מקוריים + Tabler Icons.

## Files

- `trading-ui/scripts/icon-system.js` - ליבה של המערכת
- `trading-ui/scripts/icon-mappings.js` - מיפוי איקונים

## Features

### Core Icons (17)

- `trade` - איקון מסחר
- `execution` - איקון ביצוע
- `alert` - איקון התראה
- `note` - איקון הערה
- `account` - איקון חשבון
- `ticker` - איקון טיקר
- `portfolio` - איקון תיק השקעות
- `analysis` - איקון ניתוח
- `settings` - איקון הגדרות
- ועוד 8 איקונים נוספים

### Tabler Icons Integration

- תמיכה מלאה בספריית Tabler Icons
- איקונים וקטוריים מודרניים
- Auto-fallback למערכת

## API

```javascript
// קבלת איקון לפי סוג
const iconHtml = window.IconSystem.getEntityIcon('trade');

// רינדור איקון עם CSS classes
const iconElement = window.IconSystem.renderIcon('alert', ['icon-small', 'icon-red']);
```

## Status

✅ **ACTIVE** - Used across all entity types and UI components
