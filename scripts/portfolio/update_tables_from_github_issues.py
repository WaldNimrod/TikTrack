#!/usr/bin/env python3
"""Update canonical portfolio tables (Roadmap, Program Registry, WP Registry) from GitHub Issues.

Reads all issues with label portfolio-pipeline, parses hierarchy and fields from labels/body,
merges with existing table content (preserves fields not set from issues), writes back the
three markdown files. Run from repo root; requires GITHUB_TOKEN and GITHUB_REPOSITORY.
"""

from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[2]
MANAGED_LABEL = "portfolio-pipeline"
ROADMAP_PATH = ROOT / "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md"
PROGRAM_PATH = ROOT / "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md"
WP_PATH = ROOT / "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md"

PARENT_STAGE_PREFIX = "portfolio-parent-stage-"
PARENT_PROGRAM_PREFIX = "portfolio-parent-program-"
DOMAIN_PREFIX = "portfolio-domain-"
STATUS_PREFIX = "portfolio-status-"
TYPE_STAGE = "portfolio-stage"
TYPE_PROGRAM = "portfolio-program"
TYPE_WP = "portfolio-work-package"


def _request(owner: str, repo: str, token: str, method: str, path: str, payload: Optional[dict] = None) -> Any:
    base = f"https://api.github.com/repos/{owner}/{repo}"
    url = f"{base}{path}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url=url, method=method, data=data)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw) if raw else []


def list_issues(owner: str, repo: str, token: str) -> List[dict]:
    issues: List[dict] = []
    page = 1
    while True:
        q = urllib.parse.urlencode({"state": "all", "labels": MANAGED_LABEL, "per_page": 100, "page": page})
        batch = _request(owner, repo, token, "GET", f"/issues?{q}")
        if not isinstance(batch, list) or not batch:
            break
        issues.extend([i for i in batch if "pull_request" not in i])
        if len(batch) < 100:
            break
        page += 1
    return issues


def _extract_key(body: str) -> Optional[str]:
    if not body:
        return None
    m = re.search(r"portfolio_key:([^\s]+)\s*-->", body)
    return m.group(1).strip() if m else None


def _body_field(body: str, name: str) -> str:
    m = re.search(rf"-\s*{re.escape(name)}:\s*`([^`]*)`", body)
    return (m.group(1).strip() if m else "")


def _label_value(labels: List[str], prefix: str) -> str:
    for lb in labels:
        if isinstance(lb, dict):
            lb = lb.get("name", "")
        if isinstance(lb, str) and lb.startswith(prefix):
            return lb[len(prefix) :].strip()
    return ""


def _status_from_labels(labels: List[str]) -> str:
    for lb in labels:
        name = lb.get("name", "") if isinstance(lb, dict) else str(lb)
        if not name.startswith(STATUS_PREFIX):
            continue
        s = name[len(STATUS_PREFIX) :].lower()
        if "active" in s:
            return "ACTIVE"
        if "complete" in s or "closed" in s:
            return "CLOSED" if "closed" in s else "COMPLETE"
        if "hold" in s:
            return "HOLD"
        if "in_progress" in s:
            return "IN_PROGRESS"
        if "planned" in s:
            return "PLANNED"
    return ""


