# מדריך הגדרת Mailjet - TikTrack

## Mailjet Setup Guide

**תאריך יצירה**: 28 בינואר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team

---

## 📋 סקירה כללית

Mailjet הוא שירות SMTP לשליחת אימיילים. מדריך זה מסביר כיצד להגדיר את Mailjet ב-TikTrack.

**קישור לדוקומנטציה**: https://dev.mailjet.com/email/guides/#event-api-real-time-notifications

---

## 🔑 שלב 1: יצירת מפתחות API

### א. גישה ל-API Keys

1. היכנס ל-Mailjet: https://app.mailjet.com
2. לחץ על **"Account"** (או שם המשתמש שלך בפינה הימנית העליונה)
3. בחר **"API Keys Management"** (או **"API"** → **"API Key Management"**)

### ב. יצירת API Key חדש

1. לחץ על **"Create API Key"** (או **"Add API Key"**)
2. תן שם: `TikTrack SMTP`
3. בחר הרשאות:
   - **Mail Send**: Full Access
   - (אופציונלי) **Statistics**: Read Only
4. לחץ **"Create"** (או **"Save"**)

### ג. העתקת המפתחות

לאחר יצירת המפתח, תראה שני מפתחות:

1. **API Key** (Username) - מפתח ארוך (32 תווים hex)
   - לדוגמה: `c1a3ffeae18f2b8a6ef523f9c78a3ee3`
   - זה ישמש כ-**Username** ב-SMTP

2. **Secret Key** (Password) - מפתח ארוך (32 תווים hex)
   - לדוגמה: `d4b38137c8046e61e2e61c462585a749`
   - זה ישמש כ-**Password** ב-SMTP

**⚠️ חשוב**: העתק את שני המפתחות מיד! ה-Secret Key מוצג פעם אחת בלבד.

---

## 📧 שלב 2: אימות כתובת אימייל

### א. גישה ל-Sender Addresses

1. ב-Mailjet Dashboard, לחץ על **"Sender & Domains"**
2. בחר **"Sender Addresses"** (או **"Domains"**)

### ב. הוספת כתובת אימייל

1. לחץ על **"Add Sender Address"** (או **"Create"**)
2. הזן:
   - **Email Address**: כתובת האימייל שלך
     - לדוגמה: `nimrod@mezoo.co`
   - **Name**: `TikTrack` (או שם אחר)
3. לחץ **"Add"** (או **"Create"**)

### ג. אימות

1. **בדוק את תיבת הדואר** של הכתובת שהזנת
2. פתח את המייל מ-Mailjet
3. לחץ על הקישור לאימות
4. חזור לממשק Mailjet - הכתובת אמורה להופיע כ-**"Verified"** ✅

**⚠️ חשוב**: רק לאחר אימות הכתובת תוכל לשלוח מיילים!

---

## ⚙️ שלב 3: הגדרה ב-TikTrack

### דרך הסקריפט (מומלץ)

```bash
python3 Backend/scripts/set_mailjet_api_keys.py \
  "c1a3ffeae18f2b8a6ef523f9c78a3ee3" \
  "d4b38137c8046e61e2e61c462585a749" \
  "nimrod@mezoo.co"
```

### דרך הממשק

1. פתח `http://localhost:8080/user-profile.html`
2. גלול לסקשן **"הגדרות SMTP"**
3. הכנס את הפרטים הבאים:
   - **Host**: `in-v3.mailjet.com`
   - **Port**: `587`
   - **User**: ה-API Key שלך (לדוגמה: `c1a3ffeae18f2b8a6ef523f9c78a3ee3`)
   - **Password**: ה-Secret Key שלך (לדוגמה: `d4b38137c8046e61e2e61c462585a749`)
   - **From Email**: כתובת האימייל שאימתת ב-Mailjet
   - **From Name**: `TikTrack`
   - **Use TLS**: ✅ מופעל
   - **Enabled**: ✅ מופעל
4. לחץ על **"עדכן הגדרות SMTP"**
5. לחץ על **"בדיקת חיבור"** לוודא שהכל עובד
6. לחץ על **"שליחת מייל בדיקה"** לבדיקה

---

## 🔧 הגדרות SMTP של Mailjet

| הגדרה | ערך |
|------|-----|
| **Host** | `in-v3.mailjet.com` |
| **Port** | `587` (TLS) או `465` (SSL) |
| **Username** | API Key (32 תווים hex) |
| **Password** | Secret Key (32 תווים hex) |
| **Encryption** | TLS (פורט 587) או SSL (פורט 465) |

---

## ✅ בדיקות

### בדיקת חיבור

```bash
python3 Backend/scripts/test_mailjet_connection.py
```

### בדיקה דרך הממשק

1. פתח `http://localhost:8080/user-profile.html`
2. גלול לסקשן **"הגדרות SMTP"**
3. לחץ **"בדיקת חיבור"**
4. אם הכל תקין, תראה: ✅ **"חיבור SMTP תקין!"**

### שליחת מייל בדיקה

1. בממשק SMTP, הזן כתובת אימייל ב-**"Test Email"**
2. לחץ **"שליחת מייל בדיקה"**
3. בדוק את תיבת הדואר - אמור להגיע מייל מ-TikTrack

---

## 🔍 פתרון בעיות

### שגיאה: "Authentication failed"

**פתרון**:

1. ודא שה-API Key נכון (32 תווים hex)
2. ודא שה-Secret Key נכון (32 תווים hex)
3. ודא שהעתקת את המפתחות במלואם (ללא רווחים)

### שגיאה: "Connection unexpectedly closed"

**פתרון**:

1. ודא שכתובת האימייל מאומתת ב-Mailjet
2. בדוק את חיבור האינטרנט
3. נסה פורט 465 עם SSL במקום 587 עם TLS

### מיילים לא מגיעים

**פתרון**:

1. ודא שכתובת האימייל מאומתת ב-Mailjet
2. בדוק את תיקיית הספאם
3. בדוק את לוגי Mailjet ב-Dashboard → Activity

---

## 📚 משאבים נוספים

- **דוקומנטציה רשמית**: https://dev.mailjet.com/email/guides/
- **SMTP Settings**: https://documentation.mailjet.com/hc/en-us/articles/360043229473-How-can-I-configure-my-SMTP-parameters
- **API Keys**: https://documentation.mailjet.com/hc/en-us/articles/360043225693-What-is-an-API-key

---

**עדכון אחרון**: 28 בינואר 2025  
**גרסה**: 1.0.0

