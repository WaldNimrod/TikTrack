#!/usr/bin/env python3
"""
Comprehensive Package Verification Script
בודק packages נדרשים לכל עמוד מול מערכות חסרות
"""

import json
import re
import sys
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent.parent
TRADING_UI_DIR = BASE_DIR / 'trading-ui'
SCRIPTS_DIR = TRADING_UI_DIR / 'scripts'
DOCS_DIR = BASE_DIR / 'documentation' / '05-REPORTS'

# Mapping between systems and packages
SYSTEM_TO_PACKAGE = {
    'Conditions System': 'conditions',
    'Pending Trade Plan Widget': 'dashboard-widgets',
    'Linked Items Service': 'crud',
    'Modal Navigation Manager': 'modules',
    'CRUD Response Handler': 'crud',
    'Select Populator Service': 'services',
    'Data Collection Service': 'services',
    'Pagination System': 'ui-advanced',
    'Actions Menu Toolkit': 'crud',
    'Info Summary System': 'info-summary',
    'Entity Details Modal': 'entity-details',
    'Unified Table System': 'crud',
    'Modal Manager V2': 'modules',
    'Default Value Setter': 'services',
    'Table Sort Value Adapter': 'services',
}

# Mapping between packages and required globals
PACKAGE_TO_GLOBALS = {
    'conditions': ['window.conditionsInitializer', 'window.ConditionsUIManager'],
    'dashboard-widgets': ['window.PendingTradePlanWidget'],
    'crud': ['window.LinkedItemsService', 'window.CRUDResponseHandler', 'window.createActionsMenu'],
    'modules': ['window.ModalNavigationManager', 'window.ModalManagerV2'],
    'services': ['window.SelectPopulatorService', 'window.DataCollectionService', 'window.DefaultValueSetter', 'window.TableSortValueAdapter'],
    'ui-advanced': ['window.PaginationSystem'],
    'info-summary': ['window.InfoSummarySystem'],
    'entity-details': ['window.showEntityDetails'],
}

# Incomplete pages list
INCOMPLETE_PAGES = [
    'index', 'tickers', 'trading_accounts', 'cash_flows', 'research', 'preferences', 'user-profile',
    'db_display', 'db_extradata', 'constraints', 'background-tasks', 'server-monitor', 'system-management',
    'cache-test', 'notifications-center', 'css-management', 'dynamic-colors-display', 'designs',
    'tradingview-test-page', 'external-data-dashboard', 'chart-management', 'portfolio-state-page',
    'trade-history-page', 'price-history-page', 'comparative-analysis-page', 'trading-journal-page',
    'strategy-analysis-page', 'economic-calendar-page', 'history-widget', 'emotional-tracking-widget',
    'date-comparison-modal'
]

def extract_page_configs():
    """Extract page configurations from page-initialization-configs.js"""
    config_file = SCRIPTS_DIR / 'page-initialization-configs.js'
    if not config_file.exists():
        return {}
    
    content = config_file.read_text(encoding='utf-8')
    configs = {}
    
    # Find all page configurations - improved pattern
    # Look for page name followed by packages and requiredGlobals
    page_blocks = re.split(r'(\w+):\s*\{', content)
    
    for i in range(1, len(page_blocks), 2):
        if i + 1 >= len(page_blocks):
            break
            
        page_name = page_blocks[i]
        page_content = page_blocks[i + 1]
        
        # Extract packages
        packages_match = re.search(r'packages:\s*\[([^\]]+)\]', page_content, re.DOTALL)
        packages = []
        if packages_match:
            packages_str = packages_match.group(1)
            packages = [p.strip().strip("'\"") for p in packages_str.split(',') if p.strip() and not p.strip().startswith('//')]
        
        # Extract requiredGlobals
        globals_match = re.search(r'requiredGlobals:\s*\[([^\]]+)\]', page_content, re.DOTALL)
        globals_list = []
        if globals_match:
            globals_str = globals_match.group(1)
            globals_list = [g.strip().strip("'\"") for g in globals_str.split(',') if g.strip() and not g.strip().startswith('//')]
        
        if packages or globals_list:
            configs[page_name] = {
                'packages': packages,
                'requiredGlobals': globals_list
            }
    
    return configs

