# TEAM_DEVELOPMENT_ROLE_MAPPING v1.0.1

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1  
**owner:** Team 170 (canonical); consumed by Team 10 for scope and **knowledge-promotion routing**  
**date:** 2026-03-26  
**status:** LOCKED  
**supersedes:** `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`  
**purpose:** Single canonical source for development squad roles, **Principal / Team 00** alignment (hub §2), roster **110/111**, parent/child x0/x1 pattern, **pipeline vs Team 10** orchestration, and **Pipeline Fidelity Suite (PFS)** cross-ref. `.cursorrules` is a tooling mirror only.

**IRON RULE:** Team 50 = QA + FAV for TIKTRACK domain; Team 51 = QA for AGENTS_OS domain (child QA team inheriting Team 50 standards/procedures with domain split). NEVER assign QA/testing/FAV to Team 40. Team 40 = UI Assets & Design ONLY. Source: `ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md` (2026-03-02) + `ARCHITECT_DIRECTIVE_AGENTS_OS_FAST_TRACK_DEFAULT_v1.0.0.md` (2026-03-10).  
**DOMAIN SPLIT LOCK (2026-03-12):** Teams 10/20/30/40/50 operate in TIKTRACK or SHARED programs only; Team 60 operates in all domains; Teams 90+190 are cross-domain validators; Team 61 is AGENTS_OS-only development/automation; Team 191 is a cross-domain Git-governance operations child team of Team 190.

**Principal / human model (summary):** See `PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md` for D-01…D-14 and **PFS** definition.

---

## 1) Development squad mapping (canonical)

| Squad ID | Role | Responsibility |
|----------|------|----------------|
| **Team 20** | Backend Implementation | Server-side: API, logic, DB, services, runtime — TIKTRACK and SHARED programs only. |
| **Team 30** | Frontend Execution | Client-side: components, pages, API integration — TIKTRACK and SHARED programs only. |
| **Team 40** | UI Assets & Design | Design, design tokens, UI assets, visual consistency — TIKTRACK and SHARED programs only. |
| **Team 50** | QA & FAV | Test scripts, E2E suites, regression, final acceptance validation (FAV), SOP-013 seals — TIKTRACK and SHARED programs only. **Output: test results + verdict only — no routing.** Per ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0. |
| **Team 51** | Agents_OS QA (child of Team 50) | Inherits Team 50 QA/FAV standards and procedures; executes QA for AGENTS_OS domain only (FAST_2.5 / GATE_5-equivalent). **Output: test results + verdict only — no routing.** Per ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0. |
| **Team 60** | DevOps & Platform | Infrastructure, runtimes, CI/CD, platform — all domains (TIKTRACK + AGENTS_OS + SHARED). |
| **Team 61** | Cloud Agent / DevOps Automation | CI/CD automation, quality scans, unit-test generation, Agents_OS V2 automation, cloud execution reports — AGENTS_OS domain only. |
| **Team 70** | Documentation (TIKTRACK + Repository Maintenance) | TIKTRACK documentation lane, release docs, archive/folder hygiene, communication-maintenance operations across repository. |
| **Team 90** | Validation & Gate Management | GATE_5–GATE_8 validation process, validation packages, quality gate coordination — cross-domain (TIKTRACK + AGENTS_OS + SHARED). **Output: review notes + verdict only — no routing.** Per ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0. |
| **Team 100** | Chief System Architect / Chief R&D | Program-level architecture, synthesis, MERGED v3 spec ownership **within Principal’s frame**; AOS/TikTrack domain architect coordination. |
| **Team 110** | AOS Domain Architect (IDE) | Spec production, code-aware AOS review, LOD200/LLD400 handoff to Team 100; **must challenge** when AOS domain integrity is at risk (D-14). |
| **Team 111** | TikTrack Domain Architect (IDE) | Same pattern as Team 110 for **TikTrack** domain under Team 100. |
| **Team 170** | Spec & Governance (AGENTS_OS + Governance Canonical) | LOD contracts, AGENTS_OS/governance canonical maintenance, registry synchronization, governance procedure locks. |
| **Team 190** | Constitutional Validation | GATE_0–GATE_2 constitutional integrity and validation authority — cross-domain (TIKTRACK + AGENTS_OS + SHARED). **Output: structured verdict only — no routing.** Per ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0. |
| **Team 191** | Git Governance Operations (child of Team 190) | Commit/push guard operations, date-lint/snapshot/sync remediation, clean-tree enforcement, Git drift triage — cross-domain (TIKTRACK + AGENTS_OS + SHARED). |

