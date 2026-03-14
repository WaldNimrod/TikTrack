# Agents_OS Scripts

**project_domain:** AGENTS_OS  
**owner:** Team 170  
**date:** 2026-03-14

---

## Scripts (1-line each)

| Script | Purpose |
|--------|---------|
| `start_ui_server.sh` | Start local HTTP server (port 7070) for Pipeline Dashboard |
| `stop_ui_server.sh` | Stop the Agents_OS UI server |
| `init_pipeline.sh` | Initialize pipeline state for a new work package |

---

## Quick Start

To open the Pipeline Dashboard: run `./agents_os/scripts/start_ui_server.sh` → open URL in browser.

---

## Common Workflows

| Task | Command |
|------|---------|
| Open Pipeline Dashboard | `./agents_os/scripts/start_ui_server.sh` → http://localhost:7070/agents_os/ui/PIPELINE_DASHBOARD.html |
| Stop Dashboard server | `./agents_os/scripts/stop_ui_server.sh` |
| Start new program | `./agents_os/scripts/init_pipeline.sh <domain> <WP_ID>` |
| Check pipeline status | `./pipeline_run.sh domain` |
| Generate current gate prompt | `./pipeline_run.sh [--domain X]` |
| Advance gate after AI completes | `./pipeline_run.sh [--domain X] pass` |

---

## Note

`pipeline_run.sh` (repo root) is the primary CLI — scripts in this folder are helpers for server and state management. See [documentation/docs-agents-os/03-CLI-REFERENCE/PIPELINE_CLI_REFERENCE.md](../../documentation/docs-agents-os/03-CLI-REFERENCE/PIPELINE_CLI_REFERENCE.md) for full CLI reference.
