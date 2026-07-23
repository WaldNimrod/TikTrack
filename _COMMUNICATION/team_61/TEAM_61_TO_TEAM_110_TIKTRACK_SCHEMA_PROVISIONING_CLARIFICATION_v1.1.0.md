# Team 61 → Team 110 — תיקון והבהרה: סכימת TikTrack תקינה בסביבה המקומית/סטייג'ינג; הממצאים הקודמים היו ארטיפקט של Cloud-dev בלבד

**date:** 2026-07-23
**historical_record:** true
**id:** TEAM_61_TO_TEAM_110_TIKTRACK_SCHEMA_PROVISIONING_CLARIFICATION
**version:** 1.1.0
**supersedes:** `TEAM_61_TO_TEAM_110_TIKTRACK_SCHEMA_DDL_ORM_DRIFT_FINDINGS_v1.0.0.md`
**owner:** Team 61 (Cloud Agent / DevOps Automation — Cursor Cloud Agent platform)
**addressee:** Team 110 (TikTrack Domain Architect — IDE, domain_architect)
**cc:** Team 100 (Chief System Architect / R&D), Team 20 (Backend Implementation), Team 170 (Spec & Governance)
**project_domain:** tiktrack
**status:** ACTIVE — תיקון (retraction) + הבהרה מאומתת
**related:** `TEAM_61_TO_TEAM_100_CURSOR_CLOUD_ENVIRONMENT_REPORT_v1.0.0.md`, PR WaldNimrod/TikTrack#135

---

## 0. תקציר מנהלים — מה השתנה מ-v1.0.0

בעקבות הערת ה-Principal ("רוב הבעיות מקומיות בסביבה שלנו; בסביבה המקומית וגם בסטייג'ינג אין את הבעיות") בוצעה **בדיקה מעמיקה חוזרת**. מסקנתה חד-משמעית: **ה-Principal צודק.**

הממצאים ב-v1.0.0 (`server_default` שבור, partial index שבור, טבלאות "חסרות מודל") **אינם באגים בדומיין** ואינם קיימים בסביבה המקומית/סטייג'ינג/פרודקשן. הם היו **ארטיפקט של החלטת Cloud-dev** בלבד: בחרתי לבנות את הסכימה דרך `Base.metadata.create_all` (קיצור-דרך), בעוד ש**אף רכיב אמיתי במערכת אינו משתמש ב-create_all**. מסמך זה מושך (retracts) את הממצאים ומתעד את התמונה הנכונה.

---

## 1. הראיות שאספתי (בדיקה מעמיקה)

| # | בדיקה | תוצאה | משמעות |
|---|-------|--------|---------|
| 1 | `grep -rn "create_all" api/` | **ריק** | האפליקציה **לעולם** אינה בונה סכימה מ-ORM |
| 2 | `.github/workflows/ci.yml` | `DATABASE_URL=postgresql://test:test@localhost:5432/test` (דמה) | CI מריץ pytest בלבד, לא בונה סכימה מול Postgres חי |
| 3 | `scripts/migrations/README.md` | "Apply with `psql` ... Rollout (dev/staging/production) is an operator step" | ה-provisioning הקנוני = הפעלת קבצי SQL ידנית ע"י operator |
| 4 | `scripts/migrations/d34_alerts.sql:51` | `metadata JSONB DEFAULT '{}'::JSONB` | ה-SQL הידני (מקור האמת האמיתי) **תקין** |
| 5 | `scripts/migrations/*.sql` (מרובים) | `WHERE deleted_at IS NULL` | ה-partial indexes נכתבים נכון ב-SQL האמיתי |
| 6 | השוואת מודלים `origin/main` מול `origin/production` | אותם פאטרנים בדיוק קיימים גם ב-production | הפאטרנים ותיקים ואינם ייחודיים ל-branch; production רץ תקין איתם |
| 7 | סנכרון branch | `HEAD` **0 מאחור** `origin/main`; `production` (2026-02-23) מוכל ב-`main` (2026-04-05) | אני על הקוד **החדש ביותר**; אין drift קוד |

**המפתח (בדיקה 1):** `server_default` ו-`postgresql_where` הם **מטא-דאטה ל-DDL generation** ב-SQLAlchemy. הם נצרכים **אך ורק** אם קוראים ל-`create_all`. מכיוון שהאפליקציה, CI וה-operator path אינם קוראים ל-`create_all` — המטא-דאטה הזו **inert** (רדומה) ואינה משפיעה על הסכימה בפועל.

---

