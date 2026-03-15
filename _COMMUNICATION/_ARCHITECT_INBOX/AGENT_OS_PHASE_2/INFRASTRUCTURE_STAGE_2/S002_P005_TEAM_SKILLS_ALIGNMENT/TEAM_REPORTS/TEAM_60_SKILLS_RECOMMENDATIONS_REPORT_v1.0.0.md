---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_60_SKILLS_RECOMMENDATIONS_REPORT_v1.0.0
from: Team 60 (DevOps & Platform)
to: Team 190 (Constitutional Validator) / Architect review
cc: Team 10, Team 00, Team 100, Nimrod
date: 2026-03-15
status: SUBMITTED_FOR_ARCH_REVIEW
scope: Team 60 skill recommendation package for S002_P005 alignment
---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
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

- **TIKTRACK:** Backend (api/), UI (ui/), tests, migrations, market-data and GATE_7 evidence scripts.
- **AGENTS_OS / SHARED:** Pre-commit and quality infrastructure, cross-domain platform scripts, signing/evidence tooling when invoked for shared mandates (e.g. KB-017).
- **Authority (per TEAM_DEVELOPMENT_ROLE_MAPPING):** Infrastructure, runtimes, CI/CD, platform — all domains; creation and maintenance of pipelines; quality tooling configs (ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE §6, §7).

### Primary toolchain / runtime

- **Python:** api/venv, Black, Bandit, detect-secrets, pytest, scripts (Bash + Python).
- **Node/Vite:** ui/ (npm, Prettier, ESLint, vite build).
- **Automation:** `.pre-commit-config.yaml` (local hooks: unit tests, date-lint, process-functional-separation, bandit, detect-secrets, frontend build, Black, Prettier).
- **Evidence/runtime:** Shell and Python scripts for GATE_7 Part A (check_market_open_et.py, verify_g7_part_a_runtime.py, run_g7_cc01_v209_market_open_window.sh), signing (scripts/signing/), backend startup and log capture.

### Recurring blockers (from actual execution)

1. **Time-window evidence:** CC-01 requires runs in 09:30–16:00 ET; runs outside the window cause BLOCK and re-submission loops (e.g. v2.0.6 → v2.0.9).
2. **Scattered script ownership:** Many one-off scripts (G7, migrations, team_50 corroboration helpers) with no single “runbook” or skill that encodes when to run which script and with which env.
3. **Pre-commit vs CI parity:** Local pre-commit (Black, Prettier, pytest, bandit, detect-secrets, frontend build) is not fully mirrored in a single CI job definition; changes sometimes pass locally but CI expectations are unclear.
4. **Cross-domain ambiguity:** When a mandate is “SHARED” or “AGENTS_OS + TIKTRACK,” which scripts/repos to run and in what order is not always explicit, leading to rework.
5. **Token-heavy validation loops:** Long threads (GATE_7 evidence, KB-017 formatter) with repeated context reload and multiple “fix → validate → BLOCK” cycles.

---

## 2) Skill Options Table (minimum 5 options)

| # | Option name | What it solves | Benefits | Risks / tradeoffs | Impact | Effort | Token-saving estimate |
|---|-------------|----------------|----------|-------------------|--------|--------|------------------------|
| 1 | **Scheduled evidence run (cron/scheduler)** | CC-01 evidence must run in 09:30–16:00 ET; manual runs often outside window | Single scheduled job runs `run_g7_cc01_v209_market_open_window.sh` in window; log/JSON ready for Team 50/90 | Requires a runner in ET timezone or cron with TZ; ownership of that runner (Nimrod vs CI) must be clear | HIGH | MEDIUM | HIGH (avoids rerun threads) |
| 2 | **Team 60 runbook skill** | When to run which script (G7, migrations, corroboration, KB-*) and with which env | One place: “G7 evidence” → pre-flight + script path + log path; “KB formatter” → steps from mandate | Runbook must be kept in sync with scripts and mandates | HIGH | LOW | MEDIUM |
| 3 | **Pre-commit ↔ CI contract document** | Unclear whether CI runs same checks as pre-commit (Black, Prettier, pytest, bandit, etc.) | Single source of truth: list of checks and commands; CI and pre-commit aligned | Document and CI config must be updated together | MEDIUM | LOW | LOW |
| 4 | **Domain-scope checklist per mandate** | SHARED/AGENTS_OS mandates sometimes unclear which repo paths and scripts apply | Checklist: “For SHARED: run in repo X, paths A,B; for AGENTS_OS-only: paths C” | Needs Team 10/190 input to define and maintain | MEDIUM | MEDIUM | MEDIUM |
| 5 | **Evidence artifact template (JSON + report)** | G7 evidence handoffs (Team 60 → 50 → 90) require consistent JSON and report fields | Fill-in template reduces typos and missing fields; fewer BLOCKs for “wrong artifact” | Template must match current mandate (e.g. run_id, log_path, timestamp_utc) | MEDIUM | LOW | MEDIUM |
| 6 | **Lightweight “evidence ready” gate** | Avoid submitting evidence when pre-flight would fail (e.g. market closed) | Script or hook that checks e.g. `check_market_open_et.py` before generating report; optional “dry-run” for ET window | Adds one more step; only helps when gate is used consistently | LOW | LOW | LOW |

