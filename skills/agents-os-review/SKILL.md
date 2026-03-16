---
name: agents-os-review
description: Deep review workflow for Agents OS as the primary domain under review, with TikTrack used only as supporting proving-ground evidence where it directly validates Agents OS claims. Use when Codex needs to audit pipeline mechanics and gate flow, governance/server scripts and canonical documents, dashboard or roadmap or teams UI, MCP and E2E coverage, documentation-to-code drift, or architectural coherence across agents_os, agents_os_v2, _COMMUNICATION, and governance sources; produce a dated multi-document review pack with findings, gap analysis, and urgent action items.
---

# Agents OS Review

## Overview

Review Agents OS as an operating system for a professional one-human software house, not as an isolated code module. Start at concept and governance, descend through pipeline behavior, documents, interfaces, architecture, modules, and individual functions, then end with a dated evidence pack and an action-oriented conclusion.

Agents OS is the domain under review. TikTrack may be inspected only when it functions as supporting evidence for an Agents OS claim, such as proving that a gate, MCP scenario, or operator workflow actually works end-to-end.

## Quick Start

1. Read the mandatory canon before scanning code:
   - `.cursorrules`
   - `00_MASTER_INDEX.md`
   - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
   - `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`
   - `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`
2. Scaffold the review bundle:
   - `python3 skills/agents-os-review/scripts/init_review_bundle.py --team-id 61 --review-slug pipeline-governance`
3. Load the reference files only when needed:
   - `references/review-method.md` for the end-to-end workflow
   - `references/source-map.md` for canonical paths and code surfaces
   - `references/report-pack.md` for the deliverable set and writing rules

## Review Lens

Judge the system against the core promise: Agents OS should let one human operate a professional software house with deterministic process control, explicit authority boundaries, and low coordination overhead.

Use this layered ladder in every review:
- `L0 Concept`: single-human leverage, domain isolation, source-of-truth discipline, role clarity
- `L1 Capabilities`: pipeline orchestration, governance/document flow, review surfaces, evidence handling
- `L2 Processes`: gate transitions, mandate generation, document promotion, QA/E2E flow, escalation paths
- `L3 Interfaces`: dashboard, roadmap, teams page, command affordances, copy paths
- `L4 Architecture`: orchestrator, state model, validators, injection layer, scenario registry, scripts
- `L5 Modules`: file-level ownership, cohesion, dead paths, legacy/V2 overlap
- `L6 Functions`: concrete bugs, drift, broken assumptions, missing validations, stale scaffolds

## Workflow

1. Establish operational truth from WSM and V2 procedures before trusting any UI or local script.
2. Map the active system surfaces across `agents_os_v2/`, `agents_os/`, `_COMMUNICATION/agents_os/`, and governance canon.
3. Review the pipeline and gates first, because they define authority, routing, and lifecycle correctness.
4. Review the server-side and governance side next: scripts, validators, state handling, evidence validators, canonical docs, future plans.
5. Review the UI surfaces as operational tooling, not as cosmetics: dashboard, roadmap, teams page, registry docs, command copy paths.
6. Compare documentation to code and to runtime behavior. Treat scaffolds, placeholders, and future-plan text as risk if the UI presents them like active features.
7. Run tests and browser checks where feasible. Use MCP/browser tooling when available; otherwise document the gap explicitly.
8. Keep domain discipline: do not let TikTrack app verification dominate the review. If a browser/E2E check is performed on TikTrack, state explicitly which Agents OS claim it is validating.
9. Write findings first, then gap analysis, then architectural conclusions and urgent actions.

## Mandatory Checks

- Compare gate owners, gate engines, fail routes, and current state fields across canon, Python, shell helpers, and UI copy.
- Compare dashboard registry claims to `agents_os/ui/js/*.js`, HTML pages, CSS, and command scaffolds.
- Compare MCP scenario claims and counts in docs to `agents_os_v2/mcp/test_scenarios.py` and related tests.
- Compare report and governance expectations to actual output paths and promotion rules.
- Check both `agents_os_v2/` and legacy `agents_os/` for overlap, contradiction, or silent drift.
- Review future-plan artifacts and partially implemented features as first-class drift candidates, not as harmless documentation.

## Output Rules

- Write the review pack under `_COMMUNICATION/team_<reviewer_team>/agents_os_review/<YYYY-MM-DD>_<slug>/`.
- Keep raw evidence inside the bundle under `evidence/`, `logs/`, `screenshots/`, and `notes/`.
- Treat the review pack as operational output. Do not write directly into canonical `documentation/` unless the active reviewing team is authorized to promote canon.
- Cite concrete file paths, commands, tests, or screenshots for every material finding.
- End with architectural and conceptual conclusions plus an immediate action list ordered by urgency.

## Resources

- `scripts/init_review_bundle.py`
  - Create the dated review pack structure and seed the required report files.
- `references/review-method.md`
  - Define the full review sequence, checks, and command set.
- `references/source-map.md`
  - List the primary code, documentation, UI, and evidence surfaces to inspect.
- `references/report-pack.md`
  - Define the file layout and expected content for the final report set.
