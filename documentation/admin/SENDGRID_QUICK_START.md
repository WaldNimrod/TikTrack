# מדריך מהיר - SendGrid (אחרי יצירת חשבון)

## SendGrid Quick Start Guide

**תאריך יצירה**: 28 בינואר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team

---

## 🎯 אתה בממשק SendGrid - מה הלאה

אם כבר יצרת חשבון ונכנסת לממשק, בצע את השלבים הבאים:

---

## ✅ שלב 1: אימות כתובת אימייל (Sender Verification)

**זה השלב הראשון והחשוב ביותר!**

### א. גישה ל-Sender Authentication

1. בממשק SendGrid, לחץ על **"Settings"** בתפריט השמאלי
2. לחץ על **"Sender Authentication"**
3. לחץ על **"Verify a Single Sender"** (כפתור כחול)

### ב. מילוי פרטי השולח

מלא את הטופס:

- **From Email Address**: כתובת האימייל שלך
  - לדוגמה: `admin@mezoo.co` או `noreply@mezoo.co`
  - ⚠️ **חשוב**: זה הכתובת שתשתמש בה ב-TikTrack כ-"From Email"
  
- **From Name**: `TikTrack` (או שם אחר)

- **Reply To**: אותה כתובת כמו "From Email Address"

- **Company Address**: כתובת החברה שלך

- **Website URL**: כתובת האתר שלך (או `http://localhost:8080` לפיתוח)

- **Company Name**: שם החברה (אופציונלי)

### ג. אימות

1. לחץ **"Create"**
2. **בדוק את תיבת הדואר** של הכתובת שהזנת
3. פתח את המייל מ-SendGrid
4. לחץ על הקישור לאימות
5. חזור לממשק SendGrid - הכתובת אמורה להופיע כ-**"Verified"** ✅

**⚠️ חשוב**: רק לאחר אימות הכתובת תוכל לשלוח מיילים!

---

## 🔑 שלב 2: יצירת API Key

### א. גישה ל-API Keys

1. בממשק SendGrid, לחץ על **"Settings"** בתפריט השמאלי
2. לחץ על **"API Keys"**

### ב. יצירת API Key חדש

1. לחץ על **"Create API Key"** (כפתור כחול בצד ימין למעלה)

2. **תן שם למפתח**:
   - לדוגמה: `TikTrack SMTP` או `TikTrack Development`

3. **בחר הרשאות**:
   - **מומלץ**: בחר **"Restricted Access"**
   - תחת "Mail Send", בחר **"Full Access"**
   - (או בחר "Full Access" אם אתה רוצה הרשאות מלאות)

4. לחץ **"Create & View"**

5. **⚠️ העתק את ה-API Key מיד!**
   - ה-API Key ייראה כך: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **זה יוצג פעם אחת בלבד!** אם תסגור את החלון, תצטרך ליצור מפתח חדש
   - העתק את כל המפתח (החל מ-`SG.` ועד הסוף)

6. **שמור את המפתח במקום בטוח** (תצטרך אותו בהמשך)

---

## ⚙️ שלב 3: הגדרה ב-TikTrack

### א. פתיחת ממשק SMTP

1. פתח בדפדפן: `http://localhost:8080/user_profile`
2. גלול למטה לסקשן **"הגדרות SMTP"**
3. לחץ על **"הצג/הסתר"** אם הסקשן סגור

### ב. מילוי הפרטים

הכנס את הפרטים הבאים:

#### Host (שרת SMTP)

```
smtp.sendgrid.net
```

#### Port (פורט)

```
587
```

#### User (שם משתמש)

```
apikey
```

⚠️ **חשוב מאוד**: זה המילה המילולית `apikey` (אותיות קטנות), **לא** ה-API Key שלך!

#### Password (סיסמה)

