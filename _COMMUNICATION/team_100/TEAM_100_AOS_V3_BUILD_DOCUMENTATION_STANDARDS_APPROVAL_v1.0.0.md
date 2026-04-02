---
id: TEAM_100_AOS_V3_BUILD_DOCUMENTATION_STANDARDS_APPROVAL_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect / Chief R&D)
to: Team 11 (AOS Gateway / Execution Lead)
cc: Team 00 (Principal), Team 71 (AOS Documentation), Team 111 (AOS Domain Architect IDE), Team 21, Team 31, Team 51
date: 2026-03-28
type: STANDARDS_VERDICT — GATE_DOC standards and templates approval
domain: agents_os
branch: aos-v3
review_request: TEAM_11_TO_TEAM_100_AOS_V3_BUILD_DOCUMENTATION_STANDARDS_APPROVAL_REQUEST_v1.0.0
authority:
  - TEAM_11_AOS_V3_PRINCIPAL_APPROVAL_DOCUMENTATION_PHASE_v1.0.0.md
  - TEAM_00_AOS_V3_BUILD_PROCESS_MAP_v1.0.0.md---

# Team 100 → Team 11 | GATE_DOC Standards Verdict — **APPROVED_WITH_CHANGES**

## §1 — Verdict

| Field | Value |
|-------|-------|
| **Decision** | **APPROVED_WITH_CHANGES** |
| **Standards approved** | S1, S2, S3 (modified), S4, S5, S6, S7 |
| **Templates approved** | T1, T2, T3 — locked at **v1.0.0** |
| **Blocking changes** | 2 (S3 — resolve dual-path ambiguity; 3B — canonical target per Principal) |
| **Non-blocking observations** | 3 (documented §4) |

---

## §2 — Standards Review

### 2.1 — Product documentation (`agents_os_v3/`)

| # | Standard | Team 100 Decision | Notes |
|---|---------|-------------------|-------|
| S1 | README root | **APPROVED** | `agents_os_v3/README.md` must include: purpose, active branch, API port (8090), env vars (`AOS_V3_DATABASE_URL`), run API, run UI static, links to WP v1.0.3 and `FILE_INDEX.json`. Confirmed: no `README.md` exists yet — this is the first creation. |
| S2 | Runbook developer | **APPROVED** | Separate section within README or dedicated `agents_os_v3/docs/RUNBOOK.md`. Must cover: pytest execution, `check_aos_v3_build_governance.sh`, UI preflight, DB prerequisites — consistent with Team 51 QA reports. |
| S3 | API documentation | **APPROVED WITH CHANGE** | See §3 below. |

### 2.2 — Code

| # | Standard | Team 100 Decision | Notes |
|---|---------|-------------------|-------|
| S4 | Public modules | **APPROVED** | Non-trivial use-case and state-transition docstrings only. Reference spec doc rather than duplicating content. Existing module-level docstrings (e.g., `ingestion.py`, `sse.py`) already follow this pattern. |
| S5 | Preserved IRs | **APPROVED** | IR-3 (FILE_INDEX), IR-4 (UI consumer-only), IR-2 (v2 frozen) unchanged. This is a governance confirmation, not an implementation item. |

### 2.3 — Communication and evidence (`_COMMUNICATION/`)

| # | Standard | Team 100 Decision | Notes |
|---|---------|-------------------|-------|
| S6 | Frontmatter | **APPROVED** | The 7 required fields (`id`, `from`, `to`, `date`, `type`, `domain`, `branch`) are already in active use across all BUILD artifacts. This standard formalizes existing practice. |
| S7 | Breaking change tracking | **APPROVED** | Breaking API/schema changes logged in `_COMMUNICATION/team_21/` or handed off to Team 11 + documentation update to S2/S3. |

---

## §3 — Blocking Changes

### 3A — S3 (API Documentation): Resolve dual-path ambiguity

**Issue:** The draft offers two alternative paths for API documentation — an `agents_os_v3/docs/API_OVERVIEW.md` file **or** docstrings on public handlers in `api.py` — and asks Team 100 to choose one.

**Decision: Docstrings on public handlers in `api.py` (primary) + endpoint summary table in README (secondary).**

**Rationale:**

1. `api.py` already has a module-level docstring and route decorators. Adding per-handler docstrings keeps documentation at the source, reducing drift risk.
2. A separate `docs/API_OVERVIEW.md` will inevitably diverge from the code as endpoints are added or modified. The SSOT specs already serve as the authoritative endpoint reference.
3. The README (S1) should include a concise **endpoint summary table** (method, path, spec reference) — this serves as the quick-reference index without duplicating handler logic.
4. Canonical domain-level API documentation is promoted to `documentation/docs-agents-os/` by Team 71 (see 3B below).

**Team 71 action:** Implement docstrings on all public `@business_router` and `@_api_router` handlers, and include a summary endpoint table in the README. Do **not** create a separate `agents_os_v3/docs/` directory.

### 3B — Canonical documentation target: `documentation/docs-agents-os/` (Principal directive)

**Issue:** The existing canonical documentation structure is:

```
documentation/
  docs-governance/          (cross-domain governance — shared)
  docs-agents-os/           (AOS domain — currently v2 content)
    00_AGENTS_OS_MASTER_INDEX.md
    01-OVERVIEW/
    02-ARCHITECTURE/
    03-CLI-REFERENCE/
    04-PROCEDURES/
    05-TEMPLATES/
  docs-system/              (TikTrack domain)
```

