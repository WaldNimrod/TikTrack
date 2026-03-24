---
id: TEAM_191_TO_TEAM_00_TEAM_100_S003_P016_PORTFOLIO_CODE_ALIGNMENT_REPORT_v1.0.0
from: Team 191 (Git Governance / pre-push portfolio lane)
to: Team 00 (System Designer), Team 100 (Spec & Governance Authority)
cc: Team 10, Team 61
date: 2026-03-24
status: ARCHITECT_REVIEW_REQUESTED
subject: Post–S003-P016 portfolio tooling changes — rationale, delta, alignment check
work_package_ref: S003-P016 (Pipeline Git Isolation / COS extraction — related)
---

# דוח לאדריכלית | עדכוני קוד portfolio אחרי S003-P016

## 1) למה בוצעו שינויים (הקשר תפעולי)

בעת **`191 פוש`** נכשל **pre-push guard** (`scripts/portfolio/guard_wsm_registry_sync_before_push.sh`):

1. `python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --check` — **קרס** עם  
   `SyncError: Heading not found: ## CURRENT_OPERATIONAL_STATE (...)`
2. לאחר תיקון חלקי — `python3 scripts/portfolio/build_portfolio_snapshot.py --check` — **קרס** באותה סיבה, ואז גם על **דומיין `SHARED`** בתוכנית S003-P016, ועל **snapshot ישן**.

כלומר: **המימוש הקודם של כלי ה-portfolio הניח שטבלת COS קיימת ב־WSM**. לפי **S003-P016** הטבלה הוסרה והמצב התפעולי עבר ל־**`pipeline_state_*.json`**.  
לכן **ללא** עדכון קוד, **אין אפשרות לעבור pre-push** בסביבה שבה WSM כבר עודכן לפי P016.

---

## 2) התאמה מכוונת ל־S003-P016 (מקור קנוני ב־WSM)

מ־`documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` (קטעים שמפורשים את P016):

- מצב ריצה (שלב, שער, WP פעיל וכו׳) **נשמר ב־**`pipeline_state_tiktrack.json` **ו־**`pipeline_state_agentsos.json` — **לא** במסמך WSM (**COS הוסר**).
- שכבת Portfolio (Roadmap / Program / WP registry) היא **מראה מבנית**; **אין** שני מקורות אמת לרuntim.

**מסקנה של Team 191:** כלי שמסנכרנים **מראות registry** חייבים לקרוא את **אותו מקור runtime** ש־P016 קובע, כאשר טבלת ה־COS ב־WSM אינה קיימת.

---

## 3) מה בדיוק שינינו בקוד / בארטיפקטים

### 3.1 `scripts/portfolio/sync_registry_mirrors_from_wsm.py`

| שינוי | תיאור |
|--------|--------|
| ייבוא `json` + קבועי נתיב | `PIPELINE_STATE_AGENTS_OS`, `PIPELINE_STATE_TIKTRACK` תחת `_COMMUNICATION/agents_os/`. |
| פונקציה חדשה `_parse_wsm_state_from_pipeline_json()` | בונה **מילון בצורה תואמת COS-legacy** מתוך שני קבצי ה־JSON (שדות: `active_stage_id`, `active_program_id`, `active_work_package_id`, `current_gate`, `active_flow` מ־`spec_brief` מקוצר, וכו׳). |
| `_parse_wsm_state(text)` | **נסיון ראשון:** פרסור טבלת COS מה־WSM (התנהגות ישנה). **אם נכשל / חסר:** נפילה ל־`_parse_wsm_state_from_pipeline_json()`. |
| היוריסטיקת `_pick` | בוחרת קובץ שבו `current_gate != COMPLETE` אם קיים; אחרת **הראשון ברשימה** (סדר קבוע: agents_os → tiktrack). |
| docstring ראשי | עודכן כדי **לא** לטעון ש־WSM הוא מקור runtime יחיד (תואם P016). |

**למה זה נדרש:** להשאיר את לוגיקת `_sync_program_registry` / `_sync_wp_registry` ללא שכתוב מלא, תוך הזנת אותו “צורת מילון” שהכלי הצפה מ־COS.

### 3.2 `scripts/portfolio/build_portfolio_snapshot.py`

| שינוי | תיאור |
|--------|--------|
| אותה נסיגה ל־pipeline JSON | `_wsm_proxy_from_pipeline_json()` + `_extract_wsm_current_state()` עם `try/except PortfolioError` — מקביל ל־sync script. |
| אימות דומיין תוכנית | הורחבה קבוצת הדומיינים המותרים ל־`Programs`: נוסף **`SHARED`**. |

