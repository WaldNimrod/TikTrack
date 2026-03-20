---
project_domain: AGENTS_OS
id: TEAM_11_TO_TEAM_51_S003_P011_WP002_FULL_QA_REQUEST_v1.0.0
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 61, Team 90, Team 100, Team 101, Team 190, Team 00
date: 2026-03-20
status: QA_REQUEST_ACTIVE
work_package_id: S003-P011-WP002
gate_context: GATE_3 Phase 3.3 (primary execution) + Tier-2 pre-GATE_4 (Team 90 corroboration)
type: FULL_SCOPE_QA_REQUEST
authority_lod200: _COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.1.md
authority_lld400: _COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.1.md
authority_workplan: _COMMUNICATION/team_11/TEAM_11_S003_P011_WP002_GATE_2_WORKPLAN_v1.0.0.md
---

# S003-P011-WP002 — בקשת QA מלאה ומפורטת (Team 51)
## Pipeline Stabilization & Hardening | כיסוי סקופ + תרחישי CERT/SMOKE + MCP E2E

---

## הודעת כוונה (עברית) — Team 11

במנדט Team 100, ב-LOD200 v1.0.1 וב-Work Plan הוגדרו **במפורש** תרחישי בדיקה (Tier-1 **CERT_01..CERT_15**, Tier-2 **SMOKE_01..SMOKE_03**) ו-**AC-WP2-01..22**.  
**חובה** ש-Team 61 יממש, יריץ ויצרף **ארטיפקטים** (לוגים, פלט pytest, צילומי מצב JSON, הוכחות MCP) שמדויקים לתרחישים — וש-**Team 51** יאמת **דיוק 1:1** מול הטבלאות הקנוניות.

מסמך זה הוא **בקשת QA מלאה**: כיסוי כל הסקופ הרלוונטי ל-WP002, כולל **בדיקות E2E עם MCP** (דפדפן/מצב צינור) כפי ש-LOD200 §2.9 וברזל #3 מחייבים לפני GATE_4.

**מקור אמת ל-CERT_01..15:** LLD400 v1.0.1 **§17.5** (דוחף על ניסוח LOD200 §2.9 אם יש סתירה — במיוחד **CERT_15** = אינטגרציית התקדמות מלאה, לא רק FCP בודד).

---

## Mandatory Identity Header

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P011 |
| work_package_id | S003-P011-WP002 |
| task_id | WP002_FULL_QA |
| gate_id | GATE_3 (Phase 3.3) / corroboration for GATE_4 Tier-2 |
| phase_owner | Team 51 (QA execution) |
| required_ssm_version | 1.0.0 |
| required_active_stage | S003 |

---

## §1 — Preconditions (Team 61 evidence gate)

לפני סגירת QA, Team 51 **לא** מכריז PASS סופי בלי:

| # | Precondition | Evidence type |
|---|----------------|---------------|
| P1 | `agents_os_v2/tests/test_certification.py` קיים ומכסה CERT_01..15 | pytest stdout / CI log + path |
| P2 | `python3 -m pytest agents_os_v2/tests/test_certification.py -v` — **0 כשלונות** | ארטיפקט צמוד |
| P3 | `python3 -m pytest agents_os_v2/ -v` — **127+** טסטים קיימים ירוקים (AC-WP2-12) | regression log |
| P4 | `pipeline_run.sh` תומך ב-`pass`/`fail`/מזהה gate כפי LLD400 §7 | הדגמה + לוג |
| P5 | מסמך/פרוצדורה Tier-2: `documentation/docs-governance/04-PROCEDURES/PIPELINE_SMOKE_TESTS_v1.0.0.md` (או נתיב קנוני מעודכן בקוד) | קובץ קיים + גרסה |

---

## §2 — Tier 1: CERT_01..CERT_15 (pytest) — עקיפה מלאה מול LLD400 §17.5

לכל שורה: Team 51 **מאשר** שקיים טסט בשם/במזהה המתאים, **מריץ**, ורושם בדוח ה-QA: תוצאה, פקודה, path לקוד הטסט.

