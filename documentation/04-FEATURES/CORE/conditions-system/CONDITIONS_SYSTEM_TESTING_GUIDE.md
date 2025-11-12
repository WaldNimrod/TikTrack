# מדריך בדיקות - מערכת התנאים
**תאריך יצירה:** 19 אוקטובר 2025  
**גרסה:** 1.0.0  
**מפתח:** AI Assistant  

---

## סקירה כללית

מדריך זה מפרט את כל סוגי הבדיקות הנדרשות למערכת התנאים, כולל בדיקות יחידה, בדיקות אינטגרציה, בדיקות ביצועים, ובדיקות משתמש.

---

## עדכון 2025-11 – סט בדיקות חדש

- נוספו שתי בדיקות pytest ליבה:
  - `Backend/tests/test_conditions_master_data.py` – מאמת את זריעת נתוני המאסטר לשיטות ופרמטרים ומבטיח אידמפוטנטיות.
  - `Backend/tests/test_condition_evaluation_task.py` – מכסה את מחזור החיים המלא של משימת הרקע, כולל יצירת התראות, ריאקטיבציה וקירור.
- שתי הבדיקות משתמשות בסכמת SQLite מבודדת ולכן אינן דורשות מסד נתונים חיצוני.
- חובה להריץ אותן כחלק מכל רגרסיה של מערכת התנאים/התראות.

---

## סוגי בדיקות

### 1. בדיקות יחידה (Unit Tests)
- בדיקת מודלים
- בדיקת שירותים
- בדיקת ולידציה
- בדיקת קומפוננטים

### 2. בדיקות אינטגרציה (Integration Tests)
- בדיקת API endpoints
- בדיקת אינטגרציה עם מסד נתונים
- בדיקת אינטגרציה עם מערכות חיצוניות

### 3. בדיקות ביצועים (Performance Tests)
- בדיקת זמני תגובה
- בדיקת עומס
- בדיקת זיכרון

### 4. בדיקות משתמש (User Acceptance Tests)
- בדיקת זרימות משתמש
- בדיקת ממשק משתמש
- בדיקת חוויית משתמש

---

## בדיקות יחידה - Backend

### בדיקות חובה – Master Data & Background Alerts

1. **Seed Data Validation**
   ```
   python3 -m pytest Backend/tests/test_conditions_master_data.py
   ```
   - מריץ סכמת SQLite זמנית.  
   - מאמת שהסקריפט `seed_conditions_master_data.py` מוסיף את כל השיטות והפרמטרים פעם אחת בלבד.  
   - בודק שהרצה כפולה אינה יוצרת כפילויות.

2. **Condition Evaluation Task**
   ```
   python3 -m pytest Backend/tests/test_condition_evaluation_task.py
   ```
   - בונה נתוני דמה (חשבון, טיקר, תנאי, נתוני שוק) ומוודא:  
     - יצירת התראה חדשה כאשר תנאי של תכנית או טרייד מתקיים.  
     - כיבוד `auto_generate_alerts=False`.  
     - ריאקטיבציה לאחר סיום ה־cooldown.  
   - משתמש ב־monkeypatch ל־`ConditionEvaluator`, `AlertService` ו־`process_condition_alert_lifecycle` כדי לשמור על בדיקות מהירות וללא תלות בשירותים חיצוניים.

> ⚠️ **בכל שינוי בלוגיקת ההתראות או במודלים** – יש לעדכן בדיקות אלו כדי למנוע רגרסיות.

### 1. בדיקת מודלים

#### TradingMethod Model
```python
import unittest
from models.trading_method import TradingMethod
from config.database import get_db

class TestTradingMethod(unittest.TestCase):
    
    def setUp(self):
        self.db = get_db()
        self.method_data = {
            'name_en': 'Test Method',
            'name_he': 'שיטה לבדיקה',
            'method_key': 'test_method',
            'is_active': True
        }
    
    def test_create_trading_method(self):
        """Test creating a new trading method"""
        method = TradingMethod(**self.method_data)
        self.db.add(method)
        self.db.commit()
        
        self.assertIsNotNone(method.id)
        self.assertEqual(method.name_en, 'Test Method')
        self.assertEqual(method.name_he, 'שיטה לבדיקה')
        self.assertEqual(method.method_key, 'test_method')
        self.assertTrue(method.is_active)
    
    def test_method_to_dict(self):
        """Test converting method to dictionary"""
        method = TradingMethod(**self.method_data)
        method_dict = method.to_dict()
        
        self.assertIn('id', method_dict)
        self.assertIn('name_en', method_dict)
        self.assertIn('name_he', method_dict)
        self.assertIn('method_key', method_dict)
        self.assertIn('is_active', method_dict)
    
    def test_method_relationships(self):
        """Test method relationships with parameters"""
        method = TradingMethod(**self.method_data)
        self.db.add(method)
        self.db.commit()
        
        # Add parameter
        from models.trading_method import MethodParameter
        param = MethodParameter(
            method_id=method.id,
            parameter_key='test_param',
            parameter_name_en='Test Parameter',
            parameter_name_he='פרמטר לבדיקה',
            parameter_type='integer',
            is_required=True
        )
        self.db.add(param)
        self.db.commit()
        
        # Test relationship
        self.assertEqual(len(method.parameters), 1)
        self.assertEqual(method.parameters[0].parameter_key, 'test_param')
    
    def tearDown(self):
        self.db.rollback()
        self.db.close()
```

