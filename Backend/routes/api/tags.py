from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import logging

from config.database import get_db
from services.tag_service import TagService
from services.user_service import UserService
from services.date_normalization_service import DateNormalizationService
from services.preferences_service import PreferencesService

from .base_entity_decorators import handle_database_session

logger = logging.getLogger(__name__)

tags_bp = Blueprint("tags", __name__, url_prefix="/api/tags")
preferences_service = PreferencesService()
user_service = UserService()


def _resolve_user_id() -> int:
    """Return active user id (defaults to 1 if not configured)."""
    default_user = user_service.get_default_user()
    return default_user["id"] if default_user else 1


def _normalize_timestamp():
    timezone_name = DateNormalizationService.resolve_timezone(
        request, preferences_service=preferences_service
    )
    return DateNormalizationService(timezone_name)


def _serialize_categories(categories: List) -> List[Dict[str, Any]]:
    serialized: List[Dict[str, Any]] = []
    for category in categories:
        data = category.to_dict()
        tags = getattr(category, "tags", []) or []
        active_count = sum(1 for tag in tags if getattr(tag, "is_active", True))
        data["tags_count"] = active_count if active_count else data.get("tag_count", 0)
        data.pop("tag_count", None)
        serialized.append(data)
    return serialized


def _serialize_tags(tags: List) -> List[Dict[str, Any]]:
    serialized: List[Dict[str, Any]] = []
    for tag in tags:
        data = tag.to_dict()
        category = getattr(tag, "category", None)
        if category:
            data["category_name"] = getattr(category, "name", None)
            data["category_color"] = getattr(category, "color_hex", None)
        else:
            data["category_name"] = None
            data["category_color"] = None
        serialized.append(data)
    return serialized


@tags_bp.route("/categories", methods=["GET"])
@handle_database_session()
def list_categories():
    """Return all tag categories for the active user."""
    db: Session = g.db
    normalizer = _normalize_timestamp()
    user_id = _resolve_user_id()
    categories = TagService.get_categories(db, user_id)
    return jsonify(
        {
            "status": "success",
            "data": normalizer.normalize_output(_serialize_categories(categories)),
            "message": "Categories retrieved successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0",
        }
    )


@tags_bp.route("/categories", methods=["POST"])
@handle_database_session()
def create_category():
    """Create a new tag category."""
    db: Session = g.db
    normalizer = _normalize_timestamp()
    payload = request.get_json(force=True) or {}
    user_id = _resolve_user_id()

    try:
        category = TagService.create_category(
            db,
            user_id=user_id,
            name=payload.get("name", ""),
            color_hex=payload.get("color_hex"),
            order_index=payload.get("order_index"),
            is_active=payload.get("is_active", True),
        )
        return jsonify(
            {
                "status": "success",
                "data": normalizer.normalize_output(category.to_dict()),
                "message": "Category created successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0",
            }
        )
    except ValueError as exc:
        logger.warning("Failed to create category: %s", exc)
        return (
            jsonify(
                {
                    "status": "error",
                    "error": {"message": str(exc)},
                    "version": "1.0",
                }
            ),
            400,
        )
    except Exception as exc:
        logger.exception("Unexpected error creating category")
        return (
            jsonify(
                {
                    "status": "error",
                    "error": {"message": str(exc)},
                    "version": "1.0",
                }
            ),
            500,
        )


@tags_bp.route("/categories/<int:category_id>", methods=["PUT"])
@handle_database_session()
def update_category(category_id: int):
    """Update category metadata."""
    db: Session = g.db
    normalizer = _normalize_timestamp()
    payload = request.get_json(force=True) or {}
    user_id = _resolve_user_id()

    try:
        category = TagService.update_category(
            db,
            category_id,
            user_id,
            name=payload.get("name"),
            color_hex=payload.get("color_hex"),
            order_index=payload.get("order_index"),
            is_active=payload.get("is_active"),
        )
        if not category:
            return (
                jsonify(
                    {
                        "status": "error",
                        "error": {"message": "Category not found"},
                        "version": "1.0",
                    }
                ),
                404,
            )
        return jsonify(
            {
                "status": "success",
                "data": normalizer.normalize_output(category.to_dict()),
                "message": "Category updated successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0",
            }
        )
    except ValueError as exc:
        logger.warning("Failed to update category %s: %s", category_id, exc)
        return (
            jsonify(
                {
                    "status": "error",
                    "error": {"message": str(exc)},
                    "version": "1.0",
                }
            ),
            400,
        )


@tags_bp.route("/categories/<int:category_id>", methods=["DELETE"])
@handle_database_session()
def delete_category(category_id: int):
    """Delete category and cascade tags."""
    db: Session = g.db
    user_id = _resolve_user_id()
    normalizer = _normalize_timestamp()

    deleted = TagService.delete_category(db, category_id, user_id)
    if not deleted:
        return (
            jsonify(
                {
                    "status": "error",
                    "error": {"message": "Category not found"},
                    "version": "1.0",
                }
            ),
            404,
        )
    return jsonify(
        {
            "status": "success",
            "data": True,
            "message": "Category deleted successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0",
        }
    )


