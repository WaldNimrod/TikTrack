# TEAM_00 — Legacy Gap Analysis Report
## LOD200 Work Packages vs. Legacy Feature Parity

```
author: Team 00 — Chief Architect
date: 2026-03-02
scope: S003-P03 (LOD200 exists) + S003-S006 upcoming pages
legacy_source: /Users/nimrod/Documents/TikTrack/TikTrackApp/
status: DRAFT — AWAITING NIMROD DECISIONS
```

---

## METHODOLOGY

**What was reviewed:**
1. `S003_P03_TAGS_WATCHLISTS_LOD200_v1.0.0/ARCHITECTURAL_CONCEPT.md` — only LOD200 that exists outside S002
2. `S002_P003_TIKTRACK_ALIGNMENT_LOD200_v1.0.0/ARCHITECTURAL_CONCEPT.md` — for D33 context
3. `PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` + `TT2_PAGES_SSOT_MASTER_LIST.md` — full scope map
4. `LEGACY_TO_PHOENIX_MAPPING_V2.5.md` — schema migration decisions
5. Legacy code: models, routes, frontend HTML pages for all planned pages
6. Legacy: tag.py, tag_link.py, tag_category.py, tag_service.py, preferences.py, user_ticker.py,
   execution.py, trade.py, trade_plan.py, plan_condition.py, ai_analysis.py
7. Legacy: all relevant HTML pages in /trading-ui/

**Gap severity scale:**
- 🔴 BLOCKING — decision must be made before LOD400 production / before work begins
- 🟠 HIGH — significant feature loss or architectural risk; needs explicit resolution
- 🟡 MEDIUM — deferred is acceptable but must be documented with roadmap entry
- 🟢 LOW — minor, easy to add, recommend doing now

---

## SECTION 1: S003-P03 — D38 TAG MANAGEMENT (LOD200 EXISTS)

### Overview
LOD200 specifies a **flat single-level tag registry** (`user_data.user_tags`).
Legacy had a **2-level hierarchical system** (TagCategory → Tag) with **full polymorphic entity assignment** (8 entity types), analytics, search, suggestions, and slug tracking.

---

### GAP-D38-01: Tag Categories Removed (Architecture Decision A1)
**Severity: 🔴 BLOCKING**

**Context:**
Legacy `tag_categories` table had: user_id, name, color_hex, order_index, is_active.
Legacy `tag` table had: user_id, category_id (nullable FK), name, slug, description, is_active, usage_count, last_used_at.
LOD200 has a single `user_tags` table with no category support.
Architecture Decision A1 says "no FK migration in S003" but does not explain WHY categories were dropped.

**Legacy example:**
User could organize: Category "Technicals" → tags [RSI_divergence, breakout, support], Category "Psychology" → tags [FOMO, revenge_trade, patience]

**Implications:**
- Without categories, all tags appear in one flat list — usable but less organized for power users
- If categories are added later (S004/S005), it requires a migration adding `category_id` to existing `user_tags` rows
- Adding categories now = trivial (just one extra table); adding later = migration cost

**Options:**
- A: **Keep LOD200 flat** — explicitly document categories as a future S005 enhancement with roadmap entry. Trivial migration when needed.
- B: **Add optional category FK now** — add `category_id` nullable to `user_tags` + `user_tag_categories` table. No categories UI in D38 S003, just the DB scaffolding.
- C: **Full 2-level hierarchy now** — add categories table + category management UI to D38 scope.

**Recommendation:** Option A, but only if Nimrod confirms he does not want tag categories in the near term. If he expects to add them in S004/S005, Option B (nullable FK now) is cleaner.

---

### GAP-D38-02: Tag-to-Entity Assignment System Missing
**Severity: 🔴 BLOCKING — needs explicit roadmap entry**

**Context:**
In legacy, tags were the primary cross-entity labeling system. The `tag_link` polymorphic join table connected tags to: trade, trade_plan, execution, trading_account, ticker, alert, note, cash_flow.
TagService had: `replace_tags_for_entity()`, `get_tags_for_entity()`, `remove_all_tags_for_entity()`.
Event listeners on model DELETE events automatically cleaned up tag links.

In Phoenix LOD200 Architecture Decision A1: "notes ARRAY(String) stays, no FK migration in S003."
This means in S003, tags are a registry only — they cannot be assigned to anything.

**Implications:**
- There is no roadmap entry for when tag assignment becomes available
- Without assignment, D38 is a feature users will not understand ("why can I create tags but not use them?")
- The UX story needs to either: (a) be honest ("tags will be assignable from S004"), or (b) include assignment in S003 scope

