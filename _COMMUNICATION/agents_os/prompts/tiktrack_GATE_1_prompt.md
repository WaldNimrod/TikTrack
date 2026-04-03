date: 2026-03-25
historical_record: true

⛔ **OPERATOR-ONLY — DO NOT TOUCH PIPELINE CLI**

⛔ DO NOT run `./pipeline_run.sh` or any pipeline CLI command.
⛔ DO NOT advance the gate or modify pipeline state.
✅ Save your artifact to the canonical path below.
✅ Notify Nimrod. Nimrod runs all pipeline commands.

---

# Mandates — S003-P004-WP001  ·  GATE_1

**Spec:** S003-P004 D33 User Tickers (My Tickers page) — personal watchlist, live prices, display_name Iron Rule (never show raw symbol), filtering/sorting/pagination. LOD200: _COMMUNICATION/team_100/TEAM_100_S003_P004_WP001_LOD200_v1.0.0.md

**Canonical date:** Use `date -u +%F` for today; replace {{date}} in identity headers.

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  Team 170   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             💻  Phase 1 done?  →  ./pipeline_run.sh --domain tiktrack phase2
             📄 Team 190 reads coordination data from Team 170

  Phase 2:  Team 190   ← runs alone

════════════════════════════════════════════════════════════

## Team 170 — LLD400 Production (Phase 1)

### Your Task

**Environment:** Gemini (Team 170 — Spec-Author)

Produce a complete LLD400 spec for WP `S003-P004-WP001`.

**Spec Brief:**

S003-P004 D33 User Tickers (My Tickers page) — personal watchlist, live prices, display_name Iron Rule (never show raw symbol), filtering/sorting/pagination. LOD200: _COMMUNICATION/team_100/TEAM_100_S003_P004_WP001_LOD200_v1.0.0.md

---

**Required sections (all 7 are mandatory):**

1. **Identity Header** — `gate: GATE_1 | wp: S003-P004-WP001 | stage: S003 | domain: tiktrack | date: 2026-03-25`
2. **Endpoint Contract** — HTTP method, path, request body schema, response schema
3. **DB Contract** — tables accessed, columns read/written, query patterns; no new schema unless spec mandates
4. **UI Structural Contract** — component hierarchy, DOM anchors (`data-testid`), state shape
5. **MCP Test Scenarios** — each scenario: precondition → action → expected assertion
6. **Acceptance Criteria** — numbered, each criterion independently pass/fail testable
7. **Gate 4.3 — Human Review Checklist** — table of HRC items for Nimrod's browser sign-off. Format:
   `| ID | Scenario (HE) | URL / Environment | Success Criteria | Failure Indicators |`
   Each row = one testable browser/API check derived from Acceptance Criteria above.
   Minimum 5 items. IDs: HRC-01, HRC-02, … This section is loaded directly by the pipeline dashboard at GATE_4/4.3.

---

Save LLD400 to: `_COMMUNICATION/team_170/TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md`

When done, inform Nimrod. Nimrod runs `./pipeline_run.sh --domain tiktrack phase2` to activate Team 190 validation.

⛔ **YOUR TASK ENDS WITH SAVING THE LLD400. Do NOT validate your own output.**

**Output — write to:**
`_COMMUNICATION/team_170/TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md`

### Acceptance
- LLD400 saved to: `_COMMUNICATION/team_170/TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md`
- All 6 required sections present with complete content
- Identity Header matches state (gate/wp/stage/domain/date)
- Scope matches spec_brief — no undeclared additions
- Team 190 notified for Phase 2 validation

────────────────────────────────────────────────────────────
  ✅  YOUR MANDATE (Phase 1) IS COMPLETE WHEN you save your delivery artifact.
  ⚠️  DO NOT run pipeline_run.sh commands — the operator (Nimrod) controls pipeline advancement.
  ℹ️  OPERATOR NOTE: after Phase 1 delivery confirmed, run:
       ./pipeline_run.sh --domain tiktrack phase2
     (regenerates mandates with Phase 1 output → activates Phase 2)
────────────────────────────────────────────────────────────

## Team 190 — LLD400 Validation (Phase 2)

⚠️  PREREQUISITE: **Team 170** must be COMPLETE before starting this mandate.

### Your Task

**Environment:** OpenAI / Codex (Team 190 — Constitutional-Validator)

Validate the LLD400 produced by Team 170. This is **external validation** — you use a different engine from Team 170 by architectural design.

**Read the LLD400 from:** `_COMMUNICATION/team_170/TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md`

(If the file is missing, Team 170 has not completed Phase 1. Stop and notify.)

---

**Validation checklist (all 9 items required):**

