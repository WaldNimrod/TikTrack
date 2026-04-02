#!/usr/bin/env python3
"""
Execute Team 170 communication alignment sweep: move files into dated 99-ARCHIVE shard.
No deletions — only moves. Reads MANIFEST_PRE_ARCHIVE.csv from map_communication_folder.py.

Usage:
  python3 scripts/archive_communication_sweep.py --dry-run
  python3 scripts/archive_communication_sweep.py --execute --i-have-team00-signoff

See _COMMUNICATION/team_170/TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md
"""
from __future__ import annotations

import argparse
import csv
import os
import shutil
import subprocess
import sys
from datetime import date, datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_COMM = REPO_ROOT / "_COMMUNICATION"
DEFAULT_MANIFEST = REPO_ROOT / "_COMMUNICATION" / "team_170" / "MANIFEST_PRE_ARCHIVE.csv"


def try_git_mv(src: Path, dest: Path, cwd: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    r = subprocess.run(
        ["git", "mv", "-f", str(src), str(dest)],
        cwd=cwd,
        capture_output=True,
        text=True,
    )
    return r.returncode == 0


def safe_move(src: Path, dest: Path, repo_root: Path, use_git: bool) -> tuple[bool, str]:
    if not src.is_file():
        return False, "missing_source"
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        return False, "dest_exists"
    if use_git and (repo_root / ".git").exists():
        if try_git_mv(src, dest, repo_root):
            return True, "git_mv"
    shutil.move(str(src), str(dest))
    return True, "shutil_move"


def main() -> int:
    ap = argparse.ArgumentParser(description="Archive _COMMUNICATION sweep (move only).")
    ap.add_argument("--comm-root", type=Path, default=DEFAULT_COMM)
    ap.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    ap.add_argument(
        "--shard-date",
        type=str,
        default="",
        help="YYYY-MM-DD folder name (default: today UTC)",
    )
    ap.add_argument("--dry-run", action="store_true", help="Print planned moves only")
    ap.add_argument("--execute", action="store_true", help="Perform moves")
    ap.add_argument(
        "--i-have-team00-signoff",
        action="store_true",
        help="Required with --execute (safety gate per KEEP_RULES)",
    )
    args = ap.parse_args()

    comm: Path = args.comm_root.resolve()
    manifest: Path = args.manifest.resolve()
    if not manifest.is_file():
        print(f"ERROR: manifest not found: {manifest}", file=sys.stderr)
        return 1

    d = args.shard_date.strip() or date.today().isoformat()
    shard = comm / "99-ARCHIVE" / f"{d}_TEAM170_ALIGNMENT"
    repo_root = REPO_ROOT

    rows: list[dict] = []
    with open(manifest, newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            rows.append(row)

    if args.execute and not args.i_have_team00_signoff:
        print("ERROR: --execute requires --i-have-team00-signoff (Team 00/10 gate).", file=sys.stderr)
        return 1

    planned: list[tuple[Path, Path, str, dict]] = []
    for row in rows:
        rel = row["source_rel_path"].replace("\\", "/")
        action = row["archive_action"].strip()
        if action not in ("ARCHIVE", "ARCHIVE_ROUND2"):
            continue
        src = comm / rel
        if action == "ARCHIVE_ROUND2":
            dest_rel = Path("_ROUND2_PENDING") / rel
        else:
            dest_rel = Path(rel)
        dest = shard / dest_rel
        planned.append((src, dest, action, row))

    print(f"Shard root: {shard}")
    print(f"Planned moves: {len(planned)}")

    if args.dry_run:
        for src, dest, action, row in planned[:30]:
            print(f"  [{action}] {src.relative_to(comm)} -> {dest.relative_to(shard)}")
        if len(planned) > 30:
            print(f"  ... and {len(planned) - 30} more")
        print("\nDry-run complete (no changes).")
        return 0

    if not args.execute:
        print("Pass --dry-run to preview, or --execute --i-have-team00-signoff to run.")
        return 0

    # Execute (signoff already validated above)
    executed: list[dict] = []
    errors: list[str] = []
    for src, dest, action, row in planned:
        ok, how = safe_move(src, dest, repo_root, use_git=True)
        executed.append(
            {
                "source_rel_path": str(src.relative_to(comm)),
                "dest_rel_path": str(dest.relative_to(shard)),
                "archive_action": action,
                "how": how,
                "ok": ok,
                "archive_reason": row.get("archive_reason", ""),
                "size_bytes": row.get("size_bytes", ""),
                "mtime_utc": row.get("mtime_utc", ""),
                "operator": os.environ.get("USER", "unknown"),
                "timestamp_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            }
        )
        if not ok:
            errors.append(f"{src}: {how}")

    shard.mkdir(parents=True, exist_ok=True)
    # Copy pre-manifest into shard for audit trail
    shutil.copy2(manifest, shard / "MANIFEST_PRE_ARCHIVE_SNAPSHOT.csv")

    man_csv = shard / "MANIFEST.csv"
    with open(man_csv, "w", newline="", encoding="utf-8-sig") as f:
        fields = [
            "source_rel_path",
            "dest_rel_path",
            "archive_action",
            "how",
            "ok",
            "archive_reason",
            "size_bytes",
            "mtime_utc",
            "operator",
            "timestamp_utc",
        ]
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(executed)

    idx = shard / "ARCHIVE_INDEX.md"
    ok_n = sum(1 for e in executed if e.get("ok") is True)
    bad_n = len(executed) - ok_n
    idx.write_text(
        f"""# Archive index — Team 170 alignment sweep

| Field | Value |
|-------|--------|
| shard | `{shard.relative_to(comm)}` |
| date | {d} |
| planned | {len(planned)} |
| executed_ok | {ok_n} |
| errors | {bad_n} |

## Purpose

Move-only hygiene: files listed in `MANIFEST_PRE_ARCHIVE.csv` were relocated from active `_COMMUNICATION/` layers into this shard. **No deletions.**

## Layout

- Mirror paths under this folder; `ARCHIVE_ROUND2` rows under `_ROUND2_PENDING/`.
- `MANIFEST_PRE_ARCHIVE_SNAPSHOT.csv` — input manifest at execution time.
- `MANIFEST.csv` — per-file move log.

## Restore

To restore a file, move it back from `dest_rel_path` under this shard to `_COMMUNICATION/{{source_rel_path}}` (verify WP/gate state first).

## References

- [TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md](../../team_170/TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md)
- Team 191: Git sync / `.gitignore` for `**/99-ARCHIVE/`

---
log_entry | TEAM_170 | ARCHIVE_SHARD | {d} | EXECUTED
""",
        encoding="utf-8",
    )

    print(f"Wrote {man_csv}")
    print(f"Wrote {idx}")
    if errors:
        print("ERRORS:", file=sys.stderr)
        for e in errors[:50]:
            print(e, file=sys.stderr)
        return 1 if bad_n == len(executed) else 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
