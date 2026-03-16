---
project_domain: AGENTS_OS
id: TEAM_61_TO_TEAM_51_AOS_FEATURES_QA_REQUEST_v1.0.0
from: Team 61 (AOS Local Cursor Implementation)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 90, Team 100, Team 10
date: 2026-03-16
status: QA_REQUEST_PENDING
---

# TEAM 61 → TEAM 51 — Canonical QA Request
## AOS Features: Event Log + Team 101 Dual-Mode — Full E2E & MCP Validation

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP003 |
| task_id | EVENT_LOG_PHASE_2_AND_TEAM_101_UI |
| gate_id | GATE_4 (QA Validation) |
| decision | QA_REQUEST |

---

## 1. Purpose

Team 61 requests **full QA validation** from Team 51 for all AOS interfaces and features delivered in S002-P005-WP003 and related work packages:

1. **Event Log** (Phase 2) — API, UI panels, seed, E2E
2. **Team 101 + Dual-Mode Context Injection** — PIPELINE_TEAMS UI
3. **_COMMUNICATION mount** — pipeline state files served by AOS server

**Scope:** All AOS UI pages (Dashboard, Roadmap, Teams) and all relevant features. **Mandatory:** E2E and MCP browser tests.

---

## 2. Test Environment Prerequisites

```bash
# From repo root — MUST use AOS Starlette server (not python -m http.server)
./agents_os/scripts/start_ui_server.sh

# Seed Event Log (ensures data visible in UIs)
python3 agents_os/scripts/seed_event_log.py

# Base URLs (port 8090):
# http://localhost:8090/static/PIPELINE_DASHBOARD.html
# http://localhost:8090/static/PIPELINE_ROADMAP.html
# http://localhost:8090/static/PIPELINE_TEAMS.html
```

---

## 3. Acceptance Criteria — Event Log

| AC | Criterion | Test Method |
|----|-----------|-------------|
| **EL-01** | GET `/api/log/events?domain=tiktrack&limit=20` returns 200 + JSON array with ≥1 event | curl/API |
| **EL-02** | GET `/api/log/events?domain=agents_os&limit=20` returns 200 + JSON array with ≥1 event | curl/API |
| **EL-03** | Dashboard: Event Log accordion visible; list shows events (not "No events" when seed run) | E2E / MCP |
| **EL-04** | Dashboard: Event Log ticker in Current Step Banner shows event count | E2E / MCP |
| **EL-05** | Roadmap: Event Log accordion visible; list shows events | E2E / MCP |
| **EL-06** | Roadmap: System-wide checkbox toggles between program-scoped and global events | E2E / MCP |
| **EL-07** | `_COMMUNICATION` mount: GET `/_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` returns 200 | curl/API |
| **EL-08** | `./tests/e2e_event_log_validation.sh` exits 0 | Shell |

---

## 4. Acceptance Criteria — Team 101 & Dual-Mode

| AC | Criterion | Test Method |
|----|-----------|-------------|
| **T101-01** | PIPELINE_TEAMS: Team 101 appears in team list under Architects | E2E / MCP |
| **T101-02** | PIPELINE_TEAMS: Selecting Team 101 shows correct name "IDE Architecture Authority" | E2E / MCP |
| **T101-03** | PIPELINE_TEAMS: Two copy buttons visible — "Copy RAG Prompt (Mentions)" (primary) and "Copy Hard-Injection Prompt" | E2E / MCP |
| **T101-04** | Copy RAG: Clipboard contains `@team_101.md`, `@STATE_SNAPSHOT.json`, `@PHOENIX_MASTER_WSM_v1.0.0.md` and RAG template text | MCP |
| **T101-05** | Copy Hard-Injection: Clipboard contains full legacy prompt (reset/reinforce/handoff/governance per tab) | MCP |
| **T101-06** | RAG prompt template format matches spec: "You are [Team Name]. Read your identity file..." | Manual |

---

## 5. MCP Test Scenarios (cursor-ide-browser)

**Team 51 must execute the following MCP scenarios:**

### MCP-S1 — Dashboard Event Log
1. `browser_navigate` → `http://localhost:8090/static/PIPELINE_DASHBOARD.html`
2. Wait for load
3. `browser_snapshot` — verify Event Log accordion present; `#event-log-list` or `#event-log-panel` in DOM
4. Assert: Event count badge shows number > 0 (or "—" only if seed not run)

### MCP-S2 — Roadmap Event Log
1. `browser_navigate` → `http://localhost:8090/static/PIPELINE_ROADMAP.html`
2. Wait for load
3. `browser_snapshot` — verify `#event-log-roadmap-panel`, System-wide checkbox
4. Assert: Event list displays content or "Loading…"

### MCP-S3 — Teams: Team 101 in Roster
1. `browser_navigate` → `http://localhost:8090/static/PIPELINE_TEAMS.html`
2. `browser_snapshot` — locate Team 101 in Architects group
3. `browser_click` on Team 101 row
4. Assert: Panel shows "IDE Architecture Authority"; two copy buttons visible

### MCP-S4 — Teams: Copy RAG Prompt
1. Select Team 101
2. `browser_click` "Copy RAG Prompt (Mentions)"
3. Verify clipboard (or paste into textarea and assert) contains `@team_101.md`, RAG template lines

### MCP-S5 — Teams: Copy Hard-Injection Prompt
1. Select Team 101 (or any team)
2. Ensure pipeline state loaded (or manual ctx if validation panel)
3. `browser_click` "Copy Hard-Injection Prompt"
4. Assert: Clipboard contains full prompt block (╔═══ header, responsibilities, Iron Rules)

---

## 6. E2E Script Validation

| Script | Command | Expected |
|--------|---------|----------|
| Event Log E2E | `./tests/e2e_event_log_validation.sh` | Exit 0, "All checks PASS" |
| Unit tests | `python3 -m pytest agents_os_v2/tests/ agents_os_v2/server/tests/ -v -k "not OpenAI and not Gemini"` | All pass |

---

## 7. References

| Document | Path |
|----------|------|
| Event Log Reference | `documentation/docs-agents-os/02-ARCHITECTURE/EVENT_LOG_REFERENCE_v1.0.0.md` |
| Team 101 LOD400 | `agents_os_v2/context/identity/TEAM_101_TO_TEAM_61_UI_DUAL_MODE_LOD400.md` |
| E2E script | `tests/e2e_event_log_validation.sh` |
| Seed script | `agents_os/scripts/seed_event_log.py` |

---

## 8. Deliverable Expected from Team 51

Team 51 shall produce:

1. **QA Report** at `_COMMUNICATION/team_51/TEAM_51_AOS_FEATURES_QA_REPORT_v1.0.0.md` with:
   - Pass/Fail per AC (EL-01..EL-08, T101-01..T101-06)
   - MCP execution log (scenarios MCP-S1..MCP-S5)
   - E2E script output
   - Screenshots or evidence for UI assertions
   - Any BLOCKING or non-blocking findings (BF-XXX format)

2. **Route recommendation** per SOP: PASS → GATE_5 submission; BLOCKING → Team 61 remediation

---

## 9. Iron Rules Verification

| Rule | Check |
|------|-------|
| Classic `<script src>` only | No ES modules in agents_os/ui |
| agents-page-layout + agents-header | All 3 AOS pages |
| No backend Python modified | Scope: UI + seed script only (per LOD400) |

---

**log_entry | TEAM_61 | AOS_FEATURES_QA_REQUEST | SUBMITTED | 2026-03-16**
