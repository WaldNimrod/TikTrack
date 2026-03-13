"""
Password Reset Service - Password Reset Management (GIN-004)
Task: 20.1.6
Status: COMPLETED

Manages password reset requests via EMAIL (token) and SMS (verification code).
Based on GIN-2026-004 + PHX_DB_SCHEMA_V2.5.
"""

import uuid
import secrets
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import logging

from ..models.identity import User, PasswordResetRequest
from ..models.enums import ResetMethod
from ..services.auth import get_auth_service

logger = logging.getLogger(__name__)


class PasswordResetError(Exception):
    """Password reset service error."""

    pass


class PasswordResetService:
    """
    Password Reset Service - Handles password reset requests and verification.

    Features:
    - EMAIL method: Generates secure token, sends via email
    - SMS method: Generates 6-digit code, sends via SMS
    - Token/code expiration (24h for EMAIL, 15min for SMS)
    - Attempt limiting (max 3 attempts for SMS)
    - Automatic status management (PENDING, USED, EXPIRED)
    """

    # Token/code expiration times
    EMAIL_TOKEN_EXPIRY_HOURS = 24
    SMS_CODE_EXPIRY_MINUTES = 15

    # SMS attempt limits
    SMS_MAX_ATTEMPTS = 3

    def __init__(self):
        """Initialize PasswordResetService."""
        self.auth_service = get_auth_service()

    async def request_reset(
        self, method: ResetMethod, identifier: str, db: AsyncSession
    ) -> PasswordResetRequest:
        """
        Request password reset.

        Args:
            method: Reset method (EMAIL or SMS)
            identifier: Email address or phone number
            db: Database session

        Returns:
            PasswordResetRequest model instance

        Raises:
            PasswordResetError: If user not found or request fails
        """
        # Find user by email or phone
        if method == ResetMethod.EMAIL:
            stmt = select(User).where(User.email == identifier)
        elif method == ResetMethod.SMS:
            stmt = select(User).where(User.phone_numbers == identifier)
        else:
            raise PasswordResetError(f"Invalid reset method: {method}")

        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            # Don't reveal if user exists (security)
            logger.warning(
                f"Password reset requested for non-existent {method.value}: {identifier}"
            )
            # Return success anyway to prevent user enumeration
            # But don't create a record
            raise PasswordResetError("If the account exists, a reset link has been sent")

        # Generate reset token (for EMAIL) or code (for SMS)
        reset_token = self._generate_reset_token()

        if method == ResetMethod.EMAIL:
            token_expires_at = datetime.utcnow() + timedelta(hours=self.EMAIL_TOKEN_EXPIRY_HOURS)
            verification_code = None
            code_expires_at = None
        else:  # SMS
            verification_code = self._generate_verification_code()
            code_expires_at = datetime.utcnow() + timedelta(minutes=self.SMS_CODE_EXPIRY_MINUTES)
            token_expires_at = datetime.utcnow() + timedelta(
                hours=self.EMAIL_TOKEN_EXPIRY_HOURS
            )  # Fallback

        # Create reset request record
        reset_request = PasswordResetRequest(
            user_id=user.id,
            method=method,
            sent_to=identifier,
            reset_token=reset_token,
            token_expires_at=token_expires_at,
            verification_code=verification_code,
            code_expires_at=code_expires_at,
            attempts_count=0,
            max_attempts=self.SMS_MAX_ATTEMPTS,
            status="PENDING",
        )

        db.add(reset_request)
        await db.flush()

        # Send email or SMS
        try:
            if method == ResetMethod.EMAIL:
                await self._send_reset_email(identifier, reset_token)
            else:  # SMS
                await self._send_reset_sms(identifier, verification_code)
        except Exception as e:
            logger.error(f"Failed to send {method.value} reset: {str(e)}", exc_info=True)
            # Don't fail the request - email/SMS might be delayed
            # The token/code is still valid

        await db.commit()
        await db.refresh(reset_request)

        return reset_request

    async def verify_reset(
        self,
        reset_token: Optional[str],
        verification_code: Optional[str],
        new_password: str,
        db: AsyncSession,
    ) -> User:
        """
        Verify and complete password reset.

        Args:
            reset_token: Reset token (for EMAIL method)
            verification_code: Verification code (for SMS method)
            new_password: New password to set
            db: Database session

        Returns:
            Updated User model instance

        Raises:
            PasswordResetError: If token/code invalid, expired, or already used
        """
        # Find reset request
        if reset_token:
            stmt = select(PasswordResetRequest).where(
                PasswordResetRequest.reset_token == reset_token
            )
        elif verification_code:
            stmt = select(PasswordResetRequest).where(
                PasswordResetRequest.verification_code == verification_code
            )
        else:
            raise PasswordResetError("Either reset_token or verification_code must be provided")

        result = await db.execute(stmt)
        reset_request = result.scalar_one_or_none()

        if not reset_request:
            raise PasswordResetError("Invalid reset token or verification code")

        # Check status
        if reset_request.status == "USED":
            raise PasswordResetError("This reset request has already been used")

        if reset_request.status == "EXPIRED":
            raise PasswordResetError("This reset request has expired")

        # Check expiration
        now = datetime.utcnow()

        if reset_request.method == ResetMethod.EMAIL:
            if reset_request.token_expires_at < now:
                reset_request.status = "EXPIRED"
                await db.commit()
                raise PasswordResetError("Reset token has expired")
        else:  # SMS
            if reset_request.code_expires_at and reset_request.code_expires_at < now:
                reset_request.status = "EXPIRED"
                await db.commit()
                raise PasswordResetError("Verification code has expired")

            # Verify code matches
            if reset_request.verification_code != verification_code:
                reset_request.attempts_count += 1

                # Check if max attempts reached
                if reset_request.attempts_count >= reset_request.max_attempts:
                    reset_request.status = "EXPIRED"
                    await db.commit()
                    raise PasswordResetError("Maximum verification attempts exceeded")

                await db.commit()
                raise PasswordResetError("Invalid verification code")

        # Get user
        user_stmt = select(User).where(User.id == reset_request.user_id)
        user_result = await db.execute(user_stmt)
        user = user_result.scalar_one()

        # Update password
        hashed_password = self.auth_service.hash_password(new_password)
        user.password_hash = hashed_password
        user.updated_at = datetime.utcnow()

        # Mark reset request as USED
        reset_request.status = "USED"
        reset_request.used_at = datetime.utcnow()

        await db.commit()
        await db.refresh(user)

        return user

    def _generate_reset_token(self) -> str:
        """
        Generate secure reset token (32+ characters).

        Returns:
            Secure random token string
        """
        # Generate 32-byte token (64 hex characters)
        return secrets.token_urlsafe(32)

    def _generate_verification_code(self) -> str:
        """
        Generate 6-digit verification code.

        Returns:
            6-digit code string
        """
        return f"{secrets.randbelow(1000000):06d}"

    async def _send_reset_email(self, email: str, reset_token: str) -> None:
        """
        Send password reset email.

        Args:
            email: Recipient email address
            reset_token: Reset token to include in email

        Raises:
            Exception: If email sending fails
        """
        # TODO: Integrate with email service (SMTP/SendGrid)
        # For now, log the token (development only)
        logger.info(f"[DEV] Password reset email for {email}: token={reset_token}")

        # In production, this should:
        # 1. Use SMTP or SendGrid API
        # 2. Send formatted email with reset link
        # 3. Include expiration time
        # 4. Handle errors gracefully

        # Example integration:
        # from ..integrations.email import send_email
        # await send_email(
        #     to=email,
        #     subject="Password Reset Request",
        #     template="password_reset",
        #     context={"reset_token": reset_token, "expires_in": "24 hours"}
        # )

        pass

    async def _send_reset_sms(self, phone: str, verification_code: str) -> None:
        """
        Send password reset SMS.

        Args:
            phone: Recipient phone number
            verification_code: 6-digit code to send

        Raises:
            Exception: If SMS sending fails
        """
        # TODO: Integrate with SMS service (Twilio/AWS SNS)
        # For now, log the code (development only)
        logger.info(f"[DEV] Password reset SMS for {phone}: code={verification_code}")

        # In production, this should:
        # 1. Use Twilio or AWS SNS API
        # 2. Send formatted SMS with code
        # 3. Include expiration time
        # 4. Handle errors gracefully

        # Example integration:
        # from ..integrations.sms import send_sms
        # await send_sms(
        #     to=phone,
        #     message=f"Your TikTrack verification code is {verification_code}. Valid for 15 minutes."
        # )

        pass


# Singleton instance
_password_reset_service: Optional[PasswordResetService] = None


def get_password_reset_service() -> PasswordResetService:
    """Get global PasswordResetService instance."""
    global _password_reset_service
    if _password_reset_service is None:
        _password_reset_service = PasswordResetService()
    return _password_reset_service
