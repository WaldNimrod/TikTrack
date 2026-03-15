---
project_domain: TIKTRACK | AGENTS_OS
id: TEAM_50_SKILLS_RECOMMENDATIONS_REPORT_v1.0.0
from: Team 50 (QA & Fidelity)
to: Team 10 (Execution Orchestrator), Team 00 (Chief Architect)
cc: Team 190, Team 100, Nimrod
date: 2026-03-15
status: SUBMITTED_FOR_ARCH_REVIEW
scope: Team 50 skill recommendations for QA workflow acceleration, quality, and token efficiency
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | N/A |
| task_id | TEAM_SKILLS_DISCOVERY_AND_SUBMISSION |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | RECEIVING_TEAM |

---

## 1) Team Context

### Operating domain(s)
- **QA & FAV** for D22 (Tickers), D34 (Alerts), D35 (Notes)
- Scripts, E2E, FAV sign-off — **no Backend/Frontend implementation**

### Primary toolchain / runtime
- **Terminal:** Node.js (`g7-26bf-e2e-validation.test.js`, `g7-26bf-deep-e2e.test.js`), Python pytest (`tests/unit/`, `test_external_data_cache_failover_pytest.py`), bash API scripts (`run-tickers-d22-qa-api.sh`, `run-alerts-d34-fav-api.sh`, `run-notes-d35-qa-api.sh`, `run-user-tickers-qa-api.sh`), Vite build (`ui && npx vite build`)
- **MCP:** cursor-ide-browser (login, navigate, snapshot, click, fill, select_option, reload, console_messages)
- **Init:** `scripts/init-servers-for-qa.sh`, `scripts/fix-env-after-restart.sh`, `scripts/restart-all-servers.sh` per SERVERS_SCRIPTS_SSOT

### Recurring blockers (concrete execution reality)
1. **Server/env not ready** — runs start without prior health check; "BLOCKED — איתחול נדרש" cycles; TEAM_50_QA_RERUN_SOP §כלל קבוע exists but agent often skips or repeats discovery
2. **Generic 5xx feedback** — Team 20 gets "Failed to create ticker" without DEBUG detail; TEAM_50_QA_FAILURE_REPORTING_SOP mandates HTTP req/resp/repro but manual assembly is slow and inconsistent
3. **Fragmented test execution** — 26-BF, Deep E2E, 4+ API scripts, pytest, Vite build run separately; no single orchestrated entry with artifact collation
4. **MCP repetition** — each GATE_4 run: login → navigate → snapshot → CRUD → persistence → reload; same sequence every time, high token cost for repeated prompts
5. **Evidence scatter** — `console_logs.json`, `network_logs.json`, `test_summary.json` in `phase2-e2e-artifacts/`; QA report format (TEAM_50_QA_REPORT_FORMAT_STANDARD) filled manually

---

## 2) Skill Options Table

| # | Option Name | What It Solves | Benefits | Risks / Tradeoffs | Impact | Effort | Token Estimate |
|---|-------------|----------------|----------|-------------------|--------|--------|----------------|
| 1 | **qa-env-preflight-check** | Unclear if 8082/8080/Postgres ready before tests | Fail fast with clear message; avoid "BLOCKED איתחול" loops; single curl/health gate | Simple; if script path changes need update | HIGH | LOW | MEDIUM |
| 2 | **qa-test-orchestrator** | Fragmented runs (26-BF, Deep E2E, API scripts, pytest, Vite) | Single entry: `npm run qa:gate4` → preflight → all suites → artifact collation | Coupling to current script names/paths | HIGH | MEDIUM | HIGH |
| 3 | **failure-report-schema** | Manual assembly of HTTP req/resp/repro per TEAM_50_QA_FAILURE_REPORTING_SOP | Structured JSON output → paste-ready block for Teams 20/30; fewer back-and-forth | Schema drift if SOP changes | HIGH | LOW | MEDIUM |
| 4 | **mcp-qa-playbook-registry** | Repeated MCP sequences (login→alerts→CRUD→persistence) | Canonical playbooks: GATE_4_D34, GATE_4_ALERTS_CRUD; invoke by name | Playbook maintenance; RTL/refs can drift | HIGH | MEDIUM | HIGH |
| 5 | **evidence-by-path-builder** | Evidence scattered; manual mapping to verification spec | Parse test results → enforce `evidence-by-path` table (path, line, assertion) | Requires stable test output format | HIGH | MEDIUM | MEDIUM |
| 6 | **token-lean-qa-report** | Verbose report structure repeated each run | Findings-first compact profile + optional expanded appendix; TEAM_50_QA_REPORT_FORMAT_STANDARD compliance | Reduced readability for non-technical reviewers | MEDIUM | LOW | HIGH |
| 7 | **date-governance-assistant** | Date guessing in reports (2026-03-13 vs 2026-03-15) | UTC source + header autofill for TEAM_50_* reports | Same as Team 190: symptom fix without policy | MEDIUM | LOW | LOW |

