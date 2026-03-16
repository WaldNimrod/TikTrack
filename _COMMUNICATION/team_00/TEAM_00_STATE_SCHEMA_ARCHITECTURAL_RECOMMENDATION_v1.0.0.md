---
document_id: TEAM_00_STATE_SCHEMA_ARCHITECTURAL_RECOMMENDATION_v1.0.0
from: Team 00 (Chief Architect)
to: Team 100 (AOS Domain Architect), Team 61 (Pipeline UI Specialist), Team 190 (Constitutional Validator), Team 170 (Registry & Documentation)
date: 2026-03-16
status: DECISION_PENDING — Nimrod approval required
authority: Team 00 — Constitutional Architectural Authority
supersedes: TEAM_00_WSM_PIPELINE_SYNC_ARCHITECTURAL_DECISION_v1.0.0 (2026-03-16)
---

# State Document Schema — Full Architectural Recommendation
## Team 00 | Iron Rule Analysis | Dual-Domain | Three Modes

---

## 0. המנדט לניתוח הזה

**עיקרון מנחה (Nimrod):** אנחנו בונים תשתית בסיסית למערכת גדלה — נדרשים פטרונות יציבים, ישרים,
לטווח ארוך. לא טלאים, לא עקיפות. ארכיטקטורה יציבה.

**דרישות מחייבות:**
1. שני דומיינים במקביל — כל דומיין ערוץ עצמאי, זהה במבנה
2. שלושה מצבי עבודה: ידני (Mode 1) / חצי-אוטומטי (Mode 2) / אוטומטי מלא (Mode 3)
3. 100% סנכרון בין כל קבצי המצב בכל עת
4. זיהוי drift ברגע היווצרותו — עם התראה וסיוע להחלמה
5. כיסוי מלא: שני דומיינים, כל תהליכים, כל שלבים

---

## 1. מיפוי מסמכי המצב הקיימים

### מסמך 1 — PHOENIX_MASTER_WSM_v1.0.0.md
| שדה | ערך |
|-----|-----|
| פורמט | Markdown |
| כותב | Gate Owners (ידני) |
| תכולה | active_stage, active_program_id, active_work_package_id, current_gate, phase_owner_team, last_closed_WP |
| מיקום | `documentation/docs-governance/01-FOUNDATIONS/` |
| רוחב | **Single-track** — משדות אחד פעיל בכל רגע |
| משתמשים | Teams 90/100/190, sync script, state_reader.py (חלקי) |

**בעיות בארכיטקטורה הנוכחית:**
- `active_project_domain` = שדה אחד בלבד — לא מסוגל להביע שני דומיינים פעילים בו-זמנית
- WSM לא מציין per-domain state — לא ברור מה קורה ב-TikTrack בזמן שAGENTS_OS עובד

---

### מסמך 2 — pipeline_state_{domain}.json (×2)
| שדה | ערך |
|-----|-----|
| פורמט | JSON |
| כותב | `pipeline_run.sh` / `state.py` (אוטומטי) |
| תכולה | **שדות זהות:** work_package_id, stage_id, project_domain, spec_brief + **שדות execution:** current_gate, gates_completed, gates_failed, lld400_content, work_plan, mandates, spec_path, started_at, last_updated + שדות PWA |
| מיקום | `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` + `pipeline_state_tiktrack.json` |
| משתמשים | pipeline CLI, Dashboard (ישירות), state_reader.py |

**בעיות:**
- מכיל **שדות זהות** (work_package_id, stage_id, project_domain) — אלה שדות של WSM, לא של execution
- ברירת מחדל `work_package_id = "REQUIRED"` — sentinel שעלה לדיסק
- שני קבצים יכולים לסתור את WSM ללא כל מנגנון זיהוי

---

### מסמך 3 — pipeline_state.json (legacy)
| שדה | ערך |
|-----|-----|
| פורמט | JSON |
| כותב | `state.py` (mirror של last active domain, DEPRECATED) |
| תכולה | זהה לmain domain JSON |
| מיקום | `_COMMUNICATION/agents_os/pipeline_state.json` |
| משתמשים | legacy fallback path (אמור להיות מבוטל) |

