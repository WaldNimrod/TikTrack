# TikTrack Production Update Process - מדריך עדכון פרודקשן

**תאריך:** 2025-11-22  
**גרסה:** 1.4.0  
**מטרה:** תהליך מלא ומסודר לעדכון קוד הפרודקשן המקומי מול Git

**⚠️ עדכון חשוב:** גרסה זו כוללת תיקונים קריטיים לבדיקת הגדרות production אחרי sync

**🆕 עדכון 1.2.0:** כל ה-hardcoded URLs הוחלפו ב-relative URLs - הקוד עובד אוטומטית בפיתוח ובפרודקשן

**🆕 עדכון 1.3.0:** שינוי מ-whitelist ל-blacklist - כל הקבצים מתעדכנים אוטומטית למעט חריגים ספציפיים (tests, archive, backups, documentation, legacy). הוספת verification מקיף אחרי sync.

**🆕 עדכון 1.4.0:** הסרת אזכורים ל-SQLite מהתיעוד - המערכת עברה ל-PostgreSQL. הוספת סעיף על בדיקת צורך במיגרציות (ידני).

---

## 📋 תהליך עדכון פרודקשן - סקירה מהירה

### תהליך מלא (7 שלבים):

0. **הכנה בסביבת הפיתוח** - שמירת שינויים ויצירת changelog
1. **עדכון main branch** - משיכת שינויים אחרונים
2. **מיזוג main → production** - העברת שינויים לפרודקשן
3. **סינכרון קוד** - העתקת קבצים פעילים לפרודקשן
4. **בדיקות** - אימות שהכל עובד
5. **עדכון גרסה** - קידום `Patch/Build` במערכת הגרסאות
6. **Commit & Push** - שמירת שינויים ב-Git

---

## 🚀 תהליך מפורט

### שלב 0: הכנה בסביבת הפיתוח (קריטי!)

**⚠️ שלב זה חובה לפני כל sync לפרודקשן!**

#### 0.1: בדיקת שינויים לא שמורים

```bash
# בדוק שיש שינויים לא שמורים
git status

# אם יש שינויים - שמור אותם
git add .
git commit -m "feat: [תיאור השינויים]"
```

#### 0.2: Push ל-main

```bash
# ודא שאתה ב-main branch
git checkout main

# Push את כל השינויים
git push origin main
```

#### 0.3: יצירת Changelog

```bash
# יצירת changelog אוטומטי
python3 scripts/production-update/prepare_changelog.py
```

**מה הסקריפט עושה:**
- בודק שינויים לא שמורים
- מזהה שינויים קריטיים (config, DB schema, server)
- יוצר changelog עם רשימת שינויים
- שומר ב-`_Tmp/production_sync_changelog_[timestamp].md`

#### 0.4: Pre-Sync Validation

```bash
# בדיקת מוכנות לסנכרון
python3 scripts/pre_sync_validation.py
```

**מה הסקריפט בודק:**
- שינויים לא שמורים ב-git
- קבצי backup/debug
- קבצים קריטיים קיימים

**תוצאה צפויה:**
```
✅ Pre-sync validation passed!
   Ready to sync to production
```

#### Checklist לפני המשך:

- [ ] כל השינויים נשמרו ב-git
- [ ] כל השינויים נדחפו ל-main
- [ ] Changelog נוצר
- [ ] Pre-sync validation עבר בהצלחה
- [ ] אין שינויים לא שמורים

---

### שלב 0.5: שמירת שינויים בפרודקשן (קריטי!)

**⚠️ שלב זה חובה לפני כל merge!**

אם יש שינויים שנעשו ישירות בסביבת הפרודקשן (למשל ב-`config/settings.py`), הם חייבים להישמר לפני המיזוג.

