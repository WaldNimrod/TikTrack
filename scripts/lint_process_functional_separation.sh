#!/usr/bin/env bash
set -euo pipefail

# Enforce process-functional separation for functional team output artifacts.
# BLOCK patterns: owner_next_action section/field usage.
# WARN patterns: routing-language hints inside verdict artifacts.

WHITELIST=(
  "_COMMUNICATION/_Architects_Decisions/"
  "_COMMUNICATION/team_00/"
  "_COMMUNICATION/team_191/"
)

SCOPE_REGEX='^_COMMUNICATION/team_(190|90|50|51)/.*\.md$'
BLOCK_REGEX='##[[:space:]]*owner_next_action|owner_next_action:[[:space:]]*|owner_next_action[[:space:]]*$'
WARN_REGEX='Team [0-9]+.*should.*next|Team [0-9]+.*must.*next|Team [0-9]+:.*required.*action'
AUTHORITY_PATH='_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0.md'

is_whitelisted() {
  local path="$1"
  local prefix
  for prefix in "${WHITELIST[@]}"; do
    if [[ "$path" == "$prefix"* ]]; then
      return 0
    fi
  done
  return 1
}

collect_files() {
  if [[ "$#" -gt 0 ]]; then
    for path in "$@"; do
      if [[ -f "$path" ]]; then
        printf '%s\n' "$path"
      fi
    done
    return
  fi

  git diff --cached --name-only --diff-filter=ACMR \
    | grep -E "$SCOPE_REGEX" \
    || true
}

print_block_message() {
  local path="$1"
  local line="$2"
  local matched="$3"
  echo "BLOCK: ${path}:${line} — '${matched}' detected"
  echo "  -> This section/field is PROHIBITED in functional team output per ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0"
  echo "  -> Fix: Remove the 'owner_next_action' section/field entirely."
  echo "  -> Express routing intent via: 'remaining_blockers: NONE' or 'overall_result: PASS'."
  echo "  -> Authority: ${AUTHORITY_PATH}"
}

print_warn_message() {
  local path="$1"
  local line="$2"
  local matched="$3"
  echo "WARN: ${path}:${line} — advisory routing language detected: '${matched}'"
  echo "  -> Functional verdict artifacts should avoid routing language; keep findings/verdict only."
}

echo "[PROCESS-FUNCTIONAL-SEPARATION] Checking staged functional team documents..."

files=()
while IFS= read -r path; do
  [[ -z "$path" ]] && continue
  files+=("$path")
done < <(collect_files "$@")

if [[ "${#files[@]}" -eq 0 ]]; then
  echo "[PROCESS-FUNCTIONAL-SEPARATION] Result: PASS — no scoped functional team markdown files to check."
  exit 0
fi

block_count=0
warn_count=0

for path in "${files[@]}"; do
  if is_whitelisted "$path"; then
    continue
  fi
  if ! [[ "$path" =~ $SCOPE_REGEX ]]; then
    continue
  fi

  while IFS= read -r hit; do
    [[ -z "$hit" ]] && continue
    line_no="${hit%%:*}"
    content="${hit#*:}"
    matched="$(printf '%s' "$content" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
    print_block_message "$path" "$line_no" "$matched"
    block_count=$((block_count + 1))
  done < <(grep -nEi "$BLOCK_REGEX" "$path" || true)

  while IFS= read -r hit; do
    [[ -z "$hit" ]] && continue
    line_no="${hit%%:*}"
    content="${hit#*:}"
    matched="$(printf '%s' "$content" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
    print_warn_message "$path" "$line_no" "$matched"
    warn_count=$((warn_count + 1))
  done < <(grep -nE "$WARN_REGEX" "$path" || true)
done

if [[ "$block_count" -gt 0 ]]; then
  echo "[PROCESS-FUNCTIONAL-SEPARATION] Result: BLOCK — ${block_count} violation(s) found. Commit halted."
  exit 1
fi

if [[ "$warn_count" -gt 0 ]]; then
  echo "[PROCESS-FUNCTIONAL-SEPARATION] Result: WARN — ${warn_count} advisory routing pattern(s) found."
  exit 2
fi

echo "[PROCESS-FUNCTIONAL-SEPARATION] Result: PASS — no violations found."
exit 0
