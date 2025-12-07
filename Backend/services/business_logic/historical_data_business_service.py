"""
Historical Data Business Logic Service - TikTrack
==================================================

Business logic for historical data calculations:
- Portfolio state at specific dates
- Trade history aggregations
- Trading journal entries

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/HISTORICAL_DATA_SERVICE.md
- documentation/03-DEVELOPMENT/PLANS/HISTORICAL_PAGES_FULL_IMPLEMENTATION_PLAN.md
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from .base_business_service import BaseBusinessService
from .business_rules_registry import business_rules_registry
from .trade_business_service import TradeBusinessService
from .statistics_business_service import StatisticsBusinessService
from .note_business_service import NoteBusinessService
from services.position_portfolio_service import PositionPortfolioService
from services.date_normalization_service import DateNormalizationService
from models.trade import Trade
from models.execution import Execution
from models.note import Note
from models.ticker import Ticker

logger = logging.getLogger(__name__)


class HistoricalDataBusinessService(BaseBusinessService):
    """
    Business logic service for historical data calculations.
    
    Handles all historical data-related calculations, validations, and aggregations.
    This is a calculation service - it does not have a database table.
    """
    
    @property
    def table_name(self) -> Optional[str]:
        """Historical data service has no database table - it's a calculation service."""
        return None
    
    def __init__(self, db_session: Optional[Session] = None):
        """Initialize the historical data business service."""
        super().__init__(db_session)
        self.registry = business_rules_registry
        
        # Initialize dependent services
        self.trade_service = TradeBusinessService(db_session)
        self.statistics_service = StatisticsBusinessService(db_session)
        self.note_service = NoteBusinessService(db_session)
        self.date_normalizer = DateNormalizationService()
    
    # ========================================================================
    # Validation
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate historical data request parameters.
        
        Validation order (CRITICAL - must follow this order):
        1. Database Constraints (ValidationService) - if applicable
        2. Business Rules Registry - checks min/max, allowed_values
        3. Complex Business Rules - date ranges, user authorization
        
        Args:
            data: Request data dictionary with keys:
                - user_id: int (required, positive)
                - account_id: int (optional, positive)
                - start_date: str/datetime (required, ISO format)
                - end_date: str/datetime (required, ISO format, must be >= start_date)
                - date: str/datetime (optional, for single date queries)
            
        Returns:
            Dict with:
                - is_valid: bool
                - errors: List[str]
        """
        self.log_business_event('historical_data_validation', data)
        
        errors = []
        
        # Step 1: Basic required fields
        user_id = data.get('user_id')
        if not user_id or not isinstance(user_id, int) or user_id <= 0:
            errors.append('user_id is required and must be a positive integer')
        
        # Step 2: Date validation
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        date = data.get('date')
        
        # Either date range or single date must be provided
        if not (start_date and end_date) and not date:
            errors.append('Either date range (start_date, end_date) or single date must be provided')
        
        # Validate date range if provided
        if start_date and end_date:
            try:
                if isinstance(start_date, str):
                    start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                else:
                    start_dt = start_date
                
                if isinstance(end_date, str):
                    end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                else:
                    end_dt = end_date
                
                if start_dt.tzinfo is None:
                    start_dt = start_dt.replace(tzinfo=timezone.utc)
                if end_dt.tzinfo is None:
                    end_dt = end_dt.replace(tzinfo=timezone.utc)
                
                if end_dt < start_dt:
                    errors.append('end_date must be greater than or equal to start_date')
                
                # Check date range doesn't exceed 365 days
                if (end_dt - start_dt).days > 365:
                    errors.append('Date range cannot exceed 365 days')
                    
            except (ValueError, AttributeError) as e:
                errors.append(f'Invalid date format: {str(e)}')
        
        # Validate single date if provided
        if date:
            try:
                if isinstance(date, str):
                    date_dt = datetime.fromisoformat(date.replace('Z', '+00:00'))
                else:
                    date_dt = date
                    
                if date_dt.tzinfo is None:
                    date_dt = date_dt.replace(tzinfo=timezone.utc)
            except (ValueError, AttributeError) as e:
                errors.append(f'Invalid date format: {str(e)}')
        
        # Step 3: Account ID validation (if provided)
        account_id = data.get('account_id')
        if account_id is not None:
            if not isinstance(account_id, int) or account_id <= 0:
                errors.append('account_id must be a positive integer if provided')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    # ========================================================================
    # Portfolio State Calculations
    # ========================================================================
    
    def calculate_portfolio_state_at_date(
        self,
        user_id: int,
        account_id: Optional[int],
        target_date: datetime,
        include_closed: bool = False
    ) -> Dict[str, Any]:
        """
        Calculate portfolio state at a specific date.
        
        Args:
            user_id: User ID
            account_id: Account ID (None for all accounts)
            target_date: Target date (timezone-aware)
            include_closed: Include closed positions
        
        Returns:
            Dict with portfolio state data
        """
        # Placeholder implementation
        # Full implementation would use PositionPortfolioService
        return {
            'positions': [],
            'total_value': 0.0,
            'total_pl': 0.0,
            'total_pl_percent': 0.0,
            'snapshot_date': target_date.isoformat(),
            'account_id': account_id,
            'is_valid': True
        }
    
    def calculate_portfolio_performance_range(
        self,
        user_id: int,
        account_id: Optional[int],
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """
        Calculate portfolio performance over a date range.
        
        Args:
            user_id: User ID
            account_id: Account ID (None for all accounts)
            start_date: Start date (timezone-aware)
            end_date: End date (timezone-aware)
        
        Returns:
            Dict with performance data
        """
        # Placeholder implementation
        return {
            'start_state': {'total_value': 0.0},
            'end_state': {'total_value': 0.0},
            'performance': {
                'value_change': 0.0,
                'value_change_percent': 0.0,
                'pl_change': 0.0
            },
            'is_valid': True
        }
    
    def calculate_portfolio_snapshot_series(
        self,
        user_id: int,
        account_id: Optional[int],
        dates: List[datetime],
        interval: str = 'day'
    ) -> Dict[str, Any]:
        """
        Calculate portfolio snapshot series for multiple dates.
        
        Args:
            user_id: User ID
            account_id: Account ID (None for all accounts)
            dates: List of dates (timezone-aware)
            interval: Interval type ('day', 'week', 'month')
        
        Returns:
            Dict with snapshot series data
        """
        # Placeholder implementation
        return {
            'snapshots': [],
            'count': 0,
            'is_valid': True
        }
    
    # ========================================================================
    # Trade History Calculations
    # ========================================================================
    
    def aggregate_trade_history(
        self,
        user_id: int,
        filters: Dict[str, Any],
        group_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Aggregate trade history with filters.
        
        Args:
            user_id: User ID
            filters: Filter dictionary (account_id, ticker_id, start_date, end_date, status, etc.)
            group_by: Group by field ('period', 'ticker', 'account')
        
        Returns:
            Dict with aggregated trade history
        """
        # Placeholder implementation
        return {
            'trades': [],
            'count': 0,
            'grouped': {} if group_by else None,
            'is_valid': True
        }
    
    def calculate_trade_statistics(
        self,
        user_id: int,
        filters: Dict[str, Any],
        period: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate trade statistics.
        
        Args:
            user_id: User ID
            filters: Filter dictionary
            period: Period for statistics ('day', 'week', 'month', 'year')
        
        Returns:
            Dict with trade statistics
        """
        # Placeholder implementation
        return {
            'total_trades': 0,
            'total_pl': 0.0,
            'win_rate': 0.0,
            'average_pl': 0.0,
            'is_valid': True
        }
    
    def calculate_plan_vs_execution_analysis(
        self,
        user_id: int,
        date_range: Dict[str, datetime]
    ) -> Dict[str, Any]:
        """
        Calculate plan vs execution analysis.
        
        Args:
            user_id: User ID
            date_range: Date range dictionary with 'start_date' and 'end_date'
        
        Returns:
            Dict with plan vs execution analysis
        """
        # Placeholder implementation
        return {
            'analysis': {},
            'is_valid': True
        }
    
    # ========================================================================
    # Trading Journal Calculations
    # ========================================================================
    
    def aggregate_journal_entries(
        self,
        user_id: int,
        date_range: Dict[str, datetime],
        entity_types: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Aggregate journal entries for a date range.
        
        Args:
            user_id: User ID
            date_range: Date range dictionary with 'start_date' and 'end_date'
            entity_types: List of entity types ('trade', 'execution', 'note', 'all')
        
        Returns:
            Dict with journal entries
        """
        # Placeholder implementation
        return {
            'entries': [],
            'count': 0,
            'is_valid': True
        }
    
    def calculate_journal_statistics(
        self,
        user_id: int,
        date_range: Dict[str, datetime],
        entity_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate journal statistics.
        
        Args:
            user_id: User ID
            date_range: Date range dictionary
            entity_type: Entity type filter
        
        Returns:
            Dict with journal statistics
        """
        # Placeholder implementation
        return {
            'total_entries': 0,
            'by_type': {},
            'is_valid': True
        }
    
    def validate_journal_entry(
        self,
        entry_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Validate journal entry data.
        
        Args:
            entry_data: Journal entry data dictionary
        
        Returns:
            Dict with validation result
        """
        # Placeholder implementation
        return {
            'is_valid': True,
            'errors': []
        }
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def _get_market_price_at_date(
        self,
        db: Session,
        ticker_id: int,
        target_date: datetime
    ) -> Optional[float]:
        """
        Get market price for a ticker at a specific date.
        
        Args:
            db: Database session
            ticker_id: Ticker ID
            target_date: Target date
        
        Returns:
            Market price or None if not available
        """
        # Placeholder implementation
        # Full implementation would query MarketDataQuote for historical prices
        return None
    
    def _group_trades(
        self,
        trades: List[Dict[str, Any]],
        group_by: str
    ) -> Dict[str, Any]:
        """
        Group trades by specified field.
        
        Args:
            trades: List of trade dictionaries
            group_by: Group by field ('period', 'ticker', 'account')
        
        Returns:
            Dict with grouped trades
        """
        # Placeholder implementation
        return {}
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform business calculations (required by BaseBusinessService).
        
        This is a placeholder - specific calculation methods should be used instead.
        """
        return {
            'is_valid': True,
            'error': None
        }
    
    def log_business_event(self, event_type: str, data: Dict[str, Any]) -> None:
        """Log business event for monitoring."""
        self.logger.debug(f"Business event: {event_type}", extra={'data': data})

