# הגדרת 3 סביבות - TikTrack

**תאריך:** ינואר 2025  
**גרסה:** 1.0  
**מטרה:** מדריך מפורט להגדרת 3 סביבות: Development, Testing, Online

---

## 📋 סקירה כללית

לאחר העלאת המערכת לאינטרנט, נצטרך 3 סביבות נפרדות:

1. **Development (פיתוח)** - נשארת ללא שינוי
2. **Testing (טסטים)** - מה שהיה production, הופך לטסטים
3. **Online (אונליין)** - סביבה חדשה לפרודקשן אמיתי

---

## 🏗️ מבנה הסביבות

### סביבה 1: Development (פיתוח)

**מיקום:** מחשב מקומי  
**תיקייה:** `TikTrackApp/`  
**זיהוי:** שם תיקייה `TikTrackApp` → `development`

**מפרטים:**

- **פורט:** 8080
- **Database:** `TikTrack-db-development`
- **תיקיית קוד:** `Backend/`, `trading-ui/`
- **תיקיית לוגים:** `Backend/logs/`
- **הפעלה:** `./start_server.sh` (אוטומטי)

**תפקיד:**

- פיתוח פעיל
- בדיקות מקומיות
- ניסויים

**שינויים נדרשים:** ❌ אין - נשארת ללא שינוי

---

### סביבה 2: Testing (טסטים)

**מיקום:** מחשב מקומי  
**תיקייה:** `TikTrackApp-Production/` (נשאר, אבל משמש לטסטים)  
**זיהוי:** שם תיקייה `TikTrackApp-Production` → `testing`

**מפרטים:**

- **פורט:** 5001
- **Database:** `TikTrack-db-testing` (שינוי מ-`TikTrack-db-production`)
- **תיקיית קוד:** `production/Backend/`, `production/trading-ui/`
- **תיקיית לוגים:** `production/Backend/logs/`
- **הפעלה:** `./start_server.sh` (אוטומטי - מזהה Production → testing)

**תפקיד:**

- בדיקות לפני עליה לאוויר
- בדיקת קונפיגורציות production
- בדיקת מיגרציות
- בדיקת ביצועים

**שינויים נדרשים:**

- ✅ שינוי `production/Backend/config/settings.py`:
  - `IS_PRODUCTION = False` → `IS_TESTING = True`
  - `POSTGRES_DB = "TikTrack-db-testing"` (שינוי מ-production)
- ✅ עדכון `start_server.sh` לזיהוי `testing` במקום `production`
- ✅ שינוי שם database מ-`TikTrack-db-production` ל-`TikTrack-db-testing`

---

### סביבה 3: Online (אונליין)

**מיקום:** שרת אינטרנט (uPress VPS)  
**תיקייה:** על השרת (Git clone)  
**זיהוי:** משתנה סביבה `TIKTRACK_ENV=online` או שם תיקייה

**מפרטים:**

- **פורט:** 80/443 (HTTP/HTTPS דרך Nginx)
- **Database:** `TikTrack-db-online` (על השרת)
- **תיקיית קוד:** על השרת (Git clone)
- **תיקיית לוגים:** על השרת
- **הפעלה:** systemd service או process manager

**תפקיד:**

- סביבת פרודקשן אמיתית
- גישה מהאינטרנט
- משתמשים אמיתיים

**שינויים נדרשים:**

- ✅ יצירת `online/Backend/config/settings.py` (חדש)
- ✅ הגדרות ספציפיות ל-online:
  - `IS_ONLINE = True`
  - `POSTGRES_DB = "TikTrack-db-online"`
  - `HOST = "0.0.0.0"` (להאזנה על כל ה-interfaces)
  - `PORT = 8080` (פנימי, Nginx מעביר ל-80/443)
- ✅ עדכון `start_server.sh` לזיהוי `online` environment

---

## 🔄 זיהוי סביבות

### שיטה 1: שם תיקייה (קיים)

**כרגע:**

- `TikTrackApp` → `development` (פורט 8080)
- `TikTrackApp-Production` → `production` (פורט 5001)

**אחרי השינויים:**

