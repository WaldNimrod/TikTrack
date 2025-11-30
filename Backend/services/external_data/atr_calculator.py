"""
ATR (Average True Range) Calculator Service
==========================================

Service for calculating ATR with fallback strategy:
1. First try: Calculate from database (preferred - our data)
2. Second try: Calculate from provider (with conflict checking and warnings)

Author: TikTrack Development Team
Date: January 2025
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from models.external_data import MarketDataQuote
from models.ticker import Ticker
from services.preferences_service import PreferencesService

logger = logging.getLogger(__name__)


@dataclass
class ATRResult:
    """Result of ATR calculation with metadata"""
    atr: Optional[float]
    period: int
    source: str  # 'database' or 'provider'
    data_points_used: int
    warnings: List[str]
    conflicts: List[Dict[str, Any]]


class ATRCalculator:
    """
    Service for calculating Average True Range (ATR) with fallback strategy.
    
    ATR is a technical indicator that measures market volatility.
    Formula:
    1. True Range (TR) = max of:
       - High - Low
       - |High - Previous Close|
       - |Low - Previous Close|
    2. ATR = Simple Moving Average of TR over the specified period
    """
    
    def __init__(self, db_session: Session):
        self.db_session = db_session
        self.preferences_service = PreferencesService()
    
    def get_user_atr_period(self, user_id: Optional[int] = None) -> int:
        """
        Get ATR period from user preferences.
        
        Args:
            user_id: User ID (optional)
            
        Returns:
            ATR period (default 14 if not set)
        """
        if user_id is None:
            return 14
        
        try:
            prefs = self.preferences_service.get_preferences_by_names(
                user_id=user_id,
                names=['atr_period']
            )
            atr_period = prefs.get('atr_period')
            if atr_period is not None:
                try:
                    period = int(atr_period)
                    if 3 <= period <= 90:
                        return period
                except (ValueError, TypeError):
                    pass
        except Exception as e:
            logger.warning(f"Error getting ATR period preference for user {user_id}: {e}")
        
        return 14  # Default fallback
    
    def calculate_atr_from_database(
        self, 
        ticker_id: int, 
        period: int, 
        db_session: Optional[Session] = None
    ) -> Optional[ATRResult]:
        """
        Calculate ATR from historical data in database.
        
        Args:
            ticker_id: Ticker ID
            period: ATR period (number of days)
            db_session: Database session (optional, uses self.db_session if not provided)
            
        Returns:
            ATRResult if successful, None if insufficient data
        """
        session = db_session or self.db_session
        
        try:
            # Get historical quotes with OHLC data
            # Need period+1 because we need previous close for True Range calculation
            required_days = period + 1
            
            quotes = session.query(MarketDataQuote).filter(
                and_(
                    MarketDataQuote.ticker_id == ticker_id,
                    MarketDataQuote.open_price.isnot(None),
                    MarketDataQuote.high_price.isnot(None),
                    MarketDataQuote.low_price.isnot(None),
                    MarketDataQuote.close_price.isnot(None)
                )
            ).order_by(desc(MarketDataQuote.asof_utc)).limit(required_days + 5).all()
            
            if len(quotes) < required_days:
                logger.info(f"Insufficient database data for ATR: {len(quotes)} quotes, need {required_days}")
                return None
            
            # Sort by date (oldest first) for ATR calculation
            quotes_sorted = sorted(quotes, key=lambda q: q.asof_utc)
            
            # Calculate True Ranges
            true_ranges = []
            for i in range(1, len(quotes_sorted)):
                current = quotes_sorted[i]
                previous = quotes_sorted[i - 1]
                
                high = current.high_price
                low = current.low_price
                prev_close = previous.close_price
                
                if high is None or low is None or prev_close is None:
                    continue
                
                # Calculate True Range
                tr1 = high - low
                tr2 = abs(high - prev_close)
                tr3 = abs(low - prev_close)
                
                true_range = max(tr1, tr2, tr3)
                true_ranges.append(true_range)
            
            if len(true_ranges) < period:
                logger.warning(f"Insufficient true ranges for ATR: {len(true_ranges)}, need {period}")
                return None
            
            # Calculate ATR as Simple Moving Average of True Ranges
            atr_values = true_ranges[-period:]
            atr = sum(atr_values) / len(atr_values)
            
            logger.info(f"📊 Calculated ATR from database: {atr:.4f} (period: {period}, data points: {len(quotes_sorted)})")
            
            return ATRResult(
                atr=atr,
                period=period,
                source='database',
                data_points_used=len(quotes_sorted),
                warnings=[],
                conflicts=[]
            )
            
        except Exception as e:
            logger.error(f"Error calculating ATR from database for ticker {ticker_id}: {e}")
            return None
    
    def calculate_atr_from_provider(
        self,
        symbol: str,
        period: int,
        adapter: Any,  # YahooFinanceAdapter or similar
        ticker_id: Optional[int] = None
    ) -> Optional[ATRResult]:
        """
        Calculate ATR from provider (e.g., Yahoo Finance).
        
        Args:
            symbol: Ticker symbol
            period: ATR period
            adapter: Data provider adapter (e.g., YahooFinanceAdapter)
            ticker_id: Ticker ID (optional, for conflict checking)
            
        Returns:
            ATRResult if successful, None if failed
        """
        try:
            # Check for conflicts if we have ticker_id
            conflicts = []
            warnings = []
            
            if ticker_id:
                conflicts = self._check_data_conflicts(ticker_id, adapter, symbol)
                if conflicts:
                    warnings.append(f"Data conflicts detected with existing database records for {symbol}")
            
            # Get historical OHLC data from provider
            historical_data = adapter._get_historical_ohlc_data(symbol, days_back=period + 5)
            
            if len(historical_data) < period + 1:
                logger.warning(f"Insufficient provider data for ATR: {len(historical_data)} points, need {period + 1}")
                return None
            
            # Calculate ATR using adapter's method
            atr = adapter._calculate_atr(historical_data, period)
            
            if atr is None:
                return None
            
            logger.info(f"📊 Calculated ATR from provider: {atr:.4f} (period: {period}, symbol: {symbol})")
            
            return ATRResult(
                atr=atr,
                period=period,
                source='provider',
                data_points_used=len(historical_data),
                warnings=warnings,
                conflicts=conflicts
            )
            
        except Exception as e:
            logger.error(f"Error calculating ATR from provider for {symbol}: {e}")
            return None
    
    def _check_data_conflicts(
        self,
        ticker_id: int,
        adapter: Any,
        symbol: str
    ) -> List[Dict[str, Any]]:
        """
        Check for conflicts between provider data and database data.
        
        Args:
            ticker_id: Ticker ID
            adapter: Data provider adapter
            symbol: Ticker symbol
            
        Returns:
            List of conflict dictionaries
        """
        conflicts = []
        
        try:
            # Get recent quotes from database
            recent_quotes = self.db_session.query(MarketDataQuote).filter(
                and_(
                    MarketDataQuote.ticker_id == ticker_id,
                    MarketDataQuote.asof_utc >= datetime.now(timezone.utc) - timedelta(days=7)
                )
            ).order_by(desc(MarketDataQuote.asof_utc)).limit(5).all()
            
            if not recent_quotes:
                return conflicts
            
            # Get historical data from provider for same dates
            historical_data = adapter._get_historical_ohlc_data(symbol, days_back=7)
            
            if not historical_data:
                return conflicts
            
            # Create date mapping for provider data
            provider_data_map = {data['date'].date(): data for data in historical_data}
            
            # Check for conflicts
            for quote in recent_quotes:
                quote_date = quote.asof_utc.date()
                if quote_date in provider_data_map:
                    provider_data = provider_data_map[quote_date]
                    
                    # Check for significant differences (more than 1%)
                    if quote.close_price and provider_data.get('close'):
                        diff_pct = abs(quote.close_price - provider_data['close']) / quote.close_price * 100
                        if diff_pct > 1.0:
                            conflicts.append({
                                'date': quote_date.isoformat(),
                                'field': 'close_price',
                                'database_value': quote.close_price,
                                'provider_value': provider_data['close'],
                                'difference_pct': diff_pct
                            })
            
        except Exception as e:
            logger.warning(f"Error checking data conflicts for ticker {ticker_id}: {e}")
        
        return conflicts
    
    def get_atr_with_fallback(
        self,
        ticker_id: int,
        period: Optional[int] = None,
        adapter: Optional[Any] = None,
        user_id: Optional[int] = None,
        db_session: Optional[Session] = None
    ) -> Optional[ATRResult]:
        """
        Get ATR with fallback strategy: database first, then provider.
        
        Args:
            ticker_id: Ticker ID
            period: ATR period (optional, uses user preference or default 14)
            adapter: Data provider adapter (optional, needed for provider fallback)
            user_id: User ID (optional, for preference lookup)
            db_session: Database session (optional)
            
        Returns:
            ATRResult if successful, None if failed
        """
        # Get period from user preference if not provided
        if period is None:
            period = self.get_user_atr_period(user_id)
        
        # Try database first (preferred)
        result = self.calculate_atr_from_database(ticker_id, period, db_session)
        if result:
            return result
        
        # Fallback to provider if adapter is available
        if adapter:
            try:
                ticker = self.db_session.query(Ticker).filter(Ticker.id == ticker_id).first()
                if ticker:
                    symbol = ticker.symbol
                    result = self.calculate_atr_from_provider(symbol, period, adapter, ticker_id)
                    if result:
                        return result
            except Exception as e:
                logger.error(f"Error in provider fallback for ticker {ticker_id}: {e}")
        
        logger.warning(f"Could not calculate ATR for ticker {ticker_id} (period: {period})")
        return None

