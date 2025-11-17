# תיעוד API - מערכת התנאים
**תאריך יצירה:** 19 אוקטובר 2025  
**תאריך עדכון:** 15 נובמבר 2025  
**גרסה:** 1.1.0  
**מפתח:** AI Assistant  

---

## סקירה כללית

תיעוד זה מפרט את כל ה-API endpoints של מערכת התנאים, כולל פרמטרים, תגובות, ודוגמאות שימוש.

---

## Trading Methods API

### GET /api/trading_methods
קבלת רשימת כל שיטות המסחר הזמינות.

**פרמטרים:**
- `active_only` (optional, boolean): החזר רק שיטות פעילות (ברירת מחדל: true)

**תגובה:**
```json
[
  {
    "id": 1,
    "name_en": "Moving Averages",
    "name_he": "ממוצעים נעים",
    "description_en": "Technical analysis using moving averages",
    "description_he": "ניתוח טכני באמצעות ממוצעים נעים",
    "method_key": "moving_averages",
    "is_active": true,
    "created_at": "2025-10-19T00:00:00Z",
    "updated_at": "2025-10-19T00:00:00Z",
    "parameters": [
      {
        "id": 1,
        "parameter_key": "period",
        "parameter_name_en": "Period",
        "parameter_name_he": "תקופה",
        "parameter_type": "integer",
        "default_value": "20",
        "min_value": "1",
        "max_value": "200",
        "is_required": true,
        "sort_order": 1,
        "help_text_en": "Number of periods for the moving average",
        "help_text_he": "מספר התקופות לממוצע הנע"
      }
    ]
  }
]
```

**דוגמת שימוש:**
```javascript
const response = await fetch('/api/trading_methods?active_only=true');
const methods = await response.json();
```

### GET /api/trading_methods/{id}
קבלת שיטת מסחר ספציפית.

**פרמטרים:**
- `id` (path, integer): ID של שיטת המסחר

**תגובה:**
```json
{
  "id": 1,
  "name_en": "Moving Averages",
  "name_he": "ממוצעים נעים",
  "description_en": "Technical analysis using moving averages",
  "description_he": "ניתוח טכני באמצעות ממוצעים נעים",
  "method_key": "moving_averages",
  "is_active": true,
  "parameters": [...]
}
```

---

## Plan Conditions API

### GET /api/plan_conditions
קבלת תנאים של תכניות מסחר.

**פרמטרים:**
- `plan_id` (optional, integer): ID של תכנית ספציפית
- `active_only` (optional, boolean): החזר רק תנאים פעילים (ברירת מחדל: true)

**תגובה:**
```json
[
  {
    "id": 1,
    "trade_plan_id": 123,
    "method_id": 1,
    "method_name": "Moving Averages",
    "condition_group": 0,
    "parameters_json": "{\"period\": 20, \"type\": \"SMA\", \"comparison\": \"above\"}",
    "logical_operator": "AND",
    "is_active": true,
    "trigger_action": "enter_trade_positive",
    "action_notes": "<p>כניסה עם חצי פוזיציה תוך 5 דקות.</p>",
    "created_at": "2025-10-19T00:00:00Z",
    "updated_at": "2025-10-19T00:00:00Z"
  }
]
```

### POST /api/plan_conditions
יצירת תנאי חדש לתכנית מסחר.

**Body:**
```json
{
  "trade_plan_id": 123,
  "method_id": 1,
  "condition_group": 0,
  "parameters_json": "{\"period\": 20, \"type\": \"SMA\", \"comparison\": \"above\"}",
  "logical_operator": "AND",
  "trigger_action": "enter_trade_positive",
  "action_notes": "<p>נכנסים במידתיות מלאה.</p>"
}
```

**תגובה:**
```json
{
  "id": 1,
  "trade_plan_id": 123,
  "method_id": 1,
  "condition_group": 0,
  "parameters_json": "{\"period\": 20, \"type\": \"SMA\", \"comparison\": \"above\"}",
  "logical_operator": "AND",
  "is_active": true,
  "trigger_action": "enter_trade_positive",
  "action_notes": "<p>נכנסים במידתיות מלאה.</p>",
  "created_at": "2025-10-19T00:00:00Z",
  "updated_at": "2025-10-19T00:00:00Z"
}
```

### PUT /api/plan_conditions/{id}
עדכון תנאי קיים.

**פרמטרים:**
- `id` (path, integer): ID של התנאי

**Body:**
```json
{
  "parameters_json": "{\"period\": 50, \"type\": \"EMA\", \"comparison\": \"below\"}",
  "logical_operator": "OR"
}
```

### DELETE /api/plan_conditions/{id}
מחיקת תנאי.

**פרמטרים:**
- `id` (path, integer): ID של התנאי

**תגובה:**
```json
{
  "message": "Condition deleted successfully",
  "deleted_id": 1
}
```

