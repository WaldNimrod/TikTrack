"""
Dependencies - FastAPI Dependencies
Task: 20.1.8 (Supporting utilities)
Status: COMPLETED

Reusable FastAPI dependencies for authentication and database.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..core.database import get_db
from ..services.auth import get_auth_service, TokenError
from ..models.identity import User
from ..utils.identity import ulid_to_uuid
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.
    
    Validates access token and returns User model instance.
    
    Args:
        credentials: HTTP Bearer token credentials
        db: Database session
        
    Returns:
        User model instance
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        auth_service = get_auth_service()
        logger.debug("Validating access token...")
        payload = await auth_service.validate_access_token(
            token=credentials.credentials,
            db=db
        )
        logger.debug(f"Token validated successfully. Payload keys: {list(payload.keys())}")
        
        # Extract user ULID from sub claim
        user_ulid = payload.get("sub")
        logger.debug(f"User ULID from token: {user_ulid}")
        if not user_ulid:
            logger.warning("Token missing 'sub' claim")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user identifier"
            )
        
        # Convert ULID to UUID for database lookup
        logger.debug(f"Converting ULID to UUID: {user_ulid}")
        try:
            user_uuid = ulid_to_uuid(user_ulid)
            logger.debug(f"ULID converted to UUID: {user_uuid}")
        except Exception as e:
            logger.error(f"ULID to UUID conversion failed: {type(e).__name__}: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: invalid user identifier format"
            )
        
        # Get user from database
        logger.debug(f"Looking up user with UUID: {user_uuid}")
        stmt = select(User).where(
            User.id == user_uuid,
            User.deleted_at.is_(None)
        )
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            logger.warning(f"User not found for UUID: {user_uuid}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        logger.debug(f"User found: {user.username}, email: {user.email}, is_active: {user.is_active}")
        
        if not user.is_active:
            logger.warning(f"User account inactive: {user.username}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        logger.debug(f"Authentication successful for user: {user.username}")
        return user
        
    except TokenError as e:
        logger.warning(f"Token validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Authentication error: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )
