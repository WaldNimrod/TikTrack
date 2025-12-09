# TikTrack Production Update System

**תאריך:** 2025-11-17  
**גרסה:** 2.0.0  
**מטרה:** מערכת מאוחדת ומאורגנת לעדכון פרודקשן

---

## סקירה כללית

מערכת עדכון פרודקשן מאוחדת המאפשרת:

- ✅ הרצת כל התהליך בפקודה אחת
- ✅ הרצת שלבים ספציפיים
- ✅ דילוג על שלבים
- ✅ Dry-run mode
- ✅ Resume מהשלב האחרון שנכשל
- ✅ Rollback אוטומטי
- ✅ דיווח מפורט

---

## מבנה התיקייה

```
scripts/production-update/
├── master.py              # Master Script - נקודת כניסה מרכזית
├── README.md              # מדריך זה
├── steps/                 # מודולי שלבים
│   ├── 01_collect_changes.py
│   ├── 02_merge_main.py
│   ├── 03_cleanup_documentation.py
│   ├── 04_backup_database.py
│   ├── 05_sync_code.py
│   ├── 06_cleanup_backups.py
│   ├── 07_fix_config.py
│   ├── 08_validate.py
│   ├── 09_bump_version.py
│   ├── 10_commit_push.py
│   └── 11_start_server.py
├── utils/                 # כלי עזר משותפים
│   ├── logger.py          # מערכת לוגים
│   ├── reporter.py        # דיווח מפורט
│   ├── conflict_resolver.py  # פתרון קונפליקטים
│   └── rollback.py        # מנגנון rollback
├── config/                # קבצי הגדרות
│   ├── steps_config.json  # הגדרות שלבים
│   └── allowed_files.json # רשימת קבצים מותרים
└── lib/                   # סקריפטים קיימים
    ├── sync_to_production.py
    ├── sync_ui_to_production.py
    ├── cleanup_documentation.py
    └── ...
```

---

## שימוש מהיר

### הרצת כל התהליך

```bash
python scripts/production-update/master.py
```

### הרצת שלבים ספציפיים

```bash
python scripts/production-update/master.py --steps 1,3,5
```

### דילוג על שלבים

```bash
python scripts/production-update/master.py --skip 2,4
```

### Dry-run (ללא ביצוע)

```bash
python scripts/production-update/master.py --dry-run
```

### Resume מהשלב האחרון שנכשל

```bash
python scripts/production-update/master.py --resume
```

---

## רשימת שלבים

1. **Collect Changes** - איסוף שינויים מ-main
2. **Merge Main** - מיזוג main → production
3. **Cleanup Documentation** - ניקוי דוקומנטציה
4. **Backup Database** - גיבוי DB
5. **Sync Code** - סנכרון קוד (Backend + UI)
6. **Cleanup Backups** - ניקוי קבצי גיבוי
7. **Fix Config** - תיקון הגדרות production
8. **Validate** - בדיקות ואימות
9. **Bump Version** - עדכון גרסה
10. **Commit & Push** - Git commit & push
11. **Start Server** - הפעלת שרת (אופציונלי)

---

## תכונות מתקדמות

### Rollback

לפני כל עדכון נוצר snapshot אוטומטי. לשחזור:

```bash
python scripts/production-update/utils/rollback.py <snapshot_id>
```

### דיווח מפורט

כל עדכון יוצר דוח JSON מפורט ב-`_Tmp/production-update-reports/`

### לוגים

כל עדכון יוצר לוג מפורט ב-`_Tmp/production-update-logs/`

---

## אינטגרציה עם תהליך קיים

המערכת החדשה תואמת לאחור עם הסקריפטים הקיימים:

- כל הסקריפטים הקיימים זמינים ב-`lib/`
- ניתן להריץ שלבים בודדים גם דרך Master Script
- הסקריפטים המקוריים ממשיכים לעבוד כרגיל

---

## שיפורים מהגרסה הקודמת

1. ✅ **Master Script** - תהליך מאוחד במקום 7-9 שלבים נפרדים
2. ✅ **ניקוי גיבויים אוטומטי** - משולב ב-sync
3. ✅ **בדיקות UI** - בדיקות אוטומטיות של עמודים ו-JavaScript
4. ✅ **פתרון קונפליקטים** - פתרון אוטומטי לפי כללים
5. ✅ **דיווח מפורט** - דוחות JSON, סיכומים, היסטוריה
6. ✅ **Rollback** - מנגנון rollback אוטומטי

---

## פתרון בעיות

### שגיאת import

אם יש שגיאת import, ודא שאתה מריץ מהשורש של הפרויקט:

```bash
cd /path/to/TikTrackApp-Production
python scripts/production-update/master.py
```

### שלב נכשל

אם שלב נכשל:

1. בדוק את הלוגים ב-`_Tmp/production-update-logs/`
2. תקן את הבעיה
3. הרץ `--resume` להמשך מהשלב שנכשל

### Rollback

לשחזור מלא:

```bash
python scripts/production-update/utils/rollback.py
# או עם snapshot ID ספציפי
python scripts/production-update/utils/rollback.py pre-update_20251117_123456
```

---

## תיעוד נוסף

- `documentation/production/UPDATE_PROCESS.md` - תהליך עדכון מפורט
- `documentation/production/CODE_SEPARATION.md` - הפרדת קוד
- `scripts/production-update/config/steps_config.json` - הגדרות שלבים

---

**עודכן:** 2025-11-17  
**גרסה:** 2.0.0

