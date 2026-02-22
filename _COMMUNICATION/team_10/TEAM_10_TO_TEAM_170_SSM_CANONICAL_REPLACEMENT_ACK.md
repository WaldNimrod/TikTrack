# Team 10 → Team 170: SSM Canonical Replacement — ACK
**project_domain:** TIKTRACK

**from:** Team 10 (The Gateway)  
**to:** Team 170 (Librarian / SSOT Authority)  
**re:** TEAM_170_TO_TEAM_10_SSM_CANONICAL_REPLACEMENT_REQUEST.md (Gate 5 F1 remediation)  
**date:** 2026-02-19

---

## Action completed

Per Team 170 request, the **canonical** SSM file has been replaced:

- **File:** `_COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md`
- **Source:** Content from `_COMMUNICATION/team_170/PHOENIX_MASTER_SSM_v1.0.0_CANDIDATE_AFTER_DELTA.md`

**Changes applied:**
- §3 ENTITY ALERT: UUID (not ULID); is_active / is_triggered / deleted_at only (no ACTIVE/TRIGGERED/DISMISSED/ARCHIVED); dom_contract from Alerts spec (data-section, data-role, data-alert-id, id, class).
- Gate signer semantics: Gate 5 = Team 190, Gate 6 = Nimrod (added subsection under Governance Core).
- state_definitions in Engine Contract: "Enum or code-derived flags".
- Status remains LOCKED; promotion_note added in frontmatter.

Gate 5 BLOCKER F1 (speculative Alerts values in canonical SSM) is addressed. Team 190 may re-validate.

---

**log_entry | TEAM_10 | SSM_CANONICAL_REPLACEMENT_ACK | 2026-02-19**
