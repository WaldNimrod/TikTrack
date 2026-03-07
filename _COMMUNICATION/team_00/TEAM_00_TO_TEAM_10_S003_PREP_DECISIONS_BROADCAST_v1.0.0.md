# TEAM 00 → TEAM 10 — Architectural Decisions Broadcast
## S003 Preparation Package + Governance Corrections — Team 10 Awareness & Forward Planning

```
from:           Team 00 — Chief Architect
to:             Team 10 — Gateway & Execution Lead
cc:             Team 20 (Backend), Team 30 (Frontend), Team 50 (QA/FAV),
                Team 90 (Validation), Team 170 (Spec/Governance)
date:           2026-03-03
re:             New architectural decisions from 2026-03-03 affecting S003 planning
                + S003 governance alignment corrections confirmed
status:         AWARENESS — no immediate action required on current WP
                FORWARD PLANNING — these decisions govern your next execution cycle
```

---

## OPERATIONAL STATE (AS OF 2026-03-03)

| Item | Status |
|---|---|
| S002-P003-WP002 | **GATE_6 PASS** — per `ARCHITECT_GATE6_DECISION_S002_P003_WP002_v1.1.0.md` (2026-03-01) |
| Current gate | GATE_7 (Nimrod browser-level UX sign-off) |
| S003 governance alignment | **PASS_WITH_ACTIONS → fully ratified** — Team 190 validation closed |
| S004-P007 (Indicators) | **Canonical ID ratified** — S004-PXXX placeholder retired |

**Current WP continues per existing directives. No scope changes to WP002.**

This broadcast covers only the S003 architectural decisions and corrections that go into effect from S003 onward.

---

## SECTION 1 — IRON RULE: TICKER PRICE DISPLAY (effective from S003)

**Source:** `ARCHITECT_DIRECTIVE_S003_PREP_DECISIONS_v1.0.0.md` §Decision 1

### The Rule

**Wherever a ticker appears in any table, list, or row — `last_price` and `last_change` (% and/or absolute) MUST be displayed.**

This is a system-wide Iron Rule, effective from S003 onward. No exceptions.

### Display logic

| Priority | Source | Condition |
|---|---|---|
| 1st | `market_data.ticker_prices_intraday` | Same-day intraday record exists |
| 2nd | `market_data.ticker_prices` | EOD closing price |
| Fallback | Display `—` (em-dash) | No price data available — never blank |

### Affected pages (current + planned)

| Page | Show price | Notes |
|---|---|---|
| D33 user_tickers | ✅ | Read-only columns in table; sorting allowed; NO edit |
| D26 watch_lists | ✅ | Already in spec |
| D34 alerts | ✅ | Rows where target_type = ticker |
| D28 ticker_dashboard | ✅ | Header/detail |
| D29 trades | ✅ | Ticker column |
| D30 trade_plans | ✅ | Ticker column |
| D31 trade_history | ✅ | Chart primary data |
| D22 admin_tickers | ✅ | Last known price (admin awareness) |
| All future entity pages with ticker | ✅ | Universal Iron Rule |

### Canonical display format

```
₪ / $ {last_price}    {change_pct}%  ▲ (green) or ▼ (red)
```

**Team 20 note:** Ensure price query is efficient — consider JOIN or subquery per page, not N+1.
**Team 30 note:** Price columns in D33 are display-only (no edit), but sortable.

---

## SECTION 2 — D33 SCOPE CONFIRMED (S003-P004)

**Source:** `ARCHITECT_DIRECTIVE_S003_PREP_DECISIONS_v1.0.0.md` §Decision 1 + MEMORY

D33 (user_tickers) scope for S003:

| Feature | Included |
|---|---|
| Filtering (status filter, symbol search) | ✅ |
| Sorting (by date, symbol, status, last_price) | ✅ |
| Pagination | ✅ |
| Live price display (last_price + last_change%) | ✅ — READ-ONLY display columns |
| Inline tag assignment | ❌ — deferred to S004 (inline per entity page) |
| display_name column | ✅ — already in WP002 scope |

**No LOD200 for D33 exists yet.** LOD200 production begins after current WP GATE_8 PASS.

---

## SECTION 3 — D39 PREFERENCES: FINAL FIELD SET (S003-P003)

