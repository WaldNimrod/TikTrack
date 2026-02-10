"""
Cash Flows Service - Business Logic
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

Business logic for Cash Flows API.
Calculates summary (total_deposits, total_withdrawals, net_flow).
Extracts subtype and status from metadata JSONB.
"""

import uuid
from datetime import date, datetime
from typing import List, Optional
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, case, cast, String
from sqlalchemy.dialects.postgresql import JSONB
import logging

from ..models.cash_flows import CashFlow
from ..models.trading_accounts import TradingAccount
from ..utils.identity import uuid_to_ulid, ulid_to_uuid
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..schemas.cash_flows import (
    CashFlowResponse,
    CashFlowSummaryResponse,
    CurrencyConversionResponse
)

logger = logging.getLogger(__name__)


class CashFlowService:
    """
    Cash Flows Service - Handles cash flow queries and summary calculations.
    
    Features:
    - List cash flows with filters (trading_account_id, date_from, date_to, flow_type)
    - Calculate summary (total_deposits, total_withdrawals, net_flow)
    - Extract subtype and status from metadata JSONB
    - JOIN with trading_accounts for account_name
    """
    
    async def get_cash_flows(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        trading_account_id: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        flow_type: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[CashFlowResponse]:
        """
        Get cash flows for user with filters.
        
        Args:
            user_id: User UUID
            db: Database session
            trading_account_id: Filter by trading account ULID (optional)
            date_from: Filter by transaction_date >= date_from (optional)
            date_to: Filter by transaction_date <= date_to (optional)
            flow_type: Filter by flow_type (optional)
            
        Returns:
            List of CashFlowResponse
        """
        # Base query
        conditions = [
            CashFlow.user_id == user_id,
            CashFlow.deleted_at.is_(None)
        ]
        
        if trading_account_id:
            try:
                account_uuid = ulid_to_uuid(trading_account_id)
                conditions.append(CashFlow.trading_account_id == account_uuid)
            except Exception as e:
                logger.warning(f"Invalid trading_account_id ULID: {trading_account_id}")
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Invalid trading_account_id format",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
                )
        
        if date_from:
            conditions.append(CashFlow.transaction_date >= date_from)
        
        if date_to:
            conditions.append(CashFlow.transaction_date <= date_to)
        
        if flow_type:
            conditions.append(CashFlow.flow_type == flow_type)
        
        # Search in description and external_reference
        if search:
            conditions.append(
                or_(
                    CashFlow.description.ilike(f"%{search}%"),
                    CashFlow.external_reference.ilike(f"%{search}%")
                )
            )
        
        # LEFT JOIN with trading_accounts to get account_name
        # Use LEFT JOIN to handle cases where trading_accounts might not exist
        stmt = select(
            CashFlow,
            TradingAccount.account_name
        ).outerjoin(
            TradingAccount,
            CashFlow.trading_account_id == TradingAccount.id
        ).where(
            and_(*conditions)
        ).order_by(CashFlow.transaction_date.desc())
        
        result = await db.execute(stmt)
        rows = result.all()
        
        # Build response
        responses = []
        for cash_flow, account_name in rows:
            # Extract subtype and status from metadata JSONB
            metadata = cash_flow.flow_metadata or {}
            subtype = metadata.get("subtype")
            status = metadata.get("status")
            
            response = CashFlowResponse(
                external_ulid=uuid_to_ulid(cash_flow.id),
                transaction_date=cash_flow.transaction_date,
                flow_type=cash_flow.flow_type,
                subtype=subtype,
                trading_account_id=uuid_to_ulid(cash_flow.trading_account_id),
                account_name=account_name,
                amount=cash_flow.amount,
                currency=cash_flow.currency,
                status=status,
                description=cash_flow.description
            )
            responses.append(response)
        
        return responses
    
    async def get_cash_flows_summary(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        trading_account_id: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None
    ) -> CashFlowSummaryResponse:
        """
        Get cash flows summary (total_deposits, total_withdrawals, net_flow).
        
        Args:
            user_id: User UUID
            db: Database session
            trading_account_id: Filter by trading account ULID (optional)
            date_from: Filter by transaction_date >= date_from (optional)
            date_to: Filter by transaction_date <= date_to (optional)
            
        Returns:
            CashFlowSummaryResponse
        """
        # Base query
        conditions = [
            CashFlow.user_id == user_id,
            CashFlow.deleted_at.is_(None)
        ]
        
        if trading_account_id:
            try:
                account_uuid = ulid_to_uuid(trading_account_id)
                conditions.append(CashFlow.trading_account_id == account_uuid)
            except Exception as e:
                logger.warning(f"Invalid trading_account_id ULID: {trading_account_id}")
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Invalid trading_account_id format",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
                )
        
        if date_from:
            conditions.append(CashFlow.transaction_date >= date_from)
        
        if date_to:
            conditions.append(CashFlow.transaction_date <= date_to)
        
        # Calculate totals by flow_type
        stmt = select(
            CashFlow.flow_type,
            func.sum(CashFlow.amount).label("total")
        ).where(
            and_(*conditions)
        ).group_by(CashFlow.flow_type)
        
        result = await db.execute(stmt)
        rows = result.all()
        
        # Calculate totals
        total_deposits = Decimal("0")
        total_withdrawals = Decimal("0")
        
        for flow_type, total in rows:
            if flow_type == "DEPOSIT":
                total_deposits = total or Decimal("0")
            elif flow_type == "WITHDRAWAL":
                total_withdrawals = total or Decimal("0")
        
        net_flow = total_deposits - total_withdrawals
        
        return CashFlowSummaryResponse(
            total_deposits=total_deposits,
            total_withdrawals=total_withdrawals,
            net_flow=net_flow
        )
    
    async def get_cash_flow_by_id(
        self,
        user_id: uuid.UUID,
        cash_flow_id: str,
        db: AsyncSession
    ) -> CashFlowResponse:
        """
        Get single cash flow by ID.
        
        Args:
            user_id: User UUID
            cash_flow_id: Cash flow ULID
            db: Database session
            
        Returns:
            CashFlowResponse
            
        Raises:
            HTTPExceptionWithCode: If cash flow not found or access denied
        """
        try:
            flow_uuid = ulid_to_uuid(cash_flow_id)
        except Exception as e:
            logger.warning(f"Invalid cash_flow_id ULID: {cash_flow_id}")
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid cash_flow_id format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
            )
        
        stmt = select(
            CashFlow,
            TradingAccount.account_name
        ).outerjoin(
            TradingAccount,
            CashFlow.trading_account_id == TradingAccount.id
        ).where(
            and_(
                CashFlow.id == flow_uuid,
                CashFlow.user_id == user_id,
                CashFlow.deleted_at.is_(None)
            )
        )
        
        result = await db.execute(stmt)
        row = result.first()
        
        if not row:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Cash flow not found",
                error_code=ErrorCodes.USER_NOT_FOUND
            )
        
        cash_flow, account_name = row
        
        # Extract subtype and status from metadata JSONB
        metadata = cash_flow.flow_metadata or {}
        subtype = metadata.get("subtype")
        status = metadata.get("status")
        
        return CashFlowResponse(
            external_ulid=uuid_to_ulid(cash_flow.id),
            transaction_date=cash_flow.transaction_date,
            flow_type=cash_flow.flow_type,
            subtype=subtype,
            trading_account_id=uuid_to_ulid(cash_flow.trading_account_id),
            account_name=account_name or "",
            amount=cash_flow.amount,
            currency=cash_flow.currency,
            status=status,
            description=cash_flow.description
        )
    
    async def create_cash_flow(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        trading_account_id: str,
        flow_type: str,
        amount: Decimal,
        currency: str,
        transaction_date: date,
        description: Optional[str] = None,
        external_reference: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> CashFlowResponse:
        """
        Create new cash flow.
        
        Args:
            user_id: User UUID
            db: Database session
            trading_account_id: Trading account ULID
            flow_type: Flow type (DEPOSIT, WITHDRAWAL, etc.)
            amount: Transaction amount
            currency: Currency code
            transaction_date: Transaction date
            description: Transaction description (optional)
            external_reference: External system reference (optional)
            metadata: Additional metadata (optional)
            
        Returns:
            CashFlowResponse
        """
        # Validate flow_type
        valid_flow_types = ('DEPOSIT', 'WITHDRAWAL', 'DIVIDEND', 'INTEREST', 'FEE', 'OTHER')
        flow_type_upper = flow_type.upper()
        if flow_type_upper not in valid_flow_types:
            raise HTTPExceptionWithCode(
                status_code=400,
                detail=f"Invalid flow_type. Must be one of: {', '.join(valid_flow_types)}",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
            )
        
        # Convert trading_account_id to UUID
        try:
            account_uuid = ulid_to_uuid(trading_account_id)
        except Exception as e:
            logger.warning(f"Invalid trading_account_id ULID: {trading_account_id}")
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid trading_account_id format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
            )
        
        # Create new cash flow
        new_flow = CashFlow(
            user_id=user_id,
            trading_account_id=account_uuid,
            flow_type=flow_type_upper,
            amount=amount,
            currency=currency.upper(),
            transaction_date=transaction_date,
            description=description,
            external_reference=external_reference,
            created_by=user_id,
            updated_by=user_id,
            flow_metadata=metadata or {}
        )
        
        db.add(new_flow)
        await db.commit()
        await db.refresh(new_flow)
        
        # Get account name
        stmt = select(TradingAccount.account_name).where(
            TradingAccount.id == account_uuid
        )
        result = await db.execute(stmt)
        account_name = result.scalar_one_or_none() or ""
        
        # Extract subtype and status from metadata
        metadata_dict = new_flow.flow_metadata or {}
        subtype = metadata_dict.get("subtype")
        status = metadata_dict.get("status")
        
        return CashFlowResponse(
            external_ulid=uuid_to_ulid(new_flow.id),
            transaction_date=new_flow.transaction_date,
            flow_type=new_flow.flow_type,
            subtype=subtype,
            trading_account_id=uuid_to_ulid(new_flow.trading_account_id),
            account_name=account_name,
            amount=new_flow.amount,
            currency=new_flow.currency,
            status=status,
            description=new_flow.description
        )
    
    async def update_cash_flow(
        self,
        user_id: uuid.UUID,
        cash_flow_id: str,
        db: AsyncSession,
        trading_account_id: Optional[str] = None,
        flow_type: Optional[str] = None,
        amount: Optional[Decimal] = None,
        currency: Optional[str] = None,
        transaction_date: Optional[date] = None,
        description: Optional[str] = None,
        external_reference: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> CashFlowResponse:
        """
        Update existing cash flow.
        
        Args:
            user_id: User UUID
            cash_flow_id: Cash flow ULID
            db: Database session
            trading_account_id: Trading account ULID (optional)
            flow_type: Flow type (optional)
            amount: Transaction amount (optional)
            currency: Currency code (optional)
            transaction_date: Transaction date (optional)
            description: Transaction description (optional)
            external_reference: External system reference (optional)
            metadata: Additional metadata (optional)
            
        Returns:
            CashFlowResponse
            
        Raises:
            HTTPExceptionWithCode: If cash flow not found or access denied
        """
        try:
            flow_uuid = ulid_to_uuid(cash_flow_id)
        except Exception as e:
            logger.warning(f"Invalid cash_flow_id ULID: {cash_flow_id}")
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid cash_flow_id format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
            )
        
        stmt = select(CashFlow).where(
            and_(
                CashFlow.id == flow_uuid,
                CashFlow.user_id == user_id,
                CashFlow.deleted_at.is_(None)
            )
        )
        
        result = await db.execute(stmt)
        cash_flow = result.scalar_one_or_none()
        
        if not cash_flow:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Cash flow not found",
                error_code=ErrorCodes.USER_NOT_FOUND
            )
        
        # Update fields if provided
        if trading_account_id is not None:
            try:
                account_uuid = ulid_to_uuid(trading_account_id)
                cash_flow.trading_account_id = account_uuid
            except Exception as e:
                logger.warning(f"Invalid trading_account_id ULID: {trading_account_id}")
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Invalid trading_account_id format",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
                )
        
        if flow_type is not None:
            flow_type_upper = flow_type.upper()
            valid_flow_types = ('DEPOSIT', 'WITHDRAWAL', 'DIVIDEND', 'INTEREST', 'FEE', 'OTHER')
            if flow_type_upper not in valid_flow_types:
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail=f"Invalid flow_type. Must be one of: {', '.join(valid_flow_types)}",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
                )
            cash_flow.flow_type = flow_type_upper
        
        if amount is not None:
            cash_flow.amount = amount
        
        if currency is not None:
            cash_flow.currency = currency.upper()
        
        if transaction_date is not None:
            cash_flow.transaction_date = transaction_date
        
        if description is not None:
            cash_flow.description = description
        
        if external_reference is not None:
            cash_flow.external_reference = external_reference
        
        if metadata is not None:
            # Merge with existing metadata
            existing_metadata = cash_flow.flow_metadata or {}
            existing_metadata.update(metadata)
            cash_flow.flow_metadata = existing_metadata
        
        # Update updated_by
        cash_flow.updated_by = user_id
        
        await db.commit()
        await db.refresh(cash_flow)
        
        # Get account name
        stmt = select(TradingAccount.account_name).where(
            TradingAccount.id == cash_flow.trading_account_id
        )
        result = await db.execute(stmt)
        account_name = result.scalar_one_or_none() or ""
        
        # Extract subtype and status from metadata
        metadata_dict = cash_flow.flow_metadata or {}
        subtype = metadata_dict.get("subtype")
        status = metadata_dict.get("status")
        
        return CashFlowResponse(
            external_ulid=uuid_to_ulid(cash_flow.id),
            transaction_date=cash_flow.transaction_date,
            flow_type=cash_flow.flow_type,
            subtype=subtype,
            trading_account_id=uuid_to_ulid(cash_flow.trading_account_id),
            account_name=account_name,
            amount=cash_flow.amount,
            currency=cash_flow.currency,
            status=status,
            description=cash_flow.description
        )
    
    async def delete_cash_flow(
        self,
        user_id: uuid.UUID,
        cash_flow_id: str,
        db: AsyncSession
    ) -> None:
        """
        Soft delete cash flow.
        
        Args:
            user_id: User UUID
            cash_flow_id: Cash flow ULID
            db: Database session
            
        Raises:
            HTTPExceptionWithCode: If cash flow not found or access denied
        """
        try:
            flow_uuid = ulid_to_uuid(cash_flow_id)
        except Exception as e:
            logger.warning(f"Invalid cash_flow_id ULID: {cash_flow_id}")
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid cash_flow_id format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
            )
        
        stmt = select(CashFlow).where(
            and_(
                CashFlow.id == flow_uuid,
                CashFlow.user_id == user_id,
                CashFlow.deleted_at.is_(None)
            )
        )
        
        result = await db.execute(stmt)
        cash_flow = result.scalar_one_or_none()
        
        if not cash_flow:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Cash flow not found",
                error_code=ErrorCodes.USER_NOT_FOUND
            )
        
        # Soft delete
        cash_flow.deleted_at = datetime.now()
        cash_flow.updated_by = user_id
        
        await db.commit()
    
    async def get_currency_conversions(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        trading_account_id: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None
    ) -> List[CurrencyConversionResponse]:
        """
        Get currency conversions for user with filters.
        
        Currency conversions are transactions where currency differs from account base currency,
        or transactions explicitly marked as conversions in metadata.
        
        Args:
            user_id: User UUID
            db: Database session
            trading_account_id: Filter by trading account ULID (optional)
            date_from: Filter by transaction_date >= date_from (optional)
            date_to: Filter by transaction_date <= date_to (optional)
            
        Returns:
            List of CurrencyConversionResponse
        """
        # Base query conditions
        conditions = [
            CashFlow.user_id == user_id,
            CashFlow.deleted_at.is_(None)
        ]
        
        # Handle trading_account_id filter (optional)
        # If provided but invalid, ignore the filter instead of returning 400
        if trading_account_id and trading_account_id.strip():
            try:
                account_uuid = ulid_to_uuid(trading_account_id.strip())
                conditions.append(CashFlow.trading_account_id == account_uuid)
            except Exception as e:
                # Invalid ULID format - log warning but don't fail
                # This allows the endpoint to work even with invalid filter values
                logger.warning(
                    f"Invalid trading_account_id ULID format: {trading_account_id}. "
                    f"Ignoring filter and returning all conversions for user."
                )
                # Don't add filter condition - return all conversions for user
        
        if date_from:
            conditions.append(CashFlow.transaction_date >= date_from)
        
        if date_to:
            conditions.append(CashFlow.transaction_date <= date_to)
        
        # Query for transactions that are currency conversions
        # Filter by metadata containing conversion info, or by currency != USD (default)
        # For now, we'll return transactions with non-USD currency or with conversion metadata
        stmt = select(
            CashFlow,
            TradingAccount.account_name
        ).outerjoin(
            TradingAccount,
            CashFlow.trading_account_id == TradingAccount.id
        ).where(
            and_(*conditions)
        ).order_by(CashFlow.transaction_date.desc())
        
        result = await db.execute(stmt)
        rows = result.all()
        
        conversions = []
        for cash_flow, account_name in rows:
            metadata = cash_flow.flow_metadata or {}
            
            # Check if this is a conversion transaction
            # If metadata has conversion info, use it
            # Otherwise, if currency != USD, treat as conversion
            if metadata.get("conversion") or cash_flow.currency != "USD":
                from_currency = metadata.get("from_currency") or "USD"
                to_currency = cash_flow.currency
                from_amount = metadata.get("from_amount")
                rate = metadata.get("rate")
                
                # If no conversion metadata, assume USD -> currency conversion
                if from_amount is None:
                    from_amount = cash_flow.amount
                    # Default rate: 1.0 (would need exchange rate service for real rates)
                    rate = Decimal("1.0")
                
                conversions.append(CurrencyConversionResponse(
                    id=uuid_to_ulid(cash_flow.id),
                    date=cash_flow.transaction_date,
                    account=account_name or "",
                    from_currency=from_currency,
                    from_amount=Decimal(str(from_amount)),
                    to_currency=to_currency,
                    to_amount=cash_flow.amount,
                    rate=Decimal(str(rate)) if rate else Decimal("1.0")
                ))
        
        return conversions


# Singleton instance
_cash_flow_service: Optional[CashFlowService] = None


def get_cash_flow_service() -> CashFlowService:
    """Get global CashFlowService instance."""
    global _cash_flow_service
    if _cash_flow_service is None:
        _cash_flow_service = CashFlowService()
    return _cash_flow_service
