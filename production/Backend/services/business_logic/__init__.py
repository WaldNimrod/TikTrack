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
from .business_rules_registry import BUSINESS_RULES, BusinessRulesRegistry
from .trade_business_service import TradeBusinessService
from .execution_business_service import ExecutionBusinessService
from .alert_business_service import AlertBusinessService
from .statistics_business_service import StatisticsBusinessService
from .cash_flow_business_service import CashFlowBusinessService

__all__ = [
    'BaseBusinessService',
    'BUSINESS_RULES',
    'BusinessRulesRegistry',
    'TradeBusinessService',
    'ExecutionBusinessService',
    'AlertBusinessService',
    'StatisticsBusinessService',
    'CashFlowBusinessService',
]

