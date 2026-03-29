# Agents_OS v3 — Local validation checklist (template)
## documentation/docs-agents-os/05-TEMPLATES/AGENTS_OS_V3_LOCAL_VALIDATION_CHECKLIST.md

**project_domain:** AGENTS_OS  
**owner:** Team 71 (AOS Documentation)  
**date:** 2026-03-28  
**status:** Active — working template for operators / QA

**Traceability:** Directive 3B · Team 11 → Team 71 GATE_DOC Phase B mandate (2026-03-28)

**Companion:** [AGENTS_OS_V3_DEVELOPER_RUNBOOK.md](../04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md)

---

Copy this section into a dated evidence note under `_COMMUNICATION/team_<id>/` when recording a validation pass.

## Environment

- [ ] `agents_os_v3/.env` exists; `AOS_V3_DATABASE_URL` set (not TikTrack DB)
- [ ] Optional: `AOS_V3_VENV` / venv activated if required

## Database

- [ ] `bash scripts/init_aos_v3_database.sh` completes without error (or DB already at expected revision + seed)

## API

- [ ] No listener conflict on chosen port (stop v2 UI or set `AOS_V3_SERVER_PORT`)
- [ ] `bash scripts/start-aos-v3-server.sh` (or bootstrap) starts server
- [ ] `curl -s http://127.0.0.1:<PORT>/api/health` returns `{"status":"ok"}`
- [ ] OpenAPI loads at `http://127.0.0.1:<PORT>/docs`

## Actor header (sample mutation)

- [ ] A mutating call that requires `X-Actor-Team-Id` fails with **400** when header is missing
- [ ] Same call succeeds when header is present (use a valid team id from seed / DB)

## UI (optional)

- [ ] `bash agents_os_v3/ui/run_preflight.sh` exits 0
- [ ] With API up: `AOS_V3_API_BASE=http://127.0.0.1:<PORT> bash agents_os_v3/ui/run_preflight.sh` exits 0

## Governance (on branch `aos-v3`)

- [ ] `bash scripts/check_aos_v3_build_governance.sh` exits 0 (when applicable to your change)

## Notes

| Field | Value |
|-------|--------|
| Date | |
| Branch | |
| PORT used | |
| Operator | |

---

**log_entry | TEAM_71 | AOS_V3 | GATE_DOC_PHASE_B | TEMPLATE_VALIDATION | 2026-03-28**
