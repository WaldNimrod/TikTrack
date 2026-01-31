"""
Identity Schemas - Pydantic Models for Authentication & User Management
Task: 20.1.3
Status: COMPLETED

Pydantic schemas for API requests and responses.
All external IDs use ULID (converted from UUID in models).
Based on GIN-2026-008: Internal UUID v4, External ULID Strings.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr, validator
import re

from ..utils.identity import uuid_to_ulid
from ..models.enums import UserRole, ResetMethod, ApiProvider


# ULID pattern validation (26 characters, Crockford's Base32)
ULID_PATTERN = r"^[0-7][0-9A-HJKMNP-TV-Z]{25}$"


# ============================================================================
# Authentication Schemas
# ============================================================================

class LoginRequest(BaseModel):
    """Login request schema - accepts username or email."""
    username_or_email: str = Field(..., description="Username or email address")
    password: str = Field(..., min_length=1, description="User password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "username_or_email": "user@example.com",
                "password": "secure_password_123"
            }
        }


class LoginResponse(BaseModel):
    """Login response schema - returns JWT token and user info."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_at: datetime = Field(..., description="Token expiration timestamp")
    user: "UserResponse" = Field(..., description="User information")
    # Note: refresh_token is sent in httpOnly cookie, not in response body
    refresh_token: Optional[str] = Field(None, description="Refresh token (internal use - sent in cookie)")
    refresh_expires_at: Optional[datetime] = Field(None, description="Refresh token expiration (internal use)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_at": "2026-02-01T12:00:00Z",
                "user": {
                    "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                    "email": "user@example.com",
                    "phone_numbers": "+12025551234",
                    "user_tier_levels": "Bronze"
                }
            }
        }


class RegisterRequest(BaseModel):
    """User registration request schema."""
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    phone_number: Optional[str] = Field(None, description="Phone number (optional)")
    
    @validator("phone_number")
    def validate_phone(cls, v):
        """Validate phone number format (E.164)."""
        if v is None:
            return v
        if not re.match(r"^\+?[1-9]\d{1,14}$", v):
            raise ValueError("Phone number must be in E.164 format")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "email": "john@example.com",
                "password": "secure_password_123",
                "phone_number": "+12025551234"
            }
        }


