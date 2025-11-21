import os
import sys

import pytest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from Backend.app import create_app  # noqa: E402


@pytest.fixture(scope="module")
def client():
    app = create_app({"TESTING": True})
    with app.test_client() as test_client:
        yield test_client


def test_function_index_endpoint_returns_summary(client):
    response = client.post("/api/quality-check/function-index")
    assert response.status_code == 200

    payload = response.get_json()
    assert payload["status"] == "success"
    assert "data" in payload
    summary = payload["data"]["summary"]
    assert summary["total"] >= 0
    assert float(summary["coveragePercentage"]) >= 0
    assert "pages" in payload["data"]
    assert isinstance(payload["data"]["pages"], list)


def test_function_index_endpoint_handles_failures(monkeypatch, client):
    import importlib

    backend_quality = importlib.import_module("Backend.routes.api.quality_check")
    routes_quality = importlib.import_module("routes.api.quality_check")

    def _boom():
        raise RuntimeError("forced failure for testing")

    monkeypatch.setattr(backend_quality, "build_function_index_report", _boom)
    monkeypatch.setattr(routes_quality, "build_function_index_report", _boom)

    response = client.post("/api/quality-check/function-index")
    assert response.status_code == 500

    payload = response.get_json()
    assert payload["status"] == "error"
    assert "message" in payload

