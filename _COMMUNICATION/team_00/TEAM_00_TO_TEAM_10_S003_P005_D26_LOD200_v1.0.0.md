---
id: TEAM_00_TO_TEAM_10_S003_P005_D26_LOD200_v1.0.0
historical_record: true
from: Team 00 (Principal)
to: Team 10 (TikTrack Gateway / Execution Lead)
cc: Team 100 (Chief Architect), Team 20 (TikTrack Backend), Team 30 (TikTrack Frontend),
    Team 110 (TikTrack Domain Architect — DDL review)
date: 2026-03-29
type: LOD200 — Level of Detail 200 (Scope + Decisions)
program: S003-P005
work_package: S003-P005-WP001
page: D26 (watch_lists)
stage: S003
pipeline_variant: TRACK_FULL---

# LOD200 — D26 Watch Lists (S003-P005-WP001)

## §1 — Page Identity

| Field | Value |
|---|---|
| **Page ID** | D26 |
| **Route** | `/watch_lists` |
| **Hebrew name** | רשימות צפייה |
| **Menu path** | מעקב → רשימות צפייה |
| **Stage** | S003 (Essential Data layer) |
| **Blueprint needed** | ✅ |
| **Server organism** | `WatchLists` (NEW — S003) |
| **DB tables** | `user_data.watchlists`, `user_data.watchlist_items` |

---

## §2 — Purpose

D26 enables users to create and manage **personal watchlists** — named collections of tickers they want to monitor together. Each watchlist displays its tickers with **live price data** (reusing the D33/Market Data infrastructure), allowing users to monitor custom groups of assets in one view.

**S003 scope (this WP):** Core CRUD + live price display.
**S005 scope (deferred):** ATR(14), Position, P/L%, P/L columns + flag-color filter enhancement (D26-Phase2 — requires D29 GATE_8 PASS).

---

## §3 — Data Model

### 3.1 — DB Schema (from LEGACY_TO_PHOENIX_MAPPING v2.5 §12–§13)

**`user_data.watchlists`**

| Column | Type | Constraints |
|---|---|---|
| `id` | ULID | PK NOT NULL |
| `user_id` | ULID | FK → user_data.users; NOT NULL |
| `name` | VARCHAR(100) | NOT NULL |
| `description` | TEXT | NULL |
| `is_public` | BOOLEAN | NOT NULL DEFAULT false |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |

**`user_data.watchlist_items`**

| Column | Type | Constraints |
|---|---|---|
| `id` | ULID | PK NOT NULL |
| `watchlist_id` | ULID | FK → watchlists.id; NOT NULL |
| `ticker_id` | ULID | FK → market_data.tickers; NOT NULL |
| `sort_order` | INTEGER | NOT NULL DEFAULT 0 |
| `added_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| `UNIQUE` | | (`watchlist_id`, `ticker_id`) |

> **DDL status:** Tables exist (migrated from legacy). **Team 110 confirmed: no delta required for S003 scope** (2026-03-31).

### 3.2 — Locked Field Decisions

| Decision | Value | Rationale |
|---|---|---|
| `is_public` | Schema exists; **S003 scope = personal only** (is_public always false, not exposed in UI) | Public watchlists = future scope |
| Max tickers per watchlist | **50** | Reasonable limit; prevents performance issues with live price polling |
| Max watchlists per user | **20** | Aligns with reasonable usage |
| Sort order | `sort_order` column — drag-and-drop deferred; S003 = manual position (up/down controls) | Full drag-and-drop = S005 |
| `display_name` for tickers | **Iron Rule from D33:** NEVER show raw symbol; always use ticker's `display_name` field | Consistent with D33 implementation |

---

## §4 — Feature Scope (S003)

### 4.1 — Watchlist Management

| Feature | Scope | Notes |
|---|---|---|
| Create watchlist | ✅ S003 | Name (required), description (optional) |
| Rename watchlist | ✅ S003 | Edit name/description inline or modal |
| Delete watchlist | ✅ S003 | Confirmation required; cascades to watchlist_items |
| List all watchlists | ✅ S003 | Sidebar or selector |
| Reorder watchlists | ❌ Deferred | S005 scope |

### 4.2 — Ticker Management within Watchlist

| Feature | Scope | Notes |
|---|---|---|
| Add ticker to watchlist | ✅ S003 | Search by display_name or symbol; uses existing tickers from market_data.tickers |
| Remove ticker from watchlist | ✅ S003 | |
| Move ticker up/down | ✅ S003 | Updates `sort_order` |
| Add ticker not yet in system | ❌ Not in scope | D26 lookup-only; creation via D22 (same pattern as D33) |

### 4.3 — Live Price Display

| Feature | Scope | Notes |
|---|---|---|
| Current price | ✅ S003 | Via Market Data service (same pattern as D33) |
| Price change % (day) | ✅ S003 | Color-coded: green/red |
| Volume | ✅ S003 | |
| Last updated timestamp | ✅ S003 | |
| Auto-refresh | ✅ S003 | Polling interval — reuse D33 pattern |
| Position / P&L | ❌ D26-Phase2 | S005 deferred |
| ATR(14) | ❌ D26-Phase2 | S005 deferred |

### 4.4 — Filtering and Sorting (S003)

| Feature | Scope | Notes |
|---|---|---|
| Sort by name | ✅ S003 | |
| Sort by price | ✅ S003 | |
| Sort by % change | ✅ S003 | |
| Filter by ticker name | ✅ S003 | Client-side search within watchlist |
| flag_color filter | ❌ D26-Phase2 | S005 deferred |

---

## §5 — Page Layout (LOD200 — Blueprint detail in WP)

```
┌─────────────────────────────────────────────────────────┐
│  Header (phoenix-header)                                │
├─────────────────────────────────────────────────────────┤
│  Watchlists Selector                                    │
│  [My List 1] [My List 2] [+ New Watchlist]              │
├─────────────────────────────────────────────────────────┤
│  Active Watchlist Panel                                 │
│  ┌── Header: [Name] [Edit] [Delete] [+ Add Ticker]     │
│  │                                                      │
│  │  Tickers Table:                                      │
│  │  | display_name | price | change% | volume | ↑↓ |  │
│  │  | AAPL         | 189.3 | +1.2%   | 42.3M  | ↑↓ |  │
│  │  | ...          | ...   | ...     | ...    | ↑↓ |  │
│  │                                                      │
│  └── Footer: [Sort controls] [Filter input]            │
└─────────────────────────────────────────────────────────┘
```

**Container:** `collapsible-container` pattern (Iron Rule — all pages).
**Header:** `phoenix-header` canonical header contract.
**Table:** Standard `tt-section-row` per row.

---

## §6 — API Surface (Backend — Team 20)

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/watchlists` | GET | List user's watchlists (id, name, description, item_count) |
| `/api/v1/watchlists` | POST | Create watchlist |
| `/api/v1/watchlists/{id}` | PUT | Update watchlist name/description |
| `/api/v1/watchlists/{id}` | DELETE | Delete watchlist + cascade items |
| `/api/v1/watchlists/{id}/items` | GET | Get watchlist items with live price data |
| `/api/v1/watchlists/{id}/items` | POST | Add ticker to watchlist |
| `/api/v1/watchlists/{id}/items/{item_id}` | DELETE | Remove ticker from watchlist |
| `/api/v1/watchlists/{id}/items/{item_id}/order` | PUT | Update sort_order (move up/down) |

