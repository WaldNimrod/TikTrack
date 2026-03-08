# Agents_OS — Implementation Plan (LOCKED)
**Date:** 2026-03-03  
**Status:** LOCKED — Approved by Architect  
**Version:** 1.0.0  
**Branch:** `cursor/development-environment-setup-6742`

---

## 1. Vision

**One command. Spec in → production-ready code out. Human only at GATE_7.**

Agents_OS Orchestrator automates the routing of conversations between team agents across the full 9-gate lifecycle, using the existing governance model, team structure, and gate flow — not reinventing them.

---

## 2. Agreed Architecture

### 2.1 Engine Mapping

| Engine | Provider | Teams | Gates | Cost |
|--------|----------|-------|-------|------|
| **Claude Code CLI** | Anthropic (Basic subscription) | 00, 100 | GATE_2 (intent), GATE_6 (reality) | Existing |
| **OpenAI API** | OpenAI (Pro subscription) | 90, 190 | GATE_0, GATE_1, G3.5, GATE_5, GATE_8 | Existing |
| **Gemini API** | Google (Basic subscription) | 10, 50, 70, 170 | GATE_3 (planning), GATE_4 (QA), GATE_8 (docs) | Existing |
| **Cursor Composer** | Cursor (Subscription) | 20, 30, 40, 60 | GATE_3 G3.7 (implementation) | Existing |
| **Deterministic** | Python (local) | — | All gates (structural checks) | $0 |

### 2.2 Automation Level Per Gate

| Gate | Owner | Deterministic | LLM Engine | Human | Total Auto |
|------|-------|---------------|------------|-------|------------|
| GATE_0 | 190 | Identity headers, structure | OpenAI (190 content review) | — | **100%** |
| GATE_1 | 190 | 44 structural checks | Gemini (170 writes LLD400) + OpenAI (190 validates) | — | **100%** |
| GATE_2 | 100 | — | Claude Code (100 approves intent) | — | **100%** |
| G3.1–G3.5 | 10 | Plan structure checks | Gemini (10 builds plan) + OpenAI (90 validates plan) | — | **100%** |
| G3.6 | 10 | Mandate templates | Gemini (10 builds mandates) | — | **100%** |
| G3.7 | 20/30 | — | — | **Cursor paste** | **0%** (prompt ready) |
| G3.8–G3.9 | 10 | Completion checks | Gemini (10 collects) | — | **100%** |
| GATE_4 | 50 | pytest, mypy, bandit, build | Gemini (50 QA review) | — | **100%** |
| GATE_5 | 90 | Code checks, spec compliance | OpenAI (90 validates code vs spec) | — | **100%** |
| GATE_6 | 100 | Diff generation | Claude Code (100 reality vs intent) | — | **100%** |
| GATE_7 | 00 | — | — | **Nimrod reviews UX** | **0%** |
| GATE_8 | 90 | File existence, index checks | OpenAI (90 closes) + Gemini (70 docs) | — | **100%** |

**Summary: 10/12 gates fully automated. 1 gate semi-auto (Cursor paste). 1 gate human (GATE_7).**

### 2.3 File Structure

```
agents_os/
├── orchestrator/
│   ├── __init__.py
│   ├── pipeline.py              # Main CLI — runs full gate flow
│   ├── gate_router.py           # Maps gate → engine + team + conversation
│   └── state.py                 # WSM state tracking + progress
│
├── engines/
│   ├── __init__.py
│   ├── base.py                  # Abstract engine interface
│   ├── claude_engine.py         # Claude Code CLI wrapper
│   ├── openai_engine.py         # OpenAI API wrapper
│   ├── gemini_engine.py         # Gemini API wrapper
│   └── cursor_engine.py         # Generates ready-to-paste prompts
│
├── conversations/
│   ├── __init__.py
│   ├── gate_0_spec_arc.py       # 190 validates LOD200
│   ├── gate_1_spec_lock.py      # 170 writes + 190 validates LLD400
│   ├── gate_2_intent.py         # 100 approves intent
│   ├── gate_3_implementation.py # 10 plans, 90 validates, mandates built
│   ├── gate_4_qa.py             # 50 QA + automated tests
│   ├── gate_5_dev_validation.py # 90 validates code + spec compliance
│   ├── gate_6_arch_validation.py# 100 reality check
│   ├── gate_7_human_approval.py # Nimrod UX review (pause + notify)
│   └── gate_8_doc_closure.py    # 90 + 70 documentation closure
│
├── validators/
│   ├── __init__.py
│   ├── identity_header.py       # V-01–V-13: regex checks
│   ├── section_structure.py     # V-14–V-20: section presence
│   ├── gate_compliance.py       # V-21–V-24: gate enum, version
│   ├── wsm_alignment.py         # V-25–V-29: cross-ref with WSM
│   ├── domain_isolation.py      # V-30–V-33: path + import checks
│   ├── code_quality.py          # pytest + mypy + bandit + build
│   └── spec_compliance.py       # Compare implementation vs LLD400
│
├── observers/
│   ├── __init__.py
│   └── state_reader.py          # ✅ BUILT — POC-1 Observer
│
├── prompts/                     # System prompts per team
│   ├── team_00_architect.md
│   ├── team_10_gateway.md
│   ├── team_20_backend.md
│   ├── team_30_frontend.md
│   ├── team_50_qa.md
│   ├── team_70_librarian.md
│   ├── team_90_spy.md
│   ├── team_100_arch_authority.md
│   ├── team_170_ssot.md
│   └── team_190_constitutional.md
│
├── context/
│   ├── constraints.md           # Architectural constraints (naming, types, rules)
│   ├── backend_conventions.md   # How backend code looks (extracted from codebase)
│   └── frontend_conventions.md  # How frontend code looks (extracted from codebase)
│
├── artifacts/
│   ├── templates.py             # Canonical artifact generators
│   ├── validation_response.py   # VALIDATION_RESPONSE.md generator
│   ├── blocking_report.py       # BLOCKING_REPORT.md generator
│   └── handoff.py               # HANDOFF.md generator
│
├── tests/
│   ├── __init__.py
│   ├── test_state_reader.py     # ✅ BUILT — 9 tests passing
│   ├── test_pipeline.py
│   ├── test_validators.py
│   └── test_engines.py
│
└── config.py                    # API keys, engine settings, paths
```

