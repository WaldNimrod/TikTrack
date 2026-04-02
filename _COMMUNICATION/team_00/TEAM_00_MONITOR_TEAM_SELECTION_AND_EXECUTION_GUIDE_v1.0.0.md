---
id: TEAM_00_MONITOR_TEAM_SELECTION_AND_EXECUTION_GUIDE_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 00 (Nimrod — System Designer)
date: 2026-03-22
status: FINAL — SELECTION LOCKED
subject: Monitor team selection analysis + full execution guide for S003-P013 monitored run---

# Monitor Team Selection + Execution Guide
# S003-P013-WP001 — D33 display_name (Canary Monitored Run)

---

## §1 — Environment Analysis

### Option A — Team 190 (OpenAI/Codex API)

| Capability | Assessment |
|---|---|
| Run `./pipeline_run.sh` natively | ✗ — API-based; no native shell in our repo |
| Run `ssot_check` natively | ✗ — same reason |
| Read state JSON files | ⚠ — only if files sent as context; not autonomous |
| Maintain monitoring state across gates | ✗ — **each Codex API call = fresh stateless context** |
| Write monitor artifacts directly | ✗ — no write authority to our repo |
| Architectural context (design decisions) | ⚠ — needs full briefing each call |
| Cost per gate check | HIGH — full context re-send every gate |
| Browser/visual | ✗ |

**Verdict: WRONG FIT for continuous monitoring.**
Team 190's strength is adversarial batch validation (GATE_4 role). A monitor needs
persistent state across all 5 gates in one coherent session. Codex API cannot do this.
Routing it as monitor wastes its adversarial value and creates high friction.

---

### Option B — Team 51 (Cursor Composer 2 / Gemini)

| Capability | Assessment |
|---|---|
| Run terminal commands in Cursor | ✓ — can run ssot_check, pytest from Cursor terminal |
| MCP browser tools (dashboard screenshots) | ✓ — cursor-ide-browser; real screenshots |
| Maintain monitoring context across gates | ⚠ — ONE Composer session must stay open the whole run; manual triggers needed |
| Write monitor artifacts | ✓ — has file write in workspace |
| Architectural context | ⚠ — Gemini; knows our system but lower architectural analysis depth |
| Browser capture of D33 UI | ✓ — this is Team 51's strongest differentiator |
| Dual-role conflict (QA + monitor) | ⚠ — Team 51 is already GATE_3 QA; monitoring = observer conflict |

