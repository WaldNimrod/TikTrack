#!/usr/bin/env python3
"""
תיקון בעיות סדר טעינה - logger-service לפני header-system
Fix Load Order Issues - logger-service before header-system
"""

import re
from pathlib import Path

PAGES = [
    "trading-ui/alerts.html",
    "trading-ui/cash_flows.html",
    "trading-ui/executions.html",
    "trading-ui/notes.html",
    "trading-ui/tickers.html",
    "trading-ui/trades.html",
    "trading-ui/trading_accounts.html",
    "trading-ui/db_display.html",
    "trading-ui/db_extradata.html",
    "trading-ui/designs.html",
]

def check_load_order(content):
    """בדיקה אם logger-service לפני header-system"""
    logger_match = re.search(r'logger-service\.js', content)
    header_match = re.search(r'header-system\.js', content)
    
    if not logger_match or not header_match:
        return None, None, None
    
    logger_pos = logger_match.start()
    header_pos = header_match.start()
    
    # בדיקה אם יש הערה "Header System" לפני logger
    # שזה false positive
    header_comment_pattern = r'<!--[^>]*Header System[^>]*-->'
    header_comments = list(re.finditer(header_comment_pattern, content))
    
    # אם יש רק הערות לפני logger, זה false positive
    if header_comments and all(comment.start() < logger_pos for comment in header_comments):
        return logger_pos, header_pos, True  # False positive
    
    return logger_pos, header_pos, logger_pos < header_pos

def fix_page(page_path):
    """תיקון עמוד אחד"""
    path = Path(page_path)
    if not path.exists():
        print(f"❌ קובץ לא נמצא: {page_path}")
        return False
    
    content = path.read_text(encoding='utf-8')
    
    logger_pos, header_pos, is_correct = check_load_order(content)
    
    if is_correct is None:
        print(f"ℹ️  {page_path}: לא נמצאו logger-service או header-system")
        return False
    
    if is_correct:
        print(f"✅ {page_path}: סדר טעינה נכון")
        return False  # לא צריך תיקון
    
    # צריך לתקן - logger-service צריך להיות לפני header-system
    print(f"⚠️  {page_path}: סדר טעינה שגוי - logger: {logger_pos}, header: {header_pos}")
    
    # מציאת התגים המלאים
    logger_pattern = r'<script[^>]*logger-service\.js[^>]*></script>'
    header_pattern = r'<script[^>]*header-system\.js[^>]*></script>'
    
    logger_match = re.search(logger_pattern, content)
    header_match = re.search(header_pattern, content)
    
    if not logger_match or not header_match:
        print(f"  ⚠️  לא ניתן למצוא את התגים המלאים")
        return False
    
    logger_tag = logger_match.group(0)
    header_tag = header_match.group(0)
    
    # הסרת logger
    content_without_logger = content[:logger_match.start()] + content[logger_match.end():]
    
    # הוספת logger לפני header
    header_pos_new = content_without_logger.find(header_tag)
    if header_pos_new != -1:
        # מציאת המיקום לפני header (עם הערה אם יש)
        before_header = content_without_logger[:header_pos_new].rstrip()
        
        # הוספת logger לפני header
        new_content = before_header + "\n    " + logger_tag + "\n    " + content_without_logger[header_pos_new:]
        
        path.write_text(new_content, encoding='utf-8')
        print(f"  ✅ תוקן: logger-service הועבר לפני header-system")
        return True
    
    return False

def main():
    print("🔧 תיקון בעיות סדר טעינה\n")
    
    fixed = 0
    for page in PAGES:
        if fix_page(page):
            fixed += 1
    
    print(f"\n✅ הושלם: {fixed} עמודים תוקנו")

if __name__ == "__main__":
    main()

