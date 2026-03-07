"""
Authentication Service - JWT Token Management & User Authentication
Task: 20.1.5
Status: COMPLETED

Implements JWT authentication with refresh token rotation.
Based on GIN-2026-008 + Architectural Answer (Appendix A).
"""

import uuid
import secrets
import hashlib
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import logging

from ..core.config import settings
from ..models.identity import User
from ..models.tokens import UserRefreshToken, RevokedToken
from ..models.enums import UserRole
from ..utils.identity import uuid_to_ulid
from ..schemas.identity import (
    LoginResponse,
    RegisterResponse,
    RefreshResponse,
    UserResponse
)

logger = logging.getLogger(__name__)


class AuthenticationError(Exception):
    """Authentication error."""
    pass


class TokenError(Exception):
    """Token validation/processing error."""
    pass


class AuthService:
    """
    Authentication Service - Handles user authentication and JWT token management.
    
    Features:
    - User login/registration
    - JWT access token creation (24h)
    - Refresh token creation (7 days) with rotation
    - Token validation and revocation
    - Breach detection (revoked token usage)
    """
    
    def __init__(self):
        """Initialize AuthService."""
        if not settings.jwt_secret_key or len(settings.jwt_secret_key) < 64:
            raise ValueError(
                "JWT_SECRET_KEY must be set and at least 64 characters long. "
                "Generate with: python -c 'import secrets; print(secrets.token_urlsafe(64))'"
            )
    
    # ========================================================================
    # Password Management
    # ========================================================================
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a password using bcrypt.
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password string
        """
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against a hash using bcrypt.
        
        Args:
            plain_password: Plain text password
            hashed_password: Bcrypt hash string
            
        Returns:
            True if password matches, False otherwise
        """
        try:
            return bcrypt.checkpw(
                plain_password.encode('utf-8'),
                hashed_password.encode('utf-8')
            )
        except Exception:
            return False
    
    # ========================================================================
    # JWT Token Creation
    # ========================================================================
    
    def create_access_token(
        self,
        user: User,
        expires_delta: Optional[timedelta] = None
    ) -> tuple[str, datetime, str]:
        """
        Create JWT access token.
        
        Args:
            user: User model instance
            expires_delta: Optional expiration delta (default: 24h)
            
        Returns:
            Tuple of (token_string, expires_at, jti)
        """
        if expires_delta is None:
            expires_delta = timedelta(hours=settings.jwt_access_token_expire_hours)
        
        expires_at = datetime.now(timezone.utc) + expires_delta
        
        # Generate unique JWT ID (jti)
        jti = secrets.token_urlsafe(32)
        
        # Convert UUID to ULID for sub claim
        user_ulid = uuid_to_ulid(user.id)
        
        # Create payload
        payload: Dict[str, Any] = {
            "sub": user_ulid,  # ULID (external identifier)
            "email": user.email,
            "role": user.role.value,
            "iat": datetime.now(timezone.utc),
            "jti": jti,
            "exp": expires_at,
        }
        
        # Create token (PyJWT; KB-010: replaces python-jose)
        token = jwt.encode(
            payload,
            settings.jwt_secret_key,
            algorithm=settings.jwt_algorithm
        )
        
        return token, expires_at, jti
    
    def create_refresh_token(self, user: User) -> tuple[str, datetime, str]:
        """
        Create refresh token and store in database.
        
        Args:
            user: User model instance
            
        Returns:
            Tuple of (token_string, expires_at, jti)
        """
        expires_delta = timedelta(days=settings.jwt_refresh_token_expire_days)
        expires_at = datetime.now(timezone.utc) + expires_delta
        
        # Generate unique token and JWT ID
        token_string = secrets.token_urlsafe(64)
        jti = secrets.token_urlsafe(32)
        
        # Hash token for storage (security)
        token_hash = hashlib.sha256(token_string.encode()).hexdigest()
        
        return token_string, expires_at, jti, token_hash
    
    # ========================================================================
    # Token Validation
    # ========================================================================
    
    async def validate_access_token(
        self,
        token: str,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Validate access token and return payload.
        
        Args:
            token: JWT access token string
            db: Database session
            
        Returns:
            Token payload (claims)
            
        Raises:
            TokenError: If token is invalid, expired, or revoked
        """
        try:
            # Decode token
            payload = jwt.decode(
                token,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm]
            )
            
            # Check if token is revoked (blacklist)
            jti = payload.get("jti")
            if jti:
                stmt = select(RevokedToken).where(
                    and_(
                        RevokedToken.jti == jti,
                        RevokedToken.expires_at > datetime.now(timezone.utc)
                    )
                )
                result = await db.execute(stmt)
                revoked = result.scalar_one_or_none()
                if revoked:
                    raise TokenError("Token has been revoked")
            
            return payload
            
        except jwt.PyJWTError as e:
            raise TokenError(f"Invalid token: {str(e)}")
    
    async def validate_refresh_token(
        self,
        token: str,
        db: AsyncSession
    ) -> UserRefreshToken:
        """
        Validate refresh token and return database record.
        
        Args:
            token: Refresh token string
            db: Database session
            
        Returns:
            UserRefreshToken model instance
            
        Raises:
            TokenError: If token is invalid, expired, or revoked
        """
        # Hash token for lookup
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        # Find token in database
        stmt = select(UserRefreshToken).where(
            and_(
                UserRefreshToken.token_hash == token_hash,
                UserRefreshToken.revoked_at.is_(None),
                UserRefreshToken.expires_at > datetime.now(timezone.utc)
            )
        )
        result = await db.execute(stmt)
        refresh_token = result.scalar_one_or_none()
        
        if not refresh_token:
            raise TokenError("Invalid or expired refresh token")
        
        return refresh_token
    
    # ========================================================================
    # Authentication Methods
    # ========================================================================
    
    async def login(
        self,
        username_or_email: str,
        password: str,
        db: AsyncSession
    ) -> LoginResponse:
        """
        Authenticate user and return tokens.
        
        Args:
            username_or_email: Username or email address
            password: User password
            db: Database session
            
        Returns:
            LoginResponse with tokens and user info
            
        Raises:
            AuthenticationError: If credentials are invalid
        """
        try:
            # Find user by username or email
            logger.debug(f"Looking up user: {username_or_email}")
            stmt = select(User).where(
                (User.username == username_or_email) | (User.email == username_or_email)
            ).where(User.deleted_at.is_(None))
            
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                logger.warning(f"User not found: {username_or_email}")
                raise AuthenticationError("Invalid credentials")
            
            logger.info(f"User found: {user.username}, email: {user.email}, is_active: {user.is_active}")
            
            # Check if account is active
            if not user.is_active:
                logger.warning(f"Account inactive: {user.username}")
                raise AuthenticationError("Account is inactive")
            
            # Check if account is locked
            if user.locked_until and user.locked_until > datetime.now(timezone.utc):
                logger.warning(f"Account locked: {user.username}")
                raise AuthenticationError("Account is locked")
            
            # Verify password
            logger.info(f"Verifying password for user: {user.username}")
            logger.info(f"Password hash (first 50 chars): {user.password_hash[:50]}...")
            logger.info(f"Password hash length: {len(user.password_hash)}")
            logger.info(f"Password hash format check: {user.password_hash.startswith('$2b$')}")
            try:
                password_valid = self.verify_password(password, user.password_hash)
                logger.info(f"Password verification result: {password_valid}")
            except Exception as e:
                logger.error(f"Password verification error: {type(e).__name__}: {str(e)}", exc_info=True)
                raise AuthenticationError("Invalid credentials")
            
            if not password_valid:
                logger.warning(f"Password verification failed for user: {user.username}")
                # Increment failed login attempts
                try:
                    user.failed_login_attempts += 1
                    if user.failed_login_attempts >= 5:
                        user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=30)
                    await db.commit()
                except Exception as e:
                    logger.error(f"Failed to update login attempts: {type(e).__name__}: {str(e)}", exc_info=True)
                    # Don't fail login if we can't update attempts
                raise AuthenticationError("Invalid credentials")
            
            # Reset failed attempts on successful login
            try:
                user.failed_login_attempts = 0
                user.locked_until = None
                user.last_login_at = datetime.now(timezone.utc)
                await db.commit()
            except Exception as e:
                logger.error(f"Failed to update user login status: {type(e).__name__}: {str(e)}", exc_info=True)
                # Continue even if update fails
            
            # Create tokens
            try:
                access_token, expires_at, access_jti = self.create_access_token(user)
                refresh_token, refresh_expires_at, refresh_jti, token_hash = self.create_refresh_token(user)
            except Exception as e:
                logger.error(f"Token creation error: {type(e).__name__}: {str(e)}", exc_info=True)
                raise AuthenticationError("Token creation failed")
            
            # Store refresh token in database
            try:
                db_refresh_token = UserRefreshToken(
                    user_id=user.id,
                    token_hash=token_hash,
                    jti=refresh_jti,
                    expires_at=refresh_expires_at
                )
                db.add(db_refresh_token)
                await db.commit()
            except Exception as e:
                logger.error(f"Failed to store refresh token: {type(e).__name__}: {str(e)}", exc_info=True)
                # Rollback the refresh token creation
                await db.rollback()
                raise AuthenticationError("Failed to store refresh token")
            
            # Create response
            try:
                user_response = UserResponse.from_model(user)
            except Exception as e:
                logger.error(f"Failed to create user response: {type(e).__name__}: {str(e)}", exc_info=True)
                raise AuthenticationError("Failed to create response")
            
            return LoginResponse(
                access_token=access_token,
                token_type="bearer",
                expires_at=expires_at,
                user=user_response,
                refresh_token=refresh_token,  # Will be sent in httpOnly cookie
                refresh_expires_at=refresh_expires_at
            )
        except AuthenticationError:
            # Re-raise authentication errors
            raise
        except Exception as e:
            # Log unexpected errors and re-raise as AuthenticationError
            logger.error(f"Unexpected error in login: {type(e).__name__}: {str(e)}", exc_info=True)
            raise AuthenticationError("Login processing failed")
    
    async def register(
        self,
        username: str,
        email: str,
        password: str,
        phone_number: Optional[str],
        db: AsyncSession
    ) -> RegisterResponse:
        """
        Register new user and return tokens.
        
        Args:
            username: Username
            email: Email address
            password: Password
            phone_number: Optional phone number
            db: Database session
            
        Returns:
            RegisterResponse with tokens and user info
            
        Raises:
            AuthenticationError: If user already exists
        """
        try:
            # Check if user already exists (username, email, or phone_number)
            try:
                # Build query conditions
                from sqlalchemy import or_
                
                conditions = [
                    User.username == username,
                    User.email == email
                ]
                
                # Add phone_number check if provided
                if phone_number:
                    conditions.append(User.phone_number == phone_number)
                
                # Combine conditions with OR
                combined_condition = conditions[0] | conditions[1]
                if phone_number:
                    combined_condition = combined_condition | conditions[2]
                
                stmt = select(User).where(
                    combined_condition
                ).where(User.deleted_at.is_(None))
                
                result = await db.execute(stmt)
                existing_user = result.scalar_one_or_none()
                
                if existing_user:
                    # Determine which field caused the conflict
                    if existing_user.username == username:
                        raise AuthenticationError("Username already exists")
                    elif existing_user.email == email:
                        raise AuthenticationError("Email already exists")
                    elif phone_number and existing_user.phone_number == phone_number:
                        raise AuthenticationError("Phone number already exists")
                    else:
                        raise AuthenticationError("User already exists")
            except AuthenticationError:
                raise
            except Exception as e:
                logger.error(f"Database query error during user check: {type(e).__name__}: {str(e)}", exc_info=True)
                raise AuthenticationError("Registration failed")
            
            # Create new user
            try:
                user = User(
                    username=username,
                    email=email,
                    password_hash=self.hash_password(password),
                    phone_number=phone_number,
                    role=UserRole.USER
                )
                
                db.add(user)
                await db.flush()  # Get user.id
            except Exception as e:
                logger.error(f"Failed to create user: {type(e).__name__}: {str(e)}", exc_info=True)
                await db.rollback()
                # Check if it's a unique constraint violation
                if "unique" in str(e).lower() or "duplicate" in str(e).lower():
                    raise AuthenticationError("User already exists")
                raise AuthenticationError("Failed to create user")
            
            # Create tokens
            try:
                access_token, expires_at, access_jti = self.create_access_token(user)
                refresh_token, refresh_expires_at, refresh_jti, token_hash = self.create_refresh_token(user)
            except Exception as e:
                logger.error(f"Token creation error: {type(e).__name__}: {str(e)}", exc_info=True)
                await db.rollback()
                raise AuthenticationError("Token creation failed")
            
            # Store refresh token
            try:
                db_refresh_token = UserRefreshToken(
                    user_id=user.id,
                    token_hash=token_hash,
                    jti=refresh_jti,
                    expires_at=refresh_expires_at
                )
                db.add(db_refresh_token)
                await db.commit()
            except Exception as e:
                logger.error(f"Failed to store refresh token: {type(e).__name__}: {str(e)}", exc_info=True)
                await db.rollback()
                raise AuthenticationError("Failed to store refresh token")
            
            # Create response
            try:
                user_response = UserResponse.from_model(user)
            except Exception as e:
                logger.error(f"Failed to create user response: {type(e).__name__}: {str(e)}", exc_info=True)
                # Don't fail registration if response creation fails, but log it
                # Try to create a minimal response
                from ..utils.identity import uuid_to_ulid
                user_response = UserResponse(
                    external_ulids=uuid_to_ulid(user.id),
                    email=user.email,
                    phone_numbers=user.phone_number,
                    user_tier_levels="Bronze",
                    username=user.username,
                    display_name=user.display_name,
                    role=user.role,
                    is_email_verified=user.is_email_verified,
                    phone_verified=user.phone_verified,
                    created_at=user.created_at
                )
            
            return RegisterResponse(
                access_token=access_token,
                token_type="bearer",
                expires_at=expires_at,
                user=user_response,
                refresh_token=refresh_token,  # Will be sent in httpOnly cookie
                refresh_expires_at=refresh_expires_at
            )
        except AuthenticationError:
            # Re-raise authentication errors
            raise
        except Exception as e:
            # Log unexpected errors and re-raise as AuthenticationError
            logger.error(f"Unexpected error in register: {type(e).__name__}: {str(e)}", exc_info=True)
            raise AuthenticationError("Registration processing failed")
    
    async def refresh_access_token(
        self,
        refresh_token: str,
        db: AsyncSession
    ) -> RefreshResponse:
        """
        Refresh access token using refresh token (with rotation).
        
        Args:
            refresh_token: Refresh token string (from httpOnly cookie)
            db: Database session
            
        Returns:
            RefreshResponse with new access token
            
        Raises:
            TokenError: If refresh token is invalid
        """
        # Validate refresh token
        db_refresh_token = await self.validate_refresh_token(refresh_token, db)
        user_id = db_refresh_token.user_id
        
        # Get user
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise TokenError("User not found")
        
        # Revoke old refresh token (rotation)
        db_refresh_token.revoked_at = datetime.utcnow()
        
        # Create new tokens
        access_token, expires_at, access_jti = self.create_access_token(user)
        new_refresh_token, new_refresh_expires_at, new_refresh_jti, new_token_hash = self.create_refresh_token(user)
        
        # Store new refresh token
        new_db_refresh_token = UserRefreshToken(
            user_id=user.id,
            token_hash=new_token_hash,
            jti=new_refresh_jti,
            expires_at=new_refresh_expires_at
        )
        db.add(new_db_refresh_token)
        await db.commit()
        
        # Option B: Same response structure as login/register (access_token, token_type, expires_at, user)
        user_response = UserResponse.from_model(user)
        
        return RefreshResponse(
            access_token=access_token,
            token_type="bearer",
            expires_at=expires_at,
            user=user_response,
            refresh_token=new_refresh_token,  # Will be sent in httpOnly cookie
            refresh_expires_at=new_refresh_expires_at
        )
    
    async def logout(
        self,
        access_token: str,
        refresh_token: Optional[str],
        db: AsyncSession
    ) -> None:
        """
        Logout user - revoke tokens.
        
        Args:
            access_token: Access token string (will extract jti)
            refresh_token: Optional refresh token string
            db: Database session
        """
        # Decode access token to get jti and exp
        try:
            payload = jwt.decode(
                access_token,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
                options={"verify_exp": False}  # Don't verify exp for logout
            )
            jti = payload.get("jti")
            exp = payload.get("exp")
            
            if jti:
                # Add access token to blacklist
                expires_at = datetime.fromtimestamp(exp, tz=timezone.utc) if exp else datetime.now(timezone.utc) + timedelta(hours=24)
                
                revoked_token = RevokedToken(
                    jti=jti,
                    expires_at=expires_at
                )
                db.add(revoked_token)
        except jwt.PyJWTError:
            # If token is invalid, still try to revoke refresh token
            pass
        
        # Revoke refresh token if provided
        if refresh_token:
            token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
            stmt = select(UserRefreshToken).where(
                and_(
                    UserRefreshToken.token_hash == token_hash,
                    UserRefreshToken.revoked_at.is_(None)
                )
            )
            result = await db.execute(stmt)
            db_refresh_token = result.scalar_one_or_none()
            if db_refresh_token:
                db_refresh_token.revoked_at = datetime.utcnow()
        
        await db.commit()
    
    async def revoke_all_user_tokens(
        self,
        user_id: uuid.UUID,
        db: AsyncSession
    ) -> int:
        """
        Revoke all refresh tokens for a user (security reset on breach detection).
        
        Args:
            user_id: User UUID
            db: Database session
            
        Returns:
            Number of tokens revoked
        """
        stmt = select(UserRefreshToken).where(
            and_(
                UserRefreshToken.user_id == user_id,
                UserRefreshToken.revoked_at.is_(None)
            )
        )
        result = await db.execute(stmt)
        tokens = result.scalars().all()
        
        count = 0
        for token in tokens:
            token.revoked_at = datetime.now(timezone.utc)
            count += 1
        
        await db.commit()
        return count


# Singleton instance
_auth_service: Optional[AuthService] = None


def get_auth_service() -> AuthService:
    """Get global AuthService instance."""
    global _auth_service
    if _auth_service is None:
        _auth_service = AuthService()
    return _auth_service
