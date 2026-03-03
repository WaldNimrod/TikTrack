# ARCHITECT DIRECTIVE — Roadmap Amendment v2
## Three Additional Amendments: Indicators WP + D40 + D41

```
id:             ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v2.0.0
from:           Team 00 — Chief Architect
to:             Team 170 (Documentation & Canonicalization)
cc:             Team 100 (Program Authority), Team 10 (Implementation)
date:           2026-03-03
authority:      Team 00 constitutional authority — Nimrod-approved 2026-03-03
status:         LOCKED — ACTION REQUIRED
target_document: documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md
predecessor:    ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v1.0.0 (2026-03-02, 5 amendments applied)
```

---

## 0. PURPOSE

This directive adds three new amendments to the canonical roadmap, following architectural decisions made on 2026-03-03. All three amendments were reviewed and approved by Nimrod.

Team 170 must:
1. Apply all three amendments to `PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`
2. Update `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` with the new programs
3. Issue a WSM log note on completion

---

## AMENDMENT B1 — Add Indicators Infrastructure Program (end of S004)

**Type:** New program addition
**Stage:** S004 (at end of stage, after D29 Trades)

### Rationale

Multiple S005 pages have hard dependencies on computed indicators (ATR, MA, CCI):
- D26-Phase2: ATR(14) column in watch list
- D28: Ticker Dashboard indicator panel
- D25: AI Analysis needs indicator values as input
- D31: Trade History chart — MA overlay series

Without a dedicated indicators infrastructure program, these pages cannot be built.
Current status: `market_data.ticker_indicators` table marked as "future" — no WP exists.

### Program Definition

```
program_id:     S004-PXXX (assign next sequential ID in S004)
program_name:   Indicators Infrastructure
domain:         TIKTRACK
stage_id:       S004
position:       LAST in S004 — after D29 (trades) and all other S004 programs
status:         PLANNED
```

### Deliverables (add to program entry)

```
1. market_data.ticker_indicators table
   - schema: ticker_id, indicator_name, period, value NUMERIC(20,8),
             calculated_at TIMESTAMP, price_date DATE
   - indexes: (ticker_id, indicator_name, period, price_date DESC)

2. indicator_computation_service.py
   - Indicators: ATR(14), MA(20/50/150/200), CCI(20)
   - Architecture: extensible (new indicators added without schema change)
   - Source data: market_data.ticker_prices (daily OHLCV)
   - Precision: NUMERIC(20,8) — Iron Rule

3. Background job: nightly_indicators_calculation
   - Registered in scheduler_registry.py (Iron Rule)
   - Runs after nightly EOD price sync
   - Calculates all active tickers, all configured indicators
   - Writes to ticker_indicators table (UPSERT)

4. API endpoint: GET /api/v1/tickers/{id}/indicators
   - Query params: period (1m/3m/6m/1y/all), indicators (comma-separated)
   - Returns: {indicator_name, period, values: [{date, value}]}
   - Admin-accessible for all tickers; user-accessible for their tickers only
```

### Prerequisite for

The following programs may NOT begin LOD200 production until S004-PXXX (Indicators) is specced and approved:
- D26-Phase2 (ATR column)
- D28 Ticker Dashboard
- D25 AI Analysis
- D31 Trade History (MA overlay)

**Add to roadmap note for D26-Phase2, D28, D25, D31:**
```
Prerequisites: S004-PXXX (Indicators Infrastructure) GATE_8 PASS
```

---

## AMENDMENT B2 — D40 System Management: Scope Update

**Type:** Scope clarification for existing page
**Stage:** S003 (D40 already in S003 — no stage change)

### Current state in roadmap

D40 is listed with minimal description: "System Management (D40)".

### Updated scope definition

Update D40 description in the roadmap page table and S003 narrative:

```
ID:    D40
Name:  system_management — Admin Control Panel
Stage: S003
Type:  Admin-only page (requires admin role)

Sections:
  1. SYSTEM OVERVIEW — always-visible summary container (top of page)
     - Market status | DB status | background jobs health | active tickers count | pending tickers count
  2. MARKET DATA SETTINGS — existing (migrated from current system_management.html)
     - max_active_tickers, intraday_interval, cooldown, max_symbols, delay, intraday_enabled
  3. BACKGROUND TASKS — from current WP (APScheduler job list, manual trigger, run history)
  4. ALERT SYSTEM MONITOR
     - Evaluation engine status (last run, next run), active alerts count, triggered_unread count
  5. NOTIFICATIONS MONITOR (future — placeholder)
  6. AUDIT LOG — last 50 admin actions
  7. FEATURE FLAGS / CODE FLAGS
     - maintenance_mode (On/Off), feature toggles, build version (read-only), SMTP status (S005)
```

### What is NOT in D40

Per Nimrod decision (2026-03-03):
- ❌ Watch-list flag monitor → does NOT belong here
- ❌ Ticker catalog management → belongs in D22 (expand existing page)
- ❌ User management → recommend separate D41 page (see Amendment B3)

---

## AMENDMENT B3 — Add D41 User Management (Recommended New Page)

**Type:** New page addition
**Stage:** S003 (alongside D40)
**Recommendation:** This is a strong architectural recommendation — Nimrod approved evaluating D41 as a separate page.

### Rationale

User management (user list, status, role assignment) is a substantial admin workflow.
Including it in D40 would make D40 excessively complex.
A dedicated D41 page follows the single-responsibility principle.

### Page Definition

```
ID:    D41
Name:  user_management — Admin User Control
Stage: S003 (companion to D40)
Type:  Admin-only page

Features:
  - User list: UUID | email | role | status | created_at
  - Filters: active / inactive / admin
  - Actions per user: Activate | Deactivate | Change Role (user→admin with confirmation)
  - Role change requires admin confirmation dialog
  - No user creation (users self-register — or future admin invite flow)
```

**Note:** If D41 scope is determined to be too small for a standalone page, it may be implemented as a `<tt-section>` within D40. This determination is made at LOD200 for S003-P003.

**Add to SSOT_MASTER_LIST:** D41 as a new entry under Management section, Stage S003.
**Add to Program Registry:** S003-P003 scope now includes D39 + D40 + D41 (if standalone).

---

## TEAM 170 ACTION CHECKLIST

- [ ] B1: Add S004-PXXX (Indicators Infrastructure) to ROADMAP stage details table (S004 row, at end)
- [ ] B1: Add S004-PXXX to PROGRAM_REGISTRY with deliverables as specified
- [ ] B1: Add prerequisite note to D26-Phase2, D28, D25, D31 entries
- [ ] B2: Update D40 description in ROADMAP page table and S003 narrative
- [ ] B3: Add D41 as new ROADMAP page entry (S003) and SSOT_MASTER_LIST entry
- [ ] B3: Update S003-P003 in PROGRAM_REGISTRY to reflect D39 + D40 + D41 scope
- [ ] WSM: Append log entry:
       `ROADMAP_AMENDED_v2 — 3 amendments per ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v2.0.0 | 2026-03-03`
- [ ] Log entries: append to modified documents

---

## WHAT TEAM 170 MUST NOT DO

- Do not change existing D-number assignments
- Do not alter stage IDs or stage names
- Do not assign a specific program_id to S004-PXXX — leave as placeholder; Team 190 assigns at GATE_0

---

*log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v2 | v2.0.0_ISSUED | 2026-03-03*
