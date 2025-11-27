#!/usr/bin/env python3
"""
Script to fix HTML structure in all mockup pages
Fixes:
1. Moves unified-header inside background-wrapper
2. Removes mockups-navigation
3. Adds Header System initialization code
4. Adds notification-container
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
MOCKUPS_DIR = BASE_DIR / "trading-ui" / "mockups"
DAILY_SNAPSHOTS_DIR = MOCKUPS_DIR / "daily-snapshots"

# List of mockup pages
MOCKUP_PAGES = [
    DAILY_SNAPSHOTS_DIR / "comparative-analysis-page.html",
    DAILY_SNAPSHOTS_DIR / "date-comparison-modal.html",
    DAILY_SNAPSHOTS_DIR / "economic-calendar-page.html",
    DAILY_SNAPSHOTS_DIR / "emotional-tracking-widget.html",
    DAILY_SNAPSHOTS_DIR / "history-widget.html",
    DAILY_SNAPSHOTS_DIR / "portfolio-state-page.html",
    DAILY_SNAPSHOTS_DIR / "price-history-page.html",
    DAILY_SNAPSHOTS_DIR / "strategy-analysis-page.html",
    DAILY_SNAPSHOTS_DIR / "trade-history-page.html",
    DAILY_SNAPSHOTS_DIR / "trading-journal-page.html",
    DAILY_SNAPSHOTS_DIR / "tradingview-test-page.html",
    MOCKUPS_DIR / "add-ticker-modal.html",
    MOCKUPS_DIR / "flag-quick-action.html",
    MOCKUPS_DIR / "watch-list-modal.html",
    MOCKUPS_DIR / "watch-lists-page.html",
]

# Header initialization code
HEADER_INIT_CODE = """    <script>
        // Auto-initialize HeaderSystem when DOM is ready
        (function() {
            function initHeader() {
                if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
                    try {
                        window.HeaderSystem.initialize();
                    } catch (error) {
                        if (window.console && window.console.error) {
                            window.console.error('Error initializing HeaderSystem:', error);
                        }
                    }
                } else {
                    setTimeout(initHeader, 100);
                }
            }
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initHeader);
            } else {
                setTimeout(initHeader, 100);
            }
        })();
    </script>"""

# Template structure
BODY_START_TEMPLATE = """<body class="{body_class}">
    <!-- Notification container -->
    <div class="notification-container" id="notificationContainer"></div>
    
    <!-- ===== TEMPLATE ZONE 1: BACKGROUND WRAPPER (LOCKED) ===== -->
    <div class="background-wrapper">
        <!-- ===== TEMPLATE ZONE 2: HEADER SYSTEM (LOCKED - DO NOT TOUCH) ===== -->
        <div id="unified-header"></div>

        <!-- ===== TEMPLATE ZONE 3: PAGE BODY (LOCKED) ===== -->
        <div class="page-body">
            <!-- ===== TEMPLATE ZONE 4: MAIN CONTENT (EDITABLE) ===== -->
            <div class="main-content">"""

def fix_page(file_path):
    """Fix a single page"""
    if not file_path.exists():
        print(f"⚠️  File not found: {file_path}")
        return False
    
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        # 1. Add Header System initialization code if missing
        if 'header-system.js' in content and 'HeaderSystem.initialize' not in content:
            # Find the header-system.js script tag
            header_script_pattern = r'(<script[^>]*header-system\.js[^>]*></script>)'
            match = re.search(header_script_pattern, content, re.IGNORECASE)
            if match:
                # Replace with script + initialization
                replacement = match.group(0) + '\n' + HEADER_INIT_CODE
                content = content[:match.end()] + '\n' + HEADER_INIT_CODE + content[match.end():]
        
        # 2. Fix body structure
        # Find body tag and extract class
        body_match = re.search(r'<body[^>]*class=["\']([^"\']+)["\']', content)
        body_class = body_match.group(1) if body_match else 'page'
        
        # Remove mockups-navigation
        mockups_nav_pattern = r'<!--\s*Mockups Navigation[^>]*-->.*?</div>\s*</div>\s*</div>'
        content = re.sub(mockups_nav_pattern, '', content, flags=re.DOTALL)
        
        # Find where body content starts (after body tag)
        body_start_match = re.search(r'<body[^>]*>', content)
        if not body_start_match:
            print(f"⚠️  Could not find body tag in {file_path.name}")
            return False
        
        body_start_pos = body_start_match.end()
        
        # Check if unified-header is already inside background-wrapper
        body_section = content[body_start_pos:]
        
        # If unified-header is outside background-wrapper, we need to restructure
        if '<div id="unified-header"></div>' in body_section:
            # Check if it's already inside background-wrapper
            header_pos = body_section.find('<div id="unified-header"></div>')
            before_header = body_section[:header_pos]
            
            # If background-wrapper is after header, we need to move header inside
            if 'background-wrapper' not in before_header or before_header.rfind('background-wrapper') < before_header.rfind('<div'):
                # Need to restructure
                # Find the first background-wrapper after header
                after_header = body_section[header_pos:]
                bg_wrapper_match = re.search(r'<div[^>]*class=["\'][^"\']*background-wrapper["\']', after_header)
                
                if bg_wrapper_match:
                    # Move header inside background-wrapper
                    bg_wrapper_start = header_pos + bg_wrapper_match.start()
                    bg_wrapper_end = bg_wrapper_start + bg_wrapper_match.end()
                    
                    # Insert header after background-wrapper opening
                    header_html = '        <div id="unified-header"></div>\n\n'
                    content = content[:body_start_pos + bg_wrapper_end] + '\n' + header_html + content[body_start_pos + bg_wrapper_end:]
                    
                    # Remove old header
                    old_header_pos = body_start_pos + header_pos
                    old_header_end = old_header_pos + len('<div id="unified-header"></div>')
                    content = content[:old_header_pos] + content[old_header_end:].lstrip()
        
        # 3. Ensure notification-container exists
        if 'notification-container' not in content or 'id="notificationContainer"' not in content:
            # Add notification container right after body tag
            notification_html = '    <!-- Notification container -->\n    <div class="notification-container" id="notificationContainer"></div>\n    \n'
            content = content[:body_start_pos] + '\n' + notification_html + content[body_start_pos:]
        
        # 4. Ensure proper structure comments
        if 'TEMPLATE ZONE 1' not in content:
            # Add template zone comments
            bg_wrapper_match = re.search(r'<div[^>]*class=["\'][^"\']*background-wrapper["\']', content)
            if bg_wrapper_match:
                # Add comment before background-wrapper
                comment = '    <!-- ===== TEMPLATE ZONE 1: BACKGROUND WRAPPER (LOCKED) ===== -->\n'
                content = content[:bg_wrapper_match.start()] + comment + content[bg_wrapper_match.start():]
        
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            print(f"✅ Fixed: {file_path.name}")
            return True
        else:
            print(f"ℹ️  No changes needed: {file_path.name}")
            return True
            
    except Exception as e:
        print(f"❌ Error fixing {file_path.name}: {e}")
        return False

def main():
    print("🔧 Fixing HTML structure in all mockup pages...\n")
    
    fixed = 0
    failed = 0
    
    for page_path in MOCKUP_PAGES:
        if fix_page(page_path):
            fixed += 1
        else:
            failed += 1
    
    print(f"\n📊 Summary:")
    print(f"   Fixed: {fixed}")
    print(f"   Failed: {failed}")
    print(f"   Total: {len(MOCKUP_PAGES)}")

if __name__ == "__main__":
    main()

