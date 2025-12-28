# TikTrack Production Update Process - מדריך עדכון פרודקשן

**תאריך:** 2025-11-25  
**גרסה:** 1.4.1  
**מטרה:** תהליך מלא ומסודר לעדכון קוד הפרודקשן המקומי מול Git (ענף production באותו ריפו)

**⚠️ עדכון חשוב:** גרסה זו כוללת תיקונים קריטיים לבדיקת הגדרות production אחרי sync

**🆕 עדכון 1.4.1:** הוספת תמיכה בדילוג על פעולות בסיס הנתונים (גיבוי ומיגרציות) עם `--skip-db` flag

**🆕 עדכון 1.4.0:** המערכת משתמשת ב-PostgreSQL בלבד. כל התיעוד והסקריפטים עודכנו בהתאם.

**🆕 עדכון 1.3.7.0:** מערכת עדכון מלאה עם ניהול שרת, זיהוי מיגרציות אוטומטי, תמיכה מלאה ב-PostgreSQL, ובדיקות E2E בדפדפן

**🆕 עדכון 1.3.0:** שינוי מ-whitelist ל-blacklist - כל הקבצים מתעדכנים אוטומטית למעט חריגים ספציפיים (tests, archive, backups, documentation, legacy). הוספת verification מקיף אחרי sync.

**🆕 עדכון 1.2.0:** כל ה-hardcoded URLs הוחלפו ב-relative URLs - הקוד עובד אוטומטית בפיתוח ובפרודקשן

**חשוב:** המסמך מניח עבודה מתוך worktree הפרודקשן (`TikTrackApp-Production`).  
אין תיקיית `production/` בתוך `TikTrackApp` (פיתוח). כל נתיב שמופיע כאן תחת `production/` מתייחס ל‑root של ה‑worktree.

---

## 📋 תהליך עדכון פרודקשן - סקירה מהירה

### תהליך מלא (17 שלבים אוטומטיים)

0. **הכנה בסביבת הפיתוח** - שמירת שינויים ויצירת changelog
1. **שמירת שינויים בפרודקשן** - שמירת שינויים מקומיים לפני עדכון
2. **בדיקת מצב השרת** - בדיקה אם השרת רץ על פורט 5001
3. **גיבוי PostgreSQL** - יצירת גיבוי לפני עדכון
4. **עדכון main branch** - משיכת שינויים אחרונים
5. **מיזוג main → production** - העברת שינויים לפרודקשן
6. **סינכרון קוד** - העתקת קבצים פעילים לפרודקשן
7. **עצירת השרת** - עצירה בטוחה של השרת (אם רץ)
8. **הרצת מיגרציות** - זיהוי והרצת מיגרציות נדרשות (אוטומטי!)
9. **תיקון הגדרות production** - וידוא הגדרות נכונות
10. **בדיקת עדכונים דרושים** - בדיקת dependencies וקבצים קריטיים
11. **עדכון השרת** - התקנת dependencies חדשים
12. **בדיקות אימות** - אימות שהכל עובד
13. **הפעלת השרת** - הפעלה על פורט 5001 עם health check
14. **בדיקת יציבות** - וידוא שהשרת רץ יציב
15. **עדכון גרסה** - קידום `Patch/Build` במערכת הגרסאות
16. **Commit & Push** - שמירת שינויים ב-Git
17. **בדיקות E2E בדפדפן** - בדיקות end-to-end מקיפות (חדש!)

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

#### Checklist לפני המשך

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

### שלב 0.6: בחירת פעולות בסיס הנתונים (חדש!)

**🆕 עדכון 1.4.1:** המערכת מאפשרת לבחור האם לבצע פעולות בסיס הנתונים.

לפני תחילת תהליך העדכון, יש להחליט האם לבצע פעולות בסיס הנתונים:

#### אופציה 1: לדלג על כל פעולות DB (מומלץ אם DB כבר מוכן)

אם בסיס הנתונים כבר מעודכן ומוכן, ניתן לדלג על:

- **שלב 3:** גיבוי PostgreSQL
- **שלב 8:** הרצת מיגרציות

**שימוש:**

```bash
python3 scripts/production-update/master.py --skip-db
```

