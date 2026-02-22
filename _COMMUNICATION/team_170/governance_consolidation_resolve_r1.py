#!/usr/bin/env python3
"""
R1: Parse TEAM_190 file map, resolve 09-OTHER_GOVERNANCE to 01-08 or 99.
Output: resolved table for R2 promotion and SOURCE_MAP.
"""
import re
import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FILE_MAP = os.path.join(REPO_ROOT, "_COMMUNICATION/team_190/TEAM_190_GOVERNANCE_PROCEDURES_FILE_MAP_2026-02-22.md")

def resolve_09(path: str, proposed: str) -> str:
    """Resolve 09-OTHER_GOVERNANCE to directive bucket (01-08 or 99)."""
    if proposed != "09-OTHER_GOVERNANCE":
        return proposed
    name = os.path.basename(path).upper()
    if "LOD_400" in name or "FIDELITY" in name:
        return "01-FOUNDATIONS"
    if "CHANGELOG" in name or "AUDIT_LOG" in name:
        return "99-ARCHIVE"
    if "INDEX" in name or "GATE_ENUM" in name or "GATE_0_GATE_1" in name:
        return "01-FOUNDATIONS"
    if "EXEC_SUMMARY" in name or "WORK_PLAN_APPROVAL" in name or "AUDIT_V2_APPROVAL" in name:
        return "08-WORKING_VALIDATION_RECORDS"
    if "QUALITY_GATES" in name:
        return "03-PROTOCOLS"
    # Default: directives/decisions or working
    if "PASS" in name or "ACTIVATION" in name or "CONFIRMATION" in name or "NOTICE" in name or "UPDATE" in name:
        return "08-WORKING_VALIDATION_RECORDS"
    if "ANCHORS" in name or "PLAYBOOK" in name or "ALIGNMENT" in name or "DOCUMENTATION_GOVERNANCE" in name:
        return "01-FOUNDATIONS"
    if "REMAND" in name or "DRIFT" in name or "GATE3" in name:
        return "07-DIRECTIVES_AND_DECISIONS"
    return "07-DIRECTIVES_AND_DECISIONS"

def main():
    with open(FILE_MAP, "r", encoding="utf-8") as f:
        content = f.read()
    # Parse table rows: | N | `path` | `class` | `bucket` | `root` |
    pattern = re.compile(r'\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`')
    rows = []
    for m in pattern.finditer(content):
        num, path, classification, proposed_bucket, proposed_root = m.groups()
        path = path.strip()
        final_bucket = resolve_09(path, proposed_bucket.strip())
        rows.append({
            "num": int(num),
            "source_path": path,
            "classification": classification.strip(),
            "proposed_bucket": proposed_bucket.strip(),
            "final_bucket": final_bucket,
        })
    # Emit CSV for downstream
    out = os.path.join(REPO_ROOT, "_COMMUNICATION/team_170/GOVERNANCE_R1_RESOLVED_341.csv")
    with open(out, "w", encoding="utf-8") as f:
        f.write("num,source_path,classification,proposed_bucket,final_bucket\n")
        for r in rows:
            f.write(f'{r["num"]},"{r["source_path"]}","{r["classification"]}","{r["proposed_bucket"]}","{r["final_bucket"]}"\n')
    # List of PROMOTE sources and their canonical destination
    promote_list = os.path.join(REPO_ROOT, "_COMMUNICATION/team_170/GOVERNANCE_R2_PROMOTE_LIST.txt")
    with open(promote_list, "w", encoding="utf-8") as f:
        for r in rows:
            if r["classification"] == "PROMOTE_TO_CANONICAL_GOVERNANCE":
                base = os.path.basename(r["source_path"])
                canonical = f"documentation/docs-governance/AGENTS_OS_GOVERNANCE/{r['final_bucket']}/{base}"
                f.write(f"{r['source_path']}\t{canonical}\t{r['final_bucket']}\n")
    print(f"R1: {len(rows)} rows written to GOVERNANCE_R1_RESOLVED_341.csv")
    promote_count = sum(1 for r in rows if r["classification"] == "PROMOTE_TO_CANONICAL_GOVERNANCE")
    print(f"R2 promote list: {promote_count} files -> GOVERNANCE_R2_PROMOTE_LIST.txt")

if __name__ == "__main__":
    main()
