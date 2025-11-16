from __future__ import annotations

from datetime import datetime
from typing import Any, Iterable, Optional

from flask import Blueprint, jsonify, request, g

from config.database import SessionLocal
from routes.api.base_entity_decorators import require_authentication
from services.preferences_v4.service import PreferencesV4Service


preferences_v4_bp = Blueprint("preferences_v4", __name__, url_prefix="/api/preferences")
_service = PreferencesV4Service(session_factory=SessionLocal)


def _json_error(status_code: int, error_code: str, message: str, details: Any = None):
    resp = jsonify(
        {
            "status": "error",
            "error_code": error_code,
            "message": message,
            "details": details,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )
    return resp, status_code


@preferences_v4_bp.route("/bootstrap", methods=["GET"])
@require_authentication()
def bootstrap() -> Any:
    user_id = getattr(g, "user_id", None)
    if not user_id:
        return _json_error(401, "unauthorized", "Authentication required")
    profile_id_param = request.args.get("profile_id", type=int)
    groups_param = request.args.get("groups", default="colors,ui,trading", type=str)
    groups: Iterable[str] = [g.strip() for g in groups_param.split(",") if g.strip()]

    body, etag = _service.bootstrap(user_id=user_id, profile_id=profile_id_param, groups=groups)
    client_etag = request.headers.get("If-None-Match")
    if client_etag and client_etag == etag:
        resp = jsonify({"status": "not_modified"})
        resp.status_code = 304
        resp.headers["ETag"] = etag
        resp.headers["Cache-Control"] = "no-cache"
        return resp
    resp = jsonify({"success": True, "data": body, "timestamp": datetime.utcnow().isoformat()})
    resp.headers["ETag"] = etag
    resp.headers["Cache-Control"] = "no-cache"
    return resp


@preferences_v4_bp.route("/user/group", methods=["GET"])
@require_authentication()
def get_group() -> Any:
    user_id = getattr(g, "user_id", None)
    if not user_id:
        return _json_error(401, "unauthorized", "Authentication required")
    group = request.args.get("group", type=str)
    if not group:
        return _json_error(400, "bad_request", "Missing 'group' parameter")
    profile_id_param = request.args.get("profile_id", type=int)
    body, etag = _service.get_group(user_id=user_id, profile_id=profile_id_param, group=group)
    client_etag = request.headers.get("If-None-Match")
    if client_etag and client_etag == etag:
        resp = jsonify({"status": "not_modified"})
        resp.status_code = 304
        resp.headers["ETag"] = etag
        resp.headers["Cache-Control"] = "no-cache"
        return resp
    resp = jsonify({"success": True, "data": body, "timestamp": datetime.utcnow().isoformat()})
    resp.headers["ETag"] = etag
    resp.headers["Cache-Control"] = "no-cache"
    return resp


@preferences_v4_bp.route("/user/groups", methods=["GET"])
@require_authentication()
def get_groups() -> Any:
    user_id = getattr(g, "user_id", None)
    if not user_id:
        return _json_error(401, "unauthorized", "Authentication required")
    groups_param = request.args.get("groups", type=str)
    if not groups_param:
        return _json_error(400, "bad_request", "Missing 'groups' parameter")
    profile_id_param = request.args.get("profile_id", type=int)
    groups = [g.strip() for g in groups_param.split(",") if g.strip()]
    payload, etags = _service.get_groups(user_id=user_id, profile_id=profile_id_param, groups=groups)
    resp = jsonify(
        {
            "success": True,
            "data": payload,
            "group_etags": etags,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )
    resp.headers["Cache-Control"] = "no-cache"
    return resp


@preferences_v4_bp.route("/user/group", methods=["POST"])
@require_authentication()
def save_group() -> Any:
    user_id = getattr(g, "user_id", None)
    if not user_id:
        return _json_error(401, "unauthorized", "Authentication required")
    data = request.get_json(silent=True) or {}
    group = data.get("group")
    values = data.get("values") or {}
    if not group or not isinstance(values, dict):
        return _json_error(400, "bad_request", "Body must include group and values map")
    profile_id_param = data.get("profile_id")
    try:
        result = _service.save_group(user_id=user_id, profile_id=profile_id_param, group=group, values_map=values)
        return jsonify({"success": True, "data": result, "timestamp": datetime.utcnow().isoformat()})
    except ValueError as ve:
        return _json_error(400, "validation_error", str(ve))
    except Exception as e:
        return _json_error(500, "server_error", "Failed to save group", {"error": str(e)})



