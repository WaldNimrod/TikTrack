"""
Base Entity Decorators - TikTrack
=================================

Decorators for API modules providing common functionality like
caching, rate limiting, validation, and database session management.

Features:
- API endpoint decorators
- Request validation
- Database session management
- Cache management
- Rate limiting
- Performance monitoring

Author: TikTrack Development Team
Version: 1.0
Date: September 23, 2025
"""

from functools import wraps
from typing import Dict, List, Any, Optional, Callable
from flask import request, jsonify, g
from sqlalchemy.orm import Session
from config.database import get_db
from services.advanced_cache_service import cache_for, cache_with_deps, invalidate_cache
from utils.rate_limiter import rate_limit_api
import logging
import time
from datetime import datetime


def api_endpoint(cache_ttl: int = 60, dependencies: List[str] = None, 
                rate_limit: int = 60, validate_request: bool = True):
    """
    Decorator for API endpoints with caching, rate limiting, and validation
    
    Args:
        cache_ttl: Cache time-to-live in seconds
        dependencies: List of cache dependencies
        rate_limit: Rate limit in requests per minute
        validate_request: Whether to validate request data
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Apply rate limiting
            if rate_limit > 0:
                @rate_limit_api(requests_per_minute=rate_limit)
                def rate_limited_func():
                    return func(*args, **kwargs)
                return rate_limited_func()
            
            # Apply caching
            if cache_ttl > 0:
                # Generate cache key based on function and request
                import hashlib
                func_name = f"{func.__module__}.{func.__name__}"
                request_data = str(request.args) + str(request.get_json() or {})
                cache_key = f"{func_name}:{hashlib.md5(request_data.encode()).hexdigest()}"
                
                # Check cache first
                from services.advanced_cache_service import advanced_cache_service
                cached_result = advanced_cache_service.get(cache_key)
                if cached_result is not None:
                    return cached_result
                
                # Cache miss - execute function and cache result
                result = func(*args, **kwargs)
                advanced_cache_service.set(cache_key, result, ttl=cache_ttl, dependencies=dependencies)
                return result
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


def validate_request(required_fields: List[str] = None, optional_fields: List[str] = None,
                    field_types: Dict[str, type] = None, max_lengths: Dict[str, int] = None):
    """
    Decorator for request validation
    
    Args:
        required_fields: List of required field names
        optional_fields: List of optional field names
        field_types: Dictionary mapping field names to expected types
        max_lengths: Dictionary mapping field names to maximum lengths
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            from .base_entity_utils import BaseEntityUtils
            
            # Get request data
            if request.method in ['POST', 'PUT', 'PATCH']:
                data = request.get_json() or {}
            else:
                data = request.args.to_dict()
            
            # Validate required fields
            if required_fields:
                is_valid, missing_fields = BaseEntityUtils.validate_required_fields(data, required_fields)
                if not is_valid:
                    return jsonify({
                        "status": "error",
                        "error": {"message": f"Missing required fields: {', '.join(missing_fields)}"},
                        "timestamp": datetime.now().isoformat()
                    }), 400
            
            # Validate field types
            if field_types:
                is_valid, invalid_fields = BaseEntityUtils.validate_field_types(data, field_types)
                if not is_valid:
                    return jsonify({
                        "status": "error",
                        "error": {"message": f"Invalid field types: {', '.join(invalid_fields)}"},
                        "timestamp": datetime.now().isoformat()
                    }), 400
            
            # Validate string lengths
            if max_lengths:
                is_valid, invalid_fields = BaseEntityUtils.validate_string_lengths(data, max_lengths)
                if not is_valid:
                    return jsonify({
                        "status": "error",
                        "error": {"message": f"Field length violations: {', '.join(invalid_fields)}"},
                        "timestamp": datetime.now().isoformat()
                    }), 400
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


