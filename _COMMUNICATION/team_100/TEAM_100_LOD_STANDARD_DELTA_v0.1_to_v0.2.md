# LOD Standard — Delta Document: v0.1 → v0.2

**date:** 2026-04-02
**Prepared by:** Team 100
**Purpose:** Document every change from v0.1 to v0.2, with rationale and research backing.
**Companion document:** `TEAM_100_LOD_STANDARD_v0.2.md`

---

## Overview

v0.2 makes 9 categories of changes. None of the core LOD100–500 definitions are wrong in v0.1 — the changes are additive, clarifying, or structural. The most significant changes are: (1) the Track A/B split for LOD300, (2) machine-readable frontmatter requirement, (3) authority matrix, (4) versioning policy, and (5) the AOS v3 overlay section.

---

## Change 1 — LOD300: Two-track model (§3, §4)

### What changed
Added a formal **Track A / Track B** split. LOD300 is now conditional — required for Track B (complex features), optional and typically skipped for Track A.

### Previous state (v0.1)
LOD300 was presented as a standard level alongside the others, with no explicit guidance on when to skip it. This created two problems: (a) teams that skip LOD300 felt they were deviating from the standard; (b) teams that applied LOD300 to trivial features wasted specification effort.

### Logic
The industry pattern is well-established: PRD → RFC → Tech Spec for complex features; PRD → Tech Spec for simple ones. The RFC / Design Doc middle layer exists to resolve system behavior questions before implementation-ready specification. For single-component or pattern-following features, this layer adds overhead without value.

For LLM agent systems specifically, research on Plan-then-Execute (P-t-E) architectures confirms: the planning document (functionally equivalent to LOD300) improves executor output quality for complex tasks with component boundaries, but creates "over-specification" overhead for bounded tasks where behavior is already deterministic from the concept.

### Track B trigger criteria (any one sufficient)
- 2+ backend systems or APIs involved
- New or modified state machine / async coordination
- New persisted data model (schema changes)
- Multiple agents or teams in the build sequence
- HIGH / CRITICAL risk classification
- Spec author cannot determine component interfaces without resolving behavior first

### Impact on AOS v3
In practice, most AOS v3 work packages proceed LOD200 → LOD400 → LOD500 (Track A). The Track B path was always available implicitly but was not formally defined. This change makes it explicit and adds the criteria that trigger it.

---

## Change 2 — Machine-readable YAML frontmatter (§5)

### What changed
Added a mandatory YAML frontmatter specification for all LOD documents, including extended fields for LOD500.

### Previous state (v0.1)
LOD labeling was described as a document-level label (§8, §10) but no format was specified. This meant LOD could only be identified by reading document content — not by automated tooling.

### Logic
In a multi-agent pipeline, agents must be able to identify a document's LOD, status, authoring team, and consuming team programmatically. Without a structured format, every agent must parse natural language to determine these properties — unreliable and inconsistent.

The minimum fields (`lod_target`, `lod_status`, `track`, `authoring_team`, `consuming_team`, `date`, `version`, `supersedes`) provide everything needed for:
- Automated LOD validation
- Governance tooling (date-lint, status checks)
- Pipeline state correlation (which gate maps to which LOD)
- Audit trail reconstruction

The LOD500 extension (`fidelity`, `verifying_team`, `spec_ref`) enables automated fidelity tracking.

### AOS v3 alignment
This aligns with the existing frontmatter convention used throughout the project (`id`, `from`, `to`, `date`, `status` fields in communication documents). The LOD fields follow the same pattern.

---

## Change 3 — Declaration authority matrix (§6)

### What changed
Added a formal authority matrix specifying who may produce and who must approve each LOD level.

### Previous state (v0.1)
No authority rules. The implicit assumption was that any team producing an LOD document could declare its level. This creates the "self-certified LOD500" anti-pattern.

### Logic
LOD level declaration is a claim about completeness. For LOD400, the consuming team is best positioned to evaluate whether the spec is actually executable — they are the ones who will be blocked by any gap. Requiring their sign-off before implementation begins surfaces specification gaps at the cheapest possible moment (pre-implementation, not during correction cycles).

For LOD500, the implementing team has an inherent conflict of interest in assessing their own fidelity. Independent sign-off is structurally required.