---

## 3) Priority Recommendation (Top 3)

| Rank | Skill | Rationale |
|------|-------|-----------|
| **1** | qa-env-preflight-check | Immediate win; stops wasted runs on cold env; aligns with TEAM_50_QA_RERUN_SOP §1; LOW effort |
| **2** | failure-report-schema | Directly enables TEAM_50_QA_FAILURE_REPORTING_SOP; fewer Teams 20/30 revalidation loops; LOW effort |
| **3** | qa-test-orchestrator | Consolidates 6+ commands; ensures full Gate-4 coverage; artifact collation; MEDIUM effort, HIGH token saving |

---

## 4) Dependencies and Prerequisites

| Skill | Depends On | Prerequisite |
|-------|------------|--------------|
| qa-env-preflight-check | SERVERS_SCRIPTS_SSOT paths | None |
| qa-test-orchestrator | qa-env-preflight-check, existing scripts | npm/task wiring; artifact paths stable |
| failure-report-schema | TEAM_50_QA_FAILURE_REPORTING_SOP | SOP §2 fields as schema |
| mcp-qa-playbook-registry | cursor-ide-browser MCP | Playbook format defined |
| evidence-by-path-builder | Test output format | Jest/Node/pytest output convention |
| token-lean-qa-report | TEAM_50_QA_REPORT_FORMAT_STANDARD | Standard acceptance |
| date-governance-assistant | None | Team 190 policy alignment |

---

## 5) Suggested Owner per Option

| Option | Suggested Owner | Rationale |
|--------|-----------------|-----------|
| qa-env-preflight-check | Team 50 | QA-specific; reads SERVERS_SCRIPTS_SSOT |
| qa-test-orchestrator | Team 50 + Team 60 | Team 50 defines sequence; Team 60 if infra/CI integration |
| failure-report-schema | Team 50 | QA SOP ownership |
| mcp-qa-playbook-registry | Team 50 + Team 100 | Team 50 content; Team 100 if agents_os-wide |
| evidence-by-path-builder | Team 50 | QA evidence format |
| token-lean-qa-report | Team 50 | QA report format |
| date-governance-assistant | Team 190 / Team 100 | Shared governance; Team 190 baseline |

---

## 6) Open Clarification Questions

1. **SERVERS_SCRIPTS_SSOT:** Is `documentation/docs-system/01-ARCHITECTURE/SERVERS_SCRIPTS_SSOT.md` (or `documentation/01-ARCHITECTURE/SERVERS_SCRIPTS_SSOT.md`) the canonical source? Archive has legacy path.
2. **MCP playbook location:** Should playbooks live under `_COMMUNICATION/team_50/playbooks/` or a shared agents_os path?

---

## 7) Return Contract

| Field | Value |
|-------|-------|
| **overall_result** | SUBMITTED_FOR_ARCH_REVIEW |
| **top3_skills** | 1. qa-env-preflight-check 2. failure-report-schema 3. qa-test-orchestrator |
| **blocking_uncertainties** | NONE |
| **remaining_blockers** | NONE |

---

**log_entry | TEAM_50 | SKILLS_RECOMMENDATIONS_REPORT | SUBMITTED_FOR_ARCH_REVIEW | 2026-03-15**
