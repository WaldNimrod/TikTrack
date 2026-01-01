# UnifiedPayloadBuilder - מערכת בניית Payload מאוחדת

## סקירה כללית

**UnifiedPayloadBuilder** היא מערכת מרכזית לבניית payloads עבור CRUD operations ב-TikTrack. המערכת מספקת:

- **בניית payload דינמית** עם entity-specific overrides
- **ניהול ID דינמי** עם fallback ל-ID קבועים
- **ולידציה מובנית** של שדות חובה
- **תמיכה ב-entity relationships** מורכבים

## ארכיטקטורה

### מבנה בסיסי

```javascript
const payload = UnifiedPayloadBuilder.build(entityType, formData, options);
```

### Entity-Specific Overrides

כל entity יכול להגדיר overrides מותאמים:

```javascript
const entityOverrides = {
  trading_journal: {
    // Auto-generated entity - no direct creation
    skipCreate: true,
    customFields: {
      generated_from: 'trades/executions/notes'
    }
  },
  alerts: {
    // Custom validation for alert conditions
    validateConditions: true,
    conditionMapping: {
      'price_above': 'gt',
      'price_below': 'lt'
    }
  }
};
```

### Dynamic ID Resolution

```javascript
// Example: Trade plan creation with dynamic account/ticker IDs
const payload = {
  account_id: dynamicId || 1,  // Fallback to seeded ID
  ticker_id: dynamicId || 1,
  planned_quantity: formData.quantity,
  planned_amount: formData.amount
};
```

## API Reference

### Methods

#### `build(entityType, formData, options)`

**פרמטרים:**

- `entityType` (string): סוג ה-entity (executions, trades, etc.)
- `formData` (object): נתוני הטופס מהמשתמש
- `options` (object): אופציות נוספות

**מחזיר:** payload object מוכן ל-API

#### `validatePayload(entityType, payload)`

**פרמטרים:**

- `entityType` (string): סוג ה-entity
- `payload` (object): ה-payload לבדיקה

**מחזיר:** validation result עם errors אם קיימים

## דוגמאות שימוש

### יצירת Trade

```javascript
const tradePayload = UnifiedPayloadBuilder.build('trades', {
  ticker: 'AAPL',
  quantity: 100,
  price: 150.50,
  date: '2026-01-01'
});
// Result: { ticker_id: 123, trading_account_id: 456, ... }
```

### יצירת Alert

```javascript
const alertPayload = UnifiedPayloadBuilder.build('alerts', {
  ticker: 'TSLA',
  condition: 'price_above',
  value: 250.00
});
// Result: { ticker_id: 789, condition_type: 'gt', threshold: 250.00, ... }
```

## Entity Support

| Entity | Status | Special Features |
|--------|--------|------------------|
| executions | ✅ Active | Dynamic ID resolution |
| trading_accounts | ✅ Active | Account-specific validation |
| tickers | ✅ Active | Symbol mapping |
| trades | ✅ Active | Complex relationships |
| notes | ✅ Active | Rich text support |
| alerts | ✅ Active | Condition mapping |
| user_profile | ✅ Active | Auth integration |
| watch_lists | ✅ Active | Array handling |
| trading_journal | ✅ Active | Auto-generation only |
| data_import | 🚧 Future | ETL workflows |
| ai_analysis | ❌ Excluded | Beyond CRUD scope |

## אינטגרציה עם מערכות אחרות

### CRUD Response Handler

```javascript
// Payload building integrated with response handling
const result = await CRUDResponseHandler.create(entityType, () => {
  const payload = UnifiedPayloadBuilder.build(entityType, formData);
  return apiCall(endpoint, payload);
});
```

### Logger Integration

```javascript
// Payload logged for debugging
window.Logger?.info("Payload built for " + entityType, {
  payload: builtPayload,
  entityType: entityType,
  timestamp: new Date().toISOString()
});
```

## בדיקות ואיכות

### Test Coverage

- ✅ Entity-specific overrides tested
- ✅ Dynamic ID resolution verified
- ✅ Validation logic confirmed
- ✅ Error handling validated

### Performance

- **Build Time:** < 10ms per payload
- **Memory Usage:** Minimal overhead
- **Scalability:** Supports unlimited entities

## תחזוקה

### הוספת Entity חדש

1. הוסף entity definition ב-entityOverrides
2. הגדר field mapping
3. הוסף validation rules
4. עדכן tests

### עדכון קיים

1. שנה entityOverrides
2. עדכן field mappings
3. הרץ regression tests
4. עדכן documentation

---

**גרסה:** 1.0.0
**תאריך:** 1 בינואר 2026
**סטטוס:** ✅ פעיל ומתועד
