# משימות חסרות לאחר ביצוע ההוראות - סביבת Testing

**תאריך:** ינואר 2025  
**גרסה:** 1.0  
**מטרה:** רשימת משימות חסרות ובדיקות נוספות לאחר ביצוע ההוראות הבסיסיות

---

## ⚠️ משימות קריטיות חסרות

### 1. עדכון קוד מ-Git (חובה!)

**הבעיה:** הקוד בסביבת Testing כנראה ישן מאוד ולא מעודכן.

**מה צריך לעשות:**

#### שלב 1.1: בדיקת מצב Git

```bash
# מעבר לתיקיית הפרויקט
cd /path/to/TikTrackApp-Production

# בדיקת branch נוכחי
git branch

# בדיקת מצב Git
git status

# בדיקת מה ה-commit האחרון
git log --oneline -5
```

**תוצאה צפויה:**

```
* production
  main
  (או branch אחר)

On branch production
Your branch is up to date with 'origin/production'.

commit abc123... (ישן מאוד)
```

#### שלב 1.2: משיכת קוד עדכני מ-main

**⚠️ חשוב:** לפני משיכת הקוד, ודא שיש גיבוי!

```bash
# גיבוי מהיר של config (לפני עדכון)
cp production/Backend/config/settings.py production/Backend/config/settings.py.backup-before-pull-$(date +%Y%m%d)
cp start_server.sh start_server.sh.backup-before-pull-$(date +%Y%m%d)

# מעבר ל-main branch
git checkout main

# משיכת קוד עדכני
git pull origin main

# בדיקת מה השתנה
git log --oneline -10

# חזרה ל-production branch (אם עובדים עליו)
git checkout production

# Merge של main לתוך production
git merge main

# פתרון conflicts (אם יש)
# - שמור את השינויים שלך (IS_TESTING = True, database name, etc.)
# - קבל את השינויים מ-main
```

**תוצאה צפויה:**

```
Updating abc123..def456
Fast-forward
 ... (קבצים רבים עודכנו)
```

#### שלב 1.3: שמירת השינויים שלך

**אם יש conflicts:**

```bash
# פתח את הקבצים עם conflicts
code production/Backend/config/settings.py

# ודא שהשינויים שלך נשמרו:
# - ENVIRONMENT = "testing"
# - IS_TESTING = True
# - POSTGRES_DB = "TikTrack-db-testing"
# - IS_PRODUCTION = False

# שמור את הקובץ
# חזור ל-Git
git add production/Backend/config/settings.py
git add start_server.sh
git commit -m "Merge main into production - preserve testing environment settings"
```

#### שלב 1.4: Push השינויים

```bash
# Push ל-remote
git push origin production
```

---

### 2. בדיקת שהקוד העדכני עובד

#### שלב 2.1: בדיקת Dependencies

```bash
# בדיקת Python packages
cd production/Backend
pip3 list | grep -E "(flask|sqlalchemy|psycopg2)"

# אם חסרים packages:
pip3 install -r requirements.txt
```

#### שלב 2.2: בדיקת Database Migrations

```bash
# בדיקת אם יש migrations חדשות
cd production/Backend
python3 migrations_manager.py --check

# אם יש migrations חדשות:
python3 migrations_manager.py --migrate
```

#### שלב 2.3: בדיקת Config אחרי עדכון

```bash
# בדיקת שההגדרות שלך נשמרו
cd production/Backend
python3 -c "from config.settings import IS_TESTING, POSTGRES_DB, ENVIRONMENT; \
    print(f'ENVIRONMENT: {ENVIRONMENT}'); \
    print(f'IS_TESTING: {IS_TESTING}'); \
    print(f'Database: {POSTGRES_DB}'); \
    assert IS_TESTING == True, 'IS_TESTING must be True'; \
    assert POSTGRES_DB == 'TikTrack-db-testing', 'Database must be testing'; \
    print('✅ Config OK')"
```

**תוצאה צפויה:**

```
ENVIRONMENT: testing
IS_TESTING: True
Database: TikTrack-db-testing
✅ Config OK
```

---

### 3. בדיקות מקיפות נוספות

#### שלב 3.1: בדיקת כל ה-API Endpoints

```bash
# רשימת endpoints לבדיקה
BASE_URL="http://localhost:5001"

# Health check
curl -s "$BASE_URL/api/health" | jq .

# Currencies
curl -s "$BASE_URL/api/currencies" | jq 'length'

# Tickers
curl -s "$BASE_URL/api/tickers" | jq 'length'

# Trades
curl -s "$BASE_URL/api/trades" | jq 'length'

# Executions
curl -s "$BASE_URL/api/executions" | jq 'length'

# Alerts
curl -s "$BASE_URL/api/alerts" | jq 'length'

# Watch Lists (אם קיים)
curl -s "$BASE_URL/api/watch-lists" | jq 'length'
```

**תוצאה צפויה:**

```
# כל ה-responses צריכים להיות תקינים (200 OK)
# לא שגיאות 500 או 404
```

#### שלב 3.2: בדיקת דפים

```bash
# בדיקת דפים עיקריים
curl -I http://localhost:5001/
curl -I http://localhost:5001/trades
curl -I http://localhost:5001/executions
curl -I http://localhost:5001/alerts
curl -I http://localhost:5001/watch-lists
```

**תוצאה צפויה:**

```
HTTP/1.1 200 OK
Content-Type: text/html
...
```

#### שלב 3.3: בדיקת יציבות שרת

