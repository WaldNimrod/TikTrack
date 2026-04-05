#!/usr/bin/env bash
# scripts/sync_aos_snapshot.sh
# Syncs agents-os/core/ → agents_os_v3/ and updates SNAPSHOT_VERSION + FILE_INDEX.
#
# Usage:
#   bash scripts/sync_aos_snapshot.sh --source <agents-os-path> --version <semver> [--dry-run]
#   bash scripts/sync_aos_snapshot.sh --help
#
# S003-P018 — TEAM_100_TO_TEAM_191 activation v1.0.0

set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  bash scripts/sync_aos_snapshot.sh --source <path-to-agents-os> --version <semver> [--dry-run]
  bash scripts/sync_aos_snapshot.sh --source <path> --dry-run   # --version optional with --dry-run only

Arguments:
  --source PATH   Absolute path to local agents-os clone (must contain core/)
  --version VER   Semantic version label e.g. v0.1.0 (required unless --dry-run)
  --dry-run       Show rsync changes only; do not write files or run FILE_INDEX update
  --help          Show this help and exit 0

Examples:
  bash scripts/sync_aos_snapshot.sh --source /Users/nimrod/Documents/agents-os --version v0.1.0 --dry-run
  make sync-snapshot SOURCE=/Users/nimrod/Documents/agents-os VERS=v0.1.0
USAGE
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

SOURCE=""
VERSION=""
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)
      usage
      exit 0
      ;;
    --source)
      SOURCE="${2:-}"
      shift 2
      ;;
    --version)
      VERSION="${2:-}"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    *)
      echo "sync_aos_snapshot.sh: unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$SOURCE" ]]; then
  echo "sync_aos_snapshot.sh: error: --source is required" >&2
  exit 1
fi

if [[ "$DRY_RUN" -eq 0 && -z "$VERSION" ]]; then
  echo "sync_aos_snapshot.sh: error: --version is required (unless using --dry-run only)" >&2
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "sync_aos_snapshot.sh: error: rsync is not installed" >&2
  exit 1
fi

SOURCE="${SOURCE%/}"
CORE_SRC="${SOURCE}/core"
if [[ ! -d "$CORE_SRC" ]]; then
  echo "sync_aos_snapshot.sh: error: agents-os core directory not found: $CORE_SRC" >&2
  exit 1
fi

if ! SHORT_SHA="$(git -C "$SOURCE" rev-parse --short HEAD 2>/dev/null)"; then
  echo "sync_aos_snapshot.sh: error: could not read git HEAD in --source (not a git repo?): $SOURCE" >&2
  exit 1
fi

DEST="${ROOT}/agents_os_v3"

if [[ "$DRY_RUN" -eq 1 ]]; then
  mkdir -p "$DEST"
  echo "sync_aos_snapshot.sh: dry-run — rsync from $CORE_SRC/ to $DEST/"
  if [[ -n "$VERSION" ]]; then
    echo "sync_aos_snapshot.sh: dry-run — would set SNAPSHOT_VERSION=${VERSION}+${SHORT_SHA}"
  else
    echo "sync_aos_snapshot.sh: dry-run — (no --version; SNAPSHOT_VERSION would not be written in full sync)"
  fi
  rsync -av --delete --dry-run --exclude='.git' --exclude='pipeline_state.json' "${CORE_SRC}/" "${DEST}/"
  exit 0
fi

mkdir -p "$DEST"

RSYNC_LOG="$(mktemp)"
trap 'rm -f "$RSYNC_LOG"' EXIT

set +e
rsync -av --delete --stats --exclude='.git' --exclude='pipeline_state.json' "${CORE_SRC}/" "${DEST}/" >"$RSYNC_LOG" 2>&1
RSYNC_STATUS=$?
set -e
if [[ "$RSYNC_STATUS" -ne 0 ]]; then
  cat "$RSYNC_LOG" >&2
  echo "sync_aos_snapshot.sh: error: rsync failed with exit $RSYNC_STATUS" >&2
  exit 1
fi

# GNU rsync: "Number of regular files transferred: N" — openrsync (macOS): "Number of files transferred: N"
N="$(awk '/Number of regular files transferred:/ {print $NF; exit} /^Number of files transferred:/ {print $NF; exit}' "$RSYNC_LOG" || true)"
if [[ -z "$N" ]]; then
  N="?"
fi

printf 'SNAPSHOT_VERSION=%s+%s\n' "${VERSION}" "${SHORT_SHA}" > "${DEST}/SNAPSHOT_VERSION"

if ! python3 scripts/update_aos_v3_file_index.py; then
  echo "sync_aos_snapshot.sh: error: update_aos_v3_file_index.py failed" >&2
  exit 1
fi

echo "Sync complete: ${N} files transferred (stats), version=${VERSION}+${SHORT_SHA}"
