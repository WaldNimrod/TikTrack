---
id: TEAM_00_S003_P012_WP002_TO_WP005_MANDATES_v1.0.0
historical_record: true
from: Team 00 (Nimrod — System Designer)
to: Team 61 (WP002/WP004/WP005), Team 61+170 (WP003 coordination), Team 51 (QA for all WPs)
cc: Team 100, Team 190
date: 2026-03-21
program: S003-P012 — AOS Pipeline Operator Reliability
status: ISSUED
trigger: Sequential — each WP opens upon prior WP GATE_8 PASS
meta_process: Direct mandates (pipeline_run.sh NOT used for these WPs themselves)---

# S003-P012 — WP002..WP005 Mandates

## §0 — Pre-conditions and Sequencing

```
S003-P012-WP001 (SSOT)          → currently ACTIVE → Team 61 + Team 190
S003-P012-WP002 (Prompts)       → opens when WP001 GATE_8 PASS
S003-P012-WP003 (Dashboard UI)  → opens when WP001 GATE_8 PASS (parallel to WP002)
S003-P012-WP004 (CI Foundation) → opens when WP002+WP003 GATE_8 PASS
S003-P012-WP005 (Testkit)       → opens when WP004 GATE_8 PASS
```

**Blocking pre-condition for any TikTrack or AOS feature WP:** WP001+WP002+WP003 ALL GATE_8 PASS.

---

## §1 — WP002 — Prompt Quality & Mandate Templates

**id:** S003-P012-WP002
**to:** Team 61
**trigger:** S003-P012-WP001 GATE_8 PASS
**KBs addressed:** KB-51, KB-55, KB-56, KB-57, KB-60, KB-61, KB-62, KB-64

### Scope

| Task | KB | File / Location |
|---|---|---|
| GATE_4 prompt — inject WP spec brief, D-pages, LOD200 ACs, prior-phase findings | KB-51 | `pipeline.py` — `_generate_gate4_prompt()` |
| `fail` command — add `--finding_type` to ALL generated prompts + OPERATING_PROCEDURES | KB-57 | `pipeline_run.sh`, all generated prompt templates |
| `--from-report PATH` flag — read `last_blocking_findings` from report file | KB-55 | `pipeline_run.sh` + `pipeline.py` |
| QA mandate template — add mandatory `FAIL_CMD: [one-liner]` field | KB-56 | `_generate_gate4_prompt()` + mandate template |
| Correction cycle prompt — full canonical mandate format (Identity Header + ACs + output artifacts) | KB-60 | `pipeline.py` — `_generate_remediation_mandate()` |
| Sequential correction protocol — per-finding step generation | KB-61 | `pipeline.py` — new `_generate_correction_step()` |
| Roster injection at routing decision points | KB-62 | mandate generation for all phases with routing decisions |
| Phase handoff report — inject prior-phase completion report path into next-phase mandate | KB-62 (part) | `_generate_cursor_prompts()` + all GATE_3/3.2 mandates |
| HITL boundary — mandatory section in all QA mandates | KB-64 | all QA mandate templates |
| 8-gate references in mandate templates — full audit + replace | TF-21 | all generated prompt strings |

### Acceptance Criteria

| # | AC |
|---|---|
| AC-01 | `./pipeline_run.sh --domain tiktrack fail "reason"` without `--finding_type` → descriptive error + valid types listed |
| AC-02 | `./pipeline_run.sh --domain tiktrack fail --finding_type code_fix_multi --from-report PATH` → reads `FAIL_CMD` or `last_blocking_findings` from file, uses as reason string |
| AC-03 | GATE_4 generated prompt for tiktrack WP contains: D-pages, process_variant, LOD200 spec brief, prior findings |
| AC-04 | Correction cycle prompt includes Identity Header (roadmap_id, stage_id, work_package_id, gate_id) |
| AC-05 | All QA mandates include mandatory section: "HITL: Nimrod NOT available..." |
| AC-06 | All QA mandates include `FAIL_CMD: [format]` field instruction |
| AC-07 | Roster excerpt (domain-filtered) injected into all phase 3.1 mandates |
| AC-08 | Phase 3.2 mandates include reference to prior-phase completion report path |
| AC-09 | 0 occurrences of "GATE_6", "GATE_7", "GATE_8" (old model) in generated prompts |
| AC-10 | All existing 125+ tests pass |
| AC-11 | 3+ new tests covering fail command UX improvements |

### Output artifact

`_COMMUNICATION/team_61/TEAM_61_S003_P012_WP002_PROMPT_QUALITY_DELIVERY_v1.0.0.md`
Includes: Identity header, AC-01..11 evidence, code diff summary, HITL/FAIL_CMD template samples.

---

## §2 — WP003 — Dashboard UI Stabilization

