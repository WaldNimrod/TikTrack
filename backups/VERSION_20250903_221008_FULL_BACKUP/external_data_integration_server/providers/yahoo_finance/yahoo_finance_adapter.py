"""
Yahoo Finance Adapter - External Data Integration
Adapter for Yahoo Finance API using yfinance library.

This adapter provides a standardized interface for fetching market data
from Yahoo Finance. It handles data fetching, validation, error handling,
and rate limiting to ensure reliable data retrieval.

Key Features:
- Real-time and historical price data
- Comprehensive market information (price, volume, high/low)
- Batch processing for multiple symbols
- Data validation and error handling
- Rate limiting and retry logic
- Response normalization

Important Notes:
- Yahoo Finance API is unofficial and may have rate limits
- Data availability depends on market hours and symbol validity
- Some symbols may not be available or may have delayed data

Author: TikTrack Development Team
Created: January 2025
Version: 1.0
"""

import yfinance as yf
import logging
from datetime import datetime, timezone
from typing import Dict, Optional, List
import time
import random

logger = logging.getLogger(__name__)


class YahooFinanceAdapter:
    """
    Adapter for Yahoo Finance API.
    
    This class provides a standardized interface for interacting with
    Yahoo Finance data through the yfinance library. It handles all
    aspects of data fetching, validation, and error handling.
    
    Key Responsibilities:
    - Fetching real-time and historical price data
    - Validating response data
    - Handling API errors and rate limits
    - Normalizing data format
    - Providing status information
    """
    
    def __init__(self, config: Dict = None):
        """
        Initialize the Yahoo Finance adapter.
        
        Args:
            config (Dict, optional): Configuration dictionary for the adapter
        """
        self.config = config or self._get_default_config()
        self.session = None
        self._setup_session()
    
    def _get_default_config(self) -> Dict:
        """
        Get default configuration for the adapter.
        
        Returns:
            Dict: Default configuration including timeouts, retry settings, and batch size
        """
        return {
            'timeout': 20,  # Request timeout in seconds
            'retry_attempts': 2,  # Number of retry attempts for failed requests
            'backoff_base': 0.5,  # Base delay for exponential backoff
            'backoff_factor': 2,  # Multiplier for exponential backoff
            'max_backoff': 60,  # Maximum backoff delay in seconds
            'batch_size': 50  # Maximum number of symbols per batch request
        }
    
    def _setup_session(self):
        """
        Setup yfinance session with configuration.
        
        Initializes the yfinance session with the configured settings.
        This method is called during initialization.
        """
        try:
            # yfinance doesn't require explicit session in newer versions
            self.session = None
            logger.info("Yahoo Finance adapter initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Yahoo Finance session: {e}")
            raise
    
    def fetch_quote_data(self, symbol: str) -> Optional[Dict]:
        """
        Fetch quote data for a single symbol.
        
        This method retrieves current market data for a specific symbol
        from Yahoo Finance. It includes comprehensive market information
        such as price, volume, high/low values, and change data.
        
        Args:
            symbol (str): The stock symbol to fetch data for (e.g., 'AAPL', 'GOOGL')
            
        Returns:
            Dict or None: Quote data dictionary or None if failed
        """
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Validate that we got data
            if not info or 'regularMarketPrice' not in info:
                logger.warning(f"No data received for symbol {symbol}")
                return None
            
            # Extract relevant data
            quote_data = {
                'symbol': symbol,
                'price': info.get('regularMarketPrice'),
                'change_amount': info.get('regularMarketChange'),
                'change_percent': info.get('regularMarketChangePercent'),
                'volume': info.get('volume'),
                'high_24h': info.get('dayHigh'),
                'low_24h': info.get('dayLow'),
                'open_price': info.get('open'),
                'previous_close': info.get('previousClose'),
                'asof_utc': datetime.now(timezone.utc),
                'provider': 'yahoo_finance'
            }
            
            # Validate required fields
            if quote_data['price'] is None:
                logger.warning(f"No price data for symbol {symbol}")
                return None
            
            logger.debug(f"Successfully fetched quote data for {symbol}")
            return quote_data
            
        except Exception as e:
            logger.error(f"Failed to fetch quote data for {symbol}: {e}")
            return None
    
    def fetch_batch_quotes(self, symbols: List[str]) -> List[Dict]:
        """
        Fetch quote data for multiple symbols in batch.
        
        This method efficiently retrieves market data for multiple symbols
        in a single operation, which is more efficient than individual requests.
        It processes symbols in batches to avoid overwhelming the API.
        
        Args:
            symbols (List[str]): List of stock symbols to fetch data for
            
        Returns:
            List[Dict]: List of quote data dictionaries
        """
        results = []
        
        # Process in batches to avoid overwhelming the API
        batch_size = self.config.get('batch_size', 50)
        
        for i in range(0, len(symbols), batch_size):
            batch = symbols[i:i + batch_size]
            
            try:
                # Fetch batch data
                tickers = yf.Tickers(' '.join(batch))
                batch_data = tickers.download(period='1d', progress=False)
                
                # Process each symbol in the batch
                for symbol in batch:
                    if symbol in batch_data.columns.levels[1]:
                        quote_data = self._extract_batch_quote(symbol, batch_data)
                        if quote_data:
                            results.append(quote_data)
                    else:
                        logger.warning(f"Symbol {symbol} not found in batch response")
                
                # Add small delay between batches to be respectful to the API
                if i + batch_size < len(symbols):
                    time.sleep(random.uniform(0.2, 0.5))
                    
            except Exception as e:
                logger.error(f"Failed to fetch batch quotes for symbols {batch}: {e}")
                # Continue with next batch instead of failing completely
                continue
        
        return results
    
    def _extract_batch_quote(self, symbol: str, batch_data) -> Optional[Dict]:
        """
        Extract quote data for a single symbol from batch response.
        
        This helper method processes the batch response data and extracts
        the relevant information for a specific symbol.
        
        Args:
            symbol (str): The symbol to extract data for
            batch_data: The batch response data from yfinance
            
        Returns:
            Dict or None: Quote data for the symbol or None if failed
        """
        try:
            # Get the last row of data for this symbol (most recent)
            symbol_data = batch_data[symbol].iloc[-1]
            
            quote_data = {
                'symbol': symbol,
                'price': symbol_data.get('Close'),
                'change_amount': symbol_data.get('Close') - symbol_data.get('Open'),
                'change_percent': ((symbol_data.get('Close') - symbol_data.get('Open')) / symbol_data.get('Open')) * 100 if symbol_data.get('Open') else None,
                'volume': symbol_data.get('Volume'),
                'high_24h': symbol_data.get('High'),
                'low_24h': symbol_data.get('Low'),
                'open_price': symbol_data.get('Open'),
                'previous_close': symbol_data.get('Close'),  # This would need adjustment for actual previous close
                'asof_utc': datetime.now(timezone.utc),
                'provider': 'yahoo_finance'
            }
            
            return quote_data
            
        except Exception as e:
            logger.error(f"Failed to extract quote data for {symbol}: {e}")
            return None
    
    def validate_response(self, response: Dict) -> bool:
        """
        Validate the response from Yahoo Finance.
        
        This method checks if the response contains all required fields
        and has valid data.
        
        Args:
            response (Dict): The response data to validate
            
        Returns:
            bool: True if response is valid, False otherwise
        """
        if not response:
            return False
        
        required_fields = ['symbol', 'price']
        for field in required_fields:
            if field not in response or response[field] is None:
                logger.warning(f"Missing required field {field} in response")
                return False
        
        return True
    
    def handle_error(self, error: Exception, symbol: str = None) -> Dict:
        """
        Handle errors from Yahoo Finance API.
        
        This method provides standardized error handling and logging
        for API errors.
        
        Args:
            error (Exception): The error that occurred
            symbol (str, optional): The symbol that was being processed
            
        Returns:
            Dict: Error information dictionary
        """
        error_info = {
            'error_type': type(error).__name__,
            'error_message': str(error),
            'symbol': symbol,
            'timestamp': datetime.now(timezone.utc)
        }
        
        logger.error(f"Yahoo Finance error for {symbol}: {error}")
        return error_info
    
    def get_provider_status(self) -> Dict:
        """
        Get provider status information.
        
        This method provides information about the current status
        of the Yahoo Finance provider.
        
        Returns:
            Dict: Provider status information
        """
        return {
            'provider': 'yahoo_finance',
            'is_active': True,
            'last_check': datetime.now(timezone.utc),
            'config': self.config
        }
