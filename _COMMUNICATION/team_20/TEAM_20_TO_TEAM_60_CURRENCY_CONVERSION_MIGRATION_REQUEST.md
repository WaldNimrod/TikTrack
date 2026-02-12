# Team 20 → Team 60: בקשת הרצת מיגרציה — CURRENCY_CONVERSION flow_type

**מאת:** Team 20 (Backend)  
**אל:** Team 60 (DevOps & Platform)  
**תאריך:** 2026-02-12  
**הקשר:** מזהה ברור להמרת מטבע — לא להשתמש ב-OTHER  
**סטטוס:** 📋 **REQUEST — ממתין לביצוע**

---

## 1. סיכום בקשה

Team 20 מבקש מ-Team 60:

1. **גיבוי DB** מלא לפני מיגרציה  
2. **הרצת מיגרציה** — הוספת `CURRENCY_CONVERSION` ל-flow_type CHECK בטבלת cash_flows  
3. **אימות** — בדיקת מבנה  
4. **הרצת seed** — `python3 scripts/reduce_admin_base_to_minimal.py` ו-`python3 scripts/seed_base_test_user.py --force` (לעדכון נתוני דוגמה)  
5. **דיווח** ל-Team 10 ו-Team 20 לאחר השלמה

---

## 2. מיקום הסקריפט

| פריט | נתיב |
|------|------|
| **סקריפט SQL** | `scripts/migrations/add_currency_conversion_flow_type.sql` |
| **תיעוד הרצה** | `scripts/migrations/README_CURRENCY_CONVERSION_FLOW_TYPE.md` |
| **סקריפט Python** | `scripts/run_currency_conversion_migration.py` (חלופה ל-psql) |

---

## 3. תוכן המיגרציה

- DROP CONSTRAINT `cash_flows_flow_type_check` (אם קיים)
- ADD CONSTRAINT עם: DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEE, OTHER, **CURRENCY_CONVERSION**
- COMMENT על עמודת flow_type

---

## 4. נוהל ביצוע

### שלב 1: גיבוי

```bash
make db-backup
# או: python3 scripts/create_full_backup.py
```

### שלב 2: הרצת מיגרציה

**דרוש:** משתמש DB עם הרשאות ALTER TABLE (בעלים או SUPERUSER).

```bash
# אופציה א': Python
python3 scripts/run_currency_conversion_migration.py

# אופציה ב': psql
psql $DATABASE_URL -f scripts/migrations/add_currency_conversion_flow_type.sql
```

### שלב 3: אימות

```sql
-- וידוא שה-constraint מכיל CURRENCY_CONVERSION
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'user_data.cash_flows'::regclass 
  AND conname = 'cash_flows_flow_type_check';
```

### שלב 4: הרצת seed (עדכון נתוני דוגמה)

```bash
python3 scripts/reduce_admin_base_to_minimal.py
python3 scripts/seed_base_test_user.py --force
```

### שלב 5: דיווח

דיווח ל-Team 10 ו-Team 20 — מיגרציה הושלמה. Team 10 ישלח בקשת QA ל-Team 50.

---

## 5. במקרה כישלון

| מצב | פעולה |
|-----|-------|
| **must be owner of table** | להריץ עם משתמש DB עם הרשאות (בעלים/Superuser) |
| **constraint name שונה** | דיווח ל-Team 20 — נדרש עדכון סקריפט |

---

**log_entry | TEAM_20 | CURRENCY_CONVERSION_MIGRATION_REQUEST | TO_TEAM_60 | 2026-02-12**
