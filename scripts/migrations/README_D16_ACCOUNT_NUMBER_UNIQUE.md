# מיגרציה D16 — UNIQUE account_number
**project_domain:** TIKTRACK

**מקור:** TEAM_30_TO_TEAM_20_VALIDATION_COORDINATION_REQUEST.md  
**סקריפט:** `adr_trading_accounts_account_number_unique.sql`

---

## 1. מטרה

הוספת UNIQUE index על `(user_id, account_number)` — ייחודיות מספר חשבון למשתמש (D16).

---

## 2. הרצה (Team 60)

### תנאי מקדימה
- גיבוי DB: `python3 scripts/create_full_backup.py`
- אימות: אין כפילויות account_number (אם יש — הסקריפט יכשל)

### פקודה
```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f scripts/migrations/adr_trading_accounts_account_number_unique.sql
```

או דרך `docker exec`:
```bash
docker exec -i <postgres_container> psql -U <user> -d <db> < scripts/migrations/adr_trading_accounts_account_number_unique.sql
```

### Idempotency
`CREATE UNIQUE INDEX IF NOT EXISTS` — הרצה חוזרת לא תכשל.

---

## 3. אימות לאחר הרצה

```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'trading_accounts' 
  AND indexname = 'idx_trading_accounts_user_account_number_unique';
```

תוצאה צפויה: שורה אחת עם שם ה-index.

---

## 4. כפילויות

אם יש רשומות עם account_number כפול — הסקריפט יזרוק:
`ADR_TRADING_ACCOUNTS_DUPLICATE_ACCOUNT_NUMBERS`

נדרש טיפול ידני לפני הרצה.

---

**בקשה מלאה:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_60_D16_VALIDATION_MIGRATION_REQUEST.md`