---

## 3) Priority Recommendation (Top 3)

1. **Scheduled evidence run (option 1)** — Highest impact on validation loops: admissible CC-01 evidence produced automatically in the correct ET window, reducing BLOCK → rerun → resubmit cycles and token-heavy threads.
2. **Team 60 runbook skill (option 2)** — Immediate win: single runbook (or Cursor rule/skill) that maps “G7 evidence,” “KB-017,” “migrations,” “corroboration” to exact commands and paths; less guesswork and fewer wrong-script runs.
3. **Evidence artifact template (option 5)** — Fast to implement; ensures JSON and report structure match what Team 90/50 expect, reducing BLOCKs for format/content.

---

## 4) Dependencies and Prerequisites

- **Option 1 (scheduled run):** Clarification from Nimrod/Team 10: where the job runs (local machine, GitHub Actions with cron, other CI), who owns the runner, and whether `api/venv` and backend port (e.g. 8083) are available in that environment.
- **Option 2 (runbook):** None beyond agreement to keep it in `documentation/` or `_COMMUNICATION/` and update when scripts or mandates change.
- **Option 5 (template):** Current G7 artifact schema (run_id, log_path, timestamp_utc, cc_01/02/04, pass_01/02/04) and report headings from latest Team 90 mandate; no new tooling.

---

## 5) Suggested Owner per Option

| Option | Suggested owner | Rationale |
|--------|-----------------|------------|
| 1 – Scheduled evidence run | Team 60 + Nimrod (approve runner and schedule) | Team 60 implements; Nimrod confirms environment and ET-window policy |
| 2 – Runbook skill | Team 60 | Owns scripts and pre-commit; can author and maintain runbook/skill |
| 3 – Pre-commit ↔ CI contract | Team 60 (with Team 61 if CI lives in AGENTS_OS) | Team 60 owns pre-commit config; CI may be Team 61 — joint doc |
| 4 – Domain-scope checklist | Team 10 + Team 190 | Process/scope authority; Team 60 consumes |
| 5 – Evidence artifact template | Team 60 | Produces artifacts; can own template and examples |
| 6 – “Evidence ready” gate | Team 60 | Optional wrapper around existing pre-flight script |

---

## 6) Open Clarification Questions

1. **Scheduled evidence run:** Is there an approved runner (local cron, GitHub Actions, other) in ET timezone that Team 60 can use for the G7 market-open script, and who is the authority for “approved environment”?
2. **AGENTS_OS vs TIKTRACK scripts:** For SHARED mandates (e.g. KB-017), should Team 60 assume execution only in the TikTrack Phoenix repo, or also in agents_os_v2/ (or other) when the mandate says SHARED?

---

## 7) Return Contract

- **overall_result:** SUBMITTED_FOR_ARCH_REVIEW  
- **top3_skills:** (1) Scheduled evidence run in 09:30–16:00 ET, (2) Team 60 runbook skill, (3) Evidence artifact template  
- **blocking_uncertainties:** Runner/timezone ownership for scheduled G7 evidence (option 1); scope of “SHARED” execution (TIKTRACK-only vs multi-repo).  
- **remaining_blockers:** NONE (assuming above clarifications are answered; Team 60 can proceed with options 2 and 5 without blocker)

---

log_entry | TEAM_60 | SKILLS_RECOMMENDATIONS_REPORT_v1.0.0 | SUBMITTED_FOR_ARCH_REVIEW | 2026-03-15
