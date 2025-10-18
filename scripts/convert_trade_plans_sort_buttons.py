#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
המרת כפתורי מיון בעמוד trade_plans.html
Convert Sort Buttons in trade_plans.html
"""

import re

def convert_sort_buttons():
    """המרת כל כפתורי המיון בעמוד trade_plans.html"""
    
    file_path = "trading-ui/trade_plans.html"
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # תבנית לכפתורי מיון
        sort_button_pattern = r'<button class="btn btn-link sortable-header" onclick="if \(typeof window\.sortTableData === \'function\'\) \{ window\.sortTableData\((\d+), window\.trade_plansData \|\| \[\], \'trade_plans\', window\.updateTradePlansTable\); \}" style="border: none; background: none; padding: 0; margin: 0; width: 100%; text-align: center; color: inherit; text-decoration: none;">([^<]+)<span class="sort-icon">↕</span>[^<]*</button>'
        
        def replace_sort_button(match):
            column_index = match.group(1)
            button_text = match.group(2)
            
            return f'<button data-button-type="SORT" data-onclick="if (typeof window.sortTableData === \'function\') {{ window.sortTableData({column_index}, window.trade_plansData || [], \'trade_plans\', window.updateTradePlansTable); }}" data-classes="btn btn-link sortable-header" data-attributes="style=\'border: none; background: none; padding: 0; margin: 0; width: 100%; text-align: center; color: inherit; text-decoration: none;\'" data-text="{button_text}"></button>'
        
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