### POST /api/plan-conditions/{id}/evaluate
הערכת תנאי יחיד מול נתוני שוק נוכחיים.

**פרמטרים:**
- `id` (path, integer): ID של התנאי להערכה

**תגובה:**
```json
{
  "status": "success",
  "data": {
    "condition_id": 1,
    "condition_type": "plan",
    "met": true,
    "evaluation_time": "2025-10-19T22:04:06.611167+00:00",
    "method_id": 1,
    "method_name": "Moving Averages",
    "ticker_id": 4,
    "current_price": 439.31,
    "details": {
      "comparison_type": "above",
      "current_price": 439.31,
      "ma_period": 50,
      "ma_type": "SMA",
      "ma_value": 439.31000000000023,
      "price_vs_ma": -2.2737367544323206e-13,
      "price_vs_ma_pct": -5.175699971392227e-14
    }
  },
  "message": "Condition evaluated successfully"
}
```

### POST /api/plan-conditions/evaluate-all
הערכת כל התנאים הפעילים במערכת.

**תגובה:**
```json
{
  "status": "success",
  "data": [
    {
      "condition_id": 2,
      "condition_type": "plan",
      "met": false,
      "evaluation_time": "2025-10-19T19:04:06.611167+00:00",
      "method_id": 2,
      "method_name": "Volume Analysis",
      "ticker_id": 4,
      "current_price": 439.31,
      "details": {
        "avg_volume": 88293380.0,
        "comparison_type": "above",
        "current_volume": 89331578,
        "threshold_volume": 132440070.0,
        "volume_multiplier": 1.5,
        "volume_period": 20,
        "volume_vs_avg": 1038198.0,
        "volume_vs_avg_pct": 1.175850329888832
      }
    }
  ],
  "count": 14,
  "message": "14 plan conditions evaluated"
}
```

### GET /api/plan-conditions/{id}/evaluation-history
קבלת היסטוריית הערכות של תנאי ספציפי (מתוך התראות שנוצרו).

**פרמטרים:**
- `id` (path, integer): ID של התנאי
- `limit` (optional, integer): מספר התוצאות המקסימלי (ברירת מחדל: 50)

**תגובה:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 42,
      "alert_type": "condition_met",
      "message": "Condition met: Moving Averages - Price above SMA(50)",
      "related_id": 1,
      "related_type_id": 1,
      "triggered_at": "2025-10-19T22:04:06.611167+00:00",
      "is_read": false,
      "created_at": "2025-10-19T22:04:06.611167+00:00"
    }
  ],
  "count": 1,
  "message": "Evaluation history retrieved successfully"
}
```

---

## Trade Conditions API

### GET /api/trade_conditions
קבלת תנאים של טריידים.

**פרמטרים:**
- `trade_id` (optional, integer): ID של טרייד ספציפי
- `active_only` (optional, boolean): החזר רק תנאים פעילים (ברירת מחדל: true)

**תגובה:**
```json
[
  {
    "id": 1,
    "trade_id": 456,
    "method_id": 1,
    "method_name": "Moving Averages",
    "inherited_from_plan_condition_id": 1,
    "condition_group": 0,
    "parameters_json": "{\"period\": 20, \"type\": \"SMA\", \"comparison\": \"above\"}",
    "logical_operator": "AND",
    "is_active": true,
    "created_at": "2025-10-19T00:00:00Z",
    "updated_at": "2025-10-19T00:00:00Z"
  }
]
```

### POST /api/trade_conditions
יצירת תנאי חדש לטרייד.

**Body:**
```json
{
  "trade_id": 456,
  "method_id": 1,
  "inherited_from_plan_condition_id": 1,
  "condition_group": 0,
  "parameters_json": "{\"period\": 20, \"type\": \"SMA\", \"comparison\": \"above\"}",
  "logical_operator": "AND"
}
```

### PUT /api/trade_conditions/{id}
עדכון תנאי טרייד קיים.

### DELETE /api/trade_conditions/{id}
מחיקת תנאי טרייד.

### POST /api/trade-conditions/{id}/evaluate
הערכת תנאי טרייד יחיד מול נתוני שוק נוכחיים.

**פרמטרים:**
- `id` (path, integer): ID של התנאי להערכה

**תגובה:**
```json
{
  "status": "success",
  "data": {
    "condition_id": 1,
    "condition_type": "trade",
    "met": true,
    "evaluation_time": "2025-10-19T22:04:06.611167+00:00",
    "method_id": 1,
    "method_name": "Moving Averages",
    "ticker_id": 4,
    "current_price": 439.31,
    "details": {
      "comparison_type": "above",
      "current_price": 439.31,
      "ma_period": 50,
      "ma_type": "SMA",
      "ma_value": 439.31000000000023,
      "price_vs_ma": -2.2737367544323206e-13,
      "price_vs_ma_pct": -5.175699971392227e-14
    }
  },
  "message": "Condition evaluated successfully"
}
```

### POST /api/trade-conditions/evaluate-all
הערכת כל התנאים הפעילים של טריידים במערכת.

**תגובה:**
```json
{
  "status": "success",
  "data": [
    {
      "condition_id": 1,
      "condition_type": "trade",
      "met": false,
      "evaluation_time": "2025-10-19T19:04:06.611167+00:00",
      "method_id": 1,
      "method_name": "Moving Averages",
      "ticker_id": 4,
      "current_price": 439.31,
      "details": {
        "comparison_type": "above",
        "current_price": 439.31,
        "ma_period": 50,
        "ma_type": "SMA",
        "ma_value": 439.31000000000023,
        "price_vs_ma": -2.2737367544323206e-13,
        "price_vs_ma_pct": -5.175699971392227e-14
      }
    }
  ],
  "count": 5,
  "message": "5 trade conditions evaluated"
}
```

### GET /api/trade-conditions/{id}/evaluation-history
קבלת היסטוריית הערכות של תנאי טרייד ספציפי (מתוך התראות שנוצרו).

**פרמטרים:**
- `id` (path, integer): ID של התנאי
- `limit` (optional, integer): מספר התוצאות המקסימלי (ברירת מחדל: 50)

**תגובה:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 43,
      "alert_type": "condition_met",
      "message": "Trade condition met: Moving Averages - Price above SMA(50)",
      "related_id": 1,
      "related_type_id": 2,
      "triggered_at": "2025-10-19T22:04:06.611167+00:00",
      "is_read": false,
      "created_at": "2025-10-19T22:04:06.611167+00:00"
    }
  ],
  "count": 1,
  "message": "Evaluation history retrieved successfully"
}
```

