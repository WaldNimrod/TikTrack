# Canary Run Retrospective — S003-P013-WP001

**Version:** 1.0.0  
**Work package:** S003-P013-WP001 (D33 `display_name`)  
**Monitor:** Team 100  
**Process variant:** TRACK_FOCUSED  
**Dates:** 2026-03-22 — 2026-03-23  
**Result:** ALL GATES PASS (GATE_0–GATE_5)  
**Source flight log:** `_COMMUNICATION/team_00/monitor/FLIGHT_LOG_S003_P013_WP001_v1.0.0.md`

---

## §1 — Run Summary

| Field | Value |
|-------|-------|
| WP | S003-P013-WP001 |
| Scope | D33 `display_name` — API + UI canary |
| Outcome | All gates PASS |
| Monitor | Team 100 |
| pytest | 205 passed, 4 skipped (per H.2 metrics) |

---

## §2 — Deviations Encountered (16)

All rows from flight log §H.1 (COMPLETE). Expanded with lesson + prevention.

| ID | Gate | Sev | Description | Resolution | Lesson / prevention |
|----|------|-----|-------------|------------|---------------------|
| DEV-PRE-001 | PRE-RUN | HIGH | `ssot_check` tiktrack exit 1 — stale `pipeline_state_tiktrack.json` (S002) | Reset state + WSM row | Always reset state when opening new WP; automate WSM sync (FIX-101-02) |
| DEV-PRE-002 | PRE-RUN | MED | Team 190 V-12 vs WSM timing | Documented | Order WSM updates vs validation carefully |
| DEV-GATE0-001 | GATE_0 | MED | S003-P013 missing from program registry → stale prompt | Registry fix | GATE_0 governance pre-check (`pipeline.py`) before prompt |
| DEV-GATE0-002 | GATE_0 | LOW | TT domain dark in Agents OS UI | OPEN (KB-44) | UI theme backlog |
| DEV-WORKFLOW-001 | ALL | LOW | Guide required Nimrod paste | Resolved — Team 100 autonomous runs | Clarify operator vs monitor in docs |
| DEV-INFRA-001 | GATE_1 | CRIT | KB-74 DM false positive on “no DDL change” | `NO_SCHEMA_PATTERNS` in `data_model.py` | Any new DDL marker needs negation phrases |
| DEV-INFRA-002 | GATE_1 | CRIT | KB-75 pytest overwrote live `pipeline_state_tiktrack.json` | `conftest.py` session restore (`agents_os_v2/tests/conftest.py:30`) | Never `advance_gate` in tests without patch |
| DEV-GATE2-001 | GATE_2 | HIGH | Team 102 ran `pipeline_run.sh` (HITL violation) | Resolved + `_hitl_prohibition_block` (`pipeline.py:64-81`) | Prohibition in every prompt |
| DEV-GATE2-002 | GATE_2→3 | HIGH | WSM drift at transition | Manual sync | FIX-101-02 auto WSM |
| DEV-GATE2-003 | GATE_2 | LOW | Section D monitor gap | Documented | Flight log automation |
| DEV-GATE5-001 | GATE_5 | HIGH | GATE_5 two-phase mandates missing | `_generate_gate_5_mandates` (`pipeline.py:2705`) + `GATE_MANDATE_FILES` | Test two-phase gates with real WP |
| DEV-GATE5-002 | GATE_5 | HIGH | Team 90 saved to wrong path | Explicit `writes_to` in mandate | FIX-101-05 audit |
| DEV-GATE5-003 | GATE_5 | MED | Prereq popup blocked FAIL at 5.2 | `_isPassCmd` in `pipeline-commands.js:126-131` | Pass-only prereqs |
| DEV-GATE5-004 | GATE_5 | MED | Mandate tab wrong team at 5.2 | `getEffectiveVerdictTeam` (`pipeline-dashboard.js:1387`) | Single SSOT for team label |
| DEV-GATE5-005 | GATE_5 | MED | WSM showed GATE_5 after COMPLETE | Manual closure sync | FIX-101-02 |
| DEV-GATE5-006 | GATE_5 | LOW | `phase5_content` invalid field | `current_phase = '5.2'` (`pipeline_run.sh:1419`) | FIX-101-07 ordering |

---

## §3 — Bugs Found and Fixed (KB register + KB-84)

Summaries from `documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md` (S003-P013 section) plus **KB-84** from `_COMMUNICATION/team_00/TEAM_00_KB_UPDATES.md`.

