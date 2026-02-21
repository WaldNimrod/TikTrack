# DOMAIN_STRUCTURE_MAP

**id:** TEAM_190_DOMAIN_STRUCTURE_MAP_2026-02-21  
**owner:** Team 190 (READ_ONLY intelligence)  
**date:** 2026-02-21  
**scope:** Repository-level domain structure and cross-reference scan

---

## 1) Top-level directory map (current state)

- `./_COMMUNICATION`
- `./api`
- `./ui`
- `./documentation`
- `./scripts`
- `./tests`
- `./blueprints`
- `./storage`
- `./raw_inputs`
- `./_ARCHITECTURAL_INBOX`
- `./archive`
- plus technical folders (`.git`, `.cursor`, `.vscode`, caches/temp)

Structural volume snapshot (includes vendor/build folders):
- `_COMMUNICATION`: `dirs=188`, `files=3783`
- `api`: `dirs=742`, `files=7182`
- `ui`: `dirs=1268`, `files=10317`
- `documentation`: `dirs=42`, `files=263`

---

## 2) Agents_OS folder existence and content

- **`Agents_OS/` folder exists:** **NO**
- Expected scan targets `Agents_OS/*` and `Agents_OS/documentation/*`: **not present** in repository tree.

**Cross-reference implication:** documents repeatedly assert “Agents_OS in separate root folder” while no physical root folder currently exists.

---

## 3) TikTrack implementation folders (active code domains)

Primary implementation domains detected under repository root:
- `api/` (backend services/models/routers/schemas/tests)
- `ui/` (frontend app/infrastructure/build output)
- `tests/` (QA/E2E/integration harness)
- `scripts/` (ops/migrations/helpers)

These form the current concrete implementation surface.

---

## 4) documentation scope map

### `documentation/docs-system`
- Sub-scope distribution:
  - `01-ARCHITECTURE`: 68 markdown files
  - `02-SERVER`: 2 markdown files
  - `07-DESIGN`: 11 markdown files
  - `08-PRODUCT`: 1 markdown file
- `Agent_OS`/`Agents_OS` terminology: **0 files**
- `TikTrack` terminology: **8 files**

### `documentation/docs-governance`
- Sub-scope distribution:
  - `00-FOUNDATIONS`: 2 markdown files
  - `01-POLICIES`: 14 markdown files
  - `02-PROCEDURES`: 22 markdown files
  - `06-CONTRACTS`: 2 markdown files
  - `09-GOVERNANCE`: 19 markdown files
  - `99-archive`: 1 markdown file
- `Agent_OS`/`Agents_OS` terminology: **0 files**
- `TikTrack` terminology: **11 files**

---

## 5) Cross-reference flags (domain separation)

### A. Files inside Agents_OS referencing TikTrack paths
- **Result:** N/A (folder missing).
- **Risk flag:** cannot verify isolation by physical domain boundary.

### B. Files outside Agents_OS referencing Agent_OS logic
- **Result:** **87 markdown files** reference `Agents_OS`/`Agent OS` outside any `Agents_OS/` root.
- Distribution snapshot:
  - `_COMMUNICATION/team_170`: 27 files
  - `_COMMUNICATION/team_190`: 17 files
  - `_COMMUNICATION/team_10`: 15 files
  - `_COMMUNICATION/_ARCHITECT_INBOX`: 11 files
  - `_COMMUNICATION/team_100`: 4 files
  - `_COMMUNICATION/_Architects_Decisions`: 3 files
  - `_ARCHITECTURAL_INBOX/...`: 3 files

Representative evidence paths:
- `_COMMUNICATION/team_10/TEAM_10_S001_P001_WP001_WORK_PACKAGE_DEFINITION.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_S001_P001_WP001_QA_SUBMISSION_AND_PROMPT.md`
- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S001_P001_WP001_QA_REPORT.md`
- `_ARCHITECTURAL_INBOX/AGENT_OS_PHASE_1/INFRASTRUCTURE_STAGE_1/MB3A_SPEC_PACKAGE_v1.4.0/SUBMISSION_v1.4.0/SPEC_PACKAGE.md`

### C. Legacy inbox path persistence
- Domain/governance artifacts still exist under root `_ARCHITECTURAL_INBOX/` while canonical submission channel is `_COMMUNICATION/_ARCHITECT_INBOX/`.
- Evidence:
  - `_ARCHITECTURAL_INBOX/AGENT_OS_PHASE_1/INFRASTRUCTURE_STAGE_1/MB3A_SPEC_PACKAGE_v1.4.0/SUBMISSION_v1.4.0/COVER_NOTE.md`

---

**log_entry | TEAM_190 | DOMAIN_STRUCTURE_MAP | GENERATED | 2026-02-21**
