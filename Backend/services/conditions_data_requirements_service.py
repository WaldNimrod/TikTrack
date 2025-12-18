"""
Conditions Data Requirements Service
====================================
Service for checking data requirements for conditions and determining readiness status.

This service:
- Analyzes condition parameters to determine required data
- Uses MissingDataChecker to verify data availability
- Returns readiness status: ready, waiting_for_data, error

Documentation: documentation/04-FEATURES/CORE/conditions-system/CONDITIONS_SYSTEM.md
"""

from typing import Dict, Any, List, Optional, Union
from sqlalchemy.orm import Session
import logging

from models.plan_condition import PlanCondition
from models.trade_condition import TradeCondition
from models.trade_plan import TradePlan
from models.trade import Trade
from services.external_data.missing_data_checker import MissingDataChecker

logger = logging.getLogger(__name__)


class ConditionsDataRequirementsService:
    """
    Service for checking data requirements for conditions.
    
    Example:
        >>> service = ConditionsDataRequirementsService(db_session)
        >>> readiness = service.check_condition_readiness(condition_id, 'plan', ticker_id)
        >>> if readiness['status'] == 'waiting_for_data':
        ...     # Trigger data loading
    """
    
    def __init__(self, db_session: Session):
        """
        Initialize the service.
        
        Args:
            db_session: Database session for queries
        """
        self.db_session = db_session
        self.missing_data_checker = MissingDataChecker(db_session)
    
    def get_condition_data_requirements(
        self, 
        condition: Union[PlanCondition, TradeCondition]
    ) -> Dict[str, Any]:
        """
        Get data requirements for a condition based on its method and parameters.
        
        Args:
            condition: PlanCondition or TradeCondition object
            
        Returns:
            Dict with requirements:
            {
                'required_historical_count': int,
                'required_indicators': List[str],
                'requires_volume': bool,
                'requires_price_data': bool,
                'lookback_period': Optional[int]
            }
        """
        try:
            # Get method information
            if not hasattr(condition, 'method') or not condition.method:
                # Load method if not already loaded
                from models.trading_method import TradingMethod
                condition.method = self.db_session.query(TradingMethod).filter(
                    TradingMethod.id == condition.method_id
                ).first()
            
            if not condition.method:
                return {
                    'required_historical_count': 0,
                    'required_indicators': [],
                    'requires_volume': False,
                    'requires_price_data': True,
                    'lookback_period': None,
                    'error': 'Method not found'
                }
            
            method_category = condition.method.category
            parameters = condition.get_parameters()
            
            requirements = {
                'required_historical_count': 0,
                'required_indicators': [],
                'requires_volume': False,
                'requires_price_data': True,
                'lookback_period': None
            }
            
            # Determine requirements based on method category
            if method_category == 'technical_indicators':
                # Moving Averages - need ma_period + small buffer for crossovers
                ma_period = int(parameters.get('ma_period', 20))
                requirements['required_historical_count'] = ma_period + 5  # Buffer for crossover detection
                requirements['required_indicators'] = [f'ma_{ma_period}']
                
            elif method_category == 'volume_analysis':
                # Volume Analysis - need volume_period historical volume data
                volume_period = int(parameters.get('volume_period', 20))
                requirements['required_historical_count'] = volume_period
                requirements['requires_volume'] = True
                
            elif method_category == 'support_resistance':
                # Support/Resistance - need basic price data, preferably 20+
                requirements['required_historical_count'] = 20
                requirements['requires_price_data'] = True
                
            elif method_category == 'trend_analysis':
                # Trend Lines - need lookback_period
                lookback = int(parameters.get('lookback_period', 20))
                requirements['required_historical_count'] = lookback
                requirements['lookback_period'] = lookback
                
            elif method_category == 'price_patterns':
                # Technical Patterns - need lookback_period
                lookback = int(parameters.get('lookback_period', 30))
                requirements['required_historical_count'] = lookback
                requirements['lookback_period'] = lookback
                
            elif method_category == 'fibonacci':
                # Fibonacci - need lookback_period
                lookback = int(parameters.get('lookback_period', 20))
                requirements['required_historical_count'] = lookback
                requirements['lookback_period'] = lookback
                
            else:
                # Default: require basic price data
                requirements['required_historical_count'] = 20
                requirements['requires_price_data'] = True
            
            return requirements
            
        except Exception as e:
            logger.error(f"Error getting data requirements for condition {condition.id}: {e}", exc_info=True)
            return {
                'required_historical_count': 0,
                'required_indicators': [],
                'requires_volume': False,
                'requires_price_data': True,
                'lookback_period': None,
                'error': str(e)
            }
    
    def get_missing_data_for_condition(
        self,
        condition: Union[PlanCondition, TradeCondition],
        ticker_id: int
    ) -> List[str]:
        """
        Get list of missing data items for a condition.
        
        Args:
            condition: PlanCondition or TradeCondition object
            ticker_id: Ticker ID to check
            
        Returns:
            List[str]: List of missing data items (e.g., ['historical_data', 'volume_data'])
        """
        try:
            missing_items = []
            
            # Get requirements
            requirements = self.get_condition_data_requirements(condition)
            if requirements.get('error'):
                return ['error_analyzing_requirements']
            
            # Check missing data using MissingDataChecker
            missing_data = self.missing_data_checker.check_missing_data(ticker_id)
            
            # Check current quote
            if not missing_data.get('has_current_quote'):
                missing_items.append('current_quote')
            
            # Check historical data
            historical_count = missing_data.get('historical_count', 0)
            required_count = requirements.get('required_historical_count', 0)
            
            if historical_count < required_count:
                missing_items.append('historical_data')
            
            # Check volume data if required
            if requirements.get('requires_volume'):
                # Check if we have volume data in historical quotes
                from models.external_data import MarketDataQuote
                quotes_with_volume = self.db_session.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == ticker_id,
                    MarketDataQuote.volume.isnot(None)
                ).count()
                
                if quotes_with_volume < required_count:
                    missing_items.append('volume_data')
            
            # Check indicators if required
            required_indicators = requirements.get('required_indicators', [])
            missing_indicators = missing_data.get('missing_indicators', [])
            
            for indicator in required_indicators:
                # Check if indicator is missing
                if indicator in missing_indicators or indicator.replace('ma_', 'ma_') in missing_indicators:
                    missing_items.append(f'indicator_{indicator}')
            
            return missing_items
            
        except Exception as e:
            logger.error(f"Error getting missing data for condition {condition.id}: {e}", exc_info=True)
            return ['error_checking_data']
    
    def check_condition_readiness(
        self,
        condition_id: int,
        condition_type: str,
        ticker_id: int
    ) -> Dict[str, Any]:
        """
        Check readiness status for a condition.
        
        Args:
            condition_id: Condition ID
            condition_type: 'plan' or 'trade'
            ticker_id: Ticker ID
            
        Returns:
            Dict with readiness information:
            {
                'status': 'ready' | 'waiting_for_data' | 'error',
                'missing_data': List[str],
                'requirements': Dict[str, Any],
                'current_data': Dict[str, Any],
                'message': str
            }
        """
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
                    'missing_data': [],
                    'requirements': {},
                    'current_data': {},
                    'message': f'Condition {condition_id} not found'
                }
            
            # Get requirements
            requirements = self.get_condition_data_requirements(condition)
            if requirements.get('error'):
                return {
                    'status': 'error',
                    'missing_data': [],
                    'requirements': requirements,
                    'current_data': {},
                    'message': f'Error analyzing requirements: {requirements["error"]}'
                }
            
            # Get missing data
            missing_data_list = self.get_missing_data_for_condition(condition, ticker_id)
            
            # Get current data status
            missing_data_check = self.missing_data_checker.check_missing_data(ticker_id)
            current_data = {
                'has_current_quote': missing_data_check.get('has_current_quote', False),
                'historical_count': missing_data_check.get('historical_count', 0),
                'missing_indicators': missing_data_check.get('missing_indicators', [])
            }
            
            # Determine status
            if 'error' in missing_data_list or 'error_analyzing_requirements' in missing_data_list:
                status = 'error'
                message = 'Error checking data requirements'
            elif missing_data_list:
                status = 'waiting_for_data'
                message = f'Missing: {", ".join(missing_data_list)}'
            else:
                status = 'ready'
                message = 'All required data is available'
            
            return {
                'status': status,
                'missing_data': missing_data_list,
                'requirements': requirements,
                'current_data': current_data,
                'message': message,
                'condition_id': condition_id,
                'condition_type': condition_type,
                'ticker_id': ticker_id
            }
            
        except Exception as e:
            logger.error(f"Error checking readiness for condition {condition_id}: {e}", exc_info=True)
            return {
                'status': 'error',
                'missing_data': [],
                'requirements': {},
                'current_data': {},
                'message': f'Error: {str(e)}'
            }
    
    def get_ticker_id_from_condition(
        self,
        condition: Union[PlanCondition, TradeCondition]
    ) -> Optional[int]:
        """
        Get ticker_id from a condition (via trade_plan or trade).
        
        Args:
            condition: PlanCondition or TradeCondition object
            
        Returns:
            Optional[int]: Ticker ID or None if not found
        """
        try:
            if isinstance(condition, PlanCondition):
                # Get ticker_id from trade_plan
                if hasattr(condition, 'trade_plan') and condition.trade_plan:
                    return condition.trade_plan.ticker_id
                else:
                    # Load trade_plan if not loaded
                    trade_plan = self.db_session.query(TradePlan).filter(
                        TradePlan.id == condition.trade_plan_id
                    ).first()
                    if trade_plan:
                        return trade_plan.ticker_id
            else:
                # Get ticker_id from trade
                if hasattr(condition, 'trade') and condition.trade:
                    return condition.trade.ticker_id
                else:
                    # Load trade if not loaded
                    trade = self.db_session.query(Trade).filter(
                        Trade.id == condition.trade_id
                    ).first()
                    if trade:
                        return trade.ticker_id
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting ticker_id from condition {condition.id}: {e}")
            return None
