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

# Domain: TikTrack, Agents_OS. Stage is SHARED; every program and WP has one domain.
DOMAIN_LABEL_PREFIX = "portfolio-domain-"
PARENT_STAGE_LABEL_PREFIX = "portfolio-parent-stage-"
PARENT_PROGRAM_LABEL_PREFIX = "portfolio-parent-program-"

# נושאים שלא בקנון — ממתין לסיווג, תחת "שלב" וירטואלי
AWAITING_CLASSIFICATION_LABEL = "portfolio-awaiting-classification"
UNCLASSIFIED_STAGE_LABEL = "portfolio-parent-stage-UNCLASSIFIED"

# רק תוויות מהקנון — כל השאר יוסרו מנושאים; אופציונלי: ניקוי תוויות מהרפו
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
    "portfolio-domain-SHARED": "6e7781",
    "portfolio-domain-TIKTRACK": "1d76db",
    "portfolio-domain-AGENTS_OS": "8250df",
    AWAITING_CLASSIFICATION_LABEL: "e99695",
    UNCLASSIFIED_STAGE_LABEL: "6e7781",
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

    def update_issue(self, number: int, item: IssueItem, keep_labels: Optional[List[str]] = None) -> dict:
        # רק תוויות מהקנון — מחליפים את כל התוויות (ללא שימור תגיות ישנות)
        labels = sorted(set(item.labels))
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

    def close_issue(self, number: int) -> dict:
        return self._request("PATCH", f"/issues/{number}", {"state": "closed"})

    def list_repo_labels(self) -> List[dict]:
        out: List[dict] = []
        page = 1
        while True:
            batch = self._request("GET", f"/labels?per_page=100&page={page}")
            if not isinstance(batch, list) or not batch:
                break
            out.extend(batch)
            if len(batch) < 100:
                break
            page += 1
        return out

    def delete_label(self, name: str) -> None:
        # DELETE /repos/{owner}/{repo}/labels/{name} — name must be URL-encoded
        from urllib.parse import quote
        self._request("DELETE", f"/labels/{quote(name, safe='')}")


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


def _program_number(program_id: str) -> int:
    m = re.search(r"-P(\d+)$", program_id.upper())
    return int(m.group(1)) if m else 999


def _wp_number(work_package_id: str) -> int:
    m = re.search(r"-WP(\d+)$", work_package_id.upper())
    return int(m.group(1)) if m else 999


