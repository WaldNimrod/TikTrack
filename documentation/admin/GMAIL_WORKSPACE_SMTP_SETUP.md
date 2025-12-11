# מדריך הגדרת SMTP ב-Google Workspace

## Google Workspace SMTP Setup Guide

**תאריך יצירה**: 28 בינואר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team

---

## הקדמה

אם אתה משתמש ב-**Google Workspace** (לא Gmail רגיל), ייתכן שתצטרך לבצע הגדרות נוספות במנהל המערכת (Admin Console) כדי לאפשר למערכת לשלוח הודעות דרך SMTP.

---

## בדיקה: האם זה Google Workspace

1. היכנס לחשבון Google שלך
2. בדוק את כתובת האימייל:
   - אם זה `@gmail.com` → זה **Gmail רגיל** → ראה [GMAIL_APP_PASSWORD_SETUP.md](./GMAIL_APP_PASSWORD_SETUP.md)
   - אם זה `@yourdomain.com` (כמו `@mezoo.co`) → זה **Google Workspace** → המשך כאן

---

## הגדרות נדרשות ב-Google Workspace

### 1. הפעלת 2-Step Verification (אימות דו-שלבי)

**חובה**: לפני יצירת App Password, יש להפעיל 2-Step Verification.

1. היכנס לחשבון Google Workspace שלך
2. עבור ל-[Security Settings](https://myaccount.google.com/security)
3. מצא את "2-Step Verification"
4. לחץ על "Get started" או "Turn on"
5. עקוב אחר ההוראות להפעלת אימות דו-שלבי

### 2. יצירת App Password

1. לאחר שהפעלת 2-Step Verification, עבור ל-[App Passwords](https://myaccount.google.com/apppasswords)
2. בחר "Mail" מהרשימה
3. בחר "Other (Custom name)" מהרשימה
4. הכנס שם: `TikTrack SMTP`
5. לחץ על "Generate"
6. **העתק את הסיסמה מיד!** (תוצג פעם אחת בלבד)
   - הסיסמה תיראה כך: `abcd efgh ijkl mnop` (16 תווים עם רווחים)

### 3. הגדרות במנהל המערכת (Admin Console) - **חשוב לחשבון עסקי!**

**⚠️ חשוב**: בחשבון Google Workspace עסקי, ייתכן שצריך לבצע הגדרות נוספות במנהל המערכת.

#### א. בדיקת הגדרות Gmail במנהל המערכת

1. היכנס ל-[Google Admin Console](https://admin.google.com)
2. עבור ל-**Apps** → **Google Workspace** → **Gmail**
3. בדוק את ההגדרות הבאות:
   - ודא ש-Gmail מופעל למשתמשים
   - בדוק אם יש הגבלות על שליחת מייל

#### ב. בדיקת API Controls והגבלות גישה

**זה חשוב במיוחד לחשבון עסקי!**

1. ב-Admin Console, עבור ל-**Security** → **Access and data control** → **API controls**
2. בדוק את ההגדרות הבאות:
   - **Less secure app access**: אם זה מופעל, כבה אותו (Google הפסיקה תמיכה ב-LSA)
   - **App access**: ודא ש-"Allow users to manage their access to less secure apps" מופעל (אם קיים)
   - **IP whitelist**: בדוק אם יש רשימת IP מותרים - אם כן, הוסף את כתובת ה-IP של השרת שלך

#### ג. בדיקת הגדרות אימות דו-שלבי במנהל המערכת

1. ב-Admin Console, עבור ל-**Security** → **Access and data control** → **2-Step Verification**
2. ודא ש-2-Step Verification מופעל למשתמשים
3. אם לא, הפעל אותו:
   - בחר "Allow users to turn on 2-Step Verification" או "Enforce 2-Step Verification"
   - שמור את ההגדרות

#### ד. הגדרת SMTP Relay (אם App Password לא עובד)

**אם App Password לא עובד**, ייתכן שצריך להגדיר SMTP Relay:

1. ב-Admin Console, עבור ל-**Apps** → **Google Workspace** → **Gmail**
2. גלול למטה ל-**Routing** → **SMTP relay service**
3. לחץ על "Add another route"
4. הגדר:
   - **Name**: `TikTrack SMTP Relay`
   - **SMTP relay service**: `smtp-relay.gmail.com`
   - **Allowed senders**: בחר "Only addresses in my domains" או "Only registered apps"
   - **Require SMTP authentication**: ✅ מופעל
   - **Require TLS encryption**: ✅ מופעל
5. שמור את ההגדרות

**הערה**: בדרך כלל, App Password אמור לעבוד ללא SMTP Relay. נסה SMTP Relay רק אם App Password לא עובד.

#### ה. בדיקת הגבלות IP (אם נדרש)

אם יש הגבלות IP במנהל המערכת:

1. ב-Admin Console, עבור ל-**Security** → **Access and data control** → **API controls**
2. מצא את "IP whitelist" או "IP address allowlist"
3. אם יש רשימה, הוסף את כתובת ה-IP של השרת שלך:
   - **כיצד למצוא את כתובת ה-IP של השרת?**
     - אם השרת רץ על המחשב המקומי: `127.0.0.1` או `localhost`
     - אם השרת רץ על שרת מרוחק: בדוק את כתובת ה-IP הציבורית של השרת
4. שמור את ההגדרות

**הערה**: אם אין הגבלות IP, זה לא נדרש.

---

## הגדרת פרטי SMTP ב-TikTrack

לאחר יצירת App Password:

1. פתח `http://localhost:8080/user-profile.html`
2. גלול לסקשן **"הגדרות SMTP"**
3. הכנס את הפרטים הבאים:
   - **Host**: `smtp.gmail.com`
   - **Port**: `587`
   - **User**: כתובת האימייל המלאה שלך (לדוגמה: `admin@mezoo.co`)
   - **Password**: App Password (16 תווים, **ללא רווחים**)
   - **From Email**: אותה כתובת כמו User
   - **From Name**: `TikTrack` (או שם אחר)
   - **Use TLS**: ✅ מופעל
   - **Enabled**: ✅ מופעל
4. לחץ על **"עדכן הגדרות SMTP"**
5. לחץ על **"בדיקת חיבור"** לוודא שהכל עובד

---

## פתרון בעיות

### בעיה: "535 Authentication failed"

**סיבות אפשריות**:

1. **לא הפעלת 2-Step Verification**
   - **פתרון**: הפעל 2-Step Verification (ראה שלב 1)

2. **לא יצרת App Password**
   - **פתרון**: צור App Password (ראה שלב 2)

3. **הכנסת את הסיסמה עם רווחים**
   - **פתרון**: הסר את כל הרווחים מהסיסמה

4. **הסיסמה שגויה**
   - **פתרון**: צור App Password חדש והעתק בזהירות

5. **הגבלות במנהל המערכת (חשוב במיוחד לחשבון עסקי!)**
   - **פתרון**:
     - בדוק את ההגדרות במנהל המערכת (ראה שלב 3)
     - ודא ש-2-Step Verification מופעל במנהל המערכת
     - בדוק API controls והגבלות IP
     - אם App Password לא עובד, נסה להגדיר SMTP Relay

### בעיה: "Connection timeout"

**סיבות אפשריות**:

1. **חומת אש חוסמת את הפורט**
   - **פתרון**: בדוק הגדרות חומת אש

2. **רשת לא יציבה**
   - **פתרון**: בדוק חיבור לאינטרנט

3. **הגבלות IP במנהל המערכת**
   - **פתרון**: הוסף את כתובת ה-IP של השרת לרשימת המותרים

### בעיה: "TLS/SSL error"

**סיבות אפשריות**:

1. **TLS לא מופעל**
   - **פתרון**: ודא ש-"Use TLS" מופעל בממשק

2. **פורט שגוי**
   - **פתרון**: Gmail דורש פורט 587 עם TLS או 465 עם SSL

---

## הגדרות מומלצות ל-Google Workspace

- **Host**: `smtp.gmail.com`
- **Port**: `587` (עם TLS) או `465` (עם SSL)
- **Use TLS**: ✅ מופעל (אם Port 587)
- **User**: כתובת האימייל המלאה שלך (לדוגמה: `admin@mezoo.co`)
- **Password**: App Password (16 תווים, ללא רווחים)
- **From Email**: אותה כתובת כמו User
- **From Name**: `TikTrack` (או שם אחר)

---

## אבטחה

### ⚠️ חשוב מאוד

1. **אל תשתף את ה-App Password** עם אחרים
2. **אל תכניס את ה-App Password** בקוד או בקובצי קונפיגורציה
3. **הסיסמה נשמרת מוצפנת** במסד הנתונים
4. **אם הסיסמה נחשפה**, צור App Password חדש מיד

### מחזור App Passwords

מומלץ להחליף App Passwords מדי פעם:

1. צור App Password חדש
2. עדכן את הסיסמה ב-TikTrack
3. מחק את ה-App Password הישן מ-Google

---

## קישורים שימושיים

- [Google Admin Console](https://admin.google.com)
- [Google Account Security](https://myaccount.google.com/security)
- [2-Step Verification](https://myaccount.google.com/signinoptions/two-step-verification)
- [App Passwords](https://myaccount.google.com/apppasswords)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Google Workspace SMTP Relay](https://support.google.com/a/answer/176600)

---

## סיכום - צעדים לביצוע

### למשתמש רגיל

1. ✅ הפעל 2-Step Verification
2. ✅ צור App Password
3. ✅ עדכן את הסיסמה ב-TikTrack (ללא רווחים)
4. ✅ בדוק את החיבור

### למנהל מערכת (חשוב במיוחד לחשבון עסקי!)

1. ✅ בדוק הגדרות Gmail ב-Admin Console
2. ✅ בדוק API Controls והגבלות גישה
3. ✅ ודא ש-2-Step Verification מופעל למשתמשים
4. ✅ בדוק הגבלות IP (אם יש)
5. ✅ אם App Password לא עובד, נסה להגדיר SMTP Relay

**⚠️ חשוב**: בחשבון Google Workspace עסקי, ייתכן שצריך לבצע הגדרות במנהל המערכת לפני שהחיבור יעבוד!

**לאחר ביצוע השלבים, החיבור אמור לעבוד!** 🎉

---

**עדכון אחרון**: 28 בינואר 2025  
**גרסה**: 1.0.0

