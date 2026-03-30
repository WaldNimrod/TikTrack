"""
GATE_3 — TC-15..TC-21 (UI Spec Amendment v1.1.1 §17) via HTTP + Postgres.

Team 51 QA traceability. Requires AOS_V3_DATABASE_URL (see conftest).
"""

from __future__ import annotations

import json
import shutil
import socket
import subprocess
import tempfile
import threading
import time
from collections.abc import Generator
from pathlib import Path
from typing import Any

import httpx
import pytest
import uvicorn
from fastapi.testclient import TestClient

from agents_os_v3.modules.management.api import _db_conn, create_app
from agents_os_v3.modules.management.db import connection as db_connection
from agents_os_v3.modules.state import machine as state_machine

from .conftest import requires_aos_db
from .gate2_db_helpers import clear_in_progress_runs_for_domain, insert_temp_wp, purge_work_package


def _hdr(team_id: str = "team_11") -> dict[str, str]:
    return {"X-Actor-Team-Id": team_id}


@pytest.fixture
def api_client() -> Generator[TestClient, None, None]:
    app = create_app()

    def _db_override() -> Generator[Any, None, None]:
        c = db_connection()
        try:
            yield c
        finally:
            c.close()

    app.dependency_overrides[_db_conn] = _db_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


def _new_run(aos_db_conn: Any) -> tuple[str, str]:
    dom = "01JK8AOSV3DOMAIN00000001"
    clear_in_progress_runs_for_domain(aos_db_conn, dom)
    wp = insert_temp_wp(aos_db_conn, dom)
    started = state_machine.initiate_run(
        aos_db_conn,
        work_package_id=wp,
        domain_id=dom,
        process_variant=None,
    )
    return wp, str(started["run_id"])


@requires_aos_db
def test_tc15_native_file_json_block_high(api_client: TestClient, aos_db_conn: Any) -> None:
    """TC-15 — NATIVE_FILE with IL-1 JSON block → JSON_BLOCK / HIGH / PASS."""
    wp, rid = _new_run(aos_db_conn)
    try:
        content = """```json
{"verdict": "PASS", "summary": "TC-15 native file path"}
```
"""
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix="_tc15.md",
            delete=False,
            encoding="utf-8",
        ) as f:
            f.write(content)
            path = f.name
        try:
            r = api_client.post(
                f"/api/runs/{rid}/feedback",
                headers=_hdr(),
                json={"detection_mode": "NATIVE_FILE", "file_path": path},
            )
            assert r.status_code == 200, r.text
            body = r.json()
            assert body.get("fallback_required") is False
            fr = body["feedback_record"]
            assert fr["ingestion_layer"] == "JSON_BLOCK"
            assert fr["confidence"] == "HIGH"
            assert fr["verdict"] == "PASS"
        finally:
            Path(path).unlink(missing_ok=True)
    finally:
        purge_work_package(aos_db_conn, wp)


