"""
json_enforcer.py — Deterministic JSON verdict parsing.
Replaces brittle regex parsing of validation team outputs.
S003-P010-WP001 | Authority: ARCHITECT_DIRECTIVE_AOS_ROADMAP_RESET_v1.0.0
"""
from __future__ import annotations
import json
import re
from pathlib import Path


class VerdictParseError(Exception):
    """Raised when verdict cannot be parsed as valid JSON."""
    pass


REQUIRED_FIELDS  = {"gate_id", "decision", "summary"}
VALID_DECISIONS  = {"PASS", "BLOCK_FOR_FIX"}
VALID_ROUTES     = {"doc", "full", None}


def _extract_first_json_block(text: str) -> str | None:
    # Primary: fenced ```json block (canonical format per prompt instructions)
    m = re.search(r"```json\s*\n(.*?)\n```", text, re.DOTALL)
    if m:
        return m.group(1).strip()
    # Fallback: bare JSON object at start of file (some teams omit the fence)
    # S003-P013-WP001 KB-73: Team 190 wrote raw JSON without code fence
    m2 = re.match(r"\s*(\{[^}]+(?:\{[^}]*\}[^}]*)?\})", text, re.DOTALL)
    if m2:
        try:
            candidate = m2.group(1).strip()
            json.loads(candidate)  # validate it's real JSON before accepting
            return candidate
        except (json.JSONDecodeError, Exception):
            pass
    return None


def _validate_schema(data: dict) -> list[str]:
    errors: list[str] = []
    for f in REQUIRED_FIELDS:
        if f not in data:
            errors.append(f"Missing field: '{f}'")
    decision = data.get("decision", "")
    if decision not in VALID_DECISIONS:
        errors.append(f"Invalid decision '{decision}'")
    if decision == "BLOCK_FOR_FIX":
        if not data.get("blocking_findings"):
            errors.append("BLOCK_FOR_FIX requires non-empty blocking_findings")
        if data.get("route_recommendation") not in VALID_ROUTES:
            errors.append(f"Invalid route_recommendation '{data.get('route_recommendation')}'")
    return errors


def has_json_verdict_block(file_path: Path) -> bool:
    """Quick check — does this file have a ```json block?"""
    if not file_path.exists():
        return False
    return _extract_first_json_block(file_path.read_text(encoding="utf-8")) is not None


def enforce_json_verdict(file_path: Path) -> dict:
    """
    Parse and validate the JSON verdict block from a verdict file.
    Returns validated dict on success.
    Raises VerdictParseError on failure.
    """
    if not file_path.exists():
        raise VerdictParseError(f"File not found: {file_path}")

    text = file_path.read_text(encoding="utf-8")
    raw = _extract_first_json_block(text)

    if raw is None:
        raise VerdictParseError(f"NO_JSON_BLOCK: {file_path.name}")

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise VerdictParseError(f"JSON_SYNTAX_ERROR in {file_path.name}: {e}") from e

    errors = _validate_schema(data)
    if errors:
        raise VerdictParseError(
            f"JSON_SCHEMA_ERROR in {file_path.name}:\n" +
            "\n".join(f"  - {e}" for e in errors)
        )
    return data
