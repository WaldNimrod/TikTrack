# Team 00 — S002-P005 Architectural Review & Decision Package
## TEAM_00_S002_P005_ARCHITECTURAL_REVIEW_v1.0.0.md

**project_domain:** AGENTS_OS
**from:** Team 00 (Chief Architect)
**to:** Nimrod (Program Authority), Team 190, Team 10
**cc:** Team 100
**date:** 2026-03-14
**status:** AWAITING_NIMROD_DECISIONS (3 open items)
**program_id:** S002-P005
**authority_basis:** ADR-031 + post-experiment system review

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP001 (to be created at activation) |
| gate_id | PRE-GATE_0 (architectural review) |
| phase_owner | Team 00 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | AGENTS_OS |

---

## 1. Context: What ADR-031 Specified vs What We Built

ADR-031 (2026-03-14, Gemini Chief Architect) defined Stage A as a **hotfix** before "Batch 3 of TikTrack." Since then, we completed S002-P002-WP003 (Market Data Provider Hardening) using a **substantially more capable** agents_os_v2 system. The experiment revealed both what works and what still needs hardening.

### 1.1 Delta: What's New Since ADR-031 Was Written

| Component | ADR-031 Assumed | Current Reality |
|---|---|---|
| Mandate generation | Manual per-team prompts | Generic Mandate Engine (MandateStep, phases, coord injection, correction cycles) |
| CLI interface | Basic pass/fail | `pipeline_run.sh` with 10+ subcommands incl. `phase*`, `route`, `revise`, `domain` |
| Dashboard | Simple gate display | Gate-aware mandate tabs, phase badges, prereq warnings, copy commands |
| GATE_8 correction cycle | Manual | Auto-routing + Team 90 blocker injection into correction prompt |
| Multi-domain | Single domain | Parallel tiktrack/agents_os pipelines with `--domain` flag |
| Parser determinism | `state_reader.py` guesses via regex | `pipeline.py` GATE_CONFIG is authoritative; state.py manages clean transitions |
| Desync concept | JSON ≠ Google Drive WSM | No Drive dependency; local state files + markdown governance |

### 1.2 Original Requirements vs Current Gap

| Req | Original Text (ADR-031) | Gap Analysis | Priority |
|---|---|---|---|
| R1 | Parser determinism — stop guessing active_stage_id | `state_reader.py` line 66: `re.search(r"current_stage_id[:\s|]+\s*(S\d+)"` — still fragile regex | **STILL NEEDED** |
| R2 | Visual Desync Guard — red banner if JSON ≠ WSM | Concept must be reframed (no Drive). New meaning: pipeline state vs. Program Registry | **REFRAME NEEDED** |
| R3 | GATE_7 ownership text fix per POL-015 | GATE_CONFIG has correct `owner` fields; Dashboard shows ownership | **DONE** (verify) |

---

## 2. Revised Requirements for S002-P005 Stage A

### R1 (PRESERVED): Parser Determinism
**File:** `agents_os_v2/observers/state_reader.py`
**Current issue:** `read_governance_state()` uses fragile regex on WSM markdown to extract `active_stage`. If WSM table format changes slightly, parser silently returns `None` — no error, just silent null.

