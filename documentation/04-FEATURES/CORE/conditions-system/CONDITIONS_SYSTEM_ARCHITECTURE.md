# ארכיטקטורת מערכת התנאים
**תאריך יצירה:** 19 אוקטובר 2025  
**גרסה:** 1.0.0  
**מפתח:** AI Assistant  

---

## סקירה כללית

מערכת התנאים בנויה על ארכיטקטורה מודולרית המאפשרת הרחבה קלה ותחזוקה פשוטה. המערכת מחולקת לשלושה שכבות עיקריות: Backend, Frontend, ו-Integration Layer.

---

## דיאגרמת ארכיטקטורה

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Condition Builder UI  │  Validation UI  │  Integration UI  │
│  ┌─────────────────┐   │  ┌───────────┐  │  ┌─────────────┐ │
│  │ ConditionBuilder│   │  │Validator  │  │  │Page         │ │
│  │ Component       │   │  │Component  │  │  │Integration  │ │
│  └─────────────────┘   │  └───────────┘  │  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    INTEGRATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  Unified Init  │  Cache System  │  Notification System      │
│  ┌───────────┐ │  ┌──────────┐  │  ┌─────────────────────┐  │
│  │App        │ │  │Unified   │  │  │Alert Integration    │  │
│  │Initializer│ │  │Cache     │  │  │                     │  │
│  └───────────┘ │  └──────────┘  │  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     BACKEND LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  API Routes    │  Models       │  Services                  │
│  ┌───────────┐ │  ┌──────────┐  │  ┌─────────────────────┐  │
│  │REST API   │ │  │SQLAlchemy│  │  │Validation Service   │  │
│  │Endpoints  │ │  │Models    │  │  │Evaluation Service   │  │
│  └───────────┘ │  └──────────┘  │  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    DATABASE LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Trading Methods │  Plan Conditions │  Trade Conditions     │
│  ┌─────────────┐ │  ┌─────────────┐ │  ┌─────────────────┐  │
│  │Methods      │ │  │Conditions   │  │  │Trade Conditions│  │
│  │Parameters   │ │  │Groups       │  │  │Inheritance     │  │
│  └─────────────┘ │  └─────────────┘  │  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## שכבות המערכת

### 1. Frontend Layer

#### Condition Builder Component
```javascript
class ConditionBuilder {
    constructor(entityType, entityId, containerId) {
        this.entityType = entityType;      // 'plan' או 'trade'
        this.entityId = entityId;          // ID של הפריט
        this.containerId = containerId;    // ID של הקונטיינר
        this.conditions = [];              // רשימת תנאים
        this.methods = [];                 // שיטות מסחר זמינות
    }
    
    // פונקציות עיקריות
    async loadMethods()           // טעינת שיטות מסחר
    async loadConditions()        // טעינת תנאים קיימים
    addCondition(method)          // הוספת תנאי חדש
    removeCondition(id)           // הסרת תנאי
    validateConditions()          // ולידציה של כל התנאים
    saveConditions()              // שמירת תנאים
}
```

#### Validation Component
```javascript
class ConditionValidator {
    static validateParameter(method, parameter, value) {
        // ולידציה של פרמטר בודד
    }
    
    static validateCondition(condition) {
        // ולידציה של תנאי שלם
    }
    
    static validateGroup(conditions) {
        // ולידציה של קבוצת תנאים
    }
}
```

### 2. Integration Layer

#### Unified Initialization
```javascript
// אינטגרציה עם המערכת המאוחדת
window.initializeTradePlanConditionsSystem = function() {
    // אתחול מערכת התנאים לתכניות מסחר
};

window.initializeTradeConditionsSystem = function() {
    // אתחול מערכת התנאים לטריידים
};
```

#### Cache Integration
```javascript
// אינטגרציה עם מערכת המטמון
const cacheKey = `conditions_${entityType}_${entityId}`;
const cachedConditions = await window.UnifiedCacheManager.get(cacheKey);
```

#### Notification Integration
```javascript
// אינטגרציה עם מערכת ההתראות
function createAlertFromCondition(conditionId, message) {
    // יצירת התראה מתנאי
}
```

### 3. Backend Layer

#### API Routes
```python
# trading_methods.py
@trading_methods_bp.route('/api/trading_methods', methods=['GET'])
def get_trading_methods():
    # קבלת רשימת שיטות מסחר

# plan_conditions.py
@plan_conditions_bp.route('/api/plan_conditions', methods=['GET', 'POST'])
def handle_plan_conditions():
    # ניהול תנאי תכניות

# trade_conditions.py
@trade_conditions_bp.route('/api/trade_conditions', methods=['GET', 'POST'])
def handle_trade_conditions():
    # ניהול תנאי טריידים
```

#### Models
```python
# trading_method.py
class TradingMethod(BaseModel):
    # הגדרת שיטות מסחר
    name_en = Column(String(100), unique=True, nullable=False)
    name_he = Column(String(100), unique=True, nullable=False)
    method_key = Column(String(50), unique=True, nullable=False)
    parameters = relationship("MethodParameter", back_populates="method")

# plan_condition.py
class PlanCondition(BaseModel):
    # הגדרת תנאי תכניות
    trade_plan_id = Column(Integer, ForeignKey('trade_plans.id'))
    method_id = Column(Integer, ForeignKey('trading_methods.id'))
    parameters_json = Column(Text, nullable=False)
    condition_group = Column(Integer, default=0)
```

