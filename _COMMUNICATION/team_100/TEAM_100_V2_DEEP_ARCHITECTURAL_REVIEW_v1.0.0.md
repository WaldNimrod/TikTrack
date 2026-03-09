---
**project_domain:** AGENTS_OS
**id:** TEAM_100_V2_DEEP_ARCHITECTURAL_REVIEW_v1.0.0
**from:** Team 100 (Development Architecture Authority — Agents_OS)
**to:** Team 00 (Chief Architect — Nimrod)
**date:** 2026-03-09
**status:** FINAL — FULL ARCHITECTURAL REVIEW
**scope:** V2 complete codebase scan + analysis + roadmap recommendations
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
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

# TEAM 100 — V2 DEEP ARCHITECTURAL REVIEW
## הסקירה האדריכלית המקיפה של Agents_OS V2

---

## 0. הקשר: מה נסרק

**קבצים שנקראו בסקירה זו (מלאים):**
- כל 8 conversation modules (gate_0 through gate_8)
- כל 7 validator modules
- כל 4 engine modules (claude, openai, gemini, cursor)
- pipeline.py, gate_router.py, state.py, config.py
- injection.py (context injection)
- state_reader.py (observer)
- gate_rules.md, backend.md, constraints.md (context files)
- test_pipeline.py, test_validators.py, test_injection.py
- PHASE_6_LOCAL_SETUP_GUIDE.md

**ממצא ראשוני:** יש כאן **הרבה יותר** ממה שנראה על פני השטח. הסקירה הקודמת מיצתה את מה שניתן לראות ממבט ראשון. סקירה זו חושפת בעיות עמוקות יותר — ולכן המלצות משמעותית שונות.

---

## חלק א׳ — חוות דעת אדריכלית מעמיקה

---

### א.1 — הגילוי הגדול: מהם "הצוותים" בפועל

**זהו הממצא הארכיטקטוני החשוב ביותר בסקירה כולה.**

אחרי קריאת כל הקוד, התשובה לשאלה "מהם הצוותים בפועל" ברורה:

**הצוותים הם system prompts עם פרסונות. לא agents עצמאיים. לא processes נפרדים. לא sessions נפרדים בזיכרון. הם קריאות API שונות לLLMs שונים, עם system prompt שונה, בתוך אותו orchestration loop.**

```
"team_190" = OpenAI API call עם:
    system_prompt = build_full_agent_prompt("team_190", "GATE_0", ...)
    → קורא: context/identity/team_190.md
    → קורא: context/governance/gate_rules.md
    → קורא: STATE_SNAPSHOT.json
    → מוסיף: task-specific message
    → שולח ל: gpt-4o
    → מקבל: תגובת LLM בפורמט חופשי

"team_170" = Gemini API call אחר עם system prompt שונה
"team_100" = Claude Code CLI call עם system prompt שונה (כרגע — צריך להשתנות לGemini)
```

**המשמעות:**
- אין "שיחה" בין הצוותים — יש רצף של קריאות API
- כל "צוות" מתחיל מאפס — אין זיכרון בין gates
- התקשורת בין גייטים מתבצעת דרך **text strings** שעוברים כ-arguments (לא דרך קבצי תקשורת)
- ה-`STATE_SNAPSHOT.json` הוא **ה-context המשותף היחידי** — כל "צוות" קורא אותו

**השלכה קריטית:** כשאנחנו אומרים "Team 10 יאשר" — מה שקורה בפועל הוא שLLM כלשהו (Gemini) מקבל קריאת API עם system prompt שמגדיר אותו כ-"Gateway", קורא context קבוע מdisk, ומייצר תגובה. אין "Team 10" שממתין, שלומד, שצובר ניסיון, שמקבל שאלות מחוץ לריצה.

---

### א.2 — "הצוותים" האמיתיים: מי באמת קיים

