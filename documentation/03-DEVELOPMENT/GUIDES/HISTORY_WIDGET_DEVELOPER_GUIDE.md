# History Widget Developer Guide

## Overview

מדריך מפתחים לוידג'ט History - הצגת היסטוריית פעולות ומסחר.

## File

- `trading-ui/scripts/widgets/history-widget.js`

## Features

- הצגת היסטוריית עסקאות
- פילטור לפי תקופה
- הצגת ביצועים
- ייצוא ל-CSV/PDF

## API

```javascript
// אתחול הוידג'ט
const historyWidget = new HistoryWidget({
  container: '#history-container',
  entityType: 'trades',
  dateRange: '30d'
});

// טעינת נתונים
await historyWidget.loadData();

// רינדור
historyWidget.render();
```

## Configuration Options

- `entityType`: סוג הישות (trades, executions, etc.)
- `dateRange`: טווח תאריכים
- `filters`: פילטרים נוספים
- `exportFormats`: פורמטי ייצוא

## Status

✅ **ACTIVE** - Used in portfolio and analysis views
