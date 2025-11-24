# סיכום שלבים עיקריים - תהליך עדכון פרודקשן

**תאריך:** 2025-01-21  
**גרסה:** 1.0.0

---

## 📋 שלבים עיקריים - סקירה מהירה

### תהליך מלא (7 שלבים):

```
0. הכנה בסביבת הפיתוח
   ↓
1. עדכון main branch
   ↓
2. מיזוג main → production
   ↓
3. סינכרון קוד
   ↓
4. בדיקות ואימות
   ↓
5. עדכון גרסה
   ↓
6. Commit & Push
```

---

## 🚀 שלבים מפורטים

### שלב 0: הכנה בסביבת הפיתוח ⚙️

**מי מבצע:** צוות הפיתוח  
**מיקום:** סביבת הפיתוח (main branch)

#### פעולות:
1. **שמירת שינויים**
   ```bash
   git add .
   git commit -m "feat: [תיאור השינויים]"
   git push origin main
   ```

2. **יצירת Changelog**
   ```bash
   python3 scripts/production-update/prepare_changelog.py
   ```
   - בודק שינויים לא שמורים
   - מזהה שינויים קריטיים (config, DB schema, server)
   - יוצר changelog ב-`_Tmp/production_sync_changelog_[timestamp].md`

3. **Pre-Sync Validation**
   ```bash
   python3 scripts/pre_sync_validation.py
   ```
   - בודק שינויים לא שמורים
   - מזהה קבצי backup/debug
   - בודק קבצים קריטיים

#### תוצאה:
✅ כל השינויים נשמרו ב-git  
✅ Changelog נוצר  
✅ Validation עבר בהצלחה

---

### שלב 0.5: שמירת שינויים בפרודקשן 💾

**מי מבצע:** צוות הפרודקשן  
**מיקום:** סביבת הפרודקשן (production branch)

#### פעולות:
```bash
# בדיקת שינויים
git status

# שמירת שינויים (אם יש)
python3 scripts/production-update/preserve_production_changes.py
```

**קבצים שצריך לשמור:**
- `production/Backend/config/settings.py`
- `production/Backend/config/logging.py`
- `production/Backend/config/database.py`
- כל שינוי אחר שנעשה ישירות בפרודקשן

#### תוצאה:
✅ כל השינויים בפרודקשן נשמרו ב-git

---

### שלב 1: עדכון Main Branch 📥

**מי מבצע:** צוות הפרודקשן  
**מיקום:** סביבת הפרודקשן

#### פעולות:
```bash
# מעבר ל-production branch
git checkout production

# עדכון מ-remote
git pull origin production

# עדכון main (לא new-db-uopgrde!)
git fetch origin main
```

#### תוצאה:
✅ production branch מעודכן  
✅ main branch מעודכן

---

### שלב 2: מיזוג Main → Production 🔀

**מי מבצע:** צוות הפרודקשן  
**מיקום:** סביבת הפרודקשן

#### אופציה 1: Master Script (מומלץ) ⭐

```bash
# הרצת Master Script (כולל merge)
python3 scripts/production-update/master.py
```

**מה Master Script עושה:**
- Step 1: Collect Changes
- Step 2: Merge Main (עם conflict resolver אוטומטי)
- Step 3-11: המשך התהליך

#### אופציה 2: תהליך ידני

```bash
# מיזוג מ-main
git merge main

# אם יש קונפליקטים - פתור אותם
# Conflict resolver שומר אוטומטית על קבצי config של production
```

#### תוצאה:
✅ main מוזג ל-production  
✅ קונפליקטים נפתרו (אוטומטית או ידנית)

---

### שלב 3: סינכרון קוד לפרודקשן 🔄

**מי מבצע:** Master Script (אוטומטי) או ידני  
**מיקום:** סביבת הפרודקשן

#### אם השתמשת ב-Master Script:
✅ שלב זה כבר בוצע אוטומטית (Step 5)

#### אם לא, הרץ ידנית:

```bash
# סינכרון Backend + UI
./scripts/sync_to_production.py
```

**מה הסקריפט עושה:**
1. **גיבוי DB** - מגבה את ה-DB לפני מחיקת production directory
2. **מעתיק Backend** - מ-`Backend/` ל-`production/Backend/`
3. **מעתיק UI** - מ-`trading-ui/` ל-`production/trading-ui/`
4. **משחזר DB** - משחזר את ה-DB אחרי sync
5. **בודק קבצים קריטיים** - verifies critical files

#### תוצאה:
✅ Backend synced (~157 files)  
✅ UI synced (~490 files)  
✅ DB protected and restored

---

### שלב 3.5: תיקון הגדרות Production (קריטי!) ⚙️

**מי מבצע:** Master Script (אוטומטי) או ידני  
**מיקום:** סביבת הפרודקשן

#### אם השתמשת ב-Master Script:
✅ שלב זה כבר בוצע אוטומטית (Step 7 - Fix Config)

#### אם לא, תקן ידנית:

```bash
# בדיקת הגדרות
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
DB: PostgreSQL (TikTrack-db-prodution)
Port: 5001
Production: True
```

**אם לא נכון, תקן:**
- `IS_PRODUCTION = True` (hardcoded)
- `PORT = 5001` (hardcoded)
- `DATABASE_URL` מצביע על PostgreSQL
- `UI_DIR` מצביע על `production/trading-ui`

#### תוצאה:
✅ הגדרות production נכונות

---

### שלב 4: בדיקות ואימות ✅

**מי מבצע:** Master Script (אוטומטי) או ידני  
**מיקום:** סביבת הפרודקשן

#### אם השתמשת ב-Master Script:
✅ חלק מהבדיקות כבר בוצעו (Step 8 - Validate)

