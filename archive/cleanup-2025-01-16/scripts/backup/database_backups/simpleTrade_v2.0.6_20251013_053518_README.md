# TikTrack Database Backup - Version 2.0.6

**תאריך גיבוי:** 13 אוקטובר 2025, 05:35:18  
**גרסת מערכת:** 2.0.6  
**Commit Hash:** 94e2a0a  
**Build Version:** 8411a60_20251013_052854

---

## 📦 קבצי הגיבוי

### 1. simpleTrade_v2.0.6_20251013_053518.db
**גודל:** 31MB  
**סוג:** העתק מלא של בסיס הנתונים  
**תיאור:** קובץ SQLite מלא - מבנה + נתונים  
**שימוש:** ניתן להעתיק ישירות ל-Backend/db/ לשחזור מלא

```bash
# שחזור מלא:
cp simpleTrade_v2.0.6_20251013_053518.db Backend/db/simpleTrade_new.db
```

---

### 2. simpleTrade_v2.0.6_20251013_053518_dump.sql
**גודל:** 32MB  
**סוג:** SQL dump מלא  
**תיאור:** קובץ SQL עם כל המבנה והנתונים (CREATE + INSERT)  
**שימוש:** ייבוא ל-SQLite חדש

```bash
# שחזור מ-dump:
sqlite3 new_database.db < simpleTrade_v2.0.6_20251013_053518_dump.sql
```

---

### 3. simpleTrade_v2.0.6_20251013_053518_schema.sql
**גודל:** 18KB  
**סוג:** מבנה בלבד (schema)  
**תיאור:** הגדרות טבלאות, אינדקסים, constraints בלבד  
**שימוש:** יצירת בסיס נתונים ריק עם אותו מבנה

```bash
# יצירת מבנה בלבד:
sqlite3 empty_database.db < simpleTrade_v2.0.6_20251013_053518_schema.sql
```

---

## 📊 סטטיסטיקות בסיס נתונים

| מדד | ערך |
|-----|-----|
| **מספר טבלאות** | 26 |
| **גודל DB** | 31 MB |
| **גרסה** | 2.0.6 |
| **Constraints** | 89 custom constraints |

---

## 🗄️ טבלאות במערכת

בסיס הנתונים כולל 26 טבלאות מרכזיות:
- Trading entities (trades, executions, trade_plans)
- Financial data (tickers, market_data, dividends)
- Alerts & notifications
- Accounts & positions
- Configuration & preferences
- Audit & history tables

---

## 🔒 Constraints & Integrity

המערכת כוללת 89 constraints מותאמים אישית:
- Foreign key constraints
- Check constraints
- Unique constraints
- NOT NULL constraints

**קובץ תיעוד מלא:** `documentation/database/CONSTRAINTS_IMPLEMENTATION.md`

---

## ✅ אימות הגיבוי

### בדיקות שבוצעו:
- ✅ קובץ DB הועתק בהצלחה (31MB)
- ✅ SQL dump נוצר (32MB)
- ✅ Schema נשלף (18KB)
- ✅ כל 26 הטבלאות נכללו
- ✅ מבנה תקין

---

## 🎯 מטרת הגיבוי

גיבוי זה נוצר בנקודת checkpoint של גרסה 2.0.6:
- ✅ לאחר יישום renderBoolean() בעמוד התראות
- ✅ לאחר commit וגרסה מלאה ל-GitHub
- ✅ נקודת שחזור יציבה לפני שינויים עתידיים

---

## 📅 תאריכי גיבוי

| תאריך | גרסה | הערות |
|-------|------|-------|
| 13/10/2025 05:35 | 2.0.6 | renderBoolean implementation |

---

## 🔄 הוראות שחזור

### שחזור מלא (מומלץ):
```bash
# 1. עצור את השרת
# 2. גיבוי של הקובץ הנוכחי (אופציונלי)
mv Backend/db/simpleTrade_new.db Backend/db/simpleTrade_new.db.backup

# 3. העתק את הגיבוי
cp backup/database_backups/simpleTrade_v2.0.6_20251013_053518.db Backend/db/simpleTrade_new.db

# 4. הפעל את השרת מחדש
```

### שחזור מ-SQL dump:
```bash
# 1. צור DB חדש
rm -f Backend/db/simpleTrade_new.db

# 2. ייבא מה-dump
sqlite3 Backend/db/simpleTrade_new.db < backup/database_backups/simpleTrade_v2.0.6_20251013_053518_dump.sql
```

---

## 📝 הערות חשובות

1. **זמן גיבוי:** הגיבוי נוצר בזמן שהמערכת הייתה כבויה/לא פעילה
2. **שלמות נתונים:** כל הנתונים עד תאריך 13/10/2025 05:35
3. **תאימות:** תואם לגרסה 2.0.6 ומעלה
4. **גודל:** 31MB - כולל היסטוריה מלאה

---

**Status:** ✅ Backup Complete & Verified  
**Location:** `/backup/database_backups/`  
**Retention:** Keep until next major version