```bash
# 1. מעבר ל-production worktree (אם יש)
cd /path/to/TikTrackApp-Production

# 2. בדיקת שינויים לא שמורים בפרודקשן
git status

# 3. שמירת שינויים בפרודקשן (אם יש)
# זה קריטי! שינויים ב-config/settings.py וכו' חייבים להישמר
git add production/Backend/config/
git commit -m "chore: Preserve production config changes [תאריך]"
git push origin production
```

**קבצים שצריך לשמור:**
- `production/Backend/config/settings.py` - הגדרות production
- `production/Backend/config/logging.py` - הגדרות logging
- `production/Backend/config/database.py` - הגדרות database
- כל שינוי אחר שנעשה ישירות בפרודקשן

**⚠️ חשוב:** Conflict resolver ב-`scripts/production-update/utils/conflict_resolver.py` שומר אוטומטית על קבצי config של production במהלך merge, אבל רק אם הם כבר ב-git!

---

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

**התהליך מבוסס על `scripts/production-update/master.py` הקיים ב-production branch**

#### אופציה 1: שימוש ב-Master Script (מומלץ)

```bash
# עבור לענף פרודקשן
git checkout production

# משוך עדכונים אחרונים של פרודקשן
git pull origin production

# מיזוג שינויים מ-main
git merge main

# הרצת Master Script (11 שלבים אוטומטיים)
python3 scripts/production-update/master.py
```

**Master Script מבצע:**
- Step 1: Collect Changes - איסוף שינויים מ-main
- Step 2: Merge Main - מיזוג main → production (עם conflict resolver אוטומטי)
- Step 3: Cleanup Documentation - ניקוי דוקומנטציה
- Step 4: Backup Database - גיבוי DB
- Step 5: Sync Code - סנכרון קוד (Backend + UI) + post-sync transformations + verification
- Step 5b: Verify Sync - בדיקת שלמות העדכון (file count, checksums, directory structure) - **חובה**
- Step 6: Cleanup Backups - ניקוי קבצי גיבוי
- Step 7: Fix Config - תיקון הגדרות production
- Step 8: Validate - בדיקות ואימות
- Step 9: Bump Version - עדכון גרסה
- Step 10: Commit & Push - Git commit & push
- Step 11: Start Server - הפעלת שרת (אופציונלי)

#### אופציה 2: תהליך ידני

```bash
# עבור לענף פרודקשן
git checkout production

# משוך עדכונים אחרונים של פרודקשן
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
- **בקונפליקטים:** Conflict resolver שומר אוטומטית על קבצי config של production
- ודא שהקבצים ב-`production/Backend/` לא נפגעו
- **קריטי:** אחרי המיזוג, תמיד תקן את `production/Backend/config/settings.py` ו-`config/logging.py` (ראה שלב 3.5)

---

### שלב 3: סינכרון קוד לפרודקשן

**אם השתמשת ב-Master Script, שלב זה כבר בוצע אוטומטית!**

אם לא, הרץ ידנית:

```bash
# ודא שאתה ב-production branch
git checkout production

