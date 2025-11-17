# הוראות Commit למערכת Production Update

## פקודות מהירות

```bash
# 1. הוספה ל-Git
git add scripts/production-update/

# 2. בדיקה
git status

# 3. Commit
git commit -m "feat: Add unified production update system (v2.0.0)

- Master script for unified update process
- 11 modular step modules  
- Utils: logger, reporter, conflict_resolver, rollback
- Config files for steps and allowed files
- Integration with existing scripts
- Documentation and README"

# 4. Push
git push origin production
```

## בדיקות לפני Commit

```bash
# 1. בדיקת קבצים
find scripts/production-update -type f | wc -l
# צריך להיות ~30+ קבצים

# 2. בדיקת Master Script
python scripts/production-update/master.py --help

# 3. Dry-run של שלב אחד
python scripts/production-update/master.py --dry-run --steps 1

# 4. בדיקת Git status
git status scripts/production-update/
```

## אחרי Commit

```bash
# 1. בדיקה שהקבצים ב-Git
git ls-files scripts/production-update/ | wc -l

# 2. בדיקה שהמערכת עובדת
python scripts/production-update/master.py --dry-run

# 3. Push
git push origin production
```

## הערות

- המערכת מוגנת מפני דריסה כי היא לא ב-`production/`
- `sync_to_production.py` עובד רק על `Backend/`
- המערכת נשארת ב-`scripts/` ולא נדרסת

