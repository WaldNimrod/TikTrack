#!/usr/bin/env python3
"""
Comprehensive Pages Scan - TikTrack
סריקה מקיפה של כל העמודים

מטרה: זיהוי מערכות חסרות, packages חסרים, וקבצי JS חסרים בכל עמוד
"""

import os
import re
from pathlib import Path
from datetime import datetime
import json

PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI = PROJECT_ROOT / 'trading-ui'
SCRIPTS_DIR = TRADING_UI / 'scripts'
HTML_DIR = TRADING_UI
DOCS_DIR = PROJECT_ROOT / 'documentation' / '05-REPORTS'

# מערכות לבדיקה (לפי מטריצת סטנדרטיזציה)
REQUIRED_SYSTEMS = {
    'Unified Init System': ['window.unifiedAppInitializer', 'window.PAGE_CONFIGS', 'window.PACKAGE_MANIFEST'],
    'Section Toggle System': ['window.toggleSection'],
    'NotificationSystem': ['window.NotificationSystem', 'window.showSuccessNotification', 'window.showErrorNotification'],
    'ModalManagerV2': ['window.ModalManagerV2'],
    'FieldRendererService': ['window.FieldRendererService'],
    'CRUDResponseHandler': ['window.CRUDResponseHandler'],
    'IconSystem': ['window.IconSystem'],
    'ColorSchemeSystem': ['window.ColorSchemeSystem'],
    'InfoSummarySystem': ['window.InfoSummarySystem'],
    'LinkedItemsSystem': ['window.LinkedItemsService', 'window.loadLinkedItemsData'],
    'PageStateManager': ['window.PageStateManager'],
    'Logger Service': ['window.Logger'],
    'UnifiedCacheManager': ['window.UnifiedCacheManager'],
    'DataCollectionService': ['window.DataCollectionService'],
    'SelectPopulatorService': ['window.SelectPopulatorService'],
    'ConditionsSummaryRenderer': ['window.ConditionsSummaryRenderer'],
    'UnifiedTableSystem': ['window.UnifiedTableSystem'],
    'PaginationSystem': ['window.PaginationSystem'],
}

# Packages לפי package-manifest.js
PACKAGES = {
    'base': 'Base Package - Required for all pages',
    'services': 'Services Package - General services',
    'ui-advanced': 'UI Advanced Package - Advanced interface',
    'crud': 'CRUD Package - Pages with tables',
    'preferences': 'Preferences Package - Preferences',
    'validation': 'Validation Package - Validation',
    'external-data': 'External Data Package - External data',
    'logs': 'Logs Package - Logs',
    'cache': 'Cache Package - Cache',
    'entity-services': 'Entity Services Package - Entity services',
    'helper': 'Helper Package - Helper',
    'management': 'Management Package - Management',
    'init-system': 'Init System Package - Initialization',
    'modules': 'Modules Package - Core modules',
    'conditions': 'Conditions Package - Conditions system',
    'entity-details': 'Entity Details Package - Entity details',
    'info-summary': 'Info Summary Package - Info summary',
    'dashboard-widgets': 'Dashboard Widgets Package - Dashboard widgets',
}

def find_html_files():
    """Find all HTML files in trading-ui"""
    html_files = []
    exclude_dirs = {'test', 'old', 'archive', 'backup', 'vendor', 'node_modules', 'mockups'}
    exclude_files = {'.backup', '.bak', '.old'}
    
    for html_file in HTML_DIR.rglob('*.html'):
        # Skip excluded directories
        if any(excluded in str(html_file) for excluded in exclude_dirs):
            continue
        
        # Skip excluded files
        if any(excluded in html_file.name for excluded in exclude_files):
            continue
        
        html_files.append(html_file)
    
    return sorted(html_files)

def parse_html_file(html_path):
    """Parse HTML file and extract script tags and page name"""
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {'error': str(e), 'scripts': [], 'page_name': None}
    
    # Extract page name from path
    page_name = html_path.stem
    
    # Find all script tags
    script_pattern = re.compile(r'<script[^>]*src=["\']([^"\']+)["\'][^>]*>', re.IGNORECASE)
    scripts = script_pattern.findall(content)
    
    # Filter out external scripts (CDN, etc.)
    local_scripts = [s for s in scripts if not s.startswith('http') and not s.startswith('//')]
    
    # Normalize script paths
    normalized_scripts = []
    for script in local_scripts:
        # Remove query strings
        script = script.split('?')[0]
        # Normalize path
        if script.startswith('/'):
            script = script[1:]
        normalized_scripts.append(script)
    
    return {
        'scripts': normalized_scripts,
        'page_name': page_name,
        'full_path': str(html_path.relative_to(TRADING_UI))
    }

