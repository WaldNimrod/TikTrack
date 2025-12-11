# תוכנית עבודה - מימוש שירות SMTP במערכת TikTrack

**תאריך יצירה**: 28 בינואר 2025  
**גרסה**: 1.0.0  
**סטטוס**: בתכנון

## מטרות

1. יצירת שירות SMTP גמיש לשליחת מגוון הודעות במערכת
2. הוספת הגדרות SMTP למערכת ההגדרות הכלליות (SystemSettings)
3. יצירת ממשק ניהול SMTP בעמוד פרופיל משתמש (user-profile.html) - כמודול נוסף
4. הגדרת ברירת מחדל: admin@mezoo.co עם הסיסמה שצוינה
5. תיעוד מסודר ובדיקות שליחה בפועל

## שלב 1: תיעוד (מתחילים כאן)

### 1.1 תיעוד טכני - SMTP Service

**קובץ חדש**: `documentation/backend/SMTP_SERVICE_GUIDE.md`

**תוכן**:

- סקירה כללית של השירות
- ארכיטקטורה ומבנה
- הגדרת SMTP במערכת
- שימוש ב-EmailService
- יצירת email templates
- אינטגרציה עם מערכות כלליות (Logger, SystemSettings, Cache)
- בדיקות וטיפול בשגיאות
- דוגמאות קוד מלאות
- קישור ל-GENERAL_SYSTEMS_LIST

### 1.2 תיעוד מנהל מערכת

**קובץ חדש**: `documentation/admin/SMTP_MANAGEMENT_GUIDE.md`

**תוכן**:

- הוראות גישה לממשק ניהול SMTP (בעמוד פרופיל משתמש)
- הגדרת שרת SMTP
- בדיקת חיבור
- שליחת מייל בדיקה
- פתרון בעיות נפוצות
- הגדרות ברירת מחדל

### 1.3 תיעוד Email Templates

**קובץ חדש**: `documentation/backend/EMAIL_TEMPLATES_GUIDE.md`

**תוכן**:

- מבנה תבנית מייל (Header עם לוגו, Body, Footer עם פרטים)
- דרישות RTL ועברית
- רשימת templates זמינים
- יצירת template חדש
- דוגמאות קוד

### 1.4 עדכון תיעוד קיים

**קובץ**: `documentation/INDEX.md`

- הוספת קישורים לתיעוד SMTP

**קובץ**: `documentation/frontend/GENERAL_SYSTEMS_LIST.md`

- הוספת SMTP Service לרשימה (בחלק "מערכות תקשורת" - חלק חדש)
- קישור ל-SMTP_SERVICE_GUIDE.md
- תיאור: "שירות SMTP גמיש לשליחת מגוון הודעות עם תמיכה ב-templates, הגדרות במערכת הכלליות, ולוגים"

## שלב 2: שדרוג EmailService

### 2.1 עדכון EmailService לקריאת הגדרות מ-SystemSettings

**קובץ**: `Backend/services/email_service.py`

**שינויים**:

- הוספת קריאת הגדרות SMTP מ-SystemSettingsService במקום משתני סביבה בלבד
- תמיכה ב-fallback למשתני סביבה אם אין הגדרות במערכת
- הוספת פונקציה `load_settings_from_db(db_session)` לטעינת הגדרות
- הוספת ולידציה של הגדרות SMTP
- הוספת פונקציה `test_connection(db_session=None)` לבדיקת חיבור לשרת SMTP
- **שימוש ב-Logger Service**: שימוש ב-`logging` module של Python (Backend) - כל הלוגים דרך `logger.info/error/warn/critical` עם context מלא
- **הערות קוד**: הוספת Function Index בתחילת הקובץ, Python docstrings מלאים לכל פונקציה

**פונקציות חדשות**:

```python
def load_settings_from_db(self, db_session: Session) -> bool
def validate_settings(self) -> Dict[str, Any]
def test_connection(self, db_session: Optional[Session] = None) -> Dict[str, Any]
```

**הערות קוד**:

- הוספת Function Index בתחילת הקובץ
- JSDoc/Python docstrings מלאים לכל פונקציה
- הערות בעברית ואנגלית לפי הסטנדרט

