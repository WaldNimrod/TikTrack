# Conditions System Dev Playbook

## Overview

מדריך מפתחים מלא למערכת התנאים – ארכיטקטורה, זרימות Modal, בדיקות, Plan→Trade→Alert.

## Architecture

### Core Components

- **Conditions Builder** - בניית תנאים מורכבים
- **Conditions Evaluator** - הערכת תנאים בזמן אמת
- **Conditions Renderer** - הצגת תנאים בממשק

### Modal Flows

#### Plan Conditions Modal

```javascript
// יצירת תנאי לתוכנית מסחר
const planConditions = ConditionsBuilder.createPlanConditions({
  entry: 'price > 100',
  exit: 'price < 90 OR time > 1h'
});
```

#### Trade Alert Conditions Modal

```javascript
// יצירת התראות למסחר
const tradeAlerts = ConditionsBuilder.createTradeAlerts({
  stopLoss: 'price < entry - 5%',
  takeProfit: 'price > entry + 10%'
});
```

## Development Guidelines

### Adding New Condition Types

1. הוסף ל-`conditionTypes.js`
2. עדכן `ConditionsRenderer`
3. הוסף ל-`ConditionsEvaluator`
4. צור unit tests

### Modal Integration

```javascript
// פתיחת modal תנאים
ModalManager.open('conditions-builder', {
  context: 'trade_plan',
  entityId: planId,
  onSave: (conditions) => saveConditions(conditions)
});
```

## Testing Strategy

### Unit Tests

- כל סוג תנאי
- כל operator לוגי
- כל context (Plan/Trade/Alert)

### Integration Tests

- Modal flows
- Save/Load conditions
- Real-time evaluation

## Status

✅ **ACTIVE** - Core system for trading conditions
