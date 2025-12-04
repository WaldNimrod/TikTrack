#!/usr/bin/env python3
"""
Analyze Pages Systems - TikTrack
ניתוח מערכות חסרות לפי page-initialization-configs.js ו-package-manifest.js

מטרה: זיהוי מדויק של מערכות חסרות לפי הקונפיגורציות והמניפסט
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI = PROJECT_ROOT / 'trading-ui'
SCRIPTS_DIR = TRADING_UI / 'scripts'
DOCS_DIR = PROJECT_ROOT / 'documentation' / '05-REPORTS'

# מערכות לבדיקה עם globals שלהן
REQUIRED_SYSTEMS = {
    'Unified Init System': {
        'globals': ['window.unifiedAppInitializer', 'window.PAGE_CONFIGS', 'window.PACKAGE_MANIFEST'],
        'package': 'init-system'
    },
    'Section Toggle System': {
        'globals': ['window.toggleSection'],
        'package': 'base'
    },
    'NotificationSystem': {
        'globals': ['window.NotificationSystem', 'window.showSuccessNotification', 'window.showErrorNotification'],
        'package': 'base'
    },
    'ModalManagerV2': {
        'globals': ['window.ModalManagerV2'],
        'package': 'modules'
    },
    'FieldRendererService': {
        'globals': ['window.FieldRendererService'],
        'package': 'services'
    },
    'CRUDResponseHandler': {
        'globals': ['window.CRUDResponseHandler'],
        'package': 'crud'
    },
    'IconSystem': {
        'globals': ['window.IconSystem'],
        'package': 'base'
    },
    'ColorSchemeSystem': {
        'globals': ['window.ColorSchemeSystem'],
        'package': 'preferences'
    },
    'InfoSummarySystem': {
        'globals': ['window.InfoSummarySystem'],
        'package': 'info-summary'
    },
    'LinkedItemsSystem': {
        'globals': ['window.LinkedItemsService', 'window.loadLinkedItemsData'],
        'package': 'crud'
    },
    'PageStateManager': {
        'globals': ['window.PageStateManager'],
        'package': 'services'
    },
    'Logger Service': {
        'globals': ['window.Logger'],
        'package': 'base'
    },
    'UnifiedCacheManager': {
        'globals': ['window.UnifiedCacheManager'],
        'package': 'base'
    },
    'DataCollectionService': {
        'globals': ['window.DataCollectionService'],
        'package': 'services'
    },
    'SelectPopulatorService': {
        'globals': ['window.SelectPopulatorService'],
        'package': 'services'
    },
    'ConditionsSummaryRenderer': {
        'globals': ['window.ConditionsSummaryRenderer'],
        'package': 'conditions'
    },
    'UnifiedTableSystem': {
        'globals': ['window.UnifiedTableSystem'],
        'package': 'crud'
    },
    'PaginationSystem': {
        'globals': ['window.PaginationSystem'],
        'package': 'crud'
    },
}

def parse_page_configs():
    """Parse page-initialization-configs.js"""
    configs_file = SCRIPTS_DIR / 'page-initialization-configs.js'
    
    if not configs_file.exists():
        return {}
    
    try:
        with open(configs_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        configs = {}
        
        # Find all page configs - improved regex
        # Pattern: pageName: { ... packages: [...] ... requiredGlobals: [...] ... }
        page_pattern = re.compile(
            r'(\w+):\s*\{[^}]*?packages:\s*\[([^\]]+)\][^}]*?requiredGlobals:\s*\[([^\]]+)\]',
            re.DOTALL
        )
        
        matches = page_pattern.findall(content)
        for page_name, packages_str, globals_str in matches:
            # Parse packages
            packages = []
            for p in packages_str.split(','):
                p = p.strip().strip("'\"")
                # Remove comments
                if '//' in p:
                    p = p.split('//')[0].strip()
                if p and not p.startswith('//'):
                    packages.append(p)
            
            # Parse globals
            globals_list = []
            for g in globals_str.split(','):
                g = g.strip().strip("'\"")
                # Remove comments
                if '//' in g:
                    g = g.split('//')[0].strip()
                if g and not g.startswith('//'):
                    globals_list.append(g)
            
            configs[page_name] = {
                'packages': packages,
                'requiredGlobals': globals_list
            }
        
        return configs
    except Exception as e:
        print(f"⚠️ Error parsing page configs: {e}")
        return {}

def parse_package_manifest():
    """Parse package-manifest.js to get which systems are in which packages"""
    manifest_file = SCRIPTS_DIR / 'init-system' / 'package-manifest.js'
    
    if not manifest_file.exists():
        return {}
    
    try:
        with open(manifest_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract package definitions
        packages = {}
        
        # Pattern: packageName: { ... scripts: [...] ... }
        package_pattern = re.compile(
            r'(\w+):\s*\{[^}]*?scripts:\s*\[([^\]]+)\]',
            re.DOTALL
        )
        
        matches = package_pattern.findall(content)
        for package_name, scripts_str in matches:
            scripts = []
            # Extract script files
            script_pattern = re.compile(r"file:\s*['\"]([^'\"]+)['\"]", re.IGNORECASE)
            script_matches = script_pattern.findall(scripts_str)
            scripts.extend(script_matches)
            
            packages[package_name] = {
                'scripts': scripts
            }
        
        return packages
    except Exception as e:
        print(f"⚠️ Error parsing package manifest: {e}")
        return {}

def analyze_page_systems(page_name, page_config, package_manifest):
    """Analyze which systems are missing for a page"""
    packages = page_config.get('packages', [])
    required_globals = page_config.get('requiredGlobals', [])
    
    missing_systems = []
    missing_packages = []
    missing_globals = []
    
    # Check each required system
    for system_name, system_info in REQUIRED_SYSTEMS.items():
        required_package = system_info['package']
        required_globals_list = system_info['globals']
        
        # Check if package is included
        package_included = required_package in packages
        
        # Check if any global is in requiredGlobals
        globals_found = any(any(req_global in req_global_str for req_global in required_globals_list) 
                           for req_global_str in required_globals)
        
        if not package_included and not globals_found:
            missing_systems.append(system_name)
            if required_package not in packages:
                missing_packages.append(required_package)
            # Check which globals are missing
            for req_global in required_globals_list:
                if not any(req_global in g for g in required_globals):
                    missing_globals.append({
                        'system': system_name,
                        'global': req_global,
                        'package': required_package
                    })
    
    return {
        'missing_systems': missing_systems,
        'missing_packages': list(set(missing_packages)),
        'missing_globals': missing_globals
    }

def generate_analysis_report(page_configs, package_manifest):
    """Generate analysis report"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    results = {}
    total_missing_systems = 0
    total_missing_packages = 0
    
    for page_name, page_config in page_configs.items():
        analysis = analyze_page_systems(page_name, page_config, package_manifest)
        results[page_name] = {
            'packages': page_config.get('packages', []),
            'requiredGlobals': page_config.get('requiredGlobals', []),
            'missing_systems': analysis['missing_systems'],
            'missing_packages': analysis['missing_packages'],
            'missing_globals': analysis['missing_globals']
        }
        total_missing_systems += len(analysis['missing_systems'])
        total_missing_packages += len(analysis['missing_packages'])
    
    report = f"""# דוח ניתוח מערכות חסרות
## Pages Systems Analysis Report

**תאריך יצירה:** {timestamp}  
**מטרה:** ניתוח מדויק של מערכות חסרות לפי page-initialization-configs.js ו-package-manifest.js

---

## 📊 סיכום כללי

- **סה"כ עמודים מתועדים:** {len(page_configs)}
- **סה"כ מערכות חסרות:** {total_missing_systems}
- **סה"כ packages חסרים:** {total_missing_packages}

---

## 📁 ניתוח מפורט

"""
    
    # Sort by number of missing systems
    sorted_pages = sorted(results.items(), key=lambda x: len(x[1]['missing_systems']), reverse=True)
    
    for page_name, page_data in sorted_pages:
        missing_systems = page_data['missing_systems']
        missing_packages = page_data['missing_packages']
        missing_globals = page_data['missing_globals']
        
        report += f"### {page_name}\n\n"
        
        report += f"**Packages מתועדים:** {len(page_data['packages'])}\n"
        report += f"**Required Globals:** {len(page_data['requiredGlobals'])}\n\n"
        
        if missing_systems:
            report += f"**⚠️ מערכות חסרות ({len(missing_systems)}):**\n"
            for system in missing_systems:
                system_info = REQUIRED_SYSTEMS[system]
                report += f"- **{system}** (package: `{system_info['package']}`)\n"
            report += "\n"
        
        if missing_packages:
            report += f"**⚠️ Packages חסרים ({len(missing_packages)}):**\n"
            for package in missing_packages:
                report += f"- `{package}`\n"
            report += "\n"
        
        if missing_globals:
            report += f"**⚠️ Globals חסרים ({len(missing_globals)}):**\n"
            for global_info in missing_globals[:10]:  # Limit to first 10
                report += f"- `{global_info['global']}` (מערכת: {global_info['system']}, package: `{global_info['package']}`)\n"
            if len(missing_globals) > 10:
                report += f"- ... ועוד {len(missing_globals) - 10} globals\n"
            report += "\n"
        
        if not missing_systems and not missing_packages:
            report += "✅ כל המערכות קיימות\n\n"
        
        report += "---\n\n"
    
    # Summary by system
    report += "## 📊 סיכום לפי מערכת\n\n"
    
    system_counts = {}
    for page_data in results.values():
        for system in page_data['missing_systems']:
            system_counts[system] = system_counts.get(system, 0) + 1
    
    if system_counts:
        sorted_systems = sorted(system_counts.items(), key=lambda x: x[1], reverse=True)
        report += "**מערכות חסרות ביותר:**\n\n"
        for system, count in sorted_systems:
            system_info = REQUIRED_SYSTEMS[system]
            report += f"- **{system}:** חסר ב-{count} עמודים (package: `{system_info['package']}`)\n"
    else:
        report += "✅ כל המערכות קיימות בכל העמודים\n"
    
    report += "\n---\n\n"
    
    # Recommendations
    report += "## 💡 המלצות לתיקון\n\n"
    report += "### שלב 1: הוספת Packages חסרים\n\n"
    report += "עבור על כל עמוד והוסף packages חסרים ל-`packages` array ב-page-initialization-configs.js\n\n"
    report += "### שלב 2: הוספת Required Globals\n\n"
    report += "עבור על כל עמוד והוסף globals חסרים ל-`requiredGlobals` array\n\n"
    report += "### שלב 3: עדכון HTML Files\n\n"
    report += "וידוא שכל ה-`<script>` tags נטענים בסדר הנכון:\n"
    report += "1. package-manifest.js\n"
    report += "2. page-initialization-configs.js\n"
    report += "3. unified-app-initializer.js\n\n"
    report += "### שלב 4: הרצת runDetailedPageScan\n\n"
    report += "הרץ `runDetailedPageScan` על כל עמוד כדי לוודא שאין בעיות\n"
    
    return report, results

def main():
    """Main function"""
    print("🔍 Analyzing pages systems...")
    
    # Parse page configs
    print("📋 Parsing page-initialization-configs.js...")
    page_configs = parse_page_configs()
    print(f"✅ Found {len(page_configs)} page configurations")
    
    # Parse package manifest
    print("📦 Parsing package-manifest.js...")
    package_manifest = parse_package_manifest()
    print(f"✅ Found {len(package_manifest)} packages")
    
    # Generate analysis
    print("📊 Generating analysis report...")
    report, results = generate_analysis_report(page_configs, package_manifest)
    
    # Save report
    report_file = DOCS_DIR / 'PAGES_SYSTEMS_ANALYSIS_REPORT.md'
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"📄 Report saved to: {report_file}")
    
    # Save JSON
    json_file = DOCS_DIR / 'PAGES_SYSTEMS_ANALYSIS_RESULTS.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_pages': len(page_configs),
            'results': results
        }, f, indent=2, ensure_ascii=False)
    
    print(f"📊 JSON results saved to: {json_file}")

if __name__ == '__main__':
    main()