def parse_issues(issues: List[dict]) -> Tuple[List[Dict[str, str]], List[Dict[str, str]], List[Dict[str, str]]]:
    stages_by_id: Dict[str, Dict[str, str]] = {}
    programs_by_id: Dict[str, Dict[str, str]] = {}
    wps_by_id: Dict[str, Dict[str, str]] = {}

    for issue in issues:
        labels = issue.get("labels", [])
        label_names = [lb.get("name", lb) if isinstance(lb, dict) else lb for lb in labels]
        body = issue.get("body", "") or ""
        title = (issue.get("title") or "").strip()
        state = (issue.get("state") or "open").lower()
        key = _extract_key(body)

        if TYPE_STAGE in label_names and key and key.startswith("stage:"):
            sid = key.replace("stage:", "").strip()
            planned_scope = _body_field(body, "planned_scope") or _body_field(body, "planned scope")
            status = _status_from_labels(labels) or ("COMPLETED" if state == "closed" else "ACTIVE" if "active" in (title + body).lower() else "PLANNED")
            stages_by_id[sid] = {
                "stage_id": sid,
                "stage_name": title or sid,
                "planned_scope": planned_scope or "—",
                "status": status,
            }

        elif TYPE_PROGRAM in label_names and key and key.startswith("program:"):
            pid = key.replace("program:", "").strip()
            stage_id = _label_value(label_names, PARENT_STAGE_PREFIX) or _body_field(body, "stage_id")
            domain = _label_value(label_names, DOMAIN_PREFIX) or _body_field(body, "domain") or "TIKTRACK"
            if domain == "SHARED":
                domain = "TIKTRACK"
            gate = _body_field(body, "current_gate_mirror") or "—"
            status = _status_from_labels(labels) or ("COMPLETE" if state == "closed" else "FROZEN" if "hold" in (title + body).lower() else "ACTIVE")
            programs_by_id[pid] = {
                "stage_id": stage_id,
                "program_id": pid,
                "program_name": title or pid,
                "domain": domain.upper(),
                "status": status,
                "current_gate_mirror": gate,
            }

        elif TYPE_WP in label_names and key and key.startswith("work_package:"):
            wid = key.replace("work_package:", "").strip()
            program_id = _label_value(label_names, PARENT_PROGRAM_PREFIX) or _body_field(body, "program_id")
            current_gate = _body_field(body, "current_gate") or "—"
            is_active = (_body_field(body, "is_active") or "false").lower() == "true"
            reason = _body_field(body, "active_marker_reason") or ""
            status = _status_from_labels(labels) or ("CLOSED" if state == "closed" else "IN_PROGRESS" if is_active else "HOLD")
            wps_by_id[wid] = {
                "program_id": program_id,
                "work_package_id": wid,
                "status": status,
                "current_gate": current_gate,
                "is_active": str(is_active).lower(),
                "active_marker_reason": reason or "—",
            }

    # Order: stages by S-001, S001, S002, ...; programs by stage then P; wps by program then WP
    def stage_order(sid: str) -> tuple:
        m = re.search(r"S-?(\d+)$", (sid or "").upper())
        n = int(m.group(1)) if m else 999
        return (-1 if sid and "S-" in sid.upper() else 1, n)

    stages = sorted(stages_by_id.values(), key=lambda r: stage_order(r.get("stage_id", "")))
    programs = sorted(
        programs_by_id.values(),
        key=lambda r: (stage_order(r.get("stage_id", "")), r.get("program_id", "")),
    )
    wps = sorted(
        wps_by_id.values(),
        key=lambda r: (r.get("program_id", ""), r.get("work_package_id", "")),
    )
    return stages, programs, wps


def read_existing_table(path: Path, heading: str) -> Tuple[List[str], List[Dict[str, str]]]:
    text = path.read_text(encoding="utf-8")
    marker = f"## {heading}"
    start = text.find(marker)
    if start < 0:
        return [], []
    block = text[start + len(marker) :]
    next_h = block.find("\n## ")
    if next_h >= 0:
        block = block[:next_h]
    lines = [ln.rstrip() for ln in block.splitlines()]
    table_lines = [ln for ln in lines if ln.strip().startswith("|")]
    if len(table_lines) < 2:
        return [], []
    header = [c.strip() for c in table_lines[0].strip().strip("|").split("|")]
    rows = []
    for ln in table_lines[1:]:
        cells = [c.strip() for c in ln.strip().strip("|").split("|")]
        if all(re.fullmatch(r"[-:]+", c.replace(" ", "")) for c in cells):
            continue
        if len(cells) < len(header):
            cells += [""] * (len(header) - len(cells))
        rows.append(dict(zip(header, cells)))
    return header, rows


def _stage_sort_key(sid: str) -> tuple:
    m = re.search(r"S-?(\d+)$", (sid or "").upper())
    n = int(m.group(1)) if m else 999
    return (-1 if sid and "S-" in sid.upper() else 1, n)


def merge_stages(from_issues: List[Dict[str, str]], existing_header: List[str], existing_rows: List[Dict[str, str]]) -> List[Dict[str, str]]:
    by_id = {r.get("stage_id", ""): r for r in existing_rows if r.get("stage_id")}
    for r in from_issues:
        sid = r.get("stage_id", "")
        if sid:
            by_id[sid] = {**by_id.get(sid, {}), **r}
    return sorted(by_id.values(), key=lambda r: _stage_sort_key(r.get("stage_id", "")))


