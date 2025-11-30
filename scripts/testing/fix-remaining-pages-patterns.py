#!/usr/bin/env python3
"""
תיקון דפוסים בעמודים טכניים ומשניים שנותרו
Fix Patterns in Remaining Technical and Secondary Pages
"""

import os
import re
from pathlib import Path

PAGES_DIR = Path("trading-ui")
STYLES_DIR = Path("trading-ui/styles-new/07-pages")

# דפוסים שצריך לתקן
FIXES = {
    'tradingview-widgets-showcase.html': {
        'scripts': ['error-handlers.js', 'logger-service.js', 'unified-cache-manager.js'],
        'console': True,
        'style_tag': True
    },
    'init-system-management.html': {
        'bootstrap_css': True,
        'style_tag': True
    },
    'designs.html': {
        'inline_styles': True,
        'style_tag': True,
        'load_order': True
    },
    'db_display.html': {
        'load_order': True
    },
    'db_extradata.html': {
        'load_order': True
    }
}

def main():
    print("🔧 תיקון דפוסים בעמודים טכניים ומשניים...\n")
    print("⚠️  זה דורש תיקון ידני מדויק - ביצוע ידני נדרש")

if __name__ == "__main__":
    main()

