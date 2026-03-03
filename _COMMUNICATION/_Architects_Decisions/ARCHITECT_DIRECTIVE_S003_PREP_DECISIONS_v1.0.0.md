# ARCHITECT DIRECTIVE — S003 Preparation Decisions
## Ticker Price Display Rule + D39 Final Field Corrections + D40 Trading Hours + S008 Roadmap Entry

```
id:             ARCHITECT_DIRECTIVE_S003_PREP_DECISIONS_v1.0.0
from:           Team 00 — Chief Architect
to:             Team 170 (Documentation & Governance), Team 10 (awareness for S003 routing)
cc:             Team 100 (awareness), Team 190 (constitutional awareness)
date:           2026-03-03
authority:      Team 00 constitutional authority — Nimrod-approved 2026-03-03
status:         LOCKED
relates_to:     D33 (S003-P004), D39 (S003-P003), D40 (S003-P003), future S008
```

---

## DECISION 1 — Ticker Price Display: Iron Rule

### Locked Rule

**Wherever a ticker appears in any table, list, or row in the application — last_price and last_change (% and/or absolute) MUST be displayed.**

This is an Iron Rule effective from S003 onward. It applies to every page that renders a row containing a ticker symbol.

### Rationale

Price is the most fundamental data point for any ticker-aware interface. There is no meaningful reason to show a ticker symbol to the user without also showing what it is currently worth. This eliminates the need for the user to navigate away to check the price.

### Affected pages (current and future)

| Page | Show price? | Context |
|---|---|---|
| D33 user_tickers | ✅ YES — display only | Table column: last_price | % change |
| D26 watch_lists | ✅ YES — already in spec | Core feature |
| D34 alerts | ✅ YES — ticker rows | Where target_type = ticker |
| D28 ticker_dashboard | ✅ YES — header/detail | Core data |
| D29 trades | ✅ YES — ticker column | Current price reference |
| D30 trade_plans | ✅ YES — ticker column | Current price vs plan price |
| D31 trade_history | ✅ YES — price context | Chart primary data |
| D22 admin_tickers | ✅ YES — last known price | Admin awareness |
| Any future entity page showing a ticker symbol | ✅ YES | Universal rule |

### Implementation notes

**Data source:** `market_data.ticker_prices` (EOD) or `market_data.ticker_prices_intraday` (latest intraday row).

**Priority:**
1. If intraday data exists and is same-day → use intraday last price
2. Else → use EOD closing price
3. If no price available → display `—` (em-dash), never blank

**Display format (canonical):**
```
₪ / $ {last_price}    {change_pct}%  ▲ (green) or ▼ (red)
```

**D33 specifically:**
- Price columns are READ-ONLY in D33 — no edit capability
- D33 is a management page; price is informational context, not an editable field
- Sorting by price IS allowed in D33 table

---

## DECISION 2 — D39 Preferences: Final Field Corrections

### Correction A — Remove `default_commission`

**`default_commission` field is REMOVED from D39 Preferences.**

**Reason:** Phoenix has an advanced commission management system elsewhere. Adding a preference for commission default would create duplication with the existing commission infrastructure. The canonical source for commission defaults is the commission management module — NOT user preferences.

**Impact:** D39 Group B (Trading Defaults) now contains 6 fields (was 7).

### Correction B — Remove `trading_hours_start` and `trading_hours_end`

**`trading_hours_start` and `trading_hours_end` are REMOVED from D39 Preferences.**

**Reason:** Trading hours are a system-level setting, not a per-user preference. They define when the market is open — this is a fact about the market, not a personal preference. These fields belong in D40 System Management.

**Impact:** D39 Group B (Trading Defaults) now contains 6 fields (was 8 after commission removal; now 6).

**These two fields are MOVED to D40 System Management** — see Decision 3 below.

### Final D39 Field Set (Canonical — Nimrod-approved 2026-03-03)

**Total: 23 fields across 6 groups.**

**Group A — General / Display (4 fields)**
| Field | Type | Default |
|---|---|---|
| `timezone` | select (IANA) | `America/New_York` |
| `date_format` | select: DD/MM/YYYY \| MM/DD/YYYY \| YYYY-MM-DD | `DD/MM/YYYY` |
| `language` | select (display-only, Hebrew only now) | `he` |
| `primary_currency` | select: USD / ILS / EUR | `USD` |

**Group B — Trading Defaults (6 fields)**
| Field | Type | Default |
|---|---|---|
| `default_trading_account` | UUID FK → user's trading accounts | null |
| `default_stop_loss_pct` | number 0–50 | `5.0` |
| `default_target_pct` | number 0–100 | `10.0` |
| `default_risk_pct` | number 0–10 | `2.0` |
| `default_trade_amount` | number nullable | null |
| `pl_method` | select: FIFO / FILO | `FIFO` |