1. **Identity Header** — gate/wp/stage/domain/date all present and match state
2. **All 7 sections present** — Identity, Endpoint, DB, UI, MCP Scenarios, Acceptance Criteria, Gate 4.3 HRC
3. **Endpoint Contract** — method, path, full request/response schema specified
4. **DB Contract** — no undeclared schema changes; NUMERIC(20,8) Iron Rule for financial data
5. **UI Contract** — DOM anchors (`data-testid`), component tree, state shape complete
6. **Acceptance Criteria** — numbered, each criterion independently testable
7. **Scope compliance** — stays within spec_brief; no undeclared additions
8. **Iron Rules** — maskedLog mandatory, collapsible-container, no new backend unless spec mandates
9. **Gate 4.3 HRC** — section present; ≥5 HRC items with ID/Scenario/URL/Success Criteria/Failure Indicators columns; items are testable in browser

**Spec Brief (reference):**

S003-P004 D33 User Tickers (My Tickers page) — personal watchlist, live prices, display_name Iron Rule (never show raw symbol), filtering/sorting/pagination. LOD200: _COMMUNICATION/team_100/TEAM_100_S003_P004_WP001_LOD200_v1.0.0.md

---

## MANDATORY: JSON Verdict Block

Your verdict file MUST begin with this JSON block as the first content:

```json
{
  "gate_id": "GATE_1",
  "decision": "PASS",
  "blocking_findings": [],
  "route_recommendation": null,
  "summary": "One sentence summary"
}
```

For BLOCK_FOR_FIX:

```json
{
  "gate_id": "GATE_1",
  "decision": "BLOCK_FOR_FIX",
  "blocking_findings": [
    {"id": "BF-01", "description": "...", "evidence": "path/file.py:42"}
  ],
  "route_recommendation": "doc",
  "summary": "N blockers. [summary]"
}
```

**Rules:** JSON block must be first. Detailed analysis follows after the block.

Save verdict to: `_COMMUNICATION/team_190/TEAM_190_S003_P004_WP001_GATE_1_VERDICT_v1.0.0.md`

- **PASS** → ready for GATE_2
- **BLOCK** → `BF-XX: description | fix required`

If BLOCK: Team 170 must revise the LLD400. Do NOT fix it yourself.

⛔ **YOU ARE TEAM 190 — VALIDATE ONLY. Do NOT rewrite or fix the LLD400.**

**Output — write to:**
`_COMMUNICATION/team_190/TEAM_190_S003_P004_WP001_GATE_1_VERDICT_v1.0.0.md`

### Coordination Data — LLD400 produced by Team 170 (Phase 1 output)

✅  Auto-loaded: `_COMMUNICATION/team_170/TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md`

```
# Team 170 — LLD400 | S003-P004-WP001 — D33 User Tickers (My Tickers)

**Document:** `TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md`  
**From:** Team 170 (Spec & Governance — TikTrack lane)  
**To:** Team 190 (Phase 2 validation) · Team 10 (Gateway) · Teams 20 / 30 / 50 (execution & QA)  
**status:** AS_MADE (Phase 1 spec delivery)  
**spec_version:** 1.0.0  
**normative_baseline:** `_COMMUNICATION/team_100/TEAM_100_S003_P004_WP001_LOD200_v1.0.0.md` (LOCKED)

---

## 1. Identity Header

`gate: GATE_1 | wp: S003-P004-WP001 | stage: S003 | domain: tiktrack | date: 2026-03-25`

| Field | Value |
|-------|-------|
| roadmap_program | S003-P004 |
| work_package_id | S003-P004-WP001 |
| page / module | D33 — הטיקרים שלי (`user_tickers` / My Tickers) |
| architectural_approval_type | SPEC (LLD400) |
| phase_owner | Team 10 |

---

## 2. Endpoint Contract

### 2.1 Scope and base URL

- **API base:** `settings.api_v1_prefix` = `/api/v1` (FastAPI mount).
- **Logical resource:** Authenticated user’s watchlist rows in `user_data.user_tickers`, joined to `market_data.tickers`, enriched with live/EOD price fields per existing SSOT (`_get_price_with_fallback` and related).
- **Stakeholder alias:** Any reference to “GET /user_tickers” in legacy language maps to **`GET /api/v1/me/tickers`** (no separate `GET /api/v1/user_tickers` required).

### 2.2 `GET /api/v1/me/tickers` — list (extended)

| Item | Specification |
|------|----------------|
| Method | `GET` |
| Path | `/api/v1/me/tickers` |
| A
```
_[… content truncated at 1500 chars]_


### Acceptance
- All 8 validation checklist items addressed
- If PASS  →  `./pipeline_run.sh --domain tiktrack pass`  (advances to GATE_2)
- If BLOCK →  `./pipeline_run.sh --domain tiktrack fail "BF-XX: [description]"`  (returns to Team 170)