#### PlanCondition Model
```python
class TestPlanCondition(unittest.TestCase):
    
    def setUp(self):
        self.db = get_db()
        self.condition_data = {
            'trade_plan_id': 1,
            'method_id': 1,
            'condition_group': 0,
            'parameters_json': '{"period": 20, "type": "SMA"}',
            'logical_operator': 'AND',
            'is_active': True
        }
    
    def test_create_plan_condition(self):
        """Test creating a new plan condition"""
        condition = PlanCondition(**self.condition_data)
        self.db.add(condition)
        self.db.commit()
        
        self.assertIsNotNone(condition.id)
        self.assertEqual(condition.trade_plan_id, 1)
        self.assertEqual(condition.method_id, 1)
        self.assertEqual(condition.condition_group, 0)
        self.assertEqual(condition.logical_operator, 'AND')
        self.assertTrue(condition.is_active)
    
    def test_condition_parameters_json(self):
        """Test parameters JSON handling"""
        condition = PlanCondition(**self.condition_data)
        
        # Test JSON parsing
        import json
        params = json.loads(condition.parameters_json)
        self.assertEqual(params['period'], 20)
        self.assertEqual(params['type'], 'SMA')
    
    def test_condition_relationships(self):
        """Test condition relationships"""
        condition = PlanCondition(**self.condition_data)
        self.db.add(condition)
        self.db.commit()
        
        # Test relationship with method
        self.assertIsNotNone(condition.method)
        self.assertEqual(condition.method.id, 1)
```

### 2. בדיקת שירותים

#### ConditionsValidationService
```python
class TestConditionsValidationService(unittest.TestCase):
    
    def setUp(self):
        self.service = ConditionsValidationService()
    
    def test_validate_condition_success(self):
        """Test successful condition validation"""
        condition_data = {
            'method_id': 1,
            'parameters_json': '{"period": 20, "type": "SMA"}'
        }
        
        with patch.object(self.service, '_method_exists', return_value=True):
            with patch.object(self.service, 'validate_parameters', return_value=[]):
                is_valid, errors = self.service.validate_condition(condition_data)
                
                self.assertTrue(is_valid)
                self.assertEqual(len(errors), 0)
    
    def test_validate_condition_missing_fields(self):
        """Test condition validation with missing fields"""
        condition_data = {
            'method_id': 1
            # Missing parameters_json
        }
        
        is_valid, errors = self.service.validate_condition(condition_data)
        
        self.assertFalse(is_valid)
        self.assertIn("Missing required field: parameters_json", errors)
    
    def test_validate_parameters_invalid_type(self):
        """Test parameter validation with invalid type"""
        parameters = {
            'period': 'not_a_number'
        }
        
        # Mock method parameters
        method_params = [
            MagicMock(
                parameter_key='period',
                parameter_name_he='תקופה',
                parameter_type='integer',
                is_required=True,
                min_value='1',
                max_value='200'
            )
        ]
        
        with patch('services.conditions_validation_service.get_db') as mock_db:
            mock_db.return_value.query.return_value.filter.return_value.all.return_value = method_params
            
            errors = self.service.validate_parameters(1, parameters)
            
            self.assertGreater(len(errors), 0)
            self.assertIn('תקופה', errors[0])
    
    def test_validate_parameters_range(self):
        """Test parameter validation with range constraints"""
        parameters = {
            'period': 300  # Above max value
        }
        
        method_params = [
            MagicMock(
                parameter_key='period',
                parameter_name_he='תקופה',
                parameter_type='integer',
                is_required=True,
                min_value='1',
                max_value='200'
            )
        ]
        
        with patch('services.conditions_validation_service.get_db') as mock_db:
            mock_db.return_value.query.return_value.filter.return_value.all.return_value = method_params
            
            errors = self.service.validate_parameters(1, parameters)
            
            self.assertGreater(len(errors), 0)
            self.assertIn('200', errors[0])
```

### 3. בדיקת API Routes

#### Trading Methods API
```python
class TestTradingMethodsAPI(unittest.TestCase):
    
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
    
    def tearDown(self):
        self.app_context.pop()
    
    def test_get_trading_methods(self):
        """Test GET /api/trading_methods"""
        response = self.client.get('/api/trading_methods')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
    
    def test_get_trading_methods_active_only(self):
        """Test GET /api/trading_methods with active_only parameter"""
        response = self.client.get('/api/trading_methods?active_only=true')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        
        # Check that all returned methods are active
        for method in data:
            self.assertTrue(method['is_active'])
    
    def test_get_trading_method_by_id(self):
        """Test GET /api/trading_methods/{id}"""
        # First create a method
        method_data = {
            'name_en': 'Test Method',
            'name_he': 'שיטה לבדיקה',
            'method_key': 'test_method'
        }
        
        response = self.client.post('/api/trading_methods', json=method_data)
        method_id = response.get_json()['id']
        
        # Then get it by ID
        response = self.client.get(f'/api/trading_methods/{method_id}')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['id'], method_id)
        self.assertEqual(data['name_en'], 'Test Method')
    
    def test_get_nonexistent_trading_method(self):
        """Test GET /api/trading_methods/{id} with non-existent ID"""
        response = self.client.get('/api/trading_methods/99999')
        
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertIn('Not Found', data['error'])
```

