#!/usr/bin/env python3
"""Standardize Program/WP registry mirror fields from WSM runtime SSOT.

Goal:
- WSM remains the only runtime source of truth.
- Program and WP registries are deterministic mirrors.
- Prevent drift by supporting --check in CI and --write locally.
"""

from __future__ import annotations

import argparse
import difflib
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[2]

WSM_PATH = ROOT / "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md"
PROGRAM_PATH = ROOT / "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md"
WP_PATH = ROOT / "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md"

NO_ACTIVE_MARKERS = {"", "N/A", "—", "-", "NONE"}


class SyncError(RuntimeError):
    pass


@dataclass
class SyncResult:
    changed_files: List[Path]
    messages: List[str]


def _read(path: Path) -> str:
    if not path.exists():
        raise SyncError(f"Missing required file: {path}")
    return path.read_text(encoding="utf-8")


def _normalize(cell: str) -> str:
    return re.sub(r"\s+", " ", cell.strip())


def _find_heading_block(text: str, heading: str) -> str:
    marker = f"## {heading}"
    start = text.find(marker)
    if start < 0:
        raise SyncError(f"Heading not found: {marker}")
    rest = text[start + len(marker) :]
    next_h = rest.find("\n## ")
    return rest if next_h < 0 else rest[:next_h]


def _parse_table(block: str) -> Tuple[List[str], List[Dict[str, str]]]:
    lines = [ln.rstrip() for ln in block.splitlines()]
    table_lines = [ln for ln in lines if ln.strip().startswith("|")]
    if len(table_lines) < 2:
        raise SyncError("Markdown table not found")

    headers = [_normalize(c) for c in table_lines[0].strip().strip("|").split("|")]
    rows: List[Dict[str, str]] = []
    for ln in table_lines[1:]:
        cells = [_normalize(c) for c in ln.strip().strip("|").split("|")]
        if all(re.fullmatch(r"[-:]+", c.replace(" ", "")) for c in cells):
            continue
        if len(cells) < len(headers):
            cells += [""] * (len(headers) - len(cells))
        rows.append({headers[i]: cells[i] for i in range(len(headers))})
    return headers, rows


def _parse_wsm_state(text: str) -> Dict[str, str]:
    block = _find_heading_block(
        text,
        "CURRENT_OPERATIONAL_STATE (single canonical block — TEAM_100_WSM_OPERATIONAL_STATE_PROTOCOL_v1.0.0)",
    )
    _, rows = _parse_table(block)
    out: Dict[str, str] = {}
    for row in rows:
        field = row.get("Field", "").strip()
        value = row.get("Value", "").strip()
        if field:
            out[field] = value
    if not out:
        raise SyncError("WSM CURRENT_OPERATIONAL_STATE table is empty")
    return out


def _table_after_heading(text: str, heading: str) -> Tuple[List[str], List[Dict[str, str]]]:
    block = _find_heading_block(text, heading)
    return _parse_table(block)


def _replace_table_in_heading(text: str, heading: str, headers: List[str], rows: List[Dict[str, str]]) -> str:
    marker = f"## {heading}"
    start = text.find(marker)
    if start < 0:
        raise SyncError(f"Heading not found: {marker}")

    rest = text[start + len(marker) :]
    next_h_pos = rest.find("\n## ")
    block = rest if next_h_pos < 0 else rest[:next_h_pos]

    block_lines = block.splitlines()
    table_start = -1
    for i, ln in enumerate(block_lines):
        if ln.strip().startswith("|"):
            table_start = i
            break
    if table_start < 0:
        raise SyncError(f"No table found under heading: {heading}")

    table_end = table_start
    while table_end < len(block_lines) and block_lines[table_end].strip().startswith("|"):
        table_end += 1

    new_table_lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        new_table_lines.append("| " + " | ".join(row.get(h, "") for h in headers) + " |")

    new_block_lines = block_lines[:table_start] + new_table_lines + block_lines[table_end:]
    new_block = "\n".join(new_block_lines)

    if next_h_pos < 0:
        return text[: start + len(marker)] + new_block
    return text[: start + len(marker)] + new_block + rest[next_h_pos:]


def _extract_event_date(last_gate_event: str) -> str:
    m = re.search(r"\b(20\d{2}-\d{2}-\d{2})\b", last_gate_event or "")
    if m:
        return m.group(1)
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _clean_id(value: str) -> str:
    return (value or "").split("(", 1)[0].strip()


def _is_no_active(value: str) -> bool:
    return _clean_id(value).upper() in {m.upper() for m in NO_ACTIVE_MARKERS}


def _normalize_gate_for_wp(current_gate: str, last_gate_event: str, status: str) -> str:
    cg = (current_gate or "").strip()
    le = (last_gate_event or "").upper()
    st = (status or "").upper()
    if st == "CLOSED" and cg == "GATE_8":
        return "GATE_8 (PASS)"
    if "PASS" in le and cg == "GATE_8":
        return "GATE_8 (PASS)"
    return cg or "—"


