# AWS Lightsail Lean Deployment (TikTrack Online)

**תאריך:** דצמבר 2025  
**גרסה:** 1.0  
**מטרה:** תיעוד מקיף להפעלת ה־Lightsail הזולה (12$) עם העתק של סביבת Testing המקומית (פורט 5001).

---

## 🧭 סיכום החלטות

- נבחרה תצורת Lightsail 2 GB RAM / 60 GB SSD (~12$ / חודש) כדי לשמור על עלות מינימלית.  
- השרת מריץ רק את סביבת 5001 (Testing) – אין צורך ב־8080 באינטרנט.  
- גישה פתוחה (SSH + 5001) כדי לאפשר פרזנטציה מול כמה משתמשים.  
- השימוש ב־Lightsail מאפשר snapshots נוחים, ניטור בסיסי וגיבויים קלים.
- DNS קיים מתחבר ל־`tiktrack.nimrod.bio` ומצפה ל־IP הסטטי של השרת.

## ⚙️ צעדים להתקנה ראשונית

### 1. יצירת Instance

1. בחר Lightsail → Create instance → Ubuntu 24.04 LTS.  
2. בחר תוכנית `2 GB RAM, 1 vCPU, 60 GB SSD` (~12$).  
3. הוסף static IP והדבק אותו ל־Instance.  
4. בפאנל ה־Networking פתח:
   - Port 22 (SSH)  
   - Port 5001 (HTTP של TikTrack)  
   אין צורך ליישם הגבלות IP בשלב הפרזנטציה.

### 2. התקנת סביבת הפיתוח

1. התחבר ב־SSH:

   ```bash
   ssh ubuntu@<Lightsail-IP>
   ```

2. התקן Python 3.11, PostgreSQL 15, Git:

   ```bash
   sudo apt update
   sudo apt install -y python3.11 python3.11-venv python3-pip postgresql postgresql-contrib git
   ```

3. צור משתמש `tiktrack` (אופציונלי) ושלוט בזכויות:

   ```bash
   sudo adduser tiktrack
   sudo usermod -aG sudo tiktrack
   ```

4. Clone את הקוד:

   ```bash
   sudo -u tiktrack -H bash -c "
   git clone https://github.com/WaldNimrod/TikTrack.git /home/tiktrack/TikTrackApp-Online
   cd /home/tiktrack/TikTrackApp-Online
   git checkout production
   "
   ```

### 3. הגדרת PostgreSQL

1. התחבר ל־psql ויצור DB:

   ```bash
   sudo -u postgres createdb TikTrack-db-testing
   ```

2. ייבא את ה־schema/נתונים מהמחשב המקומי (העתק `pg_dump`):

   ```bash
   sudo -u postgres psql TikTrack-db-testing < /path/to/backup.dump
   ```

3. ודא שה־POSTGRES_USER וה־PASSWORD מוגדרים ב־`production/Backend/config/settings.py`.

### 4. קונפיגורציה והרצה

1. צא ללייב:

   ```bash
   cd /home/tiktrack/TikTrackApp-Online/production
   python3.11 -m venv .venv
   source .venv/bin/activate
   pip install -r Backend/requirements.txt
   ```

2. הדגש את הערכים:

   ```bash
   export TIKTRACK_ENV=testing
   export POSTGRES_DB=TikTrack-db-testing
   export POSTGRES_HOST=localhost
   export POSTGRES_USER=TikTrakDBAdmin
   export POSTGRES_PASSWORD="BigMeZoo1974!?"
   ```

3. הרץ `start_server.sh`:

   ```bash
   cd Backend
   ./start_server.sh
   ```

4. אם רוצים, הפעל `systemd` service ל־`start_server.sh` כדי שהוא יתחיל מחדש.

### 5. HTTPS ו־DNS

1. התקן nginx ו־Certbot:

   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```

2. צור קובץ nginx שמפנה 5001:

   ```nginx
   server {
     listen 80;
     server_name tiktrack.nimrod.bio;
     location / {
       proxy_pass http://127.0.0.1:5001;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

3. קבל SSL:

   ```bash
   sudo certbot --nginx -d tiktrack.nimrod.bio
   ```

4. ודא שה־DNS `tiktrack.nimrod.bio` מנוהל בשרת הקיים ומצביע על Static IP.

## 🧪 ניטור, גיבוי ובדיקות

- הפעל Lightsail monitoring עבור CPU/Memory.
- הגדר Cron job ל־`pg_dump -U TikTrakDBAdmin -d TikTrack-db-testing` ושמור ב־`/home/tiktrack/backups/`.
- השתמש ב־Lightsail snapshots יומיים ל־Instance מלא.
- תריץ `curl http://localhost:5001/api/health` כדי לבדוק את health.

## 📋 תיאום עם מערכת המקור

- הסביבה מריצה את אותו `production/` כהעתק של Testing – לכן `git pull origin production` לפני כל שינוי.  
- אחרי שינויים מקומיים, דחוף ל־`production` והפעל `scripts/production-update/master.py` אם נדרש.
- מסמכי העבודה העיקריים:  
  - `TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md`  
  - `TESTING_ENVIRONMENT_CHECKLIST.md`  
  - `MISSING_TASKS_AFTER_HANDOFF.md`

## ✅ סיכום

- עליה ראשונית זולה (12$) עם AWS Lightsail.  
- גישה פתוחה ונוחות לפרזנטציה.  
- ניתן להרחיב בעתיד ל־Nginx/SSL מלא ופיצול DB.  
- הקפד לעדכן את DNS, לשמור על environment נכונים ולבצע גיבויים מתמשכים.




