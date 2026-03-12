#!/usr/bin/env bash
# Team 50 — Corroboration v2.0.9 — הרצה לאחר ש־Team 60 הריץ run_g7_cc01_v209_market_open_window.sh
# בתוך 09:30–16:00 ET.
# מנדט: TEAM_90_..._MARKET_OPEN_WINDOW_MANDATE_v2.0.8
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=== Team 50 — Corroboration v2.0.9 ==="
echo "1. Pre-reqs (log + mode=market_open + timestamp in ET window)..."
python3 scripts/team_50_verify_g7_v209_corroboration_prereqs.py || {
  echo "BLOCK: Prereqs failed. Ensure Team 60 ran run_g7_cc01_v209_market_open_window.sh within 09:30–16:00 ET."
  exit 1
}
echo "2. Generating corroboration..."
python3 scripts/team_50_generate_corroboration_v209.py || exit 1
echo ""
echo "DONE. TEAM_50_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_QA_CORROBORATION_v2.0.9.md updated. Team 90 may now approve PASS_PART_A."
