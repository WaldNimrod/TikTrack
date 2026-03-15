---
project_domain: AGENTS_OS
id: TEAM_51_SKILLS_RECOMMENDATIONS_REPORT_v1.0.0
from: Team 51 (Agents_OS QA Agent)
to: Team 00, Team 190
cc: Team 10, Team 100, Team 61
date: 2026-03-15
status: SUBMITTED_FOR_ARCH_REVIEW
scope: Team 51 skill recommendation package — S002-P005 skills alignment
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| task_id | TEAM_SKILLS_DISCOVERY_AND_SUBMISSION |
| phase_owner | Team 51 |

---

## 1) Team Context

### Operating domain(s)
- **AGENTS_OS only** — `agents_os_v2/`, pipeline QA, `agents_os/ui/` (when routed)
- FAST_2.5 gate; GATE_4–GATE_7 QA when delegated (e.g. Pipeline Governance, Store Artifact, GATE_7 browser)

### Primary toolchain / runtime
- **Engine:** Cursor (local)
- **Checks:** pytest, mypy, bandit, grep, shell commands
- **Input:** Handoff prompts from Team 61, Team 191, Team 00 (GATE_7 delegation)
- **Output:** QA reports to `_COMMUNICATION/team_51/`, Nimrod handoff docs, validation requests to Team 190

### Recurring blockers
1. **Handoff format variance** — activation prompts vary in structure (QA request vs handoff vs mandate); repeated context reads to infer scope
2. **LOD400/spec lookup** — WP-specific criteria (test count, check IDs) scattered across LOD400, activation prompt, and constitution
3. **Domain/gate context** — pipeline state files, WSM, WP registry consulted ad hoc for routing
4. **Browser checks** — when delegated (e.g. GATE_7), MCP browser workflow requires explicit lock/unlock/snapshot sequence; no reusable pattern
5. **Re-QA loops** — minor AC failures (e.g. AC-04 override_reason) trigger full re-run; no incremental verification script

---

## 2) Skill Options Table

| # | Option name | What it solves | Benefits | Risks / tradeoffs | Impact | Effort | Token saving |
|---|-------------|----------------|----------|-------------------|--------|--------|--------------|
| 1 | **Handoff format parser skill** | Standardize parsing of Team 61/191 handoff prompts into a canonical checklist (AC list, commands, expected outputs) | Fewer re-reads; deterministic checklist; one prompt structure for all WP types | May not fit future handoff variants; maintenance if format evolves | HIGH | MEDIUM | HIGH |
| 2 | **QA check runner skill** | Single invocation runs C1–C7 (pytest, mypy, bandit, grep, domain isolation, gate integration) with WP-scoped file list | One-shot full suite; less context switching; reproducible evidence | Requires clear "files modified" contract from closeout | HIGH | LOW | MEDIUM |
| 3 | **LOD400 extractor skill** | Extract required test count, check IDs, gate mapping from LOD400/activation prompt into a compact table | No manual spec trawl; explicit pass/fail criteria | LOD400 structure must be stable | MEDIUM | MEDIUM | MEDIUM |
| 4 | **MCP browser QA pattern skill** | Cursor-ide-browser workflow: navigate → lock → snapshot → click/verify → unlock; reusable for GATE_7 and future browser mandates | Consistent browser verification; fewer stale-element errors | Depends on MCP server availability | HIGH | LOW | MEDIUM |
| 5 | **Incremental re-verification skill** | Given a previous QA report + list of remediated items, run only the affected ACs and update report | Shorter re-QA cycles; token savings on full re-run | Needs clear "what changed" from remediation doc | MEDIUM | MEDIUM | HIGH |
| 6 | **Governance doc index skill** | Quick lookup: WSM active stage, WP registry, team routing rules without full-file read | Faster context resolution; fewer irrelevant reads | Index must be maintained | MEDIUM | LOW | LOW |

---

## 3) Priority Recommendation (Top 3)

1. **Handoff format parser skill** — Highest token drain is repeated handoff re-reading; canonical checklist reduces reads per session
2. **QA check runner skill** — Immediate win; low effort; consolidates C1–C7 into one deterministic run
3. **MCP browser QA pattern skill** — Critical for GATE_7–type delegation; reduces trial-and-error with browser MCP

---

## 4) Dependencies and Prerequisites

| Option | Prerequisite | Owner |
|--------|--------------|-------|
| Handoff parser | Team 61/191 handoff schema (or at least a documented structure) | Team 170 or Team 10 |
| QA check runner | Team 61 closeout must list `files_modified` in machine-parseable form | Team 61 |
| LOD400 extractor | LOD400 sections §AC, §Check IDs stable | Team 170 |
| MCP browser pattern | MCP cursor-ide-browser enabled; server running | User / Cursor config |
| Incremental re-verification | Remediation doc includes `remediated_acs` list | Team 61 |
| Governance index | WSM/registry structure documented | Team 170 |

---

## 5) Suggested Owner per Option

| Option | Suggested owner | Rationale |
|--------|-----------------|-----------|
| Handoff format parser | Team 170 | Owns governance docs; can define canonical handoff schema |
| QA check runner | Team 51 | Self-service; implement as Cursor rule or skill |
| LOD400 extractor | Team 51 | Self-service; read LOD400, output compact table |
| MCP browser QA pattern | Team 51 | Self-service; document as skill from GATE_7 session learnings |
| Incremental re-verification | Team 51 | Self-service; logic depends on QA report format |
| Governance index | Team 170 | Owns canonical indexes |

---

## 6) Open Clarification Questions

**NONE** — Team 51 runtime (Cursor local, agents_os_v2/, pytest/mypy/bandit, MCP browser when delegated) is clear from constitution and identity docs.

---

## 7) Return Contract

| Field | Value |
|---|---|
| overall_result | SUBMITTED_FOR_ARCH_REVIEW |
| top3_skills | Handoff format parser; QA check runner; MCP browser QA pattern |
| blocking_uncertainties | NONE |
| remaining_blockers | NONE |

---

**log_entry | TEAM_51 | SKILLS_RECOMMENDATIONS_REPORT | SUBMITTED | 2026-03-15**
