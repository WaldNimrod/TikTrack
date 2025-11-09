#!/usr/bin/env node
/**
 * Check Hardcoded URLs Script - TikTrack
 * =======================================
 * 
 * סקריפט לבדיקת hardcoded URLs בקוד
 * Script to check for hardcoded URLs in code
 * 
 * @version 1.0.0
 * @created 2025-11-09
 * @author TikTrack Development Team
 * 
 * שימוש:
 *   node scripts/check-hardcoded-urls.js
 *   python3 scripts/check-hardcoded-urls.js
 */

import os
import re
from pathlib import Path

def find_hardcoded_urls(directory):
    """Find all hardcoded URLs in JavaScript files"""
    patterns = [
        r"['\"]http://127\.0\.0\.1:8080",
        r"['\"]http://localhost:8080",
        r":8080['\"]",
        r"location\.protocol\s*===\s*['\"]file:",
    ]
    
    results = []
    js_files = list(Path(directory).rglob("*.js"))
    
    # Exclude backup files
    js_files = [f for f in js_files if 'backup' not in str(f).lower() and 'archive' not in str(f).lower()]
    
    for js_file in js_files:
        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
            for line_num, line in enumerate(lines, 1):
                for pattern in patterns:
                    if re.search(pattern, line):
                        results.append({
                            'file': str(js_file.relative_to(directory)),
                            'line': line_num,
                            'content': line.strip(),
                            'pattern': pattern
                        })
                        break
        except Exception as e:
            print(f"Error reading {js_file}: {e}")
    
    return results

def main():
    """Main function"""
    print("=" * 80)
    print("TikTrack - Hardcoded URLs Checker")
    print("=" * 80)
    print()
    
    # Scan trading-ui/scripts directory
    scripts_dir = Path('trading-ui/scripts')
    if not scripts_dir.exists():
        print(f"❌ Directory not found: {scripts_dir}")
        return 1
    
    results = find_hardcoded_urls(scripts_dir)
    
    # Group by file
    files_dict = {}
    for result in results:
        file = result['file']
        if file not in files_dict:
            files_dict[file] = []
        files_dict[file].append(result)
    
    # Print summary
    if len(results) > 0:
        print(f"⚠️  Found {len(results)} hardcoded URLs in {len(files_dict)} files\n")
        print("Files with hardcoded URLs:")
        print("=" * 80)
        for file, occurrences in sorted(files_dict.items()):
            print(f"\n{file}: {len(occurrences)} occurrence(s)")
            for occ in occurrences[:3]:  # Show first 3
                print(f"  Line {occ['line']}: {occ['content'][:70]}...")
            if len(occurrences) > 3:
                print(f"  ... and {len(occurrences) - 3} more")
        print("\n" + "=" * 80)
        print("❌ FAILED: Hardcoded URLs found!")
        return 1
    else:
        print("✅ SUCCESS: No hardcoded URLs found!")
        print("All URLs use relative paths or window.API_BASE_URL")
        return 0

if __name__ == '__main__':
    exit(main())

