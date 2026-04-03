---
id: TEAM_100_TO_TEAM_51_PIPELINE_QUALITY_QA_MANDATE_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 51 (AOS QA)
cc: Team 00 (Principal), Team 11 (AOS Gateway), Team 190 (Constitutional Validator)
date: 2026-04-01
status: ACTIVE — PENDING IMPLEMENTATION COMPLETION (Phase 1-3)
plan_ref: _COMMUNICATION/team_100/TEAM_100_PIPELINE_QUALITY_PLAN_v3.5.0.md
directive_refs:
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_FEEDBACK_ENDPOINT_MODE_A_AMENDMENT_v1.0.0.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.2.0.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_WP_ID_NAMING_CONVENTION_v1.0.0.md---

# מנדט QA — תכנית איכות פייפליין v3.5.0
## Team 51 — AOS Quality Assurance

---

## 0. Pre-conditions (לא להתחיל לפני)

לפני ביצוע כל בדיקה, ודא שכל הסעיפים הבאים מומשו ע"י Team 61:

```
[ ] Phase 1 §A — models.py: BlockingFindingV1 + StructuredVerdictV1 + FeedbackIngestBody מעודכן
[ ] Phase 1 §A — ingestion.py: _normalise_route_rec ב-lines 332 + 360
[ ] Phase 1 §A — api.py: post_run_feedback תומך CANONICAL_AUTO
[ ] Phase 1 §A — use_cases.py: uc_15_ingest_feedback מקבל structured_json
[ ] Phase 1 §B — app.js: renderHandoffIngestionExtra() live API (לא data-mock-toast)
[ ] Phase 1 §B — app.js: Route dropdown = doc | impl | arch בלבד
[ ] Phase 1 P2-F04 — SSE feedback banner ב-index.html
[ ] Phase 1 §F — APScheduler layer2 scan פעיל
[ ] Phase 2 §I-0 — GET /api/feedback/stats (business_router + X-Actor-Team-Id)
[ ] Phase 3 §C — team_61.md + team_51.md קיימים ב-agents_os_v3/governance/
```

אם כל Pre-conditions מסומנים — המשך לסעיף 1.

---

## 1. Automated Tests

### 1.1 Sanity — collect-only

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
python3 -m pytest agents_os_v3/tests/ --collect-only -q
```

**יעד:** `175 tests collected` (אין execution, רק איסוף)
**כשל:** פחות מ-175 = חוסר כיסוי; שגיאת syntax קריטית

---

### 1.2 Full Test Run

```bash
python3 -m pytest agents_os_v3/tests/ -q --tb=short 2>&1 | tail -20
```

**יעד:** `0 failed` (42 skipped = מקובל)
**כשל:** כל failure = חוסם merge

---

## 2. Prompt Diagnostics — אבחון פרומפטים לצוותות שונות

### מטרה
לבדוק שה-builder.py מייצר פרומפט תקין לכל שילוב team/gate, ושבדיקות ה-PQC (§J) פועלות.

### הגדרת Context — הכנה

לפני הבדיקות, בדוק שהשרת פועל:
```bash
curl -s http://localhost:8090/health | python3 -m json.tool
```

### 2.1 — Prompt תקין עבור team_10 / GATE_0

```bash
# 1. קח run_id של ריצה פעילה בGATE_0 עם actor=team_10
RUN_ID=$(curl -s http://localhost:8090/api/runs?status=IN_PROGRESS \
  -H "X-Actor-Team-Id: team_10" | \
  python3 -c "import sys,json; runs=json.load(sys.stdin).get('runs',[]); \
  r=[x for x in runs if x.get('current_gate_id')=='GATE_0' and x.get('actor_team_id')=='team_10']; \
  print(r[0]['run_id'] if r else 'NONE')")

echo "Run ID: $RUN_ID"

# 2. בקש פרומפט
curl -s http://localhost:8090/api/runs/$RUN_ID/prompt \
  -H "X-Actor-Team-Id: team_10" | python3 -m json.tool
