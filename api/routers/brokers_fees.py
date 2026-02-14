"""
Brokers Fees Routes - API Endpoints
Task: Phase 2.1 - Brokers Fees (D18)
Status: IN PROGRESS

FastAPI routes for brokers fees API.
"""

from fastapi import APIRouter, Depends, Query, status, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from decimal import Decimal
import logging

from ..core.database import get_db
from ..core.config import settings
from ..utils.dependencies import get_current_user
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..models.identity import User
from ..services.brokers_fees_service import get_brokers_fees_service
from ..schemas.brokers_fees import (
    BrokerFeeResponse,
    BrokerFeeListResponse,
    BrokerFeeCreateRequest,
    BrokerFeeUpdateRequest,
    BrokerFeeSummaryResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/brokers_fees", tags=["brokers_fees"])


@router.get("", response_model=BrokerFeeListResponse)
async def get_brokers_fees(
    trading_account_id: Optional[str] = Query(None, description="Filter by trading account ULID (ADR-015)"),
    broker: Optional[str] = Query(None, description="Filter by broker name (via account)"),
    commission_type: Optional[str] = Query(None, description="Filter by commission type (TIERED/FLAT)"),
    search: Optional[str] = Query(None, description="Search in account name, broker, commission value"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get broker fees for current user.
    
    Returns list of broker fees with optional filters:
    - broker: Filter by broker name (partial match)
    - commission_type: Filter by commission type (TIERED/FLAT)
    - search: Search in broker name and commission value
    
    Query Parameters:
    - broker: Filter by broker name (optional)
    - commission_type: Filter by commission type (TIERED/FLAT) (optional)
    - search: Search in broker name and commission value (optional)
    """
    try:
        service = get_brokers_fees_service()
        broker_fees = await service.get_brokers_fees(
            user_id=current_user.id,
            db=db,
            trading_account_id=trading_account_id,
            broker=broker,
            commission_type=commission_type,
            search=search
        )
        
        return BrokerFeeListResponse(
            data=broker_fees,
            total=len(broker_fees)
        )
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error fetching broker fees: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e) if settings.debug else "Failed to fetch broker fees",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.get("/summary", response_model=BrokerFeeSummaryResponse)
async def get_brokers_fees_summary(
    trading_account_id: Optional[str] = Query(default=None, description="Filter by trading account ULID (ADR-015)"),
    broker: Optional[str] = Query(default=None, description="Filter by broker name (via account)"),
    commission_type: Optional[str] = Query(default=None, description="Filter by commission type (TIERED/FLAT)"),
    # Ignore pagination parameters (page, page_size) - summary endpoint doesn't use them
    # These are included to prevent 400 errors when Frontend sends them
    page: Optional[int] = Query(default=None, include_in_schema=False),
    page_size: Optional[int] = Query(default=None, include_in_schema=False),
    # Ignore additional parameters that Frontend may send but are not used by summary endpoint
    # These are included to prevent 400 errors when Frontend sends invalid/unexpected parameters
    # Using default=None explicitly to handle empty strings gracefully
    date_range: Optional[str] = Query(default=None, include_in_schema=False),
    search: Optional[str] = Query(default=None, include_in_schema=False),
    date_from: Optional[str] = Query(default=None, include_in_schema=False),
    date_to: Optional[str] = Query(default=None, include_in_schema=False),
    # Gate B Fix: Add broker_id parameter (Frontend may send it, but we use broker name filter instead)
    broker_id: Optional[str] = Query(default=None, include_in_schema=False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get brokers fees summary statistics.
    
    Returns summary statistics:
    - total_brokers: Total number of brokers
    - active_brokers: Number of active brokers
    - avg_commission_per_trade: Average commission per trade
    - monthly_fixed_commissions: Total monthly fixed commissions
    - yearly_fixed_commissions: Total yearly fixed commissions
    
    Query Parameters:
    - broker: Filter by broker name (optional)
    - commission_type: Filter by commission type (TIERED/FLAT) (optional)
    - page: Ignored (pagination not applicable to summary)
    - page_size: Ignored (pagination not applicable to summary)
    """
    # Log incoming request parameters for debugging (Team 90 requirement)
    logger.info(
        f"[DEBUG] Brokers fees summary request - user_id: {current_user.id}, "
        f"trading_account_id: '{trading_account_id}', broker: '{broker}' (type: {type(broker).__name__}), "
        f"commission_type: '{commission_type}' (type: {type(commission_type).__name__}), "
        f"page: {page}, page_size: {page_size}, "
        f"date_range: '{date_range}', search: '{search}', "
        f"date_from: '{date_from}', date_to: '{date_to}', "
        f"broker_id: '{broker_id}'"
    )
    
    try:
        # Normalize commission_type if provided (case-insensitive)
        # Handle None, empty string, or whitespace-only strings as None
        normalized_commission_type = None
        if commission_type and commission_type.strip():
            normalized_commission_type = commission_type.upper().strip()
            if normalized_commission_type not in ('TIERED', 'FLAT'):
                logger.warning(
                    f"Invalid commission_type provided: {commission_type}. "
                    f"Valid values are: TIERED, FLAT. Ignoring filter."
                )
                normalized_commission_type = None
        
        # Normalize broker if provided (trim whitespace)
        # Handle None, empty string, or whitespace-only strings as None
        normalized_broker = None
        if broker and broker.strip():
            normalized_broker = broker.strip()
        
        service = get_brokers_fees_service()
        summary = await service.get_brokers_fees_summary(
            user_id=current_user.id,
            db=db,
            trading_account_id=trading_account_id,
            broker=normalized_broker,
            commission_type=normalized_commission_type
        )
        
        logger.debug(
            f"Brokers fees summary response - total_brokers: {summary.total_brokers}, "
            f"active_brokers: {summary.active_brokers}"
        )
        
        return summary
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(
            f"Error fetching brokers fees summary - user_id: {current_user.id}, "
            f"broker: {broker}, commission_type: {commission_type}, "
            f"error: {str(e)}",
            exc_info=True
        )
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e) if settings.debug else "Failed to fetch brokers fees summary",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.get("/{id}", response_model=BrokerFeeResponse)
async def get_broker_fee(
    id: str = Path(..., description="Broker fee ULID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get single broker fee by ID.
    
    Args:
        id: Broker fee ULID
        
    Returns:
        BrokerFeeResponse
    """
    try:
        service = get_brokers_fees_service()
        broker_fee = await service.get_broker_fee_by_id(
            user_id=current_user.id,
            broker_fee_id=id,
            db=db
        )
        return broker_fee
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error fetching broker fee: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e) if settings.debug else "Failed to fetch broker fee",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.post("", response_model=BrokerFeeResponse, status_code=status.HTTP_201_CREATED)
async def create_broker_fee(
    request: BrokerFeeCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create new broker fee (ADR-015: fees per trading account).
    """
    try:
        service = get_brokers_fees_service()
        broker_fee = await service.create_broker_fee(
            user_id=current_user.id,
            db=db,
            trading_account_id=request.trading_account_id,
            commission_type=request.commission_type,
            commission_value=request.commission_value,
            minimum=request.minimum
        )
        return broker_fee
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error creating broker fee: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create broker fee",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.put("/{id}", response_model=BrokerFeeResponse)
async def update_broker_fee(
    id: str = Path(..., description="Broker fee ULID"),
    request: BrokerFeeUpdateRequest = ...,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update existing broker fee.
    
    Args:
        id: Broker fee ULID
        request: BrokerFeeUpdateRequest with fields to update
        
    Returns:
        BrokerFeeResponse
    """
    try:
        service = get_brokers_fees_service()
        broker_fee = await service.update_broker_fee(
            user_id=current_user.id,
            broker_fee_id=id,
            db=db,
            trading_account_id=request.trading_account_id,
            commission_type=request.commission_type,
            commission_value=request.commission_value,
            minimum=request.minimum
        )
        return broker_fee
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error updating broker fee: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update broker fee",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_broker_fee(
    id: str = Path(..., description="Broker fee ULID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete broker fee (soft delete).
    
    Args:
        id: Broker fee ULID
        
    Returns:
        204 No Content
    """
    try:
        service = get_brokers_fees_service()
        await service.delete_broker_fee(
            user_id=current_user.id,
            broker_fee_id=id,
            db=db
        )
        return None
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error deleting broker fee: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete broker fee",
            error_code=ErrorCodes.SERVER_ERROR
        )