**בעיות:**
- DEPRECATED אך עדיין נכתב בכל `save()`
- יוצר confusion — שלושה קבצי state JSON במקום שניים
- מציין fallback שאמור להיות מוסר (CS-03)

---

### מסמך 4 — STATE_SNAPSHOT.json
| שדה | ערך |
|-----|-----|
| פורמט | JSON |
| כותב | `state_reader.py` (generated) |
| תכולה | governance (WSM — חלקי), pipeline.domains (מJSON), codebase stats, quality stats, artifact checks |
| מיקום | `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json` |
| משתמשים | Dashboard (pipeline section), pipeline_run.sh (generated on every command) |

**בעיות:**
- `read_governance_state()` קורא WSM אבל **לא מחלץ** `active_work_package_id` או `active_project_domain`
- `read_pipeline_state()` קורא JSON ישירות — לא משווה לWSM
- **לא אינטגרציה** — שתי קריאות נפרדות, ללא cross-check → drift בלתי נראה
- Dashboard קורא מה-JSON ישירות (לא מ-STATE_SNAPSHOT לכל שדה) — לא עקבי

---

### מסמכים 5+6 — Program Registry + WP Registry
| שדה | ערך |
|-----|-----|
| פורמט | Markdown |
| כותב | `sync_registry_mirrors_from_wsm.py` + Team 170 |
| תכולה | קטלוג תוכניות ו-WPs — מראה מ-WSM |
| מיקום | `documentation/docs-governance/01-FOUNDATIONS/` |
| בעיות | לא כולל pipeline_state JSON בrule הסנכרון |

---

## 2. מפת הבעיות הנוכחית

### B-01: חלוקת אחריות שגויה (שורש הכל)

**pipeline_state JSON מכיל שדות שהם בתחום אחריות WSM:**

```
work_package_id  ← מי מחליט? WSM או JSON? כרגע: שניהם
stage_id         ← מי מחליט? WSM או JSON? כרגע: שניהם
project_domain   ← מי מחליט? WSM או JSON? כרגע: שניהם
```

כל שדה שיש לו שני כותבים פוטנציאליים — יוצר drift. **זה הכשל האדריכלי הראשי.**

---

### B-02: WSM חד-ערוצי (Single-Track) מול מציאות דו-ערוצית

WSM מוגדר לדומיין פעיל אחד. המציאות היא שניים.
כשTIKTRACK ו-AGENTS_OS עובדים במקביל — WSM לא מסוגל לתאר את המצב.

---

### B-03: STATE_SNAPSHOT — אין אינטגרציה, יש אשליה

STATE_SNAPSHOT נראה כמו Integration Layer אבל הוא לא.
הוא שני קריאות נפרדות ללא cross-check. Dashboard מקבל תמונה לא שלמה.

---

### B-04: Legacy pipeline_state.json — רעש בלתי-הכרחי

שלושה JSON במקום שניים. Fallback שאמור להיות מוסר — לא הוסר.

---

### B-05: ה-Dashboard קורא שני מקורות שונים ישירות

Dashboard קורא STATE_SNAPSHOT לחלק מהנתונים ו-pipeline_state JSON ישירות לחלק אחר.
לא עקבי. לא ניתן לבדוק drift.

---

## 3. ארכיטקטורה מוצעת — Two-Authority Schema

### עיקרון יסוד: כל שדה יש לו כותב אחד בלבד