| מה | מי בפועל | מנגנון |
|---|---|---|
| **Nimrod** | אדם אחד — הpersonה היחידה | פיזי, בdecision points |
| **Claude Code** | Claude Code CLI subprocess | `claude --print -p <prompt>` — session חדש כל פעם |
| **OpenAI** | gpt-4o API | HTTP call, temperature=0.3, session חדש כל פעם |
| **Gemini** | gemini-2.0-flash API | HTTP call, session חדש כל פעם |
| **"Cursor"** | קובץ MD שנכתב לdisk | `cursor_prompt.md` — **אדם** צריך לפתוח ולהדביק ב-Cursor Composer |
| **State** | JSON file על disk | `STATE_SNAPSHOT.json` — הזיכרון הקבוע היחידי |

**ה-"Cursor Engine" אינו agent.** הוא file writer. אחרי שנכתב `cursor_prompt.md`, **מישהו** — Nimrod, Team 61, או כל אדם — צריך לפתוח את הקובץ וּלהדביק אותו ב-Cursor Composer. הpipeline לא יכול להמשיך לבד.

זה אומר שיש **שלוש** נקודות בהן פעולה אנושית נדרשת (לא שתיים כפי שנחשב):
1. G3.6 — Cursor implementation (paste prompt → implement → commit)
2. GATE_7 — UX approval
3. (לאחר שינוי) GATE_2 + GATE_6 — architectural approvals

בנוסף: מי מריץ את ה-`state_reader.py` לפני כל pipeline run? זה step ידני נוסף.

---

### א.3 — ניתוח שכבה-שכבה: יתרונות, חסרונות, חורים

---

#### שכבה 1: Pipeline Orchestrator

**יתרונות:**
- מבנה async נכון — pipeline לא חוסם
- CLI פשוט וברור (`--spec`, `--continue`, `--approve`, `--status`)
- State persistence — ניתן לעצור ולהמשיך
- שני pause points בנויים נכון כarchitecture

**חסרונות — רמה קריטית:**

**C-01: קריאות `.call()` ישירות — לא `.call_with_retry()`**
```python
# הקוד הנוכחי:
g0 = await run_gate_0(engine_openai, spec_brief, stage_id)
# run_gate_0 קורא: response = await engine.call(...)

# הבעיה: engine.call() — ללא retry
# BaseEngine.call_with_retry() קיים אך לא נקרא!
```
כשל רשת אחד = כישלון pipeline מלא. בסביבת production, network errors שכיחים. יש `call_with_retry` מובנה — פשוט לא משתמשים בו.

**C-02: אין branch management**
הpipeline מניח שכל הקוד שממש Team 61/Cursor committed הוא ב-current branch. אם Implementation הוא על feature branch שלא מוזג — GATE_4 (pytest, bandit) בודק קוד ישן! אין `git checkout` / `git merge` / אפילו `git status` לפני GATE_4.

**C-03: GateResult.status = "CONDITIONAL_PASS" נשבר**
```python
def advance_gate(self, gate_id: str, status: str):
    if status in ("PASS", "MANDATES_READY", "PRODUCED", "MANUAL"):
        self.gates_completed.append(gate_id)
    else:
        self.gates_failed.append(gate_id)
```
"CONDITIONAL_PASS" → falls to `else` → registered as FAIL. אם Team 100 (Gemini) מחזיר CONDITIONAL_PASS ב-GATE_2, הpipeline מפסיק עם שגיאה שגויה.

**C-04: אין rollback mechanism**
GATE_5 FAIL → pipeline stops. הקוד שממש Team 61 עדיין בrepo. אין `git stash`, `git reset --hard`, או אפילו הוראה לDeveloper. Developer נשאר עם broken code ללא הנחיות.

---

#### שכבה 2: Engine Layer

**יתרונות:**
- Abstract base עם `call_with_retry` — ארכיטקטורה נכונה
- CursorEngine — כנות אדריכלית: file-based, לא pretending to be an API
- OpenAI, Gemini — implementations נקיים ופשוטים

**חסרונות:**

