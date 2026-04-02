---
id: TEAM_11_TO_TEAM_61_AOS_V3_BUILD_ACTIVATION_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 61 (AOS DevOps & Platform)
cc: Team 100 (Chief Architect), Team 111 (DDL), Team 21 (AOS Backend)
date: 2026-03-27
type: BUILD_ACTIVATION — GATE_0 infrastructure
domain: agents_os
branch: aos-v3
authority: TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md
team_100_clarifications: embedded (API scaffold boundary, seed validation)---

# TEAM 11 → TEAM 61 | AOS v3 BUILD | GATE_0 activation

## Layer 1 — Identity

| Field | Value |
|------|--------|
| Team ID | `team_61` |
| Role | AOS DevOps — environment, DB apply, FILE_INDEX bootstrap, **minimal** API shell, `seed.py` / `definition.yaml`, `cli/pipeline_run.sh`, cleanup artifacts at GATE_5 |
| Domain | **agents_os only** |
| Anti-pattern | Do **not** take on Team 21 or Team 31 work “because it is faster.” Infra and thin shell only. |

---

## Layer 2 — Iron Rules (subset)

| ID | Rule |
|----|------|
| **IR-1** | Do not use v2 `pipeline_run.sh` for this track; v3 uses `agents_os_v3/cli/pipeline_run.sh` (your deliverable). Commits to `aos-v3`. |
| **IR-2** | **No modifications** under `agents_os_v2/`. |
| **IR-3** | Every path under `agents_os_v3/` → `FILE_INDEX.json` before commit. |
| **IR-9** | `GET /api/events/stream` exists at GATE_0 as **skeleton** only (see Team 100 Note 1 below). |

---

## Layer 3 — Context

**Work package:** `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md`

**Infrastructure (locked):** Port **8090**; API prefix **`/api/`** (no `/v1/`). TikTrack uses 8082/8080.

**Prerequisites before GATE_0 PASS:**

1. **DDL v1.0.2** delivered by **Team 111** (hard blocker — do not claim GATE_0 complete without it).
2. **Team 191:** branch `aos-v3` + `AGENTS.md` updated — confirm with gateway if unsure.

**FILE_INDEX seed:** Use WP v1.0.3 **D.8** JSON template for initial UI file entries.

---

## Team 100 clarification — Note 1: API scaffold boundary (MANDATORY)

Team 61 delivers **only**:

- `FastAPI()` application, **lifespan**, **CORS** per project norms.
- **Router mount point** on `/api` so **Team 21** can attach route modules.
- **Functional:** `GET /api/health` → 200.
- **SSE skeleton:** `GET /api/events/stream` — endpoint and event-loop wiring; **no** broadcast logic (Team 21 implements `audit/sse.py` and full behavior).

**Team 21 owns ALL business route definitions** (e.g. `POST /api/runs`, `GET /api/state`, and every endpoint in WP D.6). **Team 61 must NOT create placeholder or 501 stub routes** for those endpoints.

If WP wording appears to require otherwise, **Team 100 ruling + this note** govern the scaffold boundary.

---

## Team 100 clarification — Note 2: Seed data validation (MANDATORY)

- `definition.yaml` and `seed.py` **must align** with:
  - `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md`
  - `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md` **§3 — Seed Data** (starts ~line 446 in current file; re-verify line numbers if the spec file changes).

**Team 100 validates seed accuracy** as part of **GATE_1** review. Team 11 will include seed evidence in the GATE_1 package to Team 100.

---

## Layer 4 — Task checklist (GATE_0)

Per WP **D.3 Team 61** and **D.4 Gate 0**:

- [ ] **`FILE_INDEX.json`** — all `agents_os_v3/ui/*` entries per **D.8** (status `NEW`); extend as you add infra files (IR-3).
- [ ] **Apply DDL v1.0.2** migrations from Team 111 — zero errors.
- [ ] **`definition.yaml` + `seed.py`** — successful run; satisfy **Note 2** above.
- [ ] **FastAPI** in `modules/management/api.py` — port **8090**, mount `/api`, satisfy **Note 1** above.
- [ ] **`GET /api/health`** → 200.
- [ ] **`GET /api/events/stream`** skeleton only (no broadcast).
- [ ] **`cli/pipeline_run.sh`** — v3 CLI wrapper (tested further at GATE_4).
- [ ] Pre-commit / Team **191** governance hooks as directed by repo canon.
- [ ] Confirm **`agents_os_v2/`** unchanged (diff clean).

---

## GATE_0 acceptance (WP D.4)

Team 11 will mark GATE_0 when the checklist and prerequisites are met and evidence is posted under `_COMMUNICATION/team_61/` or as directed.

---

**log_entry | TEAM_11 | AOS_V3_BUILD | TEAM_61_GATE_0_ACTIVATION | ISSUED | 2026-03-27**
