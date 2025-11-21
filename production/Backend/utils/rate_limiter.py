"""
Rate Limiter - TikTrack

This module provides rate limiting functionality to prevent system overload
and protect against abuse. Includes IP-based limiting, endpoint-specific limits,
and configurable time windows.

Features:
- IP-based rate limiting
- Endpoint-specific limits
- Configurable time windows
- Automatic cleanup
- Detailed monitoring

Author: TikTrack Development Team
Version: 1.0
Date: September 2025
"""

import time
import json
from collections import defaultdict, deque
from typing import Dict, Any, Optional, Callable
from flask import request, jsonify, g
from functools import wraps
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """
    Advanced rate limiter for TikTrack
    """
    
    def __init__(self):
        self.rate_limits: Dict[str, deque] = defaultdict(deque)
        self.endpoint_limits: Dict[str, Dict[str, int]] = {
            'default': {'requests': 5000, 'window': 60},  # 5000 requests per minute (increased for development)
            'api': {'requests': 5000, 'window': 60},      # 5000 requests per minute (increased for development)
            'auth': {'requests': 500, 'window': 60},      # 500 requests per minute (increased for development)
            'upload': {'requests': 1000, 'window': 60},    # 1000 requests per minute (increased for development)
            'admin': {'requests': 10000, 'window': 60},    # 10000 requests per minute (increased for development)
        }
        self.last_cleanup = time.time()
        self.cleanup_interval = 300  # 5 minutes
    
    def get_client_identifier(self) -> str:
        """
        Get unique client identifier
        
        Returns:
            str: Client identifier
        """
        # Try to get real IP from headers
        if request.headers.get('X-Forwarded-For'):
            return request.headers.get('X-Forwarded-For').split(',')[0].strip()
        elif request.headers.get('X-Real-IP'):
            return request.headers.get('X-Real-IP')
        else:
            return request.remote_addr
    
    def get_endpoint_type(self, endpoint: str) -> str:
        """
        Determine endpoint type for rate limiting
        
        Args:
            endpoint (str): Request endpoint
            
        Returns:
            str: Endpoint type
        """
        if endpoint.startswith('/api/auth'):
            return 'auth'
        elif endpoint.startswith('/api/admin'):
            return 'admin'
        elif endpoint.startswith('/api/upload'):
            return 'upload'
        elif endpoint.startswith('/api/'):
            return 'api'
        else:
            return 'default'
    
    def is_rate_limited(self, client_id: str, endpoint_type: str = 'default') -> Dict[str, Any]:
        """
        Check if client is rate limited
        
        Args:
            client_id (str): Client identifier
            endpoint_type (str): Endpoint type
            
        Returns:
            Dict[str, Any]: Rate limit status
        """
        now = time.time()
        
        # Get limits for endpoint type
        limits = self.endpoint_limits.get(endpoint_type, self.endpoint_limits['default'])
        max_requests = limits['requests']
        window = limits['window']
        
        # Create unique key for client + endpoint
        key = f"{client_id}:{endpoint_type}"
        
        # Clean old requests outside the window
        if key in self.rate_limits:
            while self.rate_limits[key] and now - self.rate_limits[key][0] > window:
                self.rate_limits[key].popleft()
        
        # Check if limit exceeded
        current_requests = len(self.rate_limits[key])
        is_limited = current_requests >= max_requests
        
        if not is_limited:
            # Add current request
            self.rate_limits[key].append(now)
        
        # Calculate remaining requests and reset time
        remaining_requests = max(0, max_requests - current_requests)
        reset_time = now + window
        
        # Cleanup old data periodically
        if now - self.last_cleanup > self.cleanup_interval:
            self.cleanup_old_data()
            self.last_cleanup = now
        
        return {
            'limited': is_limited,
            'remaining': remaining_requests,
            'reset_time': reset_time,
            'current_requests': current_requests,
            'max_requests': max_requests,
            'window': window
        }
    
    def cleanup_old_data(self) -> None:
        """
        Clean up old rate limit data
        """
        now = time.time()
        keys_to_remove = []
        
        for key, requests in self.rate_limits.items():
            # Remove old requests
            while requests and now - requests[0] > 3600:  # 1 hour
                requests.popleft()
            
            # Remove empty entries
            if not requests:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.rate_limits[key]
        
        logger.info(f"Rate limiter cleanup: removed {len(keys_to_remove)} empty entries")
    
    def get_rate_limit_headers(self, status: Dict[str, Any]) -> Dict[str, str]:
        """
        Generate rate limit headers
        
        Args:
            status (Dict[str, Any]): Rate limit status
            
        Returns:
            Dict[str, str]: Headers dictionary
        """
        return {
            'X-RateLimit-Limit': str(status['max_requests']),
            'X-RateLimit-Remaining': str(status['remaining']),
            'X-RateLimit-Reset': str(int(status['reset_time'])),
            'X-RateLimit-Reset-Time': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(status['reset_time']))
        }
    
    def get_rate_limit_stats(self) -> Dict[str, Any]:
        """
        Get rate limiter statistics
        
        Returns:
            Dict[str, Any]: Statistics
        """
        now = time.time()
        total_clients = len(self.rate_limits)
        total_requests = sum(len(requests) for requests in self.rate_limits.values())
        
        # Count limited clients
        limited_clients = 0
        for key, requests in self.rate_limits.items():
            endpoint_type = key.split(':', 1)[1] if ':' in key else 'default'
            limits = self.endpoint_limits.get(endpoint_type, self.endpoint_limits['default'])
            if len(requests) >= limits['requests']:
                limited_clients += 1
        
        return {
            'total_clients': total_clients,
            'total_requests': total_requests,
            'limited_clients': limited_clients,
            'endpoint_limits': self.endpoint_limits.copy(),
            'last_cleanup': self.last_cleanup,
            'cleanup_interval': self.cleanup_interval
        }

