# TEAM_DEVELOPMENT_ROLE_MAPPING v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0  
**owner:** Team 170 (canonical); consumed by Team 10 for scope and orchestration  
**date:** 2026-02-23  
**status:** LOCKED  
**purpose:** Single canonical source for development squad roles and Team 10 orchestration rule. `.cursorrules` is a tooling mirror only; this document is governance SSOT.

---

## 1) Development squad mapping (canonical)

| Squad ID | Role | Responsibility |
|----------|------|----------------|
| **Team 20** | Backend Implementation | Server-side: API, logic, DB, services, runtime. |
| **Team 30** | Frontend Execution | Client-side: components, pages, API integration. |
| **Team 40** | UI Assets & Design | Design, design tokens, UI assets, visual consistency. |
| **Team 60** | DevOps & Platform | Infrastructure, runtimes, CI/CD, platform. |

---

## 2) Rule: scope by domain

A Work Package must assign implementation **by domain** — Backend→20, Frontend→30, UI/Design→40, Infrastructure→60. **Do not assume one squad (e.g. 20) covers the whole product** unless the package scope is explicitly limited (e.g. backend-only).

- **Backend/runtime-only package:** Scope = 20 (+ 60 if runner/infra needed); 30 and 40 out of scope.
- **Frontend-only package:** Scope = 30 (+ 40 if design/assets needed).
- **Full-stack package:** Scope = 20 + 30 + 40 + 60 as needed; each in-scope squad receives explicit mandate and prompt.

---

## 3) Team 10 orchestration

Team 10 (Gateway) is owner of GATE_3 (Implementation). For every open Work Package after PRE_GATE_3 PASS:

1. Determine which squads (20/30/40/60) are in scope from WORK_PACKAGE_DEFINITION.
2. Issue **one** mandate/prompt per in-scope squad (no single-squad default for full product).
3. Execution plan (e.g. EXECUTION_AND_TEAM_PROMPTS) must list: (1) which squads are in scope, (2) mandate/prompt per squad, (3) order and handoffs so the deliverable is a complete, working product.

---

## 4) Mirror

`.cursorrules` may mirror this mapping for tooling; governance SSOT for role and scope is this document.

---

**log_entry | TEAM_170 | TEAM_DEVELOPMENT_ROLE_MAPPING | v1.0.0_LOCKED | 2026-02-23**
