"""
Email Templates Service - TikTrack
שירות תבניות מייל

This service provides email templates with consistent header and footer,
full RTL support, and Hebrew language.

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025

Function Index:
==============
HEADER AND FOOTER:
- get_email_header(logo_url=None, base_url=None) - יצירת header עם לוגו
- get_email_footer(contact_info=None) - יצירת footer עם פרטים

TEMPLATE RENDERING:
- render_template(template_name, context) - עיבוד template מלא
- wrap_email_content(content_html, logo_url=None, contact_info=None, base_url=None) - עטיפת תוכן ב-header ו-footer

TEMPLATE FUNCTIONS:
- get_template_password_reset(context) - template איפוס סיסמה
- get_template_system_notification(context) - template התראות מערכת
- get_template_business_notification(context) - template התראות עסקיות
- get_template_general(context) - template כללי

UTILITIES:
- get_base_url() - קבלת base URL של השרת
- get_logo_url(base_url=None) - קבלת URL ללוגו
"""

import os
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# TikTrack brand colors
PRIMARY_COLOR = "#26baac"  # Turquoise-Green
SECONDARY_COLOR = "#fc5a06"  # Orange-Red

# Default contact information
DEFAULT_CONTACT_INFO = {
    'email': 'support@tiktrack.com',
    'phone': None,
    'address': None
}


def get_base_url() -> str:
    """
    Get base URL of the server
    
    Returns:
        str: Base URL (e.g., "http://localhost:8080" or "http://127.0.0.1:8080")
    """
    # Try to get from environment variable
    base_url = os.getenv('TIKTRACK_BASE_URL')
    if base_url:
        return base_url.rstrip('/')
    
    # Determine from environment
    is_production = os.getenv('TIKTRACK_ENV', 'development').lower() == 'production'
    host = os.getenv('TIKTRACK_HOST', '127.0.0.1')
    port = os.getenv('TIKTRACK_PORT', '5001' if is_production else '8080')
    
    return f"http://{host}:{port}"


def get_logo_url(base_url: Optional[str] = None) -> str:
    """
    Get logo URL
    
    Args:
        base_url: Base URL (optional, will be determined if not provided)
        
    Returns:
        str: Full URL to logo image
    """
    if not base_url:
        base_url = get_base_url()
    
    return f"{base_url}/images/logo.svg"


def get_email_header(logo_url: Optional[str] = None, base_url: Optional[str] = None) -> str:
    """
    Create email header with logo
    
    Args:
        logo_url: Full URL to logo (optional, will be determined if not provided)
        base_url: Base URL (optional, will be determined if not provided)
        
    Returns:
        str: HTML for email header
    """
    if not logo_url:
        logo_url = get_logo_url(base_url)
    
    return f"""
    <div class="email-header" style="
        background-color: #f8f9fa;
        padding: 30px 20px;
        text-align: center;
        direction: rtl;
        border-bottom: 2px solid {PRIMARY_COLOR};
    ">
        <img src="{logo_url}" alt="TikTrack Logo" style="
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        ">
        <h1 style="
            color: {PRIMARY_COLOR};
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            font-family: 'Noto Sans Hebrew', Arial, sans-serif;
        ">TikTrack</h1>
        <p style="
            color: #666;
            margin: 8px 0 0 0;
            font-size: 16px;
            font-family: 'Noto Sans Hebrew', Arial, sans-serif;
        ">מערכת ניהול השקעות מתקדמת</p>
    </div>
    """


def get_email_footer(contact_info: Optional[Dict[str, Any]] = None) -> str:
    """
    Create email footer with contact information
    
    Args:
        contact_info: Dict with contact information:
            - email: Support email address
            - phone: Phone number (optional)
            - address: Physical address (optional)
            
    Returns:
        str: HTML for email footer
    """
    if not contact_info:
        contact_info = DEFAULT_CONTACT_INFO.copy()
    
    email = contact_info.get('email', DEFAULT_CONTACT_INFO['email'])
    phone = contact_info.get('phone')
    address = contact_info.get('address')
    
    contact_html = f"""
        <p style="color: #666; font-size: 12px; margin: 5px 0;">
            <strong>יצירת קשר:</strong><br>
            אימייל: <a href="mailto:{email}" style="color: {PRIMARY_COLOR}; text-decoration: none;">{email}</a>
    """
    
    if phone:
        contact_html += f"<br>טלפון: {phone}"
    
    if address:
        contact_html += f"<br>כתובת: {address}"
    
    contact_html += "</p>"
    
    return f"""
    <div class="email-footer" style="
        background-color: #f8f9fa;
        padding: 25px 20px;
        text-align: center;
        direction: rtl;
        border-top: 1px solid #e0e0e0;
        margin-top: 30px;
    ">
        {contact_html}
        <p style="
            color: #999;
            font-size: 11px;
            margin: 15px 0 8px 0;
            font-family: 'Noto Sans Hebrew', Arial, sans-serif;
        ">
            זהו מייל אוטומטי, אנא אל תשיב למייל זה.
        </p>
        <p style="
            color: #999;
            font-size: 11px;
            margin: 8px 0 0 0;
            font-family: 'Noto Sans Hebrew', Arial, sans-serif;
        ">
            © 2025 TikTrack. כל הזכויות שמורות.
        </p>
    </div>
    """