def extract_package_manifest():
    """Extract package manifest structure"""
    manifest_file = SCRIPTS_DIR / 'init-system' / 'package-manifest.js'
    if not manifest_file.exists():
        return {}
    
    content = manifest_file.read_text(encoding='utf-8')
    packages = {}
    
    # Find all package definitions - improved pattern
    package_blocks = re.split(r'(\w+):\s*\{', content)
    
    for i in range(1, len(package_blocks), 2):
        if i + 1 >= len(package_blocks):
            break
            
        pkg_key = package_blocks[i]
        pkg_content = package_blocks[i + 1]
        
        # Extract id
        id_match = re.search(r"id:\s*['\"](\w+)['\"]", pkg_content)
        if not id_match:
            continue
        pkg_id = id_match.group(1)
        
        # Extract name
        name_match = re.search(r"name:\s*['\"]([^'\"]+)['\"]", pkg_content)
        pkg_name = name_match.group(1) if name_match else pkg_id
        
        # Extract loadOrder
        order_match = re.search(r'loadOrder:\s*(\d+\.?\d*)', pkg_content)
        load_order = float(order_match.group(1)) if order_match else 999
        
        # Extract dependencies
        deps_match = re.search(r'dependencies:\s*\[([^\]]+)\]', pkg_content, re.DOTALL)
        dependencies = []
        if deps_match:
            deps_str = deps_match.group(1)
            dependencies = [d.strip().strip("'\"") for d in deps_str.split(',') if d.strip() and not d.strip().startswith('//')]
        
        packages[pkg_id] = {
            'name': pkg_name,
            'loadOrder': load_order,
            'dependencies': dependencies
        }
    
    return packages

def read_task_reports():
    """Read standardization task reports to find missing systems"""
    missing_systems = defaultdict(list)
    
    # Read from INCOMPLETE_PAGES_LIST.md
    incomplete_list_file = DOCS_DIR / 'INCOMPLETE_PAGES_LIST.md'
    if incomplete_list_file.exists():
        content = incomplete_list_file.read_text(encoding='utf-8')
        
        # Find each page section
        current_page = None
        in_missing_systems = False
        
        for line in content.split('\n'):
            # Check for page header
            if line.startswith('#### ') and '.html' in line:
                # Extract page name
                page_match = re.search(r'(\d+)\.\s+(\w+(?:-\w+)*)\.html', line)
                if page_match:
                    current_page = page_match.group(2)
                    in_missing_systems = False
            
            # Check for missing systems section
            if '**מערכות חסרות:**' in line or 'מערכות חסרות:' in line:
                in_missing_systems = True
                continue
            
            # Extract missing systems
            if in_missing_systems and current_page and line.strip().startswith('- '):
                system_name = line.strip()[2:].strip()
                if system_name in SYSTEM_TO_PACKAGE:
                    missing_systems[current_page].append({
                        'system': system_name,
                        'package': SYSTEM_TO_PACKAGE[system_name]
                    })
            
            # Stop when we hit next section
            if in_missing_systems and line.startswith('---'):
                in_missing_systems = False
    
    # Also read from individual task reports
    for page in INCOMPLETE_PAGES:
        report_file = DOCS_DIR / f'STANDARDIZATION_TASKS_{page.upper().replace("-", "_")}.md'
        if not report_file.exists():
            # Try alternative naming
            page_alt = page.replace('-', '_')
            report_file = DOCS_DIR / f'STANDARDIZATION_TASKS_{page_alt.upper()}.md'
        
        if report_file.exists():
            content = report_file.read_text(encoding='utf-8')
            
            # Find missing systems section
            if 'מערכות חסרות:' in content or 'missing systems' in content.lower():
                # Extract missing systems
                for system, package in SYSTEM_TO_PACKAGE.items():
                    if system.lower() in content.lower() or system in content:
                        # Check if not already added
                        if not any(m['system'] == system for m in missing_systems[page]):
                            missing_systems[page].append({
                                'system': system,
                                'package': package
                            })
    
    return missing_systems

