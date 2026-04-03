---
id: TEAM_100_TO_TEAM_51_S003_P005_WP001_QA_ACTIVATION_v1.0.0
historical_record: true
from: Team 100 (Claude Code — Chief System Architect)
to: Team 51 (Cursor Composer — AOS QA & Functional Acceptance)
cc: Team 00 (Principal), Team 190 (OpenAI — Constitutional Validator)
date: 2026-04-02
type: QA_ACTIVATION
status: PENDING_QA
work_package_id: S003-P005-WP001
gate_id: GATE_4
domain: agents_os
engine_note: "Team 51 = Cursor Composer. Team 100 = Claude Code. Cross-engine validation required per Iron Rule."
mandate_ref: _COMMUNICATION/team_51/TEAM_100_TO_TEAM_51_PIPELINE_QUALITY_QA_MANDATE_v1.0.0.md
self_assessment_ref: _COMMUNICATION/team_51/TEAM_100_S003_P005_WP001_SELF_ASSESSMENT_EVIDENCE_v1.0.0.md
plan_ref: _COMMUNICATION/team_100/TEAM_100_PIPELINE_QUALITY_PLAN_v3.5.0.md---

# S003-P005-WP001 — QA Activation: Pipeline Quality Plan v3.5.0
## Team 51 (Cursor Composer) — Independent QA, Cross-Engine

---

## ⚠️ Cross-Engine Validation Notice

Team 100 (Claude Code) implemented this work package AND produced a self-assessment.
**Team 51 (Cursor Composer) must perform ALL verifications independently.**
Do NOT accept Team 100's self-assessment as evidence. Re-run every command yourself.

Iron Rule: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_CROSS_ENGINE_VALIDATION_PRINCIPLE_v1.0.0.md`

---

## §1 Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P005 |
| work_package_id | S003-P005-WP001 |
| gate_id | GATE_4 |
| domain | agents_os |
| date | 2026-04-02 |

---

## §2 Implementation Scope

All changes are in `agents_os_v3/` at repo root:
`/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/`

### Modified files:
| File | Change |
|------|--------|
| `modules/definitions/models.py` | BlockingFindingV1, StructuredVerdictV1, FeedbackIngestBody CANONICAL_AUTO |
| `modules/audit/ingestion.py` | _normalise_route_rec, sha256 fingerprint |
| `modules/management/api.py` | APScheduler layer2, context endpoints, feedback/stats, governance/status |
| `modules/management/use_cases.py` | structured_json param, auto-advance CANONICAL_AUTO-only |
| `modules/prompting/builder.py` | Token budget: section trim, approx_tokens meta |
| `modules/state/machine.py` | _validate_wp_id_format, WP ID regexes |
| `ui/app.js` | Route dropdown fix, SSE banner, live API wiring, governance UI |
| `ui/index.html` | Feedback banner div |
| `ui/style.css` | .aosv3-feedback-banner CSS |
| `ui/config.html` | Governance tab, polling interval control |

### Created files:
| File | Content |
|------|---------|
| `governance/team_51.md` | Team 51 governance (QA & Functional Acceptance) |
| `governance/team_61.md` | Team 61 governance (DevOps & Platform) |
| `governance/team_{10,11}.md` | Expanded with TRIGGER PROTOCOL |
| `governance/team_{20,30,40,50,70,71,90}.md` | New minimal governance files |

### Modified YAML:
| File | Change |
|------|--------|
| `definition.yaml` | TRIGGER PROTOCOL added to GATE_0, GATE_1(1.1,1.2), GATE_2 |

---

## §3 Automated Tests — Run First

### 3.1 Full test suite

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
python3 -m pytest agents_os_v3/tests/ -q --tb=short 2>&1 | tail -10
```

**Expected:** `133 passed, 42 skipped, 0 failed`
**Failure threshold:** ANY failed test = QA FAIL (blocking)

### 3.2 Collect-only (structure check)

```bash
python3 -m pytest agents_os_v3/tests/ --collect-only -q 2>&1 | tail -3
```

**Expected:** no collection errors

---

## §4 PQC Checklist — 9 Pipeline Quality Checks

### PQC-1: CANONICAL_AUTO mode exists and requires structured_json

