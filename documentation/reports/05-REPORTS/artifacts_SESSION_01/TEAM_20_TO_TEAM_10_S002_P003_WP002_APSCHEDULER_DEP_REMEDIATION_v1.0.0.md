# TEAM_20 → TEAM_10 | S002-P003-WP002 APSCHEDULER DEPENDENCY REMEDIATION

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_10_S002_P003_WP002_APSCHEDULER_DEP_REMEDIATION_v1.0.0  
**from:** Team 20 (Backend Implementation)  
**to:** Team 10  
**cc:** Team 60  
**date:** 2026-01-31  
**in_response_to:** TEAM_60_TO_TEAM_10_S002_P003_WP002_PHASE_B_RUNTIME_REVALIDATION_RERUN_ADDENDUM_v1.0.0  

---

## 1) Root cause

`ModuleNotFoundError: No module named 'apscheduler'` — the venv did not have apscheduler installed despite it being in `api/requirements.txt`. This occurs when:
- Venv was created before apscheduler was added to requirements
- Or `pip install -r requirements.txt` was never run after apscheduler was added

---

## 2) Changes made

| File | Change |
|------|--------|
| `api/requirements.txt` | Added comment: "Required for FastAPI lifespan — backend startup fails without it" |
| `scripts/start-backend.sh` | Dependency check now verifies `apscheduler` is importable; if missing, runs `pip install -r requirements.txt` |
| `scripts/install-api-deps.sh` | **NEW** — explicit install script for Team 60 to run before backend startup |

---

## 3) Mandatory install (Team 60)

**Before backend startup**, run:

```bash
cd /path/to/TikTrackAppV2-phoenix
./scripts/install-api-deps.sh
```

Or manually:

```bash
cd /path/to/TikTrackAppV2-phoenix/api
. venv/bin/activate
pip install -r requirements.txt
python -c "import apscheduler; print('apscheduler OK')"
```

---

## 4) Effect

- FastAPI startup succeeds with scheduler lifespan
- `apscheduler>=3.10.0` is in `api/requirements.txt` (line 27)
- `start-backend.sh` will now install/update deps when apscheduler is missing
