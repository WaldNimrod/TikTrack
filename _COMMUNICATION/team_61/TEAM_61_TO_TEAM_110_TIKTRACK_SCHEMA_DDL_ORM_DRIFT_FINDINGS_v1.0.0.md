# Team 61 → Team 110 — ממצאים ארכיטקטוניים בדומיין TikTrack: סחף DDL↔ORM ובאגי הגדרת סכימה שהתגלו בהקמת סביבת Cursor Cloud

**date:** 2026-07-23
**historical_record:** true
**id:** TEAM_61_TO_TEAM_110_TIKTRACK_SCHEMA_DDL_ORM_DRIFT_FINDINGS
**version:** 1.0.0
**owner:** Team 61 (Cloud Agent / DevOps Automation — Cursor Cloud Agent platform)
**addressee:** Team 110 (TikTrack Domain Architect — IDE, domain_architect)
**cc:** Team 100 (Chief System Architect / R&D), Team 20 (Backend Implementation), Team 170 (Spec & Governance)
**project_domain:** tiktrack
**status:** ACTIVE — דוח ממצאים + בקשת החלטת אדריכלות דומיין
**related:** `TEAM_61_TO_TEAM_100_CURSOR_CLOUD_ENVIRONMENT_REPORT_v1.0.0.md`, PR WaldNimrod/TikTrack#135

---

## 0. תקציר מנהלים

בהקמת סביבת ה-Cursor Cloud Agent עבור TikTrack נחשפו **ארבעה ליקויים ארכיטקטוניים אמיתיים בהגדרת סכימת הדומיין** — לא בעיות סביבה, אלא **סחף (drift) בין שני מקורות אמת**: ה-DDL הקנוני (`documentation/docs-system/02-SERVER/`) מול מודלי ה-ORM (`api/models/`). כתוצאה, **אף אחד** משני המקורות אינו יכול לבנות את הסכימה לבדו:
- ה-**DDL** נכשל ב-`psql` (שגיאות תחביר).
- ה-**ORM** נכשל ב-`create_all` (רינדור `server_default` שגוי + partial index שגוי + טבלאות חסרות מודל).

Team 61 עקף זאת ב-dev באמצעות בנייה מ-ORM עם עקיפות runtime (ראה §4), אך זהו תיקון סביבה — **לא** פתרון לשורש. מסמך זה מפרט את הליקויים עם רפרנסים מדויקים ברמת קובץ:שורה ומבקש מ-Team 110 החלטת אדריכלות דומיין (§5).

> **הבהרת סמכות:** Team 61 (devops) אינו כותב קוד ייצור של הדומיין ואינו מבצע קידום קנוני. זהו דוח ממצאים + בקשת החלטה; התיקון בפועל ינותב ל-Team 20 (Backend) תחת אדריכלות Team 110.

---

## 1. הבעיה השורשית — שני מקורות אמת ללא reconciliation

| מקור אמת | נתיב | סטטוס בפועל |
|-----------|------|-------------|
| DDL קנוני | `documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.6_FULL_DDL.sql` | לא מתחיל נקי ב-`psql` |
| ORM models | `api/models/*.py` | `create_all` נכשל ללא עקיפות |
| מיגרציות נקודתיות | `scripts/migrations/g7_M005*` | מכסות חלק (job_run_log) — לא משולב |

**אין framework מיגרציות (Alembic) שמסנכרן ORM↔DB.** התוצאה: כל שינוי סכימה מתועד ידנית בשני מקומות שנוטים להתפצל. זהו שורש הליקויים בסעיפים 2–3.

---

## 2. באגי הגדרת סכימה ב-ORM (חוסמים `create_all`)

### 2.1 רינדור `server_default` שגוי ל-JSONB (7 מודלים) — חומרה: גבוהה
המודלים מגדירים `server_default="'{}'::JSONB"` כמחרוזת פייתון פשוטה. SQLAlchemy עוטף מחרוזת פשוטה כליטרל מצוטט ומייצר SQL שבור: `DEFAULT '''{}''::JSONB'` → `invalid input syntax for type json`.

