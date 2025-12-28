# פתרון בעיות SendGrid - TikTrack

## SendGrid Troubleshooting Guide

**תאריך יצירה**: 28 בינואר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team

---

## 🔧 בעיות נפוצות ופתרונות

### בעיה: "Connection unexpectedly closed"

**סיבות אפשריות**:

1. **הכתובת לא אומתה ב-SendGrid**
   - **פתרון**: ודא שכתובת האימייל מופיעה כ-"Verified" ב-SendGrid
   - Settings → Sender Authentication → Verify a Single Sender

2. **API Key לא נכון**
   - **פתרון**: ודא שהעתקת את ה-API Key המלא (לא ה-Secret Key!)
   - ודא שאין רווחים בהתחלה או בסוף

3. **User שגוי**
   - ❌ שגוי: `SG.xxxxx` או `a08ab9dfe235af851c775ff58da75a48`
   - ✅ נכון: `apikey` (המילה המילולית!)

4. **פורט שגוי**
   - **פתרון**: נסה פורט 465 עם SSL במקום 587 עם TLS

---

## 🧪 בדיקות שלב אחר שלב

### בדיקה 1: אימות כתובת אימייל

1. היכנס ל-SendGrid: https://app.sendgrid.com
2. Settings → Sender Authentication
3. בדוק אם `nimrod@mezoo.co` מופיע כ-**"Verified"** ✅
4. אם לא, אמת אותה (ראה [SENDGRID_QUICK_START.md](./SENDGRID_QUICK_START.md))

### בדיקה 2: API Key

1. Settings → API Keys
2. ודא שה-API Key פעיל
3. אם לא בטוח, צור API Key חדש:
   - Name: `TikTrack SMTP`
   - Permissions: Restricted Access → Mail Send → Full Access
   - העתק את ה-API Key (החל מ-`SG.`)

### בדיקה 3: הגדרות ב-TikTrack

פתח `http://localhost:8080/user_profile` → סקשן "הגדרות SMTP":

- ✅ Host: `smtp.sendgrid.net`
- ✅ Port: `587`
- ✅ User: `apikey` (המילה המילולית!)
- ✅ Password: ה-API Key שלך (לא ה-Secret Key!)
- ✅ From Email: `nimrod@mezoo.co` (הכתובת שאימתת)
- ✅ Use TLS: מופעל

---

## 🔄 נסה פורט 465 (SSL)

אם פורט 587 לא עובד, נסה פורט 465:

1. בממשק TikTrack, שנה:
   - Port: `465`
   - Use TLS: **כבוי** (כי 465 משתמש ב-SSL, לא TLS)

2. לחץ "עדכן הגדרות SMTP"

3. לחץ "בדיקת חיבור"

---

## 📧 בדיקה דרך SendGrid Dashboard

1. היכנס ל-SendGrid Dashboard
2. עבור ל-**Activity** → **Email Activity**
3. נסה לשלוח מייל בדיקה מ-TikTrack
4. בדוק אם המייל מופיע ב-Activity:
   - אם כן → הבעיה לא ב-SendGrid
   - אם לא → הבעיה ב-SendGrid או בחיבור

---

## 🔍 בדיקת לוגים

### בדיקת לוגים במסד הנתונים

```bash
python3 Backend/scripts/check_smtp_password.py
```

### בדיקת לוגים בשרת

בדוק את הלוגים ב-`Backend/logs/` עבור שגיאות SMTP.

---

## ✅ סיכום בדיקות

1. ✅ כתובת אימייל מאומתת ב-SendGrid
2. ✅ API Key פעיל ונכון
3. ✅ User = `apikey` (לא ה-API Key!)
4. ✅ Password = ה-API Key (לא ה-Secret Key!)
5. ✅ From Email = הכתובת שאימתת
6. ✅ נסה פורט 465 אם 587 לא עובד

---

**עדכון אחרון**: 28 בינואר 2025  
**גרסה**: 1.0.0

