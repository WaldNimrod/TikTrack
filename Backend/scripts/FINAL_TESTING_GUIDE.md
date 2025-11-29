# מדריך בדיקות סופיות - מערכת Multi-User
## TikTrack - November 29, 2025

מדריך מקיף לבדיקות ידניות ואוטומטיות של מערכת Multi-User.

---

## 📋 תוכן עניינים

1. [הכנות לבדיקות](#הכנות-לבדיקות)
2. [בדיקות אוטומטיות](#בדיקות-אוטומטיות)
3. [בדיקות ידניות בדפדפן](#בדיקות-ידניות-בדפדפן)
4. [בדיקות API ישירות](#בדיקות-api-ישירות)
5. [רשימת בדיקות מקיפה](#רשימת-בדיקות-מקיפה)

---

## 🔧 הכנות לבדיקות

### 1. הפעלת השרת

```bash
# ודא שהשרת רץ
./start_server.sh

# או בדוק ידנית
curl http://localhost:8080/api/health
```

### 2. בדיקת בסיס הנתונים

```bash
# ודא ש-PostgreSQL רץ
docker ps | grep postgres

# ודא שיש משתמש ברירת מחדל
export POSTGRES_HOST=localhost
export POSTGRES_DB=TikTrack-db-development
export POSTGRES_USER=TikTrakDBAdmin
export POSTGRES_PASSWORD="BigMeZoo1974!?"
export POSTGRES_PORT=5432

python3 -c "
from sqlalchemy import create_engine, text
import os
engine = create_engine(f'postgresql+psycopg2://{os.getenv(\"POSTGRES_USER\")}:{os.getenv(\"POSTGRES_PASSWORD\")}@{os.getenv(\"POSTGRES_HOST\")}:{os.getenv(\"POSTGRES_PORT\")}/{os.getenv(\"POSTGRES_DB\")}')
with engine.connect() as conn:
    result = conn.execute(text('SELECT id, username, is_default FROM users WHERE is_default = true'))
    user = result.fetchone()
    if user:
        print(f'✅ Default user found: ID={user[0]}, Username={user[1]}')
    else:
        print('❌ No default user found')
"
```

---

## 🤖 בדיקות אוטומטיות

### הרצת בדיקות מקיפות

```bash
# הרצת כל הבדיקות
./Backend/scripts/run_final_tests.sh

# או ישירות
python3 Backend/scripts/comprehensive_multi_user_tests.py
```

### בדיקות ספציפיות

```bash
# בדיקת התחברות בלבד
python3 -c "
import requests
session = requests.Session()
response = session.post('http://localhost:8080/api/auth/login', 
    json={'username': 'nimrod', 'password': 'nimrod123'})
print('Status:', response.status_code)
print('Response:', response.json())
"
```

---

## 🌐 בדיקות ידניות בדפדפן

### 1. בדיקת עמוד התחברות

**URL:** `http://localhost:8080/login.html`

**צעדים:**
1. פתח את העמוד בדפדפן
2. ודא שהטופס מופיע
3. נסה להתחבר עם:
   - Username: `nimrod`
   - Password: `nimrod123`
4. ודא שההתחברות מצליחה ומעבירה לדף הבית

**תוצאה צפויה:**
- ✅ טופס התחברות מופיע
- ✅ התחברות מצליחה
- ✅ מעבר אוטומטי לדף הבית
- ✅ שם המשתמש מופיע ב-header

### 2. בדיקת עמוד הרשמה

**URL:** `http://localhost:8080/register.html`

**צעדים:**
1. פתח את העמוד בדפדפן
2. מלא את הטופס:
   - Username: `test_user_new`
   - Email: `test@example.com`
   - Password: `test123`
   - Confirm Password: `test123`
3. לחץ על "הירשם"
4. ודא שההרשמה מצליחה

**תוצאה צפויה:**
- ✅ טופס הרשמה מופיע
- ✅ הרשמה מצליחה
- ✅ מעבר אוטומטי לעמוד התחברות

### 3. בדיקת Header - תצוגת משתמש

**URL:** כל עמוד אחרי התחברות

**צעדים:**
1. התחבר למערכת
2. בדוק את ה-header
3. ודא שמופיע:
   - שם המשתמש
   - כפתור "התנתק"

**תוצאה צפויה:**
- ✅ שם המשתמש מופיע ב-header
- ✅ כפתור התנתקות מופיע
- ✅ לחיצה על התנתקות מנתקת את המשתמש

### 4. בדיקת סינון נתונים לפי משתמש

**URL:** `http://localhost:8080/trades`

**צעדים:**
1. התחבר כמשתמש 1
2. רשום כמה טריידים יש
3. התנתק והתחבר כמשתמש 2
4. ודא שהטריידים שונים (או ריקים אם למשתמש 2 אין טריידים)

**תוצאה צפויה:**
- ✅ כל משתמש רואה רק את הטריידים שלו
- ✅ אין דליפת נתונים בין משתמשים

### 5. בדיקת טיקרים משותפים

**URL:** `http://localhost:8080/tickers`

**צעדים:**
1. התחבר כמשתמש 1
2. פתח את עמוד הטיקרים
3. ודא שמופיעים כל הטיקרים (89 טיקרים)
4. בדוק את רשימת הטיקרים של המשתמש (צריכה להכיל 89)
5. נסה להוסיף טיקר חדש
6. התנתק והתחבר כמשתמש 2
7. ודא שגם משתמש 2 רואה את אותו טיקר (טיקרים משותפים)

**תוצאה צפויה:**
- ✅ כל המשתמשים רואים את אותם טיקרים (shared)
- ✅ כל משתמש יכול להוסיף טיקרים לרשימה שלו
- ✅ טיקרים נשארים משותפים (ללא כפילויות)

### 6. בדיקת Preferences

**URL:** `http://localhost:8080/preferences`

**צעדים:**
1. התחבר כמשתמש 1
2. פתח את עמוד ההעדפות
3. שנה העדפה כלשהי
4. התנתק והתחבר כמשתמש 2
5. ודא שההעדפות שונות (כל משתמש עם העדפות משלו)

**תוצאה צפויה:**
- ✅ כל משתמש שומר העדפות נפרדות
- ✅ אין דליפת העדפות בין משתמשים

### 7. בדיקת Cache Isolation

**צעדים:**
1. התחבר כמשתמש 1
2. טען עמוד כלשהו (למשל /trades)
3. פתח את Developer Tools → Application → Local Storage
4. בדוק שמפתחות ה-cache כוללים `u1:` (user_id)
5. התנתק והתחבר כמשתמש 2
6. בדוק שמפתחות ה-cache כוללים `u2:`

**תוצאה צפויה:**
- ✅ כל מפתח cache כולל user_id
- ✅ אין דליפת cache בין משתמשים

---

## 🔌 בדיקות API ישירות

### 1. בדיקת התחברות

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"nimrod","password":"nimrod123"}' \
  -c /tmp/cookies.txt \
  -v
```

**תוצאה צפויה:**
- Status: 200
- Response: `{"status": "success", "data": {"user": {...}}}`
- Cookie: Set-Cookie header עם session

### 2. בדיקת קבלת נתונים

```bash
# לאחר התחברות (עם cookies)
curl -X GET http://localhost:8080/api/trades/ \
  -b /tmp/cookies.txt \
  | python3 -m json.tool
```

**תוצאה צפויה:**
- Status: 200
- Data: רשימת טריידים של המשתמש המחובר בלבד

### 3. בדיקת טיקרים של משתמש

```bash
curl -X GET http://localhost:8080/api/tickers/my \
  -b /tmp/cookies.txt \
  | python3 -m json.tool
```

**תוצאה צפויה:**
- Status: 200
- Data: רשימת טיקרים של המשתמש המחובר

### 4. בדיקת כל הטיקרים (shared)

```bash
curl -X GET http://localhost:8080/api/tickers/ \
  -b /tmp/cookies.txt \
  | python3 -m json.tool
```

**תוצאה צפויה:**
- Status: 200
- Data: כל הטיקרים במערכת (89 טיקרים)

### 5. בדיקת הגנה על endpoints

```bash
# ללא cookies (לא מחובר)
curl -X GET http://localhost:8080/api/trades/ \
  | python3 -m json.tool
```

**תוצאה צפויה:**
- Status: 401
- Error: "Authentication required"

### 6. בדיקת הוספת טיקר למשתמש

```bash
# הוספת טיקר לרשימת המשתמש
curl -X POST http://localhost:8080/api/tickers/1/add-to-user \
  -b /tmp/cookies.txt \
  -H "Content-Type: application/json" \
  | python3 -m json.tool
```

**תוצאה צפויה:**
- Status: 201
- Message: "Ticker added to user list"

### 7. בדיקת Preferences

```bash
curl -X GET http://localhost:8080/api/preferences/user \
  -b /tmp/cookies.txt \
  | python3 -m json.tool | head -50
```

**תוצאה צפויה:**
- Status: 200
- Data: העדפות של המשתמש המחובר

---

## ✅ רשימת בדיקות מקיפה

### בדיקות Authentication
- [ ] התחברות עם username/password נכונים
- [ ] התחברות עם username/password שגויים (צריך להיכשל)
- [ ] הרשמת משתמש חדש
- [ ] הרשמה עם username קיים (צריך להיכשל)
- [ ] התנתקות
- [ ] בדיקת `/api/auth/me` לאחר התחברות
- [ ] בדיקת `/api/auth/me` ללא התחברות (צריך להיכשל)

### בדיקות Data Isolation
- [ ] משתמש 1 רואה רק את הטריידים שלו
- [ ] משתמש 2 רואה רק את הטריידים שלו
- [ ] משתמש 1 לא רואה את הטריידים של משתמש 2
- [ ] אותו הדבר עבור: trade_plans, executions, cash_flows, alerts, notes, trading_accounts

### בדיקות Tickers System
- [ ] כל המשתמשים רואים את אותם טיקרים (shared)
- [ ] כל משתמש יכול להוסיף טיקרים לרשימה שלו
- [ ] `/api/tickers/my` מחזיר רק טיקרים של המשתמש המחובר
- [ ] `/api/tickers/` מחזיר את כל הטיקרים (shared)
- [ ] הוספת טיקר למשתמש עובדת
- [ ] הסרת טיקר ממשתמש עובדת

### בדיקות Preferences
- [ ] כל משתמש שומר העדפות נפרדות
- [ ] שינוי העדפה של משתמש 1 לא משפיע על משתמש 2
- [ ] טעינת העדפות עובדת עם user_id אוטומטי

### בדיקות Cache
- [ ] מפתחות cache כוללים user_id
- [ ] Cache invalidation עובד per-user
- [ ] אין דליפת cache בין משתמשים

### בדיקות UI
- [ ] Header מציג שם משתמש
- [ ] כפתור התנתקות עובד
- [ ] עמוד התחברות מופיע כשלא מחובר
- [ ] עמוד הרשמה עובד
- [ ] Auth Guard מנתב ל-login אם לא מחובר

### בדיקות Security
- [ ] Endpoints מוגנים דורשים authentication
- [ ] ניסיון גישה ללא authentication נדחה (401)
- [ ] משתמש לא יכול לגשת לנתונים של משתמש אחר

---

## 📊 דוח תוצאות

לאחר ביצוע כל הבדיקות, מלא את הטבלה הבאה:

| קטגוריה | בדיקות | עברו | נכשלו | הערות |
|---------|--------|------|-------|-------|
| Authentication | 7 | | | |
| Data Isolation | 8 | | | |
| Tickers System | 6 | | | |
| Preferences | 3 | | | |
| Cache | 3 | | | |
| UI | 5 | | | |
| Security | 3 | | | |
| **סה"כ** | **35** | | | |

---

## 🐛 דיווח על בעיות

אם נתקלת בבעיה:

1. **תעד את הבעיה:**
   - מה ניסית לעשות?
   - מה קרה בפועל?
   - מה ציפית שיקרה?

2. **אסוף מידע:**
   - Console logs מהדפדפן
   - Network requests (Developer Tools)
   - Server logs (`Backend/logs/`)

3. **צור issue:**
   - תיאור מפורט
   - צעדים לשחזור
   - Logs רלוונטיים

---

## ✅ קריטריונים להצלחה

המערכת נחשבת מוכנה אם:

- ✅ כל בדיקות Authentication עוברות
- ✅ כל בדיקות Data Isolation עוברות
- ✅ כל בדיקות Tickers System עוברות
- ✅ כל בדיקות Security עוברות
- ✅ אין דליפת נתונים בין משתמשים
- ✅ Cache isolation עובד נכון
- ✅ UI מציג נכון את שם המשתמש

---

**תאריך בדיקה:** _______________

**בודק:** _______________

**תוצאה כללית:** ☐ עבר ☐ נכשל ☐ עם אזהרות

**הערות:**
_________________________________________________
_________________________________________________
_________________________________________________

