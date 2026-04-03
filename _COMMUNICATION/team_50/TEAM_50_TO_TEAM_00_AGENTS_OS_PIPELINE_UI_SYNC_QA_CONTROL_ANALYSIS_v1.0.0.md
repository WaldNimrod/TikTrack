---
id: TEAM_50_TO_TEAM_00_AGENTS_OS_PIPELINE_UI_SYNC_QA_CONTROL_ANALYSIS_v1.0.0
historical_record: true
from: Team 50 (QA & Functional Acceptance — TikTrack + תמיכה באיכות תהליך Agents_OS)
to: Team 00 (Chief Architect)
cc: Team 10 (Gateway), Team 51 (Agents_OS QA), Team 61 (Agents_OS / CI), Team 170 (Spec SSOT), Team 100
date: 2026-03-17
domain_focus: Agents_OS (AOS) — תהליך פייפליין, ממשק, בקרה, דימוי
status: ARCHITECT_BRIEF
type: GAP_ANALYSIS_AND_RECOMMENDATIONS---

# דוח אדריכלי — Agents_OS: פערי סנכרון פייפליין↔UI, בקרה אוטומטית, ומה נדרש ל־Team 50

## ▼ Mandatory Identity Header

| Field | Value |
| --- | --- |
| roadmap_id | PHOENIX_ROADMAP |
| reporter | Team 50 |
| subject | AOS — pipeline truth vs dashboard, QA harness, simulation |
| authority | בקשת הנחיה אדריכלית / מנדטים חוצי-צוותים |

## ▲ End Identity Header

---

## §1 — תקציר מנהלים

**המצב:** בדומיין **Agents_OS** קיימים רכיבים מבוססים (מכונת מצב ב־Python, קבצי `pipeline_state_*.json`, `STATE_SNAPSHOT.json`, דשבורד סטטי, לוג אירועים). **עם זאת**, חסרה **שכבת חוזה ובדיקות אוטומטיות** שמחברת בין שלושת הצדדים — **אורקסטרציה (CLI/state)**, **ממשק (JS)**, ו**מסמכי אמת (WSM / registry)** — כך שנוצרת תחושת תהליך "שבור" וסינכרון לא אמין.

**מטרת הדוח:** לספק לאדריכלות **קונטקסט**, **ראיות מקוד**, **המלצות ממוקדות**, ו**מה Team 50 צריך** כדי לממש יעדי QA (אימות, דימוי, ניטור איכות) **בלי** להסתמך על הרצת צוותים אמיתיים בכל נקודה.

**מסקנה מרכזית:** הבעיה אינה "חוסר כלים" גנרי — אלא **חוסר Single Source of Truth שנבדק אוטומטית**, **כפילות לוגיקה ללא טסט רגרסיה משותף**, ו**היעדר harness דימוי** שמאמת תוצאות צפויות מקובצי fixture.

---

## §2 — קונטקסט עסקי ותפעולי

| מימד | תיאור |
| --- | --- |
| **ייעוד AOS** | מערכת שמטרתה להיות "בית תוכנה עם אדם אחד" — כרגע **הדגש הוא בטיוב המכונה והאגון**, לא במוצר TikTrack כצרכן מרכזי. |
| **תפקיד Team 50** | QA והרצת בדיקות — כולל **איכות תהליך**: להבין מה קורה בפייפליין, **לזהות drift**, **לדמות** ריצות בלי צוותים. |
| **מגבלת היקף** | הדוח **לא** מציע תיקון באגים נקודתי; הוא מגדיר **מה חסר במבנה הבקרה** כדי שאפשר יהיה לייצב ולמדוד. |

---

## §3 — מצב ריפו — מה כבר קיים (בסיס)

