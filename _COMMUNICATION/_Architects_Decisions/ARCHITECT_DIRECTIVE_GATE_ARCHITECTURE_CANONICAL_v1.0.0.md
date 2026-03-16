# Architect Directive — Canonical Gate Architecture
## ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_v1.0.0

**from:** Team 00 (Chief Architect — Nimrod)
**date:** 2026-03-16
**status:** LOCKED
**authority:** Constitutional — supersedes any prior gate descriptions in team prompts, config files, or activation documents

---

## 1. Purpose

This directive defines the canonical gate model for the Phoenix pipeline. It locks:
- The purpose and type of each gate
- The executor–validator pair structure
- The three-answer model for all validation gates
- The fail-routing philosophy (full vs. admin)
- Open items requiring follow-up decisions

All teams, prompts, and documentation must align to this model.

---

## 2. Gate Type Classification

Every gate in the pipeline is one of four types:

| Type | Symbol | Meaning |
|------|--------|---------|
| **EXECUTION** | ⚙️ | A team produces an artifact (plan, code, doc) |
| **VALIDATION** | 🔍 | A team validates an artifact produced by another gate |
| **HYBRID** | ⚙️🔍 | Two mandates in one gate — one produces, one validates |
| **HUMAN** | ✋ | Nimrod makes a final decision |

---

## 3. Canonical Gate Definitions

### GATE_0 — Scope Validation
**Type:** 🔍 VALIDATION
**Owner:** Team 190 (Constitutional Validator)
**Input:** LOD200 submitted by architecture team
**Output:** PASS or BLOCK with canonical blocking findings
**Fail behavior:** Canonical message sent back to the submitting team. Pipeline waits at GATE_0. No progression until architecture team resubmits.
**Routing:** Self-loop only — GATE_0 → GATE_0 until PASS.
**Note:** GATE_0 is the entry gate. It does not route to GATE_1 until scope is unambiguously approved.

---

### GATE_1 — LLD400 Spec Cycle
**Type:** ⚙️🔍 HYBRID (two mandates, one gate)
**Phase 1 executor:** Team 170 (Spec & Governance Authority) — produces LLD400
**Phase 2 validator:** Team 190 (Constitutional Validator) — validates LLD400
**Structure:** Single self-contained loop — Team 170 produces → Team 190 reviews → corrections → repeat until PASS
**Routing:** Self-loop — GATE_1 → GATE_1 until PASS. Both `doc` and `full` routes stay at GATE_1.
**Note:** This is the canonical pattern for "two mandates within one gate." It will recur.

---

### GATE_2 — Architectural Intent Verification
**Type:** 🔍 VALIDATION (ARCHITECTURAL, not human)
**Owner:** Team 100 (agents_os domain) / Team 00 (tiktrack domain)
**What it checks:** The submitting team verifies the detailed LLD400 against the original LOD200 requirements. This is an inverse-probability / consequence analysis — "does the detailed spec still satisfy everything we approved in the brief?"
**This is NOT human validation.** It is the architectural team's sign-off that the spec they commissioned now meets their original intent.
**Fail routing — two paths:**
- **Admin route:** Minor discrepancies or missing items → back to Team 190 only for targeted fix → resubmit to GATE_2. (Quick — skips Team 170.)
- **Full route:** Material spec gap or architectural issue → back to Team 170 (revise spec) → Team 190 (validate) → resubmit to GATE_2. (Full GATE_1 cycle.)

**Note:** This two-path fail model (admin shortcut + full cycle) is a recurring pattern that will appear throughout the pipeline.

---

### G3_PLAN (GATE_3 — Work Plan)
**Type:** ⚙️ EXECUTION
**Owner:** Team 10 (Execution Orchestrator)
**Produces:** Implementation work plan — task breakdown, team assignments, dependencies, execution order, gate handoffs
**⚠️ WSM RULE:** Team 10 does NOT directly modify WSM. WSM is managed exclusively through the pipeline system. Any WSM update logic in Team 10 prompts is drift and must be removed.
**Passes to:** G3_5 for validation

---

### G3_5 — Work Plan Validation
**Type:** 🔍 VALIDATION
**Owner:** Team 90 (Dev-Validator)
**Validates:** G3_PLAN output
**Fail routing:** Both `doc` and `full` route back to G3_PLAN (semantic distinction only — `full` = structural rewrite required; `doc` = governance/format only).

---

### G3_6_MANDATES — Per-Team Mandate Generation
**Type:** ⚙️ EXECUTION (deterministic / orchestrator-generated)
**Owner:** Pipeline orchestrator (auto-generates; Team 10 owns structurally)
**Produces:** `implementation_mandates.md` — per-team execution instructions with dependency injection
**⚠️ OPEN ITEM:** Nimrod flagged this gate as potentially obsolete — mandates may be generated as part of G3_PLAN or directly by the agents_os system. Pending decision: retain, merge into G3_PLAN, or eliminate. Do NOT lock this gate's future until decision is made.

