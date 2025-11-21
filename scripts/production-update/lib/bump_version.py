#!/usr/bin/env python3
"""
TikTrack Version Bump Helper
============================

Handles automatic patch/build bumps for the unified four-part version scheme.
Major/minor updates remain manual and require the --allow-major-minor flag.
"""

from __future__ import annotations

import argparse
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Tuple


ROOT = Path(__file__).resolve().parents[2]
MANIFEST_PATH = ROOT / "documentation" / "version-manifest.json"
DEFAULT_HISTORY_FILES: Dict[str, Path] = {
    "production": ROOT / "documentation" / "production" / "VERSION_HISTORY.md",
    "development": ROOT / "documentation" / "development" / "VERSION_HISTORY.md",
}


def load_manifest() -> Dict[str, Any]:
    if not MANIFEST_PATH.exists():
        return {}
    with MANIFEST_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def save_manifest(data: Dict[str, Any]) -> None:
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with MANIFEST_PATH.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2, ensure_ascii=False)
        handle.write("\n")


def parse_version(version: str) -> Tuple[int, int, int, int]:
    parts = version.strip().split(".")
    if len(parts) != 4:
        raise ValueError("Version must contain four numeric parts (Major.Minor.Patch.Build).")
    try:
        numbers = tuple(int(part) for part in parts)
    except ValueError as exc:
        raise ValueError("All version parts must be integers.") from exc
    return numbers  # type: ignore[return-value]


def format_version(parts: Tuple[int, int, int, int]) -> str:
    return ".".join(str(value) for value in parts)


def git_head_commit(ref: str | None = None) -> str:
    cmd = ["git", "rev-parse", ref or "HEAD"]
    return (
        subprocess.check_output(cmd, cwd=ROOT)
        .decode("utf-8")
        .strip()
    )


def utc_timestamp() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def ensure_entry(manifest: Dict[str, Any], environment: str) -> Dict[str, Any]:
    entry = manifest.setdefault(
        environment,
        {
            "version": "0.0.0.0",
            "major": 0,
            "minor": 0,
            "patch": 0,
            "build": 0,
            "commit": None,
            "updated_at": None,
            "notes": None,
        },
    )
    return entry


def determine_history_file(environment: str, override: Path | None) -> Path:
    if override:
        return override
    env_key = environment.lower()
    if env_key in DEFAULT_HISTORY_FILES:
        return DEFAULT_HISTORY_FILES[env_key]
    return ROOT / "documentation" / env_key / "VERSION_HISTORY.md"


def append_history(
    history_path: Path,
    *,
    timestamp: str,
    environment: str,
    new_version: str,
    previous_version: str | None,
    new_commit: str,
    previous_commit: str | None,
    bump_type: str,
    notes: str,
) -> None:
    history_path.parent.mkdir(parents=True, exist_ok=True)
    if not history_path.exists():
        header = [
            f"# TikTrack {environment.title()} Version History\n",
            "\n",
            "| Date (UTC) | Version | Previous Version | Commit | Previous Commit | Bump Type | Notes |\n",
            "|------------|---------|------------------|--------|------------------|-----------|-------|\n",
        ]
        history_path.write_text("".join(header), encoding="utf-8")

    prev_version_text = previous_version or "-"
    prev_commit_text = previous_commit or "-"
    line = f"| {timestamp} | {new_version} | {prev_version_text} | {new_commit} | {prev_commit_text} | {bump_type} | {notes or '-'} |\n"
    with history_path.open("a", encoding="utf-8") as handle:
        handle.write(line)


def bump_version(
    current: Tuple[int, int, int, int],
    *,
    bump_type: str | None,
    set_version: Tuple[int, int, int, int] | None,
    allow_major_minor: bool,
) -> Tuple[Tuple[int, int, int, int], str]:
    major, minor, patch, build = current
    if set_version is not None:
        new_major, new_minor, new_patch, new_build = set_version
        if not allow_major_minor and (new_major != major or new_minor != minor):
            raise ValueError(
                "Attempted to modify major/minor without --allow-major-minor."
            )
        return (new_major, new_minor, new_patch, new_build), "set"

    if bump_type == "patch":
        return (major, minor, patch + 1, 0), "patch"
    if bump_type == "build":
        return (major, minor, patch, build + 1), "build"
    raise ValueError("Either --bump (patch/build) or --set-version must be provided.")


def main() -> None:
    parser = argparse.ArgumentParser(description="TikTrack unified version bump helper.")
    parser.add_argument(
        "--env",
        "-e",
        required=True,
        help="Target environment (e.g., production, development).",
    )
    parser.add_argument(
        "--bump",
        choices=["patch", "build"],
        help="Increment patch (resets build) or build number.",
    )
    parser.add_argument(
        "--set-version",
        help="Explicitly set the four-part version (requires --allow-major-minor to adjust major/minor).",
    )
    parser.add_argument(
        "--allow-major-minor",
        action="store_true",
        help="Permit updates to major/minor parts when used with --set-version.",
    )
    parser.add_argument(
        "--note",
        default="",
        help="Optional note to store alongside the history entry.",
    )
    parser.add_argument(
        "--history",
        type=Path,
        help="Override history file path.",
    )
    parser.add_argument(
        "--git-ref",
        help="Optional git ref to capture commit hash from (defaults to HEAD).",
    )

    args = parser.parse_args()

    environment = args.env.lower()
    manifest = load_manifest()
    entry = ensure_entry(manifest, environment)

    current_version = parse_version(entry["version"])
    previous_version_str = entry["version"]
    previous_commit = entry.get("commit")

    set_version_tuple = parse_version(args.set_version) if args.set_version else None

    new_version_tuple, bump_type = bump_version(
        current_version,
        bump_type=args.bump,
        set_version=set_version_tuple,
        allow_major_minor=args.allow_major_minor,
    )
    new_version_str = format_version(new_version_tuple)

    git_ref = args.git_ref
    commit_hash = git_head_commit(git_ref)
    timestamp = utc_timestamp()
    note = args.note.strip()
    if not note:
        note = {
            "patch": "Patch bump",
            "build": "Build bump",
            "set": "Set version",
        }[bump_type]

    # Update manifest entry
    entry.update(
        {
            "version": new_version_str,
            "major": new_version_tuple[0],
            "minor": new_version_tuple[1],
            "patch": new_version_tuple[2],
            "build": new_version_tuple[3],
            "commit": commit_hash,
            "updated_at": timestamp,
            "notes": note,
        }
    )
    save_manifest(manifest)

    # Append history row
    history_path = determine_history_file(environment, args.history)
    append_history(
        history_path,
        timestamp=timestamp,
        environment=environment,
        new_version=new_version_str,
        previous_version=previous_version_str,
        new_commit=commit_hash,
        previous_commit=previous_commit,
        bump_type=bump_type,
        notes=note,
    )

    print(f"[{environment}] {previous_version_str} -> {new_version_str} ({bump_type})")


if __name__ == "__main__":
    main()

