# PI-001 Product Scope Atlas
**project_domain:** TIKTRACK

**id:** `PI-001_PRODUCT_SCOPE_ATLAS`  
**owner:** Team 70 (Product Intelligence)  
**status:** DRAFT (UPDATED AFTER MENU+DOC ALIGNMENT)  
**date:** 2026-02-15  
**scope:** Planned vs implemented pages, features, entities, dependencies

---

## 1) Page Inventory

### 1.1 Evidence Sources
| Source | Path |
|--------|------|
| Page routes (system) | `ui/public/routes.json` |
| Header menu links | `ui/src/views/shared/unified-header.html` |
| HTML route mapping (dev server) | `ui/vite.config.js` (`routeToFileMap`) |
| React routes | `ui/src/router/AppRouter.jsx` |
| HTML views | `ui/src/views/**/**.html` |

### 1.2 Coverage Summary (Current)
| Metric | Count | Notes |
|--------|-------|-------|
| Routes defined in `routes.json` | 27 | Includes auth + HTML pages; does not include `/` |
| App links in header | 26 | Includes `/`; does not include `/register`, `/reset-password` |
| React pages implemented | 6 | `/`, `/login`, `/register`, `/reset-password`, `/profile`, `/admin/design-system` |
| HTML pages mapped and served | 22 | All entries in `routeToFileMap` exist physically |
| Total served pages (React + HTML) | 28 | 6 + 22 |
| Functional pages (business logic ready) | 13 | 6 React + 7 HTML core pages |
| Template-shell pages (structure only) | 15 | HTML shell exists, logic/content pending |

### 1.3 Functional vs Template Classification

#### Functional pages (implemented behavior)
- React: `/`, `/login`, `/register`, `/reset-password`, `/profile`, `/admin/design-system`
- HTML: `/trading_accounts.html`, `/brokers_fees.html`, `/cash_flows.html`, `/user_tickers.html`, `/tickers.html`, `/data_dashboard.html`, `/system_management.html`

#### Template-shell pages (implemented structure, content/logic pending)
- `/trade_plans.html`, `/ai_analysis.html`
- `/watch_lists.html`, `/ticker_dashboard.html`, `/trading_journal.html`, `/trades.html`
- `/strategy-analysis.html`, `/trades_history.html`, `/portfolio-state.html`
- `/alerts.html`, `/notes.html`, `/executions.html`
- `/data_import.html`, `/tag_management.html`, `/preferences.html`

### 1.4 Route Matrix (Aligned State)

| Route/Page | Header Link | Served | Runtime Status | Verification Path |
|------------|-------------|--------|----------------|-------------------|
| `/` | ✅ | ✅ | Functional | `ui/src/components/HomePage.jsx` |
| `/login` | ✅ | ✅ | Functional | `ui/src/cubes/identity/components/auth/LoginForm.jsx` |
| `/register` | ❌ (flow only) | ✅ | Functional | `ui/src/cubes/identity/components/auth/RegisterForm.jsx` |
| `/reset-password` | ❌ (flow only) | ✅ | Functional | `ui/src/cubes/identity/components/auth/PasswordResetFlow.jsx` |
| `/profile` | ✅ | ✅ | Functional | `ui/src/cubes/identity/components/profile/ProfileView.jsx` |
| `/admin/design-system` | ✅ | ✅ | Functional | `ui/src/views/admin/design-system/DesignSystemDashboard.jsx` |
| `/trading_accounts.html` | ✅ | ✅ | Functional | `ui/src/views/financial/tradingAccounts/trading_accounts.html` |
| `/brokers_fees.html` | ✅ | ✅ | Functional | `ui/src/views/financial/brokersFees/brokers_fees.html` |
| `/cash_flows.html` | ✅ | ✅ | Functional | `ui/src/views/financial/cashFlows/cash_flows.html` |
| `/user_tickers.html` | ✅ | ✅ | Functional | `ui/src/views/management/userTicker/user_tickers.html` |
| `/tickers.html` | ✅ | ✅ | Functional | `ui/src/views/management/tickers/tickers.html` |
| `/data_dashboard.html` | ✅ | ✅ | Functional | `ui/src/views/data/dataDashboard/data_dashboard.html` |
| `/system_management.html` | ✅ | ✅ | Functional | `ui/src/views/management/systemManagement/system_management.html` |
| `/trade_plans.html` | ✅ | ✅ | Template shell | `ui/src/views/planning/tradePlans/trade_plans.html` |
| `/ai_analysis.html` | ✅ | ✅ | Template shell | `ui/src/views/planning/aiAnalysis/ai_analysis.html` |
| `/watch_lists.html` | ✅ | ✅ | Template shell | `ui/src/views/tracking/watchLists/watch_lists.html` |
| `/ticker_dashboard.html` | ✅ | ✅ | Template shell | `ui/src/views/tracking/tickerDashboard/ticker_dashboard.html` |
| `/trading_journal.html` | ✅ | ✅ | Template shell | `ui/src/views/tracking/tradingJournal/trading_journal.html` |
| `/trades.html` | ✅ | ✅ | Template shell | `ui/src/views/tracking/trades/trades.html` |
| `/strategy-analysis.html` | ✅ | ✅ | Template shell | `ui/src/views/research/strategyAnalysis/strategy_analysis.html` |
| `/trades_history.html` | ✅ | ✅ | Template shell | `ui/src/views/research/tradesHistory/trades_history.html` |
| `/portfolio-state.html` | ✅ | ✅ | Template shell | `ui/src/views/research/portfolioState/portfolio_state.html` |
| `/alerts.html` | ✅ | ✅ | Template shell | `ui/src/views/data/alerts/alerts.html` |
| `/notes.html` | ✅ | ✅ | Template shell | `ui/src/views/data/notes/notes.html` |
| `/executions.html` | ✅ | ✅ | Template shell | `ui/src/views/data/executions/executions.html` |
| `/data_import.html` | ✅ | ✅ | Template shell | `ui/src/views/settings/dataImport/data_import.html` |
| `/tag_management.html` | ✅ | ✅ | Template shell | `ui/src/views/settings/tagManagement/tag_management.html` |
| `/preferences.html` | ✅ | ✅ | Template shell | `ui/src/views/settings/preferences/preferences.html` |

