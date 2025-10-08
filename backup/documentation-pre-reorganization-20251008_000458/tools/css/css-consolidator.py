#!/usr/bin/env python3
"""
CSS Consolidator - איחוד קבצי CSS לפי האפיון המקורי
מאחד את כל הקבצים לקובץ unified.css אחד לפי ITCSS

Usage: python3 css-consolidator.py
"""

import os
import re
from pathlib import Path
from collections import OrderedDict

class CSSConsolidator:
    def __init__(self):
        self.styles_dir = Path('trading-ui/styles-new')
        self.output_file = self.styles_dir / 'unified-consolidated.css'
        
        # ITCSS layers order
        self.itcss_layers = [
            '01-settings',
            '02-tools', 
            '03-generic',
            '04-elements',
            '05-objects',
            '06-components',
            '07-pages',
            '08-themes',
            '09-utilities'
        ]
        
        # Files to exclude (duplicates)
        self.exclude_files = [
            'unified-menus-pushed.css',
            'unified-yesterday.css',
            'header-menu-clean.css'
        ]
        
        self.consolidated_css = OrderedDict()
        
    def find_css_files(self):
        """מצא את כל קבצי ה-CSS הרלוונטיים"""
        css_files = []
        
        # Find files in ITCSS structure
        for layer in self.itcss_layers:
            layer_dir = self.styles_dir / layer
            if layer_dir.exists():
                for css_file in layer_dir.glob('*.css'):
                    css_files.append(css_file)
        
        # Find main files
        main_files = [
            'unified.css',
            'main.css',
            'header-styles.css'
        ]
        
        for main_file in main_files:
            file_path = self.styles_dir / main_file
            if file_path.exists():
                css_files.append(file_path)
        
        # Filter out excluded files
        css_files = [f for f in css_files if f.name not in self.exclude_files]
        
        return css_files
    
    def extract_css_content(self, file_path):
        """חלץ תוכן CSS מקובץ"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove comments and empty lines
            content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
            content = re.sub(r'\n\s*\n', '\n', content)
            
            return content.strip()
        except Exception as e:
            print(f"❌ שגיאה בקריאת קובץ {file_path}: {e}")
            return ""
    
    def organize_by_itcss(self, css_files):
        """ארגן קבצים לפי ITCSS layers"""
        organized = OrderedDict()
        
        # Initialize layers
        for layer in self.itcss_layers:
            organized[layer] = []
        
        # Add main files
        organized['main'] = []
        
        # Organize files by layer
        for css_file in css_files:
            if css_file.name in ['unified.css', 'main.css']:
                organized['main'].append(css_file)
            elif css_file.name == 'header-styles.css':
                organized['06-components'].append(css_file)
            else:
                # Check if file is in ITCSS structure
                for layer in self.itcss_layers:
                    if layer in str(css_file):
                        organized[layer].append(css_file)
                        break
                else:
                    # Default to components if not found
                    organized['06-components'].append(css_file)
        
        return organized
    
    def consolidate_css(self):
        """אחד את כל קבצי ה-CSS"""
        print("🚀 מתחיל איחוד קבצי CSS...")
        
        # Find CSS files
        css_files = self.find_css_files()
        print(f"📁 נמצאו {len(css_files)} קבצי CSS")
        
        # Organize by ITCSS
        organized_files = self.organize_by_itcss(css_files)
        
        # Build consolidated CSS
        consolidated_content = []
        consolidated_content.append("/* TikTrack Unified CSS - Consolidated */")
        consolidated_content.append("/* Generated automatically from ITCSS structure */")
        consolidated_content.append("/* Date: " + str(Path().cwd()) + " */")
        consolidated_content.append("")
        
        # Add each layer
        for layer, files in organized_files.items():
            if not files:
                continue
                
            consolidated_content.append(f"/* ===== {layer.upper()} ===== */")
            consolidated_content.append("")
            
            for css_file in files:
                print(f"🔍 מעבד: {css_file}")
                
                content = self.extract_css_content(css_file)
                if content:
                    consolidated_content.append(f"/* From: {css_file.name} */")
                    consolidated_content.append(content)
                    consolidated_content.append("")
        
        # Write consolidated file
        with open(self.output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(consolidated_content))
        
        print(f"✅ קובץ מאוחד נשמר ב: {self.output_file}")
        
        # Calculate file size
        file_size = self.output_file.stat().st_size
        print(f"📊 גודל קובץ: {file_size / 1024:.1f} KB")
        
        return self.output_file
    
    def create_backup(self):
        """צור גיבוי של הקבצים הנוכחיים"""
        backup_dir = Path('css-backup')
        backup_dir.mkdir(exist_ok=True)
        
        print("💾 יוצר גיבוי...")
        
        # Backup current unified.css
        current_unified = self.styles_dir / 'unified.css'
        if current_unified.exists():
            backup_file = backup_dir / 'unified-backup.css'
            with open(current_unified, 'r', encoding='utf-8') as src:
                with open(backup_file, 'w', encoding='utf-8') as dst:
                    dst.write(src.read())
            print(f"✅ גיבוי נשמר ב: {backup_file}")
    
    def replace_unified_css(self):
        """החלף את unified.css בקובץ המאוחד"""
        if not self.output_file.exists():
            print("❌ קובץ מאוחד לא נמצא")
            return
        
        # Create backup
        self.create_backup()
        
        # Replace unified.css
        current_unified = self.styles_dir / 'unified.css'
        with open(self.output_file, 'r', encoding='utf-8') as src:
            with open(current_unified, 'w', encoding='utf-8') as dst:
                dst.write(src.read())
        
        print("✅ unified.css הוחלף בקובץ המאוחד")
    
    def remove_duplicate_files(self):
        """הסר קבצים כפולים"""
        files_to_remove = [
            'unified-menus-pushed.css',
            'unified-yesterday.css', 
            'header-menu-clean.css'
        ]
        
        print("🗑️ מסיר קבצים כפולים...")
        
        for file_name in files_to_remove:
            file_path = self.styles_dir / file_name
            if file_path.exists():
                # Move to backup instead of deleting
                backup_dir = Path('css-backup')
                backup_dir.mkdir(exist_ok=True)
                backup_file = backup_dir / file_name
                
                with open(file_path, 'r', encoding='utf-8') as src:
                    with open(backup_file, 'w', encoding='utf-8') as dst:
                        dst.write(src.read())
                
                file_path.unlink()
                print(f"✅ {file_name} הועבר לגיבוי")
    
    def run(self):
        """הרץ את תהליך האיחוד"""
        print("🎯 מתחיל תהליך איחוד CSS לפי האפיון המקורי...")
        
        # Step 1: Consolidate CSS
        consolidated_file = self.consolidate_css()
        
        # Step 2: Replace unified.css
        self.replace_unified_css()
        
        # Step 3: Remove duplicate files
        self.remove_duplicate_files()
        
        print("🎉 תהליך האיחוד הושלם בהצלחה!")
        print("📋 סיכום:")
        print("  - כל הסגנונות אוחדו לקובץ unified.css אחד")
        print("  - קבצים כפולים הועברו לגיבוי")
        print("  - המערכת עכשיו עובדת לפי האפיון המקורי")

if __name__ == "__main__":
    consolidator = CSSConsolidator()
    consolidator.run()
