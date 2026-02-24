#!/usr/bin/env python3
"""Build and validate canonical portfolio snapshot from markdown SSOT files.

SSOT rules:
- Runtime current state is read only from WSM CURRENT_OPERATIONAL_STATE.
- Portfolio pipeline is read from roadmap/program/wp registries.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[2]

WSM_PATH = ROOT / "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md"
ROADMAP_PATH = ROOT / "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md"
PROGRAM_PATH = ROOT / "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md"
WP_PATH = ROOT / "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md"


class PortfolioError(RuntimeError):
    pass


@dataclass
class ValidationResult:
    errors: List[str]
    warnings: List[str]

    @property
    def ok(self) -> bool:
        return not self.errors


def _normalize_cell(cell: str) -> str:
    return re.sub(r"\s+", " ", cell.strip())


def _read_text(path: Path) -> str:
    if not path.exists():
        raise PortfolioError(f"Missing required file: {path}")
    return path.read_text(encoding="utf-8")


def _find_heading_block(text: str, heading: str) -> str:
    marker = f"## {heading}"
    start = text.find(marker)
    if start < 0:
        raise PortfolioError(f"Heading not found: {marker}")
    rest = text[start + len(marker) :]
    next_h = rest.find("\n## ")
    return rest if next_h < 0 else rest[:next_h]


def _parse_markdown_table(block: str) -> Tuple[List[str], List[Dict[str, str]]]:
    lines = [ln.rstrip() for ln in block.splitlines()]
    table_lines = [ln for ln in lines if ln.strip().startswith("|")]
    if len(table_lines) < 2:
        raise PortfolioError("Markdown table not found in block")

    header_cells = [_normalize_cell(c) for c in table_lines[0].strip().strip("|").split("|")]
    rows: List[Dict[str, str]] = []

    for line in table_lines[1:]:
        cells = [_normalize_cell(c) for c in line.strip().strip("|").split("|")]
        if all(re.fullmatch(r"[-:]+", c.replace(" ", "")) for c in cells):
            continue
        if len(cells) < len(header_cells):
            cells += [""] * (len(header_cells) - len(cells))
        row = {header_cells[i]: cells[i] for i in range(len(header_cells))}
        rows.append(row)

    return header_cells, rows


def _table_after_heading(text: str, heading: str) -> List[Dict[str, str]]:
    block = _find_heading_block(text, heading)
    _, rows = _parse_markdown_table(block)
    return rows


def _extract_wsm_current_state(text: str) -> Dict[str, str]:
    block = _find_heading_block(text, "CURRENT_OPERATIONAL_STATE (single canonical block — TEAM_100_WSM_OPERATIONAL_STATE_PROTOCOL_v1.0.0)")
    _, rows = _parse_markdown_table(block)
    out: Dict[str, str] = {}
    for row in rows:
        key = row.get("Field", "").strip()
        val = row.get("Value", "").strip()
        if key:
            out[key] = val
    if not out:
        raise PortfolioError("WSM CURRENT_OPERATIONAL_STATE table is empty")
    return out


def _parse_bool(val: str) -> bool:
    return val.strip().lower() == "true"


def _clean_id(value: str) -> str:
    # Handles values like: "N/A (last closed: S001-P001-WP002)"
    return value.split("(", 1)[0].strip()


def _program_number(program_id: str) -> int:
    m = re.search(r"-P(\d+)$", (program_id or "").upper())
    return int(m.group(1)) if m else 999


def _wp_number(work_package_id: str) -> int:
    m = re.search(r"-WP(\d+)$", (work_package_id or "").upper())
    return int(m.group(1)) if m else 999


def _stage_number(stage_id: str) -> int:
    """Extract numeric part: S001 -> 1, S003 -> 3, S-001 -> -1."""
    if not stage_id:
        return 999
    s = (stage_id or "").strip().upper()
    m = re.search(r"S(-?\d+)$", s)
    if not m:
        return 999
    return int(m.group(1))


def build_snapshot() -> Dict[str, object]:
    wsm = _extract_wsm_current_state(_read_text(WSM_PATH))
    roadmap_text = _read_text(ROADMAP_PATH)
    roadmap_rows = _table_after_heading(roadmap_text, "Stages (catalog)")
    detail_rows: List[Dict[str, str]] = []
    try:
        detail_rows = _table_after_heading(roadmap_text, "Stage details (pages, server modules, client components)")
    except PortfolioError:
        pass
    details_by_stage: Dict[str, Dict[str, str]] = {
        r.get("stage_id", ""): {
            "pages": r.get("pages", ""),
            "server_modules": r.get("server_modules", ""),
            "client_components": r.get("client_components", ""),
        }
        for r in detail_rows
    }
    program_rows = _table_after_heading(_read_text(PROGRAM_PATH), "Programs")
    wp_rows = _table_after_heading(_read_text(WP_PATH), "Work Packages")

    stages = []
    for r in roadmap_rows:
        sid = r.get("stage_id", "")
        stage = {
            "stage_id": sid,
            "stage_name": r.get("stage_name", ""),
            "planned_scope": r.get("planned_scope", ""),
            "status": r.get("status", ""),
        }
        detail = details_by_stage.get(sid, {})
        stage["pages"] = detail.get("pages", "")
        stage["server_modules"] = detail.get("server_modules", "")
        stage["client_components"] = detail.get("client_components", "")
        stages.append(stage)

    programs = [
        {
            "program_id": r.get("program_id", ""),
            "program_name": r.get("program_name", ""),
            "domain": r.get("domain", ""),
            "stage_id": r.get("stage_id", ""),
            "status": r.get("status", ""),
            "current_gate_mirror": r.get("current_gate_mirror", ""),
        }
        for r in program_rows
    ]

    program_by_id = {p["program_id"]: p for p in programs}
    work_packages = []
    for r in wp_rows:
        pid = r.get("program_id", "")
        domain = (program_by_id.get(pid) or {}).get("domain", "")
        work_packages.append({
            "work_package_id": r.get("work_package_id", ""),
            "program_id": pid,
            "domain": domain,
            "status": r.get("status", ""),
            "current_gate": r.get("current_gate", ""),
            "is_active": _parse_bool(r.get("is_active", "")),
            "active_marker_reason": r.get("active_marker_reason", ""),
        })

    # True hierarchy: each stage has programs (sub); each program has work_packages (sub). Domains: TikTrack, Agents_OS.
    stage_order_list = [s.get("stage_id", "") for s in stages]
    programs_by_stage: Dict[str, List[dict]] = {}
    for p in programs:
        sid = p.get("stage_id", "")
        programs_by_stage.setdefault(sid, []).append(p)
    for sid in programs_by_stage:
        programs_by_stage[sid].sort(key=lambda x: (_program_number(x.get("program_id", "")), x.get("program_id", "")))
    wps_by_program: Dict[str, List[dict]] = {}
    for w in work_packages:
        pid = w.get("program_id", "")
        wps_by_program.setdefault(pid, []).append(w)
    for pid in wps_by_program:
        wps_by_program[pid].sort(key=lambda x: (_wp_number(x.get("work_package_id", "")), x.get("work_package_id", "")))

    hierarchy: List[Dict[str, object]] = []
    for stage in stages:
        sid = stage.get("stage_id", "")
        stage_programs = programs_by_stage.get(sid, [])
        hierarchy.append({
            "stage_id": sid,
            "stage_name": stage.get("stage_name", ""),
            "status": stage.get("status", ""),
            "planned_scope": stage.get("planned_scope", ""),
            "pages": stage.get("pages", ""),
            "server_modules": stage.get("server_modules", ""),
            "client_components": stage.get("client_components", ""),
            "domain": "SHARED",
            "programs": [
                {
                    "program_id": p.get("program_id", ""),
                    "program_name": p.get("program_name", ""),
                    "domain": p.get("domain", ""),
                    "status": p.get("status", ""),
                    "current_gate_mirror": p.get("current_gate_mirror", ""),
                    "work_packages": wps_by_program.get(p.get("program_id", ""), []),
                }
                for p in stage_programs
            ],
        })

    return {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "sources": {
            "wsm": str(WSM_PATH.relative_to(ROOT)),
            "roadmap": str(ROADMAP_PATH.relative_to(ROOT)),
            "program_registry": str(PROGRAM_PATH.relative_to(ROOT)),
            "work_package_registry": str(WP_PATH.relative_to(ROOT)),
        },
        "runtime": {
            "active_stage_id": wsm.get("active_stage_id", ""),
            "active_work_package_id": _clean_id(wsm.get("active_work_package_id", "")),
            "in_progress_work_package_id": _clean_id(wsm.get("in_progress_work_package_id", "")),
            "current_gate": wsm.get("current_gate", ""),
            "active_program_id": _clean_id(wsm.get("active_program_id", "")),
            "last_gate_event": wsm.get("last_gate_event", ""),
            "next_required_action": wsm.get("next_required_action", ""),
            "next_responsible_team": wsm.get("next_responsible_team", ""),
        },
        "stages": stages,
        "programs": programs,
        "work_packages": work_packages,
        "hierarchy": hierarchy,
    }


def validate_snapshot(snapshot: Dict[str, object]) -> ValidationResult:
    errors: List[str] = []
    warnings: List[str] = []

    runtime = snapshot["runtime"]
    stages = snapshot["stages"]
    programs = snapshot["programs"]
    work_packages = snapshot["work_packages"]

    # Basic existence checks
    if not stages:
        errors.append("No stages found in portfolio roadmap")
    if not programs:
        errors.append("No programs found in program registry")
    if not work_packages:
        errors.append("No work packages found in work package registry")

    # Uniqueness checks
    stage_ids = [s["stage_id"] for s in stages if s.get("stage_id")]
    if len(stage_ids) != len(set(stage_ids)):
        errors.append("Duplicate stage_id values in roadmap")

    program_ids = [p["program_id"] for p in programs if p.get("program_id")]
    if len(program_ids) != len(set(program_ids)):
        errors.append("Duplicate program_id values in program registry")

    wp_ids = [w["work_package_id"] for w in work_packages if w.get("work_package_id")]
    if len(wp_ids) != len(set(wp_ids)):
        errors.append("Duplicate work_package_id values in WP registry")

    # Required fields
    for p in programs:
        if not p["domain"]:
            errors.append(f"Program {p['program_id']} missing domain")
        if not p["current_gate_mirror"] and p["status"].upper() not in {"FROZEN", "HOLD"}:
            errors.append(f"Program {p['program_id']} missing current_gate_mirror")

    for w in work_packages:
        if not w["current_gate"]:
            errors.append(f"Work package {w['work_package_id']} missing current_gate")

    # WSM<->WP active-state contract
    active_wps = [w for w in work_packages if w["is_active"]]
    active_wp_wsm = runtime.get("active_work_package_id", "").strip()

    no_active_markers = {"", "N/A", "—", "-", "NONE"}
    if active_wp_wsm.upper() in {m.upper() for m in no_active_markers}:
        if active_wps:
            errors.append("WSM says no active work package, but WP registry has is_active=true")
    else:
        if len(active_wps) != 1:
            errors.append("WSM has active_work_package_id, but WP registry does not have exactly one active row")
        elif active_wps[0]["work_package_id"] != active_wp_wsm:
            errors.append(
                f"Active WP mismatch: WSM={active_wp_wsm} vs registry={active_wps[0]['work_package_id']}"
            )

    # WSM current gate mirror for active program
    active_program_id = runtime.get("active_program_id", "")
    current_gate = runtime.get("current_gate", "")
    if active_program_id and current_gate:
        matching = [p for p in programs if p["program_id"] == active_program_id]
        if not matching:
            warnings.append(f"Active program {active_program_id} not found in program registry")
        else:
            mirror = matching[0]["current_gate_mirror"]
            if mirror and current_gate not in mirror:
                errors.append(
                    f"Program gate mirror mismatch for {active_program_id}: mirror='{mirror}' vs WSM current_gate='{current_gate}'"
                )

    return ValidationResult(errors=errors, warnings=warnings)


def _build_hierarchy_md(snapshot: Dict[str, object]) -> List[str]:
    """Build hierarchical roadmap view: Stage (shared) → Program (sub, domain) → Work Package (sub, domain).
    Domains: TikTrack, Agents_OS. 5 main stages; stage 2 is missing (שלב 2 חסר).
    """
    hierarchy = snapshot.get("hierarchy") or []
    stage_numbers = sorted({_stage_number(h["stage_id"]) for h in hierarchy})
    missing = [n for n in range(1, max(stage_numbers) + 1) if n > 0 and n not in stage_numbers]

    lines = [
        "## Roadmap (hierarchical)",
        "",
        "**היררכיה:** שלב (משותף לשני הדומיינים) → תוכנית (sub של שלב) → חבילת עבודה (sub של תוכנית).",
        "**דומיינים:** TikTrack, Agents_OS. כל תוכנית וכל חבילת עבודה משויכות לדומיין אחד.",
        "",
    ]
    if missing:
        lines.append(f"**שלבים ראשיים:** 5 שלבים (שלב 2 חסר — אין S002 בקטלוג).")
        lines.append("")

    for node in hierarchy:
        sid = node.get("stage_id", "")
        sname = node.get("stage_name", "")
        sstatus = node.get("status", "")
        lines.append(f"### Stage: {sid} — {sname} | {sstatus} [SHARED]")
        lines.append("")
        for p in node.get("programs", []):
            pid = p.get("program_id", "")
            pname = p.get("program_name", "")
            pstatus = p.get("status", "")
            domain = (p.get("domain") or "").strip() or "—"
            lines.append(f"#### Program: {pid} — {pname} | {pstatus} | domain: **{domain}**")
            lines.append("")
            for w in p.get("work_packages", []):
                wid = w.get("work_package_id", "")
                wstatus = w.get("status", "")
                wgate = w.get("current_gate", "")
                wdomain = (w.get("domain") or "").strip() or "—"
                active = " (active)" if w.get("is_active") else ""
                lines.append(f"- **WP** `{wid}` | {wstatus} | gate: {wgate} | domain: **{wdomain}**{active}")
            lines.append("")
        lines.append("")
    return lines


def build_markdown_summary(snapshot: Dict[str, object], result: ValidationResult) -> str:
    runtime = snapshot["runtime"]
    lines = [
        "# Portfolio Automation Snapshot",
        "",
        f"- Generated (UTC): `{snapshot['generated_at_utc']}`",
        f"- Validation: `{'PASS' if result.ok else 'FAIL'}`",
        f"- Errors: `{len(result.errors)}`",
        f"- Warnings: `{len(result.warnings)}`",
        "",
        "## Runtime (from WSM)",
        "",
        f"- active_stage_id: `{runtime.get('active_stage_id', '')}`",
        f"- active_program_id: `{runtime.get('active_program_id', '')}`",
        f"- active_work_package_id: `{runtime.get('active_work_package_id', '')}`",
        f"- current_gate: `{runtime.get('current_gate', '')}`",
        f"- next_required_action: `{runtime.get('next_required_action', '')}`",
        "",
        "## Portfolio Counts",
        "",
        f"- stages: `{len(snapshot['stages'])}`",
        f"- programs: `{len(snapshot['programs'])}`",
        f"- work_packages: `{len(snapshot['work_packages'])}`",
        "",
    ]
    lines += _build_hierarchy_md(snapshot)

    if result.errors:
        lines += ["## Errors", ""]
        lines += [f"- {e}" for e in result.errors]
        lines.append("")

    if result.warnings:
        lines += ["## Warnings", ""]
        lines += [f"- {w}" for w in result.warnings]
        lines.append("")

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Build + validate portfolio snapshot")
    parser.add_argument(
        "--out-json",
        default=str(ROOT / "portfolio_project/portfolio_snapshot.json"),
        help="Output snapshot JSON path",
    )
    parser.add_argument(
        "--out-md",
        default=str(ROOT / "portfolio_project/portfolio_snapshot.md"),
        help="Output summary markdown path",
    )
    parser.add_argument("--check", action="store_true", help="Fail with non-zero exit when validation fails")
    args = parser.parse_args()

    snapshot = build_snapshot()
    result = validate_snapshot(snapshot)
    summary = build_markdown_summary(snapshot, result)

    out_json = Path(args.out_json)
    out_md = Path(args.out_md)
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_md.parent.mkdir(parents=True, exist_ok=True)

    out_json.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    out_md.write_text(summary + "\n", encoding="utf-8")

    if result.errors:
        print("Portfolio snapshot validation FAILED:")
        for err in result.errors:
            print(f" - {err}")
        if args.check:
            return 1
    else:
        print("Portfolio snapshot validation PASSED")

    if result.warnings:
        print("Warnings:")
        for warn in result.warnings:
            print(f" - {warn}")

    print(f"Snapshot JSON: {out_json}")
    print(f"Summary MD: {out_md}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
