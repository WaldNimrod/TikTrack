# דוגמאות שימוש בסיסיות - מערכת התנאים
**תאריך יצירה:** 19 אוקטובר 2025  
**גרסה:** 1.0.0  
**מפתח:** AI Assistant  

---

## דוגמאות שימוש בסיסיות

### 1. יצירת תנאי ממוצע נע פשוט

#### Frontend
```javascript
// יצירת תנאי ממוצע נע 20 תקופות
const conditionBuilder = new ConditionBuilder('plan', 123, 'condition-container');

// הוספת תנאי
await conditionBuilder.addCondition({
    method_id: 1, // Moving Averages
    parameters: {
        period: 20,
        type: 'SMA',
        comparison: 'above'
    }
});

// שמירת התנאי
await conditionBuilder.saveCondition();
```

#### Backend
```python
# יצירת תנאי דרך API
condition_data = {
    'trade_plan_id': 123,
    'method_id': 1,
    'condition_group': 0,
    'parameters_json': '{"period": 20, "type": "SMA", "comparison": "above"}',
    'logical_operator': 'AND'
}

response = requests.post('/api/plan_conditions', json=condition_data)
condition = response.json()
```

### 2. יצירת תנאי נפח

#### Frontend
```javascript
// יצירת תנאי נפח
await conditionBuilder.addCondition({
    method_id: 2, // Volume
    parameters: {
        min_volume: 1000000,
        comparison: 'above',
        time_frame: '1d'
    }
});
```

#### Backend
```python
# יצירת תנאי נפח
condition_data = {
    'trade_plan_id': 123,
    'method_id': 2,
    'condition_group': 0,
    'parameters_json': '{"min_volume": 1000000, "comparison": "above", "time_frame": "1d"}',
    'logical_operator': 'AND'
}

response = requests.post('/api/plan_conditions', json=condition_data)
```

### 3. יצירת תנאי תמיכה והתנגדות

#### Frontend
```javascript
// יצירת תנאי רמת התנגדות
await conditionBuilder.addCondition({
    method_id: 3, // Support & Resistance
    parameters: {
        level_type: 'resistance',
        price: 150.00,
        tolerance: 0.5,
        time_frame: '1h'
    }
});
```

#### Backend
```python
# יצירת תנאי תמיכה והתנגדות
condition_data = {
    'trade_plan_id': 123,
    'method_id': 3,
    'condition_group': 0,
    'parameters_json': '{"level_type": "resistance", "price": 150.00, "tolerance": 0.5, "time_frame": "1h"}',
    'logical_operator': 'AND'
}

response = requests.post('/api/plan_conditions', json=condition_data)
```

### 4. יצירת תנאי קו מגמה

#### Frontend
```javascript
// יצירת תנאי קו מגמה עולה
await conditionBuilder.addCondition({
    method_id: 4, // Trend Lines
    parameters: {
        line_type: 'ascending',
        min_points: 3,
        tolerance: 1.0,
        time_frame: '4h'
    }
});
```

#### Backend
```python
# יצירת תנאי קו מגמה
condition_data = {
    'trade_plan_id': 123,
    'method_id': 4,
    'condition_group': 0,
    'parameters_json': '{"line_type": "ascending", "min_points": 3, "tolerance": 1.0, "time_frame": "4h"}',
    'logical_operator': 'AND'
}

response = requests.post('/api/plan_conditions', json=condition_data)
```

### 5. יצירת תנאי מבנה טכני

#### Frontend
```javascript
// יצירת תנאי ספל וידית
await conditionBuilder.addCondition({
    method_id: 5, // Technical Patterns
    parameters: {
        pattern_type: 'cup_handle',
        min_size: 5,
        time_frame: '1w',
        confirmation: true
    }
});
```

#### Backend
```python
# יצירת תנאי מבנה טכני
condition_data = {
    'trade_plan_id': 123,
    'method_id': 5,
    'condition_group': 0,
    'parameters_json': '{"pattern_type": "cup_handle", "min_size": 5, "time_frame": "1w", "confirmation": true}',
    'logical_operator': 'AND'
}

response = requests.post('/api/plan_conditions', json=condition_data)
```

### 6. יצירת תנאי פיבונצי

#### Frontend
```javascript
// יצירת תנאי פיבונצי 61.8%
await conditionBuilder.addCondition({
    method_id: 6, // Fibonacci
    parameters: {
        level: 61.8,
        direction: 'up',
        tolerance: 0.5,
        time_frame: '1d'
    }
});
```

#### Backend
```python
# יצירת תנאי פיבונצי
condition_data = {
    'trade_plan_id': 123,
    'method_id': 6,
    'condition_group': 0,
    'parameters_json': '{"level": 61.8, "direction": "up", "tolerance": 0.5, "time_frame": "1d"}',
    'logical_operator': 'AND'
}

response = requests.post('/api/plan_conditions', json=condition_data)
```

