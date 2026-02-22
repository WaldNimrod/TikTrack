#!/usr/bin/env python3
import csv
import os

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
promote = {}
with open(os.path.join(REPO, "_COMMUNICATION/team_170/GOVERNANCE_R2_PROMOTE_LIST.txt")) as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        parts = line.split("\t")
        src, can = parts[0], parts[1]
        promote[src] = can

rows = []
with open(os.path.join(REPO, "_COMMUNICATION/team_170/GOVERNANCE_R1_RESOLVED_341.csv"), newline="", encoding="utf-8") as f:
    r = csv.DictReader(f)
    for row in r:
        src = row["source_path"]
        can = promote.get(src, src)
        rows.append((src, can, row["classification"], row["final_bucket"]))

out = os.path.join(REPO, "documentation/docs-governance/AGENTS_OS_GOVERNANCE/00-INDEX/GOVERNANCE_PROCEDURES_SOURCE_MAP.md")
with open(out, "w", encoding="utf-8") as f:
    f.write("# GOVERNANCE_PROCEDURES_SOURCE_MAP\n\n")
    f.write("**project_domain:** AGENTS_OS | **date:** 2026-02-22 | **directive:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0\n\n")
    f.write("| # | source_path | canonical_path | classification | final_bucket |\n")
    f.write("|---|-------------|---------------|----------------|-------------|\n")
    for i, (src, can, cl, bucket) in enumerate(rows, 1):
        # Escape pipe in paths for markdown table
        src_esc = src.replace("|", "\\|")
        can_esc = can.replace("|", "\\|")
        f.write(f"| {i} | `{src_esc}` | `{can_esc}` | {cl} | {bucket} |\n")
    f.write("\n**log_entry | TEAM_170 | GOVERNANCE_PROCEDURES_SOURCE_MAP | 2026-02-22**\n")

print("SOURCE_MAP written, rows:", len(rows))