def handle_database_session(auto_commit: bool = True, auto_close: bool = True):
    """
    Decorator for database session management
    
    Args:
        auto_commit: Whether to automatically commit transactions
        auto_close: Whether to automatically close the session
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            logging.info(f"🔵 HANDLE_DB_SESSION: Wrapping {func.__name__}, auto_commit={auto_commit}")
            db: Session = None
            try:
                # Get database session
                db = next(get_db())
                g.db = db  # Store in Flask g for access in function
                logging.info(f"✅ HANDLE_DB_SESSION: Got database session")
                
                # Ensure transaction is in clean state (rollback if aborted)
                try:
                    # Check if transaction is in aborted state by attempting a simple query
                    from sqlalchemy import text
                    db.execute(text("SELECT 1"))
                except Exception as tx_check_error:
                    # Transaction is aborted, rollback to start fresh
                    logging.warning(f"⚠️ HANDLE_DB_SESSION: Transaction aborted detected, rolling back: {str(tx_check_error)}")
                    try:
                        db.rollback()
                        logging.info(f"✅ HANDLE_DB_SESSION: Rollback successful, starting fresh transaction")
                    except Exception as rollback_error:
                        logging.error(f"❌ HANDLE_DB_SESSION: Rollback failed: {str(rollback_error)}")
                
                # Call the function
                logging.info(f"🟢 HANDLE_DB_SESSION: Calling {func.__name__}")
                result = func(*args, **kwargs)
                logging.info(f"🟢 HANDLE_DB_SESSION: {func.__name__} completed")
                
                # Auto commit if enabled
                # NOTE: If function already committed, this is a no-op
                if auto_commit and db:
                    logging.info(f"🔵 COMMIT: About to commit database transaction")
                    db.commit()
                    logging.info(f"✅ COMMIT: Database transaction committed successfully")
                else:
                    logging.info(f"⏭️ COMMIT: Auto-commit disabled, skipping")
                
                return result
                
            except Exception as e:
                # Rollback on error
                import traceback
                error_trace = traceback.format_exc()
                logging.error(f"❌ HANDLE_DB_SESSION: Error in {func.__name__}: {str(e)}\nTraceback:\n{error_trace}")
                if db:
                    try:
                        db.rollback()
                    except Exception as rollback_error:
                        logging.error(f"❌ HANDLE_DB_SESSION: Error during rollback: {str(rollback_error)}")
                raise e
            finally:
                # Auto close if enabled
                if auto_close and db:
                    db.close()
        return wrapper
    return decorator


def cache_with_invalidation(cache_key: str = None, invalidate_on: List[str] = None):
    """
    Decorator for cache with automatic invalidation
    
    Args:
        cache_key: Custom cache key (optional)
        invalidate_on: List of operations that should invalidate this cache
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key if not provided
            if not cache_key:
                func_name = func.__name__
                request_hash = hash(str(request.args) + str(request.get_json() or {}))
                key = f"{func_name}_{request_hash}"
            else:
                key = cache_key
            
            # Check cache first
            from services.advanced_cache_service import get_cache_entry
            cached_result = get_cache_entry(key)
            if cached_result:
                return cached_result
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Cache result
            from services.advanced_cache_service import set_cache_entry
            set_cache_entry(key, result, ttl=300)  # Default 5 minutes
            
            return result
        return wrapper
    return decorator


def rate_limit_endpoint(requests_per_minute: int = 60, burst_limit: int = 10):
    """
    Decorator for rate limiting endpoints
    
    Args:
        requests_per_minute: Maximum requests per minute
        burst_limit: Maximum burst requests
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            return rate_limit_api(requests_per_minute=requests_per_minute)(func)(*args, **kwargs)
        return wrapper
    return decorator


def monitor_performance(log_slow_queries: bool = True, slow_query_threshold: float = 1.0):
    """
    Decorator for performance monitoring
    
    Args:
        log_slow_queries: Whether to log slow queries
        slow_query_threshold: Threshold in seconds for slow queries
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            logger = logging.getLogger(f"{func.__module__}.{func.__name__}")
            
            try:
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time
                
                # Log slow queries
                if log_slow_queries and execution_time > slow_query_threshold:
                    logger.warning(f"Slow query detected: {func.__name__} took {execution_time:.2f}s")
                
                # Add performance headers
                if hasattr(result, 'headers'):
                    result.headers['X-Execution-Time'] = f"{execution_time:.3f}s"
                
                return result
                
            except Exception as e:
                execution_time = time.time() - start_time
                logger.error(f"Error in {func.__name__} after {execution_time:.2f}s: {str(e)}")
                raise e
        return wrapper
    return decorator