```
┌─────────────────────────────────────────────────────────────────┐
│  PORTFOLIO AUTHORITY — WSM                                      │
│                                                                 │
│  מה פעיל: stage, program, WP, gate_owner, phase_status         │
│  כותב: Gate Owners (Mode 1/2) / pipeline engine (Mode 3)       │
│  Schema: STAGE_PARALLEL_TRACKS (dual-domain, per row)          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ init (WSM → read WP identity)
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  EXECUTION AUTHORITY — pipeline_state_{domain}.json            │
│                                                                 │
│  מה קורה: current_gate, gates_completed, gates_failed,         │
│          lld400_content, work_plan, mandates, spec_path        │
│  כותב: pipeline_run.sh / state.py בלבד                         │
│  לא כולל: work_package_id, stage_id, project_domain           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ generated (WSM + JSON → merge + drift check)
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  OPERATIONAL_VIEW.json — Generated Read Layer (SINGLE SOURCE)  │
│                                                                 │
│  מה: מיזוג WSM + JSON לכל דומיין + drift detection + health   │
│  כותב: state_reader.py בלבד (auto-generated, never manual)    │
│  קוראים: Dashboard, CLI status, Teams page, all UI             │
│  עדכון: אחרי כל pipeline_run.sh command + on demand           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. WSM Schema Change — STAGE_PARALLEL_TRACKS

### מה משתנה ב-WSM

**מוסיפים** block `STAGE_PARALLEL_TRACKS` (זו המלצת Team 100 Option B — אושרה עקרונית):

```markdown
## STAGE_PARALLEL_TRACKS

| domain | active_program_id | active_work_package_id | phase_status | current_gate | gate_owner_team | execution_orchestrator |
|--------|-------------------|------------------------|--------------|--------------|-----------------|----------------------|
| AGENTS_OS | S002-P005 | S002-P005-WP003 | ACTIVE | GATE_0 | Team 100 | Team 10 |
| TIKTRACK | — | — | IDLE | — | — | — |
```

**מה זה נותן:**
- תמונה מלאה ומפורשת של כל הדומיינים בכל רגע
- Single source of truth לשאלה "מה פעיל לכל דומיין"
- ניתן להרחיב לדומיין שלישי ללא שינוי מבני
- Gate Owners יודעים בדיוק מה לעדכן

**ה-`CURRENT_OPERATIONAL_STATE` הקיים:**
- נשמר לתאימות לאחור
- ממשיך להחזיק: active_stage_id, hold_reason, last_closed_WP (global fields)
- per-domain fields מועברים ל-STAGE_PARALLEL_TRACKS
- בינוני: `active_project_domain` + `active_work_package_id` ב-CURRENT_OPERATIONAL_STATE = ה-domain הראשי הנוכחי (primary focus) + link ל-STAGE_PARALLEL_TRACKS

---

## 5. pipeline_state_{domain}.json — Schema Cleanup

### שדות שיוסרו (שייכים ל-WSM בלבד)

```json
// הסרה מ-PipelineState dataclass:
"work_package_id": "S002-P005-WP003",  ← מ-WSM
"stage_id": "S002",                     ← מ-WSM
"project_domain": "agents_os",          ← encoded בשם הקובץ
"spec_brief": "..."                     ← מ-WP Registry / LOD200 doc
```

### שדות שנשמרים (execution בלבד)

```json
{
  "pipe_run_id": "a7f209c1",
  "current_gate": "GATE_0",
  "gates_completed": [],
  "gates_failed": ["GATE_0"],
  "lld400_content": "",
  "work_plan": "",
  "mandates": "",
  "implementation_files": [],
  "implementation_endpoints": [],
  "spec_path": "...",
  "started_at": "2026-03-16T00:00:00Z",
  "last_updated": "...",
  "gate_state": null,
  "pending_actions": [],
  "override_reason": null,
  "phase8_content": ""
}
```

### sentinel values החדשים

```python
# state.py — ברירות מחדל חדשות:
current_gate: str = "NOT_STARTED"    # לא שונה
gates_completed: list = []            # לא שונה
gates_failed: list = []               # לא שונה
# work_package_id: REMOVED — לא קיים יותר ב-execution state
```

**ה-execution state file קיים = WP רץ בדומיין זה.**
**ה-execution state file לא קיים = דומיין זה IDLE.**
**לא נדרש sentinel `"NONE"` — היעדר הקובץ הוא ה-sentinel.**

---

## 6. OPERATIONAL_VIEW.json — Schema

קובץ זה מחליף את STATE_SNAPSHOT.pipeline section ומשמש כשכבת הקריאה היחידה.

```json
{
  "schema_version": "1.0.0",
  "generated_at": "2026-03-16T12:00:00Z",
  "generator": "state_reader.py",
  "read_only": true,
  "stage_id": "S002",
  "domains": {
    "agents_os": {
      "phase_status": "ACTIVE",
      "active_program_id": "S002-P005",
      "active_work_package_id": "S002-P005-WP003",
      "gate_owner_team": "Team 100",
      "execution_orchestrator": "Team 10",
      "current_gate": "GATE_0",
      "gates_completed": [],
      "gates_failed": ["GATE_0"],
      "gate_state": null,
      "pending_actions": [],
      "sources": {
        "identity": "wsm:STAGE_PARALLEL_TRACKS",
        "execution": "pipeline_state_agentsos.json"
      },
      "health": {
        "status": "OK",
        "drift_detected": false,
        "warnings": [],
        "recovery_commands": []
      }
    },
    "tiktrack": {
      "phase_status": "IDLE",
      "active_program_id": null,
      "active_work_package_id": null,
      "gate_owner_team": null,
      "execution_orchestrator": null,
      "current_gate": null,
      "gates_completed": [],
      "gates_failed": [],
      "sources": {
        "identity": "wsm:STAGE_PARALLEL_TRACKS",
        "execution": "none"
      },
      "health": {
        "status": "IDLE",
        "drift_detected": false,
        "warnings": [],
        "recovery_commands": []
      }
    }
  },
  "drift_summary": {
    "has_drift": false,
    "drift_count": 0,
    "drift_items": []
  },
  "snapshot_meta": {
    "wsm_path": "...",
    "execution_files_read": ["pipeline_state_agentsos.json"]
  }
}
```

---

## 7. Drift Detection — Catalog of Cases

עם הארכיטקטורה החדשה, state_reader.py בודק:

| מצב | drift_detected | health.status | recovery_command |
|-----|----------------|---------------|-----------------|
| WSM: ACTIVE, Execution: exists, current_gate consistent | false | OK | — |
| WSM: ACTIVE, Execution: **file not found** | true | ERROR | `./pipeline_run.sh --domain X init` |
| WSM: IDLE, Execution: **file exists** (orphaned) | true | WARNING | `./pipeline_run.sh --domain X reset` or update WSM |
| WSM: ACTIVE WP=X, Execution: gate=COMPLETE | true | WARNING | WSM not updated after GATE_8; run: `sync_registry` |
| WSM: ACTIVE, Execution: gates_completed + gates_failed overlap | true | ERROR | CS-02 violation; contact Team 00 |
| OPERATIONAL_VIEW.json age > 3600s | false | STALE_WARNING | `./pipeline_run.sh --domain X status` |

**כל drift → הודעה ברורה בדשבורד + recovery_command מוגדר.**

---

## 8. זרימת מידע לפי מצב עבודה (Mode)

### Mode 1 — ידני (ללא AOS pipeline)

```
Gate Owner מעדכן WSM → STAGE_PARALLEL_TRACKS
         ↓
