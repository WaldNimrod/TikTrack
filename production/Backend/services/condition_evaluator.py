"""
Condition Evaluator Service - TikTrack
=====================================

Service for evaluating trading conditions against market data.
Supports all 6 trading methods with their specific evaluation logic.

Features:
- Moving Average evaluation
- Volume analysis
- Support/Resistance level checking
- Trend line validation
- Technical pattern recognition
- Fibonacci retracement analysis

Author: TikTrack Development Team
Version: 1.0
Date: October 2025
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from models.plan_condition import PlanCondition
from models.trade_condition import TradeCondition
from models.external_data import MarketDataQuote
from models.trading_method import TradingMethod
from models.ticker import Ticker
from config.database import get_db

logger = logging.getLogger(__name__)

class ConditionEvaluator:
    """
    Evaluates trading conditions against market data
    """
    
    def __init__(self, db_session: Session = None):
        self.db = db_session or next(get_db())
    
    def evaluate_condition(self, condition: Any, market_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Evaluate a single condition against market data
        
        Args:
            condition: PlanCondition or TradeCondition object
            market_data: Optional pre-fetched market data
            
        Returns:
            Dict with evaluation results
        """
        try:
            # Get ticker_id from condition's trade_plan or trade
            ticker_id = self._get_ticker_id_from_condition(condition)
            if not ticker_id:
                return {
                    'condition_id': condition.id,
                    'met': False,
                    'error': 'No ticker found for condition',
                    'evaluation_time': datetime.now(timezone.utc).isoformat()
                }
            
            # Get market data if not provided
            if not market_data:
                market_data = self.get_market_data(ticker_id)
                if not market_data:
                    return {
                        'condition_id': condition.id,
                        'met': False,
                        'error': 'No market data available',
                        'evaluation_time': datetime.now(timezone.utc).isoformat()
                    }
            
            # Get method information
            method = self._get_method_from_condition(condition)
            if not method:
                return {
                    'condition_id': condition.id,
                    'met': False,
                    'error': 'Trading method not found',
                    'evaluation_time': datetime.now(timezone.utc).isoformat()
                }
            
            # Evaluate based on method type
            evaluation_result = self._evaluate_by_method(condition, method, market_data)
            
            condition_type = 'plan' if isinstance(condition, PlanCondition) else 'trade'
            plan_id = None
            trade_id = None
            if condition_type == 'plan':
                plan_id = getattr(condition, 'trade_plan_id', None)
            else:
                trade_id = getattr(condition, 'trade_id', None)

            return {
                'condition_id': condition.id,
                'condition_type': condition_type,
                'method_id': method.id,
                'method_name': method.name_en,
                'met': evaluation_result['met'],
                'evaluation_time': datetime.now(timezone.utc).isoformat(),
                'details': evaluation_result['details'],
                'ticker_id': ticker_id,
                'current_price': market_data.get('price', 0),
                'plan_id': plan_id,
                'trade_id': trade_id
            }
            
        except Exception as e:
            logger.error(f"Error evaluating condition {condition.id}: {str(e)}")
            return {
                'condition_id': condition.id,
                'met': False,
                'error': str(e),
                'evaluation_time': datetime.now(timezone.utc).isoformat()
            }
    
    def get_market_data(self, ticker_id: int) -> Optional[Dict[str, Any]]:
        """
        Get latest market data for a ticker
        
        Args:
            ticker_id: Ticker ID
            
        Returns:
            Dict with market data or None if not found
        """
        try:
            # Get latest quote
            quote = self.db.query(MarketDataQuote).filter(
                and_(
                    MarketDataQuote.ticker_id == ticker_id,
                    MarketDataQuote.is_stale == False
                )
            ).order_by(desc(MarketDataQuote.fetched_at)).first()
            
            if not quote:
                return None
            
            # Get historical data for calculations (last 30 days)
            historical_quotes = self.db.query(MarketDataQuote).filter(
                and_(
                    MarketDataQuote.ticker_id == ticker_id,
                    MarketDataQuote.fetched_at >= datetime.now(timezone.utc) - timedelta(days=30)
                )
            ).order_by(desc(MarketDataQuote.fetched_at)).limit(100).all()
            
            return {
                'price': quote.price,
                'change_pct_day': quote.change_pct_day,
                'change_amount_day': quote.change_amount_day,
                'volume': quote.volume,
                'asof_utc': quote.asof_utc,
                'fetched_at': quote.fetched_at,
                'historical_prices': [q.price for q in historical_quotes],
                'historical_volumes': [q.volume for q in historical_quotes if q.volume],
                'historical_dates': [q.fetched_at for q in historical_quotes]
            }
            
        except Exception as e:
            logger.error(f"Error getting market data for ticker {ticker_id}: {str(e)}")
            return None
    
    def _get_ticker_id_from_condition(self, condition: Any) -> Optional[int]:
        """Get ticker_id from condition's trade_plan or trade"""
        try:
            if isinstance(condition, PlanCondition):
                if hasattr(condition, 'trade_plan') and condition.trade_plan:
                    return condition.trade_plan.ticker_id
            elif isinstance(condition, TradeCondition):
                if hasattr(condition, 'trade') and condition.trade:
                    return condition.trade.ticker_id
            return None
        except Exception as e:
            logger.error(f"Error getting ticker_id from condition: {str(e)}")
            return None
    
    def _get_method_from_condition(self, condition: Any) -> Optional[TradingMethod]:
        """Get trading method from condition"""
        try:
            if hasattr(condition, 'method') and condition.method:
                return condition.method
            return None
        except Exception as e:
            logger.error(f"Error getting method from condition: {str(e)}")
            return None
    
    def _evaluate_by_method(self, condition: Any, method: TradingMethod, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate condition based on trading method type
        
        Args:
            condition: Condition object
            method: TradingMethod object
            market_data: Market data dict
            
        Returns:
            Dict with evaluation results
        """
        parameters = condition.get_parameters()
        method_name = method.name_en.lower()
        
        # Route to specific evaluation method
        if 'moving average' in method_name or 'ma' in method_name:
            return self._evaluate_moving_average(parameters, market_data)
        elif 'volume' in method_name:
            return self._evaluate_volume(parameters, market_data)
        elif 'support' in method_name or 'resistance' in method_name:
            return self._evaluate_support_resistance(parameters, market_data)
        elif 'trend' in method_name:
            return self._evaluate_trend_lines(parameters, market_data)
        elif 'pattern' in method_name or 'technical' in method_name:
            return self._evaluate_technical_patterns(parameters, market_data)
        elif 'fibonacci' in method_name or 'golden' in method_name:
            return self._evaluate_fibonacci(parameters, market_data)
        else:
            return {
                'met': False,
                'details': {'error': f'Unknown method: {method_name}'}
            }
    
    def _evaluate_moving_average(self, parameters: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate Moving Average condition"""
        try:
            current_price = market_data.get('price', 0)
            historical_prices = market_data.get('historical_prices', [])
            
            if not historical_prices:
                return {
                    'met': False,
                    'details': {'error': 'No historical data available'}
                }
            
            # Get MA parameters
            ma_period = parameters.get('ma_period', 20)
            ma_type = parameters.get('ma_type', 'SMA')  # SMA, EMA, WMA
            comparison_type = parameters.get('comparison_type', 'above')  # above, below, cross_up, cross_down
            
            # Calculate moving average
            if len(historical_prices) < ma_period:
                return {
                    'met': False,
                    'details': {'error': f'Not enough data for {ma_period}-period MA'}
                }
            
            ma_value = self._calculate_moving_average(historical_prices[:ma_period], ma_type)
            
            # Evaluate condition
            met = False
            if comparison_type == 'above':
                met = current_price > ma_value
            elif comparison_type == 'below':
                met = current_price < ma_value
            elif comparison_type == 'cross_up':
                # Check if price crossed above MA (current above, previous below)
                if len(historical_prices) > 1:
                    previous_price = historical_prices[1]
                    met = current_price > ma_value and previous_price <= ma_value
            elif comparison_type == 'cross_down':
                # Check if price crossed below MA
                if len(historical_prices) > 1:
                    previous_price = historical_prices[1]
                    met = current_price < ma_value and previous_price >= ma_value
            
            return {
                'met': met,
                'details': {
                    'current_price': current_price,
                    'ma_value': ma_value,
                    'ma_period': ma_period,
                    'ma_type': ma_type,
                    'comparison_type': comparison_type,
                    'price_vs_ma': current_price - ma_value,
                    'price_vs_ma_pct': ((current_price - ma_value) / ma_value * 100) if ma_value > 0 else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error evaluating Moving Average: {str(e)}")
            return {
                'met': False,
                'details': {'error': str(e)}
            }
    
    def _evaluate_volume(self, parameters: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate Volume condition"""
        try:
            current_volume = market_data.get('volume', 0)
            historical_volumes = market_data.get('historical_volumes', [])
            
            if not historical_volumes or current_volume == 0:
                return {
                    'met': False,
                    'details': {'error': 'No volume data available'}
                }
            
            # Get volume parameters
            volume_period = parameters.get('volume_period', 20)
            volume_multiplier = parameters.get('volume_multiplier', 1.5)  # e.g., 1.5x average
            comparison_type = parameters.get('comparison_type', 'above')  # above, below
            
            # Calculate average volume
            if len(historical_volumes) < volume_period:
                return {
                    'met': False,
                    'details': {'error': f'Not enough volume data for {volume_period}-period average'}
                }
            
            avg_volume = sum(historical_volumes[:volume_period]) / volume_period
            threshold_volume = avg_volume * volume_multiplier
            
            # Evaluate condition
            met = False
            if comparison_type == 'above':
                met = current_volume > threshold_volume
            elif comparison_type == 'below':
                met = current_volume < threshold_volume
            
            return {
                'met': met,
                'details': {
                    'current_volume': current_volume,
                    'avg_volume': avg_volume,
                    'threshold_volume': threshold_volume,
                    'volume_period': volume_period,
                    'volume_multiplier': volume_multiplier,
                    'comparison_type': comparison_type,
                    'volume_vs_avg': current_volume - avg_volume,
                    'volume_vs_avg_pct': ((current_volume - avg_volume) / avg_volume * 100) if avg_volume > 0 else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error evaluating Volume: {str(e)}")
            return {
                'met': False,
                'details': {'error': str(e)}
            }
    
    def _evaluate_support_resistance(self, parameters: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate Support/Resistance condition"""
        try:
            current_price = market_data.get('price', 0)
            historical_prices = market_data.get('historical_prices', [])
            
            if not historical_prices:
                return {
                    'met': False,
                    'details': {'error': 'No historical data available'}
                }
            
            # Get S/R parameters
            level_price = parameters.get('level_price', 0)
            level_type = parameters.get('level_type', 'support')  # support, resistance
            tolerance_pct = parameters.get('tolerance_pct', 2.0)  # 2% tolerance
            comparison_type = parameters.get('comparison_type', 'near')  # near, above, below, break_up, break_down
            
            if level_price <= 0:
                return {
                    'met': False,
                    'details': {'error': 'Invalid level price'}
                }
            
            # Calculate tolerance range
            tolerance_amount = level_price * (tolerance_pct / 100)
            upper_bound = level_price + tolerance_amount
            lower_bound = level_price - tolerance_amount
            
            # Evaluate condition
            met = False
            if comparison_type == 'near':
                met = lower_bound <= current_price <= upper_bound
            elif comparison_type == 'above':
                met = current_price > upper_bound
            elif comparison_type == 'below':
                met = current_price < lower_bound
            elif comparison_type == 'break_up':
                # Price broke above resistance
                if len(historical_prices) > 1:
                    previous_price = historical_prices[1]
                    met = current_price > upper_bound and previous_price <= upper_bound
            elif comparison_type == 'break_down':
                # Price broke below support
                if len(historical_prices) > 1:
                    previous_price = historical_prices[1]
                    met = current_price < lower_bound and previous_price >= lower_bound
            
            return {
                'met': met,
                'details': {
                    'current_price': current_price,
                    'level_price': level_price,
                    'level_type': level_type,
                    'tolerance_pct': tolerance_pct,
                    'tolerance_amount': tolerance_amount,
                    'upper_bound': upper_bound,
                    'lower_bound': lower_bound,
                    'comparison_type': comparison_type,
                    'distance_from_level': current_price - level_price,
                    'distance_from_level_pct': ((current_price - level_price) / level_price * 100) if level_price > 0 else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error evaluating Support/Resistance: {str(e)}")
            return {
                'met': False,
                'details': {'error': str(e)}
            }
    
    def _evaluate_trend_lines(self, parameters: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate Trend Lines condition"""
        try:
            current_price = market_data.get('price', 0)
            historical_prices = market_data.get('historical_prices', [])
            
            if not historical_prices or len(historical_prices) < 10:
                return {
                    'met': False,
                    'details': {'error': 'Not enough data for trend line analysis'}
                }
            
            # Get trend line parameters
            trend_type = parameters.get('trend_type', 'uptrend')  # uptrend, downtrend
            lookback_period = parameters.get('lookback_period', 20)
            comparison_type = parameters.get('comparison_type', 'bounce')  # bounce, break_up, break_down
            
            # Calculate trend line (simplified linear regression)
            recent_prices = historical_prices[:lookback_period]
            trend_slope, trend_intercept = self._calculate_trend_line(recent_prices)
            
            # Calculate expected price on trend line for current position
            current_position = 0  # Most recent
            expected_price = trend_slope * current_position + trend_intercept
            
            # Evaluate condition
            met = False
            price_vs_trend = current_price - expected_price
            
            if comparison_type == 'bounce':
                # Price bounced off trend line (within tolerance)
                tolerance_pct = parameters.get('tolerance_pct', 3.0)
                tolerance_amount = expected_price * (tolerance_pct / 100)
                met = abs(price_vs_trend) <= tolerance_amount
            elif comparison_type == 'break_up':
                # Price broke above trend line
                met = price_vs_trend > 0
            elif comparison_type == 'break_down':
                # Price broke below trend line
                met = price_vs_trend < 0
            
            return {
                'met': met,
                'details': {
                    'current_price': current_price,
                    'expected_price': expected_price,
                    'trend_slope': trend_slope,
                    'trend_intercept': trend_intercept,
                    'trend_type': trend_type,
                    'lookback_period': lookback_period,
                    'comparison_type': comparison_type,
                    'price_vs_trend': price_vs_trend,
                    'price_vs_trend_pct': (price_vs_trend / expected_price * 100) if expected_price > 0 else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error evaluating Trend Lines: {str(e)}")
            return {
                'met': False,
                'details': {'error': str(e)}
            }
    
    def _evaluate_technical_patterns(self, parameters: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate Technical Patterns condition"""
        try:
            current_price = market_data.get('price', 0)
            historical_prices = market_data.get('historical_prices', [])
            
            if not historical_prices or len(historical_prices) < 20:
                return {
                    'met': False,
                    'details': {'error': 'Not enough data for pattern analysis'}
                }
            
            # Get pattern parameters
            pattern_type = parameters.get('pattern_type', 'cup_handle')  # cup_handle, head_shoulders, triangle, etc.
            lookback_period = parameters.get('lookback_period', 20)
            
            # Pattern recognition (simplified)
            met = False
            pattern_details = {}
            
            if pattern_type == 'cup_handle':
                met, pattern_details = self._detect_cup_handle_pattern(historical_prices[:lookback_period])
            elif pattern_type == 'head_shoulders':
                met, pattern_details = self._detect_head_shoulders_pattern(historical_prices[:lookback_period])
            elif pattern_type == 'triangle':
                met, pattern_details = self._detect_triangle_pattern(historical_prices[:lookback_period])
            else:
                return {
                    'met': False,
                    'details': {'error': f'Unknown pattern type: {pattern_type}'}
                }
            
            return {
                'met': met,
                'details': {
                    'current_price': current_price,
                    'pattern_type': pattern_type,
                    'lookback_period': lookback_period,
                    'pattern_confidence': pattern_details.get('confidence', 0),
                    'pattern_details': pattern_details
                }
            }
            
        except Exception as e:
            logger.error(f"Error evaluating Technical Patterns: {str(e)}")
            return {
                'met': False,
                'details': {'error': str(e)}
            }
    
    def _evaluate_fibonacci(self, parameters: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate Fibonacci/Golden Zone condition"""
        try:
            current_price = market_data.get('price', 0)
            historical_prices = market_data.get('historical_prices', [])
            
            if not historical_prices or len(historical_prices) < 20:
                return {
                    'met': False,
                    'details': {'error': 'Not enough data for Fibonacci analysis'}
                }
            
            # Get Fibonacci parameters
            lookback_period = parameters.get('lookback_period', 20)
            fib_type = parameters.get('fib_type', 'retracement')  # retracement, extension
            comparison_type = parameters.get('comparison_type', 'in_zone')  # in_zone, above, below
            
            # Calculate Fibonacci levels
            recent_prices = historical_prices[:lookback_period]
            high_price = max(recent_prices)
            low_price = min(recent_prices)
            price_range = high_price - low_price
            
            # Fibonacci retracement levels
            fib_levels = {
                '0%': high_price,
                '23.6%': high_price - (price_range * 0.236),
                '38.2%': high_price - (price_range * 0.382),
                '50%': high_price - (price_range * 0.5),
                '61.8%': high_price - (price_range * 0.618),
                '78.6%': high_price - (price_range * 0.786),
                '100%': low_price
            }
            
            # Golden zone (38.2% to 61.8% retracement)
            golden_zone_upper = fib_levels['38.2%']
            golden_zone_lower = fib_levels['61.8%']
            
            # Evaluate condition
            met = False
            if comparison_type == 'in_zone':
                met = golden_zone_lower <= current_price <= golden_zone_upper
            elif comparison_type == 'above':
                met = current_price > golden_zone_upper
            elif comparison_type == 'below':
                met = current_price < golden_zone_lower
            
            return {
                'met': met,
                'details': {
                    'current_price': current_price,
                    'high_price': high_price,
                    'low_price': low_price,
                    'price_range': price_range,
                    'fib_levels': fib_levels,
                    'golden_zone_upper': golden_zone_upper,
                    'golden_zone_lower': golden_zone_lower,
                    'fib_type': fib_type,
                    'comparison_type': comparison_type,
                    'lookback_period': lookback_period,
                    'current_retracement_pct': ((high_price - current_price) / price_range * 100) if price_range > 0 else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error evaluating Fibonacci: {str(e)}")
            return {
                'met': False,
                'details': {'error': str(e)}
            }
    
    def _calculate_moving_average(self, prices: List[float], ma_type: str) -> float:
        """Calculate moving average of given type"""
        if not prices:
            return 0
        
        if ma_type == 'SMA':
            return sum(prices) / len(prices)
        elif ma_type == 'EMA':
            # Simplified EMA calculation
            alpha = 2.0 / (len(prices) + 1)
            ema = prices[0]
            for price in prices[1:]:
                ema = alpha * price + (1 - alpha) * ema
            return ema
        elif ma_type == 'WMA':
            # Weighted Moving Average
            weights = list(range(1, len(prices) + 1))
            weighted_sum = sum(price * weight for price, weight in zip(prices, weights))
            weight_sum = sum(weights)
            return weighted_sum / weight_sum
        else:
            return sum(prices) / len(prices)  # Default to SMA
    
    def _calculate_trend_line(self, prices: List[float]) -> Tuple[float, float]:
        """Calculate trend line using linear regression"""
        if len(prices) < 2:
            return 0, prices[0] if prices else 0
        
        n = len(prices)
        x_values = list(range(n))
        
        # Linear regression: y = mx + b
        sum_x = sum(x_values)
        sum_y = sum(prices)
        sum_xy = sum(x * y for x, y in zip(x_values, prices))
        sum_x2 = sum(x * x for x in x_values)
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
        intercept = (sum_y - slope * sum_x) / n
        
        return slope, intercept
    
    def _detect_cup_handle_pattern(self, prices: List[float]) -> Tuple[bool, Dict[str, Any]]:
        """Detect cup and handle pattern (simplified)"""
        if len(prices) < 10:
            return False, {'confidence': 0}
        
        # Simplified cup and handle detection
        # Look for U-shaped pattern followed by small pullback
        mid_point = len(prices) // 2
        first_half = prices[:mid_point]
        second_half = prices[mid_point:]
        
        # Check for U-shape in first half
        first_half_min = min(first_half)
        first_half_max = max(first_half)
        
        # Check for handle (small pullback) in second half
        second_half_min = min(second_half)
        second_half_max = max(second_half)
        
        # Simple pattern detection
        cup_depth = (first_half_max - first_half_min) / first_half_max if first_half_max > 0 else 0
        handle_depth = (second_half_max - second_half_min) / second_half_max if second_half_max > 0 else 0
        
        # Pattern is detected if cup is deep enough and handle is shallow
        met = cup_depth > 0.1 and handle_depth < 0.05
        
        return met, {
            'confidence': 0.7 if met else 0.2,
            'cup_depth': cup_depth,
            'handle_depth': handle_depth
        }
    
    def _detect_head_shoulders_pattern(self, prices: List[float]) -> Tuple[bool, Dict[str, Any]]:
        """Detect head and shoulders pattern (simplified)"""
        if len(prices) < 15:
            return False, {'confidence': 0}
        
        # Simplified head and shoulders detection
        # Look for three peaks with middle one highest
        thirds = len(prices) // 3
        left_shoulder = max(prices[:thirds])
        head = max(prices[thirds:thirds*2])
        right_shoulder = max(prices[thirds*2:])
        
        # Pattern is detected if head is higher than shoulders
        met = head > left_shoulder and head > right_shoulder
        
        return met, {
            'confidence': 0.6 if met else 0.1,
            'left_shoulder': left_shoulder,
            'head': head,
            'right_shoulder': right_shoulder
        }
    
    def _detect_triangle_pattern(self, prices: List[float]) -> Tuple[bool, Dict[str, Any]]:
        """Detect triangle pattern (simplified)"""
        if len(prices) < 10:
            return False, {'confidence': 0}
        
        # Simplified triangle detection
        # Look for converging trend lines
        first_half = prices[:len(prices)//2]
        second_half = prices[len(prices)//2:]
        
        first_half_volatility = max(first_half) - min(first_half)
        second_half_volatility = max(second_half) - min(second_half)
        
        # Pattern is detected if volatility decreases (converging)
        met = second_half_volatility < first_half_volatility * 0.7
        
        return met, {
            'confidence': 0.5 if met else 0.1,
            'first_half_volatility': first_half_volatility,
            'second_half_volatility': second_half_volatility
        }
    
    def evaluate_all_active_conditions(self) -> List[Dict[str, Any]]:
        """
        Evaluate all active conditions
        
        Returns:
            List of evaluation results
        """
        results = []
        
        try:
            # Get all active plan conditions
            plan_conditions = self.db.query(PlanCondition).filter(
                PlanCondition.is_active == True
            ).all()
            
            for condition in plan_conditions:
                result = self.evaluate_condition(condition)
                results.append(result)
            
            # Get all active trade conditions
            trade_conditions = self.db.query(TradeCondition).filter(
                TradeCondition.is_active == True
            ).all()
            
            for condition in trade_conditions:
                result = self.evaluate_condition(condition)
                results.append(result)
            
            logger.info(f"Evaluated {len(results)} conditions")
            
        except Exception as e:
            logger.error(f"Error evaluating all conditions: {str(e)}")
        
        return results