def verify_packages_for_page(page_name, page_config, missing_systems_list, packages_info):
    """Verify packages for a single page"""
    issues = []
    recommendations = []
    
    current_packages = page_config.get('packages', [])
    current_globals = page_config.get('requiredGlobals', [])
    
    # Check missing systems
    missing_packages = set()
    missing_globals = set()
    
    for missing in missing_systems_list:
        required_package = missing['package']
        if required_package not in current_packages:
            missing_packages.add(required_package)
            issues.append({
                'type': 'missing_package',
                'package': required_package,
                'system': missing['system'],
                'severity': 'high'
            })
            recommendations.append(f"הוסף '{required_package}' ל-packages array")
        
        # Check required globals
        if required_package in PACKAGE_TO_GLOBALS:
            for global_name in PACKAGE_TO_GLOBALS[required_package]:
                if global_name not in current_globals:
                    missing_globals.add(global_name)
                    recommendations.append(f"הוסף '{global_name}' ל-requiredGlobals array")
    
    # Check package dependencies
    dependency_issues = []
    for pkg in current_packages:
        if pkg in packages_info:
            pkg_info = packages_info[pkg]
            for dep in pkg_info.get('dependencies', []):
                if dep not in current_packages:
                    dependency_issues.append({
                        'package': pkg,
                        'missing_dependency': dep,
                        'severity': 'high'
                    })
                    recommendations.append(f"הוסף '{dep}' ל-packages (נדרש עבור '{pkg}')")
    
    # Check load order
    load_order_issues = []
    package_orders = {}
    for pkg in current_packages:
        if pkg in packages_info:
            package_orders[pkg] = packages_info[pkg]['loadOrder']
    
    sorted_packages = sorted(package_orders.items(), key=lambda x: x[1])
    for i, (pkg, order) in enumerate(sorted_packages):
        if pkg in packages_info:
            for dep in packages_info[pkg].get('dependencies', []):
                if dep in package_orders:
                    if package_orders[dep] >= order:
                        load_order_issues.append({
                            'package': pkg,
                            'dependency': dep,
                            'package_order': order,
                            'dep_order': package_orders[dep],
                            'severity': 'high'
                        })
    
    return {
        'page': page_name,
        'current_packages': current_packages,
        'current_globals': current_globals,
        'missing_packages': list(missing_packages),
        'missing_globals': list(missing_globals),
        'issues': issues,
        'dependency_issues': dependency_issues,
        'load_order_issues': load_order_issues,
        'recommendations': recommendations
    }