**Options:**
- A: **S003 = registry only** — explicitly state in page that "tags will be usable across the system from stage X." Add roadmap entry now for when assignment lands (suggest S004 or S005).
- B: **Add entity_tags table now** (DB scaffolding only, no assignment UI) — creates the join table so future stages can add assignment endpoints without migration.
- C: **Add assignment to D38 scope** — allow tagging user_tickers, alerts, notes from D38. Complex, expands scope significantly.
- D: **Add assignment inline on each entity's page** — when D26/D29/D33 are built, each gets a tag field. No separate D38 assignment UI.

**Recommendation:** Option A + D. Registry in S003, inline assignment when each entity page is built (S003+ per entity). This is the most natural UX. Create roadmap entries per entity now.

---

### GAP-D38-03: No Search Endpoint in LOD200
**Severity: 🟢 LOW**

**Context:**
Legacy had `GET /api/tags/search?query=&entity_type=&limit=` and `GET /api/tags/suggestions`.
LOD200 specifies only GET list + GET summary.

**Implications:**
- Without search, tag pickers in modals (when assignment is added later) cannot function efficiently for users with many tags.
- Easy to add now.

**Options:**
- A: Add `GET /api/v1/me/tags/search?q=` endpoint to LOD200 now (trivial — filter on name ILIKE '%q%').
- B: Add search as query param to main list endpoint: `GET /api/v1/me/tags?q=`.

**Recommendation:** Option B (query param on existing endpoint). No new endpoint needed, consistent with other list endpoints.

---

### GAP-D38-04: No Tag Analytics / Usage Tracking
**Severity: 🟡 MEDIUM**

**Context:**
Legacy tracked `usage_count` and `last_used_at` on each tag, maintained by TagService on every assign/remove.
Legacy had analytics endpoint: summary + usage leaderboard by entity.
LOD200 has only a summary endpoint (total tags, active count, etc.).

**Implications:**
- No usage tracking means tag analytics are unavailable
- Usage count is needed for smart sorting in tag pickers ("most used tags at top")
- Adding usage tracking later requires a migration

**Options:**
- A: **Add usage_count + last_used_at to user_tags table now** (trivial columns, default 0/NULL). No analytics UI in S003. Maintained by assignment service when it's built.
- B: **Skip entirely** — compute analytics from entity_tags join when needed.

**Recommendation:** Option A — add columns now, zero cost, high value later.

---

### GAP-D38-05: No Slug System
**Severity: 🟢 LOW**

**Context:**
Legacy maintained machine-readable slugs (lowercase, hyphens, max 120 chars) for URL/export stability.
LOD200 has no slug field.

**Implications:**
- Minor — slugs are useful for API querying by name but not critical
- Easy to add now, unnecessary migration later if needed

**Options:**
- A: Skip — use UUID for all references
- B: Add generated slug column (auto-computed from name, lowercase+hyphen) — no UI exposure

**Recommendation:** Option A for now. UUID-based system is fine. Tag-by-name lookup can use ILIKE.

---

## SECTION 2: S003-P03 — D26 WATCHLISTS (LOD200 EXISTS)

### Overview
LOD200 specifies Master-Detail layout with list CRUD + items. Items JOINs market_data.tickers for: symbol, company_name, current_price, daily_change_pct, ticker_type.
Legacy had significantly richer item columns and view modes.

---

### GAP-D26-01: No Flag/Bookmark System on Items
**Severity: 🟢 LOW — easy to add now, painful to add later**

**Context:**
Legacy `watch_lists.html` had a flag column per item (boolean per watchlist item).
This is a native feature of most professional watchlist tools — allows marking specific items for attention without creating a separate watchlist.

**Implications:**
- Easy to add: just `is_flagged BOOLEAN DEFAULT FALSE NOT NULL` on `watch_list_items`
- Later addition requires a migration on an already-populated table
- The "active flags" summary stat in legacy referenced this field

**Options:**
- A: **Add `is_flagged` column to LOD200 now** — trivial, one column + toggle endpoint (PATCH item).
- B: Defer — add via future migration.

**Recommendation:** Option A — add now. One extra column, prevents a future migration.

---

### GAP-D26-02: ATR / P&L / Position Columns on Watchlist
**Severity: 🟡 MEDIUM — intentional deferred items needing explicit documentation**

**Context:**
Legacy watchlist had columns: ATR(14), Position (current size from trades), P/L, P/L%.
These require: (a) computed indicators (DEFERRED per architecture), (b) trades data (S005 domain).

**Implications:**
- Users expect these columns in a watchlist — it's core value proposition
- Not possible until: indicators (post-S003) and trades (S005)
- Need explicit "Phase 2 Enhancement" note in D26 spec so Team 10 knows to expect a later expansion

**Options:**
- A: Document in LOD200 as explicit "Phase 2 columns" to be added post-S005 (no schema change, just documentation + planned API extension).
- B: Add null column stubs now (show "—" until data available) — more complex, adds confusion.

