#!/usr/bin/env python3
"""
Economical full inventory of _COMMUNICATION/ — single filesystem walk, classify by path + filename only.

Usage (from repo root):
  python3 scripts/map_communication_folder.py
  python3 scripts/map_communication_folder.py --include-archive
  python3 scripts/map_communication_folder.py --out-csv _COMMUNICATION/team_170/comm_inventory.csv

Outputs:
  - CSV: path, team_bucket, ext, size_bytes, mtime_iso, wp_hits, flags, suggested_tier,
         archive_action, archive_reason
  - Optional --manifest-archive: MANIFEST_PRE_ARCHIVE.csv (only ARCHIVE / ARCHIVE_ROUND2 rows)
  - Optional summary lines to stdout

No file contents are read — safe and fast for 10k+ files.
"""
from __future__ import annotations

import argparse
import csv
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_COMM = REPO_ROOT / "_COMMUNICATION"

# Work package / program tokens in filenames
# Filenames use S003-P011-WP001 or S003_P011_WP001 (underscores)
RE_WP = re.compile(r"S\d{3}[-_]P\d+[-_]WP\d+", re.I)
RE_PROG = re.compile(r"S\d{3}[-_]P\d+(?![-_]WP)", re.I)

# Legacy / staging subtrees → ARCHIVE_ROUND2 (not _Architects_Decisions / not _ARCHITECT_INBOX)
DEEP_REVIEW_SUBSTR = (
    "90_architects_comunication",
    "legace_html_for_blueprint",
    "/nimrod/",
    "team_31_staging",
    "_simulation_archive/",
    "e2e_sim",
    "_simulation_backup",
)

CAT1_NAME_PARTS = (
    "PROCEDURE",
    "RUNBOOK",
    "SOP_",
    "GOVERNANCE",
    "MANDATE",
    "PROTOCOL",
    "ACTIVATION",
    "HANDOFF",
    "READINESS",
    "DECLARATION",
    "COMPLETION_REPORT",
    "SEAL",
    "LOD200",
    "LLD400",
    "ARCH_REVIEW",
    "VALIDATION_REQUEST",
    "QA_REPORT",
    "AS_MADE",
)

SKIP_NAMES = {".ds_store", ".gitkeep", "thumbs.db"}


def team_bucket(rel: str) -> str:
    parts = rel.replace("\\", "/").split("/")
    if len(parts) == 1:
        return "_root"
    top = parts[0].lower()
    if top.startswith("team_"):
        return parts[0]
    if top in ("agents_os", "_architects_decisions", "_architect_inbox", "99-archive", "_archive"):
        return top
    return parts[0]


def flags_for(path: Path, rel: str, name_upper: str) -> list[str]:
    flags: list[str] = []
    r = rel.replace("\\", "/").lower()
    n = name_upper

    if "agents_os" in r.split("/")[:1] or rel.startswith("agents_os/"):
        flags.append("agents_os_tree")
    if "_architects_decisions" in r:
        flags.append("arch_decision")
    if "_architect_inbox" in r:
        flags.append("arch_inbox")
    if r.startswith("99-archive/"):
        flags.append("in_99_archive")

    for s in DEEP_REVIEW_SUBSTR:
        if s in r:
            flags.append("deep_review_dir")
            break

    for p in CAT1_NAME_PARTS:
        if p in n:
            flags.append("name_like_process_spec")
            break

    if RE_WP.search(n):
        flags.append("has_wp_token")
    elif RE_PROG.search(n):
        flags.append("has_program_token")

    basename = path.name.lower()
    if basename.startswith("flight_log") or basename.startswith("phoenix_"):
        flags.append("root_program_doc")

    return sorted(set(flags))


def suggested_tier(flags: list[str], rel: str) -> str:
    r = rel.replace("\\", "/").lower()
    if "arch_decision" in flags or "arch_inbox" in flags:
        return "EXEMPT_CAT3_NO_ARCHIVE"
    # Entire agents_os tree is runtime / comm state — never archive in this sweep
    if "agents_os_tree" in flags or r.startswith("agents_os/"):
        return "EXEMPT_RUNTIME"
    if "has_wp_token" in flags or "has_program_token" in flags:
        return "LIKELY_ACTIVE_WP_KEEP"
    if "root_program_doc" in flags:
        return "LIKELY_ACTIVE_KEEP"
    if "deep_review_dir" in flags:
        return "ROUND2_DEEP_REVIEW"
    if "name_like_process_spec" in flags:
        return "CAT1_PROCESS_OR_SPEC_REVIEW"
    if "in_99_archive" in flags:
        return "ALREADY_ARCHIVED"
    return "UNCLASSIFIED_REVIEW"