# הרץ סקריפט סינכרון (מעתיק Backend + UI)
./scripts/sync_to_production.py
```

**מה הסקריפט עושה:**
- **גיבוי DB** - מגבה את ה-DB לפני מחיקת production directory
- **מעתיק כל הקבצים** מ-`Backend/` ל-`production/Backend/` (blacklist approach)
- **מעתיק UI** מ-`trading-ui/` ל-`production/trading-ui/` (עם copy_function=shutil.copy2)
- **מחריג רק קבצים ספציפיים** (blacklist): tests, archive, backups, documentation, legacy, migrations, logs, coverage, __pycache__, .git, node_modules
- **משחזר DB** - משחזר את ה-DB אחרי sync
- **בודק קבצים קריטיים** - verifies critical files (header-system.js, header-styles.css, וכו')
- **בודק verification** - מבצע בדיקות מקיפות אחרי sync (file count, checksums, directory structure)

**🆕 עדכון 1.3.0 - Blacklist Approach:**
התהליך שונה מ-whitelist מוגבל ל-blacklist מקיף:
- **ברירת מחדל:** העתק הכל מ-main לפרודקשן
- **חריגים (EXCLUDED):** רק קבצים/תיקיות שצריך להוציא:
  - `tests/`, `test/` - טסטים
  - `archive/`, `archives/` - ארכיון
  - `backup/`, `backups/` - גיבויים
  - `documentation/`, `docs/` - דוקומנטציה
  - `legacy/`, `old/`, `deprecated/` - קוד לגסי/ישן
  - `debug/`, `debugs/` - קבצי debug (לא נדרש בפרודקשן)
  - `migrations/` - migrations (לא נדרש בפרודקשן)
  - `db/` - נשמר בנפרד
  - `logs/`, `coverage/`, `__pycache__/`, `.git/`, `node_modules/` - קבצים טכניים
  - קבצים עם `*debug*`, `*Debug*`, `*DEBUG*` בשם - קבצי debug

**יתרונות:**
- כל הקבצים מתעדכנים אוטומטית
- אין צורך לעדכן רשימות whitelist ידנית
- קבצים חדשים מתעדכנים אוטומטית
- verification אוטומטי מאשר שהכל עודכן

**תוצאה צפויה:**
```
💾 Backing up production DB before sync...
   ✅ DB backed up to: db_backup_before_sync.db
✅ Backend sync completed: ~157 files copied
✅ UI sync completed: ~490 files
   📄 CSS files: ~60
   📄 JS files: ~270
   📄 HTML files: ~50
🔍 Verifying critical files...
  ✅ scripts/header-system.js
  ✅ styles-new/header-styles.css
  ✅ data_import.html
  ✅ index.html
💾 Restoring production DB from backup...
   ✅ DB restored
```

**⚠️ חשוב:** הסקריפט `sync_to_production.py` מעתיק את `config/settings.py` מ-Backend, אבל הקובץ ב-production צריך להיות hardcoded ל-production mode! (Post-sync transformer מתקן זאת אוטומטית)

---

### שלב 3.5: תיקון הגדרות Production (קריטי!)

**⚠️ שלב זה חובה!** אחרי sync, הקבצים `config/settings.py` ו-`config/logging.py` עלולים להיות לא נכונים.

```bash
# בדוק את ההגדרות
cd production/Backend
python3 -c "from config.settings import UI_DIR, DATABASE_URL, PORT, IS_PRODUCTION, USING_SQLITE; \
    print(f'UI: {UI_DIR}'); \
    print(f'DB: {DATABASE_URL[:50]}...'); \
    print(f'Using SQLite: {USING_SQLITE}'); \
    print(f'Port: {PORT}'); \
    print(f'Production: {IS_PRODUCTION}')"