Team 10 מריץ: ./pipeline_run.sh --domain X init
         ↓
state_reader.py מייצר OPERATIONAL_VIEW.json
         ↓
Dashboard / Teams / Roadmap קוראים OPERATIONAL_VIEW.json
         ↓
Team 10 מריץ: ./pipeline_run.sh --domain X pass/fail
         ↓
state_reader.py מייצר OPERATIONAL_VIEW.json מחדש (auto)
         ↓
Gate Owner מעדכן WSM לאחר GATE_8 PASS
         ↓
sync_registry_mirrors_from_wsm.py --write
         ↓
OPERATIONAL_VIEW.json updated → IDLE state
```

### Mode 2 — חצי-אוטומטי (AOS + Dashboard)

```
כמו Mode 1 אבל:
- Dashboard = ממשק הפעולה הראשי
- pipeline_run.sh מריץ state_reader.py אוטומטית לאחר כל פקודה
- GATE_0/1/4/5/8: pipeline מתקדם אוטומטית לאחר pass/fail
- GATE_2/6/7: human pause — Dashboard מציג ל-Nimrod לאישור
- Dashboard מציג OPERATIONAL_VIEW.json בלבד — אף פעם לא קורא WSM/JSON ישירות
```

### Mode 3 — אוטומטי מלא (עתידי)

```
Pipeline engine קורא WSM (STAGE_PARALLEL_TRACKS)
         ↓