TEAM_170_KEEP_SUBSTR = (
    "COMMUNICATION_FULL_INVENTORY",
    "MANIFEST_PRE_ARCHIVE",
    "COMMUNICATION_KEEP_RULES",
    "COMMUNICATION_ARCHIVE_PHASE1_MAPPING",
    "TEAM_170_TO_TEAM_191_POST_ARCHIVE",
    "map_communication_folder",
    "archive_communication_sweep",
)


def archive_action_and_reason(
    tier: str,
    flags: list[str],
    rel: str,
    filename: str,
) -> tuple[str, str]:
    """Return (archive_action, reason) per TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0."""
    r = rel.replace("\\", "/")
    rl = r.lower()
    fnu = filename.upper()

    # NEVER archive: architectural authority trees + program _ARCHIVE mirrors (folder cleanliness program)
    if (
        rl.startswith("_archive/")
        or "architect_inbox" in rl
        or "architects_decisions" in rl
    ):
        return "KEEP", "exempt_cat3_or_secondary"
    if rl.startswith("agents_os/"):
        return "KEEP", "agents_os_runtime"
    # Librarian workspace — full folder retained in alignment sweep v1
    if rl.startswith("team_170/"):
        return "KEEP", "team170_librarian_scope"
    if fnu.startswith("PHOENIX_CANONICAL_TEAM_MESSAGE_GUIDE") or fnu.startswith("FLIGHT_LOG"):
        return "KEEP", "root_program_doc"
    if fnu.startswith("PHOENIX_SOURCE_AUTHORITY") or filename == "PHOENIX_IDEA_LOG.json":
        return "KEEP", "root_meta"
    if "team_170/" in rl or rl.startswith("team_170/"):
        for s in TEAM_170_KEEP_SUBSTR:
            if s.upper() in fnu or s in filename:
                return "KEEP", "team170_sweep_meta"
    # Squad authority / active comms — do not bulk-archive as unclassified (Team 170 S003-P013 noise hygiene)
    if rl.startswith("team_00/"):
        if (
            rl.startswith("team_00/monitor/")
            or "MONITOR_LOG" in fnu
            or "DEVIATION_LOG" in fnu
            or "GATE_0_PROMPT_RAW" in fnu
            or "GATE_0_STATE_BEFORE" in fnu
            or "TT_TEST_FLIGHT" in fnu
        ):
            pass  # allow ARCHIVE below for runtime / flight noise
        else:
            return "KEEP", "team00_architect_layer"
    if rl.startswith("team_100/"):
        return "KEEP", "team100_architect_layer"
    if rl.startswith("team_101/"):
        return "KEEP", "team101_active_canary"
    if rl.startswith("team_190/"):
        return "KEEP", "team190_constitutional"
    if rl.startswith("team_61/"):
        return "KEEP", "team61_wp_delivery"
    if rl.startswith("team_51/"):
        return "KEEP", "team51_qa"
    if rl.startswith("team_50/"):
        return "KEEP", "team50_qa"
    if rl.startswith("team_90/"):
        return "KEEP", "team90_gate_validation"
    if rl.startswith("team_11/") or rl.startswith("team_102/") or rl.startswith("team_191/"):
        return "KEEP", "team_identity_or_gitops"

    if "has_wp_token" in flags or "has_program_token" in flags:
        return "KEEP", "category2_wp_program_filename"
    if "name_like_process_spec" in flags:
        return "KEEP", "category1_procedure_spec_filename"
    if tier in ("EXEMPT_CAT3_NO_ARCHIVE", "EXEMPT_RUNTIME", "LIKELY_ACTIVE_WP_KEEP", "LIKELY_ACTIVE_KEEP"):
        return "KEEP", f"tier_{tier}"
    if tier == "CAT1_PROCESS_OR_SPEC_REVIEW":
        return "KEEP", "tier_cat1"
    if "deep_review_dir" in flags or tier == "ROUND2_DEEP_REVIEW":
        return "ARCHIVE_ROUND2", "deep_review_subtree"
    if tier == "ALREADY_ARCHIVED":
        return "SKIP", "already_under_99_archive"
    return "ARCHIVE", "unclassified_stale"


