# ארכיטקטורת SMTP - TikTrack

## SMTP Architecture

**תאריך יצירה**: 28 בינואר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team

---

## 🎯 עקרונות ארכיטקטורה

### 1. **הפרדה מלאה בין קוד להגדרות**

- ✅ כל הגדרות SMTP נשמרות במסד הנתונים (SystemSettings)
- ✅ אין hardcoded values בקוד (חוץ מ-defaults לפיתוח)
- ✅ תמיכה ב-fallback למשתני סביבה (לפיתוח בלבד)

### 2. **תמיכה בכל שירותי SMTP**

- ✅ Gmail / Google Workspace
- ✅ SendGrid
- ✅ Mailgun
- ✅ Mailtrap
- ✅ AWS SES
- ✅ כל שירות SMTP סטנדרטי אחר

### 3. **החלפה קלה ללא שינויי קוד**

- ✅ החלפת שרת SMTP = עדכון הגדרות במסד הנתונים בלבד
- ✅ אין צורך בשינויי קוד
- ✅ אין צורך ב-restart (הגדרות נטענות בכל קריאה)

---

## 🏗️ מבנה הארכיטקטורה

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (UI)                         │
│  user_profile.html → user-profile-smtp.js               │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ API Calls
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API Layer                           │
│  /api/system-settings/smtp (GET/POST)                   │
│  /api/system-settings/smtp/test                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Uses
                     ▼
┌─────────────────────────────────────────────────────────┐
│          SMTPSettingsService                            │
│  - get_smtp_settings()                                  │
│  - update_smtp_settings()                               │
│  - encrypt_password() / decrypt_password()              │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Stores in
                     ▼
┌─────────────────────────────────────────────────────────┐
│          SystemSettings (Database)                      │
│  - smtp_host                                            │
│  - smtp_port                                            │
│  - smtp_user                                            │
│  - smtp_password (encrypted)                           │
│  - smtp_from_email                                      │
│  - smtp_from_name                                       │
│  - smtp_use_tls                                         │
│  - smtp_enabled                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Loaded by
                     ▼
┌─────────────────────────────────────────────────────────┐
│              EmailService                               │
│  - load_settings_from_db()                              │
│  - send_email()                                         │
│  - send_password_reset_email()                         │
│  - test_connection()                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Uses
                     ▼
┌─────────────────────────────────────────────────────────┐
│          Python smtplib (Standard Library)              │
│  - SMTP connection                                      │
│  - TLS/SSL support                                      │
│  - Authentication                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 רכיבי המערכת

### 1. EmailService (`Backend/services/email_service.py`)

**תפקיד**: שירות מרכזי לשליחת מיילים

**תכונות**:

- טעינת הגדרות מ-DB או משתני סביבה
- שליחת מיילים דרך SMTP
- תמיכה ב-HTML ו-plain text
- לוגינג למסד הנתונים
- בדיקת חיבור SMTP

**שימוש**:

```python
from services.email_service import EmailService
from config.database import SessionLocal

db = SessionLocal()
email_service = EmailService()
email_service.load_settings_from_db(db)

# שליחת מייל
result = email_service.send_email(
    to_email="user@example.com",
    subject="נושא",
    body_html="<p>תוכן</p>"
)
```

### 2. SMTPSettingsService (`Backend/services/smtp_settings_service.py`)

**תפקיד**: ניהול הגדרות SMTP במסד הנתונים

**תכונות**:

- קריאת הגדרות מ-DB
- עדכון הגדרות ב-DB
- הצפנת/פענוח סיסמאות
- ולידציה של הגדרות

**שימוש**:

