# TikTrack Production Update Process - מדריך עדכון פרודקשן

**תאריך:** 2025-11-13  
**גרסה:** 1.3.0  
**מטרה:** תהליך מלא, אוטומטי ובטוח לעדכון קוד ונתונים בסביבת הפרודקשן המקומית.

---

## ⚡ TL;DR - רצף מהיר

### שיטה חדשה (מומלץ) - Master Script

```bash
# הרצת כל התהליך בפקודה אחת
python scripts/production-update/master.py
```

### שיטה קלאסית (עדיין נתמכת)

```bash
# 0. עצירת השרת (אם רץ)
lsof -i :5001 && kill <PID>

# 1. סיכום שינויים מה-main
git fetch origin main
git log origin/main -10 --oneline > _Tmp/release_notes_main.log

# 2. גיבוי ובדיקות מקדימות
python scripts/release/run_release_checklist.py --label pre-update

# 3. סנכרון קוד
./scripts/sync_to_production.py

# 4. בדיקות אחרי סנכרון
python scripts/release/post_update_validation.py --health-url http://localhost:5001/api/health

# 5. ניהול גרסה ו-Git
python scripts/release/git_stage_release.py
python scripts/versioning/bump-version.py --env production --bump patch --note "Release YYYY-MM-DD"
git commit -m "chore: production release YYYY-MM-DD"
git push origin production
```

> כל השלבים זמינים גם כ־Cursor Tasks (Cmd+Shift+P → Tasks: Run Task → TT:*).  
> **חדש:** Master Script זמין ב-`scripts/production-update/master.py` - ראה `scripts/production-update/README.md`

---

## 🆕 חידושים בגרסה 2.0.0

- 🎯 `scripts/production-update/master.py` – Master Script מאוחד להרצת כל התהליך בפקודה אחת
- 📦 מערכת מודולרית – כל שלב במודול נפרד, ניתן להריץ בנפרד
- 🔄 Resume mode – המשך מהשלב האחרון שנכשל
- 🧪 Dry-run mode – הרצה ללא ביצוע שינויים
- 📊 דיווח מפורט – דוחות JSON, לוגים, סיכומים
- 🔙 Rollback אוטומטי – snapshot לפני כל עדכון
- 🧹 ניקוי גיבויים אוטומטי – משולב ב-sync
- 🌐 בדיקות UI אוטומטיות – בדיקת עמודים, JavaScript, CSS
- 🤖 פתרון קונפליקטים אוטומטי – פתרון לפי כללים מוגדרים

## 🆕 חידושים בגרסה 1.3.0

- 🧱 `scripts/release/create_db_backup.py` – גיבוי אוטומטי עם `PRAGMA integrity_check` וקובץ מטא-דאטה.
- 🧬 `scripts/release/verify_schema.py` – שמירת סכמה מול `_Tmp/simpleTrade_new.db` ובדיקת נתוני רפרנס (מטבעות, `ibkr-int`).
- ✅ `scripts/release/run_release_checklist.py` – צ'ק-ליסט מקיף (גיבוי→סכמה→בדיקות).
- 🚦 `scripts/release/post_update_validation.py` – בדיקות אחרי העדכון, כולל ping ל־API אופציונלי.
- 🧰 `scripts/release/git_stage_release.py` – Staging מהיר לקבצים הרלוונטיים בלי מאמץ ידני.
- 📘 `documentation/03-DEVELOPMENT/PRODUCTION_RELEASE_PLAYBOOK.md` – מדריך מפורט למפתח/ת.

---

## 📋 תהליך עדכון פרודקשן - סקירה מהירה

1. **איסוף שינויים מ-main** – יצוא תקציר הקומיטים האקטואליים לצורך רישום היסטורי.
2. **עדכון main** – משיכת שינויים אחרונים.
3. **מיזוג main → production** – שמירה על קונפליקטים נקיים.
4. **גיבוי + הולידציות** – `run_release_checklist.py`.
5. **סינכרון קוד** – `sync_to_production.py`.
6. **בדיקות** – `post_update_validation.py` + בדיקות נוספות לפי הצורך.
7. **עדכון גרסה** – `bump-version.py`.
8. **Git Commit & Push** – עם סקריפט staging או ידנית.

---

## 🚀 תהליך מפורט

### שלב 0: איסוף מידע מה-`main`

```bash
git fetch origin main
git log origin/main -15 --oneline > documentation/production/_Tmp_release_notes_main.log
```