#### Plan Conditions API
```python
class TestPlanConditionsAPI(unittest.TestCase):
    
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
    
    def tearDown(self):
        self.app_context.pop()
    
    def test_create_plan_condition(self):
        """Test POST /api/plan_conditions"""
        condition_data = {
            'trade_plan_id': 1,
            'method_id': 1,
            'condition_group': 0,
            'parameters_json': '{"period": 20, "type": "SMA"}',
            'logical_operator': 'AND'
        }
        
        response = self.client.post('/api/plan_conditions', 
                                  json=condition_data,
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['trade_plan_id'], 1)
        self.assertEqual(data['method_id'], 1)
    
    def test_create_plan_condition_invalid_data(self):
        """Test POST /api/plan_conditions with invalid data"""
        condition_data = {
            'trade_plan_id': 1,
            'method_id': 1,
            # Missing required fields
        }
        
        response = self.client.post('/api/plan_conditions', 
                                  json=condition_data,
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
    
    def test_get_plan_conditions(self):
        """Test GET /api/plan_conditions"""
        response = self.client.get('/api/plan_conditions')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
    
    def test_get_plan_conditions_by_plan_id(self):
        """Test GET /api/plan_conditions?plan_id={id}"""
        # First create a condition
        condition_data = {
            'trade_plan_id': 123,
            'method_id': 1,
            'condition_group': 0,
            'parameters_json': '{"period": 20}',
            'logical_operator': 'AND'
        }
        
        self.client.post('/api/plan_conditions', json=condition_data)
        
        # Then get conditions for that plan
        response = self.client.get('/api/plan_conditions?plan_id=123')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreater(len(data), 0)
        self.assertEqual(data[0]['trade_plan_id'], 123)
    
    def test_update_plan_condition(self):
        """Test PUT /api/plan_conditions/{id}"""
        # First create a condition
        condition_data = {
            'trade_plan_id': 1,
            'method_id': 1,
            'condition_group': 0,
            'parameters_json': '{"period": 20}',
            'logical_operator': 'AND'
        }
        
        response = self.client.post('/api/plan_conditions', json=condition_data)
        condition_id = response.get_json()['id']
        
        # Then update it
        update_data = {
            'parameters_json': '{"period": 50}',
            'logical_operator': 'OR'
        }
        
        response = self.client.put(f'/api/plan_conditions/{condition_id}', 
                                 json=update_data)
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['parameters_json'], '{"period": 50}')
        self.assertEqual(data['logical_operator'], 'OR')
    
    def test_delete_plan_condition(self):
        """Test DELETE /api/plan_conditions/{id}"""
        # First create a condition
        condition_data = {
            'trade_plan_id': 1,
            'method_id': 1,
            'condition_group': 0,
            'parameters_json': '{"period": 20}',
            'logical_operator': 'AND'
        }
        
        response = self.client.post('/api/plan_conditions', json=condition_data)
        condition_id = response.get_json()['id']
        
        # Then delete it
        response = self.client.delete(f'/api/plan_conditions/{condition_id}')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('message', data)
        self.assertIn('deleted successfully', data['message'])
        
        # Verify it's deleted
        response = self.client.get(f'/api/plan_conditions/{condition_id}')
        self.assertEqual(response.status_code, 404)
```

---

## בדיקות יחידה - Frontend

### 1. בדיקת ConditionBuilder

```javascript
// condition-builder.test.js
describe('ConditionBuilder', () => {
    let conditionBuilder;
    let mockContainer;
    
    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = '<div id="test-container"></div>';
        mockContainer = document.getElementById('test-container');
        
        // Mock fetch
        global.fetch = jest.fn();
    });
    
    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });
    
    test('should initialize with correct parameters', () => {
        conditionBuilder = new ConditionBuilder('plan', 123, 'test-container');
        
        expect(conditionBuilder.entityType).toBe('plan');
        expect(conditionBuilder.entityId).toBe(123);
        expect(conditionBuilder.containerId).toBe('test-container');
    });
    
    test('should load methods successfully', async () => {
        const mockMethods = [
            { id: 1, name_he: 'ממוצעים נעים', method_key: 'moving_averages' }
        ];
        
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockMethods
        });
        
        conditionBuilder = new ConditionBuilder('plan', 123, 'test-container');
        await conditionBuilder.loadMethods();
        
        expect(conditionBuilder.methods).toEqual(mockMethods);
    });
    
    test('should handle method loading error', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));
        
        conditionBuilder = new ConditionBuilder('plan', 123, 'test-container');
        
        await expect(conditionBuilder.loadMethods()).rejects.toThrow('Network error');
    });
    
    test('should render conditions list correctly', () => {
        const mockConditions = [
            {
                id: 1,
                method_name: 'ממוצעים נעים',
                parameters_json: '{"period": 20, "type": "SMA"}'
            }
        ];
        
        conditionBuilder = new ConditionBuilder('plan', 123, 'test-container');
        conditionBuilder.conditions = mockConditions;
        
        const html = conditionBuilder.generateConditionsList();
        
        expect(html).toContain('ממוצעים נעים');
        expect(html).toContain('period: 20');
        expect(html).toContain('type: SMA');
    });
    
    test('should generate parameter form correctly', () => {
        const mockMethods = [
            {
                id: 1,
                name_he: 'ממוצעים נעים',
                parameters: [
                    {
                        parameter_key: 'period',
                        parameter_name_he: 'תקופה',
                        parameter_type: 'integer',
                        is_required: true,
                        min_value: '1',
                        max_value: '200'
                    }
                ]
            }
        ];
        
        conditionBuilder = new ConditionBuilder('plan', 123, 'test-container');
        conditionBuilder.methods = mockMethods;
        
        const html = conditionBuilder.generateParameterForm();
        
        expect(html).toContain('תקופה');
        expect(html).toContain('type="number"');
        expect(html).toContain('min="1"');
        expect(html).toContain('max="200"');
        expect(html).toContain('required');
    });
    
    test('should save condition successfully', async () => {
        const mockMethods = [
            {
                id: 1,
                name_he: 'ממוצעים נעים',
                parameters: [
                    {
                        parameter_key: 'period',
                        parameter_name_he: 'תקופה',
                        parameter_type: 'integer',
                        is_required: true
                    }
                ]
            }
        ];
        
        const mockNewCondition = {
            id: 1,
            method_id: 1,
            parameters_json: '{"period": 20}'
        };
        
        // Mock method selection
        document.body.innerHTML = `
            <div id="test-container">
                <select id="method-select">
                    <option value="1">ממוצעים נעים</option>
                </select>
                <input id="param-period" value="20" />
            </div>
        `;
        
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockNewCondition
        });
        
        conditionBuilder = new ConditionBuilder('plan', 123, 'test-container');
        conditionBuilder.methods = mockMethods;
        
        await conditionBuilder.saveCondition();
        
        expect(conditionBuilder.conditions).toContain(mockNewCondition);
    });
});
```

