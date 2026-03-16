#!/usr/bin/env python3
"""Create a dated Agents OS review bundle under _COMMUNICATION/team_<id>/."""

from __future__ import annotations

import argparse
import re
from datetime import date
from pathlib import Path


CANON_PATHS = [
    ".cursorrules",
    "00_MASTER_INDEX.md",
    "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md",
    "documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md",
    "documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md",
]

REPORT_FILES = [
    "00_REVIEW_INDEX.md",
    "01_EXECUTIVE_SUMMARY.md",
    "02_PIPELINE_AND_GATES_REVIEW.md",
    "03_SERVER_GOVERNANCE_AND_DOCS_REVIEW.md",
    "04_UI_SURFACES_REVIEW.md",
    "05_DOC_CODE_GAP_ANALYSIS.md",
    "06_ARCHITECTURAL_AND_CONCEPTUAL_CONCLUSIONS.md",
    "07_CRITICAL_IMMEDIATE_ACTIONS.md",
]


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-{2,}", "-", value)
    return value.strip("-") or "review"


def build_root(repo_root: Path, team_id: str, review_date: str, review_slug: str) -> Path:
    return (
        repo_root
        / "_COMMUNICATION"
        / f"team_{team_id}"
        / "agents_os_review"
        / f"{review_date}_{review_slug}"
    )


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def review_index(team_id: str, review_date: str, review_slug: str) -> str:
    canon_lines = "\n".join(f"- `{path}`" for path in CANON_PATHS)
    report_lines = "\n".join(f"- `{name}`" for name in REPORT_FILES)
    return f"""# Agents OS Review Index

- Review date: `{review_date}`
- Reviewer team: `Team {team_id}`
- Review slug: `{review_slug}`
- Status: `IN_PROGRESS`

## Canon consulted

{canon_lines}

## Required report files

{report_lines}

## Evidence checklist

- `evidence/` for command outputs, copied prompts, JSON state snapshots, and raw artifacts
- `logs/` for test logs and execution transcripts
- `notes/` for scratch analysis before findings are finalized
- `screenshots/` for UI evidence and browser captures

## Review ladder

- `L0 Concept`
- `L1 Capabilities`
- `L2 Processes`
- `L3 Interfaces`
- `L4 Architecture`
- `L5 Modules`
- `L6 Functions`
"""


def executive_summary(team_id: str, review_date: str, review_slug: str) -> str:
    return f"""# Executive Summary

- Review date: `{review_date}`
- Reviewer team: `Team {team_id}`
- Review slug: `{review_slug}`

## System verdict

[Summarize the state of Agents OS in 5-8 lines.]

## Top strengths

- [Strength]

## Top risks

- [Risk]

## Review constraints

- [Constraint or unverified area]

## One-human operating model verdict

[Explain whether the current system behaves like a viable operating system for one human.]
"""


def section_template(title: str, focus: list[str]) -> str:
    focus_lines = "\n".join(f"- {item}" for item in focus)
    return f"""# {title}

## Findings

- [Severity] [Finding title] - [What is wrong, with file paths and evidence]

## Evidence

- [Command, path, screenshot, test, or state artifact]

## Focus areas

{focus_lines}

## Notes

- [Inference, unresolved question, or follow-up]
"""


def gap_analysis_template() -> str:
    return """# Documentation-Code Gap Analysis

| Claim source | Claimed behavior | Code/runtime source | Actual behavior | Gap type | Severity | Recommended action |
| --- | --- | --- | --- | --- | --- | --- |
| [doc path] | [claim] | [code path] | [observed behavior] | [stale-doc/scaffold/runtime-drift/etc.] | [P0-P3] | [action] |
"""


def actions_template() -> str:
    return """# Critical Immediate Actions

| Priority | Owner team | Problem statement | Why immediate | Minimal completion condition |
| --- | --- | --- | --- | --- |
| P0 | Team 61 | [Problem] | [Why it cannot wait] | [Definition of done] |
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--team-id", required=True, help="Reviewer team number, for example 61")
    parser.add_argument("--review-slug", required=True, help="Short review label")
    parser.add_argument("--date", default=date.today().isoformat(), help="Review date in YYYY-MM-DD")
    parser.add_argument("--repo-root", default=".", help="Repository root")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    team_id = args.team_id.strip()
    review_date = args.date.strip()
    review_slug = slugify(args.review_slug)
    repo_root = Path(args.repo_root).resolve()

    bundle_root = build_root(repo_root, team_id, review_date, review_slug)
    existed_before = bundle_root.exists()
    for dirname in ("evidence", "logs", "notes", "screenshots"):
        (bundle_root / dirname).mkdir(parents=True, exist_ok=True)

    write_file(bundle_root / "00_REVIEW_INDEX.md", review_index(team_id, review_date, review_slug))
    write_file(bundle_root / "01_EXECUTIVE_SUMMARY.md", executive_summary(team_id, review_date, review_slug))
    write_file(
        bundle_root / "02_PIPELINE_AND_GATES_REVIEW.md",
        section_template(
            "Pipeline And Gates Review",
            [
                "Gate sequence, owner, and engine alignment",
                "Fail-routing and rollback correctness",
                "State-file lifecycle and WSM alignment",
                "Prompt generation, storage, and operator guidance",
            ],
        ),
    )
    write_file(
        bundle_root / "03_SERVER_GOVERNANCE_AND_DOCS_REVIEW.md",
        section_template(
            "Server Governance And Docs Review",
            [
                "Validators, scripts, and evidence handling",
                "Canonical path discipline and promotion boundaries",
                "Stale procedures, future plans, and legacy overlap",
                "Governance-to-runtime consistency",
            ],
        ),
    )
    write_file(
        bundle_root / "04_UI_SURFACES_REVIEW.md",
        section_template(
            "UI Surfaces Review",
            [
                "Dashboard, roadmap, and teams page behavior",
                "Registry-doc to UI-code consistency",
                "Command-copy correctness and operator affordances",
                "Visual clarity of active vs scaffold-only capability",
            ],
        ),
    )
    write_file(bundle_root / "05_DOC_CODE_GAP_ANALYSIS.md", gap_analysis_template())
    write_file(
        bundle_root / "06_ARCHITECTURAL_AND_CONCEPTUAL_CONCLUSIONS.md",
        section_template(
            "Architectural And Conceptual Conclusions",
            [
                "Actual system shape versus intended operating model",
                "Cross-layer coupling and sources of operator risk",
                "Conceptual coherence of the one-human software-house promise",
                "Architectural decisions that need immediate correction",
            ],
        ),
    )
    write_file(bundle_root / "07_CRITICAL_IMMEDIATE_ACTIONS.md", actions_template())

    status = "reused" if existed_before else "created"
    print(f"[agents-os-review] Review bundle {status}")
    print(f"[agents-os-review] Root: {bundle_root}")
    print("[agents-os-review] Report files:")
    for filename in REPORT_FILES:
        print(f"  - {bundle_root / filename}")
    print("[agents-os-review] Evidence folders:")
    for dirname in ("evidence", "logs", "notes", "screenshots"):
        print(f"  - {bundle_root / dirname}")
    print("[agents-os-review] Next step: open 00_REVIEW_INDEX.md and start filling the report pack.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
