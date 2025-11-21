# הגנה על מערכת Production Update

## סטטוס נוכחי

המערכת החדשה `scripts/production-update/` נמצאת ב-Git כ-untracked files.

## שלבים לגיבוי והגנה

### 1. הוספה ל-Git (חובה!)

```bash
# הוספת כל הקבצים
git add scripts/production-update/

# בדיקה מה נוסף
git status

# Commit
git commit -m "feat: Add unified production update system (v2.0.0)

- Master script for unified update process
- 11 modular step modules
- Utils: logger, reporter, conflict_resolver, rollback
- Config files for steps and allowed files
- Integration with existing scripts
- Documentation and README"

# Push ל-production branch
git push origin production
```

### 2. הגנה מפני דריסה

המערכת מוגנת מפני דריסה כי:

✅ **sync_to_production.py** עובד רק על `Backend/` ולא על `scripts/`
   - הוא מעתיק רק מ-`Backend/` ל-`production/Backend/`
   - `scripts/production-update/` לא נכלל בתהליך

✅ **המערכת נמצאת ב-`scripts/`** ולא ב-`production/`
   - תהליך העדכון לא נוגע ב-`scripts/` כלל

### 3. הגנה נוספת (מומלץ)

#### א. עדכון pre-commit hook

להוסיף הגנה ב-`scripts/git-hooks/pre-commit`:

```bash
# בדיקה שהמערכת לא נמחקת בטעות
if [[ "${file_path}" == scripts/production-update/* ]] && [[ "${status}" == D* ]]; then
    error_messages+=("⛔ אסור למחוק קבצים מ-scripts/production-update/ (נמצא: ${file_path})")
fi
```

#### ב. עדכון .gitignore (אם צריך)

לוודא ש-`.gitignore` לא מתעלם מ-`scripts/production-update/`:

```bash
# בדיקה
grep -i "production-update" .gitignore

# אם יש - להסיר או לתקן
```

### 4. בדיקות אחרי Commit

```bash
# 1. בדיקה שהקבצים ב-Git
git ls-files scripts/production-update/ | head -10

# 2. בדיקה שהמערכת עובדת
python scripts/production-update/master.py --dry-run --steps 1

# 3. בדיקה ב-main branch (אם רלוונטי)
git checkout main
git pull origin main
ls -la scripts/production-update/  # צריך להיות קיים
```

### 5. עדכון main branch (אופציונלי)

אם רוצים שהמערכת תהיה גם ב-main:

```bash
# מ-main branch
git checkout main
git pull origin main

# Merge מ-production
git merge production --no-edit

# או cherry-pick של הקומיט הספציפי
git cherry-pick <commit-hash>

# Push
git push origin main
```

## סיכונים ופתרונות

| סיכון | פתרון |
|--------|--------|
| מחיקה בטעות | pre-commit hook |
| דריסה ב-merge | המערכת לא ב-production/ אז לא נדרס |
| שכחה לעדכן | תהליך אוטומטי (Master Script) |
| קונפליקטים | פתרון אוטומטי ב-ConflictResolver |

## Checklist לפני Commit

- [ ] כל הקבצים ב-`scripts/production-update/` קיימים
- [ ] אין שגיאות syntax
- [ ] Master Script עובד (`--dry-run`)
- [ ] תיעוד מעודכן
- [ ] בדיקת Git status
- [ ] Commit message ברור
- [ ] Push ל-production branch

## הערות חשובות

1. **המערכת מוגנת מעצמה** - היא לא ב-`production/` אז לא נדרסת ב-sync
2. **צריך commit** - רק כדי לשמור ב-Git
3. **pre-commit hook** - הגנה נוספת (אופציונלי)
4. **תמיד לעבוד ב-production branch** - המערכת מיועדת לפרודקשן

---

**תאריך:** 2025-11-17  
**גרסה:** 1.0.0