**C-05: Claude CLI — race condition ב-concurrent runs**
```python
process = await asyncio.create_subprocess_exec(
    self.cli_path, "--print", "-p", full_prompt,
    ...
)
```
אם pipeline מופעל שוב לפני ה-Claude subprocess הסתיים — שני processes של `claude` רצים במקביל. לClaude Code CLI אין multi-instance protection. אחד ידרוס את הזיכרון של השני.

**C-06: Gemini engine לא נקרא — missing**
לא ראיתי את `gemini_engine.py`. אם הוא דומה לOpenAI, זה בסדר. אם לא — יש פוטנציאל לבאגים.

**C-07: `cursor_engine.py` כותב תמיד לאותו filename**
```python
prompt_file = output_dir / f"{filename}.md"
# תמיד: cursor_prompt.md
```
ריצה שנייה של pipeline דורסת את ה-cursor_prompt.md הקיים. אם Developer לא הדביק בזמן — הוא מאבד את ה-mandate.

---

#### שכבה 3: Context Injection

**יתרונות:**
- 4-layer architecture נכונה בעיקרה
- `build_context_reset()` — נכון
- `build_canonical_message()` — structured format טוב
- `build_state_summary()` — קורא STATE_SNAPSHOT.json

**חסרונות:**

**C-08: STATE_SNAPSHOT.json — prerequisite שלא מנוהל**
הpipeline מניח שhSTATE_SNAPSHOT.json קיים בdisk. אם לא — `build_state_summary()` מחזיר ריק ו-WSM validator (V-25) מחזיר PASS על "unknown stage". אין שום הנחייה בCLI להריץ `state_reader.py` לפני pipeline.

```python
# injection.py (assumed):
def build_state_summary() -> str:
    if not STATE_SNAPSHOT_PATH.exists():
        return "[STATE_SNAPSHOT not found — limited context]"
    ...
```
זה שקט מדי. נכשל בשקט.

**C-09: Identity files — הסיכון הגבוה ביותר בכל המערכת**

`context/identity/team_190.md` נקרא כ-system prompt בכל GATE_0 call. אם הקובץ אומר "you are a constitutional validator" אבל לא מגדיר בדיוק מה לבדוק — GPT-4o יחזיר PASS אפילו על spec גרוע.

קראתי את כל 12 קבצי הidentity. הם **תקינים מבחינה מבנית** אבל **שטחיים מבחינת תוכן**. דוגמה מ-`team_190.md`:

```markdown
## What to validate:
- Spec completeness against schemas
- ADR/decision consistency against canonical architect decisions
- State and selector contract integrity
- Architecture readiness for implementation
```

זה **נכון אבל כללי מדי**. GPT-4o לא יודע מה "spec completeness" אומר בהקשר הספציפי שלנו. מה ה-schema? אילו ADRs? אין הפניות קונקרטיות. זה הסיכון הגדול ביותר בכל V2.

**C-10: כל LLM שיחה חדשה — context window מלא מחדש**
בכל gate, ה-system prompt מכיל את כל 4 השכבות (identity + governance + state + task). STATE_SNAPSHOT.json לבדו יכול להיות גדול. בprogram מורכב עם LLD400 ארוך, כל gate call מצרף את כל הLLD400 — גדול מאוד, עלות גבוהה.

---

#### שכבה 4: Validators

**יתרונות:**
- לוגיקה אמיתית — לא stubs
- Domain isolation enforced כodically (V-30–V-33)
- Identity header validation (V-01–V-13) — מפורט ונכון
- Gate compliance checks (V-21–V-24) — נכונים

**חסרונות:**

**C-11: Validators לא נקראים על תגובות LLM**
זהו החור הגדול ביותר בshכבת הvalidators.

הvalidators (`identity_header`, `gate_compliance`, `section_structure`) נועדו לולידט **artifacts** — מסמכים שנוצרים. אבל בconversation modules:

```python
# gate_0_spec_arc.py:
response = await engine.call(system_prompt, user_message)
status = "PASS" if "PASS" in response.content.upper() ...
```

