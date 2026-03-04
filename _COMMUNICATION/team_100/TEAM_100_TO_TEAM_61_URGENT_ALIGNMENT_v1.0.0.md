---
**project_domain:** AGENTS_OS
**id:** TEAM_100_TO_TEAM_61_URGENT_ALIGNMENT_v1.0.0
**from:** Team 100 (Development Architecture Authority — Agents_OS)
**to:** Team 61 (Cursor Cloud Agent)
**date:** 2026-03-05
**status:** URGENT — ACTION_REQUIRED_BEFORE_GATE_0
**priority:** CRITICAL
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | WP001 |
| gate_id | PRE_GATE_0 |
| phase_owner | Team 100 |

---

# TEAM 100 → TEAM 61: URGENT ALIGNMENT NOTICE
## Architectural Acceptance + Required Changes Before GATE_0

---

## 1. פסיקה: קבלה עקרונית

**Team 61 — V2 מתקבלת עקרונית.**

לאחר סקירה אדריכלית מקיפה של `agents_os_v2/` (59 קבצים, ~2,600 שורות Python, 37 בדיקות עוברות):

- הארכיטקטורה הכוללת: **תקינה**
- מיפוי GATE_TEAM_MAP: **נכון לחלוטין**
- שכבת context injection: **מימוש מקצועי**
- Domain isolation: **אכוף קודית**
- State management: **תקין**

**V2 היא הצעד הגדול ביותר קדימה ב-Agents_OS מאז ADR-026.**

---

## 2. שינויים אדריכליים נדרשים — MANDATORY BEFORE GATE_0

לאחר בחינה מעמיקה עם Nimrod (Team 00), התגלו **שני שינויים אדריכליים מהותיים** נוסף על 5 הבאגים שפורטו קודם.

### שינוי אדריכלי A-01 — Human Approval Layer ב-GATE_2 וב-GATE_6 (MANDATORY)

**הבעיה:**
V2 מריץ GATE_2 (אישור ספֵּק) ו-GATE_6 (בדיקת מציאות) כ-LLM calls אוטומטיים ללא שכבת בקרה אנושית. Nimrod דורש **זכות וטו אנושית** בשתי נקודות האדריכלות הקריטיות.

**המבנה הנדרש:**

**GATE_2 — ספֵּק (שינוי מבני):**
```
לפני:  team_190 (OpenAI) → team_100 (Claude) → continue
אחרי:  team_190 (OpenAI) → team_100 (Gemini) → HUMAN PAUSE (Nimrod) → continue/reject
```

**GATE_6 — מציאות (שינוי מבני):**
```
לפני:  team_90 (OpenAI) → team_100 (Claude) → continue
אחרי:  team_90 (OpenAI) → team_100 (Gemini) → HUMAN PAUSE (Nimrod) → continue/reject
```

**מה Nimrod רואה בכל pause:**
```
╔══════════════════════════════════════════════════════════════╗
║  GATE_2 — Nimrod Architectural Approval Required             ║
║                                                              ║
║  Team 190 Validation:  PASS                                  ║
║  Team 100 Analysis:    [summary from Gemini]                 ║
║                                                              ║
║  Recommendation: APPROVE / REJECT / OPTION_A / OPTION_B     ║
║  Reasoning: [Team 100 must explain and convince]             ║
║                                                              ║
║  Your decision:                                              ║
║    --approve gate2     APPROVE and continue                  ║
║    --reject gate2      REJECT with reason                    ║
║    --query gate2       Ask Team 100 a follow-up question     ║
╚══════════════════════════════════════════════════════════════╝
```

**דרישות לשכבת הבקרה האנושית:**
1. Team 100 (Gemini) חייב לכתוב ניתוח ברור ב-structured format: המלצה, נימוק, אופציות (אם רלוונטי)
2. הניתוח חייב לכלול: מה Team 190 מצא, מה Team 100 ממליץ, ולמה
3. אין "PASS by default" — גם אם Team 190 PASS ו-Team 100 APPROVE, Nimrod עדיין מחליט
4. CLI: הוסף `--approve gate2`, `--reject gate2`, `--approve gate6`, `--reject gate6`
5. State: הוסף `gate2_human_approved: bool` ו-`gate6_human_approved: bool` ל-PipelineState