### 2. בדיקת ConditionValidator

```javascript
describe('ConditionValidator', () => {
    test('should validate integer parameter correctly', () => {
        const method = {
            parameters: [
                {
                    parameter_key: 'period',
                    parameter_name_he: 'תקופה',
                    parameter_type: 'integer',
                    is_required: true,
                    min_value: '1',
                    max_value: '200'
                }
            ]
        };
        
        const errors = ConditionValidator.validateParameter(method, method.parameters[0], 20);
        expect(errors).toHaveLength(0);
    });
    
    test('should show error for invalid integer parameter', () => {
        const method = {
            parameters: [
                {
                    parameter_key: 'period',
                    parameter_name_he: 'תקופה',
                    parameter_type: 'integer',
                    is_required: true,
                    min_value: '1',
                    max_value: '200'
                }
            ]
        };
        
        const errors = ConditionValidator.validateParameter(method, method.parameters[0], 'not_a_number');
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('תקופה');
    });
    
    test('should show error for parameter out of range', () => {
        const method = {
            parameters: [
                {
                    parameter_key: 'period',
                    parameter_name_he: 'תקופה',
                    parameter_type: 'integer',
                    is_required: true,
                    min_value: '1',
                    max_value: '200'
                }
            ]
        };
        
        const errors = ConditionValidator.validateParameter(method, method.parameters[0], 300);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('200');
    });
    
    test('should show error for missing required parameter', () => {
        const method = {
            parameters: [
                {
                    parameter_key: 'period',
                    parameter_name_he: 'תקופה',
                    parameter_type: 'integer',
                    is_required: true
                }
            ]
        };
        
        const errors = ConditionValidator.validateParameter(method, method.parameters[0], '');
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('חובה');
    });
    
    test('should validate boolean parameter correctly', () => {
        const method = {
            parameters: [
                {
                    parameter_key: 'enabled',
                    parameter_name_he: 'מופעל',
                    parameter_type: 'boolean',
                    is_required: true
                }
            ]
        };
        
        const errors = ConditionValidator.validateParameter(method, method.parameters[0], true);
        expect(errors).toHaveLength(0);
    });
    
    test('should show error for invalid boolean parameter', () => {
        const method = {
            parameters: [
                {
                    parameter_key: 'enabled',
                    parameter_name_he: 'מופעל',
                    parameter_type: 'boolean',
                    is_required: true
                }
            ]
        };
        
        const errors = ConditionValidator.validateParameter(method, method.parameters[0], 'maybe');
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('כן או לא');
    });
    
    test('should validate condition correctly', () => {
        const condition = {
            method_id: 1,
            parameters_json: '{"period": 20}'
        };
        
        const errors = ConditionValidator.validateCondition(condition);
        expect(errors).toHaveLength(0);
    });
    
    test('should show error for missing method_id', () => {
        const condition = {
            parameters_json: '{"period": 20}'
        };
        
        const errors = ConditionValidator.validateCondition(condition);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('שיטת מסחר');
    });
    
    test('should show error for invalid JSON', () => {
        const condition = {
            method_id: 1,
            parameters_json: 'invalid json'
        };
        
        const errors = ConditionValidator.validateCondition(condition);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('פורמט');
    });
});
```

---

## בדיקות משימת רקע והתראות (QA ידני)

1. **הרצת המשימה**  
   ```
   python3 - <<'PY'
   from Backend.services.condition_evaluation_task import condition_evaluation_task
   print(condition_evaluation_task())
   PY
   ```
   ודאו שהפלט כולל `alerts_created` חיובי כאשר תנאים פעילים עומדים.

2. **הזרקת נתוני שוק**  
   - צרפו רשומת `MarketDataQuote` עם `is_stale = 0` לטיקר הנבדק.  
   - ניתן להשתמש בשירות ייבוא נתונים או להוסיף רשומה ידנית במהלך QA.