**id:** S003-P012-WP003
**to:** Team 61 (UI implementation) → Team 51 (QA session)
**trigger:** S003-P012-WP001 GATE_8 PASS (parallel to WP002)
**KBs addressed:** KB-43, KB-44, KB-45, KB-46, KB-47, KB-48, KB-49

### Scope — Part A: Team 61 UI Fixes

| Task | KB | Location | Priority |
|---|---|---|---|
| Light mode text readable — TikTrack domain (white-on-white) | KB-44 | `agents_os/ui/css/` — color vars + `.current-step-banner`, `.card-header` | IMMEDIATE |
| Quick Commands confirm dialog before pass/fail/approve | KB-46 | `agents_os/ui/js/` — quick-commands panel | IMMEDIATE |
| Expected Output Files card — canonical filenames per phase + existence check | KB-47 | `agents_os/ui/js/` — expected-outputs renderer | HIGH |
| Feature Spec card — load from `spec_path` file (fix fetch) | KB-43 | `agents_os/ui/js/` — spec loader | MEDIUM |
| Event Log — expandable rows + copy-to-clipboard per entry | KB-48 | `agents_os/ui/js/` — event-log renderer | MEDIUM |
| Gate Context card — evaluate: populate or remove | KB-45 | `agents_os/ui/js/` — gate-context card | LOW |

### Constitution Page — Truth Endpoint Integration

**New requirement (2026-03-21 decision):** The existing Constitution page must display:

| Field | Source | Display format |
|---|---|---|
| Current pipeline state | `pipeline_state_{domain}.json` | gate, phase, WP_id, domain, variant |
| WSM alignment status | `ssot_check` output | ✓ CONSISTENT / ⚠ DRIFT [field] |
| Active department roster | `program_department` from state | table: role → team |
| Gate routing table for current variant | GATE_META + _DOMAIN_PHASE_ROUTING | table per gate |
| System health | 3-state: GREEN/YELLOW/RED | banner at top |
| Current pending action | `next_required_action` from state | prominent text block |

**Teams page:** Must display current roster from `ARCHITECT_DIRECTIVE_TEAM_ROSTER_v3.0.0.md` (not hardcoded). Domain filter: tiktrack / agents_os / all.

**Monitor page:** Must show:
- All open WPs across both domains
- Current gate + phase per WP
- Last event timestamp + event type
- Pending human action indicator

### Acceptance Criteria

| # | AC |
|---|---|
| AC-01 | TikTrack domain — all text on Constitution/Monitor/Roadmap pages readable in current theme (contrast ratio ≥ 4.5:1) |
| AC-02 | Quick Commands: confirm dialog appears before pass/fail/approve. Shows current gate + action type. |
| AC-03 | Expected Output Files card: shows ≥1 expected file per current phase; each entry shows ✓/✗ based on file existence |
| AC-04 | Feature Spec card: loads and renders content from `spec_path` value in state when file exists |
| AC-05 | Constitution page displays all 6 truth fields (state, WSM alignment, department, routing, health, action) |
| AC-06 | Teams page: renders current roster from JSON/canonical source — not hardcoded |
| AC-07 | Monitor page: shows both domains' WP status |

### Part B — Team 51 QA Session

After Part A delivery, Team 51 runs a dedicated browser QA session across all 3 pages:
- Identity injection QA (KB-49): does WSM header / active WP / canonical routing render correctly?
- Output: `_COMMUNICATION/team_51/TEAM_51_S003_P012_WP003_DASHBOARD_QA_v1.0.0.md`
- Verdict: PASS (≤2 LOW findings) or FINDINGS_LIST (blockers → back to Team 61)

### Output artifacts

`_COMMUNICATION/team_61/TEAM_61_S003_P012_WP003_DASHBOARD_DELIVERY_v1.0.0.md`
`_COMMUNICATION/team_51/TEAM_51_S003_P012_WP003_DASHBOARD_QA_v1.0.0.md`

---

## §3 — WP004 — CI Quality Foundation

**id:** S003-P012-WP004
**to:** Team 61 (implementation) + Team 170 (schema approval) + Team 51 (QA)
**trigger:** WP002 AND WP003 both GATE_8 PASS
**KBs addressed:** KB-65, KB-66, KB-67, KB-68, KB-69
**Team 50 recommendations:** R1, R2, R3, R4, R5

### Scope

