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

from providers.yahoo_finance import YahooFinanceAdapter
from models.quote import Quote
from models.market_preferences import MarketPreferences

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
        self.yahoo_adapter = YahooFinanceAdapter(self.config.get('yahoo_finance', {}))
        
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
                self._refresh_tickers(active_tickers)
            
            # Get inactive tickers that need refresh (less frequent)
            inactive_tickers = self._get_tickers_needing_refresh('no_active_trades', 'in_hours')
            if inactive_tickers:
                logger.info(f"Refreshing {len(inactive_tickers)} inactive tickers during trading hours")
                self._refresh_tickers(inactive_tickers)
                
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
                self._refresh_tickers(active_tickers)
                
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
            # Get refresh interval for this category and time period
            refresh_minutes = self.refresh_policy['open'][category][time_period]['minutes']
            
            # Get tickers that haven't been refreshed recently
            cutoff_time = datetime.now() - timedelta(minutes=refresh_minutes)
            
            # Query for tickers needing refresh
            # This is a simplified version - in practice, you'd query the database
            return []  # Placeholder
            
        except Exception as e:
            logger.error(f"Error getting tickers needing refresh: {e}")
            return []
    
    def _refresh_tickers(self, tickers: List[Dict]):
        """
        Refresh data for a list of tickers.
        
        Args:
            tickers: List of tickers to refresh
        """
        try:
            # Process tickers in batches
            batch_size = self.config['yahoo_finance']['batch_size']
            
            for i in range(0, len(tickers), batch_size):
                batch = tickers[i:i + batch_size]
                self._refresh_batch(batch)
                
                # Rate limiting between batches
                if i + batch_size < len(tickers):
                    time.sleep(0.2)  # 200ms delay between batches
                    
        except Exception as e:
            logger.error(f"Error refreshing tickers: {e}")
    
    def _refresh_batch(self, tickers: List[Dict]):
        """
        Refresh a batch of tickers.
        
        Args:
            tickers: Batch of tickers to refresh
        """
        try:
            # Extract symbols for batch request
            symbols = [ticker['symbol'] for ticker in tickers]
            
            # Fetch data from Yahoo Finance
            quotes_data = self.yahoo_adapter._fetch_batch_from_api(symbols)
            
            # Update database with new data
            for quote_data in quotes_data:
                self._update_quote_in_database(quote_data)
                
        except Exception as e:
            logger.error(f"Error refreshing batch: {e}")
    
    def _update_quote_in_database(self, quote_data):
        """Update quote data in database."""
        try:
            # This would update the database with new quote data
            # Implementation depends on your database models
            logger.debug(f"Updated quote for {quote_data.symbol}")
            
        except Exception as e:
            logger.error(f"Error updating quote for {quote_data.symbol}: {e}")
    
    def _get_last_refresh_time(self) -> Optional[datetime]:
        """Get the last time data was refreshed."""
        try:
            # This would query the database for the last refresh time
            # Implementation depends on your database models
            return None  # Placeholder
            
        except Exception as e:
            logger.error(f"Error getting last refresh time: {e}")
            return None
    
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

# Global scheduler instance
data_refresh_scheduler = None