**למה `SHARED`:** בשורת הרישום הקנונית ל־**S003-P016** ב־`PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` מופיע דומיין **`SHARED`**. לפני השינוי, `validate_snapshot` **כשל** עם  
`Program S003-P016 has invalid domain 'SHARED'`.  
זה **חסם snapshot check** למרות שהרישום **מאושר במסמך governance**.

### 3.3 ארטיפקטים שנבנו מחדש (לא לוגיקה חדשה)

| קובץ | סיבה |
|------|------|
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` | עדכון שדות mirror (`current_gate_mirror` וכו׳) לאחר `--write` של sync. |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md` | סימון שורת WP פעילה / סיכום “active WP state” בהתאם למצב שנגזר מ־pipeline JSON. |
| `portfolio_project/portfolio_snapshot.json` | ריענון לאחר `build_portfolio_snapshot.py` (ללא `--check`). |
| `portfolio_project/portfolio_snapshot.md` | כנ״ל. |

**קומיט ביצוע (מקומי → נדחף לענף Team 191):**  
`7d80dbc2b` — `S003-P016: Team 191 — portfolio pre-push: pipeline_state WSM proxy + SHARED domain + snapshot refresh`

---

## 4) האם זה “תקין” לגמרי מול P016? — שקיפות וסיכונים

**תקין ברמת העקרון:** כן — המקור ל־runtime state אחרי P016 הוא **`pipeline_state_*.json`**, והכלים כעת **לא דורשים** COS ב־WSM.

**מגבלות / נקודות לאימות אדריכלי:**

1. **מסלול מקביל (שני דומיינים):** היוריסטיקה בוחרת **רשומת runtime אחת** לצורך עדכון מראה ה־registry. כאשר **שני** הדומיינים ב־`COMPLETE`, נבחר **תמיד** הקובץ הראשון בסדר (בדרך כלל `agents_os`).  
   - **שאלה לאדריכלית:** האם מראה ה־Program/WP registry אמורה לשקף **דומיין אחד מועדף**, או **שתי שורות פעילות** / כלל אחר?

2. **שדות ריקים בפרוקסי:** `last_gate_event`, `last_closed_work_package_id` מוגדרים **ריקים** בנתיב ה־JSON — הלוגיקה הישנה הסתמכה על COS.  
   - **שאלה:** האם נדרש מיפוי מפורש מ־JSON (או מ־`STAGE_PARALLEL_TRACKS` ב־WSM) לשדות אלה?

3. **כפילות לוגיקה:** אותה פרוקסי־state מועתקת לשני קבצים (sync + snapshot).  
   - **המלצה:** לאחד למודול משותף (`scripts/portfolio/wsm_runtime_proxy.py`) לאחר אישור אדריכלי.

4. **תיאור בראש `build_portfolio_snapshot.py`:** עדיין מציין בחלקו “read only from WSM CURRENT_OPERATIONAL_STATE” — **מומלץ** לעדכן תיאור מערכתי כמו ב־sync (לא בוצע בקומיט האחרון כדי לצמצם scope).

---

## 5) בקשה לאדריכלית / Team 100

1. **אישור** שהנסיגה ל־`pipeline_state_*.json` + סדר `_pick` **מקובלים** כ־interim עד השלמת כל סעיפי P016 (SSOT יחיד, דשבורד, וכו׳).  
2. **החלטה** על כלל ברור למצב **שני דומיינים פעילים / שניים COMPLETE**.  
3. **אישור** ש־**`SHARED`** כדומיין תוכנית ב־registry הוא קנוני ולכן **חייב** להיות מותר ב־`validate_snapshot`.

---

## 6) ראיות

| ראיה | נתיב / פקודה |
|------|----------------|
| קוד sync | `scripts/portfolio/sync_registry_mirrors_from_wsm.py` |
| קוד snapshot | `scripts/portfolio/build_portfolio_snapshot.py` |
| WSM — הגדרת P016 | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` (§0, §5) |
| שורת S003-P016 ב־registry | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` |
| קומיט | `7d80dbc2b` (בהיסטוריה מקומית / על `team191/s003-p013-wp001-archive-policy`) |

---

**log_entry | TEAM_191 | TO_TEAM_00_TEAM_100 | S003_P016_PORTFOLIO_CODE_ALIGNMENT | REPORT | 2026-03-24**