class RegisterResponse(BaseModel):
    """User registration response schema."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_at: datetime = Field(..., description="Token expiration timestamp")
    user: "UserResponse" = Field(..., description="User information")
    # Note: refresh_token is sent in httpOnly cookie, not in response body
    refresh_token: Optional[str] = Field(None, description="Refresh token (internal use - sent in cookie)")
    refresh_expires_at: Optional[datetime] = Field(None, description="Refresh token expiration (internal use)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_at": "2026-02-01T12:00:00Z",
                "user": {
                    "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                    "email": "john@example.com",
                    "phone_numbers": "+12025551234",
                    "user_tier_levels": "Bronze"
                }
            }
        }


# ============================================================================
# Password Reset Schemas
# ============================================================================

class PasswordResetRequest(BaseModel):
    """Password reset initiation request schema."""
    method: ResetMethod = Field(..., description="Reset method (EMAIL or SMS)")
    email: Optional[EmailStr] = Field(None, description="Email address (if method=EMAIL)")
    phone_number: Optional[str] = Field(None, description="Phone number (if method=SMS)")
    
    @validator("email", "phone_number")
    def validate_identifier(cls, v, values):
        """Ensure either email or phone is provided based on method."""
        method = values.get("method")
        if method == ResetMethod.EMAIL and not v and "email" in values:
            raise ValueError("Email is required when method is EMAIL")
        if method == ResetMethod.SMS and not v and "phone_number" in values:
            raise ValueError("Phone number is required when method is SMS")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "method": "EMAIL",
                "email": "user@example.com"
            }
        }


class PasswordResetVerify(BaseModel):
    """Password reset verification and completion schema."""
    reset_token: str = Field(..., min_length=32, description="Reset token (from email)")
    verification_code: Optional[str] = Field(None, min_length=6, max_length=6, description="Verification code (from SMS)")
    new_password: str = Field(..., min_length=8, description="New password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "reset_token": "abc123def456...",
                "verification_code": "123456",
                "new_password": "new_secure_password_123"
            }
        }


# ============================================================================
# User Schemas
# ============================================================================

class UserResponse(BaseModel):
    """User response schema - returns user information with ULID."""
    external_ulids: str = Field(..., pattern=ULID_PATTERN, description="User ULID (external identifier)")
    email: EmailStr = Field(..., description="Email address")
    phone_numbers: Optional[str] = Field(None, description="Phone number")
    user_tier_levels: str = Field(default="Bronze", description="User tier level")
    username: Optional[str] = Field(None, description="Username")
    display_name: Optional[str] = Field(None, description="Display name")
    role: UserRole = Field(default=UserRole.USER, description="User role")
    is_email_verified: bool = Field(default=False, description="Email verification status")
    phone_verified: bool = Field(default=False, description="Phone verification status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    
    @classmethod
    def from_model(cls, user_model):
        """
        Create UserResponse from SQLAlchemy User model.
        Converts UUID to ULID automatically.
        """
        return cls(
            external_ulids=uuid_to_ulid(user_model.id),
            email=user_model.email,
            phone_numbers=user_model.phone_number,
            user_tier_levels="Bronze",  # TODO: Implement tier logic
            username=user_model.username,
            display_name=user_model.display_name,
            role=user_model.role,
            is_email_verified=user_model.is_email_verified,
            phone_verified=user_model.phone_verified,
            created_at=user_model.created_at
        )
    
    class Config:
        json_schema_extra = {
            "example": {
                "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                "email": "user@example.com",
                "phone_numbers": "+12025551234",
                "user_tier_levels": "Bronze",
                "username": "johndoe",
                "display_name": "John Doe",
                "role": "USER",
                "is_email_verified": True,
                "phone_verified": False,
                "created_at": "2026-01-31T12:00:00Z"
            }
        }


class UserUpdate(BaseModel):
    """User profile update request schema."""
    first_name: Optional[str] = Field(None, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name")
    display_name: Optional[str] = Field(None, max_length=100, description="Display name")
    phone_number: Optional[str] = Field(None, description="Phone number (E.164 format)")
    timezone: Optional[str] = Field(None, max_length=50, description="Timezone (e.g., 'America/New_York')")
    language: Optional[str] = Field(None, max_length=5, description="Language code (e.g., 'en', 'he')")
    
    @validator("phone_number")
    def validate_phone(cls, v):
        """Validate phone number format (E.164)."""
        if v and not re.match(r'^\+?[1-9]\d{1,14}$', v):
            raise ValueError("Phone number must be in E.164 format (e.g., +1234567890)")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "display_name": "Johnny",
                "phone_number": "+1234567890",
                "timezone": "America/New_York",
                "language": "en"
            }
        }


class PasswordChangeRequest(BaseModel):
    """Password change request schema for authenticated users."""
    old_password: str = Field(..., min_length=1, description="Current password")
    new_password: str = Field(..., min_length=8, description="New password (min 8 characters)")
    
    @validator("new_password")
    def validate_new_password(cls, v, values):
        """Ensure new password is different from old password."""
        if "old_password" in values and v == values["old_password"]:
            raise ValueError("New password must be different from current password")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "old_password": "current_password_123",
                "new_password": "new_secure_password_456"
            }
        }


class PasswordChangeResponse(BaseModel):
    """Password change response schema."""
    message: str = Field(..., description="Success message")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Password changed successfully"
            }
        }


# ============================================================================
# API Keys Schemas
# ============================================================================

class UserApiKeyCreate(BaseModel):
    """API key creation request schema."""
    provider: ApiProvider = Field(..., description="API provider")
    provider_label: Optional[str] = Field(None, max_length=100, description="Custom label for this key")
    api_key: str = Field(..., min_length=1, description="API key (will be encrypted)")
    api_secret: Optional[str] = Field(None, description="API secret (will be encrypted)")
    additional_config: Optional[dict] = Field(default_factory=dict, description="Additional configuration (JSON)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "provider": "POLYGON",
                "provider_label": "Production Key",
                "api_key": "your_api_key_here",
                "api_secret": "your_api_secret_here",
                "additional_config": {}
            }
        }


class UserApiKeyResponse(BaseModel):
    """API key response schema - returns masked key information."""
    external_ulids: str = Field(..., pattern=ULID_PATTERN, description="API key ULID (external identifier)")
    provider: ApiProvider = Field(..., description="API provider")
    provider_label: Optional[str] = Field(None, description="Custom label")
    masked_key: str = Field(..., description="Masked API key (********************)")
    is_active: bool = Field(..., description="Active status")
    is_verified: bool = Field(..., description="Verification status")
    last_verified_at: Optional[datetime] = Field(None, description="Last verification timestamp")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    @classmethod
    def from_model(cls, api_key_model):
        """
        Create UserApiKeyResponse from SQLAlchemy UserApiKey model.
        Converts UUID to ULID and masks the API key.
        
        Masking Policy: Always return masked key (********************) as per D24 blueprint.
        """
        # Always return masked key (per D24 masking policy)
        masked = "********************"
        
        return cls(
            external_ulids=uuid_to_ulid(api_key_model.id),
            provider=api_key_model.provider,
            provider_label=api_key_model.provider_label,
            masked_key=masked,
            is_active=api_key_model.is_active,
            is_verified=api_key_model.is_verified,
            last_verified_at=api_key_model.last_verified_at,
            created_at=api_key_model.created_at
        )
    
    class Config:
        json_schema_extra = {
            "example": {
                "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                "provider": "POLYGON",
                "provider_label": "Production Key",
                "masked_key": "********************",
                "is_active": True,
                "is_verified": True,
                "last_verified_at": "2026-01-31T12:00:00Z",
                "created_at": "2026-01-31T10:00:00Z"
            }
        }


# ============================================================================
# JWT Token Schema
# ============================================================================

class JWTToken(BaseModel):
    """JWT token response schema."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_at: datetime = Field(..., description="Token expiration timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_at": "2026-02-01T12:00:00Z"
            }
        }


class RefreshResponse(BaseModel):
    """Refresh token response schema - returns new access token."""
    access_token: str = Field(..., description="New JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_at: datetime = Field(..., description="Token expiration timestamp")
    # Note: refresh_token is sent in httpOnly cookie, not in response body
    refresh_token: Optional[str] = Field(None, description="New refresh token (internal use - sent in cookie)")
    refresh_expires_at: Optional[datetime] = Field(None, description="Refresh token expiration (internal use)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_at": "2026-02-01T12:00:00Z"
            }
        }


# Update forward references
LoginResponse.model_rebuild()
RegisterResponse.model_rebuild()