def _status_for_active_wp(current_gate: str, active_flow: str, last_gate_event: str) -> str:
    cg = (current_gate or "").upper()
    af = (active_flow or "").upper()
    le = (last_gate_event or "").upper()
    if cg == "GATE_8" and ("PASS" in af or "PASS" in le or "DOCUMENTATION_CLOSED" in af):
        return "CLOSED"
    return "IN_PROGRESS"


def _sync_program_registry(program_text: str, wsm: Dict[str, str], event_date: str) -> Tuple[str, List[str]]:
    headers, rows = _table_after_heading(program_text, "Programs")
    messages: List[str] = []

    active_program_id = _clean_id(wsm.get("active_program_id", ""))
    active_wp = _clean_id(wsm.get("active_work_package_id", ""))
    current_gate = wsm.get("current_gate", "").strip()
    active_flow = wsm.get("active_flow", "").strip()

    if not active_program_id:
        messages.append("Program registry: no active_program_id in WSM; table left unchanged")
        return program_text, messages

    mirror_text = (
        f"{current_gate}; active_flow={active_flow}; active_work_package_id={active_wp or 'N/A'}"
    ).strip()

    found = False
    for row in rows:
        if row.get("program_id", "").strip() == active_program_id:
            row["current_gate_mirror"] = mirror_text
            found = True
            messages.append(f"Program registry: updated mirror for {active_program_id}")
            break

    if not found:
        messages.append(f"Program registry: active program {active_program_id} not found in table")

    new_text = _replace_table_in_heading(program_text, "Programs", headers, rows)

    mirror_source_pattern = r"\*\*current_gate_mirror source:\*\*.*"
    mirror_source_repl = (
        f"**current_gate_mirror source:** WSM CURRENT_OPERATIONAL_STATE (last update {event_date}). "
        "Sync contract: `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md`."
    )
    new_text = re.sub(mirror_source_pattern, mirror_source_repl, new_text, count=1)

    wsm_mirror_pattern = r"\*\*WSM mirror \([0-9]{4}-[0-9]{2}-[0-9]{2}\):\*\*.*"
    wsm_mirror_repl = (
        f"**WSM mirror ({event_date}):** active_stage_id={_clean_id(wsm.get('active_stage_id', ''))}; "
        f"active_program_id={active_program_id}; current_gate={current_gate}; "
        f"active_work_package_id={active_wp or 'N/A'}; active_flow={active_flow}."
    )
    new_text = re.sub(wsm_mirror_pattern, wsm_mirror_repl, new_text, count=1)

    return new_text, messages


def _sync_wp_registry(wp_text: str, wsm: Dict[str, str], event_date: str) -> Tuple[str, List[str]]:
    headers, rows = _table_after_heading(wp_text, "Work Packages")
    messages: List[str] = []

    active_program_id = _clean_id(wsm.get("active_program_id", ""))
    active_wp = _clean_id(wsm.get("active_work_package_id", ""))
    current_gate = wsm.get("current_gate", "").strip()
    active_flow = wsm.get("active_flow", "").strip()
    last_gate_event = wsm.get("last_gate_event", "").strip()
    last_closed_wp = _clean_id(wsm.get("last_closed_work_package_id", ""))

    # Normalize all rows first.
    for row in rows:
        row["is_active"] = "false"
        row["current_gate"] = _normalize_gate_for_wp(
            row.get("current_gate", "").strip(),
            row.get("active_marker_reason", ""),
            row.get("status", "").strip(),
        )

    if _is_no_active(active_wp):
        messages.append("WP registry: WSM has NO_ACTIVE_WORK_PACKAGE")
    else:
        target_row = None
        for row in rows:
            if row.get("work_package_id", "").strip() == active_wp:
                target_row = row
                break

        if target_row is None:
            target_row = {
                "program_id": active_program_id or "N/A",
                "work_package_id": active_wp,
                "status": "IN_PROGRESS",
                "current_gate": current_gate or "GATE_3",
                "is_active": "true",
                "active_marker_reason": active_flow or "Active per WSM",
            }
            rows.append(target_row)
            messages.append(f"WP registry: created missing row for active WP {active_wp}")

        target_row["program_id"] = target_row.get("program_id", "").strip() or active_program_id
        target_row["status"] = _status_for_active_wp(current_gate, active_flow, last_gate_event)
        target_row["current_gate"] = current_gate or target_row.get("current_gate", "—")
        target_row["is_active"] = "true"
        target_row["active_marker_reason"] = active_flow or "Active per WSM"
        messages.append(f"WP registry: marked {active_wp} as active=true")

    if last_closed_wp and not _is_no_active(last_closed_wp):
        current_gate_upper = (current_gate or "").upper()
        active_flow_upper = (active_flow or "").upper()
        last_gate_event_upper = (last_gate_event or "").upper()
        closed_on_gate8_pass = (
            current_gate_upper == "GATE_8"
            and (
                "PASS" in active_flow_upper
                or "PASS" in last_gate_event_upper
                or "DOCUMENTATION_CLOSED" in active_flow_upper
            )
        )
        for row in rows:
            if row.get("work_package_id", "").strip() == last_closed_wp:
                row["status"] = "CLOSED"
                if closed_on_gate8_pass:
                    row["current_gate"] = "GATE_8 (PASS)"
                    row["active_marker_reason"] = f"Lifecycle complete {event_date}"
                else:
                    row["current_gate"] = _normalize_gate_for_wp(
                        row.get("current_gate", "").strip(),
                        last_gate_event,
                        "CLOSED",
                    )
                row["is_active"] = "false"
                messages.append(f"WP registry: marked {last_closed_wp} as CLOSED")
                break

    rows.sort(key=lambda r: (r.get("program_id", ""), r.get("work_package_id", "")))
    new_text = _replace_table_in_heading(wp_text, "Work Packages", headers, rows)

    active_wp_for_summary = "N/A" if _is_no_active(active_wp) else active_wp
    if _is_no_active(active_wp):
        summary_line = (
            f"**Current active WP state (mirror from WSM):** **NO_ACTIVE_WORK_PACKAGE** — "
            f"WSM `active_stage_id={_clean_id(wsm.get('active_stage_id', ''))}`, "
            f"`active_program_id={active_program_id}`, `current_gate={current_gate}`, "
            f"`active_work_package_id={active_wp_for_summary}`."
        )
    else:
        summary_line = (
            f"**Current active WP state (mirror from WSM):** **ACTIVE_WORK_PACKAGE_PRESENT** — "
            f"WSM `active_stage_id={_clean_id(wsm.get('active_stage_id', ''))}`, "
            f"`active_program_id={active_program_id}`, `current_gate={current_gate}`, "
            f"`active_work_package_id={active_wp_for_summary}`."
        )

    new_text = re.sub(
        r"\*\*Current active WP state \(mirror from WSM\):\*\*.*",
        summary_line,
        new_text,
        count=1,
    )
    new_text = re.sub(
        r"\*\*Mirror source:\*\*.*",
        f"**Mirror source:** WSM CURRENT_OPERATIONAL_STATE (last update {event_date}). When no WP is active, no row has `is_active=true`; state is explicit in WSM and reflected here.",
        new_text,
        count=1,
    )

    return new_text, messages


