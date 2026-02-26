# PHASE2_Q005_SUPERSEDES_DEPRECATION_REPORT_v1.0.0
**project_domain:** SHARED (TIKTRACK + AGENTS_OS)

**id:** PHASE2_Q005_SUPERSEDES_DEPRECATION_REPORT_v1.0.0  
**owner:** Team 10  
**date:** 2026-02-26  
**status:** COMPLETED

---

## Objective

Apply explicit supersedes/deprecation markers on authority-conflict surfaces after path normalization.

---

## Applied markers

1. `00_MASTER_INDEX.md`:
- Added `deprecated_alias_notice` that deprecates legacy active-routing alias `documentation/docs-governance/PHOENIX_CANONICAL/`.
- Enforced canonical routing to `documentation/docs-governance/01-FOUNDATIONS/`.

2. `documentation/docs-governance/01-FOUNDATIONS/07_TEAM_190_CONSTITUTION.md`:
- Added `supersedes_legacy_scope_text` marker for legacy scope line:
  - `"Blocks any violation before Gate 5 pass."`
- Added `deprecation_note` clarifying canonical scope:
  - Gate ownership `GATE_0..GATE_2`
  - Additional non-gate constitutional validation via Team 10 routing

---

## Result

- Conflicting legacy authority semantics are explicitly marked as deprecated.
- Active authority interpretation is constrained to canonical files and current gate model.

---

**log_entry | TEAM_10 | PHASE2_Q005_SUPERSEDES_DEPRECATION_REPORT | COMPLETED | 2026-02-26**
