# Dynamic Constraints System Documentation - TikTrack

## 📋 Overview

This document describes the comprehensive dynamic constraints system implemented in TikTrack, providing real-time database constraint management with validation and display capabilities.

## 🎯 System Features

### ✅ **Core Features**
- **Dynamic Constraint Tables**: `constraints`, `enum_values`, `constraint_validations`
- **Constraint Management Interface**: Full UI for constraint management
- **Complete API**: All CRUD operations for constraints
- **90 Predefined Constraints**: For all system tables
- **Dynamic Validation**: `ValidationService` working in real-time

### 🔧 **Technical Features**
- **Real-time Display**: Constraints shown with color coding
- **Validation Integration**: Works with all Services
- **Error Handling**: Clear user messages
- **Detailed Logging**: Track validation processes
- **Full Integration**: All API routes use ValidationService

## 🏗️ Architecture

### Database Tables

#### `constraints` Table
```sql
CREATE TABLE constraints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    column_name TEXT NOT NULL,
    constraint_type TEXT NOT NULL,
    constraint_value TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `enum_values` Table
```sql
CREATE TABLE enum_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    constraint_id INTEGER,
    enum_value TEXT NOT NULL,
    display_name TEXT,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (constraint_id) REFERENCES constraints(id)
);
```

#### `constraint_validations` Table
```sql
CREATE TABLE constraint_validations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    constraint_id INTEGER,
    validation_rule TEXT NOT NULL,
    error_message TEXT,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (constraint_id) REFERENCES constraints(id)
);
```

### Backend Implementation

#### ValidationService
```python
class ValidationService:
    """Dynamic validation service for database constraints"""
    
    def __init__(self, db_session):
        self.db_session = db_session
        self.constraints_cache = {}
    
    def validate_field(self, table_name, column_name, value):
        """Validate a field against its constraints"""
        constraints = self.get_constraints(table_name, column_name)
        
        for constraint in constraints:
            if not self.validate_constraint(constraint, value):
                return False, constraint.error_message
        
        return True, None
    
    def get_constraints(self, table_name, column_name):
        """Get constraints for a specific field"""
        cache_key = f"{table_name}.{column_name}"
        
        if cache_key not in self.constraints_cache:
            constraints = self.db_session.query(Constraint).filter(
                Constraint.table_name == table_name,
                Constraint.column_name == column_name,
                Constraint.is_active == True
            ).all()
            self.constraints_cache[cache_key] = constraints
        
        return self.constraints_cache[cache_key]
```

#### Constraint Models
```python
class Constraint(BaseModel):
    """Database constraint model"""
    __tablename__ = "constraints"
    
    id = Column(Integer, primary_key=True)
    table_name = Column(String(50), nullable=False)
    column_name = Column(String(50), nullable=False)
    constraint_type = Column(String(20), nullable=False)
    constraint_value = Column(Text)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    enum_values = relationship("EnumValue", back_populates="constraint")
    validations = relationship("ConstraintValidation", back_populates="constraint")

class EnumValue(BaseModel):
    """Enum value model for constraints"""
    __tablename__ = "enum_values"
    
    id = Column(Integer, primary_key=True)
    constraint_id = Column(Integer, ForeignKey('constraints.id'))
    enum_value = Column(String(100), nullable=False)
    display_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    
    # Relationships
    constraint = relationship("Constraint", back_populates="enum_values")

class ConstraintValidation(BaseModel):
    """Constraint validation rule model"""
    __tablename__ = "constraint_validations"
    
    id = Column(Integer, primary_key=True)
    constraint_id = Column(Integer, ForeignKey('constraints.id'))
    validation_rule = Column(String(200), nullable=False)
    error_message = Column(Text)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    constraint = relationship("Constraint", back_populates="validations")
