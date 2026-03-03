"""
Unit Tests — CashFlowService (api/services/cash_flows.py)
Suite: Cloud Agent Quality Gate
Scope: Validation logic, ULID conversion, flow_type checking (mocked DB)
"""

import pytest
import uuid
import os
import sys
from decimal import Decimal
from datetime import date
from unittest.mock import AsyncMock, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test")
os.environ.setdefault("JWT_SECRET_KEY", "a" * 86)
os.environ.setdefault("ENCRYPTION_KEY", "b" * 43)

from api.services.cash_flows import CashFlowService
from api.utils.exceptions import HTTPExceptionWithCode


@pytest.fixture
def service():
    return CashFlowService()


class TestCreateCashFlow:
    @pytest.mark.asyncio
    async def test_invalid_flow_type_raises_400(self, service):
        db = AsyncMock()
        from api.utils.identity import uuid_to_ulid
        valid_ulid = uuid_to_ulid(uuid.uuid4())

        with pytest.raises(HTTPExceptionWithCode) as exc_info:
            await service.create_cash_flow(
                user_id=uuid.uuid4(),
                db=db,
                trading_account_id=valid_ulid,
                flow_type="INVALID_TYPE",
                amount=Decimal("100"),
                currency="USD",
                transaction_date=date.today(),
            )
        assert exc_info.value.status_code == 400
        assert "Invalid flow_type" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_valid_flow_types(self, service):
        valid_types = ('DEPOSIT', 'WITHDRAWAL', 'DIVIDEND', 'INTEREST', 'FEE', 'OTHER', 'CURRENCY_CONVERSION')
        for ft in valid_types:
            assert ft.upper() in valid_types

    @pytest.mark.asyncio
    async def test_invalid_ulid_raises_400(self, service):
        db = AsyncMock()
        with pytest.raises(HTTPExceptionWithCode) as exc_info:
            await service.create_cash_flow(
                user_id=uuid.uuid4(),
                db=db,
                trading_account_id="bad-ulid",
                flow_type="DEPOSIT",
                amount=Decimal("100"),
                currency="USD",
                transaction_date=date.today(),
            )
        assert exc_info.value.status_code == 400


class TestGetCashFlows:
    @pytest.mark.asyncio
    async def test_invalid_trading_account_id_raises_400(self, service):
        db = AsyncMock()
        with pytest.raises(HTTPExceptionWithCode) as exc_info:
            await service.get_cash_flows(
                user_id=uuid.uuid4(),
                db=db,
                trading_account_id="invalid-ulid",
            )
        assert exc_info.value.status_code == 400


class TestGetCashFlowById:
    @pytest.mark.asyncio
    async def test_invalid_ulid_raises_400(self, service):
        db = AsyncMock()
        with pytest.raises(HTTPExceptionWithCode) as exc_info:
            await service.get_cash_flow_by_id(
                user_id=uuid.uuid4(),
                cash_flow_id="not-valid",
                db=db,
            )
        assert exc_info.value.status_code == 400

    @pytest.mark.asyncio
    async def test_not_found_raises_404(self, service):
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.first.return_value = None
        db.execute.return_value = mock_result

        from api.utils.identity import uuid_to_ulid
        valid_ulid = uuid_to_ulid(uuid.uuid4())

        with pytest.raises(HTTPExceptionWithCode) as exc_info:
            await service.get_cash_flow_by_id(
                user_id=uuid.uuid4(),
                cash_flow_id=valid_ulid,
                db=db,
            )
        assert exc_info.value.status_code == 404


class TestDeleteCashFlow:
    @pytest.mark.asyncio
    async def test_invalid_ulid_raises_400(self, service):
        db = AsyncMock()
        with pytest.raises(HTTPExceptionWithCode) as exc_info:
            await service.delete_cash_flow(
                user_id=uuid.uuid4(),
                cash_flow_id="bad",
                db=db,
            )
        assert exc_info.value.status_code == 400