3. **בדיקת קירור התראות**  
   - עדכנו התראה קיימת ל־`is_triggered='true'` והגדירו `triggered_at` ישן.  
   - הריצו את המשימה עם ערך קירור נמוך (למשל באמצעות שינוי זמני של ההעדפה ל־`5`) וודאו שההתראה חוזרת ל־`'new'` וסטטוס `open`.

4. **צליבת טבלאות**  
   - לשם תיעוד/בדיקה ניתן להריץ את `Backend/tools/db_trigger_validation.sql` (הסקריפט מתחיל וסוגר טרנזקציה משלו).  
   - מעקב אחרי `alerts`, `plan_conditions`, `trade_conditions`, `condition_alerts_mapping` (אם פעיל) מומלץ לצילום מסך לדוח QA.

---

## בדיקות אינטגרציה

### 1. בדיקת זרימה מלאה

```python
class TestConditionsIntegration(unittest.TestCase):
    
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
    
    def tearDown(self):
        self.app_context.pop()
    
    def test_full_condition_workflow(self):
        """Test complete workflow from method creation to condition evaluation"""
        
        # Step 1: Create trading method
        method_data = {
            'name_en': 'Test Moving Average',
            'name_he': 'ממוצע נע לבדיקה',
            'method_key': 'test_ma',
            'is_active': True
        }
        
        response = self.client.post('/api/trading_methods', json=method_data)
        self.assertEqual(response.status_code, 201)
        method_id = response.get_json()['id']
        
        # Step 2: Add method parameter
        param_data = {
            'method_id': method_id,
            'parameter_key': 'period',
            'parameter_name_en': 'Period',
            'parameter_name_he': 'תקופה',
            'parameter_type': 'integer',
            'default_value': '20',
            'min_value': '1',
            'max_value': '200',
            'is_required': True
        }
        
        response = self.client.post('/api/method_parameters', json=param_data)
        self.assertEqual(response.status_code, 201)
        
        # Step 3: Create plan condition
        condition_data = {
            'trade_plan_id': 1,
            'method_id': method_id,
            'condition_group': 0,
            'parameters_json': '{"period": 20}',
            'logical_operator': 'AND'
        }
        
        response = self.client.post('/api/plan_conditions', json=condition_data)
        self.assertEqual(response.status_code, 201)
        condition_id = response.get_json()['id']
        
        # Step 4: Validate condition
        validation_data = {
            'method_id': method_id,
            'parameters': {'period': 20}
        }
        
        response = self.client.post('/api/conditions/validate', json=validation_data)
        self.assertEqual(response.status_code, 200)
        validation_result = response.get_json()
        self.assertTrue(validation_result['valid'])
        
        # Step 5: Evaluate condition
        evaluation_data = {
            'condition_id': condition_id,
            'condition_type': 'plan',
            'ticker': 'AAPL',
            'market_data': {
                'price': 150.00,
                'volume': 1000000,
                'timestamp': '2025-10-19T12:00:00Z'
            }
        }
        
        response = self.client.post('/api/conditions/evaluate', json=evaluation_data)
        self.assertEqual(response.status_code, 200)
        evaluation_result = response.get_json()
        self.assertIn('evaluated', evaluation_result)
        self.assertIn('result', evaluation_result)
    
    def test_condition_inheritance_workflow(self):
        """Test condition inheritance from plan to trade"""
        
        # Step 1: Create plan condition
        plan_condition_data = {
            'trade_plan_id': 1,
            'method_id': 1,
            'condition_group': 0,
            'parameters_json': '{"period": 20}',
            'logical_operator': 'AND'
        }
        
        response = self.client.post('/api/plan_conditions', json=plan_condition_data)
        self.assertEqual(response.status_code, 201)
        plan_condition_id = response.get_json()['id']
        
        # Step 2: Create trade condition inheriting from plan
        trade_condition_data = {
            'trade_id': 1,
            'method_id': 1,
            'inherited_from_plan_condition_id': plan_condition_id,
            'condition_group': 0,
            'parameters_json': '{"period": 20}',
            'logical_operator': 'AND'
        }
        
        response = self.client.post('/api/trade_conditions', json=trade_condition_data)
        self.assertEqual(response.status_code, 201)
        trade_condition = response.get_json()
        
        self.assertEqual(trade_condition['inherited_from_plan_condition_id'], plan_condition_id)
        self.assertEqual(trade_condition['method_id'], 1)
        self.assertEqual(trade_condition['parameters_json'], '{"period": 20}')
```

### 2. בדיקת אינטגרציה עם מערכות חיצוניות

```python
class TestExternalSystemsIntegration(unittest.TestCase):
    
    def test_alert_creation_from_condition(self):
        """Test creating alert from condition"""
        
        # Step 1: Create condition
        condition_data = {
            'trade_plan_id': 1,
            'method_id': 1,
            'condition_group': 0,
            'parameters_json': '{"period": 20}',
            'logical_operator': 'AND'
        }
        
        response = self.client.post('/api/plan_conditions', json=condition_data)
        condition_id = response.get_json()['id']
        
        # Step 2: Create alert from condition
        alert_data = {
            'condition_id': condition_id,
            'condition_type': 'plan',
            'message': 'Test alert from condition',
            'state': 'active',
            'auto_created': False
        }
        
        response = self.client.post('/api/alerts', json=alert_data)
        self.assertEqual(response.status_code, 201)
        alert = response.get_json()
        
        self.assertEqual(alert['condition_id'], condition_id)
        self.assertEqual(alert['condition_type'], 'plan')
        self.assertEqual(alert['message'], 'Test alert from condition')
    
    def test_external_data_integration(self):
        """Test integration with external data system"""
        
        # Mock external data service
        with patch('services.external_data_service.get_market_data') as mock_get_data:
            mock_get_data.return_value = {
                'price': 150.00,
                'volume': 1000000,
                'timestamp': '2025-10-19T12:00:00Z'
            }
            
            # Test condition evaluation with external data
            evaluation_data = {
                'condition_id': 1,
                'condition_type': 'plan',
                'ticker': 'AAPL'
            }
            
            response = self.client.post('/api/conditions/evaluate', json=evaluation_data)
            self.assertEqual(response.status_code, 200)
            
            # Verify external data service was called
            mock_get_data.assert_called_once_with('AAPL')
```

