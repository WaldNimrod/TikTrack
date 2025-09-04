# מערכת ניהול WAL - TikTrack
## WAL Management System Documentation

### סקירה כללית

מערכת ניהול WAL (Write-Ahead Log) של TikTrack מבטיחה עקביות נתונים ומניעה של הופעה מחדש של רשומות שנמחקו. המערכת מיישמת **הגנה רב-שכבתית** עם 5 שכבות הגנה.

### הבעיה שנפתרה

**בעיה:** טיקרים שנמחקו מהמערכת הופיעו שוב אחרי ניקוי מטמון או למחרת.

**סיבה:** SQLite WAL mode לא ביצע checkpoint אוטומטי, מה שגרם לנתונים להישאר בקובץ WAL ולא להעבר לבסיס הנתונים הראשי.

### הפתרון: הגנה רב-שכבתית

#### שכבה 1: Checkpoint אוטומטי משופר
```python
# הגדרות WAL מותאמות
PRAGMA wal_autocheckpoint=100  # במקום 1000
PRAGMA wal_checkpoint(PASSIVE)  # checkpoint ראשוני
```

**יתרונות:**
- ✅ אוטומטי לחלוטין
- ✅ ביצועים מיטביים
- ✅ אמינות גבוהה

#### שכבה 2: Checkpoint ידני אחרי פעולות קריטיות
```python
# אחרי מחיקת טיקר
db.delete(ticker)
db.commit()
ensure_wal_consistency()  # כפיית checkpoint
```

**יתרונות:**
- ✅ הגנה מיידית
- ✅ אמינות מקסימלית
- ✅ מניעת בעיות

#### שכבה 3: WAL Manager מתקדם
```python
# ניהול מרכזי של WAL
from utils.wal_manager import get_wal_manager
wal_manager = get_wal_manager()
wal_info = wal_manager.get_wal_info()
```

**יתרונות:**
- ✅ ניהול מרכזי
- ✅ מעקב אחר מצב
- ✅ ניקוי אוטומטי

#### שכבה 4: שירות רקע אוטומטי
```python
# שירות רקע שרץ כל 5 דקות
from services.wal_background_service import start_wal_background_service
start_wal_background_service()
```

**יתרונות:**
- ✅ ניהול רציף
- ✅ מניעת הצטברות
- ✅ מעקב סטטיסטיקות

#### שכבה 5: API Endpoints לניהול WAL
```bash
# API endpoints לניהול ידני
GET /api/v1/wal/status
POST /api/v1/wal/checkpoint
POST /api/v1/wal/cleanup
GET /api/v1/wal/health
```

**יתרונות:**
- ✅ ניהול ידני
- ✅ מעקב מצב
- ✅ ניקוי ידני

### ישויות מוגנות

ההגנות פועלות על **כל הישויות** במערכת:

#### ישויות עם הגנה מלאה:
- ✅ **טיקרים** - הגנה מלאה עם checkpoint ידני
- ✅ **חשבונות** - הגנה אוטומטית
- ✅ **טריידים** - הגנה אוטומטית
- ✅ **תכנוני טריידים** - הגנה אוטומטית
- ✅ **התראות** - הגנה אוטומטית
- ✅ **הערות** - הגנה אוטומטית
- ✅ **ביצועים** - הגנה אוטומטית
- ✅ **תזרימי מזומן** - הגנה אוטומטית

#### ישויות עם הגנה מיוחדת:
- 🔒 **טיקרים** - הגנה מיוחדת עם checkpoint ידני אחרי מחיקה
- 🔒 **חשבונות** - הגנה מיוחדת (בפיתוח)
- 🔒 **טריידים** - הגנה מיוחדת (בפיתוח)

### הגדרות המערכת

#### הגדרות WAL אופטימליות:
```sql
PRAGMA journal_mode=WAL
PRAGMA synchronous=NORMAL
PRAGMA wal_autocheckpoint=100
PRAGMA cache_size=10000
PRAGMA temp_store=MEMORY
PRAGMA foreign_keys=ON
```

