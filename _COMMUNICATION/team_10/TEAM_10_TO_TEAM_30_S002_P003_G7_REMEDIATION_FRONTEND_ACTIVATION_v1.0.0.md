# TEAM_10_TO_TEAM_30_S002_P003_G7_REMEDIATION_FRONTEND_ACTIVATION_v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_30_S002_P003_G7_REMEDIATION_FRONTEND_ACTIVATION_v1.0.0  
**from:** Team 10  
**to:** Team 30 (Frontend)  
**cc:** Team 20, Team 40, Team 50, Team 60, Team 90, Team 00, Team 100  
**date:** 2026-03-01  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_3 (re-entry)  
**work_package_id:** S002-P003-WP002  

---

## Mandate scope (Team 30)

Implement frontend remediation exactly per architect main directive + supplement.

### Stream 2 deliverables

- D22/D33 status rendering via `statusValues.js` + `statusAdapter.js` only
- D34 condition builder full matrix (7 fields x 7 operators incl. `crosses_above` / `crosses_below`)
- Shared dynamic selector loader: `ui/src/utils/entityOptionLoader.js`
- D34 filter bug fix (`ticker_id` and "all" handling alignment)
- D35 note form linkage by `parent_type` and dynamic entity loading
- D35 edit mode: parent linkage display only (read-only)

### Stream 3 deliverables

- D34 `trigger_status` row treatment + details modal behavior + re-arm action
- Notification bell UI integration in header (`unified-header.html`) with 60s polling pattern
- Add button text semantics and icon-button tooltip compliance across D22/D33/D34/D35
- Replace all prohibited `alert()` / `confirm()` flows with `createModal()` patterns
- Ensure all modal cancel text is explicitly `'ביטול'` (and update shared default if applicable)
- Add/complete D33 actions: view (details modal), edit (`status` + `notes`), delete confirmation modal

---

## Cross-team dependency protocol

- For missing/invalid API support: issue formal request to Team 20
- For visual design/token consistency issues: issue formal request to Team 40
- For runtime/asset build or environment blockers: issue formal request to Team 60

No silent assumptions or local stubs as final implementation.

---

## Required completion evidence to Team 10

1. File-by-file change list grouped by D22/D33/D34/D35
2. UI proof checklist against F-05/F-06/F-07/F-10/F-11/F-12/F-16
3. Notification bell behavior proof (unread badge, mark-read, mark-all-read)
4. Modal/text/tooltip compliance sweep report
5. Known limitations list (if any) with explicit team dependency tags

---

Log entry: TEAM_10 -> TEAM_30 | S002_P003_WP002 | G7_FRONTEND_REMEDIATION_ACTIVATED | 2026-03-01
