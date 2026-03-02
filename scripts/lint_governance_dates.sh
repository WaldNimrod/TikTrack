#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BASE_REF="${1:-}"
HEAD_REF="${2:-HEAD}"

if [[ -z "$BASE_REF" ]]; then
  if git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
    BASE_REF="$(git rev-parse HEAD~1)"
  else
    BASE_REF="$(git hash-object -t tree /dev/null)"
  fi
fi

TODAY_UTC="$(date -u +%F)"
WSM_PATH="documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md"

if [[ ! -f "$WSM_PATH" ]]; then
  echo "FAIL: missing WSM file at $WSM_PATH"
  exit 1
fi

WSM_REF_DATE="$(grep -n 'last_gate_event' "$WSM_PATH" | grep -Eo '[0-9]{4}-[0-9]{2}-[0-9]{2}' | head -1 || true)"
if [[ -z "$WSM_REF_DATE" ]]; then
  WSM_REF_DATE="$TODAY_UTC"
fi

extract_date_from_stream() {
  grep -Eo '^\*\*date:\*\*[[:space:]]*[0-9]{4}-[0-9]{2}-[0-9]{2}|^date:[[:space:]]*[0-9]{4}-[0-9]{2}-[0-9]{2}' \
    | grep -Eo '[0-9]{4}-[0-9]{2}-[0-9]{2}' \
    | head -1
}

has_historical_override() {
  local file="$1"
  grep -Eqi '^[[:space:]]*historical_record:[[:space:]]*true[[:space:]]*$|^\*\*historical_record:\*\*[[:space:]]*true[[:space:]]*$' "$file"
}

changed_docs=()
while IFS= read -r file; do
  [[ -n "$file" ]] && changed_docs+=("$file")
done < <(
  git diff --name-only "$BASE_REF" "$HEAD_REF" \
    | grep -E '^(_COMMUNICATION/|documentation/docs-governance/).+\.md$' \
    || true
)

if [[ ${#changed_docs[@]} -eq 0 ]]; then
  echo "DATE-LINT: SKIP (no changed governance/communication markdown files)"
  exit 0
fi

echo "DATE-LINT: base=$BASE_REF head=$HEAD_REF"
echo "DATE-LINT: today_utc=$TODAY_UTC wsm_ref_date=$WSM_REF_DATE"

fail_count=0

for file in "${changed_docs[@]}"; do
  if [[ ! -f "$file" ]]; then
    # Deleted or moved file; no date checks needed.
    continue
  fi

  new_date="$(extract_date_from_stream < "$file" || true)"
  has_override=false
  if has_historical_override "$file"; then
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

  if git cat-file -e "$BASE_REF:$file" 2>/dev/null; then
    old_date="$(git show "$BASE_REF:$file" | extract_date_from_stream || true)"

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
  echo "DATE-LINT RESULT: FAIL ($fail_count findings)"
  exit 1
fi

echo "DATE-LINT RESULT: PASS"