| KB | Symptom | Root cause | Fix | Prevention |
|----|---------|------------|-----|------------|
| KB-72 | PASS at GATE_0 jumped to COMPLETE | `GATE_SEQUENCE` lacked GATE_0 (`pipeline.py:54`) | Add GATE_0 to sequence | Gate model changes need sequence audit |
| KB-73 | “No verdict” with valid raw JSON | `json_enforcer` fenced-only | Fallback regex + `json.loads` (`json_enforcer.py`) | Accept raw JSON at top of file |
| KB-74 | DM blocked “no DDL change” | `DDL` substring in LLD400 | `NO_SCHEMA_PATTERNS` expanded (`data_model.py`) | Pair DDL markers with negations |
| KB-75 | Live state corrupted by pytest | `advance_gate` → `save()` | `conftest.py` restore (`conftest.py:30-79`) | Session guard for domain state files |
| KB-76 | Verdict PASS not detected | Regex missed JSON `"decision"` / `**` | `extractVerdictStatus` patterns (`pipeline-dashboard.js:1909`) | Test new verdict formats against function |
| KB-77 | Wrong GATE_2 owner for TikTrack | `team_00` in config | `team_100` (`agents_os_v2/config.py`) | Align with GATE_SEQUENCE_CANON |
| KB-78 | GATE_2 missing full phase structure | Placeholder `_generate_gate_2_prompt` | **OPEN** — FIX-101-01 | Rewrite gate-2 generator |
| **KB-84** | Wrong gate advanced / stale clipboard | Bare `./pipeline_run.sh pass` | `_kb84_guard` (`pipeline_run.sh:421-537`); relaxed via `PIPELINE_RELAXED_KB84=1` | Operators use full precision command (`TEAM_00_KB_UPDATES.md`) |

---

## §4 — Architectural Decisions During the Run

| Decision | Why it matters | Code anchor |
|----------|----------------|-------------|
| HITL prohibition block | Stops agents from self-advancing (`DEV-GATE2-001`) | `pipeline.py:64-81` |
| `_generate_gate_5_mandates()` | Two-phase GATE_5 (doc team → Team 90) | `pipeline.py:2705` |
| `getEffectiveVerdictTeam()` | One algorithm for CSB, QAB, mandate tabs (`DEV-GATE5-004`) | `pipeline-dashboard.js:1387-1424` |
| Mandate section regex `## Team \\d+` | Reliable tab split | `pipeline-dashboard.js:711-717` |
| `extractVerdictStatus` CLOSURE_RESPONSE | Team 70/90 closure format | `pipeline-dashboard.js:1941-1944` |
| KB-84 extended to fail/route/phase | Same identifier discipline on all mutators | `pipeline_run.sh:1123`, `1253`, `1404` (KB-84 comment blocks) |
| `conftest.py` guard | pytest cannot corrupt monitored run | `agents_os_v2/tests/conftest.py:30` |
| `current_phase` not `phase5_content` | Valid `PipelineState` field | `state.py:52`; `pipeline_run.sh:1419` |
| GATE_5 active tab uses `current_phase === '5.2'` | Correct Team 90 highlight | `pipeline-dashboard.js:764-765` |

---

## §5 — Open Items FIX-101-01 through FIX-101-07

Source: `_COMMUNICATION/team_101/TEAM_100_TO_TEAM_101_CANARY_FINDINGS_DELEGATION_v1.0.0.md`.

| Fix | What it resolves | Verify after implementation | If not fixed |
|-----|------------------|----------------------------|--------------|
| FIX-101-01 | KB-78 — full GATE_2 phase routing | `pipeline_run.sh` at GATE_2 emits all phase steps; dashboard multi-tab | GATE_2 remains structurally wrong |
| FIX-101-02 | WSM auto-sync on advance | `pass` → `ssot_check` exit 0 without manual WSM | Drift every gate |
| FIX-101-03 | HITL in **all** prompts | Grep pipeline.py generators for prohibition text | Repeat self-advance incidents |
| FIX-101-04 | KB-84 on fail/route/phase | Blocked commands without identifiers | Wrong gate advances |
| FIX-101-05 | `writes_to` on all MandateSteps | Audit `MandateStep` objects | Wrong filenames (DEV-GATE5-002) |
| FIX-101-06 | Dashboard “Last updated” / refresh badge | Header shows timestamp; stale state visible | Operators trust stale UI |
| FIX-101-07 | phase2 ordering | `phase2` at GATE_5 regenerates after state to 5.2 | Wrong Phase 2 content in terminal |

---

## §6 — Canary Intelligence — Next Run Watchlist

1. **WSM sync automation** — confirm FIX-101-02 when landed; no manual `STAGE_PARALLEL_TRACKS` edits mid-run.
2. **GATE_2 phases** — after FIX-101-01, exercise all sub-phases (2.1–2.3) on a scratch WP.
3. **Team 90 GATE_5 path** — verify `writes_to` visible in mandate; scan picks up verdict file.
4. **HITL boundary** — spot-check generated prompts for `_hitl_prohibition_block` presence.
5. **Dashboard phase badges** — for every two-phase gate, confirm tab highlight matches `getEffectiveVerdictTeam` + `current_phase`.
6. **Flight log discipline** — automate reminders per gate (per H.3 “manual monitoring” finding).

---

**log_entry | TEAM_170 | CANARY_RETROSPECTIVE | S003-P013-WP001 | v1.0.0 | 2026-03-23**
