---
id: TEAM_100_TO_TEAM_170_S003_P017_WP002_LEAN_KIT_CONTENT_MANDATE_v1.0.0
from: Team 100 (Claude Code — Architecture)
to: Team 170 (Documentation — Content Creation)
cc: Team 00 (Principal)
date: 2026-04-02
type: EXECUTION_MANDATE
work_package_id: S003-P017-WP002
gate: GATE_2 (execution authorized)
domain: agents_os
priority: HIGH
depends_on: S003-P017-WP001 (agents-os repo must be initialized first)
blocks: null
---

# Mandate: S003-P017-WP002 — Build Lean Kit Content

---

## Summary and Goal

The `agents-os` repository now exists (after S003-P017-WP001). Your task is to populate the `lean-kit/` folder with all L0 methodology materials — the templates, role definitions, gate checklists, and config templates that a team using the Lean (L0) profile needs to run a project.

**When complete, a team reading `lean-kit/` will be able to:**
1. Understand the 5 LOD levels and produce a document at each level
2. Know what role type they are and what skills are required
3. Execute each of the 4–5 L-GATEs without ambiguity
4. Set up `roadmap.yaml` and `team_assignments.yaml` for their project
5. Follow a working example showing all of the above in use

This is a CONTENT BUILD task, not an indexing task. You are authoring documents from scratch based on the specifications in §§ below. Quality bar is high: these documents will be used by external teams and future projects.

---

## Pre-conditions

1. `S003-P017-WP001` is GATE_5 PASS (agents-os repo initialized)
2. `lean-kit/` directory structure exists at `/Users/nimrod/Documents/agents-os/lean-kit/`
3. You have read access to `methodology/lod-standard/TEAM_100_LOD_STANDARD_v0.3.md` — this is your primary source of truth

**Submission target:** All outputs go to `_COMMUNICATION/_ARCHITECT_INBOX/` in the **TikTrack repo** (the current working repo) for Team 100 review. Team 191 will place approved files into the agents-os repo.

---

## Deliverable 1 — LOD Templates (5 files in `lean-kit/templates/`)

Each template is a Markdown file that a team fills in when producing a document at that LOD level. Templates must be immediately usable — not explanations, but actual working documents with `[PLACEHOLDER]` markers where the team fills in content.

---

### D1.1 — `LOD100_IDEA_TEMPLATE.md`

**Purpose:** Capture a raw idea or requirement. Corresponds to LOD100 (Intent).

**Required structure:**
```markdown
---
lod_target: LOD100
lod_status: DRAFT
track: A  # or B
authoring_team: [TEAM_ID]
consuming_team: [TEAM_ID]
date: [YYYY-MM-DD]
version: v0.1.0
supersedes: null
---

# [IDEA TITLE]

**id:** [IDEA-NNN or WP-ID if promoted]
**status:** DRAFT
**date:** [YYYY-MM-DD]

## What we want
[1-3 sentences: what outcome do we want? Not how — what.]

## Why now
[Why is this a priority? What problem does it solve?]

## Success looks like
[How will we know this is done? 1-2 concrete statements.]

## Out of scope (explicit)
[What are we explicitly NOT doing in this item?]

## Open questions
- [ ] [Question 1]
- [ ] [Question 2]

## Fate decision required
- [ ] PROMOTE to LOD200 → assign to: [TEAM_ID]
- [ ] DEFER: reason [reason]
- [ ] CLOSE: reason [reason]
```

**Must-include:** All fields from the frontmatter. `What we want` section. `Fate decision` block.
**Must-not-contain:** Implementation details, technical architecture, team assignments (those go in LOD200+).

---

### D1.2 — `LOD200_CONCEPT_TEMPLATE.md`

**Purpose:** Define the need, scope, and approach. Corresponds to LOD200 (Needs and Planning).

