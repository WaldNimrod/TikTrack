---
id: TEAM_100_TO_TEAM_170_S003_P011_WP002_GATE_5_TEAM_61_MANDATE_AND_CLOSURE_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 170 (AOS Spec Owner — Phase 5.1 execution authority)
cc: Team 11, Team 51, Team 61, Team 90, Team 00
date: 2026-03-21
gate: GATE_5
phase: "5.1"
wp: S003-P011-WP002
type: ACTIVATION_MANDATE
status: ACTIVE
supersedes: TEAM_100_TO_TEAM_170_S003_P011_WP002_GATE_5_PHASE_5.1_ACTIVATION_v1.0.0
authority: TEAM_100_S003_P011_WP002_GATE_5_PHASE_5.1_ACCEPTANCE_v1.0.0---

# S003-P011-WP002 — GATE_5 Phase 5.1 | הוראות ביצוע לצוות 170
## הפקת מנדט לצוות 61 + סגירה ומשוב סופי לצוות 100

---

## ⚙️ מה נדרש ממך (צוות 170) — שני שלבים

```
שלב 1:  הפק מנדט קנוני מפורט לצוות 61 → שמור בתיקיית team_61
שלב 2:  לאחר שצוות 61 מסיים + אישור Team 51:
          → הרץ SMOKE_01 + SMOKE_02
          → עדכן KB-32/34/38 ל-CLOSED בregister
          → הפק משוב סופי לצוות 100 → שמור ב-team_170
```

---

## שלב 1 — הפק מנדט לצוות 61

### 1.1 נתיב שמירה

```
_COMMUNICATION/team_61/TEAM_170_TO_TEAM_61_S003_P011_WP002_GATE_5_KB_FIXES_MANDATE_v1.0.0.md
```

### 1.2 כותרת YAML חובה בפתיחת המסמך

```yaml
---
id: TEAM_170_TO_TEAM_61_S003_P011_WP002_GATE_5_KB_FIXES_MANDATE_v1.0.0
from: Team 170 (AOS Spec Owner — GATE_5 Phase 5.1 authority)
to: Team 61 (AOS Implementation)
cc: Team 11, Team 51, Team 100, Team 00
date: [תאריך אמיתי]
gate: GATE_5
phase: "5.1"
wp: S003-P011-WP002
type: IMPLEMENTATION_MANDATE
status: ACTIVE
authority: TEAM_100_TO_TEAM_170_S003_P011_WP002_GATE_5_TEAM_61_MANDATE_AND_CLOSURE_v1.0.0
---
```

### 1.3 ארבעה תיקונים נדרשים — פרט כל אחד במלואו

---

#### תיקון 1 — KB-32: FAIL_ROUTING — כתיבה מחדש מלאה

**קובץ:** `agents_os_v2/orchestrator/pipeline.py` — dict `FAIL_ROUTING`

**בעיה:** מפתחות הניתוב (routing targets) משתמשים ב-gate IDs ישנים כמו `"CURSOR_IMPLEMENTATION"`, `"G3_PLAN"`, `"GATE_8"`. אחרי מיגרציה ל-5-gate model, כל המפתחות חייבים להיות `"GATE_1"` .. `"GATE_5"` בלבד.

**דרישה מדויקת:** כתוב מחדש את dict `FAIL_ROUTING` כך שכל מפתח (key) יהיה אחד מ: `"GATE_1"`, `"GATE_2"`, `"GATE_3"`, `"GATE_4"`, `"GATE_5"`. אין מפתחות ישנים. הערכים (routing targets / חזרה לצוות) חייבים לשקף את מבנה ה-TRACK_FOCUSED ו-TRACK_FULL לפי `_DOMAIN_PHASE_ROUTING`.

**אימות:** Team 51 מריץ — CERT_11 חייב לעבור (fail כותב findings; FAIL_ROUTING מפנה לנתיב תקין). הוסף בדיקה: לאחר `fail` מ-`GATE_4`, routing target הוא `GATE_3` (חזרה לשלב implementation) ולא ID ישן.

---

#### תיקון 2 — KB-33: CERT Extension — בדיקת קובץ TikTrack אמיתי

**⚠️ לא נדרש תיקון קוד.** הקוד תקין — migration מופעל דרך Pydantic `model_validate` + `_run_migration` validator ב-`state.py`.

**מה נדרש:** הוסף בדיקה חדשה ל-`agents_os_v2/tests/test_certification.py`:

```
שם הבדיקה: test_cert_16_tiktrack_real_state_migration (או שם שקיל)
מה היא בודקת:
  1. קרא את קובץ `_COMMUNICATION/tiktrack/pipeline_state_tiktrack.json` הקיים
  2. אם current_gate הוא G3_6_MANDATES או G3_PLAN (ערך ישן):
       קרא: PipelineState.load("tiktrack")
       ודא: current_gate → "GATE_3" (או GATE_2 בהתאם) + migration event נרשם
  3. אם current_gate כבר קנוני (GATE_N): ודא שלא נוצר migration event מיותר
```

**אימות:** pytest מריץ את הבדיקה החדשה ועוברת; CERT_13 + CERT_14 ממשיכים לעבור.