```

**יעד:**
- `prompt` field לא ריק
- `meta.approx_tokens` > 0
- `meta.token_budget_warning` = null או "NEAR_BUDGET: ..."
- הפרומפט מכיל `# Gate GATE_0` header (§J.2)
- הפרומפט מכיל `## Trigger protocol` עם `POST /api/runs/` (§J.2)

**כשל:** `GovernanceNotFoundError`, פרומפט ריק, אין §J.2 header

---

### 2.2 — Prompt תקין עבור team_190 / GATE_1 phase 1.2

```bash
# ריצה עם team_190 ב-GATE_1/1.2
RUN_ID_190=$(curl -s http://localhost:8090/api/runs?status=IN_PROGRESS \
  -H "X-Actor-Team-Id: team_190" | \
  python3 -c "import sys,json; runs=json.load(sys.stdin).get('runs',[]); \
  r=[x for x in runs if x.get('current_gate_id')=='GATE_1' and x.get('actor_team_id')=='team_190']; \
  print(r[0]['run_id'] if r else 'NONE')")

curl -s http://localhost:8090/api/runs/$RUN_ID_190/prompt \
  -H "X-Actor-Team-Id: team_190" | python3 -m json.tool
```

**יעד:** governance file team_190.md נטען; `work_package_id` בפרומפט = `S{NNN}-P{NNN}-WP{NNN}` format
**כשל:** GovernanceNotFoundError → team_190.md חסר

---

### 2.3 — PQC J1.1 — work_package_id לא תקין נחסם

```bash
# ניסיון להתחיל ריצה עם WP ID בפורמט שגוי (2-level)
curl -s -X POST http://localhost:8090/api/runs \
  -H "Content-Type: application/json" \
  -H "X-Actor-Team-Id: team_10" \
  -d '{"work_package_id": "S003-P005", "domain_id": "tiktrack"}' | python3 -m json.tool
```

**יעד:** HTTP 400, `error_code: INVALID_WP_ID_FORMAT`
**כשל:** ריצה נוצרת = Iron Rule לא אכוף

---

### 2.4 — Token Budget Warning

```bash
# בקש פרומפט ובדוק meta
curl -s http://localhost:8090/api/runs/$RUN_ID/prompt \
  -H "X-Actor-Team-Id: team_10" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); m=d.get('meta',{}); \
  print('tokens:', m.get('approx_tokens')); \
  print('warning:', m.get('token_budget_warning')); \
  print('note:', m.get('approx_tokens_note')[:50] if m.get('approx_tokens_note') else None)"
```

**יעד:**
- `approx_tokens` > 0
- `approx_tokens_note` מכיל "lower-bound heuristic"
- `truncation_applied` = false (בריצה רגילה)

---

## 3. Feedback Submission Tests — כל 4 מודים

### 3.1 — Mode A (CANONICAL_AUTO) — PASS תקין

```bash
RUN_ID_A="<run_id בGATE_0>"

curl -s -X POST http://localhost:8090/api/runs/$RUN_ID_A/feedback \
  -H "Content-Type: application/json" \
  -H "X-Actor-Team-Id: team_190" \
  -d '{
    "detection_mode": "CANONICAL_AUTO",
    "structured_json": {
      "schema_version": "1",
      "verdict": "PASS",
      "confidence": "HIGH",
      "summary": "Team 51 canary test — PASS verdict",
      "blocking_findings": [],
      "route_recommendation": null
    }
  }' | python3 -m json.tool
```

**יעד:** HTTP 200, `detection_mode: "CANONICAL_AUTO"`, `ingestion_layer: "JSON_BLOCK"`

---

### 3.2 — Mode A — route_recommendation: "full" נדחה (B1)

```bash
curl -s -X POST http://localhost:8090/api/runs/$RUN_ID_A/feedback \
  -H "Content-Type: application/json" \
  -H "X-Actor-Team-Id: team_190" \
  -d '{
    "detection_mode": "CANONICAL_AUTO",
    "structured_json": {
      "schema_version": "1",
      "verdict": "FAIL",
      "confidence": "HIGH",
      "summary": "test",
      "blocking_findings": [],
      "route_recommendation": "full"
    }
  }' | python3 -c "import sys; d=sys.stdin.read(); print('STATUS_CODE_CHECK:', '422' in d or 'validation' in d.lower())"
```

