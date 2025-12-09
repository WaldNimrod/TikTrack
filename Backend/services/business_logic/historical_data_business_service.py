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
from datetime import datetime, timezone, timedelta, date
from sqlalchemy.orm import Session, joinedload
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
from models.alert import Alert
from models.cash_flow import CashFlow
from models.trade_plan import TradePlan

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
                - start_date: str/datetime (optional, ISO format)
                - end_date: str/datetime (optional, ISO format, must be >= start_date)
                - date: str/datetime (optional, for single date queries)
                - ticker_id: int (optional, positive)
                - status: str (optional, filter by status)
                - investment_type: str (optional, filter by investment type)
                
        Note: If no dates are provided, all trades for the user will be returned.
            
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
        
        # Dates are optional - if not provided, return all trades
        # Only validate if dates are provided
        
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
        
        # Step 4: Ticker ID validation (if provided)
        ticker_id = data.get('ticker_id')
        if ticker_id is not None:
            if not isinstance(ticker_id, int) or ticker_id <= 0:
                errors.append('ticker_id must be a positive integer if provided')
        
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
            Dict with portfolio state data:
            - positions: List of position data
            - total_value: Total portfolio value (cash + positions)
            - total_pl: Total P/L (realized + unrealized)
            - total_pl_percent: Total P/L percentage
            - total_realized_pl: Total realized P/L
            - total_unrealized_pl: Total unrealized P/L
            - cash_balance: Total cash balance across accounts
            - snapshot_date: ISO format date string
            - account_id: Account ID (None if all accounts)
            - is_valid: bool
        """
        if not self.db_session:
            return {
                'positions': [],
                'total_value': 0.0,
                'total_pl': 0.0,
                'total_pl_percent': 0.0,
                'total_realized_pl': 0.0,
                'total_unrealized_pl': 0.0,
                'cash_balance': 0.0,
                'snapshot_date': target_date.isoformat(),
                'account_id': account_id,
                'is_valid': False,
                'error': 'Database session not available'
            }
        
        try:
            from models.trading_account import TradingAccount
            from models.external_data import MarketDataQuote, ExternalDataProvider
            from services.account_activity_service import AccountActivityService
            
            # Normalize target_date to end of day (23:59:59)
            target_date_end = target_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            # Get accounts to process
            if account_id:
                accounts = self.db_session.query(TradingAccount).filter(
                    and_(
                        TradingAccount.id == account_id,
                        TradingAccount.user_id == user_id
                    )
                ).all()
            else:
                accounts = self.db_session.query(TradingAccount).filter(
                    TradingAccount.user_id == user_id
                ).all()
            
            if not accounts:
                return {
                    'positions': [],
                    'total_value': 0.0,
                    'total_pl': 0.0,
                    'total_pl_percent': 0.0,
                    'total_realized_pl': 0.0,
                    'total_unrealized_pl': 0.0,
                    'cash_balance': 0.0,
                    'snapshot_date': target_date.isoformat(),
                    'account_id': account_id,
                    'is_valid': True
                }
            
            positions = []
            total_cash_balance = 0.0
            total_realized_pl = 0.0
            total_unrealized_pl = 0.0
            total_market_value = 0.0
            
            # Process each account
            for account in accounts:
                # Get cash balance at target date
                try:
                    activity_data = AccountActivityService.get_account_activity(
                        db=self.db_session,
                        account_id=account.id,
                        start_date=None,
                        end_date=target_date_end
                    )
                    account_cash_balance = activity_data.get('base_currency_total', 0.0) or 0.0
                    total_cash_balance += account_cash_balance
                except Exception as e:
                    logger.warning(f"Error getting cash balance for account {account.id} at {target_date}: {str(e)}")
                    account_cash_balance = 0.0
                
                # Get all unique ticker+account combinations that have executions up to target_date
                ticker_account_pairs = self.db_session.query(
                    Execution.ticker_id,
                    Execution.trading_account_id
                ).filter(
                    and_(
                        Execution.trading_account_id == account.id,
                        or_(
                            Execution.date <= target_date_end,
                            Execution.created_at <= target_date_end
                        )
                    )
                ).distinct().all()
                
                # Calculate position for each ticker+account combination
                for ticker_id, trading_account_id in ticker_account_pairs:
                    # Get all executions for this ticker+account up to target_date
                    executions = self.db_session.query(Execution).filter(
                        and_(
                            Execution.ticker_id == ticker_id,
                            Execution.trading_account_id == trading_account_id,
                            or_(
                                Execution.date <= target_date_end,
                                Execution.created_at <= target_date_end
                            )
                        )
                    ).order_by(Execution.date.asc(), Execution.created_at.asc()).all()
                    
                    if not executions:
                        continue
                    
                    # Calculate position metrics from executions
                    total_bought_quantity = 0.0
                    total_sold_quantity = 0.0
                    total_bought_amount = 0.0
                    total_sold_amount = 0.0
                    total_cost = 0.0
                    total_fees = 0.0
                    realized_pl = 0.0
                    last_execution_date = None
                    
                    # Track linked trades
                    linked_trade_ids = set()
                    
                    for execution in executions:
                        action = execution.action
                        quantity = float(execution.quantity)
                        price = float(execution.price)
                        fee = float(execution.fee or 0)
                        exec_date = execution.date or execution.created_at
                        
                        if execution.trade_id:
                            linked_trade_ids.add(execution.trade_id)
                        
                        if last_execution_date is None or exec_date > last_execution_date:
                            last_execution_date = exec_date
                        
                        if action == 'buy':
                            total_bought_quantity += quantity
                            total_bought_amount += quantity * price
                            total_cost += (quantity * price) + fee
                            total_fees += fee
                        elif action == 'sell':
                            total_sold_quantity += quantity
                            total_sold_amount += quantity * price
                            total_fees += fee
                            if execution.realized_pl is not None:
                                realized_pl += float(execution.realized_pl)
                    
                    # Calculate net position
                    net_quantity = total_bought_quantity - total_sold_quantity
                    
                    # Skip closed positions if not including them
                    if not include_closed and net_quantity == 0:
                        continue
                    
                    # Calculate average price
                    if total_bought_quantity > 0:
                        average_price_net = total_cost / total_bought_quantity
                    else:
                        average_price_net = 0.0
                    
                    # Determine position side
                    if net_quantity > 0:
                        side = 'long'
                    elif net_quantity < 0:
                        side = 'short'
                    else:
                        side = 'closed'
                    
                    # Get historical market price at target_date
                    market_price = self._get_market_price_at_date(self.db_session, ticker_id, target_date)
                    
                    # Calculate market value and unrealized P/L
                    market_value = None
                    unrealized_pl = None
                    unrealized_pl_percent = None
                    
                    if market_price and net_quantity != 0:
                        market_value = abs(net_quantity) * market_price
                        total_market_value += market_value
                        
                        # Calculate unrealized P/L
                        current_cost = abs(net_quantity) * average_price_net
                        if side == 'long':
                            unrealized_pl = market_value - current_cost
                        else:  # short
                            unrealized_pl = current_cost - market_value
                        
                        # Calculate unrealized P/L percentage
                        if current_cost > 0:
                            unrealized_pl_percent = (unrealized_pl / current_cost) * 100
                    
                    # Get ticker info
                    ticker = self.db_session.query(Ticker).filter(Ticker.id == ticker_id).first()
                    
                    # Add to realized P/L totals
                    total_realized_pl += realized_pl
                    if unrealized_pl is not None:
                        total_unrealized_pl += unrealized_pl
                    
                    # Build position data
                    position_data = {
                        'trading_account_id': trading_account_id,
                        'account_name': account.name,
                        'ticker_id': ticker_id,
                        'ticker_symbol': ticker.symbol if ticker else f'Ticker_{ticker_id}',
                        'ticker_name': ticker.name if ticker else None,
                        'quantity': net_quantity,
                        'side': side,
                        'average_price_net': average_price_net,
                        'market_price': market_price,
                        'market_value': market_value,
                        'realized_pl': realized_pl,
                        'unrealized_pl': unrealized_pl,
                        'unrealized_pl_percent': unrealized_pl_percent,
                        'total_pl': (realized_pl or 0.0) + (unrealized_pl or 0.0),
                        'linked_trade_ids': list(linked_trade_ids),
                        'last_execution_date': last_execution_date.isoformat() if last_execution_date and hasattr(last_execution_date, 'isoformat') else str(last_execution_date) if last_execution_date else None
                    }
                    
                    positions.append(position_data)
            
            # Calculate totals
            total_pl = total_realized_pl + total_unrealized_pl
            total_value = total_cash_balance + total_market_value
            
            # Calculate total P/L percentage
            total_cost_basis = total_value - total_pl
            total_pl_percent = (total_pl / total_cost_basis * 100) if total_cost_basis > 0 else 0.0
            
            return {
                'positions': positions,
                'total_value': total_value,
                'total_pl': total_pl,
                'total_pl_percent': total_pl_percent,
                'total_realized_pl': total_realized_pl,
                'total_unrealized_pl': total_unrealized_pl,
                'cash_balance': total_cash_balance,
                'snapshot_date': target_date.isoformat(),
                'account_id': account_id,
                'is_valid': True
            }
            
        except Exception as e:
            logger.error(f"Error calculating portfolio state at date {target_date}: {str(e)}", exc_info=True)
            return {
                'positions': [],
                'total_value': 0.0,
                'total_pl': 0.0,
                'total_pl_percent': 0.0,
                'total_realized_pl': 0.0,
                'total_unrealized_pl': 0.0,
                'cash_balance': 0.0,
                'snapshot_date': target_date.isoformat(),
                'account_id': account_id,
                'is_valid': False,
                'error': str(e)
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
            Dict with performance data:
            - start_state: Portfolio state at start_date
            - end_state: Portfolio state at end_date
            - performance: Performance metrics
            - is_valid: bool
        """
        if not self.db_session:
            return {
                'start_state': {'total_value': 0.0},
                'end_state': {'total_value': 0.0},
                'performance': {
                    'value_change': 0.0,
                    'value_change_percent': 0.0,
                    'pl_change': 0.0
                },
                'is_valid': False,
                'error': 'Database session not available'
            }
        
        try:
            # Calculate start and end states
            start_state = self.calculate_portfolio_state_at_date(
                user_id=user_id,
                account_id=account_id,
                target_date=start_date,
                include_closed=False
            )
            
            end_state = self.calculate_portfolio_state_at_date(
                user_id=user_id,
                account_id=account_id,
                target_date=end_date,
                include_closed=False
            )
            
            if not start_state.get('is_valid') or not end_state.get('is_valid'):
                return {
                    'start_state': start_state,
                    'end_state': end_state,
                    'performance': {
                        'value_change': 0.0,
                        'value_change_percent': 0.0,
                        'pl_change': 0.0
                    },
                    'is_valid': False,
                    'error': 'Failed to calculate start or end state'
                }
            
            # Calculate performance metrics
            start_value = start_state.get('total_value', 0.0)
            end_value = end_state.get('total_value', 0.0)
            value_change = end_value - start_value
            value_change_percent = (value_change / start_value * 100) if start_value > 0 else 0.0
            
            start_pl = start_state.get('total_pl', 0.0)
            end_pl = end_state.get('total_pl', 0.0)
            pl_change = end_pl - start_pl
            
            return {
                'start_state': {
                    'total_value': start_value,
                    'total_pl': start_pl,
                    'total_pl_percent': start_state.get('total_pl_percent', 0.0),
                    'cash_balance': start_state.get('cash_balance', 0.0),
                    'positions_count': len(start_state.get('positions', []))
                },
                'end_state': {
                    'total_value': end_value,
                    'total_pl': end_pl,
                    'total_pl_percent': end_state.get('total_pl_percent', 0.0),
                    'cash_balance': end_state.get('cash_balance', 0.0),
                    'positions_count': len(end_state.get('positions', []))
                },
                'performance': {
                    'value_change': value_change,
                    'value_change_percent': value_change_percent,
                    'pl_change': pl_change
                },
                'is_valid': True
            }
            
        except Exception as e:
            logger.error(f"Error calculating portfolio performance range: {str(e)}", exc_info=True)
            return {
                'start_state': {'total_value': 0.0},
                'end_state': {'total_value': 0.0},
                'performance': {
                    'value_change': 0.0,
                    'value_change_percent': 0.0,
                    'pl_change': 0.0
                },
                'is_valid': False,
                'error': str(e)
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
            Dict with snapshot series data:
            - snapshots: List of snapshot data (one per date)
            - count: Number of snapshots
            - is_valid: bool
        """
        if not self.db_session:
            return {
                'snapshots': [],
                'count': 0,
                'is_valid': False,
                'error': 'Database session not available'
            }
        
        if not dates:
            return {
                'snapshots': [],
                'count': 0,
                'is_valid': True
            }
        
        try:
            # Sort dates
            sorted_dates = sorted(dates)
            
            # Calculate snapshot for each date
            snapshots = []
            for date in sorted_dates:
                snapshot = self.calculate_portfolio_state_at_date(
                    user_id=user_id,
                    account_id=account_id,
                    target_date=date,
                    include_closed=False
                )
                
                if snapshot.get('is_valid'):
                    snapshots.append({
                        'date': date.isoformat(),
                        'snapshot_date': date.isoformat(),
                        'total_value': snapshot.get('total_value', 0.0),
                        'total_pl': snapshot.get('total_pl', 0.0),
                        'total_pl_percent': snapshot.get('total_pl_percent', 0.0),
                        'total_realized_pl': snapshot.get('total_realized_pl', 0.0),
                        'total_unrealized_pl': snapshot.get('total_unrealized_pl', 0.0),
                        'cash_balance': snapshot.get('cash_balance', 0.0),
                        'positions_count': len(snapshot.get('positions', []))
                    })
            
            return {
                'snapshots': snapshots,
                'count': len(snapshots),
                'is_valid': True
            }
            
        except Exception as e:
            logger.error(f"Error calculating portfolio snapshot series: {str(e)}", exc_info=True)
            return {
                'snapshots': [],
                'count': 0,
                'is_valid': False,
                'error': str(e)
            }
    
    def calculate_portfolio_comparison(
        self,
        user_id: int,
        account_id: Optional[int],
        date1: datetime,
        date2: datetime
    ) -> Dict[str, Any]:
        """
        Compare portfolio state between two dates.
        
        Args:
            user_id: User ID
            account_id: Account ID (None for all accounts)
            date1: First date (timezone-aware)
            date2: Second date (timezone-aware)
        
        Returns:
            Dict with comparison data:
            - date1_state: Portfolio state at date1
            - date2_state: Portfolio state at date2
            - comparison: Comparison metrics (changes)
            - is_valid: bool
        """
        if not self.db_session:
            return {
                'date1_state': {},
                'date2_state': {},
                'comparison': {},
                'is_valid': False,
                'error': 'Database session not available'
            }
        
        try:
            # Calculate states for both dates
            state1 = self.calculate_portfolio_state_at_date(
                user_id=user_id,
                account_id=account_id,
                target_date=date1,
                include_closed=False
            )
            
            state2 = self.calculate_portfolio_state_at_date(
                user_id=user_id,
                account_id=account_id,
                target_date=date2,
                include_closed=False
            )
            
            if not state1.get('is_valid') or not state2.get('is_valid'):
                return {
                    'date1_state': state1,
                    'date2_state': state2,
                    'comparison': {},
                    'is_valid': False,
                    'error': 'Failed to calculate one or both states'
                }
            
            # Calculate comparison metrics
            cash_balance1 = state1.get('cash_balance', 0.0)
            cash_balance2 = state2.get('cash_balance', 0.0)
            cash_balance_change = cash_balance2 - cash_balance1
            
            portfolio_value1 = state1.get('total_value', 0.0)
            portfolio_value2 = state2.get('total_value', 0.0)
            portfolio_value_change = portfolio_value2 - portfolio_value1
            portfolio_value_change_percent = (portfolio_value_change / portfolio_value1 * 100) if portfolio_value1 > 0 else 0.0
            
            total_pl1 = state1.get('total_pl', 0.0)
            total_pl2 = state2.get('total_pl', 0.0)
            total_pl_change = total_pl2 - total_pl1
            total_pl_change_percent = (total_pl_change / abs(total_pl1) * 100) if total_pl1 != 0 else 0.0
            
            positions_count1 = len(state1.get('positions', []))
            positions_count2 = len(state2.get('positions', []))
            positions_count_change = positions_count2 - positions_count1
            
            return {
                'date1_state': {
                    'date': date1.isoformat(),
                    'cash_balance': cash_balance1,
                    'portfolio_value': portfolio_value1,
                    'total_pl': total_pl1,
                    'total_pl_percent': state1.get('total_pl_percent', 0.0),
                    'positions_count': positions_count1
                },
                'date2_state': {
                    'date': date2.isoformat(),
                    'cash_balance': cash_balance2,
                    'portfolio_value': portfolio_value2,
                    'total_pl': total_pl2,
                    'total_pl_percent': state2.get('total_pl_percent', 0.0),
                    'positions_count': positions_count2
                },
                'comparison': {
                    'cash_balance_change': cash_balance_change,
                    'portfolio_value_change': portfolio_value_change,
                    'portfolio_value_change_percent': portfolio_value_change_percent,
                    'total_pl_change': total_pl_change,
                    'total_pl_change_percent': total_pl_change_percent,
                    'positions_count_change': positions_count_change
                },
                'is_valid': True
            }
            
        except Exception as e:
            logger.error(f"Error calculating portfolio comparison: {str(e)}", exc_info=True)
            return {
                'date1_state': {},
                'date2_state': {},
                'comparison': {},
                'is_valid': False,
                'error': str(e)
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
        if not self.db_session:
            return {
                'trades': [],
                'count': 0,
                'grouped': {} if group_by else None,
                'is_valid': False,
                'error': 'Database session not available'
            }
        
        try:
            from services.trade_aggregation_service import TradeAggregationService
            
            # Map filters to TradeAggregationService parameters
            aggregation_result = TradeAggregationService.aggregate_trades(
                db=self.db_session,
                user_id=user_id,
                ticker_id=filters.get('ticker_id'),
                trading_account_id=filters.get('account_id'),
                investment_type=filters.get('investment_type'),
                status=filters.get('status'),
                date_range_start=filters.get('start_date'),
                date_range_end=filters.get('end_date'),
                include_closed=True,
                enrich_with_position=True
            )
            
            trades = aggregation_result.get('trades', [])
            
            # Group trades if group_by is specified
            grouped = None
            if group_by:
                grouped = self._group_trades(trades, group_by)
            
            return {
                'trades': trades,
                'count': len(trades),
                'grouped': grouped,
                'is_valid': True
            }
        except Exception as e:
            self.logger.error(f"Error aggregating trade history: {str(e)}", exc_info=True)
            return {
                'trades': [],
                'count': 0,
                'grouped': {} if group_by else None,
                'is_valid': False,
                'error': str(e)
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
        try:
            if not self.db_session:
                return {
                    'analysis': {},
                    'is_valid': False,
                    'error': 'Database session is required'
                }

            start_date = date_range.get('start_date')
            end_date = date_range.get('end_date')

            query = (
                self.db_session.query(Trade)
                .options(
                    joinedload(Trade.trade_plan),
                    joinedload(Trade.executions),
                    joinedload(Trade.ticker)
                )
                .filter(Trade.user_id == user_id)
            )

            if start_date:
                query = query.filter(Trade.created_at >= start_date)
            if end_date:
                query = query.filter(Trade.created_at <= end_date)

            trades = query.all()

            analysis_items = []
            total_planned_qty = 0.0
            total_executed_qty = 0.0
            total_planned_amount = 0.0
            total_executed_amount = 0.0

            for trade in trades:
                plan = trade.trade_plan

                planned_qty = trade.planned_quantity or (plan.planned_quantity if plan else None) or 0.0
                planned_amount = trade.planned_amount or (plan.planned_amount if plan else None) or 0.0

                executed_qty = 0.0
                executed_amount = 0.0
                for exe in trade.executions or []:
                    qty = float(exe.quantity or 0)
                    price = float(exe.price or 0)
                    action = (exe.action or '').lower()
                    if action == 'sell':
                        executed_qty -= qty
                        executed_amount -= qty * price
                    else:
                        executed_qty += qty
                        executed_amount += qty * price

                completion_rate = 0.0
                if planned_qty:
                    completion_rate = (executed_qty / planned_qty) * 100

                total_planned_qty += planned_qty
                total_executed_qty += executed_qty
                total_planned_amount += planned_amount
                total_executed_amount += executed_amount

                analysis_items.append({
                    'trade_id': trade.id,
                    'ticker_id': trade.ticker_id,
                    'ticker_symbol': trade.ticker.symbol if trade.ticker else None,
                    'status': trade.status,
                    'planned_quantity': planned_qty,
                    'planned_amount': planned_amount,
                    'executed_quantity': executed_qty,
                    'executed_amount': executed_amount,
                    'completion_rate_percent': completion_rate,
                    'created_at': trade.created_at,
                    'closed_at': trade.closed_at
                })

            summary = {
                'trades_count': len(trades),
                'planned_quantity_total': total_planned_qty,
                'executed_quantity_total': total_executed_qty,
                'planned_amount_total': total_planned_amount,
                'executed_amount_total': total_executed_amount,
                'completion_rate_percent': (total_executed_qty / total_planned_qty * 100) if total_planned_qty else 0.0
            }

            return {
                'analysis': {
                    'summary': summary,
                    'items': analysis_items
                },
                'is_valid': True
            }
        except Exception as e:
            logger.error(f"Error calculating plan vs execution analysis: {str(e)}", exc_info=True)
            return {
                'analysis': {},
                'is_valid': False,
                'error': str(e)
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
        
        Collects entries from all entity types (trades, executions, notes, alerts, 
        cash flows, trade plans) and formats them into a unified journal entry format.
        
        Implementation Date: 07.12.2025
        Status: ✅ Fully Implemented
        
        Args:
            user_id: User ID
            date_range: Date range dictionary with 'start_date' and 'end_date'
            entity_types: List of entity types ('trade', 'execution', 'note', 'alert', 
                         'cash_flow', 'trade_plan', 'all'). If None or 'all', includes all types.
        
        Returns:
            Dict with:
                - entries: List of journal entries (sorted by date, newest first)
                - count: Total number of entries
                - is_valid: bool
        
        Example:
            >>> service = HistoricalDataBusinessService(db_session=db)
            >>> result = service.aggregate_journal_entries(
            ...     user_id=1,
            ...     date_range={'start_date': datetime(2025, 1, 1), 'end_date': datetime(2025, 1, 31)},
            ...     entity_types=['trade', 'execution']
            ... )
            >>> print(result['count'])  # Number of entries
        """
        self.log_business_event('aggregate_journal_entries', {
            'user_id': user_id,
            'date_range': date_range,
            'entity_types': entity_types
        })
        
        if not self.db_session:
            return {
                'entries': [],
                'count': 0,
                'is_valid': False,
                'error': 'Database session not available'
            }
        
        try:
            start_date = date_range.get('start_date')
            end_date = date_range.get('end_date')
            
            if not start_date or not end_date:
                return {
                    'entries': [],
                    'count': 0,
                    'is_valid': False,
                    'error': 'start_date and end_date are required'
                }
            
            # Normalize entity types
            if entity_types is None or 'all' in entity_types:
                entity_types = ['trade', 'execution', 'note', 'alert', 'cash_flow', 'trade_plan']
            
            self.logger.info(f"Aggregating journal entries for user {user_id}, entity_types: {entity_types}, date_range: {start_date} to {end_date}")
            
            entries = []
            
            # Load Trades
            if 'trade' in entity_types:
                trades = self.db_session.query(Trade).options(
                    joinedload(Trade.ticker),
                    joinedload(Trade.account)
                ).filter(
                    Trade.user_id == user_id,
                    Trade.created_at >= start_date,
                    Trade.created_at <= end_date
                ).all()
                
                self.logger.info(f"Loaded {len(trades)} trades for journal")
                for trade in trades:
                    entry_date = trade.created_at or trade.closed_at
                    if entry_date:
                        entries.append({
                            'entity_type': 'trade',
                            'entity_id': trade.id,
                            'date': entry_date.isoformat() if isinstance(entry_date, datetime) else str(entry_date),
                            'created_at': trade.created_at.isoformat() if trade.created_at else None,
                            'status': trade.status,
                            'ticker_id': trade.ticker_id,
                            'ticker_symbol': trade.ticker.symbol if trade.ticker else None,
                            'account_id': trade.trading_account_id,
                            'account_name': trade.account.name if trade.account else None,
                            'side': trade.side,
                            'investment_type': trade.investment_type,
                            'closed_at': trade.closed_at.isoformat() if trade.closed_at else None,
                            'cancelled_at': trade.cancelled_at.isoformat() if trade.cancelled_at else None,
                            'subtype': 'trade_closed' if trade.status == 'closed' else 'trade_created' if trade.status == 'open' else 'trade_cancelled'
                        })
            
            # Load Executions
            if 'execution' in entity_types:
                executions = self.db_session.query(Execution).options(
                    joinedload(Execution.ticker),
                    joinedload(Execution.trading_account)
                ).filter(
                    Execution.user_id == user_id,
                    Execution.date >= start_date,
                    Execution.date <= end_date
                ).all()
                
                self.logger.info(f"Loaded {len(executions)} executions for journal")
                for execution in executions:
                    entry_date = execution.date or execution.created_at
                    if entry_date:
                        entries.append({
                            'entity_type': 'execution',
                            'entity_id': execution.id,
                            'date': entry_date.isoformat() if isinstance(entry_date, datetime) else str(entry_date),
                            'created_at': execution.created_at.isoformat() if execution.created_at else None,
                            'ticker_id': execution.ticker_id,
                            'ticker_symbol': execution.ticker.symbol if execution.ticker else None,
                            'account_id': execution.trading_account_id,
                            'account_name': execution.trading_account.name if execution.trading_account else None,
                            'action': execution.action,
                            'quantity': execution.quantity,
                            'price': execution.price,
                            'fee': execution.fee,
                            'trade_id': execution.trade_id,
                            'realized_pl': execution.realized_pl,
                            'mtm_pl': execution.mtm_pl,
                            'source': execution.source
                        })
            
            # Load Notes
            if 'note' in entity_types:
                notes = self.db_session.query(Note).filter(
                    Note.user_id == user_id,
                    Note.created_at >= start_date,
                    Note.created_at <= end_date
                ).all()
                
                self.logger.info(f"Loaded {len(notes)} notes for journal")
                for note in notes:
                    entry_date = note.created_at
                    if entry_date:
                        entries.append({
                            'entity_type': 'note',
                            'entity_id': note.id,
                            'date': entry_date.isoformat() if isinstance(entry_date, datetime) else str(entry_date),
                            'created_at': note.created_at.isoformat() if note.created_at else None,
                            'content': note.content,
                            'attachment': note.attachment,
                            'related_type_id': note.related_type_id,
                            'related_id': note.related_id
                        })
            
            # Load Alerts
            if 'alert' in entity_types:
                try:
                    # Alerts can be included if either created_at or triggered_at is in the date range
                    alerts = self.db_session.query(Alert).filter(
                        Alert.user_id == user_id,
                        or_(
                            # Created in date range
                            and_(
                                Alert.created_at >= start_date,
                                Alert.created_at <= end_date
                            ),
                            # Or triggered in date range
                            and_(
                                Alert.triggered_at.isnot(None),
                                Alert.triggered_at >= start_date,
                                Alert.triggered_at <= end_date
                            )
                        )
                    ).all()
                    
                    self.logger.info(f"Loaded {len(alerts)} alerts for journal")
                    for alert in alerts:
                        try:
                            # Use triggered_at if available, otherwise created_at
                            entry_date = alert.triggered_at if alert.triggered_at else alert.created_at
                            if entry_date:
                                # Load ticker symbol if ticker_id exists
                                ticker_symbol = None
                                if alert.ticker_id:
                                    ticker = self.db_session.query(Ticker).filter(Ticker.id == alert.ticker_id).first()
                                    ticker_symbol = ticker.symbol if ticker else None
                                
                                entries.append({
                                    'entity_type': 'alert',
                                    'entity_id': alert.id,
                                    'date': entry_date.isoformat() if isinstance(entry_date, datetime) else str(entry_date),
                                    'created_at': alert.created_at.isoformat() if alert.created_at else None,
                                    'ticker_id': alert.ticker_id,
                                    'ticker_symbol': ticker_symbol,
                                    'message': alert.message,
                                    'status': alert.status,
                                    'is_triggered': alert.is_triggered,
                                    'triggered_at': alert.triggered_at.isoformat() if alert.triggered_at else None,
                                    'condition_attribute': alert.condition_attribute,
                                    'condition_operator': alert.condition_operator,
                                    'condition_number': alert.condition_number
                                })
                        except Exception as e:
                            self.logger.warning(f"Error processing alert {alert.id}: {str(e)}")
                            continue
                except Exception as e:
                    self.logger.error(f"Error loading alerts for journal: {str(e)}", exc_info=True)
            
            # Load Cash Flows
            if 'cash_flow' in entity_types:
                # Convert datetime to date for comparison
                start_date_only = start_date.date() if isinstance(start_date, datetime) else start_date
                end_date_only = end_date.date() if isinstance(end_date, datetime) else end_date
                
                cash_flows = self.db_session.query(CashFlow).options(
                    joinedload(CashFlow.account),
                    joinedload(CashFlow.currency)
                ).filter(
                    CashFlow.user_id == user_id,
                    CashFlow.date >= start_date_only,
                    CashFlow.date <= end_date_only
                ).all()
                self.logger.info(f"Loaded {len(cash_flows)} cash flows for journal")
                
                for cash_flow in cash_flows:
                    entry_date = cash_flow.date or cash_flow.created_at
                    if entry_date:
                        # Convert date to datetime for consistency
                        if isinstance(entry_date, date) and not isinstance(entry_date, datetime):
                            entry_date = datetime.combine(entry_date, datetime.min.time())
                            if entry_date.tzinfo is None:
                                entry_date = entry_date.replace(tzinfo=timezone.utc)
                        
                        entries.append({
                            'entity_type': 'cash_flow',
                            'entity_id': cash_flow.id,
                            'date': entry_date.isoformat() if isinstance(entry_date, datetime) else str(entry_date),
                            'created_at': cash_flow.created_at.isoformat() if cash_flow.created_at else None,
                            'account_id': cash_flow.trading_account_id,
                            'account_name': cash_flow.account.name if cash_flow.account else None,
                            'type': cash_flow.type,
                            'amount': cash_flow.amount,
                            'fee_amount': cash_flow.fee_amount,
                            'currency_id': cash_flow.currency_id,
                            'description': cash_flow.description,
                            'source': cash_flow.source
                        })
            
            # Load Trade Plans
            if 'trade_plan' in entity_types:
                trade_plans = self.db_session.query(TradePlan).options(
                    joinedload(TradePlan.ticker),
                    joinedload(TradePlan.account)
                ).filter(
                    TradePlan.user_id == user_id,
                    TradePlan.created_at >= start_date,
                    TradePlan.created_at <= end_date
                ).all()
                self.logger.info(f"Loaded {len(trade_plans)} trade plans for journal")
                
                for trade_plan in trade_plans:
                    entry_date = trade_plan.created_at or trade_plan.cancelled_at
                    if entry_date:
                        entries.append({
                            'entity_type': 'trade_plan',
                            'entity_id': trade_plan.id,
                            'date': entry_date.isoformat() if isinstance(entry_date, datetime) else str(entry_date),
                            'created_at': trade_plan.created_at.isoformat() if trade_plan.created_at else None,
                            'ticker_id': trade_plan.ticker_id,
                            'ticker_symbol': trade_plan.ticker.symbol if trade_plan.ticker else None,
                            'account_id': trade_plan.trading_account_id,
                            'account_name': trade_plan.account.name if trade_plan.account else None,
                            'status': trade_plan.status,
                            'side': trade_plan.side,
                            'investment_type': trade_plan.investment_type,
                            'planned_amount': trade_plan.planned_amount,
                            'entry_price': trade_plan.entry_price,
                            'cancelled_at': trade_plan.cancelled_at.isoformat() if trade_plan.cancelled_at else None,
                            'subtype': 'trade_plan_cancelled' if trade_plan.status == 'cancelled' else 'trade_plan_created'
                        })
            
            # Sort entries by date (newest first)
            entries.sort(key=lambda x: x.get('date', ''), reverse=True)
            
            # Log summary by entity type
            entries_by_type = {}
            for entry in entries:
                entity_type = entry.get('entity_type', 'unknown')
                entries_by_type[entity_type] = entries_by_type.get(entity_type, 0) + 1
            
            self.logger.info(f"Journal entries aggregated: total={len(entries)}, by_type={entries_by_type}")
            
            return {
                'entries': entries,
                'count': len(entries),
                'is_valid': True
            }
            
        except Exception as e:
            self.logger.error(f"Error aggregating journal entries: {str(e)}", exc_info=True)
            return {
                'entries': [],
                'count': 0,
                'is_valid': False,
                'error': str(e)
            }
    
    def calculate_journal_statistics(
        self,
        user_id: int,
        date_range: Dict[str, datetime],
        entity_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate journal statistics for a date range.
        
        Implementation Date: 07.12.2025
        Status: ✅ Fully Implemented
        
        Args:
            user_id: User ID
            date_range: Date range dictionary with 'start_date' and 'end_date'
            entity_type: Optional entity type filter ('trade', 'execution', 'note', etc.)
        
        Returns:
            Dict with:
                - total_entries: Total number of entries
                - by_type: Dict with counts per entity type
                - is_valid: bool
        
        Example:
            >>> service = HistoricalDataBusinessService(db_session=db)
            >>> result = service.calculate_journal_statistics(
            ...     user_id=1,
            ...     date_range={'start_date': datetime(2025, 1, 1), 'end_date': datetime(2025, 1, 31)},
            ...     entity_type='trade'
            ... )
            >>> print(result['total_entries'])  # Total count
            >>> print(result['by_type'])  # Counts by type
        """
        self.log_business_event('calculate_journal_statistics', {
            'user_id': user_id,
            'date_range': date_range,
            'entity_type': entity_type
        })
        
        if not self.db_session:
            return {
                'total_entries': 0,
                'by_type': {},
                'is_valid': False,
                'error': 'Database session not available'
            }
        
        try:
            start_date = date_range.get('start_date')
            end_date = date_range.get('end_date')
            
            if not start_date or not end_date:
                return {
                    'total_entries': 0,
                    'by_type': {},
                    'is_valid': False,
                    'error': 'start_date and end_date are required'
                }
            
            # Determine which entity types to count
            entity_types_to_count = ['trade', 'execution', 'note', 'alert', 'cash_flow', 'trade_plan']
            if entity_type and entity_type != 'all':
                entity_types_to_count = [entity_type]
            
            by_type = {}
            total_entries = 0
            
            # Count Trades
            if 'trade' in entity_types_to_count:
                trade_count = self.db_session.query(func.count(Trade.id)).filter(
                    Trade.user_id == user_id,
                    Trade.created_at >= start_date,
                    Trade.created_at <= end_date
                ).scalar() or 0
                by_type['trade'] = trade_count
                total_entries += trade_count
            
            # Count Executions
            if 'execution' in entity_types_to_count:
                execution_count = self.db_session.query(func.count(Execution.id)).filter(
                    Execution.user_id == user_id,
                    Execution.date >= start_date,
                    Execution.date <= end_date
                ).scalar() or 0
                by_type['execution'] = execution_count
                total_entries += execution_count
            
            # Count Notes
            if 'note' in entity_types_to_count:
                note_count = self.db_session.query(func.count(Note.id)).filter(
                    Note.user_id == user_id,
                    Note.created_at >= start_date,
                    Note.created_at <= end_date
                ).scalar() or 0
                by_type['note'] = note_count
                total_entries += note_count
            
            # Count Alerts
            if 'alert' in entity_types_to_count:
                alert_count = self.db_session.query(func.count(Alert.id)).filter(
                    Alert.user_id == user_id,
                    or_(
                        Alert.created_at >= start_date,
                        Alert.triggered_at >= start_date if Alert.triggered_at else False
                    ),
                    or_(
                        Alert.created_at <= end_date,
                        Alert.triggered_at <= end_date if Alert.triggered_at else False
                    )
                ).scalar() or 0
                by_type['alert'] = alert_count
                total_entries += alert_count
            
            # Count Cash Flows
            if 'cash_flow' in entity_types_to_count:
                cash_flow_count = self.db_session.query(func.count(CashFlow.id)).filter(
                    CashFlow.user_id == user_id,
                    CashFlow.date >= start_date.date() if isinstance(start_date, datetime) else start_date,
                    CashFlow.date <= end_date.date() if isinstance(end_date, datetime) else end_date
                ).scalar() or 0
                by_type['cash_flow'] = cash_flow_count
                total_entries += cash_flow_count
            
            # Count Trade Plans
            if 'trade_plan' in entity_types_to_count:
                trade_plan_count = self.db_session.query(func.count(TradePlan.id)).filter(
                    TradePlan.user_id == user_id,
                    TradePlan.created_at >= start_date,
                    TradePlan.created_at <= end_date
                ).scalar() or 0
                by_type['trade_plan'] = trade_plan_count
                total_entries += trade_plan_count
            
            return {
                'total_entries': total_entries,
                'by_type': by_type,
                'is_valid': True
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating journal statistics: {str(e)}", exc_info=True)
            return {
                'total_entries': 0,
                'by_type': {},
                'is_valid': False,
                'error': str(e)
            }
    
    def calculate_activity_stats(
        self,
        user_id: int,
        date_range: Dict[str, datetime],
        view_mode: str = 'daily',
        entity_type: Optional[str] = None,
        ticker_symbol: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate activity statistics for a date range.
        
        Returns activity volume (executions and planning entries) grouped by day or week.
        
        Implementation Date: 07.12.2025
        Status: ✅ Fully Implemented
        
        Args:
            user_id: User ID
            date_range: Date range dictionary with 'start_date' and 'end_date'
            view_mode: 'daily' or 'weekly' (default: 'daily')
            entity_type: Optional entity type filter
            ticker_symbol: Optional ticker symbol filter
        
        Returns:
            Dict with:
                - stats: List of activity stats per period
                - view_mode: 'daily' or 'weekly'
                - is_valid: bool
        
        Example:
            >>> service = HistoricalDataBusinessService(db_session=db)
            >>> result = service.calculate_activity_stats(
            ...     user_id=1,
            ...     date_range={'start_date': datetime(2025, 1, 1), 'end_date': datetime(2025, 1, 31)},
            ...     view_mode='daily'
            ... )
            >>> print(result['stats'])  # List of {date, executions_count, planning_count}
        """
        self.log_business_event('calculate_activity_stats', {
            'user_id': user_id,
            'date_range': date_range,
            'view_mode': view_mode,
            'entity_type': entity_type,
            'ticker_symbol': ticker_symbol
        })
        
        if not self.db_session:
            return {
                'stats': [],
                'view_mode': view_mode,
                'is_valid': False,
                'error': 'Database session not available'
            }
        
        try:
            start_date = date_range.get('start_date')
            end_date = date_range.get('end_date')
            
            if not start_date or not end_date:
                return {
                    'stats': [],
                    'view_mode': view_mode,
                    'is_valid': False,
                    'error': 'start_date and end_date are required'
                }
            
            # CRITICAL: Always load ALL entity types for activity stats calculation
            # The entity_type filter is only for frontend display, not for graph data
            # This ensures accurate planning_count calculation across all entity types
            journal_result = self.aggregate_journal_entries(
                user_id=user_id,
                date_range=date_range,
                entity_types=None  # Always load all entity types for accurate graph
            )
            
            entries = journal_result.get('entries', [])
            
            # Filter by ticker_symbol if provided
            if ticker_symbol:
                entries = [e for e in entries if e.get('ticker_symbol') == ticker_symbol]
            
            # Group entries by period (day or week)
            stats_by_period = {}
            
            for entry in entries:
                entry_date_str = entry.get('date') or entry.get('created_at')
                if not entry_date_str:
                    continue
                
                # Parse entry date
                if isinstance(entry_date_str, str):
                    entry_date = datetime.fromisoformat(entry_date_str.replace('Z', '+00:00'))
                else:
                    entry_date = entry_date_str
                
                if entry_date.tzinfo is None:
                    entry_date = entry_date.replace(tzinfo=timezone.utc)
                
                # Determine period key based on view_mode
                if view_mode == 'weekly':
                    # Get week start (Monday)
                    days_since_monday = entry_date.weekday()
                    week_start = entry_date - timedelta(days=days_since_monday)
                    period_key = week_start.strftime('%Y-%W')  # Year-Week format
                    period_display = week_start.strftime('%Y-%m-%d')
                else:
                    # Daily
                    period_key = entry_date.strftime('%Y-%m-%d')
                    period_display = period_key
                
                # Initialize period if not exists
                if period_key not in stats_by_period:
                    stats_by_period[period_key] = {
                        'period': period_display,
                        'executions_count': 0,
                        'planning_count': 0
                    }
                
                # Count executions (trading level)
                if entry.get('entity_type') == 'execution':
                    stats_by_period[period_key]['executions_count'] += 1
                
                # Count planning entries (trade_plan, trade created, note, alert)
                entity_type_entry = entry.get('entity_type')
                if entity_type_entry in ['trade_plan', 'note', 'alert']:
                    stats_by_period[period_key]['planning_count'] += 1
                elif entity_type_entry == 'trade' and entry.get('subtype') == 'trade_created':
                    stats_by_period[period_key]['planning_count'] += 1
            
            # Convert to sorted list
            stats_list = sorted(
                stats_by_period.values(),
                key=lambda x: x['period']
            )
            
            return {
                'stats': stats_list,
                'view_mode': view_mode,
                'is_valid': True
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating activity stats: {str(e)}", exc_info=True)
            return {
                'stats': [],
                'view_mode': view_mode,
                'is_valid': False,
                'error': str(e)
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
    # Trade Timeline and Chart Calculations
    # ========================================================================
    
    def calculate_trade_timeline(
        self,
        trade_id: int,
        user_id: int,
        include_durations: bool = True
    ) -> Dict[str, Any]:
        """
        Calculate complete timeline for a trade with all linked items and calculations.
        
        This method:
        - Loads all linked items (Trade, Trade Plan, Execution, Note, Alert, Cash Flow, Alert Activation)
        - Sorts by date
        - Calculates position size, value, average price, realized/unrealized P/L for each point
        - Calculates duration between consecutive items
        
        Args:
            trade_id: Trade ID
            user_id: User ID (for authorization)
            include_durations: Whether to include duration calculations between items
        
        Returns:
            Dict with:
                - timeline: List of timeline items with calculations
                - metadata: Trade info, date range, etc.
                - is_valid: bool
        """
        if not self.db_session:
            return {
                'timeline': [],
                'metadata': {},
                'is_valid': False,
                'error': 'Database session not available'
            }
        
        try:
            from services.entity_details_service import EntityDetailsService
            
            # Verify trade exists and belongs to user
            trade = self.db_session.query(Trade).filter(
                and_(
                    Trade.id == trade_id,
                    Trade.user_id == user_id
                )
            ).first()
            
            if not trade:
                return {
                    'timeline': [],
                    'metadata': {},
                    'is_valid': False,
                    'error': f'Trade {trade_id} not found or access denied'
                }
            
            # Get all linked items
            linked_items = EntityDetailsService.get_linked_items(
                self.db_session,
                'trade',
                trade_id
            )
            
            if not linked_items:
                return {
                    'timeline': [],
                    'metadata': {
                        'trade_id': trade_id,
                        'trade_symbol': trade.ticker.symbol if trade.ticker else None,
                        'date_range': {
                            'start': trade.created_at.isoformat() if trade.created_at else None,
                            'end': trade.updated_at.isoformat() if trade.updated_at else None
                        }
                    },
                    'is_valid': True
                }
            
            # Convert linked items to timeline format and sort by date
            timeline_data = []
            for item in linked_items:
                # Extract date from item - prioritize execution_date, then date, then created_at
                item_date = None
                if item.get('execution_date'):
                    item_date = item['execution_date']
                elif item.get('date'):
                    item_date = item['date']
                elif item.get('created_at'):
                    item_date = item['created_at']
                elif item.get('triggered_at'):  # For alerts
                    item_date = item['triggered_at']
                
                if not item_date:
                    continue
                
                # Normalize date - handle both datetime objects and ISO strings
                if isinstance(item_date, datetime):
                    # Already a datetime object
                    if item_date.tzinfo is None:
                        item_date = item_date.replace(tzinfo=timezone.utc)
                elif isinstance(item_date, str):
                    try:
                        item_date = datetime.fromisoformat(item_date.replace('Z', '+00:00'))
                        if item_date.tzinfo is None:
                            item_date = item_date.replace(tzinfo=timezone.utc)
                    except Exception as e:
                        logger.warning(f"Failed to parse date for item {item.get('id')}: {item_date}, error: {e}")
                        continue
                else:
                    # Unknown date format
                    logger.warning(f"Unknown date format for item {item.get('id')}: {type(item_date)}")
                    continue
                
                # Determine display type name
                item_type_raw = item.get('type') or item.get('entity_type', 'Unknown')
                # Map entity types to display names
                type_display_map = {
                    'execution': 'Execution',
                    'note': 'Note',
                    'alert': 'Alert',
                    'cash_flow': 'Cash Flow',
                    'trade_plan': 'Trade Plan',
                    'trade': 'Trade',
                    'trading_account': 'Trading Account',
                    'ticker': 'Ticker'
                }
                type_display = type_display_map.get(item_type_raw.lower(), item_type_raw)
                
                # Check if alert is triggered
                if item_type_raw.lower() == 'alert' and item.get('is_triggered') and item.get('triggered_at'):
                    type_display = 'Alert Activation'
                
                timeline_data.append({
                    'id': item.get('id'),
                    'type': type_display,
                    'date': item_date,  # Keep as datetime object
                    'title': item.get('title') or item.get('name') or f"{type_display} #{item.get('id')}",
                    'displayText': item.get('description') or item.get('title') or item.get('name') or f"{type_display} #{item.get('id')}",
                    'data': item,  # Keep full item data
                    'side': item.get('side') or item.get('action'),
                    'quantity': item.get('quantity'),
                    'price': item.get('price'),
                    'amount': item.get('amount'),
                    'pl': item.get('realized_pl') or item.get('pl'),
                    'duration_from_previous': None  # Will be calculated later
                })
            
            # Sort by date
            timeline_data.sort(key=lambda x: x['date'])
            
            # Calculate durations if requested
            if include_durations and len(timeline_data) > 1:
                for i in range(1, len(timeline_data)):
                    duration_ms = (timeline_data[i]['date'] - timeline_data[i-1]['date']).total_seconds() * 1000
                    timeline_data[i]['duration_from_previous'] = duration_ms
            
            # Calculate position metrics for each timeline point
            current_position = 0.0
            cumulative_realized_pl = 0.0
            total_bought_quantity = 0.0
            total_bought_amount = 0.0
            total_sold_quantity = 0.0
            total_sold_amount = 0.0
            
            for item in timeline_data:
                item_type = item['type']
                item_data = item['data']
                
                # Update position based on execution
                if item_type == 'execution' or item_type == 'Execution':
                    action = item_data.get('action') or item_data.get('side', '').lower()
                    quantity = float(item_data.get('quantity', 0) or 0)
                    price = float(item_data.get('price', 0) or 0)
                    
                    if action == 'buy' or action == 'long':
                        current_position += quantity
                        total_bought_quantity += quantity
                        total_bought_amount += quantity * price
                    elif action == 'sell' or action == 'short':
                        current_position -= quantity
                        total_sold_quantity += quantity
                        total_sold_amount += quantity * price
                        # Add realized P/L if available
                        if item_data.get('realized_pl'):
                            cumulative_realized_pl += float(item_data.get('realized_pl'))
                
                # Calculate metrics for this point
                average_price = (total_bought_amount / total_bought_quantity) if total_bought_quantity > 0 else 0.0
                position_value = current_position * average_price if current_position > 0 else 0.0
                
                # Calculate unrealized P/L using historical market price at this date
                unrealized_pl = 0.0
                if current_position != 0 and trade.ticker_id:
                    # Get market price at this timeline point's date
                    market_price = self._get_market_price_at_date(
                        self.db_session,
                        trade.ticker_id,
                        item['date']
                    )
                    if market_price and average_price > 0:
                        current_cost = abs(current_position) * average_price
                        market_value = abs(current_position) * market_price
                        # Determine side based on position
                        if current_position > 0:
                            # Long position
                            unrealized_pl = market_value - current_cost
                        elif current_position < 0:
                            # Short position
                            unrealized_pl = current_cost - market_value
                
                # Add calculated metrics to item
                item['positionSize'] = current_position
                item['positionValue'] = position_value
                item['averagePrice'] = average_price
                item['realizedPL'] = cumulative_realized_pl
                item['unrealizedPL'] = unrealized_pl
                item['totalPL'] = cumulative_realized_pl + unrealized_pl
                item['totalBoughtQuantity'] = total_bought_quantity
                item['totalSoldQuantity'] = total_sold_quantity
            
            # Get date range
            start_date = timeline_data[0]['date'] if timeline_data else (trade.created_at or datetime.now(timezone.utc))
            end_date = timeline_data[-1]['date'] if timeline_data else (trade.updated_at or datetime.now(timezone.utc))
            
            # Keep datetime objects - DateNormalizationService will convert them to DateEnvelope
            # Don't convert to ISO strings here - let the normalization service handle it
            return {
                'timeline': timeline_data,
                'metadata': {
                    'trade_id': trade_id,
                    'trade_symbol': trade.ticker.symbol if trade.ticker else None,
                    'ticker_id': trade.ticker_id,
                    'account_id': trade.trading_account_id,
                    'date_range': {
                        'start': start_date,
                        'end': end_date
                    },
                    'total_items': len(timeline_data),
                    'current_position': current_position,
                    'total_realized_pl': cumulative_realized_pl
                },
                'is_valid': True
            }
            
        except Exception as e:
            logger.error(f"Error calculating trade timeline for trade {trade_id}: {str(e)}", exc_info=True)
            return {
                'timeline': [],
                'metadata': {},
                'is_valid': False,
                'error': str(e)
            }
    
    def calculate_trade_chart_data(
        self,
        trade_id: int,
        user_id: int,
        days_before: int = 7,
        days_after: int = 7
    ) -> Dict[str, Any]:
        """
        Calculate chart data for a trade including market prices, position data, and P/L.
        
        Args:
            trade_id: Trade ID
            user_id: User ID (for authorization)
            days_before: Days before first record to include
            days_after: Days after last record to include
        
        Returns:
            Dict with:
                - market_prices: List of market price data points
                - position_data: List of position size/value over time
                - pl_data: List of realized/unrealized P/L over time
                - is_valid: bool
        """
        if not self.db_session:
            return {
                'market_prices': [],
                'position_data': [],
                'pl_data': [],
                'is_valid': False,
                'error': 'Database session not available'
            }
        
        try:
            # First get timeline to determine date range
            timeline_result = self.calculate_trade_timeline(trade_id, user_id, include_durations=False)
            
            if not timeline_result['is_valid']:
                return {
                    'market_prices': [],
                    'position_data': [],
                    'pl_data': [],
                    'is_valid': False,
                    'error': timeline_result.get('error', 'Failed to calculate timeline')
                }
            
            timeline = timeline_result['timeline']
            metadata = timeline_result['metadata']
            
            if not timeline:
                return {
                    'market_prices': [],
                    'position_data': [],
                    'pl_data': [],
                    'is_valid': True,
                    'message': 'No timeline data available'
                }
            
            # Get date range
            # Handle both datetime objects and ISO strings
            start_date = timeline[0]['date']
            end_date = timeline[-1]['date']
            
            # Convert to datetime if string
            if isinstance(start_date, str):
                start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            
            # Ensure timezone-aware
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
            
            # Extend range with days_before and days_after
            from datetime import timedelta
            chart_start = start_date - timedelta(days=days_before)
            chart_end = end_date + timedelta(days=days_after)
            
            # Get ticker_id from trade
            trade = self.db_session.query(Trade).filter(Trade.id == trade_id).first()
            if not trade or not trade.ticker_id:
                return {
                    'market_prices': [],
                    'position_data': [],
                    'pl_data': [],
                    'is_valid': False,
                    'error': 'Trade or ticker not found'
                }
            
            ticker_id = trade.ticker_id
            
            # Get historical market prices
            from models.external_data import MarketDataQuote, ExternalDataProvider
            from sqlalchemy import desc
            
            provider = self.db_session.query(ExternalDataProvider).filter(
                ExternalDataProvider.name == 'yahoo_finance'
            ).first()
            
            market_prices = []
            if provider:
                quotes = self.db_session.query(MarketDataQuote).filter(
                    and_(
                        MarketDataQuote.ticker_id == ticker_id,
                        MarketDataQuote.provider_id == provider.id,
                        MarketDataQuote.asof_utc >= chart_start,
                        MarketDataQuote.asof_utc <= chart_end
                    )
                ).order_by(MarketDataQuote.asof_utc.asc()).all()
                
                for quote in quotes:
                    # Keep datetime object - DateNormalizationService will convert it
                    market_prices.append({
                        'date': quote.asof_utc,  # Keep as datetime object
                        'price': float(quote.close_price if quote.close_price else quote.price),
                        'open': float(quote.open_price) if quote.open_price else None,
                        'high': float(quote.high_price) if quote.high_price else None,
                        'low': float(quote.low_price) if quote.low_price else None,
                        'close': float(quote.close_price) if quote.close_price else None,
                        'volume': int(quote.volume) if quote.volume else None
                    })
            
            # Build position and P/L data from timeline
            position_data = []
            pl_data = []
            
            for item in timeline:
                # Keep datetime object - DateNormalizationService will convert it
                item_date = item['date']
                # Ensure it's a datetime object
                if isinstance(item_date, str):
                    item_date = datetime.fromisoformat(item_date.replace('Z', '+00:00'))
                if item_date.tzinfo is None:
                    item_date = item_date.replace(tzinfo=timezone.utc)
                
                position_data.append({
                    'date': item_date,  # Keep as datetime object
                    'positionSize': item.get('positionSize', 0),
                    'positionValue': item.get('positionValue', 0),
                    'averagePrice': item.get('averagePrice', 0)
                })
                
                pl_data.append({
                    'date': item_date,  # Keep as datetime object
                    'realizedPL': item.get('realizedPL', 0),
                    'unrealizedPL': item.get('unrealizedPL', 0),
                    'totalPL': item.get('totalPL', 0)
                })
            
            return {
                'market_prices': market_prices,
                'position_data': position_data,
                'pl_data': pl_data,
                'metadata': {
                    'trade_id': trade_id,
                    'ticker_id': ticker_id,
                    'date_range': {
                        'start': chart_start,  # Keep as datetime object
                        'end': chart_end  # Keep as datetime object
                    },
                    'days_before': days_before,
                    'days_after': days_after
                },
                'is_valid': True
            }
            
        except Exception as e:
            logger.error(f"Error calculating trade chart data for trade {trade_id}: {str(e)}", exc_info=True)
            return {
                'market_prices': [],
                'position_data': [],
                'pl_data': [],
                'is_valid': False,
                'error': str(e)
            }
    
    def calculate_trade_statistics_detailed(
        self,
        trade_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """
        Calculate detailed statistics for a trade.
        
        Args:
            trade_id: Trade ID
            user_id: User ID (for authorization)
        
        Returns:
            Dict with detailed statistics
        """
        if not self.db_session:
            return {
                'statistics': {},
                'is_valid': False,
                'error': 'Database session not available'
            }
        
        try:
            # Get trade
            trade = self.db_session.query(Trade).filter(
                and_(
                    Trade.id == trade_id,
                    Trade.user_id == user_id
                )
            ).first()
            
            if not trade:
                return {
                    'statistics': {},
                    'is_valid': False,
                    'error': f'Trade {trade_id} not found or access denied'
                }
            
            # Get timeline for calculations
            timeline_result = self.calculate_trade_timeline(trade_id, user_id, include_durations=True)
            
            if not timeline_result['is_valid']:
                return {
                    'statistics': {},
                    'is_valid': False,
                    'error': timeline_result.get('error', 'Failed to calculate timeline')
                }
            
            timeline = timeline_result['timeline']
            metadata = timeline_result['metadata']
            
            # Calculate statistics
            executions = [item for item in timeline if item['type'] == 'Execution']
            execution_count = len(executions)
            
            # Calculate duration
            if timeline:
                start_date = timeline[0]['date']
                end_date = timeline[-1]['date']
                duration_days = (end_date - start_date).days
            else:
                duration_days = 0
            
            # Calculate planning wait days (from trade plan to first execution)
            trade_plans = [item for item in timeline if item['type'] == 'Trade Plan']
            planning_wait_days = 0
            if trade_plans and executions:
                plan_date = trade_plans[0]['date']
                first_execution_date = executions[0]['date']
                planning_wait_days = (first_execution_date - plan_date).days if first_execution_date > plan_date else 0
            
            # Get total P/L from metadata
            total_realized_pl = metadata.get('total_realized_pl', 0)
            current_position = metadata.get('current_position', 0)
            
            # Calculate average execution price
            total_execution_amount = 0.0
            total_execution_quantity = 0.0
            for exec_item in executions:
                exec_data = exec_item['data']
                quantity = float(exec_data.get('quantity', 0))
                price = float(exec_data.get('price', 0))
                total_execution_amount += quantity * price
                total_execution_quantity += quantity
            
            average_execution_price = (total_execution_amount / total_execution_quantity) if total_execution_quantity > 0 else 0.0
            
            # Calculate total P/L percent (if we have entry price)
            total_pl_percent = 0.0
            if executions and total_execution_quantity > 0:
                # Use average price as entry price
                entry_price = average_execution_price
                # For P/L percent, we need exit price or current price
                # For now, use realized P/L only
                if entry_price > 0:
                    total_pl_percent = (total_realized_pl / (entry_price * total_execution_quantity)) * 100
            
            return {
                'statistics': {
                    'durationDays': duration_days,
                    'planningWaitDays': planning_wait_days,
                    'totalPL': total_realized_pl,
                    'totalPLPercent': total_pl_percent,
                    'executionCount': execution_count,
                    'averageExecutionPrice': average_execution_price,
                    'currentPosition': current_position,
                    'totalBoughtQuantity': metadata.get('totalBoughtQuantity', 0),
                    'totalSoldQuantity': metadata.get('totalSoldQuantity', 0)
                },
                'metadata': {
                    'trade_id': trade_id,
                    'ticker_id': trade.ticker_id,
                    'account_id': trade.trading_account_id
                },
                'is_valid': True
            }
            
        except Exception as e:
            logger.error(f"Error calculating trade statistics for trade {trade_id}: {str(e)}", exc_info=True)
            return {
                'statistics': {},
                'is_valid': False,
                'error': str(e)
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
        try:
            from models.external_data import MarketDataQuote, ExternalDataProvider
            from sqlalchemy import desc
            
            # Get provider ID for Yahoo Finance
            provider = db.query(ExternalDataProvider).filter(
                ExternalDataProvider.name == 'yahoo_finance'
            ).first()
            
            if not provider:
                logger.warning(f"Yahoo Finance provider not found for market price lookup")
                return None
            
            # Query for the closest quote before or at target_date
            # Use close_price if available, otherwise use price
            quote = db.query(MarketDataQuote).filter(
                and_(
                    MarketDataQuote.ticker_id == ticker_id,
                    MarketDataQuote.provider_id == provider.id,
                    MarketDataQuote.asof_utc <= target_date
                )
            ).order_by(desc(MarketDataQuote.asof_utc)).first()
            
            if quote:
                # Prefer close_price for historical data, fallback to price
                return float(quote.close_price if quote.close_price else quote.price)
            
            return None
        except Exception as e:
            logger.error(f"Error getting market price at date for ticker {ticker_id}: {str(e)}", exc_info=True)
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

