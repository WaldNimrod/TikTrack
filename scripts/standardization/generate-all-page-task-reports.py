#!/usr/bin/env python3
"""
Script to generate task reports for all incomplete pages
Uses deep-audit-page.py to audit each page and generates markdown reports
"""

import subprocess
import json
import sys
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent.parent
SCRIPTS_DIR = BASE_DIR / 'scripts' / 'standardization'
REPORTS_DIR = BASE_DIR / 'documentation' / '05-REPORTS'

# List of incomplete pages
INCOMPLETE_PAGES = [
    'index.html',
    'tickers.html',
    'trading_accounts.html',
    'cash_flows.html',
    'research.html',
    'preferences.html',
    'user_profile.html',
    'db_display.html',
    'db_extradata.html',
    'constraints.html',
    'background_tasks.html',
    'server_monitor.html',
    'system_management.html',
    'cache-test.html',
    'notifications_center.html',
    'css_management.html',
    'dynamic_colors_display.html',
    'designs.html',
    'tradingview_test_page.html',
    'external_data_dashboard.html',
    'chart_management.html',
    'portfolio_state_page.html',
    'trade_history_page.html',
    'comparative_analysis_page.html',
    'trading_journal_page.html',
    'strategy_analysis_page.html',
    'economic_calendar_page.html',
    'history_widget.html',
    'emotional_tracking_widget.html',
    'date_comparison_modal.html',
]

def generate_task_report(page_name, audit_data):
    """Generate a markdown task report for a page"""
    page_id = page_name.replace('.html', '').replace('-', '_')
    
    # Determine category
    if page_name in ['index.html', 'tickers.html', 'trading_accounts.html', 'cash_flows.html', 
                     'research.html', 'preferences.html', 'user_profile.html']:
        category = 'עמוד מרכזי'
        priority = 'גבוהה'
    elif page_name in ['db_display.html', 'db_extradata.html', 'constraints.html', 
                       'background_tasks.html', 'server_monitor.html', 'system_management.html',
                       'cache-test.html', 'notifications_center.html', 'css_management.html',
                       'dynamic_colors_display.html', 'designs.html', 'tradingview_test_page.html']:
        category = 'עמוד טכני'
        priority = 'בינונית'
    elif page_name in ['external_data_dashboard.html', 'chart_management.html']:
        category = 'עמוד משני'
        priority = 'בינונית'
    else:
        category = 'עמוד מוקאפ'
        priority = 'נמוכה'
    
    # Count issues by category
    issues_by_category = {}
    total_issues = 0
    
    for cat_name, cat_data in audit_data.get('categories', {}).items():
        if cat_data.get('status') in ['issues_found', 'missing']:
            issues = cat_data.get('issues', [])
            if issues:
                issues_by_category[cat_name] = issues
                total_issues += len(issues)
    
    # Generate markdown
    md_content = f"""# דוח משימות - {page_name}

**תאריך יצירה:** {Path(__file__).stat().st_mtime}  
**קטגוריה:** {category}  
**עדיפות:** {priority}

---

## סטטוס נוכחי

- **קובץ JS:** {audit_data.get('js_file', 'לא נמצא')}
- **קובץ HTML:** {audit_data.get('html_file', 'לא נמצא')}
- **סה"כ בעיות:** {total_issues}

---

## סיכום קטגוריות

"""
    
    # Add category summary
    for cat_name, cat_data in audit_data.get('categories', {}).items():
        status = cat_data.get('status', 'unknown')
        issue_count = cat_data.get('issue_count', 0)
        
        status_icon = '✅' if status == 'ok' else '⚠️' if status == 'issues_found' else '❌' if status == 'missing' else '❓'
        
        md_content += f"- {status_icon} **{cat_name}**: {status} ({issue_count} בעיות)\n"
    
    md_content += "\n---\n\n## בעיות מפורטות\n\n"
    
    # Add detailed issues
    for cat_name, issues in issues_by_category.items():
        if issues:
            md_content += f"### {cat_name}\n\n"
            for issue in issues[:10]:  # Limit to 10 issues per category
                line = issue.get('line', '?')
                content = issue.get('content', '')
                file_type = issue.get('file', 'js')
                md_content += f"- **שורה {line}** ({file_type}): `{content[:80]}...`\n"
            if len(issues) > 10:
                md_content += f"- ... ועוד {len(issues) - 10} בעיות\n"
            md_content += "\n"
    
    md_content += "---\n\n## תיקונים נדרשים\n\n"
    
    # Generate fix recommendations based on issues
    fixes = []
    
    if any('console' in cat for cat in issues_by_category.keys()):
        fixes.append("- החלפת console.* ב-Logger Service")
    
    if any('alert' in cat or 'confirm' in cat for cat in issues_by_category.keys()):
        fixes.append("- החלפת alert/confirm ב-NotificationSystem")
    
    if any('localStorage' in cat for cat in issues_by_category.keys()):
        fixes.append("- החלפת localStorage ב-PageStateManager")
    
    if any('bootstrap.Modal' in cat for cat in issues_by_category.keys()):
        fixes.append("- החלפת bootstrap.Modal ב-ModalManagerV2")
    
    if any('innerHTML' in cat for cat in issues_by_category.keys()):
        fixes.append("- החלפת innerHTML ב-createElement")
    
    if any('querySelector' in cat for cat in issues_by_category.keys()):
        fixes.append("- החלפת querySelector().value ב-DataCollectionService")
    
    if any('missing' in str(cat_data.get('status')) for cat_data in audit_data.get('categories', {}).values()):
        fixes.append("- הוספת מערכות חסרות (ראה מטריצת סטנדרטיזציה)")
    
    if fixes:
        for fix in fixes:
            md_content += f"{fix}\n"
    else:
        md_content += "- אין תיקונים נדרשים (כל הקטגוריות תקינות)\n"
    
    md_content += f"\n---\n\n## הערכת זמן\n\n"
    md_content += f"- **עדיפות:** {priority}\n"
    md_content += f"- **זמן משוער:** {estimate_time(total_issues, priority)}\n"
    
    md_content += "\n---\n\n**הערות:**\n"
    md_content += "- דוח זה נוצר אוטומטית על בסיס סריקה מעמיקה\n"
    md_content += "- יש לבדוק ידנית את כל הבעיות לפני תיקון\n"
    md_content += "- ראה `STANDARDIZATION_REMAINING_PAGES_TASKS_REPORT.md` למידע נוסף\n"
    
    return md_content

