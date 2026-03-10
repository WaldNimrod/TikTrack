# TEAM_DEVELOPMENT_ROLE_MAPPING v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0  
**owner:** Team 170 (canonical); consumed by Team 10 for scope and orchestration  
**date:** 2026-02-23  
**status:** LOCKED  
**purpose:** Single canonical source for development squad roles and Team 10 orchestration rule. `.cursorrules` is a tooling mirror only; this document is governance SSOT.

**IRON RULE:** Team 50 = QA + FAV for TIKTRACK domain; Team 51 = QA for AGENTS_OS domain (child QA team inheriting Team 50 standards/procedures with domain split). NEVER assign QA/testing/FAV to Team 40. Team 40 = UI Assets & Design ONLY. Source: `ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md` (2026-03-02, Nimrod-approved) + `ARCHITECT_DIRECTIVE_AGENTS_OS_FAST_TRACK_DEFAULT_v1.0.0.md` (2026-03-10).
**DOMAIN SPLIT LOCK (2026-03-11):** Teams 10/20/30/40/50 operate in TIKTRACK or SHARED programs only; Team 60 operates in all domains; Teams 90+190 are cross-domain validators; Team 61 is AGENTS_OS-only development/automation.

---

## 1) Development squad mapping (canonical)

| Squad ID | Role | Responsibility |
|----------|------|----------------|
| **Team 20** | Backend Implementation | Server-side: API, logic, DB, services, runtime — TIKTRACK and SHARED programs only. |
| **Team 30** | Frontend Execution | Client-side: components, pages, API integration — TIKTRACK and SHARED programs only. |
| **Team 40** | UI Assets & Design | Design, design tokens, UI assets, visual consistency — TIKTRACK and SHARED programs only. |
| **Team 50** | QA & FAV | Test scripts, E2E suites, regression, final acceptance validation (FAV), SOP-013 seals — TIKTRACK and SHARED programs only. |
| **Team 51** | Agents_OS QA (child of Team 50) | Inherits Team 50 QA/FAV standards and procedures; executes QA for AGENTS_OS domain only (FAST_2.5 / GATE_5-equivalent). |
| **Team 60** | DevOps & Platform | Infrastructure, runtimes, CI/CD, platform — all domains (TIKTRACK + AGENTS_OS + SHARED). |
| **Team 61** | Cloud Agent / DevOps Automation | CI/CD automation, quality scans, unit-test generation, Agents_OS V2 automation, cloud execution reports — AGENTS_OS domain only. |
| **Team 70** | Documentation (TIKTRACK + Repository Maintenance) | TIKTRACK documentation lane, release docs, archive/folder hygiene, communication-maintenance operations across repository. |
| **Team 90** | Validation & Gate Management | GATE_5-GATE_8 validation process, validation packages, quality gate coordination — cross-domain (TIKTRACK + AGENTS_OS + SHARED). |
| **Team 100** | Architectural Review | Stage-level architectural authority, GATE_6 architectural review, program authority. |
| **Team 170** | Spec & Governance (AGENTS_OS + Governance Canonical) | LOD contracts, AGENTS_OS/governance canonical maintenance, registry synchronization, governance procedure locks. |
| **Team 190** | Constitutional Validation | GATE_0-GATE_2 constitutional integrity and validation authority — cross-domain (TIKTRACK + AGENTS_OS + SHARED). |

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

---

## 2) Rule: scope by domain

A Work Package must assign implementation **by domain** — Backend→20, Frontend→30, UI/Design→40, Infrastructure→60, Automation/Cloud CI→61. **Do not assume one squad (e.g. 20) covers the whole product** unless the package scope is explicitly limited (e.g. backend-only).

- **Backend/runtime-only package:** Scope = 20 (+ 60 if runner/infra needed); 30 and 40 out of scope.
- **Frontend-only package:** Scope = 30 (+ 40 if design/assets needed).
- **Full-stack package (TIKTRACK/SHARED):** Scope = 20 + 30 + 40 + 60 as needed; each in-scope squad receives explicit mandate and prompt.
- **Automation / Cloud tooling package:** Scope = 61 for CI, quality scans, unit-test infra, and Agents_OS V2 automation; include 60 only when manual platform/runtime changes are required.
- **QA by domain:** TIKTRACK QA/FAV = Team 50; AGENTS_OS QA (Team 50 child model) = Team 51.
- **AGENTS_OS-only development package:** Execution scope = Team 61 (with Team 60 as needed for platform/runtime), QA scope = Team 51, validation scope = Teams 90/190.

---

## 3) Team 10 orchestration

Team 10 (Gateway) is owner of GATE_3 (Implementation). For every open Work Package after GATE_3 sub-stage G3.5 (work-plan validation with Team 90) PASS:

1. Determine which squads (20/30/40/60) are in scope from WORK_PACKAGE_DEFINITION.
2. Issue **one** mandate/prompt per in-scope squad (no single-squad default for full product).
3. Execution plan (e.g. EXECUTION_AND_TEAM_PROMPTS) must list: (1) which squads are in scope, (2) mandate/prompt per squad, (3) order and handoffs so the deliverable is a complete, working product.

**Domain constraint:** Team 10 operational lane is TIKTRACK and SHARED programs. AGENTS_OS-only implementation execution is Team 61 lane (with Team 100 architectural authority), while Team 10 remains synchronized when cross-domain dependencies exist.

---

## 4) Mirror

`.cursorrules` may mirror this mapping for tooling; governance SSOT for role and scope is this document.

## 5) Roster Maintenance Rule

This document must be updated whenever a new squad is added. Missing squad definition causes operational confusion and invalid routing.

---

**log_entry | TEAM_170 | TEAM_DEVELOPMENT_ROLE_MAPPING | v1.0.0_LOCKED | 2026-02-23**
**log_entry | TEAM_170 | TEAM_DEVELOPMENT_ROLE_MAPPING | TEAM_ROSTER_LOCK_APPLIED_v1.0.0 | 2026-03-03**
**log_entry | TEAM_190 | TEAM_DEVELOPMENT_ROLE_MAPPING | TEAM_51_CHILD_QA_MODEL_REGISTERED_WITH_DOMAIN_SPLIT | 2026-03-11**
**log_entry | TEAM_190 | TEAM_DEVELOPMENT_ROLE_MAPPING | DOMAIN_SPLIT_REINFORCED_10_20_30_40_50__60__90_190__61 | 2026-03-11**
