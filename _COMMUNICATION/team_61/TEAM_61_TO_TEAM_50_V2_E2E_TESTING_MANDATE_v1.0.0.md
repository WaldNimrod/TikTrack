# TEAM_61_TO_TEAM_50_V2_E2E_TESTING_MANDATE_v1.0.0

**project_domain:** AGENTS_OS
**id:** TEAM_61_TO_TEAM_50_V2_E2E_TESTING_v1.0.0
**from:** Team 61 (Cloud Agent / DevOps Automation)
**to:** Team 50 (QA & Fidelity)
**cc:** Team 10 (Gateway), Team 90 (The Spy)
**date:** 2026-03-08
**status:** PENDING — Active after Team 190 merge to main
**gate_id:** N/A
**work_package_id:** N/A

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | N/A |
| phase_owner | Team 61 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Purpose

בדיקות E2E ל-Agents_OS V2 Pipeline Orchestrator. מטרת הבדיקה: לאמת שה-pipeline CLI עובד, שה-prompts שנוצרים שימושיים, ושתרחישי MCP מוגדרים נכון. **זו בדיקה של כלי הפיתוח, לא של TikTrack עצמו.**

**תנאי מקדים:** הקוד ממוזג ל-main ע"י Team 190. אם הקוד עדיין לא ב-main, יש להמתין.

## 2) Context / Inputs

### מה נבדק