def run_sync(write: bool) -> SyncResult:
    wsm_text = _read(WSM_PATH)
    wsm = _parse_wsm_state(wsm_text)
    event_date = _extract_event_date(wsm.get("last_gate_event", ""))

    program_before = _read(PROGRAM_PATH)
    wp_before = _read(WP_PATH)

    program_after, program_msgs = _sync_program_registry(program_before, wsm, event_date)
    wp_after, wp_msgs = _sync_wp_registry(wp_before, wsm, event_date)

    changed_files: List[Path] = []
    messages = program_msgs + wp_msgs

    if program_after != program_before:
        changed_files.append(PROGRAM_PATH)
        if write:
            PROGRAM_PATH.write_text(program_after, encoding="utf-8")
    if wp_after != wp_before:
        changed_files.append(WP_PATH)
        if write:
            WP_PATH.write_text(wp_after, encoding="utf-8")

    return SyncResult(changed_files=changed_files, messages=messages)


def _print_diff(path: Path, old: str, new: str) -> None:
    rel = path.relative_to(ROOT)
    diff = difflib.unified_diff(
        old.splitlines(),
        new.splitlines(),
        fromfile=f"a/{rel}",
        tofile=f"b/{rel}",
        lineterm="",
    )
    for line in diff:
        print(line)


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync Program/WP registry mirrors from WSM runtime state")
    parser.add_argument("--write", action="store_true", help="Apply changes to files")
    parser.add_argument("--check", action="store_true", help="Fail when files are not synchronized")
    args = parser.parse_args()

    if args.write and args.check:
        raise SyncError("Use either --write or --check, not both")

    program_before = _read(PROGRAM_PATH)
    wp_before = _read(WP_PATH)

    result = run_sync(write=args.write)
    for msg in result.messages:
        print(msg)

    if args.write:
        if result.changed_files:
            print("SYNC: updated files:")
            for path in result.changed_files:
                print(f" - {path.relative_to(ROOT)}")
        else:
            print("SYNC: no changes needed (already standardized)")
        return 0

    program_after, _ = _sync_program_registry(program_before, _parse_wsm_state(_read(WSM_PATH)), _extract_event_date(_parse_wsm_state(_read(WSM_PATH)).get("last_gate_event", "")))
    wp_after, _ = _sync_wp_registry(wp_before, _parse_wsm_state(_read(WSM_PATH)), _extract_event_date(_parse_wsm_state(_read(WSM_PATH)).get("last_gate_event", "")))

    unsynced = False
    if program_after != program_before:
        unsynced = True
        _print_diff(PROGRAM_PATH, program_before, program_after)
    if wp_after != wp_before:
        unsynced = True
        _print_diff(WP_PATH, wp_before, wp_after)

    if args.check and unsynced:
        print("SYNC CHECK: FAIL (registries are not standardized with WSM)")
        print("Run: python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --write")
        return 1

    if unsynced:
        print("SYNC CHECK: DRIFT DETECTED")
        return 0

    print("SYNC CHECK: PASS (registries standardized with WSM)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
