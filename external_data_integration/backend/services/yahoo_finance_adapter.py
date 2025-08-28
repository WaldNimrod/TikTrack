"""
Yahoo Finance Adapter - External Data Integration
Handles communication with Yahoo Finance API via yfinance library
"""

import yfinance as yf
import logging
from datetime import datetime, timezone
from typing import Dict, Optional, List
import time
import random

logger = logging.getLogger(__name__)


class YahooFinanceAdapter:
    """Adapter for Yahoo Finance API"""
    
    def __init__(self, config: Dict = None):
        """Initialize the adapter with configuration"""
        self.config = config or self._get_default_config()
        self.session = None
        self._setup_session()
    
    def _get_default_config(self) -> Dict:
        """Get default configuration"""
        return {
            'timeout': 20,
            'retry_attempts': 2,
            'backoff_base': 0.5,
            'backoff_factor': 2,
            'max_backoff': 60,
            'batch_size': 50
        }
    
    def _setup_session(self):
        """Setup yfinance session with configuration"""
        try:
            # Configure yfinance session
            self.session = yf.Session()
            logger.info("Yahoo Finance session initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Yahoo Finance session: {e}")
            raise
    
    def fetch_quote_data(self, symbol: str) -> Optional[Dict]:
        """Fetch quote data for a single symbol"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
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
            
            logger.debug(f"Successfully fetched quote data for {symbol}")
            return quote_data
            
        except Exception as e:
            logger.error(f"Failed to fetch quote data for {symbol}: {e}")
            return None
    
    def fetch_batch_quotes(self, symbols: List[str]) -> List[Dict]:
        """Fetch quote data for multiple symbols in batch"""
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
                
                # Add small delay between batches
                if i + batch_size < len(symbols):
                    time.sleep(random.uniform(0.2, 0.5))
                    
            except Exception as e:
                logger.error(f"Failed to fetch batch quotes for symbols {batch}: {e}")
                # Continue with next batch
                continue
        
        return results
    
    def _extract_batch_quote(self, symbol: str, batch_data) -> Optional[Dict]:
        """Extract quote data for a single symbol from batch response"""
        try:
            # Get the last row of data for this symbol
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
        """Validate the response from Yahoo Finance"""
        if not response:
            return False
        
        required_fields = ['symbol', 'price']
        for field in required_fields:
            if field not in response or response[field] is None:
                logger.warning(f"Missing required field {field} in response")
                return False
        
        return True
    
    def handle_error(self, error: Exception, symbol: str = None) -> Dict:
        """Handle errors from Yahoo Finance API"""
        error_info = {
            'error_type': type(error).__name__,
            'error_message': str(error),
            'symbol': symbol,
            'timestamp': datetime.now(timezone.utc)
        }
        
        logger.error(f"Yahoo Finance error for {symbol}: {error}")
        return error_info
    
    def get_provider_status(self) -> Dict:
        """Get provider status information"""
        return {
            'provider': 'yahoo_finance',
            'is_active': True,
            'last_check': datetime.now(timezone.utc),
            'config': self.config
        }
