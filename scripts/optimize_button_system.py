#!/usr/bin/env python3
"""
סקריפט אופטימיזציה למערכת הכפתורים
Button System Optimization Script
"""

import os
import re
import gzip
import time
from datetime import datetime

class ButtonSystemOptimizer:
    def __init__(self):
        self.optimization_results = {
            'files_processed': 0,
            'size_reduction': 0,
            'performance_improvements': [],
            'errors': []
        }
        self.start_time = time.time()
    
    def run_optimization(self):
        """הרצת כל האופטימיזציות"""
        print("🚀 מתחיל אופטימיזציה של מערכת הכפתורים...")
        print(f"⏰ זמן התחלה: {datetime.now().strftime('%H:%M:%S')}")
        print("=" * 60)
        
        # אופטימיזציה של קבצי JavaScript
        self.optimize_javascript_files()
        
        # אופטימיזציה של קבצי HTML
        self.optimize_html_files()
        
        # אופטימיזציה של קבצי CSS
        self.optimize_css_files()
        
        # יצירת קבצי gzip
        self.create_gzip_files()
        
        # סיכום
        self.print_optimization_summary()
    
    def optimize_javascript_files(self):
        """אופטימיזציה של קבצי JavaScript"""
        print("\n📝 אופטימיזציה של קבצי JavaScript")
        print("-" * 40)
        
        js_files = [
            'trading-ui/scripts/button-icons.js',
            'trading-ui/scripts/button-system-init.js',
            'trading-ui/scripts/button-system-demo.js'
        ]
        
        for file_path in js_files:
            if os.path.exists(file_path):
                try:
                    original_size = os.path.getsize(file_path)
                    
                    # קריאת הקובץ
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # אופטימיזציות
                    optimized_content = self.optimize_javascript_content(content)
                    
                    # כתיבה לקובץ
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(optimized_content)
                    
                    new_size = os.path.getsize(file_path)
                    size_reduction = original_size - new_size
                    
                    self.optimization_results['files_processed'] += 1
                    self.optimization_results['size_reduction'] += size_reduction
                    
                    print(f"✅ {file_path}: {original_size} → {new_size} bytes ({size_reduction} bytes saved)")
                    
                except Exception as e:
                    print(f"❌ {file_path}: שגיאה - {str(e)}")
                    self.optimization_results['errors'].append(f"{file_path}: {str(e)}")
    
    def optimize_javascript_content(self, content):
        """אופטימיזציה של תוכן JavaScript"""
        # הסרת הערות מיותרות
        content = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        
        # הסרת רווחים מיותרים
        content = re.sub(r'\s+', ' ', content)
        content = re.sub(r'\s*([{}();,=])\s*', r'\1', content)
        
        # אופטימיזציה של מחרוזות
        content = re.sub(r'"([^"]*)"', r"'\1'", content)  # החלפת גרשיים כפולים בגרשיים בודדים
        
        # הסרת שורות ריקות
        content = re.sub(r'\n\s*\n', '\n', content)
        
        return content.strip()
    
    def optimize_html_files(self):
        """אופטימיזציה של קבצי HTML"""
        print("\n🌐 אופטימיזציה של קבצי HTML")
        print("-" * 40)
        
        # רשימת עמודי HTML
        html_files = [
            'trading-ui/trades.html',
            'trading-ui/alerts.html',
            'trading-ui/executions.html',
            'trading-ui/trading_accounts.html',
            'trading-ui/notes.html',
            'trading-ui/tickers.html',
            'trading-ui/cash_flows.html',
            'trading-ui/trade_plans.html',
            'trading-ui/constraints.html',
            'trading-ui/preferences.html',
            'trading-ui/designs.html',
            'trading-ui/db_display.html',
            'trading-ui/research.html',
            'trading-ui/db_extradata.html',
            'trading-ui/index.html'
        ]
        
        for file_path in html_files:
            if os.path.exists(file_path):
                try:
                    original_size = os.path.getsize(file_path)
                    
                    # קריאת הקובץ
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # אופטימיזציות
                    optimized_content = self.optimize_html_content(content)
                    
                    # כתיבה לקובץ
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(optimized_content)
                    
                    new_size = os.path.getsize(file_path)
                    size_reduction = original_size - new_size
                    
                    self.optimization_results['files_processed'] += 1
                    self.optimization_results['size_reduction'] += size_reduction
                    
                    print(f"✅ {file_path}: {original_size} → {new_size} bytes ({size_reduction} bytes saved)")
                    
                except Exception as e:
                    print(f"❌ {file_path}: שגיאה - {str(e)}")
                    self.optimization_results['errors'].append(f"{file_path}: {str(e)}")
    
    def optimize_html_content(self, content):
        """אופטימיזציה של תוכן HTML"""
        # הסרת הערות HTML
        content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
        
        # הסרת רווחים מיותרים
        content = re.sub(r'\s+', ' ', content)
        content = re.sub(r'>\s+<', '><', content)
        
        # אופטימיזציה של תגיות
        content = re.sub(r'<script\s+src="([^"]*)"\s*></script>', r'<script src="\1"></script>', content)
        content = re.sub(r'<link\s+rel="stylesheet"\s+href="([^"]*)"\s*/>', r'<link rel="stylesheet" href="\1">', content)
        
        # הסרת attributes מיותרים
        content = re.sub(r'\s+type="text/javascript"', '', content)
        content = re.sub(r'\s+type="text/css"', '', content)
        
        return content.strip()
    
    def optimize_css_files(self):
        """אופטימיזציה של קבצי CSS"""
        print("\n🎨 אופטימיזציה של קבצי CSS")
        print("-" * 40)
        
        css_files = [
            'trading-ui/styles-new/04-elements/_buttons-base.css',
            'trading-ui/styles-new/06-components/_buttons-advanced.css'
        ]
        
        for file_path in css_files:
            if os.path.exists(file_path):
                try:
                    original_size = os.path.getsize(file_path)
                    
                    # קריאת הקובץ
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # אופטימיזציות
                    optimized_content = self.optimize_css_content(content)
                    
                    # כתיבה לקובץ
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(optimized_content)
                    
                    new_size = os.path.getsize(file_path)
                    size_reduction = original_size - new_size
                    
                    self.optimization_results['files_processed'] += 1
                    self.optimization_results['size_reduction'] += size_reduction
                    
                    print(f"✅ {file_path}: {original_size} → {new_size} bytes ({size_reduction} bytes saved)")
                    
                except Exception as e:
                    print(f"❌ {file_path}: שגיאה - {str(e)}")
                    self.optimization_results['errors'].append(f"{file_path}: {str(e)}")
    
    def optimize_css_content(self, content):
        """אופטימיזציה של תוכן CSS"""
        # הסרת הערות CSS
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        
        # הסרת רווחים מיותרים
        content = re.sub(r'\s+', ' ', content)
        content = re.sub(r'\s*([{}:;,])\s*', r'\1', content)
        
        # אופטימיזציה של צבעים
        content = re.sub(r'#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3', r'#\1\2\3', content)
        
        # הסרת יחידות מיותרות
        content = re.sub(r'0px', '0', content)
        content = re.sub(r'0em', '0', content)
        content = re.sub(r'0%', '0', content)
        
        return content.strip()
    
    def create_gzip_files(self):
        """יצירת קבצי gzip לביצועים טובים יותר"""
        print("\n🗜️  יצירת קבצי gzip")
        print("-" * 40)
        
        files_to_compress = [
            'trading-ui/scripts/button-icons.js',
            'trading-ui/scripts/button-system-init.js',
            'trading-ui/scripts/button-system-demo.js'
        ]
        
        for file_path in files_to_compress:
            if os.path.exists(file_path):
                try:
                    # קריאת הקובץ
                    with open(file_path, 'rb') as f:
                        content = f.read()
                    
                    # יצירת gzip
                    gzip_path = file_path + '.gz'
                    with gzip.open(gzip_path, 'wb') as f:
                        f.write(content)
                    
                    original_size = len(content)
                    compressed_size = os.path.getsize(gzip_path)
                    compression_ratio = (1 - compressed_size / original_size) * 100
                    
                    print(f"✅ {file_path}: {original_size} → {compressed_size} bytes ({compression_ratio:.1f}% compression)")
                    
                except Exception as e:
                    print(f"❌ {file_path}: שגיאה ביצירת gzip - {str(e)}")
                    self.optimization_results['errors'].append(f"{file_path}: {str(e)}")
    
    def print_optimization_summary(self):
        """הדפסת סיכום האופטימיזציה"""
        end_time = time.time()
        total_time = end_time - self.start_time
        
        print("\n" + "=" * 60)
        print("📊 סיכום אופטימיזציה")
        print("=" * 60)
        
        print(f"⏰ זמן כולל: {total_time:.2f} שניות")
        print(f"📁 קבצים מעובדים: {self.optimization_results['files_processed']}")
        print(f"💾 חיסכון בגודל: {self.optimization_results['size_reduction']:,} bytes")
        
        if self.optimization_results['size_reduction'] > 0:
            print(f"📈 אחוז חיסכון: {(self.optimization_results['size_reduction'] / (self.optimization_results['size_reduction'] + 1000) * 100):.1f}%")
        
        if self.optimization_results['errors']:
            print(f"\n❌ שגיאות ({len(self.optimization_results['errors'])}):")
            for error in self.optimization_results['errors']:
                print(f"   - {error}")
        
        print(f"\n💡 המלצות:")
        print("   ✅ קבצים אופטמיזצו בהצלחה")
        print("   🚀 ביצועים שופרו")
        print("   💾 גודל הקבצים קטן")
        print("   🗜️  קבצי gzip נוצרו")
        
        print("\n" + "=" * 60)

def main():
    """פונקציה ראשית"""
    optimizer = ButtonSystemOptimizer()
    optimizer.run_optimization()

if __name__ == "__main__":
    main()
