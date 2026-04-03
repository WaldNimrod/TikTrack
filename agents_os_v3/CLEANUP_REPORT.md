# AOS v3 — Cleanup Report (FILE_INDEX + infrastructure)

**Owner:** Team 61 (AOS DevOps & Platform)  
**Snapshot:** 2026-03-28  
**Gate:** GATE_5 (BUILD closure track)  
**Authority:** `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v1.0.0.md` §3 + `TEAM_11_AOS_V3_GATE_5_COORDINATION_v1.0.0.md`

This document is the **committed SSOT** for (a) FILE_INDEX-derived cleanup queues and (b) **final infrastructure hygiene** before BUILD closure. Full execution of v2 deletions awaits **Team 00** approval per the Architect Directive §3.2–3.3.

---

## 1. FILE_INDEX-derived queues (Directive §3.1)

### 1.1 `DEPRECATED_V2`

| Path | Owner | Action |
|------|--------|--------|
| *(none)* | — | No `DEPRECATED_V2` entries in `FILE_INDEX.json` at this snapshot. |

### 1.2 `MODIFIED_FROM_V2` (index label: `MODIFIED`)

These entries denote material evolution vs. early v3 baseline; **they do not authorize deleting `agents_os_v2/` paths** until post-merge cleanup is approved.

| Path |
|------|
| `agents_os_v3/definition.yaml` |
| `agents_os_v3/modules/definitions/constants.py` |
| `agents_os_v3/modules/definitions/models.py` |
| `agents_os_v3/modules/management/api.py` |
| `agents_os_v3/requirements.txt` |
| `agents_os_v3/seed.py` |
| `agents_os_v3/tests/test_layer1_repository.py` |
| `agents_os_v3/modules/state/machine.py` |
| `agents_os_v3/modules/state/repository.py` |
| `agents_os_v3/modules/management/portfolio.py` |
| `agents_os_v3/ui/app.js` |
| `agents_os_v3/ui/flow.html` |
| `agents_os_v3/ui/run_preflight.sh` |

**Count:** 13

### 1.3 `SHARED`

| Path | Notes |
|------|--------|
| *(none)* | No `SHARED` entries in `FILE_INDEX.json` at this snapshot. |

---

## 2. Infrastructure hygiene (GATE_5 — Team 61)

| Topic | SSOT / behaviour |
|--------|-------------------|
| **Secrets** | Operator copies `agents_os_v3/.env.example` → `agents_os_v3/.env` (gitignored). Never commit secrets. |
| **Runtime projection** | `agents_os_v3/pipeline_state.json` is gitignored; `scripts/check_aos_v3_build_governance.sh` excludes gitignored paths under `agents_os_v3/` via `git check-ignore`. |
| **DB isolation** | AOS: `AOS_V3_DATABASE_URL` only in `agents_os_v3/.env`. TikTrack: `api/.env`. Verify: `python3 scripts/verify_dual_domain_database_connectivity.py`. |
| **DB bootstrap** | `scripts/init_aos_v3_database.sh`, `agents_os_v3/db/ensure_local_postgres_for_aos.py` (Docker localhost). |
| **API lifecycle** | `scripts/start-aos-v3-server.sh` / `stop-aos-v3-server.sh` / `restart-aos-v3-server.sh` / `bootstrap_aos_v3_local.sh` (default port **8090**; conflicts with agents_os_v2 UI — one listener only unless `AOS_V3_SERVER_PORT` is set). |
| **Health** | `GET /api/health` on the v3 API base → `{"status":"ok"}` (GATE_0 contract). |
| **Logs** | Uvicorn logs go to the terminal or CI capture; `canary_gate4.sh` uses temp files under `/tmp` and removes them after each block. No committed log directories under `agents_os_v3/`. |
| **Governance check** | `bash scripts/check_aos_v3_build_governance.sh` — PASS required before commit on `agents_os_v3/`. |

---

## 3. Canary (GATE_5 — Block C with DB)

Per Team 11 coordination and Team 00 activation:

```bash
AOS_V3_DATABASE_URL=<db_url> AOS_V3_API_BASE=http://127.0.0.1:8090 \
  bash agents_os_v3/tests/canary_gate4.sh
```

Team 61: infra supports this command; **execution + PASS evidence** are owned by **Team 51** in the GATE_5 regression handoff unless Gateway requests a duplicate smoke.

---

## 4. Post-merge cleanup (Directive §3.2–3.3 — not executed here)

1. **Team 00** reviews this report + delta FILE_INDEX.  
2. **Team 61** executes approved deletions in `agents_os_v2/` / repo hygiene only after written approval.  
3. This file may be updated with a new snapshot date when queues change.

---

**log_entry | TEAM_61 | AOS_V3_BUILD | CLEANUP_REPORT | GATE_5_SNAPSHOT | 2026-03-28**