**יעד:** HTTP 422 — Pydantic דוחה "full" (Mode A strict contract)
**כשל:** HTTP 200 = StructuredVerdictV1 לא הוגדר עם Literal נכון

---

### 3.3 — Mode B/C/D — route_recommendation: "full" מנורמל ל-"impl" (B2+B3)

```bash
# שלח קובץ עם route_recommendation: full דרך RAW_PASTE
curl -s -X POST http://localhost:8090/api/runs/$RUN_ID_A/feedback \
  -H "Content-Type: application/json" \
  -H "X-Actor-Team-Id: team_190" \
  -d '{
    "detection_mode": "RAW_PASTE",
    "raw_text": "verdict: PASS\nsummary: normalization test\nroute_recommendation: full\n"
  }' | python3 -c "
import sys, json
d = json.load(sys.stdin)
rr = d.get('route_recommendation')
print('route_recommendation in DB:', repr(rr))
print('PASS' if rr == 'impl' else 'FAIL — expected impl, got: ' + str(rr))
"
```

**יעד:** `route_recommendation: "impl"` — "full" נורמל לפני אחסון
**כשל:** "full" שמור ב-DB = normalization לא רץ ב-lines 332/360

---

### 3.4 — Mode B/C/D — route_recommendation: "FULL" (caps) → "impl" (B2 case-insensitive)

```bash
curl -s -X POST http://localhost:8090/api/runs/$RUN_ID_A/feedback \
  -H "Content-Type: application/json" \
  -H "X-Actor-Team-Id: team_190" \
  -d '{
    "detection_mode": "RAW_PASTE",
    "raw_text": "verdict: PASS\nsummary: case test\nroute_recommendation: FULL\n"
  }' | python3 -c "
import sys, json
d = json.load(sys.stdin)
rr = d.get('route_recommendation')
print('route_recommendation:', repr(rr))
print('PASS' if rr == 'impl' else 'FAIL — expected impl, got: ' + str(rr))
"
```

**יעד:** `"impl"` — case-insensitive normalization (`rr.strip().lower()` לפני lookup)
**כשל:** `None` = _normalise_route_rec לא case-insensitive

---

### 3.5 — Mode A — BlockingFindingV1 structured (R-02)

```bash
curl -s -X POST http://localhost:8090/api/runs/$RUN_ID_A/feedback \
  -H "Content-Type: application/json" \
  -H "X-Actor-Team-Id: team_190" \
  -d '{
    "detection_mode": "CANONICAL_AUTO",
    "structured_json": {
      "schema_version": "1",
      "verdict": "FAIL",
      "confidence": "HIGH",
      "summary": "structured findings test",
      "blocking_findings": [
        {"id": "F-01", "severity": "BLOCKER", "description": "test finding", "evidence": "line 42"},
        {"id": "F-02", "severity": "MAJOR", "description": "another finding"}
      ],
      "route_recommendation": "impl"
    }
  }' | python3 -m json.tool
```

**יעד:** HTTP 200, `blocking_findings_json` מכיל JSON עם id/severity/description
**כשל:** HTTP 422 = BlockingFindingV1 model חסר/שגוי

---

### 3.6 — Mode B (OPERATOR_NOTIFY) — SSE Banner

1. פתח browser ל-`http://localhost:8090` (Pipeline page)
2. שלח feedback דרך OPERATOR_NOTIFY:
```bash
curl -s -X POST http://localhost:8090/api/runs/$RUN_ID_A/feedback \
  -H "Content-Type: application/json" \
  -H "X-Actor-Team-Id: team_190" \
  -d '{"detection_mode": "OPERATOR_NOTIFY"}'
```
3. **יעד:** banner מופיע בראש העמוד בתוך 3 שניות: `"Feedback ingested — OPERATOR_NOTIFY"` (או דומה)
**כשל:** אין banner = SSE handler לא מחובר

