# סיכום תהליך עדכון פרודקשן - לצוות

**תאריך:** 2025-01-21  
**גרסה:** 1.2.0  
**מטרה:** סיכום מקיף של התהליך המעודכן לעבודה משותפת בין צוות הפיתוח לצוות הפרודקשן

---

## 🎯 סקירה כללית

התהליך המעודכן כולל **עבודה משותפת מסונכרנת** בין שני צוותים:
- **צוות הפיתוח** - מבצע הכנה לפני sync (שלב 0)
- **צוות הפרודקשן** - מבצע את העדכון בפועל (שלבים 0.5-11)

---

## 📋 תהליך מלא - 11 שלבים

### שלב 0: הכנה בסביבת הפיתוח ⚠️ (צוות הפיתוח)

**מי מבצע:** צוות הפיתוח  
**איפה:** סביבת הפיתוח (`main` branch)  
**מתי:** לפני כל sync לפרודקשן

#### פעולות:
1. **בדיקת שינויים לא שמורים**
   ```bash
   git status
   git add .
   git commit -m "feat: [תיאור]"
   ```

2. **Push ל-main**
   ```bash
   git checkout main
   git push origin main
   ```

3. **יצירת Changelog**
   ```bash
   python3 scripts/production-update/prepare_changelog.py
   ```
   - יוצר `_Tmp/production_sync_changelog_[timestamp].md`
   - מזהה שינויים קריטיים (config, DB schema, server)

4. **Pre-Sync Validation**
   ```bash
   python3 scripts/pre_sync_validation.py
   ```
   - בודק שינויים לא שמורים
   - בודק קבצי backup/debug
   - בודק קבצים קריטיים

**✅ Checklist:**
- [ ] כל השינויים נשמרו ב-git
- [ ] כל השינויים נדחפו ל-main
- [ ] Changelog נוצר
- [ ] Pre-sync validation עבר

---

### שלב 0.5: שמירת שינויים בפרודקשן ⚠️ (צוות הפרודקשן)

**מי מבצע:** צוות הפרודקשן  
**איפה:** סביבת הפרודקשן (`production` branch)  
**מתי:** לפני כל merge מ-main

#### פעולות:
```bash
# 1. בדיקת שינויים לא שמורים
git status

# 2. שמירת שינויים (אם יש)
python3 scripts/production-update/preserve_production_changes.py
# או ידנית:
git add production/Backend/config/
git commit -m "chore: Preserve production config changes"
git push origin production
```

**קבצים שצריך לשמור:**
- `production/Backend/config/settings.py`
- `production/Backend/config/logging.py`
- `production/Backend/config/database.py`

**⚠️ קריטי:** שינויים ב-config חייבים להישמר לפני merge!

---

### שלבים 1-11: Master Script (אוטומטי)

**מי מבצע:** Master Script (אוטומטי)  
**איפה:** סביבת הפרודקשן (`production` branch)  
**פקודה:**
```bash
python3 scripts/production-update/master.py
```

#### Step 1: Collect Changes
- איסוף שינויים מ-main
- יצירת תקציר

#### Step 2: Merge Main
- מיזוג `main → production`
- פתרון קונפליקטים אוטומטי (conflict resolver)
- שמירה אוטומטית על קבצי config של production

#### Step 3: Cleanup Documentation
- ניקוי דוקומנטציה מיותרת

#### Step 4: Backup Database
- גיבוי אוטומטי של DB
- בדיקת integrity

#### Step 5: Sync Code
- סנכרון Backend (`sync_to_production.py`)
- סנכרון UI (`sync_ui_to_production.py`)
- **DB Protection** - שמירה אוטומטית על DB
- **Post-Sync Transformations** - תיקון אוטומטי של config, imports
- **Cleanup Duplicates** - ניקוי תיקיות כפולות, backups, docs
- **Sync Verification** - בדיקת checksums

#### Step 6: Cleanup Backups
- ניקוי קבצי גיבוי ישנים