**מתי להשתמש:**

- בסיס הנתונים כבר מעודכן ומעודכן
- אין צורך בגיבוי נוסף
- אין מיגרציות חדשות להריץ
- רוצים תהליך מהיר יותר

#### אופציה 2: לדלג רק על גיבוי

אם רוצים להריץ מיגרציות אבל לא צריך גיבוי:

**שימוש:**

```bash
python3 scripts/production-update/master.py --skip 3
```

#### אופציה 3: לבצע את כל הפעולות (ברירת מחדל)

אם רוצים גיבוי מלא ומיגרציות:

**שימוש:**

```bash
python3 scripts/production-update/master.py
```

**מתי להשתמש:**

- רוצים גיבוי בטיחותי לפני עדכון
- יש מיגרציות חדשות להריץ
- זה עדכון גדול או משמעותי

#### המלצה

- **עדכונים קטנים/תכופים:** השתמש ב-`--skip-db` (אופציה 1)
- **עדכונים גדולים/משמעותיים:** השתמש בברירת המחדל (אופציה 3)
- **DB כבר מעודכן:** השתמש ב-`--skip-db` (אופציה 1)

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

#### אופציה 1: שימוש ב-Master Script (מומלץ מאוד!)

```bash
# עבור לענף פרודקשן
git checkout production

# משוך עדכונים אחרונים של פרודקשן
git pull origin production

# הרצת Master Script (16 שלבים אוטומטיים מלאים)
python3 scripts/production-update/master.py
```

**Master Script מבצע (17 שלבים):**

**שלבים מקדימים:**

- Step 1: Save Production Changes / Collect Changes - שמירת שינויים מקומיים או איסוף שינויים מ-main

**ניהול שרת:**

- Step 2: Check Server - בדיקת מצב השרת (רץ/לא רץ, PID, health check)
- Step 7: Stop Server - עצירה בטוחה של השרת (graceful shutdown)
- Step 13: Start Server - הפעלת השרת על פורט 5001 עם health check
- Step 14: Verify Server Stability - בדיקת יציבות (6 בדיקות health check במרווחים)

**גיבוי ומיזוג:**

- Step 3: Backup Database - גיבוי PostgreSQL (pg_dump)
- Step 4: Update Main - עדכון main branch
- Step 5: Merge to Production - מיזוג main → production (עם conflict resolver אוטומטי)

**סינכרון ועדכון:**

- Step 6: Sync Code - סנכרון קוד (Backend + UI) + post-sync transformations + verification
- Step 8: Run Migrations - **זיהוי והרצת מיגרציות נדרשות אוטומטית!** (חדש!)
- Step 9: Fix Config - תיקון הגדרות production (PORT=5001, IS_PRODUCTION=True, PostgreSQL)
- Step 10: Check Server Updates - בדיקת dependencies וקבצים קריטיים (חדש!)
- Step 11: Update Server - התקנת dependencies חדשים (חדש!)

**בדיקות ואימות:**

- Step 12: Validate - בדיקות ואימות מקיפות

**סיום:**

- Step 15: Bump Version - עדכון גרסה
- Step 16: Commit & Push - Git commit & push
- Step 17: E2E Browser Tests - בדיקות end-to-end בדפדפן (חדש!)

**יתרונות Master Script:**

- ✅ **אוטומטי לחלוטין** - כל התהליך מתבצע אוטומטית
- ✅ **זיהוי מיגרציות אוטומטי** - מזהה ומריץ מיגרציות נדרשות
- ✅ **ניהול שרת מלא** - בדיקה, עצירה, עדכון, הפעלה, יציבות
- ✅ **תמיכה ב-PostgreSQL** - גיבוי והרצת מיגרציות עם PostgreSQL
- ✅ **בדיקות מקיפות** - כל הבדיקות מתבצעות אוטומטית
- ✅ **Rollback** - תמיכה ב-rollback במקרה של כשלון

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

### שלב 6: סינכרון קוד לפרודקשן

**אם השתמשת ב-Master Script, שלב זה כבר בוצע אוטומטית!**

אם לא, הרץ ידנית:

