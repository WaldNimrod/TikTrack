# Section Toggle System

## Overview

פונקציות משותפות ל-Toggle, Refresh, טיפול בפעולות UI כלליות.

## Files

- `trading-ui/scripts/ui-utils.js`
- `trading-ui/scripts/section-toggle-system.js`

## Features

### Toggle Operations

- הצגה/הסתרה של sections
- שמירת מצב ב-localStorage
- אנימציות smooth transitions
- RTL support

### Refresh Operations

- רענון נתוני section
- שמירת scroll position
- Loading indicators
- Error handling

## API

```javascript
// Toggle section
SectionToggle.toggle('trade-details', true);

// Refresh section
await SectionToggle.refresh('portfolio-table');

// שמירת מצב
SectionToggle.saveState('trade-details', { expanded: true });

// טעינת מצב
const state = SectionToggle.loadState('trade-details');
```

## Integration

משולב עם:

- Header system
- Filter system
- Table system
- Modal system

## Status

✅ **ACTIVE** - Core UI interaction system
