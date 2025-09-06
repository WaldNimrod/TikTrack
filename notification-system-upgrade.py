#!/usr/bin/env python3
"""
Notification System Upgrade Script
==================================

סקריפט להחלפת כל השימושים ב-alert() ו-confirm() רגילים למערכת ההתראות המתקדמת של TikTrack.

המערכת המתקדמת כוללת:
1. showSuccessNotification(title, message)
2. showErrorNotification(title, message) 
3. showWarningNotification(title, message)
4. showInfoNotification(title, message)
5. showConfirmationDialog(title, message, onConfirm, onCancel)
6. showDeleteWarning(itemType, itemName, itemTypeDisplay, onConfirm, onCancel)

גרסה: 1.0
תאריך: ספטמבר 2025
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime


class NotificationSystemUpgrader:
    def __init__(self, base_path="trading-ui"):
        self.base_path = Path(base_path)
        self.results = {
            'files_processed': 0,
            'alerts_replaced': 0,
            'confirms_replaced': 0,
            'errors': [],
            'files_modified': []
        }
        
    def analyze_file(self, file_path):
        """ניתוח קובץ יחיד למציאת alert() ו-confirm()"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            alerts = list(re.finditer(r'\balert\s*\([^)]*\)', content))
            confirms = list(re.finditer(r'\bconfirm\s*\([^)]*\)', content))
            
            return {
                'alerts': alerts,
                'confirms': confirms,
                'content': content,
                'modified': False
            }
        except Exception as e:
            self.results['errors'].append(f"Error reading {file_path}: {e}")
            return None
    
    def extract_message_from_alert(self, alert_match):
        """חילוץ ההודעה מתוך קריאת alert()"""
        alert_call = alert_match.group(0)
        
        # חיפוש התוכן בין הסוגריים
        match = re.search(r'alert\s*\(\s*([^)]+)\s*\)', alert_call)
        if match:
            message_part = match.group(1).strip()
            
            # הסרת גרשים/גרשיים אם קיימים
            if message_part.startswith('"') and message_part.endswith('"'):
                message_part = message_part[1:-1]
            elif message_part.startswith("'") and message_part.endswith("'"):
                message_part = message_part[1:-1]
            
            return message_part
        return "הודעה"
    
    def extract_message_from_confirm(self, confirm_match):
        """חילוץ ההודעה מתוך קריאת confirm()"""
        confirm_call = confirm_match.group(0)
        
        # חיפוש התוכן בין הסוגריים
        match = re.search(r'confirm\s*\(\s*([^)]+)\s*\)', confirm_call)
        if match:
            message_part = match.group(1).strip()
            
            # הסרת גרשים/גרשיים אם קיימים
            if message_part.startswith('"') and message_part.endswith('"'):
                message_part = message_part[1:-1]
            elif message_part.startswith("'") and message_part.endswith("'"):
                message_part = message_part[1:-1]
            
            return message_part
        return "האם אתה בטוח?"
    
    def determine_notification_type(self, message):
        """קביעת סוג ההתראה לפי תוכן ההודעה"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['שגיאה', 'error', 'שגיאת', 'נכשל', 'לא זמין']):
            return 'error'
        elif any(word in message_lower for word in ['הושלם', 'נשמר', 'הצלחה', 'בוצע', 'נוצר']):
            return 'success'
        elif any(word in message_lower for word in ['אזהרה', 'warning', 'לא מומלץ', 'זהירות']):
            return 'warning'
        else:
            return 'info'
    
    def replace_alert(self, content, alert_match):
        """החלפת alert() בשיטה המתקדמת"""
        alert_call = alert_match.group(0)
        message = self.extract_message_from_alert(alert_match)
        notification_type = self.determine_notification_type(message)
        
        # יצירת הקריאה החדשה
        if notification_type == 'error':
            replacement = f"if (typeof window.showErrorNotification === 'function') {{ window.showErrorNotification('שגיאה', `{message}`); }} else {{ alert(`{message}`); }}"
        elif notification_type == 'success':
            replacement = f"if (typeof window.showSuccessNotification === 'function') {{ window.showSuccessNotification('הצלחה', `{message}`); }} else {{ alert(`{message}`); }}"
        elif notification_type == 'warning':
            replacement = f"if (typeof window.showWarningNotification === 'function') {{ window.showWarningNotification('אזהרה', `{message}`); }} else {{ alert(`{message}`); }}"
        else:
            replacement = f"if (typeof window.showInfoNotification === 'function') {{ window.showInfoNotification('מידע', `{message}`); }} else {{ alert(`{message}`); }}"
        
        # החלפה בתוכן
        new_content = content.replace(alert_call, replacement, 1)
        return new_content
    
    def replace_confirm_simple(self, content, confirm_match):
        """החלפת confirm() פשוט (ללא callback מורכב)"""
        confirm_call = confirm_match.group(0)
        message = self.extract_message_from_confirm(confirm_match)
        
        # החלפה בשיטה המתקדמת עם fallback
        replacement = f"(typeof window.showConfirmationDialog === 'function' ? await new Promise(resolve => window.showConfirmationDialog('אישור', `{message}`, () => resolve(true), () => resolve(false))) : confirm(`{message}`))"
        
        new_content = content.replace(confirm_call, replacement, 1)
        return new_content
    
    def analyze_confirm_context(self, content, confirm_match):
        """ניתוח הקונטקסט של confirm() לקביעת אסטרטגיית החלפה"""
        # מציאת השורות סביב ה-confirm
        start_pos = max(0, confirm_match.start() - 200)
        end_pos = min(len(content), confirm_match.end() + 200)
        context = content[start_pos:end_pos]
        
        # בדיקה אם זה confirm של מחיקה
        if any(word in context.lower() for word in ['delete', 'מחק', 'למחוק', 'מחיק']):
            return 'delete'
        
        # בדיקה אם זה בתוך if statement
        if 'if' in context and ('confirmed' in context or 'result' in context):
            return 'conditional'
        
        return 'simple'
    
    def replace_confirm_conditional(self, content, confirm_match):
        """החלפת confirm() במקרה של שימוש בתוך תנאי"""
        confirm_call = confirm_match.group(0)
        message = self.extract_message_from_confirm(confirm_match)
        
        # חיפוש הקונטקסט המלא
        lines = content.split('\n')
        confirm_line_num = content[:confirm_match.start()].count('\n')
        
        # מציאת השורה עם ה-if
        current_line = lines[confirm_line_num].strip()
        
        if current_line.startswith('if') and 'confirm(' in current_line:
            # זהו if statement עם confirm - נחליף לפונקציה async
            replacement = f"if (typeof window.showConfirmationDialog === 'function') {{\n"
            replacement += f"      window.showConfirmationDialog('אישור', `{message}`, () => {{\n"
            replacement += f"        // הקוד שהיה אחרי ה-if\n"
            replacement += f"      }}, () => {{\n"
            replacement += f"        // ביטול - אין קוד נוסף\n"
            replacement += f"      }});\n"
            replacement += f"    }} else {{\n"
            replacement += f"      if (confirm(`{message}`)) {{\n"
            replacement += f"        // הקוד שהיה אחרי ה-if\n"
            replacement += f"      }}\n"
            replacement += f"    }}"
            
            # החלפת השורה כולה
            new_line = current_line.replace(f"if ({confirm_call})", replacement)
            lines[confirm_line_num] = new_line
            
            return '\n'.join(lines)
        
        # אם לא, פשוט נחליף את ה-confirm
        return self.replace_confirm_simple(content, confirm_match)
    
    def process_file(self, file_path):
        """עיבוד קובץ יחיד - החלפת כל ה-alert ו-confirm"""
        print(f"🔄 מעבד קובץ: {file_path}")
        
        analysis = self.analyze_file(file_path)
        if not analysis:
            return
        
        content = analysis['content']
        modified = False
        
        # החלפת כל ה-alerts
        for alert_match in reversed(analysis['alerts']):  # מאחור לקדמת כדי לא לפגוע במיקומים
            try:
                content = self.replace_alert(content, alert_match)
                self.results['alerts_replaced'] += 1
                modified = True
                print(f"  ✅ הוחלף alert: {self.extract_message_from_alert(alert_match)[:50]}...")
            except Exception as e:
                print(f"  ❌ שגיאה בהחלפת alert: {e}")
        
        # החלפת כל ה-confirms
        for confirm_match in reversed(analysis['confirms']):
            try:
                context_type = self.analyze_confirm_context(content, confirm_match)
                
                if context_type == 'conditional':
                    content = self.replace_confirm_conditional(content, confirm_match)
                else:
                    content = self.replace_confirm_simple(content, confirm_match)
                
                self.results['confirms_replaced'] += 1
                modified = True
                print(f"  ✅ הוחלף confirm ({context_type}): {self.extract_message_from_confirm(confirm_match)[:50]}...")
            except Exception as e:
                print(f"  ❌ שגיאה בהחלפת confirm: {e}")
        
        # שמירת הקובץ אם שונה
        if modified:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                self.results['files_modified'].append(str(file_path))
                print(f"  💾 קובץ נשמר עם שינויים")
            except Exception as e:
                self.results['errors'].append(f"Error saving {file_path}: {e}")
        
        self.results['files_processed'] += 1
    
    def scan_and_upgrade(self):
        """סריקה והחלפה של כל הקבצים"""
        print("🚀 מתחיל שדרוג מערכת ההתראות")
        print("=" * 50)
        
        # סריקת כל קבצי JavaScript
        js_files = list(self.base_path.glob('scripts/**/*.js'))
        
        # סריקת כל קבצי HTML עם JavaScript מוטבע
        html_files = list(self.base_path.glob('**/*.html'))
        
        all_files = js_files + html_files
        
        print(f"📁 נמצאו {len(all_files)} קבצים לעיבוד")
        print(f"   - {len(js_files)} קבצי JavaScript")
        print(f"   - {len(html_files)} קבצי HTML")
        print("")
        
        # עיבוד כל הקבצים
        for file_path in all_files:
            if file_path.exists():
                self.process_file(file_path)
        
        # הדפסת תוצאות
        self.print_results()
        
        # יצירת דוח
        self.create_report()
    
    def print_results(self):
        """הדפסת תוצאות הסריקה"""
        print("\n" + "=" * 50)
        print("📊 תוצאות שדרוג מערכת ההתראות")
        print("=" * 50)
        
        print(f"📄 קבצים עובדו: {self.results['files_processed']}")
        print(f"🔄 קבצים שונו: {len(self.results['files_modified'])}")
        print(f"🚨 alerts הוחלפו: {self.results['alerts_replaced']}")
        print(f"❓ confirms הוחלפו: {self.results['confirms_replaced']}")
        print(f"❌ שגיאות: {len(self.results['errors'])}")
        
        if self.results['files_modified']:
            print(f"\n📋 קבצים שעברו שינוי:")
            for file_path in self.results['files_modified']:
                print(f"   - {file_path}")
        
        if self.results['errors']:
            print(f"\n❌ שגיאות:")
            for error in self.results['errors']:
                print(f"   - {error}")
        
        print(f"\n🎯 סיכום:")
        print(f"   ✅ {self.results['alerts_replaced'] + self.results['confirms_replaced']} החלפות בוצעו בהצלחה")
        print(f"   🔧 המערכת עודכנה למערכת ההתראות המתקדמת")
    
    def create_report(self):
        """יצירת דוח מפורט"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = f"notification-upgrade-report-{timestamp}.json"
        
        report_data = {
            'timestamp': timestamp,
            'summary': self.results,
            'upgrade_info': {
                'old_methods': ['alert()', 'confirm()'],
                'new_methods': [
                    'showSuccessNotification(title, message)',
                    'showErrorNotification(title, message)',
                    'showWarningNotification(title, message)', 
                    'showInfoNotification(title, message)',
                    'showConfirmationDialog(title, message, onConfirm, onCancel)'
                ]
            }
        }
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n📋 דוח מפורט נשמר: {report_file}")


def main():
    """פונקציה ראשית"""
    upgrader = NotificationSystemUpgrader()
    upgrader.scan_and_upgrade()


if __name__ == "__main__":
    main()