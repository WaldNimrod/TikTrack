# PI-001 Product Scope Atlas

**id:** `PI-001_PRODUCT_SCOPE_ATLAS`  
**owner:** Team 70 (Product Intelligence)  
**status:** DRAFT  
**date:** 2026-02-15  
**scope:** Planned vs implemented pages, features, entities, dependencies

---

## 1) Page Inventory

### 1.1 Evidence Sources
| Source | Path |
|--------|------|
| SSOT Page Tracker | `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md` |
| Routes config | `ui/public/routes.json` |
| Header menu | `ui/src/views/shared/unified-header.html` |
| Vite route-to-file mapping | `ui/vite.config.js` (routeToFileMap, possiblePaths) |
| React router | `ui/src/router/AppRouter.jsx` |
| Actual HTML views | `ui/src/views/` (files found via glob) |

### 1.2 Page Status Matrix

| Route/Page | Planned | Header Link | Implemented | Verification Path |
|------------|---------|-------------|-------------|-------------------|
| `/` (Home) | ✅ D15.I | ✅ | ✅ React | `ui/src/components/HomePage.jsx` |
| `/login` | ✅ D15.L | ✅ | ✅ React | `ui/src/cubes/identity/components/auth/LoginForm.jsx` |
| `/register` | ✅ D15.R | ✅ | ✅ React | `RegisterForm.jsx` |
| `/reset-password` | ✅ D15.P | ✅ | ✅ React | `PasswordResetFlow.jsx` |
| `/profile` | ✅ D15.V | ✅ | ✅ React | `ProfileView.jsx` |
| `/admin/design-system` | ✅ Admin | ✅ | ✅ React | `DesignSystemDashboard.jsx` |
| `/trading_accounts.html` | ✅ D16 | ✅ | ✅ HTML | `ui/src/views/financial/tradingAccounts/` |
| `/brokers_fees.html` | ✅ D18 | ✅ | ✅ HTML | `ui/src/views/financial/brokersFees/` |
| `/cash_flows.html` | ✅ D21 | ✅ | ✅ HTML | `ui/src/views/financial/cashFlows/` |
| `/user_tickers.html` | ✅ D22 User | ✅ | ✅ HTML | `ui/src/views/management/userTicker/` |
| `/tickers.html` | ✅ D22 Tickers | ✅ | ✅ HTML | `ui/src/views/management/tickers/` |
| `/data_dashboard.html` | ✅ D23 | ✅ | ✅ HTML | `ui/src/views/data/dataDashboard/` |
| `/system_management.html` | ✅ Admin | ✅ | ✅ HTML | `ui/src/views/management/systemManagement/` |
| `/trade_plans.html` | ✅ Roadmap | ✅ | ❌ NOT IMPLEMENTED | No file in routeToFileMap |
| `/watch_lists.html` | ✅ Roadmap | ✅ | ❌ NOT IMPLEMENTED | No file |
| `/ticker_dashboard.html` | ✅ Roadmap | ✅ | ❌ NOT IMPLEMENTED | No file |
| `/trading_journal.html` | ✅ Roadmap | ✅ | ❌ NOT IMPLEMENTED | No file |
| `/strategy-analysis.html` | ✅ Roadmap | ✅ | ❌ NOT IMPLEMENTED | No file |
| `/trades_history.html` | ✅ Roadmap | ✅ | ❌ NOT IMPLEMENTED | No file |
| `/portfolio-state.html` | ✅ Roadmap | ✅ | ❌ NOT IMPLEMENTED | No file |
| `/alerts.html` | ✅ Roadmap | ✅ | ❌ NOT IMPLEMENTED | No file |
| `/notes.html` | ✅ Roadmap | ✅ | ❌ NOT IMPLEMENTED | No file |
| `/executions.html` | ✅ Roadmap | ✅ | ❌ NOT IMPLEMENTED | No file |
| `/data_import.html` | ✅ Roadmap | ✅ | ❌ NOT IMPLEMENTED | No file |
| `/tag_management.html` | ✅ Roadmap | ✅ | ❌ NOT IMPLEMENTED | No file |
| `/preferences.html` | ✅ Roadmap | ✅ | ❌ NOT IMPLEMENTED | No file |

### 1.3 Summary
- **Planned (routes.json + header):** 26+ pages
- **Implemented and served:** 13 pages (6 React + 7 HTML)
- **Header links to non-implemented pages:** 13 links
- **Evidence:** Header links to `/trade_plans.html` etc. but `ui/vite.config.js` routeToFileMap only maps 7 HTML files; AppRouter has 6 React routes.

---

## 2) Feature–Process Map by Domain

### 2.1 Auth
| Feature | Process | Implemented | Evidence |
|---------|---------|-------------|----------|
| Login | POST /auth/login, JWT issue | ✅ | `api/routers/auth.py`, LoginForm.jsx |
| Register | POST /auth/register | ✅ | auth.py, RegisterForm.jsx |
| Reset password | Flow with token | ✅ | PasswordResetFlow.jsx |
| Protected routes | JWT + ProtectedRoute | ✅ | ProtectedRoute.jsx, authGuard.js |
| Guest redirect | Type C pages → / | ✅ | authGuard.js, ADR-013 |
| Admin guard | role check | ✅ | ProtectedRoute requireAdmin |

