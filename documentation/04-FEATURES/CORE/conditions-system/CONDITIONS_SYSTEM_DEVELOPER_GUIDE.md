# מדריך מפתח - מערכת התנאים
**תאריך יצירה:** 19 אוקטובר 2025  
**גרסה:** 1.0.0  
**מפתח:** AI Assistant  

---

## סקירה כללית

מדריך זה מיועד למפתחים המעוניינים להבין, לתחזק ולהרחיב את מערכת התנאים. המדריך כולל הסברים טכניים מפורטים, דוגמאות קוד, וטיפים לפיתוח.

---

## מבנה הפרויקט

### Backend Structure
```
Backend/
├── models/
│   ├── trading_method.py          # מודל שיטות מסחר
│   └── plan_condition.py          # מודל תנאים
├── routes/api/
│   ├── trading_methods.py         # API endpoints לשיטות מסחר
│   ├── plan_conditions.py         # API endpoints לתנאי תכניות
│   └── trade_conditions.py        # API endpoints לתנאי טריידים
├── services/
│   ├── conditions_validation_service.py  # שירות ולידציה
│   └── conditions_evaluation_service.py  # שירות הערכה
└── migrations/
    └── add_conditions_constraints.py     # migration script
```

### Frontend Structure
```
trading-ui/
├── scripts/conditions/
│   ├── conditions-translations.js # תרגומים
│   ├── condition-validator.js     # ולידציה קליינט
│   └── condition-builder.js       # בונה תנאים
└── styles-new/06-components/
    └── _conditions-system.css     # עיצוב מערכת
```

---

## Backend Development

### 1. יצירת מודל חדש

#### TradingMethod Model
```python
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from models.base import BaseModel

class TradingMethod(BaseModel):
    __tablename__ = "trading_methods"
    
    id = Column(Integer, primary_key=True)
    name_en = Column(String(100), unique=True, nullable=False)
    name_he = Column(String(100), unique=True, nullable=False)
    description_en = Column(Text, nullable=True)
    description_he = Column(Text, nullable=True)
    method_key = Column(String(50), unique=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    parameters = relationship("MethodParameter", back_populates="method", cascade="all, delete-orphan")
    plan_conditions = relationship("PlanCondition", back_populates="method")
    trade_conditions = relationship("TradeCondition", back_populates="method")
    
    def to_dict(self):
        return {
            'id': self.id,
            'name_en': self.name_en,
            'name_he': self.name_he,
            'description_en': self.description_en,
            'description_he': self.description_he,
            'method_key': self.method_key,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'parameters': [param.to_dict() for param in self.parameters]
        }
```

#### MethodParameter Model
```python
class MethodParameter(BaseModel):
    __tablename__ = "method_parameters"
    
    id = Column(Integer, primary_key=True)
    method_id = Column(Integer, ForeignKey('trading_methods.id'), nullable=False)
    parameter_key = Column(String(50), nullable=False)
    parameter_name_en = Column(String(100), nullable=False)
    parameter_name_he = Column(String(100), nullable=False)
    parameter_type = Column(String(20), nullable=False)  # integer, float, string, boolean, select
    default_value = Column(String(100), nullable=True)
    min_value = Column(String(50), nullable=True)
    max_value = Column(String(50), nullable=True)
    validation_rule = Column(Text, nullable=True)
    is_required = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    help_text_en = Column(Text, nullable=True)
    help_text_he = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    method = relationship("TradingMethod", back_populates="parameters")
    
    def to_dict(self):
        return {
            'id': self.id,
            'method_id': self.method_id,
            'parameter_key': self.parameter_key,
            'parameter_name_en': self.parameter_name_en,
            'parameter_name_he': self.parameter_name_he,
            'parameter_type': self.parameter_type,
            'default_value': self.default_value,
            'min_value': self.min_value,
            'max_value': self.max_value,
            'validation_rule': self.validation_rule,
            'is_required': self.is_required,
            'sort_order': self.sort_order,
            'help_text_en': self.help_text_en,
            'help_text_he': self.help_text_he
        }
```

### 2. יצירת API Route

