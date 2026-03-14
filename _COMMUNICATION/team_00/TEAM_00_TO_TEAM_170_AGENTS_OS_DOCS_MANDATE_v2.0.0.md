# Team 00 → Team 170 — Agents_OS Documentation & Infrastructure Mandate
## TEAM_00_TO_TEAM_170_AGENTS_OS_DOCS_MANDATE_v2.0.0.md

**project_domain:** AGENTS_OS
**from:** Team 00 (Chief Architect)
**to:** Team 170 (Governance Documentation)
**cc:** Team 100, Team 10
**date:** 2026-03-14
**status:** ACTIVE_MANDATE
**supersedes:** TEAM_00_TO_TEAM_170_AGENTS_OS_DOCS_MANDATE_v1.0.0.md
**priority:** HIGH

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| task_id | AGENTS_OS_DOCS_AND_INFRA_MANDATE |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 170 |
| required_active_stage | S002 |
| project_domain | AGENTS_OS |

---

## 0. Before You Start: System Orientation

**Team 170 — you do not know this system yet. This section gives you the minimal entry points before you read anything else.**

### What Agents_OS is (one paragraph)
Agents_OS is the automation and governance layer that drives TikTrack development. It is NOT a product feature. It consists of a CLI tool (`pipeline_run.sh`), an orchestrator (`agents_os_v2/`), and a web dashboard (3 HTML files currently in the repo root). It manages the "gate" process: each work package (feature program) goes through GATE_0 → GATE_8 with AI-assisted mandate generation, coordination between teams, and structured handoffs.

### Mandatory reading BEFORE writing any documentation:

| # | File | What you learn |
|---|---|---|
| 1 | `agents_os_v2/orchestrator/pipeline.py` | The gate engine: GATE_CONFIG, mandate generation, routing logic — the core of the system |
| 2 | `pipeline_run.sh` (repo root) | Every CLI command available to operators — this is the primary interface |
| 3 | `PIPELINE_DASHBOARD.html` (repo root) | The main UI: how it loads data, gate states, mandate display |
| 4 | `PIPELINE_ROADMAP.html` (repo root) | The portfolio map: how programs and stages are displayed |
| 5 | `agents_os_v2/orchestrator/state.py` | PipelineState dataclass — the data structure the pipeline runs on |
| 6 | `agents_os_v2/observers/state_reader.py` | How STATE_SNAPSHOT.json is produced |
| 7 | `_COMMUNICATION/agents_os/pipeline_state.json` (or `pipeline_state_agents_os.json`) | Current live state of the pipeline |
| 8 | `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` | Official V2 operating procedures |
| 9 | `agents_os/AGENTS_OS_FOUNDATION_v1.0.0.md` | Foundation spec — who Agents_OS is and what it solves |
| 10 | `_COMMUNICATION/_Architects_Decisions/ADR_026_AGENT_OS_FINAL_VERDICT.md` | Why Agents_OS V2 exists (decision history) |

### Code paths you will reference frequently:
```
agents_os_v2/
├── orchestrator/
│   ├── pipeline.py         ← Gate engine, mandate generation, GATE_CONFIG
│   ├── state.py            ← PipelineState dataclass
│   ├── gate_router.py      ← Gate routing logic
│   └── state.py
├── observers/
│   └── state_reader.py     ← STATE_SNAPSHOT.json producer
└── context/
    ├── identity/           ← team_*.md — team role definitions
    └── governance/         ← gate_rules.md

agents_os/
├── README.md               ← V1 system overview
├── AGENTS_OS_FOUNDATION_v1.0.0.md
├── docs-governance/        ← Concept package, workpack specs
│   ├── AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/
│   └── AOS_workpack/
└── documentation/          ← Code-adjacent index (keep, extend carefully)

_COMMUNICATION/agents_os/
├── pipeline_state.json             ← live tiktrack state
├── pipeline_state_agents_os.json   ← live agents_os state
├── STATE_SNAPSHOT.json             ← observer output
└── prompts/                        ← generated gate prompts and mandates

PIPELINE_DASHBOARD.html  ← TO BE MOVED (see Task 3)
PIPELINE_ROADMAP.html    ← TO BE MOVED (see Task 3)
PIPELINE_TEAMS.html      ← TO BE MOVED (see Task 3)
pipeline_run.sh          ← stays at repo root (canonical CLI entry point)
```

