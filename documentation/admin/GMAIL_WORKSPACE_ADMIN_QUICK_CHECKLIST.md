# רשימת בדיקה מהירה - מנהל מערכת Google Workspace
## Google Workspace Admin Quick Checklist

**תאריך יצירה**: 28 בינואר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team

---

## ⚡ רשימת בדיקה מהירה

### 1. בדיקת 2-Step Verification

- [ ] היכנס ל-[Google Admin Console](https://admin.google.com)
- [ ] עבור ל-**Security** → **Access and data control** → **2-Step Verification**
- [ ] ודא ש-2-Step Verification מופעל למשתמשים
- [ ] אם לא, הפעל: "Allow users to turn on 2-Step Verification"

### 2. בדיקת API Controls

- [ ] ב-Admin Console, עבור ל-**Security** → **Access and data control** → **API controls**
- [ ] בדוק אם יש "Less secure app access" - אם כן, **כבה אותו** (Google הפסיקה תמיכה)
- [ ] בדוק אם יש "IP whitelist" - אם כן, הוסף את כתובת ה-IP של השרת

### 3. בדיקת הגדרות Gmail

- [ ] ב-Admin Console, עבור ל-**Apps** → **Google Workspace** → **Gmail**
- [ ] ודא ש-Gmail מופעל למשתמשים
- [ ] בדוק אם יש הגבלות על שליחת מייל

### 4. בדיקת SMTP Relay (אם App Password לא עובד)

- [ ] ב-Admin Console, עבור ל-**Apps** → **Google Workspace** → **Gmail**
- [ ] גלול ל-**Routing** → **SMTP relay service**
- [ ] אם App Password לא עובד, הגדר SMTP Relay (ראה מדריך מלא)

---

## 🔍 איך למצוא את כתובת ה-IP של השרת?

### אם השרת רץ על המחשב המקומי:
- כתובת IP: `127.0.0.1` או `localhost`
- **אבל**: אם זה שרת מקומי, כנראה שלא צריך להוסיף ל-IP whitelist

### אם השרת רץ על שרת מרוחק:
1. היכנס לשרת
2. הרץ: `curl ifconfig.me` או `curl ipinfo.io/ip`
3. העתק את כתובת ה-IP

---

## ✅ לאחר ביצוע הבדיקות

1. המשתמש צריך:
   - להפעיל 2-Step Verification בחשבון שלו
   - ליצור App Password
   - לעדכן את הסיסמה ב-TikTrack

2. בדוק את החיבור:
   - פתח `http://localhost:8080/user-profile.html`
   - סקשן "הגדרות SMTP"
   - לחץ "בדיקת חיבור"

---

## 📖 מדריכים נוספים

- **מדריך מלא**: [GMAIL_WORKSPACE_SMTP_SETUP.md](./GMAIL_WORKSPACE_SMTP_SETUP.md)
- **מדריך למשתמש**: [GMAIL_APP_PASSWORD_SETUP.md](./GMAIL_APP_PASSWORD_SETUP.md)

---

**עדכון אחרון**: 28 בינואר 2025  
**גרסה**: 1.0.0

