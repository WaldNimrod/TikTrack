# Agents_OS v3 — API reference
## documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_V3_API_REFERENCE.md

**project_domain:** AGENTS_OS  
**owner:** Team 71 (AOS Documentation); **D.6 remediation alignment** — Team 170 (2026-03-29)  
**date:** 2026-03-29  
**status:** Active

**Traceability:** Directive 3B · Team 11 → Team 71 GATE_DOC Phase B mandate (2026-03-28) · Team 00 → Team 170 **D.6 documentation mandate** (`TEAM_00_TO_TEAM_170_AOS_V3_D6_DOCUMENTATION_MANDATE_v1.0.0.md`) — Phase 1+2 API paths + UC-12

**SSOT for JSON bodies and schemas:** OpenAPI — `{base}/docs` (Swagger UI) and `{base}/redoc` on the running v3 server. Pydantic models live in `agents_os_v3/modules/definitions/models.py`.

**Base path:** All routes below are prefixed with **`/api`** (see `create_app()` in `agents_os_v3/modules/management/api.py`).

**Option B (admin prefix):** Configuration and Principal-only mutations use the **same** `/api/...` prefix as the rest of the API. There is **no** `/api/admin/*` tree. Authoritative decision: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_REMEDIATION_ADMIN_PREFIX_DECISION_v1.0.0.md`. Contract tests: `agents_os_v3/tests/test_remediation_phase2_api_contracts.py`.

---

## 1. Actor header

- **`X-Actor-Team-Id`:** Required on every handler that uses `Depends(get_actor_team_id)`. If omitted or empty → **400** `MISSING_ACTOR_HEADER`.
- **Principal-only (`team_00`):** **`PUT /api/teams/{team_id}/engine`**, **`DELETE /api/routing-rules/{rule_id}`**, **`PUT /api/policies/{policy_id}`** — non-Principal actors → **403** `INSUFFICIENT_AUTHORITY`.
- **`POST /api/runs/{run_id}/override` (UC-12):** Body field **`actor_team_id`** must equal **`X-Actor-Team-Id`** or → **400** `ACTOR_MISMATCH`.

Handlers **without** `get_actor_team_id` do not require this header (including `GET /api/health`, `GET /api/events/stream`, `GET /api/runs/{run_id}`, `GET /api/teams`, `GET /api/teams/{team_id}`, several list/read endpoints, and `POST /api/runs/{run_id}/feedback/clear`). Verify in `api.py` if you add clients.

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
| POST | `/api/runs/{run_id}/override` | **UC-12** — Body: `PrincipalOverrideBody` (`actor_team_id`, `action`, `reason`, optional `snapshot`). Principal override actions (e.g. `FORCE_PASS`, `FORCE_FAIL`, `FORCE_PAUSE`, `FORCE_RESUME`). **`FORCE_PAUSE`** may require `snapshot` → **400** `SNAPSHOT_REQUIRED` if missing. Completed runs → **409** `TERMINAL_STATE`. |
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
| GET | `/api/teams/{team_id}` | Single team detail: `team_id`, `label`, `name`, `engine`, `group`, `profession`, `domain_scope`, `parent_team_id`, `children`, `has_active_assignment`, … |
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
| DELETE | `/api/routing-rules/{rule_id}` | **team_00 only** — removes rule; **404** if `rule_id` not found |

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
| PUT | `/api/policies/{policy_id}` | **team_00 only** — Body: `PolicyUpdateBody` (e.g. `policy_value_json`, optional `priority`, `scope_type`, `domain_id`, `gate_id`, `phase_id`) |

---

## 11. Errors

State machine violations map to HTTP via **`StateMachineError`** → status `exc.status_code`, detail shape `code`, `message`, `details` (see `_sm_http` in `api.py`).

Other explicit HTTP errors include **400** validation, **403** `INSUFFICIENT_AUTHORITY` (Principal-only routes above), **404** missing template, governance for prompt, routing rule, or policy; **400** `ACTOR_MISMATCH` / `SNAPSHOT_REQUIRED` on override; **409** `TERMINAL_STATE` on override when run is complete.

---

## 12. CORS

If **`ALLOWED_ORIGINS`** is set (comma-separated), it replaces the default origin list. Otherwise defaults include localhost/127.0.0.1 ports **8090** (v3), **8092** (v2 UI), **8080**, **8778**, **8766**, **3000** — see `_allowed_origins()` in `api.py`. Port policy: [AGENTS_OS_V3_NETWORK_PORTS_AND_UI_ENTRY_v1.0.0.md](AGENTS_OS_V3_NETWORK_PORTS_AND_UI_ENTRY_v1.0.0.md).

---

## 13. Related documents

- [AGENTS_OS_V3_ARCHITECTURE_OVERVIEW.md](AGENTS_OS_V3_ARCHITECTURE_OVERVIEW.md)
- [AGENTS_OS_V3_DEVELOPER_RUNBOOK.md](../04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md)

---

**log_entry | TEAM_71 | AOS_V3 | GATE_DOC_PHASE_B | API_REFERENCE | 2026-03-28**  
**log_entry | TEAM_170 | AOS_V3 | D6_DOC_MANDATE | API_REFERENCE_PHASE2_PATHS | 2026-03-29**
