# ARCHITECT DIRECTIVE — SSOT Corrections
## Five Cross-Document Consistency Fixes

```
id:             ARCHITECT_DIRECTIVE_SSOT_CORRECTIONS_v1.0.0
from:           Team 00 — Chief Architect
to:             Team 170 — Documentation & Governance
cc:             Team 100 (awareness), Team 10 (awareness)
date:           2026-03-03
authority:      Team 00 constitutional authority — Nimrod-approved 2026-03-03
status:         LOCKED — ACTION REQUIRED
```

---

## PURPOSE

Five consistency errors have been identified across the canonical governance documents. All five were approved for correction by Nimrod on 2026-03-03. Team 170 must apply all five corrections and issue a WSM log entry on completion.

---

## CORRECTION 1 — Remove 'general' from notes parent_type

**Severity: 🔴 CRITICAL — Conflicts with locked Iron Rule**

**Source of error:**
- `documentation/docs-system/08-PRODUCT/LEGACY_TO_PHOENIX_MAPPING_V2.5.md`
  - Section: `user_data.notes` polymorphic parent types
  - Current text lists: `trade, trade_plan, ticker, account, general`
- `documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md`
  - Any reference listing `general` as valid `parent_type` for notes

**Required correction (both files):**

Remove `general` from the list of valid parent_type values. Replace with the locked canonical list:

```
Valid parent_type values (canonical — Nimrod-locked 2026-03-02):
  ticker | user_ticker | alert | trade | trade_plan | account | datetime
```

Add a note in both files:
```
Note: 'general' parent_type was deprecated per ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0
and locked as invalid per Team 00 Iron Rule (2026-03-02).
```

---

## CORRECTION 2 — Fix S003 Narrative in Roadmap

**Severity: 🟠 HIGH — Misleading narrative creates confusion**

**Source of error:**
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`
  - S003 narrative section currently mentions "ALERTS & NOTES"
  - D34 (Alerts) and D35 (Notes) are S001 pages, NOT S003

**Required correction:**

In the S003 narrative section, remove all references to "ALERTS & NOTES" and D34/D35.

Replace with the correct S003 page set:
```
S003 pages: D33 (user_tickers), D39 (preferences), D40 (system_management), D26 (watch_lists)
Note: D38 (tag_management) was in S003 but relocated to S005 per Amendment A1 (2026-03-02).
```

---

## CORRECTION 3 — Add D26-Phase2 to SSOT_MASTER_LIST

**Severity: 🟠 HIGH — Gap between roadmap and SSOT**

**Source of error:**
- `documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md`
  - D26-Phase2 does not appear anywhere in this document
  - It WAS added to the roadmap as row 26.1 (S005) per Roadmap Amendment A2 (2026-03-02)

**Required correction:**

Add D26-Phase2 to the SSOT_MASTER_LIST under the S005 section:

```
ID:       D26-Phase2
Name:     watch_lists — Phase 2 Enhancement
Stage:    S005
Type:     Enhancement WP (not a new page — extends D26)
Trigger:  D29 (trades) GATE_8 PASS
Scope:    ATR(14), Position, P/L%, P/L columns + flag-color filter enhancement
Note:     Added per ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v1.0.0 (2026-03-02, Nimrod-approved)
```

---

## CORRECTION 4 — Add Stage Note to D38 Entry in SSOT

**Severity: 🟡 MEDIUM — Navigation gap**

**Source of error:**
- `documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md`
  - D38 (tag_management) has no inline stage reference — relies entirely on roadmap cross-reference
  - Without the note, future readers cannot determine D38's stage from the SSOT alone

**Required correction:**

Add to D38's entry in SSOT_MASTER_LIST:
```
Stage: S005
Note: Originally S003. Relocated to S005 per ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v1.0.0
      Amendment A1 (2026-03-02, Nimrod-approved). Rationale: tag registry is only useful
      when taggable entities exist (D29, D30, D36 — available from S005).
```

---

## CORRECTION 5 — Fix Document Path References in MEMORY.md

**Severity: 🟢 LOW — Navigation only**

**Source of error:**
- `MEMORY.md` (Team 00 auto-memory) references these files under `01-FOUNDATIONS/` which is incorrect:
  - `TT2_PAGES_SSOT_MASTER_LIST.md` → actual path: `documentation/docs-system/01-ARCHITECTURE/`
  - `LEGACY_TO_PHOENIX_MAPPING_V2.5.md` → actual path: `documentation/docs-system/08-PRODUCT/`

**Required correction:**

Team 170 does NOT modify MEMORY.md (that is Team 00's working document).

Instead, Team 170 must verify that no canonical governance document incorrectly references the paths above, and add a routing note to the SSOT_MASTER_LIST document header:

```
Canonical location: documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md
Cross-reference: PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md governs stage assignments
```

**Team 00** will correct MEMORY.md separately.

---

## TEAM 170 ACTION CHECKLIST

- [ ] C1: Remove 'general' from `user_data.notes` parent_type in LEGACY_MAPPING_V2.5 — add deprecation note
- [ ] C1: Remove 'general' from any notes parent_type reference in TT2_PAGES_SSOT — add deprecation note
- [ ] C2: Fix S003 narrative in ROADMAP — remove D34/D35 references, add correct D33/D39/D40/D26 list
- [ ] C3: Add D26-Phase2 entry to TT2_PAGES_SSOT_MASTER_LIST under S005
- [ ] C4: Add stage note + relocation note to D38 entry in TT2_PAGES_SSOT_MASTER_LIST
- [ ] C5: Add canonical location header note to TT2_PAGES_SSOT_MASTER_LIST
- [ ] WSM: Append log entry to PHOENIX_MASTER_WSM_v1.0.0.md:
       `SSOT_CORRECTIONS_APPLIED — 5 corrections per ARCHITECT_DIRECTIVE_SSOT_CORRECTIONS_v1.0.0 | 2026-03-03`
- [ ] Log entry: Append to corrected documents:
       `log_entry | TEAM_170 | SSOT_CORRECTIONS | per_ARCHITECT_DIRECTIVE_SSOT_CORRECTIONS_v1.0.0 | 2026-03-03`

---

## WHAT TEAM 170 MUST NOT DO

- Do not change page identifiers (D-numbers are frozen)
- Do not alter stage IDs or stage names
- Do not modify any team communication folders
- Do not interpret scope beyond what is written here
- Do not modify MEMORY.md (Team 00 working document)

---

*log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_SSOT_CORRECTIONS | v1.0.0_ISSUED | 2026-03-03*
