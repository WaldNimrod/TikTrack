"""
API Keys Routes - API Key Management (D24)
Task: 20.1.8
Status: PARTIAL - Depends on Task 20.1.7

FastAPI routes for API key management.
TODO: Implement ApiKeyService (Task 20.1.7) before completing.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..models.identity import User

router = APIRouter(prefix="/user/api-keys", tags=["api-keys"])
security = HTTPBearer()


@router.get("")
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List user's API keys (D24).
    
    TODO: Implement ApiKeyService.list_api_keys() (Task 20.1.7)
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="API keys list not yet implemented"
    )


@router.post("")
async def create_api_key(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create new API key (D24).
    
    TODO: Implement ApiKeyService.create_api_key() (Task 20.1.7)
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="API key creation not yet implemented"
    )


@router.put("/{key_id}")
async def update_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update API key (D24).
    
    TODO: Implement ApiKeyService.update_api_key() (Task 20.1.7)
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="API key update not yet implemented"
    )


@router.delete("/{key_id}")
async def delete_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete API key (D24).
    
    TODO: Implement ApiKeyService.delete_api_key() (Task 20.1.7)
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="API key deletion not yet implemented"
    )


@router.post("/{key_id}/verify")
async def verify_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify API key against provider (D24).
    
    TODO: Implement ApiKeyService.verify_api_key() (Task 20.1.7)
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="API key verification not yet implemented"
    )
