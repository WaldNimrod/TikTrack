# TikTrack Production Deployment Guide

**תאריך:** 2025-01-16  
**גרסה:** 1.0

## סקירה כללית

מדריך זה מסביר את תהליך העדכון של סביבת הפרודקשן עם קוד חדש.

## תהליך עדכון

### גישה מומלצת: Tagged Releases

הגישה המומלצת היא שימוש ב-Git tags לגרסאות יציבות.

### שלב 1: עבודה על פיתוח

עבוד כרגיל על branch `main`:

```bash
git checkout main
# עבודה על שינויים...
git add .
git commit -m "Feature: Add new functionality"
git push origin main
```

### שלב 2: בדיקות

לפני יצירת release:

1. בדוק שהכל עובד בסביבת פיתוח
2. הרץ בדיקות
3. ודא שאין שגיאות

### שלב 3: יצירת Tag

כשהקוד מוכן לפרודקשן:

```bash
# צור tag
git tag -a v1.0.1 -m "Release version 1.0.1"

# שלח ל-remote
git push origin v1.0.1
```

### שלב 4: עדכון פרודקשן

בסביבת הפרודקשן:

```bash
# עצור את השרת (Ctrl+C)

# עדכן את הקוד
git fetch origin
git checkout v1.0.1

# הפעל מחדש
./start_production.sh
```

## עדכון בסיס נתונים

אם יש שינויים במבנה בסיס הנתונים:

### לפני עדכון הקוד

1. **גבה את בסיס הנתונים:**

   ```bash
   python3 Backend/scripts/backup_database.py
   ```

2. **הרץ migrations (אם יש):**

   ```bash
   # לדוגמה, אם יש migration scripts
   python3 Backend/migrations/your_migration.py
   ```

3. **ודא שהכל עובד:**

   ```bash
   ./start_production.sh
   ```

## Rollback (חזרה אחורה)

אם יש בעיה בגרסה החדשה:

```bash
# עצור את השרת
# Ctrl+C

# חזור לגרסה הקודמת
git checkout v1.0.0  # או tag אחר

# הפעל מחדש
./start_production.sh
```

## בדיקות אחרי Deployment

לאחר עדכון, בדוק:

1. **Health Check:**

   ```bash
   curl http://127.0.0.1:5001/api/health
   ```

2. **בדיקת בסיס נתונים:**
   - פתח את המערכת בדפדפן
   - בדוק שהכל עובד
   - ודא שאין שגיאות בקונסול

3. **בדיקת לוגים:**

   ```bash
   tail -f Backend/logs-production/app.log
   ```

## עדכון אוטומטי (לא מומלץ)

אם רוצים עדכון אוטומטי (לא מומלץ לפרודקשן):

```bash
# עדכון אוטומטי מ-main
git checkout main
git pull origin main
./start_production.sh
```

**אזהרה:** גישה זו עלולה להכניס קוד לא יציב לפרודקשן.

## Best Practices

1. **תמיד גבה לפני עדכון**
2. **השתמש ב-tags לגרסאות יציבות**
3. **בדוק בסביבת פיתוח לפני פרודקשן**
4. **תעד שינויים חשובים**
5. **שמור על הפרדה בין סביבות**

## Troubleshooting

### הקוד לא מתעדכן

```bash
# ודא שאתה על ה-tag הנכון
git describe --tags

# עדכן מ-remote
git fetch origin
git checkout v1.0.1
```

### שגיאות אחרי עדכון

1. בדוק את הלוגים: `Backend/logs-production/errors.log`
2. ודא שהתלויות מעודכנות: `pip install -r Backend/requirements.txt`
3. בדוק את מבנה בסיס הנתונים

### בעיות ביצועים

אם יש בעיות ביצועים אחרי עדכון:

1. בדוק את `performance.log`
2. נקה את ה-cache אם צריך
3. בדוק את הגדרות ה-cache ב-`config/settings.py`

## תמיכה

לשאלות או בעיות:

- בדוק את `PRODUCTION_SETUP.md`
- בדוק את הלוגים ב-`Backend/logs-production/`
- בדוק את ה-Git history: `git log --oneline`

