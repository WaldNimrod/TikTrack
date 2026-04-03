---
id: TEAM_100_WP003_TIMING_ARCHITECTURAL_DECISION_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 00 (Nimrod — decision record)
cc: Team 11, Team 170, Team 101
date: 2026-03-21
type: ARCHITECTURAL_DECISION
domain: agents_os
status: DECIDED---

# Architectural Decision — WP003 Timing vs. TikTrack Test Flight
## S003-P011 | AOS Completion Round Sequencing

---

## §1 — Question

> האם לממש סבב השלמות נוסף של מערכת AOS (WP003) **לפני** החזרה לטיסת המבחן בדומיין TT, או **אחרי**?

---

## §2 — Items Under Review

### WP003 Candidate Scope (C1..C8 — deferred from WP002)

| ID | description | domain impact |
|---|---|---|
| C1 | Role catalog (`role_catalog.json`) | AOS only |
| C2 | UI roster-driven (replace hardcoded TEAMS array) | AOS only |
| C3 | TEAMS_ROSTER missing entries (team_11/101/102/191 identity files) | AOS (identity files created in GATE_5 Phase 5.1) |
| C4 | `.cursorrules` pipeline-aware update | AOS only |
| C5 | Engine editor role extension for per-gate routing | AOS only |
| C6 | WP-level override policy | AOS governance |
| C7 | Multi-channel context parity | AOS tooling |
| C8 | TRACK_FAST variant | AOS only |

### TikTrack Test Flight — What It Actually Needs

| requirement | source | status after WP002 GATE_5 |
|---|---|---|
| Auto-migration on `load()` (G3_PLAN → GATE_3) | KB-33 | ✅ Fixed by Team 61 as GATE_5 pre-condition |
| FAIL_ROUTING canonical gate IDs | KB-32 | ✅ Fixed by Team 61 |
| GATE_5 prompt correct (Team 70 for TikTrack) | KB-34 | ✅ Fixed by Team 61 |
| TRACK_FULL routing for TikTrack | CERT_02/05/09 | ✅ Already PASS in current CERT suite |
| TikTrack teams (10, 20, 30, 40, 50) in roster | Existing | ✅ Already registered — original teams |
| process_variant = TRACK_FULL in state | Manual setup | Requires one-time state setup for S003-P003-WP001 |

---

## §3 — Analysis

### Does any WP003 item unblock the test flight?

**No.** Verification:

- C1 (role_catalog): The test flight uses `_DOMAIN_PHASE_ROUTING` for routing — no role catalog lookup during execution.
- C2 (UI roster-driven): Dashboard hardcoded TEAMS array is cosmetic — pipeline routing is not affected.
- C3 (identity files): team_11/101/102/191 identity files are AOS teams — TikTrack test flight uses teams 10/20/30/40/50, all already registered.
- C4 (.cursorrules): Developer tooling — no runtime impact.
- C5 (engine editor extension): Role extension in UI — no pipeline routing impact.
- C6 (WP-level override): Policy governance — no implementation gate.
- C7 (context parity): Tooling — no routing impact.
- C8 (TRACK_FAST): Different variant — test flight uses TRACK_FULL.

**None of C1..C8 blocks or materially improves the TikTrack test flight.**

### Does running WP003 first add value before the test flight?

The test flight's primary purpose is to validate the pipeline as a system — routing, prompt generation, state management — end-to-end with real TikTrack work (S003-P003-WP001). WP003 adds AOS domain capabilities that are orthogonal to this validation.

Running WP003 first would:
- Delay the test flight by one full WP cycle (GATE_0 → GATE_5)
- Add AOS complexity without contributing to TT pipeline validation
- Create a dependency where none is needed

### Can WP003 run in parallel with the test flight?

Yes — they are fully independent:
- WP003 domain: AGENTS_OS (Team 11 gateway, Team 61 impl, Team 51 QA)
- Test flight domain: TIKTRACK (Team 10 gateway, Teams 20/30/40 impl, Team 50 QA)
- No shared resources, no shared implementation files

**Parallel execution is architecturally valid.**

---

## §4 — Decision

### DECISION: WP003 AFTER test flight. Parallel acceptable if resources allow.

**Sequence:**

```
WP002 GATE_5 PASS (Team 61 KB fixes + Team 170 governance closure + Team 90 Phase 5.2)
    ↓
TikTrack test flight — S003-P003-WP001 (System Settings D39+D40+D41)
  [Domain: TIKTRACK | Variant: TRACK_FULL | Teams: 10→20/30/40→50→90]
  [This is the real validation: end-to-end pipeline with production work]
    ↓ (parallel OK from here)
WP003 — AOS completion round
  [LOD200 by Team 101 | Domain: AGENTS_OS | Scope: C1..C8]
  [Trigger: WP002 GATE_5 PASS — already registered in PROGRAM_REGISTRY]
```

**If resources allow parallel start:** WP003 may begin LOD200 phase (Team 101 spec authorship) while the TikTrack test flight is at GATE_3 implementation. These are non-conflicting.

---

## §5 — What the Test Flight Validates (and What It Does Not)

### It WILL validate:
- KB-33 fix: auto-migration activates on TikTrack load
- KB-34 fix: GATE_5 generates correct Team 70 documentation closure prompt for TikTrack
- KB-32 fix: FAIL_ROUTING routes correctly when a gate fails
- TRACK_FULL end-to-end routing (CERT_02/05/09 in unit test → live confirmation)
- Dashboard correctly shows TikTrack domain state
- S003-P003-WP001 (System Settings) real work entering the pipeline

### It WILL NOT validate (WP003 scope):
- Role-based routing (C1/C5) — no role catalog in pipeline
- TRACK_FAST variant (C8) — different flow
- UI roster-driven display (C2) — cosmetic
- WP003 itself is the validation round for C1..C8

---

## §6 — Pre-Test-Flight Checklist (one-time setup, post-WP002 GATE_5)

| # | action | owner |
|---|---|---|
| 1 | Confirm `./pipeline_run.sh --domain tiktrack status` loads without error and auto-migrates `G3_PLAN` → `GATE_3/3.1` | Team 10 |
| 2 | Set `pipeline_state_tiktrack.json`: `work_package_id=S003-P003-WP001`, `stage_id=S003`, `process_variant=TRACK_FULL`, `spec_path` pointing to S003-P003 LOD200 | Team 11 / Team 100 |
| 3 | Confirm GATE_5 prompt for `--domain tiktrack` shows Team 70 documentation closure content (post-KB-34 fix) | Team 10 spot-check |
| 4 | Confirm Dashboard AOS shows GATE_5/5.1 and TikTrack shows GATE_3/3.1 simultaneously | Team 10 MCP snapshot |

---

**log_entry | TEAM_100 | WP003_TIMING_DECISION | AFTER_TEST_FLIGHT | PARALLEL_ACCEPTABLE | 2026-03-21**
