"""
System Settings Service
-----------------------
Generic system-level settings store (groups/types/values) with caching and
validation. Designed to persist configuration for multiple subsystems
without using user preferences.

Author: TikTrack Development Team
Date: 2025-10-13
"""

from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import json
import logging

from models.system_settings import (
    SystemSettingGroup,
    SystemSettingType,
    SystemSetting,
)
from services.advanced_cache_service import cache_with_deps, invalidate_cache

logger = logging.getLogger(__name__)


class SystemSettingsService:
    """
    Read/write access to system-level settings with type validation and caching.
    """

    def __init__(self, db_session: Session):
        self.db = db_session

    # Cache group lookups for 5 minutes; depend on 'preferences' and 'external_data'
    @cache_with_deps(ttl=300, dependencies=['preferences', 'external_data'])
    def get_setting(self, key: str, default: Optional[Any] = None) -> Any:
        try:
            s_type = (
                self.db.query(SystemSettingType)
                .filter(SystemSettingType.key == key, SystemSettingType.is_active == True)
                .first()
            )
            if not s_type:
                return default

            # Value precedence: system_settings.value -> type.default_value -> default
            s_value = (
                self.db.query(SystemSetting)
                .filter(SystemSetting.type_id == s_type.id)
                .order_by(SystemSetting.updated_at.desc())
                .first()
            )

            raw = s_value.value if s_value and s_value.value is not None else s_type.default_value
            return self._parse_value(raw, s_type.data_type, default)
        except SQLAlchemyError as e:
            logger.error(f"get_setting failed for key '{key}': {e}")
            return default

    @cache_with_deps(ttl=300, dependencies=['preferences', 'external_data'])
    def get_group_settings(self, group_name: str) -> Dict[str, Any]:
        try:
            group = (
                self.db.query(SystemSettingGroup)
                .filter(SystemSettingGroup.name == group_name)
                .first()
            )
            if not group:
                return {}

            results: Dict[str, Any] = {}
            types = (
                self.db.query(SystemSettingType)
                .filter(SystemSettingType.group_id == group.id, SystemSettingType.is_active == True)
                .all()
            )
            for s_type in types:
                s_value = (
                    self.db.query(SystemSetting)
                    .filter(SystemSetting.type_id == s_type.id)
                    .order_by(SystemSetting.updated_at.desc())
                    .first()
                )
                raw = s_value.value if s_value and s_value.value is not None else s_type.default_value
                results[s_type.key] = self._parse_value(raw, s_type.data_type, None)
            return results
        except SQLAlchemyError as e:
            logger.error(f"get_group_settings failed for '{group_name}': {e}")
            return {}

    @invalidate_cache(['preferences', 'external_data'])
    def set_setting(self, key: str, value: Any, updated_by: Optional[str] = None) -> bool:
        try:
            s_type = (
                self.db.query(SystemSettingType)
                .filter(SystemSettingType.key == key, SystemSettingType.is_active == True)
                .first()
            )
            if not s_type:
                logger.error(f"SystemSettingType not found for key '{key}'")
                return False

            # Validate & serialize value according to data_type
            serialized = self._serialize_value(value, s_type.data_type)

            entry = SystemSetting(type_id=s_type.id, value=serialized, updated_by=updated_by)
            self.db.add(entry)
            self.db.commit()
            return True
        except SQLAlchemyError as e:
            logger.error(f"set_setting failed for key '{key}': {e}")
            self.db.rollback()
            return False

    # Internal helpers
    def _parse_value(self, raw: Optional[str], data_type: str, default: Any) -> Any:
        if raw is None:
            return default
        try:
            if data_type in ('integer', 'int'):
                return int(raw)
            if data_type in ('number', 'float'):
                return float(raw)
            if data_type == 'boolean':
                return str(raw).lower() in ('1', 'true', 'yes')
            if data_type == 'json':
                return json.loads(raw)
            # string or unknown
            return str(raw)
        except Exception:
            return default

    def _serialize_value(self, value: Any, data_type: str) -> str:
        if value is None:
            return None
        if data_type in ('integer', 'int'):
            return str(int(value))
        if data_type in ('number', 'float'):
            return str(float(value))
        if data_type == 'boolean':
            return 'true' if bool(value) else 'false'
        if data_type == 'json':
            return json.dumps(value, ensure_ascii=False)
        return str(value)


