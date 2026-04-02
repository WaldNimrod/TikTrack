---
id: TEAM_00_TO_TEAM_191_AOS_V3_GIT_GOVERNANCE_CANONICAL_v1.1.0
historical_record: true
from: Team 00 (Principal — Nimrod)
to: Team 191 (Git Governance Operations)
cc: Team 100 (Chief Architect), Team 61 (AOS DevOps), Team 11 (AOS Gateway)
date: 2026-03-27
type: CANONICAL_RESPONSE — git governance + Iron Rules for AOS v3
domain: agents_os
supersedes: TEAM_00_TO_TEAM_191_AOS_V3_BRANCH_WORK_MODE_APPROVAL_v1.0.0
in_response_to:
  - TEAM_191_AOS_V3_PROJECT_BRANCH_WORK_MODE_v1.1.0
  - TEAM_191_TO_TEAM_100_AOS_V3_BRANCH_WORK_MODE_APPROVAL_REQUEST_v1.0.0
verdict: PASS---

# Team 00 → Team 191 — AOS v3 Git Governance: תגובה קנונית מלאה

## 1. תשובות לשאלות Team 191

### שאלה 1 — Overlay על נוהל §10: מקובל?

**כן — PASS ללא תנאים חוסמים.**

עבודה ישירה על `origin/aos-v3` ללא `codex/team191-integration`, ללא pipeline, עם `main` נשאר default branch — מאושר כמדיניות תפעולית לכל משך פרויקט AOS v3.

### שאלה 2 — תנאים נוספים?

**שלושה תנאים — כולם non-blocking, נדרשים לפני/במהלך BUILD:**

| # | תנאי | מועד | אחראי |
|---|---|---|---|
| T-1 | AGENTS.md update — "ענף פעיל AOS v3: `aos-v3`" | לפני activation ראשון BUILD | Team 191 |
| T-2 | **FILE_INDEX Iron Rule** — אכיפה ב-git (ראו §3 הלן) | מ-Day 1 של BUILD | Team 191 + Team 61 |
| T-3 | **v2 FREEZE enforcement** — אסור לדחוף ל-`agents_os_v2/` | כל משך הפרויקט | Team 191 |

---

## 2. פרמטרים נעולים (בעלים + ארכיטקטורה)

| פרמטר | ערך | סמכות |
|---|---|---|
| ענף עבודה יומיומי | `aos-v3` | בעלים (Nimrod) |
| upstream | `origin/aos-v3` ישירות | בעלים |
| `pipeline_run.sh` / `codex/team191-integration` | **לא בשימוש** במסלול זה | בעלים |
| Default branch GitHub | `main` — ללא שינוי | בעלים |
| איחוד ל-main | אחרי השלמה **ו**מיגרציית נתונים בלבד | בעלים |
| `agents_os_v2/` | **מוקפא לחלוטין** — קריאה בלבד | `ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v1.0.0` |

---

## 3. Iron Rule חדש בסמכות Team 191: FILE_INDEX Enforcement

**רקע:** Directive `ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v1.0.0` קובע ש-**כל קובץ שנוצר/משתנה ב-`agents_os_v3/` חייב להיות רשום ב-`agents_os_v3/FILE_INDEX.json` לפני commit.** Team 61 מחזיק את ה-INDEX; Team 191 אוכף ברמת git.

### תפקיד Team 191 ב-FILE_INDEX

**אפשרות A — Pre-commit hook (מומלצת):**
הוסיפו pre-commit hook ל-`aos-v3` שמוודא:
1. כל קובץ שנוסף/שונה ב-`agents_os_v3/` קיים ב-`FILE_INDEX.json`
2. אין שינויים ב-`agents_os_v2/` כלל (FREEZE enforcement)

```bash
# .git/hooks/pre-commit (example logic)
# 1. Changed files under agents_os_v3/ must appear in FILE_INDEX.json
# 2. No files under agents_os_v2/ may be modified
```

