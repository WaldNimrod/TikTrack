---
**id:** TEAM_00_S001_P002_EXPERIMENT_FINDINGS_LOG_v1.0.0
**from:** Team 00 (Chief Architect)
**date_opened:** 2026-03-13
**status:** ACTIVE — collecting during experiment
**purpose:** Live log of findings, gaps, decisions, and open questions from the S001-P002 live-fire experiment. To be reviewed systematically after experiment completion.
---

# S001-P002 Live-Fire Experiment — Findings Log

## How to Read This Log

| Category | Meaning |
|---|---|
| 🔴 GAP | Missing capability — pipeline cannot do this today |
| 🟡 BUG | Existing code behaves incorrectly |
| 🔵 DECISION | Open question requiring architectural decision |
| 🟢 FINDING | Confirmed behavior (positive or negative) |
| ⚡ QUICK_FIX | Already fixed in this session |

---

## F-001 — DM Validator: false positives on spec_brief text
**Category:** 🟡 BUG
**Gate:** GATE_0
**Observed:** Validator fired DM-S-03, DM-S-04, DM-S-05, DM-S-07 on plain English spec_brief.
**Root cause:** `validate_spec_schema()` runs regex patterns designed for structured SQL/DB Contract sections against free-form pipeline spec_brief text. "N=5" parsed as column name "5". "triggered_at" as column declaration.
**Impact:** False BLOCK on every pipeline init unless user ignores and fast-advances.
**Fix needed:** Validator should only run on structured `## DB Contract` sections, not on raw spec_brief string. Or: gate_0 validate_spec_schema should accept a structured doc path, not a free-form string.
**Status:** OPEN

---

## F-002 — G3_PLAN prompt: missing team_10 identity injection
**Category:** 🟡 BUG → ⚡ QUICK_FIX
**Gate:** G3_PLAN
**Observed:** `_generate_g3_plan_prompt()` used hardcoded `"You are Team 10 (Gateway)"` instead of `load_team_identity("team_10")`.
**Impact:** Team 10 received no role definition, authority, hard rules, or Gate Runbook reference. Agent had no organizational context.
**Fix applied:** Changed to `load_team_identity("team_10")` + `TEAM_10_CONTEXT_RESET` header + `build_state_summary()`.
**Status:** ✅ FIXED (pipeline.py updated 2026-03-13)

---

## F-003 — Pipeline state: work_plan not captured after G3_PLAN
**Category:** 🔴 GAP
**Gate:** G3_PLAN → G3_5
**Observed:** `--advance G3_PLAN PASS` does not prompt for or capture the work plan output. `state.work_plan` stays empty. G3_5 prompt generates with placeholder `[Paste work plan from G3_PLAN output]`.
**Impact:** G3_5 prompt is useless unless work_plan is manually inserted into state.
**Fix needed:** `--advance G3_PLAN PASS` should accept `--work-plan <file>` flag that reads the file and stores it in `state.work_plan`. Alternatively: Team 10 writes work plan to a canonical path; pipeline reads it automatically.
**Status:** OPEN (workaround: manual state edit applied)

---

## F-004 — G3_5 FAIL: work plan quality insufficient
**Category:** 🟢 FINDING (pipeline working correctly)
**Gate:** G3_5
**Observed:** Team 90 blocked with 3 findings:
- B-G35-001: No canonical file paths for Team 20/50 deliverables
- B-G35-002: Test contract missing run commands + PASS criteria
- B-G35-003: Team 30 acceptance missing field/empty-state/error-state contract
**Assessment:** Correct behavior. G3_5 caught real gaps before code was written. Value demonstrated.
**Impact:** Delay (Team 10 must fix plan), but prevented flawed development cycle.
**Status:** OPEN — Team 10 fix in progress

---

