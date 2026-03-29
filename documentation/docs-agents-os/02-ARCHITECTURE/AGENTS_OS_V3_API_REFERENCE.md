# Agents_OS v3 — API reference
## documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_V3_API_REFERENCE.md

**project_domain:** AGENTS_OS  
**owner:** Team 71 (AOS Documentation)  
**date:** 2026-03-28  
**status:** Active

**Traceability:** Directive 3B · Team 11 → Team 71 GATE_DOC Phase B mandate (2026-03-28)

**SSOT for JSON bodies and schemas:** OpenAPI — `{base}/docs` (Swagger UI) and `{base}/redoc` on the running v3 server. Pydantic models live in `agents_os_v3/modules/definitions/models.py`.

**Base path:** All routes below are prefixed with **`/api`** (see `create_app()` in `agents_os_v3/modules/management/api.py`).

---

## 1. Actor header

- **`X-Actor-Team-Id`:** Required on every handler that uses `Depends(get_actor_team_id)`. If omitted or empty → **400** `MISSING_ACTOR_HEADER`.
- **Exception:** **`PUT /api/teams/{team_id}/engine`** requires actor **`team_00`** or returns **403** `INSUFFICIENT_AUTHORITY`.

Handlers **without** `get_actor_team_id` do not require this header (including `GET /api/health`, `GET /api/events/stream`, `GET /api/runs/{run_id}`, several list/read endpoints, and `POST /api/runs/{run_id}/feedback/clear`). Verify in `api.py` if you add clients.

---

## 2. Core and streaming

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/health` | Response `{"status":"ok"}` |
| GET | `/api/events/stream` | SSE; query: `run_id` (optional), `domain_id` (optional) |

---

## 3. Runs

| Method | Path | Status |
|--------|------|--------|
| POST | `/api/runs` | 201 — body: `CreateRunBody` |
| GET | `/api/runs/{run_id}` | Single run |
| GET | `/api/runs` | Query: `status`, `domain_id`, `current_gate_id`, `limit` (1–100), `offset` |
| POST | `/api/runs/{run_id}/advance` | Body: `AdvanceRunBody` |
| POST | `/api/runs/{run_id}/fail` | Body: `FailRunBody` |
| POST | `/api/runs/{run_id}/approve` | Body: `ApproveRunBody` |
| POST | `/api/runs/{run_id}/pause` | Body: `PauseRunBody` |
| POST | `/api/runs/{run_id}/resume` | Body: `ResumeRunBody` |
| POST | `/api/runs/{run_id}/feedback` | Body: `FeedbackIngestBody` |
| POST | `/api/runs/{run_id}/feedback/clear` | Clears pending feedback |
| GET | `/api/runs/{run_id}/prompt` | Query: `bust_cache` (bool); 404 if governance markdown missing |

---

## 4. State and history

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/state` | Query: `run_id`, `domain_id` (optional filters) |
| GET | `/api/history` | Query: `run_id`, `domain_id`, `gate_id`, `event_type`, `actor_team_id`, `limit` (1–200), `offset`, `order` |

---

## 5. Teams

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/teams` | List teams |
| PUT | `/api/teams/{team_id}/engine` | Body: `TeamEngineUpdateBody`; **team_00 only** |

---

## 6. Work packages

| Method | Path |
|--------|------|
| GET | `/api/work-packages` |
| GET | `/api/work-packages/{wp_id}` |

---

## 7. Ideas

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/ideas` | Query: `status`, `priority`, `limit`, `offset` |
| POST | `/api/ideas` | 201 — body: `IdeaCreateBody` |
| PUT | `/api/ideas/{idea_id}` | Body: `IdeaUpdateBody` |

---

## 8. Routing rules

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/routing-rules` | Returns `routing_rules` array |
| POST | `/api/routing-rules` | 201 — body: `RoutingRuleCreateBody`; returns `id` |
| PUT | `/api/routing-rules/{rule_id}` | Body: `RoutingRuleUpdateBody` |

---

## 9. Templates

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/templates` | List (configuration UI) |
| GET | `/api/templates/{template_id}` | 404 if not found |
| PUT | `/api/templates/{template_id}` | Body: `TemplateUpdateBody` |

---

## 10. Policies

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/policies` | Returns `policies` (from `modules.policy.settings.list_policies`) |

---

## 11. Errors

State machine violations map to HTTP via **`StateMachineError`** → status `exc.status_code`, detail shape `code`, `message`, `details` (see `_sm_http` in `api.py`).

Other explicit HTTP errors include **400** validation, **403** team engine update, **404** missing template or governance for prompt.

---

## 12. CORS

If **`ALLOWED_ORIGINS`** is set (comma-separated), it replaces the default origin list. Otherwise defaults include localhost/127.0.0.1 ports **8090**, **8080**, **8778**, **8766**, **3000** — see `_allowed_origins()` in `api.py`.

---

## 13. Related documents

- [AGENTS_OS_V3_ARCHITECTURE_OVERVIEW.md](AGENTS_OS_V3_ARCHITECTURE_OVERVIEW.md)
- [AGENTS_OS_V3_DEVELOPER_RUNBOOK.md](../04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md)

---

**log_entry | TEAM_71 | AOS_V3 | GATE_DOC_PHASE_B | API_REFERENCE | 2026-03-28**
