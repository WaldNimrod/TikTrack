#!/usr/bin/env python3
"""
Script to add missing packages and globals to page-initialization-configs.js
Based on STANDARDIZATION_PACKAGES_VERIFICATION.json
"""

import json
import re
import sys
from pathlib import Path

# Base packages and globals for all mockup pages
MOCKUP_BASE_PACKAGES = [
    'base',
    'services',
    'ui-advanced',
    'modules',
    'crud',
    'conditions',
    'dashboard-widgets',
    'init-system',
]

MOCKUP_BASE_GLOBALS = [
    'NotificationSystem',
    'window.IconSystem',
    'window.SelectPopulatorService',
    'window.DataCollectionService',
    'window.DefaultValueSetter',
    'window.TableSortValueAdapter',
    'window.LinkedItemsService',
    'window.CRUDResponseHandler',
    'window.createActionsMenu',
    'window.ModalNavigationManager',
    'window.ModalManagerV2',
    'window.conditionsInitializer',
    'window.ConditionsUIManager',
    'window.PendingTradePlanWidget',
    'window.PaginationSystem',
]

# Mockup pages that need info-summary
MOCKUP_WITH_INFO_SUMMARY = [
    'trade-history-page',
    'price-history-page',
    'comparative-analysis-page',
    'trading-journal-page',
    'strategy-analysis-page',
    'economic-calendar-page',
    'history-widget',
    'date-comparison-modal',
]

def load_verification_data():
    """Load verification data from JSON"""
    json_path = Path('documentation/05-REPORTS/STANDARDIZATION_PACKAGES_VERIFICATION.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def find_page_config(content, page_name):
    """Find page config in content"""
    # Try with quotes
    pattern1 = f"['\"]{re.escape(page_name)}['\"]:"
    # Try without quotes (for some pages)
    pattern2 = f"{re.escape(page_name)}:"
    
    match1 = re.search(pattern1, content)
    match2 = re.search(pattern2, content)
    
    if match1:
        return match1.start()
    if match2:
        return match2.start()
    return None

def add_mockup_page(content, page_name, page_data):
    """Add a new mockup page configuration"""
    # Check if page already exists
    if find_page_config(content, page_name) is not None:
        print(f"  ⚠️  {page_name} already exists, skipping...")
        return content
    
    # Determine packages
    packages = MOCKUP_BASE_PACKAGES.copy()
    globals_list = MOCKUP_BASE_GLOBALS.copy()
    
    if page_name in MOCKUP_WITH_INFO_SUMMARY:
        packages.append('info-summary')
        globals_list.append('window.InfoSummarySystem')
    
    # Add entity-details for specific pages
    if page_name in ['cache-test', 'tradingview-test-page']:
        packages.append('entity-details')
        globals_list.append('window.showEntityDetails')
    
    # Create page config
    page_config = f"""    '{page_name}': {{
      name: '{page_name.replace('-', ' ').title()}',
      description: 'עמוד מוקאפ - {page_name}',
      lastModified: '2025-02-02',
      pageType: 'mockup',
      packages: {json.dumps(packages, indent=8, ensure_ascii=False)},
      requiredGlobals: {json.dumps(globals_list, indent=8, ensure_ascii=False)},
      preloadAssets: ['{page_name}-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {{
          window.Logger?.info('📄 Initializing {page_name}...', {{
            page: 'page-initialization-configs',
          }});
        }},
      ],
    }},
"""
    
    # Find insertion point (before closing brace of ADDITIONAL_PAGE_CONFIGS)
    insert_pattern = r'(\s+)(\};)\s*// ===== GLOBAL EXPORT ====='
    match = re.search(insert_pattern, content)
    
    if match:
        indent = match.group(1)
        # Insert before the closing brace
        insertion_point = match.start()
        # Add the new config
        new_content = content[:insertion_point] + page_config + content[insertion_point:]
        return new_content
    else:
        # Fallback: add at end of ADDITIONAL_PAGE_CONFIGS
        pattern = r'(const ADDITIONAL_PAGE_CONFIGS = \{[\s\S]*?)(\s+\};)'
        match = re.search(pattern, content)
        if match:
            insertion_point = match.end(1)
            new_content = content[:insertion_point] + '\n' + page_config + content[insertion_point:]
            return new_content
    
    print(f"  ❌ Could not find insertion point for {page_name}")
    return content

def main():
    """Main function"""
    print("🔧 Adding missing packages to pages...")
    print()
    
    # Load verification data
    verification_data = load_verification_data()
    
    # Read page-initialization-configs.js
    config_path = Path('trading-ui/scripts/page-initialization-configs.js')
    with open(config_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Mockup pages to add
    mockup_pages = [
        'portfolio-state-page',
        'trade-history-page',
        'price-history-page',
        'comparative-analysis-page',
        'trading-journal-page',
        'strategy-analysis-page',
        'economic-calendar-page',
        'history-widget',
        'emotional-tracking-widget',
        'date-comparison-modal',
    ]
    
    added_count = 0
    for page_name in mockup_pages:
        page_data = next((p for p in verification_data if p['page'] == page_name), None)
        if page_data:
            old_content = content
            content = add_mockup_page(content, page_name, page_data)
            if content != old_content:
                added_count += 1
                print(f"  ✅ Added {page_name}")
    
    # Write updated content
    if added_count > 0:
        with open(config_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print()
        print(f"✅ Added {added_count} mockup pages")
    else:
        print("ℹ️  No new pages to add")
    
    print()
    print("✅ Done!")

if __name__ == '__main__':
    main()



