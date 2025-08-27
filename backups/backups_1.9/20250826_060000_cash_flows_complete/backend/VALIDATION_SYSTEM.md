# Dynamic Validation System Documentation - TikTrack

## 📋 Overview

This document describes the comprehensive dynamic validation system implemented in TikTrack, providing real-time validation capabilities that integrate with the database constraints system and all backend services.

## 🎯 System Features

### ✅ **Core Features**
- **Dynamic Validation**: Real-time validation based on database constraints
- **Service Integration**: Works with all backend services
- **Error Handling**: Clear and user-friendly error messages
- **Performance Optimized**: Cached validation rules for efficiency
- **Full API Coverage**: All API routes use ValidationService

### 🔧 **Technical Features**
- **Constraint-Based Validation**: Uses dynamic constraints from database
- **Type Validation**: Supports multiple data types
- **Custom Rules**: Extensible validation rule system
- **Logging**: Comprehensive validation logging
- **Caching**: Efficient constraint caching

## 🏗️ Architecture

### Core Components

#### ValidationService
```python
class ValidationService:
    """Dynamic validation service for database constraints"""
    
    def __init__(self, db_session):
        self.db_session = db_session
        self.constraints_cache = {}
        self.validation_cache = {}
    
    def validate_entity(self, table_name, data):
        """Validate entire entity against all constraints"""
        errors = {}
        
        for field, value in data.items():
            is_valid, error_message = self.validate_field(table_name, field, value)
            if not is_valid:
                errors[field] = error_message
        
        return len(errors) == 0, errors
    
    def validate_field(self, table_name, column_name, value):
        """Validate a single field against its constraints"""
        constraints = self.get_constraints(table_name, column_name)
        
        for constraint in constraints:
            if not self.validate_constraint(constraint, value):
                return False, constraint.error_message or f"Invalid {column_name}"
        
        return True, None
    
    def get_constraints(self, table_name, column_name):
        """Get constraints for a specific field with caching"""
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

#### Validation Rules
```python
class ValidationRules:
    """Collection of validation rule implementations"""
    
    @staticmethod
    def validate_required(value):
        """Validate required field"""
        return value is not None and str(value).strip() != ''
    
    @staticmethod
    def validate_max_length(value, max_length):
        """Validate maximum length"""
        if value is None:
            return True
        return len(str(value)) <= int(max_length)
    
    @staticmethod
    def validate_min_length(value, min_length):
        """Validate minimum length"""
        if value is None:
            return True
        return len(str(value)) >= int(min_length)
    
    @staticmethod
    def validate_enum(value, allowed_values):
        """Validate enum values"""
        if value is None:
            return True
        return str(value) in allowed_values.split(',')
    
    @staticmethod
    def validate_numeric_range(value, min_val=None, max_val=None):
        """Validate numeric range"""
        if value is None:
            return True
        
        try:
            num_value = float(value)
            if min_val is not None and num_value < float(min_val):
                return False
            if max_val is not None and num_value > float(max_val):
                return False
            return True
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def validate_email(value):
        """Validate email format"""
        if value is None:
            return True
        
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(email_pattern, str(value)) is not None
    
    @staticmethod
    def validate_date_format(value, format='%Y-%m-%d'):
        """Validate date format"""
        if value is None:
            return True
        
        try:
            from datetime import datetime
            datetime.strptime(str(value), format)
            return True
        except ValueError:
            return False
