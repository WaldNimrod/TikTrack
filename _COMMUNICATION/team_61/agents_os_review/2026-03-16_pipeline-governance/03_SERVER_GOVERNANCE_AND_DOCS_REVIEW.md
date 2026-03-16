**date:** 2026-03-15

# Server Governance And Docs Review

## Findings

- `P0` `AGENTS_OS documentation closure authority is internally contradictory.` `agents_os_v2/context/identity/team_70.md` explicitly says Team 70 is the TikTrack documentation lane and must not own AGENTS_OS canonical promotion. `agents_os_v2/context/identity/team_170.md` defines Team 170 as AGENTS_OS/governance canonical authority. Despite that, `agents_os_v2/config.py`, `agents_os_v2/conversations/gate_8_doc_closure.py`, and `agents_os_v2/orchestrator/pipeline.py` all route AGENTS_OS `GATE_8` closure through Team 70.
- `P1` `Legacy agents_os observer code is not executable under the default python3 in this environment.` `agents_os/observers/state_reader.py` uses the `str | None` annotation syntax and fails during test collection under `python3 3.9.6`. This is not just a test inconvenience. It means legacy Agents OS utilities silently assume a newer interpreter than the default system runtime.
- `P1` `The local setup guide is stale relative to the active AGENTS_OS lane.` `agents_os_v2/PHASE_6_LOCAL_SETUP_GUIDE.md` still narrates `GATE_4 -> Team 50 QA` and `GATE_8 -> Documentation closure` without the Team 51 and Team 170 split required by the active operating procedures.
- `P1` `Operational login documentation is split across incompatible credential stories.` `api/scripts/create_admin_user.py`, `scripts/create-admin.sh`, `scripts/README.md`, and `AGENTS.md` still describe `admin / 418141` as the default operator path, while the live backend in this environment accepts `TikTrackAdmin / 4181` and rejects `admin / 418141`. The system may support both provisioning tracks historically, but the operator-facing documentation is not presenting one coherent truth.
- `P2` `UI server lifecycle scripts are not health-checked and can mislead the operator.` `agents_os/scripts/start_ui_server.sh` backgrounds `python3 -m http.server`, writes a pid file immediately, and prints success without verifying the server bound the port. `agents_os/scripts/stop_ui_server.sh` only kills the pid in the pid file and does not verify or clear actual listeners on the target port.
- `P2` `MCP scenario documentation inflates “entities” relative to the real registry.` The procedure cites “18 entities” in `agents_os_v2/mcp/test_scenarios.py`, but the file currently contains `18` scenarios across only `9` unique entities. This is a smaller drift item, but it reinforces that narrative and implementation are not tightly synchronized.

## Evidence

- Files:
  - `agents_os_v2/config.py`
  - `agents_os_v2/conversations/gate_4_qa.py`
  - `agents_os_v2/conversations/gate_8_doc_closure.py`
  - `agents_os_v2/context/identity/team_70.md`
  - `agents_os_v2/context/identity/team_170.md`
  - `agents_os_v2/PHASE_6_LOCAL_SETUP_GUIDE.md`
  - `api/scripts/create_admin_user.py`
  - `scripts/create-admin.sh`
  - `scripts/README.md`
  - `scripts/README_SEED_QA_USER.md`
  - `documentation/docs-system/01-ARCHITECTURE/TT2_DATABASE_CREDENTIALS.md`
  - `agents_os/scripts/start_ui_server.sh`
  - `agents_os/scripts/stop_ui_server.sh`
  - `agents_os/observers/state_reader.py`
  - `agents_os_v2/mcp/test_scenarios.py`
- Logs:
  - `logs/python_version.txt`
  - `logs/pytest_agents_os_legacy.txt`
  - `logs/mcp_scenarios_summary.txt`

## Focus areas

- Validators, scripts, and evidence handling
- Canonical path discipline and promotion boundaries
- Stale procedures, future plans, and legacy overlap
- Governance-to-runtime consistency

## Notes

- The system has a real governance canon, but several runtime artifacts are still carrying pre-split assumptions from before the AGENTS_OS role separation hardened.
- The script layer should be treated as part of the operator product, not as incidental helper code. Right now it is under-specified for that role.
