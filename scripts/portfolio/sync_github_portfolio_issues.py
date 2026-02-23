#!/usr/bin/env python3
"""Sync portfolio snapshot into GitHub Issues for built-in Project pipeline views.

This script is designed to run in GitHub Actions with GITHUB_TOKEN.
It keeps one managed issue per stage/program/work-package/runtime card.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

ROOT = Path(__file__).resolve().parents[2]

MANAGED_LABEL = "portfolio-pipeline"
TYPE_LABELS = {
    "runtime": "portfolio-runtime",
    "stage": "portfolio-stage",
    "program": "portfolio-program",
    "work_package": "portfolio-work-package",
}
STATUS_LABELS = {
    "active": "portfolio-status-active",
    "planned": "portfolio-status-planned",
    "hold": "portfolio-status-hold",
    "in_progress": "portfolio-status-in-progress",
    "closed": "portfolio-status-closed",
    "complete": "portfolio-status-complete",
}

LABEL_COLORS = {
    MANAGED_LABEL: "1f6feb",
    "portfolio-runtime": "8250df",
    "portfolio-stage": "0e8a16",
    "portfolio-program": "5319e7",
    "portfolio-work-package": "fbca04",
    "portfolio-status-active": "0e8a16",
    "portfolio-status-planned": "d4c5f9",
    "portfolio-status-hold": "e99695",
    "portfolio-status-in-progress": "fbca04",
    "portfolio-status-closed": "6e7781",
    "portfolio-status-complete": "1d76db",
}


@dataclass
class IssueItem:
    key: str
    title: str
    body: str
    labels: List[str]
    state: str  # open|closed


class GhRepo:
    def __init__(self, owner: str, repo: str, token: str):
        self.owner = owner
        self.repo = repo
        self.token = token
        self.base = f"https://api.github.com/repos/{owner}/{repo}"

    def _request(self, method: str, path: str, payload: Optional[dict] = None) -> dict:
        url = f"{self.base}{path}"
        data = None
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url=url, method=method, data=data)
        req.add_header("Authorization", f"Bearer {self.token}")
        req.add_header("Accept", "application/vnd.github+json")
        req.add_header("X-GitHub-Api-Version", "2022-11-28")
        if data is not None:
            req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode("utf-8")
            if not raw:
                return {}
            return json.loads(raw)

    def ensure_label(self, name: str, color: str) -> None:
        try:
            self._request("POST", "/labels", {"name": name, "color": color})
        except urllib.error.HTTPError as e:
            if e.code == 422:
                return
            raise

    def list_managed_issues(self) -> List[dict]:
        issues: List[dict] = []
        page = 1
        while True:
            q = urllib.parse.urlencode(
                {"state": "all", "labels": MANAGED_LABEL, "per_page": 100, "page": page}
            )
            batch = self._request("GET", f"/issues?{q}")
            if not isinstance(batch, list) or not batch:
                break
            issues.extend(batch)
            if len(batch) < 100:
                break
            page += 1
        return [it for it in issues if "pull_request" not in it]

    def create_issue(self, item: IssueItem) -> dict:
        return self._request(
            "POST",
            "/issues",
            {"title": item.title, "body": item.body, "labels": item.labels},
        )

    def update_issue(self, number: int, item: IssueItem, keep_labels: List[str]) -> dict:
        managed = set([MANAGED_LABEL, *TYPE_LABELS.values(), *STATUS_LABELS.values()])
        preserved = [lb for lb in keep_labels if lb not in managed]
        labels = sorted(set(preserved + item.labels))
        return self._request(
            "PATCH",
            f"/issues/{number}",
            {
                "title": item.title,
                "body": item.body,
                "labels": labels,
                "state": item.state,
            },
        )


def _status_label_for_stage(status: str) -> str:
    s = status.lower()
    if "active" in s:
        return STATUS_LABELS["active"]
    if "hold" in s:
        return STATUS_LABELS["hold"]
    if "complete" in s:
        return STATUS_LABELS["complete"]
    return STATUS_LABELS["planned"]


def _state_for_stage(status: str) -> str:
    return "closed" if "complete" in status.lower() else "open"


def _status_label_for_program(status: str) -> str:
    s = status.lower()
    if "active" in s:
        return STATUS_LABELS["active"]
    if "frozen" in s or "hold" in s:
        return STATUS_LABELS["hold"]
    if "complete" in s or "closed" in s:
        return STATUS_LABELS["complete"]
    return STATUS_LABELS["planned"]


def _state_for_program(status: str) -> str:
    s = status.lower()
    return "closed" if ("complete" in s or "closed" in s) else "open"


def _status_label_for_wp(status: str) -> str:
    s = status.lower()
    if "in_progress" in s:
        return STATUS_LABELS["in_progress"]
    if "hold" in s:
        return STATUS_LABELS["hold"]
    if "closed" in s:
        return STATUS_LABELS["closed"]
    return STATUS_LABELS["planned"]


def _state_for_wp(status: str) -> str:
    return "closed" if "closed" in status.lower() else "open"


def _marker(key: str) -> str:
    return f"<!-- portfolio_key:{key} -->"


def _extract_key(body: str) -> Optional[str]:
    if not body:
        return None
    m = re.search(r"portfolio_key:([^ ]+)\s*-->", body)
    return m.group(1).strip() if m else None


def build_issue_items(snapshot: dict) -> List[IssueItem]:
    items: List[IssueItem] = []
    runtime = snapshot["runtime"]

    runtime_key = "runtime:current"
    runtime_body = "\n".join(
        [
            _marker(runtime_key),
            "## Runtime SSOT (from WSM)",
            "",
            f"- active_stage_id: `{runtime.get('active_stage_id','')}`",
            f"- active_program_id: `{runtime.get('active_program_id','')}`",
            f"- active_work_package_id: `{runtime.get('active_work_package_id','')}`",
            f"- current_gate: `{runtime.get('current_gate','')}`",
            f"- last_gate_event: `{runtime.get('last_gate_event','')}`",
            f"- next_required_action: `{runtime.get('next_required_action','')}`",
            f"- next_responsible_team: `{runtime.get('next_responsible_team','')}`",
            "",
            "Source: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`",
        ]
    )
    items.append(
        IssueItem(
            key=runtime_key,
            title=f"[PORTFOLIO][RUNTIME] {runtime.get('current_gate','N/A')} | active_wp={runtime.get('active_work_package_id','N/A')}",
            body=runtime_body,
            labels=[MANAGED_LABEL, TYPE_LABELS["runtime"], STATUS_LABELS["active"]],
            state="open",
        )
    )

    for stage in snapshot["stages"]:
        sid = stage.get("stage_id", "")
        status = stage.get("status", "")
        key = f"stage:{sid}"
        body = "\n".join(
            [
                _marker(key),
                "## Stage",
                "",
                f"- stage_id: `{sid}`",
                f"- stage_name: {stage.get('stage_name','')}",
                f"- planned_scope: {stage.get('planned_scope','')}",
                f"- status: `{status}`",
                "",
                "Source: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`",
            ]
        )
        items.append(
            IssueItem(
                key=key,
                title=f"[PORTFOLIO][STAGE] {sid} | {stage.get('stage_name','')} | {status}",
                body=body,
                labels=[MANAGED_LABEL, TYPE_LABELS["stage"], _status_label_for_stage(status)],
                state=_state_for_stage(status),
            )
        )

    for program in snapshot["programs"]:
        pid = program.get("program_id", "")
        status = program.get("status", "")
        key = f"program:{pid}"
        body = "\n".join(
            [
                _marker(key),
                "## Program",
                "",
                f"- program_id: `{pid}`",
                f"- program_name: {program.get('program_name','')}",
                f"- domain: `{program.get('domain','')}`",
                f"- stage_id: `{program.get('stage_id','')}`",
                f"- status: `{status}`",
                f"- current_gate_mirror: `{program.get('current_gate_mirror','')}`",
                "",
                "Source: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`",
            ]
        )
        items.append(
            IssueItem(
                key=key,
                title=f"[PORTFOLIO][PROGRAM] {pid} | {program.get('program_name','')} | {status}",
                body=body,
                labels=[MANAGED_LABEL, TYPE_LABELS["program"], _status_label_for_program(status)],
                state=_state_for_program(status),
            )
        )

    for wp in snapshot["work_packages"]:
        wid = wp.get("work_package_id", "")
        status = wp.get("status", "")
        key = f"work_package:{wid}"
        body = "\n".join(
            [
                _marker(key),
                "## Work Package",
                "",
                f"- work_package_id: `{wid}`",
                f"- program_id: `{wp.get('program_id','')}`",
                f"- status: `{status}`",
                f"- current_gate: `{wp.get('current_gate','')}`",
                f"- is_active: `{wp.get('is_active', False)}`",
                f"- active_marker_reason: `{wp.get('active_marker_reason','')}`",
                "",
                "Source: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`",
            ]
        )
        items.append(
            IssueItem(
                key=key,
                title=f"[PORTFOLIO][WP] {wid} | {status} | {wp.get('current_gate','')}",
                body=body,
                labels=[MANAGED_LABEL, TYPE_LABELS["work_package"], _status_label_for_wp(status)],
                state=_state_for_wp(status),
            )
        )

    return items


def parse_repo() -> tuple[str, str]:
    repo = os.getenv("GITHUB_REPOSITORY", "")
    if not repo or "/" not in repo:
        raise RuntimeError("GITHUB_REPOSITORY is required (owner/repo)")
    owner, name = repo.split("/", 1)
    return owner, name


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync portfolio snapshot into GitHub issues")
    parser.add_argument(
        "--snapshot",
        default=str(ROOT / "portfolio_project/portfolio_snapshot.json"),
        help="Path to snapshot JSON generated by build_portfolio_snapshot.py",
    )
    parser.add_argument("--dry-run", action="store_true", help="Do not write changes")
    args = parser.parse_args()

    token = os.getenv("GITHUB_TOKEN")
    if not token:
        raise RuntimeError("GITHUB_TOKEN is required")

    owner, repo = parse_repo()
    gh = GhRepo(owner=owner, repo=repo, token=token)

    snapshot_path = Path(args.snapshot)
    snapshot = json.loads(snapshot_path.read_text(encoding="utf-8"))
    items = build_issue_items(snapshot)

    for label, color in LABEL_COLORS.items():
        if args.dry_run:
            print(f"[dry-run] ensure label {label}")
        else:
            gh.ensure_label(label, color)

    existing = gh.list_managed_issues()
    index: Dict[str, dict] = {}
    for issue in existing:
        key = _extract_key(issue.get("body", ""))
        if key:
            index[key] = issue

    created = 0
    updated = 0
    for item in items:
        current = index.get(item.key)
        if not current:
            if args.dry_run:
                print(f"[dry-run] create issue for {item.key}: {item.title}")
            else:
                gh.create_issue(item)
            created += 1
            continue

        issue_number = current["number"]
        current_labels = [lb["name"] for lb in current.get("labels", [])]
        if args.dry_run:
            print(f"[dry-run] update issue #{issue_number} for {item.key}: {item.title}")
        else:
            gh.update_issue(issue_number, item, keep_labels=current_labels)
        updated += 1

    print(f"Portfolio sync completed: created={created}, updated={updated}, total={len(items)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
