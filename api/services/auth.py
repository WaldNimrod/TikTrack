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
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
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

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
            Hashed password
        """
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against its hash.
        
        Args:
            plain_password: Plain text password
            hashed_password: Hashed password from database
            
        Returns:
            True if password matches, False otherwise
        """
        return pwd_context.verify(plain_password, hashed_password)
    
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
        
        expires_at = datetime.utcnow() + expires_delta
        
        # Generate unique JWT ID (jti)
        jti = secrets.token_urlsafe(32)
        
        # Convert UUID to ULID for sub claim
        user_ulid = uuid_to_ulid(user.id)
        
        # Create payload
        payload: Dict[str, Any] = {
            "sub": user_ulid,  # ULID (external identifier)
            "email": user.email,
            "role": user.role.value,
            "iat": datetime.utcnow(),
            "jti": jti,
            "exp": expires_at,
        }
        
        # Create token
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
        expires_at = datetime.utcnow() + expires_delta
        
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
                        RevokedToken.expires_at > datetime.utcnow()
                    )
                )
                result = await db.execute(stmt)
                revoked = result.scalar_one_or_none()
                if revoked:
                    raise TokenError("Token has been revoked")
            
            return payload
            
        except JWTError as e:
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
                UserRefreshToken.expires_at > datetime.utcnow()
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
        # Find user by username or email
        stmt = select(User).where(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).where(User.deleted_at.is_(None))
        
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise AuthenticationError("Invalid credentials")
        
        # Check if account is locked
        if user.locked_until and user.locked_until > datetime.utcnow():
            raise AuthenticationError("Account is locked")
        
        # Verify password
        if not self.verify_password(password, user.password_hash):
            # Increment failed login attempts
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.locked_until = datetime.utcnow() + timedelta(minutes=30)
            await db.commit()
            raise AuthenticationError("Invalid credentials")
        
        # Reset failed attempts on successful login
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login_at = datetime.utcnow()
        await db.commit()
        
        # Create tokens
        access_token, expires_at, access_jti = self.create_access_token(user)
        refresh_token, refresh_expires_at, refresh_jti, token_hash = self.create_refresh_token(user)
        
        # Store refresh token in database
        db_refresh_token = UserRefreshToken(
            user_id=user.id,
            token_hash=token_hash,
            jti=refresh_jti,
            expires_at=refresh_expires_at
        )
        db.add(db_refresh_token)
        await db.commit()
        
        # Create response
        user_response = UserResponse.from_model(user)
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            expires_at=expires_at,
            user=user_response,
            refresh_token=refresh_token,  # Will be sent in httpOnly cookie
            refresh_expires_at=refresh_expires_at
        )
    
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
        # Check if user already exists
        stmt = select(User).where(
            (User.username == username) | (User.email == email)
        ).where(User.deleted_at.is_(None))
        
        result = await db.execute(stmt)
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise AuthenticationError("User already exists")
        
        # Create new user
        user = User(
            username=username,
            email=email,
            password_hash=self.hash_password(password),
            phone_number=phone_number,
            role=UserRole.USER
        )
        
        db.add(user)
        await db.flush()  # Get user.id
        
        # Create tokens
        access_token, expires_at, access_jti = self.create_access_token(user)
        refresh_token, refresh_expires_at, refresh_jti, token_hash = self.create_refresh_token(user)
        
        # Store refresh token
        db_refresh_token = UserRefreshToken(
            user_id=user.id,
            token_hash=token_hash,
            jti=refresh_jti,
            expires_at=refresh_expires_at
        )
        db.add(db_refresh_token)
        await db.commit()
        
        # Create response
        user_response = UserResponse.from_model(user)
        
        return RegisterResponse(
            access_token=access_token,
            token_type="bearer",
            expires_at=expires_at,
            user=user_response,
            refresh_token=refresh_token,  # Will be sent in httpOnly cookie
            refresh_expires_at=refresh_expires_at
        )
    
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
        
        return RefreshResponse(
            access_token=access_token,
            token_type="bearer",
            expires_at=expires_at,
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
                expires_at = datetime.fromtimestamp(exp) if exp else datetime.utcnow() + timedelta(hours=24)
                
                revoked_token = RevokedToken(
                    jti=jti,
                    expires_at=expires_at
                )
                db.add(revoked_token)
        except JWTError:
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
            token.revoked_at = datetime.utcnow()
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
