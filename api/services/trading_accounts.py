"""
Trading Accounts Service - Business Logic
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

Business logic for Trading Accounts API.
Calculates positions_count, total_pl, account_value, holdings_value from trades.
"""

import uuid
from typing import List, Optional
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, case, cast, String
import logging

from ..models.trading_accounts import TradingAccount
from ..models.trades import Trade
from ..utils.identity import uuid_to_ulid, ulid_to_uuid
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..schemas.trading_accounts import (
    TradingAccountResponse,
    TradingAccountSummaryResponse,
    TradingAccountCreateRequest,
    TradingAccountUpdateRequest,
    STATUS_ACTIVE,
    STATUS_INACTIVE,
)

logger = logging.getLogger(__name__)


class TradingAccountService:
    """
    Trading Accounts Service - Handles trading account queries and calculations.
    
    Features:
    - List trading accounts with filters (status, search)
    - Calculate positions_count from trades
    - Calculate total_pl, account_value, holdings_value from trades
    """
    
    async def get_trading_accounts(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        status: Optional[bool] = None,
        search: Optional[str] = None
    ) -> List[TradingAccountResponse]:
        """
        Get trading accounts for user with calculated fields.
        
        Args:
            user_id: User UUID
            db: Database session
            status: Filter by is_active (optional)
            search: Search by account_name (optional)
            
        Returns:
            List of TradingAccountResponse with calculated fields
        """
        # Base query for trading accounts
        conditions = [
            TradingAccount.user_id == user_id,
            TradingAccount.deleted_at.is_(None)
        ]
        
        if status is not None:
            conditions.append(TradingAccount.is_active == status)
        
        if search:
            conditions.append(TradingAccount.account_name.ilike(f"%{search}%"))
        
        stmt = select(TradingAccount).where(and_(*conditions))
        result = await db.execute(stmt)
        accounts = list(result.scalars().all())
        
        if not accounts:
            return []
        
        # Get account IDs for trades calculations
        account_ids = [acc.id for acc in accounts]
        
        # Calculate positions_count and total_pl for each account
        # Using subquery to aggregate trades per account
        trade_stats_stmt = select(
            Trade.trading_account_id,
            func.count(Trade.id).label("positions_count"),
            func.coalesce(func.sum(Trade.unrealized_pl), Decimal("0")).label("total_pl"),
            func.coalesce(func.sum(Trade.unrealized_pl), Decimal("0")).label("holdings_value")
        ).where(
            and_(
                Trade.trading_account_id.in_(account_ids),
                Trade.user_id == user_id,
                cast(Trade.status, String) != "CLOSED",
                Trade.deleted_at.is_(None)
            )
        ).group_by(Trade.trading_account_id)
        
        trade_stats_result = await db.execute(trade_stats_stmt)
        trade_stats = {
            row.trading_account_id: {
                "positions_count": row.positions_count or 0,
                "total_pl": row.total_pl or Decimal("0"),
                "holdings_value": row.holdings_value or Decimal("0")
            }
            for row in trade_stats_result.all()
        }
        
        # Build response with calculated fields
        responses = []
        for account in accounts:
            stats = trade_stats.get(account.id, {
                "positions_count": 0,
                "total_pl": Decimal("0"),
                "holdings_value": Decimal("0")
            })
            
            # Calculate account_value = cash_balance + holdings_value
            account_value = account.cash_balance + stats["holdings_value"]
            
            canonical_status = STATUS_ACTIVE if account.is_active else STATUS_INACTIVE
            response = TradingAccountResponse(
                external_ulid=uuid_to_ulid(account.id),
                account_name=account.account_name,
                broker=account.broker,
                currency=account.currency,
                cash_balance=account.cash_balance,
                positions_count=stats["positions_count"],
                total_pl=stats["total_pl"],
                account_value=account_value,
                holdings_value=stats["holdings_value"],
                status=canonical_status,
                is_active=account.is_active,
                updated_at=account.updated_at
            )
            responses.append(response)
        
        return responses
    
    async def get_trading_accounts_summary(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        status: Optional[bool] = None
    ) -> TradingAccountSummaryResponse:
        """
        Get trading accounts summary statistics.
        
        Args:
            user_id: User UUID
            db: Database session
            status: Filter by is_active (optional)
            
        Returns:
            TradingAccountSummaryResponse with summary statistics
        """
        # Base query conditions
        conditions = [
            TradingAccount.user_id == user_id,
            TradingAccount.deleted_at.is_(None)
        ]
        
        if status is not None:
            conditions.append(TradingAccount.is_active == status)
        
        # Count total accounts
        stmt_total = select(func.count(TradingAccount.id)).where(and_(*conditions))
        result_total = await db.execute(stmt_total)
        total_accounts = result_total.scalar() or 0
        
        # Count active accounts
        conditions_active = conditions + [TradingAccount.is_active == True]
        stmt_active = select(func.count(TradingAccount.id)).where(and_(*conditions_active))
        result_active = await db.execute(stmt_active)
        active_accounts = result_active.scalar() or 0
        
        # Calculate totals: cash_balance, account_value
        stmt_totals = select(
            func.coalesce(func.sum(TradingAccount.cash_balance), Decimal("0")).label("total_cash_balance")
        ).where(and_(*conditions))
        result_totals = await db.execute(stmt_totals)
        total_cash_balance = result_totals.scalar() or Decimal("0")
        
        # Get account IDs for trades calculations
        stmt_accounts = select(TradingAccount.id).where(and_(*conditions))
        result_accounts = await db.execute(stmt_accounts)
        account_ids = [row[0] for row in result_accounts.all()]
        
        # Calculate totals from trades: holdings_value, total_pl, positions_count
        total_holdings_value = Decimal("0")
        total_unrealized_pl = Decimal("0")
        total_positions = 0
        
        if account_ids:
            trade_stats_stmt = select(
                func.coalesce(func.sum(Trade.unrealized_pl), Decimal("0")).label("total_pl"),
                func.coalesce(func.sum(Trade.unrealized_pl), Decimal("0")).label("holdings_value"),
                func.count(Trade.id).label("positions_count")
            ).where(
                and_(
                    Trade.trading_account_id.in_(account_ids),
                    Trade.user_id == user_id,
                    cast(Trade.status, String) != "CLOSED",
                    Trade.deleted_at.is_(None)
                )
            )
            
            trade_stats_result = await db.execute(trade_stats_stmt)
            trade_stats_row = trade_stats_result.first()
            
            if trade_stats_row:
                total_unrealized_pl = trade_stats_row.total_pl or Decimal("0")
                total_holdings_value = trade_stats_row.holdings_value or Decimal("0")
                total_positions = trade_stats_row.positions_count or 0
        
        # Calculate total_account_value = total_cash_balance + total_holdings_value
        total_account_value = total_cash_balance + total_holdings_value
        
        return TradingAccountSummaryResponse(
            total_accounts=total_accounts,
            active_accounts=active_accounts,
            total_account_value=total_account_value,
            total_cash_balance=total_cash_balance,
            total_holdings_value=total_holdings_value,
            total_unrealized_pl=total_unrealized_pl,
            total_positions=total_positions
        )
    
    async def get_trading_account_by_id(
        self,
        user_id: uuid.UUID,
        trading_account_id: str,
        db: AsyncSession
    ) -> TradingAccountResponse:
        """
        Get single trading account by ID.
        
        Args:
            user_id: User UUID
            trading_account_id: Trading account ULID
            db: Database session
            
        Returns:
            TradingAccountResponse
            
        Raises:
            HTTPExceptionWithCode: If trading account not found or access denied
        """
        try:
            account_uuid = ulid_to_uuid(trading_account_id)
        except Exception as e:
            logger.warning(f"Invalid trading_account_id ULID: {trading_account_id}")
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid trading_account_id format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
            )
        
        stmt = select(TradingAccount).where(
            and_(
                TradingAccount.id == account_uuid,
                TradingAccount.user_id == user_id,
                TradingAccount.deleted_at.is_(None)
            )
        )
        
        result = await db.execute(stmt)
        account = result.scalar_one_or_none()
        
        if not account:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Trading account not found",
                error_code=ErrorCodes.USER_NOT_FOUND
            )
        
        # Calculate positions_count and total_pl
        account_ids = [account.id]
        trade_stats_stmt = select(
            Trade.trading_account_id,
            func.count(Trade.id).label("positions_count"),
            func.coalesce(func.sum(Trade.unrealized_pl), Decimal("0")).label("total_pl"),
            func.coalesce(func.sum(Trade.unrealized_pl), Decimal("0")).label("holdings_value")
        ).where(
            and_(
                Trade.trading_account_id.in_(account_ids),
                Trade.user_id == user_id,
                cast(Trade.status, String) != "CLOSED",
                Trade.deleted_at.is_(None)
            )
        ).group_by(Trade.trading_account_id)
        
        trade_stats_result = await db.execute(trade_stats_stmt)
        trade_stats_row = trade_stats_result.first()
        
        stats = {
            "positions_count": trade_stats_row.positions_count or 0 if trade_stats_row else 0,
            "total_pl": trade_stats_row.total_pl or Decimal("0") if trade_stats_row else Decimal("0"),
            "holdings_value": trade_stats_row.holdings_value or Decimal("0") if trade_stats_row else Decimal("0")
        }
        
        account_value = account.cash_balance + stats["holdings_value"]
        
        canonical_status = STATUS_ACTIVE if account.is_active else STATUS_INACTIVE
        return TradingAccountResponse(
            external_ulid=uuid_to_ulid(account.id),
            account_name=account.account_name,
            broker=account.broker,
            currency=account.currency,
            cash_balance=account.cash_balance,
            positions_count=stats["positions_count"],
            total_pl=stats["total_pl"],
            account_value=account_value,
            holdings_value=stats["holdings_value"],
            status=canonical_status,
            is_active=account.is_active,
            updated_at=account.updated_at
        )
    
    async def create_trading_account(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        account_name: str,
        initial_balance: Decimal,
        currency: str = "USD",
        broker: Optional[str] = None,
        account_number: Optional[str] = None,
        is_active: bool = True,
        external_account_id: Optional[str] = None,
        account_metadata: Optional[dict] = None
    ) -> TradingAccountResponse:
        """
        Create new trading account.
        
        Args:
            user_id: User UUID
            db: Database session
            account_name: Account display name
            initial_balance: Initial account balance
            currency: Currency code (default: USD)
            broker: Broker name (optional)
            account_number: Account number (optional)
            is_active: Account active status (default: True)
            external_account_id: External account ID (optional)
            account_metadata: Additional metadata (optional)
            
        Returns:
            TradingAccountResponse
            
        Raises:
            HTTPExceptionWithCode: If account name already exists for user
        """
        # Check for duplicate account name (unique per user)
        stmt_name = select(TradingAccount).where(
            and_(
                TradingAccount.user_id == user_id,
                TradingAccount.account_name == account_name.strip(),
                TradingAccount.deleted_at.is_(None)
            )
        )
        if (await db.execute(stmt_name)).scalar_one_or_none():
            raise HTTPExceptionWithCode(
                status_code=400,
                detail=f"Trading account with name '{account_name.strip()}' already exists",
                error_code=ErrorCodes.ACCOUNT_NAME_DUPLICATE
            )
        
        # Check for duplicate account number (unique per user) — required on create
        acc_num = (account_number or "").strip()
        if acc_num:
            stmt_num = select(TradingAccount).where(
                and_(
                    TradingAccount.user_id == user_id,
                    TradingAccount.account_number == acc_num,
                    TradingAccount.deleted_at.is_(None)
                )
            )
            if (await db.execute(stmt_num)).scalar_one_or_none():
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail=f"Trading account with number '{acc_num}' already exists",
                    error_code=ErrorCodes.ACCOUNT_NUMBER_DUPLICATE
                )
        
        # Create new trading account
        new_account = TradingAccount(
            user_id=user_id,
            account_name=account_name.strip(),
            broker=(broker or "").strip() or None,
            account_number=acc_num or None,
            initial_balance=initial_balance,
            cash_balance=initial_balance,  # Start with initial balance
            currency=currency.upper(),
            is_active=is_active,
            external_account_id=external_account_id.strip() if external_account_id else None,
            created_by=user_id,
            updated_by=user_id,
            account_metadata=account_metadata or {}
        )
        
        db.add(new_account)
        await db.commit()
        await db.refresh(new_account)
        
        # Return response with calculated fields (positions_count = 0 for new account)
        canonical_status = STATUS_ACTIVE if new_account.is_active else STATUS_INACTIVE
        return TradingAccountResponse(
            external_ulid=uuid_to_ulid(new_account.id),
            account_name=new_account.account_name,
            broker=new_account.broker,
            currency=new_account.currency,
            cash_balance=new_account.cash_balance,
            positions_count=0,
            total_pl=Decimal("0"),
            account_value=new_account.cash_balance,
            holdings_value=Decimal("0"),
            status=canonical_status,
            is_active=new_account.is_active,
            updated_at=new_account.updated_at
        )
    
    async def update_trading_account(
        self,
        user_id: uuid.UUID,
        trading_account_id: str,
        db: AsyncSession,
        account_name: Optional[str] = None,
        broker: Optional[str] = None,
        account_number: Optional[str] = None,
        initial_balance: Optional[Decimal] = None,
        currency: Optional[str] = None,
        is_active: Optional[bool] = None,
        external_account_id: Optional[str] = None,
        account_metadata: Optional[dict] = None
    ) -> TradingAccountResponse:
        """
        Update existing trading account.
        
        Args:
            user_id: User UUID
            trading_account_id: Trading account ULID
            db: Database session
            account_name: Account display name (optional)
            broker: Broker name (optional)
            account_number: Account number (optional)
            initial_balance: Initial account balance (optional)
            currency: Currency code (optional)
            is_active: Account active status (optional)
            external_account_id: External account ID (optional)
            account_metadata: Additional metadata (optional)
            
        Returns:
            TradingAccountResponse
            
        Raises:
            HTTPExceptionWithCode: If trading account not found or access denied
        """
        try:
            account_uuid = ulid_to_uuid(trading_account_id)
        except Exception as e:
            logger.warning(f"Invalid trading_account_id ULID: {trading_account_id}")
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid trading_account_id format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
            )
        
        stmt = select(TradingAccount).where(
            and_(
                TradingAccount.id == account_uuid,
                TradingAccount.user_id == user_id,
                TradingAccount.deleted_at.is_(None)
            )
        )
        
        result = await db.execute(stmt)
        account = result.scalar_one_or_none()
        
        if not account:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Trading account not found",
                error_code=ErrorCodes.USER_NOT_FOUND
            )
        
        # Update fields if provided
        if account_name is not None:
            # Check for duplicate account name (if changed)
            if account_name.strip() != account.account_name:
                stmt_check = select(TradingAccount).where(
                    and_(
                        TradingAccount.user_id == user_id,
                        TradingAccount.account_name == account_name.strip(),
                        TradingAccount.id != account_uuid,
                        TradingAccount.deleted_at.is_(None)
                    )
                )
                result_check = await db.execute(stmt_check)
                existing = result_check.scalar_one_or_none()
                
                if existing:
                    raise HTTPExceptionWithCode(
                        status_code=400,
                        detail=f"Trading account with name '{account_name.strip()}' already exists",
                        error_code=ErrorCodes.ACCOUNT_NAME_DUPLICATE
                    )
            account.account_name = account_name.strip()
        
        if account_number is not None:
            acc_num_new = account_number.strip()
            if acc_num_new and acc_num_new != (account.account_number or ""):
                stmt_num = select(TradingAccount).where(
                    and_(
                        TradingAccount.user_id == user_id,
                        TradingAccount.account_number == acc_num_new,
                        TradingAccount.id != account_uuid,
                        TradingAccount.deleted_at.is_(None)
                    )
                )
                if (await db.execute(stmt_num)).scalar_one_or_none():
                    raise HTTPExceptionWithCode(
                        status_code=400,
                        detail=f"Trading account with number '{acc_num_new}' already exists",
                        error_code=ErrorCodes.ACCOUNT_NUMBER_DUPLICATE
                    )
            account.account_number = acc_num_new if acc_num_new else None
        
        if broker is not None:
            account.broker = broker.strip() if broker else None
        
        if account_number is not None:
            account.account_number = account_number.strip() if account_number else None
        
        if initial_balance is not None:
            account.initial_balance = initial_balance
        
        if currency is not None:
            account.currency = currency.upper()
        
        if is_active is not None:
            account.is_active = is_active
        
        if external_account_id is not None:
            account.external_account_id = external_account_id.strip() if external_account_id else None
        
        if account_metadata is not None:
            # Merge with existing metadata
            existing_metadata = account.account_metadata or {}
            existing_metadata.update(account_metadata)
            account.account_metadata = existing_metadata
        
        # Update updated_by
        account.updated_by = user_id
        
        await db.commit()
        await db.refresh(account)
        
        # Calculate positions_count and total_pl for response
        account_ids = [account.id]
        trade_stats_stmt = select(
            Trade.trading_account_id,
            func.count(Trade.id).label("positions_count"),
            func.coalesce(func.sum(Trade.unrealized_pl), Decimal("0")).label("total_pl"),
            func.coalesce(func.sum(Trade.unrealized_pl), Decimal("0")).label("holdings_value")
        ).where(
            and_(
                Trade.trading_account_id.in_(account_ids),
                Trade.user_id == user_id,
                cast(Trade.status, String) != "CLOSED",
                Trade.deleted_at.is_(None)
            )
        ).group_by(Trade.trading_account_id)
        
        trade_stats_result = await db.execute(trade_stats_stmt)
        trade_stats_row = trade_stats_result.first()
        
        stats = {
            "positions_count": trade_stats_row.positions_count or 0 if trade_stats_row else 0,
            "total_pl": trade_stats_row.total_pl or Decimal("0") if trade_stats_row else Decimal("0"),
            "holdings_value": trade_stats_row.holdings_value or Decimal("0") if trade_stats_row else Decimal("0")
        }
        
        account_value = account.cash_balance + stats["holdings_value"]
        
        canonical_status = STATUS_ACTIVE if account.is_active else STATUS_INACTIVE
        return TradingAccountResponse(
            external_ulid=uuid_to_ulid(account.id),
            account_name=account.account_name,
            broker=account.broker,
            currency=account.currency,
            cash_balance=account.cash_balance,
            positions_count=stats["positions_count"],
            total_pl=stats["total_pl"],
            account_value=account_value,
            holdings_value=stats["holdings_value"],
            status=canonical_status,
            is_active=account.is_active,
            updated_at=account.updated_at
        )
    
    async def delete_trading_account(
        self,
        user_id: uuid.UUID,
        trading_account_id: str,
        db: AsyncSession
    ) -> None:
        """
        Soft delete trading account.
        
        Args:
            user_id: User UUID
            trading_account_id: Trading account ULID
            db: Database session
            
        Raises:
            HTTPExceptionWithCode: If trading account not found or access denied
        """
        try:
            account_uuid = ulid_to_uuid(trading_account_id)
        except Exception as e:
            logger.warning(f"Invalid trading_account_id ULID: {trading_account_id}")
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid trading_account_id format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
            )
        
        stmt = select(TradingAccount).where(
            and_(
                TradingAccount.id == account_uuid,
                TradingAccount.user_id == user_id,
                TradingAccount.deleted_at.is_(None)
            )
        )
        
        result = await db.execute(stmt)
        account = result.scalar_one_or_none()
        
        if not account:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Trading account not found",
                error_code=ErrorCodes.USER_NOT_FOUND
            )
        
        # Soft delete
        from datetime import datetime, timezone
        account.deleted_at = datetime.now(timezone.utc)
        account.updated_by = user_id
        
        await db.commit()


# Singleton instance
_trading_account_service: Optional[TradingAccountService] = None


def get_trading_account_service() -> TradingAccountService:
    """Get global TradingAccountService instance."""
    global _trading_account_service
    if _trading_account_service is None:
        _trading_account_service = TradingAccountService()
    return _trading_account_service