```bash
# ודא שאתה ב-production branch
git checkout production

# הרץ סקריפט סינכרון (מעתיק Backend + UI)
./scripts/sync_to_production.py
./scripts/sync_ui_to_production.py
```

**מה הסקריפט עושה:**

- **גיבוי DB** - מגבה את ה-DB לפני מחיקת production directory
- **מעתיק כל הקבצים** מ-`Backend/` ל-`production/Backend/` (blacklist approach)
- **מעתיק UI** מ-`trading-ui/` ל-`production/trading-ui/` (עם copy_function=shutil.copy2)
- **מחריג רק קבצים ספציפיים** (blacklist): tests, archive, backups, documentation, legacy, migrations, logs, coverage, **pycache**, .git, node_modules
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
python3 -c "from config.settings import UI_DIR, DATABASE_URL, PORT, IS_PRODUCTION; \
    print(f'UI: {UI_DIR}'); \
    print(f'DB: {DATABASE_URL[:50]}...'); \
    print(f'Database Type: PostgreSQL'); \
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
   - ודא ש-`DATABASE_URL` מצביע על PostgreSQL
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

### שלב 8: הרצת מיגרציות (אוטומטי!)

**🆕 עדכון 1.3.7.0:** המערכת מזהה ומריצה מיגרציות אוטומטית!

**אם השתמשת ב-Master Script, שלב זה כבר בוצע אוטומטית!**

המערכת:

1. מזהה מיגרציות נדרשות (טבלאות/עמודות חסרות)
2. מסדרת אותן לפי dependencies
3. מריצה אותן בסדר הנכון
4. מאמתת שהן הצליחו

**אם צריך להריץ ידנית:**

```bash
python3 scripts/production-update/steps/08_run_migrations.py
```

---

### שלב 12: בדיקות ואימות

**אם השתמשת ב-Master Script, כל הבדיקות כבר בוצעו אוטומטית!**

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
python3 -c "from config.settings import UI_DIR, DATABASE_URL, PORT, IS_PRODUCTION; \
    print(f'UI: {UI_DIR}'); \
    print(f'DB: {DATABASE_URL[:50]}...'); \
    print(f'Database Type: PostgreSQL'); \
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

#### בדיקה 4.5: בדיקת צורך במיגרציות (אוטומטי!)

**🆕 עדכון 1.3.7.0:** המערכת מזהה אוטומטית מיגרציות נדרשות!

**אם השתמשת ב-Master Script, שלב זה כבר בוצע אוטומטית!**

אם לא, ניתן להריץ ידנית:

```bash
# זיהוי מיגרציות נדרשות
python3 scripts/production-update/utils/migration_detector.py

# הרצת מיגרציות (דרך Master Script או ישירות)
python3 scripts/production-update/steps/08_run_migrations.py
```

**מה המערכת עושה:**

1. **משווה מבנה DB** - בין dev ל-production (טבלאות, עמודות, indexes)
2. **סורקת מיגרציות** - בודקת כל מיגרציה ב-`Backend/migrations/`
3. **מזהה מיגרציות נדרשות** - לפי טבלאות/עמודות חסרות
4. **מריצה אוטומטית** - בסדר הנכון (dependencies)
5. **מאמתת** - בודקת שהמיגרציה הצליחה

**תמיכה במיגרציות:**

- מיגרציות עם `run_migration(DATABASE_URL)` - תמיכה מלאה
- מיגרציות עם `upgrade()` - תמיכה מלאה
- מיגרציות עם `migrate()` - תמיכה מלאה

**דוגמה לפלט:**

```json
{
  "count": 2,
  "migrations": [
    {
      "name": "create_ticker_provider_symbols_table",
      "tables_created": ["ticker_provider_symbols"],
      "columns_added": {},
      "dependencies": []
    }
  ]
}
```

**הערה:** אם יש מיגרציות מותאמות אישית, ניתן להריץ אותן ידנית:

```bash
python3 scripts/run_production_migration.py Backend/migrations/your_migration.py
```

#### בדיקה 5: בדיקת הפעלת שרת (אופציונלי)

**🆕 עדכון 1.3.7.0:** יש מערכת אוטומטית לניהול שרת!

