#!/usr/bin/env python3
"""R3: Add canonical pointer to each promoted source file."""
import os

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROMOTE_LIST = os.path.join(REPO, "_COMMUNICATION/team_170/GOVERNANCE_R2_PROMOTE_LIST.txt")
POINTER_HEADER = "**Canonical location (SSOT):** This file is superseded by the canonical copy. Canonical: "

def main():
    count = 0
    with open(PROMOTE_LIST, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            src, canonical, _ = line.split("\t")
            src_full = os.path.join(REPO, src)
            if not os.path.isfile(src_full):
                continue
            body = open(src_full, "r", encoding="utf-8", errors="replace").read()
            if "Canonical location (SSOT)" in body or "Canonical location:" in body:
                continue  # already has pointer
            pointer_line = f"{POINTER_HEADER}`{canonical}`\n\n"
            new_content = pointer_line + body
            with open(src_full, "w", encoding="utf-8") as out:
                out.write(new_content)
            count += 1
    print(f"R3: Added pointer to {count} source files")

if __name__ == "__main__":
    main()
