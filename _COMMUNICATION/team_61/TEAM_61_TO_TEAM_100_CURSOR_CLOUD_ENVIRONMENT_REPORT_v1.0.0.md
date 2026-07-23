# Team 61 → Team 100 — דוח סביבת עבודה חדשה: Cursor Cloud Agent (TikTrack) — ממצאים, יכולות, יתרונות/חסרונות והמלצות שילוב

**date:** 2026-07-07
**historical_record:** true
**id:** TEAM_61_TO_TEAM_100_CURSOR_CLOUD_ENVIRONMENT_REPORT
**version:** 1.0.0
**owner:** Team 61 (Cloud Agent / DevOps Automation — Cursor Cloud Agent platform)
**addressee:** Team 100 (Chief System Architect / Chief R&D — domain_architect)
**project_domain:** tiktrack (עם השלכות multi-domain)
**status:** ACTIVE — דוח מחקר + בקשת בחינת שילוב
**related_pr:** WaldNimrod/TikTrack#135 — `cursor/dev-environment-setup-31ad`

---

## 0. תקציר מנהלים

הוקמה בהצלחה **סביבת פיתוח מלאה עבור מוצר TikTrack Phoenix** בתוך **Cursor Cloud Agent VM** — סוג סביבה **חדש** לפרויקט (הרצה אוטונומית/headless, לא IDE אינטראקטיבי). כל שכבות המוצר עלו והודגמו end-to-end: Backend (FastAPI :8082), Frontend (React 18 + Vite :8080), ו-PostgreSQL 16. בוצעה משימת "hello-world" אמיתית — התחברות דרך הדפדפן ויצירת חשבון מסחר שנשמר ל-DB.

**הממצא המרכזי (חשוב לאדריכלות):** ה-DDL הקנוני (`PHX_DB_SCHEMA_V2.5/2.6_FULL_DDL.sql`) **אינו ניתן להחלה נקייה**, ולכן סכימת ה-DB נבנתה ישירות מ-ORM (SQLAlchemy `create_all`) דרך שני סקריפטי dev חדשים. בנוסף, הסביבה **ללא Docker** ו**ללא systemd**, מה שמחייב התאמות ביחס לסקריפטי ה-dev הקיימים (שמניחים קונטיינר Docker).

הדוח מפרט את היכולות, היתרונות והחסרונות, ומבקש מ-Team 100 לבחון כיצד לשלב את סוג הסביבה הזה בקאנון של הפרויקט (רישום engine/environment, נתיב סכימה מבורך, ומדיניות רשת/secrets).

---

## 1. מה גילינו — מפרט הסביבה בפועל

| רכיב | ערך שנצפה |
|------|-----------|
| OS | Ubuntu 24.04 (noble), kernel 6.12.58 |
| Python | 3.12.3 (`/usr/bin/python3`) |
| Node / npm | 22.14.0 / 10.9.7 |
| Docker | **לא מותקן** (`docker: command not found`) |
| PostgreSQL | **16.14 — cluster מקומי מבוסס apt** (לא קונטיינר), port 5432 |
| systemd | **לא פעיל** — שירותים לא עולים אוטומטית באתחול |
| ניהול חבילות JS | npm (`package-lock.json`) |
| virtualenv Python | `api/venv` (נוצר ידנית; `python3.12-venv` הותקן) |
| רשת | **egress מוגבל** — חלק מהבקשות החיצוניות נחסמות (רלוונטי ל-yfinance/Alpha Vantage) |
| Git | מאומת; `gh` CLI זמין ב-**read-only** |

### 1.1 תלויות מערכת שהותקנו (one-time, נשמר ב-snapshot)
`postgresql`, `postgresql-contrib`, `python3.12-venv`, `python3-dev`, `libpq-dev`, `build-essential`.

### 1.2 שכבת רענון התלויות (Update Script — SetupVmEnvironment)
```
python3 -m venv api/venv
api/venv/bin/pip install --upgrade pip
api/venv/bin/pip install -r api/requirements.txt
npm --prefix ui install
```
(מינימלי, אידמפוטנטי, ללא הפעלת שירותים/מיגרציות — לפי מדיניות ה-Cloud Agent.)

---

## 2. מה הצלחנו (Successes)

| # | הישג | ראיה |
|---|------|------|
| 1 | Backend FastAPI עלה תקין על :8082 | `GET /health` → `{"status":"ok"}`, `/docs` → 200 |
| 2 | התחברות מלאה מול ה-API | `POST /api/v1/auth/login` (TikTrackAdmin/4181) → 200 + JWT |
| 3 | Frontend Vite עלה על :8080 | `GET /` → 200; דף Login נטען |
| 4 | סכימת DB מלאה (25 טבלאות) נבנתה מ-ORM | 15 `user_data` + 9 `market_data` + 1 `admin_data` |
| 5 | משתמש QU נזרע | `TikTrackAdmin` / `4181` (`scripts/seed_qa_test_user.py`) |
| 6 | **Hello-world E2E** — התחברות ב-UI + יצירת חשבון מסחר שנשמר ל-DB | וידאו + אימות `SELECT` ב-`user_data.trading_accounts` |
| 7 | Unit tests | `pytest tests/unit/` → 37 passed, 2 skipped |
| 8 | Suite B (cache/failover) | `pytest tests/test_external_data_cache_failover_pytest.py` → 6 passed |
| 9 | בנייה מחדש של ה-DB מאפס אומתה כרפרודוסבילית | bootstrap SQL → ORM build → migration → seed |

