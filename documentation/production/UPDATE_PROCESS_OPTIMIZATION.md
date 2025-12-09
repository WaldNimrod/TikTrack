# TikTrack Production Update Optimization

_Last reviewed: 2025-11-15 — Owners: Release Engineering_

המסמך מנתח את התהליך הקיים ומציע שיטה אופטימלית שמגינה על בסיס הנתונים, מעדכנת קוד בצורה עקבית, מפחיתה עבודה ידנית ומריצה בדיקות אוטומטיות לאחר כל סנכרון.

---

## 1. מצב קיים – ממצאים מרכזיים

| רכיב | מיקום | אתגר נוכחי |
| --- | --- | --- |
| תהליך תיעודי | `documentation/production/UPDATE_PROCESS.md` | התיעוד מפורט אך נשען על צעדים ידניים (שחזור `config/*`, העתקת DB, יצירת `logs/`). |
| גיבוי נתונים | `scripts/release/create_db_backup.py`, `run_release_checklist.py` | הגיבוי אמין אך אינו מבטיח העתקה ל־`production/Backend/db/` ואינו מתעד סטטוס אחרי סנכרון. |
| סנכרון קוד | `scripts/sync_to_production.py` | מוחק ומעתיק Backend/UI, אך אינו מחזיר קבצי production הקבועים לפני ה־commit ואינו מפעיל העתקת DB/לוגים. |
| ניהול Git | `scripts/release/git_stage_release.py`, תיעוד ה-Playbook | עדיין נדרשים פקודות ידניות (merge, commit, push) ופתרון קונפליקטים עלול להשאיר קבצי prod במצב dev. |
| בדיקות אחרי עדכון | `scripts/release/post_update_validation.py` | מכסה סכמה, בידוד ומבנה, אך חסר סט בדיקות פונקציונלי (API/UI) ברירת מחדל. |
| הפעלת שרת | `start_production.sh` + הוראות ב-`UPDATE_PROCESS.md` | עדיין דורש kill/check/הפעלה ידניים; אם הקונפיג שגוי, מתקבל כשל מאוחר (NameError, יציאה מידית). |

---

## 2. הגנות על בסיס הנתונים

### 2.1 נקודות בקרה מוצעות

1. **Pre-Sync Backup:** `python scripts/release/create_db_backup.py --label pre-sync` (כבר קיים).  
2. **Post-Schema Snapshot:** הרצת `verify_schema.py --dump-report Backend/db/backups/schema_report_<ts>.json` (תוספת חדשה לסקריפט) לוגית.  
3. **Guard Copy:** סקריפט חדש `scripts/release/reset_production_configs.py` (ראה §4) שיבצע:  
   - העתקה מיידית: `cp Backend/db/tiktrack.db production/Backend/db/tiktrack.db`.  
   - ולידציית PRAGMA שניה לאחר ההעתקה כדי לוודא שלא נוצרה גרסה פגומה.  

### 2.2 אימותי נתונים קריטיים

| בדיקה | איך מריצים | מטרה |
| --- | --- | --- |
| מטבעות חובה | הרחבת `verify_schema.py` שתיכשל אם חסרים USD/EUR/ILS | ווידוא reference data |
| חשבון `ibkr-int` | כבר קיים ב־`verify_schema.py` | חשבון ברירת המחדל |
| טבלאות meta | להשוות מול `_Tmp/simpleTrade_new.db` (פרק 3.2 ב-Playbook) | הגנה על מבנה הסכמה |

### 2.3 שחזור מהיר

- **Pipeline מוצע:**  
  1. `create_db_backup.py --label before-clean-build`.  
  2. `scripts/release/reset_production_configs.py --refresh-db` (אופציה שתבנה DB ריק, תריץ seed, תעתיק לפרודקשן).  
  3. `post_update_validation.py --skip-schema --health-url ...` כדי לאמת שרת.  

---

## 3. עדכון קוד ו-Git – שיטה מומלצת

1. **Merge בטרמינל חיצוני** (iTerm/Terminal) כדי להימנע מתקיעת Cursor:  

   ```bash
   git checkout main && git pull origin main
   git checkout production && git pull origin production
   git merge main
   ```

2. **פתרון קונפליקטים:** `git checkout --theirs production/Backend/config/settings.py` וכד' לפי סעיף 3.5 בתהליך.  
3. **סקריפט אבטחת קבצים קבועים:** לאחר merge וסנכרון, להריץ:  

   ```bash
   python scripts/release/reset_production_configs.py --restore-configs --copy-db
   ```  

   כך מונעים מצב שבו `config/logging.py` נותר עם `logs-production` או `ENVIRONMENT` לא קבוע.
4. **Staging ממוכן:** `python scripts/release/git_stage_release.py --extra production/Backend/services/trading_methods_seed_data.py`.  
5. **Commit Hooks:** להשתמש ב־`pre-push` (או בפקודת `SKIP_VERSION_CHECK=1` רק בעת חרום) כדי להבטיח שה-Manifest והיסטוריית הגרסאות עודכנו דרך `bump-version.py`.