**Source:** `ARCHITECT_DIRECTIVE_S003_PREP_DECISIONS_v1.0.0.md` §Decision 2

**23 fields, 6 groups. Canonical — Nimrod-approved 2026-03-03.**

### Group A — General / Display (4 fields)
| Field | Type | Default |
|---|---|---|
| `timezone` | select (IANA) | `America/New_York` |
| `date_format` | select | `DD/MM/YYYY` |
| `language` | select (display-only — Hebrew only now) | `he` |
| `primary_currency` | select: USD / ILS / EUR | `USD` |

### Group B — Trading Defaults (6 fields)
| Field | Type | Default |
|---|---|---|
| `default_trading_account` | UUID FK → user trading accounts | null |
| `default_stop_loss_pct` | number 0–50 | `5.0` |
| `default_target_pct` | number 0–100 | `10.0` |
| `default_risk_pct` | number 0–10 | `2.0` |
| `default_trade_amount` | number nullable | null |
| `pl_method` | select: FIFO / FILO | `FIFO` |

### Group C — UI (2 fields)
| Field | Default |
|---|---|
| `default_page_size` | `20` |
| `chart_default_period` | `1M` |

### Group D — Default Filter (1 field)
| Field | Default | Note |
|---|---|---|
| `default_status_filter` | `active` | ONE global filter — applies to ALL entity tables |

### Group E — Market Data Display (4 fields)
| Field | Default |
|---|---|
| `show_volume` | `true` |
| `show_pct_change` | `true` |
| `show_market_cap` | `false` |
| `show_52week_range` | `false` |

### Group F — Alert Defaults (2 fields)
| Field | Default |
|---|---|
| `alert_default_threshold_pct` | `5.0` |
| `alert_market_hours_only` | `true` |

### Storage architecture
- JSONB `settings` column on `user_data.users`
- New fields: define in `PreferencesSchema` + add default to `DEFAULT_PREFERENCES` — **no DB migration**
- Validation: server-side via schema, not DB-level constraints

### Removed fields (do NOT implement)
- `default_commission` — dup of advanced commission system
- `trading_hours_start` / `trading_hours_end` — moved to D40 (see Section 4)
- `sidebar_collapsed`, `currency_display`, `number_format`, `show_welcome_banner`, `compact_mode`

**LOD200 for D39 not yet written. Spec team activates after WP002 GATE_8 PASS.**

---

## SECTION 4 — D40 SYSTEM MANAGEMENT: SCOPE DEFINED (S003-P003)

**Source:** `ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v2.0.0.md` §B2 + `ARCHITECT_DIRECTIVE_S003_PREP_DECISIONS_v1.0.0.md` §Decision 3

**Admin-only page. 7 sections.**

| # | Section | Content |
|---|---|---|
| 1 | SYSTEM OVERVIEW | Market status, DB status, background jobs health, active tickers count, pending tickers count — always-visible summary container at top |
| 2 | MARKET DATA SETTINGS | Existing settings (migrated from current system_management.html) + `trading_hours_start` (HH:MM, default `09:30`) + `trading_hours_end` (HH:MM, default `16:00`) + `trading_timezone` (IANA, default `America/New_York`) |
| 3 | BACKGROUND TASKS | APScheduler job list, manual trigger, run history — FROM CURRENT WP |
| 4 | ALERT SYSTEM MONITOR | Evaluation engine status (last run, next run), active alerts count, triggered_unread count |
| 5 | NOTIFICATIONS MONITOR | Future placeholder — label + "coming in future release" |
| 6 | AUDIT LOG | Last 50 admin actions |
| 7 | FEATURE FLAGS / CODE FLAGS | `maintenance_mode` (On/Off), feature toggles, build version (read-only), SMTP status |

### Critical clarifications

