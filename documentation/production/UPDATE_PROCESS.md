# TikTrack Production Update Process - מדריך עדכון פרודקשן

**תאריך:** 2025-11-09  
**גרסה:** 1.2.0  
**מטרה:** תהליך מלא ומסודר לעדכון קוד הפרודקשן המקומי מול Git

**⚠️ עדכון חשוב:** גרסה זו כוללת תיקונים קריטיים לבדיקת הגדרות production אחרי sync

**🆕 עדכון 1.2.0:** כל ה-hardcoded URLs הוחלפו ב-relative URLs - הקוד עובד אוטומטית בפיתוח ובפרודקשן

---

## 📋 תהליך עדכון פרודקשן - סקירה מהירה

### תהליך מלא (5 שלבים):

1. **עדכון main branch** - משיכת שינויים אחרונים
2. **מיזוג main → production** - העברת שינויים לפרודקשן
3. **סינכרון קוד** - העתקת קבצים פעילים לפרודקשן
4. **בדיקות** - אימות שהכל עובד
5. **Commit & Push** - שמירת שינויים ב-Git

---

## 🚀 תהליך מפורט

### שלב 1: עדכון Main Branch

```bash
# עבור לענף פיתוח
git checkout main

# משוך עדכונים אחרונים
git pull origin main

# בדוק שיש שינויים חדשים
git log --oneline -10
```

**מטרה:** לוודא שיש את כל השינויים האחרונים לפני המיזוג.

---

### שלב 2: מיזוג Main → Production

```bash
# עבור לענף פרודקשן
git checkout production

# משוך עדכונים אחרונים של פרודקשן (אם יש)
git pull origin production

# מיזוג שינויים מ-main
git merge main

# אם יש קונפליקטים - פתור אותם ידנית
# אחרי פתרון קונפליקטים:
git add .
git commit -m "Merge main into production: [תאריך/תיאור]"
```

**⚠️ חשוב:**
- אם יש קונפליקטים, פתור אותם בזהירות
- **בקונפליקטים:** השתמש ב-`git checkout --theirs` עבור רוב הקבצים (לקחת מ-main)
- ודא שהקבצים ב-`production/Backend/` לא נפגעו
- **קריטי:** אחרי המיזוג, תמיד תקן את `production/Backend/config/settings.py` ו-`config/logging.py` (ראה שלב 3.5)

---

### שלב 3: סינכרון קוד לפרודקשן

```bash
# ודא שאתה ב-production branch
git checkout production

# הרץ סקריפט סינכרון (מעתיק Backend + UI)
./scripts/sync_to_production.py
```

**מה הסקריפט עושה:**
- מעתיק קבצים פעילים מ-`Backend/` ל-`production/Backend/`
- מעתיק UI מ-`trading-ui/` ל-`production/trading-ui/`
- שומר רק על קבצים פעילים (ללא tests/migrations)

**תוצאה צפויה:**
```
✅ Backend sync completed: ~157 files copied
✅ UI sync completed: ~490 files copied
```

**⚠️ חשוב:** הסקריפט `sync_to_production.py` מעתיק את `config/settings.py` מ-Backend, אבל הקובץ ב-production צריך להיות hardcoded ל-production mode!

---

### שלב 3.5: תיקון הגדרות Production (קריטי!)

**⚠️ שלב זה חובה!** אחרי sync, הקבצים `config/settings.py` ו-`config/logging.py` עלולים להיות לא נכונים.

```bash
# בדוק את ההגדרות
cd production/Backend
python3 -c "from config.settings import UI_DIR, DB_PATH, PORT, IS_PRODUCTION; \
    print(f'UI: {UI_DIR}'); \
    print(f'DB: {DB_PATH}'); \
    print(f'Port: {PORT}'); \
    print(f'Production: {IS_PRODUCTION}')"
```

**תוצאה צפויה:**
```
UI: /path/to/production/trading-ui
DB: /path/to/production/Backend/db/TikTrack_DB.db
Port: 5001
Production: True
```

**אם התוצאה לא נכונה (Port=8080 או Production=False):**

1. **תקן `production/Backend/config/settings.py`:**
   - ודא ש-`IS_PRODUCTION = True` (hardcoded)
   - ודא ש-`PORT = 5001` (hardcoded)
   - ודא ש-`DB_PATH` מצביע על `TikTrack_DB.db`
   - ודא ש-`UI_DIR` מצביע על `production/trading-ui`

2. **תקן `production/Backend/config/logging.py`:**
   - ודא ש-`log_dir = Path("logs")` (לא `logs-production`)

**דוגמה לתיקון מהיר:**
```bash
# אם ההגדרות לא נכונות, ערוך את הקבצים:
# production/Backend/config/settings.py - ודא hardcoded production
# production/Backend/config/logging.py - ודא log_dir = Path("logs")
```

---

### שלב 4: בדיקות ואימות

#### בדיקה 1: אימות הפרדה

```bash
# בדיקת הפרדה מלאה
./scripts/verify_production_isolation.sh
```

**תוצאה צפויה:**
```
✅ Isolation verification passed
```

#### בדיקה 2: אימות מבנה

