#!/usr/bin/env python3
"""
Phase 4: Page Testing Script
בדיקות פר עמוד - שלב 4 של תהליך הסטנדרטיזציה

בודק:
1. קונסולה נקייה (אין שגיאות, אין warnings מיותרים)
2. לינטר (ESLint)
3. ITCSS (אין inline styles, אין style tags, שימוש ב-CSS classes בלבד)
"""

import os
import json
import subprocess
import re
from pathlib import Path
from datetime import datetime

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI = PROJECT_ROOT / 'trading-ui'
SCRIPTS_DIR = TRADING_UI / 'scripts'
HTML_DIR = TRADING_UI
DOCS_DIR = PROJECT_ROOT / 'documentation' / '05-REPORTS'

# Incomplete pages from INCOMPLETE_PAGES_LIST.md (26 pages)
INCOMPLETE_PAGES = [
    'index', 'tickers', 'trading_accounts', 'cash_flows', 'research',
    'preferences', 'user-profile', 'db_display', 'db_extradata', 'constraints',
    'background-tasks', 'server-monitor', 'system-management', 'cache-test',
    'notifications-center', 'css-management', 'dynamic-colors-display', 'designs',
    'chart-management', 'init-system-management', 'cache-management',
    'tradingview-test-page', 'portfolio-state-page', 'trade-history-page',
    'price-history-page', 'comparative-analysis-page', 'trading-journal-page',
    'strategy-analysis-page', 'economic-calendar-page', 'history-widget',
    'emotional-tracking-widget', 'date-comparison-modal', 'watch-lists',
    'watch-list-modal', 'ai-analysis-page', 'external-data-dashboard'
]

