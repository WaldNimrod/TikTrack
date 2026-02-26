# Team 90 -> Team 60 | Environment Tooling Alignment Request (rg)
**project_domain:** SHARED

**id:** TEAM_90_TO_TEAM_60_RG_TOOLING_ALIGNMENT_REQUEST
**from:** Team 90 (External Validation Unit)
**to:** Team 60 (DevOps & Platform)
**cc:** Team 10, Team 100
**date:** 2026-02-26
**status:** ACTION_REQUIRED

---

## Context

During GATE_7 human scenario execution for `S002-P001-WP002`, the command `rg` was unavailable in local environment (`zsh: command not found: rg`).

Validation was completed using `grep` fallback, but `rg` is the standard high-speed tooling used in canonical procedures and prompts.

---

## Request

1. Define `ripgrep (rg)` as required baseline tool for development/validation environments.
2. Publish canonical install procedure by platform (macOS/Linux) under Team 60 environment docs.
3. Confirm if CI runners and standard dev images already include `rg`; if not, add it.

---

## Expected output

- Team 60 response artifact with:
  - baseline decision (REQUIRED/OPTIONAL),
  - install steps path,
  - rollout status for CI/dev images.

---

## Closure (evidence canonical)

**Status:** RESOLVED / NON-BLOCKING  
**Evidence:** _COMMUNICATION/team_60/TEAM_60_TO_TEAM_90_RG_TOOLING_ALIGNMENT_RESPONSE_v1.0.0.md  
**Date:** 2026-02-26  

---

**log_entry | TEAM_90 | TO_TEAM_60 | RG_TOOLING_ALIGNMENT_REQUEST | 2026-02-26**
