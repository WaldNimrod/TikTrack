# Team 10 | S002-P001-WP002 — פרומטי הפעלה לשלב הבא (G3.6)

**project_domain:** AGENTS_OS  
**id:** TEAM_10_S002_P001_WP002_G3_6_ACTIVATION_PROMPTS_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 20, Team 70 (להעברה עם מנדט הפעלה)  
**date:** 2026-02-26  
**status:** READY_FOR_USE_AFTER_G3_5_PASS  
**gate_id:** GATE_3  
**work_package_id:** S002-P001-WP002  

---

## 1) מתי להפעיל

פרומטים אלה **מופעלים רק אחרי ש־Team 90 מחזיר G3.5 PASS** (ולידציית תוכנית העבודה — Phase 1 TIER E1). עם קבלת PASS — Team 10 מעביר את הפרומט הרלוונטי לכל צוות ומפרסם מנדט הפעלה.

---

## 2) קונטקסט חובה (לפני ההפעלה)

| מסמך | תפקיד |
|------|--------|
| _COMMUNICATION/team_10/TEAM_10_S002_P001_WP002_WORK_PACKAGE_DEFINITION.md | הגדרת WP002, scope, completion criteria |
| _COMMUNICATION/team_170/AGENTS_OS_CORE_VALIDATION_ENGINE_WP002_LLD400_v1.0.0.md | LLD400 — §2.5 ארטיפקטים, §6 routing, §7 קטלוג E-01..E-11 |
| _COMMUNICATION/team_100/S002_P001_WP002_EXECUTION_VALIDATOR_ARCHITECTURAL_CONCEPT_v1.0.0.md | קונספט ארכיטקטוני מלא |

---

## 3) סדר הפעלה (G3.6)

1. **Team 10** מפרסם הודעת הפעלה: G3.5 PASS התקבל; G3.6 פתוח.  
2. **Team 10** מעביר ל־**Team 20** את פרומט §4.0 (מימוש קוד + טסטים תחת agents_os/).  
3. **Team 10** מעביר ל־**Team 70** את פרומט §4.1 (תיעוד בלבד — per יישור גבול אחריות).  
4. Team 20 ו־Team 70 מבצעים; עם סיום — דו"חות סיום ל־Team 10.  
5. Team 10: אימות, GATE_3 exit, הגשה ל־Team 50 (GATE_4).

---

## 4) פרומטים להעתקה/העברה

### 4.0 Team 20 — פיתוח קוד (Execution Validation Engine — TIER E1 + TIER E2 + Runner)

