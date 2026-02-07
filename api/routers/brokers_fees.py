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
from ..utils.dependencies import get_current_user
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..models.identity import User
from ..services.brokers_fees_service import get_brokers_fees_service
from ..schemas.brokers_fees import (
    BrokerFeeResponse,
    BrokerFeeListResponse,
    BrokerFeeCreateRequest,
    BrokerFeeUpdateRequest
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/brokers_fees", tags=["brokers_fees"])


@router.get("", response_model=BrokerFeeListResponse)
async def get_brokers_fees(
    broker: Optional[str] = Query(None, description="Filter by broker name"),
    commission_type: Optional[str] = Query(None, description="Filter by commission type (TIERED/FLAT)"),
    search: Optional[str] = Query(None, description="Search in broker name and commission value"),
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
            detail="Failed to fetch broker fees",
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
            detail="Failed to fetch broker fee",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.post("", response_model=BrokerFeeResponse, status_code=status.HTTP_201_CREATED)
async def create_broker_fee(
    request: BrokerFeeCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create new broker fee.
    
    Args:
        request: BrokerFeeCreateRequest with broker details
        
    Returns:
        BrokerFeeResponse
    """
    try:
        service = get_brokers_fees_service()
        broker_fee = await service.create_broker_fee(
            user_id=current_user.id,
            db=db,
            broker=request.broker,
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
            broker=request.broker,
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
