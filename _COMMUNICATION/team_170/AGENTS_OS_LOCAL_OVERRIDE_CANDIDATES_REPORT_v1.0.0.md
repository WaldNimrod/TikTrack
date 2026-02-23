# AGENTS_OS_LOCAL_OVERRIDE_CANDIDATES_REPORT_v1.0.0

**project_domain:** SHARED  
**from:** Team 170  
**to:** Team 190  
**mandate:** TEAM_190_TO_TEAM_170_CROSS_DOMAIN_STRUCTURE_IMPLEMENTATION_MANDATE_v1.0.0  
**date:** 2026-02-22

---

## 1. Quarantine (move-only, Stage 3 resolution)

Candidates with known semantic drift vs shared canonical (per TEAM_190_CROSS_DOMAIN_DOCUMENTATION_INTELLIGENCE_REPORT_2026-02-22 F4) were moved to a dedicated quarantine folder. No content edits.

| Candidate | Previous location | Current location (post-move) |
|-----------|-------------------|------------------------------|
| MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.4.0.md | `agents_os/docs-governance/MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.4.0.md` | `agents_os/docs-governance/99-QUARANTINE_STAGE3/MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.4.0.md` |

**Rationale:** Document uses historical gate framing and legacy identity hierarchy (roadmap_id / initiative_id / work_package_id / task_id) conflicting with current S-P-WP-T canonical model; references shared anchors via old paths. Isolating prevents accidental authoritative consumption before Stage 3 content standardization.

---

## 2. Other domain-local artifacts (not quarantine)

| Path | Note |
|------|------|
| `agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/` | Aligned with LLD400 and current gate model; no drift. |
| `agents_os/docs-governance/AOS_workpack/` | Placeholder/stub payloads; F6 bounded exception; Stage 3 resolution. |

---

## 3. Invariant

Domain-local override does not modify shared canonical artifacts. Quarantine is physical isolation only; content resolution is Stage 3.

---

**log_entry | TEAM_170 | AGENTS_OS_LOCAL_OVERRIDE_CANDIDATES_REPORT | v1.0.0 | 2026-02-22**