| רכיב | מיקום | תפקיד |
| --- | --- | --- |
| מצב פייפליין + מיגרציה | `agents_os_v2/orchestrator/state.py` | `PipelineState`, טעינה לפי דומיין, כללי active WP |
| קבצי state לדומיין | `_COMMUNICATION/agents_os/pipeline_state_agentsos.json`, `pipeline_state_tiktrack.json` | אמת ריצה לפי דומיין |
| קורא מצב לדומיינים | `agents_os_v2/observers/state_reader.py` — `read_pipeline_state()` | מפרק `gate_state`, `pending_actions`, וכו' |
| STATE_SNAPSHOT | `agents_os_v2/observers/state_reader.py` → `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json` | תצוגה מזוקקת לדשבורד / סוכנים |
| דשבורד + קונפיג | `agents_os/ui/js/pipeline-dashboard.js`, `pipeline-config.js` | טעינת JSON, אזהרות ידניות, מיפוי gate |
| מיפוי Gate (UI) | `pipeline-config.js` — `LEGACY_GATE_TO_CANONICAL`, `GATE_CONFIG` | תאימות ל־5-gate תצוגה מול legacy IDs |
| בדיקות יחידה (מצב) | `agents_os_v2/tests/test_integration.py` | happy path בזיכרון, parser — **לא** UI |
| אימות WSM לפי מסמך | `agents_os_v2/validators/wsm_alignment.py` | V-25–V-29 כשמזינים תוכן + `stage_id` |
| טסטים ישנים ל־snapshot | `agents_os/tests/test_state_reader.py` | סכמת `agents_os` legacy ל־`build_state_snapshot` |

---

## §4 — פערים (Gap Analysis) — עם ראיות

### G4.1 — מספר מקורות אמת ללא **אימות יחסי אוטומטי כ־FAIL ב־CI**

**תיאור:** הפייפליין שומר `stage_id` / `current_gate` ב־`pipeline_state_*.json`; **WSM** מגדיר `active_stage`; **STATE_SNAPSHOT** משקף governance. הדשבורד **מציג אזהרה** כשיש אי-התאמה — אבל זה **מידע בדפדפן**, לא **מחסום איכות** בריפו.

**ראיה (דוגמת UI):** ב־`pipeline-dashboard.js` יש לוגיקת Health שמשווה `pipeline_state.stage_id` ל־`WSM active_stage_id` ומייצרת הודעה מסוג `AD-V2-05` (סטייה בין pipeline ל־WSM).

**הפער:** אין **פקודת pytest / סקריפט `--check`** שקוראת את אותם קבצים ונכשלת ב־exit code ≠ 0 כשהסטייה קיימת — ולכן **Team 50 לא יכול "לסגור איכות"** על סמך CI בלבד.

---

### G4.2 — כפילות לוגיקה: מיפוי Gate ב־JavaScript vs Python

**תיאור:** ב־`pipeline-config.js` מוגדרת טבלת `LEGACY_GATE_TO_CANONICAL` (מיפוי מזהי gate ישנים ל־מודל קנוני של 5 גייטים). במקביל, ב־`agents_os_v2` קיימת מיגרציה ומעברי gate ב־Python. **אין טסט שמבטיח ששני הצדדים נשארים עקביים.**

**ראיה (קטע מבנה):**

```javascript
// agents_os/ui/js/pipeline-config.js — LEGACY_GATE_TO_CANONICAL (מקוצר)
const LEGACY_GATE_TO_CANONICAL = {
  "GATE_0": "GATE_1", "WAITING_GATE2_APPROVAL": "GATE_2",
  "G3_PLAN": "GATE_3", "G3_5": "GATE_3", "G3_6_MANDATES": "GATE_3", "CURSOR_IMPLEMENTATION": "GATE_3",
  "GATE_6": "GATE_4", "WAITING_GATE6_APPROVAL": "GATE_4", "GATE_7": "GATE_4",
  "GATE_8": "GATE_5",
};
```

**הסיכון:** שינוי ב־`PipelineState` / migration ב־Python או עדכון ב־UI — **ללא טסט משותף** — יוצר את התסמין שתיארתם: **הממשק מציג משהו אחר ממצב הריצה האמיתי.**

---

### G4.3 — אין כיסוי בדיקות ל־`agents_os/ui` ב־`agents_os_v2/tests`

**תיאור:** `grep` על `agents_os_v2/tests` **לא** מוצא אזכורים ל־`pipeline-dashboard` / `pipeline-config`. כלומר: **רגרסיות UI↔קובץ state אינן נתפסות ב־pytest.**

