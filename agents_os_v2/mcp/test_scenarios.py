from __future__ import annotations
"""
MCP Test Scenarios — Full CRUD + Validation + Display coverage.
Each scenario defines steps for MCP browser tools (cursor-ide-browser).

Used by:
  - Team 50 (QA) for GATE_4
  - Team 90 for GATE_5 validation
  - Cursor Composer sessions for implementation self-test
"""

from dataclasses import dataclass, field


@dataclass
class MCPStep:
    action: str  # browser_navigate, browser_click, browser_type, browser_snapshot
    target: str  # URL, ref, or description
    expected: str = ""  # what to verify after action
    data: str = ""  # input data for browser_type


@dataclass
class MCPScenario:
    id: str
    name: str
    entity: str
    category: str  # auth, crud, validation, display, navigation
    steps: list[MCPStep] = field(default_factory=list)
    preconditions: list[str] = field(default_factory=list)


# ═══════════════════════════════════════
# AUTH scenarios
# ═══════════════════════════════════════

AUTH_LOGIN = MCPScenario(
    id="AUTH-001",
    name="Login with valid credentials",
    entity="auth",
    category="auth",
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/login"),
        MCPStep("browser_snapshot", "", "Login form visible"),
        # Use the seeded QA/runtime user, not the optional bootstrap admin account.
        MCPStep("browser_type", "username field", data="TikTrackAdmin"),
        MCPStep("browser_type", "password field", data="4181"),
        MCPStep("browser_click", "login button"),
        MCPStep("browser_snapshot", "", "Redirected to home page, user logged in"),
    ],
)

AUTH_LOGIN_INVALID = MCPScenario(
    id="AUTH-002",
    name="Login with invalid credentials",
    entity="auth",
    category="validation",
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/login"),
        MCPStep("browser_type", "username field", data="wrong_user"),
        MCPStep("browser_type", "password field", data="wrong_pass"),
        MCPStep("browser_click", "login button"),
        MCPStep("browser_snapshot", "", "Error message displayed, still on login page"),
    ],
)

# ═══════════════════════════════════════
# TRADING ACCOUNTS scenarios
# ═══════════════════════════════════════

TRADING_ACCOUNTS_LIST = MCPScenario(
    id="TA-001",
    name="View trading accounts list",
    entity="trading_accounts",
    category="display",
    preconditions=["User logged in"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/trading_accounts"),
        MCPStep("browser_snapshot", "", "Trading accounts page loads, table visible with columns"),
    ],
)

TRADING_ACCOUNTS_CREATE = MCPScenario(
    id="TA-002",
    name="Create new trading account",
    entity="trading_accounts",
    category="crud",
    preconditions=["User logged in"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/trading_accounts"),
        MCPStep("browser_click", "add account button"),
        MCPStep("browser_snapshot", "", "Create form/modal visible"),
        MCPStep("browser_type", "account name field", data="Test Account"),
        MCPStep("browser_type", "initial balance field", data="10000"),
        MCPStep("browser_click", "save button"),
        MCPStep("browser_snapshot", "", "Account appears in list"),
    ],
)

TRADING_ACCOUNTS_CREATE_VALIDATION = MCPScenario(
    id="TA-003",
    name="Create account — validation (empty name)",
    entity="trading_accounts",
    category="validation",
    preconditions=["User logged in"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/trading_accounts"),
        MCPStep("browser_click", "add account button"),
        MCPStep("browser_click", "save button"),
        MCPStep("browser_snapshot", "", "Validation error shown — name required"),
    ],
)

# ═══════════════════════════════════════
# ALERTS scenarios
# ═══════════════════════════════════════

ALERTS_LIST = MCPScenario(
    id="AL-001",
    name="View alerts list",
    entity="alerts",
    category="display",
    preconditions=["User logged in"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/alerts"),
        MCPStep("browser_snapshot", "", "Alerts page loads, table visible"),
    ],
)

