---
id: TEAM_00_TO_TEAM_191_RUNTIME_LOG_CLEANUP_MANDATE_v1.0.0
historical_record: true
from: Team 00 (Nimrod — System Designer)
to: Team 191 (Git, Archive & File Governance)
date: 2026-03-26
status: ACTIVE
type: MANDATE
subject: Immediate runtime log cleanup — agents_os/prompts/ + reusable archive script
priority: HIGH---

# MANDATE — Runtime Log Cleanup + Archive Script

---

## 1. הקשר

`_COMMUNICATION/agents_os/prompts/` מכיל **1,015 קבצים**.
מתוכם ~975 הם לוגי runtime אוטומטיים שנוצרו ע"י מערכת ה-pipeline:
- `test_cursor_prompt_YYYYMMDD_HHMMSS.md` — auto-generated, אין ערך ארכיוני פעיל
- אלה קבצי `RUNTIME_LOG` לפי מדיניות מחזור חיים — מועמדים לארכוב מיידי

~40 קבצים נוספים בתיקייה הם **פרומפטים אופרטיביים** (mandates, gate prompts) — אסור לגעת בהם.

**מאשר ניקיון מיידי.**

---

## 2. הגדרות מדיניות (FILE_LIFECYCLE_POLICY_v1.0.0)

| סוג קובץ | הגדרה | מה עושים |
|---|---|---|
| `RUNTIME_LOG` | auto-generated ע"י pipeline, timestamp בשם | ארכוב לאחר sprint |
| `CANONICAL` | mandate מ-Team 00, החלטות אדריכליות | שמור לנצח |
| `DELIVERABLE` | תוצר צוות, גרסה סופית | שמור בזמן ACTIVE |
| `NOTIFICATION` | הודעות חד-פעמיות בין צוותים | ארכוב לאחר Stage |
| `OPERATIONAL` | gate prompts, mandate active | שמור בזמן WP פעיל |

---

## 3. המשימה — שני חלקים

### חלק א: ניקיון מיידי

**מקור:** `_COMMUNICATION/agents_os/prompts/`
**קריטריון:** כל קובץ ששמו מתחיל ב-`test_cursor_prompt_`
**יעד:** `_COMMUNICATION/99-ARCHIVE/2026-03-26_runtime_log_cleanup/agents_os_prompts/`

**לא לגעת:** כל קובץ אחר בתיקייה (agentsos_*.md, tiktrack_*.md וכו')

**שלבים:**
1. ספור קבצי `test_cursor_prompt_*` (לדיווח)
2. צור תיקיית יעד אם לא קיימת
3. העבר את כל הקבצים (mv, לא cp)
4. ספור מה שנשאר ב-prompts/ (לאימות)
5. git add + git commit

**פורמט commit:**
```
archive(runtime-logs): move N test_cursor_prompt files to 99-ARCHIVE

Source: _COMMUNICATION/agents_os/prompts/
Target: _COMMUNICATION/99-ARCHIVE/2026-03-26_runtime_log_cleanup/agents_os_prompts/
Type: RUNTIME_LOG — auto-generated pipeline prompt logs
Mandate: TEAM_00_TO_TEAM_191_RUNTIME_LOG_CLEANUP_MANDATE_v1.0.0
```

---

### חלק ב: סקריפט לשימוש חוזר

**צור:** `scripts/archive_runtime_logs.sh`

**דרישות:**
- מקבל פרמטר אופציונלי: `--days N` (ברירת מחדל: 0 = כל הקבצים)
- מארכב את כל `test_cursor_prompt_*.md` ישנים יותר מ-N ימים
- יעד: `_COMMUNICATION/99-ARCHIVE/$(date +%Y-%m-%d)_runtime_log_cleanup/agents_os_prompts/`
- מדפיס: כמה קבצים הועברו, כמה נשארו
- לא מוחק — רק מעביר
- לא מבצע git commit אוטומטי (commit = החלטה אנושית)

**דוגמת שימוש:**
```bash
./scripts/archive_runtime_logs.sh           # ארכב הכל
./scripts/archive_runtime_logs.sh --days 7  # ארכב ישנים מ-7 ימים
```

---

## 4. פלט נדרש

קובץ completion report ב-`_COMMUNICATION/team_191/`:

```
TEAM_191_RUNTIME_LOG_CLEANUP_RESULT_v1.0.0.md
```

תוכן:
- כמה קבצים הועברו
- כמה קבצים נשארו ב-prompts/ (ואילו)
- נתיב הארכיב שנוצר
- git commit hash
- נתיב הסקריפט שנוצר

---

## 5. Iron Rules לביצוע

1. **NEVER delete** — אך ורק `mv` ל-99-ARCHIVE
2. **אל תגע** בקבצים שאינם `test_cursor_prompt_*`
3. **אל תגע** בתוכן הקבצים — file operations בלבד
4. אם יש ספק לגבי קובץ ספציפי — **השאר במקומו** ודווח

---

**log_entry | TEAM_00 | RUNTIME_LOG_CLEANUP_MANDATE | ISSUED | 2026-03-26**