### 2.1 שני סקריפטי dev חדשים שנוצרו (רפרודוסביליות)
- `scripts/dev_bootstrap_schema.sql` — extensions, schemas (`user_data`/`market_data`/`admin_data`), טיפוסי ENUM (שה-ORM מצהיר עם `create_type=False`), והטבלה חסרת-ה-ORM `market_data.external_data_providers` (יעד FK של `ticker_prices`).
- `scripts/dev_build_schema_from_orm.py` — `Base.metadata.create_all` לכל המודלים (כולל אלו שאינם מיובאים ב-`api/models/__init__.py`), עם עקיפות **runtime בלבד** (ללא שינוי קבצי מודל): עטיפת `server_default` שהם SQL גולמי ב-`text()`, ודילוג על partial indexes שבורים (PK/UNIQUE נשמרים).

---

## 3. מה לא הצליח / מגבלות שהתגלו (Findings & Gaps)

| # | ממצא | חומרה | השלכה |
|---|------|--------|--------|
| 1 | ה-DDL הקנוני `PHX_DB_SCHEMA_V2.5/2.6_FULL_DDL.sql` אינו מתחיל נקי — פסיקים עודפים לפני `)`, generated columns לא-immutable, unique constraint על partitioned table | **גבוהה** | לא ניתן להסתמך על ה-DDL לבניית DB; נדרש נתיב ORM |
| 2 | Docker לא מותקן; `scripts/init-full-env.sh` / `init-servers-for-qa.sh` מניחים קונטיינר `tiktrack-postgres-dev` | בינונית | סקריפטי ה-dev הקיימים מדלגים/נכשלים; נדרשת הפעלה ידנית |
| 3 | אין systemd — Postgres לא עולה באתחול | בינונית | יש להריץ `sudo pg_ctlcluster 16 main start` בכל session |
| 4 | egress רשת מוגבל | בינונית | ספקי market-data חיים (Yahoo/Alpha Vantage) עלולים להיחסם; ב-dev הוגדר `SKIP_LIVE_DATA_CHECK=true` + `RUN_LIVE_SYMBOL_VALIDATION=false` |
| 5 | pre-commit hooks אינם מותקנים ב-clone נקי; `black`/`detect-secrets`/`bandit` לא מותקנים כברירת מחדל | בינונית | ה-Quality Gate אינו נאכף אוטומטית — יש להתקין ידנית |
| 6 | ORM `__init__.py` מייבא רק תת-קבוצה של המודלים | נמוכה | ללא ייבוא מלא, טבלאות notes/alerts/notifications/feature_flags לא נוצרות ב-`create_all` |
| 7 | טבלה `admin_data.job_run_log` נדרשת ע"י APScheduler אך אינה ב-ORM | נמוכה | ללא המיגרציה `g7_M005*`, ה-backend רושם `UndefinedTableError` כל 15 דקות |
| 8 | ESLint: 43 errors / 92 warnings; mypy: 153 issues (KB-006) | מוכר (pre-existing) | לא נאכף כ-blocking; מתועד ב-Known Bugs |

> ממצאים 1, 6, 7 הם **באגים ארכיטקטוניים אמיתיים** בהגדרות הסכימה/מודלים, לא ייחודיים ל-Cloud — הם רק צפים בבירור בסביבה נקייה. מומלץ לבחון תיקון בקאנון (ראה §6).

---

## 4. יכולות הסביבה — יתרונות וחסרונות

### 4.1 יתרונות
- **אוטונומיות מלאה (headless):** הרצה, בנייה, בדיקות ו-E2E (כולל computer-use בדפדפן) ללא IDE אינטראקטיבי.
- **רפרודוסביליות + snapshot:** תלויות מערכת ו-DB נשמרים ב-snapshot; שכבת update-script מרעננת תלויות קוד בלבד.
- **פשטות ללא Docker:** Postgres מקומי מבוסס apt מפשט את מחזור ה-DB (אין overhead של docker-in-docker).
- **נתיב סכימה רפרודוסבילי:** בניית ORM עוקפת את ה-DDL השבור ומאפשרת שחזור DB מאפס בפקודות בודדות.
- **אוטומציית git/PR:** יצירת PR, ניהול branch, `gh` read-only לחקירת CI/היסטוריה.
- **ראיות מובנות:** וידאו/צילומי מסך/לוגים כ-artifacts — מתאים ל-Evidence של Seal/PCS.

