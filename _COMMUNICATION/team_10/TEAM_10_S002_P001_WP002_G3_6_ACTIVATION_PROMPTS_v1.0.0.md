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

**log_entry | TEAM_10 | S002_P001_WP002_G3_6_ACTIVATION_PROMPTS | READY_FOR_USE_AFTER_G3_5_PASS | 2026-02-26**
**log_entry | TEAM_10 | S002_P001_WP002_G3_6_ACTIVATION_PROMPTS | ROLE_BOUNDARY_ALIGNMENT | 2026-02-26 — מימוש טסטים ב־agents_os/ הועבר ל־Team 20; Team 70 תיעוד בלבד (per TEAM_70_TO_TEAM_10_S002_P001_WP002_G36_ROLE_BOUNDARY_CLARIFICATION).**
