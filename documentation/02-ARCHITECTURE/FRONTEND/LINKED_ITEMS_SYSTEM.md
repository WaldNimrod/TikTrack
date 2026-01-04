# Linked Items System

## Overview

רשימות פריטים מקושרים, פורמט תצוגה וכפתורי פעולה אחידים.

## File

- `trading-ui/scripts/services/linked-items-service.js`

## Features

### Entity Relationships

- הצגת פריטים מקושרים
- ניווט בין ישויות
- פעולות על קשרים
- היסטוריית קשרים

### Display Formats

- רשימה קומפקטית
- טבלה מורחבת
- Cards view
- Tree view (היררכי)

## API

```javascript
// קבלת פריטים מקושרים
const linkedTrades = await LinkedItemsService.getLinkedItems('execution', executionId, 'trade');

// הצגת רשימה
LinkedItemsService.renderLinkedList('#linked-container', linkedTrades, {
  showActions: true,
  allowEdit: true,
  allowDelete: false
});

// הוספת קשר
await LinkedItemsService.linkItems('trade', tradeId, 'note', noteId);

// הסרת קשר
await LinkedItemsService.unlinkItems('trade', tradeId, 'note', noteId);
```

## Supported Relationships

### Direct Relationships

- **Trade ↔ Execution**: מסחר לביצועים
- **Trade ↔ Note**: מסחר להערות
- **Trade ↔ Alert**: מסחר להתראות
- **Account ↔ Trade**: חשבון למסחר

### Indirect Relationships

- **Execution → Trade → Account**: דרך מסחר
- **Note → Trade → Portfolio**: דרך מסחר
- **Alert → Trade → Strategy**: דרך מסחר

## UI Components

### Linked Items Widget

```html
<div class="linked-items-widget">
  <div class="linked-header">
    <h4>פריטים מקושרים</h4>
    <button class="add-link-btn">+</button>
  </div>
  <div class="linked-list">
    <!-- rendered items -->
  </div>
</div>
```

### Action Buttons

- **View**: הצגת פרטי הפריט
- **Edit**: עריכת הקשר
- **Unlink**: הסרת הקשר
- **Navigate**: מעבר לפריט

## Status

✅ **ACTIVE** - Used for entity relationship management
