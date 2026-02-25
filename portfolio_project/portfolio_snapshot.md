# Portfolio Automation Snapshot

- Generated (UTC): `2026-02-25T20:48:42.457682+00:00`
- Validation: `FAIL`
- Errors: `1`
- Warnings: `0`

## Runtime (from WSM)

- active_stage_id: `S002`
- active_program_id: `S002-P001`
- active_work_package_id: `N/A`
- current_gate: `GATE_1`
- next_required_action: `Team 100 issues LLD400 activation to Team 170; Team 170 prepares and submits GATE_1 package to Team 190`

## Portfolio Counts

- stages: `6`
- programs: `3`
- work_packages: `2`

## Roadmap (hierarchical)

**היררכיה:** שלב → תוכנית → חבילת עבודה (אינדנטציה = מיקום ברצף).
**דומיינים:** TikTrack, Agents_OS. כל תוכנית וחבילת עבודה משויכות לדומיין אחד.

### S001 — שלב 1 — Foundations Sealed | COMPLETED [SHARED]

    ├── **Program** `S001-P001` — Agents_OS Phase 1 | COMPLETE | domain: **AGENTS_OS**
        ├── **WP** `S001-P001-WP001` | CLOSED | gate: GATE_8 (PASS) | domain: **AGENTS_OS**
        └── **WP** `S001-P001-WP002` | CLOSED | gate: GATE_8 (PASS) | domain: **AGENTS_OS**

    └── **Program** `S001-P002` — Alerts POC (per SSM §5.1) | HOLD | domain: **AGENTS_OS**


### S002 — שלב 2 — השלב הפעיל | ACTIVE [SHARED]

    └── **Program** `S002-P001` — Agents_OS Core Validation Engine | ACTIVE | domain: **AGENTS_OS**


### S003 — שלב 3 — Essential Data | PLANNED [SHARED]


### S004 — שלב 4 — Financial Execution | PLANNED [SHARED]


### S005 — שלב 5 — Trades/Plans | PLANNED [SHARED]


### S006 — שלב 6 — Advanced Analytics | PLANNED [SHARED]


## Errors

- Program gate mirror mismatch for S002-P001: mirror='GATE_0 (LOD200 concept submitted by Team 100; awaiting Team 190 feasibility validation 2026-02-24)' vs WSM current_gate='GATE_1'