def wrap_email_content(
    content_html: str,
    logo_url: Optional[str] = None,
    contact_info: Optional[Dict[str, Any]] = None,
    base_url: Optional[str] = None
) -> str:
    """
    Wrap email content with header and footer
    
    Args:
        content_html: HTML content for email body
        logo_url: Full URL to logo (optional)
        contact_info: Contact information dict (optional)
        base_url: Base URL (optional)
        
    Returns:
        str: Complete HTML email with header, body, and footer
    """
    header = get_email_header(logo_url, base_url)
    footer = get_email_footer(contact_info)
    
    return f"""
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: 'Noto Sans Hebrew', Arial, sans-serif;
                direction: rtl;
                text-align: right;
                margin: 0;
                padding: 0;
                background-color: #ffffff;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
            }}
            .email-body {{
                padding: 30px 20px;
                direction: rtl;
                text-align: right;
                line-height: 1.6;
                color: #333;
            }}
            .email-body p {{
                margin: 15px 0;
            }}
            .email-body a {{
                color: {PRIMARY_COLOR};
                text-decoration: none;
            }}
            .email-body a:hover {{
                text-decoration: underline;
            }}
            .button {{
                background-color: {PRIMARY_COLOR};
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                display: inline-block;
                margin: 20px 0;
                font-weight: 600;
            }}
            .button:hover {{
                background-color: #1e9a8d;
            }}
            @media only screen and (max-width: 600px) {{
                .email-container {{
                    width: 100% !important;
                }}
                .email-body {{
                    padding: 20px 15px !important;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            {header}
            <div class="email-body">
                {content_html}
            </div>
            {footer}
        </div>
    </body>
    </html>
    """


def get_template_password_reset(context: Dict[str, Any]) -> str:
    """
    Get password reset email template
    
    Args:
        context: Dict with:
            - username: Username
            - reset_url: Full URL for password reset
            
    Returns:
        str: Complete HTML email
    """
    username = context.get('username', 'משתמש')
    reset_url = context.get('reset_url', '')
    
    body_html = f"""
        <h2 style="color: {PRIMARY_COLOR}; margin-top: 0;">איפוס סיסמה - TikTrack</h2>
        <p>שלום {username},</p>
        <p>קיבלנו בקשה לאיפוס הסיסמה שלך במערכת TikTrack.</p>
        <p>לחץ על הכפתור הבא כדי לאפס את הסיסמה שלך:</p>
        <p style="text-align: center;">
            <a href="{reset_url}" class="button">איפוס סיסמה</a>
        </p>
        <p>או העתק את הקישור הבא לדפדפן שלך:</p>
        <p style="
            word-break: break-all;
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            font-size: 12px;
            direction: ltr;
            text-align: left;
        ">{reset_url}</p>
        <p><strong>הקישור תקף ל-24 שעות בלבד.</strong></p>
        <p>אם לא ביקשת לאפס את הסיסמה, תוכל להתעלם מהמייל הזה.</p>
    """
    
    return wrap_email_content(body_html, contact_info=context.get('contact_info'))


def get_template_system_notification(context: Dict[str, Any]) -> str:
    """
    Get system notification email template
    
    Args:
        context: Dict with:
            - title: Notification title
            - message: Notification message
            - action_url: URL for action (optional)
            
    Returns:
        str: Complete HTML email
    """
    title = context.get('title', 'התראת מערכת')
    message = context.get('message', '')
    action_url = context.get('action_url')
    
    body_html = f"""
        <h2 style="color: {PRIMARY_COLOR}; margin-top: 0;">{title}</h2>
        <p>{message}</p>
    """
    
    if action_url:
        body_html += f"""
        <p style="text-align: center;">
            <a href="{action_url}" class="button">צפה בהתראה</a>
        </p>
        """
    
    return wrap_email_content(body_html, contact_info=context.get('contact_info'))


def get_template_business_notification(context: Dict[str, Any]) -> str:
    """
    Get business notification email template
    
    Args:
        context: Dict with:
            - title: Notification title
            - message: Notification message
            - action_url: URL for action (optional)
            
    Returns:
        str: Complete HTML email
    """
    title = context.get('title', 'התראת עסק')
    message = context.get('message', '')
    action_url = context.get('action_url')
    
    body_html = f"""
        <h2 style="color: {SECONDARY_COLOR}; margin-top: 0;">{title}</h2>
        <p>{message}</p>
    """
    
    if action_url:
        body_html += f"""
        <p style="text-align: center;">
            <a href="{action_url}" class="button" style="background-color: {SECONDARY_COLOR};">
                צפה בהתראה
            </a>
        </p>
        """
    
    return wrap_email_content(body_html, contact_info=context.get('contact_info'))


def get_template_general(context: Dict[str, Any]) -> str:
    """
    Get general email template
    
    Args:
        context: Dict with:
            - title: Email title
            - content: HTML content for email body
            
    Returns:
        str: Complete HTML email
    """
    title = context.get('title', 'הודעה מ-TikTrack')
    content = context.get('content', '')
    
    body_html = f"""
        <h2 style="color: {PRIMARY_COLOR}; margin-top: 0;">{title}</h2>
        {content}
    """
    
    return wrap_email_content(body_html, contact_info=context.get('contact_info'))


# Template registry
TEMPLATES = {
    'password_reset': get_template_password_reset,
    'system_notification': get_template_system_notification,
    'business_notification': get_template_business_notification,
    'general': get_template_general,
}


def render_template(template_name: str, context: Dict[str, Any]) -> str:
    """
    Render email template
    
    Args:
        template_name: Name of template (password_reset, system_notification, business_notification, general)
        context: Context dict with template-specific data
        
    Returns:
        str: Complete HTML email
        
    Raises:
        ValueError: If template name is not found
    """
    if template_name not in TEMPLATES:
        logger.error(f"Template '{template_name}' not found. Available templates: {list(TEMPLATES.keys())}")
        raise ValueError(f"Template '{template_name}' not found. Available templates: {list(TEMPLATES.keys())}")
    
    template_func = TEMPLATES[template_name]
    
    try:
        return template_func(context)
    except Exception as e:
        logger.error(f"Error rendering template '{template_name}': {e}", exc_info=True)
        raise

