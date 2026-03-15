#!/usr/bin/env bash
# idea_submit.sh — Phoenix Idea Pipeline: submit a new idea/bug/request
#
# Usage:
#   ./idea_submit.sh --title "Short idea title" --domain agents_os --urgency high --team team_61
#   ./idea_submit.sh --title "..." --domain tiktrack --urgency medium --team nimrod \
#                   --reference "_COMMUNICATION/team_90/REPORT.md" --notes "Context here"
#
# Required: --title, --domain, --urgency, --team
# Optional: --reference (path to supporting file), --notes
#
# Domains:  agents_os | tiktrack | shared
# Urgency:  critical | high | medium | low
#
# Output: Appends entry to _COMMUNICATION/PHOENIX_IDEA_LOG.json
#         Prints IDEA-XXX on success

set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$REPO/_COMMUNICATION/PHOENIX_IDEA_LOG.json"

# ── Dependency check ──────────────────────────────────────────────────────
if ! command -v jq &>/dev/null; then
  echo "ERROR: jq is required. Install with: brew install jq" >&2
  exit 1
fi

# ── Arg parsing ───────────────────────────────────────────────────────────
TITLE=""
DOMAIN=""
URGENCY=""
TEAM=""
REFERENCE=""
NOTES="null"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --title)      TITLE="$2";     shift 2 ;;
    --domain)     DOMAIN="$2";    shift 2 ;;
    --urgency)    URGENCY="$2";   shift 2 ;;
    --team)       TEAM="$2";      shift 2 ;;
    --reference)  REFERENCE="$2"; shift 2 ;;
    --notes)      NOTES="$2";     shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

# ── Validation ────────────────────────────────────────────────────────────
ERRORS=0
[[ -z "$TITLE"   ]] && { echo "ERROR: --title is required" >&2;   ERRORS=1; }
[[ -z "$DOMAIN"  ]] && { echo "ERROR: --domain is required" >&2;  ERRORS=1; }
[[ -z "$URGENCY" ]] && { echo "ERROR: --urgency is required" >&2; ERRORS=1; }
[[ -z "$TEAM"    ]] && { echo "ERROR: --team is required" >&2;    ERRORS=1; }

if [[ $ERRORS -eq 1 ]]; then
  echo ""
  echo "Usage: ./idea_submit.sh --title \"...\" --domain agents_os --urgency high --team team_00"
  echo "       --reference PATH   (optional, must be existing file in repo)"
  echo "       --notes \"...\"    (optional, context)"
  exit 1
fi

# Domain values
if [[ ! "$DOMAIN" =~ ^(agents_os|tiktrack|shared)$ ]]; then
  echo "ERROR: --domain must be one of: agents_os | tiktrack | shared" >&2
  exit 1
fi

# Urgency values
if [[ ! "$URGENCY" =~ ^(critical|high|medium|low)$ ]]; then
  echo "ERROR: --urgency must be one of: critical | high | medium | low" >&2
  exit 1
fi

# Validate reference file exists if provided
if [[ -n "$REFERENCE" ]] && [[ ! -f "$REPO/$REFERENCE" ]]; then
  echo "ERROR: reference file not found: $REPO/$REFERENCE" >&2
  echo "       Tip: path must be relative to repo root" >&2
  exit 1
fi

# ── Build new entry ───────────────────────────────────────────────────────
NEXT_ID=$(jq -r '.next_id' "$LOG_FILE")
IDEA_ID="IDEA-$(printf '%03d' "$NEXT_ID")"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Handle optional fields
REF_JSON="null"
[[ -n "$REFERENCE" ]] && REF_JSON="\"$REFERENCE\""

NOTES_JSON="null"
[[ "$NOTES" != "null" ]] && NOTES_JSON="\"$NOTES\""

NEW_ENTRY=$(jq -n \
  --arg id         "$IDEA_ID" \
  --arg title      "$TITLE" \
  --arg domain     "$DOMAIN" \
  --arg urgency    "$URGENCY" \
  --arg submitted  "$TEAM" \
  --arg created    "$TIMESTAMP" \
  --argjson ref    "$REF_JSON" \
  --argjson notes  "$NOTES_JSON" \
  '{
    id:              $id,
    title:           $title,
    domain:          $domain,
    urgency:         $urgency,
    submitted_by:    $submitted,
    created_at:      $created,
    status:          "open",
    fate:            null,
    fate_target:     null,
    fate_rationale:  null,
    fate_decided_at: null,
    fate_decided_by: null,
    reference_file:  $ref,
    notes:           $notes
  }')

# ── Write to log ──────────────────────────────────────────────────────────
NEW_NEXT_ID=$((NEXT_ID + 1))
TMP="$LOG_FILE.tmp"

jq --argjson entry "$NEW_ENTRY" \
   --argjson nextid "$NEW_NEXT_ID" \
   --arg ts "$TIMESTAMP" \
   '.ideas += [$entry] | .next_id = $nextid | .last_updated = $ts' \
   "$LOG_FILE" > "$TMP" && mv "$TMP" "$LOG_FILE"

echo "✅ Submitted: $IDEA_ID — $TITLE"
echo "   domain=$DOMAIN urgency=$URGENCY by=$TEAM"
[[ -n "$REFERENCE" ]] && echo "   reference=$REFERENCE"
echo ""
echo "   Next step: Team 00 will review at next session startup (idea_scan.sh)"