---

## 1. Architectural Decisions Locked by This Mandate

### D1: Documentation Structure
**Canonical location for Agents_OS organized documentation:** `documentation/docs-agents-os/`

This follows the same pattern as the existing TikTrack documentation:
```
documentation/                    ← main documentation root (existing)
├── docs-governance/              ← shared governance (existing, do not modify)
├── docs-system/                  ← TikTrack system docs (existing, do not modify)
└── docs-agents-os/               ← NEW — your primary deliverable
    ├── 00_AGENTS_OS_MASTER_INDEX.md
    ├── 01-OVERVIEW/
    ├── 02-ARCHITECTURE/
    ├── 03-CLI-REFERENCE/
    ├── 04-PROCEDURES/
    └── 05-TEMPLATES/
```

**What lives under `agents_os/` (the code directory):** unchanged. `agents_os/documentation/` may contain code-adjacent developer notes and the existing `00_INDEX.md`, `01-FOUNDATIONS`, `02-SPECS`, `03-TEMPLATES` — keep these but do not treat them as the primary organized documentation. Update their `README.md` files to point to `documentation/docs-agents-os/`.

### D2: UI Files Location
All pipeline UI HTML files move from repo root to `agents_os/ui/`:
```
agents_os/ui/
├── PIPELINE_DASHBOARD.html
├── PIPELINE_ROADMAP.html
└── PIPELINE_TEAMS.html
```
Cross-file navigation links inside the HTML files must be updated to relative paths (they already use relative references — since all files stay in the same directory, most links work without change; verify and fix any that don't).

### D3: Agents_OS Server Scripts
New canonical scripts under `agents_os/scripts/`:
```
agents_os/scripts/
├── start_ui_server.sh    ← start local HTTP server for dashboard
├── stop_ui_server.sh     ← stop the server
└── init_pipeline.sh      ← initialize pipeline state for a new WP
```
Three new Cursor tasks added to `.vscode/tasks.json`.

---

## 2. Phase 1 Deliverables — Documentation Structure (Priority: HIGH)

### Task 1.1 — `documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md`

**Format:** Master navigation index for the entire Agents_OS domain.

Required sections (use these exact headings):

```markdown
# Agents_OS — Master Documentation Index
> documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md

## Quick Start
(links: start server, run pipeline, check status)

## System Overview
(link to 01-OVERVIEW/AGENTS_OS_OVERVIEW.md)

## Architecture
(links to 02-ARCHITECTURE/ files)

## CLI Reference
(link to 03-CLI-REFERENCE/PIPELINE_CLI_REFERENCE.md)

## Operating Procedures
(links to 04-PROCEDURES/ + link to shared docs-governance procedures)

## Templates
(links to 05-TEMPLATES/ + links to governance templates)

## Governance & Decisions
(links to _Architects_Decisions/ Agents_OS ADRs, Agent_OS_FOUNDATION, concept package)

## Program History
(link to _ARCHIVE/ and program registry)

## Full File Map
(table: Document | Type | Location | Status | Notes)
```

The Full File Map table must include ALL documents listed in Team 170's own analysis (`TEAM_170_AGENTS_OS_DOCUMENTATION_STATE_AND_WORK_PLAN_OPTIONS_v1.0.0.md` §2). No omissions.

---

### Task 1.2 — `documentation/docs-agents-os/01-OVERVIEW/AGENTS_OS_OVERVIEW.md`

**Purpose:** Self-contained onboarding document. A new team member who reads only this file should understand the system well enough to start using `pipeline_run.sh`.

Required sections:

**§1 What is Agents_OS**
One precise paragraph. NOT a product feature. It is the automation and governance layer that drives TikTrack development. Describe the problem it solves (100% manual prompting → structured mandate generation and gate enforcement).

**§2 V1 vs V2 — What Changed**
| Component | V1 | V2 |
|---|---|---|
| Orchestrator | agents_os/orchestrator/ | agents_os_v2/orchestrator/pipeline.py |
| State | Manual | PipelineState dataclass in state.py |
| UI | None | 3 HTML files (PIPELINE_DASHBOARD, ROADMAP, TEAMS) |
| Mandates | Manual prompts | Generic Mandate Engine (MandateStep, phases, coordination) |
| Multi-domain | Single | tiktrack + agents_os parallel pipelines with --domain flag |

**§3 Key Components (brief)**
For each component: one sentence, file path, what it does:
- `pipeline_run.sh` — primary CLI interface (all subcommands)
- `agents_os_v2/orchestrator/pipeline.py` — gate engine, mandate generation
- `agents_os_v2/orchestrator/state.py` — pipeline state management
- `agents_os_v2/observers/state_reader.py` — STATE_SNAPSHOT producer
- `agents_os/ui/PIPELINE_DASHBOARD.html` — gate management UI
- `agents_os/ui/PIPELINE_ROADMAP.html` — portfolio map UI
- `_COMMUNICATION/agents_os/` — runtime output directory (state files, prompts, mandates)

**§4 How to Start a New Program (5 steps)**
```bash
# Step 1: Initialize pipeline state for new WP
./agents_os/scripts/init_pipeline.sh agents_os S002-P005-WP001

# Step 2: Generate GATE_0 activation prompt
./pipeline_run.sh --domain agents_os gate GATE_0

# Step 3: Paste prompt to AI, complete GATE_0 work

# Step 4: Advance
./pipeline_run.sh --domain agents_os pass

# Step 5: Continue gate by gate...
./pipeline_run.sh --domain agents_os  # shows current gate prompt
```

**§5 Contributing**
- Team 10: implements changes, advances gates via CLI
- Team 170: maintains documentation (this folder)
- Team 00: architectural decisions and spec documents
- Read `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` for full team protocol

---

### Task 1.3 — `documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_ARCHITECTURE_OVERVIEW.md`

Required sections:

**§1 Domain Isolation Model**
Describe why `agents_os_v2` imports nothing from `api/`. Read `agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/DOMAIN_ISOLATION_MODEL.md` before writing this section.

**§2 Gate Sequence (ASCII diagram)**
```
GATE_0 (Intake) → GATE_1 (Review) → GATE_2 (Human Approval) →
G3_PLAN (Work Plan) → G3_6_MANDATES (Team Mandates) →
GATE_3 (API Verify) → GATE_4 (Implementation) → GATE_5 (QA) →
GATE_6 (Human Approval) → GATE_7 (UX Sign-off) → GATE_8 (Closure)
```
Include: gate types (normal / mandate / human-approval / self-loop), who owns each gate (read `GATE_CONFIG` in `agents_os_v2/orchestrator/pipeline.py` for the authoritative list).

**§3 Mandate Engine Architecture**
Source: read `agents_os_v2/orchestrator/pipeline.py` — the `MandateStep` class, `_generate_mandate_doc()`, `_read_coordination_file()`.
Describe: MandateStep fields → section generation → phase-aware join → coordination injection → correction cycle pattern.

**§4 Multi-Domain Design**
Source: read `agents_os_v2/orchestrator/state.py` and `pipeline_run.sh` `--domain` flag handling.
Describe: how parallel pipelines work, state file isolation, domain resolution order.

**§5 Correction Cycle Pattern**
Describe what happens when a gate fails and loops back to itself (GATE_8 example). Source: read `advance_gate()` in `pipeline.py` and `fail)` case in `pipeline_run.sh`.

---

### Task 1.4 — Update `agents_os/README.md`

Add a prominent navigation block at the TOP of the file:

```markdown
## Documentation
→ **Full documentation: [documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md](../documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md)**

Quick start: [AGENTS_OS_OVERVIEW.md](../documentation/docs-agents-os/01-OVERVIEW/AGENTS_OS_OVERVIEW.md)
CLI reference: [PIPELINE_CLI_REFERENCE.md](../documentation/docs-agents-os/03-CLI-REFERENCE/PIPELINE_CLI_REFERENCE.md)
UI: [agents_os/ui/PIPELINE_DASHBOARD.html](ui/PIPELINE_DASHBOARD.html)
```

---

### Task 1.5 — Update `documentation/docs-governance/00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md`

Add entry for `documentation/docs-agents-os/` parallel to `documentation/docs-system/`.

---

## 3. Phase 2 Deliverables — UI Files Migration (Priority: HIGH — do in same iteration as Phase 1)

### Task 2.1 — Move HTML files to `agents_os/ui/`

Create directory `agents_os/ui/` and move:
- `PIPELINE_DASHBOARD.html` → `agents_os/ui/PIPELINE_DASHBOARD.html`
- `PIPELINE_ROADMAP.html` → `agents_os/ui/PIPELINE_ROADMAP.html`
- `PIPELINE_TEAMS.html` → `agents_os/ui/PIPELINE_TEAMS.html`

**After moving — verify and fix all inter-file navigation links:**
In each HTML file, find all `href="PIPELINE_*.html"` and `src=` references.
Since all three files move to the same directory together, relative links (`href="PIPELINE_ROADMAP.html"`) continue to work unchanged.
Verify there are no absolute root-relative paths (`href="/PIPELINE_*.html"`).

**JSON data path check:**
The files load JSON from paths like `_COMMUNICATION/agents_os/prompts/...` via JavaScript `fetch()`.
If the HTTP server is rooted at the REPO ROOT (see Task 3.1), these paths are relative to server root and work correctly from any subdirectory.
**If using file:// protocol** (no server): paths need adjustment. Verify after move.

**Affected references to update elsewhere:**
- `pipeline_run.sh` — does not reference HTML files directly, no change needed
- `CLAUDE.md` / documentation references — search for `PIPELINE_DASHBOARD.html` across repo and update any hardcoded paths

---

## 4. Phase 3 Deliverables — Agents_OS Server Scripts (Priority: HIGH)

**Context:** The PIPELINE_DASHBOARD.html requires a local HTTP server to function (browser CORS policy blocks JSON file reads via `file://`). Currently there is no canonical way to start this server. Everyone on the team needs to know how.

### Task 3.1 — `agents_os/scripts/start_ui_server.sh`

```bash
#!/usr/bin/env bash
# Start local HTTP server for Agents_OS Pipeline Dashboard
# Usage: ./agents_os/scripts/start_ui_server.sh [port]
# Default port: 7070

set -e
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORT="${1:-7070}"
PID_FILE="/tmp/agents_os_ui_server.pid"

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "[agents_os] Server already running on port $(cat "$PID_FILE" | xargs -I{} sh -c 'echo ${PORT:-7070}')"
  echo "[agents_os] Run: ./agents_os/scripts/stop_ui_server.sh to stop"
  exit 0
fi

cd "$REPO"
python3 -m http.server "$PORT" --bind 127.0.0.1 &
echo $! > "$PID_FILE"
echo ""
echo "[agents_os] Pipeline UI server started (port $PORT)"
echo ""
echo "  📊 Dashboard:  http://localhost:${PORT}/agents_os/ui/PIPELINE_DASHBOARD.html"
echo "  🗺️  Roadmap:    http://localhost:${PORT}/agents_os/ui/PIPELINE_ROADMAP.html"
echo "  👥 Teams:      http://localhost:${PORT}/agents_os/ui/PIPELINE_TEAMS.html"
echo ""
echo "  Stop: ./agents_os/scripts/stop_ui_server.sh"
echo ""
```

### Task 3.2 — `agents_os/scripts/stop_ui_server.sh`

```bash
#!/usr/bin/env bash
# Stop the Agents_OS Pipeline Dashboard server
PID_FILE="/tmp/agents_os_ui_server.pid"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    rm "$PID_FILE"
    echo "[agents_os] UI server stopped (pid $PID)"
  else
    echo "[agents_os] Server was not running (stale pid file removed)"
    rm "$PID_FILE"
  fi
else
  echo "[agents_os] No server running (no pid file found)"
fi
```

### Task 3.3 — `agents_os/scripts/init_pipeline.sh`

```bash
#!/usr/bin/env bash
# Initialize pipeline state for a new work package
# Usage:
#   ./agents_os/scripts/init_pipeline.sh <domain> <work_package_id> [stage_id] [spec_brief]
#
# Examples:
#   ./agents_os/scripts/init_pipeline.sh agents_os S002-P005-WP001
#   ./agents_os/scripts/init_pipeline.sh tiktrack S003-P003-WP001 S003 "System Settings D39/D40/D41"

set -e
DOMAIN="${1:?Usage: init_pipeline.sh <domain> <work_package_id> [stage_id] [spec_brief]}"
WP="${2:?Usage: init_pipeline.sh <domain> <work_package_id> [stage_id] [spec_brief]}"
STAGE="${3:-S002}"
SPEC="${4:-New program}"

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO"

python3 -c "
import sys
sys.path.insert(0, '.')
from agents_os_v2.orchestrator.state import PipelineState
s = PipelineState(
    work_package_id='$WP',
    project_domain='$DOMAIN',
    stage_id='$STAGE',
    spec_brief='$SPEC',
    current_gate='GATE_0'
)
s.save()
print('[agents_os] Pipeline initialized')
print(f'  WP:     {s.work_package_id}')
print(f'  Domain: {s.project_domain}')
print(f'  Stage:  {s.stage_id}')
print(f'  Gate:   {s.current_gate}')
print()
print('Next step:')
print(f'  ./pipeline_run.sh --domain $DOMAIN gate GATE_0')
"
```

Make all three scripts executable: `chmod +x agents_os/scripts/*.sh`

---

### Task 3.4 — Add to `.vscode/tasks.json`

Add the following tasks to the existing `tasks` array in `.vscode/tasks.json` (append after the last existing task):

```json
{
  "label": "🚀 Start Agents_OS UI Server (Port 7070)",
  "type": "shell",
  "command": "${workspaceFolder}/agents_os/scripts/start_ui_server.sh",
  "detail": "agents_os/scripts/start_ui_server.sh — Agents_OS Pipeline Dashboard on :7070",
  "problemMatcher": [],
  "presentation": { "reveal": "always", "panel": "new", "focus": true, "clear": true },
  "group": { "kind": "build", "isDefault": false }
},
{
  "label": "🛑 Stop Agents_OS UI Server",
  "type": "shell",
  "command": "${workspaceFolder}/agents_os/scripts/stop_ui_server.sh",
  "detail": "agents_os/scripts/stop_ui_server.sh",
  "problemMatcher": [],
  "presentation": { "reveal": "always", "panel": "new" }
},
{
  "label": "🔧 Init Agents_OS Pipeline (agents_os domain)",
  "type": "shell",
  "command": "${workspaceFolder}/agents_os/scripts/init_pipeline.sh agents_os ${input:wpId}",
  "detail": "init_pipeline.sh — create pipeline state for agents_os domain",
  "problemMatcher": [],
  "presentation": { "reveal": "always", "panel": "new", "focus": true }
},
{
  "label": "📊 Check Pipeline Status (both domains)",
  "type": "shell",
  "command": "${workspaceFolder}/pipeline_run.sh domain",
  "detail": "pipeline_run.sh domain — shows tiktrack + agents_os pipeline states",
  "problemMatcher": [],
  "presentation": { "reveal": "always", "panel": "new" }
}
```

Also add the input variable definition to `.vscode/tasks.json` (after the tasks array, before closing brace):
```json
"inputs": [
  {
    "id": "wpId",
    "type": "promptString",
    "description": "Work Package ID (e.g. S002-P005-WP001)"
  }
]
```

---

### Task 3.5 — `agents_os/scripts/README.md`

Write a brief (1-page) README covering:
1. What each script does (1 line each)
2. Quick start: "To open the Pipeline Dashboard: run start_ui_server.sh → open URL in browser"
3. Common workflows table:

| Task | Command |
|---|---|
| Open Pipeline Dashboard | `./agents_os/scripts/start_ui_server.sh` → `http://localhost:7070/agents_os/ui/PIPELINE_DASHBOARD.html` |
| Stop Dashboard server | `./agents_os/scripts/stop_ui_server.sh` |
| Start new program | `./agents_os/scripts/init_pipeline.sh <domain> <WP_ID>` |
| Check pipeline status | `./pipeline_run.sh domain` |
| Generate current gate prompt | `./pipeline_run.sh [--domain X]` |
| Advance gate after AI completes | `./pipeline_run.sh [--domain X] pass` |

4. Note: `pipeline_run.sh` (repo root) is the primary CLI — scripts in this folder are helpers for server and state management.

---

## 5. Phase 4 Deliverables — CLI Reference Document (Priority: MEDIUM)

### Task 4.1 — `documentation/docs-agents-os/03-CLI-REFERENCE/PIPELINE_CLI_REFERENCE.md`

**Full reference for `pipeline_run.sh`**. Source: read the actual `pipeline_run.sh` — do not summarize from memory.

Required format for each subcommand:
```markdown
### `./pipeline_run.sh <subcommand>`
**Usage:** `./pipeline_run.sh [--domain X] <subcommand> [args]`
**When to use:** [one sentence]
**What it does:** [2-3 sentences, describe the actual behavior]
**Output:** [what appears in terminal]
**Example:**
  $ ./pipeline_run.sh --domain agents_os pass
**Next step after:** [what to do next]
```

Cover ALL current subcommands: `next`, `pass`, `fail`, `route`, `approve`, `status`, `gate`, `revise`, `store`, `domain`, `phase*`, `new` (when implemented), `hold`, `cancel`, `revive`.

---

## 6. Acceptance Criteria

### Phase 1 (documentation):
- [ ] `documentation/docs-agents-os/` directory exists with all specified subdirs
- [ ] `00_AGENTS_OS_MASTER_INDEX.md` covers all files from Team 170's gap analysis §2
- [ ] `AGENTS_OS_OVERVIEW.md` — a new team member can understand the system from this file alone without asking Team 00
- [ ] `AGENTS_OS_ARCHITECTURE_OVERVIEW.md` covers all 5 required sections with correct data from code scan
- [ ] `agents_os/README.md` has navigation block pointing to `documentation/docs-agents-os/`
- [ ] `docs-governance/00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL` updated

### Phase 2 (UI migration):
- [ ] `agents_os/ui/` contains all 3 HTML files
- [ ] No PIPELINE_*.html files remain in repo root
- [ ] All cross-file navigation links verified working (test by opening each page in browser via local server)
- [ ] JSON data paths verified working (Dashboard loads gate data after move)
- [ ] All other references to the HTML files updated across repo

### Phase 3 (server scripts):
- [ ] `agents_os/scripts/` contains start/stop/init scripts
- [ ] All scripts are executable (`chmod +x`)
- [ ] `start_ui_server.sh` starts server + prints all 3 URLs
- [ ] `stop_ui_server.sh` cleanly kills the server process
- [ ] `init_pipeline.sh` creates a valid `pipeline_state_*.json` for the given domain
- [ ] `.vscode/tasks.json` has all 4 new Agents_OS tasks visible in VS Code Task Runner
- [ ] `agents_os/scripts/README.md` exists and is accurate

### Phase 4 (CLI reference):
- [ ] All current `pipeline_run.sh` subcommands documented with example
- [ ] Team 00 validates: "A new Team 10 developer could use the pipeline without asking for help"

---

## 7. Timeline and Sequencing

Phases 1, 2, 3 should be delivered together — they form a single coherent package. Phase 4 can follow.

Phase 1 (docs) is **non-blocking for S002-P005 activation** but must be complete before GATE_3.
Phase 2 (UI move) should be done immediately — the root folder pollution is a current problem.
Phase 3 (scripts) should be done immediately — every team member needs this.
Phase 4 (CLI reference) before S002-P005 GATE_5.

---

**log_entry | TEAM_00 | AGENTS_OS_DOCS_AND_INFRA_MANDATE | v2.0.0 ISSUED | 2026-03-14**
