#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TODAY_UTC="$(date -u +%F)"
WSM_PATH="documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md"

extract_date_from_stream() {
  grep -Eo '^\*\*date:\*\*[[:space:]]*[0-9]{4}-[0-9]{2}-[0-9]{2}|^date:[[:space:]]*[0-9]{4}-[0-9]{2}-[0-9]{2}' \
    | grep -Eo '[0-9]{4}-[0-9]{2}-[0-9]{2}' \
    | head -1
}

has_historical_override_from_stream() {
  grep -Eqi '^[[:space:]]*historical_record:[[:space:]]*true[[:space:]]*$|^\*\*historical_record:\*\*[[:space:]]*true[[:space:]]*$'
}

staged_docs=()
while IFS= read -r file; do
  [[ -n "$file" ]] && staged_docs+=("$file")
done < <(
  git diff --cached --name-only --diff-filter=ACMR \
    | grep -E '^(_COMMUNICATION/|documentation/docs-governance/).+\.md$' \
    | grep -v '^_COMMUNICATION/99-ARCHIVE/' \
    || true
)

if [[ ${#staged_docs[@]} -eq 0 ]]; then
  echo "DATE-LINT (staged): SKIP (no staged governance/communication markdown files)"
  exit 0
fi

if [[ ! -f "$WSM_PATH" ]]; then
  echo "FAIL: missing WSM file at $WSM_PATH"
  exit 1
fi

wsm_content="$(git show ":$WSM_PATH" 2>/dev/null || cat "$WSM_PATH" 2>/dev/null || true)"
WSM_REF_DATE="$(
  printf '%s\n' "$wsm_content" \
    | grep -n 'last_gate_event' \
    | grep -Eo '[0-9]{4}-[0-9]{2}-[0-9]{2}' \
    | head -1 \
    || true
)"
if [[ -z "$WSM_REF_DATE" ]]; then
  WSM_REF_DATE="$TODAY_UTC"
fi

echo "DATE-LINT (staged): today_utc=$TODAY_UTC wsm_ref_date=$WSM_REF_DATE"

fail_count=0

for file in "${staged_docs[@]}"; do
  staged_content="$(git show ":$file" 2>/dev/null || true)"
  if [[ -z "$staged_content" ]]; then
    continue
  fi

  new_date="$(printf '%s\n' "$staged_content" | extract_date_from_stream || true)"
  has_override=false
  if printf '%s\n' "$staged_content" | has_historical_override_from_stream; then
    has_override=true
  fi

  if [[ -z "$new_date" ]]; then
    echo "FAIL: $file -> missing header date (expected '**date:** YYYY-MM-DD or 'date: YYYY-MM-DD')"
    fail_count=$((fail_count + 1))
    continue
  fi

  if [[ "$new_date" > "$TODAY_UTC" ]]; then
    echo "FAIL: $file -> future date '$new_date' > today_utc '$TODAY_UTC'"
    fail_count=$((fail_count + 1))
  fi

  if git cat-file -e "HEAD:$file" 2>/dev/null; then
    old_content="$(git show "HEAD:$file" || true)"
    old_date="$(printf '%s\n' "$old_content" | extract_date_from_stream || true)"

    if [[ -n "$old_date" && "$new_date" < "$old_date" && "$has_override" == false ]]; then
      echo "FAIL: $file -> date moved backward '$old_date' -> '$new_date' (set historical_record: true if intentional)"
      fail_count=$((fail_count + 1))
    else
      echo "PASS: $file -> date=$new_date (previous=${old_date:-N/A})"
    fi
  else
    if [[ "$new_date" < "$WSM_REF_DATE" && "$has_override" == false ]]; then
      echo "FAIL: $file -> new file date '$new_date' older than WSM reference '$WSM_REF_DATE' (set historical_record: true if intentional)"
      fail_count=$((fail_count + 1))
    else
      echo "PASS: $file -> new file date=$new_date"
    fi
  fi
done

if [[ "$fail_count" -gt 0 ]]; then
  echo "DATE-LINT (staged) RESULT: FAIL ($fail_count findings)"
  exit 1
fi

echo "DATE-LINT (staged) RESULT: PASS"