- שמור את הפלט בקובץ זמני (למשל `documentation/production/_Tmp_release_notes_main.log`) כדי שניתן יהיה לתמצת את השינויים העיקריים עבור גרסת הפרודקשן.
- ציין ב-commit message של הפרודקשן את התכולה העיקרית (לפי הקובץ) והעתק את הסיכום אל `documentation/production/VERSION_HISTORY.md`.
- במידה והקומיטים אינם כוללים פרטים מספקים, שלח פינג לצוות הפיתוח לעדכן תיאור עשיר לפני המשך התהליך.

### שלב 1: עדכון `main`

```bash
git checkout main
git pull origin main
git log --oneline -10
```

### שלב 2: מיזוג ל-`production`

```bash
git checkout production
git pull origin production
git merge main
```

⚠️ טיפי מיזוג:
- השתמש ב־`git checkout --theirs` עבור רוב הקונפליקטים.
- ודא ש־`production/Backend/config/settings.py` ו־`config/logging.py` נשארים ב-hardcode לפרודקשן.
- כלל ברזל: במצב קונפליקט – גרסת `main` מנצחת. אם אין צורך בעדכון מקומי, הרץ `git checkout --theirs <path>` או `git restore --source=origin/main <path>` לכל קובץ שסומן בקונפליקט.

### שלב 2.5: גיבוי מסד נתונים (חובה!)

```bash
python scripts/release/create_db_backup.py --label pre-update --notes "לפני שחרור 1.3"
```

- מבצע `PRAGMA integrity_check`.
- יוצר קובץ גיבוי ב־`Backend/db/backups/<db>_<label>_<timestamp>.db`.
- מייצר קובץ מטא (`*.meta.json`) שמקל על שחזור.

לשחזור: עצירה (`kill <PID>`), ואז `cp <backup> Backend/db/tiktrack.db` ו־`cp Backend/db/tiktrack.db production/Backend/db/tiktrack.db`.

### שלב 3: סנכרון קוד

```bash
./scripts/sync_to_production.py
```

הסקריפט מעתיק רק קבצים פעילים ומוחק את התיקיה הקודמת כדי למנוע זבל.

### שלב 3.5: תיקון הגדרות Production

```bash
cd production/Backend
python3 -c "from config.settings import UI_DIR, DB_PATH, PORT, IS_PRODUCTION; \
    print(f'UI: {UI_DIR}'); \
    print(f'DB: {DB_PATH}'); \
    print(f'Port: {PORT}'); \
    print(f'Production: {IS_PRODUCTION}')"
```

הגדרות צפויות:
- `IS_PRODUCTION = True`
- `PORT = 5001`
- `DB_PATH = BASE_DIR / "db" / "tiktrack.db"`
- `UI_DIR = BASE_DIR.parent / "trading-ui"`
- ב־`config/logging.py`: `log_dir = Path("logs")`

### שלב 3.8: בניית DB נקי (אופציונלי)

1. `kill <PID>` לפורט 5001 (אם רץ).
2. `python scripts/release/create_db_backup.py --label before-refresh`.
3. `python scripts/release/verify_schema.py --skip-reference-data`.
4. הזן נתוני בסיס (ראו Playbook).
5. `./start_production.sh` לאחר הזנה.

### שלב 4: בדיקות ואימות

#### 4.1 צ'ק-ליסט אוטומטי
```bash
python scripts/release/run_release_checklist.py --label pre-update
```

#### 4.2 בדיקות נוספות
```bash
python scripts/release/post_update_validation.py --health-url http://localhost:5001/api/health
```
- מריץ `verify_schema.py`, `verify_production_isolation.sh`, `verify_production.sh`.
- מאפשר בדיקת בריאות HTTP אופציונלית.

#### בדיקות ידניות שכדאי לוודא
- צפייה ב־`production/Backend/logs/app.log`.
- פתיחת UI ובדיקת עמודים מרכזיים (trades, alerts, preferences).

### שלב 5: עדכון גרסה

```bash
python3 scripts/versioning/bump-version.py \
  --env production \
  --bump patch \
  --note "Release YYYY-MM-DD"
```

- הסקריפט מעדכן את `documentation/version-manifest.json` ואת `documentation/production/VERSION_HISTORY.md`.
- שימוש ב־`--set-version ... --allow-major-minor` רק באישור מפורש.