```bash
# בדיקת מצב השרת (אוטומטי)
python3 scripts/production-update/steps/02_check_server.py

# עצירת השרת (אם רץ)
python3 scripts/production-update/steps/07_stop_server.py

# בדיקת עדכונים דרושים
python3 scripts/production-update/steps/10_check_server_updates.py

# עדכון השרת (dependencies)
python3 scripts/production-update/steps/11_update_server.py

# הפעלת השרת
python3 scripts/production-update/steps/13_start_server.py

# בדיקת יציבות
python3 scripts/production-update/steps/14_verify_server_stability.py
```

**או דרך Master Script (מומלץ):**

```bash
python3 scripts/production-update/master.py
# כולל את כל שלבי ניהול השרת אוטומטית
```

**תוצאה צפויה:**

```
✅ Server is running (PID: 12345)
✅ Health check passed
✅ Server stability verified
```

---

## 🔧 ניהול שרת - מדריך מפורט

**🆕 עדכון 1.3.7.0:** מערכת ניהול שרת מלאה!

### בדיקת מצב השרת

```bash
python3 scripts/production-update/steps/02_check_server.py
```

**מה הסקריפט בודק:**

- האם השרת רץ על פורט 5001
- PID של השרת (אם רץ)
- Health check (`/api/health`)
- זמן פעולה (uptime)

**פלט:**

```json
{
  "success": true,
  "running": true,
  "port": 5001,
  "pid": 12345,
  "health": "healthy",
  "uptime": 3600
}
```

### עצירת השרת

```bash
python3 scripts/production-update/steps/07_stop_server.py
```

**מה הסקריפט עושה:**

1. בודק אם השרת רץ
2. שולח SIGTERM (graceful shutdown)
3. מחכה עד 30 שניות
4. אם לא נסגר - שולח SIGKILL
5. מאמת שהשרת נעצר

### עדכון השרת

```bash
# בדיקת עדכונים דרושים
python3 scripts/production-update/steps/10_check_server_updates.py

# עדכון dependencies
python3 scripts/production-update/steps/11_update_server.py
```

**מה הסקריפטים בודקים:**

- Dependencies חסרים או מיושנים
- קבצים קריטיים קיימים
- מבנה DB תקין
- קבצי UI קיימים

### הפעלת השרת

```bash
python3 scripts/production-update/steps/13_start_server.py
```

**מה הסקריפט עושה:**

1. בודק שפורט 5001 פנוי
2. מפעיל את השרת
3. מחכה ל-health check (עד 30 שניות)
4. מדווח על PID וזמן הפעלה

**⚠️ חשוב:** השרת רץ על פורט 5001 (לא 8080)!

### בדיקת יציבות

```bash
python3 scripts/production-update/steps/14_verify_server_stability.py
```

**מה הסקריפט עושה:**

1. מחכה 30 שניות
2. מבצע 6 בדיקות health check (כל 5 שניות)
3. בודק שהתהליך עדיין רץ
4. בודק לוגים לשגיאות קריטיות
5. מדווח על יציבות

**תוצאה צפויה:**

```json
{
  "stable": true,
  "health_checks": {
    "passed": 6,
    "failed": 0,
    "total": 6
  },
  "process_alive": true,
  "log_errors_count": 0
}
```

---

### שלב 15: עדכון גרסה

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

### שלב 16: Commit & Push

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

### שלב 17: בדיקות E2E בדפדפן (חדש!)

**🆕 עדכון 1.3.7.0:** הוספת בדיקות E2E מקיפות בסוף התהליך!

**אם השתמשת ב-Master Script, שלב זה כבר בוצע אוטומטית!**

המערכת מבצעת בדיקות end-to-end מקיפות:

1. **Health Check** - בדיקת `/api/health` וכל הרכיבים (API, Database, Cache, System)
2. **דפים קריטיים** - בדיקת טעינת דפים ראשיים:
   - דף הבית (`/`)
   - דף טריידים (`/trades`)
   - דף ביצועים (`/executions`)
   - דף התראות (`/alerts`)
3. **API Endpoints** - בדיקת endpoints קריטיים:
   - `/api/currencies`
   - `/api/tickers`
   - `/api/trades`
   - `/api/alerts`
4. **Static Assets** - בדיקת טעינת קבצי CSS ו-JS

