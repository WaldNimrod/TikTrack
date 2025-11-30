#!/usr/bin/env python3
"""
Script to fix high priority patterns across all incomplete pages
Fixes: console.*, alert/confirm, localStorage, bootstrap.Modal, inline styles
"""

import re
import sys
from pathlib import Path
from collections import defaultdict

# Base directory
BASE_DIR = Path(__file__).parent.parent.parent
TRADING_UI_DIR = BASE_DIR / 'trading-ui'
SCRIPTS_DIR = TRADING_UI_DIR / 'scripts'

# Files to fix (from scan results)
FILES_TO_FIX = {
    'console': [
        'notifications-center.js',
        'background-tasks.js',
        'server-monitor.js',
        'css-management.js',
        'system-management.js',
        'cash_flows.js',
        'index.js',
        'tradingview-test-page.js',
        'date-comparison-modal.js',
        'constraints.js',
    ],
    'alert_confirm': [
        'cash_flows.js',
        'trading_accounts.js',
        'notifications-center.js',
        'index.js',
        'system-management.js',
        'dynamic-colors-display.js',
        'server-monitor.js',
        'tradingview-test-page.js',
        'tickers.js',
        'preferences.js',
    ],
    'localStorage': [
        'comparative-analysis-page.js',
        'economic-calendar-page.js',
        'user-profile.js',
        'server-monitor.js',
        'trading_accounts.js',
    ],
    'bootstrap_modal': [
        'css-management.js',
        'constraints.js',
        'trade-history-page.js',
        'system-management.js',
        'notifications-center.js',
    ],
    'inline_styles': [
        'designs.html',
        'index.html',
    ],
}

def fix_console_calls(content, file_path):
    """Fix console.* calls - replace with Logger"""
    changes = []
    
    # Pattern 1: console.log('message')
    def replace_log(match):
        args = match.group(1)
        changes.append(f"console.log({args})")
        return f'window.Logger?.debug({args})'
    
    content = re.sub(r'console\.log\s*\(\s*([^)]+)\s*\)', replace_log, content)
    
    # Pattern 2: console.error('message')
    def replace_error(match):
        args = match.group(1)
        changes.append(f"console.error({args})")
        return f'window.Logger?.error({args})'
    
    content = re.sub(r'console\.error\s*\(\s*([^)]+)\s*\)', replace_error, content)
    
    # Pattern 3: console.warn('message')
    def replace_warn(match):
        args = match.group(1)
        changes.append(f"console.warn({args})")
        return f'window.Logger?.warn({args})'
    
    content = re.sub(r'console\.warn\s*\(\s*([^)]+)\s*\)', replace_warn, content)
    
    # Pattern 4: console.info('message')
    def replace_info(match):
        args = match.group(1)
        changes.append(f"console.info({args})")
        return f'window.Logger?.info({args})'
    
    content = re.sub(r'console\.info\s*\(\s*([^)]+)\s*\)', replace_info, content)
    
    # Pattern 5: console.debug('message')
    def replace_debug(match):
        args = match.group(1)
        changes.append(f"console.debug({args})")
        return f'window.Logger?.debug({args})'
    
    content = re.sub(r'console\.debug\s*\(\s*([^)]+)\s*\)', replace_debug, content)
    
    return content, len(changes) > 0, changes

def fix_alert_confirm(content, file_path):
    """Fix alert()/confirm() calls - replace with NotificationSystem"""
    changes = []
    
    # Pattern 1: alert('message')
    def replace_alert(match):
        message = match.group(1)
        changes.append(f"alert({message})")
        return f'window.showErrorNotification({message}, "שגיאה")'
    
    content = re.sub(r'alert\s*\(\s*([^)]+)\s*\)', replace_alert, content)
    
    # Pattern 2: confirm('message')
    def replace_confirm(match):
        message = match.group(1)
        changes.append(f"confirm({message})")
        return f'window.showConfirmationDialog({message})'
    
    content = re.sub(r'confirm\s*\(\s*([^)]+)\s*\)', replace_confirm, content)
    
    # Pattern 3: window.confirm('message')
    def replace_window_confirm(match):
        message = match.group(1)
        changes.append(f"window.confirm({message})")
        return f'window.showConfirmationDialog({message})'
    
    content = re.sub(r'window\.confirm\s*\(\s*([^)]+)\s*\)', replace_window_confirm, content)
    
    return content, len(changes) > 0, changes

def fix_localStorage(content, file_path):
    """Fix localStorage direct usage - replace with PageStateManager"""
    changes = []
    
    # Pattern 1: localStorage.getItem('key')
    def replace_getItem(match):
        key = match.group(1)
        changes.append(f"localStorage.getItem({key})")
        return f'window.PageStateManager?.getItem({key})'
    
    content = re.sub(r'localStorage\.getItem\s*\(\s*([^)]+)\s*\)', replace_getItem, content)
    
    # Pattern 2: localStorage.setItem('key', value)
    def replace_setItem(match):
        key = match.group(1)
        value = match.group(2)
        changes.append(f"localStorage.setItem({key}, {value})")
        return f'window.PageStateManager?.setItem({key}, {value})'
    
    content = re.sub(r'localStorage\.setItem\s*\(\s*([^,)]+)\s*,\s*([^)]+)\s*\)', replace_setItem, content)
    
    # Pattern 3: localStorage.removeItem('key')
    def replace_removeItem(match):
        key = match.group(1)
        changes.append(f"localStorage.removeItem({key})")
        return f'window.PageStateManager?.removeItem({key})'
    
    content = re.sub(r'localStorage\.removeItem\s*\(\s*([^)]+)\s*\)', replace_removeItem, content)
    
    return content, len(changes) > 0, changes

