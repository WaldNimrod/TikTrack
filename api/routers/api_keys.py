"""
API Keys Routes - API Key Management (D24)
Task: 20.1.8 (Updated with Task 20.1.7)
Status: COMPLETED

FastAPI routes for API key management.
Implements full CRUD operations with encryption and masking.
"""

from typing import List
from fastapi import APIRouter, Depends, status, Body
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import logging

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..utils.identity import ulid_to_uuid
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..models.identity import User
from ..schemas.identity import UserApiKeyCreate, UserApiKeyResponse
from ..services.api_keys import get_api_key_service, ApiKeyError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user/api-keys", tags=["api-keys"])
security = HTTPBearer()


class ApiKeyUpdate(BaseModel):
    """API key update schema."""

    provider_label: str = None
    is_active: bool = None
    api_key: str = None
    api_secret: str = None
    additional_config: dict = None


@router.get("", response_model=List[UserApiKeyResponse])
async def list_api_keys(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """
    List user's API keys (D24).

    Returns list of API keys with masked values.
    """
    try:
        api_key_service = get_api_key_service()
        api_keys = await api_key_service.list_api_keys(current_user.id, db)

        return [UserApiKeyResponse.from_model(key) for key in api_keys]

    except Exception as e:
        logger.error(f"List API keys error: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list API keys",
            error_code=ErrorCodes.SERVER_ERROR,
        )


@router.post("", response_model=UserApiKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    data: UserApiKeyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create new API key (D24).

    Encrypts API key and secret before storage.
    Returns masked response.
    """
    try:
        api_key_service = get_api_key_service()
        api_key = await api_key_service.create_api_key(user_id=current_user.id, data=data, db=db)

        return UserApiKeyResponse.from_model(api_key)

    except ApiKeyError as e:
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
            error_code=ErrorCodes.API_KEY_CREATE_FAILED,
        )
    except Exception as e:
        logger.error(f"Create API key error: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create API key",
            error_code=ErrorCodes.API_KEY_CREATE_FAILED,
        )


@router.put("/{key_id}", response_model=UserApiKeyResponse)
async def update_api_key(
    key_id: str,
    data: ApiKeyUpdate = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update API key (D24).

    Can update label, status, or re-encrypt keys.
    """
    try:
        # Convert ULID to UUID
        key_uuid = ulid_to_uuid(key_id)

        api_key_service = get_api_key_service()

        # Prepare update data
        update_data = {}
        if data.provider_label is not None:
            update_data["provider_label"] = data.provider_label
        if data.is_active is not None:
            update_data["is_active"] = data.is_active
        if data.api_key is not None:
            update_data["api_key"] = data.api_key
        if data.api_secret is not None:
            update_data["api_secret"] = data.api_secret
        if data.additional_config is not None:
            update_data["additional_config"] = data.additional_config

        api_key = await api_key_service.update_api_key(
            key_id=key_uuid, user_id=current_user.id, data=update_data, db=db
        )

        return UserApiKeyResponse.from_model(api_key)

    except ApiKeyError as e:
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
            error_code=ErrorCodes.API_KEY_NOT_FOUND,
        )
    except ValueError as e:
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid key ID: {str(e)}",
            error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
        )
    except Exception as e:
        logger.error(f"Update API key error: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update API key",
            error_code=ErrorCodes.API_KEY_UPDATE_FAILED,
        )


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    key_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """
    Delete API key (D24).

    Performs soft delete (sets deleted_at).
    """
    try:
        # Convert ULID to UUID
        key_uuid = ulid_to_uuid(key_id)

        api_key_service = get_api_key_service()
        await api_key_service.delete_api_key(key_id=key_uuid, user_id=current_user.id, db=db)

        return None

    except ApiKeyError as e:
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
            error_code=ErrorCodes.API_KEY_NOT_FOUND,
        )
    except ValueError as e:
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid key ID: {str(e)}",
            error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
        )
    except Exception as e:
        logger.error(f"Delete API key error: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete API key",
            error_code=ErrorCodes.API_KEY_DELETE_FAILED,
        )


@router.post("/{key_id}/verify", response_model=dict)
async def verify_api_key(
    key_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """
    Verify API key against provider (D24).

    Tests the API key against the provider's API and updates verification status.
    """
    try:
        # Convert ULID to UUID
        key_uuid = ulid_to_uuid(key_id)

        api_key_service = get_api_key_service()
        is_valid = await api_key_service.verify_api_key(
            key_id=key_uuid, user_id=current_user.id, db=db
        )

        return {
            "key_id": key_id,
            "is_verified": is_valid,
            "message": (
                "API key verified successfully" if is_valid else "API key verification failed"
            ),
        }

    except ApiKeyError as e:
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
            error_code=ErrorCodes.API_KEY_NOT_FOUND,
        )
    except ValueError as e:
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid key ID: {str(e)}",
            error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
        )
    except Exception as e:
        logger.error(f"Verify API key error: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify API key",
            error_code=ErrorCodes.API_KEY_VERIFY_FAILED,
        )
