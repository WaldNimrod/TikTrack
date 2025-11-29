"""
Email Service - TikTrack
שירות שליחת מיילים

This service handles sending emails for password reset and other notifications.

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025
"""

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
import os

logger = logging.getLogger(__name__)


class EmailService:
    """
    Email service for sending emails
    
    Supports SMTP email sending with configurable settings.
    """
    
    def __init__(self):
        # Email configuration from environment variables
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('SMTP_FROM_EMAIL', self.smtp_user)
        self.from_name = os.getenv('SMTP_FROM_NAME', 'TikTrack')
        self.use_tls = os.getenv('SMTP_USE_TLS', 'true').lower() == 'true'
        
        # Development mode - log emails instead of sending
        self.dev_mode = os.getenv('TIKTRACK_DEV_MODE', 'true').lower() == 'true'
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        body_html: str,
        body_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send an email
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body_html: HTML email body
            body_text: Plain text email body (optional)
            
        Returns:
            Dict with 'success' (bool) and 'message' (str) or 'error' (str)
        """
        try:
            if self.dev_mode:
                # In development mode, just log the email
                logger.info(f"📧 [DEV MODE] Email would be sent:")
                logger.info(f"   To: {to_email}")
                logger.info(f"   Subject: {subject}")
                logger.info(f"   Body: {body_text or body_html[:200]}...")
                return {
                    'success': True,
                    'message': 'Email logged (dev mode)'
                }
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Add text and HTML parts
            if body_text:
                text_part = MIMEText(body_text, 'plain', 'utf-8')
                msg.attach(text_part)
            
            html_part = MIMEText(body_html, 'html', 'utf-8')
            msg.attach(html_part)
            
            # Send email via SMTP
            if not self.smtp_user or not self.smtp_password:
                logger.warning("SMTP credentials not configured, email not sent")
                return {
                    'success': False,
                    'error': 'SMTP credentials not configured'
                }
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"✅ Email sent successfully to {to_email}")
            return {
                'success': True,
                'message': 'Email sent successfully'
            }
            
        except Exception as e:
            logger.error(f"❌ Error sending email to {to_email}: {e}")
            return {
                'success': False,
                'error': f'Failed to send email: {str(e)}'
            }
    
    def send_password_reset_email(
        self,
        to_email: str,
        username: str,
        reset_token: str,
        reset_url: str
    ) -> Dict[str, Any]:
        """
        Send password reset email
        
        Args:
            to_email: User email address
            username: Username
            reset_token: Password reset token
            reset_url: Full URL for password reset
            
        Returns:
            Dict with 'success' (bool) and 'message' (str) or 'error' (str)
        """
        subject = "איפוס סיסמה - TikTrack"
        
        body_html = f"""
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; direction: rtl; text-align: right; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .button {{ background-color: #26baac; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }}
                .button:hover {{ background-color: #1e9a8d; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>איפוס סיסמה - TikTrack</h2>
                <p>שלום {username},</p>
                <p>קיבלנו בקשה לאיפוס הסיסמה שלך במערכת TikTrack.</p>
                <p>לחץ על הכפתור הבא כדי לאפס את הסיסמה שלך:</p>
                <p><a href="{reset_url}" class="button">איפוס סיסמה</a></p>
                <p>או העתק את הקישור הבא לדפדפן שלך:</p>
                <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">{reset_url}</p>
                <p><strong>הקישור תקף ל-24 שעות בלבד.</strong></p>
                <p>אם לא ביקשת לאפס את הסיסמה, תוכל להתעלם מהמייל הזה.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">זהו מייל אוטומטי, אנא אל תשיב למייל זה.</p>
            </div>
        </body>
        </html>
        """
        
        body_text = f"""
איפוס סיסמה - TikTrack

שלום {username},

קיבלנו בקשה לאיפוס הסיסמה שלך במערכת TikTrack.

לחץ על הקישור הבא כדי לאפס את הסיסמה שלך:
{reset_url}

הקישור תקף ל-24 שעות בלבד.

אם לא ביקשת לאפס את הסיסמה, תוכל להתעלם מהמייל הזה.

זהו מייל אוטומטי, אנא אל תשיב למייל זה.
        """
        
        return self.send_email(to_email, subject, body_html, body_text)

