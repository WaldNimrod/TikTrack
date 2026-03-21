# Mandates — S003-P011-WP001  ·  GATE_1

**Spec:** Process Architecture v2.0 — 5-gate canonical model (GATE_1..5), FCP 3-level classification with auto-routing, TRACK_FULL/TRACK_FOCUSED/TRACK_FAST process variants, team_engine_config.json externalization, Team 00 identity correction, Team 11/102/191 registration, lod200_author_team LOD200 Author Rule, state schema migration from legacy gate sequence (GATE_0→GATE_8). LOD200 v1.3 APPROVED 2026-03-19.

**Canonical date:** Use `date -u +%F` for today; replace {{date}} in identity headers.

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  Team 170   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             💻  Phase 1 done?  →  ./pipeline_run.sh --domain agents_os phase2
             📄 Team 190 reads coordination data from Team 170

  Phase 2:  Team 190   ← runs alone

════════════════════════════════════════════════════════════

## Team 170 — LLD400 Production (Phase 1)

### Your Task

**Environment:** Gemini (Team 170 — Spec-Author)

Produce a complete LLD400 spec for WP `S003-P011-WP001`.

**Spec Brief:**

Process Architecture v2.0 — 5-gate canonical model (GATE_1..5), FCP 3-level classification with auto-routing, TRACK_FULL/TRACK_FOCUSED/TRACK_FAST process variants, team_engine_config.json externalization, Team 00 identity correction, Team 11/102/191 registration, lod200_author_team LOD200 Author Rule, state schema migration from legacy gate sequence (GATE_0→GATE_8). LOD200 v1.3 APPROVED 2026-03-19.

---

**Required sections (all 6 are mandatory):**

1. **Identity Header** — `gate: GATE_1 | wp: S003-P011-WP001 | stage: S003 | domain: agents_os | date: 2026-03-19`
2. **Endpoint Contract** — HTTP method, path, request body schema, response schema
3. **DB Contract** — tables accessed, columns read/written, query patterns; no new schema unless spec mandates
4. **UI Structural Contract** — component hierarchy, DOM anchors (`data-testid`), state shape
5. **MCP Test Scenarios** — each scenario: precondition → action → expected assertion
6. **Acceptance Criteria** — numbered, each criterion independently pass/fail testable

---

Save LLD400 to: `_COMMUNICATION/team_170/TEAM_170_S003_P011_WP001_LLD400_v1.0.0.md`

When done, inform Nimrod. Nimrod runs `./pipeline_run.sh --domain agents_os phase2` to activate Team 190 validation.

⛔ **YOUR TASK ENDS WITH SAVING THE LLD400. Do NOT validate your own output.**

**Output — write to:**
`_COMMUNICATION/team_170/TEAM_170_S003_P011_WP001_LLD400_v1.0.0.md`

### Acceptance
- LLD400 saved to: `_COMMUNICATION/team_170/TEAM_170_S003_P011_WP001_LLD400_v1.0.0.md`
- All 6 required sections present with complete content
- Identity Header matches state (gate/wp/stage/domain/date)
- Scope matches spec_brief — no undeclared additions
- Team 190 notified for Phase 2 validation

────────────────────────────────────────────────────────────
  ✅  Phase 1 complete?
  →  Run in terminal:  ./pipeline_run.sh --domain agents_os phase2
     Regenerates mandates with Phase 1 output injected
     + displays Phase 2 section ready to copy.
────────────────────────────────────────────────────────────

## Team 190 — LLD400 Validation (Phase 2)

⚠️  PREREQUISITE: **Team 170** must be COMPLETE before starting this mandate.

### Your Task

**Environment:** OpenAI / Codex (Team 190 — Constitutional-Validator)

Validate the LLD400 produced by Team 170. This is **external validation** — you use a different engine from Team 170 by architectural design.

**Read the LLD400 from:** `_COMMUNICATION/team_170/TEAM_170_S003_P011_WP001_LLD400_v1.0.0.md`

(If the file is missing, Team 170 has not completed Phase 1. Stop and notify.)

---

**Validation checklist (all 8 items required):**

