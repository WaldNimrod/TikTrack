# מדריך Email Templates - TikTrack

## Email Templates Guide

**תאריך יצירה**: 28 בינואר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team

---

## תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [מבנה תבנית מייל](#מבנה-תבנית-מייל)
3. [דרישות RTL ועברית](#דרישות-rtl-ועברית)
4. [רשימת Templates זמינים](#רשימת-templates-זמינים)
5. [יצירת Template חדש](#יצירת-template-חדש)
6. [דוגמאות קוד](#דוגמאות-קוד)

---

## סקירה כללית

מערכת Email Templates של TikTrack מספקת תבניות אחידות למיילים עם header ו-footer קבועים, תמיכה מלאה ב-RTL ועברית, ועיצוב אחיד עם צבעי המותג.

### קבצים עיקריים

- `Backend/services/email_templates.py` - מערכת templates
- `Backend/services/email_service.py` - שימוש ב-templates

---

## מבנה תבנית מייל

כל תבנית מייל חייבת לכלול שלושה חלקים:

### 1. Header (כותרת עליונה)

**חובה לכלול:**

- לוגו TikTrack (SVG או PNG)
- כותרת מערכת: "TikTrack - מערכת ניהול השקעות מתקדמת"
- עיצוב אחיד עם צבעי המותג:
  - צבע ראשי: `#26baac` (Turquoise-Green)
  - צבע משני: `#fc5a06` (Orange-Red)

**דוגמה:**

```html
<div class="email-header" style="background-color: #f8f9fa; padding: 20px; text-align: center; direction: rtl;">
    <img src="http://localhost:8080/images/logo.svg" alt="TikTrack Logo" style="max-width: 200px; height: auto; margin-bottom: 10px;">
    <h1 style="color: #26baac; margin: 0; font-size: 24px;">TikTrack</h1>
    <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">מערכת ניהול השקעות מתקדמת</p>
</div>
```

### 2. Body (תוכן דינמי)

**תוכן המייל לפי סוג:**

- איפוס סיסמה
- התראות מערכת
- התראות עסקיות
- הודעות כלליות

**דוגמה:**

```html
<div class="email-body" style="padding: 30px 20px; direction: rtl; text-align: right;">
    <p>שלום {username},</p>
    <p>קיבלנו בקשה לאיפוס הסיסמה שלך במערכת TikTrack.</p>
    <p>לחץ על הכפתור הבא כדי לאפס את הסיסמה שלך:</p>
    <a href="{reset_url}" style="background-color: #26baac; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">
        איפוס סיסמה
    </a>
</div>
```

### 3. Footer (כותרת תחתונה)

**חובה לכלול:**

- פרטי יצירת קשר:
  - אימייל תמיכה
  - טלפון (אם קיים)
  - כתובת (אם קיימת)
- הודעה: "זהו מייל אוטומטי, אנא אל תשיב למייל זה"
- זכויות יוצרים: "© 2025 TikTrack. כל הזכויות שמורות."

**דוגמה:**

```html
<div class="email-footer" style="background-color: #f8f9fa; padding: 20px; text-align: center; direction: rtl; border-top: 1px solid #e0e0e0;">
    <p style="color: #666; font-size: 12px; margin: 5px 0;">
        <strong>יצירת קשר:</strong><br>
        אימייל: support@tiktrack.com<br>
        טלפון: +972-XX-XXX-XXXX
    </p>
    <p style="color: #999; font-size: 11px; margin: 10px 0 5px 0;">
        זהו מייל אוטומטי, אנא אל תשיב למייל זה.
    </p>
    <p style="color: #999; font-size: 11px; margin: 5px 0;">
        © 2025 TikTrack. כל הזכויות שמורות.
    </p>
</div>
```

---

## דרישות RTL ועברית

### RTL (מימין לשמאל)

**חובה לכלול:**

- `dir="rtl"` ב-`<html>` tag
- `lang="he"` ב-`<html>` tag
- `direction: rtl` ב-CSS inline
- `text-align: right` ב-CSS inline

**דוגמה:**

```html
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            direction: rtl;
            text-align: right;
            font-family: 'Noto Sans Hebrew', Arial, sans-serif;
        }
    </style>
</head>
<body>
    <!-- תוכן -->
</body>
</html>
```

### עברית

**כל הטקסטים חייבים להיות בעברית:**

- כותרות
- הודעות
- כפתורים
- הודעות שגיאה
- הודעות הצלחה

**דוגמה:**

```html
<h2>איפוס סיסמה - TikTrack</h2>
<p>שלום {username},</p>
<p>קיבלנו בקשה לאיפוס הסיסמה שלך במערכת TikTrack.</p>
<button>איפוס סיסמה</button>
```

---

## רשימת Templates זמינים

### 1. password_reset

**מטרה**: מייל איפוס סיסמה

**Placeholders:**

- `{username}` - שם המשתמש
- `{reset_url}` - קישור לאיפוס סיסמה

**דוגמה:**

```python
render_template('password_reset', {
    'username': 'user123',
    'reset_url': 'http://localhost:8080/reset-password.html?token=abc123'
})
```

### 2. system_notification

**מטרה**: התראות מערכת

**Placeholders:**

- `{title}` - כותרת ההתראה
- `{message}` - תוכן ההתראה
- `{action_url}` - קישור לפעולה (אופציונלי)

**דוגמה:**

```python
render_template('system_notification', {
    'title': 'עדכון מערכת',
    'message': 'המערכת עודכנה בהצלחה',
    'action_url': 'http://localhost:8080/system-updates.html'
})
```

### 3. business_notification

**מטרה**: התראות עסקיות

**Placeholders:**

- `{title}` - כותרת ההתראה
- `{message}` - תוכן ההתראה
- `{action_url}` - קישור לפעולה (אופציונלי)

**דוגמה:**

```python
render_template('business_notification', {
    'title': 'טרייד חדש',
    'message': 'טרייד חדש נוצר במערכת',
    'action_url': 'http://localhost:8080/trades.html'
})
```

### 4. general

**מטרה**: template כללי

**Placeholders:**

- `{title}` - כותרת המייל
- `{content}` - תוכן המייל (HTML)

**דוגמה:**

```python
render_template('general', {
    'title': 'הודעה כללית',
    'content': '<p>תוכן המייל כאן</p>'
})
```

---

## יצירת Template חדש

### שלבים

1. **פתח את הקובץ** `Backend/services/email_templates.py`

2. **הוסף פונקציה חדשה:**

```python
def get_template_new_template(context):
    """
    יצירת template חדש
    
    Args:
        context: Dict עם placeholders
        
    Returns:
        str: HTML של התבנית
    """
    # Header
    header = get_email_header()
    
    # Body
    body = f"""
    <div class="email-body" style="padding: 30px 20px; direction: rtl; text-align: right;">
        <h2>{context.get('title', 'כותרת')}</h2>
        <p>{context.get('message', 'תוכן')}</p>
    </div>
    """
    
    # Footer
    footer = get_email_footer()
    
    # עטיפה מלאה
    return wrap_email_content(body, contact_info=context.get('contact_info'))
```

3. **הוסף ל-dictionary של templates:**

```python
TEMPLATES = {
    'password_reset': get_template_password_reset,
    'system_notification': get_template_system_notification,
    'business_notification': get_template_business_notification,
    'general': get_template_general,
    'new_template': get_template_new_template,  # הוסף כאן
}
```

4. **בדוק את ה-template:**

```python
from services.email_templates import render_template

html = render_template('new_template', {
    'title': 'כותרת',
    'message': 'תוכן'
})
print(html)
```

### דרישות Template חדש

- ✅ Header עם לוגו
- ✅ Body דינמי
- ✅ Footer עם פרטים
- ✅ RTL מלא
- ✅ עברית בכל הטקסטים
- ✅ Responsive (תמיכה במכשירים ניידים)
- ✅ צבעי המותג (#26baac, #fc5a06)

---

## דוגמאות קוד

### דוגמה 1: שימוש ב-Template

```python
from services.email_templates import render_template
from services.email_service import EmailService

# עיבוד template
html_content = render_template('password_reset', {
    'username': 'user123',
    'reset_url': 'http://localhost:8080/reset-password.html?token=abc123'
})

# שליחה
email_service = EmailService()
result = email_service.send_email(
    to_email='user@example.com',
    subject='איפוס סיסמה - TikTrack',
    body_html=html_content
)
```

### דוגמה 2: יצירת Template מותאם

```python
from services.email_templates import (
    get_email_header,
    get_email_footer,
    wrap_email_content
)

# יצירת body מותאם
body_html = """
<div class="email-body" style="padding: 30px 20px; direction: rtl; text-align: right;">
    <h2 style="color: #26baac;">כותרת מותאמת</h2>
    <p>תוכן מותאם כאן</p>
</div>
"""

# עטיפה ב-header ו-footer
full_html = wrap_email_content(
    body_html,
    logo_url='http://localhost:8080/images/logo.svg',
    contact_info={
        'email': 'support@tiktrack.com',
        'phone': '+972-XX-XXX-XXXX'
    }
)
```

### דוגמה 3: Template עם כפתור

```python
def create_email_with_button(button_text, button_url):
    """יצירת מייל עם כפתור"""
    body_html = f"""
    <div class="email-body" style="padding: 30px 20px; direction: rtl; text-align: right;">
        <p>לחץ על הכפתור הבא:</p>
        <a href="{button_url}" style="
            background-color: #26baac;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            margin: 20px 0;
        ">{button_text}</a>
    </div>
    """
    
    return wrap_email_content(body_html)
```

---

## הערות חשובות

1. **Header ו-Footer קבועים**: כל template חייב לכלול header עם לוגו ו-footer עם פרטים
2. **RTL ועברית**: כל template חייב להיות RTL ועברית כברירת מחדל
3. **Responsive**: כל template חייב לתמוך במכשירים ניידים
4. **צבעי המותג**: השתמש בצבעי המותג (#26baac, #fc5a06)
5. **בדיקה**: תמיד בדוק את ה-template לפני שימוש בפרודקשן

---

**עדכון אחרון**: 28 בינואר 2025  
**גרסה**: 1.0.0

