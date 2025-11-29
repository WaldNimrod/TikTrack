# מדריך הגדרת App Password ב-Gmail
## Gmail App Password Setup Guide

**תאריך יצירה**: 29 בנובמבר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team

---

## למה צריך App Password?

Gmail דורש **App Password** (סיסמת אפליקציה) במקום סיסמה רגילה כאשר:
- יש הפעלה של "2-Step Verification" (אימות דו-שלבי)
- רוצים להשתמש ב-SMTP מכלי חיצוניים
- רוצים אבטחה טובה יותר

**הערה**: אם אין לך "2-Step Verification" מופעל, תצטרך להפעיל אותו קודם.

**חשוב**: החל מ-1 במאי 2025, Google הפסיקה את התמיכה באפליקציות ברמת אבטחה נמוכה (LSA). לכן, **חובה** להשתמש ב-App Password או OAuth כדי לאפשר למערכת לשלוח אימיילים דרך Gmail.

---

## שלבים ליצירת App Password

### שלב 1: הפעלת 2-Step Verification

1. היכנס לחשבון Google שלך
2. עבור ל-[Security Settings](https://myaccount.google.com/security)
3. מצא את "2-Step Verification"
4. לחץ על "Get started" או "Turn on"
5. עקוב אחר ההוראות להפעלת אימות דו-שלבי

### שלב 2: יצירת App Password

1. לאחר שהפעלת 2-Step Verification, עבור ל-[App Passwords](https://myaccount.google.com/apppasswords)
   - **או**: Security → 2-Step Verification → App passwords
2. בחר "Mail" מהרשימה
3. בחר "Other (Custom name)" מהרשימה
4. הכנס שם: `TikTrack SMTP`
5. לחץ על "Generate"
6. **העתק את הסיסמה מיד!** (תוצג פעם אחת בלבד)
   - הסיסמה תיראה כך: `abcd efgh ijkl mnop` (16 תווים עם רווחים)

### שלב 3: עדכון הסיסמה ב-TikTrack

#### דרך הממשק (מומלץ):

1. פתח `http://localhost:8080/user-profile.html`
2. גלול לסקשן **"הגדרות SMTP"**
3. הכנס את ה-App Password בשדה **"סיסמה (Password)"**
   - **חשוב**: הכנס את הסיסמה **ללא רווחים** (הסר את כל הרווחים)
   - לדוגמה: `abcdefghijklmnop` במקום `abcd efgh ijkl mnop`
4. לחץ על **"עדכן הגדרות SMTP"**
5. לחץ על **"בדיקת חיבור"** לוודא שהכל עובד

#### דרך סקריפט:

```bash
export POSTGRES_HOST=localhost
export POSTGRES_DB=TikTrack-db-development
export POSTGRES_USER=TikTrakDBAdmin
export POSTGRES_PASSWORD="BigMeZoo1974!?"

python3 Backend/scripts/set_smtp_password.py "YOUR_APP_PASSWORD_HERE"
```

**הערה**: החלף `YOUR_APP_PASSWORD_HERE` ב-App Password שיצרת (ללא רווחים).

---

## בדיקת החיבור

לאחר עדכון הסיסמה:

1. פתח `http://localhost:8080/user-profile.html`
2. גלול לסקשן **"הגדרות SMTP"**
3. לחץ על **"בדיקת חיבור"**
4. אם הכל תקין, תראה: **"חיבור SMTP תקין"** ✅

---

## הגדרות נוספות ב-Google Workspace

אם אתה משתמש ב-**Google Workspace** (לא Gmail רגיל), ייתכן שתצטרך לבצע הגדרות נוספות במנהל המערכת:

### בדיקה: האם זה Google Workspace?

1. בדוק את כתובת האימייל:
   - אם זה `@gmail.com` → זה **Gmail רגיל** → המשך כאן
   - אם זה `@yourdomain.com` (כמו `@mezoo.co`) → זה **Google Workspace** → ראה [GMAIL_WORKSPACE_SMTP_SETUP.md](./GMAIL_WORKSPACE_SMTP_SETUP.md)

### הגדרות במנהל המערכת (Google Workspace בלבד)

אם עדיין יש בעיות ב-Google Workspace, ייתכן שצריך להגדיר במנהל המערכת:

1. היכנס ל-[Google Admin Console](https://admin.google.com)
2. עבור ל-**Apps** → **Google Workspace** → **Gmail**
3. בדוק את ההגדרות הבאות:
   - **SMTP Relay service**: ודא שהשירות מופעל
   - **API controls**: בדוק אם יש הגבלות IP שמונעות גישה מ-SMTP

**הערה**: ברוב המקרים, זה לא נדרש אם אתה משתמש ב-App Password.

---

## פתרון בעיות

### בעיה: "App passwords not available"

**סיבה**: אין 2-Step Verification מופעל

**פתרון**:
1. הפעל 2-Step Verification (ראה שלב 1)
2. המתן מספר דקות
3. נסה שוב ליצור App Password

### בעיה: "Invalid password"

**סיבות אפשריות**:
1. הכנסת את הסיסמה עם רווחים
   - **פתרון**: הסר את כל הרווחים מהסיסמה
2. העתקת את הסיסמה שגויה
   - **פתרון**: צור App Password חדש והעתק בזהירות
3. הסיסמה פגה
   - **פתרון**: צור App Password חדש

### בעיה: "Connection timeout"

**סיבות אפשריות**:
1. חומת אש חוסמת את הפורט
   - **פתרון**: בדוק הגדרות חומת אש
2. רשת לא יציבה
   - **פתרון**: בדוק חיבור לאינטרנט

### בעיה: "TLS/SSL error"

**סיבות אפשריות**:
1. TLS לא מופעל
   - **פתרון**: ודא ש-"Use TLS" מופעל בממשק
2. פורט שגוי
   - **פתרון**: Gmail דורש פורט 587 עם TLS או 465 עם SSL

---

## הגדרות מומלצות ל-Gmail

- **Host**: `smtp.gmail.com`
- **Port**: `587` (עם TLS) או `465` (עם SSL)
- **Use TLS**: ✅ מופעל (אם Port 587)
- **User**: כתובת האימייל המלאה שלך (לדוגמה: `admin@mezoo.co`)
- **Password**: App Password (16 תווים, ללא רווחים)
- **From Email**: אותה כתובת כמו User
- **From Name**: `TikTrack` (או שם אחר)

---

## אבטחה

### ⚠️ חשוב מאוד:

1. **אל תשתף את ה-App Password** עם אחרים
2. **אל תכניס את ה-App Password** בקוד או בקובצי קונפיגורציה
3. **הסיסמה נשמרת מוצפנת** במסד הנתונים
4. **אם הסיסמה נחשפה**, צור App Password חדש מיד

### מחזור App Passwords:

מומלץ להחליף App Passwords מדי פעם:
1. צור App Password חדש
2. עדכן את הסיסמה ב-TikTrack
3. מחק את ה-App Password הישן מ-Google

---

## קישורים שימושיים

- [Google Account Security](https://myaccount.google.com/security)
- [2-Step Verification](https://myaccount.google.com/signinoptions/two-step-verification)
- [App Passwords](https://myaccount.google.com/apppasswords)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)

---

## סיכום

1. ✅ הפעל 2-Step Verification
2. ✅ צור App Password
3. ✅ עדכן את הסיסמה ב-TikTrack (ללא רווחים)
4. ✅ בדוק את החיבור

**לאחר ביצוע השלבים, החיבור אמור לעבוד!** 🎉

---

**עדכון אחרון**: 29 בנובמבר 2025  
**גרסה**: 1.0.0

