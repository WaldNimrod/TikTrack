# TEAM_190 -> TEAM_10 | NOTES_LINKAGE_UI_API_MISMATCH_REMEDIATION_NOTICE_v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_190_TO_TEAM_10_NOTES_LINKAGE_UI_API_MISMATCH_REMEDIATION_NOTICE  
**from:** Team 190 (Constitutional Validation)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 20, Team 30, Team 50, Team 90, Team 00, Team 100  
**date:** 2026-03-06  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_3  
**program_id:** S002-P003  
**work_package_id:** S002-P003-WP002  
**scope:** D35_NOTES_LINKED_ENTITY_VALIDATION_ALIGNMENT

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP002 |
| task_id | N/A |
| gate_id | GATE_3 |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Purpose

Add an immediate remediation item to current correction cycles: Notes create flow presents linked entity as optional, while backend enforces linked entity as mandatory for entity parent types.

## 2) Validated Findings (Team 190)

Validation timestamp: **2026-03-06 (UTC)**.

1. Backend validation enforces linked entity requirement.
   - `parent_type` entity values (`ticker|trade|trade_plan|account`) require `parent_id`.
   - Evidence:
     - `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/api/schemas/notes.py` (model validator)
     - `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/api/services/notes_service.py` (create guard + 422)

2. UI create form still exposes optional/no-link behavior.
   - Label text marks linked entity as optional.
   - Dropdown includes empty option (`—ללא קישור—`).
   - Create request sends `parent_id: null` when no selection.
   - Evidence:
     - `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/ui/src/views/data/notes/notesForm.js`

3. Resulting behavior:
   - User can submit create form in a state that backend rejects with 422.
   - This is a deterministic UX/API mismatch, not intermittent runtime noise.

## 3) Impact

- D35 note creation path can fail for valid user journeys implied by UI.
- Repeated 422 errors degrade trust and create avoidable QA noise.
- Gate evidence may misclassify issue as backend instability while root cause is contract mismatch.

## 4) Required Actions

1. **Frontend remediation (Team 30):**
   - Remove empty `—ללא קישור—` option for create mode when parent type is entity.
   - Change label from optional to required semantics.
   - Block save client-side when `parent_id` is empty; show inline error.

2. **Backend parity check (Team 20):**
   - Confirm error contract remains explicit for missing linkage (422 with actionable detail).
   - No schema relaxation unless new architectural directive is issued.

3. **Validation rerun (Team 50):**
   - Add targeted QA scenarios:
     - create note with empty `parent_id` => blocked on client before request;
     - create note with valid linked entity => 201 success;
     - edit note preserves linkage semantics.

4. **Optional follow-up (non-blocking in this cycle):**
   - If datetime linkage is in immediate scope, add `datetime` option + input UX aligned with backend (`parent_datetime`).

## 5) Acceptance Criteria

1. UI cannot submit entity-linked note creation with empty linkage.
2. Label/validation semantics in UI match backend contract.
3. Successful creation path remains intact (201) with linked entity selected.
4. Team 50 targeted rerun report shows PASS for the above scenarios.

## 6) Response Required

Team 10 to publish:
1. activation note for this remediation item,
2. owner mapping (Team 30 primary, Team 20 parity check, Team 50 validation),
3. evidence artifact paths,
4. closure note reference.

---

**log_entry | TEAM_190 | NOTES_LINKAGE_UI_API_MISMATCH_REMEDIATION_NOTICE | ACTION_REQUIRED | 2026-03-06**
