---
directive_id:  ARCHITECT_DIRECTIVE_ONE_HUMAN_ALL_TEAMS_AI_AGENTS_v1.0.0
author:        Team 00 — Chief Architect
date:          2026-03-16
status:        LOCKED — Iron Rule
authority:     Team 00 constitutional authority + Nimrod confirmation
applies_to:    ALL teams, ALL documents, ALL system design decisions
---

# Architectural Directive — One Human, All Teams Are AI Agents
## Foundational Organizational Model — IRON RULE

---

## The Rule

**There is exactly ONE human in this organization: Nimrod (Team 00).**

Every other "team" is an LLM agent running in a specific computational environment.

---

## Team → Engine Map (Canonical)

| Team | Role | Engine / Environment |
|------|------|---------------------|
| **Team 00** | Chief Architect — **Nimrod (human)** | Claude Code (local) |
| Team 10 | Execution Orchestrator / Gateway | Gemini API |
| Team 20 | Backend Implementation | Cursor Cloud (via Team 61) |
| Team 30 | Frontend Implementation | Cursor Cloud (via Team 61) |
| Team 40 | UI/Design | Cursor Cloud (via Team 61) |
| Team 50/51 | QA Testing | Gemini API |
| Team 60 | DevOps | Cursor Cloud (via Team 61) |
| **Team 61** | **Cursor Cloud Agent (implements code)** | **Cursor.com/agents** |
| Team 90 | Validation / "The Spy" | OpenAI API |
| Team 100 | AOS Domain Architecture | Gemini API |
| Team 170 | Documentation / Registry | Gemini API |
| Team 190 | Constitutional Validation | OpenAI API |
| Team 191 | Date Governance / Push Guard | Scripted / automated |

---

## What This Means in Practice

### 1. "Manual WSM update by Gate Owner"
This means: an LLM agent (Team 10, 170, or 190) writes Markdown text to the WSM file according to its context and instructions. It is NOT a human typing. It is a statistical LLM output.

**Implication:** WSM updates can contain errors. They must be validated. "A human updated the WSM" is NEVER the basis for trust — it must go through the same validation chain as any LLM output.

### 2. "Human coordination between teams"
This means: AI-to-AI communication via structured documents in `_COMMUNICATION/`. One LLM writes a document; another LLM reads it. The "handoff" is a file on disk, not a conversation.

**Implication:** Documents must be structured, unambiguous, and machine-parseable — not just human-readable prose. An AI agent receiving vague instructions will produce variable outputs. Schema matters.

### 3. "Team X reviewed and approved"
This means: an LLM agent ran its validation logic against the artifact. It is a statistical verification — better than nothing, but not infallible.

**Implication:** This is precisely why cross-engine validation exists (see CROSS_ENGINE_VALIDATION_PRINCIPLE). Team 190 (OpenAI) reviewing Team 61 (Cursor) output is better than Team 61 reviewing itself, but still not human-level certainty. Nimrod's approval at GATE_7 is the ONLY guaranteed human review.

### 4. "Mode 1 — manual, directly with teams"
This means: Nimrod talks directly to an LLM agent (sending a prompt), without the AOS pipeline orchestrating the flow. The agent responds and writes artifacts. Still AI execution — just without pipeline automation.

---

## Design Implications

### Interface Design
Every interface that crosses team boundaries MUST be designed for AI-agent consumption:
- **Structured data** (JSON, tables) preferred over prose
- **Unambiguous schemas** with explicit field semantics
- **Deterministic parsing** — no fields that require interpretation
- **No "read between the lines"** instructions

### State Management
"Gate Owner manually updated WSM" = an LLM agent wrote to a Markdown file.
**This file can be wrong.** The sync and drift detection architecture we build MUST account for the fact that WSM updates are LLM outputs — not ground truth.

**This strengthens the case for a server-side validation layer:** when the server reads WSM + JSON and computes drift, it acts as a validation check on the LLM-written WSM. If WSM says WP=X but JSON says WP=Y, the server catches this — regardless of which LLM "updated" which file.

### S003-P007 API Design
The AOS Pipeline Server (S003-P007) exposes endpoints that BOTH Nimrod (human via browser) AND AI agents (Team 10, Team 61, etc.) will call. Design accordingly:
- Consistent JSON schemas (not HTML responses)
- Explicit error codes with machine-readable messages
- Agent-friendly authentication (if any) — not human-only flows

---

## What Does NOT Change

1. **Gate model** — unchanged. The gate sequence, gate ownership, pass/fail logic is unchanged.
2. **Nimrod's authority** — Team 00 is human. GATE_2, GATE_6, GATE_7 require Nimrod personally.
3. **Quality standards** — LLM agents are held to the same output standards as if they were human.
4. **Constitutional authority** — Team 190 remains constitutional validator, regardless of being an LLM.

---

## Rationale

This rule was formally locked because previous architectural analysis made implicit assumptions about "human manual processes" that do not hold when all actors (except Nimrod) are LLMs. Failing to recognize this led to:
- Designing WSM update workflows as if they were reliable human processes
- Underestimating the importance of deterministic interfaces for AI-to-AI communication
- Over-relying on "human-readable prose" fields (e.g., `agents_os_parallel_track`) that are difficult for LLMs to parse reliably

---

**log_entry | TEAM_00 | ONE_HUMAN_ALL_TEAMS_AI_AGENTS | DIRECTIVE_LOCKED | 2026-03-16**