### AOS v3 mapping
- LOD400 consuming team sign-off maps to GATE_2 approval by Team 61/11 before implementation begins
- LOD500 independent sign-off maps to GATE_5 AS_MADE_LOCK by Team 170 + Team 90 validation

---

## Change 4 — Versioning policy (§7)

### What changed
Added a full versioning policy: version format, lifecycle states, immutability rule, correction cycle procedure.

### Previous state (v0.1)
No versioning policy. Documents were implicitly mutable ("living documents"). This is incompatible with a gate-based pipeline where spec version determines what was approved at each gate.

### Logic
In a multi-gate pipeline, the question "what was approved at GATE_2?" requires a precise answer. If the LOD400 was modified after approval without versioning, the answer is ambiguous. The approved version must be immutable and superseded versions must be retained.

The correction cycle case is especially important: when implementation reveals a spec gap, the LOD400 must be updated to a new version. Without this, the LOD500 has no clear spec to compare against.

### Alignment with AOS v3 convention
Version format `_v{major}.{minor}.{patch}` is already canonical across the project. This change formally adopts it as required for LOD documents.

---

## Change 5 — LOD500 execution fidelity requirement (§4, LOD500 definition)

### What changed
Added "execution fidelity" as an explicit required component of LOD500, along with the requirement for independent sign-off.

### Previous state (v0.1)
LOD500 included "deviations from spec" but did not frame this as an *execution fidelity record* or explicitly require independent verification.

### Logic
The unique problem in agentic systems is that the implementing agent may produce output that looks complete but diverges from spec in non-obvious ways. Traditional code review catches this, but in multi-agent pipelines the reviewer may be a different agent with no access to the original LOD400 intent.

Making fidelity an explicit documented field (FULL_MATCH / DEVIATIONS_DOCUMENTED / PARTIAL) forces this comparison to happen deliberately, not incidentally. The `spec_ref` field in LOD500 frontmatter creates a direct link from as-built record to as-designed spec.

### AOS v3 mapping
LOD500 fidelity maps to the GATE_4/GATE_5 "האם מה שנבנה הוא מה שאישרנו?" question. The answer must now be explicitly recorded in LOD500, not just assessed informally.

---

## Change 6 — Gate mapping (§AOS, correcting GATE_6 reference)

### What changed
Added §AOS overlay with correct gate-to-LOD mapping based on the **5-gate + GATE_0 model** (GATE_0 through GATE_5). Removed all references to GATE_6, GATE_7, GATE_8 as active gates.

### Previous state (Team 100 review)
The previous architectural review mentioned LOD500 mapping to "GATE_5/GATE_6" — this was an error, as GATE_6 is a LEGACY alias (= GATE_4 in the 5-gate model).

### Canonical gate model
Per `ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md` (locked 2026-03-19):
- Active gates: GATE_0 through GATE_5
- GATE_6 = LEGACY (aliased to GATE_4)
- GATE_7 = LEGACY (aliased to GATE_4)
- GATE_8 = LEGACY (aliased to GATE_5)

### Correct mapping
- LOD200 → GATE_1 exit (Needs and Planning)
- LOD400 → GATE_2 exit (Specification, LLD400 approved)
- LOD500 → **GATE_5 exit** (Documentation, AS_MADE_LOCK)

### Gate drift note (separate action item)
Investigation confirms that GATE_6/7/8 language persists in multiple files despite the 2024-03-24 cleanup mandate:
- `definition.yaml` still defines GATE_0–GATE_8 in gate_authority fields
- Several `documentation/docs-governance/` files reference GATE_6/7/8 without LEGACY banners

This is a separate urgent action item — see "Gate Drift Action" below.

---

## Change 7 — Team references generalized (§9, §AOS)

### What changed
Replaced specific team numbers (team_100, team_51, team_61, etc.) in general sections with role-type labels (architecture team, QA team, validation team, etc.). AOS v3 specifics moved to §AOS.

### Previous state (v0.1)
The draft used no team-number references. The original Team 100 review introduced them. Since the standard is cross-project, team numbers must not appear in the general sections.

