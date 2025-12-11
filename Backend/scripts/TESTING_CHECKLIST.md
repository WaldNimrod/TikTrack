# ✅ רשימת בדיקות - מערכת Multi-User

## TikTrack - November 29, 2025

רשימת בדיקות מקיפה עם אפשרות לסמן כל בדיקה.

---

## 🔐 Authentication (7 בדיקות)

### Backend API

- [ ] `POST /api/auth/register` - הרשמה מצליחה
- [ ] `POST /api/auth/register` - הרשמה עם username קיים נכשלת
- [ ] `POST /api/auth/login` - התחברות מצליחה
- [ ] `POST /api/auth/login` - התחברות עם credentials שגויים נכשלת
- [ ] `GET /api/auth/me` - מחזיר משתמש מחובר
- [ ] `GET /api/auth/me` - נכשל ללא authentication
- [ ] `POST /api/auth/logout` - התנתקות מצליחה

### Frontend

- [ ] עמוד `/login.html` נטען
- [ ] התחברות דרך UI מצליחה
- [ ] עמוד `/register.html` נטען
- [ ] הרשמה דרך UI מצליחה
- [ ] Auth Guard מנתב ל-login אם לא מחובר

---

## 🔒 Data Isolation (8 בדיקות)

### Trades

- [ ] משתמש 1 רואה רק את הטריידים שלו
- [ ] משתמש 2 רואה רק את הטריידים שלו
- [ ] משתמש 1 לא רואה את הטריידים של משתמש 2

### Trade Plans

- [ ] משתמש 1 רואה רק את התוכניות שלו
- [ ] משתמש 2 רואה רק את התוכניות שלו

### Trading Accounts

- [ ] משתמש 1 רואה רק את החשבונות שלו
- [ ] משתמש 2 רואה רק את החשבונות שלו

### Executions, Cash Flows, Alerts, Notes

- [ ] כל ישות מסוננת לפי user_id

---

## 📊 Tickers System (6 בדיקות)

- [ ] `GET /api/tickers/` - מחזיר את כל הטיקרים (shared, 89)
- [ ] `GET /api/tickers/my` - מחזיר רק טיקרים של המשתמש
- [ ] `POST /api/tickers/:id/add-to-user` - מוסיף טיקר למשתמש
- [ ] `DELETE /api/tickers/:id/remove-from-user` - מסיר טיקר ממשתמש
- [ ] טיקרים נשארים משותפים (ללא כפילויות)
- [ ] כל משתמש יכול להוסיף טיקרים לרשימה שלו

---

## ⚙️ Preferences (3 בדיקות)

- [ ] כל משתמש שומר העדפות נפרדות
- [ ] שינוי העדפה של משתמש 1 לא משפיע על משתמש 2
- [ ] `getCurrentUserId()` עובד אוטומטית

---

## 💾 Cache (3 בדיקות)

- [ ] מפתחות cache כוללים `u{userId}:`
- [ ] Cache invalidation עובד per-user
- [ ] אין דליפת cache בין משתמשים

---

## 🎨 UI (5 בדיקות)

- [ ] Header מציג שם משתמש
- [ ] כפתור "התנתק" מופיע ב-header
- [ ] לחיצה על "התנתק" מנתקת את המשתמש
- [ ] `updateUserDisplay()` מעדכן את התצוגה
- [ ] Event listeners עובדים (login/logout)

---

## 🛡️ Security (3 בדיקות)

- [ ] `GET /api/trades/` ללא authentication מחזיר 401
- [ ] `GET /api/tickers/my` ללא authentication מחזיר 401
- [ ] משתמש לא יכול לגשת לנתונים של משתמש אחר

---

## 🔄 Integration (3 בדיקות)

- [ ] Preferences System משתמש ב-user_id אוטומטית
- [ ] Cache Sync Manager כולל user_id
- [ ] Header System מציג משתמש ומאפשר התנתקות

---

## 📈 Performance (אופציונלי)

- [ ] זמן תגובה של API endpoints < 500ms
- [ ] Concurrent users עובדים נכון
- [ ] Session persistence עובד

---

## ✅ סיכום

**סה"כ בדיקות:** 38

**עברו:** ___ / 38

**נכשלו:** ___ / 38

**תאריך:** _______________

**בודק:** _______________

**הערות:**
_________________________________________________
_________________________________________________