def merge_programs(from_issues: List[Dict[str, str]], existing_header: List[str], existing_rows: List[Dict[str, str]]) -> List[Dict[str, str]]:
    by_id = {r.get("program_id", ""): r for r in existing_rows if r.get("program_id")}
    for r in from_issues:
        pid = r.get("program_id", "")
        if pid:
            by_id[pid] = {**by_id.get(pid, {}), **r}
    return sorted(by_id.values(), key=lambda r: (_stage_sort_key(r.get("stage_id", "")), r.get("program_id", "")))


def merge_wps(from_issues: List[Dict[str, str]], existing_header: List[str], existing_rows: List[Dict[str, str]]) -> List[Dict[str, str]]:
    by_id = {r.get("work_package_id", ""): r for r in existing_rows if r.get("work_package_id")}
    for r in from_issues:
        wid = r.get("work_package_id", "")
        if wid:
            by_id[wid] = {**by_id.get(wid, {}), **r}
    return sorted(by_id.values(), key=lambda r: (r.get("program_id", ""), r.get("work_package_id", "")))


def table_to_markdown(header: List[str], rows: List[Dict[str, str]]) -> str:
    lines = ["| " + " | ".join(header) + " |", "| " + " | ".join("---" for _ in header) + " |"]
    for r in rows:
        lines.append("| " + " | ".join(r.get(h, "") for h in header) + " |")
    return "\n".join(lines)


def replace_table_in_file(path: Path, heading: str, new_table: str) -> bool:
    text = path.read_text(encoding="utf-8")
    marker = f"## {heading}"
    start = text.find(marker)
    if start < 0:
        return False
    after_heading = text[start + len(marker) :].lstrip("\n")
    lines = after_heading.split("\n")
    table_start = -1
    for i, ln in enumerate(lines):
        if ln.strip().startswith("|"):
            table_start = i
            break
    if table_start < 0:
        return False
    table_end = table_start
    while table_end < len(lines) and lines[table_end].strip().startswith("|"):
        table_end += 1
    before = text[: start + len(marker)] + "\n\n" + "\n".join(lines[:table_start])
    after = ""
    if table_end < len(lines):
        after = "\n\n" + "\n".join(lines[table_end:])
    new_content = before + "\n\n" + new_table + after
    if new_content == text:
        return False
    path.write_text(new_content, encoding="utf-8")
    return True


def main() -> int:
    token = os.environ.get("GITHUB_TOKEN")
    repo = os.environ.get("GITHUB_REPOSITORY")
    if not token or not repo or "/" not in repo:
        print("GITHUB_TOKEN and GITHUB_REPOSITORY are required")
        return 1
    owner, name = repo.split("/", 1)

    issues = list_issues(owner, name, token)
    stages_issues, programs_issues, wps_issues = parse_issues(issues)

    # Merge with existing tables
    road_header, road_rows = read_existing_table(ROADMAP_PATH, "Stages (catalog)")
    if not road_header:
        road_header = ["stage_id", "stage_name", "planned_scope", "status"]
    stages = merge_stages(stages_issues, road_header, road_rows) if stages_issues else road_rows

    prog_header, prog_rows = read_existing_table(PROGRAM_PATH, "Programs")
    if not prog_header:
        prog_header = ["stage_id", "program_id", "program_name", "domain", "status", "current_gate_mirror"]
    programs = merge_programs(programs_issues, prog_header, prog_rows) if programs_issues else prog_rows

    wp_header, wp_rows = read_existing_table(WP_PATH, "Work Packages")
    if not wp_header:
        wp_header = ["program_id", "work_package_id", "status", "current_gate", "is_active", "active_marker_reason"]
    wps = merge_wps(wps_issues, wp_header, wp_rows) if wps_issues else wp_rows

    changed = False
    if stages:
        tbl = table_to_markdown(road_header, stages)
        if replace_table_in_file(ROADMAP_PATH, "Stages (catalog)", tbl, ""):
            changed = True
            print("Updated Roadmap (Stages)")
    if programs:
        tbl = table_to_markdown(prog_header, programs)
        if replace_table_in_file(PROGRAM_PATH, "Programs", tbl, ""):
            changed = True
            print("Updated Program Registry")
    if wps:
        tbl = table_to_markdown(wp_header, wps)
        if replace_table_in_file(WP_PATH, "Work Packages", tbl, ""):
            changed = True
            print("Updated Work Package Registry")

    if not changed:
        print("No table changes (issues match existing tables or no portfolio issues found)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