### Logic
The LOD standard is intended to be usable by any project using LLM agents, not only AOS v3. Role-type labels (architecture agent, builder agent, QA agent) are universally applicable. Team numbers are AOS v3-specific implementation details.

The §AOS overlay maps the generic roles to specific AOS v3 teams for users operating within that system.

---

## Change 8 — Anti-patterns expanded (§12)

### What changed
Added four new anti-patterns: LOD creep, orphan LOD500, self-certified LOD500, correction without spec update.

### Previous state (v0.1)
Four anti-patterns: Fake LOD400, Inflated LOD, Mixed-state document, Hidden ambiguity. These are correct but incomplete.

### New additions

**LOD creep:** The gradual accumulation of detail in a lower-LOD document without formal promotion. This is common in collaborative environments where a LOD200 gets iteratively refined until it looks like a LOD400 — but because it was never formally promoted, it still lacks the systematic completeness checks that LOD400 requires.

**Orphan LOD500:** Writing LOD500 from memory after the fact, without run evidence. This violates the "what is true now" requirement — retroactive documentation without evidence is speculation dressed as record.

**Self-certified LOD500:** The implementing team approving their own LOD500. This is specifically a problem in agent systems where the builder agent may assess its own fidelity. Cross-team/cross-engine sign-off is structurally required.

**Correction without spec update:** Fixing the implementation in a correction cycle without updating the LOD400. This severs the traceability chain and makes future LOD500 production impossible (there is no spec to compare against).

---

## Change 9 — Agentic corrections agent added (§9)

### What changed
Added "Correction / remediation agent" to the agentic system mapping.

### Previous state (v0.1)
Four agent types: product/strategy, architecture/spec, builder, QA/validator.

### Logic
Multi-gate pipelines that include correction cycles have a distinct agent role: the agent that analyzes a FAIL verdict, identifies root cause, and produces an updated LOD400. This is not the same as the original spec author (it may run on a different engine) and not the same as the QA agent (it produces a new spec, not evidence).

In AOS v3, this role appears as Team 190 (constitutional validator) analyzing FAIL findings and issuing updated specification directions. The consuming team then implements against LOD400 v2.

---

## Summary of all changes

| Change | Category | Impact | Urgency |
|--------|----------|--------|---------|
| Track A/B split for LOD300 | Structural | HIGH | Required |
| Machine-readable YAML frontmatter | Structural | HIGH | Required |
| Declaration authority matrix | Governance | HIGH | Required |
| Versioning policy | Governance | HIGH | Required |
| LOD500 execution fidelity | Definition | HIGH | Required |
| Gate mapping correction (GATE_5, not GATE_6) | AOS-specific | HIGH | Required |
| Team references generalized | Language | MEDIUM | Required |
| Anti-patterns expanded | Guidance | MEDIUM | Recommended |
| Correction agent added | Guidance | LOW | Recommended |

---

## Separate action item: Gate drift remediation

**Finding (from §AOS investigation):**
GATE_6/7/8 language persists in:
- `agents_os_v3/definition.yaml` — defines gate_authority entries for GATE_6, GATE_7, GATE_8
- `documentation/docs-governance/04-PROCEDURES/GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md` — no LEGACY banner
- `documentation/docs-governance/01-FOUNDATIONS/GATE_LIFECYCLE_DESCRIPTION_AND_OWNERS_v1.1.0.md` — may lack LEGACY annotation

**Root cause:** The 2026-03-24 cleanup mandate added LEGACY annotations to some files but missed others. `definition.yaml` was not updated to remove GATE_6/7/8 from `gate_authority`.

**Required action:** Issue a targeted mandate to Team 170 (documentation owner) to:
1. Add LEGACY banner to any `docs-governance/` file that references GATE_6/7/8 without one
2. Update `agents_os_v3/definition.yaml` to remove or clearly mark GATE_6/7/8 `gate_authority` entries as LEGACY

**Why this matters for the LOD standard:** The §AOS overlay maps LOD500 to GATE_5. If GATE_5 references in tooling or documentation are shadowed by lingering GATE_6/7/8 definitions, the LOD–gate mapping will silently produce incorrect behavior in agent workflows.

---

*log_entry | TEAM_100 | LOD_STANDARD_DELTA_v0.1_to_v0.2 | 2026-04-02*

historical_record: true
