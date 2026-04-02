#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import pathlib
import re
import sys
from dataclasses import dataclass


DATE_PATTERNS = [
    re.compile(r"(?im)^date:\s*(\d{4}-\d{2}-\d{2})\s*$"),
    re.compile(r"(?im)^\*\*date:\*\*\s*(\d{4}-\d{2}-\d{2})\s*$"),
]
PLACEHOLDER_PHASE_OWNERS = {"", "receiving_team", "tbd", "n/a"}
REVALIDATION_HINT = re.compile(r"(revalidation|remediation|resubmission)", re.I)
VALIDATION_RESULT_HINT = re.compile(r"(validation_result|validation result|validation_findings)", re.I)


@dataclass
class Finding:
    finding_id: str
    severity: str
    path: pathlib.Path
    message: str


def extract_date(text: str) -> str | None:
    for pattern in DATE_PATTERNS:
        match = pattern.search(text)
        if match:
            return match.group(1)
    return None


def parse_identity_header_table(text: str) -> dict[str, str]:
    header_match = re.search(r"(?ims)^##\s+Mandatory Identity Header\s*$", text)
    if not header_match:
        return {}
    trailing = text[header_match.end() :]
    table = {}
    for line in trailing.splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            if table:
                break
            continue
        cells = [cell.strip() for cell in stripped.strip("|").split("|")]
        if len(cells) < 2:
            continue
        key = cells[0].lower()
        value = cells[1]
        if key in {"field", "-------", "---"}:
            continue
        table[key] = value
    return table


def is_revalidation_like(path: pathlib.Path, text: str) -> bool:
    metadata_zone = "\n".join(text.splitlines()[:20])
    target = f"{path.name}\n{metadata_zone}"
    return bool(REVALIDATION_HINT.search(target))


def is_validation_result_like(path: pathlib.Path, text: str) -> bool:
    target = f"{path.name}\n{text}"
    if VALIDATION_RESULT_HINT.search(target):
        return True
    return "finding_id" in text.lower() and "severity" in text.lower() and "status" in text.lower()


def has_correction_cycle(text: str) -> bool:
    return "correction_cycle" in text.lower()


def findings_table_headers(text: str) -> set[str]:
    headers: set[str] = set()
    for line in text.splitlines():
        if "finding_id" not in line.lower():
            continue
        if not line.strip().startswith("|"):
            continue
        cells = [cell.strip().lower() for cell in line.strip().strip("|").split("|")]
        headers.update(cells)
    return headers


def lint_file(path: pathlib.Path, today: dt.date) -> list[Finding]:
    text = path.read_text(encoding="utf-8")
    findings: list[Finding] = []

    date_value = extract_date(text)
    if not date_value:
        findings.append(Finding("CPL-001", "BLOCKER", path, "Missing canonical date field."))
    else:
        parsed = dt.date.fromisoformat(date_value)
        if parsed > today:
            findings.append(
                Finding(
                    "CPL-002",
                    "BLOCKER",
                    path,
                    f"Future date '{date_value}' is later than current UTC day '{today.isoformat()}'.",
                )
            )

    header = parse_identity_header_table(text)
    if header:
        if "phase_owner" in header:
            value = header["phase_owner"].strip().lower()
            if value in PLACEHOLDER_PHASE_OWNERS:
                findings.append(Finding("CPL-003", "HIGH", path, "Mandatory Identity Header uses placeholder `phase_owner`."))

    if is_revalidation_like(path, text) and not has_correction_cycle(text):
        findings.append(Finding("CPL-004", "HIGH", path, "Revalidation/remediation package is missing `correction_cycle`."))

    if is_validation_result_like(path, text):
        headers = findings_table_headers(text)
        if headers:
            if "evidence-by-path" not in headers and "evidence_by_path" not in headers:
                findings.append(
                    Finding(
                        "CPL-005",
                        "HIGH",
                        path,
                        "Validation findings table is missing `evidence-by-path` or `evidence_by_path` column.",
                    )
                )
            if "route_recommendation" not in headers:
                findings.append(
                    Finding(
                        "CPL-006",
                        "HIGH",
                        path,
                        "Validation findings table is missing `route_recommendation` column.",
                    )
                )

    return findings


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Lint canonical governance and validation markdown packages.")
    parser.add_argument("paths", nargs="+", help="Markdown files to lint.")
    parser.add_argument("--today", help="Override current UTC date in YYYY-MM-DD format.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    today = dt.date.fromisoformat(args.today) if args.today else dt.datetime.now(dt.timezone.utc).date()
    findings: list[Finding] = []

    for raw_path in args.paths:
        path = pathlib.Path(raw_path)
        if not path.exists():
            findings.append(Finding("CPL-000", "BLOCKER", path, "File does not exist."))
            continue
        findings.extend(lint_file(path, today))

    if findings:
        print("FAIL")
        for finding in findings:
            print(f"{finding.finding_id} | {finding.severity} | {finding.path} | {finding.message}")
        return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
