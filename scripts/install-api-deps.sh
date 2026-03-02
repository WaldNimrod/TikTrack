#!/bin/bash
# TikTrack Phoenix — API Dependency Install
# S002-P003-WP002 Phase B: Ensures apscheduler + all runtime deps for backend startup.
# Run before backend startup or when ModuleNotFoundError: apscheduler occurs.

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
API_DIR="$PROJECT_ROOT/api"
REQ_FILE="$API_DIR/requirements.txt"

if [ ! -f "$REQ_FILE" ]; then
    echo "Error: $REQ_FILE not found"
    exit 1
fi

cd "$API_DIR"

if [ ! -d "venv" ]; then
    echo "Creating venv..."
    python3 -m venv venv
fi

. venv/bin/activate
pip install -r requirements.txt
echo "Verifying apscheduler..."
python -c "import apscheduler; print('apscheduler OK')"
