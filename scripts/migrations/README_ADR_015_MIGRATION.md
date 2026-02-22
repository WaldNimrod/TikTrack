# ADR-015 Migration — brokers_fees → trading_account_id
**project_domain:** TIKTRACK

**מקור:** TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md  
**סקריפט:** `adr_015_brokers_fees_trading_account_id.sql`

---

## 1. מטרה

- הוספת `trading_account_id` (FK ל־trading_accounts)
- הסרת `broker` (broker = מטא-דאטה של חשבון בלבד)
- מיגרציה: התאמה לפי (user_id, broker) → חשבון מסחר

---

## 2. הרצה (Team 60)

### תנאי מקדימה
- גיבוי DB לפני הרצה

### פקודה
```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f scripts/migrations/adr_015_brokers_fees_trading_account_id.sql
```

או דרך `docker exec`:
```bash
docker exec -i <postgres_container> psql -U postgres -d tiktrack_phoenix < scripts/migrations/adr_015_brokers_fees_trading_account_id.sql
```

### Idempotency
אם עמודת `broker` כבר הוסרה — הסקריפט יזרוק חריגה:
`ADR_015_ALREADY_APPLIED: Migration skipped - broker column already removed`

זו הצלחה (מיגרציה כבר הורצה). קוד יציאה יהיה 1 — אין צורך בפעולה נוספת.

---

## 3. מדיניות "אין התאמה"

רשומות עמלה ללא חשבון מסחר תואם — **נמחקות** והודעת NOTICE מתעדת את המספר.

---

## 4. אימות לאחר הרצה

- `trading_account_id` קיים ו־NOT NULL
- עמודת `broker` אינה קיימת
- `commission_value` NUMERIC(20,6)

---

**Team 20 (Backend)**  
**log_entry | ADR_015 | MIGRATION_README | 2026-02-12**
