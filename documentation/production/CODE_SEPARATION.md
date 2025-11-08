# TikTrack Production Code Separation Guide

**תאריך:** 2025-11-08  
**גרסה:** 1.0.0  
**מטרה:** מדריך מפורט להפרדת קוד פרודקשן מסביבת הפיתוח

## סקירה כללית

סביבת הפרודקשן מופרדת לחלוטין מסביבת הפיתוח:

- **תקייה נפרדת:** `production/Backend/` - רק קבצים פעילים
- **Git Branch נפרד:** `production` - קוד נקי ללא tests/migrations
- **בסיס נתונים נפרד:** `TikTrack_DB.db` - רק נתוני עזר והעדפות
- **פורט נפרד:** 5001 (פיתוח: 8080)
- **לוגים נפרדים:** `production/Backend/logs/`

## מבנה תקיות

```
TikTrackApp/
├── Backend/                              # סביבת פיתוח (כל הקבצים)
│   ├── app.py
│   ├── config/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── utils/
│   ├── scripts/                           # כל הסקריפטים
│   ├── tests/                             # בדיקות
│   ├── migrations/                       # מיגרציות
│   ├── db/
│   │   └── simpleTrade_new.db            # DB פיתוח
│   └── logs/                              # לוגים פיתוח
│
├── production/                            # סביבת פרודקשן (רק קבצים פעילים)
│   ├── Backend/
│   │   ├── app.py                        # ✅ קוד פעיל
│   │   ├── requirements.txt              # ✅ תלויות
│   │   ├── config/                        # ✅ 5 קבצים פעילים
│   │   ├── routes/                       # ✅ כל ה-routes
│   │   ├── services/                     # ✅ כל ה-services
│   │   ├── models/                       # ✅ כל ה-models
│   │   ├── utils/                        # ✅ כל ה-utils
│   │   ├── scripts/                      # ✅ רק 3 קבצים
│   │   │   ├── backup_database.py
│   │   │   ├── create_production_db.py
│   │   │   └── map_active_files.py
│   │   ├── db/
│   │   │   └── TikTrack_DB.db            # ✅ DB פרודקשן
│   │   └── logs/                          # ✅ לוגים פרודקשן
│   │
│   └── start_production.sh                # ✅ סקריפט הפעלה
│
├── trading-ui/                            # Frontend (משותף)
├── scripts/                               # סקריפטים לניהול
│   ├── sync_to_production.py              # ✅ העתקת קוד
│   └── verify_production.sh               # ✅ אימות
└── start_server.sh                        # הפעלת פיתוח
```

## קבצים בפרודקשן

### קבצים פעילים (~145 קבצים)

- **Core:** `app.py`, `requirements.txt`
- **Config:** כל הקבצים ב-`config/` (5 קבצים)
- **Routes:** כל הקבצים ב-`routes/` (כולל תתי-תקיות)
- **Services:** כל הקבצים ב-`services/` (כולל תתי-תקיות)
- **Models:** כל הקבצים ב-`models/` (22 קבצים)
- **Utils:** כל הקבצים ב-`utils/` (9 קבצים)
- **Scripts:** רק 3 קבצים:
  - `backup_database.py`
  - `create_production_db.py`
  - `map_active_files.py`

### קבצים לא נכללים