---

## Validation API

### POST /api/conditions/validate
ולידציה של תנאי.

**Body:**
```json
{
  "method_id": 1,
  "parameters": {
    "period": 20,
    "type": "SMA",
    "comparison": "above"
  }
}
```

**תגובה:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": []
}
```

**תגובה עם שגיאות:**
```json
{
  "valid": false,
  "errors": [
    {
      "parameter": "period",
      "message": "Period must be between 1 and 200",
      "code": "INVALID_RANGE"
    }
  ],
  "warnings": []
}
```

---

## Evaluation API

### POST /api/conditions/evaluate
הערכת תנאי מול נתוני שוק.

**Body:**
```json
{
  "condition_id": 1,
  "condition_type": "plan",
  "ticker": "AAPL",
  "market_data": {
    "price": 150.00,
    "volume": 1000000,
    "timestamp": "2025-10-19T12:00:00Z"
  }
}
```

**תגובה:**
```json
{
  "condition_id": 1,
  "evaluated": true,
  "result": true,
  "confidence": 0.85,
  "details": {
    "current_value": 150.00,
    "threshold": 145.00,
    "comparison": "above"
  },
  "timestamp": "2025-10-19T12:00:00Z"
}
```

---

## Error Handling

### שגיאות נפוצות

**400 Bad Request:**
```json
{
  "error": "Bad Request",
  "message": "Invalid parameters provided",
  "details": {
    "parameter": "period",
    "issue": "Must be a positive integer"
  }
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Condition not found",
  "condition_id": 999
}
```

**422 Unprocessable Entity:**
```json
{
  "error": "Validation Error",
  "message": "Condition validation failed",
  "validation_errors": [
    {
      "field": "parameters_json",
      "message": "Invalid JSON format"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "request_id": "req_123456"
}
```

---

## Rate Limiting

- **Requests per minute:** 100
- **Burst limit:** 20 requests per second
- **Headers:**
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1640995200

---

## Authentication

כל ה-API endpoints דורשים authentication:

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## דוגמאות שימוש מלאות

### יצירת תנאי ממוצע נע
```javascript
async function createMovingAverageCondition(planId) {
  const conditionData = {
    trade_plan_id: planId,
    method_id: 1, // Moving Averages
    condition_group: 0,
    parameters_json: JSON.stringify({
      period: 20,
      type: "SMA",
      comparison: "above"
    }),
    logical_operator: "AND"
  };

  const response = await fetch('/api/plan_conditions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(conditionData)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
```

### הערכת תנאי
```javascript
async function evaluateCondition(conditionId, ticker) {
  const evaluationData = {
    condition_id: conditionId,
    condition_type: "plan",
    ticker: ticker
  };

  const response = await fetch('/api/conditions/evaluate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(evaluationData)
  });

  return await response.json();
}
```

---

## קישורים נוספים

- [ארכיטקטורה](./CONDITIONS_SYSTEM_ARCHITECTURE.md)
- [מדריך מפתח](./CONDITIONS_SYSTEM_DEVELOPER_GUIDE.md)
- [מדריך משתמש](./CONDITIONS_SYSTEM_USER_GUIDE.md)