@requires_aos_db
def test_tc16_operator_notify_fallback_required(api_client: TestClient, aos_db_conn: Any) -> None:
    """TC-16 — OPERATOR_NOTIFY with no canonical verdict file → fallback_required."""
    wp, rid = _new_run(aos_db_conn)
    try:
        r = api_client.post(
            f"/api/runs/{rid}/feedback",
            headers=_hdr(),
            json={"detection_mode": "OPERATOR_NOTIFY"},
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("fallback_required") is True
        fr = body["feedback_record"]
        assert fr.get("id") is None
        assert fr["ingestion_layer"] == "RAW_DISPLAY"
    finally:
        purge_work_package(aos_db_conn, wp)


@requires_aos_db
def test_tc17_raw_paste_regex_extract_medium(api_client: TestClient, aos_db_conn: Any) -> None:
    """TC-17 — RAW_PASTE IL-2 with blocking findings."""
    wp, rid = _new_run(aos_db_conn)
    try:
        text = """verdict: fail
summary: broken gate
BF-01: first issue
BF-02: second issue
route_recommendation: doc
"""
        r = api_client.post(
            f"/api/runs/{rid}/feedback",
            headers=_hdr(),
            json={"detection_mode": "RAW_PASTE", "raw_text": text},
        )
        assert r.status_code == 200, r.text
        fr = r.json()["feedback_record"]
        assert fr["ingestion_layer"] == "REGEX_EXTRACT"
        assert fr["confidence"] == "MEDIUM"
        assert fr["verdict"] == "FAIL"
        bfj = json.loads(fr["blocking_findings_json"])
        assert len(bfj) == 2
    finally:
        purge_work_package(aos_db_conn, wp)


@requires_aos_db
def test_tc18_get_state_next_action_confirm_advance(api_client: TestClient, aos_db_conn: Any) -> None:
    """TC-18 — After PASS feedback, GET /api/state exposes CONFIRM_ADVANCE."""
    wp, rid = _new_run(aos_db_conn)
    try:
        paste = """```json
{"verdict": "PASS", "summary": "ready"}
```
"""
        r1 = api_client.post(
            f"/api/runs/{rid}/feedback",
            headers=_hdr(),
            json={"detection_mode": "RAW_PASTE", "raw_text": paste},
        )
        assert r1.status_code == 200, r1.text
        r2 = api_client.get(f"/api/state?run_id={rid}", headers=_hdr())
        assert r2.status_code == 200, r2.text
        na = r2.json()["next_action"]
        assert na["type"] == "CONFIRM_ADVANCE"
        assert "/advance" in (na.get("cli_command") or "")
    finally:
        purge_work_package(aos_db_conn, wp)


@requires_aos_db
def test_tc19_advance_prefills_summary_from_pending_feedback(api_client: TestClient, aos_db_conn: Any) -> None:
    """TC-19 — advance without summary; event payload carries pending feedback summary."""
    wp, rid = _new_run(aos_db_conn)
    try:
        paste = """```json
{"verdict": "PASS", "summary": "QA complete"}
```
"""
        r0 = api_client.post(
            f"/api/runs/{rid}/feedback",
            headers=_hdr(),
            json={"detection_mode": "RAW_PASTE", "raw_text": paste},
        )
        assert r0.status_code == 200, r0.text
        r1 = api_client.post(
            f"/api/runs/{rid}/advance",
            headers=_hdr(),
            json={"verdict": "pass"},
        )
        assert r1.status_code == 200, r1.text
        r2 = api_client.get(f"/api/history?run_id={rid}&limit=5&order=desc")
        assert r2.status_code == 200, r2.text
        events = r2.json()["events"]
        phase_ev = next((e for e in events if e["event_type"] == "PHASE_PASSED"), None)
        assert phase_ev is not None
        payload = phase_ev.get("payload_json") or {}
        assert payload.get("summary") == "QA complete"
    finally:
        purge_work_package(aos_db_conn, wp)


@requires_aos_db
def test_tc20_post_fail_whitespace_reason_missing_reason(api_client: TestClient, aos_db_conn: Any) -> None:
    """TC-20 — POST /fail with whitespace-only reason → MISSING_REASON."""
    wp, rid = _new_run(aos_db_conn)
    try:
        r = api_client.post(
            f"/api/runs/{rid}/fail",
            headers=_hdr(),
            json={"reason": "   \t\n"},
        )
        assert r.status_code == 400, r.text
        assert r.json()["detail"]["code"] == "MISSING_REASON"
    finally:
        purge_work_package(aos_db_conn, wp)


@requires_aos_db
def test_tc21_sse_receives_event_after_advance(aos_db_conn: Any) -> None:
    """TC-21 — GET /api/events/stream observes pipeline_event or run_state_changed after POST /advance.

    In-process ASGI transports buffer until the stream ends; Uvicorn on loopback delivers real SSE.
    httpx.Client.stream does not yield SSE body chunks reliably here; use curl -N for the reader.
    """
    if not shutil.which("curl"):
        pytest.skip("curl not on PATH — required for TC-21 SSE streaming read")

    app = create_app()

    def _db_override() -> Generator[Any, None, None]:
        c = db_connection()
        try:
            yield c
        finally:
            c.close()

    app.dependency_overrides[_db_conn] = _db_override
    wp, rid = _new_run(aos_db_conn)

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(("127.0.0.1", 0))
    port = int(sock.getsockname()[1])
    sock.close()

    config = uvicorn.Config(
        app,
        host="127.0.0.1",
        port=port,
        log_level="error",
        lifespan="on",
    )
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    base = f"http://127.0.0.1:{port}"
    deadline = time.time() + 30.0
    while time.time() < deadline:
        try:
            hr = httpx.get(f"{base}/api/health", timeout=1.0)
            if hr.status_code == 200:
                break
        except httpx.HTTPError:
            time.sleep(0.05)
    else:
        server.should_exit = True
        thread.join(timeout=5.0)
        app.dependency_overrides.clear()
        purge_work_package(aos_db_conn, wp)
        pytest.fail("Uvicorn did not become ready for TC-21 SSE test")

    err: list[BaseException] = []

    def fire_advance() -> None:
        try:
            time.sleep(0.25)
            pr = httpx.post(
                f"{base}/api/runs/{rid}/advance",
                headers=_hdr(),
                json={"verdict": "pass"},
                timeout=30.0,
            )
            assert pr.status_code == 200, pr.text
        except BaseException as e:
            err.append(e)

    try:
        paste = """```json
{"verdict": "PASS", "summary": "TC-21 sse"}
```
"""
        fb = httpx.post(
            f"{base}/api/runs/{rid}/feedback",
            headers=_hdr(),
            json={"detection_mode": "RAW_PASTE", "raw_text": paste},
            timeout=30.0,
        )
        assert fb.status_code == 200, fb.text

        stream_url = f"{base}/api/events/stream?run_id={rid}"
        curl_out: dict[str, Any] = {}

        def curl_reader() -> None:
            try:
                proc = subprocess.run(
                    ["curl", "-sS", "-N", "--max-time", "40", stream_url],
                    capture_output=True,
                    timeout=45,
                    check=False,
                )
                curl_out["stdout"] = proc.stdout
                curl_out["stderr"] = proc.stderr
                curl_out["returncode"] = proc.returncode
            except BaseException as e:
                curl_out["exc"] = e

        t_curl = threading.Thread(target=curl_reader, daemon=True)
        t_curl.start()
        time.sleep(0.2)
        t_adv = threading.Thread(target=fire_advance, daemon=True)
        t_adv.start()
        t_adv.join(timeout=20.0)
        t_curl.join(timeout=50.0)
        if err:
            raise err[0]
        if "exc" in curl_out:
            raise curl_out["exc"]
        blob = curl_out.get("stdout") or b""
        assert b"pipeline_event" in blob or b"run_state_changed" in blob, (
            blob[:800],
            curl_out.get("stderr"),
            curl_out.get("returncode"),
        )
    finally:
        server.should_exit = True
        thread.join(timeout=10.0)
        app.dependency_overrides.clear()
        purge_work_package(aos_db_conn, wp)