```

## 🔧 API Implementation

### Constraint Management API

#### GET /api/constraints
```python
@constraints_bp.route('/constraints', methods=['GET'])
def get_constraints():
    """Get all constraints"""
    try:
        constraints = ConstraintService.get_all_constraints()
        return jsonify({
            'success': True,
            'data': constraints
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
```

#### POST /api/constraints
```python
@constraints_bp.route('/constraints', methods=['POST'])
def create_constraint():
    """Create a new constraint"""
    try:
        data = request.get_json()
        constraint = ConstraintService.create_constraint(data)
        return jsonify({
            'success': True,
            'data': constraint
        }), 201
    except ValidationError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
```

#### PUT /api/constraints/<int:constraint_id>
```python
@constraints_bp.route('/constraints/<int:constraint_id>', methods=['PUT'])
def update_constraint(constraint_id):
    """Update an existing constraint"""
    try:
        data = request.get_json()
        constraint = ConstraintService.update_constraint(constraint_id, data)
        return jsonify({
            'success': True,
            'data': constraint
        }), 200
    except ValidationError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
```

#### DELETE /api/constraints/<int:constraint_id>
```python
@constraints_bp.route('/constraints/<int:constraint_id>', methods=['DELETE'])
def delete_constraint(constraint_id):
    """Delete a constraint"""
    try:
        ConstraintService.delete_constraint(constraint_id)
        return jsonify({
            'success': True,
            'message': 'Constraint deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
```

## 🎨 Frontend Implementation

### Constraint Management Interface

#### Constraint Display Component
```javascript
// Display constraints in table
function displayConstraints(constraints) {
    const tbody = document.getElementById('constraints-tbody');
    tbody.innerHTML = '';
    
    constraints.forEach(constraint => {
        const row = createConstraintRow(constraint);
        tbody.appendChild(row);
    });
}

// Create constraint table row
function createConstraintRow(constraint) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${constraint.table_name}</td>
        <td>${constraint.column_name}</td>
        <td>${constraint.constraint_type}</td>
        <td>${constraint.constraint_value || '-'}</td>
        <td>${constraint.description || '-'}</td>
        <td>
            <span class="badge ${constraint.is_active ? 'badge-success' : 'badge-secondary'}">
                ${constraint.is_active ? 'Active' : 'Inactive'}
            </span>
        </td>
        <td>
            <button class="btn btn-sm btn-primary" onclick="editConstraint(${constraint.id})">
                Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteConstraint(${constraint.id})">
                Delete
            </button>
        </td>
    `;
    return row;
}
```

#### Constraint Form Component
```javascript
// Constraint form handling
function handleConstraintSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const constraintData = {
        table_name: formData.get('table_name'),
        column_name: formData.get('column_name'),
        constraint_type: formData.get('constraint_type'),
        constraint_value: formData.get('constraint_value'),
        description: formData.get('description'),
        is_active: formData.get('is_active') === 'on'
    };
    
    if (currentConstraintId) {
        updateConstraint(currentConstraintId, constraintData);
    } else {
        createConstraint(constraintData);
    }
}
```

## 📊 Predefined Constraints

### System Tables Constraints

#### Accounts Table
```sql
-- Account name constraints
INSERT INTO constraints (table_name, column_name, constraint_type, constraint_value, description) VALUES
('accounts', 'name', 'max_length', '50', 'Account name maximum 50 characters'),
('accounts', 'name', 'required', 'true', 'Account name is required'),
('accounts', 'type', 'enum', 'checking,savings,investment', 'Account type must be valid');

-- Account type enum values
INSERT INTO enum_values (constraint_id, enum_value, display_name) VALUES
(1, 'checking', 'Checking Account'),
(1, 'savings', 'Savings Account'),
(1, 'investment', 'Investment Account');
```

#### Trades Table
```sql
-- Trade constraints
INSERT INTO constraints (table_name, column_name, constraint_type, constraint_value, description) VALUES
('trades', 'investment_type', 'enum', 'buy,sell,dividend', 'Trade type must be valid'),
('trades', 'amount', 'min_value', '0', 'Trade amount must be positive'),
('trades', 'date', 'required', 'true', 'Trade date is required');
```

#### Alerts Table
```sql
-- Alert constraints
INSERT INTO constraints (table_name, column_name, constraint_type, constraint_value, description) VALUES
('alerts', 'condition_type', 'enum', 'price,volume,time', 'Alert condition type must be valid'),
('alerts', 'threshold_value', 'required', 'true', 'Alert threshold is required'),
('alerts', 'is_active', 'boolean', 'true', 'Alert active status');
```

## 🚀 Integration Examples

### Service Integration
```python
# Trade service with validation
class TradeService:
    def __init__(self, db_session):
        self.db_session = db_session
        self.validation_service = ValidationService(db_session)
    
    def create_trade(self, trade_data):
        """Create trade with validation"""
        # Validate required fields
        for field, value in trade_data.items():
            is_valid, error_message = self.validation_service.validate_field(
                'trades', field, value
            )
            if not is_valid:
                raise ValidationError(f"Field {field}: {error_message}")
        
        # Create trade if validation passes
        trade = Trade(**trade_data)
        self.db_session.add(trade)
        self.db_session.commit()
        return trade
```

### Frontend Integration
```javascript
// Form validation with constraints
async function validateForm(formData) {
    const constraints = await fetchConstraints();
    const errors = [];
    
    for (const [field, value] of formData.entries()) {
        const fieldConstraints = constraints.filter(c => 
            c.table_name === currentTable && c.column_name === field
        );
        
        for (const constraint of fieldConstraints) {
            if (!validateConstraint(constraint, value)) {
                errors.push(constraint.error_message || `Invalid ${field}`);
            }
        }
    }
    
    return errors;
}
```

## 🧪 Testing

### Constraint Testing
```python
def test_constraint_validation():
    """Test constraint validation"""
    validation_service = ValidationService(db_session)
    
    # Test required field
    is_valid, error = validation_service.validate_field('accounts', 'name', '')
    assert not is_valid
    assert 'required' in error.lower()
    
    # Test enum field
    is_valid, error = validation_service.validate_field('accounts', 'type', 'invalid_type')
    assert not is_valid
    assert 'enum' in error.lower()
    
    # Test valid field
    is_valid, error = validation_service.validate_field('accounts', 'name', 'Test Account')
    assert is_valid
    assert error is None
```

## 🔧 Troubleshooting

### Common Issues

#### Constraints Not Loading
1. Check database connection
2. Verify constraint tables exist
3. Check constraint service initialization
4. Verify API endpoints are working

#### Validation Not Working
1. Check ValidationService initialization
2. Verify constraint cache is populated
3. Check constraint rules are correct
4. Verify error messages are set

#### Performance Issues
1. Check constraint cache implementation
2. Verify database queries are optimized
3. Check for unnecessary validation calls
4. Monitor database performance

## 📚 Related Documentation

- [Database Schema](SCHEMA.md)
- [API Documentation](../api/README.md)
- [Validation System](../backend/VALIDATION_SYSTEM.md)
- [Frontend Integration](../frontend/README.md)

---

**Last Updated**: August 26, 2025  
**Version**: 2.8.0  
**Maintained By**: TikTrack Development Team
