"""
Cache Service - TikTrack

This module provides caching functionality to reduce database load
and improve performance for frequently accessed data.

Features:
- In-memory caching with TTL
- Function result caching
- Cache invalidation
- Performance monitoring

Author: TikTrack Development Team
Version: 1.0
Date: September 2025
"""

from functools import wraps
import time
import hashlib
import json
from typing import Dict, Any, Optional, Callable
from utils.performance_monitor import monitor_performance
import logging

logger = logging.getLogger(__name__)

class CacheService:
    """
    In-memory cache service for TikTrack
    
    Provides caching functionality with TTL (Time To Live) support
    and automatic cache invalidation.
    """
    
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._default_ttl = 300  # 5 minutes default
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        
        Args:
            key (str): Cache key
            
        Returns:
            Optional[Any]: Cached value or None if not found/expired
        """
        if key not in self._cache:
            return None
        
        cache_entry = self._cache[key]
        if time.time() > cache_entry['expires_at']:
            # Remove expired entry
            del self._cache[key]
            return None
        
        logger.debug(f"Cache hit for key: {key}")
        return cache_entry['data']
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Set value in cache
        
        Args:
            key (str): Cache key
            value (Any): Value to cache
            ttl (Optional[int]): Time to live in seconds
        """
        ttl = ttl or self._default_ttl
        expires_at = time.time() + ttl
        
        self._cache[key] = {
            'data': value,
            'expires_at': expires_at,
            'created_at': time.time()
        }
        
        logger.debug(f"Cached value for key: {key} (TTL: {ttl}s)")
    
    def delete(self, key: str) -> bool:
        """
        Delete value from cache
        
        Args:
            key (str): Cache key
            
        Returns:
            bool: True if key was found and deleted
        """
        if key in self._cache:
            del self._cache[key]
            logger.debug(f"Deleted cache key: {key}")
            return True
        return False
    
    def clear(self) -> None:
        """Clear all cache entries"""
        self._cache.clear()
        logger.info("Cache cleared")
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics
        
        Returns:
            Dict[str, Any]: Cache statistics
        """
        now = time.time()
        active_entries = 0
        expired_entries = 0
        
        for entry in self._cache.values():
            if now > entry['expires_at']:
                expired_entries += 1
            else:
                active_entries += 1
        
        return {
            'total_entries': len(self._cache),
            'active_entries': active_entries,
            'expired_entries': expired_entries,
            'memory_usage': len(str(self._cache))
        }
    
    def cleanup_expired(self) -> int:
        """
        Remove expired cache entries
        
        Returns:
            int: Number of entries removed
        """
        now = time.time()
        expired_keys = [
            key for key, entry in self._cache.items()
            if now > entry['expires_at']
        ]
        
        for key in expired_keys:
            del self._cache[key]
        
        if expired_keys:
            logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")
        
        return len(expired_keys)

# Global cache instance
cache_service = CacheService()

def cache_result(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator to cache function results
    
    Args:
        ttl (int): Time to live in seconds
        key_prefix (str): Prefix for cache key
        
    Returns:
        Callable: Decorated function
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            key_parts = [key_prefix, func.__name__]
            
            # Add args and kwargs to key
            if args:
                key_parts.append(str(args))
            if kwargs:
                # Sort kwargs for consistent key generation
                sorted_kwargs = sorted(kwargs.items())
                key_parts.append(str(sorted_kwargs))
            
            cache_key = hashlib.md5(
                json.dumps(key_parts, sort_keys=True).encode()
            ).hexdigest()
            
            # Try to get from cache
            cached_result = cache_service.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache_service.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

def cache_invalidate(pattern: str) -> int:
    """
    Invalidate cache entries matching pattern
    
    Args:
        pattern (str): Pattern to match cache keys
        
    Returns:
        int: Number of entries invalidated
    """
    invalidated_count = 0
    keys_to_remove = []
    
    for key in cache_service._cache.keys():
        if pattern in key:
            keys_to_remove.append(key)
    
    for key in keys_to_remove:
        cache_service.delete(key)
        invalidated_count += 1
    
    logger.info(f"Invalidated {invalidated_count} cache entries matching pattern: {pattern}")
    return invalidated_count

class CacheManager:
    """
    Advanced cache manager with specific caching strategies
    """
    
    @staticmethod
    @monitor_performance("cache_tickers_data")
    def cache_tickers_data(tickers_data: list, ttl: int = 600) -> None:
        """
        Cache tickers data
        
        Args:
            tickers_data (list): Tickers data to cache
            ttl (int): Time to live in seconds
        """
        cache_service.set("tickers_all", tickers_data, ttl)
        logger.info(f"Cached {len(tickers_data)} tickers for {ttl} seconds")
    
    @staticmethod
    @monitor_performance("cache_ticker_by_id")
    def cache_ticker_by_id(ticker_id: int, ticker_data: dict, ttl: int = 300) -> None:
        """
        Cache individual ticker data
        
        Args:
            ticker_id (int): Ticker ID
            ticker_data (dict): Ticker data
            ttl (int): Time to live in seconds
        """
        cache_key = f"ticker_{ticker_id}"
        cache_service.set(cache_key, ticker_data, ttl)
        logger.debug(f"Cached ticker {ticker_id} for {ttl} seconds")
    
    @staticmethod
    @monitor_performance("cache_trades_data")
    def cache_trades_data(trades_data: list, ttl: int = 300) -> None:
        """
        Cache trades data
        
        Args:
            trades_data (list): Trades data to cache
            ttl (int): Time to live in seconds
        """
        cache_service.set("trades_all", trades_data, ttl)
        logger.info(f"Cached {len(trades_data)} trades for {ttl} seconds")
    
    @staticmethod
    @monitor_performance("cache_accounts_data")
    def cache_accounts_data(accounts_data: list, ttl: int = 600) -> None:
        """
        Cache accounts data
        
        Args:
            accounts_data (list): Accounts data to cache
            ttl (int): Time to live in seconds
        """
        cache_service.set("accounts_all", accounts_data, ttl)
        logger.info(f"Cached {len(accounts_data)} accounts for {ttl} seconds")
    
    @staticmethod
    def invalidate_ticker_cache(ticker_id: Optional[int] = None) -> int:
        """
        Invalidate ticker-related cache
        
        Args:
            ticker_id (Optional[int]): Specific ticker ID or None for all
            
        Returns:
            int: Number of entries invalidated
        """
        if ticker_id:
            # Invalidate specific ticker
            cache_service.delete(f"ticker_{ticker_id}")
            return 1
        else:
            # Invalidate all ticker-related cache
            return cache_invalidate("ticker")
    
    @staticmethod
    def invalidate_trades_cache() -> int:
        """
        Invalidate trades-related cache
        
        Returns:
            int: Number of entries invalidated
        """
        return cache_invalidate("trades")
    
    @staticmethod
    def invalidate_accounts_cache() -> int:
        """
        Invalidate accounts-related cache
        
        Returns:
            int: Number of entries invalidated
        """
        return cache_invalidate("accounts")
    
    @staticmethod
    def get_cache_stats() -> Dict[str, Any]:
        """
        Get detailed cache statistics
        
        Returns:
            Dict[str, Any]: Cache statistics
        """
        stats = cache_service.get_stats()
        stats['cache_service'] = "TikTrack Cache Service"
        stats['default_ttl'] = cache_service._default_ttl
        return stats

# Convenience functions for common caching operations
def cache_tickers(ttl: int = 600):
    """Decorator to cache tickers data"""
    return cache_result(ttl=ttl, key_prefix="tickers")

def cache_trades(ttl: int = 300):
    """Decorator to cache trades data"""
    return cache_result(ttl=ttl, key_prefix="trades")

def cache_accounts(ttl: int = 600):
    """Decorator to cache accounts data"""
    return cache_result(ttl=ttl, key_prefix="accounts")
