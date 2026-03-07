# TEAM_20 → TEAM_10 | S002-P003-WP002 G7 Remediation — Batch 4 Stream D Completion

**project_domain:** TIKTRACK  
**id:** TEAM_20_S002_P003_WP002_G7R_BATCH4_STREAM_D_COMPLETION_v1.0.0  
**from:** Team 20 (Backend / Data)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 30, Team 50, Team 90  
**date:** 2026-03-04  
**status:** COMPLETE  
**work_package_id:** S002-P003-WP002  
**session:** SESSION_01  
**in_response_to:** S002_P003_WP002_G7R_V13_BATCH4_STREAM_D_SUPPORT_v1.0.0

---

## 1) Overall status

| Field | Value |
|-------|-------|
| **overall_status** | PASS |
| **scope** | BF-G7-025 (attachment 2.5MB), BF-G7-026 (table refresh) |

---

## 2) Per-BF disposition

| ID | Finding | Disposition |
|----|---------|-------------|
| **BF-G7-025** | Attachment size limit 2.5MB | **IMPLEMENTED** — API/storage limit raised from 1MB to 2.5MB. |
| **BF-G7-026** | Table refresh after update | **CONFIRM_NO_ACTION** — List endpoints query DB directly; no server-side caching. Client receives fresh data on each request. Team 30 must refetch after mutations (standard REST). |

---

## 3) Changes made

### BF-G7-025

| File | Change |
|------|--------|
| `api/services/note_attachments_service.py` | `MAX_FILE_BYTES = 2621440` (2.5MB); error message "File exceeds 2.5MB limit" |
| `api/models/notes.py` | Docstring updated: 2.5MB per file (BF-G7-025) |

**Endpoint:** `POST /notes/{note_id}/attachments`  
**Behavior:** Files > 2.5MB return **413 Payload Too Large** with detail "File exceeds 2.5MB limit".

---

## 4) Contract note for Team 30

| Topic | Description |
|-------|-------------|
| **Attachment max size** | 2.5MB (2 621 440 bytes). UI can surface this limit for users. |
| **413 response** | When file exceeds 2.5MB, API returns 413 with detail "File exceeds 2.5MB limit". |
| **Table refresh** | No API change. List endpoints (GET /notes, GET /alerts, etc.) always return fresh data. Client should refetch lists after create/update/delete. |

---

## 5) BF-G7-026 justification (CONFIRM_NO_ACTION)

- List endpoints (GET /notes, GET /alerts, GET /tickers, etc.) execute a DB query per request.
- No server-side caching or ETag used for these lists.
- Each GET returns current data from the database.
- Ensuring “table refresh after update” is done by the client refetching after mutations.
- No backend change required for table refresh behavior.

---

**log_entry | TEAM_20 | G7R_BATCH4_STREAM_D | S002_P003_WP002 | PASS | 2026-03-04**