---

## 4. פתירת עבודה ידנית – Blueprint אוטומציה

| Script/Task חדש | אחריות | אינטגרציה |
| --- | --- | --- |
| `scripts/release/reset_production_configs.py` | 1) החזרת `config/settings.py` ו-`config/logging.py` מגרסה קשיחה, 2) העתקת DB, 3) יצירת `production/Backend/logs/`, 4) וידוא seed נתונים (`trading_methods_seed_data.py`). | להריץ מיד אחרי `sync_to_production.py` ובכל פעם שנוצרים קונפליקטים. |
| `scripts/release/run_post_release_tests.py` | Wrapper להרצת `post_update_validation.py`, בדיקות API, ועיקרי UI smoke. | מפעיל שלב בדיקות אחיד (ראה §5). |
| Cursor Tasks (TT) | `TT: Release - Full Pipeline` שמחבר את כל הסקריפטים לפי סדר. | שומר על אחידות גם למי שמעדיף UI. |

> **יישום עתידי:** ניתן להוסיף פרמטר `--apply-template` ל־`sync_to_production.py` שיזמן את הסקריפט לעיל אוטומטית, אך בשלב ראשון מומלץ לשמור על צעד נפרד וברור.

---

## 5. סט בדיקות אוטומטי לאחר העדכון

| קטגוריה | פקודה | הערות |
| --- | --- | --- |
| ולידציה מובנית | `python scripts/release/post_update_validation.py --health-url http://localhost:5001/api/health` | כבר קיים, נשאר צעד חובה. |
| API Smoke | `npm run test:api-smoke` (להריץ על `tests/integration/*.test.js`) | להריץ באמצעות Node (קיים תיקיית `tests/integration`). ניתן לעטוף ב־`run_post_release_tests.py`. |
| UI Smoke | `npm run test:e2e -- --spec tests/e2e/user-pages/preferences.test.js` | מריץ מסלולים עיקריים (Preferences/Trades). |
| DB Drift | `python scripts/release/verify_schema.py --report artifacts/schema_<ts>.json` | שומר דוח לצורך ביקורת. |

**Sequence מומלץ:**

```bash
python scripts/release/post_update_validation.py --health-url http://localhost:5001/api/health
npm run test:api-smoke
npm run test:e2e -- --spec tests/e2e/user-pages/preferences.test.js
python scripts/release/verify_schema.py --report artifacts/schema_<ts>.json
```

התוצאות נשמרות ב-`reports/release/<timestamp>/`.

---

## 6. Roadmap ליישום

| טווח | צעדים |
| --- | --- |
| קצר (יום–יומיים) | - ליצור את `reset_production_configs.py` + פרמטר חדש ל-`post_update_validation.py` לייצוא דוח. <br> - להוסיף Task ב-Cursor שמריץ את רצף הסקריפטים. |
| בינוני (שבוע) | - לעדכן `sync_to_production.py` כך שייתן אזהרה אם `production/Backend/config/*` שונים מהתבנית, ויאפשר פלג `--apply-template`. <br> - להרחיב `verify_schema.py` לתמוך ביצוא דוח JSON + בדיקת רשומות חובה מורחבת. |
| ארוך | - אינטגרציה עם GitHub Actions להרצת `run_release_checklist.py` ו-`run_post_release_tests.py` על Merge Request. <br> - בניית “Clean DB Builder” כחלק מחבילת pip פנימית שניתן להפעיל Task יחיד לצורך QA/Onboarding. |

---

## 7. נקודות פעולה מיידיות

1. לאשר את ה-BLUEPRINT וליצור את הסקריפט החדש (כולל תיעוד תחת `documentation/production/UPDATE_PROCESS.md`).  
2. להרחיב את התהליך המהיר ב-UPDATE_PROCESS כך שיכלול שלב בדיקות אוטומטיות אחד לפחות.  
3. לתאם עם צוות הבדיקות איזה subset של `tests/e2e/` חייב לרוץ בכל שחרור פרודקשן.  
4. לשלב את `reset_production_configs.py` בתור post-step ב-`TT: Release - Full Pipeline`.

---

## 8. סיכום

היישום המוצע ממסד ארבעה צירים:

1. **Data Guard:** רצף גיבויים+השוואות שמופעל אוטומטית.  
2. **Code Sync Template:** סקריפט שמחזיר את production config/db/logs למצב מסודר ללא התערבות ידנית.  
3. **Git Workflow ברור:** merge חיצוני + staging סקריפטי + commit policy.  
4. **בדיקות Post-Update:** pipeline אחיד לבדיקות API/UI מעבר לאימותי הסכמה.

השילוב יבטיח הגנה מלאה על בסיס הנתונים, עדכון קוד מדויק וחזרה על תהליך יציב ואחיד בכל גרסה, כולל סט בדיקות אוטומטי בכל שחרור.