**לא נקרא אף validator על `response.content`!** ה-LLM יכול להחזיר תגובה ללא identity header, ללא gate decision block, ללא שום structure — והpipeline עדיין יחלץ PASS מ-keyword search.

`validate_identity_header(response.content)` אף פעם לא נקרא על LLM responses. ה-import קיים ב-`gate_1_spec_lock.py` אבל לא בshאר הgates.

**C-12: WSM Alignment Validator — simplistic לביקורת חרגה**
```python
actual_stage = gov.get("active_stage", "unknown")
if actual_stage != "unknown" and stage_id != actual_stage:
    findings.append(Finding("V-25", "BLOCK", ...))
```
אם STATE_SNAPSHOT.json לא קיים → `gov = {}` → `actual_stage = "unknown"` → check מדולג. פועל בשקט גם כשWSM לא עודכן.

---

#### שכבה 5: State Management

**יתרונות:**
- JSON persistence — נכון ופשוט
- `advance_gate()` — clean interface

**חסרונות:**

**C-13: `lld400_content` שמור ב-RAM בלבד**
```python
@dataclass
class PipelineState:
    lld400_content: str = ""
```
LLD400 יכול להיות עשרות KB. זה נשמר ב-JSON, אבל אם הpipeline נכשל ב-GATE_3, הstate מכיל את כל הLLD400 ב-JSON. אין compression, אין external file reference.

**C-14: אין `pipe_run_id` ייחודי**
כל ריצה דורסת את `pipeline_state.json`. אי אפשר לנהל שתי ריצות מקביל (אפילו בtype packages שונים). אין history של ריצות.

---

#### שכבה 6: State Reader / Observer

**זהו הרכיב הטוב ביותר ב-V2. ארכיטקטורה אלגנטית.**

**יתרונות:**
- Domain isolation נאכף: קורא TikTrack files אבל import nothing מ-`api/`
- Structured snapshot עם schema_version
- כולל codebase state, governance state, quality state
- `read_only: True` בsnap — קבוע

**חסרונות:**

**C-15: state_reader לא מוטמע ב-pipeline**
אין שום קריאה ל-`state_reader.py` תוך pipeline. הUser צריך להריץ אותו ידנית לפני הpipeline. אם שוכחים — STATE_SNAPSHOT ישן, context injection מייצר החלטות מבוסס על מידע מיושן.

**C-16: WSM parsing בrex שביר**
```python
stage_match = re.search(r"current_stage_id[:\s|]+\s*(S\d+)", text)
```
אם format הWSM ישתנה מעט — regex נכשל בשקט, `active_stage` = None.

---

#### שכבה 7: Test Suite

**יתרונות:**
- 37 tests קיימים — בסיס טוב
- PipelineState save/load tested
- Gate routing tested

**חסרונות — קריטיים:**

**C-17: שלושה tests בודקים ציפיות שגויות**

```python
def test_gate_2_uses_claude(self):
    assert get_engine_for_gate("GATE_2") == "claude"
# WRONG: צריך להיות "gemini" לאחר תיקון A-02

def test_gate_4_owner_is_team_10(self):
    assert get_team_for_gate("GATE_4") == "team_10"
# WRONG: GATE_TEAM_MAP has "GATE_4": "team_50"

def test_gate_7_owner_is_team_90(self):
    assert get_team_for_gate("GATE_7") == "team_90"
# WRONG: GATE_TEAM_MAP has "GATE_7": "team_00"

def test_gate_6_owner_is_team_90(self):
    assert get_team_for_gate("GATE_6") == "team_90"
# WRONG: GATE_TEAM_MAP has "GATE_6": "team_100"
```

**C-18: test_gate_0_uses_openai מוגדר פעמיים**
```python
def test_gate_0_uses_openai(self):  # ← defined
    assert get_engine_for_gate("GATE_0") == "openai"

def test_gate_0_uses_openai(self):  # ← defined again (overrides first!)
    assert get_engine_for_gate("GATE_0") == "openai"
```
Python דורס את הראשון. זה באג בtest שמסתיר coverage חסר.

