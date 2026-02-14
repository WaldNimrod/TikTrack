"""
Dependencies - FastAPI Dependencies
Task: 20.1.8 (Supporting utilities)
Status: COMPLETED

Reusable FastAPI dependencies for authentication and database.
"""

from fastapi import Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..core.database import get_db
from ..services.auth import get_auth_service, TokenError
from ..models.identity import User
from ..models.enums import UserRole
from ..utils.identity import ulid_to_uuid
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
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
            raise HTTPExceptionWithCode(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user identifier",
                error_code=ErrorCodes.AUTH_TOKEN_INVALID
            )
        
        # Convert ULID to UUID for database lookup
        logger.debug(f"Converting ULID to UUID: {user_ulid}")
        try:
            user_uuid = ulid_to_uuid(user_ulid)
            logger.debug(f"ULID converted to UUID: {user_uuid}")
        except Exception as e:
            logger.error(f"ULID to UUID conversion failed: {type(e).__name__}: {str(e)}", exc_info=True)
            raise HTTPExceptionWithCode(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: invalid user identifier format",
                error_code=ErrorCodes.AUTH_TOKEN_INVALID
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
            raise HTTPExceptionWithCode(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                error_code=ErrorCodes.USER_NOT_FOUND
            )
        
        logger.debug(f"User found: {user.username}, email: {user.email}, is_active: {user.is_active}")
        
        if not user.is_active:
            logger.warning(f"User account inactive: {user.username}")
            raise HTTPExceptionWithCode(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
                error_code=ErrorCodes.USER_INACTIVE
            )
        
        logger.debug(f"Authentication successful for user: {user.username}")
        return user
        
    except TokenError as e:
        logger.warning(f"Token validation error: {str(e)}")
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            error_code=ErrorCodes.AUTH_TOKEN_INVALID
        )
    except HTTPExceptionWithCode:
        # Re-raise HTTP exceptions with error codes as-is
        raise
    except Exception as e:
        logger.error(f"Authentication error: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed",
            error_code=ErrorCodes.SERVER_ERROR
        )


async def require_admin_role(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency that requires ADMIN or SUPERADMIN role.
    Per ADMIN_ROLE_MAPPING, ADR-013 — Type D (Admin-only) routes.

    Returns:
        User instance if admin.

    Raises:
        HTTPExceptionWithCode: 403 Forbidden + ACCESS_DENIED if not admin
    """
    if current_user.role not in (UserRole.ADMIN, UserRole.SUPERADMIN):
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
            error_code=ErrorCodes.ACCESS_DENIED,
        )
    return current_user