| Task | KB | Recommendation | Deliverable |
|---|---|---|---|
| Single SSOT gate mapping: `gates.yaml` → generates `GATE_ALIASES` (Python) + `LEGACY_GATE_TO_CANONICAL` (JS) | KB-66 | R2 | `agents_os_v2/config/gates.yaml` + codegen script |
| JSON schema contract for pipeline_state UI-read fields | KB-67 | R1 | `agents_os_v2/schemas/pipeline_state_ui_contract.json` + pytest validation |
| `--check` CI script exit 1 on drift | KB-65 | R3 | `agents_os_v2/tools/ssot_check.py` (already mandated in WP001 — validate + extend) |
| Simulation harness: `tests/fixtures/pipeline_scenarios/` | TF-15 | R4 | ≥5 scenario YAML files + harness runner |
| Canonical `state_reader` authority: agents_os_v2 only; agents_os/ = deprecated | KB-69 | — | deprecation marker + CI warning |
| Event contract schema for `pipeline_events.jsonl` | KB-68 | R5 | `agents_os_v2/schemas/event_contract.json` + sample validation |
| Background sync integration note (Team 101 placeholder) | §2.4 ADR | — | comment block in ssot_check.py |

### Acceptance Criteria

| # | AC |
|---|---|
| AC-01 | `gates.yaml` is single source; Python GATE_ALIASES and JS LEGACY_GATE_TO_CANONICAL are generated/validated from it |
| AC-02 | `pytest` validates pipeline_state fields against JSON schema on every test run |
| AC-03 | `python -m agents_os_v2.tools.ssot_check` exit 1 on injected drift (test proves it) |
| AC-04 | ≥5 pipeline scenario fixtures; simulation harness runs clean (0 failures) |
| AC-05 | `agents_os/observers/state_reader.py` marked DEPRECATED; CI emits warning if called |
| AC-06 | `pipeline_events.jsonl` entries validated against event contract schema in ≥1 test |
| AC-07 | All 125+ existing tests pass |
| AC-08 | ≥10 new tests covering CI/schema/harness scenarios |

### Output artifact

`_COMMUNICATION/team_61/TEAM_61_S003_P012_WP004_CI_FOUNDATION_DELIVERY_v1.0.0.md`

---

## §4 — WP005 — Validation Testkit

**id:** S003-P012-WP005
**to:** Team 61
**trigger:** WP004 GATE_8 PASS
**references:** TF-15 (monitor log)

### Scope — Three Stages

**Stage 1 — TRACK_FOCUSED pass-only (dummy WP)**
- Create a minimal dummy WP definition (`tests/fixtures/dummy_wp_focused.json`)
- Run full TRACK_FOCUSED flow: GATE_1→2→3→4→5 with AUTO_PASS on each
- All 5 gates must advance cleanly without any manual intervention
- Output: pytest test `test_track_focused_full_pass.py`

**Stage 2 — Correction cycle tests**
- GATE_4_FAIL → CORRECTION_CYCLE_BANNER generated → correction mandate canonical
- Correction step sent → GATE_4_PASS on re-run
- All `finding_type` values tested (9 types) — each generates valid fail command
- `--from-report` extracts reason from fixture report file
- Output: pytest test `test_correction_cycle_scenarios.py`

**Stage 3 — TRACK_FULL simulation**
- Teams 20/30/40 mandates generated correctly
- Phase 3.3 QA step present (team_50 routing)
- Phase handoff report injected into team_30 mandate
- Roster excerpt present in phase 3.1 mandate
- Output: pytest test `test_track_full_simulation.py`

### Acceptance Criteria

| # | AC |
|---|---|
| AC-01 | Stage 1: 5-gate TRACK_FOCUSED flow completes clean in CI (no manual steps) |
| AC-02 | Stage 2: all 9 finding_type values pass fail command validation |
| AC-03 | Stage 2: `--from-report` extracts reason from fixture file correctly |
| AC-04 | Stage 3: GATE_3/3.2 mandate for team_20 differs from team_30 mandate (not identical) |
| AC-05 | Stage 3: GATE_3/3.3 mandate routes to team_50 (not team_51) for tiktrack |
| AC-06 | Total new tests ≥ 30 across all 3 stages |
| AC-07 | All 125+ pre-existing tests still pass |
| AC-08 | CI pipeline runs all new tests on every PR to agents_os_v2 |

### Output artifact

`_COMMUNICATION/team_61/TEAM_61_S003_P012_WP005_TESTKIT_DELIVERY_v1.0.0.md`

---

## §5 — Completion Criteria for Entire S003-P012

**All 5 WPs GATE_8 PASS** → unlock next packages:
- S003-P004 (D33 User Tickers) — TikTrack
- S003-P011-WP003 (Role-Based Team Management) — AOS
- Any new TikTrack or AOS feature WP

**Validation test:** After all 5 WPs, run WP005 Stage 1-3 testkit as acceptance regression. All 30+ tests must pass. This is the **"pipeline readiness certificate"** for subsequent work.

---

**log_entry | TEAM_00 | S003_P012 | WP002_TO_WP005_MANDATES_ISSUED | PROMPT_QUALITY+DASHBOARD+CI+TESTKIT | 2026-03-21**