| קובץ:שורה | עמודה |
|-----------|--------|
| `api/models/alerts.py:131` | metadata |
| `api/models/cash_flows.py:89` | metadata |
| `api/models/market_reference.py:42` | metadata |
| `api/models/notes.py:97` | metadata |
| `api/models/tickers.py:95` | metadata |
| `api/models/trades.py:151` | metadata |
| `api/models/trading_accounts.py:104` | metadata |

**תיקון מומלץ:** `server_default=text("'{}'::JSONB")` (ייבוא `from sqlalchemy import text`).
**הערה:** `api/models/identity.py:118/256/296` משתמשים ב-`server_default="{}"` — זה **תקין** (ליטרל `'{}'` חוקי כ-JSON), אין לגעת.

### 2.2 Partial index עם ביטוי שגוי — חומרה: גבוהה
`api/models/identity.py:225` (אינדקס `user_api_keys_unique_user_provider`):
```python
postgresql_where=func.deleted_at.is_(None),
```
`func.deleted_at` נבנה כ-**קריאת פונקציה** ומרונדר `WHERE deleted_at.is(NULL)` → PostgreSQL מפרש `deleted_at` כ-schema/טבלה → `InvalidSchemaName: schema "deleted_at" does not exist`.

**השלכה:** ה-partial UNIQUE index (חוק ייחודיות עסקי אמיתי: מפתח API ייחודי per user+provider כאשר `deleted_at IS NULL`) **אינו ניתן לבנייה** דרך ORM. ב-dev דילגנו על standalone indexes — כלומר החוק הזה **חסר** ב-DB המקומי.
**תיקון מומלץ:** `postgresql_where=text("deleted_at IS NULL")` (או שימוש ב-column attribute הממופה, לא `func.`).

---

## 3. טבלאות בשימוש ה-runtime שחסר להן מודל ORM

### 3.1 `market_data.external_data_providers` — חומרה: בינונית
מופנית ב-FK מ-`market_data.ticker_prices.provider_id` אך **אין לה מודל** ב-`api/models/`. `create_all` נכשל ב-`NoReferencedTableError`. קיימת רק ב-DDL. ב-dev נוצרה ידנית (`scripts/dev_bootstrap_schema.sql`).

### 3.2 `admin_data.job_run_log` — חומרה: בינונית
בשימוש ע"י ה-APScheduler background jobs (`scripts/check_alert_conditions.py`) אך אין לה מודל ORM **וגם אינה ב-DDL הראשי** — רק במיגרציה `scripts/migrations/g7_M005_job_run_log.sql`. ללא יצירתה, ה-backend רושם `UndefinedTableError` כל 15 דקות (נצפה בלוג ה-lifespan).

### 3.3 ייבוא חלקי ב-`api/models/__init__.py` — חומרה: נמוכה
`__init__.py` מייבא רק תת-קבוצה של המודלים; המודלים `notes`, `alerts`, `notification`, `feature_flags` קיימים אך אינם מיובאים → אינם ב-`Base.metadata` כברירת מחדל, ולכן `create_all` לא ייצור אותם ללא ייבוא מפורש.

---

## 4. העקיפה הזמנית ב-dev (Team 61) — לא פתרון שורש

`scripts/dev_build_schema_from_orm.py` בונה את הסכימה מ-ORM עם עקיפות **runtime בלבד** (ללא שינוי מודלים):
1. עוטף `server_default` שהוא SQL גולמי ב-`text()` (עוקף §2.1).
2. מדלג על כל standalone indexes (עוקף §2.2 — אך **מוותר** על ה-partial UNIQUE של §2.2).
3. `scripts/dev_bootstrap_schema.sql` יוצר enums + `external_data_providers` (§3.1); מיגרציית `g7_M005*` יוצרת `job_run_log` (§3.2); ה-script מייבא את כל המודלים (§3.3).

**המחיר:** ה-DB המקומי **חסר** את ה-partial unique index של §2.2 ואת שאר האינדקסים לביצועים. מקובל ל-dev, **לא** ל-production.

---

## 5. בקשת החלטת אדריכלות דומיין (Team 110)

