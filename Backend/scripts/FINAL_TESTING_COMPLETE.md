# מדריך בדיקות סופיות מלא - מערכת Multi-User
## TikTrack - November 29, 2025

מדריך מקיף לבדיקות אוטומטיות וידניות כולל כל הפונקציונליות החדשה.

---

## 🎯 מה נבדק

### בדיקות Authentication
- ✅ כניסה למערכת
- ✅ התנתקות מהמערכת
- ✅ הוספת משתמש (הרשמה)
- ✅ עדכון סיסמה
- ✅ עריכת פרטי משתמש

### בדיקות בדפדפן
- ✅ ממשק כניסה בפתיחה
- ✅ עמוד התחברות
- ✅ עמוד הרשמה
- ✅ עמוד פרופיל משתמש
- ✅ Header עם שם משתמש וכפתור התנתקות

---

## 🚀 הרצת בדיקות

### 1. בדיקות אוטומטיות מקיפות

```bash
# בדיקות מהירות (10 שניות)
./Backend/scripts/quick_test.sh

# בדיקות מקיפות (כולל עדכון סיסמה ופרופיל)
./Backend/scripts/run_final_tests.sh
```

### 2. בדיקות בדפדפן

```bash
# פתיחת דפדפן לבדיקות ידניות
./Backend/scripts/browser_test_runner.sh
```

או פתח ידנית:
- Login: `http://localhost:8080/login.html`
- Register: `http://localhost:8080/register.html`
- User Profile: `http://localhost:8080/user-profile.html`
- Home: `http://localhost:8080/index.html` (אמור להעביר ל-login אם לא מחובר)

---

## ✅ רשימת בדיקות מלאה

### בדיקות Authentication (5 בדיקות)

#### 1. בדיקת ממשק כניסה בפתיחה
- [ ] פתיחת `index.html` ללא התחברות → מעבר אוטומטי ל-`login.html`
- [ ] פתיחת `trades.html` ללא התחברות → מעבר אוטומטי ל-`login.html`

#### 2. בדיקת התחברות
- [ ] טופס התחברות מופיע
- [ ] התחברות עם credentials נכונים מצליחה
- [ ] מעבר אוטומטי ל-index.html לאחר התחברות
- [ ] שם המשתמש מופיע ב-header

#### 3. בדיקת הרשמה
- [ ] טופס הרשמה מופיע
- [ ] הרשמה עם פרטים חדשים מצליחה
- [ ] הרשמה עם username קיים נכשלת
- [ ] מעבר אוטומטי ל-login.html לאחר הרשמה

#### 4. בדיקת התנתקות
- [ ] כפתור "התנתק" מופיע ב-header
- [ ] לחיצה על "התנתק" מנתקת את המשתמש
- [ ] מעבר אוטומטי ל-login.html לאחר התנתקות
- [ ] שם המשתמש וכפתור ההתנתקות נעלמים

#### 5. בדיקת עדכון סיסמה
- [ ] עמוד user-profile.html נטען
- [ ] טופס שינוי סיסמה מופיע
- [ ] עדכון סיסמה עם סיסמה נוכחית נכונה מצליח
- [ ] עדכון סיסמה עם סיסמה נוכחית שגויה נכשל
- [ ] עדכון סיסמה עם סיסמה חדשה קצרה מדי נכשל
- [ ] התחברות עם סיסמה חדשה מצליחה

#### 6. בדיקת עריכת פרטי משתמש
- [ ] עמוד user-profile.html נטען
- [ ] פרטי המשתמש מופיעים (username, email, first_name, last_name)
- [ ] עדכון email מצליח
- [ ] עדכון first_name מצליח
- [ ] עדכון last_name מצליח
- [ ] שם המשתמש ב-header מתעדכן (אם display_name השתנה)

---

## 📋 טבלת מעקב בדיקות

| # | בדיקה | תוצאה | הערות |
|---|-------|--------|-------|
| 1 | ממשק כניסה בפתיחה | ☐ | |
| 2 | התחברות | ☐ | |
| 3 | הרשמה | ☐ | |
| 4 | התנתקות | ☐ | |
| 5 | עדכון סיסמה | ☐ | |
| 6 | עריכת פרטי משתמש | ☐ | |
| 7 | Header - תצוגת משתמש | ☐ | |
| 8 | סינון נתונים | ☐ | |
| 9 | טיקרים משותפים | ☐ | |
| 10 | Auth Guard | ☐ | |
| 11 | Preferences per User | ☐ | |
| 12 | Cache Isolation | ☐ | |

---

## 🔍 בדיקות API ישירות

### עדכון פרופיל
```bash
# התחברות
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"nimrod","password":"nimrod123"}' \
  -c /tmp/cookies.txt

# עדכון פרופיל
curl -X PUT http://localhost:8080/api/auth/me \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"email":"newemail@example.com","first_name":"NewFirst","last_name":"NewLast"}'
```

### עדכון סיסמה
```bash
# עדכון סיסמה
curl -X PUT http://localhost:8080/api/auth/me/password \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"current_password":"nimrod123","new_password":"newpassword123"}'
```

---

## 📖 מסמכי הדרכה

1. **`comprehensive_browser_tests.md`** - מדריך מפורט לבדיקות בדפדפן
2. **`FINAL_TESTING_GUIDE.md`** - מדריך כללי לבדיקות
3. **`TESTING_CHECKLIST.md`** - רשימת בדיקות לסמן
4. **`README_TESTING.md`** - מדריך התחלה מהירה

---

## ✅ קריטריונים להצלחה

המערכת מוכנה אם:
- ✅ ממשק כניסה מופיע בפתיחה
- ✅ התחברות והתנתקות עובדות
- ✅ הרשמה עובדת
- ✅ עדכון סיסמה עובד
- ✅ עריכת פרטי משתמש עובדת
- ✅ אין דליפת נתונים בין משתמשים
- ✅ Auth Guard עובד

---

**תאריך בדיקה:** _______________

**בודק:** _______________

**תוצאה כללית:** ☐ עבר ☐ נכשל ☐ עם אזהרות