```

## 🔧 Implementation Examples

### Service Integration

#### Trade Service
```python
class TradeService:
    def __init__(self, db_session):
        self.db_session = db_session
        self.validation_service = ValidationService(db_session)
    
    def create_trade(self, trade_data):
        """Create trade with comprehensive validation"""
        # Validate all fields
        is_valid, errors = self.validation_service.validate_entity('trades', trade_data)
        
        if not is_valid:
            raise ValidationError(f"Validation failed: {errors}")
        
        # Additional business logic validation
        if trade_data.get('amount', 0) <= 0:
            raise ValidationError("Trade amount must be positive")
        
        # Create trade if validation passes
        trade = Trade(**trade_data)
        self.db_session.add(trade)
        self.db_session.commit()
        return trade
    
    def update_trade(self, trade_id, trade_data):
        """Update trade with validation"""
        # Get existing trade
        trade = self.db_session.query(Trade).filter(Trade.id == trade_id).first()
        if not trade:
            raise NotFoundError("Trade not found")
        
        # Validate update data
        is_valid, errors = self.validation_service.validate_entity('trades', trade_data)
        
        if not is_valid:
            raise ValidationError(f"Validation failed: {errors}")
        
        # Update trade
        for field, value in trade_data.items():
            setattr(trade, field, value)
        
        self.db_session.commit()
        return trade
```

#### Account Service
```python
class AccountService:
    def __init__(self, db_session):
        self.db_session = db_session
        self.validation_service = ValidationService(db_session)
    
    def create_account(self, account_data):
        """Create account with validation"""
        # Validate account data
        is_valid, errors = self.validation_service.validate_entity('accounts', account_data)
        
        if not is_valid:
            raise ValidationError(f"Validation failed: {errors}")
        
        # Check for duplicate account names
        existing_account = self.db_session.query(Account).filter(
            Account.name == account_data['name']
        ).first()
        
        if existing_account:
            raise ValidationError("Account name already exists")
        
        # Create account
        account = Account(**account_data)
        self.db_session.add(account)
        self.db_session.commit()
        return account
