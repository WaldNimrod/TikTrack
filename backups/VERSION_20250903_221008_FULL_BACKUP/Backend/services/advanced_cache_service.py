"""
Advanced Cache Service - TikTrack
Advanced caching system with dependency management and automatic invalidation.

This service provides intelligent caching with:
- TTL-based caching
- Dependency-based invalidation
- Automatic cache management
- Performance monitoring
- Memory optimization

Author: TikTrack Development Team
Created: September 2025
Version: 1.0
"""

import time
import hashlib
import json
import logging
from functools import wraps
from typing import Dict, Any, Optional, List, Union, Callable
from datetime import datetime, timedelta
import threading

logger = logging.getLogger(__name__)


class CacheEntry:
    """Represents a single cache entry"""
    
    def __init__(self, data: Any, ttl: int, dependencies: List[str], created_at: float):
        self.data = data
        self.ttl = ttl
        self.dependencies = set(dependencies) if dependencies else set()
        self.created_at = created_at
        self.access_count = 0
        self.last_accessed = created_at
    
    def is_expired(self) -> bool:
        """Check if cache entry is expired"""
        return time.time() - self.created_at > self.ttl
    
    def access(self):
        """Record access to cache entry"""
        self.access_count += 1
        self.last_accessed = time.time()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            'data': self.data,
            'ttl': self.ttl,
            'dependencies': list(self.dependencies),
            'created_at': self.created_at,
            'access_count': self.access_count,
            'last_accessed': self.last_accessed
        }


