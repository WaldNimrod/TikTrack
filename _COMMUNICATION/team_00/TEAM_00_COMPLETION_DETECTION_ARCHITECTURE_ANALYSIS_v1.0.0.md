---
id: TEAM_00_COMPLETION_DETECTION_ARCHITECTURE_ANALYSIS_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 00 (Nimrod — System Designer)
date: 2026-03-22
status: ARCHITECTURAL REVIEW — OPEN
subject: "How the pipeline detects team completion" — analysis, gap map, options
context: S003-P013-WP001 canary run | GATE_0 Team 190 detection failure---

# Team Completion Detection — Architectural Analysis

---

## §1 — What Happened at GATE_0 (trigger for this analysis)

1. Pipeline generated stale GATE_0 prompt (`wp=S003-P003-WP001` in header — old file not yet purged)
2. Nimrod copied prompt from dashboard → sent to Team 190 (Codex)
3. Team 190 correctly performed the task, produced a valid BLOCK_FOR_FIX verdict
4. Team 190 named the verdict file: `TEAM_190_S003_P003_WP001_GATE_0_VALIDATION_v1.0.0.md`
   (using the WP from the prompt they received — correct agent behavior)
5. Pipeline's `_verdict_candidates()` expects `TEAM_190_S003_P013_WP001_GATE_0_VALIDATION_v1.0.0.md`
6. **File not found → detection failure → no routing possible**

---

## §2 — The Three Detection Layers (as implemented)

| Layer | Mechanism | Location | Status |
|---|---|---|---|
| **L1 — File Discovery** | `_verdict_candidates(gate_id, work_package_id)` builds expected filenames from active WP ID | `pipeline.py:963` | PULL-based, rigid naming |
| **L2 — JSON Parsing** | `enforce_json_verdict(file)` parses `gate_id`, `decision`, `blocking_findings` | `json_enforcer.py` | Only runs AFTER L1 finds a file |
| **L3 — Manual Trigger** | `./pipeline_run.sh pass` or `./pipeline_run.sh fail "reason"` | `pipeline_run.sh` | Always operator-triggered |

**Critical fact: ALL THREE LAYERS ARE PULL-BASED.**
There is no automatic detection, no file watching, no polling, no event emission, no OS triggers.
The system is 100% operator-driven.

`./pipeline_run.sh pass` does NOT read any verdict file — it blindly advances.
`./pipeline_run.sh fail` reads the verdict file (L1 → L2) only to extract routing info.

---

## §3 — The PULL Model in Detail

```
Team 190 writes verdict file
        ↓
(nothing automatic happens)
        ↓
Nimrod/Monitor runs: ./pipeline_run.sh fail "reason"
        ↓
L1: _verdict_candidates() scans for file matching active WP ID
        ↓
L2 (if L1 found file): enforce_json_verdict() extracts decision, findings, route
        ↓
Pipeline advances state → shows routing options
```

**L1 is the critical gate.** If the filename doesn't match → routing fails.
Filename must encode the active WP ID from the pipeline state, not from the prompt.

---

## §4 — Root Cause of L1 Failure Pattern

L1 fails whenever the verdict file's WP ID ≠ pipeline's active WP ID.

**This can happen when:**
1. Team receives a stale/wrong prompt (contains old WP ID in header)
2. Team names the file after the prompt's WP ID (correct agent behavior)
3. Result: file exists but with wrong name → not discovered

**The fundamental tension:**
- Agents name files from what they see in the prompt (correct behavior)
- Pipeline discovers files by current state WP ID (correct design)
- These diverge when the prompt is stale or wrong

---

## §5 — The Event-Based Alternative (discussed but not implemented)

### Concept
Instead of Nimrod polling `./pipeline_run.sh`, a background process watches
`_COMMUNICATION/team_*/` for new files and auto-triggers pipeline advances.

### Requirements
- Long-running background process (daemon) or external trigger (cron, FSEvents, inotify)
- File arrival → validation → `pipeline.py --advance GATE_X PASS|FAIL`
- Error handling for partial writes, malformed files

