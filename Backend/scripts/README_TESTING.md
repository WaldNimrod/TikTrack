# מדריך בדיקות - מערכת Multi-User
## TikTrack - November 29, 2025

---

## 🚀 התחלה מהירה

### בדיקות מהירות (10 שניות)
```bash
./Backend/scripts/quick_test.sh
```

### בדיקות מקיפות (30-60 שניות)
```bash
./Backend/scripts/run_final_tests.sh
```

---

## 📚 מסמכי בדיקות

1. **`FINAL_TESTING_GUIDE.md`** - מדריך מפורט לבדיקות ידניות ואוטומטיות
2. **`TESTING_CHECKLIST.md`** - רשימת בדיקות עם אפשרות לסמן
3. **`COMPLETE_TESTING_SUMMARY.md`** - סיכום מקיף של כל הבדיקות
4. **`FINAL_TEST_RESULTS.md`** - תוצאות בדיקות

---

## 🧪 סקריפטי בדיקות

### 1. Quick Test (`quick_test.sh`)
בדיקות מהירות בסיסיות:
- שרת רץ
- התחברות
- Endpoints מוגנים
- טיקרים

**הרצה:**
```bash
./Backend/scripts/quick_test.sh
```

### 2. Comprehensive Tests (`comprehensive_multi_user_tests.py`)
בדיקות מקיפות:
- כל בדיקות Quick Test
- הרשמה
- Data isolation
- Multiple users
- Security

**הרצה:**
```bash
python3 Backend/scripts/comprehensive_multi_user_tests.py
```

### 3. Multi-User Migration Test (`test_multi_user_system.py`)
בדיקות ספציפיות למיגרציה:
- Schema changes
- Data migration
- User creation

**הרצה:**
```bash
python3 Backend/scripts/test_multi_user_system.py
```

---

## 🌐 בדיקות ידניות

### בדיקות בדפדפן

1. **התחברות:**
   - פתח `http://localhost:8080/login.html`
   - התחבר עם: `nimrod` / `nimrod123`
   - ודא שההתחברות מצליחה

2. **הרשמה:**
   - פתח `http://localhost:8080/register.html`
   - הרשם משתמש חדש
   - ודא שההרשמה מצליחה

3. **Header:**
   - ודא שמופיע שם המשתמש
   - ודא שמופיע כפתור "התנתק"
   - לחץ על "התנתק" ודא שההתנתקות עובדת

4. **Data Isolation:**
   - התחבר כמשתמש 1
   - פתח `/trades` ורשום כמה טריידים יש
   - התנתק והתחבר כמשתמש 2
   - ודא שהטריידים שונים

5. **Tickers:**
   - פתח `/tickers`
   - ודא שמופיעים כל הטיקרים (89)
   - בדוק את `/api/tickers/my`
   - נסה להוסיף טיקר לרשימה שלך

---

## 🔌 בדיקות API

### Authentication
```bash
# התחברות
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"nimrod","password":"nimrod123"}' \
  -c /tmp/cookies.txt

# משתמש נוכחי
curl -X GET http://localhost:8080/api/auth/me \
  -b /tmp/cookies.txt

# התנתקות
curl -X POST http://localhost:8080/api/auth/logout \
  -b /tmp/cookies.txt
```

### Data Endpoints
```bash
# Trades
curl -X GET http://localhost:8080/api/trades/ \
  -b /tmp/cookies.txt

# User Tickers
curl -X GET http://localhost:8080/api/tickers/my \
  -b /tmp/cookies.txt

# All Tickers
curl -X GET http://localhost:8080/api/tickers/ \
  -b /tmp/cookies.txt
```

### Security
```bash
# ללא authentication (צריך להיכשל)
curl -X GET http://localhost:8080/api/trades/
# Expected: 401
```

---

## ✅ קריטריונים להצלחה

המערכת מוכנה אם:
- ✅ כל בדיקות Authentication עוברות
- ✅ כל בדיקות Data Isolation עוברות
- ✅ כל בדיקות Security עוברות
- ✅ אין דליפת נתונים בין משתמשים
- ✅ Cache isolation עובד
- ✅ UI מציג נכון את שם המשתמש

---

## 📞 תמיכה

אם נתקלת בבעיה:
1. ראה `FINAL_TESTING_GUIDE.md` לפתרונות נפוצים
2. בדוק את ה-logs ב-`Backend/logs/`
3. ודא שהשרת רץ: `curl http://localhost:8080/api/health`

