# API routes package

# Import all blueprints for easy access
from .trading_accounts import trading_accounts_bp
from .alerts import alerts_bp
from .background_tasks import background_tasks_bp
from .cache_management import cache_management_bp
from .cash_flows import cash_flows_bp
from .constraints import constraints_bp
from .css_management import css_management_bp
from .currencies import currencies_bp
from .entity_details import entity_details_bp
from .executions import executions_bp
from .file_scanner import file_scanner_bp
from .linked_items import linked_items_bp
from .note_relation_types import note_relation_types_bp
from .notes import notes_bp
from .preferences import preferences_bp
from .query_optimization import query_optimization_bp
from .quotes_v1 import quotes_bp
from .server_management import server_management_bp
from .system_overview import system_overview_bp
from .tickers import tickers_bp
from .trade_plans import trade_plans_bp
from .trades import trades_bp
from .users import users_bp
from .wal_management import wal_bp

# Base classes for unified API
from .base_entity import BaseEntityAPI
from .base_entity_utils import BaseEntityUtils
from .base_entity_decorators import (
    api_endpoint,
    validate_request,
    handle_database_session,
    cache_with_invalidation,
    rate_limit_endpoint
)

__all__ = [
    # Blueprints
    'trading_accounts_bp',
    'alerts_bp',
    'background_tasks_bp',
    'cache_management_bp',
    'cash_flows_bp',
    'constraints_bp',
    'css_management_bp',
    'currencies_bp',
    'entity_details_bp',
    'executions_bp',
    'file_scanner_bp',
    'linked_items_bp',
    'note_relation_types_bp',
    'notes_bp',
    'preferences_bp',
    'query_optimization_bp',
    'quotes_bp',
    'server_management_bp',
    'system_overview_bp',
    'tickers_bp',
    'trade_plans_bp',
    'trades_bp',
    'users_bp',
    'wal_bp',
    
    # Base classes
    'BaseEntityAPI',
    'BaseEntityUtils',
    'api_endpoint',
    'validate_request',
    'handle_database_session',
    'cache_with_invalidation',
    'rate_limit_endpoint'
]
