# TikTrack Development Workflow
# מערכת פיתוח TikTrack

## 🚀 מערכת פיתוח חדשה עם Auto-Reload

יצרנו מערכת פיתוח מתקדמת שמפתרת את הבעיות החוזרות:

### ✅ בעיות שנפתרו:
1. **השרת לא מתעדכן** - עכשיו מתעדכן אוטומטית
2. **SQLAlchemy cache** - נטען מחדש אוטומטית
3. **אין מערכת migrations** - מערכת מסודרת לניהול שינויים
4. **השרת "נרדם"** - caffeinate מונע שינה
5. **אין health check** - endpoint לבדיקת בריאות

## 🛠️ איך להשתמש:

### 1. הפעלת שרת פיתוח:
```bash
./start_dev.sh
```

**מה זה עושה:**
- ✅ מפעיל את הסביבה הוירטואלית
- ✅ בודק dependencies
- ✅ עוצר תהליכים קיימים על הפורט
- ✅ מפעיל שרת עם Waitress (יציב יותר מ-Flask)
- ✅ מפעיל caffeinate למניעת שינה
- ✅ מפעיל auto-reload על שינויים בקוד
- ✅ שומר לוגים מפורטים

### 2. ניהול שינויים בבסיס הנתונים:
```bash
cd Backend

# הצגת סטטוס
python3 migrations_manager.py status

# יצירת migration חדש
python3 migrations_manager.py create_notes

# החלת כל migrations
python3 migrations_manager.py migrate

# החלת migration ספציפי
python3 migrations_manager.py apply <version>

# ביטול migration
python3 migrations_manager.py rollback <version>
```

## 🔧 תכונות המערכת:

### שרת פיתוח (`dev_server.py`):
- ✅ **Auto-Reload** - מתעדכן אוטומטית בשינויים
- ✅ **Waitress Server** - יציב יותר מ-Flask
- ✅ **Health Check** - endpoint `/api/health`
- ✅ **Auto-Restart** - במקרה של קריסה
- ✅ **Logging** - לוגים מפורטים ב-`server_detailed.log`
- ✅ **Signal Handling** - עצירה מסודרת עם Ctrl+C

### מערכת Migrations (`migrations_manager.py`):
- ✅ **היסטוריה** - מעקב אחר שינויים
- ✅ **Rollback** - ביטול שינויים
- ✅ **Validation** - בדיקת תקינות
- ✅ **JSON Files** - migrations נשמרים כקבצי JSON
- ✅ **SQL Execution** - ביצוע statements אחד אחד

### Script הפעלה (`start_dev.sh`):
- ✅ **Environment Setup** - הפעלת סביבה וירטואלית
- ✅ **Dependencies Check** - בדיקת חבילות נדרשות
- ✅ **Process Management** - עצירת תהליכים קיימים
- ✅ **Caffeinate** - מניעת שינה
- ✅ **Error Handling** - טיפול בשגיאות

## 📊 מעקב וניטור:

### בדיקת בריאות השרת:
```bash
curl http://127.0.0.1:8080/api/health
```

### צפייה בלוגים:
```bash
# לוגים מפורטים
tail -f Backend/server_detailed.log

# לוגים בזמן אמת
tail -f Backend/server.log
```

### בדיקת תהליכים:
```bash
# בדיקה איזה תהליכים רצים על הפורט
lsof -i :8080

# בדיקת תהליכי Python
ps aux | grep python
```

## 🎯 יתרונות המערכת החדשה:

### לפיתוח יומיומי:
1. **אין צורך להפעיל מחדש** - השרת מתעדכן אוטומטית
2. **אין בעיות cache** - SQLAlchemy נטען מחדש
3. **יציבות משופרת** - Waitress במקום Flask
4. **מניעת שינה** - caffeinate מונע בעיות
5. **לוגים מפורטים** - קל יותר לדבג

### לניהול בסיס הנתונים:
1. **היסטוריה מסודרת** - כל שינוי מתועד
2. **אפשרות rollback** - ביטול שינויים
3. **בדיקת תקינות** - וידוא שהשינויים תקינים
4. **אוטומציה** - אין צורך ב-SQL ידני
5. **תיעוד** - כל migration מתועד

## 🔄 Workflow מומלץ:

### 1. התחלת יום עבודה:
```bash
./start_dev.sh
```

### 2. שינוי מודל:
```bash
# עריכת הקובץ
vim Backend/models/note.py

# השרת מתעדכן אוטומטית!
```

### 3. שינוי בסיס הנתונים:
```bash
# יצירת migration
python3 migrations_manager.py create_notes

# עריכת ה-migration
vim Backend/migrations/migration_*.json

# החלת השינוי
python3 migrations_manager.py migrate
```

### 4. בדיקת שינויים:
```bash
# בדיקת בריאות
curl http://127.0.0.1:8080/api/health

# בדיקת סטטוס migrations
python3 migrations_manager.py status
```

## 🚨 פתרון בעיות:

### אם השרת לא מתעדכן:
1. בדוק שהתהליך רץ: `ps aux | grep dev_server`
2. בדוק את הלוגים: `tail -f Backend/server_detailed.log`
3. הפעל מחדש: `./start_dev.sh`

### אם יש בעיות migrations:
1. בדוק סטטוס: `python3 migrations_manager.py status`
2. בדוק את הקבצים: `ls Backend/migrations/`
3. נסה rollback: `python3 migrations_manager.py rollback <version>`

### אם השרת "נרדם":
1. בדוק תהליכים: `lsof -i :8080`
2. סגור תהליכים: `kill -9 <PID>`
3. הפעל מחדש: `./start_dev.sh`

## 📝 הערות חשובות:

- **תמיד השתמש ב-`./start_dev.sh`** לפיתוח
- **שמור על הטרמינל פתוח** כדי לראות לוגים
- **בדוק health endpoint** לפני שינויים גדולים
- **תעד migrations** לכל שינוי בבסיס הנתונים
- **השתמש ב-rollback** אם משהו לא עובד

## 🎉 סיכום:

המערכת החדשה פותרת את כל הבעיות החוזרות:
- ✅ אין יותר בעיות עדכון שרת
- ✅ אין יותר בעיות SQLAlchemy cache
- ✅ יש מערכת migrations מסודרת
- ✅ השרת יציב ולא "נרדם"
- ✅ יש health check ו-auto-restart
- ✅ יש לוגים מפורטים לדיבוג

**המערכת מוכנה לשימוש יומיומי! 🚀**
