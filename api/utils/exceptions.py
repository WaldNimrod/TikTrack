"""
Exception Utilities - Error Code Support
Task: VALIDATION_ERROR_CODE_UPDATE
Status: COMPLETED

Custom exception classes and utilities for error code support.
Based on ARCHITECT_DIRECTIVE_VALIDATION_HYBRID.md (v1.2)
"""

from fastapi import HTTPException
from typing import Optional


class HTTPExceptionWithCode(HTTPException):
    """
    HTTPException with mandatory error_code support.
    
    All API errors must include an error_code for consistent error handling.
    
    Usage:
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            error_code=ErrorCodes.AUTH_INVALID_CREDENTIALS
        )
    """
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: str,
        headers: Optional[dict] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code


# Error Code Constants
class ErrorCodes:
    """Standard error codes for the API."""
    
    # Authentication Errors
    AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS"
    AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED"
    AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED"
    AUTH_RATE_LIMIT_EXCEEDED = "AUTH_RATE_LIMIT_EXCEEDED"
    AUTH_TOKEN_INVALID = "AUTH_TOKEN_INVALID"
    AUTH_TOKEN_MISSING = "AUTH_TOKEN_MISSING"
    AUTH_REFRESH_TOKEN_INVALID = "AUTH_REFRESH_TOKEN_INVALID"
    AUTH_REFRESH_TOKEN_MISSING = "AUTH_REFRESH_TOKEN_MISSING"
    
    # Validation Errors
    VALIDATION_FIELD_REQUIRED = "VALIDATION_FIELD_REQUIRED"
    VALIDATION_INVALID_EMAIL = "VALIDATION_INVALID_EMAIL"
    VALIDATION_INVALID_PHONE = "VALIDATION_INVALID_PHONE"
    VALIDATION_INVALID_FORMAT = "VALIDATION_INVALID_FORMAT"
    VALIDATION_INVALID_PASSWORD = "VALIDATION_INVALID_PASSWORD"
    
    # User Errors
    USER_NOT_FOUND = "USER_NOT_FOUND"
    USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS"
    USER_UPDATE_FAILED = "USER_UPDATE_FAILED"
    USER_INACTIVE = "USER_INACTIVE"
    USER_LOCKED = "USER_LOCKED"
    USER_EMAIL_NOT_VERIFIED = "USER_EMAIL_NOT_VERIFIED"
    USER_PHONE_NOT_VERIFIED = "USER_PHONE_NOT_VERIFIED"
    
    # Password Reset Errors
    PASSWORD_RESET_INVALID_TOKEN = "PASSWORD_RESET_INVALID_TOKEN"
    PASSWORD_RESET_TOKEN_EXPIRED = "PASSWORD_RESET_TOKEN_EXPIRED"
    PASSWORD_RESET_INVALID_CODE = "PASSWORD_RESET_INVALID_CODE"
    PASSWORD_RESET_CODE_EXPIRED = "PASSWORD_RESET_CODE_EXPIRED"
    PASSWORD_RESET_MAX_ATTEMPTS = "PASSWORD_RESET_MAX_ATTEMPTS"
    PASSWORD_RESET_NO_PHONE = "PASSWORD_RESET_NO_PHONE"
    
    # API Key Errors
    API_KEY_NOT_FOUND = "API_KEY_NOT_FOUND"
    API_KEY_CREATE_FAILED = "API_KEY_CREATE_FAILED"
    API_KEY_UPDATE_FAILED = "API_KEY_UPDATE_FAILED"
    API_KEY_DELETE_FAILED = "API_KEY_DELETE_FAILED"
    API_KEY_VERIFY_FAILED = "API_KEY_VERIFY_FAILED"
    
    # Generic Errors
    SERVER_ERROR = "SERVER_ERROR"
    NETWORK_ERROR = "NETWORK_ERROR"
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