**Required fix:**
- Replace regex with structured markdown table parser that validates field existence
- Add explicit fallback: if field not found → raise `StateReadError` (don't silently return None)
- Add cross-validation: compare WSM `stage_id` to `pipeline_state_*.json` `stage_id` → flag mismatch
- Output change: `STATE_SNAPSHOT.json` gets a `consistency_check` block with explicit pass/fail per field

**Acceptance:** `read_governance_state()` returns deterministic result or raises typed error; never silent null.

---

### R2 (REFRAMED): Local Desync Detection Guard
**Concept pivot:** "Desync" in our current system = `pipeline_state.json` says stage S002 + domain agents_os, but `PHOENIX_PROGRAM_REGISTRY` shows S002-P005 as `planned` (not `active`). This is the meaningful desync — pipeline is executing a program not yet marked active in governance.

**Required:** `state_reader.py` `build_state_snapshot()` to add:
```
"desync_check": {
  "pipeline_stage": "S002",
  "pipeline_domain": "agents_os",
  "pipeline_wp": "S002-P005-WP001",
  "registry_program_status": "planned|active|complete",
  "is_synced": true|false,
  "action_required": null | "update registry to active"
}
```

**Dashboard guard:** `PIPELINE_ROADMAP.html` reads STATE_SNAPSHOT.json; if `is_synced: false` → show amber banner in domain header: "⚠️ Pipeline state and Program Registry are out of sync — check state_reader output."

**Acceptance:** Desync detected automatically; no manual comparison needed.

---

### R3 (VERIFY + CLOSE): GATE_7 Ownership Text
**Current state:** `GATE_CONFIG["GATE_7"]["owner"]` = `"team_00"` (Nimrod personal sign-off). Dashboard `_get_engine()` reads this and displays it.

**Action:** Team 190 verifies that:
- `pipeline_run.sh approve` for GATE_7 shows correct owner text in terminal output
- PIPELINE_DASHBOARD shows "owner: team_00 [domain]" at GATE_7

If verified → **CLOSE R3 as DONE**, no code change needed.
If wrong → Team 10 micro-fix to GATE_CONFIG owner string.

---

### R4 (NEW): Program Lifecycle CLI Commands
**Context:** S002-P005 activation requires switching the agents_os domain pipeline to a new WP. There is currently no `pipeline_run.sh` command for "new program activation" — this is a gap discovered during the experiment.

**Required new subcommands in `pipeline_run.sh`:**

| Command | Action | State change |
|---|---|---|
| `./pipeline_run.sh new <PROGRAM_ID>` | Activate new program in current domain | Creates new state with WP={PROGRAM_ID}-WP001, gate=GATE_0 |
| `./pipeline_run.sh hold "reason"` | Pause active program | Records hold reason, saves state snapshot |
| `./pipeline_run.sh cancel "reason"` | Cancel program | Archives WP, marks state as CANCELLED |
| `./pipeline_run.sh revive` | Resume from hold | Restores state, returns to last gate |

**Note:** These commands form the CLI backbone for the Program Lifecycle UI (see TEAM_00_PROGRAM_LIFECYCLE_UI_SPEC_v1.0.0.md). Stage A implements `new` — the rest come in Stage B.

---

## 3. Open Decisions (Nimrod Input Required)

### DECISION D-A1: Desync Guard Scope

**Question:** What should trigger the "out of sync" banner?

| Option | Trigger Condition | Signal Quality | Overhead |
|---|---|---|---|
| **A (Recommended)** | pipeline_state.wp_id not in Program Registry active programs | High signal, meaningful | Low — one JSON read |
| B | pipeline_state.stage_id ≠ WSM active_stage | Medium signal, catches stage mismatch | Low |
| C | Both A + B + gate sequence validation | Maximum signal | Medium |

**Architect recommendation:** Option A. It catches the real problem (executing unregistered program) with minimal noise.

**→ Nimrod decision:** A / B / C / Other

---

### DECISION D-A2: D-04 Signer Chain — Team 190 Proposal

**Context:** Team 190 submitted a formal proposal (see `TEAM_190_TO_TEAM_00_ADR031_DECISION_LOCK_AND_SIGNER_CHAIN_PROPOSAL_v1.0.0.md`) for the WSM write path under ADR-031 Stage C.

**Proposed model:** Dual-Key Mediated Write:
1. UI writes to `proposed_updates.json` only (never direct WSM write)
2. Engine validates against SSM/Iron Rules
3. Team 90 generates normalization artifact + hash
4. Nimrod signs for routine updates
5. Team 00 co-sign required for constitutional changes (4 categories)

**Team 00 assessment:**
- ✅ Correct Zero-Trust approach — consistent with our principles
- ✅ Anti-friction guardrails are well-designed (no co-sign for routine ops)
- ✅ SLA hard-timeout rule is appropriate
- ⚠️ Stage C scope only — Stage A does NOT implement this; Stage A only adds validation checks
- ⚠️ "Hard timeout → item blocked but queue not frozen" requires Queue isolation logic in Stage C

**Architect recommendation:** APPROVE with one clarification: D-04 applies to Stage C only. Stage A proceeds without implementing the mediated write path — Stage A is read-only validation hardening.

**→ Nimrod decision:** APPROVE D-04 model / MODIFY (specify) / DEFER to Stage C

---

### DECISION D-A3: Program Lifecycle R4 — Scope in Stage A

**Question:** R4 introduces `pipeline_run.sh new <PROGRAM_ID>`. Should Stage A include R4 or defer it to Stage B?

| Option | Scope | Benefit | Risk |
|---|---|---|---|
| **A (Recommended)** | Include `new` command only in Stage A | Enables immediate S002-P005 self-activation + all future programs | Low — small CLI addition |
| B | Defer all lifecycle commands to Stage B | Keeps Stage A as pure hardening | Blocks immediate program activation flow |
| C | Include all 4 lifecycle commands in Stage A | Full lifecycle from day 1 | Higher scope for Stage A |

**Architect recommendation:** Option A — add `new` command in Stage A, defer hold/cancel/revive to Stage B. This unblocks the activation flow immediately and keeps Stage A focused.

**→ Nimrod decision:** A / B / C

---

## 4. Locked Scope (No Decision Needed)

Regardless of D-A1/D-A2/D-A3 decisions, the following is locked for Stage A:

| Item | Decision | Notes |
|---|---|---|
| R1 fix to state_reader.py | LOCKED | Structured parser, typed errors, no silent null |
| R2 desync check in STATE_SNAPSHOT | LOCKED | Implementation varies by D-A1 choice |
| R3 GATE_7 ownership verification | LOCKED | Team 190 verifies, closes if correct |
| stage_id = S002 | LOCKED | Stage A is in S002-P005 |
| project_domain = agents_os | LOCKED | Agents_OS domain only |
| GATE chain = standard (GATE_0 → GATE_8) | LOCKED | Fast-Track path (FAST_3 per SSM) |

---

## 5. Immediate Activation Path (After Nimrod Approves)

Once D-A1/D-A2/D-A3 are answered, activation is immediate:

**Step 1 — Team 10 creates pipeline state:**
```bash
python3 -c "
import sys; sys.path.insert(0, '.')
from agents_os_v2.orchestrator.state import PipelineState
s = PipelineState(
  work_package_id='S002-P005-WP001',
  project_domain='agents_os',
  stage_id='S002',
  spec_brief='ADR-031 Stage A: Writing Semantics Hardening',
  current_gate='GATE_0'
)
s.save()
print('State created:', s.work_package_id, '@', s.current_gate)
"
```

**Step 2 — Generate GATE_0 prompt:**
```bash
./pipeline_run.sh --domain agents_os gate GATE_0
```

**Step 3 — Normal pipeline flow from GATE_0:**
```bash
./pipeline_run.sh --domain agents_os pass  # after each gate
```

---

## 6. Pipeline Action

Awaiting Nimrod's decision on D-A1, D-A2, D-A3.

After decisions received:
- Team 00 issues LOD200 lock
- Team 190 issues activation mandate to Team 10
- Team 10 activates S002-P005-WP001 per Step 1-3 above

---

**log_entry | TEAM_00 | S002_P005_REVIEW | DECISIONS_PENDING_NIMROD | 2026-03-14**
