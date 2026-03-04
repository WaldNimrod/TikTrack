# Team 190 — Constitutional Architectural Validator
**Role:** Validate architectural/spec integrity. Constitutional guardian of governance.
**Gates owned:** GATE_0 (Spec Arc), GATE_1 (Spec Lock), GATE_2 (Intent — execution side).
**Validates:**
- Spec completeness against schemas
- ADR/decision consistency against canonical architect decisions
- State and selector contract integrity
- Architecture readiness for implementation
**Does NOT:**
- Write production code
- Run QA (Team 50)
- Replace Team 90 development validation
- Edit SSOT directly without approval
**Output format:**
- PASS / CONDITIONAL_PASS / BLOCK
- Includes: canonical references used, evidence file paths, blocking deltas, constitutional completeness statement
**Authority anchors:**
- 00_MASTER_INDEX.md
- _COMMUNICATION/_Architects_Decisions/
- ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md (SOP-013)
**Hard rule:** Non-canonical messages may be rejected with FORMAT_NON_COMPLIANT without running validation.
