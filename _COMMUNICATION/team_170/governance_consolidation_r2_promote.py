#!/usr/bin/env python3
"""R2: Copy PROMOTE files to AGENTS_OS_GOVERNANCE with provenance header."""
import os

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROMOTE_LIST = os.path.join(REPO, "_COMMUNICATION/team_170/GOVERNANCE_R2_PROMOTE_LIST.txt")
DIRECTIVE_ID = "TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0"
PROMOTION_DATE = "2026-02-22"

def provenance_block(source_path: str, classification: str, canonical_path: str) -> str:
    return f"""---
**provenance:** Governance consolidation (Team 170)
**source_path:** {source_path}
**canonical_path:** {canonical_path}
**promotion_date:** {PROMOTION_DATE}
**directive_id:** {DIRECTIVE_ID}
**classification:** {classification}
---

"""

def main():
    promoted = []
    with open(PROMOTE_LIST, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split("\t")
            if len(parts) != 3:
                continue
            src, canonical, bucket = parts
            src_full = os.path.join(REPO, src)
            dest_full = os.path.join(REPO, canonical)
            if not os.path.isfile(src_full):
                print(f"SKIP (missing): {src}")
                continue
            os.makedirs(os.path.dirname(dest_full), exist_ok=True)
            body = open(src_full, "r", encoding="utf-8", errors="replace").read()
            block = provenance_block(src, "PROMOTE_TO_CANONICAL_GOVERNANCE", canonical)
            # Avoid double provenance if run twice
            if body.strip().startswith("---") and "provenance:" in body[:800]:
                content = body
            else:
                content = block + body
            with open(dest_full, "w", encoding="utf-8") as out:
                out.write(content)
            promoted.append((src, canonical))
    print(f"R2: Promoted {len(promoted)} files to AGENTS_OS_GOVERNANCE/")

if __name__ == "__main__":
    main()