---

## 3. Implementation Phases

### Phase 0 — Foundation ✅ DONE

| Deliverable | Status |
|-------------|--------|
| CI/CD pipeline (`.github/workflows/ci.yml`) | ✅ Built, verified, in Git |
| POC-1 Observer (`state_reader.py`) | ✅ Built, 9 tests pass, STATE_SNAPSHOT produced |
| Unit tests (30 tests) | ✅ auth, trading_accounts, cash_flows |
| ESLint config | ✅ `ui/.eslintrc.cjs` |
| mypy config | ✅ `api/mypy.ini` |
| Quality scan + Known Bugs (KB-001–KB-021) | ✅ Documented |
| Team communications (00, 60, 190) | ✅ In Git |

### Phase 1 — Engines + Base Infrastructure

**Goal:** All 4 engines working, base pipeline skeleton.

| Step | Deliverable | Depends on |
|------|-------------|------------|
| 1.1 | `engines/base.py` — abstract interface (call, parse, retry) | — |
| 1.2 | `engines/openai_engine.py` — OpenAI API wrapper | API key from user |
| 1.3 | `engines/gemini_engine.py` — Gemini API wrapper | API key from user |
| 1.4 | `engines/claude_engine.py` — Claude Code CLI wrapper | Verify CLI access |
| 1.5 | `engines/cursor_engine.py` — prompt file generator | — |
| 1.6 | `config.py` — API keys, paths, engine selection | API keys |
| 1.7 | Tests for all engines | Steps 1.1–1.6 |

**Prerequisites from Nimrod:**
- OpenAI API key (or confirmation Pro includes API access)
- Gemini API key
- Confirmation Claude Code CLI is installed and accessible
- System prompts for each team (copy from existing chats)

### Phase 2 — Deterministic Validators

**Goal:** All structural/mechanical checks automated.

| Step | Deliverable | Checks |
|------|-------------|--------|
| 2.1 | `validators/identity_header.py` | V-01–V-13: 13 regex checks |
| 2.2 | `validators/section_structure.py` | V-14–V-20: 6 section checks |
| 2.3 | `validators/gate_compliance.py` | V-21–V-24: 4 gate checks |
| 2.4 | `validators/wsm_alignment.py` | V-25–V-29: 5 WSM cross-ref checks |
| 2.5 | `validators/domain_isolation.py` | V-30–V-33: 4 path/import checks |
| 2.6 | `validators/code_quality.py` | pytest + mypy + bandit + build wrapper |
| 2.7 | `validators/spec_compliance.py` | Compare implementation files vs LLD400 |
| 2.8 | Tests for all validators | Steps 2.1–2.7 |

**Prerequisites from Nimrod:** None — builds on existing codebase.

### Phase 3 — Conversations (Gate Handlers)

**Goal:** Each gate has a handler that knows what to send, to whom, and what to expect back.

| Step | Deliverable | Engine used |
|------|-------------|-------------|
| 3.1 | `conversations/gate_0_spec_arc.py` | OpenAI (190) + deterministic |
| 3.2 | `conversations/gate_1_spec_lock.py` | Gemini (170) + OpenAI (190) + deterministic |
| 3.3 | `conversations/gate_2_intent.py` | Claude Code (100) |
| 3.4 | `conversations/gate_3_implementation.py` | Gemini (10) + OpenAI (90) + Cursor (20/30) |
| 3.5 | `conversations/gate_4_qa.py` | Deterministic + Gemini (50) |
| 3.6 | `conversations/gate_5_dev_validation.py` | Deterministic + OpenAI (90) |
| 3.7 | `conversations/gate_6_arch_validation.py` | Claude Code (100) |
| 3.8 | `conversations/gate_7_human_approval.py` | Pause + notification |
| 3.9 | `conversations/gate_8_doc_closure.py` | OpenAI (90) + Gemini (70) |

