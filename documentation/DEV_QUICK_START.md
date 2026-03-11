# TikTrack Phoenix — הוראות סביבת פיתוח (Quick Start)

## מצב נוכחי (נבדק עכשיו)

| רכיב | כתובת | סטטוס |
|------|-------|--------|
| PostgreSQL (Docker) | `localhost:5432` | ✅ רץ (`tiktrack-postgres-dev`) |
| Backend (FastAPI) | http://localhost:8082 | ✅ רץ |
| Frontend (Vite) | http://localhost:8080 | ✅ רץ |
| AUTO-WP003-05 (market_cap) | — | ✅ PASS |

---

## מה להריץ — סדר פעולות מומלץ

### 1. הפעלת התשתית (אם הכל כבוי)

```bash
# Postgres — הפעלת המכולה (אם Docker רץ)
docker start tiktrack-postgres-dev

# שרתים — Backend + Frontend (מחכה ל-DB אוטומטית)
bash scripts/restart-all-servers.sh
```

הסקריפט `restart-all-servers.sh`:
- מפעיל את `tiktrack-postgres-dev` אם הוא כבוי
- מחכה עד 60 שניות ל־PostgreSQL
- עוצר ומפעיל מחדש Backend (8082) ו־Frontend (8080)

### 2. אימות AUTO-WP003-05 (market_cap)

```bash
python3 scripts/verify_g7_prehuman_automation.py
```

אם נכשל על `market_cap null` (בגלל Yahoo 429):

```bash
python3 scripts/backfill_market_cap_auto_wp003_05.py --manual ANAU.MI=1440000000
```

---

## כתובות שימושיות

| מטרה | כתובת |
|------|--------|
| אפליקציה בדפדפן | http://localhost:8080 |
| API Docs (Swagger) | http://localhost:8082/docs |
| Health Check | http://localhost:8082/health |

---

## Docker — פקודות עיקריות

| פעולה | פקודה |
|--------|-------|
| בדיקת Postgres | `docker ps \| grep tiktrack-postgres` |
| הפעלת Postgres | `docker start tiktrack-postgres-dev` |
| עצירת Postgres | `docker stop tiktrack-postgres-dev` |
| הרצה מחדש | `docker restart tiktrack-postgres-dev` |

---

## מי מנהל מה

- **תשתית (Docker, Postgres, שרתים)**: האינטגרציה רצה את הסקריפטים אוטומטית לפי הצורך.
- **אין צורך להריץ ידנית** — אלא אם מתבקש או אם משהו נכשל.
