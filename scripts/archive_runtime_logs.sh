#!/usr/bin/env bash
# archive_runtime_logs.sh — Team 191 File Governance
# Archives test_cursor_prompt_*.md files older than N days
# Usage: ./scripts/archive_runtime_logs.sh [--days N]
# Default: archives ALL test_cursor_prompt_*.md (--days 0)
#
# Mandate: TEAM_00_TO_TEAM_191_RUNTIME_LOG_CLEANUP_MANDATE_v1.0.0
# Authority: Team 00 (Nimrod) via FILE_LIFECYCLE_POLICY_v1.0.0

set -euo pipefail

DAYS=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --days) DAYS="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

SOURCE_DIR="_COMMUNICATION/agents_os/prompts"
ARCHIVE_BASE="_COMMUNICATION/99-ARCHIVE"
TIMESTAMP=$(date +%Y-%m-%d)
TARGET_DIR="${ARCHIVE_BASE}/${TIMESTAMP}_runtime_log_cleanup/agents_os_prompts"

mkdir -p "$TARGET_DIR"

if [[ "$DAYS" -eq 0 ]]; then
  FILES=$(find "$SOURCE_DIR" -maxdepth 1 -name "test_cursor_prompt_*.md" -type f)
else
  FILES=$(find "$SOURCE_DIR" -maxdepth 1 -name "test_cursor_prompt_*.md" -type f -mtime +"$DAYS")
fi

COUNT=0
while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  mv "$file" "$TARGET_DIR/"
  COUNT=$((COUNT + 1))
done <<< "$FILES"

REMAINING=$(find "$SOURCE_DIR" -maxdepth 1 -name "*.md" -type f | wc -l | tr -d ' ')

echo "archive_runtime_logs.sh complete"
echo "  Moved:     $COUNT files → $TARGET_DIR"
echo "  Remaining: $REMAINING files in $SOURCE_DIR"
echo ""
echo "NOTE: git commit not included — commit manually after review."