**Deprecated label note:** Roster IDs **101 / 102** for domain IDE architects are **retired** in favor of **110 / 111** (avoids collision with “100 = architecture head”). Artifact paths may still use `_COMMUNICATION/team_101/` and `team_102/` until a file migration is explicitly mandated.

## 1.1) Team 61 registration record (canonical)

| Field | Value |
|---|---|
| Team ID | 61 |
| Name | Cloud Agent / DevOps Automation |
| Role | AGENTS_OS domain development automation: CI/CD pipelines, quality scans, unit-test infrastructure, Agents_OS V2 orchestration support, scan reports and known-bug intake data. |
| Scope | AGENTS_OS domain only: `agents_os_v2/`, `.github/workflows/`, `tests/unit/`, quality tooling configs (`ui/.eslintrc.cjs`, `api/mypy.ini`), quality scan reports, cloud-agent execution artifacts. |
| Authority | Create and maintain CI/CD pipelines; run code-quality scans (`bandit`, `pip-audit`, `detect-secrets`, `mypy`, `ESLint`, `npm audit`); generate unit tests; build and maintain Agents_OS V2 orchestration code; produce quality scan and known-bug reports. |
| Non-authority | Must not change production application code (`api/`, `ui/`) without Team 10 mandate; must not write canonical `documentation/` directly; must not approve gates; does not replace Team 50 QA/FAV or Team 90 validation authority. |
| Reports to | Team 10 for task orchestration; Team 00 for strategic direction. |

## 1.2) Team 51 registration record (canonical)

| Field | Value |
|---|---|
| Team ID | 51 |
| Name | Agents_OS QA Agent |
| Role | QA child team of Team 50 for AGENTS_OS domain. |
| Scope | `agents_os_v2/`, pipeline QA evidence, FAST_2.5 / GATE_5-equivalent checks in AGENTS_OS flow. |
| Authority | Run Team-50-equivalent QA procedures: pytest, mypy, quality scans; produce PASS/FAIL QA reports; block progression until QA PASS. |
| Non-authority | Must not execute TIKTRACK QA lane (Team 50 ownership); must not replace Team 90 gate authority; must not bypass Team 10 orchestration. |
| Reports to | Team 10 for orchestration; Team 100 for AGENTS_OS architecture lane. |

## 1.3) Team 191 registration record (canonical)

| Field | Value |
|---|---|
| Team ID | 191 |
| Name | Git Governance Operations |
| Role | Child team of Team 190 for Git workflow governance and pre-push guard operational reliability. |
| Scope | Git operations and repository hygiene only: commit/push blockers, pre-push guard triage (`DATE-LINT`, `SYNC CHECK`, `SNAPSHOT CHECK`), clean-tree enforcement, historical-record/date-header normalization, guard evidence packaging. |
| Authority | Execute technical remediation for non-semantic Git blockers; run check/write sync tools and snapshot refresh tools; prepare blocker reports and recommended routing. |
| Non-authority | Must not issue constitutional gate verdicts; must not alter business logic under cover of Git fixes; must not override policy semantics without Team 190/Team 00 ruling. |
| Reports to | Team 190 (primary), Team 10 (operational coordination). |

## 1.4) Team 110 registration record (canonical) — AOS Domain Architect (IDE)