- `TikTrackApp` → `development` (פורט 8080) ✅ ללא שינוי
- `TikTrackApp-Production` → `testing` (פורט 5001) ⚠️ שינוי
- `TikTrackApp-Online` → `online` (פורט 80/443) ⚠️ חדש

### שיטה 2: משתנה סביבה (קיים)

**כרגע:**

- `TIKTRACK_ENV=development` → development
- `TIKTRACK_ENV=production` → production

**אחרי השינויים:**

- `TIKTRACK_ENV=development` → development ✅ ללא שינוי
- `TIKTRACK_ENV=testing` → testing ⚠️ שינוי מ-production
- `TIKTRACK_ENV=online` → online ⚠️ חדש

### עדכון `start_server.sh`

**שינויים נדרשים:**

```bash
# הוספת זיהוי testing
if [[ "$workspace_name" == *"Production"* ]]; then
    echo "testing"  # שינוי מ-production
    return 0
fi

# הוספת זיהוי online
if [[ "$workspace_name" == *"Online"* ]]; then
    echo "online"
    return 0
fi

# הוספת case ל-online
case "$ENVIRONMENT" in
    testing|test|TESTING|Test)
        ENVIRONMENT="testing"
        SERVER_DIR="production/Backend"  # נשאר
        SERVER_PORT=5001
        # ...
        ;;
    online|ONLINE|Online)
        ENVIRONMENT="online"
        SERVER_DIR="online/Backend"  # חדש
        SERVER_PORT=8080  # פנימי
        # ...
        ;;
esac
```

---

## 💾 שמות Databases

### לפני השינויים

- `TikTrack-db-development` - פיתוח ✅ נשאר
- `TikTrack-db-production` - פרודקשן ⚠️ ישתנה

### אחרי השינויים

- `TikTrack-db-development` - פיתוח ✅ נשאר
- `TikTrack-db-testing` - טסטים ⚠️ שינוי מ-production
- `TikTrack-db-online` - אונליין ⚠️ חדש

### תהליך שינוי שם Database

**שינוי מ-production ל-testing:**

```sql
-- יצירת database חדש
CREATE DATABASE "TikTrack-db-testing";

-- העתקת data
pg_dump -d "TikTrack-db-production" | psql -d "TikTrack-db-testing"

-- עדכון config
-- POSTGRES_DB = "TikTrack-db-testing"
```

---

## 📁 מבנה תיקיות

### לפני השינויים

```
TikTrackApp/
├── Backend/              # Development
├── trading-ui/           # Development
└── production/
    ├── Backend/          # Production
    └── trading-ui/       # Production
```

### אחרי השינויים

```
TikTrackApp/
├── Backend/              # Development ✅ ללא שינוי
├── trading-ui/           # Development ✅ ללא שינוי
└── production/           # Testing (שינוי שם לוגי)
    ├── Backend/          # Testing
    └── trading-ui/       # Testing

TikTrackApp-Online/        # Online (על השרת)
├── Backend/              # Online
└── trading-ui/           # Online
```

**הערה:** מבנה התיקיות נשאר זהה, רק המשמעות משתנה:

- `production/` → משמש לטסטים (לא לפרודקשן אמיתי)
- `online/` → משמש לפרודקשן אמיתי (חדש)

---

## ⚙️ הגדרות סביבות

### Development (ללא שינוי)

**`Backend/config/settings.py`:**

```python
ENVIRONMENT = os.getenv("TIKTRACK_ENV", "development").lower()
IS_PRODUCTION = False
IS_TESTING = False
IS_ONLINE = False

POSTGRES_DB = os.getenv("POSTGRES_DB", "TikTrack-db-development")
PORT = 8080
HOST = "127.0.0.1"
```

### Testing (שינוי מ-production)

**`production/Backend/config/settings.py`:**

```python
ENVIRONMENT = os.getenv("TIKTRACK_ENV", "testing").lower()
IS_PRODUCTION = False  # שינוי מ-True
IS_TESTING = True      # חדש
IS_ONLINE = False

POSTGRES_DB = os.getenv("POSTGRES_DB", "TikTrack-db-testing")  # שינוי
PORT = 5001
HOST = "127.0.0.1"
```

### Online (חדש)

**`online/Backend/config/settings.py` (חדש):**

