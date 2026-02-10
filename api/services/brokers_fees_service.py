"""
Brokers Fees Service - Business Logic
Task: Phase 2.1 - Brokers Fees (D18)
Status: IN PROGRESS

Business logic for Brokers Fees API.
Handles CRUD operations for broker fees with filtering and search.
"""

import uuid
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, String
import logging

from ..models.brokers_fees import BrokerFee
from ..utils.identity import uuid_to_ulid, ulid_to_uuid
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..schemas.brokers_fees import BrokerFeeResponse, BrokerFeeSummaryResponse

logger = logging.getLogger(__name__)


class BrokersFeesService:
    """
    Brokers Fees Service - Handles broker fees CRUD operations.
    
    Features:
    - List broker fees with filters (broker, commission_type, search)
    - Get single broker fee by ID
    - Create new broker fee
    - Update existing broker fee
    - Soft delete broker fee
    """
    
    async def get_brokers_fees(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        broker: Optional[str] = None,
        commission_type: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[BrokerFeeResponse]:
        """
        Get broker fees for user with filters.
        
        Args:
            user_id: User UUID
            db: Database session
            broker: Filter by broker name (optional)
            commission_type: Filter by commission type (TIERED/FLAT) (optional)
            search: Search in broker name and commission_value (optional)
            
        Returns:
            List of BrokerFeeResponse
        """
        # Base query conditions
        conditions = [
            BrokerFee.user_id == user_id,
            BrokerFee.deleted_at.is_(None)
        ]
        
        # Filter by broker name
        if broker:
            conditions.append(BrokerFee.broker.ilike(f"%{broker}%"))
        
        # Filter by commission_type
        if commission_type:
            # Normalize to uppercase
            commission_type_upper = commission_type.upper()
            if commission_type_upper in ('TIERED', 'FLAT'):
                conditions.append(BrokerFee.commission_type == commission_type_upper)
            else:
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Invalid commission_type. Must be 'TIERED' or 'FLAT'",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
                )
        
        # Search in broker name and commission_value (cast numeric to text for search)
        if search:
            conditions.append(
                or_(
                    BrokerFee.broker.ilike(f"%{search}%"),
                    func.cast(BrokerFee.commission_value, String).ilike(f"%{search}%")
                )
            )
        
        # Build query
        stmt = select(BrokerFee).where(
            and_(*conditions)
        ).order_by(BrokerFee.created_at.desc())
        
        result = await db.execute(stmt)
        broker_fees = list(result.scalars().all())
        
        # Convert to response format
        responses = []
        for fee in broker_fees:
            response = BrokerFeeResponse(
                id=uuid_to_ulid(fee.id),
                broker=fee.broker,
                commission_type=fee.commission_type.value if hasattr(fee.commission_type, 'value') else fee.commission_type,
                commission_value=fee.commission_value,
                minimum=fee.minimum,
                created_at=fee.created_at,
                updated_at=fee.updated_at
            )
            responses.append(response)
        
        return responses
    
    async def get_broker_fee_by_id(
        self,
        user_id: uuid.UUID,
        broker_fee_id: str,
        db: AsyncSession
    ) -> BrokerFeeResponse:
        """
        Get single broker fee by ID.
        
        Args:
            user_id: User UUID
            broker_fee_id: Broker fee ULID
            db: Database session
            
        Returns:
            BrokerFeeResponse
            
        Raises:
            HTTPExceptionWithCode: If broker fee not found or access denied
        """
        try:
            fee_uuid = ulid_to_uuid(broker_fee_id)
        except Exception as e:
            logger.warning(f"Invalid broker_fee_id ULID: {broker_fee_id}")
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid broker_fee_id format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
            )
        
        stmt = select(BrokerFee).where(
            and_(
                BrokerFee.id == fee_uuid,
                BrokerFee.user_id == user_id,
                BrokerFee.deleted_at.is_(None)
            )
        )
        
        result = await db.execute(stmt)
        fee = result.scalar_one_or_none()
        
        if not fee:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Broker fee not found",
                error_code=ErrorCodes.USER_NOT_FOUND
            )
        
        return BrokerFeeResponse(
            id=uuid_to_ulid(fee.id),
            broker=fee.broker,
            commission_type=fee.commission_type.value if hasattr(fee.commission_type, 'value') else fee.commission_type,
            commission_value=fee.commission_value,
            minimum=fee.minimum,
            created_at=fee.created_at,
            updated_at=fee.updated_at
        )
    
    async def create_broker_fee(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        broker: str,
        commission_type: str,
        commission_value: Decimal,
        minimum: float
    ) -> BrokerFeeResponse:
        """
        Create new broker fee.
        
        Args:
            user_id: User UUID
            db: Database session
            broker: Broker name
            commission_type: Commission type (TIERED/FLAT)
            commission_value: Commission value (Decimal)
            minimum: Minimum commission (USD)
            
        Returns:
            BrokerFeeResponse
        """
        # Normalize and validate commission_type
        commission_type_upper = commission_type.upper()
        if commission_type_upper not in ('TIERED', 'FLAT'):
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid commission_type. Must be 'TIERED' or 'FLAT'",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
            )
        
        # Validate commission_value is non-negative
        if commission_value < 0:
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="commission_value must be non-negative",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
            )
        
        # Create new broker fee
        new_fee = BrokerFee(
            user_id=user_id,
            broker=broker.strip(),
            commission_type=commission_type_upper,
            commission_value=commission_value,
            minimum=minimum
        )
        
        db.add(new_fee)
        await db.commit()
        await db.refresh(new_fee)
        
        return BrokerFeeResponse(
            id=uuid_to_ulid(new_fee.id),
            broker=new_fee.broker,
            commission_type=new_fee.commission_type,
            commission_value=new_fee.commission_value,
            minimum=new_fee.minimum,
            created_at=new_fee.created_at,
            updated_at=new_fee.updated_at
        )
    
    async def update_broker_fee(
        self,
        user_id: uuid.UUID,
        broker_fee_id: str,
        db: AsyncSession,
        broker: Optional[str] = None,
        commission_type: Optional[str] = None,
        commission_value: Optional[Decimal] = None,
        minimum: Optional[float] = None
    ) -> BrokerFeeResponse:
        """
        Update existing broker fee.
        
        Args:
            user_id: User UUID
            broker_fee_id: Broker fee ULID
            db: Database session
            broker: Broker name (optional)
            commission_type: Commission type (optional)
            commission_value: Commission value (Decimal, optional)
            minimum: Minimum commission (optional)
            
        Returns:
            BrokerFeeResponse
            
        Raises:
            HTTPExceptionWithCode: If broker fee not found or access denied
        """
        try:
            fee_uuid = ulid_to_uuid(broker_fee_id)
        except Exception as e:
            logger.warning(f"Invalid broker_fee_id ULID: {broker_fee_id}")
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid broker_fee_id format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
            )
        
        stmt = select(BrokerFee).where(
            and_(
                BrokerFee.id == fee_uuid,
                BrokerFee.user_id == user_id,
                BrokerFee.deleted_at.is_(None)
            )
        )
        
        result = await db.execute(stmt)
        fee = result.scalar_one_or_none()
        
        if not fee:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Broker fee not found",
                error_code=ErrorCodes.USER_NOT_FOUND
            )
        
        # Update fields if provided
        if broker is not None:
            fee.broker = broker.strip()
        if commission_type is not None:
            commission_type_upper = commission_type.upper()
            if commission_type_upper not in ('TIERED', 'FLAT'):
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Invalid commission_type. Must be 'TIERED' or 'FLAT'",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
                )
            fee.commission_type = commission_type_upper
        if commission_value is not None:
            # Validate commission_value is non-negative
            if commission_value < 0:
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="commission_value must be non-negative",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
                )
            fee.commission_value = commission_value
        if minimum is not None:
            fee.minimum = minimum
        
        await db.commit()
        await db.refresh(fee)
        
        return BrokerFeeResponse(
            id=uuid_to_ulid(fee.id),
            broker=fee.broker,
            commission_type=fee.commission_type.value if hasattr(fee.commission_type, 'value') else fee.commission_type,
            commission_value=fee.commission_value,
            minimum=fee.minimum,
            created_at=fee.created_at,
            updated_at=fee.updated_at
        )
    
    async def delete_broker_fee(
        self,
        user_id: uuid.UUID,
        broker_fee_id: str,
        db: AsyncSession
    ) -> None:
        """
        Soft delete broker fee.
        
        Args:
            user_id: User UUID
            broker_fee_id: Broker fee ULID
            db: Database session
            
        Raises:
            HTTPExceptionWithCode: If broker fee not found or access denied
        """
        try:
            fee_uuid = ulid_to_uuid(broker_fee_id)
        except Exception as e:
            logger.warning(f"Invalid broker_fee_id ULID: {broker_fee_id}")
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid broker_fee_id format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
            )
        
        stmt = select(BrokerFee).where(
            and_(
                BrokerFee.id == fee_uuid,
                BrokerFee.user_id == user_id,
                BrokerFee.deleted_at.is_(None)
            )
        )
        
        result = await db.execute(stmt)
        fee = result.scalar_one_or_none()
        
        if not fee:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Broker fee not found",
                error_code=ErrorCodes.USER_NOT_FOUND
            )
        
        # Soft delete
        fee.deleted_at = datetime.utcnow()
        await db.commit()
    
    async def get_brokers_fees_summary(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        broker: Optional[str] = None,
        commission_type: Optional[str] = None
    ) -> BrokerFeeSummaryResponse:
        """
        Get brokers fees summary statistics.
        
        Args:
            user_id: User UUID
            db: Database session
            broker: Filter by broker name (optional)
            commission_type: Filter by commission type (TIERED/FLAT) (optional)
            
        Returns:
            BrokerFeeSummaryResponse with summary statistics
        """
        # Base query conditions
        conditions = [
            BrokerFee.user_id == user_id,
            BrokerFee.deleted_at.is_(None)
        ]
        
        # Filter by broker name
        if broker:
            conditions.append(BrokerFee.broker.ilike(f"%{broker}%"))
        
        # Filter by commission_type
        if commission_type:
            commission_type_upper = commission_type.upper().strip()
            if commission_type_upper in ('TIERED', 'FLAT'):
                conditions.append(BrokerFee.commission_type == commission_type_upper)
            else:
                # Invalid commission_type - log warning but don't fail
                # This allows the endpoint to work even with invalid filter values
                logger.warning(
                    f"Invalid commission_type filter: {commission_type}. "
                    f"Valid values are: TIERED, FLAT. Ignoring filter."
                )
        
        # Count total brokers
        stmt_total = select(func.count(BrokerFee.id)).where(and_(*conditions))
        result_total = await db.execute(stmt_total)
        total_brokers = result_total.scalar() or 0
        
        # Count active brokers (assuming all non-deleted are active)
        active_brokers = total_brokers
        
        # Calculate average commission per trade (using minimum as proxy)
        stmt_avg = select(func.avg(BrokerFee.minimum)).where(and_(*conditions))
        result_avg = await db.execute(stmt_avg)
        avg_commission_per_trade = result_avg.scalar() or Decimal("0")
        
        # For fixed commissions, we'd need additional data
        # For now, return 0 as placeholder
        monthly_fixed_commissions = Decimal("0")
        yearly_fixed_commissions = Decimal("0")
        
        return BrokerFeeSummaryResponse(
            total_brokers=total_brokers,
            active_brokers=active_brokers,
            avg_commission_per_trade=Decimal(str(avg_commission_per_trade)),
            monthly_fixed_commissions=monthly_fixed_commissions,
            yearly_fixed_commissions=yearly_fixed_commissions
        )


# Singleton instance
_brokers_fees_service: Optional[BrokersFeesService] = None


def get_brokers_fees_service() -> BrokersFeesService:
    """Get singleton BrokersFeesService instance."""
    global _brokers_fees_service
    if _brokers_fees_service is None:
        _brokers_fees_service = BrokersFeesService()
    return _brokers_fees_service
