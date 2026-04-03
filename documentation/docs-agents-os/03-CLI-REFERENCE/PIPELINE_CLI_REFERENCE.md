# Pipeline CLI Reference
## documentation/docs-agents-os/03-CLI-REFERENCE/PIPELINE_CLI_REFERENCE.md

**project_domain:** AGENTS_OS  
**owner:** Team 170  
**date:** 2026-03-14  
**source:** `pipeline_run.sh` (repo root)

---

## Overview

`pipeline_run.sh` is the primary CLI for the Agents_OS V2 pipeline. It wraps `python3 -m agents_os_v2.orchestrator.pipeline` and provides a terminal-friendly interface for gate management, prompt generation, and routing.

**Domain support:** Use `--domain tiktrack` or `--domain agents_os` for parallel pipelines. Default: auto-detect from state file.

---

## Subcommands

### next (default)

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh` or `./pipeline_run.sh next` |
| **When to use** | At start of gate work; to generate and display the current gate prompt |
| **What it does** | Runs `--status`, generates prompt for current gate via `--generate-prompt`, displays it with ▼▼▼ markers |
| **Output** | Pipeline status + full prompt block ready to paste into AI (Codex/Claude/Cursor) |
| **Example** | `./pipeline_run.sh --domain agents_os` |
| **Next step** | Paste prompt into AI → complete gate work → `./pipeline_run.sh pass` |

---

### pass

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh pass` |
| **When to use** | After AI (or human) completes the current gate successfully |
| **What it does** | Advances current gate → PASS; moves to next gate; displays next gate prompt (or approve guidance for WAITING_* gates) |
| **Output** | `[pipeline_run] Advancing GATE_X → PASS` + next gate prompt or "run ./pipeline_run.sh approve" |
| **Example** | `./pipeline_run.sh --domain tiktrack pass` |
| **Next step** | If WAITING_GATE2_APPROVAL / WAITING_GATE6_APPROVAL / GATE_7: run `./pipeline_run.sh approve`. Else: paste next prompt into AI. |

---

### fail

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh fail "<reason>"` |
| **When to use** | When gate work results in FAIL (validation, review, QA) |
| **What it does** | Records FAIL with reason; applies auto-routing if verdict has `route_recommendation`, else shows manual routing options |
| **Output** | Either: AUTO-ROUTED message + next prompt; or CORRECTION CYCLE prompt (self-loop gates); or MANUAL ROUTING REQUIRED with `route doc|full` instructions |
| **Example** | `./pipeline_run.sh fail "BLOCKER-1: LLD400 section 4 missing"` |
| **Next step** | If auto-routed: follow prompt. If manual: `./pipeline_run.sh route doc "notes"` or `./pipeline_run.sh route full "notes"`. If G3_PLAN: `./pipeline_run.sh revise "..."` |

---

### approve

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh approve` |
| **When to use** | After human review of GATE_2, GATE_6, or GATE_7 — Nimrod/architect approves |
| **What it does** | Maps WAITING_GATE2_APPROVAL → GATE_2, WAITING_GATE6_APPROVAL → GATE_6, and records approval; advances to next gate |
| **Output** | Approval message + next gate prompt |
| **Example** | `./pipeline_run.sh approve` |
| **Next step** | Paste next prompt or continue gate work |

---

### status

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh status` |
| **When to use** | Check current pipeline state without generating a prompt |
| **What it does** | Prints WP, stage, gate, owner, spec_brief, last_updated |
| **Output** | Single-line or short status block |
| **Example** | `./pipeline_run.sh --domain agents_os status` |
| **Next step** | Use with `next` or `gate NAME` to generate prompt |

---

### gate

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh gate GATE_NAME` |
| **When to use** | Override: generate prompt for a specific gate (e.g. GATE_0, G3_PLAN) instead of current |
| **What it does** | Generates and displays prompt for the given gate |
| **Output** | Prompt block with ▼▼▼ markers |
| **Example** | `./pipeline_run.sh gate GATE_0` |
| **Next step** | Paste prompt into AI; advance with `pass` when ready |

---

### route

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh route doc\|full [notes] [GATE_NAME]` |
| **When to use** | Manual routing after FAIL when verdict file lacks `route_recommendation` |
| **What it does** | Applies doc (quick fix) or full (full cycle) route for current (or specified) gate |
| **Output** | Routing confirmation + next gate prompt or revise instruction |
| **Example** | `./pipeline_run.sh route doc "LLD400 section 4 missing"` |
| **Next step** | If G3_PLAN: `./pipeline_run.sh revise "..."`; else paste next prompt |

---

### revise

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh revise "blocker notes" [work_plan_file_path]` |
| **When to use** | After G3_5 FAIL — regenerate G3_PLAN prompt with revision context |
| **What it does** | Optionally stores work plan artifact; generates G3_PLAN revision prompt with blocker notes |
| **Output** | Revision prompt block |
| **Example** | `./pipeline_run.sh revise "BLOCKER-1: Scope unclear" _COMMUNICATION/team_10/TEAM_10_..._v1.1.0.md` |
| **Next step** | Paste prompt into Cursor → Team 10 fixes → `./pipeline_run.sh pass` |