def check_script_exists(script_path):
    """Check if script file exists"""
    # Try different possible paths
    possible_paths = [
        TRADING_UI / script_path,
        SCRIPTS_DIR / script_path,
        TRADING_UI / 'scripts' / script_path,
    ]
    
    for path in possible_paths:
        if path.exists():
            return True, str(path.relative_to(TRADING_UI))
    
    return False, None

def analyze_page(html_path):
    """Analyze a single page"""
    page_data = parse_html_file(html_path)
    
    if 'error' in page_data:
        return {
            'page': page_data.get('page_name', 'unknown'),
            'error': page_data['error'],
            'scripts': [],
            'missing_scripts': [],
            'missing_systems': [],
            'missing_packages': []
        }
    
    page_name = page_data['page_name']
    scripts = page_data['scripts']
    
    # Check which scripts exist
    existing_scripts = []
    missing_scripts = []
    
    for script in scripts:
        exists, full_path = check_script_exists(script)
        if exists:
            existing_scripts.append(full_path)
        else:
            missing_scripts.append(script)
    
    # Check for required systems (by checking script names)
    found_systems = set()
    missing_systems = []
    
    for system_name, globals_list in REQUIRED_SYSTEMS.items():
        # Check if any script might provide this system
        system_found = False
        for script in existing_scripts:
            script_lower = script.lower()
            # Simple heuristic: check if script name contains system keywords
            if any(keyword.lower() in script_lower for keyword in system_name.split()):
                system_found = True
                break
        
        if not system_found:
            # Check if any global is mentioned in scripts (would need to parse JS files)
            missing_systems.append(system_name)
        else:
            found_systems.add(system_name)
    
    # Check for packages (would need to check page-initialization-configs.js)
    # For now, we'll note that this needs manual checking
    missing_packages = []
    
    return {
        'page': page_name,
        'full_path': page_data['full_path'],
        'scripts': existing_scripts,
        'missing_scripts': missing_scripts,
        'found_systems': list(found_systems),
        'missing_systems': missing_systems,
        'missing_packages': missing_packages,  # Will be filled by checking page-initialization-configs.js
        'total_scripts': len(existing_scripts),
        'total_missing_scripts': len(missing_scripts),
        'total_missing_systems': len(missing_systems)
    }

