# Agents_OS V2 — Master Plan (LOCKED)
**Date:** 2026-03-03  
**Status:** LOCKED — Approved by Architect  
**Version:** 2.0.0  
**Supersedes:** All previous Agents_OS specs, plans, and attempts (V1 / S001-P001 / MB3A)

---

## 0. Why V2

V1 of Agents_OS produced ~50 governance documents and 2 lines of functional code. It was designed for a multi-team organization but the reality is **one human + multiple LLM agents**. V2 starts from this reality.

**V1 artifacts preserved:** `agents_os/observers/state_reader.py` (POC-1 Observer) is duplicated into V2 as a working component.

**V1 artifacts deprecated:** All specs in `_COMMUNICATION/team_170/MB3A_POC_*`, quarantined materials in `agents_os/docs-governance/99-QUARANTINE_STAGE3/`, and V1 stubs (`validators/validator_stub.py`) are superseded by V2 and should not be referenced.

---

## 1. Problem Statement

Nimrod operates a development system with ~12 LLM agent sessions (teams), each with defined governance roles. Today, **Nimrod manually routes every message between agents** — copying context, building prompts, validating outputs, and tracking gate progress. This is:

- **Slow:** 2–4 hours of active routing per Work Package
- **Error-prone:** Context loss between sessions, forgotten handoffs
- **Non-scalable:** Limited to 1–2 WPs per day
- **Degrading:** Agents lose focus and context over long conversations

## 2. Solution

An **Orchestrator** that automates the routing of conversations between team agents across the 9-gate lifecycle, using:

- **Deterministic validators** for structural/mechanical checks ($0)
- **LLM engines** (Claude Code, OpenAI, Gemini) for judgment calls (existing subscriptions)
- **Cursor** for code generation (existing subscription)
- **Context Refresh System** that keeps agents focused and aligned

---

## 3. Architecture

### 3.1 Engine Mapping

| Engine | Provider | Subscription | Teams | Gates |
|--------|----------|-------------|-------|-------|
| Claude Code CLI | Anthropic | Basic (existing) | 00, 100 | GATE_2, GATE_6 |
| OpenAI API | OpenAI | Pro (existing) | 90, 190 | GATE_0, 1, G3.5, 5, 8 |
| Gemini API | Google | Basic (existing) | 10, 50, 70, 170 | GATE_1 (production), 3, 4, 8 |
| Cursor Composer | Cursor | Subscription (existing) | 20, 30, 40, 60 | G3.7 (implementation) |
| Deterministic | Python | $0 | — | All gates (structural) |

### 3.2 Context Refresh System (CRITICAL)

**Problem:** LLM agents drift from their role and forget rules over time.

**Solution:** Every LLM call from the Orchestrator includes a **Context Injection Block** — a structured prefix that reminds the agent of its identity, role, current state, and constraints.

```
┌─────────────────────────────────────────────────┐
│  CONTEXT INJECTION BLOCK (prepended to EVERY call) │
├─────────────────────────────────────────────────┤
│                                                   │
│  LAYER 1: IDENTITY (who you are)                  │
│    "You are Team 90 (The Spy)."                   │
│    "Your role: code validation, integrity checks." │
│    "You report to Team 10."                       │
│    "You own GATE_5, 6, 7, 8."                    │
│                                                   │
│  LAYER 2: GOVERNANCE (the rules)                  │
│    "Task closure requires Seal Message (SOP-013)."│
│    "VALIDATION_RESPONSE must include: identity    │
│     header, overall_status, blocking_findings."   │
│    "Max resubmissions: 5."                        │
│                                                   │
│  LAYER 3: STATE (where we are now)                │
│    "Active WP: S002-P002-WP001"                   │
│    "Current gate: GATE_5"                         │
│    "Previous gate result: GATE_4 PASS"            │
│    "Approved spec: [reference to LLD400]"         │
│                                                   │
│  LAYER 4: TASK (what to do now)                   │
│    [The actual request for this gate]             │
│                                                   │
└─────────────────────────────────────────────────┘
```

