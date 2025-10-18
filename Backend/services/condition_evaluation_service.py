"""
Condition Evaluation Service
Service for evaluating trading conditions against market data
"""

import logging
import json
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from models.trading_method import TradingMethod, MethodParameter
from models.plan_condition import PlanCondition, TradeCondition
from models.external_data import MarketDataQuote
from models.ticker import Ticker
from models.trade_plan import TradePlan
from models.trade import Trade

logger = logging.getLogger(__name__)

class ConditionEvaluationService:
    """Service for evaluating trading conditions"""
    
    def __init__(self, db_session: Session):
        self.db_session = db_session
    
    def evaluate_condition(self, condition_id: int, condition_type: str = 'plan') -> Dict[str, Any]:
        """Evaluate a single condition against current market data"""
        try:
            # Get condition
            if condition_type == 'plan':
                condition = self.db_session.query(PlanCondition).filter(
                    PlanCondition.id == condition_id
                ).first()
            else:
                condition = self.db_session.query(TradeCondition).filter(
                    TradeCondition.id == condition_id
                ).first()
            
            if not condition:
                return {
                    'status': 'error',
                    'message': f'Condition {condition_id} not found',
                    'condition_id': condition_id
                }
            
            # Get ticker ID
            ticker_id = self._get_ticker_id_for_condition(condition, condition_type)
            if not ticker_id:
                return {
                    'status': 'error',
                    'message': 'Ticker not found for condition',
                    'condition_id': condition_id
                }
            
            # Get market data
            market_data = self.get_current_market_data(ticker_id)
            if not market_data:
                return {
                    'status': 'error',
                    'message': 'No market data available',
                    'condition_id': condition_id
                }
            
            # Evaluate condition
            result = self._evaluate_single_condition(condition, market_data)
            
            return {
                'status': 'success',
                'condition_id': condition_id,
                'condition_type': condition_type,
                'evaluation_result': result,
                'market_data': market_data,
                'evaluated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error evaluating condition {condition_id}: {e}")
            return {
                'status': 'error',
                'message': str(e),
                'condition_id': condition_id
            }
    
    def evaluate_condition_group(self, conditions: List[Dict], logical_operator: str, ticker_id: int) -> Dict[str, Any]:
        """Evaluate a group of conditions with logical operator"""
        try:
            if not conditions:
                return {
                    'status': 'success',
                    'result': True,
                    'message': 'No conditions to evaluate'
                }
            
            # Get market data
            market_data = self.get_current_market_data(ticker_id)
            if not market_data:
                return {
                    'status': 'error',
                    'message': 'No market data available'
                }
            
            # Evaluate each condition
            results = []
            for condition_data in conditions:
                condition_id = condition_data.get('id')
                condition_type = condition_data.get('type', 'plan')
                
                condition_result = self.evaluate_condition(condition_id, condition_type)
                if condition_result['status'] == 'success':
                    results.append(condition_result['evaluation_result']['result'])
                else:
                    results.append(False)
            
            # Apply logical operator
            if logical_operator.upper() == 'AND':
                final_result = all(results)
            elif logical_operator.upper() == 'OR':
                final_result = any(results)
            else:  # NONE or single condition
                final_result = results[0] if results else False
            
            return {
                'status': 'success',
                'result': final_result,
                'individual_results': results,
                'logical_operator': logical_operator,
                'conditions_count': len(conditions),
                'evaluated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error evaluating condition group: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def get_current_market_data(self, ticker_id: int) -> Optional[Dict[str, Any]]:
        """Get current market data for a ticker"""
        try:
            # Get latest quote
            quote = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker_id
            ).order_by(desc(MarketDataQuote.fetched_at)).first()
            
            if not quote:
                return None
            
            # Get historical data for calculations (last 200 days)
            historical_quotes = self.db_session.query(MarketDataQuote).filter(
                and_(
                    MarketDataQuote.ticker_id == ticker_id,
                    MarketDataQuote.fetched_at >= datetime.now() - timedelta(days=200)
                )
            ).order_by(desc(MarketDataQuote.fetched_at)).all()
            
            # Calculate technical indicators
            technical_data = self._calculate_technical_indicators(historical_quotes)
            
            return {
                'ticker_id': ticker_id,
                'current_price': quote.price,
                'change_pct': quote.change_pct_day,
                'volume': quote.volume,
                'timestamp': quote.asof_utc,
                'technical_indicators': technical_data
            }
            
        except Exception as e:
            logger.error(f"Error getting market data for ticker {ticker_id}: {e}")
            return None
    
    def _get_ticker_id_for_condition(self, condition, condition_type: str) -> Optional[int]:
        """Get ticker ID for a condition"""
        try:
            if condition_type == 'plan':
                # Get from trade plan
                plan = self.db_session.query(TradePlan).filter(
                    TradePlan.id == condition.trade_plan_id
                ).first()
                return plan.ticker_id if plan else None
            else:
                # Get from trade
                trade = self.db_session.query(Trade).filter(
                    Trade.id == condition.trade_id
                ).first()
                return trade.ticker_id if trade else None
                
        except Exception as e:
            logger.error(f"Error getting ticker ID for condition: {e}")
            return None
    
    def _evaluate_single_condition(self, condition, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate a single condition against market data"""
        try:
            # Get method
            method = self.db_session.query(TradingMethod).filter(
                TradingMethod.id == condition.method_id
            ).first()
            
            if not method:
                return {
                    'result': False,
                    'message': 'Trading method not found',
                    'error': True
                }
            
            # Parse parameters
            parameters = condition.get_parameters()
            
            # Evaluate based on method category
            if method.category == 'technical_indicators':
                result = self._evaluate_technical_indicator(method, parameters, market_data)
            elif method.category == 'volume_analysis':
                result = self._evaluate_volume_analysis(method, parameters, market_data)
            elif method.category == 'support_resistance':
                result = self._evaluate_support_resistance(method, parameters, market_data)
            elif method.category == 'trend_analysis':
                result = self._evaluate_trend_analysis(method, parameters, market_data)
            elif method.category == 'price_patterns':
                result = self._evaluate_price_patterns(method, parameters, market_data)
            elif method.category == 'fibonacci':
                result = self._evaluate_fibonacci(method, parameters, market_data)
            else:
                result = {
                    'result': False,
                    'message': f'Unknown method category: {method.category}',
                    'error': True
                }
            
            return {
                'result': result.get('result', False),
                'message': result.get('message', ''),
                'method_name': method.name_en,
                'parameters': parameters,
                'error': result.get('error', False)
            }
            
        except Exception as e:
            logger.error(f"Error evaluating single condition: {e}")
            return {
                'result': False,
                'message': str(e),
                'error': True
            }
    
    def _evaluate_technical_indicator(self, method: TradingMethod, parameters: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate technical indicator conditions"""
        try:
            if method.name_en == 'Moving Averages':
                return self._evaluate_moving_averages(parameters, market_data)
            else:
                return {
                    'result': False,
                    'message': f'Technical indicator {method.name_en} not implemented',
                    'error': True
                }
                
        except Exception as e:
            logger.error(f"Error evaluating technical indicator: {e}")
            return {
                'result': False,
                'message': str(e),
                'error': True
            }
    
    def _evaluate_moving_averages(self, parameters: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate moving average conditions"""
        try:
            current_price = market_data['current_price']
            ma_period = int(parameters.get('ma_period', 50))
            ma_type = parameters.get('ma_type', 'SMA')
            
            # Get moving average value
            ma_value = self._calculate_moving_average(market_data, ma_period, ma_type)
            
            if ma_value is None:
                return {
                    'result': False,
                    'message': 'Insufficient data for moving average calculation',
                    'error': True
                }
            
            # Simple condition: price above/below MA
            # TODO: Add more sophisticated conditions like crossovers
            result = current_price > ma_value
            
            return {
                'result': result,
                'message': f'Price {current_price} {"above" if result else "below"} {ma_type}({ma_period}) = {ma_value:.2f}',
                'current_price': current_price,
                'ma_value': ma_value,
                'ma_period': ma_period,
                'ma_type': ma_type
            }
            
        except Exception as e:
            logger.error(f"Error evaluating moving averages: {e}")
            return {
                'result': False,
                'message': str(e),
                'error': True
            }
    
    def _evaluate_volume_analysis(self, method: TradingMethod, parameters: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate volume analysis conditions"""
        try:
            current_volume = market_data['volume']
            volume_threshold = float(parameters.get('volume_threshold', 1000000))
            comparison_period = int(parameters.get('comparison_period', 20))
            
            # Get average volume
            avg_volume = self._calculate_average_volume(market_data, comparison_period)
            
            if avg_volume is None:
                return {
                    'result': False,
                    'message': 'Insufficient data for volume analysis',
                    'error': True
                }
            
            # Check if volume is above threshold and above average
            result = current_volume > volume_threshold and current_volume > avg_volume
            
            return {
                'result': result,
                'message': f'Volume {current_volume} {"above" if result else "below"} threshold {volume_threshold} and average {avg_volume:.0f}',
                'current_volume': current_volume,
                'volume_threshold': volume_threshold,
                'average_volume': avg_volume
            }
            
        except Exception as e:
            logger.error(f"Error evaluating volume analysis: {e}")
            return {
                'result': False,
                'message': str(e),
                'error': True
            }
    
    def _evaluate_support_resistance(self, method: TradingMethod, parameters: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate support/resistance conditions"""
        try:
            current_price = market_data['current_price']
            level_price = float(parameters.get('level_price', 0))
            tolerance_percentage = float(parameters.get('tolerance_percentage', 0.5))
            
            if level_price <= 0:
                return {
                    'result': False,
                    'message': 'Invalid level price',
                    'error': True
                }
            
            # Calculate tolerance range
            tolerance_range = level_price * (tolerance_percentage / 100)
            lower_bound = level_price - tolerance_range
            upper_bound = level_price + tolerance_range
            
            # Check if price is within tolerance of the level
            result = lower_bound <= current_price <= upper_bound
            
            return {
                'result': result,
                'message': f'Price {current_price} {"within" if result else "outside"} tolerance of level {level_price} (±{tolerance_percentage}%)',
                'current_price': current_price,
                'level_price': level_price,
                'tolerance_percentage': tolerance_percentage,
                'tolerance_range': tolerance_range
            }
            
        except Exception as e:
            logger.error(f"Error evaluating support/resistance: {e}")
            return {
                'result': False,
                'message': str(e),
                'error': True
            }
    
    def _evaluate_trend_analysis(self, method: TradingMethod, parameters: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate trend analysis conditions"""
        try:
            # TODO: Implement trend line analysis
            return {
                'result': False,
                'message': 'Trend analysis not yet implemented',
                'error': True
            }
            
        except Exception as e:
            logger.error(f"Error evaluating trend analysis: {e}")
            return {
                'result': False,
                'message': str(e),
                'error': True
            }
    
    def _evaluate_price_patterns(self, method: TradingMethod, parameters: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate price pattern conditions"""
        try:
            # TODO: Implement pattern recognition
            return {
                'result': False,
                'message': 'Price pattern analysis not yet implemented',
                'error': True
            }
            
        except Exception as e:
            logger.error(f"Error evaluating price patterns: {e}")
            return {
                'result': False,
                'message': str(e),
                'error': True
            }
    
    def _evaluate_fibonacci(self, method: TradingMethod, parameters: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate Fibonacci conditions"""
        try:
            current_price = market_data['current_price']
            swing_high = float(parameters.get('swing_high', 0))
            swing_low = float(parameters.get('swing_low', 0))
            
            if swing_high <= 0 or swing_low <= 0 or swing_high <= swing_low:
                return {
                    'result': False,
                    'message': 'Invalid Fibonacci parameters',
                    'error': True
                }
            
            # Calculate Fibonacci levels
            price_range = swing_high - swing_low
            fib_levels = {
                '23.6': swing_high - (price_range * 0.236),
                '38.2': swing_high - (price_range * 0.382),
                '50.0': swing_high - (price_range * 0.500),
                '61.8': swing_high - (price_range * 0.618),
                '78.6': swing_high - (price_range * 0.786)
            }
            
            # Check if price is near any Fibonacci level (within 1%)
            tolerance = price_range * 0.01
            for level_name, level_price in fib_levels.items():
                if abs(current_price - level_price) <= tolerance:
                    return {
                        'result': True,
                        'message': f'Price {current_price} near Fibonacci {level_name}% level {level_price:.2f}',
                        'current_price': current_price,
                        'fibonacci_level': level_name,
                        'level_price': level_price,
                        'swing_high': swing_high,
                        'swing_low': swing_low
                    }
            
            return {
                'result': False,
                'message': f'Price {current_price} not near any Fibonacci level',
                'current_price': current_price,
                'fibonacci_levels': fib_levels,
                'swing_high': swing_high,
                'swing_low': swing_low
            }
            
        except Exception as e:
            logger.error(f"Error evaluating Fibonacci: {e}")
            return {
                'result': False,
                'message': str(e),
                'error': True
            }
    
    def _calculate_technical_indicators(self, quotes: List[MarketDataQuote]) -> Dict[str, Any]:
        """Calculate technical indicators from historical data"""
        try:
            if len(quotes) < 2:
                return {}
            
            # Sort by date (oldest first)
            quotes.sort(key=lambda x: x.fetched_at)
            
            # Calculate moving averages
            indicators = {}
            
            # Simple Moving Average (SMA)
            for period in [20, 50, 200]:
                if len(quotes) >= period:
                    sma_values = []
                    for i in range(period - 1, len(quotes)):
                        period_prices = [q.price for q in quotes[i - period + 1:i + 1]]
                        sma = sum(period_prices) / len(period_prices)
                        sma_values.append(sma)
                    indicators[f'sma_{period}'] = sma_values[-1] if sma_values else None
            
            # Volume average
            if len(quotes) >= 20:
                recent_volumes = [q.volume for q in quotes[-20:] if q.volume]
                if recent_volumes:
                    indicators['volume_avg_20'] = sum(recent_volumes) / len(recent_volumes)
            
            return indicators
            
        except Exception as e:
            logger.error(f"Error calculating technical indicators: {e}")
            return {}
    
    def _calculate_moving_average(self, market_data: Dict[str, Any], period: int, ma_type: str) -> Optional[float]:
        """Calculate moving average value"""
        try:
            # This is a simplified implementation
            # In a real system, you would use the historical data from market_data
            technical_indicators = market_data.get('technical_indicators', {})
            
            if ma_type == 'SMA':
                return technical_indicators.get(f'sma_{period}')
            else:
                # TODO: Implement EMA and WMA
                return technical_indicators.get(f'sma_{period}')
                
        except Exception as e:
            logger.error(f"Error calculating moving average: {e}")
            return None
    
    def _calculate_average_volume(self, market_data: Dict[str, Any], period: int) -> Optional[float]:
        """Calculate average volume over period"""
        try:
            technical_indicators = market_data.get('technical_indicators', {})
            return technical_indicators.get('volume_avg_20')
            
        except Exception as e:
            logger.error(f"Error calculating average volume: {e}")
            return None