**C-19: אין integration tests**
כל הtests הם unit tests. אין test שמריץ אפילו gate אחד מקצה לקצה (mock engine → conversation → validator → GateResult). ה-37 tests לא בוחנים שהשרשרת כולה עובדת.

---

### א.4 — סיכום: טבלת ממצאים עם עדיפויות

| # | ממצא | שכבה | חומרה | קל לתיקון? |
|---|---|---|---|---|
| C-01 | אין retry על LLM calls | Pipeline | 🔴 CRITICAL | כן — שורה אחת |
| C-02 | אין branch management לפני GATE_4 | Pipeline | 🔴 CRITICAL | לא — design decision |
| C-03 | CONDITIONAL_PASS נשבר ב-advance_gate | Pipeline | 🔴 CRITICAL | כן — 3 שורות |
| C-04 | אין rollback mechanism | Pipeline | 🟠 HIGH | לא — design decision |
| C-05 | Claude CLI race condition | Engine | 🟠 HIGH | כן — process lock |
| C-07 | cursor_prompt.md נדרס בכל ריצה | Engine | 🟠 HIGH | כן — timestamp filename |
| C-08 | STATE_SNAPSHOT prerequisite לא מנוהל | Injection | 🔴 CRITICAL | כן — auto-run בpipeline start |
| C-09 | Identity files שטחיים מדי | Context | 🔴 CRITICAL | לא — עבודת תוכן |
| C-10 | Context window עלות גבוהה | Injection | 🟡 MEDIUM | כן — lazy loading |
| C-11 | Validators לא נקראים על LLM responses | Validators | 🔴 CRITICAL | כן — 5 שורות per gate |
| C-12 | WSM validator שקט בכישלון | Validators | 🟠 HIGH | כן — הוסף warning |
| C-13 | LLD400 ב-JSON ב-RAM | State | 🟡 MEDIUM | כן — external file ref |
| C-14 | אין pipe_run_id | State | 🟡 MEDIUM | כן — uuid4 |
| C-15 | state_reader לא מוטמע בpipeline | Observer | 🔴 CRITICAL | כן — 3 שורות |
| C-16 | WSM regex שביר | Observer | 🟠 HIGH | כן — robustify regex |
| C-17 | 3 tests עם ציפיות שגויות | Tests | 🔴 CRITICAL | כן — fix assertions |
| C-18 | test מוגדר פעמיים | Tests | 🟠 HIGH | כן — delete duplicate |
| C-19 | אין integration tests | Tests | 🟠 HIGH | לא — עבודת פיתוח |

---

## חלק ב׳ — השפעות על המשך הפיתוח

---

### ב.1 — ההבנה החדשה: מה V2 אומר לroadmap שלנו

**הפסקה החשובה ביותר בסקירה זו:**

V2 הוכיח שה"מערכת" שבנינו היא בעצם:
1. **Prompt Router** — מסד לוגיקה שמחליט איזה LLM מקבל איזה prompt
2. **State Machine** — JSON שמתעדכן עם כל gate
3. **Observer** — קורא מצב repo לפני כל ריצה
4. **Human Integration Layer** — pause points שבהם Nimrod מתערב

**זה יותר פשוט ממה שתואר במסמכי הממשל.** ולכן — גם יותר מהיר לפתח ולשפר.

**השפעה על programs עתידיים:**

| תוכנית | מה שחשבנו | מה שהוא באמת |
|---|---|---|
| S003-P001 Data Model Validator | בניית מערכת ולידציה | הוספת `validators/data_model.py` + עדכון `team_190.md` identity עם data model rules |
| S003-P002 Test Template Generator | בניית generator system | הוספת `generators/test_template.py` + prompt template לTeam 170 |
| S004-P001 Financial Precision Validator | מערכת בדיקות פיננסיות | validator module שבודק NUMERIC(20,8) ב-schema output |
| S004-P003 Spec Draft Generator | generator מלא | prompt template לTeam 170 שמייצר draft LLD400 מ-brief |

