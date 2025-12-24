#!/usr/bin/env python3
"""
User Service – SQLAlchemy implementation
"""

from __future__ import annotations

import logging
from contextlib import contextmanager
from datetime import datetime
from typing import Any, Dict, Iterable, List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from config.database import SessionLocal
from models.user import User
from services.preferences_service import PreferencesService

logger = logging.getLogger(__name__)


class UserService:
    """
    Complete user service for managing users and their preferences.
    """

    def __init__(self):
        self._SessionLocal = SessionLocal
        self.preferences_service = PreferencesService()

    # ------------------------------------------------------------------
    # Session helper
    # ------------------------------------------------------------------
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

    # ------------------------------------------------------------------
    # Serialization helpers
    # ------------------------------------------------------------------
    def _serialize_user(self, user: User) -> Dict[str, Any]:
        payload = user.to_dict()
        payload.update(
            {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "is_default": user.is_default,
                "full_name": user.full_name,
                "display_name": user.display_name,
            }
        )
        return payload

    # ------------------------------------------------------------------
    # CRUD operations
    # ------------------------------------------------------------------
    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        with self._session_scope() as session:
            user = session.get(User, user_id)
            return self._serialize_user(user) if user else None

    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        with self._session_scope() as session:
            stmt = select(User).where(User.username == username)
            user = session.scalars(stmt).first()
            return self._serialize_user(user) if user else None

    def get_default_user(self) -> Optional[Dict[str, Any]]:
        with self._session_scope() as session:
            stmt = select(User).where(User.is_default.is_(True)).limit(1)
            user = session.scalars(stmt).first()
            return self._serialize_user(user) if user else None

    def get_all_users(self) -> List[Dict[str, Any]]:
        with self._session_scope() as session:
            stmt = select(User).order_by(User.is_default.desc(), User.username.asc())
            users = session.scalars(stmt).all()
            return [self._serialize_user(user) for user in users]

    def create_user(
        self,
        username: str,
        email: Optional[str] = None,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        is_default: bool = False,
    ) -> Optional[Dict[str, Any]]:
        with self._session_scope(commit=True) as session:
            exists = session.scalars(select(User.id).where(User.username == username)).first()
            if exists:
                logger.error("Username %s already exists", username)
                return None

            if is_default:
                session.query(User).update({User.is_default: False})

            user = User(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                is_default=is_default,
                is_active=True,
                updated_at=datetime.utcnow(),
            )
            session.add(user)
            session.flush()
            logger.info("Created user %s", username)
            
            # CRITICAL: Create default profile for new user
            # Profile name format: username + " פרופיל 1"
            from models.preferences import PreferenceProfile
            profile_name = f"{username} פרופיל 1"
            default_profile = PreferenceProfile(
                user_id=user.id,
                profile_name=profile_name,
                is_active=True,
                is_default=False,  # User profile, not system default
                description=f"פרופיל ברירת מחדל למשתמש {username}",
                created_by=user.id,
            )
            session.add(default_profile)
            session.flush()
            logger.info("Created default profile '%s' for user %s (ID: %s)", profile_name, username, user.id)
            
            return self._serialize_user(user)

    def update_user(self, user_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        allowed = {"username", "email", "first_name", "last_name", "is_active", "is_default"}
        updates = {k: v for k, v in kwargs.items() if k in allowed}

        if not updates:
            return self.get_user_by_id(user_id)

        with self._session_scope(commit=True) as session:
            user = session.get(User, user_id)
            if not user:
                logger.warning("User %s not found for update", user_id)
                return None

            for field, value in updates.items():
                setattr(user, field, value)

            user.updated_at = datetime.utcnow()

            if updates.get("is_default"):
                session.query(User).filter(User.id != user_id).update({User.is_default: False})

            session.flush()
            logger.info("Updated user %s", user_id)
            return self._serialize_user(user)

    def delete_user(self, user_id: int) -> bool:
        with self._session_scope(commit=True) as session:
            user = session.get(User, user_id)
            if not user:
                logger.warning("User %s not found for deletion", user_id)
                return False
            if user.is_default:
                logger.error("Cannot delete default user %s", user_id)
                return False

            user.is_active = False
            user.updated_at = datetime.utcnow()
            session.flush()
            logger.info("Soft deleted user %s", user_id)
            return True

    # ------------------------------------------------------------------
    # Preferences facade
    # ------------------------------------------------------------------
    def get_user_preferences(self, user_id: int) -> Dict[str, Any]:
        return self.preferences_service.get_all_user_preferences(user_id)

    def set_user_preferences(self, user_id: int, preferences: Dict[str, Any]) -> bool:
        return self.preferences_service.save_preferences(user_id=user_id, preferences=preferences)

    def get_user_profiles(self, user_id: int) -> List[Dict[str, Any]]:
        return self.preferences_service.get_user_profiles(user_id)

    def activate_user_profile(self, user_id: int, profile_id: int) -> bool:
        return self.preferences_service.activate_profile(user_id, profile_id)



