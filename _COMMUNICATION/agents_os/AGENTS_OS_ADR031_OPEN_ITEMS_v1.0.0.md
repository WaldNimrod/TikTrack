# AGENTS_OS_ADR031_OPEN_ITEMS_v1.0.0

**project_domain:** AGENTS_OS
**from:** Team 100 (Strategic Reviewer)
**to:** Team 10, Team 170, Team 190
**cc:** Team 00, Nimrod
**date:** 2026-03-14
**status:** LOCKED — decisions recorded per Nimrod session 2026-03-14
**gate_id:** S002-P005-WP001 / GATE_1
**authority_basis:** Nimrod direct directives (session 2026-03-14) + ADR-031

---

## Context

This file records the resolution of all open questions from the architectural analysis of ADR-031 (Chief Architect "Mother Architect" mandate, 2026-03-14). Per Nimrod's standing instruction: open questions must be saved to Canonical Task Files — not left in analysis docs.

---

## Locked Decisions (from Nimrod session 2026-03-14)

### D-A: WSM/SSM as Primary Source of Truth (LOCKED)
**Question was:** Should agents_os continue to parse WSM/SSM as the source of truth, or build its own internal state model?

**Decision:** WSM + SSM remain the primary source of truth — always. Agents_OS must work fully and bindingly against them. If structural changes are needed to WSM/SSM to enable clean parsing, those changes are preferred over mapping hacks in the code.

**Implication for Stage A:** Fix `state_reader.py` to parse actual canonical field `active_stage_id` (not map or alias). Done: `AD-V2-01` fixed.

---

### D-B: D-04 Signer Chain — Stage C (LOCKED)
**Question was:** Has the Team 190 proposal for "Dual-Key Mediated Write" (D-04) been approved? Stage C is blocked without this.

**Decision:** APPROVED in principle. Nimrod's Zero-Trust principle + "WSM/SSM = canonical source" confirms:
- Routine execution-state updates: Nimrod signs (single key).
- Constitutional changes (stage/program/gate ownership/SSM): Team 00 co-sign required.
- Stage C (S004-P008) is unblocked to proceed when its time comes.

**Responsible:** Team 190 to issue formal D-04 approval confirmation to Team 00.

---

### D-C: POL-015 Location (LOCKED — finding archived)
**Question was:** Where is POL-015 (referenced in ADR-031 Stage A item: "GATE_7 ownership text fix per POL-015")?

**Finding:** POL-015 was not located in the repository. The ownership fix has been applied directly (GATE_7 owner: `team_00` → `team_90`) in all pipeline UI files as the canonical correction. POL-015 reference in ADR-031 is treated as a reference to the team roster canonical assignment (see `ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md`).

**Action completed:** GATE_7 owner fixed in `PIPELINE_DASHBOARD.html` (lines ~1003, ~1757) and `PIPELINE_ROADMAP.html` (GATE_CONFIG).

---

### D-D: Model B File Structure (DEFERRED → S003-P007)
**Question was:** What is the exact "Model B" file/path structure referenced in ADR-031 Stage B: "Path Realignment — sync engine file paths to Model B structure"?

**Status:** DEFERRED. This is Stage B work (S003-P007 scope). Model B has not been formally defined yet. Team 190 must author the Model B spec as part of S003-P007 intake (GATE_0/GATE_1).

**Action required (at S003-P007 activation):** Team 10 must request a Model B definition document from Team 190 / Team 00 before G3_PLAN can proceed.

---

### D-E: Artifact Validation Scope (LOCKED)
**Question was:** Which gates should have server-side artifact validation in `pipeline_run.sh pass`?

**Decision:** Server-side validation preferred at all gates where a specific artifact is expected. Initial implementation covers:
- `GATE_1`: requires `lld400_content` non-empty in pipeline_state.json
- `G3_PLAN`: requires `work_plan` non-empty in pipeline_state.json
- All others: bypass available via `--force` flag

**Principle:** Validation logic belongs in server-side scripts (not only UI), so the automated path enforces the same rules as the human path.

---

### D-F: Fast Track and Single-Fix Gate Paths (LOCKED — direction confirmed)
**Question was:** How do the "fast track" and "single fix" paths interact with the ADR-031 hardening work?

**Decision (Nimrod):** The current 14-gate full flow is the master template. Fast track and single-fix are variants of the same gate sequence using the same team roles and principles — just with a reduced subset of gates. These will be defined when the full flow is stable. No current blocking item.

---

## Remaining Open Items

| ID    | Description                                 | Owner       | Blocking? | Due           |
|-------|---------------------------------------------|-------------|-----------|---------------|
| OI-01 | Model B file structure definition           | Team 190    | Stage B   | S003-P007 intake |
| OI-02 | Formal D-04 approval confirmation doc       | Team 190    | Stage C   | Before S004-P008 activation |

---

## ADR-031 Stage A Completion Checklist

All Stage A items from ADR-031 — status as of 2026-03-14:

| Item | Description | Status |
|------|-------------|--------|
| A-1  | Parser determinism: `state_reader.py` searches `active_stage_id` | ✅ DONE (this session) |
| A-2  | Remove bad `operational_state` regex (AD-V2-02) | ✅ DONE (this session) |
| A-3  | Visual Desync Banner: show in UI when STATE_SNAPSHOT has missing fields | ✅ DONE — health warnings panel added to Dashboard |
| A-4  | GATE_7 ownership text fix: `team_00` → `team_90` in all UI files | ✅ DONE (this session) |
| A-5  | Artifact validation: `pipeline_run.sh pass` blocks if required artifacts missing | ✅ DONE (this session) |
| A-6  | Dashboard mandate section: hide entirely for non-mandate gates | ✅ DONE (this session) |
| A-7  | Pipeline state reset: double-advance GATE_0→GATE_2 rolled back to GATE_1 | ✅ DONE (this session) |
| A-8  | Auto-refresh: 30s → 5s in Dashboard + Roadmap | ✅ DONE (this session) |
| A-9  | Roadmap `escAttr` bug fix: Canonical Task Files now loads | ✅ DONE (this session) |
| A-10 | Roadmap layout overhaul: sidebar stats + validation + canonical files | ✅ DONE (this session) |
| A-11 | Stage/program conflict warning in Roadmap UI | ✅ DONE (this session) |
| A-12 | Gate Visual Map removed (was redundant with Roadmap tree) | ✅ DONE (this session) |
| A-13 | Accordion order: prompt first (primary), mandates below (contextual) | ✅ DONE (this session) |

**Stage A completion:** 13/13 items addressed. S002-P005-WP001 Stage A = READY FOR GATE_1 PASS.

---

**log_entry | TEAM_100 | ADR_031_OPEN_ITEMS | ALL_ITEMS_LOCKED_OR_DEFERRED | S002-P005-WP001 | 2026-03-14**