```bash
grep -n "CANONICAL_AUTO\|BlockingFindingV1\|StructuredVerdictV1" \
  agents_os_v3/modules/definitions/models.py
```
Expected: ≥5 matches; `BlockingFindingV1` class, `StructuredVerdictV1` class, `CANONICAL_AUTO` in FeedbackIngestBody Literal.

```bash
grep -n "model_validator\|_check_by_mode\|structured_json required" \
  agents_os_v3/modules/definitions/models.py
```
Expected: `model_validator` imported, `_check_by_mode` validator present, error message `structured_json required for CANONICAL_AUTO`.

---

### PQC-2: Mode A strict — `route_recommendation: "full"` → Pydantic 422

```bash
grep -n 'route_recommendation.*Literal\|"doc".*"impl".*"arch"' \
  agents_os_v3/modules/definitions/models.py
```
Expected: `Optional[Literal["doc", "impl", "arch"]]` — `"full"` must NOT appear in the Literal.

**API Verification (requires DB):**
```bash
python3 -c "
import os; from pathlib import Path
env_path = Path('agents_os_v3/.env')
for line in env_path.read_text().splitlines():
    line = line.strip()
    if not line or line.startswith('#') or '=' not in line: continue
    k, _, v = line.partition('=')
    os.environ[k.strip()] = v.strip().strip('\"').strip(\"'\")
from fastapi.testclient import TestClient
from agents_os_v3.modules.management.api import create_app
client = TestClient(create_app(), raise_server_exceptions=False)
r = client.post('/api/runs/S003-P005-WP001/feedback',
    headers={'X-Actor-Team-Id': 'team_51'},
    json={'detection_mode': 'CANONICAL_AUTO', 'structured_json': {
        'schema_version': '1', 'verdict': 'PASS', 'confidence': 'HIGH',
        'summary': 'test', 'blocking_findings': [],
        'route_recommendation': 'full'
    }}
)
print(f'route_recommendation=full -> HTTP {r.status_code} (expected 422)')
"
```
Expected: `HTTP 422`

---

### PQC-3+4: Mode B/C/D normalization — `full` / `FULL` → `impl`

```bash
grep -n "_normalise_route_rec\|_ROUTE_REC_NORMALISE\|full.*impl" \
  agents_os_v3/modules/audit/ingestion.py
```
Expected: `_ROUTE_REC_NORMALISE: dict[str, str] = {"full": "impl"}` present.

```bash
python3 -c "
from agents_os_v3.modules.audit.ingestion import _normalise_route_rec
cases = [('full','impl'),('FULL','impl'),('impl','impl'),('doc','doc'),('arch','arch'),(None,None),('invalid',None)]
all_ok = all(_normalise_route_rec(i)==e for i,e in cases)
print('Route normalization:', 'PASS' if all_ok else 'FAIL')
for i,e in cases:
    got = _normalise_route_rec(i)
    print(f'  {repr(i)} -> {repr(got)}  {\"OK\" if got==e else \"FAIL (expected \"+repr(e)+\")\"}')
"
```
Expected: all 7 cases pass.

```bash
grep -n "_normalise_route_rec" agents_os_v3/modules/audit/ingestion.py
```
Expected: applied at **exactly 2 locations** (JSON_BLOCK path ≈ line 332 AND REGEX_EXTRACT path ≈ line 360).

---

### PQC-5: SSE feedback banner — code present in HTML + CSS + JS

```bash
grep -n "aosv3-feedback-banner" agents_os_v3/ui/index.html agents_os_v3/ui/style.css agents_os_v3/ui/app.js
```
Expected: ≥1 match in each of the 3 files.

```bash
grep -n "feedback_ingested\|showFeedbackBanner" agents_os_v3/ui/app.js
```
Expected: `feedback_ingested` event listener AND `showFeedbackBanner` function both present.

---

### PQC-6: Governance matrix — `GET /api/governance/status` → `routed_without_governance = 0`