**Pipeline flow לאחר השינוי:**
```python
# GATE_2 הנדרש:
g2_validation = await run_gate_2_validate(engine_openai, lld400_content)  # team_190 validation
g2_analysis = await run_gate_2_analyze(engine_gemini, lld400_content, g2_validation)  # team_100 Gemini analysis
state.gate2_analysis = g2_analysis.engine_response
state.current_gate = "WAITING_FOR_GATE2_HUMAN_APPROVAL"
state.save()
_log("PAUSE — Nimrod architectural approval required (GATE_2)")
_log(f"Analysis saved to: {analysis_file}")
_log("Run: --approve gate2   OR   --reject gate2")
return  # stop here until human decision
```

### שינוי אדריכלי A-02 — team_100 מנוע: Claude → Gemini (MANDATORY)

**הבעיה:**
`TEAM_ENGINE_MAP["team_100"] = "claude"` יוצר בעיית self-approval. Claude Code הוא הסביבה שבה רץ Team 100 (אנחנו). אנחנו לא אמורים לאשר את עצמנו.

**התיקון:**
```python
# config.py — CHANGE:
TEAM_ENGINE_MAP = {
    ...
    "team_100": "gemini",  # WAS: "claude" — changed to eliminate self-approval
    ...
}
```

**ההשלכה:**
- Team 100 עכשיו רץ על Gemini API (gemini-2.0-flash)
- team_00 = human (לא claude) — עדכן לסמל מיוחד (ראה A-03)

### שינוי אדריכלי A-03 — team_00 = human (לא claude)

**הבעיה:**
`TEAM_ENGINE_MAP["team_00"] = "claude"` — Team 00 הוא Nimrod, אדם. אין לו "מנוע LLM".

**התיקון:**
```python
TEAM_ENGINE_MAP = {
    "team_00":  "human",   # WAS: "claude" — Team 00 is Nimrod, always human
    ...
}
```

וב-`_get_engines()` ב-pipeline.py:
```python
def _get_engines():
    return {
        "openai":  OpenAIEngine() if OPENAI_API_KEY else None,
        "gemini":  GeminiEngine() if GEMINI_API_KEY else None,
        "claude":  ClaudeEngine(),
        "cursor":  CursorEngine(),
        "human":   None,  # human — handled as pause point
    }
```

---

## 3. תיקוני באגים — UNCHANGED (מהסקירה הקודמת)

כל 5 הבאגים המקוריים עדיין תקפים ונדרשים:

| # | ID | קובץ | חומרה | תיאור קצר |
|---|---|---|---|---|
| 1 | BUG-001 | `pipeline.py` | HIGH | G3.5/G3.6 — שתי קריאות לאותה פונקציה, צריך הפרדה |
| 2 | BUG-002 | `cursor_engine.py` | MEDIUM | מודל ביצוע Cursor לא אומת — שלח לbTeam 100 |
| 3 | BUG-003 | `code_quality.py` | HIGH | `run_mypy()` חסר מ-`run_all_quality_checks()` |
| 4 | BUG-004 | `pipeline.py` + `state.py` | MEDIUM | `work_package_id` ברירת מחדל "N/A" — נדרש `--wp` flag |
| 5 | BUG-005 | כל `conversations/gate_*.py` | HIGH | PASS/FAIL parsing שביר — נדרש structured block parser |

---

## 4. הוספות נדרשות — ADDITIONS

### תוספת ADD-01 — team_61 לכל המיפויים

```python
# config.py:
TEAM_ENGINE_MAP = {
    ...
    "team_60":  "cursor",
    "team_61":  "cursor",  # ADD: Cursor Cloud Agent
    ...
}
```