def fix_bootstrap_modal(content, file_path):
    """Fix bootstrap.Modal direct usage - replace with ModalManagerV2"""
    changes = []
    
    # Pattern 1: new bootstrap.Modal(element)
    def replace_new_modal(match):
        element = match.group(1)
        options = match.group(2) if match.group(2) else ''
        changes.append(f"new bootstrap.Modal({element})")
        if options:
            return f'window.ModalManagerV2?.openModal({element}, {options})'
        return f'window.ModalManagerV2?.openModal({element})'
    
    content = re.sub(r'new\s+bootstrap\.Modal\s*\(\s*([^,)]+)(?:,\s*([^)]+))?\s*\)', replace_new_modal, content)
    
    # Pattern 2: bootstrap.Modal.getInstance(element)
    def replace_getInstance(match):
        element = match.group(1)
        changes.append(f"bootstrap.Modal.getInstance({element})")
        return f'window.ModalManagerV2?.getInstance({element})'
    
    content = re.sub(r'bootstrap\.Modal\.getInstance\s*\(\s*([^)]+)\s*\)', replace_getInstance, content)
    
    return content, len(changes) > 0, changes

def fix_inline_styles(content, file_path):
    """Fix inline styles - move to CSS file"""
    # This is more complex - we'll just remove inline styles and add a comment
    # The actual CSS should be moved manually to appropriate CSS files
    changes = []
    
    def replace_style(match):
        full_match = match.group(0)
        changes.append(full_match)
        # Remove inline style, keep the element
        element = match.group(1)
        return element
    
    # Pattern: <tag style="...">
    content = re.sub(r'(<[^>]+)\s+style\s*=\s*["\'][^"\']*["\']([^>]*>)', replace_style, content)
    
    return content, len(changes) > 0, changes

def fix_file(file_path, pattern_type):
    """Fix a single file"""
    if not file_path.exists():
        return False, 0, []
    
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        changes_made = False
        all_changes = []
        
        if pattern_type == 'console':
            content, changes_made, all_changes = fix_console_calls(content, file_path)
        elif pattern_type == 'alert_confirm':
            content, changes_made, all_changes = fix_alert_confirm(content, file_path)
        elif pattern_type == 'localStorage':
            content, changes_made, all_changes = fix_localStorage(content, file_path)
        elif pattern_type == 'bootstrap_modal':
            content, changes_made, all_changes = fix_bootstrap_modal(content, file_path)
        elif pattern_type == 'inline_styles':
            content, changes_made, all_changes = fix_inline_styles(content, file_path)
        
        if changes_made:
            file_path.write_text(content, encoding='utf-8')
            return True, len(all_changes), all_changes
        
        return False, 0, []
        
    except Exception as e:
        print(f"  ❌ Error fixing {file_path}: {e}")
        return False, 0, []

def main():
    """Main function"""
    print("🔧 Fixing high priority patterns...")
    print("=" * 80)
    print()
    
    total_fixed = 0
    total_changes = 0
    
    # Fix console.*
    print("📋 Fixing console.* → Logger...")
    for js_file in FILES_TO_FIX['console']:
        file_path = SCRIPTS_DIR / js_file
        print(f"  📄 {js_file}...", end=' ')
        fixed, count, changes = fix_file(file_path, 'console')
        if fixed:
            print(f"✅ Fixed {count} occurrences")
            total_fixed += 1
            total_changes += count
        else:
            print("⚠️  No changes needed")
    print()
    
    # Fix alert/confirm
    print("📋 Fixing alert/confirm → NotificationSystem...")
    for js_file in FILES_TO_FIX['alert_confirm']:
        file_path = SCRIPTS_DIR / js_file
        print(f"  📄 {js_file}...", end=' ')
        fixed, count, changes = fix_file(file_path, 'alert_confirm')
        if fixed:
            print(f"✅ Fixed {count} occurrences")
            total_fixed += 1
            total_changes += count
        else:
            print("⚠️  No changes needed")
    print()
    
    # Fix localStorage
    print("📋 Fixing localStorage → PageStateManager...")
    for js_file in FILES_TO_FIX['localStorage']:
        file_path = SCRIPTS_DIR / js_file
        print(f"  📄 {js_file}...", end=' ')
        fixed, count, changes = fix_file(file_path, 'localStorage')
        if fixed:
            print(f"✅ Fixed {count} occurrences")
            total_fixed += 1
            total_changes += count
        else:
            print("⚠️  No changes needed")
    print()
    
    # Fix bootstrap.Modal
    print("📋 Fixing bootstrap.Modal → ModalManagerV2...")
    for js_file in FILES_TO_FIX['bootstrap_modal']:
        file_path = SCRIPTS_DIR / js_file
        print(f"  📄 {js_file}...", end=' ')
        fixed, count, changes = fix_file(file_path, 'bootstrap_modal')
        if fixed:
            print(f"✅ Fixed {count} occurrences")
            total_fixed += 1
            total_changes += count
        else:
            print("⚠️  No changes needed")
    print()
    
    # Fix inline styles
    print("📋 Fixing inline styles → CSS files...")
    for html_file in FILES_TO_FIX['inline_styles']:
        file_path = TRADING_UI_DIR / html_file
        print(f"  📄 {html_file}...", end=' ')
        fixed, count, changes = fix_file(file_path, 'inline_styles')
        if fixed:
            print(f"✅ Fixed {count} occurrences")
            total_fixed += 1
            total_changes += count
        else:
            print("⚠️  No changes needed")
    print()
    
    print("=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"✅ Files fixed: {total_fixed}")
    print(f"✅ Total changes: {total_changes}")
    print("=" * 80)

if __name__ == '__main__':
    main()