---

### GATE_3_IMPL (formerly CURSOR_IMPLEMENTATION) — Central Implementation
**Type:** ⚙️ EXECUTION
**⚠️ CANONICAL NAME PENDING** — Current code name `CURSOR_IMPLEMENTATION` is not canonical. Preferred: `GATE_3_IMPL` or `IMPL`. Decision required before S003.
**Owner:** Domain-specific implementation teams (TikTrack: Teams 20+30 / AgentsOS: Team 61)
**Nature:** The central, most complex gate in the pipeline. Dynamic number of internal steps, multiple teams, domain-specific assignments. Each team executes its mandate from `implementation_mandates.md`.
**Scope of this gate:** Not fully specified in this directive — requires dedicated LOD200/LOD400 session.
**Passes to:** GATE_4

---

### GATE_4 — QA / Integration Validation
**Type:** 🔍 VALIDATION
**Owner:** Team 50 (TikTrack) / Team 51 (AgentsOS)
**Validates:** All output of GATE_3_IMPL — code tests + E2E tests
**Critical note on token cost:** Unlike other validation gates, GATE_4 must be a SMART router. A simple PASS/FAIL is insufficient. GATE_4 must:
- Return precise fix instructions directly to the team responsible for each failure
- Not re-run the full implementation cycle for a single team's regression
- This requires a richer routing model than doc/full — **a GATE_4-specific routing protocol is required**
**For now:** Define as QA gate; full routing protocol to be defined in dedicated session.

---

### GATE_5 — Constitutional Validation
**Type:** 🔍 VALIDATION
**Owner:** Team 90 (Dev-Validator)
**Validates:** Full implementation for constitutional correctness, documentation accuracy, standards compliance
**⚠️ G5_DOC_FIX is ELIMINATED:** The `G5_DOC_FIX` sub-gate was an incorrect patch pattern. It will be removed. The correct model:
- **Admin route (lightweight):** Return directly to implementation team with targeted instructions — no separate gate state. Implemented as `GATE_5 fail --route doc → direct team instruction`
- **Full route:** Return to G3_PLAN for full re-plan

---

### GATE_6 — Architectural Spec Compliance Review
**Type:** 🔍 VALIDATION (ARCHITECTURAL)
**Owner:** Team 100 (agents_os) / Team 00 (tiktrack)
**Validates:** "Does what was built match the approved spec?" — checks for spec compliance, gap detection, integration completeness
**Fail routing:**
- **Admin route:** Minor code gap or missing item → back to implementation team directly → re-validate
- **Full route:** Material implementation gap → back to G3_PLAN

---

### WAITING_GATE6_APPROVAL — Nimrod GATE_6 Approval
**Type:** ✋ HUMAN
**Same fail routing as GATE_6**

---

### GATE_7 — Human UX / Final Review
**Type:** ✋ HUMAN
**Owner:** Nimrod
**Validates:** UX, visual completeness, flow correctness
**Fail routing:**
- **Admin route:** UX/wording issue → implementation team direct fix → re-review
- **Full route:** Major redesign needed → G3_PLAN

---

### GATE_8 — Closure & Archive
**Type:** ⚙️🔍 HYBRID (dual gate)
**Phase 1 executor:** Team 70 — produces AS_MADE_REPORT + archives all WP artifacts
**Phase 2 validator:** Team 90 — validates closure completeness
**Routing:** Self-loop on fail. Both doc/full return to GATE_8 (Team 70 corrects).

---

## 4. The Executor–Validator Pair Model

Every unit of work has a corresponding validation step. Pairs are designed so that:
- **Executor and validator are DIFFERENT teams**
- **Executor and validator use DIFFERENT engines** (cross-engine validation principle — IR-VAL-01)

| Executor Gate | Executor Team | Validator Gate | Validator Team | Engine Pair |
|---------------|---------------|----------------|----------------|-------------|
| GATE_1 Phase 1 | Team 170 (Gemini) | GATE_1 Phase 2 | Team 190 (OpenAI) | Gemini → OpenAI |
| G3_PLAN | Team 10 (Cursor) | G3_5 | Team 90 (OpenAI) | Cursor → OpenAI |
| GATE_3_IMPL | Teams 20+30 or 61 (Cursor) | GATE_4 | Team 50/51 (Cursor+MCP) | Cursor → Automated |
| GATE_3_IMPL | Teams 20+30 or 61 | GATE_5 | Team 90 (OpenAI) | Cursor → OpenAI |
| All impl | All teams | GATE_6 | Team 100 (Gemini) | Mixed → Gemini |
| All | All teams | GATE_7 | Nimrod (Human) | AI → Human |
| GATE_8 P1 | Team 70 (domain-specific) | GATE_8 P2 | Team 90 (OpenAI) | Any → OpenAI |