```python
# gate_router.py — team_61 אינו gateway team, אלא implementation team בG3.7:
# אין שינוי ב-GATE_TEAM_MAP — team_61 מנהל את implementation בפועל
# אבל יש להוסיף בתיעוד:
TEAM_NOTES = {
    "team_61": "Cursor Cloud Agent — executes G3.7 implementation mandates in Cursor Cloud environment"
}
```

### תוספת ADD-02 — GATE_4: Team 10 כ-intermediary

```python
# gate_router.py:
GATE_TEAM_MAP = {
    ...
    "GATE_4_COORD":   "team_10",   # ADD: Team 10 coordinates QA submission
    "GATE_4_EXECUTE": "team_50",   # RENAME from "GATE_4": Team 50 executes QA
    ...
}
```

### תוספת ADD-03 — 4 human pause points (במקום 2)

Pipeline הנדרש כעת:
```
GATE_0 → GATE_1 → [GATE_2 Team 190+100] → HUMAN_PAUSE_GATE2 (Nimrod)
→ GATE_3 → G3.5 → G3.6 → HUMAN_PAUSE_G36 (Cursor implementation)
→ GATE_4 → GATE_5 → [GATE_6 Team 90+100] → HUMAN_PAUSE_GATE6 (Nimrod)
→ GATE_7 → HUMAN_PAUSE_GATE7 (Nimrod UX) → GATE_8
```

### תוספת ADD-04 — query mode למנוי אנושי

```python
parser.add_argument("--query", type=str, help="Query Team 100 about a gate decision (e.g., gate2)")
parser.add_argument("--question", type=str, help="Question to ask Team 100")
```

כאשר Nimrod רצה לשאול שאלה לפני שמחליט:
```bash
python3 -m agents_os_v2.orchestrator.pipeline --query gate2 --question "מה ההשפעה של ספק זה על D34?"
```
המערכת מריצה Team 100 (Gemini) עם השאלה וחוזרת עם תשובה. Nimrod ממשיך להחליט.

---

## 5. מבנה הפאוזים האנושיים הנדרש — Human Approval Format

בכל human pause, המערכת חייבת להציג לNimrod:

```
╔══════════════════════════════════════════════════════════╗
║  [GATE NAME] — Nimrod Approval Required                  ║
╠══════════════════════════════════════════════════════════╣
║  VALIDATION RESULT (Team 190/90):                        ║
║  Status: PASS | FAIL                                     ║
║  Key findings: [bullet list]                             ║
╠══════════════════════════════════════════════════════════╣
║  ARCHITECTURAL ANALYSIS (Team 100 — Gemini):             ║
║  Recommendation: APPROVE | REJECT | OPTION_A | OPTION_B  ║
║  Reasoning: [2-3 sentences — must convince]              ║
║  If options: [Option A: ..., Option B: ...]              ║
╠══════════════════════════════════════════════════════════╣
║  YOUR DECISION:                                          ║
║  --approve [gate]   Approve and continue                 ║
║  --reject [gate] --reason "..."   Reject with reason     ║
║  --query [gate] --question "..."  Ask a follow-up        ║
╚══════════════════════════════════════════════════════════╝
```

הניתוח של Team 100 **חייב** לכלול:
1. **המלצה ברורה** — לא "זה תלוי" בלבד
2. **נימוק** — למה Team 100 ממליץ כך
3. **סיכון** — מה קורה אם מאשרים / דוחים
4. **אופציות** (רק אם רלוונטי) — כאשר יש יותר מדרך אחת תקינה

---

## 6. checklist מעודכן לפני GATE_0