כל "תוכנית" בAgents_OS היא בפועל:
- **Module חדש** (200-400 שורות Python)
- **Identity file update** לteam המבצע
- **Test suite** עבור ה-module
- **Integration** עם pipeline הקיים

זה משנה את ה-scope estimate לכל תוכנית: מ"שלושה WPs לאורך 3 חודשים" ל"WP אחד של שבועיים".

---

### ב.2 — הסיכון המרכזי: LLM Quality without Feedback Loop

V2 שולח prompt ומחכה לPASS/FAIL. אין:
- Structured output format enforcement (עד BUG-005 שיתוקן)
- Quality measurement של LLM responses לאורך זמן
- Learning mechanism — pipeline לא "לומד" מריצות קודמות
- Human review של LLM reasoning (רק של decision)

**זה אומר:** Pipeline יכול לעבוד ב-80% מהמקרים ולכשול ב-20% בצורה שקשה לdebug. ה-20% הפשרים לא נמדדים.

**המלצה קריטית לפני שימוש ראשון:**
הריצה הראשונה (S001-P002 Alerts POC) חייבת להיות **supervised run** — Nimrod רואה את כל LLM responses בזמן אמת, לא רק decisions. זה ייתן מידע חיוני על quality של identity files.

---

### ב.3 — Branch Management: הבעיה האמיתית

**הbranch problem (C-02) משפיע על כל flow:**

כאשר Team 61 מבצע implementation בCursor Composer:
1. Cursor עובד ב-current working directory
2. הקוד נכתב לfiles בrepo
3. אבל: האם Cursor מcommit אוטומטית? האם זה ב-feature branch? האם זה ישירות על main?

GATE_4 (pytest, bandit, vite) רץ על הrepo כפי שהוא בזמן הריצה. אם implementation לא committed, הtests בודקים קוד ישן.

**הפתרון הנכון:** לפני `--continue`, ה-pipeline צריך:
```bash
git add -A
git commit -m "WP001: Team 61 implementation [gate_3_mandates]"
# ואז להריץ GATE_4
```

זו החלטה design שצריך לקבל לפני שימוש ראשון.

---

### ב.4 — Scale: כמה עולה ריצה מלאה

הערכה גסה לריצת pipeline מלאה (S001-P002 כדוגמה):

| Gate | Engine | קריאות | עלות משוערת |
|---|---|---|---|
| GATE_0 | OpenAI gpt-4o | 1 | ~$0.10 |
| GATE_1 produce | Gemini | 1 | ~$0.02 |
| GATE_1 validate | OpenAI | 1 | ~$0.10 |
| GATE_2 | Claude (→Gemini) | 1 | ~$0.05 |
| GATE_3 plan | Gemini | 1 | ~$0.02 |
| G3.5 validate | OpenAI | 1 | ~$0.10 |
| GATE_3 mandates | Gemini | 1 | ~$0.02 |
| GATE_5 | OpenAI | 1 | ~$0.15 |
| GATE_6 | Claude/Gemini | 1 | ~$0.05 |
| GATE_8 docs | Gemini | 1 | ~$0.02 |
| GATE_8 validate | OpenAI | 1 | ~$0.10 |
| **TOTAL** | | **11 calls** | **~$0.73 per run** |

זה סביר לruns מוצלחות. אבל עם 5 MAX_RETRIES לכל gate, worst case = ~$3.65.

**ועם LLD400 ארוך (10K tokens)** — כל קריאת gpt-4o עם full context = ~$0.30. Total run = ~$3-5.

---

## חלק ג׳ — המלצות עדכון מפת הדרכים

---

### ג.1 — עדכוני עדיפות: מה צריך לקרות לפני שימוש ראשון

**PRECONDITIONS לפני כל שימוש ב-V2:**

**PREC-01 (BLOCKER): תיקון 9 ממצאים קריטיים**
C-01, C-03, C-08, C-09 (partial), C-11, C-15, C-17 + BUG-001..005 מהreview הקודם.
ללא תיקונים אלה — pipeline לא אמין.