#### Trading Methods API
```python
from flask import Blueprint, request, jsonify
from models.trading_method import TradingMethod
from config.database import get_db
from sqlalchemy.orm import Session

trading_methods_bp = Blueprint('trading_methods', __name__)

@trading_methods_bp.route('/api/trading_methods', methods=['GET'])
def get_trading_methods():
    """Get all trading methods"""
    try:
        db: Session = get_db()
        
        # Get query parameters
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        
        # Build query
        query = db.query(TradingMethod)
        if active_only:
            query = query.filter(TradingMethod.is_active == True)
        
        # Execute query
        methods = query.all()
        
        # Convert to dict
        result = [method.to_dict() for method in methods]
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': str(e)
        }), 500
    finally:
        db.close()

@trading_methods_bp.route('/api/trading_methods/<int:method_id>', methods=['GET'])
def get_trading_method(method_id):
    """Get specific trading method"""
    try:
        db: Session = get_db()
        
        method = db.query(TradingMethod).filter(
            TradingMethod.id == method_id,
            TradingMethod.is_active == True
        ).first()
        
        if not method:
            return jsonify({
                'error': 'Not Found',
                'message': 'Trading method not found'
            }), 404
        
        return jsonify(method.to_dict()), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': str(e)
        }), 500
    finally:
        db.close()
```

### 3. יצירת שירות ולידציה

```python
import json
from typing import Dict, List, Tuple, Any
from models.trading_method import TradingMethod, MethodParameter
from config.database import get_db

class ConditionsValidationService:
    """Service for validating conditions and parameters"""
    
    @staticmethod
    def validate_condition(condition_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validate a complete condition
        
        Args:
            condition_data: Dictionary containing condition data
            
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []
        
        # Validate required fields
        required_fields = ['method_id', 'parameters_json']
        for field in required_fields:
            if field not in condition_data:
                errors.append(f"Missing required field: {field}")
        
        if errors:
            return False, errors
        
        # Validate method exists
        method_id = condition_data['method_id']
        if not ConditionsValidationService._method_exists(method_id):
            errors.append(f"Trading method {method_id} not found")
            return False, errors
        
        # Validate parameters
        try:
            parameters = json.loads(condition_data['parameters_json'])
        except json.JSONDecodeError:
            errors.append("Invalid JSON format in parameters_json")
            return False, errors
        
        # Validate each parameter
        param_errors = ConditionsValidationService.validate_parameters(method_id, parameters)
        errors.extend(param_errors)
        
        return len(errors) == 0, errors
    
    @staticmethod
    def validate_parameters(method_id: int, parameters: Dict[str, Any]) -> List[str]:
        """
        Validate parameters for a specific method
        
        Args:
            method_id: ID of the trading method
            parameters: Dictionary of parameters to validate
            
        Returns:
            List of validation errors
        """
        errors = []
        
        try:
            db = get_db()
            
            # Get method parameters
            method_params = db.query(MethodParameter).filter(
                MethodParameter.method_id == method_id
            ).all()
            
            # Check required parameters
            for param in method_params:
                if param.is_required and param.parameter_key not in parameters:
                    errors.append(f"Required parameter '{param.parameter_key}' is missing")
            
            # Validate each provided parameter
            for param_key, param_value in parameters.items():
                param_def = next((p for p in method_params if p.parameter_key == param_key), None)
                if not param_def:
                    errors.append(f"Unknown parameter: {param_key}")
                    continue
                
                # Validate parameter value
                param_errors = ConditionsValidationService._validate_parameter_value(
                    param_def, param_value
                )
                errors.extend(param_errors)
            
            return errors
            
        except Exception as e:
            return [f"Validation error: {str(e)}"]
        finally:
            db.close()
    
    @staticmethod
    def _validate_parameter_value(param_def: MethodParameter, value: Any) -> List[str]:
        """Validate a single parameter value"""
        errors = []
        
        # Type validation
        if param_def.parameter_type == 'integer':
            try:
                int_value = int(value)
                if param_def.min_value and int_value < int(param_def.min_value):
                    errors.append(f"Parameter '{param_def.parameter_key}' must be >= {param_def.min_value}")
                if param_def.max_value and int_value > int(param_def.max_value):
                    errors.append(f"Parameter '{param_def.parameter_key}' must be <= {param_def.max_value}")
            except (ValueError, TypeError):
                errors.append(f"Parameter '{param_def.parameter_key}' must be an integer")
        
        elif param_def.parameter_type == 'float':
            try:
                float_value = float(value)
                if param_def.min_value and float_value < float(param_def.min_value):
                    errors.append(f"Parameter '{param_def.parameter_key}' must be >= {param_def.min_value}")
                if param_def.max_value and float_value > float(param_def.max_value):
                    errors.append(f"Parameter '{param_def.parameter_key}' must be <= {param_def.max_value}")
            except (ValueError, TypeError):
                errors.append(f"Parameter '{param_def.parameter_key}' must be a number")
        
        elif param_def.parameter_type == 'boolean':
            if not isinstance(value, bool) and value not in ['true', 'false', '1', '0']:
                errors.append(f"Parameter '{param_def.parameter_key}' must be a boolean")
        
        elif param_def.parameter_type == 'select':
            # For select type, we would need to define valid options
            # This is a placeholder for future implementation
            pass
        
        return errors
    
    @staticmethod
    def _method_exists(method_id: int) -> bool:
        """Check if a trading method exists and is active"""
        try:
            db = get_db()
            method = db.query(TradingMethod).filter(
                TradingMethod.id == method_id,
                TradingMethod.is_active == True
            ).first()
            return method is not None
        except Exception:
            return False
        finally:
            db.close()
```