**`trading_timezone` (D40) ≠ `timezone` (D39):**
- `D40.trading_timezone` = system-level (when the market is open — used by APScheduler, alert evaluation, intraday sync)
- `D39.timezone` = user-level (display timezone for the user's UI)
- A user in Israel can have `D39.timezone = Asia/Jerusalem` while `D40.trading_timezone = America/New_York`

**Feature Flags = CODE/DEV flags only:**
- ✅ `maintenance_mode`, build version, feature toggles, SMTP status
- ❌ Watch-list flags — those live on `watch_list_items.flag_color` (D26 data)
- ❌ Ticker catalog management → belongs in D22

**User management NOT in D40 → see Section 5 (D41)**

---

## SECTION 5 — D41 USER MANAGEMENT: NEW PAGE ADDED TO S003

**Source:** `ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v2.0.0.md` §B3

New page D41 added to S003, companion to D40. Admin-only.

| Feature | Description |
|---|---|
| User list | UUID, email, role, status, created_at |
| Filters | active / inactive / admin |
| Actions | Activate, Deactivate, Change Role (user → admin requires confirmation dialog) |
| No user creation | Users self-register (admin invite flow is future scope) |

**Scope determination at LOD200:** If D41 scope is determined too small for a standalone page, it may be implemented as a `<tt-section>` within D40. Team 10 flags this to spec team when LOD200 for S003-P003 is commissioned.

**S003-P003 now covers: D39 + D40 + D41.**

---

## SECTION 6 — D37 DATA IMPORT: SCOPE FINALIZED (S004-P005)

**Source:** `ARCHITECT_DIRECTIVE_PL_RECONCILIATION_POLICY_v1.0.0.md`

D37 is both import AND reconciliation (Option B — Delta-Reset).

### Import modes (user selects)
- `executions_only` — parse and import execution records only
- `cash_flows_only` — parse and import cash flow records only
- `both` — parse and import both (recommended default)

### Broker connectors
| Connector | Parser | Status |
|---|---|---|
| IBKR (Interactive Brokers) | `api/connectors/ibkr/ibkr_parser.py` | PRIMARY |
| IBI | `api/connectors/ibi/ibi_parser.py` | SECOND |

**BaseConnector abstract class** required: `api/connectors/base_connector.py`
- All connectors implement: `parse_executions()`, `parse_cash_flows()`, `detect_format()`, `validate_file()`
- IBI connector: LOD400-stage implementation (architecture established at LOD200)

### Delta detection (runs on EVERY import — mandatory)
1. Finds executions in file NOT in system → flags as missing
2. Finds cash flows in file NOT in system → flags as missing
3. Computes P&L delta (broker P&L vs system P&L)
4. Shows Delta Report to user → user approves each category
5. Records: audit log per import SESSION (not per DB row); file always archived

**`import_reconciliation_service.py`** handles detection algorithm.

### NOT in scope until S006+
- Option C (Direct Broker API via IBKR TWS API / IBI API) → roadmap entry: `S006-DIRECT-BROKER-API`

---

## SECTION 7 — D36 P&L PAGE SCOPE (S004-P004)

**Source:** `ARCHITECT_DIRECTIVE_PL_RECONCILIATION_POLICY_v1.0.0.md`

D36 is **display only**. It calls the P&L service — it does NOT implement calculation logic.

| D36 displays | D36 does NOT do |
|---|---|
| Realized P&L per trade (from stored `realized_pl`) | Store any P&L values itself |
| Unrealized P&L / MTM (computed on read — never stored) | Implement FIFO/FILO algorithm |
| P&L by account / ticker / period | Handle import or reconciliation |
| P&L method label: "שיטת חישוב: FIFO" (from D39 preference) | — |

**`pl_method` (FIFO/FILO)** stored in D39 preferences → affects D36, D29 trade close, D32 portfolio snapshot. Default: `FIFO`.

---

## SECTION 8 — S004-P007 INDICATORS INFRASTRUCTURE (NEW WP — END OF S004)

**Source:** `ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v2.0.0.md` §B1 + Team 00 ratification

**Program ID: S004-P007 (canonical, ratified 2026-03-03). Positioned LAST in S004, after D29 (trades).**

### Deliverables
1. `market_data.ticker_indicators` table — schema: `ticker_id, indicator_name, period, value NUMERIC(20,8), calculated_at, price_date`
2. `indicator_computation_service.py` — indicators: ATR(14), MA(20/50/150/200), CCI(20); extensible architecture
3. Background job: `nightly_indicators_calculation` (registered in `scheduler_registry.py` — Iron Rule)
4. API endpoint: `GET /api/v1/tickers/{id}/indicators` (admin: all tickers; user: their tickers only)

### PREREQUISITE constraint

The following S005 pages **may NOT begin LOD200 production** until S004-P007 GATE_8 PASS:

| Page | Why blocked |
|---|---|
| D26-Phase2 | ATR(14) column requires `ticker_indicators` table |
| D28 Ticker Dashboard | Indicator panel |
| D25 AI Analysis | Needs indicator values as input |
| D31 Trade History | MA overlay chart series |

**Do not commission LOD200 for these 4 programs until S004-P007 is complete.**

---

## SECTION 9 — SSOT CORRECTIONS APPLIED (GOVERNANCE — NO IMPLEMENTATION IMPACT)

**Source:** `ARCHITECT_DIRECTIVE_SSOT_CORRECTIONS_v1.0.0.md` — applied by Team 170

These are governance document fixes. No code changes required. Listed for awareness:

| Correction | What changed |
|---|---|
| C1 | `notes.parent_type` — `general` removed; canonical list confirmed: `ticker/user_ticker/alert/trade/trade_plan/account/datetime` |
| C2 | S003 roadmap narrative fixed — removed D34/D35 references (those are S001) |
| C3 | D26-Phase2 added to SSOT_MASTER_LIST under S005 |
| C4 | D38 stage note added (D38 = S005, not S003) |
| C5 | Canonical path header added to TT2_PAGES_SSOT_MASTER_LIST |

**Implementation check — Team 10 verify:** Confirm `'general'` does NOT appear in any note parent_type reference in the current codebase (already required by Iron Rule; this is a cross-check).

---

## SECTION 10 — S003 STAGE COMPOSITION (CONFIRMED)

After WP002 GATE_8 PASS, S003 opens. The correct S003 page set is:

| ID | Page | Program |
|---|---|---|
| D33 | user_tickers | S003-P004 |
| D39 | preferences | S003-P003 |
| D40 | system_management | S003-P003 |
| D41 | user_management | S003-P003 |
| D26 | watch_lists (Phase 1) | S003-P001 or P002 (confirm at GATE_0) |

**NOT in S003:**
- D38 (tag_management) → S005
- D34 (alerts) → already done (S001/WP002)
- D35 (notes) → already done (S001/WP002)

---

## UPCOMING SESSION SEQUENCING (TEAM 10 AWARENESS)

| Session | Topic | When |
|---|---|---|
| S001-P002 Alerts POC | Test agents_os governance | Immediately after WP002 GATE_8 PASS |
| Session #2 | D25 AI Analysis deep-dive | After S003 GATE_0 |
| Session #3 | D31 Trade History blueprint | Dedicated session |
| Session #4 | D32 Portfolio State spec-first | Dedicated session |

---

## IRON RULES RECAP (ALL STILL ACTIVE)

1. **Team 50 = QA + FAV** — never Team 40 (Team 40 = UI Assets only)
2. **NUMERIC(20,8)** — all financial values, zero rounding
3. **Status: `pending | active | inactive | cancelled`** everywhere — never `open/closed`
4. **notes parent_type: NO `general`** — valid: `ticker/user_ticker/alert/trade/trade_plan/account/datetime`
5. **D38 = S005** — not S003
6. **D33 shows last_price + last_change%** — display-only, sortable, never blank
7. **scheduler_registry.py** — ALL background jobs registered here, no exceptions
8. **S004-P007 GATE_8 PASS** — prerequisite before LOD200 for D26-Phase2, D28, D25, D31

---

## WHAT TEAM 10 NEEDS TO DO NOW

**Nothing in the current WP changes.** WP002 proceeds per existing directives.

When WP002 closes (after GATE_7 + GATE_8):
1. **Read this broadcast** — internalize S003 scope, all decisions in Sections 1–9
2. **S003 GATE_0 package** — commission spec documents for S003-P003 (D39+D40+D41) and S003-P004 (D33)
3. **Note LOD200 blockers** — S004-P007 (Indicators) must complete before D26-Phase2/D28/D25/D31 LOD200 can begin

---

*log_entry | TEAM_00 | TEAM_10_S003_PREP_DECISIONS_BROADCAST | ISSUED | 2026-03-03*