**Required structure:**
```markdown
---
lod_target: LOD200
lod_status: DRAFT
track: A  # or B — determines whether LOD300 is required next
authoring_team: [TEAM_ID]
consuming_team: [TEAM_ID]
date: [YYYY-MM-DD]
version: v1.0.0
supersedes: null
---

# [FEATURE/PROGRAM NAME] — LOD200 Concept

**work_package_id:** [S00X-P00X-WP00X]
**domain:** [domain name]
**track:** [A — direct to LOD400 / B — requires LOD300 first]
**approved_by:** [TEAM_ID]
**approved_at:** [YYYY-MM-DD]

## 1. Problem statement
[What specific problem does this solve? 2-4 sentences. User/system perspective.]

## 2. Proposed solution (concept only)
[High-level approach. Not implementation details. What the system will do, not how.]

## 3. Scope
### 3.1 In scope
- [item]

### 3.2 Out of scope (explicit)
- [item]

## 4. Affected components
| Component | Nature of change |
|-----------|-----------------|
| [name] | [add/modify/none] |

## 5. Dependencies
- [dependency 1: what, why]

## 6. Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| [risk] | LOW/MED/HIGH | LOW/MED/HIGH | [mitigation] |

## 7. Success criteria (LOD200 level)
- [ ] [criterion 1]
- [ ] [criterion 2]

## 8. Track decision
- **Track A** (LOD200 → LOD400 direct): choose if all criteria met:
  - [ ] Single component or pattern-following
  - [ ] No new state machine or async coordination
  - [ ] No new persisted data model
  - [ ] Single team execution
- **Track B** (LOD200 → LOD300 → LOD400): choose if ANY:
  - [ ] 2+ backend systems or APIs
  - [ ] New or modified state machine
  - [ ] New persisted data model (schema changes)
  - [ ] Multiple teams in build sequence
  - [ ] Cannot determine component interfaces without resolving behavior

**Decision:** TRACK_[A/B]

## 9. Gate approval record
| Gate | Approver | Date | Status |
|------|---------|------|--------|
| L-GATE_S (spec+auth) | [TEAM_ID] | [date] | PENDING |
```

---

### D1.3 — `LOD300_DESIGN_TEMPLATE.md`

**Purpose:** Resolve system behavior before implementation spec. Track B only. Corresponds to LOD300 (System Design).

**Required structure:**
```markdown
---
lod_target: LOD300
lod_status: DRAFT
track: B  # LOD300 is Track B only
authoring_team: [TEAM_ID]
consuming_team: [TEAM_ID]
date: [YYYY-MM-DD]
version: v1.0.0
supersedes: null
---

# [FEATURE NAME] — LOD300 System Design

**work_package_id:** [S00X-P00X-WP00X]
**parent_lod200:** [path/to/LOD200_spec.md]

## 1. System behavior overview
[Describe what the system does at the component level. Not code — behavior.]

## 2. Component interactions
[Sequence or flow diagram (text/ASCII acceptable). Show all components that touch this feature.]

## 3. State model (if applicable)
[States, transitions, triggers. Only if new/modified state machine involved.]

## 4. Interface contracts
| Interface | Producer | Consumer | Contract |
|-----------|---------|---------|---------|
| [name] | [team] | [team] | [what is passed] |

## 5. Open design questions (resolved)
| Question | Decision | Rationale |
|---------|---------|---------|
| [question] | [decision] | [why] |

## 6. LOD300 exit criteria
- [ ] All component interfaces defined
- [ ] All state transitions defined
- [ ] No open design questions
- [ ] Consuming team (builder) confirms: executable from this design
```

---

### D1.4 — `LOD400_SPEC_TEMPLATE.md`

**Purpose:** Implementation-ready specification. Corresponds to LOD400 (Implementation Spec / LLD400).