---

## בדיקות ביצועים

### 1. בדיקת זמני תגובה

```python
import time
import statistics

class TestPerformance(unittest.TestCase):
    
    def test_api_response_times(self):
        """Test API response times are within acceptable limits"""
        
        endpoints = [
            '/api/trading_methods',
            '/api/plan_conditions',
            '/api/trade_conditions'
        ]
        
        max_response_time = 1.0  # 1 second
        
        for endpoint in endpoints:
            response_times = []
            
            # Test multiple requests
            for _ in range(10):
                start_time = time.time()
                response = self.client.get(endpoint)
                end_time = time.time()
                
                self.assertEqual(response.status_code, 200)
                response_times.append(end_time - start_time)
            
            # Check average response time
            avg_response_time = statistics.mean(response_times)
            self.assertLess(avg_response_time, max_response_time)
            
            # Check max response time
            max_response_time_actual = max(response_times)
            self.assertLess(max_response_time_actual, max_response_time * 2)
    
    def test_condition_validation_performance(self):
        """Test condition validation performance"""
        
        # Test with large number of parameters
        large_parameters = {f'param_{i}': i for i in range(100)}
        
        validation_data = {
            'method_id': 1,
            'parameters': large_parameters
        }
        
        start_time = time.time()
        response = self.client.post('/api/conditions/validate', json=validation_data)
        end_time = time.time()
        
        self.assertEqual(response.status_code, 200)
        self.assertLess(end_time - start_time, 0.5)  # 500ms max
    
    def test_database_query_performance(self):
        """Test database query performance"""
        
        # Test with large number of conditions
        condition_count = 1000
        
        # Create many conditions
        for i in range(condition_count):
            condition_data = {
                'trade_plan_id': i % 10,  # Distribute across 10 plans
                'method_id': 1,
                'condition_group': 0,
                'parameters_json': f'{{"period": {i}}}',
                'logical_operator': 'AND'
            }
            
            response = self.client.post('/api/plan_conditions', json=condition_data)
            self.assertEqual(response.status_code, 201)
        
        # Test query performance
        start_time = time.time()
        response = self.client.get('/api/plan_conditions')
        end_time = time.time()
        
        self.assertEqual(response.status_code, 200)
        self.assertLess(end_time - start_time, 2.0)  # 2 seconds max
```

### 2. בדיקת עומס

```python
import threading
import concurrent.futures

class TestLoad(unittest.TestCase):
    
    def test_concurrent_requests(self):
        """Test system under concurrent load"""
        
        def make_request():
            response = self.client.get('/api/trading_methods')
            return response.status_code == 200
        
        # Test with 50 concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
            futures = [executor.submit(make_request) for _ in range(50)]
            results = [future.result() for future in futures]
        
        # All requests should succeed
        self.assertTrue(all(results))
    
    def test_condition_creation_under_load(self):
        """Test condition creation under load"""
        
        def create_condition(plan_id):
            condition_data = {
                'trade_plan_id': plan_id,
                'method_id': 1,
                'condition_group': 0,
                'parameters_json': '{"period": 20}',
                'logical_operator': 'AND'
            }
            
            response = self.client.post('/api/plan_conditions', json=condition_data)
            return response.status_code == 201
        
        # Test with 100 concurrent condition creations
        with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
            futures = [executor.submit(create_condition, i) for i in range(100)]
            results = [future.result() for future in futures]
        
        # All creations should succeed
        self.assertTrue(all(results))
```

---

## בדיקות משתמש

### 1. בדיקת זרימות משתמש