**אפשרות B — Code review checklist (fallback):**
אם hook אוטומטי לא ניתן לאכיפה עבור כל agents, הוסיפו checklist ל-PR review בסיום sprint:
- [ ] FILE_INDEX.json עודכן
- [ ] אין שינויים ב-`agents_os_v2/`

**החלטה:** בחרו בין A ו-B בהתאם ליכולות ה-git setup הנוכחי. דווחו ל-Team 00 את הבחירה.

### v2 FREEZE enforcement

```bash
# כל push ל-aos-v3 שכולל שינויים ב-agents_os_v2/ = REJECT
# הודעת שגיאה: "agents_os_v2/ is FROZEN. All changes go to agents_os_v3/."
```

---

## 4. פעולות נדרשות — ordered by timing

### מידי (לפני BUILD Day 1)

| # | פעולה | פרטים |
|---|---|---|
| **191-A1** | **יצירת ענף `aos-v3`** | `git checkout main && git pull origin main && git checkout -b aos-v3 && git push -u origin aos-v3` (אם לא קיים) |
| **191-A2** | **עדכון AGENTS.md** | הוסף סעיף: `## Active Branch — AOS v3 \n Branch: aos-v3 \| Push: origin/aos-v3 \| Pipeline: N/A` |
| **191-A3** | **log_entry ב-WORK_PROCEDURE** | הפנה למסמך זה כ-overlay מחייב; עדכן v1.0.4 |
| **191-A4** | **סטטוס v1.1.0** | שנה מ-`PENDING_TEAM_100_SIGNOFF` → `APPROVED — ref: TEAM_00_TO_TEAM_191_AOS_V3_GIT_GOVERNANCE_CANONICAL_v1.1.0` |
| **191-A5** | **FILE_INDEX hook/checklist** | הגדר ובחר אפשרות A או B (ראו §3); דווח ל-Team 00 |

### במהלך BUILD (שוטף)

| # | פעולה |
|---|---|
| **191-B1** | ניטור שאין commits ל-`agents_os_v2/` |
| **191-B2** | אכיפת FILE_INDEX לפי מנגנון שנבחר |
| **191-B3** | סיוע ל-Build teams עם git flow שאלות (rebase, conflict resolution) |

### סיום פרויקט (לפני merge ל-main)

| # | פעולה |
|---|---|
| **191-C1** | ביצוע cleanup מאושר (מבוסס `CLEANUP_REPORT.md` שמפיק Team 61) |
| **191-C2** | PR מ-`aos-v3` → `main` לפי מדיניות מיזוג שתוגדר בסיום |
| **191-C3** | עדכון סטטוס מסמך v1.1.0 ל-`CLOSED` + ארכיב |
| **191-C4** | שחזור Default branch לנוהל רגיל |

---

## 5. Iron Rules לזיכרון

```
1. אין push --force (לאיזה ענף שיהיה)
2. אין שינויים ב-agents_os_v2/ (FREEZE מוחלט)
3. FILE_INDEX.json חייב לשקף כל קובץ ב-agents_os_v3/ לפני commit
4. Pre-commit hooks נשארים כפי שהריפו מגדיר
5. איחוד ל-main = אחרי CLEANUP_REPORT מאושר ע"י Nimrod בלבד
```

---

## 6. סמכות ואישור

**Team 00 (Principal — Nimrod)** — מסמך זה מהווה הן אישור בעלים (UC-15, branch mode) והן אישור ארכיטקטורי (FILE_INDEX, v2 freeze). מכסה את דרישת `PENDING_TEAM_100_SIGNOFF` — Team 100 מדווח ל-Team 00.

**סטטוס:** `TEAM_191_AOS_V3_PROJECT_BRANCH_WORK_MODE_v1.1.0` → **APPROVED**

---

**log_entry | TEAM_00 | TEAM_191_GIT_GOVERNANCE | AOS_V3_CANONICAL_RESPONSE_v1.1.0 | PASS | 2026-03-27**
