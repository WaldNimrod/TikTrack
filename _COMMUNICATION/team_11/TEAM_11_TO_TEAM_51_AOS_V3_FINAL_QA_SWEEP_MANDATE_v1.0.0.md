---
id: TEAM_11_TO_TEAM_51_AOS_V3_FINAL_QA_SWEEP_MANDATE_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 61 (DevOps / E2E stack), Team 31 (UI), Team 21 (API), Team 10 (Gateway)
date: 2026-03-29
type: MANDATE — בדיקות סופיות (סגירת זנבות לפני חבילה חדשה)
domain: agents_os
branch: aos-v3
authority:
  - TEAM_11_AOS_V3_UI_DIRECT_FIXES_CLOSURE_v1.0.0.md
  - AGENTS.md (מקטע AOS v3)
  - documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md---

# Team 11 → Team 51 | בדיקות סופיות — AOS v3 (סגירת זנבות)

## מטרה

**אימות מלא** של מצב ה-repo אחרי תיקוני UI/API/seed הישירים (ללא WP קאנוני), כדי ש־**אין זנבות פתוחות** לפני פתיחת חבילת עבודה חדשה בפיפליין. אחרי מסירה — Gateway מסמן את מסלול ה־QA כ**סגור** לעקיפה זו.

## היקף חובה

### 1) אוטומטי (חובה)

מהשורש של ה-repo:

```bash
bash scripts/check_aos_v3_build_governance.sh
pip install -r agents_os_v3/requirements.txt
PYTHONPATH=. python3 -m pytest agents_os_v3/tests/ -v --tb=short -k "not OpenAI and not Gemini"
```

- **ציפייה:** `check_aos_v3_build_governance.sh` — **PASS**; pytest — **0 כשלונות** (כולל `agents_os_v3/tests/e2e/` אם נכלל בפקודה ללא skip — ראו סעיף 2).

### 2) E2E דפדפן (חובה כאשר הסביבה זמינה)

- הכנת סטאק לפי `agents_os_v3/tests/e2e/README.md` / `scripts/run_aos_v3_e2e_stack.sh` (או מסלול שקובע Team 61).
- הרצה:

```bash
export AOS_V3_E2E_RUN=1
pytest agents_os_v3/tests/e2e/ -v --tb=short
```

- **כיסוי מינימלי מוצרי:** טעינת כל דפי v3 הראשיים (`index`, `flow`, `history`, `config`, `teams`, `portfolio`), מעבר טאבים ב־Configuration וב־Portfolio, ואימות **ממשק דומיין** לפי סוג עמוד (Type A — כפתורים ב־Pipeline/Flow בלבד; Type B — בורר scope בעמודים הרלוונטיים) אם ממומש ב־HTML הנוכחי.
- אם **אין** סביבת דפדפן זמינה: פרסמו בדוח **BLOCKED** עם סיבה טכנית + תאריך יעד להשלמה; Gateway ישאיר את סעיף E2E כפתוח עד מסירה.

### 3) רגרסיה ידנית ממוקדת (מומלץ חזק)

- זרימת **login/health** (אם רלוונטי לסטאק), **Teams** — עץ ארגוני מלא אחרי seed, **Portfolio** — סינון דומיין + מיון כותרות, **History** — Run overview בסיידבר.

## מסירה חזרה ל־Team 11

קובץ אחד תחת `_COMMUNICATION/team_51/`:

`TEAM_51_TO_TEAM_11_AOS_V3_FINAL_QA_SWEEP_EVIDENCE_v1.0.0.md`

חובה לכלול:

| שדה | תוכן |
|-----|------|
| **תאריך** | 2026-03-29 או מאוחר יותר (תאריך אמת) |
| **commit hash** | hash מלא של בדיקה |
| **FILE_INDEX** | גרסת `agents_os_v3/FILE_INDEX.json` שנבדקה |
| **פקודות** | העתק מדויק של הפקודות וה-exit codes |
| **Verdict** | **PASS** / **PASS_WITH_NOTES** / **FAIL** |
| **E2E** | **PASS** / **BLOCKED** (עם נימוק) |

## קריטריוני קבלה (Gateway)

- אין כשלון pytest קריטי במסלול שמוגדר למעלה.
- אם E2E רץ — אין כשלון בלתי מוסבר; אם BLOCKED — יש תכנון השלמה מאושר או המשך מ־Team 61.
- דוח המסירה מקושר ממסמך סגירה זה.

## איסורים

- **אין** שינוי קנוני תחת `documentation/docs-governance/` או `documentation/docs-agents-os/` במסגרת מנדט זה — זה בידי **Team 170** (מנדט נפרד).
- **אין** הרחבת היקף מעבר לבדיקות; תיקוני באג — מסמנים בדוח ומנתבים חזרה ל־**Team 31/21** לפי דומיין.

---

**log_entry | TEAM_11 | AOS_V3 | T51_FINAL_QA_SWEEP_MANDATE | ISSUED | 2026-03-29**
