#!/usr/bin/env python3
"""
סריקה מקיפה של עמודי כלי הפיתוח
Comprehensive Scan of Development Tools Pages

סורק את כל עמודי כלי הפיתוח והעמודים הטכניים, מזהה בעיות ודפוסים חוזרים.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Any, Set
from datetime import datetime
from collections import defaultdict
import json

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
PAGES_ROOT = PROJECT_ROOT / "trading-ui"
REPORTS_DIR = PROJECT_ROOT / "documentation" / "05-REPORTS"

# עמודי כלי פיתוח ועמודים טכניים
DEVELOPMENT_TOOLS_PAGES = [
    # עמודים טכניים (12)
    "db_display.html",
    "db_extradata.html",
    "constraints.html",
    "background-tasks.html",
    "server-monitor.html",
    "system-management.html",
    "cache-test.html",
    "notifications-center.html",
    "css-management.html",
    "dynamic-colors-display.html",
    "designs.html",
    "tradingview-test-page.html",
    
    # עמודים משניים (2)
    "external-data-dashboard.html",
    "chart-management.html",
    
    # עמודי כלי פיתוח נוספים
    "code-quality-dashboard.html",
    "crud-testing-dashboard.html",
    "init-system-management.html",
    "conditions-test.html",
    "tag-management.html",
    "data_import.html",
    "cache-management.html",
    "preferences-groups-management.html",
    "button-color-mapping.html",
    "tradingview-widgets-showcase.html",
]

class DevelopmentToolsScanner:
    def __init__(self):
        self.results = {
            'scanned_at': datetime.now().isoformat(),
            'pages': {},
            'patterns': defaultdict(list),
            'summary': {
                'total_pages': 0,
                'pages_exist': 0,
                'pages_missing': 0,
                'total_issues': 0,
                'issues_by_type': defaultdict(int),
            }
        }
    
    def scan_page(self, page_name: str) -> Dict[str, Any]:
        """סורק עמוד בודד ומזהה בעיות"""
        page_path = PAGES_ROOT / page_name
        result = {
            'page': page_name,
            'exists': False,
            'path': str(page_path),
            'issues': [],
            'warnings': [],
            'stats': {},
        }
        
        if not page_path.exists():
            result['issues'].append({
                'type': 'file_missing',
                'severity': 'critical',
                'message': f'קובץ לא קיים: {page_name}',
            })
            return result
        
        result['exists'] = True
        self.results['summary']['pages_exist'] += 1
        
        try:
            content = page_path.read_text(encoding='utf-8')
            result['stats'] = {
                'file_size': len(content),
                'lines_count': len(content.splitlines()),
            }
            
            # בדיקות
            self._check_inline_styles(content, result)
            self._check_missing_icon_system(content, result)
            self._check_syntax_errors(content, result, page_name)
            self._check_missing_scripts(content, result)
            self._check_load_order(content, result)
            self._check_console_usage(content, result)
            
        except Exception as e:
            result['issues'].append({
                'type': 'scan_error',
                'severity': 'critical',
                'message': f'שגיאה בסריקה: {str(e)}',
            })
        
        return result
    
    def _check_inline_styles(self, content: str, result: Dict):
        """בודק inline styles"""
        # בדיקת style="..." attributes
        inline_styles = re.findall(r'style\s*=\s*["\']([^"\']+)["\']', content)
        # מסנן dynamic styles שנוצרים ע"י JavaScript
        dynamic_patterns = [
            r'style\s*=\s*["\']\{[^"\']+\}["\']',  # Template literals
            r'style\s*=\s*`[^`]+`',  # Template literals
        ]
        
        real_inline_styles = []
        for style in inline_styles:
            # דילוג על dynamic styles
            if any(re.search(pattern, style) for pattern in dynamic_patterns):
                continue
            # דילוג על styles שנוצרים ע"י JavaScript
            if '{{' in style or '}}' in style:
                continue
            real_inline_styles.append(style)
        
        if real_inline_styles:
            result['issues'].append({
                'type': 'inline_styles',
                'severity': 'medium',
                'count': len(real_inline_styles),
                'examples': real_inline_styles[:5],
                'message': f'נמצאו {len(real_inline_styles)} inline styles (אינם תואמים ITCSS)',
            })
            self.results['patterns']['inline_styles'].append(result['page'])
    
    def _check_missing_icon_system(self, content: str, result: Dict):
        """בודק אם IconSystem scripts חסרים"""
        icon_scripts = [
            'icon-mappings.js',
            'icon-system.js',
            'icon-replacement-helper.js',
        ]
        
        missing = []
        for script in icon_scripts:
            if script not in content:
                missing.append(script)
        
        if missing:
            result['issues'].append({
                'type': 'missing_icon_system',
                'severity': 'high',
                'scripts': missing,
                'message': f'סקריפטים חסרים של IconSystem: {", ".join(missing)}',
            })
            self.results['patterns']['missing_icon_system'].append(result['page'])
    
    def _check_syntax_errors(self, content: str, result: Dict, page_name: str):
        """בודק שגיאות syntax נפוצות ב-JavaScript"""
        issues = []
        
        # בדיקת await בלא async function
        await_pattern = r'await\s+\w+\([^)]*\)'
        function_pattern = r'(function\s*\w*\s*\([^)]*\)|const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)|async\s+function)'
        
        lines = content.split('\n')
        for i, line in enumerate(lines, 1):
            if 'await' in line:
                # בודק אם זה בתוך async function
                before_lines = '\n'.join(lines[max(0, i-20):i])
                if not re.search(r'async\s+(function|\(|\w+\s*=\s*\()', before_lines):
                    # בודק אם זה לא בתוך IIFE או module
                    if not re.search(r'(async\s*\(|async\s*function|module|export)', before_lines):
                        issues.append({
                            'line': i,
                            'code': line.strip(),
                            'message': 'await בשימוש ללא async function',
                        })
        
        # בדיקת redundant braces
        try_blocks = re.finditer(r'try\s*\{[^}]*\}', content, re.DOTALL)
        for match in try_blocks:
            block = match.group(0)
            # בודק אם יש } עודפת
            if block.count('}') > block.count('{'):
                issues.append({
                    'line': content[:match.start()].count('\n') + 1,
                    'message': 'ייתכן שיש } עודפת ב-try block',
                })
        
        if issues:
            result['issues'].append({
                'type': 'syntax_errors',
                'severity': 'critical',
                'count': len(issues),
                'examples': issues[:5],
                'message': f'נמצאו {len(issues)} שגיאות syntax אפשריות',
            })
            self.results['patterns']['syntax_errors'].append(result['page'])
    
    def _check_missing_scripts(self, content: str, result: Dict):
        """בודק סקריפטים קריטיים חסרים"""
        critical_scripts = [
            'unified-app-initializer.js',
            'logger-service.js',
            'header-system.js',
        ]
        
        missing = []
        for script in critical_scripts:
            if script not in content:
                missing.append(script)
        
        if missing:
            result['issues'].append({
                'type': 'missing_critical_scripts',
                'severity': 'high',
                'scripts': missing,
                'message': f'סקריפטים קריטיים חסרים: {", ".join(missing)}',
            })
            self.results['patterns']['missing_critical_scripts'].append(result['page'])
    
    def _check_load_order(self, content: str, result: Dict):
        """בודק סדר טעינה של סקריפטים"""
        # בודק אם Bootstrap נטען לפני master.css
        bootstrap_pattern = r'<link[^>]*bootstrap[^>]*>'
        master_css_pattern = r'<link[^>]*master\.css[^>]*>'
        
        bootstrap_matches = list(re.finditer(bootstrap_pattern, content, re.IGNORECASE))
        master_css_matches = list(re.finditer(master_css_pattern, content, re.IGNORECASE))
        
        if bootstrap_matches and master_css_matches:
            bootstrap_pos = bootstrap_matches[0].start()
            master_css_pos = master_css_matches[0].start()
            
            if master_css_pos < bootstrap_pos:
                result['warnings'].append({
                    'type': 'load_order',
                    'severity': 'medium',
                    'message': 'master.css נטען לפני Bootstrap - עלול לגרום לבעיות',
                })
                self.results['patterns']['load_order_issues'].append(result['page'])
    
    def _check_console_usage(self, content: str, result: Dict):
        """בודק שימוש ב-console.* במקום Logger Service"""
        console_patterns = [
            r'console\.log\s*\(',
            r'console\.warn\s*\(',
            r'console\.error\s*\(',
            r'console\.info\s*\(',
        ]
        
        console_usage = []
        for pattern in console_patterns:
            matches = re.findall(pattern, content)
            console_usage.extend(matches)
        
        if console_usage:
            result['warnings'].append({
                'type': 'console_usage',
                'severity': 'low',
                'count': len(console_usage),
                'message': f'נמצאו {len(console_usage)} שימושים ב-console.* - מומלץ להשתמש ב-Logger Service',
            })
            self.results['patterns']['console_usage'].append(result['page'])
    
    def scan_all(self):
        """סורק את כל העמודים"""
        print(f"🔍 מתחיל סריקה מקיפה של {len(DEVELOPMENT_TOOLS_PAGES)} עמודי כלי פיתוח...")
        
        for page_name in DEVELOPMENT_TOOLS_PAGES:
            print(f"  📄 סורק {page_name}...")
            result = self.scan_page(page_name)
            self.results['pages'][page_name] = result
            
            # עדכון סיכום
            self.results['summary']['total_pages'] += 1
            if not result['exists']:
                self.results['summary']['pages_missing'] += 1
            
            for issue in result['issues']:
                self.results['summary']['total_issues'] += 1
                self.results['summary']['issues_by_type'][issue['type']] += 1
        
        # ניתוח דפוסים
        self._analyze_patterns()
    
    def _analyze_patterns(self):
        """מנתח דפוסים חוזרים"""
        patterns_analysis = {}
        
        for pattern_type, pages in self.results['patterns'].items():
            patterns_analysis[pattern_type] = {
                'count': len(pages),
                'pages': pages,
                'percentage': round((len(pages) / self.results['summary']['pages_exist']) * 100, 1) if self.results['summary']['pages_exist'] > 0 else 0,
            }
        
        self.results['patterns_analysis'] = patterns_analysis
    
    def generate_report(self) -> str:
        """מייצר דוח מפורט"""
        report_lines = [
            "# דוח סריקה מקיפה - עמודי כלי פיתוח",
            "",
            f"**תאריך:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}",
            "",
            "## 📊 סיכום כללי",
            "",
            f"- **סה\"כ עמודים:** {self.results['summary']['total_pages']}",
            f"- **עמודים קיימים:** {self.results['summary']['pages_exist']}",
            f"- **עמודים חסרים:** {self.results['summary']['pages_missing']}",
            f"- **סה\"כ בעיות:** {self.results['summary']['total_issues']}",
            "",
            "### התפלגות בעיות לפי סוג:",
            "",
        ]
        
        # סדר בעיות לפי חומרה
        severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        
        for issue_type, count in sorted(
            self.results['summary']['issues_by_type'].items(),
            key=lambda x: x[1],
            reverse=True
        ):
            report_lines.append(f"- **{issue_type}:** {count} מופעים")
        
        report_lines.extend([
            "",
            "## 🔍 דפוסים חוזרים",
            "",
        ])
        
        if self.results.get('patterns_analysis'):
            for pattern_type, analysis in sorted(
                self.results['patterns_analysis'].items(),
                key=lambda x: x[1]['count'],
                reverse=True
            ):
                report_lines.extend([
                    f"### {pattern_type}",
                    f"- **עמודים מושפעים:** {analysis['count']} ({analysis['percentage']}%)",
                    f"- **רשימת עמודים:** {', '.join(analysis['pages'])}",
                    "",
                ])
        
        report_lines.extend([
            "## 📄 דוח מפורט לפי עמוד",
            "",
        ])
        
        # דוח מפורט לכל עמוד
        for page_name, result in sorted(self.results['pages'].items()):
            report_lines.extend([
                f"### {page_name}",
                "",
                f"- **קיים:** {'✅' if result['exists'] else '❌'}",
            ])
            
            if result.get('stats'):
                report_lines.append(f"- **גודל קובץ:** {result['stats'].get('file_size', 0):,} bytes")
                report_lines.append(f"- **מספר שורות:** {result['stats'].get('lines_count', 0):,}")
            
            if result['issues']:
                report_lines.append("")
                report_lines.append("#### בעיות:")
                for issue in result['issues']:
                    severity_emoji = {
                        'critical': '🔴',
                        'high': '🟠',
                        'medium': '🟡',
                        'low': '🔵',
                    }.get(issue['severity'], '⚪')
                    
                    report_lines.append(f"- {severity_emoji} **{issue['type']}** ({issue['severity']}): {issue['message']}")
                    
                    if 'examples' in issue:
                        for example in issue['examples'][:3]:
                            report_lines.append(f"  - `{str(example)[:100]}`")
            
            if result['warnings']:
                report_lines.append("")
                report_lines.append("#### אזהרות:")
                for warning in result['warnings']:
                    report_lines.append(f"- ⚠️ **{warning['type']}**: {warning['message']}")
            
            report_lines.append("")
        
        # המלצות
        report_lines.extend([
            "## 💡 המלצות לתיקון",
            "",
        ])
        
        if 'inline_styles' in self.results['patterns']:
            report_lines.extend([
                "### תיקון Inline Styles",
                "",
                "1. יצירת קובץ CSS ספציפי בעמוד ב-`styles-new/07-pages/`",
                "2. העברת כל ה-inline styles לקובץ CSS",
                "3. הוספת `<link>` לקובץ CSS ב-HTML",
                "",
            ])
        
        if 'missing_icon_system' in self.results['patterns']:
            report_lines.extend([
                "### הוספת IconSystem",
                "",
                "הוסף את הסקריפטים הבאים ל-`<head>` אחרי `unified-cache-manager.js`:",
                "```html",
                "<script src=\"scripts/icon-mappings.js?v=1.0.0\"></script>",
                "<script src=\"scripts/icon-system.js?v=1.0.0\"></script>",
                "<script src=\"scripts/icon-replacement-helper.js?v=1.0.0\"></script>",
                "```",
                "",
            ])
        
        if 'syntax_errors' in self.results['patterns']:
            report_lines.extend([
                "### תיקון שגיאות Syntax",
                "",
                "1. בדוק שימוש ב-`await` - ודא שהפונקציה היא `async`",
                "2. בדוק `try...catch` blocks - ודא שאין } עודפות",
                "3. בדוק `forEach` loops - אם יש `await`, החלף ל-`for...of`",
                "",
            ])
        
        return '\n'.join(report_lines)
    
    def save_report(self):
        """שומר את הדוח לקובץ"""
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        
        report_content = self.generate_report()
        json_content = json.dumps(self.results, indent=2, ensure_ascii=False)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = REPORTS_DIR / f"DEVELOPMENT_TOOLS_COMPREHENSIVE_SCAN_{timestamp}.md"
        json_file = REPORTS_DIR / f"DEVELOPMENT_TOOLS_COMPREHENSIVE_SCAN_{timestamp}.json"
        
        report_file.write_text(report_content, encoding='utf-8')
        json_file.write_text(json_content, encoding='utf-8')
        
        print(f"\n✅ דוח נשמר:")
        print(f"  📄 {report_file}")
        print(f"  📄 {json_file}")
        
        return report_file, json_file


def main():
    scanner = DevelopmentToolsScanner()
    scanner.scan_all()
    scanner.save_report()
    
    print(f"\n📊 סיכום:")
    print(f"  ✅ עמודים קיימים: {scanner.results['summary']['pages_exist']}")
    print(f"  ❌ עמודים חסרים: {scanner.results['summary']['pages_missing']}")
    print(f"  🔴 סה\"כ בעיות: {scanner.results['summary']['total_issues']}")
    print(f"  🔍 דפוסים זוהו: {len(scanner.results.get('patterns_analysis', {}))}")


if __name__ == '__main__':
    main()