**ראיה:** הטסטים הקיימים (`test_integration.py`) בודקים אובייקט `PipelineState` ופארסר — **לא** את נתיבי ה־`fetch` או את התוצאה הוויזואלית/לוגית שהמשתמש רואה.

---

### G4.4 — `pipeline_events.jsonl` — לוג בלי חוזה אירוע↔מצב

**תיאור:** קיים `pipeline_events.jsonl` (אנלוגי לוג ביקורת). **חסר** סט כללים אוטומטיים: "אחרי אירוע `pass` או `store`", צפוי שינוי בשדה X ב־`pipeline_state`, או סדר אירועים מינימלי.

**הפער:** אי אפשר ל־Team 50 לאמת **תהליך** בלי קריאה ידנית של הלוג.

---

### G4.5 — שני מסלולי `state_reader` / snapshot (סיכון drift)

**תיאור:** קיימת גרסה תחת `agents_os/observers/state_reader.py` (עם טסטים ב־`agents_os/tests/test_state_reader.py`) וגרסה תחת `agents_os_v2/observers/state_reader.py`. אם שתיהן מייצרות / מתייחסות ל־`STATE_SNAPSHOT.json`, נדרש **חוק אחד** מי "מקור האמת" ל־CI — אחרת drift בין סביבות.

---

## §5 — המלצות (ממוקדות, לפי עדיפות)

