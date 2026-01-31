"""
Authentication Routes - Login, Register, Refresh, Logout
Task: 20.1.8
Status: COMPLETED

FastAPI routes for authentication and token management.
Implements refresh token rotation with httpOnly cookies.
Based on GIN-2026-008 + Architectural Answer (Appendix A).
"""

from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_
import logging
import os

from ..core.config import settings
from ..core.database import get_db
from ..services.auth import get_auth_service, AuthenticationError, TokenError
from ..services.password_reset import get_password_reset_service, PasswordResetError
from ..schemas.identity import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    RefreshResponse,
    PasswordResetRequest as PasswordResetRequestSchema,
    PasswordResetVerify
)
from ..models.enums import ResetMethod
from ..models.identity import User, PasswordResetRequest
from ..utils.identity import uuid_to_ulid
from ..utils.dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()


def set_refresh_token_cookie(
    response: Response,
    refresh_token: str,
    expires_at: datetime
) -> None:
    """
    Set refresh token in httpOnly cookie.
    
    Args:
        response: FastAPI Response object
        refresh_token: Refresh token string
        expires_at: Token expiration datetime
    """
    # Calculate max_age in seconds
    max_age = int((expires_at - datetime.utcnow()).total_seconds())
    
    # Use "strict" in production for better CSRF protection
    # "lax" is acceptable for development and allows redirects
    samesite_setting = os.getenv("COOKIE_SAMESITE", "lax").lower()
    if samesite_setting not in ["strict", "lax", "none"]:
        samesite_setting = "lax"
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=max_age,
        httponly=True,
        secure=os.getenv("COOKIE_SECURE", "true").lower() == "true",  # HTTPS only in production
        samesite=samesite_setting,
        path="/api/v1/auth"
    )


def clear_refresh_token_cookie(response: Response) -> None:
    """Clear refresh token cookie."""
    response.delete_cookie(
        key="refresh_token",
        path="/api/v1/auth",
        httponly=True,
        samesite="lax"
    )


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Register new user.
    
    Creates new user account and returns access token + refresh token (in cookie).
    """
    try:
        auth_service = get_auth_service()
        register_response = await auth_service.register(
            username=request.username,
            email=request.email,
            password=request.password,
            phone_number=request.phone_number,
            db=db
        )
        
        # Set refresh token in httpOnly cookie
        if register_response.refresh_token and register_response.refresh_expires_at:
            set_refresh_token_cookie(
                response,
                register_response.refresh_token,
                register_response.refresh_expires_at
            )
        
        # Remove refresh_token from response body (security - sent in cookie only)
        register_response.refresh_token = None
        register_response.refresh_expires_at = None
        
        return register_response
        
    except AuthenticationError as e:
        # Generic error message to prevent information leakage
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. Please check your input."
        )
    except Exception as e:
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user and return tokens.
    
    Returns access token in response body and refresh token in httpOnly cookie.
    """
    try:
        auth_service = get_auth_service()
        login_response = await auth_service.login(
            username_or_email=request.username_or_email,
            password=request.password,
            db=db
        )
        
        # Set refresh token in httpOnly cookie
        if login_response.refresh_token and login_response.refresh_expires_at:
            set_refresh_token_cookie(
                response,
                login_response.refresh_token,
                login_response.refresh_expires_at
            )
        
        # Remove refresh_token from response body (security - sent in cookie only)
        login_response.refresh_token = None
        login_response.refresh_expires_at = None
        
        return login_response
        
    except AuthenticationError as e:
        # Generic error message to prevent information leakage
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/refresh", response_model=RefreshResponse)
async def refresh_token(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token (with rotation).
    
    Reads refresh token from httpOnly cookie.
    Returns new access token and sets new refresh token in cookie.
    """
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not provided"
        )
    
    try:
        auth_service = get_auth_service()
        refresh_response = await auth_service.refresh_access_token(
            refresh_token=refresh_token,
            db=db
        )
        
        # Set new refresh token in httpOnly cookie (rotation)
        if refresh_response.refresh_token and refresh_response.refresh_expires_at:
            set_refresh_token_cookie(
                response,
                refresh_response.refresh_token,
                refresh_response.refresh_expires_at
            )
        
        # Remove refresh_token from response body (security - sent in cookie only)
        refresh_response.refresh_token = None
        refresh_response.refresh_expires_at = None
        
        return refresh_response
        
    except TokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    refresh_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Logout user - revoke tokens.
    
    Revokes access token (adds to blacklist) and refresh token.
    Clears refresh token cookie.
    """
    try:
        auth_service = get_auth_service()
        access_token = credentials.credentials
        
        await auth_service.logout(
            access_token=access_token,
            refresh_token=refresh_token,
            db=db
        )
        
        # Clear refresh token cookie
        clear_refresh_token_cookie(response)
        
        return None
        
    except TokenError as e:
        # Even if token is invalid, clear cookie
        clear_refresh_token_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Logout error: {str(e)}", exc_info=True)
        # Clear cookie even on error
        clear_refresh_token_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


@router.post("/reset-password", status_code=status.HTTP_202_ACCEPTED)
async def reset_password(
    request: PasswordResetRequestSchema,
    db: AsyncSession = Depends(get_db)
):
    """
    Request password reset (EMAIL or SMS).
    
    Creates a reset request and sends token (EMAIL) or code (SMS).
    Returns 202 Accepted immediately (security - don't reveal if user exists).
    """
    try:
        password_reset_service = get_password_reset_service()
        
        # Determine identifier based on method
        identifier = request.email if request.method == ResetMethod.EMAIL else request.phone_number
        
        await password_reset_service.request_reset(
            method=request.method,
            identifier=identifier,
            db=db
        )
        
        # Always return success (security - prevent user enumeration)
        return {
            "message": "If the account exists, a reset link has been sent"
        }
        
    except PasswordResetError as e:
        # Still return success to prevent user enumeration
        logger.warning(f"Password reset request failed: {str(e)}")
        return {
            "message": "If the account exists, a reset link has been sent"
        }
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset request failed"
        )