1. **Identity Header** — gate/wp/stage/domain/date all present and match state
2. **All 6 sections present** — Identity, Endpoint, DB, UI, MCP Scenarios, Acceptance Criteria
3. **Endpoint Contract** — method, path, full request/response schema specified
4. **DB Contract** — no undeclared schema changes; NUMERIC(20,8) Iron Rule for financial data
5. **UI Contract** — DOM anchors (`data-testid`), component tree, state shape complete
6. **Acceptance Criteria** — numbered, each criterion independently testable
7. **Scope compliance** — stays within spec_brief; no undeclared additions
8. **Iron Rules** — maskedLog mandatory, collapsible-container, no new backend unless spec mandates

**Spec Brief (reference):**

Process Architecture v2.0 — 5-gate canonical model (GATE_1..5), FCP 3-level classification with auto-routing, TRACK_FULL/TRACK_FOCUSED/TRACK_FAST process variants, team_engine_config.json externalization, Team 00 identity correction, Team 11/102/191 registration, lod200_author_team LOD200 Author Rule, state schema migration from legacy gate sequence (GATE_0→GATE_8). LOD200 v1.3 APPROVED 2026-03-19.

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

Save verdict to: `_COMMUNICATION/team_190/TEAM_190_S003_P011_WP001_GATE_1_VERDICT_v1.0.0.md`

- **PASS** → ready for GATE_2
- **BLOCK** → `BF-XX: description | fix required`

If BLOCK: Team 170 must revise the LLD400. Do NOT fix it yourself.

⛔ **YOU ARE TEAM 190 — VALIDATE ONLY. Do NOT rewrite or fix the LLD400.**

**Output — write to:**
`_COMMUNICATION/team_190/TEAM_190_S003_P011_WP001_GATE_1_VERDICT_v1.0.0.md`

### Coordination Data — LLD400 produced by Team 170 (Phase 1 output)

✅  Auto-loaded: `_COMMUNICATION/team_170/TEAM_170_S003_P011_WP001_LLD400_v1.0.0.md`

```
# TEAM_170_S003_P011_WP001_LLD400_v1.0.0 — Process Architecture v2.0

**project_domain:** AGENTS_OS  
**id:** TEAM_170_S003_P011_WP001_LLD400  
**from:** Team 170 (Spec & Governance Authority)  
**to:** Team 190 (GATE_1 validation), Team 61 (implementation)  
**cc:** Team 10, Team 100, Team 11  
**date:** 2026-03-19  
**status:** SUBMITTED_FOR_GATE_1_VALIDATION  
**gate_id:** GATE_1  
**architectural_approval_type:** SPEC  
**spec_version:** 1.0.0  
**source:** _COMMUNICATION/team_00/TEAM_00_S003_P011_WP001_LOD200_v1.0.0.md  
**required_ssm_version:** 1.0.0  
**required_wsm_version:** 1.0.0  
**required_active_stage:** S003  
**phase_owner:** Team 100  

---

## §1 Identity Header

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P011 |
| work_package_id | S003-P011-WP001 |
| task_id | N/A |
| gate_id | GATE_1 |
| architectural_approval_type | SPEC |
| spec_version | 1.0.0 |
| date | 2026-03-19 |
| source | TEAM_00_S003_P011_WP001_LOD200_v1.0.0.md |
| required_ssm_version | 1.0.0 |
| required_wsm_version | 1.0.0 |
| required_active_stage | S003 |
| phase_owner | Team 100 |

---

## §2 Endpoint Contract

**Domain:** Process Architecture v2.0 has no HTTP API. Contracts are CLI commands, Python module entry points, and config file schemas.

### 2.1 CLI: pipeline_run.sh

| Command | Purpose |
|---------|---------|
| `./pipeline_run.sh --domain agents_os` | Generate current gate prompt (GATE_N nomenclature) |
| `./pipeli
```
_[… content truncated at 1500 chars]_


### Acceptance
- All 8 validation checklist items addressed
- If PASS  →  `./pipeline_run.sh --domain agents_os pass`  (advances to GATE_2)
- If BLOCK →  `./pipeline_run.sh --domain agents_os fail "BF-XX: [description]"`  (returns to Team 170)