---

## 5. The Three-Answer Validator Model

All validation gates (Teams 90, 190, 50, 51) produce ONE of THREE outcomes — not two:

| Answer | Command | Meaning | Next action |
|--------|---------|---------|-------------|
| ✅ **PASS** | `./pipeline_run.sh pass` | Clean — no issues | Advance to next gate |
| ⚠️ **PASS_WITH_ACTION** | `./pipeline_run.sh pass_with_actions "ACTION-1\|..."` | Pass, but conditions logged | Advance; actions tracked until explicitly resolved |
| ❌ **FAIL** | `./pipeline_run.sh fail "blockers"` + `route doc\|full` | Blocked | Route per doc/full |

**PASS_WITH_ACTION** is for findings that:
- Are real and must be addressed
- Are NOT blocking forward progress
- Will be verified in a subsequent gate or before GATE_8
- Examples: minor code smell, non-critical doc gap, advisory for next team

**FAIL** is for findings that:
- Block the current gate unambiguously
- Cannot be deferred to a later gate
- Require correction before the pipeline can proceed

---

## 6. Fail Routing Philosophy

### The Tension
| Goal | Mechanism |
|------|-----------|
| Maximum control | Always return to G3_PLAN |
| Token/time savings | Return directly to failing team |
| Process simplicity | Single fixed return point |

### The Resolution: Two-Level Blocking

| Level | Route | Target | When to use |
|-------|-------|--------|-------------|
| **FULL** | `route full` | G3_PLAN (always) | Structural, scope, or architectural issue — full re-plan required |
| **ADMIN** | `route doc` | Gate-specific (varies) | Documentation gap, minor code fix, targeted correction — no re-planning required |

### Per-Gate Admin Route Targets

| Gate | ADMIN (`doc`) → | FULL (`full`) → |
|------|-----------------|-----------------|
| GATE_0 | GATE_0 (self) | GATE_0 (self) |
| GATE_1 | GATE_1 (self) | GATE_1 (self) |
| GATE_2 | Team 190 only → GATE_2 | Team 170 → GATE_1 → GATE_2 |
| G3_5 | G3_PLAN | G3_PLAN |
| GATE_4 | CURSOR_IMPL (targeted fix) | G3_6_MANDATES |
| GATE_5 | CURSOR_IMPL (direct instruction) | G3_PLAN |
| GATE_6 | CURSOR_IMPL | G3_PLAN |
| GATE_7 | CURSOR_IMPL | G3_PLAN |
| GATE_8 | GATE_8 (self) | GATE_8 (self) |

**Note:** `G5_DOC_FIX` is eliminated from this table. GATE_5 admin route delivers fix instructions directly to the implementation team without creating a separate gate state.

---

## 7. Open Items (Not Locked)

| Item | Description | Status |
|------|-------------|--------|
| **G3_6_MANDATES** | May be obsolete — mandates generated by G3_PLAN or agents_os system | ⏳ Decision required |
| **CURSOR_IMPLEMENTATION name** | Needs canonical name: `GATE_3_IMPL`? `IMPL`? | ⏳ Decision required before S003 |
| **G5_DOC_FIX removal** | Delete from pipeline — replace with direct routing in GATE_5 | ⏳ Implementation mandate required (Team 61) |
| **GATE_4 routing protocol** | Needs richer per-team routing, not just doc/full | ⏳ Dedicated design session required |
| **GATE_2 admin route** | Current code routes GATE_2 full → GATE_1 but admin has no Team 190-only fast path | ⏳ Code fix required |
| **Three-answer dashboard UX** | Dashboard shows only PASS/FAIL buttons — PASS_WITH_ACTION not surfaced | ⏳ Implementation mandate required |
| **WSM drift in Team 10** | Any Team 10 prompt containing WSM update instructions must be cleaned | ⏳ Audit required |

---

## 8. Related Directives

- `ARCHITECT_DIRECTIVE_CROSS_ENGINE_VALIDATION_PRINCIPLE_v1.0.0.md` — IR-VAL-01
- `ARCHITECT_DIRECTIVE_ONE_HUMAN_ALL_TEAMS_AI_AGENTS_v1.0.0.md` — IR-ONE-HUMAN-01
- `ARCHITECT_DIRECTIVE_GATE_0_1_2_PIPELINE_HARDENING_v1.0.0.md` — Gate 0-1-2 prompt fixes
- `ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0.md` — Quality governance

---

**log_entry | TEAM_00 | GATE_ARCHITECTURE_CANONICAL | LOCKED | 2026-03-17**
