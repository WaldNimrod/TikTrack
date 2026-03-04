# TEAM 20 → TEAM 10 | S002_P003_WP002 G7R BATCH3 BACKEND DEPENDENCY CLOSURE

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_10_S002_P003_WP002_G7R_BATCH3_BACKEND_DEPENDENCY_CLOSURE_v1.0.0  
**from:** Team 20 (Backend)  
**to:** Team 10 (Gateway)  
**date:** 2026-01-31  
**overall_status:** PASS

---

## 1. Overall status

**PASS** — All 4 scope items completed. Clean QA handover. **READY_FOR_TEAM50_QA**

---

## 2. Endpoint contract table + sample responses

### 2.1 GET /notes/{note_id}/attachments/{attachment_id}/download

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/api/v1/notes/{note_id}/attachments/{attachment_id}/download` | Bearer | FileResponse: stream file with `Content-Disposition`, `Content-Type` |

**Sample:** 200 with file binary. 404 if note/attachment not found or not owned.

### 2.2 GET /notes, GET /notes/{id} — linked_entity_display

| Method | Path | Response field |
|--------|------|----------------|
| GET | `/api/v1/notes` | `linked_entity_display: str \| null` — ticker symbol, trade "SYMBOL DIRECTION", plan_name, account_name |
| GET | `/api/v1/notes/{id}` | Same |

**Sample note (trade parent):**
```json
{
  "id": "...",
  "parent_type": "trade",
  "parent_id": "...",
  "linked_entity_display": "AAPL LONG",
  "title": "...",
  "content": "...",
  ...
}
```

### 2.3 GET /alerts, GET /alerts/{id} — target_display_name (non-ticker)

| Method | Path | Response field |
|--------|------|----------------|
| GET | `/api/v1/alerts` | `target_display_name: str \| null` for trade/trade_plan/account |
| GET | `/api/v1/alerts/{id}` | Same |
| POST | `/api/v1/alerts` | Same |
| PATCH | `/api/v1/alerts/{id}` | Same |

**Sample alert (trade target):**
```json
{
  "id": "...",
  "target_type": "trade",
  "target_id": "...",
  "target_display_name": "AAPL LONG",
  "ticker_symbol": null,
  ...
}
```

### 2.4 trigger_status='rearmed' — PATCH + GET parity

| Method | Path | Behavior |
|--------|------|----------|
| PATCH | `/api/v1/alerts/{id}` | `{"trigger_status": "rearmed"}` → persists `trigger_status`, sets `is_triggered=false` |
| GET | `/api/v1/alerts` / `GET /alerts/{id}` | Returns `trigger_status: "rearmed"` from DB |

**Sample:** PATCH with `trigger_status: "rearmed"` → 200. Subsequent GET returns `"trigger_status": "rearmed"`, `"is_triggered": false`.

---

## 3. Changed files + evidence paths

| File | Change |
|------|--------|
| `api/routers/notes.py` | Added `GET /{note_id}/attachments/{attachment_id}/download` → FileResponse |
| `api/services/note_attachments_service.py` | Added `get_attachment_download()` returning (path, content_type, filename) |
| `api/services/notes_service.py` | Added `_resolve_parent_display_names()`; `_note_to_response(linked_entity_display)`; wired in list/get/create/update |
| `api/schemas/notes.py` | `NoteResponse.linked_entity_display` (pre-existing) |
| `api/services/alerts_service.py` | `trigger_status="rearmed"` → `is_triggered=False` in update_alert |

**Alerts target_display_name:** Batch 2 — `api/services/alerts_service.py` `_resolve_target_display_names`, `_alert_to_response`.

---

## 4. Migration / data verification

- **Migrations:** None required.
- **Data verification:** `trigger_status` column exists (G7R Stream1). `rearmed` persisted and returned. Notes `linked_entity_display` derived at read time.

---

## 5. Metadata for GATE_3 / QA handover

| Key | Value |
|-----|-------|
| sprint | S002 |
| phase | P003 |
| work_package | WP002 |
| batch | G7R_BATCH3 |
| gate | GATE_3 |
| status | PASS |
| artifact_path | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_20_S002_P003_WP002_G7R_BATCH3_BACKEND_DEPENDENCY_CLOSURE_v1.0.0.md |

---

**READY_FOR_TEAM50_QA**

---

**log_entry | TEAM_20→TEAM_10 | G7R_BATCH3_BACKEND | PASS | 2026-01-31**