---

## 4. Context Definitions — Teams + Runs

### 4.1 — GET /api/teams/{team_id}/context

```bash
for TEAM in team_10 team_11 team_61 team_51 team_190 team_100; do
  echo "=== $TEAM ==="
  curl -s http://localhost:8090/api/teams/$TEAM/context \
    -H "X-Actor-Team-Id: team_100" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print('engine:', d.get('engine','MISSING')); print('governance_present:', bool(d.get('governance_content')))"
done
```

**יעד לכל צוות:**
- `engine` לא ריק
- `governance_present: True` — governance file נמצא ב-agents_os_v3/governance/
- team_110 / team_111: `engine: "codex"` (§D Iron Rule)

**כשל:** `governance_present: False` ל-team_61/team_51 = Phase 3 לא הושלם

---

### 4.2 — GET /api/runs/{run_id}/context

```bash
curl -s http://localhost:8090/api/runs/$RUN_ID/context \
  -H "X-Actor-Team-Id: team_10" | python3 -m json.tool
```

**יעד:** JSON עם work_package, gate, actor, spec_ref, governance_summary
**כשל:** 404 = endpoint לא מומש (Phase 2 P3-A1)

---

## 5. KPI Stats Endpoint

```bash
# Phase 0 — collection
curl -s http://localhost:8090/api/feedback/stats \
  -H "X-Actor-Team-Id: team_100" | python3 -m json.tool

# ללא X-Actor-Team-Id — חייב לדחות
curl -s http://localhost:8090/api/feedback/stats | \
  python3 -c "import sys; d=sys.stdin.read(); print('AUTH_ENFORCED:', '422' in d or '401' in d or 'required' in d.lower())"
```

**יעד:**
- עם header: HTTP 200 + `{detection_mode: {CANONICAL_AUTO: N, OPERATOR_NOTIFY: N, ...}}`
- בלי header: HTTP 422 — auth חובה (R-04)

---

## 6. Governance Matrix Check

```bash
curl -s http://localhost:8090/api/governance/status \
  -H "X-Actor-Team-Id: team_100" | \
  python3 -c "
import sys, json
d = json.load(sys.stdin)
missing = [t for t in d.get('teams',[]) if not d['teams'][t].get('governance_file')]
if missing:
    print('FAIL — teams without governance:', missing)
else:
    print('PASS — all active teams have governance files')
print('routed_without_governance:', d.get('stats',{}).get('routed_without_governance', 0))
"
```

**יעד:** `routed_without_governance: 0` (P2-F06)
**כשל:** מספר > 0 = צוות ללא governance file נשלח לריצה

---

## 7. Full Canary Run — תהליך מלא

### מטרה
ריצה מלאה מ-initiation עד GATE_1 PASS כדי לאמת את כל שרשרת האיכות.

### 7.1 — Initiate canary run

```bash
CANARY_WP="S003-P005-WP001"  # WP קיים ותקין

CANARY_RUN=$(curl -s -X POST http://localhost:8090/api/runs \
  -H "Content-Type: application/json" \
  -H "X-Actor-Team-Id: team_11" \
  -d "{\"work_package_id\": \"$CANARY_WP\", \"domain_id\": \"agents_os\"}" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('run_id','ERROR'))")

echo "Canary Run ID: $CANARY_RUN"
```

**יעד:** HTTP 200, run_id מוחזר

---

### 7.2 — GATE_0 prompt

```bash
curl -s http://localhost:8090/api/runs/$CANARY_RUN/prompt \
  -H "X-Actor-Team-Id: team_190" | \
  python3 -c "
import sys, json
d = json.load(sys.stdin)
p = d.get('prompt', '')
checks = {
    'has_gate_header': '# Gate GATE_0' in p,
    'has_trigger_protocol': 'POST /api/runs/' in p,
    'has_work_package': '$CANARY_WP' in p or 'Work Package' in p,
    'approx_tokens': d.get('meta',{}).get('approx_tokens',0),
}
for k,v in checks.items(): print(k+':', v)
"
```