def estimate_time(issue_count, priority):
    """Estimate time based on issue count and priority"""
    base_time = issue_count * 0.1  # 6 minutes per issue
    
    if priority == 'גבוהה':
        multiplier = 1.5
    elif priority == 'בינונית':
        multiplier = 1.0
    else:
        multiplier = 0.7
    
    hours = (base_time * multiplier) / 60
    
    if hours < 1:
        return f"{int(hours * 60)} דקות"
    elif hours < 2:
        return f"{int(hours)} שעה"
    else:
        return f"{int(hours)}-{int(hours * 1.2)} שעות"

def main():
    """Main function"""
    print("🔍 Generating task reports for all incomplete pages...")
    print(f"📁 Reports directory: {REPORTS_DIR}")
    print()
    
    reports_generated = 0
    reports_failed = 0
    
    for page_name in INCOMPLETE_PAGES:
        print(f"📄 Processing {page_name}...")
        
        # Run deep audit
        try:
            result = subprocess.run(
                [sys.executable, str(SCRIPTS_DIR / 'deep-audit-page.py'), page_name],
                capture_output=True,
                text=True,
                cwd=BASE_DIR
            )
            
            if result.returncode != 0:
                print(f"  ⚠️  Audit failed: {result.stderr}")
                reports_failed += 1
                continue
            
            # Load audit results
            page_id = page_name.replace('.html', '').replace('-', '_')
            audit_file = REPORTS_DIR / f'STANDARDIZATION_AUDIT_{page_id.upper()}.json'
            
            if not audit_file.exists():
                print(f"  ⚠️  Audit results not found: {audit_file}")
                reports_failed += 1
                continue
            
            with open(audit_file, 'r', encoding='utf-8') as f:
                audit_data = json.load(f)
            
            # Generate task report
            md_content = generate_task_report(page_name, audit_data)
            
            # Save report
            report_file = REPORTS_DIR / f'STANDARDIZATION_TASKS_{page_id.upper()}.md'
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write(md_content)
            
            print(f"  ✅ Report generated: {report_file.name}")
            reports_generated += 1
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
            reports_failed += 1
    
    print()
    print("=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"✅ Reports generated: {reports_generated}/{len(INCOMPLETE_PAGES)}")
    print(f"❌ Reports failed: {reports_failed}/{len(INCOMPLETE_PAGES)}")
    print()
    print(f"📁 Reports saved to: {REPORTS_DIR}")
    print("=" * 80)

if __name__ == '__main__':
    main()




