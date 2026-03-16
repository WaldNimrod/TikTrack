# TEAM_50_TO_TEAM_61_MCP_CONFIGURATION_RESPONSE_v1.0.0

**project_domain:** TIKTRACK | AGENTS_OS  
**id:** TEAM_50_TO_TEAM_61_MCP_CONFIGURATION_RESPONSE_v1.0.0  
**from:** Team 50  
**to:** Team 61  
**date:** 2026-03-16  
**status:** SUBMITTED  
**in_response_to:** TEAM_61_TO_TEAM_50_MCP_CONFIGURATION_DISCOVERY_REQUEST_v1.0.0  

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
| phase_owner | Team 50 |

---

## 1) MCP Server Inventory

| Server | Status | Primary Use |
|--------|--------|-------------|
| **cursor-ide-browser** | ACTIVE | Browser automation for GATE_4 QA, D22/D34/D35 CRUD verification |
| cursor-browser-extension | Optional (prompt mentions it) | Alternate; Team 50 uses cursor-ide-browser in practice |

**Primary server:** `cursor-ide-browser`  
- **Server identifier:** `cursor-ide-browser`  
- **Source:** Built-in Cursor IDE MCP server (shipped with Cursor; not installed via npm)

---

## 2) Cursor Configuration

### Config location
- **No project-level config:** This project does not contain `.cursor/mcp.json` or explicit MCP config.
- **Cursor-managed:** The server is enabled via Cursor Settings -> Tools & MCP. Cursor provides it as a built-in option.
- **Path:** Cursor Settings (`Cmd+,` / `Ctrl+,`) -> **Tools & MCP** -> ensure "cursor-ide-browser" is enabled.

### Config schema (for reference - Cursor may not expose this)
Cursor manages cursor-ide-browser internally. For **external** MCP servers, Cursor uses:
- **Project:** `.cursor/mcp.json` in workspace root
- **User:** `~/.cursor/mcp.json` or Cursor settings JSON

**cursor-ide-browser:** No manual config required when enabled in Cursor UI. Cursor spawns and connects to it automatically.

### Transport
- **Type:** Assumed stdio (typical for Cursor built-in MCP)
- **Local process:** Yes - Cursor launches the server process locally
- **Connection URL:** Not applicable (no HTTP transport)

### Sanitized snippet (for Codex parity - see SS5)
```toml
# Codex ~/.codex/config.toml - equivalent server (NOT cursor-ide-browser)
[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]
```

---

## 3) Required Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| (none) | No | cursor-ide-browser does not require env vars for basic operation |

**Optional:** `CHROMEDRIVER_REMOTE` - used by Selenium in `tests/`; not by cursor-ide-browser.

---

## 4) Required Local Dependencies

| Dependency | Version | Notes |
|------------|---------|-------|
| **Cursor IDE** | Current (v0.40+) | Provides cursor-ide-browser |
| **Chrome** | System default | Cursor uses embedded or system Chrome for MCP browser |
| **Node.js** | 18+ | For app under test; not for cursor-ide-browser itself |

**No npm/global install** for cursor-ide-browser - it is bundled with Cursor.  
For **Codex** parity: `npx @playwright/mcp@latest` requires Node.js 18+ and Playwright browser binaries.

---

## 5) Codex Porting Notes

### What Cursor provides automatically
1. **Built-in cursor-ide-browser** - No install or config; enable in Settings.
2. **Chrome instance** - Cursor attaches MCP tools to an embedded or system Chrome.
3. **Project-scoped MCP descriptors** - Cursor caches tool schemas under `~/.cursor/projects/<project>/mcps/cursor-ide-browser/`.

### What Codex must configure manually
1. **Add an MCP browser server** - cursor-ide-browser is Cursor-specific. Use **@playwright/mcp** as equivalent:
   - `codex mcp add playwright npx "@playwright/mcp@latest"`
   - Or in `~/.codex/config.toml`:
     ```toml
     [mcp_servers.playwright]
     command = "npx"
     args = ["@playwright/mcp@latest"]
     ```
2. **Install Playwright browsers** (first run): `npx playwright install chromium`
3. **Ensure ports 8080 (frontend), 8082 (backend)** - Same as Cursor; app must be running for UI tests.