## 2. Retraction — סיווג מחודש של ממצאי v1.0.0

| ממצא ב-v1.0.0 | סיווג קודם | סיווג מתוקן |
|----------------|------------|--------------|
| §2.1 `server_default="'{}'::JSONB"` ב-7 מודלים | "באג חוסם, חומרה גבוהה" | **לא-בעיה.** מטא-דאטה inert; רלוונטי רק ל-`create_all` שאינו בשימוש. ה-DEFAULT בפועל מגיע מ-SQL המיגרציה (תקין) |
| §2.2 `postgresql_where=func.deleted_at.is_(None)` | "באג חוסם, חומרה גבוהה" | **לא-בעיה בדומיין.** ה-partial index האמיתי נוצר ע"י מיגרציית `psql` תקינה; רק נתיב ה-`create_all` שלי כשל |
| §3.1 `external_data_providers` "ללא מודל" | "פער" | **לא-בעיה.** טבלה מנוהלת-SQL; מסופקת ע"י DDL/מיגרציה. אי-מידולה ב-ORM היא בחירה לגיטימית |
| §3.2 `admin_data.job_run_log` "ללא מודל" | "פער" | **לא-בעיה.** מסופקת ע"י מיגרציה `g7_M005*`; קיימת בסביבות אמיתיות (ואף עשירה יותר — ראה §3) |
| §3.3 ייבוא חלקי ב-`__init__.py` | "פער נמוך" | **לא-בעיה מהותית.** ה-`__init__` מייבא את מה שנחוץ ל-runtime; אין תלות ב-`create_all` |

**סיכום:** אין פעולת תיקון קוד נדרשת מ-Team 20 בעקבות v1.0.0. הבקשות שהופנו שם (§5 ב-v1.0.0) — **מבוטלות**.

---

## 3. מה כן נכון (הערות תקפות, חומרה נמוכה — לשיקול בלבד)

אלה **אינן** בעיות סביבה מקומית/סטייג'ינג, אלא הערות documentation/DX ברמת דומיין:

1. **אין artifact יחיד לבנייה-מאפס:** ה-provisioning נשען על DB קיים + רצף מיגרציות incremental (42 קבצים, ללא runner). ה-DDL המלא (`PHX_DB_SCHEMA_V2.6_FULL_DDL.sql`) אינו מיושם ב-pass אחד, אך הוא **אינו** נתיב ה-provisioning בפועל — ולכן אין לכך השפעה תפעולית. רלוונטי רק לבוט-סטרפ נדיר (כמו סביבת Cloud חדשה).
2. **DB אמיתי עשיר מה-ORM:** dump מ-`scripts/backups/` מראה עמודות/טבלאות נוספות (`job_run_log.runtime_class/exit_code/...`, `market_data.data_refresh_logs`) שאינן ב-ORM. זו הצטברות מיגרציות תקינה — לא drift מזיק, אך מחזק שאין SSOT סכימה מאוחד.
3. **המלצה (אופציונלית, לא חוסמת):** אימוץ Alembic ייתן SSOT סכימה יחיד ובנייה-מאפס דטרמיניסטית — יקל על בוט-סטרפ סביבות חדשות (כמו Cloud). זו **המלצת DX**, לא תיקון באג.

---

## 4. מה עודכן בסביבת ה-Cloud (בעקבות בדיקה זו)

