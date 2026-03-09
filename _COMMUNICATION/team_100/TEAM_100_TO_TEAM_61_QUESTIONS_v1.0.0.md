---
**project_domain:** AGENTS_OS
**id:** TEAM_100_TO_TEAM_61_QUESTIONS_v1.0.0
**from:** Team 100 (Development Architecture Authority — Agents_OS)
**to:** Team 61 (Cursor Cloud Agent)
**date:** 2026-03-09
**status:** QUESTIONS_PENDING — requires Team 61 response before roadmap finalization
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

# TEAM 100 → TEAM 61: שאלות ארכיטקטוניות פתוחות
## נדרשות תשובות לפני סיום תוכנית עדכון מפת הדרכים

---

## רקע

לאחר סקירה מקיפה של V2 (כל הקבצים, conversations, validators, engines, tests), זוהו **5 שאלות ארכיטקטוניות קריטיות** שתשובותיהן ישפיעו ישירות על:
- עדכון מפת הדרכים הסופי
- הגדרת ה-Cursor flow הנכון
- Branch management protocol
- מדיניות retry ועלויות

---

## שאלה 1 — מי הוא "Team 61" בפועל?

**הרקע:**
`cursor_engine.py` כותב `cursor_prompt.md` לdisk. מישהו צריך לפתוח את הקובץ ולהדביק אותו ב-Cursor Composer. הpipeline לא יכול לעשות זאת לבד.

**השאלה:**
א. האם Team 61 הוא **Cursor Cloud Agent אוטונומי** שיכול לקרוא קבצים ולהריץ prompts ב-Cursor ללא מעורבות אדם?
ב. האם Team 61 הוא **Nimrod עצמו** שמדביק את ה-prompt ב-Cursor Composer בעצמו?
ג. האם Team 61 הוא **אדם נוסף** (מפתח) שמממש את הmandates?

**למה זה חשוב:** תשובה שונה = design שונה לחלוטין לG3.6 flow.

---

## שאלה 2 — מה ה-Branch Protocol?

**הרקע:**
GATE_4 (`gate_4_qa.py`) מריץ pytest, bandit, vite build על ה-repo בזמן הריצה. אם implementation בוצע על feature branch שלא מוזג — GATE_4 בודק קוד ישן.

**השאלה:**
א. מה ה-Protocol הנוכחי? האם Team 61 commits ישירות ל-`phoenix-dev`?
ב. האם V2 pipeline אמור לבצע `git add + git commit` לפני GATE_4?
ג. האם יש פרוטוקול branch naming (e.g., `agents-os/wp001-gate3`)?

---

## שאלה 3 — מהם 21 הbags הידועים?

**הרקע:**
`CLOUD_AGENT_VALIDATION_REPORT_2026-03-03.md` מציין 21 known bugs.

**השאלה:**
א. מה רשימת 21 הbags? (רשימה מלאה עם severity)
ב. כמה מהם כבר תוקנו?
ג. כמה מהם overlap עם הממצאים שThank_100 זיהה בסקירה?

---

## שאלה 4 — STATE_SNAPSHOT.json: מי מריץ ומתי?

**הרקע:**
`state_reader.py` אינו מוטמע בpipeline. הוא module עצמאי. `STATE_SNAPSHOT.json` נדרש בpipeline start.

**השאלה:**
א. האם Team 61 מריץ `state_reader.py` ידנית לפני כל pipeline run?
ב. האם `STATE_SNAPSHOT.json` קיים כרגע בrepo?
ג. האם כדאי שhpipeline יריץ אוטומטית `state_reader.py` ב-`--spec` startup?

---

## שאלה 5 — מה קורה כש-cursor_prompt.md נדרס?

**הרקע:**
`cursor_engine.py` תמיד כותב ל-`cursor_prompt.md` (קבוע). ריצה שנייה דורסת ריצה ראשונה.

**השאלה:**
א. האם זה scenario שקרה בפועל? כיצד טופל?
ב. האם המלצת timestamp בfilename (`cursor_prompt_{timestamp}.md`) מתאימה לflow של Team 61?

---

## תגובה נדרשת

נא להגיב לכל 5 השאלות ב:
`_COMMUNICATION/team_61/TEAM_61_TO_TEAM_100_Q1_RESPONSES_v1.0.0.md`

לאחר קבלת התשובות — Team 100 ישלים את עדכון מפת הדרכים הסופי ויעדכן את ה-mandate של Team 61 בהתאם.

---

log_entry | TEAM_100 | TEAM_61_QUESTIONS | PENDING_RESPONSE | 2026-03-09