```bash
# בדיקת מבנה כללי
./scripts/verify_production.sh
```

**תוצאה צפויה:**
```
✅ Verification passed
```

#### בדיקה 3: בדיקת הגדרות

```bash
cd production/Backend
python3 -c "from config.settings import UI_DIR, DB_PATH, PORT, IS_PRODUCTION; \
    print(f'UI: {UI_DIR}'); \
    print(f'DB: {DB_PATH}'); \
    print(f'Port: {PORT}'); \
    print(f'Production: {IS_PRODUCTION}')"
```

**תוצאה צפויה:**
```
UI: /path/to/production/trading-ui
DB: /path/to/production/Backend/db/TikTrack_DB.db
Port: 5001
Production: True
```

#### בדיקה 4: בדיקת imports

```bash
cd production/Backend
python3 -c "from services.preferences_service import PreferencesService; print('✅ OK')"
```

**תוצאה צפויה:** `✅ OK` (ללא שגיאות)

#### בדיקה 5: בדיקת הפעלת שרת (אופציונלי)

```bash
cd production
./start_production.sh --check-only
```

**תוצאה צפויה:**
```
✅ No conflicts found - server can start safely
```

---

### שלב 5: Commit & Push

```bash
# ודא שאתה ב-production branch
git checkout production

# בדוק מה השתנה
git status --short

# הוסף את כל השינויים
git add production/ scripts/ .vscode/tasks.json documentation/production/

# Commit עם הודעה ברורה
git commit -m "feat: Update production from main - [תאריך/גרסה]

- Synced Backend code from main
- Synced UI from trading-ui
- Updated [רשימת שינויים עיקריים]
- Verified isolation and functionality"

# Push ל-remote
git push origin production
```

**⚠️ חשוב:**
- אל תכלול קבצי DB או logs ב-commit
- ודא ש-`.gitignore` מונע זאת
- בדוק את ה-commit לפני push

---

## 📝 תהליך מהיר (Quick Update)

אם אתה בטוח שהכל תקין ורוצה תהליך מהיר:

```bash
# 1. עדכון ומיזוג
git checkout main && git pull origin main
git checkout production && git pull origin production
git merge main

# 2. סינכרון
./scripts/sync_to_production.py

# 3. בדיקה מהירה
./scripts/verify_production_isolation.sh

# 4. Commit & Push
git add production/ scripts/ documentation/production/
git commit -m "feat: Update production from main"
git push origin production
```

---

## 🔍 פתרון בעיות

### בעיה: קונפליקטים במיזוג

**פתרון:**
```bash
# בדוק את הקונפליקטים
git status

# פתור ידנית את הקבצים עם קונפליקטים
# ודא שהקבצים ב-production/Backend/ נשארים נכונים

# אחרי פתרון:
git add .
git commit -m "Resolve merge conflicts"
```

### בעיה: קבצים חסרים אחרי sync

**פתרון:**
```bash
# הרץ sync שוב
./scripts/sync_to_production.py

# בדוק מה חסר
./scripts/verify_production.sh

# אם צריך, הוסף ידנית קבצים ספציפיים
```

### בעיה: שגיאות imports אחרי sync

**פתרון:**
```bash
# בדוק את ההגדרות
cd production/Backend
python3 -c "from config.settings import DB_PATH, UI_DIR, PORT, IS_PRODUCTION; \
    print(f'DB: {DB_PATH}'); \
    print(f'UI: {UI_DIR}'); \
    print(f'Port: {PORT}'); \
    print(f'Production: {IS_PRODUCTION}')"

# אם יש בעיה, תקן את config/settings.py
# ודא ש-IS_PRODUCTION = True (hardcoded)
# ודא ש-PORT = 5001 (hardcoded)
# ודא ש-UI_DIR מצביע על production/trading-ui
# ודא ש-DB_PATH מצביע על production/Backend/db/TikTrack_DB.db
```

### בעיה: הגדרות production לא נכונות אחרי sync

**זו בעיה נפוצה!** הסקריפט sync מעתיק את `config/settings.py` מ-Backend, אבל ב-production צריך hardcoded values.

**פתרון:**
1. פתח `production/Backend/config/settings.py`
2. ודא שהקובץ מכיל:
   ```python
   IS_PRODUCTION = True  # Hardcoded!
   PORT = 5001  # Hardcoded!
   DB_PATH = BASE_DIR / "db" / "TikTrack_DB.db"
   UI_DIR = BASE_DIR.parent / "trading-ui"
   ```
3. פתח `production/Backend/config/logging.py`
4. ודא ש-`log_dir = Path("logs")` (לא `logs-production`)

### בעיה: שרת לא מתחיל

**פתרון:**
```bash
# בדוק קונפליקטים על הפורט
lsof -i :5001

# בדוק את הלוגים
tail -f production/Backend/logs/app.log

# בדוק את ההגדרות
cd production/Backend
python3 -c "from config.settings import PORT, DB_PATH, UI_DIR; \
    print(f'Port: {PORT}'); \
    print(f'DB exists: {DB_PATH.exists()}'); \
    print(f'UI exists: {UI_DIR.exists()}')"
```

