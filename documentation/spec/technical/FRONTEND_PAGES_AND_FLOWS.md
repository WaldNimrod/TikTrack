# Frontend Pages & Flows (including mockups)

## Conventions

- All pages load via Unified Initialization System and Unified Cache System; use standard load order
  and data-onclick event handling.
- Header/Filters, Modal Manager V2, Table Pipeline, FieldRendererService, CRUD Response Handler are
  the default building blocks.
- Refer to `documentation/PAGES_LIST.md` for the authoritative list and URLs.

## Primary User Pages

- **Dashboard (`index.html`)** – main KPIs; needs full Business Service hardening.
- **Trades / Trade Plans / Executions** – CRUD with validations and calculations; linked modals;
  auto-refresh and cache invalidation.
- **Alerts** – condition-driven alerts; uses conditions system for rendering and validation.
- **Tickers / Ticker Dashboard** – ticker management plus extended dashboard (charts, KPIs, technical
  indicators).
- **Trading Accounts** – account CRUD, balances, positions.
- **Cash Flows** – dual cash-flow editing (regular + currency conversion).
- **Notes** – rich text-ready, relation types, tagging.
- **Watch List** – list view + mockup modals for add/flag quick actions.
- **AI Analysis** – LLM-backed analysis flows.
- **Preferences (v3/v4)** – profile-based settings, validation, lazy loading, color schemes.
- **User Profile** – profile update/reset password.
- **Trading Journal** – historical log with table + chart, filters, zoom per day.
- **Data Import / Research** – UI present; business services need strengthening.

## Technical/Admin Pages

- Database/Constraints/System Management: db_display, db_extradata, constraints, system-management,
  server-monitor, background-tasks, notifications-center.
- Quality/Dev Tools: css-management, cache-management, code-quality-dashboard,
  init-system-management, conditions-test, button-color-mapping tools.
- CRUD testing dashboard and TradingView widgets showcase pages for validation/demos.

## Mockups & Daily Snapshots

- Daily snapshots set: portfolio-state, trade-history, price-history, strategy-analysis, heatmap,
  comparison modal, economic calendar, emotional tracking widget, history widget,
  tradingview-test-page.
- Watch list modal/add-ticker/flag quick action mockups for future watch-list UX.
- Mockups are reachable under `/mockups/...` or `/daily-snapshots-*.html`; some already wired to
  APIs (portfolio-state, trade-history, trading-journal).

## Dependencies to Reuse

- Initialization: `unified-app-initializer.js`, `page-initialization-configs.js`
- Data services: `trading-ui/scripts/services/*-data.js` (wrappers + validation)
- UI systems: modal manager/navigation/z-index, header-system, table pipeline, info-summary-system,
  icon/button/color systems, widget overlay/positioning services.
- Monitoring & logging: `logger-service.js`, notification/warning systems; remove `console.log` in
  production.

## Page Status Signals (from PAGES_LIST)

- Fully ready with Business Logic: trades, trade_plans, alerts, tickers, ticker-dashboard,
  trading_accounts, executions, cash_flows, notes, ai-analysis, watch-list, trading-journal.
- Ready UI, BL to strengthen: index, data_import, research.
- Mockups ready for integration: daily snapshots set, watch-list modals, tradingview test page.


