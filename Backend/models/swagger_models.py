"""
Swagger Data Models for API Documentation
"""
from flask_restx import fields

def create_swagger_models(api):
    """Create Swagger data models for API documentation"""
    
    # Common response models
    success_response = api.model('SuccessResponse', {
        'status': fields.String(required=True, example='success'),
        'data': fields.Raw(required=True),
        'message': fields.String(example='Operation completed successfully'),
        'timestamp': fields.String(example='2025-01-15T10:30:00Z'),
        'version': fields.String(example='v1')
    })
    
    error_response = api.model('ErrorResponse', {
        'status': fields.String(required=True, example='error'),
        'error': fields.Nested(api.model('Error', {
            'code': fields.String(example='VALIDATION_ERROR'),
            'message': fields.String(example='Invalid input data'),
            'details': fields.Raw(example={'field': 'symbol', 'issue': 'Symbol is required'})
        })),
        'timestamp': fields.String(example='2025-01-15T10:30:00Z'),
        'version': fields.String(example='v1')
    })
    
    # Auth models
    login_request = api.model('LoginRequest', {
        'username': fields.String(required=True, example='admin'),
        'password': fields.String(required=True, example='admin123')
    })
    
    login_response = api.model('LoginResponse', {
        'status': fields.String(required=True, example='success'),
        'data': fields.Nested(api.model('LoginData', {
            'token': fields.String(example='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'),
            'user': fields.Nested(api.model('User', {
                'id': fields.Integer(example=1),
                'username': fields.String(example='admin'),
                'email': fields.String(example='admin@tiktrack.com'),
                'role': fields.String(example='admin')
            }))
        })),
        'message': fields.String(example='Login successful'),
        'timestamp': fields.String(example='2025-01-15T10:30:00Z'),
        'version': fields.String(example='v1')
    })
    
    # Ticker models
    ticker_model = api.model('Ticker', {
        'id': fields.Integer(example=1),
        'symbol': fields.String(required=True, example='AAPL'),
        'name': fields.String(example='Apple Inc.'),
        'type': fields.String(example='stock'),
        'remarks': fields.String(example='Technology company'),
        'currency': fields.String(example='USD'),
        'active_trades': fields.Boolean(example=False),
        'created_at': fields.String(example='2025-01-15T10:30:00Z')
    })
    
    ticker_create = api.model('TickerCreate', {
        'symbol': fields.String(required=True, example='AAPL'),
        'name': fields.String(example='Apple Inc.'),
        'type': fields.String(example='stock'),
        'remarks': fields.String(example='Technology company'),
        'currency': fields.String(example='USD')
    })
    
    # Account models
    account_model = api.model('Account', {
        'id': fields.Integer(example=1),
        'name': fields.String(required=True, example='Main Account'),
        'currency': fields.String(example='USD'),
        'status': fields.String(example='open'),
        'cash_balance': fields.Float(example=10000.0),
        'total_value': fields.Float(example=15000.0),
        'total_pl': fields.Float(example=5000.0),
        'notes': fields.String(example='Primary trading account'),
        'created_at': fields.String(example='2025-01-15T10:30:00Z')
    })
    
    account_create = api.model('AccountCreate', {
        'name': fields.String(required=True, example='Main Account'),
        'currency': fields.String(example='USD'),
        'status': fields.String(example='open'),
        'cash_balance': fields.Float(example=10000.0),
        'notes': fields.String(example='Primary trading account')
    })
    
    # Trade models
    trade_model = api.model('Trade', {
        'id': fields.Integer(example=1),
        'ticker_id': fields.Integer(example=1),
        'account_id': fields.Integer(example=1),
        'type': fields.String(example='buy'),
        'quantity': fields.Float(example=100.0),
        'price': fields.Float(example=150.0),
        'date': fields.String(example='2025-01-15'),
        'status': fields.String(example='open'),
        'notes': fields.String(example='Long position'),
        'created_at': fields.String(example='2025-01-15T10:30:00Z')
    })
    
    trade_create = api.model('TradeCreate', {
        'ticker_id': fields.Integer(required=True, example=1),
        'account_id': fields.Integer(required=True, example=1),
        'type': fields.String(required=True, example='buy'),
        'quantity': fields.Float(required=True, example=100.0),
        'price': fields.Float(required=True, example=150.0),
        'date': fields.String(required=True, example='2025-01-15'),
        'notes': fields.String(example='Long position')
    })
    
    return {
        'success_response': success_response,
        'error_response': error_response,
        'login_request': login_request,
        'login_response': login_response,
        'ticker_model': ticker_model,
        'ticker_create': ticker_create,
        'account_model': account_model,
        'account_create': account_create,
        'trade_model': trade_model,
        'trade_create': trade_create
    }

