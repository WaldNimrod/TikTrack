date: 2026-03-22
historical_record: true

# Team 00 — Pipeline Command Validation Analysis
## Proposal: Gate + WP pre-execution guard on `pipeline_run.sh`

**Document:** `TEAM_00_PIPELINE_COMMAND_VALIDATION_ANALYSIS_v1.0.0.md`
**From:** Team 100 (Claude Code — monitoring analyst)
**To:** Team 00 (Nimrod — architectural decision)
**Date:** 2026-03-22
**Status:** ANALYSIS — awaiting Team 00 decision
**Trigger:** Nimrod architectural observation: fixed terminal commands have no context-aware validation

---

## 1. Problem Statement

Current `pipeline_run.sh` commands are **context-blind**:

```bash
./pipeline_run.sh --domain tiktrack pass     # advances WHATEVER gate is active
./pipeline_run.sh --domain tiktrack fail     # fails WHATEVER gate is active
```

**Attack surface:**
- Pytest corrupts state → user runs `pass` without noticing → wrong gate advances (happened this session)
- User is at GATE_3 but recalls being at GATE_1 → runs `pass` → GATE_3 advances silently
- Dashboard shows GATE_2 (stale render) but state is actually at GATE_4 → `pass` advances GATE_4
- Batch scripting (copy-paste old commands) → stale command runs against wrong WP

**Missing guard:** before advancing gate G on WP W, system must verify:
- `state.current_gate == G` (intended gate matches live state)
- `state.work_package_id == W` (intended WP matches live state)
- Fail loudly with remediation hint if mismatch

---

## 2. Options Analysis

### Option A — Positional arguments (mandatory)

```bash
./pipeline_run.sh --domain tiktrack pass GATE_1 S003-P013-WP001
```

**Validation logic (bash):**
```bash
EXPECTED_GATE=$1   # "GATE_1"
EXPECTED_WP=$2     # "S003-P013-WP001"
ACTUAL_GATE=$(jq -r '.current_gate' "$STATE_FILE")
ACTUAL_WP=$(jq -r '.work_package_id' "$STATE_FILE")

if [[ "$ACTUAL_GATE" != "$EXPECTED_GATE" ]]; then
  echo "❌ GATE MISMATCH: you said $EXPECTED_GATE but state is $ACTUAL_GATE ($ACTUAL_WP)"
  echo "   Run: ./pipeline_run.sh --domain tiktrack   to see current state"
  exit 1
fi
if [[ "$ACTUAL_WP" != "$EXPECTED_WP" ]]; then
  echo "❌ WP MISMATCH: you said $EXPECTED_WP but state is $ACTUAL_WP"
  exit 1
fi
```

**Pros:** Explicit, self-documenting command, can be scripted
**Cons:** More typing; backwards-incompatible (breaks existing `./pipeline_run.sh pass` usage)
**Migration:** Could run in WARN mode (print mismatch warning but proceed) for a grace period

---

### Option B — Named flags (optional, default = validate)

```bash
./pipeline_run.sh --domain tiktrack pass --gate GATE_1 --wp S003-P013-WP001
# or shorthand:
./pipeline_run.sh --domain tiktrack pass -g GATE_1 -w S003-P013-WP001
```

Without flags: **default = skip validation** (backward compat)
With `--strict`: **require flags** (future default)

**Pros:** Non-breaking; can add `--strict` as global flag or project setting
**Cons:** Optional → humans omit it when rushed → defeats the purpose unless `--strict` is the default
**Verdict:** Weaker than Option A unless `--strict` is made the default immediately

---

### Option C — Pre-execution interactive confirm (current-state echo)

No new argument required. Before advancing, the command:
1. Reads state and echoes: `"About to advance GATE_1 (S003-P013-WP001) → PASS. Confirm? [y/N]"`
2. User types `y` to proceed

```bash
[pipeline_run] About to advance: GATE_1 | S003-P013-WP001 | PASS
[pipeline_run] State last_updated: 2026-03-22T18:05:00
[pipeline_run] Press Enter to confirm, Ctrl+C to abort.
```

**Pros:** Zero argument change; catches mismatches by human visual check
**Cons:** Adds friction to every advance; in scripted/automated contexts it blocks; requires TTY
**Best for:** High-stakes gates (GATE_6, GATE_8) rather than all gates