**Required structure:**
```markdown
---
lod_target: LOD400
lod_status: DRAFT
track: A  # or B
authoring_team: [TEAM_ID]
consuming_team: [TEAM_ID]
date: [YYYY-MM-DD]
version: v1.0.0
supersedes: null
---

# [FEATURE NAME] — LOD400 Implementation Spec

**work_package_id:** [S00X-P00X-WP00X]
**parent_lod200:** [path]
**parent_lod300:** [path or N/A — Track A only]
**approved_by:** [TEAM_ID — consuming team sign-off]
**approved_at:** [YYYY-MM-DD]

## 1. Scope reminder
[One paragraph: what this WP builds. Taken from LOD200 §2.]

## 2. Technical specification

### 2.1 [Component/Layer name]
**What to implement:**
[Specific, unambiguous instructions. Use numbered lists for sequential steps.]

**Acceptance criteria:**
- [ ] AC-01: [testable criterion]
- [ ] AC-02: [testable criterion]
...

### 2.2 [Next component]
...

## 3. Data model changes (if any)
```sql
-- Exact DDL or ORM model changes required
```

## 4. API contract changes (if any)
| Endpoint | Method | Request | Response | Notes |
|---------|--------|---------|---------|-------|
| [path] | GET/POST/... | [schema] | [schema] | [notes] |

## 5. Error handling requirements
| Error case | Expected behavior |
|-----------|-----------------|
| [case] | [behavior] |

## 6. Out of scope (explicit)
- [item] — NOT included in this WP

## 7. Test requirements
[What must be tested? By which team?]
- Unit: [scope]
- Integration: [scope]
- Cross-engine validation: [scope — required at L-GATE_V]

## 8. Consuming team sign-off
> I confirm this spec is executable and unambiguous. All open questions are resolved.
> **Signature:** [TEAM_ID] | [date]
```

---

### D1.5 — `LOD500_ASBUILT_TEMPLATE.md`

**Purpose:** As-built record with execution fidelity. Corresponds to LOD500 (Documentation).

**Required structure:**
```markdown
---
lod_target: LOD500
lod_status: DRAFT
track: A  # or B
authoring_team: [TEAM_ID — implementing team]
consuming_team: [TEAM_ID — documentation/validation team]
date: [YYYY-MM-DD]
version: v1.0.0
supersedes: null
fidelity: FULL_MATCH  # FULL_MATCH | DEVIATIONS_DOCUMENTED | PARTIAL
verifying_team: [TEAM_ID — must differ from authoring_team]
spec_ref: [path/to/LOD400_spec.md]
---

# [FEATURE NAME] — LOD500 As-Built Record

**work_package_id:** [S00X-P00X-WP00X]
**spec_ref:** [path/to/LOD400_spec.md v1.X.X]
**gate:** L-GATE_V
**fidelity:** [FULL_MATCH / DEVIATIONS_DOCUMENTED / PARTIAL]

## 1. What was built
[Summary of what was implemented. 2-4 sentences. Matches LOD400 scope.]

## 2. Fidelity record
[Compare against each LOD400 AC:]

| AC | LOD400 requirement | As-built result | Fidelity |
|----|-------------------|----------------|---------|
| AC-01 | [requirement] | [what was built] | ✅ MATCH / ⚠️ DEVIATION / ❌ MISSING |
| AC-02 | ... | ... | ... |

## 3. Deviations from spec (if any)
[For each deviation: what changed, why, and whether a spec update (LOD400 vX.Y) was issued.]

| Deviation | Reason | Spec updated? |
|---------|--------|--------------|
| [deviation] | [reason] | YES (LOD400 v1.1) / NO (approved variance) |

## 4. Test evidence
- Unit tests: [N] tests, [N] PASS, [N] FAIL
- Integration tests: [N] tests, [N] PASS, [N] FAIL
- Cross-engine validation: [Team ID] | [date] | [result]

## 5. Files changed
| File | Change type | Notes |
|------|------------|-------|
| [path] | ADD/MODIFY/DELETE | [notes] |

## 6. Verifying team sign-off
> I confirm this as-built record is accurate. Fidelity classification above is correct.
> All deviations are documented. Evidence is linked.
> **Signature:** [TEAM_ID — different from authoring team] | [date]
```

---

## Deliverable 2 — Role Definition Documents (5 files in `lean-kit/team_roles/`)