def main():
    """Main function"""
    print("🔍 Comprehensive Package Verification")
    print("=" * 80)
    print()
    
    # Extract data
    print("📋 Extracting page configurations...")
    page_configs = extract_page_configs()
    print(f"   ✅ Found {len(page_configs)} page configurations")
    
    print("📋 Extracting package manifest...")
    packages_info = extract_package_manifest()
    print(f"   ✅ Found {len(packages_info)} packages")
    
    print("📋 Reading task reports...")
    missing_systems = read_task_reports()
    print(f"   ✅ Found missing systems for {len(missing_systems)} pages")
    print()
    
    # Verify each incomplete page
    print("🔍 Verifying packages for incomplete pages...")
    print("=" * 80)
    print()
    
    results = []
    total_issues = 0
    total_missing_packages = 0
    total_missing_globals = 0
    total_dependency_issues = 0
    total_load_order_issues = 0
    
    for page in INCOMPLETE_PAGES:
        page_config = page_configs.get(page, {})
        missing_systems_list = missing_systems.get(page, [])
        
        result = verify_packages_for_page(page, page_config, missing_systems_list, packages_info)
        results.append(result)
        
        total_issues += len(result['issues'])
        total_missing_packages += len(result['missing_packages'])
        total_missing_globals += len(result['missing_globals'])
        total_dependency_issues += len(result['dependency_issues'])
        total_load_order_issues += len(result['load_order_issues'])
        
        if result['issues'] or result['dependency_issues'] or result['load_order_issues']:
            print(f"⚠️  {page}:")
            if result['missing_packages']:
                print(f"   📦 Missing packages: {', '.join(result['missing_packages'])}")
            if result['missing_globals']:
                print(f"   🔧 Missing globals: {len(result['missing_globals'])}")
            if result['dependency_issues']:
                print(f"   🔗 Dependency issues: {len(result['dependency_issues'])}")
            if result['load_order_issues']:
                print(f"   ⏱️  Load order issues: {len(result['load_order_issues'])}")
            print()
    
    # Generate report
    print("=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"✅ Pages verified: {len(results)}")
    print(f"⚠️  Total issues: {total_issues}")
    print(f"📦 Missing packages: {total_missing_packages}")
    print(f"🔧 Missing globals: {total_missing_globals}")
    print(f"🔗 Dependency issues: {total_dependency_issues}")
    print(f"⏱️  Load order issues: {total_load_order_issues}")
    print()
    
    # Save detailed report
    report_file = DOCS_DIR / 'STANDARDIZATION_PACKAGES_VERIFICATION_REPORT.md'
    generate_detailed_report(report_file, results, packages_info)
    print(f"📄 Detailed report saved: {report_file}")
    print()
    
    # Save JSON for further processing
    json_file = DOCS_DIR / 'STANDARDIZATION_PACKAGES_VERIFICATION.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"📄 JSON data saved: {json_file}")

def generate_detailed_report(report_file, results, packages_info):
    """Generate detailed markdown report"""
    content = f"""# דוח בדיקת Packages - סטנדרטיזציה

**תאריך יצירה:** {Path(__file__).stat().st_mtime}
**סה"כ עמודים נבדקו:** {len(results)}

---

## סיכום כללי

- **עמודים עם בעיות:** {sum(1 for r in results if r['issues'] or r['dependency_issues'] or r['load_order_issues'])}
- **חבילות חסרות:** {sum(len(r['missing_packages']) for r in results)}
- **Globals חסרים:** {sum(len(r['missing_globals']) for r in results)}
- **בעיות תלויות:** {sum(len(r['dependency_issues']) for r in results)}
- **בעיות סדר טעינה:** {sum(len(r['load_order_issues']) for r in results)}

---

## מפת Packages למערכות

"""
    
    # Add system to package mapping
    content += "### מיפוי מערכות ל-Packages\n\n"
    content += "| מערכת | Package | Required Globals |\n"
    content += "|--------|---------|------------------|\n"
    for system, package in SYSTEM_TO_PACKAGE.items():
        globals_list = PACKAGE_TO_GLOBALS.get(package, [])
        globals_str = ', '.join(globals_list) if globals_list else '-'
        content += f"| {system} | `{package}` | {globals_str} |\n"
    content += "\n---\n\n"
    
    # Add detailed results for each page
    content += "## תוצאות מפורטות לכל עמוד\n\n"
    
    for result in results:
        if not result['issues'] and not result['dependency_issues'] and not result['load_order_issues']:
            continue
        
        content += f"### {result['page']}\n\n"
        content += f"**Packages נוכחיים:** {', '.join(result['current_packages']) if result['current_packages'] else 'אין'}\n\n"
        
        if result['missing_packages']:
            content += f"**📦 Packages חסרים:**\n"
            for pkg in result['missing_packages']:
                content += f"- `{pkg}`\n"
            content += "\n"
        
        if result['missing_globals']:
            content += f"**🔧 Globals חסרים:**\n"
            for global_name in result['missing_globals']:
                content += f"- `{global_name}`\n"
            content += "\n"
        
        if result['dependency_issues']:
            content += f"**🔗 בעיות תלויות:**\n"
            for issue in result['dependency_issues']:
                content += f"- Package `{issue['package']}` דורש `{issue['missing_dependency']}`\n"
            content += "\n"
        
        if result['load_order_issues']:
            content += f"**⏱️ בעיות סדר טעינה:**\n"
            for issue in result['load_order_issues']:
                content += f"- Package `{issue['package']}` (order: {issue['package_order']}) נטען לפני dependency `{issue['dependency']}` (order: {issue['dep_order']})\n"
            content += "\n"
        
        if result['recommendations']:
            content += f"**💡 המלצות:**\n"
            for rec in result['recommendations']:
                content += f"- {rec}\n"
            content += "\n"
        
        content += "---\n\n"
    
    # Add summary statistics
    content += "## סטטיסטיקות\n\n"
    
    # Count missing packages by type
    package_counts = defaultdict(int)
    for result in results:
        for pkg in result['missing_packages']:
            package_counts[pkg] += 1
    
    if package_counts:
        content += "### Packages חסרים (לפי תדירות)\n\n"
        content += "| Package | מספר עמודים |\n"
        content += "|---------|---------------|\n"
        for pkg, count in sorted(package_counts.items(), key=lambda x: x[1], reverse=True):
            content += f"| `{pkg}` | {count} |\n"
        content += "\n"
    
    report_file.write_text(content, encoding='utf-8')

if __name__ == '__main__':
    main()