```python
ENVIRONMENT = os.getenv("TIKTRACK_ENV", "online").lower()
IS_PRODUCTION = False
IS_TESTING = False
IS_ONLINE = True  # חדש

POSTGRES_DB = os.getenv("POSTGRES_DB", "TikTrack-db-online")  # חדש
PORT = 8080  # פנימי, Nginx מעביר ל-80/443
HOST = "0.0.0.0"  # להאזנה על כל ה-interfaces
```

---

## 🔄 תהליך שינוי מ-Production ל-Testing

### שלב 1: שינוי שם Database

```bash
# 1. יצירת database חדש
createdb -U TikTrakDBAdmin "TikTrack-db-testing"

# 2. העתקת data
pg_dump -U TikTrakDBAdmin -d "TikTrack-db-production" | \
    psql -U TikTrakDBAdmin -d "TikTrack-db-testing"

# 3. בדיקה
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "\dt"
```

### שלב 2: עדכון Config

```python
# production/Backend/config/settings.py
IS_PRODUCTION = False  # שינוי
IS_TESTING = True      # חדש
POSTGRES_DB = "TikTrack-db-testing"  # שינוי
```

### שלב 3: עדכון start_server.sh

```bash
# הוספת זיהוי testing במקום production
if [[ "$workspace_name" == *"Production"* ]]; then
    echo "testing"  # שינוי מ-production
fi
```

### שלב 4: בדיקות

```bash
# הפעלת סביבת testing
./start_server.sh

# בדיקת database
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "SELECT COUNT(*) FROM trades;"
```

---

## 🆕 יצירת סביבת Online

### שלב 1: יצירת מבנה תיקיות (על השרת)

```bash
# על השרת
mkdir -p /path/to/TikTrackApp-Online
cd /path/to/TikTrackApp-Online

# Clone repository
git clone <repository-url> .
git checkout online  # או branch אחר
```

### שלב 2: יצירת קונפיגורציה

```bash
# יצירת online/Backend/config/settings.py
# (ראה דוגמה למעלה)
```

### שלב 3: יצירת Database

```bash
# על השרת
createdb -U TikTrakDBAdmin "TikTrack-db-online"

# העתקת schema מ-testing
pg_dump -U TikTrakDBAdmin -d "TikTrack-db-testing" --schema-only | \
    psql -U TikTrakDBAdmin -d "TikTrack-db-online"
```

### שלב 4: העתקת Data (אופציונלי)

```bash
# העתקת data מ-testing ל-online (אם נדרש)
pg_dump -U TikTrakDBAdmin -d "TikTrack-db-testing" --data-only | \
    psql -U TikTrakDBAdmin -d "TikTrack-db-online"
```

---

## ✅ Checklist הגדרת סביבות

### Development

- [ ] נשארת ללא שינוי
- [ ] בדיקה שהכל עובד

### Testing

- [ ] שינוי שם database מ-production ל-testing
- [ ] עדכון `production/Backend/config/settings.py`
- [ ] עדכון `start_server.sh` לזיהוי testing
- [ ] בדיקות שהכל עובד

### Online

- [ ] יצירת מבנה תיקיות על השרת
- [ ] יצירת `online/Backend/config/settings.py`
- [ ] יצירת database `TikTrack-db-online`
- [ ] עדכון `start_server.sh` לזיהוי online
- [ ] הגדרת Nginx
- [ ] הגדרת SSL
- [ ] הגדרת systemd service
- [ ] בדיקות מקיפות

---

## 🔗 קבצים רלוונטיים

### קבצי Config

- `Backend/config/settings.py` - Development (ללא שינוי)
- `production/Backend/config/settings.py` - Testing (שינוי)
- `online/Backend/config/settings.py` - Online (חדש)

### סקריפטים

- `start_server.sh` - עדכון לזיהוי 3 סביבות
- `scripts/sync_to_online.py` - חדש (סינכרון ל-online)

### Documentation

- `documentation/production/ONLINE_DEPLOYMENT/ENVIRONMENT_SETUP.md` - זה הקובץ
- `documentation/production/ONLINE_DEPLOYMENT/ENVIRONMENT_NAMING.md` - שמות וזיהוי

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0


