# Team 20 → Team 60 | דרישת מיגרציה p3_021 — D22 Tickers FK (S002-P003-WP002)

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_60_S002_P003_D22_P3_021_MIGRATION_REQUEST  
**from:** Team 20 (Backend Implementation)  
**to:** Team 60 (DevOps & Platform)  
**cc:** Team 10, Team 50  
**date:** 2026-02-26  
**status:** ACKNOWLEDGED — TEAM_60_TO_TEAM_20_S002_P003_D22_P3_021_MIGRATION_RESPONSE_v1.0.0  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  

---

## 1) מטרה

דרישה רשמית להרצת **migration p3_021** — תנאי להשלמת D22 FAV (POST /tickers). ללא המיגרציה, ה־FK ב־`tickers.exchange_id` נכשל: `NoReferencedTableError: Foreign key associated with column 'tickers.exchange_id' could not find table 'market_data.exchanges'`.

---

## 2) רקע

| פריט | פרטים |
|------|--------|
| **בעיה** | POST /tickers מחזיר 500 |
| **סיבה** | טבלת `market_data.exchanges` חסרה — `tickers.exchange_id` מפנה אליה |
| **מקור** | TEAM_50_TO_TEAM_20_S002_P003_D22_FAV_REVALIDATION_RESPONSE §3.6 (שגיאה הופקה עם DEBUG=true) |
| **p3_020** | הורצה בהצלחה; p3_021 חסר — יוצר exchanges, sectors, industries, market_cap_groups |

---

## 3) דרישה מ-Team 60

### 3.1 הרצת המיגרציה

**פקודה:**
```bash
make migrate-p3-021
```

**קובץ:** `scripts/migrations/p3_021_market_data_reference_tables.sql`  
**תוכן:** יצירת `market_data.exchanges`, `market_data.sectors`, `market_data.industries`, `market_data.market_cap_groups` + seed.

**אידמפוטנטי:** `CREATE TABLE IF NOT EXISTS` + `ON CONFLICT DO NOTHING`.

### 3.2 אופציונלי — אינטגרציה ב־fix-env-after-restart.sh

כדי שסביבת FAV תהיה מוכנה אחרי restart — מומלץ להוסיף הרצת `make migrate-p3-021` (אחרי p3_020, לפני Restart Backend).  
**החלטה:** Team 60.

---

## 4) אימות אחרי המיגרציה

1. הרצת `scripts/fix-env-after-restart.sh` (או restart Backend)
2. הרצת `scripts/run-tickers-d22-qa-api.sh` — **7/7** אמורות לעבור
3. POST /tickers → 201 + id בתשובה

---

## 5) רפרנסים

- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_20_S002_P003_D22_FAV_REVALIDATION_RESPONSE.md` (§3.6)
- `documentation/reports/05-REPORTS/artifacts/USER_TICKERS_QA_DB_CHECKLIST.md`
- `scripts/migrations/p3_021_market_data_reference_tables.sql`

---

## 6) תולדה

**תשובת Team 60 (רשמי):** _COMMUNICATION/team_60/TEAM_60_TO_TEAM_20_S002_P003_D22_P3_021_MIGRATION_RESPONSE_v1.0.0.md  

מתועד: `make migrate-p3-021` קיים; המיגרציה נוספה ל־`scripts/fix-env-after-restart.sh` בשלב **[4/7]** (אחרי P3-020, לפני Restart Backend). Team 50 יכול להריץ FAV לאחר אתחול (fix-env) ובדיקה חוזרת — 7/7 אמורות לעבור כולל POST /tickers.

---

**log_entry | TEAM_20 | TO_TEAM_60 | S002_P003_D22_P3_021_MIGRATION_REQUEST | ACKNOWLEDGED | 2026-02-26**
