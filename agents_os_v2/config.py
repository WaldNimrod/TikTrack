"""
Agents_OS V2 — Configuration
Loads API keys from environment and defines engine settings.
"""

import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

OPENAI_MODEL = "gpt-4o"
GEMINI_MODEL = "gemini-2.0-flash"

TEAM_ENGINE_MAP = {
    "team_00":  "claude",
    "team_10":  "gemini",
    "team_20":  "cursor",
    "team_30":  "cursor",
    "team_40":  "cursor",
    "team_50":  "gemini",
    "team_60":  "cursor",
    "team_70":  "gemini",
    "team_90":  "openai",
    "team_100": "claude",
    "team_170": "gemini",
    "team_190": "openai",
}

COMMUNICATION_DIR = REPO_ROOT / "_COMMUNICATION"
AGENTS_OS_OUTPUT_DIR = COMMUNICATION_DIR / "agents_os"
STATE_SNAPSHOT_PATH = AGENTS_OS_OUTPUT_DIR / "STATE_SNAPSHOT.json"

MAX_RETRIES_PER_GATE = 5