def check_linter(file_path):
    """Check ESLint for a JavaScript file"""
    try:
        # Skip if file doesn't exist
        if not file_path.exists():
            return {'status': 'skip', 'message': 'File not found'}
        
        result = subprocess.run(
            ['npx', 'eslint', str(file_path), '--format', 'json'],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=PROJECT_ROOT
        )
        
        if result.returncode == 0:
            return {'status': 'pass', 'errors': 0, 'warnings': 0}
        
        try:
            lint_data = json.loads(result.stdout)
            if lint_data:
                errors = sum(len([msg for msg in file_data.get('messages', []) if msg.get('severity') == 2]) for file_data in lint_data)
                warnings = sum(
                    len([msg for msg in file_data.get('messages', []) if msg.get('severity') == 1])
                    for file_data in lint_data
                )
                return {'status': 'fail', 'errors': errors, 'warnings': warnings}
            return {'status': 'pass', 'errors': 0, 'warnings': 0}
        except json.JSONDecodeError:
            return {'status': 'error', 'message': 'Failed to parse ESLint output'}
    except subprocess.TimeoutExpired:
        return {'status': 'timeout', 'message': 'ESLint check timed out'}
    except FileNotFoundError:
        return {'status': 'skip', 'message': 'ESLint not found'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def check_inline_styles(html_path):
    """Check for inline styles in HTML"""
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for inline style attributes (but not data-style or other data attributes)
        inline_style_pattern = r'(?<!data-)(?<!data)style\s*=\s*["\'][^"\']*["\']'
        inline_styles = len(re.findall(inline_style_pattern, content, re.IGNORECASE))
        
        # Check for <style> tags (should be minimal, only in specific cases)
        style_tag_pattern = r'<style[^>]*>'
        style_tags = len(re.findall(style_tag_pattern, content, re.IGNORECASE))
        
        return {
            'inline_styles': inline_styles,
            'style_tags': style_tags,
            'status': 'pass' if inline_styles == 0 and style_tags == 0 else 'fail'
        }
    except FileNotFoundError:
        return {'status': 'error', 'message': 'HTML file not found'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def check_js_file_for_patterns(js_path):
    """Check JavaScript file for common patterns"""
    try:
        with open(js_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for console.* (should use Logger)
        console_pattern = r'console\.(log|error|warn|info|debug)'
        console_calls = len(re.findall(console_pattern, content))
        
        # Check for alert/confirm (should use NotificationSystem)
        alert_pattern = r'\balert\s*\('
        confirm_pattern = r'\bconfirm\s*\('
        alerts = len(re.findall(alert_pattern, content))
        confirms = len(re.findall(confirm_pattern, content))
        
        # Check for innerHTML (should use createElement)
        innerhtml_pattern = r'\.innerHTML\s*='
        innerhtml_usage = len(re.findall(innerhtml_pattern, content))
        
        return {
            'console_calls': console_calls,
            'alerts': alerts,
            'confirms': confirms,
            'innerhtml_usage': innerhtml_usage
        }
    except FileNotFoundError:
        return {'status': 'error', 'message': 'JS file not found'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def test_page(page_name):
    """Test a single page"""
    print(f"\n🔍 Testing page: {page_name}")
    
    html_file = HTML_DIR / f'{page_name}.html'
    js_file = SCRIPTS_DIR / f'{page_name}.js'
    
    results = {
        'page': page_name,
        'timestamp': datetime.now().isoformat(),
        'html_exists': html_file.exists(),
        'js_exists': js_file.exists(),
        'linter': None,
        'itcss': None,
        'patterns': None
    }
    
    # Check linter
    if js_file.exists():
        print(f"  📝 Checking linter for {js_file.name}...")
        results['linter'] = check_linter(js_file)
        if results['linter']['status'] == 'pass':
            print(f"    ✅ Linter: PASS (0 errors, 0 warnings)")
        else:
            errors = results['linter'].get('errors', 0)
            warnings = results['linter'].get('warnings', 0)
            print(f"    ⚠️  Linter: {errors} errors, {warnings} warnings")
    
    # Check ITCSS
    if html_file.exists():
        print(f"  🎨 Checking ITCSS for {html_file.name}...")
        results['itcss'] = check_inline_styles(html_file)
        if results['itcss']['status'] == 'pass':
            print(f"    ✅ ITCSS: PASS (no inline styles, no style tags)")
        else:
            inline = results['itcss'].get('inline_styles', 0)
            tags = results['itcss'].get('style_tags', 0)
            print(f"    ⚠️  ITCSS: {inline} inline styles, {tags} style tags")
    
    # Check patterns
    if js_file.exists():
        print(f"  🔍 Checking patterns for {js_file.name}...")
        results['patterns'] = check_js_file_for_patterns(js_file)
        console = results['patterns'].get('console_calls', 0)
        innerhtml = results['patterns'].get('innerhtml_usage', 0)
        alerts = results['patterns'].get('alerts', 0)
        confirms = results['patterns'].get('confirms', 0)
        if console == 0 and innerhtml == 0 and alerts == 0 and confirms == 0:
            print(f"    ✅ Patterns: PASS (no issues found)")
        else:
            print(f"    ⚠️  Patterns: {console} console calls, {innerhtml} innerHTML, {alerts} alerts, {confirms} confirms")
    
    return results

def main():
    """Main testing function"""
    print("=" * 70)
    print("Phase 4: Page Testing - בדיקות פר עמוד")
    print("=" * 70)
    print(f"Testing {len(INCOMPLETE_PAGES)} pages...")
    
    all_results = []
    
    for page in INCOMPLETE_PAGES:
        try:
            results = test_page(page)
            all_results.append(results)
        except Exception as e:
            print(f"  ❌ Error testing {page}: {e}")
            all_results.append({
                'page': page,
                'status': 'error',
                'message': str(e)
            })
    
    # Generate summary
    print("\n" + "=" * 70)
    print("📊 Summary")
    print("=" * 70)
    
    total = len(all_results)
    linter_pass = sum(1 for r in all_results if isinstance(r, dict) and r.get('linter') and r.get('linter', {}).get('status') == 'pass')
    itcss_pass = sum(1 for r in all_results if isinstance(r, dict) and r.get('itcss') and r.get('itcss', {}).get('status') == 'pass')
    
    print(f"Total pages tested: {total}")
    print(f"Linter pass: {linter_pass}/{total} ({linter_pass*100//total if total > 0 else 0}%)")
    print(f"ITCSS pass: {itcss_pass}/{total} ({itcss_pass*100//total if total > 0 else 0}%)")
    
    # Save results
    output_file = DOCS_DIR / 'STANDARDIZATION_PHASE_4_TEST_RESULTS.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_pages': total,
            'results': all_results,
            'summary': {
                'linter_pass': linter_pass,
                'itcss_pass': itcss_pass
            }
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Results saved to: {output_file}")
    
    # Generate markdown report
    report_file = DOCS_DIR / 'STANDARDIZATION_PHASE_4_TEST_REPORT.md'
    generate_markdown_report(all_results, report_file)
    print(f"✅ Report saved to: {report_file}")

def generate_markdown_report(results, output_file):
    """Generate markdown report"""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# דוח בדיקות שלב 4 - בדיקות פר עמוד\n\n")
        f.write(f"**תאריך יצירה:** {datetime.now().strftime('%d/%m/%Y')}\n")
        f.write(f"**סה\"כ עמודים נבדקים:** {len(results)}\n\n")
        f.write("---\n\n")
        
        f.write("## 📊 סיכום כללי\n\n")
        
        total = len(results)
        linter_pass = sum(1 for r in results if isinstance(r, dict) and r.get('linter') and r.get('linter', {}).get('status') == 'pass')
        itcss_pass = sum(1 for r in results if isinstance(r, dict) and r.get('itcss') and r.get('itcss', {}).get('status') == 'pass')
        
        f.write(f"- **סה\"כ עמודים:** {total}\n")
        f.write(f"- **לינטר עבר:** {linter_pass}/{total} ({linter_pass*100//total if total > 0 else 0}%)\n")
        f.write(f"- **ITCSS עבר:** {itcss_pass}/{total} ({itcss_pass*100//total if total > 0 else 0}%)\n\n")
        
        f.write("---\n\n")
        f.write("## 📋 תוצאות מפורטות\n\n")
        f.write("| עמוד | HTML קיים | JS קיים | לינטר | ITCSS | דפוסים | סטטוס |\n")
        f.write("|------|-----------|---------|--------|-------|---------|--------|\n")
        
        for r in results:
            page = r.get('page', 'N/A')
            html = '✅' if r.get('html_exists') else '❌'
            js = '✅' if r.get('js_exists') else '❌'
            
            linter = r.get('linter') or {}
            if isinstance(linter, dict) and linter.get('status') == 'pass':
                linter_status = '✅ PASS'
            elif isinstance(linter, dict) and linter.get('status') == 'fail':
                errors = linter.get('errors', 0)
                warnings = linter.get('warnings', 0)
                linter_status = f'⚠️ {errors}E/{warnings}W'
            else:
                linter_status = '⏭️ SKIP'
            
            itcss = r.get('itcss') or {}
            if isinstance(itcss, dict) and itcss.get('status') == 'pass':
                itcss_status = '✅ PASS'
            elif isinstance(itcss, dict) and itcss.get('status') == 'fail':
                inline = itcss.get('inline_styles', 0)
                tags = itcss.get('style_tags', 0)
                itcss_status = f'⚠️ {inline} inline/{tags} tags'
            else:
                itcss_status = '⏭️ SKIP'
            
            patterns = r.get('patterns') or {}
            if patterns and isinstance(patterns, dict):
                console = patterns.get('console_calls', 0)
                innerhtml = patterns.get('innerhtml_usage', 0)
                alerts = patterns.get('alerts', 0)
                confirms = patterns.get('confirms', 0)
                total_patterns = console + innerhtml + alerts + confirms
                if total_patterns == 0:
                    patterns_status = '✅ PASS'
                else:
                    patterns_status = f'⚠️ {total_patterns} issues'
            else:
                patterns_status = '⏭️ SKIP'
            
            overall = '✅' if (
                isinstance(linter, dict) and linter.get('status') == 'pass' and
                isinstance(itcss, dict) and itcss.get('status') == 'pass' and
                (not patterns or not isinstance(patterns, dict) or sum([
                    patterns.get('console_calls', 0),
                    patterns.get('innerhtml_usage', 0),
                    patterns.get('alerts', 0),
                    patterns.get('confirms', 0)
                ]) == 0)
            ) else '⏳'
            
            f.write(f"| {page} | {html} | {js} | {linter_status} | {itcss_status} | {patterns_status} | {overall} |\n")
        
        f.write("\n---\n\n")
        f.write("## 📝 הערות\n\n")
        f.write("- ✅ = עבר בהצלחה\n")
        f.write("- ⚠️ = נמצאו בעיות\n")
        f.write("- ⏭️ = לא נבדק\n")
        f.write("- ⏳ = בתהליך / לא הושלם\n")

if __name__ == '__main__':
    main()