#### Step 7: Fix Config
- תיקון אוטומטי של הגדרות production:
  - `IS_PRODUCTION = True` (hardcoded)
  - `PORT = 5001` (hardcoded)
  - `DEVELOPMENT_MODE = False`
  - `CACHE_DISABLED = False`

#### Step 8: Validate
- בדיקת sync (`sync_verifier.py`)
- בדיקת מבנה (`verify_production.sh`)
- בדיקת הפרדה (`verify_production_isolation.sh`)

#### Step 9: Bump Version
- עדכון גרסה (`bump-version.py`)
- עדכון `version-manifest.json`
- עדכון `VERSION_HISTORY.md`

#### Step 10: Commit & Push
- Git commit עם הודעה אוטומטית
- Push ל-`origin/production`

#### Step 11: Start Server (אופציונלי)
- הפעלת שרת production
- בדיקת health

---

### שלב 7: תיעוד עדכוני שרת (אופציונלי)

**מי מבצע:** צוות הפרודקשן  
**מתי:** אחרי עדכון הגדרות שרת

```bash
python3 scripts/production-update/document_server_changes.py
```

**מה הסקריפט עושה:**
- מזהה שינויים ב-config files
- מנתח שינויים בהגדרות מפתח
- מעדכן את `SERVER_CHANGES.md`

---

## 🔄 זרימת עבודה - מפה ויזואלית

```
┌─────────────────────────────────────────┐
│  צוות הפיתוח (Development)              │
│  Branch: main                           │
│  מיקום: /path/to/TikTrackApp           │
└─────────────────────────────────────────┘
              │
              │ שלב 0: הכנה
              │ - שמירת שינויים
              │ - יצירת changelog
              │ - Pre-sync validation
              ↓
┌─────────────────────────────────────────┐
│  צוות הפרודקשן (Production)             │
│  Branch: production                     │
│  מיקום: /path/to/TikTrackApp-Production│
└─────────────────────────────────────────┘
              │
              │ שלב 0.5: שמירת שינויים
              │ - preserve_production_changes.py
              ↓
              │ שלב 1: עדכון main
              │ - git pull origin production
              │ - git fetch origin main
              ↓
              │ שלב 2: מיזוג
              │ - git merge main
              │   או
              │ - master.py (Step 2)
              ↓
      ┌───────┴───────┐
      │ Master Script │
      └───────┬───────┘
              │
  ┌───────────┼───────────┐
  │           │           │
  ↓           ↓           ↓
Step 3-4  Step 5    Step 6-7
Cleanup + Sync Code Cleanup +
Backup DB (Backend+UI) Fix Config
  │           │           │
  └───────────┼───────────┘
              │
              ↓
      Step 8: Validate
      - sync_verifier.py
      - verify_production.sh
              │
              ↓
      Step 9: Bump Version
              │
              ↓
      Step 10: Commit & Push
              │
              ↓
      Step 11: Start Server (אופציונלי)
              │
              ↓
      שלב 7: תיעוד (אופציונלי)
      - document_server_changes.py
```

---

## 📚 מסמכי עבודה משותפים

### 1. `UPDATE_PROCESS.md`
- **צוות הפיתוח:** מעדכנת שלב 0 (הכנה)
- **צוות הפרודקשן:** מעדכנת שלבים 1-6
- **כלל:** אין דריסה - כל צד עובד על חלק אחר

### 2. `SERVER_CHANGES.md`
- **צוות הפרודקשן:** מעדכנת עם שינויים ב-config
- **צוות הפיתוח:** קוראת לראות שינויים
- **כלל:** כל עדכון נוסף בסוף (append)

### 3. `PRODUCTION_DEVELOPER_GUIDE.md`
- **שני הצדדים:** יכולים לעדכן
- **כלל:** עדכונים בתוספת, לא מחליפים

### 4. `SHARED_WORKSPACE.md`
- **שני הצדדים:** יכולים לעדכן
- **כלל:** הגדרת מסמכי עבודה משותפים

---

## ⚠️ נקודות קריטיות

### 1. מיזוג מ-main בלבד
**❌ אסור:** מיזוג מ-`new-db-upgrade` או branches אחרים  
**✅ נכון:** מיזוג מ-`main` בלבד

