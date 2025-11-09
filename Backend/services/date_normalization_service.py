"""
Date Normalization Service
==========================

Centralized helper for converting datetime values between UTC storage and
user-facing timezones. Produces the DateEnvelope structure consumed by the
frontend and converts incoming payloads back to UTC-aware datetime objects.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple, Union

import pytz

# Lazy import typing for mypy friendliness without heavy dependencies at module import
JSONDict = Dict[str, Any]
JSONLike = Union[JSONDict, List[Any]]
DatetimeInput = Optional[Union[datetime, str, int, float]]


@dataclass
class DateEnvelope:
    """Serializable container for datetime values."""

    utc: Optional[str]
    epoch_ms: Optional[int]
    local: Optional[str]
    timezone: str
    display: Optional[str]

    def to_dict(self) -> JSONDict:
        return {
            "utc": self.utc,
            "epochMs": self.epoch_ms,
            "local": self.local,
            "timezone": self.timezone,
            "display": self.display,
        }


class DateNormalizationService:
    """Utility for converting datetime values to/from DateEnvelope representation."""

    _ISO_DATETIME_WITH_OFFSET = re.compile(
        r"^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?(Z|[+-]\d{2}:?\d{2})?$"
    )
    _ISO_DATE_ONLY = re.compile(r"^\d{4}-\d{2}-\d{2}$")
    _DATE_KEY_HINTS = ("date", "time", "timestamp", "_at", "_on", "fetched", "asof")
    _DEFAULT_DISPLAY_FORMAT = "%d/%m/%Y %H:%M"

    def __init__(self, user_timezone: str = "UTC") -> None:
        self.user_timezone = self._validate_timezone(user_timezone)
        self._user_tz = pytz.timezone(self.user_timezone)

    # ------------------------------------------------------------------
    # Public helpers
    # ------------------------------------------------------------------
    def normalize_output(self, payload: Any) -> Any:
        """Convert datetimes inside payload to DateEnvelope objects."""
        if payload is None:
            return None
        if isinstance(payload, list):
            return [self.normalize_output(item) for item in payload]
        if isinstance(payload, tuple):
            return tuple(self.normalize_output(item) for item in payload)
        if isinstance(payload, dict):
            return self._normalize_dict_output(payload)
        if isinstance(payload, datetime):
            return self._to_envelope(payload).to_dict()
        return payload

    def normalize_input_payload(self, payload: Any) -> Any:
        """Convert incoming payload values (user timezone) into UTC datetimes."""
        if payload is None:
            return None
        if isinstance(payload, list):
            return [self.normalize_input_payload(item) for item in payload]
        if isinstance(payload, tuple):
            return tuple(self.normalize_input_payload(item) for item in payload)
        if isinstance(payload, dict):
            if self._is_envelope_dict(payload):
                return self._parse_envelope_input(payload)
            return {
                key: self.normalize_input_payload(value)
                if not self._should_attempt_conversion(key, value, incoming=True)
                else self._parse_user_datetime(value)
                for key, value in payload.items()
                if key != "timezone"
            }
        if self._should_attempt_conversion(None, payload, incoming=True):
            return self._parse_user_datetime(payload)
        return payload

    def now_envelope(self) -> JSONDict:
        return self._to_envelope(datetime.now(timezone.utc)).to_dict()

    # ------------------------------------------------------------------
    # Class helpers
    # ------------------------------------------------------------------
    @classmethod
    def resolve_timezone(
        cls,
        flask_request,
        preferences_service=None,
        fallback_user_id: Optional[int] = None,
    ) -> str:
        """Resolve timezone from request or user preferences."""
        timezone_value = None
        try:
            timezone_value = flask_request.args.get("timezone")
        except Exception:
            timezone_value = None

        if not timezone_value and flask_request.is_json:
            body = flask_request.get_json(silent=True) or {}
            timezone_value = body.get("timezone")

        if timezone_value:
            return cls._safe_validate_timezone(timezone_value)

        user_id = None
        try:
            user_id = flask_request.args.get("user_id", type=int)
        except Exception:
            user_id = None
        if not user_id and flask_request.is_json:
            body = flask_request.get_json(silent=True) or {}
            user_id = body.get("user_id")
        if not user_id:
            user_id = fallback_user_id or 1

        if preferences_service is None:
            try:
                from services.preferences_service import PreferencesService

                preferences_service = PreferencesService()
            except Exception:
                preferences_service = None

        if preferences_service:
            try:
                user_timezone = preferences_service.get_preference(user_id, "timezone")
                if user_timezone:
                    return cls._safe_validate_timezone(user_timezone)
            except Exception:
                pass

        return "UTC"

    # ------------------------------------------------------------------
    # Internal conversion helpers
    # ------------------------------------------------------------------
    def _normalize_dict_output(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        normalized: Dict[str, Any] = {}
        for key, value in payload.items():
            if isinstance(value, dict):
                if self._is_envelope_dict(value):
                    normalized[key] = value
                elif self._should_attempt_conversion(key, value):
                    normalized[key] = self.normalize_output(value)
                else:
                    normalized[key] = self._normalize_dict_output(value)
            elif isinstance(value, list):
                normalized[key] = [self.normalize_output(item) for item in value]
            elif isinstance(value, datetime) or self._should_attempt_conversion(key, value):
                envelope = self._to_envelope(value)
                normalized[key] = envelope.to_dict() if envelope else None
            else:
                normalized[key] = value
        return normalized

    def _to_envelope(self, value: DatetimeInput) -> DateEnvelope:
        dt_utc = self._ensure_utc_datetime(value)
        if not dt_utc:
            return DateEnvelope(utc=None, epoch_ms=None, local=None, timezone=self.user_timezone, display=None)

        epoch_ms = int(dt_utc.timestamp() * 1000)
        local_dt = dt_utc.astimezone(self._user_tz)
        return DateEnvelope(
            utc=dt_utc.isoformat().replace("+00:00", "Z"),
            epoch_ms=epoch_ms,
            local=local_dt.isoformat(),
            timezone=self.user_timezone,
            display=local_dt.strftime(self._DEFAULT_DISPLAY_FORMAT),
        )

    def _ensure_utc_datetime(self, value: DatetimeInput) -> Optional[datetime]:
        if value is None:
            return None
        if isinstance(value, datetime):
            if value.tzinfo is None:
                return value.replace(tzinfo=timezone.utc)
            return value.astimezone(timezone.utc)
        if isinstance(value, (int, float)):
            # Assume seconds if < 10^12 otherwise milliseconds
            if value > 1_000_000_000_000:
                value /= 1000.0
            return datetime.fromtimestamp(value, tz=timezone.utc)
        if isinstance(value, str):
            parsed = self._parse_datetime_string(value, assume_utc=True)
            return parsed
        return None

    def _parse_user_datetime(self, value: DatetimeInput) -> Optional[datetime]:
        if value is None:
            return None
        if isinstance(value, datetime):
            if value.tzinfo is None:
                localized = self._user_tz.localize(value)
            else:
                localized = value.astimezone(self._user_tz)
            return localized.astimezone(timezone.utc).replace(tzinfo=None)
        if isinstance(value, (int, float)):
            if value > 1_000_000_000_000:
                value /= 1000.0
            return datetime.fromtimestamp(value, tz=timezone.utc).replace(tzinfo=None)
        if isinstance(value, dict):
            if self._is_envelope_dict(value):
                return self._parse_envelope_input(value)
            return None
        if isinstance(value, str):
            value = value.strip()
            envelope = self._parse_datetime_string(value, assume_utc=False, localize_user=True)
            if envelope:
                return envelope.astimezone(timezone.utc).replace(tzinfo=None)
        return None

    def _parse_envelope_input(self, envelope: Dict[str, Any]) -> Optional[datetime]:
        utc_value = envelope.get("utc") or envelope.get("UTC")
        if utc_value:
            dt = self._parse_datetime_string(str(utc_value), assume_utc=True)
            if dt:
                return dt.replace(tzinfo=None)
        epoch = envelope.get("epochMs")
        if epoch is not None:
            return self._parse_user_datetime(epoch)
        local_val = envelope.get("local")
        if local_val:
            dt = self._parse_datetime_string(str(local_val), assume_utc=False, localize_user=True)
            if dt:
                return dt.astimezone(timezone.utc).replace(tzinfo=None)
        return None

    def _parse_datetime_string(
        self,
        value: str,
        *,
        assume_utc: bool = False,
        localize_user: bool = False,
    ) -> Optional[datetime]:
        if not value:
            return None
        value = value.strip()

        try:
            if self._ISO_DATETIME_WITH_OFFSET.match(value):
                dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    if assume_utc and not localize_user:
                        return dt.replace(tzinfo=timezone.utc)
                    if localize_user:
                        localized = self._user_tz.localize(dt)
                        return localized if not assume_utc else localized.astimezone(timezone.utc)
                    return dt.replace(tzinfo=timezone.utc)
                if assume_utc:
                    return dt.astimezone(timezone.utc)
                return dt
        except ValueError:
            dt = None
        else:
            return dt

        try:
            if self._ISO_DATE_ONLY.match(value):
                dt = datetime.strptime(value, "%Y-%m-%d")
                if localize_user:
                    localized = self._user_tz.localize(dt)
                    return localized if not assume_utc else localized.astimezone(timezone.utc)
                tzinfo = timezone.utc if assume_utc else None
                return dt.replace(tzinfo=tzinfo)
        except ValueError:
            pass

        # Try fallback common format
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M"):
            try:
                dt = datetime.strptime(value, fmt)
                if localize_user:
                    localized = self._user_tz.localize(dt)
                    return localized if not assume_utc else localized.astimezone(timezone.utc)
                tzinfo = timezone.utc if assume_utc else None
                return dt.replace(tzinfo=tzinfo)
            except ValueError:
                continue
        return None

    def _should_attempt_conversion(self, key: Optional[str], value: Any, incoming: bool = False) -> bool:
        if value is None:
            return False
        if isinstance(value, datetime):
            return True
        if isinstance(value, (int, float)):
            # Only treat numeric values as dates if key hints suggest so
            return key is not None and any(hint in key.lower() for hint in self._DATE_KEY_HINTS)
        if isinstance(value, str):
            if key and any(hint in key.lower() for hint in self._DATE_KEY_HINTS):
                return True
            return bool(self._ISO_DATETIME_WITH_OFFSET.match(value.strip()) or self._ISO_DATE_ONLY.match(value.strip()))
        if isinstance(value, dict):
            return incoming and self._is_envelope_dict(value)
        return False

    @staticmethod
    def _is_envelope_dict(value: Dict[str, Any]) -> bool:
        required_keys = {"utc", "epochMs", "local", "timezone"}
        return required_keys.issubset(value.keys())

    @staticmethod
    def _validate_timezone(timezone_name: str) -> str:
        try:
            pytz.timezone(timezone_name)
            return timezone_name
        except (pytz.UnknownTimeZoneError, AttributeError):
            return "UTC"

    @classmethod
    def _safe_validate_timezone(cls, timezone_name: str) -> str:
        return cls._validate_timezone(timezone_name or "UTC")


__all__ = ["DateNormalizationService", "DateEnvelope"]
