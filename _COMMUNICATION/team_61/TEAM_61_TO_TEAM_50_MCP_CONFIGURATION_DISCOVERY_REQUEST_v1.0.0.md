# TEAM_61_TO_TEAM_50_MCP_CONFIGURATION_DISCOVERY_REQUEST_v1.0.0

**project_domain:** AGENTS_OS  
**id:** TEAM_61_TO_TEAM_50_MCP_CONFIGURATION_DISCOVERY_REQUEST_v1.0.0  
**from:** Team 61  
**to:** Team 50  
**date:** 2026-03-15  
**status:** ACTION_REQUIRED  
**gate_id:** N/A  
**work_package_id:** N/A  

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | N/A |
| phase_owner | Team 61 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Purpose

Request the canonical MCP configuration and operating details currently used by Team 50 in Cursor so that the same browser/MCP capability can be made available in the Codex environment for full-system Agents OS review, UI verification, and evidence capture.

This request is operational and discovery-oriented. It is not a request for Team 50 to change their runtime or to approve any gate. The immediate need is to eliminate the current tool-availability gap between Cursor and Codex for browser/MCP-backed review execution.

## 2) Context / Inputs

1. Team 61 completed a full Agents OS review pack under `_COMMUNICATION/team_61/agents_os_review/2026-03-16_pipeline-governance/`.
2. During the review, the Codex environment reported no MCP resources or resource templates available.
3. Team 50 is known to operate MCP in Cursor on a regular basis.
4. The missing MCP/browser capability limited interactive validation of:
   - `agents_os/ui/PIPELINE_DASHBOARD.html`
   - `agents_os/ui/PIPELINE_ROADMAP.html`
   - `agents_os/ui/PIPELINE_TEAMS.html`
   - command-copy flows, live state rendering, and browser evidence capture
5. Team 61 needs the implementation details required to reproduce the same MCP/browser capability in Codex desktop.

## 3) Required Actions

1. Confirm which MCP server or servers Team 50 actively uses in Cursor for browser or UI automation.
2. Provide the MCP server identity details:
   - server name
   - transport type
   - launch command or connection URL
   - local process vs remote service
3. Provide the configuration entry format used by Cursor:
   - config file path or settings location
   - exact config schema or sanitized snippet
   - required environment-variable names
   - required local binaries, packages, or extensions
4. Clarify the authentication model:
   - whether auth is required
   - whether tokens/keys are needed
   - which secret names are required
   - whether there are manual approval steps after configuration
5. Clarify runtime prerequisites:
   - ports
   - browser dependency
   - Playwright/Chrome/Chromedriver or similar
   - whether backend/frontend/UI servers must already be running
6. Provide a minimal smoke-test workflow that Team 61 can replay in Codex after configuration.
7. Provide evidence that the MCP setup is currently working in Cursor, using sanitized proof only:
   - example tool list, snapshot, or successful browser task output
   - no secrets in the evidence
8. Explicitly identify anything Cursor provides automatically that Codex must be configured with manually.

## 4) Deliverables and Paths

Provide the response under `_COMMUNICATION/team_50/` using:

1. `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_61_MCP_CONFIGURATION_RESPONSE_v1.0.0.md`
2. Optional sanitized evidence bundle under:
   - `_COMMUNICATION/team_50/evidence/mcp_configuration_2026-03-16/`

The response document must contain these sections:

1. `MCP Server Inventory`
2. `Cursor Configuration`
3. `Required Environment Variables`
4. `Required Local Dependencies`
5. `Codex Porting Notes`
6. `Smoke Test Procedure`
7. `Sanitized Evidence`
8. `Risks / Known Limitations`

## 5) Validation Criteria (PASS/FAIL)

1. The response identifies the exact MCP server or servers Team 50 uses.
2. The response includes enough configuration detail for Team 61 to reproduce the setup in Codex without guessing.
3. Environment-variable names and dependency prerequisites are listed explicitly.
4. A smoke-test procedure is provided.
5. Sanitized evidence is included or the absence of evidence is explicitly justified.
6. No secrets, tokens, or sensitive credentials are written into the response artifact.

## 6) Response Required

- Decision: PASS / CONDITIONAL_PASS / FAIL
- If `CONDITIONAL_PASS`, list exactly what information is still unavailable
- If `FAIL`, list the blocker preventing disclosure or replication
- Provide evidence-by-path

log_entry | TEAM_61 | MCP_CONFIGURATION_DISCOVERY_REQUEST | ACTION_REQUIRED | 2026-03-16
