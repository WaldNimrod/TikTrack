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

# Import cache configuration
from config.settings import CACHE_ENABLED
from config.logging import get_cache_logger

logger = logging.getLogger(__name__)
cache_logger = get_cache_logger()


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
        # Convert data to JSON-serializable format
        try:
            import json
            serializable_data = json.loads(json.dumps(self.data, default=str))
        except:
            serializable_data = str(self.data)
        
        from datetime import datetime
        return {
            'data': serializable_data,
            'ttl': self.ttl,
            'dependencies': list(self.dependencies),
            'created_at': self.created_at,
            'created_at_iso': datetime.fromtimestamp(self.created_at).isoformat(),
            'expires_at_iso': datetime.fromtimestamp(self.created_at + self.ttl).isoformat(),
            'access_count': self.access_count,
            'last_accessed': self.last_accessed,
            'last_accessed_iso': datetime.fromtimestamp(self.last_accessed).isoformat()
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
        # Check if cache is disabled
        if not CACHE_ENABLED:
            cache_logger.info(f"Cache disabled - skipping set for key: {key}")
            return
        
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
            
            # Log cache operation
            cache_logger.info(f"Cache SET: {key} (TTL: {ttl}s, Dependencies: {dependencies}, Data size: {len(str(data))} chars)")
            logger.debug(f"Cache set: {key} (TTL: {ttl}s, Dependencies: {dependencies})")
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get data from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached data or None if not found/expired
        """
        # Check if cache is disabled
        if not CACHE_ENABLED:
            logger.debug(f"Cache disabled - returning None for key: {key}")
            return None
        
        with self.lock:
            if key not in self.cache:
                self.stats['misses'] += 1
                cache_logger.info(f"Cache MISS: {key}")
                return None
            
            entry = self.cache[key]
            
            # Check if expired
            if entry.is_expired():
                self.stats['misses'] += 1
                cache_logger.info(f"Cache EXPIRED: {key} (Age: {time.time() - entry.created_at:.1f}s)")
                self.delete(key)
                return None
            
            # Record access
            entry.access()
            self.stats['hits'] += 1
            
            # Log cache hit
            cache_logger.info(f"Cache HIT: {key} (Access count: {entry.access_count})")
            return entry.data
    
    def delete(self, key: str):
        """Delete entry from cache"""
        # Check if cache is disabled
        if not CACHE_ENABLED:
            logger.debug(f"Cache disabled - skipping delete for key: {key}")
            return
        
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
                
                # Log cache delete
                cache_logger.info(f"Cache DELETE: {key} (Was accessed {entry.access_count} times)")
                logger.debug(f"Cache delete: {key}")
    
    def invalidate_by_dependency(self, dependency: str):
        """
        Invalidate all cache entries that depend on the given dependency.
        
        Args:
            dependency: Dependency key to invalidate
        """
        # Check if cache is disabled
        if not CACHE_ENABLED:
            logger.debug(f"Cache disabled - skipping invalidation for dependency: {dependency}")
            return
        
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
                'stats': self.stats.copy(),
                'hit_rate': hit_rate / 100,  # For compatibility with frontend
                'hit_rate_change': 0,  # Placeholder for change calculation
                'total_size_bytes': estimated_memory,
                'size_change_bytes': 0,  # Placeholder for change calculation
                'avg_response_time_ms': 10,  # Placeholder
                'response_time_change_ms': 0,  # Placeholder
                'total_requests': total_requests,
                'requests_change': 0,  # Placeholder
                'optimized': False,  # Placeholder
                'memory_available_mb': round((self.max_memory_bytes - estimated_memory) / (1024 * 1024), 2)
            }
    
    def get_all_entries(self) -> List[Dict[str, Any]]:
        """Get all cache entries as a list"""
        with self.lock:
            entries = []
            for key, entry in self.cache.items():
                entry_dict = entry.to_dict()
                entry_dict['key'] = key
                entry_dict['type'] = self._get_entry_type(key)
                entry_dict['status'] = 'expired' if entry.is_expired() else 'active'
                entry_dict['size'] = self._estimate_entry_size(entry)
                entry_dict['description'] = self._get_entry_description(key, entry_dict['type'])
                entries.append(entry_dict)
            return entries
    
    def clear_expired(self) -> int:
        """Clear all expired cache entries"""
        with self.lock:
            expired_keys = [key for key, entry in self.cache.items() if entry.is_expired()]
            for key in expired_keys:
                del self.cache[key]
                self.stats['deletes'] += 1
            
            logger.info(f"Cleared {len(expired_keys)} expired cache entries")
            return len(expired_keys)
    
    def preload_common_data(self) -> int:
        """Preload cache with common data"""
        with self.lock:
            # Add some common cache entries
            common_data = {
                'system_config': {'theme': 'dark', 'language': 'he'},
                'user_preferences': {'notifications': True, 'auto_refresh': 30},
                'market_status': {'status': 'open', 'last_update': time.time()},
                'api_keys': {'yahoo': 'demo_key', 'alpha_vantage': 'demo_key'}
            }
            
            preloaded_count = 0
            for key, data in common_data.items():
                if key not in self.cache:
                    self.cache[key] = CacheEntry(
                        data=data,
                        ttl=3600,  # 1 hour
                        dependencies=[],
                        created_at=time.time()
                    )
                    preloaded_count += 1
            
            logger.info(f"Preloaded {preloaded_count} common cache entries")
            return preloaded_count
    
    def optimize(self) -> Dict[str, Any]:
        """Optimize cache performance"""
        with self.lock:
            # Remove least recently used entries if memory is full
            current_memory = self._estimate_memory_usage()
            optimized_size = 0
            
            if current_memory > self.max_memory_bytes * 0.8:  # 80% threshold
                # Sort by last accessed time and remove oldest
                sorted_entries = sorted(
                    self.cache.items(),
                    key=lambda x: x[1].last_accessed
                )
                
                # Remove 20% of oldest entries
                remove_count = len(sorted_entries) // 5
                for key, entry in sorted_entries[:remove_count]:
                    optimized_size += self._estimate_entry_size(entry)
                    del self.cache[key]
                    self.stats['deletes'] += 1
            
            logger.info(f"Cache optimized: freed {optimized_size} bytes")
            return {'optimized_size_bytes': optimized_size}
    
    def get_analytics(self) -> Dict[str, Any]:
        """Get cache analytics and performance data"""
        with self.lock:
            stats = self.get_stats()
            
            # Calculate performance metrics
            total_requests = stats['stats']['hits'] + stats['stats']['misses']
            efficiency = (stats['stats']['hits'] / total_requests * 100) if total_requests > 0 else 0
            
            return {
                'performance': {
                    'hit_rate': stats['hit_rate_percent'],
                    'total_requests': total_requests,
                    'cache_size_mb': stats['estimated_memory_mb'],
                    'efficiency_score': round(efficiency, 2)
                },
                'recommendations': [
                    'Cache is performing well' if efficiency > 70 else 'Consider increasing cache size',
                    'Monitor memory usage regularly' if stats['memory_usage_percent'] > 80 else 'Memory usage is optimal'
                ],
                'quality': 'Excellent' if efficiency > 90 else 'Good' if efficiency > 70 else 'Needs improvement'
            }
    
    def get_dependencies(self) -> Dict[str, Any]:
        """Get cache dependencies information"""
        with self.lock:
            return {
                'total_dependencies': len(self.dependencies),
                'dependency_chains': list(self.dependencies.keys()),
                'circular_dependencies': self._detect_circular_dependencies(),
                'orphaned_entries': self._find_orphaned_entries()
            }
    
    def _get_entry_type(self, key: str) -> str:
        """Determine entry type based on key"""
        if 'api' in key.lower():
            return 'api'
        elif 'external' in key.lower():
            return 'external'
        elif 'static' in key.lower():
            return 'static'
        elif 'session' in key.lower():
            return 'session'
        else:
            return 'computed'
    
    def _estimate_entry_size(self, entry: CacheEntry) -> int:
        """Estimate size of a cache entry in bytes"""
        try:
            return len(str(entry.data).encode('utf-8'))
        except:
            return 1024  # Default estimate
    
    def _detect_circular_dependencies(self) -> List[List[str]]:
        """Detect circular dependencies"""
        # Simplified circular dependency detection
        return []
    
    def _find_orphaned_entries(self) -> List[str]:
        """Find orphaned cache entries"""
        # Simplified orphaned entry detection
        return []
    
    def _get_entry_description(self, key: str, entry_type: str) -> str:
        """Get description for cache entry"""
        descriptions = {
            'api': f'ערך מטמון API עבור {key}',
            'external': f'נתונים חיצוניים עבור {key}',
            'static': f'נתונים סטטיים עבור {key}',
            'session': f'נתוני סשן עבור {key}',
            'computed': f'ערך מחושב עבור {key}'
        }
        return descriptions.get(entry_type, f'ערך מטמון עבור {key}')

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
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key based on function and arguments
            import hashlib
            func_name = f"{func.__module__}.{func.__name__}"
            args_str = str(args) + str(sorted(kwargs.items()))
            cache_key = f"{func_name}:{hashlib.md5(args_str.encode()).hexdigest()}"
            
            # Check cache first
            cached_result = advanced_cache_service.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Cache miss - execute function and cache result
            result = func(*args, **kwargs)
            advanced_cache_service.set(cache_key, result, ttl=ttl)
            return result
        return wrapper
    return decorator


def cache_with_deps(ttl: int = 300, dependencies: List[str] = None):
    """Caching decorator with dependencies"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key based on function and arguments
            import hashlib
            func_name = f"{func.__module__}.{func.__name__}"
            args_str = str(args) + str(sorted(kwargs.items()))
            cache_key = f"{func_name}:{hashlib.md5(args_str.encode()).hexdigest()}"
            
            # Check cache first
            cached_result = advanced_cache_service.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Cache miss - execute function and cache result
            result = func(*args, **kwargs)
            advanced_cache_service.set(cache_key, result, ttl=ttl, dependencies=dependencies)
            return result
        return wrapper
    return decorator


def invalidate_cache(dependencies: List[str]):
    """Decorator that invalidates cache by dependencies after function execution"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            logger.info(f"🔄 DECORATOR CALLED: About to execute {func.__name__} and then invalidate cache for dependencies {dependencies}")
            
            # Execute the original function
            result = func(*args, **kwargs)
            
            # Invalidate cache after successful execution
            try:
                logger.info(f"🧹 Starting cache invalidation for dependencies {dependencies}")
                
                total_invalidated = 0
                for dependency in dependencies:
                    invalidated_count = len(advanced_cache_service.dependencies.get(dependency, set()))
                    advanced_cache_service.invalidate_by_dependency(dependency)
                    total_invalidated += invalidated_count
                
                logger.info(f"✅ Cache invalidated for dependencies {dependencies}: {total_invalidated} entries removed")
                
            except Exception as e:
                logger.error(f"❌ Failed to invalidate cache for dependencies {dependencies}: {e}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
            return result
        return wrapper
    return decorator


def clear_cache():
    """Clear all cache"""
    advanced_cache_service.clear()


def get_cache_stats():
    """Get cache statistics"""
    return advanced_cache_service.get_stats()


def cache_health_check():
    """Perform cache health check"""
    return advanced_cache_service.health_check()