```markdown
**id:** TEAM_10_TO_TEAM_20_S002_P001_WP002_G3_6_DEVELOPMENT_PROMPT
**from:** Team 10 (The Gateway)
**to:** Team 20 (Backend Implementation)
**work_package_id:** S002-P001-WP002
**gate_id:** GATE_3 (G3.6 — Implementation)
**phase_owner:** Team 10
**project_domain:** AGENTS_OS
**date:** 2026-02-26
**trigger:** G3.5 PASS received from Team 90; G3.6 activation.

---

אתה פועל כצוות 20 (Backend Implementation). Team 10 מפעיל אותך לכתיבת **קוד ממשי** עבור Work Package **S002-P001-WP002** — Execution Validation Engine (10→90 flow).

**חובה: התוצר שלך הוא קוד וקבצים על הדיסק — לא תיעוד בלבד.**

**קונטקסט חובה:**
- _COMMUNICATION/team_10/TEAM_10_S002_P001_WP002_WORK_PACKAGE_DEFINITION.md
- _COMMUNICATION/team_170/AGENTS_OS_CORE_VALIDATION_ENGINE_WP002_LLD400_v1.0.0.md (§2.5, §6, §7)
- _COMMUNICATION/team_100/S002_P001_WP002_EXECUTION_VALIDATOR_ARCHITECTURAL_CONCEPT_v1.0.0.md (§4–§7)

**משימות — לבצע בפועל (לכתוב קוד):**

1. **תיקיות ומודולים חדשים (per LLD400 §2.5):**
   - `agents_os/validators/execution/__init__.py`
   - `agents_os/validators/execution/tier_e1_work_plan.py` — מימוש E-01..E-06 (work plan integrity); יורש מ־validators/base; שימוש ב־wsm_state_reader ל־E-02, E-06.
   - `agents_os/validators/execution/tier_e2_code_quality.py` — מימוש E-07..E-11 (code quality); יורש מ־validators/base.

2. **הרחבת validation_runner (ללא שבירת WP001):**
   - `agents_os/orchestrator/validation_runner.py` — להוסיף `--mode=execution --phase=1` (הרצת TIER E1 בלבד) ו־`--mode=execution --phase=2` (E1 + E2 + LLM). הקיים `--mode=spec` (WP001) **לא לשנות** — regression חובה.

3. **הרחבת LLM gate (אופציונלי בשלב זה או מוגדר ב־LLD400):**
   - `agents_os/llm_gate/quality_judge.py` — extension points ל־Q-01..Q-05 (execution context) per architectural concept §5; אם LLD400 מגדיר שלב — לבצע בהתאם.

4. **בידוד דומיין:** כל קוד תחת `agents_os/`; אסור import או תלות ב־TikTrack או בקוד מחוץ ל־agents_os (מלבד stdlib ו־pip). E-07, E-11 מטפלים בזה; הקוד חייב לעמוד בהם.

5. **תיקיית טסטים (per LLD400 §2.5) — באחריות Team 20:** מימוש קוד תחת `agents_os/` (כולל טסטים) שייך ל־Team 20 per הגדרת תפקיד. ליצור:
   - `agents_os/tests/execution/__init__.py`
   - `agents_os/tests/execution/test_tier_e1.py` — טסטים ל־E-01..E-06.
   - `agents_os/tests/execution/test_tier_e2.py` — טסטים ל־E-07..E-11.
   דרישה: `python3 -m pytest agents_os/tests/ -q` exit 0 (E-09).

6. **תוצר סיום:** להודיע ל־Team 10 עם נתיבי הקבצים ו־הודעת סיום; לפרסם _COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P001_WP002_COMPLETION_REPORT.md (לפי evidence index של WP002).

**אל תדלג:** ליצור את כל הקבצים המפורטים ב־LLD400 §2.5 (validators/execution + tests/execution); להריץ pytest ולוודא שאין שבירת WP001 spec mode.
```

---

### 4.1 Team 70 — תיעוד בלבד (במסגרת תפקיד Knowledge Librarian)

**יישור גבול אחריות (per TEAM_70_TO_TEAM_10_S002_P001_WP002_G36_ROLE_BOUNDARY_CLARIFICATION):** מימוש קוד וטסטים תחת `agents_os/` שייך ל־**Team 20**. Team 70 — תיעוד קנוני תחת `documentation/`, GATE_8; לא כתיבת קוד ב־agents_os/.

```markdown
**id:** TEAM_10_TO_TEAM_70_S002_P001_WP002_G3_6_DOCUMENTATION_PROMPT
**from:** Team 10 (The Gateway)
**to:** Team 70 (Knowledge Librarian)
**work_package_id:** S002-P001-WP002
**gate_id:** GATE_3 (G3.6)
**phase_owner:** Team 10
**project_domain:** AGENTS_OS
**date:** 2026-02-26
**trigger:** G3.5 PASS; G3.6 activation. תפקיד Team 70 = תיעוד בלבד (per TEAM_70_KNOWLEDGE_LIBRARIAN_ROLE_DEFINITION).

---

אתה פועל כצוות 70 (Knowledge Librarian). Team 10 מפעיל אותך לתוצרי **תיעוד** עבור WP002 — לא קוד תחת agents_os/.

**משימות — במסגרת התפקיד (תיעוד):**
1. תוכנית טסטים (מסמך) תחת documentation/ — למשל `documentation/02-DEVELOPMENT/agents_os/WP002_EXECUTION_VALIDATOR_TEST_PLAN.md` — מתאר scope הטסטים (E-01..E-11), מבנה tests/execution/, ודרישת pytest; או עדכון/הוספת פריט רלוונטי במבנה התיעוד הקיים.
2. עם סיום — לפרסם _COMMUNICATION/team_70/TEAM_70_TO_TEAM_10_S002_P001_WP002_COMPLETION_REPORT.md (תוכן תיעודי/מבנה; evidence index של WP002).

**לא במסגרת:** כתיבת קבצי Python או pytest תחת agents_os/ — אלה באחריות Team 20.
```

---

## 5) תזכורת — Evidence Index (WP002)

לאחר סיום Team 20 ו־Team 70, חייבת להיות נוכחות של:
- _COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P001_WP002_COMPLETION_REPORT.md
- _COMMUNICATION/team_70/TEAM_70_TO_TEAM_10_S002_P001_WP002_COMPLETION_REPORT.md  