**Recommendation:** Option A — document as deferred with explicit trigger condition (available after D29-trades GATE_8 PASS).

---

### GAP-D26-03: Multiple View Modes (Table / Cards / Compact)
**Severity: 🟡 MEDIUM**

**Context:**
Legacy had a view mode toggle: table / cards / compact. Three different UI renderings of the same data.

**Implications:**
- LOD200 specifies Master-Detail layout which is already a significant UX step up
- Adding view modes increases scope but improves UX richness
- Table-only is functional; cards adds visual appeal

**Options:**
- A: **Add view toggle to LOD200** — two modes: table + cards (skip compact). Adds ~1 day of frontend work.
- B: Table only for S003, view modes as enhancement task in a future sprint.

**Recommendation:** Option A if scope allows. Option B is safe fallback. At minimum, document the cards view as a planned enhancement.

---

### GAP-D26-04: External Tickers (Tickers Not in market_data.tickers)
**Severity: 🟡 MEDIUM — requires architectural decision**

**Context:**
Legacy had a concept of "external tickers" in watchlists — items that point to a symbol not in the system's ticker catalog. This allows watching symbols before formally adding them.

**Implications:**
- In Phoenix architecture, `watch_list_items.ticker_id → market_data.tickers` (FK) — so by definition, you can ONLY add tickers that exist in the catalog
- A user who wants to watch a ticker that's not in the system cannot do so without first adding it via D22
- This creates a dependency: to use D26, you must use D22 first

**Options:**
- A: **Accept the dependency** — to add to a watchlist, ticker must exist in market_data.tickers. Document clearly in UX.
- B: **Add free-text symbol field** on `watch_list_items` (nullable ticker_id, non-null symbol) — allows non-catalog items but loses price data join.
- C: **Quick-add flow** — "Add ticker" in watchlist modal triggers D22 creation in the background automatically.

**Recommendation:** Option A for S003 (clean architecture). Option C worth noting as future enhancement — it's a great UX feature.

---

## SECTION 3: S003 — D33 USER TICKERS (G7 REMEDIATION)

### Overview
The G7 directive adds `status` and `notes` fields to `user_tickers`. But legacy had additional fields not covered.

---

### GAP-D33-01: name_custom and type_custom Fields Missing
**Severity: 🟠 HIGH — feature regression**

**Context:**
Legacy `user_ticker.py` had:
- `name_custom = Column(String(100))` — user's personal name for the ticker (e.g., "My Main AAPL Position")
- `type_custom = Column(String(20))` — user's override of ticker type classification

These appeared in the frontend table ("שם הטיקר" column could show the custom name).

**Implications:**
- Without `name_custom`, users lose the ability to label their positions with personal context
- This is a genuine UX regression from V1 to V2
- Adding these columns to M-001 migration now = trivial (same migration already being written)
- Adding later = new migration

