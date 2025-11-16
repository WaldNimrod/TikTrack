from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Iterable, List, Optional, Tuple

from flask import g
from sqlalchemy.orm import Session

from Backend.models.preferences import PreferenceProfile, UserPreference
from Backend.services.preferences_v4.registry import REGISTRY
from Backend.services.preferences_v4.etag import compute_etag_for_group, compute_etag_for_bootstrap


class PreferencesV4Service:
    """
    Group-first preferences service facade.
    Integrates with existing SQLAlchemy models and session management used by PreferencesService today.
    """

    def __init__(self, session_factory) -> None:
        self._session_factory = session_factory

    def _now_iso(self) -> str:
        return datetime.utcnow().isoformat()

    def _session_scope(self) -> Session:
        return self._session_factory()

    # ---- Profile context ----
    def build_profile_context(self, session: Session, user_id: int, profile_id: Optional[int]) -> Dict[str, Any]:
        if profile_id is None:
            profile = (
                session.query(PreferenceProfile)
                .filter(PreferenceProfile.user_id == user_id, PreferenceProfile.is_active == True)  # noqa: E712
                .order_by(PreferenceProfile.last_used_at.desc().nullslast())
                .first()
            )
        else:
            profile = session.query(PreferenceProfile).get(profile_id)
        if not profile:
            raise ValueError("Active profile not found")
        return {
            "user_id": user_id,
            "resolved_profile_id": profile.id,
            "resolved_profile": {
                "id": profile.id,
                "name": profile.profile_name or f"Profile #{profile.id}",
                "is_default": bool(profile.is_default),
                "is_active": bool(profile.is_active),
            },
            "generated_at": self._now_iso(),
        }

    # ---- Reads (group-first) ----
    def _last_updated_for_group(self, session: Session, user_id: int, profile_id: int, group: str) -> str:
        q = (
            session.query(UserPreference.updated_at)
            .filter(UserPreference.user_id == user_id, UserPreference.profile_id == profile_id)
            .filter(UserPreference.name.in_(list(REGISTRY.get_group(group).keys())))
            .order_by(UserPreference.updated_at.desc().nullslast())
        )
        last = q.first()
        return (last[0].isoformat() if last and last[0] else "0")

    def get_group(self, user_id: int, profile_id: Optional[int], group: str) -> Tuple[Dict[str, Any], str]:
        with self._session_scope() as session:
            ctx = self.build_profile_context(session, user_id, profile_id)
            pid = ctx["resolved_profile_id"]
            defs = REGISTRY.get_group(group)
            values: Dict[str, Any] = {}
            if defs:
                names = list(defs.keys())
                rows: List[UserPreference] = (
                    session.query(UserPreference)
                    .filter(
                        UserPreference.user_id == user_id,
                        UserPreference.profile_id == pid,
                        UserPreference.name.in_(names),
                    )
                    .all()
                )
                found = {r.name: r.value for r in rows}
                for nm, d in defs.items():
                    values[nm] = found.get(nm, d.default)
            last_ts = self._last_updated_for_group(session, user_id, pid, group)
            etag = compute_etag_for_group(
                user_id=user_id,
                profile_id=pid,
                group_name=group,
                registry_version=REGISTRY.version,
                last_updated_ts=last_ts,
            )
            return (
                {
                    "group": group,
                    "values": values,
                    "profile_context": ctx,
                    "generated_at": self._now_iso(),
                },
                etag,
            )

    def get_groups(self, user_id: int, profile_id: Optional[int], groups: Iterable[str]) -> Tuple[Dict[str, Any], Dict[str, str]]:
        payload: Dict[str, Any] = {}
        etags: Dict[str, str] = {}
        for group in groups:
            body, etag = self.get_group(user_id, profile_id, group)
            payload[group] = body
            etags[group] = etag
        return payload, etags

    # ---- Writes ----
    def save_group(self, user_id: int, profile_id: Optional[int], group: str, values_map: Dict[str, Any]) -> Dict[str, Any]:
        with self._session_scope() as session:
            ctx = self.build_profile_context(session, user_id, profile_id)
            pid = ctx["resolved_profile_id"]
            defs = REGISTRY.get_group(group)
            if not defs:
                raise ValueError(f"Unknown group '{group}'")
            # Validate client inputs
            for name, value in values_map.items():
                if name not in defs:
                    raise ValueError(f"Unknown preference '{name}' in group '{group}'")
                REGISTRY.validate_value(name, value)
            # Upsert rows
            existing_rows: List[UserPreference] = (
                session.query(UserPreference)
                .filter(UserPreference.user_id == user_id, UserPreference.profile_id == pid)
                .filter(UserPreference.name.in_(list(values_map.keys())))
                .all()
            )
            existing_by_name = {r.name: r for r in existing_rows}
            changed: Dict[str, Any] = {}
            for nm, val in values_map.items():
                row = existing_by_name.get(nm)
                if row is None:
                    row = UserPreference(user_id=user_id, profile_id=pid, name=nm, value=val)
                    session.add(row)
                    changed[nm] = {"old": None, "new": val}
                else:
                    if row.value != val:
                        changed[nm] = {"old": row.value, "new": val}
                        row.value = val
            session.flush()
            return {
                "success": True,
                "changed": changed,
                "profile_context": ctx,
                "generated_at": self._now_iso(),
            }

    # ---- Bootstrap ----
    def bootstrap(self, user_id: int, profile_id: Optional[int], groups: Iterable[str]) -> Tuple[Dict[str, Any], str]:
        payload, etags = self.get_groups(user_id, profile_id, groups)
        # Assume all share same context from any group fetch
        any_group = next(iter(payload.values()))
        ctx = any_group["profile_context"] if isinstance(any_group, dict) else {}
        bootstrap_etag = compute_etag_for_bootstrap(
            user_id=ctx.get("user_id", user_id),
            profile_id=ctx.get("resolved_profile_id", profile_id or 0),
            registry_version=REGISTRY.version,
            group_etags=etags,
            generated_at=self._now_iso(),
        )
        return {
            "profile_context": ctx,
            "groups": {g: payload[g]["values"] for g in payload.keys()},
            "group_etags": etags,
            "generated_at": self._now_iso(),
        }, bootstrap_etag



