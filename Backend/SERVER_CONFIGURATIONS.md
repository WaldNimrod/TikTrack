# TikTrack Server Configurations
# קונפיגורציות השרת של TikTrack

## 🎯 **סיכום מהותקן:**

המערכת עברה שיפוץ מקיף לפתרון בעיות יציבות:
- ✅ **נפתרו בעיות segmentation fault**
- ✅ **נמחקו קבצים לא עובדים**
- ✅ **נוצרו קונפיגורציות יציבות**
- ✅ **עודכנו סקריפטי הפעלה**
- ✅ **נוספו הערות מפורטות לכל הקבצים**

## 📋 **מפת דרכים מהירה:**

| צורך | קובץ מומלץ | סקריפט מומלץ |
|------|-------------|---------------|
| שימוש יומיומי | `run_stable.py` | `./start_server.sh` |
| פיתוח | `dev_server.py` | `./start_dev.sh` |
| פרודקשן | `run_waitress_fixed.py` | ישירות |

## קבצים זמינים:

### 🛡️ **run_stable.py** - השרת היציב (מומלץ לשימוש יומיומי)
- Flask development server עם הגדרות יציבות
- `debug=False`, `use_reloader=False` - פחות זיכרון
- `threaded=True`, `processes=1` - יציבות משופרת
- מתאים לפרודקשן או שימוש יומיומי

**הפעלה:**
```bash
cd Backend
python3 run_stable.py
```

### ⚡ **run_waitress_fixed.py** - Waitress יציב (מומלץ לפרודקשן)
- Waitress WSGI server עם הגדרות מתוקנות
- `threads=4`, `connection_limit=100` - פחות עומס
- `cleanup_interval=30`, `channel_timeout=120` - יציבות משופרת
- יציב יותר מהגרסה המקורית שגרמה ל-segmentation fault

**הפעלה:**
```bash
cd Backend
python3 run_waitress_fixed.py
```

### 🔄 **dev_server.py** - שרת פיתוח מתקדם (מומלץ לפיתוח)
- משתמש ב-`run_waitress_fixed.py` בתור subprocess
- עם auto-reload כשמשנים קבצים (watchdog)
- עם monitoring ו-health checks
- עם לוגים מפורטים ב-`server_detailed.log`
- עם restart אוטומטי במקרה של קריסה

**הפעלה:**
```bash
cd Backend
python3 dev_server.py
```

## סקריפטים להפעלה:

### 🚀 **start_server.sh** - הפעלה מהירה (מומלץ לשימוש יומיומי)
```bash
./start_server.sh
```
- מפעיל את `run_stable.py`
- מתאים לשימוש יומיומי
- יציב ופשוט

### 🔧 **start_dev.sh** - הפעלת פיתוח (מומלץ לפיתוח)
```bash
./start_dev.sh
```
- מפעיל את `dev_server.py`
- עם auto-reload ו-monitoring
- מתאים לפיתוח
- בודק dependencies ומתקין אם צריך

## ❌ **קבצים שנמחקו (לא עבדו):**

- **`run_waitress.py`** - גרם ל-segmentation fault
  - יותר מדי threads (8) ו-connections (500)
  - הגדרות לא יציבות
- **`run_waitress_simple.py`** - לא עבד
- **`run_flask_dev.py`** - לא עבד

## 🔧 **בעיות שנפתרו:**

### 1. **Segmentation Fault**
- **הבעיה:** השרת נפל עם segmentation fault
- **הפתרון:** הורדת מספר threads ו-connections
- **תוצאה:** יציבות משופרת

### 2. **זיכרון גבוה**
- **הבעיה:** השרת צרך יותר מדי זיכרון
- **הפתרון:** `debug=False`, `use_reloader=False`
- **תוצאה:** צריכת זיכרון נמוכה יותר

### 3. **קונפיגורציה מורכבת**
- **הבעיה:** יותר מדי קבצים מבלבלים
- **הפתרון:** מחיקת קבצים לא עובדים
- **תוצאה:** מערכת נקייה וברורה

## 📊 **השוואת ביצועים:**

| קובץ | יציבות | זיכרון | Auto-reload | מתאים ל |
|------|---------|---------|-------------|----------|
| `run_stable.py` | ⭐⭐⭐⭐⭐ | נמוך | ❌ | שימוש יומיומי |
| `run_waitress_fixed.py` | ⭐⭐⭐⭐ | בינוני | ❌ | פרודקשן |
| `dev_server.py` | ⭐⭐⭐⭐ | בינוני | ✅ | פיתוח |

## 🎯 **המלצות:**

### **לשימוש יומיומי:**
```bash
./start_server.sh
# או
cd Backend && python3 run_stable.py
```

### **לפיתוח:**
```bash
./start_dev.sh
# או
cd Backend && python3 dev_server.py
```

### **לפרודקשן:**
```bash
cd Backend && python3 run_waitress_fixed.py
```

## 🔍 **פתרון בעיות:**

### אם השרת לא עולה:
1. **בדוק תהליכים קיימים:**
   ```bash
   lsof -i :8080
   ```

2. **עצור תהליכים קיימים:**
   ```bash
   lsof -ti :8080 | xargs kill -9
   ```

3. **בדוק הסביבה הוירטואלית:**
   ```bash
   source ../.venv/bin/activate
   ```

4. **בדוק dependencies:**
   ```bash
   python3 -c "import waitress, watchdog"
   ```

### אם יש בעיות ביצועים:
- השתמש ב-`run_stable.py` - פחות זיכרון
- בדוק את הלוגים ב-`server_detailed.log`
- הפעל מחדש את השרת

## 📝 **לוגים:**

- **לוגים מפורטים:** `server_detailed.log`
- **לוגי Flask:** מופיעים בטרמינל
- **לוגי Waitress:** מופיעים בטרמינל ובלוג

## 🔄 **Auto-reload:**

רק `dev_server.py` תומך ב-auto-reload:
- צופה בשינויים ב-`models/`, `routes/`, `config/`, `app.py`
- מפעיל מחדש אוטומטית כשמשנים קבצים
- מונע restart מרובים (מינימום 2 שניות בין restarts)

## 📚 **הערות בקוד:**

כל הקבצים כוללים הערות מפורטות:
- **מטרה ותכונות** של כל קובץ
- **הבדלים** מהגרסאות הקודמות
- **הגדרות ספציפיות** והסבר עליהן
- **מתי להשתמש** בכל קובץ
- **פתרון בעיות** נפוצות

## 🔄 **היסטוריית שינויים:**

### גרסה 2.0 (נוכחית):
- ✅ תוקנו בעיות segmentation fault
- ✅ נמחקו קבצים לא עובדים
- ✅ נוספו הערות מפורטות
- ✅ עודכנו סקריפטי הפעלה

### גרסה 1.0 (קודמת):
- ❌ בעיות יציבות
- ❌ קבצים מבלבלים
- ❌ חוסר תיעוד