def require_authentication(roles: List[str] = None):
    """
    Decorator for authentication and authorization.
    Currently uses a default user fallback when no authenticated user
    is attached to the request context.
    
    Args:
        roles: List of required roles (optional)
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 1) Primary source: middleware / real authentication layer
            user_id = getattr(g, 'user_id', None)

            # 2) Fallback: explicit user_id passed in request (query/body)
            #    This keeps the system working in single-user mode and in
            #    automated tools, while still allowing a future real auth
            #    layer to override it by setting g.user_id.
            if user_id is None:
                try:
                    candidate = None
                    if request.method in ('GET', 'DELETE'):
                        candidate = request.args.get('user_id', type=int)
                    else:
                        payload = request.get_json(silent=True) or {}
                        candidate = payload.get('user_id')
                        try:
                            candidate = int(candidate) if candidate is not None else None
                        except (TypeError, ValueError):
                            candidate = None
                    if candidate is not None:
                        g.user_id = candidate
                        user_id = candidate
                except Exception as e:
                    logging.getLogger(__name__).warning(
                        "Auth fallback failed to resolve user_id from request: %s", e
                    )

            # If we still have no user_id, enforce authentication error
            if not user_id:
                return jsonify({
                    "status": "error",
                    "error": {"message": "Authentication required"},
                    "timestamp": datetime.now().isoformat()
                }), 401
            
            # Check roles if specified
            if roles:
                user_roles = getattr(g, 'user_roles', [])
                if not any(role in user_roles for role in roles):
                    return jsonify({
                        "status": "error",
                        "error": {"message": "Insufficient permissions"},
                        "timestamp": datetime.now().isoformat()
                    }), 403
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


def log_api_calls(log_request_data: bool = False, log_response_data: bool = False):
    """
    Decorator for API call logging
    
    Args:
        log_request_data: Whether to log request data
        log_response_data: Whether to log response data
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            logger = logging.getLogger(f"api_calls.{func.__name__}")
            
            # Log request
            log_data = {
                "method": request.method,
                "endpoint": request.endpoint,
                "remote_addr": request.remote_addr,
                "user_agent": request.headers.get('User-Agent', ''),
                "timestamp": datetime.now().isoformat()
            }
            
            if log_request_data:
                if request.method in ['POST', 'PUT', 'PATCH']:
                    log_data["request_data"] = request.get_json()
                else:
                    log_data["request_args"] = request.args.to_dict()
            
            logger.info(f"API Call: {request.method} {request.endpoint}", extra=log_data)
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Log response
            if log_response_data and hasattr(result, 'get_json'):
                try:
                    response_data = result.get_json()
                    logger.info(f"API Response: {func.__name__}", extra={
                        "response_data": response_data,
                        "timestamp": datetime.now().isoformat()
                    })
                except:
                    pass
            
            return result
        return wrapper
    return decorator


def handle_errors(return_errors: bool = True, log_errors: bool = True):
    """
    Decorator for error handling
    
    Args:
        return_errors: Whether to return error responses
        log_errors: Whether to log errors
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger = logging.getLogger(f"{func.__module__}.{func.__name__}")
                
                if log_errors:
                    logger.error(f"Error in {func.__name__}: {str(e)}", exc_info=True)
                
                if return_errors:
                    return jsonify({
                        "status": "error",
                        "error": {"message": str(e)},
                        "timestamp": datetime.now().isoformat()
                    }), 500
                else:
                    raise e
        return wrapper
    return decorator


def paginate_response(default_per_page: int = 20, max_per_page: int = 100):
    """
    Decorator for automatic response pagination
    
    Args:
        default_per_page: Default items per page
        max_per_page: Maximum items per page
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Get pagination parameters
            page = int(request.args.get('page', 1))
            per_page = int(request.args.get('per_page', default_per_page))
            
            # Validate pagination parameters
            if page < 1:
                page = 1
            if per_page < 1:
                per_page = default_per_page
            if per_page > max_per_page:
                per_page = max_per_page
            
            # Add pagination to kwargs
            kwargs['page'] = page
            kwargs['per_page'] = per_page
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


def cache_by_user(cache_ttl: int = 300):
    """
    Decorator for user-specific caching
    
    Args:
        cache_ttl: Cache time-to-live in seconds
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            user_id = getattr(g, 'user_id', 'anonymous')
            cache_key = f"{func.__name__}_user_{user_id}"
            
            # Check cache
            from services.advanced_cache_service import get_cache_entry
            cached_result = get_cache_entry(cache_key)
            if cached_result:
                return cached_result
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Cache result
            from services.advanced_cache_service import set_cache_entry
            set_cache_entry(cache_key, result, ttl=cache_ttl)
            
            return result
        return wrapper
    return decorator