**Options:**
- A: **Add both fields to M-001** — `name_custom VARCHAR(100) NULL`, `type_custom VARCHAR(20) NULL`. Exposed in API response and editable in D33 form.
- B: Add only `name_custom` — `type_custom` is covered by status + the system ticker type is canonical anyway.
- C: **Skip both** — use tags system for personal labeling instead (but tags aren't assignable until later).

**Recommendation:** Option A — add both to M-001. They're simple nullable text fields. Minor schema cost, significant UX parity. `type_custom` is debatable but cheap to add now.

---

## SECTION 4: S003 — D39 PREFERENCES (NO LOD200)

### Overview
No spec exists in Phoenix for the preferences page. Legacy is the most complex page in the system — 9 sections, 66+ color variables, multi-profile system. This needs a scoping decision before S003 GATE_0.

---

### GAP-D39-01: No Preferences Spec Exists — Major Scope Risk
**Severity: 🔴 BLOCKING — must be resolved before S003 GATE_0**

**Context:**
Legacy preferences had 9 preference categories:
1. **Profile Management** — create/switch/delete multiple preference profiles (each with its own settings snapshot)
2. **Basic Settings** — primaryCurrency, secondaryCurrency, timezone, language, default_trading_account, pagination_size
3. **Trading Settings** — defaultStopLoss, defaultTargetPrice, defaultCommission, atr_period, ATR thresholds, market_cap_warning
4. **Filter Defaults** — persisted default filter state across all pages (status, type, date range, search)
5. **Notification Settings** — delivery channels, categories, console log categories, notification modes (debug/dev/work/silent)
6. **Color Themes** — 66+ CSS color variables across 10 groups (chart, entity, status, value, theme, UI, notification)
7. **Chart Settings** — autoRefresh, refreshInterval, quality, animations, tooltips, export (format/quality/resolution/background)
8. **UI Settings** — theme (light/dark/system), compactMode, showAnimations, table/log page sizes
9. **Preference Types Audit** — read-only audit table of all registered preference types

**Phoenix-specific complications:**
- Phoenix uses a design system (DNA palette, CSS variables from docs-system/07-DESIGN) — the 66 color overrides would need to integrate with this
- Multi-profile system is architecturally complex (multiple stored profiles per user, switch/default/create/delete)
- Notification settings overlap with the G7 directive's notification system (`user_data.notifications`)
- Filter defaults would need to persist to DB per-user (currently not specced anywhere)

**Options:**
- A: **MVP Preferences only** — Basic settings (currency, timezone, language, default account, pagination) + 1 fixed profile. No color themes, no multi-profile. S003 scope only.
- B: **Medium scope** — Basic settings + UI settings (theme, compact) + notification settings. No color themes, no multi-profile.
- C: **Full port** — 9 sections as in legacy. High complexity, likely S003's biggest work package.
- D: **Defer D39 to S004** — remove from S003 scope, move to S004 where users have more context about what to customize.

**Recommendation:** Requires Nimrod decision. Recommend Option B for S003 + explicit S006 roadmap entry for color themes. Multi-profile is power-user feature that can wait for S005/S006.

---

### GAP-D39-02: Filter Defaults Architecture
**Severity: 🟠 HIGH**

**Context:**
Legacy stored default filter values per user (default status filter, default type filter, default date range).
This requires a dedicated `user_preferences` DB table with key/value pairs per user.
No Phoenix spec or model for this exists.

**Implications:**
- Without filter defaults, every page resets to the same defaults on reload
- Architecture must be decided: (a) user_preferences table, or (b) user_data columns, or (c) localStorage only

**Options:**
- A: `user_data.user_settings` JSON column on users table — simple, no separate table
- B: `user_data.user_preferences` key/value table — flexible, scalable
- C: **localStorage only** — no persistence across devices, no server cost

**Recommendation:** Option A for S003 (JSONB column on users table). Can evolve to Option B in S005.

---

## SECTION 5: S003 — D40 SYSTEM MANAGEMENT (PARTIAL)

### Overview
G7 directive adds background jobs section. But legacy had 9 full sections in system management.

---

### GAP-D40-01: 8 of 9 Legacy Sections Not Specced
**Severity: 🟡 MEDIUM — knowable gap, low urgency**

**Context:**
Legacy system management sections:
1. Server health dashboard (health checks, uptime, request stats)
2. Cache management (manual purge, cache hit rates, key stats)
3. Performance metrics (p50/p95/p99 response times, error rates)
4. External data (provider health, last sync times, error log)
5. Alerts overview (active alert count, trigger history) — can link to D34
6. Database stats (table sizes, connection pool, vacuum stats)
7. Background tasks ← **being built in G7 directive**
8. Operations (manual triggers, cleanup operations)
9. System settings (market data settings, data retention config)

**Phoenix already has:** Section 9 (market data settings) + Section 7 (being added).

**Implications:**
- D40 in Phoenix is currently just two sections (settings + background jobs)
- Admin needs: sections 1, 2, 6 at minimum to operate the system
- External data section (4) is critical for diagnosing data sync issues

**Options:**
- A: **Define D40 as progressive** — current scope = background jobs + market data settings. Add health/cache/DB sections as S004 admin enhancements.
- B: **Full D40 spec in S003** — all 9 sections specced and built.

**Recommendation:** Option A — background jobs + market data settings for S003. Add server health + DB stats in S004 (when system has real load to monitor). This is a good split.

---

## SECTION 6: S004 — D36 EXECUTIONS (FIELD MAP EXISTS, NO LOD200)

### Overview
Field map exists for basic CRUD. Legacy had a sophisticated execution-trade matching workflow that is not specced anywhere in Phoenix.

---

### GAP-D36-01: Trade-Execution Matching Workflow Not Specced
**Severity: 🔴 BLOCKING — before S004 can open, this must be specced**

**Context:**
This was the most complex business workflow in legacy executions:

**Step 1: Pending Assignment Queue** — `GET /api/executions/pending_assignment` returns all executions not linked to a trade. Shows "highlights" cards (pending count, total value, oldest date).

**Step 2: Trade Creation Clustering** — `GET /api/executions/pending_assignment/trade_creation_clusters` groups unassigned executions by ticker+account+side into natural trade clusters. Shows: symbol, account, side, execution count, quantity, total value, avg price, date range, actions.

**Step 3: Execution-to-Trade Suggestions** — `GET /api/executions/<id>/suggest_trades` returns existing open trades that the execution could be assigned to, based on ticker match + side match + not already assigned.

**Step 4: Batch Assign** — `POST /api/executions/batch_assign` assigns multiple executions to a trade in one call. Validates: ticker match, side match, not already assigned.

**Implications:**
- Without this workflow, executions are disconnected from trades (no P&L calculation possible)
- This workflow DEFINES how Phoenix's trading ledger works — FIFO vs LIFO vs specific assignment
- Needs a dedicated spec document before D36 can be built

**Options:**
- A: **Add execution-trade matching spec to D36 LOD200** — define the 4-step workflow explicitly.
- B: **Manual assignment only** — no auto-clustering or suggestions; user manually picks which trade each execution belongs to.
- C: **Auto-match by algorithm** — system automatically assigns executions to trades using FIFO rule; no user intervention. Simpler but less control.

**Recommendation:** Option A with Option B as the UI approach (user manually confirms clusters) + FIFO as the default algorithm. Clusters are informational, not automatic.

---

### GAP-D36-02: P&L Fields Not in Field Map
**Severity: 🔴 BLOCKING**

**Context:**
Legacy `execution.py` had `realized_pl` and `mtm_pl` (mark-to-market P&L) — both Integer fields, calculated externally.
Phoenix field map `WP_20_09_C_FIELD_MAP_EXECUTIONS.md` does NOT include P&L fields.

**Implications:**
- How is realized P&L calculated? On execution creation? On trade close? Via a background job?
- MTM P&L requires current price at time of evaluation
- Architecture choice: (a) calculated on execution, (b) calculated on trade close, (c) separate P&L table, (d) computed on read

**Options:**
- A: **Calculate on trade close** — execution.realized_pl is updated when trade is closed (FIFO P&L split)
- B: **Computed on read** — no stored P&L on execution; P&L computed from execution data + current price when needed
- C: **Separate P&L event table** — P&L calculation results stored separately (most auditable)

**Recommendation:** Option A for realized P&L (stored on trade close). Option B for MTM (no storage, compute live). This must be specced in D36 LOD200.

---

### GAP-D36-03: Execution Source and External ID Not in Field Map
**Severity: 🟠 HIGH**

**Context:**
Legacy had `source` (manual/IBKR-CSV/import) and `external_id` (for deduplication on import).
Phoenix field map has no source or external_id field.

**Implications:**
- Without `source` field: impossible to know which executions came from import vs manual entry
- Without `external_id`: duplicate imports (re-import same CSV) will create duplicate records
- Both fields are critical for D37 (data import) integration

**Options:**
- A: **Add both to field map** — `source ENUM(manual, import, api)` + `external_id VARCHAR(100) NULL UNIQUE`.

**Recommendation:** Add both. Non-negotiable for import functionality.

---

## SECTION 7: S004 — D37 DATA IMPORT (NO LOD200)

### Overview
CASH_FLOW_PARSER_SPEC exists for cash flows. But the full import workflow (3-step wizard, session management, conflict resolution) is not specced for executions import.

---

### GAP-D37-01: Import Workflow State Machine Not Specced
**Severity: 🔴 BLOCKING**

**Context:**
Legacy had a 3-step import wizard embedded in the executions page:
- **Step 1**: File upload + connector select (IBKR / Demo) + trading account select
- **Step 2**: Analysis results showing: missing tickers (need to be added to D22 first), existing records (already imported), duplicates detected
- **Step 3**: Preview table — each row is import/skip decision, user confirms, system executes

Import session model: session tracked in DB with status (pending/processing/completed/failed), resumable if interrupted.

**Implications:**
- Without the import workflow spec, D37 cannot be built
- The import session model must be defined (DB table, state transitions)
- Conflict resolution strategy must be defined (auto-skip duplicates? warn user? block?)

**Options:**
- A: **Full spec as in legacy** — 3-step wizard, session model, IBKR connector
- B: **MVP** — upload CSV → parse → show preview table → confirm import. No session persistence, no connector framework. Single-pass import.

**Recommendation:** Option B for S004 (MVP). Option A for S005 (full production import system). The session/resumable model is nice-to-have; file-to-preview-to-confirm is the core need.

---

### GAP-D37-02: Multi-Provider Connector Architecture
**Severity: 🟠 HIGH**

**Context:**
Legacy had a connector pattern: IBKR CSV parser, Demo connector. The architecture was provider-agnostic.
Phoenix will eventually support: IBKR, Schwab, TD Ameritrade, Interactive Brokers FIX, etc.

**Implications:**
- Provider architecture choice made in S004 constrains extensibility for S005/S006
- Each broker has different CSV formats, field names, date formats, account structures

**Options:**
- A: **Single parser (IBKR only)** + abstract `BaseConnector` interface for S004. Add more connectors in S005.
- B: **Plugin-based connector system** from day 1 — full abstraction layer.

**Recommendation:** Option A — IBKR first with an abstract base class. Proper connector framework in S005 when there are real users requesting specific brokers.

---

## SECTION 8: S005 — D24 TRADE PLANS (FIELD MAP EXISTS, NO LOD200)

---

### GAP-D24-01: PlanCondition System Not Specced
**Severity: 🟠 HIGH**

**Context:**
Legacy had `plan_conditions` table linked to `trading_methods` table:
- `condition_group` (for AND/OR grouping) — allows structured "if A and B, or if C" logic
- `parameters_json` — flexible condition parameters
- `auto_generate_alerts` — condition can auto-create alerts
- `ConditionAlertMapping` — explicit link between conditions and alerts

**Implications:**
- This is a sophisticated trading workflow feature — not a simple form field
- It creates a semantic bridge between trade plans and the alerts system
- If dropped: users cannot express structured entry/exit conditions in their plans
- If kept: requires dedicated condition builder UI (similar in complexity to alert condition builder)

**Options:**
- A: **Free-text conditions only** — `entry_conditions TEXT` (as in legacy base model). No structured system. Users write natural language.
- B: **Structured conditions** — full PlanCondition system. High complexity.
- C: **Hybrid** — free-text + "link to alert" (reference existing alerts as conditions). Medium complexity.

**Recommendation:** Option A for S005, Option B/C for S006. Free text covers 90% of user needs.

---

### GAP-D24-02: Alert Cancellation on Plan Status Change
**Severity: 🟠 HIGH**

**Context:**
Legacy: when a trade plan status changed to closed/cancelled, the system asked the user: "Do you want to cancel the linked alerts? (Yes/Cancel/Delete)". This was an interactive dialog.

**Implications:**
- Without this workflow: closing a plan leaves orphaned alerts active (alerts firing on a cancelled plan)
- This same pattern applies to D29 (trades) — closing a trade should handle its alerts
- The G7 directive partially addresses this for alerts, but does not spec the trade plan side

**Options:**
- A: **Auto-cancel linked alerts** on plan/trade cancellation (no dialog, configurable in preferences)
- B: **Interactive confirmation dialog** as in legacy
- C: **Soft warning only** — show count of linked alerts, user can navigate to D34 to manage them

**Recommendation:** Option A with user preference toggle (auto vs ask). Document in D24 LOD200 when written.

---

## SECTION 9: S005 — D25 AI ANALYSIS (NO LOD200)

---

### GAP-D25-01: No AI Analysis Spec Exists — Technology Decision Required
**Severity: 🔴 BLOCKING — before S005 GATE_0**

**Context:**
Legacy had a template-based AI system using Gemini/Perplexity. User stored their own API keys (encrypted).
Legacy had: AIPromptTemplate, AIAnalysisRequest, UserLLMProvider models.
Legacy AI analysis frontend page was a stub (spinners, no real data displayed in the UI).

**The legacy AI backend was more complete than the frontend** — full API existed but no polished UI.

**Key decisions needed:**
1. **Which LLM providers?** — Gemini/Perplexity (as in legacy) or OpenAI/Anthropic/other?
2. **API key management** — user provides their own keys (privacy-preserving) vs system-level API keys?
3. **Template system** — fixed templates in code vs admin-managed DB templates?
4. **Note linkage** — can an AI analysis be saved as a note? Or separate entity?

**Options for provider strategy:**
- A: **User-managed keys** (as in legacy) — privacy-preserving, no infra cost, UX friction
- B: **System-level keys** — seamless UX, infra cost, simpler for users
- C: **Hybrid** — system key as default, user can override with their own

**Recommendation:** Requires Nimrod decision. The template + history architecture from legacy is sound and should be preserved. Provider strategy is a business decision.

---

## SECTION 10: S005 — D29 TRADES (FIELD MAP EXISTS, NO LOD200)

---

### GAP-D29-01: Status Machine + Alert Cancellation Workflow Not Specced
**Severity: 🟠 HIGH** (same pattern as D24)

**Context:**
Legacy: closing a trade prompted: "Cancel linked alerts? Yes/No/Delete." Same need as trade plans.
Also: `Ticker.update_ticker_active_trades()` was called on every trade insert/update/delete — maintaining a denormalized `active_trades` boolean on the ticker.

**Implications:**
- Phoenix must decide: keep `active_trades` denormalization or compute on read?
- Alert workflow on trade close must be specced (same as D24-02)

**Options:**
- A: **Compute on read** — query trades table for active trades count. No denormalization.
- B: **Keep denormalized** — maintain `active_trades` boolean on ticker via service layer.

**Recommendation:** Option A — compute on read for S005. Add caching if performance demands it in S006.

---

## SECTION 11: S005 — D31 TRADE HISTORY (NO LOD200)

---

### GAP-D31-01: TradingView Multi-Series Chart — Most Complex Page
**Severity: 🔴 BLOCKING — before S005 work begins**

**Context:**
Legacy D31 had 7 overlaid data series on a single TradingView Lightweight Charts instance:
1. Candlestick (OHLCV from market data)
2. Position size (stepped line, left scale)
3. Position value (area series, right scale)
4. Average price line (dashed horizontal)
5. Realized P/L line (right scale)
6. Unrealized P/L line (right scale)
7. Total P/L line (right scale)

Plus: full crosshair tooltip showing all series values at cursor, legend with toggle checkboxes per series, zoom/pan controls, OHLC validation (null/NaN filtering before setData).

**Implications:**
- This is the highest-complexity frontend component in the entire system
- Requires: market data (OHLCV) + trades data + executions data + P&L calculations all aligned on same time axis
- TradingView Lightweight Charts v4 must be confirmed as the library (D31 confirmed this in legacy)
- P&L calculation approach must be finalized before chart can be built

**Options:**
- A: **Full multi-series chart** as in legacy — high fidelity, complex
- B: **MVP chart** — candlestick only + buy/sell markers at execution prices. No P&L overlay.
- C: **Single P&L chart** + separate candlestick (two separate charts on the page)

**Recommendation:** Option B for initial S005 build. Option A as enhancement. The candlestick + execution markers gives 80% of the value at 20% of the complexity.

---

## SECTION 12: S006 — D32 PORTFOLIO STATE (NO LOD200)

---

### GAP-D32-01: Historical Portfolio State Calculation
**Severity: 🟡 MEDIUM — S006, plenty of time**

**Context:**
Legacy D32 had:
- Portfolio summary (cash, positions value, total P/L) by date
- Multiple account rollup
- TradingView chart with period selectors (week/month/3months/year/all)
- Date comparison: pick up to 4 dates and compare portfolio state on each

**Implications:**
- Requires point-in-time portfolio calculation (what was my portfolio worth on date X?)
- Needs: historical execution data + historical prices (250-day retention covers ~1 year)
- Date comparison requires OHLCV at specific historical dates

**Options:**
- A: **Live computation** — calculate portfolio state on-the-fly from trades + prices for any date
- B: **Periodic snapshot** — store daily portfolio state snapshots (denormalized)
- C: **Within price retention window only** — portfolio history available for last 250 days only

**Recommendation:** Option A with Option C constraint initially. Full history with snapshots as a S007+ roadmap item.

---

## SECTION 13: CROSS-CUTTING GAPS

### GAP-CROSS-01: Background Tasks Page Inconsistency
**Severity: 🟡 MEDIUM**

Legacy system_management.html had a dedicated "Section 7" for background tasks with enable/disable toggles, execution history, analytics by period.

Phoenix background tasks from G7 directive will be added to `system_management.html` as a new section.

The legacy background tasks API had 9 endpoints (GET tasks, POST execute, POST toggle, GET history, GET analytics). The G7 directive specifies `admin_data.job_run_log` + admin endpoints but has not yet fully mapped to the legacy 9-endpoint API surface.

**Gap:** The G7 directive defines the job_run_log table but doesn't specify the full admin endpoint surface (the full 9 endpoints of the legacy API). Team 10 will need to decide how many of these 9 endpoints to implement.

**Recommendation:** Add endpoint surface definition to G7 directive supplement, or create a note in the directive referencing the 9 legacy endpoints as the reference spec.

---

### GAP-CROSS-02: Notifications Center vs. Notification Bell
**Severity: 🟠 HIGH — architecture decision needed**

**Context:**
Legacy had a full page (`notifications_center.html`) for managing the UI notification/toast system (mode testing, category management, history log, WebSocket status).

Phoenix G7 directive creates a `user_data.notifications` table + bell widget for alert-triggered in-app notifications.

These are TWO DIFFERENT NOTIFICATION SYSTEMS:
1. **UI Toast System** (legacy notifications_center) — ephemeral UI feedback (success/error/warning toasts)
2. **Alert Notifications** (Phoenix G7 directive) — persistent, stored in DB, triggered by alert conditions

**Implications:**
- D40 (System Management) needs a section for monitoring the toast system (mode, statistics)
- Is there a plan for a dedicated notifications page equivalent to legacy's `/notifications_center`?
- The bell widget is for alert notifications — but users may also want a full notification inbox page

**Options:**
- A: **Bell widget only** (G7 directive as specced) — no full notifications page
- B: **Bell widget + Notification inbox page** — D15.I (home dashboard) could have an inbox section
- C: **Add notifications page as a new page** (D42?) — dedicated notification inbox and history

**Recommendation:** Bell widget for S003 (as specced in G7). Notification inbox page consideration for S004. Decision needed before S003 D40 spec is written.

---

### GAP-CROSS-03: Quill Rich Text Editor Usage
**Severity: 🟡 MEDIUM**

**Context:**
Legacy loaded Quill rich text CSS in `trades.html`. This suggests trade notes supported rich text (bold, bullets, links) not just plain text.

Phoenix notes system (D35) uses plain TEXT fields. No rich text spec exists.

**Implications:**
- If trade notes (D29) or trade plan notes (D24) get Quill, consistency with D35 notes is broken
- Or D35 notes should also support rich text (not currently specced)

**Options:**
- A: **Plain text everywhere** — consistent, no Quill dependency
- B: **Quill for trade/plan notes** — legacy parity
- C: **Markdown support** — middle ground (no Quill, but render markdown in display mode)

**Recommendation:** Option A for S003-S004. Option C (markdown) as a possible S005 enhancement for D29/D24.

---

## SUMMARY DECISION TABLE

| # | Gap | Page | Stage | Severity | Decision Needed |
|---|---|---|---|---|---|
| D38-01 | Tag categories removed | D38 | S003 | 🔴 | Keep flat OR add nullable category_id now? |
| D38-02 | Tag assignment missing — which stage? | D38 | S003 | 🔴 | Add roadmap entry for which stage gets tag assignment |
| D38-03 | No search endpoint | D38 | S003 | 🟢 | Add query param to list endpoint? |
| D38-04 | No usage tracking fields | D38 | S003 | 🟡 | Add usage_count + last_used_at columns now? |
| D26-01 | No flag column | D26 | S003 | 🟢 | Add is_flagged to watch_list_items? |
| D26-02 | ATR/P&L/Position deferred | D26 | S003 | 🟡 | Document as explicit Phase 2 |
| D26-03 | No view modes | D26 | S003 | 🟡 | Table only OR table+cards? |
| D26-04 | External tickers | D26 | S003 | 🟡 | Accept D22 dependency OR free-text field? |
| D33-01 | name_custom + type_custom missing | D33 | S003 | 🟠 | Add to M-001 migration? |
| D39-01 | No preferences spec | D39 | S003 | 🔴 | MVP basic settings OR full port OR defer to S004? |
| D39-02 | Filter defaults architecture | D39 | S003 | 🟠 | JSONB column OR key/value table OR localStorage? |
| D40-01 | 8 of 9 system mgmt sections unspecced | D40 | S003 | 🟡 | Progressive OR full spec? |
| D36-01 | Trade-execution matching unspecced | D36 | S004 | 🔴 | Cluster workflow OR manual only? |
| D36-02 | P&L fields missing from field map | D36 | S004 | 🔴 | On-close OR computed on read? |
| D36-03 | source + external_id not in field map | D36 | S004 | 🟠 | Add both fields? |
| D37-01 | Import workflow state machine unspecced | D37 | S004 | 🔴 | MVP wizard OR full session system? |
| D37-02 | Multi-provider connector architecture | D37 | S004 | 🟠 | Single (IBKR) + base class OR plugin system? |
| D24-01 | PlanCondition system unspecced | D24 | S005 | 🟠 | Free text OR structured conditions? |
| D24-02 | Alert cancellation on plan close | D24 | S005 | 🟠 | Auto-cancel OR dialog? |
| D25-01 | No AI analysis spec | D25 | S005 | 🔴 | User keys OR system keys? Which providers? |
| D29-01 | Trade status machine + alerts unspecced | D29 | S005 | 🟠 | Auto-cancel OR dialog? |
| D31-01 | TradingView multi-series chart | D31 | S005 | 🔴 | Full 7-series OR MVP (candlestick+markers)? |
| D32-01 | Historical portfolio state calculation | D32 | S006 | 🟡 | Live OR snapshot? |
| CROSS-01 | Background tasks endpoint surface | D40 | S003 | 🟡 | Define endpoint count for G7 directive |
| CROSS-02 | Notifications center vs bell | D40/new | S003 | 🟠 | Bell only OR add notifications inbox page? |
| CROSS-03 | Rich text vs plain text | D29/D24/D35 | S005 | 🟡 | Plain text OR Markdown OR Quill? |

**Total: 26 gaps across 11 pages and 4 stages.**

---

**Priority 1 (must decide NOW — affects S003-P03 LOD200 that is already going through gate cycle):**
- D38-01 (categories), D38-02 (assignment stage), D26-01 (flag), D26-03 (view modes), D26-04 (external tickers)

**Priority 2 (must decide before S003 GATE_0):**
- D33-01 (name_custom), D39-01 (preferences scope), D39-02 (filter defaults arch)

**Priority 3 (must decide before S004 GATE_0):**
- D36-01 (execution-trade matching), D36-02 (P&L), D36-03 (source/external_id), D37-01 (import workflow), D37-02 (connector architecture)

**Priority 4 (must decide before S005 GATE_0):**
- D24-01, D24-02, D25-01, D29-01, D31-01

---

*log_entry | TEAM_00 | LEGACY_GAP_ANALYSIS | DRAFT | 2026-03-02*
