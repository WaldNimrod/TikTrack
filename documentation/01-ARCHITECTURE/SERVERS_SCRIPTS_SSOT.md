# Servers & Scripts SSOT — TikTrack Phoenix

**id:** `SERVERS_SCRIPTS_SSOT`  
**owner:** Team 60 (DevOps & Platform)  
**status:** SSOT — מקור אמת יחיד  
**date:** 2026-01-31  
**גרסה:** v1.0

---

## 1. פורטים (Ports)

| שירות | פורט | הערות |
|--------|------|-------|
| **Frontend (Vite)** | 8080 | V2 — Master Blueprint |
| **Backend (FastAPI/Uvicorn)** | 8082 | API + Health |
| **Legacy** | 8081 | אם קיים |
| **PostgreSQL** | 5432 | Docker / local |

---

## 2. סקריפטים — הפעלה ועצירה

### 2.1 Backend (פורט 8082)

| סקריפט | תפקיד | הערות |
|--------|--------|-------|
| `scripts/start-backend.sh` | הפעלת Backend | venv ב־api/; uvicorn עם --reload |
| `scripts/stop-backend.sh` | עצירת Backend | kill על פורט 8082 |
| `scripts/restart-backend.sh` | הפעלה מחדש | stop → sleep 2 → start |

### 2.2 Frontend (פורט 8080)

| סקריפט | תפקיד | הערות |
|--------|--------|-------|
| `scripts/start-frontend.sh` | הפעלת Frontend | npm run dev (Vite); Proxy /api→8082 |
| `scripts/stop-frontend.sh` | עצירת Frontend | kill על פורט 8080 |

### 2.3 שניהם יחד

| סקריפט | תפקיד | הערות |
|--------|--------|-------|
| `scripts/restart-all-servers.sh` | הפעלה מחדש של שני השרתים | stop→start (רקע)+המתנה לזמינות |
| `scripts/init-servers-for-qa.sh` | איתחול QA | stop→start backend (רקע)→start frontend (רקע); מחכה לזמינות |
| `scripts/init-full-env.sh` | איתחול סביבה מלא | Docker Postgres + restart servers |

---

## 3. סקריפטים — אבחון ועזר

| סקריפט | תפקיד |
|--------|--------|
| `scripts/check-ports.sh` | בדיקת פורטים 8080, 8082, 8081 |
| `scripts/fix-port-8082.sh` | שחרור פורט 8082 (דיאלוג) |

---

## 4. סקריפטים — משתמשים ו־Admin

| סקריפט | תפקיד | הערות |
|--------|--------|-------|
| `scripts/create-admin.sh` | יצירת משתמש admin | מריץ api/scripts/create_admin_user.py; admin/418141 |

---

## 5. סקריפטים — מסד נתונים

| סקריפט / Make | תפקיד |
|---------------|--------|
| `docker start tiktrack-postgres-dev` | הפעלת PostgreSQL |
| `make db-backup` | גיבוי DB מלא |
| `make db-backup-then-fill` | גיבוי + seed נתוני טסט |
| `make db-test-clean` | ניקוי נתוני טסט |
| `make db-test-fill` | מילוי נתוני טסט |
| `make db-base-seed` | seed בסיסי ל־test_user |
| `make migrate-p3-020` | P3-020 user_tickers (דורש Docker) |
| `python3 scripts/seed_qa_test_user.py` | משתמש QA TikTrackAdmin/4181 |
| `python3 scripts/seed_base_test_user.py` | seed בסיס ל־test_user |

---

## 6. סקריפטים — Market Data (Cron/Jobs)

| סקריפט / Make | תפקיד |
|---------------|--------|
| `scripts/run_market_data_job.sh` | Wrapper — טוען .env ומריץ make |
| `make sync-eod` | EOD exchange_rates |
| `make sync-ticker-prices` | EOD ticker_prices |
| `make sync-intraday` | Intraday ticker_prices_intraday |
| `make sync-history-backfill` | Backfill 250d OHLCV |
| `make cleanup-market-data` | Retention + archive |

