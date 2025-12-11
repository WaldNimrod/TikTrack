# הוראות עדכון פרודקשן - Production Sync Instructions

**תאריך:** 2025-01-21  
**גרסה:** 1.0.0  
**מטרה:** הוראות ברורות לצוות הפרודקשן לביצוע עדכון

---

## 📋 מידע כללי

### מה השתנה

**שינויים חדשים במערכת:**

1. ✅ **DB Protection** - הגנה על DB במהלך sync
2. ✅ **Enhanced UI Sync** - sync משופר עם verification
3. ✅ **Sync Verifier** - בדיקת sync עם checksums
4. ✅ **Pre-Sync Validation** - בדיקת מוכנות לפני sync
5. ✅ **Preserve Production Changes** - שמירת שינויים בפרודקשן
6. ✅ **Enhanced Conflict Resolver** - פתרון קונפליקטים משופר
7. ✅ **Master Script** - תהליך אוטומטי מלא

### קבצים חדשים

**כלים חדשים:**

- `scripts/sync_verifier.py` - בדיקת sync
- `scripts/pre_sync_validation.py` - בדיקת מוכנות
- `scripts/production-update/prepare_changelog.py` - יצירת changelog
- `scripts/production-update/document_server_changes.py` - תיעוד שינויים בשרת
- `scripts/production-update/preserve_production_changes.py` - שמירת שינויים

**מסמכי תעוד:**

- `documentation/production/PRODUCTION_TEAM_INFO.md` - מידע לצוות
- `documentation/production/PRODUCTION_DEVELOPER_GUIDE.md` - מדריך למפתחים
- `documentation/production/SHARED_WORKSPACE.md` - מסמכי עבודה משותפים
- `documentation/production/SERVER_CHANGES.md` - תיעוד שינויים בשרת

---

## 🚀 תהליך עדכון - הוראות מפורטות

### שלב 1: הכנה (בסביבת הפרודקשן)

```bash
# 1. מעבר ל-production worktree
cd /path/to/TikTrackApp-Production

# 2. בדיקת שינויים לא שמורים
git status

# 3. שמירת שינויים בפרודקשן (אם יש)
python3 scripts/production-update/preserve_production_changes.py
```

**מה הסקריפט עושה:**

- מזהה שינויים לא שמורים
- מזהה שינויים ב-config files
- מציע לשמור אותם ב-git
- דוחף ל-production branch

**⚠️ חשוב:** אם יש שינויים ב-`production/Backend/config/settings.py`, הם חייבים להישמר!

### שלב 2: עדכון מ-main

```bash
# 1. עדכון מ-remote
git pull origin production

# 2. מיזוג מ-main
git merge main
```

**אם יש קונפליקטים:**

- Conflict resolver שומר אוטומטית על קבצי config של production
- אם יש קונפליקטים אחרים, פתור ידנית

### שלב 3: הרצת Master Script

```bash
# הרצת כל התהליך
python3 scripts/production-update/master.py
```

**מה Master Script עושה:**

1. Collect Changes - איסוף שינויים
2. Merge Main - מיזוג (עם conflict resolver)
3. Cleanup Documentation - ניקוי
4. Backup Database - גיבוי DB
5. Sync Code - סנכרון קוד (Backend + UI)
6. Cleanup Backups - ניקוי גיבויים
7. Fix Config - תיקון הגדרות production
8. Validate - בדיקות
9. Bump Version - עדכון גרסה
10. Commit & Push - Git commit & push
11. Start Server - הפעלת שרת (אופציונלי)

**אפשרויות:**

```bash
# שלבים ספציפיים
python3 scripts/production-update/master.py --steps 1,2,5

# דילוג על שלבים
python3 scripts/production-update/master.py --skip 11

# Dry-run (ללא ביצוע)
python3 scripts/production-update/master.py --dry-run
```

### שלב 4: תיעוד עדכוני שרת (אם יש שינויים)

```bash
# תיעוד אוטומטי
python3 scripts/production-update/document_server_changes.py
```

**מה הסקריפט עושה:**

- מזהה שינויים ב-config files
- מנתח שינויים בהגדרות מפתח
- מעדכן את `SERVER_CHANGES.md`

---

## 🔍 בדיקות ואימות

### בדיקת Sync