# IMPORTANT: Specific routes (without path parameters) must come BEFORE routes with path parameters
# Otherwise Flask will try to match "/search" as "<int:tag_id>" and fail

@tags_bp.route("/search", methods=["GET"])
@handle_database_session()
def search_tags():
    """Search tags by query string and return with assignments."""
    db: Session = g.db
    user_id = _resolve_user_id()
    normalizer = _normalize_timestamp()

    query = request.args.get("query", "").strip()
    entity_type = request.args.get("entity_type") or None
    limit = request.args.get("limit", default=25, type=int)
    include_inactive = request.args.get("include_inactive", "false").lower() == "true"

    try:
        results = TagService.search_tags(
            db,
            user_id,
            query,
            entity_type=entity_type,
            limit=limit,
            include_inactive=include_inactive,
        )
        return jsonify(
            {
                "status": "success",
                "data": normalizer.normalize_output(results),
                "message": "Tag search completed successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0",
            }
        )
    except ValueError as exc:
        logger.warning("Tag search failed: %s", exc)
        return (
            jsonify(
                {
                    "status": "error",
                    "error": {"message": str(exc)},
                    "version": "1.0",
                }
            ),
            400,
        )


@tags_bp.route("/cloud", methods=["GET"])
@handle_database_session()
def get_tag_cloud():
    """Return tag cloud data with usage counts for dashboard display."""
    db: Session = g.db
    user_id = _resolve_user_id()
    limit = request.args.get("limit", default=50, type=int)
    normalizer = _normalize_timestamp()

    cloud = TagService.get_tag_cloud_data(db, user_id, limit=limit)
    return jsonify(
        {
            "status": "success",
            "data": normalizer.normalize_output(cloud),
            "message": "Tag cloud data retrieved successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0",
        }
    )


@tags_bp.route("/", methods=["GET"])
@handle_database_session()
def list_tags():
    """Return tags for user with optional filters."""
    db: Session = g.db
    user_id = _resolve_user_id()
    include_inactive = request.args.get("include_inactive", "false").lower() == "true"
    category_id = request.args.get("category_id", type=int)
    normalizer = _normalize_timestamp()

    tags = TagService.get_tags(
        db,
        user_id,
        include_inactive=include_inactive,
        category_id=category_id,
    )
    return jsonify(
        {
            "status": "success",
            "data": normalizer.normalize_output(_serialize_tags(tags)),
            "message": "Tags retrieved successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0",
        }
    )


@tags_bp.route("/", methods=["POST"])
@handle_database_session()
def create_tag():
    """Create a new tag."""
    db: Session = g.db
    payload = request.get_json(force=True) or {}
    user_id = _resolve_user_id()
    normalizer = _normalize_timestamp()

    try:
        tag = TagService.create_tag(
            db,
            user_id=user_id,
            name=payload.get("name", ""),
            category_id=payload.get("category_id"),
            description=payload.get("description"),
            is_active=payload.get("is_active", True),
        )
        return jsonify(
            {
                "status": "success",
                "data": normalizer.normalize_output(tag.to_dict()),
                "message": "Tag created successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0",
            }
        )
    except ValueError as exc:
        logger.warning("Failed to create tag: %s", exc)
        return (
            jsonify(
                {
                    "status": "error",
                    "error": {"message": str(exc)},
                    "version": "1.0",
                }
            ),
            400,
        )


@tags_bp.route("/<int:tag_id>", methods=["PUT"])
@handle_database_session()
def update_tag(tag_id: int):
    """Update tag metadata."""
    db: Session = g.db
    payload = request.get_json(force=True) or {}
    user_id = _resolve_user_id()
    normalizer = _normalize_timestamp()

    try:
        tag = TagService.update_tag(
            db,
            tag_id,
            user_id,
            name=payload.get("name"),
            category_id=payload.get("category_id"),
            description=payload.get("description"),
            is_active=payload.get("is_active"),
        )
        if not tag:
            return (
                jsonify(
                    {
                        "status": "error",
                        "error": {"message": "Tag not found"},
                        "version": "1.0",
                    }
                ),
                404,
            )
        return jsonify(
            {
                "status": "success",
                "data": normalizer.normalize_output(tag.to_dict()),
                "message": "Tag updated successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0",
            }
        )
    except ValueError as exc:
        logger.warning("Failed to update tag %s: %s", tag_id, exc)
        return (
            jsonify(
                {
                    "status": "error",
                    "error": {"message": str(exc)},
                    "version": "1.0",
                }
            ),
            400,
        )


@tags_bp.route("/<int:tag_id>", methods=["DELETE"])
@handle_database_session()
def delete_tag(tag_id: int):
    """Delete tag and its associations."""
    db: Session = g.db
    user_id = _resolve_user_id()
    normalizer = _normalize_timestamp()

    deleted = TagService.delete_tag(db, tag_id, user_id)
    if not deleted:
        return (
            jsonify(
                {
                    "status": "error",
                    "error": {"message": "Tag not found"},
                    "version": "1.0",
                }
            ),
            404,
        )
    return jsonify(
        {
            "status": "success",
            "data": True,
            "message": "Tag deleted successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0",
        }
    )


