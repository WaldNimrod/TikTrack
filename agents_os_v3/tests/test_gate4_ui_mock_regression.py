"""GATE_4 — mock mode regression (Team 11 handoff): query + meta toggles in UI sources."""

from __future__ import annotations

from pathlib import Path


def _ui(name: str) -> Path:
    root = Path(__file__).resolve().parents[1] / "ui"
    return root / name


def test_app_js_mock_query_and_meta_documented() -> None:
    text = _ui("app.js").read_text(encoding="utf-8")
    assert 'q.get("mock")' in text or "mock" in text
    assert "aosv3_mock" in text
    assert "aosv3-use-mock" in text


def test_index_html_links_api_client_and_app() -> None:
    idx = _ui("index.html").read_text(encoding="utf-8")
    assert "api-client.js" in idx
    assert "app.js" in idx