ALERTS_CREATE = MCPScenario(
    id="AL-002",
    name="Create new alert",
    entity="alerts",
    category="crud",
    preconditions=["User logged in"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/alerts"),
        MCPStep("browser_click", "add alert button"),
        MCPStep("browser_snapshot", "", "Create form visible"),
        MCPStep("browser_type", "title field", data="Test Alert"),
        MCPStep("browser_click", "save button"),
        MCPStep("browser_snapshot", "", "Alert appears in list"),
    ],
)

ALERTS_EDIT = MCPScenario(
    id="AL-003",
    name="Edit existing alert",
    entity="alerts",
    category="crud",
    preconditions=["User logged in", "At least one alert exists"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/alerts"),
        MCPStep("browser_click", "first alert edit button"),
        MCPStep("browser_snapshot", "", "Edit form visible with existing data"),
        MCPStep("browser_type", "title field", data="Updated Alert Title"),
        MCPStep("browser_click", "save button"),
        MCPStep("browser_snapshot", "", "Updated title visible in list"),
    ],
)

ALERTS_DELETE = MCPScenario(
    id="AL-004",
    name="Delete alert",
    entity="alerts",
    category="crud",
    preconditions=["User logged in", "At least one alert exists"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/alerts"),
        MCPStep("browser_snapshot", "", "Note count before delete"),
        MCPStep("browser_click", "first alert delete button"),
        MCPStep("browser_click", "confirm delete"),
        MCPStep("browser_snapshot", "", "Alert removed from list"),
    ],
)

ALERTS_VALIDATION = MCPScenario(
    id="AL-005",
    name="Create alert — validation (empty title)",
    entity="alerts",
    category="validation",
    preconditions=["User logged in"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/alerts"),
        MCPStep("browser_click", "add alert button"),
        MCPStep("browser_click", "save button"),
        MCPStep("browser_snapshot", "", "Validation error — title required"),
    ],
)

# ═══════════════════════════════════════
# ALERTS WIDGET (Homepage) — Feature Test Target
# ═══════════════════════════════════════

ALERTS_WIDGET_DISPLAY = MCPScenario(
    id="AW-001",
    name="Alerts widget displays on homepage",
    entity="alerts_widget",
    category="display",
    preconditions=["User logged in", "Alerts exist in DB"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080"),
        MCPStep("browser_snapshot", "", "Homepage loads with active alerts widget visible"),
        MCPStep("browser_snapshot", "", "Widget shows: summary count, list of recent NEW alerts"),
    ],
)

ALERTS_WIDGET_NAVIGATION = MCPScenario(
    id="AW-002",
    name="Alerts widget — navigate to full alerts page",
    entity="alerts_widget",
    category="navigation",
    preconditions=["User logged in"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080"),
        MCPStep("browser_click", "view all alerts link in widget"),
        MCPStep("browser_snapshot", "", "Navigated to /alerts page"),
    ],
)

ALERTS_WIDGET_EMPTY = MCPScenario(
    id="AW-003",
    name="Alerts widget — empty state",
    entity="alerts_widget",
    category="display",
    preconditions=["User logged in", "No active alerts"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080"),
        MCPStep("browser_snapshot", "", "Widget shows empty state message"),
    ],
)

# ═══════════════════════════════════════
# NOTES scenarios
# ═══════════════════════════════════════

NOTES_CRUD = MCPScenario(
    id="NO-001",
    name="Notes — full CRUD cycle",
    entity="notes",
    category="crud",
    preconditions=["User logged in"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/notes"),
        MCPStep("browser_snapshot", "", "Notes page loads"),
        MCPStep("browser_click", "add note button"),
        MCPStep("browser_type", "title field", data="Test Note"),
        MCPStep("browser_click", "save button"),
        MCPStep("browser_snapshot", "", "Note appears in list"),
        MCPStep("browser_click", "note edit button"),
        MCPStep("browser_type", "title field", data="Updated Note"),
        MCPStep("browser_click", "save button"),
        MCPStep("browser_snapshot", "", "Updated title visible"),
    ],
)

# ═══════════════════════════════════════
# TICKERS & USER TICKERS scenarios
# ═══════════════════════════════════════

