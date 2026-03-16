"""Server tests — Phase 2 Event Log. Run: pytest agents_os_v2/server/tests/ -v"""

import os
import pytest
from starlette.testclient import TestClient

from agents_os_v2.server.aos_ui_server import app, _get_server_port
from agents_os_v2.orchestrator.log_events import LOG_FILE

VALID_EVENT = {
    "timestamp": "2026-03-10T12:00:00Z",
    "pipe_run_id": "test-run-1",
    "event_type": "GATE_PASS",
    "domain": "agents_os",
    "stage_id": "S002",
    "work_package_id": "S002-P005-WP001",
    "gate": "GATE_1",
    "agent_team": "team_61",
    "severity": "INFO",
    "description": "Test event",
    "metadata": {},
}


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def preserve_log_file(tmp_path, monkeypatch):
    """Use a temp log file so we don't pollute real pipeline_events.jsonl."""
    log_path = tmp_path / "pipeline_events_test.jsonl"
    monkeypatch.setattr("agents_os_v2.orchestrator.log_events.LOG_FILE", log_path)
    monkeypatch.setattr("agents_os_v2.server.routes.events.LOG_FILE", log_path)
    return log_path


def test_health_returns_ok(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert "uptime_s" in data


def test_log_event_accepts_valid(client, preserve_log_file):
    r = client.post("/api/log/event", json=VALID_EVENT)
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert data.get("received") == "GATE_PASS"


def test_log_event_rejects_invalid(client):
    invalid = {**VALID_EVENT, "event_type": "UNKNOWN_TYPE"}
    r = client.post("/api/log/event", json=invalid)
    assert r.status_code in (400, 422)


def test_log_events_returns_array(client, preserve_log_file):
    client.post("/api/log/event", json=VALID_EVENT)
    r = client.get("/api/log/events")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_log_events_respects_limit(client, preserve_log_file):
    for i in range(10):
        evt = {**VALID_EVENT, "pipe_run_id": f"run-{i}"}
        client.post("/api/log/event", json=evt)
    r = client.get("/api/log/events?limit=5")
    assert r.status_code == 200
    data = r.json()
    assert len(data) <= 5


def test_log_events_work_package_filter(client, preserve_log_file):
    client.post("/api/log/event", json={**VALID_EVENT, "work_package_id": "S002-P005-WP003"})
    client.post("/api/log/event", json={**VALID_EVENT, "pipe_run_id": "other", "work_package_id": "S001-P001-WP001"})
    r = client.get("/api/log/events?work_package_id=S002-P005")
    assert r.status_code == 200
    data = r.json()
    assert all(e.get("work_package_id", "").startswith("S002-P005") for e in data)


def test_stub_returns_501(client):
    r = client.get("/api/state/agents_os")
    assert r.status_code == 501
    data = r.json()
    assert data.get("error") == "not_implemented"


def test_static_serves_file(client):
    r = client.get("/static/css/pipeline-dashboard.css")
    assert r.status_code == 200


def test_event_schema_validation():
    from agents_os_v2.server.models.event import PipelineEvent
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        PipelineEvent(timestamp="x", pipe_run_id="y")  # missing event_type, domain


def test_get_server_port_dynamic(monkeypatch):
    """BF-G5-001: SERVER_START description must reflect actual port, not hardcoded 8090."""
    monkeypatch.delenv("AOS_SERVER_PORT", raising=False)
    monkeypatch.delenv("PORT", raising=False)
    assert _get_server_port() == "8090"
    monkeypatch.setenv("AOS_SERVER_PORT", "8091")
    assert _get_server_port() == "8091"
    monkeypatch.delenv("AOS_SERVER_PORT", raising=False)
    monkeypatch.setenv("PORT", "8092")
    assert _get_server_port() == "8092"