```

### API Route Integration

#### RESTful API Routes
```python
@trades_bp.route('/trades', methods=['POST'])
def create_trade():
    """Create new trade with validation"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['account_id', 'ticker_id', 'investment_type', 'amount', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f"Missing required field: {field}"
                }), 400
        
        # Create trade with validation
        trade = TradeService(db_session).create_trade(data)
        
        return jsonify({
            'success': True,
            'data': trade.to_dict()
        }), 201
        
    except ValidationError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Internal server error: {str(e)}"
        }), 500

@trades_bp.route('/trades/<int:trade_id>', methods=['PUT'])
def update_trade(trade_id):
    """Update trade with validation"""
    try:
        data = request.get_json()
        
        # Update trade with validation
        trade = TradeService(db_session).update_trade(trade_id, data)
        
        return jsonify({
            'success': True,
            'data': trade.to_dict()
        }), 200
        
    except ValidationError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except NotFoundError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Internal server error: {str(e)}"
        }), 500
```

## 📊 Validation Rules Configuration

### Constraint Types

#### Required Fields
```sql
INSERT INTO constraints (table_name, column_name, constraint_type, constraint_value, description) VALUES
('trades', 'account_id', 'required', 'true', 'Account ID is required'),
('trades', 'ticker_id', 'required', 'true', 'Ticker ID is required'),
('trades', 'investment_type', 'required', 'true', 'Investment type is required');
```

#### Length Constraints
```sql
INSERT INTO constraints (table_name, column_name, constraint_type, constraint_value, description) VALUES
('accounts', 'name', 'max_length', '50', 'Account name maximum 50 characters'),
('tickers', 'symbol', 'max_length', '10', 'Ticker symbol maximum 10 characters'),
('notes', 'content', 'min_length', '1', 'Note content cannot be empty');
```

#### Enum Constraints
```sql
INSERT INTO constraints (table_name, column_name, constraint_type, constraint_value, description) VALUES
('trades', 'investment_type', 'enum', 'buy,sell,dividend', 'Valid investment types'),
('accounts', 'type', 'enum', 'checking,savings,investment', 'Valid account types'),
('alerts', 'condition_type', 'enum', 'price,volume,time', 'Valid alert condition types');
```

#### Numeric Constraints
```sql
INSERT INTO constraints (table_name, column_name, constraint_type, constraint_value, description) VALUES
('trades', 'amount', 'min_value', '0', 'Trade amount must be positive'),
('trades', 'price', 'min_value', '0', 'Trade price must be positive'),
('alerts', 'threshold_value', 'min_value', '0', 'Alert threshold must be positive');
```

## 🚀 Performance Optimization

### Caching Strategy
```python
class ValidationCache:
    """Validation result caching for performance"""
    
    def __init__(self):
        self.cache = {}
        self.max_size = 1000
    
    def get_cached_validation(self, cache_key):
        """Get cached validation result"""
        return self.cache.get(cache_key)
    
    def cache_validation(self, cache_key, result):
        """Cache validation result"""
        if len(self.cache) >= self.max_size:
            # Remove oldest entries
            oldest_keys = list(self.cache.keys())[:100]
            for key in oldest_keys:
                del self.cache[key]
        
        self.cache[cache_key] = result
    
    def clear_cache(self):
        """Clear validation cache"""
        self.cache.clear()
```

### Optimized Validation
```python
def validate_with_caching(self, table_name, data):
    """Validate with caching for performance"""
    cache_key = f"{table_name}:{hash(str(sorted(data.items())))}"
    
    # Check cache first
    cached_result = self.validation_cache.get_cached_validation(cache_key)
    if cached_result is not None:
        return cached_result
    
    # Perform validation
    result = self.validate_entity(table_name, data)
    
    # Cache result
    self.validation_cache.cache_validation(cache_key, result)
    
    return result
```

## 🧪 Testing

### Validation Testing
```python
def test_validation_service():
    """Test validation service functionality"""
    validation_service = ValidationService(db_session)
    
    # Test required field validation
    data = {'name': '', 'type': 'checking'}
    is_valid, errors = validation_service.validate_entity('accounts', data)
    assert not is_valid
    assert 'name' in errors
    
    # Test enum validation
    data = {'name': 'Test Account', 'type': 'invalid_type'}
    is_valid, errors = validation_service.validate_entity('accounts', data)
    assert not is_valid
    assert 'type' in errors
    
    # Test valid data
    data = {'name': 'Test Account', 'type': 'checking'}
    is_valid, errors = validation_service.validate_entity('accounts', data)
    assert is_valid
    assert len(errors) == 0

def test_validation_rules():
    """Test individual validation rules"""
    # Test required validation
    assert ValidationRules.validate_required('test') == True
    assert ValidationRules.validate_required('') == False
    assert ValidationRules.validate_required(None) == False
    
    # Test max length validation
    assert ValidationRules.validate_max_length('test', 10) == True
    assert ValidationRules.validate_max_length('very long string', 5) == False
    
    # Test enum validation
    assert ValidationRules.validate_enum('buy', 'buy,sell,dividend') == True
    assert ValidationRules.validate_enum('invalid', 'buy,sell,dividend') == False
```

## 🔧 Error Handling

### Custom Exceptions
```python
class ValidationError(Exception):
    """Custom validation error with detailed information"""
    
    def __init__(self, message, errors=None):
        super().__init__(message)
        self.message = message
        self.errors = errors or {}
    
    def to_dict(self):
        """Convert to dictionary for API response"""
        return {
            'error': 'ValidationError',
            'message': self.message,
            'errors': self.errors
        }

class NotFoundError(Exception):
    """Resource not found error"""
    pass

class BusinessLogicError(Exception):
    """Business logic validation error"""
    pass
```

### Error Response Format
```python
def handle_validation_error(error):
    """Handle validation errors in API responses"""
    if isinstance(error, ValidationError):
        return jsonify({
            'success': False,
            'error': 'ValidationError',
            'message': error.message,
            'errors': error.errors
        }), 400
    else:
        return jsonify({
            'success': False,
            'error': 'InternalError',
            'message': str(error)
        }), 500
```

## 📚 Related Documentation

- [Dynamic Constraints System](../database/CONSTRAINTS_IMPLEMENTATION.md)
- [API Documentation](../api/README.md)
- [Database Schema](../database/SCHEMA.md)
- [Service Layer](../services/README.md)

---

**Last Updated**: August 26, 2025  
**Version**: 2.8.0  
**Maintained By**: TikTrack Development Team
