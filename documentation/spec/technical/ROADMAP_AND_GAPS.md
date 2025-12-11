# Gaps & Roadmap

## Immediate Gaps (POC Readiness)

- **Business Logic coverage:** index, data_import, research need completed services/endpoints before
  external demos.
- **Auth/Permissions:** dev mode is permissive; enforce session/token, user_id scoping, and page
  guards for investor-facing demos.
- **Mockup wiring:** daily snapshots (heatmap/strategy/price-history/economic calendar/emotional
  tracking) require API/BL integration; watch-list modal/add-ticker/flag quick actions need backend
  glue.
- **Data consistency:** ensure demo data generation populates all core entities (accounts,
  trades/plans/executions, alerts, watch lists, preferences) with coherent scenarios.

## Short Term (pre-demo hardening)

- Stabilize API contracts for ticker dashboard, journal, portfolio/trade history (consistent
  envelopes, error handling).
- Add observability for external data refresh (provider health, batch results, retries) and expose in
  UI dashboard.
- Complete validation flows via Business Logic wrappers across remaining pages; remove any page-local
  calculation code.
- Run Selenium console scan and fix any JS runtime noise across pages.

## Medium Term (pilot/limited rollout)

- Strengthen role/permission model (admin vs user) across endpoints and UI; restrict sensitive ops.
- Optimize cache invalidation paths for high-churn entities (trades/executions/alerts) to keep
  dashboards fresh.
- Expand AI analysis persistence and auditing (inputs/outputs, rate limits).
- Improve import flows (data_import) with resumable sessions and clearer status reporting.

## Longer Term (productization)

- Consider API versioning and formal schema docs (OpenAPI) for partner integration.
- Evaluate bundling/build pipeline for frontend to reduce payload and align with ITCSS outputs.
- Add automated regression packs beyond Selenium console scan (API smoke + targeted UI flows).
- Formalize deployment playbooks (containers, migrations, feature flags) for production environments.


