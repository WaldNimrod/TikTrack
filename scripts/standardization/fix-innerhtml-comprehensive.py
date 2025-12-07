#!/usr/bin/env python3
"""
Comprehensive script to fix innerHTML → createElement
Handles all patterns of innerHTML usage
"""

import re
import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent
TRADING_UI_DIR = BASE_DIR / 'trading-ui'
SCRIPTS_DIR = TRADING_UI_DIR / 'scripts'

# Files with innerHTML (from scan results)
FILES_WITH_INNERHTML = [
    'index.js',
    'tickers.js',
    'trading_accounts.js',
    'cash_flows.js',
    'research.js',
    'preferences.js',
    'user-profile.js',
    'db_display.js',
    'db_extradata.js',
    'constraints.js',
    'background-tasks.js',
    'server-monitor.js',
    'system-management.js',
    'notifications-center.js',
    'css-management.js',
    'dynamic-colors-display.js',
    'tradingview-test-page.js',
    'external-data-dashboard.js',
    'chart-management.js',
    'portfolio-state-page.js',
    'trade-history-page.js',
    'comparative-analysis-page.js',
    'trading-journal-page.js',
    'strategy-analysis-page.js',
    'economic-calendar-page.js',
    'history-widget.js',
    'date-comparison-modal.js',
]

def fix_simple_innerhtml(content):
    """Fix simple innerHTML patterns"""
    changes = 0
    
    # Pattern 1: element.innerHTML = 'simple text';
    def replace_simple_text(match):
        nonlocal changes
        element = match.group(1)
        text = match.group(2)
        changes += 1
        return f'{element}.textContent = {text};'
    
    # Simple text assignment (no HTML tags)
    content = re.sub(
        r'(\w+\.innerHTML)\s*=\s*(["\'])([^"\'<>]+)\2\s*;',
        replace_simple_text,
        content
    )
    
    # Pattern 2: element.innerHTML = '<div class="...">text</div>';
    def replace_simple_html(match):
        nonlocal changes
        element = match.group(1)
        html_content = match.group(2)
        changes += 1
        # Extract class and text if possible
        class_match = re.search(r'class=["\']([^"\']+)["\']', html_content)
        text_match = re.search(r'>([^<]+)<', html_content)
        
        if class_match and text_match:
            class_name = class_match.group(1)
            text = text_match.group(1)
            return f'''{element}.textContent = '';
        const div = document.createElement('div');
        div.className = '{class_name}';
        div.textContent = {repr(text)};
        {element}.appendChild(div);'''
        else:
            # Fallback: use tempDiv approach
            return f'''{element}.textContent = '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = {repr(html_content)};
        while (tempDiv.firstChild) {{
            {element}.appendChild(tempDiv.firstChild);
        }}'''
    
    # Simple HTML with single element
    content = re.sub(
        r'(\w+\.innerHTML)\s*=\s*(["\']<[^>]+>[^<]+</[^>]+>["\'])\s*;',
        replace_simple_html,
        content
    )
    
    return content, changes

def fix_complex_innerhtml(content, file_path):
    """Fix complex innerHTML patterns - requires manual review"""
    # This is a placeholder - complex patterns need manual fixing
    # We'll identify them and mark for review
    complex_patterns = []
    
    # Find all innerHTML assignments
    matches = list(re.finditer(r'\.innerHTML\s*=', content))
    for match in matches:
        # Get context (20 lines before and after)
        start = max(0, match.start() - 500)
        end = min(len(content), match.end() + 500)
        context = content[start:end]
        
        # Check if it's complex (contains variables, template literals, etc.)
        if '${' in context or '`' in context or '+' in context[:100]:
            line_num = content[:match.start()].count('\n') + 1
            complex_patterns.append({
                'line': line_num,
                'context': context[:200]
            })
    
    return content, complex_patterns

def fix_file(file_path):
    """Fix innerHTML in a single file"""
    if not file_path.exists():
        return False, 0, []
    
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        # Fix simple patterns
        content, simple_changes = fix_simple_innerhtml(content)
        
        # Identify complex patterns
        content, complex_patterns = fix_complex_innerhtml(content, file_path)
        
        if simple_changes > 0:
            file_path.write_text(content, encoding='utf-8')
            return True, simple_changes, complex_patterns
        
        return False, 0, complex_patterns
        
    except Exception as e:
        print(f"  ❌ Error fixing {file_path}: {e}")
        return False, 0, []

def main():
    """Main function"""
    print("🔧 Fixing innerHTML → createElement...")
    print("=" * 80)
    print()
    
    total_fixed = 0
    total_changes = 0
    all_complex = []
    
    for js_file in FILES_WITH_INNERHTML:
        file_path = SCRIPTS_DIR / js_file
        print(f"  📄 {js_file}...", end=' ')
        fixed, count, complex = fix_file(file_path)
        if fixed:
            print(f"✅ Fixed {count} simple patterns")
            if complex:
                print(f"    ⚠️  {len(complex)} complex patterns need manual review")
            total_fixed += 1
            total_changes += count
            all_complex.extend([(js_file, p) for p in complex])
        else:
            if complex:
                print(f"⚠️  {len(complex)} complex patterns need manual review")
            else:
                print("⚠️  No simple patterns found")
    
    print()
    print("=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"✅ Files fixed: {total_fixed}")
    print(f"✅ Total changes: {total_changes}")
    if all_complex:
        print(f"⚠️  Complex patterns needing manual review: {len(all_complex)}")
    print("=" * 80)
    
    if all_complex:
        print()
        print("⚠️  COMPLEX PATTERNS REQUIRING MANUAL REVIEW:")
        for file, pattern in all_complex[:10]:  # Show first 10
            print(f"  - {file}:{pattern['line']}")

if __name__ == '__main__':
    main()




