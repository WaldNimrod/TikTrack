#!/usr/bin/env python3
"""
Preferences Service – PostgreSQL implementation.

This version removes the sqlite3 dependency and relies entirely on SQLAlchemy
models so it can run both in Dockerized environments and on AWS RDS.
"""

import json
import logging
import time
from contextlib import contextmanager
from datetime import datetime
from typing import Any, Dict, Iterable, List, Optional, Tuple

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from config.database import SessionLocal
from config.settings import DB_PATH
from models.preferences import PreferenceGroup, PreferenceProfile, PreferenceType, UserPreference, DEFAULT_PREFERENCES
from models.user import User
from services.constraint_service import ConstraintService

logger = logging.getLogger(__name__)


class PreferenceError(Exception):
    """Base exception for preferences domain."""


class ValidationError(PreferenceError):
    """Raised when preference value fails validation."""


class ProfileNotFoundError(PreferenceError):
    """Raised when a profile cannot be located."""


class PreferencesService:
    """
    Main entry point for managing user preferences.
    
    This service handles all preference-related operations including:
    - Reading and writing user preferences
    - Profile management
    - Cache management
    - Validation
    
    Documentation: See documentation/04-FEATURES/CORE/preferences/PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md
    """

    CACHE_TTL = 24 * 60 * 60  # 24 hours

    def __init__(self):
        self._SessionLocal = SessionLocal
        self.cache: Dict[str, Any] = {}
        self.cache_timestamps: Dict[str, float] = {}
        self.constraint_service = ConstraintService()
        # Legacy compatibility for scripts/tests still touching the sqlite path directly
        self.db_path = str(DB_PATH)
        # Import cache settings to respect CACHE_ENABLED in development
        from config.settings import CACHE_ENABLED
        self._cache_enabled = CACHE_ENABLED
        # Default preferences fallback
        self._default_preferences = DEFAULT_PREFERENCES

    # ------------------------------------------------------------------ #
    # Session helpers
    # ------------------------------------------------------------------ #
    @contextmanager
    def _session_scope(self, commit: bool = False) -> Iterable[Session]:
        session = self._SessionLocal()
        try:
            yield session
            if commit:
                session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    # ------------------------------------------------------------------ #
    # Cache helpers
    # ------------------------------------------------------------------ #
    def _cache_key(self, user_id: int, profile_id: int, suffix: str = "all") -> str:
        return f"preferences:{user_id}:{profile_id}:{suffix}"

    def _is_cache_valid(self, key: str) -> bool:
        # If cache is disabled (development mode), always return False
        if not self._cache_enabled:
            return False
        timestamp = self.cache_timestamps.get(key)
        return timestamp is not None and (time.time() - timestamp) < self.CACHE_TTL

    def _invalidate_cache(self, user_id: int, profile_id: Optional[int] = None) -> None:
        prefix = f"preferences:{user_id}:"
        if profile_id is not None:
            prefix = f"{prefix}{profile_id}:"
        keys = [k for k in self.cache if k.startswith(prefix)]
        for key in keys:
            self.cache.pop(key, None)
            self.cache_timestamps.pop(key, None)

    # ------------------------------------------------------------------ #
    # Profile helpers
    # ------------------------------------------------------------------ #
    def _get_active_profile_id(self, session: Session, user_id: int) -> int:
        stmt = (
            select(PreferenceProfile.id)
            .where(
                PreferenceProfile.user_id == user_id,
                PreferenceProfile.is_active.is_(True),
            )
            .limit(1)
        )
        profile_id = session.scalar(stmt)
        if profile_id:
            return profile_id

        stmt = (
            select(PreferenceProfile.id)
            .where(PreferenceProfile.user_id == user_id)
            .order_by(PreferenceProfile.id)
            .limit(1)
        )
        profile_id = session.scalar(stmt)
        if profile_id:
            return profile_id

        profile = PreferenceProfile(
            user_id=user_id,
            profile_name="Default",
            is_active=True,
            is_default=True,
            description="Auto-generated profile",
        )
        session.add(profile)
        session.flush()
        return profile.id

    def build_profile_context(
        self,
        user_id: int,
        profile_id: Optional[int] = None,
        requested_profile_id: Optional[int] = None,
        **_ignored_kwargs: Any,
    ) -> Dict[str, Any]:
        """
        Build profile context with user and profile information.
        
        Args:
            user_id: User ID
            profile_id: Profile ID (optional, uses active profile if not provided)
            requested_profile_id: Requested profile ID (optional)
            **_ignored_kwargs: Additional ignored keyword arguments
            
        Returns:
            Dictionary containing:
            - user_id: User ID
            - profile_id: Profile ID
            - user: User object with id, username, display_name, full_name
            - resolved_profile: Profile object with id, name, description, is_default, is_active
            - versions: Version information
            - generated_at: Timestamp
            
        Raises:
            ProfileNotFoundError: If profile not found for user
        """
        with self._session_scope() as session:
            resolved_profile_id = requested_profile_id or profile_id
            # If specific profile_id requested, try to use it
            if resolved_profile_id:
                profile = session.get(PreferenceProfile, resolved_profile_id)
                # If profile not found or doesn't belong to user, fall back to active profile
                if not profile or profile.user_id != user_id:
                    resolved_profile_id = None  # Fall back to active profile
            
            # If no profile_id specified or fallback needed, get active profile
            if not resolved_profile_id:
                resolved_profile_id = self._get_active_profile_id(session, user_id)
                profile = session.get(PreferenceProfile, resolved_profile_id)
            
            # Final validation
            if not profile or profile.user_id != user_id:
                raise ProfileNotFoundError(f"Profile {resolved_profile_id} not found for user {user_id}")

            # Build user object from users table when available
            db_user = session.get(User, user_id)
            user_obj = {
                "id": user_id,
                "username": getattr(db_user, "username", None) if db_user else None,
                "display_name": getattr(db_user, "display_name", None) if db_user else None,
                "full_name": getattr(db_user, "full_name", None) if db_user else None,
            }
            # Ensure user object always has at least id and username fallback
            if not user_obj.get("username") and user_id:
                user_obj["username"] = f"user_{user_id}"
            if not user_obj.get("display_name") and user_obj.get("username"):
                user_obj["display_name"] = user_obj["username"]

            # Build resolved profile object with stable naming and fallbacks
            resolved_profile = {
                "id": profile.id,
                "name": profile.profile_name or f"Profile #{profile.id}",
                "description": profile.description,
                "is_default": bool(profile.is_default),
                "is_active": bool(profile.is_active),
            }

            return {
                # Legacy shape (kept for backward compatibility)
                "user_id": user_id,
                "profile_id": profile.id,
                "requested_profile_id": requested_profile_id,
                "resolved_profile_id": profile.id,
                "profile": {
                    "id": profile.id,
                    "profile_name": profile.profile_name,
                    "is_active": profile.is_active,
                    "is_default": profile.is_default,
                    "description": profile.description,
                    "last_used_at": profile.last_used_at,
                    "usage_count": profile.usage_count,
                },
                # New canonical fields expected by frontend plan
                "user": user_obj,
                "resolved_profile": resolved_profile,
                # Versions payload
                "versions": self._build_version_payload(
                    session=session, user_id=user_id, profile_id=profile.id
                ),
                "generated_at": datetime.utcnow().isoformat(),
            }

    def _build_version_payload(
        self, session: Session, user_id: int, profile_id: int
    ) -> Dict[str, Any]:
        stmt = select(func.max(UserPreference.updated_at)).where(
            UserPreference.user_id == user_id,
            UserPreference.profile_id == profile_id,
        )
        ts = session.scalar(stmt)
        return {
            "user_id": user_id,
            "profile_id": profile_id,
            "last_update": ts.isoformat() if ts else None,
        }

    # ------------------------------------------------------------------ #
    # Read operations
    # ------------------------------------------------------------------ #
    def _get_preference_type(self, session: Session, preference_name: str) -> PreferenceType:
        stmt = (
            select(PreferenceType)
            .where(
                PreferenceType.preference_name == preference_name,
                PreferenceType.is_active.is_(True),
            )
            .limit(1)
        )
        pref_type = session.scalar(stmt)
        if not pref_type:
            raise ValidationError(f"Preference '{preference_name}' not found")
        return pref_type

    def get_preference(
        self,
        user_id: int,
        preference_name: str,
        profile_id: Optional[int] = None,
        use_cache: bool = True,
    ) -> Any:
        _ = use_cache  # Kept for backward compatibility (cache handled per group only)
        with self._session_scope() as session:
            profile_id = profile_id or self._get_active_profile_id(session, user_id)
            pref_type = self._get_preference_type(session, preference_name)
            stmt = select(UserPreference.saved_value).where(
                UserPreference.user_id == user_id,
                UserPreference.profile_id == profile_id,
                UserPreference.preference_id == pref_type.id,
            )
            value = session.scalar(stmt)
            return value if value is not None else pref_type.default_value

    def get_preference_value(
        self,
        user_id: int,
        preference_name: str,
        profile_id: Optional[int] = None,
        use_cache: bool = True,
    ) -> Any:
        return self.get_preference(user_id, preference_name, profile_id, use_cache=use_cache)

    def get_default_preference(self, preference_name: str) -> Any:
        """Get default preference value - hardcoded for critical colors"""
        # Hardcoded defaults for critical colors (TikTrack logo colors)
        defaults = {
            "primary_color": "#26baac",
            "secondary_color": "#fc5a06", 
            "chartSecondaryColor": "#26baac"
        }
        
        if preference_name in defaults:
            return defaults[preference_name]
        
        # Fallback to database for other preferences
        with self._session_scope() as session:
            pref_type = self._get_preference_type(session, preference_name)
            return pref_type.default_value

