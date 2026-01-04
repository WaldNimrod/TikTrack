# CRUD Backend Implementation Guide - TikTrack

## ⚠️ מדריך קריטי - קרא לפני יישום

**מסמך זה הוא חובה לכל מי שמיישם CRUD בשרת TikTrack.** הוא מכיל את הכללים, הטעויות הנפוצות וה-best practices ליישום אחיד ויציב.

## עקרונות יסוד

### 1. API Design Principles

- **RESTful URLs:** `/api/{entity}/` for collections, `/api/{entity}/{id}` for specific items
- **HTTP Methods:** GET (read), POST (create), PUT (update), DELETE (delete)
- **Consistent Response Format:** Always return `{ success: boolean, data: object, error: string }`
- **Plural Nouns:** Use plural entity names (`trades`, `executions`, not `trade`, `execution`)

### 2. Authentication & Authorization

```python
# Always check authentication first
@app.route('/api/trades/', methods=['POST'])
@login_required
def create_trade():
    # Authorization check
    if not current_user.has_permission('trade.create'):
        return jsonify({'success': False, 'error': 'Permission denied'}), 403
```

### 3. Data Validation

```python
# Use Marshmallow schemas for validation
class TradeSchema(Schema):
    symbol = fields.Str(required=True, validate=validate_symbol)
    quantity = fields.Integer(required=True, validate=validate_positive)
    price = fields.Float(required=True, validate=validate_positive)

# Validate before processing
schema = TradeSchema()
validated_data = schema.load(request.json)
```

## טעויות נפוצות - הימנע

### ❌ Wrong: Direct Database Access

```python
# DON'T DO THIS
@app.route('/api/trades/<id>', methods=['DELETE'])
def delete_trade(id):
    db.session.delete(Trade.query.get(id))  # No validation, no logging
    db.session.commit()
    return jsonify({'success': True})
```

### ✅ Correct: Service Layer Pattern

```python
# DO THIS INSTEAD
@app.route('/api/trades/<int:id>', methods=['DELETE'])
@login_required
def delete_trade(id):
    try:
        result = TradeService.delete_trade(current_user.id, id)
        if result['success']:
            Logger.info(f'Trade {id} deleted by user {current_user.id}')
            return jsonify(result)
        else:
            return jsonify(result), 400
    except Exception as e:
        Logger.error(f'Error deleting trade {id}: {str(e)}')
        return jsonify({'success': False, 'error': 'Internal server error'}), 500
```

## מבנה יישום CRUD

### 1. Route Definition

```python
# Use blueprints for organization
trade_bp = Blueprint('trade', __name__, url_prefix='/api/trades')

@trade_bp.route('/', methods=['GET'])
@login_required
def list_trades():
    # Implementation

@trade_bp.route('/', methods=['POST'])
@login_required
def create_trade():
    # Implementation

@trade_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_trade(id):
    # Implementation

@trade_bp.route('/<int:id>', methods=['PUT'])
@login_required
def update_trade(id):
    # Implementation

@trade_bp.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_trade(id):
    # Implementation
```

### 2. Service Layer

```python
class TradeService:
    @staticmethod
    def create_trade(user_id, trade_data):
        try:
            # Validation
            validated_data = TradeSchema().load(trade_data)

            # Business logic
            trade = Trade(
                user_id=user_id,
                symbol=validated_data['symbol'],
                quantity=validated_data['quantity'],
                price=validated_data['price']
            )

            # Database operation
            db.session.add(trade)

            # Handle relationships (IMPORTANT!)
            if 'executions' in validated_data:
                for exec_data in validated_data['executions']:
                    execution = Execution(trade_id=trade.id, **exec_data)
                    db.session.add(execution)

            db.session.commit()

            return {
                'success': True,
                'data': trade.to_dict(),
                'message': 'Trade created successfully'
            }

        except ValidationError as e:
            return {'success': False, 'error': str(e)}
        except Exception as e:
            db.session.rollback()
            Logger.error(f'Error creating trade: {str(e)}')
            return {'success': False, 'error': 'Failed to create trade'}

    @staticmethod
    def update_trade(user_id, trade_id, update_data):
        # Similar pattern with ownership validation
        pass
```

### 3. Model Relationships

