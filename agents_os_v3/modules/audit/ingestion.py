"""
Feedback Ingestion Pipeline (FIP) — UI Spec Amendment v1.1.1 §2, §12.1.
IL-1 JSON_BLOCK → IL-2 REGEX_EXTRACT → IL-3 RAW_DISPLAY (infallible).
"""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

# Repo root (…/TikTrackAppV2-phoenix)
REPO_ROOT = Path(__file__).resolve().parents[3]


@dataclass(frozen=True)
class IngestSource:
    """Inputs for :class:`FeedbackIngestor` (detection mode B/C/D/A and optional file or paste)."""

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

# Route-recommendation normalisation (DIRECTIVE_ROUTE_RECOMMENDATION_ENUM v1.2.0)
_ROUTE_REC_NORMALISE: dict[str, str] = {"full": "impl"}
_ROUTE_REC_VALID: frozenset[str] = frozenset({"doc", "impl", "arch"})


def _normalise_route_rec(rr: str | None) -> str | None:
    """Normalise a raw route_recommendation string to canonical enum or None.

    B2: case-insensitive (strip + lower before lookup).
    B1: unknown / unmappable values → None (Mode A Pydantic Literal handles rejection).
    Applied only at IL-1 (JSON_BLOCK) and IL-2 (REGEX_EXTRACT) return sites.
    """
    if rr is None:
        return None
    rr = rr.strip().lower()
    normalised = _ROUTE_REC_NORMALISE.get(rr, rr)
    return normalised if normalised in _ROUTE_REC_VALID else None


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


def _gate_short(gate_id: str) -> str:
    """Normalise gate_id → short form used in filenames.

    Teams name files like ``TEAM_190_…_GATE_1_…`` or ``TEAM_170_…_GATE_1_1.1_…``.
    The raw ``gate_id`` value from the DB may be ``"GATE_1"`` (with prefix) or just
    ``"1"`` depending on the caller.  Strip the leading ``GATE_`` / ``GATE`` prefix
    so the glob pattern never generates ``_GATE_GATE_1_`` (double prefix bug).
    """
    import re as _re
    return _re.sub(r"^GATE_?", "", gate_id, flags=_re.IGNORECASE)


# §F — Layer 2 deduplication (in-memory, single-process)
# Risk Acceptance (team_00, 2026-04-01): restart clears the set; processed file may retry
# and fail with FEEDBACK_ALREADY_INGESTED (safe block). Multi-process future → Redis/DB key.
_PROCESSED_FILES: set[str] = set()


def _file_fingerprint(path: Path) -> str:
    """sha256 of full file content.
    F-08: verdict files share identical YAML frontmatter — partial hash caused
    false deduplication. Full hash is safe: verdict documents are small (<10KB).
    """
    return hashlib.sha256(path.read_bytes()).hexdigest()[:20]


def _mode_b_candidate_paths(
    comm: Path, wp_id: str, gate_id: str, team_id: str = ""
) -> list[Path]:
    """§2.5 — ordered search (first match wins).

    Bugs fixed (2026-04-01):
    - Double "GATE_" prefix: ``gate_id="GATE_1"`` → ``_GATE_GATE_1_`` glob.
      Fixed via :func:`_gate_short` which strips the leading ``GATE_`` prefix.
    - Missing ``TEAM_{team_id}_`` prefix: all real team files use this prefix
      (e.g. ``TEAM_190_S003_P005_WP001_GATE_1_VERDICT_v1.0.0.md``). The old
      patterns only matched bare ``{wp_id}_…`` filenames — never found anything.
      Fixed by adding TEAM-prefixed patterns first (higher priority).
    """
    ordered: list[Path] = []
    seen: set[str] = set()
    gshort = _gate_short(gate_id)  # e.g. "GATE_1" → "1",  "1" → "1"
    tid = team_id or comm.name      # infer from path if not supplied

    def _add(p: Path) -> None:
        k = str(p.resolve())
        if k not in seen:
            seen.add(k)
            ordered.append(p)

    # Priority 1 — canonical TEAM_<id> prefixed VERDICT file (exact name)
    for wpv in _wp_underscore_variants(wp_id):
        _add(comm / f"TEAM_{tid}_{wpv}_VERDICT.md")

    # Priority 2 — canonical TEAM_<id> prefixed GATE_<n> glob (e.g. TEAM_190_…_GATE_1_*.md)
    for wpv in _wp_underscore_variants(wp_id):
        if comm.is_dir():
            for p in sorted(comm.glob(f"TEAM_{tid}_{wpv}_GATE_{gshort}_*.md")):
                _add(p)

    # Priority 3 — canonical TEAM_<id> prefixed COMPLETION glob
    for wpv in _wp_underscore_variants(wp_id):
        if comm.is_dir():
            for p in sorted(comm.glob(f"TEAM_{tid}_{wpv}_COMPLETION_*.md")):
                _add(p)

    # Priority 4 — fallback: bare wp_id prefixed VERDICT (legacy / non-prefixed files)
    for wpv in _wp_underscore_variants(wp_id):
        _add(comm / f"{wpv}_VERDICT.md")

    # Priority 5 — fallback: bare wp_id + GATE_<n> glob
    for wpv in _wp_underscore_variants(wp_id):
        if comm.is_dir():
            for p in sorted(comm.glob(f"{wpv}_GATE_{gshort}_*.md")):
                _add(p)

    # Priority 6 — fallback: bare COMPLETION glob
    for wpv in _wp_underscore_variants(wp_id):
        if comm.is_dir():
            for p in sorted(comm.glob(f"{wpv}_COMPLETION_*.md")):
                _add(p)

    # Priority 7 — fallback: bare GATE_<n> DECISION glob
    for wpv in _wp_underscore_variants(wp_id):
        if comm.is_dir():
            for p in sorted(comm.glob(f"{wpv}_GATE_{gshort}_DECISION*.md")):
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
        candidates = _mode_b_candidate_paths(comm, source.wp_id, source.gate_id, source.team_id)
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
                fingerprint = _file_fingerprint(p)
                if fingerprint in _PROCESSED_FILES:
                    continue
                _PROCESSED_FILES.add(fingerprint)
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
            rr = _normalise_route_rec(o1.get("route_recommendation"))
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
            rr = _normalise_route_rec(o2.get("route_recommendation"))
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
