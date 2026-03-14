---
id: TEAM_61_TO_TEAM_51_AGENTS_OS_UI_OPTIMIZATION_QA_REQUEST_v1.0.0
from: Team 61 (Cloud Agent / DevOps Automation)
to: Team 51 (QA & Functional Acceptance)
cc: Team 100, Team 10, Team 90
date: 2026-03-10
status: QA_REQUESTED
in_response_to: TEAM_100_TO_TEAM_61_AGENTS_OS_UI_WORK_PACKAGE_LOD400_v1.0.0
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| task_id | AGENTS_OS_UI_OPTIMIZATION |
| gate_id | G3_PLAN |
| lod | 400 |
| decision | QA_REQUESTED |

---

## 1) QA Request

Team 61 has completed the Agents_OS UI Optimization work package (LOD400). Per LOD400 §0 and §9, Team 51 is requested to perform QA against the 14 Acceptance Criteria.

---

## 2) Reference Documents

- **Work package:** `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_61_AGENTS_OS_UI_WORK_PACKAGE_LOD400_v1.0.0.md`
- **Completion report:** `_COMMUNICATION/team_61/TEAM_61_AGENTS_OS_UI_OPTIMIZATION_COMPLETION_REPORT_v1.0.0.md`
- **Preflight evidence:** `_COMMUNICATION/team_61/TEAM_61_AGENTS_OS_UI_PREFLIGHT_URL_MATRIX_EVIDENCE_v1.0.0.md`

---

## 3) Test Environment Setup

```bash
# From repo root
python3 -m http.server 8090

# Open in browser:
# http://127.0.0.1:8090/agents_os/ui/PIPELINE_DASHBOARD.html
# http://127.0.0.1:8090/agents_os/ui/PIPELINE_ROADMAP.html
# http://127.0.0.1:8090/agents_os/ui/PIPELINE_TEAMS.html
```

---

## 4) Acceptance Criteria (QA Verification)

| AC | Criterion | QA Action |
|----|-----------|-----------|
| AC-01 | Yellow state-exception banner for S001-P002 (authorized) | Set pipeline state to S001-P002; verify yellow banner with authority ref |
| AC-02 | Red state-blocking banner when no exception | Simulate CLOSED stage with no AUTHORIZED_STAGE_EXCEPTIONS entry |
| AC-03 | Domain switch loads domain-specific file | Network tab: verify pipeline_state_tiktrack.json or pipeline_state_agentsos.json request |
| AC-04 | LEGACY_FALLBACK badge when fallback | Temporarily rename domain-specific file; verify badge appears |
| AC-05 | All 3 pages: identical header structure | Screenshot bundle — headers side by side |
| AC-06 | Sidebar 300px, agents-page-layout | CSS inspection on Dashboard and Roadmap |
| AC-07 | Program click → detail in sidebar | Click program in Roadmap; verify detail in right sidebar |
| AC-08 | Main column = domain selector + tree only | DOM inspection on Roadmap |
| AC-09 | No inline <style> | Code review: grep for <style> in HTML files |
| AC-10 | No inline <script> | Code review: verify only <script src="..."> |
| AC-11 | Health panel renders | Test with missing STATE_SNAPSHOT |
| AC-12 | Mandate accordion visibility | Test at GATE_1 vs mandate gate |
| AC-13 | Full smoke test | Load all pages; domain switch; core flows |
| AC-14 | Preflight URL 200 | curl each css/* and js/* file |

---

## 5) Deliverables Location

```
agents_os/ui/
├── PIPELINE_DASHBOARD.html
├── PIPELINE_ROADMAP.html
├── PIPELINE_TEAMS.html
├── css/
│   ├── pipeline-shared.css
│   ├── pipeline-dashboard.css
│   ├── pipeline-roadmap.css
│   └── pipeline-teams.css
└── js/
    ├── pipeline-config.js
    ├── pipeline-state.js
    ├── pipeline-dom.js
    ├── pipeline-commands.js
    ├── pipeline-booster.js
    ├── pipeline-help.js
    ├── pipeline-dashboard.js
    ├── pipeline-roadmap.js
    └── pipeline-teams.js
```

---

**log_entry | TEAM_61 | AGENTS_OS_UI_QA_REQUEST | HANDOFF | 2026-03-10**
