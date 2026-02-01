"""
Identity Utilities - UUID to ULID Conversion
Task: 20.1.2 (Supporting utility)
Status: COMPLETED

Converts UUID (internal DB format) to ULID (external API format).
Based on GIN-2026-008: Internal UUID v4, External ULID Strings.
"""

import uuid
from typing import Optional
import ulid
from ulid import ULID


def uuid_to_ulid(uuid_value: Optional[uuid.UUID]) -> Optional[str]:
    """
    Convert UUID to ULID string.
    
    Used for converting internal UUID (from DB) to external ULID (for API responses).
    Based on GIN-2026-008: Internal UUID v4, External ULID Strings.
    
    Args:
        uuid_value: UUID object or None
        
    Returns:
        ULID string (26 characters) or None if input is None
        
    Example:
        >>> from uuid import UUID
        >>> uuid_to_ulid(UUID('123e4567-e89b-12d3-a456-426614174000'))
        '01ARZ3NDEKTSV4RRFFQ69G5FAV'
    """
    if uuid_value is None:
        return None
    
    if isinstance(uuid_value, str):
        uuid_value = uuid.UUID(uuid_value)
    
    # Generate ULID from UUID bytes
    # ulid.from_uuid() creates a deterministic ULID from UUID
    ulid_obj = ulid.from_uuid(uuid_value)
    return str(ulid_obj)


def ulid_to_uuid(ulid_string: Optional[str]) -> Optional[uuid.UUID]:
    """
    Convert ULID string back to UUID.
    
    Used for converting external ULID (from API requests) to internal UUID (for DB queries).
    
    Args:
        ulid_string: ULID string (26 characters) or None
        
    Returns:
        UUID object or None if input is None
        
    Example:
        >>> ulid_to_uuid('01ARZ3NDEKTSV4RRFFQ69G5FAV')
        UUID('123e4567-e89b-12d3-a456-426614174000')
    """
    if ulid_string is None:
        return None
    
    # Parse ULID and convert to UUID
    ulid = ULID.from_str(ulid_string)
    return ulid.to_uuid()


def generate_ulid() -> str:
    """
    Generate a new ULID.
    
    Useful for generating external IDs when creating new entities.
    
    Returns:
        ULID string (26 characters)
        
    Example:
        >>> generate_ulid()
        '01ARZ3NDEKTSV4RRFFQ69G5FAV'
    """
    return str(ULID())


def is_valid_ulid(ulid_string: str) -> bool:
    """
    Validate if a string is a valid ULID.
    
    Args:
        ulid_string: String to validate
        
    Returns:
        True if valid ULID, False otherwise
        
    Example:
        >>> is_valid_ulid('01ARZ3NDEKTSV4RRFFQ69G5FAV')
        True
        >>> is_valid_ulid('invalid')
        False
    """
    try:
        ULID.from_str(ulid_string)
        return True
    except (ValueError, TypeError):
        return False