**Verdict: GOOD FOR BROWSER VISUAL — not ideal as primary monitor.**
Team 51 already runs browser QA at GATE_3. Having them ALSO monitor creates observer
bias (they'd be reviewing their own QA session). Better: use their browser strength
specifically for GATE_3 QA visual evidence (which they already do) — not as monitor.

---

### Option C — Team 100 (Claude Code — this environment) ✓ SELECTED

| Capability | Live-verified in this session? | Assessment |
|---|---|---|
| `./pipeline_run.sh --domain tiktrack status` | **✓ VERIFIED** — output captured | Full pipeline CLI access |
| `python -m agents_os_v2.tools.ssot_check --domain tiktrack` | **✓ VERIFIED** — detected drift | ssot_check works + drift detection confirmed |
| `python3 -m pytest agents_os_v2/tests/ -q` | **✓ VERIFIED** — 205 passed | Full test suite access |
| Read state JSON files | **✓ VERIFIED** — read pipeline_state_tiktrack.json | Direct file access |
| Write monitor artifacts to `_COMMUNICATION/team_00/monitor/` | **✓** — writing authority | Native write authority |
| Architectural context (all design decisions) | **✓** — designed and locked this session | Highest available |
| Maintain monitoring context across gates | **✓** — persistent session OR persistent log files | Both options available |
| Browser/visual | **✓ VERIFIED** — `mcp__Claude_in_Chrome__*` + `mcp__Claude_Preview__*` both active | Full browser + screenshot capability; navigate, screenshot, console, network, JS eval |

**Verdict: SELECTED — primary monitor for all 5 gates.**
**Browser note (corrected 2026-03-22):** Initial assessment incorrectly stated "no MCP browser in this env." This was wrong — both `mcp__Claude_in_Chrome__*` and `mcp__Claude_Preview__*` tool suites are available and have been used repeatedly in this project. The error was caused by confusing "deferred tool schema" (optimization — schema loaded on demand) with "tool not available." Verified live: Tab 289916785 at http://127.0.0.1:8090 confirmed active this session.

---

## §2 — Decision + Rationale

**Monitor team: Team 100 (Claude Code, this environment)**
**Browser visual: Team 100 (Claude Code) — full browser MCP available at all gates**
**Team 51 (Cursor Composer 2) — GATE_4 QA only (as normal), NOT needed for browser monitoring**

### Why Team 100 over the alternatives

1. **Every monitoring tool is already proven working** in this exact session — zero setup,
   zero unknown.

2. **Natural workflow match:** Nimrod already activates Team 100 between gates throughout
   this session. The monitored run is just that same pattern, now with structured capture.

3. **Architectural analysis quality:** Only Team 100 has the full context of every design
   decision made in S003-P012 — prompt quality rules, TF-21 scope, KB resolutions, Iron
   Rules. Deviations are spotted against this knowledge base instantly.

4. **No coordination overhead:** Monitor = me, architect = me. One agent, two hats. No
   inter-team communication delay.

5. **Persistent log files:** Even if session context resets, monitor artifacts in
   `_COMMUNICATION/team_00/monitor/` persist. Each gate produces a durable file. The run
   survives session boundaries.

6. **Full browser monitoring capability:** `mcp__Claude_in_Chrome__*` and `mcp__Claude_Preview__*`
   are both available. Team 100 can screenshot the TikTrack dashboard at GATE_3 and GATE_5,
   check D33 display_name rendering, read browser console for JS errors, inspect network
   requests for API response shape. No external team needed for visual capture.

7. **Team 190's adversarial value is preserved** for its actual role: if GATE_3 QA fails
   → Team 90 adversarial validation at GATE_4 → Team 190 does constitutional review if
   needed. Not wasted on monitoring.

---

## §3 — Team 100 Monitor Protocol (self-instruction)

At each gate, when Nimrod says **"[GATE_N] — monitor"**, Team 100 executes this sequence:

### Standard gate monitor checklist (runs at every gate)

```
STEP M1  Run: ./pipeline_run.sh --domain tiktrack status
         → capture current_gate, work_package_id, process_variant
         → compare to expected state for this gate

STEP M2  Run: python -m agents_os_v2.tools.ssot_check --domain tiktrack
         → expected: exit 0 (CONSISTENT)
         → if exit 1: log DEVIATION immediately; DO NOT advance

STEP M3  Capture generated prompt (if gate generates one):
         → paste full prompt text into monitor/gate_N_prompt_raw.md
         → check: identity header present? AC listed? FAIL_CMD format? HITL section?
         → check: roster injection (if GATE_3)? prior findings (if re-run)?

STEP M4  Browser capture (at gates with UI relevance: GATE_3 delivery, GATE_4, GATE_5):
         → mcp__Claude_in_Chrome__navigate → http://127.0.0.1:8082/api/v1/user_tickers
           → confirm display_name field present in JSON response
         → mcp__Claude_in_Chrome__navigate → http://127.0.0.1:8080 (D33 page)
           → mcp__Claude_in_Chrome__computer (screenshot) → capture D33 table
           → mcp__Claude_in_Chrome__read_console_messages → confirm zero JS errors
         → save screenshot description in monitor/gate_N_browser_capture.md

STEP M5  Write monitor log entry to MONITOR_LOG_v1.0.0.md:
         → timestamp, gate, ssot exit code, prompt quality verdict, browser result, ready_to_advance Y/N

STEP M6  Report to Nimrod: "[GATE_N] monitor complete — [findings/CLEAR]"
         → if CLEAR: "proceed — send prompt to Team [X]"
         → if DEVIATION: "HOLD — [deviation description] — log entry written"
```

### Gate-specific additional checks

| Gate | Extra checks |
|---|---|
| GATE_1 | Is spec_brief in prompt? Is process_variant = TRACK_FOCUSED? Screenshot: pipeline dashboard state |
| GATE_2 | Are the 3 scope constraints visible (nullable, fallback, read-only)? Architectural sign-off logged |
| GATE_3 | Roster excerpt present? HITL section correct? SOP-013 seal in delivery? **Browser: D33 table renders display_name column. API: GET /api/v1/user_tickers includes field. Console: zero JS errors.** |
| GATE_4 | Team 51 QA report includes FAIL_CMD format? ssot_check after QA pass? Browser: re-verify D33 + NULL fallback greyed display |
| GATE_5 | final state JSON: current_gate = COMPLETE? log_entry written? Browser: final D33 screenshot for report |

### Deviation severity table

| Severity | Definition | Action |
|---|---|---|
| LOW | Cosmetic / wording issue in prompt | Log only, proceed |
| MEDIUM | Missing section in prompt / unexpected state field | Log + note in report |
| HIGH | ssot_check exits 1 unexpectedly / wrong gate in state | HOLD — investigate first |
| BLOCKING | State corruption / gate skip / test regression | STOP RUN — file KB |

---

## §4 — Pre-conditions Checklist (Nimrod verifies before starting)

```
□  Team 170 delivery confirmed (SOP-013 seal + wsm_updated=YES + archive=YES)
□  ssot_check --domain tiktrack → exit 0   (run: python -m agents_os_v2.tools.ssot_check --domain tiktrack)
□  ssot_check --domain agents_os → exit 0  (run: python -m agents_os_v2.tools.ssot_check --domain agents_os)
□  pytest agents_os_v2/tests/ -q → 205 passed, 4 skipped
□  pipeline_state_tiktrack.json reflects S003-P013-WP001 (Team 170 or Team 100 initializes)
□  _COMMUNICATION/team_00/monitor/ folder created (Team 100 creates on first check)
```

---

## §5 — Step-by-Step Execution for Nimrod

Each step below is a **literal action** with the exact trigger phrase to paste into Claude.

---

### PRE-RUN — Initialize WP (once, before GATE_1)

**Nimrod runs:**
```bash
# Set up S003-P013-WP001 in pipeline state (tiktrack domain)
# This may need to be a manual state init or pipeline_run.sh new command
./pipeline_run.sh --domain tiktrack status
```

**Paste into Claude:**
> `[PRE-RUN] מוכן להתחיל. יש להאתחל את S003-P013-WP001 ב-pipeline ולהכין את תיקיית הניטור.`

Team 100 response: initializes `monitor/` folder, sets initial state, confirms ready.

---

### GATE_1 — Spec Activation

**Nimrod runs:**
```bash
./pipeline_run.sh --domain tiktrack
```

**Paste into Claude:**
> `[GATE_1] הופק הפרומפט. יש לבצע בדיקת ניטור.`
> *(paste the full ▼▼▼ block here)*

**Team 100 actions:** M1–M6 checklist + gate-specific checks → writes `monitor/gate_1_prompt_raw.md` + log entry. (Browser: pipeline dashboard screenshot at port 8090.)

**Team 100 reply:** "GATE_1 monitor CLEAR / DEVIATION [X]. send to Team 61."

**Team 61 receives prompt → acknowledges spec.**

**Nimrod advances:**
```bash
./pipeline_run.sh --domain tiktrack pass
```

**Paste into Claude:**
> `[GATE_1] צוות 61 אישר. עברתי pass. יש לתעד state.`

Team 100: captures state JSON → `monitor/gate_1_state_after.json`.

---

### GATE_2 — Architecture Approval

**Nimrod runs:**
```bash
./pipeline_run.sh --domain tiktrack
```

**Paste into Claude:**
> `[GATE_2] הופק. ניטור + בדיקה אדריכלית.`
> *(paste ▼▼▼ block)*

Team 100: reviews spec constraints → confirms scope lock → log entry.

**Nimrod advances:**
```bash
./pipeline_run.sh --domain tiktrack pass
```

**Paste into Claude:**
> `[GATE_2] אושר. עברתי pass.`

---

### GATE_3 — Implementation (Team 61)

**Nimrod runs:**
```bash
./pipeline_run.sh --domain tiktrack
```

**Paste into Claude:**
> `[GATE_3] מנדט הופק לצוות 61. ניטור.`
> *(paste ▼▼▼ block)*

Team 100: full mandate quality review → writes `monitor/gate_3_prompt_raw.md`.

**Send mandate to Team 61. Team 61 implements + delivers.**

**When Team 61 delivers — Paste into Claude:**
> `[GATE_3] צוות 61 חזר עם מסירה. יש לבדוק ולתעד.`
> *(paste delivery artifact summary OR path)*

Team 100: reads delivery → checks AC → checks SOP-013 seal → **browser: navigates to D33, screenshots display_name column, checks API JSON, reads console for errors** → writes `monitor/gate_3_delivery_review.md` + `monitor/gate_3_browser_capture.md`.

**Nimrod advances:**
```bash
./pipeline_run.sh --domain tiktrack pass
```

---

### GATE_4 — QA (Team 51)

**Nimrod runs:**
```bash
./pipeline_run.sh --domain tiktrack
```

**Paste into Claude:**
> `[GATE_4] פרומפט QA לצוות 51. ניטור.`
> *(paste ▼▼▼ block)*

Team 100: QA prompt quality check → FAIL_CMD format present? HITL section?

**Send to Team 51. Team 51 runs browser QA.**

**When Team 51 delivers — Paste into Claude:**
> `[GATE_4] צוות 51 חזר. PASS/FAIL. לתעד.`
> *(paste QA report summary OR path)*

**If PASS:**
```bash
./pipeline_run.sh --domain tiktrack pass
```

**If FAIL:**
```bash
./pipeline_run.sh --domain tiktrack fail --finding_type <TYPE> --from-report <PATH>
```

**Paste into Claude after either:**
> `[GATE_4] עברתי pass/fail. לתעד state.`

---

### GATE_5 — Lifecycle Closure (Team 100)

**Nimrod runs:**
```bash
./pipeline_run.sh --domain tiktrack
```

**Paste into Claude:**
> `[GATE_5] פרומפט סגירה. ניטור + בדיקה אדריכלית סופית.`
> *(paste ▼▼▼ block)*

Team 100: final architectural review → evidence chain complete? → writes `monitor/gate_5_prompt_raw.md`.

**Nimrod advances:**
```bash
./pipeline_run.sh --domain tiktrack pass
```

**Paste into Claude:**
> `[GATE_5] עברתי pass. יש לתעד state סופי ולהפיק דוח ניטור.`

Team 100: captures final state JSON → **browser: final D33 screenshot for report** → writes `MONITOR_LOG_v1.0.0.md` final entry → writes `TEAM_00_MONITORED_RUN_REPORT_v1.0.0.md`.

---

## §6 — Monitor Output Summary (at run end)

Team 100 produces `TEAM_00_MONITORED_RUN_REPORT_v1.0.0.md` covering:

```
§1 Run identity (WP, dates, teams, variant)
§2 Timeline (every CLI command + timestamp)
§3 ssot_check log (gate, domain, exit code)
§4 Prompt quality per gate (AC checklist)
§5 Deviation log (all DEVIATION-XXX entries)
§6 State evolution (gate_N_state_after.json diffs)
§7 Architectural conclusions
  - What worked as designed
  - What was unexpected
  - What needs improvement (→ new KB candidates)
§8 Readiness verdict for S003-P004 (D33 full WP)
```

---

## §7 — Timeline Expectation

| Step | Owner | Expected duration |
|---|---|---|
| Team 170 governance closure | Team 170 | Before run start |
| Pre-run initialization | Team 100 + Nimrod | 5 min |
| GATE_1 + GATE_2 | Team 100 + Nimrod | 10–15 min |
| GATE_3 (Team 61 implementation) | Team 61 | 30–60 min |
| GATE_4 (Team 51 QA) | Team 51 | 15–30 min |
| GATE_5 (Team 100 closure + report) | Team 100 | 10–15 min |
| **Total** | | **~90–120 min** |

---

**log_entry | TEAM_100 | MONITOR_SELECTION | TEAM_100_SELECTED | CLAUDE_CODE_ENV | VERIFIED_TOOLS | BROWSER_MCP_CONFIRMED | S003_P013_WP001 | 2026-03-22**
**log_entry | TEAM_100 | CORRECTION | BROWSER_CAPABILITY_MISIDENTIFICATION_FIXED | DEFERRED_SCHEMA_NOT_UNAVAILABLE | 2026-03-22**