class AdvancedCacheService:
    """
    Advanced caching service with dependency management and automatic invalidation.
    
    Features:
    - TTL-based caching with automatic expiration
    - Dependency-based invalidation
    - Memory usage optimization
    - Performance monitoring
    - Thread-safe operations
    """
    
    def __init__(self, max_memory_mb: int = 100, cleanup_interval: int = 300):
        """
        Initialize the advanced cache service.
        
        Args:
            max_memory_mb: Maximum memory usage in MB
            cleanup_interval: Cleanup interval in seconds
        """
        self.cache: Dict[str, CacheEntry] = {}
        self.dependencies: Dict[str, set] = {}
        self.max_memory_bytes = max_memory_mb * 1024 * 1024
        self.cleanup_interval = cleanup_interval
        self.stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0,
            'invalidations': 0
        }
        self.lock = threading.RLock()
        
        # Start cleanup thread
        self._start_cleanup_thread()
        logger.info(f"Advanced Cache Service initialized with {max_memory_mb}MB limit")
    
    def _start_cleanup_thread(self):
        """Start background cleanup thread"""
        def cleanup_worker():
            while True:
                try:
                    time.sleep(self.cleanup_interval)
                    self._cleanup_expired_entries()
                    self._optimize_memory_usage()
                except Exception as e:
                    logger.error(f"Cache cleanup error: {e}")
        
        cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
        cleanup_thread.start()
        logger.info("Cache cleanup thread started")
    
    def _generate_cache_key(self, func: Callable, args: tuple, kwargs: dict) -> str:
        """Generate unique cache key for function call"""
        # Create a unique identifier for the function call
        func_name = f"{func.__module__}.{func.__name__}"
        args_str = str(args) + str(sorted(kwargs.items()))
        
        # Create hash of the function call
        key_data = f"{func_name}:{args_str}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def cache_with_dependencies(self, ttl: int = 300, dependencies: List[str] = None):
        """
        Decorator for caching function results with dependencies.
        
        Args:
            ttl: Time to live in seconds
            dependencies: List of dependency keys for invalidation
        """
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Generate cache key
                cache_key = self._generate_cache_key(func, args, kwargs)
                
                # Try to get from cache
                cached_result = self.get(cache_key)
                if cached_result is not None:
                    self.stats['hits'] += 1
                    return cached_result
                
                # Cache miss - execute function
                self.stats['misses'] += 1
                result = func(*args, **kwargs)
                
                # Store result in cache
                self.set(cache_key, result, ttl, dependencies)
                return result
            return wrapper
        return decorator
    
    def set(self, key: str, data: Any, ttl: int = 300, dependencies: List[str] = None):
        """
        Set data in cache with TTL and dependencies.
        
        Args:
            key: Cache key
            data: Data to cache
            ttl: Time to live in seconds
            dependencies: List of dependency keys
        """
        with self.lock:
            # Create cache entry
            entry = CacheEntry(
                data=data,
                ttl=ttl,
                dependencies=dependencies or [],
                created_at=time.time()
            )
            
            # Store in cache
            self.cache[key] = entry
            self.stats['sets'] += 1
            
            # Update dependency mappings
            if dependencies:
                for dep in dependencies:
                    if dep not in self.dependencies:
                        self.dependencies[dep] = set()
                    self.dependencies[dep].add(key)
            
            logger.debug(f"Cache set: {key} (TTL: {ttl}s, Dependencies: {dependencies})")
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get data from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached data or None if not found/expired
        """
        with self.lock:
            if key not in self.cache:
                return None
            
            entry = self.cache[key]
            
            # Check if expired
            if entry.is_expired():
                self.delete(key)
                return None
            
            # Record access
            entry.access()
            return entry.data
    
    def delete(self, key: str):
        """Delete entry from cache"""
        with self.lock:
            if key in self.cache:
                entry = self.cache[key]
                
                # Remove from dependency mappings
                for dep in entry.dependencies:
                    if dep in self.dependencies and key in self.dependencies[dep]:
                        self.dependencies[dep].remove(key)
                        if not self.dependencies[dep]:
                            del self.dependencies[dep]
                
                # Remove from cache
                del self.cache[key]
                self.stats['deletes'] += 1
                
                logger.debug(f"Cache delete: {key}")
    
    def invalidate_by_dependency(self, dependency: str):
        """
        Invalidate all cache entries that depend on the given dependency.
        
        Args:
            dependency: Dependency key to invalidate
        """
        with self.lock:
            if dependency in self.dependencies:
                keys_to_invalidate = list(self.dependencies[dependency])
                
                for key in keys_to_invalidate:
                    self.delete(key)
                
                self.stats['invalidations'] += len(keys_to_invalidate)
                logger.info(f"Invalidated {len(keys_to_invalidate)} cache entries for dependency: {dependency}")
    
    def invalidate_pattern(self, pattern: str):
        """
        Invalidate cache entries matching a pattern.
        
        Args:
            pattern: Pattern to match (supports wildcards)
        """
        with self.lock:
            keys_to_invalidate = []
            
            for key in self.cache.keys():
                if self._matches_pattern(key, pattern):
                    keys_to_invalidate.append(key)
            
            for key in keys_to_invalidate:
                self.delete(key)
            
            self.stats['invalidations'] += len(keys_to_invalidate)
            logger.info(f"Invalidated {len(keys_to_invalidate)} cache entries matching pattern: {pattern}")
    
    def _matches_pattern(self, key: str, pattern: str) -> bool:
        """Check if key matches pattern (simple wildcard support)"""
        if '*' not in pattern:
            return key == pattern
        
        # Convert pattern to regex
        regex_pattern = pattern.replace('*', '.*')
        import re
        return re.match(regex_pattern, key) is not None
    
    def clear(self):
        """Clear all cache entries"""
        with self.lock:
            cache_size = len(self.cache)
            self.cache.clear()
            self.dependencies.clear()
            self.stats['deletes'] += cache_size
            logger.info(f"Cache cleared: {cache_size} entries removed")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self.lock:
            current_time = time.time()
            total_entries = len(self.cache)
            expired_entries = sum(1 for entry in self.cache.values() if entry.is_expired())
            
            # Calculate hit rate
            total_requests = self.stats['hits'] + self.stats['misses']
            hit_rate = (self.stats['hits'] / total_requests * 100) if total_requests > 0 else 0
            
            # Estimate memory usage
            estimated_memory = self._estimate_memory_usage()
            
            return {
                'total_entries': total_entries,
                'expired_entries': expired_entries,
                'hit_rate_percent': round(hit_rate, 2),
                'estimated_memory_mb': round(estimated_memory / (1024 * 1024), 2),
                'max_memory_mb': round(self.max_memory_bytes / (1024 * 1024), 2),
                'memory_usage_percent': round((estimated_memory / self.max_memory_bytes) * 100, 2),
                'stats': self.stats.copy()
            }
    
    def _estimate_memory_usage(self) -> int:
        """Estimate current memory usage in bytes"""
        total_size = 0
        
        for key, entry in self.cache.items():
            # Estimate key size
            total_size += len(key.encode('utf-8'))
            
            # Estimate entry size (rough approximation)
            try:
                entry_size = len(json.dumps(entry.to_dict()))
                total_size += entry_size
            except:
                # Fallback estimation
                total_size += 1024  # 1KB default
        
        return total_size
    
    def _cleanup_expired_entries(self):
        """Remove expired cache entries"""
        with self.lock:
            expired_keys = [key for key, entry in self.cache.items() if entry.is_expired()]
            
            for key in expired_keys:
                self.delete(key)
            
            if expired_keys:
                logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")
    
    def _optimize_memory_usage(self):
        """Optimize memory usage by removing least accessed entries"""
        with self.lock:
            current_memory = self._estimate_memory_usage()
            
            if current_memory <= self.max_memory_bytes:
                return
            
            # Sort entries by access count and last access time
            entries = [(key, entry) for key, entry in self.cache.items()]
            entries.sort(key=lambda x: (x[1].access_count, x[1].last_accessed))
            
            # Remove least accessed entries until memory usage is acceptable
            removed_count = 0
            for key, entry in entries:
                if current_memory <= self.max_memory_bytes * 0.8:  # Keep 80% of max
                    break
                
                self.delete(key)
                removed_count += 1
                
                # Recalculate memory usage
                current_memory = self._estimate_memory_usage()
            
            if removed_count > 0:
                logger.info(f"Memory optimization: removed {removed_count} least accessed cache entries")
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check on cache service"""
        try:
            stats = self.get_stats()
            
            # Check memory usage
            memory_ok = stats['memory_usage_percent'] < 90
            
            # Check hit rate
            hit_rate_ok = stats['hit_rate_percent'] > 10  # At least 10% hit rate
            
            health_status = 'healthy' if memory_ok and hit_rate_ok else 'warning'
            
            return {
                'status': health_status,
                'memory_ok': memory_ok,
                'hit_rate_ok': hit_rate_ok,
                'stats': stats,
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Cache health check failed: {e}")
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }


# Global cache service instance
advanced_cache_service = AdvancedCacheService()


# Convenience decorators for common use cases
def cache_for(ttl: int = 300):
    """Simple caching decorator with TTL"""
    return advanced_cache_service.cache_with_dependencies(ttl=ttl)


def cache_with_deps(ttl: int = 300, dependencies: List[str] = None):
    """Caching decorator with dependencies"""
    return advanced_cache_service.cache_with_dependencies(ttl=ttl, dependencies=dependencies)


def invalidate_cache(dependency: str):
    """Invalidate cache by dependency"""
    advanced_cache_service.invalidate_by_dependency(dependency)


def clear_cache():
    """Clear all cache"""
    advanced_cache_service.clear()


def get_cache_stats():
    """Get cache statistics"""
    return advanced_cache_service.get_stats()


def cache_health_check():
    """Perform cache health check"""
    return advanced_cache_service.health_check()