```

**תוצאה צפויה:**
```
UI: /path/to/production/trading-ui
DB: PostgreSQL connection string (postgresql+psycopg2://...)
Port: 5001
Production: True
```

**אם התוצאה לא נכונה (Port=8080 או Production=False):**

1. **תקן `production/Backend/config/settings.py`:**
   - ודא ש-`IS_PRODUCTION = True` (hardcoded)
   - ודא ש-`PORT = 5001` (hardcoded)
   - ודא ש-`DATABASE_URL` מצביע על PostgreSQL (לא SQLite)
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

**אם השתמשת ב-Master Script, חלק מהבדיקות כבר בוצעו אוטומטית!**

#### בדיקה 1: Sync Verification

```bash
# בדיקת sync עם checksums
python3 scripts/sync_verifier.py
```

**תוצאה צפויה:**
```
✅ All critical files verified
✅ Sync verification passed!
```

#### בדיקה 2: אימות הפרדה

```bash
# בדיקת הפרדה מלאה
./scripts/verify_production_isolation.sh
```

**תוצאה צפויה:**
```
✅ Isolation verification passed
```

#### בדיקה 3: אימות מבנה

```bash
# בדיקת מבנה כללי (עם רשימת קבצים שונים)
./scripts/verify_production.sh
```

**תוצאה צפויה:**
```
✅ Verification passed
```

**אם יש קבצים שונים:**
```
⚠️  File Differences: 5 files differ from development
   First 5 different files:
     - routes/api/tickers.py
     - services/alert_service.py
     ...
```

#### בדיקה 3: בדיקת הגדרות

```bash
cd production/Backend
python3 -c "from config.settings import UI_DIR, DATABASE_URL, PORT, IS_PRODUCTION, USING_SQLITE; \
    print(f'UI: {UI_DIR}'); \
    print(f'DB: {DATABASE_URL[:50]}...'); \
    print(f'Using SQLite: {USING_SQLITE}'); \
    print(f'Port: {PORT}'); \
    print(f'Production: {IS_PRODUCTION}')"
```

**תוצאה צפויה:**
```
UI: /path/to/production/trading-ui
DB: PostgreSQL connection string (postgresql+psycopg2://...)
Port: 5001
Production: True
```

#### בדיקה 4: בדיקת imports

```bash
cd production/Backend
python3 -c "from services.preferences_service import PreferencesService; print('✅ OK')"
```

**תוצאה צפויה:** `✅ OK` (ללא שגיאות)

#### בדיקה 4.5: בדיקת צורך במיגרציות

**⚠️ חשוב:** המערכת לא מזהה אוטומטית מיגרציות חדשות. יש לבדוק ידנית:

```bash
# 1. בדוק אם יש מיגרציות חדשות ב-Backend/migrations/
ls -lt Backend/migrations/ | head -10

# 2. בדוק אם יש שינויים במודלים (models/)
git diff main production -- Backend/models/

# 3. אם יש מיגרציות חדשות, בדוק אם הטבלאות/עמודות שהן יוצרות כבר קיימות
# לדוגמה, אם יש מיגרציה create_ticker_provider_symbols_table:
cd production/Backend
python3 -c "
from sqlalchemy import create_engine, inspect
from config.settings import DATABASE_URL
engine = create_engine(DATABASE_URL)
inspector = inspect(engine)
tables = inspector.get_table_names()
if 'ticker_provider_symbols' not in tables:
    print('⚠️  טבלה ticker_provider_symbols לא קיימת - צריך להריץ מיגרציה')
else:
    print('✅ טבלה ticker_provider_symbols קיימת')
"

# 4. אם צריך, הרץ מיגרציה ידנית:
# python3 Backend/migrations/create_ticker_provider_symbols_table.py
```

**הערה:** כרגע אין מערכת אוטומטית לזיהוי מיגרציות. כל מיגרציה היא קובץ Python עם פונקציה `run_migration()` שצריך להריץ ידנית.

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

### שלב 5: עדכון גרסה

```bash
# קידום גרסת הפרודקשן אחרי סנכרון קוד
python3 scripts/versioning/bump-version.py \
  --env production \
  --bump patch \
  --note "Sync main into production - $(date +%Y-%m-%d)"

# הפעלה נוספת של אותו קוד (בחירה)
python3 scripts/versioning/bump-version.py \
  --env production \
  --bump build \
  --note "Restart production server"
```

- כל הרצות הסקריפט מעדכנות את `documentation/version-manifest.json` ואת ההיסטוריה (`documentation/production/VERSION_HISTORY.md`).
- **Major/Minor** מתקדמים רק באישור נמרוד (`--set-version ... --allow-major-minor`).
- בתהליך הבא יש לציין בהערת הגרסה את הפעולה (מיזוג, הפעלה, hotfix וכו').

---

### שלב 6: Commit & Push

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
# 0. הכנה בסביבת הפיתוח
git checkout main
git add . && git commit -m "feat: [תיאור]" && git push origin main
python3 scripts/production-update/prepare_changelog.py
python3 scripts/pre_sync_validation.py

# 1. עדכון ומיזוג (בסביבת הפרודקשן)
cd /path/to/TikTrackApp-Production
git checkout production && git pull origin production
git merge main

# 2. הרצת Master Script (כולל sync, בדיקות, commit)
python3 scripts/production-update/master.py

# 3. תיעוד עדכוני שרת (אם צריך)
python3 scripts/production-update/document_server_changes.py
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
python3 -c "from config.settings import DATABASE_URL, UI_DIR, PORT, IS_PRODUCTION, USING_SQLITE; \
    print(f'DB: {DATABASE_URL[:50]}...'); \
    print(f'Using SQLite: {USING_SQLITE}'); \
    print(f'UI: {UI_DIR}'); \
    print(f'Port: {PORT}'); \
    print(f'Production: {IS_PRODUCTION}')"

# אם יש בעיה, תקן את config/settings.py
# ודא ש-IS_PRODUCTION = True (hardcoded)
# ודא ש-PORT = 5001 (hardcoded)
# ודא ש-UI_DIR מצביע על production/trading-ui
# ודא ש-DATABASE_URL מצביע על PostgreSQL (לא SQLite)
```

### בעיה: הגדרות production לא נכונות אחרי sync

**זו בעיה נפוצה!** הסקריפט sync מעתיק את `config/settings.py` מ-Backend, אבל ב-production צריך hardcoded values.

**פתרון:**
1. פתח `production/Backend/config/settings.py`
2. ודא שהקובץ מכיל:
   ```python
   IS_PRODUCTION = True  # Hardcoded!
   PORT = 5001  # Hardcoded!
   DATABASE_URL = "postgresql+psycopg2://..."  # PostgreSQL connection string
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
- [ ] DATABASE_URL מצביע על PostgreSQL (לא SQLite)
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

### סקריפטים מרכזיים:
- `scripts/production-update/master.py` - Master Script (11 שלבים אוטומטיים)
- `scripts/sync_to_production.py` - סקריפט סינכרון קוד (עם DB protection)
- `scripts/sync_ui_to_production.py` - סקריפט סינכרון UI (עם verification)
- `scripts/sync_verifier.py` - בדיקת sync עם checksums
- `scripts/pre_sync_validation.py` - בדיקת מוכנות לפני sync
- `scripts/production-update/prepare_changelog.py` - יצירת changelog
- `scripts/production-update/document_server_changes.py` - תיעוד עדכוני שרת

### בדיקות:
- `scripts/verify_production_isolation.sh` - בדיקת הפרדה
- `scripts/verify_production.sh` - בדיקת מבנה כללי (עם רשימת קבצים שונים)
- `production/Backend/config/settings.py` - **הגדרות פרודקשן (חייב להיות hardcoded!)**
- `production/Backend/config/logging.py` - הגדרות לוגים (חייב להיות hardcoded!)
- `production/Backend/routes/api/currencies.py` - **Endpoint מטבעות (משתמש ב-production DB)**
- `production/trading-ui/scripts/trading_accounts.js` - **Rate limiting ו-debouncing**
- `production/trading-ui/scripts/api-config.js` - הגדרות API מרכזיות
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

**עודכן:** 2025-11-22  
**גרסה:** 1.4.0  
**מטרה:** תהליך עדכון מסודר ומובנה

## 📝 שינויים בגרסה 1.4.0

- ✅ **הסרת אזכורים ל-SQLite:** עדכון התיעוד - המערכת עברה ל-PostgreSQL
- ✅ **בדיקת מיגרציות:** הוספת סעיף על בדיקת צורך במיגרציות (ידני)
- ✅ **עדכון בדיקות הגדרות:** שינוי מ-`DB_PATH` ל-`DATABASE_URL` ו-`USING_SQLITE`

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