@tags_bp.route("/entity/<string:entity_type>/<int:entity_id>", methods=["GET"])
@handle_database_session()
def get_entity_tags(entity_type: str, entity_id: int):
    """Return tags assigned to a specific entity."""
    db: Session = g.db
    user_id = _resolve_user_id()
    normalizer = _normalize_timestamp()

    try:
        tags = TagService.get_tags_for_entity(db, entity_type, entity_id, user_id)
        return jsonify(
            {
                "status": "success",
                "data": normalizer.normalize_output(_serialize_tags(tags)),
                "message": "Entity tags retrieved successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0",
            }
        )
    except ValueError as exc:
        logger.warning("Failed to fetch entity tags: %s", exc)
        return (
            jsonify(
                {
                    "status": "error",
                    "error": {"message": str(exc)},
                    "version": "1.0",
                }
            ),
            400,
        )


@tags_bp.route("/assign", methods=["POST"])
@handle_database_session()
def assign_tags():
    """
    Replace tags for entity (idempotent) – expects entity_type, entity_id, tag_ids.
    """
    db: Session = g.db
    payload = request.get_json(force=True) or {}
    user_id = _resolve_user_id()
    normalizer = _normalize_timestamp()

    try:
        entity_type = payload["entity_type"]
        entity_id = int(payload["entity_id"])
        tag_ids = payload.get("tag_ids", [])
    except (KeyError, ValueError, TypeError):
        return (
            jsonify(
                {
                    "status": "error",
                    "error": {"message": "Invalid payload"},
                    "version": "1.0",
                }
            ),
            400,
        )

    try:
        tags = TagService.replace_tags_for_entity(
            db,
            user_id,
            entity_type,
            entity_id,
            tag_ids,
            created_by=user_id,
        )
        return jsonify(
            {
                "status": "success",
                "data": normalizer.normalize_output(_serialize_tags(tags)),
                "message": "Tags updated successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0",
            }
        )
    except ValueError as exc:
        logger.warning("Failed to assign tags: %s", exc)
        return (
            jsonify(
                {
                    "status": "error",
                    "error": {"message": str(exc)},
                    "version": "1.0",
                }
            ),
            400,
        )


@tags_bp.route("/remove", methods=["POST"])
@handle_database_session()
def remove_tag():
    """Remove a single tag from entity."""
    db: Session = g.db
    payload = request.get_json(force=True) or {}
    normalizer = _normalize_timestamp()

    try:
        tag_id = int(payload["tag_id"])
        entity_type = payload["entity_type"]
        entity_id = int(payload["entity_id"])
    except (KeyError, ValueError, TypeError):
        return (
            jsonify(
                {
                    "status": "error",
                    "error": {"message": "Invalid payload"},
                    "version": "1.0",
                }
            ),
            400,
        )

    try:
        removed = TagService.remove_tag_from_entity(db, tag_id, entity_type, entity_id)
        if not removed:
            return (
                jsonify(
                    {
                        "status": "error",
                        "error": {"message": "Tag link not found"},
                        "version": "1.0",
                    }
                ),
                404,
            )
        return jsonify(
            {
                "status": "success",
                "data": True,
                "message": "Tag removed successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0",
            }
        )
    except ValueError as exc:
        return (
            jsonify(
                {
                    "status": "error",
                    "error": {"message": str(exc)},
                    "version": "1.0",
                }
            ),
            400,
        )


@tags_bp.route("/suggestions", methods=["GET"])
@handle_database_session()
def get_suggestions():
    """Return suggested tags for quick pick."""
    db: Session = g.db
    user_id = _resolve_user_id()
    entity_type = request.args.get("entity_type")
    limit = request.args.get("limit", default=10, type=int)
    normalizer = _normalize_timestamp()

    try:
        tags = TagService.get_suggestions(
            db, user_id, entity_type=entity_type, limit=limit
        )
        return jsonify(
            {
                "status": "success",
                "data": normalizer.normalize_output(_serialize_tags(tags)),
                "message": "Suggestions retrieved successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0",
            }
        )
    except ValueError as exc:
        return (
            jsonify(
                {
                    "status": "error",
                    "error": {"message": str(exc)},
                    "version": "1.0",
                }
            ),
            400,
        )


@tags_bp.route("/analytics", methods=["GET"])
@handle_database_session()
def get_analytics():
    """Return analytics summary for tags."""
    db: Session = g.db
    user_id = _resolve_user_id()
    limit = request.args.get("limit", default=10, type=int)
    normalizer = _normalize_timestamp()

    analytics = TagService.get_analytics(db, user_id, limit=limit)
    return jsonify(
        {
            "status": "success",
            "data": normalizer.normalize_output(analytics),
            "message": "Tag analytics retrieved successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0",
        }
    )