מאתחל execution state אוטומטית (init)
         ↓
מריץ כל שערים ידועים אוטומטית
         ↓
GATE_2/GATE_7: pause → Nimrod notification → human approval
         ↓
GATE_8: pipeline engine מעדכן WSM STAGE_PARALLEL_TRACKS אוטומטית
         ↓
OPERATIONAL_VIEW.json → IDLE state
```

**עיקרון קריטי Mode 3:** גם ב-Mode 3, Nimrod הוא הסמכות היחידה ב-GATE_2 ו-GATE_7. ה-Pipeline engine מעולם לא עוקף את שתי שערי ה-human approval.

---

## 9. Legacy Removal Plan

### pipeline_state.json (legacy file)

**Phase 1 (WP003):** Mark `# DEPRECATED` (כבר הוחלט ב-CS-03 mandate)
**Phase 2 (WP004 / S003):** הסרה מלאה — state.py מפסיק לכתוב אותו

### STATE_SNAPSHOT.json

**Phase 1 (WP003):** STATE_SNAPSHOT.json ממשיך לקיים — codebase stats, artifact checks, quality state נשמרים
**Phase 2:** Pipeline section ב-STATE_SNAPSHOT.json מוחלף על ידי OPERATIONAL_VIEW.json

שני הקבצים יכולים לדור יחד: STATE_SNAPSHOT = codebase health; OPERATIONAL_VIEW = pipeline state.
לאחר Phase 2, Dashboard קורא OPERATIONAL_VIEW.json לpipeline state + STATE_SNAPSHOT.json לcodebase stats.

---

## 10. מפת מסמכי מצב — מבנה יעד

```
Pipeline State Documents (Target Architecture)
│
├── WSM (Human SSOT — Portfolio)
│   ├── CURRENT_OPERATIONAL_STATE (global: stage, hold, last_closed)
│   └── STAGE_PARALLEL_TRACKS (per-domain: program, WP, gate, owner)
│                 ↓ init trigger
├── pipeline_state_{domain}.json (Execution SSOT)
│   ├── pipeline_state_agentsos.json (execution only — no identity)
│   └── pipeline_state_tiktrack.json (execution only — no identity)
│                 ↓ generated
├── OPERATIONAL_VIEW.json (Generated Integration — Single Read Source)
│   └── All UI reads this only; drift detection; health status
│                 ↓ generated (WSM sync)
├── PHOENIX_PROGRAM_REGISTRY (WSM mirror)
└── PHOENIX_WORK_PACKAGE_REGISTRY (WSM mirror)

REMOVED:
└── pipeline_state.json (legacy — remove at WP004/S003)
```

---

## 11. השוואה: לפני / אחרי

| נושא | לפני | אחרי |
|------|------|-------|
| שדות זהות | בWSM ובJSON | בWSM בלבד |
| dual-domain | שדה אחד, לא מובע | STAGE_PARALLEL_TRACKS מפורש |
| drift visibility | אין | OPERATIONAL_VIEW.json + recovery_command |
| Dashboard מקור | JSON ישירות + STATE_SNAPSHOT חלקי | OPERATIONAL_VIEW.json בלבד |
| init flow | WP_ID כparameter → JSON (ללא בדיקת WSM) | reads WSM → init execution state |
| Mode 3 readiness | לא מוגדר | WSM = input; execution = output; human gates = unchanged |
| legacy confusion | 3 JSON files | 2 JSON files (→ 2 in WP004) |
| sentinel `"REQUIRED"` | קיים, עולה לדיסק | REMOVED — היעדר קובץ = IDLE |

---

## 12. scope השפעה על WP003

WP003 כרגע מוגדר כ-CS-01..CS-08 (תיקוני symptoms).
ניתוח זה מציג שורש — לא תסמינים.

**שתי אפשרויות:**

### אפשרות I — הרחבת WP003 לכלול Schema Change
**scope:** CS-01..CS-08 + Schema Change (סעיפים 4–6 למעלה)
**יתרון:** פתרון שלם ב-WP אחד; אין WP נוסף
**חיסרון:** scope גדל; GATE_0 כבר submitted לTeam 190

