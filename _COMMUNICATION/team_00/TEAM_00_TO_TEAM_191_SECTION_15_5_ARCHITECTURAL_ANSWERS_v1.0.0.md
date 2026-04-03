---
**project_domain:** AGENTS_OS
**id:** TEAM_00_TO_TEAM_191_SECTION_15_5_ARCHITECTURAL_ANSWERS_v1.0.0
**from:** Team 00 (Nimrod — System Designer)
**to:** Team 191
**date:** 2026-03-29
**historical_record:** true
**status:** DECISIONS_ISSUED
**context:** Response to Team 191 §15.5 open questions (plan file team_191_§15.4–15.5_0bf3d05f)
---

# §15.5 — Architectural Answers: Active-Run Commit Convention

## Q1: Advisory-only hook vs. blocking hook?

**Decision: Advisory-only (non-blocking) — `prepare-commit-msg` hook.**

A blocking `commit-msg` hook that rejects commits without `[run: ...]` is too aggressive:
- CI pipelines, automated commits, and non-run-related hotfixes would need exemptions
- False-positive rate would be high (most commits don't touch `agents_os_v3/` during an active run)

**Approved implementation:**
```bash
# .git/hooks/prepare-commit-msg (advisory — prepends suggestion, never blocks)
# If AOS_V3_DATABASE_URL is set AND /api/state returns IN_PROGRESS domain, suggest suffix.
# Operator may delete the suggestion line before confirming.
```
This is a **local-only** hook, not committed to `.pre-commit-config.yaml`. Team 191 may implement it as an opt-in developer convenience tool.

---

## Q2: Blocking enforcement only when active run detected — source of truth?

**Decision: pipeline_state.json (local file) is the source of truth for hook-time detection.**

Rationale:
- `GET /api/state` requires a running server — not guaranteed at commit time
- `pipeline_state.json` is always present locally (synced by pipeline_run.sh)
- CI has no local pipeline_state.json → hook silently skips → zero false positives in CI

**Canonical path:** `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` (tiktrack domain).

**Logic:**
```bash
# In the hook: read pipeline_state_tiktrack.json
# If .status == "IN_PROGRESS" or "CORRECTION" or "PAUSED": suggest [run: <run_id[:8]>]
# Else: skip silently
```

**False-positive guard:** if the file is missing or malformed → skip silently (never block).

---

## Q3: Does `[run: …]` apply to non-IN_PROGRESS commits?

**Decision: No — only IN_PROGRESS, CORRECTION, and PAUSED states.**

- `COMPLETE`, `IDLE`, `null` → no suffix required
- Infrastructure fixes, tooling, governance docs → no suffix required even if a run is active in a different domain
- Scope: only commits that touch `agents_os_v3/` while the **tiktrack** domain has an active run

---

## Q4: Priority between §11 Process-ID Title Lock and `[run: …]`?

**Decision: §11 Process-ID comes FIRST (prefix), `[run: …]` comes LAST (suffix).**

**Canonical format:**
```
<PROCESS_ID>: <description> [run: <run_id_prefix_8>]
```

**Example:**
```
S003_P005_GATE_0: AOS v3 fix domain slug resolution [run: 01KMX6Q8]
```

- If no PROCESS_ID detected: `TEAM_191_FLOW: <description> [run: <run_id_prefix_8>]`
- `[run: ...]` is always the **last token** in the subject line
- Space before `[` is mandatory

---

## Q5: Recommended helper script?

**Approved — Team 191 may implement:**

```bash
# scripts/suggest_run_suffix.sh
# Outputs: [run: XXXXXXXX] based on local pipeline_state or GET /api/state
# Usage: git commit -m "$(your message) $(bash scripts/suggest_run_suffix.sh)"
STATE_FILE="_COMMUNICATION/agents_os/pipeline_state_tiktrack.json"
if [[ -f "$STATE_FILE" ]]; then
  RUN_ID=$(python3 -c "import json; d=json.load(open('$STATE_FILE')); print(d.get('run_id','')[:8])" 2>/dev/null)
  STATUS=$(python3 -c "import json; d=json.load(open('$STATE_FILE')); print(d.get('status',''))" 2>/dev/null)
  if [[ "$STATUS" =~ ^(IN_PROGRESS|CORRECTION|PAUSED)$ && -n "$RUN_ID" ]]; then
    echo "[run: $RUN_ID]"
  fi
fi
```

---

## Summary Table

| Question | Decision |
|---|---|
| Hook type | Advisory (`prepare-commit-msg`), never blocking |
| Source of truth | `pipeline_state_tiktrack.json` (local file) |
| CI behavior | Silent skip (file absent → no action) |
| Applicable states | IN_PROGRESS, CORRECTION, PAUSED only |
| Subject line order | `<PROCESS_ID>: <desc> [run: <8chars>]` |
| Helper script | Approved for Team 191 opt-in implementation |

---

**log_entry | TEAM_00 | SECTION_15_5_ANSWERS | ISSUED | 2026-03-29**

historical_record: true