```bash
python3 -c "
import os; from pathlib import Path
env_path = Path('agents_os_v3/.env')
for line in env_path.read_text().splitlines():
    line = line.strip()
    if not line or line.startswith('#') or '=' not in line: continue
    k, _, v = line.partition('=')
    os.environ[k.strip()] = v.strip().strip('\"').strip(\"'\")
from fastapi.testclient import TestClient
from agents_os_v3.modules.management.api import create_app
client = TestClient(create_app())
r = client.get('/api/governance/status')
print(f'HTTP {r.status_code}')
d = r.json()
print(f'routed_without_governance={d[\"summary\"][\"routed_without_governance\"]} (expected 0)')
print(f'teams_with_governance={d[\"summary\"][\"teams_with_governance\"]} / {d[\"summary\"][\"total_teams\"]}')
"
```
Expected: `routed_without_governance=0` (Iron Rule: no team with routing rules may lack a governance file).

---

### PQC-7: Token budget — `GET /api/runs/{run_id}/prompt` → `meta.approx_tokens` present

```bash
grep -n "_approx_tokens\|approx_tokens\|_trim_optional_sections\|_L1_L2_MAX_TOKENS" \
  agents_os_v3/modules/prompting/builder.py
```
Expected: all 4 identifiers present.

```bash
python3 -c "
import os; from pathlib import Path
env_path = Path('agents_os_v3/.env')
for line in env_path.read_text().splitlines():
    line = line.strip()
    if not line or line.startswith('#') or '=' not in line: continue
    k, _, v = line.partition('=')
    os.environ[k.strip()] = v.strip().strip('\"').strip(\"'\")
from fastapi.testclient import TestClient
from agents_os_v3.modules.management.api import create_app
client = TestClient(create_app())
# Use the known active run
r = client.get('/api/runs/01KN21WSXDSJC0SKRQS34B1KHC/prompt')
print(f'HTTP {r.status_code}')
if r.status_code == 200:
    meta = r.json().get('meta', {})
    print(f'approx_tokens={meta.get(\"approx_tokens\")} (must be present, >0)')
    print(f'truncation_applied={meta.get(\"truncation_applied\")}')
"
```
Expected: `approx_tokens` is an integer > 0.

---

### PQC-8: Feedback stats — `GET /api/feedback/stats`

```bash
python3 -c "
import os; from pathlib import Path
env_path = Path('agents_os_v3/.env')
for line in env_path.read_text().splitlines():
    line = line.strip()
    if not line or line.startswith('#') or '=' not in line: continue
    k, _, v = line.partition('=')
    os.environ[k.strip()] = v.strip().strip('\"').strip(\"'\")
from fastapi.testclient import TestClient
from agents_os_v3.modules.management.api import create_app
client = TestClient(create_app())
r = client.get('/api/feedback/stats', headers={'X-Actor-Team-Id': 'team_51'})
print(f'HTTP {r.status_code} (expected 200)')
r2 = client.get('/api/feedback/stats')
print(f'without header -> HTTP {r2.status_code} (expected 400)')
"
```
Expected: 200 with header, 400 without.

---

### PQC-9: Context endpoints

```bash
python3 -c "
import os; from pathlib import Path
env_path = Path('agents_os_v3/.env')
for line in env_path.read_text().splitlines():
    line = line.strip()
    if not line or line.startswith('#') or '=' not in line: continue
    k, _, v = line.partition('=')
    os.environ[k.strip()] = v.strip().strip('\"').strip(\"'\")
from fastapi.testclient import TestClient
from agents_os_v3.modules.management.api import create_app
client = TestClient(create_app())
r = client.get('/api/teams/team_51/context')
print(f'teams/context -> HTTP {r.status_code}')
d = r.json()
print(f'team_id={d[\"team_id\"]}, has_governance_file={d[\"has_governance_file\"]} (expected True)')
r2 = client.get('/api/runs/01KN21WSXDSJC0SKRQS34B1KHC/context', headers={'X-Actor-Team-Id': 'team_51'})
print(f'runs/context -> HTTP {r2.status_code}')
"
```
Expected: both 200, `has_governance_file=True` for team_51.

---

## §5 Structural Checks — Grep Verification

### 5.1 WP ID format validation

```bash
grep -n "_WP_ID_CANONICAL_RE\|_WP_ID_ULID_RE\|_validate_wp_id_format" \
  agents_os_v3/modules/state/machine.py | head -10
```
Expected: `_WP_ID_CANONICAL_RE = re.compile(r"^S\d{3}-P\d{3}-WP\d{3}$")` AND `_WP_ID_ULID_RE = re.compile(r"^[0-9A-Z]{20,26}$")`.