TICKERS_LIST = MCPScenario(
    id="TK-001",
    name="View tickers management",
    entity="tickers",
    category="display",
    preconditions=["User logged in", "Admin role"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/tickers"),
        MCPStep("browser_snapshot", "", "Tickers page loads, table visible"),
    ],
)

USER_TICKERS_LIST = MCPScenario(
    id="UT-001",
    name="View my tickers (watchlist)",
    entity="user_tickers",
    category="display",
    preconditions=["User logged in"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/user_tickers"),
        MCPStep("browser_snapshot", "", "User tickers page loads"),
    ],
)

# ═══════════════════════════════════════
# CASH FLOWS scenarios
# ═══════════════════════════════════════

CASH_FLOWS_LIST = MCPScenario(
    id="CF-001",
    name="View cash flows",
    entity="cash_flows",
    category="display",
    preconditions=["User logged in", "Trading account exists"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/cash_flows"),
        MCPStep("browser_snapshot", "", "Cash flows page loads"),
    ],
)

# ═══════════════════════════════════════
# DATA DASHBOARD
# ═══════════════════════════════════════

DATA_DASHBOARD = MCPScenario(
    id="DD-001",
    name="View data dashboard",
    entity="data_dashboard",
    category="display",
    preconditions=["User logged in"],
    steps=[
        MCPStep("browser_navigate", "http://localhost:8080/data_dashboard"),
        MCPStep("browser_snapshot", "", "Dashboard loads with staleness info"),
    ],
)


# ═══════════════════════════════════════
# ALL SCENARIOS REGISTRY
# ═══════════════════════════════════════

ALL_SCENARIOS = [
    AUTH_LOGIN, AUTH_LOGIN_INVALID,
    TRADING_ACCOUNTS_LIST, TRADING_ACCOUNTS_CREATE, TRADING_ACCOUNTS_CREATE_VALIDATION,
    ALERTS_LIST, ALERTS_CREATE, ALERTS_EDIT, ALERTS_DELETE, ALERTS_VALIDATION,
    ALERTS_WIDGET_DISPLAY, ALERTS_WIDGET_NAVIGATION, ALERTS_WIDGET_EMPTY,
    NOTES_CRUD,
    TICKERS_LIST, USER_TICKERS_LIST,
    CASH_FLOWS_LIST,
    DATA_DASHBOARD,
]


def get_scenarios_for_entity(entity: str) -> list[MCPScenario]:
    return [s for s in ALL_SCENARIOS if s.entity == entity]


def get_scenarios_by_category(category: str) -> list[MCPScenario]:
    return [s for s in ALL_SCENARIOS if s.category == category]


def generate_mcp_test_prompt(scenarios: list[MCPScenario]) -> str:
    """Generate a prompt for Cursor Composer to run MCP test scenarios."""
    lines = [
        "# MCP Browser Test Scenarios",
        "",
        "Run each scenario using MCP browser tools (cursor-ide-browser).",
        "For each scenario: execute all steps, take browser_snapshot, report PASS/FAIL.",
        "",
        "**Tools:** browser_navigate, browser_click, browser_type, browser_snapshot, browser_lock, browser_unlock",
        "",
        "**Prerequisite:** Start app: `scripts/init-servers-for-qa.sh` (backend 8082, frontend 8080)",
        "",
    ]

    for scenario in scenarios:
        lines.append(f"## {scenario.id}: {scenario.name}")
        lines.append(f"Entity: {scenario.entity} | Category: {scenario.category}")
        if scenario.preconditions:
            lines.append(f"Preconditions: {', '.join(scenario.preconditions)}")
        lines.append("")
        for i, step in enumerate(scenario.steps, 1):
            line = f"{i}. `{step.action}` → {step.target}"
            if step.data:
                line += f" (data: \"{step.data}\")"
            if step.expected:
                line += f"\n   ✓ Expected: {step.expected}"
            lines.append(line)
        lines.append("")

    return "\n".join(lines)
