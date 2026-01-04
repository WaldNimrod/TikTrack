# Alert Condition System

## Overview

מערכת רינדור תנאי התראות עם תמיכה מלאה בשיטות המסחר.

## File

- `trading-ui/scripts/services/alert-condition-renderer.js`

## Features

- רינדור תנאי מורכבים
- תמיכה בכל שיטות המסחר
- תצוגה ויזואלית ברורה
- עריכה דינמית

## Supported Conditions

### Price Conditions

- `price > 100` - מחיר גבוה מ-100
- `price < 50` - מחיר נמוך מ-50
- `price_change > 5%` - שינוי מחיר > 5%

### Volume Conditions

- `volume > 1000` - נפח > 1000
- `volume_spike` - עלייה חדה בנפח

### Technical Conditions

- `rsi > 70` - RSI גבוה מ-70
- `macd_crossover` - חציית MACD
- `bollinger_breakout` - פריצת בולינגר

## API

```javascript
// רינדור תנאי
const html = window.AlertConditionRenderer.render(condition);

// עריכת תנאי
const editor = window.AlertConditionRenderer.createEditor(condition, (updated) => {
  console.log('Condition updated:', updated);
});
```

## Status

✅ **ACTIVE** - Used in alert creation and editing
