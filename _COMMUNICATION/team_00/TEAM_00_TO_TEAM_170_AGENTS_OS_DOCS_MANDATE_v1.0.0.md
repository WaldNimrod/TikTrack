# Team 00 → Team 170 — Agents_OS Documentation Mandate
## TEAM_00_TO_TEAM_170_AGENTS_OS_DOCS_MANDATE_v1.0.0.md

**project_domain:** AGENTS_OS
**from:** Team 00 (Chief Architect)
**to:** Team 170 (Governance Documentation)
**cc:** Team 100, Team 10
**date:** 2026-03-14
**status:** ACTIVE_MANDATE
**priority:** HIGH — blocks S002-P005 team onboarding and all future Agents_OS programs

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 (primary consumer) |
| task_id | AGENTS_OS_DOCS_MANDATE |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 170 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | AGENTS_OS |

---

## 1. Decision: Documentation Architecture

**Team 170 reviewed their options (A/B/C/D) in `TEAM_170_AGENTS_OS_DOCUMENTATION_STATE_AND_WORK_PLAN_OPTIONS_v1.0.0.md`.**

**Architect decision: Option B (Structured Index + Organization under `agents_os/`)**

Rationale:
- Option A (index only) leaves the "no physical home" problem unsolved — teams still wander between 4 directories
- Option C (full parallel structure) is premature — Agents_OS is not yet as mature as TikTrack; over-engineering the doc structure now creates maintenance burden
- Option D (hybrid) is correct short-term but doesn't commit to a clear directory contract
- **Option B** creates a discoverable, canonical home (`agents_os/documentation/`) with index — extensible to Option C later without breaking anything

---

## 2. Canonical Directory Contract (Locked by This Mandate)

```
agents_os/
├── documentation/                    ← NEW (create this)
│   ├── 00_AGENTS_OS_MASTER_INDEX.md  ← NEW (see Section 3)
│   ├── 01-FOUNDATIONS/               ← NEW (links/summaries)
│   ├── 02-ARCHITECTURE/              ← NEW (unique to Agents_OS)
│   ├── 03-PROCEDURES/                ← NEW (links to shared procedures)
│   └── 04-TEMPLATES/                 ← NEW (link to governance templates)
├── README.md                         ← UPDATE (add link to documentation/)
├── AGENTS_OS_FOUNDATION_v1.0.0.md   ← KEEP, add to index
├── docs-governance/                  ← KEEP unchanged
│   ├── AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/
│   └── AOS_workpack/
└── agents_os_v2/                     ← KEEP (code, not docs)
```

**Separation rule (Iron Rule, do not violate):**
- `agents_os/documentation/` = Agents_OS-specific documentation only
- `documentation/docs-governance/` = shared governance (gates, WSM, procedures) — never replicate here
- Documents that are "shared" (Gate Model, Program Registry) are referenced by link from the index, never copied

---

## 3. Deliverables — Phase 1 (Fast, ~2 hours)

### D1.1 — `agents_os/documentation/00_AGENTS_OS_MASTER_INDEX.md`

**Format:** Table of all Agents_OS documentation, organized by category:

```markdown
# Agents_OS Documentation Master Index

## Quick Navigation
- Foundations → [agents_os/AGENTS_OS_FOUNDATION_v1.0.0.md]
- Operating Procedures (V2) → [documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md]
- Program Registry (all programs) → [documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md]
- Architecture Concept Package → [agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/]

## Index Table
| Document | Type | Location | Status | Notes |
|---|---|---|---|---|
| AGENTS_OS_FOUNDATION_v1.0.0.md | Foundation | agents_os/ | CURRENT | Core foundation spec |
| AGENTS_OS_V2_OPERATING_PROCEDURES | Procedures | docs-governance/04-PROCEDURES/ | CURRENT | V2 operating manual |
| ARCHITECTURAL_CONCEPT.md | Architecture | agents_os/docs-governance/Phase1... | CURRENT | Domain isolation model |
| DOMAIN_ISOLATION_MODEL.md | Architecture | agents_os/docs-governance/Phase1... | CURRENT | ... |
| AOS_WORKSPACE_PROTOCOL.md | Procedures | agents_os/docs-governance/AOS_workpack/ | CURRENT | ... |
| ... | ... | ... | ... | ... |
```

**Required sections in the index:**
1. Foundations (who is Agents_OS, what problem it solves)
2. Architecture (isolation model, V2 orchestrator, domain separation)
3. Operating Procedures (pipeline flow, team roles, gate sequence)
4. Templates (LLD400, LOD200 — links to governance)
5. Program History (S001/S002 programs, link to archives)
6. Decisions Log (link to `_COMMUNICATION/_Architects_Decisions/`)

---

### D1.2 — `agents_os/documentation/01-FOUNDATIONS/AGENTS_OS_OVERVIEW.md`

**NEW document** — 2-3 page system overview for onboarding:

Required sections:
1. **What is Agents_OS** — one paragraph, precise definition (not a product, a governance + automation layer)
2. **Problem it solves** — TikTrack without Agents_OS = 100% manual prompts; Agents_OS = structured mandate generation, gate enforcement, context injection
3. **V1 vs V2** — what changed (V1 = POC observers; V2 = full orchestrator with pipeline, mandates, multi-domain)
4. **Key components** (1 line each):
   - `agents_os_v2/orchestrator/pipeline.py` — gate engine, mandate generation
   - `agents_os_v2/orchestrator/state.py` — pipeline state manager
   - `agents_os_v2/observers/state_reader.py` — POC-1 observer, STATE_SNAPSHOT
   - `pipeline_run.sh` — CLI wrapper (the primary interface)
   - `PIPELINE_DASHBOARD.html` — visual UI for pipeline management
   - `PIPELINE_ROADMAP.html` — portfolio map
