"""
User Routes - Profile Management
Task: 20.1.8
Status: COMPLETED

FastAPI routes for user profile management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
import logging

from datetime import datetime
from ..core.database import get_db
from ..services.auth import get_auth_service, TokenError
from ..schemas.identity import UserResponse, UserUpdate
from ..utils.dependencies import get_current_user
from ..models.identity import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])
security = HTTPBearer()


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
        current_user.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(current_user)
        
        return UserResponse.from_model(current_user)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )
