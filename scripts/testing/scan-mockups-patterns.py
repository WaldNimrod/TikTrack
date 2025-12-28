#!/usr/bin/env python3
"""
סריקת דפוסים חוזרים בעמודי מוקאפ
Pattern Detection Script for Mockup Pages
"""

import os
import re
from pathlib import Path
from collections import defaultdict

# עמודי מוקאפ
MOCKUP_PAGES = [
    "portfolio_state_page.html",
    "trade_history_page.html",
    "price_history_page.html",
    "comparative_analysis_page.html",
    "trading_journal_page.html",
    "strategy_analysis_page.html",
    "economic_calendar_page.html",
    "history_widget.html",
    "emotional_tracking_widget.html",
    "date_comparison_modal.html",
    "tradingview_test_page.html"
]

MOCKUPS_DIR = Path("trading-ui/mockups/daily-snapshots")

def check_patterns():
    """סריקת דפוסים חוזרים"""
    patterns = {
        "missing_icon_system": [],
        "missing_bootstrap_css": [],
        "inline_styles": [],
        "missing_logger": [],
        "missing_unified_cache": [],
        "style_tags": []
    }
    
    for page_name in MOCKUP_PAGES:
        page_path = MOCKUPS_DIR / page_name
        if not page_path.exists():
            print(f"⚠️ Page not found: {page_name}")
            continue
            
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # בדיקת IconSystem scripts
        has_icon_mappings = 'icon-mappings.js' in content
        has_icon_system = 'icon-system.js' in content
        has_icon_helper = 'icon-replacement-helper.js' in content
        
        if not (has_icon_mappings and has_icon_system and has_icon_helper):
            patterns["missing_icon_system"].append({
                "page": page_name,
                "icon_mappings": has_icon_mappings,
                "icon_system": has_icon_system,
                "icon_helper": has_icon_helper
            })
        
        # בדיקת Bootstrap CSS
        has_bootstrap_css = re.search(r'bootstrap.*\.min\.css.*rel=["\']stylesheet["\']', content, re.IGNORECASE)
        if not has_bootstrap_css:
            patterns["missing_bootstrap_css"].append(page_name)
        
        # בדיקת inline styles (hardcoded)
        inline_styles = re.findall(r'<[^>]+style=["\'][^"\']+["\'][^>]*>', content)
        # רק inline styles שאינם דינמיים (לא כולל style="" ריק או style="display: none")
        hardcoded_styles = [s for s in inline_styles if 'style=""' not in s and not re.search(r'style=["\']display:\s*none["\']', s)]
        if hardcoded_styles:
            patterns["inline_styles"].append({
                "page": page_name,
                "count": len(hardcoded_styles),
                "examples": hardcoded_styles[:3]  # רק 3 דוגמאות
            })
        
        # בדיקת Logger Service
        has_logger = 'logger-service.js' in content
        if not has_logger:
            patterns["missing_logger"].append(page_name)
        
        # בדיקת Unified Cache Manager
        has_cache = 'unified-cache-manager.js' in content
        if not has_cache:
            patterns["missing_unified_cache"].append(page_name)
        
        # בדיקת <style> tags
        style_tags = re.findall(r'<style[^>]*>.*?</style>', content, re.DOTALL | re.IGNORECASE)
        if style_tags:
            patterns["style_tags"].append({
                "page": page_name,
                "count": len(style_tags)
            })
    
    return patterns

def generate_report(patterns):
    """יצירת דוח"""
    report = []
    report.append("# דוח דפוסים חוזרים - עמודי מוקאפ\n")
    report.append("**תאריך:** " + str(Path(__file__).stat().st_mtime) + "\n\n")
    
    # Bootstrap CSS
    if patterns["missing_bootstrap_css"]:
        report.append(f"## ❌ Bootstrap CSS חסר ({len(patterns['missing_bootstrap_css'])} עמודים)\n")
        for page in patterns["missing_bootstrap_css"]:
            report.append(f"- {page}\n")
        report.append("\n")
    else:
        report.append("## ✅ Bootstrap CSS - כולם תקינים\n\n")
    
    # IconSystem
    if patterns["missing_icon_system"]:
        report.append(f"## ❌ IconSystem חסר/לא מלא ({len(patterns['missing_icon_system'])} עמודים)\n")
        for item in patterns["missing_icon_system"]:
            missing = []
            if not item["icon_mappings"]:
                missing.append("icon-mappings.js")
            if not item["icon_system"]:
                missing.append("icon-system.js")
            if not item["icon_helper"]:
                missing.append("icon-replacement-helper.js")
            report.append(f"- **{item['page']}** - חסר: {', '.join(missing)}\n")
        report.append("\n")
    else:
        report.append("## ✅ IconSystem - כולם תקינים\n\n")
    
    # Inline Styles
    if patterns["inline_styles"]:
        report.append(f"## ⚠️ Inline Styles ({len(patterns['inline_styles'])} עמודים)\n")
        for item in patterns["inline_styles"]:
            report.append(f"- **{item['page']}** - {item['count']} inline styles\n")
        report.append("\n")
    else:
        report.append("## ✅ Inline Styles - כולם תקינים\n\n")
    
    # Logger Service
    if patterns["missing_logger"]:
        report.append(f"## ❌ Logger Service חסר ({len(patterns['missing_logger'])} עמודים)\n")
        for page in patterns["missing_logger"]:
            report.append(f"- {page}\n")
        report.append("\n")
    else:
        report.append("## ✅ Logger Service - כולם תקינים\n\n")
    
    # Unified Cache Manager
    if patterns["missing_unified_cache"]:
        report.append(f"## ⚠️ Unified Cache Manager חסר ({len(patterns['missing_unified_cache'])} עמודים)\n")
        for page in patterns["missing_unified_cache"]:
            report.append(f"- {page}\n")
        report.append("\n")
    else:
        report.append("## ✅ Unified Cache Manager - כולם תקינים\n\n")
    
    # Style Tags
    if patterns["style_tags"]:
        report.append(f"## ❌ <style> Tags ({len(patterns['style_tags'])} עמודים)\n")
        for item in patterns["style_tags"]:
            report.append(f"- **{item['page']}** - {item['count']} style tags\n")
        report.append("\n")
    else:
        report.append("## ✅ <style> Tags - כולם תקינים\n\n")
    
    return "".join(report)

if __name__ == "__main__":
    print("🔍 סריקת דפוסים חוזרים בעמודי מוקאפ...")
    patterns = check_patterns()
    report = generate_report(patterns)
    
    # שמירת דוח
    report_path = Path("documentation/05-REPORTS/MOCKUPS_PATTERNS_SCAN.md")
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(report, encoding='utf-8')
    
    print(f"✅ דוח נוצר: {report_path}")
    print("\n" + report)