(נדרש ל־E-04/E-05 ב־GATE_5 Phase 2.)

---

## 6) GATE_4 — פרומט הפעלה ל־Team 50 (QA)

**מתי להפעיל:** לאחר GATE_3 exit (אימות תוצר Team 20, חבילת exit). Team 10 מגיש חבילת QA ל־Team 50.

```markdown
**id:** TEAM_10_TO_TEAM_50_S002_P001_WP002_GATE4_QA_PROMPT
**from:** Team 10 (The Gateway — GATE_3/GATE_4 owner)
**to:** Team 50 (QA & Fidelity)
**work_package_id:** S002-P001-WP002
**gate_id:** GATE_4
**phase_owner:** Team 10
**project_domain:** AGENTS_OS
**date:** 2026-02-26
**trigger:** GATE_3 implementation complete; Team 20 completion report received; GATE_4 QA required.

---

אתה פועל כצוות 50 (QA & Fidelity). Team 10 מגיש לך חבילת QA עבור **GATE_4** — Work Package **S002-P001-WP002** (Execution Validation Engine, 10→90 flow).

**קונטקסט חובה:**
- _COMMUNICATION/team_10/TEAM_10_S002_P001_WP002_WORK_PACKAGE_DEFINITION.md
- _COMMUNICATION/team_170/AGENTS_OS_CORE_VALIDATION_ENGINE_WP002_LLD400_v1.0.0.md (§2.5, §6, §7)
- _COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P001_WP002_COMPLETION_REPORT.md (תוצר GATE_3)

**משימות — GATE_4 QA:**
1. לאמת ארטיפקטים תחת agents_os/: validators/execution (tier_e1_work_plan.py, tier_e2_code_quality.py), tests/execution (test_tier_e1.py, test_tier_e2.py), הרחבת validation_runner (--mode=execution --phase=1|2), הרחבת quality_judge (Q-01..Q-05).
2. לאמת בידוד דומיין: אין import או תלות ב־TikTrack; כל הקוד תחת agents_os/.
3. לאמת regression: WP001 spec mode (validation_runner על LLD400) — 44/44; pytest agents_os/tests/ — exit 0.
4. לאמת Identity Headers בארטיפקטי שער (work_package_id S002-P001-WP002, gate_id GATE_3/GATE_4).
5. להפיק דוח QA (0 SEVERE ל-readiness ל־GATE_5). מיקום: _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P001_WP002_QA_REPORT.md.

**דרישה:** 0 SEVERE; readiness ל־GATE_5 (הגשת Team 10 ל־Team 90 Phase 2 validation).
```

---

## 7) GATE_5 — פרומט הפעלה ל־Team 90 (Phase 2 validation)

**מתי להפעיל:** לאחר GATE_4 PASS. Team 10 מגיש חבילת execution submission ל־Team 90 ל־ולידציית Phase 2 (TIER E1 + E2 + LLM gate).

```markdown
**id:** TEAM_10_TO_TEAM_90_S002_P001_WP002_GATE5_PHASE2_VALIDATION_REQUEST
**from:** Team 10 (The Gateway)
**to:** Team 90 (External Validation Unit — Channel 10↔90)
**work_package_id:** S002-P001-WP002
**gate_id:** GATE_5
**phase_owner:** Team 10 (submitter); GATE_5 owner Team 90
**project_domain:** AGENTS_OS
**date:** 2026-02-26
**trigger:** GATE_4 PASS (Team 50 QA 0 SEVERE); readiness ל־GATE_5.

---

אתה פועל כצוות 90 (External Validation Unit). Team 10 מגיש לך **בקשת ולידציית GATE_5 Phase 2** עבור **S002-P001-WP002** — Execution Validation Engine (תוצר ביצוע מלא).

**היקף:** Phase 2 — **TIER E1** (re-run עם בדיקת קיום פיזי של evidence) + **TIER E2** (E-07..E-11) + **LLM quality gate** (Q-01..Q-05). לא רק G3.5; חבילה עם קוד + דו"חות סיום.

**קונטקסט חובה:**
- _COMMUNICATION/team_10/TEAM_10_S002_P001_WP002_WORK_PACKAGE_DEFINITION.md
- _COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P001_WP002_COMPLETION_REPORT.md (evidence)
- _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P001_WP002_QA_REPORT.md (GATE_4 PASS)
- _COMMUNICATION/team_100/S002_P001_WP002_EXECUTION_VALIDATOR_ARCHITECTURAL_CONCEPT_v1.0.0.md (§4–§7)
- documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md (CURRENT_OPERATIONAL_STATE — E-02, E-06)

**משימות:**
1. להריץ ולידציה Phase 2: `validation_runner --mode=execution --phase=2` על חבילת ההגשה (או לבצע בדיקה ידנית מול E-01..E-11 + LLM gate).
2. לאמת evidence index: work package definition + לפחות דוח סיום Team 20 (נתיבים קיימים על הדיסק).
3. להחליט: **PASS** (exit 0) | **BLOCK** (exit 1) | **HOLD** (exit 2 — LLM שלילי, סקירה אנושית).
4. לפרסם תשובה קנונית: _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P001_WP002_GATE5_PHASE2_VALIDATION_RESPONSE.md (או BLOCKING_REPORT / HOLD לפי התוצאה).

**תוצר צפוי:** VALIDATION_RESPONSE עם overall_status PASS | BLOCK | HOLD; פירוט per check; log_entry.
```

