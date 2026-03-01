# Portfolio Automation Snapshot

- Generated (UTC): `2026-03-01T08:36:48.371651+00:00`
- Validation: `PASS`
- Errors: `0`
- Warnings: `0`

## Runtime (from WSM)

- active_stage_id: `S002`
- active_program_id: `S002-P003`
- active_work_package_id: `S002-P003-WP002`
- current_gate: `GATE_5 (DEV_VALIDATION — Team 90 owner)`
- next_required_action: `Team 10: coordinate remediation for BF-G5-001..004 (missing D34/D35 canonical artifacts), update evidence package, and re-submit GATE_5 validation request to Team 90.`

## Portfolio Counts

- stages: `6`
- programs: `11`
- work_packages: `5`

## Roadmap (hierarchical)

**היררכיה:** שלב → תוכנית → חבילת עבודה (אינדנטציה = מיקום ברצף).
**דומיינים:** TikTrack, Agents_OS. כל תוכנית וחבילת עבודה משויכות לדומיין אחד.

### S001 — שלב 1 — Foundations Sealed | COMPLETED [SHARED]

    ├── **Program** `S001-P001` — Agents_OS Phase 1 | COMPLETE | domain: **AGENTS_OS**
        ├── **WP** `S001-P001-WP001` | CLOSED | gate: GATE_8 (PASS) | domain: **AGENTS_OS**
        └── **WP** `S001-P001-WP002` | CLOSED | gate: GATE_8 (PASS) | domain: **AGENTS_OS**

    └── **Program** `S001-P002` — Alerts POC | PIPELINE | domain: **AGENTS_OS**


### S002 — שלב 2 — השלב הפעיל | ACTIVE [SHARED]

    ├── **Program** `S002-P001` — Agents_OS Core Validation Engine | COMPLETE | domain: **AGENTS_OS**
        ├── **WP** `S002-P001-WP001` | CLOSED | gate: GATE_8 (PASS) | domain: **AGENTS_OS**
        └── **WP** `S002-P001-WP002` | CLOSED | gate: GATE_8 (PASS) | domain: **AGENTS_OS**

    ├── **Program** `S002-P002` — Full Pipeline Orchestrator | PIPELINE | domain: **AGENTS_OS**

    └── **Program** `S002-P003` — TikTrack Alignment (D22+D34+D35) | ACTIVE | domain: **TIKTRACK**
        └── **WP** `S002-P003-WP002` | IN_PROGRESS | gate: GATE_5 (DEV_VALIDATION — Team 90 owner) | domain: **TIKTRACK** (active)


### S003 — שלב 3 — Essential Data | PLANNED [SHARED]

    ├── **Program** `S003-P001` — Data Model Validator | PLANNED | domain: **AGENTS_OS**

    └── **Program** `S003-P002` — Test Template Generator | PLANNED | domain: **AGENTS_OS**


### S004 — שלב 4 — Financial Execution | PLANNED [SHARED]

    ├── **Program** `S004-P001` — Financial Precision Validator | PLANNED | domain: **AGENTS_OS**

    ├── **Program** `S004-P002` — Business Logic Validator | PLANNED | domain: **AGENTS_OS**

    └── **Program** `S004-P003` — Spec Draft Generator | PLANNED | domain: **AGENTS_OS**


### S005 — שלב 5 — Trades/Plans | PLANNED [SHARED]

    └── **Program** `S005-P001` — Analytics Quality Validator | PLANNED | domain: **AGENTS_OS**


### S006 — שלב 6 — Advanced Analytics | PLANNED [SHARED]