**יעד:** כל checks = True, approx_tokens ≤ 4000

---

### 7.3 — GATE_0 PASS via CANONICAL_AUTO

```bash
curl -s -X POST http://localhost:8090/api/runs/$CANARY_RUN/feedback \
  -H "Content-Type: application/json" \
  -H "X-Actor-Team-Id: team_190" \
  -d '{
    "detection_mode": "CANONICAL_AUTO",
    "structured_json": {
      "schema_version": "1",
      "verdict": "PASS",
      "confidence": "HIGH",
      "summary": "Team 51 canary: GATE_0 PASS",
      "blocking_findings": [],
      "route_recommendation": null
    }
  }' | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('detection_mode:', d.get('detection_mode'))
print('ingestion_layer:', d.get('ingestion_layer'))
print('proposed_action:', d.get('proposed_action'))
print('auto_advanced:', d.get('auto_advanced', False))
"
```

**יעד:**
- `detection_mode: CANONICAL_AUTO`
- `ingestion_layer: JSON_BLOCK`
- `proposed_action: ADVANCE` (או auto_advanced: True אם GATE_0 = auto-advance)

---

### 7.4 — GATE_0 → GATE_1 advance (אם לא auto)

```bash
# אם auto_advanced=False, advance ידנית
curl -s -X POST http://localhost:8090/api/runs/$CANARY_RUN/advance \
  -H "Content-Type: application/json" \
  -H "X-Actor-Team-Id: team_190" \
  -d '{"feedback_json": {"verdict": "PASS", "summary": "canary advance"}}' | \
  python3 -c "
import sys, json
d = json.load(sys.stdin)
print('new_gate:', d.get('current_gate_id'))
print('status:', d.get('status'))
"
```

**יעד:** `current_gate_id: GATE_1`, `status: IN_PROGRESS`

---

### 7.5 — סיכום canary

```bash
curl -s http://localhost:8090/api/runs/$CANARY_RUN \
  -H "X-Actor-Team-Id: team_100" | \
  python3 -c "
import sys, json
d = json.load(sys.stdin)
run = d.get('run', d)
print('=== CANARY SUMMARY ===')
print('run_id:', run.get('run_id'))
print('status:', run.get('status'))
print('current_gate:', run.get('current_gate_id'))
print('correction_cycles:', run.get('correction_cycle_count', 0))
print('CANARY PASS' if run.get('current_gate_id') == 'GATE_1' else 'CANARY FAIL')
"
```

**יעד:** `current_gate: GATE_1`, `correction_cycles: 0`, `CANARY PASS`

---

## 8. הגשה לביקורת — מה להגיש

בסיום כל הבדיקות, הגש ל-Team 11 (Gateway):

**ארטיפקט:** `TEAM_51_{wp_id}_PIPELINE_QUALITY_QA_VERDICT_v1.0.0.md`

**תוכן חובה:**
- Phase 4 STEP 1 + STEP 2: output מלא מ-pytest
- סעיפים 2–7: PASS/FAIL לכל בדיקה עם output בפועל
- Canary Run ID + סטטוס סופי
- כל FAIL: תיאור + שורת קוד רלוונטית

**Verdict:**
- `PASS` = כל בדיקות סעיפים 1–7 עברו
- `FAIL` = אחת או יותר נכשלו (כולל canary)
- `PASS_WITH_DEVIATIONS` = רק בדיקות Phase 2 P3-A* נכשלו (context endpoints — Phase 2 עשוי לא להיות מומש עדיין)

---

## 9. סדר עדיפויות — אם לא הכל מומש

אם Phase 2 (context endpoints) עדיין לא מומש, דווח `PASS_WITH_DEVIATIONS` אם:
- סעיפים 1, 3, 7 (automated + feedback + canary) = כולם PASS
- סעיפים 4.2 (run context) ו-4.1 (team context עבור phase 2 endpoints) = SKIPPED עם נימוק

---

**log_entry | TEAM_100 | TEAM_51_QA_MANDATE_v1.0.0 | ISSUED | 2026-04-01**
