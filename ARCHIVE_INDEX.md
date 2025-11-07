# Archive Index - TikTrack System

## ארכיון ניקוי 2025-01-16
**מיקום**: `archive/cleanup-2025-01-16/`  
**תאריך**: 16 בינואר 2025  
**קבצים**: 1,661 קבצים שהועברו

### תוכן הארכיון
- **קבצי MD בשורש**: 67 דוחות ותוכניות ישנים
- **עמודי HTML לא פעילים**: 10 קבצים
- **קבצי JS לא פעילים**: 30+ קבצים
- **גיבויי DB**: 9 קבצים
- **קבצי גיבוי**: 50+ קבצים

### דוח מפורט
ראה: [CLEANUP_2025-01-16_REPORT.md](CLEANUP_2025-01-16_REPORT.md)

### אינדקס מפורט
ראה: [archive/cleanup-2025-01-16/INDEX.md](archive/cleanup-2025-01-16/INDEX.md)

## שחזור קבצים

### שחזור קובץ בודד
```bash
cp archive/cleanup-2025-01-16/[path]/[filename] [original-location]
```

### שחזור מלא מהגיבוי
```bash
git reset --hard pre-cleanup-archive-2025-01-16
```

### שחזור מהארכיון
```bash
# שחזור כל הקבצים
cp -r archive/cleanup-2025-01-16/* ./

# שחזור קטגוריה ספציפית
cp -r archive/cleanup-2025-01-16/root-files/* ./
```

## ארכיון סקריפטי כפתורים 2025-11-07
**מיקום**: `archive/scripts/button-migration/`  
**תאריך**: 7 בנובמבר 2025  
**תכולה**: 13 סקריפטי החלפת כפתורים היסטוריים ששימשו למיגרציה ל-`data-onclick`

### שחזור
```bash
cp archive/scripts/button-migration/replace_all_buttons.py scripts/
```

> הסקריפטים נשמרים לצורך עיון בלבד. לפני הרצה מחדש יש לפתוח טיקט תחזוקה ולאשר מול נמרוד.

## ארכיון מיגרציות SQLite היסטוריות 2025-11-07
**מיקום**: `archive/backend/migrations/legacy/`  
**תאריך**: 7 בנובמבר 2025  
**תכולה**: גרסאות `*_simple.py` של מיגרציות חיבור נתונים חיצוניים (הוחלפו בגרסאות SQLAlchemy)

### שחזור
```bash
cp archive/backend/migrations/legacy/create_external_data_tables_simple.py Backend/migrations/
```

> הגרסאות הפשוטות אינן חלק מתהליך המיגרציה הרשמי. השתמשו בהן רק כ-reference.

## כלי תחזוקה רגישים 2025-11-07
**מיקום**: `scripts/cleanup/`  
**תכולה**: סקריפטי מחיקה/ניקוי עם README וטChecklist בטיחות הפעלה

> להרצה יש להשתמש בנתיבים החדשים בלבד ולהקפיד על ההנחיות המופיעות ב-`scripts/cleanup/README.md`.

## הערות
- כל הקבצים הועברו (לא נמחקו)
- המערכת מכילה רק קבצים פעילים וחיוניים
- שחזור מלא אפשרי בכל עת
- גיבוי Git זמין: `pre-cleanup-archive-2025-01-16`
