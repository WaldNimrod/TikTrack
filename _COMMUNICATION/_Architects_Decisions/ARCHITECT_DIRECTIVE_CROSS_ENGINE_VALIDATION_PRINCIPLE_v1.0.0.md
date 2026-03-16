---
directive_id:  ARCHITECT_DIRECTIVE_CROSS_ENGINE_VALIDATION_PRINCIPLE_v1.0.0
author:        Team 00 — Chief Architect
date:          2026-03-16
status:        LOCKED — Iron Rule
authority:     Team 00 constitutional authority + Nimrod confirmation
applies_to:    ALL teams, ALL gate transitions, ALL validation steps
---

# Architectural Directive — Cross-Engine Validation Principle
## Foundational Pipeline Design Principle — IRON RULE

---

## The Principle

**LLM output is statistical. Statistical processes always contain errors.**

**Therefore: every LLM action MUST be validated by a different agent — with strong preference for a different engine and a different environment.**

---

## Why This Exists

An LLM generating output is a probabilistic process. No matter how well-prompted:
- There is always a non-zero probability of factual error
- There is always a non-zero probability of logical inconsistency
- There is always a non-zero probability of hallucination
- There is always a non-zero probability of instruction drift

An LLM validating its own output **does not reduce the error probability** — the same statistical biases apply to both generation and self-review.

**The solution:** a different model, different provider, different context → statistically independent error profile → errors in the first output are detectable by the validator.

---

## The Gate Model = This Principle Expressed as Process

The entire gate model is a direct implementation of this principle:

```
GATE_3/4: Team 61 (Cursor) implements code
    ↓
GATE_4: Team 51 (Gemini) runs QA tests
    ↓
GATE_5: Team 190 (OpenAI) validates constitutional integrity
    ↓
GATE_6: Team 90 (OpenAI) does full functional review
    ↓
GATE_7: Nimrod (human) gives final UX approval
```

Each step = a different engine reviewing the previous engine's work.
This is not bureaucracy. **This is error correction.**

---

## Canon: Validation Chain by Output Type

| Output Type | Primary Producer | Validator | Engine Difference |
|-------------|-----------------|-----------|-------------------|
| Implementation code | Team 61 (Cursor) | Team 51 (Gemini QA) | Cursor → Gemini ✅ |
| Architecture spec / LOD200 | Team 100 (Gemini) | Team 190 (OpenAI) | Gemini → OpenAI ✅ |
| Documentation / LLD400 | Team 170 (Gemini) | Team 190 (OpenAI) | Gemini → OpenAI ✅ |
| Full functional review | Team 90 (OpenAI) | Team 00 / Nimrod | OpenAI → Human ✅ |
| Constitutional validation | Team 190 (OpenAI) | Team 00 / Nimrod | OpenAI → Human ✅ |
| WSM / state file updates | Team 10/170 (Gemini) | Team 190 (OpenAI) at GATE_0 | Gemini → OpenAI ✅ |

---

## Iron Rules Derived from This Principle

### IR-CEV-01: No Self-Validation
A team that produced an artifact may NOT be the primary validator of that artifact.
**No exceptions.** If no other validator is available → escalate to Team 00.

### IR-CEV-02: Engine Preference for Cross-Validation
When assigning validators, prefer agents running on a **different LLM engine** than the producer.
Acceptable fallback: different environment/context on same engine family.
Unacceptable: same engine, same system prompt, same session.

### IR-CEV-03: Human Gate Preserved
GATE_7 (Nimrod) is a **guaranteed human validation point** regardless of automation level.
In Mode 3 (full automation), GATE_7 is never bypassed.
GATE_2 (architectural approval) requires Team 00 / Nimrod sign-off.
These are the two human checkpoints that exist regardless of Mode.

### IR-CEV-04: Validation Must Produce Structured Output
A validation that does not produce a machine-readable verdict is not a valid validation.
All validators output the canonical verdict format:
```
verdict:       PASS | FAIL | BLOCK
gate_id:       GATE_X
findings:      [...]
severity_map:  { blocker: N, high: N, medium: N, low: N }
```

