"""
Feedback Ingestion Pipeline (FIP) — UI Spec Amendment v1.1.1 §2, §12.1.
IL-1 JSON_BLOCK → IL-2 REGEX_EXTRACT → IL-3 RAW_DISPLAY (infallible).
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

# Repo root (…/TikTrackAppV2-phoenix)
REPO_ROOT = Path(__file__).resolve().parents[3]


@dataclass(frozen=True)
class IngestSource:
    run_id: str
    gate_id: str
    team_id: str
    wp_id: str
    detection_mode: str  # OPERATOR_NOTIFY | NATIVE_FILE | RAW_PASTE | CANONICAL_AUTO
    file_path: Optional[str] = None
    raw_text: Optional[str] = None
    # Mode A: pre-parsed object with verdict + summary minimum
    structured_json: Optional[dict[str, Any]] = None


_JSON_BLOCK_RE = re.compile(r"```json\s*\n(.*?)\n```", re.DOTALL | re.IGNORECASE)
_BF_RE = re.compile(r"(BF[-_\s]?\d+)\s*:?\s*(.*)", re.IGNORECASE)
_ROUTE_REC_RE = re.compile(
    r"route[_\s-]*recommendation\s*[:\-=]\s*([A-Za-z_-]+)", re.IGNORECASE
)


def _proposed_action(confidence: str, verdict: str) -> str:
    v = verdict.upper()
    c = confidence.upper()
    if v == "PENDING_REVIEW":
        return "MANUAL_REVIEW"
    if c == "HIGH" and v == "PASS":
        return "ADVANCE"
    if c == "HIGH" and v == "FAIL":
        return "FAIL"
    if c == "MEDIUM" and v == "PASS":
        return "ADVANCE"
    if c == "MEDIUM" and v == "FAIL":
        return "FAIL"
    return "MANUAL_REVIEW"


def _normalize_verdict(raw: str) -> str:
    u = raw.strip().upper()
    if u in ("PASS", "PASSED", "APPROVED"):
        return "PASS"
    if u in ("FAIL", "FAILED", "REJECT"):
        return "FAIL"
    if u in ("PENDING_REVIEW", "PENDING", "REVIEW"):
        return "PENDING_REVIEW"
    return "PENDING_REVIEW"


def _try_json_block(text: str) -> Optional[dict[str, Any]]:
    m = _JSON_BLOCK_RE.search(text)
    if not m:
        return None
    inner = m.group(1).strip()
    try:
        obj = json.loads(inner)
    except json.JSONDecodeError:
        return None
    if not isinstance(obj, dict):
        return None
    if "verdict" not in obj or "summary" not in obj:
        return None
    return obj


def _try_regex_extract(text: str) -> Optional[dict[str, Any]]:
    verdict_v: Optional[str] = None
    summary_v: Optional[str] = None
    for line in text.splitlines():
        ls = line.strip()
        if ls.lower().startswith("verdict"):
            parts = ls.split(":", 1)
            if len(parts) == 2:
                verdict_v = parts[1].strip()
        elif ls.lower().startswith("summary"):
            parts = ls.split(":", 1)
            if len(parts) == 2:
                summary_v = parts[1].strip()
    findings: list[dict[str, str]] = []
    for line in text.splitlines():
        bm = _BF_RE.match(line.strip())
        if bm:
            findings.append(
                {"id": bm.group(1).upper(), "description": bm.group(2).strip(), "evidence": ""}
            )
    rr_m = _ROUTE_REC_RE.search(text)
    route_rec = rr_m.group(1) if rr_m else None
    if not verdict_v:
        return None
    return {
        "verdict": verdict_v,
        "summary": summary_v or "",
        "blocking_findings": findings,
        "route_recommendation": route_rec,
    }


def _wp_underscore_variants(wp_id: str) -> list[str]:
    return list({wp_id, wp_id.replace("-", "_")})


def _mode_b_candidate_paths(comm: Path, wp_id: str, gate_id: str) -> list[Path]:
    """§2.5 — ordered search (first match wins)."""
    ordered: list[Path] = []
    seen: set[str] = set()

    def _add(p: Path) -> None:
        k = str(p.resolve())
        if k not in seen:
            seen.add(k)
            ordered.append(p)

    for wpv in _wp_underscore_variants(wp_id):
        _add(comm / f"{wpv}_VERDICT.md")
    for wpv in _wp_underscore_variants(wp_id):
        if comm.is_dir():
            for p in sorted(comm.glob(f"{wpv}_GATE_{gate_id}_*.md")):
                _add(p)
    for wpv in _wp_underscore_variants(wp_id):
        if comm.is_dir():
            for p in sorted(comm.glob(f"{wpv}_COMPLETION_*.md")):
                _add(p)
    for wpv in _wp_underscore_variants(wp_id):
        if comm.is_dir():
            for p in sorted(comm.glob(f"{wpv}_GATE_{gate_id}_DECISION*.md")):
                _add(p)
    return ordered


class FeedbackIngestor:
    """§12.1 — server-side FIP only (AD-S8B-01)."""

    def load_text_for_mode_b(
        self,
        source: IngestSource,
        run_started_at: Any,
    ) -> tuple[Optional[str], bool]:
        """
        Returns (text, file_found).
        Stale file: mtime < run_started_at → treat as not found for content.
        """
        from datetime import datetime, timezone

        if source.detection_mode != "OPERATOR_NOTIFY":
            return None, False
        comm = REPO_ROOT / "_COMMUNICATION" / source.team_id
        candidates = _mode_b_candidate_paths(comm, source.wp_id, source.gate_id)
        for p in candidates:
            if not p.is_file():
                continue
            try:
                mtime = datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc)
                if run_started_at and hasattr(run_started_at, "timestamp"):
                    rs = run_started_at
                    if hasattr(rs, "tzinfo") and rs.tzinfo is None:
                        rs = rs.replace(tzinfo=timezone.utc)
                    if mtime < rs:
                        continue
                return p.read_text(encoding="utf-8", errors="replace"), True
            except OSError:
                continue
        return None, False

    def load_text_for_mode_c(self, file_path: str) -> str:
        p = Path(file_path).expanduser()
        if not p.is_absolute():
            p = REPO_ROOT / p
        if not p.is_file():
            raise FileNotFoundError(str(p))
        return p.read_text(encoding="utf-8", errors="replace")

    def ingest(self, source: IngestSource, run_started_at: Any = None) -> dict[str, Any]:
        """
        Returns FeedbackRecord-shaped dict (DB columns + id timing by caller).
        """
        if source.detection_mode == "CANONICAL_AUTO":
            if not source.structured_json:
                raise ValueError("structured_json required for CANONICAL_AUTO")
            sj = source.structured_json
            verdict = _normalize_verdict(str(sj.get("verdict", "")))
            summary = str(sj.get("summary", "") or "")
            bfj = sj.get("blocking_findings_json") or sj.get("blocking_findings") or []
            if isinstance(bfj, list):
                blocking_json = json.dumps(bfj, default=str)
            else:
                blocking_json = str(bfj) if bfj else "[]"
            rr = sj.get("route_recommendation")
            conf = "HIGH"
            layer = "JSON_BLOCK"
            raw_out: Optional[str] = None
            src_path: Optional[str] = None
        elif source.detection_mode == "OPERATOR_NOTIFY":
            text, found = self.load_text_for_mode_b(source, run_started_at)
            if not found or text is None:
                return {
                    "_fallback_required": True,
                    "verdict": "PENDING_REVIEW",
                    "summary": None,
                    "blocking_findings_json": "[]",
                    "route_recommendation": None,
                    "raw_text": None,
                    "ingestion_layer": "RAW_DISPLAY",
                    "confidence": "LOW",
                    "proposed_action": "MANUAL_REVIEW",
                    "detection_mode": source.detection_mode,
                    "source_path": None,
                }
            rec = self._parse_chain(text)
            rec["detection_mode"] = "OPERATOR_NOTIFY"
            return rec
        elif source.detection_mode == "NATIVE_FILE":
            if not source.file_path:
                raise ValueError("file_path required for NATIVE_FILE")
            text = self.load_text_for_mode_c(source.file_path)
            rec = self._parse_chain(text)
            rec["source_path"] = source.file_path
            rec["detection_mode"] = "NATIVE_FILE"
            return rec
        elif source.detection_mode == "RAW_PASTE":
            if not source.raw_text:
                raise ValueError("raw_text required for RAW_PASTE")
            rec = self._parse_chain(source.raw_text)
            rec["detection_mode"] = "RAW_PASTE"
            return rec
        else:
            raise ValueError(f"unknown detection_mode {source.detection_mode}")

        pa = _proposed_action(conf, verdict)
        return {
            "_fallback_required": False,
            "verdict": verdict,
            "summary": summary,
            "blocking_findings_json": blocking_json,
            "route_recommendation": rr if isinstance(rr, str) else None,
            "raw_text": raw_out,
            "ingestion_layer": layer,
            "confidence": conf,
            "proposed_action": pa,
            "detection_mode": "CANONICAL_AUTO",
            "source_path": src_path,
        }

    def _parse_chain(self, text: str) -> dict[str, Any]:
        o1 = _try_json_block(text)
        if o1:
            verdict = _normalize_verdict(str(o1.get("verdict", "")))
            summary = str(o1.get("summary", "") or "")
            bf = o1.get("blocking_findings") or o1.get("findings") or []
            if isinstance(bf, list):
                blocking_json = json.dumps(bf, default=str)
            else:
                blocking_json = "[]"
            rr = o1.get("route_recommendation")
            if isinstance(rr, str):
                pass
            else:
                rr = None
            conf = "HIGH"
            layer = "JSON_BLOCK"
            pa = _proposed_action(conf, verdict)
            return {
                "_fallback_required": False,
                "verdict": verdict,
                "summary": summary,
                "blocking_findings_json": blocking_json,
                "route_recommendation": rr,
                "raw_text": None,
                "ingestion_layer": layer,
                "confidence": conf,
                "proposed_action": pa,
                "detection_mode": "",  # caller sets
                "source_path": None,
            }
        o2 = _try_regex_extract(text)
        if o2:
            verdict = _normalize_verdict(o2["verdict"])
            summary = o2.get("summary") or ""
            blocking_json = json.dumps(
                [
                    {"id": x["id"], "description": x["description"], "evidence": x.get("evidence", "")}
                    for x in o2.get("blocking_findings", [])
                ],
                default=str,
            )
            rr = o2.get("route_recommendation")
            conf = "MEDIUM"
            layer = "REGEX_EXTRACT"
            pa = _proposed_action(conf, verdict)
            return {
                "_fallback_required": False,
                "verdict": verdict,
                "summary": summary,
                "blocking_findings_json": blocking_json,
                "route_recommendation": rr,
                "raw_text": None,
                "ingestion_layer": layer,
                "confidence": conf,
                "proposed_action": pa,
                "detection_mode": "",
                "source_path": None,
            }
        # IL-3 infallible
        return {
            "_fallback_required": False,
            "verdict": "PENDING_REVIEW",
            "summary": None,
            "blocking_findings_json": "[]",
            "route_recommendation": None,
            "raw_text": text[:100000],
            "ingestion_layer": "RAW_DISPLAY",
            "confidence": "LOW",
            "proposed_action": "MANUAL_REVIEW",
            "detection_mode": "",
            "source_path": None,
        }
