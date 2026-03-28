"""
GATE_4 — Canary Smoke Tests (static, no DB required).

Structural checks for GATE_4 deliverables: flow.html System Map integration,
pipeline_flow.html design spec integrity, FILE_INDEX.json registration.

All tests are pure file reads — no network, no database, < 3 seconds total.
Run as part of: bash agents_os_v3/tests/canary_gate4.sh
Or standalone:  python3 -m pytest agents_os_v3/tests/test_gate4_canary_smoke.py -v
"""

from __future__ import annotations

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
UI_DIR = REPO_ROOT / "agents_os_v3" / "ui"
FILE_INDEX_PATH = REPO_ROOT / "agents_os_v3" / "FILE_INDEX.json"

FLOW_HTML = UI_DIR / "flow.html"
PIPELINE_FLOW_HTML = UI_DIR / "pipeline_flow.html"

SECTION_ANCHORS = ["gates", "sm", "init", "loop", "correction", "pause", "override", "fip"]


# ── Block B.1 — flow.html structural checks ──────────────────────────────────

def test_flow_html_exists() -> None:
    """flow.html must exist as GATE_4 deliverable from team_31."""
    assert FLOW_HTML.exists(), f"Missing GATE_4 deliverable: {FLOW_HTML}"


def test_flow_html_system_map_nav_link() -> None:
    """flow.html must have an active 'System Map' nav link (AC-01, AC-09)."""
    html = FLOW_HTML.read_text(encoding="utf-8")
    assert 'href="flow.html"' in html, "Missing nav link: href=\"flow.html\""
    assert "System Map" in html, "Missing nav label: 'System Map'"


def test_flow_html_eight_section_anchors() -> None:
    """flow.html must have all 8 section anchor IDs for sub-navigation (AC-05)."""
    html = FLOW_HTML.read_text(encoding="utf-8")
    missing = [a for a in SECTION_ANCHORS if f'id="{a}"' not in html]
    assert not missing, f"flow.html missing section anchors: {missing}"


def test_flow_html_subnav_present() -> None:
    """flow.html must have a .flow-subnav for in-page navigation (AC-05)."""
    html = FLOW_HTML.read_text(encoding="utf-8")
    assert "flow-subnav" in html, "Missing .flow-subnav in flow.html"


def test_flow_html_version_footer() -> None:
    """flow.html must display the canonical version footer (AC-11)."""
    html = FLOW_HTML.read_text(encoding="utf-8")
    assert "System Map v1.0.0" in html, (
        "Missing version footer: 'System Map v1.0.0' — required by AC-11"
    )


# ── Block B.2 — pipeline_flow.html design spec integrity ─────────────────────

def test_pipeline_flow_html_exists() -> None:
    """pipeline_flow.html design spec must remain unchanged (AC-07, Iron Rule)."""
    assert PIPELINE_FLOW_HTML.exists(), f"Design spec missing: {PIPELINE_FLOW_HTML}"


def test_pipeline_flow_html_eight_sections_intact() -> None:
    """pipeline_flow.html (design spec) must retain all 8 section anchors (AC-10)."""
    html = PIPELINE_FLOW_HTML.read_text(encoding="utf-8")
    missing = [a for a in SECTION_ANCHORS if f'id="{a}"' not in html]
    assert not missing, (
        f"pipeline_flow.html (design spec) missing sections: {missing} — "
        "diagram content must not be modified without Team 111 mandate"
    )


# ── Block B.3 — FILE_INDEX.json registration ─────────────────────────────────

def test_file_index_has_flow_html_gate4_entry() -> None:
    """FILE_INDEX.json must register flow.html as a GATE_4 artifact (AC-08)."""
    assert FILE_INDEX_PATH.exists(), f"FILE_INDEX.json not found at {FILE_INDEX_PATH}"
    raw = json.loads(FILE_INDEX_PATH.read_text(encoding="utf-8"))
    # Support both list-of-entries and dict-with-files-key formats
    entries: list = raw if isinstance(raw, list) else raw.get("files", raw.get("entries", []))
    flow_entries = [
        e for e in entries
        if isinstance(e, dict) and "flow.html" in str(e.get("path", ""))
        and "pipeline_flow" not in str(e.get("path", ""))
    ]
    assert flow_entries, (
        "FILE_INDEX.json has no entry for 'agents_os_v3/ui/flow.html' — "
        "required by AC-08 (GATE_4 registration)"
    )
    entry = flow_entries[0]
    gate = entry.get("gate") or entry.get("added_in_gate") or ""
    assert "GATE_4" in str(gate), (
        f"FILE_INDEX flow.html entry does not reference GATE_4 — got: {gate!r}"
    )