---

## ✅ Checklist לפני Commit

לפני commit, ודא:

- [ ] כל הבדיקות עברו בהצלחה
- [ ] אין קבצי DB או logs ב-commit
- [ ] **ההגדרות ב-`production/Backend/config/settings.py` נכונות (hardcoded production)**
- [ ] **ההגדרות ב-`production/Backend/config/logging.py` נכונות (logs directory)**
- [ ] UI_DIR מצביע על `production/trading-ui`
- [ ] DB_PATH מצביע על `production/Backend/db/TikTrack_DB.db`
- [ ] PORT = 5001 (hardcoded)
- [ ] IS_PRODUCTION = True (hardcoded)
- [ ] ה-commit message ברור ומתאר את השינויים
- [ ] אם יש מיגרציות חדשות, הן נוספו ל-`create_production_db.py`

---

## 📊 דוגמה לתהליך מלא

```bash
# ============================================
# תהליך עדכון פרודקשן - דוגמה מלאה
# ============================================

# 1. עדכון main
git checkout main
git pull origin main
echo "✅ Main updated"

# 2. מיזוג ל-production
git checkout production
git pull origin production
git merge main
echo "✅ Merged main into production"

# 3. סינכרון קוד
./scripts/sync_to_production.py
echo "✅ Code synced"

# 3.5. תיקון הגדרות Production (קריטי!)
cd production/Backend
python3 -c "from config.settings import PORT, IS_PRODUCTION; \
    assert PORT == 5001, f'Port should be 5001, got {PORT}'; \
    assert IS_PRODUCTION == True, f'Should be production, got {IS_PRODUCTION}'; \
    print('✅ Production settings verified')"
cd ../..
echo "✅ Production settings verified"

# 4. בדיקות
./scripts/verify_production_isolation.sh
./scripts/verify_production.sh
echo "✅ Verification passed"

# 5. Commit & Push
git add production/ scripts/ documentation/production/
git commit -m "feat: Update production from main - $(date +%Y-%m-%d)"
git push origin production
echo "✅ Pushed to remote"

echo "🎉 Production update completed successfully!"
```

---

## 🔗 קבצים רלוונטיים

- `scripts/sync_to_production.py` - סקריפט סינכרון קוד
- `scripts/sync_ui_to_production.py` - סקריפט סינכרון UI
- `scripts/verify_production_isolation.sh` - בדיקת הפרדה
- `scripts/verify_production.sh` - בדיקת מבנה כללי
- `production/Backend/config/settings.py` - **הגדרות פרודקשן (חייב להיות hardcoded!)**
- `production/Backend/config/logging.py` - הגדרות לוגים (חייב להיות hardcoded!)
- `production/Backend/scripts/create_production_db.py` - יצירת DB פרודקשן (כולל מיגרציות)
- `production/Backend/scripts/cleanup_import_sessions.py` - ניקוי סשני ייבוא ישנים
- `production/start_production.sh` - הפעלת שרת

---

## 📚 תיעוד נוסף

- `CODE_SEPARATION.md` - מדריך הפרדת קוד
- `ISOLATION_VERIFICATION.md` - בדיקות הפרדה
- `PARALLEL_RUNNING.md` - הרצה במקביל
- `PRODUCTION_SETUP.md` - הקמת סביבה

---

**עודכן:** 2025-11-09  
**גרסה:** 1.3.0  
**מטרה:** תהליך עדכון מסודר ומובנה

## 📝 שינויים בגרסה 1.3.0

- ✅ **תיקון Rate Limiting:** הוספת debouncing למניעת קריאות API מרובות ב-`trading_accounts.js`
- ✅ **תיקון Currencies Endpoint:** תיקון נתיב DB ב-`currencies.py` לשימוש ב-production DB
- ✅ **מניעת קריאות כפולות:** הוספת flags למניעת קריאות סימולטניות
- ✅ **טיפול בשגיאות Rate Limit:** הוספת טיפול אוטומטי בשגיאות 429 עם retry logic

## 📝 שינויים בגרסה 1.2.0

- ✅ **מרכזת כתובות API:** כל ה-hardcoded URLs הוחלפו ב-relative URLs (`/api/...`)
- ✅ **קובץ api-config.js:** יצירת קובץ הגדרות מרכזי (מינימלי - רק window.API_BASE_URL)
- ✅ **סקריפט בדיקה:** יצירת `scripts/check-hardcoded-urls.py` לבדיקת hardcoded URLs
- ✅ **תמיכה אוטומטית:** הקוד עובד אוטומטית בפיתוח (8080) ובפרודקשן (5001)
- ✅ **הסרת file protocol fallback:** לא נדרש בפרודקשן - פתיחה ישירה לא נתמכת

## 📝 שינויים בגרסה 1.1.0

- ✅ הוספת שלב 3.5: תיקון הגדרות Production (קריטי!)
- ✅ עדכון פתרון בעיות עם תיקון הגדרות אחרי sync
- ✅ עדכון checklist עם בדיקת הגדרות hardcoded
- ✅ הוספת מידע על מיגרציות וסקריפטים חדשים