---

#### תיקון 3 — KB-34: GATE_5 Prompt — תוכן Documentation Closure

**קובץ:** `agents_os_v2/orchestrator/pipeline.py` — פונקציה `_generate_gate5_prompt()` (או `generate_gate5_prompt()`)

**בעיה:** הפונקציה מחזירה prompt עם כותרת "Dev Validation / Team 90" — תוכן מ-gate sequence ישן. GATE_5 במודל הנוכחי = סגירת תיעוד (Documentation Closure).

**דרישה מדויקת לפי domain:**

```
domain = "agents_os"  →  צוות: team_170 (AOS Spec Owner)
                          כותרת: "GATE_5 — Documentation Closure | AOS Spec Review"
                          תוכן: סגירת KB register, SSOT audit, ARCHIVED headers, identity files

domain = "tiktrack"   →  צוות: team_70 (TikTrack Spec Owner)
                          כותרת: "GATE_5 — Documentation Closure | TikTrack Spec Review"
                          תוכן: אותם סעיפים, domain = tiktrack
```

**בדיקה:** CERT_08 (AOS GATE_5 → team_170) ו-CERT_09 (TikTrack GATE_5 → team_70) חייבים לעבור עם התוכן החדש. תוסיף assertion: `"Documentation Closure"` מופיע בפלט ו-`"Dev Validation"` לא מופיע.

---

#### תיקון 4 — KB-38: DRY_RUN Test Suite — 15 תרחישים

**קובץ חדש:** `agents_os_v2/tests/test_dry_run.py`

**דרישה:** צור 15 בדיקות שמכסות את המטריצה: domain × variant × gate. לפחות:

| ID | domain | variant | gate | שם פונקציה | assertion |
|----|--------|---------|------|------------|-----------|
| DRY_01 | agents_os | TRACK_FOCUSED | GATE_1 | `test_dry_run_01_aos_focused_gate1` | prompt מכוון ל-team_101 |
| DRY_02 | agents_os | TRACK_FOCUSED | GATE_2/2.2 | `test_dry_run_02_aos_focused_gate2_workplan` | prompt = team_11 |
| DRY_03 | agents_os | TRACK_FOCUSED | GATE_3/3.1 | `test_dry_run_03_aos_focused_gate3_mandate` | prompt = team_11 |
| DRY_04 | agents_os | TRACK_FOCUSED | GATE_3/3.2 | `test_dry_run_04_aos_focused_gate3_impl` | prompt = team_61 |
| DRY_05 | agents_os | TRACK_FOCUSED | GATE_4/4.1 | `test_dry_run_05_aos_focused_gate4_qa` | prompt = team_51 |
| DRY_06 | agents_os | TRACK_FOCUSED | GATE_4/4.2 | `test_dry_run_06_aos_focused_gate4_spec` | prompt = team_101 |
| DRY_07 | agents_os | TRACK_FOCUSED | GATE_5/5.1 | `test_dry_run_07_aos_focused_gate5_doc` | prompt = team_170 |
| DRY_08 | tiktrack | TRACK_FULL | GATE_2/2.2 | `test_dry_run_08_tt_full_gate2_workplan` | prompt = team_10 |
| DRY_09 | tiktrack | TRACK_FULL | GATE_3/3.2 | `test_dry_run_09_tt_full_gate3_impl` | includes team_20 OR team_30 OR team_40 |
| DRY_10 | tiktrack | TRACK_FULL | GATE_4/4.1 | `test_dry_run_10_tt_full_gate4_qa` | prompt = team_50 |
| DRY_11 | tiktrack | TRACK_FULL | GATE_5/5.1 | `test_dry_run_11_tt_full_gate5_doc` | prompt = team_70 |
| DRY_12 | agents_os | TRACK_FOCUSED | fail→GATE_4 | `test_dry_run_12_fail_routing_gate4` | FAIL_ROUTING target ≠ old ID |
| DRY_13 | agents_os | TRACK_FOCUSED | GATE_4/4.2 + lod200_author=team_100 | `test_dry_run_13_gate4_phase42_team100` | prompt = team_100 |
| DRY_14 | agents_os | TRACK_FOCUSED | correction cycle | `test_dry_run_14_correction_cycle_banner` | CORRECTION_CYCLE_BANNER in output |
| DRY_15 | mixed | both | migration old→new | `test_dry_run_15_migration_both_domains` | old IDs → canonical GATE_N |

**אימות:** `python3 -m pytest agents_os_v2/tests/test_dry_run.py -v` — כל 15 בדיקות PASS.

---

### 1.4 תיקי אמות — מה Team 61 חייב לצרף לדוח שלו

כותב הדוח שלו בנתיב:
```
_COMMUNICATION/team_61/TEAM_61_S003_P011_WP002_GATE_5_KB_FIXES_v1.0.0.md
```

הדוח חייב להכיל:
1. **טבלת שינויי קוד** — לכל תיקון: קובץ, שורות שהשתנו, תיאור תמציתי
2. **פלט pytest מלא:**
   ```
   python3 -m pytest agents_os_v2/tests/test_certification.py -v
   python3 -m pytest agents_os_v2/tests/test_dry_run.py -v
   python3 -m pytest agents_os_v2/ -q --tb=short
   ```
   צרף stdout מלא — אין להחליף בסיכום בלבד
