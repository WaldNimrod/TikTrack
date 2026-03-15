#!/usr/bin/env bash
# idea_scan.sh — Phoenix Idea Pipeline: scan idea log for architectural review
#
# Usage:
#   ./idea_scan.sh                          → show all ACTIVE ideas (open + in_execution)
#   ./idea_scan.sh --status open            → open ideas only (no fate decision yet)
#   ./idea_scan.sh --status in_execution    → in_execution ideas only (mandate issued, team working)
#   ./idea_scan.sh --status decided         → decided/closed ideas
#   ./idea_scan.sh --status all             → all ideas (all statuses)
#   ./idea_scan.sh --urgency critical,high  → filter by urgency (comma-separated)
#   ./idea_scan.sh --domain agents_os       → filter by domain
#   ./idea_scan.sh --summary                → one-line summary only (for session startup)
#
# Status meanings:
#   open          → no fate decision yet — needs Team 00 + Nimrod review
#   in_execution  → mandate/fate decided AND issued to team; team is working; not yet delivered
#   decided       → fully closed (fate executed or cancelled)
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
FILTER_STATUS="active"   # default: show open + in_execution
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
  IN_EXEC=$(jq '[.ideas[] | select(.status == "in_execution")] | length' "$LOG_FILE")
  ACTIVE=$((OPEN + IN_EXEC))

  CRIT_OPEN=$(jq '[.ideas[] | select(.status == "open" and .urgency == "critical")] | length' "$LOG_FILE")
  HIGH_OPEN=$(jq '[.ideas[] | select(.status == "open" and .urgency == "high")] | length' "$LOG_FILE")
  MED_OPEN=$(jq '[.ideas[] | select(.status == "open" and .urgency == "medium")] | length' "$LOG_FILE")
  LOW_OPEN=$(jq '[.ideas[] | select(.status == "open" and .urgency == "low")] | length' "$LOG_FILE")

  CRIT_EXEC=$(jq '[.ideas[] | select(.status == "in_execution" and .urgency == "critical")] | length' "$LOG_FILE")
  HIGH_EXEC=$(jq '[.ideas[] | select(.status == "in_execution" and .urgency == "high")] | length' "$LOG_FILE")

  echo "💡 IDEA_LOG: $OPEN open / $IN_EXEC in_exec / $TOTAL total"

  # Open items (need fate decision) — always flag
  if [[ "$CRIT_OPEN" -gt 0 ]]; then
    echo "   🔴 CRITICAL (open): $CRIT_OPEN — REVIEW NOW"
  fi
  if [[ "$HIGH_OPEN" -gt 0 ]]; then
    echo "   🟠 HIGH (open): $HIGH_OPEN — review this session"
  fi
  [[ "$MED_OPEN" -gt 0 ]] && echo "   🟡 MEDIUM (open): $MED_OPEN"
  [[ "$LOW_OPEN" -gt 0 ]] && echo "   🟢 LOW (open): $LOW_OPEN"

  # In-execution items (awaiting team delivery)
  if [[ "$CRIT_EXEC" -gt 0 ]]; then
    echo "   🔴 CRITICAL (in_exec): $CRIT_EXEC — check team status"
  fi
  if [[ "$HIGH_EXEC" -gt 0 ]]; then
    echo "   🟠 HIGH (in_exec): $HIGH_EXEC — verify team progress"
  fi

  if [[ "$ACTIVE" -eq 0 ]]; then
    echo "   ✅ Clean — no open or in-execution items"
  fi
  exit 0
fi

# ── Build jq filter ───────────────────────────────────────────────────────
if [[ "$FILTER_STATUS" == "active" ]]; then
  JQ_FILTER='.ideas[] | select(.status == "open" or .status == "in_execution")'
elif [[ "$FILTER_STATUS" == "all" ]]; then
  JQ_FILTER=".ideas[]"
else
  JQ_FILTER=".ideas[] | select(.status == \"$FILTER_STATUS\")"
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

status_label() {
  case "$1" in
    open)         echo "📬 OPEN" ;;
    in_execution) echo "⚙️  IN_EXEC" ;;
    decided)      echo "✅ DECIDED" ;;
    *)            echo "   $1" ;;
  esac
}

# ── Output ────────────────────────────────────────────────────────────────
TOTAL=$(jq '.ideas | length' "$LOG_FILE")
OPEN=$(jq '[.ideas[] | select(.status == "open")] | length' "$LOG_FILE")
IN_EXEC=$(jq '[.ideas[] | select(.status == "in_execution")] | length' "$LOG_FILE")
LAST_UPDATED=$(jq -r '.last_updated' "$LOG_FILE")

echo "═══════════════════════════════════════════════════════════════"
echo "  💡 PHOENIX IDEA PIPELINE SCAN"
echo "  log: $OPEN open / $IN_EXEC in_exec / $TOTAL total | updated: ${LAST_UPDATED:0:10}"
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
  echo "  [$ID] $(urgency_icon "$URGENCY") | $DOMAIN | $(status_label "$STATUS")"
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

done < <(jq -c "[$JQ_FILTER] | sort_by(
  (if .status == \"open\" then 0 else 1 end),
  (if .urgency == \"critical\" then 0 elif .urgency == \"high\" then 1 elif .urgency == \"medium\" then 2 else 3 end)
)[]" "$LOG_FILE" 2>/dev/null || echo "")

if [[ $COUNT -eq 0 ]]; then
  echo "  (no ideas match current filter)"
  echo "───────────────────────────────────────────────────────────────"
fi

echo ""
echo "  Total shown: $COUNT"
echo ""
echo "  Next actions:"
echo "    Submit idea:       ./idea_submit.sh --title \"...\" --domain X --urgency Y --team Z"
echo "    Quick summary:     ./idea_scan.sh --summary"
echo "    Active only:       ./idea_scan.sh                (open + in_execution)"
echo "    Open only:         ./idea_scan.sh --status open"
echo "    In execution:      ./idea_scan.sh --status in_execution"
echo "    Full history:      ./idea_scan.sh --status all"
