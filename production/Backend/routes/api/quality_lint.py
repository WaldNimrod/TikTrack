"""
Lint Quality API
================

Provides read-only access to the latest lint aggregation reports produced by
`npm run lint:collect`. The API returns cached JSON summaries so the frontend
dashboard does not rely on deprecated realtime mechanisms.
"""

from __future__ import annotations

import logging
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

from flask import Blueprint, jsonify, Response, request

logger = logging.getLogger(__name__)

bp = Blueprint("quality_lint", __name__)

PROJECT_ROOT = Path(__file__).resolve().parents[3]
REPORTS_DIR = PROJECT_ROOT / "reports" / "linter"
LATEST_FILE = REPORTS_DIR / "latest.json"
HISTORY_FILE = REPORTS_DIR / "history.json"


def _load_json_file(path: Path) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
    """
    Attempt to load a JSON file. Returns (success, data, error_message).
    """
    if not path.exists():
        return False, None, f"File not found: {path.name}"

    try:
        contents = path.read_text(encoding="utf-8")
        return True, __import__("json").loads(contents), None
    except ValueError as exc:
        return False, None, f"Invalid JSON in {path.name}: {exc}"
    except OSError as exc:  # pragma: no cover - unlikely but defensive
        return False, None, f"Failed to read {path.name}: {exc}"


def _build_error_response(message: str, status_code: int = 500) -> Response:
    """
    Helper for consistent error payloads.
    """
    payload = {
        "status": "error",
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
    }
    return jsonify(payload), status_code


def _truncate(text: str, limit: int = 4000) -> str:
    """
    Trim long command output while indicating truncation.
    """
    if len(text) <= limit:
        return text
    return f"{text[:limit]}...\n[output truncated]"


@bp.route("/quality/lint", methods=["GET"])
def get_latest_lint_report() -> Response:
    """
    Return the latest lint report. If no report exists, respond with a gentle notice.
    """
    success, data, error = _load_json_file(LATEST_FILE)
    if not success:
        if error and "not found" in error.lower():
            payload = {
                "status": "empty",
                "message": (
                    "No lint report found. Run `npm run lint:collect` to generate one."
                ),
                "timestamp": datetime.utcnow().isoformat(),
            }
            return jsonify(payload), 200
        return _build_error_response(error or "Unable to load lint report")

    payload = {
        "status": "success",
        "data": data,
        "timestamp": datetime.utcnow().isoformat(),
    }
    return jsonify(payload), 200


@bp.route("/quality/lint/run", methods=["POST"])
def run_lint_collection() -> Response:
    """
    Execute the lint aggregation script (`npm run lint:collect`) and return the outcome.
    """
    request_payload = request.get_json(silent=True) or {}
    note = request_payload.get("note")  # optional metadata for logging

    try:
        completed = subprocess.run(
            ["npm", "run", "lint:collect"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
    except FileNotFoundError:
        return _build_error_response("npm executable not found on server", 500)
    except Exception as exc:  # pragma: no cover
        logger.exception("Failed to execute npm run lint:collect")
        return _build_error_response(str(exc), 500)

    status = "success" if completed.returncode == 0 else "failed"
    response_payload: Dict[str, Any] = {
        "status": status,
        "exitCode": completed.returncode,
        "stdout": _truncate(completed.stdout or ""),
        "stderr": _truncate(completed.stderr or ""),
        "timestamp": datetime.utcnow().isoformat(),
    }

    if note:
        response_payload["note"] = str(note)

    # Try to include the freshly written report for convenience
    latest_success, latest_report, latest_error = _load_json_file(LATEST_FILE)
    if latest_success and latest_report:
        response_payload["latestReport"] = latest_report
    elif latest_error:
        response_payload["latestReportError"] = latest_error

    history_success, history_data, history_error = _load_json_file(HISTORY_FILE)
    if history_success and isinstance(history_data, list):
        response_payload["historyLength"] = len(history_data)
    elif history_error:
        response_payload["historyError"] = history_error

    logger.info(
        "Lint collection executed via API",
        extra={
            "status": status,
            "exitCode": completed.returncode,
            "note": note,
        },
    )

    return jsonify(response_payload), 200


@bp.route("/quality/lint/history", methods=["GET"])
def get_lint_history() -> Response:
    """
    Return the lint history log (capped list).
    """
    success, data, error = _load_json_file(HISTORY_FILE)
    if not success:
        if error and "not found" in error.lower():
            payload = {
                "status": "empty",
                "data": [],
                "message": (
                    "No lint history found. Run `npm run lint:collect` to create records."
                ),
                "timestamp": datetime.utcnow().isoformat(),
            }
            return jsonify(payload), 200
        return _build_error_response(error or "Unable to load lint history")

    if not isinstance(data, list):
        return _build_error_response("Lint history file is malformed", 500)

    payload = {
        "status": "success",
        "data": data,
        "timestamp": datetime.utcnow().isoformat(),
    }
    return jsonify(payload), 200

