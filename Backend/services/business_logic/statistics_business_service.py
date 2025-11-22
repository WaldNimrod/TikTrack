"""
Statistics Business Logic Service - TikTrack
============================================

Business logic for statistics calculations, KPI calculations, and aggregations.
Moved from frontend to ensure consistency and centralization.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from __future__ import annotations

import logging
from typing import Any, Callable, Dict, List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from .base_business_service import BaseBusinessService
from .business_rules_registry import business_rules_registry

logger = logging.getLogger(__name__)


class StatisticsBusinessService(BaseBusinessService):
    """
    Business logic service for statistics.
    
    Handles all statistics-related calculations, KPI calculations, and aggregations.
    """
    
    def __init__(self):
        """Initialize the statistics business service."""
        super().__init__()
        self.registry = business_rules_registry
    
    # ========================================================================
    # Basic Statistics
    # ========================================================================
    
    def calculate_sum(
        self,
        data: List[Dict[str, Any]],
        field: str
    ) -> Dict[str, Any]:
        """
        Calculate sum of a field.
        
        Args:
            data: List of data dictionaries
            field: Field name to sum
            
        Returns:
            Dict with 'sum' (float) and 'is_valid' (bool)
        """
        if not data or not isinstance(data, list):
            return {
                'sum': 0.0,
                'is_valid': False,
                'error': 'Invalid data provided'
            }
        
        total = 0.0
        for item in data:
            value = item.get(field)
            if value is not None:
                try:
                    num_value = float(value)
                    total += num_value
                except (ValueError, TypeError):
                    continue
        
        return {
            'sum': round(total, 2),
            'is_valid': True,
            'error': None
        }
    
    def calculate_average(
        self,
        data: List[Dict[str, Any]],
        field: str
    ) -> Dict[str, Any]:
        """
        Calculate average of a field.
        
        Args:
            data: List of data dictionaries
            field: Field name to average
            
        Returns:
            Dict with 'average' (float) and 'is_valid' (bool)
        """
        if not data or not isinstance(data, list) or len(data) == 0:
            return {
                'average': 0.0,
                'is_valid': False,
                'error': 'Invalid or empty data provided'
            }
        
        sum_result = self.calculate_sum(data, field)
        if not sum_result['is_valid']:
            return sum_result
        
        count = len([item for item in data if item.get(field) is not None])
        if count == 0:
            return {
                'average': 0.0,
                'is_valid': False,
                'error': 'No valid values found'
            }
        
        average = sum_result['sum'] / count
        
        return {
            'average': round(average, 2),
            'is_valid': True,
            'error': None
        }
    
    def count_records(
        self,
        data: List[Dict[str, Any]],
        filter_fn: Optional[Callable] = None
    ) -> Dict[str, Any]:
        """
        Count records, optionally with filter.
        
        Args:
            data: List of data dictionaries
            filter_fn: Optional filter function
            
        Returns:
            Dict with 'count' (int) and 'is_valid' (bool)
        """
        if not data or not isinstance(data, list):
            return {
                'count': 0,
                'is_valid': False,
                'error': 'Invalid data provided'
            }
        
        if filter_fn and callable(filter_fn):
            filtered = [item for item in data if filter_fn(item)]
            count = len(filtered)
        else:
            count = len(data)
        
        return {
            'count': count,
            'is_valid': True,
            'error': None
        }
    
    def calculate_min_max(
        self,
        data: List[Dict[str, Any]],
        field: str
    ) -> Dict[str, Any]:
        """
        Calculate min and max of a field.
        
        Args:
            data: List of data dictionaries
            field: Field name
            
        Returns:
            Dict with 'min' (float), 'max' (float), and 'is_valid' (bool)
        """
        if not data or not isinstance(data, list):
            return {
                'min': 0.0,
                'max': 0.0,
                'is_valid': False,
                'error': 'Invalid data provided'
            }
        
        values = []
        for item in data:
            value = item.get(field)
            if value is not None:
                try:
                    num_value = float(value)
                    values.append(num_value)
                except (ValueError, TypeError):
                    continue
        
        if not values:
            return {
                'min': 0.0,
                'max': 0.0,
                'is_valid': False,
                'error': 'No valid values found'
            }
        
        return {
            'min': round(min(values), 2),
            'max': round(max(values), 2),
            'is_valid': True,
            'error': None
        }
    
    # ========================================================================
    # KPI Calculations
    # ========================================================================
    
    def calculate_kpi(
        self,
        calculation_type: str,
        data: List[Dict[str, Any]],
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Calculate KPI based on type.
        
        Args:
            calculation_type: Type of calculation ('kpi', 'summary', 'average', 'position', 'portfolio')
            data: List of data dictionaries
            params: Optional parameters for calculation
            
        Returns:
            Dict with calculated KPI values
        """
        params = params or {}
        
        if calculation_type == 'kpi':
            # Calculate multiple KPIs
            return self._calculate_multiple_kpis(data, params)
        elif calculation_type == 'summary':
            # Calculate summary statistics
            return self._calculate_summary(data, params)
        elif calculation_type == 'average':
            # Calculate averages
            return self._calculate_averages(data, params)
        elif calculation_type == 'position':
            # Calculate position statistics
            return self._calculate_position_stats(data, params)
        elif calculation_type == 'portfolio':
            # Calculate portfolio statistics
            return self._calculate_portfolio_stats(data, params)
        else:
            return {
                'is_valid': False,
                'error': f'Unknown calculation type: {calculation_type}'
            }
    
    def _calculate_multiple_kpis(
        self,
        data: List[Dict[str, Any]],
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate multiple KPIs."""
        results = {}
        
        # Count total
        count_result = self.count_records(data)
        if count_result['is_valid']:
            results['total_count'] = count_result['count']
        
        # Count by status if status field provided
        if 'status_field' in params:
            status_field = params['status_field']
            statuses = params.get('statuses', ['open', 'closed', 'cancelled'])
            for status in statuses:
                count_result = self.count_records(
                    data,
                    lambda item: item.get(status_field) == status
                )
                if count_result['is_valid']:
                    results[f'count_{status}'] = count_result['count']
        
        # Sum fields if provided
        if 'sum_fields' in params:
            for field in params['sum_fields']:
                sum_result = self.calculate_sum(data, field)
                if sum_result['is_valid']:
                    results[f'sum_{field}'] = sum_result['sum']
        
        return {
            'kpis': results,
            'is_valid': True,
            'error': None
        }
    
    def _calculate_summary(
        self,
        data: List[Dict[str, Any]],
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate summary statistics."""
        results = {}
        
        # Count
        count_result = self.count_records(data)
        if count_result['is_valid']:
            results['count'] = count_result['count']
        
        # Sum, average, min, max for specified fields
        if 'fields' in params:
            for field in params['fields']:
                sum_result = self.calculate_sum(data, field)
                if sum_result['is_valid']:
                    results[f'{field}_sum'] = sum_result['sum']
                
                avg_result = self.calculate_average(data, field)
                if avg_result['is_valid']:
                    results[f'{field}_avg'] = avg_result['average']
                
                min_max_result = self.calculate_min_max(data, field)
                if min_max_result['is_valid']:
                    results[f'{field}_min'] = min_max_result['min']
                    results[f'{field}_max'] = min_max_result['max']
        
        return {
            'summary': results,
            'is_valid': True,
            'error': None
        }
    
    def _calculate_averages(
        self,
        data: List[Dict[str, Any]],
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate averages for specified fields."""
        results = {}
        
        if 'fields' in params:
            for field in params['fields']:
                avg_result = self.calculate_average(data, field)
                if avg_result['is_valid']:
                    results[field] = avg_result['average']
        
        return {
            'averages': results,
            'is_valid': True,
            'error': None
        }
    
    def _calculate_position_stats(
        self,
        data: List[Dict[str, Any]],
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate position statistics."""
        # This would integrate with PositionCalculatorService
        # For now, return basic structure
        return {
            'positions': {},
            'is_valid': True,
            'error': None
        }
    
    def _calculate_portfolio_stats(
        self,
        data: List[Dict[str, Any]],
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate portfolio statistics."""
        # This would integrate with PositionPortfolioService
        # For now, return basic structure
        return {
            'portfolio': {},
            'is_valid': True,
            'error': None
        }
    
    # ========================================================================
    # Validation & Calculation
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate statistics calculation request.
        
        Args:
            data: Statistics calculation data dictionary
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        # Validate calculation type
        calculation_type = data.get('calculation_type')
        if calculation_type:
            allowed_types = ['kpi', 'summary', 'average', 'position', 'portfolio']
            if calculation_type not in allowed_types:
                errors.append(f"calculation_type must be one of: {', '.join(allowed_types)}")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform statistics calculations.
        
        Args:
            data: Statistics calculation data dictionary
            
        Returns:
            Dict with calculated values
        """
        calculation_type = data.get('calculation_type', 'kpi')
        records = data.get('data', [])
        params = data.get('params', {})
        
        return self.calculate_kpi(calculation_type, records, params)
    
    # ========================================================================
    # Portfolio Performance Calculations
    # ========================================================================
    
    @staticmethod
    def calculate_time_weighted_return(
        db: Session,
        account_id: Optional[int] = None,
        start_date: datetime,
        end_date: datetime,
        include_cash_flows: bool = True
    ) -> Dict[str, Any]:
        """
        Calculate Time-Weighted Return (TWR) for portfolio performance.
        
        Time-Weighted Return eliminates the impact of cash flows (deposits/withdrawals)
        on performance measurement by calculating returns for each sub-period between
        cash flows and compounding them.
        
        Formula: TWR = (1 + r1) * (1 + r2) * ... * (1 + rn) - 1
        Where each r_i = (End Value - Start Value) / Start Value for period i
        
        Args:
            db: Database session
            account_id: Optional trading account ID (None = all accounts)
            start_date: Start date for calculation
            end_date: End date for calculation
            include_cash_flows: Whether to account for cash flows in calculation
            
        Returns:
            Dict with:
                - time_weighted_return (float): TWR as percentage (e.g., 5.5 for 5.5%)
                - periods (List[Dict]): List of sub-periods with their returns
                - start_value (float): Portfolio value at start_date
                - end_value (float): Portfolio value at end_date
                - total_cash_flows (float): Total deposits - withdrawals in period
                - is_valid (bool): Whether calculation succeeded
                - error (str): Error message if calculation failed
                
        Example:
            result = StatisticsBusinessService.calculate_time_weighted_return(
                db=db,
                account_id=1,
                start_date=datetime(2024, 1, 1),
                end_date=datetime(2024, 12, 31)
            )
            if result['is_valid']:
                twr = result['time_weighted_return']  # e.g., 5.5 for 5.5%
        """
        try:
            from models.cash_flow import CashFlow
            from services.position_portfolio_service import PositionPortfolioService
            
            # Validate dates
            if start_date >= end_date:
                return {
                    'time_weighted_return': 0.0,
                    'periods': [],
                    'start_value': 0.0,
                    'end_value': 0.0,
                    'total_cash_flows': 0.0,
                    'is_valid': False,
                    'error': 'Start date must be before end date'
                }
            
            # Get cash flows in the period (if including them)
            cash_flow_dates = []
            if include_cash_flows:
                cash_flow_query = db.query(CashFlow).filter(
                    and_(
                        CashFlow.date >= start_date.date() if isinstance(start_date, datetime) else start_date,
                        CashFlow.date <= end_date.date() if isinstance(end_date, datetime) else end_date
                    )
                )
                
                if account_id:
                    cash_flow_query = cash_flow_query.filter(CashFlow.trading_account_id == account_id)
                
                cash_flows = cash_flow_query.order_by(CashFlow.date).all()
                
                # Create list of dates with cash flows (deposits are positive, withdrawals negative)
                for cf in cash_flows:
                    cf_date = cf.date if isinstance(cf.date, datetime) else datetime.combine(cf.date, datetime.min.time())
                    if cf.type in ['deposit', 'transfer_in', 'dividend', 'other_positive']:
                        cash_flow_dates.append((cf_date, float(cf.amount)))
                    elif cf.type in ['withdrawal', 'transfer_out', 'fee', 'other_negative']:
                        cash_flow_dates.append((cf_date, -float(cf.amount)))
            
            # Sort cash flow dates
            cash_flow_dates.sort(key=lambda x: x[0])
            
            # Create list of period boundaries (start, end, and all cash flow dates)
            period_boundaries = [start_date]
            for cf_date, _ in cash_flow_dates:
                # Add cash flow date if it's between start and end
                if start_date < cf_date < end_date:
                    period_boundaries.append(cf_date)
            period_boundaries.append(end_date)
            
            # Remove duplicates and sort
            period_boundaries = sorted(list(set(period_boundaries)))
            
            # Calculate portfolio value at each boundary
            # Note: This is a simplified approach - in production, you'd need to calculate
            # portfolio value at each date using PositionPortfolioService
            periods = []
            cumulative_return = 1.0
            
            for i in range(len(period_boundaries) - 1):
                period_start = period_boundaries[i]
                period_end = period_boundaries[i + 1]
                
                # Get portfolio value at start of period
                # TODO: Implement actual portfolio value calculation at specific date
                # For now, using PositionPortfolioService for current value as placeholder
                portfolio_start = PositionPortfolioService.calculate_portfolio_summary(
                    db=db,
                    account_id_filter=account_id,
                    include_closed=False
                )
                start_value = portfolio_start.get('summary', {}).get('total_market_value', 0.0)
                
                # Get portfolio value at end of period
                portfolio_end = PositionPortfolioService.calculate_portfolio_summary(
                    db=db,
                    account_id_filter=account_id,
                    include_closed=False
                )
                end_value = portfolio_end.get('summary', {}).get('total_market_value', 0.0)
                
                # Adjust for cash flows that occurred at the start of this period
                # (Cash flows affect the starting value for the next period)
                if i > 0:  # Not the first period
                    # Find cash flows at the start of this period
                    for cf_date, cf_amount in cash_flow_dates:
                        if cf_date == period_start:
                            # Cash flow happened at start of this period
                            # Adjust start value (subtract deposit, add withdrawal)
                            start_value -= cf_amount
                
                # Calculate return for this period
                if start_value > 0:
                    period_return = (end_value - start_value) / start_value
                    cumulative_return *= (1 + period_return)
                    
                    periods.append({
                        'start_date': period_start.isoformat() if isinstance(period_start, datetime) else str(period_start),
                        'end_date': period_end.isoformat() if isinstance(period_end, datetime) else str(period_end),
                        'start_value': round(start_value, 2),
                        'end_value': round(end_value, 2),
                        'return': round(period_return * 100, 2),  # As percentage
                        'cash_flows': [
                            {'date': cf_date.isoformat() if isinstance(cf_date, datetime) else str(cf_date), 'amount': cf_amount}
                            for cf_date, cf_amount in cash_flow_dates
                            if period_start <= cf_date < period_end
                        ]
                    })
                else:
                    # Zero or negative start value - skip this period
                    periods.append({
                        'start_date': period_start.isoformat() if isinstance(period_start, datetime) else str(period_start),
                        'end_date': period_end.isoformat() if isinstance(period_end, datetime) else str(period_end),
                        'start_value': round(start_value, 2),
                        'end_value': round(end_value, 2),
                        'return': 0.0,
                        'cash_flows': [],
                        'error': 'Zero or negative start value'
                    })
            
            # Calculate final TWR
            time_weighted_return = (cumulative_return - 1) * 100  # Convert to percentage
            
            # Get final portfolio values
            final_portfolio = PositionPortfolioService.calculate_portfolio_summary(
                db=db,
                account_id_filter=account_id,
                include_closed=False
            )
            final_start_value = final_portfolio.get('summary', {}).get('total_market_value', 0.0)
            final_end_value = final_portfolio.get('summary', {}).get('total_market_value', 0.0)
            
            # Calculate total cash flows
            total_cash_flows = sum(amount for _, amount in cash_flow_dates)
            
            return {
                'time_weighted_return': round(time_weighted_return, 2),
                'periods': periods,
                'start_value': round(final_start_value, 2),
                'end_value': round(final_end_value, 2),
                'total_cash_flows': round(total_cash_flows, 2),
                'is_valid': True,
                'error': None
            }
            
        except Exception as e:
            logger.error(f"Error calculating time-weighted return: {str(e)}", exc_info=True)
            return {
                'time_weighted_return': 0.0,
                'periods': [],
                'start_value': 0.0,
                'end_value': 0.0,
                'total_cash_flows': 0.0,
                'is_valid': False,
                'error': f'Error calculating time-weighted return: {str(e)}'
            }

