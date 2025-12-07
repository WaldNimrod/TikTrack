"""
Historical Data Business Logic Service - TikTrack
==================================================

Business logic for historical data calculations:
- Portfolio state at specific dates
- Trade history aggregations
- Trading journal entries

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
- documentation/03-DEVELOPMENT/PLANS/HISTORICAL_PAGES_FULL_IMPLEMENTATION_PLAN.md
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime, date, timezone
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc

from .base_business_service import BaseBusinessService
from .business_rules_registry import business_rules_registry
from .trade_business_service import TradeBusinessService
from .statistics_business_service import StatisticsBusinessService
from .note_business_service import NoteBusinessService
from ..position_portfolio_service import PositionPortfolioService
from services.date_normalization_service import DateNormalizationService
from models.execution import Execution
from models.trade import Trade
from models.note import Note
from models.trading_account import TradingAccount
from models.external_data import MarketDataQuote
from models.ticker import Ticker

logger = logging.getLogger(__name__)


class HistoricalDataBusinessService(BaseBusinessService):
    """
    Business logic service for historical data calculations.
    
    Handles all historical data-related calculations:
    - Portfolio state at specific dates
    - Trade history aggregations
    - Trading journal entries
    """
    
    @property
    def table_name(self) -> Optional[str]:
        """Historical data service has no database table - it's a calculation service."""
        return None
    
    def __init__(self, db_session: Optional[Session] = None):
        """Initialize the historical data business service."""
        super().__init__(db_session)
        self.registry = business_rules_registry
        self.trade_service = TradeBusinessService(db_session)
        self.statistics_service = StatisticsBusinessService(db_session)
        self.note_service = NoteBusinessService(db_session)
    
    # ========================================================================
    # Validation
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate historical data request parameters.
        
        Validation order (CRITICAL - must follow this order):
        1. Database Constraints (ValidationService) - checks NOT NULL, UNIQUE, FOREIGN KEY, ENUM, RANGE, CHECK
        2. Business Rules Registry - checks min/max, allowed_values, required (only if not in Constraints)
        3. Complex Business Rules - checks business logic (e.g., date ranges, user authorization)
        
        Args:
            data: Historical data request dictionary with keys:
                - user_id: int (required, positive)
                - account_id: int (optional, positive)
                - start_date: datetime/str (required, ISO format)
                - end_date: datetime/str (required, ISO format, must be >= start_date)
                - date: datetime/str (optional, for single date queries)
                
        Returns:
            Dict with:
                - is_valid: bool
                - errors: List[str]
                
        Example:
            result = service.validate({
                'user_id': 1,
                'account_id': 2,
                'start_date': '2025-01-01',
                'end_date': '2025-01-31'
            })
        """
        self.log_business_event('historical_data_validation', data)
        
        errors = []
        
        # Step 1: Validate against database constraints (FIRST!)
        # Note: Since this service has no table_name, constraint validation is skipped
        is_valid, constraint_errors = self.validate_with_constraints(data)
        if not is_valid:
            errors.extend(constraint_errors)
            self.logger.debug(f"Constraint validation found {len(constraint_errors)} errors")
        
        # Step 2: Validate against business rules registry (SECOND!)
        # Validate required fields
        required_fields = ['user_id']
        for field in required_fields:
            if field not in data or data[field] is None:
                errors.append(f"{field} is required")
        
        # Validate field values using registry
        from .utils.edge_cases_utils import is_empty_value
        
        for field, value in data.items():
            if is_empty_value(value):
                continue
            
            # Validate user_id
            if field == 'user_id':
                if not isinstance(value, int) or value <= 0:
                    errors.append(f"{field} must be a positive integer")
            
            # Validate account_id
            if field == 'account_id' and value is not None:
                if not isinstance(value, int) or value <= 0:
                    errors.append(f"{field} must be a positive integer")
        
        # Step 3: Complex business rules (THIRD!)
        # Validate date ranges
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date:
            try:
                # Parse dates if strings
                if isinstance(start_date, str):
                    start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                if isinstance(end_date, str):
                    end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                
                # Ensure timezone-aware
                if start_date.tzinfo is None:
                    start_date = start_date.replace(tzinfo=timezone.utc)
                if end_date.tzinfo is None:
                    end_date = end_date.replace(tzinfo=timezone.utc)
                
                if end_date < start_date:
                    errors.append("end_date must be >= start_date")
                
                # Limit date range to prevent heavy queries (max 1 year)
                date_diff = (end_date - start_date).days
                if date_diff > 365:
                    errors.append("Date range cannot exceed 365 days")
                    
            except (ValueError, AttributeError) as e:
                errors.append(f"Invalid date format: {str(e)}")
        
        # Validate single date
        single_date = data.get('date')
        if single_date:
            try:
                if isinstance(single_date, str):
                    single_date = datetime.fromisoformat(single_date.replace('Z', '+00:00'))
                if single_date.tzinfo is None:
                    single_date = single_date.replace(tzinfo=timezone.utc)
            except (ValueError, AttributeError) as e:
                errors.append(f"Invalid date format: {str(e)}")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform historical data calculations.
        
        Args:
            data: Input data for calculations
            
        Returns:
            Dict with calculated values
        """
        self.log_business_event('historical_data_calculation', data)
        
        # This is a placeholder - actual calculations are in specific methods
        return {
            'calculated': True,
            'data': data
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
        
        This method calculates what the portfolio looked like at a specific point in time,
        including all positions, market values, and P/L calculations.
        
        Args:
            user_id: User ID
            account_id: Trading account ID (None for all accounts)
            target_date: Target date for snapshot (timezone-aware datetime)
            include_closed: Whether to include closed positions
            
        Returns:
            Dict with portfolio state data:
                - positions: List of positions at target_date
                - total_value: Total portfolio value
                - total_pl: Total P/L
                - total_pl_percent: Total P/L percentage
                - snapshot_date: Target date
                - account_id: Account ID (or None for all accounts)
                
        Example:
            state = service.calculate_portfolio_state_at_date(
                user_id=1,
                account_id=2,
                target_date=datetime(2025, 1, 15, tzinfo=timezone.utc),
                include_closed=False
            )
        """
        self.log_business_event('portfolio_state_at_date', {
            'user_id': user_id,
            'account_id': account_id,
            'target_date': target_date.isoformat() if isinstance(target_date, datetime) else str(target_date),
            'include_closed': include_closed
        })
        
        if not self.db_session:
            return {
                'error': 'Database session required',
                'is_valid': False
            }
        
        try:
            # Ensure timezone-aware datetime
            if isinstance(target_date, str):
                target_date = datetime.fromisoformat(target_date.replace('Z', '+00:00'))
            if target_date.tzinfo is None:
                target_date = target_date.replace(tzinfo=timezone.utc)
            
            # Get all executions up to target_date
            query = self.db_session.query(Execution).filter(
                and_(
                    Execution.user_id == user_id,
                    Execution.date <= target_date
                )
            )
            
            if account_id:
                query = query.filter(Execution.trading_account_id == account_id)
            
            executions = query.order_by(Execution.date.asc(), Execution.created_at.asc()).all()
            
            if not executions:
                return {
                    'positions': [],
                    'total_value': 0.0,
                    'total_pl': 0.0,
                    'total_pl_percent': 0.0,
                    'snapshot_date': target_date.isoformat(),
                    'account_id': account_id,
                    'is_valid': True
                }
            
            # Group executions by ticker+account
            positions_by_key = {}
            
            for execution in executions:
                key = (execution.ticker_id, execution.trading_account_id)
                
                if key not in positions_by_key:
                    positions_by_key[key] = {
                        'ticker_id': execution.ticker_id,
                        'trading_account_id': execution.trading_account_id,
                        'executions': [],
                        'total_bought_quantity': 0.0,
                        'total_sold_quantity': 0.0,
                        'total_bought_amount': 0.0,
                        'total_sold_amount': 0.0,
                        'total_cost': 0.0,
                        'total_fees': 0.0,
                        'realized_pl': 0.0
                    }
                
                positions_by_key[key]['executions'].append(execution)
                
                # Calculate position metrics
                if execution.action in ['buy', 'short']:
                    positions_by_key[key]['total_bought_quantity'] += execution.quantity
                    positions_by_key[key]['total_bought_amount'] += execution.quantity * execution.price
                    positions_by_key[key]['total_cost'] += execution.quantity * execution.price + (execution.fee or 0)
                    positions_by_key[key]['total_fees'] += execution.fee or 0
                elif execution.action in ['sell', 'cover']:
                    positions_by_key[key]['total_sold_quantity'] += execution.quantity
                    positions_by_key[key]['total_sold_amount'] += execution.quantity * execution.price
                    positions_by_key[key]['total_fees'] += execution.fee or 0
                    if execution.realized_pl is not None:
                        positions_by_key[key]['realized_pl'] += execution.realized_pl
            
            # Calculate positions and get market prices at target_date
            positions = []
            total_value = 0.0
            total_pl = 0.0
            
            for key, position_data in positions_by_key.items():
                ticker_id, account_id_pos = key
                
                # Calculate net quantity
                net_quantity = position_data['total_bought_quantity'] - position_data['total_sold_quantity']
                
                # Skip closed positions if not included
                if not include_closed and net_quantity == 0:
                    continue
                
                # Get market price at target_date (or closest before)
                market_price_data = self._get_market_price_at_date(ticker_id, target_date)
                market_price = market_price_data['price'] if market_price_data else None
                
                # Calculate average price
                if position_data['total_bought_quantity'] > 0:
                    average_price = position_data['total_cost'] / position_data['total_bought_quantity']
                else:
                    average_price = 0.0
                
                # Calculate market value
                if market_price and net_quantity != 0:
                    market_value = abs(net_quantity) * market_price
                else:
                    market_value = 0.0
                
                # Calculate unrealized P/L
                current_cost = abs(net_quantity) * average_price if net_quantity != 0 else 0.0
                unrealized_pl = 0.0
                if net_quantity != 0 and market_price:
                    if net_quantity > 0:
                        unrealized_pl = market_value - current_cost
                    else:
                        unrealized_pl = current_cost - market_value
                
                # Get ticker info
                ticker = self.db_session.query(Ticker).filter(Ticker.id == ticker_id).first()
                
                position = {
                    'ticker_id': ticker_id,
                    'ticker_symbol': ticker.symbol if ticker else f'Ticker_{ticker_id}',
                    'trading_account_id': account_id_pos,
                    'quantity': net_quantity,
                    'side': 'long' if net_quantity > 0 else 'short' if net_quantity < 0 else 'closed',
                    'average_price': average_price,
                    'market_price': market_price,
                    'market_value': market_value,
                    'current_cost': current_cost,
                    'realized_pl': position_data['realized_pl'],
                    'unrealized_pl': unrealized_pl,
                    'total_pl': position_data['realized_pl'] + unrealized_pl,
                    'total_fees': position_data['total_fees']
                }
                
                positions.append(position)
                total_value += market_value
                total_pl += position['total_pl']
            
            # Calculate total P/L percentage
            total_cost = sum(p['current_cost'] for p in positions)
            total_pl_percent = (total_pl / total_cost * 100) if total_cost > 0 else 0.0
            
            return {
                'positions': positions,
                'total_value': total_value,
                'total_pl': total_pl,
                'total_pl_percent': total_pl_percent,
                'total_cost': total_cost,
                'snapshot_date': target_date.isoformat(),
                'account_id': account_id,
                'is_valid': True
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating portfolio state at date: {str(e)}", exc_info=True)
            return {
                'error': str(e),
                'is_valid': False
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
            account_id: Trading account ID (None for all accounts)
            start_date: Start date (timezone-aware datetime)
            end_date: End date (timezone-aware datetime)
            
        Returns:
            Dict with performance metrics:
                - start_state: Portfolio state at start_date
                - end_state: Portfolio state at end_date
                - performance: Performance metrics (change, change_percent)
        """
        self.log_business_event('portfolio_performance_range', {
            'user_id': user_id,
            'account_id': account_id,
            'start_date': start_date.isoformat() if isinstance(start_date, datetime) else str(start_date),
            'end_date': end_date.isoformat() if isinstance(end_date, datetime) else str(end_date)
        })
        
        try:
            # Ensure timezone-aware datetimes
            if isinstance(start_date, str):
                start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
            
            # Calculate states
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
                    'error': 'Failed to calculate portfolio states',
                    'is_valid': False
                }
            
            # Calculate performance
            start_value = start_state.get('total_value', 0.0)
            end_value = end_state.get('total_value', 0.0)
            value_change = end_value - start_value
            value_change_percent = (value_change / start_value * 100) if start_value > 0 else 0.0
            
            start_pl = start_state.get('total_pl', 0.0)
            end_pl = end_state.get('total_pl', 0.0)
            pl_change = end_pl - start_pl
            
            return {
                'start_state': start_state,
                'end_state': end_state,
                'performance': {
                    'value_change': value_change,
                    'value_change_percent': value_change_percent,
                    'pl_change': pl_change,
                    'start_value': start_value,
                    'end_value': end_value,
                    'start_pl': start_pl,
                    'end_pl': end_pl
                },
                'is_valid': True
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating portfolio performance range: {str(e)}", exc_info=True)
            return {
                'error': str(e),
                'is_valid': False
            }
    
    def calculate_portfolio_snapshot_series(
        self,
        user_id: int,
        account_id: Optional[int],
        dates: List[datetime]
    ) -> Dict[str, Any]:
        """
        Calculate portfolio snapshots for a series of dates.
        
        Args:
            user_id: User ID
            account_id: Trading account ID (None for all accounts)
            dates: List of dates to calculate snapshots for
            
        Returns:
            Dict with snapshots list:
                - snapshots: List of portfolio states for each date
        """
        self.log_business_event('portfolio_snapshot_series', {
            'user_id': user_id,
            'account_id': account_id,
            'dates_count': len(dates)
        })
        
        try:
            snapshots = []
            
            for date_item in dates:
                # Ensure timezone-aware datetime
                if isinstance(date_item, str):
                    date_item = datetime.fromisoformat(date_item.replace('Z', '+00:00'))
                if date_item.tzinfo is None:
                    date_item = date_item.replace(tzinfo=timezone.utc)
                
                snapshot = self.calculate_portfolio_state_at_date(
                    user_id=user_id,
                    account_id=account_id,
                    target_date=date_item,
                    include_closed=False
                )
                
                if snapshot.get('is_valid'):
                    snapshots.append(snapshot)
            
            return {
                'snapshots': snapshots,
                'count': len(snapshots),
                'is_valid': True
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating portfolio snapshot series: {str(e)}", exc_info=True)
            return {
                'error': str(e),
                'is_valid': False
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
            filters: Filter dictionary with keys:
                - account_id: Optional[int]
                - ticker_id: Optional[int]
                - start_date: Optional[datetime]
                - end_date: Optional[datetime]
                - status: Optional[str] ('open', 'closed', 'all')
                - investment_type: Optional[str]
            group_by: Optional grouping ('period', 'ticker', 'account')
            
        Returns:
            Dict with aggregated trade history
        """
        self.log_business_event('aggregate_trade_history', {
            'user_id': user_id,
            'filters': filters,
            'group_by': group_by
        })
        
        if not self.db_session:
            return {
                'error': 'Database session required',
                'is_valid': False
            }
        
        try:
            # Build query
            query = self.db_session.query(Trade).filter(Trade.user_id == user_id)
            
            # Apply filters
            if filters.get('account_id'):
                query = query.filter(Trade.trading_account_id == filters['account_id'])
            
            if filters.get('ticker_id'):
                query = query.filter(Trade.ticker_id == filters['ticker_id'])
            
            if filters.get('start_date'):
                start_date = filters['start_date']
                if isinstance(start_date, str):
                    start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                if start_date.tzinfo is None:
                    start_date = start_date.replace(tzinfo=timezone.utc)
                query = query.filter(Trade.created_at >= start_date)
            
            if filters.get('end_date'):
                end_date = filters['end_date']
                if isinstance(end_date, str):
                    end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                if end_date.tzinfo is None:
                    end_date = end_date.replace(tzinfo=timezone.utc)
                query = query.filter(Trade.created_at <= end_date)
            
            if filters.get('status') and filters['status'] != 'all':
                query = query.filter(Trade.status == filters['status'])
            
            if filters.get('investment_type'):
                query = query.filter(Trade.investment_type == filters['investment_type'])
            
            trades = query.order_by(Trade.created_at.desc()).all()
            
            # Convert to dicts
            trades_data = [trade.to_dict() for trade in trades]
            
            # Group if requested
            if group_by:
                grouped = self._group_trades(trades_data, group_by)
                return {
                    'trades': trades_data,
                    'grouped': grouped,
                    'count': len(trades_data),
                    'is_valid': True
                }
            
            return {
                'trades': trades_data,
                'count': len(trades_data),
                'is_valid': True
            }
            
        except Exception as e:
            self.logger.error(f"Error aggregating trade history: {str(e)}", exc_info=True)
            return {
                'error': str(e),
                'is_valid': False
            }
    
    def calculate_trade_statistics(
        self,
        trades: List[Dict[str, Any]],
        period: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate statistics for a list of trades.
        
        Args:
            trades: List of trade dictionaries
            period: Optional period filter ('day', 'week', 'month', 'year')
            
        Returns:
            Dict with statistics:
                - total_trades: int
                - total_pl: float
                - win_rate: float
                - average_pl: float
        """
        self.log_business_event('calculate_trade_statistics', {
            'trades_count': len(trades),
            'period': period
        })
        
        try:
            if not trades:
                return {
                    'total_trades': 0,
                    'total_pl': 0.0,
                    'win_rate': 0.0,
                    'average_pl': 0.0,
                    'is_valid': True
                }
            
            # Calculate statistics
            total_trades = len(trades)
            total_pl = sum(trade.get('total_pl', 0) or 0 for trade in trades)
            winning_trades = [t for t in trades if (t.get('total_pl', 0) or 0) > 0]
            win_rate = (len(winning_trades) / total_trades * 100) if total_trades > 0 else 0.0
            average_pl = total_pl / total_trades if total_trades > 0 else 0.0
            
            return {
                'total_trades': total_trades,
                'total_pl': total_pl,
                'win_rate': win_rate,
                'average_pl': average_pl,
                'winning_trades': len(winning_trades),
                'losing_trades': total_trades - len(winning_trades),
                'is_valid': True
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating trade statistics: {str(e)}", exc_info=True)
            return {
                'error': str(e),
                'is_valid': False
            }
    
    def calculate_plan_vs_execution_analysis(
        self,
        user_id: int,
        date_range: Dict[str, datetime]
    ) -> Dict[str, Any]:
        """
        Analyze trade plans vs actual executions.
        
        Args:
            user_id: User ID
            date_range: Dict with 'start_date' and 'end_date'
            
        Returns:
            Dict with analysis results
        """
        self.log_business_event('plan_vs_execution_analysis', {
            'user_id': user_id,
            'date_range': date_range
        })
        
        # TODO: Implement plan vs execution analysis
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
        entity_types: List[str]
    ) -> Dict[str, Any]:
        """
        Aggregate journal entries (notes, trades, executions) for a date range.
        
        Args:
            user_id: User ID
            date_range: Dict with 'start_date' and 'end_date'
            entity_types: List of entity types ('trade', 'execution', 'note', 'all')
            
        Returns:
            Dict with journal entries
        """
        self.log_business_event('aggregate_journal_entries', {
            'user_id': user_id,
            'date_range': date_range,
            'entity_types': entity_types
        })
        
        if not self.db_session:
            return {
                'error': 'Database session required',
                'is_valid': False
            }
        
        try:
            start_date = date_range.get('start_date')
            end_date = date_range.get('end_date')
            
            # Ensure timezone-aware
            if isinstance(start_date, str):
                start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
            
            entries = []
            
            # Get notes
            if 'note' in entity_types or 'all' in entity_types:
                notes_query = self.db_session.query(Note).filter(
                    and_(
                        Note.user_id == user_id,
                        Note.created_at >= start_date,
                        Note.created_at <= end_date
                    )
                )
                notes = notes_query.order_by(Note.created_at.desc()).all()
                for note in notes:
                    entries.append({
                        'type': 'note',
                        'id': note.id,
                        'content': note.content,
                        'date': note.created_at,
                        'related_type_id': note.related_type_id,
                        'related_id': note.related_id
                    })
            
            # Get trades
            if 'trade' in entity_types or 'all' in entity_types:
                trades_query = self.db_session.query(Trade).filter(
                    and_(
                        Trade.user_id == user_id,
                        Trade.created_at >= start_date,
                        Trade.created_at <= end_date
                    )
                )
                trades = trades_query.order_by(Trade.created_at.desc()).all()
                for trade in trades:
                    entries.append({
                        'type': 'trade',
                        'id': trade.id,
                        'ticker_id': trade.ticker_id,
                        'status': trade.status,
                        'date': trade.created_at,
                        'total_pl': trade.total_pl
                    })
            
            # Get executions
            if 'execution' in entity_types or 'all' in entity_types:
                executions_query = self.db_session.query(Execution).filter(
                    and_(
                        Execution.user_id == user_id,
                        Execution.date >= start_date,
                        Execution.date <= end_date
                    )
                )
                executions = executions_query.order_by(Execution.date.desc()).all()
                for execution in executions:
                    entries.append({
                        'type': 'execution',
                        'id': execution.id,
                        'ticker_id': execution.ticker_id,
                        'action': execution.action,
                        'date': execution.date,
                        'quantity': execution.quantity,
                        'price': execution.price
                    })
            
            # Sort by date
            entries.sort(key=lambda x: x['date'], reverse=True)
            
            return {
                'entries': entries,
                'count': len(entries),
                'is_valid': True
            }
            
        except Exception as e:
            self.logger.error(f"Error aggregating journal entries: {str(e)}", exc_info=True)
            return {
                'error': str(e),
                'is_valid': False
            }
    
    def calculate_journal_statistics(
        self,
        entries: List[Dict[str, Any]],
        period: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate statistics for journal entries.
        
        Args:
            entries: List of journal entry dictionaries
            period: Optional period filter
            
        Returns:
            Dict with statistics
        """
        self.log_business_event('calculate_journal_statistics', {
            'entries_count': len(entries),
            'period': period
        })
        
        try:
            if not entries:
                return {
                    'total_entries': 0,
                    'by_type': {},
                    'is_valid': True
                }
            
            # Count by type
            by_type = {}
            for entry in entries:
                entry_type = entry.get('type', 'unknown')
                by_type[entry_type] = by_type.get(entry_type, 0) + 1
            
            return {
                'total_entries': len(entries),
                'by_type': by_type,
                'is_valid': True
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating journal statistics: {str(e)}", exc_info=True)
            return {
                'error': str(e),
                'is_valid': False
            }
    
    def validate_journal_entry(self, entry_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate a journal entry.
        
        Args:
            entry_data: Journal entry data dictionary
            
        Returns:
            Dict with validation result
        """
        self.log_business_event('validate_journal_entry', entry_data)
        
        errors = []
        
        # Validate entry type
        entry_type = entry_data.get('type')
        if entry_type not in ['note', 'trade', 'execution']:
            errors.append(f"Invalid entry type: {entry_type}")
        
        # Validate date
        if 'date' not in entry_data:
            errors.append("date is required")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def _get_market_price_at_date(
        self,
        ticker_id: int,
        target_date: datetime
    ) -> Optional[Dict[str, Any]]:
        """
        Get market price for a ticker at or before a specific date.
        
        Args:
            ticker_id: Ticker ID
            target_date: Target date (timezone-aware datetime)
            
        Returns:
            Dict with price data or None
        """
        if not self.db_session:
            return None
        
        try:
            # Get closest quote before or at target_date
            quote = self.db_session.query(MarketDataQuote).filter(
                and_(
                    MarketDataQuote.ticker_id == ticker_id,
                    MarketDataQuote.asof_utc <= target_date,
                    MarketDataQuote.is_stale == False
                )
            ).order_by(desc(MarketDataQuote.asof_utc)).first()
            
            if not quote:
                # Fallback to latest quote
                quote = PositionPortfolioService.get_market_price(self.db_session, ticker_id)
                if quote:
                    return quote
                return None
            
            return {
                'price': float(quote.price),
                'is_stale': quote.is_stale,
                'fetched_at': quote.fetched_at,
                'asof_utc': quote.asof_utc
            }
            
        except Exception as e:
            self.logger.error(f"Error getting market price at date: {str(e)}")
            return None
    
    def _group_trades(
        self,
        trades: List[Dict[str, Any]],
        group_by: str
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Group trades by specified field.
        
        Args:
            trades: List of trade dictionaries
            group_by: Grouping field ('period', 'ticker', 'account')
            
        Returns:
            Dict with grouped trades
        """
        grouped = {}
        
        for trade in trades:
            if group_by == 'ticker':
                key = trade.get('ticker_id')
            elif group_by == 'account':
                key = trade.get('trading_account_id')
            elif group_by == 'period':
                # Group by month
                date_str = trade.get('created_at')
                if isinstance(date_str, str):
                    date_str = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                if isinstance(date_str, datetime):
                    key = date_str.strftime('%Y-%m')
                else:
                    key = 'unknown'
            else:
                key = 'all'
            
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(trade)
        
        return grouped
    
    def log_business_event(self, event_type: str, data: Dict[str, Any]) -> None:
        """
        Log business event for monitoring.
        
        Args:
            event_type: Type of business event
            data: Event data
        """
        self.logger.info(f"Business event: {event_type}", extra={'data': data})

