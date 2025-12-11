# פרומט למשימות חסרות - סביבת Testing

**תאריך:** ינואר 2025  
**מטרה:** הודעה מפורטת לצוות הטסטים על משימות חסרות ובדיקות נוספות

---

## 📧 הודעה לצוות הטסטים

```
שלום,

תודה על ביצוע ההוראות הבסיסיות! 

עכשיו יש כמה משימות חשובות נוספות שצריך לבצע:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ משימה קריטית #1: עדכון קוד מ-Git

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

הקוד בסביבת Testing כנראה ישן מאוד ולא מעודכן.

חובה לבצע:

1. גיבוי מהיר לפני עדכון:
   cp production/Backend/config/settings.py production/Backend/config/settings.py.backup-before-pull-$(date +%Y%m%d)
   cp start_server.sh start_server.sh.backup-before-pull-$(date +%Y%m%d)

2. מעבר ל-main branch ומשיכת קוד עדכני:
   git checkout main
   git pull origin main
   git checkout production  # (או branch שעליו אתם עובדים)
   git merge main

3. פתרון conflicts (אם יש):
   - ודא שהשינויים שלכם נשמרו:
     * ENVIRONMENT = "testing"
     * IS_TESTING = True
     * POSTGRES_DB = "TikTrack-db-testing"
     * IS_PRODUCTION = False
   - קבלו את השינויים מ-main
   - שמרו את הקובץ

4. Push השינויים:
   git push origin production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ משימה #2: בדיקת שהקוד העדכני עובד

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. עדכון Dependencies:
   cd production/Backend
   pip3 install -r requirements.txt

2. עדכון Migrations:
   python3 migrations_manager.py --migrate

3. בדיקת Config:
   python3 -c "from config.settings import IS_TESTING, POSTGRES_DB, ENVIRONMENT; \
       assert IS_TESTING == True, 'IS_TESTING must be True'; \
       assert POSTGRES_DB == 'TikTrack-db-testing', 'Database must be testing'; \
       print('✅ Config OK')"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ משימה #3: בדיקות מקיפות

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. בדיקת כל ה-API Endpoints:
   BASE_URL="http://localhost:5001"
   curl -s "$BASE_URL/api/health" | jq .
   curl -s "$BASE_URL/api/currencies" | jq 'length'
   curl -s "$BASE_URL/api/tickers" | jq 'length'
   curl -s "$BASE_URL/api/trades" | jq 'length'
   curl -s "$BASE_URL/api/executions" | jq 'length'
   curl -s "$BASE_URL/api/alerts" | jq 'length'

2. בדיקת דפים:
   curl -I http://localhost:5001/
   curl -I http://localhost:5001/trades
   curl -I http://localhost:5001/executions
   curl -I http://localhost:5001/alerts

3. בדיקת יציבות שרת (6 health checks):
   for i in {1..6}; do
       echo "Health check $i:"
       curl -s http://localhost:5001/api/health | jq -r '.status, .environment, .database'
       sleep 5
   done

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ משימה #4: בדיקת Master Script

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cd /path/to/TikTrackApp-Production
python3 scripts/production-update/master.py --dry-run

תוצאה צפויה: ✅ All checks passed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ משימה #5: בדיקת Database Integrity

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. בדיקת טבלאות:
   psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "\dt"

2. בדיקת מספר רשומות:
   psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "
   SELECT 
       'trades' as table_name, COUNT(*) as count FROM trades
   UNION ALL
   SELECT 'executions', COUNT(*) FROM executions
   UNION ALL
   SELECT 'alerts', COUNT(*) FROM alerts;
   "

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ משימה #6: בדיקת Logs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

tail -100 production/Backend/server_output.log | grep -E "(ERROR|WARNING|Exception)"

אם יש שגיאות - בדקו אותן!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ משימה #7: בדיקת Performance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

time curl -s http://localhost:5001/api/health > /dev/null
time curl -s http://localhost:5001/api/trades > /dev/null

כל ה-responses צריכים להיות < 500ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Checklist סופי - מה צריך לבדוק:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- [ ] קוד מעודכן מ-Git (git pull origin main)
- [ ] Config נשמר נכון (IS_TESTING = True, database name)
- [ ] Dependencies מעודכנים (pip install -r requirements.txt)
- [ ] Migrations מעודכנות (migrations_manager.py --migrate)
- [ ] כל ה-API endpoints עובדים
- [ ] כל הדפים נטענים
- [ ] Server יציב (6 health checks)
- [ ] Master Script עובד
- [ ] Database תקין (tables, data)
- [ ] לוגים נקיים (אין שגיאות קריטיות)
- [ ] Performance תקין (response times < 500ms)
- [ ] Commit & Push כל השינויים

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 מסמך מפורט:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

למסמך מפורט עם כל ההוראות, פקודות, ופתרון בעיות:

https://github.com/WaldNimrod/TikTrack/blob/main/documentation/production/ONLINE_DEPLOYMENT/MISSING_TASKS_AFTER_HANDOFF.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 תמיכה:

אם יש בעיות:
1. בדקו את הלוגים: production/Backend/server_output.log
2. בדקו את ה-config: production/Backend/config/settings.py
3. בדקו את ה-database: psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "\dt"
4. בדקו את ה-Git status: git status
5. פנו לצוות הפיתוח עם פרטי השגיאה

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

בהצלחה!
```

---

## 📋 קישורים

### מסמך מפורט

```
https://github.com/WaldNimrod/TikTrack/blob/main/documentation/production/ONLINE_DEPLOYMENT/MISSING_TASKS_AFTER_HANDOFF.md
```

### תיקייה

```
https://github.com/WaldNimrod/TikTrack/tree/main/documentation/production/ONLINE_DEPLOYMENT
```

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0

