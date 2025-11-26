#!/usr/bin/env python3
"""
סקריפט תיקון אוטומטי - Button System Standardization
Automated Fix Script for Button System Deviations

מתקן אוטומטית סטיות מהסטנדרט של Button System:
1. החלפת onclick ב-data-onclick
2. הוספת data-button-type לכפתורים חסרים
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent.parent
PAGES_ROOT = PROJECT_ROOT / "trading-ui"

# Pages to scan (from UI_STANDARDIZATION_WORK_DOCUMENT.md)
PAGES = [
    # Central pages (11)
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
    
    # Technical pages (12)
    "db_display.html",
    "db_extradata.html",
    "constraints.html",
    "background-tasks.html",
    "server-monitor.html",
    "system-management.html",
    "cache-test.html",
    "notifications-center.html",
    "css-management.html",
    "dynamic-colors-display.html",
    "designs.html",
    "tradingview-test-page.html",
    
    # Secondary pages (2)
    "external-data-dashboard.html",
    "chart-management.html",
    
    # Mockup pages (11)
    "mockups/daily-snapshots/portfolio-state-page.html",
    "mockups/daily-snapshots/trade-history-page.html",
    "mockups/daily-snapshots/price-history-page.html",
    "mockups/daily-snapshots/comparative-analysis-page.html",
    "mockups/daily-snapshots/trading-journal-page.html",
    "mockups/daily-snapshots/strategy-analysis-page.html",
    "mockups/daily-snapshots/economic-calendar-page.html",
    "mockups/daily-snapshots/history-widget.html",
    "mockups/daily-snapshots/emotional-tracking-widget.html",
    "mockups/daily-snapshots/date-comparison-modal.html",
    "mockups/daily-snapshots/tradingview-test-page.html",
]

# Button type mapping based on common patterns
BUTTON_TYPE_MAPPING = {
    r'ערוך|edit|עריכה': 'EDIT',
    r'מחק|delete|מחיקה': 'DELETE',
    r'שמור|save|שמירה': 'SAVE',
    r'ביטול|cancel': 'CANCEL',
    r'הוסף|add|הוספה': 'ADD',
    r'סגור|close': 'CLOSE',
    r'רענן|refresh': 'REFRESH',
    r'ייצא|export': 'EXPORT',
    r'ייבא|import': 'IMPORT',
    r'חיפוש|search': 'SEARCH',
    r'פילטר|filter': 'FILTER',
    r'צפה|view': 'VIEW',
    r'הצג/הסתר|toggle': 'TOGGLE',
    r'מיון|sort': 'SORT',
    r'קישור|link': 'LINK',
}


class ButtonSystemFixer:
    def __init__(self):
        self.fixes_applied = {
            "onclick_to_data_onclick": 0,
            "added_data_button_type": 0,
            "files_modified": 0
        }
        self.errors = []
    
    def fix_onclick_to_data_onclick(self, content: str, file_path: Path) -> str:
        """Replace onclick= with data-onclick= and remove onclick when data-onclick exists"""
        modified = False
        fixes_count = 0
        
        # Process the entire content (works better for long lines)
        original_content = content
        
        # Step 1: Remove onclick when data-onclick exists (both in same tag)
        def remove_duplicate_onclick(match):
            tag_content = match.group(0)
            has_data_onclick = 'data-onclick' in tag_content.lower()
            
            if has_data_onclick:
                # Find and remove onclick attribute (keep data-onclick)
                onclick_pattern = r'\s+onclick\s*=\s*["\'][^"\']*["\']'
                new_tag = re.sub(onclick_pattern, '', tag_content, flags=re.IGNORECASE)
                if new_tag != tag_content:
                    nonlocal fixes_count
                    fixes_count += 1
                return new_tag
            return tag_content
        
        # Find all HTML tags that might have onclick or data-onclick
        tag_pattern = r'<(?:button|a|div|span|input)[^>]*(?:onclick|data-onclick)[^>]*>'
        content = re.sub(tag_pattern, remove_duplicate_onclick, content, flags=re.IGNORECASE | re.DOTALL)
        
        # Step 2: Replace remaining onclick with data-onclick (when data-onclick doesn't exist)
        def replace_onclick(match):
            tag_content = match.group(0)
            # Check if data-onclick already exists
            if 'data-onclick' not in tag_content.lower():
                # Replace onclick with data-onclick
                nonlocal fixes_count
                fixes_count += 1
                new_tag = re.sub(r'onclick\s*=', 'data-onclick=', tag_content, flags=re.IGNORECASE)
                return new_tag
            return tag_content
        
        content = re.sub(tag_pattern, replace_onclick, content, flags=re.IGNORECASE | re.DOTALL)
        
        if content != original_content:
            modified = True
            self.fixes_applied["onclick_to_data_onclick"] += fixes_count
        
        return content
    
    def detect_button_type(self, button_html: str, context: str = '') -> str:
        """Try to detect button type from HTML and context"""
        button_lower = button_html.lower()
        
        # Check for common button patterns
        for pattern, button_type in BUTTON_TYPE_MAPPING.items():
            if re.search(pattern, button_lower, re.IGNORECASE):
                return button_type
        
        # Check onclick/data-onclick function name
        onclick_match = re.search(r'(data-)?onclick\s*=\s*["\']([^"\']*)["\']', button_html, re.IGNORECASE)
        if onclick_match:
            onclick_value = onclick_match.group(2).lower()
            if 'edit' in onclick_value or 'ערוך' in onclick_value:
                return 'EDIT'
            if 'delete' in onclick_value or 'מחק' in onclick_value:
                return 'DELETE'
            if 'save' in onclick_value or 'שמור' in onclick_value:
                return 'SAVE'
            if 'cancel' in onclick_value or 'ביטול' in onclick_value:
                return 'CANCEL'
            if 'add' in onclick_value or 'הוסף' in onclick_value:
                return 'ADD'
            if 'close' in onclick_value or 'סגור' in onclick_value:
                return 'CLOSE'
            if 'toggle' in onclick_value or 'הצג/הסתר' in onclick_value:
                return 'TOGGLE'
            if 'sort' in onclick_value or 'מיון' in onclick_value:
                return 'SORT'
            if 'start' in onclick_value or 'התחל' in onclick_value or 'scheduler' in onclick_value:
                return 'PLAY'
            if 'stop' in onclick_value or 'עצור' in onclick_value:
                return 'STOP'
            if 'refresh' in onclick_value or 'רענן' in onclick_value:
                return 'REFRESH'
            if 'restart' in onclick_value:
                return 'REFRESH'
            if 'pause' in onclick_value or 'השהה' in onclick_value:
                return 'PAUSE'
            if 'open' in onclick_value or 'פתח' in onclick_value:
                return 'VIEW'
            if 'navigate' in onclick_value:
                return 'LINK'
        
        # Check for Bootstrap dismiss (modal close)
        if 'data-bs-dismiss' in button_lower:
            return 'CLOSE'
        
        # Check ID patterns
        id_match = re.search(r'id\s*=\s*["\']([^"\']*)["\']', button_html, re.IGNORECASE)
        if id_match:
            button_id = id_match.group(1).lower()
            if 'start' in button_id or 'play' in button_id or 'run' in button_id:
                return 'PLAY'
            if 'stop' in button_id or 'end' in button_id:
                return 'STOP'
            if 'pause' in button_id:
                return 'PAUSE'
            if 'refresh' in button_id or 'reload' in button_id:
                return 'REFRESH'
            if 'restart' in button_id:
                return 'REFRESH'
            if 'open' in button_id:
                return 'VIEW'
            if 'clear' in button_id or 'clean' in button_id:
                return 'DELETE'
            if 'check' in button_id or 'test' in button_id or 'validate' in button_id:
                return 'CHECK'
            if 'scan' in button_id or 'detect' in button_id:
                return 'SEARCH'
            if 'minify' in button_id or 'compress' in button_id:
                return 'EXPORT'
            if 'status' in button_id:
                return 'VIEW'
            if 'mode' in button_id:
                return 'MENU'
        
        # Check title/tooltip text
        title_match = re.search(r'title\s*=\s*["\']([^"\']*)["\']', button_html, re.IGNORECASE)
        if title_match:
            title_text = title_match.group(1).lower()
            if 'רענן' in title_text or 'refresh' in title_text:
                return 'REFRESH'
            if 'פתח' in title_text or 'open' in title_text or 'הצג' in title_text:
                return 'VIEW'
            if 'איתחול' in title_text or 'restart' in title_text:
                return 'REFRESH'
            if 'הצג' in title_text or 'show' in title_text or 'view' in title_text:
                return 'VIEW'
            if 'בדוק' in title_text or 'check' in title_text or 'test' in title_text:
                return 'CHECK'
            if 'זהה' in title_text or 'scan' in title_text or 'detect' in title_text:
                return 'SEARCH'
            if 'הסר' in title_text or 'remove' in title_text or 'clear' in title_text:
                return 'DELETE'
        
        # Default fallback - use PRIMARY for buttons with data-onclick
        if 'data-onclick' in button_lower:
            return 'PRIMARY'
        
        return None
    
    def add_data_button_type_to_buttons(self, content: str, file_path: Path) -> str:
        """Add data-button-type to buttons that don't have it"""
        modified = False
        fixes_count = 0
        
        # Process entire content (works better for all cases)
        original_content = content
        
        # Find all button tags
        button_pattern = r'<button([^>]*)>'
        
        def add_button_type(match):
            button_attrs = match.group(1)
            
            # Skip if already has data-button-type
            if 'data-button-type' in button_attrs.lower():
                return match.group(0)
            
            # Skip submit buttons (form buttons)
            if 'type="submit' in button_attrs.lower():
                return match.group(0)
            
            # Try to detect button type from attributes and context
            button_type = self.detect_button_type(button_attrs, '')
            
            if button_type:
                # Add data-button-type attribute before the closing >
                if button_attrs.strip():
                    new_attrs = f'{button_attrs} data-button-type="{button_type}"'
                else:
                    new_attrs = f' data-button-type="{button_type}"'
                nonlocal fixes_count
                fixes_count += 1
                return f'<button{new_attrs}>'
            
            return match.group(0)
        
        new_content = re.sub(button_pattern, add_button_type, content, flags=re.IGNORECASE)
        
        if new_content != original_content:
            modified = True
            self.fixes_applied["added_data_button_type"] += fixes_count
        
        return new_content
    
    def fix_file(self, file_path: Path, dry_run: bool = False) -> Dict[str, Any]:
        """Fix a single file"""
        result = {
            "file": str(file_path),
            "modified": False,
            "fixes": []
        }
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()
            
            content = original_content
            
            # Fix 1: Replace onclick with data-onclick
            content = self.fix_onclick_to_data_onclick(content, file_path)
            
            # Fix 2: Add data-button-type to buttons without it
            content = self.add_data_button_type_to_buttons(content, file_path)
            
            if content != original_content:
                result["modified"] = True
                if not dry_run:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    self.fixes_applied["files_modified"] += 1
                
        except Exception as e:
            error_msg = f"Error fixing {file_path}: {e}"
            self.errors.append(error_msg)
            result["error"] = error_msg
        
        return result
    
    def fix_all_pages(self, dry_run: bool = False):
        """Fix all pages"""
        print("=" * 80)
        print("🔧 Button System - Automated Fixes")
        print("=" * 80)
        print(f"Mode: {'DRY RUN' if dry_run else 'APPLY FIXES'}")
        print()
        
        # Get all HTML files
        html_files = []
        for page in PAGES:
            file_path = PAGES_ROOT / page
            if file_path.exists():
                html_files.append(file_path)
        
        print(f"📋 Found {len(html_files)} HTML files to process")
        print()
        
        results = []
        for file_path in html_files:
            print(f"Processing: {file_path.name}...")
            result = self.fix_file(file_path, dry_run)
            results.append(result)
            if result.get("modified"):
                print(f"  ✅ Modified")
            elif result.get("error"):
                print(f"  ❌ Error: {result['error']}")
            else:
                print(f"  ⏭️  No changes needed")
        
        # Summary
        print()
        print("=" * 80)
        print("📊 FIX SUMMARY")
        print("=" * 80)
        print(f"Files processed: {len(results)}")
        print(f"Files modified: {self.fixes_applied['files_modified']}")
        print(f"onclick → data-onclick: {self.fixes_applied['onclick_to_data_onclick']}")
        print(f"Added data-button-type: {self.fixes_applied['added_data_button_type']}")
        print()
        
        if self.errors:
            print(f"Errors: {len(self.errors)}")
            for error in self.errors[:5]:  # Show first 5 errors
                print(f"  - {error}")
        print("=" * 80)


def main():
    import sys
    dry_run = '--dry-run' in sys.argv
    
    fixer = ButtonSystemFixer()
    fixer.fix_all_pages(dry_run)
    return 0


if __name__ == "__main__":
    exit(main())

