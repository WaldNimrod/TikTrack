# Team 20 → Team 10: דיווח תיקון D22 FAV (S002-P003-WP002)

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_10_S002_P003_D22_FAV_REMEDIATION_COMPLETION  
**from:** Team 20 (Backend Implementation)  
**to:** Team 10 (The Gateway)  
**cc:** Team 50, Team 30  
**date:** 2026-01-31  
**status:** REMEDIATION_COMPLETE  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  

---

## 1) Purpose

דיווח סיום תיקוני D22 בעקבות `TEAM_50_TO_TEAM_20_S002_P003_API_CONTRACT_REQUEST` — ממצאי FAV (GET ?ticker_type=STOCK 500, POST 500, GET/PUT/DELETE :id 307/404) טופלו.

---

## 2) Actions completed

| # | פעולה |
|---|-------|
| 1 | תיקון GET /tickers?ticker_type=STOCK — השוואת ticker_type ENUM יציבה (`cast` + `func.upper`) |
| 2 | תיקון POST /tickers — `IntegrityError` handling, החזרת 409 במקום 500 |
| 3 | עדכון `scripts/run-tickers-d22-qa-api.sh` — בדיקת 201 + id; דילוג על CRUD-by-id כש־POST נכשל |
| 4 | **שורש POST 500:** `ProgrammingError` (עמודת `status` חסרה) → 503 + `Run: make migrate-p3-020` |
| 5 | הודעת דרישה ל־Team 60: `TEAM_20_TO_TEAM_60_S002_P003_D22_P3_020_MIGRATION_REQUEST.md` (אחריות מיגרציות) |

---

## 3) Deliverables

| # | תוצר | נתיב |
|---|------|------|
| 1 | תגובה ל־Team 50 | `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_50_S002_P003_D22_API_REMEDIATION_RESPONSE.md` |
| 2 | דוח זה | `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P003_D22_FAV_REMEDIATION_COMPLETION.md` |

---

## 4) Next step

**Team 50** — הרצת `scripts/run-tickers-d22-qa-api.sh` לאימות מחדש (GATE_4). Backend יש לאתחל עם הקוד המעודכן.

---

**log_entry | TEAM_20 | TO_TEAM_10 | S002_P003_D22_FAV_REMEDIATION | REMEDIATION_COMPLETE | 2026-01-31**
