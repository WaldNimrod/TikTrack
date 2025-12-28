#!/usr/bin/env python3
"""
Script to add documentation links to test pages in dev_tools.html
"""

import re
from pathlib import Path

# Mapping of test page filenames to their section numbers in TEST_PAGES_GUIDE.md
TEST_PAGES_MAPPING = {
    'test_header_only.html': 1,
    'test_monitoring.html': 2,
    'test_frontend_wrappers.html': 3,
    'test_bootstrap_popover_comparison.html': 4,
    'test_nested_modal_rich_text.html': 5,
    'test_overlay_debug.html': 6,
    'test_quill.html': 7,
    'test_unified_widget.html': 8,
    'test_unified_widget_integration.html': 9,
    'test_unified_widget_comprehensive.html': 10,
    'test_recent_items_widget.html': 11,
    'test_ticker_widgets_performance.html': 12,
    'test_user_ticker_integration.html': 13,
    'scripts/test-user-ticker-frontend.html': 14,
    'conditions_test.html': 15,
    'external_data_dashboard.html': 16,
    'test_phase1_recovery.html': 17,
    'test_phase3_1_comprehensive.html': 18,
}

def generate_anchor(filename, section_num):
    """Generate anchor link for test page in TEST_PAGES_GUIDE.md"""
    # Convert filename to anchor format (lowercase, replace dots and slashes with hyphens)
    anchor_name = filename.lower().replace('.html', '').replace('/', '-').replace('_', '-')
    return f"#{section_num}-{anchor_name}"

def main():
    """Main function"""
    dev_tools_path = Path('trading-ui/dev_tools.html')
    
    if not dev_tools_path.exists():
        print(f"❌ Error: {dev_tools_path} not found")
        return
    
    # Read the file
    with open(dev_tools_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Process each test page
    for filename, section_num in TEST_PAGES_MAPPING.items():
        anchor = generate_anchor(filename, section_num)
        doc_link = f' <a href="documentation/03-DEVELOPMENT/TESTING/TEST_PAGES_GUIDE.md{anchor}" target="_blank" class="btn btn-sm btn-outline-secondary ms-1">📖 תעוד</a>'
        
        # Pattern to match the row: <td><strong>filename</strong></td> ... <td>...actions...</td>
        # We need to find rows that end with "לעמוד</a></td>" without a documentation link after it
        pattern = rf'(<td><strong>{re.escape(filename)}</strong></td>.*?<td><a href="[^"]*" target="_blank" class="btn btn-sm btn-outline-[^"]*">לעמוד</a>)(?!\s*<a href="documentation)'
        
        def add_link(match):
            return match.group(1) + doc_link
        
        # Replace only if the link doesn't already exist
        new_content = re.sub(pattern, add_link, content, flags=re.DOTALL)
        
        # For special cases that already have a documentation link, add our link after it
        if filename in ['conditions_test.html', 'external_data_dashboard.html']:
            # Find rows that already have a documentation link and add our link
            pattern_with_existing = rf'(<td><strong>{re.escape(filename)}</strong></td>.*?<a href="documentation/[^"]*" target="_blank" class="btn btn-sm btn-outline-secondary ms-1">📖 תעוד</a>)(?!\s*<a href="documentation/03-DEVELOPMENT/TESTING)'
            
            def add_our_link(match):
                return match.group(1) + f' <a href="documentation/03-DEVELOPMENT/TESTING/TEST_PAGES_GUIDE.md{anchor}" target="_blank" class="btn btn-sm btn-outline-secondary ms-1">📖 מדריך בדיקה</a>'
            
            new_content = re.sub(pattern_with_existing, add_our_link, new_content, flags=re.DOTALL)
        
        content = new_content
    
    # Write back
    with open(dev_tools_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {dev_tools_path} with documentation links")
    print(f"   Added links for {len(TEST_PAGES_MAPPING)} test pages")

if __name__ == '__main__':
    main()
