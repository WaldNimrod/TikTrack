# TikTrack Production Release Playbook

**Last Updated:** 2025-11-13  
**Audience:** Developers המבצעים עדכוני פרודקשן מקומיים  
**Scope:** עבודה עם קוד, מסד נתונים, גיבויים ו-Git תוך שמירה על יציבות סביבת הפרודקשן

---

## 1. עקרונות ליבה

- ✅ **לא מוחקים נתונים מפרודקשן** – מבצעים גיבוי, מוודאים סכמה, ואז מריצים מיגרציות/עדכונים נקודתיים.
- ✅ **הגדרות Production הן Hardcoded** (`IS_PRODUCTION=True`, `PORT=5001`, DB ב-`production/Backend/db/tiktrack.db`).
- ✅ **קוד ↔ נתונים מסונכרנים** – כל שינוי קוד דורש וידוא שהסכמה והנתונים תואמים (currencies, חשבון `ibkr-int`, פרופיל העדפות).
- ✅ **Git יעיל** – משתמשים בסקריפטים/Tasks כדי להימנע מתקיעת הטרמינל של Cursor.
- ✅ **תיעוד במקביל** – כל שינוי תהליך חייב להיכנס למסמך זה ול-`UPDATE_PROCESS.md`.

---

## 2. סט כלים אוטומטי

| פעולה | סקריפט | מה הוא עושה |
| --- | --- | --- |
| גיבוי DB | `python scripts/release/create_db_backup.py --label <label>` | גיבוי PostgreSQL כולל בדיקות תקינות וקובץ מטא-דאטה |
| צ'ק-ליסט מקדים | `python scripts/release/run_release_checklist.py` | גיבוי → אימות סכמה → `verify_production_isolation.sh` → `verify_production.sh` |
| שמירת סכמה | `python scripts/release/verify_schema.py` | משווה לטבלת האמת `_Tmp/simpleTrade_new.db`, מוודא מטבעות וחשבון `ibkr-int` |
| בדיקות לאחר עדכון | `python scripts/release/post_update_validation.py --health-url ...` | אימות סכמה, בדיקות הפרדה, בדיקת API אופציונלית |
| Staging ל-Git | `python scripts/release/git_stage_release.py` | מבצע `git add` מושכל ומציג מצב לפני/אחרי |

> כל הסקריפטים זמינים גם כ-Cursor Tasks (`TT: Release - ...`).

---

## 3. חבילות נתונים והגנות

### 3.1 גיבוי חובה לפני כל שינוי

1. עצור שרת פעיל (`lsof -i :5001`).
2. הרץ `create_db_backup.py` עם תיאור (`--notes`).
3. ודא שנוצרו גם קובץ `.db` וגם `.meta.json` באותה תיקיה.

### 3.2 בדיקות סכמה והנתונים החיוניים

הרץ:

```bash
python scripts/release/verify_schema.py
```

הסקריפט יזהה:

- טבלאות/עמודות/אינדקסים חסרים או מיותרים;
- היעדר רשומות ב־`currencies` (`USD`, `EUR`, `ILS`);
- היעדר חשבון `ibkr-int` (אי קיום יוצר כישלון).

### 3.3 שחזור נקי לצורך QA

1. `create_db_backup.py --label before-clean-build`.
2. `python scripts/release/verify_schema.py --skip-reference-data` כדי לבנות מחדש.
3. הזן ערכי ברירת מחדל:
   - מעדכנים `currencies` (אם חסר, הכנס שלושת המטבעות);
   - מוסיפים חשבון `ibkr-int` וסט של העדפות (ראה סקריפט `Backend/scripts/create_production_db.py` לדוגמה);
   - מוודאים שמופעלים טריגרים/אינדקסים (`verify_schema.py` יאשר).

---

## 4. Workflow מומלץ ב-Git

1. משוך `main` ו-`production` מהטרמינל החיצוני (iTerm/Terminal) כדי להימנע מעומס Cursor.
2. `git merge main` לתוך `production`.
3. פתר קונפליקטים, ואז הרץ `python scripts/release/git_stage_release.py` – כך ה-staging יימנע מקבצים מיותרים.
4. בצע Commit ברור (אנגלית בלבד) בסגנון `chore: production release YYYY-MM-DD`.
5. `git push origin production` לאחר בדיקות והפעלת סקריפטי הוולידציה.

> במקרי קונפליקט קשים, ניתן לפתוח `git mergetool` מהטרמינל החיצוני ולהמשיך עבודה ב-Cursor לאחר סגירה.

---

## 5. לאחר ההטמעה (Post Release)

- הרץ `post_update_validation.py` עם `--health-url` כדי לוודא שה-API מגיב.
- ודא בהנד-אאוט:
  - הלוגים (`production/Backend/logs/app.log`) נקיים משגיאות;
  - ממשקי UI (Preferences, Trades, Alerts) נטענים ללא 500/404;
  - ה-Cache Clear Menu וה-Cache TTL Guard נטענים מהנתיב הנכון.
- עדכן את `documentation/version-manifest.json` ו-`documentation/production/VERSION_HISTORY.md` דרך הסקריפט `bump-version.py`.

---

## 6. טיפול בתקלות נפוצות

| תקלה | מה לבדוק | פתרון |
| --- | --- | --- |
| `verify_schema` נכשל | טבלה חסרה, רשומות מטבעות חסרות | סנכרן סכמה עם `_Tmp/simpleTrade_new.db`, הוסף רשומות מינימום |
| פרודקשן מציג נתוני פיתוח | בדוק נתיב DB ב־`config/settings.py` | ודא העתקה של `tiktrack.db` הנכון + הפעל גיבוי שנוצר לפני הסנכרון |
| צבעים בעמוד העדפות נעולים | פרופיל ברירת מחדל פעיל | צור/טען פרופיל ייעודי לפרודקשן והגדר חשבון `ibkr-int` כברירת מחדל |
| Cursor נתקע בזמן `git add` | שימוש בפקודות ארוכות | הרץ `python scripts/release/git_stage_release.py` או עמוד ה-TT Task הרלוונטי |
| `post_update_validation` מחזיר כשל בריאות | שרת לא פעיל/נתיב לא נכון | הפעל `./start_production.sh`, ודא שהבריאות זמינה ב-URL הנכון |

---

## 7. נספחים

- `_Tmp/simpleTrade_new.db` – קובץ אמת לסכמה ולטבלאות עזר.
- `Backend/scripts/create_production_db.py` – מקור לערכי ברירת מחדל (מטבעות, פרופילים, חשבון).
- `documentation/production/UPDATE_PROCESS.md` – מדריך שלב-אחר-שלב למנהלי גרסה.
- `documentation/frontend/GENERAL_SYSTEMS_LIST.md` – רשימת מערכות כלליות שנדרש להשתמש בהן.

---

## 8. שאלות פתוחות לשיפור עתידי

1. **אוטומציית מיגרציות** – שילוב `alembic` או כלי פנימי לסנכרון דיפרנציאלי של סכמה.
2. **אינטגרציה עם GitHub Actions** – יצירת תהליך CI להרצת `verify_schema.py` ו-`post_update_validation.py` על כל Merge Request.
3. **חבילת "Clean DB Builder"** – הפיכת הסקריפטים הקיימים לחבילה אחת שניתנת להוראה ע"י Task יחיד.

> הצעות לשיפור? עדכנו את המסמך והוסיפו לינק לדיון ב-`documentation/INDEX.md`.