| Field | Value |
|---|---|
| Team ID | 110 |
| Name | AOS Domain Architect (IDE) |
| Role | AOS v3 spec packages, Entity Dictionary / ER continuity, code-aware review; **pushback** obligation when AOS domain quality is at risk (D-14). |
| Engine | IDE (Cursor, Gemini Code Assist, Codex — per activation prompt) |
| Authority | Produce and revise AOS specs and structured feedback **for Team 100 synthesis**; recommend; escalate to Team 00 on Iron Rules / intent conflicts. |
| Non-authority | Does not replace Team 100 program authority or Principal on product intent; does not issue final constitutional verdicts (Team 190). |
| **Reporting line (Option B — hub §4.1)** | Delivers AOS v3 spec artifacts **to Team 100** as execution of **Principal-authorized** program work. **Team 00** remains final authority for escalations, Iron Rules, and human-gate outcomes. |
| Communication output | `_COMMUNICATION/team_101/` (legacy folder path; roster id **team_110** is canonical in state/UI). |

## 1.5) Team 111 registration record (canonical) — TikTrack Domain Architect (IDE)

| Field | Value |
|---|---|
| Team ID | 111 |
| Name | TikTrack Domain Architect (IDE) |
| Role | TikTrack domain LOD200/LLD400 and architectural review pattern — mirror of Team 110 for TikTrack. |
| Reporting line | Same **Option B** pattern: handoff **to Team 100** under Principal frame; **Team 00** for escalations and Iron Rules. |
| Communication output | `_COMMUNICATION/team_102/` (legacy folder path; roster id **team_111** canonical in state/UI). |

## 1.6) Parent/child squad pattern (x0 / x1) + 4-layer context (hub §10)

For **every** mirrored pair (e.g. 10/11 Gateway, 20/21 Backend, 30/31 Frontend, 50/51 QA, 60/61 DevOps, 70/71 Documentation):

1. **Shared base definition** — one template describes the pair’s role class (e.g. “Gateway squad template”).  
2. **Inheritance** — child inherits defaults (Iron Rules slice, routing expectations, layer-2 footprint).  
3. **Child override** — domain-specific deltas live in **Layer 4** procedure + documented Layer 1 identity notes.  
4. **4-layer context injection** — loaders MUST bind **domain + squad id** so an agent never runs as “generic 10” when activated as **11** (or generic 50 vs **51**, etc.).  

Reference taxonomy: `TEAM_TAXONOMY_v1.0.1.md`, roster: `TEAMS_ROSTER_v1.0.0.json`.

---

## 2) Rule: scope by domain

A Work Package must assign implementation **by domain** — Backend→20, Frontend→30, UI/Design→40, Infrastructure→60, Automation/Cloud CI→61. **Do not assume one squad (e.g. 20) covers the whole product** unless the package scope is explicitly limited (e.g. backend-only).

- **Backend/runtime-only package:** Scope = 20 (+ 60 if runner/infra needed); 30 and 40 out of scope.
- **Frontend-only package:** Scope = 30 (+ 40 if design/assets needed).
- **Full-stack package (TIKTRACK/SHARED):** Scope = 20 + 30 + 40 + 60 as needed; each in-scope squad receives explicit mandate and prompt.
- **Automation / Cloud tooling package:** Scope = 61 for CI, quality scans, unit-test infra, and Agents_OS V2 automation; include 60 only when manual platform/runtime changes are required.
- **QA by domain:** TIKTRACK QA/FAV = Team 50; AGENTS_OS QA (Team 50 child model) = Team 51.
- **AGENTS_OS-only development package:** Execution scope = Team 61 (with Team 60 as needed for platform/runtime), QA scope = Team 51, validation scope = Teams 90/190.
- **Git-governance operations package:** Execution scope = Team 191; constitutional/policy escalation scope = Team 190.
- **Gateway checklist (hub §5):** Before any agent promotes to `documentation/`, confirm **correct owner lane** (Team 170 vs Team 70 vs Team 100) to avoid registry drift.

---

## 3) Team 10 — Mode-Aware Definition + pipeline ownership (hub §12)

