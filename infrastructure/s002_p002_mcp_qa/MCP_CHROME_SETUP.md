# S002-P002 MCP + Chrome Infrastructure (Team 60)

Infrastructure so **teams 50, 90, 190** can run tests and work with **Chrome via MCP** in addition to existing Selenium.

## Current state: Selenium

- **Location:** `tests/` — Node + selenium-webdriver + Chrome.
- **Config:** `tests/selenium-config.js` (frontend 8080, backend 8082, Chrome options, optional CHROMEDRIVER_REMOTE).
- **Run:** `cd tests && npm run test:gate-a` (and other scripts in `tests/package.json`). Start stack with `scripts/init-servers-for-qa.sh` or `start-backend.sh` + `start-frontend.sh`.

## MCP Chrome (in addition to Selenium)

- **Purpose:** Same QA flows (login, navigation, CRUD, D22/D33/D34/D35, etc.) can be driven via **MCP** (Cursor Model Context Protocol) so that agents or Cursor-based runs can control Chrome without necessarily running Selenium in Node.
- **Servers (Cursor):**  
  - **cursor-ide-browser** — navigate, snapshot, click, type, scroll.  
  - **cursor-browser-extension** — alternate MCP server for browser interaction.  
  Use the one enabled in your Cursor MCP configuration; both allow Chrome to be driven from the IDE/agent.
- **Runtime:** When running inside Cursor, the MCP browser tools attach to a Chrome instance (or open one). This is **LOCAL_DEV_NON_AUTHORITATIVE** unless run in a defined CI environment that has MCP client + Chrome (then can be TARGET_RUNTIME if documented).
- **Parity with Selenium:** Same user flows (auth, pages, tables, modals); different driver (MCP vs Selenium). Evidence (screenshots, pass/fail) can be produced from either; for gate submission, use TARGET_RUNTIME and the signing service for MATERIALIZATION_EVIDENCE.json.

## How to use MCP Chrome (teams 50, 90, 190)

1. **Enable MCP** in Cursor: ensure `cursor-ide-browser` or `cursor-browser-extension` is enabled (see Cursor MCP settings).
2. **Start app:** Backend 8082 + Frontend 8080 (e.g. `scripts/init-servers-for-qa.sh`).
3. **Run flows:** Use MCP tools (e.g. `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`) to perform the same steps as in Selenium E2E tests. Lock/unlock workflow: navigate → lock → interactions → unlock.
4. **Evidence:** Use `generate_evidence.py` (or equivalent) to produce MATERIALIZATION_EVIDENCE.json with provenance and signature block; sign with `scripts/signing/sign_evidence.py`.

## Infrastructure provided by Team 60 (this repo)

| Item | Path / description |
|------|--------------------|
| Runtime identity | `infrastructure/s002_p002_mcp_qa/RUNTIME_IDENTITY.md` |
| Key custody | `infrastructure/s002_p002_mcp_qa/KEY_CUSTODY.md` |
| Signing service | `scripts/signing/sign_evidence.py` |
| Evidence generator | `infrastructure/s002_p002_mcp_qa/generate_evidence.py` (skeleton + sign) |
| Selenium (existing) | `tests/selenium-config.js`, `tests/*.e2e.test.js` |
| MCP Chrome usage | This doc; Cursor MCP servers are external, usage is in Cursor/agent. |

Team 61 advises on repo-automation (CI, evidence hooks); infrastructure in **this repo** is Team 60.
