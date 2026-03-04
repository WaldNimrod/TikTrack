# Team 30 → Team 10 | G7R Batch 3 UI Parity Recheck

**project_domain:** TIKTRACK  
**id:** TEAM_30_TO_TEAM_10_S002_P003_WP002_G7R_BATCH3_UI_PARITY_RECHECK_v1.0.0  
**from:** Team 30 (Frontend Execution)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 20, Team 50, Team 90  
**date:** 2026-01-31  
**status:** PASS  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  
**trigger:** TEAM_10_TO_TEAM_30_S002_P003_WP002_G7R_BATCH3_UI_PARITY_RECHECK_v1.0.0

---

## 1) Overall Status

| Field | Value |
|-------|-------|
| **overall_status** | **PASS** |
| **block_reason** | — |

---

## 2) Parity Matrix (Before/After Team 20 Dependency Closure)

| Item | Before (pre–Team 20 Batch 2) | After (post–Team 20 closure) | UI Verification |
|------|-------------------------------|------------------------------|-----------------|
| **D34 Alerts linked entity** | Fallback: typeLabel + targetId slice | API returns `ticker_symbol`, `target_display_name` | UI uses `target_display_name ?? ticker_symbol` — no fallback when resolved |
| **D35 Notes linked entity** | Fallback: typeLabel + parentId slice | API does not yet return `linked_entity_display` | Fallback shown; no resolved path available (expected) |
| **Attachment download** | Link href only (no auth → 401) | API: `GET /notes/{id}/attachments/{aid}/download` | **Fixed:** click handler with authenticated fetch → blob download |
| **Attachment remove** | `DELETE /notes/{id}/attachments/{aid}` | Same | UI wired; proof path confirmed |

---

## 3) No Fallback Marker Where Resolved Display Available

| Entity | API Fields | UI Behavior |
|--------|------------|-------------|
| **Alerts** | `ticker_symbol`, `target_display_name` | `formatAlertLinkedEntity`: prefers `linked_entity_display ?? target_display_name ?? ticker_symbol` — when any is present, no typeLabel+id slice shown |
| **Notes** | (none from API) | `formatLinkedEntityDisplay`: uses `linked_entity_display ?? linked_entity_name`; fallback only when API provides neither |

**Evidence:** No explicit "(fallback)" or raw-type-only display when API returns resolved names.

---

## 4) Attachment Download/Remove Proof Path

| Action | Endpoint | UI Implementation |
|--------|----------|--------------------|
| **Download** | `GET /notes/{note_id}/attachments/{attachment_id}/download` | `bindNoteAttachmentHandlers`: `.js-attachment-download` click → authenticated fetch → blob → createObjectURL → programmatic download |
| **Remove** | `DELETE /notes/{note_id}/attachments/{attachment_id}` | `bindNoteAttachmentHandlers`: `.js-attachment-remove` click → sharedServices.delete → DOM row removal |

**Evidence:** `notesTableInit.js` — `buildAttachmentsHtml`, `bindNoteAttachmentHandlers`; download uses `sharedServices.buildUrl` + `getToken` for auth.

---

## 5) UI Evidence Paths

| Evidence | Path |
|----------|------|
| Alerts linked entity (resolved) | `ui/src/views/data/alerts/alertsTableInit.js` — formatAlertLinkedEntity (lines 43–52) |
| Notes linked entity (fallback when no API) | `ui/src/views/data/notes/notesTableInit.js` — formatLinkedEntityDisplay (lines 32–43) |
| Attachment list + download/remove | `ui/src/views/data/notes/notesTableInit.js` — buildAttachmentsHtml, bindNoteAttachmentHandlers (lines 263–329) |
| Note details modal | `ui/src/views/data/notes/notesTableInit.js` — handleViewNote (lines 306–350) |

---

## 6) Remediation Applied

- **Download auth fix:** Replaced plain `<a href>` (no auth) with click handler that performs authenticated fetch and triggers blob download, aligning with protected download endpoint.

---

**log_entry | TEAM_30 | G7R_BATCH3_UI_PARITY_RECHECK | S002_P003_WP002 | PASS | 2026-01-31**