def main() -> int:
    ap = argparse.ArgumentParser(description="Map _COMMUNICATION inventory (path/filename only).")
    ap.add_argument(
        "--comm-root",
        type=Path,
        default=DEFAULT_COMM,
        help="Path to _COMMUNICATION (default: repo/_COMMUNICATION)",
    )
    ap.add_argument(
        "--out-csv",
        type=Path,
        default=REPO_ROOT / "_COMMUNICATION" / "team_170" / "COMMUNICATION_FULL_INVENTORY.csv",
        help="Output CSV path",
    )
    ap.add_argument(
        "--include-archive",
        action="store_true",
        help="Include 99-ARCHIVE in walk (large). Default: skip 99-ARCHIVE for active-layer mapping.",
    )
    ap.add_argument("--max-files", type=int, default=0, help="Stop after N files (0 = no limit)")
    ap.add_argument(
        "--manifest-archive",
        type=Path,
        default=REPO_ROOT / "_COMMUNICATION" / "team_170" / "MANIFEST_PRE_ARCHIVE.csv",
        help="Write rows with ARCHIVE / ARCHIVE_ROUND2 only (for sweep). Empty path disables.",
    )
    args = ap.parse_args()

    root: Path = args.comm_root.resolve()
    if not root.is_dir():
        print(f"ERROR: not a directory: {root}", file=sys.stderr)
        return 1

    rows: list[dict] = []
    counts_team: dict[str, int] = {}
    counts_tier: dict[str, int] = {}
    counts_action: dict[str, int] = {}

    n = 0
    for path in root.rglob("*"):
        if path.is_dir():
            continue
        try:
            rel = path.relative_to(root).as_posix()
        except ValueError:
            continue

        if not args.include_archive and rel.startswith("99-ARCHIVE/"):
            continue

        low = path.name.lower()
        if low in SKIP_NAMES or low.endswith(".pyc"):
            continue

        name_upper = path.name.upper()
        fl = flags_for(path, rel, name_upper)
        tier = suggested_tier(fl, rel)
        tb = team_bucket(rel)

        st = path.stat()
        mtime = datetime.fromtimestamp(st.st_mtime, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        wp_hits = ";".join(sorted(set(RE_WP.findall(name_upper))))
        act, reason = archive_action_and_reason(tier, fl, rel, path.name)

        rows.append(
            {
                "path": rel,
                "team_bucket": tb,
                "ext": path.suffix.lower() or "(none)",
                "size_bytes": st.st_size,
                "mtime_utc": mtime,
                "wp_tokens": wp_hits,
                "flags": "|".join(fl),
                "suggested_tier": tier,
                "archive_action": act,
                "archive_reason": reason,
            }
        )
        counts_team[tb] = counts_team.get(tb, 0) + 1
        counts_tier[tier] = counts_tier.get(tier, 0) + 1
        counts_action[act] = counts_action.get(act, 0) + 1
        n += 1
        if args.max_files and n >= args.max_files:
            break

    args.out_csv.parent.mkdir(parents=True, exist_ok=True)
    with open(args.out_csv, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(
            f,
            fieldnames=[
                "path",
                "team_bucket",
                "ext",
                "size_bytes",
                "mtime_utc",
                "wp_tokens",
                "flags",
                "suggested_tier",
                "archive_action",
                "archive_reason",
            ],
        )
        w.writeheader()
        w.writerows(sorted(rows, key=lambda r: (r["team_bucket"], r["path"])))

    manifest_path = args.manifest_archive
    if manifest_path:
        manifest_path = manifest_path.resolve()
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        arch_rows = [r for r in rows if r["archive_action"] in ("ARCHIVE", "ARCHIVE_ROUND2")]
        with open(manifest_path, "w", newline="", encoding="utf-8-sig") as f:
            mw = csv.DictWriter(
                f,
                fieldnames=[
                    "source_rel_path",
                    "archive_action",
                    "archive_reason",
                    "size_bytes",
                    "mtime_utc",
                    "suggested_tier",
                ],
            )
            mw.writeheader()
            for r in sorted(arch_rows, key=lambda x: x["path"]):
                mw.writerow(
                    {
                        "source_rel_path": r["path"],
                        "archive_action": r["archive_action"],
                        "archive_reason": r["archive_reason"],
                        "size_bytes": r["size_bytes"],
                        "mtime_utc": r["mtime_utc"],
                        "suggested_tier": r["suggested_tier"],
                    }
                )
        print(f"Wrote {len(arch_rows)} archive manifest rows -> {manifest_path}")

    print(f"Wrote {len(rows)} rows -> {args.out_csv}")
    print("\n--- By archive_action ---")
    for k in sorted(counts_action, key=lambda x: -counts_action[x]):
        print(f"  {counts_action[k]:6d}  {k}")
    print("\n--- By suggested_tier ---")
    for k in sorted(counts_tier, key=lambda x: -counts_tier[x]):
        print(f"  {counts_tier[k]:6d}  {k}")
    print("\n--- Top team_bucket ---")
    for k in sorted(counts_team, key=lambda x: -counts_team[x])[:25]:
        print(f"  {counts_team[k]:6d}  {k}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
