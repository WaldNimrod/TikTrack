"""
OpenAPI/Swagger Configuration
"""
from flask_restx import Api

def create_api():
    """Create Flask-RESTX API instance with Swagger documentation"""
    
    api = Api(
        title='TikTrack API',
        version='1.0',
        description='TikTrack Trading Application API',
        doc='/api/docs',
        prefix='/api',
        authorizations={
            'apikey': {
                'type': 'apiKey',
                'in': 'header',
                'name': 'Authorization',
                'description': 'JWT Token: Bearer <token>'
            }
        },
        security='apikey'
    )
    
    return api

# API Namespaces
def create_namespaces(api):
    """Create API namespaces for different resources"""
    
    # Auth namespace
    auth_ns = api.namespace('auth', description='Authentication operations')
    
    # Tickers namespace
    tickers_ns = api.namespace('tickers', description='Ticker operations')
    
    # Trading Accounts namespace
    accounts_ns = api.namespace('trading-accounts', description='Trading Account operations')
    
    # Trades namespace
    trades_ns = api.namespace('trades', description='Trade operations')
    
    # Trade Plans namespace
    trade_plans_ns = api.namespace('tradeplans', description='Trade plan operations')
    
    # Alerts namespace
    alerts_ns = api.namespace('alerts', description='Alert operations')
    
    # Cash Flows namespace
    cash_flows_ns = api.namespace('cashflows', description='Cash flow operations')
    
    # Notes namespace
    notes_ns = api.namespace('notes', description='Note operations')
    
    # Executions namespace
    executions_ns = api.namespace('executions', description='Execution operations')
    
    return {
        'auth': auth_ns,
        'tickers': tickers_ns,
        'accounts': accounts_ns,
        'trades': trades_ns,
        'trade_plans': trade_plans_ns,
        'alerts': alerts_ns,
        'cash_flows': cash_flows_ns,
        'notes': notes_ns,
        'executions': executions_ns
    }