```bash
# הפעלת השרת
cd /path/to/TikTrackApp-Production
./start_server.sh

# המתן 15 שניות
sleep 15

# 6 health checks רצופים (כל 5 שניות)
for i in {1..6}; do
    echo "Health check $i:"
    curl -s http://localhost:5001/api/health | jq -r '.status, .environment, .database'
    sleep 5
done
```

**תוצאה צפויה:**

```
Health check 1:
healthy
testing
connected
Health check 2:
healthy
testing
connected
...
```

---

### 4. בדיקת Master Script

#### שלב 4.1: בדיקת Master Script (Dry-Run)

```bash
# בדיקת Master Script
cd /path/to/TikTrackApp-Production
python3 scripts/production-update/master.py --dry-run
```

**תוצאה צפויה:**

```
✅ All checks passed
✅ Config verified
✅ Database connection OK
...
```

#### שלב 4.2: בדיקת Sync Script

```bash
# בדיקת Sync Script (אם קיים)
cd /path/to/TikTrackApp-Production
python3 scripts/sync_to_production.py --dry-run
```

---

### 5. בדיקת Database Integrity

#### שלב 5.1: בדיקת טבלאות

```bash
# רשימת כל הטבלאות
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "\dt"

# בדיקת מספר רשומות בטבלאות עיקריות
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "
SELECT 
    'trades' as table_name, COUNT(*) as count FROM trades
UNION ALL
SELECT 'executions', COUNT(*) FROM executions
UNION ALL
SELECT 'alerts', COUNT(*) FROM alerts
UNION ALL
SELECT 'watch_lists', COUNT(*) FROM watch_lists;
"
```

#### שלב 5.2: בדיקת Foreign Keys

```bash
# בדיקת foreign keys תקינים
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY';
"
```

---

### 6. בדיקת Logs

#### שלב 6.1: בדיקת Server Logs

```bash
# בדיקת לוגים אחרונים
tail -100 production/Backend/server_output.log | grep -E "(ERROR|WARNING|Exception)"

# אם יש שגיאות - בדוק אותן
```

#### שלב 6.2: בדיקת Database Logs

```bash
# בדיקת PostgreSQL logs (אם נגיש)
tail -50 /var/log/postgresql/postgresql-*.log | grep -E "(ERROR|FATAL)"
```

---

### 7. בדיקת Performance

#### שלב 7.1: בדיקת Response Times

```bash
# בדיקת זמני תגובה
time curl -s http://localhost:5001/api/health > /dev/null
time curl -s http://localhost:5001/api/trades > /dev/null
time curl -s http://localhost:5001/api/executions > /dev/null
```

**תוצאה צפויה:**

```
# כל ה-responses צריכים להיות < 500ms
```

#### שלב 7.2: בדיקת Memory Usage

```bash
# בדיקת שימוש בזיכרון
ps aux | grep "python.*app.py" | grep -v grep
```

---

## ✅ Checklist סופי - מה צריך לבדוק

### לפני סיום

- [ ] **קוד מעודכן מ-Git** (git pull origin main)
- [ ] **Config נשמר נכון** (IS_TESTING = True, database name)
- [ ] **Dependencies מעודכנים** (pip install -r requirements.txt)
- [ ] **Migrations מעודכנות** (migrations_manager.py --migrate)
- [ ] **כל ה-API endpoints עובדים**
- [ ] **כל הדפים נטענים**
- [ ] **Server יציב** (6 health checks)
- [ ] **Master Script עובד**
- [ ] **Database תקין** (tables, data, foreign keys)
- [ ] **לוגים נקיים** (אין שגיאות קריטיות)
- [ ] **Performance תקין** (response times < 500ms)

### אחרי סיום

- [ ] **Commit & Push** כל השינויים
- [ ] **תיעוד** של כל הבדיקות
- [ ] **הודעה לצוות** על השלמת העבודה

---

## 🔍 פתרון בעיות נפוצות

### בעיה: Git Merge Conflicts

**פתרון:**

```bash
# פתח את הקבצים עם conflicts
code production/Backend/config/settings.py

# ודא שהשינויים שלך נשמרו:
# - ENVIRONMENT = "testing"
# - IS_TESTING = True
# - POSTGRES_DB = "TikTrack-db-testing"

# שמור וסגור
git add production/Backend/config/settings.py
git commit -m "Resolve merge conflicts - preserve testing settings"
```

### בעיה: Dependencies חסרים

**פתרון:**

```bash
# התקנת dependencies
cd production/Backend
pip3 install -r requirements.txt

# אם יש שגיאות - בדוק את requirements.txt
cat requirements.txt
```

### בעיה: Migrations נכשלו

**פתרון:**

```bash
# בדיקת מצב migrations
cd production/Backend
python3 migrations_manager.py --status

# אם יש בעיות - בדוק את הלוגים
tail -50 production/Backend/server_output.log
```

### בעיה: API Endpoints לא עובדים

**פתרון:**

```bash
# בדיקת שהשרת רץ
curl http://localhost:5001/api/health

# בדיקת לוגים
tail -100 production/Backend/server_output.log | grep ERROR

# בדיקת database connection
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "SELECT 1;"
```

---

## 📞 תמיכה

**אם יש בעיות:**

1. בדוק את הלוגים: `production/Backend/server_output.log`
2. בדוק את ה-config: `production/Backend/config/settings.py`
3. בדוק את ה-database: `psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "\dt"`
4. בדוק את ה-Git status: `git status`
5. פנה לצוות הפיתוח עם פרטי השגיאה

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0  
**סטטוס:** מוכן לביצוע

