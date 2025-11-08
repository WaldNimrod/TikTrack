"""
Response Headers Optimizer - TikTrack

This module provides response headers optimization for improved browser performance
and security. Includes caching headers, security headers, and performance headers.

Features:
- Cache control headers
- Security headers
- Performance headers
- CORS configuration
- Content type optimization

Author: TikTrack Development Team
Version: 1.0
Date: September 2025
"""

from flask import Response, request
from typing import Dict, Any, Optional
import time

class ResponseOptimizer:
    """
    Response headers optimizer for TikTrack
    """
    
    # Default security headers
    SECURITY_HEADERS = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }
    
    # Default cache headers for different content types
    CACHE_HEADERS = {
        'api': {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        'static': {
            'Cache-Control': 'public, max-age=31536000, immutable'
        },
        'dynamic': {
            'Cache-Control': 'public, max-age=300, must-revalidate'
        },
        'sensitive': {
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        'cacheable_api': {
            'Cache-Control': 'public, max-age=300, must-revalidate'  # 5 minutes cache for cacheable APIs
        }
    }
    
    # Performance headers
    PERFORMANCE_HEADERS = {
        'Server-Timing': None,  # Will be set dynamically
        'X-Response-Time': None  # Will be set dynamically
    }
    
    @staticmethod
    def add_security_headers(response: Response) -> Response:
        """
        Add security headers to response
        
        Args:
            response (Response): Flask response object
            
        Returns:
            Response: Response with security headers
        """
        for header, value in ResponseOptimizer.SECURITY_HEADERS.items():
            response.headers[header] = value
        
        return response
    
    @staticmethod
    def add_cache_headers(response: Response, cache_type: str = 'dynamic') -> Response:
        """
        Add cache headers to response
        
        Args:
            response (Response): Flask response object
            cache_type (str): Type of cache control ('api', 'static', 'dynamic', 'sensitive')
            
        Returns:
            Response: Response with cache headers
        """
        if cache_type in ResponseOptimizer.CACHE_HEADERS:
            for header, value in ResponseOptimizer.CACHE_HEADERS[cache_type].items():
                response.headers[header] = value
        
        return response
    
    @staticmethod
    def add_performance_headers(response: Response, start_time: Optional[float] = None) -> Response:
        """
        Add performance headers to response
        
        Args:
            response (Response): Flask response object
            start_time (Optional[float]): Request start time
            
        Returns:
            Response: Response with performance headers
        """
        if start_time:
            response_time = (time.time() - start_time) * 1000
            response.headers['X-Response-Time'] = f"{response_time:.2f}ms"
            
            # Add server timing header
            server_timing = f"total;dur={response_time:.2f}"
            response.headers['Server-Timing'] = server_timing
        
        return response
    
    @staticmethod
    def add_cors_headers(response: Response, origin: str = "*") -> Response:
        """
        Add CORS headers to response
        
        Args:
            response (Response): Flask response object
            origin (str): Allowed origin
            
        Returns:
            Response: Response with CORS headers
        """
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        
        return response
    
    @staticmethod
    def add_content_type_headers(response: Response, content_type: str = 'application/json') -> Response:
        """
        Add content type headers to response
        
        Args:
            response (Response): Flask response object
            content_type (str): Content type
            
        Returns:
            Response: Response with content type headers
        """
        response.headers['Content-Type'] = content_type
        response.headers['X-Content-Type'] = content_type
        
        return response
    
    @staticmethod
    def optimize_response(response: Response, 
                         cache_type: str = 'dynamic',
                         start_time: Optional[float] = None,
                         origin: str = "*") -> Response:
        """
        Optimize response with all headers
        
        Args:
            response (Response): Flask response object
            cache_type (str): Type of cache control
            start_time (Optional[float]): Request start time
            origin (str): CORS origin
            
        Returns:
            Response: Fully optimized response
        """
        # Add security headers
        response = ResponseOptimizer.add_security_headers(response)
        
        # Add cache headers
        response = ResponseOptimizer.add_cache_headers(response, cache_type)
        
        # Add performance headers
        response = ResponseOptimizer.add_performance_headers(response, start_time)
        
        # Add CORS headers
        response = ResponseOptimizer.add_cors_headers(response, origin)
        
        return response
    
    @staticmethod
    def determine_cache_type(request_path: str) -> str:
        """
        Determine cache type based on request path
        
        Args:
            request_path (str): Request path
            
        Returns:
            str: Cache type
        """
        # JavaScript and CSS files from /scripts/ and /styles/ - NO CACHE in development
        if request_path.startswith('/scripts/') or request_path.startswith('/styles/') or request_path.startswith('/styles-new/'):
            return 'api'  # Return 'api' type which has no-cache headers
        
        # Static files - long cache
        if any(ext in request_path for ext in ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico']):
            return 'static'
        
        # Sensitive pages - no cache
        if any(path in request_path for path in ['/login', '/admin', '/settings']):
            return 'sensitive'
        
        # API endpoints that can be cached (read-only operations)
        if request_path.startswith('/api/'):
            # Cache-friendly API endpoints (GET requests for data that doesn't change frequently)
            cacheable_endpoints = [
                '/api/accounts',
                '/api/tickers',
                '/api/currencies',
                '/api/constraints',
                '/api/note_relation_types',
                '/api/linked-items/types',
                '/api/preferences',
                '/api/users',
                '/api/query-optimization',
                '/api/cache',
                '/api/trades',
                '/api/trade_plans',
                '/api/cash_flows',
                '/api/notes',
                '/api/executions',
                '/api/alerts',
                '/api/background-tasks',
                '/api/external-data/status',
                '/api/external-data/quotes'
            ]
            
            # Check if this is a cacheable endpoint
            for endpoint in cacheable_endpoints:
                if request_path.startswith(endpoint):
                    return 'cacheable_api'
            
            # Other API endpoints - no cache (for real-time data like alerts, executions)
            return 'api'
        
        # Default - dynamic cache
        return 'dynamic'

def optimize_response_decorator(cache_type: Optional[str] = None, origin: str = "*"):
    """
    Decorator to optimize response headers
    
    Args:
        cache_type (Optional[str]): Cache type (auto-determined if None)
        origin (str): CORS origin
        
    Returns:
        Callable: Decorated function
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Record start time
            start_time = time.time()
            
            # Call original function
            response = func(*args, **kwargs)
            
            # Determine cache type if not specified
            if cache_type is None:
                determined_cache_type = ResponseOptimizer.determine_cache_type(request.path)
            else:
                determined_cache_type = cache_type
            
            # Optimize response
            optimized_response = ResponseOptimizer.optimize_response(
                response, 
                cache_type=determined_cache_type,
                start_time=start_time,
                origin=origin
            )
            
            return optimized_response
        return wrapper
    return decorator

class ResponseMiddleware:
    """
    Middleware for automatic response optimization
    """
    
    def __init__(self, app):
        self.app = app
    
    def __call__(self, environ, start_response):
        # Record start time
        start_time = time.time()
        
        # Call the app
        def custom_start_response(status, headers, exc_info=None):
            # Create response object
            response = Response(status=status, headers=headers)
            
            # Determine cache type
            request_path = environ.get('PATH_INFO', '')
            cache_type = ResponseOptimizer.determine_cache_type(request_path)
            
            # Optimize response
            optimized_response = ResponseOptimizer.optimize_response(
                response,
                cache_type=cache_type,
                start_time=start_time
            )
            
            # Convert back to headers
            optimized_headers = list(optimized_response.headers.items())
            
            return start_response(status, optimized_headers, exc_info)
        
        return self.app(environ, custom_start_response)