3. **הצהרה מפורשת לכל KB:** "KB-32: FIXED", "KB-33: CERT_EXTENDED", "KB-34: FIXED", "KB-38: DELIVERED"
4. **log_entry** בסוף

---

## שלב 2 — לאחר קבלת דוח Team 61 ואישור Team 51

בצע את הצעדים הבאים בסדר:

### 2.1 ודא אישור Team 51 לפני כל פעולה

המתן לקבלת artifact מ-Team 51 המאשר:
- CERT_01..15 + CERT_16 (חדש) — כל PASS
- DRY_RUN_01..15 — כל PASS
- regression `agents_os_v2/` — כל PASS

**לא תמשיך לשלב 2.2 בלי artifact זה.**

### 2.2 הרץ SMOKE_02 (TikTrack — כבר פתוח)

```bash
./pipeline_run.sh --domain tiktrack status
```

ודא:
- auto-migration מופעל (הודעה בפלט)
- `current_gate` = `GATE_3`, `current_phase` = `3.1`
- `process_variant` מוגדר נכון

צלם קובץ state:
```
_COMMUNICATION/tiktrack/pipeline_state_tiktrack.json
```
שמור את הפלט כ-artifact בדוח הסגירה.

### 2.3 הרץ SMOKE_01 (AOS — נפתח אחרי KB-34 תוקן)

```bash
./pipeline_run.sh --domain agents_os
```

ברמת GATE_5 Phase 5.1. ודא:
- prompt מציג כותרת "Documentation Closure" (לא "Dev Validation")
- routing → team_170
- state file מציג `current_gate: GATE_5, current_phase: 5.1`

שמור output כ-artifact.

### 2.4 עדכן KNOWN_BUGS_REGISTER

עדכן שורות KB-32, KB-34, KB-38 מ-`OPEN` ל-`CLOSED`:

```
_COMMUNICATION/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md
```

לכל שורה: הוסף בעמודת notes — "CLOSED [תאריך] — [תיאור תמציתי] | evidence: [שם CERT/DRY_RUN]"

הוסף log_entry:
```
**log_entry | TEAM_170 | KNOWN_BUGS_REGISTER | KB_32_34_38_CLOSED | GATE5_KB_FIX_BATCH | [תאריך]**
```

### 2.5 הפק משוב סופי לצוות 100

נתיב חובה:
```
_COMMUNICATION/team_170/TEAM_170_TO_TEAM_100_S003_P011_WP002_GATE_5_PHASE_5.1_FINAL_FEEDBACK_v1.0.0.md
```

המסמך חייב להכיל:

```yaml
---
id: TEAM_170_TO_TEAM_100_S003_P011_WP002_GATE_5_PHASE_5.1_FINAL_FEEDBACK_v1.0.0
from: Team 170
to: Team 100
cc: Team 90, Team 00
date: [תאריך אמיתי]
type: PHASE_CLOSURE_FEEDBACK
gate: GATE_5
phase: "5.1"
verdict: PHASE_5.1_COMPLETE | PHASE_5.1_BLOCKED
---
```

**סעיפים חובה:**

**§1 — טבלת Phase 5.1 Complete:**
| פריט | סטטוס |
|---|---|
| AC-WP2-16..22 | PASS (כולל SMOKE_01 / SMOKE_02) |
| KB-32/33/34/35/38 | CLOSED |
| DRY_RUN_01..15 | PASS |
| Identity files | CREATED |
| D-07/D-08 | COMPLETE |

**§2 — ממצאים פתוחים לPhase 5.2:**
רשום כל ממצא שנותר פתוח (KB-36/37/39 + כל דבר חדש שהתגלה) עם severity ו-recommendation.

**§3 — הצהרת מוכנות Phase 5.2:**
```
Phase 5.2 (Team 90) — מותר לפתוח: כן / לא
חסימות אם לא: [רשימה]
```

**§4 — log_entry:**
```
**log_entry | TEAM_170 | S003_P011_WP002 | GATE_5_PHASE_5.1_COMPLETE | ALL_PRECONDITIONS_MET | [תאריך]**
```

---

## ✅ סיכום — מה Team 170 מייצר

| # | תיקייה | קובץ | מתי |
|---|---|---|---|
| 1 | `_COMMUNICATION/team_61/` | `TEAM_170_TO_TEAM_61_S003_P011_WP002_GATE_5_KB_FIXES_MANDATE_v1.0.0.md` | **עכשיו — שלב 1** |
| 2 | `_COMMUNICATION/team_170/` | `TEAM_170_TO_TEAM_100_S003_P011_WP002_GATE_5_PHASE_5.1_FINAL_FEEDBACK_v1.0.0.md` | אחרי Team 61 + Team 51 + SMOKE |

---

**log_entry | TEAM_100 | S003_P011_WP002 | GATE_5_TEAM_61_MANDATE_AND_CLOSURE_ACTIVATION | TEAM_170_MANDATED | 2026-03-21**