### 4.2 חסרונות / מגבלות
- **egress מוגבל:** תלוי ב-allowlist; זרימות market-data חיות דורשות אישור דומיינים.
- **ללא systemd/Docker:** אין auto-restart; הפעלת שירותים ידנית; סקריפטי dock-based לא עובדים כמו-שהם.
- **הסתמכות על snapshot למצב DB:** אם ה-snapshot נמחק, נדרשת בנייה מחדש (מתועדת) — אין DB מנוהל חיצוני.
- **Quality Gate לא אוטומטי:** pre-commit לא מותקן; כלי אבטחה/פורמט לא מותקנים כברירת מחדל.
- **secrets ידניים:** מפתחות נדרשים מוזרקים דרך פאנל ה-Secrets (לא נשמרים ב-repo).

---

## 5. אימות "Hello-World" (ראיה end-to-end)

זרימה: `localhost:8080/login` → התחברות `TikTrackAdmin`/`4181` → dashboard → עמוד ניהול חשבונות מסחר → יצירת "UI Demo Account" (Charles Schwab, $25,000, USD) → החשבון מופיע ברשימה ונשמר ל-`user_data.trading_accounts` (אומת ב-`SELECT`). ראיות (וידאו + צילומי מסך) צורפו ל-PR #135.

---

## 6. המלצות שילוב לבחינת Team 100

### 6.1 קצר טווח
| # | פעולה | בעלים מוצע |
|---|--------|-----------|
| 1 | לברך רשמית את נתיב **בניית הסכימה מ-ORM** ל-dev (או להוציא DDL v2.7 מתוקן) — לתעד כ-SSOT לבניית DB מקומית | Team 100 + Team 20/21 |
| 2 | לשקול הוספת migration טבלת `admin_data.job_run_log` ו/או מודל ORM, כדי למנוע שגיאות רקע | Team 20 |
| 3 | להשלים ב-`api/models/__init__.py` ייבוא כל המודלים (notes/alerts/notifications/feature_flags) לעקביות עם `create_all` | Team 20 |

### 6.2 בינוני/ארוך טווח
| # | פעולה | בעלים מוצע |
|---|--------|-----------|
| 4 | **רישום קאנוני של סוג הסביבה/engine החדש** (Cursor Cloud Agent — headless) ב-`TEAM_TAXONOMY` / `TEAMS_ROSTER` — ראה בקשת ההקמה ל-Team 120 | Team 100 + Team 170 |
| 5 | **מדיניות רשת (egress allowlist):** הגדרת דומייני market-data מותרים לצורך בדיקות live | Team 100 + Team 61 |
| 6 | **ולידציה חוצת-מנועים (Iron Rule #1):** Cloud Agent (cursor) בונה; ולידטור על engine שונה (codex/claude) — לאמץ כברירת מחדל לסביבה זו | Team 90 / 190 |
| 7 | לאמץ את הפרדת התפקידים: **update-script = רענון תלויות מינימלי** / **AGENTS.md = הוראות עמידות** | Team 61 (בוצע) |

---

## 7. רפרנסים (תיעוד ודוקומנטציה)

- `AGENTS.md` → `## Cursor Cloud specific instructions` (עודכן: Postgres מקומי, `pg_ctlcluster`, מתכון בנייה מחדש)
- PR: **WaldNimrod/TikTrack#135** — branch `cursor/dev-environment-setup-31ad`
- `scripts/dev_bootstrap_schema.sql`, `scripts/dev_build_schema_from_orm.py` (חדשים)
- `documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.6_FULL_DDL.sql` (ה-DDL השבור)
- `scripts/migrations/g7_M005_job_run_log.sql`, `g7_M005b_job_run_log_extended.sql`
- `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md` (Known Bugs KB-001..KB-021)
- `documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md`
- `_COMMUNICATION/team_61/TEAM_61_AOS_V3_LOCAL_DATABASE_SETUP_GUIDE_v1.0.0.md` (עבודת env קודמת, דומיין AOS)
- קאנון צוותים: `TEAM_TAXONOMY_v1.0.1.md`, `TEAMS_ROSTER_v1.0.0.json`, `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md`, `.cursorrules`

> **הערה על scope:** ההקמה מוקדה למוצר TikTrack (branch `main`). **AOS v3** מחוץ ל-scope כאן — track נפרד ב-branch `aos-v3` עם DB מבודד (`AOS_V3_DATABASE_URL`).

---

## 8. מסקנה ובקשה

סביבת ה-Cursor Cloud Agent הוכיחה יכולת להריץ ולבדוק את מלוא מחסנית TikTrack end-to-end, ובד-בבד חשפה שלושה באגים ארכיטקטוניים אמיתיים בהגדרות הסכימה. **Team 61 מבקש מ-Team 100** לבחון את המלצות §6, ובפרט את רישום סוג הסביבה/engine החדש בקאנון ואת נתיב הסכימה המבורך. בקשת ההקמה התפעולית המלאה (סביבה + משילות + מפתחות) נשלחה במקביל ל-Team 120 (ראה מסמך מקושר).

---

**log_entry | TEAM_61 | CURSOR_CLOUD_ENVIRONMENT_REPORT_TO_TEAM_100_CREATED | ACTIVE | 2026-07-07**