---

## Frontend Development

### 1. ConditionBuilder Class

```javascript
class ConditionBuilder {
    constructor(entityType, entityId, containerId) {
        this.entityType = entityType;      // 'plan' או 'trade'
        this.entityId = entityId;          // ID של הפריט
        this.containerId = containerId;    // ID של הקונטיינר
        this.conditions = [];              // רשימת תנאים
        this.methods = [];                 // שיטות מסחר זמינות
        this.currentGroup = 0;             // קבוצה נוכחית
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadMethods();
            await this.loadConditions();
            this.render();
            this.setupEventListeners();
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize ConditionBuilder:', error);
            this.showError('שגיאה באתחול מערכת התנאים');
        }
    }
    
    async loadMethods() {
        try {
            const response = await fetch('/api/trading_methods?active_only=true');
            if (!response.ok) throw new Error('Failed to load methods');
            
            this.methods = await response.json();
        } catch (error) {
            console.error('Error loading methods:', error);
            throw error;
        }
    }
    
    async loadConditions() {
        if (!this.entityId) return;
        
        try {
            const endpoint = this.entityType === 'plan' 
                ? `/api/plan_conditions?plan_id=${this.entityId}`
                : `/api/trade_conditions?trade_id=${this.entityId}`;
            
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error('Failed to load conditions');
            
            this.conditions = await response.json();
        } catch (error) {
            console.error('Error loading conditions:', error);
            throw error;
        }
    }
    
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container ${this.containerId} not found`);
            return;
        }
        
        container.innerHTML = this.generateHTML();
        this.setupEventListeners();
    }
    
    generateHTML() {
        return `
            <div class="condition-builder-container">
                <div class="conditions-header">
                    <h6>תנאים</h6>
                    <button class="btn btn-sm btn-primary" onclick="conditionBuilder.addCondition()">
                        <i class="fa fa-plus"></i> הוסף תנאי
                    </button>
                </div>
                
                <div class="conditions-list" id="${this.containerId}-list">
                    ${this.generateConditionsList()}
                </div>
                
                <div class="parameter-form" id="${this.containerId}-form" style="display: none;">
                    ${this.generateParameterForm()}
                </div>
            </div>
        `;
    }
    
    generateConditionsList() {
        if (this.conditions.length === 0) {
            return '<div class="no-conditions">אין תנאים מוגדרים</div>';
        }
        
        return this.conditions.map(condition => `
            <div class="condition-item" data-condition-id="${condition.id}">
                <div class="condition-info">
                    <span class="method-name">${condition.method_name}</span>
                    <span class="parameters">${this.formatParameters(condition.parameters_json)}</span>
                </div>
                <div class="condition-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="conditionBuilder.editCondition(${condition.id})">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="conditionBuilder.removeCondition(${condition.id})">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    generateParameterForm() {
        return `
            <div class="parameter-form-container">
                <h6>הגדרת פרמטרים</h6>
                <form id="${this.containerId}-parameter-form">
                    <div class="method-selection">
                        <label for="method-select">שיטת מסחר:</label>
                        <select id="method-select" class="form-select" onchange="conditionBuilder.onMethodChange()">
                            <option value="">בחר שיטה</option>
                            ${this.methods.map(method => `
                                <option value="${method.id}">${method.name_he}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="parameters-container" id="parameters-container">
                        <!-- Parameters will be loaded here -->
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-primary" onclick="conditionBuilder.saveCondition()">
                            שמור תנאי
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="conditionBuilder.cancelEdit()">
                            ביטול
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    onMethodChange() {
        const methodId = document.getElementById('method-select').value;
        if (!methodId) return;
        
        const method = this.methods.find(m => m.id == methodId);
        if (!method) return;
        
        this.renderParameters(method.parameters);
    }
    
    renderParameters(parameters) {
        const container = document.getElementById('parameters-container');
        if (!container) return;
        
        container.innerHTML = parameters.map(param => `
            <div class="parameter-field">
                <label for="param-${param.parameter_key}">${param.parameter_name_he}:</label>
                ${this.generateParameterInput(param)}
                ${param.help_text_he ? `<small class="form-text text-muted">${param.help_text_he}</small>` : ''}
            </div>
        `).join('');
    }
    
    generateParameterInput(param) {
        switch (param.parameter_type) {
            case 'integer':
            case 'float':
                return `
                    <input type="number" 
                           id="param-${param.parameter_key}" 
                           class="form-control"
                           value="${param.default_value || ''}"
                           min="${param.min_value || ''}"
                           max="${param.max_value || ''}"
                           ${param.is_required ? 'required' : ''}>
                `;
            
            case 'boolean':
                return `
                    <select id="param-${param.parameter_key}" class="form-select" ${param.is_required ? 'required' : ''}>
                        <option value="">בחר</option>
                        <option value="true" ${param.default_value === 'true' ? 'selected' : ''}>כן</option>
                        <option value="false" ${param.default_value === 'false' ? 'selected' : ''}>לא</option>
                    </select>
                `;
            
            case 'select':
                // For select type, we would need to define options
                return `
                    <select id="param-${param.parameter_key}" class="form-select" ${param.is_required ? 'required' : ''}>
                        <option value="">בחר אפשרות</option>
                        <!-- Options would be loaded from validation_rule or separate table -->
                    </select>
                `;
            
            default:
                return `
                    <input type="text" 
                           id="param-${param.parameter_key}" 
                           class="form-control"
                           value="${param.default_value || ''}"
                           ${param.is_required ? 'required' : ''}>
                `;
        }
    }
    
    async saveCondition() {
        try {
            const methodId = document.getElementById('method-select').value;
            if (!methodId) {
                this.showError('אנא בחר שיטת מסחר');
                return;
            }
            
            // Collect parameters
            const parameters = {};
            const method = this.methods.find(m => m.id == methodId);
            
            for (const param of method.parameters) {
                const input = document.getElementById(`param-${param.parameter_key}`);
                if (input) {
                    let value = input.value;
                    
                    // Convert value based on type
                    if (param.parameter_type === 'integer') {
                        value = parseInt(value);
                    } else if (param.parameter_type === 'float') {
                        value = parseFloat(value);
                    } else if (param.parameter_type === 'boolean') {
                        value = value === 'true';
                    }
                    
                    parameters[param.parameter_key] = value;
                }
            }
            
            // Validate parameters
            const validation = await this.validateParameters(methodId, parameters);
            if (!validation.valid) {
                this.showError('שגיאות ולידציה: ' + validation.errors.join(', '));
                return;
            }
            
            // Save condition
            const conditionData = {
                method_id: parseInt(methodId),
                condition_group: this.currentGroup,
                parameters_json: JSON.stringify(parameters),
                logical_operator: 'AND'
            };
            
            if (this.entityType === 'plan') {
                conditionData.trade_plan_id = this.entityId;
            } else {
                conditionData.trade_id = this.entityId;
            }
            
            const endpoint = this.entityType === 'plan' 
                ? '/api/plan_conditions'
                : '/api/trade_conditions';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(conditionData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save condition');
            }
            
            const newCondition = await response.json();
            this.conditions.push(newCondition);
            this.render();
            this.hideParameterForm();
            this.showSuccess('תנאי נשמר בהצלחה');
            
        } catch (error) {
            console.error('Error saving condition:', error);
            this.showError('שגיאה בשמירת התנאי');
        }
    }
    
    async validateParameters(methodId, parameters) {
        try {
            const response = await fetch('/api/conditions/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    method_id: methodId,
                    parameters: parameters
                })
            });
            
            if (!response.ok) {
                throw new Error('Validation request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Validation error:', error);
            return { valid: false, errors: ['Validation failed'] };
        }
    }
    
    setupEventListeners() {
        // Event listeners will be set up here
    }
    
    showError(message) {
        // Show error notification
        if (window.showErrorNotification) {
            window.showErrorNotification(message);
        } else {
            alert(message);
        }
    }
    
    showSuccess(message) {
        // Show success notification
        if (window.showSuccessNotification) {
            window.showSuccessNotification(message);
        } else {
            alert(message);
        }
    }
    
    formatParameters(parametersJson) {
        try {
            const params = JSON.parse(parametersJson);
            return Object.entries(params)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
        } catch (error) {
            return 'פרמטרים לא תקינים';
        }
    }
}

// Global instance
window.ConditionBuilder = ConditionBuilder;
```

### 2. ConditionValidator Class

```javascript
class ConditionValidator {
    static validateParameter(method, parameter, value) {
        const errors = [];
        
        // Type validation
        if (parameter.parameter_type === 'integer') {
            if (!Number.isInteger(Number(value))) {
                errors.push(`${parameter.parameter_name_he} חייב להיות מספר שלם`);
            } else {
                const numValue = Number(value);
                if (parameter.min_value && numValue < Number(parameter.min_value)) {
                    errors.push(`${parameter.parameter_name_he} חייב להיות לפחות ${parameter.min_value}`);
                }
                if (parameter.max_value && numValue > Number(parameter.max_value)) {
                    errors.push(`${parameter.parameter_name_he} חייב להיות לכל היותר ${parameter.max_value}`);
                }
            }
        }
        
        if (parameter.parameter_type === 'float') {
            if (isNaN(Number(value))) {
                errors.push(`${parameter.parameter_name_he} חייב להיות מספר`);
            } else {
                const numValue = Number(value);
                if (parameter.min_value && numValue < Number(parameter.min_value)) {
                    errors.push(`${parameter.parameter_name_he} חייב להיות לפחות ${parameter.min_value}`);
                }
                if (parameter.max_value && numValue > Number(parameter.max_value)) {
                    errors.push(`${parameter.parameter_name_he} חייב להיות לכל היותר ${parameter.max_value}`);
                }
            }
        }
        
        if (parameter.parameter_type === 'boolean') {
            if (!['true', 'false', true, false].includes(value)) {
                errors.push(`${parameter.parameter_name_he} חייב להיות כן או לא`);
            }
        }
        
        // Required validation
        if (parameter.is_required && (!value || value === '')) {
            errors.push(`${parameter.parameter_name_he} הוא שדה חובה`);
        }
        
        return errors;
    }
    
    static validateCondition(condition) {
        const errors = [];
        
        if (!condition.method_id) {
            errors.push('שיטת מסחר היא שדה חובה');
        }
        
        if (!condition.parameters_json) {
            errors.push('פרמטרים הם שדה חובה');
        } else {
            try {
                JSON.parse(condition.parameters_json);
            } catch (error) {
                errors.push('פורמט הפרמטרים לא תקין');
            }
        }
        
        return errors;
    }
    
    static validateGroup(conditions) {
        const errors = [];
        
        if (conditions.length === 0) {
            return errors; // Empty group is valid
        }
        
        // Check for logical operators consistency
        const operators = conditions.map(c => c.logical_operator).filter(op => op && op !== 'NONE');
        if (operators.length > 0 && new Set(operators).size > 1) {
            errors.push('כל התנאים בקבוצה חייבים להשתמש באותו אופרטור לוגי');
        }
        
        return errors;
    }
}

// Global instance
window.ConditionValidator = ConditionValidator;
```

---

## Testing

### 1. Unit Tests

#### Backend Tests
```python
import unittest
from unittest.mock import patch, MagicMock
from services.conditions_validation_service import ConditionsValidationService

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

if __name__ == '__main__':
    unittest.main()
```

#### Frontend Tests
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
    
    test('should validate parameters correctly', () => {
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
        
        const parameters = { period: 20 };
        const errors = ConditionValidator.validateParameter(method, method.parameters[0], 20);
        
        expect(errors).toHaveLength(0);
    });
    
    test('should show error for invalid parameter', () => {
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
        
        const parameters = { period: 'not_a_number' };
        const errors = ConditionValidator.validateParameter(method, method.parameters[0], 'not_a_number');
        
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('תקופה');
    });
});
```

### 2. Integration Tests

```python
import unittest
from app import create_app
from config.database import get_db
from models.trading_method import TradingMethod

class TestConditionsAPI(unittest.TestCase):
    
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
    
    def test_validate_condition(self):
        """Test POST /api/conditions/validate"""
        validation_data = {
            'method_id': 1,
            'parameters': {
                'period': 20,
                'type': 'SMA'
            }
        }
        
        response = self.client.post('/api/conditions/validate',
                                  json=validation_data,
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('valid', data)

if __name__ == '__main__':
    unittest.main()
```

---

## Debugging Tips

### 1. Backend Debugging

#### Logging
```python
import logging

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# In your service methods
def validate_condition(self, condition_data):
    logger.debug(f"Validating condition: {condition_data}")
    
    try:
        # Validation logic
        result = self._validate(condition_data)
        logger.debug(f"Validation result: {result}")
        return result
    except Exception as e:
        logger.error(f"Validation error: {str(e)}", exc_info=True)
        raise
```

#### Database Queries
```python
# Enable SQL logging
import logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Or use echo=True in engine creation
engine = create_engine(DATABASE_URL, echo=True)
```

### 2. Frontend Debugging

#### Console Logging
```javascript
class ConditionBuilder {
    constructor(entityType, entityId, containerId) {
        this.debug = true; // Enable debug mode
        
        if (this.debug) {
            console.log('ConditionBuilder initialized:', {
                entityType,
                entityId,
                containerId
            });
        }
    }
    
    async loadMethods() {
        if (this.debug) {
            console.log('Loading methods...');
        }
        
        try {
            const response = await fetch('/api/trading_methods');
            const methods = await response.json();
            
            if (this.debug) {
                console.log('Methods loaded:', methods);
            }
            
            this.methods = methods;
        } catch (error) {
            if (this.debug) {
                console.error('Error loading methods:', error);
            }
            throw error;
        }
    }
}
```

#### Error Handling
```javascript
// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Send to error tracking service
    if (window.errorTracker) {
        window.errorTracker.captureException(event.error);
    }
});

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Send to error tracking service
    if (window.errorTracker) {
        window.errorTracker.captureException(event.reason);
    }
});
```

---

## Performance Optimization

### 1. Backend Optimization

#### Database Indexing
```sql
-- Add indexes for better performance
CREATE INDEX idx_plan_conditions_plan_id ON plan_conditions(trade_plan_id);
CREATE INDEX idx_plan_conditions_method_id ON plan_conditions(method_id);
CREATE INDEX idx_plan_conditions_active ON plan_conditions(is_active);