---

## 2) Feature–Process Map by Domain

### 2.1 Auth
| Feature | Process | Status | Evidence |
|---------|---------|--------|----------|
| Login/Register/Reset | JWT auth flow | ✅ Functional | `api/routers/auth.py`, auth React components |
| Protected routes | Type A/B/C/D guards | ✅ Functional | `ui/src/components/core/authGuard.js`, `ProtectedRoute.jsx` |

### 2.2 Financial Core
| Feature | Process | Status | Evidence |
|---------|---------|--------|----------|
| Trading Accounts | CRUD + summaries | ✅ Functional | `api/routers/trading_accounts.py`, D16 HTML |
| Brokers Fees | Account-based fees | ✅ Functional | `api/routers/brokers_fees.py`, D18 HTML |
| Cash Flows | CRUD + summary/conversion | ✅ Functional | `api/routers/cash_flows.py`, D21 HTML |

### 2.3 Market Data / Tickers
| Feature | Process | Status | Evidence |
|---------|---------|--------|----------|
| User Tickers | `/me/tickers` add/remove | ✅ Functional | `api/routers/me_tickers.py`, user_tickers HTML |
| Tickers Admin | list/manage tickers | ✅ Functional (baseline) | `api/routers/tickers.py`, tickers HTML |
| Data Dashboard | status/freshness visibility | ✅ Functional baseline | `ui/src/views/data/dataDashboard/data_dashboard.html` |

### 2.4 Planning / Tracking / Research / Settings / Data modules
| Feature Group | Process | Status | Evidence |
|--------------|---------|--------|----------|
| Trade Plans, AI Analysis, Watch Lists, Ticker Dashboard, Trading Journal, Trades | UI shell scaffold | 🟡 Template shell | HTML pages under `ui/src/views/planning/` + `ui/src/views/tracking/` |
| Strategy Analysis, Trades History, Portfolio State | UI shell scaffold | 🟡 Template shell | HTML pages under `ui/src/views/research/` |
| Alerts, Notes, Executions, Data Import, Tag Management, Preferences | UI shell scaffold | 🟡 Template shell | HTML pages under `ui/src/views/data/` + `ui/src/views/settings/` |

---

## 3) Entity Map (Current)

| Entity | Purpose | Status | Evidence |
|--------|---------|--------|----------|
| User | Identity/JWT | ✅ | `api/models/identity.py`, auth router |
| Trading Account | Core financial container | ✅ | `api/models/trading_accounts.py` |
| Trading Account Fees | Commission model per account | ✅ | `api/models/brokers_fees.py` (mapped table) |
| Cash Flow | Deposits/withdrawals/conversions | ✅ | `api/models/cash_flows.py` |
| Ticker | Asset metadata | ✅ | `api/models/tickers.py` |
| User Ticker | User-ticker junction | ✅ | `api/models/user_tickers.py` |
| Price/FX tables | Market data cache/history | ✅ | `api/models/ticker_prices.py`, `api/models/exchange_rates.py` |

---

## 4) Dependencies

- UI boundary: `ui/src/components/core/sharedServices.js`.
- Auth contract: `access_token` flow + route guards.
- Market data chain: cache-first + provider fallback (`MARKET_DATA_PIPE_SPEC`).
- Template contract: unified page shell enforced via POL-015.

---

## 5) Open Questions (Post-Alignment)

| # | Question | Owner | Severity |
|---|----------|-------|----------|
| 1 | For template-shell pages, is required default label `"בקרוב"` in header and section title? | Architect + Team 30 | Medium |
| 2 | What is target rollout order for the 15 template-shell pages? | Architect + Team 10 | Medium |
| 3 | Is `/executions.html` expected to consume existing APIs in Batch 4, or needs new contract first? | Team 20 + Architect | Medium |

---

**log_entry | TEAM_70 | PI-001_UPDATED_AFTER_MENU_ALIGNMENT | 2026-02-15**
