# Team 10 | Canonical Validation Prompt — Plans & Documents

**project_domain:** TIKTRACK  
**id:** TEAM_10_CANONICAL_VALIDATION_PROMPT  
**owner:** Team 10 (The Gateway)  
**date:** 2026-03-11  
**context:** S002-P002-WP003 — לאחר סגירת החלטות ונעילת אפיון

---

## Correction Cycle (TEAM_190 / TEAM_00)

| Field | Value |
|-------|-------|
| correction_cycle_ref | TEAM_190_PLAN_REVALIDATION_RESULT (BF-01) |
| what_changed | תאריך 2025-01-30→2026-03-11 |

---

## מטרה

פרומט קאנוני לולידציה שכל התוכניות והמסמכים **מלאים** ו**מכוילים** לאפיון הנעול.  
הפעל על מסמכי התוכנית שלך, על ה־LOD400, ועל כל artifact שמתיימר ליישם את WP003.

---

## פרומט קאנוני (Copy-Paste)

```
## Canonical Validation — WP003 Plans & Documents

You are validating that implementation plans and documents are **complete** and **aligned** with the locked WP003 specification.

### MANDATORY INPUTS (provide paths or contents)
1. Paths to your plan/implementation docs
2. Path to LOD400 (if exists)
3. Path to any team-specific spec

### REFERENCE SPECS (read these first)
- `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_S002_P002_WP003_DECISIONS_LOCK_v1.0.0.md` — 3 locked decisions
- `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_S002_P002_WP003_GATE7_SPEC_RESPONSE_v1.0.0.md` — full spec
- `_COMMUNICATION/team_10/TEAM_10_NIMROD_S002_P002_WP003_G7_PRELIMINARY_FEEDBACK_v1.0.0.md` — 14 findings source

### VALIDATION CHECKLIST — Answer YES/NO for each

#### [A] Hover-only Menu
- [ ] Hover-in delay 150ms
- [ ] Exit delay 100ms
- [ ] Gap row↔panel 0px (no margin-top)
- [ ] Trigger zone = full <tr>
- [ ] Keep-open zone = row OR panel
- [ ] Close triggers: exit+100ms / Escape / action click / click outside
- [ ] Nested logic: `row.matches(':hover') || panel.matches(':hover')`

#### [B] Inline Expand
- [ ] Label: "▼ היסטוריה (N)"
- [ ] 5 runs inline (no modal for history)
- [ ] Columns: תאריך/שעה | סטטוס | משך (ms) | רשומות | שגיאות
- [ ] Log Viewer NOT in WP003 — deferred to D40 (S003-P003)

#### [C] Heat Indicator
- [ ] Formula: `load_pct = active_tickers / max_active_tickers × 100`
- [ ] Green <50%, Yellow 50–79%, Red ≥80%

#### Bugs / Fixes
- [ ] TASE agorot (.TA): divide by 100
- [ ] UI fields: off_hours_interval_minutes, alpha_quota_cooldown_hours present
- [ ] Defaults: max_symbols_per_request=50, delay_between_symbols_seconds=1

#### Coverage
- [ ] All 14 G7 findings addressed in plan/docs
- [ ] SPY in verification scripts and test checks
- [ ] Traffic light null → "אין נתונים"
- [ ] Summary filter-aware (source-aware)
- [ ] Modal skeleton loading
- [ ] Status legend
- [ ] Refresh buttons

#### Dependencies
- [ ] Team 60: ticker_prices populated — CLOSED (RE_VERIFY PASS)

### OUTPUT
1. **Compliance table:** Item | In plan? | In LOD400? | Status
2. **Gaps:** List any missing items or mismatches
3. **Verdict:** VALID / GAPS — if GAPS, list corrective actions
```

---

## שימוש

1. פתח את הפרומט לעיל.
2. הזן את נתיבי המסמכים והתוכניות שלך.
3. הרץ ולידציה (באמצעות agent או ידנית).
4. תקן gaps לפי הוורדיקט.

---

**log_entry | TEAM_10 | CANONICAL_VALIDATION_PROMPT | CREATED | 2026-03-11**
