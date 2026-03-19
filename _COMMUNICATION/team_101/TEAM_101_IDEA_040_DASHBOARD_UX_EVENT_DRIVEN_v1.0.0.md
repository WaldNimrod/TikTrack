---
project_domain: SHARED
id: TEAM_101_IDEA_040_DASHBOARD_UX_EVENT_DRIVEN_v1.0.0
from: Team 101 (IDE Architecture Authority)
to: Team 100, Team 00
date: 2026-03-17
historical_record: true
status: PROPOSED_IDEA
type: ARCHITECTURAL_EVOLUTION
target_stage: S003+
---

# IDEA-040: Dashboard UX Revolution & Event-Driven Architecture

## 1. The Core Problem
The current Agents_OS Dashboard is a "passive viewer" of pipeline JSON states. It requires the operator to possess deep knowledge of the CLI (`pipeline_run.sh`) to advance states, handle phases, and route failures. Inexperienced users frequently get stuck ("What is my next step?", "Why didn't the UI update after I ran a script?").

## 2. Pillar 1: Idiot-Proof UX/UI
The Dashboard must transition from a "status board" to an **Active Guided Copilot**:
- **Explicit Next Actions:** The UI must explicitly state: "Copy this command and run it in your terminal" or "Paste this prompt into Team X".
- **Validation UI:** Visual feedback for successes and failures, preventing the user from guessing why a gate is blocked.
- **Phase Awareness:** The UI must track sub-phases natively so the user isn't blind during multi-team execution gates.

## 3. Pillar 2: Event-Driven `_COMMUNICATION` Watcher
The bottleneck of requiring manual `./pipeline_run.sh pass` or `phase2` commands must be eliminated.
- **Concept:** The AOS server should actively watch the `_COMMUNICATION/` directory for file system events.
- **Execution:** When Team 20 writes `TEAM_20_..._API_VERIFY.md`, the system detects it, fires an event, automatically updates the pipeline state to Phase 2, and pushes the new state to the Dashboard via WebSockets/SSE.

## 4. Pillar 3: Deterministic Agent Feedback (JSON)
To support the Event-Driven architecture, agents cannot return free-text Markdown that requires human interpretation or brittle regex parsing.
- **Concept:** Teams (like QA Team 50) must output their final verdict as a strict JSON artifact (e.g., `TEAM_50_QA_VERDICT.json`).
- **Execution:** The Event-Driven watcher reads the JSON, sees `{"status": "FAIL", "blockers": [...]}`, and automatically routes the pipeline backward, updating the UI instantly.

## 5. Pillar 4: Strict Gate / Phase Separation (The "QA Split-Brain" Fix)
**The Problem:** Currently, `pipeline.py` incorrectly bundles Team 50 (QA) into the `G3_6_MANDATES` / `CURSOR_IMPLEMENTATION` execution phase. This breaks the UI because execution gates do not have `FAIL_ROUTING` (causing the system to freeze if QA fails during execution).
- **Execution:** In S003+, `_generate_mandates()` in `pipeline.py` MUST be restricted to execution teams only (Teams 20, 30, 61). Team 50 MUST be entirely removed from Phase 3 of implementation.
- **Flow:** Execution teams finish → operator clicks Complete (`pass`) → pipeline transitions to `GATE_4` → ONLY THEN is Team 50 activated with full UI support for `PASS/FAIL` validation routing.

## 6. Pillar 5: Pre-LLM Auto-Correction (Token Waste Prevention)
**The Problem:** The pipeline frequently wastes massive amounts of tokens and human time bouncing artifacts back and forth (BLOCK_FOR_FIX) purely due to stale dates in the Mandatory Identity Header. Using a high-tier LLM to validate today's date is an architectural anti-pattern.
**Execution:** Implement silent auto-correction in the orchestrator. Before an artifact is sent to Team 90/190 for validation, a lightweight Python/Bash pre-flight hook should regex-find the `date` field in the header and automatically overwrite it with today's canonical date (`date -u +%F`). LLMs should only validate logic and scope, not timestamps.

## 7. Pillar 6: Universal 3-Tier Resolution & Manual Routing UX
**The Problem (Context from S003-P009-WP001 Test Flight):** When a validation gate (e.g., GATE_5) fails but the orchestrator cannot automatically locate the verdict file due to naming drift, the pipeline falls back to a `MANUAL ROUTING REQUIRED` state. The current Dashboard UI is completely blind to this sub-state, leaving the user stuck at the failed gate without presenting the required routing actions (`route doc` vs `route full`).
**Execution:** 
1. **Backend:** Expand the "3-Tier File Resolution" strategy to `pipeline.py`'s `_verdict_candidates()` function so it auto-discovers verdict files robustly using recursive globs and `mtime`, rather than hardcoded paths.
2. **Frontend:** If auto-routing fails, the Dashboard MUST intercept the `MANUAL ROUTING REQUIRED` state and explicitly render "Routing Required" action buttons ("Route: Artifacts Only" / "Route: Full Cycle") to unblock the user seamlessly.

---

**Strategic Decision (Team 00):** These pillars will be the primary focus of the next major UI/UX iteration for the Agents_OS platform.

**log_entry | TEAM_101 | IDEA_040 | UNIVERSAL_RESOLUTION_AND_ROUTING_UX_ADDED | 2026-03-18**
## 8. Pillar 7: Remediation Mandate Engine (The "Wrapper" Anti-Pattern Fix)
**The Problem (Context from S003-P009-WP001 Test Flight):** When a validation gate fails, the pipeline routes back to execution but generates a "wrapper" prompt that points to the original, full-scope implementation mandate. This causes the execution agent to ignore the specific bug fixes and attempt to rewrite the entire feature from scratch.
**The Decision (Team 00, 2026-03-18):** The default remediation flow must be direct. The validator (e.g., Team 90) becomes the local router. The pipeline must automatically generate a focused remediation mandate and route it directly to the relevant execution team(s) (e.g., Team 61), bypassing Team 10. The concept of a `G3_REMEDIATION` gate involving Team 10 is deferred as a future feature for complex, multi-team coordination deadlocks only.
**Execution:**
1. **Backend:** Enhance `pipeline.py`'s `_generate_cursor_prompts` and `pipeline_run.sh`'s `revise` command.
2. **Data Flow:** When routing from a `FAIL` with `route: doc`, the pipeline must call a new `_generate_remediation_mandate()` function.
3. **Logic:** This function will parse the `blocking_findings` from the failed gate's verdict file and construct a new, focused mandate containing ONLY the tasks required to fix the specified blockers, explicitly forbidding a full rewrite. This mandate will be stored in a separate artifact (e.g., `remediation_mandates.md`).

**Architectural Note (Team 00):** The above is a high-level concept. A full LOD400 will be required before implementation, detailing all edge cases (e.g., multi-team impact scope, dependency management in remediation, etc.).

---
**log_entry | TEAM_101 | IDEA_040 | REMEDIATION_MANDATE_ENGINE_CONCEPT_LOCKED | 2026-03-18**