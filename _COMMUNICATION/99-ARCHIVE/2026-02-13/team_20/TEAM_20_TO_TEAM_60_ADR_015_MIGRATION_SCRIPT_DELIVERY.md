# Team 20 → Team 60: מסירת סקריפט מיגרציה ADR-015

**מאת:** Team 20 (Backend)  
**אל:** Team 60 (DevOps & Platform)  
**תאריך:** 2026-02-12  
**הקשר:** `TEAM_60_TO_TEAM_20_ADR_015_MIGRATION_SCRIPT_REQUEST.md`  
**סטטוס:** ✅ **סקריפט מוכן — להרצה**

---

## 1. מיקום הסקריפט

| פריט | נתיב |
|------|------|
| **סקריפט SQL** | `scripts/migrations/adr_015_brokers_fees_trading_account_id.sql` |
| **תיעוד הרצה** | `scripts/migrations/README_ADR_015_MIGRATION.md` |

---

## 2. תוכן המיגרציה

- הוספת `trading_account_id` (FK ל־trading_accounts)
- מילוי: התאמה לפי (user_id, broker) → חשבון מסחר (ראשון לפי created_at)
- אין התאמה: מחיקת רשומת עמלה + NOTICE
- הסרת עמודת `broker`
- NOT NULL על `trading_account_id`
- Idempotent: אם `broker` כבר הוסר — חריגה `ADR_015_ALREADY_APPLIED` (חשבו כהצלחה)

---

## 3. נוהל הרצה (לפי בקשתכם)

### שלב 1: גיבוי
```bash
python3 scripts/create_full_backup.py
```

### שלב 2: הרצת מיגרציה
```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f scripts/migrations/adr_015_brokers_fees_trading_account_id.sql
```

או:
```bash
docker exec -i <postgres_container> psql -U postgres -d <db_name> < scripts/migrations/adr_015_brokers_fees_trading_account_id.sql
```

### שלב 3: אימות
- בדיקת מבנה: `\d user_data.brokers_fees` — `trading_account_id` קיים, `broker` חסר

---

## 4. הערות

- **commission_value:** כבר NUMERIC(20,6) — הסקריפט דולג על המרה אם אינו VARCHAR.
- **מצב DB:** 8 שורות — מיגרציה תצליח אם לכל עמלה יש חשבון מסחר תואם (אותו user + broker).

---

## 5. צעדים הבאים

- **Team 60:** גיבוי → הרצה → אימות → דיווח ל־Team 10 ו־Team 20.
- **Team 20:** מודל/API כבר מעודכנים; פעיל לאחר סיום המיגרציה.

---

**Team 20 (Backend)**  
**log_entry | ADR_015 | MIGRATION_SCRIPT_DELIVERED | TO_TEAM_60 | 2026-02-12**
