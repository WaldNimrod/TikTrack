#!/usr/bin/env python3
"""
סקריפט תיקון - כל הסטיות הנותרות של Entity Details Modal
Fix All Remaining Entity Details Modal Deviations

מוסיף את entity-details-api.js ו-entity-details-renderer.js
לכל העמודים שיש להם רק entity-details-modal.js.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Any

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
PAGES_ROOT = PROJECT_ROOT / "trading-ui"

def fix_mockup_page(page_path: str) -> bool:
    """Fix a mockup page by adding missing entity-details files"""
    html_path = PAGES_ROOT / page_path
    if not html_path.exists():
        print(f"⚠️  File not found: {page_path}")
        return False
    
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check what's already there
        has_api = 'entity-details-api.js' in content
        has_renderer = 'entity-details-renderer.js' in content
        has_modal = 'entity-details-modal.js' in content
        
        if has_api and has_renderer and has_modal:
            print(f"✅ {page_path} - Already has all entity-details files")
            return False
        
        # Find where entity-details-modal.js is loaded (or where to add it)
        modal_pattern = r'(<script[^>]*entity-details-modal\.js[^>]*>)'
        modal_match = re.search(modal_pattern, content)
        
        if modal_match:
            # Entity details modal exists, add the other two before it
            insert_pos = modal_match.start()
            
            # Create the missing files section
            missing_files = []
            if not has_api:
                missing_files.append('    <script src="../../scripts/entity-details-api.js" defer></script>')
            if not has_renderer:
                missing_files.append('    <script src="../../scripts/entity-details-renderer.js" defer></script>')
            
            if missing_files:
                files_section = '\n'.join(missing_files) + '\n'
                new_content = content[:insert_pos] + files_section + content[insert_pos:]
                
                with open(html_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"✅ {page_path} - Added missing files: {[f.split('/')[-1] for f in missing_files]}")
                return True
        else:
            # No entity-details-modal.js - find where to add all three
            # Look for linked-items or similar script
            linked_items_pattern = r'(<script[^>]*linked-items[^>]*>)'
            linked_match = re.search(linked_items_pattern, content)
            
            if linked_match:
                insert_pos = linked_match.end()
                
                # Add all three files
                entity_details_section = '''
    <!-- Entity Details System -->
    <script src="../../scripts/entity-details-api.js" defer></script>
    <script src="../../scripts/entity-details-renderer.js" defer></script>
    <script src="../../scripts/entity-details-modal.js" defer></script>
    
'''
                new_content = content[:insert_pos] + entity_details_section + content[insert_pos:]
                
                with open(html_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"✅ {page_path} - Added all entity-details files")
                return True
            else:
                # Try to find end of head or before closing body
                body_end = content.rfind('</body>')
                if body_end > 0:
                    insert_pos = body_end
                    
                    entity_details_section = '''
    <!-- Entity Details System -->
    <script src="../../scripts/entity-details-api.js" defer></script>
    <script src="../../scripts/entity-details-renderer.js" defer></script>
    <script src="../../scripts/entity-details-modal.js" defer></script>
    
'''
                    new_content = content[:insert_pos] + entity_details_section + content[insert_pos:]
                    
                    with open(html_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    print(f"✅ {page_path} - Added all entity-details files (before </body>)")
                    return True
        
        print(f"⚠️  {page_path} - Could not find insertion point")
        return False
        
    except Exception as e:
        print(f"❌ {page_path} - Error: {e}")
        return False

def main():
    print("=" * 80)
    print("Fix All Remaining Entity Details Modal Deviations")
    print("=" * 80)
    print()
    
    # Pages that need fixing (from the deviations report)
    pages_to_fix = [
        "mockups/daily-snapshots/portfolio-state-page.html",
        "mockups/daily-snapshots/trade-history-page.html",
        "mockups/daily-snapshots/price-history-page.html",
        "mockups/daily-snapshots/comparative-analysis-page.html",
        "mockups/daily-snapshots/strategy-analysis-page.html",
        "mockups/daily-snapshots/economic-calendar-page.html",
        "mockups/daily-snapshots/history-widget.html",
        "mockups/daily-snapshots/emotional-tracking-widget.html",
        "mockups/daily-snapshots/date-comparison-modal.html",
        "mockups/daily-snapshots/tradingview-test-page.html",
        "cache-test.html",
        "tradingview-test-page.html",
    ]
    
    fixed_count = 0
    
    for page_path in pages_to_fix:
        if fix_mockup_page(page_path):
            fixed_count += 1
    
    print()
    print("=" * 80)
    print(f"✅ Fixed {fixed_count} pages")
    print("=" * 80)

if __name__ == "__main__":
    main()

