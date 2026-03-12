**date:** 2026-03-12

**historical_record:** true

---
**project_domain:** AGENTS_OS
**id:** TEAM_51_TO_TEAM_170_S003_P002_WP001_FAST4_HANDOFF_PROMPT_v1.0.0
**from:** Team 51 (Agents_OS QA Agent) — בהנחיית Nimrod
**to:** Team 170 (AGENTS_OS Documentation Closure — FAST_4 owner)
**cc:** Team 00, Team 100, Team 61
**status:** HANDOFF — EXECUTE FAST_4
**work_package_id:** S003-P002-WP001
**handoff_type:** FAST_2+FAST_2.5+FAST_3 → FAST_4 (מסלול מהיר)
---

# Handoff Prompt: S003-P002 WP001 — FAST_4 Execution

**Team 170, הנה הפרומט המפורט לביצוע FAST_4. Nimrod אישר FAST_3 — מאושר להמשיך.**

---

## §1 מי מעביר ומי מקבל

| מ | אל | שלב שהושלם | שלב להפעלה |
|---|---|---|---|
| Team 51 | Team 170 | FAST_2 (Team 61) + FAST_2.5 (Team 51 QA PASS) + FAST_3 (Nimrod approved) | FAST_4 (knowledge closure) |

**מצב:** Nimrod אישר FAST_3. S003-P002 WP001 (Test Template Generator) מוכן לסגירה רשמית.

---

## §2 קונטקסט — S003-P002 Test Template Generator

**מה נבנה:**
- `agents_os_v2/generators/` — spec_parser, test_templates, templates (api_test.py.jinja, ui_test.py.jinja)
- `agents_os_v2/requirements.txt` — Jinja2>=3.1.0,<4.0
- `agents_os_v2/tests/test_template_generator.py` — 15 tests
- `agents_os_v2/tests/fixtures/sample_spec_with_contracts.md` — sample spec
- שילוב ב-`gate_router.py` — G3.7 (Test Template Generation) בין G3.5 ל-G3.6

**סטטוס שלבים:**
| שלב | סטטוס | תוצר |
|-----|-------|------|
| FAST_0 | ✅ | Scope brief v1.0.0 |
| FAST_1 | ✅ | Team 190 validation |
| FAST_2 | ✅ | Team 61 implementation |
| FAST_2.5 | ✅ | Team 51 QA PASS (כולל runtime checks) |
| FAST_3 | ✅ | Nimrod approved |
| FAST_4 | ⏳ | **Team 170 מבצע** |

---

## §3 מה Team 170 צריך לבצע (לפי FAST0 §11)

### פעולה 1: עדכון PHOENIX_PROGRAM_REGISTRY

**קובץ:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`

**שינוי:** בשורת S003-P002 — עדכן:
- `status`: PLANNED → **COMPLETE**
- `current_gate_mirror`: עדכן ל־`FAST_4 CLOSED (WP001) 2026-03-12 — Test Template Generator deployed; G3.7 added; agents_os_v2/requirements.txt canonical`

### פעולה 2: עדכון TEAM_10_GATE_ACTIONS_RUNBOOK

**קובץ:** `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md`

**שינוי:** הוסף/עדכן את רצף GATE_3 כך שיכלול את **G3.7 (Test Template Generation)**:
- **מיקום:** אחרי G3.5 (Work Package Validation) — **לפני** G3.6 (Team Activation Mandates)
- **תוכן:** G3.7 = "Test Template Generation" — הרצת `generate_test_templates` על spec; תוצרים ב-`tests/api/` ו-`tests/ui/`; TT-00 BLOCK כאשר section ריק
- **מקור:** `agents_os_v2/orchestrator/gate_router.py` — `run_g3_7_test_template_generation()`

**רצף מעודכן (AGENTS_OS):**
```
G3.1 → G3.2 → G3.3 → G3.4 → G3.5 → G3.7 (Test Template) → G3.6 → G3.8 → G3.9
```

### פעולה 3: הודעה ל-Team 10

לאחר העדכון — הודע ל-Team 10 שה-G3.7 נוסף ל-runbook שלהם. מסמך קצר ב-`_COMMUNICATION/team_170/` או הודעה ישירה.

### פעולה 4: רישום agents_os_v2/requirements.txt

ציין ש-`agents_os_v2/requirements.txt` הוא קובץ קנוני חדש ברשום AGENTS_OS (Jinja2 dependency).

### פעולה 5: עדכון WSM / agents_os_parallel_track

אם קיים שדה או הערה על track מקביל ב-AGENTS_OS — עדכן: S003-P002 CLOSED; הבא בתור: S003-P003 (System Settings) או תוכנית אחרת לפי roadmap.

---

### פעולה 6: כתיבת FAST_4 Closure

**קובץ חדש:** `_COMMUNICATION/team_170/TEAM_170_S003_P002_WP001_FAST4_CLOSURE_v1.0.0.md`

**תוכן (brief):**
- Identity header: project_domain=AGENTS_OS, from=Team 170, to=Team 00, Team 100, date=2026-03-12
- S003-P002 WP001 נסגר. Test Template Generator deployed. G3.7 in gate chain.
- Artifacts: FAST_2 Closeout (team_61), FAST_2.5 QA (team_51), FAST_3 (Nimrod handoff)
- **מה הבא:** S003-P003 (System Settings) — Team 100 מפעיל בהתאם ל-roadmap

---

## §4 מקורות

| מקור | path |
|------|------|
| FAST_2 Closeout | `_COMMUNICATION/team_61/TEAM_61_S003_P002_WP001_FAST2_EXECUTION_CLOSEOUT_v1.0.0.md` |
| FAST_2.5 QA | `_COMMUNICATION/team_51/TEAM_51_S003_P002_WP001_FAST25_QA_REPORT_v1.0.0.md` |
| Nimrod Handoff | `_COMMUNICATION/team_51/TEAM_51_TO_NIMROD_S003_P002_WP001_FAST3_HANDOFF_v1.0.0.md` |
| Scope brief | `_COMMUNICATION/team_100/TEAM_100_S003_P002_WP001_FAST0_SCOPE_BRIEF_v1.0.0.md` §11 |
| Fast Track Protocol | `documentation/docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md` §6.2, §9 |

---

## §5 מה אסור

- ❌ LLD400 promotion מיותרת — closure brief מספיק
- ❌ שינוי בקוד או ב-`agents_os_v2/` — רק עדכוני documentation ו-registry

---

## §6 לאחר FAST_4

**S003-P003 (System Settings)** — Team 100 מנפיק FAST_0 scope brief בהתאם ל-roadmap ול-slot availability.

---

**log_entry | TEAM_51 | S003_P002_WP001_FAST4_HANDOFF | ISSUED | 2026-03-12**