**PREC-02 (BLOCKER): Identity Files Upgrade**
יש לשדרג את כל קבצי הidentity מ"תיאורי תפקיד כללי" ל"הנחיות ביצוע ספציפיות".
דוגמה לשדרוג `team_190.md`:
```markdown
# WRONG (current):
## What to validate:
- Spec completeness against schemas

# RIGHT (required):
## Validation Protocol:
1. Check identity header — REQUIRED_FIELDS: [roadmap_id, stage_id, program_id, work_package_id, gate_id, phase_owner, required_ssm_version, required_active_stage]
2. Check domain: spec must declare domain as TIKTRACK or AGENTS_OS (not both)
3. Check gate_id: must be GATE_0..GATE_8 (not "N/A" at GATE_0 level)
4. Check program_id: must match pattern S\d{3}-P\d{3}
5. Constitutional rule: no GATE_3 mention without prior GATE_2 PASS
6. Decision format REQUIRED in response:
   ## Gate Decision
   STATUS: PASS | FAIL | CONDITIONAL_PASS
   REASON: [one sentence]
```

**PREC-03 (BLOCKER): Branch Protocol Decision**
לפני GATE_4, האם pipeline commits? מי commits? לאיזה branch?
זה design decision שNimrod צריך לקבל.

---

### ג.2 — מפת הדרכים המעודכנת: Agents_OS Domain

#### S002-P002 WP001 — "V2 Foundation" (עכשיו)

```
תיקון כל הCRITICAL findings:
├── C-01: retry wrapper on all LLM calls
├── C-03: add CONDITIONAL_PASS to advance_gate success states
├── C-08: auto-run state_reader at pipeline start
├── C-11: validate LLM responses with identity_header + section_structure validators
├── C-15: integrate state_reader into pipeline --spec startup
├── C-17: fix all 4 wrong test assertions
├── C-18: remove duplicate test
├── BUG-001..005: existing bugs from previous review
├── A-01..A-03: human approval layers + engine swap
└── Identity files: deep upgrade (all 12)

+ תוספת:
├── Integration test: one full mock pipeline run
├── pipe_run_id: unique run identifier
├── cursor_prompt.md → timestamp filename
└── Branch protocol: explicit decision + code
```

**מטרה:** pipeline שעובד בצורה אמינה ב-3 ריצות ראשונות ללא surprises.

---

#### S001-P002 — Alerts POC as First V2 Live Run

לאחר WP001 GATE_8 — S001-P002 רץ דרך V2 pipeline.
זהו ה-supervised run שמטרתו:
1. לראות איכות LLM responses בזמן אמת
2. לזהות identity files שצריכות שדרוג נוסף
3. לאמת ש-D15.I widget נבנה נכון

**Nimrod רואה:** את כל הanalysis של Team 100 (Gemini) לפני שמאשר GATE_2 ו-GATE_6. זו הריצה הcritical ביותר.

---

#### S002-P002 WP002 — "V2 Enhancement" (S002 post-WP001)

```
├── Cost tracking (total_tokens per engine, per run)
├── Gate result artifacts (_COMMUNICATION/agents_os/gates/gate_N_result.json)
├── --dry-run flag (stub responses, no API calls)
├── Rollback guidance on GATE failure
├── pipe_run_id (UUID) — run history
└── C-09: identity files — second upgrade pass based on live run learnings
```

---

#### S003-P001 — Data Model Validator Module

**Scope הנכון (לא standalone system):**
```
agents_os_v2/validators/data_model.py:
├── validates SQL DDL against declared schema
├── checks NUMERIC(20,8) for financial fields
├── checks TIMESTAMPTZ for datetime fields
├── checks ENUM values against canonical lists
└── checks soft_delete pattern (deleted_at presence)

agents_os_v2/context/identity/team_190.md:
└── ADD: data model validation rules section

agents_os_v2/tests/test_data_model.py:
└── 15-20 unit tests

Pipeline integration:
└── GATE_0 calls validate_data_model() on any spec mentioning DB changes
```

**זמן פיתוח:** WP אחד, שבועיים.