---

## דוגמאות ולידציה

### 1. ולידציה קליינט

```javascript
// ולידציה של פרמטרים
const validator = new ConditionValidator();

// בדיקת פרמטר תקין
const errors = validator.validateParameter(method, parameter, 20);
console.log(errors); // []

// בדיקת פרמטר לא תקין
const errors = validator.validateParameter(method, parameter, 'invalid');
console.log(errors); // ['תקופה חייב להיות מספר שלם']

// בדיקת תנאי שלם
const condition = {
    method_id: 1,
    parameters_json: '{"period": 20, "type": "SMA"}'
};

const errors = validator.validateCondition(condition);
console.log(errors); // []
```

### 2. ולידציה שרת

```python
# ולידציה דרך API
validation_data = {
    'method_id': 1,
    'parameters': {
        'period': 20,
        'type': 'SMA',
        'comparison': 'above'
    }
}

response = requests.post('/api/conditions/validate', json=validation_data)
result = response.json()

print(result['valid'])  # True
print(result['errors'])  # []
```

---

## דוגמאות הערכה

### 1. הערכת תנאי

```python
# הערכת תנאי מול נתוני שוק
evaluation_data = {
    'condition_id': 1,
    'condition_type': 'plan',
    'ticker': 'AAPL'
}

response = requests.post('/api/conditions/evaluate', json=evaluation_data)
result = response.json()

print(result['evaluated'])  # True
print(result['result'])     # True/False
print(result['confidence']) # 0.85
print(result['details'])    # {'current_price': 150.00, 'moving_average': 145.00, ...}
```

### 2. הערכת מספר תנאים

```python
# הערכת כל התנאים של תכנית
plan_id = 123
response = requests.get(f'/api/plan_conditions?plan_id={plan_id}')
conditions = response.json()

for condition in conditions:
    evaluation_data = {
        'condition_id': condition['id'],
        'condition_type': 'plan',
        'ticker': 'AAPL'
    }
    
    eval_response = requests.post('/api/conditions/evaluate', json=evaluation_data)
    result = eval_response.json()
    
    print(f"Condition {condition['id']}: {result['result']} (confidence: {result['confidence']})")
```

---

## דוגמאות התראות

### 1. יצירת התראה מתנאי

```javascript
// יצירת התראה מתנאי קיים
const alertData = {
    condition_id: 1,
    condition_type: 'plan',
    message: 'תנאי ממוצע נע הופעל!',
    state: 'active'
};

fetch('/api/alerts', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(alertData)
})
.then(response => response.json())
.then(alert => {
    console.log('Alert created:', alert);
});
```

### 2. יצירת התראה אוטומטית

```python
# יצירת התראה אוטומטית כאשר תנאי מופעל
def create_auto_alert(condition_id, condition_type, result):
    if result['result'] and result['confidence'] > 0.8:
        alert_data = {
            'condition_id': condition_id,
            'condition_type': condition_type,
            'message': f'תנאי הופעל עם ביטחון {result["confidence"]:.2%}',
            'state': 'active',
            'auto_created': True
        }
        
        response = requests.post('/api/alerts', json=alert_data)
        return response.json()
    
    return None
```

---

## דוגמאות רשת תנאים

### 1. העתקת תנאים מתכנית לטרייד

```javascript
// יצירת טרייד מתכנית עם תנאים
const tradeData = {
    ticker: 'AAPL',
    type: 'buy',
    trade_plan_id: 123, // תכנית עם תנאים
    inherit_conditions: true
};

fetch('/api/trades', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(tradeData)
})
.then(response => response.json())
.then(trade => {
    console.log('Trade created with inherited conditions:', trade);
});
```

### 2. הוספת תנאים נוספים לטרייד

```javascript
// הוספת תנאי נוסף לטרייד
const additionalCondition = {
    trade_id: 456,
    method_id: 2, // Volume
    inherited_from_plan_condition_id: null, // תנאי חדש
    condition_group: 0,
    parameters_json: '{"min_volume": 2000000, "comparison": "above"}',
    logical_operator: 'AND'
};

fetch('/api/trade_conditions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(additionalCondition)
})
.then(response => response.json())
.then(condition => {
    console.log('Additional condition added:', condition);
});
```

---

## דוגמאות ניהול תנאים

### 1. עריכת תנאי קיים

