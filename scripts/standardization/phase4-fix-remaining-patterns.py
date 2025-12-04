#!/usr/bin/env python3
"""
Phase 4: Fix Remaining Patterns
תיקון דפוסים שנותרו - console.*, innerHTML, alert/confirm
"""

import os
import re
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI = PROJECT_ROOT / 'trading-ui'
SCRIPTS_DIR = TRADING_UI / 'scripts'
DOCS_DIR = PROJECT_ROOT / 'documentation' / '05-REPORTS'

# Read test results to get list of pages with issues
def get_pages_with_patterns():
    """Get pages that need pattern fixes"""
    results_file = DOCS_DIR / 'STANDARDIZATION_PHASE_4_TEST_RESULTS.json'
    if not results_file.exists():
        return []
    
    import json
    with open(results_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    pages_to_fix = []
    for result in data.get('results', []):
        patterns = result.get('patterns', {})
        if patterns:
            console = patterns.get('console_calls', 0)
            innerhtml = patterns.get('innerhtml_usage', 0)
            alerts = patterns.get('alerts', 0)
            confirms = patterns.get('confirms', 0)
            if console > 0 or innerhtml > 0 or alerts > 0 or confirms > 0:
                pages_to_fix.append({
                    'page': result.get('page'),
                    'js_exists': result.get('js_exists'),
                    'console': console,
                    'innerhtml': innerhtml,
                    'alerts': alerts,
                    'confirms': confirms
                })
    
    return pages_to_fix

def fix_console_calls(file_path):
    """Fix console.* calls - replace with Logger"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace console.log → Logger.info
        content = re.sub(
            r'console\.log\s*\(',
            'Logger.info(',
            content
        )
        
        # Replace console.error → Logger.error
        content = re.sub(
            r'console\.error\s*\(',
            'Logger.error(',
            content
        )
        
        # Replace console.warn → Logger.warn
        content = re.sub(
            r'console\.warn\s*\(',
            'Logger.warn(',
            content
        )
        
        # Replace console.info → Logger.info
        content = re.sub(
            r'console\.info\s*\(',
            'Logger.info(',
            content
        )
        
        # Replace console.debug → Logger.debug
        content = re.sub(
            r'console\.debug\s*\(',
            'Logger.debug(',
            content
        )
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"  ❌ Error fixing console calls in {file_path}: {e}")
        return False

def fix_alerts_confirms(file_path):
    """Fix alert/confirm calls - replace with NotificationSystem"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace alert() → NotificationSystem.show()
        # This is complex - alert() is blocking, NotificationSystem is not
        # We'll need to handle this more carefully
        # For now, just log a warning
        alert_pattern = r'\balert\s*\('
        if re.search(alert_pattern, content):
            print(f"  ⚠️  Found alert() calls - needs manual review")
        
        # Replace confirm() → ModalManagerV2 or custom confirmation
        confirm_pattern = r'\bconfirm\s*\('
        if re.search(confirm_pattern, content):
            print(f"  ⚠️  Found confirm() calls - needs manual review")
        
        return False  # Don't auto-fix these yet
    except Exception as e:
        print(f"  ❌ Error fixing alerts/confirms in {file_path}: {e}")
        return False

def main():
    """Main function"""
    print("=" * 70)
    print("Phase 4: Fix Remaining Patterns")
    print("=" * 70)
    
    pages_to_fix = get_pages_with_patterns()
    print(f"\nFound {len(pages_to_fix)} pages with patterns to fix\n")
    
    fixed_console = 0
    fixed_alerts = 0
    skipped = []
    
    for page_info in pages_to_fix:
        page_name = page_info['page']
        js_file = SCRIPTS_DIR / f'{page_name}.js'
        
        if not js_file.exists():
            print(f"⏭️  Skipping {page_name} - JS file not found")
            skipped.append(page_name)
            continue
        
        print(f"🔧 Fixing {page_name}...")
        
        # Fix console calls
        if page_info['console'] > 0:
            if fix_console_calls(js_file):
                fixed_console += page_info['console']
                print(f"  ✅ Fixed {page_info['console']} console calls")
            else:
                print(f"  ⚠️  Could not fix console calls")
        
        # Fix alerts/confirms (just report for now)
        if page_info['alerts'] > 0 or page_info['confirms'] > 0:
            fix_alerts_confirms(js_file)
            fixed_alerts += page_info['alerts'] + page_info['confirms']
    
    print("\n" + "=" * 70)
    print("📊 Summary")
    print("=" * 70)
    print(f"Pages processed: {len(pages_to_fix)}")
    print(f"Console calls fixed: {fixed_console}")
    print(f"Alerts/confirms found: {fixed_alerts} (needs manual review)")
    print(f"Skipped: {len(skipped)}")
    
    if skipped:
        print(f"\nSkipped pages: {', '.join(skipped)}")

if __name__ == '__main__':
    main()



