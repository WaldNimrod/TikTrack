# Button System - TikTrack

## Overview

מערכת כפתורי פעולה מאוחדת לכל הטבלאות והרכיבים בפרויקט.

## Files

- `trading-ui/scripts/button-system-init.js` - אתחול מערכת הכפתורים
- `trading-ui/scripts/button-icons.js` - מיפוי איקונים לכפתורים

## Usage

```javascript
// יצירת כפתור פעולה
const button = window.ButtonSystem.createActionButton({
  text: 'עריכה',
  icon: 'edit',
  onclick: 'editItem(123)'
});
```

## Features

- יצירת כפתורי פעולה אחידים
- תמיכה בעבודה עם `data-onclick`
- כללי נגישות מובנים
- איקונים מאוחדים

## Status

✅ Active - in use across all tables and components