| # | המלצה | תועלת ל־Team 50 |
| --- | --- | --- |
| **R1** | **חוזה JSON + טסט סכמה** ל־`pipeline_state_*.json` (שדות חובה שה־UI קורא: `current_gate`, `stage_id`, `project_domain`, `gate_state`, וכו') | כשלון מוקדם כששדה נשבר או נוסף רק בצד אחד |
| **R2** | **טסט אחידות מיפוי Gate** — מקור אמת יחיד (למשל YAML/JSON ב־repo) שממנו נגזרים גם Python וגם יצוא ל־JS build step, **או** טסט שמשווה טבלאות | מונע סינכרון שבור בין דשבורד לפייפליין |
| **R3** | **`--check` CI: WSM ↔ pipeline_state ↔ STATE_SNAPSHOT** (כללים מפורשים; exit 1 על drift) | איכות "בלי דפדפן" — מתאים למטרת דימוי |
| **R4** | **Harness דימוי עם fixtures** — תיקיית `agents_os_v2/tests/fixtures/pipeline_scenarios/` עם קבצי state + צפי (expected derived view / warnings) | הרצת צוותים מדומה; חזרתיות |
| **R5** | **כללי לוג** (אופציונלי בשלב ב'): סכימת אירועים מינימלית או snapshot אחרון של אירועים שמותאם ל־state | ניטור איכותי של תהליך |
| **R6** | **בדיקת דפדפן רזה** (Playwright/Selenium) או בדיקת Node שמטעינה את פונקציות ה־JS הרלוונטיות | רק אם R1–R4 קיימים — כדי לא לבנות על חול |

---

## §6 — מה דרוש ל־Team 50 כדי לממש את היעדים שלנו

**אנחנו לא יכולים "לאמת את המכונה"** בצורה אמינה בלי:

1. **החלטה אדריכלית (SSOT):** מי מקור האמת ל־"איפה אנחנו בפייפליין" — קובץ state בלבד, או WSM, או שניהם עם כללי קדימות; ואיך **כשל** ב־CI מוגדר.
2. **מנדט חוצה-צוותים** (למשל Team 51 + Team 61) ליישום R1–R4 בקוד (לא רק דוח).
3. **גישת CI** — ריצת `pytest` + סקריפטים check-only על כל PR שמשנה `agents_os_v2` או `agents_os/ui`.
4. **fixtures יציבים** — לא תלויים ב־`_COMMUNICATION/agents_os/*.json` של עבודה יומיומית; אלא קבצים ב־`tests/fixtures/` או עותקים ב־git.
5. **הפרדה:** בדיקות **דימוי** לא יכתבו ל־`_COMMUNICATION/agents_os/` בזמן CI (או לפי כלל ברור) — כדי לשמור על check-only.

---

## §7 — דוגמאות מפורטות (למימוש עתידי)

### דוגמה A — טסט "אי-התאמת שלב" (עקרון)

**קלט:** fixture `pipeline_state_agentsos.json` עם `stage_id: "S003"` וקובץ WSM (או snippet) עם `active_stage_id: "S002"`.  
**צפוי:** פונקציית בדיקה שמחזירה את אותה `Finding`/`AD-V2-05` שהדשבורד היה מציג — **או** כשל CI אם מדיניות היא zero drift.  
**ערך:** Team 50 מריץ `pytest` ומקבל מענה מספרי בלי UI.

### דוגמה B — טסט מיפוי Gate

**קלט:** רשימת כל המפתחות ב־`LEGACY_GATE_TO_CANONICAL`.  
**צפוי:** לכל מפתח, קריאה ל־`resolveCanonicalGate` (דרך Node/jsdom או יצוא טבלה ל־JSON) ואימות מול טבלה מיוצאת מ־Python (או מקובץ YAML יחיד).  
**ערך:** רגרסיה אוטומטית על שינוי שם gate.

### דוגמה C — Harness דימוי

**קלט:** `scenario_gate3_pass.json` (state מלא).  
**צפוי:** אחרי הרצת "סימולטור" (סקריפט שמעדכן state ומדמה `pass`), קובץ state חדש + `expected_hash` או שדות נבחרים.  
**ערך:** סימולציה של צוות בלי אנשים.

---

## §8 — בקשה לאדריכלות (Team 00)

1. **לאשר עקרון:** אימות יחסי (WSM / state / snapshot) כ־**quality gate** ב־CI, לא רק אזהרת UI.  
2. **להגדיר בעלות:** מי מממש R1–R4 (המלצה: **Team 51** QA, **Team 61** אינטגרציה CI, אישור **Team 170** על סכמות).  
3. **להגדיר מדיניות drift:** האם ריפו חייב להיות תמיד "נקי" מסתירה, או מותרים מצבי מעבר ב־`_COMMUNICATION` — זה משפיע על אם ה־check רץ על working tree או רק על fixtures.

---

## §9 — נספח — רשימת קבצים לאימות (audit trail)

| נתיב | קשר |
| --- | --- |
| `agents_os/ui/js/pipeline-config.js` | מיפוי gate, נתיבי state |
| `agents_os/ui/js/pipeline-dashboard.js` | אזהרות STATE_SNAPSHOT / WSM / pipeline |
| `agents_os_v2/orchestrator/state.py` | `PipelineState`, טעינה, דומיינים |
| `agents_os_v2/observers/state_reader.py` | STATE_SNAPSHOT + `read_pipeline_state` |
| `agents_os_v2/tests/test_integration.py` | טסטים — אין UI |
| `agents_os_v2/validators/wsm_alignment.py` | V-25–V-29 במסמך |
| `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` | אמת ריצה (דינמי) |
| `_COMMUNICATION/agents_os/logs/pipeline_events.jsonl` | לוג אירועים |

---

**log_entry | TEAM_50 | AGENTS_OS | PIPELINE_UI_QA_CONTROL_ANALYSIS | SUBMITTED_TO_TEAM_00 | 2026-03-17**

---

## PHOENIX TASK SEAL (SOP-013) — תקשורת אדריכלית (אינפורמטיבי)

```
--- PHOENIX TASK SEAL ---
TASK_ID: TEAM_50_TEAM_00_AGENTS_OS_PIPELINE_QA_CONTROL_ANALYSIS_v1.0.0
STATUS: COMPLETE (informational deliverable)
DATE: 2026-03-17
FILES_MODIFIED:
  - _COMMUNICATION/team_50/TEAM_50_TO_TEAM_00_AGENTS_OS_PIPELINE_UI_SYNC_QA_CONTROL_ANALYSIS_v1.0.0.md
PRE_FLIGHT: N/A (documentation only)
HANDOVER_PROMPT: Team 00 — review §5–§8; assign ownership for R1–R4; Team 10 — route mandates to Team 51/61 as approved.
--- END SEAL ---
```