- ❌ `tests/` - כל התיקייה
- ❌ `migrations/` - כל התיקייה
- ❌ קבצי פיתוח (`test_*.py`, `migrate_*.py`, וכו')
- ❌ קבצי גיבוי (`*.backup`, `*_backup_*`)
- ❌ קבצי תיעוד (חוץ מ-`README.md` במידת הצורך)

## תהליך עדכון פרודקשן

### עדכון מקוד פיתוח

```bash
# 1. עבודה על פיתוח הושלמה
git checkout main
git pull origin main

# 2. העתקת קוד פעיל לפרודקשן
./scripts/sync_to_production.py

# 3. אימות שהכל תקין
./scripts/verify_production.sh

# 4. Commit ב-production branch
git checkout production
git add production/
git commit -m "Update production: [version]"
git push origin production

# 5. הפעלת פרודקשן
cd production
./start_production.sh
```

### סקריפט Sync

הסקריפט `scripts/sync_to_production.py` מזהה אוטומטית קבצים פעילים:

- סורק את `Backend/` לאיתור כל הקבצים
- מעתיק רק קבצים מתיקיות מותרות:
  - `config/`
  - `routes/` (כולל תתי-תקיות)
  - `services/` (כולל תתי-תקיות)
  - `models/`
  - `utils/`
  - `scripts/` (רק 3 קבצים ספציפיים)
- שומר על מבנה תקיות זהה
- מעדכן אוטומטית קבצים חדשים

**יתרון:** קבצים חדשים מזוהים אוטומטית, אין צורך בעדכון רשימות ידניות

## תיקון נתיבים

כל הקבצים בפרודקשן משתמשים ב-`config.settings` לנתיבים:

```python
# ✅ נכון - שימוש ב-config.settings
from config.settings import DB_PATH, UI_DIR

conn = sqlite3.connect(str(DB_PATH))
```

```python
# ❌ שגוי - נתיב קשיח
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "db", "simpleTrade_new.db")
```

הסקריפט `scripts/fix_production_paths.py` מתקן אוטומטית נתיבים קשיחים.

## בסיס נתונים

### יצירת בסיס נתונים פרודקשן

```bash
cd production/Backend
python3 scripts/create_production_db.py
```

הסקריפט:
1. קורא מ-`Backend/db/simpleTrade_new.db` (פיתוח)
2. יוצר `production/Backend/db/TikTrack_DB.db` (פרודקשן)
3. מעתיק את כל מבנה הטבלאות
4. מעתיק נתוני עזר והעדפות
5. מעתיק רק חשבון מסחר אחד (ברירת מחדל)
6. מנקה טבלאות משתמש:
   - `cash_flows`
   - `executions`
   - `tickers`
   - `notes`
   - `alerts`
   - `trade_plans`
   - `trades`

## הפעלת שרת פרודקשן

```bash
cd production
./start_production.sh
```

הסקריפט:
- בודק קונפליקטים על פורט 5001
- מאמת שכל הקבצים קיימים
- מפעיל את השרת במצב foreground
- מציג מידע מפורט על הסביבה

### אפשרויות

```bash
./start_production.sh --check-only    # רק בדיקת קונפליקטים
./start_production.sh --force         # כפיית הפעלה (לא מומלץ)
./start_production.sh --help          # עזרה
```

## אימות סביבה

```bash
./scripts/verify_production.sh
```

הסקריפט בודק:
- ✅ מבנה תקיות תקין
- ✅ כל הקבצים הנדרשים קיימים
- ✅ בסיס נתונים קיים
- ✅ אין קבצים לא נחוצים (tests, migrations)
- ✅ מספר קבצים תקין (~145 Python files)

## Git Branches

### main (development)
- כל הקוד כולל tests, migrations, וכו'
- עבודה יומיומית
- פורט: 8080
- DB: `simpleTrade_new.db`

### production (production)
- רק קבצים פעילים מ-`production/Backend/`
- קוד נקי ללא tests/migrations
- עדכון רק דרך sync script
- פורט: 5001
- DB: `TikTrack_DB.db`

## הפרדה בין הסביבות

| רכיב | פיתוח | פרודקשן |
|------|--------|----------|
| **תקייה** | `Backend/` | `production/Backend/` |
| **Git Branch** | `main` | `production` |
| **פורט** | 8080 | 5001 |
| **DB** | `simpleTrade_new.db` | `TikTrack_DB.db` |
| **לוגים** | `Backend/logs/` | `production/Backend/logs/` |
| **קבצים** | כל הקבצים | רק פעילים (~145) |
| **Tests** | ✅ יש | ❌ אין |
| **Migrations** | ✅ יש | ❌ אין |
| **Scripts** | ✅ כל הסקריפטים | ✅ רק 3 |

## יתרונות הארכיטקטורה

1. ✅ **יציבות מוחלטת** - פרודקשן לא מושפע משינויים בפיתוח
2. ✅ **קוד נקי** - רק מה שצריך, ללא "זבל"
3. ✅ **ניהול קל** - עדכון מבוקר דרך sync script
4. ✅ **גיבוי פשוט** - תקייה אחת לגיבוי
5. ✅ **העברה קלה** - אפשר להעביר `production/` למקום אחר
6. ✅ **ביצועים טובים** - פחות קבצים = טעינה מהירה יותר

## סיכונים ופתרונות

| סיכון | פתרון |
|--------|--------|
| שכחה לעדכן פרודקשן | Sync script + תיעוד ברור |
| קבצים חסרים | רשימה מפורטת + verify script |
| קונפליקטים ב-merge | עבודה זהירה + בדיקות |
| קוד לא מסונכרן | תהליך sync מוגדר |

## קבצים חשובים

- `scripts/sync_to_production.py` - העתקת קוד אוטומטית
- `scripts/fix_production_paths.py` - תיקון נתיבים קשיחים
- `scripts/verify_production.sh` - אימות סביבה
- `production/start_production.sh` - הפעלת שרת
- `production/Backend/scripts/create_production_db.py` - יצירת DB

## הערות חשובות

1. **תמיד לעדכן דרך sync script** - לא לעדכן ידנית
2. **לבדוק עם verify script** - לפני כל commit
3. **לעבוד על main** - רק sync לפרודקשן כשמוכן
4. **לבדוק לפני הפעלה** - verify + check-only
5. **לשמור על קוד נקי** - רק קבצים פעילים

---

**עודכן:** 2025-11-08  
**גרסה:** 1.0.0

