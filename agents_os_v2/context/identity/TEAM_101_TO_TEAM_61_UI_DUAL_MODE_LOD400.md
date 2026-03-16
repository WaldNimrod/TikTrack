---
project_domain: SHARED
id: TEAM_101_TO_TEAM_61_UI_DUAL_MODE_LOD400
from: Team 101 (IDE Architecture)
to: Team 61 (Execution)
cc: Team 00
date: 2026-03-16
status: APPROVED_FOR_EXECUTION
---

# ═══════════════════════════════════════════
# TEAM 61 ACTIVATION & LOD400 SPECIFICATION
# Dual-Mode Context Injection & Team 101 UI
# ═══════════════════════════════════════════

<SYSTEM_ACTIVATION>
You are Team 61 (AOS Local Cursor Implementation).
Your mandate is to strictly implement the following LOD400 spec.
Iron Rule: Classic `<script src>` only — no ES modules. Do not modify backend Python files.
</SYSTEM_ACTIVATION>

## 1. Objective
Update the Team Management UI to formally register `Team 101` and introduce a "Dual-Mode Context Injection" mechanism for generating prompts. 
Target Files: `@PIPELINE_TEAMS.html` and `@pipeline-teams.js`

## 2. Requirements & Logic

### 2.1 UI Layout Modifications (`PIPELINE_TEAMS.html` or JS DOM)
1. Add `Team 101 (IDE Architecture)` to the list of available teams.
2. In the "Team Detail / Prompt Generator" panel, replace the single "Copy Prompt" button with two distinct action buttons side-by-side:
   - **Button A (Primary):** "Copy RAG Prompt (Mentions)"
   - **Button B (Secondary):** "Copy Hard-Injection Prompt" (legacy behavior)

### 2.2 Data Structure Update (`pipeline-teams.js`)
Update the `TEAMS` array to include Team 101.
- **id:** `team_101`
- **group:** `architects`
- **label:** `Team 101`
- **name:** `IDE Architecture Authority`
- **engine:** `cursor`
- **domain:** `multi`
- **role:** `Planner, Spec-Writer, and Approver for IDE parallel tracks.`
- **responsibilities:** `["Analyze local codebase", "Generate canonical Specs (LOD400)", "Validate Team 61 work post-execution"]`
- **writesTo:** `["../../_COMMUNICATION/team_101/"]`
- **governedBy:** `["team_101.md", "SSM v1.0.0"]`

### 2.3 Prompt Generation Logic (`pipeline-teams.js`)
Refactor `generatePrompt()` or `buildPrompt()` to accept an `injectionMode` parameter (`'rag'` | `'hard'`).

**For `rag` mode:** Return exactly this template format:
`@team_[ID].md @STATE_SNAPSHOT.json @PHOENIX_MASTER_WSM_v1.0.0.md`
`You are [Team Name]. Read your identity file and establish your rules.`
`Current state is in @STATE_SNAPSHOT.json.`
`Operational state is in @PHOENIX_MASTER_WSM_v1.0.0.md.`

**For `hard` mode:** Maintain existing concatenation behavior.

**Execution:** Proceed with changes and request QA validation (Team 51 / Nimrod check) upon completion.