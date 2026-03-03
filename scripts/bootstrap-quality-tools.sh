#!/bin/bash
# TikTrack Phoenix — Quality Tooling Bootstrap (reproducible local path)
# Installs and verifies Cloud Agent quality tools in api/venv.

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
API_DIR="$PROJECT_ROOT/api"
REQ_FILE="$API_DIR/requirements-quality-tools.txt"

if [ ! -f "$REQ_FILE" ]; then
    echo "Error: missing requirements file: $REQ_FILE"
    exit 1
fi

cd "$API_DIR"

if [ ! -d "venv" ]; then
    echo "Creating api/venv..."
    python3 -m venv venv
fi

. venv/bin/activate

python -m pip install --upgrade pip
python -m pip install -r "$REQ_FILE"

echo "Verifying quality tools..."
bandit --version
pip-audit --version
detect-secrets --version
mypy --version

echo "QUALITY_TOOLS_BOOTSTRAP_EXIT:0"
