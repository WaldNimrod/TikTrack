# _aos/ — Self-Contained Project Governance

## Project: TikTrack Phoenix

## What is this?

This directory contains all governance artifacts for TikTrack Phoenix.
It is self-contained: clone this repo to any machine and governance is complete.

## File Inventory

| File | Purpose |
|------|---------|
| `README.md` | This file |
| `metadata.yaml` | Provenance: lean_kit_version, source SHA, profile, engine version |
| `lean-kit/` | Physical snapshot of lean-kit framework |
| `roadmap.yaml` | WP registry — SSOT for work package state |
| `team_assignments.yaml` | Active teams, role-based IDs, engine assignments |
| `MILESTONE_MAP.md` | Milestone descriptions and active milestone |
| `context/` | Agent activation prompts + project context |
| `work_packages/` | LOD specs per WP |

## Single-Writer Rule (IRON RULE)

At any time, exactly ONE agent holds write authority over `roadmap.yaml`.
Transfers at gate boundaries. Never concurrent writes.

## Profile: L2 (Dual-Profile)

TikTrack operates in dual-profile mode (active until S004):
- **L0 governance:** This `_aos/` directory (WP tracking, gates, team roles)
- **L2 engine:** `agents_os_v2/` (pipeline_run.sh → agents_os_v2 orchestrator)

These layers are independent. `_aos/` does NOT change engine behavior.
`pipeline_run.sh` is S004 scope — do not modify.

## Quick Reference

- **Validate:** `bash _aos/lean-kit/scripts/validate_aos.sh .`
- **Active WP:** Check `roadmap.yaml` → `status: IN_PROGRESS`
- **Start session:** Read `context/ACTIVATION_[ROLE].md`
