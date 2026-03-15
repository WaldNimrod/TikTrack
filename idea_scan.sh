#!/usr/bin/env bash
# idea_scan.sh — Phoenix Idea Pipeline: scan idea log for architectural review
#
# Usage:
#   ./idea_scan.sh                          → show all OPEN ideas (default)
#   ./idea_scan.sh --status open            → open ideas only
#   ./idea_scan.sh --status all             → all ideas
#   ./idea_scan.sh --urgency critical,high  → filter by urgency (comma-separated)
#   ./idea_scan.sh --domain agents_os       → filter by domain
#   ./idea_scan.sh --summary                → one-line summary only (for session startup)
#
# Output: Formatted list for architectural team review
#         Use --summary at session startup for quick awareness

set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$REPO/_COMMUNICATION/PHOENIX_IDEA_LOG.json"

# ── Dependency check ──────────────────────────────────────────────────────
if ! command -v jq &>/dev/null; then
  echo "ERROR: jq is required. Install with: brew install jq" >&2
  exit 1
fi

if [[ ! -f "$LOG_FILE" ]]; then
  echo "ERROR: PHOENIX_IDEA_LOG.json not found at $LOG_FILE" >&2
  exit 1
fi

# ── Arg parsing ───────────────────────────────────────────────────────────
FILTER_STATUS="open"
FILTER_URGENCY=""
FILTER_DOMAIN=""
SUMMARY_ONLY=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --status)   FILTER_STATUS="$2";  shift 2 ;;
    --urgency)  FILTER_URGENCY="$2"; shift 2 ;;
    --domain)   FILTER_DOMAIN="$2";  shift 2 ;;
    --summary)  SUMMARY_ONLY=true;   shift ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

# ── Summary mode (for session startup hook) ───────────────────────────────
if $SUMMARY_ONLY; then
  TOTAL=$(jq '.ideas | length' "$LOG_FILE")
  OPEN=$(jq '[.ideas[] | select(.status == "open")] | length' "$LOG_FILE")
  CRITICAL=$(jq '[.ideas[] | select(.status == "open" and .urgency == "critical")] | length' "$LOG_FILE")
  HIGH=$(jq '[.ideas[] | select(.status == "open" and .urgency == "high")] | length' "$LOG_FILE")
  MEDIUM=$(jq '[.ideas[] | select(.status == "open" and .urgency == "medium")] | length' "$LOG_FILE")
  LOW=$(jq '[.ideas[] | select(.status == "open" and .urgency == "low")] | length' "$LOG_FILE")

  echo "💡 IDEA_LOG: $OPEN open / $TOTAL total"
  if [[ "$CRITICAL" -gt 0 ]]; then
    echo "   🔴 CRITICAL: $CRITICAL — REVIEW NOW"
  fi
  if [[ "$HIGH" -gt 0 ]]; then
    echo "   🟠 HIGH: $HIGH — review this session"
  fi
  [[ "$MEDIUM" -gt 0 ]] && echo "   🟡 MEDIUM: $MEDIUM"
  [[ "$LOW"    -gt 0 ]] && echo "   🟢 LOW: $LOW"
  exit 0
fi

# ── Build jq filter ───────────────────────────────────────────────────────
JQ_FILTER=".ideas[]"

if [[ "$FILTER_STATUS" != "all" ]]; then
  JQ_FILTER="$JQ_FILTER | select(.status == \"$FILTER_STATUS\")"
fi

if [[ -n "$FILTER_DOMAIN" ]]; then
  JQ_FILTER="$JQ_FILTER | select(.domain == \"$FILTER_DOMAIN\")"
fi

# Handle comma-separated urgency filter
if [[ -n "$FILTER_URGENCY" ]]; then
  IFS=',' read -ra URGENCIES <<< "$FILTER_URGENCY"
  URGENCY_FILTER=$(printf ' or .urgency == "%s"' "${URGENCIES[@]}")
  URGENCY_FILTER="${URGENCY_FILTER:4}"  # Remove leading " or "
  JQ_FILTER="$JQ_FILTER | select($URGENCY_FILTER)"
fi

# ── Urgency display ───────────────────────────────────────────────────────
urgency_icon() {
  case "$1" in
    critical) echo "🔴 CRITICAL" ;;
    high)     echo "🟠 HIGH    " ;;
    medium)   echo "🟡 MEDIUM  " ;;
    low)      echo "🟢 LOW     " ;;
    *)        echo "   $1      " ;;
  esac
}

# ── Output ────────────────────────────────────────────────────────────────
TOTAL=$(jq '.ideas | length' "$LOG_FILE")
OPEN=$(jq '[.ideas[] | select(.status == "open")] | length' "$LOG_FILE")
LAST_UPDATED=$(jq -r '.last_updated' "$LOG_FILE")

echo "═══════════════════════════════════════════════════════════════"
echo "  💡 PHOENIX IDEA PIPELINE SCAN"
echo "  log: $OPEN open / $TOTAL total | updated: ${LAST_UPDATED:0:10}"
echo "═══════════════════════════════════════════════════════════════"
echo ""

COUNT=0
while IFS= read -r line; do
  ID=$(echo "$line" | jq -r '.id')
  TITLE=$(echo "$line" | jq -r '.title')
  URGENCY=$(echo "$line" | jq -r '.urgency')
  DOMAIN=$(echo "$line" | jq -r '.domain')
  STATUS=$(echo "$line" | jq -r '.status')
  SUBMITTED=$(echo "$line" | jq -r '.submitted_by')
  CREATED=$(echo "$line" | jq -r '.created_at' | cut -c1-10)
  FATE=$(echo "$line" | jq -r '.fate // "⏳ pending"')
  FATE_TARGET=$(echo "$line" | jq -r '.fate_target // ""')
  NOTES=$(echo "$line" | jq -r '.notes // ""')

  COUNT=$((COUNT + 1))
  echo "  [$ID] $(urgency_icon "$URGENCY") | $DOMAIN | $STATUS"
  echo "  📌 $TITLE"
  echo "  by: $SUBMITTED | created: $CREATED"
  if [[ "$FATE" != "⏳ pending" ]]; then
    echo "  fate: $FATE"
    [[ -n "$FATE_TARGET" ]] && echo "  → $FATE_TARGET"
  else
    echo "  fate: ⏳ AWAITING DECISION"
  fi
  [[ -n "$NOTES" ]] && [[ "$NOTES" != "null" ]] && echo "  note: $NOTES"
  echo "───────────────────────────────────────────────────────────────"

done < <(jq -c "[$JQ_FILTER] | sort_by(if .urgency == \"critical\" then 0 elif .urgency == \"high\" then 1 elif .urgency == \"medium\" then 2 else 3 end)[]" "$LOG_FILE" 2>/dev/null || echo "")

if [[ $COUNT -eq 0 ]]; then
  echo "  (no ideas match current filter)"
  echo "───────────────────────────────────────────────────────────────"
fi

echo ""
echo "  Total shown: $COUNT"
echo ""
echo "  Next actions:"
echo "    Submit idea:    ./idea_submit.sh --title \"...\" --domain X --urgency Y --team Z"
echo "    Quick summary:  ./idea_scan.sh --summary"
echo "    Full scan:      ./idea_scan.sh --status all"
