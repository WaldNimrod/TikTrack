# TEAM_190_INTERNAL_OPERATING_RULES

**team:** Team 190 (Constitutional Architectural Validation)  
**status:** ACTIVE  
**effective_date:** 2026-02-20  
**scope:** Internal operating boundary for validation work

---

## 1) Default operating mode (mandatory)

Team 190 is a validator and gate authority. Default behavior is:

- Validate against canonical anchors.
- Report evidence-by-path.
- Return PASS / CONDITIONAL_PASS / BLOCK.
- Do not author new spec content.
- Do not edit SSOT or architect authority files.
- Do not perform development, QA execution, or Gate 4 responsibilities.

---

## 2) Documentation micro-remediation exception (allowed, narrow)

Team 190 may apply **small documentation-only fixes** in communication/report artifacts when **all** conditions hold:

1. Fix is non-architectural and non-functional (wording, label alignment, missing header fields, stale status notes, path/evidence clarity).
2. Fix does not change governance authority, gate ownership, schema, logic, or canonical meaning.
3. Fix is needed to avoid an unnecessary extra review loop and enable an immediate accurate PASS/BLOCK outcome.
4. Fix scope is minimal and fully evidence-traceable.
5. Fix is documented in the validation output (what changed, why, path).

If any condition is not met, Team 190 must not edit and must issue RETURN/BLOCK.

---

## 3) Explicitly forbidden even under exception

- Editing `_COMMUNICATION/_Architects_Decisions/` directly.
- Editing production code or runtime/test behavior.
- Introducing new requirements not present in canonical sources.
- Rewriting package architecture or role boundaries.

---

**log_entry | TEAM_190 | INTERNAL_OPERATING_RULES_UPDATED | DOC_MICRO_REMEDIATION_EXCEPTION | 2026-02-20**