> **Note:** TikTrack backend prefix = `/api/v1/` (consistent with TikTrack, NOT AOS v3's `/api/`).
> Live price data: inject from Market Data service via same mechanism as D33 (ticker_id lookup).

---

## §7 — Server Organism: WatchLists

New organism `WatchLists` at standard backend location. Responsibilities:
- Watchlist CRUD (user-scoped — never cross-user access)
- Watchlist items CRUD with unique constraint enforcement
- Sort order management
- Live price enrichment (delegate to Market Data / Tickers_Mgr organism)

---

## §8 — Iron Rules (inherited + page-specific)

| Rule | Source |
|---|---|
| display_name Iron Rule: NEVER show raw ticker symbol | D33 precedent, locked 2026-03-04 |
| collapsible-container page template | Global Iron Rule |
| 4-state status model | Global Iron Rule |
| NUMERIC(20,8) for financial values | KB-001 |
| maskedLog mandatory | Global |
| User-scoped data: enforce user_id = current_user at all endpoints | Security |
| Max 50 tickers per watchlist; reject 51st with 400 | This WP decision |
| Max 20 watchlists per user; reject 21st with 400 | This WP decision |
| Adding ticker: lookup-only (market_data.tickers); no creation | D26 scope decision |

---

## §9 — Dependencies

| Dependency | Status | Notes |
|---|---|---|
| D33 (User Tickers) S003-P004 | ✅ COMPLETE | Live price infrastructure available for reuse |
| Market Data background tasks | ✅ COMPLETE | Price refresh already operational |
| `market_data.tickers` table | ✅ EXISTS | Lookup source for add-ticker flow |
| `user_data.watchlists` + `watchlist_items` DDL | ✅ MIGRATED | **Team 110 confirmed: no delta** (2026-03-31) |
| `WatchLists` organism | ❌ NEW | Team 20 implements in this WP |

---

## §10 — Out of Scope (S003)

- Public watchlists (`is_public` field reserved for future)
- Shared/collaborative watchlists
- ATR(14), Position, P/L, P/L% columns → D26-Phase2 (S005)
- Flag-color filter → D26-Phase2 (S005)
- Drag-and-drop reordering
- Watchlist export

---

## §11 — Gate 0 Entry Criteria

Before S003-P005-WP001 run is created in AOS v3:

- [x] LOD200 reviewed and approved by Team 00/110 (Principal mandate 2026-03-31)
- [x] Team 110 confirms DDL: no delta needed (confirmed 2026-03-31)
- [x] Team 191 branch: first flight proceeds on aos-v3 branch; feature branch deferred to GATE_1 per Principal
- [x] Program Registry updated: S003-P005 → ACTIVE (Team 110, 2026-03-31)

---

**log_entry | TEAM_00 | LOD200_ISSUED | S003_P005_D26_WATCH_LISTS | 2026-03-29**
**log_entry | TEAM_110 | LOD200_REMEDIATED | G0_F01_IDENTITY_G0_F02_DDL_CONFIRMED_G0_F03_NAMES_FIXED | 2026-03-31**
**log_entry | TEAM_110 | LOD200_PREREQUISITES_CLOSED | ALL_5_ENTRY_CRITERIA_RESOLVED | PRINCIPAL_MANDATE | 2026-03-31**