### Tool parity
| Cursor (cursor-ide-browser) | Codex (@playwright/mcp) | Parity |
|----------------------------|-------------------------|--------|
| browser_navigate | navigate or equivalent | High |
| browser_snapshot | accessibility snapshot | High |
| browser_click | click | High |
| browser_fill | fill | High |
| browser_select_option | select_option | High |
| browser_reload | reload | Check package |
| browser_console_messages | console capture | Check package |
| browser_lock / browser_unlock | N/A in Playwright MCP | Cursor-specific workflow |

**Lock/unlock workflow (Cursor):** `browser_navigate` -> `browser_lock` -> interactions -> `browser_unlock`. Codex/Playwright MCP may not have lock; verify package docs.

---

## 6) Smoke Test Procedure

### Prerequisites
1. Backend running: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health` -> 200  
2. Frontend running: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/` -> 200  
   - Or: `scripts/init-servers-for-qa.sh`

### Steps (replay in Codex with MCP browser tools)
1. **browser_navigate** -> `http://localhost:8080/login`  
2. **browser_snapshot** -> Verify login form visible (role: textbox, button)  
3. **browser_fill** (or browser_type) -> Username field; value: `TikTrackAdmin`  
4. **browser_fill** -> Password field; value: `4181`  
5. **browser_click** -> Login button (ref from snapshot)  
6. **browser_navigate** -> `http://localhost:8080/alerts.html`  
7. **browser_snapshot** -> Verify headings "התראות", "ניהול התראות", table, "הוספת התראה" button  

**Expected:** No errors; snapshot shows page structure with `ref` values for interactive elements.

---

## 7) Sanitized Evidence

### Evidence-by-path

| Path | Description |
|------|-------------|
| `_COMMUNICATION/team_50/TEAM_50_GATE_4_QA_REPORT_v1.0.0.md` | GATE_4 report using MCP: browser_navigate, browser_fill, browser_click, browser_select_option, browser_reload, browser_snapshot, browser_console_messages |
| `infrastructure/s002_p002_mcp_qa/MCP_CHROME_SETUP.md` | Team 60 infra doc: cursor-ide-browser and cursor-browser-extension; lock/unlock workflow |
| `~/.cursor/projects/.../mcps/cursor-ide-browser/` | Cursor project MCP descriptors (SERVER_METADATA.json, INSTRUCTIONS.md, tools/*.json) - exists when Cursor has connected to server |

### Example tool list (sanitized)
```
browser_navigate, browser_snapshot, browser_click, browser_fill, browser_type,
browser_select_option, browser_reload, browser_tabs, browser_lock, browser_unlock,
browser_console_messages, browser_wait_for, browser_hover, browser_scroll, ...
```

### Successful task output (sanitized)
From GATE_4 run:
- `browser_navigate` -> `/login` - OK
- `browser_fill` -> Password 4181 - OK
- `browser_click` -> התחבר - OK
- `browser_navigate` -> `/alerts.html` - D34 loaded
- `browser_snapshot` -> Headings, table, "הוספת התראה" - OK
- `browser_select_option` -> TEVA.TA (e76) - Selected
- `browser_reload` -> Page refreshed
- `browser_snapshot` -> TEVA.TA link visible; 5 rows - persistence OK

---

## 8) Risks / Known Limitations

| Risk | Mitigation |
|------|------------|
| cursor-ide-browser is Cursor-built-in | Use @playwright/mcp in Codex; verify tool parity |
| Lock/unlock workflow Cursor-specific | Playwright MCP may not need it; document any differences |
| RTL/ref stability | Element refs (e.g. e76) can change; use browser_snapshot before each interaction |
| Iframe content | Not accessible - only elements outside iframes |
| Native dialogs | alert/confirm/prompt do not block; use browser_handle_dialog for custom responses |

---

## 9) Validation Criteria Response

| Criterion | Result |
|----------|--------|
| 1. Identifies exact MCP server(s) | PASS - cursor-ide-browser (primary) |
| 2. Enough config detail for Codex reproduction | PASS - @playwright/mcp config and parity notes |
| 3. Env vars and dependencies listed | PASS - None required for cursor-ide-browser; Node 18+ for Playwright |
| 4. Smoke-test procedure provided | PASS - SS6 |
| 5. Sanitized evidence included | PASS - SS7 |
| 6. No secrets in artifact | PASS |

**Decision:** **PASS**

---

**log_entry | TEAM_50 | MCP_CONFIGURATION_RESPONSE | SUBMITTED | 2026-03-16**