**Prerequisites from Nimrod:** System prompts finalized.

### Phase 4 — Orchestrator Pipeline

**Goal:** Full pipeline that runs GATE_0 → GATE_8 with one command.

| Step | Deliverable | Depends on |
|------|-------------|------------|
| 4.1 | `orchestrator/pipeline.py` — main CLI | Phases 1–3 |
| 4.2 | `orchestrator/gate_router.py` — routing logic | Phase 3 |
| 4.3 | `orchestrator/state.py` — WSM tracking | Phase 0 (STATE_SNAPSHOT) |
| 4.4 | `artifacts/` — canonical output generators | Phase 3 |
| 4.5 | Integration tests | Steps 4.1–4.4 |

### Phase 5 — System Prompts + Context

**Goal:** Each team agent has a complete, tested system prompt.

| Step | Deliverable | Source |
|------|-------------|--------|
| 5.1 | `prompts/team_*.md` for all 10 teams | Extract from Nimrod's existing chats |
| 5.2 | `context/constraints.md` | Extract from governance docs |
| 5.3 | `context/backend_conventions.md` | Extract from codebase patterns |
| 5.4 | `context/frontend_conventions.md` | Extract from codebase patterns |

**Prerequisites from Nimrod:** Copy system prompts from existing chats.

### Phase 6 — End-to-End Test

**Goal:** Run full pipeline on a real feature.

| Step | Deliverable |
|------|-------------|
| 6.1 | Choose test feature (e.g., "CRUD for strategies") |
| 6.2 | Run pipeline end-to-end |
| 6.3 | Measure: time, quality, errors, human interventions |
| 6.4 | Compare to manual process |
| 6.5 | Fix issues, iterate |

---

## 4. Execution Order + Dependencies

```
Phase 0 ✅ DONE
    │
    ├── Phase 1 (Engines) ←── API keys from Nimrod
    │       │
    │       ├── Phase 2 (Validators) ←── no dependencies
    │       │
    │       └── Phase 5 (Prompts) ←── system prompts from Nimrod
    │               │
    │               └── Phase 3 (Conversations) ←── Phase 1 + 2 + 5
    │                       │
    │                       └── Phase 4 (Pipeline) ←── Phase 3
    │                               │
    │                               └── Phase 6 (E2E Test)
    │
    │  Parallel track:
    ├── Phase 2 can start immediately (no API needed)
    └── Phase 5 can start when Nimrod provides prompts
```

**Critical path:** Phase 1 (engines) → Phase 3 (conversations) → Phase 4 (pipeline) → Phase 6 (test)

---

## 5. What Nimrod Needs to Provide

| Item | When needed | Notes |
|------|-------------|-------|
| OpenAI API key | Phase 1 | Verify Pro includes API access |
| Gemini API key | Phase 1 | From existing Basic subscription |
| Claude Code CLI access | Phase 1 | Verify `claude` command works |
| System prompts (10 teams) | Phase 5 | Copy from existing chat sessions |
| Test feature spec | Phase 6 | Real feature for E2E test |

---

## 6. Expected Outcome

### Per Work Package

| Metric | Today | After Implementation |
|--------|-------|---------------------|
| Active time (Nimrod) | 2–4 hours | ~20 minutes |
| Wall time (total) | 4–6 hours | ~60–90 minutes |
| Context switches | ~12 | 3 (spec → Cursor paste → GATE_7 review) |
| Routing errors | Frequent | Zero |
| Additional cost | $0 | $0 (existing subscriptions) |
| Audit trail | None | Full — every input/output logged |

### Scalability

| Throughput | Today | After |
|-----------|-------|-------|
| WPs per day | 1–2 | 5–10 |
| WPs per week | 5–10 | 25–50 |

---

## 7. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Claude Code CLI may have rate limits | Medium | Batch architect calls; cache responses |
| OpenAI Pro API quota unclear | Medium | Test quota in Phase 1; fallback to Gemini |
| Gemini quality insufficient for planning | Medium | Test in Phase 1; swap with OpenAI if needed |
| System prompts too long for context window | Medium | Compress; use focused sub-prompts per gate |
| Gate retry loops may be infinite | Low | Max 5 retries per gate (per existing protocol) |
| Cursor paste step breaks flow | Low | Clear instructions + notification |

---

**Prepared by:** Cursor Cloud Agent  
**Approved by:** Nimrod Wald (Team 00 / Chief Architect)  
**Date:** 2026-03-03  
**Next action:** Phase 1 execution upon receipt of API keys + system prompts