```bash
# בדיקת sync עם checksums
python3 scripts/sync_verifier.py
```

**תוצאה צפויה:**

```
✅ All critical files verified
✅ Sync verification passed!
```

### בדיקת מבנה

```bash
# בדיקת מבנה כללי
./scripts/verify_production.sh
```

**תוצאה צפויה:**

```
✅ Verification passed
```

### בדיקת הפרדה

```bash
# בדיקת הפרדה מלאה
./scripts/verify_production_isolation.sh
```

**תוצאה צפויה:**

```
✅ Isolation verification passed
```

---

## ⚠️ נקודות קריטיות

### 1. שמירת שינויים בפרודקשן

**קריטי:** לפני כל merge, יש לשמור שינויים שנעשו ישירות בפרודקשן!

```bash
python3 scripts/production-update/preserve_production_changes.py
```

**קבצים שצריך לשמור:**

- `production/Backend/config/settings.py`
- `production/Backend/config/logging.py`
- `production/Backend/config/database.py`

### 2. הגדרות Production

**אחרי כל sync, ודא:**

- `IS_PRODUCTION = True` (hardcoded)
- `PORT = 5001` (hardcoded)
- `DEVELOPMENT_MODE = False`
- `CACHE_DISABLED = False`

Master Script מתקן זאת אוטומטית, אבל תמיד כדאי לבדוק.

### 3. DB Protection

**המערכת מגנה על DB:**

- גיבוי אוטומטי לפני sync
- שמירת db/ directory
- שחזור אוטומטי אחרי sync

---

## 📝 מסמכי עבודה משותפים

### איך לעבוד עם המסמכים

**ראה [`SHARED_WORKSPACE.md`](./SHARED_WORKSPACE.md) לפרטים מלאים.**

**כללי עבודה:**

- **אין דריסה** - תמיד הוסף, אל תמחק
- **תמיד תעד** - כל שינוי חייב להיות מתועד
- **תקשר** - אם יש שינוי משמעותי, הודע לצד השני

### מסמכים עיקריים

1. **`UPDATE_PROCESS.md`** - תהליך עדכון מלא
   - סביבת הפיתוח: מעדכנת שלב 0
   - סביבת הפרודקשן: מעדכנת שלבים 1-6

2. **`SERVER_CHANGES.md`** - תיעוד שינויים בשרת
   - סביבת הפרודקשן: מעדכנת עם שינויים ב-config

3. **`PRODUCTION_DEVELOPER_GUIDE.md`** - מדריך למפתחי פרודקשן
   - שני הצדדים: יכולים לעדכן

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

## ✅ Checklist לפני עדכון

- [ ] כל השינויים בפרודקשן נשמרו ב-git
- [ ] כל השינויים בפרודקשן נדחפו ל-production branch
- [ ] אין שינויים לא שמורים בפרודקשן
- [ ] Master Script מוכן לרוץ
- [ ] יש גיבוי של DB (אופציונלי, אבל מומלץ)

---

## 📞 תקשורת עם סביבת הפיתוח

### איך לראות עדכונים מסביבת הפיתוח

```bash
# רשימת commits אחרונים
git log --oneline origin/main -10

# השוואה
git diff main..production -- documentation/production/

# קריאת מסמכים
cat documentation/production/UPDATE_PROCESS.md
cat documentation/production/SERVER_CHANGES.md
```

### איך לעדכן את סביבת הפיתוח

```bash
# Commit שינויים
git add documentation/production/
git commit -m "docs: Update production documentation [תיאור]"
git push origin production

# סביבת הפיתוח תראה את העדכונים ב-merge הבא
```

---

## 📚 מסמכים נוספים

- [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md) - תהליך עדכון מלא
- [`PRODUCTION_TEAM_INFO.md`](./PRODUCTION_TEAM_INFO.md) - מידע כללי לצוות
- [`PRODUCTION_DEVELOPER_GUIDE.md`](./PRODUCTION_DEVELOPER_GUIDE.md) - מדריך למפתחי פרודקשן
- [`SHARED_WORKSPACE.md`](./SHARED_WORKSPACE.md) - מסמכי עבודה משותפים
- [`SERVER_CHANGES.md`](./SERVER_CHANGES.md) - תיעוד שינויים בשרת

---

**עודכן:** 2025-01-21  
**גרסה:** 1.0.0

