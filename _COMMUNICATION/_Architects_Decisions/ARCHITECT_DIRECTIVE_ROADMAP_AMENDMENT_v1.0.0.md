# ARCHITECT DIRECTIVE — Roadmap Amendment
## PHOENIX_PORTFOLIO_ROADMAP_v1.0.0 — Five Amendments

**id:** `ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v1.0.0`
**from:** Team 00 — Chief Architect
**to:** Team 170 (Documentation & Canonicalization)
**cc:** Team 100 (Program Authority), Team 10 (Implementation)
**date:** 2026-03-02
**authority:** Team 00 constitutional authority — Nimrod-approved 2026-03-02
**status:** LOCKED — ACTION REQUIRED
**target_document:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`

---

## 0. PURPOSE

This directive instructs Team 170 to apply five Nimrod-approved amendments to the canonical roadmap document. These amendments correct the stage assignments of existing pages, add new work packages, and attach architectural constraints that were not captured at roadmap creation time.

All five amendments were reviewed and approved by Nimrod on 2026-03-02. They are effective immediately.

Team 170 must:
1. Apply every amendment to `PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` exactly as specified.
2. Issue a WSM note in `PHOENIX_MASTER_WSM_v1.0.0.md` recording the amendment under the current operational state log.
3. Not modify any other governance document unless explicitly instructed.
4. Append a log entry to the roadmap on completion.

---

## 1. AMENDMENT SUMMARY TABLE

| # | Page / Item | Type | Before | After |
|---|---|---|---|---|
| A1 | D38 tag_management | Stage reassignment | S003 | S005 |
| A2 | D26-Phase2 watch_lists enhancement | New work package | — | S005 (trigger: D29 GATE_8 PASS) |
| A3 | D32 portfolio_state | Spec-first constraint | no constraint | Requires dedicated arch spec before S006 GATE_0 |
| A4 | D37 data_import | Scope clarification | single import mode | Dual mode: cash_flows + executions; IBKR + IBI; BaseConnector; file archiving |
| A5 | Tag assignment (inline) | Stage note (S004+) | not documented | Inline tag assignment built alongside each entity page from S004 onward |

---

## 2. AMENDMENT DETAIL

---

### AMENDMENT 1 — D38 tag_management: S003 → S005

**Applies to:** Page table row for D38 (row 26 in current roadmap), Stage details table (S003 row), and narrative section for שלב 3.

**Current state (before):**
- D38 stage_id = S003
- S003 pages list includes D38
- S003 narrative includes "TAG_MANAGEMENT"

**Required state (after):**
- D38 stage_id = S005
- Remove D38 from S003 pages list
- Add D38 to S005 pages list
- Remove "TAG_MANAGEMENT" reference from S003 narrative
- Add D38 reference to S005 narrative

**Reason (canonical, do not paraphrase):**
Tag management as a registry page is only useful when entities exist to tag. In S003, no taggable entities (trades, executions, plans, user_tickers in their full form) yet exist. Moving D38 to S005 means the tag registry page is built at the same time inline tag assignment is rolled out across entity pages. D38 is a UX enhancement, not a foundational dependency for any S003 page.

---

### AMENDMENT 2 — D26-Phase2: New Work Package in S005

**Applies to:** Stage details table (S005 row) and S005 narrative section.

**Current state (before):**
- D26 appears only in S003 (initial watch_lists page)
- S005 has no reference to D26 enhancement

**Required state (after):**
Add a new entry to the roadmap for D26-Phase2 as a distinct work package within S005.

**D26-Phase2 specification:**

| Field | Value |
|---|---|
| id | D26-Phase2 |
| name | watch_lists — Phase 2 Enhancement |
| stage_id | S005 |
| trigger_condition | D29 (trades) GATE_8 PASS |
| type | Enhancement WP (no new route, no new page) |

**Scope of D26-Phase2 (columns to add to the watch_lists table):**

| Column | Source |
|---|---|
| Position | Current trade position size, derived from trades data |
| P/L% | Unrealized P/L percentage from open trades |
| P/L | Unrealized P/L absolute value from open trades |
| ATR(14) | 14-period Average True Range — available only when indicators infrastructure is ready |
| Flag color filter | Enhanced filter: filter watch_list rows by specific flag_color value |

**Architectural constraints:**
- D26-Phase2 does NOT change D26 page routing or URL structure.
- D26-Phase2 does NOT introduce a new page identifier.
- D26-Phase2 is an enhancement work package only; it extends the existing D26 page.
- ATR(14) column is conditional on indicators infrastructure; it must be flagged as deferred-within-phase if indicators are not yet available at the time D26-Phase2 is implemented.

**Add to S005 narrative:** "D26-Phase2 (watch_lists enhancement): triggered by D29 GATE_8 PASS. Adds position, P/L, P/L%, ATR(14), and enhanced flag-color filtering to the existing watch_lists page."

---

### AMENDMENT 3 — D32 portfolio_state: Spec-First Constraint

**Applies to:** Page table row for D32, S006 narrative section, and any prerequisites section of the roadmap.

**Current state (before):**
- D32 is listed under S006 with no additional constraints
- No pre-condition on architectural spec

**Required state (after):**
Add the following constraint note to D32's entry and to the S006 section:

**Constraint (canonical, apply verbatim as a note in the roadmap):**

> D32 (portfolio_state) requires a dedicated architectural spec, reviewed and approved by Nimrod, before S006 GATE_0 opens. This spec must define: daily_portfolio_snapshots background job, snapshot table schema, backfill strategy, data retention policy, and chart granularity rules per time range (e.g., daily granularity for 1-year view, weekly for 5-year, monthly for 10+ years). The spec must be written and approved before any implementation of D32 begins.

**Reason:** Portfolio history must support unlimited time ranges (10, 20, 30 years possible). This cannot be solved at implementation time without pre-designed schema and retention decisions. A spec-first gate prevents costly re-architecture.

---

### AMENDMENT 4 — D37 data_import: Scope Clarification

**Applies to:** Page table row for D37, Stage details table (S004 row), and S004 narrative section.

**Current state (before):**
- D37 described as: "ייבוא נתונים" (data import) with no detail on import modes or connectors

**Required state (after):**
Update D37 description and add the following scope note to S004 narrative:

**D37 canonical scope (apply to roadmap):**

| Field | Value |
|---|---|
| id | D37 |
| name | data_import |
| Import modes | DUAL: user selects mode on entry — (1) cash_flows import, (2) executions import |
| Primary connector | IBKR (Interactive Brokers) |
| Second connector | IBI (second broker connector) |
| Architecture requirement | BaseConnector abstract class required; each connector implements the base interface |
| File handling | Uploaded file must be archived (saved to storage); audit log entry created per import session |

**Add to S004 narrative:** "D37 (data_import) handles dual import modes: cash_flows and executions. User selects mode at entry. Connectors: IBKR (primary), IBI (second). Requires BaseConnector abstract class. Every upload is archived and audit-logged."

---

### AMENDMENT 5 — Inline Tag Assignment: Stage Note (S004 onward)

**Applies to:** S004 narrative section, S005 narrative section, and the roadmap prerequisites or general notes section.

**Current state (before):**
- No documentation of inline tag assignment rollout across entity pages
- D38 (tag registry) was the only tag-related entry

**Required state (after):**
Add the following note to the roadmap (in the narrative section, under a "Tag Assignment Rollout" heading or as a general note):

**Note (apply verbatim):**

> Inline tag assignment is built alongside each entity page from S004 onward. Every entity page that supports tags must include tag assignment UI at the time it is built — not retrofitted later. Entity types requiring tag support: user_ticker, alert, trade, trade_plan, execution, cash_flow. The D38 page (tag registry management, S005) is the administrative interface for the tag registry itself; inline assignment on entity pages is a separate concern and is built incrementally per stage.

---

## 3. TEAM 170 ACTION CHECKLIST

Team 170 must complete all of the following:

- [ ] Apply A1: Reassign D38 from S003 to S005 in all three locations (page table, stage details table, narrative)
- [ ] Apply A2: Add D26-Phase2 entry to S005 in stage details table and S005 narrative
- [ ] Apply A3: Add spec-first constraint note to D32 entry and S006 narrative
- [ ] Apply A4: Update D37 description and S004 narrative with dual-mode scope
- [ ] Apply A5: Add inline tag assignment rollout note to narrative section
- [ ] Issue WSM note in `PHOENIX_MASTER_WSM_v1.0.0.md` recording: "ROADMAP AMENDED — 5 amendments applied per ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v1.0.0 (2026-03-02, Nimrod-approved)"
- [ ] Append log entry to `PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`: `log_entry | TEAM_170 | ROADMAP_AMENDED | 5_AMENDMENTS_PER_DIRECTIVE_v1.0.0 | 2026-03-02`

---

## 4. WHAT TEAM 170 MUST NOT DO

- Do not change any page identifier (D-numbers are frozen).
- Do not change D26 routing, URL, or page structure — D26-Phase2 is an enhancement only.
- Do not rename stages or alter stage_ids.
- Do not modify WSM operational state fields (current_gate, active_stage, etc.) — only append a log note.
- Do not modify any other team's communication folder.
- Do not interpret or expand scope beyond what is written in this directive.

---

## 5. AUTHORITY AND SIGN-OFF

This directive is issued under Team 00 constitutional authority as Chief Architect.
All five amendments were reviewed and explicitly approved by Nimrod on 2026-03-02.
This directive is locked. No amendment may be altered without a new versioned directive from Team 00.

Questions or blockers: route to Team 00 inbox at `_COMMUNICATION/_ARCHITECT_INBOX/`.

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT | v1.0.0_ISSUED | 2026-03-02**
