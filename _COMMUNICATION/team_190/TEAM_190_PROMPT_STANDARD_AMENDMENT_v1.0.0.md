---
**project_domain:** SHARED (AGENTS_OS + TIKTRACK)
**id:** TEAM_190_PROMPT_STANDARD_AMENDMENT_v1.0.0
**from:** Team 190 (Constitutional Architectural Validator)
**to:** ALL TEAMS
**date:** 2026-03-13
**status:** ENFORCED
**gate_id:** N/A (governance amendment — cross-program)
**in_response_to:** TEAM_00_TO_TEAM_190_PROMPT_STANDARD_AMENDMENT_MANDATE_v1.0.0.md
---

# TEAM_190 — Agent Prompt Identity Stamp Standard v1.0.0

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | N/A (cross-program governance) |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | N/A |
| phase_owner | Team 190 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## Amendment Authority

This document supersedes the `CONTEXT_RESET` pattern for **agent activation prompts** only.
Issued by Team 190 pursuant to Team 00 mandate: `TEAM_00_TO_TEAM_190_PROMPT_STANDARD_AMENDMENT_MANDATE_v1.0.0.md`.

The canonical message format for inter-team governance documents (`TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0.md`) is **unchanged**.

---

## § 1 — Standard Name

**Agent Prompt Identity Stamp Standard v1.0.0**
Supersedes: `CONTEXT_RESET` pattern (all forms)

---

## § 2 — Mandatory Opening Line — All Agent Activation Prompts

Every agent activation prompt (pasted into Cursor / Codex / Claude sessions) MUST begin with this line as the first line of the prompt:

```
**ACTIVE: TEAM_XX (Role)**  gate=GATE_NAME | wp=WP_ID | stage=STAGE_ID | YYYY-MM-DD
```

### Role Values (Canonical)

| team_id | Role |
|---|---|
| team_10 | Gateway |
| team_20 | API-Verify |
| team_30 | Frontend |
| team_50 | QA |
| team_90 | Dev-Validator |
| team_100 | Arch-Authority |
| team_170 | Spec-Author |
| team_190 | Constitutional-Validator |

### Example

```
**ACTIVE: TEAM_90 (Dev-Validator)**  gate=G3_5 | wp=S001-P002-WP001 | stage=S001 | 2026-03-13
```

---

## § 3 — Session Type Rules

| Session type | What to include |
|---|---|
| **Continuing session** (agent was already active in the same window) | Lean Identity Stamp only (~40 tokens) |
| **New session** (fresh Cursor / Codex / Claude window) | Full team constitution + lean Identity Stamp |

For automated pipeline (`agents_os_v2`): use `--fresh` flag on the first invocation of a new session.

### Rationale

- **Continuing session:** The agent already has accumulated working context. Prepending the lean stamp anchors team/gate/WP/date without discarding prior context.
- **New session:** The agent has no prior context. Full constitution provides role, iron rules, and governance anchors. The lean stamp then pins the active task coordinates.

---

## § 4 — What This Standard Does NOT Change

The following are unaffected by this amendment:

1. **Inter-team governance documents** (messages, decisions, reports, ADRs) — full canonical format per `TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0.md` remains in force.
2. **Team identity files** (`agents_os_v2/context/identity/team_XX.md`) — unchanged.
3. **Gate protocol requirements** — gate authority, gate sequence, deliverable requirements are unchanged.
4. **Mandatory Identity Header** in governance documents — unchanged (table with roadmap_id, stage_id, etc.).

---

## § 5 — Distinction: Two Formats, Two Contexts

| Artifact type | Format | Changed? |
|---|---|---|
| **Inter-team governance documents** (messages, decisions, reports) | Full canonical format (metadata block + identity header table + §1–§6 sections) | ✅ UNCHANGED |
| **Agent activation prompts** (pasted into Cursor/Codex/Claude sessions) | New lean Identity Stamp (§2 above) | 🔄 THIS AMENDMENT |

---

## § 6 — Enforcement

### Transition Period

Backward-compatible transition window: **2026-03-13 → 2026-04-01**.

During transition:
- Prompts using old `CONTEXT_RESET` line: Team 190 issues `FORMAT_DEPRECATION_WARNING` (not BLOCK).
- Gate transitions are NOT blocked for CONTEXT_RESET prompts during transition.

### Post-Transition (from 2026-04-01)

Non-compliant prompts (using CONTEXT_RESET or any non-stamp opening) for agent activation:
- Team 190 may issue `FORMAT_NON_COMPLIANT` return.
- Gate-bound activations using non-compliant format may be rejected.

### Not Affected by Enforcement

Governance documents (files in `_COMMUNICATION/`) are NOT subject to this enforcement — they follow the canonical message format lock.

---

## § 7 — Implementation Reference

Code implementation (already deployed):
- `agents_os_v2/context/injection.py` — `build_identity_stamp()` (canonical)
- `agents_os_v2/context/injection.py` — `build_context_reset()` (deprecated wrapper — returns stamp for backward compatibility)
- `agents_os_v2/orchestrator/pipeline.py` — `--fresh` flag on first invocation

---

**log_entry | TEAM_190 | PROMPT_STANDARD_AMENDMENT | ENFORCED | 2026-03-13**
