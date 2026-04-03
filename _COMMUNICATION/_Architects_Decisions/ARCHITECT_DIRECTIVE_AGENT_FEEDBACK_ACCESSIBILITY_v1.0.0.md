---
project_domain: SHARED
id: ARCHITECT_DIRECTIVE_AGENT_FEEDBACK_ACCESSIBILITY_v1.0.0
historical_record: true
from: Team 00 (Chief Architect — Nimrod)
date: 2026-03-19
status: LOCKED
type: IRON_RULE + ENFORCEMENT_MECHANISM---

# Architectural Directive — Agent Feedback Accessibility

## §1 — The Iron Rule

**Every finding, correction, or constraint identified during a gate review MUST be documented as a file accessible to downstream agent teams before the pipeline advances to the next gate.**

Chat output, terminal messages, or inline responses are NOT sufficient. AI agents executing downstream gates have no access to prior conversation history. If the information exists only in a chat response, it is effectively lost.

**Violation:** Issuing a GATE_2 "PASS" with a verbal correction (e.g., "api_key_count must not be persisted") without creating a file = the correction is invisible to Team 10 at G3_PLAN.

---

## §2 — Enforcement Mechanism (G3_PLAN Gate)

**File:** `agents_os_v2/orchestrator/pipeline.py` — `_generate_g3_plan_mandates()`

The G3_PLAN prompt generator automatically scans for:
```
_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_{WP_ID}_G3PLAN_DIRECTIVE*.md
```

If found, a **MANDATORY PRE-READ block** is injected at the top of the Phase 1 mandate, with file paths and the note: *"These are not optional — failing to incorporate them will cause GATE_5 rejection."*

**This means:** any Team 00 finding from GATE_2 that is written to the canonical directive file is automatically surfaced to Team 10 at G3_PLAN — no manual step required.

**Implemented:** 2026-03-19 (first use: BF-SPEC-01 for S003-P003-WP001)

---

## §3 — Protocol for Gate Reviews

When Team 00 or Team 100 reviews a gate and finds a blocking or corrective finding:

1. **Write the finding to a file** — before advancing the gate
2. **File naming convention:**
   - For Team 10 (G3_PLAN directives): `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_{WP_ID}_G3PLAN_DIRECTIVE_v{N}.0.0.md`
   - For other teams: use equivalent pattern under `_COMMUNICATION/team_00/`
3. **Then advance the gate** — the file will be picked up automatically at the next gate
4. **Log entry** in flight log or session notes referencing the file

**Never:** state a finding only in terminal/chat and then advance the gate.

---

## §4 — Scope

This rule applies to:
- All GATE_2 architectural reviews (findings → G3_PLAN directive)
- All GATE_6 reviews (findings → remediation mandates)
- Any gate where Team 00 or Team 100 issues corrections to downstream teams

---

## §5 — Future Extensions

The auto-injection pattern (§2) should be extended to other gates as the pipeline matures:
- GATE_6 → G3_REMEDIATION (Team 100 corrections → Team 10 remediation brief)
- GATE_1 → GATE_2 (Team 190 BF corrections → Team 100 review notes)

These extensions are out of scope for this directive; they are registered as improvement items.

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | AGENT_FEEDBACK_ACCESSIBILITY | IRON_RULE_LOCKED | ENFORCEMENT_IN_PIPELINE_PY | 2026-03-19**