**אם צריך להריץ ידנית:**

```bash
python3 scripts/production-update/steps/17_e2e_tests.py
```

**תוצאה צפויה:**

```
✅ Server is healthy
✅ Health endpoint OK - all systems healthy
✅ Main page loads OK with all required elements
✅ trades page loads OK
✅ executions page loads OK
✅ alerts page loads OK
✅ currencies API OK - valid JSON response
✅ tickers API OK - valid JSON response
✅ trades API OK - valid JSON response
✅ alerts API OK - valid JSON response
✅ All basic browser checks passed (10/10)
```

**אם יש שגיאות:**

- המערכת מדווחת על כל שגיאה
- בדיקות נכשלות לא מונעות את סיום התהליך (אזהרה בלבד)
- כל השגיאות מתועדות בדוח הסופי

**תמיכה ב-Playwright:**
אם Playwright מותקן, המערכת תשתמש בו לבדיקות מתקדמות יותר בנוסף לבדיקות הבסיסיות. אחרת, היא תבצע בדיקות מקיפות באמצעות HTTP requests.

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

# 2. הרצת Master Script (כולל sync, מיגרציות, ניהול שרת, בדיקות, commit)
# אופציה A: עם כל הפעולות (גיבוי ומיגרציות)
python3 scripts/production-update/master.py

# אופציה B: דילוג על פעולות DB (אם DB כבר מוכן)
python3 scripts/production-update/master.py --skip-db

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
python3 -c "from config.settings import DATABASE_URL, UI_DIR, PORT, IS_PRODUCTION; \
    print(f'DB: {DATABASE_URL[:50]}...'); \
    print(f'Database Type: PostgreSQL'); \
    print(f'UI: {UI_DIR}'); \
    print(f'Port: {PORT}'); \
    print(f'Production: {IS_PRODUCTION}')"

# אם יש בעיה, תקן את config/settings.py
# ודא ש-IS_PRODUCTION = True (hardcoded)
# ודא ש-PORT = 5001 (hardcoded)
# ודא ש-UI_DIR מצביע על production/trading-ui
# ודא ש-DATABASE_URL מצביע על PostgreSQL
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

# בדוק את מצב השרת (אוטומטי)
python3 scripts/production-update/steps/02_check_server.py

# בדוק את הלוגים
tail -f production/Backend/server_output.log

# בדוק את ההגדרות
cd production/Backend
python3 -c "from config.settings import PORT, DATABASE_URL, UI_DIR, IS_PRODUCTION; \
    print(f'Port: {PORT}'); \
    print(f'DB: {DATABASE_URL[:50]}...'); \
    print(f'UI exists: {UI_DIR.exists()}'); \
    print(f'Production: {IS_PRODUCTION}')"
```

### בעיה: מיגרציות לא רצות

**פתרון:**

```bash
# בדוק מיגרציות נדרשות
python3 scripts/production-update/utils/migration_detector.py

# הרץ מיגרציות ידנית
python3 scripts/production-update/steps/08_run_migrations.py

# או מיגרציה בודדת
python3 scripts/run_production_migration.py Backend/migrations/your_migration.py
```

### בעיה: השרת נופל אחרי הפעלה

**פתרון:**

```bash
# בדוק יציבות השרת
python3 scripts/production-update/steps/14_verify_server_stability.py

# בדוק עדכונים דרושים
python3 scripts/production-update/steps/10_check_server_updates.py

