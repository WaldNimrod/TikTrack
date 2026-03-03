# TEAM_20 → TEAM_10 | PHASE C CARRYOVER DEPENDENCY CLOSURE

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_10_S002_P003_WP002_PHASE_C_CARRYOVER_DEPENDENCY_CLOSURE_v1.0.0  
**from:** Team 20 (Backend Implementation)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 30, Team 50, Team 60, Team 90  
**date:** 2026-03-02  
**historical_record:** true  
**status:** CLOSED  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  
**in_response_to:** TEAM_10_TO_TEAM_20_S002_P003_WP002_PHASE_C_CARRYOVER_DEPENDENCY_CLOSURE  

---

## 1) Overall status

**overall_status:** PASS

---

## 2) Endpoint contract table

| Path | Method | Status | Payload schema |
|------|--------|--------|----------------|
| `/api/v1/trades` | GET | **IMPLEMENTED** | `{ data: [{ id: string, label: string, symbol?: string }], total: number }` |
| `/api/v1/trade_plans` | GET | **IMPLEMENTED** | `{ data: [{ id: string, label: string, symbol?: string }], total: number }` |

### Query parameters

| Endpoint | Param | Type | Default | Description |
|----------|-------|------|---------|-------------|
| GET /trades | limit | int | 500 | Max items (1–1000) for entity loader |
| GET /trade_plans | limit | int | 500 | Max items (1–1000) for entity loader |

### Response item schema (entity loader contract)

```json
{
  "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "label": "AAPL LONG 100",
  "symbol": "AAPL"
}
```

- **id:** ULID (external) — use as `value` in entity dropdown
- **label:** Display string — use as `label` in entity dropdown
- **symbol:** Ticker symbol (optional)

### Auth

Both endpoints require `get_current_user` (Bearer token).

---

## 3) Implementation list

| # | File | Action |
|---|------|--------|
| 1 | `api/models/trade_plans.py` | NEW |
| 2 | `api/schemas/trades.py` | NEW |
| 3 | `api/schemas/trade_plans.py` | NEW |
| 4 | `api/services/trades_service.py` | NEW |
| 5 | `api/services/trade_plans_service.py` | NEW |
| 6 | `api/routers/trades.py` | NEW |
| 7 | `api/routers/trade_plans.py` | NEW |
| 8 | `api/main.py` | EXTENDED — router registration |
| 9 | `api/models/__init__.py` | EXTENDED — TradePlan export |
| 10 | `ui/src/utils/entityOptionLoader.js` | EXTENDED — loadTradeOptions, loadTradePlanOptions |

---

## 4) Compatibility note for Team 50 QA scripts

1. **entityOptionLoader:** When `parent_type` or `target_type` is `trade` or `trade_plan`, the loader now calls `GET /api/v1/trades` or `GET /api/v1/trade_plans` respectively. Previous behavior (return `[]`) is replaced with real API data.

2. **QA scripts:** If scripts expect empty arrays for trade/trade_plan options when no backend existed, they should now expect:
   - 200 response with `{ data: [...], total: N }`
   - `data` array may be empty if user has no trades/trade_plans
   - Each item has `id` (ULID), `label` (string), `symbol` (optional string)

3. **E2E scenarios:** Alerts create/edit (target_id) and Notes create/edit (parent_id) with entity select for trade/trade_plan should now populate dropdowns. Previously empty; now populated when user has data.

4. **Auth:** Both endpoints return 401 when unauthenticated. Use valid Bearer token in QA.

---

**log_entry | TEAM_20 | TO_TEAM_10 | S002_P003_WP002_PHASE_C_CARRYOVER_CLOSURE | PASS | 2026-03-02**