```python
from services.smtp_settings_service import SMTPSettingsService
from config.database import SessionLocal

db = SessionLocal()
smtp_service = SMTPSettingsService()

# קריאת הגדרות
settings = smtp_service.get_smtp_settings(db)

# עדכון הגדרות
result = smtp_service.update_smtp_settings(
    db_session=db,
    settings={
        'smtp_host': 'smtp.sendgrid.net',
        'smtp_port': 587,
        'smtp_user': 'apikey',
        'smtp_password': 'your_api_key',
        'smtp_from_email': 'noreply@example.com',
        'smtp_from_name': 'TikTrack',
        'smtp_use_tls': True,
        'smtp_enabled': True
    }
)
```

### 3. SystemSettings (Database)

**תפקיד**: אחסון הגדרות SMTP במסד הנתונים

**טבלאות**:

- `system_setting_groups` - קבוצות הגדרות
- `system_setting_types` - סוגי הגדרות
- `system_settings` - ערכי הגדרות

**קבוצה**: `smtp_settings`

**הגדרות**:

- `smtp_host` - שרת SMTP
- `smtp_port` - פורט SMTP
- `smtp_user` - שם משתמש
- `smtp_password` - סיסמה (מוצפנת)
- `smtp_from_email` - כתובת שולח
- `smtp_from_name` - שם שולח
- `smtp_use_tls` - שימוש ב-TLS
- `smtp_enabled` - מופעל/כבוי

### 4. Frontend UI (`trading-ui/user_profile.html` + `user-profile-smtp.js`)

**תפקיד**: ממשק ניהול הגדרות SMTP

**תכונות**:

- טעינת הגדרות מה-API
- עדכון הגדרות דרך ה-API
- בדיקת חיבור SMTP
- שליחת מייל בדיקה

---

## 🔄 תהליך החלפת שרת SMTP

### שלב 1: עדכון הגדרות במסד הנתונים

**דרך הממשק** (מומלץ):

1. פתח `http://localhost:8080/user_profile`
2. גלול לסקשן "הגדרות SMTP"
3. עדכן את הפרטים:
   - Host: `smtp.sendgrid.net` (לדוגמה)
   - Port: `587`
   - User: `apikey` (לדוגמה)
   - Password: ה-API Key שלך
   - From Email: כתובת שבדקת
   - From Name: `TikTrack`
   - Use TLS: ✅ מופעל
4. לחץ "עדכן הגדרות SMTP"

**דרך API**:

```python
POST /api/system-settings/smtp
{
    "smtp_host": "smtp.sendgrid.net",
    "smtp_port": 587,
    "smtp_user": "apikey",
    "smtp_password": "your_api_key",
    "smtp_from_email": "noreply@example.com",
    "smtp_from_name": "TikTrack",
    "smtp_use_tls": true,
    "smtp_enabled": true
}
```

### שלב 2: בדיקת החיבור

1. לחץ "בדיקת חיבור" בממשק
2. או דרך API: `POST /api/system-settings/smtp/test`

### שלב 3: שימוש אוטומטי

**המערכת תטען את ההגדרות החדשות אוטומטית** בכל קריאה ל-EmailService!

```python
# אין צורך בשינויי קוד!
email_service = EmailService()
email_service.load_settings_from_db(db)  # טוען את ההגדרות החדשות
email_service.send_email(...)  # משתמש בהגדרות החדשות
```

---

## 🔐 אבטחה

### הצפנת סיסמאות

**איך זה עובד**:

1. סיסמה נשמרת מוצפנת במסד הנתונים (Fernet encryption)
2. מפתח הצפנה: `TIKTRACK_SMTP_ENCRYPTION_KEY` (משתנה סביבה)
3. פענוח מתבצע רק בעת שימוש (ב-EmailService)

**הגדרת מפתח הצפנה**:

```bash
export TIKTRACK_SMTP_ENCRYPTION_KEY="your_base64_encoded_key_here"
```

**יצירת מפתח**:

```python
from cryptography.fernet import Fernet
key = Fernet.generate_key()
print(key.decode())  # העתק את זה למשתנה סביבה
```

### הגבלת גישה

- רק משתמשים מורשים יכולים לעדכן הגדרות SMTP
- סיסמאות לא מוחזרות ב-API (רק `***`)
- לוגינג של כל ניסיונות השליחה