# עדכן dependencies
python3 scripts/production-update/steps/11_update_server.py
```

---

## ✅ Checklist לפני Commit

לפני commit, ודא:

- [ ] כל הבדיקות עברו בהצלחה
- [ ] אין קבצי DB או logs ב-commit
- [ ] **ההגדרות ב-`production/Backend/config/settings.py` נכונות (hardcoded production)**
- [ ] **ההגדרות ב-`production/Backend/config/logging.py` נכונות (logs directory)**
- [ ] UI_DIR מצביע על `production/trading-ui`
- [ ] DATABASE_URL מצביע על PostgreSQL
- [ ] PORT = 5001 (hardcoded)
- [ ] IS_PRODUCTION = True (hardcoded)
- [ ] **כל המיגרציות רצו בהצלחה** (אם היו)
- [ ] **השרת רץ יציב** (אם הופעל)
- [ ] **Health check עובר** (HTTP 200)
- [ ] ה-commit message ברור ומתאר את השינויים

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

### סקריפטים מרכזיים

**Master Script:**

- `scripts/production-update/master.py` - Master Script (16 שלבים אוטומטיים מלאים)

**סינכרון:**

- `scripts/sync_to_production.py` - סקריפט סינכרון קוד (עם DB protection)
- `scripts/sync_ui_to_production.py` - סקריפט סינכרון UI (עם verification)
- `scripts/sync_verifier.py` - בדיקת sync עם checksums
- `scripts/pre_sync_validation.py` - בדיקת מוכנות לפני sync

**מיגרציות (חדש!):**

- `scripts/production-update/utils/migration_detector.py` - זיהוי מיגרציות נדרשות
- `scripts/production-update/steps/08_run_migrations.py` - הרצת מיגרציות אוטומטית
- `scripts/run_production_migration.py` - הרצת מיגרציה בודדת (PostgreSQL)

**ניהול שרת (חדש!):**

- `scripts/production-update/steps/02_check_server.py` - בדיקת מצב השרת
- `scripts/production-update/steps/07_stop_server.py` - עצירת השרת
- `scripts/production-update/steps/10_check_server_updates.py` - בדיקת עדכונים דרושים
- `scripts/production-update/steps/11_update_server.py` - עדכון השרת
- `scripts/production-update/steps/13_start_server.py` - הפעלת השרת (פורט 5001)
- `scripts/production-update/steps/14_verify_server_stability.py` - בדיקת יציבות

**זיהוי קבצים (חדש!):**

- `scripts/production-update/utils/new_files_detector.py` - זיהוי קבצים חדשים

**תמיכה:**

- `scripts/production-update/prepare_changelog.py` - יצירת changelog
- `scripts/production-update/document_server_changes.py` - תיעוד עדכוני שרת

### בדיקות

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

**עודכן:** 2025-11-25  
**גרסה:** 1.4.1  
**מטרה:** תהליך עדכון מסודר ומובנה עם ניהול שרת מלא ותמיכה בדילוג על פעולות DB

## 📝 שינויים בגרסה 1.4.1

- ✅ **תמיכה בדילוג על פעולות DB:** הוספת `--skip-db` flag לדילוג על גיבוי (שלב 3) ומיגרציות (שלב 8)
- ✅ **בחירת פעולות DB:** הוספת סעיף תיעוד לבחירת פעולות בסיס הנתונים (3 אופציות)
- ✅ **תהליך מהיר:** עדכון Quick Update section עם אופציות דילוג על DB

## 📝 שינויים בגרסה 1.3.7.0

- ✅ **ניהול שרת מלא:** בדיקה, עצירה, עדכון, הפעלה, ויציבות (5 שלבים חדשים)
- ✅ **זיהוי מיגרציות אוטומטי:** מערכת אוטומטית לזיהוי והרצת מיגרציות נדרשות
- ✅ **תמיכה מלאה ב-PostgreSQL:** כל הסקריפטים עודכנו ל-PostgreSQL (גיבוי, מיגרציות)
- ✅ **בדיקת עדכונים דרושים:** בדיקה אוטומטית של dependencies וקבצים קריטיים
- ✅ **17 שלבים אוטומטיים:** תהליך מלא ומקיף במקום 11 שלבים בסיסיים
- ✅ **זיהוי קבצים חדשים:** מערכת לזיהוי קבצים חדשים ושינויים
- ✅ **בריאות שרת:** health checks ויציבות אוטומטית
- ✅ **בדיקות E2E בדפדפן:** בדיקות end-to-end מקיפות בסוף התהליך (חדש!)

## 📝 שינויים בגרסה 1.4.0

- ✅ **PostgreSQL בלבד:** המערכת משתמשת ב-PostgreSQL בלבד
- ✅ **בדיקת מיגרציות:** זיהוי אוטומטי של מיגרציות נדרשות
- ✅ **עדכון בדיקות הגדרות:** שימוש ב-`DATABASE_URL` עם PostgreSQL

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
