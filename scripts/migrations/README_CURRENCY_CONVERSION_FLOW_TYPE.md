# Migration: Add CURRENCY_CONVERSION flow_type

**מטרה:** מזהה ברור להמרת מטבע — לא להשתמש ב-OTHER.

## הרצה

**דרוש:** משתמש DB עם הרשאות ALTER TABLE (בעלים או SUPERUSER).

```bash
# אופציה 1: Python (משתמש DATABASE_URL מ-api/.env)
python3 scripts/run_currency_conversion_migration.py

# אופציה 2: psql
psql $DATABASE_URL -f scripts/migrations/add_currency_conversion_flow_type.sql
```

## אחרי המיגרציה

להריץ seed מחדש:
```bash
python3 scripts/reduce_admin_base_to_minimal.py
python3 scripts/seed_base_test_user.py --force
```
