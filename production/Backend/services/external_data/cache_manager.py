"""
Cache Manager Service
Manages caching of external market data with TTL and invalidation strategies
"""

import logging
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import and_, or_

from models.external_data import MarketDataQuote, IntradayDataSlot, DataRefreshLog
from models.ticker import Ticker

logger = logging.getLogger(__name__)

@dataclass
class CacheStats:
    """Cache statistics and performance metrics"""
    total_quotes: int
    total_intraday_slots: int
    cache_hit_rate: float
    avg_quote_age_minutes: float
    avg_intraday_age_minutes: float
    stale_data_count: int
    last_cleanup: Optional[datetime] = None

class CacheManager:
    """
    Manages caching of external market data
    Handles TTL, invalidation, and cache performance optimization
    """
    
    def __init__(self, db_session: Session):
        self.db_session = db_session
        
        # Load settings from user preferences
        self._load_settings_from_preferences()
        
        # Cache hit tracking
        self.cache_hits = 0
        self.cache_misses = 0
        self.last_stats_reset = time.time()
    
    def _load_settings_from_preferences(self):
        """Load cache settings from user preferences"""
        try:
            from services.user_service import UserService
            
            # Get user preferences
            user_preferences = UserService.get_user_preferences(1)  # Default user ID
            
            # Cache TTL settings (in seconds) - from preferences or defaults
            cache_ttl_minutes = user_preferences.get('cacheTTL', 5)
            self.ttl_settings = {
                'hot': cache_ttl_minutes * 60,           # Hot cache TTL
                'warm': cache_ttl_minutes * 60 * 2,      # Warm cache TTL (2x hot)
                'cool': cache_ttl_minutes * 60 * 6,      # Cool cache TTL (6x hot)
                'cold': cache_ttl_minutes * 60 * 12      # Cold cache TTL (12x hot)
            }
            
            # Cache invalidation thresholds
            self.invalidation_thresholds = {
                'price_change_pct': 0.5,    # 0.5% price change triggers invalidation
                'volume_change_pct': 10.0,  # 10% volume change triggers invalidation
                'time_threshold': cache_ttl_minutes * 60  # TTL-based threshold
            }
            
            # Cache performance settings from preferences
            self.max_cache_size = user_preferences.get('maxBatchSize', 25) * 400  # 400 quotes per batch
            self.cleanup_batch_size = user_preferences.get('maxBatchSize', 25) * 40  # 40% of max size
            
            logger.info(f"Loaded cache settings from preferences: TTL={cache_ttl_minutes}min, max_batch={user_preferences.get('maxBatchSize', 25)}")
            
        except Exception as e:
            logger.error(f"Error loading settings from preferences: {e}, using defaults")
            
            # Fallback to default settings
            self.ttl_settings = {
                'hot': 60,      # 1 minute for very fresh data
                'warm': 300,    # 5 minutes for recent data
                'cool': 1800,   # 30 minutes for older data
                'cold': 3600    # 1 hour for historical data
            }
            
            self.invalidation_thresholds = {
                'price_change_pct': 0.5,    # 0.5% price change triggers invalidation
                'volume_change_pct': 10.0,  # 10% volume change triggers invalidation
                'time_threshold': 300       # 5 minutes without updates triggers invalidation
            }
            
            self.max_cache_size = 10000     # Maximum quotes in cache
            self.cleanup_batch_size = 1000  # Batch size for cleanup operations
    
    def refresh_settings(self):
        """Refresh cache settings from user preferences"""
        try:
            self._load_settings_from_preferences()
            logger.info("Cache settings refreshed from preferences")
        except Exception as e:
            logger.error(f"Error refreshing cache settings: {e}")
    
    def get_cached_quote(self, symbol: str, provider_id: int = None) -> Optional[MarketDataQuote]:
        """
        Get cached quote for a symbol
        
        Args:
            symbol: Stock symbol
            provider_id: Specific provider ID, or None for any provider
            
        Returns:
            Cached quote if valid, None if not found or stale
        """
        try:
            ticker = self.db_session.query(Ticker).filter(Ticker.symbol == symbol).first()
            if not ticker:
                return None
            
            # Build query
            query = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker.id
            )
            
            if provider_id:
                query = query.filter(MarketDataQuote.provider_id == provider_id)
            
            # Get most recent quote
            quote = query.order_by(MarketDataQuote.fetched_at.desc()).first()
            
            if not quote:
                self.cache_misses += 1
                return None
            
            # Check if quote is stale
            if self._is_quote_stale(quote):
                self.cache_misses += 1
                return None
            
            self.cache_hits += 1
            return quote
            
        except SQLAlchemyError as e:
            logger.error(f"Error getting cached quote for {symbol}: {e}")
            self.cache_misses += 1
            return None
    
    def get_cached_quotes_batch(self, symbols: List[str], provider_id: int = None) -> Dict[str, MarketDataQuote]:
        """
        Get cached quotes for multiple symbols
        
        Args:
            symbols: List of stock symbols
            provider_id: Specific provider ID, or None for any provider
            
        Returns:
            Dictionary mapping symbols to cached quotes
        """
        if not symbols:
            return {}
        
        cached_quotes = {}
        
        for symbol in symbols:
            quote = self.get_cached_quote(symbol, provider_id)
            if quote:
                cached_quotes[symbol] = quote
        
        return cached_quotes
    
    def get_cached_intraday(self, symbol: str, interval_minutes: int = 15, provider_id: int = None) -> List[IntradayDataSlot]:
        """
        Get cached intraday data for a symbol
        
        Args:
            symbol: Stock symbol
            interval_minutes: Time interval for data slots
            provider_id: Specific provider ID, or None for any provider
            
        Returns:
            List of cached intraday data slots
        """
        try:
            ticker = self.db_session.query(Ticker).filter(Ticker.symbol == symbol).first()
            if not ticker:
                return []
            
            # Get today's data
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Build query
            query = self.db_session.query(IntradayDataSlot).filter(
                and_(
                    IntradayDataSlot.ticker_id == ticker.id,
                    IntradayDataSlot.slot_start_utc >= today_start,
                    IntradayDataSlot.slot_duration_minutes == interval_minutes
                )
            )
            
            if provider_id:
                query = query.filter(IntradayDataSlot.provider_id == provider_id)
            
            slots = query.order_by(IntradayDataSlot.slot_start_utc).all()
            
            # Filter out stale data
            valid_slots = [slot for slot in slots if not self._is_intraday_stale(slot)]
            
            if valid_slots:
                self.cache_hits += 1
            else:
                self.cache_misses += 1
            
            return valid_slots
            
        except SQLAlchemyError as e:
            logger.error(f"Error getting cached intraday data for {symbol}: {e}")
            self.cache_misses += 1
            return []
    
    def cache_quote(self, quote: MarketDataQuote) -> bool:
        """
        Cache a quote in the database
        
        Args:
            quote: Quote object to cache
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Check if we already have a recent quote for this ticker/provider
            existing_quote = self.db_session.query(MarketDataQuote).filter(
                and_(
                    MarketDataQuote.ticker_id == quote.ticker_id,
                    MarketDataQuote.provider_id == quote.provider_id,
                    MarketDataQuote.source == quote.source
                )
            ).order_by(MarketDataQuote.fetched_at.desc()).first()
            
            if existing_quote:
                # Check if we should update or skip
                if self._should_update_quote(existing_quote, quote):
                    # Update existing quote
                    existing_quote.price = quote.price
                    existing_quote.change_pct_day = quote.change_pct_day
                    existing_quote.change_amount_day = quote.change_amount_day
                    existing_quote.volume = quote.volume
                    existing_quote.currency = quote.currency
                    existing_quote.asof_utc = quote.asof_utc
                    existing_quote.is_stale = False
                    existing_quote.quality_score = quote.quality_score
                    existing_quote.updated_at = datetime.now(timezone.utc)
                    logger.debug(f"Updated cached quote for ticker {quote.ticker_id}")
                else:
                    logger.debug(f"Skipped caching quote for ticker {quote.ticker_id} - no significant changes")
                    return True
            else:
                # Add new quote
                self.db_session.add(quote)
                logger.debug(f"Cached new quote for ticker {quote.ticker_id}")
            
            self.db_session.commit()
            return True
            
        except SQLAlchemyError as e:
            logger.error(f"Error caching quote: {e}")
            self.db_session.rollback()
            return False
    
    def cache_intraday_slot(self, slot: IntradayDataSlot) -> bool:
        """
        Cache an intraday data slot
        
        Args:
            slot: Intraday data slot to cache
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Check if slot already exists
            existing_slot = self.db_session.query(IntradayDataSlot).filter(
                and_(
                    IntradayDataSlot.ticker_id == slot.ticker_id,
                    IntradayDataSlot.provider_id == slot.provider_id,
                    IntradayDataSlot.slot_start_utc == slot.slot_start_utc,
                    IntradayDataSlot.slot_duration_minutes == slot.slot_duration_minutes
                )
            ).first()
            
            if existing_slot:
                # Update existing slot
                existing_slot.open_price = slot.open_price
                existing_slot.high_price = slot.high_price
                existing_slot.low_price = slot.low_price
                existing_slot.close_price = slot.close_price
                existing_slot.volume = slot.volume
                existing_slot.is_complete = slot.is_complete
                existing_slot.quality_score = slot.quality_score
                existing_slot.updated_at = datetime.now(timezone.utc)
                logger.debug(f"Updated cached intraday slot for ticker {slot.ticker_id}")
            else:
                # Add new slot
                self.db_session.add(slot)
                logger.debug(f"Cached new intraday slot for ticker {slot.ticker_id}")
            
            self.db_session.commit()
            return True
            
        except SQLAlchemyError as e:
            logger.error(f"Error caching intraday slot: {e}")
            self.db_session.rollback()
            return False
    
    def invalidate_cache(self, symbol: str = None, provider_id: int = None, data_type: str = 'all') -> int:
        """
        Invalidate cached data
        
        Args:
            symbol: Specific symbol to invalidate, or None for all
            provider_id: Specific provider to invalidate, or None for all
            data_type: Type of data to invalidate ('quotes', 'intraday', 'all')
            
        Returns:
            Number of invalidated items
        """
        try:
            invalidated_count = 0
            
            if data_type in ['quotes', 'all']:
                # Invalidate quotes
                query = self.db_session.query(MarketDataQuote)
                
                if symbol:
                    ticker = self.db_session.query(Ticker).filter(Ticker.symbol == symbol).first()
                    if ticker:
                        query = query.filter(MarketDataQuote.ticker_id == ticker.id)
                
                if provider_id:
                    query = query.filter(MarketDataQuote.provider_id == provider_id)
                
                # Mark as stale instead of deleting
                stale_quotes = query.update({
                    MarketDataQuote.is_stale: True,
                    MarketDataQuote.updated_at: datetime.now(timezone.utc)
                })
                invalidated_count += stale_quotes
            
            if data_type in ['intraday', 'all']:
                # Invalidate intraday data
                query = self.db_session.query(IntradayDataSlot)
                
                if symbol:
                    ticker = self.db_session.query(Ticker).filter(Ticker.symbol == symbol).first()
                    if ticker:
                        query = query.filter(IntradayDataSlot.ticker_id == ticker.id)
                
                if provider_id:
                    query = query.filter(IntradayDataSlot.provider_id == provider_id)
                
                # Mark as incomplete instead of deleting
                stale_slots = query.update({
                    IntradayDataSlot.is_complete: False,
                    IntradayDataSlot.updated_at: datetime.now(timezone.utc)
                })
                invalidated_count += stale_slots
            
            self.db_session.commit()
            logger.info(f"Invalidated {invalidated_count} cache items")
            return invalidated_count
            
        except SQLAlchemyError as e:
            logger.error(f"Error invalidating cache: {e}")
            self.db_session.rollback()
            return 0
    
    def cleanup_stale_cache(self, max_age_hours: int = 24) -> Dict[str, int]:
        """
        Clean up stale cache data
        
        Args:
            max_age_hours: Maximum age in hours before cleanup
            
        Returns:
            Dictionary with cleanup statistics
        """
        try:
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=max_age_hours)
            cleanup_stats = {
                'quotes_removed': 0,
                'intraday_removed': 0,
                'logs_cleaned': 0
            }
            
            # Clean up old quotes
            old_quotes = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.fetched_at < cutoff_time
            ).delete()
            cleanup_stats['quotes_removed'] = old_quotes
            
            # Clean up old intraday data
            old_intraday = self.db_session.query(IntradayDataSlot).filter(
                IntradayDataSlot.slot_start_utc < cutoff_time
            ).delete()
            cleanup_stats['intraday_removed'] = old_intraday
            
            # Clean up old refresh logs (keep last 7 days)
            week_ago = datetime.now(timezone.utc) - timedelta(days=7)
            old_logs = self.db_session.query(DataRefreshLog).filter(
                DataRefreshLog.start_time < week_ago
            ).delete()
            cleanup_stats['logs_cleaned'] = old_logs
            
            self.db_session.commit()
            
            logger.info(f"Cache cleanup completed: {cleanup_stats}")
            return cleanup_stats
            
        except SQLAlchemyError as e:
            logger.error(f"Error during cache cleanup: {e}")
            self.db_session.rollback()
            return {}
    
    def get_cache_stats(self) -> CacheStats:
        """
        Get cache statistics and performance metrics
        
        Returns:
            CacheStats object with current cache status
        """
        try:
            # Reset stats if more than 1 hour has passed
            current_time = time.time()
            if current_time - self.last_stats_reset > 3600:
                self.cache_hits = 0
                self.cache_misses = 0
                self.last_stats_reset = current_time
            
            # Get total counts
            total_quotes = self.db_session.query(MarketDataQuote).count()
            total_intraday = self.db_session.query(IntradayDataSlot).count()
            
            # Calculate cache hit rate
            total_requests = self.cache_hits + self.cache_misses
            cache_hit_rate = self.cache_hits / total_requests if total_requests > 0 else 0
            
            # Calculate average ages
            now = datetime.now(timezone.utc)
            
            # Average quote age
            quotes_with_age = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.fetched_at.isnot(None)
            ).all()
            
            if quotes_with_age:
                total_age_seconds = 0
                valid_quotes = 0
                
                for quote in quotes_with_age:
                    if quote.fetched_at:
                        fetched_time = quote.fetched_at
                        if fetched_time.tzinfo is None:
                            # Assume fetched time is in UTC (database default)
                            fetched_time = fetched_time.replace(tzinfo=timezone.utc)
                        
                        total_age_seconds += (now - fetched_time).total_seconds()
                        valid_quotes += 1
                
                avg_quote_age_minutes = total_age_seconds / valid_quotes / 60 if valid_quotes > 0 else 0
            else:
                avg_quote_age_minutes = 0
            
            # Average intraday age
            intraday_with_age = self.db_session.query(IntradayDataSlot).filter(
                IntradayDataSlot.slot_start_utc.isnot(None)
            ).all()
            
            if intraday_with_age:
                total_age_seconds = 0
                valid_slots = 0
                
                for slot in intraday_with_age:
                    if slot.slot_start_utc:
                        slot_time = slot.slot_start_utc
                        if slot_time.tzinfo is None:
                            # Assume slot time is in UTC (database default)
                            slot_time = slot_time.replace(tzinfo=timezone.utc)
                        
                        total_age_seconds += (now - slot_time).total_seconds()
                        valid_slots += 1
                
                avg_intraday_age_minutes = total_age_seconds / valid_slots / 60 if valid_slots > 0 else 0
            else:
                avg_intraday_age_minutes = 0
            
            # Count stale data
            stale_data_count = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.is_stale == True
            ).count()
            
            return CacheStats(
                total_quotes=total_quotes,
                total_intraday_slots=total_intraday,
                cache_hit_rate=cache_hit_rate,
                avg_quote_age_minutes=avg_quote_age_minutes,
                avg_intraday_age_minutes=avg_intraday_age_minutes,
                stale_data_count=stale_data_count
            )
            
        except SQLAlchemyError as e:
            logger.error(f"Error getting cache stats: {e}")
            return CacheStats(0, 0, 0.0, 0.0, 0.0, 0)
    
    def optimize_cache(self) -> Dict[str, Any]:
        """
        Optimize cache performance
        
        Returns:
            Dictionary with optimization results
        """
        try:
            optimization_results = {
                'quotes_compressed': 0,
                'intraday_compressed': 0,
                'indexes_optimized': False
            }
            
            # Compress old quotes (keep only daily snapshots for old data)
            week_ago = datetime.now(timezone.utc) - timedelta(days=7)
            old_quotes = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.fetched_at < week_ago
            ).all()
            
            # Group by ticker and date, keep only one per day
            ticker_date_groups = {}
            for quote in old_quotes:
                date_key = quote.fetched_at.date()
                ticker_date_key = (quote.ticker_id, date_key)
                
                if ticker_date_key not in ticker_date_groups:
                    ticker_date_groups[ticker_date_key] = []
                ticker_date_groups[ticker_date_key].append(quote)
            
            # Remove duplicate quotes, keep the one closest to market close (4 PM UTC)
            for (ticker_id, date), quotes in ticker_date_groups.items():
                if len(quotes) > 1:
                    # Find quote closest to 4 PM UTC
                    target_time = datetime.combine(date, datetime.min.time().replace(hour=16, minute=0))
                    target_time = target_time.replace(tzinfo=timezone.utc)
                    
                    best_quote = min(quotes, key=lambda q: abs((q.fetched_at - target_time).total_seconds()))
                    
                    # Remove other quotes
                    for quote in quotes:
                        if quote.id != best_quote.id:
                            self.db_session.delete(quote)
                    
                    optimization_results['quotes_compressed'] += len(quotes) - 1
            
            # Similar optimization for intraday data (keep only hourly for old data)
            old_intraday = self.db_session.query(IntradayDataSlot).filter(
                IntradayDataSlot.slot_start_utc < week_ago
            ).all()
            
            # Group by ticker and hour, keep only one per hour
            ticker_hour_groups = {}
            for slot in old_intraday:
                hour_key = slot.slot_start_utc.replace(minute=0, second=0, microsecond=0)
                ticker_hour_key = (slot.ticker_id, hour_key)
                
                if ticker_hour_key not in ticker_hour_groups:
                    ticker_hour_groups[ticker_hour_key] = []
                ticker_hour_groups[ticker_hour_key].append(slot)
            
            # Remove duplicate slots, keep the one closest to the hour
            for (ticker_id, hour), slots in ticker_hour_groups.items():
                if len(slots) > 1:
                    best_slot = min(slots, key=lambda s: abs((s.slot_start_utc - hour).total_seconds()))
                    
                    # Remove other slots
                    for slot in slots:
                        if slot.id != best_slot.id:
                            self.db_session.delete(slot)
                    
                    optimization_results['intraday_compressed'] += len(slots) - 1
            
            self.db_session.commit()
            
            logger.info(f"Cache optimization completed: {optimization_results}")
            return optimization_results
            
        except SQLAlchemyError as e:
            logger.error(f"Error during cache optimization: {e}")
            self.db_session.rollback()
            return {}
    
    def _is_quote_stale(self, quote: MarketDataQuote) -> bool:
        """Check if a quote is stale based on TTL settings"""
        if quote.is_stale:
            return True
        
        # Ensure both times are timezone-aware
        current_time = datetime.now(timezone.utc)
        fetched_time = quote.fetched_at
        
        if fetched_time.tzinfo is None:
            # Assume fetched time is in UTC (database default)
            fetched_time = fetched_time.replace(tzinfo=timezone.utc)
        
        age_seconds = (current_time - fetched_time).total_seconds()
        
        # Determine TTL based on data characteristics
        if quote.source == 'normalized':
            ttl = self.ttl_settings['warm']  # Normalized data gets longer TTL
        elif quote.quality_score >= 0.9:
            ttl = self.ttl_settings['hot']   # High quality data gets hot TTL
        elif quote.quality_score >= 0.7:
            ttl = self.ttl_settings['warm']  # Medium quality gets warm TTL
        else:
            ttl = self.ttl_settings['cool']  # Low quality gets cool TTL
        
        return age_seconds > ttl
    
    def _is_intraday_stale(self, slot: IntradayDataSlot) -> bool:
        """Check if intraday data is stale"""
        if not slot.is_complete:
            return True
        
        # Ensure both times are timezone-aware
        current_time = datetime.now(timezone.utc)
        slot_time = slot.slot_start_utc
        
        if slot_time.tzinfo is None:
            # Assume slot time is in UTC (database default)
            slot_time = slot_time.replace(tzinfo=timezone.utc)
        
        age_seconds = (current_time - slot_time).total_seconds()
        
        # Intraday data gets shorter TTL
        if slot.quality_score >= 0.9:
            ttl = self.ttl_settings['hot']
        else:
            ttl = self.ttl_settings['warm']
        
        return age_seconds > ttl
    
    def _should_update_quote(self, existing: MarketDataQuote, new: MarketDataQuote) -> bool:
        """Determine if we should update an existing quote"""
        # Always update if price change is significant
        if existing.price and new.price:
            price_change_pct = abs(new.price - existing.price) / existing.price * 100
            if price_change_pct > self.invalidation_thresholds['price_change_pct']:
                return True
        
        # Update if volume change is significant
        if existing.volume and new.volume:
            volume_change_pct = abs(new.volume - existing.volume) / existing.volume * 100
            if volume_change_pct > self.invalidation_thresholds['volume_change_pct']:
                return True
        
        # Update if time threshold is exceeded
        if existing.fetched_at:
            current_time = datetime.now(timezone.utc)
            fetched_time = existing.fetched_at
            
            if fetched_time.tzinfo is None:
                # Assume fetched time is in UTC (database default)
                fetched_time = fetched_time.replace(tzinfo=timezone.utc)
            
            time_since_update = (current_time - fetched_time).total_seconds()
            if time_since_update > self.invalidation_thresholds['time_threshold']:
                return True
        
        # Update if quality score improved significantly
        if new.quality_score > existing.quality_score + 0.1:
            return True
        
        return False

