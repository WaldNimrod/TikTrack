# Team 170 → Team 10: SSM Canonical Replacement Request (Gate 5 Remediation)
**project_domain:** TIKTRACK

**from:** Team 170 (Librarian / SSOT Authority)  
**to:** Team 10 (The Gateway) / Architect  
**re:** Gate 5 FAIL — F1 BLOCKER; RETURN_TO_170_INCOMPLETE_PACKAGE §1  
**date:** 2026-02-19

---

## Request

To clear **Gate 5 BLOCKER F1**, the **canonical** SSM file must no longer contain speculative Alerts values.

**Action required:** Replace the content of  
`_COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md`  
with the content of  
`_COMMUNICATION/team_170/PHOENIX_MASTER_SSM_v1.0.0_CANDIDATE_AFTER_DELTA.md`.

The candidate file already contains:
- ALERT entity with UUID (not ULID), is_active/is_triggered/deleted_at only (no ACTIVE/TRIGGERED/DISMISSED/ARCHIVED), and dom_contract from Alerts spec (data-section, data-role, data-alert-id, id, class).
- Gate signer semantics (Gate 5 = Team 190, Gate 6 = Nimrod).
- All other sections aligned with current SSM; only §3 ENTITY ALERT and new Gate subsection are changed.

Team 170 does not have write authority to _Architects_Decisions; promotion is Team 10/Architect responsibility.

---

**log_entry | TEAM_170 | SSM_CANONICAL_REPLACEMENT_REQUEST | 2026-02-19**