#### הגדרות שירות רקע:
- **תדירות checkpoint:** כל 5 דקות
- **גודל WAL מקסימלי:** 10MB
- **תדירות ניקוי:** כל שעה
- **מצב checkpoint:** PASSIVE (לא חוסם)

### API Endpoints

#### 1. מצב WAL
```bash
GET /api/v1/wal/status
```
**תגובה:**
```json
{
  "status": "success",
  "data": {
    "wal_exists": true,
    "wal_size": 1024,
    "shm_size": 32,
    "checkpoint_info": {
      "busy": 0,
      "log_size": 0,
      "checkpointed": 0
    }
  }
}
```

#### 2. כפיית Checkpoint
```bash
POST /api/v1/wal/checkpoint
Content-Type: application/json

{
  "mode": "TRUNCATE"
}
```

#### 3. ניקוי WAL
```bash
POST /api/v1/wal/cleanup
```

#### 4. דוח בריאות
```bash
GET /api/v1/wal/health
```

### מעקב ובקרה

#### לוגים חשובים:
```
INFO: WAL Background Service started
INFO: Background WAL checkpoint successful
WARNING: WAL file too large (15MB). Consider running checkpoint.
ERROR: WAL checkpoint failed: Database is busy
```

#### סטטיסטיקות:
- מספר checkpoints שבוצעו
- זמן checkpoint אחרון
- מספר שגיאות
- גודל קבצי WAL

### פתרון בעיות

#### בעיה: WAL file גדול
**פתרון:**
```bash
curl -X POST http://localhost:8080/api/v1/wal/checkpoint \
  -H "Content-Type: application/json" \
  -d '{"mode": "TRUNCATE"}'
```

#### בעיה: שגיאות checkpoint
**פתרון:**
1. בדוק אם יש חיבורים פעילים לבסיס הנתונים
2. המתן 30 שניות ונסה שוב
3. אם הבעיה נמשכת, הפעל מחדש את השרת

#### בעיה: ביצועים איטיים
**פתרון:**
1. הגדל את `wal_autocheckpoint` ל-200
2. הגדל את `max_wal_size` ל-20MB
3. בדוק את הגדרות `cache_size`

### בדיקות תקינות

#### בדיקה יומית:
```bash
# בדיקת מצב WAL
curl http://localhost:8080/api/v1/wal/status

# בדיקת בריאות
curl http://localhost:8080/api/v1/wal/health
```

#### בדיקה שבועית:
```bash
# ניקוי WAL
curl -X POST http://localhost:8080/api/v1/wal/cleanup
```

### הגדרות ייצור

#### הגדרות מומלצות לייצור:
```python
# הגדרות WAL לייצור
PRAGMA wal_autocheckpoint=50      # יותר תכוף
PRAGMA synchronous=FULL           # יותר בטוח
PRAGMA cache_size=20000           # יותר זיכרון
PRAGMA temp_store=MEMORY          # זיכרון זמני
```

#### הגדרות שירות רקע לייצור:
```python
checkpoint_interval = 180  # 3 דקות
max_wal_size = 5 * 1024 * 1024  # 5MB
```

### תחזוקה

#### תחזוקה יומית:
- בדיקת לוגים
- מעקב אחר גודל WAL
- בדיקת שגיאות

#### תחזוקה שבועית:
- ניקוי WAL ידני
- בדיקת ביצועים
- עדכון סטטיסטיקות

#### תחזוקה חודשית:
- אופטימיזציה של בסיס הנתונים
- בדיקת הגדרות
- עדכון תיעוד

### סיכום

מערכת ניהול WAL של TikTrack מספקת **הגנה רב-שכבתית** המבטיחה:
- ✅ עקביות נתונים מלאה
- ✅ מניעת הופעה מחדש של רשומות מחוקות
- ✅ ביצועים מיטביים
- ✅ אמינות גבוהה
- ✅ ניהול אוטומטי וידני

**המערכת מוכנה לשימוש ופועלת על כל הישויות במערכת.**

---

**תאריך עדכון:** ספטמבר 2025  
**גרסה:** 1.0  
**מחבר:** TikTrack Development Team