### IR-CEV-05: D-4 WP Flow Must Include Validation Gates
Per Nimrod's decision (2026-03-16): **no work package advances without QA/validation at each stage.**
WP004 flow (and all future WPs):
```
Team 00 + Team 100: write spec / skeleton
    ↓ [GATE_0 Team 190 validates]
Team 61: implements
    ↓ [GATE_4 Team 51 QA validates]
Team 51: QA PASS
    ↓ [GATE_5 Team 190 constitutional validates]
Team 190: validates
    ↓ [GATE_6 Team 100 architectural review]
Team 100: reviews
    ↓ [GATE_7 Nimrod approves]
Nimrod: approves
```

---

## Validation Circle — Canonical Operational Flow (IR-VAL-01)

**IR-VAL-01** is the operational implementation of this principle. It describes the execution cycle that every team-level action must follow. This is the base layer — it sits below all gate-specific protocols.

```
IRON RULE — IR-VAL-01: Validation Circle (Nimrod, 2026-03-16)

  ┌──────────────────────────────────────────────────────────────┐
  │  1. Team executes artifact (code / spec / document / update) │
  │          ↓                                                   │
  │  2. Team submits to a DIFFERENT team for validation          │
  │          ↓                                                   │
  │  3. Validator returns canonical structured verdict:          │
  │     { verdict: PASS | FAIL | BLOCK, findings: [...] }        │
  │          ↓                                                   │
  │  4A. PASS  → executing team triggers next pipeline stage     │
  │  4B. FAIL/BLOCK → executing team corrects + resubmits        │
  │          (no counter-arguments — accept verdict, fix, retry) │
  └──────────────────────────────────────────────────────────────┘

This is the base layer. Above it: each gate has its own specifics.
Below it: nothing. This IS the foundation.
```

**Key constraints:**
- Step 4B corrections go back to Step 1 — a new complete artifact, not a patch argument
- No team may validate its own output (enforced by IR-CEV-01)
- No stage advances without a structured verdict (enforced by IR-CEV-04)
- Human (Nimrod) participates at GATE_2 and GATE_7 only — all other gates are AI-to-AI

**Canonical team roster for the validation circle:**
| Producing Team | Default Validator | Engine Cross |
|----------------|-------------------|--------------|
| Team 61 (Cursor) | Team 51 (Gemini QA) | ✅ Cursor → Gemini |
| Team 10 (Gemini) | Team 190 (OpenAI) | ✅ Gemini → OpenAI |
| Team 100 (Gemini) | Team 190 (OpenAI) | ✅ Gemini → OpenAI |
| Team 170 (Gemini) | Team 190 (OpenAI) | ✅ Gemini → OpenAI |
| Team 90 (OpenAI) | Team 00 / Nimrod | ✅ OpenAI → Human |
| Team 190 (OpenAI) | Team 00 / Nimrod | ✅ OpenAI → Human |

**Where this rule applies:** ALL work — code, specs, documents, WSM updates, event logs, UI, configuration, and any other artifact that drives system behavior.

**Who "Team" means:** Every team is an LLM agent. Only Nimrod (Team 00) is human. "Submitting for validation" means passing a structured document to a different AI agent in a different environment. The mechanism is always: write to `_COMMUNICATION/`, route via mandate, receive structured verdict file.

---

## Application to State Management

The state management drift problem we are solving is itself a manifestation of this principle:

- LLM agents update WSM (probabilistic output)
- LLM CLI updates pipeline JSON (probabilistic output)
- Without cross-validation → drift is undetected

**The server-side layer (S003-P007) is a cross-validation mechanism:**
The server reads BOTH WSM and JSON and checks their consistency on every request.
It acts as a stateless validator — not trusting either source in isolation.

---

## Application to Document Authoring

This principle applies to documentation, not just code:

- Team 170 writes a document (Gemini) → Team 190 reviews (OpenAI)
- This session's architectural decisions (Team 00 / Claude) → should be reviewed by Team 100 (Gemini) before execution

No document that drives system behavior should go unreviewed by a different engine.

---

**log_entry | TEAM_00 | CROSS_ENGINE_VALIDATION_PRINCIPLE | DIRECTIVE_LOCKED | 2026-03-16**