### 2. שמירת שינויים בפרודקשן
**קריטי:** לפני כל merge, יש לשמור שינויים שנעשו ישירות בפרודקשן!

```bash
python3 scripts/production-update/preserve_production_changes.py
```

### 3. הגדרות Production
**אחרי כל sync, ודא:**
- `IS_PRODUCTION = True` (hardcoded)
- `PORT = 5001` (hardcoded)
- `DEVELOPMENT_MODE = False`
- `CACHE_DISABLED = False`

Master Script מתקן זאת אוטומטית, אבל תמיד כדאי לבדוק.

### 4. DB Protection
המערכת מגנה על DB:
- גיבוי אוטומטי לפני sync
- שמירת `db/` directory
- שחזור אוטומטי אחרי sync

---

## 🛠️ כלים חדשים

### כלים לצוות הפיתוח:
- `scripts/production-update/prepare_changelog.py` - יצירת changelog
- `scripts/pre_sync_validation.py` - בדיקת מוכנות לפני sync

### כלים לצוות הפרודקשן:
- `scripts/production-update/master.py` - Master Script (11 שלבים)
- `scripts/production-update/preserve_production_changes.py` - שמירת שינויים
- `scripts/production-update/document_server_changes.py` - תיעוד שינויים
- `scripts/sync_verifier.py` - בדיקת sync עם checksums
- `scripts/cleanup_production_duplicates.py` - ניקוי סביבת פרודקשן

---

## 📖 מסמכים נוספים

### למתחילים:
- [`INITIAL_HANDOFF.md`](./INITIAL_HANDOFF.md) - הוראות העברה
- [`HANDOFF_TO_PRODUCTION_TEAM.md`](./HANDOFF_TO_PRODUCTION_TEAM.md) - מידע כללי
- [`PROCESS_STEPS_TABLE.md`](./PROCESS_STEPS_TABLE.md) - טבלת שלבים

### למתקדמים:
- [`PRODUCTION_SYNC_INSTRUCTIONS.md`](./PRODUCTION_SYNC_INSTRUCTIONS.md) - הוראות מפורטות
- [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md) - תהליך מלא
- [`PRODUCTION_DEVELOPER_GUIDE.md`](./PRODUCTION_DEVELOPER_GUIDE.md) - מדריך למפתחים

### למתקדמים מאוד:
- [`SHARED_WORKSPACE.md`](./SHARED_WORKSPACE.md) - עבודה משותפת
- [`SERVER_CHANGES.md`](./SERVER_CHANGES.md) - תיעוד שינויים

---

## ✅ Checklist לפני עדכון

### צוות הפיתוח:
- [ ] כל השינויים נשמרו ב-git
- [ ] כל השינויים נדחפו ל-main
- [ ] Changelog נוצר
- [ ] Pre-sync validation עבר

### צוות הפרודקשן:
- [ ] שינויים בפרודקשן נשמרו לפני merge
- [ ] מיזוג מ-main בלבד (לא מ-new-db-upgrade)
- [ ] Master Script מוכן לרוץ
- [ ] יש גיבוי של DB (אופציונלי, אבל מומלץ)

---

## 🆘 פתרון בעיות

### בעיה: קונפליקטים במיזוג
**פתרון:**
- Conflict resolver שומר אוטומטית על קבצי config של production
- אם יש קונפליקטים אחרים, פתור ידנית

### בעיה: שינויים אבדו אחרי merge
**פתרון:**
- ודא ששמרת את השינויים ב-git לפני merge
- השתמש ב-`preserve_production_changes.py`

### בעיה: הגדרות production לא נכונות
**פתרון:**
- Master Script מתקן אוטומטית
- אם לא, תקן ידנית ב-`config/settings.py`

### בעיה: Sync verification נכשל
**פתרון:**
```bash
# הרץ sync שוב
./scripts/sync_to_production.py

# בדוק עם verifier
python3 scripts/sync_verifier.py
```

---

**עודכן:** 2025-01-21  
**גרסה:** 1.0.0