### 2.2 Financial Core
| Feature | Process | Implemented | Evidence |
|---------|---------|-------------|----------|
| Trading Accounts CRUD | D16 API + UI | ✅ | `api/routers/trading_accounts.py`, trading_accounts.html |
| Brokers Fees | D18, account-based | ✅ | `api/routers/brokers_fees.py`, brokers_fees.html |
| Cash Flows | D21 | ✅ | `api/routers/cash_flows.py`, cash_flows.html |
| Currency conversions | API | ✅ | TT2_SYSTEM_OVERVIEW, cash_flows |
| Executions | — | ❌ UI not implemented | `api/routers/` has no executions router; routes.json references it |

### 2.3 External Data (Stage-1)
| Feature | Process | Implemented | Evidence |
|---------|---------|-------------|----------|
| User Tickers | /me/tickers GET/POST/DELETE | ✅ | me_tickers.py, user_tickers.html |
| Add existing ticker | POST /me/tickers | ✅ | MARKET_DATA_PIPE_SPEC |
| Add new ticker | Create + junction | ✅ | WP_20_09, provider_mapping_data |
| Remove ticker | Soft delete | ✅ | user_tickers |
| Yahoo provider | Prices primary | ✅ | alpha_provider, yahoo_provider |
| Alpha fallback | FX primary, Prices fallback | ✅ | MARKET_DATA_PIPE_SPEC §2.1 |
| Cache-first | DB before API | ✅ | MARKET_DATA_PIPE_SPEC §2.3 |
| Smart history fill | gap_fill / force_reload | ✅ | sync_ticker_prices_history_backfill.py |
| Tickers CRUD (Admin) | D22 | 🟡 In progress | tickers.html, TEAM_20 data-integrity request |
| Data Dashboard | D23 | 🟡 Draft template | data_dashboard.html |

### 2.4 Analytics
| Feature | Process | Implemented | Evidence |
|---------|---------|-------------|----------|
| Ticker Dashboard | — | ❌ | Header link only |
| Trading Journal | — | ❌ | Header link only |
| Strategy Analysis | — | ❌ | Header link only |
| Trades History | — | ❌ | Header link only |
| Portfolio State | — | ❌ | Header link only |
| AI Analysis | — | ❌ | trade_plans link labeled "אנליזת AI" |

### 2.5 Admin
| Feature | Process | Implemented | Evidence |
|---------|---------|-------------|----------|
| Design System | /admin/design-system | ✅ | DesignSystemDashboard.jsx |
| System Management | system_management.html | ✅ | system_management.html |
| Tickers Management | tickers.html | ✅ | tickers.html |
| User Management | — | ❌ | Legacy DESIGN_FREEZE Phase 1; not in current routes |

---

## 3) Entity Map (from SSOT)

| Entity | Purpose | API/DB | Evidence |
|--------|---------|--------|----------|
| User | Identity, JWT | ✅ | identity.py, auth |
| Trading Account | Financial container | ✅ | trading_accounts model, D16 |
| Broker | Reference metadata | ✅ | reference router |
| Fees | Per-account commissions | ✅ | brokers_fees |
| Cash Flow | Deposits/withdrawals | ✅ | cash_flows |
| Ticker | Asset metadata | ✅ | tickers model |
| User Ticker | User–ticker junction | ✅ | user_tickers model |
| Ticker Prices | EOD + intraday | ✅ | ticker_prices, ticker_prices_intraday |
| Exchange Rates | FX | ✅ | exchange_rates |
| Positions | — | 🟡 Model exists | positions model; UI unclear |
| Trades | — | 🟡 Model exists | trades model; no UI |

**Source:** `documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_DOMAIN_MODEL_AND_ENTITIES.md`

---

## 4) Dependencies

### 4.1 Page → Entity Dependencies
- Trading Accounts → User, Broker
- Brokers Fees → Trading Account
- Cash Flows → Trading Account, Currency
- User Tickers → User, Ticker, provider_mapping_data
- Data Dashboard → Ticker, Prices, Status

### 4.2 Cross-Cutting
- **PDSC/sharedServices:** All UI→API via boundary (`sharedServices.js`)
- **Auth:** JWT, Type A/B/C/D routing (`TT2_AUTH_GUARDS_AND_ROUTE_SSOT`)
- **Market Data:** Cache-first, Yahoo+Alpha, Smart History (`MARKET_DATA_PIPE_SPEC`)

---

## 5) Open Questions

| # | Question | Owner | Severity |
|---|----------|-------|----------|
| 1 | Should header links to non-implemented pages be hidden or show placeholder? | Team 30 / Team 10 | Medium |
| 2 | Executions API: exists or planned? | Team 20 | Medium |
| 3 | User Management page: in scope for Phoenix or deferred? | Architect | Low |

---

**log_entry | TEAM_70 | PI-001_DRAFT | 2026-02-15**
