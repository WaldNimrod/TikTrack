# TikTrack Production Update Process - מדריך עדכון פרודקשן

**תאריך:** 2025-11-08  
**גרסה:** 1.0.0  
**מטרה:** תהליך מלא ומסודר לעדכון קוד הפרודקשן המקומי מול Git

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
- ודא שהקבצים ב-`production/Backend/` לא נפגעו
- בדוק שההגדרות ב-`production/Backend/config/settings.py` נשארו נכונות

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
✅ Backend sync completed: ~148 files copied
✅ UI sync completed: ~488 files copied
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
python3 -c "from config.settings import DB_PATH, UI_DIR; print(DB_PATH, UI_DIR)"

# אם יש בעיה, תקן את config/settings.py
# ודא ש-UI_DIR מצביע על production/trading-ui
# ודא ש-DB_PATH מצביע על production/Backend/db/TikTrack_DB.db
```

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
- [ ] ההגדרות ב-`production/Backend/config/settings.py` נכונות
- [ ] UI_DIR מצביע על `production/trading-ui`
- [ ] DB_PATH מצביע על `production/Backend/db/TikTrack_DB.db`
- [ ] PORT = 5001
- [ ] IS_PRODUCTION = True
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
- `production/Backend/config/settings.py` - הגדרות פרודקשן
- `production/start_production.sh` - הפעלת שרת

---

## 📚 תיעוד נוסף

- `CODE_SEPARATION.md` - מדריך הפרדת קוד
- `ISOLATION_VERIFICATION.md` - בדיקות הפרדה
- `PARALLEL_RUNNING.md` - הרצה במקביל
- `PRODUCTION_SETUP.md` - הקמת סביבה

---

**עודכן:** 2025-11-08  
**גרסה:** 1.0.0  
**מטרה:** תהליך עדכון מסודר ומובנה

