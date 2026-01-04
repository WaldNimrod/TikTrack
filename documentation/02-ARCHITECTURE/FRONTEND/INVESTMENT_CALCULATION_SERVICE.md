# Investment Calculation Service

## Overview

שירות חישוב השקעות דו-כיווני עם המרת סכום↔כמות↔מחיר + ריסק ברירת מחדל.

## File

- `trading-ui/scripts/services/investment-calculation-service.js`

## Features

- חישוב דו-כיווני: סכום ↔ כמות ↔ מחיר
- ריסק ברירת מחדל אוטומטי
- המרות מדויקות עם עיגול מתמטי

## API

```javascript
// חישוב כמות לפי סכום ומחיר
const quantity = InvestmentCalculator.calculateQuantity(amount, price);

// חישוב סכום לפי כמות ומחיר
const amount = InvestmentCalculator.calculateAmount(quantity, price);

// חישוב מחיר לפי סכום וכמות
const price = InvestmentCalculator.calculatePrice(amount, quantity);
```

## Status

✅ Active - used in trade calculations
