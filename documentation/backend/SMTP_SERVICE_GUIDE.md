# מדריך שירות SMTP - TikTrack
## SMTP Service Guide

**תאריך יצירה**: 28 בינואר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team

---

## תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה ומבנה](#ארכיטקטורה-ומבנה)
3. [הגדרת SMTP במערכת](#הגדרת-smtp-במערכת)
4. [שימוש ב-EmailService](#שימוש-ב-emailservice)
5. [יצירת Email Templates](#יצירת-email-templates)
6. [אינטגרציה עם מערכות כלליות](#אינטגרציה-עם-מערכות-כלליות)
7. [בדיקות וטיפול בשגיאות](#בדיקות-וטיפול-בשגיאות)
8. [דוגמאות קוד](#דוגמאות-קוד)
9. [קישורים רלוונטיים](#קישורים-רלוונטיים)

---

## סקירה כללית

שירות SMTP של TikTrack הוא תשתית גמישה לשליחת מגוון הודעות דוא"ל במערכת. השירות תומך ב:

- שליחת מיילים דרך SMTP עם הגדרות גמישות
- מערכת templates למיילים עם header ו-footer קבועים
- תמיכה מלאה ב-RTL ועברית
- אינטגרציה עם מערכת ההגדרות הכלליות (SystemSettings)
- לוגים מפורטים לכל שליחת מייל
- מצב פיתוח (dev mode) לבדיקות ללא שליחה אמיתית

### קבצים עיקריים

- `Backend/services/email_service.py` - שירות המיילים הראשי
- `Backend/services/email_templates.py` - מערכת templates
- `Backend/services/smtp_settings_service.py` - ניהול הגדרות SMTP
- `Backend/models/email_log.py` - מודל לוגים
- `Backend/routes/api/smtp_settings.py` - API endpoints

---

## ארכיטקטורה ומבנה

### מבנה כללי

```
EmailService
├── SMTP Settings (SystemSettings)
├── Email Templates
├── Email Logging
└── API Endpoints
```

### EmailService

השירות הראשי לשליחת מיילים. תומך ב:

- קריאת הגדרות מ-SystemSettings או משתני סביבה (fallback)
- שליחת מיילים דרך SMTP
- בדיקת חיבור לשרת SMTP
- לוגים אוטומטיים לכל שליחה

### Email Templates

מערכת templates אחידה עם:

- **Header קבוע**: לוגו TikTrack + כותרת מערכת
- **Body דינמי**: תוכן המייל לפי סוג
- **Footer קבוע**: פרטי יצירת קשר + זכויות יוצרים
- **RTL מלא**: `dir="rtl"`, `lang="he"`
- **עברית**: כל הטקסטים בעברית

### SMTP Settings Service

ניהול הגדרות SMTP:

- קריאה ושמירה של הגדרות
- הצפנת סיסמאות (Fernet encryption)
- ולידציה של הגדרות
- תמיכה ב-fallback למשתני סביבה

---

## הגדרת SMTP במערכת

### הגדרות במערכת הכלליות

הגדרות SMTP נשמרות במערכת ההגדרות הכלליות (SystemSettings) תחת group `smtp_settings`:

- `smtp_host` - כתובת שרת SMTP (default: "smtp.gmail.com")
- `smtp_port` - פורט SMTP (default: 587)
- `smtp_user` - שם משתמש (default: "admin@mezoo.co")
- `smtp_password` - סיסמה (מוצפנת, default: "Nim027425677!")
- `smtp_from_email` - כתובת שולח (default: "admin@mezoo.co")
- `smtp_from_name` - שם שולח (default: "TikTrack")
- `smtp_use_tls` - שימוש ב-TLS (default: true)
- `smtp_enabled` - הפעלת שירות (default: true)
- `smtp_test_email` - כתובת לבדיקות (default: "")

### הגדרת ברירת מחדל

להגדרת ברירת מחדל, הרץ:

```bash
python3 Backend/scripts/setup_smtp_defaults.py
```

### Fallback למשתני סביבה

אם אין הגדרות במערכת, השירות ישתמש במשתני סביבה:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `SMTP_USE_TLS`
- `TIKTRACK_DEV_MODE` - מצב פיתוח (לוגים בלבד)

---

## שימוש ב-EmailService

### יצירת instance

```python
from services.email_service import EmailService

email_service = EmailService()
```

### טעינת הגדרות מ-DB

```python
from config.database import SessionLocal

db = SessionLocal()
email_service.load_settings_from_db(db)
db.close()
```

### שליחת מייל פשוט

```python
result = email_service.send_email(
    to_email="user@example.com",
    subject="נושא המייל",
    body_html="<p>תוכן HTML</p>",
    body_text="תוכן טקסט"
)

if result['success']:
    print("מייל נשלח בהצלחה")
else:
    print(f"שגיאה: {result['error']}")
```

### שליחת מייל עם template

```python
from services.email_templates import render_template

# עיבוד template
html_content = render_template(
    'password_reset',
    {
        'username': 'user123',
        'reset_url': 'http://localhost:8080/reset-password.html?token=abc123'
    }
)

result = email_service.send_email(
    to_email="user@example.com",
    subject="איפוס סיסמה - TikTrack",
    body_html=html_content
)
```

### בדיקת חיבור SMTP

```python
result = email_service.test_connection(db_session=db)

if result['success']:
    print("חיבור SMTP תקין")
else:
    print(f"שגיאת חיבור: {result['error']}")
```

---

## יצירת Email Templates

### מבנה Template

כל template חייב לכלול:

1. **Header**: לוגו + כותרת מערכת
2. **Body**: תוכן דינמי
3. **Footer**: פרטי יצירת קשר + זכויות יוצרים

### שימוש ב-Template System

```python
from services.email_templates import (
    get_email_header,
    get_email_footer,
    wrap_email_content
)

# יצירת header
header = get_email_header(logo_url="http://localhost:8080/images/logo.svg")

# יצירת footer
footer = get_email_footer(contact_info={
    'email': 'support@tiktrack.com',
    'phone': '+972-XX-XXX-XXXX'
})

# עטיפת תוכן
body_html = """
<p>שלום {username},</p>
<p>קיבלנו בקשה לאיפוס הסיסמה שלך.</p>
""".format(username="user123")

full_html = wrap_email_content(
    body_html,
    logo_url="http://localhost:8080/images/logo.svg",
    contact_info={'email': 'support@tiktrack.com'}
)
```

### Templates זמינים

- `password_reset` - איפוס סיסמה
- `system_notification` - התראות מערכת
- `business_notification` - התראות עסקיות
- `general` - template כללי

### יצירת Template חדש

ראה: [EMAIL_TEMPLATES_GUIDE.md](EMAIL_TEMPLATES_GUIDE.md)

---

## אינטגרציה עם מערכות כלליות

### Logger Service

**Backend**: שימוש ב-`logging` module של Python

```python
import logging

logger = logging.getLogger(__name__)

logger.info("📧 Email sent successfully", extra={
    'recipient': to_email,
    'subject': subject,
    'status': 'success'
})

logger.error("❌ Failed to send email", extra={
    'recipient': to_email,
    'error': str(e)
})
```

**Frontend**: שימוש ב-`window.Logger`

```javascript
window.Logger.info('SMTP settings loaded', {
    page: 'user-profile',
    smtp_host: settings.smtp_host
});
```

### SystemSettings

קריאה ושמירה של הגדרות:

```python
from services.smtp_settings_service import SMTPSettingsService

service = SMTPSettingsService()
settings = service.get_smtp_settings(db_session)
service.update_smtp_settings(db_session, new_settings, updated_by=user_id)
```

### UnifiedCacheManager (Frontend)

מטמון הגדרות SMTP:

```javascript
const cacheKey = 'smtp_settings';
const cached = await window.UnifiedCacheManager.get(cacheKey, {
    layer: 'localStorage',
    ttl: 300000 // 5 minutes
});
```

### CacheSyncManager (Frontend)

סנכרון מטמון לאחר עדכון:

```javascript
await window.CacheSyncManager.invalidateByAction('smtp-settings-updated');
```

### NotificationSystem (Frontend)

הצגת התראות:

```javascript
window.NotificationSystem.showSuccess('הגדרות SMTP עודכנו בהצלחה', 'system');
window.NotificationSystem.showError('שגיאה בעדכון הגדרות SMTP', 'system');
```

---

## בדיקות וטיפול בשגיאות

### בדיקת חיבור

```python
result = email_service.test_connection(db_session=db)

if not result['success']:
    # טיפול בשגיאה
    error_message = result.get('error', 'Unknown error')
    logger.error(f"SMTP connection failed: {error_message}")
```

### ולידציה של הגדרות

```python
from services.smtp_settings_service import SMTPSettingsService

service = SMTPSettingsService()
validation = service.validate_smtp_settings(settings)

if not validation['valid']:
    errors = validation.get('errors', [])
    for error in errors:
        logger.error(f"Validation error: {error}")
```

### טיפול בשגיאות שליחה

```python
try:
    result = email_service.send_email(...)
    if not result['success']:
        # לוגים אוטומטיים נשמרים ב-email_log
        logger.error(f"Email send failed: {result.get('error')}")
except Exception as e:
    logger.critical(f"Critical error in email service: {e}", exc_info=True)
```

### מצב פיתוח (Dev Mode)

במצב פיתוח (`TIKTRACK_DEV_MODE=true`), מיילים לא נשלחים אלא רק נרשמים בלוגים:

```python
# במצב dev, המייל יירשם בלוג בלבד
result = email_service.send_email(...)
# result['message'] = 'Email logged (dev mode)'
```

---

## דוגמאות קוד

### דוגמה מלאה: שליחת מייל איפוס סיסמה

```python
from services.email_service import EmailService
from services.email_templates import render_template
from config.database import SessionLocal
import logging

logger = logging.getLogger(__name__)

def send_password_reset_email(user_email, username, reset_token, reset_url):
    """שליחת מייל איפוס סיסמה"""
    db = SessionLocal()
    try:
        # יצירת שירות
        email_service = EmailService()
        email_service.load_settings_from_db(db)
        
        # עיבוד template
        html_content = render_template(
            'password_reset',
            {
                'username': username,
                'reset_url': reset_url
            }
        )
        
        # שליחה
        result = email_service.send_email(
            to_email=user_email,
            subject="איפוס סיסמה - TikTrack",
            body_html=html_content
        )
        
        if result['success']:
            logger.info(f"Password reset email sent to {user_email}")
            return True
        else:
            logger.error(f"Failed to send password reset email: {result.get('error')}")
            return False
            
    except Exception as e:
        logger.critical(f"Error sending password reset email: {e}", exc_info=True)
        return False
    finally:
        db.close()
```

### דוגמה: בדיקת חיבור SMTP

```python
from services.email_service import EmailService
from config.database import SessionLocal

def test_smtp_connection():
    """בדיקת חיבור SMTP"""
    db = SessionLocal()
    try:
        email_service = EmailService()
        email_service.load_settings_from_db(db)
        
        result = email_service.test_connection(db_session=db)
        
        if result['success']:
            print("✅ SMTP connection successful")
            return True
        else:
            print(f"❌ SMTP connection failed: {result.get('error')}")
            return False
    finally:
        db.close()
```

### דוגמה: שליחת מייל בדיקה

```python
def send_test_email(test_email_address):
    """שליחת מייל בדיקה"""
    db = SessionLocal()
    try:
        email_service = EmailService()
        email_service.load_settings_from_db(db)
        
        html_content = """
        <p>זהו מייל בדיקה מהמערכת TikTrack.</p>
        <p>אם קיבלת את המייל הזה, הגדרות SMTP תקינות.</p>
        """
        
        result = email_service.send_email(
            to_email=test_email_address,
            subject="מייל בדיקה - TikTrack",
            body_html=html_content
        )
        
        return result
    finally:
        db.close()
```

---

## קישורים רלוונטיים

### תיעוד נוסף

- [EMAIL_TEMPLATES_GUIDE.md](EMAIL_TEMPLATES_GUIDE.md) - מדריך templates
- [SMTP_MANAGEMENT_GUIDE.md](../admin/SMTP_MANAGEMENT_GUIDE.md) - מדריך מנהל מערכת
- [GENERAL_SYSTEMS_LIST.md](../frontend/GENERAL_SYSTEMS_LIST.md) - רשימת מערכות כלליות

### קבצים קשורים

- `Backend/services/email_service.py` - שירות המיילים
- `Backend/services/email_templates.py` - מערכת templates
- `Backend/services/smtp_settings_service.py` - ניהול הגדרות
- `Backend/models/email_log.py` - מודל לוגים
- `Backend/routes/api/smtp_settings.py` - API endpoints

### API Endpoints

- `GET /api/system-settings/smtp` - קבלת הגדרות SMTP
- `POST /api/system-settings/smtp` - עדכון הגדרות SMTP
- `POST /api/system-settings/smtp/test` - בדיקת חיבור SMTP
- `POST /api/system-settings/smtp/test-email` - שליחת מייל בדיקה

---

## הערות חשובות

1. **אבטחה**: סיסמת SMTP מוצפנת במסד הנתונים (Fernet encryption)
2. **Fallback**: אם אין הגדרות במערכת, ייעשה שימוש במשתני סביבה
3. **Dev Mode**: במצב dev, מיילים נרשמים בלוגים בלבד
4. **RTL ועברית**: כל התבניות חייבות להיות RTL ועברית כברירת מחדל
5. **Header ו-Footer**: כל תבנית חייבת לכלול header עם לוגו ו-footer עם פרטים כלליים
6. **לוגים**: כל שליחת מייל נרשמת ב-email_log לניטור וניפוי באגים

---

**עדכון אחרון**: 28 בינואר 2025  
**גרסה**: 1.0.0

