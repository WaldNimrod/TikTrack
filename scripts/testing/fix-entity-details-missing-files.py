#!/usr/bin/env python3
"""
סקריפט תיקון - Entity Details Modal Missing Files
Fix Script for Adding Entity Details Files to Pages

מוסיף את entity-details-modal.js, entity-details-renderer.js, entity-details-api.js
לכל העמודים שצריכים אותם.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Any

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
PAGES_ROOT = PROJECT_ROOT / "trading-ui"

# Pages that need entity-details (have tables with entities)
PAGES_WITH_ENTITIES = [
    # Central pages (all have entity tables)
    "index.html",
    "trades.html",
    "trade_plans.html",
    "alerts.html",
    "tickers.html",
    "trading_accounts.html",
    "executions.html",
    "cash_flows.html",
    "notes.html",
    "research.html",
    "preferences.html",
    
    # Technical pages with entity tables
    "db_display.html",  # Has 8 entity tables
    "db_extradata.html",  # Has entity tables
    "constraints.html",
    "background_tasks.html",
    "server_monitor.html",
    "system_management.html",
    "notifications_center.html",
    "css_management.html",
    "dynamic_colors_display.html",
    "designs.html",
    "external_data_dashboard.html",
    "chart_management.html",
    
    # Mockup pages that might have entities
    "mockups/daily-snapshots/portfolio_state_page.html",
    "mockups/daily-snapshots/trade_history_page.html",
    "mockups/daily-snapshots/price_history_page.html",
    "mockups/daily-snapshots/comparative_analysis_page.html",
    "mockups/daily-snapshots/trading_journal_page.html",
    "mockups/daily-snapshots/strategy_analysis_page.html",
    "mockups/daily-snapshots/economic_calendar_page.html",
    "mockups/daily-snapshots/history_widget.html",
    "mockups/daily-snapshots/emotional_tracking_widget.html",
    "mockups/daily-snapshots/date_comparison_modal.html",
    "mockups/daily-snapshots/tradingview_test_page.html",
]

# Entity details files to add
ENTITY_DETAILS_FILES = [
    'entity-details-api.js',
    'entity-details-renderer.js',
    'entity-details-modal.js'
]

def find_script_section_end(content: str, package_section_pattern: str) -> int:
    """Find the end of a specific package section"""
    # Look for next package section or PAGE-SPECIFIC section
    patterns = [
        r'<!-- ===== PACKAGE \d+/',
        r'<!-- ===== PAGE-SPECIFIC SCRIPTS =====',
        r'<!-- ===== INITIALIZATION PACKAGE =====',
        r'<!-- =============================================================== -->\s*<!-- ===== [^=]',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, content)
        if match:
            return match.start()
    
    # If no next section, find end of scripts
    return content.rfind('</body>') if '</body>' in content else len(content)

def add_entity_details_files(page_path: str) -> bool:
    """Add entity-details files to a page"""
    html_path = PAGES_ROOT / page_path
    if not html_path.exists():
        print(f"⚠️  File not found: {page_path}")
        return False
    
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if files already exist
        if all(f'entity-details-{name}' in content for name in ['api.js', 'renderer.js', 'modal.js']):
            print(f"✅ {page_path} - Already has entity-details files")
            return False
        
        # Find where to insert - after CRUD package or before PAGE-SPECIFIC
        insert_patterns = [
            r'<!-- ===== PAGE-SPECIFIC SCRIPTS =====',
            r'<!-- ===== INITIALIZATION PACKAGE =====',
            r'<!-- =============================================================== -->\s*<!-- ===== FINAL SUMMARY =====',
        ]
        
        insert_pos = None
        insert_before_text = None
        
        for pattern in insert_patterns:
            match = re.search(pattern, content)
            if match:
                insert_pos = match.start()
                insert_before_text = match.group(0)
                break
        
        if not insert_pos:
            # Try to find after CRUD package
            crud_pattern = r'<!-- ===== PACKAGE.*CRUD.*PACKAGE ====='
            crud_match = re.search(crud_pattern, content, re.IGNORECASE)
            if crud_match:
                # Find end of CRUD package
                insert_pos = find_script_section_end(content[crud_match.end():], 'crud') + crud_match.end()
                insert_before_text = content[insert_pos:insert_pos+100]
        
        if not insert_pos:
            print(f"⚠️  {page_path} - Could not find insertion point")
            return False
        
        # Create entity-details package section
        entity_details_section = f"""
    <!-- =============================================================== -->
    <!-- ===== ENTITY DETAILS PACKAGE ===== -->
    <!-- =============================================================== -->
    <!-- Load Order: 17 | Description: מערכות פרטי ישויות -->
    <!-- Dependencies: base, services, ui-advanced, crud, preferences, entity-services -->
    <!-- Critical: NO | Version: 2.0.0 -->

    <!-- [50] Load Order: 50 -->
    <script src="scripts/entity-details-api.js?v=1.0.0"></script> <!-- API פרטי ישויות -->
    <!-- [51] Load Order: 51 -->
    <script src="scripts/entity-details-renderer.js?v=1.0.0"></script> <!-- מציג פרטי ישויות -->
    <!-- [52] Load Order: 52 -->
    <script src="scripts/entity-details-modal.js?v=1.0.0"></script> <!-- מודל פרטי ישויות -->

"""
        
        # Insert before the found position
        new_content = content[:insert_pos] + entity_details_section + content[insert_pos:]
        
        # Write back
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ {page_path} - Added entity-details files")
        return True
        
    except Exception as e:
        print(f"❌ {page_path} - Error: {e}")
        return False

def main():
    print("=" * 80)
    print("Entity Details Modal Missing Files Fixer")
    print("=" * 80)
    print(f"Processing {len(PAGES_WITH_ENTITIES)} pages...")
    print()
    
    fixed_count = 0
    
    for page_path in PAGES_WITH_ENTITIES:
        if add_entity_details_files(page_path):
            fixed_count += 1
    
    print()
    print("=" * 80)
    print(f"✅ Fixed {fixed_count} pages")
    print("=" * 80)

if __name__ == "__main__":
    main()



