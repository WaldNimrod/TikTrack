"""
Error Handling Utilities - TikTrack

This module provides advanced error handling functionality for the TikTrack system.
Includes custom error handlers, validation error handling, and error logging.

Features:
- Custom error handlers for different error types
- Validation error handling
- Database error handling
- Error logging and monitoring
- User-friendly error messages

Author: TikTrack Development Team
Version: 1.0
Date: September 2025
"""

from flask import jsonify, request
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, OperationalError
from werkzeug.exceptions import HTTPException, BadRequest, NotFound, InternalServerError
from typing import Dict, Any, Optional, Tuple
import logging
import traceback
from datetime import datetime
from utils.performance_monitor import monitor_performance

logger = logging.getLogger(__name__)

class TikTrackError(Exception):
    """Base exception class for TikTrack errors"""
    
    def __init__(self, message: str, error_code: str = "GENERAL_ERROR", status_code: int = 500):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        super().__init__(self.message)

class ValidationError(TikTrackError):
    """Exception for validation errors"""
    
    def __init__(self, message: str, field: Optional[str] = None, value: Optional[Any] = None):
        self.field = field
        self.value = value
        super().__init__(message, "VALIDATION_ERROR", 400)

class DatabaseError(TikTrackError):
    """Exception for database errors"""
    
    def __init__(self, message: str, original_error: Optional[Exception] = None):
        self.original_error = original_error
        super().__init__(message, "DATABASE_ERROR", 500)

class NotFoundError(TikTrackError):
    """Exception for not found errors"""
    
    def __init__(self, message: str, resource_type: Optional[str] = None, resource_id: Optional[str] = None):
        self.resource_type = resource_type
        self.resource_id = resource_id
        super().__init__(message, "NOT_FOUND", 404)

class AuthenticationError(TikTrackError):
    """Exception for authentication errors"""
    
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, "AUTHENTICATION_ERROR", 401)

class AuthorizationError(TikTrackError):
    """Exception for authorization errors"""
    
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, "AUTHORIZATION_ERROR", 403)

def log_error(error: Exception, context: Optional[Dict[str, Any]] = None) -> None:
    """
    Log error with context information
    
    Args:
        error (Exception): The error to log
        context (Optional[Dict[str, Any]]): Additional context information
    """
    error_info = {
        'timestamp': datetime.now().isoformat(),
        'error_type': type(error).__name__,
        'error_message': str(error),
        'request_method': request.method if request else None,
        'request_url': request.url if request else None,
        'user_agent': request.headers.get('User-Agent') if request else None,
        'ip_address': request.remote_addr if request else None,
        'context': context or {}
    }
    
    # Add traceback for debugging
    if hasattr(error, '__traceback__') and error.__traceback__:
        error_info['traceback'] = traceback.format_exc()
    
    logger.error(f"Error occurred: {error_info}")
    
    # Log to error-specific log file
    error_logger = logging.getLogger('error_handler')
    error_logger.error(f"Detailed error: {error_info}")

@monitor_performance("handle_database_error")
def handle_database_error(error: SQLAlchemyError) -> Tuple[Dict[str, Any], int]:
    """
    Handle database-related errors
    
    Args:
        error (SQLAlchemyError): Database error
        
    Returns:
        Tuple[Dict[str, Any], int]: Error response and status code
    """
    log_error(error, {'error_category': 'database'})
    
    if isinstance(error, IntegrityError):
        return jsonify({
            'status': 'error',
            'error_code': 'INTEGRITY_ERROR',
            'message': 'Data integrity constraint violated',
            'details': 'The operation would violate a database constraint',
            'timestamp': datetime.now().isoformat()
        }), 400
    
    elif isinstance(error, OperationalError):
        return jsonify({
            'status': 'error',
            'error_code': 'OPERATIONAL_ERROR',
            'message': 'Database operation failed',
            'details': 'The database operation could not be completed',
            'timestamp': datetime.now().isoformat()
        }), 500
    
    else:
        return jsonify({
            'status': 'error',
            'error_code': 'DATABASE_ERROR',
            'message': 'Database error occurred',
            'details': 'An unexpected database error occurred',
            'timestamp': datetime.now().isoformat()
        }), 500

@monitor_performance("handle_validation_error")
def handle_validation_error(error: ValidationError) -> Tuple[Dict[str, Any], int]:
    """
    Handle validation errors
    
    Args:
        error (ValidationError): Validation error
        
    Returns:
        Tuple[Dict[str, Any], int]: Error response and status code
    """
    log_error(error, {
        'error_category': 'validation',
        'field': error.field,
        'value': error.value
    })
    
    response = {
        'status': 'error',
        'error_code': 'VALIDATION_ERROR',
        'message': error.message,
        'timestamp': datetime.now().isoformat()
    }
    
    if error.field:
        response['field'] = error.field
    if error.value is not None:
        response['value'] = error.value
    
    return jsonify(response), 400

