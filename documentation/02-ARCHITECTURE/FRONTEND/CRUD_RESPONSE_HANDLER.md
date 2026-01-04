# CRUD Response Handler

## Overview

טיפול בתגובות CRUD, סגירת מודלים, הודעות ושחזור טבלאות.

## File

- `trading-ui/scripts/services/crud-response-handler.js`

## Features

### Response Processing

- ניתוח תגובות API
- זיהוי סוג פעולה (Create/Update/Delete)
- טיפול בשגיאות וב-success

### UI Updates

- סגירת מודלים אוטומטית
- הצגת הודעות משתמש
- רענון טבלאות
- עדכון counters/statistics

### Error Handling

- הצגת שגיאות ברורות
- Logging מפורט
- Recovery mechanisms

## API

```javascript
// טיפול בתגובה CRUD
const result = await CRUDResponseHandler.handle(response, {
  action: 'create',
  entity: 'trade',
  modalId: 'trade-modal',
  tableId: 'trades-table'
});

// טיפול מותאם
CRUDResponseHandler.handleCreate(response, {
  successMessage: 'Trade created successfully',
  onSuccess: () => refreshTradesTable()
});
```

## Integration Points

### With Modal System

- סגירה אוטומטית אחרי success
- שמירת נתונים לפני סגירה
- Validation לפני submit

### With Notification System

- הודעות success/error
- Progress indicators
- Confirmation dialogs

### With Table System

- רענון אוטומטי
- עדכון row counts
- Sort/pagination preservation

## Response Types

### Success Response

```json
{
  "success": true,
  "data": { "id": 123, "name": "New Trade" },
  "message": "Trade created successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Validation failed",
  "details": { "field": "price", "message": "Price must be positive" }
}
```

## Status

✅ **ACTIVE** - Core CRUD operation handler