### אפשרות II — WP003 כroadmap + WP004 כschema change
**WP003:** CS-01..CS-08 — תיקון התסמינים
**WP004:** Schema Change — WSM STAGE_PARALLEL_TRACKS + JSON cleanup + OPERATIONAL_VIEW.json
**יתרון:** WP003 scope שמור; WP004 מוגדר מראש ומחוייב
**חיסרון:** עוד WP; שני שלבים

**המלצת Team 00: אפשרות II**

**נימוק:** WP003 כבר submitted ל-GATE_0. הרחבת scope ב-GATE_0 == חזרה לשרטוט ← עיכוב.
CS-01..CS-08 הם fixes אמיתיים שנדרשים ללא קשר לschema change.
Schema change = WP004 המוגדר, מתוכנן, ומחוייב כ-"next WP after WP003 GATE_8 PASS".
WP003 + WP004 = פתרון שלם. WP004 חייב להיות unlocked + registered **עכשיו**.

---

## 13. תיקון מיידי (לא תלוי בהחלטה)

ללא קשר לאיזה option יבחר, שלושת הפריטים הבאים חייבים לתוקן עכשיו:

| # | תיקון | מבצע | בלוקינג? |
|---|--------|------|----------|
| F-IMM-1 | WSM: הוספת `STAGE_PARALLEL_TRACKS` עם מצב נוכחי מדויק | Gate Owner (Nimrod) | כן — WP003 לא יכול להתקדם ללא מצב WSM מדויק |
| F-IMM-2 | `pipeline_state_tiktrack.json`: מחיקה (IDLE = no file) | Team 61 | כן — phantom state מבלבל |
| F-IMM-3 | WSM `CURRENT_OPERATIONAL_STATE.active_work_package_id`: N/A → S002-P005-WP003 | Gate Owner (Nimrod) | כן — WSM חייב לשקף את ה-pipeline_state הקיים |

---

## 14. החלטות הנדרשות מ-Nimrod

### החלטה 1 — אישור הארכיטקטורה המוצעת
האם Two-Authority Schema + STAGE_PARALLEL_TRACKS + OPERATIONAL_VIEW.json = הפטרן הנכון?

### החלטה 2 — scope WP003 vs WP004
- **אפשרות I**: הרחבת WP003 (scope גדול, GATE_0 re-submission)
- **אפשרות II** (המלצת Team 00): WP003 = symptom fixes; WP004 = schema change

### החלטה 3 — WSM dual-domain timing
- **A**: STAGE_PARALLEL_TRACKS נכנס עכשיו (F-IMM-1) ומשמש גם ב-WP003
- **B**: STAGE_PARALLEL_TRACKS נכנס ב-WP004 (clean implementation)

**המלצת Team 00:** A — נוסיף עכשיו כי F-IMM-1 נדרש לכן ממילא.

---

## 15. פעולות לאחר אישור

עם אישור Nimrod לארכיטקטורה הזו:

**מיידי — Team 00 / Gate Owner:**
- [ ] F-IMM-1: הוספת STAGE_PARALLEL_TRACKS לWSM
- [ ] F-IMM-3: עדכון WSM active_work_package_id → S002-P005-WP003

**מיידי — Team 61:**
- [ ] F-IMM-2: מחיקת pipeline_state_tiktrack.json (IDLE domain = no file)

**WP003 scope (Team 100 mandate extension):**
- [ ] CS-04 (sentinel fix): הסרת `work_package_id = "REQUIRED"` default → הסרת שדה מdataclass בWP004; ב-WP003: change default to `"NONE"` as interim

**WP004 registration (Team 170):**
- [ ] רישום WP004 ב-WP Registry עם scope: WSM STAGE_PARALLEL_TRACKS protocol + JSON schema cleanup + OPERATIONAL_VIEW.json implementation + pipeline init flow update

---

**log_entry | TEAM_00 | STATE_SCHEMA_ARCHITECTURAL_RECOMMENDATION | v1.0.0_CREATED | DECISION_PENDING | 2026-03-16**