**Group C — UI (2 fields)**
| Field | Type | Default |
|---|---|---|
| `default_page_size` | select: 10 / 20 / 50 | `20` |
| `chart_default_period` | select: 1D / 1W / 1M / 3M / 1Y | `1M` |

**Group D — Default Filter (1 field)**
| Field | Type | Default |
|---|---|---|
| `default_status_filter` | select: all / active / pending | `active` |

**Group E — Market Data Display (4 fields)**
| Field | Type | Default |
|---|---|---|
| `show_volume` | boolean | `true` |
| `show_pct_change` | boolean | `true` |
| `show_market_cap` | boolean | `false` |
| `show_52week_range` | boolean | `false` |

**Group F — Alert Defaults (2 fields)**
| Field | Type | Default |
|---|---|---|
| `alert_default_threshold_pct` | number | `5.0` |
| `alert_market_hours_only` | boolean | `true` |

### Architectural Constraint: Flexible Extension

**D39 preferences storage must be designed for easy field addition without schema migration.**

Implementation requirement:
- Storage: JSONB `settings` column on `user_data.users` table
- New preferences added by: (1) defining the field in `PreferencesSchema`, (2) adding default to `DEFAULT_PREFERENCES` dict — no DB migration required
- Field validation: server-side via schema, not DB-level constraints
- Unknown fields: ignored (forward compatibility)

---

## DECISION 3 — D40 System Management: Add Trading Hours

**`trading_hours_start` and `trading_hours_end` are ADDED to D40 Market Data Settings section.**

These are system-level settings that define when the market is considered "open" for all background tasks, alert evaluation, and intraday price sync scheduling.

**Add to D40 Section 2 (Market Data Settings):**

| Field | Type | Default | Used by |
|---|---|---|---|
| `trading_hours_start` | time HH:MM | `09:30` | APScheduler, alert evaluation engine, intraday sync |
| `trading_hours_end` | time HH:MM | `16:00` | Same |
| `trading_timezone` | select (IANA) | `America/New_York` | Timezone context for above times |

**Note:** `trading_timezone` is a system-level setting (D40), distinct from `timezone` in D39 which is the user's display timezone. A user in Israel can have `timezone=Asia/Jerusalem` for display while the system uses `trading_timezone=America/New_York` for all market calculations.

---

## DECISION 4 — S008 Roadmap Entry: General Notification / Toast System

**A future notification/toast system is added to the roadmap as a Stage 8 work package.**

**Roadmap entry:**

```
ID:     S008-NOTIFICATION-TOAST-SYSTEM
Stage:  S008 (post-S006)
Name:   General Notification & Toast System
Type:   Cross-cutting infrastructure
Priority: NON-URGENT — implement after all core pages are complete

Scope:
  1. Replace ALL browser alert() and confirm() calls with in-app modal dialogs
     (this is already being done incrementally per page — this WP COMPLETES it universally)
  2. Toast/snackbar notification system:
     - Ephemeral toasts (non-blocking, auto-dismiss after N seconds)
     - Blocking confirmation modals (require user action)
     - Levels: SUCCESS (green) | WARNING (orange) | ERROR (red) | INFO (blue)
     - Colors match TikTrack entity color system
  3. In-app alert notification panel (replaces individual page notification bells)
  4. Replace all current confirm/alert usages with a unified NotificationService

Legacy reference:
  /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/
  The legacy notification system had multiple levels and display modes.
  Study the legacy implementation before writing LOD200 for this WP.

Status: DEFERRED — not urgent until S007+
Current behavior: per-page modal implementation via PhoenixModal is acceptable
```

**Team 170 instruction:** Add this entry to the roadmap under a future stages section.
Team 100 / Team 190: Constitutional awareness only.

---

## ROUTING SUMMARY

| Team | Action required |
|---|---|
| **Team 170** | Apply all 4 decisions to canonical governance documents |
| **Team 10** | Awareness: D39/D40 decisions ready for S003-P003 LOD200 when stage opens |
| **Team 20** | Awareness: JSONB-based D39 storage model + `trading_timezone` in D40 settings |
| **Team 30** | Awareness: Iron Rule — price + change% displayed wherever ticker appears |
| **Team 190** | Awareness: D39 canonical field set locked; D40 trading hours added |
| **Team 100** | Awareness only |

---

*log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_S003_PREP_DECISIONS | v1.0.0_ISSUED | 2026-03-03*
