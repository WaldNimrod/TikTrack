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