```javascript
// user-workflow.test.js
describe('User Workflows', () => {
    
    test('should complete full condition creation workflow', async () => {
        // Step 1: Navigate to trade plans page
        await page.goto('http://localhost:8080/trade_plans.html');
        
        // Step 2: Click add trade plan
        await page.click('[data-bs-target="#addTradePlanModal"]');
        
        // Step 3: Fill basic details
        await page.fill('#addPlanName', 'Test Plan');
        await page.fill('#addPlanTicker', 'AAPL');
        
        // Step 4: Go to conditions tab
        await page.click('#add-conditions-tab');
        
        // Step 5: Add condition
        await page.click('button:has-text("הוסף תנאי")');
        
        // Step 6: Select method
        await page.selectOption('#method-select', '1');
        
        // Step 7: Fill parameters
        await page.fill('#param-period', '20');
        
        // Step 8: Save condition
        await page.click('button:has-text("שמור תנאי")');
        
        // Step 9: Verify condition appears
        await expect(page.locator('.condition-item')).toContainText('ממוצעים נעים');
        
        // Step 10: Save plan
        await page.click('button:has-text("שמור")');
        
        // Step 11: Verify plan was created
        await expect(page.locator('.success-notification')).toBeVisible();
    });
    
    test('should complete condition inheritance workflow', async () => {
        // Step 1: Create plan with condition (from previous test)
        // ... (plan creation steps)
        
        // Step 2: Navigate to trades page
        await page.goto('http://localhost:8080/trades.html');
        
        // Step 3: Click add trade
        await page.click('[data-bs-target="#addTradeModal"]');
        
        // Step 4: Fill basic details
        await page.fill('#addTradeTicker', 'AAPL');
        await page.selectOption('#addTradeType', 'buy');
        
        // Step 5: Go to conditions tab
        await page.click('#add-conditions-tab');
        
        // Step 6: Verify inherited conditions appear
        await expect(page.locator('.condition-item')).toContainText('ממוצעים נעים');
        
        // Step 7: Add additional condition
        await page.click('button:has-text("הוסף תנאי")');
        await page.selectOption('#method-select', '2');
        await page.fill('#param-volume', '1000000');
        await page.click('button:has-text("שמור תנאי")');
        
        // Step 8: Verify both conditions exist
        const conditions = page.locator('.condition-item');
        await expect(conditions).toHaveCount(2);
        
        // Step 9: Save trade
        await page.click('button:has-text("שמור")');
        
        // Step 10: Verify trade was created
        await expect(page.locator('.success-notification')).toBeVisible();
    });
    
    test('should complete alert creation workflow', async () => {
        // Step 1: Navigate to alerts page
        await page.goto('http://localhost:8080/alerts.html');
        
        // Step 2: Click add alert
        await page.click('[data-bs-target="#addAlertModal"]');
        
        // Step 3: Go to from condition tab
        await page.click('#add-from-condition-tab');
        
        // Step 4: Select source type
        await page.selectOption('#conditionSourceType', 'trade_plan');
        
        // Step 5: Select plan
        await page.selectOption('#conditionSourceId', '1');
        
        // Step 6: Select condition
        await page.click('button:has-text("בחר תנאי זה")');
        
        // Step 7: Fill alert message
        await page.fill('#alertMessageFromCondition', 'Test alert message');
        
        // Step 8: Create alert
        await page.click('button:has-text("צור התראה מתנאי")');
        
        // Step 9: Verify alert was created
        await expect(page.locator('.success-notification')).toBeVisible();
    });
});
```

### 2. בדיקת ממשק משתמש

```javascript
// ui-test.js
describe('UI Components', () => {
    
    test('should display condition builder correctly', async () => {
        await page.goto('http://localhost:8080/trade_plans.html');
        await page.click('[data-bs-target="#addTradePlanModal"]');
        await page.click('#add-conditions-tab');
        
        // Check condition builder container exists
        await expect(page.locator('#addPlanConditionBuilder')).toBeVisible();
        
        // Check add condition button exists
        await expect(page.locator('button:has-text("הוסף תנאי")')).toBeVisible();
        
        // Check conditions list container exists
        await expect(page.locator('#addPlanConditionsListContainer')).toBeVisible();
        
        // Check parameter form container exists
        await expect(page.locator('#addPlanParameterFormContainer')).toBeVisible();
    });
    
    test('should show parameter form when method is selected', async () => {
        await page.goto('http://localhost:8080/trade_plans.html');
        await page.click('[data-bs-target="#addTradePlanModal"]');
        await page.click('#add-conditions-tab');
        await page.click('button:has-text("הוסף תנאי")');
        
        // Select method
        await page.selectOption('#method-select', '1');
        
        // Check parameter form is visible
        await expect(page.locator('#parameters-container')).toBeVisible();
        
        // Check parameter fields exist
        await expect(page.locator('#param-period')).toBeVisible();
    });
    
    test('should validate parameters correctly', async () => {
        await page.goto('http://localhost:8080/trade_plans.html');
        await page.click('[data-bs-target="#addTradePlanModal"]');
        await page.click('#add-conditions-tab');
        await page.click('button:has-text("הוסף תנאי")');
        
        // Select method
        await page.selectOption('#method-select', '1');
        
        // Try to save with invalid parameter
        await page.fill('#param-period', 'invalid');
        await page.click('button:has-text("שמור תנאי")');
        
        // Check error message appears
        await expect(page.locator('.error-notification')).toBeVisible();
    });
    
    test('should show success message when condition is saved', async () => {
        await page.goto('http://localhost:8080/trade_plans.html');
        await page.click('[data-bs-target="#addTradePlanModal"]');
        await page.click('#add-conditions-tab');
        await page.click('button:has-text("הוסף תנאי")');
        
        // Select method and fill valid parameters
        await page.selectOption('#method-select', '1');
        await page.fill('#param-period', '20');
        
        // Save condition
        await page.click('button:has-text("שמור תנאי")');
        
        // Check success message appears
        await expect(page.locator('.success-notification')).toBeVisible();
        
        // Check condition appears in list
        await expect(page.locator('.condition-item')).toContainText('ממוצעים נעים');
    });
});
```

---

## בדיקות אבטחה

### 1. בדיקת ולידציה