| CERT | Fixture / input (per §17.5) | Target function / path | Assertions (must match exactly) |
|------|----------------------------|-------------------------|--------------------------------|
| CERT_01 | `aos_track_focused_state` | `_generate_gate2_prompt` | Team **11**, phase **2.2**, workplan instructions |
| CERT_02 | TikTrack @ GATE_2 / 2.2 | `_generate_gate2_prompt` | Team **10** (not 11) |
| CERT_03 | AOS @ GATE_3 / 3.1 | `_generate_gate3_prompt` | Team **11** mandate prompt |
| CERT_04 | AOS @ GATE_3 / 3.2 | `_generate_gate3_prompt` | Team **61** |
| CERT_05 | TikTrack @ GATE_3 / 3.2 | `_generate_gate3_prompt` | **teams 20/30/40** in output |
| CERT_06 | AOS + `lod200_author_team=team_101` @ 4.2 | `_generate_gate4_prompt` | **team_101** for 4.2 |
| CERT_07 | AOS + `lod200_author_team=team_100` @ 4.2 | `_generate_gate4_prompt` | **team_100** for 4.2 |
| CERT_08 | AOS @ GATE_5 / 5.1 | `_generate_gate5_prompt` | **team_170** (not 70) |
| CERT_09 | TikTrack @ GATE_5 / 5.1 | `_generate_gate5_prompt` | **team_70** (not 170) |
| CERT_10 | `correction_cycle_state` | `_generate_gate3_prompt` | `CORRECTION_CYCLE_BANNER` + findings text |
| CERT_11 | temp state | CLI `fail` + `--finding-type doc` (or equivalent) | `last_blocking_findings`, `last_blocking_gate`, cycle increment |
| CERT_12 | temp state | `pass GATE_3` / `pass GATE_2` | match OK; mismatch **aborts** |
| CERT_13 | old gate `G3_6_MANDATES` | `PipelineState.load(domain)` | → `GATE_3` / `3.1` + migration event |
| CERT_14 | old gate `G3_PLAN` | `PipelineState.load(domain)` | → `GATE_2` / `2.2` (**BF-01**) |
| CERT_15 | full simulated progression | gate prompts + phase advance loop | all **5 gates** + phases valid |

**חובת ארטיפקט:** צילום פלט pytest או קישור ל-run ID (CI) + ציטוט שמות הפונקציות `test_cert_*` או שקילות ממופה בבירור בדוח Team 51.

---

## §3 — Tier 2: SMOKE_01..SMOKE_03 (E2E + MCP) — LOD200 §2.9

