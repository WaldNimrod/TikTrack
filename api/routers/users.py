"""
User Routes - Profile Management
Task: 20.1.8
Status: COMPLETED

FastAPI routes for user profile management.
"""

from fastapi import APIRouter, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
import logging

from datetime import datetime, timezone
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..core.database import get_db
from ..services.auth import get_auth_service, TokenError, AuthenticationError
from ..schemas.identity import UserResponse, UserUpdate, PasswordChangeRequest, PasswordChangeResponse
from ..utils.dependencies import get_current_user
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..models.identity import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])
security = HTTPBearer()

# Rate limiter instance (shared with main.py app.state.limiter)
limiter = Limiter(key_func=get_remote_address)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user profile (D25).
    
    Returns user information with ULID external identifier.
    """
    return UserResponse.from_model(current_user)


@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update user profile (D25).
    
    Allows updating profile fields: first_name, last_name, display_name,
    phone_number, timezone, language.
    
    Note: Email and username cannot be changed via this endpoint.
    Phone number changes require verification via /auth/verify-phone.
    """
    try:
        # Update allowed fields
        if data.first_name is not None:
            current_user.first_name = data.first_name
        
        if data.last_name is not None:
            current_user.last_name = data.last_name
        
        if data.display_name is not None:
            current_user.display_name = data.display_name
        
        if data.timezone is not None:
            current_user.timezone = data.timezone
        
        if data.language is not None:
            current_user.language = data.language
        
        # Phone number update - if changed, reset verification status
        if data.phone_number is not None and data.phone_number != current_user.phone_number:
            current_user.phone_number = data.phone_number
            current_user.phone_verified = False
            current_user.phone_verified_at = None
        
        # Update timestamp
        current_user.updated_at = datetime.now(timezone.utc)
        
        await db.commit()
        await db.refresh(current_user)
        
        return UserResponse.from_model(current_user)
        
    except ValueError as e:
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
            error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
        )
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed",
            error_code=ErrorCodes.USER_UPDATE_FAILED
        )


@router.put("/me/password", response_model=PasswordChangeResponse)
@limiter.limit("5/15minutes")
async def change_password(
    request: Request,
    data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Change user password (Architectural Decision - Team 10 Approval).
    
    Requires authentication and verification of current password.
    Rate limited: 5 attempts per 15 minutes per user.
    
    Security Features:
    - Verifies old_password before allowing change
    - Generic error messages (no user enumeration)
    - Rate limiting to prevent brute-force attacks
    - Password hashing with bcrypt
    """
    try:
        auth_service = get_auth_service()
        
        # Security Guard: Verify old password
        if not auth_service.verify_password(data.old_password, current_user.password_hash):
            # Generic error message (no user enumeration)
            raise HTTPExceptionWithCode(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password",
                error_code=ErrorCodes.AUTH_INVALID_CREDENTIALS
            )
        
        # Hash new password
        new_password_hash = auth_service.hash_password(data.new_password)
        
        # Update user password
        current_user.password_hash = new_password_hash
        current_user.updated_at = datetime.now(timezone.utc)
        
        await db.commit()
        await db.refresh(current_user)
        
        logger.info(f"Password changed successfully for user {current_user.id}")
        
        return PasswordChangeResponse(message="Password changed successfully")
        
    except HTTPExceptionWithCode:
        # Re-raise HTTP exceptions with error codes (rate limit, validation, etc.)
        raise
    except Exception as e:
        logger.error(f"Password change error: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed",
            error_code=ErrorCodes.SERVER_ERROR
        )