| # | פריט | סטטוס |
|---|---|---|
| 1 | BUG-001: G3.5/G3.6 separation | ⬜ |
| 2 | BUG-002: cursor_engine.py documentation | ⬜ |
| 3 | BUG-003: mypy in quality checks | ⬜ |
| 4 | BUG-004: `--wp` flag required | ⬜ |
| 5 | BUG-005: structured response parser | ⬜ |
| 6 | A-01: GATE_2 human pause layer | ⬜ |
| 7 | A-01: GATE_6 human pause layer | ⬜ |
| 8 | A-01: CLI flags `--approve gate2/gate6` | ⬜ |
| 9 | A-02: team_100 engine: claude → gemini | ⬜ |
| 10 | A-03: team_00 engine: claude → human | ⬜ |
| 11 | ADD-01: team_61 in TEAM_ENGINE_MAP | ⬜ |
| 12 | ADD-02: GATE_4 Team 10 intermediary | ⬜ |
| 13 | ADD-04: `--query` mode | ⬜ |
| 14 | כל 12 identity files reviewed + team_61.md created | ⬜ |
| 15 | team_100 identity file עודכן: מנוע = Gemini | ⬜ |
| 16 | 37+ בדיקות עוברות לאחר כל השינויים | ⬜ |
| 17 | mypy 0 errors על agents_os_v2/ | ⬜ |
| 18 | GATE_0 cover note → Team 190 | ⬜ |

**סה"כ: 18 פריטים לפני GATE_0 submission.**

---

## 7. נושאים שהתשובות שלך נבחנות — ממצאים והמלצות

### שאלה שנבחנה: Cursor Engine Model
התשובה הסבירה שCursorEngine כנראה file-based. **זה המודל הנכון** — Cursor Cloud Agent קורא קובץ mandate ומבצע. המשמעות:
- `CursorEngine` = mandate file generator, לא programmatic API
- יש להוסיף `is_programmatic = False`
- כל בקשה ל-team_61 חייבת לדעת: "Cursor Cloud reads from `_COMMUNICATION/agents_os/prompts/`"

### שאלה שנבחנה: Gate routing לteam_61
Team 61 לא מופיע ב-GATE_TEAM_MAP — **נכון.** Team 61 הוא implementation team, לא gate-owning team. הוא מקבל mandate ומבצע. GATE_3_MANDATES → team_10 מייצר את ה-mandate → team_61 מבצע ב-Cursor Cloud. אין צורך בrouting ישיר.

### שאלה שנבחנה: Query mode
**ממולץ להוסיף** (ADD-04 לעיל). בלעדיו, Nimrod חייב APPROVE/REJECT בלי יכולת שאילת שאלות. זה יגרום לdecisions ירודים. Query mode = ערך גבוה, מימוש קל.

### המלצות נוספות שלא נבקשו אבל רלוונטיות:

**המלצה R-1: הוסף `--dry-run` flag**
מריץ את כל הPipeline עם stub responses — מאפשר לבדוק flow ללא API calls ועלויות. חיוני לbdevelopment ולCI.

**המלצה R-2: הוסף cost tracking בסיסי**
כל EngineResponse כבר מחזיר `input_tokens` ו-`output_tokens`. הוסף לPipelineState:
```python
total_tokens: dict[str, int] = field(default_factory=dict)  # engine → tokens
```
ובסוף הריצה — הצג cost estimate.

**המלצה R-3: Gate result artifacts לתיקייה**
כל gate result נשמר כJSON ל-`_COMMUNICATION/agents_os/gates/gate_2_result.json` וכד'. עכשיו רק PipelineState קיים — קשה לdebug.

---

## 8. סיכום הוראות לTeam 61

1. **עכשיו:** בצע את 18 הפריטים ב-checklist לעיל
2. **חשוב:** שינויים A-01/A-02/A-03 הם אדריכליים — שלח draft ל-Team 100 לאישור לפני commit
3. **לאחר:** הגש GATE_0 cover note לTeam 190
4. **אל תשלח:** GATE_0 submission לפני שTeam 100 אישר את 18 הפריטים

---

log_entry | TEAM_100 | TEAM_61_URGENT_ALIGNMENT | ACTIVE | 2026-03-05