**Every single LLM call gets all 4 layers.** This means:
- No drift — agent is reminded of its role every time
- No context loss — current state is always injected
- No governance violations — rules are always present
- Idempotent — same call produces same behavior regardless of conversation history

**When refresh happens:**

| Trigger | What's refreshed |
|---------|-----------------|
| Every LLM call | Full 4-layer injection (always) |
| Gate transition | LAYER 3 updated with new gate state |
| Retry (after FAIL) | LAYER 4 updated with failure details |
| Implementation pause (Cursor) | Mandates include full context for paste |

### 3.3 File Structure

```
agents_os_v2/                          ← NEW root (clean break from V1)
├── orchestrator/
│   ├── __init__.py
│   ├── pipeline.py                    # Main CLI
│   ├── gate_router.py                 # Gate → engine + team mapping
│   └── state.py                       # WSM tracking + gate progress
│
├── engines/
│   ├── __init__.py
│   ├── base.py                        # Abstract engine interface
│   ├── claude_engine.py               # Claude Code CLI
│   ├── openai_engine.py               # OpenAI API
│   ├── gemini_engine.py               # Gemini API
│   └── cursor_engine.py               # Prompt file generator
│
├── context/
│   ├── __init__.py
│   ├── injection.py                   # Builds 4-layer Context Injection Block
│   ├── identity/                      # LAYER 1 — per team identity files
│   │   ├── team_00.md
│   │   ├── team_10.md
│   │   ├── team_20.md
│   │   ├── team_30.md
│   │   ├── team_40.md
│   │   ├── team_50.md
│   │   ├── team_60.md
│   │   ├── team_70.md
│   │   ├── team_90.md
│   │   ├── team_100.md
│   │   ├── team_170.md
│   │   └── team_190.md
│   ├── governance/                    # LAYER 2 — governance rules per gate
│   │   ├── gate_rules.md             # Universal gate rules
│   │   ├── seal_protocol.md          # SOP-013
│   │   ├── validation_format.md      # VALIDATION_RESPONSE structure
│   │   └── communication_format.md   # Canonical message format
│   ├── conventions/                   # Coding conventions
│   │   ├── backend.md                # How api/ code looks
│   │   ├── frontend.md               # How ui/ code looks
│   │   └── constraints.md            # Architectural constraints
│   └── state_reader.py               # Copied from V1 POC-1 Observer
│
├── conversations/                     # Gate handlers
│   ├── __init__.py
│   ├── gate_0_spec_arc.py
│   ├── gate_1_spec_lock.py
│   ├── gate_2_intent.py
│   ├── gate_3_implementation.py
│   ├── gate_4_qa.py
│   ├── gate_5_dev_validation.py
│   ├── gate_6_arch_validation.py
│   ├── gate_7_human_approval.py
│   └── gate_8_doc_closure.py
│
├── validators/                        # Deterministic checks
│   ├── __init__.py
│   ├── identity_header.py            # V-01–V-13
│   ├── section_structure.py          # V-14–V-20
│   ├── gate_compliance.py            # V-21–V-24
│   ├── wsm_alignment.py              # V-25–V-29
│   ├── domain_isolation.py           # V-30–V-33
│   ├── code_quality.py               # pytest + mypy + bandit + build
│   └── spec_compliance.py            # Implementation vs LLD400
│
├── artifacts/                         # Canonical output generators
│   ├── __init__.py
│   ├── validation_response.py
│   ├── blocking_report.py
│   ├── handoff.py
│   └── seal.py                       # SOP-013 Seal generator
│
├── tests/
│   ├── __init__.py
│   ├── test_state_reader.py          # Copied from V1
│   ├── test_injection.py
│   ├── test_validators.py
│   ├── test_engines.py
│   └── test_pipeline.py
│
└── config.py                          # API keys, paths, engine selection
```

### 3.4 Gate Automation Matrix

