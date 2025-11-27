# חקירה מעמיקה - בעיית Session/Transaction Management

**תאריך:** 27 בנובמבר 2025  
**בעיה:** Query דרך השרת מחזיר רק 1 רשומה במקום 120  
**סטטוס:** בחקירה פעילה

---

## סיכום מהיר

### התופעה
- ✅ יש **120 תוכניות** ב-DB (`Backend/db/tiktrack.db`)
- ✅ דרך **Flask context ישירות** יש 120
- ❌ דרך **השרת בפועל** רק **1** מוחזר
- ⚠️ אפילו לאחר תיקון הקוד, השרת מחזיר 1

### ההשערה
בעיית **session/transaction reuse** או **connection pooling** שגורמת ל-stale data או connection ל-DB אחר

---

## ממצאים קריטיים

### ממצא #1: קוד ישן רץ בשרת - **נפתר**

**תאריך:** 27 בנובמבר 2025 17:35

**הבעיה:**
- השרת רץ על קוד ישן (התחיל ב-17:22, הקוד עודכן ב-17:34)
- הלוגים הראו הודעות מהקוד הישן

**הפתרון:**
- ✅ הרגנו את כל ה-processes הישנים
- ✅ הפעלנו שרת חדש עם הקוד המעודכן

**תוצאה:**
- ✅ השרת כעת רץ על הקוד החדש (מראה "Direct SQL COUNT")
- ❌ אבל עדיין מחזיר רק 1 רשומה!

### ממצא #2: השאילתה SQL מחזירה 1 דרך השרת

**תאריך:** 27 בנובמבר 2025 17:37

**הבעיה:**
- הלוגים מראים: `"Direct SQL COUNT: 1 plans in database"`
- זה אומר שהשאילתה SQL **עצמה** מחזירה רק 1
- אבל בדיקה ישירה ב-DB מראה 120

**השערות:**
1. השרת מחובר ל-DB אחר
2. יש בעיית connection pooling עם stale connection
3. יש transaction isolation שגורם לראות נתונים ישנים

---

## שלב 1: בדיקות שנערכו

### 1.1 בדיקת ישירה ב-DB
- ✅ יש 120 תוכניות ב-`Backend/db/tiktrack.db`
- ✅ בדיקה ישירה דרך SQLite מראה 120

### 1.2 בדיקת דרך Flask Context
- ✅ דרך Flask context ישירות יש 120
- ✅ דרך Service בסימולציה יש 120

### 1.3 בדיקת דרך השרת
- ❌ דרך השרת רק 1
- ❌ השאילתה SQL דרך השרת מחזירה 1

---

## שלב 2: בדיקות נדרשות

### 2.1 בדיקת DATABASE_URL
- [ ] מה ה-DATABASE_URL של השרת?
- [ ] האם השרת מחובר ל-DB הנכון?
- [ ] האם יש כמה DB files?

### 2.2 בדיקת Connection Pooling
- [ ] מה ה-path של ה-DB דרך connection pool?
- [ ] האם יש stale connections?
- [ ] האם pool_pre_ping עובד?

### 2.3 בדיקת Transaction Isolation
- [ ] מה ה-isolation level?
- [ ] האם יש uncommitted transactions?
- [ ] האם יש transaction aborted state?

---

## שלב 3: ניטור בזמן אמת

### 3.1 Session Tracking
- [ ] Tracking של session identity
- [ ] Tracking של connection identity
- [ ] Tracking של query results

### 3.2 Connection Tracking
- [ ] Tracking של database path
- [ ] Tracking של connection reuse
- [ ] Tracking של pool state

---

## שלב 4: מסקנות זמניות

1. ✅ ב-DB יש 120 תוכניות (אומת)
2. ✅ דרך Flask ישירות יש 120
3. ❌ דרך השרת רק 1
4. ❌ השאילתה SQL דרך השרת מחזירה 1
5. ⚠️ **השערה:** השרת מחובר ל-DB אחר או יש בעיית connection

---

## צעדים הבאים

### מיידי
1. ✅ בדיקת DATABASE_URL של השרת
2. ✅ בדיקת כל ה-DB files
3. 🔄 בדיקת database path דרך connection pool

### קצר טווח
1. הוספת logging מפורט ל-connection creation
2. הוספת tracking ל-database path בכל query
3. בדיקת connection pool state

### ארוך טווח
1. שיפור session management
2. הוספת connection validation
3. הוספת monitoring ל-DB connections

---

---

## ממצא קריטי - דרך Flask ישירות יש 120!

**תאריך:** 27 בנובמבר 2025 17:42

**הממצא:**
- ✅ דרך Flask context ישירות יש 120 תוכניות
- ✅ השרת מחובר ל-DB הנכון (`Backend/db/tiktrack.db`)
- ❌ דרך השרת בפועל רק 1 תוכנית

**מסקנה:**
הבעיה היא **רק כשהשרת רץ בפועל**, לא בקוד עצמו. זה מצביע על:
- בעיית session reuse בשרת
- בעיית transaction isolation
- בעיית query caching או stale data

---

## סיכום הממצאים

### מה שכן עובד:
1. ✅ יש 120 תוכניות ב-DB
2. ✅ דרך Flask context ישירות יש 120
3. ✅ השרת מחובר ל-DB הנכון
4. ✅ הקוד מעודכן ורץ

### מה שלא עובד:
1. ❌ דרך השרת רק 1 תוכנית
2. ❌ השאילתה SQL דרך השרת מחזירה 1

### השערות לבדיקה:
1. **Session reuse** - session שומר stale data
2. **Transaction isolation** - transaction רואה נתונים ישנים
3. **Query caching** - query results cached
4. **Connection pooling** - stale connection

---

---

## ממצא קריטי - זוהה שורש הבעיה!

**תאריך:** 27 בנובמבר 2025 17:45

**הממצא:**
- ✅ השרת התחבר ל-**SQLite** (`Backend/db/tiktrack.db`) במקום PostgreSQL!
- ✅ ב-SQLite יש רק **1 תוכנית**
- ✅ ב-PostgreSQL יש **120 תוכניות**

**הסיבה:**
- `Backend/config/settings.py` היה מגדיר fallback ל-SQLite אם אין `POSTGRES_HOST`
- השרת רץ ללא `POSTGRES_HOST` מוגדר
- לכן התחבר ל-SQLite במקום PostgreSQL

**התיקון:**
- ✅ הסרת כל תמיכה ב-SQLite מ-`settings.py`
- ✅ PostgreSQL הוא כעת **חובה** - אין fallback
- ✅ עדכון `database.py` להסרת תמיכה ב-SQLite

**תוצאה:**
- ✅ השרת כעת **חייב** להתחבר ל-PostgreSQL
- ✅ לא יכול יותר להתחבר ל-SQLite

---

**עודכן:** 27 בנובמבר 2025 17:45 - **זוהה שורש הבעיה - SQLite fallback!**
