# Portfolio Automation Snapshot

- Generated (UTC): `2026-03-19T01:55:29.470366+00:00`
- Validation: `FAIL`
- Errors: `2`
- Warnings: `1`

## Runtime (from WSM)

- active_stage_id: `S003`
- active_program_id: `NONE`
- active_work_package_id: `NONE`
- current_gate: `IDLE — awaiting next WP activation`
- next_required_action: `Activate S003-P011-WP001 (Dashboard Copilot) via ./pipeline_run.sh --domain agents_os. Activate S003-P003-WP001 (D39 User Preferences) for TikTrack test flight.`

## Portfolio Counts

- stages: `6`
- programs: `35`
- work_packages: `13`

## Roadmap (hierarchical)

**היררכיה:** שלב → תוכנית → חבילת עבודה (אינדנטציה = מיקום ברצף).
**דומיינים:** TikTrack, Agents_OS. כל תוכנית וחבילת עבודה משויכות לדומיין אחד.

### S001 — שלב 1 — Foundations Sealed | COMPLETED [SHARED]

    ├── **Program** `S001-P001` — Agents_OS Phase 1 | COMPLETE | domain: **AGENTS_OS**
        ├── **WP** `S001-P001-WP001` | CLOSED | gate: GATE_8 (PASS) | domain: **AGENTS_OS**
        └── **WP** `S001-P001-WP002` | CLOSED | gate: GATE_8 (PASS) | domain: **AGENTS_OS**

    └── **Program** `S001-P002` — Alerts POC | ACTIVE | domain: **TIKTRACK**
        └── **WP** `S001-P002-WP001` | IN_PROGRESS | gate: GATE_0 | domain: **TIKTRACK**


### S002 — שלב 2 — השלב הפעיל | ACTIVE [SHARED]

    ├── **Program** `S002-P001` — Agents_OS Core Validation Engine | COMPLETE | domain: **AGENTS_OS**
        ├── **WP** `S002-P001-WP001` | CLOSED | gate: GATE_8 (PASS) | domain: **AGENTS_OS**
        └── **WP** `S002-P001-WP002` | CLOSED | gate: GATE_8 (PASS) | domain: **AGENTS_OS**

    ├── **Program** `S002-P002` — MCP-QA Transition (Full Pipeline Orchestrator) | COMPLETE | domain: **TIKTRACK**
        └── **WP** `S002-P002-WP003` | CLOSED | gate: GATE_8 (PASS) | domain: **TIKTRACK**

    ├── **Program** `S002-P003` — TikTrack Alignment (D22+D33+D34+D35) | COMPLETE | domain: **TIKTRACK**
        └── **WP** `S002-P003-WP002` | CLOSED | gate: GATE_8 (PASS) | domain: **TIKTRACK**

    ├── **Program** `S002-P004` — Admin Review S002 | PLANNED | domain: **TIKTRACK**

    └── **Program** `S002-P005` — Agents_OS v2 Writing Semantics Hardening (ADR-031 Stage A) + UI Optimization | ACTIVE | domain: **AGENTS_OS**
        ├── **WP** `S002-P005-WP002` | CLOSED | gate: GATE_8 (PASS) | domain: **AGENTS_OS**
        └── **WP** `S002-P005-WP003` | IN_PROGRESS | gate: GATE_1 | domain: **AGENTS_OS**


