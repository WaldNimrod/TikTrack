# סיכום מחיקת SQLite מהמערכת

**תאריך:** 27 בנובמבר 2025  
**מטרה:** מחיקת כל שאריות SQLite מהמערכת - PostgreSQL בלבד

---

## ממצא קריטי - זוהה שורש הבעיה!

### הבעיה
- ✅ השרת התחבר ל-**SQLite** (`Backend/db/tiktrack.db`) במקום PostgreSQL
- ✅ ב-SQLite יש רק **1 תוכנית** (מתוך ה-120 שנוצרו)
- ✅ ב-PostgreSQL יש **120 תוכניות**

### הסיבה
- `Backend/config/settings.py` היה מגדיר fallback ל-SQLite אם אין `POSTGRES_HOST`
- השרת רץ ללא `POSTGRES_HOST` מוגדר (למרות ש-`start_server.sh` מגדיר אותו)
- לכן התחבר ל-SQLite במקום PostgreSQL

---

## תיקונים שבוצעו

### 1. עדכון `Backend/config/settings.py`
- ✅ הסרת fallback ל-SQLite
- ✅ PostgreSQL הוא כעת **חובה** - אין fallback
- ✅ הוספת validation ש-PostgreSQL הוא חובה

### 2. עדכון `Backend/config/database.py`
- ✅ הסרת כל תמיכה ב-SQLite
- ✅ הסרת `USING_SQLITE` checks
- ✅ הסרת `connect_args` ל-SQLite

### 3. שמירה על Backward Compatibility
- ✅ הוספת `USING_SQLITE = False` (legacy constant)
- ✅ הוספת `DB_PATH` (deprecated - רק ל-backward compatibility)

---

## קבצים שנדרש עדכון

### קבצי קוד (29 קבצים עם USING_SQLITE):
- `Backend/scripts/cleanup_user_data.py`
- `Backend/scripts/generate_demo_data.py`
- `Backend/migrations/add_open_price_fields_to_market_data_quote.py`
- `Backend/services/external_data/yahoo_finance_adapter.py`
- `Backend/migrations/create_ticker_provider_symbols_table.py`
- `Backend/services/health_service.py`
- ועוד 23 קבצים...

### קבצי תיעוד (33 קבצים):
- כל הקבצים ב-`documentation/` שמתייחסים ל-SQLite

---

## צעדים הבאים

### מיידי:
1. ✅ בדיקת שהשרת מתחבר ל-PostgreSQL
2. 🔄 עדכון קבצי קוד שמשתמשים ב-`USING_SQLITE`
3. 🔄 מחיקת התייחסויות ל-SQLite במסמכים

### קצר טווח:
1. מחיקת קבצי `.db` מ-`Backend/db/`
2. עדכון כל הסקריפטים שמשתמשים ב-SQLite
3. עדכון כל המסמכים

---

**עודכן:** 27 בנובמבר 2025 17:45

