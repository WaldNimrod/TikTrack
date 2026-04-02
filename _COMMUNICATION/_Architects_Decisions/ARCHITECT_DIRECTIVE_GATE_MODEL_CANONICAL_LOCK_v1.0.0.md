---
id: ARCHITECT_DIRECTIVE_GATE_MODEL_CANONICAL_LOCK_v1.0.0
author: Team 00 (Nimrod — Chief Architect)
date: 2026-04-02
status: LOCKED
type: ARCHITECTURAL_DIRECTIVE
authority: CONSTITUTIONAL
---

# Architect Directive: Gate Model Canonical Lock

## §1 — Statement

**The active pipeline gate model is GATE_0–GATE_5. This is the only model.**

GATE_6, GATE_7, and GATE_8 are **retired aliases**. They no longer exist as active pipeline
gates. Any document, governance file, prompt, or activation template that references them
as active gates is in constitutional drift.

This directive is locked. No team may re-activate GATE_6, GATE_7, or GATE_8 as live gate
designations without an explicit Team 00 override directive.

---

## §2 — Canonical mapping (alias → canonical)

| Retired alias | Canonical gate + phase | Description |
|---|---|---|
| GATE_6 | GATE_4 Phase 4.2 | Implementation review / architectural sign-off |
| GATE_7 | GATE_4 Phase 4.3 | UX/vision sign-off (human, non-delegatable) |
| GATE_8 | GATE_5 Phase 2 | Documentation closure / lifecycle complete |

Reference authority: `ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md` §4

---

## §3 — What is permitted

The following are **NOT violations** of this directive:

1. **Historical records** — Completion reports, gate decision files (ARCHITECT_GATE6_DECISION_*,
   NIMROD_GATE7_*, ARCHITECT_GATE7_*), portfolio snapshot records for closed work packages.
   These document past events and must never be modified.

2. **LEGACY-annotated operational code** — `definition.yaml` gate_authority entries that carry
   an explicit `# LEGACY` inline comment. These retain the alias for backward compatibility
   while the annotation makes the retired status unambiguous.

3. **Operational GATE_8 Phase 2 pipeline runtime** — `pipeline_run.sh` and dashboard architecture
   documents that describe GATE_8 as the two-phase closure flow. These are technically valid:
   GATE_8 = GATE_5 Phase 2 in the legacy numbering. They do not create active gate drift because
   they describe the same canonical behavior.

4. **Contract templates already marked with LEGACY banners** — `G6_TRACEABILITY_MATRIX_CONTRACT_*`,
   `GATE_7_HUMAN_UX_APPROVAL_CONTRACT_*` — already carry explicit "NOT active pipeline gates"
   notices.

---

## §4 — What is prohibited (drift sources)

The following are **prohibited** in any document that is read at session start or used
as an active prompt, mandate, or governance reference:

- Listing GATE_6/7/8 in a Gate Authority table without a LEGACY annotation
- Issuing mandates that reference a team's GATE_6 or GATE_7 authority as a current gate
- Creating new activation prompts that use GATE_6/7/8 as live gate designations
- Writing new GATE_6_DECISION or GATE_7_DECISION files for new work packages

New work packages use GATE_4 (with Phase 4.2 and/or 4.3 where applicable) and GATE_5.

---

## §5 — Fixes applied (2026-04-02)

The following files were corrected under this directive to eliminate active drift:

| File | Fix |
|------|-----|
| `CLAUDE.md` line 64 | `GATE_2/GATE_6/GATE_7` → `GATE_2/GATE_5` |
| `CLAUDE.md` lines 77–86 | Gate Authority table: replaced GATE_6/7/8 rows with canonical GATE_0–5 model + mapping note |
| `agents-os/core/governance/team_00.md` | `GATE_7 / personal gates` → `GATE_4 Phase 4.3 (UX/vision sign-off)` with alias note |
| `agents-os/core/governance/team_100.md` | `GATE_6 co-owner` → `GATE_4 Phase 4.2 co-owner` with alias note |

---

## §6 — Verification

After this directive, every session-startup document (CLAUDE.md, TEAM_00_CONSTITUTION,
TEAM_00_DOCUMENT_PRIORITY_MAP) must be free of active GATE_6/7/8 references. If any are found,
they are constitutional drift and must be corrected before any other work proceeds.

**Grep command for ongoing compliance check:**
```bash
grep -rn "GATE_[678]" CLAUDE.md _COMMUNICATION/team_00/ \
  agents-os/core/governance/ | grep -v "LEGACY\|retired alias\|retired alias\|historical\|# LEGACY"
```
Expected result: zero matches.

---

**log_entry | TEAM_00 | GATE_MODEL_CANONICAL_LOCK | ACTIVE | ALL_DRIFT_CLOSED | 2026-04-02**
