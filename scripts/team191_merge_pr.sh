#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/team191_merge_pr.sh --pr <number> [--owner <owner>] [--repo <repo>] [--title <text>] [--wait] [--max-polls <n>] [--sleep-sec <n>]

Defaults:
  --owner WaldNimrod
  --repo TikTrack
  --wait false
  --max-polls 12
  --sleep-sec 5

Behavior:
  - Optional wait mode checks CI until complete before merge attempt.
  - Attempts REST merge (merge commit).
  - Verifies PR merged state and prints compact evidence JSON.
USAGE
}

OWNER="WaldNimrod"
REPO="TikTrack"
PR=""
TITLE=""
WAIT_MODE=0
MAX_POLLS=12
SLEEP_SEC=5

while [[ $# -gt 0 ]]; do
  case "$1" in
    --owner)
      OWNER="${2:-}"
      shift 2
      ;;
    --repo)
      REPO="${2:-}"
      shift 2
      ;;
    --pr)
      PR="${2:-}"
      shift 2
      ;;
    --title)
      TITLE="${2:-}"
      shift 2
      ;;
    --wait)
      WAIT_MODE=1
      shift
      ;;
    --max-polls)
      MAX_POLLS="${2:-}"
      shift 2
      ;;
    --sleep-sec)
      SLEEP_SEC="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 4
      ;;
  esac
done

if [[ -z "$PR" ]]; then
  echo "Missing required --pr" >&2
  usage
  exit 4
fi

if [[ "$WAIT_MODE" -eq 1 ]]; then
  scripts/team191_poll_pr_checks.sh \
    --owner "$OWNER" \
    --repo "$REPO" \
    --pr "$PR" \
    --max-polls "$MAX_POLLS" \
    --sleep-sec "$SLEEP_SEC"
fi

TOKEN="${GITHUB_TOKEN_ADMIN:-}"
if [[ -z "$TOKEN" && -f /tmp/team191_github_token ]]; then
  TOKEN="$(cat /tmp/team191_github_token)"
fi
if [[ -z "$TOKEN" ]]; then
  echo "Missing token: set GITHUB_TOKEN_ADMIN or /tmp/team191_github_token" >&2
  exit 4
fi

API="https://api.github.com"
AUTH_HEADER="Authorization: Bearer ${TOKEN}"

merge_body='{"merge_method":"merge"}'
if [[ -n "$TITLE" ]]; then
  merge_body="$(jq -cn --arg t "$TITLE" '{merge_method:"merge",commit_title:$t}')"
fi

merge_json="$(curl -sS -X PUT \
  -H 'Accept: application/vnd.github+json' \
  -H "$AUTH_HEADER" \
  -H 'X-GitHub-Api-Version: 2022-11-28' \
  "$API/repos/$OWNER/$REPO/pulls/$PR/merge" \
  -d "$merge_body")"

merged_flag="$(echo "$merge_json" | jq -r '.merged // false')"

if [[ "$merged_flag" != "true" ]]; then
  echo "Merge request did not complete for PR #$PR" >&2
  echo "$merge_json" | jq '{message,documentation_url,sha,merged}' >&2 || true
  exit 1
fi

pr_json="$(curl -sS \
  -H 'Accept: application/vnd.github+json' \
  -H "$AUTH_HEADER" \
  -H 'X-GitHub-Api-Version: 2022-11-28' \
  "$API/repos/$OWNER/$REPO/pulls/$PR")"

echo "$pr_json" | jq '{number,state,merged,merged_at,merge_commit_sha,html_url,head:(.head.ref),base:(.base.ref)}'

if [[ "$(echo "$pr_json" | jq -r '.merged // false')" != "true" ]]; then
  echo "PR verification failed: merged=false after merge endpoint success" >&2
  exit 1
fi

exit 0
