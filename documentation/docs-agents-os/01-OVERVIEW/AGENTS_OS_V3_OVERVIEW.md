# Agents_OS v3 — Overview
## documentation/docs-agents-os/01-OVERVIEW/AGENTS_OS_V3_OVERVIEW.md

**project_domain:** AGENTS_OS  
**owner:** Team 71 (AOS Documentation)  
**date:** 2026-03-29  
**status:** Active

**Traceability:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md` · `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_71_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md`

---

## 1. What is Agents_OS v3

Agents_OS **v3** is the greenfield **BUILD** implementation under `agents_os_v3/`: a FastAPI management API, PostgreSQL schema (migration `001`), seed data, optional static UI under `agents_os_v3/ui/`, and supporting CLI under `agents_os_v3/cli/`. It implements pipeline run lifecycle, configuration surfaces (templates, routing rules, policies), audit/SSE, and governance-backed prompting — as **encoded in the repository**, not as a separate product from TikTrack.

**Work branch:** `aos-v3` (push `origin/aos-v3` per [AGENTS.md](../../../AGENTS.md)).

**BUILD closure:** `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_11_AOS_V3_GATE_5_BUILD_COMPLETE_VERDICT_v1.0.0.md` (GATE_5 PASS).

---

## 2. v3 vs v2 (coexistence)

| Topic | v2 (legacy pipeline track) | v3 (BUILD track) |
|--------|----------------------------|------------------|
| Orchestrator / CLI | `pipeline_run.sh`, `agents_os_v2/` | `agents_os_v3/cli/pipeline_run.py` (and shell wrapper if present in index) |
| Web UI | `agents_os/scripts/start_ui_server.sh` — **port 8092** (v2 pipeline UI; locked) | Static HTML/JS under `agents_os_v3/ui/` **mounted by the v3 FastAPI app** on the same process as the API (default **8090**): `GET /` serves Pipeline HTML; assets under `/v3/*`; shared v2-era CSS under `/agents_os/ui/*`. Optional standalone `http.server` on **8778** for dev/E2E — see [AGENTS_OS_V3_NETWORK_PORTS_AND_UI_ENTRY_v1.0.0.md](../02-ARCHITECTURE/AGENTS_OS_V3_NETWORK_PORTS_AND_UI_ENTRY_v1.0.0.md) and [AGENTS_OS_V3_DEVELOPER_RUNBOOK.md](../04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md). |
| API | Not the same surface | `uvicorn agents_os_v3.modules.management.api:app` — default port **8090** |
| Documentation (canon) | Existing files under `documentation/docs-agents-os/` **without** `AGENTS_OS_V3_` prefix | This file and siblings prefixed `AGENTS_OS_V3_` only |

**Iron Rule:** Do not treat v2 docs as describing v3 behavior. Cross-check v3 behavior against `agents_os_v3/` and OpenAPI (`/docs` on the v3 server).

**v2 freeze:** `agents_os_v2/` is frozen; v3 work stays under `agents_os_v3/`. See [AGENTS.md](../../../AGENTS.md) and `bash scripts/check_aos_v3_build_governance.sh`.

---

## 3. Where to read next

| Document | Path |
|----------|------|
| Architecture | [AGENTS_OS_V3_ARCHITECTURE_OVERVIEW.md](../02-ARCHITECTURE/AGENTS_OS_V3_ARCHITECTURE_OVERVIEW.md) |
| Ports, `/` entry, v2 vs v3 (LOCKED) | [AGENTS_OS_V3_NETWORK_PORTS_AND_UI_ENTRY_v1.0.0.md](../02-ARCHITECTURE/AGENTS_OS_V3_NETWORK_PORTS_AND_UI_ENTRY_v1.0.0.md) |
| HTTP API | [AGENTS_OS_V3_API_REFERENCE.md](../02-ARCHITECTURE/AGENTS_OS_V3_API_REFERENCE.md) |
| Local run / DB / ports | [AGENTS_OS_V3_DEVELOPER_RUNBOOK.md](../04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md) |
| Master index (all Agents_OS docs) | [00_AGENTS_OS_MASTER_INDEX.md](../00_AGENTS_OS_MASTER_INDEX.md) |

**Code-adjacent:** Canonical narrative lives under `documentation/docs-agents-os/`. There is **no** `agents_os_v3/docs/` tree. A future `agents_os_v3/README.md` (Team 21) should link here.

---

## 4. Operating procedures (governance)

Cross-program workflow for Agents_OS (gates, teams, V2 procedure) remains in:

`documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`

v3 BUILD track does not use `pipeline_run.sh` as the primary orchestrator for this codebase path; use the Developer Runbook for v3 local operations.

---

**log_entry | TEAM_71 | AOS_V3 | GATE_DOC_PHASE_B | OVERVIEW | 2026-03-28**
**log_entry | TEAM_170 | AOS_V3 | CANONICAL_PROMOTION | OVERVIEW_V2_PORT_UI_FASTAPI_MOUNT | 2026-03-29**