### S003 — שלב 3 — Essential Data | PLANNED [SHARED]

    ├── **Program** `S003-P001` — Data Model Validator | COMPLETE | domain: **AGENTS_OS**
        └── **WP** `S003-P001-WP001` | CLOSED | gate: FAST_4 (PASS) | domain: **AGENTS_OS**

    ├── **Program** `S003-P002` — Test Template Generator | COMPLETE | domain: **AGENTS_OS**
        └── **WP** `S003-P002-WP001` | CLOSED | gate: FAST_4 (PASS) | domain: **AGENTS_OS**

    ├── **Program** `S003-P003` — System Settings (D39+D40+D41) | PLANNED | domain: **TIKTRACK**

    ├── **Program** `S003-P004` — User Tickers (D33) | PLANNED | domain: **TIKTRACK**

    ├── **Program** `S003-P005` — Watch Lists (D26) | PLANNED | domain: **TIKTRACK**

    ├── **Program** `S003-P006` — Admin Review S003 | PLANNED | domain: **TIKTRACK**

    ├── **Program** `S003-P007` — Agents_OS Command Bridge Lite (ADR-031 Stage B) | MERGED | domain: **AGENTS_OS**

    ├── **Program** `S003-P008` — Agents_OS Pipeline Governance Hardening | SUPERSEDED | domain: **AGENTS_OS**

    ├── **Program** `S003-P009` — Agents_OS Pipeline Resilience Package | COMPLETE | domain: **AGENTS_OS**
        └── **WP** `S003-P009-WP001` | CLOSED | gate: GATE_8 (PASS) | domain: **AGENTS_OS**

    ├── **Program** `S003-P010` — Agents_OS Pipeline Core Reliability | COMPLETE | domain: **AGENTS_OS**
        └── **WP** `S003-P010-WP001` | CLOSED | gate: SPRINT_ACTIVE | domain: **AGENTS_OS**

    └── **Program** `S003-P011` — Agents_OS Dashboard Copilot + Event-Driven | PLANNED | domain: **AGENTS_OS**


### S004 — שלב 4 — Financial Execution | PLANNED [SHARED]

    ├── **Program** `S004-P001` — Financial Precision Validator | PLANNED | domain: **AGENTS_OS**

    ├── **Program** `S004-P002` — Business Logic Validator | PLANNED | domain: **AGENTS_OS**

    ├── **Program** `S004-P003` — Spec Draft Generator | PLANNED | domain: **AGENTS_OS**

    ├── **Program** `S004-P004` — Executions (D36) | PLANNED | domain: **TIKTRACK**

    ├── **Program** `S004-P005` — Data Import (D37) | PLANNED | domain: **TIKTRACK**

    ├── **Program** `S004-P006` — Admin Review S004 | PLANNED | domain: **TIKTRACK**

    ├── **Program** `S004-P007` — Indicators Infrastructure | PLANNED | domain: **TIKTRACK**

    └── **Program** `S004-P008` — Agents_OS Mediated Reconciliation Engine (ADR-031 Stage C) | PLANNED | domain: **AGENTS_OS**


### S005 — שלב 5 — Trades/Plans | PLANNED [SHARED]

    ├── **Program** `S005-P001` — Analytics Quality Validator | PLANNED | domain: **AGENTS_OS**

    ├── **Program** `S005-P002` — Trade Entities (D29+D24) | PLANNED | domain: **TIKTRACK**

    ├── **Program** `S005-P003` — Market Intelligence (D27+D25) | PLANNED | domain: **TIKTRACK**

    ├── **Program** `S005-P004` — Journal & History (D28+D31) | PLANNED | domain: **TIKTRACK**

    └── **Program** `S005-P005` — Admin Review S005 | PLANNED | domain: **TIKTRACK**


### S006 — שלב 6 — Advanced Analytics | PLANNED [SHARED]

    ├── **Program** `S006-P001` — Portfolio State (D32) | PLANNED | domain: **TIKTRACK**

    ├── **Program** `S006-P002` — Analysis & Closure (D30) | PLANNED | domain: **TIKTRACK**

    ├── **Program** `S006-P003` — Level-1 Dashboards | PLANNED | domain: **TIKTRACK**

    └── **Program** `S006-P004` — Admin Review S006 FINAL | PLANNED | domain: **TIKTRACK**


## Errors

- Program S003-P007 has invalid status 'MERGED'
- Program S003-P008 has invalid status 'SUPERSEDED'

## Warnings

- Active program NONE not found in program registry