#### בדיקות נוספות:

1. **Sync Verification**
   ```bash
   python3 scripts/sync_verifier.py
   ```
   - בודק checksums של קבצים קריטיים
   - תוצאה: ✅ All critical files verified

2. **אימות מבנה**
   ```bash
   ./scripts/verify_production.sh
   ```
   - בודק מבנה כללי
   - רשימת קבצים שונים
   - תוצאה: ✅ Verification passed

3. **אימות הפרדה**
   ```bash
   ./scripts/verify_production_isolation.sh
   ```
   - בודק הפרדה מלאה
   - תוצאה: ✅ Isolation verification passed

4. **בדיקת הגדרות**
   ```bash
   cd production/Backend
   python3 -c "from config.settings import PORT, IS_PRODUCTION; \
       assert PORT == 5001; \
       assert IS_PRODUCTION == True; \
       print('✅ Production settings verified')"
   ```

#### תוצאה:
✅ כל הבדיקות עברו בהצלחה

---

### שלב 5: עדכון גרסה 📈

**מי מבצע:** Master Script (אוטומטי) או ידני  
**מיקום:** סביבת הפרודקשן

#### אם השתמשת ב-Master Script:
✅ שלב זה כבר בוצע אוטומטית (Step 9 - Bump Version)

#### אם לא, עדכן ידנית:

```bash
# קידום גרסת הפרודקשן
python3 scripts/versioning/bump-version.py \
  --env production \
  --bump patch \
  --note "Sync main into production - $(date +%Y-%m-%d)"
```

#### תוצאה:
✅ גרסה עודכנה ב-`documentation/version-manifest.json`  
✅ היסטוריה עודכנה ב-`documentation/production/VERSION_HISTORY.md`

---

### שלב 6: Commit & Push 💾

**מי מבצע:** Master Script (אוטומטי) או ידני  
**מיקום:** סביבת הפרודקשן

#### אם השתמשת ב-Master Script:
✅ שלב זה כבר בוצע אוטומטית (Step 10 - Commit & Push)

#### אם לא, Commit ידנית:

```bash
# בדיקת שינויים
git status --short

# הוספת שינויים
git add production/ scripts/ documentation/production/

# Commit
git commit -m "feat: Update production from main - [תאריך/גרסה]

- Synced Backend code from main
- Synced UI from trading-ui
- Updated [רשימת שינויים עיקריים]
- Verified isolation and functionality"

# Push
git push origin production
```

#### תוצאה:
✅ כל השינויים נשמרו ב-Git  
✅ נדחפו ל-remote

---

### שלב 7: תיעוד עדכוני שרת (אופציונלי) 📝

**מי מבצע:** צוות הפרודקשן  
**מיקום:** סביבת הפרודקשן

#### אם יש שינויים ב-config:

```bash
# תיעוד אוטומטי
python3 scripts/production-update/document_server_changes.py
```

**מה הסקריפט עושה:**
- מזהה שינויים ב-config files
- מנתח שינויים בהגדרות מפתח
- מעדכן את `SERVER_CHANGES.md`

#### תוצאה:
✅ שינויים בשרת מתועדים

---

## 🎯 תהליך מהיר (Quick Update)

אם אתה בטוח שהכל תקין:

```bash
# 1. שמירת שינויים בפרודקשן (אם יש)
python3 scripts/production-update/preserve_production_changes.py

# 2. עדכון ומיזוג
git pull origin production
git merge main

# 3. הרצת Master Script (כולל הכל)
python3 scripts/production-update/master.py

# 4. תיעוד עדכוני שרת (אם יש)
python3 scripts/production-update/document_server_changes.py
```

---

## 📊 טבלת שלבים - סיכום

| שלב | שם | מי מבצע | אוטומטי? | זמן משוער |
|-----|-----|---------|-----------|------------|
| 0 | הכנה בסביבת הפיתוח | פיתוח | חלקי | 5 דק' |
| 0.5 | שמירת שינויים בפרודקשן | פרודקשן | חלקי | 2 דק' |
| 1 | עדכון main branch | פרודקשן | כן | 1 דק' |
| 2 | מיזוג main → production | פרודקשן | כן (Master Script) | 2-5 דק' |
| 3 | סינכרון קוד | פרודקשן | כן (Master Script) | 3-5 דק' |
| 3.5 | תיקון הגדרות | פרודקשן | כן (Master Script) | 1 דק' |
| 4 | בדיקות ואימות | פרודקשן | חלקי (Master Script) | 2-3 דק' |
| 5 | עדכון גרסה | פרודקשן | כן (Master Script) | 1 דק' |
| 6 | Commit & Push | פרודקשן | כן (Master Script) | 1 דק' |
| 7 | תיעוד שינויים | פרודקשן | חלקי | 1 דק' |

**סה"כ זמן משוער:** 15-25 דקות

---

## ⚠️ נקודות קריטיות

1. **מיזוג מ-main בלבד** - לא מ-new-db-uopgrde!
2. **שמירת שינויים בפרודקשן** - לפני כל merge
3. **בדיקת הגדרות production** - אחרי כל sync
4. **DB Protection** - המערכת מגנה אוטומטית

---

## 📚 מסמכים נוספים

- [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md) - תהליך מפורט מלא
- [`HANDOFF_TO_PRODUCTION_TEAM.md`](./HANDOFF_TO_PRODUCTION_TEAM.md) - מידע להעברה
- [`PRODUCTION_SYNC_INSTRUCTIONS.md`](./PRODUCTION_SYNC_INSTRUCTIONS.md) - הוראות מפורטות

---

**עודכן:** 2025-01-21  
**גרסה:** 1.0.0