Each document describes one role type: what it is, what it does, what skills it must have, what it must NOT do, and how to configure it.

Source of truth: `methodology/lod-standard/TEAM_100_LOD_STANDARD_v0.3.md` §9

---

### D2 — Format for all 5 role documents

Create one file per role:
- `ROLE_SYSTEM_DESIGNER.md`
- `ROLE_ARCHITECTURE_AGENT.md`
- `ROLE_BUILDER_AGENT.md`
- `ROLE_VALIDATOR_AGENT.md`
- `ROLE_DOCUMENTATION_AGENT.md`

**Each file must follow this structure:**
```markdown
# Role: [ROLE NAME]

**type:** [role_type_id from LOD Standard §9]
**level:** [L0-capable / L2-capable / L3-capable / All]

## What this role does
[2-4 sentences. Plain English.]

## Responsibilities
- [responsibility 1]
- [responsibility 2]
...

## What this role does NOT do (hard boundaries)
- [boundary 1 — Iron Rule if applicable]
- [boundary 2]
...

## Required skills (minimum viable)
| Skill | Why required |
|-------|-------------|
| [skill] | [why] |

## Engine requirements
- **Preferred engine type:** [LLM / human / either]
- **Must differ from:** [which other roles must use a different engine — cross-engine rule]
- **In L0:** declared in `team_assignments.yaml` under key: `[role_key]`

## team_assignments.yaml entry format (L0)
```yaml
teams:
  - id: [TEAM_ID]
    role_type: [role_type_id]
    engine: [engine-name]  # e.g., claude-code, cursor-composer, openai-codex
    skills:
      - [skill]
```

## Example teams in AOS context
| AOS Team | Engine | Notes |
|---------|--------|-------|
| [Team N] | [engine] | [what they do] |
```

---

**Specific content for each role** (synthesize from LOD Standard §9):

**ROLE_SYSTEM_DESIGNER:**
- What: Human owner and orchestrator. Routes work, escalates, makes strategic decisions.
- Does NOT: Approve content, substitute for cross-engine validation, review code.
- Skills: Domain knowledge, decision authority, availability to unblock.
- Iron Rule: In L0, human is orchestrator ONLY — never content approver or validator.

**ROLE_ARCHITECTURE_AGENT:**
- What: Writes specs (LOD100–LOD400), issues mandates, performs architectural review at L-GATE_V.
- Does NOT: Implement features, write production code (except boundary exceptions), run pipelines manually.
- Skills: Spec writing, LOD400 authoring, Iron Rule knowledge, cross-team mandate issuance.

**ROLE_BUILDER_AGENT:**
- What: Implements against LOD400 spec. Produces code, migrations, config changes.
- Does NOT: Deviate from spec without issuing a spec correction, approve own work at L-GATE_V.
- Skills: Language/framework fluency, ability to follow detailed spec, produce LOD500 as-built.
- Cross-engine rule: Builder engine ≠ Validator engine.

**ROLE_VALIDATOR_AGENT:**
- What: Reviews builder output against LOD400 spec at L-GATE_V. Issues PASS/FAIL with findings.
- Does NOT: Implement fixes, modify the code being validated.
- Skills: Independent reading of LOD400, test execution, finding identification.
- Iron Rule: Must use a different LLM engine than the builder.

**ROLE_DOCUMENTATION_AGENT:**
- What: Produces LOD500 as-built, indexes documents, maintains governance files.
- Does NOT: Modify LOD400 spec (that requires Architecture Agent).
- Skills: Template completion, cross-reference maintenance, governance index updates.

---

## Deliverable 3 — Gate Checklists (5 files in `lean-kit/gates/`)

Each file is an executable checklist for conducting one L-GATE. The system designer (human orchestrator) uses these to know exactly what to verify at each gate before advancing.

---

### D3.1 — `L-GATE_E_ELIGIBILITY.md`

**Purpose:** Verify the work package is ready to enter the Lean pipeline.