---

## 8) GATE_5 BLOCK — פרומט תיקון ל־Team 20 (BF-G5-001 / E-09)

**מתי להפעיל:** לאחר TEAM_90_TO_TEAM_10_S002_P001_WP002_GATE5_PHASE2_BLOCKING_REPORT. E-09 (Test Suite Green) נכשל — `pytest agents_os/tests/ -q` חייב להחזיר exit 0 בסביבת הולידציה.

```markdown
**id:** TEAM_10_TO_TEAM_20_S002_P001_WP002_GATE5_REMEDIATION_E09_PROMPT
**from:** Team 10 (The Gateway)
**to:** Team 20 (Backend Implementation)
**work_package_id:** S002-P001-WP002
**gate_id:** GATE_5 (remediation)
**date:** 2026-02-26
**in_response_to:** _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P001_WP002_GATE5_PHASE2_BLOCKING_REPORT.md

---

אתה פועל כצוות 20. Team 90 החזיר **BLOCK** על GATE_5 Phase 2 — **BF-G5-001: E-09 Test Suite Green failed.**

**דרישה:** `python3 -m pytest agents_os/tests/ -q` חייב להסתיים ב־**exit code 0** (גם בריצה רגילה וגם בתוך validation_runner --mode=execution --phase=2).

**משימות:**
1. לשחזר את הכשל: להריץ `python3 -m pytest agents_os/tests/ -q` בסביבתך; לאתר טסט נכשל או timeout.
2. לתקן עד שהפקודה מחזירה exit 0 באופן דטרמיניסטי (תיקון טסטים/קוד/תלויות לפי הצורך).
3. להריץ ולתעד:
   - `python3 -m pytest agents_os/tests/ -q` — פלט מלא (exit 0).
   - `python3 -m agents_os.orchestrator.validation_runner _COMMUNICATION/team_10/TEAM_10_S002_P001_WP002_WORK_PACKAGE_DEFINITION.md --mode=execution --phase=2 --package .` — פלט מלא (exit 0, passed=11).
4. לדווח ל־Team 10: נתיבי הקבצים ששונו + ציטוט/קישור ל־evidence (או קובץ עדכון בדוח הסיום). Team 10 יגיש מחדש ל־Team 90 ל־re-validation.
```

---

**log_entry | TEAM_10 | S002_P001_WP002_G3_6_ACTIVATION_PROMPTS | READY_FOR_USE_AFTER_G3_5_PASS | 2026-02-26**
**log_entry | TEAM_10 | S002_P001_WP002_G3_6_ACTIVATION_PROMPTS | ROLE_BOUNDARY_ALIGNMENT | 2026-02-26 — מימוש טסטים ב־agents_os/ הועבר ל־Team 20; Team 70 תיעוד בלבד (per TEAM_70_TO_TEAM_10_S002_P001_WP002_G36_ROLE_BOUNDARY_CLARIFICATION).**
**log_entry | TEAM_10 | S002_P001_WP002_GATE_4 | QA_ACTIVATION_PROMPT_ADDED | 2026-02-26**
**log_entry | TEAM_10 | S002_P001_WP002_GATE_5 | REMEDIATION_PROMPT_E09_ADDED | 2026-02-26**
