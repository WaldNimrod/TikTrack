---
id: TEAM_170_TO_TEAM_61_S003_P011_WP002_GATE_5_KB_FIXES_MANDATE_v1.0.0
historical_record: true
from: Team 170 (AOS Spec Owner — GATE_5 Phase 5.1 authority)
to: Team 61 (AOS Implementation)
cc: Team 11, Team 51, Team 100, Team 00
date: 2026-03-21
gate: GATE_5
phase: "5.1"
wp: S003-P011-WP002
type: IMPLEMENTATION_MANDATE
status: ACTIVE
authority: TEAM_100_TO_TEAM_170_S003_P011_WP002_GATE_5_TEAM_61_MANDATE_AND_CLOSURE_v1.0.0---

# S003-P011-WP002 — GATE_5 Phase 5.1 | מנדט תיקוני KB לצוות 61

צוות 61: יש לבצע את ארבעת התיקונים הבאים ולהפיק דוח לפי §1.4.

---

## תיקון 1 — KB-32: FAIL_ROUTING — כתיבה מחדש מלאה

**קובץ:** `agents_os_v2/orchestrator/pipeline.py` — dict `FAIL_ROUTING`

**בעיה:** מפתחות הניתוב (routing targets) משתמשים ב-gate IDs ישנים כמו `"CURSOR_IMPLEMENTATION"`, `"G3_PLAN"`, `"GATE_8"`. אחרי מיגרציה ל-5-gate model, כל המפתחות חייבים להיות `"GATE_1"` .. `"GATE_5"` בלבד.

**דרישה מדויקת:** כתוב מחדש את dict `FAIL_ROUTING` כך שכל מפתח (key) יהיה אחד מ: `"GATE_1"`, `"GATE_2"`, `"GATE_3"`, `"GATE_4"`, `"GATE_5"`. אין מפתחות ישנים. הערכים (routing targets / חזרה לצוות) חייבים לשקף את מבנה ה-TRACK_FOCUSED ו-TRACK_FULL לפי `_DOMAIN_PHASE_ROUTING`.

**אימות:** Team 51 מריץ — CERT_11 חייב לעבור (fail כותב findings; FAIL_ROUTING מפנה לנתיב תקין). הוסף בדיקה: לאחר `fail` מ-`GATE_4`, routing target הוא `GATE_3` (חזרה לשלב implementation) ולא ID ישן.

---

## תיקון 2 — KB-33: CERT Extension — בדיקת קובץ TikTrack אמיתי

**⚠️ לא נדרש תיקון קוד.** הקוד תקין — migration מופעל דרך Pydantic `model_validate` + `_run_migration` validator ב-`state.py`.

**מה נדרש:** הוסף בדיקה חדשה ל-`agents_os_v2/tests/test_certification.py`:

```
שם הבדיקה: test_cert_16_tiktrack_real_state_migration (או שם שקיל)
מה היא בודקת:
  1. קרא את קובץ `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` הקיים
     (או הנתיב הקנוני לפי pipeline config — tiktrack domain)
  2. אם current_gate הוא G3_6_MANDATES או G3_PLAN (ערך ישן):
       קרא: PipelineState.load("tiktrack")
       ודא: current_gate → "GATE_3" (או GATE_2 בהתאם) + migration event נרשם
  3. אם current_gate כבר קנוני (GATE_N): ודא שלא נוצר migration event מיותר
```

**אימות:** pytest מריץ את הבדיקה החדשה ועוברת; CERT_13 + CERT_14 ממשיכים לעבור.

---

## תיקון 3 — KB-34: GATE_5 Prompt — תוכן Documentation Closure

**קובץ:** `agents_os_v2/orchestrator/pipeline.py` — פונקציה `_generate_gate_5_prompt()` (או `generate_gate5_prompt()`)

**בעיה:** הפונקציה מחזירה prompt עם כותרת "Dev Validation / Team 90" — תוכן מ-gate sequence ישן. GATE_5 במודל הנוכחי = סגירת תיעוד (Documentation Closure).

**דרישה מדויקת לפי domain:**

| domain | צוות | כותרת | תוכן |
|--------|------|-------|------|
| `agents_os` | team_170 (AOS Spec Owner) | "GATE_5 — Documentation Closure \| AOS Spec Review" | סגירת KB register, SSOT audit, ARCHIVED headers, identity files |
| `tiktrack` | team_70 (TikTrack Spec Owner) | "GATE_5 — Documentation Closure \| TikTrack Spec Review" | אותם סעיפים, domain = tiktrack |

**בדיקה:** CERT_08 (AOS GATE_5 → team_170) ו-CERT_09 (TikTrack GATE_5 → team_70) חייבים לעבור עם התוכן החדש. תוסיף assertion: `"Documentation Closure"` מופיע בפלט ו-`"Dev Validation"` לא מופיע.

---

## תיקון 4 — KB-38: DRY_RUN Test Suite — 15 תרחישים

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

## §1.4 תיקי אמות — מה Team 61 חייב לצרף לדוח שלו

כותב הדוח בנתיב:
```
_COMMUNICATION/team_61/TEAM_61_S003_P011_WP002_GATE_5_KB_FIXES_v1.0.0.md
```

הדוח חייב להכיל:
1. **טבלת שינויי קוד** — לכל תיקון: קובץ, שורות שהשתנו, תיאור תמציתי
2. **פלט pytest מלא:**
   ```bash
   python3 -m pytest agents_os_v2/tests/test_certification.py -v
   python3 -m pytest agents_os_v2/tests/test_dry_run.py -v
   python3 -m pytest agents_os_v2/ -q --tb=short
   ```
   צרף stdout מלא — אין להחליף בסיכום בלבד
3. **הצהרה מפורשת לכל KB:** "KB-32: FIXED", "KB-33: CERT_EXTENDED", "KB-34: FIXED", "KB-38: DELIVERED"
4. **log_entry** בסוף

---

## סדר ביצוע

1. Team 61 מבצע את ארבעת התיקונים
2. Team 61 מריץ pytest — ודא כל הבדיקות PASS
3. Team 61 מפיק דוח `TEAM_61_S003_P011_WP002_GATE_5_KB_FIXES_v1.0.0.md`
4. Team 51 מאמת — CERT + DRY_RUN + regression
5. Team 170 ממשיך לשלב 2 (SMOKE, KNOWN_BUGS_REGISTER, משוב סופי)

---

**log_entry | TEAM_170 | S003_P011_WP002 | GATE_5_KB_MANDATE | ISSUED_TO_TEAM_61 | 2026-03-21**