| Gate | Deterministic | LLM Engine | Human | Automation |
|------|---------------|------------|-------|------------|
| GATE_0 | Headers, structure | OpenAI (190) | — | 100% |
| GATE_1 | 44 checks | Gemini (170 writes) + OpenAI (190 validates) | — | 100% |
| GATE_2 | — | Claude Code (100 intent) | — | 100% |
| G3.1–G3.5 | Plan structure | Gemini (10 plans) + OpenAI (90 validates) | — | 100% |
| G3.6 | Templates | Gemini (10 mandates) | — | 100% |
| G3.7 | — | — | **Cursor paste** | Prompt ready |
| G3.8–G3.9 | Completion checks | Gemini (10) | — | 100% |
| GATE_4 | Tests, lint, build | Gemini (50 QA) | — | 100% |
| GATE_5 | Code + spec checks | OpenAI (90 validates) | — | 100% |
| GATE_6 | Diff | Claude Code (100 reality) | — | 100% |
| GATE_7 | — | — | **Nimrod UX** | 0% |
| GATE_8 | Files, index | OpenAI (90) + Gemini (70) | — | 100% |

---

## 4. Implementation Phases

### Phase 0 — Foundation ✅ DONE
- CI/CD pipeline
- POC-1 Observer (STATE_SNAPSHOT)
- Unit tests (30)
- Quality tooling (ESLint, mypy, bandit)
- Known Bugs documentation (KB-001–KB-021)

### Phase 1 — V2 Skeleton + Engines
**Goal:** `agents_os_v2/` directory structure + all 4 engines working.
- Create directory structure
- Copy state_reader.py from V1
- Implement engine base + 4 engines
- Implement config.py with API key management
- Tests for engines

**Needs from Nimrod:** API keys, Claude Code CLI confirmation

### Phase 2 — Context System
**Goal:** 4-layer Context Injection Block working.
- Extract team identities from existing governance docs + Nimrod's chats
- Build injection.py that assembles 4 layers per call
- Extract coding conventions from codebase
- Tests for injection

**Needs from Nimrod:** Team identity descriptions (copy from existing chats)

### Phase 3 — Deterministic Validators
**Goal:** All structural checks automated.
- 44 spec validation checks (V-01–V-44)
- Code quality wrapper (pytest, mypy, bandit, build)
- Spec compliance checker
- Tests for validators

**Needs from Nimrod:** Nothing

### Phase 4 — Gate Conversations
**Goal:** Each gate has a handler.
- 9 conversation handlers (one per gate)
- Retry/fix loops per protocol (max 5)
- Canonical artifact generation
- Tests for conversations

**Needs from Nimrod:** Nothing

### Phase 5 — Pipeline Orchestrator
**Goal:** One command runs full lifecycle.
- pipeline.py CLI
- gate_router.py routing logic
- state.py WSM tracking
- Cursor pause/resume support
- Integration tests

**Needs from Nimrod:** Nothing

### Phase 6 — End-to-End Test
**Goal:** Prove it works on a real feature.
- Real spec → full pipeline → production code
- Measure time, quality, errors
- Compare to manual process
- Iterate and fix

**Needs from Nimrod:** Feature spec for test

---

## 5. What Nimrod Provides

| Item | Phase | How |
|------|-------|-----|
| OpenAI API key | 1 | Add as secret / env var |
| Gemini API key | 1 | Add as secret / env var |
| Claude Code CLI verification | 1 | Confirm `claude` works in terminal |
| Team identity descriptions | 2 | Copy the opening instructions from each existing chat |
| Feature spec for E2E test | 6 | Any real upcoming feature |

---

## 6. Expected Outcome

| Metric | Today | V2 |
|--------|-------|-----|
| Active time per WP | 2–4 hours | ~20 minutes |
| Wall time per WP | 4–6 hours | ~60–90 minutes |
| Context switches | ~12 | 3 |
| Agent context drift | Frequent | Zero (injection every call) |
| Governance compliance | Manual enforcement | Automatic enforcement |
| Routing errors | Frequent | Zero |
| Audit trail | None | Full log |
| Cost increase | — | $0 (existing subscriptions) |

---

**Prepared by:** Cursor Cloud Agent  
**Approved by:** Nimrod Wald (Team 00 / Chief Architect)  
**Date:** 2026-03-03  
**Status:** LOCKED  
**Classification:** Agents_OS V2 Master Plan