`documentation/docs-agents-os/` already contains v2 documents (overview, architecture, CLI reference, event log, pipeline state). Principal directs that v3 documentation must be promoted into this **same canonical structure** with clear v2/v3 separation — no parallel `agents_os_v3/docs/` tree.

**Decision:** All canonical v3 documentation produced by Team 71 goes into `documentation/docs-agents-os/` using the following separation strategy:

| Item | Location | Rule |
|------|----------|------|
| **v3 overview** | `documentation/docs-agents-os/01-OVERVIEW/AGENTS_OS_V3_OVERVIEW.md` | New file alongside existing v2 overview |
| **v3 architecture** | `documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_V3_ARCHITECTURE_OVERVIEW.md` | New file; v2 architecture remains intact |
| **v3 API reference** | `documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_V3_API_REFERENCE.md` | Extracted from handler docstrings at promotion time |
| **v3 runbook** | `documentation/docs-agents-os/04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md` | Based on S2 content |
| **v3 templates** | `documentation/docs-agents-os/05-TEMPLATES/` | T1/T2/T3 after Team 71 execution |
| **Master index** | `documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md` | Team 71 adds v3 section — **does not remove v2 entries** |
| **Code-level README** | `agents_os_v3/README.md` | S1 — developer entry point within the code tree (NOT canonical documentation; links to canonical) |

**Naming convention:** All v3 documents use prefix `AGENTS_OS_V3_` to distinguish from v2 documents (which have no version prefix or use `AGENTS_OS_` / `PIPELINE_`).

**Iron Rules:**
- Do **not** create `agents_os_v3/docs/` as a documentation directory. Code-level documentation lives only in `agents_os_v3/README.md` and handler docstrings.
- Do **not** modify or remove existing v2 documents. v2 remains active; v3 is additive.
- The Master Index (`00_AGENTS_OS_MASTER_INDEX.md`) must gain a v3 section that links to all new documents without disturbing v2 entries.
- Team 71 promotion follows the Knowledge Promotion Protocol (Team 10/70 routing).

---

## §4 — Non-Blocking Observations

### OBS-01 — S2 Runbook: code-level vs. canonical

The code-level `agents_os_v3/README.md` (S1) should contain a concise runbook section covering pytest, governance checks, DB prerequisites. The full canonical runbook is promoted to `documentation/docs-agents-os/04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md` by Team 71. The README links to the canonical version; it does not duplicate it.

### OBS-02 — FILE_INDEX registration

`agents_os_v3/README.md` must be registered in `FILE_INDEX.json` per IR-3. Team 71 should increment the version accordingly. Documents under `documentation/docs-agents-os/` are outside `agents_os_v3/` and therefore outside FILE_INDEX scope — they follow the Knowledge Promotion Protocol instead.

### OBS-03 — v3/v2 boundary in Master Index

The Master Index (`documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md`) currently references only v2 artifacts. When Team 71 adds the v3 section, it must use a clearly demarcated heading (e.g., `## AOS v3 — Product API & Dashboard`) and must not intermingle with v2 entries. The existing v2 content (pipeline CLI, event log, dashboard UI registry) remains valid and active.

---

## §5 — Templates Review

| # | Template | Decision | Notes |
|---|---------|----------|-------|
| T1 | Developer guide (Markdown) | **APPROVED v1.0.0** | Sections: Setup / Run API / Run UI / Test / Troubleshooting / SSOT links. Aligns with S1/S2. |
| T2 | Breaking change | **APPROVED v1.0.0** | Table: endpoint or module / before / after / affected TC / date. Aligns with S7. |
| T3 | Links index | **APPROVED v1.0.0** | Links to WP, UI Spec, FILE_INDEX, Stage Map. |

Team 71 may publish these as `*_TEMPLATE_v1.0.0.md` under `_COMMUNICATION/team_71/` per their canonical promotion process.

---

## §6 — Scope and Timing

| Item | Value |
|------|-------|
| **DOC_PREP** | **PASS** — this verdict closes the standards phase |
| **DOC_EXEC** | Team 71 mandate from Team 11 (Gateway) — **authorized to proceed** |
| **Timing** | After GATE_4 UX approval from Team 00, or in parallel with GATE_5 prep per Stage Map §0.9 |
| **Canonical promotion** | Team 71 → `documentation/` via Team 10/70 routing per Knowledge Promotion Protocol |

---

## §7 — Formal Decision

**APPROVED_WITH_CHANGES.** Two blocking changes must be reflected in Team 71's execution mandate:

1. **S3** — Use handler docstrings + README endpoint table (no separate `agents_os_v3/docs/` directory).
2. **3B** — All canonical v3 documentation goes into `documentation/docs-agents-os/` with `AGENTS_OS_V3_` prefix naming convention, alongside existing v2 content. Master Index gets a v3 section. `agents_os_v3/README.md` is the code-level entry point only.

All other standards and templates are approved as drafted.

**Team 11 next steps:**
1. Mark **DOC_PREP** as **PASS** in Stage Map §0.9.
2. Issue GATE_DOC execution mandate to **Team 71** incorporating: S1-S7 as approved, T1-T3 at v1.0.0, S3 resolution per §3A, and canonical target per §3B.
3. Coordinate with **Team 21** (code docstrings) and **Team 31** (UI-specific docs if any) as needed.
4. Team 71 must add a v3 section to the Master Index (`00_AGENTS_OS_MASTER_INDEX.md`) without modifying v2 entries.

---

**log_entry | TEAM_100 | AOS_V3_BUILD | GATE_DOC_STANDARDS_APPROVED_WITH_CHANGES | S3_RESOLVED | CANONICAL_TARGET_DOCS_AGENTS_OS | 2026-03-28**
