#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/team191_poll_pr_checks.sh --pr <number> [--owner <owner>] [--repo <repo>] [--max-polls <n>] [--sleep-sec <n>]

Defaults:
  --owner WaldNimrod
  --repo TikTrack
  --max-polls 12
  --sleep-sec 5

Exit codes:
  0 = all checks completed and no failing checks
  2 = checks completed but at least one check failed
  3 = timeout (checks still in progress)
  4 = bad input/auth/API payload
USAGE
}

OWNER="WaldNimrod"
REPO="TikTrack"
PR=""
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

if ! [[ "$PR" =~ ^[0-9]+$ ]]; then
  echo "Invalid --pr value: $PR" >&2
  exit 4
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

pr_json="$(curl -sS \
  -H 'Accept: application/vnd.github+json' \
  -H "$AUTH_HEADER" \
  -H 'X-GitHub-Api-Version: 2022-11-28' \
  "$API/repos/$OWNER/$REPO/pulls/$PR")"

head_sha="$(echo "$pr_json" | jq -r '.head.sha // empty')"
if [[ -z "$head_sha" ]]; then
  echo "Failed to resolve PR head SHA for PR #$PR" >&2
  echo "$pr_json" | jq '{message,documentation_url}' >&2 || true
  exit 4
fi

last_payload='{}'
in_progress=-1
failing=-1

for ((i = 1; i <= MAX_POLLS; i++)); do
  payload="$(curl -sS \
    -H 'Accept: application/vnd.github+json' \
    -H "$AUTH_HEADER" \
    -H 'X-GitHub-Api-Version: 2022-11-28' \
    "$API/repos/$OWNER/$REPO/commits/$head_sha/check-runs")"

  if ! echo "$payload" | jq -e '.check_runs' >/dev/null 2>&1; then
    echo "Invalid check-runs payload (poll=$i)" >&2
    echo "$payload" | jq '{message,documentation_url}' >&2 || true
    exit 4
  fi

  total="$(echo "$payload" | jq '[.check_runs[]?] | length')"
  in_progress="$(echo "$payload" | jq '[.check_runs[]? | select(.status != "completed")] | length')"
  failing="$(echo "$payload" | jq '[.check_runs[]? | select(.status == "completed" and (.conclusion == "failure" or .conclusion == "cancelled" or .conclusion == "timed_out" or .conclusion == "action_required" or .conclusion == "startup_failure"))] | length')"

  echo "poll=$i checks=$total in_progress=$in_progress failing=$failing"

  last_payload="$payload"
  if [[ "$in_progress" -eq 0 ]]; then
    break
  fi

  if [[ "$i" -lt "$MAX_POLLS" ]]; then
    sleep "$SLEEP_SEC"
  fi
done

echo "=== final_checks ==="
echo "$last_payload" | jq '[.check_runs[]? | {name,status,conclusion}]'

if [[ "$in_progress" -ne 0 ]]; then
  echo "Timeout waiting for checks on PR #$PR" >&2
  exit 3
fi

if [[ "$failing" -gt 0 ]]; then
  exit 2
fi

exit 0
