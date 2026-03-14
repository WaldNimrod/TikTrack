# agents_os_v2 Pipeline — How To Use

**TL;DR:** `./pipeline_run.sh` → copy ▼▼▼ block → paste into AI → `./pipeline_run.sh pass`

---

## Setup

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
chmod +x pipeline_run.sh   # once only
```

---

## Starting a New Pipeline

```bash
python3 -m agents_os_v2.orchestrator.pipeline \
  --spec "your feature spec here" \
  --stage S001 \
  --wp S001-P002-WP001
```

Then run `./pipeline_run.sh` to begin.

---

## Normal Gate Cycle (3 steps, repeat per gate)

**Step 1 — Generate prompt:**
```bash
./pipeline_run.sh
```
This shows:
```
▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
  PASTE INTO AI:  G3_PLAN  →  cursor | owner: team_10
  File: _COMMUNICATION/agents_os/prompts/G3_PLAN_prompt.md
▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
[... prompt content ...]
▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  END OF PROMPT  →  After AI responds: ./pipeline_run.sh pass
▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
```

**Step 2 — Paste into AI:**
Copy everything between ▼▼▼ and ▲▲▲ → paste into the tool shown (`cursor`, `codex`, `claude`).

**Step 3 — Advance:**
```bash
./pipeline_run.sh pass     # on PASS
./pipeline_run.sh fail "reason"   # on FAIL
```
This automatically generates the next gate's prompt.

---

## Human Approval Gates (GATE_2, GATE_6, GATE_7)

These gates pause for Nimrod's manual review.

```bash
./pipeline_run.sh approve   # after you review and approve
```

For GATE_7: open http://localhost:8080, review the feature, then run approve.

---

## Handling FAIL — Revision Cycle (G3_5 FAIL → G3_PLAN REVISION)

When G3_5 returns FAIL:

1. Store the work plan artifact:
```bash
./pipeline_run.sh store G3_PLAN _COMMUNICATION/team_10/TEAM_10_..._v1.1.0.md
```

2. Generate revision prompt with blockers + display:
```bash
./pipeline_run.sh revise "BLOCKER-1: ... BLOCKER-2: ..."
# If you want to store + revise in one step:
./pipeline_run.sh revise "BLOCKER-1: ... BLOCKER-2: ..." _COMMUNICATION/team_10/TEAM_10_..._v1.1.0.md
```

3. Paste the ▼▼▼ block into Cursor → Team 10 fixes the plan

4. After Team 10 produces v1.2.0, store + advance G3_5:
```bash
./pipeline_run.sh store G3_PLAN _COMMUNICATION/team_10/TEAM_10_..._v1.2.0.md
./pipeline_run.sh pass   # advances G3_5 → PASS → next gate
```

---

## All Commands

| Command | What it does |
|---|---|
| `./pipeline_run.sh` | Generate current gate prompt + display ▼▼▼ block |
| `./pipeline_run.sh pass` | Advance PASS → auto-generate next gate |
| `./pipeline_run.sh fail "reason"` | Advance FAIL with reason |
| `./pipeline_run.sh approve` | Approve human-authority gate |
| `./pipeline_run.sh status` | Show current state |
| `./pipeline_run.sh gate GATE_NAME` | Generate prompt for a specific gate |
| `./pipeline_run.sh revise "notes" [file]` | G3_5 FAIL revision: store + generate G3_PLAN revision prompt |
| `./pipeline_run.sh store GATE file.md` | Store artifact content into pipeline state |

---

## Gate Sequence

```
GATE_0  → Team 190 validates scope
GATE_1  → Team 170 + 190: LLD400
GATE_2  → Team 100: approve spec   [human: ./pipeline_run.sh approve]
G3_PLAN → Team 10: work plan (Cursor)
G3_5    → Team 90: validate work plan (Codex)
G3_6_MANDATES → Team 10: generate per-team mandates (auto)
CURSOR_IMPLEMENTATION → Teams 20+30: implement (Cursor)
GATE_4  → Team 50: QA (Cursor + MCP)
GATE_5  → Team 90: dev validation (Codex)
GATE_6  → Team 90+100: review   [human: ./pipeline_run.sh approve]
GATE_7  → Nimrod: UX review    [human: ./pipeline_run.sh approve]
GATE_8  → Team 90+70: docs closure
```

---

## Where Prompts Are Saved

All generated prompts: `_COMMUNICATION/agents_os/prompts/{GATE_NAME}_prompt.md`

You can always re-read the last generated prompt:
```bash
cat _COMMUNICATION/agents_os/prompts/G3_PLAN_prompt.md
```

---

---

## 🔍 Progress Check (Dashboard Diagnostic)

Press **🔍 בדוק התקדמות** in the dashboard header (or press `p`) to run a full diagnostic.

The progress check shows:
1. **Full Pipeline Overview** — all 14 gates with current status (active/pass/fail/pending)
2. **Current Gate Analysis** — owner, engine, scope description, FAIL cycle history
3. **Sub-step analysis** — for multi-step gates (CURSOR_IMPLEMENTATION, GATE_4): file-level status
4. **PASS / FAIL guidance** — for all gates, including explicit two-path display for validation gates (G3_5, GATE_5)
5. **FAIL cycle detection** — automatically detects revision mode (e.g. G3_5 FAIL → G3_PLAN revision) and shows the correct command

Use this whenever you're unsure what to do next, or when the auto-refresh doesn't reflect what you expect.

---

## 🗺️ Roadmap & Gate History Page

Open `agents_os/ui/PIPELINE_ROADMAP.html` (link at bottom of main dashboard) for:

- **Portfolio roadmap tree** — stages → programs, with active program highlighted and hierarchy validation
- **Full gate sequence table** — all 14 gates with status pills
- **Gate history** — ordered pass/fail history

---

## Handling FAIL — GATE_5 Dev Validation (Team 90)

When GATE_5 returns FAIL (Team 90 finds code compliance issues):

```bash
./pipeline_run.sh fail "FINDING-1: ... FINDING-2: ..."
```

Then route findings to Team 10 for code fixes → re-run CURSOR_IMPLEMENTATION → GATE_4 → GATE_5.

---

## Deeper Documentation

- Full experiment execution guide: `_COMMUNICATION/team_00/TEAM_00_S001_P002_WP001_EXPERIMENT_EXECUTION_GUIDE_v1.0.0.md`
- Pipeline CLI source: `agents_os_v2/orchestrator/pipeline.py`
- Pipeline state: `_COMMUNICATION/agents_os/pipeline_state.json`
- Roadmap & Gate History: `agents_os/ui/PIPELINE_ROADMAP.html` (serve from repo root: `./agents_os/scripts/start_ui_server.sh` or `python3 -m http.server 7070`)
