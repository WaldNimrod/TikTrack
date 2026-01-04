# Color Scheme System

## Overview

ניהול צבעים גלובלי עם יישום צבעי המותג והפחתת התנגשויות.

## Colors

### Brand Colors

- **Primary:** #26baac (Turquoise-Green)
- **Secondary:** #fc5a06 (Orange-Red)
- **Success:** #28a745
- **Error:** #dc3545
- **Warning:** #ffc107
- **Info:** #17a2b8

## Files

- `trading-ui/scripts/color-scheme-system.js` - ניהול צבעים

## Features

- ניהול צבעים מרכזי
- יישום צבעי מותג אחיד
- מניעת התנגשויות CSS
- תמיכה ב-Themes

## API

```javascript
// קבלת צבע לפי שימוש
const primaryColor = window.ColorScheme.getColor('primary');
const successColor = window.ColorScheme.getColor('success');

// יישום צבע על אלמנט
element.style.color = window.ColorScheme.getColor('primary');
```

## Status

✅ **ACTIVE** - Applied across all UI components