## F-005 — ClaudeEngine: subprocess credits separate from Cursor/Claude Code subscription
**Category:** 🔵 DECISION
**Observed:** `claude --print -p <prompt>` failed with "Credit balance is too low". Anthropic API direct credits are separate from Cursor subscription and Claude Code subscription.
**Impact:** ClaudeEngine auto-invocation not available without API top-up.
**Decision needed:** Which teams can use ClaudeEngine? Likely limited to Team 00/100 in dedicated sessions. All other teams (10/20/30/50/70/90) should use Cursor or Gemini.
**Status:** OPEN

---

## F-006 — OpenAI/Gemini engines: packages not installed, no API keys
**Category:** 🔴 GAP
**Observed:** `openai` package not installed. `google-genai` not installed. `OPENAI_API_KEY` and `GEMINI_API_KEY` not set.
**Impact:** GeminiEngine and OpenAIEngine cannot auto-invoke. All "codex/openai" gates require manual Cursor paste.
**Decision needed:** Which API to set up for auto-invocation? Gemini Flash (free tier) is cheapest. OpenAI has user credits.
**Status:** OPEN

---

## F-007 — Execution gap: G3_6_MANDATES → CURSOR_IMPLEMENTATION is manual
**Category:** 🔴 GAP (architectural)
**Observed:** Pipeline generates `implementation_mandates.md` but does not invoke any agent to act on it. A human must open Cursor Composer and paste the mandate. Team 20 (API verify), Team 30 (code), Team 50 (QA) — all require manual invocation.
**Impact:** Pipeline automates governance/documentation but NOT execution. The experiment produced zero lines of code automatically.
**Fix needed:** Execution hooks. Options:
  A. Wire GeminiEngine/OpenAIEngine into G3_6_MANDATES dispatch
  B. Claude Code (`claude --print`) for Team 30 code writing (write-enabled subprocess)
  C. MCP browser tools wired into GATE_4 for Team 50 QA
**This is the primary architectural gap revealed by this experiment.**
**Status:** OPEN — S004 candidate

---

## F-008 — G3_PLAN produces planning doc, not activation prompts
**Category:** 🔵 DECISION
**Observed:** Team 10 in G3_PLAN produced a work plan document. In the pre-pipeline organizational flow, Team 10 would produce ready-to-send activation prompts for Team 20/30 at this stage.
**Current design:** Mandates are generated deterministically in G3_6_MANDATES (after G3_5 PASS). Team 10 only plans.
**Trade-off:** Sequential (governance first) vs. parallel (plan + draft mandates simultaneously).
**Decision needed:** Should G3_PLAN prompt require Team 10 to also produce draft mandates? These would be held, not sent, until G3_5 PASS.
**Status:** OPEN

---

## F-009 — G3_6_MANDATES generates generic mandates (not spec-specific)
**Category:** 🔴 GAP
**Observed:** `_generate_mandates()` in pipeline.py loads `load_conventions("backend")` and `load_conventions("frontend")` and fills in a generic template. It does NOT use `state.work_plan` content.
**Impact:** Mandates sent to Team 30 will be generic, not specific to the Alerts Widget. Team 30 gets backend conventions + spec_brief, not the detailed field contracts from G3_PLAN.
**Fix needed:** `_generate_mandates()` should incorporate `state.work_plan` to generate feature-specific mandates, not just generic templates.
**Status:** OPEN

---

## Questions for Post-Experiment Review

**Q1:** Should the pipeline be sequential (current: governance → execution) or parallel (plan + governance in parallel with early dev)?

**Q2:** Which engine should be the default for Team 10 (G3_PLAN)? Gemini (config.py) or Cursor (GATE_CONFIG)? There's an inconsistency.

**Q3:** How should work plan output be captured? Flag `--work-plan <file>` or auto-read from canonical path?

**Q4:** Is Cursor Composer the right tool for Team 30 long-term? Or should we invest in ClaudeEngine with write access?

**Q5:** Should Team 10's G3_PLAN prompt be split into two phases: planning + draft mandates?

**Q6:** For Team 20 (API verify only), can this be automated entirely via subprocess curl? No AI needed.

---

**log_entry | TEAM_00 | EXPERIMENT_FINDINGS_LOG | ACTIVE | 2026-03-13**
