# כללי מניעת תהליכים מקבילים - TikTrack

## Parallel Process Prevention Standards

### תאריך יצירה

ינואר 2025

## כללים עיקריים

### 1. Process Monitoring

**חוק:** Process monitoring חובה לפני הרצת תהליכים חדשים.

**יישום:**

- השתמש ב-`server_lock_manager.py` לבדיקת תהליכים
- בדוק תהליכים קיימים לפני הרצה
- תעד תהליכים רץ

**בדיקה:**

```bash
# בדוק תהליכים על פורט 8080
python3 Backend/utils/server_lock_manager.py

# או
lsof -i :8080
```

### 2. Lock Mechanisms

**חוק:** Lock mechanisms חובה לתהליכים קריטיים.

**יישום:**

- השתמש ב-file locks
- השתמש ב-database locks
- השתמש ב-process locks
- תעד locks

**דוגמה:**

```python
# Python - File lock
import fcntl
import os

lock_file = open('/tmp/tiktrack.lock', 'w')
try:
    fcntl.flock(lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)
    # Critical code
except IOError:
    print("Another process is running")
finally:
    fcntl.flock(lock_file, fcntl.LOCK_UN)
    lock_file.close()
```

### 3. Resource Cleanup

**חוק:** Resource cleanup חובה בסיום תהליכים.

**יישום:**

- שחרר locks
- סגור connections
- נקה resources
- תעד cleanup

**דוגמה:**

```python
try:
    # Process code
    pass
finally:
    # Cleanup
    if lock_file:
        fcntl.flock(lock_file, fcntl.LOCK_UN)
        lock_file.close()
    if db_connection:
        db_connection.close()
```

### 4. Conflict Detection

**חוק:** Conflict detection חובה לפני הרצה.

**יישום:**

- בדוק תהליכים קיימים
- בדוק locks קיימים
- בדוק resources בשימוש
- תעד conflicts

**בדיקה:**

```bash
# בדוק תהליכים
python3 Backend/utils/server_lock_manager.py

# בדוק locks
ls -la /tmp/*.lock

# בדוק resources
lsof -i :8080
```

## כללי ניהול תהליכים

### 1. Server Processes

**חוק:** תמיד לבדוק תהליכי שרת לפני הרצה.

**יישום:**

- השתמש ב-`start_server.sh` להרצת שרת
- בדוק תהליכים קיימים
- עצור תהליכים קיימים אם צריך
- תעד תהליכים

**בדיקה:**

```bash
# בדוק תהליכים
./start_server.sh --check-only

# או
python3 Backend/utils/server_lock_manager.py
```

### 2. Background Processes

**חוק:** תמיד לבדוק תהליכי רקע לפני הרצה.

**יישום:**

- בדוק תהליכים קיימים
- השתמש ב-locks
- תעד תהליכים
- נקה תהליכים ישנים

**בדיקה:**

```bash
# בדוק תהליכי רקע
ps aux | grep tiktrack

# בדוק locks
ls -la /tmp/*.lock
```

### 3. Database Processes

**חוק:** תמיד לבדוק תהליכי database לפני הרצה.

**יישום:**

- בדוק connections קיימות
- השתמש ב-transaction locks
- תעד transactions
- נקה connections ישנות

**בדיקה:**

```bash
# בדוק connections
psql -U TikTrakDBAdmin -d TikTrack-db-development -c "SELECT * FROM pg_stat_activity;"
```

## כללי Lock Management

### 1. File Locks

**חוק:** השתמש ב-file locks לתהליכים קריטיים.

**יישום:**

```python
import fcntl
import os

lock_file_path = '/tmp/tiktrack_process.lock'
lock_file = open(lock_file_path, 'w')

try:
    fcntl.flock(lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)
    # Critical code
except IOError:
    raise Exception("Another process is running")
finally:
    fcntl.flock(lock_file, fcntl.LOCK_UN)
    lock_file.close()
    os.remove(lock_file_path)
```

### 2. Database Locks

**חוק:** השתמש ב-database locks לתהליכים קריטיים.

**יישום:**

```python
from sqlalchemy import text

# Advisory lock
with db.begin():
    result = db.execute(text("SELECT pg_advisory_lock(12345)"))
    try:
        # Critical code
        pass
    finally:
        db.execute(text("SELECT pg_advisory_unlock(12345)"))
```

### 3. Process Locks

**חוק:** השתמש ב-process locks לתהליכים קריטיים.

**יישום:**

```python
import psutil
import os

def check_process(port):
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            for conn in proc.connections():
                if conn.laddr.port == port:
                    return proc
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return None
```

## כללי Resource Management

### 1. Connection Management

**חוק:** תמיד לנהל connections נכון.

**יישום:**

- פתח connections רק כאשר צריך
- סגור connections מיד אחרי שימוש
- השתמש ב-connection pooling
- תעד connections

**דוגמה:**

```python
# ❌ לא נכון
db = get_db()
# ... code ...
# Connection לא נסגר

# ✅ נכון
with get_db() as db:
    # ... code ...
    # Connection נסגר אוטומטית
```

### 2. Memory Management

**חוק:** תמיד לנהל memory נכון.

**יישום:**

- שחרר memory מיד אחרי שימוש
- השתמש ב-garbage collection
- תעד memory usage
- בדוק memory leaks

**בדיקה:**

```bash
# בדוק memory usage
ps aux | grep python

# או
python3 -m memory_profiler script.py
```

### 3. File Management

**חוק:** תמיד לנהל files נכון.

**יישום:**

- פתח files רק כאשר צריך
- סגור files מיד אחרי שימוש
- השתמש ב-context managers
- תעד files

**דוגמה:**

```python
# ❌ לא נכון
file = open('data.txt', 'r')
# ... code ...
# File לא נסגר

# ✅ נכון
with open('data.txt', 'r') as file:
    # ... code ...
    # File נסגר אוטומטית
```

## כללי עבודה יומיומיים

### 1. לפני התחלת עבודה

```bash
# בדוק תהליכים קיימים
python3 Backend/utils/server_lock_manager.py

# בדוק locks
ls -la /tmp/*.lock

# בדוק resources
lsof -i :8080
```

### 2. במהלך עבודה

- בדוק תהליכים קיימים
- השתמש ב-locks
- תעד תהליכים
- נקה resources

### 3. בסיום עבודה

- שחרר locks
- סגור connections
- נקה resources
- תעד cleanup

## Troubleshooting

### בעיה: תהליך לא יכול להתחיל - lock קיים

**פתרון:**

1. בדוק אם תהליך אחר רץ
2. בדוק locks קיימים
3. נקה locks ישנים אם צריך
4. תעד את הבעיה

### בעיה: תהליכים מקבילים יוצרים קונפליקטים

**פתרון:**

1. השתמש ב-locks
2. בדוק תהליכים קיימים
3. עצור תהליכים קיימים אם צריך
4. תעד את הבעיה

## קישורים רלוונטיים

- [Duplicate Prevention Standards](DUPLICATE_PREVENTION_STANDARDS.md)
- [Server Management Guide](../../server/SERVER_MANAGEMENT_GUIDE.md)
- [QA and Debugging Guide](../TOOLS/QA_AND_DEBUGGING_GUIDE.md)

---

**תאריך עדכון:** ינואר 2025