#### Services
```python
# conditions_validation_service.py
class ConditionsValidationService:
    @staticmethod
    def validate_condition(condition_data):
        # ולידציה של תנאי
        
    @staticmethod
    def validate_parameters(method_id, parameters):
        # ולידציה של פרמטרים

# conditions_evaluation_service.py
class ConditionsEvaluationService:
    @staticmethod
    def evaluate_condition(condition, market_data):
        # הערכת תנאי מול נתוני שוק
```

### 4. Database Layer

#### Trading Methods Table
```sql
CREATE TABLE trading_methods (
    id INTEGER PRIMARY KEY,
    name_en VARCHAR(100) UNIQUE NOT NULL,
    name_he VARCHAR(100) UNIQUE NOT NULL,
    method_key VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Method Parameters Table
```sql
CREATE TABLE method_parameters (
    id INTEGER PRIMARY KEY,
    method_id INTEGER REFERENCES trading_methods(id),
    parameter_key VARCHAR(50) NOT NULL,
    parameter_name_en VARCHAR(100) NOT NULL,
    parameter_name_he VARCHAR(100) NOT NULL,
    parameter_type VARCHAR(20) NOT NULL,
    default_value VARCHAR(100),
    min_value VARCHAR(50),
    max_value VARCHAR(50),
    is_required BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);
```

#### Plan Conditions Table
```sql
CREATE TABLE plan_conditions (
    id INTEGER PRIMARY KEY,
    trade_plan_id INTEGER REFERENCES trade_plans(id),
    method_id INTEGER REFERENCES trading_methods(id),
    condition_group INTEGER DEFAULT 0,
    parameters_json TEXT NOT NULL,
    logical_operator VARCHAR(10) DEFAULT 'NONE',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## זרימת נתונים

### 1. יצירת תנאי חדש
```
User Input → Frontend Validation → API Request → Backend Validation → Database → Response
```

### 2. הערכת תנאי
```
Market Data → Evaluation Service → Condition Check → Result → Alert Generation
```

### 3. רשת תנאים
```
Plan Condition → Copy → Trade Condition → Validation → Save
```

---

## דפוסי עיצוב

### 1. Builder Pattern
```javascript
// שימוש ב-Builder Pattern לבניית תנאים
const condition = new ConditionBuilder()
    .setMethod('moving_averages')
    .addParameter('period', 20)
    .addParameter('type', 'SMA')
    .setComparison('above')
    .build();
```

### 2. Strategy Pattern
```javascript
// שימוש ב-Strategy Pattern להערכת תנאים
const evaluators = {
    'moving_averages': new MovingAveragesEvaluator(),
    'volume': new VolumeEvaluator(),
    'support_resistance': new SupportResistanceEvaluator()
};
```

### 3. Observer Pattern
```javascript
// שימוש ב-Observer Pattern לעדכונים
conditionBuilder.on('conditionAdded', (condition) => {
    // עדכון UI
});

conditionBuilder.on('validationFailed', (errors) => {
    // הצגת שגיאות
});
```

---

## ביצועים ואופטימיזציה

### 1. Caching Strategy
- **Frontend Cache:** תנאים נשמרים ב-localStorage
- **Backend Cache:** שיטות מסחר נשמרות ב-Redis
- **Database Cache:** שאילתות נשמרות ב-query cache

### 2. Lazy Loading
```javascript
// טעינה עצלה של שיטות מסחר
async loadMethods() {
    if (!this.methods.length) {
        this.methods = await this.fetchMethods();
    }
    return this.methods;
}
```

### 3. Debouncing
```javascript
// debouncing לוולידציה
const debouncedValidation = debounce((condition) => {
    this.validateCondition(condition);
}, 300);
```

---

## אבטחה

### 1. Input Validation
- ולידציה מלאה של כל הקלטים
- Sanitization של פרמטרים
- בדיקת הרשאות

### 2. SQL Injection Prevention
```python
# שימוש ב-SQLAlchemy ORM
condition = PlanCondition.query.filter_by(
    trade_plan_id=plan_id,
    is_active=True
).all()
```

### 3. XSS Prevention
```javascript
// Sanitization של HTML
const sanitizedHtml = DOMPurify.sanitize(userInput);
```

---

## בדיקות

### 1. Unit Tests
```python
def test_condition_validation():
    # בדיקת ולידציה של תנאי
    
def test_parameter_validation():
    # בדיקת ולידציה של פרמטרים
```

### 2. Integration Tests
```python
def test_condition_creation_flow():
    # בדיקת זרימת יצירת תנאי
    
def test_condition_evaluation():
    # בדיקת הערכת תנאי
```

### 3. Frontend Tests
```javascript
describe('ConditionBuilder', () => {
    it('should create condition successfully', () => {
        // בדיקת יצירת תנאי
    });
    
    it('should validate parameters correctly', () => {
        // בדיקת ולידציה
    });
});
```

---

## תחזוקה והרחבה

### 1. הוספת שיטת מסחר חדשה
1. הוסף רשומה לטבלת `trading_methods`
2. הוסף פרמטרים לטבלת `method_parameters`
3. צור evaluator חדש
4. עדכן את ה-UI

### 2. הוספת סוג פרמטר חדש
1. עדכן את `ConditionValidator`
2. הוסף ולידציה ב-Frontend
3. עדכן את ה-UI components

### 3. שיפור ביצועים
1. הוסף אינדקסים למסד הנתונים
2. יישם caching נוסף
3. אופטם שאילתות

---

## קישורים נוספים

- [תיעוד API](./API_DOCUMENTATION.md)
- [מדריך מפתח](./DEVELOPER_GUIDE.md)
- [מדריך בדיקות](./TESTING_GUIDE.md)