אלה **לא** מחליפים את pytest; הם נדרשים ל**אימות זמן ריצה** (Iron Rule #3 LOD200 §6).

### 3.1 סביבה

| Item | Requirement |
|------|-------------|
| Repo root | כל הפקודות מנתיב שורש הריפו |
| UI (אם נבדק דשבורד) | `http://localhost:8090` — מדיניות פורט נעולה ב-`AGENTS_OS_V2_OPERATING_PROCEDURES` §2.5 |
| MCP | שימוש ב-**cursor-ide-browser** (או MCP קנוני אחר שאושר לפרויקט) לקריאת DOM / ניווט — תעד **כלים ששימשו** בדוח |

### 3.2 SMOKE_01 — AOS / TRACK_FOCUSED, GATE_1→GATE_5

| Step | Action | Expected (MCP / file evidence) |
|------|--------|--------------------------------|
| S1.1 | `./pipeline_run.sh --domain agents_os` (או זרימה קנונית מקבילה) בכל שלב | פרומפט תקף, שיוך צוות נכון לפי `_DOMAIN_PHASE_ROUTING` |
| S1.2 | אחרי כל מעבר gate חוקי | קריאת `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` (או קובץ state פעיל) — `current_gate`, `current_phase`, `process_variant` תואמים תכנית |
| S1.3 | MCP | תיעוד קריאת קובץ המצב או snapshot מסך דשבורד המציג gate/phase עקביים |

### 3.3 SMOKE_02 — TikTrack / TRACK_FULL

זהה ל-SMOKE_01 עם `--domain tiktrack` (או מפתח domain התואם), כולל אימות ש-GATE_3/3.1 מפנה ל-**Team 10** ו-GATE_5/5.1 ל-**Team 70**.

### 3.4 SMOKE_03 — מחזור תיקון מלא

| Step | Action | Expected |
|------|--------|----------|
| S3.1 | `fail` עם סיבה + finding_type חוקי | שדות מצב תיקון מתמלאים |
| S3.2 | יצירת פרומפט הבא באותו gate | באנר תיקון + טקסט ממצאים |
| S3.3 | `pass` מאושר לאחר ניקוי | `last_blocking_*` נקי; מצב עקבי |

---

## §4 — AC-WP2-01..22 — מפת בדיקה חובה

כל שורה: **PASS / FAIL / BLOCKED** + `evidence-by-path`.

| AC | קצרה | אמצעי אימות עיקרי |
|----|------|-------------------|
| AC-WP2-01 | כל CERT ירוקים | §2 |
| AC-WP2-02 | agents_os @ 3.1 → Team 11 | prompt + grep owner |
| AC-WP2-03 | tiktrack @ 3.1 → Team 10 | prompt + grep owner |
| AC-WP2-04 | fail כותב findings | state JSON + לוג |
| AC-WP2-05 | pass gate שגוי נכשל | CLI exit ≠ 0 |
| AC-WP2-06 | מיגרציה TikTrack WP פעיל | load + state (השוואה לפני/אחרי) |
| AC-WP2-07 | GATE_5 AOS → 170 | prompt |
| AC-WP2-08 | GATE_5 TT → 70 | prompt |
| AC-WP2-09 | באנר תיקון | CERT_10 / prompt |
| AC-WP2-10 | verdict schema + אין route_recommendation ב-PASS | תבנית D-05 |
| AC-WP2-11-a | G3_PLAN → 2.2 | CERT_14 |
| AC-WP2-11-b | G3_6_MANDATES → 3.1 | CERT_13 |
| AC-WP2-12 | regression מלא | pytest agents_os_v2 |
| AC-WP2-13 | דשבורד AOS+TT | browser / ידני |
| AC-WP2-14 | engine editor R/W | JSON + UI |
| AC-WP2-15 | KB-26..39 CLOSED | KNOWN_BUGS_REGISTER |
| AC-WP2-16 | registry parity | WSM + registries |
| AC-WP2-17 | deprecation 04_GATE_MODEL | קובץ קנוני |
| AC-WP2-18 | procedures → GATE_SEQUENCE_CANON | קובץ קנוני |
| AC-WP2-19 | SMOKE_01 + MCP | §3.2 |
| AC-WP2-20 | SMOKE_02 | §3.3 |
| AC-WP2-21 | SSOT audit | דוח Team 170 + Team 190 |
| AC-WP2-22 | ARCHIVED headers | סריקת מסמכים |

---

## §5 — סקופ נוסף מ-Work Plan / Arch Review (לא לדלג)

| ID | בדיקה | קבצים / הערות |
|----|--------|----------------|
| WP2-MON-01 | **pipeline-monitor-core.js** — מפת phase→owner **לא** hardcoded; מקור = export מ-`_DOMAIN_PHASE_ROUTING` או `phase_routing.json` | השוואת JSON ל-pipeline.py |
| WP2-MIG-01 | **אין `save()` בתוך `@model_validator`**; שמירה רק ב-`load()` כשהייתה מיגרציה | קריאת `state.py` |
| WP2-DASH-01 | לוח מנדטים: `GATE_3` + `phase===3.1` (לא מפתחות legacy G3_6_MANDATES) | `pipeline-dashboard.js` |
| WP2-FLAG-01 | `waiting_human_approval` מבוסס `gate_state===HUMAN_PENDING` | `pipeline.py` STATE_VIEW + UI |
| WP2-PATH-01 | `CanonicalPathBuilder` + שימוש ב-`_read_coordination_file` | `path_builder.py`, `pipeline.py` |

---

## §6 — ידוע כפוף / פערים (Team 11 — נקודות שמירה)

1. **יישום**: בקשה זו מנוסחת כ-**הגדרת סקופ QA**; ביצוע מלא דורש סיום מימוש Team 61 — אם רכיב חסר, Team 51 מסמנת **BLOCKED** עם בעלים **Team 61** ולא מדלגת בשקט.  
2. **CERT_15** — חייב לעמוד ב-**§17.5** (לולאת 5 שערים); אם בקוד קיים רק תת-סט — דו"ח **FAIL** עד השלמה.  
3. **MCP E2E** — חובת צירוף לדוח: רשימת צעדי MCP (למשל `browser_navigate`, `browser_snapshot`, או קריאת משאב קובץ) + תוצאה תמציתית לכל SMOKE.  
4. **GATE_4**: Team 90 עשוי לחזק את Tier-2; דוח Team 51 צריך להיות **מוכן להעברה** ל-Team 90 ללא עריכה מבנית.

---

## §7 — פלט נדרש מ-Team 51

**קובץ דוח קנוני:**

```
_COMMUNICATION/team_51/TEAM_51_S003_P011_WP002_QA_REPORT_v1.0.0.md
```

**חובה בדוח:**
- טבלת **CERT_01..15** עם תוצאה + path לטסט + לוג.  
- טבלת **SMOKE_01..03** עם צעדי MCP/E2E וראיות.  
- טבלת **AC-WP2-01..22**.  
- סעיף **ממצאים** (אם יש) עם `evidence-by-path` ו-`route_recommendation` לבעלים.  
- **`verdict`**: `QA_PASS` | `QA_FAIL` | `QA_BLOCKED`.  
- **תאריך אמיתי** בכותרת (ברזל פרויקט).  
- `log_entry` בסוף.

---

## §8 — הפניות קנוניות (קריאה חובה ל-Team 51)

1. `_COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.1.md` — §2.9, §3 KB, §6 Iron Rules, §7 AC-WP2  
2. `_COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.1.md` — **§17.5** (CERT), §7 fail/pass  
3. `_COMMUNICATION/team_11/TEAM_11_S003_P011_WP002_GATE_2_WORKPLAN_v1.0.0.md` — §6–§7  
4. `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` — §2.5 port  
5. `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_DECISIONS_WP2_02_03_04_v1.0.0.md` — גבולות סקופ  

---

**log_entry | TEAM_11 | S003_P011_WP002 | FULL_QA_REQUEST_TO_TEAM_51 | v1.0.0 | SUBMITTED | 2026-03-20**