def load_page_configs():
    """Load page configurations from page-initialization-configs.js"""
    configs_file = SCRIPTS_DIR / 'page-initialization-configs.js'
    
    if not configs_file.exists():
        return {}
    
    try:
        with open(configs_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract page configs (simplified - would need proper JS parsing for full accuracy)
        configs = {}
        
        # Find page configs pattern
        page_pattern = re.compile(r'(\w+):\s*\{[^}]*packages:\s*\[([^\]]+)\][^}]*requiredGlobals:\s*\[([^\]]+)\]', re.DOTALL)
        
        matches = page_pattern.findall(content)
        for page_name, packages_str, globals_str in matches:
            packages = [p.strip().strip("'\"") for p in packages_str.split(',') if p.strip()]
            globals_list = [g.strip().strip("'\"") for g in globals_str.split(',') if g.strip()]
            
            configs[page_name] = {
                'packages': packages,
                'requiredGlobals': globals_list
            }
        
        return configs
    except Exception as e:
        print(f"⚠️ Error loading page configs: {e}")
        return {}

def generate_report(results, page_configs):
    """Generate markdown report"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    total_pages = len(results)
    pages_with_issues = sum(1 for r in results if r.get('total_missing_scripts', 0) > 0 or r.get('total_missing_systems', 0) > 0)
    
    report = f"""# דוח סריקה מקיף - כל העמודים
## Comprehensive Pages Scan Report

**תאריך יצירה:** {timestamp}  
**מטרה:** זיהוי מערכות חסרות, packages חסרים, וקבצי JS חסרים בכל עמוד

---

## 📊 סיכום כללי

- **סה"כ עמודים:** {total_pages}
- **עמודים עם בעיות:** {pages_with_issues}
- **עמודים תקינים:** {total_pages - pages_with_issues}

---

## 📁 תוצאות סריקה

"""
    
    # Sort by number of issues
    sorted_results = sorted(results, key=lambda x: (
        x.get('total_missing_scripts', 0) + 
        x.get('total_missing_systems', 0)
    ), reverse=True)
    
    for result in sorted_results:
        page_name = result.get('page', 'unknown')
        full_path = result.get('full_path', '')
        
        report += f"### {page_name}\n\n"
        report += f"**קובץ:** `{full_path}`\n\n"
        
        if 'error' in result:
            report += f"**❌ שגיאה:** {result['error']}\n\n"
            report += "---\n\n"
            continue
        
        # Scripts
        total_scripts = result.get('total_scripts', 0)
        missing_scripts = result.get('missing_scripts', [])
        
        report += f"**קבצי JS שנטענים:** {total_scripts}\n\n"
        
        if missing_scripts:
            report += f"**⚠️ קבצים חסרים ({len(missing_scripts)}):**\n"
            for script in missing_scripts:
                report += f"- `{script}`\n"
            report += "\n"
        
        # Systems
        found_systems = result.get('found_systems', [])
        missing_systems = result.get('missing_systems', [])
        
        report += f"**מערכות שנמצאו:** {len(found_systems)}\n"
        report += f"**מערכות חסרות:** {len(missing_systems)}\n\n"
        
        if missing_systems:
            report += f"**⚠️ מערכות חסרות ({len(missing_systems)}):**\n"
            for system in missing_systems:
                report += f"- {system}\n"
            report += "\n"
        
        # Packages (from page configs)
        if page_name in page_configs:
            packages = page_configs[page_name].get('packages', [])
            required_globals = page_configs[page_name].get('requiredGlobals', [])
            
            report += f"**Packages מתועדים:** {len(packages)}\n"
            report += f"**Required Globals:** {len(required_globals)}\n\n"
        
        report += "---\n\n"
    
    # Summary by system
    report += "## 📊 סיכום לפי מערכת\n\n"
    
    system_counts = {}
    for result in results:
        if 'missing_systems' in result:
            for system in result['missing_systems']:
                system_counts[system] = system_counts.get(system, 0) + 1
    
    if system_counts:
        sorted_systems = sorted(system_counts.items(), key=lambda x: x[1], reverse=True)
        report += "**מערכות חסרות ביותר:**\n\n"
        for system, count in sorted_systems:
            report += f"- **{system}:** חסר ב-{count} עמודים\n"
    else:
        report += "✅ כל המערכות קיימות בכל העמודים\n"
    
    report += "\n---\n\n"
    
    # Recommendations
    report += "## 💡 המלצות\n\n"
    report += "1. **עדכון page-initialization-configs.js:** הוסף packages חסרים לכל עמוד\n"
    report += "2. **עדכון HTML files:** הוסף `<script>` tags לקבצים חסרים\n"
    report += "3. **וידוא סדר טעינה:** package-manifest → page-configs → unified-initializer\n"
    report += "4. **בדיקת requiredGlobals:** וידוא שכל globals נדרשים קיימים\n"
    report += "5. **הרצת runDetailedPageScan:** בדיקה בדפדפן עם כלי הניטור\n"
    
    return report

def main():
    """Main function"""
    print("🔍 Scanning all HTML pages...")
    
    html_files = find_html_files()
    print(f"✅ Found {len(html_files)} HTML files")
    
    # Load page configs
    print("📋 Loading page configurations...")
    page_configs = load_page_configs()
    print(f"✅ Loaded {len(page_configs)} page configurations")
    
    # Analyze each page
    results = []
    for html_file in html_files:
        print(f"  Analyzing: {html_file.name}")
        result = analyze_page(html_file)
        results.append(result)
    
    print(f"✅ Analyzed {len(results)} pages")
    
    # Generate report
    report = generate_report(results, page_configs)
    
    # Save report
    report_file = DOCS_DIR / 'COMPREHENSIVE_PAGES_SCAN_REPORT.md'
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"📄 Report saved to: {report_file}")
    
    # Save JSON for programmatic access
    json_file = DOCS_DIR / 'COMPREHENSIVE_PAGES_SCAN_RESULTS.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_pages': len(results),
            'page_configs': page_configs,
            'results': results
        }, f, indent=2, ensure_ascii=False)
    
    print(f"📊 JSON results saved to: {json_file}")

if __name__ == '__main__':
    main()

