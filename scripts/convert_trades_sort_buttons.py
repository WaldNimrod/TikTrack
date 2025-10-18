#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
המרת כפתורי מיון בעמוד trades.html
Convert Sort Buttons in trades.html
"""

import re

def convert_sort_buttons():
    """המרת כל כפתורי המיון בעמוד trades.html"""
    
    file_path = "trading-ui/trades.html"
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # תבנית לכפתורי מיון
        sort_button_pattern = r'<button class="btn btn-link sortable-header" style="border: none; background: none; padding: 0; margin: 0; width: 100%; text-align: center; color: inherit; text-decoration: none;" onclick="if \(typeof window\.sortTable === \'function\'\) \{ window\.sortTable\((\d+)\); \}">([^<]+)</button>'
        
        def replace_sort_button(match):
            column_index = match.group(1)
            button_text = match.group(2)
            
            return f'<button data-button-type="SORT" data-onclick="if (typeof window.sortTable === \'function\') {{ window.sortTable({column_index}); }}" data-classes="btn btn-link sortable-header" data-attributes="style=\'border: none; background: none; padding: 0; margin: 0; width: 100%; text-align: center; color: inherit; text-decoration: none;\'" data-text="{button_text}"></button>'
        
        # החלפת כל כפתורי המיון
        content = re.sub(sort_button_pattern, replace_sort_button, content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("✅ כפתורי המיון הומרו בהצלחה!")
            return True
        else:
            print("⏭️  לא נמצאו כפתורי מיון להמרה")
            return False
            
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        return False

if __name__ == "__main__":
    convert_sort_buttons()
