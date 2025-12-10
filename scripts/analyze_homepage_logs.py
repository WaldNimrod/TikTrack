#!/usr/bin/env python3
"""
Homepage Console Logs Analysis
==============================

Analyzes homepage console logs and categorizes all messages, warnings, and errors.
"""

import re
from collections import defaultdict, Counter

class HomepageLogsAnalyzer:
    def __init__(self, log_content):
        self.log_content = log_content
        self.categorized_logs = defaultdict(list)
        self.error_summary = Counter()
        self.warning_summary = Counter()
        self.success_summary = Counter()
        self.info_summary = Counter()

    def categorize_log_entry(self, line):
        """Categorize a single log entry"""
        line = line.strip()
        if not line:
            return

        # Remove timestamp if present
        line = re.sub(r'^\[\d{1,2}:\d{2}:\d{2}\]\s+', '', line)

        # Syntax Errors
        if 'Uncaught SyntaxError:' in line:
            self.categorized_logs['syntax_errors'].append(line)
            if 'expected expression, got' in line:
                self.error_summary['syntax_expression_expected'] += 1
            elif 'unreachable code after return statement' in line:
                self.error_summary['unreachable_code'] += 1
            else:
                self.error_summary['other_syntax_errors'] += 1

        # Font/Loading Warnings
        elif 'downloadable font:' in line or 'Layout was forced' in line:
            self.categorized_logs['font_loading_warnings'].append(line)
            if 'Invalid nameID' in line:
                self.warning_summary['font_invalid_nameid'] += 1
            elif 'Table discarded' in line:
                self.warning_summary['font_table_discarded'] += 1
            elif 'Layout was forced' in line:
                self.warning_summary['layout_force_before_load'] += 1

        # Cookie Warnings
        elif 'Partitioned cookie or storage access' in line or 'Cookie warnings' in line:
            self.categorized_logs['cookie_warnings'].append(line)
            self.warning_summary['partitioned_cookie_access'] += 1

        # Success Messages
        elif line.startswith('✅') or 'loaded successfully' in line or 'initialized successfully' in line:
            self.categorized_logs['success_messages'].append(line)
            if 'initialized' in line:
                self.success_summary['initialization_success'] += 1
            elif 'loaded' in line:
                self.success_summary['loading_success'] += 1
            else:
                self.success_summary['other_success'] += 1

        # Warning Messages
        elif line.startswith('⚠️') or 'WARN:' in line or 'not yet available' in line:
            self.categorized_logs['warning_messages'].append(line)
            if 'not yet available' in line:
                self.warning_summary['service_not_available'] += 1
            elif 'Some required services not available' in line:
                self.warning_summary['missing_services'] += 1
            else:
                self.warning_summary['other_warnings'] += 1

        # Info Messages
        elif line.startswith('INFO:') or line.startswith('ℹ️') or line.startswith('🚀') or line.startswith('🔄'):
            self.categorized_logs['info_messages'].append(line)
            if 'initialized' in line.lower():
                self.info_summary['initialization_info'] += 1
            elif 'loaded' in line.lower():
                self.info_summary['loading_info'] += 1
            elif 'starting' in line.lower():
                self.info_summary['startup_info'] += 1
            else:
                self.info_summary['other_info'] += 1

        # System Status Messages
        elif any(prefix in line for prefix in ['🔵', '💾', 'Icon Mappings loaded', 'CacheControlMenu initialized']):
            self.categorized_logs['system_status'].append(line)
            self.info_summary['system_status'] += 1

        # Other messages
        else:
            self.categorized_logs['other'].append(line)

    def analyze_logs(self):
        """Analyze all log entries"""
        lines = self.log_content.split('\n')
        for line in lines:
            self.categorize_log_entry(line)

    def generate_report(self):
        """Generate comprehensive analysis report"""
        print("🧪 דוח ניתוח לוג דף הבית")
        print("=" * 60)

        # Critical Issues Summary
        print("
🚨 סיכום בעיות קריטיות:"        print(f"• שגיאות SyntaxError: {len(self.categorized_logs['syntax_errors'])}")
        print(f"• אזהרות Font Loading: {len(self.categorized_logs['font_loading_warnings'])}")
        print(f"• אזהרות Cookie: {len(self.categorized_logs['cookie_warnings'])}")
        print(f"• קוד unreachable: {self.error_summary['unreachable_code']}")

        print(f"\n📊 סטטיסטיקות כלליות:")
        total_messages = sum(len(msgs) for msgs in self.categorized_logs.values())
        print(f"• סך הודעות: {total_messages}")
        print(f"• הודעות הצלחה: {len(self.categorized_logs['success_messages'])}")
        print(f"• הודעות מידע: {len(self.categorized_logs['info_messages'])}")
        print(f"• אזהרות: {len(self.categorized_logs['warning_messages'])}")
        print(f"• שגיאות: {len(self.categorized_logs['syntax_errors'])}")

        print("
📋 פירוט לפי קטגוריות:"        print("
🔴 שגיאות קריטיות:"        for error in self.categorized_logs['syntax_errors'][:10]:  # Show first 10
            print(f"  • {error}")

        print("
🟡 אזהרות חשובות:"        for warning in self.categorized_logs['font_loading_warnings'][:5]:
            print(f"  • {warning}")
        for warning in self.categorized_logs['warning_messages'][:3]:
            print(f"  • {warning}")

        print("
🟢 הצלחות:"        print(f"  ✅ {self.success_summary['initialization_success']} מערכות אותחלו בהצלחה")
        print(f"  ✅ {self.success_summary['loading_success']} קבצים נטענו בהצלחה")

        print("
🔵 מידע מערכת:"        print(f"  ℹ️ {len(self.categorized_logs['system_status'])} הודעות סטטוס מערכת")
        print(f"  ℹ️ {len(self.categorized_logs['info_messages'])} הודעות מידע")

        return self.generate_recommendations()

    def generate_recommendations(self):
        """Generate actionable recommendations"""
        recommendations = []

        # Critical Syntax Errors
        if self.error_summary['syntax_expression_expected'] > 0:
            recommendations.append({
                'priority': 'CRITICAL',
                'category': 'שגיאות תחביר',
                'issue': f"{self.error_summary['syntax_expression_expected']} שגיאות 'expected expression, got ==='",
                'files': ['auth-debug-monitor.js', 'data-collection-service.js', 'modal-z-index-manager.js', 'preferences-ui-layer.js', 'preferences-ui-v4.js', 'trades-config.js', 'unified-progress-manager.js'],
                'recommendation': 'תקן שגיאות תחביר בקבצים המצוינים - כנראה בעיה עם הגדרות או משתנים'
            })

        # Unreachable Code
        if self.error_summary['unreachable_code'] > 0:
            recommendations.append({
                'priority': 'HIGH',
                'category': 'קוד מת',
                'issue': f"{self.error_summary['unreachable_code']} מקרים של unreachable code after return",
                'files': ['import-user-data.js', 'conditions-modal-controller.js', 'unified-pending-actions-widget.js'],
                'recommendation': 'הסר קוד שמוגדר כ-unreachable או תקן את מבנה הפונקציות'
            })

        # Font Loading Issues
        if self.warning_summary['font_invalid_nameid'] > 0:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'טעינת גופנים',
                'issue': f"{self.warning_summary['font_invalid_nameid']} אזהרות Invalid nameID בגופני Noto Sans Hebrew",
                'recommendation': 'בדוק הגדרות Google Fonts או החלף לגופנים חלופיים'
            })

        # Layout Issues
        if self.warning_summary['layout_force_before_load'] > 0:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'Layout Performance',
                'issue': 'Layout was forced before the page was fully loaded',
                'recommendation': 'שפר טעינת CSS או השתמש ב-CSS loading strategies מיטביות'
            })

        # Cookie Warnings
        if self.warning_summary['partitioned_cookie_access'] > 0:
            recommendations.append({
                'priority': 'LOW',
                'category': 'Cookies & Storage',
                'issue': 'Partitioned cookie access warnings',
                'recommendation': 'זה נורמלי ב-Third-party context (TradingView widgets) - לא דורש טיפול'
            })

        # Missing Services
        if self.warning_summary['service_not_available'] > 0:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'אינטגרציית שירותים',
                'issue': 'חלק מהשירותים לא זמינים בעת האתחול',
                'recommendation': 'שפר סדר טעינת dependencies או הוסף retry mechanism'
            })

        return recommendations

def main():
    # Read the log content from a file or use the provided content
    # For now, we'll create a placeholder that expects the log content to be passed
    print("🔍 ניתוח לוג דף הבית")
    print("הערה: יש להעביר את תוכן הלוג כפרמטר או מקובץ")
    print("ניתן להריץ: python3 scripts/analyze_homepage_logs.py <log_file>")
    print("\nאו להשתמש בתוכן שהועבר...")

if __name__ == "__main__":
    main()