**Required structure:**
```markdown
# L-GATE_E — Eligibility Gate

**When to run:** Before any work begins. This is the intake filter.

## Checklist — ALL must be ✅ before proceeding

### Readiness
- [ ] WP has a clear, written LOD100 (idea/intent) — not just a verbal description
- [ ] WP is assigned to a program and stage in roadmap.yaml
- [ ] WP has no unresolved dependency blocks (all predecessors are GATE_5 PASS or not required)

### Team readiness
- [ ] Builder agent is identified and available (declared in team_assignments.yaml)
- [ ] Validator agent is identified (different engine than builder) — IRON RULE
- [ ] Architecture agent (spec author) is identified

### Track assignment
- [ ] Track decision made: TRACK_A or TRACK_B
  - If TRACK_B: LOD300 is planned in the sequence after LOD200

## Gate decision
- **PASS** → advance to L-GATE_S (or L-GATE_C if Track B)
- **FAIL** → document blocking reason in roadmap.yaml; do not proceed

## roadmap.yaml update on GATE_E PASS
```yaml
work_packages:
  - id: [WP_ID]
    current_lean_gate: L-GATE_S  # or L-GATE_C for Track B
    gate_history:
      - gate: L-GATE_E
        result: PASS
        date: [YYYY-MM-DD]
        notes: "[any notes]"
```
```

---

### D3.2 — `L-GATE_C_CONCEPT.md` (Track B only)

**Purpose:** Resolve system behavior before spec. Only required for Track B WPs.

```markdown
# L-GATE_C — Concept Gate (Track B only)

**When to run:** After L-GATE_E PASS. Track B WPs only.

## Checklist — ALL must be ✅

### LOD300 completeness
- [ ] LOD300 document exists and follows the LOD300 template
- [ ] All component interactions are documented
- [ ] All interface contracts are defined
- [ ] All open design questions are RESOLVED (none marked open)
- [ ] Consuming team (builder) has confirmed: "executable from this design"

### No implementation detail leakage
- [ ] LOD300 describes behavior, not code
- [ ] No specific function names, class names, or SQL schemas in LOD300

## Gate decision
- **PASS** → advance to L-GATE_S
- **FAIL** → return to architecture agent with findings list
```

---

### D3.3 — `L-GATE_S_SPEC_AND_AUTH.md`

**Purpose:** Approve the LOD400 spec AND authorize execution. Merges GATE_1 + GATE_2.

```markdown
# L-GATE_S — Spec + Authorization Gate

**When to run:** After L-GATE_E PASS (Track A) or L-GATE_C PASS (Track B).
**This gate merges:** GATE_1 (spec approval) + GATE_2 (execution authorization)

## Part A — Spec review (LOD400 completeness)

- [ ] LOD400 document exists and follows the LOD400 template
- [ ] All acceptance criteria are TESTABLE (not vague)
- [ ] All components listed in LOD200 §4 are covered in LOD400
- [ ] Out-of-scope is explicit — no ambiguity about what is NOT built
- [ ] Data model changes are specified with exact DDL or ORM schema
- [ ] API changes are specified with exact contract (endpoint, method, request, response)
- [ ] Test requirements are specified (who tests what)
- [ ] LOD400 frontmatter is complete: all required fields present

## Part B — Consuming team sign-off

- [ ] Builder agent (consuming team) has reviewed the spec
- [ ] Builder agent has confirmed: "This spec is executable. I have no blocking questions."
- [ ] Builder agent signature is in LOD400 §8

## Part C — Authorization

- [ ] Architecture agent confirms: "This spec is approved for execution"
- [ ] roadmap.yaml updated: lod_status = LOD400_APPROVED, assigned_builder declared

## Gate decision
- **PASS** → advance to L-GATE_B; builder is authorized to begin
- **FAIL** → return to architecture agent for spec revision; record blocking findings

## roadmap.yaml update on GATE_S PASS
```yaml
    lod_status: LOD400_APPROVED
    current_lean_gate: L-GATE_B
    gate_history:
      - gate: L-GATE_S
        result: PASS
        date: [YYYY-MM-DD]
        approved_by: [TEAM_ID]