@router.post("/verify-reset", status_code=status.HTTP_200_OK)
async def verify_reset(
    data: PasswordResetVerify,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify and complete password reset.
    
    Accepts reset_token (EMAIL) or verification_code (SMS) with new password.
    Updates user password and marks reset request as USED.
    """
    try:
        password_reset_service = get_password_reset_service()
        
        user = await password_reset_service.verify_reset(
            reset_token=data.reset_token,
            verification_code=data.verification_code,
            new_password=data.new_password,
            db=db
        )
        
        return {
            "message": "Password reset successfully",
            "user_id": uuid_to_ulid(user.id)
        }
        
    except PasswordResetError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Password reset verification error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset verification failed"
        )


@router.post("/verify-phone", status_code=status.HTTP_200_OK)
async def verify_phone(
    verification_code: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify phone number with SMS code.
    
    User must be authenticated. Sends SMS code to user's phone number,
    then verifies the code to mark phone as verified.
    """
    try:
        # Check if user has phone number
        if not current_user.phone_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No phone number associated with account"
            )
        
        # Check if already verified
        if current_user.phone_verified:
            return {
                "message": "Phone number already verified",
                "phone_number": current_user.phone_number,
                "verified": True
            }
        
        # Find pending reset request for this user's phone (SMS method)
        from sqlalchemy import select
        
        stmt = select(PasswordResetRequest).where(
            and_(
                PasswordResetRequest.user_id == current_user.id,
                PasswordResetRequest.method == ResetMethod.SMS,
                PasswordResetRequest.sent_to == current_user.phone_number,
                PasswordResetRequest.status == "PENDING"
            )
        ).order_by(PasswordResetRequest.created_at.desc())
        
        result = await db.execute(stmt)
        reset_request = result.scalar_one_or_none()
        
        if not reset_request:
            # No pending request - create one and send code
            password_reset_service = get_password_reset_service()
            reset_request = await password_reset_service.request_reset(
                method=ResetMethod.SMS,
                identifier=current_user.phone_number,
                db=db
            )
            return {
                "message": "Verification code sent to phone",
                "phone_number": current_user.phone_number,
                "expires_in_minutes": 15
            }
        
        # Verify code
        if reset_request.verification_code != verification_code:
            reset_request.attempts_count += 1
            
            if reset_request.attempts_count >= reset_request.max_attempts:
                reset_request.status = "EXPIRED"
                await db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum verification attempts exceeded. Please request a new code."
                )
            
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )
        
        # Check expiration
        if reset_request.code_expires_at and reset_request.code_expires_at < datetime.utcnow():
            reset_request.status = "EXPIRED"
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code has expired. Please request a new code."
            )
        
        # Code is valid - mark phone as verified
        current_user.phone_verified = True
        current_user.phone_verified_at = datetime.utcnow()
        
        # Mark reset request as USED
        reset_request.status = "USED"
        reset_request.used_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(current_user)
        
        return {
            "message": "Phone number verified successfully",
            "phone_number": current_user.phone_number,
            "verified": True,
            "verified_at": current_user.phone_verified_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Phone verification error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Phone verification failed"
        )
