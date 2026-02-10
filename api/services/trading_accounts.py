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
from ..utils.identity import uuid_to_ulid
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..schemas.trading_accounts import TradingAccountResponse, TradingAccountSummaryResponse

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


# Singleton instance
_trading_account_service: Optional[TradingAccountService] = None


def get_trading_account_service() -> TradingAccountService:
    """Get global TradingAccountService instance."""
    global _trading_account_service
    if _trading_account_service is None:
        _trading_account_service = TradingAccountService()
    return _trading_account_service
