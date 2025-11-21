import os
import sys
import sqlite3
from datetime import datetime
from uuid import uuid4

import pytest

BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from Backend.app import create_app
from Backend.services.preferences_service import preferences_service


@pytest.fixture(scope="module")
def client():
    app = create_app({"TESTING": True})
    with app.test_client() as test_client:
        yield test_client


def test_indexeddb_endpoints_return_service_unavailable(client):
    cases = [
        ("get", "/api/indexeddb/stats", "statistics"),
        ("post", "/api/indexeddb/cleanup/2048", "cleanup"),
        ("post", "/api/indexeddb/backup", "backup"),
        ("post", "/api/indexeddb/restore", "restore"),
        ("post", "/api/indexeddb/clear", "clearing"),
    ]

    for method, path, fragment in cases:
        response = getattr(client, method)(path)
        data = response.get_json()

        assert response.status_code == 503
        assert data["success"] is False
        assert fragment.lower() in data["error"].lower()


def _resolve_or_create_profile(user_id: int) -> int:
    conn = sqlite3.connect(preferences_service.db_path)
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id
            FROM preference_profiles
            WHERE user_id = ?
            ORDER BY is_active DESC, is_default DESC, id ASC
            LIMIT 1
            """,
            (user_id,),
        )
        row = cursor.fetchone()
        if row:
            return row[0]

        cursor.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM preference_profiles")
        new_id = cursor.fetchone()[0]
        cursor.execute(
            """
            INSERT INTO preference_profiles
            (id, user_id, profile_name, is_active, is_default, description, created_by, created_at)
            VALUES (?, ?, ?, 1, 1, 'Auto test profile', ?, CURRENT_TIMESTAMP)
            """,
            (new_id, user_id, f"test-profile-{uuid4().hex[:6]}", user_id),
        )
        conn.commit()
        return new_id
    finally:
        conn.close()


def _cleanup_saved_preference(user_id: int, profile_id: int, preference_name: str, saved_value: str) -> None:
    conn = sqlite3.connect(preferences_service.db_path)
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id FROM preference_types WHERE preference_name = ?",
            (preference_name,),
        )
        row = cursor.fetchone()
        if not row:
            return
        preference_id = row[0]
        cursor.execute(
            """
            DELETE FROM user_preferences_v3
            WHERE user_id = ? AND profile_id = ? AND preference_id = ? AND saved_value = ?
            """,
            (user_id, profile_id, preference_id, saved_value),
        )
        conn.commit()
    finally:
        conn.close()


def test_preferences_version_and_update_checks_reflect_database(client):
    user_id = 1
    profile_id = _resolve_or_create_profile(user_id)
    unique_value = f"Auto-{datetime.utcnow().isoformat()}"
    preference_name = "timezone"

    preferences_service.save_preferences(
        user_id=user_id,
        preferences={preference_name: unique_value},
        profile_id=profile_id,
    )

    try:
        version_response = client.get(
            "/api/preferences/version",
            query_string={"user_id": user_id, "profile_id": profile_id},
        )
        assert version_response.status_code == 200
        version_payload = version_response.get_json()
        assert version_payload["success"] is True
        version_data = version_payload["data"]
        assert version_data["version"]
        assert isinstance(version_data["last_update"], dict)
        last_update_payload = version_data["last_update"]
        last_update_iso = last_update_payload["utc"]
        assert last_update_iso
        normalized_version = last_update_iso.replace("-", "").replace(":", "").replace("Z", "")
        assert version_data["version"] == normalized_version

        since_exact = last_update_iso.replace("Z", "")
        same_timestamp_response = client.get(
            "/api/preferences/user/check-updates",
            query_string={"user_id": user_id, "profile_id": profile_id, "since": since_exact},
        )
        same_payload = same_timestamp_response.get_json()
        assert same_timestamp_response.status_code == 200
        assert same_payload["success"] is True
        assert same_payload["lastUpdate"]["utc"] == last_update_iso

        older_response = client.get(
            "/api/preferences/user/check-updates",
            query_string={
                "user_id": user_id,
                "profile_id": profile_id,
                "since": "2000-01-01T00:00:00",
            },
        )
        older_payload = older_response.get_json()
        assert older_response.status_code == 200
        assert older_payload["success"] is True
        assert older_payload["lastUpdate"]["utc"] == last_update_iso
    finally:
        _cleanup_saved_preference(user_id, profile_id, preference_name, unique_value)


def test_get_single_preference_missing_returns_404(client):
    response = client.get(
        "/api/preferences/user/single",
        query_string={"preference_name": "non_existing_preference_999"},
    )
    payload = response.get_json()
    assert response.status_code == 404
    assert payload["success"] is False
    assert "not found" in payload["error"].lower()