| # | החלטה נדרשת | בעלים מבצע מוצע |
|---|--------------|-----------------|
| 1 | לבחור **מקור אמת יחיד** לסכימת TikTrack: (א) ORM כ-SSOT + הפקת DDL ממנו, או (ב) DDL כ-SSOT + מודלים נגזרים. ההמלצה: **ORM כ-SSOT + Alembic** | Team 110 → Team 20 |
| 2 | לתקן את 7 באגי §2.1 (`server_default=text(...)`) ואת §2.2 (partial index) במודלים | Team 20 |
| 3 | להוסיף מודלי ORM ל-`external_data_providers` ו-`job_run_log` (§3.1–3.2) או להגדירם רשמית כ-DDL-only מנוהל | Team 110 → Team 20 |
| 4 | להשלים ייבוא כל המודלים ב-`api/models/__init__.py` (§3.3) | Team 20 |
| 5 | להוציא **DDL v2.7 מתוקן** או לברך את נתיב בניית ה-ORM כ-SSOT ל-dev/CI | Team 110 + Team 170 |
| 6 | לאמץ Alembic למיגרציות (מונע drift חוזר) | Team 110 → Team 20 |

> **ולידציה חוצת-מנועים (Iron Rule #1 + user rule "team_110 default"):** builder engine ≠ validator engine. תיקוני §2 שייבנו (Cursor) חייבים ולידציה ע"י Team 90/validator על engine שונה (Codex/Claude): reproduce של `create_all`, vitest/eslint רלוונטיים, ובדיקת ה-partial unique index.

---

## 6. רפרנסים (תיעוד ודוקומנטציה)

- קוד מקור (ממצאים): `api/models/alerts.py`, `cash_flows.py`, `market_reference.py`, `notes.py`, `tickers.py`, `trades.py`, `trading_accounts.py` (§2.1); `api/models/identity.py:225` (§2.2); `api/models/__init__.py` (§3.3)
- DDL: `documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.6_FULL_DDL.sql`
- מיגרציה: `scripts/migrations/g7_M005_job_run_log.sql`, `g7_M005b_job_run_log_extended.sql`
- עקיפות dev: `scripts/dev_bootstrap_schema.sql`, `scripts/dev_build_schema_from_orm.py`
- runtime: `api/core/database.py` (הוספת `+asyncpg`), `scripts/check_alert_conditions.py` (צרכן `job_run_log`)
- Known Bugs: `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md`, `documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md`
- קאנון תפקידים: `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md`, `TEAM_TAXONOMY_v1.0.1.md`; `AGENTS.md`
- דוחות מלווים: `TEAM_61_TO_TEAM_100_CURSOR_CLOUD_ENVIRONMENT_REPORT_v1.0.0.md`; PR **WaldNimrod/TikTrack#135**

---

## 7. מסקנה ובקשה

הליקויים בסעיפים 2–3 הם **חוב טכני ארכיטקטוני בדומיין TikTrack** שנחשף בבירור בסביבה נקייה: סחף בין DDL ל-ORM ללא reconciliation, שני באגי הגדרה חוסמי-`create_all`, ושתי טבלאות ללא מודל. Team 61 מבקש מ-Team 110 להכריע על מקור אמת יחיד (§5.1) ולנתב את התיקונים ל-Team 20 תחת ולידציה חוצת-מנועים. Team 61 זמין לספק reproduction מלא ב-Cloud ולאמת את התיקון end-to-end.

---

**--- PHOENIX TASK SEAL ---**
**TASK_ID:** TEAM_61_TIKTRACK_SCHEMA_DDL_ORM_DRIFT_FINDINGS
**STATUS:** OPEN — awaiting Team 110 domain-architecture decision (§5)
**FILES_MODIFIED:**
  - `_COMMUNICATION/team_61/TEAM_61_TO_TEAM_110_TIKTRACK_SCHEMA_DDL_ORM_DRIFT_FINDINGS_v1.0.0.md`
**PRE_FLIGHT:** N/A (communication artifact — לא קוד ייצור)
**HANDOVER_PROMPT:** "Team 110: נחשפו 4 ליקויי סכימה בדומיין TikTrack (סחף DDL↔ORM). נדרשת החלטת SSOT (§5.1) וניתוב תיקוני §2–3 ל-Team 20 תחת ולידציה חוצת-מנועים. reproduction מלא זמין ב-PR #135."

**log_entry | TEAM_61 | TIKTRACK_SCHEMA_DDL_ORM_DRIFT_FINDINGS_TO_TEAM_110_CREATED | ACTIVE | 2026-07-23**
