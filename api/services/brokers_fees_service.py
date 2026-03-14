"""
Brokers Fees Service - Business Logic
Task: Phase 2.1 - Brokers Fees (D18)
ADR-015: Fees per Trading Account. Broker derived from account.

Business logic for Brokers Fees API.
"""

import uuid
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, String
from sqlalchemy.orm import joinedload
import logging

from ..models.brokers_fees import BrokerFee
from ..models.trading_accounts import TradingAccount
from ..utils.identity import uuid_to_ulid, ulid_to_uuid
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..schemas.brokers_fees import BrokerFeeResponse, BrokerFeeSummaryResponse

logger = logging.getLogger(__name__)


def _fee_to_response(fee: BrokerFee, account_name: str) -> BrokerFeeResponse:
    ct = fee.commission_type.value if hasattr(fee.commission_type, "value") else fee.commission_type
    return BrokerFeeResponse(
        id=uuid_to_ulid(fee.id),
        trading_account_id=uuid_to_ulid(fee.trading_account_id),
        account_name=account_name or "",
        commission_type=ct,
        commission_value=fee.commission_value,
        minimum=fee.minimum,
        created_at=fee.created_at,
        updated_at=fee.updated_at,
    )


class BrokersFeesService:
    """
    Brokers Fees Service - ADR-015: fees per trading account.

    Filters: trading_account_id, commission_type; broker via account join.
    """

    async def get_brokers_fees(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        trading_account_id: Optional[str] = None,
        broker: Optional[str] = None,
        commission_type: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[BrokerFeeResponse]:
        stmt = (
            select(BrokerFee, TradingAccount.account_name)
            .join(TradingAccount, BrokerFee.trading_account_id == TradingAccount.id)
            .where(
                and_(
                    BrokerFee.user_id == user_id,
                    BrokerFee.deleted_at.is_(None),
                    TradingAccount.user_id == user_id,
                )
            )
        )
        if trading_account_id:
            try:
                ta_uuid = ulid_to_uuid(trading_account_id)
                stmt = stmt.where(BrokerFee.trading_account_id == ta_uuid)
            except Exception:
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Invalid trading_account_id format",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
                )
        if broker:
            stmt = stmt.where(TradingAccount.broker.ilike(f"%{broker}%"))
        if commission_type:
            cu = commission_type.upper()
            if cu not in ("TIERED", "FLAT"):
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Invalid commission_type. Must be 'TIERED' or 'FLAT'",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
                )
            stmt = stmt.where(BrokerFee.commission_type == cu)
        if search:
            stmt = stmt.where(
                or_(
                    TradingAccount.account_name.ilike(f"%{search}%"),
                    TradingAccount.broker.ilike(f"%{search}%"),
                    func.cast(BrokerFee.commission_value, String).ilike(f"%{search}%"),
                )
            )
        stmt = stmt.order_by(BrokerFee.created_at.desc())
        result = await db.execute(stmt)
        rows = result.all()
        return [_fee_to_response(fee, name) for fee, name in rows]

    async def get_broker_fee_by_id(
        self,
        user_id: uuid.UUID,
        broker_fee_id: str,
        db: AsyncSession,
    ) -> BrokerFeeResponse:
        try:
            fee_uuid = ulid_to_uuid(broker_fee_id)
        except Exception:
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid broker_fee_id format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        stmt = (
            select(BrokerFee, TradingAccount.account_name)
            .join(TradingAccount, BrokerFee.trading_account_id == TradingAccount.id)
            .where(
                and_(
                    BrokerFee.id == fee_uuid,
                    BrokerFee.user_id == user_id,
                    BrokerFee.deleted_at.is_(None),
                )
            )
        )
        result = await db.execute(stmt)
        row = result.one_or_none()
        if not row:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Broker fee not found",
                error_code=ErrorCodes.USER_NOT_FOUND,
            )
        fee, account_name = row
        return _fee_to_response(fee, account_name)

    async def create_broker_fee(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        trading_account_id: str,
        commission_type: str,
        commission_value: Decimal,
        minimum: float,
    ) -> BrokerFeeResponse:
        try:
            ta_uuid = ulid_to_uuid(trading_account_id)
        except Exception:
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid trading_account_id format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        stmt = select(TradingAccount).where(
            and_(
                TradingAccount.id == ta_uuid,
                TradingAccount.user_id == user_id,
                TradingAccount.deleted_at.is_(None),
            )
        )
        acc = (await db.execute(stmt)).scalar_one_or_none()
        if not acc:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Trading account not found or access denied",
                error_code=ErrorCodes.USER_NOT_FOUND,
            )
        cu = commission_type.upper()
        if cu not in ("TIERED", "FLAT"):
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid commission_type. Must be 'TIERED' or 'FLAT'",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        if commission_value < 0:
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="commission_value must be non-negative",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        new_fee = BrokerFee(
            user_id=user_id,
            trading_account_id=ta_uuid,
            commission_type=cu,
            commission_value=commission_value,
            minimum=minimum,
        )
        db.add(new_fee)
        await db.commit()
        await db.refresh(new_fee)
        return _fee_to_response(new_fee, acc.account_name)

    async def update_broker_fee(
        self,
        user_id: uuid.UUID,
        broker_fee_id: str,
        db: AsyncSession,
        trading_account_id: Optional[str] = None,
        commission_type: Optional[str] = None,
        commission_value: Optional[Decimal] = None,
        minimum: Optional[float] = None,
    ) -> BrokerFeeResponse:
        try:
            fee_uuid = ulid_to_uuid(broker_fee_id)
        except Exception:
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid broker_fee_id format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        stmt = (
            select(BrokerFee, TradingAccount.account_name)
            .join(TradingAccount, BrokerFee.trading_account_id == TradingAccount.id)
            .where(
                and_(
                    BrokerFee.id == fee_uuid,
                    BrokerFee.user_id == user_id,
                    BrokerFee.deleted_at.is_(None),
                )
            )
        )
        result = await db.execute(stmt)
        row = result.one_or_none()
        if not row:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Broker fee not found",
                error_code=ErrorCodes.USER_NOT_FOUND,
            )
        fee, account_name = row
        if trading_account_id is not None:
            try:
                ta_uuid = ulid_to_uuid(trading_account_id)
                ta_stmt = select(TradingAccount).where(
                    and_(
                        TradingAccount.id == ta_uuid,
                        TradingAccount.user_id == user_id,
                        TradingAccount.deleted_at.is_(None),
                    )
                )
                ta = (await db.execute(ta_stmt)).scalar_one_or_none()
                if not ta:
                    raise HTTPExceptionWithCode(
                        status_code=404,
                        detail="Trading account not found",
                        error_code=ErrorCodes.USER_NOT_FOUND,
                    )
                fee.trading_account_id = ta_uuid
                account_name = ta.account_name
            except HTTPExceptionWithCode:
                raise
            except Exception:
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Invalid trading_account_id format",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
                )
        if commission_type is not None:
            cu = commission_type.upper()
            if cu not in ("TIERED", "FLAT"):
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Invalid commission_type. Must be 'TIERED' or 'FLAT'",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
                )
            fee.commission_type = cu
        if commission_value is not None:
            if commission_value < 0:
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="commission_value must be non-negative",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
                )
            fee.commission_value = commission_value
        if minimum is not None:
            fee.minimum = minimum
        await db.commit()
        await db.refresh(fee)
        return _fee_to_response(fee, account_name)

    async def delete_broker_fee(
        self,
        user_id: uuid.UUID,
        broker_fee_id: str,
        db: AsyncSession,
    ) -> None:
        try:
            fee_uuid = ulid_to_uuid(broker_fee_id)
        except Exception:
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid broker_fee_id format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        stmt = select(BrokerFee).where(
            and_(
                BrokerFee.id == fee_uuid,
                BrokerFee.user_id == user_id,
                BrokerFee.deleted_at.is_(None),
            )
        )
        fee = (await db.execute(stmt)).scalar_one_or_none()
        if not fee:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Broker fee not found",
                error_code=ErrorCodes.USER_NOT_FOUND,
            )
        fee.deleted_at = datetime.utcnow()
        await db.commit()

    async def get_brokers_fees_summary(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        trading_account_id: Optional[str] = None,
        broker: Optional[str] = None,
        commission_type: Optional[str] = None,
    ) -> BrokerFeeSummaryResponse:
        stmt = (
            select(BrokerFee)
            .join(TradingAccount, BrokerFee.trading_account_id == TradingAccount.id)
            .where(
                and_(
                    BrokerFee.user_id == user_id,
                    BrokerFee.deleted_at.is_(None),
                    TradingAccount.user_id == user_id,
                )
            )
        )
        if trading_account_id:
            try:
                stmt = stmt.where(BrokerFee.trading_account_id == ulid_to_uuid(trading_account_id))
            except Exception:
                pass
        if broker:
            stmt = stmt.where(TradingAccount.broker.ilike(f"%{broker}%"))
        if commission_type and commission_type.upper().strip() in ("TIERED", "FLAT"):
            stmt = stmt.where(BrokerFee.commission_type == commission_type.upper().strip())
        subq = stmt.subquery()
        total = (await db.execute(select(func.count()).select_from(subq))).scalar() or 0
        avg_val = (await db.execute(select(func.avg(subq.c.minimum)))).scalar() or Decimal("0")
        return BrokerFeeSummaryResponse(
            total_brokers=total,
            active_brokers=total,
            avg_commission_per_trade=Decimal(str(avg_val)),
            monthly_fixed_commissions=Decimal("0"),
            yearly_fixed_commissions=Decimal("0"),
        )


_brokers_fees_service: Optional[BrokersFeesService] = None


def get_brokers_fees_service() -> BrokersFeesService:
    global _brokers_fees_service
    if _brokers_fees_service is None:
        _brokers_fees_service = BrokersFeesService()
    return _brokers_fees_service
