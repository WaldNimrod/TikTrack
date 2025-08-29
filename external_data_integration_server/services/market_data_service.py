"""
Market Data Service - External Data Integration
Central service for managing market data operations and orchestration.

This service acts as the main orchestrator for all market data operations,
including fetching data from external providers, managing the cache,
updating the database, and handling user preferences. It provides a
unified interface for all market data functionality.

Key Responsibilities:
- Orchestrating data fetching from multiple providers
- Managing data caching and freshness
- Updating database with new market data
- Handling user preferences and settings
- Providing unified API for market data operations
- Error handling and logging

Author: TikTrack Development Team
Created: January 2025
Version: 1.0
"""

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
from ..providers.yahoo_finance import YahooFinanceAdapter
from ..models.quote import Quote
from ..models.market_preferences import MarketPreferences

logger = logging.getLogger(__name__)


class MarketDataService:
    """
    Central service for market data operations and orchestration.
    
    This service provides a unified interface for all market data operations,
    including fetching, caching, updating, and managing user preferences.
    It acts as the main coordinator between external providers, the database,
    and the application's business logic.
    
    Key Features:
    - Single ticker price retrieval and updates
    - Batch operations for multiple tickers
    - Automatic cache management
    - User preference handling
    - Provider status monitoring
    - Timezone conversion support
    """
    
    def __init__(self, db_session, config: Dict = None):
        """
        Initialize the Market Data Service.
        
        Args:
            db_session: Database session for data operations
            config (Dict, optional): Configuration dictionary for providers and settings
        """
        self.db_session = db_session
        self.config = config or self._get_default_config()
        self.yahoo_adapter = YahooFinanceAdapter(self.config.get('yahoo_finance', {}))
        
    def _get_default_config(self) -> Dict:
        """
        Get default configuration for the service.
        
        Returns:
            Dict: Default configuration including provider settings and cache TTL
        """
        return {
            'yahoo_finance': {
                'timeout': 20,  # Request timeout in seconds
                'retry_attempts': 2,  # Number of retry attempts for failed requests
                'batch_size': 50  # Maximum number of symbols per batch request
            },
            'cache_ttl': 60,  # Cache time-to-live in seconds
            'default_provider': 'yahoo_finance'  # Default data provider
        }
    
    def get_ticker_price(self, ticker_id: int, user_id: int = None) -> Optional[Dict]:
        """
        Get current price for a specific ticker.
        
        This method retrieves the latest price data for a ticker from the database.
        If a user_id is provided, it also applies timezone conversion based on
        the user's preferences.
        
        Args:
            ticker_id (int): The ID of the ticker to get price for
            user_id (int, optional): User ID for timezone conversion
            
        Returns:
            Dict or None: Price data dictionary or None if not found/error
        """
        try:
            # First try to get from database
            quote = Quote.get_latest_quote(self.db_session, ticker_id)
            
            if quote:
                quote_dict = quote.to_dict()
                
                # Add timezone conversion if user_id provided
                if user_id:
                    preferences = MarketPreferences.get_user_preferences(self.db_session, user_id)
                    if preferences:
                        quote_dict = self._add_timezone_info(quote_dict, preferences.timezone)
                
                return quote_dict
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get ticker price for {ticker_id}: {e}")
            return None
    
    def update_ticker_price(self, ticker_id: int, force_refresh: bool = False) -> Optional[Dict]:
        """
        Update price for a ticker from external provider.
        
        This method fetches fresh price data from the external provider and
        updates the database. It includes basic caching logic to avoid
        unnecessary API calls.
        
        Args:
            ticker_id (int): The ID of the ticker to update
            force_refresh (bool): Whether to force refresh regardless of cache
            
        Returns:
            Dict or None: Updated price data or None if failed
        """
        try:
            # Get ticker symbol from database
            from ..models.ticker import Ticker
            ticker = self.db_session.query(Ticker).filter(Ticker.id == ticker_id).first()
            
            if not ticker:
                logger.error(f"Ticker {ticker_id} not found")
                return None
            
            # Check if we need to refresh (basic cache check)
            if not force_refresh:
                quote = Quote.get_latest_quote(self.db_session, ticker_id)
                if quote and self._is_quote_fresh(quote):
                    logger.debug(f"Quote for {ticker.symbol} is fresh, skipping refresh")
                    return quote.to_dict()
            
            # Fetch from Yahoo Finance
            quote_data = self.yahoo_adapter.fetch_quote_data(ticker.symbol)
            
            if not quote_data or not self.yahoo_adapter.validate_response(quote_data):
                logger.warning(f"Invalid response from Yahoo Finance for {ticker.symbol}")
                return None
            
            # Update database
            quote = Quote.update_quote(self.db_session, ticker_id, quote_data)
            
            logger.info(f"Successfully updated price for {ticker.symbol}")
            return quote.to_dict()
            
        except Exception as e:
            logger.error(f"Failed to update ticker price for {ticker_id}: {e}")
            return None
    
    def get_batch_prices(self, ticker_ids: List[int], user_id: int = None) -> List[Dict]:
        """
        Get prices for multiple tickers.
        
        This method retrieves price data for multiple tickers in a single call.
        It's more efficient than calling get_ticker_price multiple times.
        
        Args:
            ticker_ids (List[int]): List of ticker IDs to get prices for
            user_id (int, optional): User ID for timezone conversion
            
        Returns:
            List[Dict]: List of price data dictionaries
        """
        try:
            results = []
            
            for ticker_id in ticker_ids:
                price_data = self.get_ticker_price(ticker_id, user_id)
                if price_data:
                    results.append(price_data)
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to get batch prices: {e}")
            return []
    
    def refresh_all_prices(self) -> Dict:
        """
        Refresh all ticker prices (placeholder for future implementation).
        
        This method will refresh prices for all active tickers. It's designed
        to be called by a scheduler or background task.
        
        Returns:
            Dict: Summary of refresh results including success/failure counts
        """
        try:
            # Get all active tickers
            from ..models.ticker import Ticker
            tickers = self.db_session.query(Ticker).filter(Ticker.status == 'active').all()
            
            results = {
                'total_tickers': len(tickers),
                'successful_updates': 0,
                'failed_updates': 0,
                'errors': []
            }
            
            for ticker in tickers:
                try:
                    price_data = self.update_ticker_price(ticker.id)
                    if price_data:
                        results['successful_updates'] += 1
                    else:
                        results['failed_updates'] += 1
                except Exception as e:
                    results['failed_updates'] += 1
                    results['errors'].append(f"Ticker {ticker.symbol}: {str(e)}")
            
            logger.info(f"Refresh completed: {results['successful_updates']} successful, {results['failed_updates']} failed")
            return results
            
        except Exception as e:
            logger.error(f"Failed to refresh all prices: {e}")
            return {'error': str(e)}
    
    def get_provider_status(self) -> Dict:
        """
        Get status of all providers.
        
        This method checks the health and status of all configured
        data providers.
        
        Returns:
            Dict: Provider status information
        """
        try:
            return {
                'yahoo_finance': self.yahoo_adapter.get_provider_status(),
                'last_check': datetime.now(timezone.utc).isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to get provider status: {e}")
            return {'error': str(e)}
    
    def _is_quote_fresh(self, quote: Quote) -> bool:
        """
        Check if quote is fresh (within cache TTL).
        
        This method determines if a quote is still fresh enough to use
        without fetching new data from the provider.
        
        Args:
            quote (Quote): The quote object to check
            
        Returns:
            bool: True if quote is fresh, False otherwise
        """
        if not quote.fetched_at:
            return False
        
        cache_ttl = self.config.get('cache_ttl', 60)
        age = (datetime.now(timezone.utc) - quote.fetched_at).total_seconds()
        
        return age < cache_ttl
    
    def _add_timezone_info(self, quote_dict: Dict, user_timezone: str) -> Dict:
        """
        Add timezone information to quote data.
        
        This method converts UTC timestamps to the user's local timezone
        and adds the converted times to the quote data.
        
        Args:
            quote_dict (Dict): The quote data dictionary
            user_timezone (str): The user's timezone
            
        Returns:
            Dict: Quote data with timezone information added
        """
        try:
            # Convert UTC times to user timezone
            if quote_dict.get('asof_utc'):
                # This would be implemented with proper timezone conversion
                quote_dict['asof_local'] = quote_dict['asof_utc']  # Placeholder
            
            if quote_dict.get('fetched_at'):
                quote_dict['fetched_at_local'] = quote_dict['fetched_at']  # Placeholder
            
            return quote_dict
            
        except Exception as e:
            logger.error(f"Failed to add timezone info: {e}")
            return quote_dict
    
    def get_user_preferences(self, user_id: int) -> Optional[Dict]:
        """
        Get user preferences for market data.
        
        Args:
            user_id (int): The user ID to get preferences for
            
        Returns:
            Dict or None: User preferences or None if not found
        """
        try:
            preferences = MarketPreferences.get_user_preferences(self.db_session, user_id)
            if preferences:
                return preferences.to_dict()
            return None
        except Exception as e:
            logger.error(f"Failed to get user preferences for {user_id}: {e}")
            return None
    
    def update_user_preferences(self, user_id: int, preferences_data: Dict) -> Optional[Dict]:
        """
        Update user preferences.
        
        This method updates a user's market data preferences including
        timezone settings and refresh policies.
        
        Args:
            user_id (int): The user ID to update preferences for
            preferences_data (Dict): The new preferences data
            
        Returns:
            Dict or None: Updated preferences or None if failed
        """
        try:
            preferences = MarketPreferences.get_or_create_preferences(self.db_session, user_id)
            
            # Update timezone if provided
            if 'timezone' in preferences_data:
                if MarketPreferences.validate_timezone(preferences_data['timezone']):
                    preferences.timezone = preferences_data['timezone']
                else:
                    logger.warning(f"Invalid timezone: {preferences_data['timezone']}")
            
            # Update refresh settings if provided
            if 'refresh_overrides' in preferences_data:
                preferences.set_refresh_overrides(preferences_data['refresh_overrides'])
            
            self.db_session.commit()
            return preferences.to_dict()
            
        except Exception as e:
            logger.error(f"Failed to update user preferences for {user_id}: {e}")
            return None
