# הסבר על API Keys של SendGrid
## SendGrid API Keys Explained

**תאריך יצירה**: 28 בינואר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team

---

## 🔑 שני סוגי מפתחות ב-SendGrid

כשאתה יוצר API Key ב-SendGrid, אתה מקבל שני מפתחות:

### 1. API Key (לשימוש ב-SMTP) ✅

**מה זה**: המפתח הראשי לשימוש ב-SMTP

**איפה להשתמש**: 
- ב-TikTrack → הגדרות SMTP → **Password**
- זה המפתח שהמערכת תשתמש בו לשליחת מיילים

**דוגמה**: `a08ab9dfe235af851c775ff58da75a48`

### 2. Secret Key (ל-API calls ישירים) ⚠️

**מה זה**: מפתח נוסף ל-API calls ישירים (לא ל-SMTP)

**איפה להשתמש**: 
- **לא נדרש** לשימוש ב-SMTP דרך TikTrack
- משמש רק אם אתה עושה API calls ישירים ל-SendGrid

**דוגמה**: `99e9ddbc09f48699496acb792ec5b17c`

---

## ✅ מה צריך להכניס ב-TikTrack?

### הגדרות SMTP ב-TikTrack:

- **Host**: `smtp.sendgrid.net`
- **Port**: `587`
- **User**: `apikey` (המילה המילולית!)
- **Password**: ה-**API Key** שלך (לא ה-Secret Key!)
  - לדוגמה: `a08ab9dfe235af851c775ff58da75a48`
- **From Email**: הכתובת שאימתת ב-SendGrid
- **From Name**: `TikTrack`
- **Use TLS**: ✅ מופעל

---

## ⚠️ חשוב מאוד

1. **API Key** → זה מה שצריך להכניס ב-**Password** ב-TikTrack
2. **Secret Key** → **לא צריך** להכניס ב-TikTrack (לא משמש ל-SMTP)
3. **User** → תמיד `apikey` (המילה המילולית, לא המפתח!)

---

## 🔐 אבטחה

- **שמור את שני המפתחות** במקום בטוח
- **API Key** נשמר מוצפן במסד הנתונים
- **Secret Key** לא נדרש ל-SMTP, אבל שמור אותו למקרה שתצטרך ל-API calls בעתיד

---

## 📋 סיכום

| מפתח | שימוש | נדרש ל-SMTP? |
|------|------|-------------|
| **API Key** | SMTP (Password ב-TikTrack) | ✅ כן |
| **Secret Key** | API calls ישירים | ❌ לא |

**לשימוש ב-TikTrack, אתה צריך רק את ה-API Key!**

---

**עדכון אחרון**: 28 בינואר 2025  
**גרסה**: 1.0.0

