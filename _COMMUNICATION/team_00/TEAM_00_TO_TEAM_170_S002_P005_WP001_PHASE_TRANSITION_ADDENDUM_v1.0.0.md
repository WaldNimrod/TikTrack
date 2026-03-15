---
project_domain: AGENTS_OS
id: TEAM_00_TO_TEAM_170_S002_P005_WP001_PHASE_TRANSITION_ADDENDUM_v1.0.0
from: Team 00 (Chief Architect)
to: Team 170 (Spec & Governance Authority)
cc: Team 190
date: 2026-03-15
status: ADDENDUM — LLD400 v1.2.0 REQUIRED
gate_id: GATE_1
work_package_id: S002-P005-WP001
in_response_to: TEAM_170_S002_P005_WP001_LLD400_v1.1.0.md
priority: HIGH — spec gap before GATE_1 can advance
---

## Context

LLD400 v1.1.0 (BF-01 + BF-02 corrections) is acknowledged. A structural gap was identified in the WP001 scope during this session that was not present in v1.0.0 or v1.1.0. It must be captured as a new AC and MCP before GATE_1 can pass. No changes to existing AC-01..AC-09 or MCP-1..MCP-9 are required.

---

## Gap: GATE_1 Two-Phase Artifact Handoff is Invisible to the User

### What the user knows (from the Dashboard and pipeline UX)

```
Team 170 finishes Phase 1 (LLD400 written)
     ↓
User runs: ./pipeline_run.sh --domain <domain> phase2
     ↓
Team 190 prompt appears — ready to validate
```

That is the full mental model presented to the user. One command between Team 170 done and Team 190 start.

### What actually happens (current system)

```
Team 170 finishes Phase 1 — saves LLD400 to _COMMUNICATION/team_170/
     ↓
[HIDDEN STEP — not in UI, not in mandate]:
  User must run:
    ./pipeline_run.sh --domain <domain> store GATE_1 _COMMUNICATION/team_170/TEAM_170_..._LLD400_v1.N.md
  This populates pipeline_state.lld400_content from the file.
     ↓
User runs: ./pipeline_run.sh --domain <domain>  (or phase2)
     ↓
Team 190 Phase 2 prompt generated with lld400_content embedded
     ↓
If PASS: ./pipeline_run.sh pass  ← validation guard checks lld400_content (already stored: OK)
```

### Why this is a gap

1. The `store` step is invisible — it is not shown in the Dashboard, not in the phase prompt, and was only communicated via a technical mandate (now corrected).
2. In a correction cycle, if `store` is skipped, `./pipeline_run.sh pass` will block: `lld400_content is empty`. This is what happened in this session — the `pass` was blocked because `store` was never run for v1.0.0.
3. In a future automated system (agent-to-agent handoff), there must be NO hidden manual steps between Phase 1 agent completion and Phase 2 agent activation.

---

## Required Additions to LLD400 v1.2.0

### New MCP Scenario: MCP-10 — GATE_1 Phase 1→2 Auto-Handoff

Add to §6 MCP Test Scenarios table:

| ID | Precondition | Action | Expected Assertion |
|----|--------------|--------|--------------------|
| MCP-10 | Pipeline at GATE_1 (initial or correction cycle); Team 170 has saved `TEAM_170_{WP_ID}_LLD400_vN.M.md` to `_COMMUNICATION/team_170/`; `lld400_content` in pipeline state is empty or older than the file's version | User runs `./pipeline_run.sh --domain agents_os` (or `phase2`) | System auto-detects latest `TEAM_170_{WP_ID}_LLD400_v*.md` in `_COMMUNICATION/team_170/`; outputs `✅ Auto-stored: TEAM_170_{WP_ID}_LLD400_vN.M.md`; Phase 2 (Team 190) prompt contains updated LLD400 content; no separate `store` command required |

### New Acceptance Criterion: AC-10 — Phase Transition Auto-Store

Add to §7 Acceptance Criteria table:

| # | Criterion | Verification |
|---|-----------|--------------|
| AC-10 | When `./pipeline_run.sh phase2` (or no-arg) is run at GATE_1 and `lld400_content` in pipeline state is empty or version-stale, the system auto-detects the latest `TEAM_170_{WP_ID}_LLD400_v*.md` from `_COMMUNICATION/team_170/`, auto-stores its content to `lld400_content`, and generates the Phase 2 prompt with the updated content — without requiring a separate `./pipeline_run.sh store` command | Correction cycle test: save v1.1.0 to team_170, leave `lld400_content` empty, run `phase2` — assert `lld400_content` populated + Phase 2 prompt shows v1.1.0 content |

### §8 Proposed Deltas — Addition

Add to the `pipeline_run.sh` row in §8:

```
| `pipeline_run.sh` | R4: `new` command (existing) | R5: `phase2` (or no-arg at GATE_1) triggers auto-store of latest Phase 1 artifact before prompt generation; pattern: TEAM_170_{WP_ID}_LLD400_v*.md in _COMMUNICATION/team_170/ |
```

---

## Implementation Note (for Team 61, post-GATE_1)

The auto-store behavior (AC-10) is NOT part of WP001's implementation scope. WP001 covers Writing Semantics Hardening (state_reader, gate_integrity, new command). AC-10 describes required pipeline behavior that will be implemented by Team 61 in a subsequent WP.

**For now (pre-AC-10 implementation):** Nimrod must run `store` manually before `pass`. This is documented in the Phase 1 GATE_1 correction cycle mandate (`TEAM_00_TO_TEAM_170_...REVISION_MANDATE_v1.0.0.md`).

The LLD400 must capture AC-10 as a spec requirement so it does not get lost.

---

## Deliverable

**File:** `_COMMUNICATION/team_170/TEAM_170_S002_P005_WP001_LLD400_v1.2.0.md`

- Base: v1.1.0 (BF-01 + BF-02 already applied)
- Add: MCP-10 to §6
- Add: AC-10 to §7
- Add: R5 to `pipeline_run.sh` row in §8
- Update: `spec_version: 1.1.0 → 1.2.0`, `id`, `date: 2026-03-15`
- Update §9 No Guessing Declaration: update last line to reference this addendum

---

## Post-Submission (what Nimrod runs after v1.2.0 is saved)

```bash
# Step 1 — Store v1.2.0 into pipeline state (required until AC-10 is implemented)
./pipeline_run.sh --domain agents_os store GATE_1 _COMMUNICATION/team_170/TEAM_170_S002_P005_WP001_LLD400_v1.2.0.md

# Step 2 — Generate Team 190 prompt (embedded content will be v1.2.0)
./pipeline_run.sh --domain agents_os

# Step 3 — Run Team 190 (Phase 2) validation
# If PASS:
./pipeline_run.sh --domain agents_os pass
```

After AC-10 is implemented, Step 1 disappears — `./pipeline_run.sh --domain agents_os` handles everything.

---

**log_entry | TEAM_00 | S002_P005_WP001_PHASE_TRANSITION_ADDENDUM | ISSUED_TO_TEAM_170 | MCP10_AC10_PHASE_HANDOFF_GAP | 2026-03-15**