```
```

---

### D3.4 — `L-GATE_B_BUILD_AND_QA.md`

**Purpose:** Verify build complete + self-QA passed. Merges GATE_3 + GATE_4.

```markdown
# L-GATE_B — Build + QA Gate

**When to run:** After L-GATE_S PASS. Builder has completed implementation.
**This gate merges:** GATE_3 (build complete) + GATE_4 (same-engine QA)

## Part A — Build completeness

- [ ] All LOD400 acceptance criteria have been attempted (none skipped)
- [ ] All LOD400 components are implemented
- [ ] No known blocking bugs
- [ ] LOD500 as-built draft exists (can be revised before L-GATE_V)

## Part B — Same-engine QA (builder's self-review)

- [ ] Builder has reviewed own output against every LOD400 AC
- [ ] Each AC marked: ✅ MATCH / ⚠️ DEVIATION / ❌ MISSING in LOD500 §2
- [ ] Any deviation: LOD400 correction issued (new version) or deviation documented with justification
- [ ] Unit tests run: N/N PASS
- [ ] Integration tests run (if applicable): N/N PASS

## Part C — Deviation handling

If any AC is marked DEVIATION or MISSING:
- [ ] Is the deviation approved by Architecture Agent? If not → spec correction required
- [ ] LOD400 updated to reflect approved deviations
- [ ] LOD500 §3 deviations table is complete

## Gate decision
- **PASS** → advance to L-GATE_V (cross-engine validation)
- **FAIL** → builder corrects issues; re-run this gate; document cycle count

## Critical: what does NOT happen here
- Cross-engine validation does NOT happen at L-GATE_B
- L-GATE_B is self-assessment by the same builder engine
- The independent validator is RESERVED for L-GATE_V — never substitute
```

---

### D3.5 — `L-GATE_V_VALIDATE_AND_LOCK.md`

**Purpose:** Cross-engine independent validation + lock. Equals GATE_5. NEVER compressible.

```markdown
# L-GATE_V — Validate + Lock Gate

**When to run:** After L-GATE_B PASS.
**IRON RULE: This gate is never compressed, never merged, never optional.**
**Validator engine MUST differ from builder engine.**

## Part A — Validator independence verification

- [ ] Validator is declared in team_assignments.yaml
- [ ] Validator engine ≠ builder engine (IRON RULE — blocking if violated)
- [ ] Validator has NOT been involved in building or spec-writing for this WP

## Part B — Independent validation

Validator performs independently (no discussion with builder beforehand):

- [ ] Validator reads LOD400 spec independently
- [ ] Validator reviews builder output (code, config, docs) against each LOD400 AC
- [ ] Validator completes their own fidelity assessment (independent of LOD500 draft)
- [ ] Validator produces findings list: BLOCKER / MAJOR / MINOR

## Part C — Fidelity reconciliation

- [ ] LOD500 §2 fidelity table matches validator's independent assessment
- [ ] Any discrepancy between builder's LOD500 and validator findings: resolved
- [ ] Final fidelity classification agreed: FULL_MATCH / DEVIATIONS_DOCUMENTED

## Part D — Documentation lock

- [ ] LOD500 `lod_status` = LOCKED
- [ ] LOD500 §6 verifying team sign-off is complete
- [ ] roadmap.yaml updated: status = GATE_5_PASS, lod_status = LOD500_LOCKED

## Gate decision
- **PASS (0 blockers)** → WP is COMPLETE; lock LOD500; update roadmap.yaml
- **CONDITIONAL PASS** → only if: 0 blockers + minor findings documented
- **FAIL** → any blocker or unresolved major finding; return to builder; cycle counted

## roadmap.yaml update on GATE_V PASS
```yaml
    status: COMPLETE
    lod_status: LOD500_LOCKED
    current_lean_gate: COMPLETE
    gate_history:
      - gate: L-GATE_V
        result: PASS
        date: [YYYY-MM-DD]
        validator: [TEAM_ID]
        validator_engine: [engine-name]
        builder_engine: [engine-name]
        fidelity: FULL_MATCH
