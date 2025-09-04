"""
Yahoo Finance Data Adapter
Handles all interactions with Yahoo Finance API for market data retrieval
"""

import requests
import time
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from models.external_data import ExternalDataProvider, MarketDataQuote, DataRefreshLog, IntradayDataSlot
from models.ticker import Ticker
from models.user import User
from services.user_service import UserService
import pytz

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class QuoteData:
    """Structured quote data from Yahoo Finance"""
    symbol: str
    price: float
    change_pct: Optional[float] = None
    change_amount: Optional[float] = None
    volume: Optional[int] = None
    currency: str = 'USD'
    asof_utc: Optional[datetime] = None
    source: str = 'yahoo_finance'

@dataclass
class IntradayData:
    """Structured intraday data from Yahoo Finance"""
    symbol: str
    slot_start: datetime
    open_price: float
    high_price: float
    low_price: float
    close_price: float
    volume: int
    slot_duration_minutes: int = 15

class YahooFinanceAdapter:
    """
    Adapter for Yahoo Finance API integration
    Handles rate limiting, caching, and data normalization
    """
    
    def __init__(self, db_session: Session, provider_id: int = 1):
        self.db_session = db_session
        self.provider_id = provider_id
        self.base_url = "https://query1.finance.yahoo.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        
        # Rate limiting
        self.requests_this_hour = 0
        self.hour_start = time.time()
        self.max_requests_per_hour = 900  # Conservative limit
        
        # Cache settings
        self.cache_ttl_hot = 60  # 1 minute for hot data
        self.cache_ttl_warm = 300  # 5 minutes for warm data
        
        # Batch processing
        self.max_symbols_per_batch = 50
        self.preferred_batch_size = 25
        
        # Error handling
        self.retry_attempts = 2
        self.timeout_seconds = 20
        
        # Load provider configuration
        self._load_provider_config()
        
        # Load user timezone preference (for display purposes only)
        self.user_timezone = self._load_user_timezone()
        
        # Market timezone - always New York (NYSE)
        self.market_timezone = pytz.timezone('America/New_York')
    
    def _load_provider_config(self):
        """Load provider configuration from database"""
        try:
            provider = self.db_session.query(ExternalDataProvider).filter(
                ExternalDataProvider.id == self.provider_id
            ).first()
            
            if provider:
                self.base_url = provider.base_url or self.base_url
                self.max_requests_per_hour = provider.rate_limit_per_hour or self.max_requests_per_hour
                self.timeout_seconds = provider.timeout_seconds or self.timeout_seconds
                self.retry_attempts = provider.retry_attempts or self.retry_attempts
                self.cache_ttl_hot = provider.cache_ttl_hot or self.cache_ttl_hot
                self.cache_ttl_warm = provider.cache_ttl_warm or self.cache_ttl_warm
                self.max_symbols_per_batch = provider.max_symbols_per_batch or self.max_symbols_per_batch
                self.preferred_batch_size = provider.preferred_batch_size or self.preferred_batch_size
                
                logger.info(f"Loaded provider config: {provider.name} - {provider.display_name}")
            else:
                logger.warning(f"Provider {self.provider_id} not found, using defaults")
                
        except SQLAlchemyError as e:
            logger.error(f"Error loading provider config: {e}")
    
    def _load_user_timezone(self) -> str:
        """Load user timezone preference"""
        try:
            # Get user preferences (default user for now)
            user_preferences = UserService.get_user_preferences(self.db_session)
            timezone_str = user_preferences.get('timezone', 'Asia/Jerusalem')
            
            # Validate timezone
            try:
                pytz.timezone(timezone_str)
                logger.info(f"Loaded user timezone: {timezone_str}")
                return timezone_str
            except pytz.exceptions.UnknownTimeZoneError:
                logger.warning(f"Invalid timezone '{timezone_str}', using default: Asia/Jerusalem")
                return 'Asia/Jerusalem'
                
        except Exception as e:
            logger.error(f"Error loading user timezone: {e}")
            return 'Asia/Jerusalem'
    
    def _convert_to_user_timezone(self, utc_time: datetime) -> datetime:
        """Convert UTC time to user's preferred timezone"""
        try:
            if utc_time.tzinfo is None:
                utc_time = utc_time.replace(tzinfo=timezone.utc)
            
            user_tz = pytz.timezone(self.user_timezone)
            return utc_time.astimezone(user_tz)
            
        except Exception as e:
            logger.error(f"Error converting timezone: {e}")
            return utc_time
    
    def _convert_from_user_timezone(self, user_time: datetime) -> datetime:
        """Convert user's timezone time to UTC"""
        try:
            if user_time.tzinfo is None:
                # Assume it's in user's timezone
                user_tz = pytz.timezone(self.user_timezone)
                user_time = user_tz.localize(user_time)
            
            return user_time.astimezone(timezone.utc)
            
        except Exception as e:
            logger.error(f"Error converting timezone: {e}")
            return user_time
    
    def is_market_open(self) -> bool:
        """Check if NYSE market is currently open"""
        try:
            market_time = datetime.now(self.market_timezone)
            
            # Check if it's a weekday
            if market_time.weekday() >= 5:  # Saturday = 5, Sunday = 6
                return False
            
            # Check market hours (9:30 AM - 4:00 PM ET)
            market_open = market_time.replace(hour=9, minute=30, second=0, microsecond=0)
            market_close = market_time.replace(hour=16, minute=0, second=0, microsecond=0)
            
            return market_open <= market_time <= market_close
            
        except Exception as e:
            logger.error(f"Error checking market status: {e}")
            return False
    
    def get_market_status(self) -> Dict[str, Any]:
        """Get current market status information"""
        try:
            market_time = datetime.now(self.market_timezone)
            
            return {
                'market_timezone': 'America/New_York',
                'market_time': market_time.strftime('%Y-%m-%d %H:%M:%S %Z'),
                'market_time_unified': market_time.isoformat(),  # Unified time for database
                'is_market_open': self.is_market_open(),
                'market_open_time': '09:30 ET',
                'market_close_time': '16:00 ET',
                'next_market_open': self._get_next_market_open(market_time),
                'user_timezone': self.user_timezone,
                'user_local_time': self._convert_to_user_timezone(market_time).strftime('%Y-%m-%d %H:%M:%S %Z'),
            }
            
        except Exception as e:
            logger.error(f"Error getting market status: {e}")
            return {}
    
    def _get_next_market_open(self, current_market_time: datetime) -> str:
        """Get next market open time"""
        try:
            if current_market_time.weekday() >= 5:  # Weekend
                # Find next Monday
                days_until_monday = (7 - current_market_time.weekday()) % 7
                next_monday = current_market_time + timedelta(days=days_until_monday)
                next_open = next_monday.replace(hour=9, minute=30, second=0, microsecond=0)
            else:
                # Same day or next day
                if current_market_time.hour >= 16:  # After market close
                    next_open = current_market_time + timedelta(days=1)
                    next_open = next_open.replace(hour=9, minute=30, second=0, microsecond=0)
                else:
                    next_open = current_market_time.replace(hour=9, minute=30, second=0, microsecond=0)
            
            return next_open.strftime('%Y-%m-%d %H:%M:%S %Z')
            
        except Exception as e:
            logger.error(f"Error calculating next market open: {e}")
            return "Unknown"
    
    def format_time_for_user_display(self, stored_time: datetime, include_timezone: bool = True) -> str:
        """Format stored time for user display in their local timezone"""
        try:
            if stored_time.tzinfo is None:
                # Assume stored time is in market timezone
                stored_time = self.market_timezone.localize(stored_time)
            
            # Convert to user's timezone
            user_time = stored_time.astimezone(pytz.timezone(self.user_timezone))
            
            if include_timezone:
                return user_time.strftime('%Y-%m-%d %H:%M:%S %Z')
            else:
                return user_time.strftime('%Y-%m-%d %H:%M:%S')
                
        except Exception as e:
            logger.error(f"Error formatting time for user display: {e}")
            return str(stored_time)
    
    def get_user_display_info(self, stored_time: datetime) -> Dict[str, str]:
        """Get comprehensive time display information for user"""
        try:
            if stored_time.tzinfo is None:
                # Assume stored time is in market timezone
                stored_time = self.market_timezone.localize(stored_time)
            
            user_time = stored_time.astimezone(pytz.timezone(self.user_timezone))
            market_time = stored_time.astimezone(self.market_timezone)
            
            return {
                'user_local_time': user_time.strftime('%Y-%m-%d %H:%M:%S %Z'),
                'market_time': market_time.strftime('%Y-%m-%d %H:%M:%S %Z'),
                'unified_time': stored_time.isoformat(),
                'user_timezone': self.user_timezone,
                'market_timezone': 'America/New_York',
                'time_difference': f"{self._get_timezone_offset_display()}"
            }
            
        except Exception as e:
            logger.error(f"Error getting user display info: {e}")
            return {}
    
    def _get_timezone_offset_display(self) -> str:
        """Get timezone offset display for user"""
        try:
            user_tz = pytz.timezone(self.user_timezone)
            market_tz = self.market_timezone
            
            now = datetime.now()
            user_offset = user_tz.utcoffset(now)
            market_offset = market_tz.utcoffset(now)
            
            diff_hours = (user_offset - market_offset).total_seconds() / 3600
            
            if diff_hours > 0:
                return f"+{diff_hours:.0f}h ahead of NY"
            elif diff_hours < 0:
                return f"{abs(diff_hours):.0f}h behind NY"
            else:
                return "Same time as NY"
                
        except Exception as e:
            logger.error(f"Error calculating timezone offset: {e}")
            return "Unknown offset"
    
    def _check_rate_limit(self) -> bool:
        """Check if we can make a request without hitting rate limits"""
        current_time = time.time()
        
        # Reset counter if hour has passed
        if current_time - self.hour_start >= 3600:
            self.requests_this_hour = 0
            self.hour_start = current_time
        
        if self.requests_this_hour >= self.max_requests_per_hour:
            logger.warning(f"Rate limit reached: {self.requests_this_hour}/{self.max_requests_per_hour}")
            return False
        
        return True
    
    def _increment_request_count(self):
        """Increment the request counter"""
        self.requests_this_hour += 1
    
    def _make_request(self, url: str, params: Dict = None) -> Optional[Dict]:
        """Make HTTP request with retry logic and rate limiting"""
        if not self._check_rate_limit():
            return None
        
        for attempt in range(self.retry_attempts + 1):
            try:
                self._increment_request_count()
                
                response = self.session.get(
                    url, 
                    params=params, 
                    timeout=self.timeout_seconds
                )
                response.raise_for_status()
                
                data = response.json()
                logger.debug(f"Request successful: {url}")
                return data
                
            except requests.exceptions.RequestException as e:
                logger.warning(f"Request attempt {attempt + 1} failed: {e}")
                if attempt < self.retry_attempts:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    logger.error(f"All retry attempts failed for {url}")
                    return None
            except Exception as e:
                logger.error(f"Unexpected error in request: {e}")
                return None
        
        return None
    
    def get_quote(self, symbol: str) -> Optional[QuoteData]:
        """Get single quote for a symbol"""
        try:
            # Check cache first
            cached_quote = self._get_cached_quote(symbol)
            if cached_quote and not self._is_stale(cached_quote):
                logger.debug(f"Cache hit for {symbol}")
                return cached_quote
            
            # Fetch from API
            url = f"{self.base_url}/v8/finance/chart/{symbol}"
            params = {
                'interval': '1d',
                'range': '1d',
                'includePrePost': 'false'
            }
            
            data = self._make_request(url, params)
            if not data:
                return None
            
            # Parse response
            quote = self._parse_quote_response(symbol, data)
            if quote:
                # Cache the result
                self._cache_quote(quote)
                
            return quote
            
        except Exception as e:
            logger.error(f"Error getting quote for {symbol}: {e}")
            return None
    
    def get_quotes_batch(self, symbols: List[str]) -> List[QuoteData]:
        """Get quotes for multiple symbols in batches"""
        if not symbols:
            return []
        
        all_quotes = []
        start_time = datetime.now(timezone.utc)
        
        # Split into batches
        batches = [
            symbols[i:i + self.preferred_batch_size] 
            for i in range(0, len(symbols), self.preferred_batch_size)
        ]
        
        logger.info(f"Processing {len(symbols)} symbols in {len(batches)} batches")
        
        for batch_num, batch_symbols in enumerate(batches, 1):
            try:
                logger.debug(f"Processing batch {batch_num}/{len(batches)}: {batch_symbols}")
                
                # Check cache for batch
                cached_quotes = self._get_cached_quotes_batch(batch_symbols)
                fresh_symbols = [s for s in batch_symbols if s not in [q.symbol for q in cached_quotes if not self._is_stale(q)]]
                
                if fresh_symbols:
                    # Fetch fresh data for uncached symbols
                    fresh_quotes = self._fetch_batch_from_api(fresh_symbols)
                    if fresh_quotes:
                        all_quotes.extend(fresh_quotes)
                        # Cache fresh quotes
                        for quote in fresh_quotes:
                            self._cache_quote(quote)
                
                # Add cached quotes that aren't stale
                all_quotes.extend([q for q in cached_quotes if not self._is_stale(q)])
                
                # Rate limiting between batches
                if batch_num < len(batches):
                    time.sleep(0.1)  # 100ms delay between batches
                    
            except Exception as e:
                logger.error(f"Error processing batch {batch_num}: {e}")
                continue
        
        # Log the operation
        end_time = datetime.now(timezone.utc)
        duration_ms = int((end_time - start_time).total_seconds() * 1000)
        
        self._log_refresh_operation(
            symbols_requested=len(symbols),
            symbols_successful=len(all_quotes),
            symbols_failed=len(symbols) - len(all_quotes),
            start_time=start_time,
            end_time=end_time,
            total_duration_ms=duration_ms,
            status='success' if len(all_quotes) == len(symbols) else 'partial_success'
        )
        
        # Update provider health and last successful request
        if len(all_quotes) > 0:
            self.update_provider_health(is_healthy=True)
        
        return all_quotes
    
    def _fetch_batch_from_api(self, symbols: List[str]) -> List[QuoteData]:
        """Fetch quotes for a batch of symbols from API"""
        quotes = []
        
        for symbol in symbols:
            try:
                quote = self.get_quote(symbol)
                if quote:
                    quotes.append(quote)
                else:
                    logger.warning(f"Failed to get quote for {symbol}")
                    
            except Exception as e:
                logger.error(f"Error fetching quote for {symbol}: {e}")
                continue
        
        return quotes
    
    def _parse_quote_response(self, symbol: str, data: Dict) -> Optional[QuoteData]:
        """Parse Yahoo Finance API response into QuoteData"""
        try:
            if 'chart' not in data or 'result' not in data['chart']:
                return None
            
            result = data['chart']['result'][0]
            if 'meta' not in result or 'regularMarketPrice' not in result['meta']:
                return None
            
            meta = result['meta']
            # Get current time in New York (market time) - this is our reference time
            market_now = datetime.now(self.market_timezone)
            
            current_price = float(meta['regularMarketPrice'])
            
            quote = QuoteData(
                symbol=symbol,
                price=current_price,
                currency=meta.get('currency', 'USD'),
                source='yahoo_finance',
                asof_utc=market_now  # Store market time as reference
            )
            
            # Extract additional data if available
            logger.info(f"📊 {symbol}: Available meta keys: {list(meta.keys())}")
            logger.info(f"📊 {symbol}: Current price: ${current_price}")
            
            # Try to get change data directly from Yahoo
            if 'regularMarketChange' in meta:
                quote.change_amount = float(meta['regularMarketChange'])
                logger.info(f"📊 {symbol}: Direct change_amount from Yahoo = {quote.change_amount}")
            elif 'chartPreviousClose' in meta:
                # Calculate change ourselves if Yahoo doesn't provide it
                previous_close = float(meta['chartPreviousClose'])
                quote.change_amount = current_price - previous_close
                logger.info(f"📊 {symbol}: Calculated change_amount = {current_price} - {previous_close} = {quote.change_amount}")
            else:
                logger.warning(f"📊 {symbol}: No previous close data available for change calculation")
            
            if 'regularMarketChangePercent' in meta:
                quote.change_pct = float(meta['regularMarketChangePercent'])
                logger.info(f"📊 {symbol}: Direct change_pct from Yahoo = {quote.change_pct}%")
            elif 'chartPreviousClose' in meta and quote.change_amount is not None:
                # Calculate percentage change ourselves
                previous_close = float(meta['chartPreviousClose'])
                if previous_close > 0:
                    quote.change_pct = (quote.change_amount / previous_close) * 100
                    logger.info(f"📊 {symbol}: Calculated change_pct = ({quote.change_amount} / {previous_close}) * 100 = {quote.change_pct:.2f}%")
                else:
                    logger.warning(f"📊 {symbol}: Previous close is 0, cannot calculate percentage change")
            else:
                logger.warning(f"📊 {symbol}: Cannot calculate percentage change - missing data")
            
            if 'regularMarketVolume' in meta:
                quote.volume = int(meta['regularMarketVolume'])
                logger.info(f"📊 {symbol}: volume = {quote.volume}")
            
            change_pct_display = f"{quote.change_pct:.2f}%" if quote.change_pct is not None else "N/A"
            change_amount_display = f"${quote.change_amount:.2f}" if quote.change_amount is not None else "N/A"
            logger.info(f"📊 {symbol}: Final quote data - price: ${quote.price}, change_pct: {change_pct_display}, change_amount: {change_amount_display}")
            
            return quote
            
        except (KeyError, ValueError, TypeError) as e:
            logger.error(f"Error parsing quote response for {symbol}: {e}")
            return None
    
    def _get_cached_quote(self, symbol: str) -> Optional[QuoteData]:
        """Get cached quote from database"""
        try:
            # Get ticker ID
            ticker = self.db_session.query(Ticker).filter(Ticker.symbol == symbol).first()
            if not ticker:
                return None
            
            # Get latest quote
            quote = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker.id,
                MarketDataQuote.provider_id == self.provider_id
            ).order_by(MarketDataQuote.fetched_at.desc()).first()
            
            if quote:
                return QuoteData(
                    symbol=symbol,
                    price=quote.price,
                    change_pct=quote.change_pct_day,
                    change_amount=quote.change_amount_day,
                    volume=quote.volume,
                    currency=quote.currency,
                    asof_utc=quote.asof_utc,
                    source=quote.source
                )
            
            return None
            
        except SQLAlchemyError as e:
            logger.error(f"Error getting cached quote for {symbol}: {e}")
            return None
    
    def _get_cached_quotes_batch(self, symbols: List[str]) -> List[QuoteData]:
        """Get cached quotes for multiple symbols"""
        quotes = []
        for symbol in symbols:
            quote = self._get_cached_quote(symbol)
            if quote:
                quotes.append(quote)
        return quotes
    
    def _is_stale(self, quote: QuoteData) -> bool:
        """Check if quote data is stale"""
        if not quote.asof_utc:
            return True
        
        # Get current market time
        current_market_time = datetime.now(self.market_timezone)
        
        # Ensure quote time has timezone info
        quote_time = quote.asof_utc
        if quote_time.tzinfo is None:
            quote_time = self.market_timezone.localize(quote_time)
        
        # Calculate age in market time
        age_seconds = (current_market_time - quote_time).total_seconds()
        return age_seconds > self.cache_ttl_hot
    
    def _cache_quote(self, quote: QuoteData):
        """Cache quote in database"""
        try:
            logger.info(f"🔄 _cache_quote called for symbol: {quote.symbol}")
            
            # Get ticker ID
            ticker = self.db_session.query(Ticker).filter(Ticker.symbol == quote.symbol).first()
            if not ticker:
                logger.warning(f"⚠️ Ticker not found for symbol: {quote.symbol} - cannot cache quote")
                return
            
            logger.info(f"✅ Found ticker {ticker.symbol} (ID: {ticker.id}) - proceeding to cache quote")
            
            # Create or update quote
            db_quote = MarketDataQuote(
                ticker_id=ticker.id,
                provider_id=self.provider_id,
                asof_utc=quote.asof_utc or datetime.now(timezone.utc),
                price=quote.price,
                change_pct_day=quote.change_pct,
                change_amount_day=quote.change_amount,
                volume=quote.volume,
                currency=quote.currency,
                source=quote.source,
                is_stale=False,
                quality_score=1.0
            )
            
            logger.info(f"💾 Adding quote to database: {quote.symbol} = ${quote.price} ({quote.currency})")
            self.db_session.add(db_quote)
            
            logger.info(f"🔄 Committing transaction for {quote.symbol}")
            self.db_session.commit()
            
            logger.info(f"✅ Successfully cached quote for {quote.symbol}: ${quote.price}")
            
        except SQLAlchemyError as e:
            logger.error(f"❌ SQLAlchemy error caching quote for {quote.symbol}: {e}")
            logger.error(f"🔄 Rolling back transaction for {quote.symbol}")
            self.db_session.rollback()
        except Exception as e:
            logger.error(f"❌ Unexpected error caching quote for {quote.symbol}: {e}")
            logger.error(f"🔄 Rolling back transaction for {quote.symbol}")
            self.db_session.rollback()
    
    def _log_refresh_operation(self, **kwargs):
        """Log refresh operation details"""
        try:
            log_entry = DataRefreshLog(
                provider_id=self.provider_id,
                operation_type='batch_quote_fetch',
                **kwargs
            )
            
            self.db_session.add(log_entry)
            self.db_session.commit()
            
        except SQLAlchemyError as e:
            logger.error(f"Error logging refresh operation: {e}")
            self.db_session.rollback()
    
    def get_intraday_data(self, symbol: str, interval_minutes: int = 15) -> List[IntradayData]:
        """Get intraday data for a symbol"""
        try:
            # Check cache first
            cached_data = self._get_cached_intraday_data(symbol, interval_minutes)
            if cached_data and not self._is_intraday_stale(cached_data):
                return cached_data
            
            # Fetch from API
            url = f"{self.base_url}/v8/finance/chart/{symbol}"
            params = {
                'interval': f'{interval_minutes}m',
                'range': '1d',
                'includePrePost': 'false'
            }
            
            data = self._make_request(url, params)
            if not data:
                return []
            
            # Parse response
            intraday_data = self._parse_intraday_response(symbol, data, interval_minutes)
            if intraday_data:
                # Cache the result
                self._cache_intraday_data(intraday_data)
            
            return intraday_data
            
        except Exception as e:
            logger.error(f"Error getting intraday data for {symbol}: {e}")
            return []
    
    def _parse_intraday_response(self, symbol: str, data: Dict, interval_minutes: int) -> List[IntradayData]:
        """Parse intraday data response"""
        try:
            if 'chart' not in data or 'result' not in data['chart']:
                return []
            
            result = data['chart']['result'][0]
            if 'timestamp' not in result or 'indicators' not in result:
                return []
            
            timestamps = result['timestamp']
            quotes = result['indicators']['quote'][0]
            
            intraday_data = []
            for i, timestamp in enumerate(timestamps):
                try:
                    # Convert timestamp to datetime
                    slot_start = datetime.fromtimestamp(timestamp, tz=timezone.utc)
                    
                    # Extract OHLCV data
                    open_price = quotes['open'][i] if quotes['open'] and quotes['open'][i] is not None else 0
                    high_price = quotes['high'][i] if quotes['high'] and quotes['high'][i] is not None else 0
                    low_price = quotes['low'][i] if quotes['low'] and quotes['low'][i] is not None else 0
                    close_price = quotes['close'][i] if quotes['close'] and quotes['close'][i] is not None else 0
                    volume = quotes['volume'][i] if quotes['volume'] and quotes['volume'][i] is not None else 0
                    
                    # Skip if no valid data
                    if open_price == 0 and high_price == 0 and low_price == 0 and close_price == 0:
                        continue
                    
                    intraday_data.append(IntradayData(
                        symbol=symbol,
                        slot_start=slot_start,
                        open_price=float(open_price),
                        high_price=float(high_price),
                        low_price=float(low_price),
                        close_price=float(close_price),
                        volume=int(volume),
                        slot_duration_minutes=interval_minutes
                    ))
                    
                except (ValueError, TypeError) as e:
                    logger.warning(f"Error parsing intraday data point {i} for {symbol}: {e}")
                    continue
            
            return intraday_data
            
        except Exception as e:
            logger.error(f"Error parsing intraday response for {symbol}: {e}")
            return []
    
    def _get_cached_intraday_data(self, symbol: str, interval_minutes: int) -> List[IntradayData]:
        """Get cached intraday data from database"""
        try:
            ticker = self.db_session.query(Ticker).filter(Ticker.symbol == symbol).first()
            if not ticker:
                return []
            
            # Get today's data
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            
            slots = self.db_session.query(IntradayDataSlot).filter(
                IntradayDataSlot.ticker_id == ticker.id,
                IntradayDataSlot.provider_id == self.provider_id,
                IntradayDataSlot.slot_start_utc >= today_start,
                IntradayDataSlot.slot_duration_minutes == interval_minutes
            ).order_by(IntradayDataSlot.slot_start_utc).all()
            
            return [
                IntradayData(
                    symbol=symbol,
                    slot_start=slot.slot_start_utc,
                    open_price=slot.open_price,
                    high_price=slot.high_price,
                    low_price=slot.low_price,
                    close_price=slot.close_price,
                    volume=slot.volume,
                    slot_duration_minutes=slot.slot_duration_minutes
                )
                for slot in slots
            ]
            
        except SQLAlchemyError as e:
            logger.error(f"Error getting cached intraday data for {symbol}: {e}")
            return []
    
    def _is_intraday_stale(self, data: List[IntradayData]) -> bool:
        """Check if intraday data is stale"""
        if not data:
            return True
        
        # Check if we have recent data (within last 30 minutes)
        latest_slot = max(data, key=lambda x: x.slot_start)
        age_seconds = (datetime.now(timezone.utc) - latest_slot.slot_start).total_seconds()
        return age_seconds > (self.cache_ttl_hot * 2)  # Double the hot cache TTL for intraday
    
    def _cache_intraday_data(self, data: List[IntradayData]):
        """Cache intraday data in database"""
        try:
            for slot_data in data:
                ticker = self.db_session.query(Ticker).filter(Ticker.symbol == slot_data.symbol).first()
                if not ticker:
                    continue
                
                # Check if slot already exists
                existing_slot = self.db_session.query(IntradayDataSlot).filter(
                    IntradayDataSlot.ticker_id == ticker.id,
                    IntradayDataSlot.provider_id == self.provider_id,
                    IntradayDataSlot.slot_start_utc == slot_data.slot_start,
                    IntradayDataSlot.slot_duration_minutes == slot_data.slot_duration_minutes
                ).first()
                
                if existing_slot:
                    # Update existing slot
                    existing_slot.open_price = slot_data.open_price
                    existing_slot.high_price = slot_data.high_price
                    existing_slot.low_price = slot_data.low_price
                    existing_slot.close_price = slot_data.close_price
                    existing_slot.volume = slot_data.volume
                    existing_slot.is_complete = True
                else:
                    # Create new slot
                    new_slot = IntradayDataSlot(
                        ticker_id=ticker.id,
                        provider_id=self.provider_id,
                        slot_start_utc=slot_data.slot_start,
                        open_price=slot_data.open_price,
                        high_price=slot_data.high_price,
                        low_price=slot_data.low_price,
                        close_price=slot_data.close_price,
                        volume=slot_data.volume,
                        slot_duration_minutes=slot_data.slot_duration_minutes,
                        is_complete=True
                    )
                    self.db_session.add(new_slot)
            
            self.db_session.commit()
            logger.debug(f"Cached {len(data)} intraday data slots for {data[0].symbol if data else 'unknown'}")
            
        except SQLAlchemyError as e:
            logger.error(f"Error caching intraday data: {e}")
            self.db_session.rollback()
    
    def get_provider_status(self) -> Dict[str, Any]:
        """Get current provider status and health"""
        try:
            provider = self.db_session.query(ExternalDataProvider).filter(
                ExternalDataProvider.id == self.provider_id
            ).first()
            
            if not provider:
                return {'status': 'unknown', 'error': 'Provider not found'}
            
            # Check recent refresh logs
            recent_logs = self.db_session.query(DataRefreshLog).filter(
                DataRefreshLog.provider_id == self.provider_id,
                DataRefreshLog.start_time >= datetime.now(timezone.utc).replace(hour=datetime.now(timezone.utc).hour - 1)
            ).all()
            
            success_count = len([log for log in recent_logs if log.status == 'success'])
            total_count = len(recent_logs)
            
            # Get market status
            market_status = self.get_market_status()
            
            return {
                'provider_id': provider.id,
                'name': provider.name,
                'display_name': provider.display_name,
                'is_active': provider.is_active,
                'is_healthy': provider.is_healthy,
                'last_successful_request': provider.last_successful_request.isoformat() if provider.last_successful_request else None,
                'last_error': provider.last_error,
                'error_count': provider.error_count,
                'rate_limit_remaining': self.max_requests_per_hour - self.requests_this_hour,
                'requests_this_hour': self.requests_this_hour,
                'recent_success_rate': success_count / total_count if total_count > 0 else 0,
                'recent_requests': total_count,
                'market_status': market_status
            }
            
        except SQLAlchemyError as e:
            logger.error(f"Error getting provider status: {e}")
            return {'status': 'error', 'error': str(e)}
    
    def update_provider_health(self, is_healthy: bool, error_message: str = None):
        """Update provider health status"""
        try:
            provider = self.db_session.query(ExternalDataProvider).filter(
                ExternalDataProvider.id == self.provider_id
            ).first()
            
            if provider:
                provider.is_healthy = is_healthy
                if error_message:
                    provider.last_error = error_message
                    provider.error_count += 1
                else:
                    provider.last_error = None
                    provider.error_count = 0
                
                provider.last_successful_request = datetime.now(timezone.utc)
                self.db_session.commit()
                
                logger.info(f"Updated provider {provider.name} health: {is_healthy}")
            
        except SQLAlchemyError as e:
            logger.error(f"Error updating provider health: {e}")
            self.db_session.rollback()
    
    def cleanup_old_data(self, days_to_keep: int = 30):
        """Clean up old market data and logs"""
        try:
            cutoff_date = datetime.now(timezone.utc).replace(day=datetime.now(timezone.utc).day - days_to_keep)
            
            # Clean old quotes
            old_quotes = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.fetched_at < cutoff_date
            ).delete()
            
            # Clean old intraday data
            old_intraday = self.db_session.query(IntradayDataSlot).filter(
                IntradayDataSlot.slot_start_utc < cutoff_date
            ).delete()
            
            # Clean old refresh logs
            old_logs = self.db_session.query(DataRefreshLog).filter(
                DataRefreshLog.start_time < cutoff_date
            ).delete()
            
            self.db_session.commit()
            
            logger.info(f"Cleaned up: {old_quotes} quotes, {old_intraday} intraday slots, {old_logs} logs")
            
        except SQLAlchemyError as e:
            logger.error(f"Error cleaning up old data: {e}")
            self.db_session.rollback()