### 2.2 הוספת תמיכה ב-Email Templates

**קובץ חדש**: `Backend/services/email_templates.py`

**תוכן**:

- מערכת templates למיילים
- תמיכה ב-HTML templates עם placeholders
- פונקציה `render_template(template_name, context)` לעיבוד templates
- **דרישות תבנית (חובה)**:
  - **Header קבוע**:
    - לוגו TikTrack (images/logo.svg או URL מלא)
    - כותרת מערכת: "TikTrack - מערכת ניהול השקעות מתקדמת"
    - עיצוב אחיד עם צבעי המותג (#26baac, #fc5a06)
  - **Body דינמי**: תוכן המייל לפי סוג (איפוס סיסמה, התראות, וכו')
  - **Footer קבוע**:
    - פרטי יצירת קשר: אימייל תמיכה, טלפון (אם קיים)
    - כתובת (אם קיימת)
    - הודעה: "זהו מייל אוטומטי, אנא אל תשיב למייל זה"
    - זכויות יוצרים: "© 2025 TikTrack. כל הזכויות שמורות."
  - **RTL מלא**: `dir="rtl"`, `lang="he"` בכל התבנית
  - **עברית**: כל הטקסטים בעברית כברירת מחדל
  - **Responsive**: תמיכה במכשירים ניידים

**פונקציות**:

- `get_email_header(logo_url=None)` - יצירת header עם לוגו
- `get_email_footer(contact_info=None)` - יצירת footer עם פרטים
- `render_template(template_name, context)` - עיבוד template מלא
- `wrap_email_content(content_html, logo_url=None, contact_info=None)` - עטיפת תוכן ב-header ו-footer

**הערות קוד**:

- Function Index מלא בתחילת הקובץ
- Python docstrings מפורטים לכל פונקציה
- הערות בעברית ואנגלית

**Templates זמינים**:

- `password_reset` - איפוס סיסמה
- `system_notification` - התראות מערכת
- `business_notification` - התראות עסקיות
- `general` - template כללי

**הערות קוד**:

- Function Index מלא
- Python docstrings מפורטים

### 2.3 הוספת Email Queue/Logging

**קובץ חדש**: `Backend/models/email_log.py`

- מודל לשמירת לוג של שליחות מייל
- שדות: recipient, subject, status, sent_at, error_message, email_type, user_id
- אינטגרציה עם User model

**קובץ**: `Backend/services/email_service.py`

- הוספת לוגינג אוטומטי לכל שליחת מייל
- שמירת תוצאות השליחה ב-email_log
- **שימוש ב-Logger Service**: כל פעולת לוג דרך `logging` module של Python עם context מלא (recipient, subject, status, error)
- **הערות קוד**: Function Index ו-Python docstrings

## שלב 3: הגדרות SMTP במערכת הכלליות

### 3.1 יצירת Migration להגדרות SMTP

**קובץ חדש**: `Backend/scripts/migrations/add_smtp_settings.py`

**תוכן**:

- יצירת group: `smtp_settings`
- יצירת setting types:
  - `smtp_host` (string, default: "smtp.gmail.com")
  - `smtp_port` (integer, default: 587)
  - `smtp_user` (string, default: "admin@mezoo.co")
  - `smtp_password` (string, default: מוצפן - "Nim027425677!")
  - `smtp_from_email` (string, default: "admin@mezoo.co")
  - `smtp_from_name` (string, default: "TikTrack")
  - `smtp_use_tls` (boolean, default: true)
  - `smtp_enabled` (boolean, default: true)
  - `smtp_test_email` (string, default: "")

**הערה**: סיסמה תישמר מוצפנת (Fernet encryption או bcrypt)

### 3.2 יצירת Service לניהול הגדרות SMTP

**קובץ חדש**: `Backend/services/smtp_settings_service.py`

**פונקציות**:

- `get_smtp_settings(db_session)` - קבלת כל הגדרות SMTP
- `update_smtp_settings(db_session, settings, updated_by)` - עדכון הגדרות
- `encrypt_password(password)` - הצפנת סיסמה (Fernet encryption)
- `decrypt_password(encrypted_password)` - פענוח סיסמה (רק לצורך בדיקה)
- `validate_smtp_settings(settings)` - ולידציה של הגדרות

**אינטגרציה עם מערכות כלליות**:

- `SystemSettingsService` - קריאה ושמירת הגדרות
- `logging` module - לוגים עם context מלא
- `UnifiedCacheManager` (Frontend) - מטמון הגדרות (אם נדרש)

**הערות קוד**:

- Function Index מלא בתחילת הקובץ
- Python docstrings מפורטים לכל פונקציה
- הערות בעברית ואנגלית

### 3.3 יצירת API Endpoints להגדרות SMTP

**קובץ**: `Backend/routes/api/system_settings.py` (או קובץ חדש `Backend/routes/api/smtp_settings.py`)

**Endpoints**:

- `GET /api/system-settings/smtp` - קבלת הגדרות SMTP
- `POST /api/system-settings/smtp` - עדכון הגדרות SMTP
- `POST /api/system-settings/smtp/test` - בדיקת חיבור SMTP
- `POST /api/system-settings/smtp/test-email` - שליחת מייל בדיקה

**אבטחה**: דורש הרשאות מנהל (בדיקה דרך auth middleware)

**אינטגרציה עם מערכות כלליות**:

- `SystemSettingsService` - קריאה ושמירת הגדרות
- `EmailService` - שליחת מיילים ובדיקת חיבור
- `logging` module - לוגים

**הערות קוד**:

- Function Index מלא בתחילת הקובץ
- Python docstrings מפורטים לכל endpoint
- הערות בעברית ואנגלית

## שלב 4: ממשק ניהול בעמוד פרופיל משתמש

### 4.1 הוספת Section חדש - SMTP Settings

**קובץ**: `trading-ui/user-profile.html`

**שינויים**:

- הוספת `content-section` חדש בתוך `section-body` של `top-section`:

```html
<!-- SMTP Settings Section -->
<div class="content-section" id="smtp-settings-section" data-section="smtp-settings">
    <div class="section-header">
        <div class="table-title">
            <img src="images/icons/tabler/mail.svg" class="section-icon" alt="הגדרות SMTP">
            <span>הגדרות SMTP</span>
        </div>
    </div>
    <div class="section-body">
        <!-- תוכן SMTP settings -->
    </div>
</div>
```

**מיקום**: אחרי `password-change-section`, לפני סגירת `section-body`

### 4.2 יצירת Module לניהול SMTP

**קובץ חדש**: `trading-ui/scripts/user-profile-smtp.js`

**מבנה**:

- Object: `UserProfileSMTP` (חלק מ-`UserProfilePage` או מודול נפרד)
- טעינת הגדרות SMTP מה-API
- טופס עריכה להגדרות SMTP
- כפתור "בדיקת חיבור"
- כפתור "שליחת מייל בדיקה"
- הצגת סטטוס חיבור
- הצגת היסטוריית שליחות (מתוך email_log)

**UI Components**:

- Form fields: Host, Port, User, Password (masked), From Email, From Name, Use TLS, Enabled
- Test Connection button עם spinner
- Send Test Email button עם input לכתובת מייל
- Status indicator (connected/disconnected/error)
- Recent emails table (אופציונלי)

**אינטגרציה עם מערכות כלליות** (חובה):

- `window.Logger` - לכל הלוגים (info/warn/error/debug עם context)
- `window.NotificationSystem` - להתראות (showSuccess/showError)
- `window.UnifiedCacheManager` - למטמון הגדרות SMTP (TTL: 5 דקות)
- `window.CacheSyncManager` - לסנכרון מטמון לאחר עדכון הגדרות
- `window.TikTrackAuth` - לבדיקת אימות (אם נדרש)
- `window.EventHandlerManager` - לניהול אירועים (אם נדרש)

**הערות קוד** (חובה):

- Function Index מלא בתחילת הקובץ (בפורמט הסטנדרטי)
- JSDoc מלא לכל פונקציה:

  ```javascript
  /**
   * Description in Hebrew
   * @function functionName
   * @param {Type} paramName - Description
   * @returns {Type} Description
   * @example
   * // Example usage
   */
  ```

- הערות בעברית ואנגלית לפי הסטנדרט

### 4.3 עדכון user-profile.js

**קובץ**: `trading-ui/scripts/user-profile.js`

**שינויים**:

- הוספת `initSMTPModule()` ב-`UserProfilePage.init()`
- הוספת import/טעינה של `user-profile-smtp.js`
- אינטגרציה עם `UserProfileSMTP` module

### 4.4 יצירת CSS ספציפי

**קובץ**: `trading-ui/styles-new/07-pages/_user-profile.css`

**תוכן**:

- עיצוב טופס הגדרות SMTP
- עיצוב status indicators
- עיצוב טבלת היסטוריית מיילים (אם נדרש)

## שלב 5: אינטגרציה עם מערכת איפוס סיסמה

### 5.1 עדכון PasswordResetService

**קובץ**: `Backend/services/password_reset_service.py`

**שינויים**:

- שימוש ב-EmailService המעודכן
- קריאת הגדרות SMTP מ-SystemSettings
- שימוש ב-email templates

### 5.2 עדכון EmailService.send_password_reset_email

**קובץ**: `Backend/services/email_service.py`

**שינויים**:

- שימוש ב-template system מ-`email_templates.py`
- שימוש ב-`wrap_email_content()` לעטיפת תוכן ב-header (לוגו) ו-footer (פרטים כלליים)
- RTL מלא (`dir="rtl"`, `lang="he"`)
- כל הטקסטים בעברית
- עיצוב אחיד עם צבעי המותג

## שלב 6: בדיקות

### 6.1 בדיקות יחידה (Unit Tests)

**קובץ חדש**: `Backend/tests/test_email_service.py`

**תוכן**:

- בדיקת טעינת הגדרות
- בדיקת ולידציה
- בדיקת render templates
- בדיקת הצפנת/פענוח סיסמה

### 6.2 בדיקות אינטגרציה

**קובץ חדש**: `Backend/tests/test_smtp_integration.py`

**תוכן**:

- בדיקת חיבור SMTP אמיתי
- בדיקת שליחת מייל בדיקה
- בדיקת איפוס סיסמה עם מייל אמיתי

### 6.3 סקריפט בדיקה ידנית

**קובץ חדש**: `Backend/scripts/test_smtp_service.py`

**תוכן**:

- סקריפט לבדיקת SMTP service
- שליחת מייל בדיקה
- בדיקת templates
- בדיקת logging

## שלב 7: הגדרת ברירת מחדל

### 7.1 יצירת סקריפט הגדרה ראשונית

**קובץ חדש**: `Backend/scripts/setup_smtp_defaults.py`

**תוכן**:

- הגדרת ברירת מחדל: admin@mezoo.co
- הצפנת סיסמה ושמירה
- הגדרת smtp.gmail.com (כי זה Google Workspace)
- הגדרת Port 587, TLS enabled

## סדר ביצוע מומלץ

1. **שלב 1**: תיעוד (מתחילים כאן)
2. **שלב 2.1-2.2**: שדרוג EmailService (ללא תלות בממשק)
3. **שלב 3.1-3.2**: יצירת הגדרות SMTP במערכת
4. **שלב 2.3**: הוספת email logging
5. **שלב 3.3**: יצירת API endpoints
6. **שלב 4**: יצירת ממשק ניהול ב-user-profile.html
7. **שלב 5**: אינטגרציה עם איפוס סיסמה
8. **שלב 7**: הגדרת ברירת מחדל
9. **שלב 6**: בדיקות

## קבצים חדשים

### Backend

- `Backend/services/email_templates.py`
- `Backend/models/email_log.py`
- `Backend/services/smtp_settings_service.py`
- `Backend/routes/api/smtp_settings.py` (או עדכון `system_settings.py`)
- `Backend/scripts/migrations/add_smtp_settings.py`
- `Backend/scripts/setup_smtp_defaults.py`
- `Backend/scripts/test_smtp_service.py`
- `Backend/tests/test_email_service.py`
- `Backend/tests/test_smtp_integration.py`

### Frontend

- `trading-ui/scripts/user-profile-smtp.js`

### Documentation

- `documentation/backend/SMTP_SERVICE_GUIDE.md`
- `documentation/admin/SMTP_MANAGEMENT_GUIDE.md`
- `documentation/backend/EMAIL_TEMPLATES_GUIDE.md`

## קבצים לעדכון

### Backend

- `Backend/services/email_service.py` - שדרוג משמעותי
- `Backend/services/password_reset_service.py` - אינטגרציה
- `Backend/models/__init__.py` - הוספת EmailLog
- `Backend/routes/api/system_settings.py` - הוספת endpoints (או קובץ חדש)

### Frontend

- `trading-ui/scripts/user-profile.js` - הוספת SMTP module
- `trading-ui/user-profile.html` - הוספת SMTP section
- `trading-ui/styles-new/07-pages/_user-profile.css` - עיצוב SMTP

### Documentation

- `documentation/INDEX.md`
- `documentation/frontend/GENERAL_SYSTEMS_LIST.md`

## הערות חשובות (חובה לקרוא)

### דרישות חובה

1. **תיעוד ראשון**: שלב התיעוד (שלב 1) חייב להיות הראשון - אין להתחיל קוד לפני השלמת התיעוד
2. **RTL ועברית**: כל התבניות חייבות להיות RTL (`dir="rtl"`, `lang="he"`) ועברית כברירת מחדל
3. **Header ו-Footer קבועים**: כל תבנית חייבת לכלול:
   - Header: לוגו TikTrack + כותרת מערכת
   - Footer: פרטי יצירת קשר + זכויות יוצרים + הודעת "מייל אוטומטי"
4. **Logger Service**:
   - Frontend: שימוש ב-`window.Logger` (info/warn/error/debug) עם context מלא
   - Backend: שימוש ב-`logging` module של Python עם context מלא
5. **אינטגרציה עם מערכות כלליות**:
   - חובה לקרוא `GENERAL_SYSTEMS_LIST.md` לפני התחלה
   - וידוא אינטגרציה מלאה עם: Logger, NotificationSystem, UnifiedCacheManager, CacheSyncManager
   - עדכון `GENERAL_SYSTEMS_LIST.md` עם המערכת החדשה + קישור לדוקומנטציה
6. **הערות קוד**:
   - כל קובץ חייב להכיל Function Index מלא בתחילת הקובץ (בפורמט הסטנדרטי)
   - JSDoc מלא לכל פונקציה (Frontend)
   - Python docstrings מלאים לכל פונקציה (Backend)
   - הערות בעברית ואנגלית
7. **עמוד אחד בלבד**:
   - **אין ליצור עמודים נוספים!**
   - כל הפונקציונאליות סביב משתמשים תהיה בעמוד `user-profile.html` בלבד
   - SMTP Settings יוצגו כ-`content-section` נוסף בתוך `user-profile.html`
   - אין ליצור עמוד נפרד או להוסיף ל-system-management.html

### דרישות נוספות

8. **אבטחה**: סיסמת SMTP תישמר מוצפנת במסד הנתונים (Fernet encryption)
9. **Fallback**: אם אין הגדרות במערכת, ייעשה שימוש במשתני סביבה
10. **Dev Mode**: במצב dev, מיילים יישמרו ב-email_log בלבד (אופציונלי)
11. **Templates**: מערכת templates תאפשר הוספת סוגי מיילים חדשים בקלות
12. **Logging**: כל שליחת מייל תישמר ב-email_log לניטור וניפוי באגים
13. **Testing**: בדיקות יחידה ואינטגרציה יבטיחו שהשירות עובד כהלכה

## הגדרות ברירת מחדל

- **Host**: smtp.gmail.com (Google Workspace)
- **Port**: 587
- **User**: admin@mezoo.co
- **Password**: Nim027425677! (מוצפן)
- **From Email**: admin@mezoo.co
- **From Name**: TikTrack
- **Use TLS**: true
- **Enabled**: true

