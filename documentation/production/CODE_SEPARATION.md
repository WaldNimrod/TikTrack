# TikTrack Production Code Separation Guide

**תאריך:** 2025-11-08  
**גרסה:** 1.0.0  
**מטרה:** מדריך מפורט להפרדת קוד פרודקשן מסביבת הפיתוח

---

## 🚀 עדכון פרודקשן - תהליך מהיר

**לעדכון מלא ומפורט, ראה:** [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md)

### תהליך עדכון מהיר

```bash
# 1. עדכון ומיזוג
git checkout main && git pull origin main
git checkout production && git pull origin production
git merge main

# 2. סינכרון קוד
./scripts/sync_to_production.py

# 3. בדיקות
./scripts/verify_production_isolation.sh

# 4. Commit & Push
git add production/ scripts/ documentation/production/
git commit -m "feat: Update production from main"
git push origin production
```

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [מבנה תקיות](#מבנה-תקיות)
3. [קבצים בפרודקשן](#קבצים-בפרודקשן)
4. [תהליך עדכון פרודקשן](#תהליך-עדכון-פרודקשן)
5. [תיקון נתיבים](#תיקון-נתיבים)
6. [בסיס נתונים](#בסיס-נתונים)
7. [הפעלת שרת פרודקשן](#הפעלת-שרת-פרודקשן)
8. [אימות סביבה](#אימות-סביבה)
9. [Git Branches](#git-branches)
10. [הפרדה בין הסביבות](#הפרדה-בין-הסביבות)

---

## סקירה כללית

סביבת הפרודקשן מופרדת לחלוטין מסביבת הפיתוח:

- **תקייה נפרדת:** `production/Backend/` - רק קבצים פעילים
- **Git Branch נפרד:** `production` - קוד נקי ללא tests/migrations
- **בסיס נתונים נפרד:** PostgreSQL (`TikTrack-db-production`) - רק נתוני עזר והעדפות
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
│   │   └── (PostgreSQL)           # DB פיתוח (PostgreSQL)
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
│   │   │   └── (PostgreSQL)           # ✅ DB פרודקשן (PostgreSQL)
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

**📖 למדריך מפורט ומלא:** [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md)

### תהליך עדכון מלא (5 שלבים)

#### שלב 1: עדכון Main Branch

```bash
git checkout main
git pull origin main
```

#### שלב 2: מיזוג Main → Production

```bash
git checkout production
git pull origin production
git merge main
# פתור קונפליקטים אם יש
```

#### שלב 3: סינכרון קוד

```bash
./scripts/sync_to_production.py
```

#### שלב 4: בדיקות ואימות

```bash
./scripts/verify_production_isolation.sh
./scripts/verify_production.sh
```

#### שלב 5: Commit & Push

```bash
git add production/ scripts/ documentation/production/
git commit -m "feat: Update production from main - [תאריך]"
git push origin production
```

**⚠️ חשוב:** ראה [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md) לפרטים מלאים, פתרון בעיות, ו-checklist.

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
# ✅ נכון - שימוש ב-config.settings עם PostgreSQL
from config.settings import DATABASE_URL
from sqlalchemy import create_engine

engine = create_engine(DATABASE_URL)
```

```python
# ❌ שגוי - שימוש ב-SQLite או נתיב קשיח
import sqlite3
conn = sqlite3.connect("tiktrack.db")  # לא נתמך יותר!
```

הסקריפט `scripts/fix_production_paths.py` מתקן אוטומטית נתיבים קשיחים.

## בסיס נתונים

### יצירת בסיס נתונים פרודקשן

```bash
cd production/Backend
python3 scripts/create_production_db.py
```

הסקריפט:

1. קורא מ-PostgreSQL פיתוח (`TikTrack-db-development`)
2. יוצר PostgreSQL פרודקשן (`TikTrack-db-production`)
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
- DB: PostgreSQL (`TikTrack-db-production`)

### production (production)

- רק קבצים פעילים מ-`production/Backend/`
- קוד נקי ללא tests/migrations
- עדכון רק דרך sync script
- פורט: 5001
- DB: PostgreSQL (`TikTrack-db-production`)

## הפרדה בין הסביבות

| רכיב | פיתוח | פרודקשן |
|------|--------|----------|
| **תקייה** | `Backend/` | `production/Backend/` |
| **Git Branch** | `main` | `production` |
| **פורט** | 8080 | 5001 |
| **DB** | PostgreSQL (`TikTrack-db-development`) | PostgreSQL (`TikTrack-db-production`) |
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