### 5.2 Auto-advance CANONICAL_AUTO only

```bash
grep -n "CANONICAL_AUTO\|_AUTO_ADVANCE_GATES\|auto_advanced" \
  agents_os_v3/modules/management/use_cases.py
```
Expected: auto-advance guard `detection_mode == "CANONICAL_AUTO"` present. NOT `OPERATOR_NOTIFY`, NOT `NATIVE_FILE`.

### 5.3 APScheduler layer2 — coalesce + max_instances

```bash
grep -n "layer2_scan\|coalesce\|max_instances\|_scan_layer2_feedback" \
  agents_os_v3/modules/management/api.py | head -15
```
Expected: `coalesce=True`, `max_instances=1`, `id="layer2_scan"`.

### 5.4 SHA-256 full file fingerprint

```bash
grep -n "sha256\|_file_fingerprint\|hexdigest" \
  agents_os_v3/modules/audit/ingestion.py
```
Expected: `hashlib.sha256(path.read_bytes()).hexdigest()[:20]` (full file hash, NOT partial read).

### 5.5 definition.yaml — TRIGGER PROTOCOL present

```bash
grep -n "TRIGGER PROTOCOL\|CANONICAL_AUTO\|detection_mode" \
  agents_os_v3/definition.yaml | head -15
```
Expected: ≥4 occurrences across GATE_0, GATE_1 (1.1, 1.2), GATE_2.

### 5.6 Governance files — all required present

```bash
ls agents_os_v3/governance/ | sort
```
Expected: `team_10.md`, `team_11.md`, `team_20.md`, `team_30.md`, `team_40.md`, `team_50.md`, `team_51.md`, `team_61.md`, `team_70.md`, `team_71.md`, `team_90.md` all exist.

---

## §6 Verdict Format

Create file: `_COMMUNICATION/team_51/TEAM_51_S003_P005_WP001_QA_VERDICT_v1.0.0.md`

### Minimum required content:
```
## Test Suite
- Collected: N tests
- Passed: N
- Failed: N
- Skipped: N (acceptable)

## PQC Results
| PQC | Check | Result | Evidence |
|-----|-------|--------|---------|
| PQC-1 | CANONICAL_AUTO model | PASS/FAIL | ... |
| PQC-2 | Mode A strict 422 | PASS/FAIL | ... |
| PQC-3 | Mode B/C/D 'full'→'impl' | PASS/FAIL | ... |
| PQC-4 | Case-insensitive 'FULL'→'impl' | PASS/FAIL | ... |
| PQC-5 | SSE feedback banner | PASS/FAIL | ... |
| PQC-6 | routed_without_governance=0 | PASS/FAIL | ... |
| PQC-7 | Token budget approx_tokens | PASS/FAIL | ... |
| PQC-8 | Feedback stats endpoint | PASS/FAIL | ... |
| PQC-9 | Context endpoints | PASS/FAIL | ... |

## Structural Checks
| Check | Result |
|-------|--------|
| WP ID validation regex | PASS/FAIL |
| Auto-advance CANONICAL_AUTO only | PASS/FAIL |
| APScheduler coalesce+max_instances | PASS/FAIL |
| SHA-256 full-file fingerprint | PASS/FAIL |
| TRIGGER PROTOCOL in definition.yaml | PASS/FAIL |
| All governance files present | PASS/FAIL |

## Blocking Findings
List any FAIL items with detail.

## Verdict
GATE_4 VERDICT: PASS | FAIL
```

### CANONICAL_AUTO feedback submission (on PASS):
```
POST /api/runs/{run_id}/feedback
X-Actor-Team-Id: team_51
{
  "detection_mode": "CANONICAL_AUTO",
  "structured_json": {
    "schema_version": "1",
    "verdict": "PASS",
    "confidence": "HIGH",
    "summary": "<1-2 sentence QA summary>",
    "blocking_findings": [],
    "route_recommendation": null
  }
}
```

---

**log_entry | TEAM_100 | QA_ACTIVATION_ISSUED | S003-P005-WP001 | TO_TEAM_51 | 2026-04-02**
