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
from typing import Dict, List, Optional, Any
import pytz
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Fixed imports for current project structure
from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
# from models.quote import Quote  # Not needed for basic functionality
# from models.market_preferences import MarketPreferences  # Not needed for basic functionality

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
    
    def __init__(self, db_session, config: Dict = None):
        """
        Initialize the Data Refresh Scheduler.
        
        Args:
            db_session: Database session for data operations
            config (Dict, optional): Configuration dictionary
        """
        self.db_session = db_session
        self.config = config or self._get_default_config()
        self.ny_timezone = pytz.timezone('America/New_York')
        self.running = False
        self.scheduler_thread = None
        # Simplified initialization without complex dependencies
        # self.yahoo_adapter = YahooFinanceAdapter(self.config.get('yahoo_finance', {}))
        self.yahoo_adapter = None
        
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
                'batch_size': 50
            },
            'scheduler_interval': 60,  # Check every minute
            'max_concurrent_refreshes': 3
        }
    
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
            try:
                current_ny_time = datetime.now(self.ny_timezone)
                
                # Check if it's a trading day and time
                if self._is_trading_time(current_ny_time):
                    self._process_trading_day_refresh(current_ny_time)
                else:
                    self._process_off_hours_refresh(current_ny_time)
                
                # Wait for next check
                time.sleep(self.config['scheduler_interval'])
                
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
                time.sleep(self.config['scheduler_interval'])
    
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
            return [{'id': t.id, 'symbol': t.symbol, 'name': t.name} for t in tickers]
            
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
            
            # Process tickers in batches
            batch_size = self.config['yahoo_finance']['batch_size']
            successful_refreshes = 0
            failed_refreshes = 0
            
            for i in range(0, len(tickers), batch_size):
                batch = tickers[i:i + batch_size]
                batch_success, batch_failed = self._refresh_batch(batch)
                successful_refreshes += batch_success
                failed_refreshes += batch_failed
                
                # Rate limiting between batches
                if i + batch_size < len(tickers):
                    time.sleep(0.2)  # 200ms delay between batches
            
            # Log group refresh completion
            self._log_group_refresh_completion(group_id, successful_refreshes, failed_refreshes)
                    
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
                # Get the primary provider (Yahoo Finance)
                from models.external_data import ExternalDataProvider
                provider = self.db_session.query(ExternalDataProvider).filter(
                    ExternalDataProvider.name == 'yahoo_finance'
                ).first()
                if provider:
                    self.yahoo_adapter = YahooFinanceAdapter(self.db_session, provider.id)
                else:
                    logger.error("Yahoo Finance provider not found")
                    return 0, 0
            
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
    
    def _log_group_refresh_start(self, category: str, time_period: str, ticker_count: int) -> int:
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
                operation_type='group_refresh',
                symbols_requested=ticker_count,
                symbols_successful=0,
                symbols_failed=0,
                message=f"Started refreshing {ticker_count} tickers in category '{category}' during '{time_period}'"
            )
            
            self.db_session.add(log_entry)
            self.db_session.commit()
            
            logger.info(f"Group refresh started: {category}/{time_period} - {ticker_count} tickers (ID: {log_entry.id})")
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
        """Get current scheduler status."""
        current_ny_time = datetime.now(self.ny_timezone)
        
        return {
            'scheduler_running': self.running,
            'current_ny_time': current_ny_time.isoformat(),
            'is_trading_time': self._is_trading_time(current_ny_time),
            'refresh_policy': self.refresh_policy,
            'config': self.config
        }
    
    def get_group_refresh_history(self, limit: int = 50) -> List[Dict]:
        """Get recent group refresh history."""
        try:
            from models.external_data import DataRefreshLog
            
            # Get recent refresh logs
            logs = self.db_session.query(DataRefreshLog).order_by(
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

# Global scheduler instance
data_refresh_scheduler = None
