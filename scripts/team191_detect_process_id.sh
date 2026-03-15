#!/usr/bin/env bash
set -euo pipefail

# Detect canonical process identifier from current working set.
# Output format preference (most specific first):
#   SNNN_PNNN_WPNNN_GATEX
#   SNNN_PNNN_WPNNN
#   SNNN_PNNN
#   SNNN

PATTERN='S[0-9]{3}([_-]?P[0-9]{3}([_-]?WP[0-9]{3}([_-]?GATE[0-9A-Z]+)?)?)?'

tmp_files="$(mktemp)"
tmp_hits="$(mktemp)"
tmp_norm="$(mktemp)"
trap 'rm -f "$tmp_files" "$tmp_hits" "$tmp_norm"' EXIT

{
  git diff --name-only
  git diff --cached --name-only
  git ls-files --others --exclude-standard
} | sed '/^$/d' | sort -u > "$tmp_files"

# Extract candidates from file paths
rg -o -N "$PATTERN" "$tmp_files" > "$tmp_hits" || true

# Extract candidates from file contents (changed/untracked files only)
while IFS= read -r f; do
  if [[ -f "$f" ]]; then
    rg -I -o -N "$PATTERN" "$f" >> "$tmp_hits" || true
  fi
done < "$tmp_files"

if [[ ! -s "$tmp_hits" ]]; then
  echo "TEAM_191_FLOW"
  exit 0
fi

# Normalize + score by specificity, then frequency:
#   4: S_P_WP_GATE
#   3: S_P_WP
#   2: S_P
#   1: S
awk '
function normalize(x, y) {
  y = toupper(x)
  gsub(/-/, "_", y)
  gsub(/_+/, "_", y)
  gsub(/^_+|_+$/, "", y)
  return y
}
function score_token(t) {
  if (t ~ /^S[0-9]{3}_P[0-9]{3}_WP[0-9]{3}_GATE[0-9A-Z]+$/) return 4
  if (t ~ /^S[0-9]{3}_P[0-9]{3}_WP[0-9]{3}$/) return 3
  if (t ~ /^S[0-9]{3}_P[0-9]{3}$/) return 2
  if (t ~ /^S[0-9]{3}$/) return 1
  return 0
}
{
  t = normalize($0)
  s = score_token(t)
  if (s == 0) next
  cnt[t]++
  spec[t] = s
}
END {
  best = ""
  best_spec = -1
  best_cnt = -1
  for (t in cnt) {
    s = spec[t]
    c = cnt[t]
    if (s > best_spec ||
       (s == best_spec && c > best_cnt) ||
       (s == best_spec && c == best_cnt && (best == "" || t < best))) {
      best = t
      best_spec = s
      best_cnt = c
    }
  }
  if (best == "") print "TEAM_191_FLOW"
  else print best
}
' "$tmp_hits" > "$tmp_norm"

head -n 1 "$tmp_norm"
