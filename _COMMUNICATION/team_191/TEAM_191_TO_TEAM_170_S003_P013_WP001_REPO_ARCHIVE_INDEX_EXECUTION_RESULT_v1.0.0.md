---
id: TEAM_191_TO_TEAM_170_S003_P013_WP001_REPO_ARCHIVE_INDEX_EXECUTION_RESULT_v1.0.0
from: Team 191 (Git governance & backup)
to: Team 170 (Librarian / _COMMUNICATION hygiene)
cc: Team 00, Team 10, Team 51
date: 2026-03-24
status: EXECUTION_COMPLETE
work_package_id: S003-P013-WP001
in_response_to: TEAM_170_TO_TEAM_191_S003_P013_WP001_REPO_NOISE_AND_LOCAL_ARCHIVE_REQUEST_v1.0.0.md
---

# Team 191 → Team 170 | ביצוע מלא — רעש ריפו, `99-ARCHIVE`, `_ARCHIVE` (S003-P013-WP001)

## סיכום ביצוע

| סעיף בקשה | פעולה | תוצאה |
|-----------|--------|--------|
| **1 — `**/99-ARCHIVE/`** | אומת קיום ב־[`.gitignore`](../../.gitignore) (`**/99-ARCHIVE/`, `**/99-archive/`). בוצע `git rm -r --cached -f` לכל העץ **`_COMMUNICATION/99-ARCHIVE/`** (legacy tracked). | **PASS** — 0 נתיבים עם `/99-ARCHIVE/` נשארו ב־index. |
| **1b — snapshot legacy** | זוהו **14** קבצים tracked תחת `archive/documentation_legacy/snapshots/.../99-ARCHIVE/` (מחוץ ל־`_COMMUNICATION/`). הוסרו ממדדים באותה מדיניות. | **PASS** |
| **2 — `_COMMUNICATION/_ARCHIVE/`** | נוסף דפוס **`_COMMUNICATION/_ARCHIVE/`** ל־`.gitignore`. בוצע `git rm -r --cached -f` לכל **`_COMMUNICATION/_ARCHIVE/`** המנוטרק. | **PASS** — תוכן נשאר מקומי; כתיבת pipeline ל־`_COMMUNICATION/_ARCHIVE/{stage}/{wp}/` (למשל ב־`agents_os_v2`) נשארת חוקית על דיסק כלא-מנוטרק. |
| **3 — CI / סריקות** | נסקרו [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) (דחיפות ל־backend עם `paths-ignore` שכולל `_COMMUNICATION/**`), [`.github/workflows/lint-enforcement.yml`](../../.github/workflows/lint-enforcement.yml), ו־[`scripts/lint_governance_dates.sh`](../../scripts/lint_governance_dates.sh). אין תלות בנוכחות ארכיון ב־`git clone` טהור; DATE-LINT מדלג על קבצים שנמחקו מהעץ. | **PASS** (ללא שינוי workflow נדרש) |
| **4 — גיבוי לפני שינוי אינדקס** | נרשם **pre-change HEAD** לשחזור/השוואה: `07c0b35325906fd894b2319ba395ac19585b71d9`. בלובים נשארים בהיסטוריית Git עד rewrite מכוון. מומלץ לפי §3 בדוח Team 51: `git bundle` / ענף snapshot לפני push אם נדרש עותק חיצוני. | **RECORDED** |
| **5 — `_COMMUNICATION/agents_os/` churn** | לפי [TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md](../team_170/TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md) — **KEEP**. | **המלצות workflow (אימות Team 191):** (א) קומיטים קטנים לפי נתיב (`agents_os/pipeline_state*.json` נפרד מ־`prompts/` כשאפשר); (ב) לא לערבב שינויי ריצה עם מסמכי מדיניות באותו קומיט; (ג) אופציונלי עתידי: `.gitattributes export-ignore` או ענף נפרד ל־state — דורש החלטת Team 10 / בעלי מוצר. |
| **6 — Team 10** | נשלח יידוע Gateway: [`TEAM_191_TO_TEAM_10_S003_P013_WP001_REPO_ARCHIVE_POLICY_GATE_NOTICE_v1.0.0.md`](TEAM_191_TO_TEAM_10_S003_P013_WP001_REPO_ARCHIVE_POLICY_GATE_NOTICE_v1.0.0.md) | **DONE** |

## נתוני אינדקס (אומדן)

- הוסרו מהמעקב (cached only, ללא מחיקה מדיסק): **`_COMMUNICATION/99-ARCHIVE/`**, **`_COMMUNICATION/_ARCHIVE/`**, ו־**14** קבצים תחת `archive/.../99-ARCHIVE/`.
- סה״כ שינוי commit צפוי: סדר גודל **~1999** קבצים מהעץ (מחיקות מ־index בלבד) + עדכון `.gitignore` + מסמכי משוב זה.

## Errata (post-commit)

- במהלך `git rm -r --cached` הוסרו בטעות ממדדים **שני** קבצי evidence תחת `_COMMUNICATION/team_60/evidence/runtime/check_alert_conditions.launchd.*` (לא היו חלק מ־`99-ARCHIVE/`). **תוקן** בקומיט המשחזר מיד אחרי קומיט המדיניות (`restore Team 60 runtime evidence logs`).

## סיכונים / הערות

- **Clone ציבורי חדש:** לא יכלול תוכן ארכיון מקומי — זה היעד לפי הבקשה.
- **שחזור תוכן:** עדיין זמין מקומית בתיקיות + מקומות ב־history לפני הקומיט הזה.
- **`scripts/archive_communication_sweep.py`:** המשך שימוש ב־`git mv` לתוך shard תחת `99-ARCHIVE/` יניב קבצים **לא מנוטרקים** (מתאים למדיניות החדשה).

---

**log_entry | TEAM_191 | TO_TEAM_170 | S003_P013_WP001 | REPO_ARCHIVE_INDEX_EXECUTION | COMPLETE | 2026-03-24**
