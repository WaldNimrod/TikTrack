# User Tickers QA — DB Connection Checklist

**מטרה:** תיקון `DATABASE_ERROR` / "Database connection failed" לפני הרצת בדיקות QA.

---

## 1. וידוא PostgreSQL / Docker

```bash
# רשימת containers
docker ps

# חיפוש postgres
docker ps | grep postgres
```

**אם אין container:** יש להריץ את ה-Postgres (לפי הגדרת הפרויקט, למשל `tiktrack-postgres-dev`).

---

## 2. בדיקת api/.env

```bash
# קובץ חייב להיות קיים
test -f api/.env && echo "OK" || echo "חסר — העתק מ-api/.env.example"

# וידוא DATABASE_URL
grep DATABASE_URL api/.env
```

**דוגמה תקינה:**
```
DATABASE_URL=postgresql://tiktrack:yourpass@localhost:5432/TikTrack-phoenix-db
# או postgresql+asyncpg://... ל-Backend
```

**חשוב:** Host/port/username/password/database חייבים להתאים ל-container שרץ.

---

## 3. בדיקת חיבור ישיר

```bash
# אם יש psql
psql "$(grep DATABASE_URL api/.env | cut -d= -f2 | tr -d \"')" -c "SELECT 1"

# או דרך Docker (אם ה-container שם tiktrack-postgres-dev)
docker exec -it tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db -c "SELECT 1"
```

---

## 4. אתחול / migrations (אם צריך)

```bash
# Migrations (לפני QA)
make migrate-p3-020   # user_tickers + tickers.status
make migrate-p3-021   # exchanges, sectors, industries, market_cap_groups (חובה ל-POST /me/tickers)

# Seed לטסט
make db-base-seed
```

---

## 5. הפעלת Backend מחדש

```bash
# עצור את ה-Backend אם רץ
# הרץ מחדש (לפי איך שמפעילים — uvicorn / make run-api וכו')
cd api && uvicorn main:app --host 0.0.0.0 --port 8082
```

---

## 6. Bypass (כש־Providers לא זמינים)

אם `ALPHA_VANTAGE_API_KEY` חסר ו־Yahoo נכשל — הוסף ל־`api/.env`:
```
SKIP_LIVE_DATA_CHECK=true
```
**אזהרה:** רק dev/QA — **אסור** ב־production. מאפשר ל־POST /me/tickers לעבור בלי fetch חיים.

---

## 7. הרצת QA

```bash
bash scripts/run-user-tickers-qa-api.sh
```

**מצופה:** ✅ POST (AAPL מניה) → 201 או 409

---

**אחרי שתתקן:** הרץ את הבדיקות שוב. אם עדיין נכשל — בדוק את ה-logs של ה-Backend.