5. **How to start a new program** (5 steps, links to pipeline_run.sh reference)
6. **How to contribute** (writing authority: Team 10 implements, Team 170 docs, Team 00 approves)

---

### D1.3 — `agents_os/documentation/02-ARCHITECTURE/AGENTS_OS_ARCHITECTURE_OVERVIEW.md`

**NEW document** — architecture reference for Team 10 and future teams:

Required sections:
1. **Domain Isolation Model** — TikTrack vs Agents_OS separation; why they don't import each other
2. **Pipeline Architecture** — gate sequence diagram (text/ASCII), gate types (normal/mandate/human/self-loop)
3. **Mandate Engine Architecture** — MandateStep → `_generate_mandate_doc()` → tab per team → coordination injection → correction cycles
4. **Multi-Domain Design** — `--domain` flag, parallel pipelines, state file isolation
5. **CLI Interface Reference** — complete `pipeline_run.sh` command table (all subcommands with usage)
6. **Dashboard Architecture** — which HTML file does what, how they consume `pipeline_state.json` and `STATE_SNAPSHOT.json`

---

### D1.4 — Update `agents_os/README.md`

**Existing file** — add a navigation block at the top:

```markdown
## Documentation

Full documentation for Agents_OS:
→ **[agents_os/documentation/00_AGENTS_OS_MASTER_INDEX.md](documentation/00_AGENTS_OS_MASTER_INDEX.md)**

Quick links:
- System overview: [documentation/01-FOUNDATIONS/AGENTS_OS_OVERVIEW.md](...)
- Architecture: [documentation/02-ARCHITECTURE/AGENTS_OS_ARCHITECTURE_OVERVIEW.md](...)
- Operating procedures: [docs-governance/ → AGENTS_OS_V2_OPERATING_PROCEDURES]
- Start a new program: pipeline_run.sh reference → documentation/02-ARCHITECTURE/
```

---

### D1.5 — Update `00_MASTER_INDEX.md` (repo root)

Add Agents_OS section:
```markdown
## Agents_OS Documentation
→ `agents_os/documentation/00_AGENTS_OS_MASTER_INDEX.md` — Master index for all Agents_OS documentation
```

---

## 4. Deliverables — Phase 2 (Substantive, ~4-6 hours)

### D2.1 — `agents_os/documentation/03-PROCEDURES/AGENTS_OS_PIPELINE_REFERENCE.md`

**Full CLI reference** for `pipeline_run.sh`:
- Every subcommand: syntax, when to use, example output
- Gate progression flow (with examples from the S002-P002-WP003 experiment)
- Correction cycle flow (GATE_8 example with Team 70 → Team 90 correction)
- Phase-advance flow (phase2 command, prereq warnings)

### D2.2 — `agents_os/documentation/02-ARCHITECTURE/MANDATE_ENGINE_REFERENCE.md`

**For Team 10 and Team 190 developers:**
- `MandateStep` dataclass fields and their purpose
- `_generate_mandate_doc()` output format
- Coordination injection patterns (reads_from, reads_label)
- How to add a new gate to GATE_CONFIG
- How to add a new mandate type

### D2.3 — `agents_os/documentation/04-TEMPLATES/` (links only)

Create placeholder files that redirect to canonical locations:
- `LLD400_TEMPLATE.md` → link to `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/LLD400_TEMPLATE_v1.0.0.md`
- `LOD200_TEMPLATE.md` → link similarly

---

## 5. Acceptance Criteria

### Phase 1 Acceptance (Team 00 validates):
- [ ] `agents_os/documentation/` directory exists
- [ ] `00_AGENTS_OS_MASTER_INDEX.md` covers all documents listed in Team 170's gap analysis §2 (no omissions)
- [ ] `AGENTS_OS_OVERVIEW.md` is self-contained — a new team member can understand the system from this file alone
- [ ] `AGENTS_OS_ARCHITECTURE_OVERVIEW.md` covers all 6 required sections
- [ ] No documents replicated — all cross-references are links
- [ ] `00_MASTER_INDEX.md` (root) updated with Agents_OS section
- [ ] `agents_os/README.md` updated with navigation block

### Phase 2 Acceptance (Team 90 validates, Team 00 approves):
- [ ] `AGENTS_OS_PIPELINE_REFERENCE.md` covers all current `pipeline_run.sh` commands
- [ ] `MANDATE_ENGINE_REFERENCE.md` is sufficient for Team 10 to add a new mandate type without asking Team 00
- [ ] Team 170 internal confirmation: "A new Team 61 can onboard to Agents_OS using only the documentation folder"

---

## 6. Constraints

- Team 170 writes to `_COMMUNICATION/team_170/` first (draft), then Team 10 promotes to `agents_os/documentation/` per Knowledge Promotion Protocol
- Do NOT modify `documentation/docs-governance/` content — only link from there
- Do NOT rewrite or restructure `agents_os_v2/` code comments — that is code ownership, not docs
- Phase 1 is **non-blocking for S002-P005 activation** but should be complete before S002-P005 GATE_3 (when Team 10 will need the mandate engine reference)
- Phase 2 target: before S002-P005 GATE_5

---

**log_entry | TEAM_00 | AGENTS_OS_DOCS_MANDATE | ISSUED | 2026-03-14**
