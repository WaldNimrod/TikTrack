"""
Unit Tests — AuthService (api/services/auth.py)
Suite: Cloud Agent Quality Gate
Scope: Password hashing, JWT creation, token validation logic (no DB)
"""

import pytest
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, AsyncMock, MagicMock
from decimal import Decimal
import uuid
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test")
os.environ.setdefault(
    "JWT_SECRET_KEY",
    "a" * 86,
)
os.environ.setdefault("ENCRYPTION_KEY", "b" * 43)


from api.services.auth import AuthService, AuthenticationError, TokenError


@pytest.fixture
def auth_service():
    return AuthService()


class TestPasswordHashing:
    def test_hash_password_returns_bcrypt_hash(self, auth_service):
        hashed = auth_service.hash_password("test123")
        assert hashed.startswith("$2b$")
        assert len(hashed) == 60

    def test_verify_password_correct(self, auth_service):
        password = "secure_password_42"
        hashed = auth_service.hash_password(password)
        assert auth_service.verify_password(password, hashed) is True

    def test_verify_password_incorrect(self, auth_service):
        hashed = auth_service.hash_password("correct_password")
        assert auth_service.verify_password("wrong_password", hashed) is False

    def test_verify_password_invalid_hash_returns_false(self, auth_service):
        assert auth_service.verify_password("test", "not_a_valid_hash") is False

    def test_hash_password_different_salts(self, auth_service):
        h1 = auth_service.hash_password("same")
        h2 = auth_service.hash_password("same")
        assert h1 != h2

    def test_verify_password_unicode(self, auth_service):
        password = "סיסמה_חזקה_123"
        hashed = auth_service.hash_password(password)
        assert auth_service.verify_password(password, hashed) is True

    def test_verify_password_empty_string(self, auth_service):
        hashed = auth_service.hash_password("")
        assert auth_service.verify_password("", hashed) is True
        assert auth_service.verify_password("not_empty", hashed) is False


class TestAccessTokenCreation:
    def _make_user(self):
        user = MagicMock()
        user.id = uuid.uuid4()
        user.email = "test@tiktrack.com"
        user.role = MagicMock()
        user.role.value = "USER"
        return user

    def test_create_access_token_returns_tuple(self, auth_service):
        user = self._make_user()
        token, expires_at, jti = auth_service.create_access_token(user)
        assert isinstance(token, str)
        assert isinstance(expires_at, datetime)
        assert isinstance(jti, str)
        assert len(token) > 50

    def test_create_access_token_default_expiry(self, auth_service):
        user = self._make_user()
        _, expires_at, _ = auth_service.create_access_token(user)
        now = datetime.now(timezone.utc)
        diff = (expires_at - now).total_seconds()
        assert 23 * 3600 < diff < 25 * 3600

    def test_create_access_token_custom_expiry(self, auth_service):
        user = self._make_user()
        delta = timedelta(minutes=30)
        _, expires_at, _ = auth_service.create_access_token(user, expires_delta=delta)
        now = datetime.now(timezone.utc)
        diff = (expires_at - now).total_seconds()
        assert 29 * 60 < diff < 31 * 60

    def test_create_access_token_unique_jti(self, auth_service):
        user = self._make_user()
        _, _, jti1 = auth_service.create_access_token(user)
        _, _, jti2 = auth_service.create_access_token(user)
        assert jti1 != jti2

    def test_create_access_token_decodable(self, auth_service):
        from jose import jwt
        from api.core.config import settings

        user = self._make_user()
        token, _, _ = auth_service.create_access_token(user)
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        assert "sub" in payload
        assert payload["email"] == "test@tiktrack.com"
        assert payload["role"] == "USER"
        assert "exp" in payload
        assert "jti" in payload


class TestRefreshTokenCreation:
    def _make_user(self):
        user = MagicMock()
        user.id = uuid.uuid4()
        user.email = "test@tiktrack.com"
        user.role = MagicMock()
        user.role.value = "USER"
        return user

    def test_create_refresh_token_returns_4_tuple(self, auth_service):
        user = self._make_user()
        result = auth_service.create_refresh_token(user)
        assert len(result) == 4
        token_string, expires_at, jti, token_hash = result
        assert isinstance(token_string, str)
        assert isinstance(expires_at, datetime)
        assert isinstance(jti, str)
        assert isinstance(token_hash, str)

    def test_create_refresh_token_hash_is_sha256(self, auth_service):
        user = self._make_user()
        token_string, _, _, token_hash = auth_service.create_refresh_token(user)
        expected_hash = hashlib.sha256(token_string.encode()).hexdigest()
        assert token_hash == expected_hash

    def test_create_refresh_token_expiry_7_days(self, auth_service):
        user = self._make_user()
        _, expires_at, _, _ = auth_service.create_refresh_token(user)
        now = datetime.now(timezone.utc)
        diff = (expires_at - now).total_seconds()
        assert 6 * 86400 < diff < 8 * 86400


class TestAuthServiceInit:
    def test_init_fails_without_secret(self):
        with patch.dict(os.environ, {"JWT_SECRET_KEY": ""}, clear=False):
            from api.core import config
            original = config.settings.jwt_secret_key
            config.settings.jwt_secret_key = ""
            try:
                with pytest.raises(ValueError, match="JWT_SECRET_KEY"):
                    AuthService()
            finally:
                config.settings.jwt_secret_key = original

    def test_init_fails_short_secret(self):
        from api.core import config
        original = config.settings.jwt_secret_key
        config.settings.jwt_secret_key = "short"
        try:
            with pytest.raises(ValueError, match="at least 64 characters"):
                AuthService()
        finally:
            config.settings.jwt_secret_key = original
