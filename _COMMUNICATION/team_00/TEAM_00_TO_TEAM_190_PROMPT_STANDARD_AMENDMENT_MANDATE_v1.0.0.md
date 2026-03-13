---
**id:** TEAM_00_TO_TEAM_190_PROMPT_STANDARD_AMENDMENT_MANDATE_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 190 (Constitutional Architectural Validator)
**date:** 2026-03-13
**status:** ACTION_REQUIRED
**gate_id:** N/A (governance amendment — cross-program)
**work_package_id:** N/A
**domain:** SHARED (Agents_OS + TikTrack)
---

# TEAM_00 TO TEAM_190 — Prompt Standard Amendment Mandate

## 1) Purpose

This mandate authorizes and requires Team 190 to update the canonical governance documentation to reflect a new **Agent Prompt Identity Stamp Standard** that replaces the old `CONTEXT_RESET` pattern. This is a governance-level change — Team 190 must document it as an enforceable standard.

The code-level implementation is complete (done by Team 100). This mandate covers the documentation and governance enforcement side only.

---

## 2) Background — Why This Change

**The problem:** The old `TEAM_XX_CONTEXT_RESET` pattern caused two issues:
1. In continuing sessions, it signaled the agent to "forget" prior context — counterproductive when the agent has already accumulated useful working context
2. Verbose full identity re-injection at every gate was wasteful (~200-400 tokens per prompt, recurring at every gate call)

**The solution:** A lean **Identity Stamp** (~40 tokens) that:
- Anchors the active team, gate, WP, stage, and date at the TOP of every prompt
- Does NOT erase prior context (no "RESET" instruction)
- For new sessions: a `--fresh` flag prepends the full team constitution
- Satisfies governance traceability (team + gate + WP visible in every artifact)

**New format:**
```
**ACTIVE: TEAM_90 (Dev-Validator)**  gate=G3_5 | wp=S001-P002-WP001 | stage=S001 | 2026-03-13
```

**Distinction — two formats, two contexts:**

| Artifact type | Format | Unchanged? |
|---|---|---|
| **Inter-team governance documents** (messages, decisions, reports) | Full canonical format (metadata block + identity header table + §1-§6 sections) | ✅ UNCHANGED |
| **Agent activation prompts** (pasted into Cursor/Codex/Claude sessions) | New lean Identity Stamp | 🔄 THIS MANDATE |

The canonical message format for governance documents (Team 190's existing standard) is NOT changed.

---

## 3) Required Actions

1. **Locate** all governance documents that reference `CONTEXT_RESET` or prescribe the old opening line format for agent prompts. Specifically:
   - `_COMMUNICATION/team_190/TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0.md`
   - Any team runbooks or protocols in `documentation/docs-governance/` that mention `CONTEXT_RESET`
   - `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md`

2. **Create a formal Amendment document** (new file, do not modify original):
   - Path: `_COMMUNICATION/team_190/TEAM_190_PROMPT_STANDARD_AMENDMENT_v1.0.0.md`
   - Content: Define the new Identity Stamp Standard with the exact format, usage rules, and when to use `--fresh`

3. **Add a cross-reference** in `TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0.md`:
   - Add a note at the bottom pointing to the Amendment document
   - Do NOT rewrite the original document

4. **Search for** any team constitutions (`_COMMUNICATION/team_*/TEAM_XX_CONSTITUTION_v*.md`) that instruct the agent to use `CONTEXT_RESET`. If found, note them in your validation report — Team 00 will handle those updates separately.

5. **Do NOT** modify agents_os_v2 source code — code changes are complete.

---

## 4) Deliverables and Paths

1. New amendment file:
   `_COMMUNICATION/team_190/TEAM_190_PROMPT_STANDARD_AMENDMENT_v1.0.0.md`

2. Validation report with findings (list of files that reference old pattern):
   `_COMMUNICATION/team_190/TEAM_190_PROMPT_STANDARD_VALIDATION_REPORT_v1.0.0.md`

---

## 5) Amendment Document — Required Content

The Amendment document MUST define:

### 5.1 Standard Name
**Agent Prompt Identity Stamp Standard v1.0.0** (supersedes CONTEXT_RESET pattern)

### 5.2 Mandatory Opening Line — All Agent Prompts
```
**ACTIVE: TEAM_XX (Role)**  gate=GATE_NAME | wp=WP_ID | stage=STAGE_ID | YYYY-MM-DD
```

Role values:
- team_10 → Gateway
- team_20 → API-Verify
- team_30 → Frontend
- team_50 → QA
- team_90 → Dev-Validator
- team_100 → Arch-Authority
- team_170 → Spec-Author
- team_190 → Constitutional-Validator

### 5.3 Session Type Rules

| Session type | What to include |
|---|---|
| **Continuing session** (agent was already active) | Lean stamp only |
| **New session** (fresh Cursor/Codex window) | Full team constitution + lean stamp |

For automated pipeline: use `--fresh` flag on first invocation per session.

### 5.4 What this Standard Does NOT Change
- Full canonical format for inter-team governance documents (messages, decisions, ADRs)
- Team identity files (`context/identity/team_XX.md`)
- Gate protocol requirements

### 5.5 Enforcement
Non-compliant prompts (using old CONTEXT_RESET line) should be flagged by Team 190 with `FORMAT_DEPRECATION_WARNING` (not BLOCK — backward compatible transition period until 2026-04-01).

---

## 6) Response Required

Return to: `_COMMUNICATION/team_00/` (or `_COMMUNICATION/_ARCHITECT_INBOX/`)

Response format:
- `MANDATE_COMPLETE` or `MANDATE_BLOCKED`
- List of files updated/created
- List of files found with old CONTEXT_RESET pattern (for Team 00 follow-up)
- Any questions or blockers

---

**log_entry | TEAM_00 | PROMPT_STANDARD_AMENDMENT_MANDATE | ACTION_REQUIRED | 2026-03-13**
