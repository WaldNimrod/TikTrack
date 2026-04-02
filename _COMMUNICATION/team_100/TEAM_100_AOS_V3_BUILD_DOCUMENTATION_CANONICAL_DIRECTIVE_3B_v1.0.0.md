---
id: TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect / Chief R&D)
to: Team 11 (Gateway), Team 71 (AOS Documentation), Team 21, Team 31, Team 51
cc: Team 00 (Principal), Team 111 (AOS Domain Architect IDE), Team 170 (Governance Documentation)
date: 2026-03-28
type: ARCHITECTURAL_DIRECTIVE — GATE_DOC / documentation canonical target (blocking)
domain: agents_os
branch: aos-v3
responds_to: TEAM_11_TO_TEAM_100_AOS_V3_BUILD_DOCUMENTATION_STANDARDS_APPROVAL_REQUEST_v1.0.0.md---

# AOS v3 BUILD — Documentation canonical target (Blocking change **3B**)

## Verdict

**APPROVED_WITH_BINDING_TARGETS** — The following **canonical documentation layout** is **mandatory** for all **AOS v3** domain documentation produced under the BUILD program. This satisfies **GATE_DOC Phase A** (standards lock) pending Gateway mandate to **Team 71** for **Phase B** execution.

---

## Canonical home

The existing tree **`documentation/docs-agents-os/`** with its **five** subdirectory families (**01-OVERVIEW** through **05-TEMPLATES**) is the **canonical home** for **all** AOS domain documentation.

All **v3** documents authored or promoted by **Team 71** MUST reside in this same structure, using the **`AGENTS_OS_V3_`** filename prefix for clear separation from existing **v2** content.

| v3 document | Canonical path |
|-------------|----------------|
| v3 Overview | `documentation/docs-agents-os/01-OVERVIEW/AGENTS_OS_V3_OVERVIEW.md` |
| v3 Architecture | `documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_V3_ARCHITECTURE_OVERVIEW.md` |
| v3 API Reference | `documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_V3_API_REFERENCE.md` |
| v3 Developer Runbook | `documentation/docs-agents-os/04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md` |
| v3 Templates | `documentation/docs-agents-os/05-TEMPLATES/` (files prefixed `AGENTS_OS_V3_`) |
| Master Index update | Add a dedicated **v3** section to `documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md` **without** altering or removing existing **v2** entries |

---

## Iron Rules

1. **No** `agents_os_v3/docs/` directory — code-adjacent documentation is **only** `agents_os_v3/README.md` plus **handler docstrings** where needed.
2. **Do not** modify or remove existing **v2** documents under `documentation/docs-agents-os/` except where a separate governance erratum explicitly allows it (out of scope for this directive).
3. **Master Index** gains a **v3** section; **v2** index rows and links remain authoritative as-is.

---

## Traceability

- Gateway request: `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_100_AOS_V3_BUILD_DOCUMENTATION_STANDARDS_APPROVAL_REQUEST_v1.0.0.md`
- Principal decision record: `_COMMUNICATION/team_11/TEAM_11_AOS_V3_PRINCIPAL_APPROVAL_DOCUMENTATION_PHASE_v1.0.0.md`
- Stage map: `_COMMUNICATION/team_11/TEAM_11_AOS_V3_BUILD_STAGE_MAP_WORKING_v1.0.0.md` §0.9

---

**log_entry | TEAM_100 | AOS_V3_BUILD | DOCUMENTATION_CANONICAL_3B | ISSUED | 2026-03-28**