1. **אומת סנכרון קוד:** ה-branch 0 מאחור `origin/main` (הקוד החדש ביותר). deps הותקנו מחדש (venv/pip/npm), `api/.env` שוחזר, השירותים הופעלו — Backend `{"status":"ok"}`, login `200`, Frontend `200`.
2. **תוקן תיעוד מטעה:** `AGENTS.md` → "Database Setup Gotchas" עודכן כדי להבהיר שהנתיב הקנוני הוא הפעלת `scripts/migrations/*.sql` ב-`psql`, ושבניית ה-ORM היא **בוט-סטרפ Cloud-dev בלבד** (לא ייצוגי לסטייג'ינג). כותרת `scripts/dev_build_schema_from_orm.py` תוקנה באותה רוח.
3. **v1.0.0 סומן SUPERSEDED** עם באנר המפנה למסמך זה (Document Correction Protocol).

---

## 5. פעולה מבוקשת מ-Team 110 (מעודכנת)

| # | פעולה | חומרה |
|---|--------|--------|
| 1 | **לאשר את ה-retraction** — אין באגי סכימה בדומיין TikTrack; v1.0.0 מבוטל | — |
| 2 | לשקול (אופציונלי, DX) אימוץ Alembic / הפקת artifact סכימה יחיד לבנייה-מאפס, לטובת בוט-סטרפ סביבות חדשות (Cloud) | נמוכה |
| 3 | להנחות את סביבת ה-Cloud: כשנדרשת נאמנות-סטייג'ינג — להפעיל את רצף `scripts/migrations/*.sql` ולא את בניית ה-ORM | נמוכה |

> **ולידציה חוצת-מנועים (Iron Rule #1 / "team_110 default"):** אם תוחלט פעולה כלשהי (למשל Alembic), הבנייה על engine אחד תאומת ע"י validator על engine שונה — כפי שנהוג.

---

## 6. רפרנסים (תיעוד ודוקומנטציה)

- מנגנון provisioning קנוני: `scripts/migrations/README.md`, `scripts/migrations/*.sql` (למשל `d34_alerts.sql`, `g7_M005_job_run_log.sql`)
- CI: `.github/workflows/ci.yml` (DATABASE_URL דמה)
- הוכחה ש-create_all לא בשימוש: `api/main.py` (lifespan — scheduler בלבד), `api/core/database.py`
- מודלים (מטא inert): `api/models/{alerts,cash_flows,market_reference,notes,tickers,trades,trading_accounts}.py`, `api/models/identity.py`
- Cloud-dev בלבד: `scripts/dev_build_schema_from_orm.py`, `scripts/dev_bootstrap_schema.sql`, `AGENTS.md → ## Cursor Cloud specific instructions`
- מסמך קודם (מבוטל): `TEAM_61_TO_TEAM_110_TIKTRACK_SCHEMA_DDL_ORM_DRIFT_FINDINGS_v1.0.0.md`
- דוחות מלווים: `TEAM_61_TO_TEAM_100_CURSOR_CLOUD_ENVIRONMENT_REPORT_v1.0.0.md` (יש לקרוא את §2/§3 שם בזהירות — אותה הבהרה חלה); PR **WaldNimrod/TikTrack#135**
- קאנון: `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md`, `TEAM_TAXONOMY_v1.0.1.md`

---

## 7. מסקנה

הבדיקה המעמיקה אישרה את הערת ה-Principal: **סכימת TikTrack תקינה בסביבה המקומית/סטייג'ינג/פרודקשן.** ה"בעיות" ב-v1.0.0 נבעו מבחירת בוט-סטרפ שגויה בסביבת ה-Cloud (`create_all`) שאינה משקפת את נתיב ה-provisioning הקנוני (`psql` + מיגרציות). התיעוד תוקן, הסביבה מסונכרנת עם הקוד העדכני, והממצאים שהופנו ל-Team 20 מבוטלים. נותרות רק הערות DX אופציונליות (§3, §5.2).

---

**--- PHOENIX TASK SEAL ---**
**TASK_ID:** TEAM_61_TIKTRACK_SCHEMA_PROVISIONING_CLARIFICATION
**STATUS:** CLOSED — retraction of v1.0.0; no domain code action required
**SUPERSEDES:** TEAM_61_TO_TEAM_110_TIKTRACK_SCHEMA_DDL_ORM_DRIFT_FINDINGS_v1.0.0
**FILES_MODIFIED:**
  - `_COMMUNICATION/team_61/TEAM_61_TO_TEAM_110_TIKTRACK_SCHEMA_PROVISIONING_CLARIFICATION_v1.1.0.md`
  - `_COMMUNICATION/team_61/TEAM_61_TO_TEAM_110_TIKTRACK_SCHEMA_DDL_ORM_DRIFT_FINDINGS_v1.0.0.md` (SUPERSEDED banner)
  - `AGENTS.md` (Database Setup Gotchas — canonical vs Cloud-dev clarification)
  - `scripts/dev_build_schema_from_orm.py` (docstring clarification)
**PRE_FLIGHT:** verified — backend `/health` ok, login 200, frontend 200, on `origin/main` (0 behind)
**HANDOVER_PROMPT:** "Team 110: הבדיקה המעמיקה אישרה — אין באגי סכימה בדומיין TikTrack. הממצאים ב-v1.0.0 היו ארטיפקט של create_all ב-Cloud-dev בלבד; מבוטלים. נותרה המלצת DX אופציונלית (Alembic / artifact סכימה יחיד). ראה §5."

**log_entry | TEAM_61 | TIKTRACK_SCHEMA_PROVISIONING_CLARIFICATION_v1.1.0_TO_TEAM_110_CREATED | ACTIVE | 2026-07-23**
