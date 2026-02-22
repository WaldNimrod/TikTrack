# Team 90 -> Team 10 | ADR Numbering Convention + Version Alignment Review
**project_domain:** TIKTRACK

**from:** Team 90 (External Validation Unit)  
**to:** Team 10 (Gateway)  
**cc:** Architect, Team 70  
**date:** 2026-02-16  
**status:** CONDITIONAL PASS (2 mandatory amendments)  
**subject:** Validation of ADR numbering proposal against Phoenix versioning model

---

## 1) Validation Result

| Requested check | Result | Notes |
|---|---|---|
| Compatibility with Phoenix versioning model | PARTIAL PASS | ADR ID convention is safe; `sv` semantic in proposal conflicts with existing SV policy |
| No collision with documentation/system/governance versioning | PARTIAL PASS | Numbering is safe; `sv = document schema version` is not safe in current SSOT |
| Authority Alignment compatibility | PASS | Decision identity and release version can be fully separated with a small metadata adjustment |

---

## 2) Findings

### F1 (P1) - `sv` semantic conflict with locked versioning policy
Current SSOT defines **SV as System Version** (Ceiling governance), not document schema version.

Evidence:
- `documentation/10-POLICIES/TT2_VERSIONING_POLICY.md`
- `documentation/05-PROCEDURES/TT2_VERSIONING_PROCEDURE.md`
- `documentation/10-POLICIES/TT2_VERSION_MATRIX.md`

Impact:
If ADR files redefine `sv` as document-schema version, we create a governance collision with system release semantics.

### F2 (P2) - Backward compatibility for existing ADR IDs
Repository contains multiple legacy ID styles (e.g., `ADR-013`, `ADR-017`, `ADR-HEADER-001`).

Impact:
Hard-renaming old IDs now will create unnecessary reference churn.

---

## 3) Mandatory Amendments (for full approval)

1. **Keep `sv` = System Version applicability** in ADR frontmatter (e.g., `sv: 1.0.0`).
2. Add separate field for template/schema revision, e.g.:
   - `doc_schema_version: 1.0`
3. Adopt new ADR ID format **for new/updated decisions only**:
   - `ADR-ARCH-XXX`
   - `ADR-GOV-XXX`
   - `ADR-SYS-XXX`
   - `ADR-PROD-XXX`
4. Do **not** rename historical ADR IDs unless a specific document is reopened.

---

## 4) Locked Safe Model (recommended)

- `id` = decision identity (domain + sequence)
- `sv` = system-version applicability (aligned with Ceiling policy)
- `doc_schema_version` = template/metadata schema revision
- `last_updated` = document revision date

This preserves strict separation between:
- Decision identity
- Document schema revision
- System release version

---

## 5) Final Status

**Conditional PASS**.  
Moves to **FULL PASS** after Team 70 updates the template/procedure metadata fields per section 3 and Team 90 re-checks.

**log_entry | TEAM_90 | ADR_NUMBERING_VERSION_ALIGNMENT_REVIEW | CONDITIONAL_PASS | 2026-02-16**
