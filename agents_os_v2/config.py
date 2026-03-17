from __future__ import annotations
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
    "team_00":  "human",
    "team_10":  "gemini",
    "team_20":  "cursor",
    "team_30":  "cursor",
    "team_40":  "cursor",
    "team_50":  "gemini",
    "team_51":  "cursor",   # Agents_OS QA agent (FAST_2.5)
    "team_60":  "cursor",
    "team_70":  "gemini",
    "team_90":  "openai",
    "team_61":  "cursor",
    "team_100": "gemini",
    "team_101": "cursor",
    "team_170": "gemini",
    "team_190": "openai",
}

COMMUNICATION_DIR = REPO_ROOT / "_COMMUNICATION"
AGENTS_OS_OUTPUT_DIR = COMMUNICATION_DIR / "agents_os"
STATE_SNAPSHOT_PATH = AGENTS_OS_OUTPUT_DIR / "STATE_SNAPSHOT.json"

MAX_RETRIES_PER_GATE = 5

# ── Domain-specific state files ────────────────────────────────────────────
# Each domain has its own independent pipeline state file, enabling parallel
# pipelines — one per domain (TikTrack + Agents_OS simultaneously).
DOMAIN_STATE_FILES = {
    "tiktrack":  AGENTS_OS_OUTPUT_DIR / "pipeline_state_tiktrack.json",
    "agents_os": AGENTS_OS_OUTPUT_DIR / "pipeline_state_agentsos.json",
}
# Default domain (legacy file kept as symlink/alias for backward compat)
DEFAULT_DOMAIN = "tiktrack"


def get_state_file(domain: str | None = None) -> "Path":  # type: ignore[name-defined]
    from pathlib import Path
    d = (domain or DEFAULT_DOMAIN).lower().replace("-", "_").replace(" ", "_")
    return DOMAIN_STATE_FILES.get(d, AGENTS_OS_OUTPUT_DIR / f"pipeline_state_{d}.json")


# ── Domain → gate-ownership overrides ─────────────────────────────────────
# Gates whose ownership depends on domain:
#   TIKTRACK:  GATE_2 + GATE_6 → Team 00 (Chief Architect)
#   AGENTS_OS: GATE_2 + GATE_6 → Team 100 (Strategic Reviewer)
DOMAIN_GATE_OWNERS: dict[str, dict[str, str]] = {
    "tiktrack": {
        "GATE_2":    "team_00",   # TikTrack architect approves intent
        "WAITING_GATE2_APPROVAL": "team_00",
        "GATE_6":    "team_00",   # TikTrack architect validates reality
    },
    "agents_os": {
        "GATE_2":    "team_100",  # Strategic reviewer approves AgentsOS intent
        "WAITING_GATE2_APPROVAL": "team_100",
        "GATE_6":    "team_100",  # Strategic reviewer validates AgentsOS reality
    },
}

# ── TikTrack page routes (for GATE_7 scenario generation) ─────────────────
# Maps page codes (D15, D22, …) to their live URLs on localhost:8080.
# Routes verified against vite.config.js htmlPagesPlugin mapping.
TIKTRACK_PAGE_ROUTES: dict[str, str] = {
    "D15":  "http://localhost:8080/",
    "D16":  "http://localhost:8080/trading_accounts",
    "D18":  "http://localhost:8080/brokers_fees",
    "D21":  "http://localhost:8080/cash_flows",
    "D22":  "http://localhost:8080/tickers",
    "D23":  "http://localhost:8080/data_dashboard",
    "D24":  "http://localhost:8080/trade_plans",
    "D25":  "http://localhost:8080/ai_analysis",
    "D29":  "http://localhost:8080/trade_plans",
    "D31":  "http://localhost:8080/executions",
    "D33":  "http://localhost:8080/user_tickers",
    "D34":  "http://localhost:8080/alerts",
    "D35":  "http://localhost:8080/notes",
    "D36":  "http://localhost:8080/executions",
    "D39":  "http://localhost:8080/settings",
    "D40":  "http://localhost:8080/system_management",
    "D41":  "http://localhost:8080/system_management",
}

# GATE_8 doc team — Team 70 is SHARED across ALL domains (Iron Rule, locked 2026-03-15)
# Team 70 handles AS_MADE_REPORT + archive closure in BOTH tiktrack and agents_os.
# Team 170 is NOT involved in GATE_8 (they own GATE_1 LLD400 only).
DOMAIN_DOC_TEAM: dict[str, str] = {
    "tiktrack":  "team_70",
    "agents_os": "team_70",
}
