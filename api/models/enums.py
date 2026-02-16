"""
Database ENUMs - SQLAlchemy Enum Types
Task: 20.1.2
Status: COMPLETED

Maps PostgreSQL ENUMs to SQLAlchemy Enum types.
Based on PHX_DB_SCHEMA_V2.5_FULL_DDL.sql
"""

import enum
from sqlalchemy import Enum


class UserRole(str, enum.Enum):
    """User role enum - maps to user_data.user_role"""
    USER = "USER"
    ADMIN = "ADMIN"
    SUPERADMIN = "SUPERADMIN"


class ResetMethod(str, enum.Enum):
    """Password reset method enum - maps to user_data.reset_method"""
    EMAIL = "EMAIL"
    SMS = "SMS"


class ApiProvider(str, enum.Enum):
    """API provider enum - maps to user_data.api_provider"""
    IBKR = "IBKR"
    POLYGON = "POLYGON"
    YAHOO_FINANCE = "YAHOO_FINANCE"
    ALPHA_VANTAGE = "ALPHA_VANTAGE"
    FINNHUB = "FINNHUB"
    TWELVE_DATA = "TWELVE_DATA"
    IEX_CLOUD = "IEX_CLOUD"
    CUSTOM = "CUSTOM"


class NoteCategory(str, enum.Enum):
    """Note category enum - maps to user_data.note_category (D35)"""
    TRADE = "TRADE"
    PSYCHOLOGY = "PSYCHOLOGY"
    ANALYSIS = "ANALYSIS"
    GENERAL = "GENERAL"


# SQLAlchemy Enum types for use in Column definitions
user_role_enum = Enum(UserRole, name="user_role", schema="user_data", create_type=False)
reset_method_enum = Enum(ResetMethod, name="reset_method", schema="user_data", create_type=False)
api_provider_enum = Enum(ApiProvider, name="api_provider", schema="user_data", create_type=False)
note_category_enum = Enum(NoteCategory, name="note_category", schema="user_data", create_type=False)