---

## 📋 דוגמאות להגדרות שירותים שונים

### SendGrid

```json
{
    "smtp_host": "smtp.sendgrid.net",
    "smtp_port": 587,
    "smtp_user": "apikey",
    "smtp_password": "SG.your_api_key_here",
    "smtp_from_email": "noreply@yourdomain.com",
    "smtp_from_name": "TikTrack",
    "smtp_use_tls": true,
    "smtp_enabled": true
}
```

### Mailgun

```json
{
    "smtp_host": "smtp.mailgun.org",
    "smtp_port": 587,
    "smtp_user": "postmaster@yourdomain.mailgun.org",
    "smtp_password": "your_mailgun_password",
    "smtp_from_email": "noreply@yourdomain.com",
    "smtp_from_name": "TikTrack",
    "smtp_use_tls": true,
    "smtp_enabled": true
}
```

### Gmail

```json
{
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_user": "your_email@gmail.com",
    "smtp_password": "your_app_password",
    "smtp_from_email": "your_email@gmail.com",
    "smtp_from_name": "TikTrack",
    "smtp_use_tls": true,
    "smtp_enabled": true
}
```

### Mailtrap (לבדיקות)

```json
{
    "smtp_host": "sandbox.smtp.mailtrap.io",
    "smtp_port": 587,
    "smtp_user": "your_mailtrap_username",
    "smtp_password": "your_mailtrap_password",
    "smtp_from_email": "test@example.com",
    "smtp_from_name": "TikTrack",
    "smtp_use_tls": true,
    "smtp_enabled": true
}
```

---

## 🧪 בדיקות

### בדיקת החלפת שרת SMTP

1. **הגדר SendGrid** דרך הממשק
2. **בדוק חיבור** - אמור לעבוד
3. **שלח מייל בדיקה** - אמור להגיע
4. **החלף ל-Mailgun** דרך הממשק
5. **בדוק חיבור** - אמור לעבוד
6. **שלח מייל בדיקה** - אמור להגיע

**✅ אין צורך בשינויי קוד!**

---

## 📖 מדריכים נוספים

- **מדריך שימוש**: [SMTP_SERVICE_GUIDE.md](./SMTP_SERVICE_GUIDE.md)
- **מדריך מנהל מערכת**: [../admin/SMTP_MANAGEMENT_GUIDE.md](../admin/SMTP_MANAGEMENT_GUIDE.md)
- **פתרונות חלופיים**: [../admin/SMTP_ALTERNATIVES_DEVELOPMENT.md](../admin/SMTP_ALTERNATIVES_DEVELOPMENT.md)
- **הגדרת SendGrid**: [../admin/SMTP_ALTERNATIVES_DEVELOPMENT.md#1-sendgrid-מומלץ-ביותר](../admin/SMTP_ALTERNATIVES_DEVELOPMENT.md#1-sendgrid-מומלץ-ביותר)

---

## ✅ סיכום

### יתרונות הארכיטקטורה

1. ✅ **החלפה קלה** - רק עדכון הגדרות במסד הנתונים
2. ✅ **ללא שינויי קוד** - הקוד נשאר זהה
3. ✅ **תמיכה בכל שירות** - כל שירות SMTP סטנדרטי
4. ✅ **אבטחה** - סיסמאות מוצפנות
5. ✅ **גמישות** - תמיכה ב-fallback למשתני סביבה
6. ✅ **לוגינג** - כל ניסיונות השליחה נרשמים

### עקרונות מפתח

- **Configuration over Code** - הגדרות במסד הנתונים, לא בקוד
- **Separation of Concerns** - הפרדה בין שירותי הגדרות לשליחת מיילים
- **Security First** - הצפנת סיסמאות ולוגינג
- **Flexibility** - תמיכה בכל שירות SMTP סטנדרטי

---

**עדכון אחרון**: 28 בינואר 2025  
**גרסה**: 1.0.0
