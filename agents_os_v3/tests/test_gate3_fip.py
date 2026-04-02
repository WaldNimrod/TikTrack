"""GATE_3 — FIP ingestion layers + definitions (no DB)."""

from __future__ import annotations

from agents_os_v3.modules.audit.ingestion import FeedbackIngestor, IngestSource
from agents_os_v3.modules.definitions.event_registry import VALID_EVENT_TYPES
from agents_os_v3.modules.definitions.models import AdvanceRunBody


def test_il1_json_block_high_confidence() -> None:
    ing = FeedbackIngestor()
    text = """```json
{"verdict": "PASS", "summary": "Ship it"}
```
"""
    src = IngestSource(
        run_id="01JQXRUN00000000000001",
        gate_id="GATE_0",
        team_id="team_10",
        wp_id="WP1",
        detection_mode="RAW_PASTE",
        raw_text=text,
    )
    rec = ing.ingest(src)
    assert rec["ingestion_layer"] == "JSON_BLOCK"
    assert rec["verdict"] == "PASS"
    assert rec["confidence"] == "HIGH"
    assert rec["proposed_action"] == "ADVANCE"


def test_il2_regex_extract_medium() -> None:
    ing = FeedbackIngestor()
    text = """verdict: fail
summary: broken
BF-01: first issue
route_recommendation: doc
"""
    src = IngestSource(
        run_id="01JQXRUN00000000000001",
        gate_id="GATE_0",
        team_id="team_10",
        wp_id="WP1",
        detection_mode="RAW_PASTE",
        raw_text=text,
    )
    rec = ing.ingest(src)
    assert rec["ingestion_layer"] == "REGEX_EXTRACT"
    assert rec["verdict"] == "FAIL"
    assert rec["confidence"] == "MEDIUM"
    assert rec["proposed_action"] == "FAIL"
    assert "BF-01" in rec["blocking_findings_json"]


def test_il3_raw_display_infallible() -> None:
    ing = FeedbackIngestor()
    text = "no structure here at all"
    src = IngestSource(
        run_id="01JQXRUN00000000000001",
        gate_id="GATE_0",
        team_id="team_10",
        wp_id="WP1",
        detection_mode="RAW_PASTE",
        raw_text=text,
    )
    rec = ing.ingest(src)
    assert rec["ingestion_layer"] == "RAW_DISPLAY"
    assert rec["verdict"] == "PENDING_REVIEW"
    assert rec["confidence"] == "LOW"
    assert rec["raw_text"] == text


def test_canonical_auto_mode() -> None:
    ing = FeedbackIngestor()
    src = IngestSource(
        run_id="01JQXRUN00000000000001",
        gate_id="GATE_0",
        team_id="team_10",
        wp_id="WP1",
        detection_mode="CANONICAL_AUTO",
        structured_json={"verdict": "PASS", "summary": "auto"},
    )
    rec = ing.ingest(src)
    assert rec["detection_mode"] == "CANONICAL_AUTO"
    assert rec["ingestion_layer"] == "JSON_BLOCK"


def test_valid_event_types_includes_phase_passed() -> None:
    assert "PHASE_PASSED" in VALID_EVENT_TYPES
    assert "ROUTING_FAILED" in VALID_EVENT_TYPES


def test_advance_run_body_accepts_feedback_json() -> None:
    b = AdvanceRunBody(
        verdict="pass",
        summary=None,
        feedback_json={"verdict": "PASS", "summary": "from agent"},
    )
    assert b.feedback_json is not None
    assert b.feedback_json["verdict"] == "PASS"
