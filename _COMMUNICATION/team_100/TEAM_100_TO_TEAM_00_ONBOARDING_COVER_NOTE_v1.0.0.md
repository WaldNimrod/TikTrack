---
**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**id:** TEAM_100_TO_TEAM_00_ONBOARDING_COVER_NOTE_v1.0.0
**from:** Team 100 (Development Architecture Authority)
**to:** Team 00 (Chief Architect — Claude Code Session)
**date:** 2026-02-25
**status:** ACTIVE
**purpose:** Formal routing notice for Team 00 onboarding package — lists all files created, reading order, and next steps
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | SHARED |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | N/A |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | SHARED |

---

# TEAM 100 → TEAM 00 — ONBOARDING COVER NOTE v1.0.0

---

## Purpose

This document is the formal routing notice for the Team 00 (Chief Architect) onboarding package. It confirms what was created, in what location, and in what order Team 00 should engage the materials.

This package was produced at Nimrod's request to support the transition of the Chief Architect function from Google Gemini (online session, no file access) to Claude Code (local, full repository access). All files were created on 2026-02-25.

---

## Onboarding Package — Complete File Manifest

### A. Team 00 Working Folder (`_COMMUNICATION/team_00/`)

| # | File | Purpose |
|---|---|---|
| 1 | `TEAM_00_CONSTITUTION_v1.0.0.md` | Canonical identity, authority scope, 8 Iron Rules, gate authority, team interfaces, writing rules, product vision — **read every session** |
| 2 | `TEAM_00_ACTIVATION_PROMPT_v1.0.0.md` | Full onboarding prompt for new Claude Code sessions — startup checklist, current state, portfolio, pending decisions, how to issue decisions |
| 3 | `TEAM_00_DOCUMENT_PRIORITY_MAP_v1.0.0.md` | Tiered document map: what to read first, second, in which session contexts — 88+ files organized by tier |
| 4 | `TEAM_00_CURRENT_STATE_BRIEFING_v1.0.0.md` | Snapshot (2026-02-25): WSM state, S001 closure, S002-P001 GATE_1 blocked, S001-P002 HOLD, open decision points |

### B. Repository Root

| # | File | Purpose |
|---|---|---|
| 5 | `CLAUDE.md` | Auto-loaded system prompt for every Claude Code session — identity lock, 3 mandatory reads, writing authority, gate authority summary, pointer to full package |

### C. Team 100 Folder (`_COMMUNICATION/team_100/`)

| # | File | Purpose |
|---|---|---|
| 6 | `TEAM_100_TO_PREV_TEAM_00_KNOWLEDGE_EXTRACTION_REQUEST_v1.0.0.md` | Structured questionnaire (8 sections) for Nimrod to paste into the active Gemini session — extracts all undocumented strategic knowledge before Gemini context window closes |
| 7 | `TEAM_100_TO_TEAM_00_ONBOARDING_COVER_NOTE_v1.0.0.md` | This document — formal routing notice and reading guide |

**Total: 7 files across 3 locations.**

---

## Recommended Activation Sequence

### Phase 1 — Knowledge Extraction (Do First, While Gemini is Active)

```
Step 1: Open the Gemini session that holds Phoenix conversation history
Step 2: Paste the full contents of:
        _COMMUNICATION/team_100/TEAM_100_TO_PREV_TEAM_00_KNOWLEDGE_EXTRACTION_REQUEST_v1.0.0.md
Step 3: Collect Gemini's responses to all 8 sections
Step 4: Save responses to:
        _COMMUNICATION/team_00/TEAM_00_GEMINI_KNOWLEDGE_EXTRACTION_RESPONSES_v1.0.0.md
        (Team 00 will formalize undocumented decisions into ADRs from this file)
```

**Why first:** Once the Gemini context window is lost, this knowledge cannot be recovered. All strategic decisions discussed verbally with the previous Architect are at risk.

### Phase 2 — Claude Code Activation (Team 00 New Session)

```
Step 1: Open a new Claude Code session in this repository
        (CLAUDE.md auto-loads — Team 00 identity is locked immediately)
Step 2: Read CLAUDE.md (auto-loaded — confirms identity)
Step 3: Read _COMMUNICATION/team_00/TEAM_00_ACTIVATION_PROMPT_v1.0.0.md
        (Full onboarding — 8 sections, current state, pending decisions)
Step 4: Follow the Session Startup Checklist (§1 of the Activation Prompt):
        → Read WSM live state
        → Read Constitution
        → Check inbox
        → Read Current State Briefing
        → Read relevant program documents if active program changed
Step 5: Review Gemini extraction responses (if collected) and formalize as needed
```

---

## Active Decision Points Awaiting Team 00

Upon activation, Team 00 has the following open decisions:

| Priority | Decision | Status |
|---|---|---|
| 🔴 HIGH | **GATE_2 approval — S002-P001** | Pending GATE_1 PASS by Team 170 (currently remediating BF-G1-01, BF-G1-02) |
| 🔴 HIGH | **S001-P002 Alerts POC activation** | Execution lock released; strategic timing decision required |
| 🟡 MEDIUM | **S002 strategic alignment (D22, D23)** | Confirm scope still matches product vision before GATE_2 |
| 🟡 MEDIUM | **S003–S006 sequencing guidance** | Any priority, timeline, or dependency updates |
| 🟢 LOW | **Gemini knowledge formalization** | Once extraction responses received, formalize undocumented decisions |

---

## Current Operational State (Snapshot — 2026-02-25)

| Field | Value |
|---|---|
| active_stage_id | S002 |
| active_program_id | S002-P001 — Agents_OS Core Validation Engine |
| current_gate | GATE_1 |
| active_flow | GATE_1_BLOCKED — LLD400 returned to Team 170 for remediation |
| next_responsible_team | Team 170 (remediation) → Team 190 (revalidation) → Team 00 (GATE_2) |

**Live state always in:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`

---

## Notes

1. **Files read directly:** Team 00 in Claude Code can read any file directly. No need to rely on summaries or context — always verify from canonical files.

2. **Writing boundary:** Team 00 writes only to `_COMMUNICATION/team_00/` and `_COMMUNICATION/_Architects_Decisions/`. Team 100 will never write to team_00/ — this folder belongs exclusively to Team 00.

3. **Decision template:** When Team 00 issues locked decisions, use the canonical template at `documentation/docs-governance/06-TEMPLATES/ARCHITECT_DECISION_TEMPLATE.md`.

4. **Version note:** These onboarding files are v1.0.0 snapshots as of 2026-02-25. As the project evolves, Team 100 will issue updated briefings as needed.

---

**log_entry | TEAM_100 | TEAM_100_TO_TEAM_00_ONBOARDING_COVER_NOTE_v1.0.0_CREATED | 2026-02-25**