**Canonical role (2026-03-17):** Work Plan Generator. **WSM** and **runtime pipeline state** are owned by the **pipeline engine** and defined hooks — **not** by manual “Team 10 updates state on every micro-step” habits.

**LEGACY DEPRECATED (hub §12):** Any runbook or instruction that states Team 10 (or Team 11) **must routinely mutate WSM / dashboard state** for each pipeline tick is **drift** from the current design. Replace with: **pipeline code + operator CLI** own transitions; **human / Principal** only at **HITL** gates. Team 10 remains valid for **GATE_3 work-plan authoring**, **mandate packaging**, and **knowledge-promotion routing** per domain split.

| Mode | Role | Scope |
|------|------|-------|
| **Mode 1** (Legacy, no AOS pipeline) | Process Coordinator + Work Plan Generator | Receives verdicts from 190/50/90; routes per `TEAM_10_MODE1_ROUTING_TABLE_v1.0.0.md` (deterministic); activates next team. **Routine WSM updates = pipeline/orchestrator**, not manual Team 10 mutation. |
| **Mode 2** (AOS + Dashboard) | Work Plan Generator (GATE_3) | GATE_3 work plan only; GATE_4 build oversight, Team 61 activation. Does NOT route between gates (**pipeline does**). Does NOT issue owner_next_action. Does NOT update WSM directly. |
| **Mode 3** (Full-auto AOS) | Technical Consultation Authority | On-demand escalation for complex/risky builds. Pipeline fully replaces process coordination. |

---

## 4) Team 10 orchestration (Mode 1)

Team 10 (Gateway) is owner of GATE_3 (Implementation). For every open Work Package after GATE_3 sub-stage G3.5 (work-plan validation with Team 90) PASS:

1. Determine which squads (20/30/40/60) are in scope from WORK_PACKAGE_DEFINITION.
2. Issue **one** mandate/prompt per in-scope squad (no single-squad default for full product).
3. Execution plan (e.g. EXECUTION_AND_TEAM_PROMPTS) must list: (1) which squads are in scope, (2) mandate/prompt per squad, (3) order and handoffs so the deliverable is a complete, working product.

**Domain constraint:** Team 10 operational lane is TIKTRACK and SHARED programs. AGENTS_OS-only implementation execution is Team 61 lane (with Team 100 architectural authority), while Team 10 remains synchronized when cross-domain dependencies exist.

---

## 5) Pipeline Fidelity Suite (PFS)

Canonical name and definition: **`PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md` §3**. PFS is **tooling/harness** tied to pipeline + dashboard — **not** new roster squads.

---

## 5.1) Reporting Line — AOS v3 Domain Architects (canonical, 2026-03-26)

**Team 110** (AOS Domain Architect IDE, formerly team_101) delivers AOS v3 spec artifacts  
to **Team 100** (Chief Architect) under Principal-authorized program.  
**Team 00** (Principal) = escalations + Iron Rules + gate approval only.

**Team 111** (TikTrack Domain Architect IDE, formerly team_102) — same model for TikTrack domain.

Authority chain: Team 00 → Team 100 → Team 110/111  
Spec delivery: Team 110/111 → Team 100 (for synthesis/merge)  
Gate approval: Team 00 only (never delegated for spec gates)

---

## 6) Mirror

`.cursorrules` may mirror this mapping for tooling; governance SSOT for role and scope is **this document (v1.0.1)**.

## 7) Roster Maintenance Rule

This document must be updated whenever a new squad is added. Missing squad definition causes operational confusion and invalid routing.

---

**log_entry | TEAM_170 | TEAM_DEVELOPMENT_ROLE_MAPPING | v1.0.1_LOCKED | 2026-03-26**  
**log_entry | TEAM_170 | TEAM_DEVELOPMENT_ROLE_MAPPING | CANON_PRINCIPLES_TEAM_101_MANDATE | 2026-03-26**  
**log_entry | TEAM_170 | TEAM_DEVELOPMENT_ROLE_MAPPING | AOS_V3_RENUMBERING_REPORTING_LINE | 2026-03-26**
