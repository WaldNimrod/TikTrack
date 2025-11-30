# AI Templates Migration Script

## תיאור
סקריפט להרצת migration של תבניות AI Analysis על כל בסיסי הנתונים:
1. **Development** - בסיס הנתונים של פיתוח
2. **Production** - בסיס הנתונים של פרודקשן
3. **Demo** - בסיס הנתונים של דוגמה

## תהליך
1. ✅ הרצת migration על Development DB
2. ✅ בדיקות תקינות (validation)
3. ✅ אם הכל תקין - הרצה על Production ו-Demo DBs

## שימוש

### הרצה בסיסית
```bash
cd Backend
python3 scripts/update_ai_templates_migration.py
```

### משתני סביבה

הסקריפט משתמש במשתני סביבה הבאים:

#### Development (ברירת מחדל)
- `POSTGRES_HOST` (default: localhost)
- `POSTGRES_PORT` (default: 5432)
- `POSTGRES_DB` (default: TikTrack-db-development)
- `POSTGRES_USER` (default: TikTrakDBAdmin)
- `POSTGRES_PASSWORD` (default: BigMeZoo1974!?)

#### Production
- `POSTGRES_PROD_HOST` (default: localhost)
- `POSTGRES_PROD_PORT` (default: 5432)
- `POSTGRES_PROD_DB` (default: TikTrack-db-production)
- `POSTGRES_PROD_USER` (default: TikTrakDBAdmin)
- `POSTGRES_PROD_PASSWORD` (default: BigMeZoo1974!?)

#### Demo
- `POSTGRES_DEMO_HOST` (default: localhost)
- `POSTGRES_DEMO_PORT` (default: 5432)
- `POSTGRES_DEMO_DB` (default: TikTrack-db-demo)
- `POSTGRES_DEMO_USER` (default: TikTrakDBAdmin)
- `POSTGRES_DEMO_PASSWORD` (default: BigMeZoo1974!?)

### דוגמה עם משתני סביבה מותאמים
```bash
export POSTGRES_PROD_HOST=production-db.example.com
export POSTGRES_PROD_PASSWORD=your-secure-password
python3 scripts/update_ai_templates_migration.py
```

## בדיקות תקינות

הסקריפט מבצע את הבדיקות הבאות:
1. ✅ בדיקה שיש תבניות ב-DB
2. ✅ בדיקה שיש תבנית "Equity Research Analysis"
3. ✅ בדיקה שהמשתנים עודכנו נכון:
   - `stock_ticker` - type: select
   - `investment_thesis` - type: select
   - `goal` - type: select עם options
4. ✅ בדיקת תקינות JSON

## התנהגות

- אם ה-migration נכשל ב-Development - התהליך נעצר
- אם ה-migration נכשל ב-Production או Demo - התהליך ממשיך אבל מדווח על שגיאה
- כל הבדיקות מוצגות ב-logs מפורטים

## דוגמת פלט

```
============================================================
🚀 AI Templates Migration Script
============================================================

📦 Step 1: Running migration on Development database...
   Connecting to: TikTrack-db-development
✅ Migration completed on Development database
✅ Validation passed on Development: 4 templates (4 active), Equity Research template updated correctly

✅ Development migration successful!
   Proceeding to Production and Demo databases...

📦 Step 2: Running migration on Production database...
   Connecting to: TikTrack-db-production
✅ Migration completed on Production database
✅ Validation passed on Production: 4 templates (4 active), Equity Research template updated correctly

📦 Step 3: Running migration on Demo database...
   Connecting to: TikTrack-db-demo
✅ Migration completed on Demo database
✅ Validation passed on Demo: 4 templates (4 active), Equity Research template updated correctly

============================================================
📊 Migration Summary
============================================================
✅ SUCCESS - Development: Migration and validation successful on Development
✅ SUCCESS - Production: Migration and validation successful on Production
✅ SUCCESS - Demo: Migration and validation successful on Demo

✅ All migrations completed successfully!
```

## הערות

- הסקריפט משתמש ב-`seed_templates()` מ-`migrations/seed_ai_prompt_templates.py`
- כל migration כולל commit אוטומטי
- אם יש שגיאה, הסקריפט מבצע rollback
- הסקריפט יוצא עם exit code 0 אם הכל הצליח, אחרת 1

