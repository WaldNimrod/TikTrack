"""
Missing Data Checker Service
----------------------------
Checks what data is missing for tickers before loading.
Provides detailed information about data freshness and completeness.

Documentation: documentation/04-FEATURES/EXTERNAL_DATA/MISSING_DATA_CHECKER.md
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
import logging

from models.ticker import Ticker
from models.external_data import MarketDataQuote
from services.advanced_cache_service import advanced_cache_service
from services.external_data.data_refresh_policy import DataRefreshPolicy

logger = logging.getLogger(__name__)


class MissingDataChecker:
    """
    Checks what data is missing for tickers and provides recommendations.
    
    Example:
        >>> checker = MissingDataChecker(db_session)
        >>> missing = checker.check_missing_data(ticker_id)
        >>> if missing['should_refresh_quote']:
        ...     # Load quote
    """
    
    # Minimum required counts
    MIN_HISTORICAL_QUOTES = 150  # For MA 150 calculation
    MIN_HISTORICAL_FOR_MA_150 = 120  # 80% of 150 (accounting for weekends/holidays)
    MIN_HISTORICAL_FOR_MA_20 = 20
    MIN_HISTORICAL_FOR_VOLATILITY = 30
    MIN_HISTORICAL_FOR_WEEK52 = 10
    
    def __init__(self, db_session: Session):
        """
        Initialize MissingDataChecker.
        
        Args:
            db_session: Database session for queries
        """
        self.db_session = db_session
        self.refresh_policy = DataRefreshPolicy(db_session)
    
    def check_missing_data(self, ticker_id: int) -> Dict[str, Any]:
        """
        Check what data is missing for a specific ticker.
        
        Args:
            ticker_id: Ticker ID to check
            
        Returns:
            Dict with missing data information:
            {
                'ticker_id': int,
                'symbol': str,
                'has_current_quote': bool,
                'has_historical_data': bool,
                'historical_count': int,
                'missing_indicators': List[str],
                'should_refresh_quote': bool,
                'should_refresh_historical': bool,
                'should_refresh_indicators': List[str],
                'data_freshness': Dict,
                'recommendations': Dict
            }
        """
        try:
            # Get ticker
            ticker = self.db_session.query(Ticker).filter(Ticker.id == ticker_id).first()
            if not ticker:
                return {
                    'ticker_id': ticker_id,
                    'error': 'Ticker not found',
                    'should_refresh_quote': False,
                    'should_refresh_historical': False,
                    'should_refresh_indicators': []
                }
            
            # Get latest quote
            latest_quote = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker_id
            ).order_by(MarketDataQuote.fetched_at.desc()).first()
            
            has_current_quote = latest_quote is not None and latest_quote.price is not None
            
            # Count historical quotes
            historical_count = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker_id
            ).count()
            
            has_historical_data = historical_count >= self.MIN_HISTORICAL_QUOTES
            
            # Check which indicators are missing
            missing_indicators = self._check_missing_indicators(ticker_id, historical_count)
            
            # Check data freshness
            data_freshness = self.get_data_freshness(ticker_id)
            
            # Get refresh recommendations from policy
            refresh_recommendations = self.refresh_policy.get_refresh_recommendations(ticker_id)
            
            # Build recommendations
            recommendations = {
                'priority': refresh_recommendations['priority'],
                'reason': refresh_recommendations['reason'],
                'actions': []
            }
            
            if refresh_recommendations['should_refresh_quote']:
                recommendations['actions'].append({
                    'action': 'refresh_quote',
                    'priority': 'high' if not has_current_quote else 'medium',
                    'reason': 'Quote is missing' if not has_current_quote else 'Quote is stale'
                })
            
            if refresh_recommendations['should_refresh_historical']:
                recommendations['actions'].append({
                    'action': 'refresh_historical',
                    'priority': 'high' if historical_count < self.MIN_HISTORICAL_FOR_MA_150 else 'medium',
                    'reason': f'Historical data insufficient ({historical_count}/{self.MIN_HISTORICAL_QUOTES})'
                })
            
            if refresh_recommendations['should_refresh_indicators']:
                recommendations['actions'].append({
                    'action': 'refresh_indicators',
                    'priority': 'low',
                    'indicators': refresh_recommendations['should_refresh_indicators'],
                    'reason': f'Missing indicators: {", ".join(refresh_recommendations["should_refresh_indicators"])}'
                })
            
            return {
                'ticker_id': ticker_id,
                'symbol': ticker.symbol,
                'name': ticker.name,
                'has_current_quote': has_current_quote,
                'has_historical_data': has_historical_data,
                'historical_count': historical_count,
                'missing_indicators': missing_indicators,
                'should_refresh_quote': refresh_recommendations['should_refresh_quote'],
                'should_refresh_historical': refresh_recommendations['should_refresh_historical'],
                'should_refresh_indicators': refresh_recommendations['should_refresh_indicators'],
                'data_freshness': data_freshness,
                'recommendations': recommendations,
                'last_quote_time': refresh_recommendations.get('last_quote_time'),
                'last_historical_time': refresh_recommendations.get('last_historical_time')
            }
            
        except Exception as e:
            logger.error(f"Error checking missing data for ticker {ticker_id}: {e}", exc_info=True)
            return {
                'ticker_id': ticker_id,
                'error': str(e),
                'should_refresh_quote': True,  # On error, recommend refresh
                'should_refresh_historical': True,
                'should_refresh_indicators': []
            }
    
    def check_missing_data_batch(self, ticker_ids: List[int]) -> Dict[int, Dict[str, Any]]:
        """
        Check missing data for multiple tickers in batch.
        
        Args:
            ticker_ids: List of ticker IDs to check
            
        Returns:
            Dict mapping ticker_id to missing data information
        """
        results = {}
        for ticker_id in ticker_ids:
            try:
                results[ticker_id] = self.check_missing_data(ticker_id)
            except Exception as e:
                logger.error(f"Error checking missing data for ticker {ticker_id} in batch: {e}")
                results[ticker_id] = {
                    'ticker_id': ticker_id,
                    'error': str(e),
                    'should_refresh_quote': True,
                    'should_refresh_historical': True,
                    'should_refresh_indicators': []
                }
        return results
    
    def get_data_freshness(self, ticker_id: int) -> Dict[str, Any]:
        """
        Get data freshness information for a ticker.
        
        Args:
            ticker_id: Ticker ID
            
        Returns:
            Dict with freshness information:
            {
                'quote_age_minutes': Optional[float],
                'quote_is_fresh': bool,
                'historical_age_hours': Optional[float],
                'historical_is_fresh': bool,
                'indicators_age_hours': Optional[float],
                'indicators_are_fresh': bool
            }
        """
        try:
            # Get latest quote
            latest_quote = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker_id
            ).order_by(MarketDataQuote.fetched_at.desc()).first()
            
            now_utc = datetime.now(timezone.utc)
            
            if latest_quote and latest_quote.fetched_at:
                quote_fetched = latest_quote.fetched_at
                if quote_fetched.tzinfo is None:
                    quote_fetched = quote_fetched.replace(tzinfo=timezone.utc)
                
                quote_age_minutes = (now_utc - quote_fetched).total_seconds() / 60
                quote_is_fresh = quote_age_minutes < 5  # 5 minutes threshold
                
                historical_age_hours = quote_age_minutes / 60
                historical_is_fresh = historical_age_hours < 24  # 24 hours threshold
                
                # Check indicators freshness (same as historical)
                indicators_age_hours = historical_age_hours
                indicators_are_fresh = historical_is_fresh
                
                return {
                    'quote_age_minutes': round(quote_age_minutes, 2),
                    'quote_is_fresh': quote_is_fresh,
                    'historical_age_hours': round(historical_age_hours, 2),
                    'historical_is_fresh': historical_is_fresh,
                    'indicators_age_hours': round(indicators_age_hours, 2),
                    'indicators_are_fresh': indicators_are_fresh,
                    'last_quote_time': quote_fetched.isoformat()
                }
            else:
                return {
                    'quote_age_minutes': None,
                    'quote_is_fresh': False,
                    'historical_age_hours': None,
                    'historical_is_fresh': False,
                    'indicators_age_hours': None,
                    'indicators_are_fresh': False,
                    'last_quote_time': None
                }
                
        except Exception as e:
            logger.error(f"Error getting data freshness for ticker {ticker_id}: {e}")
            return {
                'quote_age_minutes': None,
                'quote_is_fresh': False,
                'historical_age_hours': None,
                'historical_is_fresh': False,
                'indicators_age_hours': None,
                'indicators_are_fresh': False,
                'last_quote_time': None,
                'error': str(e)
            }
    
    def should_refresh_quote(self, ticker_id: int) -> bool:
        """
        Check if quote should be refreshed.
        
        Args:
            ticker_id: Ticker ID
            
        Returns:
            bool: True if quote should be refreshed
        """
        return self.refresh_policy.should_refresh_quote(ticker_id)
    
    def should_refresh_historical(self, ticker_id: int) -> bool:
        """
        Check if historical data should be refreshed.
        
        Args:
            ticker_id: Ticker ID
            
        Returns:
            bool: True if historical data should be refreshed
        """
        return self.refresh_policy.should_refresh_historical(ticker_id)
    
    def should_refresh_indicators(self, ticker_id: int) -> List[str]:
        """
        Get list of indicators that should be refreshed.
        
        Args:
            ticker_id: Ticker ID
            
        Returns:
            List[str]: List of indicator types that need refresh
        """
        recommendations = self.refresh_policy.get_refresh_recommendations(ticker_id)
        return recommendations.get('should_refresh_indicators', [])
    
    def _check_missing_indicators(self, ticker_id: int, historical_count: int) -> List[str]:
        """
        Check which technical indicators are missing.
        
        Args:
            ticker_id: Ticker ID
            historical_count: Number of historical quotes available
            
        Returns:
            List[str]: List of missing indicator types
        """
        missing = []
        
        # Check volatility (needs 30+ quotes)
        if historical_count >= self.MIN_HISTORICAL_FOR_VOLATILITY:
            volatility_key = f"ticker_{ticker_id}_volatility_30"
            if not advanced_cache_service.get(volatility_key):
                missing.append('volatility_30')
        
        # Check MA 20 (needs 20+ quotes)
        if historical_count >= self.MIN_HISTORICAL_FOR_MA_20:
            ma20_key = f"ticker_{ticker_id}_ma_20"
            if not advanced_cache_service.get(ma20_key):
                missing.append('ma_20')
        
        # Check MA 150 (needs 120+ quotes)
        if historical_count >= self.MIN_HISTORICAL_FOR_MA_150:
            ma150_key = f"ticker_{ticker_id}_ma_150"
            if not advanced_cache_service.get(ma150_key):
                missing.append('ma_150')
        
        # Check 52W range (needs 10+ quotes)
        if historical_count >= self.MIN_HISTORICAL_FOR_WEEK52:
            week52_key = f"ticker_{ticker_id}_week52"
            if not advanced_cache_service.get(week52_key):
                missing.append('week52')
        
        # Check ATR (from quote, needs historical data)
        if historical_count >= self.MIN_HISTORICAL_FOR_VOLATILITY:
            latest_quote = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker_id
            ).order_by(MarketDataQuote.fetched_at.desc()).first()
            
            if not latest_quote or latest_quote.atr is None:
                missing.append('atr')
        
        return missing
    
    def get_all_tickers_missing_data(self) -> Dict[str, Any]:
        """
        Get all tickers with missing data (for status endpoint).
        
        Returns:
            Dict with lists of tickers missing different types of data
        """
        try:
            # Get all open tickers
            open_tickers = self.db_session.query(Ticker).filter(Ticker.status == 'open').all()
            
            tickers_missing_current = []
            tickers_missing_historical = []
            tickers_missing_indicators = []
            recommendations = []
            
            for ticker in open_tickers:
                if not ticker.symbol:
                    continue
                
                missing_data = self.check_missing_data(ticker.id)
                
                if not missing_data.get('has_current_quote'):
                    tickers_missing_current.append({
                        'id': ticker.id,
                        'symbol': ticker.symbol,
                        'name': ticker.name
                    })
                    recommendations.append({
                        'ticker_id': ticker.id,
                        'symbol': ticker.symbol,
                        'priority': 'high',
                        'reason': 'missing_current_quote',
                        'message': f'{ticker.symbol} - חסר quote נוכחי'
                    })
                
                if not missing_data.get('has_historical_data'):
                    tickers_missing_historical.append({
                        'id': ticker.id,
                        'symbol': ticker.symbol,
                        'name': ticker.name,
                        'current_count': missing_data.get('historical_count', 0),
                        'required_count': self.MIN_HISTORICAL_QUOTES,
                        'missing_count': self.MIN_HISTORICAL_QUOTES - missing_data.get('historical_count', 0)
                    })
                    recommendations.append({
                        'ticker_id': ticker.id,
                        'symbol': ticker.symbol,
                        'priority': 'medium' if missing_data.get('historical_count', 0) >= 50 else 'high',
                        'reason': 'insufficient_historical_data',
                        'message': f'{ticker.symbol} - יש רק {missing_data.get("historical_count", 0)} quotes היסטוריים (נדרש {self.MIN_HISTORICAL_QUOTES})'
                    })
                
                missing_indicators = missing_data.get('missing_indicators', [])
                if missing_indicators:
                    tickers_missing_indicators.append({
                        'id': ticker.id,
                        'symbol': ticker.symbol,
                        'name': ticker.name,
                        'missing_indicators': missing_indicators,
                        'historical_count': missing_data.get('historical_count', 0)
                    })
                    recommendations.append({
                        'ticker_id': ticker.id,
                        'symbol': ticker.symbol,
                        'priority': 'low',
                        'reason': 'missing_technical_indicators',
                        'message': f'{ticker.symbol} - חסרים חישובים טכניים: {", ".join(missing_indicators)}'
                    })
            
            # Sort recommendations by priority
            priority_order = {'high': 0, 'medium': 1, 'low': 2}
            recommendations.sort(key=lambda x: priority_order.get(x['priority'], 3))
            
            return {
                'tickers_missing_current': tickers_missing_current,
                'tickers_missing_historical': tickers_missing_historical,
                'tickers_missing_indicators': tickers_missing_indicators,
                'recommendations': recommendations,
                'summary': {
                    'total_open_tickers': len(open_tickers),
                    'missing_current_count': len(tickers_missing_current),
                    'missing_historical_count': len(tickers_missing_historical),
                    'missing_indicators_count': len(tickers_missing_indicators),
                    'total_recommendations': len(recommendations)
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting all tickers missing data: {e}", exc_info=True)
            return {
                'tickers_missing_current': [],
                'tickers_missing_historical': [],
                'tickers_missing_indicators': [],
                'recommendations': [],
                'summary': {
                    'total_open_tickers': 0,
                    'missing_current_count': 0,
                    'missing_historical_count': 0,
                    'missing_indicators_count': 0,
                    'total_recommendations': 0
                },
                'error': str(e)
            }

