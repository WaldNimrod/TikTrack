#!/usr/bin/env bash
# Team 50 — Pre-Corroboration Validation for GATE_7 Part A v2.0.7
# חובה: הרץ לפני כתיבת Corroboration. Exit 0 רק אם כל התנאים מתקיימים.
# מונע הגשת corroboration ללא mode=market_open (סיבת BLOCK v2.0.6).
# Delegates to Python script (parse-only, no backend trigger).
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."
python3 scripts/team_50_verify_g7_v207_corroboration_prereqs.py