@monitor_performance("handle_not_found_error")
def handle_not_found_error(error: NotFoundError) -> Tuple[Dict[str, Any], int]:
    """
    Handle not found errors
    
    Args:
        error (NotFoundError): Not found error
        
    Returns:
        Tuple[Dict[str, Any], int]: Error response and status code
    """
    log_error(error, {
        'error_category': 'not_found',
        'resource_type': error.resource_type,
        'resource_id': error.resource_id
    })
    
    response = {
        'status': 'error',
        'error_code': 'NOT_FOUND',
        'message': error.message,
        'timestamp': datetime.now().isoformat()
    }
    
    if error.resource_type:
        response['resource_type'] = error.resource_type
    if error.resource_id:
        response['resource_id'] = error.resource_id
    
    return jsonify(response), 404

@monitor_performance("handle_authentication_error")
def handle_authentication_error(error: AuthenticationError) -> Tuple[Dict[str, Any], int]:
    """
    Handle authentication errors
    
    Args:
        error (AuthenticationError): Authentication error
        
    Returns:
        Tuple[Dict[str, Any], int]: Error response and status code
    """
    log_error(error, {'error_category': 'authentication'})
    
    return jsonify({
        'status': 'error',
        'error_code': 'AUTHENTICATION_ERROR',
        'message': error.message,
        'details': 'Authentication is required to access this resource',
        'timestamp': datetime.now().isoformat()
    }), 401

@monitor_performance("handle_authorization_error")
def handle_authorization_error(error: AuthorizationError) -> Tuple[Dict[str, Any], int]:
    """
    Handle authorization errors
    
    Args:
        error (AuthorizationError): Authorization error
        
    Returns:
        Tuple[Dict[str, Any], int]: Error response and status code
    """
    log_error(error, {'error_category': 'authorization'})
    
    return jsonify({
        'status': 'error',
        'error_code': 'AUTHORIZATION_ERROR',
        'message': error.message,
        'details': 'You do not have permission to perform this action',
        'timestamp': datetime.now().isoformat()
    }), 403

@monitor_performance("handle_general_error")
def handle_general_error(error: Exception) -> Tuple[Dict[str, Any], int]:
    """
    Handle general errors
    
    Args:
        error (Exception): General error
        
    Returns:
        Tuple[Dict[str, Any], int]: Error response and status code
    """
    log_error(error, {'error_category': 'general'})
    
    return jsonify({
        'status': 'error',
        'error_code': 'INTERNAL_ERROR',
        'message': 'An internal error occurred',
        'details': 'The server encountered an unexpected error',
        'timestamp': datetime.now().isoformat()
    }), 500

def handle_http_error(error: HTTPException) -> Tuple[Dict[str, Any], int]:
    """
    Handle HTTP errors
    
    Args:
        error (HTTPException): HTTP error
        
    Returns:
        Tuple[Dict[str, Any], int]: Error response and status code
    """
    log_error(error, {'error_category': 'http'})
    
    return jsonify({
        'status': 'error',
        'error_code': f'HTTP_{error.code}',
        'message': error.description or error.name,
        'timestamp': datetime.now().isoformat()
    }), error.code

class ErrorHandler:
    """
    Centralized error handler for TikTrack application
    """
    
    @staticmethod
    def register_error_handlers(app):
        """
        Register all error handlers with Flask app
        
        Args:
            app: Flask application instance
        """
        # Register custom error handlers
        app.register_error_handler(ValidationError, lambda e: handle_validation_error(e))
        app.register_error_handler(DatabaseError, lambda e: handle_database_error(e))
        app.register_error_handler(NotFoundError, lambda e: handle_not_found_error(e))
        app.register_error_handler(AuthenticationError, lambda e: handle_authentication_error(e))
        app.register_error_handler(AuthorizationError, lambda e: handle_authorization_error(e))
        
        # Register SQLAlchemy error handlers
        app.register_error_handler(IntegrityError, lambda e: handle_database_error(e))
        app.register_error_handler(OperationalError, lambda e: handle_database_error(e))
        app.register_error_handler(SQLAlchemyError, lambda e: handle_database_error(e))
        
        # Register HTTP error handlers
        app.register_error_handler(BadRequest, lambda e: handle_http_error(e))
        app.register_error_handler(NotFound, lambda e: handle_http_error(e))
        app.register_error_handler(InternalServerError, lambda e: handle_http_error(e))
        
        # Register general error handler
        app.register_error_handler(Exception, lambda e: handle_general_error(e))
    
    @staticmethod
    def create_error_response(message: str, error_code: str, status_code: int = 500, 
                            details: Optional[str] = None, **kwargs) -> Tuple[Dict[str, Any], int]:
        """
        Create standardized error response
        
        Args:
            message (str): Error message
            error_code (str): Error code
            status_code (int): HTTP status code
            details (Optional[str]): Additional details
            **kwargs: Additional fields to include
            
        Returns:
            Tuple[Dict[str, Any], int]: Error response and status code
        """
        response = {
            'status': 'error',
            'error_code': error_code,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        
        if details:
            response['details'] = details
        
        response.update(kwargs)
        
        return jsonify(response), status_code

def safe_execute(func, *args, **kwargs):
    """
    Safely execute a function with error handling
    
    Args:
        func: Function to execute
        *args: Function arguments
        **kwargs: Function keyword arguments
        
    Returns:
        Tuple[Any, Optional[Exception]]: Function result and error (if any)
    """
    try:
        result = func(*args, **kwargs)
        return result, None
    except Exception as e:
        log_error(e, {
            'error_category': 'safe_execute',
            'function_name': func.__name__,
            'args': args,
            'kwargs': kwargs
        })
        return None, e
