"""
Positions Service - Business Logic
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

Business logic for Positions API.
Positions are derived from trades table (aggregated by ticker_id and trading_account_id).
Calculates daily_change, unrealized_pl_percent, percent_of_account.
JOINs with market_data.tickers for symbol and current_price.
"""

import uuid
from typing import List, Optional
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, cast, String
import logging

from ..models.trades import Trade
from ..models.tickers import Ticker
from ..models.ticker_prices import TickerPrice
from ..models.trading_accounts import TradingAccount
from ..utils.identity import uuid_to_ulid, ulid_to_uuid
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..schemas.positions import PositionResponse

logger = logging.getLogger(__name__)


class PositionService:
    """
    Positions Service - Handles position queries and calculations.
    
    Features:
    - Aggregate trades by ticker_id and trading_account_id
    - JOIN with market_data.tickers for symbol and current_price
    - Calculate daily_change, unrealized_pl_percent, percent_of_account
    """
    
    async def get_positions(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        trading_account_id: Optional[str] = None
    ) -> List[PositionResponse]:
        """
        Get positions for user (aggregated from trades).
        
        Positions are open trades (status != 'CLOSED') aggregated by ticker_id and trading_account_id.
        
        Args:
            user_id: User UUID
            db: Database session
            trading_account_id: Filter by trading account ULID (optional)
            
        Returns:
            List of PositionResponse with calculated fields
        """
        # Base query conditions
        # Cast status to string for comparison (status is ENUM in DB)
        conditions = [
            Trade.user_id == user_id,
            cast(Trade.status, String) != "CLOSED",
            Trade.deleted_at.is_(None)
        ]
        
        if trading_account_id:
            try:
                account_uuid = ulid_to_uuid(trading_account_id)
                conditions.append(Trade.trading_account_id == account_uuid)
            except Exception as e:
                logger.warning(f"Invalid trading_account_id ULID: {trading_account_id}")
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Invalid trading_account_id format",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
                )
        
        # Aggregate trades by ticker_id and trading_account_id
        # Note: We'll need to JOIN with market_data.tickers for symbol and current_price
        # For now, we'll use a subquery approach
        
        # Step 1: Aggregate trades
        agg_stmt = select(
            Trade.ticker_id,
            Trade.trading_account_id,
            Trade.direction,
            func.sum(Trade.quantity).label("quantity"),
            func.avg(Trade.avg_entry_price).label("avg_price"),
            func.sum(Trade.unrealized_pl).label("unrealized_pl"),
            func.max(Trade.status).label("status")  # Use max to get a single status
        ).where(
            and_(*conditions)
        ).group_by(
            Trade.ticker_id,
            Trade.trading_account_id,
            Trade.direction
        )
        
        result = await db.execute(agg_stmt)
        aggregated_positions = result.all()
        
        if not aggregated_positions:
            return []
        
        # Step 2: Get ticker information and current prices
        ticker_ids = [pos.ticker_id for pos in aggregated_positions]
        account_ids = list(set([pos.trading_account_id for pos in aggregated_positions]))
        
        # Get ticker symbols
        ticker_stmt = select(
            Ticker.id,
            Ticker.symbol
        ).where(
            and_(
                Ticker.id.in_(ticker_ids),
                Ticker.deleted_at.is_(None)
            )
        )
        ticker_result = await db.execute(ticker_stmt)
        ticker_map = {row.id: row.symbol for row in ticker_result.all()}
        
        # Get latest prices for each ticker
        # Use subquery to get latest price per ticker
        latest_price_subq = select(
            TickerPrice.ticker_id,
            func.max(TickerPrice.price_timestamp).label("max_timestamp")
        ).where(
            TickerPrice.ticker_id.in_(ticker_ids)
        ).group_by(TickerPrice.ticker_id).subquery()
        
        price_stmt = select(
            TickerPrice.ticker_id,
            TickerPrice.price.label("current_price"),
            TickerPrice.close_price.label("previous_close")
        ).join(
            latest_price_subq,
            and_(
                TickerPrice.ticker_id == latest_price_subq.c.ticker_id,
                TickerPrice.price_timestamp == latest_price_subq.c.max_timestamp
            )
        )
        price_result = await db.execute(price_stmt)
        price_map = {
            row.ticker_id: {
                "current_price": row.current_price or Decimal("0"),
                "previous_close": row.previous_close or row.current_price or Decimal("0")
            }
            for row in price_result.all()
        }
        
        # Get account values
        account_stmt = select(
            TradingAccount.id,
            TradingAccount.cash_balance
        ).where(
            and_(
                TradingAccount.id.in_(account_ids),
                TradingAccount.user_id == user_id,
                TradingAccount.deleted_at.is_(None)
            )
        )
        account_result = await db.execute(account_stmt)
        
        # Calculate account_value for each account (cash_balance + holdings_value)
        # We need to get holdings_value from trades
        holdings_stmt = select(
            Trade.trading_account_id,
            func.coalesce(func.sum(Trade.unrealized_pl), Decimal("0")).label("holdings_value")
        ).where(
            and_(
                Trade.trading_account_id.in_(account_ids),
                Trade.user_id == user_id,
                Trade.status != "CLOSED",
                Trade.deleted_at.is_(None)
            )
        ).group_by(Trade.trading_account_id)
        holdings_result = await db.execute(holdings_stmt)
        holdings_map = {
            row.trading_account_id: row.holdings_value or Decimal("0")
            for row in holdings_result.all()
        }
        
        account_value_map = {}
        for account in account_result.all():
            holdings_value = holdings_map.get(account.id, Decimal("0"))
            account_value_map[account.id] = account.cash_balance + holdings_value
        
        # Step 3: Build response with all calculated fields
        responses = []
        for pos in aggregated_positions:
            symbol = ticker_map.get(pos.ticker_id, "UNKNOWN")
            price_data = price_map.get(pos.ticker_id, {
                "current_price": Decimal("0"),
                "previous_close": Decimal("0")
            })
            current_price = price_data["current_price"]
            previous_close = price_data["previous_close"]
            
            # Calculate daily_change
            daily_change = current_price - previous_close if previous_close > 0 else Decimal("0")
            daily_change_percent = (
                (daily_change / previous_close * 100) if previous_close > 0 else Decimal("0")
            )
            
            # Calculate market_value
            quantity = pos.quantity or Decimal("0")
            market_value = quantity * current_price if current_price > 0 else Decimal("0")
            
            # Calculate unrealized_pl_percent
            avg_price = pos.avg_price or Decimal("0")
            cost_basis = quantity * avg_price if avg_price > 0 else Decimal("0")
            unrealized_pl = pos.unrealized_pl or Decimal("0")
            unrealized_pl_percent = (
                (unrealized_pl / cost_basis * 100) if cost_basis > 0 else Decimal("0")
            )
            
            # Calculate percent_of_account
            account_value = account_value_map.get(pos.trading_account_id, Decimal("0"))
            percent_of_account = (
                (market_value / account_value * 100) if account_value > 0 else Decimal("0")
            )
            
            response = PositionResponse(
                external_ulid=uuid_to_ulid(pos.ticker_id),
                symbol=symbol,
                ticker_id=uuid_to_ulid(pos.ticker_id),
                quantity=quantity,
                avg_entry_price=avg_price,
                current_price=current_price,
                daily_change=daily_change,
                daily_change_percent=daily_change_percent,
                market_value=market_value,
                unrealized_pl=unrealized_pl,
                unrealized_pl_percent=unrealized_pl_percent,
                percent_of_account=percent_of_account,
                status=pos.status or "OPEN",
                direction=pos.direction or "LONG"
            )
            responses.append(response)
        
        return responses


# Singleton instance
_position_service: Optional[PositionService] = None


def get_position_service() -> PositionService:
    """Get global PositionService instance."""
    global _position_service
    if _position_service is None:
        _position_service = PositionService()
    return _position_service