def build_issue_items(snapshot: dict, scope: str = "full") -> List[IssueItem]:
    items: List[IssueItem] = []
    runtime = snapshot["runtime"]
    stages = snapshot["stages"]
    programs = snapshot["programs"]
    work_packages = snapshot["work_packages"]

    stage_order: Dict[str, int] = {}
    for idx, stage in enumerate(stages, start=1):
        stage_order[stage.get("stage_id", "")] = idx

    program_to_stage: Dict[str, str] = {p.get("program_id", ""): p.get("stage_id", "") for p in programs}

    if scope == "full":
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
                "Trigger policy:",
                "- create: missing runtime card",
                "- update: any WSM runtime field changed",
                "- close: never (single runtime card remains open)",
                "",
                "Source: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`",
            ]
        )
        items.append(
            IssueItem(
                key=runtime_key,
                title=f"Runtime — {runtime.get('current_gate','N/A')}",
                body=runtime_body,
                labels=[MANAGED_LABEL, TYPE_LABELS["runtime"], STATUS_LABELS["active"]],
                state="open",
            )
        )

    for stage in stages:
        sid = stage.get("stage_id", "")
        status = stage.get("status", "")
        s_ord = stage_order.get(sid, 999)
        key = f"stage:{sid}"
        body = "\n".join(
            [
                _marker(key),
                "## Stage",
                "",
                f"- hierarchy_order: `P{s_ord:02d}`",
                f"- hierarchy_path: `STAGE:{sid}`",
                f"- stage_id: `{sid}`",
                f"- stage_name: {stage.get('stage_name','')}",
                f"- planned_scope: {stage.get('planned_scope','')}",
                f"- status: `{status}`",
                f"- pages: `{stage.get('pages','')}`",
                f"- server_modules: `{stage.get('server_modules','')}`",
                f"- client_components: `{stage.get('client_components','')}`",
                "",
                "Trigger policy:",
                "- create: new stage_id in roadmap",
                "- update: stage_name/planned_scope/status changed",
                "- close: status=COMPLETED or stage removed from roadmap (stale cleanup)",
                "",
                "Source: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`",
            ]
        )
        stage_labels = [
            MANAGED_LABEL, TYPE_LABELS["stage"], _status_label_for_stage(status),
            f"{DOMAIN_LABEL_PREFIX}SHARED",
        ]
        # כותרת פשוטה: שם השלב מהקנון
        stage_title = (stage.get("stage_name") or sid or "Stage").strip()
        items.append(
            IssueItem(
                key=key,
                title=stage_title,
                body=body,
                labels=stage_labels,
                state=_state_for_stage(status),
            )
        )

    if scope == "stages":
        return items

    programs_sorted = sorted(
        programs,
        key=lambda p: (
            stage_order.get(p.get("stage_id", ""), 999),
            _program_number(p.get("program_id", "")),
            p.get("program_id", ""),
        ),
    )
    for program in programs_sorted:
        pid = program.get("program_id", "")
        status = program.get("status", "")
        stage_id = program.get("stage_id", "")
        s_ord = stage_order.get(stage_id, 999)
        p_ord = _program_number(pid)
        key = f"program:{pid}"
        body = "\n".join(
            [
                _marker(key),
                "## Program",
                "",
                f"- hierarchy_order: `P{s_ord:02d}.{p_ord:02d}`",
                f"- hierarchy_path: `STAGE:{stage_id} -> PROGRAM:{pid}`",
                f"- parent_stage_key: `stage:{stage_id}`",
                f"- program_id: `{pid}`",
                f"- program_name: {program.get('program_name','')}",
                f"- domain: `{program.get('domain','')}`",
                f"- stage_id: `{stage_id}`",
                f"- status: `{status}`",
                f"- current_gate_mirror: `{program.get('current_gate_mirror','')}`",
                "",
                "Trigger policy:",
                "- create: new program_id in registry",
                "- update: domain/stage/status/current_gate_mirror changed",
                "- close: status=CLOSED/COMPLETE or program removed from registry (stale cleanup)",
                "",
                "Source: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`",
            ]
        )
        domain = (program.get("domain") or "").strip().upper() or "TIKTRACK"
        if domain not in ("TIKTRACK", "AGENTS_OS"):
            domain = "TIKTRACK"
        program_labels = [
            MANAGED_LABEL, TYPE_LABELS["program"], _status_label_for_program(status),
            f"{DOMAIN_LABEL_PREFIX}{domain}",
            f"{PARENT_STAGE_LABEL_PREFIX}{stage_id}",
        ]
        # כותרת פשוטה: שם התוכנית מהקנון
        program_title = (program.get("program_name") or pid or "Program").strip()
        items.append(
            IssueItem(
                key=key,
                title=program_title,
                body=body,
                labels=program_labels,
                state=_state_for_program(status),
            )
        )

    work_packages_sorted = sorted(
        work_packages,
        key=lambda w: (
            stage_order.get(program_to_stage.get(w.get("program_id", ""), ""), 999),
            _program_number(w.get("program_id", "")),
            _wp_number(w.get("work_package_id", "")),
            w.get("work_package_id", ""),
        ),
    )
    for wp in work_packages_sorted:
        wid = wp.get("work_package_id", "")
        status = wp.get("status", "")
        program_id = wp.get("program_id", "")
        stage_id = program_to_stage.get(program_id, "")
        s_ord = stage_order.get(stage_id, 999)
        p_ord = _program_number(program_id)
        w_ord = _wp_number(wid)
        key = f"work_package:{wid}"
        body = "\n".join(
            [
                _marker(key),
                "## Work Package",
                "",
                f"- hierarchy_order: `P{s_ord:02d}.{p_ord:02d}.{w_ord:03d}`",
                f"- hierarchy_path: `STAGE:{stage_id} -> PROGRAM:{program_id} -> WORK_PACKAGE:{wid}`",
                f"- parent_stage_key: `stage:{stage_id}`",
                f"- parent_program_key: `program:{program_id}`",
                f"- work_package_id: `{wid}`",
                f"- program_id: `{program_id}`",
                f"- domain: `{wp.get('domain','')}`",
                f"- status: `{status}`",
                f"- current_gate: `{wp.get('current_gate','')}`",
                f"- is_active: `{wp.get('is_active', False)}`",
                f"- active_marker_reason: `{wp.get('active_marker_reason','')}`",
                "",
                "Trigger policy:",
                "- create: new work_package_id in registry",
                "- update: status/current_gate/is_active/active_marker_reason changed",
                "- close: status=CLOSED or wp removed from registry (stale cleanup)",
                "",
                "Source: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`",
            ]
        )
        wp_domain = (wp.get("domain") or "").strip().upper() or "TIKTRACK"
        if wp_domain not in ("TIKTRACK", "AGENTS_OS"):
            wp_domain = "TIKTRACK"
        wp_labels = [
            MANAGED_LABEL, TYPE_LABELS["work_package"], _status_label_for_wp(status),
            f"{DOMAIN_LABEL_PREFIX}{wp_domain}",
            f"{PARENT_STAGE_LABEL_PREFIX}{stage_id}",
            f"{PARENT_PROGRAM_LABEL_PREFIX}{program_id}",
        ]
        # כותרת פשוטה: מזהה חבילת העבודה
        wp_title = wid or f"WP {program_id}"
        items.append(
            IssueItem(
                key=key,
                title=wp_title,
                body=body,
                labels=wp_labels,
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
    parser.add_argument(
        "--scope",
        choices=["full", "stages"],
        default="full",
        help="Sync scope: full hierarchy (runtime+stage+program+wp) or stages only",
    )
    parser.add_argument(
        "--close-stale",
        action="store_true",
        help="Close managed issues whose key is no longer present in snapshot",
    )
    parser.add_argument("--dry-run", action="store_true", help="Do not write changes")
    parser.add_argument(
        "--clean-repo-labels",
        action="store_true",
        help="Remove from repo any portfolio-* label not in canon (keeps only labels we use)",
    )
    args = parser.parse_args()

    token = os.getenv("GITHUB_TOKEN")
    if not token:
        raise RuntimeError("GITHUB_TOKEN is required")

    owner, repo = parse_repo()
    gh = GhRepo(owner=owner, repo=repo, token=token)

    snapshot_path = Path(args.snapshot)
    snapshot = json.loads(snapshot_path.read_text(encoding="utf-8"))
    items = build_issue_items(snapshot, scope=args.scope)

    # רק תוויות מהקנון — מגדירים רק את אלה
    canon_labels = set(LABEL_COLORS)
    for item in items:
        canon_labels.update(item.labels)
    default_label_color = "ededed"
    for label in sorted(canon_labels):
        color = LABEL_COLORS.get(label, default_label_color)
        if args.dry_run:
            print(f"[dry-run] ensure label {label}")
        else:
            gh.ensure_label(label, color)

    # אופציונלי: מחיקת תוויות portfolio-* ברפו שלא בקנון (ניקוי מתגים מניסויים)
    if args.clean_repo_labels:
        repo_labels = gh.list_repo_labels()
        for rl in repo_labels:
            name = (rl.get("name") or "").strip()
            if not name.startswith("portfolio-"):
                continue
            if name in canon_labels:
                continue
            if args.dry_run:
                print(f"[dry-run] delete repo label {name}")
            else:
                try:
                    gh.delete_label(name)
                    print(f"Deleted repo label: {name}")
                except urllib.error.HTTPError as e:
                    if e.code != 404:
                        raise

    existing = gh.list_managed_issues()
    by_key: Dict[str, List[dict]] = {}
    keyless_issues: List[dict] = []
    for issue in existing:
        key = _extract_key(issue.get("body", ""))
        if not key:
            keyless_issues.append(issue)
            continue
        by_key.setdefault(key, []).append(issue)

    # Keep exactly one canonical issue per key: highest issue number.
    index: Dict[str, dict] = {}
    duplicate_issues: List[dict] = []
    for key, issues_for_key in by_key.items():
        sorted_for_key = sorted(issues_for_key, key=lambda it: it.get("number", 0), reverse=True)
        index[key] = sorted_for_key[0]
        duplicate_issues.extend(sorted_for_key[1:])

    created = 0
    updated = 0
    closed_stale = 0
    closed_duplicates = 0
    closed_keyless = 0
    desired_keys = {item.key for item in items}
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
        if args.dry_run:
            print(f"[dry-run] update issue #{issue_number} for {item.key}: {item.title}")
        else:
            gh.update_issue(issue_number, item)
        updated += 1

    # כפילויות: שומרים רק נושא אחד לכל key, סוגרים את השאר
    if args.close_stale:
        for dup in duplicate_issues:
            dup_number = dup["number"]
            if dup.get("state", "open") == "closed":
                continue
            if args.dry_run:
                print(f"[dry-run] close duplicate issue #{dup_number}")
            else:
                gh.close_issue(dup_number)
            closed_duplicates += 1

    # נושאים שלא בקנון: לא סוגרים — מסמנים "ממתין לסיווג" ותחת שלב UNCLASSIFIED
    unclassified_labels = [
        MANAGED_LABEL,
        AWAITING_CLASSIFICATION_LABEL,
        UNCLASSIFIED_STAGE_LABEL,
    ]
    unclassified_body = "סטטוס: ממתין לסיווג. נושא זה אינו מופיע בקנון (Roadmap/Program/WP Registry) ויוקצה לשלב לאחר סיווג."

    def mark_unclassified(issue: dict) -> None:
        num = issue["number"]
        current_title = (issue.get("title") or "").strip()
        new_title = f"ממתין לסיווג — {current_title}" if current_title and not current_title.startswith("ממתין לסיווג") else (current_title or "ממתין לסיווג")
        item = IssueItem(key="", title=new_title, body=unclassified_body, labels=unclassified_labels, state="open")
        if args.dry_run:
            print(f"[dry-run] mark unclassified issue #{num}: {new_title}")
        else:
            gh.update_issue(num, item)

    for keyless in keyless_issues:
        if keyless.get("state", "open") == "closed":
            continue
        mark_unclassified(keyless)
        closed_keyless += 1

    for stale_key, stale_issue in index.items():
        if stale_key in desired_keys:
            continue
        if stale_issue.get("state", "open") == "closed":
            continue
        mark_unclassified(stale_issue)
        closed_stale += 1

    print(
        "Portfolio sync completed: "
        f"scope={args.scope}, created={created}, updated={updated}, "
        f"closed_duplicates={closed_duplicates}, unclassified_keyless={closed_keyless}, "
        f"unclassified_stale={closed_stale}, total_canon={len(items)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