```python
class TestSecurity(unittest.TestCase):
    
    def test_sql_injection_prevention(self):
        """Test SQL injection prevention"""
        
        # Try SQL injection in parameters
        malicious_data = {
            'trade_plan_id': 1,
            'method_id': 1,
            'condition_group': 0,
            'parameters_json': '{"period": "20; DROP TABLE plan_conditions; --"}',
            'logical_operator': 'AND'
        }
        
        response = self.client.post('/api/plan_conditions', json=malicious_data)
        
        # Should not cause error (SQL injection prevented)
        self.assertIn(response.status_code, [200, 201, 400, 422])
        
        # Verify table still exists
        response = self.client.get('/api/plan_conditions')
        self.assertEqual(response.status_code, 200)
    
    def test_xss_prevention(self):
        """Test XSS prevention"""
        
        # Try XSS in parameters
        xss_data = {
            'trade_plan_id': 1,
            'method_id': 1,
            'condition_group': 0,
            'parameters_json': '{"period": "<script>alert(\'XSS\')</script>"}',
            'logical_operator': 'AND'
        }
        
        response = self.client.post('/api/plan_conditions', json=xss_data)
        
        if response.status_code == 201:
            condition = response.get_json()
            # Verify XSS is escaped
            self.assertNotIn('<script>', condition['parameters_json'])
    
    def test_authentication_required(self):
        """Test that authentication is required"""
        
        # Test without authentication
        response = self.client.get('/api/trading_methods')
        
        # Should require authentication
        self.assertIn(response.status_code, [401, 403])
    
    def test_authorization(self):
        """Test that users can only access their own data"""
        
        # Test accessing another user's conditions
        response = self.client.get('/api/plan_conditions?plan_id=99999')
        
        # Should not return other user's data
        if response.status_code == 200:
            data = response.get_json()
            self.assertEqual(len(data), 0)
```

---

## הרצת בדיקות

### 1. Backend Tests

```bash
# Run all backend tests
python3 -m pytest Backend/tests/ -v

# Core regressions (חובה למערכת התנאים)
python3 -m pytest Backend/tests/test_conditions_master_data.py
python3 -m pytest Backend/tests/test_condition_evaluation_task.py

# Run specific test file
python3 -m pytest Backend/tests/test_conditions_validation_service.py -v

# Run with coverage
python3 -m pytest Backend/tests/ --cov=Backend.services --cov-report=html
```

### 2. Frontend Tests

```bash
# Run frontend tests
cd trading-ui
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test condition-builder.test.js
```

### 3. Integration Tests

```bash
# Run integration tests
python -m pytest tests/integration/ -v

# Run with database
python -m pytest tests/integration/ --database=test
```

### 4. Performance Tests

```bash
# Run performance tests
python -m pytest tests/performance/ -v

# Run with profiling
python -m pytest tests/performance/ --profile
```

---

## דיווח על תוצאות

### 1. דוח בדיקות

```python
import json
import datetime

class TestReporter:
    
    def generate_report(self, test_results):
        """Generate comprehensive test report"""
        
        report = {
            'timestamp': datetime.datetime.now().isoformat(),
            'summary': {
                'total_tests': len(test_results),
                'passed': sum(1 for r in test_results if r['status'] == 'passed'),
                'failed': sum(1 for r in test_results if r['status'] == 'failed'),
                'skipped': sum(1 for r in test_results if r['status'] == 'skipped')
            },
            'details': test_results,
            'coverage': self.get_coverage_info(),
            'performance': self.get_performance_info()
        }
        
        return report
    
    def save_report(self, report, filename):
        """Save report to file"""
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
    
    def get_coverage_info(self):
        """Get code coverage information"""
        
        # Implementation for coverage info
        pass
    
    def get_performance_info(self):
        """Get performance information"""
        
        # Implementation for performance info
        pass
```

### 2. דוח HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - Conditions System</title>
    <style>
        .passed { color: green; }
        .failed { color: red; }
        .skipped { color: orange; }
        .summary { font-weight: bold; }
    </style>
</head>
<body>
    <h1>Test Report - Conditions System</h1>
    
    <div class="summary">
        <p>Total Tests: <span id="total"></span></p>
        <p>Passed: <span id="passed" class="passed"></span></p>
        <p>Failed: <span id="failed" class="failed"></span></p>
        <p>Skipped: <span id="skipped" class="skipped"></span></p>
    </div>
    
    <h2>Test Details</h2>
    <table>
        <thead>
            <tr>
                <th>Test Name</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Error</th>
            </tr>
        </thead>
        <tbody id="test-details">
        </tbody>
    </table>
    
    <script>
        // Load and display test results
        fetch('test-results.json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('total').textContent = data.summary.total_tests;
                document.getElementById('passed').textContent = data.summary.passed;
                document.getElementById('failed').textContent = data.summary.failed;
                document.getElementById('skipped').textContent = data.summary.skipped;
                
                const tbody = document.getElementById('test-details');
                data.details.forEach(test => {
                    const row = tbody.insertRow();
                    row.insertCell(0).textContent = test.name;
                    row.insertCell(1).textContent = test.status;
                    row.insertCell(2).textContent = test.duration;
                    row.insertCell(3).textContent = test.error || '';
                    
                    row.cells[1].className = test.status;
                });
            });
    </script>
</body>
</html>
```

---

## קישורים נוספים

- [מדריך מפתח](./CONDITIONS_SYSTEM_DEVELOPER_GUIDE.md)
- [תיעוד API](./CONDITIONS_SYSTEM_API_DOCUMENTATION.md)
- [ארכיטקטורה](./CONDITIONS_SYSTEM_ARCHITECTURE.md)
- [מדריך משתמש](./CONDITIONS_SYSTEM_USER_GUIDE.md)