```javascript
// עריכת פרמטרים של תנאי
const updatedCondition = {
    parameters_json: '{"period": 50, "type": "EMA", "comparison": "below"}',
    logical_operator: 'OR'
};

fetch(`/api/plan_conditions/${conditionId}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedCondition)
})
.then(response => response.json())
.then(condition => {
    console.log('Condition updated:', condition);
});
```

### 2. מחיקת תנאי

```javascript
// מחיקת תנאי
fetch(`/api/plan_conditions/${conditionId}`, {
    method: 'DELETE'
})
.then(response => response.json())
.then(result => {
    console.log('Condition deleted:', result);
});
```

### 3. הפעלה/השבתה של תנאי

```javascript
// השבתת תנאי
const updatedCondition = {
    is_active: false
};

fetch(`/api/plan_conditions/${conditionId}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedCondition)
})
.then(response => response.json())
.then(condition => {
    console.log('Condition deactivated:', condition);
});
```

---

## דוגמאות קבוצות תנאים

### 1. יצירת קבוצת תנאים

```javascript
// קבוצה 1: תנאי ממוצע נע
const condition1 = {
    trade_plan_id: 123,
    method_id: 1,
    condition_group: 0,
    parameters_json: '{"period": 20, "type": "SMA", "comparison": "above"}',
    logical_operator: 'AND'
};

// קבוצה 1: תנאי נפח
const condition2 = {
    trade_plan_id: 123,
    method_id: 2,
    condition_group: 0,
    parameters_json: '{"min_volume": 1000000, "comparison": "above"}',
    logical_operator: 'AND'
};

// קבוצה 2: תנאי תמיכה
const condition3 = {
    trade_plan_id: 123,
    method_id: 3,
    condition_group: 1,
    parameters_json: '{"level_type": "support", "price": 140.00, "tolerance": 0.5}',
    logical_operator: 'OR'
};

// שמירת כל התנאים
await Promise.all([
    fetch('/api/plan_conditions', { method: 'POST', body: JSON.stringify(condition1) }),
    fetch('/api/plan_conditions', { method: 'POST', body: JSON.stringify(condition2) }),
    fetch('/api/plan_conditions', { method: 'POST', body: JSON.stringify(condition3) })
]);
```

### 2. הערכת קבוצת תנאים

```python
# הערכת קבוצת תנאים
def evaluate_condition_group(plan_id, group_id):
    # קבלת תנאים בקבוצה
    response = requests.get(f'/api/plan_conditions?plan_id={plan_id}&group_id={group_id}')
    conditions = response.json()
    
    if not conditions:
        return {'result': False, 'reason': 'No conditions in group'}
    
    # הערכת כל תנאי
    results = []
    for condition in conditions:
        eval_data = {
            'condition_id': condition['id'],
            'condition_type': 'plan',
            'ticker': 'AAPL'
        }
        
        eval_response = requests.post('/api/conditions/evaluate', json=eval_data)
        result = eval_response.json()
        results.append(result['result'])
    
    # חישוב תוצאה לפי אופרטור לוגי
    operator = conditions[0]['logical_operator']
    if operator == 'AND':
        group_result = all(results)
    elif operator == 'OR':
        group_result = any(results)
    else:
        group_result = results[0] if results else False
    
    return {
        'result': group_result,
        'individual_results': results,
        'operator': operator
    }
```

---

## דוגמאות טיפול בשגיאות

### 1. טיפול בשגיאות API

```javascript
// טיפול בשגיאות API
async function saveCondition(conditionData) {
    try {
        const response = await fetch('/api/plan_conditions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(conditionData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API request failed');
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Error saving condition:', error);
        
        // הצגת שגיאה למשתמש
        if (window.showErrorNotification) {
            window.showErrorNotification(`שגיאה בשמירת התנאי: ${error.message}`);
        }
        
        throw error;
    }
}
```

### 2. טיפול בשגיאות ולידציה

```javascript
// טיפול בשגיאות ולידציה
async function validateAndSave(conditionData) {
    try {
        // ולידציה קליינט
        const clientErrors = ConditionValidator.validateCondition(conditionData);
        if (clientErrors.length > 0) {
            throw new Error(`Validation errors: ${clientErrors.join(', ')}`);
        }
        
        // ולידציה שרת
        const validationResponse = await fetch('/api/conditions/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                method_id: conditionData.method_id,
                parameters: JSON.parse(conditionData.parameters_json)
            })
        });
        
        const validationResult = await validationResponse.json();
        if (!validationResult.valid) {
            throw new Error(`Server validation errors: ${validationResult.errors.join(', ')}`);
        }
        
        // שמירה
        return await saveCondition(conditionData);
        
    } catch (error) {
        console.error('Validation or save error:', error);
        throw error;
    }
}
```

---

## קישורים נוספים

- [דוגמאות מתקדמות](./advanced-usage.md)
- [דוגמאות אינטגרציה](./integration-examples.md)
- [מדריך משתמש](../CONDITIONS_SYSTEM_USER_GUIDE.md)
- [מדריך מפתח](../CONDITIONS_SYSTEM_DEVELOPER_GUIDE.md)