```python
class Trade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Important: Index for performance
    __table_args__ = (
        db.Index('idx_trade_user_symbol', 'user_id', 'symbol'),
    )

    # Relationships with proper backrefs
    executions = db.relationship('Execution', backref='trade', lazy='select')

    def to_dict(self):
        return {
            'id': self.id,
            'symbol': self.symbol,
            'quantity': self.quantity,
            # Include relationships carefully (avoid circular refs)
            'executions_count': len(self.executions) if self.executions else 0
        }
```

## טיפול ב-relationships

### One-to-Many Relationships

```python
# Trade -> Executions (One trade, many executions)
class Trade(db.Model):
    executions = db.relationship('Execution', backref='trade', lazy='select')

class Execution(db.Model):
    trade_id = db.Column(db.Integer, db.ForeignKey('trade.id'), nullable=False)
```

### Many-to-One Relationships

```python
# Executions -> Trade (Many executions, one trade)
class Execution(db.Model):
    trade_id = db.Column(db.Integer, db.ForeignKey('trade.id'), nullable=False)
    trade = db.relationship('Trade', backref='executions', lazy='select')
```

### Handling Updates with Relationships

```python
def update_trade_with_executions(trade_id, data):
    trade = Trade.query.get_or_404(trade_id)

    # Update trade fields
    for key, value in data.items():
        if key != 'executions' and hasattr(trade, key):
            setattr(trade, key, value)

    # Handle executions separately
    if 'executions' in data:
        # Remove existing executions
        Execution.query.filter_by(trade_id=trade_id).delete()

        # Add new executions
        for exec_data in data['executions']:
            execution = Execution(trade_id=trade_id, **exec_data)
            db.session.add(execution)

    db.session.commit()
```

## טיפול בשגיאות

### Database Errors

```python
try:
    db.session.commit()
except IntegrityError as e:
    db.session.rollback()
    if 'unique constraint' in str(e):
        return {'success': False, 'error': 'Duplicate entry'}
    elif 'foreign key constraint' in str(e):
        return {'success': False, 'error': 'Related record not found'}
    else:
        return {'success': False, 'error': 'Database constraint violation'}
except Exception as e:
    db.session.rollback()
    Logger.error(f'Database error: {str(e)}')
    return {'success': False, 'error': 'Database operation failed'}
```

### Validation Errors

```python
from marshmallow import ValidationError

try:
    validated_data = schema.load(request.json)
except ValidationError as e:
    return {'success': False, 'error': 'Validation failed', 'details': e.messages}, 400
```

## בדיקות ואיכות

### Required Tests for Each CRUD Endpoint

- ✅ Authentication required
- ✅ Authorization check
- ✅ Input validation
- ✅ Business logic validation
- ✅ Database constraints
- ✅ Relationships handling
- ✅ Error responses
- ✅ Success responses

### Test Example

```python
def test_create_trade_success(client, auth_headers):
    data = {
        'symbol': 'AAPL',
        'quantity': 100,
        'price': 150.50
    }
    response = client.post('/api/trades/', json=data, headers=auth_headers)
    assert response.status_code == 201
    assert response.json['success'] == True
    assert 'id' in response.json['data']
```

## ביצועים ואופטימיזציה

### Database Indexes

```python
# Always add indexes for foreign keys and commonly queried fields
__table_args__ = (
    db.Index('idx_trade_user_symbol', 'user_id', 'symbol'),
    db.Index('idx_trade_created_at', 'created_at'),
)
```

### Query Optimization

```python
# Use selectinload for relationships when needed
trades = Trade.query.options(db.selectinload(Trade.executions)).all()

# Use pagination for large datasets
trades = Trade.query.paginate(page=page, per_page=50)
```

### Caching Strategy

```python
# Cache expensive queries
@cache.memoize(timeout=300)
def get_user_trades_summary(user_id):
    # Complex aggregation query
    pass
```

## תחזוקה

### Code Organization

```
backend/
├── routes/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── trades.py
│   │   └── executions.py
├── services/
│   ├── __init__.py
│   ├── trade_service.py
│   └── execution_service.py
├── models/
│   ├── __init__.py
│   ├── trade.py
│   └── execution.py
└── schemas/
    ├── __init__.py
    ├── trade_schema.py
    └── execution_schema.py
```

### Documentation Requirements

- ✅ API endpoint documentation
- ✅ Request/response examples
- ✅ Error codes and meanings
- ✅ Authentication requirements
- ✅ Rate limiting if applicable
- ✅ Version compatibility

---

**גרסה:** 1.0.0
**תאריך:** 1 בינואר 2026
**סטטוס:** ⚠️ **קריטי - חובה לקריאה**
