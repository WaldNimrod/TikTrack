# Business Rules Registry - Documentation
# Business Rules Registry - תיעוד

**תאריך יצירה:** 22 נובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ תיעוד מלא  
**מטרה:** תיעוד מקיף של Business Rules Registry במערכת TikTrack

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [מבנה ה-Registry](#מבנה-ה-registry)
3. [חוקי העסק לפי ישות](#חוקי-העסק-לפי-ישות)
4. [שימוש ב-Registry](#שימוש-ב-registry)
5. [הוספת חוקים חדשים](#הוספת-חוקים-חדשים)
6. [Validation](#validation)

---

## 🎯 סקירה כללית

Business Rules Registry הוא מרשם מרכזי לכל חוקי העסק במערכת TikTrack. ה-Registry מספק:

- **מקור אמת יחיד** - כל חוקי העסק במקום אחד
- **ולידציה מרכזית** - ולידציה אחידה לכל הישויות
- **תחזוקה קלה** - שינוי חוק עסקי במקום אחד משפיע על כל המערכת
- **עקביות** - הבטחת עקביות בלוגיקה העסקית

### חלוקה בין Constraints ל-Business Rules:

**Database Constraints (ValidationService):**
- אילוצים בסיסיים מבסיס הנתונים (NOT NULL, UNIQUE, FOREIGN KEY, ENUM, RANGE, CHECK)
- נבדקים כשלב ראשון ב-`validate()` דרך `validate_with_constraints()`

**Business Rules (BusinessRulesRegistry):**
- חוקי עסק מורכבים (min/max, allowed_values, required)
- חוקים שלא ניתן לבטא ב-constraints
- נבדקים כשלב שני ב-`validate()` דרך `registry.validate_value()`

**הערה חשובה:** אין כפילות - Constraints בודקים אילוצים בסיסיים, Business Rules בודקים חוקים מורכבים יותר.

### מיקום:

**קובץ:** `Backend/services/business_logic/business_rules_registry.py`

### שימוש:

כל Business Service משתמש ב-Registry לולידציה של נתונים:
- `TradeBusinessService` - ולידציה של trades
- `ExecutionBusinessService` - ולידציה של executions
- `AlertBusinessService` - ולידציה של alerts
- וכו'

---

## 🏗️ מבנה ה-Registry

### מבנה כללי:

```python
BUSINESS_RULES: Dict[str, Dict[str, Any]] = {
    'entity_type': {
        'field_name': {
            'min': float | None,           # ערך מינימלי
            'max': float | None,           # ערך מקסימלי
            'required': bool,              # האם שדה חובה
            'type': str,                   # סוג שדה ('float', 'string')
            'allowed_values': List[str]    # ערכים מותרים (אם קיים)
        }
    }
}
```

### BusinessRulesRegistry Class:

```python
class BusinessRulesRegistry:
    def __init__(self):
        """Initialize the registry with default rules."""
        self.rules = BUSINESS_RULES.copy()
    
    def get_rule(self, entity_type: str, field: str) -> Optional[Dict[str, Any]]:
        """Get a specific business rule."""
    
    def get_entity_rules(self, entity_type: str) -> Dict[str, Any]:
        """Get all rules for an entity type."""
    
    def validate_value(self, entity_type: str, field: str, value: Any) -> Dict[str, Any]:
        """Validate a value against business rules."""
    
    def add_rule(self, entity_type: str, field: str, rule: Dict[str, Any]):
        """Add or update a business rule."""
    
    def get_all_rules(self) -> Dict[str, Dict[str, Any]]:
        """Get all business rules."""
```

### Global Instance:

```python
# Global registry instance
business_rules_registry = BusinessRulesRegistry()
```

---

## 📋 חוקי העסק לפי ישות

### Trade Rules

**ישות:** `trade`

| שדה | סוג | מינימום | מקסימום | חובה | ערכים מותרים |
| --- | --- | --- | --- | --- | --- |
| `price` | float | 0.01 | 1,000,000 | ✅ | - |
| `quantity` | float | 0.01 | 1,000,000,000 | ✅ | - |
| `stop_loss` | float | 0.01 | None | ❌ | - |
| `take_profit` | float | 0.01 | None | ❌ | - |
| `stop_loss_percent` | float | 0.01 | 100 | ❌ | - |
| `take_profit_percent` | float | 0.01 | 10,000 | ❌ | - |
| `side` | string | - | - | ✅ | `['buy', 'sell', 'long', 'short']` |
| `investment_type` | string | - | - | ✅ | `['Investment', 'Swing', 'Passive']` |
| `status` | string | - | - | ✅ | `['open', 'closed', 'cancelled']` |

**הערות:**
- `quantity` תומך בשברים (fractional shares)
- `take_profit_percent` תומך באחוזים גבוהים (עד 10,000%)
- `side` תומך ב-4 ערכים: buy, sell, long, short

### Execution Rules

**ישות:** `execution`

| שדה | סוג | מינימום | מקסימום | חובה | ערכים מותרים |
| --- | --- | --- | --- | --- | --- |
| `price` | float | 0.01 | 1,000,000 | ✅ | - |
| `quantity` | float | 0.01 | 1,000,000,000 | ✅ | - |
| `action` | string | - | - | ✅ | `['buy', 'sell', 'short', 'cover']` |
| `status` | string | - | - | ✅ | `['pending', 'completed', 'cancelled']` |

**הערות:**
- `action` תומך ב-4 פעולות: buy, sell, short, cover
- `status` תומך ב-3 סטטוסים: pending, completed, cancelled

### Alert Rules

**ישות:** `alert`

| שדה | סוג | מינימום | מקסימום | חובה | ערכים מותרים |
| --- | --- | --- | --- | --- | --- |
| `condition_number` | float | None | None | ❌ | - |
| `condition_attribute` | string | - | - | ✅ | `['price', 'change', 'volume']` |
| `price` | float | 0.01 | 1,000,000 | ❌ | - |
| `change_percent` | float | -100 | 100 | ❌ | - |

**הערות:**
- `condition_number` תלוי בסוג התנאי (min/max לא מוגדרים)
- `condition_attribute` תומך ב-3 סוגים: price, change, volume
- `change_percent` תומך בערכים שליליים (ירידות) וחיוביים (עליות)

### Cash Flow Rules

**ישות:** `cash_flow`

| שדה | סוג | מינימום | מקסימום | חובה | ערכים מותרים |
| --- | --- | --- | --- | --- | --- |
| `amount` | float | 0.01 | 1,000,000,000 | ✅ | - |
| `type` | string | - | - | ✅ | `['income', 'expense', 'fee', 'tax', 'interest']` |
| `source` | string | - | - | ✅ | `['manual', 'automatic']` |

**הערות:**
- `amount` תומך בסכומים גדולים (עד מיליארד)
- `type` תומך ב-5 סוגים: income, expense, fee, tax, interest
- `source` תומך ב-2 מקורות: manual, automatic

### Statistics Rules

**ישות:** `statistics`

| שדה | סוג | מינימום | מקסימום | חובה | ערכים מותרים |
| --- | --- | --- | --- | --- | --- |
| `calculation_types` | string | - | - | ✅ | `['kpi', 'summary', 'average', 'position', 'portfolio']` |

**הערות:**
- `calculation_types` תומך ב-5 סוגי חישובים: kpi, summary, average, position, portfolio

### Note Rules

**ישות:** `note`

**סטטוס:** ⏳ חוקים לא מוגדרים ב-Registry (ולידציה ב-NoteBusinessService)

**הערות:**
- ולידציה של notes מתבצעת ב-NoteBusinessService ישירות
- אין חוקים מרכזיים ב-Registry עבור notes

### Trading Account Rules

**ישות:** `trading_account`

**סטטוס:** ⏳ חוקים לא מוגדרים ב-Registry (ולידציה ב-TradingAccountBusinessService)

**הערות:**
- ולידציה של trading accounts מתבצעת ב-TradingAccountBusinessService ישירות
- אין חוקים מרכזיים ב-Registry עבור trading accounts

### Trade Plan Rules

**ישות:** `trade_plan`

**סטטוס:** ⏳ חוקים לא מוגדרים ב-Registry (ולידציה ב-TradePlanBusinessService)

**הערות:**
- ולידציה של trade plans מתבצעת ב-TradePlanBusinessService ישירות
- אין חוקים מרכזיים ב-Registry עבור trade plans

### Ticker Rules

**ישות:** `ticker`

**סטטוס:** ⏳ חוקים לא מוגדרים ב-Registry (ולידציה ב-TickerBusinessService)

**הערות:**
- ולידציה של tickers מתבצעת ב-TickerBusinessService ישירות
- אין חוקים מרכזיים ב-Registry עבור tickers

### Currency Rules

**ישות:** `currency`

**סטטוס:** ⏳ חוקים לא מוגדרים ב-Registry (ולידציה ב-CurrencyBusinessService)

**הערות:**
- ולידציה של currencies מתבצעת ב-CurrencyBusinessService ישירות
- אין חוקים מרכזיים ב-Registry עבור currencies

### Tag Rules

**ישות:** `tag`

**סטטוס:** ⏳ חוקים לא מוגדרים ב-Registry (ולידציה ב-TagBusinessService)

**הערות:**
- ולידציה של tags מתבצעת ב-TagBusinessService ישירות
- אין חוקים מרכזיים ב-Registry עבור tags

---

## 🔧 שימוש ב-Registry

### 1. קבלת חוק ספציפי

```python
from services.business_logic.business_rules_registry import business_rules_registry

# Get rule for trade price
rule = business_rules_registry.get_rule('trade', 'price')
# Returns: {'min': 0.01, 'max': 1000000, 'required': True, 'type': 'float'}
```

### 2. קבלת כל החוקים לישות

```python
# Get all rules for trade entity
trade_rules = business_rules_registry.get_entity_rules('trade')
# Returns: {'price': {...}, 'quantity': {...}, 'side': {...}, ...}
```

### 3. ולידציה של ערך

```python
# Validate a price value
result = business_rules_registry.validate_value('trade', 'price', 100.0)
# Returns: {'is_valid': True, 'error': None, 'errors': []}

# Validate an invalid price
result = business_rules_registry.validate_value('trade', 'price', -10.0)
# Returns: {'is_valid': False, 'error': 'price must be at least 0.01', 'errors': ['price must be at least 0.01']}
```

### 4. שימוש ב-Business Service

```python
from services.business_logic.trade_business_service import TradeBusinessService

service = TradeBusinessService()

# Service uses registry internally
result = service.validate({
    'price': 100.0,
    'quantity': 10.0,
    'side': 'buy',
    'investment_type': 'Swing',
    'status': 'open'
})

if not result['is_valid']:
    for error in result['errors']:
        print(error)
```

### 5. דוגמה מלאה

```python
from services.business_logic.business_rules_registry import business_rules_registry

# Example: Validate trade data
trade_data = {
    'price': 100.0,
    'quantity': 10.0,
    'side': 'buy',
    'investment_type': 'Swing',
    'status': 'open'
}

errors = []

# Validate each field
for field, value in trade_data.items():
    if value is None or value == '':
        continue
    
    rule_result = business_rules_registry.validate_value('trade', field, value)
    if not rule_result['is_valid']:
        errors.append(rule_result['error'])

if errors:
    print('Validation errors:', errors)
else:
    print('Validation passed!')
```

---

## ➕ הוספת חוקים חדשים

### שלב 1: הוספת חוק ל-BUSINESS_RULES

```python
BUSINESS_RULES: Dict[str, Dict[str, Any]] = {
    'trade': {
        # ... existing rules ...
        'new_field': {
            'min': 0.01,
            'max': 1000,
            'required': False,
            'type': 'float'
        }
    }
}
```

### שלב 2: שימוש ב-add_rule (דינמי)

```python
from services.business_logic.business_rules_registry import business_rules_registry

# Add a new rule dynamically
business_rules_registry.add_rule('trade', 'new_field', {
    'min': 0.01,
    'max': 1000,
    'required': False,
    'type': 'float'
})
```

### שלב 3: עדכון Business Service

```python
# In TradeBusinessService.validate()
def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
    errors = []
    
    # Validate new field using registry
    if 'new_field' in data:
        rule_result = self.registry.validate_value('trade', 'new_field', data['new_field'])
        if not rule_result['is_valid']:
            errors.append(rule_result['error'])
    
    # ... rest of validation ...
```

### דוגמה: הוספת חוק לישות חדשה

```python
# Add rules for a new entity
BUSINESS_RULES['new_entity'] = {
    'field1': {
        'min': 0.01,
        'max': 1000,
        'required': True,
        'type': 'float'
    },
    'field2': {
        'allowed_values': ['value1', 'value2', 'value3'],
        'required': True,
        'type': 'string'
    }
}
```

---

## ✅ Validation

### איך ה-Registry משמש לולידציה:

#### 1. Type Validation

```python
# Check if value is correct type
rule = business_rules_registry.get_rule('trade', 'price')
if rule['type'] == 'float' and not isinstance(value, (int, float)):
    errors.append(f"price must be a number")
```

#### 2. Min/Max Validation

```python
# Check if value is within range
rule = business_rules_registry.get_rule('trade', 'price')
if isinstance(value, (int, float)):
    if rule['min'] is not None and value < rule['min']:
        errors.append(f"price must be at least {rule['min']}")
    if rule['max'] is not None and value > rule['max']:
        errors.append(f"price must be at most {rule['max']}")
```

#### 3. Allowed Values Validation

```python
# Check if value is in allowed list
rule = business_rules_registry.get_rule('trade', 'side')
if 'allowed_values' in rule:
    if value not in rule['allowed_values']:
        errors.append(f"side must be one of: {', '.join(rule['allowed_values'])}")
```

#### 4. Required Validation

```python
# Check if required field is present
rule = business_rules_registry.get_rule('trade', 'price')
if rule.get('required', False) and (value is None or value == ''):
    errors.append(f"price is required")
```

### דוגמה מלאה: ולידציה ב-Business Service

```python
class TradeBusinessService(BaseBusinessService):
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        errors = []
        
        # Validate required fields
        required_fields = ['price', 'quantity', 'side', 'investment_type', 'status']
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                errors.append(f"{field} is required")
        
        # Validate field values using registry
        for field, value in data.items():
            if value is None or value == '':
                continue
            
            rule_result = self.registry.validate_value('trade', field, value)
            if not rule_result['is_valid']:
                errors.append(rule_result['error'])
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
```

---

## 📊 סיכום

### ישויות עם חוקים ב-Registry:

| ישות | מספר חוקים | סטטוס |
| --- | --- | --- |
| **Trade** | 9 | ✅ מוגדר |
| **Execution** | 4 | ✅ מוגדר |
| **Alert** | 4 | ✅ מוגדר |
| **Cash Flow** | 3 | ✅ מוגדר |
| **Statistics** | 1 | ✅ מוגדר |
| **Note** | 0 | ⏳ לא מוגדר |
| **Trading Account** | 0 | ⏳ לא מוגדר |
| **Trade Plan** | 0 | ⏳ לא מוגדר |
| **Ticker** | 0 | ⏳ לא מוגדר |
| **Currency** | 0 | ⏳ לא מוגדר |
| **Tag** | 0 | ⏳ לא מוגדר |
| **Preferences** | 3 | ✅ מוגדר |

**סה"כ:** 24 חוקים מוגדרים (6 ישויות)

---

## 📚 קישורים נוספים

- [Business Logic Layer Documentation](BUSINESS_LOGIC_LAYER.md)
- [Business Logic Developer Guide](../../03-DEVELOPMENT/GUIDES/BUSINESS_LOGIC_DEVELOPER_GUIDE.md)
- [Business Rules Registry Code](../../../Backend/services/business_logic/business_rules_registry.py)

---

**תאריך עדכון אחרון:** 22 נובמבר 2025  
**גרסה:** 1.0.0