---

### Option D — Hybrid: always echo + optional `--confirm GATE_ID WP_ID`

```bash
# Explicit (validated + no prompt):
./pipeline_run.sh --domain tiktrack pass --confirm GATE_1 S003-P013-WP001

# Legacy (echo + prompt before advancing):
./pipeline_run.sh --domain tiktrack pass
```

When `--confirm GATE_ID WP_ID` is supplied:
- Validate gate + WP match state (hard block if mismatch)
- Skip interactive prompt
- Proceed atomically

When omitted:
- Echo current state + about-to-advance summary
- If TTY: ask "Confirm? [y/N]"
- If non-TTY (piped / scripted): proceed with WARNING

**Pros:** Backward compatible; adds validation where the user opts in; prepares for future `--strict` mode
**Cons:** Still optional → humans forget

---

## 3. Team 100 Recommendation

**Recommended: Option D (hybrid)** for immediate implementation, with a roadmap to Option A as default.

**Rationale:**
1. **Non-breaking** — existing scripts and muscle memory continue to work
2. **Adoption path** — `--confirm GATE_ID WP_ID` can be included in all future `pipeline_run.sh` instruction blocks (the ▼▼▼ blocks); users adopt it naturally
3. **Dashboard integration** — the dashboard GATE_2 "PASS command" section can pre-populate the full validated command including `--confirm GATE_2 S003-P013-WP001`
4. **Stage gate for strict mode** — once the team is comfortable, make `--confirm` required via a `settings.json` flag: `"pipeline_strict_confirm": true`

**Phased rollout:**
- Phase 1 (this WP): `--confirm GATE WP` flag added, optional, included in all generated prompts
- Phase 2 (next pipeline hardening WP): `--strict` mode default; bare `pass` emits warning + 3s countdown
- Phase 3: `--confirm` becomes mandatory; bare `pass` errors

**Dashboard integration (parallel):**
- GATE_2 prompt quick-action copy-button pre-fills: `./pipeline_run.sh --domain tiktrack pass --confirm GATE_2 S003-P013-WP001`
- Mismatch errors display in dashboard banner (pipeline emits structured JSON error → dashboard banner picks it up via passive file scan)

---

## 4. Pre-validation logic (all options)

The validation block (same for all options):

```python
# In pipeline.py or pipeline_run.sh — called before any advance_gate()
def _validate_advance_intent(domain, expected_gate, expected_wp):
    state = PipelineState.load_domain(domain)
    errors = []
    if state.current_gate != expected_gate:
        errors.append(
            f"GATE MISMATCH: requested={expected_gate} actual={state.current_gate}"
        )
    if state.work_package_id != expected_wp:
        errors.append(
            f"WP MISMATCH: requested={expected_wp} actual={state.work_package_id}"
        )
    if errors:
        for e in errors:
            print(f"❌ {e}")
        print(f"   State: {state.work_package_id} / {state.current_gate}")
        print(f"   Run:   ./pipeline_run.sh --domain {domain}   (to see live state)")
        sys.exit(1)
    print(f"✅ Confirmed: {expected_gate} / {expected_wp} — advancing")
```

---

## 5. Dashboard feedback (for both options)

When a gate advance fails validation, `pipeline_run.sh` exits non-zero. The dashboard can detect this via:
1. A `_pipeline_last_error.json` file written by `pipeline_run.sh` on validation failure
2. Passive file scan every 5s picks it up → renders a RED banner: "Gate mismatch detected — see terminal"
3. Banner auto-clears when error file is absent

---

## 6. Decision Required from Team 00

| Decision | Options |
|---|---|
| **Which option?** | A (positional), B (named optional), C (interactive), D (hybrid) — Team 100 recommends D |
| **When to implement?** | Immediate (this session) / Next hardening WP (preferred — keep current run clean) / Later |
| **Strict mode default?** | Yes (future) / No |
| **Dashboard integration?** | Yes (pre-fill command in prompts) / No |

---

**log_entry | TEAM_100 | PIPELINE_COMMAND_VALIDATION_ANALYSIS | v1.0.0 | AWAITING_DECISION | 2026-03-22**