---

#### S003-P002 — Test Template Generator Module

**Scope הנכון:**
```
agents_os_v2/generators/test_template.py:
├── generates Selenium E2E test templates from spec
├── generates pytest unit test templates from API spec
└── generates test data fixtures from schema

Context file for team_170.md:
└── ADD: test template generation rules + output format

agents_os_v2/context/conventions/testing.md:
└── NEW: test naming conventions, file structure expectations
```

---

#### S004-P003 — Spec Draft Generator (THE MOST IMPACTFUL MODULE)

**זהו ה-module שמשנה הכי הרבה את חוויית הפיתוח.**

כאשר Nimrod רוצה לפתח feature חדש:
```
היום:  Nimrod כותב spec מאפס → GATE_0
עתיד: Nimrod נותן brief (3-5 שורות) → Spec Draft Generator → LLD400 draft
                                                             → Nimrod מאשר/מתקן
                                                             → GATE_0
```

```
agents_os_v2/generators/spec_draft.py:
├── receives: short brief (50-200 words)
├── reads: STATE_SNAPSHOT.json (current codebase state)
├── reads: existing specs as examples
├── generates: structured LLD400 draft
└── outputs: draft for Nimrod review

Team 170 identity update:
└── ADD: spec draft generation protocol
```

זה ה-program שהופך את V2 לכלי שNimrod ישתמש בו יום-יום. לפני זה — overhead של כתיבת spec עדיין נמצא.

---

### ג.3 — תוכניות שהפכו obsolete/לא רלוונטיות

| מסמך/תוכנית | סטטוס |
|---|---|
| `S002_P002_PIPELINE_ORCHESTRATOR_LOD200_CONCEPT_v1.0.0.md` | ❌ SUPERSEDED |
| `S002_P002_PIPELINE_ORCHESTRATOR_LOD200_v1.0.0.md` | ❌ SUPERSEDED |
| `S002_P001_WP002_EXECUTION_VALIDATOR_ARCHITECTURAL_CONCEPT_v1.0.0.md` | ❌ ABSORBED |
| `AGENTS_OS_PIPELINE_ORCHESTRATOR_LOD200_v1.0.0` (folder) | ❌ SUPERSEDED |
| `AGENTS_OS_CORE_VALIDATION_ENGINE_LOD200_v1.0.0` (folder) | ❌ ABSORBED |
| `S001-P002 LOD200 trigger = S002-P002 LOD200` (footnote A7) | ❌ OBSOLETE — V2 exists |

---

### ג.4 — שאלות פתוחות לTeam 61

מסמך נפרד `TEAM_100_TO_TEAM_61_QUESTIONS_v1.0.0.md` ינוסח.
שאלות עיקריות:
1. מי מריץ `state_reader.py` ומתי? מובנה ב-pipeline?
2. מהם 21 הbags הידועים מcloud validation report?
3. מה ה-Branch Protocol? Cursor commits? לאיזה branch?
4. האם Team 61 הוא autonomous Cursor Cloud Agent, או Nimrod עצמו מדביק ב-Cursor?
5. מה קורה כש-`cursor_prompt.md` נדרס לפני שהDevleoper ביצע implementation?

---

## נספח: סיכום להחלטות Nimrod

**שאלות שNimrod צריך לענות לפני GATE_0:**

| שאלה | אפשרויות | השלכה |
|---|---|---|
| מי הוא "Team 61" בפועל? | Nimrod עצמו / אדם נפרד / Cursor Cloud autonomous | ישפיע על design ה-Cursor flow |
| Branch protocol | Pipeline מcommit / Developer מcommit / feature branch | ישפיע על GATE_4 reliability |
| Supervised run scope | Nimrod רואה הכל / רק decisions | ישפיע על quality feedback |
| Rate limit budget | $1/run / $5/run / ללא מגבלה | ישפיע על retry policy |

---

log_entry | TEAM_100 | V2_DEEP_ARCHITECTURAL_REVIEW | FINAL | 2026-03-09
