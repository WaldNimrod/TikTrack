"""
Data Refresh Policy Service
----------------------------
Defines refresh frequencies for different types of data based on their importance
and change rate. Ensures optimal data loading by only refreshing what's needed.

Documentation: documentation/04-FEATURES/EXTERNAL_DATA/DATA_REFRESH_POLICY.md
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
import pytz
import logging

from models.ticker import Ticker
from models.trade import Trade
from models.external_data import MarketDataQuote

logger = logging.getLogger(__name__)

# NY timezone for market hours
NY_TZ = pytz.timezone('America/New_York')


class DataRefreshPolicy:
    """
    Manages refresh policies for different types of external data.
    
    Refresh frequencies:
    - Current quote: 5 minutes (active trades), 60 minutes (inactive)
    - Historical data: Once per day (after market close)
    - Technical indicators (ATR, Volatility, MA, 52W): Once per day
    - Market cap: Once per day (changes slowly)
    
    Example:
        >>> policy = DataRefreshPolicy(db_session)
        >>> if policy.should_refresh_quote(ticker_id, last_refresh_time):
        ...     # Load quote
    """
    
    # Refresh intervals in minutes
    REFRESH_INTERVALS = {
        'quote': {
            'active_trades': {
                'in_hours': 5,      # 5 minutes during market hours
                'off_hours': 60    # 60 minutes outside market hours
            },
            'no_active_trades': {
                'in_hours': 60,    # 60 minutes during market hours
                'off_hours': 60    # 60 minutes outside market hours
            }
        },
        'historical': {
            'interval_hours': 24,   # Once per day
            'preferred_time': 'after_close'  # After market close
        },
        'indicators': {
            'interval_hours': 24,   # Once per day
            'preferred_time': 'after_close'  # After market close
        },
        'market_cap': {
            'interval_hours': 24    # Once per day
        }
    }
    
    def __init__(self, db_session: Session):
        """
        Initialize DataRefreshPolicy.
        
        Args:
            db_session: Database session for queries
        """
        self.db_session = db_session
        self.ny_tz = NY_TZ
    
    def is_market_hours(self, now_utc: Optional[datetime] = None) -> bool:
        """
        Check if current time is within NYSE trading hours.
        
        Args:
            now_utc: Current time in UTC (defaults to now)
            
        Returns:
            bool: True if within trading hours (9:30 AM - 4:00 PM ET, weekdays)
        """
        if now_utc is None:
            now_utc = datetime.now(timezone.utc)
        
        # Convert to NY timezone
        if now_utc.tzinfo is None:
            now_utc = now_utc.replace(tzinfo=timezone.utc)
        
        ny_time = now_utc.astimezone(self.ny_tz)
        
        # Weekend check
        if ny_time.weekday() >= 5:  # Saturday = 5, Sunday = 6
            return False
        
        # Trading hours: 9:30 AM - 4:00 PM ET
        trading_start = ny_time.replace(hour=9, minute=30, second=0, microsecond=0)
        trading_end = ny_time.replace(hour=16, minute=0, second=0, microsecond=0)
        
        return trading_start <= ny_time <= trading_end
    
    def has_active_trades(self, ticker_id: int) -> bool:
        """
        Check if ticker has active trades.
        
        Args:
            ticker_id: Ticker ID to check
            
        Returns:
            bool: True if ticker has active trades
        """
        try:
            open_trades_count = self.db_session.query(Trade).filter(
                Trade.ticker_id == ticker_id,
                Trade.status == 'open'
            ).count()
            return open_trades_count > 0
        except Exception as e:
            logger.warning(f"Error checking active trades for ticker {ticker_id}: {e}")
            return False
    
    def get_refresh_priority(self, ticker_id: int) -> int:
        """
        Get refresh priority for a ticker (higher = more urgent).
        
        Priority levels:
        - 3: Active trades, missing critical data
        - 2: Active trades, data exists
        - 1: No active trades, missing data
        - 0: No active trades, data exists
        
        Args:
            ticker_id: Ticker ID
            
        Returns:
            int: Priority level (0-3)
        """
        has_active = self.has_active_trades(ticker_id)
        
        # Check if critical data is missing
        try:
            latest_quote = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker_id
            ).order_by(MarketDataQuote.fetched_at.desc()).first()
            
            has_quote = latest_quote is not None and latest_quote.price is not None
            
            if has_active:
                return 3 if not has_quote else 2
            else:
                return 1 if not has_quote else 0
        except Exception as e:
            logger.warning(f"Error getting refresh priority for ticker {ticker_id}: {e}")
            return 1 if has_active else 0
    
    def should_refresh_quote(self, ticker_id: int, last_refresh_time: Optional[datetime] = None) -> bool:
        """
        Check if quote should be refreshed.
        
        Args:
            ticker_id: Ticker ID
            last_refresh_time: Last refresh time (if None, will query database)
            
        Returns:
            bool: True if quote should be refreshed
        """
        try:
            # Get last refresh time from database if not provided
            if last_refresh_time is None:
                latest_quote = self.db_session.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == ticker_id
                ).order_by(MarketDataQuote.fetched_at.desc()).first()
                
                if latest_quote is None:
                    return True  # No quote exists, need to load
                
                last_refresh_time = latest_quote.fetched_at
                if last_refresh_time.tzinfo is None:
                    last_refresh_time = last_refresh_time.replace(tzinfo=timezone.utc)
            
            # Get current time
            now_utc = datetime.now(timezone.utc)
            
            # Check if market hours
            market_hours = self.is_market_hours(now_utc)
            time_period = 'in_hours' if market_hours else 'off_hours'
            
            # Check if has active trades
            has_active = self.has_active_trades(ticker_id)
            category = 'active_trades' if has_active else 'no_active_trades'
            
            # Get refresh interval
            interval_minutes = self.REFRESH_INTERVALS['quote'][category][time_period]
            
            # Check if enough time has passed
            time_since_refresh = (now_utc - last_refresh_time).total_seconds() / 60
            
            return time_since_refresh >= interval_minutes
            
        except Exception as e:
            logger.error(f"Error checking if should refresh quote for ticker {ticker_id}: {e}")
            return True  # On error, refresh to be safe
    
    def should_refresh_historical(self, ticker_id: int, last_refresh_time: Optional[datetime] = None) -> bool:
        """
        Check if historical data should be refreshed.
        
        Historical data is refreshed once per day, preferably after market close.
        
        Args:
            ticker_id: Ticker ID
            last_refresh_time: Last refresh time (if None, will query database)
            
        Returns:
            bool: True if historical data should be refreshed
        """
        try:
            # Get last refresh time from database if not provided
            if last_refresh_time is None:
                # Check latest historical quote (not current quote)
                # Historical quotes are those with asof_utc different from fetched_at
                latest_historical = self.db_session.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == ticker_id
                ).order_by(MarketDataQuote.fetched_at.desc()).first()
                
                if latest_historical is None:
                    return True  # No historical data exists
                
                # Count historical quotes (should have at least 150 for MA 150)
                historical_count = self.db_session.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == ticker_id
                ).count()
                
                if historical_count < 120:  # Need at least 120 for MA 150
                    return True
                
                last_refresh_time = latest_historical.fetched_at
                if last_refresh_time.tzinfo is None:
                    last_refresh_time = last_refresh_time.replace(tzinfo=timezone.utc)
            
            # Get current time
            now_utc = datetime.now(timezone.utc)
            
            # Check if enough time has passed (24 hours)
            interval_hours = self.REFRESH_INTERVALS['historical']['interval_hours']
            time_since_refresh = (now_utc - last_refresh_time).total_seconds() / 3600
            
            if time_since_refresh >= interval_hours:
                # Prefer to refresh after market close
                if self.REFRESH_INTERVALS['historical']['preferred_time'] == 'after_close':
                    ny_time = now_utc.astimezone(self.ny_tz)
                    # After 4:00 PM ET or before 9:30 AM ET (next day)
                    if ny_time.hour >= 16 or ny_time.hour < 9:
                        return True
                    # During market hours, only refresh if data is very stale (> 25 hours)
                    return time_since_refresh >= (interval_hours + 1)
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking if should refresh historical for ticker {ticker_id}: {e}")
            return True  # On error, refresh to be safe
    
    def should_refresh_indicator(self, ticker_id: int, indicator_type: str, 
                                last_refresh_time: Optional[datetime] = None) -> bool:
        """
        Check if a technical indicator should be refreshed.
        
        Indicators are refreshed once per day, preferably after market close.
        Supported indicators: 'atr', 'volatility', 'ma_20', 'ma_150', 'week52', 'market_cap'
        
        Args:
            ticker_id: Ticker ID
            indicator_type: Type of indicator ('atr', 'volatility', 'ma_20', 'ma_150', 'week52', 'market_cap')
            last_refresh_time: Last refresh time (if None, will check cache)
            
        Returns:
            bool: True if indicator should be refreshed
        """
        try:
            # Get last refresh time from cache if not provided
            if last_refresh_time is None:
                from services.advanced_cache_service import advanced_cache_service
                
                # Check cache for indicator
                cache_key = f"ticker_{ticker_id}_{indicator_type}"
                cached_value = advanced_cache_service.get(cache_key)
                
                if cached_value is None:
                    return True  # No cached value, need to calculate
                
                # For indicators, we check the quote's fetched_at as proxy
                # (indicators are calculated after historical data is loaded)
                latest_quote = self.db_session.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == ticker_id
                ).order_by(MarketDataQuote.fetched_at.desc()).first()
                
                if latest_quote is None:
                    return True  # No quote exists, need to load data first
                
                last_refresh_time = latest_quote.fetched_at
                if last_refresh_time.tzinfo is None:
                    last_refresh_time = last_refresh_time.replace(tzinfo=timezone.utc)
            
            # Get current time
            now_utc = datetime.now(timezone.utc)
            
            # Check if enough time has passed (24 hours)
            interval_hours = self.REFRESH_INTERVALS['indicators']['interval_hours']
            time_since_refresh = (now_utc - last_refresh_time).total_seconds() / 3600
            
            if time_since_refresh >= interval_hours:
                # Prefer to refresh after market close
                if self.REFRESH_INTERVALS['indicators']['preferred_time'] == 'after_close':
                    ny_time = now_utc.astimezone(self.ny_tz)
                    # After 4:00 PM ET or before 9:30 AM ET (next day)
                    if ny_time.hour >= 16 or ny_time.hour < 9:
                        return True
                    # During market hours, only refresh if data is very stale (> 25 hours)
                    return time_since_refresh >= (interval_hours + 1)
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking if should refresh indicator {indicator_type} for ticker {ticker_id}: {e}")
            return True  # On error, refresh to be safe
    
    def get_refresh_recommendations(self, ticker_id: int) -> Dict[str, Any]:
        """
        Get comprehensive refresh recommendations for a ticker.
        
        Args:
            ticker_id: Ticker ID
            
        Returns:
            Dict with recommendations:
            {
                'should_refresh_quote': bool,
                'should_refresh_historical': bool,
                'should_refresh_indicators': List[str],
                'priority': int,
                'last_quote_time': Optional[datetime],
                'last_historical_time': Optional[datetime],
                'reason': str
            }
        """
        try:
            # Get latest quote
            latest_quote = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker_id
            ).order_by(MarketDataQuote.fetched_at.desc()).first()
            
            last_quote_time = latest_quote.fetched_at if latest_quote else None
            if last_quote_time and last_quote_time.tzinfo is None:
                last_quote_time = last_quote_time.replace(tzinfo=timezone.utc)
            
            # Check what needs refresh
            should_refresh_quote = self.should_refresh_quote(ticker_id, last_quote_time)
            should_refresh_historical = self.should_refresh_historical(ticker_id, last_quote_time)
            
            # Check which indicators need refresh
            indicators_to_refresh = []
            indicator_types = ['atr', 'volatility', 'ma_20', 'ma_150', 'week52', 'market_cap']
            for indicator_type in indicator_types:
                if self.should_refresh_indicator(ticker_id, indicator_type, last_quote_time):
                    indicators_to_refresh.append(indicator_type)
            
            # Get priority
            priority = self.get_refresh_priority(ticker_id)
            
            # Build reason
            reasons = []
            if should_refresh_quote:
                reasons.append("quote is stale or missing")
            if should_refresh_historical:
                reasons.append("historical data is stale or insufficient")
            if indicators_to_refresh:
                reasons.append(f"indicators need refresh: {', '.join(indicators_to_refresh)}")
            
            reason = "; ".join(reasons) if reasons else "all data is fresh"
            
            return {
                'should_refresh_quote': should_refresh_quote,
                'should_refresh_historical': should_refresh_historical,
                'should_refresh_indicators': indicators_to_refresh,
                'priority': priority,
                'last_quote_time': last_quote_time.isoformat() if last_quote_time else None,
                'last_historical_time': last_quote_time.isoformat() if last_quote_time else None,
                'reason': reason
            }
            
        except Exception as e:
            logger.error(f"Error getting refresh recommendations for ticker {ticker_id}: {e}")
            return {
                'should_refresh_quote': True,
                'should_refresh_historical': True,
                'should_refresh_indicators': ['atr', 'volatility', 'ma_20', 'ma_150', 'week52', 'market_cap'],
                'priority': 3,
                'last_quote_time': None,
                'last_historical_time': None,
                'reason': f'error: {str(e)}'
            }

