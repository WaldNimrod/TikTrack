"""
Unit Tests — TradingAccountService (api/services/trading_accounts.py)
Suite: Cloud Agent Quality Gate
Scope: Business logic validation, ULID conversion, status mapping (mocked DB)
"""

import pytest
import uuid
import os
import sys
from decimal import Decimal
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test")
os.environ.setdefault("JWT_SECRET_KEY", "a" * 86)
os.environ.setdefault("ENCRYPTION_KEY", "b" * 43)

from api.services.trading_accounts import TradingAccountService
from api.utils.exceptions import HTTPExceptionWithCode
from api.schemas.trading_accounts import STATUS_ACTIVE, STATUS_INACTIVE


@pytest.fixture
def service():
    return TradingAccountService()


class TestGetTradingAccountById:
    @pytest.mark.asyncio
    async def test_invalid_ulid_raises_400(self, service):
        db = AsyncMock()
        with pytest.raises(HTTPExceptionWithCode) as exc_info:
            await service.get_trading_account_by_id(
                user_id=uuid.uuid4(),
                trading_account_id="not-a-valid-ulid",
                db=db,
            )
        assert exc_info.value.status_code == 400

    @pytest.mark.asyncio
    async def test_not_found_raises_404(self, service):
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute.return_value = mock_result

        from api.utils.identity import uuid_to_ulid
        valid_ulid = uuid_to_ulid(uuid.uuid4())

        with pytest.raises(HTTPExceptionWithCode) as exc_info:
            await service.get_trading_account_by_id(
                user_id=uuid.uuid4(),
                trading_account_id=valid_ulid,
                db=db,
            )
        assert exc_info.value.status_code == 404


class TestCreateTradingAccount:
    @pytest.mark.asyncio
    async def test_duplicate_name_raises_400(self, service):
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = MagicMock()
        db.execute.return_value = mock_result

        with pytest.raises(HTTPExceptionWithCode) as exc_info:
            await service.create_trading_account(
                user_id=uuid.uuid4(),
                db=db,
                account_name="Existing Account",
                initial_balance=Decimal("10000"),
            )
        assert exc_info.value.status_code == 400
        assert "already exists" in exc_info.value.detail


class TestDeleteTradingAccount:
    @pytest.mark.asyncio
    async def test_invalid_ulid_raises_400(self, service):
        db = AsyncMock()
        with pytest.raises(HTTPExceptionWithCode) as exc_info:
            await service.delete_trading_account(
                user_id=uuid.uuid4(),
                trading_account_id="xxx-invalid",
                db=db,
            )
        assert exc_info.value.status_code == 400

    @pytest.mark.asyncio
    async def test_not_found_raises_404(self, service):
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute.return_value = mock_result

        from api.utils.identity import uuid_to_ulid
        valid_ulid = uuid_to_ulid(uuid.uuid4())

        with pytest.raises(HTTPExceptionWithCode) as exc_info:
            await service.delete_trading_account(
                user_id=uuid.uuid4(),
                trading_account_id=valid_ulid,
                db=db,
            )
        assert exc_info.value.status_code == 404


class TestStatusMapping:
    def test_status_constants(self):
        assert STATUS_ACTIVE == "active"
        assert STATUS_INACTIVE == "inactive"
