# מדריך הגדרת SendGrid - TikTrack
## SendGrid Setup Guide

**תאריך יצירה**: 28 בינואר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team

---

## 🎯 למה SendGrid?

- ✅ **חינמי** עד 100 מיילים ביום
- ✅ **לא דורש IP קבוע** - מושלם לשרת פיתוח
- ✅ **פשוט להגדרה**
- ✅ **אמין ויציב**
- ✅ **תמיכה טובה**

---

## 📝 שלבים להגדרה

> **⚡ מדריך מהיר**: אם כבר יצרת חשבון ונכנסת לממשק, ראה [SENDGRID_QUICK_START.md](./SENDGRID_QUICK_START.md) למדריך שלב אחר שלב מהיר.

### שלב 1: יצירת חשבון SendGrid

1. היכנס ל-[SendGrid](https://sendgrid.com)
2. לחץ על "Start for free"
3. מלא את הפרטים:
   - שם מלא
   - כתובת אימייל
   - סיסמה
   - שם חברה (אופציונלי)
4. לחץ "Create Account"
5. אמת את כתובת האימייל שלך

### שלב 2: יצירת API Key

1. לאחר הכניסה, עבור ל-**Settings** → **API Keys**
2. לחץ על **"Create API Key"**
3. בחר **"Full Access"** או **"Restricted Access"** (מומלץ: Restricted Access)
4. אם בחרת Restricted Access, סמן:
   - ✅ **Mail Send** - Full Access
5. לחץ **"Create & View"**
6. **העתק את ה-API Key מיד!** (תוצג פעם אחת בלבד)
   - ה-API Key ייראה כך: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### שלב 3: אימות כתובת אימייל (Sender Verification)

**חשוב**: לפני שתוכל לשלוח מיילים, צריך לאמת כתובת אימייל.

1. עבור ל-**Settings** → **Sender Authentication**
2. לחץ על **"Verify a Single Sender"**
3. מלא את הפרטים:
   - **From Email Address**: כתובת האימייל שלך (לדוגמה: `noreply@yourdomain.com`)
   - **From Name**: `TikTrack`
   - **Reply To**: אותה כתובת
   - **Company Address**: כתובת החברה
   - **Website URL**: כתובת האתר
4. לחץ **"Create"**
5. **בדוק את האימייל** שנשלח לכתובת שלך ולחץ על הקישור לאימות

**⚠️ חשוב**: רק לאחר אימות הכתובת תוכל לשלוח מיילים!

---

## ⚙️ הגדרה ב-TikTrack

### דרך הממשק (מומלץ):

1. פתח `http://localhost:8080/user-profile.html`
2. גלול לסקשן **"הגדרות SMTP"**
3. הכנס את הפרטים הבאים:
   - **Host**: `smtp.sendgrid.net`
   - **Port**: `587`
   - **User**: `apikey` (זה המילה המילולית "apikey", לא ה-API Key שלך!)
   - **Password**: ה-API Key שיצרת (החל מ-`SG.`)
   - **From Email**: כתובת האימייל שאימתת ב-SendGrid
   - **From Name**: `TikTrack`
   - **Use TLS**: ✅ מופעל
   - **Enabled**: ✅ מופעל
4. לחץ על **"עדכן הגדרות SMTP"**
5. לחץ על **"בדיקת חיבור"** לוודא שהכל עובד

### דרך API (אופציונלי):

```bash
curl -X POST http://localhost:8080/api/system-settings/smtp \
  -H "Content-Type: application/json" \
  -d '{
    "smtp_host": "smtp.sendgrid.net",
    "smtp_port": 587,
    "smtp_user": "apikey",
    "smtp_password": "SG.your_api_key_here",
    "smtp_from_email": "noreply@yourdomain.com",
    "smtp_from_name": "TikTrack",
    "smtp_use_tls": true,
    "smtp_enabled": true
  }'
```

---

## ✅ בדיקת החיבור

לאחר עדכון ההגדרות:

1. לחץ על **"בדיקת חיבור"** בממשק
2. אם הכל תקין, תראה: **"חיבור SMTP תקין"** ✅
3. אם יש שגיאה, בדוק:
   - שה-API Key נכון
   - שכתובת האימייל אומתה ב-SendGrid
   - שה-User הוא `apikey` (לא ה-API Key!)

---

## 📧 שליחת מייל בדיקה

1. בממשק SMTP, הכנס כתובת אימייל בשדה **"כתובת אימייל לבדיקה"**
2. לחץ על **"שליחת מייל בדיקה"**
3. בדוק את תיבת הדואר הנכנס (וגם תיקיית הספאם)
4. אם המייל הגיע - הכל עובד! 🎉

---

## 🔧 פתרון בעיות

### בעיה: "SMTP authentication failed"

**סיבות אפשריות**:
1. **User שגוי** - ודא שה-User הוא `apikey` (לא ה-API Key!)
2. **API Key שגוי** - ודא שהעתקת את ה-API Key המלא (החל מ-`SG.`)
3. **API Key לא פעיל** - בדוק ב-SendGrid שהמפתח פעיל

**פתרון**:
- ודא שה-User הוא בדיוק `apikey` (אותיות קטנות)
- ודא שה-Password הוא ה-API Key המלא (החל מ-`SG.`)

### בעיה: "Email not sent" או "Sender not verified"

**סיבה**: כתובת האימייל לא אומתה ב-SendGrid

**פתרון**:
1. עבור ל-SendGrid → Settings → Sender Authentication
2. ודא שכתובת האימייל מופיעה כ-"Verified"
3. אם לא, אמת אותה מחדש

### בעיה: "Connection timeout"

**סיבות אפשריות**:
1. חומת אש חוסמת את הפורט
2. רשת לא יציבה

**פתרון**:
- בדוק חיבור לאינטרנט
- בדוק הגדרות חומת אש

---

## 📊 הגדרות מומלצות ל-SendGrid

- **Host**: `smtp.sendgrid.net`
- **Port**: `587` (עם TLS) או `465` (עם SSL)
- **User**: `apikey` (זה המילה המילולית!)
- **Password**: ה-API Key שלך (החל מ-`SG.`)
- **From Email**: כתובת שבדקת ב-SendGrid
- **From Name**: `TikTrack` (או שם אחר)
- **Use TLS**: ✅ מופעל (אם Port 587)

---

## 🔐 אבטחה

### ⚠️ חשוב מאוד:

1. **אל תשתף את ה-API Key** עם אחרים
2. **אל תכניס את ה-API Key** בקוד או בקובצי קונפיגורציה
3. **הסיסמה נשמרת מוצפנת** במסד הנתונים
4. **אם ה-API Key נחשף**, מחק אותו ב-SendGrid וצור חדש מיד

### מחזור API Keys:

מומלץ להחליף API Keys מדי פעם:
1. צור API Key חדש ב-SendGrid
2. עדכן את הסיסמה ב-TikTrack
3. מחק את ה-API Key הישן מ-SendGrid

---

## 📖 מדריכים נוספים

- **ארכיטקטורת SMTP**: [../backend/SMTP_ARCHITECTURE.md](../backend/SMTP_ARCHITECTURE.md)
- **פתרונות חלופיים**: [SMTP_ALTERNATIVES_DEVELOPMENT.md](./SMTP_ALTERNATIVES_DEVELOPMENT.md)
- **ניהול SMTP**: [SMTP_MANAGEMENT_GUIDE.md](./SMTP_MANAGEMENT_GUIDE.md)

---

## ✅ סיכום

1. ✅ הירשם ל-SendGrid (חינמי)
2. ✅ צור API Key
3. ✅ אמת כתובת אימייל
4. ✅ עדכן את ההגדרות ב-TikTrack:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - User: `apikey`
   - Password: ה-API Key שלך
5. ✅ בדוק את החיבור
6. ✅ שלח מייל בדיקה

**לאחר ביצוע השלבים, החיבור אמור לעבוד!** 🎉

---

**עדכון אחרון**: 28 בינואר 2025  
**גרסה**: 1.0.0