# Global rate limiter instance
rate_limiter = RateLimiter()

def rate_limit(requests_per_minute: Optional[int] = None, 
               window_seconds: Optional[int] = None,
               endpoint_type: Optional[str] = None):
    """
    Decorator for rate limiting endpoints
    
    Args:
        requests_per_minute (Optional[int]): Custom requests per minute
        window_seconds (Optional[int]): Custom window in seconds
        endpoint_type (Optional[str]): Custom endpoint type
        
    Returns:
        Callable: Decorated function
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Get client identifier
            client_id = rate_limiter.get_client_identifier()
            
            # Determine endpoint type
            if endpoint_type:
                ep_type = endpoint_type
            else:
                ep_type = rate_limiter.get_endpoint_type(request.path)
            
            # Apply custom limits if provided
            if requests_per_minute or window_seconds:
                original_limits = rate_limiter.endpoint_limits.get(ep_type, rate_limiter.endpoint_limits['default']).copy()
                if requests_per_minute:
                    original_limits['requests'] = requests_per_minute
                if window_seconds:
                    original_limits['window'] = window_seconds
                
                # Temporarily set custom limits
                rate_limiter.endpoint_limits[ep_type] = original_limits
            
            # Check rate limit
            status = rate_limiter.is_rate_limited(client_id, ep_type)
            
            # Add rate limit headers
            headers = rate_limiter.get_rate_limit_headers(status)
            for header, value in headers.items():
                g.setdefault('response_headers', {})[header] = value
            
            if status['limited']:
                logger.warning(f"Rate limit exceeded for {client_id} on {request.path}")
                return jsonify({
                    'status': 'error',
                    'error_code': 'RATE_LIMIT_EXCEEDED',
                    'message': 'Rate limit exceeded',
                    'details': {
                        'remaining_requests': status['remaining'],
                        'reset_time': status['reset_time'],
                        'reset_time_formatted': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(status['reset_time']))
                    }
                }), 429
            
            # Call original function
            return func(*args, **kwargs)
        
        return wrapper
    return decorator

def rate_limit_by_ip(requests_per_minute: int = 60, window_seconds: int = 60):
    """
    Simple IP-based rate limiting decorator
    
    Args:
        requests_per_minute (int): Requests per minute
        window_seconds (int): Window in seconds
        
    Returns:
        Callable: Decorated function
    """
    return rate_limit(requests_per_minute, window_seconds)

def rate_limit_api(requests_per_minute: int = 100):
    """
    API-specific rate limiting decorator
    
    Args:
        requests_per_minute (int): Requests per minute
        
    Returns:
        Callable: Decorated function
    """
    return rate_limit(requests_per_minute, endpoint_type='api')

def rate_limit_auth(requests_per_minute: int = 10):
    """
    Authentication-specific rate limiting decorator
    
    Args:
        requests_per_minute (int): Requests per minute
        
    Returns:
        Callable: Decorated function
    """
    return rate_limit(requests_per_minute, endpoint_type='auth')

def rate_limit_upload(requests_per_minute: int = 20):
    """
    Upload-specific rate limiting decorator
    
    Args:
        requests_per_minute (int): Requests per minute
        
    Returns:
        Callable: Decorated function
    """
    return rate_limit(requests_per_minute, endpoint_type='upload')

def rate_limit_admin(requests_per_minute: int = 200):
    """
    Admin-specific rate limiting decorator
    
    Args:
        requests_per_minute (int): Requests per minute
        
    Returns:
        Callable: Decorated function
    """
    return rate_limit(requests_per_minute, endpoint_type='admin')

class RateLimitMiddleware:
    """
    Middleware for automatic rate limiting
    """
    
    def __init__(self, app):
        self.app = app
        self.rate_limiter = RateLimiter()
    
    def __call__(self, environ, start_response):
        path_info = environ.get('PATH_INFO', '') or ''

        # Skip rate limiting for static assets and HTML pages
        if not (path_info == '/api' or path_info.startswith('/api/')):
            return self.app(environ, start_response)

        # Get client identifier
        client_id = environ.get('REMOTE_ADDR', 'unknown')
        
        # Get endpoint type
        endpoint_type = self.rate_limiter.get_endpoint_type(path_info)
        
        # Check rate limit
        status = self.rate_limiter.is_rate_limited(client_id, endpoint_type)
        
        if status['limited']:
            # Return rate limit error
            status_code = '429 Too Many Requests'
            headers = [
                ('Content-Type', 'application/json'),
                ('X-RateLimit-Limit', str(status['max_requests'])),
                ('X-RateLimit-Remaining', str(status['remaining'])),
                ('X-RateLimit-Reset', str(int(status['reset_time'])))
            ]
            
            response_body = {
                'status': 'error',
                'error_code': 'RATE_LIMIT_EXCEEDED',
                'message': 'Rate limit exceeded',
                'details': {
                    'remaining_requests': status['remaining'],
                    'reset_time': status['reset_time']
                }
            }
            
            start_response(status_code, headers)
            return [json.dumps(response_body).encode('utf-8')]
        
        # Continue with normal request
        return self.app(environ, start_response)
