#!/usr/bin/env python3
"""
Function Index Completeness Verifier
=====================================

This script verifies that Function Index entries in files are complete
and include all actual functions present in the code.

Author: TikTrack Development Team
Version: 1.0.0
Created: 2025-01-27
"""

import os
import re
from pathlib import Path
import json

class FunctionIndexCompletenessVerifier:
    def __init__(self):
        self.scripts_dir = Path("trading-ui/scripts")
        self.results = {
            'total_files_with_index': 0,
            'complete_indexes': 0,
            'incomplete_indexes': 0,
            'missing_functions': {},
            'over_documented_functions': {},
            'detailed_report': []
        }

    def extract_all_functions(self, content):
        """Extract all functions from JavaScript content"""
        functions = set()

        # Pattern 1: Traditional function declarations: function name(...) {
        func_pattern = r'^\s*(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*{'
        matches = re.findall(func_pattern, content, re.MULTILINE)
        for match in matches:
            functions.add(match)

        # Pattern 2: Arrow functions assigned to variables: const/let/var name = (...) => {
        arrow_pattern = r'^\s*(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*)?=>\s*{'
        matches = re.findall(arrow_pattern, content, re.MULTILINE)
        for match in matches:
            functions.add(match)

        # Pattern 3: Class methods: methodName(...) {
        lines = content.split('\n')
        in_class = False
        class_name = None
        brace_count = 0

        for i, line in enumerate(lines):
            # Track brace count to handle nested structures
            brace_count += line.count('{') - line.count('}')

            # Detect class start
            class_match = re.match(r'^\s*class\s+(\w+)', line)
            if class_match and brace_count >= 0:
                in_class = True
                class_name = class_match.group(1)
                continue

            # Detect class end
            if in_class and brace_count <= 1 and re.match(r'^\s*}\s*$', line.strip()):
                in_class = False
                class_name = None
                continue

            # Extract methods within class
            if in_class and class_name:
                method_match = re.match(r'^\s*(\w+)\s*\(([^)]*)\)\s*{', line)
                if method_match:
                    method_name = method_match.group(1)
                    if method_name not in ['constructor', 'if', 'for', 'while', 'catch', 'try']:
                        functions.add(f"{class_name}.{method_name}")

        # Pattern 4: Object methods: obj.method = function
        obj_method_pattern = r'(\w+)\.(\w+)\s*=\s*(?:function|(?:\([^)]*\)\s*=>))\s*{'
        matches = re.findall(obj_method_pattern, content)
        for obj_name, method_name in matches:
            functions.add(f"{obj_name}.{method_name}")

        # Pattern 5: Functions assigned to window/global
        window_assign_pattern = r'window\.(\w+)\s*=\s*(?:function|(?:\([^)]*\)\s*=>))\s*{'
        matches = re.findall(window_assign_pattern, content)
        for match in matches:
            functions.add(match)

        return functions

    def extract_indexed_functions(self, content):
        """Extract functions listed in Function Index"""
        indexed_functions = set()

        # Find Function Index section
        index_pattern = r'===== FUNCTION INDEX =====(.*?)(?=\*/|\n\s*\n\s*(?:\*/|class|\(function|function|\{|$))'
        index_match = re.search(index_pattern, content, re.DOTALL | re.IGNORECASE)

        if index_match:
            index_content = index_match.group(1)

            # Extract function names from index lines: - functionName() - description
            func_lines = re.findall(r'-\s*([^()]+)\(\s*[^)]*\)\s*-', index_content)
            for func in func_lines:
                # Clean up the function name
                clean_func = func.strip()
                # Remove class prefix if present for comparison
                if '.' in clean_func:
                    clean_func = clean_func.split('.')[-1]
                indexed_functions.add(clean_func)

        return indexed_functions

    def verify_file_completeness(self, file_path):
        """Verify if Function Index is complete for a file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            # Check if file has Function Index
            if 'FUNCTION INDEX' not in content:
                return None

            # Extract all functions in the file
            all_functions = self.extract_all_functions(content)

            # Extract functions listed in index
            indexed_functions = self.extract_indexed_functions(content)

            # Compare
            missing_in_index = all_functions - indexed_functions
            extra_in_index = indexed_functions - all_functions

            is_complete = len(missing_in_index) == 0 and len(extra_in_index) == 0

            result = {
                'file': str(file_path),
                'filename': file_path.name,
                'total_functions': len(all_functions),
                'indexed_functions': len(indexed_functions),
                'is_complete': is_complete,
                'missing_in_index': list(missing_in_index),
                'extra_in_index': list(extra_in_index)
            }

            return result

        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            return None

    def scan_all_files(self):
        """Scan all files with Function Index"""
        print("🔍 Verifying Function Index completeness...")

        js_files = list(self.scripts_dir.rglob("*.js"))

        for file_path in js_files:
            # Skip certain directories
            if any(skip in str(file_path) for skip in ['node_modules', '.git', 'archive', 'backup']):
                continue

            result = self.verify_file_completeness(file_path)
            if result:
                self.results['total_files_with_index'] += 1
                self.results['detailed_report'].append(result)

                if result['is_complete']:
                    self.results['complete_indexes'] += 1
                else:
                    self.results['incomplete_indexes'] += 1
                    if result['missing_in_index']:
                        self.results['missing_functions'][result['filename']] = result['missing_in_index']
                    if result['extra_in_index']:
                        self.results['over_documented_functions'][result['filename']] = result['extra_in_index']

                status = "✅" if result['is_complete'] else "❌"
                print(f"{status} {result['filename']}: {result['indexed_functions']}/{result['total_functions']} functions documented")

    def generate_report(self):
        """Generate comprehensive report"""
        print("\n" + "="*80)
        print("📊 FUNCTION INDEX COMPLETENESS REPORT")
        print("="*80)

        total = self.results['total_files_with_index']
        complete = self.results['complete_indexes']
        incomplete = self.results['incomplete_indexes']

        print(f"\n📈 SUMMARY:")
        print(f"Files with Function Index: {total}")
        print(f"Complete indexes: {complete} ({complete/total*100:.1f}%)" if total > 0 else "Complete indexes: 0")
        print(f"Incomplete indexes: {incomplete} ({incomplete/total*100:.1f}%)" if total > 0 else "Incomplete indexes: 0")

        print(f"\n🔍 TOP INCOMPLETE INDEXES:")
        sorted_incomplete = sorted(
            [r for r in self.results['detailed_report'] if not r['is_complete']],
            key=lambda x: len(x['missing_in_index']),
            reverse=True
        )

        for i, result in enumerate(sorted_incomplete[:10], 1):
            missing_count = len(result['missing_in_index'])
            total_funcs = result['total_functions']
            indexed_funcs = result['indexed_functions']
            print(f"{i:2d}. {result['filename']}: {indexed_funcs}/{total_funcs} documented ({missing_count} missing)")

        print(f"\n⚠️  FILES WITH MISSING FUNCTIONS:")
        for filename, missing in list(self.results['missing_functions'].items())[:5]:
            print(f"   {filename}: {len(missing)} missing - {missing[:3]}{'...' if len(missing) > 3 else ''}")

        return self.results

def main():
    verifier = FunctionIndexCompletenessVerifier()
    verifier.scan_all_files()
    results = verifier.generate_report()

    # Save detailed report
    with open('reports/function_index_completeness.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print("\n💾 Detailed report saved to: reports/function_index_completeness.json")
    print("\n✅ Verification completed!")
    return results

if __name__ == "__main__":
    main()
