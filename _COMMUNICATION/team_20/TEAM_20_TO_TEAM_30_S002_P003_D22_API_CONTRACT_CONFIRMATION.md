# Team 20 → Team 30: D22 Tickers API — Contract Confirmation (S002-P003)

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_30_S002_P003_D22_API_CONTRACT_CONFIRMATION  
**from:** Team 20 (Backend Implementation)  
**to:** Team 30 (Frontend)  
**cc:** Team 10 (The Gateway)  
**date:** 2026-02-27  
**status:** CONFIRMED  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP001 (prerequisite)  
**trigger:** TEAM_10_TO_TEAM_20_S002_P003_D22_API_CONTRACT_CONFIRMATION_REQUEST  

---

## Mandatory Identity Header

| Field | Value |
|-------|--------|
| roadmap_id | TIKTRACK_ROADMAP_LOCKED |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP001 |
| task_id | N/A |
| gate_id | GATE_3 |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Endpoint

**GET** `/api/v1/tickers`

**Source:** `api/routers/tickers.py` (lines 36–61)  
**Service:** `api/services/tickers_service.py` → `get_tickers()`

---

## 2) Query Parameters (filter contract)

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker_type` | string | Optional | Filter by ticker type (STOCK, ETF, OPTION, FUTURE, FOREX, CRYPTO, INDEX). Server applies `.upper()`. |
| `is_active` | boolean | Optional | Filter by active status (true/false). |
| `search` | string | Optional | Search in symbol and company_name (ILIKE). |

**Auth:** Admin role required (`require_admin_role`).

---

## 3) Response

```json
{
  "data": [...],
  "total": <int>
}
```

Each item in `data` conforms to `TickerResponse`:
- `id` (ULID), `symbol`, `company_name`, `ticker_type`, `is_active`
- `delisted_date`, `created_at`, `updated_at`
- `current_price`, `daily_change_pct` (from ticker_prices)

---

## 4) Pagination

Server returns all matching rows (no `limit`/`offset`). Frontend may paginate client-side per LLD400 §2.5 ("state across pagination"). Filter params apply to the full result set before return.

---

## 5) Status

**READY for frontend filter UI integration.**  
Team 30 may proceed with WP001 (filter bar, loadTickersData params).

---

**log_entry | TEAM_20 | S002_P003 | D22_API_CONTRACT_CONFIRMED | 2026-02-27**
