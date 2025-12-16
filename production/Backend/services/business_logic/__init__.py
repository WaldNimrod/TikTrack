"""
Business Logic Layer - TikTrack
================================

Centralized business logic services for all trading operations.
This layer contains all business rules, calculations, and validations
that were previously scattered across frontend and backend.

Architecture:
- BaseBusinessService: Base class for all business services
- BusinessRulesRegistry: Central registry for all business rules
- Entity-specific services: Trade, Execution, Alert, Statistics, CashFlow

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from .base_business_service import BaseBusinessService
from .business_rules_registry import BUSINESS_RULES, BusinessRulesRegistry, business_rules_registry
from .trade_business_service import TradeBusinessService
from .execution_business_service import ExecutionBusinessService
from .alert_business_service import AlertBusinessService
from .statistics_business_service import StatisticsBusinessService
from .cash_flow_business_service import CashFlowBusinessService
from .note_business_service import NoteBusinessService
from .trading_account_business_service import TradingAccountBusinessService
from .trade_plan_business_service import TradePlanBusinessService
from .ticker_business_service import TickerBusinessService
from .currency_business_service import CurrencyBusinessService
from .tag_business_service import TagBusinessService
from .preferences_business_service import PreferencesBusinessService
from .ai_analysis_business_service import AIAnalysisBusinessService
from .historical_data_business_service import HistoricalDataBusinessService

__all__ = [
    'BaseBusinessService',
    'BUSINESS_RULES',
    'BusinessRulesRegistry',
    'business_rules_registry',
    'TradeBusinessService',
    'ExecutionBusinessService',
    'AlertBusinessService',
    'StatisticsBusinessService',
    'CashFlowBusinessService',
    'NoteBusinessService',
    'TradingAccountBusinessService',
    'TradePlanBusinessService',
    'TickerBusinessService',
    'CurrencyBusinessService',
    'TagBusinessService',
    'PreferencesBusinessService',
    'AIAnalysisBusinessService',
    'HistoricalDataBusinessService',
]