### Status
- **NOT IMPLEMENTED** — referenced in `pipeline.py:16` (`--advance GATE_X PASS|FAIL` hint)
- Prior research and specs exist (Nimrod's note: "כבר בוצעו מספר מחקרים ובדיקות ואפיונים")
- No authority document locks or unlocks this

### Risk
- Daemon failure = silent pipeline stall
- Race conditions on file write vs detection
- Adds significant operational complexity

---

## §6 — FULL RESET Structure Analysis

### Current approach
FULL RESET block is appended by Nimrod manually at the END of the generated prompt.
The block sets team identity, then the LLM responds "Locked. Team N context adopted."
Then (separately, in the same response turn) the LLM performs the task.

### Risk
If the LLM stops after the "Locked..." acknowledgment and doesn't continue to the task,
the task won't be performed. This is **LLM context-collapse risk** — the reset instruction
may cause the model to treat acknowledgment as the complete response.

### Team 190 GATE_0 result
Both happened: "Locked..." was the first line, AND the full GATE_0 verdict was produced.
**So the FULL RESET worked correctly here.** But it's not guaranteed for all models/temperatures.

### Recommended improvement (not urgent)
Place FULL RESET BEFORE the task content (not after), with explicit instruction:
```
---
[FULL RESET section]
Locked. Team N context adopted. Now immediately performing the task below:
---
[TASK CONTENT]
```
This prevents the LLM from stopping at acknowledgment.

---

## §7 — Current Architecture Verdict: PULL-MODEL IS INTENTIONAL

For a team of ONE human (Nimrod) + AI agents without persistent processes:
- PULL model = simplest, most reliable, no daemon dependency
- Manual trigger = Nimrod or Team 100 monitor always knows why advance happened
- L1 (filename) + L2 (JSON) = sufficient for routing when prompt is correct

**The PULL model is correct for now.**
The monitor (Team 100) PARTIALLY compensates for the detection gap:
- I have Bash access → can check for verdict files in real-time
- I can read and validate the verdict content
- I can run `./pipeline_run.sh pass/fail` when appropriate
- This is the correct monitor behavior

---

## §8 — Gap Registry

| ID | Gap | Severity | Fix |
|---|---|---|---|
| G-CD-01 | L1 fails when team receives stale prompt (WP mismatch in filename) | HIGH | Ensure prompts are always fresh before sending; monitor verifies prompt identity before release |
| G-CD-02 | No automatic detection — 100% operator-triggered | MEDIUM | Event-based upgrade (deferred; deep architectural decision needed) |
| G-CD-03 | `./pipeline_run.sh pass` doesn't validate verdict exists — blind advance | MEDIUM | Add optional verdict validation before PASS (warn if no verdict file found) |
| G-CD-04 | FULL RESET at end of prompt risks acknowledgment-only response | LOW | Move FULL RESET before task content; add explicit "continue to task" instruction |
| G-CD-05 | Dashboard prompt file path label was small/muted — Nimrod couldn't verify which file | LOW | FIXED 2026-03-22 — path now shown as clickable link in styled box |

---

## §9 — Decisions Required (Nimrod)

1. **G-CD-02 (Event-based detection):** Continue PULL model indefinitely, or scope an event-based upgrade program?
   - If upgrade: this is a full S003/S004 program, not a patch — needs LOD200, dedicated WP
   - Current canary run: Team 100 as monitor bridges the gap manually

2. **G-CD-03 (Validate before PASS):** Add `./pipeline_run.sh pass` to warn if no verdict file found?
   - Pro: catches stale-prompt situations before they propagate
   - Con: adds friction when verdict is in non-standard location

3. **G-CD-04 (FULL RESET structure):** Move FULL RESET before task content in all prompts?
   - This affects how Nimrod assembles prompts — pipeline would need to auto-inject FULL RESET

---

## §10 — Immediate Action for S003-P013-WP001 GATE_0

Team 190's existing verdict (`TEAM_190_S003_P003_WP001_GATE_0_VALIDATION_v1.0.0.md`) is:
- **Correct analysis** (stale prompt = 4 valid blockers)
- **Wrong filename** (S003_P003 not S003_P013)
- **NOT needed for advancement** (the block is about the wrong prompt, now fixed)

**Action: Re-send CORRECT S003-P013-WP001 prompt to Team 190 → expect PASS → advance.**
DO NOT run `./pipeline_run.sh fail` — that would incorrectly record a failed gate cycle.

The correct prompt is at:
`_COMMUNICATION/agents_os/prompts/tiktrack_GATE_0_prompt.md`

---

**log_entry | TEAM_100 | ARCHITECTURE_ANALYSIS | COMPLETION_DETECTION | 3_LAYER_PULL_MODEL | GAP_REGISTRY_G-CD-01..05 | S003_P013_WP001 | 2026-03-22**