```
```

---

## Deliverable 4 — Config Templates (2 files in `lean-kit/config_templates/`)

### D4.1 — `roadmap.yaml.template`

```yaml
# roadmap.yaml — L0 Work Package State Registry
# -----------------------------------------------
# This file is the SSOT for WP state in L0 (Lean) profile.
# Mirrors AOS DB schema — enables clean L0→L2 migration.
# One entry per work package.

project:
  id: [project-id]              # e.g., my-project
  name: [Project Name]
  profile: L0                   # always L0 for this file
  lean_kit_version: [version]   # from LEAN_KIT_VERSION.md
  created: [YYYY-MM-DD]
  owner: [Team ID]

work_packages:
  - id: [S001-P001-WP001]        # canonical ID: Stage-Program-WP
    label: "[Brief descriptive label]"
    status: [PLANNED|IN_PROGRESS|COMPLETE|BLOCKED|CANCELLED]
    track: [A|B]                 # determines gate sequence
    current_lean_gate: [L-GATE_E|L-GATE_C|L-GATE_S|L-GATE_B|L-GATE_V|COMPLETE]
    lod_status: [LOD100|LOD200|LOD200_APPROVED|LOD300|LOD400|LOD400_APPROVED|LOD500|LOD500_LOCKED]
    assigned_builder: [team-id]
    assigned_validator: [team-id]  # MUST differ from assigned_builder (Iron Rule)
    created_at: [YYYY-MM-DD]
    spec_ref: "work_packages/[WP_ID]/LOD400_spec.md"
    gate_history:
      - gate: L-GATE_E
        result: PASS
        date: [YYYY-MM-DD]
        notes: ""
    notes: ""

  # Add more WPs as needed
```

**Note on validation:** The `assigned_validator` engine must differ from `assigned_builder` engine. This is enforced by the System Designer during L-GATE_E. There is no automated check in L0.

### D4.2 — `team_assignments.yaml.template`

```yaml
# team_assignments.yaml — L0 Team Registry
# -----------------------------------------
# Declares all agents used in this project.
# Enforces cross-engine validation at gate assignment.

project_id: [project-id]
lean_kit_version: [version]

teams:
  - id: team_00                  # System Designer (human)
    role_type: system_designer
    engine: human
    name: "[Name]"
    skills:
      - domain_knowledge
      - decision_authority
      - route_and_escalate
    notes: "Orchestrator only. Never approves content. Never substitutes for validator."

  - id: team_100                 # Architecture Agent
    role_type: architecture_agent
    engine: [claude-code|gemini|openai-codex]
    skills:
      - lod_spec_authoring
      - iron_rule_knowledge
      - mandate_issuance
    notes: "Writes LOD200, LOD400. Reviews at L-GATE_V."

  - id: team_[NNN]               # Builder Agent
    role_type: builder_agent
    engine: [cursor-composer|openai-codex|gemini]  # MUST differ from validator
    skills:
      - [language/framework]
      - lod400_execution
      - lod500_authoring
    notes: "Implements against LOD400. Produces LOD500 draft."

  - id: team_[NNN]               # Validator Agent (cross-engine — IRON RULE)
    role_type: validator_agent
    engine: [different-engine-from-builder]  # IRON RULE: must differ
    skills:
      - independent_review
      - test_execution
      - finding_classification
    notes: "Cross-engine validator at L-GATE_V. Engine MUST differ from builder."

  - id: team_[NNN]               # Documentation Agent (optional — can be same as validator)
    role_type: documentation_agent
    engine: [engine]
    skills:
      - template_completion
      - governance_indexing
    notes: ""

# Cross-engine validation map (auto-check — verify no duplicate engines in builder+validator pairs)
cross_engine_pairs:
  - wp_pattern: "*"              # applies to all WPs unless overridden
    builder: team_[NNN]
    validator: team_[NNN]
    confirmation: "engines differ = YES"  # must be YES
```

