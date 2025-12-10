#!/usr/bin/env python3
"""
Code Documentation Scanner for TikTrack
=========================================

This script scans all JavaScript files in trading-ui/scripts and checks:
1. Function Index presence
2. JSDoc coverage
3. Documentation completeness

Author: TikTrack Development Team
Version: 1.0.0
Created: 2025-01-27
"""

import os
import re
from pathlib import Path

class CodeDocumentationScanner:
    def __init__(self):
        self.scripts_dir = Path("trading-ui/scripts")
        self.results = {
            'total_files': 0,
            'with_function_index': 0,
            'without_function_index': 0,
            'with_jsdoc': 0,
            'without_jsdoc': 0,
            'files_missing_both': [],
            'files_missing_index': [],
            'files_missing_jsdoc': [],
            'detailed_report': []
        }

    def scan_file(self, file_path):
        """Scan a single JavaScript file for documentation"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            has_function_index = self.has_function_index(content)
            has_jsdoc = self.has_jsdoc(content)

            file_info = {
                'path': str(file_path),
                'filename': file_path.name,
                'has_function_index': has_function_index,
                'has_jsdoc': has_jsdoc,
                'line_count': len(content.split('\n')),
                'function_count': len(re.findall(r'\bfunction\s+\w+|^\s*\w+\s*\([^)]*\)\s*{', content, re.MULTILINE))
            }

            return file_info

        except Exception as e:
            print(f"Error scanning {file_path}: {e}")
            return None

    def has_function_index(self, content):
        """Check if file has Function Index"""
        patterns = [
            r'FUNCTION INDEX',
            r'Function Index',
            r'INDEX OF FUNCTIONS',
            r'Functions Index',
            r'===== FUNCTION INDEX ====='
        ]

        for pattern in patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        return False

    def has_jsdoc(self, content):
        """Check if file has JSDoc comments"""
        # Look for JSDoc patterns /** */
        jsdoc_pattern = r'/\*\*[\s\S]*?\*/'
        jsdoc_matches = re.findall(jsdoc_pattern, content)

        # Count meaningful JSDoc comments (more than just basic @param/@return)
        meaningful_jsdoc = 0
        for match in jsdoc_matches:
            if len(match.split('\n')) > 3 or '@param' in match or '@returns' in match or '@description' in match:
                meaningful_jsdoc += 1

        return meaningful_jsdoc > 0

    def scan_all_files(self):
        """Scan all JavaScript files in the scripts directory"""
        print("🔍 Scanning JavaScript files for documentation...")

        js_files = list(self.scripts_dir.rglob("*.js"))

        for file_path in js_files:
            # Skip certain directories
            if any(skip in str(file_path) for skip in ['node_modules', '.git', 'archive', 'backup']):
                continue

            file_info = self.scan_file(file_path)
            if file_info:
                self.results['total_files'] += 1
                self.results['detailed_report'].append(file_info)

                if file_info['has_function_index']:
                    self.results['with_function_index'] += 1
                else:
                    self.results['without_function_index'] += 1
                    self.results['files_missing_index'].append(file_info['path'])

                if file_info['has_jsdoc']:
                    self.results['with_jsdoc'] += 1
                else:
                    self.results['without_jsdoc'] += 1
                    self.results['files_missing_jsdoc'].append(file_info['path'])

                if not file_info['has_function_index'] and not file_info['has_jsdoc']:
                    self.results['files_missing_both'].append(file_info['path'])

                print(f"📄 {file_info['filename']}: Index={'✅' if file_info['has_function_index'] else '❌'} JSDoc={'✅' if file_info['has_jsdoc'] else '❌'}")

    def generate_report(self):
        """Generate comprehensive report"""
        print("\n" + "="*80)
        print("📊 CODE DOCUMENTATION SCAN REPORT")
        print("="*80)

        print(f"\n📈 SUMMARY:")
        print(f"Total JavaScript files: {self.results['total_files']}")
        print(f"Files with Function Index: {self.results['with_function_index']} ({self.results['with_function_index']/self.results['total_files']*100:.1f}%)")
        print(f"Files without Function Index: {self.results['without_function_index']} ({self.results['without_function_index']/self.results['total_files']*100:.1f}%)")
        print(f"Files with JSDoc: {self.results['with_jsdoc']} ({self.results['with_jsdoc']/self.results['total_files']*100:.1f}%)")
        print(f"Files without JSDoc: {self.results['without_jsdoc']} ({self.results['without_jsdoc']/self.results['total_files']*100:.1f}%)")
        print(f"Files missing both: {len(self.results['files_missing_both'])}")

        print(f"\n🔍 TOP 20 FILES MISSING FUNCTION INDEX:")
        for i, file in enumerate(self.results['files_missing_index'][:20], 1):
            print(f"{i:2d}. {file}")

        if len(self.results['files_missing_index']) > 20:
            print(f"... and {len(self.results['files_missing_index']) - 20} more files")

        print(f"\n📝 TOP 20 FILES MISSING JSDOC:")
        for i, file in enumerate(self.results['files_missing_jsdoc'][:20], 1):
            print(f"{i:2d}. {file}")

        if len(self.results['files_missing_jsdoc']) > 20:
            print(f"... and {len(self.results['files_missing_jsdoc']) - 20} more files")

        print(f"\n🚨 FILES MISSING BOTH DOCUMENTATION TYPES:")
        for i, file in enumerate(self.results['files_missing_both'][:10], 1):
            print(f"{i:2d}. {file}")

        return self.results

def main():
    scanner = CodeDocumentationScanner()
    scanner.scan_all_files()
    results = scanner.generate_report()

    # Save detailed report to JSON
    import json
    with open('reports/code_documentation_scan.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print("\n💾 Detailed report saved to: reports/code_documentation_scan.json")
    print("\n✅ Scan completed!")
    return results

if __name__ == "__main__":
    main()