### שלב 6: Git Commit & Push

```bash
python scripts/release/git_stage_release.py
git status --short
git commit -m "chore: production release YYYY-MM-DD"
git push origin production
```

- הסקריפט מבצע staging לקבצים הרלוונטיים (תיעוד, release scripts, פריטי אימות).
- ניתן להוסיף נתיב נוסף: `python scripts/release/git_stage_release.py --path production/trading-ui/index.html`.

### שלב 7: הפעלת שרת פרודקשן

```bash
# אימות שהפורט פנוי
lsof -i :5001 && kill <PID>

# בדיקת מוכנות (ללא הפעלה)
./start_production.sh --check-only

# הפעלה ברקע (מומלץ)
./start_production.sh > logs-production/start.log 2>&1 &
```

- בהפעלה ב-Cursor מומלץ להשתמש בפקודת Task הייעודית (`TT: Server - Start Production`) או להוסיף `is_background=true` כדי להשאיר את הטרמינל זמין.
- לאחר ההפעלה אמת שהשרת מאזין: `lsof -i :5001`.

---

## 📝 תהליך מהיר (Quick Update)

```bash
git checkout main && git pull origin main
git checkout production && git pull origin production
git merge main
python scripts/release/run_release_checklist.py --skip-schema
./scripts/sync_to_production.py
python scripts/release/post_update_validation.py --skip-schema --skip-isolation
python scripts/versioning/bump-version.py --env production --bump patch --note "Quick update"
python scripts/release/git_stage_release.py
git commit -m "chore: production quick-update"
git push origin production
./start_production.sh > logs-production/start.log 2>&1 &
```

---

## 🔍 פתרון בעיות נפוצות

### קונפליקטים במיזוג
```bash
git status
# פותר קבצים ידנית, במיוחד production/Backend/**
git add <files>
git commit -m "Resolve merge conflicts"
```

### קבצים חסרים אחרי sync
```bash
./scripts/sync_to_production.py
./scripts/verify_production.sh
```

### שגיאות import אחרי sync
```bash
cd production/Backend
python3 -c "from config.settings import DB_PATH, UI_DIR, PORT, IS_PRODUCTION; \
    print(DB_PATH, UI_DIR, PORT, IS_PRODUCTION)"
```

### שרת לא מתחיל
```bash
lsof -i :5001
tail -f production/Backend/logs/app.log
python scripts/release/post_update_validation.py --skip-schema --skip-isolation
```

### עבודה עם Git ב-Cursor
```bash
python scripts/release/git_stage_release.py
```
הסקריפט מטפל ב-staging נקי ומציג מצב לפני/אחרי.

### שחזור גיבוי
```bash
python scripts/release/create_db_backup.py --label emergency --notes "לפני שחזור"
cp Backend/db/backups/<backup>.db Backend/db/tiktrack.db
cp Backend/db/tiktrack.db production/Backend/db/tiktrack.db
```

---

## ✅ Checklist לפני Commit

- [ ] `run_release_checklist.py` ו-`post_update_validation.py` עברו בהצלחה.
- [ ] אין קבצי DB/לוגים ב־Git.
- [ ] `config/settings.py` ב־production ב-hardcode.
- [ ] `config/logging.py` מצביע על `logs`.
- [ ] קיימים המטבעות USD/EUR/ILS וחשבון `ibkr-int`.
- [ ] גרסה עודכנה (`version-manifest.json`, `VERSION_HISTORY.md`).
- [ ] commit message ברור (מומלץ `chore: production release YYYY-MM-DD`).

---

## 📚 נספחים ורפרנסים

### Master Script (מומלץ)
- `scripts/production-update/master.py` - Master Script מאוחד
- `scripts/production-update/README.md` - מדריך Master Script

### מדריכים
- `documentation/03-DEVELOPMENT/PRODUCTION_RELEASE_PLAYBOOK.md`
- `documentation/frontend/GENERAL_SYSTEMS_LIST.md`
- `documentation/INDEX.md`

### סקריפטים (עדיין נתמכים)
- `scripts/release/create_db_backup.py`
- `scripts/release/verify_schema.py`
- `scripts/release/run_release_checklist.py`
- `scripts/release/post_update_validation.py`
- `scripts/release/git_stage_release.py`
- `scripts/verify_production_isolation.sh`
- `scripts/verify_production.sh`
- `scripts/sync_to_production.py`


