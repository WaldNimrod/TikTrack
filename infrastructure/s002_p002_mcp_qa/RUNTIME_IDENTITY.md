# S002-P002 Runtime Identity (Team 60)

Provenance and runtime constraints for Evidence Contract. Every MATERIALIZATION_EVIDENCE.json must carry a **provenance tag** and optional runtime identity.

## Provenance tags

| Tag | Meaning | Use when |
|-----|---------|----------|
| **TARGET_RUNTIME** | Run in the official, hardened environment (this repo + defined CI/runtime). Evidence is authoritative. | QA/CI runs in repo runtime; MCP or Selenium in configured environment. |
| **LOCAL_DEV_NON_AUTHORITATIVE** | Run on a developer machine; not the canonical runtime. Evidence is for local verification only. | Ad-hoc runs on dev laptop; Cursor MCP local. |
| **SIMULATION** | Synthetic or mocked run; no real browser/API. | Dry-run, stub data, or non-execution evidence. |

## Runtime identity (this program)

- **Name:** TikTrack Phoenix S002-P002 MCP-QA runtime  
- **Scope:** This repository (`TikTrackAppV2-phoenix`); backend 8082, frontend 8080; tests in `tests/` (Selenium + optional MCP).  
- **Constraints:**  
  - Backend and frontend must be startable via `scripts/start-backend.sh`, `scripts/start-frontend.sh` (or `scripts/init-servers-for-qa.sh`).  
  - Selenium: Chrome via `tests/selenium-config.js`; optional CHROMEDRIVER_REMOTE for pre-started chromedriver.  
  - MCP Chrome: Cursor MCP servers (cursor-ide-browser / cursor-browser-extension) when running in Cursor; parity flows with Selenium.  
- **Signing:** Team 60 signing service at `scripts/signing/sign_evidence.py`; keys under `scripts/signing/keys/` (gitignored).

## For Evidence Contract

Set `provenance` in MATERIALIZATION_EVIDENCE.json to one of the three tags above. TARGET_RUNTIME is required for gate submission; LOCAL_DEV_NON_AUTHORITATIVE and SIMULATION are for local or exceptional use only.