---

## 7. מיפוי סקריפטים ↔ משימות Cursor (.vscode/tasks.json)

### 7.1 משימה → סקריפט (חד־חד־ערכי)

| משימת Cursor | סקריפט | הערה |
|--------------|--------|------|
| 🚀 Start Backend Server (Port 8082) | `scripts/start-backend.sh` | |
| 🛑 Stop Backend Server | `scripts/stop-backend.sh` | |
| 🔄 Restart Backend Server | `scripts/restart-backend.sh` | |
| 🚀 Start Frontend Dev Server (Port 8080 - V2) | `scripts/start-frontend.sh` | |
| 🛑 Stop Frontend Dev Server | `scripts/stop-frontend.sh` | |
| 🚀 Start All Servers (Backend + Frontend) | `start-backend.sh` + `start-frontend.sh` | dependsOn, parallel |
| 🛑 Stop All Servers | `stop-backend.sh` + `stop-frontend.sh` | dependsOn, parallel |
| 🔄 Restart All Servers | stop→start (composite) | dependsOn, sequence |
| 🌐 Init Full Env (DB + Servers) | `scripts/init-full-env.sh` | קורא ל־restart-all-servers |
| 📋 Init Servers for QA | `scripts/init-servers-for-qa.sh` | |
| 📋 Check Server Status | `scripts/check-ports.sh` | |
| 🔧 Fix Port 8082 Conflict | `scripts/fix-port-8082.sh` | |
| 👤 Create Admin User (admin/418141) | `scripts/create-admin.sh` | |
| 🧪 Run User Tickers QA (API) | `scripts/run-user-tickers-qa-api.sh` | דורש Backend 8082 |
| 🔄 Verify User Tickers Fix (Team 20) | `scripts/verify-user-tickers-fix.sh` | restart + QA — **חובה לפני הגשה** אחרי שינוי קוד |
| ⚙️ Ensure Skip Live Data Check | `scripts/ensure-skip-live-data-check.sh` | dev/QA bypass |

### 7.2 סקריפטים ללא משימה (שימוש ישיר / cron / Make)

| סקריפט | שימוש |
|--------|-------|
| `scripts/restart-all-servers.sh` | נקרא מ־init-full-env.sh |
| `scripts/run_market_data_job.sh` | Cron; `./scripts/run_market_data_job.sh sync-eod` וכו' |
| `scripts/run-smoke-external-data.sh` | tests/package.json |
| `scripts/run-nightly-external-data.sh` | tests/package.json |
| `scripts/sync_market_data_eod.sh` | legacy; מומלץ run_market_data_job.sh |

---

## 8. איתחול סביבה מלא (טעינה מחודשת)

**רצף מומלץ לטעינה מלאה:**

1. **PostgreSQL:** `docker start tiktrack-postgres-dev` (אם כבוי)
2. **עצירת שרתים:** `scripts/stop-backend.sh` + `scripts/stop-frontend.sh`
3. **הפעלת שרתים:** `scripts/start-backend.sh` + `scripts/start-frontend.sh` (או Start All)

**אופציה — QA:** `scripts/init-servers-for-qa.sh` (עצירה + הפעלה ברקע + המתנה)

**אם נדרש איפוס DB:** `make db-backup-then-fill` לפני הפעלת Backend.

---

## 9. חוסרים והמלצות

| נושא | סטטוס |
|------|--------|
| **Restart All Servers** | ✅ נוסף — משימה + restart-all-servers.sh |
| **Full Init (DB+Servers)** | ✅ נוסף — init-full-env.sh + משימת Cursor |
| **אימות .env** | start-backend טוען מ־api/.env דרך config; אין בדיקה מפורשת |
| **venv location** | api/venv (סקריפטים מניחים) |

---

**log_entry | TEAM_60 | SERVERS_SCRIPTS_SSOT | v1.0 | 2026-01-31**
