"""
Data Refresh Scheduler - External Data Integration
Implements the original specification with NY market clock and smart refresh policy.

This scheduler operates on America/New_York timezone and implements:
- Smart refresh policy based on ticker activity
- Market hours validation (60min minimum off-hours)
- Different refresh rates for active vs inactive tickers
- Weekend handling
- Conservative rate limiting

Author: TikTrack Development Team
Version: 1.0
Date: September 2025
"""

import logging
import time
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable, Tuple
import pytz
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Fixed imports for current project structure
from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
from services.advanced_cache_service import advanced_cache_service
# from models.quote import Quote  # Not needed for basic functionality
# from models.market_preferences import MarketPreferences  # Not needed for basic functionality
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

class DataRefreshScheduler:
    """
    Data Refresh Scheduler with NY market clock and smart refresh policy.
    
    This scheduler implements the original specification:
    - Runs on America/New_York timezone
    - Smart refresh policy based on ticker activity
    - Market hours validation (60min minimum off-hours)
    - Different refresh rates for active vs inactive tickers
    """
    
    def __init__(self, db_session=None, config: Dict = None):
        """
        Initialize the Data Refresh Scheduler.
        
        Args:
            db_session: Database session for data operations
            config (Dict, optional): Configuration dictionary
        """
        self.session_factory = self._get_session_factory(db_session)
        self.db_session = None
        self.config = config or self._get_default_config()
        self.ny_timezone = pytz.timezone('America/New_York')
        self.running = False
        self.scheduler_thread = None
        # Simplified initialization without complex dependencies
        # self.yahoo_adapter = YahooFinanceAdapter(self.config.get('yahoo_finance', {}))
        self.yahoo_adapter = None
        self.provider_id: Optional[int] = None
        self.cache_dependencies: List[str] = ['tickers', 'dashboard', 'external_data']
        
        # Default refresh policy as per specification
        self.refresh_policy = {
            'closed_or_cancelled': {
                'weekdays': {'type': 'daily_after_close', 'offset_minutes': 45},
                'weekend': {'type': 'skip'}
            },
            'open': {
                'active_trades': {
                    'in_hours': {'minutes': 5},
                    'off_hours': {'minutes': 60}
                },
                'no_active_trades': {
                    'in_hours': {'minutes': 60},
                    'off_hours': {'minutes': 60}
                }
            },
            'weekend_open': {'type': 'daily', 'hour_ny': 12},
            'off_hours_min_interval': 60  # Hard guardrail
        }
        
        logger.info("Data Refresh Scheduler initialized with NY market clock")
    
    def _get_default_config(self) -> Dict:
        """Get default configuration for the scheduler."""
        return {
            'yahoo_finance': {
                'timeout': 20,
                'retry_attempts': 2,
                'batch_size': 25,  # Optimal batch size (matches YahooFinanceAdapter.preferred_batch_size)
                'min_batch_size': 5  # Minimum batch size if errors occur
            },
            'scheduler_interval': 60,  # Check every minute
            'max_concurrent_refreshes': 3
        }
    
    def _get_session_factory(self, db_session) -> Callable[[], "Session"]:
        """Create a session factory from a provided session or use global SessionLocal."""
        if callable(db_session):
            return db_session

        if db_session is not None:
            try:
                bind = db_session.get_bind()
                factory = sessionmaker(autocommit=False, autoflush=False, bind=bind)
            finally:
                try:
                    db_session.close()
                except Exception:
                    pass
            return factory

        from config.database import SessionLocal
        return SessionLocal
    
    def start(self):
        """Start the scheduler."""
        if self.running:
            logger.warning("Data Refresh Scheduler is already running")
            return
        
        self.running = True
        self.scheduler_thread = threading.Thread(target=self._scheduler_loop, daemon=True)
        self.scheduler_thread.start()
        logger.info("Data Refresh Scheduler started")
    
    def stop(self):
        """Stop the scheduler."""
        self.running = False
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
        logger.info("Data Refresh Scheduler stopped")
    
    def _scheduler_loop(self):
        """Main scheduler loop."""
        while self.running:
            session = None
            try:
                session = self.session_factory()
                self.db_session = session
                self.yahoo_adapter = None

                current_ny_time = datetime.now(self.ny_timezone)

                # Check if it's a trading day and time
                if self._is_trading_time(current_ny_time):
                    self._process_trading_day_refresh(current_ny_time)
                else:
                    self._process_off_hours_refresh(current_ny_time)

                # Wait for next check
                time.sleep(self.config['scheduler_interval'])

            except Exception as e:
                if session:
                    session.rollback()
                logger.error(f"Error in scheduler loop: {e}")
                time.sleep(self.config['scheduler_interval'])
            finally:
                if session:
                    session.close()
                self.db_session = None
                self.yahoo_adapter = None
    
    def _is_trading_time(self, ny_time: datetime) -> bool:
        """
        Check if current time is within trading hours.
        
        Args:
            ny_time: Current time in NY timezone
            
        Returns:
            bool: True if within trading hours
        """
        # Weekend check
        if ny_time.weekday() >= 5:  # Saturday = 5, Sunday = 6
            return False
        
        # Trading hours: 9:30 AM - 4:00 PM ET
        trading_start = ny_time.replace(hour=9, minute=30, second=0, microsecond=0)
        trading_end = ny_time.replace(hour=16, minute=0, second=0, microsecond=0)
        
        return trading_start <= ny_time <= trading_end
    
    def _process_trading_day_refresh(self, ny_time: datetime):
        """Process refresh during trading hours."""
        try:
            # Get active tickers that need refresh
            active_tickers = self._get_tickers_needing_refresh('active_trades', 'in_hours')
            if active_tickers:
                logger.info(f"Refreshing {len(active_tickers)} active tickers during trading hours")
                self._refresh_tickers(active_tickers, 'active_trades', 'in_hours')
            
            # Get inactive tickers that need refresh (less frequent)
            inactive_tickers = self._get_tickers_needing_refresh('no_active_trades', 'in_hours')
            if inactive_tickers:
                logger.info(f"Refreshing {len(inactive_tickers)} inactive tickers during trading hours")
                self._refresh_tickers(inactive_tickers, 'no_active_trades', 'in_hours')
                
        except Exception as e:
            logger.error(f"Error processing trading day refresh: {e}")
    
    def _process_off_hours_refresh(self, ny_time: datetime):
        """Process refresh during off-hours (respecting 60min minimum)."""
        try:
            # Check if we should load historical data (once per day after market close)
            if self._should_load_historical_data(ny_time):
                self._process_daily_historical_refresh(ny_time)
            
            # During off-hours, only refresh if enough time has passed
            last_refresh = self._get_last_refresh_time()
            if last_refresh:
                time_since_refresh = (ny_time - last_refresh).total_seconds() / 60
                if time_since_refresh < self.refresh_policy['off_hours_min_interval']:
                    return  # Respect 60min minimum
            
            # Get active tickers for off-hours refresh
            active_tickers = self._get_tickers_needing_refresh('active_trades', 'off_hours')
            if active_tickers:
                logger.info(f"Refreshing {len(active_tickers)} active tickers during off-hours")
                self._refresh_tickers(active_tickers, 'active_trades', 'off_hours')
                
        except Exception as e:
            logger.error(f"Error processing off-hours refresh: {e}")
    
    def _should_load_historical_data(self, ny_time: datetime) -> bool:
        """
        Check if historical data should be loaded (once per day after market close).
        
        Args:
            ny_time: Current time in NY timezone
            
        Returns:
            bool: True if historical data should be loaded
        """
        try:
            # Only load historical data on weekdays after market close (after 5 PM)
            if ny_time.weekday() >= 5:  # Weekend
                return False
            
            # Check if it's after market close (after 5 PM)
            if ny_time.hour < 17:  # Before 5 PM
                return False
            
            # Check if we already loaded historical data today
            from models.external_data import DataRefreshLog
            today_start = ny_time.replace(hour=0, minute=0, second=0, microsecond=0)
            today_end = ny_time.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            # Check if there's a historical data refresh log for today
            existing_log = self.db_session.query(DataRefreshLog).filter(
                DataRefreshLog.operation_type == 'historical_data',
                DataRefreshLog.start_time >= today_start,
                DataRefreshLog.start_time <= today_end,
                DataRefreshLog.status.in_(['success', 'partial_success', 'completed'])
            ).first()
            
            if existing_log:
                logger.debug(f"Historical data already loaded today at {existing_log.start_time}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking if should load historical data: {e}")
            return False
    
    def _process_daily_historical_refresh(self, ny_time: datetime):
        """
        Process daily historical data refresh (after market close).
        Loads historical data and calculates technical indicators for all open tickers.
        """
        try:
            logger.info("🔄 Starting daily historical data refresh...")
            
            # Get all open tickers
            from models.ticker import Ticker
            open_tickers = self.db_session.query(Ticker).filter(
                Ticker.status == 'open'
            ).all()
            
            if not open_tickers:
                logger.info("No open tickers to refresh historical data for")
                return
            
            logger.info(f"📊 Loading historical data for {len(open_tickers)} open tickers...")
            
            # Initialize Yahoo Finance adapter if needed
            if not self.yahoo_adapter:
                from models.external_data import ExternalDataProvider
                if self.provider_id is None:
                    provider = self.db_session.query(ExternalDataProvider).filter(
                        ExternalDataProvider.name == 'yahoo_finance'
                    ).first()
                    if not provider:
                        logger.error("Yahoo Finance provider not found")
                        return
                    self.provider_id = provider.id
                self.yahoo_adapter = YahooFinanceAdapter(self.db_session, self.provider_id)
            
            # Log group refresh start
            group_id = self._log_group_refresh_start('historical_data', 'daily', len(open_tickers), operation_type='historical_data')
            
            successful_refreshes = 0
            failed_refreshes = 0
            
            # Process tickers in batches
            batch_size = self.config['yahoo_finance']['batch_size']
            min_batch_size = self.config['yahoo_finance'].get('min_batch_size', 5)
            consecutive_errors = 0
            
            i = 0
            while i < len(open_tickers):
                batch = open_tickers[i:i + batch_size]
                batch_success, batch_failed = self._refresh_historical_batch(batch)
                successful_refreshes += batch_success
                failed_refreshes += batch_failed
                
                # Dynamic batch size adjustment
                batch_total = batch_success + batch_failed
                if batch_total > 0:
                    failure_rate = batch_failed / batch_total
                    if failure_rate > 0.5:
                        consecutive_errors += 1
                        if consecutive_errors >= 2 and batch_size > min_batch_size:
                            new_batch_size = max(min_batch_size, batch_size // 2)
                            logger.warning(f"High failure rate ({failure_rate:.1%}) detected. Reducing batch size from {batch_size} to {new_batch_size}")
                            batch_size = new_batch_size
                            consecutive_errors = 0
                    else:
                        consecutive_errors = 0
                
                i += batch_size
                
                # Rate limiting between batches
                if i < len(open_tickers):
                    time.sleep(0.5)  # 500ms delay between batches for historical data
            
            # Log group refresh completion
            self._log_group_refresh_completion(group_id, successful_refreshes, failed_refreshes)
            
            logger.info(f"✅ Daily historical data refresh completed: {successful_refreshes} successful, {failed_refreshes} failed")
            
            # Invalidate cache dependencies
            if successful_refreshes > 0:
                self._invalidate_cache_dependencies()
                
        except Exception as e:
            logger.error(f"Error processing daily historical refresh: {e}")
            if 'group_id' in locals():
                self._log_group_refresh_failure(group_id, str(e))
    
    def _refresh_historical_batch(self, tickers: List) -> Tuple[int, int]:
        """
        Refresh historical data for a batch of tickers.
        
        Args:
            tickers: List of Ticker objects
            
        Returns:
            tuple: (successful_refreshes, failed_refreshes)
        """
        try:
            if not tickers:
                return 0, 0
            
            successful_refreshes = 0
            failed_refreshes = 0
            
            for ticker in tickers:
                try:
                    # Fetch and save historical quotes (150 days for MA 150)
                    quotes_saved = self.yahoo_adapter.fetch_and_save_historical_quotes(ticker, days_back=150)
                    
                    if quotes_saved > 0:
                        # Calculate technical indicators after loading historical data
                        self._calculate_technical_indicators(ticker)
                        successful_refreshes += 1
                        logger.debug(f"✅ Loaded {quotes_saved} historical quotes for {ticker.symbol}")
                    else:
                        logger.warning(f"⚠️ No historical quotes loaded for {ticker.symbol}")
                        failed_refreshes += 1
                        
                except Exception as e:
                    logger.error(f"❌ Error refreshing historical data for {ticker.symbol}: {e}")
                    failed_refreshes += 1
            
            return successful_refreshes, failed_refreshes
            
        except Exception as e:
            logger.error(f"Error refreshing historical batch: {e}")
            return 0, len(tickers)
    
    def _calculate_technical_indicators(self, ticker):
        """
        Calculate technical indicators for a ticker after loading historical data.
        This includes ATR, Volatility, MA 20, MA 150, and 52W Range.
        """
        try:
            from services.external_data.technical_indicators_calculator import TechnicalIndicatorsCalculator
            from services.external_data.week52_calculator import Week52Calculator
            from services.advanced_cache_service import advanced_cache_service
            from models.external_data import MarketDataQuote
            from sqlalchemy import func
            
            # Check if we have enough historical data
            historical_count = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker.id
            ).count()
            
            if historical_count < 20:  # Need at least 20 for MA 20
                logger.warning(f"Insufficient historical data for {ticker.symbol} ({historical_count} quotes, need at least 20)")
                return
            
            logger.debug(f"Calculating technical indicators for {ticker.symbol} (have {historical_count} quotes)")
            
            # Calculate technical indicators
            tech_calculator = TechnicalIndicatorsCalculator(self.db_session)
            week52_calculator = Week52Calculator(self.db_session)
            
            indicators_calculated = []
            
            # Calculate Volatility (30-day)
            if historical_count >= 30:
                try:
                    volatility = tech_calculator.calculate_volatility(ticker.id, period=30)
                    if volatility is not None:
                        cache_key = f"ticker_{ticker.id}_volatility_30"
                        advanced_cache_service.set(cache_key, volatility, ttl=24*60*60)  # 24 hours
                        indicators_calculated.append('volatility_30')
                        logger.debug(f"✅ Calculated volatility_30 for {ticker.symbol}: {volatility:.4f}")
                except Exception as e:
                    logger.warning(f"Failed to calculate volatility for {ticker.symbol}: {e}")
            
            # Calculate MA 20
            if historical_count >= 20:
                try:
                    ma20 = tech_calculator.calculate_moving_average(ticker.id, period=20)
                    if ma20 is not None:
                        cache_key = f"ticker_{ticker.id}_ma_20"
                        advanced_cache_service.set(cache_key, ma20, ttl=24*60*60)  # 24 hours
                        indicators_calculated.append('ma_20')
                        logger.debug(f"✅ Calculated MA 20 for {ticker.symbol}: {ma20:.2f}")
                except Exception as e:
                    logger.warning(f"Failed to calculate MA 20 for {ticker.symbol}: {e}")
            
            # Calculate MA 150
            if historical_count >= 150:
                try:
                    ma150 = tech_calculator.calculate_moving_average(ticker.id, period=150)
                    if ma150 is not None:
                        cache_key = f"ticker_{ticker.id}_ma_150"
                        advanced_cache_service.set(cache_key, ma150, ttl=24*60*60)  # 24 hours
                        indicators_calculated.append('ma_150')
                        logger.debug(f"✅ Calculated MA 150 for {ticker.symbol}: {ma150:.2f}")
                except Exception as e:
                    logger.warning(f"Failed to calculate MA 150 for {ticker.symbol}: {e}")
            
            # Calculate 52W Range
            if historical_count >= 10:  # Need at least some data
                try:
                    week52_data = week52_calculator.calculate_52_week_range(ticker.id)
                    if week52_data and 'high' in week52_data and 'low' in week52_data:
                        cache_key = f"ticker_{ticker.id}_week52"
                        advanced_cache_service.set(cache_key, week52_data, ttl=24*60*60)  # 24 hours
                        indicators_calculated.append('week52')
                        logger.debug(f"✅ Calculated 52W range for {ticker.symbol}: {week52_data['high']:.2f} - {week52_data['low']:.2f}")
                except Exception as e:
                    logger.warning(f"Failed to calculate 52W range for {ticker.symbol}: {e}")
            
            # ATR is calculated and stored in MarketDataQuote during quote refresh
            # It will be calculated on the next quote refresh
            
            if indicators_calculated:
                logger.info(f"✅ Calculated {len(indicators_calculated)} technical indicators for {ticker.symbol}: {', '.join(indicators_calculated)}")
            else:
                logger.warning(f"⚠️ No technical indicators calculated for {ticker.symbol} (may need more historical data)")
            
        except Exception as e:
            logger.error(f"Error calculating technical indicators for {ticker.symbol}: {e}")
    
    def _get_tickers_needing_refresh(self, category: str, time_period: str) -> List[Dict]:
        """
        Get tickers that need refresh based on category and time period.
        
        Args:
            category: 'active_trades' or 'no_active_trades'
            time_period: 'in_hours' or 'off_hours'
            
        Returns:
            List[Dict]: List of tickers needing refresh
        """
        try:
            # Check if db_session is available
            if not self.db_session:
                logger.warning("Database session not available for ticker refresh")
                return []
            
            # Get refresh interval for this category and time period
            refresh_minutes = self.refresh_policy['open'][category][time_period]['minutes']
            
            # Get tickers that haven't been refreshed recently
            # Use NY timezone for consistency
            ny_tz = pytz.timezone('America/New_York')
            cutoff_time = datetime.now(ny_tz) - timedelta(minutes=refresh_minutes)
            
            # Query database for tickers needing refresh
            from models.ticker import Ticker
            from models.trade import Trade
            
            # Build query based on category
            if category == 'active_trades':
                # Tickers with active trades
                query = self.db_session.query(Ticker).join(
                    Trade, Ticker.id == Trade.ticker_id
                ).filter(
                    Ticker.status == 'open',
                    Trade.status == 'open',
                    (Ticker.updated_at.is_(None)) | (Ticker.updated_at < cutoff_time)
                ).distinct()
            else:  # no_active_trades
                # Tickers without active trades
                query = self.db_session.query(Ticker).outerjoin(
                    Trade, (Ticker.id == Trade.ticker_id) & (Trade.status == 'open')
                ).filter(
                    Ticker.status == 'open',
                    Trade.id.is_(None),
                    (Ticker.updated_at.is_(None)) | (Ticker.updated_at < cutoff_time)
                )
            
            # Execute query and return results
            tickers = query.all()
            sanitized_tickers: List[Dict[str, Any]] = []
            for ticker in tickers:
                symbol = (ticker.symbol or '').strip()
                if not symbol:
                    logger.warning(f"Skipping ticker {ticker.id} due to missing symbol")
                    continue
                sanitized_tickers.append({
                    'id': ticker.id,
                    'symbol': symbol,
                    'name': ticker.name
                })
            return sanitized_tickers
            
        except Exception as e:
            logger.error(f"Error getting tickers needing refresh: {e}")
            return []
    
    def _refresh_tickers(self, tickers: List[Dict], category: str = None, time_period: str = None):
        """
        Refresh data for a list of tickers.
        
        Args:
            tickers: List of tickers to refresh
            category: Category of tickers being refreshed (for logging)
            time_period: Time period of refresh (for logging)
        """
        try:
            if not tickers:
                return
                
            # Log group refresh start
            group_id = self._log_group_refresh_start(category, time_period, len(tickers))
            
            # Process tickers in batches with dynamic batch size adjustment
            batch_size = self.config['yahoo_finance']['batch_size']
            min_batch_size = self.config['yahoo_finance'].get('min_batch_size', 5)
            successful_refreshes = 0
            failed_refreshes = 0
            consecutive_errors = 0  # Track consecutive batch errors for dynamic adjustment
            
            i = 0
            while i < len(tickers):
                batch = tickers[i:i + batch_size]
                batch_success, batch_failed = self._refresh_batch(batch)
                successful_refreshes += batch_success
                failed_refreshes += batch_failed
                
                # Dynamic batch size adjustment: if batch has high failure rate, reduce batch size
                batch_total = batch_success + batch_failed
                if batch_total > 0:
                    failure_rate = batch_failed / batch_total
                    if failure_rate > 0.5:  # More than 50% failures
                        consecutive_errors += 1
                        if consecutive_errors >= 2 and batch_size > min_batch_size:
                            # Reduce batch size by half, but not below minimum
                            new_batch_size = max(min_batch_size, batch_size // 2)
                            logger.warning(f"High failure rate ({failure_rate:.1%}) detected. Reducing batch size from {batch_size} to {new_batch_size}")
                            batch_size = new_batch_size
                            consecutive_errors = 0  # Reset counter after adjustment
                    else:
                        consecutive_errors = 0  # Reset on success
                
                i += batch_size
                
                # Rate limiting between batches
                if i < len(tickers):
                    time.sleep(0.2)  # 200ms delay between batches
            
            # Log group refresh completion
            self._log_group_refresh_completion(group_id, successful_refreshes, failed_refreshes)

            if successful_refreshes > 0:
                self._invalidate_cache_dependencies()
                    
        except Exception as e:
            logger.error(f"Error refreshing tickers: {e}")
            # Log group refresh failure
            if 'group_id' in locals():
                self._log_group_refresh_failure(group_id, str(e))
    
    def _refresh_batch(self, tickers: List[Dict]):
        """
        Refresh a batch of tickers.
        
        Args:
            tickers: Batch of tickers to refresh
            
        Returns:
            tuple: (successful_refreshes, failed_refreshes)
        """
        try:
            if not tickers:
                return 0, 0
                
            # Initialize Yahoo Finance adapter if needed
            if not self.yahoo_adapter:
                from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
                from models.external_data import ExternalDataProvider

                if self.provider_id is None:
                    provider = self.db_session.query(ExternalDataProvider).filter(
                        ExternalDataProvider.name == 'yahoo_finance'
                    ).first()
                    if not provider:
                        logger.error("Yahoo Finance provider not found")
                        return 0, len(tickers)
                    self.provider_id = provider.id

                self.yahoo_adapter = YahooFinanceAdapter(self.db_session, self.provider_id)
            
            # Extract symbols for batch request
            symbols = [ticker['symbol'] for ticker in tickers]
            logger.info(f"Refreshing batch of {len(symbols)} tickers: {', '.join(symbols)}")
            
            # Fetch data from Yahoo Finance
            quotes_data = self.yahoo_adapter.get_quotes_batch(symbols)
            
            # Update database with new data
            successful_refreshes = 0
            failed_refreshes = 0
            
            for quote_data in quotes_data:
                try:
                    self._update_quote_in_database(quote_data)
                    successful_refreshes += 1
                except Exception as e:
                    logger.error(f"Failed to update quote for {quote_data.symbol}: {e}")
                    failed_refreshes += 1
                
            # Log successful batch refresh
            logger.info(f"Batch refresh completed: {successful_refreshes} successful, {failed_refreshes} failed")
            return successful_refreshes, failed_refreshes
                
        except Exception as e:
            logger.error(f"Error refreshing batch: {e}")
            return 0, len(tickers)
    
    def _update_quote_in_database(self, quote_data):
        """Update quote data in database."""
        try:
            from models.ticker import Ticker
            from models.external_data import MarketDataQuote
            
            # Find ticker by symbol
            ticker = self.db_session.query(Ticker).filter(Ticker.symbol == quote_data.symbol).first()
            if not ticker:
                logger.warning(f"Ticker not found for symbol: {quote_data.symbol}")
                return
            
            # Create new quote record
            new_quote = MarketDataQuote(
                ticker_id=ticker.id,
                provider_id=self.yahoo_adapter.provider_id if self.yahoo_adapter else 1,  # Default to Yahoo Finance
                price=quote_data.price,
                currency=quote_data.currency,
                asof_utc=quote_data.asof_utc,
                source=quote_data.source,
                volume=quote_data.volume,
                change_pct_day=quote_data.change_pct_day or quote_data.change_pct
            )
            
            # Add to session and commit
            self.db_session.add(new_quote)
            self.db_session.commit()
            
            # Update ticker's updated_at timestamp
            # Use NY timezone for consistency
            ny_tz = pytz.timezone('America/New_York')
            ticker.updated_at = datetime.now(ny_tz)
            self.db_session.commit()
            
            logger.debug(f"Updated quote for {quote_data.symbol}: ${quote_data.price}")
            
        except Exception as e:
            logger.error(f"Error updating quote for {quote_data.symbol}: {e}")
            self.db_session.rollback()
    
    def _get_last_refresh_time(self) -> Optional[datetime]:
        """Get the last time data was refreshed."""
        try:
            from models.external_data import MarketDataQuote
            
            # Get the most recent quote timestamp
            last_quote = self.db_session.query(MarketDataQuote).order_by(
                MarketDataQuote.asof_utc.desc()
            ).first()
            
            if last_quote:
                # Convert UTC to NY timezone for comparison
                ny_tz = pytz.timezone('America/New_York')
                return last_quote.asof_utc.astimezone(ny_tz)
            return None
            
        except Exception as e:
            logger.error(f"Error getting last refresh time: {e}")
            return None
    
    def _log_group_refresh_start(self, category: str, time_period: str, ticker_count: int, operation_type: str = 'group_refresh') -> int:
        """Log the start of a group refresh operation."""
        try:
            from models.external_data import DataRefreshLog, ExternalDataProvider
            
            # Get the primary provider (Yahoo Finance)
            provider = self.db_session.query(ExternalDataProvider).filter(
                ExternalDataProvider.name == 'yahoo_finance'
            ).first()
            
            # Create new log entry
            log_entry = DataRefreshLog(
                provider_id=provider.id if provider else None,
                category=category or 'unknown',
                time_period=time_period or 'unknown',
                ticker_count=ticker_count,
                status='started',
                start_time=datetime.now(),
                operation_type=operation_type,
                symbols_requested=ticker_count,
                symbols_successful=0,
                symbols_failed=0,
                message=f"Started {operation_type} for {ticker_count} tickers in category '{category}' during '{time_period}'"
            )
            
            self.db_session.add(log_entry)
            self.db_session.commit()
            
            logger.info(f"{operation_type} started: {category}/{time_period} - {ticker_count} tickers (ID: {log_entry.id})")
            return log_entry.id
            
        except Exception as e:
            logger.error(f"Error logging group refresh start: {e}")
            return -1
    
    def _log_group_refresh_completion(self, group_id: int, successful: int, failed: int):
        """Log the completion of a group refresh operation."""
        try:
            if group_id == -1:
                return
                
            from models.external_data import DataRefreshLog
            
            # Update log entry
            log_entry = self.db_session.query(DataRefreshLog).filter(DataRefreshLog.id == group_id).first()
            if log_entry:
                log_entry.status = 'completed'
                log_entry.end_time = datetime.now()
                log_entry.successful_count = successful
                log_entry.failed_count = failed
                log_entry.symbols_successful = successful
                log_entry.symbols_failed = failed
                log_entry.message = f"Completed: {successful} successful, {failed} failed"
                
                self.db_session.commit()
                
                logger.info(f"Group refresh completed: ID {group_id} - {successful} successful, {failed} failed")
            
        except Exception as e:
            logger.error(f"Error logging group refresh completion: {e}")

    def _invalidate_cache_dependencies(self) -> None:
        """Invalidate unified cache dependencies after successful refresh."""
        for dependency in self.cache_dependencies:
            try:
                advanced_cache_service.invalidate_by_dependency(dependency)
            except Exception as exc:
                logger.error(f"Failed to invalidate cache dependency '{dependency}': {exc}")
    
    def _log_group_refresh_failure(self, group_id: int, error_message: str):
        """Log the failure of a group refresh operation."""
        try:
            if group_id == -1:
                return
                
            from models.external_data import DataRefreshLog
            
            # Update log entry
            log_entry = self.db_session.query(DataRefreshLog).filter(DataRefreshLog.id == group_id).first()
            if log_entry:
                log_entry.status = 'failed'
                log_entry.end_time = datetime.now()
                log_entry.message = f"Failed: {error_message}"
                
                self.db_session.commit()
                
                logger.error(f"Group refresh failed: ID {group_id} - {error_message}")
            
        except Exception as e:
            logger.error(f"Error logging group refresh failure: {e}")

    def get_scheduler_status(self) -> Dict[str, Any]:
        """Get current scheduler status with detailed information."""
        current_ny_time = datetime.now(self.ny_timezone)
        session = None
        
        try:
            from models.external_data import DataRefreshLog
            
            session = self.session_factory()
            
            # Get last refresh time
            last_refresh_log = session.query(DataRefreshLog).filter(
                DataRefreshLog.operation_type == 'group_refresh',
                DataRefreshLog.status.in_(['success', 'partial_success', 'completed'])
            ).order_by(DataRefreshLog.end_time.desc()).first()
            
            last_refresh = None
            if last_refresh_log and last_refresh_log.end_time:
                last_refresh = last_refresh_log.end_time.isoformat()
            
            # Get refresh statistics
            total_refreshes = session.query(DataRefreshLog).filter(
                DataRefreshLog.operation_type == 'group_refresh'
            ).count()
            
            successful_refreshes = session.query(DataRefreshLog).filter(
                DataRefreshLog.operation_type == 'group_refresh',
                DataRefreshLog.status.in_(['success', 'partial_success', 'completed'])
            ).count()
            
            failed_refreshes = session.query(DataRefreshLog).filter(
                DataRefreshLog.operation_type == 'group_refresh',
                DataRefreshLog.status == 'failed'
            ).count()
            
            # Calculate next refresh time based on policy
            next_refresh = None
            if self.running and last_refresh_log:
                # Calculate next refresh based on category and time period
                if last_refresh_log.category == 'active_trades':
                    if last_refresh_log.time_period == 'in_hours':
                        # 5 minutes for active trades in hours
                        next_refresh_time = last_refresh_log.end_time + timedelta(minutes=5)
                    else:  # off_hours
                        # 60 minutes for active trades off hours
                        next_refresh_time = last_refresh_log.end_time + timedelta(minutes=60)
                elif last_refresh_log.category == 'no_active_trades':
                    # 60 minutes for no active trades
                    next_refresh_time = last_refresh_log.end_time + timedelta(minutes=60)
                else:
                    # Default to 60 minutes
                    next_refresh_time = last_refresh_log.end_time + timedelta(minutes=60)
                
                if next_refresh_time:
                    next_refresh = next_refresh_time.isoformat()
            
            # Get when scheduler started (if running)
            started_at = None
            if self.running and self.scheduler_thread and self.scheduler_thread.is_alive():
                # Try to get the first log entry after scheduler started
                first_log = session.query(DataRefreshLog).filter(
                    DataRefreshLog.operation_type == 'group_refresh'
                ).order_by(DataRefreshLog.start_time.asc()).first()
                if first_log:
                    started_at = first_log.start_time.isoformat()
            
            return {
                'scheduler_running': self.running,
                'current_ny_time': current_ny_time.isoformat(),
                'is_trading_time': self._is_trading_time(current_ny_time),
                'refresh_policy': self.refresh_policy,
                'config': self.config,
                'last_refresh': last_refresh,
                'next_refresh': next_refresh,
                'total_refreshes': total_refreshes,
                'successful_refreshes': successful_refreshes,
                'failed_refreshes': failed_refreshes,
                'started_at': started_at
            }
        except Exception as e:
            logger.error(f"Error getting detailed scheduler status: {e}")
            # Return basic status if error
            return {
                'scheduler_running': self.running,
                'current_ny_time': current_ny_time.isoformat(),
                'is_trading_time': self._is_trading_time(current_ny_time),
                'refresh_policy': self.refresh_policy,
                'config': self.config,
                'last_refresh': None,
                'next_refresh': None,
                'total_refreshes': 0,
                'successful_refreshes': 0,
                'failed_refreshes': 0,
                'started_at': None,
                'error': str(e)
            }
        finally:
            if session:
                session.close()
    
    def get_group_refresh_history(self, limit: int = 50) -> List[Dict]:
        """Get recent group refresh history."""
        session = None
        try:
            from models.external_data import DataRefreshLog

            session = self.session_factory()
            logs = session.query(DataRefreshLog).order_by(
                DataRefreshLog.start_time.desc()
            ).limit(limit).all()

            return [
                {
                    'id': log.id,
                    'category': log.category,
                    'time_period': log.time_period,
                    'ticker_count': log.ticker_count,
                    'status': log.status,
                    'started_at': log.start_time.isoformat() if log.start_time else None,
                    'completed_at': log.end_time.isoformat() if log.end_time else None,
                    'successful_count': log.successful_count,
                    'failed_count': log.failed_count,
                    'message': log.message
                }
                for log in logs
            ]

        except Exception as e:
            logger.error(f"Error getting group refresh history: {e}")
            return []
        finally:
            if session:
                session.close()

# Global scheduler instance
data_refresh_scheduler = None