CREATE INDEX idx_trade_conditions_trade_id ON trade_conditions(trade_id);
CREATE INDEX idx_trade_conditions_method_id ON trade_conditions(method_id);
CREATE INDEX idx_trade_conditions_active ON trade_conditions(is_active);
```

#### Caching
```python
from functools import lru_cache

class ConditionsValidationService:
    
    @lru_cache(maxsize=128)
    def get_method_parameters(self, method_id):
        """Cache method parameters for better performance"""
        db = get_db()
        try:
            return db.query(MethodParameter).filter(
                MethodParameter.method_id == method_id
            ).all()
        finally:
            db.close()
```

### 2. Frontend Optimization

#### Lazy Loading
```javascript
class ConditionBuilder {
    async loadMethods() {
        if (this.methods.length > 0) {
            return this.methods; // Return cached methods
        }
        
        // Load methods only when needed
        const response = await fetch('/api/trading_methods');
        this.methods = await response.json();
        return this.methods;
    }
}
```

#### Debouncing
```javascript
// Debounce validation to avoid excessive API calls
const debouncedValidation = debounce(async (condition) => {
    const result = await this.validateCondition(condition);
    this.updateValidationUI(result);
}, 300);

// Usage
input.addEventListener('input', (event) => {
    debouncedValidation(event.target.value);
});
```

---

## קישורים נוספים

- [תיעוד API](./CONDITIONS_SYSTEM_API_DOCUMENTATION.md)
- [ארכיטקטורה](./CONDITIONS_SYSTEM_ARCHITECTURE.md)
- [מדריך משתמש](./CONDITIONS_SYSTEM_USER_GUIDE.md)
- [מדריך בדיקות](./CONDITIONS_SYSTEM_TESTING_GUIDE.md)