**agents_os_v2/** — מערכת Orchestrator שמאטמטת את תפקיד Team 10 (Gateway). במקום שהאדריכל ינהל ידנית 12 chat sessions, ה-Orchestrator:
- מנהל state של ה-pipeline (באיזה gate אנחנו)
- מייצר prompts מוכנים להדבקה בצוותים השונים (Codex, Claude Code, Cursor)
- מוולדט outputs באופן deterministic
- כולל 18 תרחישי MCP browser test מוגדרים

### קבצים רלוונטיים

```
agents_os_v2/orchestrator/pipeline.py    # ← CLI ראשי — זה מה שנבדק
agents_os_v2/mcp/test_scenarios.py       # ← תרחישי MCP — לבדוק שמתאימים למציאות
agents_os_v2/mcp/evidence_validator.py   # ← validator ל-evidence — לבדוק שעובד
agents_os_v2/tests/                      # ← 47 unit tests — להריץ
```

### הכנה

```bash
# 1. ודא שאתה על main מעודכן
git pull origin main

# 2. התקן dependencies
cd api && source venv/bin/activate
pip install openai google-genai   # needed by engines

# 3. ודא שהטסטים עוברים
python3 -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini"
# Expected: 47 passed
```

## 3) Required actions — 4 סבבי בדיקה

### סבב A — Unit Tests (terminal)

```bash
cd /path/to/TikTrack
source api/venv/bin/activate
python3 -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini"
```

**קריטריון:** 47/47 PASS.

### סבב B — Pipeline CLI (terminal)

```bash
# B1: Start pipeline
python3 -m agents_os_v2.orchestrator.pipeline --spec "Test feature — verify pipeline flow"

# B2: Check status
python3 -m agents_os_v2.orchestrator.pipeline --status
# Expected: current_gate = GATE_0, gates_completed = none

# B3: Generate prompt for GATE_0
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_0
# Expected: prompt file created at _COMMUNICATION/agents_os/prompts/GATE_0_prompt.md
#           content includes Team 190 identity, governance rules, state summary

# B4: Advance gate (simulate PASS)
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_0 PASS
# Expected: status shows GATE_0 in completed, current = GATE_1

# B5: Generate prompts for remaining gates
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_1
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_2
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt G3_PLAN
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_4
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_5
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_7
# Expected: each creates a prompt file with correct team identity and gate context

# B6: Full flow simulation (advance all gates)
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_1 PASS
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_2 PASS
python3 -m agents_os_v2.orchestrator.pipeline --advance G3_PLAN PASS
python3 -m agents_os_v2.orchestrator.pipeline --advance G3_5 PASS
python3 -m agents_os_v2.orchestrator.pipeline --advance G3_6_MANDATES PASS
python3 -m agents_os_v2.orchestrator.pipeline --advance CURSOR_IMPLEMENTATION PASS
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_4 PASS
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_5 PASS
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_6 PASS
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_7 PASS
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_8 PASS
python3 -m agents_os_v2.orchestrator.pipeline --status
# Expected: current_gate = COMPLETE, all gates in completed list
```

**קריטריון:** כל הפקודות רצות בלי errors. State מתעדכן נכון. Prompts נוצרים עם תוכן שימושי.

### סבב C — Prompt Quality Review

פתח וקרא את ה-prompt files שנוצרו ב-`_COMMUNICATION/agents_os/prompts/`:

| Prompt | בדוק |
|--------|------|
| `GATE_0_prompt.md` | כולל Team 190 identity? Context reset? State summary? |
| `GATE_1_prompt.md` | כולל הנחיות ל-Team 170 + Team 190? |
| `GATE_2_prompt.md` | כולל Team 100 identity? Context loading protocol? |
| `G3_PLAN_prompt.md` | כולל הנחיות מפורטות לבניית work plan? |
| `GATE_4_prompt.md` | כולל automated tests + MCP test scenarios? |
| `GATE_5_prompt.md` | כולל Team 90 identity? Spec compliance checks? |
| `GATE_7_prompt.md` | מציג הנחיות UX review ל-Nimrod? |

**קריטריון:** כל prompt מכיל: (1) team identity, (2) governance context, (3) state, (4) specific task instructions. אין prompts ריקים או חסרים.

### סבב D — MCP Test Scenarios Review

```bash
python3 -c "
from agents_os_v2.mcp.test_scenarios import ALL_SCENARIOS, generate_mcp_test_prompt
print(f'Total scenarios: {len(ALL_SCENARIOS)}')
for s in ALL_SCENARIOS:
    print(f'  {s.id}: {s.name} ({s.entity}/{s.category}) — {len(s.steps)} steps')
print()
print(generate_mcp_test_prompt(ALL_SCENARIOS[:3]))
"
```

**בדוק:**
1. כל scenario יש לו steps עם actions, targets, expected results?
2. ה-scenarios מכסים את כל ה-entities העיקריות (auth, trading_accounts, alerts, notes, tickers)?
3. ה-categories מכסים: crud, validation, display, navigation?
4. `generate_mcp_test_prompt()` מייצר prompt שימושי?

**אופציונלי — MCP live test:** אם יש לך MCP browser access, נסה להריץ scenario AUTH-001 (login) עם כלי ה-MCP בפועל.

**קריטריון:** 18+ scenarios מוגדרים. כל entity עיקרי מכוסה.

### סבב E — Evidence Validator

```bash
python3 -c "
from agents_os_v2.mcp.evidence_validator import validate_evidence
result = validate_evidence('infrastructure/s002_p002_mcp_qa/sample_MATERIALIZATION_EVIDENCE.json')
print(f'Valid: {result.valid}')
print(f'Errors: {result.errors}')
print(f'Warnings: {result.warnings}')
"
```

**קריטריון:** Sample evidence validates successfully (valid=True, 0 errors).

## 4) Deliverables and paths

1. `_COMMUNICATION/team_50/TEAM_50_AGENTS_OS_V2_E2E_REPORT.md` — דוח מלא עם:
   - תוצאות per סבב (A/B/C/D/E)
   - PASS/FAIL per בדיקה
   - Bugs found (if any, with reproduction steps)
   - Overall: PASS (100% green) / FAIL (with blocking list)

## 5) Validation criteria (PASS/FAIL)

1. סבב A: 47/47 unit tests pass
2. סבב B: Pipeline CLI — כל הפקודות רצות, state מתעדכן, prompts נוצרים
3. סבב C: Prompts מכילים 4 שכבות (identity, governance, state, task)
4. סבב D: 18+ MCP scenarios מוגדרים, entities מכוסים
5. סבב E: Evidence validator works on sample

**100% green = PASS.** כל failure = FAIL with details → Team 61 מתקן → retest.

## 6) Response required

- Decision: PASS / FAIL
- דוח מפורט per סבב
- Bugs/findings with file paths and reproduction steps
- Confirmation: ready for production use / needs fixes

log_entry | TEAM_61 | V2_E2E_TESTING_MANDATE | ACTION_REQUIRED | 2026-03-08