---

## Deliverable 5 — Example Project (`lean-kit/examples/example-project/`)

Create a minimal but complete example showing a real L0 project in progress. Use a fictional project "task-tracker" as the example.

### D5 — Files required

**`lean-kit/examples/example-project/roadmap.yaml`**
- A populated `roadmap.yaml` with 2 WPs:
  - WP001: Track A, L-GATE_V PASS (COMPLETE)
  - WP002: Track A, L-GATE_B in progress

**`lean-kit/examples/example-project/team_assignments.yaml`**
- Fully populated with 4 teams (designer, architect, builder, validator)
- Different engines for builder and validator

**`lean-kit/examples/example-project/work_packages/S001-P001-WP001/LOD200_spec.md`**
- Fully populated LOD200 using the D1.2 template
- Fictional but realistic content for "task-tracker" feature

**`lean-kit/examples/example-project/work_packages/S001-P001-WP001/LOD400_spec.md`**
- Fully populated LOD400 using the D1.4 template
- 4-5 acceptance criteria with consuming team sign-off

**`lean-kit/examples/example-project/work_packages/S001-P001-WP001/LOD500_asbuilt.md`**
- Fully populated LOD500 using the D1.5 template
- FULL_MATCH fidelity, verifying team sign-off, locked status

---

## Quality Requirements

1. **Templates are immediately usable** — a team can open a template, fill in `[PLACEHOLDERS]`, and have a valid document. No "see also" without a direct path reference.

2. **Consistent terminology** — use only canonical terms from the LOD Standard v0.3: `L-GATE_E/C/S/B/V`, `TRACK_A/B`, `LOD100-500`, `L0/L2/L3`, `lod_status`, `current_lean_gate`. Never use old terms (GATE_6/7/8, "manual mode", "AOS_COMPACT").

3. **YAML validity** — all `.yaml` and `.yaml.template` files must be valid YAML. Use a YAML linter before submitting.

4. **Markdown formatting** — all headers, tables, and code blocks must render correctly. Use standard GitHub-flavored Markdown.

5. **No circular references** — gate checklists reference templates by filename, not by content. Templates reference the LOD Standard by path, not inline.

6. **Iron Rules must appear where relevant** — every gate checklist must surface the applicable Iron Rules (especially cross-engine at L-GATE_V).

7. **Example project must pass its own checklists** — the example project's LOD documents must pass the gate checklists they claim to have passed. Internally consistent.

---

## Submission

Submit all deliverables to `_COMMUNICATION/_ARCHITECT_INBOX/` in the TikTrack repo:

**One ZIP or directory submission** named:
`TEAM_170_S003_P017_WP002_LEAN_KIT_CONTENT_v1.0.0/`

Containing the full directory tree:
```
TEAM_170_S003_P017_WP002_LEAN_KIT_CONTENT_v1.0.0/
├── templates/           (5 files)
├── team_roles/          (5 files)
├── gates/               (5 files)
├── config_templates/    (2 files)
└── examples/
    └── example-project/ (5+ files)
```

Also submit a brief cover note: `TEAM_170_TO_TEAM_100_S003_P017_WP002_SUBMISSION_v1.0.0.md` listing:
- Files produced (count per directory)
- Any ambiguities encountered and resolutions
- Self-assessment: do the example project docs pass the gate checklists? (YES/NO)
- Total word count (rough estimate)

---

## Gate sequence for this WP

```
GATE_0–GATE_2: complete (this mandate = GATE_2 auth)
GATE_3: Team 170 execution (your task)
GATE_4: Team 170 self-QA (checklist above + YAML lint + example consistency check)
GATE_5: Team 190 cross-engine validation (content review against LOD Standard v0.3)
```

---

*log_entry | TEAM_100 → TEAM_170 | S003-P017-WP002 | GATE_2_MANDATE_ISSUED | 2026-04-02*

historical_record: true
