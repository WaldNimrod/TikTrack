# External Data Preferences & Refresh Policies – System Plan (A+A)

## Purpose
Provide a single, system-level source of truth for external-data refresh policies (TTL/refresh cadence) per ticker status, consumed dynamically by server cache and respected by frontend SWR, without introducing new systems.

## Scope
- Status taxonomy: `active` (active_trades=true), `open` (plans active), `closed`, `cancelled`.
- Policies include: TTL/refresh cadence; optional market-hours vs off-hours variants.
- Server usage: dynamic TTL for cache on read endpoints (e.g., `/api/tickers/active`).
- Client usage: SWR polling/backoff profiles aligned with server policies (no new infra).

## Defaults (fallbacks when no setting exists)
- `active`: 5 minutes
- `open`: 15 minutes
- `closed`: 60 minutes
- `cancelled`: 24 hours

Note: These are operational, system-wide defaults (not user preferences).

## Single Source of Truth (reuse existing external-data module)
Expose a provider inside the External Data module (existing infra), e.g. `Backend/services/external_data/cache_manager.py` or `Backend/services/data_refresh_scheduler.py`:

```python
# Pseudocode contract
from datetime import timedelta

def get_refresh_policy_for_status(status: str, market_hours: bool | None = None) -> timedelta:
    """Return TTL/cadence for a given ticker status.
    Fallback to defaults if not configured in the external-data module.
    Valid statuses: 'active', 'open', 'closed', 'cancelled'.
    """
    ...
```

- Reads module-owned configuration (DB or existing config service within the external-data module). If absent, returns defaults above.
- Future-ready: can support provider-specific overrides.
- No new systems introduced.

## Backend Integration (no new layers)
- Endpoints determine status cohort and market-hours boolean, then call `get_refresh_policy_for_status` to obtain TTL.
- Apply TTL consistently via existing decorators:
  - `@api_endpoint(cache_ttl=...)` (route-level) or
  - `@cache_for(ttl=...)` (service-level)
- Invalidation remains dependency-based via `advanced_cache_service` (`tickers`, `tickers:*`, `linked_items:ticker:*`).

### Example endpoint (contract)
GET /api/tickers/active?active_mode=active|open|both&fields=...&market=true|false

- Default `active_mode=active` (active_trades=true).
- Default `fields` = basic set (`id,symbol,name,type,currency_id,status`).
- `market=true` adds shallow market fields only if explicitly requested.
- Route (or service) queries the policy provider for TTL based on `active_mode` and (optionally) market-hours, then applies cache TTL.

## Frontend Integration (existing UCM/SWR)
- Create `ActiveTickersBasic` service that uses UnifiedCacheManager (memory→localStorage→IndexedDB→backend) with SWR + dedupe.
- Prewarm once in unified initializer (Stage 3/4) so all pages render from memory.
- Optional polling frequency can align with status profile, but UCM SWR remains the main consumer.

## Risks & Mitigations
- Over-fetch: mitigated via field projection and SWR dedupe.
- Staleness: mitigated by dependency invalidation + short TTL for `active`.
- Config drift: single provider abstracts mapping and defaults.

## Success Criteria
- Basic active list p50 ≤ 300ms; p95 ≤ 700ms (cold acceptable within p95).
- Dynamic TTLs take effect without code changes (provider-driven).
- Zero new systems; reuse `advanced_cache_service`, UnifiedCacheManager, unified initializer.

## Implementation Steps
1) Provider: implement `get_refresh_policy_for_status(status, market_hours=None)` in the external-data module. Source values from existing module-owned configuration; fallback to defaults above.
2) Endpoint: add `GET /api/tickers/active` using projection, filters (`active_mode`), and TTL from the provider. Keep invalidation keys as-is.
3) Frontend: add `ActiveTickersBasic` (UCM + SWR + dedupe) and a prewarm call in unified initialization.
4) Verification: run CRUD dashboard smart tests; confirm `responseTimeGet`, p50/p95 and Acceptance pass; UI refresh ≤ 2s after CRUD.

## Interfaces & Hand-off
- External Data module provides:
  - `get_refresh_policy_for_status(status: str, market_hours: bool | None) -> timedelta`
  - (Optional) `is_market_hours(now_utc: datetime) -> bool`
- Consumers:
  - API route/service: requests TTL for active/open/closed/cancelled and applies it to cache decorators.
  - Frontend UCM: no awareness of policy source; simply benefits from server TTL and SWR.

## Notes
- Preferences are system-level, not per-user; they belong to the external-data module, not to the user preferences subsystem.
- Market fields are opt-in (or loaded asynchronously) to keep basic lists fast and consistent across pages.