---

### store

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh store GATE_NAME path/to/file.md` |
| **When to use** | Store an artifact file path into pipeline state for a gate |
| **What it does** | Calls `--store-artifact` to register the file with the gate |
| **Output** | Confirmation message |
| **Example** | `./pipeline_run.sh store G3_PLAN _COMMUNICATION/team_10/TEAM_10_S002_P005_WP001_G3_PLAN_v1.0.0.md` |
| **Next step** | Continue gate workflow |

---

### domain

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh domain` |
| **When to use** | See status of both tiktrack and agents_os pipelines |
| **What it does** | Prints WP, Gate, Updated for each domain |
| **Output** | Two-panel status + command hints |
| **Example** | `./pipeline_run.sh domain` |
| **Next step** | Use `--domain tiktrack` or `--domain agents_os` with other commands |

---

### phase&lt;N&gt;

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh phase2`, `./pipeline_run.sh phase3`, etc. |
| **When to use** | After Phase N-1 team completes — show only Phase N mandate for handoff |
| **What it does** | Regenerates mandates for current gate; extracts Phase N section from mandate file; displays it |
| **Output** | Phase N mandate block with ▼▼▼ markers |
| **Example** | `./pipeline_run.sh phase2` |
| **Next step** | Paste Phase N mandate to next team; when done: `./pipeline_run.sh phase3` or `./pipeline_run.sh pass` (final phase) |

---

### pass_with_actions

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh pass_with_actions "a1\|a2\|a3"` |
| **When to use** | S002-P005-WP002: Gate passes but with pending actions — record and hold |
| **What it does** | Records PASS_WITH_ACTION with pipe-separated action IDs; holds gate until `actions_clear` |
| **Output** | Confirmation + action list displayed |
| **Example** | `./pipeline_run.sh pass_with_actions "a1|a2"` |
| **Next step** | Resolve actions → `./pipeline_run.sh actions_clear` |

---

### actions_clear

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh actions_clear` |
| **When to use** | After all PASS_WITH_ACTION items are resolved |
| **What it does** | Clears action list; advances to next gate |
| **Output** | Next gate prompt |
| **Example** | `./pipeline_run.sh actions_clear` |

---

### override

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh override "reason text"` |
| **When to use** | Human decision to override gate and advance (e.g. verdict unavailable) |
| **What it does** | Records override reason; advances to next gate |
| **Output** | Confirmation + next gate prompt |
| **Example** | `./pipeline_run.sh override "Verdict file delayed — Nimrod approval"` |

---

### insist

| Field | Content |
|-------|---------|
| **Usage** | `./pipeline_run.sh insist` |
| **When to use** | Stay at current gate — regenerate correction prompt (no advance) |
| **What it does** | Calls `--insist`; displays same-gate prompt for re-work |
| **Output** | Correction prompt block |
| **Example** | `./pipeline_run.sh insist` |

---

## Domain Flag

| Flag | Effect |
|------|--------|
| `--domain tiktrack` | Use TikTrack pipeline state |
| `--domain agents_os` | Use Agents_OS pipeline state |
| (none) | Auto-detect from existing state file |

**Env-var alternative:** `PIPELINE_DOMAIN=tiktrack ./pipeline_run.sh pass`

---

## Visual Markers

Prompt blocks use:
- `▼▼▼` — start of prompt (paste from here)
- `▲▲▲` — end of prompt (paste until here)

---

## Idea Pipeline Intake (Human Command)

Uniform trigger accepted by all teams:

```text
**רעיון חדש**
<human explanation of the idea and desired outcome>
**סוף רעיון חדש**
```

Required team flow:
1. Create a structured draft from the text (`title`, `domain`, `urgency`, `reference`, `notes`).
2. Return the draft to Nimrod for approval.
3. After approval only, run:

```bash
./idea_submit.sh \
  --title "..." \
  --domain agents_os|tiktrack|shared \
  --urgency critical|high|medium|low \
  --team team_XX \
  --reference "_COMMUNICATION/path/to/context.md" \
  --notes "..."
```

4. Return `IDEA-XXX` and the reference path.
5. If environment or domain is unclear, stop and ask Nimrod before submission.

---

**log_entry | TEAM_170 | PIPELINE_CLI_REFERENCE | DELIVERED | 2026-03-14**
