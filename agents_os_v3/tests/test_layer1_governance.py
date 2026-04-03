"""Layer 1 — governance.artifact_index (mocked cursor; no DB)."""

from __future__ import annotations

from unittest.mock import MagicMock

from agents_os_v3.modules.governance.artifact_index import insert_artifact, mark_status


def test_insert_artifact_calls_execute_with_wp_and_path() -> None:
    cur = MagicMock()
    new_id = insert_artifact(
        cur,
        work_package_id="01JK8AOSV3WP0000000001",
        path="agents_os_v3/README.md",
        type_="DELIVERABLE",
        status="ACTIVE",
        stage="GATE_1",
        created_by="team_21",
        purpose="pytest",
    )
    assert len(new_id) == 26
    assert cur.execute.called
    args = cur.execute.call_args[0]
    sql = args[0]
    assert "INSERT INTO wp_artifact_index" in sql
    params = args[1]
    assert params[1] == "01JK8AOSV3WP0000000001"
    assert params[2] == "agents_os_v3/README.md"


def test_mark_status_updates_row() -> None:
    cur = MagicMock()
    mark_status(cur, "01JARTIFACTIDX0000000001", "ARCHIVE_PENDING")
    cur.execute.assert_called_once()
    sql = cur.execute.call_args[0][0]
    assert "UPDATE wp_artifact_index" in sql
    assert "ARCHIVE_PENDING" in cur.execute.call_args[0][1]
