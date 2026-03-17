---
project_domain: SHARED
id: TEAM_101_IDEA_039_GATE_TERMINOLOGY_CANONICALIZATION_v1.0.0
from: Team 101 (IDE Architecture Authority)
to: Team 100, Team 00
date: 2026-03-17
status: PROPOSED_IDEA
type: ARCHITECTURAL_DEBT_REMEDIATION
target_stage: S003+
---

# IDEA-039: Terminology Canonicalization (Gates & CLI Commands)

## 1. The Problem: Gate Naming Drift
The original system architecture defined a strict, clean sequence: `GATE_0` through `GATE_8`. 
Over time, organic development and the transition to V2 caused severe naming drift, particularly around the implementation phase. We now have inconsistent naming conventions such as:
- `G3_PLAN` (violates GATE_X prefix)
- `G3_5` (violates integer mapping and GATE_X prefix)
- `G3_6_MANDATES` (mixed terminology)
- `CURSOR_IMPLEMENTATION` (completely breaks the numbered gate abstraction)
- `WAITING_GATE2_APPROVAL` (mixes state-status with gate-identity)

This drift breaks regex parsers, confuses operators, and complicates the state machine's logic.

## 2. Proposed Solution for Gates (S003+)
Normalize the entire state machine back to a strict, predictable format.

**Potential Approaches:**
1. **Strict Re-numbering:** Rename everything back to `GATE_0` through `GATE_X` (e.g., expanding the total number of gates to 12).
2. **Sub-Gate Standardization:** Adopt a strict `GATE_3.1`, `GATE_3.2` convention for sub-phases, enforced at the Python class level.
3. **State vs. Gate Separation:** A gate should only be `GATE_3`. The *status* within the gate (e.g., `PLANNING`, `IMPLEMENTING`, `VALIDATING`) should be tracked in a new `current_phase` field, rather than baking the phase into the Gate ID itself.

## 3. The Problem: CLI Command Terminology Overload
The pipeline orchestration commands currently overload validation terminology with workflow progression terminology. 
For example, `./pipeline_run.sh pass` is used both to record a successful QA validation AND to signal that code implementation is finished. A developer does not "pass" an implementation, they "complete" it. This confuses both human operators and LLM agents reading the instructions, causing conceptual drift.

## 4. Proposed CLI Terminology Solutions (S003+)
Separate "Action/Execution" verbs from "Decision/Validation" verbs:
1. **Universal Progression Verbs:** Replace `pass`/`fail` with generic progress verbs like `advance` and `block` (or `return`).
2. **Context-Aware Verbs (Recommended):** 
   - At Execution gates (e.g., coding, planning): Operator runs `complete` or `submit`.
   - At Validation gates (e.g., QA, Team 90): Operator runs `pass` or `block`.
   - At Human gates: Operator runs `approve` or `reject`.