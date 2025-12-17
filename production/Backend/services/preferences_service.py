#!/usr/bin/env python3
"""
Preferences Service – PostgreSQL implementation.

This version removes the sqlite3 dependency and relies entirely on SQLAlchemy
models so it can run both in Dockerized environments and on AWS RDS.
"""

print("🔍 LOADING: preferences_service.py")
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
            logger.info(f"🔍 DEBUG: get_all_user_preferences - returning {len(data)} preferences")
            if len(data) > 0:
                logger.info(f"🔍 DEBUG: First 3 preferences in result: {data[:3]}")
        if use_cache and self._cache_enabled and cache_key:
            self.cache[cache_key] = data
            self.cache_timestamps[cache_key] = time.time()
        return data

    def get_preferences_version_info(
        self, user_id: int, profile_id: Optional[int] = None
    ) -> Tuple[Optional[str], int]:
        with self._session_scope() as session:
            profile_id = profile_id or self._get_active_profile_id(session, user_id)
            payload = self._build_version_payload(session, user_id, profile_id)
            return payload["last_update"], profile_id

    def get_preferences_by_names(
        self,
        user_id: int,
        names: Optional[List[str]] = None,
        profile_id: Optional[int] = None,
        preference_names: Optional[List[str]] = None,
        use_cache: bool = True,
        **_ignored_kwargs: Any,
    ) -> Dict[str, Any]:
        _ = use_cache  # caching handled at higher layers for now
        target_names = names or preference_names or []
        if not target_names:
            return {}
        with self._session_scope() as session:
            profile_id = profile_id or self._get_active_profile_id(session, user_id)
            pref_types = session.scalars(
                select(PreferenceType).where(
                    PreferenceType.preference_name.in_(target_names),
                    PreferenceType.is_active.is_(True),
                )
            ).all()
            result: Dict[str, Any] = {}
            for pref_type in pref_types:
                stmt = select(UserPreference.saved_value).where(
                    UserPreference.user_id == user_id,
                    UserPreference.profile_id == profile_id,
                    UserPreference.preference_id == pref_type.id,
                )
                value = session.scalar(stmt)
                result[pref_type.preference_name] = value if value is not None else pref_type.default_value
            return result

    def get_active_profile_info(self, user_id: int) -> Dict[str, Any]:
        context = self.build_profile_context(user_id)
        return context["profile"]

    def get_user_profiles(self, user_id: int) -> List[Dict[str, Any]]:
        with self._session_scope() as session:
            profiles = session.scalars(
                select(PreferenceProfile).where(PreferenceProfile.user_id == user_id)
            ).all()
            return [
                {
                    "id": profile.id,
                    "profile_name": profile.profile_name,
                    "is_active": profile.is_active,
                    "is_default": profile.is_default,
                    "description": profile.description,
                }
                for profile in profiles
            ]

    def get_all_user_preferences(
        self,
        user_id: int,
        profile_id: Optional[int] = None,
        use_cache: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        Get all user preferences for a specific profile
        """
        cache_key = f"user_preferences:{user_id}:{profile_id}" if use_cache and self._cache_enabled else None

        if use_cache and self._cache_enabled and cache_key and cache_key in self.cache:
            logger.info(f"🔍 DEBUG: get_all_user_preferences - returning cached data")
            return self.cache[cache_key]

        with self._session_scope() as session:
            # Get active profile if not specified
            if profile_id is None:
                profile_id = self._get_active_profile_id(session, user_id)

            # Get all preference types
            pref_types = session.scalars(
                select(PreferenceType).where(PreferenceType.is_active.is_(True))
            ).all()

            data = []
            for pref_type in pref_types:
                # Get user preference value if exists
                stmt = select(UserPreference.saved_value).where(
                    UserPreference.user_id == user_id,
                    UserPreference.profile_id == profile_id,
                    UserPreference.preference_id == pref_type.id,
                )
                user_value = session.scalar(stmt)

                # Use user value or default
                value = user_value if user_value is not None else pref_type.default_value

                data.append({
                    "preference_name": pref_type.preference_name,
                    "value": value,
                    "type": pref_type.preference_type,
                    "category": pref_type.category,
                    "description": pref_type.description,
                    "is_custom": user_value is not None,
                })

            logger.info(f"🔍 DEBUG: get_all_user_preferences - returning {len(data)} preferences")
            if len(data) > 0:
                logger.info(f"🔍 DEBUG: First 3 preferences in result: {data[:3]}")

            if use_cache and self._cache_enabled and cache_key:
                self.cache[cache_key] = data
                self.cache_timestamps[cache_key] = time.time()

            return data

    # ------------------------------------------------------------------ #
    # Mutation helpers
    # ------------------------------------------------------------------ #
    def _validate_value(self, pref_type: PreferenceType, value: Any) -> str:
        if value is None or str(value).strip() == "":
            if pref_type.is_required:
                raise ValidationError(f"Preference '{pref_type.preference_name}' is required")
            return ""

        dtype = pref_type.data_type.lower()
        normalized = value

        if dtype == "integer":
            normalized = str(int(value))
        elif dtype in {"float", "number"}:
            normalized = str(float(value))
        elif dtype == "boolean":
            normalized = str(value).lower()
            if normalized in {"1", "true", "yes"}:
                normalized = "true"
            elif normalized in {"0", "false", "no"}:
                normalized = "false"
            else:
                raise ValidationError(f"Preference '{pref_type.preference_name}' must be boolean")
        elif dtype == "json":
            if isinstance(value, str):
                json.loads(value)
                normalized = value
            else:
                normalized = json.dumps(value)
        elif dtype == "color":
            normalized = str(value).strip()
            if not normalized.startswith("#") or len(normalized) not in {4, 7}:
                raise ValidationError(f"Preference '{pref_type.preference_name}' must be hex color")
        else:
            normalized = str(value)

        return normalized

    def _save_single_preference(
        self, session: Session, user_id: int, profile_id: int, preference_name: str, value: Any
    ) -> None:
        pref_type = self._get_preference_type(session, preference_name)
        normalized = self._validate_value(pref_type, value)

        stmt = select(UserPreference).where(
            UserPreference.user_id == user_id,
            UserPreference.profile_id == profile_id,
            UserPreference.preference_id == pref_type.id,
        )
        record = session.scalar(stmt)
        if record:
            record.saved_value = normalized
            record.updated_at = datetime.utcnow()
        else:
            session.add(
                UserPreference(
                    user_id=user_id,
                    profile_id=profile_id,
                    preference_id=pref_type.id,
                    saved_value=normalized,
                )
            )

    def save_preferences(
        self, user_id: int, preferences: Dict[str, Any], profile_id: Optional[int] = None
    ) -> bool:
        with self._session_scope(commit=True) as session:
            profile_id = profile_id or self._get_active_profile_id(session, user_id)
            for name, value in preferences.items():
                self._save_single_preference(session, user_id, profile_id, name, value)

        self._invalidate_cache(user_id, profile_id)
        return True

    def save_preference(
        self, user_id: int, preference_name: str, value: Any, profile_id: Optional[int] = None
    ) -> bool:
        with self._session_scope(commit=True) as session:
            profile_id = profile_id or self._get_active_profile_id(session, user_id)
            self._save_single_preference(session, user_id, profile_id, preference_name, value)

        self._invalidate_cache(user_id, profile_id)
        return True

    def create_profile(
        self, user_id: int, profile_name: str, is_default: bool = False, description: Optional[str] = None
    ) -> Dict[str, Any]:
        with self._session_scope(commit=True) as session:
            # Validation: user_id must be provided, profile_name must be non-empty
            if user_id is None:
                raise ValidationError("user_id is required")
            normalized_name = (profile_name or "").strip()
            if not normalized_name:
                raise ValidationError("profile_name is required")
            profile = PreferenceProfile(
                user_id=user_id,
                profile_name=normalized_name,
                is_active=not is_default,
                is_default=is_default,
                description=description,
            )
            session.add(profile)
            session.flush()
            return {
                "id": profile.id,
                "profile_name": profile.profile_name,
                "is_active": profile.is_active,
                "is_default": profile.is_default,
            }

    def activate_profile(self, user_id: int, profile_id: int) -> bool:
        with self._session_scope(commit=True) as session:
            profiles = session.scalars(
                select(PreferenceProfile).where(PreferenceProfile.user_id == user_id)
            ).all()
            updated = False
            for profile in profiles:
                if profile.id == profile_id:
                    profile.is_active = True
                    profile.last_used_at = datetime.utcnow()
                    profile.usage_count = (profile.usage_count or 0) + 1
                    updated = True
                else:
                    profile.is_active = False

            if not updated:
                raise ProfileNotFoundError(f"Profile {profile_id} not found for user {user_id}")

        self._invalidate_cache(user_id)
        return True

    def check_preference_type_exists(self, preference_name: str) -> bool:
        with self._session_scope() as session:
            stmt = (
                select(PreferenceType.id)
                .where(PreferenceType.preference_name == preference_name)
                .limit(1)
            )
            return session.scalar(stmt) is not None

    def get_all_preference_types(self) -> List[Dict[str, Any]]:
        # DEBUG: Log that this method was called
        print("🔍 DEBUG: get_all_preference_types called - method exists!")
        logger.info("🔍 DEBUG: get_all_preference_types called")
        with self._session_scope() as session:
            stmt = (
                select(PreferenceType, PreferenceGroup)
                .join(PreferenceGroup, PreferenceType.group_id == PreferenceGroup.id)
                .where(PreferenceType.is_active == True)
                .order_by(PreferenceGroup.group_name, PreferenceType.preference_name)
            )
            results = session.execute(stmt).all()
            return [
                {
                    "id": pref.id,
                    "preference_name": pref.preference_name,
                    "data_type": pref.data_type,
                    "default_value": pref.default_value,
                    "description": pref.description,
                    "group_id": group.id,
                    "group_name": group.group_name,
                    "is_active": pref.is_active,
                }
                for pref, group in results
            ]

    def get_preference_groups(self) -> List[Dict[str, Any]]:
        with self._session_scope() as session:
            groups = session.scalars(select(PreferenceGroup).order_by(PreferenceGroup.group_name)).all()
            return [
                {
                    "id": group.id,
                    "group_name": group.group_name,
                    "description": group.description,
                }
                for group in groups
            ]

    def get_preference_info(self, preference_name: str) -> Dict[str, Any]:
        with self._session_scope() as session:
            pref_type = self._get_preference_type(session, preference_name)
            return {
                "id": pref_type.id,
                "preference_name": pref_type.preference_name,
                "data_type": pref_type.data_type,
                "default_value": pref_type.default_value,
                "description": pref_type.description,
                "constraints": pref_type.constraints,
            }

    def clear_cache(self) -> bool:
        self.cache.clear()
        self.cache_timestamps.clear()
        return True


# Module-level singleton used by legacy imports
preferences_service = PreferencesService()