```
SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **זה ה-API Key** שהעתקת בשלב 2 (החל מ-`SG.`)

#### From Email (כתובת שולח)

```
admin@mezoo.co
```

⚠️ **זה הכתובת שאימתת** בשלב 1 (Sender Verification)

#### From Name (שם שולח)

```
TikTrack
```

#### Use TLS (שימוש ב-TLS)

✅ **סמן** (מופעל)

#### Enabled (מופעל)

✅ **סמן** (מופעל)

### ג. שמירה

1. לחץ על **"עדכן הגדרות SMTP"**
2. חכה להודעה: "הגדרות SMTP עודכנו בהצלחה"

---

## 🧪 שלב 4: בדיקת החיבור

1. לחץ על **"בדיקת חיבור"**
2. חכה כמה שניות
3. אם הכל תקין, תראה: **"חיבור SMTP תקין"** ✅
4. אם יש שגיאה, ראה "פתרון בעיות" למטה

---

## 📧 שלב 5: שליחת מייל בדיקה

1. בממשק SMTP, מצא את השדה **"כתובת אימייל לבדיקה"**
2. הכנס כתובת אימייל שלך (או כתובת אחרת)
3. לחץ על **"שליחת מייל בדיקה"**
4. חכה כמה שניות
5. **בדוק את תיבת הדואר** (וגם תיקיית הספאם)
6. אם המייל הגיע - הכל עובד! 🎉

---

## 🔧 פתרון בעיות

### בעיה: "SMTP authentication failed"

**סיבות אפשריות**:

1. **User שגוי**
   - ❌ שגוי: `SG.xxxxx` (זה ה-API Key, לא ה-User!)
   - ✅ נכון: `apikey` (המילה המילולית)

2. **Password שגוי**
   - ❌ שגוי: `apikey` (זה ה-User, לא ה-Password!)
   - ✅ נכון: `SG.xxxxx...` (ה-API Key המלא)

**פתרון**:

- ודא שה-User הוא בדיוק `apikey` (אותיות קטנות, ללא רווחים)
- ודא שה-Password הוא ה-API Key המלא (החל מ-`SG.`)

### בעיה: "Sender not verified" או "Email not sent"

**סיבה**: כתובת האימייל לא אומתה ב-SendGrid

**פתרון**:

1. חזור ל-SendGrid → Settings → Sender Authentication
2. ודא שכתובת האימייל מופיעה כ-**"Verified"** ✅
3. אם לא, אמת אותה מחדש (ראה שלב 1)

### בעיה: "Connection timeout"

**פתרון**:

- בדוק חיבור לאינטרנט
- בדוק הגדרות חומת אש
- נסה שוב

---

## 📋 סיכום מהיר

1. ✅ **אימות כתובת אימייל** ב-SendGrid (Settings → Sender Authentication)
2. ✅ **יצירת API Key** ב-SendGrid (Settings → API Keys)
3. ✅ **העתקת API Key** ושמירה במקום בטוח
4. ✅ **עדכון הגדרות ב-TikTrack**:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - User: `apikey`
   - Password: ה-API Key שלך
   - From Email: הכתובת שאימתת
5. ✅ **בדיקת חיבור**
6. ✅ **שליחת מייל בדיקה**

---

## 🎉 אחרי שהכל עובד

- ✅ תוכל לשלוח מיילים דרך TikTrack
- ✅ כל המיילים יישמרו ב-Email Logs
- ✅ תוכל לעקוב אחר סטטיסטיקות ב-SendGrid Dashboard

---

## 📖 מדריכים נוספים

- **מדריך מפורט**: [SENDGRID_SETUP_GUIDE.md](./SENDGRID_SETUP_GUIDE.md)
- **ארכיטקטורת SMTP**: [../backend/SMTP_ARCHITECTURE.md](../backend/SMTP_ARCHITECTURE.md)
- **פתרון בעיות**: [SENDGRID_SETUP_GUIDE.md#פתרון-בעיות](./SENDGRID_SETUP_GUIDE.md#פתרון-בעיות)

---

**עדכון אחרון**: 28 בינואר 2025  
**גרסה**: 1.0.0

